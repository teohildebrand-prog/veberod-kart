#!/usr/bin/env python3
"""Split the single-file game (veberod-kart.html) into the repo layout.

    python3 tools/split.py path/to/veberod-kart.html

Writes index.html, css/style.css and js/NN-<section>.js next to this tools/
folder. The JS files are split at the `/* ───────── name ───────── */`
section banners and load as ordered classic <script> tags, so top-level
let/const/function declarations stay shared exactly as they were inside the
original IIFE. No build step, and index.html also opens straight from disk.
"""
import re
import sys
import unicodedata
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
BANNER = re.compile(r'^/\* ─+ (.+?) ─+ \*/$', re.M)
THREE_TAG = '<script src="vendor/three.min.js"></script>'
# Sections that call each other's functions at load time (e.g. wiring a button
# to a function declared further down) must share a file: function hoisting
# only works within one script. Keys are merged into the section before them.
MERGE_INTO_PREVIOUS = {'menu-cup-sheets-album'}


def slug(title):
    title = re.split(r'[:—]', title)[0]           # "pickups: mjölk & paj" -> "pickups"
    s = unicodedata.normalize('NFKD', title).encode('ascii', 'ignore').decode()
    s = re.sub(r'[^a-zA-Z0-9]+', '-', s.lower()).strip('-')
    return s or 'section'


def main(src):
    html = Path(src).read_text(encoding='utf-8')
    # artifact-export wrapper: the real document starts at the second doctype
    docs = [m.start() for m in re.finditer(r'<!doctype html>', html, re.I)]
    html = html[docs[-1]:] if docs else html
    html = html[:html.index('</html>') + len('</html>')]

    css = re.search(r'<style>\n?(.*?)</style>', html, re.S).group(1)
    head = html[:html.index('<style>')]
    body = re.search(r'<body>\n?(.*?)<script src=', html, re.S).group(1)
    js = re.search(r'<script>\n(.*?)</script>', html, re.S).group(1)

    # unwrap the IIFE: (function(){ "use strict"; ... })();
    js = re.sub(r'^\(function\(\)\{\n"use strict";\n', '', js)
    js = re.sub(r'\}\)\(\);\s*$', '', js)
    # a bare `return` only worked inside the IIFE; stop the remaining scripts
    js = re.sub(r"fail\('([^']*)'\);return;",
                lambda m: f"fail('{m.group(1)}');throw new Error('{m.group(1)}');", js)

    marks = list(BANNER.finditer(js))
    parts = [('boot', js[:marks[0].start()])] if marks and js[:marks[0].start()].strip() else []
    for i, m in enumerate(marks):
        end = marks[i + 1].start() if i + 1 < len(marks) else len(js)
        chunk = js[m.start():end]
        if not BANNER.sub('', chunk).strip():       # empty banner: fold into the next one
            continue
        if slug(m.group(1)) in MERGE_INTO_PREVIOUS and parts:
            parts[-1] = (parts[-1][0], parts[-1][1] + chunk)
            continue
        parts.append((slug(m.group(1)), chunk))

    (ROOT / 'css').mkdir(exist_ok=True)
    jsdir = ROOT / 'js'
    jsdir.mkdir(exist_ok=True)
    for old in jsdir.glob('[0-9][0-9]-*.js'):
        old.unlink()
    (ROOT / 'css' / 'style.css').write_text(css, encoding='utf-8')

    tags = []
    for n, (name, chunk) in enumerate(parts):
        fname = f'{n:02d}-{name}.js'
        (jsdir / fname).write_text('"use strict";\n' + chunk.rstrip() + '\n', encoding='utf-8')
        tags.append(f'<script src="js/{fname}"></script>')

    out = (head + '<link rel="stylesheet" href="css/style.css">\n</head>\n<body>\n'
           + body + THREE_TAG + '\n' + '\n'.join(tags) + '\n</body>\n</html>\n')
    (ROOT / 'index.html').write_text(out, encoding='utf-8')
    print(f'index.html, css/style.css and {len(parts)} js files written to {ROOT}')


if __name__ == '__main__':
    if len(sys.argv) != 2:
        sys.exit(__doc__)
    main(sys.argv[1])
