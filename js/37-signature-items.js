"use strict";
/* ───────── signature items ───────── */
/* A driver's own item, from the same box and the same slot as the rest: a box first rolls
   SIG_CHANCE for it, then the five families as usual. One fixed form, no levels; the HUD shows
   a star. It follows the driver into any vehicle, and twins share it. The AI plays it too.
   First three (roadmap step 3): Arne's tow rope, Björn's bike, Amanda's planned line. */
const SIG_CHANCE=0.10;
const sigOf=id=>SIGS[id]?id:null;

/* Bogserlinan: a hemp rope with a hay hook, thrown at the kart ahead like the Spettigare kaka
   (it rides the hook code in 37-power-ups.js), but it reaches further and tows instead of
   launching: Arne is pulled along steadily, the one in front feels the drag, and lets go with a
   slingshot just short of their bumper. The towed driver shakes it off by drifting. */
const TOW={
  reach:1.0,        /* seconds the rope flies before it counts as a miss */
  home:55,          /* how far up the road it looks for someone to hook */
  time:2.8,         /* the longest tow */
  push:30,          /* extra forward pull while towed, m/s² */
  top:1.28,         /* Arne's top speed on the rope, as a share of his own */
  drag:0.88,        /* the towed kart's top speed, as a share of its own */
  grace:0.35,       /* seconds after the bite before a drift can shake it off */
  sling:0.9         /* boost on release */
};
/* Cykla mer!: Björn jumps on the bike off his roof rack for a few seconds. Pedalling is a
   gentle boost (less than milk) and costs no fuel, and a bike is too small to hit: rockets,
   traps, beans and other karts all pass him by. */
const BIKE={time:4.0,top:1.12,push:14,grip:1.25};
/* Färdplanen: Amanda unfolds the map and the ideal line glows on the road ahead. On it she
   gets more grip and a little speed; off it, nothing. Everyone can see the line. */
const PLAN={time:5.0,w:2.4,top:1.07,push:7,grip:1.35,marks:22,gap:3};

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
  bjorn:{name:'CYKLA MER!',
    text:'Hoppa upp på cykeln från takräcket i fyra sekunder. Lite extra fart, ingen bensin, och inget kan träffa dig.',
    use:rideBike,ai:s=>s.behind||s.close||Math.random()<0.004,
    icon:`<svg viewBox="0 0 48 48" fill="none" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="11" cy="32" r="8.5" stroke="#23272e" stroke-width="3"/><circle cx="37" cy="32" r="8.5" stroke="#23272e" stroke-width="3"/>
    <path d="M11 32 19 18H33L37 32M19 18 24 32 33 18M24 32H11" stroke="#2f8a5a" stroke-width="3"/>
    <path d="M17 13h6M33 18 31 11h5" stroke="#6b4a2a" stroke-width="3"/></svg>`},
  amanda:{name:'FÄRDPLANEN',
    text:'Vik upp kartan: idealspåret lyser på vägen i fem sekunder. Håll dig på det för mer grepp och lite fart.',
    use:unfoldPlan,ai:()=>true,
    icon:`<svg viewBox="0 0 48 48">
    <path d="M4 10 17 6 31 10 44 6V38L31 42 17 38 4 42Z" fill="#f4ecd2" stroke="#8a7a52" stroke-width="2" stroke-linejoin="round"/>
    <path d="M17 6V38M31 10V42" stroke="#c9bb92" stroke-width="1.6"/>
    <path d="M9 34Q14 18 22 24T39 12" fill="none" stroke="#1fb3d8" stroke-width="3" stroke-dasharray="4 3" stroke-linecap="round"/>
    <circle cx="39" cy="12" r="3" fill="#e0362a"/></svg>`}
};

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
        beard=psMat({color:0x6b4a2a}),glass=psMat({color:0x23272e}),tote=psMat({color:0xe8dcc0});
  const wheel=flat(new THREE.TorusGeometry(.62,.12,4,12)),bar=(l)=>flat(new THREE.BoxGeometry(.14,.14,l));
  return ()=>{
    const g=new THREE.Group(),m=(geo,mat,x,y,z,p)=>{const e=new THREE.Mesh(geo,mat);e.position.set(x,y,z);(p||g).add(e);return e;};
    for(const z of [-.95,.95]){const w=m(wheel,tyre,0,.62,z);w.rotation.y=Math.PI/2;}
    const tube=(a,b)=>{const d=new THREE.Vector3().subVectors(b,a),e=m(bar(d.length()),frame,0,0,0);
      e.position.copy(a).add(b).multiplyScalar(.5);e.lookAt(b.x,b.y,b.z);return e;};
    const V=(y,z)=>new THREE.Vector3(0,y,z);
    tube(V(.62,-.95),V(.62,0));tube(V(.62,0),V(1.4,-.35));tube(V(.62,0),V(1.45,.7));tube(V(1.4,-.35),V(1.45,.7));
    tube(V(1.45,.7),V(.62,.95));tube(V(.62,-.95),V(1.4,-.35));
    m(flat(new THREE.BoxGeometry(.24,.08,.34)),beard,0,1.5,-.4);                    /* saddle */
    m(flat(new THREE.BoxGeometry(.9,.07,.07)),chrome,0,1.62,.68);                   /* handlebar */
    /* Björn: corduroy blazer, round glasses, the beard and the tote bag */
    m(flat(new THREE.BoxGeometry(.62,.78,.42)),blazer,0,2.0,-.18).rotation.x=.35;
    m(flat(new THREE.BoxGeometry(.44,.44,.44)),skin,0,2.62,.04);
    m(flat(new THREE.BoxGeometry(.46,.22,.2)),beard,0,2.46,.2);
    m(flat(new THREE.BoxGeometry(.48,.08,.06)),glass,0,2.68,.27);
    m(flat(new THREE.BoxGeometry(.18,.6,.18)),blazer,-.34,1.9,.22).rotation.x=-.9;
    m(flat(new THREE.BoxGeometry(.18,.6,.18)),blazer, .34,1.9,.22).rotation.x=-.9;
    m(flat(new THREE.BoxGeometry(.1,.5,.4)),tote,.4,1.75,-.45);
    const legs=[-1,1].map(s=>{const hip=new THREE.Group();hip.position.set(s*.16,1.55,-.35);g.add(hip);
      m(flat(new THREE.BoxGeometry(.18,.8,.2)),trousers,0,-.4,0,hip);return hip;});
    g.userData.legs=legs;g.visible=false;g.scale.setScalar(1.3);
    return g;
  };
})();
function rideBike(k){
  k.bike=BIKE.time;k.drift=0;k.charge=0;
  if(!k.bikeG||k.bikeG.parent!==k.v.root){k.bikeG=bikeParts();k.v.root.add(k.bikeG);}   /* a new vehicle needs a new bike */
  bikeShow(k,true);
  for(let p=0;p<14;p++)puff(k.x+rand(-1,1),k.y+rand(.3,1.8),k.z+rand(-1,1),.7,.9,.75,.5);
  if(k===player){toast('CYKLA MER! JAG CYKLAR EGENTLIGEN');ping(900,1500,.12);}
}
/** swap the vehicle for the bike and back */
function bikeShow(k,on){
  for(const c of k.v.root.children)c.visible=c===k.bikeG?on:!on;
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

/* ── shared: what physics reads, the timers, the clean-up ── */
const sigTop=k=>(k.tow>0?TOW.top:1)*(k.towed>0?TOW.drag:1)*(k.bike>0?BIKE.top:1)*(k.onPlan?PLAN.top:1);
const sigGrip=k=>(k.bike>0?BIKE.grip:1)*(k.onPlan?PLAN.grip:1);
const sigPush=(k,thr)=>(k.tow>0?TOW.push:0)+thr*((k.bike>0?BIKE.push:0)+(k.onPlan?PLAN.push:0));
function updateSigs(dt){
  for(const k of karts){
    if(k.tow>0)k.tow=Math.max(0,k.tow-dt);
    if(k.towed>0)k.towed=Math.max(0,k.towed-dt);
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
}
function clearSigs(){
  for(const k of karts){
    k.tow=0;k.towed=0;k.fplan=0;k.onPlan=false;
    if(k.bike>0||k.bikeG){k.bike=0;if(k.bikeG)bikeShow(k,false);}
    if(k.planG)k.planG.visible=false;
  }
}
