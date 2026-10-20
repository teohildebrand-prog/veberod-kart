#!/usr/bin/env python3
"""Headless check of the Sibylla bonus event: the Extra Allt item and the Burgarbus.

    CHROMIUM=/path/to/chrome python3 tools/extra_allt_test.py

Starts a race on the Sibylla track and checks that the boxes there hand out Extra Allt (and
nowhere else), that the bag gives exactly three presses (ketchup, mustard, dressing) kept apart
by the gap, that each patch lies on the road behind the kart, that a kart sliding through one is
protected from the next, that the dropper is immune, and that the AI uses it. Then the burger
kart: in the car list, builds, the top bun lifts in a boost, the horn is the order bell.
Screenshots go to extra-*.png in the repo root (ignored by git). Exit 1 on any failure.
"""
import os
import sys
from pathlib import Path

from playwright.sync_api import sync_playwright

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from smoke_test import serve  # noqa: E402
from signature_test import HELPERS  # noqa: E402

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
        page.on('pageerror', lambda e: errors.append(str(e) + ' ' + (e.stack or '')[:300]))
        page.on('console', lambda m: m.type == 'error' and errors.append(m.text))
        page.route('**/*', lambda r: r.continue_() if r.request.url.startswith(url.rsplit('/', 1)[0])
                   else r.abort())
        page.goto(url, timeout=120000)
        page.fill('#nameBox', 'teo', timeout=10000)
        page.keyboard.press('Enter')
        page.click('#btnStart', timeout=10000)
        ev = page.evaluate
        # the Sibylla card is in the stage list, marked as a bonus track
        card = ev("""()=>{const si=STAGES.findIndex(s=>s.id==='sibylla'),k=SS.list.indexOf(si);
            const el=document.querySelector('.scard[data-k="'+k+'"]');return {k,bonus:!!el&&!!el.querySelector('.sc-bonus')}}""")
        check(card['k'] >= 0 and card['bonus'], f'Sibylla is in the stage list with the BONUSBANA ribbon {card}')
        ev("()=>{SS.hi=SS.list.indexOf(STAGES.findIndex(s=>s.id==='sibylla'));renderPreview();}")
        page.click('#btnStageGo', timeout=10000)
        page.click('#btnGo', timeout=10000)
        page.wait_for_timeout(5000)
        check(ev("()=>stage.id") == 'sibylla', 'the race is on the Sibylla track')
        ev(HELPERS)
        ev("()=>{DBG.god=true;for(const it of items)it.cool=99;}")   # no box refills a slot during the checks
        wait = page.wait_for_timeout

        def until(js, ms):
            for _ in range(ms // 250):
                if ev(js):
                    return True
                wait(250)
            return bool(ev(js))

        # the boxes: Extra Allt only here, never in the normal signature pool
        odds = ev("""()=>{const k=player,n=40000;let e=0;for(let i=0;i<n;i++)if(rollItem(k)[2]==='extraallt')e++;
            const was=stage;stage=STAGES.find(s=>s.id==='lund');let off=0;
            for(let i=0;i<n;i++)if(rollItem(k)[2]==='extraallt')off++;stage=was;
            let pick=0;for(let i=0;i<n;i++)if(pickSig(k)==='extraallt')pick++;
            return {here:e/n,off,pick,pool:sigPool().includes('extraallt')}}""")
        check(0.2 < odds['here'] < 0.24, f"Extra Allt from {odds['here']:.3f} of the boxes on Sibylla")
        check(odds['off'] == 0 and odds['pick'] == 0 and not odds['pool'], f'and never anywhere else {odds}')

        # three presses: ketchup, mustard, dressing, each a patch behind, kept apart
        page.keyboard.down('w')
        wait(3000)
        ev("()=>{for(const p of extras)scene.remove(p.g);extras.length=0;player.extraLeft=0;player.extraCool=0;}")
        ev("()=>T_use('extraallt')")
        a = ev("""()=>({n:extras.length,held:player.held,sig:player.heldSig,left:player.extraLeft,
            name:SIGS.extraallt.name,back:extras[0]&&((extras[0].x-player.x)*Math.sin(player.yaw)+(extras[0].z-player.z)*Math.cos(player.yaw))})""")
        check(a['n'] == 1 and a['held'] == 'sig' and a['sig'] == 'extraallt' and a['left'] == 2,
              f'first press: one patch, the bag stays in the slot {a}')
        check(a['name'] == 'EXTRA ALLT ×2', f"the slot counts down ({a['name']})")
        check(a['back'] is not None and a['back'] < -2, f"the patch lands behind ({a['back']})")
        ev("()=>useItem(player)")
        check(ev("()=>extras.length") == 1 and ev("()=>player.held==='sig'"),
              'a press straight after does nothing, the bag is kept')
        check(until("()=>player.extraCool===0", 3000), 'the gap runs out')
        ev("()=>useItem(player)")
        check(until("()=>player.extraCool===0", 3000), 'the gap runs out again')
        ev("()=>useItem(player)")
        b = ev("""()=>({n:extras.length,kinds:extras.map(p=>p.kind),held:player.held,
            gaps:extras.slice(1).map((p,i)=>Math.hypot(p.x-extras[i].x,p.z-extras[i].z)),
            road:extras.map(p=>{const i=nearestLocal(p.x,p.z,player.si);
              return Math.abs((p.x-sx[i])*rx[i]+(p.z-sz[i])*rz[i])+EXTRA.w<=HW+.01;})})""")
        check(b['n'] == 3 and b['kinds'] == [0, 1, 2] and b['held'] is None,
              f'three presses, ketchup, mustard, dressing, then the bag is gone {b}')
        check(all(g > 8 for g in b['gaps']), f"clear gaps between the patches {b['gaps']}")
        check(all(b['road']), f"every patch is inside the road {b['road']}")
        page.screenshot(path=str(ROOT / 'extra-patches.png'))
        page.keyboard.up('w')
        wait(300)

        # a kart sliding through one: slippery, and safe from the next one for a moment
        h = ev("""()=>{const o=T_rival(),p=extras[0],q=extras[1];o.sauced=0;o.slick=0;o.dive=0;
            const put=P=>{const i=nearestLocal(P.x,P.z,o.si);T_put(o,i,0,20);o.x=P.x;o.z=P.z;o.y=P.y;o.air=false;};
            put(p);updateExtra(0.016);const first={slick:o.slick,sauced:o.sauced};
            o.slick=0;put(q);updateExtra(0.016);const second=o.slick;
            o.sauced=0;o.slick=0;put(q);updateExtra(0.016);const later=o.slick;
            o.slick=0;o.sauced=0;o.air=true;put(q);o.air=true;updateExtra(0.016);const air=o.slick;
            player.slick=0;player.sauced=0;const px=player.x,pz=player.z,py=player.y;
            player.x=p.x;player.z=p.z;player.y=p.y;updateExtra(0.016);const own=player.slick;
            player.x=px;player.z=pz;player.y=py;o.slick=0;o.sauced=0;
            return {first,second,later,air,own}}""")
        check(h['first']['slick'] >= 0.5 and h['first']['sauced'] > 1, f"the patch makes a kart slide {h['first']}")
        check(h['second'] == 0, 'no second hit straight after: the guard is shared by all patches')
        check(h['later'] >= 0.5, 'once the guard runs out, a patch works again')
        check(h['air'] == 0 and h['own'] == 0, f"jumping over and the dropper are safe {h}")

        # the AI uses it when someone is behind, all three bottles
        ai = ev("""()=>{for(const p of extras)scene.remove(p.g);extras.length=0;
            const a=T_rival(),i=T_behind(10);a.held=null;a.extraLeft=0;a.extraCool=0;giveItem(a,'sig',1,'extraallt');a.roll=0;a.place=2;return i;}""")
        page.keyboard.down('w')
        check(until(f"()=>extras.filter(p=>p.owner===karts[{ai}]).length===3", 12000),
              f"the AI drops all three ({ev(f'()=>extras.filter(p=>p.owner===karts[{ai}]).length')})")
        page.keyboard.up('w')

        # the burger kart
        bus = ev("""()=>{const c=CARS.findIndex(r=>r.id==='burgarbus'),C=CARS[c];if(c<0)return null;
            const v=buildKart(0x1f4fb4,'teo','burgarbus');let n=0;v.root.traverse(o=>{if(o.isMesh)n++;});
            return {last:c===CARS.length-1,n,mul:C.mul,free:!C.sig}}""")
        check(bool(bus) and bus['last'] and bus['n'] > 60 and bus['free'],
              f'the Burgarbus is in the car list for everyone and builds {bus and bus["n"]} meshes')
        m = bus['mul'] if bus else {}
        check(m.get('power', 0) > 1 and m.get('gripOn', 0) > 1 and m.get('maxSpeed', 2) < 1,
              f'quick off the line, forgiving grip, modest top speed {m}')
        # the top bun lifts in a boost: drive it as the player's car
        lid = ev("""()=>{window.T_was=carSel;applyCar(CARS.findIndex(r=>r.id==='burgarbus'));
            return FREECARS.includes(carSel)&&player.v===playerRig;}""")
        page.keyboard.down('w')
        wait(2500)
        rest = ev("()=>{const l=player.v.root.getObjectByName('burgerLid');return l?l.rotation.x:null;}")
        ev("()=>{player.boost=3;}")
        wait(1200)
        up = ev("()=>{const l=player.v.root.getObjectByName('burgerLid');return l?l.rotation.x:null;}")
        page.screenshot(path=str(ROOT / 'extra-burgarbus.png'))
        page.keyboard.up('w')
        check(lid and rest is not None and up is not None and up < rest - 0.1,
              f'free to pick, and the top bun lifts in a boost ({rest} -> {up})')
        bell = ev("""()=>{let rang=0;const f=sibBell;window.sibBell=()=>{rang++;};try{honk();}finally{window.sibBell=f;}return rang;}""")
        check(bell == 1, 'the horn is the order bell')
        ev("()=>{applyCar(T_was);}")

        # a new race clears everything away
        left = ev("""()=>{T_use('extraallt');clearPowerups();
            return extras.length+karts.filter(k=>k.extraLeft||k.sauced||k.extraCool).length;}""")
        check(left == 0, f'clean-up leaves nothing behind ({left})')
        browser.close()
    httpd.shutdown()
    errors = [e for e in errors if 'net::ERR_FAILED' not in e]   # the web fonts, blocked offline
    for e in errors:
        print('JS error:', e)
    if errors or fails:
        sys.exit('extra allt test FAILED')
    print('extra allt test passed')


if __name__ == '__main__':
    main()
