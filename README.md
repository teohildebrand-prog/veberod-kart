# Veberöd Kart - Jakten

A silly PS1-style kart racer through the Skåne countryside. Three.js r128,
plain JavaScript, no build step.

## Play

Open `index.html` in a browser, or serve the folder:

```bash
tools/serve.sh            # http://localhost:8000/
```

Controls: WASD drive, Space drift, E fire, H horn, C camera, R reset,
Esc pause, M sound, V CRT filter. Touch pads appear on phones.

## Layout

```
index.html            page markup (HUD, menus) + script tags in load order
css/style.css         Frutiger Aero glass UI and HUD
js/NN-<section>.js    game code, one file per section, loaded in order
vendor/three.min.js   three.js r128 (MIT, see vendor/three.LICENSE)
tools/serve.sh        local web server
tools/smoke_test.py   headless test: start a race, fail on JS errors
tools/split.py        regenerate index.html/css/js from a single-file build
docs/                 design notes and build history
Jenkinsfile           CI: runs the smoke test
```

The `js/` files are classic scripts, not ES modules. They share one global
scope, so a `const` or `function` declared in an earlier file is visible in
every later one. Order matters: the number prefix is the load order, and
`index.html` lists them in that order. New code goes in the file for its
section, or a new numbered file added to `index.html`. Code that runs at
load time (like wiring a button) can only use functions from its own file or
earlier files; `tools/smoke_test.py` catches it when that breaks.

## Test

```bash
pip install -r requirements-dev.txt && playwright install chromium
python3 tools/smoke_test.py
```
