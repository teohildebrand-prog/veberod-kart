#!/usr/bin/env python3
"""Headless check of championship schedules and saved cups.

    CHROMIUM=/path/to/chrome python3 tools/cup_schedule_test.py [page.html]

A cup saved before schedules were stored (cup save v1) must finish on the rounds
it started with; a new cup uses today's schedule (no cup over four rounds:
Skånecupen and Sommarcupen four each, Finalen Rosengård then Raket-Rune).
Briefing, table, menu and stage select must agree, and each round's points go
in exactly once.
"""
import json
import os
import sys

from playwright.sync_api import sync_playwright

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from smoke_test import serve  # noqa: E402

KEY = 'vk.save.v1'
WON = {'cup': True, 'cup_osterlen': True, 'cup_kust': True, 'cup_vild': True,
       'win_osterlen': True, 'win_kust': True, 'win_vild': True}


def save(cup=None, unlock=None):
    return {'v': 1, 'stamps': {}, 'trophies': {}, 'unlock': unlock or {}, 'paint': None, 'cup': cup,
            'ghosts': {}, 'best': {}, 'routes': {}, 'pennant': None, 'pennantOn': True, 'part': None,
            'name': 'TEO'}


def v1cup(cup, rnd, rounds_done):
    return {'v': 1, 'cup': cup, 'cls': 'normal', 'char': 0, 'car': 0, 'rival': 2, 'round': rnd,
            'pts': [10 * rounds_done, 7 * rounds_done, 0, 0, 0, 0],
            'res': [[1, 2, 3, 4, 5, 6]] * rounds_done, 'applied': list(range(rounds_done)),
            'done': False, 'mirror': False}


# one race at a time: the player wins, scored twice to prove the second call is ignored
RACE = """() => {
  CUP = SAVE.cup; raceRound = CUP.round;
  karts.forEach((k, i) => k.place = i + 1);
  const before = CUP.pts[0];
  commitRound(); commitRound();
  return {gained: SAVE.cup.pts[0] - before, round: SAVE.cup.round, done: SAVE.cup.done};
}"""

STATE = """() => {
  const c = SAVE.cup; showBrief();
  const brief = document.getElementById('briefTitle').textContent;
  showMenu();
  const resume = document.getElementById('btnResumeCup').textContent;
  openStages(c);
  const list = SS.list.map(i => STAGES[i].id), head = document.getElementById('ssMode').textContent;
  showMenu();
  return {v: c.v, rounds: c.rounds, brief, resume, list, head,
          stored: JSON.parse(localStorage.getItem('vk.save.v1')).cup};
}"""


def run(browser, url, seed, check):
    page = browser.new_page(viewport={'width': 960, 'height': 600})
    errors = []
    page.on('pageerror', lambda e: errors.append(str(e)))
    page.route('**/*', lambda r: r.continue_() if r.request.url.startswith(url.rsplit('/', 1)[0])
               else r.abort())
    page.add_init_script(f'try{{if(!sessionStorage.getItem("seeded")){{sessionStorage.setItem("seeded","1");'
                         f'localStorage.setItem({json.dumps(KEY)},{json.dumps(json.dumps(seed))});}}}}catch(e){{}}')
    page.goto(url)
    page.wait_for_function('typeof SAVE!=="undefined"&&typeof showBrief==="function"', timeout=20000)
    page.wait_for_timeout(500)
    check(page)
    page.close()
    if errors:
        raise AssertionError(f'JS errors: {errors}')


def expect(cond, what):
    print(('ok   ' if cond else 'FAIL ') + what)
    if not cond:
        expect.failed = True


expect.failed = False


def old_skane(page):
    s = page.evaluate(STATE)
    six = ['veberod', 'lund', 'tollarp', 'horby', 'ahus', 'bron']
    expect(s['v'] == 2 and s['rounds'] == six, 'v1 Skånecupen migrates to v2 with its six rounds')
    expect(s['stored']['v'] == 2 and s['stored']['rounds'] == six, 'the migration is written to the save')
    expect('RUNDA 3 AV 6' in s['brief'] and s['brief'].startswith('TOLLARP'), 'old Skånecupen briefing: ' + s['brief'])
    expect(s['resume'].endswith('3/6'), 'old Skånecupen resume button: ' + s['resume'])
    expect(s['list'] == six and 'AV 6' in s['head'], 'old Skånecupen stage select shows six rounds')
    for n in range(2, 6):
        r = page.evaluate(RACE)
        expect(r['gained'] == 10, f'round {n + 1} scores 10 points once')
    expect(r['done'], 'old Skånecupen finishes after round 6')
    expect(page.evaluate('SAVE.trophies.normal') == 1, 'trophy keeps its old key (normal)')


def old_final(page):
    s = page.evaluate(STATE)
    expect(s['rounds'] == ['rune'], 'v1 Finalen keeps its one race')
    expect('RUNDA 1 AV 1' in s['brief'], 'old Finalen briefing: ' + s['brief'])
    r = page.evaluate(RACE)
    expect(r['gained'] == 10 and r['done'], 'old Finalen finishes after one race, points once')
    expect(page.evaluate('!!SAVE.unlock.win_final') and page.evaluate('SAVE.cup.newDriver') == 'rune',
           'winning old Finalen unlocks Raket-Rune')


def start_cup(page, cup_id):
    page.evaluate(f"""() => {{ showCupSetup(); pickCup(CUPS.findIndex(C => C.id === '{cup_id}'));
      cupSetup = true; CUP = null; goFromSelect(); }}""")


def new_final(page):
    start_cup(page, 'final')
    s = page.evaluate(STATE)
    expect(s['v'] == 2 and s['rounds'] == ['rosengard', 'rune'], 'new Finalen: Rosengård then Raket-Rune')
    expect(s['brief'].startswith('ROSENGÅRD') and 'RUNDA 1 AV 2' in s['brief'], 'new Finalen briefing: ' + s['brief'])
    expect('Raket-Rune' in page.evaluate("document.getElementById('briefBody').textContent"),
           'Raket-Rune is the champion from round 1')
    r = page.evaluate(RACE)
    expect(r['gained'] == 10 and r['round'] == 1 and not r['done'], 'Rosengård scores once, Finalen goes on')
    expect(not page.evaluate('!!SAVE.unlock.win_final'), 'no champion unlock after round 1')
    s = page.evaluate(STATE)
    expect(s['brief'].startswith('RAKET') and 'RUNDA 2 AV 2' in s['brief'], 'round 2 briefing: ' + s['brief'])
    r = page.evaluate(RACE)
    expect(r['gained'] == 10 and r['done'], 'Finalen finishes after round 2')
    expect(page.evaluate('!!SAVE.unlock.win_final') and page.evaluate('SAVE.cup.newDriver') == 'rune',
           'winning new Finalen unlocks Raket-Rune')
    expect(page.evaluate("SAVE.trophies.final_normal") == 1, 'Finalen trophy key unchanged (final_normal)')


def home_cup(page, cup_id, name, rounds, trophy):
    start_cup(page, cup_id)
    s = page.evaluate(STATE)
    expect(s['rounds'] == rounds, f'new {name}: {", ".join(rounds)}')
    expect('RUNDA 1 AV 4' in s['brief'] and s['resume'].endswith('1/4'), f'new {name} briefing and resume')
    for n in range(4):
        r = page.evaluate(RACE)
        expect(r['gained'] == 10 and r['round'] == n + 1, f'round {n + 1} scores once')
        if n == 0:
            page.evaluate('showTable()')
            sub = page.evaluate("document.getElementById('tableSub').textContent")
            expect('EFTER RUNDA 1 AV 4' in sub, 'table: ' + sub)
    expect(r['done'], f'new {name} finishes after round 4')
    expect(page.evaluate(f'SAVE.trophies["{trophy}"]') == 1, f'{name} trophy key {trophy}')
    # reload mid-cup: a v2 save is left alone
    page.evaluate("SAVE.cup.done=false;SAVE.cup.round=2;writeSave()")
    page.reload()
    page.wait_for_function('typeof SAVE!=="undefined"', timeout=20000)
    expect(page.evaluate('SAVE.cup.rounds.length') == 4 and page.evaluate('SAVE.cup.round') == 2,
           'a v2 save reloads unchanged')


def new_skane(page):
    home_cup(page, 'skane', 'Skånecupen', ['veberod', 'lund', 'tollarp', 'horby'], 'normal')


def new_sommar(page):
    home_cup(page, 'sommar', 'Sommarcupen', ['ahus', 'glimminge', 'ales', 'bron'], 'sommar_normal')


def west_cups(page):
    # a fresh save: Västgötacupen is open from the start, Göteborgscupen after a podium in it
    expect(page.evaluate("cupOpen(cupDef({cup:'vastgota'}))&&!cupOpen(cupDef({cup:'goteborg'}))"),
           'Västgötacupen open from the start, Göteborgscupen locked')
    for cup, rounds, champ, nxt in (('vastgota', ['lerum', 'boras', 'trollhattan'], 'regnmolnet', 'goteborg'),
                                    ('goteborg', ['avenyn', 'hisingen', 'ullevi'], 'hamnkranen', None)):
        start_cup(page, cup)
        s = page.evaluate(STATE)
        expect(s['rounds'] == rounds and s['list'] == rounds, f'{cup}: {", ".join(rounds)} in menu and stage select')
        expect('RUNDA 1 AV 3' in s['brief'] and s['resume'].endswith('1/3'), f'{cup} briefing and resume')
        expect(page.evaluate(f"CHAMPS['{champ}'].name") in page.evaluate("document.getElementById('briefBody').textContent").upper(),
               f'{champ} is the champion from round 1')
        for n in range(3):
            r = page.evaluate(RACE)
            expect(r['gained'] == 10 and r['round'] == n + 1, f'round {n + 1} scores once')
        u = page.evaluate("SAVE.cup.unlocked")
        expect(r['done'] and page.evaluate(f"!!SAVE.unlock.win_{cup}") and page.evaluate('SAVE.cup.newDriver') == champ,
               f'winning {cup} unlocks {champ}: {u}')
        expect(page.evaluate(f"charOpen(CHARS.findIndex(c=>c.id==='{champ}'))"), f'{champ} is playable')
        expect(not any('FINALEN' in x for x in u), 'the west does not invite you to Finalen')
        if nxt:
            expect(page.evaluate(f"cupOpen(cupDef({{cup:'{nxt}'}}))") and any('ÖPPNAD' in x for x in u), f'{nxt} opens')
    expect(not page.evaluate("cupOpen(cupDef({cup:'final'}))"), 'Finalen still needs the three Skåne championships')
    expect(page.evaluate("PAINTS.filter(p=>p.unlock==='win_vastgota'||p.unlock==='win_goteborg').every(p=>SAVE.unlock[p.unlock])"),
           'both west paints unlocked')


def every_cup(page):
    longest = page.evaluate('Math.max(...CUPS.map(C => C.rounds.length))')
    expect(longest <= 4, f'no cup has more than four rounds (longest {longest})')
    expect(page.evaluate("mirrorOpen(cupDef({cup:'sommar'}))"), 'Sommarcupen gets SPEGELCUPEN once a cup is finished')


def main():
    httpd = serve()
    page_name = sys.argv[1] if len(sys.argv) > 1 else 'index.html'
    url = f'http://127.0.0.1:{httpd.server_port}/{page_name}'
    with sync_playwright() as p:
        browser = p.chromium.launch(executable_path=os.environ.get('CHROMIUM') or None,
                                    args=['--use-gl=angle', '--use-angle=swiftshader',
                                          '--enable-unsafe-swiftshader'])
        run(browser, url, save(v1cup('skane', 2, 2), {'cup': True}), old_skane)
        run(browser, url, save(v1cup('final', 0, 0), WON), old_final)
        run(browser, url, save(None, WON), new_final)
        run(browser, url, save(None, WON), new_skane)
        run(browser, url, save(None, WON), new_sommar)
        run(browser, url, save(None, WON), every_cup)
        run(browser, url, save(None, {}), west_cups)
        browser.close()
    httpd.shutdown()
    if expect.failed:
        sys.exit('cup schedule test FAILED')
    print('cup schedule test passed')


if __name__ == '__main__':
    main()
