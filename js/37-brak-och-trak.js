"use strict";
/* ───────── Bråk och tråk och skråk ───────── */
/* Bodil's signature item, in the same pool as everyone else's (37-signature-items.js): she spots
   the nearest rival, barks, crouches, and launches herself out of the kart in an enthusiastic flying
   tackle. A hit tips the rival into a short comic spin, takes some speed and the drift charge. Then
   she springs straight back into her seat. The kart she left keeps rolling and steering; the leap
   is only an animation around it, so no teleport and no free overtake. Whoever gets the item from a
   box, Bodil is the one who jumps (out of their kart). Counterplay: a shield blocks her, and getting
   out of reach or behind something (a fence, the verge, a container, another route) makes her miss.
   With nobody to tackle she does a short pounce forward and comes back, and the item is spent.
   Also her quirk, Godisnosen (k.nose): she smells an item box from further off. Tune it here. */
const TACKLE={
  reach:24,         /* metres: the furthest rival she goes for */
  warn:0.38,        /* seconds of bark and crouch before she goes */
  leap:34,          /* m/s faster than the kart she leaves */
  air:0.75,         /* the longest flight before she gives up */
  r:2.6,            /* metres: close enough to count as a tackle */
  back:0.42,        /* seconds to spring back into the seat */
  pounce:7,         /* metres: the little pounce with nobody in reach */
  spin:0.9,         /* the spin a hit gives, times the kart's spin resistance */
  slow:0.5,         /* and the wobble after */
  keep:0.78,        /* the speed kept */
  tip:0.9           /* seconds the tackled kart tips over on its side */
};
const NOSE={r2:3.6*3.6};                           /* Godisnosen: a box counts from 3.6 m, not 2.5 */

SIGS.bodil={name:'BRÅK OCH TRÅK OCH SKRÅK',
  text:'Bodil får syn på närmaste rival, hoppar ur bilen och gör en entusiastisk flygande tackling: rivalen snurrar, tappar fart och sladdladdningen. Bilen rullar vidare. En sköld stoppar henne, och genom staket tacklar hon inte.',
  use:tackle,ai:(s,k)=>!!tackleTarget(k),
  icon:`<svg viewBox="0 0 48 48">
    <path d="M3 30h8M2 24h6M4 36h6" stroke="#8a8f96" stroke-width="2.4" stroke-linecap="round"/>
    <g transform="rotate(-12 26 24)">
    <rect x="12" y="18" width="24" height="12" rx="5" fill="#b5693a" stroke="#5a3218" stroke-width="2"/>
    <rect x="30" y="12" width="13" height="12" rx="3" fill="#c27a48" stroke="#5a3218" stroke-width="2"/>
    <rect x="36" y="13" width="3" height="10" fill="#f4eee4"/><rect x="40" y="19" width="6" height="5" rx="2" fill="#f4eee4" stroke="#5a3218" stroke-width="1.6"/>
    <path d="M31 14q-9 2-14 10" fill="none" stroke="#a0582c" stroke-width="5" stroke-linecap="round"/>
    <path d="M36 28l8 4M32 30l6 6" stroke="#b5693a" stroke-width="3.4" stroke-linecap="round"/>
    <path d="M12 22l-5-3" stroke="#a0582c" stroke-width="3" stroke-linecap="round"/></g>
    <path d="M40 6l2 4M44 4l-1 5M36 4l3 5" stroke="#e0362a" stroke-width="2" stroke-linecap="round"/></svg>`};

/** nothing in the way between a and b: the same road or lane, never over the fence or the verge,
    round a corner or through a standing wall. a needs x, z, mi and rib. */
function tackleClear(a,b){
  if(a.rib!==b.rib)return false;                          /* another route: across a shortcut */
  if(a.rib)return true;                                   /* the same farm lane */
  const span=sigWrap(Math.round(b.mi)-Math.round(a.mi));
  for(const u of [.25,.5,.75]){                           /* every point between on the tarmac */
    const i=((Math.round(a.mi+span*u)%N)+N)%N,px=lerp(a.x,b.x,u),pz=lerp(a.z,b.z,u);
    if(Math.abs((px-sx[i])*rx[i]+(pz-sz[i])*rz[i])>HW+1.2)return false;
  }
  for(const w of sigWalls){                               /* a container or a shut lock gate */
    if(!w.solid||w.gone)continue;
    const dx=b.x-a.x,dz=b.z-a.z,L=dx*dx+dz*dz||1,u=clamp(((w.x-a.x)*dx+(w.z-a.z)*dz)/L,0,1);
    if(Math.hypot(a.x+dx*u-w.x,a.z+dz*u-w.z)<w.len/2+.6)return false;
  }
  return true;
}
/** the nearest rival she can get at: in reach, at her height, close along the road too, in sight */
function tackleTarget(k){
  let best=null,bd=TACKLE.reach;
  for(const o of karts){
    if(!sigHittable(o,k)||o.rib!==k.rib||Math.abs(o.y-k.y)>3)continue;
    const d=Math.hypot(o.x-k.x,o.z-k.z);
    if(d>=bd)continue;
    if(!k.rib&&Math.abs(sigWrap(o.mi-k.mi))*SEG>d+8)continue;   /* near in a straight line, far round the bend */
    if(!tackleClear(k,o))continue;
    best=o;bd=d;
  }
  return best;
}

const tackles=[];
const _tq=new THREE.Vector3();
/** where the seat is: the start and end of every leap */
function seatAt(k,out){const F=Math.sin(k.yaw),G=Math.cos(k.yaw);return out.set(k.x-F*.85,k.y+1.0,k.z-G*.85);}
function tackle(k){
  const D=bodilDog();scene.add(D.g);D.g.visible=false;D.g.scale.setScalar(1.3);
  tackles.push({owner:k,target:tackleTarget(k),phase:'warn',t:0,D,x:k.x,y:k.y+1,z:k.z,mi:k.mi,rib:k.rib,
    from:new THREE.Vector3(),d0:1,hit:false});
  k.dogWarn=TACKLE.warn;
  const d=Math.hypot(player.x-k.x,player.z-k.z);
  if(d<80)woof(1-d/100);                                  /* the warning: a sharp bark */
  if(k===player){toast('BRÅK OCH TRÅK OCH SKRÅK!');shake=Math.min(1,shake+.1);}
}
/** the flying dog's pose: stretched out in the air, tucked on the way back, crouched before */
function dogPose(D,mode,u){
  D.body.rotation.set(0,0,0);D.body.position.set(0,0,0);D.head.rotation.set(0,0,0);
  for(const e of D.eyes)e.scale.set(1,1,1);
  if(mode==='air'){
    D.body.rotation.x=1.2;D.head.rotation.x=-1.0;
    for(const L of D.legs)L.rotation.x=-2.5;
    for(const {e,s} of D.ears){e.rotation.x=1.5+Math.sin(clock*40+s)*.15;e.rotation.z=s*.35;}
    D.tail.rotation.x=.8;
  }else if(mode==='back'){
    D.body.rotation.x=-u*Math.PI*2;                       /* a happy little flip on the way home */
    for(const L of D.legs)L.rotation.x=-.4;
    for(const {e,s} of D.ears){e.rotation.x=-.4;e.rotation.z=s*.8;}
  }else{
    D.body.position.y=-.14;D.body.rotation.x=.3;for(const e of D.eyes)e.scale.set(1,.45,1);
    for(const L of D.legs)L.rotation.x=-.6;
    for(const {e,s} of D.ears){e.rotation.x=-.2;e.rotation.z=s*.35;}
  }
}
function updateTackles(dt){
  for(let n=tackles.length-1;n>=0;n--){
    const T=tackles[n],k=T.owner,D=T.D;T.t+=dt;
    const hasSeat=k.v&&!!k.v.root.getObjectByName('bodil');   /* her own kart: the seat empties */
    if(T.phase==='warn'){
      k.dogWarn=Math.max(0,TACKLE.warn-T.t);
      if(!hasSeat){D.g.visible=true;seatAt(k,_tq);D.g.position.copy(_tq);D.g.position.y+=.5;D.g.rotation.set(0,k.yaw,0);dogPose(D,'warn');}
      if(T.t<TACKLE.warn)continue;
      /* off she goes: if the rival got away or behind something meanwhile, she goes anyway and misses */
      const o=T.target;
      if(o&&(!sigHittable(o,k)||o.rib!==k.rib||Math.hypot(o.x-k.x,o.z-k.z)>TACKLE.reach+4||!tackleClear(k,o)))T.target=null;
      seatAt(k,T.from);T.x=T.from.x;T.y=T.from.y;T.z=T.from.z;T.mi=k.mi;T.rib=k.rib;
      T.speed=Math.max(0,k.speed)+TACKLE.leap;T.d0=T.target?Math.max(1,Math.hypot(T.target.x-T.x,T.target.z-T.z)):1;
      T.phase='air';T.t=0;k.dogWarn=0;k.dogOut=true;D.g.visible=true;
      for(let p=0;p<8;p++)puff(T.x+rand(-.6,.6),T.y+rand(0,.6),T.z+rand(-.6,.6),.95,.92,.85,.35);
      if(Math.hypot(player.x-k.x,player.z-k.z)<60)ping(300,700,.1);
      continue;
    }
    if(T.phase==='air'){
      const o=T.target;
      if(!o){                                             /* nobody: a short pounce up the road, riding along */
        const u=Math.min(1,T.t/.35),F=Math.sin(k.yaw),G=Math.cos(k.yaw),f=lerp(-.85,TACKLE.pounce,u);
        T.x=k.x+F*f;T.z=k.z+G*f;T.y=k.y+1.0+Math.sin(u*Math.PI)*1.3;
        D.g.position.set(T.x,T.y,T.z);D.g.rotation.set(0,k.yaw,0);dogPose(D,'air');
        if(u>=1){T.phase='back';T.t=0;T.from.set(T.x,k.y+.4,T.z);
          for(let p=0;p<6;p++)puff(T.x+rand(-.6,.6),k.y+rand(0,.4),T.z+rand(-.6,.6),.8,.75,.65,.35);
          sigMiss(k,'BODIL TACKLADE LUFT');}
        continue;
      }
      /* toward the rival as it is now, no faster than she can fly; the line must stay clear */
      const dx=o.x-T.x,dz=o.z-T.z,d=Math.hypot(dx,dz),step=T.speed*dt;
      if(d>step){T.x+=dx/d*step;T.z+=dz/d*step;}else{T.x=o.x;T.z=o.z;}
      const p=clamp(1-Math.hypot(o.x-T.x,o.z-T.z)/T.d0,0,1);
      T.mi=T.mi+sigWrap(o.mi-T.mi)*clamp(step/Math.max(d,.01),0,1);
      T.y=lerp(T.from.y,o.y+1.1,p)+Math.sin(p*Math.PI)*1.6;
      D.g.position.set(T.x,T.y,T.z);D.g.rotation.set(0,Math.atan2(dx,dz),0);dogPose(D,'air');
      const gone=!sigHittable(o,k)||o.rib!==T.rib||!tackleClear(T,o);
      if(!gone&&Math.hypot(o.x-T.x,o.z-T.z)<TACKLE.r&&Math.abs(o.y+1-T.y)<2.6){
        T.hit=true;landTackle(T,o);
      }else if(gone||T.t>TACKLE.air){                     /* out of reach or out of sight: a miss */
        T.target=null;if(k===player)toast(o.name+' SLAPP UNDAN');
      }else continue;
      T.phase='back';T.t=0;T.from.set(T.x,T.y,T.z);
      continue;
    }
    /* back into the seat, wherever the kart has got to */
    const u=Math.min(1,T.t/TACKLE.back),e=u*u*(3-2*u);
    seatAt(k,_tq);
    D.g.position.set(lerp(T.from.x,_tq.x,e),lerp(T.from.y,_tq.y,e)+Math.sin(u*Math.PI)*1.8,lerp(T.from.z,_tq.z,e));
    D.g.rotation.set(0,k.yaw,0);dogPose(D,'back',u);
    if(u>=1){
      scene.remove(D.g);tackles.splice(n,1);
      if(!tackles.some(o=>o.owner===k)){k.dogOut=false;k.dogBack=clock;}
      const dd=Math.hypot(player.x-k.x,player.z-k.z);
      if(dd<70)woof(.8-dd/100,.05);                       /* one satisfied bark, then innocence itself */
    }
  }
  for(const k of karts)if(k.tipT>0)k.tipT=Math.max(0,k.tipT-dt);
}
/** the tackle lands on o: a shield stops her, anything else tips over */
function landTackle(T,o){
  const k=T.owner;
  for(let p=0;p<14;p++)puff(o.x+rand(-1.2,1.2),o.y+rand(.3,2),o.z+rand(-1.2,1.2),.95,.9,.82,.5);
  if(blockHit(o)){if(k===player)toast(o.name+' SKYDDADE SIG');return;}
  o.spun=Math.max(o.spun,TACKLE.spin*o.spinResist);o.slow=Math.max(o.slow,TACKLE.slow);
  o.vx*=TACKLE.keep;o.vz*=TACKLE.keep;o.drift=0;o.charge=0;
  o.tipT=TACKLE.tip;o.tipDir=((T.x-o.x)*Math.cos(o.yaw)-(T.z-o.z)*Math.sin(o.yaw))>0?-1:1;   /* tipped away from where she came */
  const d=Math.hypot(player.x-o.x,player.z-o.z);
  if(d<70)audioTone(160,70,.16,.1*(1-d/70)+.02,'triangle');
  if(o===player){toast('TACKLAD AV BODIL!');shake=Math.min(1,shake+.5);}
  else if(k===player)toast('BODIL TACKLADE '+o.name+'!');
}
function drawTackles(){
  for(const k of karts){
    if(!(k.tipT>0)||k.parked)continue;
    const u=1-k.tipT/TACKLE.tip;
    k.v.lean.rotation.z+=Math.sin(u*Math.PI)*.55*k.tipDir*(1-u*.3);   /* up on two wheels, and back down */
  }
}
function clearTackles(){
  for(const T of tackles)scene.remove(T.D.g);
  tackles.length=0;
  for(const k of karts){k.dogOut=false;k.dogWarn=0;k.tipT=0;}
}
