#!/usr/bin/env python3
"""Headless petrol audit: measures fuel on every stage and checks the balance gates.

    CHROMIUM=/path/to/chrome python3 tools/fuel_audit.py [stage ...] [--calibrate] [--json out.json]

For each stage, one AI kart drives alone on the real physics (drive + aiControl, items and
pickups live, no catch-up):

  * drain run: the reference combination (Nisse's driving with the neutral GOKART, burn 1.00),
    tank held full and kept on the main road, so we see what the stage really costs: fuel per
    lap, per main-road sample, and from there every interval start -> station -> station ->
    ... -> finish. --calibrate prints the FUEL_MUL that puts a neutral race at TARGET.
  * shortcut run: the same kart taking every open shortcut, fuel on each lane against the main
    road it skips (a rough lane must not cost double: slower and thirstier).
  * race runs, refuelling on: neutral, economical (Amanda in Landskrona 61) and thirsty
    (Raket-Rune in Malmö Överljud) each race the stage with the real fuel planning.
  * a full field race: every bot finishes and nobody runs dry.

Gates (exit 1 on any failure):
  * neutral race fuel within 35-40 a lap, scaled to the stage's laps (two-lap stages match a
    three-lap race in total), so TARGET +- 7 %;
  * the longest unavoidable interval leaves at least 20 in the tank for neutral, starting full;
  * the thirsty combination can cross every unavoidable interval from a full tank;
  * neutral makes exactly one stop, economical at most one (and never more than neutral),
    thirsty at least one; none of them is ever dry;
  * the full field all finish, nobody dry for more than a second.
"""
import json
import os
import sys

from playwright.sync_api import sync_playwright

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from smoke_test import serve  # noqa: E402

TARGET = 112.5        # fuel for a neutral race: 37.5 a lap over three laps
BAND = (105, 120)     # the gate: 35-40 a lap over three laps, the same in total on two
DRAINS = 1           # the reference drives a fixed line, so one drain run is exact
MIN_LEFT = 20         # fuel left after the longest unavoidable interval, neutral, from full

# [label, driver, vehicle]; driver None = Nisse's AI profile (no burn of its own)
COMBOS = {'neutral': [None, 'kart'], 'eco': ['amanda', 'l61'], 'thirsty': ['rune', 'overljud']}

SETUP = """([sid, combo]) => {
  CUP = null; TT = false; FREE = false; mirrorSel = false;
  const S = STAGES.find(s => s.id === sid); if (!S) return null;
  buildWorld(S); resetRace(); setMirror(false); placeOnGrid(); state = 'race'; raceTime = 0;
  window.__fa = {chooseRoute};
  /* the stations alone must carry a race: jerrycans are a bonus, never the plan */
  window.noCans = () => { for (const it of items) if (it.type === 'fuel') { it.cool = 1e9; it.mesh.visible = false; } };
  return {N, L: SEG * N, laps: LAPS, mul: stageFuel(), stations: stations.map(s => ({at: s.at, len: s.len, side: s.side})),
          alts: ALTS.map(R => ({idx: R.idx, id: R.id, a: R.a, b: R.b, hidden: !!R.hidden}))};
}"""

# one kart alone; mode 'drain' keeps the tank full and the kart on the main road,
# 'lanes' takes every open shortcut, 'race' refuels with the real planner
SOLO = """([combo, mode]) => {
  resetRace(); setMirror(false); placeOnGrid(); state = 'race'; raceTime = 0;
  noCans();
  const k = karts[4];
  for (const o of karts) { o.parked = o !== k; }
  const drv = combo[0] ? CHARS.find(c => c.id === combo[0]) : k.cfg;
  Object.assign(k, effStats(drv, carIndex(combo[1])));
  k.noBand = true; k.fuel = TANK; k.fuelUsed = 0; k.fuelIn = 0; k.stops = 0; k.lapStart = 0;
  k.line = 0; k.lineVar = 0;                       /* a fixed reference line: no luck of the draw */
  if (mode === 'drain') chooseRoute = () => false;
  else if (mode === 'lanes') chooseRoute = (kk, R) => !R.hidden;
  else chooseRoute = window.__fa.chooseRoute;
  const prof = new Float64Array(N), cnt = new Float64Array(N), tprof = new Float64Array(N);
  const lanes = {}, open = {}; let m1 = k.mi, dry = 0, dryAt = null, minFuel = TANK, t = 0, step = 0;
  const lapUse = []; let lapMark = 0, lap0 = 0;
  while (t < 900 && !k.done) {
    if (mode === 'drain') { k.fuel = TANK; k.wantFuel = false; }
    const m0 = k.si, u0 = k.fuelUsed, rib0 = k.rib;
    drive(k, FIXED, aiControl(k));
    const mi1 = k.mi;
    t += FIXED; raceTime += FIXED; step++;
    if (step % 6 === 0) { checkPickups(); updateHazards(FIXED * 6); aiItemLines(); order(); }
    const du = k.fuelUsed - u0;
    if (!k.rib && !rib0) {                         /* spread this step's use over the samples passed */
      let d = k.si - m0; if (d < -N / 2) d += N; else if (d > N / 2) d -= N;
      if (d >= 0 && d < 24) { const n = Math.max(1, d); for (let q = 0; q < n; q++) { const i = (m0 + q) % N; prof[i] += du / n; cnt[i] += 1 / n; tprof[i] += FIXED / n; } }
    }
    /* each fork to its merge on the progress scale: lane or main, whichever was driven */
    for (const R of ALTS) {
      const a0 = ((R.a - m1) % N + N) % N, b0 = ((R.b - m1) % N + N) % N;
      let d = mi1 - m1; if (d < -N / 2) d += N; else if (d > N / 2) d -= N;
      const o = open[R.idx];
      if (o && k.rib === R.idx) o.took = true;
      if (d > 0 && d < 24 && b0 > 0 && b0 <= d && o) {
        if (o.took) (lanes[R.id] = lanes[R.id] || []).push({fuel: k.fuelUsed - o.used, time: t - o.t});
        open[R.idx] = null;
      }
      if (d > 0 && d < 24 && a0 > 0 && a0 <= d) open[R.idx] = {used: k.fuelUsed, t, took: false};
    }
    m1 = mi1;
    if (k.fuel <= 0) { if (!dry) dryAt = {t: +t.toFixed(1), lap: k.lap, mi: Math.round(k.mi), want: k.wantFuel, stops: k.stops,
        rib: k.rib, plan: k.plan, next: pumpsAhead(k).slice(0, 2).map(p => Math.round(p.d))}; dry += FIXED; }
    minFuel = Math.min(minFuel, k.fuel);
    if (k.lap !== lap0) { lapUse.push(k.fuelUsed - lapMark); lapMark = k.fuelUsed; lap0 = k.lap; }
  }
  chooseRoute = window.__fa.chooseRoute;
  return {done: k.done, total: k.total, laps: k.lapTimes.slice(), used: k.fuelUsed, fuelIn: k.fuelIn, stops: k.stops, miss: k.pumpMiss,
          dry, dryAt, minFuel, end: k.fuel, lapUse, burn: k.burn, prof: Array.from(prof), cnt: Array.from(cnt), tprof: Array.from(tprof), lanes, grid: 10 + 2 * 16};
}"""

# pull-in trial: the reference kart comes at each station at speed, from three lines across
# the road, needing fuel; it must stop on the forecourt and fill. A miss is a layout problem.
PIT = """([si, line]) => {
  resetRace(); setMirror(false); placeOnGrid(); state = 'race'; raceTime = 0; noCans();
  const k = karts[4];
  for (const o of karts) o.parked = o !== k;
  Object.assign(k, effStats(k.cfg, carIndex('kart'))); k.noBand = true;
  const S = stations[si], s0 = ((S.at - 150) % N + N) % N;
  k.x = sx[s0] + rx[s0] * line; k.z = sz[s0] + rz[s0] * line; k.si = s0; k.mi = s0;
  k.yaw = Math.atan2(fx[s0], fz[s0]); k.y = groundAt(k.x, k.z, s0); k.vy = 0;
  const v0 = k.maxSpeed; k.vx = fx[s0] * v0; k.vz = fz[s0] * v0;   /* flat out, as it arrives in a race */
  k.lap = 1; k.cp = Math.floor(s0 * CPN / N) % CPN; k.gate = k.cp; k.progress = N + s0;
  k.line = line; k.lineVar = 0; k.plan = 0; k.planned = {}; for (const R of ALTS) k.planned[R.idx] = 1;
  k.fuel = 25; k.fuelIn = 0; k.fillEnd = -9; k.stops = 0;
  let t = 0;
  while (t < 20) {
    k.wantFuel = k.fuel < 60;
    drive(k, FIXED, aiControl(k)); t += FIXED; raceTime += FIXED;
    const d = ((k.mi - S.at) % N + N) % N;
    if (d > S.len + 20 && d < N / 2) break;
  }
  return {filled: +k.fuelIn.toFixed(1), t: +t.toFixed(1)};
}"""

FIELD = """() => {
  resetRace(); setMirror(false); placeOnGrid(); state = 'race'; raceTime = 0;
  noCans();
  player.parked = true;
  const ais = karts.filter(k => !k.parked), dry = new Map(ais.map(k => [k, 0])), at = new Map();
  for (const k of ais) k.lapStart = 0;
  let t = 0, step = 0;
  while (t < 900 && ais.some(k => !k.done)) {
    for (const k of ais) { if (k.done) continue; drive(k, FIXED, aiControl(k));
      if (k.fuel <= 0) { if (!dry.get(k)) at.set(k, {t: +t.toFixed(1), lap: k.lap, mi: Math.round(k.mi), want: k.wantFuel, stops: k.stops,
        next: pumpsAhead(k).slice(0, 2).map(p => Math.round(p.d))}); dry.set(k, dry.get(k) + FIXED); } }
    separate(); t += FIXED; raceTime += FIXED; step++;
    if (step % 6 === 0) { checkPickups(); updateHazards(FIXED * 6); aiItemLines(); order(); }
  }
  return ais.map(k => ({name: k.name, done: k.done, total: k.total, stops: k.stops, miss: k.pumpMiss, used: k.fuelUsed, dry: dry.get(k), at: at.get(k) || null, burn: k.burn}));
}"""


def intervals(prof, stations, n, laps, start):
    """fuel from the grid through every station pass to the flag, on the main road"""
    marks = sorted(s['at'] for s in stations)
    out, acc, pos, end = [], 0.0, start, n * laps
    # walk the whole race distance sample by sample from the grid (progress starts at `start`)
    names = ['START']
    p = start
    while p < end:
        i = p % n
        acc += prof[i]
        p += 1
        if (p % n) in marks and p < end:
            out.append(acc)
            names.append(f"S{marks.index(p % n) + 1}")
            acc = 0.0
    out.append(acc)
    names.append('MÅL')
    return out, names


def run(stages, calibrate, json_out):
    httpd = serve()
    url = f'http://127.0.0.1:{httpd.server_port}/index.html'
    errors, fails, rows, report = [], [], [], {}
    with sync_playwright() as p:
        browser = p.chromium.launch(executable_path=os.environ.get('CHROMIUM') or None,
                                    args=['--use-gl=angle', '--use-angle=swiftshader',
                                          '--enable-unsafe-swiftshader'])
        page = browser.new_page(viewport={'width': 640, 'height': 400})
        page.on('pageerror', lambda e: errors.append(str(e)))
        page.route('**/*', lambda r: r.continue_() if r.request.url.startswith(url.rsplit('/', 1)[0])
                   else r.abort())
        page.goto(url)
        page.wait_for_function('typeof buildWorld === "function" && typeof STAGES === "object"', timeout=20000)
        all_ids = page.evaluate('STAGES.map(s => s.id)')
        for sid in stages or all_ids:
            fail = lambda m, sid=sid: fails.append(f'{sid}: {m}')  # noqa: E731
            info = page.evaluate(SETUP, [sid, None])
            if info is None:
                fails.append(f'{sid}: no such stage')
                continue
            n, laps = info['N'], info['laps']
            drains = [page.evaluate(SOLO, [COMBOS['neutral'], 'drain']) for _ in range(DRAINS)]
            if not all(d['done'] for d in drains):
                fail('reference kart did not finish a drain run')
                continue
            drains.sort(key=lambda d: d['used'])
            dr = drains[len(drains) // 2]          # the median run: one bad lap must not set the stage
            used = dr['used']
            prof = [sum(d['prof'][i] for d in drains) / len(drains) for i in range(n)]
            cnt = [sum(d['cnt'][i] for d in drains) for i in range(n)]
            tprof = [sum(d['tprof'][i] for d in drains) / len(drains) for i in range(n)]
            # fill any sample the reference never logged with its neighbours' mean
            mean = sum(prof) / max(1, sum(1 for c in cnt if c > 0))
            prof = [v if c > 0 else mean for v, c in zip(prof, cnt)]
            # scale the averaged profile to the median run so intervals and total agree
            tot = sum(prof)
            prof = [v * used / tot for v in prof]
            per_lap = used / laps
            raw_total = used / info['mul']
            want_mul = TARGET / raw_total
            ivs, names = intervals([v / laps for v in prof], info['stations'], n, laps, dr['grid'])
            worst = max(ivs)
            wi = ivs.index(worst)
            entry = {'id': sid, 'laps': laps, 'L': round(info['L']), 'mul': info['mul'], 'calib': round(want_mul, 3),
                     'race': round(used, 1), 'perLap': round(per_lap, 1), 'lapTimes': [round(x, 1) for x in dr['laps']],
                     'intervals': [round(x, 1) for x in ivs], 'names': names, 'worst': round(worst, 1),
                     'worstLeg': f'{names[wi]}→{names[wi + 1]}', 'stations': info['stations']}
            line = (f"{sid:12s} laps {laps} lap {info['L']:5.0f} m  mul {info['mul']:.2f} (fit {want_mul:.3f})  "
                    f"race {used:6.1f}  /lap {per_lap:5.1f}  worst {worst:5.1f} {entry['worstLeg']}")
            print(line, flush=True)
            if calibrate:
                rows.append(entry)
                report[sid] = entry
                continue
            if not BAND[0] <= used <= BAND[1]:
                fail(f'neutral race uses {used:.1f}, want {BAND[0]}-{BAND[1]}')
            if TANK_LEFT(worst) < MIN_LEFT:
                fail(f'longest interval {entry["worstLeg"]} uses {worst:.1f}: leaves {100 - worst:.1f} < {MIN_LEFT}')
            if worst * COMBO_BURN['thirsty'] > 100:
                fail(f'thirsty can not cross {entry["worstLeg"]} from full ({worst * COMBO_BURN["thirsty"]:.1f})')
            pits = []
            for si in range(len(info['stations'])):
                hits = [page.evaluate(PIT, [si, line]) for line in (-5, 0, 5)]
                pits.append(hits)
                if any(h['filled'] < 30 for h in hits):
                    fail(f"station {si + 1} at {info['stations'][si]['at']}: pulled in from lines -5/0/5 got "
                         f"{[h['filled'] for h in hits]} fuel (a station karts miss is a layout problem)")
            entry['pits'] = pits
            print('   pull-in ' + '  '.join(f"S{i + 1}: " + '/'.join(f"{h['filled']:.0f}" for h in hits) for i, hits in enumerate(pits)), flush=True)
            # shortcuts: lane fuel against the main road it skips
            ln = page.evaluate(SOLO, [COMBOS['neutral'], 'lanes'])
            lanes = []
            for A in info['alts']:
                if A['hidden'] or A['id'] not in ln['lanes']:
                    continue
                span = (A['b'] - A['a']) % n
                main = sum(prof[(A['a'] + q) % n] for q in range(span)) / laps
                mt = sum(tprof[(A['a'] + q) % n] for q in range(span)) / laps
                got = ln['lanes'][A['id']]
                lf = sum(x['fuel'] for x in got) / len(got)
                lt = sum(x['time'] for x in got) / len(got)
                skips = [s['at'] for s in info['stations'] if 0 < (s['at'] - A['a']) % n < span]
                lanes.append({'id': A['id'], 'lane': round(lf, 2), 'main': round(main, 2), 'laneT': round(lt, 2),
                              'mainT': round(mt, 2), 'skips': skips})
                print(f"   lane {A['id']:14s} fuel {lf:5.2f} vs main {main:5.2f}   time {lt:5.2f} s vs {mt:5.2f} s"
                      f"{'   skips a station' if skips else ''}", flush=True)
                # no double penalty: rough ground already costs time, so a lane may not cost more
                # fuel a second than flat-out asphalt (boosts allowed for). Slower-and-thirstier
                # lanes are listed for the layout, not failed: that is the lane's line, not fuel
                cap = 2.5 * info['mul'] * 1.25
                if lf / max(lt, 0.1) > cap:
                    fail(f'shortcut {A["id"]} burns {lf / lt:.2f} a second, over flat-out asphalt ({cap:.2f})')
                if lt > mt + 0.3 and lf > main * 1.1:
                    print(f'   note: {A["id"]} is slower for the AI and costs more fuel: a layout matter')
            entry['lanes'] = lanes
            # races with refuelling, three combinations
            res = {}
            for c in ('neutral', 'eco', 'thirsty'):
                r = page.evaluate(SOLO, [COMBOS[c], 'race'])
                res[c] = {'done': r['done'], 'stops': r['stops'], 'miss': r['miss'], 'fuelIn': round(r['fuelIn'], 1), 'dry': round(r['dry'], 2),
                          'end': round(r['end'], 1), 'min': round(r['minFuel'], 1), 'total': round(r['total'] or 0, 1),
                          'used': round(r['used'], 1)}
                if not r['done']:
                    fail(f'{c} did not finish')
                if r['miss']:
                    fail(f'{c} missed {r["miss"]} pump stop(s) it had committed to')
                if r['dry'] > 0:
                    fail(f'{c} ran dry for {r["dry"]:.1f} s {r["dryAt"]}')
            if res['neutral']['stops'] != 1:
                fail(f"neutral made {res['neutral']['stops']} stops, want 1")
            if res['eco']['stops'] > 1 or res['eco']['stops'] > res['neutral']['stops']:
                fail(f"economical made {res['eco']['stops']} stops")
            if res['thirsty']['stops'] < 1:
                fail(f"thirsty made {res['thirsty']['stops']} stops, want at least 1")
            entry['runs'] = res
            print('   ' + '  '.join(f"{c}: stops {v['stops']} +{v['fuelIn']:.0f} min {v['min']:.0f} end {v['end']:.0f} "
                                   f"{v['total']:.1f}s" for c, v in res.items()), flush=True)
            fl = page.evaluate(FIELD)
            entry['field'] = fl
            for r in fl:
                if not r['done']:
                    fail(f"field: {r['name']} did not finish")
                if r['dry'] > 1:
                    fail(f"field: {r['name']} dry for {r['dry']:.1f} s {r['at']}")
            if sum(r['miss'] for r in fl) > 1:
                fail(f"field: {sum(r['miss'] for r in fl)} committed pump stops missed in traffic")
            print('   field ' + ' '.join(f"{r['name']}:{r['stops']}{'' if not r['miss'] else ' MISS%d' % r['miss']}{'' if r['done'] else '!DNF'}"
                                       f"{'' if r['dry'] <= 1 else ' DRY%.0f' % r['dry']}" for r in fl), flush=True)
            rows.append(entry)
            report[sid] = entry
        browser.close()
    httpd.shutdown()
    if json_out:
        with open(json_out, 'w') as f:
            json.dump(report, f, indent=1, ensure_ascii=False)
    if calibrate:
        print('const FUEL_MUL={' + ','.join(f"{r['id']}:{r['calib']:.2f}" for r in rows) + '};')
    for e in errors:
        print('JS error:', e)
    for f in fails:
        print('FAIL', f)
    if errors or fails:
        sys.exit(f'fuel audit FAILED ({len(fails)} checks, {len(errors)} JS errors)')
    print('fuel audit passed')


def TANK_LEFT(x):
    return 100 - x


COMBO_BURN = {'thirsty': 1.15 * 1.35}


if __name__ == '__main__':
    args = sys.argv[1:]
    out = None
    if '--json' in args:
        out = args[args.index('--json') + 1]
        args.remove(out)
    run([a for a in args if not a.startswith('--')], '--calibrate' in args, out)
