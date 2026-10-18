#!/usr/bin/env python3
"""Headless check of every shortcut: it is driveable, it is quicker, and its gates count.

    CHROMIUM=/path/to/chrome python3 tools/shortcut_test.py [stage ...] [--page page.html]

For each shortcut on each stage (or the stages named) one AI kart at a time drives from
well before the fork to well after the merge, once down the main road and once down the
shortcut, with the game's own aiControl() and drive(). A closed passage is opened first.
The test fails when a kart never gets onto the shortcut, needs Arne's tractor, misses a
gate, or the shortcut is not quicker on average across the five AI karts.

Closed passages are also fired at with each of the three forward-attack levels
(Spettekaka, Spettigare kaka, Semmelväggen), each of which must open them.

The sim runs the same way mirrored (only the picture flips), so a mirrored race is
started and checked once per stage for the same results.
"""
import os
import sys

from playwright.sync_api import sync_playwright

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from smoke_test import serve  # noqa: E402

MIN_GAIN = 0.3        # seconds, averaged over the AI karts
# the original tracks' shortcuts (roadmap: finish shortcuts and picnic stamps); name others to check them too
DEFAULT_STAGES = ['lund']

SETUP = """(id) => {
  CUP = null; TT = false; FREE = false; mirrorSel = false;
  buildWorld(STAGES.find(s => s.id === id)); resetRace(); state = 'race';
  return {routes: ALTS.map(R => ({id: R.id, idx: R.idx, a: R.a, b: R.b, hidden: !!R.hidden,
                                  shoot: !!R.shoot, n: R.n})),
          stamps: (stage.stamps || []).map(d => d.id),
          mouths: BLOCKERS.map(B => ({id: B.R.id, lat: B.lat, hw: HW}))};
}"""

# one kart, alone, from 70 samples before the fork until 40 after the merge
DRIVE = """([ki, routeId, take, mirror]) => {
  resetRace(); state = 'race'; setMirror(mirror);
  const Rr = ALTS.find(r => r.id === routeId), R = take ? Rr : null;
  const k = karts[ki];
  for (const o of karts) { o.parked = o !== k; }
  const s0 = ((Rr.a - 70) % N + N) % N;
  k.x = sx[s0]; k.z = sz[s0]; k.si = s0; k.mi = s0; k.yaw = Math.atan2(fx[s0], fz[s0]);
  k.y = groundAt(k.x, k.z, s0);
  const v0 = k.maxSpeed * 0.55; k.vx = fx[s0] * v0; k.vz = fz[s0] * v0; k.speed = v0;
  k.lap = 1; k.cp = Math.floor(s0 * CPN / N) % CPN; k.gate = k.cp; k.noBand = true;
  k.fuel = TANK; k.line = 0; k.lineVar = 0; k.progress = gateProgress(k);
  k.planned = {}; for (const Q of ALTS) k.planned[Q.idx] = k.lap;
  k.plan = R ? R.idx : 0;
  if (R && R.hidden) { R.open = true; R.opener = k; }
  missT = -9; const miss0 = missT;
  const end = (Rr.b + 40) % N, total = ((end - s0) % N + N) % N;
  let t = 0, onRoute = false, tractor = 0, gates = [k.gate], wasRec = false;
  while (t < 60) {
    if (!onRoute || k.rib) { for (const Q of ALTS) k.planned[Q.idx] = k.lap; if (!k.rib) k.plan = R ? R.idx : 0; }
    const ctl = aiControl(k); drive(k, FIXED, ctl); t += FIXED; raceTime += FIXED;
    if (k.rib === (R ? R.idx : -1)) onRoute = true;
    if (k.recoverT > 0 && !wasRec) tractor++;
    wasRec = k.recoverT > 0;
    if (gates[gates.length - 1] !== k.gate) gates.push(k.gate);
    const d = ((k.mi - s0) % N + N) % N;
    if (!k.rib && d >= total && d < total + 30) break;
  }
  const chain = gates.every((g, n) => n === 0 || GATES[gates[n - 1]].next.includes(g));
  const twins = GATES.some(H => H.route === Rr.idx), viaTwin = gates.some(g => GATES[g].route === Rr.idx);
  return {t, onRoute, tractor, gates, chain, twinOk: !R || !twins || viaTwin, rib: k.rib, lap: k.lap - (s0 > end ? 1 : 0), mi: k.mi, s0, end, total};
}"""

# the player in front of a closed mouth with one forward attack of the given level
ATTACK = """([routeId, lvl]) => {
  resetRace(); state = 'race';
  const R = ALTS.find(r => r.id === routeId), k = player;
  for (const o of karts) o.parked = o !== k;
  shutPassages(null);
  const s0 = ((R.a - 40) % N + N) % N;
  k.x = sx[s0]; k.z = sz[s0]; k.si = s0; k.mi = s0; k.yaw = Math.atan2(fx[s0], fz[s0]);
  k.y = groundAt(k.x, k.z, s0); k.vx = k.vz = 0; k.speed = 0; k.lat = 0;
  k.held = 'rocket'; k.heldLvl = lvl; k.roll = 0;
  useItem(k);
  let t = 0;
  while (t < 6 && !R.open) { updateRockets(FIXED); t += FIXED; clock += FIXED; }
  return {open: !!R.open, t};
}"""


def main():
    args = [a for a in sys.argv[1:] if not a.startswith('--')]
    page_name = 'index.html'
    if '--page' in sys.argv:
        page_name = sys.argv[sys.argv.index('--page') + 1]
        args = [a for a in args if a != page_name]
    httpd = serve()
    url = f'http://127.0.0.1:{httpd.server_port}/{page_name}'
    errors, failures = [], []
    with sync_playwright() as p:
        browser = p.chromium.launch(executable_path=os.environ.get('CHROMIUM') or None,
                                    args=['--use-gl=angle', '--use-angle=swiftshader',
                                          '--enable-unsafe-swiftshader'])
        page = browser.new_page(viewport={'width': 640, 'height': 400})
        page.on('pageerror', lambda e: errors.append(str(e)))
        page.route('**/*', lambda r: r.continue_() if r.request.url.startswith(url.rsplit('/', 1)[0])
                   else r.abort())
        page.goto(url)
        page.wait_for_function('typeof buildWorld === "function" && typeof STAGES === "object"',
                               timeout=20000)
        stages = args or DEFAULT_STAGES
        ais = page.evaluate('karts.map((k, i) => k.ai ? i : -1).filter(i => i >= 0)')
        for sid in stages:
            info = page.evaluate(SETUP, sid)
            if not info['routes']:
                failures.append(f'{sid}: no shortcuts')
                continue
            for B in info['mouths']:
                # a closed mouth must sit clear of the main road, or karts racing past bump it
                if abs(B['lat']) < B['hw'] + 1.5:
                    failures.append(f"{sid}/{B['id']}: closed mouth only {abs(B['lat']):.1f} from the centreline")
            for R in info['routes']:
                gains = []
                for ki in ais:
                    main = page.evaluate(DRIVE, [ki, R['id'], False, False])
                    alt = page.evaluate(DRIVE, [ki, R['id'], True, False])
                    gains.append(main['t'] - alt['t'])
                    name = f"{sid}/{R['id']} kart {ki}"
                    if not alt['onRoute']:
                        failures.append(f'{name}: never got onto the shortcut')
                    if alt['tractor'] or main['tractor']:
                        failures.append(f"{name}: needed the tractor (main {main['tractor']}, "
                                        f"shortcut {alt['tractor']})")
                    if alt['rib'] or main['rib']:
                        failures.append(f'{name}: did not merge back onto the main road')
                    if not (alt['chain'] and main['chain'] and alt['twinOk']):
                        failures.append(f"{name}: gates out of order (main {main['gates']}, shortcut {alt['gates']})")
                    if alt['lap'] != 1 or main['lap'] != 1:
                        failures.append(f'{name}: lap count changed')
                avg = sum(gains) / len(gains)
                print(f"{sid:10s} {R['id']:10s} {'closed' if R['shoot'] else 'open  '} "
                      f"gain avg {avg:+.2f} s  per kart " + ' '.join(f'{g:+.2f}' for g in gains))
                if avg < MIN_GAIN:
                    failures.append(f"{sid}/{R['id']}: only {avg:+.2f} s quicker on average")
                # mirrored: the same drive must give the same result
                m = page.evaluate(DRIVE, [ais[0], R['id'], True, True])
                n = page.evaluate(DRIVE, [ais[0], R['id'], True, False])
                if not m['onRoute'] or abs(m['t'] - n['t']) > 0.05:
                    failures.append(f"{sid}/{R['id']}: mirrored run differs ({m['t']:.2f} vs {n['t']:.2f})")
                if R['shoot']:
                    for lvl in (1, 2, 3):
                        a = page.evaluate(ATTACK, [R['id'], lvl])
                        print(f"{'':10s} {'':10s} attack level {lvl}: "
                              f"{'opens in %.2f s' % a['t'] if a['open'] else 'STAYS SHUT'}")
                        if not a['open']:
                            failures.append(f"{sid}/{R['id']}: forward attack level {lvl} did not open it")
            page.evaluate('setMirror(false)')
        browser.close()
    httpd.shutdown()
    errors = [e for e in errors if 'net::ERR_FAILED' not in e]
    for e in errors:
        print('JS error:', e)
    for f in failures:
        print('FAIL', f)
    if errors or failures:
        sys.exit('shortcut test FAILED')
    print('shortcut test passed')


if __name__ == '__main__':
    main()
