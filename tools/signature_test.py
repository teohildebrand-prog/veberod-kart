#!/usr/bin/env python3
"""Headless check of all eleven signature items (Carl's SJU LASS SVIN has its own svin_test.py), and that any driver can get any of them.

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
IDS = ['arne', 'billy', 'cow', 'bjorn', 'mehmet', 'anders', 'teo', 'amanda', 'britta', 'victor', 'carl']

# helpers put into the page: move a kart onto the main road, and line the player up behind an AI
HELPERS = """()=>{
  window.T_put=(k,i,lat,speed)=>{i=((Math.round(i)%N)+N)%N;k.rib=0;k.plan=0;k.si=i;k.lat=lat;
    k.ghost=0;k.spun=0;k.frozen=0;k.pulled=0;k.recoverT=0;k.air=false;if(k.ai){k.shield=0;k.pans=0;k.bucketLap=k.lap;}   /* no shield, and Anders' bucket already spent */
    k.x=sx[i]+rx[i]*lat;k.z=sz[i]+rz[i]*lat;k.yaw=Math.atan2(fx[i],fz[i]);
    k.vx=fx[i]*speed;k.vz=fz[i]*speed;k.y=groundK(k,k.x,k.z);k.vy=0;k.mi=mappedIdx(k);};
  window.T_rival=()=>karts.find(k=>k.ai&&!k.parked);
  window.T_behind=(n)=>{const a=T_rival();a.shield=0;a.pans=0;a.ghost=0;a.spun=0;a.frozen=0;a.pulled=0;
    const v=Math.max(a.speed,25);T_put(a,a.si,0,v);T_put(player,a.si-n,0,v);
    const b=karts.find(k=>k.ai&&!k.parked&&k!==a);T_put(b,a.si+12,HW*.4,v);return a.idx;};
  window.T_use=(id)=>{dbgGive('sig',id);player.roll=0;useItem(player);};
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
        ev(HELPERS)
        ev("()=>{DBG.god=true;}")   # rival items never land on the player, so each check sees only its own item
        wait = page.wait_for_timeout

        def until(js, ms):
            # headless frames can be slow, and game time only runs 0.1 s per frame at most: poll, don't sleep
            for _ in range(ms // 250):
                if ev(js):
                    return True
                wait(250)
            return bool(ev(js))

        # the box: 25 % signature items, any of the eleven, the driver's own twice as often
        odds = ev("""()=>{const k=player,was=k.sig,n=60000,c={};let s=0;k.sig='arne';
            for(let i=0;i<n;i++){const r=rollItem(k);if(r[0]==='sig'){s++;c[r[2]]=(c[r[2]]||0)+1;}}
            k.sig=null;let s2=0;const c2={};for(let i=0;i<n;i++){const r=rollItem(k);if(r[0]==='sig'){s2++;c2[r[2]]=1;}}
            k.sig=was;return {share:s/n,own:c.arne/s,other:c.billy/s,kinds:Object.keys(c).length,share2:s2/n,kinds2:Object.keys(c2).length};}""")
        check(0.235 < odds['share'] < 0.265, f"signature share {odds['share']:.3f}")
        check(0.145 < odds['own'] < 0.19 and 0.068 < odds['other'] < 0.10,
              f"own item {odds['own']:.3f}, another driver's {odds['other']:.3f}")
        check(odds['kinds'] == 11 and odds['kinds2'] == 11 and 0.235 < odds['share2'] < 0.265,
              f"all eleven turn up, also for a driver without one ({odds['kinds2']}, {odds['share2']:.3f})")
        # the roulette shows signature items among the normal ones and still lands on the real item
        reel = ev("""()=>{const out=[];for(const h of ['boost','sig']){giveItem(player,h,1,'arne');
            const f=[];for(let i=0;i<=1400;i++){player.roll=ROLLT*Math.sqrt(1-i/1400*13.99/14);const s=slotFrame(player);
              if(!f.length||f[f.length-1].frame!==s.frame)f.push(s);}
            player.roll=0;const end=slotFrame(player);player.held=null;
            out.push({frames:f.length,sigs:f.filter(s=>s.fam==='sig').length,ids:new Set(f.filter(s=>s.fam==='sig').map(s=>s.sid)).size,
              fams:new Set(f.map(s=>s.fam)).size,ok:f.every(s=>s.fam==='sig'?!!SIGS[s.sid]:!!ITEMICON[s.fam+s.lvl]),
              end:end.fam+(end.fam==='sig'?end.sid:end.lvl)});}return out;}""")
        check(all(r['frames'] == 14 and r['sigs'] >= 4 and r['ids'] >= 4 and r['fams'] == 6 and r['ok'] for r in reel)
              and reel[0]['end'] == 'boost1' and reel[1]['end'] == 'sigarne', f'box roulette spins past signature items {reel}')
        own = ev("()=>CHARS.filter(c=>!c.boss).map(c=>sigOf(c.id))")
        check(own == ['arne', 'billy', 'cow', 'bjorn', 'mehmet', 'anders', 'teo', 'amanda', 'britta', 'victor', 'carl'],
              f'every starting driver has their own item: {own}')
        check(ev("()=>sigOf('granny')==='britta'&&karts.filter(k=>k.ai).every(k=>k.cfg.kind==='generic'||k.sig)"),
              'AI drivers (Britta too) know their own item')
        names = ev(f"()=>{IDS}.map(id=>{{giveItem(player,'sig',1,id);const n=itemName('sig',1);player.held=null;return n;}})")
        check(len(set(names)) == 11, f'eleven HUD names {names}')
        check(ev("()=>{DBG.open=true;renderDbg();const n=document.querySelectorAll('#dbg [data-a^=\"give:sig:\"]').length;"
                 "DBG.open=false;return n||document.getElementById('dbg').innerHTML.split('give:sig:').length-1;}") >= 11,
              'debug menu hands out all eleven')

        page.keyboard.down('w')
        wait(4500)

        # Bogserlinan: hook the kart ahead
        ev("()=>{T_behind(14);T_use('arne');}")
        seen = {'bite': False, 'tow': False, 'towed': False}
        for _ in range(30):
            wait(100)
            s = ev("()=>({bite:hooks.some(h=>h.tow&&h.target),tow:player.tow>0,towed:karts.some(o=>o.towed>0)})")
            for key in seen:
                seen[key] = seen[key] or s[key]
            if seen['tow'] and seen['bite']:
                page.screenshot(path=str(ROOT / 'sig-tow.png'))
                break
        check(seen['bite'] and seen['tow'] and seen['towed'], f'tow rope bites and tows {seen}')
        check(until("()=>!hooks.some(h=>h.tow)&&player.tow===0", 9000), 'tow rope gone afterwards')

        # Visa körkortet!: the kart ahead is stopped and shows its licence
        a = ev("()=>{const i=T_behind(16);updateSigs(0);const o=licTarget(player);return o?o.idx:i;}")
        sp0 = ev(f"()=>karts[{a}].speed")
        top = ev(f"()=>karts[{a}].maxSpeed*LIC.top")
        ev("()=>T_use('billy')")
        wait(500)
        until(f"()=>karts[{a}].licG&&karts[{a}].licG.visible", 3000)
        lic = ev(f"()=>({{pulled:karts[{a}].pulled,speed:karts[{a}].speed,card:!!karts[{a}].licG&&karts[{a}].licG.visible,"
                 f"siren:!!player.sirenG&&player.sirenG.visible,held:player.held}})")
        page.screenshot(path=str(ROOT / 'sig-licence.png'))
        check(lic['pulled'] > 0 and lic['card'] and lic['siren'] and lic['speed'] < top * 1.15 + 0.5,
              f'kart ahead pulled over ({sp0:.1f} -> {lic["speed"]:.1f} m/s, cap {top:.1f}) {lic}')
        check(until(f"()=>karts[{a}].pulled===0&&!karts[{a}].licG.visible", 5000), 'pulled-over kart drives on')
        kept = ev("""()=>{const ai=karts.filter(k=>k.ai);ai.forEach(k=>k._p=k.parked);ai.forEach(k=>k.parked=true);
            T_use('billy');const r=[player.held,player.heldSig];ai.forEach(k=>k.parked=k._p);player.held=null;player.heldSig=null;return r;}""")
        check(kept == ['sig', 'billy'], f'nobody to stop: the item stays in the slot {kept}')

        # Kreatursöverfarten: cows cross in front of the leader, and knock a kart aside
        ev("()=>T_use('cow')")
        wait(1200)
        h = ev("()=>herds.length&&({n:herds[0].cows.filter(g=>g.visible).length,lead:karts.filter(k=>k!==player).sort((a,b)=>a.place-b.place)[0].idx,si:herds[0].si})")
        check(bool(h) and h['n'] >= 1, f'herd on the road {h}')
        if h:
            hit = ev(f"""()=>{{const H=herds[0],c=H.cows.find(g=>g.visible),o=karts.find(k=>k.ai&&!k.parked&&k.sig!=='cow');
                o.shield=0;o.pans=0;o.slow=0;H.hit.delete(o);T_put(o,H.si,c.userData.lat,20);updateHerds(0.001);
                return o.slow>0&&H.hit.has(o);}}""")
            check(hit, 'a cow knocks a kart aside')
            maj = ev("""()=>{const H=herds[0],c=H.cows.find(g=>g.visible);if(!c)return 'gone';const o=T_rival();const was=o.sig;
                o.sig='cow';o.slow=0;H.hit.delete(o);T_put(o,H.si,c.userData.lat,20);updateHerds(0.001);o.sig=was;return o.slow===0;}""")
            check(maj in (True, 'gone'), 'the cows let Majros past')
            gaps = ev("()=>{const H=herds[0];const L=H.cows.map((g,q)=>H.from+H.dir*(H.speed*H.t-q*HERD.space));return Math.min(...L.slice(1).map((l,q)=>Math.abs(l-L[q])));}")
            check(gaps >= 4.0, f'gaps between the cows: {gaps:.1f} m')
            ev(f"()=>T_put(player,herds[0].si-24,0,10)")
            wait(300)
            page.screenshot(path=str(ROOT / 'sig-cows.png'))
        check(until("()=>herds.length===0", 20000), 'the herd has crossed and gone')

        # Kompisarna: two mopeds ride in front, a boost and a draft
        ev("()=>{T_put(player,player.si,0,25);T_use('mehmet');}")
        until("()=>player.matesG&&player.matesG.every(g=>g.visible)", 3000)
        m = ev("()=>({mates:player.mates,boost:player.boost,shown:player.matesG.every(g=>g.visible),top:sigTop(player)})")
        page.screenshot(path=str(ROOT / 'sig-mates.png'))
        check(m['mates'] > 0 and m['boost'] > 0 and m['shown'] and m['top'] > 1, f'mates ride in front {m}')
        suck = ev("()=>{const k=player;k.suck=0;k.air=false;suget(k,0.5);return k.suck;}")
        check(suck > 0, 'Suget charges off the mates')
        check(until("()=>player.mates===0&&player.matesG.every(g=>!g.visible)", 12000), 'mates gone after four seconds')

        # Gödselspridaren: mud patches behind, slow for a road kart, fine for the spreader
        ev("()=>{T_put(player,player.si,0,25);T_use('anders');}")
        check(until("()=>player.spread===0&&muck.length<=MUCK.cap", 9000), 'spreading stops after three seconds')
        mk = ev("""()=>{const n=muck.length,p=muck[muck.length-1],o=T_rival();o.mucky=0;o.offRoad=0.5;
            o.x=p.x;o.z=p.z;o.y=p.y;o.rib=0;o.air=false;updateMuck(0.001);
            const own=player.mucky;player.x=p.x;player.z=p.z;updateMuck(0.001);
            return {n,hit:o.mucky>0,top:sigTop(o),own:player.mucky===0||own>0};}""")
        page.screenshot(path=str(ROOT / 'sig-muck.png'))
        check(mk['n'] >= 5 and mk['hit'] and mk['top'] < 0.85, f'muck slows a road kart {mk}')
        check(ev("()=>{player.mucky=0;const p=muck[muck.length-1];player.x=p.x;player.z=p.z;updateMuck(0.001);return player.mucky;}") == 0,
              "the spreader drives through their own muck")

        # Tifot: everyone ahead sees stripes; the player's own view is half covered when hit
        a = ev("()=>T_behind(20)")
        ev("()=>T_use('teo')")
        until("()=>player.tifoG&&player.tifoG.visible", 3000)
        t = ev(f"()=>({{blind:karts[{a}].blind,scarf:player.tifoG.visible,overlay:document.getElementById('tifo').classList.contains('on')}})")
        page.screenshot(path=str(ROOT / 'sig-tifo.png'))
        check(t['blind'] > 0 and t['scarf'] and not t['overlay'], f'tifo blinds the kart ahead {t}')
        ev("()=>{player.blind=1.2;updateSigs(0.001);}")
        wait(250)
        ov = ev("()=>{const e=document.getElementById('tifo'),r=e.getBoundingClientRect();return {on:e.classList.contains('on'),bottom:r.bottom/innerHeight};}")
        page.screenshot(path=str(ROOT / 'sig-tifo-hit.png'))
        check(ov['on'] and ov['bottom'] < 0.8, f'tifo covers the top of the screen, not the road ahead {ov}')
        check(until("()=>!document.getElementById('tifo').classList.contains('on')&&player.tifo===0", 7000), 'tifo comes down')

        # Garnnystanet: yarn across most of the road behind, a gap on the other side
        ev("()=>{T_put(player,player.si,HW*.5,25);T_use('britta');}")
        until("()=>yarns.length&&yarns[0].t>YARN.roll", 6000)
        y = ev("""()=>{const Y=yarns[0];if(!Y)return null;const o=T_rival(),q=karts.filter(k=>k.ai&&!k.parked)[1];
            for(const k of [o,q]){k.shield=0;k.pans=0;k.slick=0;k.bike=0;k.air=false;Y.hit.delete(k);}
            T_put(o,Y.si,(Y.a+Y.b)/2,20);T_put(q,Y.si,-Y.a,20);updateYarns(0.001);
            return {a:Y.a,b:Y.b,hit:o.slick>0,gap:q.slick===0,why:[o.done,o.parked,o.ghost,o.rib,o.air,sigWrap(o.si-Y.si),+o.lat.toFixed(2),Y.t.toFixed(2),o===q]};}""")
        page.screenshot(path=str(ROOT / 'sig-yarn.png'))
        check(bool(y) and y['hit'] and y['gap'], f'yarn tangles, the gap is clear {y}')

        # Tidtagningsrättelse: everyone near stops dead in a block of ice
        a = ev("()=>T_behind(6)")
        ev("()=>T_use('victor')")
        until(f"()=>karts[{a}].iceG&&karts[{a}].iceG.visible", 3000)
        f1 = ev(f"()=>({{frozen:karts[{a}].frozen,speed:karts[{a}].speed,x:karts[{a}].x,z:karts[{a}].z,ice:karts[{a}].iceG.visible,me:player.frozen||0}})")
        wait(400)
        page.screenshot(path=str(ROOT / 'sig-freeze.png'))
        f2 = ev(f"()=>({{x:karts[{a}].x,z:karts[{a}].z}})")
        moved = ((f2['x'] - f1['x']) ** 2 + (f2['z'] - f1['z']) ** 2) ** .5
        check(f1['frozen'] > 0 and f1['speed'] == 0 and f1['ice'] and f1['me'] == 0 and moved < 0.5,
              f'nearby kart frozen in place (moved {moved:.2f} m) {f1}')
        check(until(f"()=>karts[{a}].frozen===0&&!karts[{a}].iceG.visible", 5000), 'the ice melts')

        # Cykla mer!: no fuel, nothing hits, vehicle swapped for the bike
        ev("()=>{T_put(player,player.si,0,25);T_use('bjorn');}")
        wait(400)
        b = ev("""()=>({bike:player.bike>0,shown:player.bikeG.visible,
            hidden:player.v.root.children.filter(c=>c!==player.bikeG).every(c=>!c.visible),
            fuel:player.fuel,immune:(DBG.god=false,blockHit(player))})""")
        wait(1000)
        ev("()=>{DBG.god=true;}")
        page.screenshot(path=str(ROOT / 'sig-bike.png'))
        fuel2 = ev("()=>player.fuel")
        check(b['bike'] and b['shown'] and b['hidden'], f'bike on, vehicle hidden {b}')
        check(b['immune'], 'bike blocks hits')
        check(abs(fuel2 - b['fuel']) < 0.01, f'no fuel while pedalling ({b["fuel"]:.2f} -> {fuel2:.2f})')
        until("()=>player.bike===0", 12000)
        b2 = ev("()=>({bike:player.bike,shown:player.bikeG.visible,lean:player.v.lean.visible})")
        check(b2['bike'] == 0 and not b2['shown'] and b2['lean'], f'back in the vehicle {b2}')

        # Färdplanen: the line shows, and sitting on it counts
        ev("()=>{T_put(player,player.si,0,25);T_use('amanda');}")
        wait(300)
        pl = ev("""()=>{const L=[];for(let i=0;i<N;i++)L.push(planLat(i));
            return {shown:player.planG.visible,min:Math.min(...L),max:Math.max(...L),hw:HW}}""")
        page.screenshot(path=str(ROOT / 'sig-plan.png'))
        check(pl['shown'] and -pl['hw'] < pl['min'] < 0 < pl['max'] < pl['hw'], f'plan line inside the road {pl}')
        on = ev("""()=>{const k=player;k.rib=0;k.fplan=Math.max(k.fplan,1);const i=k.si,L=planLat(i);k.x=sx[i]+rx[i]*L;k.z=sz[i]+rz[i]*L;k.lat=L;
            updateSigs(0.016);const a=k.onPlan;k.lat=L+PLAN.w+1;updateSigs(0.016);return [a,k.onPlan];}""")
        check(on == [True, False], f'on the line counts, off it not {on}')
        check(until("()=>!player.planG.visible&&!player.onPlan", 15000), 'plan gone after five seconds')

        # the AI plays any signature item it gets
        played = []
        for sid in IDS:
            idx = ev(f"""()=>{{const a=T_rival(),i=T_behind(10);a.held=null;giveItem(a,'sig',1,'{sid}');a.roll=0;
                return i;}}""")
            for _ in range(25):
                wait(100)
                if ev(f"()=>karts[{idx}].held!=='sig'"):
                    played.append(sid)
                    break
        check(len(played) >= 8, f'AI plays signature items: {played}')

        page.keyboard.up('w')
        wait(500)
        # a new race clears everything away
        left = ev("""()=>{clearPowerups();return herds.length+svinHerds.length+muck.length+yarns.length+rings.length+
            karts.filter(k=>k.frozen||k.blind||k.pulled||k.mates||k.spread).length;}""")
        check(left == 0, f'clean-up leaves nothing behind ({left})')
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
