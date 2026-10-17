#!/usr/bin/env python3
"""Bake the stage picker's portraits from the real scenery into js/54-stage-art.js.

    python3 tools/stage_art.py

Loads the game headless, renders every stage from its own `view` with the
game's renderStageArt(), and writes the images as data URLs (WebP) into
STAGE_ART. Run it again after changing a stage's scenery or view; a stage
missing from STAGE_ART still works, the picker renders it live instead. Set
CHROMIUM to use an existing Chromium binary instead of Playwright's own.
"""
import os
import sys

from playwright.sync_api import sync_playwright

from smoke_test import ROOT, serve

W, H, QUALITY = 320, 180, 0.82
OUT = ROOT / 'js' / '54-stage-art.js'
HEAD = '''"use strict";
/* ───────── stage art ───────── */
/* Stage picker portraits, baked from each stage's scenery and view by tools/stage_art.py.
   Generated: edit the stage's view and run the tool again rather than editing this. */
'''


def main():
    httpd = serve()
    base = f'http://127.0.0.1:{httpd.server_port}/'
    errors = []
    with sync_playwright() as p:
        browser = p.chromium.launch(executable_path=os.environ.get('CHROMIUM') or None,
                                    args=['--use-gl=angle', '--use-angle=swiftshader',
                                          '--enable-unsafe-swiftshader'])
        page = browser.new_page(viewport={'width': 960, 'height': 600})
        page.on('pageerror', lambda e: errors.append(str(e)))
        page.route('**/*', lambda r: r.continue_() if r.request.url.startswith(base) else r.abort())
        page.goto(base + 'index.html')
        page.wait_for_function('typeof renderStageArt === "function"', timeout=30000)
        art = page.evaluate('''([w, h, q]) => STAGES.map(S =>
            [S.id, renderStageArt(S, w, h, 'image/webp', q)])''', [W, H, QUALITY])
        browser.close()
    if errors:
        sys.exit(f'JS errors while baking: {errors}')
    body = ''.join(f"\n  {sid}:'{url}'," for sid, url in art)
    OUT.write_text(HEAD + 'const STAGE_ART={' + body.rstrip(',') + '\n};\n', encoding='utf-8')
    size = sum(len(u) for _, u in art)
    print(f'{len(art)} portraits, {size // 1024} KB, written to {OUT.relative_to(ROOT)}')


if __name__ == '__main__':
    main()
