#!/usr/bin/env python3
"""Headless rubber-band audit: how close the field stays to the player, race after race.

    CHROMIUM=/path/to/chrome python3 tools/band_audit.py [stage ...] [--races N] [--json out.json]

The player's kart is driven by the AI as a stand-in for a human, at four skill levels:

  * avg:    the plain player kart on the AI's hands;
  * strong: 7 % more speed, power and grip and a bolder line, a player who knows the track;
  * weak:   7 % less and a careful line, a first-timer;
  * crash:  avg, but frozen for 6 s on lap 1, a big spin into the hay bales.

Each runs a full six-kart race on the real physics (drive + aiControl, items, pickups, fuel) with
Math.random seeded, so a before/after comparison sees the same luck. The field races on after the
player's flag (up to 40 s) the way cupComplete does. Measured every half second of the race:
each bot's gap to the player in seconds (gapTo), how many bots are within 3 s, place changes of
the player, and every bot recovery (driven off the road) as a sign of a bot cornering too hot.

Every race is run twice, catch-up on and off (noBand on every kart), for the comparison.

Gates (exit 1 on any failure), on the averages over all stages and races, catch-up on:
  * avg:    median |gap| of the field <= 2.5 s; on average 2.5 bots within 3 s; the whole
            field across the line within 8 s;
  * strong, weak: on average 1.5 bots within 3 s;
  * strong: when the player wins, by no more than 5 s on average (and weak, when last, the same);
  * crash:  back within 3 s of a bot a median 12 s after the restart, never more than 30 s;
  * no more than 0.6 bot recoveries a race above the same races without catch-up;
  * bots run dry no more with the catch-up on than off (a faster bot burns faster), within 0.5 s a race.
"""
import json
import os
import statistics as st
import sys

from playwright.sync_api import sync_playwright

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from smoke_test import serve  # noqa: E402

SCEN = {'avg': {}, 'strong': {'mul': 1.07, 'caution': 2.5}, 'weak': {'mul': 0.93, 'caution': 3.2}, 'crash': {'freeze': [35, 6]}}
GATE = {'med': 2.5, 'near': 2.5, 'spread': 8, 'nearSkill': 1.5, 'margin': 5, 'back': 12, 'backMax': 30, 'rec': 0.6, 'dry': 0.5}
DEFAULT_STAGES = ['veberod', 'lund', 'tollarp', 'ahus', 'bron', 'hisingen']

SETUP = """(sid) => {
  const S = STAGES.find(s => s.id === sid); if (!S) return null;
  CUP = null; TT = false; FREE = false; mirrorSel = false;
  state = 'menu'; buildWorld(S); resetRace(); return {laps: LAPS};
}"""

RACE = """([seed, scen, band, ov]) => {
  /* the same luck before and after: a small seeded generator in place of Math.random */
  let a = seed >>> 0; const rnd0 = Math.random;
  Math.random = () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61); return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  const sv = window.__bandSave || (window.__bandSave = {PACE: Object.assign({}, PACE),
    PP: typeof PLAYER_PACE !== 'undefined' ? Object.assign({}, PLAYER_PACE) : null});
  Object.assign(PACE, sv.PACE, ov.PACE || {}); if (sv.PP) Object.assign(PLAYER_PACE, sv.PP, ov.PLAYER_PACE || {});
  resetRace(); setMirror(false); placeOnGrid(); state = 'race'; raceTime = 0;
  for (const k of karts) k.lapStart = 0;
  const P = player;
  P.ai = true;                                   /* the AI drives the player's kart as a stand-in */
  if (scen.mul) { P.maxSpeed *= scen.mul; P.power *= scen.mul; P.gripOn *= scen.mul; }
  if (scen.caution) P.caution = scen.caution;
  if (!band) for (const k of karts) k.noBand = true;
  let rec = 0; const ask0 = askRecover;
  askRecover = k => { if (k.recoverT <= 0 && k !== P && state === 'race') rec++; ask0(k); };
  const bots = karts.filter(k => k !== P && !k.parked);
  const gaps = [], near = [], pp = [];
  let dry = 0, t = 0, step = 0, lastPlace = P.place, swaps = 0, frozeAt = null, backAt = null, flagT = null;
  while (t < 900 && karts.some(k => !k.done && !k.parked)) {
    if (scen.freeze && frozeAt === null && t >= scen.freeze[0]) { P.frozen = scen.freeze[1]; frozeAt = t; }
    for (const k of karts) { if (k.parked || k.done && k === P) continue;
      const ctl = aiControl(k); k.aiSteer = ctl.steer; drive(k, FIXED, ctl); if (k !== P && k.fuel <= 0) dry += FIXED; }
    separate(); t += FIXED; raceTime += FIXED; step++;
    if (step % 6 === 0) { checkPickups(); checkStamps(); updateHazards(FIXED * 6); aiItemLines(); order(); }
    if (step % 60 === 0 && !P.done) {
      const g = bots.filter(k => !k.done).map(gapTo);
      for (const x of g) gaps.push(Math.abs(x));
      near.push(g.filter(x => Math.abs(x) <= 3).length);
      pp.push(P.pace || 1);
      if (P.place !== lastPlace) { swaps++; lastPlace = P.place; }
      if (frozeAt !== null && backAt === null && t > frozeAt + scen.freeze[1] && g.some(x => Math.abs(x) <= 3)) backAt = t - frozeAt - scen.freeze[1];
    }
    if (P.done && flagT === null) flagT = t;
    if (flagT !== null && t > flagT + 40) break;
  }
  askRecover = ask0; P.ai = false; Math.random = rnd0;
  state = 'menu';                                /* the page's own frame loop must not drive on between races */
  for (const k of karts) k.noBand = false;
  const fin = bots.map(k => k.done ? k.total - P.total : 40);
  const srt = gaps.slice().sort((x, y) => x - y);
  return {done: P.done, total: P.total, place: P.place, swaps, rec, dry: +dry.toFixed(2), backAt: frozeAt === null ? null : backAt,
    finGaps: fin.map(x => +x.toFixed(2)),
    spread: Math.max(0, ...fin) - Math.min(0, ...fin),
    medGap: srt.length ? srt[srt.length >> 1] : 0,
    nearAny: near.filter(n => n > 0).length / Math.max(1, near.length),
    nearAvg: near.reduce((s, n) => s + n, 0) / Math.max(1, near.length),
    paceMax: Math.max(1, ...pp), paceAvg: pp.reduce((s, x) => s + x, 0) / Math.max(1, pp.length)};
}"""


def run(stages, races, json_out, ov=None):
    ov = ov or {}
    httpd = serve()
    url = f'http://127.0.0.1:{httpd.server_port}/index.html'
    errors, fails, report = [], [], {}
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
        for sid in stages:
            if page.evaluate(SETUP, sid) is None:
                fails.append(f'{sid}: no such stage')
                continue
            report[sid] = {}
            for name, scen in SCEN.items():
                runs = []
                for r in range(races):
                    seed = 1000 * (1 + stages.index(sid)) + r
                    on = page.evaluate(RACE, [seed, scen, True, ov])
                    off = page.evaluate(RACE, [seed, scen, False, ov])
                    runs.append({'on': on, 'off': off})
                    print(f"{sid:10} {name:6} #{r}  place {on['place']} (off {off['place']})  "
                          f"med|gap| {on['medGap']:5.1f} (off {off['medGap']:5.1f})  "
                          f"near {on['nearAny']*100:3.0f}% (off {off['nearAny']*100:3.0f}%)  "
                          f"finish {on['finGaps']}  swaps {on['swaps']}  rec {on['rec']} (off {off['rec']})  "
                          f"pace max {on['paceMax']:.3f}" + (f"  back {on['backAt']}" if name == 'crash' else ''),
                          flush=True)
                report[sid][name] = runs
        browser.close()
    httpd.shutdown()

    def agg(name, key, side='on'):
        v = [r[side][key] for s in report.values() for r in s.get(name, []) if r[side][key] is not None]
        return st.mean(v) if v else None

    print('\nsummary, catch-up on / off')
    for name in SCEN:
        print(f"  {name:6} med|gap| {agg(name, 'medGap'):5.2f} / {agg(name, 'medGap', 'off'):5.2f}   "
              f"bots within 3 s {agg(name, 'nearAvg'):.2f} / {agg(name, 'nearAvg', 'off'):.2f}   "
              f"finish spread {agg(name, 'spread'):5.1f} / {agg(name, 'spread', 'off'):5.1f} s   "
              f"place {agg(name, 'place'):.2f} / {agg(name, 'place', 'off'):.2f}   swaps {agg(name, 'swaps'):.1f}   "
              f"off-road {agg(name, 'rec'):.2f} / {agg(name, 'rec', 'off'):.2f}   bots dry {agg(name, 'dry'):.2f} / {agg(name, 'dry', 'off'):.2f} s   "
              f"player pace {agg(name, 'paceAvg'):.3f}")
    ok = lambda c, m: c or fails.append(m)  # noqa: E731
    ok(agg('avg', 'medGap') <= GATE['med'], f"avg: median gap {agg('avg', 'medGap'):.2f} s > {GATE['med']}")
    ok(agg('avg', 'nearAvg') >= GATE['near'], f"avg: only {agg('avg', 'nearAvg'):.2f} bots within 3 s")
    ok(agg('avg', 'spread') <= GATE['spread'], f"avg: the field finishes {agg('avg', 'spread'):.1f} s apart")
    for name in ('strong', 'weak'):
        ok(agg(name, 'nearAvg') >= GATE['nearSkill'], f"{name}: only {agg(name, 'nearAvg'):.2f} bots within 3 s")
    # the margin to the nearest bot: a win by, or a last place by
    win = [min(r['on']['finGaps']) for s in report.values() for r in s['strong'] if r['on']['place'] == 1]
    ok(not win or st.mean(win) <= GATE['margin'], f'strong: wins by {st.mean(win) if win else 0:.1f} s on average')
    lose = [-max(r['on']['finGaps']) for s in report.values() for r in s['weak'] if r['on']['place'] == 6]
    ok(not lose or st.mean(lose) <= GATE['margin'], f'weak: last by {st.mean(lose) if lose else 0:.1f} s on average')
    back = [r['on']['backAt'] for s in report.values() for r in s['crash']]
    ok(all(b is not None for b in back) and st.median(back) <= GATE['back'] and max(back) <= GATE['backMax'],
       f"crash: back with the field after {[b if b is None else round(b, 1) for b in back]} s")
    extra = st.mean(agg(n, 'rec') - agg(n, 'rec', 'off') for n in SCEN)
    ok(extra <= GATE['rec'], f'bots go off the road {extra:.2f} more a race with the catch-up on')
    # a chasing bot burns faster; the AI's fuel plan must keep up (bots can run dry without it too)
    dry = [st.mean(r[side]['dry'] for s in report.values() for n in s.values() for r in n) for side in ('on', 'off')]
    ok(dry[0] <= dry[1] + GATE['dry'], f'bots run dry {dry[0]:.2f} s a race with the catch-up on, {dry[1]:.2f} s without')
    ok(all(r['on']['done'] for s in report.values() for n in s.values() for r in n), 'a player stand-in did not finish')
    if json_out:
        with open(json_out, 'w') as f:
            json.dump(report, f, indent=1)
    for e in errors:
        print('JS error:', e)
    for m in fails:
        print('FAIL', m)
    if errors or fails:
        sys.exit(f'band audit FAILED ({len(fails)} gates, {len(errors)} JS errors)')
    print('band audit passed')


if __name__ == '__main__':
    args, stages, races, out, ov = sys.argv[1:], [], 2, None, {}
    while args:
        a = args.pop(0)
        if a == '--races':
            races = int(args.pop(0))
        elif a == '--set':                      # --set PACE.corner=1 : try a tuning without editing
            key, val = args.pop(0).split('=')
            obj, field = key.split('.')
            ov.setdefault(obj, {})[field] = float(val)
        elif a == '--json':
            out = args.pop(0)
        else:
            stages.append(a)
    run(stages or DEFAULT_STAGES, races, out, ov)
