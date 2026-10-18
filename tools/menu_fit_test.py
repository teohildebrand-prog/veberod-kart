#!/usr/bin/env python3
"""Headless phone test: every menu fits the visible screen.

    pip install playwright && python3 tools/menu_fit_test.py

Opens the name entry, main menu, cup setup, picnic pass, stage select, driver
select and pause menu on four phone screens (landscape, landscape with the
browser toolbar showing, a small landscape phone and portrait). Fails if a
menu's main action is off screen, the stage roster isn't one
scrolling list with its last track reachable, the page scrolls sideways, or a button is
under 44 CSS px tall (filter chips excepted), or if pinch-zoom is
turned off on a menu (headless Chromium can't pinch, so this reads touch-action). Set CHROMIUM to use an existing
Chromium binary.
"""
import os
import sys

from playwright.sync_api import sync_playwright

from smoke_test import serve

SIZES = {'landscape': (844, 390), 'toolbar': (780, 320), 'small': (667, 320), 'portrait': (390, 660)}
MEASURE = '''(id)=>{const sh=document.getElementById(id),vw=innerWidth,vh=innerHeight;
  const shown=[...sh.querySelectorAll('button')].filter(b=>b.offsetParent&&!b.hidden);
  const small=shown.filter(b=>!b.classList.contains('tab')&&b.getBoundingClientRect().height<43.5)
    .map(b=>(b.id||b.className)+' '+Math.round(b.getBoundingClientRect().height)+'px');
  const go=[...sh.querySelectorAll('.go,.vs-go')].find(b=>b.offsetParent&&!b.hidden);
  const r=go&&go.getBoundingClientRect();
  return {main:go?go.textContent.trim():null,
          onScreen:!!go&&r.top>=0&&r.bottom<=vh+0.5&&r.left>=0&&r.right<=vw+0.5,
          sideways:sh.scrollWidth>sh.clientWidth+1,small,
          zoom:['manipulation','auto'].includes(getComputedStyle(document.body).touchAction)||
               /pinch-zoom|auto|manipulation/.test(getComputedStyle(sh).touchAction)}}'''


def main():
    httpd = serve()
    url = f'http://127.0.0.1:{httpd.server_port}/index.html'
    fails, errors = [], []
    with sync_playwright() as p:
        browser = p.chromium.launch(executable_path=os.environ.get('CHROMIUM') or None,
                                    args=['--use-gl=angle', '--use-angle=swiftshader',
                                          '--enable-unsafe-swiftshader'])
        for tag, (w, h) in SIZES.items():
            ctx = browser.new_context(viewport={'width': w, 'height': h}, is_mobile=True, has_touch=True)
            page = ctx.new_page()
            page.on('pageerror', lambda e: errors.append(str(e)))
            page.route('**/*', lambda r: r.continue_() if r.request.url.startswith(url.rsplit('/', 1)[0])
                       else r.abort())
            page.goto(url)
            page.wait_for_selector('#nameBox', timeout=10000)

            def check(sheet):
                page.wait_for_timeout(400)
                m = page.evaluate(MEASURE, sheet)
                bad = []
                if not m['onScreen']:
                    bad.append(f"main action {m['main']!r} off screen")
                if m['sideways']:
                    bad.append('scrolls sideways')
                if not m['zoom'] and sheet != 'paused':     # menus keep pinch-zoom; the race does not
                    bad.append('pinch-zoom blocked')
                if m['small']:
                    bad.append('small buttons: ' + ', '.join(m['small'][:5]))
                print(('FAIL ' if bad else 'ok   ') + f'{tag:9} {sheet:9} ' + '; '.join(bad))
                if bad:
                    fails.append(f'{tag}/{sheet}')

            click = lambda b: page.evaluate(f"document.getElementById('{b}').click()")
            check('namn')
            page.fill('#nameBox', 'teo')
            page.keyboard.press('Enter')
            check('start')
            click('btnCup'); check('cupsetup'); click('btnCupBack')
            click('btnAlbum'); check('album'); click('btnAlbumBack')
            click('btnStart'); check('stages')
            # phones get one scrolling roster: the last track must scroll fully into view above the bottom bar
            reach = page.evaluate('''()=>{const g=document.getElementById('ssGrid'),c=[...g.querySelectorAll('.scard')];
              if(!document.getElementById('stages').classList.contains('sslist'))return {list:false,ok:c.length>0};
              g.scrollTop=1e6;const last=c[c.length-1].getBoundingClientRect(),gr=g.getBoundingClientRect(),
              foot=document.querySelector('#stages .vs-foot').getBoundingClientRect();
              return {list:true,ok:c.every(e=>!e.hidden)&&last.bottom<=gr.bottom+1&&last.bottom<=foot.top+1&&last.top>=gr.top-1}}''')
            print(('ok   ' if reach['ok'] and reach['list'] else 'FAIL ') + f'{tag:9} stages    roster is one list, last track reachable')
            if not (reach['ok'] and reach['list']):
                fails.append(f'{tag}/stages-roster')
            click('btnStageGo'); check('pick')
            click('btnGo')
            page.wait_for_timeout(1500)
            page.evaluate('setPause(true)')
            check('paused')
            ctx.close()
        browser.close()
    if errors:
        print('JS errors:', errors[:3])
    sys.exit(1 if fails or errors else 0)


if __name__ == '__main__':
    main()
