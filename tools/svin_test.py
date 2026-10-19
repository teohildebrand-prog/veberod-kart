#!/usr/bin/env python3
"""Headless check of Grisabonden Carl: driver select, the Svinexpress, his lines and SJU LASS SVIN.

    CHROMIUM=/path/to/chrome python3 tools/svin_test.py

Picks Carl, starts a race, lays food traps in front of him and lets the pigs loose: each pig
clears one trap (a Kafferep counts as one), seven at most, nothing else is touched, and the
herd stops short of an open fork. Screenshots go to sig-svin-*.png (ignored by git).
Exit 1 on any failure.
"""
import os
import sys
from pathlib import Path

from playwright.sync_api import sync_playwright

from smoke_test import serve

ROOT = Path(__file__).resolve().parent.parent

# a spot on the main road with no fork in the next 90 m, Carl parked on it, nothing else around
PARK = """(far)=>{const k=player;let at=-1;
  for(let i=0;i<N&&at<0;i+=7){let ok=true;
    for(const R of ALTS){if(fwdS(R.a,i)<(far/SEG)||fwdS(i,R.b)<12)ok=false;}
    if(ok)at=i;}
  if(at<0)return -1;
  k.rib=0;k.plan=0;k.si=at;k.x=sx[at];k.z=sz[at];k.yaw=Math.atan2(fx[at],fz[at]);k.vx=k.vz=0;
  k.y=groundK(k,k.x,k.z);k.mi=mappedIdx(k);k.lat=0;
  for(const o of karts)if(o!==k){const j=(at+Math.round(220/SEG))%N;o.x=sx[j]+rx[j]*4;o.z=sz[j]+rz[j]*4;o.si=j;}
  return at;}"""
LAY = """([at,list])=>list.map(([type,m,lat,temp])=>{const it=addItem(type,(at+Math.round(m/SEG))%N,lat);
  if(temp)it.temp=temp;if(type==='mine'){it.arm=0;it.owner=karts[1];}return items.indexOf(it);})"""


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
        for button in ('#btnStart', '#btnStageGo'):
            page.click(button, timeout=10000)
        ev = page.evaluate

        # driver select: Carl in the grid, his own vehicle, his line
        page.click('#cards .vcard[aria-label="GRISABONDEN CARL"]', timeout=10000)
        sel = ev("""()=>({name:document.getElementById('vsName').textContent,say:document.getElementById('vsSay').textContent,
            car:CARS[carSel].id,last:CARS[CARS.length-1].id,victorAt:CARS.findIndex(c=>c.id==='original'),
            open:charOpen(charSel),inGrid:GRID.includes(charSel)})""")
        check(sel['name'] == 'GRISABONDEN CARL' and sel['say'] == '”Carl. Hörby. Sju lass.”', f'select panel {sel}')
        check(sel['car'] == 'svinexpress' and sel['last'] == 'svinexpress' and sel['victorAt'] == 18,
              'Hörby Svinexpress picked, added at the end, earlier vehicles keep their places')
        check(sel['open'] and sel['inGrid'], 'Carl is open from the start and on the grid')
        for t, name in ((900, 'count'), (1900, 'climb'), (1100, 'hat')):
            page.wait_for_timeout(t)
            page.screenshot(path=str(ROOT / f'sig-svin-select-{name}.png'))
        page.click('#btnGo', timeout=10000)
        page.wait_for_timeout(5000)

        setup = ev("""()=>({guest:karts[GUEST_SLOT].cfg.kind,gname:karts[GUEST_SLOT].name,chores:player.chores,
            sig:player.sig,jump:sayLine('jump'),pass:sayLine('pass'),rival:CHARS[charSel].rival,
            stats:[player.maxSpeed,player.power,player.offRoad,player.burn].map(v=>+v.toFixed(3))})""")
        check(setup['guest'] == 'victor' and setup['gname'] == 'VICTOR', f'Victor comes along as a rival {setup}')
        check(setup['chores'] and setup['sig'] == 'carl', 'Rutinjobb on, SJU LASS SVIN is his item')
        check(setup['jump'] == 'HÅLL I LASTEN!' and setup['pass'] == 'Du får fila lite till på originalet.'
              and setup['rival'] == 'victor', 'jump and pass lines, rival Victor')
        ev("()=>honk()")

        # one of each trap on his line, plus things the herd must leave alone
        at = ev(PARK, 90)
        check(at >= 0, 'found a straight stretch without forks')
        idx = ev(LAY, [at, [['pie', 12, 0, 30], ['pie', 22, .4, 30], ['coffee', 25, 1.2, 30], ['mine', 34, -.5, 30],
                            ['fuel', 18, 0, 30], ['milk', 28, 0, 30], ['pie', 20, 6.5, 30], ['pie', 40, .2, 0]]])
        ev(f"()=>{{const a=items[{idx[1]}],b=items[{idx[2]}];a.pair=b;b.pair=a;}}")   # a Kafferep
        ev(f"()=>{{window._svin={idx}.map(i=>items[i]);}}")
        ev("()=>{dbgGive('sig','carl');useItem(player);}")
        check(ev("()=>!!player.herd&&player.herd.pigs.length===7"), 'seven pigs out')
        page.wait_for_timeout(1000)
        page.screenshot(path=str(ROOT / 'sig-svin-herd.png'))
        page.wait_for_timeout(2300)
        r = ev("""()=>_svin.map(it=>({type:it.type,there:items.includes(it),shown:it.mesh.visible,cool:+it.cool.toFixed(1)}))""")
        gone = lambda o: (not o['there']) or (not o['shown'] and o['cool'] > 0)
        check(gone(r[0]), f'Äppelpaj eaten {r[0]}')
        check(gone(r[1]) and gone(r[2]), f'Kafferep cleared, pie and coffee together {r[1]} {r[2]}')
        check(gone(r[3]), f'Tårtmina snuffed and gone {r[3]}')
        check(not gone(r[4]) and not gone(r[5]), f'fuel and milk untouched {r[4]} {r[5]}')
        check(not gone(r[6]), f'a pie outside the corridor stays {r[6]}')
        check(r[7]['there'] and gone(r[7]) and 5 < r[7]['cool'] <= 10, f"the road's own pie comes back later {r[7]}")
        page.wait_for_timeout(4000)
        check(ev("()=>!player.herd&&herds.length===0&&_svin.every(it=>!it.svin)"), 'herd gone afterwards, no claims left')

        # seven pigs, seven traps at most
        at = ev(PARK, 90)
        idx = ev(LAY, [at, [['pie', 8 + 4 * n, 0, 30] for n in range(9)]])
        ev(f"()=>{{window._svin={idx}.map(i=>items[i]);dbgGive('sig','carl');useItem(player);window._h=player.herd;}}")
        page.wait_for_timeout(4500)
        n = ev("()=>({cleared:_h.cleared,left:_svin.filter(it=>items.includes(it)&&it.mesh.visible&&!(it.cool>0)).length})")
        check(n['cleared'] == 7 and n['left'] == 2, f'nine pies, seven eaten {n}')
        page.wait_for_timeout(3000)

        # an open fork ahead: the herd stops short of it
        fork = ev("""()=>{const R=ALTS.find(R=>!(R.hidden&&!R.open));if(!R)return null;
            const k=player,i=((R.a-Math.round(20/SEG))%N+N)%N;
            k.rib=0;k.plan=0;k.si=i;k.x=sx[i];k.z=sz[i];k.yaw=Math.atan2(fx[i],fz[i]);k.vx=k.vz=0;
            k.y=groundK(k,k.x,k.z);k.mi=mappedIdx(k);k.lat=0;
            dbgGive('sig','carl');useItem(player);window._h=player.herd;return R.a;}""")
        if fork is None:
            print('skip fork check (no open fork on this stage)')
        else:
            page.wait_for_timeout(1500)
            f = ev(f"()=>({{why:_h.why,stop:_h.stop,before:fwdS({fork},_h.s)}})")
            check(f['stop'] and f['why'] == 'fork' and 0 < f['before'] < 8, f'herd stops before the fork {f}')
            page.wait_for_timeout(2000)

        # the AI plays it when there is food on its line
        ai = ev("""()=>{const a=karts.find(k=>k.ai&&!k.parked&&!k.rib);if(!a)return null;
            const i=Math.floor(a.mi);let ok=svinCap(a)>40/SEG;if(!ok)return 'fork';
            const it=addItem('pie',(i+Math.round(16/SEG))%N,clamp(a.lat,-HW*.7,HW*.7));it.temp=20;
            a.sig='carl';a.held='sig';a.heldLvl=1;a.roll=0;window._ai=a;return svinWork(a);}""")
        if ai in (None, 'fork'):
            print('skip AI check', ai)
        else:
            used = False
            for _ in range(10):
                page.wait_for_timeout(200)
                used = used or ev("()=>_ai.held!=='sig'||!!_ai.herd")
            check(ai >= 1 and used, f'the AI lets the pigs out at food ahead ({ai})')
        browser.close()
    httpd.shutdown()

    errors = [e for e in errors if 'net::ERR_FAILED' not in e]
    for e in errors:
        print('JS error:', e)
    if errors or fails:
        sys.exit('svin test FAILED')
    print('svin test passed')


if __name__ == '__main__':
    main()
