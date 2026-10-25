#!/usr/bin/env python3
"""Headless check of Lomma Beach, the beach-day circuit from Teo's track GDD.

    CHROMIUM=/path/to/chrome python3 tools/lomma_test.py

Picks the track from the stage list (an ordinary Skåne track in no cup), races it as Victor and
checks: the stage's name, laps, shortcuts, stamps and postcard; every lap runs car park, promenade,
Sandkurvan, the ball's approach, Bryggsvängen, the sweep, Vindsurfarrakan, the way back and the
kiosk, in that order; the promenade is paving, the access road compacted sand, and Sandkurvan's
loose sand covers only its inside half so a firm line always runs round the castle; the surface
mix is mostly firm; Sandspåret is loose sand with a compacted patch; the beach ball is telegraphed
(attendant, squeak, landing ring) before it bounces, crosses only part of the approach, merges
nothing into it (Mellan badhytterna rejoins before the warning), shoves a kart sideways once per
bounce sequence with a short slowdown and no spin, is stopped by a shield, has no collision in a
time trial, and the AI keeps to its clear side; Victor's wet-sand line (nobody else's lines
change); the speaker's lines, each once; the milk cartons and both STATOLJA bays; the picnic
passport with the postcard. Layout, fuel stops, stamps' reach, shortcut times and full AI races
are covered by vastgota_test.py, shortcut_test.py and fuel_audit.py. Screenshots go to lomma-*.png
in the repo root (ignored by git). Exit 1 on any failure.
"""
import os
import sys
from pathlib import Path

from playwright.sync_api import sync_playwright

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from smoke_test import serve  # noqa: E402

ROOT = Path(__file__).resolve().parent.parent

# a stand-in kart on the main road at sample i, lat across it, for asking a hazard "would this hit?"
FAKE = """(i,lat)=>{const p=mainPt(i,lat);return {x:p.x,y:groundAt(p.x,p.z,p.j)+.6,z:p.z,si:p.j,mi:p.j,lat,rib:0,air:false};}"""
# put the player at sample i, lat across, standing still, facing up the road
PUT = """([i,lat])=>{const q=mainPt(i,lat);player.x=q.x;player.z=q.z;player.si=player.mi=q.j;player.yaw=q.yaw;
  player.vx=player.vz=0;player.y=groundAt(q.x,q.z,q.j);player.rib=0;player.air=false;player.lat=lat;camInit=false;}"""


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
        S = ev("""()=>{const S=STAGES.find(s=>s.id==='lomma');return S&&{name:S.name,sub:S.sub,tag:S.tag,group:S.group,
            bonus:!!S.bonus,laps:S.laps,modes:S.modes,routes:S.routes.map(r=>[r.id,r.name,r.surface,!!r.hidden]),
            stamps:S.stamps.map(d=>[d.dish,d.kind,d.route]),caption:S.postcard&&S.postcard.caption,
            fuel:FUEL_MUL.lomma,art:!!STAGE_ART.lomma,
            inCup:Object.values(CUPS).some(c=>JSON.stringify(c).includes('lomma')),
            skane:S.order>STAGES.find(s=>s.id==='horby').order&&S.order<STAGES.find(s=>s.id==='lerum').order}}""")
        check(bool(S) and S['name'] == 'LOMMA BEACH' and S['sub'] == 'SAND MELLAN DÄCKEN' and S['laps'] == 3
              and S['tag'].startswith('Mjölken är varm, glassen smälter'), f'the stage: name, subtitle, tag line, three laps {S}')
        check(S['group'] == 'skane' and not S['bonus'] and not S['inCup'] and S['skane'],
              'an ordinary Skåne track, listed after the other Skåne tracks and before the west, in no cup')
        check(S['modes'] == ['race', 'tt', 'free'], f'single race, time trial and sandbox {S["modes"]}')
        check([r[:3] for r in S['routes']] == [['hytterna', 'MELLAN BADHYTTERNA', 'lomPlattor'], ['sandsparet', 'SANDSPÅRET', 'lomLos']]
              and not any(r[3] for r in S['routes']), f'two open shortcuts, paving and loose sand {S["routes"]}')
        check(S['stamps'] == [['Mjukglass', 'intro', 'main'], ['Saftflaska', 'route', 'hytterna'], ['Jordgubbar', 'air', 'main']],
              f'stamps: by the kiosk, between the huts, over the crest {S["stamps"]}')
        check(S['caption'] == 'Vi skulle bara ta ett dopp.', 'the postcard caption')
        check(bool(S['fuel']) and S['art'], f'a calibrated FUEL_MUL ({S["fuel"]}) and a baked portrait')

        # in the stage list
        card = ev("""()=>{const si=STAGES.findIndex(s=>s.id==='lomma'),k=SS.list.indexOf(si);
            SS.hi=k;renderPage();renderPreview();
            return {k,tag:document.getElementById('ssTag').textContent,info:document.getElementById('ssInfo').textContent}}""")
        check(card['k'] >= 0 and card['tag'] == S['tag'] and 'Lös sand' in card['info'] and 'Packad sand' in card['info'],
              f'in the stage list with its tag line and its surfaces {card}')
        page.screenshot(path=str(ROOT / 'lomma-card.png'))
        page.click('#btnStageGo', timeout=10000)
        wait(600)
        ev("()=>applyCharacter(CHARS.findIndex(c=>c.id==='victor'))")
        page.click('#btnGo', timeout=10000)
        for _ in range(40):
            wait(250)
            if ev("()=>state") == 'race':
                break
        check(ev("()=>stage.id") == 'lomma' and ev("()=>CHARS[charSel].id") == 'victor', 'racing at Lomma Beach as Victor')

        # a lap through the six sectors in order, and the ground is what it looks like
        lap = ev("""()=>{const order=[];for(let i=0;i<N;i++){const s=lomSec(i);if(order[order.length-1]!==s)order.push(s);}
            const S=LOM.sec;let pav=0,pack=0,firm=true,half=true,halves={firm:0,pack:0,loose:0};
            for(let i=S.prom;i<S.sand0;i++)pav+=MAINS[i]==='lomPlattor';
            for(let i=S.vind;i<S.back;i++)pack+=MAINS[i]==='lomPackad';
            for(let i=S.sand0+2;i<S.sand1;i++){const s=MSIDE[i];half=half&&MAINS[i]==='sand'&&s!==0;
              firm=firm&&mainSurfAt(i,-s*(HW-1))===''&&mainSurfAt(i,s*(HW-1))==='sand';}
            for(let i=0;i<N;i++)for(const side of [-1,1]){const m=mainSurfAt(i,side*4);
              if(m==='sand')halves.loose++;else if(m==='lomPackad')halves.pack++;else halves.firm++;}
            const T=2*N,R=ALTS.find(r=>r.id==='sandsparet');
            return {order,pav:pav===S.sand0-S.prom,pack:pack===S.back-S.vind,half,firm,
              mix:[halves.firm/T,halves.pack/T,halves.loose/T].map(v=>+v.toFixed(2)),
              lane:[...new Set(R.S)],patch:R.S.filter(s=>s==='lomPackad').length/R.n,
              grip:[SURF.lomPackad.grip(.5),SURF.lomLos.top(.95),SURF.lomLos.top(.46)]};}""")
        check(lap['order'] == ['park', 'prom', 'sand', 'appr', 'brygg', 'sweep', 'vind', 'back', 'kiosk'],
              f'every lap: car park, promenade, Sandkurvan, approach, Bryggsvängen, sweep, Vindsurf, way back, kiosk {lap["order"]}')
        check(lap['pav'] and lap['pack'], 'paving along the whole promenade, compacted sand along the whole access road')
        check(lap['half'] and lap['firm'], 'Sandkurvan: loose sand on the inside half only, a firm line all the way round the castle')
        check(lap['mix'][0] >= 0.6 and 0.08 <= lap['mix'][1] <= 0.25 and 0.05 <= lap['mix'][2] <= 0.25,
              f'the main road is mostly firm, some compacted, some loose (firm/compacted/loose: {lap["mix"]})')
        check(sorted(lap['lane']) == ['lomLos', 'lomPackad'] and 0.05 < lap['patch'] < 0.25,
              f'Sandspåret: loose sand with a small compacted patch {lap}')
        check(lap['grip'][0] > 0.9 and lap['grip'][1] > 0.95 and lap['grip'][2] < 0.8,
              f'compacted sand grips; loose sand suits a sand kart, not a road kart {lap["grip"]}')

        # Victor's line, and nobody else's lines change
        lines = ev("""()=>{const was=charSel,r={victor:sayLine('start')};charSel=CHARS.findIndex(c=>c.id==='carl');
            r.carl=sayLine('start');r.carlOwn=CHARS[charSel].say&&CHARS[charSel].say.start||null;charSel=0;r.arne=sayLine('start');
            r.arneOwn=CHARS[0].say&&CHARS[0].say.start||null;charSel=was;return r;}""")
        check(lines['victor'] == 'Blöt sand greppar bättre. Det vet alla.', f"Victor's wet-sand line at the start {lines}")
        check(lines['carl'] == lines['carlOwn'] and lines['arne'] == lines['arneOwn'], f'everyone else keeps their usual lines {lines}')
        ev("()=>{DBG.god=false;for(const k of karts)if(k!==player)k.parked=true;}")

        # the beach ball: telegraphed, part of the width only, the shortcut rejoins before the warning
        bl = ev("""(FAKE)=>{const mk=eval(FAKE),H=HAZARDS.find(h=>h.id==='badboll'),i=LOM.ball,B=LOM_BALL;
            const safe=mk(i+6,B.clear+1.2),edge=mk(i+2,HW-1),path=[];let first=null,warned=false,ringWarn=false,safeHit=false,edgeHit=false,pathHit=0;
            for(let u=0;u<1;u+=.002){H.update(u,.016);if(B.on&&first==null)first=u;
              if(u<B.warn&&B.active){warned=true;ringWarn=ringWarn||H.mesh.parent.children.some(o=>o.geometry&&o.geometry.type==='RingGeometry'&&o.visible);}
              safeHit=safeHit||H.hit(safe);edgeHit=edgeHit||H.hit(edge);
              if(B.on&&H.low){const q=H.p,j=nearestGlobal(q.x,q.z);path.push(Math.round((q.x-sx[j])*rx[j]+(q.z-sz[j])*rz[j]));
                if(H.hit(mk(j,(q.x-sx[j])*rx[j]+(q.z-sz[j])*rz[j])))pathHit++;}}
            const Rh=ALTS.find(r=>r.id==='hytterna');
            return {first,warn:B.warn,warned,ringWarn,safeHit,edgeHit,pathHit,maxLat:Math.max(...path),
              merge:i-Rh.b,sec:lomSec(i),stamped:!!H.cyc};}""", 'FAKE=' + FAKE)
        check(bl['first'] is not None and bl['first'] >= bl['warn'] and bl['warned'] and bl['ringWarn'],
              f'the attendant points, it squeaks and the landing ring shows before the ball bounces {bl}')
        check(bl['pathHit'] > 0 and not bl['safeHit'] and not bl['edgeHit'] and bl['maxLat'] < 3,
              f'the ball crosses part of the approach; the far side stays a safe lane {bl}')
        check(bl['sec'] == 'appr' and bl['merge'] >= 22, f'on the approach to Bryggsvängen, Mellan badhytterna rejoins before the warning {bl}')
        hit = ev("""(PUT)=>{const put=eval(PUT),H=HAZARDS.find(h=>h.id==='badboll'),B=LOM_BALL,k=player,i=LOM.ball;
            put([i,-3]);k.vx=fx[i]*30;k.vz=fz[i]*30;k.speed=30;k.spun=0;k.slow=0;k.shield=0;k.lomBall=null;
            raceTime=5;H.update(.4,.016);
            const v0=Math.hypot(k.vx,k.vz),l0=k.vx*rx[i]+k.vz*rz[i];B.lat=-8;H.low=true;H.p={x:k.x,y:k.y,z:k.z};
            const before=H.hit(k);H.effect(k);
            const r={before,spun:k.spun,slow:k.slow,v:Math.hypot(k.vx,k.vz)/v0,shove:(k.vx*rx[i]+k.vz*rz[i])-l0,
              fwd:(k.vx*fx[i]+k.vz*fz[i])>15};
            k.air=false;r.again=H.hit(k);                                   /* once per bounce sequence */
            raceTime+=H.period;H.update(.4,.016);H.low=true;H.p={x:k.x,y:k.y,z:k.z};r.next=H.hit(k);
            /* a shield takes it instead: the real hazard loop with the ball on the kart */
            put([i,-6]);k.shield=3;k.spun=0;k.slow=0;k.hazAt=-9;k.lomBall=null;state='race';TT=false;
            for(let u=B.warn;u<B.live;u+=.005){raceTime=u*H.period-H.phase+H.period*40;updateHazards(0);if(k.shield===0||k.slow>0)break;}
            r.shield=k.shield===0&&k.slow===0;
            /* a time trial: no collision */
            k.lomBall=null;TT=true;H.low=true;H.p={x:k.x,y:k.y,z:k.z};r.tt=H.hit(k);TT=false;k.shield=0;return r;}""", 'PUT=' + PUT)
        check(hit['before'] and hit['spun'] == 0 and 0 < hit['slow'] <= 0.3 and 0.7 < hit['v'] < 0.95 and hit['shove'] > 2 and hit['fwd'],
              f'a mild shove sideways towards the open side and a short slowdown, no spin, still rolling forward {hit}')
        check(hit['again'] is False and hit['next'] is True, f'one hit per bounce sequence, the next sequence counts again {hit}')
        check(hit['shield'], f'a shield stops the ball {hit}')
        check(hit['tt'] is False, 'no ball collision in a time trial')
        ai = ev("""()=>{const B=LOM_BALL,k=karts.find(o=>o.ai),i=LOM.ball,ro=k.offRoad;B.active=true;k.si=i-10;const on=lomDodge(k,i,-5);
            k.si=i-60;const far=lomDodge(k,i,-5);B.active=false;k.si=i-10;const off=lomDodge(k,i,-5);
            const t=LOM.sec.sand0+20,s=MSIDE[t];k.offRoad=.5;const road=lomDodge(k,t,s*6);k.offRoad=.95;const sand=lomDodge(k,t,s*6);k.offRoad=ro;
            return {on,far,off,clear:B.clear,road:road*s,sand:sand*s};}""")
        check(ai['on'] >= ai['clear'] and ai['far'] == -5 and ai['off'] == -5,
              f'the AI keeps to the clear side when the ball is out, and only near it {ai}')
        check(ai['road'] < 0 and ai['sand'] == 6, f'a road kart keeps to the firm line round the castle, a sand kart may cut in {ai}')
        ev("""(PUT)=>{eval(PUT)([LOM.ball-16,4]);raceTime=LOM_BALL.period*30-LOM_BALL.phase+LOM_BALL.period*(LOM_BALL.warn+.1);}""", 'PUT=' + PUT)
        wait(900)
        page.screenshot(path=str(ROOT / 'lomma-ball.png'))

        # the milk cartons and the two STATOLJA bays
        it = ev("""()=>{const milk=items.filter(o=>o.type==='milk').map(o=>lomSec(o.si));
            return {milk,stations:stations.map(s=>lomSec(s.at)),sides:stations.map(s=>s.side)}}""")
        check(it['milk'] == ['prom'] * 3 + ['vind'] * 3, f'milk cartons on the promenade and before the crest {it["milk"]}')
        check(it['stations'] == ['prom', 'back'] or it['stations'] == ['park', 'back'],
              f'two STATOLJA bays: the car park forecourt and the beach-access bay before the kiosk {it["stations"]}')

        # the speaker: each line once, on its own cue
        pa = ev("""(PUT)=>{const put=eval(PUT),H=HAZARDS.find(h=>h.id==='lommaStrand'),D=LOM.said,txt=()=>document.getElementById('vastPA').textContent;
            Object.assign(D,{start:false,towel:false,cow:false,kiosk:false,ball:false,lap:1});const r={};
            state='race';player.lap=1;raceTime=5;put([LOM.sec.prom+20,0]);H.update(0,.1);r.start=txt();
            player.lap=2;H.update(0,.1);r.towel=txt();
            player.lap=LAPS;put([LOM.kioskAt,0]);H.update(0,.1);r.kiosk=txt();
            const again=[D.start,D.towel,D.kiosk];D.kiosk=true;H.update(0,.1);r.once=txt()===r.kiosk&&again.every(Boolean);
            return r;}""", 'PUT=' + PUT)
        check(pa['start'].endswith('Föraren till traktorn ombeds lämna badplatsen.'), f'the tractor line after the start {pa}')
        check(pa['towel'].endswith('Det är inte tillåtet att reservera racinglinjen med en handduk.'), f'the towel line on lap two {pa}')
        check(pa['kiosk'].endswith('Den som tappat en spettekaka vid glasskiosken behöver inte hämta den.') and pa['once'],
              f'the spettekaka line in the kiosk sector on the last lap, each line once {pa}')
        ball = ev("""()=>{const H=HAZARDS.find(h=>h.id==='badboll');LOM.said.ball=false;player.lomBall=null;state='race';H.effect(player);return LOM.said.ball;}""")
        wait(1000)
        check(ball and ev("()=>document.getElementById('vastPA').textContent").endswith('Badbollen deltar inte i mästerskapet.'),
              'the ball line the first time it hits you')
        cow = ev("""(PUT)=>{const put=eval(PUT),H=HAZARDS.find(h=>h.id==='lommaStrand'),D=LOM.said,c=karts.find(k=>k.cfg.kind==='cow');
            D.cow=false;player.lap=2;put([LOM.sec.vind+30,0]);if(c)c.parked=false;H.update(0,.1);const r=D.cow;if(c)c.parked=true;return {cow:!!c,said:r};}""", 'PUT=' + PUT)
        check(not cow['cow'] or cow['said'], f'Majros gets a word when she is racing {cow}')

        # phone size, mid race
        page.set_viewport_size({'width': 393, 'height': 660})
        ev("""(PUT)=>{eval(PUT)([LOM.sec.sand0+6,2]);}""", 'PUT=' + PUT)
        wait(600)
        page.screenshot(path=str(ROOT / 'lomma-phone.png'))
        page.set_viewport_size({'width': 960, 'height': 600})

        # the passport: the postcard once all three are found
        pg_ = ev("""()=>{for(const d of stage.stamps)SAVE.stamps[d.id]=1;hideSheets();
            albumTab=STAGES.findIndex(s=>s.id==='lomma');showAlbum();const ap=document.getElementById('apage');
            return {post:!!ap.querySelector('.post img'),text:ap.textContent};}""")
        wait(400)
        page.screenshot(path=str(ROOT / 'lomma-album.png'))
        check(pg_['post'] and 'Vi skulle bara ta ett dopp.' in pg_['text'], 'the passport page has the postcard')
        browser.close()
    httpd.shutdown()
    for e in errors:
        print('JS error:', e)
    if errors or fails:
        sys.exit('lomma test FAILED')
    print('lomma test passed')


if __name__ == '__main__':
    main()
