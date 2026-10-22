#!/usr/bin/env python3
"""Headless check of Bodil: the driver, her GRISÖRAT, BRÅK OCH TRÅK OCH SKRÅK and her quirk.

    CHROMIUM=/path/to/chrome python3 tools/bodil_test.py

Picks Bodil on the driver select (her line, quirk and own kart, the roll onto her back on the
turntable), races as her and checks the tackle: she goes for the nearest rival in reach, flies out and
back while her kart rolls on, the rival spins, tips, loses speed and its drift charge; a shield stops
her; out of reach, round the bend, over the verge, behind a container or on another route she has
nobody to go for and does a short pounce instead; a rival that gets away mid-air makes her miss; the
item is always spent. Then the AI uses it, Godisnosen takes boxes from further out, her bark horn, and
a new race clears everything. Screenshots go to bodil-*.png in the repo root (ignored by git).
Exit 1 on any failure.
"""
import os
import sys
from pathlib import Path

from playwright.sync_api import sync_playwright

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from smoke_test import serve  # noqa: E402
from signature_test import HELPERS  # noqa: E402

ROOT = Path(__file__).resolve().parent.parent

# step the tackle by hand until it is over (the game is paused); report what happened to the target
STEP = """(a)=>{const o=a==null?null:karts[a],v0=o?Math.hypot(o.vx,o.vz):0,p0=[player.x,player.z];
  let tip=0,out=false,warn=false;
  for(let i=0;i<180&&tackles.length;i++){updateTackles(1/60);if(o)tip=Math.max(tip,o.tipT||0);out=out||player.dogOut;warn=warn||player.dogWarn>0;}
  return {left:tackles.length,spun:o?o.spun:0,v:o&&v0?Math.hypot(o.vx,o.vz)/v0:1,charge:o?o.charge:0,tip,out,warn,
    back:!player.dogOut&&clock-player.dogBack<1,moved:Math.hypot(player.x-p0[0],player.z-p0[1]),
    me:player.spun,held:player.held,heldSig:player.heldSig};}"""


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
        ev = page.evaluate
        wait = page.wait_for_timeout

        # the roster: her item, her place on the grid, her own kart, everything builds
        check(ev("()=>!!SIGS.bodil&&!!SIGS.bodil.icon&&sigOf('bodil')==='bodil'&&SIGS.bodil.name==='BRÅK OCH TRÅK OCH SKRÅK'"),
              'BRÅK OCH TRÅK OCH SKRÅK registered as her signature item')
        check(ev("()=>{const i=CHARS.findIndex(c=>c.id==='bodil');return i===CHARS.length-1&&GRID.includes(i)&&"
                 "GRID.length===CHARS.length&&GRID.every(g=>g>=0)&&charOpen(i)}"),
              'on the driver grid, open from the start, last in the save order')
        check(ev("()=>{const c=CHARS.find(d=>d.id==='bodil'),r=CARS[carIndex(c.sig)];return r.id==='grisorat'&&r.sig==='bodil'&&"
                 "CARS.indexOf(r)===CARS.length-1}"),
              'GRISÖRAT is her own kart, last in the save order')
        n = ev("""()=>{const v=buildKart(0x2f8f9d,'bodil','grisorat');let n=0;v.root.traverse(o=>{if(o.isMesh)n++;});
            const D=v.root.getObjectByName('bodil').userData.bodil;
            v.anim.forEach(f=>f({boost:1,speed:30,aiSteer:1,ai:true},0.016));const boost=D.earL.rotation.x;
            for(let i=0;i<30;i++)v.anim.forEach(f=>f({boost:0,speed:35,aiSteer:1,ai:true},0.016));
            return {n,boost,corner:[D.earL.rotation.z,D.earR.rotation.z],sleep:typeof bodilSleep==='function'};}""")
        check(n['n'] > 70 and n['sleep'], f'driver and kart build and animate ({n["n"]} meshes)')
        check(n['boost'] > 0.3 and n['corner'][0] < -0.3 and n['corner'][1] < -0.1,
              f'ears stream back in a boost and swing out in a corner {n}')

        # the driver select: her line, the quirk, her own kart; on the turntable she ends up on her back
        page.click('#btnStart', timeout=10000)
        page.click('#btnStageGo', timeout=10000)
        wait(800)
        ev("()=>applyCharacter(CHARS.findIndex(c=>c.id==='bodil'))")
        wait(1200)
        sel = ev("""()=>({name:vsFull.textContent||vsName.textContent,say:vsSay.textContent,quirk:vsQuirk.textContent,car:vsCar.textContent,
            more:vsMore.textContent})""")
        page.screenshot(path=str(ROOT / 'bodil-select.png'))
        check(sel['name'] == 'BODIL' and 'påse' in sel['say'] and sel['quirk'] == 'GODISNOSEN'
              and sel['car'] == 'GRISÖRAT' and 'BRÅK OCH TRÅK OCH SKRÅK' in sel['more'], f'select card {sel}')
        asleep = False
        for _ in range(40):
            wait(250)
            if ev("()=>{const D=player.v.root.getObjectByName('bodil').userData.bodil;return D.lids[0].visible&&D.body.rotation.x<-1.3}"):
                asleep = True
                break
        wait(600)
        page.screenshot(path=str(ROOT / 'bodil-select-asleep.png'))
        check(asleep, 'on the turntable she rolls onto her back and falls asleep')
        page.click('#btnGo', timeout=10000)
        wait(1200)
        grid = ev("""()=>{const D=player.v.root.getObjectByName('bodil').userData.bodil;
            return {state,eyes:D.eyes[0].scale.y,lids:D.lids[0].visible};}""")
        check(grid['state'] != 'grid' or grid['eyes'] > 1.2, f'at the starting lights: big innocent eyes {grid}')
        wait(3800)
        ev(HELPERS)
        ev("()=>{DBG.god=true;}")
        check(ev("()=>CHARS[charSel].id==='bodil'&&player.nose&&player.sig==='bodil'&&CARS[carSel].id==='grisorat'"),
              'racing as Bodil in her own Grisörat, quirk on')
        page.keyboard.down('w')
        wait(3000)

        # a tackle in the live race, for the pictures
        ev("()=>{const a=T_behind(14);clearTackles();T_use('bodil');}")
        for name, ms in (('bodil-warn', 150), ('bodil-leap', 420), ('bodil-hit', 500)):
            wait(ms)
            page.screenshot(path=str(ROOT / f'{name}.png'))
        page.keyboard.up('w')

        # from here the game is paused and the test steps the tackle itself
        ev("""()=>{paused=true;clearTackles();karts.forEach((k,i)=>{if(k!==player)T_put(k,player.si-80-i*8,0,20);});
            T_put(player,player.si,0,25);
            window.T_ahead=(m,lat)=>{const o=karts.find(k=>k.ai&&!k.parked);karts.forEach((k,i)=>{if(k!==player&&k!==o)T_put(k,player.si-80-i*8,0,20);});o.charge=1.5;o.drift=1;o.tipT=0;
              T_put(o,player.si+Math.round(m/SEG),lat||0,25);return o.idx;};}""")
        t = ev("""()=>{const a=T_ahead(10),b=karts.filter(k=>k.ai&&!k.parked)[1];T_put(b,player.si+Math.round(18/SEG),0,25);
            return {near:tackleTarget(player)===karts[a],reach:TACKLE.reach};}""")
        check(t['near'], f'she picks the nearest rival in reach {t}')
        a = ev("()=>{const a=T_ahead(10);T_use('bodil');return a;}")
        r = ev(STEP, a)
        check(r['warn'] and r['out'] and r['left'] == 0 and r['back'], f'a bark and a crouch, out of the seat and back in {r}')
        check(r['spun'] > 0.4 and r['v'] < 0.85 and r['charge'] == 0 and r['tip'] > 0.3,
              f'the rival tips into a spin, loses speed and its drift charge {r}')
        check(r['me'] == 0 and r['moved'] < 0.01 and r['held'] is None and r['heldSig'] is None,
              f'no teleport for her kart, she is never hit herself, the item is spent {r}')
        s = ev("()=>{const a=T_ahead(10),o=karts[a];o.shield=5;o.pans=0;T_use('bodil');return a;}")
        r = ev(STEP, s)
        check(r['spun'] == 0 and ev(f"()=>karts[{s}].shield") == 0, f'a shield blocks her {r}')
        for what, js in (
                ('out of reach', "T_ahead(40)"),
                ('over the verge', "T_ahead(8,HW+6)"),
                ('on another route', "(()=>{const a=T_ahead(10);karts[a].rib=1;return a;})()"),
                ('behind a container', "(()=>{const a=T_ahead(12),o=karts[a];sigWalls.push({T:1,solid:true,x:(o.x+player.x)/2,"
                                       "z:(o.z+player.z)/2,len:5});return a;})()")):
            a = ev(f"()=>{{const a={js};return [a,tackleTarget(player)===null];}}")
            ev("()=>T_use('bodil')")
            r = ev(STEP, a[0])
            check(a[1] and r['spun'] == 0 and r['left'] == 0 and r['held'] is None,
                  f'{what}: nobody to tackle, a short pounce, item spent {r}')
            ev("()=>{for(let i=sigWalls.length-1;i>=0;i--)if(sigWalls[i].T)sigWalls.splice(i,1);karts.forEach(k=>{if(k.ai)k.rib=0;});}")
        ev("()=>{for(const k of karts)if(k.ai){k._p=k.parked;k.parked=true;}}")
        ev("()=>T_use('bodil')")
        r = ev(STEP, None)
        check(r['left'] == 0 and r['held'] is None and r['heldSig'] is None, f'alone on the road: a pounce and the item is gone {r}')
        ev("()=>{for(const k of karts)if(k.ai)k.parked=k._p;}")
        g = ev("""()=>{const a=T_ahead(14),o=karts[a];T_use('bodil');for(let i=0;i<30;i++)updateTackles(1/60);
            const was=tackles[0]&&tackles[0].phase;T_put(o,o.si+Math.round(60/SEG),0,25);return [a,was];}""")
        r = ev(STEP, g[0])
        check(g[1] == 'air' and r['spun'] == 0 and r['left'] == 0, f'a rival that gets away mid-air makes her miss {g} {r}')

        # the AI uses it with a rival in reach
        u = ev("""()=>{clearTackles();const o=karts.find(k=>k.ai&&!k.parked);T_put(o,player.si,0,25);T_put(player,o.si+Math.round(9/SEG),0,25);
            o.held='sig';o.heldSig='bodil';o.heldLvl=1;o.roll=0;o.spun=0;o.fartT=0;o.frozen=0;
            aiItemLines();return {used:tackles.some(t=>t.owner===o),held:o.held};}""")
        check(u['used'], f'the AI tackles with a rival in reach {u}')
        # Godisnosen: a box 3.2 m to the side is hers, not anyone else's
        b = ev("""()=>{clearTackles();const it=items.find(i=>i.type==='box'),o=karts.find(k=>k.ai&&!k.parked),out=[];
            for(const k of [player,o]){k.held=null;it.cool=0;k.x=it.x+3.2;k.z=it.z;k.y=it.y;checkPickups();out.push(!!k.held);k.held=null;k.roll=0;}
            return out;}""")
        check(b == [True, False], f'Godisnosen: she takes a box from 3.2 m, others do not {b}')
        check(ev("()=>{player.held=null;honk();return typeof woof==='function'}"), 'the Grisörat horn barks')

        # a new race clears everything away
        left = ev("()=>{T_use('bodil');player.tipT=.5;clearPowerups();return tackles.length+karts.filter(k=>k.tipT>0||k.dogOut).length}")
        check(left == 0, f'clean-up leaves nothing behind ({left})')
        browser.close()
    httpd.shutdown()

    errors = [e for e in errors if 'net::ERR_FAILED' not in e]
    for e in errors:
        print('JS error:', e)
    if errors or fails:
        sys.exit('Bodil test FAILED')
    print('Bodil test passed')


if __name__ == '__main__':
    main()
