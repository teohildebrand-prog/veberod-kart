# Veberöd Kart - Jakten

A silly PS1-style kart racer through the Skåne countryside. Three.js r128,
plain JavaScript, no build step.

26 tracks and eight cups of at most four rounds. Two home cups without a
champion: Skånecupen (Veberöd, Lund, Tollarp, Hörby) and Sommarcupen (Åhus,
Glimmingehus, Ales stenar, the bridge). Then championships built on LEGO
Racers' cup shape (ideas only): Österlencupen, Kustcupen and Vildmarkscupen
(four tracks and a champion each, then mirrored and in reverse once won) and
Finalen against Raket-Rune (Rosengård, then Raket-Runes runda). Out west, a
parallel tour open from the start: Västgötacupen (Lerum, Borås, Trollhättan)
against Regnmolnet, then Göteborgscupen (Avenyn, Hisingen, Ullevi) against
Hamnkranen. Finalen still needs only the three Skåne championships.

Two bonus tracks outside the cups, marked BONUSBANA in the stage picker:
Sibylla, Extra Allt Grand Prix (two laps from a Sibylla car park through the
drive-through and a giant kitchen). Its boxes hand out only Sibyllas meny,
six burger items found nowhere else (NUMMER 47!, LÄSKPÅFYLLNING, MOSKANONEN,
TUNNBRÖDSRULLEN, BURGARTORNET, KORV MED BRÖD), and it brings the SIBYLLA BURGARBUS, a burger-shaped
vehicle every driver can pick. And Bodils promenad, Bara en liten runda
(three laps of Bodil's walk: out of the door, up through the woods, round the
shrub every dog stops at, an agility event on the lawn, and home past the
sofa in the window to NU VILAR VI).

## Play

Open `index.html` in a browser, or serve the folder:

```bash
tools/serve.sh            # http://localhost:8000/
```

Controls: WASD drive, Space drift, E fire, H horn, C camera, R reset,
Esc pause, M sound, V CRT filter.

Stage select (VÄLJ BANA): arrows/WASD move the highlight, Q/E turn the page,
Enter picks, Backspace/Esc goes back, V toggles SPEGELVÄND where it is
unlocked. On a controller: D-pad/stick, LB/RB, A, B and X. On a phone: tap a
card, swipe sideways for the next page, then VÄLJ BANA.

With a controller (Xbox layout, any pad the browser reports in the standard
mapping): left stick steer, RT gas, LT brake/reverse, A drift, X item,
Y camera, Menu pause. In menus the stick or D-pad moves, A picks, B goes
back. The KONTROLLER screen shows the first time a pad is used, and from the
pause menu after that.

### On a phone

Play at https://teohildebrand-prog.github.io/veberod-kart/ (GitHub Pages,
served from `main`). Hold the phone sideways. Left thumb steers on the STYR
stick (analog: a small push is a gentle turn); gas is automatic. Right thumb
has BROMS (hold to brake, then reverse), SLADD and ANVÄND (shows your item);
a thumb can slide between BROMS and SLADD. Camera (KAM), pause and
back-on-track sit at the top. Pinch, double-tap zoom and page scrolling are
blocked during a race (menus still scroll); `tools/touch_test.py` checks it.
Picking a driver on a phone takes two steps: tap a portrait (the preview
shows the bars and the ability), NÄSTA, then flip through vehicles and paint
and press STARTA. On Android the
first tap goes fullscreen; on iPhone use Share → Add to Home Screen for a
fullscreen icon.

F1 (or § / `) opens the debug menu: track, driver, light, teleport, cheats,
items, AI, FPS/physics readouts, time scale. SANDLÅDA on the main menu is
free roam: any track, no AI, no laps or clock, a full tank.

## Layout

```
index.html            page markup (HUD, menus) + script tags in load order
css/style.css         Frutiger Aero glass UI and HUD
js/NN-<section>.js    game code, one file per section, loaded in order
vendor/three.min.js   three.js r128 (MIT, see vendor/three.LICENSE)
tools/serve.sh        local web server
tools/smoke_test.py   headless test: start a race, fail on JS errors
tools/cup_schedule_test.py  headless test: cup schedules, old saves, points once
tools/shortcut_test.py      headless test: each shortcut is driveable, quicker, and opens to every forward attack
tools/signature_test.py     headless test: box odds and all eleven signature items
tools/svin_test.py          headless test: Grisabonden Carl, his select line, rival guest and SJU LASS SVIN
tools/beans_test.py         headless test: the beans' green gas cloud, the spin it gives, the AI and clean-up
tools/weiron_test.py        headless test: Weiron i ottan, his Skiftsex, CEMENTBLANDAREN and STÄMPLA IN
tools/bodil_test.py         headless test: Bodil, her Grisörat, BRÅK OCH TRÅK OCH SKRÅK and GODISNOSEN
tools/promenad_test.py      headless test: Bodils promenad, its hazards, the TV, Bodil's nap and her passport page
tools/targetless_test.py    headless test: every item can be spent with nobody to aim at; the AI catch-up pace
tools/band_audit.py         headless audit: how close the field stays to the player, catch-up on and off
tools/feel_test.py          headless test: camera shake, the turbo's view kick, the body's knocks on landing and walls
tools/banner_test.py        headless test: the home crowd's HEJA banners for every driver with a home stage
tools/split.py        regenerate index.html/css/js from a single-file build
tools/join.py         build the single-file game from the repo (split.py's inverse)
tools/stage_art.py    bake the stage picker's portraits into js/54-stage-art.js
docs/                 design notes and build history
tools/ci/Dockerfile   the image every Jenkins stage runs in
tools/jenkins/        a local Jenkins in Docker with the job set up (start.sh)
Jenkinsfile           CI: every test and audit in tools/ (the full list)
CLAUDE.md             working rules for Claude Code
```

The `js/` files are classic scripts, not ES modules. They share one global
scope, so a `const` or `function` declared in an earlier file is visible in
every later one. Order matters: the number prefix is the load order, and
`index.html` lists them in that order. New code goes in the file for its
section, or a new numbered file added to `index.html`. Code that runs at
load time (like wiring a button) can only use functions from its own file or
earlier files; `tools/smoke_test.py` catches it when that breaks.

### Stage portraits

Each stage in `STAGES` carries its own `order` (place in the stage roster),
`tag` (one or two Swedish sentences for the preview) and `view` (the camera
for its portrait). After changing a stage's scenery or view, re-bake:

```bash
python3 tools/stage_art.py
```

A stage without a baked portrait still shows up; the picker renders one live
when the highlight rests on it.

## Test

```bash
pip install -r requirements-dev.txt && playwright install chromium
python3 tools/smoke_test.py
python3 tools/cup_schedule_test.py
python3 tools/shortcut_test.py          # shortcuts of the tracks that have been tuned; name stages to check others
python3 tools/signature_test.py
python3 tools/west_items_test.py        # the six west-coast signature items and the drivers' quirks
python3 tools/weiron_test.py            # Weiron i ottan: driver select, CEMENTBLANDAREN, his quirk and horn
python3 tools/bodil_test.py             # Bodil: driver select, the tackle and its counterplay, her quirk and horn
python3 tools/promenad_test.py          # Bodils promenad: launcher, sprinkler, TV, the victory nap, the dog page
python3 tools/vastgota_test.py          # the west and bonus tracks: layout, fuel stops, stamps, full AI races
python3 tools/svin_test.py
python3 tools/beans_test.py
python3 tools/targetless_test.py
python3 tools/feel_test.py              # camera shake, turbo view kick, body squash and roll
python3 tools/banner_test.py            # HEJA banners on each driver's home stage, none elsewhere
python3 tools/band_audit.py             # rubber band: six tracks by default, name stages to check others; --set PACE.ahead=0.25 to try a tuning
```

### Jenkins

`Jenkinsfile` runs every test and audit above, one stage each, inside
`tools/ci/Dockerfile` (Playwright's Chromium, the `playwright` package and
Node). To run it on your own machine you only need Docker:

```bash
tools/jenkins/start.sh          # http://localhost:8080/job/veberod-kart/ (user admin, password in tools/jenkins/.env)
tools/jenkins/start.sh stop     # stop; jobs and build history stay in a Docker volume
tools/jenkins/start.sh logs     # follow Jenkins' log
```

The first start takes a few minutes (the Jenkins image and its plugins). The
job builds `main` from GitHub, on Build Now and when main changes (polled
every 5 minutes). Jenkins only listens on localhost. The CI image also runs
any one test without Jenkins:

```bash
docker build -f tools/ci/Dockerfile -t veberod-ci .
docker run --rm --ipc=host -u "$(id -u):$(id -g)" -v "$PWD":/work -w /work veberod-ci python3 tools/smoke_test.py
```

On an existing Jenkins server: a Pipeline job, *Pipeline script from SCM*
on this repo, script path `Jenkinsfile`, on an agent with Docker and the
Docker Pipeline plugin.
