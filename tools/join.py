#!/usr/bin/env python3
"""Join the repo layout back into one self-contained HTML file (the inverse of split.py).

    python3 tools/join.py path/to/veberod-kart.html

Inlines css/style.css and every js/NN-*.js listed in index.html into one
<script> in a strict-mode IIFE, and loads three.js r128 from cdnjs, so the
result runs on its own the way the original single-file game did. Running
split.py on the output gives the same repo layout back.
"""
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
THREE_CDN = '<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>'


def main(out):
    html = (ROOT / 'index.html').read_text(encoding='utf-8')
    css = (ROOT / 'css' / 'style.css').read_text(encoding='utf-8')
    names = re.findall(r'<script src="(js/[^"]+)"></script>', html)
    chunks = []
    for name in names:
        js = (ROOT / name).read_text(encoding='utf-8')
        js = re.sub(r'^"use strict";\n', '', js)
        # inside the IIFE a bare return stops the game, as it did before the split
        js = re.sub(r"fail\('([^']*)'\);throw new Error\('\1'\);", r"fail('\1');return;", js)
        chunks.append(js.rstrip() + '\n')
    script = '<script>\n(function(){\n"use strict";\n' + '\n'.join(chunks) + '})();\n</script>\n'
    head = html[:html.index('<link rel="stylesheet" href="css/style.css">')]
    body = html[html.index('<body>'):html.index('<script src=')]
    doc = (head + '<style>\n' + css + '</style>\n</head>\n' + body
           + THREE_CDN + '\n' + script + '</body>\n</html>\n')
    Path(out).write_text(doc, encoding='utf-8')
    print(f'{len(names)} js files joined into {out} ({len(doc) // 1024} KB)')


if __name__ == '__main__':
    if len(sys.argv) != 2:
        sys.exit(__doc__)
    main(sys.argv[1])
