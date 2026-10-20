"use strict";
/* ───────── west-coast crew ───────── */
/* The six west-coast drivers and their vehicles: the two cup champions, Regnmolnet (Västgötacupen)
   and Hamnkranen (Göteborgscupen), and Slusstrollet, Aspenmonstret, Kapten Mås and Domaren.
   Vehicles follow js/30-vehicles.js (one shape, one colour, one moving prop each); drivers follow
   buildChampion in js/30-karts.js. Everything here is looks only. */
const WEST_KINDS=['regnmolnet','hamnkranen','slusstrollet','aspenmonstret','kaptenmas','domaren'];

Object.assign(VEHICLES,{
  /* Regnmolnet: Borås Molnvagn, a thundercloud on a low chassis that rains on its own wheels */
  molnvagn(add,paint,dark,steel,A){
    const grey=psMat({color:A.color}),deep=psMat({color:0x4a525c}),ball=new THREE.IcosahedronGeometry(1,0);
    add(VB(1.9,.4,3.4),dark,0,.62,0);
    for(const [x,y,z,s] of [[0,1.15,1.3,.95],[-.75,1.05,.3,.85],[.75,1.05,.3,.85],[0,1.2,-1.4,1.0],[-.8,1.0,-1.0,.75],[.8,1.0,-1.0,.75],[0,1.55,-.6,.7]]){
      const b=add(ball,s>.8?grey:deep,x,y,z);b.scale.set(s*1.15,s*.62,s);}
    const bolt=add(VB(.16,.7,.06),psMat({color:0xffe04a,unlit:true}),.9,1.15,1.6);bolt.rotation.z=.5;
    /* rain under the cloud, falling past the wheels */
    const drops=[];
    for(let n=0;n<10;n++)drops.push(A.put(A.grp((n%5-2)*.42,0,n<5?1.3:-1.3),VB(.05,.32,.05),psMat({color:0x8fc4ff,unlit:true}),0,0,0));
    A.anim.push(k=>{
      drops.forEach((d,n)=>{d.position.y=.9-((clock*2.2+n*.37)%1)*.8;});
      bolt.visible=k.boost>0?Math.floor(clock*12)%2===0:Math.floor(clock*.7)%5===0;
    });
    return {fx:1.0,fz:1.35,rx:1.0,rz:-1.35,r:.4,hub:0x4a525c,hubK:.6,cy:.32,cz:-.1};
  },

  /* Hamnkranen: Hisinge Kranbil, a harbour crane on a lorry chassis with a container on the back */
  kranbil(add,paint,dark,steel,A){
    const orange=psMat({color:A.color}),stripe=psMat({map:pixTex(16,4,g=>{for(let x=0;x<16;x+=4){g.fillStyle='#f2d21a';g.fillRect(x,0,2,4);g.fillStyle='#15161a';g.fillRect(x+2,0,2,4);}})});
    add(VB(2.1,.5,4.4),dark,0,.7,0);
    add(VB(2.0,.6,1.3),orange,0,1.2,1.6);                                 /* a low bonnet: the crane drives itself */
    add(VB(1.6,.3,.06),psMat({color:0x2b3a4a}),0,1.2,2.26);               /* the grille */
    add(VB(2.12,.2,.06),stripe,0,.86,2.24);                               /* hazard stripes */
    add(VB(2.0,.95,1.7),psMat({color:0x2a6ab8}),0,1.4,-1.4);              /* the container */
    for(let x=-.8;x<=.8;x+=.4)add(VB(.06,.9,1.72),psMat({color:0x1f528e}),x,1.4,-1.4);
    /* the slewing boom over the driver, with the hook swinging off its tip */
    const slew=A.grp(0,2.08,-1.6);                                        /* on the container's roof, behind the driver */
    A.put(slew,VB(.7,.4,.7),orange,0,0,0);
    const boom=A.grp(0,.15,0,slew);boom.rotation.x=-.6;
    A.put(boom,VB(.26,.26,4.2),orange,0,0,2.1);
    for(let z=.3;z<4.1;z+=.5)A.put(boom,VB(.3,.04,.04),dark,0,.15,z);
    const tip=A.grp(0,0,4.2,boom),hook=A.grp(0,0,0,tip);
    A.put(hook,VB(.03,1.1,.03),dark,0,-.55,0);
    A.put(hook,new THREE.TorusGeometry(.16,.05,4,8,Math.PI*1.4),steel,0,-1.2,0).rotation.z=2.4;
    const beacon=add(VB(.24,.2,.24),psMat({color:0xffb020,unlit:true}),.7,2.1,1.6);
    A.anim.push(k=>{
      const st=k.ai?k.aiSteer:input.steer;
      slew.rotation.y=lerp(slew.rotation.y,-st*.5,.08);
      tip.rotation.x=-boom.rotation.x;                                     /* the hook hangs plumb */
      hook.rotation.x=lerp(hook.rotation.x,clamp(-k.speed*.012,-.5,.5)+Math.sin(clock*3)*.08,.1);
      hook.rotation.z=lerp(hook.rotation.z,st*.3,.1);
      beacon.visible=Math.floor(clock*4)%2===0;
    });
    return {fx:1.05,fz:1.6,rx:1.05,rz:-1.5,r:.5,rr:.55,fw:.42,rw:.5,cy:.42,cz:.2};
  },

  /* Slusstrollet: Trollhätte Stenkärra, hewn out of the lock wall, moss and all */
  stenkart(add,paint,dark,steel,A){
    const stone=psMat({color:A.color}),dk=psMat({color:0x5a5e64}),moss=psMat({color:0x4f7a34});
    add(VB(2.1,.7,3.6),stone,0,.85,0);
    for(const [x,z,w,d] of [[-.6,1.2,.8,.9],[.5,1.3,.9,.7],[-.5,-1.2,.9,1.0],[.6,-1.1,.7,.8]])add(VB(w,.12,d),dk,x,1.25,z);
    add(VB(1.9,.5,.9),stone,0,1.3,1.5).rotation.x=-.2;
    add(VB(1.0,.14,1.2),moss,-.4,1.22,-.3);add(VB(.6,.1,.5),moss,.6,1.62,1.4);
    add(VB(2.2,.9,.5),stone,0,1.3,-1.75);                                 /* a slab for a seat back */
    /* the lock wheel on the back turns as he drives */
    const wheel=A.grp(0,1.55,-2.05);
    A.put(wheel,new THREE.TorusGeometry(.5,.07,4,10),steel,0,0,0);
    for(let n=0;n<4;n++)A.put(wheel,VB(.06,1.0,.06),steel,0,0,0).rotation.z=n*Math.PI/4;
    A.anim.push(k=>{wheel.rotation.z+=k.speed*.004;});
    return {fx:1.1,fz:1.35,rx:1.1,rz:-1.4,r:.52,fw:.5,rw:.56,hub:0x6a6e74,hubK:.75,cy:.36,cz:-.15};
  },

  /* Aspenmonstret: Aspenekan, a rowing boat on wheels; it rows harder in a boost */
  ekan(add,paint,dark,steel,A){
    const hull=psMat({color:A.color}),plank=psMat({color:0x5a3a22}),reed=psMat({color:0x6a8a3a}),water=psMat({color:0x6fb8e8,unlit:true});
    add(VB(1.8,.7,3.4),hull,0,.95,0);
    add(VB(1.3,.6,1.0),hull,0,1.1,2.0).rotation.x=-.5;
    add(VB(1.5,.6,.5),hull,0,1.05,-1.8);
    for(const y of [.75,1.05])for(const g of [-1,1])add(VB(.03,.06,3.4),plank,g*.91,y,0);
    add(VB(1.7,.08,.4),plank,0,1.3,1.0);add(VB(1.7,.08,.4),plank,0,1.3,-1.2);  /* thwarts */
    for(const [x,z] of [[-.7,-1.6],[.6,1.9],[.2,-1.75]])add(VB(.08,.6,.08),reed,x,1.55,z);
    const oars=[];
    for(const g of [-1,1]){const o=A.grp(g*.92,1.32,.1);A.put(o,VB(.06,.06,1.8),plank,g*.5,-.35,0).rotation.z=g*.8;
      A.put(o,VB(.04,.3,.36),plank,g*1.15,-.95,0);oars.push([o,g]);}
    const splash=[-1,1].map(g=>add(VB(.5,.2,.5),water,g*2.0,.2,.1));
    A.anim.push(k=>{
      const f=k.boost>0?14:3+k.speed*.1,a=Math.sin(clock*f);
      for(const [o,g] of oars){o.rotation.y=a*.6*g;o.rotation.z=Math.cos(clock*f)*.2*g;}
      for(const s of splash)s.visible=k.speed>8&&a>.6;
    });
    return {fx:1.0,fz:1.3,rx:1.0,rz:-1.3,r:.42,hub:0xd8dde2,hubK:.5,cy:.3,cz:-.1};
  },

  /* Kapten Mås: Räkbåten, a little shrimp trawler on wheels with its net up and a shrimp on the roof */
  rakbat(add,paint,dark,steel,A){
    const hull=psMat({color:A.color}),white=psMat({color:0xf2f2f4}),red=psMat({color:0xd8362a}),
          wood=psMat({color:0x8a6a44}),pink=psMat({color:0xf08a6a}),net=psMat({color:0x3a4a3a});
    add(VB(1.9,.8,3.6),hull,0,.9,0);
    add(VB(1.4,.8,1.1),hull,0,1.05,2.05).rotation.x=-.45;
    add(VB(1.94,.12,3.64),white,0,1.34,0);                                /* the gunwale stripe */
    add(VB(1.4,1.1,1.0),white,0,1.85,-1.2);                               /* wheelhouse */
    add(VB(1.42,.32,1.02),psMat({color:0x2b3a4a}),0,2.05,-1.2);
    add(VB(1.5,.1,1.1),red,0,2.45,-1.2);
    const ring=add(new THREE.TorusGeometry(.32,.1,4,10),red,1.0,1.6,.3);ring.rotation.y=Math.PI/2;
    add(VB(.1,2.4,.1),wood,0,2.3,-1.95);                                  /* mast at the stern, the net on its boom */
    add(VB(.08,.08,1.6),wood,0,3.2,-2.5).rotation.x=-.5;
    add(VB(.06,.6,.5),net,0,2.7,-2.9);
    /* a giant shrimp on the wheelhouse roof, waving its feelers */
    const shrimp=A.grp(0,2.65,-1.2);
    for(let n=0;n<4;n++)A.put(shrimp,VB(.36-n*.06,.3-n*.04,.3),pink,0,.12+Math.sin(n*.8)*.15,.4-n*.28);
    const feel=[-1,1].map(g=>{const f=A.grp(g*.08,.2,.5,shrimp);A.put(f,VB(.03,.03,.8),pink,0,0,.4);return f;});
    A.anim.push(k=>{
      feel.forEach((f,g)=>{f.rotation.y=(g?-1:1)*(.3+Math.sin(clock*5+g)*.2);f.rotation.x=-.3+Math.sin(clock*3)*.1;});
      shrimp.rotation.z=Math.sin(clock*2)*.06;
    });
    return {fx:1.0,fz:1.4,rx:1.05,rz:-1.4,r:.44,hub:0xf2f2f4,hubK:.5,cy:.3,cz:.25};
  },

  /* Domaren: Planvagnen, the groundsman's buggy with a striped canopy, corner flags and a chalk liner */
  domarvagn(add,paint,dark,steel,A){
    const body=psMat({color:A.color}),white=psMat({color:0xf4f6f8}),
          stripes=psMat({map:pixTex(8,8,g=>{for(let x=0;x<8;x+=2){g.fillStyle=x%4?'#15161a':'#f4f6f8';g.fillRect(x,0,2,8);}}),side:THREE.DoubleSide}),
          flag=psMat({color:0xf2d21a,side:THREE.DoubleSide}),grass=psMat({color:0x4f9a3a});
    add(VB(1.9,.55,3.5),body,0,.8,0);
    add(VB(1.8,.5,.9),body,0,1.1,1.5);
    add(VB(1.9,.08,3.3),grass,0,1.1,-.2);                                 /* a strip of turf on the floor */
    for(const [x,z] of [[-.85,1.0],[.85,1.0],[-.85,-1.4],[.85,-1.4]])add(VB(.08,1.8,.08),steel,x,2.0,z);
    add(VB(2.0,.08,2.8),stripes,0,2.9,-.2);                               /* the referee's canopy */
    const flags=[];
    for(const g of [-1,1]){add(VB(.04,1.2,.04),white,g*.95,3.4,-1.5);
      const f=A.grp(g*.95,3.8,-1.5);A.put(f,VB(.04,.34,.5),flag,0,0,-.25);flags.push(f);}
    /* the chalk liner on the back draws a white line when it rolls */
    add(VB(.5,.5,.5),white,0,.75,-2.0);
    const chalk=add(VB(.3,.04,1.2),white,0,.06,-2.6);
    A.anim.push(k=>{
      flags.forEach((f,g)=>{f.rotation.y=Math.sin(clock*(6+k.speed*.2)+g)*.4;});
      chalk.visible=k.speed>3&&!k.air;
    });
    return {fx:1.0,fz:1.3,rx:1.0,rz:-1.35,r:.38,hub:0xf4f6f8,hubK:.55,cy:.3,cz:-.1};
  }
});

/** the six west-coast drivers in the seat; same frame as buildChampion (cab at the steering wheel) */
function buildWestDriver(kind,addc,add,skin,dark,car){
  const B=(w,h,d)=>new THREE.BoxGeometry(w,h,d),ball=new THREE.IcosahedronGeometry(1,0);
  const eyes=(y,z,gap,big)=>{const w=psMat({color:0xf4f6f8}),p=psMat({color:0x15161a});
    for(const s of [-1,1]){addc(B(big,big,.06),w,s*gap,y,z);addc(B(big*.45,big*.45,.06),p,s*gap,y-.01,z+.02);}};
  if(kind==='regnmolnet'){                  /* Regnmolnet: a grumpy cloud with a raindrop on its cheek */
    const grey=psMat({color:0x8a94a0}),deep=psMat({color:0x5a636e});
    for(const [x,y,z,s,m] of [[0,1.3,-.6,.55,grey],[-.42,1.15,-.6,.38,deep],[.42,1.15,-.6,.38,deep],[0,1.88,-.6,.48,grey],[-.36,2.08,-.66,.3,grey],[.34,2.1,-.62,.32,grey]]){
      const b=addc(ball,m,x,y,z);b.scale.set(s*1.2,s,s);}
    for(const s of [-1,1])addc(B(.2,.18,.8),deep,s*.42,1.12,.0);
    eyes(1.92,-.15,.16,.16);
    addc(B(.36,.05,.05),psMat({color:0x2a2e34}),0,1.76,-.14).rotation.z=.12;  /* a sulky mouth */
    addc(B(.08,.14,.06),psMat({color:0x8fc4ff,unlit:true}),.3,1.78,-.14);
    for(const s of [-1,1])addc(B(.22,.05,.05),psMat({color:0x2a2e34}),s*.16,2.06,-.14).rotation.z=s*.35;  /* frown */
  }else if(kind==='hamnkranen'){            /* Hamnkranen: a crane cab for a head, a jib for an arm, hazard stripes */
    const orange=psMat({color:0xf08a1c}),yel=psMat({color:0xf2d21a}),glass=psMat({color:0x9fd8ff}),steelM=psMat({color:0x4a4e56});
    addc(B(1.0,.86,.62),orange,0,1.24,-.6);
    for(let n=0;n<3;n++)addc(B(.2,.12,.64),yel,-.3+n*.3,1.0,-.6).rotation.z=.6;
    for(const s of [-1,1])addc(B(.24,.24,.86),steelM,s*.42,1.12,.02);
    addc(B(.72,.6,.62),orange,0,1.95,-.6);                                 /* the cab */
    addc(B(.6,.32,.05),glass,0,2.0,-.28);
    eyes(2.0,-.25,.14,.14);
    addc(B(.76,.08,.66),steelM,0,2.28,-.6);
    const jib=addc(B(.16,.16,1.9),orange,.5,2.5,-1.0);jib.rotation.x=.75;
    addc(B(.02,.6,.02),steelM,.5,2.55,-1.75);
    addc(B(.16,.1,.16),steelM,.5,2.22,-1.75);
    addc(B(.12,.12,.12),psMat({color:0xffb020,unlit:true}),-.28,2.38,-.6);
  }else if(kind==='slusstrollet'){          /* Slusstrollet: a stone troll with moss for hair and a nose like a boulder */
    const stone=psMat({color:0x7a8274}),moss=psMat({color:0x4f7a34}),vest=psMat({color:0x2f5a8a});
    addc(B(1.1,.92,.66),stone,0,1.24,-.62);
    addc(B(1.12,.5,.1),vest,0,1.28,-.28);
    for(const s of [-1,1])addc(B(.32,.3,.88),stone,s*.46,1.12,.02);
    const h=addc(ball,stone,0,1.92,-.6);h.scale.set(.42,.38,.38);
    addc(B(.24,.26,.3),stone,0,1.86,-.18);                                 /* the nose */
    eyes(2.02,-.26,.16,.1);
    for(const s of [-1,1])addc(B(.24,.12,.08),stone,s*.44,1.98,-.6).rotation.z=s*.4;
    addc(B(.7,.18,.6),moss,0,2.25,-.62);addc(B(.2,.3,.2),moss,.18,2.38,-.7);
    addc(B(.08,.12,.06),psMat({color:0xeee4c8}),-.1,1.66,-.24);addc(B(.08,.12,.06),psMat({color:0xeee4c8}),.1,1.66,-.24);
  }else if(kind==='aspenmonstret'){         /* Aspenmonstret: a shy lake monster, long neck, fins and a weed fringe */
    const hide=psMat({color:0x3f8a5a}),belly=psMat({color:0x9ac88a}),fin=psMat({color:0x2a6a8a}),weed=psMat({color:0x6a8a3a});
    addc(B(.9,.84,.6),hide,0,1.22,-.62);
    addc(B(.6,.6,.1),belly,0,1.2,-.3);
    for(const s of [-1,1])addc(B(.22,.2,.86),hide,s*.4,1.1,.02);
    addc(B(.3,.6,.3),hide,0,1.85,-.55).rotation.x=.25;                     /* the neck */
    addc(B(.56,.42,.66),hide,0,2.2,-.4);
    eyes(2.32,-.04,.15,.18);
    for(const s of [-1,1])addc(B(.06,.3,.24),fin,s*.3,2.42,-.5).rotation.z=-s*.5;
    for(let n=0;n<4;n++)addc(B(.08,.3,.06),weed,-.18+n*.12,2.36,-.1);
    for(let n=0;n<3;n++)addc(B(.1,.22,.18),fin,0,1.72-n*.24,-.98);         /* fins down the back */
  }else if(kind==='kaptenmas'){             /* Kapten Mås: a seagull in a captain's cap, wings on the wheel */
    const white=psMat({color:0xf4f6f8}),grey=psMat({color:0x9aa2ac}),beak=psMat({color:0xf0c030}),
          navy=psMat({color:0x1a2a4a}),gold=psMat({color:0xe8c33a});
    const b=addc(ball,white,0,1.3,-.6);b.scale.set(.5,.52,.4);
    for(const s of [-1,1])addc(B(.12,.5,.9),grey,s*.48,1.25,-.25).rotation.x=-.5;   /* wings forward to the wheel */
    const h=addc(ball,white,0,1.95,-.5);h.scale.set(.32,.3,.32);
    addc(B(.12,.1,.42),beak,0,1.88,-.08);addc(B(.06,.06,.06),psMat({color:0xd8362a}),0,1.84,.1);
    eyes(2.02,-.2,.13,.09);
    addc(new THREE.CylinderGeometry(.3,.3,.18,8),navy,0,2.26,-.5);
    addc(B(.5,.05,.24),navy,0,2.18,-.24);
    addc(B(.16,.1,.04),gold,0,2.26,-.2);
  }else{                                    /* Domaren: striped shirt, bald head, a moustache and the whistle */
    const strip=psMat({map:pixTex(8,8,g=>{for(let x=0;x<8;x+=2){g.fillStyle=x%4?'#15161a':'#f4f6f8';g.fillRect(x,0,2,8);}})}),
          blk=psMat({color:0x15161a}),silver=psMat({color:0xc6ced6});
    addc(B(.92,.86,.56),strip,0,1.24,-.6);
    addc(B(.94,.12,.58),blk,0,1.62,-.6);
    for(const s of [-1,1]){addc(B(.25,.23,.5),strip,s*.37,1.14,-.28);addc(B(.21,.19,.4),skin,s*.35,1.13,.15);}
    addc(B(.5,.5,.46),skin,0,1.84,-.6);
    addc(B(.52,.12,.4),psMat({color:0x6a4a32}),0,1.76,-.66);               /* what is left of the hair */
    addc(B(.3,.08,.06),psMat({color:0x4a3524}),0,1.72,-.36);               /* the moustache */
    eyes(1.9,-.35,.12,.09);
    addc(B(.12,.1,.12),skin,0,1.8,-.34);
    addc(B(.04,.36,.04),blk,0,1.46,-.31);                                 /* the whistle on its cord */
    addc(B(.14,.1,.18),silver,0,1.3,-.28);
    addc(B(.14,.2,.04),psMat({color:0xf2d21a}),.3,1.36,-.31);             /* a yellow card in the pocket */
  }
}
