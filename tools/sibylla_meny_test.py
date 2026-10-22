#!/usr/bin/env python3
"""Headless check of the Sibylla bonus event: Sibyllas meny (the track's own six items) and the
Burgarbus.

    CHROMIUM=/path/to/chrome python3 tools/sibylla_meny_test.py

Starts a race on the Sibylla track and checks that every box there hands out one of the six
menu items (and that they never come out anywhere else), then each item: NUMMER 47! stops the
leader at a hatch, LÄSKPÅFYLLNING boosts and then burps karts aside, MOSKANONEN splats the kart
ahead and the player's screen, TUNNBRÖDSRULLEN bowls karts over and leaves you dizzy,
BURGARTORNET stacks two layers and then burgerRolls back down the road, KORV MED BRÖD carries the kart
it hits backwards. Then the AI uses them, and the burger kart. Screenshots go to meny-*.png in
the repo root (ignored by git). Exit 1 on any failure.
"""
import os
import sys
from pathlib import Path

from playwright.sync_api import sync_playwright

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from smoke_test import serve  # noqa: E402
from signature_test import HELPERS  # noqa: E402

ROOT = Path(__file__).resolve().parent.parent
MENU = ['nummer', 'lask', 'mos', 'rulle', 'torn', 'korv']


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
        wait = page.wait_for_timeout
        card = ev("""()=>{const si=STAGES.findIndex(s=>s.id==='sibylla'),k=SS.list.indexOf(si);
            const el=document.querySelector('.scard[data-k="'+k+'"]');return {k,bonus:!!el&&!!el.querySelector('.sc-bonus')}}""")
        check(card['k'] >= 0 and card['bonus'], f'Sibylla is in the stage list with the BONUSBANA ribbon {card}')
        ev("()=>{SS.hi=SS.list.indexOf(STAGES.findIndex(s=>s.id==='sibylla'));renderPreview();}")
        check(ev("()=>document.body.innerText.includes('Bara banans egna föremål')"),
              "the stage card says the boxes hold the track's own items")
        page.click('#btnStageGo', timeout=10000)
        page.click('#btnGo', timeout=10000)
        wait(5000)
        check(ev("()=>stage.id") == 'sibylla', 'the race is on the Sibylla track')
        ev(HELPERS)
        ev("()=>{DBG.god=true;for(const it of items)it.cool=99;}")   # no box refills a slot during the checks

        def until(js, ms):
            for _ in range(ms // 250):
                if ev(js):
                    return True
                wait(250)
            return bool(ev(js))

        # the boxes: only the six here, all of them, and never anywhere else
        odds = ev("""()=>{const k=player,n=12000,c={};let other=0;
            for(let i=0;i<n;i++){const r=rollItem(k);if(r[0]==='sig'&&SIGS[r[2]].event==='sibylla')c[r[2]]=(c[r[2]]||0)+1;else other++;}
            const was=stage;stage=STAGES.find(s=>s.id==='lund');let off=0;
            for(let i=0;i<n;i++){const r=rollItem(k);if(r[0]==='sig'&&SIGS[r[2]].event)off++;}stage=was;
            let pick=0;for(let i=0;i<n;i++)if(SIGS[pickSig(k)].event)pick++;
            const reel=new Set();giveItem(k,'sig',1,'korv');
            for(let i=0;i<=200;i++){k.roll=ROLLT*(1-i/201);const f=slotFrame(k);reel.add(f.fam==='sig'?f.sid:f.fam);}
            k.roll=0;k.held=null;k.heldSig=null;
            return {c,other,off,pick,reel:[...reel].sort()}}""")
        check(odds['other'] == 0 and sorted(odds['c']) == sorted(MENU) and min(odds['c'].values()) > 1500,
              f"every box on Sibylla gives a menu item, all six come up {odds['c']}")
        check(odds['off'] == 0 and odds['pick'] == 0, f'and never anywhere else {odds}')
        check(odds['reel'] == sorted(MENU), f"the roulette spins only the menu {odds['reel']}")

        page.keyboard.down('w')
        wait(2500)
        # NUMMER 47!: the leader stops at the hatch
        r = ev("""()=>{const a=T_rival();T_put(a,player.si+30,0,30);a.place=1;player.place=2;
            for(const o of karts)if(o!==a&&o!==player)o.place=3+o.idx;
            T_use('nummer');const t=a.order;updateMenu(0.016);drawMenu();
            return {t,who:a.idx,hatch:!!a.hatchG&&a.hatchG.visible,top:menuTop(a),ok:orderTarget(player)!==a}}""")
        check(r['t'] > 1 and r['hatch'] and r['top'] < 0.2, f'NUMMER 47!: the leader stops at a hatch {r}')
        wait(300)
        page.screenshot(path=str(ROOT / 'meny-nummer.png'))
        check(until(f"()=>!(karts[{r['who']}].order>0)", 3000), 'and drives on after the bag')

        # LÄSKPÅFYLLNING: a boost, then the burp shoves a kart close by
        s = ev("""()=>{clearMenu();const a=T_rival();T_put(player,player.si,0,25);T_put(a,player.si,3,25);
            T_use('lask');const b=player.boost;a.vx=fx[a.si]*25;a.vz=fz[a.si]*25;
            return {b,soda:player.soda,cup:!!player.cupG,who:a.idx}}""")
        check(s['b'] >= 1.9 and s['soda'] > 1.5 and s['cup'], f'LÄSKPÅFYLLNING: a boost and a cup on the roof {s}')
        wait(400)
        page.screenshot(path=str(ROOT / 'meny-lask.png'))
        burp = ev(f"""()=>{{const a=karts[{s['who']}];T_put(a,player.si,3,25);a.slow=0;player.soda=0.001;
            const v0=a.vx*rx[a.si]+a.vz*rz[a.si];updateMenu(0.016);
            return {{side:Math.abs(a.vx*rx[a.si]+a.vz*rz[a.si]-v0),slow:a.slow,soda:player.soda}}}}""")
        check(burp['side'] > 5 and burp['slow'] > 0.3 and burp['soda'] == 0, f'and the burp shoves a kart aside {burp}')

        # MOSKANONEN: a mash ball at the kart ahead; the player's own screen when they are hit
        m = ev("""()=>{clearMenu();const a=T_rival();T_put(player,player.si,0,25);T_put(a,player.si+12,2,20);a.mashed=0;
            T_use('mos');return {n:mashes.length,who:a.idx}}""")
        check(m['n'] == 1, 'MOSKANONEN: a mash ball flies')
        check(until("()=>karts.some(o=>o!==player&&o.mashed>0)", 3000), 'it hits the kart ahead')
        check(ev("()=>menuTop(karts.find(o=>o!==player&&o.mashed>0))") < 1, 'and the AI drives slower with mash on its windscreen')
        ev("""()=>{const a=T_rival();T_put(a,player.si-10,0,30);player.lat=0;
            for(const o of karts)if(o!==a&&o!==player)T_put(o,player.si+200+o.idx*6,0,0);   /* nobody else in the way */
            DBG.god=false;fireMash(a);mashes[0].target=player;}""")
        check(until("()=>player.mashed>0", 3000), 'a bot can splat the player')
        wait(200)
        mos = ev("()=>({on:document.getElementById('mos').classList.contains('on'),op:+document.getElementById('mos').style.opacity})")
        page.screenshot(path=str(ROOT / 'meny-mos.png'))
        ev("()=>{DBG.god=true;}")
        check(mos['on'] and mos['op'] > 0.5, f'the player\'s screen fills with mash {mos}')
        check(until("()=>!document.getElementById('mos').classList.contains('on')", 5000), 'and the wipers clear it')

        # TUNNBRÖDSRULLEN: faster, bowls a kart over, dizzy after
        w = ev("""()=>{clearMenu();const a=T_rival();T_put(player,player.si,0,25);T_use('rulle');
            T_put(a,player.si+1,1,25);a.slow=0;const v0=a.vy;updateMenu(0.016);drawMenu();
            return {wrap:player.wrap,top:menuTop(player),hit:player.wrapHit.has(a),slow:a.slow,shown:player.wrapG.visible,hid:player.v.root.children.every(c=>c===player.wrapG||!c.visible)}}""")
        check(w['wrap'] > 2 and w['top'] > 1.1 and w['shown'] and w['hid'], f'TUNNBRÖDSRULLEN: rolled up and faster {w}')
        check(w['hit'] and w['slow'] > 0.3, f'and a kart in the way is bowled over {w}')
        page.screenshot(path=str(ROOT / 'meny-rulle.png'))
        dz = ev("()=>{player.slow=0;player.wrap=0.001;updateMenu(0.016);return {slow:player.slow,wrap:player.wrap,back:player.v.root.children.some(c=>c!==player.wrapG&&c.visible)&&!player.wrapG.visible}}")
        check(dz['slow'] > 0.5 and dz['wrap'] == 0 and dz['back'], f'dizzy afterwards {dz}')

        # BURGARTORNET: two layers on the roof, then it burgerRolls back down the road
        ev("()=>{clearMenu();T_put(player,player.si,0,25);T_use('torn');}")
        t1 = ev("()=>({tower:player.tower,held:player.heldSig,name:SIGS.torn.name,mass:menuMass(player)/player.mass,grip:menuGrip(player)})")
        check(t1['tower'] == 1 and t1['held'] == 'torn' and t1['name'] == 'BURGARTORNET ×2',
              f'BURGARTORNET: one layer, kept in the slot {t1}')
        check(t1['mass'] > 1.3 and t1['grip'] < 1, f'heavier in bumps, less grip {t1}')
        ev("()=>{T_put(player,player.si,0,25);useItem(player);}")
        check(ev("()=>player.tower") == 1, 'a press straight after does nothing')
        check(until("()=>player.towerCool===0", 3000), 'the gap runs out')
        ev("()=>{T_put(player,player.si,0,25);useItem(player);}")
        wait(300)
        page.screenshot(path=str(ROOT / 'meny-torn.png'))
        check(ev("()=>player.tower===2&&player.towerG.children.length===2"), 'two layers')
        check(until("()=>player.towerCool===0", 3000), 'the gap runs out again')
        tb = ev("""()=>{T_put(player,player.si,0,25);useItem(player);const R=burgerRolls[0];if(!R)return null;const a=T_rival();
            const s0=R.s;updateMenu(0.1);const back=sigWrap(R.s-s0);
            T_put(a,R.s,R.lat,20);a.x=R.g.position.x;a.z=R.g.position.z;a.spun=0;const sh=a.shield,d=Math.hypot(a.x-R.g.position.x,a.z-R.g.position.z);updateMenu(0.016);
            return {n:burgerRolls.length,back,held:player.held,tower:player.tower,spun:a.spun,sh,d,hit:R.hit.has(a),air:a.air,dy:a.y-R.g.position.y}}""")
        check(bool(tb) and tb['n'] == 1 and tb['back'] < 0 and tb['held'] is None and tb['tower'] == 0,
              f'the third press: it falls off and rolls back down the road {tb}')
        check(bool(tb) and tb['spun'] > 0.5, f'and spins a kart it rolls into {tb}')
        lost = ev("""()=>{clearMenu();T_put(player,player.si,0,25);T_use('torn');player.held=null;player.heldSig=null;updateMenu(0.016);
            return {tower:player.tower,burgerRolls:burgerRolls.length}}""")
        check(lost['tower'] == 0 and lost['burgerRolls'] == 1, f'a tower whose item is taken away falls off {lost}')

        # KORV MED BRÖD: the bun carries the kart it hits backwards
        k = ev("""()=>{clearMenu();const a=T_rival();T_put(player,player.si,0,25);T_put(a,player.si+14,player.lat,15);a.bunned=0;
            for(const o of karts)if(o!==a&&o!==player)T_put(o,player.si+200+o.idx*6,0,0);   /* nobody else in the way */
            T_use('korv');return {n:korvs.length,who:a.idx}}""")
        check(k['n'] == 1, 'KORV MED BRÖD: the sausage flies')
        check(until(f"()=>karts[{k['who']}].bunned>0", 3000), 'it catches the kart ahead in a bun')
        wait(700)
        back = ev(f"""()=>{{const a=karts[{k['who']}];return {{fwd:a.vx*Math.sin(a.yaw)+a.vz*Math.cos(a.yaw),bun:a.bunG.visible,b:a.bunned}}}}""")
        page.screenshot(path=str(ROOT / 'meny-korv.png'))
        check(back['fwd'] < 0 and back['bun'], f'and carries it backwards {back}')

        # the AI uses each of them in the right spot
        page.keyboard.up('w')
        ai = ev("""()=>{const out={};
          for(const id of ['nummer','lask','mos','rulle','torn','korv']){clearMenu();
            const a=T_rival(),i=T_behind(10);a.held=null;a.heldSig=null;a.towerLeft=0;a.towerCool=0;
            const o=karts.find(k=>k.ai&&!k.parked&&k!==a);T_put(o,a.si+12,a.lat,25);T_put(player,a.si-8,0,25);
            o.place=1;a.place=2;player.place=3;
            giveItem(a,'sig',1,id);a.roll=0;a.spun=0;a.fartT=0;a.frozen=0;a.heldAt=raceTime;aiItemLines();
            out[id]=a.held===null||a.tower>0;}
          clearMenu();return out;}""")
        check(all(ai.values()), f'the AI uses every menu item {ai}')

        # the burger kart
        bus = ev("""()=>{const c=CARS.findIndex(r=>r.id==='burgarbus'),C=CARS[c];if(c<0)return null;
            const v=buildKart(0x1f4fb4,'teo','burgarbus');let n=0;v.root.traverse(o=>{if(o.isMesh)n++;});
            return {last:c>CARS.findIndex(r=>r.id==='domarvagn'),n,mul:C.mul,free:!C.sig}}""")
        check(bool(bus) and bus['last'] and bus['n'] > 60 and bus['free'],
              f'the Burgarbus is in the car list for everyone and builds {bus and bus["n"]} meshes')
        bell = ev("""()=>{let rang=0;window.T_was=carSel;applyCar(CARS.findIndex(r=>r.id==='burgarbus'));const f=sibBell;window.sibBell=()=>{rang++;};try{honk();}finally{window.sibBell=f;}applyCar(T_was);return rang;}""")
        check(bell == 1, 'the horn is the order bell')

        # a new race clears everything away
        left = ev("""()=>{for(const id of ['nummer','lask','mos','rulle','torn','korv'])T_use(id);clearPowerups();
            return mashes.length+burgerRolls.length+korvs.length+karts.filter(k=>k.order||k.soda||k.wrap||k.tower||k.bunned||k.mashed).length;}""")
        check(left == 0, f'clean-up leaves nothing behind ({left})')
        browser.close()
    httpd.shutdown()
    errors = [e for e in errors if 'net::ERR_FAILED' not in e]   # the web fonts, blocked offline
    for e in errors:
        print('JS error:', e)
    if errors or fails:
        sys.exit('sibylla meny test FAILED')
    print('sibylla meny test passed')


if __name__ == '__main__':
    main()
