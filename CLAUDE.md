# Veberöd Kart - Jakten

A silly PS1-style kart racer through Skåne (and now Västergötland). Three.js r128, plain JavaScript, no build step. Owner: Teo (GitHub `teohildebrand-prog`).

Read these first:
- [docs/HISTORY.md](docs/HISTORY.md): Teo's standing rules, the roadmap and open items, links to the GDD, then the build history of every feature (PRs #1 to #52). Its rules section is binding; don't re-ask what it already decides.
- [README.md](README.md): how to play, controls, layout.

## Layout
```
index.html            markup (HUD, menus) + <script> tags in load order
css/style.css         Frutiger Aero glass UI, HUD, phone layouts
js/NN-<section>.js    game code, one file per section, loaded in number order
vendor/three.min.js   three.js r128
tools/                tests, audits and build scripts (Python, plus one Node audio test)
docs/                 HISTORY.md (rules, roadmap, history), design.md (doc links)
Jenkinsfile           CI: every test and audit
```

The `js/` files are classic scripts, not ES modules: one shared global scope, so anything declared in an earlier file is visible in later ones.
- The number prefix is the load order and `index.html` must list the file. A new file goes in `index.html` at its number.
- Code that runs at load time may only use its own file or earlier files. Passing a later file's function by reference at load time (`addEventListener('click', fn)`) throws; wrap it in an arrow.
- Don't put a dashed banner comment (`/* ── x ── */`) inside a file: `tools/split.py` treats any such banner as a new section.

## Build
- The repo is the source. `python3 tools/join.py out.html` builds the single self-contained HTML file (three.js from cdnjs); `tools/split.py` is its inverse and only needed to import a single-file build.
- Stage picker portraits are baked: after changing a stage's scenery or `view`, run `python3 tools/stage_art.py` (writes js/54-stage-art.js). It re-renders every portrait with texture noise, so keep only the changed stage's line in the diff.
- Serve locally with `tools/serve.sh` (http://localhost:8000/), or open `index.html` from disk.

## Test
```bash
pip install -r requirements-dev.txt && playwright install chromium
python3 tools/smoke_test.py        # always: loads the game, starts a race, fails on any JS error
```
Every test and audit is a stage in `Jenkinsfile` (Docker image `mcr.microsoft.com/playwright/python:v1.49.0-noble`); that list is the full suite. Run the tests for the area you touched plus the smoke test. Set `CHROMIUM=/path/to/chrome` to use an existing Chromium instead of Playwright's download.
- `tools/fuel_audit.py` and `tools/band_audit.py` run headless races and take minutes; other tests can time out if run alongside them, so run them on their own.
- A new test: Python + Playwright like the others, add it as a Jenkins stage, add any screenshots to `archiveArtifacts`, and list it in the README.

## Checklists
A new track needs: a STAGES entry with `order`, `tag` (Swedish) and `view`; a `FUEL_MUL` entry (`python3 tools/fuel_audit.py <id> --calibrate`); three picnic stamps; a postcard (`postcard:` on the stage or `VYKORT` in js/36-vykort.js); a baked portrait; its shortcuts in `tools/shortcut_test.py`; a cup only if one has room (max four rounds) or a new cup.

A new signature item needs: to fire and be spent with nobody to hit, an AI use, an entry in `SIG_OPENS` (js/40-genvagar.js) saying whether it opens closed shortcuts, sideways-only knockback, and a test.

A new menu sheet needs a `PADBACK` entry (js/53-gamepad.js) for the pad's B button, one yellow `.go` action, and a check at phone sizes (`tools/menu_fit_test.py`, `tools/race_flow_test.py`).

## Working rules
- Player-facing text is Swedish; code, comments, commits and docs are English.
- No real brands, original characters only, ideas only from LEGO Racers. Exceptions and Easter eggs are listed in docs/HISTORY.md.
- One change per PR on its own branch; Teo reviews and merges. Each PR adds a dated section to docs/HISTORY.md (what Teo asked, what he picked, what was built, which test checks it) and updates the roadmap there if it closes an open item.
- When a change involves a design choice, offer Teo a few options and let him pick; record his picks and your own defaults separately in HISTORY.md.
- Teo plays on a real iPhone: check phone sizes (about 393x660 portrait, 750x340 landscape) for anything on screen.
- Teo prefers Python, bash, Jenkins and git for tooling.
