#!/usr/bin/env python3
"""Headless check of Weiron i ottan: the driver, his HISINGEN SKIFTSEX, CEMENTBLANDAREN and his quirk.

    CHROMIUM=/path/to/chrome python3 tools/weiron_test.py

Picks Weiron on the driver select (his line, quirk and own vehicle, the watch-check on the
turntable), races as him and checks CEMENTBLANDAREN: thrown forward faster than the karts, it
bounces and swings from side to side; every kart it lands on gets cement (a spin, lost speed, a lump
that drags), it sails over a kart at the top of a bounce, a shield takes it, it never hits him, and
it bursts after a while. Then the AI throws it, Stämpla in pushes him after each item (not when the
item comes straight back), the shift-whistle horn, and a new race clears everything.
Screenshots go to weiron-*.png in the repo root (ignored by git). Exit 1 on any failure.
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
        ev = page.evaluate
        wait = page.wait_for_timeout

        # the roster: his item, his place on the grid, his own vehicle, everything builds
        check(ev("()=>!!SIGS.weiron&&!!SIGS.weiron.icon&&sigOf('weiron')==='weiron'&&SIGS.weiron.name==='CEMENTBLANDAREN'"),
              'CEMENTBLANDAREN registered as his signature item')
        check(ev("()=>{const i=CHARS.findIndex(c=>c.id==='weiron');return i>CHARS.findIndex(c=>c.id==='domaren')&&GRID.includes(i)&&"
                 "GRID.length===CHARS.length&&GRID.every(g=>g>=0)&&charOpen(i)}"),
              'on the driver grid, open from the start, last in the save order')
        check(ev("()=>{const c=CHARS.find(d=>d.id==='weiron'),r=CARS[carIndex(c.sig)];return r.id==='skiftsex'&&r.sig==='weiron'&&"
                 "CARS.indexOf(r)>CARS.findIndex(c=>c.id==='burgarbus')&&!/kenta/i.test(JSON.stringify(c)+JSON.stringify(r))}"),
              'HISINGEN SKIFTSEX is his own vehicle, last in the save order, and no Kenta anywhere')
        m = ev("""()=>{const r=CARS.find(c=>c.id==='skiftsex').mul;return r;}""")
        check(m['power'] > 1.05 and m['gripOn'] > 1.04 and m['maxSpeed'] < 1 and m['offRoad'] == 1
              and m['spinResist'] < 1 and m['burn'] > 1.1, f'Skiftsex: strong pull and grip, modest top speed, short spins, thirsty {m}')
        n = ev("""()=>{const v=buildKart(0xe0a81a,'weiron','skiftsex');let n=0;v.root.traverse(o=>{if(o.isMesh)n++;});
            v.anim.forEach(f=>f({boost:1,usedAt:3,speed:20},0.016));return n;}""")
        check(n > 60, f'driver and vehicle build and animate ({n} meshes)')

        # the driver select: his line, the quirk, his own vehicle; he checks his watch on the turntable
        page.click('#btnStart', timeout=10000)
        page.click('#btnStageGo', timeout=10000)
        wait(800)
        ev("()=>applyCharacter(CHARS.findIndex(c=>c.id==='weiron'))")
        wait(1200)
        sel = ev("""()=>({name:vsName.textContent,say:vsSay.textContent,quirk:vsQuirk.textContent,car:vsCar.textContent,
            more:vsMore.textContent})""")
        page.screenshot(path=str(ROOT / 'weiron-select.png'))
        check(sel['name'] == 'WEIRON I OTTAN' and 'snabbare båtar' in sel['say'] and sel['quirk'] == 'STÄMPLA IN'
              and sel['car'] == 'HISINGEN SKIFTSEX' and 'CEMENTBLANDAREN' in sel['more'], f'select card {sel}')
        wait(2200)
        page.screenshot(path=str(ROOT / 'weiron-select-grid.png'))
        page.click('#btnGo', timeout=10000)
        wait(5000)
        ev(HELPERS)
        ev("()=>{DBG.god=true;window.T_mine=()=>{clearMixers();};}")
        check(ev("()=>CHARS[charSel].id==='weiron'&&player.stamp&&player.sig==='weiron'&&CARS[carSel].id==='skiftsex'"),
              'racing as Weiron in his own Skiftsex, quirk on')
        page.keyboard.down('w')
        wait(3500)

        # a throw in the live race, for the pictures: an AI just up the road, the mixer on its way
        a = ev("()=>{const a=T_behind(-25);T_mine();T_put(karts.find(k=>k.ai&&!k.parked&&k.idx!==a),player.si+90,0,20);"
               "T_put(karts[a],player.si+16,0,14);T_use('weiron');return a;}")
        wait(450)
        page.screenshot(path=str(ROOT / 'weiron-mixer.png'))
        wait(900)
        page.screenshot(path=str(ROOT / 'weiron-mixer-hit.png'))

        # from here the game is paused and the test steps the mixer itself
        page.keyboard.up('w')
        ev("()=>{paused=true;T_mine();karts.forEach((k,i)=>{if(k!==player)T_put(k,player.si-60-i*8,0,20);});T_put(player,player.si,0,25);}")
        m = ev("""()=>{T_use('weiron');const m=mixers[0];if(!m)return null;const s0=m.s,ys=[],lats=[];
            for(let i=0;i<120;i++){updateMixers(1/60);const g=roadPt(Math.floor(m.s),m.lat,0,new THREE.Vector3()).y;ys.push(m.y-g);lats.push(m.lat);}
            return {owner:m.owner===player,speed:m.speed,moved:sigWrap(Math.floor(m.s)-Math.floor(s0))*SEG,
              lo:Math.min(...ys),hi:Math.max(...ys),left:Math.min(...lats),right:Math.max(...lats),bounces:m.bounce,HW}}""")
        check(m is not None and m['owner'] and m['speed'] >= 34 and m['moved'] > 50,
              f'thrown forward, faster than the karts {m}')
        check(m is not None and m['lo'] < 1.8 and m['hi'] > 4.2 and m['bounces'] >= 2,
              f'it bounces: down to the road and high in the air {m}')
        check(m is not None and m['left'] < -0.4 * m['HW'] and m['right'] > 0.4 * m['HW'],
              f'it swings from one side of the road to the other {m}')

        # it lands on a kart: a spin, lost speed, a lump of cement that drags; then on the next one too
        hit = ev("""()=>{const m=mixers[0],H=MIX.hop,res=[];
            for(const o of karts.filter(k=>k.ai&&!k.parked).slice(0,2)){o.shield=0;o.pans=0;o.spun=0;o.cement=0;
              m.t=H*2-0.002;updateMixers(0.001);                 /* just before a landing */
              T_put(o,Math.floor(m.s),m.lat,25);o.x=m.x;o.z=m.z;
              const v0=Math.hypot(o.vx,o.vz);updateMixers(0.002);drawMixers();
              res.push({hit:m.hit.has(o),spun:o.spun,cement:o.cement,v:Math.hypot(o.vx,o.vz)/v0,
                lump:!!o.lumpG&&o.lumpG.visible,top:mixTop(o)});}   /* the cement alone: a bot may still have its mates along */
            return res;}""")
        check(len(hit) == 2 and all(h['hit'] and h['spun'] > 0.5 and h['cement'] > 2 and h['v'] < 0.6 and h['lump']
                                    and h['top'] < 0.9 for h in hit), f'every kart it lands on gets cement: spin, speed, a lump {hit}')
        over = ev("""()=>{const m=mixers[0],H=MIX.hop,o=karts.filter(k=>k.ai&&!k.parked)[2];o.shield=0;o.pans=0;
            m.t=H*2.5;updateMixers(0.001);T_put(o,Math.floor(m.s),m.lat,25);o.x=m.x;o.z=m.z;updateMixers(0.001);
            const over=!m.hit.has(o);
            o.shield=5;m.t=H*2-0.002;updateMixers(0.001);T_put(o,Math.floor(m.s),m.lat,25);o.x=m.x;o.z=m.z;o.shield=5;
            updateMixers(0.002);return {over,hit:m.hit.has(o),shieldLeft:o.shield,spun:o.spun,cement:o.cement,shield:m.hit.has(o)&&!(o.spun>0)&&!(o.cement>0)};}""")
        check(over['over'], 'at the top of a bounce it sails over a kart')
        check(over['shield'], f'a shield takes the hit {over}')
        own = ev("""()=>{const m=mixers[0],H=MIX.hop;m.t=H*2-0.002;updateMixers(0.001);
            T_put(player,Math.floor(m.s),m.lat,25);player.x=m.x;player.z=m.z;player.spun=0;updateMixers(0.002);
            return !(player.spun>0)&&!(player.cement>0);}""")
        check(own, 'his own mixer never hits him')
        b = ev("""()=>{const m=mixers[0],G=m.g;for(let i=0;i<6*60&&mixers.length;i++)updateMixers(1/60);
            for(let i=0;i<4*60;i++)updateMixers(1/60);drawMixers();
            return {left:mixers.length,inScene:!!G.parent,dry:karts.every(k=>!(k.cement>0)&&!(k.lumpG&&k.lumpG.visible))};}""")
        check(b['left'] == 0 and not b['inScene'] and b['dry'], f'it bursts after {ev("()=>MIX.time")} s, the cement dries off {b}')

        # the AI throws it with someone up the road
        u = ev("""()=>{T_mine();const o=karts.find(k=>k.ai&&!k.parked);T_put(o,player.si,0,25);T_put(player,o.si+20,HW*.4,25);
            o.held='sig';o.heldSig='weiron';o.heldLvl=1;o.roll=0;o.spun=0;o.fartT=0;o.frozen=0;
            aiItemLines();return {used:mixers.some(m=>m.owner===o),held:o.held};}""")
        check(u['used'], f'the AI throws it with someone ahead {u}')
        # Stämpla in: an item stamps a card and pushes him; one that comes straight back does not
        st = ev("""()=>{T_mine();T_put(player,player.si,0,25);player.boost=0;
            giveItem(player,'pie',1);player.roll=0;useItem(player);updateStamp();const pie=player.boost;
            player.boost=0;T_use('extraallt');updateStamp();const r={pie,back:player.boost,held:player.held};
            player.held=null;player.heldSig=null;return r}""")
        check(st['pie'] >= 0.4 and st['back'] == 0 and st['held'] == 'sig',
              f'Stämpla in: a push after each item, none when it comes back {st}')
        ev("()=>{player.held=null;honk();}")
        check(ev("()=>typeof shiftWhistle==='function'"), 'the Skiftsex horn is a shift whistle')

        # a new race clears everything away
        left = ev("()=>{T_use('weiron');player.cement=2;clearPowerups();return mixers.length+karts.filter(k=>k.cement>0).length}")
        check(left == 0, f'clean-up leaves nothing behind ({left})')
        browser.close()
    httpd.shutdown()

    errors = [e for e in errors if 'net::ERR_FAILED' not in e]
    for e in errors:
        print('JS error:', e)
    if errors or fails:
        sys.exit('Weiron test FAILED')
    print('Weiron test passed')


if __name__ == '__main__':
    main()
