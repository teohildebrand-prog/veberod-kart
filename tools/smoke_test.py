#!/usr/bin/env python3
"""Headless smoke test: load the game, start a race, hold the throttle.

    pip install playwright && python3 tools/smoke_test.py

Fails (exit 1) on any JS error, or if the kart doesn't move. Set CHROMIUM to
use an existing Chromium binary instead of Playwright's own download.
"""
import functools
import http.server
import os
import sys
import threading
from pathlib import Path

from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parent.parent


class QuietHandler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *args):
        pass


def serve():
    handler = functools.partial(QuietHandler, directory=str(ROOT))
    httpd = http.server.ThreadingHTTPServer(('127.0.0.1', 0), handler)
    threading.Thread(target=httpd.serve_forever, daemon=True).start()
    return httpd


def main():
    httpd = serve()
    page_name = sys.argv[1] if len(sys.argv) > 1 else 'index.html'
    url = f'http://127.0.0.1:{httpd.server_port}/{page_name}'
    errors = []
    with sync_playwright() as p:
        browser = p.chromium.launch(executable_path=os.environ.get('CHROMIUM') or None,
                                    args=['--use-gl=angle', '--use-angle=swiftshader',
                                          '--enable-unsafe-swiftshader'])
        page = browser.new_page(viewport={'width': 960, 'height': 600})
        page.on('pageerror', lambda e: errors.append(str(e)))
        page.on('console', lambda m: m.type == 'error' and errors.append(m.text))
        # keep the test offline: only our own files load (fonts fall back)
        page.route('**/*', lambda r: r.continue_() if r.request.url.startswith(url.rsplit('/', 1)[0])
                   else r.abort())
        page.goto(url)
        try:
            page.fill('#nameBox', 'teo', timeout=10000)   # first launch asks for a name
            page.keyboard.press('Enter')
            for button in ('#btnStart', '#btnStageGo', '#btnGo'):
                page.click(button, timeout=10000)
        except Exception as e:
            browser.close()
            sys.exit(f'could not start a race ({e.__class__.__name__}); JS errors: {errors}')
        page.wait_for_timeout(5000)            # countdown
        page.keyboard.down('w')
        page.wait_for_timeout(4000)
        speed = int(page.inner_text('#spd').split('KM')[0].strip() or 0)
        page.keyboard.up('w')
        page.screenshot(path=str(ROOT / 'smoke.png'))
        browser.close()
    httpd.shutdown()

    errors = [e for e in errors if 'net::ERR_FAILED' not in e]  # blocked font requests
    print(f'speed after 4 s of throttle: {speed} km/h')
    for e in errors:
        print('JS error:', e)
    if errors or speed <= 0:
        sys.exit('smoke test FAILED')
    print('smoke test passed')


if __name__ == '__main__':
    main()
