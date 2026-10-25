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

## Architecture
Where things live, by number band (83 files, ~25k lines):
- `00`-`04`: boot (`fail()` if no WebGL/three.js), helpers, PS1 renderer and materials, sky.
- `05-stages.js`: track geometry globals (`N=720` samples per lap, `sx/sz/curv/bank...` typed arrays), the first `STAGES` entries and `let stage`. Each later track file (`10`-`29`) calls `STAGES.push({id, group, ...})` and may extend the shared registries `SURF`, `SFX`, `ROADTEX` for its own surfaces. A stage holds `ctrl` (spline control points), `routes` (shortcuts), `stamps`, `jumpSpec`, `zones` (`[a, b, surface]` main-road surfaces by sample; a fourth value `1`/`-1` covers only the right/left half, read with `mainSurfAt(i, lat)`), look (`sky`, `fog`, `road`...), `laps` and `aiLook` (a shorter AI aim for tight bends), and may opt in to `say`/`duo`/`rivals` (its own driver lines, a grid exchange, who counts as whose rival) and `aiDodge(k,t,L)` (the AI line round a moving hazard); `group` names its cup tour (`skane`, `osterlen`, `kust`, `vild`, `final`, `vastgota`, `goteborg`, `bonus`).
- `30-*`: drivers and vehicles. `CHARS` (playable drivers), `ROSTER` and `karts` in js/30-karts.js; `VEHICLES` in js/30-vehicles.js; driver-specific files (`30-bodil`, `30-weiron`, `30-west-crew`, `30-burgarbus`).
- `31-save.js`: `SAVE` object in localStorage key `vk.save.v1`; every access in try/catch, `writeSave()` persists. Audio settings use `vk.audio.v1`.
- `32`-`40`: time trial, cups (`CUPS` in js/33-skanecupen.js), pickups, picnic stamps, postcards, items (`37-*`; `SIGS` in js/37-signature-items.js), fuel (`FUEL_MUL` in js/38-statolja.js), shortcuts (js/40-genvagar.js).
- `41`-`47`: input, audio, physics and AI (`drive()`, `aiControl()`, rubber band `PACE` in js/43-physics.js), kart drawing, camera, minimap, HUD.
- `48-world.js` `buildWorld(stage)` builds the scene; `49-race-flow.js` owns the race state machine (`state`: `'menu'`, `'grid'`, `'race'`, `'over'`), `resetRace()`, `startRace()`.
- `50`-`57`: debug menu (`DBG`), sandlåda, gamepad (`PADBACK`), baked stage art, stage select, the main loop, player name.
- js/56-loop.js is the frame loop: `requestAnimationFrame`, frame dt capped at 0.1 s, physics stepped at fixed `1/120` s (max 10 steps per frame) for every kart while racing, then draw, HUD, audio, render. It calls `buildWorld(stage)` and starts the loop at load, so whatever `buildWorld()`, `placeOnGrid()` and `resize()` call must come from an earlier file.

## Build
- The repo is the source. `python3 tools/join.py out.html` builds the single self-contained HTML file (three.js from cdnjs); `tools/split.py` is its inverse and only needed to import a single-file build.
- Stage picker portraits are baked: after changing a stage's scenery or `view`, run `python3 tools/stage_art.py` (writes js/54-stage-art.js). It re-renders every portrait with texture noise, so keep only the changed stage's line in the diff.
- Serve locally with `tools/serve.sh` (http://localhost:8000/), or open `index.html` from disk.

## Test
```bash
pip install -r requirements-dev.txt && playwright install chromium
python3 tools/smoke_test.py        # always: loads the game, starts a race, fails on any JS error
```
Each test starts its own HTTP server on a free port and drives headless Chromium via Playwright; most fail on any page JS error and write screenshots to the repo root (git-ignored). Every test and audit is a stage in `Jenkinsfile` (Docker image `mcr.microsoft.com/playwright/python:v1.49.0-noble`); that list is the full suite. Run the tests for the area you touched plus the smoke test. Set `CHROMIUM=/path/to/chrome` to use an existing Chromium instead of Playwright's download.
- `tools/fuel_audit.py` and `tools/band_audit.py` run headless races and take minutes; other tests can time out if run alongside them, so run them on their own.
- Locally on Python 3.14, `playwright==1.49.0` does not install (no greenlet wheel); a newer Playwright in a venv runs the same tests.
- A new test: Python + Playwright like the others, add it as a Jenkins stage, add any screenshots to `archiveArtifacts`, and list it in the README.

## Checklists
A new track needs: a STAGES entry with `order`, `tag` (Swedish) and `view`; a `FUEL_MUL` entry (`python3 tools/fuel_audit.py <id> --calibrate`); three picnic stamps; a postcard (`postcard:` on the stage or `VYKORT` in js/36-vykort.js); a baked portrait; its shortcuts in `tools/shortcut_test.py` (and a bonus, west or other no-cup track in `tools/vastgota_test.py`, which races it in full; if the AI runs wide in tight bends, set `aiLook`); a cup only if one has room (max four rounds) or a new cup.

A new signature item needs: to fire and be spent with nobody to hit, an AI use, an entry in `SIG_OPENS` (js/40-genvagar.js) saying whether it opens closed shortcuts, sideways-only knockback, and a test.

A new menu sheet needs a `PADBACK` entry (js/53-gamepad.js) for the pad's B button, one yellow `.go` action, and a check at phone sizes (`tools/menu_fit_test.py`, `tools/race_flow_test.py`).

## Working rules
- Player-facing text is Swedish; code, comments, commits and docs are English.
- No real brands, original characters only, ideas only from LEGO Racers. Exceptions and Easter eggs are listed in docs/HISTORY.md.
- One change per PR on its own branch; Teo reviews and merges. Each PR adds a dated section to docs/HISTORY.md (what Teo asked, what he picked, what was built, which test checks it) and updates the roadmap there if it closes an open item.
- When a change involves a design choice, offer Teo a few options and let him pick; record his picks and your own defaults separately in HISTORY.md.
- Teo plays on a real iPhone: check phone sizes (about 393x660 portrait, 750x340 landscape) for anything on screen.
- Teo prefers Python, bash, Jenkins and git for tooling.
