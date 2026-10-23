#!/usr/bin/env python3
"""Headless check of Gröna gubben's signature item, SÄDESCIRKLARNA.

    CHROMIUM=/path/to/chrome python3 tools/crop_circles_test.py

The saucer comes down behind the kart and burns three crop circles into the road (one big, two small);
until they are burnt in nothing happens. A kart that drives into one is lifted, goes round it once
spinning, and is let go facing up the road, slower, flung sideways (never forwards) and with antennae.
The user, Gröna gubben, a shield and a kart in the air get through. The saucer leaves, the circles
fade, a bot drops them with someone behind and keeps them otherwise, karts driven by the real physics
go round and come out on the road, and a new race clears everything.
Screenshots go to crop-*.png in the repo root (ignored by git). Exit 1 on any failure.
"""
import os
import sys
from pathlib import Path

from playwright.sync_api import sync_playwright

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from smoke_test import serve  # noqa: E402
from signature_test import HELPERS  # noqa: E402

ROOT = Path(__file__).resolve().parent.parent

# the race in the page, paused: rivals parked out of the way, the player on a straight
SETUP = """()=>{paused=true;clearPowerups();DBG.god=false;
  window.T_ais=karts.filter(k=>k.ai&&!k.parked);
  T_ais.forEach((k,i)=>{T_put(k,player.si-150-i*10,0,20);k.sig=null;});
  let i=player.si;for(let n=0;n<N&&!runeStraight({mi:i,rib:0});n++)i=(i+7)%N;
  T_put(player,i,0,25);player.boost=0;player.slow=0;player.vy=0;player.held=null;player.sig=null;
  window.T_step=(s)=>{for(let t=0;t<s;t+=1/60){for(const k of karts)if(k.orbit)drive(k,1/60,{throttle:0,brake:0,steer:0,drift:false});
    updateSigs(1/60);}};
  window.T_at=(k,C,v)=>{T_put(k,C.i,C.lat,v===undefined?20:v);k.slow=0;k.vy=0;k.ant=0;return k;};
  window.T_lat=(k)=>{const i=Math.round(k.mi)%N;return k.vx*rx[i]+k.vz*rz[i];};
  window.T_fwd=(k)=>{const i=Math.round(k.mi)%N;return k.vx*fx[i]+k.vz*fz[i];};
}"""


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

        reg = ev("()=>{const S=SIGS.gubbe;return S&&[S.name,!!(S.icon&&S.text),sigPool().includes('gubbe'),S.lane,!S.opens]}")
        check(reg == ['SÄDESCIRKLARNA', True, True, False, True],
              f'registered, in every box, not in a farm lane, leaves passages alone {reg}')
        check(ev("()=>sigOf('gubbe')==='gubbe'&&CHARS.find(c=>c.id==='gubbe').boss==='vild'"),
              'Gröna gubben (driver and bot) owns it')

        for button in ('#btnStart', '#btnStageGo', '#btnGo'):
            page.click(button, timeout=10000)
        wait(5000)
        ev(HELPERS)

        # ── the pattern ──
        ev(SETUP)
        a = ev("""()=>{T_use('gubbe');const P=crops[0];
            const back=sigWrap(player.si-P.circles[0].i)*SEG,lats=P.circles.map(C=>+C.lat.toFixed(1)),rs=P.circles.map(C=>C.r);
            const a=T_ais[0];T_at(a,P.circles[0]);T_step(CROP.draw*.5);const early=!!a.orbit;
            return {n:crops.length,back,lats,rs,saucer:!!P.saucer.parent,early,armed:P.armed}}""")
        check(a['n'] == 1 and 10 < a['back'] < 14 and len(a['lats']) == 3 and a['rs'] == [3.4, 2, 2]
              and abs(a['lats'][1] - 5.6) < .1 and abs(a['lats'][2] + 5.6) < .1,
              f'three circles land behind the kart: a big one and two small ones either side {a}')
        check(a['saucer'] and not a['armed'] and not a['early'], f'the saucer burns them in first; nothing happens yet {a}')

        # ── caught ──
        c = ev("""()=>{const P=crops[0],a=T_ais[0],C=P.circles[0];T_at(a,C,20);const g0=groundAt(a.x,a.z,a.si);
            T_step(CROP.draw*.6);const got=!!a.orbit;let up=0,turn=0,dist=0,yaw=a.yaw;
            for(let t=0;t<CROP.orbit*.5;t+=1/60){T_step(1/60);if(a.orbit){up=Math.max(up,a.y-groundAt(a.x,a.z,a.si));
              dist=Math.max(dist,Math.hypot(a.x-C.x,a.z-C.z));turn+=Math.abs(wrapAng(a.yaw-yaw));yaw=a.yaw;}}
            return {got,armed:P.armed,up,dist,turn,r:C.r,toast:el.toast.textContent}}""")
        check(c['got'] and c['armed'] and c['up'] > 1.2 and c['dist'] < c['r'] + .1 and c['turn'] > 6,
              f'a kart driving in is lifted and goes round the circle, spinning {c}')
        r = ev("""()=>{const a=T_ais[0],i0=a.orbit.i;T_step(CROP.orbit*.6);const i=Math.round(a.si)%N;
            return {done:!a.orbit,ant:a.ant,antG:!!a.antG,slow:a.slow,fwd:a.vx*fx[i]+a.vz*fz[i],side:Math.abs(a.vx*rx[i]+a.vz*rz[i]),
              face:Math.abs(wrapAng(a.yaw-Math.atan2(fx[i],fz[i]))),near:Math.abs(sigWrap(a.si-i0))*SEG,again:crops[0].hit.has(a)}}""")
        check(r['done'] and r['ant'] > 3 and r['antG'] and r['slow'] > .5, f'after one lap it is let go with antennae {r}')
        check(r['fwd'] < 20 * .5 and r['side'] > 6 and r['face'] < .05 and r['near'] < 8,
              f'facing up the road, slower, flung sideways out of the circle (never forwards) {r}')
        once = ev("()=>{const a=T_ais[0];T_at(a,crops[0].circles[0]);T_step(.2);return !a.orbit}")
        check(once, 'the same circles take a kart only once')

        # ── who gets through ──
        s = ev("""()=>{const P=crops[0],[,b,d,e]=T_ais;
            T_at(b,P.circles[1]);b.sig='gubbe';T_at(d,P.circles[2]);d.shield=5;T_at(e,P.circles[0]);e.air=true;e.vy=4;
            T_at(player,P.circles[0]);T_step(.1);
            return {gubbe:!b.orbit,shield:!d.orbit&&d.shield===0,air:!e.orbit,me:!player.orbit}}""")
        check(all(s.values()), f'the user, Gröna gubben, a shield and a kart in the air get through {s}')
        g = ev("""()=>{const P=crops[0],S=P.saucer,G=P.circles.map(C=>C.g);T_step(CROP.life);
            return {left:crops.length,saucer:!!S.parent,circles:G.some(g=>!!g.parent)}}""")
        check(g == {'left': 0, 'saucer': False, 'circles': False}, f'the saucer leaves and the circles fade away {g}')

        # what it looks like from behind: a bot ahead of the user drops them, another drives in
        def shot(name, js):
            ev("()=>{state='race';" + js + "for(const k of karts)drawKart(k);camInit=false;for(let n=0;n<30;n++)updateCamera(1/60);drawSigs();}")
            wait(300)
            page.screenshot(path=str(ROOT / name))
        ev(SETUP)
        shot('crop-swoop.png', "T_put(T_ais[1],player.si+34/SEG,1,25);burnCircles(T_ais[1]);T_step(.25);")
        shot('crop-burn.png', "T_step(.4);")
        shot('crop-orbit.png', "T_step(CROP.draw);T_at(T_ais[0],crops[0].circles[0]);T_step(CROP.orbit*.35);")
        shot('crop-antennae.png', "const a=T_ais[0];T_step(CROP.orbit*.7);a.air=false;a.vy=0;"
             "T_put(player,a.si-9/SEG,a.lat,0);")

        # ── the AI ──
        u = ev(f"""()=>{{({SETUP})();const a=T_ais[0];T_put(a,player.si+15/SEG,0,25);a.held='sig';a.heldSig='gubbe';a.heldLvl=1;a.roll=0;
            a.heldAt=raceTime;a.frozen=0;a.spun=0;a.fartT=0;aiItemLines();return crops.some(P=>P.owner===a)}}""")
        check(u, 'a bot with someone behind drops them')
        n = ev(f"""()=>{{({SETUP})();const a=T_ais[0];T_put(a,player.si-300/SEG,0,25);a.held='sig';a.heldSig='gubbe';a.heldLvl=1;a.roll=0;
            a.heldAt=raceTime;T_ais.slice(1).forEach((k,j)=>T_put(k,a.si+80+j*10,0,25));aiItemLines();return crops.length}}""")
        check(n == 0, 'a bot with nobody behind keeps them for later')

        # ── live: the real physics drives a kart into the circles ──
        live = ev(f"""()=>{{({SETUP})();T_use('gubbe');const C=crops[0].circles[0],a=T_ais[0];
            T_put(a,C.i-30/SEG,C.lat,22);a.noBand=true;paused=false;window.T_t0=raceTime;window.T_got=false;
            window.T_iv=setInterval(()=>{{if(a.orbit)T_got=true;}},10);}}""")
        for _ in range(200):
            if ev("()=>raceTime-T_t0>=4"):
                break
            wait(100)
        live = ev("""()=>{clearInterval(T_iv);paused=true;const a=T_ais[0];a.noBand=false;
            return {got:T_got,out:!a.orbit,ok:isFinite(a.x+a.z+a.y+a.vx+a.vz),lat:+a.lat.toFixed(1),hw:HW}}""")
        check(live['got'] and live['out'] and live['ok'] and abs(live['lat']) < live['hw'] + 4,
              f'in a live race a bot drives in, goes round and comes out on the road {live}')

        # a soak: bots drop them over and over in a live race, and nothing breaks
        ev("""()=>{clearPowerups();T_ais.forEach((k,i)=>T_put(k,player.si+20+i*12,(i%3-1)*3,25));T_put(player,player.si,0,25);
            paused=false;DBG.god=true;window.T_bad=0;window.T_round=0;let n=0;
            window.T_soak=setInterval(()=>{const k=T_ais[n++%T_ais.length];
              if(!k.held&&!k.done){k.held='sig';k.heldSig='gubbe';k.heldLvl=1;k.roll=0;k.heldAt=raceTime-AI_HOLD-1;}
              for(const o of karts){if(!isFinite(o.x+o.z+o.y+o.vx+o.vz))T_bad++;if(o.orbit)T_round++;}},200);}""")
        t0 = ev("()=>raceTime")
        for _ in range(300):
            if ev(f"()=>raceTime-{t0}>=25"):
                break
            wait(150)
        soak = ev("""()=>{clearInterval(T_soak);paused=true;return {bad:T_bad,round:T_round,t:raceTime,
            on:karts.filter(k=>k.ai&&!k.parked&&Math.abs(k.lat)<HW+4).length,all:karts.filter(k=>k.ai&&!k.parked).length,
            stuck:karts.filter(k=>k.orbit&&k.orbit.t>CROP.orbit+.2).length}}""")
        page.screenshot(path=str(ROOT / 'crop-soak.png'))
        check(soak['bad'] == 0 and soak['on'] == soak['all'] and soak['stuck'] == 0,
              f'25 s of bots dropping crop circles: no broken karts, nobody stuck going round, everyone on the road {soak}')
        print(f'karts caught going round during the soak (samples): {soak["round"]}')

        left = ev("""()=>{DBG.god=false;paused=true;clearPowerups();T_use('gubbe');T_step(CROP.draw+.1);const a=T_ais[0];T_at(a,crops[0].circles[0]);
            T_step(.2);const was=!!a.orbit;a.ant=2;if(!a.antG)a.antG=antParts();clearPowerups();
            return {was,left:crops.length+karts.filter(k=>k.orbit||k.ant>0||(k.antG&&k.antG.visible)).length}}""")
        check(left['was'] and left['left'] == 0, f'a new race clears the circles, anyone going round and the antennae {left}')
        browser.close()
    httpd.shutdown()

    errors = [e for e in errors if 'net::ERR_FAILED' not in e]
    for e in errors:
        print('JS error:', e)
    if errors or fails:
        sys.exit('Crop circles test FAILED')
    print('Crop circles test passed')


if __name__ == '__main__':
    main()
