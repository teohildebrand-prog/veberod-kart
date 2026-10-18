# Veberöd Kart - Jakten: how it got here

Condensed from the original claude.ai chat Teo pasted on 2026-10-17. Original published artifact: claude.ai/artifact/VGeHKhrfGGX7mnbppPbBzx

## Build order
1. "Kart Rush": Three.js kart racer, Catmull-Rom track (720 samples), drift physics, 5 AI, fixed 120 Hz step.
2. PS1 look (vertex snap, affine textures, 15-bit + Bayer dither, ~320x240, CRT pass) and southern Swedish countryside.
3. Power-ups: milk (Tetra Classic, boost) and pie (speed trap).
4. Driver select: Bonden Arne and Polisen Billy Bool.
5. Wacky tracks: elevation, jumps, banked corners, barn tunnel, dalahäst.
6. Stages: Lund, Veberöd, Tollarp; later Öresundsbron (blue-hour "Rainbow Road") and Åhus-parken (theme park).
7. AI personalities: Majros (cow), Roger (hillbilly), Linnéa (scholar).
8. Renamed to "Veberöd Kart - Jakten".
9. Fuel system with STATOLJA stations, jerrycans; empty tank = limp at 17% throttle, "SOPPA-TORSK!".
10. Items: spettekaka rocket, äggkaka shield; random Skåne-flag item boxes; HUD item icons.
11. Cars: Trollhättan 96, Torslanda 240, Ängelholm CC.
12. Physics fix (banked corners read as hills), torque curve, gentler gravity.
13. New Arne/Billy models, live 3D character preview.
14. Frutiger Aero / Y2K glass UI over the PS1 game picture.
15. Design-review pass: pickup height gate, sim-time race clock, AI corner-speed model (sqrt(G*R), G=30), AI drifting, 8 ordered checkpoints, mobile brake + pause, "DIN KOMBINATION" ratings.
16. (This project) Majros the cow made playable, H horn/moo.
17. (This project, 2026-10-17) GDD v2 release 1: genvägar on Veberöd, Arne's tractor recovery, picnic stamps, Picknickpasset, Skånecupen. Details below.
18. (This project, 2026-10-17) The GDD's LEGO Racers ideas (6 adopted + sugar cubes, time trial, rival's paint) and two new tracks, Glimmingehus and Ales stenar. Details below.
19. (This project, 2026-10-17) Debug menu (F1/§/`) and SANDLÅDA free roam. Details below.

## Decisions to keep
- No real trademarks: STATOLJA instead of Statoil; cars named after towns (Saab -> Trollhättan 96, Volvo -> Torslanda 240, Koenigsegg -> Ängelholm CC).
- Don't copy existing designed characters (a trading-card police character was declined); build original designs.
- Loops on Åhus are scenery only: physics is a heightfield (one ground height per x,z), so inverted loops would need a track-relative car model.
- In-world signs stay pixel font (Press Start 2P); menus use Titillium Web glass UI.
- Tuning knobs: uSnap / uAffine in psMat; CARS burn (Ängelholm CC 1.42 may be harsh on Öresundsbron); AI_G=30.

## GDD v2 release 1 (built 2026-10-17)
GDD: https://claude.ai/code/artifact/b1d72590-d7d1-4f32-8072-428974ec1551
- Routes: main loop stays the global arrays (route 0). Each shortcut is an open spline in ALTS (STAGES[].routes: a/b fork and merge on the main loop, hw, mid bends, surface, mud spans). Kart fields rib (0 = main), si, mi (progress mapped onto the main loop).
- Gates: the 8 existing sector boundaries applied to mapped progress, so a lane must be driven through; skipping shows MISSAD KONTROLLPUNKT. Deviation: no separate directional gate objects.
- Surfaces (SURF): ASFALT, GRUS, JORD, LERA scale top speed and grip by the kart's offRoad. Pumps only work on the main road.
- Grusvägen (130-194): gravel, gate posts, hens, coop. Rapsfältet (294-404): dirt with mud in the middle, rapeseed walls, blind exit.
- Measured gain vs main road (s, entry to exit): Grusvägen Arne +0.6, Majros +0.9, Billy +0.5, Billy/Ängelholm +0.1. Rapsfältet Arne +0.9, Majros +1.4, Arne/Trollhättan +1.5, Billy -0.8, Billy/Ängelholm -2.0. Rough karts gain, asphalt karts lose on the mud.
- AI: picks routes from its own route cost plus personality (lean in ROSTER), lap 1 always main road, fuel and traffic rules, seeded noise. Stuck = no 6 m of progress in 2.5 s: reverse, then tractor at 3.5 s. A kart pinned nose-first on a wall is turned along it (fixed Linnéa never finishing Öresundsbron, a bug that was already in the original).
- Recovery: T key or the ↺ button. Arne's tractor puts you 8-10 samples back, ghosted 1.5 s.
- Stamps: Veberöd only (Spettekaka by the road past the barn, Äggakaka among the hens, Fläderblomssaft on a hay bale at Rapsfältet's exit). Player only, right road and current gate required, saved instantly to localStorage vk.save.v1.
- Picknickpasset: tab per track, hints for missing stamps, English anecdotes, postcard at 3/3, rewards list. 6 stamps unlocks the moo horn for everyone (not reachable until more tracks get stamps).
- Skånecupen: Veberöd, Lund, Tollarp, Åhus, Öresundsbron. Classes scale AI speed, caution, rubber band, shortcut appetite. Points 10-7-5-3-2-1, countback ties, player last in round 1, reverse standings after. Rival (horn icon) keeps the full rubber band, others 70%. After the player finishes, the field races on for up to 30 s (simulated instantly). Points commit exactly once (round id in applied, same write). Leaving mid-race resumes that round. Trophies per class on the menu shelf. Finishing any cup unlocks KORNBLÅ paint; gold on Bygdemästare or harder unlocks GULDKANNAN paint (paint row appears on the driver sheet).
- Single race fix: the race clock keeps running after your finish so AI behind you get real times.

## LEGO Racers ideas + two tracks (built 2026-10-17)
Ideas only from isledecomp/racers, no code or data. Teo chose: build the 6 adopted ideas plus sugar cubes, time trial and the rival's paint; keep points 10-7-5-3-2-1.
- Gate graph (GATES): main gates on the 8 sector lines with lap fractions; a lane that skips main gates gets twins of them; next[] links. Position = laps + gate fraction + distance to the next gate (clamped, so skipping gains nothing).
- Mirror (SPEGELVÄND): deviation from the GDD's "negate x at load", because scenery is hand-placed in world coordinates. The sim is untouched; scene.scale.x = -1, the camera is mirrored after updateCamera, steering input and minimap x are flipped, and meshes whose texture has text (pixTex sets hasText) flip back so signs read. Unlocked per track by beating Arne in the time trial; Spegelcupen toggle in cup setup after any finished cup, trophies keyed cls+'_m'.
- Return to path: AI stuck >1.2 s or crawling off-road >1 s steers to a point ~1 s up its route (reverses if facing away); tractor only after 3 s of that, or 5 s stuck in total.
- Line variants: each AI gets inside/middle/outside (lineVar) per race, offset by signed curvature (scurv).
- Surface table (SFX): dust colour, mud spray, tyre noise per surface (second bandpass on the noise source), cobble rattle + camera shake, a moo when a cow kart enters grass/dirt/mud. New SURF entries cobble, sand.
- Hazards (HAZARDS, period/phase off raceTime so restarts reset them; shield blocks; a hit drops sugar): Rapsfältet hay bale, Grusvägen cow, Öresundsbron gulls, Glimmingehus ghosts (spin), Ales curse (drive back through the stone ship: steering swaps 3 s).
- Sockerbitar: 2 per lane, one past each jump landing, two on the inside verge of the tightest corners. Up to 3; using an item spends them: milk longer up to a 3.4 s churn turbo, pie 3 pies then pie rain on the two leaders, rocket faster then 2 then 3, shield longer. HUD row under the item slot.
- Tidslopp: menu button. AI parked (k.parked), no items, stamps, fuel use. Arne's ghost = Arne in the plain kart, AI, no rubber band, flying lap 2, recorded at 10 Hz when the trial starts (~0.6 s) and cached for the visit. Player's best flying lap saved as SAVE.ghosts[id]. 4 laps (3 flying). Glimmingehus Arne lap 34.4 s.
- Cup win: rival's paint (PAINTS r1-r5) + rival's pennant on a whip aerial (VIMPEL toggle). Picnic basket on the kart at 9 stamps.
- Glimmingehus (glimminge): night, cobbles, stone walls, castle with crow-stepped gables on a moated island (castleMod flattens the terrain), gatehouse arch at sample 598, torches, orchards, moon on the sky dome. No shortcut. Stamps Svartsoppa (intro), Ålagille (apex of the tightest corner, kind 'line'), Äppelkaka (in the air over jump 0, kind 'air').
- Ales stenar (ales): sand road/verge, dunes palette, cliff + sea to the north and east (stage.shore), stone ship of standing stones, Kåseberga smokehouses, lighthouse. Two hidden shortcuts (Skeppssättningen 248-350, Stenraden 414-536) behind boulders: a rocket homes onto a closed boulder and opens the passage until its shooter's next lap; karts bounce off closed boulders; only the cup rival AI uses an open one. Stamps Böckling, Fiskesoppa (inside the ship), Sandkaka (in the air over jump 1).
- AI fuel fix: AI now plans fuel (wantsFuel: would it reach the pump after the next one), aims at the forecourt with a short look-ahead and brakes for it. This fixed the old Tollarp DNFs and dry karts on Glimmingehus and Åhus; the tractor also tips in 14 fuel. Side effect: AI about 5-10 s slower per race on Veberöd because they stop properly.
- Not in the cup: CUP_ROUNDS stays the 5 GDD rounds.

## New drivers + driver select screen (built 2026-10-17)
Design sheet: /mnt/project-files/design/new-characters.md, concept art: /mnt/project-files/design/concept-character-select.png.
- Nine playable drivers. New: Björn (Lund), Mehmet (Rosengård), Anders (Veberöd, Arne's son, green farm cap). Roger, Linnéa and Britta are playable too, because the concept's 3x3 grid shows them. CHARS order is the save format (cup.char is an index), so new ones are appended; GRID is the screen order. Picking a driver who is also an AI makes that AI a twin (TWIN: STJÄRNA, RONNY, LOVISA, BIRGITTA).
- Own vehicles locked to their driver (CARS[].sig): Landskrona 61 (Björn, burns 20% less; a convertible with the bike on a boot carrier, because a roof hid him), Rosengård Raket (Mehmet, 2 wheels, boost x1.15, spins 40% longer), Veberöd Lantmästare (Anders, spins half as long). FREECARS = the 4 cars anyone else can pick; the last free car is remembered.
- Quirks: Björn's akademisk kvart (no throttle until 0.8 s after the start, then press before 2.2 s: 1.7 s boost; "NU!" cue). Mehmet's suget (3-15 m behind a kart for 1.1 s: 1.2 s boost, then 1.5 s cooldown) and a wheelie on every boost. Anders' skopan (blockHit: after the äggkaka, the bucket eats the first hit each lap) and mass 2.2 in separate(). Britta's äggkaka lasts twice as long (shieldMul). Linnéa burns 12% less fuel.
- Britta's AI model is now the granny (kind 'granny'). Start and hit lines for the new three show as toasts (CHARS[].say).
- Select screen: console-style layout from the concept, portraits rendered once at load by the game renderer, the driver on a stone turntable in the stage, panel with FART/GREPP/ÅKER (driver stats x car), quirk, ◀ ▶ (or Q/E, 1-4) for the car, TILLBAKA back to stages or cup setup. Arrows/WASD move in the grid.
- Easter egg (2026-10-17): Roger is now Teo and Linnéa is Amanda, the people who made the game. Blocky looks drawn from Teo's photos (no photos in the game): Teo in a black beanie with an original crest, ginger stubble and a navy puffer; Amanda in a cream knit beanie, blonde bob and black puffer. Same karts, stats and AI tuning; twins TEODOR and MANDY; paints TEOS RÖD and AMANDAS SVART. The old hillbilly and scholar models are gone.
- Not built from the sheet: item flavours (thesis rocket, muck pie, straw shield), Anders recovering himself, a Rosengård track (Mehmet's home is Öresundsbron for now).

## Debug menu + sandlåda (built 2026-10-17)
- Debug menu: F1, § or `, or DEBUG in the pause sheet. Glass panel over the running game (does not pause). Track, driver, car (own vehicles stay with their driver; locked during a cup), light presets BANANS/DAG/KVÄLL/NATT/DIMMA (no real weather exists, so presets borrow Veberöd/Bron/Glimminge sky, fog and light), teleport to the 8 checkpoints (gate counts as passed so laps still add up), GUDALÄGE (blockHit returns true for the player), infinite fuel, infinite items (refills the last item), give any item / 3 sugar cubes / turbo, SISTA VARVET, AI SOM VANLIGT/KÖR/FRYST/BORTA, FPS and physics readouts, time scale 0.25-3x (scales dt before the fixed step). State lives in DBG, nothing saved; light and AI mode survive restarts via dbgOnReset() in resetRace.
- SANDLÅDA: main-menu button, flag FREE (like TT). AI parked, LAPS=1e9 (HUD shows /∞), full tank, 0.6 s countdown, clock and position boards hidden (body.free), lap time toast on each line crossing. Stamps still collectable under their normal rules.

## Deferred ideas
- The other 7 shortcuts and stamps on the original five tracks (GDD build step 7), one track at a time.
- Blanket paints per track, Gyllene Picknickpasset (21 stamps now).
- Retire option in a cup race (scores 0), route-assist minimap setting, camera-shake slider, auto-accelerate.
- Championship tuning from playtest: champion speeds, unlock order, whether the mirror tier should also reverse the driving direction.
- Repo split regenerated 2026-10-17 with the debug menu PR (includes the LEGO Racers round and the new drivers).

## Phone play (2026-10-17)
- The touch pads already existed (body.touch from isTouch). Added: TUT horn pad, KAM camera button (touch only), pads hidden outside a race, a compact layout for short landscape screens (max-height 540px: smaller pads clear of safe areas, speedo between the pads, driver select fits on one screen), scrollable sheets, a "VRID TELEFONEN" overlay in portrait during a race, fullscreen + landscape lock on the first tap (coarse pointers; Android), home-screen web-app meta tags for iPhone.
- Hosting: GitHub Pages from main / root (.nojekyll in the repo). URL https://teohildebrand-prog.github.io/veberod-kart/

## All the LEGO Racers counterparts, the championships and Rosengård (built 2026-10-17)
Teo: "add more of the suggested tracks and the championships", then "also add a Rosengård track". Built all 11 remaining tracks from the GDD table plus Rosengård, so 19 tracks in all. Ideas only from LEGO Racers, no code or data.
- Track hooks (so a track is one self-contained section): stage.scenery(), stage.group (stage-picker tab), stage.role (cup brief line), stage.mod(x,z,t) terrain offset, stage.land(x,z,colour), stage.moon, stage.sfxRoad/sfxOff, stage.paint:false; registries ROADTEX, VERGEC, EDGES (plus GROUND, SURF, SFX). Shortcut blockers can bring their own blockMesh/blockAnim, and noRocket makes a passage switch-only.
- Österlen: Kungagraven i Kivik (cairn passage GRAVKAMMAREN, apples rolling from the market), Söderåsen (gorge, TUNNELN before the ford, wild boar). With Glimmingehus and Ales stenar.
- Kusten: Foteviken (through an upturned longship, catapult barrels on marked spots), Karlskrona (ropewalk straight, hidden quay passage behind herring barrels, fortress cannonballs), Ven (cliff cave GROTTAN and TYCHOS GLIPA, rolling boulders), Limhamn (night quarry, SPRICKAN opens the lap after you hit SPAKEN, steam vents).
- Vildmarken: Ängelholm (UFO forest, hidden bunker behind a triangle door, saucer beam), Höör (wildlife park, BJÖRNFALLET through the waterfall, elk standing in the road), Romeleåsen (snow day, ISEN across the frozen lake on new SURF.ice, snow squalls, a plough), Kalmar slott (drawbridge that rises into a launch ramp, VALVET through the bastion, jousting knights).
- Finalen: Raket-Runes runda in Malmö harbour (climb past the twisting tower, hidden SKULPTURPARKEN behind a split ring, container crane).
- Rosengård (Mehmet's home, group Skåne, not in a cup): blocks, Rosengård Centrum, railway bridge, Möllan; FOTBOLLSBUREN through the football cage on new SURF.turf; a football and a delivery moped. Stamps ma'amoul, gözleme, baklava.
- 36 new picnic stamps (45 in all); the golden pass counts whatever exists.
- Championships (CUPS): Skånecupen unchanged; Österlencupen (open), Kustcupen (podium in Österlen), Vildmarkscupen (podium in Kust), each 4 rounds with a champion; once won, the same cup SPEGELVÄND OCH BAKLÄNGES (mirrored, rounds reversed, champion 2 % faster); Finalen (one race vs Raket-Rune) after winning all three. Points stay 10-7-5-3-2-1. Trophies keyed cupId_class(_m); Skånecupen keeps its old keys.
- Champions take the rival's grid slot for their cup with their own model and numbers: Spöket på Glimmingehus, Vikingahövdingen, Gröna gubben från skogen, Raket-Rune. Beating one unlocks their paint and one kart part (SPÖKLYKTAN, VIKINGAHORNEN, UFO-ANTENNEN, RAKETFENORNA; DEL: toggle on the driver screen).
- UI: cup picker cards in cup setup, stage picker tabs per championship, menu shelf shows each championship's best medal, debug menu LÅS UPP ALLA CUPER.
- Deviation: the GDD's Kalmar shortcut goes "under the drawbridge"; the road can't pass under itself, so VALVET runs through the bastion beside it.

## Stage select like the driver screen (built 2026-10-17)
Teo's spec: a roster of illustrated stage cards with a large preview of the highlighted track, on the driver screen's visual base.
- New sections: js/55-stage-select.js (the screen) and js/54-stage-art.js (generated portraits); the old card/tab picker in race flow is gone. Loop is now js/56-loop.js.
- Roster from STAGES: each stage has order (1-19 in the spec's fixed order), tag (Swedish line) and view (portrait camera: main-road sample {i,lat,h}, lane {r,f}, or spot {x,z}; t poses hazards, so the ghost, elk and saucer are in shot). Stages without order append after, so a new track enters the roster with no layout change. Optional modes list per stage; a card not available in the current mode is dimmed with the reason.
- Portraits are real renders of each stage's scenery, baked by tools/stage_art.py to WebP data URLs (320x180, about 230 KB). Missing ones render live after the highlight rests 450 ms; a newer highlight cancels the request, so a stale render never lands. Moving the highlight never builds a world; only confirming does.
- Layout 55/45: 4x2 cards per page (19 = 3 pages, last page shows only its 3 cards), page indicator, preview still with a slow pan, name, subtitle, tag, VARV, UNDERLAG (main road name + known lanes), GENVÄGAR, PICKNICKPASS (omitted where a stage has no stamps), REKORD by mode and normal/mirrored, BANPROFIL outline. Phones: compact preview above a 2-column roster, sticky footer.
- Records: new SAVE.best[stageId(_m)] = {t, lap} from finished single races. Secret passages: new SAVE.routes['stage.route'] once the player drives one; until then the outline and counts leave it out.
- Modes: Enkellopp and Sandlåda pick any stage (Sandlåda drops laps and records), Tidslopp shows the time-trial record and mirror eligibility, and a cup's schedule opens from BANORNA on the brief: cards marked AVKLARAD / NÄSTA / KOMMANDE, any round can be previewed, STARTA NÄSTA LOPP always starts the next round.
- Input: arrows/WASD, Q/E pages, Enter, Backspace/Esc back, V mirror (only on this screen, the CRT key elsewhere). Pad: D-pad/stick with hold-repeat, LB/RB, A, B, X; PADBACK has a stages entry. Touch: tap a card, swipe for pages, VÄLJ BANA. Sounds: tick per card, deeper blip per page, rising confirm.
- The world is not drawn while the stage picker covers it.
- tools/join.py builds the single-file working copy from the repo (split.py's inverse).


## Easier sugar cubes (built 2026-10-18)
- Teo found the sockerbitar too scattered and hard to get. The main road now has up to five rows of three cubes per lap, on the centre line with a small pull to the inside of a bend, set between the item-box rows and clear of jumps, forks and the start. They replace the old risky spots (after jump landings, out on the inside verge of the two tightest corners). The two cubes in every lane stay.
- Sugar pickup radius grew from 2.5 to 3.4 units, so driving through a row collects it.

## Power-up rework (built 2026-10-18)
Teo's proposal "Power-Ups and Sugar Cubes": five item families, each with three levels from ordinary food to food warfare. The item box gives the family; sugar picks the level.
- Sugar: up to 2 cubes. 0 → level 1, 1 → level 2, 2 → level 3. Picking up a cube while holding an item transforms its icon and name in the HUD (MJÖLK → GRÄDDFIL → SKÅNSK GRÄDDE); the slot gets a gold rim at level 2 and a pulsing pink one at level 3, with the name on a plate beside it. Using the item spends the cubes; an unprotected weapon or hazard hit knocks one loose (it used to take all); plain kart contact takes none.
- Overtaking: Mjölk 1.2 s boost, Gräddfil 2.4 s and the verge barely slows you, Skånsk grädde 3 s with +14 % top speed, harder pull, cream trail, a rattling kart, engine scream; camera kick capped (FOV +10, shake ≤ 0.3).
- Forward attack: Spettekaka is one homing cake. Spettigare kaka is a skewer on a rope: it needs a kart within reach up the main road (about 1 s of flight); on a bite the rope reels the thrower in for up to 2.4 s and lets go about 6 m short with a small kick, so the pass is still yours to steer. The target keeps control. A shield blocks it; a lane, a corner the rope would cut across, or a closed passage breaks it. Semmelväggen stacks two rows of semlor in front of the kart for 0.55 s, then a wave about the road's width surges about 115 m up the road; each rival is hit once (spin + short slow), a closed passage stops it.
- Protection: Äggakaka 9 s, blocks one hit. Stekhet äggakaka (orange, steaming dome) also blocks one hit, and ramming a rival at speed shoves them and spends it. Den flygande stekpannan: three pans orbit for up to 10 s; each blocks one hit or bashes one rival within reach, then is gone; the same rival can't be bashed again within 1.5 s; pan against pan clashes once. The HUD shows the pans left.
- Rear defence: Äppelpaj (golden apple pie, slide + slow). Kafferep drops the pie and a coffee puddle just behind it (short spin); a 1.2 s guard after any trap stops pie and coffee both landing. Tårtmina: pink layered cake, arms in 0.9 s, then its candle blinks; a rival within about 3.6 units (less on narrow roads, always a gap) sets it off, and everyone within about 6.5 is knocked sideways and slowed. It lasts 22 s and never triggers for its owner.
- Close-range disruption: Skånska bönor push a tailgater within 13 units straight behind and cut their slipstream. Skånsk ärtsoppa hits behind and beside within 15 and takes their grip for 1.3 s. Bruna bönor med fläsk wait 0.4 s, then BRÖÖÖÖP!: everyone within 20 is shoved outward and slowed. Quick green clouds that disperse; a flapping saw fart sound; karts rattle.
- AI: hook only with someone within reach, pans when someone is close, beans when someone is on their bumper (level 1) or close (2–3).
- Debug menu FÖREMÅL lists all 15 items by level; OÄNDLIGA FÖREMÅL refills the same level.
- Code: js/37-power-ups.js (was spettekaka-raketer) holds the families; trap items (coffee, mine) live in js/35-pickups.js.

## Player name (2026-10-18)
- First launch asks VAD HETER DU? (up to 12 letters/digits, stored as SAVE.name; an empty name falls back to the driver's name). NAMN on the start menu changes it.
- Typed on a keyboard, or with the on-screen letter keys by touch or pad (A types, B rubs out, KLAR saves).
- The name replaces the driver name for the player's kart in results, cup table, podium and briefing. An AI with the same name races under its twin name (TEO becomes TEODOR) or gets " II".
- Code: js/57-player-name.js; nameKarts() in js/33-skanecupen.js.

## Signature vehicles (2026-10-18)
Teo's vehicle concepts: every driver gets a vehicle you can recognise from its silhouette. One dominant shape, one main colour and one animated prop each; all of it is looks only (karts collide as points, so bicycles, sails and fins never touch scenery).
- Playable: Arne ÖSTERLEN ÅKERLOPPA (farm buggy, vegetable crate, crooked lamp, spade; the wind vane spins furiously in a boost and the chassis bounces off-road), Billy LANDSVÄGSPATRULLEN (shortened white-and-blue estate, oversized blue lights, bumper on the tarmac; the ticket printer spits paper in a boost and the rear display flashes STANNA! when he uses an item), Majros VEBERÖD MJÖLKEXPRESS (cow-patch cab, polished tank that rocks in corners with a wobbling gauge, hoof hubcaps; the churn exhausts foam in a boost), Teo FLYINGE FULLGAS (low cobalt wedge, primer-grey door, bolts, cables, exposed engine, huge rear wing that shudders at full speed; DET FUNKADE NYSS on the dash after a hit), Amanda LERUM LINJE (burgundy estate, cream roof, roof box, strapped picnic, thermos; restrained body roll and a wiper that clears the splat after a hit), Britta ÅHUS HEMBAKAT (butter-yellow bakery van, BRITTAS sign, scalloped awnings, trays and cooling rack; the oven glows while her shield is up and the hatch pops open on the äggakaka).
- Kept and exaggerated: Björn's LANDSKRONA 61 (paper stacks, a parking permit over the screen; the roof bicycle's wheels spin and thesis pages blow off in a boost), Mehmet's ROSENGÅRD RAKET (mismatched panel, football stickers, oversized exhaust, scarf in the wind; the 45 plate flips up in a boost wheelie and shows TYP), Anders' VEBERÖD LANTMÄSTARE (GPS, work lights, a screen of perfectly straight lines; when Skopan blocks a hit the bucket carries the squashed cake, then tips it away).
- AI and champions: Nisse NISSES TRÄNGSELTRALLA (turquoise scrapyard kart, rubber bumpers, mismatched wheels, bicycle bell; padded sides squash when someone is close), Spöket GLIMMINGEHUS NATTVAGN (black carriage, iron wheels, pale glow, fluttering curtains, Spöklyktan swinging on the front bracket), Hövdingen KUSTENS LÅNGSKEPP (longship on wheels, dragon prow, shield hubcaps, striped sail; the oars paddle frantically in a boost, horns frame the wheel), Gröna gubben ÄNGELHOLM TALLRIK 46 (battered saucer on four wheeled legs that rattle at speed; the antenna bends in corners and flashes in a boost), Raket-Rune MALMÖ ÖVERLJUD (rocket dragster, huge turbine, enormous fins; warning lamps flash while a boost charges, then the plume).
- Every driver is now locked to their own vehicle (as Björn, Mehmet and Anders already were), with neutral numbers so handling is exactly the driver's own, as in the plain kart. The four free cars stay in CARS (save format) but no driver uses them now. AI handling never depended on the car, so the AI is unchanged.
- Main colours changed to match: Arne faded red, Teo cobalt, Amanda burgundy, Britta butter yellow; the rival paints follow (TEOS KOBOLT, AMANDAS VINRÖD, BRITTAS SMÖRGUL).
- Twins race the same vehicle in their own paint: STJÄRNA strawberry-pink Mjölkexpress, TEODOR with the unfinished panels on the other side, MANDY forest green, BIRGITTA lilac.
- Code: js/30-vehicles.js holds the new builders (VEHICLES); buildKart gained an anim list run by drawKart, per-wheel radii and hub decoration; dressTwins() in js/33-skanecupen.js.

## Every vehicle for every driver (2026-10-18)
- Teo: all vehicles are open to all drivers. Picking a driver selects their own vehicle (EGET FORDON on the panel); ◀ ▶, Q/E, keys 1–9 and the debug menu then reach any of the 20, the four original cars, the signature vehicles, Nisse's and the champions'. Re-picking the same driver keeps the chosen vehicle.
- Handling is still the driver's numbers times the vehicle's: the original four and Björn's, Mehmet's and Anders' vehicles keep their multipliers (now for whoever drives them); the rest are neutral. Driver abilities (Skopan, akademisk kvart, Mehmet's wheelie and so on) stay with the driver.

## Victor (2026-10-18)
Teo's spec: Victor from Veberöd, Teo's friend and rival. "Teo built the game; Victor knows how it should be played."
- Driver: white polo with burgundy tipping, dark trousers, trimmed beard, short dark hair swept up, a challenging smirk, black racing gloves and a bright yellow watch. Stats 0.88 / 0.72 / 0.45 (maxSpeed 42.6, gripOn 9.2, offRoad 0.54). Not in the AI roster.
- Select screen: his arms and legs sit on joints (buildVictor), so on the turntable he stands beside the kart with his hands on his hips, climbs in, adjusts his gloves and taps the wheel twice. The steering wheel now hangs on its own group, so it stays in the kart when a driver gets out.
- VEBERÖD ORIGINAL (CARS id 'original', appended so cup saves keep their indices): low wide racing kart, white with burgundy and black, 13 on nose and pods, VEBERÖD ORIGINAL across the nose, exposed engine with an oversized exhaust that spits a short flame when a boost starts, a battered taped spoiler that vibrates in a boost, a yellow rim on the wheel (SPEC.trim) and a DET VAR BÄTTRE FÖRR sticker on the rear bumper.
- ORIGINALKÄNSLA: a fully charged (amber) drift with no kart contact or wall knock during it gives a 1.95 s boost instead of 1.5 s, with a pixel PERFEKT! over the kart. Drift boosts only; milk and cream are untouched.
- Lines (toasts): start, a home line on Veberöd (CHARS[].home), passing Teo, a hit from Teo's rocket or semla wall, a perfect drift, driving into mud, win and lose (also on the result screen), and a rare idle line after 8 s standing still. Helpers: bark(), hitLine(), raceLines() in js/36-picknickstamplar.js.
- Veberöd: a KÖR VICTOR! cloth banner by the start straight with TEO OCKSÅ added underneath in blue marker.
- The driver grid goes four across once there are more than nine drivers (GRID_COLS).

## Hörby, sju lass svin (2026-10-18)
Teo's spec: market day in Hörby and seven trailers of escaped pigs at the agricultural fair; add it to any cup. Claude put it in Skånecupen as round 4, between Tollarp and Åhus (now six rounds).
- Lap (js/27-horby.js, about 1.45 km, ~48 s for the AI): HÖRBY LANTBRUKSRALLY cloth banner over the start, two tight corners round the market block (a U-turn), out through the brick arch (HÖRBY 1450), a wide gravel sweep up to the fair, a loop between the seven numbered trailers (tractors in front, pigs packed inside), the big loading-ramp jump over the pig pen with one enormous pig that looks up and does not move, then downhill past the FODER silo and the STATOLJA forecourt and a broad corner back into town. Two pumps (0.24 and 0.85) because the lap is long.
- Engine: stages can set zones:[[from,to,surface]] on the main road (MAINS per sample). Physics, AI braking, route costs, the road mesh and the stage picker's UNDERLAG all read it. Hörby: cobbles in town, SURF.horbyGrus (gentler than the lanes' GRUS) to and through the fair, SURF.horbyGyttja mud patches after the ramps and under the pig pen. jumpSpec entries with at:N are placed by hand instead of on the straightest bits.
- Shortcuts: BAKOM KORVKIOSKEN (inside the U, past the sausage kiosk, crates stacked tight at the entrance) and SVINSTIGEN (deep mud along the pig enclosure, INGEN GENOMFART sign with tyre tracks under it). Own checkpoint chains and AI routing as usual.
- Hazard: at trailers #3 and #5 the gate rattles and folds down, a farmer waves a red flag and the pigs grunt, then three groups of three pigs trot across with gaps between them. A hit: short slowdown, straw shower, NÖFF!, and the pig bounces aside and turns away, offended. One pig carries a stolen chequered flag. The other five trailers are scenery only.
- Sound and text: oink() (buzzing saw through a lowpass); seven rising honks when you take the big jump; the loudspeaker (HÖGTALAREN panel at the top of the screen) once a lap, more desperate each time.
- Stamps: Äggamacka (picnic tables outside the hairpin), Äppelmust (Svinstigen just past the mud), Kanelbulle (over the big jump).


## 2026-10-18 — Softer audio mix

Teo: "Need to improve the sound", with a patch proposing a softer mix.
- The bright saw/square engine is now a low-harmonic motor with smoothed virtual gear changes, so the pitch no longer climbs into a whine.
- Engine/tyres and effects run on separate gain buses into a master gain and a compressor. Short effects are capped at 8 voices, get rounded attacks, and their pitch is kept to 45–1100 Hz.
- Engine and tyre loops fade out in menus, pause and hidden tabs. Muting keeps the AudioContext so quick M presses don't stack engines; mute and volumes are saved (localStorage `vk.audio.v1`).
- PAUSAD has a LJUD box: total volym, motor och däck, ljudeffekter (− / + in 10 % steps, gamepad navigable) and LJUD PÅ/AV.
- Ven, Limhamn and Hörby (oink) effects go through the effects bus via audioOutput(); the test fails if any file connects straight to actx.destination.
- Checks: `node tools/audio_test.cjs` (simulated AudioContext); headless Chromium measurement of the real output vs main: driving RMS 0.035–0.051 → ~0.022, spectral centroid 160–260 Hz → ~75 Hz, a burst of 12 pings peaks at 0.06 instead of 0.82, silent in menus and pause.
