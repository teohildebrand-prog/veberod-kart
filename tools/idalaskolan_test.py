#!/usr/bin/env python3
"""Headless check of Idalaskolan, Victor and Carl's old school as a bonus track.

    CHROMIUM=/path/to/chrome python3 tools/idalaskolan_test.py

Picks the track from the stage list (BONUSBANA ribbon, its own note, no cup), races it as Victor
and checks: the stage's name, laps, shortcuts, stamps and postcard; every lap runs through the
playground, the hallway (linoleum) and the gym (boards), in that order, with the corridor wide
enough for two karts; the gym ball is telegraphed before it rolls, crosses only part of the
straight, keeps clear of the ramp's landing and the doorway, gives one small shove and a short
slowdown (no spin), is stopped by a shield, has no collision in a time trial, and the AI keeps to
its clear side; the brothers' start exchange and their school lines (and nobody else's lines
change); the bell and the loudspeaker at the finish; the scoreboard; the milk cartons out of the
corridor; the picnic passport with the postcard.
Layout, fuel stops, stamps' reach, shortcuts and full AI races are covered by vastgota_test.py,
shortcut_test.py and fuel_audit.py. Screenshots go to idalaskolan-*.png in the repo root
(ignored by git). Exit 1 on any failure.
"""
import os
import sys
from pathlib import Path

from playwright.sync_api import sync_playwright

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from smoke_test import serve  # noqa: E402

ROOT = Path(__file__).resolve().parent.parent

# a stand-in kart on the main road at sample i, lat across it, for asking a hazard "would this hit?"
FAKE = """(i,lat)=>{const p=mainPt(i,lat);return {x:p.x,y:groundAt(p.x,p.z,p.j)+1.8,z:p.z,si:p.j,mi:p.j,lat,rib:0};}"""
# put the player at sample i, lat across, standing still, facing up the road
PUT = """([i,lat])=>{const q=mainPt(i,lat);player.x=q.x;player.z=q.z;player.si=player.mi=q.j;player.yaw=q.yaw;
  player.vx=player.vz=0;player.y=groundAt(q.x,q.z,q.j);player.rib=0;camInit=false;}"""


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
        page.on('console', lambda m: m.type == 'error' and 'net::ERR_FAILED' not in m.text and errors.append(m.text))
        page.route('**/*', lambda r: r.continue_() if r.request.url.startswith(url.rsplit('/', 1)[0])
                   else r.abort())
        page.goto(url, timeout=120000)
        page.fill('#nameBox', 'teo', timeout=10000)
        page.keyboard.press('Enter')
        page.click('#btnStart', timeout=10000)
        ev = page.evaluate
        wait = page.wait_for_timeout

        # the stage, as the GDD has it
        S = ev("""()=>{const S=STAGES.find(s=>s.id==='idalaskolan');return S&&{name:S.name,sub:S.sub,tag:S.tag,group:S.group,
            bonus:S.bonus,laps:S.laps,modes:S.modes,order:S.order,routes:S.routes.map(r=>[r.id,r.name,r.surface,!!r.hidden]),
            stamps:S.stamps.map(d=>[d.dish,d.kind,d.route]),caption:S.postcard&&S.postcard.caption,note:S.bonusNote,
            fuel:FUEL_MUL.idalaskolan,art:!!STAGE_ART.idalaskolan,
            inCup:Object.values(CUPS).some(c=>JSON.stringify(c).includes('idalaskolan')),
            after:S.order>STAGES.find(s=>s.id==='promenad').order}}""")
        check(bool(S) and S['name'] == 'IDALASKOLAN' and S['sub'] == 'SISTA RASTEN' and S['laps'] == 3
              and S['tag'] == 'Korridoren är ingen racerbana. Än.', f'the stage: name, subtitle, tag line, three laps {S}')
        check(S['group'] == 'bonus' and S['bonus'] and not S['inCup'] and S['after'] and 'VEBERÖD' in S['note'].upper(),
              'a bonus track in Veberöd, after the others, in no cup')
        check(S['modes'] == ['race', 'tt', 'free'], f'single race, time trial and sandbox {S["modes"]}')
        check([r[:2] for r in S['routes']] == [['cykel', 'BAKOM CYKELSTÄLLET'], ['forrad', 'REDSKAPSFÖRRÅDET']]
              and not any(r[3] for r in S['routes']), f'two open shortcuts, neither needs a shot {S["routes"]}')
        check([s[:2] for s in S['stamps']] == [['Knäckemacka', 'intro'], ['Mjölkpaket', 'route'], ['Pannkaka', 'air']]
              and S['stamps'][1][2] == 'forrad', f'stamps: by the picnic table, in the store, over the ramp {S["stamps"]}')
        check(S['caption'] == 'Utvecklingssamtalet blev längre än väntat.', 'the postcard caption')
        check(bool(S['fuel']) and S['art'], f'a calibrated FUEL_MUL ({S["fuel"]}) and a baked portrait')

        # in the stage list with the ribbon and its own note
        card = ev("""()=>{const si=STAGES.findIndex(s=>s.id==='idalaskolan'),k=SS.list.indexOf(si);
            const el=document.querySelector('.scard[data-k="'+k+'"]');SS.hi=k;renderPage();renderPreview();
            return {k,bonus:!!el&&!!el.querySelector('.sc-bonus'),info:document.getElementById('ssInfo')?document.getElementById('ssInfo').textContent:''}}""")
        check(card['k'] >= 0 and card['bonus'] and 'GYMPASAL' in card['info'].upper(),
              f'in the stage list with the BONUSBANA ribbon and its note {card}')
        page.screenshot(path=str(ROOT / 'idalaskolan-card.png'))
        page.click('#btnStageGo', timeout=10000)
        wait(600)
        ev("()=>applyCharacter(CHARS.findIndex(c=>c.id==='victor'))")
        page.click('#btnGo', timeout=10000)
        for _ in range(40):
            wait(250)
            if ev("()=>state") == 'race':
                break
        check(ev("()=>stage.id") == 'idalaskolan' and ev("()=>CHARS[charSel].id") == 'victor', 'racing at Idalaskolan as Victor')

        # a lap is yard, hallway, gym, recess, in that order, and the floors are what they look like
        lap = ev("""()=>{const order=[];for(let i=0;i<N;i++){const s=idaSec(i);if(order[order.length-1]!==s)order.push(s);}
            const S=IDA.sec;let golv=0,parkett=0;for(let i=S.hallIn;i<S.gymIn;i++)golv+=MAINS[i]==='idaGolv';
            for(let i=S.gymIn;i<S.gymOut;i++)parkett+=MAINS[i]==='idaParkett';
            return {order,golv:golv===S.gymIn-S.hallIn,parkett:parkett===S.gymOut-S.gymIn,width:2*HW,
              grip:SURF.idaParkett.grip(.6),walls:HW+4.9};}""")
        check(lap['order'] == ['yard', 'hall', 'gym', 'recess', 'bikes'], f'every lap: yard, hallway, gym, recess, bikes {lap["order"]}')
        check(lap['golv'] and lap['parkett'], 'linoleum in the whole hallway, boards in the whole gym')
        check(lap['width'] >= 15 and lap['walls'] > 12, f'the corridor fits two karts side by side ({lap["width"]} m of floor)')
        check(0.9 <= lap['grip'] <= 1, f'the gym floor grips predictably, it is not ice ({lap["grip"]})')

        # the brothers: the start exchange, their lines here, the pass line against each other
        lines = ev("""()=>{const r={};r.duo=duoLines();r.start=sayLine('start');r.hall=sayLine('hall');r.gym=sayLine('gym');
            r.pass=sayLine('pass');r.win=sayLine('win');r.lose=sayLine('lose');r.rival=stage.rivals[CHARS[charSel].id];
            r.carlIn=karts.some(k=>k.cfg.kind==='carl');return r;}""")
        check(lines['carlIn'] and lines['duo'] == ['Du vet att jag kan den här banan?', 'CARL: Bra. Då slipper jag vänta.'],
              f'Victor and Carl on the grid: the start exchange {lines["duo"]}')
        check(lines['start'] == 'Här behöver jag ingen karta.' and lines['hall'] == 'Man fick faktiskt inte springa här.'
              and lines['gym'] == 'Nu gäller det. På riktigt.' and lines['pass'] == 'Du tog fel väg redan då.'
              and lines['win'] == 'Fortfarande bäst på rasten.' and lines['lose'] == 'Vi kör bäst av tre raster.'
              and lines['rival'] == 'carl', f"Victor's school lines, and his rival here is Carl {lines}")
        other = ev("""()=>{const was=charSel,r={};charSel=CHARS.findIndex(c=>c.id==='carl');r.carl=[sayLine('start'),sayLine('hall'),sayLine('gym'),sayLine('pass')];
            charSel=0;r.arne=[sayLine('start'),sayLine('hall'),duoLines()];charSel=was;return r;}""")
        check(other['carl'] == ['Jag skulle bara lämna en grej.', 'Det här räknas som transport.', 'Är det här uppvärmningen?',
                                'Du får fråga fröken om omkörning.'], f"Carl's lines {other['carl']}")
        check(other['arne'][1] is None and other['arne'][2] is None and other['arne'][0] == ev("()=>CHARS[0].say&&CHARS[0].say.start||null"),
              f"everyone else keeps their usual lines and no exchange {other['arne']}")
        said = ev("""(PUT)=>{const put=eval(PUT),H=HAZARDS.find(h=>h.id==='idaSkola');IDA.said.hall=IDA.said.gym=false;
            put([IDA.sec.hallIn+4,0]);H.update(0,.1);const a=IDA.said.hall;put([IDA.sec.gymIn+4,0]);H.update(0,.1);
            return {hall:a,gym:IDA.said.gym};}""", 'PUT=' + PUT)
        check(said['hall'] and said['gym'], f'the hallway and gym lines come once each {said}')
        ev("()=>{DBG.god=true;for(const k of karts)if(k!==player)k.parked=true;}")

        # the gym ball: a warning first, part of the width only, clear of the ramp landing and the door
        bl = ev("""(FAKE)=>{const mk=eval(FAKE),H=HAZARDS.find(h=>h.id==='gympaboll'),i=IDA.ball,B=IDA_BALL;
            const far=mk(i,HW-1.5),edge=mk(i,B.far+B.R+1.9),near=mk(i,-HW+2);let first=null,whistleBefore=false,farHit=false,edgeHit=false,nearHit=false;
            for(let u=0;u<1;u+=.004){H.update(u,.016);if(B.on&&first==null)first=u;if(u<B.warn&&B.active)whistleBefore=true;
              farHit=farHit||H.hit(far);edgeHit=edgeHit||H.hit(edge);nearHit=nearHit||H.hit(near);}
            const J=JUMPS[0];return {first,warn:B.warn,whistleBefore,farHit,edgeHit,nearHit,
              afterLanding:i-(J.at+J.dn+J.rec),beforeDoor:IDA.sec.gymOut-i,inGym:idaSec(i)==='gym',straight:Math.abs(scurv[i])<.05};}""", 'FAKE=' + FAKE)
        check(bl['first'] is not None and bl['first'] >= bl['warn'] and bl['whistleBefore'],
              f'the teacher points and whistles before the ball rolls out {bl}')
        check(bl['nearHit'] and not bl['farHit'] and not bl['edgeHit'], f'the ball crosses part of the straight, the far side stays clear {bl}')
        check(bl['inGym'] and bl['straight'] and bl['afterLanding'] >= 10 and bl['beforeDoor'] >= 10,
              f'the ball rolls on the gym straight, clear of the ramp landing and the doorway {bl}')
        hit = ev("""(PUT)=>{const put=eval(PUT),H=HAZARDS.find(h=>h.id==='gympaboll'),B=IDA_BALL,k=player,i=IDA.ball;
            put([i,-3]);k.vx=fx[i]*30;k.vz=fz[i]*30;k.speed=30;k.lat=-3;k.spun=0;k.slow=0;k.shield=0;
            const v0=Math.hypot(k.vx,k.vz),l0=k.vx*rx[i]+k.vz*rz[i];B.lat=-6;H.effect(k);
            const r={spun:k.spun,slow:k.slow,v:Math.hypot(k.vx,k.vz)/v0,shove:(k.vx*rx[i]+k.vz*rz[i])-l0};
            /* a shield takes it instead: run the real hazard loop with the ball on the kart */
            put([i,-6]);k.shield=3;k.spun=0;k.slow=0;k.hazAt=-9;state='race';TT=false;
            for(let u=.3;u<.6;u+=.01){H.update(u,.016);if(B.on&&H.hit(k))break;}
            const sh0=k.shield;raceTime=(H.period*.45)-H.phase+H.period*20;updateHazards(0);r.shieldHit=k.slow===0&&k.spun===0;r.shield=[sh0,k.shield];
            /* a time trial: no collision */
            TT=true;r.tt=H.hit(k);TT=false;k.shield=0;return r;}""", 'PUT=' + PUT)
        check(hit['spun'] == 0 and 0 < hit['slow'] <= 0.3 and 0.6 < hit['v'] < 0.9 and hit['shove'] > 2,
              f'one small shove away from the ball and a short slowdown, no spin {hit}')
        check(hit['shieldHit'], f'a shield stops the ball {hit}')
        check(hit['tt'] is False, 'no ball collision in a time trial')
        ai = ev("""()=>{const B=IDA_BALL,k=karts.find(o=>o.ai),i=IDA.ball;B.active=true;k.si=i-12;const on=idaDodge(k,i,-5);
            k.si=i-60;const far=idaDodge(k,i,-5);B.active=false;k.si=i-12;const off=idaDodge(k,i,-5);return {on,far,off,clear:B.far+B.R+2};}""")
        check(ai['on'] >= ai['clear'] and ai['far'] == -5 and ai['off'] == -5,
              f'the AI keeps to the clear side when the ball is out, and only near it {ai}')
        put = ev("""(PUT)=>{eval(PUT)([IDA.ball-14,2]);return true;}""", 'PUT=' + PUT)
        for _ in range(30):
            wait(200)
            if ev("()=>IDA_BALL.on"):
                break
        wait(300)
        page.screenshot(path=str(ROOT / 'idalaskolan-gym.png'))

        # the milk cartons out of the corridor, the boxes before the indoors and after the gym
        it = ev("""()=>{const S=IDA.sec,milk=items.filter(o=>o.type==='milk').map(o=>o.si),box=items.filter(o=>o.type==='box').map(o=>o.si);
            return {milk,boxBefore:box.some(i=>i<S.hallIn-10),boxAfter:box.some(i=>i>=S.gymOut&&i<S.gymOut+80),
              stations:stations.map(s=>idaSec(s.at)),door:milk.every(i=>i>S.b2&&i<S.gymIn-20)};}""")
        check(len(it['milk']) == 3 and it['door'], f'three milk cartons on the clean exit of the corridor, not at a door {it["milk"]}')
        check(it['boxBefore'] and it['boxAfter'], 'a box row on the playground before the indoors, and one on the outside loop after the gym')
        check(all(s in ('yard', 'bikes', 'recess') for s in it['stations']) and len(it['stations']) == 2,
              f'two STATOLJA bays, both outside {it["stations"]}')

        # the scoreboard, the bell and the loudspeaker at the end
        sb = ev("""()=>{const H=HAZARDS.find(h=>h.id==='idaSkola');player.lap=2;H.update(0,.1);return IDA.board.shown;}""")
        check(sb == '2/3', f'the scoreboard shows the lap ({sb})')
        ev("()=>{player.done=true;player.total=170;player.place=1;HAZARDS.find(h=>h.id==='idaSkola').update(0,.1);}")
        wait(1300)
        pa = ev("()=>({end:IDA.said.end,pa:document.getElementById('vastPA')?document.getElementById('vastPA').textContent:''})")
        check(pa['end'] and 'Rasten är slut. Victor vill köra om.' in pa['pa'], f'the bell, then: Rasten är slut. Victor vill köra om. {pa}')

        # the passport: the postcard once all three are found
        pg_ = ev("""()=>{for(const d of stage.stamps)SAVE.stamps[d.id]=1;hideSheets();
            albumTab=STAGES.findIndex(s=>s.id==='idalaskolan');showAlbum();const ap=document.getElementById('apage');
            return {post:!!ap.querySelector('.post img'),text:ap.textContent};}""")
        wait(400)
        page.screenshot(path=str(ROOT / 'idalaskolan-album.png'))
        check(pg_['post'] and 'Utvecklingssamtalet blev längre än väntat.' in pg_['text'], 'the passport page has the postcard')
        browser.close()
    httpd.shutdown()
    for e in errors:
        print('JS error:', e)
    if errors or fails:
        sys.exit('idalaskolan test FAILED')
    print('idalaskolan test passed')


if __name__ == '__main__':
    main()
