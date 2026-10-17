"use strict";
/* ───────── karts ───────── */
const CARS=[
  {id:'kart', name:'GOKART', sub:'STANDARD', bars:[.55,.70,.60],
   blurb:'The plain kart. No bodywork, nothing clever — a neutral baseline to judge the others against.',
   mul:{maxSpeed:1,power:1,offRoad:1,gripOn:1,boostMul:1,burn:1}},
  {id:'t96', name:'TROLLHÄTTAN 96', sub:'TVÅTAKTARE, 1967', bars:[.45,.85,1.0],
   blurb:'The little rally fastback with the spotlamps. Slowest flat out, but it pulls hard out of corners and hardly notices leaving the road.',
   mul:{maxSpeed:0.96,power:1.08,offRoad:1.28,gripOn:1.10,boostMul:1,burn:0.92}},
  {id:'t240',name:'TORSLANDA 240', sub:'TEGELSTENEN', bars:[.40,1.0,.75],
   blurb:'The brick. Heavy and slow to wind up, but the most planted thing on the card and it shrugs off a spettekaka in half the time.',
   mul:{maxSpeed:0.93,power:0.94,offRoad:1.06,gripOn:1.24,boostMul:1,burn:1.12,spinResist:0.55}},
  {id:'acc', name:'ÄNGELHOLM CC', sub:'HYPERBIL', bars:[1.0,.35,.20],
   blurb:'Absurd power, a wing you could land a plane on and a fuel gauge that falls while you watch. Fastest thing here by a mile, and the least forgiving.',
   mul:{maxSpeed:1.14,power:1.12,offRoad:0.74,gripOn:0.86,boostMul:1.10,burn:1.42}}
];

/** chassis; returns the wheel layout so each car sits on its own footprint */
function buildBody(car,add,paint,dark,steel){
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

function buildKart(color,kind,car){
  const root=new THREE.Group();
  const lean=new THREE.Group();root.add(lean);
  const paint=psMat({color}), dark=psMat({color:0x23272e}),
        steel=psMat({color:0xa8b0ba}), skin=psMat({color:0xd8a07c});
  const add=(g,m,x,y,z)=>{const e=new THREE.Mesh(flat(g),m);e.position.set(x,y,z);lean.add(e);return e;};
  const lamps=[];
  const SPEC=buildBody(car||'kart',add,paint,dark,steel);
  const cab=new THREE.Group();lean.add(cab);
  const addc=(g,m,x,y,z)=>{const e=new THREE.Mesh(flat(g),m);e.position.set(x,y,z);cab.add(e);return e;};
  cab.position.set(0,car==='acc'?-.06:(car&&car!=='kart'?.32:0),car&&car!=='kart'?-.25:0);
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
    addc(new THREE.CylinderGeometry(.6,.6,1.25,8),psMat({color:0xd8c47a}),0,1.3,-2.2).rotation.z=Math.PI/2;
  }else if(kind==='billy'){     /* uniform, rutig mössa, varselväst, blåljus */
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
    addc(new THREE.BoxGeometry(1.15,.1,.3),dark,0,1.73,-1.86);
    lamps.push(add(new THREE.BoxGeometry(.44,.26,.3),psMat({color:0x2f78e8,unlit:true}),-.31,1.9,-1.86));
    lamps.push(add(new THREE.BoxGeometry(.44,.26,.3),psMat({color:0xeaf1f8,unlit:true}), .31,1.9,-1.86));
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
    addc(new THREE.CylinderGeometry(.54,.54,1.3,8),psMat({color:0xb9c2cc}),0,1.3,-2.15);
    addc(new THREE.CylinderGeometry(.58,.58,.14,8),psMat({color:0x7e868f}),0,1.98,-2.15);
  }else if(kind==='hillbilly'){                        /* bonnläpp med EPA-stuk */
    const flannel=pixTex(16,16,(g)=>{
      g.fillStyle='#8f2f24';g.fillRect(0,0,16,16);
      g.fillStyle='#2a2320';
      for(let i=0;i<16;i+=8){g.fillRect(i,0,3,16);g.fillRect(0,i,16,3);}
      g.fillStyle='rgba(230,200,150,.35)';
      for(let i=4;i<16;i+=8){g.fillRect(i,0,1,16);g.fillRect(0,i,16,1);}
    });
    const shirt=psMat({map:flannel});
    addc(new THREE.BoxGeometry(.9,.84,.54),shirt,0,1.24,-.62);
    addc(new THREE.BoxGeometry(.26,.22,.88),shirt,-.36,1.12,.02);
    addc(new THREE.BoxGeometry(.26,.22,.88),shirt, .36,1.12,.02);
    addc(new THREE.BoxGeometry(.5,.5,.46),skin,0,1.78,-.6);
    addc(new THREE.BoxGeometry(.44,.2,.12),psMat({color:0x5a4634}),0,1.58,-.34);
    addc(new THREE.BoxGeometry(.46,.16,.06),psMat({color:0x14181c}),0,1.84,-.36);
    addc(new THREE.BoxGeometry(.5,.3,.3),psMat({color:0x6b4a2e}),0,1.66,-.86);  /* mullet */
    addc(new THREE.BoxGeometry(.56,.24,.5),psMat({color:0x2d5a3a}),0,2.1,-.62);
    addc(new THREE.BoxGeometry(.5,.07,.3),psMat({color:0xe0d8c4}),0,2.02,-.34);
    for(const sg of [-1,1]){                            /* älghorn på nosen */
      addc(new THREE.BoxGeometry(.7,.1,.5),psMat({color:0xcfc4a8}),sg*.62,.92,2.05).rotation.z=sg*.4;
      addc(new THREE.BoxGeometry(.16,.1,.34),psMat({color:0xcfc4a8}),sg*.92,1.04,1.8);
    }
    addc(new THREE.BoxGeometry(1.1,.6,.7),psMat({color:0x2f6d3f}),0,1.5,-2.1);  /* backe med öl */
    addc(new THREE.CylinderGeometry(.12,.14,1.7,6),psMat({color:0x6e757b}),-.66,1.85,-1.4).rotation.x=.25;
    addc(new THREE.CylinderGeometry(.12,.14,1.7,6),psMat({color:0x6e757b}), .66,1.85,-1.4).rotation.x=.25;
  }else if(kind==='scholar'){                          /* lundensisk akademiker */
    const gown=psMat({color:0x1d1f24});
    addc(new THREE.BoxGeometry(.84,.84,.52),gown,0,1.24,-.62);
    addc(new THREE.BoxGeometry(.12,.34,.1),psMat({color:0xf2f4f6}),-.1,1.46,-.37);
    addc(new THREE.BoxGeometry(.12,.34,.1),psMat({color:0xf2f4f6}), .1,1.46,-.37);
    addc(new THREE.BoxGeometry(.24,.22,.88),gown,-.36,1.12,.02);
    addc(new THREE.BoxGeometry(.24,.22,.88),gown, .36,1.12,.02);
    addc(new THREE.BoxGeometry(.5,.5,.46),skin,0,1.78,-.6);
    addc(new THREE.BoxGeometry(.54,.3,.42),psMat({color:0x6b5540}),0,1.94,-.72);  /* hair */
    addc(new THREE.BoxGeometry(.16,.16,.05),psMat({color:0x22262c}),-.14,1.8,-.35);
    addc(new THREE.BoxGeometry(.16,.16,.05),psMat({color:0x22262c}), .14,1.8,-.35);
    addc(new THREE.BoxGeometry(.12,.04,.05),psMat({color:0x22262c}),0,1.8,-.35);
    addc(new THREE.BoxGeometry(.6,.14,.56),psMat({color:0xf4f6f8}),0,2.09,-.6);   /* studentmössa */
    addc(new THREE.BoxGeometry(.62,.07,.58),psMat({color:0x1d1f24}),0,2.0,-.6);
    addc(new THREE.BoxGeometry(.63,.05,.59),psMat({color:0xe8c33a}),0,2.05,-.6);
    const books=[0x8b2b1c,0x2a5fa8,0x3f7a33];
    books.forEach((c,q)=>add(new THREE.BoxGeometry(1.0,.22,.72),psMat({color:c}),0,1.32+q*.24,-2.05));
  }else{
    addc(new THREE.BoxGeometry(.78,.78,.5),dark,0,1.22,-.62);
    addc(new THREE.BoxGeometry(.22,.2,.88),skin,-.34,1.12,.02);
    addc(new THREE.BoxGeometry(.22,.2,.88),skin, .34,1.12,.02);
    const helm=add(new THREE.SphereGeometry(.31,6,5),paint,0,1.8,-.6);
    helm.scale.set(1,.94,1.05);
    addc(new THREE.BoxGeometry(.48,.18,.14),psMat({color:0x14181c}),0,1.8,-.32);
  }
  addc(new THREE.BoxGeometry(.5,.12,.5),dark,0,1.18,.55).rotation.x=-.5;

  const tyre=new THREE.CylinderGeometry(SPEC.r,SPEC.r,.4,8);tyre.rotateZ(Math.PI/2);
  const tG=flat(tyre);
  const hubG=flat((function(){const c=new THREE.CylinderGeometry(SPEC.r*.45,SPEC.r*.45,.44,6);c.rotateZ(Math.PI/2);return c;})());
  const wheels=[],pivots=[];
  const mk=(x,z,front)=>{
    const piv=new THREE.Group();piv.position.set(x,SPEC.r,z);lean.add(piv);
    const w=new THREE.Mesh(tG,dark);piv.add(w);
    w.add(new THREE.Mesh(hubG,steel));
    wheels.push(w);if(front)pivots.push(piv);
  };
  mk(-SPEC.fx,SPEC.fz,true);mk(SPEC.fx,SPEC.fz,true);
  mk(-SPEC.rx,SPEC.rz,false);mk(SPEC.rx,SPEC.rz,false);
  return {root,lean,wheels,pivots,lamps};
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

const CHARS=[
  {id:'arne',short:'ARNE',name:'BONDEN ARNE',role:'LANTBRUKARE, ÖSTERLEN',
   color:0x8b2b1c,maxSpeed:39.6,power:28,offRoad:0.80,boostMul:1.32,gripOn:10.2,
   stats:[0.60,0.92,0.96],
   blurb:'Slowest flat out, but he crosses fields for a living. Grass and gravel barely slow him down, and he plants the kart in a corner like a fence post.'},
  {id:'billy',short:'BILLY',name:'POLISEN BILLY BOOL',role:'ORDNINGSMAKTEN',
   color:0x1d4ea8,maxSpeed:43.2,power:25,offRoad:0.48,boostMul:1.50,gripOn:8.3,
   stats:[0.96,0.66,0.32],
   blurb:'The quickest thing on tarmac, and his milk boosts run longer and harder. Put one wheel on the verge and the whole lap is gone.'},
  {id:'cow',short:'MAJROS',name:'KOSSAN MAJROS',role:'MJÖLKKO, VEBERÖD',
   color:0xf0ece2,maxSpeed:38.6,power:30.5,offRoad:0.90,boostMul:1.28,gripOn:11.6,milk:1.45,
   stats:[0.50,1.00,0.98],
   blurb:'Slowest of the lot and she knows it. Four hooves of grip, a field is just a shortcut, and every bottle of milk lasts her half as long again. H to moo.'}
];
let LAPS=3;
const ROSTER=[
  {name:'DU',     color:0xd8362a,ai:false,kind:'generic'},
  /* en ko: tung, seg, men oslagbar i åkern */
  {name:'MAJROS', color:0xf0ece2,ai:true,kind:'cow',car:'t240',
   maxSpeed:39.8,power:31,offRoad:.90,boostMul:1.26,gripOn:12.2,
   lineSpread:1.3,caution:3.0,lookAdd:3,driftLove:0.55,lean:{rough:-0.6}},
  /* bonnläppen: snabbast rakt fram, hopplös i kurvorna */
  {name:'ROGER',  color:0x8f2f24,ai:true,kind:'hillbilly',car:'acc',
   maxSpeed:44.8,power:25,offRoad:.52,boostMul:1.58,gripOn:7.9,
   lineSpread:4.8,caution:2.0,lookAdd:-3,driftLove:1.40,lean:{risk:0.5}},
  /* akademikern: perfekt linje, bromsar i tid, aldrig utanför */
  {name:'LINNÉA', color:0x1d1f24,ai:true,kind:'scholar',car:'t96',
   maxSpeed:42.8,power:28,offRoad:.66,boostMul:1.36,gripOn:10.8,
   lineSpread:0.6,caution:2.8,lookAdd:7,driftLove:1.05,lean:{risk:1.5,traffic:1.5}},
  {name:'NISSE',  color:0x1fa8a0,ai:true,kind:'generic',car:'t96',
   maxSpeed:42.4,power:27,offRoad:.62,boostMul:1.38,gripOn:9.9,
   lineSpread:3.0,caution:2.6,lookAdd:1,driftLove:1.15,lean:{traffic:2}},
  {name:'BRITTA', color:0x5faf4a,ai:true,kind:'generic',car:'t240',
   maxSpeed:41.6,power:26,offRoad:.60,boostMul:1.38,gripOn:10.0,
   lineSpread:3.4,caution:2.7,lookAdd:2,driftLove:0.85,lean:{fuel:2,defend:true}}
];
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
    fuel:TANK,atPump:false,warned:0,held:null,shield:0,spun:0,burn:1,spinResist:1,milk:1,
    rib:0,plan:0,planned:{},mi:0,recoverT:0,ghost:0,stuckT:0,stuckP:-1e9,bandMax:1.16,rival:false,
    maxSpeed:41,power:25,offRoad:.58,boostMul:1.36,gripOn:9.0};
});
const player=karts[0];
scene.remove(player.v.root);                       /* retire the placeholder */
