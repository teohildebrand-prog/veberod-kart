#!/usr/bin/env python3
"""Headless checks for the Västgöta and Göteborg tracks: laid out cleanly, raceable, fair.

    CHROMIUM=/path/to/chrome python3 tools/vastgota_test.py [stage ...]

For each stage (default: the six west-coast tracks and the two bonus tracks):
  * the track builds without a JS error, no stretch of road comes near another (no
    overlapping road surfaces), and no shortcut runs close beside the main road;
  * two fuel stops, kept off the jumps and out of the shortcuts' forks and merges;
  * three picnic stamps, and every one of them can be reached: on the road or the lane
    it belongs to, and the airborne one at a height a kart actually passes through;
  * at least one hazard that can touch a kart;
  * a full three-lap race of the five AI karts, normal and mirrored: everyone finishes,
    nobody needs Arne's tractor, and the lap times are sane.
A lane may peel away from the main road gently, but its middle half keeps clear of it.
The shortcuts themselves are checked by shortcut_test.py.
"""
import os
import sys

from playwright.sync_api import sync_playwright

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from smoke_test import serve  # noqa: E402

DEFAULT_STAGES = ['lerum', 'boras', 'trollhattan', 'avenyn', 'hisingen', 'ullevi', 'sibylla', 'promenad']

LAYOUT = """(id) => {
  CUP = null; TT = false; FREE = false; mirrorSel = false;
  const S = STAGES.find(s => s.id === id); if (!S) return null;
  buildWorld(S); resetRace();
  /* closest approach of two stretches of road that are not neighbours along the lap */
  const K = Math.ceil((2 * HW + 30) / SEG); let worst = 1e9, wi = 0, wj = 0;
  for (let i = 0; i < N; i += 2) for (let j = i + K; j < N; j += 2) {
    if (N - (j - i) < K) continue;
    const d = Math.hypot(sx[i] - sx[j], sz[i] - sz[j]);
    if (d < worst) { worst = d; wi = i; wj = j; }
  }
  /* a lane's middle half against the main road: it may peel away gently at either end */
  const lanes = ALTS.map(R => {
    let best = 1e9, bj = 0;
    for (let j = Math.max(Math.floor(R.n / 4), COMMIT + 8); j < Math.min(Math.ceil(R.n * 3 / 4), R.n - MERGE - 8); j++) {
      const i = nearestGlobal(R.X[j], R.Z[j]), d = Math.hypot(R.X[j] - sx[i], R.Z[j] - sz[i]);
      if (d < best) { best = d; bj = j; }
    }
    return {id: R.id, a: R.a, b: R.b, hw: R.hw, near: best, at: bj};
  });
  const stamps = stampObjs.map(o => {
    const d = o.def; let onRoad = true;
    if (o.rib) { const R = ALTS.find(r => r.idx === o.rib), j = nearestAltAll(R, o.x, o.z);
      onRoad = Math.abs((o.x - R.X[j]) * R.RX[j] + (o.z - R.Z[j]) * R.RZ[j]) < R.hw - .4; }
    else { const i = nearestGlobal(o.x, o.z); onRoad = Math.abs((o.x - sx[i]) * rx[i] + (o.z - sz[i]) * rz[i]) < HW - .4; }
    return {id: d.id, kind: d.kind, route: d.route, onRoad, x: o.x, y: o.y, z: o.z, jump: d.jump, after: d.after};
  });
  return {L: SEG * N, HW, worst, wi, wj, lanes, jumps: JUMPS, stations: stations.map(s => ({at: s.at, len: s.len, side: s.side})),
          stamps, hazards: HAZARDS.filter(h => h.hit).map(h => h.id), laps: LAPS};
}"""

# one AI kart, alone, held on the centre line over a jump: does it pass through the stamp?
AIR = """([ki, jump, sx0, sy0, sz0]) => {
  resetRace(); state = 'race';
  const k = karts[ki], J = JUMPS[jump];
  for (const o of karts) o.parked = o !== k;
  const s0 = ((J.at - 60) % N + N) % N;
  k.x = sx[s0]; k.z = sz[s0]; k.si = s0; k.mi = s0; k.yaw = Math.atan2(fx[s0], fz[s0]);
  k.y = groundAt(k.x, k.z, s0); const v0 = k.maxSpeed * 0.8; k.vx = fx[s0] * v0; k.vz = fz[s0] * v0;
  k.lap = 1; k.cp = Math.floor(s0 * CPN / N) % CPN; k.gate = k.cp; k.noBand = true; k.fuel = TANK;
  k.line = 0; k.lineVar = 0; k.plan = 0; k.planned = {}; for (const Q of ALTS) k.planned[Q.idx] = 9;
  let best = 1e9;
  for (let t = 0; t < 8; t += FIXED) {
    const ctl = aiControl(k); drive(k, FIXED, ctl); raceTime += FIXED;
    const dh = Math.hypot(k.x - sx0, k.z - sz0);
    if (dh < 2.2) best = Math.min(best, Math.abs(k.y - sy0));
    const d = ((k.mi - J.at) % N + N) % N; if (d > 40 && d < 200) break;
  }
  return best;
}"""

# the whole field, three laps, the way the game's own loop runs it
RACE = """([mirror]) => {
  resetRace(); setMirror(mirror); placeOnGrid(); state = 'race'; raceTime = 0;
  player.parked = true;
  const ais = karts.filter(k => !k.parked);
  for (const k of ais) k.lapStart = 0;
  const rec = new Map(ais.map(k => [k, 0])), was = new Map(ais.map(k => [k, false]));
  let t = 0;
  while (t < 600 && ais.some(k => !k.done)) {
    for (const k of ais) { if (k.done) continue; drive(k, FIXED, aiControl(k)); }
    separate(); t += FIXED; raceTime += FIXED;
    if (Math.round(t / FIXED) % 6 === 0) { checkPickups(); updateHazards(FIXED * 6); aiItemLines(); order(); }
    for (const k of ais) { const r = k.recoverT > 0; if (r && !was.get(k)) rec.set(k, rec.get(k) + 1); was.set(k, r); }
  }
  setMirror(false);
  return ais.map(k => ({name: k.name, done: k.done, total: k.total, laps: k.lapTimes.slice(), tractor: rec.get(k)}));
}"""


def main():
    stages = [a for a in sys.argv[1:] if not a.startswith('--')] or DEFAULT_STAGES
    httpd = serve()
    url = f'http://127.0.0.1:{httpd.server_port}/index.html'
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
        ais = page.evaluate('karts.map((k, i) => k.ai ? i : -1).filter(i => i >= 0)')
        for sid in stages:
            n0 = len(errors)
            d = page.evaluate(LAYOUT, sid)
            if d is None:
                failures.append(f'{sid}: no such stage')
                continue
            if len(errors) > n0:
                failures.append(f'{sid}: JS error while building: {errors[n0:]}')
            fail = lambda m: failures.append(f'{sid}: {m}')  # noqa: E731
            need = 2 * d['HW'] + 6
            if d['worst'] < need:
                fail(f"road comes within {d['worst']:.1f} m of itself (samples {d['wi']}, {d['wj']}; need {need:.1f})")
            for R in d['lanes']:
                if R['near'] < d['HW'] + R['hw'] + 1:
                    fail(f"lane {R['id']} runs {R['near']:.1f} m from the main road at lane sample {R['at']}")
            if len(d['stations']) != 2:
                fail(f"{len(d['stations'])} fuel stops, want 2")
            N = 720
            dist = lambda a, b: min((a - b) % N, (b - a) % N)  # noqa: E731
            for S in d['stations']:
                for J in d['jumps']:
                    if dist(S['at'], J['at']) < J['up'] + 16 or dist(S['at'] + S['len'], J['at'] - J['up']) < 6:
                        fail(f"fuel stop at {S['at']} too close to the jump at {J['at']}")
                for R in d['lanes']:
                    for end in (R['a'], R['b']):
                        if dist(S['at'], end) < 14 or dist(S['at'] + S['len'], end) < 14:
                            fail(f"fuel stop at {S['at']} too close to {R['id']}'s fork or merge ({end})")
            if len(d['stamps']) != 3:
                fail(f"{len(d['stamps'])} stamps, want 3")
            for s in d['stamps']:
                if s['kind'] != 'air' and not s['onRoad']:
                    fail(f"stamp {s['id']} is off its road")
                if s['kind'] == 'air':
                    gap = min(page.evaluate(AIR, [ki, s['jump'], s['x'], s['y'], s['z']]) for ki in ais)
                    print(f"{sid:12s} air stamp {s['id']}: nearest pass {gap:.2f} m (pick-up within 3.4)")
                    if gap > 3.0:
                        fail(f"air stamp {s['id']} out of reach ({gap:.2f} m)")
            if not d['hazards']:
                fail('no hazard that can touch a kart')
            for mirror in (False, True):
                res = page.evaluate(RACE, [mirror])
                tag = 'mirrored' if mirror else 'normal'
                tot = [r['total'] for r in res if r['done']]
                best = min((min(r['laps']) for r in res if r['laps']), default=0)
                print(f"{sid:12s} {tag:8s} lap {d['L']:.0f} m  finishers {len(tot)}/{len(res)}  "
                      f"times {' '.join(f'{x:.1f}' for x in sorted(tot))}  best lap {best:.1f}  "
                      f"tractor {[r['tractor'] for r in res]}")
                for r in res:
                    if not r['done']:
                        fail(f"{tag}: {r['name']} did not finish")
                    if r['tractor']:
                        fail(f"{tag}: {r['name']} needed the tractor {r['tractor']}x")
                if tot and max(tot) > 1.6 * min(tot):
                    fail(f"{tag}: spread of finishing times too wide ({min(tot):.1f}..{max(tot):.1f})")
                if best and not 25 <= best <= 75:
                    fail(f"{tag}: best lap {best:.1f} s is outside 25..75 s")
        browser.close()
    httpd.shutdown()
    for e in errors:
        print('JS error:', e)
    for f in failures:
        print('FAIL', f)
    if errors or failures:
        sys.exit('vastgota test FAILED')
    print('vastgota test passed')


if __name__ == '__main__':
    main()
