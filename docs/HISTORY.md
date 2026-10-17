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

## Deferred ideas
- The other 7 shortcuts and 12 stamps (GDD build step 7), one track at a time.
- Picnic basket (9 stamps), blanket paints per track, Gyllene Picknickpasset (15).
- Retire option in a cup race (scores 0), route-assist minimap setting, camera-shake slider, auto-accelerate.
- AI still runs dry on Tollarp sometimes (pre-existing fuel planning); the tractor can't fix an empty tank.
- Spegelcupen (mirror mode).
