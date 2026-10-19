"use strict";
/* ───────── karts ───────── */
const CARS=[
  {id:'kart', name:'GOKART', sub:'STANDARD',
   blurb:'The plain kart. No bodywork, nothing clever — a neutral baseline to judge the others against.',
   role:'BALANSERAD · REFERENSKART',
   mul:{maxSpeed:1,power:1,gripOn:1,offRoad:1,boostMul:1,burn:1,spinResist:1}},
  {id:'t96', name:'TROLLHÄTTAN 96', sub:'TVÅTAKTARE, 1967',
   blurb:'The little rally fastback with the spotlamps. Slowest flat out, but it pulls hard out of corners and hardly notices leaving the road.',
   role:'STARK UR KURVOR OCH I GRUSET · SEG RAKT FRAM',
   mul:{maxSpeed:0.97,power:1.06,gripOn:1.05,offRoad:1.2,boostMul:1,burn:0.92,spinResist:1}},
  {id:'t240',name:'TORSLANDA 240', sub:'TEGELSTENEN',
   blurb:'The brick. Heavy and slow to wind up, but the most planted thing on the card and it shrugs off a spettekaka quicker than anything else.',
   role:'STABIL · KORTA SPINN · SEG OCH TÖRSTIG',
   mul:{maxSpeed:0.95,power:0.94,gripOn:1.12,offRoad:1.04,boostMul:1,burn:1.1,spinResist:0.7}},
  {id:'acc', name:'ÄNGELHOLM CC', sub:'HYPERBIL',
   blurb:'Absurd power, a wing you could land a plane on and a fuel gauge that falls while you watch. Fastest thing on clean tarmac, and the least forgiving off it.',
   role:'SNABBAST PÅ ASFALT · SVAG I LERA · TÖRSTIG',
   mul:{maxSpeed:1.08,power:1.06,gripOn:0.9,offRoad:0.78,boostMul:1.03,burn:1.32,spinResist:1.12}},
  /* signature vehicles: each driver's own, picked first for them, but anyone may take one */
  {id:'l61', name:'LANDSKRONA 61', sub:'VETERANBIL', sig:'bjorn',
   blurb:'Mint green, whitewall tyres and a bicycle on the roof rack. Slow to wind up, lovely in a corner, sips fuel.',
   role:'SNÅL OCH FIN I KURVOR · SEG START',
   mul:{maxSpeed:0.98,power:0.94,gripOn:1.08,offRoad:0.94,boostMul:1,burn:0.82,spinResist:1}},
  {id:'raket',name:'ROSENGÅRD RAKET', sub:'MOPED · 45 KNYCK', sig:'mehmet',
   blurb:'A sticker-covered moped with LED underglow. Legally limited, which is the whole joke.',
   role:'SNABB START OCH BOOST · LÅNGA SPINN',
   mul:{maxSpeed:0.97,power:1.1,gripOn:0.98,offRoad:1.02,boostMul:1.04,burn:0.8,spinResist:1.25}},
  {id:'lant', name:'VEBERÖD LANTMÄSTARE', sub:'TRAKTOR', sig:'anders',
   blurb:'Orange-red, huge rear wheels, a front loader and a bale on the back.',
   role:'LERA OCH BACKAR · KORTA SPINN · LÅNGSAM',
   mul:{maxSpeed:0.94,power:1.06,gripOn:1.02,offRoad:1.24,boostMul:0.98,burn:1.16,spinResist:0.65}},
  /* the rest of the roster's own vehicles (js/30-vehicles.js) */
  {id:'aker', name:'ÖSTERLEN ÅKERLOPPA', sub:'HEMBYGGD GÅRDSBUGGY', sig:'arne',
   blurb:'Built from old farm machinery: a crate of vegetables, one crooked headlamp and a spade along the side. Anders bought horsepower; Arne built something that knows the field.',
   role:'LÄTT I ÅKERN · SNÅL · BLYGSAM PÅ VÄG',
   mul:{maxSpeed:0.98,power:1.04,gripOn:0.99,offRoad:1.16,boostMul:1,burn:0.94,spinResist:1.06}},
  {id:'patrull',name:'LANDSVÄGSPATRULLEN', sub:'KORTAD PIKET', sig:'billy',
   blurb:'A pursuit estate with the back half missing, enormous blue lights and a bumper an inch off the tarmac. It hates fields, and it looks like it.',
   role:'SNABB PÅ ASFALT · SVAG PÅ VÄGRENEN',
   mul:{maxSpeed:1.04,power:1.02,gripOn:1.03,offRoad:0.82,boostMul:1.01,burn:1.12,spinResist:1}},
  {id:'mjolk', name:'VEBERÖD MJÖLKEXPRESS', sub:'MJÖLKBIL', sig:'cow',
   blurb:'A cow-sized cab, a polished milk tank that rocks through every corner and two churns for exhausts that foam when the milk goes in.',
   role:'STADIG ÖVERALLT · SEG START',
   mul:{maxSpeed:0.96,power:0.96,gripOn:1.1,offRoad:1.12,boostMul:1.01,burn:1.08,spinResist:0.85}},
  {id:'flyinge',name:'FLYINGE FULLGAS', sub:'PROTOTYP, OFÄRDIG', sig:'teo',
   blurb:'A prototype someone kept making faster instead of finishing. Primer-grey door, bolts everywhere and a rear wing that shudders at full speed.',
   role:'HÖG TOPPFART · LÖST GREPP · TÖRSTIG',
   mul:{maxSpeed:1.05,power:0.98,gripOn:0.92,offRoad:0.88,boostMul:1.02,burn:1.18,spinResist:1.1}},
  {id:'lerum', name:'LERUM LINJE', sub:'TOURINGKOMBI', sig:'amanda',
   blurb:'A compact touring estate prepared with almost suspicious competence: roof box, strapped picnic, thermos in its holder and a wiper for everything Teo throws.',
   role:'FÖRLÅTANDE · SNÅL · INGEN EXTRA FART',
   mul:{maxSpeed:1,power:1,gripOn:1.06,offRoad:1,boostMul:1,burn:0.92,spinResist:0.95}},
  {id:'hembak',name:'ÅHUS HEMBAKAT', sub:'BAGERIBIL', sig:'britta',
   blurb:'A butter-yellow bakery van with a bread oven in the back. Surprisingly quick: Britta has deliveries to make.',
   role:'SNABB IGÅNG · KORTA SPINN',
   mul:{maxSpeed:0.99,power:1.06,gripOn:1.02,offRoad:0.96,boostMul:0.99,burn:1.04,spinResist:0.85}},
  /* the AI's own vehicles; anyone may take them too */
  {id:'tralla', name:'NISSES TRÄNGSELTRALLA', sub:'SKROTKART', npc:true,blurb:'',role:'SNABB IGÅNG · TÅL SPINN · BLYGSAM',
   mul:{maxSpeed:0.98,power:1.06,gripOn:0.98,offRoad:1.02,boostMul:0.99,burn:1,spinResist:0.75}},
  {id:'nattvagn',name:'GLIMMINGEHUS NATTVAGN', sub:'SPÖKVAGN', sig:'spoket', npc:true,blurb:'',role:'EXAKT I KURVOR · SEG IGÅNG · LÅNGA SPINN',
   mul:{maxSpeed:0.99,power:0.95,gripOn:1.11,offRoad:0.94,boostMul:1,burn:0.96,spinResist:1.1}},
  {id:'langskepp',name:'KUSTENS LÅNGSKEPP', sub:'LÅNGSKEPP PÅ HJUL', sig:'viking', npc:true,blurb:'',role:'FART I TERRÄNG · STARK BOOST · TÖRSTIG',
   mul:{maxSpeed:0.98,power:1.04,gripOn:0.98,offRoad:1.1,boostMul:1.02,burn:1.16,spinResist:0.8}},
  {id:'tallrik', name:'ÄNGELHOLM TALLRIK 46', sub:'FLYGANDE TEFAT', sig:'gubbe', npc:true,blurb:'',role:'TERRÄNG · LÅNGSAM PÅ VÄG · TÖRSTIG',
   mul:{maxSpeed:0.96,power:1.03,gripOn:0.96,offRoad:1.22,boostMul:1,burn:1.12,spinResist:1.1}},
  {id:'overljud',name:'MALMÖ ÖVERLJUD', sub:'RAKETDRAGSTER', sig:'rune', npc:true,blurb:'',role:'STARKAST BOOST · SVAG I LERA · TÖRSTIGAST',
   mul:{maxSpeed:1.04,power:1.08,gripOn:0.88,offRoad:0.8,boostMul:1.05,burn:1.35,spinResist:1.15}},
  /* later arrivals go on the end: a cup save keeps the vehicle as an index */
  {id:'original',name:'VEBERÖD ORIGINAL', sub:'NUMMER 13', sig:'victor',
   blurb:'Proper racing equipment until Victor added a few improvements. Carefully tuned, well used and far too serious for a race with a cow in it.',
   role:'TEKNISK PÅ ASFALT · SVAG I LERA',
   mul:{maxSpeed:1.01,power:1.04,gripOn:1.04,offRoad:0.86,boostMul:1,burn:0.98,spinResist:1.08}}
];
const FREECARS=CARS.map((c,i)=>i);                  /* every vehicle is open to every driver */
const OFFROAD_CAP=.95;
/** a driver (CHARS or an AI profile) in a vehicle: the numbers physics races with.
    Every place that sets up a kart or draws its bars goes through here */
function effStats(d,ri){
  const M=(CARS[ri]||CARS[0]).mul;
  return {maxSpeed:d.maxSpeed*M.maxSpeed,power:d.power*M.power,gripOn:d.gripOn*M.gripOn,
    offRoad:Math.min(OFFROAD_CAP,d.offRoad*M.offRoad),boostMul:d.boostMul*M.boostMul,
    burn:(d.burn||1)*M.burn,spinResist:(d.spinResist||1)*M.spinResist};
}
const carIndex=id=>Math.max(0,CARS.findIndex(r=>r.id===id));

/** chassis; returns the wheel layout so each car sits on its own footprint */
function buildBody(car,add,paint,dark,steel,A){
  if(VEHICLES[car])return VEHICLES[car](add,paint,dark,steel,A);
  const glass=psMat({color:0x2b3a4a}), chrome=psMat({color:0xc6ced6});
  if(car==='t96'){                                     /* rally fastback */
    add(new THREE.BoxGeometry(2.25,.92,4.5),paint,0,.92,0);
    add(new THREE.BoxGeometry(2.05,.5,1.5),paint,0,1.42,1.5);
    add(new THREE.BoxGeometry(1.95,.75,1.5),paint,0,1.5,-1.55);
    add(new THREE.BoxGeometry(1.8,.5,.35),paint,0,1.72,-2.2);
    add(new THREE.BoxGeometry(2.0,.36,.45),glass,0,1.62,.75);
    add(new THREE.BoxGeometry(2.3,.22,.4),chrome,0,.72,2.24);
    add(new THREE.BoxGeometry(2.3,.22,.4),chrome,0,.72,-2.24);
    add(new THREE.BoxGeometry(1.2,.3,.16),dark,0,1.1,2.28);
    for(const g of [-.72,.72]){
      add(new THREE.BoxGeometry(.42,.3,.16),psMat({color:0xf2efe0}),g,1.18,2.3);
      add(new THREE.CylinderGeometry(.24,.24,.22,8),psMat({color:0xf6f2d8}),g*.62,1.5,2.34).rotation.x=Math.PI/2;
    }
    return {fx:1.1,fz:1.5,rx:1.14,rz:-1.5,r:.5};
  }
  if(car==='t240'){                                    /* the brick */
    add(new THREE.BoxGeometry(2.45,1.1,5.2),paint,0,1.0,0);
    add(new THREE.BoxGeometry(2.35,.42,1.7),paint,0,1.58,1.85);
    add(new THREE.BoxGeometry(2.4,1.0,1.9),paint,0,1.95,-1.7);
    add(new THREE.BoxGeometry(2.42,.5,.12),glass,0,1.95,-2.62);
    add(new THREE.BoxGeometry(2.1,.42,.4),glass,0,1.72,.95);
    add(new THREE.BoxGeometry(2.6,.36,.5),dark,0,.86,2.5);
    add(new THREE.BoxGeometry(2.6,.36,.5),dark,0,.86,-2.5);
    add(new THREE.BoxGeometry(1.5,.4,.14),dark,0,1.4,2.64);
    for(const g of [-.86,.86]){
      add(new THREE.BoxGeometry(.5,.34,.14),psMat({color:0xf2efe0}),g,1.4,2.64);
      add(new THREE.BoxGeometry(.5,.3,.14),psMat({color:0xc83a2a}),g,1.5,-2.64);
    }
    return {fx:1.2,fz:1.75,rx:1.22,rz:-1.72,r:.52};
  }
  if(car==='acc'){                                     /* the wedge */
    add(new THREE.BoxGeometry(2.3,.52,4.8),paint,0,.72,0);
    add(new THREE.BoxGeometry(1.9,.3,1.8),paint,0,.78,2.0).rotation.x=-.12;
    add(new THREE.BoxGeometry(2.2,.3,.5),dark,0,.42,2.5);
    add(new THREE.BoxGeometry(.46,.62,2.4),paint,-.95,1.12,-.5);
    add(new THREE.BoxGeometry(.46,.62,2.4),paint, .95,1.12,-.5);
    add(new THREE.BoxGeometry(1.7,.4,.5),glass,0,1.3,.85);
    add(new THREE.BoxGeometry(2.0,.42,1.5),paint,0,1.06,-1.75);
    add(new THREE.BoxGeometry(2.4,.12,.75),paint,0,1.85,-2.15);
    add(new THREE.BoxGeometry(.14,.7,.5),dark,-.9,1.5,-2.15);
    add(new THREE.BoxGeometry(.14,.7,.5),dark, .9,1.5,-2.15);
    for(const g of [-.7,.7])
      add(new THREE.BoxGeometry(.44,.16,.14),psMat({color:0xf6f2d8}),g,.94,2.72);
    return {fx:1.16,fz:1.62,rx:1.2,rz:-1.58,r:.48};
  }
  if(car==='l61'){                                     /* Björn's sixties convertible */
    const hood=psMat({color:0x3a2f2a}),rack=psMat({color:0x2b2f36});
    add(new THREE.BoxGeometry(2.2,.8,4.4),paint,0,.86,0);
    add(new THREE.BoxGeometry(2.0,.26,1.5),paint,0,1.34,1.3);          /* bonnet hump */
    add(new THREE.BoxGeometry(1.9,.5,.08),glass,0,1.62,.42).rotation.x=-.35;   /* windscreen */
    add(new THREE.BoxGeometry(2.0,.06,.1),chrome,0,1.88,.34);
    add(new THREE.BoxGeometry(1.9,.34,.7),hood,0,1.36,-1.55);          /* folded top */
    add(new THREE.BoxGeometry(2.36,.2,.32),chrome,0,.62,2.24);
    add(new THREE.BoxGeometry(2.36,.2,.32),chrome,0,.62,-2.24);
    add(new THREE.BoxGeometry(2.24,.06,4.3),chrome,0,1.0,0);          /* waist trim */
    for(const g of [-.7,.7]){
      add(new THREE.CylinderGeometry(.2,.2,.12,8),psMat({color:0xf6f2d8}),g,.98,2.22).rotation.x=Math.PI/2;
      add(new THREE.BoxGeometry(.3,.18,.1),psMat({color:0xc83a2a}),g,.98,-2.22);
    }
    /* the bicycle on the boot carrier, wobbling in every corner */
    add(new THREE.BoxGeometry(.08,.9,.08),rack,-.5,1.55,-2.3);
    add(new THREE.BoxGeometry(.08,.9,.08),rack, .5,1.55,-2.3);
    add(new THREE.BoxGeometry(1.1,.08,.08),rack,0,1.95,-2.3);
    const bike=psMat({color:0x2f6e9e}),rub=psMat({color:0x1b1d22});
    const bw=[];for(const x of [-.62,.62])bw.push(add(new THREE.TorusGeometry(.42,.05,4,10),rub,x,1.9,-2.48));
    for(const x of [-.62,.62])bw.push(add(new THREE.BoxGeometry(.8,.04,.04),rub,x,1.9,-2.48));   /* spokes, so the spin shows */
    add(new THREE.BoxGeometry(1.2,.06,.06),bike,0,2.05,-2.48);
    add(new THREE.BoxGeometry(.06,.5,.06),bike,-.2,2.0,-2.48).rotation.z=.4;
    add(new THREE.BoxGeometry(.06,.5,.06),bike,.35,2.0,-2.48).rotation.z=-.3;
    add(new THREE.BoxGeometry(.06,.06,.5),bike,.45,2.3,-2.48);
    add(new THREE.BoxGeometry(.3,.06,.2),psMat({color:0x6b4a2e}),-.25,2.27,-2.48);
    /* the academic clutter: paper stacks on the back seat, a parking permit over half the screen */
    const paper=psMat({color:0xf4f1e6}),paperD=psMat({color:0xd8d2bf});
    for(const [x,h] of [[-.55,.5],[-.1,.34],[.5,.62]]){add(new THREE.BoxGeometry(.42,h,.32),paper,x,1.2+h/2,-1.05);
      add(new THREE.BoxGeometry(.43,.03,.33),paperD,x,1.2+h*.6,-1.05);}
    add(new THREE.BoxGeometry(.38,.3,.04),psMat({map:plateTex(12,10,'P','#1d4ea8','#f0d040',7)}),.7,1.6,.48).rotation.x=-.35;
    const wp=new THREE.Vector3();
    A.anim.push((k,dt)=>{
      const b=k.boost>0;for(const w of bw)w.rotation.z+=dt*(b?26:Math.abs(k.speed)*.05);
      if(b&&Math.random()<.5){bw[0].getWorldPosition(wp);puff(wp.x,wp.y+.4,wp.z,.97,.96,.9,1.1);}   /* loose thesis pages */
    });
    return {fx:1.06,fz:1.42,rx:1.08,rz:-1.42,r:.46,white:true,cy:.12,cz:-.35};
  }
  if(car==='raket'){                                   /* Mehmet's moped */
    const glow=psMat({color:0xb04cff,unlit:true}),seat=psMat({color:0x1b1d22});
    add(new THREE.BoxGeometry(.62,.24,2.3),paint,0,.6,-.05);
    add(new THREE.BoxGeometry(.7,.04,2.1),glow,0,.38,-.05);              /* underglow */
    add(new THREE.BoxGeometry(.66,.6,.5),paint,0,.95,.9);                 /* leg shield */
    add(new THREE.BoxGeometry(.24,1.0,.24),dark,0,1.25,1.12).rotation.x=-.3;
    add(new THREE.BoxGeometry(1.2,.09,.09),steel,0,1.72,1.02);            /* handlebar */
    add(new THREE.BoxGeometry(.34,.24,.16),psMat({color:0xf6f2d8}),0,1.55,1.22);
    const scarf=A.grp(.5,1.72,1.02);                                   /* club scarf */
    A.put(scarf,new THREE.BoxGeometry(.18,.5,.06),psMat({color:0x5fb0e6}),0,-.24,0);
    A.put(scarf,new THREE.BoxGeometry(.18,.12,.07),psMat({color:0xf2f4f6}),0,-.42,0);
    add(new THREE.BoxGeometry(.04,.5,.46),psMat({color:0xe8e2d0}),-.35,.96,.9);    /* a replacement panel */
    for(const [x,y,z] of [[.35,1.0,.75],[-.35,.74,-.3],[.35,.7,-.85]]){             /* football stickers */
      add(new THREE.BoxGeometry(.03,.14,.14),psMat({color:0xf2f4f6}),x,y,z);
      add(new THREE.BoxGeometry(.035,.06,.06),psMat({color:0x15171b}),x,y,z);}
    add(new THREE.CylinderGeometry(.14,.1,1.0,6),steel,.36,.62,-1.3).rotation.x=Math.PI/2+.2;  /* an unnecessary exhaust */
    add(new THREE.CylinderGeometry(.16,.16,.08,6),dark,.36,.72,-1.8).rotation.x=Math.PI/2+.2;
    /* the 45 plate flips up in a boost wheelie and shows TYP underneath */
    add(new THREE.BoxGeometry(.44,.26,.04),psMat({map:plateTex(16,10,'TYP','#15171b','#f0d040',6)}),0,.82,-1.72);
    const flip=A.grp(0,.96,-1.75);
    A.put(flip,new THREE.BoxGeometry(.46,.28,.04),psMat({map:plateTex(16,10,'45','#15171b','#f2f4f6',7)}),0,-.14,0);
    A.anim.push(k=>{
      flip.rotation.x=lerp(flip.rotation.x,k.wheelie&&k.boost>0?-1.9:0,.25);
      scarf.rotation.x=lerp(scarf.rotation.x,-clamp(Math.abs(k.speed)*.035,0,1.3)+Math.sin(clock*13)*.12,.2);
    });
    add(new THREE.BoxGeometry(.6,.26,1.1),seat,0,.98,-.55);
    add(new THREE.BoxGeometry(.66,.36,.9),paint,0,.74,-.6);
    const box=add(new THREE.BoxGeometry(.86,.66,.74),psMat({color:0xf0a818}),0,1.42,-1.35);  /* snack box */
    add(new THREE.BoxGeometry(.3,.3,.04),psMat({color:0xe23a4a}),.2,1.48,-.97);
    add(new THREE.BoxGeometry(.24,.24,.04),psMat({color:0x2ad4a0}),-.22,1.36,-.97);
    void box;
    return {fx:0,fz:1.15,rx:0,rz:-1.05,r:.38,two:true,cy:.06,cz:-.28,noWheel:true};
  }
  if(car==='lant'){                                    /* Anders' tractor */
    const rust=psMat({color:0x6b4a2e}),amber=psMat({color:0xf0a818,unlit:true});
    add(new THREE.BoxGeometry(1.3,1.0,2.3),paint,0,1.3,.9);               /* hood */
    add(new THREE.BoxGeometry(1.1,.7,.1),dark,0,1.25,2.07);               /* grille */
    for(const g of [-.36,.36])add(new THREE.BoxGeometry(.24,.18,.1),psMat({color:0xfff2b0,unlit:true}),g,1.62,2.08);
    add(new THREE.CylinderGeometry(.08,.08,.9,6),dark,.4,2.1,1.5);        /* exhaust */
    add(new THREE.BoxGeometry(1.6,.5,1.6),paint,0,.95,-.85);              /* body under the seat */
    for(const g of [-1,1]){
      add(new THREE.BoxGeometry(.7,.14,1.7),paint,g*1.32,2.08,-1.0);      /* rear fenders */
      add(new THREE.BoxGeometry(.1,1.9,.1),dark,g*.82,2.55,-.2);          /* cab posts */
      add(new THREE.BoxGeometry(.1,1.9,.1),dark,g*.82,2.55,-1.75);
      /* loader arms out to the bucket */
      add(new THREE.BoxGeometry(.14,.18,2.6),dark,g*.78,1.3,1.75).rotation.x=.3;
    }
    add(new THREE.BoxGeometry(1.86,.12,1.8),paint,0,3.52,-.98);           /* roof */
    add(new THREE.BoxGeometry(.24,.22,.24),amber,0,3.7,-.98);             /* beacon */
    add(new THREE.SphereGeometry(.2,6,3,0,6.283,0,Math.PI/2),psMat({color:0xf2f4f6}),.6,3.58,-1.5);  /* GPS */
    for(const x of [-.75,-.4,.4,.75])add(new THREE.BoxGeometry(.24,.18,.12),psMat({color:0xfff6d0,unlit:true}),x,3.5,-.06);  /* work lights */
    const rows=pixTex(16,12,g=>{g.fillStyle='#0c2a14';g.fillRect(0,0,16,12);g.fillStyle='#5cff7a';
      for(let x=2;x<16;x+=3)g.fillRect(x,1,1,10);g.fillStyle='#f0c030';g.fillRect(7,8,2,2);});
    add(new THREE.BoxGeometry(.42,.32,.05),psMat({map:rows,unlit:true}),-.55,2.05,.2).rotation.x=-.3;  /* perfectly straight lines */
    const bk=A.grp(0,.42,2.84);                                            /* the bucket */
    A.put(bk,new THREE.BoxGeometry(2.2,.12,.9),rust,0,0,.41);
    A.put(bk,new THREE.BoxGeometry(2.2,.7,.12),rust,0,.33,0);
    A.put(bk,new THREE.BoxGeometry(.12,.6,.9),rust,-1.04,.28,.41);
    A.put(bk,new THREE.BoxGeometry(.12,.6,.9),rust, 1.04,.28,.41);
    const cake=A.put(bk,new THREE.CylinderGeometry(.55,.6,.14,8),psMat({color:0xc89a52}),0,.14,.42);
    A.put(cake,new THREE.CylinderGeometry(.4,.45,.06,8),psMat({color:0xf4ece0}),0,.08,0);
    cake.scale.set(1.25,.6,1);cake.visible=false;
    A.anim.push(k=>{
      const t=k.bucketAt==null?99:clock-k.bucketAt;
      cake.visible=t<1.3;
      bk.rotation.x=t<1.6?(t<.9?-.12:Math.sin(Math.min(1,(t-.9)/.7)*Math.PI)*.9):0;   /* carries it, then tips it away */
    });
    addHay(add,0,1.65,-2.4);
    return {fx:.95,fz:1.65,rx:1.32,rz:-1.0,r:.5,rr:1.0,rw:.6,cy:.5,cz:-.55};
  }
  add(new THREE.BoxGeometry(1.75,.46,2.9),paint,0,.6,0);
  add(new THREE.BoxGeometry(1.15,.4,1.0),paint,0,.56,1.75);
  add(new THREE.BoxGeometry(1.45,.14,.5),dark,0,.4,2.15);
  add(new THREE.BoxGeometry(.34,.56,2.1),paint,-.92,.82,-.1);
  add(new THREE.BoxGeometry(.34,.56,2.1),paint, .92,.82,-.1);
  add(new THREE.BoxGeometry(1.25,.9,.26),paint,0,1.06,-1.16);
  add(new THREE.BoxGeometry(1.3,.66,.95),dark,0,.92,-1.72);
  add(new THREE.CylinderGeometry(.11,.11,1,6),steel,-.36,1.3,-2.02).rotation.x=Math.PI/2;
  add(new THREE.CylinderGeometry(.11,.11,1,6),steel, .36,1.3,-2.02).rotation.x=Math.PI/2;
  add(new THREE.BoxGeometry(1.9,.12,.55),paint,0,1.6,-1.88);
  add(new THREE.BoxGeometry(.12,.6,.5),dark,-.74,1.3,-1.88);
  add(new THREE.BoxGeometry(.12,.6,.5),dark, .74,1.3,-1.88);
  return {fx:1.02,fz:1.26,rx:1.1,rz:-1.28,r:.44};
}

/** the shared blocky face: eyes, nose, mouth, ears. y is the head centre */
function blockFace(addc,skin,dark,y,o){
  o=o||{};
  const w=o.w||.52,eye=psMat({color:0xf4f6f8});
  addc(new THREE.BoxGeometry(w,.52,.48),skin,0,y,-.60);
  addc(new THREE.BoxGeometry(.12,.10,.05),eye,-.13,y+.05,-.355);
  addc(new THREE.BoxGeometry(.12,.10,.05),eye, .13,y+.05,-.355);
  addc(new THREE.BoxGeometry(.06,.07,.04),dark,-.13,y+.05,-.37);
  addc(new THREE.BoxGeometry(.06,.07,.04),dark, .13,y+.05,-.37);
  addc(new THREE.BoxGeometry(.12,.11,.11),skin,0,y-.03,-.35);
  addc(new THREE.BoxGeometry(.24,.06,.05),psMat({color:o.mouth||0x8c4038}),0,y-.15,-.355);
  if(o.grin)addc(new THREE.BoxGeometry(.2,.035,.04),eye,0,y-.135,-.36);
  addc(new THREE.BoxGeometry(.11,.13,.13),skin,-w/2-.03,y-.02,-.60);
  addc(new THREE.BoxGeometry(.11,.13,.13),skin, w/2+.03,y-.02,-.60);
  if(o.cheeks){
    addc(new THREE.BoxGeometry(.11,.08,.05),psMat({color:0xe08a84}),-.21,y-.08,-.35);
    addc(new THREE.BoxGeometry(.11,.08,.05),psMat({color:0xe08a84}), .21,y-.08,-.35);
  }
}
/** round glasses: four thin bars per lens and a bridge */
function blockGlasses(addc,y,col){
  const m=psMat({color:col||0x1b1d22});
  for(const sx of [-.14,.14]){
    addc(new THREE.BoxGeometry(.2,.035,.04),m,sx,y+.085,-.345);
    addc(new THREE.BoxGeometry(.2,.035,.04),m,sx,y-.075,-.345);
    addc(new THREE.BoxGeometry(.035,.16,.04),m,sx-.09,y+.005,-.345);
    addc(new THREE.BoxGeometry(.035,.16,.04),m,sx+.09,y+.005,-.345);
  }
  addc(new THREE.BoxGeometry(.08,.03,.04),m,0,y+.03,-.345);
}
/** Björn, Mehmet, Anders and Britta: torso, arms on the wheel, head, hair and props */
function buildDriver(kind,addc,add,skin,dark,car){
  const torso=(m,front)=>{addc(new THREE.BoxGeometry(.94,.86,.56),m,0,1.24,-.60);
    if(front)addc(new THREE.BoxGeometry(.96,.62,.1),front,0,1.28,-.31);};
  const arms=(m,cuff)=>{
    addc(new THREE.BoxGeometry(.25,.23,.5),m,-.37,1.14,-.28);
    addc(new THREE.BoxGeometry(.25,.23,.5),m, .37,1.14,-.28);
    addc(new THREE.BoxGeometry(.21,.19,.4),cuff||skin,-.35,1.13,.15);
    addc(new THREE.BoxGeometry(.21,.19,.4),cuff||skin, .35,1.13,.15);
  };
  if(kind==='bjorn'){                       /* corduroy, elbow patches, beard, tote bag */
    const cord=pixTex(16,16,g=>{g.fillStyle='#7a4e2c';g.fillRect(0,0,16,16);
      g.fillStyle='#6a4224';for(let x=0;x<16;x+=3)g.fillRect(x,0,1,16);});
    const blazer=psMat({map:cord}),shirt=psMat({color:0xa9c8e8}),beard=psMat({color:0x5a3a22});
    torso(blazer);
    addc(new THREE.BoxGeometry(.3,.5,.1),shirt,0,1.36,-.3);
    addc(new THREE.BoxGeometry(.12,.4,.08),psMat({color:0x8b2b1c}),0,1.3,-.25);   /* tie */
    arms(blazer,skin);
    addc(new THREE.BoxGeometry(.27,.2,.2),psMat({color:0x4a2e18}),-.37,1.14,-.2); /* elbow patches */
    addc(new THREE.BoxGeometry(.27,.2,.2),psMat({color:0x4a2e18}), .37,1.14,-.2);
    blockFace(addc,skin,dark,1.82,{});
    addc(new THREE.BoxGeometry(.54,.22,.16),beard,0,1.62,-.38);
    addc(new THREE.BoxGeometry(.56,.3,.4),beard,0,1.66,-.58);
    addc(new THREE.BoxGeometry(.2,.05,.05),beard,0,1.715,-.355);                 /* moustache */
    blockGlasses(addc,1.86);
    addc(new THREE.BoxGeometry(.58,.16,.5),beard,0,2.12,-.62);                   /* hair, opinions */
    addc(new THREE.BoxGeometry(.2,.16,.2),beard,-.14,2.24,-.5).rotation.z=.4;
    addc(new THREE.BoxGeometry(.2,.14,.2),beard,.16,2.22,-.66).rotation.z=-.5;
    addc(new THREE.BoxGeometry(.56,.3,.12),beard,0,1.96,-.86);
    addc(new THREE.BoxGeometry(.5,.56,.12),psMat({color:0xe6dcc0}),.6,1.16,-.62); /* tote bag */
    addc(new THREE.BoxGeometry(.06,.5,.06),psMat({color:0xe6dcc0}),.52,1.5,-.62);
  }else if(kind==='mehmet'){                /* youngest in the field, oldest swagger */
    const chk=pixTex(16,16,g=>{for(let x=0;x<16;x+=4)for(let y=0;y<16;y+=4){
      g.fillStyle=((x/4+y/4)%2)?'#f2f4f6':'#1f56b8';g.fillRect(x,y,4,4);}});
    const shirt=psMat({map:chk}),helm=psMat({color:0x15171b});
    addc(new THREE.BoxGeometry(.84,.8,.5),shirt,0,1.24,-.60);
    arms(shirt,skin);
    addc(new THREE.BoxGeometry(.18,.12,.08),psMat({color:0xf2f4f6}),0,1.5,-.33);   /* collar */
    blockFace(addc,skin,dark,1.8,{w:.48,grin:true,mouth:0x7a2e2a});
    /* open-face helmet with grandma's jasmine sticker */
    addc(new THREE.BoxGeometry(.6,.26,.56),helm,0,2.08,-.62);
    addc(new THREE.BoxGeometry(.6,.4,.14),helm,0,1.86,-.86);
    addc(new THREE.BoxGeometry(.1,.42,.5),helm,-.3,1.86,-.62);
    addc(new THREE.BoxGeometry(.1,.42,.5),helm, .3,1.86,-.62);
    addc(new THREE.BoxGeometry(.5,.08,.06),psMat({color:0x2a1c14}),0,1.97,-.35);  /* fringe */
    const pet=psMat({color:0xf8f8f2}),mid=psMat({color:0xf0c030});
    for(const [dx,dy] of [[-.07,0],[.07,0],[0,-.07],[0,.07]])
      addc(new THREE.BoxGeometry(.08,.08,.04),pet,.13+dx,2.12+dy,-.335);
    addc(new THREE.BoxGeometry(.06,.06,.05),mid,.13,2.12,-.33);
  }else if(kind==='anders'){                /* hi-vis over plaid, green farm cap */
    const plaid=pixTex(16,16,g=>{g.fillStyle='#b8402c';g.fillRect(0,0,16,16);
      g.fillStyle='#4a4f58';for(let i=0;i<16;i+=8){g.fillRect(i,0,3,16);g.fillRect(0,i,16,3);}});
    const shirt=psMat({map:plaid}),vest=psMat({color:0xf07a1a}),cap=psMat({color:0x3f7a33});
    torso(shirt);
    addc(new THREE.BoxGeometry(.98,.66,.12),vest,0,1.26,-.31);
    addc(new THREE.BoxGeometry(.98,.66,.12),vest,0,1.26,-.89);
    addc(new THREE.BoxGeometry(.98,.08,.13),psMat({color:0xe8ecef}),0,1.14,-.3);   /* reflective band */
    arms(shirt,skin);
    blockFace(addc,skin,dark,1.82,{w:.56,grin:true,cheeks:true});
    addc(new THREE.BoxGeometry(.58,.08,.5),psMat({color:0x8a5a34}),0,2.06,-.62);  /* hair under the cap */
    addc(new THREE.BoxGeometry(.6,.22,.56),cap,0,2.18,-.62);
    addc(new THREE.BoxGeometry(.56,.05,.3),cap,0,2.08,-.3);                        /* peak */
    addc(new THREE.BoxGeometry(.18,.12,.04),psMat({color:0xe8c33a}),0,2.2,-.335);  /* wheat badge */
    addc(new THREE.CylinderGeometry(.08,.08,.26,6),psMat({color:0x22c46a}),.52,1.06,.1); /* energy drink */
  }else if(kind==='teo'){                  /* Teo: crest beanie, ginger stubble, navy puffer */
    const puff=pixTex(16,16,g=>{g.fillStyle='#2b3242';g.fillRect(0,0,16,16);
      g.fillStyle='#1d2330';for(let y=3;y<16;y+=4)g.fillRect(0,y,16,1);});
    const jacket=psMat({map:puff}),hair=psMat({color:0xc98a4a}),stub=psMat({color:0xb5784a}),
          hat=psMat({color:0x17181c});
    const crest=pixTex(16,16,g=>{                 /* an original crest: wreath round a Skåne shield */
      g.fillStyle='#17181c';g.fillRect(0,0,16,16);
      g.fillStyle='#c9a640';for(let a=0;a<12;a++){const t=a/12*6.283;g.fillRect(7+Math.round(Math.cos(t)*6),7+Math.round(Math.sin(t)*6),2,2);}
      g.fillStyle='#d8362a';g.fillRect(5,4,6,7);g.fillRect(6,11,4,1);g.fillRect(7,12,2,1);
      g.fillStyle='#ffd23a';g.fillRect(7,4,2,8);g.fillRect(5,7,6,2);});
    torso(jacket);
    addc(new THREE.BoxGeometry(.9,.3,.5),jacket,0,1.66,-.66);                     /* high collar */
    addc(new THREE.BoxGeometry(.9,.36,.3),psMat({color:0x1d2330}),0,1.72,-.96);   /* hood */
    addc(new THREE.BoxGeometry(.05,.6,.04),psMat({color:0x9aa2ad}),.08,1.3,-.3);  /* zip */
    arms(jacket,skin);
    blockFace(addc,skin,dark,1.86,{w:.54,grin:true,cheeks:true});
    addc(new THREE.BoxGeometry(.5,.14,.16),stub,0,1.66,-.4);                      /* short beard */
    addc(new THREE.BoxGeometry(.56,.24,.36),stub,0,1.7,-.58);
    addc(new THREE.BoxGeometry(.26,.06,.05),stub,0,1.76,-.355);                    /* moustache */
    addc(new THREE.BoxGeometry(.6,.3,.56),hat,0,2.18,-.62);                       /* beanie */
    addc(new THREE.BoxGeometry(.62,.1,.58),psMat({color:0x22242a}),0,2.05,-.62);   /* rib cuff */
    addc(new THREE.BoxGeometry(.2,.2,.03),psMat({map:crest}),0,2.18,-.335);
    addc(new THREE.BoxGeometry(.14,.1,.1),hair,-.24,2.02,-.38).rotation.z=.4;     /* tufts escaping */
    addc(new THREE.BoxGeometry(.12,.1,.1),hair,.25,2.0,-.4).rotation.z=-.5;
    addc(new THREE.BoxGeometry(.1,.2,.2),hair,-.31,1.96,-.7);
    addc(new THREE.BoxGeometry(.1,.2,.2),hair, .31,1.96,-.7);
  }else if(kind==='amanda'){               /* Amanda: cream knit beanie, blonde bob, black puffer */
    const puff=pixTex(16,16,g=>{g.fillStyle='#1d1f24';g.fillRect(0,0,16,16);
      g.fillStyle='#121317';for(let y=3;y<16;y+=4)g.fillRect(0,y,16,1);});
    const jacket=psMat({map:puff}),hair=psMat({color:0xd9b56e}),
          knit=psMat({map:pixTex(16,16,g=>{g.fillStyle='#e9e1cf';g.fillRect(0,0,16,16);
            g.fillStyle='#d6ccb6';for(let x=0;x<16;x+=2)for(let y=x%4?0:1;y<16;y+=2)g.fillRect(x,y,1,1);})});
    torso(jacket);
    addc(new THREE.BoxGeometry(.86,.28,.5),jacket,0,1.64,-.64);                    /* collar */
    arms(jacket,skin);
    blockFace(addc,skin,dark,1.84,{w:.5,grin:true,cheeks:true,mouth:0xa8484e});
    addc(new THREE.BoxGeometry(.58,.12,.08),hair,0,2.04,-.355);                    /* fringe */
    addc(new THREE.BoxGeometry(.12,.62,.42),hair,-.3,1.74,-.64);                   /* bob to the shoulders */
    addc(new THREE.BoxGeometry(.12,.62,.42),hair, .3,1.74,-.64);
    addc(new THREE.BoxGeometry(.6,.62,.14),hair,0,1.76,-.88);
    addc(new THREE.BoxGeometry(.66,.26,.6),knit,0,2.16,-.64);                      /* slouchy beanie */
    addc(new THREE.BoxGeometry(.58,.18,.44),knit,0,2.26,-.86).rotation.x=.35;        /* the slouch, falling back */
    addc(new THREE.BoxGeometry(.68,.1,.62),psMat({color:0xd6ccb6}),0,2.04,-.64);
  }else{                                    /* granny Britta: cardigan, bun, glasses */
    const card=psMat({color:0x3f8a4a}),blouse=psMat({color:0xf3ece0}),hair=psMat({color:0xc9c8c4});
    torso(card);
    addc(new THREE.BoxGeometry(.36,.5,.1),blouse,0,1.36,-.3);
    for(const y of [1.42,1.24])addc(new THREE.BoxGeometry(.06,.06,.06),psMat({color:0xd84a6a}),0,y,-.24);
    arms(card,skin);
    blockFace(addc,skin,dark,1.8,{cheeks:true,mouth:0xb0505a});
    blockGlasses(addc,1.85,0x8a6a3a);
    addc(new THREE.BoxGeometry(.6,.24,.54),hair,0,2.1,-.62);
    addc(new THREE.BoxGeometry(.6,.4,.16),hair,0,1.88,-.86);
    addc(new THREE.BoxGeometry(.12,.3,.4),hair,-.3,1.92,-.66);
    addc(new THREE.BoxGeometry(.12,.3,.4),hair, .3,1.92,-.66);
    addc(new THREE.SphereGeometry(.17,6,5),hair,0,2.3,-.72);                        /* bun */
    if(car!=='hembak'){                                /* the bakery van has a cooling rack there */
      add(new THREE.BoxGeometry(.9,.42,.6),psMat({color:0xb07a3a}),0,1.2,-1.75);     /* knitting basket */
      add(new THREE.SphereGeometry(.2,6,5),psMat({color:0xd84a6a}),-.18,1.5,-1.75);
      add(new THREE.SphereGeometry(.18,6,5),psMat({color:0x3f63c8}),.2,1.48,-1.7);
    }
  }
}
/** Victor: white polo with burgundy tipping, trimmed beard, hair swept up, yellow watch.
    Arms and legs hang on joints, so on the select turntable he can stand with his hands on
    his hips, climb in, fix his gloves and tap the wheel twice. Racing, he just sits. */
function buildVictor(cab,skin,dark,anim){
  const B=(w,h,d)=>new THREE.BoxGeometry(w,h,d);
  const put=(p,g,m,x,y,z)=>{const e=new THREE.Mesh(flat(g),m);e.position.set(x,y,z);p.add(e);return e;};
  const addc=(g,m,x,y,z)=>put(cab,g,m,x,y,z);
  const polo=psMat({color:0xf6f5f0}),burg=psMat({color:0x7a1f30}),hair=psMat({color:0x2a201a}),
        pants=psMat({color:0x262a33}),glove=psMat({color:0x17181c}),watch=psMat({color:0xf2d21a});
  addc(B(.94,.62,.56),polo,0,1.34,-.6);                                     /* polo */
  addc(B(.92,.26,.54),pants,0,.92,-.6);                                     /* trousers from the waist */
  addc(B(.94,.06,.56),glove,0,1.04,-.6);                                    /* belt */
  addc(B(.16,.3,.04),polo,0,1.5,-.31);                                      /* placket, two buttons */
  for(const y of [1.56,1.44])addc(B(.05,.05,.03),burg,0,y,-.29);
  for(const sg of [-1,1]){                                                  /* collar, tipped in burgundy */
    addc(B(.26,.08,.2),polo,sg*.17,1.66,-.4).rotation.z=-sg*.25;
    addc(B(.26,.03,.2),burg,sg*.17,1.62,-.4).rotation.z=-sg*.25;
  }
  const limb=[];
  for(const sg of [-1,1]){
    const sh=new THREE.Group();sh.position.set(sg*.42,1.55,-.6);cab.add(sh);
    put(sh,B(.28,.3,.28),polo,0,-.13,0);                                    /* short sleeve */
    put(sh,B(.29,.06,.29),burg,0,-.29,0);                                   /* its burgundy edge */
    put(sh,B(.21,.24,.21),skin,0,-.42,0);
    const el=new THREE.Group();el.position.y=-.52;sh.add(el);
    put(el,B(.2,.4,.2),skin,0,-.2,0);
    put(el,B(.23,.16,.25),glove,0,-.46,0);                                  /* racing gloves */
    if(sg<0)put(el,B(.24,.08,.24),watch,0,-.34,0);                         /* the bright yellow watch */
    const hip=new THREE.Group();hip.position.set(sg*.22,.86,-.6);cab.add(hip);
    put(hip,B(.32,.8,.36),pants,0,-.4,0);
    put(hip,B(.32,.14,.48),glove,0,-.8,.07);                                /* shoes */
    limb.push({sg,sh,el,hip});
  }
  const y=1.86;
  blockFace(addc,skin,dark,y,{w:.52,mouth:0x7a3a34});
  addc(B(.09,.05,.05),psMat({color:0x7a3a34}),.12,y-.12,-.355);            /* one corner up: the smirk */
  addc(B(.14,.04,.04),hair,-.13,y+.15,-.355);                               /* brows, the right one raised */
  addc(B(.14,.04,.04),hair,.13,y+.18,-.355).rotation.z=-.25;
  addc(B(.54,.12,.16),hair,0,y-.22,-.4);                                    /* trimmed beard */
  addc(B(.58,.26,.38),hair,0,y-.15,-.58);
  addc(B(.24,.05,.05),hair,0,y-.08,-.352);                                  /* moustache */
  for(const sg of [-1,1])addc(B(.05,.22,.16),hair,sg*.28,y-.06,-.5);        /* sideburns into the beard */
  addc(B(.56,.12,.5),hair,0,y+.3,-.62);                                     /* short sides, swept up on top */
  addc(B(.5,.2,.22),hair,0,y+.4,-.42).rotation.x=-.45;
  addc(B(.42,.16,.24),hair,0,y+.42,-.62).rotation.x=-.25;
  addc(B(.14,.12,.12),hair,-.14,y+.52,-.44).rotation.z=.3;
  /* poses: shoulder (x tilt, z spread), elbow bend, hip bend */
  const seatP=cab.position.clone(),side=-1.7;
  const SIT={sx:-1.25,sz:.05,ex:-.12,ez:0,hx:-1.45},HIPS={sx:0,sz:.9,ex:0,ez:-1.8,hx:0};
  function pose(P,dy){
    for(const L of limb){
      L.sh.rotation.set(P.sx,0,L.sg*P.sz);L.el.rotation.set(P.ex+(dy||0),0,L.sg*P.ez);L.hip.rotation.x=P.hx;
    }
  }
  const mix=(a,b,t)=>{const o={};for(const k in a)o[k]=lerp(a[k],b[k],t);return o;};
  pose(SIT);
  const st={t:0,last:-9};
  anim.push((k,dt)=>{
    if(!(previewOn&&k===player)){if(st.t){st.t=0;cab.position.copy(seatP);pose(SIT);}return;}
    if(clock-st.last>.25)st.t=0;                       /* shown again: start over beside the kart */
    st.last=clock;st.t+=dt;const t=st.t;
    if(t<1.8){                                          /* hands on hips, sizing you up */
      cab.position.set(side,0,.3);pose(HIPS);
    }else if(t<2.7){                                    /* climbs in */
      const u=(t-1.8)/.9,e=u*u*(3-2*u);
      cab.position.set(lerp(side,seatP.x,e),lerp(0,seatP.y,e)+Math.sin(u*Math.PI)*.9,lerp(.3,seatP.z,e));
      pose(mix(HIPS,SIT,Math.min(1,u*1.4)));
    }else if(t<4.0){                                    /* adjusts his gloves */
      cab.position.copy(seatP);pose(SIT);
      const w=Math.sin((t-2.7)*18)*.12;
      limb[0].sh.rotation.set(-.9,0,-.1);limb[0].el.rotation.set(-1.3,0,.6);
      limb[1].sh.rotation.set(-.85,0,-.25);limb[1].el.rotation.set(-1.25+w,0,-.7);
    }else if(t<5.2){                                    /* tap, tap */
      const u=(t-4.0)/1.2;
      pose(SIT,u<.85?-Math.abs(Math.sin(u/.85*Math.PI*2))*.35:0);
    }else pose(SIT);
  });
}
/** the four cup champions: the ghost, the chieftain, the green man and Raket-Rune */
function buildChampion(kind,addc,add,skin,dark,car){
  const B=(w,h,d)=>new THREE.BoxGeometry(w,h,d);
  if(kind==='ghost'){                       /* Spöket på Glimmingehus: a sheet, a chain, a lantern */
    const sheet=psMat({color:0xe6eef4}),hole=psMat({color:0x161a24}),iron=psMat({color:0x4a4e56});
    addc(new THREE.CylinderGeometry(.36,.58,1.15,7),sheet,0,1.28,-.6);
    addc(new THREE.SphereGeometry(.38,7,5),sheet,0,1.96,-.6);
    addc(B(.11,.16,.05),hole,-.13,2.0,-.24);addc(B(.11,.16,.05),hole,.13,2.0,-.24);
    addc(B(.14,.14,.05),hole,0,1.82,-.25);                               /* hooo */
    for(const sg of [-1,1]){
      addc(B(.22,.2,.86),sheet,sg*.36,1.14,.02);
      addc(B(.24,.06,.06),iron,sg*.36,1.08,.3);                          /* shackles */
    }
    for(let n=0;n<6;n++){const a=n/6*6.283;
      addc(B(.18,.22,.1),sheet,Math.sin(a)*.5,.74,-.6+Math.cos(a)*.5).rotation.y=a;}
    for(let n=0;n<4;n++)addc(B(.08,.08,.14),iron,.26+n*.07,.95-n*.06,.32-n*.12);
    if(car!=='nattvagn'){                              /* the carriage hangs Spöklyktan up front */
      const pole=add(new THREE.CylinderGeometry(.03,.03,1.6,4),iron,.55,1.7,-1.25);pole.rotation.z=.12;
      add(B(.3,.36,.3),psMat({color:0xffcc55,unlit:true}),.65,2.5,-1.25);
      add(B(.36,.06,.36),iron,.65,2.71,-1.25);
    }
  }else if(kind==='viking'){                /* Vikingahövdingen: fur, beard, horns, a round shield */
    const fur=psMat({color:0x6b4a2e}),hide=psMat({color:0x8a6a44}),beard=psMat({color:0xd0642a}),
          iron=psMat({color:0x8a9098}),horn=psMat({color:0xeee4c8});
    addc(B(1.0,.88,.6),hide,0,1.24,-.6);
    addc(B(1.12,.3,.7),fur,0,1.62,-.6);                                 /* fur collar */
    addc(B(1.02,.12,.62),psMat({color:0x3a2a1c}),0,.96,-.6);
    for(const sg of [-1,1])addc(B(.29,.27,.86),skin,sg*.4,1.13,.02);
    addc(B(.52,.5,.46),skin,0,1.84,-.6);
    addc(B(.54,.46,.2),beard,0,1.58,-.36);
    for(const sg of [-1,1])addc(B(.1,.3,.1),beard,sg*.16,1.28,-.33);   /* braids */
    addc(B(.12,.1,.05),psMat({color:0x14181c}),-.13,1.9,-.36);
    addc(B(.12,.1,.05),psMat({color:0x14181c}),.13,1.9,-.36);
    const helm=addc(new THREE.SphereGeometry(.33,7,4,0,6.283,0,Math.PI/2),iron,0,2.0,-.6);helm.scale.y=.9;
    addc(B(.08,.16,.08),iron,0,1.94,-.27);                               /* nose guard */
    for(const sg of [-1,1]){const h=addc(new THREE.ConeGeometry(.09,.52,5),horn,sg*.42,2.18,-.6);h.rotation.z=-sg*.95;}
    const sh=add(new THREE.CylinderGeometry(.6,.6,.08,10),psMat({color:0xb82a22}),-.86,1.15,-.9);sh.rotation.z=Math.PI/2;
    const st=add(B(.1,1.15,.18),psMat({color:0xe8c33a}),-.9,1.15,-.9);
    add(new THREE.CylinderGeometry(.14,.14,.12,6),iron,-.92,1.15,-.9).rotation.z=Math.PI/2;
    st.rotation.x=.6;
  }else if(kind==='gubbe'){                 /* Gröna gubben från skogen: big head, black eyes, antennae, moss */
    const green=psMat({color:0x6fcf52}),suit=psMat({color:0xb8c4cc}),eye=psMat({color:0x0c0e12}),
          moss=psMat({color:0x3f6a2a}),glow=psMat({color:0xb6ff7a,unlit:true});
    addc(B(.74,.8,.48),suit,0,1.2,-.6);
    addc(B(.9,.5,.3),moss,0,1.4,-.86);                                   /* a cloak of moss */
    for(const sg of [-1,1])addc(B(.18,.17,.88),green,sg*.32,1.1,.02);
    addc(B(.14,.3,.14),green,0,1.66,-.6);
    const hd=addc(new THREE.SphereGeometry(.42,8,6),green,0,2.02,-.6);hd.scale.set(1,1.12,.95);
    for(const sg of [-1,1]){
      const e=addc(B(.2,.12,.05),eye,sg*.16,2.06,-.21);e.rotation.z=sg*.45;
      addc(new THREE.CylinderGeometry(.02,.02,.5,4),green,sg*.16,2.6,-.66).rotation.z=-sg*.3;
      addc(B(.1,.1,.1),glow,sg*.24,2.86,-.66);
    }
    addc(B(.12,.03,.04),eye,0,1.88,-.22);
  }else{                                    /* Raket-Rune: white suit, visor, moustache, a rocket pack */
    const suit=psMat({color:0xf2f2f4}),red=psMat({color:0xd82a2a}),visor=psMat({color:0x1a2a44}),
          steel=psMat({color:0xa8b0ba}),flame=psMat({color:0xffa83a,unlit:true});
    addc(B(.92,.86,.56),suit,0,1.24,-.6);
    addc(B(.94,.14,.58),red,0,1.38,-.6);
    for(const sg of [-1,1])addc(B(.25,.23,.88),suit,sg*.37,1.12,.02);
    const h=addc(new THREE.SphereGeometry(.36,8,6),suit,0,1.86,-.6);h.scale.set(1,.96,1.04);
    addc(B(.74,.08,.74),red,0,1.95,-.6).scale.set(.98,1,.98);
    addc(B(.5,.2,.1),visor,0,1.88,-.27);
    addc(B(.34,.08,.06),psMat({color:0x3a2a1e}),0,1.72,-.25);           /* the moustache */
    for(const sg of [-1,1]){
      addc(new THREE.CylinderGeometry(.15,.15,.95,8),steel,sg*.24,1.32,-1.02);
      addc(new THREE.ConeGeometry(.15,.3,8),red,sg*.24,1.94,-1.02);
      const f=addc(new THREE.ConeGeometry(.12,.42,6),flame,sg*.24,.64,-1.02);f.rotation.x=Math.PI;
    }
  }
}
function addHay(add,x,y,z){
  add(new THREE.CylinderGeometry(.6,.6,1.25,8),psMat({color:0xd8c47a}),x,y,z).rotation.z=Math.PI/2;
}
/** opt.twin: the AI twin's variant of a vehicle (Teodor's unfinished side, say) */
function buildKart(color,kind,car,opt){
  const root=new THREE.Group();
  const lean=new THREE.Group();root.add(lean);
  const paint=psMat({color}), dark=psMat({color:0x23272e}),
        steel=psMat({color:0xa8b0ba}), skin=psMat({color:0xd8a07c});
  const add=(g,m,x,y,z)=>{const e=new THREE.Mesh(flat(g),m);e.position.set(x,y,z);lean.add(e);return e;};
  const lamps=[],anim=[];
  const grp=(x,y,z,p)=>{const g=new THREE.Group();g.position.set(x,y,z);(p||lean).add(g);return g;};
  const put=(p,g,m,x,y,z)=>{const e=new THREE.Mesh(flat(g),m);e.position.set(x,y,z);p.add(e);return e;};
  const SPEC=buildBody(car||'kart',add,paint,dark,steel,{anim,lamps,grp,put,color,twin:!!(opt&&opt.twin)});
  const cab=new THREE.Group();lean.add(cab);
  const addc=(g,m,x,y,z)=>{const e=new THREE.Mesh(flat(g),m);e.position.set(x,y,z);cab.add(e);return e;};
  cab.position.set(0,SPEC.cy!=null?SPEC.cy:(car==='acc'?-.06:(car&&car!=='kart'?.32:0)),
                   SPEC.cz!=null?SPEC.cz:(car&&car!=='kart'?-.25:0));
  if(kind==='arne'){            /* blå skjorta, gröna hängselbyxor, halmhatt */
    const shirt=psMat({color:0x7fa8d8}), cuff=psMat({color:0x6b93c4}),
          bib=psMat({color:0x6fa43f}), strap=psMat({color:0x5f9136}),
          straw=psMat({color:0xe3cf7e}), bandM=psMat({color:0xe8c33a}),
          hair=psMat({color:0xb98a5a});
    /* torso: blue shirt with the green bib over it */
    addc(new THREE.BoxGeometry(.98,.86,.58),shirt,0,1.24,-.60);
    addc(new THREE.BoxGeometry(.60,.54,.10),bib,0,1.20,-.33);
    addc(new THREE.BoxGeometry(.13,.50,.09),strap,-.26,1.56,-.35);
    addc(new THREE.BoxGeometry(.13,.50,.09),strap, .26,1.56,-.35);
    addc(new THREE.BoxGeometry(.09,.09,.06),bandM,-.26,1.34,-.30);   /* buttons */
    addc(new THREE.BoxGeometry(.09,.09,.06),bandM, .26,1.34,-.30);
    /* sleeves to the elbow, bare forearms on the wheel */
    addc(new THREE.BoxGeometry(.27,.25,.46),shirt,-.38,1.14,-.30);
    addc(new THREE.BoxGeometry(.27,.25,.46),shirt, .38,1.14,-.30);
    addc(new THREE.BoxGeometry(.25,.23,.10),cuff,-.38,1.14,-.06);
    addc(new THREE.BoxGeometry(.25,.23,.10),cuff, .38,1.14,-.06);
    addc(new THREE.BoxGeometry(.21,.19,.50),skin,-.36,1.13,.20);
    addc(new THREE.BoxGeometry(.21,.19,.50),skin, .36,1.13,.20);
    /* round, cheerful head */
    addc(new THREE.BoxGeometry(.56,.52,.50),skin,0,1.80,-.60);
    addc(new THREE.BoxGeometry(.60,.20,.46),skin,0,1.66,-.60);        /* jowls */
    addc(new THREE.BoxGeometry(.13,.10,.06),psMat({color:0xd98f7a}),-.26,1.70,-.34);
    addc(new THREE.BoxGeometry(.13,.10,.06),psMat({color:0xd98f7a}), .26,1.70,-.34);
    addc(new THREE.BoxGeometry(.13,.10,.05),psMat({color:0xf4f6f8}),-.14,1.86,-.345);
    addc(new THREE.BoxGeometry(.13,.10,.05),psMat({color:0xf4f6f8}), .14,1.86,-.345);
    addc(new THREE.BoxGeometry(.06,.06,.04),dark,-.14,1.86,-.36);
    addc(new THREE.BoxGeometry(.06,.06,.04),dark, .14,1.86,-.36);
    addc(new THREE.BoxGeometry(.14,.12,.12),skin,0,1.78,-.34);        /* nose */
    addc(new THREE.BoxGeometry(.30,.08,.05),psMat({color:0x8c4038}),0,1.65,-.345);  /* grin */
    addc(new THREE.BoxGeometry(.26,.04,.04),psMat({color:0xf4f6f8}),0,1.675,-.35);
    addc(new THREE.BoxGeometry(.56,.12,.44),hair,0,1.98,-.63);
    addc(new THREE.BoxGeometry(.12,.14,.14),skin,-.30,1.78,-.60);     /* ears */
    addc(new THREE.BoxGeometry(.12,.14,.14),skin, .30,1.78,-.60);
    /* wide straw hat with a gold band */
    addc(new THREE.CylinderGeometry(.62,.62,.05,10),straw,0,2.04,-.60);
    addc(new THREE.CylinderGeometry(.34,.38,.26,10),straw,0,2.17,-.60);
    addc(new THREE.CylinderGeometry(.385,.385,.09,10),bandM,0,2.09,-.60);
    addc(new THREE.CylinderGeometry(.33,.33,.04,10),straw,0,2.30,-.60);
    /* pitchfork racked behind the seat */
    addc(new THREE.CylinderGeometry(.06,.07,1.9,6),psMat({color:0x9a7b4f}),-.66,1.80,-1.50).rotation.x=.22;
    for(const t of [-.16,0,.16])
      addc(new THREE.BoxGeometry(.05,.40,.05),psMat({color:0xb9c2cc}),-.66+t,2.72,-1.72);
    if(car!=='aker')addc(new THREE.CylinderGeometry(.6,.6,1.25,8),psMat({color:0xd8c47a}),0,1.3,-2.2).rotation.z=Math.PI/2;
  }else if(kind==='billy'){     /* uniform, rutig mössa, varselväst, blåljus (on the bar unless the car has its own) */
    const navy=psMat({color:0x17325e}), navyD=psMat({color:0x101f3c}),
          hiviz=psMat({color:0xe8d93a}), silver=psMat({color:0xc6ced6}),
          belt=psMat({color:0x15171b});
    const check=pixTex(16,8,(g)=>{                     /* blue-white cap band */
      for(let x=0;x<16;x+=4)for(let y=0;y<8;y+=4){
        g.fillStyle=((x/4+y/4)%2)?'#f2f4f6':'#16325e';g.fillRect(x,y,4,4);
      }
    });
    const vestTex=pixTex(32,16,(g)=>{
      g.fillStyle='#e8d93a';g.fillRect(0,0,32,16);
      g.fillStyle='#cfc02c';g.fillRect(0,4,32,2);g.fillRect(0,11,32,2);
      g.fillStyle='#16325e';g.font='5px "Press Start 2P",monospace';
      g.textAlign='center';g.textBaseline='middle';g.fillText('POLIS',16,9);
    });
    addc(new THREE.BoxGeometry(.92,.86,.56),navy,0,1.24,-.60);
    addc(new THREE.BoxGeometry(.96,.60,.12),psMat({map:vestTex}),0,1.30,-.31);
    addc(new THREE.BoxGeometry(.96,.60,.12),hiviz,0,1.30,-.89);
    addc(new THREE.BoxGeometry(.96,.14,.58),belt,0,.98,-.60);   /* duty belt */
    addc(new THREE.BoxGeometry(.13,.11,.07),silver,0,.98,-.31);
    addc(new THREE.BoxGeometry(.13,.26,.18),belt,-.44,.96,-.52); /* holster */
    addc(new THREE.BoxGeometry(.11,.18,.11),belt, .44,.99,-.52); /* radio */
    addc(new THREE.BoxGeometry(.04,.16,.04),silver,.44,1.16,-.52);
    addc(new THREE.BoxGeometry(.30,.12,.11),navyD,-.33,1.60,-.60); /* epaulettes */
    addc(new THREE.BoxGeometry(.30,.12,.11),navyD, .33,1.60,-.60);
    addc(new THREE.BoxGeometry(.24,.22,.46),navy,-.36,1.14,-.30);
    addc(new THREE.BoxGeometry(.24,.22,.46),navy, .36,1.14,-.30);
    addc(new THREE.BoxGeometry(.22,.20,.52),skin,-.35,1.13,.18);
    addc(new THREE.BoxGeometry(.22,.20,.52),skin, .35,1.13,.18);
    addc(new THREE.BoxGeometry(.52,.52,.48),skin,0,1.80,-.60);
    addc(new THREE.BoxGeometry(.40,.11,.06),psMat({color:0x1b1f24}),0,1.86,-.345); /* shades */
    addc(new THREE.BoxGeometry(.11,.05,.05),psMat({color:0x1b1f24}),-.22,1.86,-.36);
    addc(new THREE.BoxGeometry(.11,.05,.05),psMat({color:0x1b1f24}), .22,1.86,-.36);
    addc(new THREE.BoxGeometry(.12,.11,.11),skin,0,1.76,-.35);
    addc(new THREE.BoxGeometry(.26,.07,.06),psMat({color:0x4a3524}),0,1.68,-.35);  /* moustache */
    addc(new THREE.BoxGeometry(.11,.13,.13),skin,-.28,1.78,-.60);
    addc(new THREE.BoxGeometry(.11,.13,.13),skin, .28,1.78,-.60);
    addc(new THREE.CylinderGeometry(.30,.30,.14,10),psMat({map:check}),0,2.04,-.60);
    addc(new THREE.CylinderGeometry(.33,.31,.16,10),navy,0,2.17,-.60);
    addc(new THREE.BoxGeometry(.62,.05,.30),navyD,0,2.03,-.36);     /* peak */
    addc(new THREE.BoxGeometry(.17,.17,.05),hiviz,0,2.17,-.38);     /* badge */
    if(!lamps.length){addc(new THREE.BoxGeometry(1.15,.1,.3),dark,0,1.73,-1.86);
    lamps.push(add(new THREE.BoxGeometry(.44,.26,.3),psMat({color:0x2f78e8,unlit:true}),-.31,1.9,-1.86));
    lamps.push(add(new THREE.BoxGeometry(.44,.26,.3),psMat({color:0xeaf1f8,unlit:true}), .31,1.9,-1.86));}
  }else if(kind==='cow'){                              /* en ko bakom ratten */
    const hide=psMat({color:0xf0ece2}), spot=psMat({color:0x8a4a2c}),
          pink=psMat({color:0xe0a0a4});
    addc(new THREE.BoxGeometry(.86,.82,.52),hide,0,1.24,-.62);
    addc(new THREE.BoxGeometry(.3,.26,.1),spot,-.22,1.38,-.37);
    addc(new THREE.BoxGeometry(.24,.3,.1),spot, .26,1.14,-.37);
    addc(new THREE.BoxGeometry(.26,.22,.86),hide,-.36,1.12,.02);
    addc(new THREE.BoxGeometry(.26,.22,.86),hide, .36,1.12,.02);
    addc(new THREE.BoxGeometry(.72,.14,.2),psMat({color:0x4a3b2c}),0,1.62,-.58);
    addc(new THREE.BoxGeometry(.24,.28,.14),psMat({color:0xe8c33a}),0,1.5,-.44);
    addc(new THREE.BoxGeometry(.66,.6,.62),hide,0,1.9,-.6);        /* head */
    addc(new THREE.BoxGeometry(.3,.24,.12),spot,-.2,2.06,-.6);
    addc(new THREE.BoxGeometry(.5,.3,.16),pink,0,1.76,-.32);
    addc(new THREE.BoxGeometry(.08,.08,.06),dark,-.14,1.78,-.26);
    addc(new THREE.BoxGeometry(.08,.08,.06),dark, .14,1.78,-.26);
    addc(new THREE.BoxGeometry(.1,.1,.06),dark,-.18,2.02,-.33);
    addc(new THREE.BoxGeometry(.1,.1,.06),dark, .18,2.02,-.33);
    addc(new THREE.BoxGeometry(.3,.12,.18),hide,-.42,1.94,-.62);   /* ears */
    addc(new THREE.BoxGeometry(.3,.12,.18),hide, .42,1.94,-.62);
    addc(new THREE.CylinderGeometry(.05,.09,.34,5),psMat({color:0xd8cfae}),-.26,2.3,-.62).rotation.z=.7;
    addc(new THREE.CylinderGeometry(.05,.09,.34,5),psMat({color:0xd8cfae}), .26,2.3,-.62).rotation.z=-.7;
    if(car!=='mjolk'){                                 /* the Mjölkexpress carries its own tank */
      addc(new THREE.CylinderGeometry(.54,.54,1.3,8),psMat({color:0xb9c2cc}),0,1.3,-2.15);
      addc(new THREE.CylinderGeometry(.58,.58,.14,8),psMat({color:0x7e868f}),0,1.98,-2.15);
    }
  }else if(kind==='victor'){
    buildVictor(cab,skin,dark,anim);
  }else if(kind==='bjorn'||kind==='mehmet'||kind==='anders'||kind==='granny'||kind==='teo'||kind==='amanda'){
    buildDriver(kind,addc,add,skin,dark,car);
  }else if(kind==='ghost'||kind==='viking'||kind==='gubbe'||kind==='rune'){
    buildChampion(kind,addc,add,skin,dark,car);
  }else{
    addc(new THREE.BoxGeometry(.78,.78,.5),dark,0,1.22,-.62);
    addc(new THREE.BoxGeometry(.22,.2,.88),skin,-.34,1.12,.02);
    addc(new THREE.BoxGeometry(.22,.2,.88),skin, .34,1.12,.02);
    const helm=add(new THREE.SphereGeometry(.31,6,5),paint,0,1.8,-.6);
    helm.scale.set(1,.94,1.05);
    addc(new THREE.BoxGeometry(.48,.18,.14),psMat({color:0x14181c}),0,1.8,-.32);
  }
  const wg=new THREE.Group();wg.position.copy(cab.position);lean.add(wg);   /* the wheel stays put if the driver gets out */
  const addw=(g,m,x,y,z)=>{const e=new THREE.Mesh(flat(g),m);e.position.set(x,y,z);wg.add(e);return e;};
  if(!SPEC.noWheel)addw(new THREE.BoxGeometry(.5,.12,.5),dark,0,1.18,.55).rotation.x=-.5;
  if(SPEC.trim!=null&&!SPEC.noWheel)                  /* a coloured rim round the wheel */
    addw(new THREE.TorusGeometry(.27,.045,4,8),psMat({color:SPEC.trim}),0,1.25,.55).rotation.x=Math.PI/2-.5;

  const wheelG=(r,w)=>{const t=new THREE.CylinderGeometry(r,r,w,8);t.rotateZ(Math.PI/2);return flat(t);};
  const hubOf=(r,w,k)=>{const c=new THREE.CylinderGeometry(r*k,r*k,w+.04,6);c.rotateZ(Math.PI/2);return flat(c);};
  const hubM=SPEC.white?psMat({color:0xf2efe6}):SPEC.hub!=null?psMat({color:SPEC.hub}):steel;
  const wheels=[],pivots=[];
  const mk=(x,z,front)=>{
    const n=wheels.length;
    const r=SPEC.radii?SPEC.radii[n]:front?SPEC.r:(SPEC.rr||SPEC.r),
          wd=front?(SPEC.fw||.4):(SPEC.rw||.4);
    const piv=new THREE.Group();piv.position.set(x,r,z);lean.add(piv);
    const w=new THREE.Mesh(wheelG(r,wd),dark);piv.add(w);
    if(SPEC.wheel)SPEC.wheel(w,r,wd,n);
    else w.add(new THREE.Mesh(hubOf(r,wd,SPEC.white?.7:(SPEC.hubK||.45)),hubM));
    if(SPEC.white)w.add(new THREE.Mesh(hubOf(r,wd,.4),steel));
    wheels.push(w);if(front)pivots.push(piv);
  };
  if(SPEC.two){mk(0,SPEC.fz,true);mk(0,SPEC.rz,false);}
  else{mk(-SPEC.fx,SPEC.fz,true);mk(SPEC.fx,SPEC.fz,true);
       mk(-SPEC.rx,SPEC.rz,false);mk(SPEC.rx,SPEC.rz,false);}
  return {root,lean,wheels,pivots,lamps,anim,spec:SPEC};
}

const blobTex=pixTex(32,32,(g)=>{
  const im=g.createImageData(32,32);
  for(let y=0;y<32;y++)for(let x=0;x<32;x++){
    const d=Math.hypot(x-15.5,y-15.5)/15.5;
    const a=Math.max(0,1-d*d)*255;
    const i=(y*32+x)*4;
    im.data[i]=im.data[i+1]=im.data[i+2]=0;im.data[i+3]=a;
  }
  g.putImageData(im,0,0);
});

/* drivers. The order is the save format (cup.char is an index), so new ones go on the end;
   GRID is the order on the select screen. sig = the driver's own vehicle, picked first. */
const CHARS=[
  {id:'arne',short:'ARNE',name:'BONDEN ARNE',role:'LANTBRUKARE, ÖSTERLEN',sig:'aker',
   color:0xa8483a,maxSpeed:39.6,power:28,offRoad:0.80,boostMul:1.32,gripOn:10.2,
   quirk:['ÅKERVANA','Gräs och grus bromsar honom knappt.'],
   blurb:'Slowest flat out, but he crosses fields for a living. Grass and gravel barely slow him down, and he plants the kart in a corner like a fence post.'},
  {id:'billy',short:'BILLY',name:'POLISEN BILLY BOOL',role:'ORDNINGSMAKTEN',sig:'patrull',
   color:0x1d4ea8,maxSpeed:43.2,power:25,offRoad:0.48,boostMul:1.50,gripOn:8.3,
   quirk:['BLÅLJUS','Mjölken ger längre och hårdare fart.'],
   blurb:'The quickest thing on tarmac, and his milk boosts run longer and harder. Put one wheel on the verge and the whole lap is gone.'},
  {id:'cow',short:'MAJROS',name:'KOSSAN MAJROS',role:'MJÖLKKO, VEBERÖD',sig:'mjolk',
   color:0xf0ece2,maxSpeed:38.6,power:30.5,offRoad:0.90,boostMul:1.28,gripOn:11.6,milk:1.45,
   quirk:['EGEN MJÖLK','Mjölken räcker 45 % längre. H för att råma.'],
   blurb:'Slowest of the lot and she knows it. Four hooves of grip, a field is just a shortcut, and every bottle of milk lasts her half as long again. H to moo.'},
  {id:'bjorn',short:'BJÖRN',name:'DOKTORANDEN BJÖRN',role:'LUND',sig:'l61',
   color:0x8fd3b0,maxSpeed:41.5,power:24,offRoad:0.55,boostMul:1.34,gripOn:11.4,
   quirk:['AKADEMISK KVART','Gasa inte på KÖR! Vänta en sekund, sedan raketstart.'],
   say:{start:'Intressant. Men metodologiskt tveksamt.',hit:'MIN AVHANDLING!'},
   blurb:'Year eleven of a four-year PhD. Tidy in the corners, slow off the line, and lost the moment the road turns to mud.'},
  {id:'mehmet',short:'MEHMET',name:'MEHMET',role:'ROSENGÅRD',sig:'raket',
   color:0x1f56b8,maxSpeed:40.0,power:33,offRoad:0.70,boostMul:1.40,gripOn:9.6,
   quirk:['SUGET','Ligg tätt bakom en bil och ladda en extra stor fartboost.'],
   say:{start:'Kolla nu, kolla nu!',hit:'AJ! DET DÄR VAR STRAFF!'},
   blurb:'Fifteen, the youngest in the field and by far the most confident. Best off the line, capped at 45, and light enough to get knocked about.'},
  {id:'anders',short:'ANDERS',name:'TRAKTOR-ANDERS',role:'VEBERÖD',sig:'lant',
   color:0xd8461c,maxSpeed:37.5,power:26,offRoad:0.95,boostMul:1.30,gripOn:11.0,mass:2.2,
   quirk:['SKOPAN','Blockerar första träffen varje varv.'],
   say:{start:'Det är bara en åker med asfalt på.',hit:'PAPPA SKULLE HA BROMSAT HÄR.'},
   blurb:'Arne\'s son, who went big. Slowest in a straight line, best in the mud, and heavy enough to shove anyone off his line.'},
  /* an easter egg: the people who made the game */
  {id:'teo',short:'TEO',name:'TEO',role:'TOLLARP',sig:'flyinge',
   color:0x2f62d8,maxSpeed:43.8,power:25,offRoad:0.52,boostMul:1.55,gripOn:8.0,
   quirk:['FULL GAS','Snabbast rakt fram, hopplös i kurvorna.'],
   say:{start:'Jag byggde den här banan!',hit:'DET DÄR ÄR EN BUGG!'},
   blurb:'He made this game, and it shows: flat out on every straight and still working out the corners.'},
  {id:'amanda',short:'AMANDA',name:'AMANDA',role:'LUND',sig:'lerum',
   color:0x6e1f2c,maxSpeed:42.0,power:27,offRoad:0.62,boostMul:1.34,gripOn:10.6,burn:0.88,
   quirk:['NOGGRANN','Perfekt linje: greppet håller och bensinen räcker längre.'],
   say:{start:'Nu kör vi!',hit:'TEO! VAD HAR DU BYGGT?!'},
   blurb:'Smiles the whole way round, never puts a wheel wrong, and somehow always has fuel left at the end.'},
  {id:'britta',kind:'granny',short:'BRITTA',name:'FARMOR BRITTA',role:'ÅHUS',sig:'hembak',
   color:0xf2d36b,maxSpeed:41.0,power:27,offRoad:0.64,boostMul:1.38,gripOn:10.4,shieldMul:2,
   quirk:['HEMBAKAT','Hennes äggkaka skyddar dubbelt så länge.'],
   blurb:'Bakes for the whole village and drives like she is late for the bus. Her own äggkaka holds twice as long.'},
  /* Teo built the game; Victor knows how it should be played. home = the stage he starts on with his own line */
  {id:'victor',short:'VICTOR',name:'VICTOR',role:'VEBERÖD',sig:'original',home:'veberod',
   color:0xf4f2ec,maxSpeed:42.6,power:27,offRoad:0.54,boostMul:1.40,gripOn:9.2,orig:true,
   quirk:['ORIGINALKÄNSLA','En ren, fulladdad sladd ger en längre fartboost.'],
   say:{start:'Okej. Nu kör vi på riktigt.',home:'Här behöver jag ingen karta.',
        pass:'Du byggde banan. Jag är uppvuxen här.',hitTeo:'DET DÄR ÄR JU EN BUGG!',
        perfect:'Där! Originalkänslan!',mud:'Vem har designat det här?',
        win:'En gång till. Så du får en chans.',lose:'Vi kör bäst av tre.',idle:'Och låt Halo vara.'},
   blurb:'Victor från Veberöd har åsikter om racinglinjer, kontrollkänsla och varför originalet alltid var bättre. Hans VEBERÖD ORIGINAL belönar rena sladdar och sena omkörningar. Förlorar han var det förmodligen något med kontrollen.'},
  /* the cup champions, playable once beaten: boss = the cup whose win (SAVE.unlock.win_<cup>) unlocks them */
  {id:'spoket',kind:'ghost',boss:'osterlen',short:'SPÖKET',name:'SPÖKET PÅ GLIMMINGEHUS',role:'GLIMMINGEHUS',sig:'nattvagn',home:'glimminge',
   color:0xcfe0ea,maxSpeed:42.2,power:27,offRoad:0.62,boostMul:1.40,gripOn:10.8,
   quirk:['SPÖKLINJEN','Svävar genom kurvorna nästan lika säkert som Majros.'],
   say:{start:'Hoooo...',home:'Mitt slott. Mina kurvor.',hit:'MITT LAKAN!'},
   blurb:'Har spökat på Glimmingehus i femhundra år och kan varje kurva i mörker. Inte snabbast rakt fram, men tappar aldrig linjen.'},
  {id:'viking',kind:'viking',boss:'kust',short:'HÖVDINGEN',name:'VIKINGAHÖVDINGEN',role:'FOTEVIKEN',sig:'langskepp',home:'foteviken',
   color:0x7a4a2a,maxSpeed:42.6,power:28,offRoad:0.70,boostMul:1.44,gripOn:9.6,mass:1.8,
   quirk:['LÅNGSKEPPET','Tung som ett skepp: knuffar undan alla som kommer för nära.'],
   say:{start:'Till Valhall!',home:'Hela kusten är min.',hit:'VID ODENS SKÄGG!'},
   blurb:'Kör långskepp på hjul som om det vore en strandhugg. Tung, envis och svår att knuffa av linjen.'},
  {id:'gubbe',kind:'gubbe',boss:'vild',short:'GUBBEN',name:'GRÖNA GUBBEN FRÅN SKOGEN',role:'ÄNGELHOLMS UFO-SKOG',sig:'tallrik',home:'angelholm',
   color:0x4fd04a,maxSpeed:42.0,power:29,offRoad:0.88,boostMul:1.38,gripOn:10.2,
   quirk:['SVÄVAR','Tefatet bryr sig knappt om lera, gräs och snö.'],
   say:{start:'Bliip.',home:'Bliip bliip. Hemma.',hit:'BLIIP!'},
   blurb:'Landade i Ängelholm 1946 och har inte hittat hem sedan dess. Hans tefat svävar över allt som inte är asfalt.'},
  {id:'rune',kind:'rune',boss:'final',short:'RUNE',name:'RAKET-RUNE',role:'MALMÖ HAMN',sig:'overljud',home:'rune',
   color:0xd82a2a,maxSpeed:44.0,power:30,offRoad:0.50,boostMul:1.56,gripOn:8.6,burn:1.15,
   quirk:['RAKETBRÄNSLE','Hårdaste turbon i fältet, men tanken tar slut fortare.'],
   say:{start:'Ingen slår Raket-Rune!',home:'Min runda. Mina regler.',hit:'MIN RAKET!'},
   blurb:'Skånes snabbaste man, enligt honom själv. Ingen accelererar som Rune, och ingen bränner så mycket bensin på vägen.'}
];
const GRID=['arne','billy','bjorn','mehmet','anders','cow','teo','victor','amanda','britta','spoket','viking','gubbe','rune'].map(id=>CHARS.findIndex(c=>c.id===id));
const GRID_COLS=Math.max(Math.ceil(Math.sqrt(GRID.length)),Math.ceil(GRID.length/3));   /* 3x3 for nine, then wider: never past three rows */
const kindOf=c=>c.kind||c.id;
/** a champion is playable once their cup is won; everyone else always is */
const charOpen=ci=>!CHARS[ci].boss||!!SAVE.unlock['win_'+CHARS[ci].boss];
/* an AI who is also the player's driver races as a twin: [roster slot, name, paint] in the
   same vehicle (Teodor's prototype is unfinished on the other side) */
const TWIN={cow:[1,'STJÄRNA',0xf08aa8],teo:[2,'TEODOR',0x2f62d8],amanda:[3,'MANDY',0x2f5a3a],britta:[5,'BIRGITTA',0xb89ad8]};
let LAPS=3;
const ROSTER=[
  {name:'DU',     color:0xd8362a,ai:false,kind:'generic'},
  /* en ko: tung, seg, men oslagbar i åkern */
  {name:'MAJROS', color:0xf0ece2,ai:true,kind:'cow',car:'mjolk',
   maxSpeed:39.8,power:31,offRoad:.90,boostMul:1.26,gripOn:12.2,
   lineSpread:1.3,caution:3.0,lookAdd:3,driftLove:0.55,lean:{rough:-0.6}},
  /* Teo: snabbast rakt fram, hopplös i kurvorna */
  {name:'TEO',    color:0x2f62d8,ai:true,kind:'teo',car:'flyinge',
   maxSpeed:44.8,power:25,offRoad:.52,boostMul:1.58,gripOn:7.9,
   lineSpread:4.8,caution:2.0,lookAdd:-3,driftLove:1.40,lean:{risk:0.5}},
  /* Amanda: perfekt linje, bromsar i tid, aldrig utanför */
  {name:'AMANDA', color:0x6e1f2c,ai:true,kind:'amanda',car:'lerum',
   maxSpeed:42.8,power:28,offRoad:.66,boostMul:1.36,gripOn:10.8,
   lineSpread:0.6,caution:2.8,lookAdd:7,driftLove:1.05,lean:{risk:1.5,traffic:1.5}},
  {name:'NISSE',  color:0x1fa8a0,ai:true,kind:'generic',car:'tralla',
   maxSpeed:42.4,power:27,offRoad:.62,boostMul:1.38,gripOn:9.9,
   lineSpread:3.0,caution:2.6,lookAdd:1,driftLove:1.15,lean:{traffic:2}},
  {name:'BRITTA', color:0xf2d36b,ai:true,kind:'granny',car:'hembak',
   maxSpeed:41.6,power:26,offRoad:.60,boostMul:1.38,gripOn:10.0,
   lineSpread:3.4,caution:2.7,lookAdd:2,driftLove:0.85,lean:{fuel:2,defend:true}}
];
/* the champions: each one takes the rival's grid slot in their own cup */
const CHAMPS={
  spoket:{name:'SPÖKET',full:'SPÖKET PÅ GLIMMINGEHUS',color:0xcfe0ea,ai:true,kind:'ghost',car:'nattvagn',
   maxSpeed:43.2,power:28,offRoad:.70,boostMul:1.42,gripOn:10.6,
   lineSpread:0.8,caution:2.6,lookAdd:5,driftLove:1.10,lean:{risk:1.2},
   say:'Hoooo... ingen kör förbi Glimmingehus.'},
  viking:{name:'HÖVDINGEN',full:'VIKINGAHÖVDINGEN',color:0x7a4a2a,ai:true,kind:'viking',car:'langskepp',
   maxSpeed:43.6,power:27,offRoad:.72,boostMul:1.46,gripOn:10.2,
   lineSpread:2.0,caution:2.2,lookAdd:2,driftLove:1.30,lean:{traffic:1.5},
   say:'Till Valhall! Eller åtminstone till mål.'},
  gubbe:{name:'GRÖNA GUBBEN',full:'GRÖNA GUBBEN FRÅN SKOGEN',color:0x4fd04a,ai:true,kind:'gubbe',car:'tallrik',
   maxSpeed:43.8,power:29,offRoad:.82,boostMul:1.44,gripOn:10.8,
   lineSpread:1.0,caution:2.5,lookAdd:4,driftLove:1.0,lean:{rough:-0.5},
   say:'Bliip. Jordbor kör så långsamt.'},
  rune:{name:'RAKET-RUNE',full:'RAKET-RUNE',color:0xd82a2a,ai:true,kind:'rune',car:'overljud',
   maxSpeed:44.2,power:31,offRoad:.70,boostMul:1.55,gripOn:11.0,
   lineSpread:0.8,caution:2.4,lookAdd:5,driftLove:1.2,lean:{risk:1.3},
   say:'Ingen slår Raket-Rune på hans egen runda!'}};
const karts=ROSTER.map((r,i)=>{
  const v=buildKart(r.color,r.kind||'generic',r.car);scene.add(v.root);
  const bg=new THREE.PlaneGeometry(3.6,4.4);bg.rotateX(-Math.PI/2);
  const blob=new THREE.Mesh(bg,psMat({map:blobTex,unlit:true,transparent:true,
    depthWrite:false,opacity:.5,color:0x000000}));
  const dome=new THREE.Mesh(new THREE.SphereGeometry(2.15,8,6),
    psMat({color:0xe8c33a,unlit:true,transparent:true,opacity:.33,depthWrite:false}));
  dome.visible=false;scene.add(dome);
  scene.add(blob);
  return {name:r.name,color:r.color,ai:r.ai,cfg:r,idx:i,v,blob,dome,
    caution:2.9,lookAdd:0,
    x:0,z:0,y:0,yaw:0,vx:0,vz:0,vy:0,air:false,airT:0,si:0,speed:0,onRoad:true,lat:0,
    lap:0,cp:0,prev:0,progress:0,place:i+1,
    drift:0,charge:0,dstage:0,boost:0,slow:0,itemBias:0,spin:0,lean:0,aiSteer:0,
    line:0,lapStart:0,best:null,total:null,done:false,
    fuel:TANK,atPump:false,warned:0,held:null,roll:0,shield:0,spun:0,burn:1,spinResist:1,milk:1,
    rib:0,plan:0,planned:{},mi:0,recoverT:0,ghost:0,stuckT:0,stuckP:-1e9,bandMax:1.16,rival:false,
    gate:0,mass:1,shieldMul:1,bucket:false,bucketLap:-1,kvart:false,suck:0,wheelie:false,orig:false,clean:false,lineVar:0,wantFuel:false,rtp:false,rtpT:0,offT:0,sfx:'',heldLvl:0,curse:0,
    boostLvl:0,shieldLvl:0,pans:0,panHit:{},panG:null,trapAt:-9,slick:0,launch:0,rattle:0,fartT:0,hazAt:-9,parked:false,lapTimes:[],ghostBuf:null,
    maxSpeed:41,power:25,offRoad:.58,boostMul:1.36,gripOn:9.0};
});
const player=karts[0];
scene.remove(player.v.root);                       /* retire the placeholder */
