"use strict";
/* ───────── Sibyllas meny ───────── */
/* The Sibylla track's own items (js/29-sibylla.js). Teo (2026-10-22): Extra Allt was boring, so
   the boxes there now hand out only these six, for everyone, Signaturläge or not:
     NUMMER 47!       the leader's order is called and they stop at a pickup hatch
     LÄSKPÅFYLLNING   a soda fountain out the back for a boost, then a burp that shoves karts aside
     MOSKANONEN       a ball of mash at the kart ahead; the player's screen fills with mash
     TUNNBRÖDSRULLEN  rolled up in a flatbread wrap, bowling karts over, dizzy afterwards
     BURGARTORNET     three presses: two layers on the roof (heavier bumps, less grip), then it
                      falls off and burgerRolls back down the track
     KORV MED BRÖD    a sausage torpedo; the bun catches the first kart and carries it backwards
   Any driver can get any of them. Tune them here. */
const ORDER={reach:220,time:1.5,top:0.08,side:3.6};      /* NUMMER 47! */
const SODA={time:2.0,boost:2.0,r:16,shove:10,hop:3,keep:0.75,slow:0.45};   /* LÄSKPÅFYLLNING */
const MOS={speed:30,min:44,life:2.2,reach:70,r:2.6,time:3.0,top:0.9,slow:0.35};   /* MOSKANONEN */
const WRAP={time:2.6,top:1.18,push:16,grip:1.2,r:3.3,shove:11,hop:4.5,keep:0.6,slow:0.5,dizzy:0.9};   /* TUNNBRÖDSRULLEN */
const TOWER={n:3,gap:0.6,grip:0.07,mass:0.6,roll:24,life:4.5,r:3.0,spin:1.0,slow:0.6};   /* BURGARTORNET */
const KORV={speed:34,min:48,life:2.4,r:2.5,time:1.4,pull:34};   /* KORV MED BRÖD */
const MENU_IDS=['nummer','lask','mos','rulle','torn','korv'];

/** the items that come out of this track's boxes, or none */
const eventPool=()=>stage?Object.keys(SIGS).filter(id=>SIGS[id].event===stage.id):[];
/** on an event track every box gives one of the event's items */
function eventSig(k){
  const ids=eventPool();
  return ids.length?ids[(Math.random()*ids.length)|0]:null;
}

SIGS.nummer={event:'sibylla',name:'NUMMER 47!',
  text:'Bara på Sibylla: högtalaren ropar ut ledarens ordernummer, och ledaren måste stanna vid en utlämningslucka och ta emot påsen.',
  use:callOrder,ai:(s,k)=>!!orderTarget(k),
  icon:`<svg viewBox="0 0 48 48">
    <rect x="6" y="8" width="36" height="26" rx="3" fill="#f6f4ee" stroke="#d5202a" stroke-width="3"/>
    <text x="24" y="28" font-family="monospace" font-weight="900" font-size="17" text-anchor="middle" fill="#d5202a">47</text>
    <path d="M14 40h20" stroke="#1f4fb4" stroke-width="4" stroke-linecap="round"/>
    <path d="M40 4l5-3M42 10h5" stroke="#e8b81c" stroke-width="2.6" stroke-linecap="round"/></svg>`};
SIGS.lask={event:'sibylla',name:'LÄSKPÅFYLLNING',
  text:'Bara på Sibylla: gratis påfyllning! En läskfontän sprutar bakåt och ger fart, och sedan ett jätterap som knuffar undan bilarna runt dig.',
  use:refillSoda,ai:s=>s.close||s.behind||Math.random()<0.006,
  icon:`<svg viewBox="0 0 48 48">
    <path d="M12 14h24l-3 30H15Z" fill="#d5202a" stroke="#7a1010" stroke-width="2"/>
    <path d="M13 22h22" stroke="#f6f4ee" stroke-width="4"/><circle cx="24" cy="33" r="3" fill="#1f4fb4"/>
    <rect x="10" y="10" width="28" height="5" rx="2" fill="#f6f4ee" stroke="#7a1010" stroke-width="1.6"/>
    <path d="M27 10l5-8" stroke="#f6f4ee" stroke-width="2.6" stroke-linecap="round"/>
    <circle cx="38" cy="6" r="2.2" fill="#a8d8f0"/><circle cx="43" cy="12" r="1.6" fill="#a8d8f0"/></svg>`};
SIGS.mos={event:'sibylla',name:'MOSKANONEN',lane:false,
  text:'Bara på Sibylla: skjut en klick potatismos på bilen framför. Den som träffas får mos över hela rutan tills torkarna fått bort det.',
  use:fireMash,ai:s=>s.ahead,
  icon:`<svg viewBox="0 0 48 48">
    <rect x="4" y="22" width="22" height="12" rx="3" fill="#6a727c" stroke="#23272e" stroke-width="2"/>
    <circle cx="10" cy="38" r="4" fill="#23272e"/><circle cx="22" cy="38" r="4" fill="#23272e"/>
    <path d="M30 12c4-6 12-4 12 2 5 1 4 9-1 9-1 5-9 6-11 1-5 0-5-10 0-12Z" fill="#f4e6a8" stroke="#c8a850" stroke-width="2"/>
    <path d="M26 26l4-4" stroke="#c8a850" stroke-width="2.4" stroke-dasharray="2 2"/></svg>`};
SIGS.rulle={event:'sibylla',name:'TUNNBRÖDSRULLEN',
  text:'Bara på Sibylla: du rullas in i ett tunnbröd och rullar fram som en stock. Alla du träffar kastas undan. Efteråt är du lite snurrig.',
  use:rollWrap,ai:s=>s.close||s.near,
  icon:`<svg viewBox="0 0 48 48">
    <ellipse cx="10" cy="24" rx="6" ry="13" fill="#f0d9a0" stroke="#a07a3a" stroke-width="2"/>
    <path d="M10 11h28v26H10" fill="#e8c880" stroke="#a07a3a" stroke-width="2"/>
    <ellipse cx="38" cy="24" rx="6" ry="13" fill="#f0d9a0" stroke="#a07a3a" stroke-width="2"/>
    <ellipse cx="38" cy="24" rx="3" ry="8" fill="#c8201e"/><circle cx="38" cy="20" r="1.6" fill="#7ab040"/>
    <circle cx="18" cy="17" r="1.4" fill="#a07a3a"/><circle cx="26" cy="29" r="1.4" fill="#a07a3a"/><circle cx="30" cy="16" r="1.4" fill="#a07a3a"/></svg>`};
SIGS.torn={event:'sibylla',lane:false,
  /* the slot shows how many presses are left */
  get name(){const n=player&&player.heldSig==='torn'&&player.towerLeft>0?player.towerLeft:TOWER.n;return 'BURGARTORNET ×'+n;},
  text:'Bara på Sibylla: varje tryck bygger ett lager hamburgare på taket. Tungt och vingligt men du knuffar hårdare, och på tredje trycket ramlar tornet av och rullar bakåt nedför banan.',
  use:stackTower,ai:(s,k)=>(k.towerLeft===1?s.behind:s.close||s.behind),
  icon:`<svg viewBox="0 0 48 48">
    <path d="M10 14q14-12 28 0Z" fill="#d89a48" stroke="#8a5a20" stroke-width="2"/>
    <rect x="9" y="14" width="30" height="5" rx="2" fill="#6a3a1e"/><rect x="8" y="19" width="32" height="3" fill="#7ab040"/>
    <rect x="9" y="22" width="30" height="5" rx="2" fill="#6a3a1e"/><rect x="8" y="27" width="32" height="3" fill="#e8b81c"/>
    <rect x="9" y="30" width="30" height="5" rx="2" fill="#6a3a1e"/>
    <path d="M10 35h28q0 7-14 7t-14-7Z" fill="#d89a48" stroke="#8a5a20" stroke-width="2"/></svg>`};
SIGS.korv={event:'sibylla',name:'KORV MED BRÖD',lane:false,
  text:'Bara på Sibylla: en jättekorv far iväg framåt som en torped. Den första bilen den träffar fångas i ett bröd och bärs baklänges en bit.',
  use:fireKorv,ai:s=>s.ahead,
  icon:`<svg viewBox="0 0 48 48">
    <path d="M4 30q20 10 40 0v6q-20 10-40 0Z" fill="#e0b070" stroke="#8a5a20" stroke-width="2"/>
    <rect x="6" y="20" width="36" height="10" rx="5" fill="#b8402a" stroke="#6a1e10" stroke-width="2"/>
    <path d="M10 24q4-3 8 0t8 0 8 0 6 0" fill="none" stroke="#e8b81c" stroke-width="2.4"/>
    <path d="M44 25h3M44 19l3-2M44 31l3 2" stroke="#f6f4ee" stroke-width="2" stroke-linecap="round"/></svg>`};

/* ── shared parts ── */
const MM=(c,o)=>psMat(Object.assign({color:c},o||{}));
const bunMat=MM(0xd89a48),pattyMat=MM(0x6a3a1e),lettuceMat=MM(0x7ab040),cheeseMat=MM(0xe8b81c),
      sodaMat=MM(0xd5202a),whiteMat=MM(0xf6f4ee),blueMat=MM(0x1f4fb4),mashMat=MM(0xf4e6a8),
      breadMat=MM(0xe8c880),sausageMat=MM(0xb8402a),fizzMat=MM(0x5a2a14);
const _mv=new THREE.Vector3();
const nearPlayer=(x,z)=>Math.hypot(player.x-x,player.z-z);

/* ── NUMMER 47! ── */
/** the leader, or the next one down when the leader is you */
function orderTarget(k){
  let best=null;
  for(const o of karts)if(sigHittable(o,k)&&!(o.order>0)&&(!best||o.place<best.place))best=o;
  return best;
}
const hatchParts=(function(){
  const sign=psMat({map:pixTex(64,16,g=>{g.fillStyle='#d5202a';g.fillRect(0,0,64,16);
    g.fillStyle='#f6f4ee';g.font='bold 10px monospace';g.textAlign='center';g.textBaseline='middle';g.fillText('UTLÄMNING',32,9);}),unlit:true});
  const wood=MM(0x8a5a32),glass=MM(0x2a2c32),bag=MM(0xe8dcc0),arm=MM(0xd8a07c);
  return ()=>{const g=new THREE.Group();
    sigMesh(g,sigBox(.4,3.0,2.8),wood,0,1.5,0);                      /* the wall with the hatch */
    sigMesh(g,sigBox(.44,1.0,1.6),glass,0,1.7,0);
    sigMesh(g,sigBox(.1,.6,2.6),sign,-.26,3.2,0).rotation.y=0;
    const hand=new THREE.Group();g.add(hand);
    sigMesh(hand,sigBox(1.2,.24,.24),arm,.6,1.6,0);                  /* out toward the kart */
    sigMesh(hand,sigBox(.6,.7,.4),bag,1.3,1.45,0);                  /* the bag, handed out */
    g.userData.hand=hand;g.visible=false;scene.add(g);return g;};
})();
function callOrder(k){
  const o=orderTarget(k);
  if(nearPlayer(k.x,k.z)<200||o===player){sibBell(.8);setTimeout(()=>sibBell(.8),260);}
  if(k===player)toast('NUMMER 47!');
  if(!o){sigMiss(k,'INGEN ATT ROPA UPP');return;}
  if(blockHit(o)){if(k===player)toast(o.name+' HÄMTAR INTE UT');return;}
  o.order=ORDER.time;o.orderT=0;o.boost=0;o.drift=0;o.charge=0;o.launch=0;
  if(!o.hatchG)o.hatchG=hatchParts();
  if(o===player){flash('NUMMER 47!');toast('ER BESTÄLLNING ÄR KLAR!');shake=Math.min(1,shake+.25);}
  else if(k===player)setTimeout(()=>{if(state==='race')toast(o.name+' HÄMTAR UT SIN MAT');},700);
}

/* ── LÄSKPÅFYLLNING ── */
const cupParts=(function(){
  const cup=flat(new THREE.CylinderGeometry(.75,.55,1.7,8)),lid=flat(new THREE.CylinderGeometry(.8,.8,.16,8));
  return ()=>{const g=new THREE.Group();
    sigMesh(g,cup,sodaMat,0,.85,0);sigMesh(g,sigBox(1.5,.3,1.5),whiteMat,0,1.05,0).scale.set(1.02,1,1.02);
    sigMesh(g,lid,whiteMat,0,1.78,0);
    const straw=sigMesh(g,sigBox(.14,1.2,.14),whiteMat,.2,2.3,-.3);straw.rotation.x=-.5;
    g.visible=false;scene.add(g);return g;};
})();
function refillSoda(k){
  k.soda=SODA.time;k.boost=Math.max(k.boost,SODA.boost);k.boostLvl=Math.max(k.boostLvl,1);
  if(!k.cupG)k.cupG=cupParts();
  if(k===player){toast('LÄSKPÅFYLLNING! GRATIS!');ping(700,1400,.14);}
}
function burp(k){
  pulse(k.x,k.y,k.z,SODA.r,.5,0xb8e0a0);
  for(let p=0;p<16;p++)puff(k.x+rand(-2,2),k.y+rand(.8,2.6),k.z+rand(-2,2),.78,.9,.6,.6);
  const d=nearPlayer(k.x,k.z);
  if(d<90){const v=1-d/110;audioTone(110,60,.55,.14*v+.02,'sawtooth');audioTone(80,50,.4,.08*v,'square',.08);
    if(d<30)shake=Math.min(1,shake+.3);}
  if(k===player)flash('BUUURP!');
  let hits=0;
  for(const o of karts){
    if(!sigHittable(o,k)||Math.abs(o.y-k.y)>4||Math.hypot(o.x-k.x,o.z-k.z)>SODA.r)continue;
    if(!knock(o,k,SODA.shove,SODA.hop,SODA.keep,SODA.slow)){if(k===player)toast(o.name+' HÖLL FÖR NÄSAN');continue;}
    hits++;
    if(o===player)toast('USCH! '+k.name+' RAPADE');
  }
  if(k===player&&hits)setTimeout(()=>toast(hits>1?hits+' RAPADE ÅT SIDAN':'RAPAD ÅT SIDAN'),500);
}

/* ── MOSKANONEN ── */
const mashes=[];
const mashGeo=flat(new THREE.IcosahedronGeometry(.9,0));
const mosEl=document.getElementById('mos');
function fireMash(k){
  const [t]=nextAhead(k.mi,k,MOS.reach/SEG);
  const m=new THREE.Mesh(mashGeo,mashMat);scene.add(m);
  mashes.push({owner:k,target:t,s:(k.mi+1.5)%N,lat:k.lat,t:0,speed:Math.max(k.speed+MOS.speed,MOS.min),m});
  for(let p=0;p<8;p++)puff(k.x+rand(-.8,.8),k.y+rand(1,2),k.z+rand(-.8,.8),.96,.9,.66,.4);
  if(k===player){toast('MOSKANONEN! PANG!');audioTone(260,90,.18,.1,'triangle');}
}
function splatMash(m,o){
  for(let p=0;p<14;p++)puff(m.m.position.x+rand(-1.2,1.2),m.m.position.y+rand(-.4,1),m.m.position.z+rand(-1.2,1.2),.96,.9,.66,.7);
  scene.remove(m.m);
  if(!o)return;
  if(blockHit(o)){if(m.owner===player)toast(o.name+' SKYDDADE SIG');return;}
  o.mashed=MOS.time;o.slow=Math.max(o.slow,MOS.slow);o.drift=0;o.charge=0;
  if(o===player){toast('MOS PÅ RUTAN!');audioTone(180,70,.25,.12,'triangle');}
  else if(m.owner===player)toast('MOS PÅ '+o.name+'!');
}
function updateMashes(dt){
  for(let n=mashes.length-1;n>=0;n--){
    const m=mashes[n];m.t+=dt;
    m.s=(m.s+m.speed*dt/SEG)%N;
    if(m.target&&!m.target.parked&&!m.target.rib)m.lat=lerp(m.lat,clamp(m.target.lat,-HW,HW),Math.min(1,dt*4));
    roadPt(Math.floor(m.s),m.lat,1.2+Math.sin(m.t*3)*.4,m.m.position);
    m.m.rotation.x+=dt*9;m.m.rotation.y+=dt*5;
    let hit=null;
    for(const o of karts){
      if(o===m.owner||!sigHittable(o,m.owner)||o.rib)continue;
      if(Math.hypot(o.x-m.m.position.x,o.z-m.m.position.z)<MOS.r&&Math.abs(o.y+1-m.m.position.y)<2.4){hit=o;break;}
    }
    if(hit||m.t>MOS.life){splatMash(m,hit);mashes.splice(n,1);if(!hit&&m.owner===player)sigMiss(m.owner,'MOSET MISSADE');}
  }
}

/* ── TUNNBRÖDSRULLEN ── */
const wrapParts=(function(){
  const tube=flat(new THREE.CylinderGeometry(1.9,1.9,3.4,10,1,true)),end=flat(new THREE.CircleGeometry(1.6,10)),
        inside=MM(0xf0d9a0,{side:THREE.DoubleSide}),filling=MM(0xc8201e,{side:THREE.DoubleSide});
  const skin=MM(0xd8a07c),eye=MM(0x23272e);
  /* the kart is hidden while it rolls: the wrap rides in its place, the driver's head out of the top */
  return (color)=>{const g=new THREE.Group(),roll=new THREE.Group();g.add(roll);roll.position.y=1.9;
    sigMesh(g,sigBox(.6,.6,.6),skin,0,3.95,0);sigMesh(g,sigBox(.66,.2,.66),MM(color),0,4.3,0);
    for(const s of [-1,1])sigMesh(g,sigBox(.1,.12,.06),eye,s*.14,4.0,.31);
    const t=sigMesh(roll,tube,inside,0,0,0);t.rotation.z=Math.PI/2;           /* axis across the kart */
    for(const s of [-1,1]){const e=sigMesh(roll,end,filling,s*1.72,0,0);e.rotation.y=s*Math.PI/2;}
    for(let q=0;q<6;q++){const a=q/6*Math.PI*2;                                /* grill marks, to see it roll */
      sigMesh(roll,sigBox(3.3,.12,.4),MM(0xa07a3a),0,Math.sin(a)*1.92,Math.cos(a)*1.92).rotation.x=-a;}
    g.userData.roll=roll;g.visible=false;return g;};
})();
/** swap the kart for the wrap and back (the bike in 37-signature-items.js does the same) */
function wrapShow(k,on){
  for(const c of k.v.root.children)c.visible=c===k.wrapG?on:c===k.bikeG?!on&&k.bike>0:!on&&!(k.bike>0)&&!(k.dive>0);
}
function rollWrap(k){
  k.wrap=WRAP.time;k.wrapHit=new Set([k]);k.drift=0;k.charge=0;
  if(!k.wrapG||k.wrapG.parent!==k.v.root){k.wrapG=wrapParts(k.color);k.v.root.add(k.wrapG);}   /* a new vehicle needs a new wrap */
  wrapShow(k,true);
  for(let p=0;p<12;p++)puff(k.x+rand(-1,1),k.y+rand(.3,2),k.z+rand(-1,1),.94,.85,.62,.5);
  if(k===player){toast('TUNNBRÖDSRULLEN! RULLA!');ping(300,600,.15);}
}
function wrapStep(k){
  for(const o of karts){
    if(k.wrapHit.has(o)||!sigHittable(o,k)||Math.abs(o.y-k.y)>3||Math.hypot(o.x-k.x,o.z-k.z)>WRAP.r)continue;
    k.wrapHit.add(o);
    for(let p=0;p<10;p++)puff(o.x+rand(-1,1),o.y+rand(.3,1.6),o.z+rand(-1,1),.94,.85,.62,.5);
    if(!knock(o,k,WRAP.shove,WRAP.hop,WRAP.keep,WRAP.slow)){if(k===player)toast(o.name+' STOD EMOT');continue;}
    if(nearPlayer(o.x,o.z)<60)klonk();
    if(o===player){toast('PLATTAD AV EN RULLE!');shake=Math.min(1,shake+.4);}
    else if(k===player)toast('STRIKE! '+o.name);
  }
}

/* ── BURGARTORNET ── */
const burgerLayer=(function(){
  const patty=flat(new THREE.CylinderGeometry(1.05,1.05,.36,10)),leaf=flat(new THREE.CylinderGeometry(1.15,1.15,.08,10)),
        bun=flat(new THREE.CylinderGeometry(1.1,1.0,.36,10)),top=flat(new THREE.SphereGeometry(1.1,10,5,0,Math.PI*2,0,Math.PI/2));
  return (cap)=>{const g=new THREE.Group();
    sigMesh(g,bun,bunMat,0,.18,0);sigMesh(g,patty,pattyMat,0,.54,0);sigMesh(g,leaf,lettuceMat,0,.76,0);
    sigMesh(g,leaf,cheeseMat,0,.84,0);
    if(cap)sigMesh(g,top,bunMat,0,.88,0).scale.y=.6;
    return g;};
})();
const burgerRolls=[];
function stackTower(k){
  const n=k.towerLeft>0?k.towerLeft:TOWER.n;
  const keep=()=>{k.held='sig';k.heldLvl=1;k.heldSig='torn';};
  if(k.towerCool>0||k.air){keep();return;}                    /* too soon after the last one, or in the air */
  k.towerLeft=n-1;k.towerCool=TOWER.gap;
  if(k.towerLeft>0){
    k.tower=TOWER.n-k.towerLeft;keep();
    if(!k.towerG){k.towerG=new THREE.Group();scene.add(k.towerG);}
    while(k.towerG.children.length)k.towerG.remove(k.towerG.children[0]);
    for(let q=0;q<k.tower;q++){const L=burgerLayer(q===k.tower-1);L.position.y=q*1.0;k.towerG.add(L);}
    for(let p=0;p<8;p++)puff(k.x+rand(-1,1),k.y+rand(2,3.4),k.z+rand(-1,1),.85,.6,.28,.4);
    if(k===player){toast(k.tower>1?'DUBBELBURGARE! '+k.towerLeft+' KVAR':'BURGARTORNET! '+k.towerLeft+' KVAR');ping(500,700+k.tower*150,.1);}
  }else toppleTower(k);
}
function toppleTower(k){
  k.tower=0;k.towerLeft=0;if(k.towerG)k.towerG.visible=false;
  const g=new THREE.Group(),w=burgerLayer(true);w.rotation.z=Math.PI/2;w.scale.setScalar(1.5);w.position.y=1.6;g.add(w);scene.add(g);
  burgerRolls.push({owner:k,s:((k.mi-2)%N+N)%N,lat:clamp(k.lat,-HW+2,HW-2),t:0,g,w,hit:new Set([k])});
  if(k===player){toast('TORNET RAMLAR! AKTA ER DÄR BAK');audioTone(400,120,.4,.08,'triangle');}
}
function updateRolls(dt){
  for(let n=burgerRolls.length-1;n>=0;n--){
    const R=burgerRolls[n];R.t+=dt;
    if(R.t>TOWER.life){for(let p=0;p<12;p++)puff(R.g.position.x+rand(-2,2),R.g.position.y+rand(0,2),R.g.position.z+rand(-2,2),.85,.6,.28,.6);
      scene.remove(R.g);burgerRolls.splice(n,1);continue;}
    R.s=((R.s-TOWER.roll*dt/SEG)%N+N)%N;                       /* back down the road, against the race */
    const i=Math.floor(R.s);roadPt(i,R.lat,0,R.g.position);
    R.g.rotation.y=Math.atan2(fx[i],fz[i]);R.w.rotation.x-=dt*8;   /* rolling backwards */
    for(const o of karts){
      if(R.hit.has(o)||!sigHittable(o,R.owner)||o.rib)continue;
      if(Math.hypot(o.x-R.g.position.x,o.z-R.g.position.z)>TOWER.r||Math.abs(o.y-R.g.position.y)>3)continue;
      R.hit.add(o);
      for(let p=0;p<12;p++)puff(o.x+rand(-1,1),o.y+rand(.3,1.6),o.z+rand(-1,1),.85,.6,.28,.6);
      if(blockHit(o)){if(R.owner===player)toast(o.name+' SKYDDADE SIG');continue;}
      o.spun=Math.max(o.spun,TOWER.spin*o.spinResist);o.slow=Math.max(o.slow,TOWER.slow);o.boost=0;o.drift=0;o.charge=0;
      if(o===player){toast('PÅKÖRD AV EN HAMBURGARE!');shake=Math.min(1,shake+.4);}
      else if(R.owner===player)toast('BURGAREN TOG '+o.name+'!');
    }
  }
}
/** the tower makes a kart heavier in bumps: js/43-physics.js separate() */
const menuMass=k=>k.mass*(k.tower>0?1+TOWER.mass*k.tower:1);

/* ── KORV MED BRÖD ── */
const korvs=[];
const korvParts=(function(){
  const body=flat(new THREE.CylinderGeometry(.5,.5,3.6,8)),tip=flat(new THREE.SphereGeometry(.5,8,4));
  return ()=>{const g=new THREE.Group(),r=new THREE.Group();g.add(r);r.rotation.x=Math.PI/2;
    sigMesh(r,body,sausageMat,0,0,0);sigMesh(r,tip,sausageMat,0,1.8,0);sigMesh(r,tip,sausageMat,0,-1.8,0);
    for(let q=0;q<4;q++)sigMesh(r,sigBox(.14,.5,.14),cheeseMat,0,-1.2+q*.8,-.48);   /* a line of mustard */
    scene.add(g);return g;};
})();
const bunParts=(function(){
  const half=sigBox(1.0,1.7,5.0),crust=sigBox(1.1,.5,4.6);
  return ()=>{const g=new THREE.Group();                        /* a bun half on each side of the kart */
    for(const s of [-1,1]){sigMesh(g,half,bunMat,s*1.75,1.0,0);sigMesh(g,crust,bunMat,s*1.45,2.0,0);}
    g.visible=false;scene.add(g);return g;};
})();
function fireKorv(k){
  const g=korvParts();
  korvs.push({owner:k,s:(k.mi+1.5)%N,lat:k.lat,t:0,speed:Math.max(k.speed+KORV.speed,KORV.min),g});
  if(k===player){toast('KORV MED BRÖD! FYR!');audioTone(500,150,.25,.09,'square');}
}
function updateKorvs(dt){
  for(let n=korvs.length-1;n>=0;n--){
    const K=korvs[n];K.t+=dt;
    K.s=(K.s+K.speed*dt/SEG)%N;
    const i=Math.floor(K.s);roadPt(i,K.lat,.9,K.g.position);K.g.rotation.set(0,Math.atan2(fx[i],fz[i]),0);
    if(Math.random()<.5)puff(K.g.position.x,K.g.position.y,K.g.position.z,.95,.95,.95,.3);
    let hit=null;
    for(const o of karts){
      if(!sigHittable(o,K.owner)||o.rib)continue;
      if(Math.hypot(o.x-K.g.position.x,o.z-K.g.position.z)<KORV.r&&Math.abs(o.y+.9-K.g.position.y)<2.4){hit=o;break;}
    }
    if(!hit&&K.t<KORV.life)continue;
    scene.remove(K.g);korvs.splice(n,1);
    if(!hit){if(K.owner===player)sigMiss(K.owner,'KORVEN MISSADE');continue;}
    for(let p=0;p<12;p++)puff(hit.x+rand(-1,1),hit.y+rand(.3,1.8),hit.z+rand(-1,1),.88,.6,.28,.6);
    if(blockHit(hit)){if(K.owner===player)toast(hit.name+' SKYDDADE SIG');continue;}
    hit.bunned=KORV.time;hit.boost=0;hit.drift=0;hit.charge=0;hit.launch=0;
    if(!hit.bunG)hit.bunG=bunParts();
    if(hit===player){toast('INKLÄMD I ETT BRÖD!');shake=Math.min(1,shake+.35);}
    else if(K.owner===player)toast(hit.name+' BLEV KORV MED BRÖD');
  }
}

/* ── what physics reads, the timers, the drawing, the clean-up: called from 37-signature-items.js ── */
const menuTop=k=>(k.order>0?ORDER.top:1)*(k.wrap>0?WRAP.top:1)*(k.ai&&k.mashed>0?MOS.top:1);
const menuGrip=k=>(k.wrap>0?WRAP.grip:1)*(k.tower>0?1-TOWER.grip*k.tower:1);
const menuPush=(k,thr)=>(k.bunned>0?-KORV.pull:0)+thr*(k.wrap>0?WRAP.push:0);   /* the bun carries you backwards */
function updateMenu(dt){
  for(const k of karts){
    if(k.towerCool>0)k.towerCool=Math.max(0,k.towerCool-dt);
    if(k.tower>0&&k.heldSig!=='torn'&&!k.parked)toppleTower(k);   /* the slot lost it (a gull took it): the tower falls off */
    if(k.bunned>0)k.bunned=Math.max(0,k.bunned-dt);
    if(k.mashed>0)k.mashed=Math.max(0,k.mashed-dt);
    if(k.order>0){k.order=Math.max(0,k.order-dt);k.orderT+=dt;
      if(k.order<=0&&k===player)toast('TACK FÖR BESÖKET!');}
    if(k.soda>0){
      k.soda=Math.max(0,k.soda-dt);
      const Fx=Math.sin(k.yaw),Fz=Math.cos(k.yaw);
      for(let p=0;p<2;p++)puff(k.x-Fx*2.8+rand(-.4,.4),k.y+rand(1.4,2.6),k.z-Fz*2.8+rand(-.4,.4),.42,.22,.1,.5);   /* the fountain */
      if(Math.random()<.5)puff(k.x-Fx*3.2,k.y+2.8,k.z-Fz*3.2,.95,.95,.9,.3);
      if(k.soda<=0&&!k.parked&&!k.done&&state==='race')burp(k);
    }
    if(k.wrap>0){
      k.wrap=Math.max(0,k.wrap-dt);
      if(!k.parked)wrapStep(k);
      if(k.wrap<=0||k.done){k.wrap=0;wrapShow(k,false);k.slow=Math.max(k.slow,WRAP.dizzy);
        for(let p=0;p<10;p++)puff(k.x+rand(-1,1),k.y+rand(2,3),k.z+rand(-1,1),1,.9,.3,.5);
        if(k===player)toast('SNURRIG...');}
    }
  }
  updateMashes(dt);updateRolls(dt);updateKorvs(dt);
  if(mosEl){
    const b=player.mashed>0;
    mosEl.classList.toggle('on',b);
    if(b)mosEl.style.opacity=Math.min(1,player.mashed/1.2).toFixed(2);   /* the wipers get it off at the end */
  }
}
function drawMenu(){
  for(const k of karts){
    const live=!k.parked;
    if(k.hatchG){const on=live&&k.order>0;k.hatchG.visible=on;
      if(on){rideWith(k.hatchG,k,.4,ORDER.side,0);
        const u=clamp(k.orderT/(ORDER.time*.6),0,1);k.hatchG.userData.hand.position.x=-.8+u*.8;}}
    if(k.cupG){const on=live&&k.soda>0;k.cupG.visible=on;if(on)rideWith(k.cupG,k,-.6,0,1.9+Math.sin(clock*12)*.05);}
    if(k.wrapG&&k.wrap>0)k.wrapG.userData.roll.rotation.x+=k.speed*.016/1.9;
    if(k.towerG){const on=live&&k.tower>0;k.towerG.visible=on;
      if(on){rideWith(k.towerG,k,-.2,0,2.4);k.towerG.rotation.z=Math.sin(clock*5)*.06*k.tower;}}   /* wobbly */
    if(k.bunG){const on=live&&k.bunned>0;k.bunG.visible=on;if(on)rideWith(k.bunG,k,0,0,0);}
  }
}
function clearMenu(){
  for(const k of karts){
    k.order=0;k.soda=0;k.mashed=0;k.wrap=0;k.tower=0;k.towerLeft=0;k.towerCool=0;k.bunned=0;
    if(k.wrapG&&k.wrapG.visible)wrapShow(k,false);
    for(const g of [k.hatchG,k.cupG,k.towerG,k.bunG])if(g)g.visible=false;
  }
  for(const m of mashes)scene.remove(m.m);
  for(const R of burgerRolls)scene.remove(R.g);
  for(const K of korvs)scene.remove(K.g);
  mashes.length=0;burgerRolls.length=0;korvs.length=0;
  if(mosEl)mosEl.classList.remove('on');
}
