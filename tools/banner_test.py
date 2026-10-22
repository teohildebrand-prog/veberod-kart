#!/usr/bin/env python3
"""Headless test: the home crowd's banners (HEJA <driver>!).

    pip install playwright && python3 tools/banner_test.py

For every driver with a home stage: starts a race there with that driver and checks
two banners stand beside the road, off the track and clear of the shortcut lanes and
forecourts, carrying the driver's name; on another stage there are none. Mirrored
races keep the text readable. Saves banner-*.png from the grid of three home stages.
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

START = """([ci, sid, mirror]) => { CUP=null;TT=false;FREE=false;charSel=ci;mirrorSel=mirror;
  if(mirror)SAVE.unlock['mirror_'+sid]=true;
  buildWorld(STAGES.find(s=>s.id===sid));startRace(); }"""

CHECK = """() => homeBanners.map(g => {
  let best=1e9,q=0;for(let i=0;i<N;i++){const d=Math.hypot(sx[i]-g.position.x,sz[i]-g.position.z);if(d<best){best=d;q=i;}}
  const lane=Math.min(1e9,...ALTS.map(R=>{let m=1e9;for(let j=0;j<R.n;j++)m=Math.min(m,Math.hypot(R.X[j]-g.position.x,R.Z[j]-g.position.z)-R.hw);return m;}));
  const st=Math.min(1e9,...stations.map(t=>Math.min(Math.abs(q-t.at),N-Math.abs(q-t.at))));
  const cloth=g.children[0];
  return {off:best, lane, st, text:cloth.material.uniforms.uMap.value.hasText,
          w:cloth.material.uniforms.uMap.value.image.width, flip:Math.sign(cloth.scale.x)};
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
        if not ok:
            print('FAIL ' + what)
            fails.append(what)

    with sync_playwright() as p:
        browser = p.chromium.launch(executable_path=os.environ.get('CHROMIUM') or None,
                                    args=['--use-gl=angle', '--use-angle=swiftshader',
                                          '--enable-unsafe-swiftshader'])
        page = browser.new_page(viewport={'width': 750, 'height': 340})
        page.on('pageerror', lambda e: errors.append(str(e)))
        page.on('console', lambda m: m.type == 'error' and errors.append(m.text))
        page.route('**/*', lambda r: r.continue_() if r.request.url.startswith(url.rsplit('/', 1)[0])
                   else r.abort())
        page.goto(url)
        page.fill('#nameBox', 'teo', timeout=10000)
        page.keyboard.press('Enter')
        page.wait_for_function("typeof placeHomeBanners==='function'")
        homes = page.evaluate("CHARS.map((c,i)=>[i,c.id,c.short,homeOf(c)]).filter(r=>r[3])")
        hw = lambda: page.evaluate('HW')
        for ci, cid, short, sid in homes:
            page.evaluate(START, [ci, sid, False])
            b = page.evaluate(CHECK)
            print(f'{cid:>14} on {sid:<12} banners {len(b)}: ' +
                  ', '.join(f'{x["off"]:.1f} m out, lane {x["lane"]:.0f} m, forecourt {x["st"]} samples' for x in b))
            check(len(b) == 2, f'{cid}: two banners on {sid}')
            for x in b:
                check(x['off'] > hw() + 3.7, f'{cid}: banner behind the fence on {sid}')
                check(x['lane'] > 4, f'{cid}: banner clear of the shortcut lanes on {sid}')
                check(x['text'] and x['w'] == 16 + len(f'HEJA {short}!') * 8, f'{cid}: banner text on {sid}')
            other = 'bron' if sid != 'bron' else 'lund'
            page.evaluate(START, [ci, other, False])
            check(page.evaluate('homeBanners.length') == 0, f'{cid}: no banner on {other}')

        # mirrored: the cloth is flipped back so the name still reads
        ci, cid, short, sid = next(h for h in homes if h[1] == 'victor')
        page.evaluate(START, [ci, sid, True])
        flips = [x['flip'] for x in page.evaluate(CHECK)]
        check(flips == [-1, -1], f'mirrored {sid}: banner text flipped back ({flips})')
        page.evaluate('mirrorSel=false')

        # a look from the road at the first banner, for three drivers
        for cid in ('victor', 'bodil', 'mehmet'):
            ci, _, _, sid = next(h for h in homes if h[1] == cid)
            page.evaluate(START, [ci, sid, False])
            page.wait_for_function("state==='race'", timeout=20000)
            page.evaluate("""() => { const g=homeBanners[0],q=(()=>{let b=1e9,q=0;for(let i=0;i<N;i++){
                const d=Math.hypot(sx[i]-g.position.x,sz[i]-g.position.z);if(d<b){b=d;q=i;}}return q;})(),i=(q-16+N)%N;
              player.x=sx[i];player.z=sz[i];player.si=i;player.vx=player.vz=0;player.yaw=Math.atan2(fx[i],fz[i]);camInit=false; }""")
            page.wait_for_timeout(1200)
            page.screenshot(path=str(ROOT / f'banner-{cid}.png'))
        browser.close()
    httpd.shutdown()

    errors = [e for e in errors if 'net::ERR_FAILED' not in e]
    for e in errors:
        print('JS error:', e)
    if errors or fails:
        sys.exit('banner test FAILED')
    print(f'banner test passed ({len(homes)} drivers)')


if __name__ == '__main__':
    main()
