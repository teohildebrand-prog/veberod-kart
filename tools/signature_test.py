#!/usr/bin/env python3
"""Headless check of the signature items (Arne's tow rope, Björn's bike, Amanda's plan).

    CHROMIUM=/path/to/chrome python3 tools/signature_test.py

Starts a race, gives each item through the debug hooks, uses it and checks its effect.
Screenshots go to sig-*.png in the repo root (ignored by git). Exit 1 on any failure.
"""
import os
import sys
from pathlib import Path

from playwright.sync_api import sync_playwright

from smoke_test import serve

ROOT = Path(__file__).resolve().parent.parent


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

        # the box: about one in ten for a driver with an item, never for one without
        share = ev("""()=>{const k=player,was=k.sig;k.sig='arne';let n=0;
            for(let i=0;i<20000;i++)if(rollItem(k)[0]==='sig')n++;
            k.sig=null;let m=0;for(let i=0;i<2000;i++)if(rollItem(k)[0]==='sig')m++;k.sig=was;return [n/20000,m];}""")
        check(0.08 < share[0] < 0.12 and share[1] == 0, f'box odds {share[0]:.3f}, without a signature {share[1]}')
        names = ev("()=>['arne','bjorn','amanda'].map(id=>CHARS.find(c=>c.id===id)).map(c=>sigOf(c.id))")
        check(names == ['arne', 'bjorn', 'amanda'], f'drivers with an item: {names}')

        # Bogserlinan: let the field go past, then hook the kart ahead
        page.wait_for_timeout(4000)
        page.keyboard.down('w')
        page.wait_for_timeout(1500)
        # put Arne a short way behind the first AI, at its pace, so there is someone to hook
        ev("""()=>{const a=karts.find(k=>k.ai&&!k.parked&&!k.rib),k=player,i=((Math.floor(a.si)-14)%N+N)%N;
            k.rib=0;k.plan=0;k.si=i;k.x=sx[i]+rx[i]*a.lat;k.z=sz[i]+rz[i]*a.lat;k.yaw=Math.atan2(fx[i],fz[i]);
            k.vx=fx[i]*a.speed;k.vz=fz[i]*a.speed;k.y=groundK(k,k.x,k.z);k.mi=mappedIdx(k);dbgGive('sig','arne');}""")
        check(ev("()=>itemName(player.held,1)") == 'BOGSERLINAN', 'HUD name BOGSERLINAN')
        ahead = ev("()=>!!nextAhead(player.si,player,TOW.home)[0]")
        ev("()=>useItem(player)")
        seen = {'bite': False, 'tow': False, 'towed': False}
        for _ in range(30):
            page.wait_for_timeout(100)
            s = ev("()=>({bite:hooks.some(h=>h.tow&&h.target),tow:player.tow>0,towed:karts.some(o=>o.towed>0)})")
            for key in seen:
                seen[key] = seen[key] or s[key]
            if seen['tow'] and seen['bite']:
                page.screenshot(path=str(ROOT / 'sig-tow.png'))
                break
        if ahead:
            check(seen['bite'] and seen['tow'] and seen['towed'], f'tow rope bites and tows {seen}')
        else:
            print('skip tow (nobody ahead in reach)')
        page.wait_for_timeout(3000)
        check(ev("()=>!hooks.some(h=>h.tow)&&player.tow===0"), 'tow rope gone afterwards')

        # Cykla mer!: no fuel, nothing hits, vehicle swapped for the bike
        ev("()=>{dbgGive('sig','bjorn');useItem(player);}")
        page.wait_for_timeout(400)
        b = ev("""()=>({bike:player.bike>0,shown:player.bikeG.visible,
            hidden:player.v.root.children.filter(c=>c!==player.bikeG).every(c=>!c.visible),
            fuel:player.fuel,immune:blockHit(player)})""")
        page.wait_for_timeout(1000)
        page.screenshot(path=str(ROOT / 'sig-bike.png'))
        fuel2 = ev("()=>player.fuel")
        check(b['bike'] and b['shown'] and b['hidden'], f'bike on, vehicle hidden {b}')
        check(b['immune'], 'bike blocks hits')
        check(abs(fuel2 - b['fuel']) < 0.01, f'no fuel while pedalling ({b["fuel"]:.2f} -> {fuel2:.2f})')
        page.wait_for_timeout(3500)
        b2 = ev("()=>({bike:player.bike,shown:player.bikeG.visible,lean:player.v.lean.visible})")
        check(b2['bike'] == 0 and not b2['shown'] and b2['lean'], f'back in the vehicle {b2}')

        # Färdplanen: the line shows, and sitting on it counts
        ev("()=>{dbgGive('sig','amanda');useItem(player);}")
        page.wait_for_timeout(300)
        pl = ev("""()=>{const L=[];for(let i=0;i<N;i++)L.push(planLat(i));
            return {shown:player.planG.visible,min:Math.min(...L),max:Math.max(...L),hw:HW}}""")
        page.screenshot(path=str(ROOT / 'sig-plan.png'))
        check(pl['shown'] and -pl['hw'] < pl['min'] < 0 < pl['max'] < pl['hw'], f'plan line inside the road {pl}')
        state = ev("()=>({rib:player.rib,air:player.air})")
        print('     before the line check', state)
        on = ev("""()=>{const k=player;if(k.rib)return 'skip';const i=k.si,L=planLat(i);k.x=sx[i]+rx[i]*L;k.z=sz[i]+rz[i]*L;k.lat=L;
            updateSigs(0.016);const a=k.onPlan;k.lat=L+PLAN.w+1;updateSigs(0.016);return [a,k.onPlan];}""")
        if on == 'skip':
            print('skip line check (in a lane)')
        else:
            check(on == [True, False], f'on the line counts, off it not {on}')
        page.wait_for_timeout(5500)
        check(ev("()=>!player.planG.visible&&!player.onPlan"), 'plan gone after five seconds')

        # the AI Amanda plays hers
        ai = ev("""()=>{const a=karts.find(k=>k.ai&&k.sig==='amanda');if(!a)return null;
            a.held='sig';a.heldLvl=1;a.roll=0;return a.idx;}""")
        if ai is None:
            print('skip AI (no AI Amanda in this race)')
        else:
            page.wait_for_timeout(1500)
            check(ev(f"()=>karts[{ai}].fplan>0||karts[{ai}].held!=='sig'"), 'AI Amanda uses Färdplanen')
        page.keyboard.up('w')
        browser.close()
    httpd.shutdown()

    errors = [e for e in errors if 'net::ERR_FAILED' not in e]
    for e in errors:
        print('JS error:', e)
    if errors or fails:
        sys.exit('signature test FAILED')
    print('signature test passed')


if __name__ == '__main__':
    main()
