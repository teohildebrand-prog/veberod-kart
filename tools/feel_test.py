#!/usr/bin/env python3
"""Headless test: game feel, the camera shake, the turbo's view kick and the body's knocks.

    pip install playwright && python3 tools/feel_test.py

Starts a race, parks the other karts and, from a standstill on the road, checks:
- shake: trauma squared, so a bump (0.2) moves the camera far less than a big hit (1.0);
  it decays to nothing within a second; the motion is smooth, not a fresh jump each frame
- a drift released at the amber stage kicks the view wider, the kick dies in about 0.2 s,
  and the kart's nose pitches up then settles
- a hard landing squashes the body and it springs back
- a wall hit rolls the body and it rights itself
Fails (exit 1) on any JS error or a check that does not hold. Set CHROMIUM to use an
existing Chromium binary instead of Playwright's own download.
"""
import functools
import http.server
import os
import sys
import threading
from pathlib import Path

from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parent.parent

# sample for a while on animation frames: the largest value of each probe, and the last one
SAMPLE = """([ms, probes]) => new Promise(done => {
  const fns = probes.map(p => new Function('return (' + p + ')'));
  const peak = fns.map(() => 0), last = fns.map(() => 0), t0 = performance.now();
  (function tick() {
    fns.forEach((f, i) => { const v = f(); last[i] = v; if (Math.abs(v) > Math.abs(peak[i])) peak[i] = v; });
    if (performance.now() - t0 < ms) requestAnimationFrame(tick); else done({peak, last});
  })();
})"""


class QuietHandler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *args):
        pass


def serve():
    handler = functools.partial(QuietHandler, directory=str(ROOT))
    httpd = http.server.ThreadingHTTPServer(('127.0.0.1', 0), handler)
    threading.Thread(target=httpd.serve_forever, daemon=True).start()
    return httpd


def main():
    httpd = serve()
    url = f'http://127.0.0.1:{httpd.server_port}/index.html'
    errors, fails = [], []

    def check(ok, what):
        print(('ok   ' if ok else 'FAIL ') + what)
        if not ok:
            fails.append(what)

    with sync_playwright() as p:
        browser = p.chromium.launch(executable_path=os.environ.get('CHROMIUM') or None,
                                    args=['--use-gl=angle', '--use-angle=swiftshader',
                                          '--enable-unsafe-swiftshader'])
        page = browser.new_page(viewport={'width': 960, 'height': 600})
        page.on('pageerror', lambda e: errors.append(str(e)))
        page.on('console', lambda m: m.type == 'error' and errors.append(m.text))
        page.route('**/*', lambda r: r.continue_() if r.request.url.startswith(url.rsplit('/', 1)[0])
                   else r.abort())
        page.goto(url)
        try:
            page.fill('#nameBox', 'teo', timeout=10000)
            page.keyboard.press('Enter')
            for button in ('#btnStart', '#btnStageGo', '#btnGo'):
                page.click(button, timeout=10000)
        except Exception as e:
            browser.close()
            sys.exit(f'could not start a race ({e.__class__.__name__}); JS errors: {errors}')
        page.wait_for_function("state==='race'", timeout=15000)
        # stand still on the road, away from the field, so nothing else adds shake or knocks the body
        page.evaluate("""() => { const T=MAIN,i=(player.si+40)%N; player.x=T.X[i];player.z=T.Z[i];player.si=i;
          player.vx=player.vz=0;player.yaw=Math.atan2(T.FX[i],T.FZ[i]);
          for(const k of karts)if(k!==player)k.parked=true; }""")
        page.wait_for_timeout(500)

        def sample(ms, *probes):
            return page.evaluate(SAMPLE, [ms, list(probes)])

        # the shake: how far the camera sits from where the follow rig put it (camPos)
        off = 'camera.position.distanceTo(camPos)'
        base = sample(600, off)['peak'][0]
        page.evaluate('shake=0.2')
        small = sample(600, off)['peak'][0]
        page.evaluate('shake=1')
        big = sample(1200, off, 'shake')
        print(f'  camera offset: steady {base:.3f}, bump {small:.3f}, big hit {big["peak"][0]:.3f}')
        check(big['peak'][0] - base > 5 * max(small - base, 0.01), 'a big hit shakes far more than a bump')
        check(big['peak'][0] < 1.1, 'a big hit stays within the shake budget')
        check(big['last'][1] == 0, 'shake decays to nothing within a second')

        page.evaluate("player.drift=1;player.charge=1.6;player.clean=false")   # amber, then let go
        r = sample(900, 'fovKick', 'player.body?player.body.p:0')
        print(f'  turbo: view kick peak {r["peak"][0]:.2f} deg, nose pitch peak {r["peak"][1]:.3f} rad')
        check(r['peak'][0] >= 3, 'a turbo kicks the view wider')   # +5, a frame of decay before the first sample
        check(r['last'][0] < 0.1, 'the view kick dies away')
        check(r['peak'][1] < -0.06, 'the nose pitches up on a turbo')
        check(abs(r['last'][1]) < 0.02, 'the nose settles again')

        # a long fall, standing still mid-road
        page.evaluate("""() => { const T=MAIN,i=player.si; player.x=T.X[i];player.z=T.Z[i];
          player.vx=player.vz=0;player.y=groundK(player,player.x,player.z)+7;player.vy=4; }""")
        r = sample(2000, 'player.body.s', '1-player.v.lean.scale.y')
        print(f'  landing: squash peak {r["peak"][0]:.3f}, body height drop {r["peak"][1]:.3f}')
        check(r['peak'][0] > 0.05 and r['peak'][1] > 0.05, 'a hard landing squashes the body')
        check(abs(r['last'][0]) < 0.02 and abs(r['last'][1]) < 0.02, 'the body springs back')

        # put the kart against the fence, sliding into it
        page.evaluate("""() => { const T=MAIN,i=player.si,lim=HW+3.6;
          player.x=T.X[i]+T.RX[i]*lim;player.z=T.Z[i]+T.RZ[i]*lim;player.y=groundK(player,player.x,player.z);
          player.vx=T.RX[i]*16+T.FX[i]*10;player.vz=T.RZ[i]*16+T.FZ[i]*10;
          player.yaw=Math.atan2(T.FX[i],T.FZ[i]); }""")
        r = sample(1200, 'player.body.r')
        print(f'  wall hit: roll peak {r["peak"][0]:.3f} rad')
        check(abs(r['peak'][0]) > 0.05, 'a wall hit rolls the body')
        check(abs(r['last'][0]) < 0.02, 'the body rights itself')

        browser.close()
    httpd.shutdown()

    errors = [e for e in errors if 'net::ERR_FAILED' not in e]
    for e in errors:
        print('JS error:', e)
    if errors or fails:
        sys.exit('feel test FAILED')
    print('feel test passed')


if __name__ == '__main__':
    main()
