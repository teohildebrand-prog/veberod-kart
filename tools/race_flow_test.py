#!/usr/bin/env python3
"""Headless check of the race flow and UI change request (2026-10-22):

  1. results: the yellow action fits the mode (cup: FORTSÄTT · TABELLEN, single race: VÄLJ NÄSTA BANA
     with the driver and vehicle kept, time trial: FÖRSÖK IGEN), cup points go in exactly once;
  2. phones: the countdown waits while the phone is upright, restarts in full after a turn, and
     turning upright mid-race pauses it until FORTSÄTT;
  3. name entry: Swedish QWERTY, physical keys typed anywhere on the sheet, the phone's own
     keyboard one tap away, the same cleaning and 12-letter limit everywhere;
  4. driver select: no hover preview, a locked champion can't be confirmed, every portrait label
     shows its whole name on desk and phone screens.

    CHROMIUM=/path/to/chrome python3 tools/race_flow_test.py

Exit 1 on any failure or JS error.
"""
import os
import sys

from playwright.sync_api import sync_playwright

from smoke_test import serve

SIZES = {'desk': (1280, 720, False), 'desk-small': (1024, 640, False), 'phone-844': (844, 390, True),
         'iphone-se': (667, 320, True), 'portrait': (390, 660, True), 'iphone-land': (750, 340, True),
         'iphone-port': (393, 660, True), 'se-port': (375, 553, True)}
# the kart on its turntable: its middle projected to the screen must sit inside the #vsStage slot,
# the slot at least 90 px tall, and no panel (grid, info, name, bars) may cover that point
KART_SEEN = '''()=>{const b=document.getElementById('vsStage'),r=b.getBoundingClientRect();
  previewBox.setFromObject(player.v.root).getBoundingSphere(previewBall);
  const v=previewBall.center.clone().project(camera),c=canvas.getBoundingClientRect();
  const x=c.left+(v.x+1)/2*c.width,y=c.top+(1-v.y)/2*c.height;
  const top=document.elementFromPoint(x,y),cover=top&&top.closest('.vs-grid,.vs-panel,.vs-name,.vs-foot,.vs-top');
  return {h:Math.round(r.height),inside:x>=r.left&&x<=r.right&&y>=r.top&&y<=r.bottom,cover:cover?cover.className:null}}'''
SEL_SEEN = '''()=>{const g=document.getElementById('cards').getBoundingClientRect(),s=document.querySelector('#cards .vcard.sel'),
  r=s.getBoundingClientRect();
  return r.top>=g.top-1&&r.bottom<=g.bottom+1&&s.querySelector('span').textContent===document.getElementById('vsName').textContent&&
    document.getElementById('vsFull').textContent==='SLUSSTROLLET'}'''


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

        def open_page(w, h, mobile):
            ctx = browser.new_context(viewport={'width': w, 'height': h}, is_mobile=mobile, has_touch=mobile)
            page = ctx.new_page()
            page.on('pageerror', lambda e: errors.append(str(e)))
            page.route('**/*', lambda r: r.continue_() if r.request.url.startswith(url.rsplit('/', 1)[0])
                       else r.abort())
            page.goto(url)
            page.wait_for_selector('#nameBox', timeout=10000)
            return ctx, page

        # ── 3. name entry ──
        ctx, page = open_page(1280, 720, False)
        ev = page.evaluate
        rows = ev("()=>[...document.querySelectorAll('#nameKeys .nk-row')].slice(0,3).map(r=>[...r.querySelectorAll('.nk')].map(b=>b.dataset.k).join(''))")
        check(rows == ['QWERTYUIOPÅ', 'ASDFGHJKLÖÄ', 'ZXCVBNM-.'], f'name: Swedish QWERTY rows {rows}')
        check(ev("()=>!!document.getElementById('nkDel')&&!!document.querySelector('#nameKeys [data-k=\" \"]')&&!!document.getElementById('btnNameOk')"),
              'name: separate space, delete and KLAR')
        check(ev("()=>!document.getElementById('nkNative')"), 'name: no phone-keyboard key on a desk')
        page.click('#nameKeys [data-k="T"]')
        page.keyboard.type('eo<b>')           # focus is on a key now, not the box: typing still lands
        check(ev('nameBox.value') == 'TEOB', f"name: physical keys typed off the box, cleaned ({ev('nameBox.value')!r})")
        page.keyboard.press('Backspace')
        page.click('#nameKeys [data-k=" "]')
        for k in 'ÅÄÖ':
            page.click(f'#nameKeys [data-k="{k}"]')
        page.keyboard.type('abcdefghij')
        check(ev('nameBox.value') == 'TEO ÅÄÖABCDE', f"name: 12-letter limit ({ev('nameBox.value')!r})")
        page.fill('#nameBox', 'Amanda!')
        check(ev('nameBox.value') == 'AMANDA', 'name: the box cleans what is typed in it')
        page.keyboard.press('Enter')
        check(ev('SAVE.name') == 'AMANDA' and ev("state") == 'menu', 'name: Enter saves')
        ctx.close()

        ctx, page = open_page(390, 660, True)
        ev = page.evaluate
        check(ev("()=>!!document.getElementById('nkNative')"), 'name (phone): TANGENTBORD key shown')
        page.tap('#nkNative')
        check(ev('document.activeElement===nameBox'), "name (phone): TANGENTBORD focuses the box (phone's keyboard)")
        page.tap('#nameKeys [data-k="Q"]')
        check(ev('document.activeElement===nameBox') and ev('nameBox.value') == 'Q',
              'name (phone): on-screen keys type without dropping the native keyboard')
        page.keyboard.insert_text('ö-ö')      # what a phone keyboard sends
        check(ev('nameBox.value') == 'QÖ-Ö', f"name (phone): native keyboard input cleaned ({ev('nameBox.value')!r})")
        ctx.close()

        # ── 4. driver select on every screen ──
        for tag, (w, h, mob) in SIZES.items():
            ctx, page = open_page(w, h, mob)
            ev = page.evaluate
            page.fill('#nameBox', 'teo')
            page.keyboard.press('Enter')
            ev("document.getElementById('btnStart').click()")
            ev("document.getElementById('btnStageGo').click()")
            page.wait_for_timeout(500)
            cut = ev("()=>[...document.querySelectorAll('#cards .vcard span')].filter(s=>s.scrollWidth>s.clientWidth+1).map(s=>s.textContent)")
            check(not cut, f'{tag:10} pick: every portrait label whole {cut}')
            reach = ev("""()=>{const g=document.getElementById('cards'),c=[...g.querySelectorAll('.vcard')];g.scrollTop=1e6;
              const l=c[c.length-1].getBoundingClientRect(),r=g.getBoundingClientRect(),n=document.getElementById('vsName').getBoundingClientRect();
              return l.bottom<=r.bottom+1&&l.top>=r.top-1&&n.height>0&&n.bottom<=innerHeight&&n.top>=0}""")
            check(reach, f'{tag:10} pick: last driver reachable, the name in view')
            page.wait_for_timeout(300)
            k = ev(KART_SEEN)
            check(k['h'] >= 90 and k['inside'] and not k['cover'], f'{tag:10} pick: the kart in its own slot, uncovered {k}')
            if mob:
                ev("document.getElementById('btnGo').click()")
                page.wait_for_timeout(300)
                k = ev(KART_SEEN)
                check(k['h'] >= 90 and k['inside'] and not k['cover'], f'{tag:10} pick: vehicle step, the kart in view {k}')
                ev("document.getElementById('btnBack').click()")
            ev("applyCharacter(CHARS.findIndex(c=>c.id==='slusstrollet'))")
            check(ev(SEL_SEEN), f'{tag:10} pick: the 1P portrait in view, its label is the big name, full name under it')
            if not mob:
                page.hover('#cards .vcard:nth-child(5)')
                page.wait_for_timeout(200)
                same = ev("()=>document.getElementById('vsName').textContent===CHARS[charSel].short&&document.getElementById('btnGoT').textContent==='VÄLJ '+CHARS[charSel].short")
                check(same, f'{tag:10} pick: hovering another driver changes nothing')
            locked = ev("()=>{const b=document.querySelector('#cards .vcard.locked');if(!b)return null;b.click();"
                        "return {go:document.getElementById('btnGo').disabled,t:document.getElementById('btnGoT').textContent,sel:charSel}}")
            if locked:
                check(locked['go'] and locked['t'] == 'LÅST', f'{tag:10} pick: a locked champion shows LÅST, KÖR is off {locked}')
                ev("goFromSelect()")
                check(ev("state") == 'select', f'{tag:10} pick: Enter on a locked champion starts nothing')
            page.click('#cards .vcard:nth-child(4)') if not mob else page.tap('#cards .vcard:nth-child(4)')
            agree = ev("""()=>{const c=CHARS[charSel],sel=document.querySelector('#cards .vcard.sel');
              return !document.getElementById('btnGo').disabled&&document.getElementById('vsName').textContent===c.short&&
                +sel.dataset.i===charSel&&!document.querySelector('#cards .vcard.peek')}""")
            check(agree, f'{tag:10} pick: tapped portrait, name and KÖR agree')
            ctx.close()

        # ── 2. phones: the countdown waits for landscape ──
        ctx, page = open_page(390, 660, True)
        ev, wait = page.evaluate, page.wait_for_timeout
        page.fill('#nameBox', 'teo')
        page.keyboard.press('Enter')
        ev("()=>{CUP=null;TT=false;FREE=false;startRace();}")
        wait(2500)
        held = ev("()=>({s:state,c:countdown,p:player.progress,ai:karts[1].progress,rot:getComputedStyle(document.getElementById('rotate')).display})")
        check(held['s'] == 'grid' and held['c'] >= 3.5 and held['rot'] == 'grid',
              f'upright: VRID TELEFONEN up, countdown held {held}')
        page.set_viewport_size({'width': 844, 'height': 390})
        wait(1200)
        mid = ev("()=>({s:state,c:countdown})")
        check(mid['s'] == 'grid' and 2.0 < mid['c'] < 3.6, f'landscape: countdown runs {mid}')
        page.set_viewport_size({'width': 390, 'height': 660})
        wait(400)
        back = ev("()=>({s:state,c:countdown})")
        check(back['s'] == 'grid' and back['c'] >= 3.5, f'turned upright mid-countdown: back to the full count {back}')
        page.set_viewport_size({'width': 844, 'height': 390})
        wait(5200)
        check(ev('state') == 'race', 'landscape again: the full count, then KÖR!')
        page.keyboard.down('w')
        wait(800)
        page.set_viewport_size({'width': 390, 'height': 660})
        wait(300)
        a = ev("()=>({p:paused,t:raceTime,pr:player.progress,ai:karts[1].progress})")
        wait(1200)
        b = ev("()=>({p:paused,t:raceTime,pr:player.progress,ai:karts[1].progress})")
        check(a['p'] and a == b, f'turned upright mid-race: paused, nobody moves {a} {b}')
        page.set_viewport_size({'width': 844, 'height': 390})
        wait(500)
        check(ev('paused'), 'landscape again: still paused until FORTSÄTT')
        page.tap('#btnResume')
        wait(600)
        check(not ev('paused') and ev('raceTime') > b['t'], 'FORTSÄTT: the race goes on')
        page.keyboard.up('w')
        ctx.close()

        # ── 1. results: the next step per mode ──
        ctx, page = open_page(1280, 720, False)
        ev, wait = page.evaluate, page.wait_for_timeout
        page.fill('#nameBox', 'teo')
        page.keyboard.press('Enter')
        FINISH = "()=>{player.done=true;player.total=99;player.best=30;order();finish();}"
        SHOWN = "()=>[...document.querySelectorAll('#done button')].filter(b=>b.offsetParent).map(b=>b.id)"
        FIRST = "()=>{const b=document.querySelector('#done .go:not([hidden])');return b&&b.id}"
        page.click('#btnStart')
        page.click('#btnStageGo')
        page.click('#cards .vcard:nth-child(3)')
        ev("stepCar(1)")
        kept = ev("[charSel,carSel,stage.id]")
        page.click('#btnGo')
        wait(4500)
        ev(FINISH)
        wait(300)
        shown = ev(SHOWN)
        check(shown[0] == 'btnNextStage' and ev(FIRST) == 'btnNextStage' and 'btnTryAgain' not in shown and 'btnTable' not in shown,
              f'single race: VÄLJ NÄSTA BANA is the one main action {shown}')
        page.keyboard.press('Enter')
        wait(300)
        check(ev("!sheetStages.classList.contains('hide')&&SS.keep"), 'single race: Enter opens the stage picker')
        nxt = ev("()=>({t:document.getElementById('btnStageGoT').textContent,id:STAGES[SS.list[SS.hi]].id})")
        check(nxt['t'].startswith('KÖR ') and nxt['id'] != kept[2], f'single race: next stage highlighted, KÖR {nxt}')
        page.click('#btnStageGo')
        wait(600)
        now = ev("[charSel,carSel,stage.id,state]")
        check(now[:2] == kept[:2] and now[2] == nxt['id'] and now[3] == 'grid',
              f'single race: the next race starts with the same driver and vehicle {kept} -> {now}')

        ev("()=>{showMenu();}")
        page.click('#btnTT')
        page.click('#btnStageGo')
        page.click('#btnGo')
        wait(4500)
        ev(FINISH)
        wait(300)
        shown = ev(SHOWN)
        check(ev(FIRST) == 'btnTryAgain' and 'btnNextStage' not in shown and 'btnAgain' not in shown,
              f'time trial: FÖRSÖK IGEN is the main action {shown}')
        page.click('#btnTryAgain')
        check(ev('state') == 'grid' and ev('TT'), 'time trial: FÖRSÖK IGEN restarts it')

        ev("()=>{showMenu();}")
        page.click('#btnCup')
        page.click('#btnCupNext')
        page.click('#btnGo')
        page.click('#btnBriefGo')
        wait(4500)
        ev(FINISH)
        wait(1500)
        shown = ev(SHOWN)
        pts = ev("SAVE.cup.pts.reduce((a,b)=>a+b,0)")
        check(shown == ['btnTable'] and ev(FIRST) == 'btnTable', f'cup: FORTSÄTT · TABELLEN is the only way on {shown}')
        check(pts == 28 and ev("SAVE.cup.applied.length") == 1, f'cup: round points recorded once ({pts} p)')
        ev("()=>{commitRound();commitRound();}")
        check(ev("SAVE.cup.pts.reduce((a,b)=>a+b,0)") == 28, 'cup: committing again adds nothing')
        page.keyboard.press('Enter')
        wait(300)
        check(ev("!document.getElementById('table').classList.contains('hide')") and
              ev("document.getElementById('btnTableNext').textContent") == 'NÄSTA BANA', 'cup: Enter shows the table, then NÄSTA BANA')
        page.click('#btnTableNext')
        check(ev("!document.getElementById('brief').classList.contains('hide')") and ev("SAVE.cup.round") == 1,
              'cup: NÄSTA BANA briefs round 2')
        # the last round: the table then leads to the final results
        ev("()=>{SAVE.cup.round=cupRounds(SAVE.cup).length-1;showBrief();}")
        page.click('#btnBriefGo')
        wait(4500)
        ev(FINISH)
        wait(1500)
        page.click('#btnTable')
        check(ev("SAVE.cup.done") and ev("document.getElementById('btnTableNext').textContent") == 'SLUTRESULTAT',
              'cup: after the final round the table leads to SLUTRESULTAT')
        page.click('#btnTableNext')
        check(ev("!document.getElementById('podium').classList.contains('hide')"), 'cup: SLUTRESULTAT shows the podium')
        ctx.close()
        browser.close()
    if errors:
        print('JS errors:', errors[:3])
    sys.exit(1 if fails or errors else 0)


if __name__ == '__main__':
    main()
