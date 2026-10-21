#!/usr/bin/env python3
"""Headless check of the champions' signature items: Spöket's BUUU!, Vikingahövdingen's
STORMFLODEN and Raket-Rune's 3-2-1 ÖVERLJUD!.

    CHROMIUM=/path/to/chrome python3 tools/boss_items_test.py

BUUU!: the ghost rises, then every kart within reach hops, slows and swerves away; one further off,
a shield and the user are left alone. STORMFLODEN: the wave rolls up from behind, washes aside a kart
in its path, carries the user (faster, pushed, more grip) and sweeps away a kart under the user's
nose, then breaks. 3-2-1 ÖVERLJUD!: three beats crawling, then the boost and the sonic boom that
throws the karts close by off their line; a finished race cancels the count, and the AI only counts
down with a straight ahead. Each one is also raced live to check the speed it gives, the AI plays all
three, and a new race clears everything.
Screenshots go to boss-*.png in the repo root (ignored by git). Exit 1 on any failure.
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
  T_ais.forEach((k,i)=>T_put(k,player.si-120-i*10,0,20));
  let i=player.si;for(let n=0;n<N&&!runeStraight({mi:i,rib:0});n++)i=(i+7)%N;
  T_put(player,i,0,25);player.boost=0;player.slow=0;player.vy=0;player.held=null;
  window.T_ahead=(k,m,lat,v)=>{T_put(k,player.si+m/SEG,lat,v===undefined?25:v);k.slow=0;k.vy=0;k.scared=0;k.boost=0;return k;};
  window.T_step=(s)=>{for(let t=0;t<s;t+=1/60){updateBoss(1/60);}};
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

        # the roster: three items, named, with icons and text, the champions' own; the AI ghost's kind maps over
        reg = ev("""()=>['spoket','viking','rune'].map(id=>[id,SIGS[id]&&SIGS[id].name,!!(SIGS[id]&&SIGS[id].icon&&SIGS[id].text),
            sigPool().includes(id)])""")
        check([r[1] for r in reg] == ['BUUU!', 'STORMFLODEN', '3-2-1 ÖVERLJUD!'] and all(r[2] and r[3] for r in reg),
              f'registered, in every box {reg}')
        check(ev("()=>sigOf('ghost')==='spoket'&&sigOf('viking')==='viking'&&sigOf('rune')==='rune'&&"
                 "['spoket','viking','rune'].every(id=>CHARS.find(c=>c.id===id).boss)"),
              'the champions (and the AI ghost) own them')

        for button in ('#btnStart', '#btnStageGo', '#btnGo'):
            page.click(button, timeout=10000)
        wait(5000)
        ev(HELPERS)

        # ── BUUU! ──
        ev(SETUP)
        b = ev("""()=>{const [a,b,c,d]=T_ais;T_ahead(a,8,2);T_ahead(b,-6,-3);T_ahead(c,40,0);T_ahead(d,4,-4);d.shield=5;
            T_use('spoket');const v0=[a,b].map(T_fwd),la=T_lat(a),lb=T_lat(b);
            T_step(BOO.warn*.5);const early=a.vy>0||a.slow>0;T_step(BOO.warn*.6);
            return {boos:boos.length,early,
              hop:[a.vy,b.vy],slow:[a.slow,b.slow],keep:[T_fwd(a)/v0[0],T_fwd(b)/v0[1]],
              away:[T_lat(a)-la,T_lat(b)-lb],scared:[a.scared>0,b.scared>0,!!(a.booMark)],far:c.vy===0&&!(c.slow>0)&&!(c.scared>0),
              shield:d.shield===0&&!(d.slow>0),me:player.vy===0&&!(player.slow>0)}}""")
        check(b['boos'] == 1 and not b['early'], f'the ghost rises first, nothing yet {b}')
        check(all(h > 5 for h in b['hop']) and all(s > 0.4 for s in b['slow']) and all(0.55 < k < 0.7 for k in b['keep'])
              and all(b['scared']), f'karts close by (ahead and behind) jump, slow and get a "!" {b}')
        check(b['away'][0] > 5 and b['away'][1] < -5, f'they swerve sideways away from the ghost {b["away"]}')
        check(b['far'] and b['shield'] and b['me'], f'not one further off, not a shield, not the user {b}')
        ev("()=>{camInit=false;updateCamera(1/60);drawBoss();}")
        wait(300)
        page.screenshot(path=str(ROOT / 'boss-boo.png'))
        g = ev("()=>{const G=boos[0].g;T_step(BOO.time);return {left:boos.length,inScene:!!G.parent}}")
        check(g['left'] == 0 and not g['inScene'], f'the ghost goes again {g}')
        # the player gets a fright from a bot
        f = ev(f"""()=>{{({SETUP})();const a=T_ais[0];T_ahead(a,-7,0);a.held='sig';a.heldSig='spoket';a.heldLvl=1;a.roll=0;
            a.frozen=0;a.spun=0;a.fartT=0;aiItemLines();const used=boos.some(B=>B.owner===a);T_step(BOO.warn+.05);
            return {{used,hop:player.vy,slow:player.slow}}}}""")
        check(f['used'] and f['hop'] > 5 and f['slow'] > 0.4, f'a bot uses it with the player close, and the player jumps {f}')
        n = ev(f"""()=>{{({SETUP})();const a=T_ais[0];T_ahead(a,400,0);a.held='sig';a.heldSig='spoket';a.heldLvl=1;a.roll=0;
            a.heldAt=raceTime;aiItemLines();return boos.length}}""")
        check(n == 0, 'a bot with nobody close keeps it for later')

        # ── STORMFLODEN ──
        w = ev(f"""()=>{{({SETUP})();const [a,b]=T_ais;T_ahead(a,-14,3);T_ahead(b,12,0,5);
            T_use('viking');const W=waves[0],ph0=W.phase,la=T_lat(a);let t=0;
            while(W.phase==='come'&&t<3){{T_step(1/60);t+=1/60;}}
            return {{ph0,arrive:t,phase:W.phase,flood:player.flood,washed:W.hit.has(a),lat:T_lat(a)-la,slow:a.slow,
              top:bossTop(player),push:bossPush(player),grip:bossGrip(player),idle:sigPush(player,0)}}}}""")
        check(w['ph0'] == 'come' and 0.3 < w['arrive'] <= 1.6 and w['phase'] == 'surf' and w['flood'] > 3,
              f'the wave rolls up from behind and catches the user {w}')
        check(w['washed'] and w['lat'] > 6 and w['slow'] > 0.4, f'on the way it washes aside a kart in its path {w}')
        check(abs(w['top'] - 1.2) < 1e-6 and w['push'] == 22 and w['grip'] > 1.2 and w['idle'] >= 22,
              f'surfing: faster, pushed even off the throttle, more grip {w}')
        ev("()=>{camInit=false;updateCamera(1/60);drawBoss();}")
        wait(300)
        page.screenshot(path=str(ROOT / 'boss-flood.png'))
        s = ev("""()=>{const b=T_ais[1],W=waves[0];T_put(b,player.si+3/SEG,-2,5);b.slow=0;const lb=T_lat(b);T_step(1/30);
            return {washed:W.hit.has(b),lat:T_lat(b)-lb}}""")
        check(s['washed'] and s['lat'] < -6, f'the kart just in front of the surfer is swept to its own side {s}')
        e = ev("""()=>{const W=waves[0],G=W.g;T_step(FLOOD.time);const ph=W.phase,fl=player.flood;T_step(FLOOD.fade+.1);
            return {ph,fl,left:waves.length,inScene:!!G.parent,top:bossTop(player)}}""")
        check(e['ph'] == 'break' and e['fl'] == 0 and e['left'] == 0 and not e['inScene'] and e['top'] == 1,
              f'after {ev("()=>FLOOD.time")} s the wave breaks and is gone {e}')
        u = ev(f"""()=>{{({SETUP})();const a=T_ais[0];T_ahead(a,-20,0);a.held='sig';a.heldSig='viking';a.heldLvl=1;a.roll=0;
            a.frozen=0;a.spun=0;a.fartT=0;aiItemLines();return waves.some(W=>W.owner===a)}}""")
        check(u, 'a bot with someone in front surfs it')

        # ── 3-2-1 ÖVERLJUD! ──
        r = ev(f"""()=>{{({SETUP})();const [a,b,c,d]=T_ais;T_ahead(a,6,3);T_ahead(b,-8,-2);T_ahead(c,30,0);T_ahead(d,-5,4);d.shield=5;
            const beats=[],was=window.flash;window.flash=m=>{{beats.push(m);was(m);}};
            const f0=[a,b].map(T_fwd),l0=[a,b].map(T_lat);T_use('rune');const crawl=bossTop(player),cnt=player.rcount;let fired=null;
            for(let t=0;t<2&&fired===null;t+=1/60){{T_step(1/60);if(player.rburn>0)fired=t;}}
            window.flash=was;
            return {{cnt,crawl,beats,fired,burn:player.rburn,boost:player.boost,top:bossTop(player),push:bossPush(player),
              hit:[a,b].map((k,j)=>[k.slow>0,k.vy>0,+(T_lat(k)-l0[j]).toFixed(1),+(T_fwd(k)/f0[j]).toFixed(2)]),far:!(c.slow>0)&&c.vy===0,shield:d.shield===0&&!(d.slow>0),
              vapour:vapours.length,me:!(player.slow>0)}}}}""")
        check(r['cnt'] == 1.5 and abs(r['crawl'] - 0.55) < 1e-6 and r['beats'][:3] == ['3', '2', '1'],
              f'three beats, crawling {r["beats"]} {r["crawl"]}')
        check(r['fired'] is not None and 1.4 < r['fired'] < 1.6 and r['burn'] > 2.5 and r['boost'] > 2.5
              and abs(r['top'] - 1.15) < 1e-6 and r['push'] == 26 and r['beats'][-1] == 'ÖVERLJUD!',
              f'then the rocket: boost, extra top speed, a push {r}')
        check(r['hit'][0][2] > 8 and r['hit'][1][2] < -8 and all(h[0] and h[1] and h[3] <= 0.85 for h in r['hit']) and r['far'] and r['shield'] and r['vapour'] == 1 and r['me'],
              f'the sonic boom throws karts close by sideways off their line (never on up the road), not one further off, not a shield, not the user {r}')
        ev("()=>{camInit=false;updateCamera(1/60);drawBoss();}")
        wait(300)
        page.screenshot(path=str(ROOT / 'boss-boom.png'))
        c = ev(f"""()=>{{({SETUP})();T_use('rune');T_step(.4);player.done=true;T_step(1.5);const r=[player.rburn,player.rcount,vapours.length];
            player.done=false;return r}}""")
        check(c == [0, 0, 0], f'a race that ends mid-count fires no rocket {c}')
        # the AI only counts down with a straight ahead; how much of each kind of road that is
        st = ev("""()=>{let n=0;for(let i=0;i<N;i++)if(runeStraight({mi:i,rib:0}))n++;return n/N}""")
        print(f'straight enough for the rocket: {st:.0%} of this track')
        check(0.08 < st < 0.85, f'the AI finds straights here, but not everywhere ({st:.2f})')
        ai = ev(f"""()=>{{({SETUP})();const a=T_ais[0],res=[];
            for(const want of [true,false]){{let i=0;while(runeStraight({{mi:i,rib:0}})!==want&&i<N)i++;
              T_put(a,i,0,25);a.held='sig';a.heldSig='rune';a.heldLvl=1;a.roll=0;a.heldAt=raceTime;a.frozen=0;a.spun=0;a.fartT=0;a.rcount=0;
              aiItemLines();res.push(a.rcount>0);clearBoss();a.held=null;}}return res}}""")
        check(ai == [True, False], f'a bot counts down on a straight, not into a corner {ai}')

        # live: what each one is worth on a straight, driven by a bot (the band off) so it keeps to the road
        def top_speed(sid, secs):
            # game time, not wall time: headless frames are slow and the game steps 0.1 s a frame at most
            use = f"a.held='sig';a.heldSig='{sid}';a.heldLvl=1;a.roll=0;useItem(a);" if sid else ''
            ev(f"""()=>{{({SETUP})();const a=T_ais[0];a.noBand=true;a.pace=1;T_put(a,player.si,0,25);a.boost=0;a.held=null;a.heldAt=1e9;
                T_put(player,player.si-200/SEG,0,0);{use}paused=false;window.T_t0=raceTime;window.T_top=0;
                window.T_iv=setInterval(()=>{{T_top=Math.max(T_top,a.speed);a.held=null;}},20);}}""")
            for _ in range(240):
                if ev(f"()=>raceTime-T_t0>={secs}"):
                    break
                wait(100)
            return ev("()=>{clearInterval(T_iv);paused=true;T_ais[0].noBand=false;return T_top}")
        base = top_speed('', 4.5)
        surf = top_speed('viking', 4.5)
        rocket = top_speed('rune', 4.5)
        print(f'top speed on a straight: plain {base:.1f}, surfing {surf:.1f}, rocket {rocket:.1f} m/s')
        check(surf > base * 1.12, f'surfing the wave is clearly faster ({surf:.1f} vs {base:.1f})')
        check(rocket > base * 1.3 and rocket > surf, f'the rocket is the biggest boost ({rocket:.1f})')

        # a soak: the bots get the three over and over in a live race, and nothing breaks
        ev("""()=>{clearPowerups();T_ais.forEach((k,i)=>T_put(k,player.si+20+i*12,(i%3-1)*3,25));paused=false;DBG.god=true;
            window.T_used={spoket:0,viking:0,rune:0};window.T_bad=0;let n=0;
            window.T_soak=setInterval(()=>{const k=T_ais[n++%T_ais.length],id=['spoket','viking','rune'][n%3];
              if(!k.held&&!k.done){k.held='sig';k.heldSig=id;k.heldLvl=1;k.roll=0;k.heldAt=raceTime-AI_HOLD-1;}
              for(const o of karts)if(!isFinite(o.x+o.z+o.y+o.vx+o.vz))T_bad++;},400);
            window.T_was=useItem;}""")
        t0 = ev("()=>raceTime")
        for _ in range(400):
            ev("()=>{for(const k of T_ais)if(k.usedAt!==k.T_seen){k.T_seen=k.usedAt;if(k.T_last in T_used)T_used[k.T_last]++;}"
               "for(const k of T_ais)k.T_last=k.held==='sig'?k.heldSig:null;}")
            if ev(f"()=>raceTime-{t0}>=30"):
                break
            wait(150)
        soak = ev("()=>{clearInterval(T_soak);paused=true;return {used:T_used,bad:T_bad,t:raceTime,"
                  "on:karts.filter(k=>k.ai&&!k.parked&&Math.abs(k.lat)<HW+4).length,all:karts.filter(k=>k.ai&&!k.parked).length}}")
        page.screenshot(path=str(ROOT / 'boss-soak.png'))
        check(all(v >= 2 for v in soak['used'].values()) and soak['bad'] == 0 and soak['on'] == soak['all'],
              f'30 s of bots using all three: no broken karts, everyone still on the road {soak}')

        # a new race clears everything away
        left = ev("""()=>{paused=true;T_use('spoket');player.held=null;T_use('viking');player.held=null;T_use('rune');T_step(1.6);
            clearPowerups();return boos.length+waves.length+pulses.length+vapours.length+
            karts.filter(k=>k.flood>0||k.rcount>0||k.rburn>0||k.scared>0).length}""")
        check(left == 0, f'clean-up leaves nothing behind ({left})')
        browser.close()
    httpd.shutdown()

    errors = [e for e in errors if 'net::ERR_FAILED' not in e]
    for e in errors:
        print('JS error:', e)
    if errors or fails:
        sys.exit('Boss items test FAILED')
    print('Boss items test passed')


if __name__ == '__main__':
    main()
