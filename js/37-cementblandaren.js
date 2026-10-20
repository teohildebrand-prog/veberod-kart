"use strict";
/* ───────── Cementblandaren ───────── */
/* Weiron i ottan's signature item, in the same pool as everyone else's (37-signature-items.js):
   he heaves a cement mixer off the forks and it goes bouncing up the track, swinging from side to
   side across the road, drum spinning and slopping cement at every landing. Every kart it lands
   on or crashes into gets a load of wet cement: a spin, lost speed, and a grey lump on the roof
   that drags for a few seconds. A shield takes it. When it runs out of bounce it crashes and
   bursts. Also his quirk, Stämpla in (k.stamp): every item he uses stamps a card, which is worth
   a small push. Tune it here. */
const MIX={
  speed:20,         /* m/s faster than he was going when he threw it */
  min:34,           /* and never slower than this */
  time:5.0,         /* seconds of bouncing before it bursts */
  hop:0.62,         /* seconds per bounce */
  high:3.6,         /* metres at the top of a bounce */
  swing:0.62,       /* how far across the road it swings, as a share of the half road */
  sway:1.7,         /* seconds per swing from one side to the other and back */
  r:2.5,            /* reach: how close to a kart counts as a hit */
  spin:1.2,         /* the spin a hit gives, times the kart's spin resistance */
  slow:0.7,         /* and the wobble after */
  keep:0.5,         /* the speed kept */
  set:2.6,          /* seconds the cement drags */
  top:0.85          /* top speed while it does */
};
const STAMP={boost:0.45};                          /* Stämpla in */

SIGS.weiron={name:'CEMENTBLANDAREN',lane:false,
  text:'Släng en cementblandare framåt. Den studsar fram över banan, från kant till kant, och alla den träffar får cement över sig: de snurrar och tappar fart.',
  use:throwMixer,ai:s=>s.ahead,
  icon:`<svg viewBox="0 0 48 48">
    <path d="M3 14h7M2 21h6M4 28h5" stroke="#8a8f96" stroke-width="2.4" stroke-linecap="round"/>
    <g transform="rotate(-20 27 22)">
    <path d="M14 14 40 10 44 22 40 34 14 30Z" fill="#ff7a1a" stroke="#8a3a10" stroke-width="2" stroke-linejoin="round"/>
    <path d="M22 13 26 31M31 11.5 35 32.5" stroke="#f4f6f8" stroke-width="3"/>
    <ellipse cx="14" cy="22" rx="3" ry="8" fill="#6a6e74" stroke="#2a2c30" stroke-width="2"/></g>
    <circle cx="16" cy="40" r="4" fill="#23272e"/><circle cx="34" cy="40" r="4" fill="#23272e"/>
    <path d="M8 34q3-3 5 0t5 0" fill="none" stroke="#9a9a96" stroke-width="3" stroke-linecap="round"/></svg>`};

/* ── the parts: the mixer (drum, frame, two wheels, a chute) and a lump of cement for a roof ── */
const mixerParts=(function(){
  const drumTex=psMat({map:pixTex(32,16,g=>{g.fillStyle='#ff7a1a';g.fillRect(0,0,32,16);   /* orange with white stripes round it */
          g.fillStyle='#f4f6f8';for(let x=0;x<32;x+=8)for(let y=0;y<16;y++)g.fillRect((x+y)%32,y,3,1);
          g.fillStyle='rgba(0,0,0,.25)';g.fillRect(0,15,32,1);})}),
        frame=psMat({color:0x3a6ab8}),steel=psMat({color:0x8a8f96}),tyre=psMat({color:0x1b1d22}),
        mouth=psMat({color:0x2a2c30}),cement=psMat({color:0x9a9a94});
  const drumG=flat(new THREE.CylinderGeometry(.75,1.15,1.9,8)),capG=flat(new THREE.CylinderGeometry(.5,.75,.5,8)),
        wheelG=flat(new THREE.CylinderGeometry(.42,.42,.24,8));
  return ()=>{const g=new THREE.Group(),tumble=new THREE.Group();g.add(tumble);
    const drum=new THREE.Group();tumble.add(drum);drum.rotation.x=Math.PI/2-.35;  /* tilted, mouth up and forward */
    sigMesh(drum,drumG,drumTex,0,0,0);sigMesh(drum,capG,drumTex,0,1.2,0);
    sigMesh(drum,flat(new THREE.CylinderGeometry(.42,.42,.06,8)),mouth,0,1.46,0);
    sigMesh(drum,flat(new THREE.CylinderGeometry(.36,.36,.08,8)),cement,0,1.44,0);   /* full to the brim */
    sigMesh(tumble,sigBox(.18,.18,2.4),frame,-.7,-1.0,0);sigMesh(tumble,sigBox(.18,.18,2.4),frame,.7,-1.0,0);
    sigMesh(tumble,sigBox(1.6,.16,.16),frame,0,-1.0,-.9);
    for(const s of [-1,1]){const w=sigMesh(tumble,wheelG,tyre,s*.9,-1.15,-.6);w.rotation.z=Math.PI/2;}
    sigMesh(tumble,sigBox(.14,1.4,.14),frame,0,-.4,1.1).rotation.x=.5;      /* the tow bar sticking up */
    const chute=sigMesh(tumble,sigBox(.5,.1,1.0),steel,0,.7,1.4);chute.rotation.x=-.4;
    g.userData={tumble,drum};g.scale.setScalar(1.15);scene.add(g);return g;};
})();
const lumpParts=(function(){
  const cement=psMat({color:0x9a9a94}),wet=psMat({color:0x7a7a76}),ball=flat(new THREE.IcosahedronGeometry(1,0));
  return ()=>{const g=new THREE.Group();
    for(const [x,y,z,s,m] of [[0,0,0,.9,cement],[-.6,-.15,.3,.6,wet],[.55,-.1,-.3,.65,cement],[.1,.3,-.5,.5,wet],[-.2,.25,.6,.45,cement]]){
      const b=new THREE.Mesh(ball,m);b.position.set(x,y,z);b.scale.set(s*1.3,s*.7,s);g.add(b);}
    const drips=[-1,1].map(s=>sigMesh(g,sigBox(.18,.9,.18),wet,s*1.0,-.6,0));   /* down both sides */
    g.userData={drips};g.visible=false;scene.add(g);return g;};
})();

/* ── throwing it, and the bouncing ── */
const mixers=[];
function throwMixer(k){
  const g=mixerParts(),s=(Math.round(k.mi)+2)%N;
  const m={owner:k,s,lat:clamp(k.lat,-HW+1.5,HW-1.5),t:0,speed:Math.max(k.speed+MIX.speed,MIX.min),
    phase:Math.asin(clamp(k.lat/(HW*MIX.swing),-1,1)),dir:Math.random()<.5?-1:1,g,hit:new Set([k]),bounce:0,
    y:k.y+2.2,x:k.x,z:k.z};
  g.position.set(k.x,k.y+2.2,k.z);
  mixers.push(m);
  for(let p=0;p<10;p++)puff(k.x+rand(-1,1),k.y+rand(1,2.4),k.z+rand(-1,1),.62,.62,.6,.5);
  if(k===player){toast('CEMENTBLANDAREN! FÅNGA!');ping(180,90,.3);}
}
const _mp=new THREE.Vector3();
function updateMixers(dt){
  for(let n=mixers.length-1;n>=0;n--){
    const m=mixers[n];m.t+=dt;
    if(m.t>MIX.time){burstMixer(m);mixers.splice(n,1);continue;}
    m.s=(m.s+m.speed*dt/SEG)%N;
    m.phase+=m.dir*dt*Math.PI*2/MIX.sway;
    m.lat=Math.sin(m.phase)*HW*MIX.swing;                    /* from one side of the road to the other */
    const i=Math.floor(m.s),hopU=(m.t%MIX.hop)/MIX.hop,b=Math.floor(m.t/MIX.hop);
    roadPt(i,m.lat,0,_mp);
    const ground=_mp.y,lift=m.t<.25?lerp(2.2,0,m.t/.25)*(1-hopU)+Math.sin(hopU*Math.PI)*MIX.high:Math.sin(hopU*Math.PI)*MIX.high;
    m.x=_mp.x;m.z=_mp.z;m.y=ground+1.4+lift;
    m.g.position.set(m.x,m.y,m.z);
    m.g.rotation.y=Math.atan2(fx[i],fz[i]);
    const U=m.g.userData;U.tumble.rotation.x=-m.t*7;U.tumble.rotation.z=Math.sin(m.t*5)*.4;U.drum.rotation.y+=dt*9;
    if(b!==m.bounce){                                        /* a landing: a thud, a slop of cement */
      m.bounce=b;
      for(let p=0;p<12;p++)puff(m.x+rand(-1.6,1.6),ground+rand(.1,.8),m.z+rand(-1.6,1.6),.62,.62,.6,.6);
      const d=Math.hypot(player.x-m.x,player.z-m.z);
      if(d<70){audioTone(120,50,.18,.1*(1-d/70)+.02,'triangle');if(d<25)shake=Math.min(1,shake+.15);}
    }
    for(const o of karts){
      if(m.hit.has(o)||!sigHittable(o,m.owner)||o.rib)continue;
      if(Math.hypot(o.x-m.x,o.z-m.z)>MIX.r||m.y-o.y>2.6+1.4)continue;   /* over the top of them */
      m.hit.add(o);
      for(let p=0;p<16;p++)puff(o.x+rand(-1.2,1.2),o.y+rand(.3,2),o.z+rand(-1.2,1.2),.62,.62,.6,.7);
      if(blockHit(o)){if(m.owner===player)toast(o.name+' SKYDDADE SIG');continue;}
      o.spun=Math.max(o.spun,MIX.spin*o.spinResist);o.slow=Math.max(o.slow,MIX.slow);
      o.vx*=MIX.keep;o.vz*=MIX.keep;o.boost=0;o.drift=0;o.charge=0;o.cement=MIX.set;
      if(!o.lumpG)o.lumpG=lumpParts();
      if(o===player){toast('CEMENT! ÖVERALLT!');ping(140,60,.3);shake=Math.min(1,shake+.5);}
      else if(m.owner===player)toast('CEMENT PÅ '+o.name+'!');
    }
  }
  for(const k of karts)if(k.cement>0)k.cement=Math.max(0,k.cement-dt);
}
function burstMixer(m){
  for(let p=0;p<26;p++)puff(m.x+rand(-2,2),m.y+rand(-1,1.5),m.z+rand(-2,2),.62,.62,.6,.8);
  const d=Math.hypot(player.x-m.x,player.z-m.z);
  if(d<70){klonk();audioTone(90,40,.4,.08,'triangle');}
  scene.remove(m.g);
}
const mixTop=k=>k.cement>0?MIX.top:1;
function drawMixers(){
  for(const k of karts){
    if(!k.lumpG)continue;
    const on=!k.parked&&k.cement>0;k.lumpG.visible=on;
    if(on){rideWith(k.lumpG,k,0,0,2.6+Math.sin(clock*4)*.05);
      k.lumpG.userData.drips.forEach((d,s)=>{d.scale.y=.6+Math.sin(clock*3+s)*.3;});}
  }
}

/* ── Stämpla in: every item he uses stamps a card, and that is worth a push ── */
function updateStamp(){
  for(const k of karts){
    if(!k.stamp||k.usedAt===k.stampSeen)continue;
    k.stampSeen=k.usedAt;
    if(k.held||k.done||state!=='race')continue;     /* an item that came straight back to the slot stamps nothing */
    k.boost=Math.max(k.boost,STAMP.boost);
    if(k===player)audioTone(190,80,.08,.08,'square',.12);   /* ka-chunk, after the item's own sound */
  }
}
function clearMixers(){
  for(const m of mixers)scene.remove(m.g);
  mixers.length=0;
  for(const k of karts){k.cement=0;if(k.lumpG)k.lumpG.visible=false;}
}
