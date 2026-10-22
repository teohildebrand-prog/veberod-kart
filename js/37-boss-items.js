"use strict";
/* ───────── the champions' signature items ───────── */
/* Three of the four Skåne champions' own items, in the same pool as everyone else's
   (37-signature-items.js), so any driver can get them from a box:
   Spöket's BUUU!, Vikingahövdingen's STORMFLODEN and Raket-Rune's 3-2-1 ÖVERLJUD!.
   Whoever uses one, the ghost, the wave and the rocket come with it. Tune it here. */

/* BUUU!: a sheet ghost rises out of the kart, rattles its chains and howls. Every kart close by
   jumps out of its seat: a hop, lost speed and a startled swerve away from the ghost. A shield
   stays calm. */
const BOO={
  warn:0.4,         /* seconds the ghost rises before the howl */
  r:20,             /* metres: how far the howl scares */
  hop:6.4,          /* the jump out of the seat, m/s up (short of a SNYGGT HOPP) */
  keep:0.62,        /* the speed kept */
  slow:0.55,        /* the wobble after */
  shove:6,          /* m/s sideways, away from the ghost */
  time:1.5,         /* seconds the ghost hangs about in all */
  shock:1.2,        /* seconds the '!' stays over a scared kart */
  side:2.4          /* metres to the side of the kart the ghost floats */
};
/* Stormfloden: a wave rolls up the road from behind, catches the kart and carries it. Surfing it
   is a long push that ignores the throttle; every kart the wave reaches, on the way up or under
   the surfer's nose, is washed aside. A shield keeps its line. */
const FLOOD={
  back:30,          /* metres behind the kart where the wave rises */
  catch:24,         /* m/s faster than the kart while it catches up */
  min:42,           /* and never slower than this */
  wait:1.6,         /* the longest it takes to arrive */
  time:3.4,         /* seconds of surfing */
  top:1.2,          /* top speed on the wave, as a share of your own */
  push:22,          /* forward push on the wave, m/s² */
  grip:1.25,        /* the wave holds you in the corners */
  front:6,          /* metres in front of the surfer the wave still sweeps */
  shove:11,         /* m/s sideways, out of the wave's path */
  slow:0.6,         /* the wobble after */
  keep:0.75,        /* the speed kept */
  fade:0.5          /* seconds the wave takes to break */
};
/* 3-2-1 Överljud!: Raket-Rune's countdown. Three beats crawling while the rocket spools up, then
   the biggest boost in the game, and the moment it breaks the sound barrier the shock wave throws
   every kart close by off its line. Fire it with a straight in front of you. */
const RUNE={
  count:1.5,        /* seconds of 3-2-1 */
  crawl:0.55,       /* top speed while it counts, as a share of your own */
  burn:2.6,         /* seconds of rocket */
  top:1.15,         /* top speed on top of the boost */
  push:26,          /* forward push while it burns, m/s² */
  r:18,             /* metres: the sonic boom's reach */
  shove:12,         /* m/s sideways, away from the rocket */
  keep:0.8,         /* the speed kept */
  hop:3.5,          /* and up */
  slow:0.5,         /* the wobble after */
  look:[20,140],    /* metres up the road the AI wants straight before it counts down */
  bend:0.5          /* the sharpest corner (radians over 14 samples) it calls straight */
};

SIGS.spoket={name:'BUUU!',
  text:'Ett lakanspöke reser sig ur bilen, skramlar med kedjorna och tjuter. Alla bilar i närheten hoppar högt i sätet, tappar fart och viker undan. En sköld blir inte rädd.',
  use:summonBoo,ai:(s,k)=>booTargets(k,BOO.r*.8).length>0,
  icon:`<svg viewBox="0 0 48 48">
    <path d="M10 44V22a14 14 0 0 1 28 0v22l-4.7-4-4.6 4-4.7-4-4.7 4-4.6-4Z" fill="#e6eef4" stroke="#4a5866" stroke-width="2" stroke-linejoin="round"/>
    <rect x="16" y="18" width="5" height="7" rx="1" fill="#161a24"/><rect x="27" y="18" width="5" height="7" rx="1" fill="#161a24"/>
    <ellipse cx="24" cy="31" rx="3.4" ry="4.4" fill="#161a24"/>
    <path d="M10 28 3 20M38 28l7-8" stroke="#e6eef4" stroke-width="5" stroke-linecap="round"/>
    <path d="M4 34h4M3 39h4M40 34h4M41 39h4" stroke="#6a727c" stroke-width="2.6" stroke-linecap="round"/></svg>`};
SIGS.viking={name:'STORMFLODEN',
  text:'En jättevåg rullar upp bakifrån och tar dig med. Du surfar på den i över tre sekunder, och alla bilar vågen hinner ikapp spolas åt sidan.',
  use:raiseFlood,ai:s=>s.ahead||s.behind,
  icon:`<svg viewBox="0 0 48 48">
    <path d="M2 44V30Q4 10 24 6q16-2 20 10-8-6-15-1 7 0 9 8-6-4-12 1-6 6-6 20Z" fill="#2a6ab8" stroke="#16365e" stroke-width="2" stroke-linejoin="round"/>
    <path d="M24 6q16-2 20 10-8-6-15-1" fill="none" stroke="#f4f8fc" stroke-width="3" stroke-linecap="round"/>
    <path d="M24 32h14l4-6H28Z" fill="#7a4a2a" stroke="#3a2214" stroke-width="2" stroke-linejoin="round"/>
    <path d="M42 26l2-5" stroke="#3a2214" stroke-width="2" stroke-linecap="round"/>
    <path d="M18 44q6-4 12 0t12 0" fill="none" stroke="#9fd8ff" stroke-width="3" stroke-linecap="round"/></svg>`};
SIGS.rune={name:'3-2-1 ÖVERLJUD!',
  text:'Nedräkning: tre, två, ett medan raketen värms upp och du kryper fram. Sedan den största boosten i spelet, och när du spräcker ljudvallen kastas alla bilar runt dig av linjen. Spara den till en raksträcka.',
  use:countDown,ai:(s,k)=>runeStraight(k),
  icon:`<svg viewBox="0 0 48 48">
    <circle cx="24" cy="24" r="21" fill="none" stroke="#f4f8fc" stroke-width="2" stroke-dasharray="4 3"/>
    <path d="M24 5c6 5 8 12 8 20v9H16v-9c0-8 2-15 8-20Z" fill="#f2f2f4" stroke="#23272e" stroke-width="2"/>
    <path d="M16 34l-5 6 5-1M32 34l5 6-5-1" fill="#d82a2a" stroke="#23272e" stroke-width="2" stroke-linejoin="round"/>
    <circle cx="24" cy="18" r="3.4" fill="#1a2a44"/><path d="M17 26h14" stroke="#d82a2a" stroke-width="3"/>
    <path d="M20 36l4 10 4-10" fill="#ffa83a"/></svg>`};

/* ── shared ── */
const _bp=new THREE.Vector3();
const facing=(g,x,z)=>{g.rotation.y=Math.atan2(camera.position.x-x,camera.position.z-z);};
/** a flat expanding ring on the ground: the howl's mist and the sonic boom */
const pulses=[];
const pulseGeo=(function(){const g=new THREE.RingGeometry(.86,1,28);g.rotateX(-Math.PI/2);return g;})();
function pulse(x,y,z,r,life,color){
  const mat=psMat({color,unlit:true,transparent:true,opacity:.7,depthWrite:false,side:THREE.DoubleSide});
  const m=new THREE.Mesh(pulseGeo,mat);m.position.set(x,y+.3,z);m.scale.setScalar(.1);scene.add(m);
  pulses.push({m,mat,r,life,t:0});
}
/** a kart thrown off its line, sideways away from k (never on up the road: that would be a gift),
    with a hop; true unless a shield took it */
function knock(o,k,shove,hop,keep,slow){
  if(blockHit(o))return false;
  const Fx=Math.sin(k.yaw),Fz=Math.cos(k.yaw),l=-(o.x-k.x)*Fz+(o.z-k.z)*Fx;
  const s=Math.abs(l)>.3?Math.sign(l):(Math.random()<.5?-1:1);
  sideways(o,-Fz*s,Fx*s,shove,keep);
  if(!o.air&&hop>0)o.vy=Math.max(o.vy,hop);
  o.slow=Math.max(o.slow,slow);o.boost=0;o.drift=0;o.charge=0;
  return true;
}
/** speed kept, plus a shove along (dx,dz) */
function sideways(o,dx,dz,shove,keep){o.vx=o.vx*keep+dx*shove;o.vz=o.vz*keep+dz*shove;}

/* ── BUUU! ── */
function booTargets(k,r){
  return karts.filter(o=>sigHittable(o,k)&&Math.abs(o.y-k.y)<4&&Math.hypot(o.x-k.x,o.z-k.z)<r);
}
const booParts=(function(){
  const hole=psMat({color:0x101018,unlit:true}),iron=psMat({color:0x6a727c});
  const body=flat(new THREE.ConeGeometry(1.3,3.0,8,1,true)),head=flat(new THREE.SphereGeometry(.95,8,6)),
        hem=flat(new THREE.ConeGeometry(.34,.6,4)),arm=flat(new THREE.CylinderGeometry(.22,.34,1.7,5));
  return ()=>{
    const sheet=psMat({color:0xeef4ff,unlit:true,transparent:true,opacity:.85,depthWrite:false,side:THREE.DoubleSide});
    const g=new THREE.Group(),fig=new THREE.Group();g.add(fig);
    sigMesh(fig,body,sheet,0,1.5,0);sigMesh(fig,head,sheet,0,3.3,0);
    for(let n=0;n<8;n++){const a=n/8*Math.PI*2;                                /* the ragged hem */
      sigMesh(fig,hem,sheet,Math.sin(a)*1.2,.05,Math.cos(a)*1.2).rotation.x=Math.PI;}
    for(const s of [-1,1]){
      sigMesh(fig,sigBox(.26,.4,.1),hole,s*.34,3.45,.86);                       /* eyes */
      const a=sigMesh(fig,arm,sheet,s*1.2,2.9,.2);a.rotation.z=-s*.75;           /* arms up: BUUU */
      for(let c=0;c<4;c++)sigMesh(fig,sigBox(.16,.16,.26),iron,s*(1.62+c*.05),2.2-c*.3,.3+c*.05);   /* chains */
    }
    const mouth=sigMesh(fig,sigBox(.42,.56,.1),hole,0,2.98,.9);
    g.userData={fig,mouth,sheet};g.visible=false;scene.add(g);return g;};
})();
const booMarkParts=(function(){
  const tex=pixTex(16,32,g=>{g.fillStyle='#fff8d0';g.fillRect(5,2,6,18);g.fillRect(5,24,6,6);
    g.fillStyle='#23272e';g.fillRect(4,1,1,20);g.fillRect(11,1,1,20);g.fillRect(4,23,1,8);g.fillRect(11,23,1,8);});
  const mat=psMat({map:tex,unlit:true,transparent:true,alphaTest:.5,side:THREE.DoubleSide}),
        geo=new THREE.PlaneGeometry(.7,1.4);
  return ()=>{const m=new THREE.Mesh(geo,mat);m.visible=false;scene.add(m);return m;};
})();
const boos=[];
function summonBoo(k){
  const g=booParts();g.visible=true;
  boos.push({owner:k,g,t:0,howled:false});
  const d=Math.hypot(player.x-k.x,player.z-k.z);
  if(d<80)audioTone(180,420,.55,.07*(1-d/100)+.02,'triangle');               /* hoooo... */
  if(k===player)toast('BUUU! SPÖKET VAKNAR');
}
function howl(B){
  const k=B.owner,ts=booTargets(k,BOO.r);
  pulse(k.x,k.y,k.z,BOO.r,.6,0xdfe8ff);
  const d=Math.hypot(player.x-k.x,player.z-k.z);
  if(d<90){audioTone(320,110,.6,.12*(1-d/110)+.02,'sawtooth');audioTone(150,90,.5,.06*(1-d/110)+.01,'square',.05);}
  for(let p=0;p<12;p++)puff(k.x+rand(-2,2),k.y+rand(1,4),k.z+rand(-2,2),.92,.95,1,.6);
  let hits=0;
  for(const o of ts){
    if(!knock(o,k,BOO.shove,BOO.hop,BOO.keep,BOO.slow)){if(k===player)toast(o.name+' BLEV INTE RÄDD');continue;}
    o.scared=BOO.shock;hits++;
    if(!o.booMark)o.booMark=booMarkParts();
    if(o===player){toast('AAAH! SPÖKE!');shake=Math.min(1,shake+.45);}
  }
  if(!ts.length)sigMiss(k,'INGEN ATT SKRÄMMA');
  else if(k===player&&hits)setTimeout(()=>toast(hits>1?hits+' SKRÄMDA FRÅN VETTET':'SKRÄMD FRÅN VETTET'),500);
}
function updateBoos(dt){
  for(let n=boos.length-1;n>=0;n--){
    const B=boos[n],k=B.owner;B.t+=dt;
    if(!B.howled&&B.t>=BOO.warn){B.howled=true;if(!k.parked)howl(B);}
    if(B.t>BOO.time||k.parked){scene.remove(B.g);boos.splice(n,1);}
  }
}
function drawBoos(){
  for(const B of boos){
    const k=B.owner,U=B.g.userData,u=Math.min(1,B.t/BOO.warn),out=Math.max(0,(B.t-BOO.time+.45)/.45);
    rideWith(B.g,k,.5,BOO.side,.3+u*1.2+Math.sin(clock*4)*.15);   /* beside the kart, out of the driver's view */
    facing(U.fig,B.g.position.x,B.g.position.z);U.fig.rotation.y-=k.yaw;   /* the face to the camera */
    const s=B.howled?.85+Math.sin(clock*30)*.05*(1-out):.25+u*.55;B.g.scale.setScalar(s);
    U.mouth.scale.y=B.howled?1.6:1;
    U.sheet.uniforms.uOpacity.value=(k===player?.6:.85)*(1-out);
  }
  for(const k of karts){
    if(!k.booMark)continue;
    const on=!k.parked&&k.scared>0;k.booMark.visible=on;
    if(on){k.booMark.position.set(k.x,k.y+3.4+Math.abs(Math.sin(clock*9))*.3,k.z);facing(k.booMark,k.x,k.z);}
  }
}

/* ── Stormfloden ── */
const waveParts=(function(){
  const body=sigBox(1,1,1);
  return ()=>{
    const water=psMat({color:0x2a6ab8,transparent:true,opacity:.9,depthWrite:false}),
          deep=psMat({color:0x16365e,transparent:true,opacity:.9,depthWrite:false}),
          foam=psMat({color:0xf4f8fc,unlit:true,transparent:true,opacity:.95,depthWrite:false});
    const g=new THREE.Group(),w=new THREE.Group();g.add(w);
    /* local z=0 is where the surfer sits, riding down the face; the crest stays behind and below
       the chase camera's line to the kart, so the player still sees their own kart on it */
    sigMesh(w,body,deep,0,1.05,-5.75).scale.set(1,2.1,3.5);
    const face=sigMesh(w,body,water,0,1.1,-3.9);face.scale.set(1,.3,4.74);face.rotation.x=.48;   /* the slope up behind the kart */
    sigMesh(w,body,water,0,2.4,-6.6).scale.set(1,.6,1.8);
    const lip=sigMesh(w,body,water,0,2.45,-5.3);lip.scale.set(1,.4,1.4);lip.rotation.x=.5;      /* curling over */
    const crest=[];
    for(let n=0;n<9;n++){const c=sigMesh(w,body,foam,(n/8-.5)*.96,2.8,-5.6-(n%3)*.5);c.scale.set(.14,.35,.6);crest.push(c);}
    sigMesh(w,body,foam,0,.12,-1.4).scale.set(1,.24,1.4);                                        /* the wash at its foot */
    g.userData={w,crest,mats:[water,deep,foam]};scene.add(g);return g;};
})();
const waves=[];
function raiseFlood(k){
  const g=waveParts(),s=((k.mi-FLOOD.back/SEG)%N+N)%N;
  const W={owner:k,g,s,t:0,phase:k.rib?'surf':'come',hit:new Set([k]),end:0};
  waves.push(W);
  if(W.phase==='surf')k.flood=FLOOD.time;
  const d=Math.hypot(player.x-k.x,player.z-k.z);
  if(d<90){audioTone(70,140,.6,.12*(1-d/110)+.02,'sawtooth');audioTone(900,300,.5,.03,'sine',.2);}
  if(k===player)toast('STORMFLODEN! SURFA!');
}
/** washed out of the wave's path, along (ox,oz): toward the side of the road the kart is already on */
function wash(W,o,ox,oz){
  W.hit.add(o);
  const k=W.owner;
  for(let p=0;p<14;p++)puff(o.x+rand(-1.5,1.5),o.y+rand(.3,2.4),o.z+rand(-1.5,1.5),.75,.9,1,.6);
  if(blockHit(o)){if(k===player)toast(o.name+' HÖLL LINJEN');return;}
  sideways(o,ox,oz,FLOOD.shove,FLOOD.keep);o.slow=Math.max(o.slow,FLOOD.slow);o.boost=0;o.drift=0;o.charge=0;
  if(o===player){toast('SPOLAD ÅT SIDAN!');shake=Math.min(1,shake+.4);}
  else if(k===player)toast(o.name+' SPOLADES BORT');
}
function updateWaves(dt){
  for(let n=waves.length-1;n>=0;n--){
    const W=waves[n],k=W.owner;W.t+=dt;
    if(W.phase==='come'){                              /* rolling up the main road from behind */
      const v=Math.max(k.speed+FLOOD.catch,FLOOD.min);
      W.s=(W.s+v*dt/SEG)%N;
      for(const o of karts){
        if(W.hit.has(o)||!sigHittable(o,k)||o.rib)continue;
        const d=sigWrap(o.mi-W.s)*SEG;
        if(d>-2&&d<2.5){const i=Math.round(o.mi)%N,sd=o.lat>=0?1:-1;wash(W,o,rx[i]*sd,rz[i]*sd);}
      }
      if(k.parked){W.phase='break';W.end=W.t;}
      else if(sigWrap(k.mi-W.s)*SEG<1||k.rib||W.t>FLOOD.wait){W.phase='surf';k.flood=FLOOD.time;
        for(let p=0;p<16;p++)puff(k.x+rand(-2,2),k.y+rand(.5,3),k.z+rand(-2,2),.8,.92,1,.6);
        if(k===player)ping(300,700,.2);}
    }else if(W.phase==='surf'){                        /* under the kart: anyone just in front is swept aside */
      const Fx=Math.sin(k.yaw),Fz=Math.cos(k.yaw),hw=(k.rib?ALTS[k.rib-1].hw:HW)+1;
      for(const o of karts){
        if(W.hit.has(o)||!sigHittable(o,k)||Math.abs(o.y-k.y)>3)continue;
        const dx=o.x-k.x,dz=o.z-k.z,f=dx*Fx+dz*Fz,l=-dx*Fz+dz*Fx;
        if(f>-1.5&&f<FLOOD.front&&Math.abs(l)<hw){const sd=l>=0?1:-1;wash(W,o,-Fz*sd,Fx*sd);}
      }
      if(Math.random()<.5)puff(k.x+rand(-3,3),k.y+rand(1,4),k.z+rand(-3,3),.85,.95,1,.4);
      if(!(k.flood>0)||k.parked){W.phase='break';W.end=W.t;k.flood=0;}
    }else if(W.t-W.end>FLOOD.fade){scene.remove(W.g);waves.splice(n,1);}
  }
}
function drawWaves(){
  for(const W of waves){
    const k=W.owner,U=W.g.userData,hw=W.phase==='come'||!k.rib?HW:ALTS[k.rib-1].hw;
    if(W.phase==='come'){
      const i=Math.floor(W.s);roadPt(i,0,0,_bp);W.g.position.copy(_bp);W.g.rotation.set(0,Math.atan2(fx[i],fz[i]),0);
      const rise=Math.min(1,W.t/.4);U.w.scale.set(2*hw+3,rise,1);
    }else{
      const out=W.phase==='break'?Math.min(1,(W.t-W.end)/FLOOD.fade):0;
      rideWith(W.g,k,0,0,-.2);W.g.position.y=Math.min(W.g.position.y,groundK(k,k.x,k.z)-.2);   /* on the road under a jump */
      U.w.scale.set(2*hw+3,(1-out*.85)*(k===player?.8:1),1+out*.5);   /* a little lower under the chase camera */
      for(const m of U.mats)m.uniforms.uOpacity.value=(m===U.mats[2]?.95:.9)*(1-out);
    }
    U.crest.forEach((c,q)=>{c.position.y=2.8+Math.sin(clock*9+q*1.7)*.25;});
  }
}

/* ── 3-2-1 Överljud! ── */
function runeStraight(k){
  if(k.rib)return false;
  for(let d=RUNE.look[0];d<RUNE.look[1];d+=SEG*4)if(curv[(Math.round(k.mi+d/SEG)%N+N)%N]>RUNE.bend)return false;
  return true;
}
const digitTex=['1','2','3'].map(n=>pixTex(32,32,g=>{
  g.fillStyle='#d82a2a';g.fillRect(2,2,28,28);g.fillStyle='#f2f2f4';g.fillRect(4,4,24,24);
  g.fillStyle='#d82a2a';g.font='bold 24px monospace';g.textAlign='center';g.textBaseline='middle';g.fillText(n,16,17);}));
const countParts=(function(){
  const geo=new THREE.PlaneGeometry(1.5,1.5);
  return ()=>{const mat=psMat({map:digitTex[2],unlit:true,side:THREE.DoubleSide}),m=new THREE.Mesh(geo,mat);
    m.userData.mat=mat;m.visible=false;scene.add(m);return m;};
})();
const rocketParts=(function(){
  const flame=psMat({color:0xffa83a,unlit:true}),core=psMat({color:0xfff1a8,unlit:true});
  const cone=flat(new THREE.ConeGeometry(.55,2.6,7)),inner=flat(new THREE.ConeGeometry(.3,1.6,6));
  return ()=>{const g=new THREE.Group();
    const f=sigMesh(g,cone,flame,0,1.1,-3.0);f.rotation.x=-Math.PI/2;              /* tip backwards */
    const c=sigMesh(g,inner,core,0,1.1,-2.6);c.rotation.x=-Math.PI/2;
    g.userData={f,c};g.visible=false;scene.add(g);return g;};
})();
/** the vapour cone round the kart the moment it goes supersonic */
const vapourGeo=(function(){const g=new THREE.ConeGeometry(2.3,4.6,12,1,true);g.rotateX(Math.PI/2);return g;})();
const vapours=[];
function vapour(k){
  const mat=psMat({color:0xf4f8fc,unlit:true,transparent:true,opacity:.6,depthWrite:false,side:THREE.DoubleSide});
  const m=new THREE.Mesh(vapourGeo,mat);scene.add(m);vapours.push({k,m,mat,t:0});
}
function countDown(k){
  k.rcount=RUNE.count;k.rburn=0;k.rbeat=3;k.boost=0;
  if(!k.countG)k.countG=countParts();
  if(!k.rocketG)k.rocketG=rocketParts();
  beat(k,3);
}
function beat(k,n){
  k.countG.userData.mat.uniforms.uMap.value=digitTex[n-1];
  const d=Math.hypot(player.x-k.x,player.z-k.z);
  if(d<70)audioTone(660,660,.12,.05*(1-d/90)+.02,'square');
  if(k===player)flash(String(n));
}
function ignite(k){
  k.rcount=0;k.rburn=RUNE.burn;k.boost=Math.max(k.boost,RUNE.burn);k.boostLvl=1;
  vapour(k);pulse(k.x,k.y,k.z,RUNE.r,.45,0xf4f8fc);
  for(let p=0;p<18;p++)puff(k.x+rand(-2.5,2.5),k.y+rand(.3,2.4),k.z+rand(-2.5,2.5),.95,.95,.95,.7);
  const d=Math.hypot(player.x-k.x,player.z-k.z);
  if(d<120){const v=1-d/140;audioTone(1100,180,.12,.09*v,'square');audioTone(90,45,.6,.16*v,'sawtooth',.02);
    shake=Math.min(1,shake+clamp(.7-d*.008,.1,.7));}
  if(k===player)flash('ÖVERLJUD!');
  for(const B of mouthsNear(k,OPEN.r))openPassage(B,k);   /* the boom blows a passage open: 40-genvagar.js */
  let hits=0;
  for(const o of karts){
    if(!sigHittable(o,k)||Math.abs(o.y-k.y)>4||Math.hypot(o.x-k.x,o.z-k.z)>RUNE.r)continue;
    if(!knock(o,k,RUNE.shove,RUNE.hop,RUNE.keep,RUNE.slow)){if(k===player)toast(o.name+' STOD EMOT');continue;}
    hits++;
    if(o===player)toast('ÖVERLJUDSSMÄLL! '+k.name);
  }
  if(k===player&&hits)setTimeout(()=>toast(hits>1?hits+' AV LINJEN':'AV LINJEN!'),500);
}
function updateRune(dt){
  for(const k of karts){
    if(k.rcount>0){
      if(k.parked||k.done){k.rcount=0;continue;}       /* finished mid-count: no rocket */
      k.rcount=Math.max(0,k.rcount-dt);
      const n=Math.ceil(k.rcount/(RUNE.count/3));
      if(k.rcount<=0)ignite(k);
      else if(n<k.rbeat){k.rbeat=n;beat(k,n);}
      if(Math.random()<.4)puff(k.x-Math.sin(k.yaw)*2.6,k.y+.8,k.z-Math.cos(k.yaw)*2.6,.7,.7,.7,.4);   /* spooling up */
    }else if(k.rburn>0){
      k.rburn=Math.max(0,k.rburn-dt);
      if(Math.random()<.7)puff(k.x-Math.sin(k.yaw)*3.6+rand(-.3,.3),k.y+1+rand(-.3,.3),k.z-Math.cos(k.yaw)*3.6+rand(-.3,.3),.8,.8,.8,.5);
    }
  }
  for(let n=vapours.length-1;n>=0;n--){
    const V=vapours[n];V.t+=dt;
    if(V.t>.55){scene.remove(V.m);vapours.splice(n,1);}
  }
}
function drawRune(){
  for(const k of karts){
    if(k.countG){const on=!k.parked&&k.rcount>0;k.countG.visible=on;
      if(on){rideWith(k.countG,k,0,0,3.6);facing(k.countG,k.x,k.z);
        const u=(k.rcount%(RUNE.count/3))/(RUNE.count/3);k.countG.scale.setScalar(1+u*.35);}}
    if(k.rocketG){const on=!k.parked&&(k.rburn>0||k.rcount>0);k.rocketG.visible=on;
      if(on){rideWith(k.rocketG,k,0,0,0);
        const U=k.rocketG.userData,s=k.rburn>0?1+Math.sin(clock*40)*.15:.25+Math.random()*.15;   /* a pilot light while it counts */
        U.f.scale.set(1,s,1);U.c.scale.set(1,s,1);U.f.position.z=-1.8-1.3*s;U.c.position.z=-1.8-.8*s;}}
  }
  for(const V of vapours){
    rideWith(V.m,V.k,.6,0,1.2);const u=V.t/.55;
    V.m.scale.setScalar(.8+u*.9);V.mat.uniforms.uOpacity.value=.6*(1-u);
  }
}

/* ── what physics reads, the timers, the drawing, the clean-up: called from 37-signature-items.js ── */
const bossTop=k=>(k.flood>0?FLOOD.top:1)*(k.rcount>0?RUNE.crawl:1)*(k.rburn>0?RUNE.top:1);
const bossGrip=k=>k.flood>0?FLOOD.grip:1;
const bossPush=k=>(k.flood>0?FLOOD.push:0)+(k.rburn>0?RUNE.push:0);   /* the wave and the rocket push, throttle or not */
function updateBoss(dt){
  for(const k of karts){
    if(k.scared>0)k.scared=Math.max(0,k.scared-dt);
    if(k.flood>0)k.flood=Math.max(0,k.flood-dt);
  }
  updateBoos(dt);updateWaves(dt);updateRune(dt);
  for(let n=pulses.length-1;n>=0;n--){
    const P=pulses[n];P.t+=dt;const u=P.t/P.life;
    if(u>=1){scene.remove(P.m);pulses.splice(n,1);continue;}
    P.m.scale.setScalar(P.r*u);P.mat.uniforms.uOpacity.value=.7*(1-u);
  }
}
function drawBoss(){drawBoos();drawWaves();drawRune();}
function clearBoss(){
  for(const k of karts){
    k.scared=0;k.flood=0;k.rcount=0;k.rburn=0;
    for(const g of [k.booMark,k.countG,k.rocketG])if(g)g.visible=false;
  }
  for(const B of boos)scene.remove(B.g);
  for(const W of waves)scene.remove(W.g);
  for(const P of pulses)scene.remove(P.m);
  for(const V of vapours)scene.remove(V.m);
  boos.length=0;waves.length=0;pulses.length=0;vapours.length=0;
}
