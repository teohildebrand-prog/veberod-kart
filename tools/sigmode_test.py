#!/usr/bin/env python3
"""Headless check of Signaturläge: the toggle on the stage picker and in the cup setup, and that
every box (and every loose Spettekaka) then hands out only signature items, to the bots too.

    CHROMIUM=/path/to/chrome python3 tools/sigmode_test.py

Screenshots go to sigmode-*.png in the repo root (ignored by git). Exit 1 on any failure.
"""
import os
import sys
from pathlib import Path

from playwright.sync_api import sync_playwright

from smoke_test import serve

ROOT = Path(__file__).resolve().parent.parent

# 4000 box rolls for the player: the families that come out, and how many were Extra Allt on Sibylla
ROLLS = """(where)=>{const was=stage;if(where)stage=STAGES.find(S=>S.id===where);
  const fam={};let extra=0;
  for(let i=0;i<4000;i++){const r=rollItem(player);fam[r[0]]=(fam[r[0]]||0)+1;if(r[2]==='extraallt')extra++;}
  stage=was;return {fam,extra};}"""


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
        page.fill('#nameBox', 'teo', timeout=10000)
        page.keyboard.press('Enter')
        ev = page.evaluate
        wait = page.wait_for_timeout

        # a normal single race first: the toggle is off and boxes give the usual mix
        page.click('#btnStart', timeout=10000)
        check(ev("()=>document.getElementById('btnSsSig').textContent.includes('AV')"), 'stage picker: SIGNATURLÄGE: AV')
        page.click('#btnSsSig')
        check(ev("()=>sigModeSel&&document.getElementById('btnSsSig').classList.contains('on')"), 'click turns it on')
        page.keyboard.press('g')
        check(ev("()=>!sigModeSel"), 'G turns it off again')
        page.click('#btnStageGo', timeout=10000)
        page.click('#btnGo', timeout=10000)
        wait(1500)
        r = ev(ROLLS, None)
        check(not ev("()=>sigMode") and len(r['fam']) == 6 and 0.2 < r['fam'].get('sig', 0) / 4000 < 0.3,
              f'off: the usual mix {r}')

        # the same with the toggle on
        ev("()=>showStages()")
        page.click('#btnSsSig')
        page.screenshot(path=str(ROOT / 'sigmode-picker.png'))
        page.click('#btnStageGo', timeout=10000)
        wait(600)
        check(ev("()=>document.getElementById('vsMode').textContent.includes('SIGNATURLÄGE')"), 'driver select says SIGNATURLÄGE')
        page.click('#btnGo', timeout=10000)
        wait(1500)
        check(ev("()=>sigMode"), 'single race runs in Signaturläge')
        r = ev(ROLLS, None)
        check(r['fam'] == {'sig': 4000}, f'every box roll is a signature item {r}')
        r = ev(ROLLS, 'sibylla')
        check(set(r['fam']) == {'sig'} and 600 < r['extra'] < 1200, f'Sibylla still gives its Extra Allt {r}')
        reel = ev("""()=>{giveItem(player,'sig',1,'arne');const f=new Set();
            for(let i=0;i<=200;i++){player.roll=ROLLT*(1-i/201);f.add(slotFrame(player).fam);}
            player.roll=0;const end=slotFrame(player);player.held=null;return {fams:[...f],end:end.sid};}""")
        check(reel['fams'] == ['sig'] and reel['end'] == 'arne', f'roulette spins only signature items {reel}')
        # let the field race for a while: every bot that picks something up holds a signature item
        page.keyboard.down('w')
        seen = set()
        for _ in range(60):
            wait(250)
            seen |= set(ev("()=>karts.filter(k=>k.ai&&k.held).map(k=>k.held)"))
        page.keyboard.up('w')
        page.screenshot(path=str(ROOT / 'sigmode-race.png'))
        check(seen == {'sig'}, f'bots only ever hold signature items {sorted(seen)}')

        loose = ev("""()=>{const k=karts.find(k=>k.ai&&!k.parked);karts.forEach(o=>{o.held=null;});
            items.forEach(i=>{i.cool=1e9;});addItem('rocket',k.si,k.lat);const it=items[items.length-1];
            k.x=it.x;k.z=it.z;k.y=it.y;checkPickups();
            const got=[...new Set(karts.filter(o=>o.held).map(o=>o.held))];return got.length===1?got[0]:got.join();}""")
        check(loose == 'sig', f'a loose Spettekaka becomes a signature item ({loose})')

        # a cup: the setup tab stores it in the save, the brief and schedule say so, every round runs in it
        ev("()=>showMenu()")
        page.click('#btnCup', timeout=10000)
        page.click('#btnCupSig')
        check(ev("()=>cupSigSel&&document.getElementById('btnCupSig').textContent.includes('PÅ')"), 'cup setup: SIGNATURLÄGE: PÅ')
        page.screenshot(path=str(ROOT / 'sigmode-cup.png'))
        page.click('#btnCupNext', timeout=10000)
        page.click('#btnGo', timeout=10000)
        check(ev("()=>SAVE.cup.sig===true&&JSON.parse(localStorage.getItem('vk.save.v1')).cup.sig===true"), 'cup saves sig:true')
        check(ev("()=>document.getElementById('briefSub').textContent.includes('SIGNATURLÄGE')"), 'cup brief says SIGNATURLÄGE')
        ev("()=>{sigModeSel=false;showCupStages();}")
        check(ev("()=>document.getElementById('ssMode').textContent.includes('SIGNATURLÄGE')&&document.getElementById('btnSsSig').hidden"),
              'cup schedule says so, no picker toggle there')
        ev("()=>showBrief()")
        page.click('#btnBriefGo', timeout=10000)
        wait(1000)
        check(ev("()=>sigMode&&!!CUP"), 'cup round runs in Signaturläge though the picker toggle is off')

        # a time trial never has it
        ev("()=>{showMenu();sigModeSel=true;}")
        page.click('#btnTT', timeout=10000)
        check(ev("()=>document.getElementById('btnSsSig').hidden"), 'no toggle in a time trial')
        page.click('#btnStageGo', timeout=10000)
        page.click('#btnGo', timeout=10000)
        wait(1000)
        check(ev("()=>!sigMode"), 'time trial runs without it')
        browser.close()
    httpd.shutdown()

    errors = [e for e in errors if 'net::ERR_FAILED' not in e]  # blocked font requests
    for e in errors:
        print('JS ERROR', e)
    if errors or fails:
        print(f'{len(fails)} failed, {len(errors)} JS errors')
        sys.exit(1)
    print('all good')


if __name__ == '__main__':
    main()
