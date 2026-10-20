#!/usr/bin/env python3
"""Headless check of the six west-coast signature items and the west-coast drivers' quirks.

    CHROMIUM=/path/to/chrome python3 tools/west_items_test.py

Starts a race, gives each item through the debug hooks, uses it and checks its effect:
Skyfallet (rain and wipers), Containern (shadow, wall, bounce, a gap round it), Slussporten
(a gate behind, a gap on the other side), Dyket (untouchable, vehicle hidden), Räkmackan
(the gull steals an item, a shield shoos it) and Offside (the leader slows). Then the AI
plays each of them, the drivers' quirks, and a new race clears everything away.
Screenshots go to west-*.png in the repo root (ignored by git). Exit 1 on any failure.
"""
import os
import sys
from pathlib import Path

from playwright.sync_api import sync_playwright

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from smoke_test import serve  # noqa: E402
from signature_test import HELPERS  # noqa: E402

ROOT = Path(__file__).resolve().parent.parent
WEST = ['regnmolnet', 'hamnkranen', 'slusstrollet', 'aspenmonstret', 'kaptenmas', 'domaren']


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
        for button in ('#btnStart', '#btnStageGo', '#btnGo'):
            page.click(button, timeout=10000)
        page.wait_for_timeout(5000)
        ev = page.evaluate
        ev(HELPERS)
        # only this test's own walls and gulls: whatever the AI fired from a box is cleared first
        ev("()=>{window.T_mine=()=>{for(const w of sigWalls)scene.remove(w.g);for(const G of gulls)scene.remove(G.g);"
           "sigWalls.length=0;gulls.length=0;};}")
        ev("()=>{DBG.god=true;}")
        wait = page.wait_for_timeout

        def until(js, ms):
            for _ in range(ms // 250):
                if ev(js):
                    return True
                wait(250)
            return bool(ev(js))

        check(ev(f"()=>{WEST}.every(id=>SIGS[id]&&SIGS[id].icon&&SIGS[id].text&&sigOf(id)===id)"), 'six west items registered')
        check(ev("()=>CHARS.filter(c=>WEST_KINDS.includes(c.id)).length===6&&GRID.every(i=>i>=0)&&GRID.length===CHARS.length"),
              'six west drivers on the driver grid')
        check(ev("()=>WEST_KINDS.every(id=>{const c=CHARS.find(d=>d.id===id);return CARS.some(r=>r.id===c.sig&&r.sig===id)})"),
              'each has their own vehicle')
        built = ev("""()=>WEST_KINDS.map(id=>{const c=CHARS.find(d=>d.id===id),v=buildKart(c.color,id,c.sig);
            let n=0;v.root.traverse(o=>{if(o.isMesh)n++;});return n;})""")
        check(all(n > 20 for n in built), f'drivers and vehicles build ({built} meshes)')
        page.keyboard.down('w')
        wait(4500)

        # Skyfallet: the kart ahead gets a cloud and slides; on the player, rain and wipers on screen
        a = ev("()=>T_behind(14)")
        ev("()=>T_use('regnmolnet')")
        wait(300)
        r = ev(f"()=>({{rain:karts[{a}].rain,cloud:!!karts[{a}].cloudG&&karts[{a}].cloudG.visible,grip:sigGrip(karts[{a}])}})")
        page.screenshot(path=str(ROOT / 'west-rain.png'))
        check(r['rain'] > 3 and r['cloud'] and r['grip'] < 0.5, f'rain cloud over the kart ahead, grip gone {r}')
        ov = ev("""()=>{player.rain=3;updateWest(0.016);const e=document.getElementById('skyfall'),on=e.classList.contains('on');
            player.wet=true;updateWest(0.016);const dry=!e.classList.contains('on')&&westGrip(player)===1;
            player.wet=false;player.rain=0;updateWest(0.016);return {on,dry,off:!e.classList.contains('on')};}""")
        check(ov['on'] and ov['dry'] and ov['off'], f'player sees rain and wipers, Regnmolnet does not mind {ov}')
        check(until(f"()=>karts[{a}].rain===0&&!karts[{a}].cloudG?.visible", 7000), 'the cloud moves on')

        # Containern: shadow first, then a wall that bounces you back, with a gap round it
        a = ev("()=>T_behind(14)")
        ev("()=>{T_mine();T_use('hamnkranen');}")
        w0 = ev("()=>{const w=sigWalls[0];return w&&{solid:w.solid,lat:w.lat,len:w.len,ahead:sigWrap(w.si-T_rival().mi),hw:HW}}")
        check(bool(w0) and not w0['solid'] and w0['ahead'] > 3 and abs(w0['lat']) + w0['len'] / 2 < w0['hw'],
              f'red shadow lands on the road in front of the kart ahead {w0}')
        check(until("()=>sigWalls[0]&&sigWalls[0].solid", 4000), 'the container lands as a wall')
        page.screenshot(path=str(ROOT / 'west-container.png'))
        b = ev("""()=>{const w=sigWalls[0],o=karts.find(k=>k.ai&&!k.parked&&k!==w.owner),i=w.si;
            T_put(o,i,w.lat,30);o.x-=fx[i]*(w.deep/2+KR-.3);o.z-=fz[i]*(w.deep/2+KR-.3);o.spun=0;
            const v0=o.vx*fx[i]+o.vz*fz[i];bumpSigWalls(o);
            const f=(o.x-w.x)*fx[i]+(o.z-w.z)*fz[i],v1=o.vx*fx[i]+o.vz*fz[i];
            const gl=w.lat>0?w.lat-w.len/2-KR-.2:w.lat+w.len/2+KR+.2;T_put(o,i,gl,30);const x0=o.x;bumpSigWalls(o);
            return {v0,v1,out:f<=-(w.deep/2+KR)+1e-3,spun:o.spun,gap:o.x===x0,gapLat:gl}}""")
        check(b['v1'] < 0 and abs(b['v1']) < b['v0'] * 0.4 and b['out'] and b['spun'] == 0,
              f'driving into it bounces you back, no spin {b}')
        check(b['gap'], f'the gap beside it is clear {b}')
        avoid = ev("""()=>{const w=sigWalls[0],o=karts.find(k=>k.ai&&!k.parked&&k!==w.owner);
            T_put(o,w.si-20,w.lat,25);o.line=w.lat;o.itemBias=0;return sigWallAvoid(o);}""")
        check(abs(avoid) > 2, f'the AI steers round it ({avoid:.2f} m)')
        check(until("()=>!sigWalls.some(w=>w.owner===player)", 9000), 'the container is hoisted away')

        # Slussporten: a gate rises behind on his own side, a gap on the other
        ev("()=>{T_mine();T_put(player,player.si,HW*.5,25);T_use('slusstrollet');}")
        g = ev("()=>{const w=sigWalls[0];return w&&{behind:sigWrap(w.si-player.mi),lat:w.lat,len:w.len,hw:HW,gate:w.gate}}")
        check(bool(g) and g['gate'] and g['behind'] < -2 and g['lat'] > 0,
              f'a lock gate behind, on his side {g}')
        check(until("()=>sigWalls[0]&&sigWalls[0].solid", 3000), 'the gate rises and shuts')
        page.screenshot(path=str(ROOT / 'west-gate.png'))
        q = ev("""()=>{const w=sigWalls[0],o=T_rival(),i=w.si;const gl=w.lat-w.len/2-KR-.2;
            T_put(o,i,gl,25);const x0=o.x;bumpSigWalls(o);const gap=o.x===x0&&gl>-HW;
            T_put(o,i,w.lat,25);o.x-=fx[i]*.5;o.z-=fz[i]*.5;bumpSigWalls(o);
            return {gap,gapLat:gl,shut:(o.vx*fx[i]+o.vz*fz[i])<0,verge:w.lat+w.len/2>HW+3.6}}""")
        check(q['gap'] and q['shut'] and q['verge'], f'gap on the other side, shut across his side and the verge {q}')
        check(until("()=>!sigWalls.some(w=>w.owner===player)", 9000), 'the gate sinks again')

        # Dyket: under the lake, untouchable, the vehicle hidden
        ev("()=>{T_put(player,player.si,0,25);T_use('aspenmonstret');}")
        wait(300)
        d = ev("""()=>({dive:player.dive>0,ghost:player.ghost>0,shown:player.diveG.visible,
            hidden:player.v.root.children.filter(c=>c!==player.bikeG).every(c=>!c.visible)})""")
        page.screenshot(path=str(ROOT / 'west-dive.png'))
        check(all(d.values()), f'dives under the road, untouchable {d}')
        check(until("()=>player.dive===0&&!player.diveG?.visible&&player.v.lean.visible", 6000), 'comes up again')

        # Räkmackan: the gull takes the item from the kart ahead and brings it back
        # (the victim's AI is switched off for this, or it would just use its boost before the gull gets there)
        ev("()=>{for(const it of items)it.cool=99;}")      # no item box refills the slot while the gull is out
        a = ev("()=>{const i=T_behind(14);karts[i].ai=false;karts[i].held=null;giveItem(karts[i],'boost',2);karts[i].roll=0;player.held=null;return i;}")
        ev("()=>{T_mine();T_use('kaptenmas');}")
        wait(200)
        page.screenshot(path=str(ROOT / 'west-gull.png'))
        check(until("()=>player.held==='boost'&&!gulls.some(G=>G.owner===player)", 5000), 'the gull brings the item home')
        st = ev(f"()=>({{mine:player.held,lvl:player.heldLvl,theirs:karts[{a}].held}})")
        check(st == {'mine': 'boost', 'lvl': 2, 'theirs': None}, f'stolen with its level {st}')
        ev(f"()=>{{player.held=null;const o=karts[{a}];T_behind(14);giveItem(o,'pie',1);o.roll=0;o.shield=5;}}")
        ev("()=>T_use('kaptenmas')")
        check(until("()=>!gulls.some(G=>G.owner===player)", 5000) and ev(f"()=>karts[{a}].held==='pie'&&player.held!=='pie'"),
              'a shield shoos the gull away')
        ev(f"()=>{{karts[{a}].held=null;karts[{a}].shield=0;karts[{a}].ai=true;for(const it of items)it.cool=Math.min(it.cool,.01);}}")
        ev("()=>{player.held=null;for(const k of karts)if(k!==player){k.held=null;k.roll=0;}T_use('kaptenmas');}")
        check(ev("()=>player.held==='sig'&&player.heldSig==='kaptenmas'"), 'nothing to steal: the item stays in the slot')
        ev("()=>{player.held=null;}")

        # Offside: the leader gets the yellow card and slows
        o = ev("""()=>{order();const t=herdTarget(player);t.shield=0;t.pans=0;t.bike=0;t.bucketLap=t.lap;T_use('domaren');
            return {who:t.idx,off:t.offside,top:sigTop(t),card:!!t.cardG&&t.cardG.visible}}""")
        wait(200)
        o['card'] = ev(f"()=>!!karts[{o['who']}].cardG?.visible")
        page.screenshot(path=str(ROOT / 'west-card.png'))
        check(o['off'] > 2.5 and o['top'] < 0.8 and o['card'], f'yellow card for the leader {o}')
        check(until(f"()=>karts[{o['who']}].offside===0&&!karts[{o['who']}].cardG?.visible", 6000), 'back to normal')

        # the AI plays each of them when it makes sense
        played = []
        for sid in WEST:
            idx = ev(f"""()=>{{const a=T_rival(),i=T_behind(10);for(const k of karts)if(k!==a){{k.held=null;}}
                const b=karts.find(k=>k.ai&&!k.parked&&k!==a);giveItem(b,'boost',1);b.roll=0;b.shield=0;
                a.held=null;giveItem(a,'sig',1,'{sid}');a.roll=0;a.place=3;return i;}}""")
            for _ in range(30):
                wait(100)
                if ev(f"()=>karts[{idx}].held!=='sig'||karts[{idx}].heldSig!=='{sid}'"):
                    played.append(sid)
                    break
        check(len(played) >= 5, f'AI plays the west items: {played}')

        page.keyboard.up('w')
        wait(500)
        # quirks: set from the player's driver at the start of every race
        q = ev("""()=>{const out={};const was=charSel;
            for(const id of ['regnmolnet','kaptenmas','aspenmonstret','domaren','arne']){
              charSel=CHARS.findIndex(c=>c.id===id);placeOnGrid();
              out[id]=[player.wet,player.glide,player.shy,player.ref,player.mass];}
            charSel=was;placeOnGrid();return out;}""")
        check(q['regnmolnet'][0] and q['kaptenmas'][1] and q['aspenmonstret'][2] and q['domaren'][3]
              and not any(q['arne'][:4]), f'quirks follow the driver {q}')
        g = ev("""()=>{const k=player;k.glide=true;const s0=k.si,i=s0;T_put(k,i,0,20);k.y+=6;k.vy=0;k.air=true;
            for(let n=0;n<30;n++)drive(k,FIXED,{throttle:0,steer:0,brake:0,drift:false});const a=k.vy;
            k.glide=false;T_put(k,i,0,20);k.y+=6;k.vy=0;k.air=true;
            for(let n=0;n<30;n++)drive(k,FIXED,{throttle:0,steer:0,brake:0,drift:false});return [a,k.vy];}""")
        check(g[0] > g[1] * 0.8 and g[0] < 0, f'Kapten Mås falls slower {g}')
        ev("()=>{placeOnGrid();}")

        # a new race clears everything away
        left = ev("""()=>{T_use('hamnkranen');T_use('slusstrollet');player.rain=2;player.dive=1;clearPowerups();
            return sigWalls.length+gulls.length+karts.filter(k=>k.rain||k.offside||k.dive).length+
              (document.getElementById('skyfall').classList.contains('on')?1:0);}""")
        check(left == 0, f'clean-up leaves nothing behind ({left})')
        browser.close()
    httpd.shutdown()

    errors = [e for e in errors if 'net::ERR_FAILED' not in e]
    for e in errors:
        print('JS error:', e)
    if errors or fails:
        sys.exit('west items test FAILED')
    print('west items test passed')


if __name__ == '__main__':
    main()
