#!/usr/bin/env python3
"""Headless check of Bodils promenad, Bodil's own bonus track round Teo and Amanda's yard.

    CHROMIUM=/path/to/chrome python3 tools/promenad_test.py

Picks the track from the stage list (it carries the BONUSBANA ribbon and its own note), races it
as Bodil, and checks: the stage's sections, shortcuts, stamps and postcard; the forty-seven smells;
the ball launcher flashes before it rolls and always leaves the far side of the path clear; the
sprinkler's wet patch makes a kart slide on the inside line only; the television in the window
shows the cartoon dog once a lap as the player comes up the yard, and Bodil's ears perk up and
her head turns to it without touching the steering; a win puts the trophy in her dog bed and her
on her back asleep beside it; the picnic passport gives her a dog's page with the postcard.
Layout, shortcuts and full AI races are covered by vastgota_test.py and shortcut_test.py.
Screenshots go to promenad-*.png in the repo root (ignored by git). Exit 1 on any failure.
"""
import os
import sys
from pathlib import Path

from playwright.sync_api import sync_playwright

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from smoke_test import serve  # noqa: E402

ROOT = Path(__file__).resolve().parent.parent

# a stand-in kart on the main road at sample i, lat across it, for asking a hazard "would this hit?"
FAKE = """(i,lat)=>{const p=mainPt(i,lat);return {x:p.x,y:groundAt(p.x,p.z,p.j),z:p.z,si:p.j,mi:p.j,lat,rib:0};}"""


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
        # the web fonts are blocked below on purpose: their failed load is not the game's error
        page.on('console', lambda m: m.type == 'error' and 'net::ERR_FAILED' not in m.text and errors.append(m.text))
        page.route('**/*', lambda r: r.continue_() if r.request.url.startswith(url.rsplit('/', 1)[0])
                   else r.abort())
        page.goto(url, timeout=120000)
        page.fill('#nameBox', 'teo', timeout=10000)
        page.keyboard.press('Enter')
        page.click('#btnStart', timeout=10000)
        ev = page.evaluate
        wait = page.wait_for_timeout

        # the stage itself, as Teo described it
        S = ev("""()=>{const S=STAGES.find(s=>s.id==='promenad');return S&&{name:S.name,sub:S.sub,tag:S.tag,group:S.group,
            bonus:S.bonus,laps:S.laps,routes:S.routes.map(r=>[r.id,r.name,r.surface]),stamps:S.stamps.map(d=>[d.dish,d.kind,d.route||'']),
            caption:S.postcard&&S.postcard.caption,album:S.album,note:S.bonusNote}}""")
        check(bool(S) and S['name'] == 'BODILS PROMENAD' and S['sub'] == 'BARA EN LITEN RUNDA' and S['laps'] == 3
              and 'Fyrtiosju intressanta lukter' in S['tag'], f'the stage: name, subtitle, tag line, three laps {S}')
        check(S['group'] == 'bonus' and S['bonus'], 'it is a bonus track (BONUSBANOR)')
        check([r[:2] for r in S['routes']] == [['busken', 'BAKOM BUSKEN'], ['tunnel', 'GENOM TUNNELN']]
              and S['routes'][0][2] == 'dirt', f'two shortcuts: the dirt path behind the shrub, the agility tunnel {S["routes"]}')
        check([s[0] for s in S['stamps']] == ['Hundkex', 'Morotsbit', 'Vattenskål'],
              f'stamps Hundkex, Morotsbit, Vattenskål {S["stamps"]}')
        check(S['caption'] == 'En väldigt jobbig dag.' and S['album'] == 'dog', 'the postcard caption and the dog page')
        check(ev("()=>CHARS.find(c=>c.id==='bodil').home") == 'promenad', "it is Bodil's home track")

        # in the stage list with the ribbon and its own note, then race it as Bodil
        card = ev("""()=>{const si=STAGES.findIndex(s=>s.id==='promenad'),k=SS.list.indexOf(si);
            const el=document.querySelector('.scard[data-k="'+k+'"]');SS.hi=k;renderPreview();
            return {k,bonus:!!el&&!!el.querySelector('.sc-bonus'),info:document.getElementById('ssInfo')?document.getElementById('ssInfo').textContent:''}}""")
        check(card['k'] >= 0 and card['bonus'], f'in the stage list with the BONUSBANA ribbon {card["k"]}')
        page.screenshot(path=str(ROOT / 'promenad-card.png'))
        page.click('#btnStageGo', timeout=10000)
        wait(600)
        ev("()=>applyCharacter(CHARS.findIndex(c=>c.id==='bodil'))")
        page.click('#btnGo', timeout=10000)
        for _ in range(40):
            wait(250)
            if ev("()=>state") == 'race':
                break
        check(ev("()=>stage.id") == 'promenad' and ev("()=>CHARS[charSel].id") == 'bodil', 'racing on the promenad as Bodil')
        check(ev("()=>PROM.smells") == 47, 'forty-seven interesting smells along the lap')
        check(ev("()=>PROM.dogs.length") >= 15, f'dogs watching: {ev("()=>PROM.dogs.length")}')
        ev("()=>{DBG.god=true;for(const k of karts)if(k!==player)k.parked=true;}")

        # the ball launcher: a warning first, and the far side of the path is never touched
        bl = ev("""(FAKE)=>{const mk=eval(FAKE),H=HAZARDS.find(h=>h.id==='bollkastare'),i=PROM.launcher;
            const far=mk(i,HW-2),mid=mk(i,4.4),inner=mk(i,-3);let first=null,farHit=false,midHit=false,innerHit=false;
            for(let u=0;u<1;u+=.005){H.update(u,.016);if(H.on&&first==null)first=u;
              farHit=farHit||H.hit(far,u);midHit=midHit||H.hit(mid,u);innerHit=innerHit||H.hit(inner,u);}
            return {first,farHit,midHit,innerHit};}""", 'FAKE=' + FAKE)
        check(bl['first'] is not None and bl['first'] >= 0.16, f'the launcher flashes before the ball rolls out {bl}')
        check(bl['innerHit'] and not bl['farHit'] and not bl['midHit'],
              f'the ball blocks the inside of the path and always leaves the far side clear {bl}')

        # the sprinkler: a wet patch on the inside of the yard path, outlined, not across the road
        sp = ev("""(FAKE)=>{const mk=eval(FAKE),H=HAZARDS.find(h=>h.id==='vattenspridare'),i=PROM.sprinkler;
            return {wet:H.hit(mk(i,-4.2),0),dry:H.hit(mk(i,3.5),0),unblock:!!H.unblockable};}""", 'FAKE=' + FAKE)
        check(sp['wet'] and not sp['dry'], f'the sprinkler wets a small patch, with a dry line beside it {sp}')

        # the television: the cartoon dog once a lap as the player comes up the yard
        tv = ev("""()=>{const H=HAZARDS.find(h=>h.id==='hundar');const at=(i,lat)=>{const q=mainPt(i,lat);
              player.x=q.x;player.z=q.z;player.si=player.mi=q.j;player.yaw=q.yaw;player.vx=player.vz=0;player.y=groundAt(q.x,q.z,q.j);};
            player.lap=1;at(N-16,0);H.update(0,.1);const on=PROM.dogOnTV;
            for(let n=0;n<40;n++)H.update(0,.1);const off=!PROM.dogOnTV;
            H.update(0,.1);const again=PROM.dogOnTV;player.lap=2;H.update(0,.1);const next=PROM.dogOnTV;
            return {on,off,again,next,mode:PROM.tv.mode};}""")
        check(tv['on'] and tv['off'] and not tv['again'] and tv['next'],
              f'the TV shows the dog for a moment, once a lap {tv}')
        steer = ev("""()=>{const H=HAZARDS.find(h=>h.id==='hundar');player.lap=3;
            const q=mainPt(N-14,2);player.x=q.x;player.z=q.z;player.si=player.mi=q.j;player.yaw=q.yaw;player.vx=player.vz=0;
            H.update(0,.1);return PROM.dogOnTV;}""")
        wait(500)
        perk = ev("""()=>{const D=player.v.root.getObjectByName('bodil').userData.bodil;
            return {tv:PROM.dogOnTV,head:D.head.rotation.y,ear:D.earL.rotation.x,steer:input.steer};}""")
        page.screenshot(path=str(ROOT / 'promenad-tv.png'))
        check(steer and perk['tv'] and abs(perk['head']) > 0.2 and perk['ear'] < 0 and perk['steer'] == 0,
              f'Bodil turns her head and perks her ears at the TV; the steering is untouched {perk}')

        # the win: the trophy in the dog bed, Bodil on her back asleep beside it
        ev("()=>{player.done=true;player.total=99;player.place=1;state='over';}")
        for _ in range(24):
            wait(250)
            if ev("()=>player.v.root.getObjectByName('bodil').userData.bodil.lids[0].visible"):
                break
        wait(300)
        nap = ev("""()=>{const D=player.v.root.getObjectByName('bodil').userData.bodil,c=player.v.root.getObjectByName('bodilCup');
            return {cup:!!c&&c.visible,asleep:D.lids[0].visible,belly:D.body.rotation.x};}""")
        page.screenshot(path=str(ROOT / 'promenad-nap.png'))
        check(nap['cup'] and nap['asleep'] and nap['belly'] < -1.3, f'she won: the trophy beside her, asleep belly up {nap}')

        # the passport: her own dog's page, and the postcard once all three are found
        page_ = ev("""()=>{for(const d of stage.stamps)SAVE.stamps[d.id]=1;hideSheets();
            albumTab=STAGES.findIndex(s=>s.id==='promenad');showAlbum();const ap=document.getElementById('apage');
            return {cls:ap.className,post:!!ap.querySelector('.post img'),text:ap.textContent};}""")
        wait(400)
        page.screenshot(path=str(ROOT / 'promenad-album.png'))
        check(page_['cls'] == 'dog' and page_['post'] and 'En väldigt jobbig dag.' in page_['text'],
              f"the passport page is Bodil's, with the postcard {page_['cls']}")
        other = ev("()=>{albumTab=0;renderAlbum();return document.getElementById('apage').className;}")
        check(other == '', f'other tracks keep the plain page ({other!r})')
        browser.close()
    httpd.shutdown()
    for e in errors:
        print('JS error:', e)
    if errors or fails:
        sys.exit('promenad test FAILED')
    print('promenad test passed')


if __name__ == '__main__':
    main()
