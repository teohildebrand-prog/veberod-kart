#!/usr/bin/env python3
"""Headless phone test: the race's touch controls and the zoom/scroll guards.

    pip install playwright && python3 tools/touch_test.py

Emulates a landscape phone (844x390, touch) and checks that two thumbs can
steer and drift at once, that the steering thumb is analog, that BROMS and
SLADD swap under a sliding thumb, that gas is automatic, and that the touch
and gesture events Safari would zoom or scroll on are cancelled on the race
but left alone on menus. Set CHROMIUM to use an existing Chromium binary.
"""
import os
import sys

from playwright.sync_api import sync_playwright

from smoke_test import serve


def main():
    httpd = serve()
    url = f'http://127.0.0.1:{httpd.server_port}/index.html'
    errors, fails = [], []

    def check(name, ok, got=None):
        print(('ok   ' if ok else 'FAIL ') + name + ('' if got is None else f'  {got}'))
        if not ok:
            fails.append(name)

    with sync_playwright() as p:
        browser = p.chromium.launch(executable_path=os.environ.get('CHROMIUM') or None,
                                    args=['--use-gl=angle', '--use-angle=swiftshader',
                                          '--enable-unsafe-swiftshader'])
        ctx = browser.new_context(viewport={'width': 844, 'height': 390}, device_scale_factor=2,
                                  is_mobile=True, has_touch=True)
        page = ctx.new_page()
        page.on('pageerror', lambda e: errors.append(str(e)))
        page.route('**/*', lambda r: r.continue_() if r.request.url.startswith(url.rsplit('/', 1)[0])
                   else r.abort())
        page.goto(url)
        page.fill('#nameBox', 'teo', timeout=10000)
        page.keyboard.press('Enter')
        for button in ('#btnStart', '#btnStageGo', '#btnGo', '#btnGo'):   # driver, then vehicle
            page.tap(button, timeout=10000)
        page.wait_for_timeout(5500)                      # countdown
        cdp = ctx.new_cdp_session(page)

        def centre(sel):
            b = page.locator(sel).bounding_box()
            return b['x'] + b['width'] / 2, b['y'] + b['height'] / 2

        def touches(kind, pts):
            cdp.send('Input.dispatchTouchEvent', {'type': kind, 'touchPoints':
                     [{'x': x, 'y': y, 'id': i} for i, x, y in pts]})
            page.wait_for_timeout(120)

        ctl = lambda: page.evaluate('(readInput(),{steer:input.steer,drift:input.drift,'
                                    'throttle:input.throttle,brake:input.brake})')
        sx, sy = centre('#stick')
        dx, dy = centre('#pD')
        bx, by = centre('#pB')
        check('auto-gas with no thumbs down', ctl()['throttle'] == 1)

        touches('touchStart', [(1, sx, sy)])
        touches('touchStart', [(1, sx, sy), (2, dx, dy)])
        touches('touchMove', [(1, sx - 25, sy), (2, dx, dy)])
        c = ctl()
        check('small push = gentle left while drifting', 0 < c['steer'] < 0.6 and c['drift'], c)
        touches('touchMove', [(1, sx + 90, sy), (2, dx, dy)])
        c = ctl()
        check('full right while drifting', c['steer'] < -0.95 and c['drift'], c)
        touches('touchMove', [(1, sx + 90, sy), (2, bx, by)])
        c = ctl()
        check('drift thumb slides onto BROMS', c['brake'] == 1 and not c['drift'] and c['throttle'] == 0, c)
        touches('touchEnd', [(2, bx, by)])           # CDP lists the finger that lifts
        c = ctl()
        check('steering survives the other thumb lifting', c['steer'] < -0.95 and c['brake'] == 0, c)
        touches('touchEnd', [])
        check('all thumbs up: straight, gas on', ctl()['steer'] == 0 and ctl()['throttle'] == 1)

        guard = '''([sel,type,n])=>{const el=document.querySelector(sel),r=el.getBoundingClientRect();
          const t=i=>new Touch({identifier:i,target:el,clientX:r.left+5+i,clientY:r.top+5});
          const list=[...Array(n)].map((_,i)=>t(i));
          const ev=type.startsWith('gesture')?new Event(type,{bubbles:true,cancelable:true})
            :new TouchEvent(type,{bubbles:true,cancelable:true,touches:list,targetTouches:list,changedTouches:list});
          el.dispatchEvent(ev);return ev.defaultPrevented;}'''
        for sel, type_, n in (('#gl', 'touchstart', 2), ('#gl', 'touchmove', 1), ('#gl', 'touchend', 1),
                              ('#pD', 'touchstart', 1), ('#stickzone', 'touchmove', 1),
                              ('#gl', 'gesturestart', 0), ('#gl', 'gesturechange', 0)):
            check(f'race blocks {type_} on {sel}', page.evaluate(guard, [sel, type_, n]))
        check('pause button still gets its tap', not page.evaluate(guard, ['#pause', 'touchend', 1]))
        page.tap('#pause')
        page.wait_for_timeout(300)
        check('paused', page.evaluate('paused'))
        check('menus still scroll', not page.evaluate(guard, ['#pausemenu .sheet-in, .sheet:not(.hide) > *', 'touchmove', 1]))
        vv = page.evaluate('visualViewport.scale')
        check('page never zoomed', vv == 1, vv)
        browser.close()
    check('no JS errors', not errors, errors[:3])
    sys.exit(1 if fails else 0)


if __name__ == '__main__':
    main()
