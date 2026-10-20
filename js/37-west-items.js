"use strict";
/* ───────── west-coast signature items ───────── */
/* The six west-coast drivers' own items, in the same pool as everyone else's (37-signature-items.js):
   Regnmolnet's Skyfallet, Hamnkranen's Containern, Slusstrollet's Slussporten, Aspenmonstret's
   Dyket, Kapten Mås's Räkmackan and Domaren's Offside. Two of them stand a wall on the main
   road (the container and the lock gate): sigWalls, which physics bumps karts off and the AI
   steers round. The drivers' own quirks (k.wet, k.glide, k.shy, k.ref) live here too. Tune it here. */

/* Skyfallet: a rain cloud parks over the next kart ahead and pours. Their tyres slide as on a wet
   road, and the player sees rain and wipers on the screen. Regnmolnet is always wet anyway. */
const RAIN={reach:90,time:4.0,grip:0.45};
/* Containern: a red shadow lands on the road in front of the next kart ahead, a second later a
   container drops into it and stands there as a wall. It covers a third of the road, so there is
   always a way round. Drive into it and you bounce straight back, no spin. Jump it if you can. */
const BOX={reach:120,warn:1.0,stay:4.5,lift:0.7,len:6.1,deep:2.6,h:2.6,lead:14,bounce:0.3};
/* Slussporten: a lock gate rises out of the road behind Slusstrollet and stays shut a while. It
   covers most of the road from his side, leaving a gap on the other. */
const GATE={back:12,rise:0.6,stay:5.0,sink:0.5,span:0.7,deep:1.2,h:2.3,pier:3.9};
/* Dyket: Aspenmonstret dives under the road like a lake and comes up again. Nothing can touch it
   under there: items, hazards and other karts pass over. */
const DIVE={time:2.0};
/* Räkmackan: a seagull flies to the nearest kart ahead holding an item, snatches it and brings it
   back. A shield shoos the gull away. */
const GULL={reach:140,fly:0.5};
/* Offside: the whistle goes, the leader (the next one down if that is you) is shown the yellow
   card and has to slow for three seconds. A shield argues it off. */
const OFFSIDE={time:3.0,top:0.72};
/* quirks */
const SHY={r:4.5,boost:0.55,cool:4.0};            /* Aspenmonstret: a startled hop when anyone gets close */
const GLIDE=24;                                    /* Kapten Mås: gravity while falling, against 34 */
const REF_TOP=1.02;                                /* Domaren: tilläggstid on the last lap */
const KR=1.2;                                      /* a kart's radius against a wall */

SIGS.regnmolnet={name:'SKYFALLET',
  text:'Ett regnmoln ställer sig över bilen framför i fyra sekunder. Vägen blir blöt och däcken glider.',
  use:castRain,ai:(s,k)=>!!rainTarget(k)&&(s.near||Math.random()<0.01),
  icon:`<svg viewBox="0 0 48 48">
    <path d="M12 26a8 8 0 0 1 2-15.7A11 11 0 0 1 35 12a7.5 7.5 0 0 1 1 14.9Z" fill="#7c8794" stroke="#3a414a" stroke-width="2"/>
    <path d="M14 31l-3 7M22 31l-3 9M30 31l-3 7M38 31l-3 9" stroke="#4fa8ff" stroke-width="3" stroke-linecap="round"/>
    <path d="M17 18q3-3 7-1" fill="none" stroke="#c9d0d8" stroke-width="2" stroke-linecap="round"/></svg>`};
SIGS.hamnkranen={name:'CONTAINERN',lane:false,
  text:'En container släpps framför bilen före dig. Röd skugga först, sedan en vägg en stund. Kör in i den och du studsar tillbaka.',
  use:dropContainer,ai:(s,k)=>!!boxTarget(k),
  icon:`<svg viewBox="0 0 48 48">
    <path d="M24 2v10" stroke="#23272e" stroke-width="2.4"/><path d="M14 12h20" stroke="#23272e" stroke-width="2.4"/>
    <path d="M16 12 9 22M32 12l7 10" stroke="#23272e" stroke-width="1.6"/>
    <rect x="5" y="22" width="38" height="17" fill="#f08a1c" stroke="#8a4a10" stroke-width="2"/>
    <path d="M11 24v13M17 24v13M23 24v13M29 24v13M35 24v13" stroke="#c46a10" stroke-width="2"/>
    <ellipse cx="24" cy="44" rx="20" ry="3" fill="#e0362a" opacity=".8"/></svg>`};
SIGS.slusstrollet={name:'SLUSSPORTEN',lane:false,
  text:'En slussport reser sig ur vägen bakom dig och står stängd i fem sekunder. Det finns en lucka på andra sidan.',
  use:raiseGate,ai:s=>s.behind,
  icon:`<svg viewBox="0 0 48 48">
    <rect x="3" y="10" width="8" height="30" fill="#8a8f96" stroke="#4a4e56" stroke-width="2"/>
    <rect x="11" y="16" width="26" height="22" fill="#7a5a3a" stroke="#3a2a1a" stroke-width="2"/>
    <path d="M11 23h26M11 30h26M24 16v22" stroke="#3a2a1a" stroke-width="2"/>
    <path d="M2 44q6-4 12 0t12 0 12 0 10 0" fill="none" stroke="#4fa8ff" stroke-width="3"/></svg>`};
SIGS.aspenmonstret={name:'DYKET',
  text:'Dyk ner under vägen i två sekunder. Inget kan träffa dig där nere: saker, faror och bilar åker över.',
  use:startDive,ai:s=>s.behind||s.close,
  icon:`<svg viewBox="0 0 48 48">
    <ellipse cx="24" cy="32" rx="21" ry="9" fill="#1f4a6a"/>
    <path d="M10 30q4-14 14-14t14 14" fill="#3f7a4a" stroke="#1f3a24" stroke-width="2"/>
    <circle cx="19" cy="22" r="3.4" fill="#fff"/><circle cx="29" cy="22" r="3.4" fill="#fff"/>
    <circle cx="19.6" cy="22.6" r="1.6" fill="#15161a"/><circle cx="29.6" cy="22.6" r="1.6" fill="#15161a"/>
    <circle cx="8" cy="14" r="2.4" fill="none" stroke="#9fd8ff" stroke-width="1.6"/><circle cx="40" cy="10" r="3" fill="none" stroke="#9fd8ff" stroke-width="1.6"/></svg>`};
SIGS.kaptenmas={name:'RÄKMACKAN',
  text:'En mås flyger till närmaste bil framför som har en sak, snor den och kommer tillbaka med den. En sköld schasar bort måsen.',
  use:sendGull,ai:(s,k)=>!!gullTarget(k),
  icon:`<svg viewBox="0 0 48 48">
    <path d="M4 18q10-8 20 2 10-10 20-2-9 0-14 8h-12q-5-8-14-8Z" fill="#f4f6f8" stroke="#4a4e56" stroke-width="2" stroke-linejoin="round"/>
    <path d="M27 20l6 2-6 1" fill="#f0c030"/>
    <rect x="12" y="32" width="24" height="7" rx="2" fill="#d8a85a" stroke="#8a6a32" stroke-width="2"/>
    <path d="M15 31q3-4 6 0M22 31q3-4 6 0M29 31q3-4 5 0" fill="none" stroke="#f08aa0" stroke-width="3" stroke-linecap="round"/>
    <path d="M13 30h22" stroke="#6fbf4a" stroke-width="2"/></svg>`};
SIGS.domaren={name:'OFFSIDE',
  text:'Visslan går! Ledaren får gult kort och måste sakta in i tre sekunder. Leder du själv får tvåan det.',
  use:callOffside,ai:(s,k)=>k.place>1&&!!herdTarget(k),
  icon:`<svg viewBox="0 0 48 48">
    <rect x="22" y="4" width="18" height="26" rx="2" fill="#f2d21a" stroke="#8a7a10" stroke-width="2" transform="rotate(12 31 17)"/>
    <circle cx="14" cy="34" r="8" fill="#c6ced6" stroke="#4a4e56" stroke-width="2"/>
    <rect x="18" y="29" width="14" height="7" rx="2" fill="#c6ced6" stroke="#4a4e56" stroke-width="2"/>
    <path d="M14 26v-6h6" fill="none" stroke="#23272e" stroke-width="2"/><circle cx="14" cy="34" r="2.4" fill="#4a4e56"/></svg>`};

/* ── walls on the main road: the container and the lock gate ── */
const sigWalls=[];
/** pushes k out of every standing wall it has driven into, bouncing it back the way it came */
function bumpSigWalls(k){
  if(k.rib||k.ghost>0||!sigWalls.length)return;
  for(const w of sigWalls){
    if(!w.solid||w.owner===k||k.y>w.y+w.h-.3)continue;   /* jumped clean over it */
    const i=w.si,dx=k.x-w.x,dz=k.z-w.z,f=dx*fx[i]+dz*fz[i],l=dx*rx[i]+dz*rz[i];
    const pf=w.deep/2+KR-Math.abs(f),pl=w.len/2+KR-Math.abs(l);
    if(pf<=0||pl<=0)continue;
    const vf=k.vx*fx[i]+k.vz*fz[i];let vl=k.vx*rx[i]+k.vz*rz[i],nf=vf,hard;
    if(pf<pl){const s=f<0?-1:1;k.x+=fx[i]*s*pf;k.z+=fz[i]*s*pf;hard=vf*s<0?-vf*s:0;if(hard)nf=-vf*BOX.bounce;}
    else{const s=l<0?-1:1;k.x+=rx[i]*s*pl;k.z+=rz[i]*s*pl;hard=vl*s<0?-vl*s*.5:0;if(vl*s<0)vl*=-BOX.bounce;}
    k.vx=fx[i]*nf+rx[i]*vl;k.vz=fz[i]*nf+rz[i]*vl;
    if(hard>6){
      k.drift=0;k.charge=0;k.clean=false;
      if(!w.hit.has(k)){w.hit.add(k);
        for(let p=0;p<8;p++)puff(k.x+rand(-1,1),k.y+rand(.3,1.4),k.z+rand(-1,1),.8,.8,.8,.4);
        if(k===player){toast(w.gate?'STÄNGT FÖR SLUSSNING!':'RAKT IN I CONTAINERN!');ping(140,60,.25);}
        else if(w.owner===player)toast(k.name+(w.gate?' STOD STILL VID SLUSSEN':' STUDSADE PÅ CONTAINERN'));}
      if(k===player)shake=Math.min(1,shake+clamp(hard*.03,.2,.7));
    }
  }
}
/** the AI's line round the walls up the road: a nudge toward the wider gap */
function sigWallAvoid(k){
  let push=0;
  for(const w of sigWalls){
    if(w.owner===k||w.gone)continue;
    const d=sigWrap(w.si-k.mi);
    if(d<1||d>34)continue;
    const R=w.len/2+KR+1.0,gap=k.line+k.itemBias-w.lat;
    if(Math.abs(gap)>=R)continue;
    const lo=w.lat-R,hi=w.lat+R,roomLo=lo+HW-1,roomHi=HW-1-hi;     /* road left on each side */
    const want=roomHi>roomLo?hi:lo;
    const f=(want-(k.line+k.itemBias))*(1-(d-1)/33);
    if(Math.abs(f)>Math.abs(push))push=f;
  }
  return push;
}
/** a sample up the road clear of jumps, forks and fuel stops, moving on until it is */
function clearRoadAt(si,len){
  for(let tries=0;tries<16;tries++){
    let bad=!clearOfForks(si,3);
    for(const J of JUMPS)if(Math.abs(sigWrap(si-J.at))<J.up+J.dn+6)bad=true;
    for(const S of stations){const d=sigWrap(si-S.at);if(d>-len-4&&d<S.len+4)bad=true;}
    if(!bad)return si;
    si=(si+6)%N;
  }
  return si;
}
const wallPos=(w,lift)=>{roadPt(w.si,w.lat,lift,w.g.position);onRoadSurface(w.g,w.si);};

/* ── Skyfallet ── */
function rainTarget(k){
  let best=null,bd=1e9;
  for(const o of karts){
    if(!sigHittable(o,k))continue;
    const d=sigWrap(o.mi-k.mi)*SEG;
    if(d>1&&d<RAIN.reach&&d<bd){bd=d;best=o;}
  }
  return best;
}
const cloudParts=(function(){
  const grey=psMat({color:0x6c7682}),dark=psMat({color:0x4a525c}),ball=flat(new THREE.IcosahedronGeometry(1,0));
  const dropMat=new THREE.LineBasicMaterial({color:0x8fc4ff,transparent:true,opacity:.75});
  return ()=>{const g=new THREE.Group();
    for(const [x,y,z,r,m] of [[0,0,0,1.6,grey],[-1.5,-.2,.3,1.2,dark],[1.5,-.1,-.2,1.25,grey],[.4,.6,-.6,1.1,grey],[-.6,-.1,-1.1,1.0,dark]]){
      const b=new THREE.Mesh(ball,m);b.position.set(x,y,z);b.scale.set(r*1.2,r*.8,r);g.add(b);}
    const n=40,pos=new Float32Array(n*6),seed=[];
    for(let q=0;q<n;q++)seed.push([rand(-2.2,2.2),rand(-1.6,1.6),Math.random()]);
    const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.BufferAttribute(pos,3));
    const drops=new THREE.LineSegments(geo,dropMat);drops.frustumCulled=false;g.add(drops);
    g.userData={drops,seed,pos};g.visible=false;scene.add(g);return g;};
})();
const skyEl=document.getElementById('skyfall');
function castRain(k){
  const o=rainTarget(k);
  if(k===player){toast('SKYFALLET! DET BLIR REGN IDAG');ping(300,180,.25);}
  if(!o){sigMiss(k,'MOLNET REGNADE BORT');return;}
  if(blockHit(o)){if(k===player)toast('PARAPLYET HÖLL');return;}
  o.rain=RAIN.time;
  if(!o.cloudG)o.cloudG=cloudParts();
  if(o===player)toast(o.wet?'REGN? JAG ÄR REDAN BLÖT':'SKYFALL! TORKARNA PÅ');
  else if(k===player)setTimeout(()=>toast('DET REGNAR PÅ '+o.name),600);
}
function drawCloud(k){
  const g=k.cloudG,on=!k.parked&&k.rain>0;g.visible=on;if(!on)return;
  rideWith(g,k,.6,0,6.4+Math.sin(clock*2)*.2);
  const U=g.userData,P=U.pos;
  U.seed.forEach(([x,z,ph],q)=>{const t=(clock*1.6+ph)%1,y=-1-t*5.6;
    P.set([x,y,z,x-.08,y-.9,z],q*6);});
  U.drops.geometry.attributes.position.needsUpdate=true;
}

/* ── Containern ── */
function boxTarget(k){
  if(k.rib)return null;
  const [o]=nextAhead(k.mi,k,BOX.reach/SEG);
  return o&&!o.done&&!(o.ghost>0)?o:null;
}
const containerParts=(function(){
  const cols=[0xf08a1c,0x2a6ab8,0xb8362a,0x3a8a4a];
  const tex=cols.map(c=>pixTex(64,32,g=>{const css=hexCss(c);g.fillStyle=css;g.fillRect(0,0,64,32);
    g.fillStyle='rgba(0,0,0,.22)';for(let x=2;x<64;x+=5)g.fillRect(x,2,2,28);
    g.fillStyle='rgba(255,255,255,.18)';g.fillRect(0,0,64,2);g.fillStyle='rgba(0,0,0,.3)';g.fillRect(0,30,64,2);
    g.fillStyle='#f4f0e6';g.font='6px "Press Start 2P",monospace';g.textAlign='center';g.textBaseline='middle';
    g.fillText('VK 1337',32,16);}));
  const shadowMat=psMat({color:0xe0362a,unlit:true,transparent:true,opacity:.6,depthWrite:false}),
        steel=psMat({color:0x4a4e56}),cable=new THREE.LineBasicMaterial({color:0x23272e});
  const shadowGeo=(function(){const g=new THREE.PlaneGeometry(BOX.len+.6,BOX.deep+.6);g.rotateX(-Math.PI/2);return g;})();
  return ()=>{
    const g=new THREE.Group(),box=new THREE.Group();g.add(box);
    sigMesh(box,sigBox(BOX.len,BOX.h,BOX.deep),psMat({map:tex[(Math.random()*tex.length)|0]}),0,BOX.h/2,0);
    for(const s of [-1,1])sigMesh(box,sigBox(.14,BOX.h+.04,BOX.deep+.04),steel,s*(BOX.len/2-.05),BOX.h/2,0);
    sigMesh(box,sigBox(BOX.len*.8,.18,.3),steel,0,BOX.h+5.8,0);                        /* the spreader */
    const geo=new THREE.BufferGeometry();
    geo.setAttribute('position',new THREE.Float32BufferAttribute([-2.6,BOX.h,0,-1,BOX.h+5.8,0, 2.6,BOX.h,0,1,BOX.h+5.8,0, 0,BOX.h+5.8,0,0,BOX.h+40,0],3));
    const lines=new THREE.LineSegments(geo,cable);lines.frustumCulled=false;box.add(lines);
    const sh=new THREE.Mesh(shadowGeo,shadowMat);sh.position.y=.08;g.add(sh);
    g.userData={box,sh,mat:shadowMat};scene.add(g);return g;};
})();
function dropContainer(k){
  const o=boxTarget(k)||k;                               /* nobody ahead: it lands in front of you, you pass your own */
  const ahead=Math.round((o.speed*BOX.warn+BOX.lead)/SEG);
  const si=clearRoadAt((Math.round(o.mi)+ahead)%N,2);
  const lim=HW-BOX.len/2-.4,lat=clamp(o.lat,-lim,lim);
  const g=containerParts();
  const w={owner:k,si,lat,len:BOX.len,deep:BOX.deep,h:BOX.h,y:roadPt(si,lat,0,new THREE.Vector3()).y,
    t:0,solid:false,g,hit:new Set(),gate:false};
  roadPt(si,lat,0,g.position);w.x=g.position.x;w.z=g.position.z;
  wallPos(w,0);g.userData.box.position.y=30;sigWalls.push(w);
  if(k===player){toast('CONTAINERN! LAST KOMMER');ping(200,120,.3);}
  if(o===player&&o!==k)toast('RÖD SKUGGA! FLYTTA DIG');
}
function updateContainer(w,dt){
  const U=w.g.userData,T=BOX.warn+BOX.stay;
  if(w.t<BOX.warn){                                   /* the shadow blinks while it comes down */
    const f=w.t/BOX.warn;U.box.position.y=30*(1-f*f);
    U.mat.uniforms.uOpacity.value=Math.floor(clock*10)%2?.75:.35;
  }else if(w.t<T){
    if(!w.solid){w.solid=true;U.box.position.y=0;U.sh.visible=false;
      for(let p=0;p<18;p++)puff(w.x+rand(-3,3),w.y+rand(0,.8),w.z+rand(-1.6,1.6),.7,.66,.6,.7);
      const d=Math.hypot(player.x-w.x,player.z-w.z);
      if(d<60){ping(90,40,.4);shake=Math.min(1,shake+clamp(.6-d*.01,.1,.6));}
      for(const o of karts)landOn(w,o);}
  }else{                                              /* hoisted away again */
    w.solid=false;w.gone=true;U.box.position.y=(w.t-T)/BOX.lift*30;
    if(w.t>T+BOX.lift)return false;
  }
  return true;
}
/** a kart standing in the shadow when the box lands gets shoved out sideways, to the nearer edge */
function landOn(w,o){
  if(o.parked||o.rib||o.ghost>0||o===w.owner)return;
  const i=w.si,dx=o.x-w.x,dz=o.z-w.z,f=dx*fx[i]+dz*fz[i],l=dx*rx[i]+dz*rz[i];
  if(Math.abs(f)>w.deep/2+KR||Math.abs(l)>w.len/2+KR)return;
  const s=l<0?-1:1,out=w.len/2+KR+.1-Math.abs(l);
  o.x+=rx[i]*s*out;o.z+=rz[i]*s*out;o.slow=Math.max(o.slow,.6);o.drift=0;o.charge=0;
  if(o===player){toast('NÄRA ÖGAT!');shake=Math.min(1,shake+.5);}
}

/* ── Slussporten ── */
const gateParts=(function(){
  const stone=psMat({color:0x8a8f96}),cap=psMat({color:0x6a6f76}),wood=psMat({color:0x7a5a3a}),
        plank=psMat({color:0x4a3420}),iron=psMat({color:0x3a3e46}),wet=psMat({color:0x2f6a9a,unlit:true,transparent:true,opacity:.55,depthWrite:false});
  return (len)=>{const g=new THREE.Group(),door=new THREE.Group();g.add(door);
    sigMesh(door,sigBox(len,GATE.h,GATE.deep*.6),wood,0,GATE.h/2,0);
    for(let q=1;q<4;q++)sigMesh(door,sigBox(len+.02,.1,GATE.deep*.62),plank,0,q*GATE.h/4,0);
    for(let x=-len/2+1;x<len/2;x+=2.2)sigMesh(door,sigBox(.12,GATE.h+.02,GATE.deep*.64),iron,x,GATE.h/2,0);
    sigMesh(door,sigBox(len,.3,GATE.deep*.66),wet,0,.15,0);                       /* the waterline */
    /* local +x is the shut side: a pillar at the gap, a stone pier out to the fence on the other end */
    for(const [x,wd] of [[-(len/2+.5),1.0],[len/2+GATE.pier/2,GATE.pier]]){
      sigMesh(g,sigBox(wd,GATE.h+.8,GATE.deep+.4),stone,x,(GATE.h+.8)/2-.4,0);
      sigMesh(g,sigBox(wd+.2,.25,GATE.deep+.6),cap,x,GATE.h+.45,0);}
    g.userData={door};scene.add(g);return g;};
})();
function raiseGate(k){
  let si=((Math.round(k.mi)-Math.round(GATE.back/SEG))%N+N)%N;
  for(let tries=0;tries<8&&!clearOfForks(si,2);tries++)si=(si-4+N)%N;
  const side=k.lat>0.5?1:(k.lat<-0.5?-1:(Math.random()<.5?-1:1));   /* shuts his own side, the gap is on the other */
  const len=2*HW*GATE.span,mid=side*(HW-len/2),g=gateParts(len);
  /* the wall runs from the gap's pillar out to the fence, so nobody sneaks round on the verge */
  const reach=len+1+GATE.pier,lat=mid+side*(GATE.pier-1)/2;
  const w={owner:k,si,lat,len:reach,deep:GATE.deep,h:GATE.h,t:0,solid:false,g,hit:new Set(),gate:true};
  const c=roadPt(si,lat,0,new THREE.Vector3());w.x=c.x;w.y=c.y;w.z=c.z;
  roadPt(si,mid,0,g.position);onRoadSurface(g,si);if(side<0)g.rotateY(Math.PI);
  g.userData.door.position.y=-GATE.h;sigWalls.push(w);
  if(k===player){toast('SLUSSPORTEN! VÄNTA PÅ DIN TUR');ping(220,160,.3);}
}
function updateGate(w,dt){
  const D=w.g.userData.door,T=GATE.rise+GATE.stay;
  const h=w.t<GATE.rise?w.t/GATE.rise:(w.t<T?1:1-(w.t-T)/GATE.sink);
  D.position.y=-GATE.h*(1-Math.max(0,h));
  w.solid=h>.5;w.gone=w.t>T;
  if(w.t<GATE.rise&&Math.random()<.6)puff(w.x+rx[w.si]*rand(-w.len/2,w.len/2),w.y+rand(0,.6),w.z+rz[w.si]*rand(-w.len/2,w.len/2),.6,.8,1,.5);
  return w.t<T+GATE.sink;
}

/* ── Dyket ── */
const diveParts=(function(){
  const water=psMat({color:0x1f4a6a,unlit:true,transparent:true,opacity:.8,depthWrite:false}),
        ring=psMat({color:0x9fd8ff,unlit:true,transparent:true,opacity:.6,depthWrite:false,side:THREE.DoubleSide}),
        hide=psMat({color:0x3f7a4a}),eye=psMat({color:0xf4f6f8}),pupil=psMat({color:0x15161a});
  const disc=(function(){const g=new THREE.CircleGeometry(2.4,12);g.rotateX(-Math.PI/2);return g;})(),
        rim=(function(){const g=new THREE.RingGeometry(2.3,2.6,16);g.rotateX(-Math.PI/2);return g;})();
  return ()=>{const g=new THREE.Group();
    g.add(new THREE.Mesh(disc,water));const r=new THREE.Mesh(rim,ring);r.position.y=.02;g.add(r);
    const head=new THREE.Group();g.add(head);
    sigMesh(head,sigBox(1.4,.5,1.0),hide,0,.2,.6);
    for(const s of [-1,1]){sigMesh(head,sigBox(.36,.36,.3),eye,s*.36,.5,.95);sigMesh(head,sigBox(.16,.16,.1),pupil,s*.36,.5,1.1);}
    g.userData={head,ring:r};g.visible=false;scene.add(g);return g;};
})();
function startDive(k){
  if(k.bike>0){k.bike=0;bikeShow(k,false);}
  k.dive=DIVE.time;k.ghost=Math.max(k.ghost,DIVE.time);
  if(!k.diveG)k.diveG=diveParts();
  diveShow(k,true);
  for(let p=0;p<16;p++)puff(k.x+rand(-1.5,1.5),k.y+rand(.2,1.6),k.z+rand(-1.5,1.5),.62,.82,1,.6);
  if(k===player){toast('DYKET! BLUBB');ping(500,120,.3);}
}
function diveShow(k,on){
  for(const c of k.v.root.children)if(c!==k.bikeG)c.visible=!on;
  if(!on)for(let p=0;p<16;p++)puff(k.x+rand(-1.5,1.5),k.y+rand(.2,2),k.z+rand(-1.5,1.5),.62,.82,1,.6);
}

/* ── Räkmackan ── */
const gulls=[];
function gullTarget(k){
  let best=null,bd=1e9;
  for(const o of karts){
    if(!sigHittable(o,k)||!o.held||o.roll>0)continue;
    const d=sigWrap(o.mi-k.mi)*SEG;
    if(d>1&&d<GULL.reach&&d<bd){bd=d;best=o;}
  }
  return best;
}
const gullParts=(function(){
  const white=psMat({color:0xf4f6f8}),grey=psMat({color:0x9aa2ac}),beak=psMat({color:0xf0c030}),
        bread=psMat({color:0xd8a85a}),shrimp=psMat({color:0xf08aa0}),leaf=psMat({color:0x6fbf4a});
  return ()=>{const g=new THREE.Group();
    sigMesh(g,sigBox(.6,.5,1.3),white,0,0,0);sigMesh(g,sigBox(.4,.4,.4),white,0,.25,.75);
    sigMesh(g,sigBox(.14,.12,.4),beak,0,.2,1.1);sigMesh(g,sigBox(.4,.1,.4),grey,0,.05,-.8);
    const wings=[-1,1].map(s=>{const p=new THREE.Group();p.position.set(s*.3,.15,0);g.add(p);
      sigMesh(p,sigBox(1.6,.08,.7),grey,s*.8,0,0);return p;});
    const food=new THREE.Group();food.position.set(0,-.45,.2);g.add(food);
    sigMesh(food,sigBox(.9,.16,.6),bread,0,0,0);sigMesh(food,sigBox(.8,.06,.5),leaf,0,.1,0);
    for(const x of [-.25,0,.25])sigMesh(food,sigBox(.2,.14,.3),shrimp,x,.18,0);
    g.userData={wings,food};g.scale.setScalar(1.3);scene.add(g);return g;};
})();
function sendGull(k){
  const o=gullTarget(k);
  if(!o){sigMiss(k,'MÅSEN HITTADE INGET ATT STJÄLA');return;}
  const g=gullParts();g.position.set(k.x,k.y+4,k.z);
  gulls.push({owner:k,target:o,t:0,g,loot:null,back:false});
  if(k===player){toast('RÄKMACKAN! DET DÄR ÄR MITT');ping(1400,900,.12);}
}
const _gp=new THREE.Vector3();
function updateGulls(dt){
  for(let n=gulls.length-1;n>=0;n--){
    const G=gulls[n],k=G.owner,o=G.target;G.t+=dt;
    const to=G.back?k:o,f=Math.min(1,G.t/GULL.fly);
    _gp.set(to.x,to.y+3.4,to.z);
    G.g.position.lerp(_gp,Math.min(1,f*.5+dt*8));
    G.g.position.y+=Math.sin(f*Math.PI)*.6;
    G.g.rotation.y=Math.atan2(to.x-G.g.position.x,to.z-G.g.position.z);
    G.g.userData.wings.forEach((w,s)=>w.rotation.z=(s?-1:1)*Math.sin(clock*22)*.6);
    G.g.userData.food.visible=G.back&&!!G.loot;
    if(f<1)continue;
    if(!G.back){                                      /* at the target: snatch it, or get shooed */
      G.back=true;G.t=0;
      if(!o.held||o.roll>0||o.parked||o.ghost>0){if(k===player)toast('MÅSEN KOM TOMHÄNT');continue;}
      if(blockHit(o)){if(k===player)toast('MÅSEN BLEV BORTSCHASAD');continue;}
      G.loot=[o.held,o.heldLvl,o.heldSig];o.held=null;o.heldLvl=0;o.heldSig=null;
      if(o===player){toast('EN MÅS TOG DIN SAK!');ping(1500,700,.15);}
      continue;
    }
    if(G.loot){                                       /* home: the item goes in the slot, if there is room */
      if(!k.held){giveItem(k,G.loot[0],G.loot[1],G.loot[2]);k.roll=0;
        if(k===player){toast('MÅSEN TOG MED '+itemName(k.held,itemLvl(k),k)+'!');ping(900,1400,.12);}}
      else if(k===player)toast('MÅSEN ÅT UPP DEN SJÄLV');
    }
    scene.remove(G.g);gulls.splice(n,1);
  }
}

/* ── Offside ── */
const cardParts=(function(){
  const yellow=psMat({color:0xf2d21a,unlit:true}),hand=psMat({color:0x15161a});
  return ()=>{const g=new THREE.Group();
    sigMesh(g,sigBox(1.1,1.6,.08),yellow,0,0,0);sigMesh(g,sigBox(.3,.5,.3),hand,0,-.95,0);
    g.visible=false;scene.add(g);return g;};
})();
function callOffside(k){
  const o=herdTarget(k);
  if(k===player){flash('OFFSIDE!');}
  ping(2600,2400,.2);setTimeout(()=>ping(2600,2400,.35),180);           /* the whistle */
  if(!o){sigMiss(k,'INGEN I OFFSIDE');return;}
  if(blockHit(o)){if(k===player)toast(o.name+' SNACKADE SIG UR DET');return;}
  o.offside=OFFSIDE.time;o.boost=0;o.drift=0;o.charge=0;
  if(!o.cardG)o.cardG=cardParts();
  if(o===player)toast(k.name+': GULT KORT! OFFSIDE');
  else if(k===player)setTimeout(()=>toast('GULT KORT TILL '+o.name),500);
}

/* ── quirks, timers, drawing, clean-up: called from 37-signature-items.js ── */
const westTop=k=>(k.offside>0?OFFSIDE.top:1)*(k.ref&&k.lap===LAPS-1?REF_TOP:1);
const westGrip=k=>k.rain>0&&!k.wet?RAIN.grip:1;
function updateWest(dt){
  for(const k of karts){
    if(k.rain>0)k.rain=Math.max(0,k.rain-dt);
    if(k.offside>0)k.offside=Math.max(0,k.offside-dt);
    if(k.dive>0){k.dive=Math.max(0,k.dive-dt);if(k.dive<=0)diveShow(k,false);}
    if(k.shy){                                        /* Aspenmonstret: startled by a close kart */
      if(k.shyT>0)k.shyT=Math.max(0,k.shyT-dt);
      else if(state==='race'&&!k.air&&!k.done&&raceTime>3)for(const o of karts){
        if(o===k||o.parked||Math.hypot(o.x-k.x,o.z-k.z)>SHY.r)continue;
        k.shyT=SHY.cool;k.boost=Math.max(k.boost,SHY.boost);
        for(let p=0;p<8;p++)puff(k.x+rand(-1,1),k.y+rand(.3,1.4),k.z+rand(-1,1),.62,.82,1,.4);
        if(k===player){toast('BLUBB!');ping(700,300,.08);}
        break;
      }
    }
  }
  for(let n=sigWalls.length-1;n>=0;n--){
    const w=sigWalls[n];w.t+=dt;
    if(!(w.gate?updateGate(w,dt):updateContainer(w,dt))){scene.remove(w.g);sigWalls.splice(n,1);}
  }
  updateGulls(dt);
  if(skyEl){
    const r=player.rain>0&&!player.wet;
    skyEl.classList.toggle('on',r);
    if(r)skyEl.style.opacity=Math.min(1,player.rain/0.5,(RAIN.time-player.rain)/0.3+.2).toFixed(2);
  }
}
function drawWest(){
  for(const k of karts){
    if(k.cloudG)drawCloud(k);
    if(k.cardG){
      const on=!k.parked&&k.offside>0;k.cardG.visible=on;
      if(on){rideWith(k.cardG,k,0,0,3.6+Math.sin(clock*6)*.12);k.cardG.rotation.y=Math.atan2(camera.position.x-k.x,camera.position.z-k.z);}
    }
    if(k.diveG){
      const on=!k.parked&&k.dive>0;k.diveG.visible=on;
      if(on){const g=k.diveG;g.position.set(k.x,groundK(k,k.x,k.z)+.06,k.z);g.rotation.y=k.yaw;
        g.userData.head.position.y=Math.max(0,Math.sin(clock*3))*.25-.1;
        g.userData.ring.scale.setScalar(1+Math.sin(clock*8)*.06);
        if(Math.random()<.3)puff(k.x+rand(-1.6,1.6),g.position.y+.2,k.z+rand(-1.6,1.6),.7,.88,1,.35);}
    }
  }
}
function clearWest(){
  for(const k of karts){
    k.rain=0;k.offside=0;k.shyT=0;
    if(k.dive>0){k.dive=0;diveShow(k,false);}
    for(const g of [k.cloudG,k.cardG,k.diveG])if(g)g.visible=false;
  }
  for(const w of sigWalls)scene.remove(w.g);
  for(const G of gulls)scene.remove(G.g);
  sigWalls.length=0;gulls.length=0;
  if(skyEl)skyEl.classList.remove('on');
}
