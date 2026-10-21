#!/usr/bin/env python3
"""Headless check of the beans: the green gas cloud and the spettekaka spin it gives.

    CHROMIUM=/path/to/chrome python3 tools/beans_test.py

Starts a race, uses all three levels of beans with a rival behind or beside, and checks the
cloud, the spin, that the eater drives through their own gas, the shield, the AI and the
clean-up. Screenshots go to beans-*.png in the repo root (ignored by git). Exit 1 on any failure.
"""
import os
import sys
from pathlib import Path

from playwright.sync_api import sync_playwright

from smoke_test import serve

ROOT = Path(__file__).resolve().parent.parent

HELPERS = """()=>{
  window.T_put=(k,i,lat,speed)=>{i=((Math.round(i)%N)+N)%N;k.rib=0;k.plan=0;k.si=i;k.lat=lat;
    k.ghost=0;k.spun=0;k.frozen=0;k.pulled=0;k.recoverT=0;k.air=false;k.bike=0;
    if(k.ai){k.shield=0;k.pans=0;k.bucketLap=k.lap;}
    k.x=sx[i]+rx[i]*lat;k.z=sz[i]+rz[i]*lat;k.yaw=Math.atan2(fx[i],fz[i]);
    k.vx=fx[i]*speed;k.vz=fz[i]*speed;k.y=groundK(k,k.x,k.z);k.vy=0;k.mi=mappedIdx(k);};
  window.T_ai=(n)=>karts.filter(k=>k.ai&&!k.parked)[n||0];
  window.T_gasMeshes=()=>scene.children.filter(o=>o.geometry===gasGeo).length;
  window.T_inBlob=(k,c)=>{const b=c.blobs[c.blobs.length-1];k.x=b.x;k.z=b.z;k.y=b.y-.6;};
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
        wait = page.wait_for_timeout
        ev(HELPERS)
        ev("()=>{DBG.god=true;}")   # rival items never land on the player
        page.keyboard.down('w')
        wait(4000)

        # in the race: each level, a rival right behind (or beside, for bruna bönor)
        for lvl, back, lat in ((1, 9, 0), (2, 9, 2.6), (3, 0, 4.2)):
            ev(f"""()=>{{const a=T_ai(0);T_put(player,player.si,0,24);T_put(a,player.si-{back},{lat},24);
                a.held=null;a.slow=0;a.boost=0;window.T_a=a;
                dbgGive('fart',{lvl});useItem(player);}}""")
            seen = {'cloud': False, 'blobs': 0, 'meshes': 0, 'spun': 0.0, 'own': 0.0}
            shot = False
            for _ in range(40):
                wait(100)
                s = ev("()=>({cloud:gasClouds.some(c=>c.owner===player),blobs:gasClouds.reduce((n,c)=>n+c.blobs.length,0),"
                       "meshes:T_gasMeshes(),spun:T_a.spun,own:player.spun})")
                seen['cloud'] = seen['cloud'] or s['cloud']
                for key in ('blobs', 'meshes', 'spun', 'own'):
                    seen[key] = max(seen[key], s[key])
                if s['cloud'] and not shot and s['blobs'] > 6:
                    page.screenshot(path=str(ROOT / f'beans-{lvl}.png'))
                    shot = True
                if seen['spun'] > 0 and shot:
                    break
            check(seen['cloud'] and seen['blobs'] >= 6 and seen['meshes'] == seen['blobs'],
                  f'level {lvl}: a green cloud pours out of the kart {seen}')
            check(seen['spun'] > 0, f'level {lvl}: the rival who drives into it spins out (spun {seen["spun"]:.2f})')
            check(seen['own'] == 0, f'level {lvl}: the eater is not hit by their own gas')
            check(ev("()=>gasClouds.every(c=>c.hit.size<=karts.length)"), f'level {lvl}: hits counted once per kart')
            check(ev("()=>{const c=gasClouds.find(c=>c.owner===player);return !c||Math.abs(c.end-c.G.emit-c.G.life)<1e-6;}"),
                  f'level {lvl}: cloud lifetime set')
            check(ev(f"()=>{{const c=gasClouds.find(c=>c.owner===player);return !!c&&c.lvl==={lvl};}}"), f'level {lvl}: right level')
            check(ev("()=>{let n=0;for(let i=0;i<120&&gasClouds.length;i++){updateFarts(.1);n++;}return gasClouds.length===0&&T_gasMeshes()===0;}"),
                  f'level {lvl}: the cloud thins out and is gone')

        # what a rival's gas looks like from behind it
        ev("()=>{clearPowerups();const a=T_ai(0);T_put(player,player.si,0,22);T_put(a,player.si+16,0,22);blast(a,2);}")
        until = lambda js, ms: any(ev(js) or wait(100) for _ in range(ms // 100))
        until("()=>gasClouds.length&&gasClouds[0].t>0.7", 4000)
        page.screenshot(path=str(ROOT / 'beans-ahead.png'))

        # the exact rules, one frame at a time
        ev("()=>{T_put(player,player.si,0,0);T_put(T_ai(0),player.si+40,0,0);T_put(T_ai(1),player.si+70,0,0);}")
        r = ev("""()=>{clearPowerups();const a=T_ai(0),b=T_ai(1);blast(a,2);   /* no stray clouds from the live race */const c=gasClouds[gasClouds.length-1];updateFarts(.3);
            b.spun=0;T_inBlob(b,c);updateFarts(.001);const hit=b.spun,sr=b.spinResist,boost=b.boost;
            b.spun=0;T_inBlob(b,c);updateFarts(.001);const again=b.spun;
            a.spun=0;T_inBlob(a,c);updateFarts(.001);const own=a.spun;
            const o=T_ai(2)||player;o.spun=0;o.shield=9;o.pans=0;o.bike=0;o.ghost=0;T_inBlob(o,c);updateFarts(.001);
            const shield=[o.spun,o.shield];
            return {hit,sr,boost,again,own,shield};}""")
        check(abs(r['hit'] - 1.5 * r['sr']) < 0.01 and r['boost'] == 0, f'a hit is the spettekaka spin, boost gone {r}')
        check(r['again'] == 0, 'one spin per cloud, however long you sit in it')
        check(r['own'] == 0, 'whoever ate the beans drives through their own gas')
        check(r['shield'] == [0, 0], f'äggakaka takes the hit instead {r["shield"]}')
        ev("()=>{DBG.god=false;}")
        pl = ev("""()=>{const c=gasClouds[gasClouds.length-1];player.spun=0;player.shield=0;player.pans=0;player.bucket=0;
            T_inBlob(player,c);updateFarts(.001);const s=player.spun;player.spun=0;return s;}""")
        ev("()=>{DBG.god=true;}")
        check(pl > 1.0, f'the player spins too ({pl:.2f})')
        late = ev("""()=>{const a=T_ai(0),b=T_ai(1);blast(a,1);const c=gasClouds[gasClouds.length-1];
            for(let i=0;i<200&&c.end-c.t>GAS.fade*.4;i++)updateFarts(.02);
            b.spun=0;c.hit.delete(b);T_inBlob(b,c);updateFarts(.001);return b.spun;}""")
        check(late == 0, 'thinned-out gas no longer spins anyone')
        ev("()=>clearPowerups()")
        check(ev("()=>gasClouds.length===0&&T_gasMeshes()===0"), 'restart clears every cloud')

        # bruna bönor still wait a moment before they go off
        b3 = ev("""()=>{clearPowerups();const a=T_ai(0);a.held=null;a.roll=0;a.fartT=0;giveItem(a,'fart',3);a.roll=0;useItem(a);
            const before=gasClouds.length;for(let i=0;i<3;i++)updateFarts(.1);const mid=gasClouds.length;
            for(let i=0;i<3;i++)updateFarts(.1);return [before,mid,gasClouds.length,gasClouds[0]&&gasClouds[0].blobs.length];}""")
        check(b3[0] == 0 and b3[1] == 0 and b3[2] == 1 and b3[3] >= 9, f'bruna bönor: a pause, then a ring all round {b3}')
        ev("()=>clearPowerups()")

        # the AI steers round gas up the road and drops beans on a tailgater
        ai = ev("""()=>{const a=T_ai(0),b=T_ai(1);T_put(a,player.si+120,0,20);T_put(b,a.si+18,0,20);
            clearPowerups();for(const k of karts)k.held=null;blast(b,1);const c=gasClouds[gasClouds.length-1];
            for(const q of c.blobs){q.lat=0;q.si=b.si;}
            gasClouds.length=0;a.line=0.3;a.itemBias=0;aiItemLines();const base=a.itemBias;
            gasClouds.push(c);a.itemBias=0;a.line=0.3;aiItemLines();const dodge=a.itemBias;
            c.hit.add(a);a.itemBias=0;aiItemLines();const after=a.itemBias;
            dropGas(gasClouds.indexOf(c));return {base,dodge,after};}""")
        check(ai['dodge'] - ai['base'] > 0.05 and abs(ai['after'] - ai['base']) < 1e-6,
              f'AI steers round gas ahead of it {ai}')
        use = ev("""()=>{const a=T_ai(0),b=T_ai(1);T_put(a,player.si+120,0,20);T_put(b,a.si-8,0,20);
            clearPowerups();for(const k of karts)k.held=null;giveItem(a,'fart',1);a.roll=0;aiItemLines();
            const r={held:a.held,cloud:gasClouds.some(c=>c.owner===a)};clearPowerups();return r;}""")
        check(use['held'] is None and use['cloud'], f'AI gasses a tailgater {use}')

        errors = [e for e in errors if 'net::ERR_FAILED' not in e]   # the web fonts, blocked offline
        check(not errors, f'no JS errors {errors}')
        browser.close()
    httpd.shutdown()
    if fails:
        sys.exit('beans test failed: ' + '; '.join(fails))
    print('beans test passed')


if __name__ == '__main__':
    main()
