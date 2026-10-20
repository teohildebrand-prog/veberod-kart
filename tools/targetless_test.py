#!/usr/bin/env python3
"""Headless check that every item can be spent with nobody to aim at, and of the AI catch-up.

    CHROMIUM=/path/to/chrome python3 tools/targetless_test.py

Alone on the road (every rival parked), each forward attack and each signature item fires and
leaves the slot empty. A bot holding an item it has no use for spends it after AI_HOLD. The
catch-up pace follows the gap to the player in seconds: none inside PACE.dead, a push behind,
an easing ahead, never past the caps. Exit 1 on any failure.
"""
import os
import sys

from playwright.sync_api import sync_playwright

from smoke_test import serve


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
        for button in ('#btnStart', '#btnStageGo', '#btnGo'):
            page.click(button, timeout=10000)
        page.wait_for_timeout(5000)
        ev = page.evaluate
        ev("()=>{DBG.god=true;}")

        # alone on the road: everything fires and the slot is free again
        ev("()=>{for(const k of karts)if(k.ai){k._p=k.parked;k.parked=true;}}")
        for lvl, name in ((1, 'spettekaka'), (2, 'spettigare kaka'), (3, 'semmelväggen')):
            r = ev(f"""()=>{{clearPowerups();dbgGive('rocket',{lvl});player.roll=0;useItem(player);
                return [player.held,rockets.length+hooks.length+walls.length];}}""")
            check(r == [None, 1], f'{name}: fires straight ahead with nobody there {r}')
        r = ev("""()=>{clearPowerups();dbgGive('rocket',2);player.roll=0;useItem(player);
            for(let i=0;i<120&&hooks.length;i++)updateHooks(1/60);return [hooks.length,player.launch||0];}""")
        check(r == [0, 0], f'a hook that bites nothing gives no launch {r}')
        ids = ev("()=>Object.keys(SIGS).filter(id=>!SIGS[id].event)")
        for sid in ids:
            r = ev(f"""()=>{{clearPowerups();player.rib=0;player.held=null;dbgGive('sig','{sid}');player.roll=0;useItem(player);
                return [player.held,player.heldSig];}}""")
            check(r == [None, None], f'{sid}: spent with nobody to hit {r}')
        ev("()=>{clearPowerups();player.held=null;for(const k of karts)if(k.ai)k.parked=k._p;}")

        # a box with a full slot leaves the held item alone
        r = ev("""()=>{const b=items.find(it=>it.type==='box');giveItem(player,'pie',2);player.roll=0;b.cool=0;
            player.x=b.x;player.z=b.z;player.y=b.y;checkPickups();return [player.held,player.heldLvl];}""")
        check(r == ['pie', 2], f'a box does not replace the item you hold {r}')
        ev("()=>{player.held=null;}")

        # a leading bot with nothing to aim at spends its item after AI_HOLD
        r = ev("""()=>{const a=karts.find(k=>k.ai&&!k.parked);for(const k of karts)if(k!==a){k._p=k.parked;k.parked=true;}
            clearPowerups();giveItem(a,'shield',1);a.roll=0;a.shield=0;a.pans=0;a.heldAt=raceTime;aiItemLines();const early=a.held;
            a.heldAt=raceTime-AI_HOLD-1;aiItemLines();const late=a.held;
            for(const k of karts)if(k!==a)k.parked=k._p;return [early,late];}""")
        check(r[0] == 'shield' and r[1] is None, f'a bot keeps a useless item a while, then spends it {r}')

        # catch-up from the time gap
        r = ev("""()=>{const a=karts.find(k=>k.ai&&!k.parked);const sv=[player.marks,a.marks,player.progress,a.progress,a.rival];
            a.rival=true;
            const set=(gp,ga,tp,ta)=>{player.progress=gp;a.progress=ga;player.marks=[];a.marks=[];
              for(let i=0;i*MARK<=gp;i++)player.marks.push(raceTime-tp);
              for(let i=0;i*MARK<=ga;i++)a.marks.push(raceTime-ta);};
            const out={};
            set(400,396,1,0);out.close=[gapTo(a),paceTarget(a)];
            set(400,200,30,0);out.behind=[gapTo(a),paceTarget(a)];
            set(200,400,0,30);out.ahead=[gapTo(a),paceTarget(a)];
            [player.marks,a.marks,player.progress,a.progress,a.rival]=sv;return out;}""")
        print('pace', r)
        check(r['close'][1] == 1, f'inside the dead zone: normal pace {r["close"]}')
        check(r['behind'][0] > 10 and 1.04 < r['behind'][1] <= 1 + 0.05 * 1.25, f'far behind: pushes, capped {r["behind"]}')
        check(r['ahead'][0] < -10 and abs(r['ahead'][1] - 0.96) < 1e-6, f'far ahead: eases off, capped {r["ahead"]}')
        browser.close()
    httpd.shutdown()
    errors = [e for e in errors if 'net::ERR_FAILED' not in e]
    for e in errors:
        print('JS error:', e)
    if errors or fails:
        sys.exit(f'targetless test FAILED ({len(fails)} checks, {len(errors)} JS errors)')
    print('targetless test passed')


if __name__ == '__main__':
    main()
