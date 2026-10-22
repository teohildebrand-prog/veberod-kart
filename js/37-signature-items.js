"use strict";
/* ───────── signature items ───────── */
/* Every driver has their own signature item, and since Teo asked for more chaos anyone can
   get any of them: a box first rolls SIG_CHANCE for a signature item, then the five families as
   usual. Within that roll the driver's own item is SIG_OWN times as likely as each of the others.
   One fixed form, no levels; the HUD shows a star, and the box roulette
   spins past them with the rest. The AI plays them too. */
const SIG_CHANCE=0.25, SIG_OWN=2;
/* Signaturläge (Teo, for more chaos): a toggle on the stage picker and in the cup setup. Every box,
   and every loose Spettekaka on the road, hands out a signature item instead, for the bots too.
   An event track's own items (Sibyllas meny) replace everything there, Signaturläge or not.
   Set for each race in resetRace from the picker or the running cup. */
let sigMode=false,sigModeSel=false;
const SIG_ALIAS={granny:'britta',ghost:'spoket'};  /* AI kinds that are a driver under another id */
const sigOf=id=>SIGS[id]?id:(SIG_ALIAS[id]||null);
/** the drivers' items; an event's own item (SIGS[id].event) only comes out of its own boxes */
const sigPool=()=>Object.keys(SIGS).filter(id=>!SIGS[id].event);
/** which signature item a box hands k */
function pickSig(k){
  const ids=sigPool(),w={};
  for(const id of ids)w[id]=id===k.sig?SIG_OWN:1;
  return pickWeighted(ids,w);
}
const sigWrap=d=>d>N/2?d-N:(d<-N/2?d+N:d);       /* samples between two points on the loop, signed */
/** k's item went off with nobody to hit: it is spent all the same, so a leader is never stuck
    holding it and the slot is free for the next box */
function sigMiss(k,why){
  if(k===player){toast(why);ping(300,240,.08);}
}

/* Bogserlinan (Arne): a hemp rope with a hay hook, thrown at the kart ahead like the Spettigare
   kaka (it rides the hook code in 37-power-ups.js), but it reaches further and tows instead of
   launching: the thrower is pulled along steadily, the one in front feels the drag, and lets go
   with a slingshot just short of their bumper. The towed driver shakes it off by drifting. */
const TOW={
  reach:1.0,        /* seconds the rope flies before it counts as a miss */
  home:55,          /* how far up the road it looks for someone to hook */
  time:2.8,         /* the longest tow */
  push:30,          /* extra forward pull while towed, m/s² */
  top:1.28,         /* top speed on the rope, as a share of your own */
  drag:0.88,        /* the towed kart's top speed, as a share of its own */
  grace:0.35,       /* seconds after the bite before a drift can shake it off */
  sling:0.9         /* boost on release */
};
/* Cykla mer! (Björn): a few seconds on the bike off the roof rack. Pedalling is a gentle boost
   (less than milk) and costs no fuel, and a bike is too small to hit: rockets, traps, beans and
   other karts all pass by. Björn rides in his blazer; anyone else in their own colour. */
const BIKE={time:4.0,top:1.12,push:14,grip:1.25};
/* Färdplanen (Amanda): the map unfolds and the ideal line glows on the road ahead. On it you
   get more grip and a little speed; off it, nothing. Everyone can see the line. */
const PLAN={time:5.0,w:2.4,top:1.07,push:7,grip:1.35,marks:22,gap:3};
/* Visa körkortet! (Billy): blue lights, and the next kart up the road is waved over. It slows
   right down for a moment and holds up a licence. A shield refuses to stop. */
const LIC={reach:80,time:1.3,top:0.16,siren:1.4};
/* Kreatursöverfarten (Majros): a small herd wanders across the road a stretch in front of
   whoever leads (the next one down if that is you). Gaps between the cows leave room to slip
   through; a cow knocks you aside and slows you. Majros herself they let past. */
const HERD={ahead:70,n:3,walk:4.4,space:4.4,slow:1.0,push:7};
/* Kompisarna (Mehmet): two mates on mopeds ride just in front for four seconds. You start in
   their slipstream with a boost and keep a draft the whole time; Mehmet's Suget keeps charging
   off them as if they were rivals. */
const MATES={time:4.0,boost:1.2,top:1.06,push:8};
/* Gödselspridaren (Anders): the spreader throws muck behind for three seconds and the road turns
   into mud patches for a while. Road karts slow down in it, off-road karts barely notice. The one
   who spread it drives through their own muck. */
const MUCK={time:3.0,every:0.1,life:12,r:2.4,grip:0.7,cap:40};
const muckTop=k=>0.55+0.45*k.offRoad;
/* Tifot (Teo): a huge green-and-black GAIS scarf goes up and everyone in front sees stripes for
   two seconds. The player's screen is half covered, never the road just ahead; the AI wobbles.
   GAIS is Teo's own exception to the no-real-brands rule: name, colours and scarf only. */
const TIFO={reach:90,time:2.2,top:0.92};
/* Garnnystanet (Britta): a ball of knitting wool drops off the back and rolls across the road,
   unravelling. The yarn covers most of the road from her side, leaving a gap on the other;
   driving over it tangles the wheels and takes the grip. Jump it or go round. */
const YARN={back:10,span:1.24,roll:0.7,life:14,slick:1.4,slow:0.45};
/* Tidtagningsrättelse (Victor): the timekeepers correct the clock and everyone near him stops
   dead for a moment, frozen in a block of ice. Victor drives on. */
const FREEZE={r:24,time:1.3};

const SIGS={
  arne:{name:'BOGSERLINAN',lane:false,
    text:'Kasta repet på bilen framför och bli bogserad. Släpper med en slangbella. Sladda för att slita dig loss.',
    use:fireTow,ai:s=>s.near,
    icon:`<svg viewBox="0 0 48 48">
    <circle cx="20" cy="26" r="13" fill="none" stroke="#a8823f" stroke-width="5"/>
    <circle cx="20" cy="26" r="13" fill="none" stroke="#e3c98a" stroke-width="2" stroke-dasharray="3 3"/>
    <circle cx="20" cy="26" r="7" fill="none" stroke="#c9a163" stroke-width="3.4"/>
    <path d="M31 18Q38 12 42 6" fill="none" stroke="#c9a163" stroke-width="3" stroke-linecap="round"/>
    <path d="M42 6v9a5 5 0 0 1-9 2" fill="none" stroke="#6a727c" stroke-width="3.2" stroke-linecap="round"/></svg>`},
  billy:{name:'VISA KÖRKORTET!',lane:false,
    text:'Blåljus! Bilen framför vinkas in, tvärbromsar och visar körkortet. En sköld vägrar stanna.',
    use:pullOver,ai:(s,k)=>!!licTarget(k),
    icon:`<svg viewBox="0 0 48 48">
    <rect x="6" y="14" width="30" height="20" rx="2" fill="#f4b8c8" stroke="#8a3a52" stroke-width="2"/>
    <rect x="10" y="18" width="9" height="11" fill="#7a8a9a"/><path d="M22 20h10M22 24h10M22 28h7" stroke="#8a3a52" stroke-width="2"/>
    <rect x="28" y="4" width="14" height="7" rx="2" fill="#2a6aff"/><rect x="35" y="4" width="7" height="7" rx="2" fill="#ff3a3a"/>
    <path d="M35 11v4" stroke="#23272e" stroke-width="2"/></svg>`},
  cow:{name:'KREATURSÖVERFARTEN',
    text:'En liten flock kor vandrar över vägen framför ledaren. Det finns luckor att smita igenom. MUUU!',
    use:sendHerd,ai:()=>true,
    icon:`<svg viewBox="0 0 48 48">
    <rect x="8" y="16" width="26" height="15" rx="4" fill="#f4f0e6" stroke="#23272e" stroke-width="2"/>
    <path d="M14 16h7v7h-7zM25 23h6v8h-6z" fill="#23272e"/>
    <rect x="32" y="12" width="10" height="11" rx="3" fill="#f4f0e6" stroke="#23272e" stroke-width="2"/>
    <rect x="35" y="19" width="7" height="5" rx="2" fill="#f2a0b0"/>
    <path d="M33 12l-2-4M41 12l2-4" stroke="#c9b48a" stroke-width="2.4" stroke-linecap="round"/>
    <path d="M11 31v9M17 31v9M26 31v9M31 31v9" stroke="#23272e" stroke-width="3"/>
    <path d="M2 44h44" stroke="#8a8f96" stroke-width="2" stroke-dasharray="4 3"/></svg>`},
  bjorn:{name:'CYKLA MER!',
    text:'Hoppa upp på cykeln från takräcket i fyra sekunder. Lite extra fart, ingen bensin, och inget kan träffa dig.',
    use:rideBike,ai:s=>s.behind||s.close||Math.random()<0.004,
    icon:`<svg viewBox="0 0 48 48" fill="none" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="11" cy="32" r="8.5" stroke="#23272e" stroke-width="3"/><circle cx="37" cy="32" r="8.5" stroke="#23272e" stroke-width="3"/>
    <path d="M11 32 19 18H33L37 32M19 18 24 32 33 18M24 32H11" stroke="#2f8a5a" stroke-width="3"/>
    <path d="M17 13h6M33 18 31 11h5" stroke="#6b4a2a" stroke-width="3"/></svg>`},
  mehmet:{name:'KOMPISARNA',
    text:'Två kompisar på moppe kör framför dig i fyra sekunder. Du ligger i deras sug hela tiden.',
    use:callMates,ai:s=>!s.close||s.behind,
    icon:`<svg viewBox="0 0 48 48" fill="none" stroke-linecap="round">
    <circle cx="8" cy="36" r="5" stroke="#23272e" stroke-width="3"/><circle cx="22" cy="36" r="5" stroke="#23272e" stroke-width="3"/>
    <path d="M8 36l5-9h8l1 9" stroke="#ff7a1a" stroke-width="4"/><circle cx="15" cy="20" r="4" fill="#ff7a1a"/>
    <circle cx="27" cy="28" r="5" stroke="#23272e" stroke-width="3"/><circle cx="41" cy="28" r="5" stroke="#23272e" stroke-width="3"/>
    <path d="M27 28l5-9h8l1 9" stroke="#2fb85a" stroke-width="4"/><circle cx="34" cy="12" r="4" fill="#2fb85a"/></svg>`},
  anders:{name:'GÖDSELSPRIDAREN',lane:false,
    text:'Spridaren sprutar gödsel bakåt i tre sekunder. Vägen blir lera en stund: bromsar vägbilar, terrängbilar märker knappt.',
    use:spreadMuck,ai:s=>s.behind,
    icon:`<svg viewBox="0 0 48 48">
    <rect x="22" y="14" width="20" height="16" rx="2" fill="#d8461c" stroke="#7a2410" stroke-width="2"/>
    <circle cx="30" cy="34" r="6" fill="#23272e"/><circle cx="30" cy="34" r="2.4" fill="#c9ccd2"/>
    <circle cx="14" cy="18" r="3.4" fill="#6b4a2a"/><circle cx="8" cy="26" r="3" fill="#6b4a2a"/>
    <circle cx="14" cy="30" r="2.6" fill="#5a3d1e"/><circle cx="5" cy="15" r="2.2" fill="#5a3d1e"/>
    <ellipse cx="13" cy="42" rx="11" ry="3.4" fill="#5a3d1e"/></svg>`},
  teo:{name:'TIFOT',
    text:'En jättelik grönsvart GAIS-halsduk åker upp. Alla framför dig ser bara ränder i två sekunder. KOM IGEN NU, GAIS!',
    use:raiseTifo,ai:(s,k)=>tifoTargets(k).length>0&&(s.near||Math.random()<0.01),
    icon:`<svg viewBox="0 0 48 48">
    <path d="M4 12h40v18H4z" fill="#1f9a4a"/><path d="M10 12h6v18h-6zM22 12h6v18h-6zM34 12h6v18h-6z" fill="#15161a"/>
    <path d="M6 30v10M10 30v8M38 30v8M42 30v10" stroke="#1f9a4a" stroke-width="2.4"/>
    <path d="M4 12h40" stroke="#f4f0e6" stroke-width="2"/></svg>`},
  amanda:{name:'FÄRDPLANEN',
    text:'Vik upp kartan: idealspåret lyser på vägen i fem sekunder. Håll dig på det för mer grepp och lite fart.',
    use:unfoldPlan,ai:()=>true,
    icon:`<svg viewBox="0 0 48 48">
    <path d="M4 10 17 6 31 10 44 6V38L31 42 17 38 4 42Z" fill="#f4ecd2" stroke="#8a7a52" stroke-width="2" stroke-linejoin="round"/>
    <path d="M17 6V38M31 10V42" stroke="#c9bb92" stroke-width="1.6"/>
    <path d="M9 34Q14 18 22 24T39 12" fill="none" stroke="#1fb3d8" stroke-width="3" stroke-dasharray="4 3" stroke-linecap="round"/>
    <circle cx="39" cy="12" r="3" fill="#e0362a"/></svg>`},
  britta:{name:'GARNNYSTANET',lane:false,
    text:'Ett garnnystan rullar över vägen bakom dig och nystar upp sig. Den som kör över garnet trasslar in sig.',
    use:dropYarn,ai:s=>s.behind,
    icon:`<svg viewBox="0 0 48 48" fill="none">
    <circle cx="16" cy="22" r="12" fill="#d8365a"/>
    <path d="M7 15q9 4 18-2M5 22q11 5 22-3M8 30q9 2 17-6M12 11q2 10 10 22" stroke="#f08aa0" stroke-width="2"/>
    <path d="M26 30q6 8 10 2t10 4" stroke="#d8365a" stroke-width="3" stroke-linecap="round"/>
    <path d="M34 4l8 14M38 4l4 14" stroke="#c9a163" stroke-width="2.4" stroke-linecap="round"/></svg>`},
  victor:{name:'TIDTAGNINGSRÄTTELSE',
    text:'Tidtagarna rättar klockan: alla nära dig fryser till is en stund. Du kör vidare.',
    use:freezeTime,ai:(s,k)=>freezeTargets(k).length>0,
    icon:`<svg viewBox="0 0 48 48">
    <circle cx="24" cy="27" r="16" fill="#d8f3ff" stroke="#23272e" stroke-width="3"/>
    <rect x="20" y="4" width="8" height="5" rx="1.5" fill="#23272e"/><path d="M24 9v3M36 13l3-3" stroke="#23272e" stroke-width="3" stroke-linecap="round"/>
    <path d="M24 27V16M24 27l7 4" stroke="#e0362a" stroke-width="3" stroke-linecap="round"/>
    <path d="M10 41l5-5M38 41l-5-5M24 45v-4" stroke="#6fd0ff" stroke-width="2.4" stroke-linecap="round"/></svg>`}
};

/* shared bits for the new items */
const SM=c=>psMat({color:c});
const sigBox=(w,h,d)=>flat(new THREE.BoxGeometry(w,h,d));
function sigMesh(g,geo,mat,x,y,z){const e=new THREE.Mesh(geo,mat);e.position.set(x,y,z);g.add(e);return e;}
/** a point on the main road at sample i, lat across, h above the tarmac */
function roadPt(i,lat,h,out){
  i=((Math.round(i)%N)+N)%N;
  return out.set(sx[i]+rx[i]*lat,sy[i]+lat*bank[i]+(h||0),sz[i]+rz[i]*lat);
}
/** lies a flat thing on the main road at sample i, following its bank */
const _bx=new THREE.Vector3(),_by=new THREE.Vector3(),_bz=new THREE.Vector3(),_bm=new THREE.Matrix4();
function onRoadSurface(obj,i){
  i=((Math.round(i)%N)+N)%N;
  _bz.set(fx[i],0,fz[i]).normalize();
  _bx.set(rx[i],bank[i],rz[i]).normalize();
  _by.crossVectors(_bz,_bx).normalize();if(_by.y<0)_by.negate();
  _bx.crossVectors(_by,_bz).normalize();
  obj.quaternion.setFromRotationMatrix(_bm.makeBasis(_bx,_by,_bz));
}
/** something that rides along with a kart, drawn after it has moved */
function rideWith(obj,k,fwd,side,up){
  const Fx=Math.sin(k.yaw),Fz=Math.cos(k.yaw);
  obj.position.set(k.x+Fx*fwd-Fz*side,k.y+up,k.z+Fz*fwd+Fx*side);
  obj.rotation.set(0,k.yaw,0);
}
const sigHittable=(o,k)=>o!==k&&!o.parked&&!o.done&&!(o.ghost>0);

/* ── Bogserlinan ── */
const towRopeMat=new THREE.LineBasicMaterial({color:0xc9a163});
const towHook=(function(){
  const steel=psMat({color:0x6a727c}),hemp=psMat({color:0xa8823f});
  const hook=flat(new THREE.TorusGeometry(.42,.1,4,8,Math.PI*1.3)),coil=flat(new THREE.TorusGeometry(.5,.16,4,10));
  return ()=>{const g=new THREE.Group();
    const h=new THREE.Mesh(hook,steel);h.rotation.z=Math.PI*.6;g.add(h);
    const c=new THREE.Mesh(coil,hemp);c.rotation.x=Math.PI/2;c.position.y=-.55;g.add(c);return g;};
})();
function fireTow(k){
  const holder=new THREE.Group();holder.add(towHook());scene.add(holder);
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.BufferAttribute(new Float32Array(ROPE_PTS*3),3));
  const rope=new THREE.Line(geo,towRopeMat);rope.frustumCulled=false;scene.add(rope);
  hooks.push({owner:k,si:(k.si+2)%N,lat:k.lat,t:0,speed:Math.max(k.speed,26)+38,holder,rope,target:null,rib:k.rib,tow:true});
  if(k===player){toast('BOGSERLINAN!');ping(520,260,.16);}
}

/* ── Cykla mer! ── */
const bikeParts=(function(){
  const frame=psMat({color:0x2f6a4a}),tyre=psMat({color:0x23272e}),chrome=psMat({color:0xc4ccd4}),
        blazer=psMat({color:0x8a5a32}),trousers=psMat({color:0xc8b48a}),skin=psMat({color:0xd8a07c}),
        beard=psMat({color:0x6b4a2a}),glass=psMat({color:0x23272e}),tote=psMat({color:0xe8dcc0}),
        jeans=psMat({color:0x34486a});
  const wheel=flat(new THREE.TorusGeometry(.62,.12,4,12)),bar=(l)=>flat(new THREE.BoxGeometry(.14,.14,l));
  /* Björn in his corduroy blazer, round glasses, beard and tote bag; anyone else in their own colour */
  return (bjorn,color)=>{
    const g=new THREE.Group(),m=(geo,mat,x,y,z,p)=>{const e=new THREE.Mesh(geo,mat);e.position.set(x,y,z);(p||g).add(e);return e;};
    const top=bjorn?blazer:psMat({color}),legsMat=bjorn?trousers:jeans;
    for(const z of [-.95,.95]){const w=m(wheel,tyre,0,.62,z);w.rotation.y=Math.PI/2;}
    const tube=(a,b)=>{const d=new THREE.Vector3().subVectors(b,a),e=m(bar(d.length()),frame,0,0,0);
      e.position.copy(a).add(b).multiplyScalar(.5);e.lookAt(b.x,b.y,b.z);return e;};
    const V=(y,z)=>new THREE.Vector3(0,y,z);
    tube(V(.62,-.95),V(.62,0));tube(V(.62,0),V(1.4,-.35));tube(V(.62,0),V(1.45,.7));tube(V(1.4,-.35),V(1.45,.7));
    tube(V(1.45,.7),V(.62,.95));tube(V(.62,-.95),V(1.4,-.35));
    m(flat(new THREE.BoxGeometry(.24,.08,.34)),beard,0,1.5,-.4);                    /* saddle */
    m(flat(new THREE.BoxGeometry(.9,.07,.07)),chrome,0,1.62,.68);                   /* handlebar */
    m(flat(new THREE.BoxGeometry(.62,.78,.42)),top,0,2.0,-.18).rotation.x=.35;
    m(flat(new THREE.BoxGeometry(.44,.44,.44)),skin,0,2.62,.04);
    if(bjorn){
      m(flat(new THREE.BoxGeometry(.46,.22,.2)),beard,0,2.46,.2);
      m(flat(new THREE.BoxGeometry(.48,.08,.06)),glass,0,2.68,.27);
      m(flat(new THREE.BoxGeometry(.1,.5,.4)),tote,.4,1.75,-.45);
    }else m(flat(new THREE.BoxGeometry(.48,.14,.48)),top,0,2.88,.02);           /* a cap */
    m(flat(new THREE.BoxGeometry(.18,.6,.18)),top,-.34,1.9,.22).rotation.x=-.9;
    m(flat(new THREE.BoxGeometry(.18,.6,.18)),top, .34,1.9,.22).rotation.x=-.9;
    const legs=[-1,1].map(s=>{const hip=new THREE.Group();hip.position.set(s*.16,1.55,-.35);g.add(hip);
      m(flat(new THREE.BoxGeometry(.18,.8,.2)),legsMat,0,-.4,0,hip);return hip;});
    g.userData.legs=legs;g.visible=false;g.scale.setScalar(1.3);
    return g;
  };
})();
function rideBike(k){
  k.bike=BIKE.time;k.drift=0;k.charge=0;
  if(!k.bikeG||k.bikeG.parent!==k.v.root){k.bikeG=bikeParts(k.sig==='bjorn',k.color);k.v.root.add(k.bikeG);}   /* a new vehicle needs a new bike */
  bikeShow(k,true);
  for(let p=0;p<14;p++)puff(k.x+rand(-1,1),k.y+rand(.3,1.8),k.z+rand(-1,1),.7,.9,.75,.5);
  if(k===player){toast('CYKLA MER! JAG CYKLAR EGENTLIGEN');ping(900,1500,.12);}
}
/** swap the vehicle for the bike and back */
function bikeShow(k,on){
  for(const c of k.v.root.children)c.visible=c===k.bikeG?on:!on&&!(k.dive>0);   /* still under the lake: stay hidden */
  if(!on&&k.bikeG)for(let p=0;p<10;p++)puff(k.x+rand(-1,1),k.y+rand(.3,1.5),k.z+rand(-1,1),.8,.8,.8,.45);
}

/* ── Färdplanen ── */
/* the planned line: outside, apex, outside. The signed bend a little ahead pulls the line to
   the inside, then two smoothing passes swing it out wide on the way in and out. */
const planLine={stage:null,lat:new Float32Array(N)};
function planLat(i){
  if(planLine.stage!==stage){
    const raw=new Float32Array(N),L=planLine.lat;
    for(let j=0;j<N;j++){let a=0;for(let q=-4;q<=10;q++)a+=scurv[(j+q+N)%N];raw[j]=-clamp(a/15/0.15,-1,1);}
    for(let pass=0;pass<2;pass++){
      for(let j=0;j<N;j++){let a=0;for(let q=-8;q<=8;q++)a+=raw[(j+q+N)%N];L[j]=a/17;}
      raw.set(L);
    }
    for(let j=0;j<N;j++)L[j]=clamp(raw[j],-1,1)*HW*0.62;
    planLine.stage=stage;
  }
  return planLine.lat[((Math.round(i)%N)+N)%N];
}
const chevronGeo=(function(){
  const s=new THREE.Shape();
  s.moveTo(-.9,-.3);s.lineTo(0,.5);s.lineTo(.9,-.3);s.lineTo(.9,-.75);s.lineTo(0,.05);s.lineTo(-.9,-.75);s.closePath();
  const g=new THREE.ShapeGeometry(s);g.rotateX(Math.PI/2);return g;   /* tip forward, along +z */
})();
function unfoldPlan(k){
  k.fplan=PLAN.time;k.onPlan=false;
  if(!k.planG){
    const mat=psMat({color:0x6fe0ff,unlit:true,transparent:true,opacity:.8,depthWrite:false,side:THREE.DoubleSide});
    k.planG=new THREE.Group();k.planG.userData.mat=mat;
    for(let q=0;q<PLAN.marks;q++)k.planG.add(new THREE.Mesh(chevronGeo,mat));
    scene.add(k.planG);
  }
  k.planG.visible=true;
  if(k===player){toast('FÄRDPLANEN! JAG HAR PLANERAT DET HÄR');ping(660,990,.12);}
}
function drawPlan(k){
  const show=k.fplan>0&&!k.rib&&!k.parked;
  k.planG.visible=show;if(!show)return;
  const fade=Math.min(1,k.fplan/0.8);
  k.planG.userData.mat.uniforms.uOpacity.value=.8*fade;
  k.planG.userData.mat.uniforms.uColor.value.setHex(k.onPlan?0xffd84a:0x6fe0ff);
  const base=Math.floor(k.si)+3;
  k.planG.children.forEach((c,q)=>{
    const i=(base+q*PLAN.gap)%N,j=(i+1)%N,L=planLat(i);
    c.position.set(sx[i]+rx[i]*L,sy[i]+L*bank[i]+.14+Math.sin(clock*6-q*.5)*.04,sz[i]+rz[i]*L);
    c.rotation.y=Math.atan2(sx[j]+rx[j]*planLat(j)-c.position.x,sz[j]+rz[j]*planLat(j)-c.position.z);
  });
}

/* ── Visa körkortet! ── */
/** the next kart up the main road within the licence check's reach */
function licTarget(k){
  if(k.rib)return null;
  const [o]=nextAhead(k.si,k,LIC.reach/SEG);
  return o&&!o.done?o:null;
}
const sirenParts=(function(){
  const blue=psMat({color:0x2a6aff,unlit:true}),red=psMat({color:0xff3a3a,unlit:true}),bar=psMat({color:0x23272e});
  return ()=>{const g=new THREE.Group();
    sigMesh(g,sigBox(1.5,.12,.3),bar,0,0,0);
    const b=sigMesh(g,sigBox(.6,.28,.32),blue,-.42,.18,0),r=sigMesh(g,sigBox(.6,.28,.32),red,.42,.18,0);
    g.userData.lamps=[b,r];g.visible=false;scene.add(g);return g;};
})();
const licenceParts=(function(){
  const card=psMat({color:0xf4b8c8,unlit:true}),photo=psMat({color:0x7a8a9a,unlit:true}),ink=psMat({color:0x8a3a52,unlit:true}),
        paddle=psMat({color:0xe0362a,unlit:true}),white=psMat({color:0xffffff,unlit:true}),stick=psMat({color:0x23272e});
  return ()=>{const g=new THREE.Group();
    sigMesh(g,sigBox(1.7,1.1,.06),card,-.6,0,0);
    sigMesh(g,sigBox(.5,.66,.08),photo,-1.08,.04,0);
    for(let q=0;q<3;q++)sigMesh(g,sigBox(.7,.08,.08),ink,-.3,.26-q*.22,0);
    const p=sigMesh(g,flat(new THREE.CylinderGeometry(.62,.62,.08,8)),paddle,1.15,.3,0);p.rotation.x=Math.PI/2;
    sigMesh(g,sigBox(.9,.2,.1),white,1.15,.3,0);
    sigMesh(g,sigBox(.1,.9,.1),stick,1.15,-.6,0);
    g.visible=false;scene.add(g);return g;};
})();
function pullOver(k){
  const o=licTarget(k);
  k.siren=LIC.siren;
  if(k===player){toast('VISA KÖRKORTET!');ping(960,720,.18);setTimeout(()=>ping(960,720,.18),220);}
  if(!o){sigMiss(k,'BLÅLJUS PÅ TOM VÄG');return;}
  if(blockHit(o)){if(k===player)toast('SKÖLDEN VÄGRADE STANNA');return;}
  o.pulled=LIC.time;o.boost=0;o.drift=0;o.charge=0;o.launch=0;
  if(o===player){flash('STOPP!');toast(k.name+': VISA KÖRKORTET!');ping(960,720,.18);shake=Math.min(1,shake+.35);}
  else if(k===player)setTimeout(()=>toast(o.name+' FICK STANNA'),700);
}

/* ── Kreatursöverfarten ── */
const herds=[];
const cowParts=(function(){
  const hide=psMat({color:0xf4f0e6}),spot=psMat({color:0x23272e}),pink=psMat({color:0xf2a0b0}),horn=psMat({color:0xc9b48a});
  const leg=sigBox(.26,.9,.26);
  return ()=>{const g=new THREE.Group();          /* faces +z, walks along it */
    sigMesh(g,sigBox(1.0,.85,1.9),hide,0,1.35,0);
    sigMesh(g,sigBox(1.02,.5,.6),spot,0,1.5,.3);sigMesh(g,sigBox(.6,.4,.5),spot,.22,1.2,-.5);
    sigMesh(g,sigBox(.62,.6,.7),hide,0,1.72,1.18);sigMesh(g,sigBox(.5,.3,.2),pink,0,1.55,1.58);
    sigMesh(g,sigBox(.1,.26,.1),horn,-.24,2.1,1.1);sigMesh(g,sigBox(.1,.26,.1),horn,.24,2.1,1.1);
    sigMesh(g,sigBox(.36,.24,.4),pink,0,.84,-.2);
    const legs=[[-.34,.62],[.34,.62],[-.34,-.62],[.34,-.62]].map(([x,z])=>{
      const hip=new THREE.Group();hip.position.set(x,.95,z);g.add(hip);sigMesh(hip,leg,spot,0,-.45,0);return hip;});
    g.userData.legs=legs;g.scale.setScalar(1.15);return g;};
})();
/** the kart the herd goes for: the leader, or the next one down when the leader is you */
function herdTarget(k){
  let best=null;
  for(const o of karts)if(sigHittable(o,k)&&(!best||o.place<best.place))best=o;
  return best;
}
function sendHerd(k){
  const o=herdTarget(k)||k;                               /* nobody else racing: across your own road, Majros is let past */
  let si=(Math.round(o.mi)+Math.round(HERD.ahead/SEG))%N;
  for(let tries=0;tries<12;tries++){                      /* never in a jump's landing or a fork's mouth */
    let bad=!clearOfForks(si,3);
    for(const J of JUMPS)if(Math.abs(sigWrap(si-J.at))<J.up+J.dn+6)bad=true;
    if(!bad)break;si=(si+8)%N;
  }
  const dir=Math.random()<.5?-1:1,cows=[];
  for(let q=0;q<HERD.n;q++){const g=cowParts();scene.add(g);cows.push(g);}
  herds.push({owner:k,si,dir,t:0,cows,hit:new Set([k]),
    from:-dir*(HW+3),speed:(2*HW+6+HERD.space*(HERD.n-1))/HERD.walk});
  if(k===player){toast('KREATURSÖVERFARTEN! MUUU');moo();}
  else if(o===player&&o!==k)setTimeout(()=>{if(state==='race')toast('KOR PÅ VÄGEN!');},500);
}
function updateHerds(dt){
  for(let n=herds.length-1;n>=0;n--){
    const h=herds[n];h.t+=dt;
    let any=false;
    h.cows.forEach((g,q)=>{
      const lat=h.from+h.dir*(h.speed*h.t-q*HERD.space);
      const on=Math.abs(lat)<HW+3.5&&(h.dir>0?lat>h.from-0.1:lat<h.from+0.1);
      g.visible=on;g.userData.lat=lat;
      if(!on)return;any=true;
      roadPt(h.si,lat,0,g.position);onRoadSurface(g,h.si);g.rotateY(h.dir>0?Math.PI/2:-Math.PI/2);
      g.userData.legs.forEach((L,s)=>L.rotation.x=Math.sin(clock*7+s*Math.PI*.5+q)*.5);
    });
    if(!any&&h.t>0.5){for(const g of h.cows)scene.remove(g);herds.splice(n,1);continue;}
    for(const o of karts){
      if(h.hit.has(o)||!sigHittable(o,h.owner)||o.rib||o.sig==='cow')continue;   /* the cows know Majros */
      if(Math.abs(sigWrap(o.si-h.si))*SEG>2.2)continue;
      const c=h.cows.find(g=>g.visible&&Math.abs(o.lat-g.userData.lat)<1.8&&o.y-g.position.y<2.4);
      if(!c)continue;
      h.hit.add(o);
      for(let p=0;p<12;p++)puff(o.x+rand(-1,1),o.y+rand(.3,1.6),o.z+rand(-1,1),.95,.93,.88,.5);
      if(blockHit(o))continue;
      const i=h.si;o.vx+=rx[i]*h.dir*HERD.push;o.vz+=rz[i]*h.dir*HERD.push;
      o.slow=Math.max(o.slow,HERD.slow);o.boost=0;o.drift=0;o.charge=0;
      if(o===player){toast('MUUU! EN KO!');moo();shake=Math.min(1,shake+.5);}
      else if(h.owner===player)toast('KON TOG '+o.name+'!');
    }
  }
}

/* ── Kompisarna ── */
const mopedParts=(function(){
  const tyre=psMat({color:0x23272e}),seat=psMat({color:0x15161a}),skin=psMat({color:0xc89070}),denim=psMat({color:0x34486a});
  const wheel=flat(new THREE.CylinderGeometry(.42,.42,.18,10));
  return (color)=>{const g=new THREE.Group(),paint=psMat({color});
    for(const z of [-.7,.7]){const w=sigMesh(g,wheel,tyre,0,.42,z);w.rotation.z=Math.PI/2;}
    sigMesh(g,sigBox(.5,.4,1.5),paint,0,.85,0);sigMesh(g,sigBox(.4,.16,.6),seat,0,1.12,-.3);
    sigMesh(g,sigBox(.12,.7,.12),paint,0,1.2,.62);sigMesh(g,sigBox(.8,.08,.08),seat,0,1.55,.62);
    sigMesh(g,sigBox(.5,.7,.36),paint,0,1.62,-.2).rotation.x=.3;          /* a matching jacket */
    sigMesh(g,sigBox(.44,.44,.44),paint,0,2.18,-.06);                      /* the helmet */
    sigMesh(g,sigBox(.36,.16,.06),skin,0,2.12,.17);
    sigMesh(g,sigBox(.16,.5,.16),denim,-.2,1.2,-.05).rotation.x=-1.1;
    sigMesh(g,sigBox(.16,.5,.16),denim,.2,1.2,-.05).rotation.x=-1.1;
    g.scale.set(1.5,1.3,1.3);g.visible=false;scene.add(g);return g;};
})();
function callMates(k){
  k.mates=MATES.time;k.boost=Math.max(k.boost,MATES.boost);
  if(!k.matesG)k.matesG=[mopedParts(0xff7a1a),mopedParts(0x2fb85a)];
  for(let p=0;p<10;p++)puff(k.x+rand(-1,1),k.y+rand(.3,1.4),k.z+rand(-1,1),.85,.9,1,.4);
  if(k===player){toast('KOMPISARNA! KÖR, KÖR, KÖR!');ping(500,1300,.15);}
}

/* ── Gödselspridaren ── */
const muck=[];
const muckGeo=(function(){const g=new THREE.CircleGeometry(1,8);g.rotateX(-Math.PI/2);return g;})(),
      muckMat=psMat({color:0x4a3218});
function spreadMuck(k){
  k.spread=MUCK.time;k.spreadT=0;
  if(k===player){toast('GÖDSELSPRIDAREN! DEN DÄR SKULLE TILL LADAN');ping(160,110,.3);}
}
function dropMuck(k){
  const Fx=Math.sin(k.yaw),Fz=Math.cos(k.yaw),side=rand(-1.6,1.6);
  const x=k.x-Fx*3.4-Fz*side,z=k.z-Fz*3.4+Fx*side,i=nearestLocal(x,z,k.si);
  const lat=clamp((x-sx[i])*rx[i]+(z-sz[i])*rz[i],-HW-1,HW+1);
  const m=new THREE.Mesh(muckGeo,muckMat);roadPt(i,lat,.05+muck.length%5*.004,m.position);onRoadSurface(m,i);
  m.rotateY(rand(0,6.283));m.scale.setScalar(MUCK.r*rand(.85,1.15));scene.add(m);
  muck.push({x:m.position.x,y:m.position.y,z:m.position.z,r:m.scale.x,t:MUCK.life,m,owner:k});
  if(muck.length>MUCK.cap){scene.remove(muck[0].m);muck.shift();}
}
function updateMuck(dt){
  for(const k of karts){
    if(!(k.spread>0))continue;
    k.spread=Math.max(0,k.spread-dt);k.spreadT-=dt;
    const Fx=Math.sin(k.yaw),Fz=Math.cos(k.yaw);
    for(let p=0;p<3;p++)puff(k.x-Fx*2.6+rand(-1,1),k.y+rand(.8,2),k.z-Fz*2.6+rand(-1,1),.36,.24,.12,.6);
    for(let q=0;q<2&&k.spreadT<=0;q++){k.spreadT+=MUCK.every;if(!k.rib&&!k.air&&state==='race')dropMuck(k);}   /* a slow frame drops two */
    if(k.spreadT<0)k.spreadT=0;
  }
  for(let n=muck.length-1;n>=0;n--){
    const p=muck[n];p.t-=dt;
    if(p.t<=0){scene.remove(p.m);muck.splice(n,1);continue;}
    if(p.t<1.5)p.m.scale.setScalar(p.r*p.t/1.5);            /* dries up */
  }
  for(const k of karts){
    if(k.mucky>0)k.mucky=Math.max(0,k.mucky-dt);
    if(k.parked||k.air||k.rib)continue;
    for(const p of muck){
      if(p.owner===k)continue;
      const r=p.m.scale.x,dx=k.x-p.x,dz=k.z-p.z;
      if(dx*dx+dz*dz>r*r||Math.abs(k.y-p.y)>1.5)continue;
      if(!(k.mucky>0)&&k===player&&k.offRoad<0.9)toast('GÖDSEL!');
      k.mucky=0.2;
      if(k.speed>6&&Math.random()<.5)puff(k.x+rand(-1,1),k.y+.3,k.z+rand(-1,1),.36,.24,.12,.5);
      break;
    }
  }
}

/* ── Tifot ── */
function tifoTargets(k){
  const out=[];
  for(const o of karts){
    if(!sigHittable(o,k))continue;
    const d=sigWrap(o.mi-k.mi)*SEG;
    if(d>1&&d<TIFO.reach)out.push(o);
  }
  return out;
}
/** a green-and-black GAIS scarf with fringes, along x */
const scarfParts=(function(){
  const green=psMat({color:0x1f9a4a,side:THREE.DoubleSide}),black=psMat({color:0x15161a,side:THREE.DoubleSide}),
        pole=psMat({color:0xc9a163});
  return (big)=>{const g=new THREE.Group(),n=big?9:5,w=big?.62:.42,h=big?1.3:.8;
    for(let q=0;q<n;q++){const s=sigMesh(g,sigBox(w,h,.06),q%2?black:green,(q-(n-1)/2)*w,0,0);s.userData.q=q;}
    for(let q=0;q<n;q+=2)sigMesh(g,sigBox(.06,.34,.04),green,(q-(n-1)/2)*w,-h/2-.17,0);
    if(big)for(const s of [-1,1])sigMesh(g,sigBox(.1,2.2,.1),pole,s*n*w/2,-.6,0);
    g.userData.big=big;g.visible=false;scene.add(g);return g;};
})();
const tifoEl=document.getElementById('tifo');
function raiseTifo(k){
  const ts=tifoTargets(k);
  k.tifo=TIFO.time;
  if(!k.tifoG)k.tifoG=scarfParts(true);
  for(let p=0;p<24;p++){const gr=Math.random()<.5;
    puff(k.x+rand(-2,2),k.y+rand(2,4),k.z+rand(-2,2),gr?.12:.08,gr?.6:.08,gr?.29:.1,.9);}
  if(k===player){toast('KOM IGEN NU, GAIS!');ping(440,660,.2);setTimeout(()=>ping(550,880,.2),260);}
  let hits=0;
  for(const o of ts){
    if(blockHit(o))continue;
    o.blind=TIFO.time;hits++;
    if(!o.blindG)o.blindG=scarfParts(false);
    if(o===player)toast('TIFO! JAG SER INGENTING');
  }
  if(k===player&&hits)setTimeout(()=>toast(hits>1?hits+' SER BARA RÄNDER':'DE SER BARA RÄNDER'),700);
}

/* ── Garnnystanet ── */
const yarns=[];
const woolMat=psMat({color:0xff4f7a,unlit:true}),woolGeo=sigBox(.55,.3,1),ballGeo=flat(new THREE.IcosahedronGeometry(.75,0));
function dropYarn(k){
  const si=((Math.round(k.si)-Math.round(YARN.back/SEG))%N+N)%N;
  const side=k.lat>0.5?1:(k.lat<-0.5?-1:(Math.random()<.5?-1:1));   /* starts on her side of the road */
  const a=side*HW*.95,b=a-side*HW*YARN.span;
  const g=new THREE.Group(),line=new THREE.Mesh(woolGeo,woolMat),ball=new THREE.Mesh(ballGeo,woolMat);
  g.add(line);g.add(ball);scene.add(g);
  yarns.push({owner:k,si,a,b,t:0,g,line,ball,hit:new Set([k])});
  if(k===player){toast('GARNNYSTANET! DU SER HUNGRIG UT');ping(700,400,.14);}
}
const _ya=new THREE.Vector3(),_yb=new THREE.Vector3();
function updateYarns(dt){
  for(let n=yarns.length-1;n>=0;n--){
    const y=yarns[n];y.t+=dt;
    if(y.t>YARN.life){scene.remove(y.g);yarns.splice(n,1);continue;}
    const f=Math.min(1,y.t/YARN.roll),end=lerp(y.a,y.b,f);
    roadPt(y.si,y.a,.3,_ya);roadPt(y.si,end,.3,_yb);
    y.line.position.copy(_ya).add(_yb).multiplyScalar(.5);y.line.scale.z=Math.max(.01,_ya.distanceTo(_yb));
    y.line.lookAt(_yb);
    roadPt(y.si,end,.5,y.ball.position);y.ball.rotation.x+=dt*(f<1?14:0);y.ball.scale.setScalar(1-.45*f);
    const lo=Math.min(y.a,end)-.7,hi=Math.max(y.a,end)+.7;
    for(const o of karts){
      if(y.hit.has(o)||!sigHittable(o,y.owner)||o.rib||o.air)continue;
      if(Math.abs(sigWrap(o.si-y.si))*SEG>2.0||o.lat<lo||o.lat>hi)continue;
      y.hit.add(o);
      for(let p=0;p<10;p++)puff(o.x+rand(-1,1),o.y+rand(.2,.9),o.z+rand(-1,1),.85,.21,.35,.5);
      if(blockHit(o))continue;
      o.slick=Math.max(o.slick,YARN.slick);o.slow=Math.max(o.slow,YARN.slow);o.drift=0;o.charge=0;
      if(o===player){toast('TRASSLAD I GARNET!');ping(500,200,.18);shake=Math.min(1,shake+.3);}
      else if(y.owner===player)toast(o.name+' TRASSLADE IN SIG');
    }
  }
}

/* ── Tidtagningsrättelse ── */
function freezeTargets(k){
  return karts.filter(o=>sigHittable(o,k)&&Math.abs(o.y-k.y)<4&&Math.hypot(o.x-k.x,o.z-k.z)<FREEZE.r);
}
const iceMat=psMat({color:0x9fe0ff,unlit:true,transparent:true,opacity:.42,depthWrite:false}),
      iceGeo=flat(new THREE.BoxGeometry(3.4,2.6,4.6)),
      ringMat=psMat({color:0x9fe0ff,unlit:true,transparent:true,opacity:.6,depthWrite:false,side:THREE.DoubleSide}),
      ringGeo=(function(){const g=new THREE.RingGeometry(.9,1,24);g.rotateX(-Math.PI/2);return g;})();
const watchParts=(function(){
  const face=psMat({color:0xf4f8fc,unlit:true}),rim=psMat({color:0x23272e}),hand=psMat({color:0xe0362a,unlit:true});
  return ()=>{const g=new THREE.Group();
    const f=sigMesh(g,flat(new THREE.CylinderGeometry(1,1,.16,12)),face,0,0,0);f.rotation.x=Math.PI/2;
    const r=sigMesh(g,flat(new THREE.TorusGeometry(1,.12,4,12)),rim,0,0,0);
    sigMesh(g,sigBox(.4,.3,.2),rim,0,1.2,0);
    const h=new THREE.Group();g.add(h);sigMesh(h,sigBox(.1,.8,.1),hand,0,.4,.12);
    g.userData.hand=h;g.visible=false;scene.add(g);return g;};
})();
const rings=[];
function freezeTime(k){
  const ts=freezeTargets(k);
  k.watch=1.0;if(!k.watchG)k.watchG=watchParts();
  const m=new THREE.Mesh(ringGeo,ringMat);m.position.set(k.x,k.y+.3,k.z);scene.add(m);rings.push({m,t:0});
  if(k===player){flash('RÄTTELSE!');ping(1800,900,.12);setTimeout(()=>ping(1800,900,.12),180);}
  let hits=0;
  for(const o of ts){
    if(blockHit(o))continue;
    o.frozen=FREEZE.time;o.vx=0;o.vz=0;o.speed=0;o.boost=0;o.drift=0;o.charge=0;o.launch=0;hits++;
    if(!o.iceG){o.iceG=new THREE.Mesh(iceGeo,iceMat);scene.add(o.iceG);}
    for(let p=0;p<10;p++)puff(o.x+rand(-1.4,1.4),o.y+rand(.3,2.2),o.z+rand(-1.4,1.4),.75,.92,1,.7);
    if(o===player){toast('TIDTAGNINGSRÄTTELSE! DU STÅR STILL');shake=Math.min(1,shake+.3);}
  }
  if(k===player&&hits)setTimeout(()=>toast(hits>1?hits+' FRUSNA I TIDEN':'FRUSEN I TIDEN'),600);
  else if(!ts.length)sigMiss(k,'INGEN I NÄRHETEN');
}

/* ── shared: what physics reads, the timers, the drawing, the clean-up ── */
const sigTop=k=>(k.tow>0?TOW.top:1)*(k.towed>0?TOW.drag:1)*(k.bike>0?BIKE.top:1)*(k.onPlan?PLAN.top:1)*
  (k.pulled>0?LIC.top:1)*(k.mates>0?MATES.top:1)*(k.mucky>0?muckTop(k):1)*(k.ai&&k.blind>0?TIFO.top:1)*westTop(k)*mixTop(k)*bossTop(k)*menuTop(k);   /* the west's own: 37-west-items.js; cement: 37-cementblandaren.js; champions: 37-boss-items.js; Sibylla: 37-sibylla-meny.js */
const sigGrip=k=>(k.bike>0?BIKE.grip:1)*(k.onPlan?PLAN.grip:1)*(k.mucky>0?MUCK.grip:1)*westGrip(k)*bossGrip(k)*menuGrip(k);
const sigPush=(k,thr)=>(k.tow>0?TOW.push:0)+bossPush(k)+menuPush(k,thr)+thr*((k.bike>0?BIKE.push:0)+(k.onPlan?PLAN.push:0)+(k.mates>0?MATES.push:0));
function updateSigs(dt){
  const tick=(k,f)=>{if(k[f]>0)k[f]=Math.max(0,k[f]-dt);};
  for(const k of karts){
    tick(k,'tow');tick(k,'towed');tick(k,'pulled');tick(k,'siren');tick(k,'mates');tick(k,'tifo');tick(k,'blind');tick(k,'watch');
    if(k.bike>0){
      k.bike=Math.max(0,k.bike-dt);
      if(k.bike<=0||k.done){k.bike=0;bikeShow(k,false);if(k===player)toast('TILLBAKA I BILEN');}
      else{const a=clock*(4+k.speed*.5);k.bikeG.userData.legs.forEach((h,s)=>h.rotation.x=Math.sin(a+s*Math.PI)*.6-.5);}
    }
    if(k.fplan>0){
      k.fplan=Math.max(0,k.fplan-dt);
      const was=k.onPlan;
      k.onPlan=k.fplan>0&&!k.rib&&Math.abs(k.lat-planLat(k.si))<PLAN.w;
      if(k===player&&k.onPlan&&!was)ping(990,1320,.05);
      if(k.onPlan&&Math.random()<.5)puff(k.x+rand(-.8,.8),k.y+.3,k.z+rand(-.8,.8),1,.85,.3,.35);
    }else k.onPlan=false;
    if(k.planG)drawPlan(k);
  }
  updateHerds(dt);updateSvin(dt);updateMuck(dt);updateYarns(dt);updateWest(dt);updateMenu(dt);updateMixers(dt);updateStamp();updateTackles(dt);updateBoss(dt);
  for(let n=rings.length-1;n>=0;n--){
    const r=rings[n];r.t+=dt;
    if(r.t>.5){scene.remove(r.m);rings.splice(n,1);continue;}
    r.m.scale.setScalar(FREEZE.r*r.t/.5);
  }
  ringMat.uniforms.uOpacity.value=.6;
  if(tifoEl){
    const b=player.blind>0;
    tifoEl.classList.toggle('on',b);
    if(b)tifoEl.style.opacity=Math.min(1,player.blind/0.4,(TIFO.time-player.blind)/0.15+.2).toFixed(2);
  }
}
/** what rides along with a kart, after every kart has moved this frame */
function drawSigs(){
  for(const k of karts){
    const live=!k.parked;
    if(k.sirenG){
      const on=live&&k.siren>0;k.sirenG.visible=on;
      if(on){rideWith(k.sirenG,k,.2,0,2.35);const f=Math.floor(clock*8)%2;k.sirenG.userData.lamps[0].visible=!!f;k.sirenG.userData.lamps[1].visible=!f;}
    }else if(k.siren>0)k.sirenG=sirenParts();
    if(k.licG){
      const on=live&&k.pulled>0;k.licG.visible=on;
      if(on){rideWith(k.licG,k,0,0,3.4+Math.sin(clock*5)*.1);k.licG.rotation.y=Math.atan2(camera.position.x-k.x,camera.position.z-k.z);}
    }else if(k.pulled>0)k.licG=licenceParts();
    if(k.matesG){
      const on=live&&k.mates>0;
      k.matesG.forEach((g,s)=>{g.visible=on;if(on){rideWith(g,k,5.2+Math.sin(clock*2+s)*.4,(s?1:-1)*1.7,0);
        g.rotation.z=Math.sin(clock*9+s*2)*.04;}});
    }
    if(k.tifoG){
      const on=live&&k.tifo>0;k.tifoG.visible=on;
      if(on){rideWith(k.tifoG,k,-.4,0,4.4);k.tifoG.children.forEach(c=>{if(c.userData.q!==undefined)c.position.y=Math.sin(clock*7+c.userData.q*.8)*.18;});}
    }
    if(k.blindG){
      const on=live&&k.blind>0&&k!==player;k.blindG.visible=on;
      if(on){rideWith(k.blindG,k,1.4,0,1.9);k.blindG.rotation.x=Math.sin(clock*6)*.15;}
    }
    if(k.watchG){
      const on=live&&k.watch>0;k.watchG.visible=on;
      if(on){rideWith(k.watchG,k,0,0,4.2);k.watchG.rotation.y=Math.atan2(camera.position.x-k.x,camera.position.z-k.z);
        k.watchG.userData.hand.rotation.z=-clock*12;}
    }
    if(k.iceG){
      const on=live&&k.frozen>0;k.iceG.visible=on;
      if(on){k.iceG.position.set(k.x,k.y+1.2,k.z);k.iceG.rotation.y=k.yaw;}
    }
  }
  drawWest();drawMenu();drawMixers();drawTackles();drawBoss();
}
function clearSigs(){
  for(const k of karts){
    k.tow=0;k.towed=0;k.fplan=0;k.onPlan=false;
    k.pulled=0;k.siren=0;k.mates=0;k.spread=0;k.mucky=0;k.tifo=0;k.blind=0;k.watch=0;k.frozen=0;
    if(k.bike>0||k.bikeG){k.bike=0;if(k.bikeG)bikeShow(k,false);}
    if(k.planG)k.planG.visible=false;
    for(const g of [k.sirenG,k.licG,k.tifoG,k.blindG,k.watchG,k.iceG])if(g)g.visible=false;
    if(k.matesG)for(const g of k.matesG)g.visible=false;
  }
  for(const h of herds)for(const g of h.cows)scene.remove(g);
  for(const p of muck)scene.remove(p.m);
  for(const y of yarns)scene.remove(y.g);
  for(const r of rings)scene.remove(r.m);
  herds.length=0;muck.length=0;yarns.length=0;rings.length=0;
  if(tifoEl)tifoEl.classList.remove('on');
  clearSvin();clearWest();clearMenu();clearMixers();clearTackles();clearBoss();
}
