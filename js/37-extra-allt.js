"use strict";
/* ───────── Extra Allt ───────── */
/* The Sibylla event's own item (js/29-sibylla.js), only in the boxes on that track: a takeaway
   bag unfolds into three condiment bottles. Each press drops one short dressing patch behind the
   kart, ketchup, then mustard, then hamburger dressing; the bag stays in the slot until all three
   are used. A patch covers well under half the road, presses are kept apart, and a kart that
   slides through one is protected from every other Extra Allt patch for a moment, so nobody gets
   caught by two in a row. The burger kart has nothing to do with it: any driver can get it.
   Tune it here. */
const EXTRA={n:3,gap:0.6,chance:0.22,back:4.2,len:3.4,w:2.2,life:14,guard:1.6,slick:0.6,cap:24};
const EXTRA_KINDS=[{name:'KETCHUP',col:0xc8201e},{name:'SENAP',col:0xe8b81c},{name:'HAMBURGERDRESSING',col:0xf0c8a0}];
SIGS.extraallt={event:'sibylla',
  /* the slot shows how many bottles are left in the player's bag */
  get name(){const n=player&&player.heldSig==='extraallt'&&player.extraLeft>0?player.extraLeft:EXTRA.n;return 'EXTRA ALLT ×'+n;},
  text:'Bara på Sibylla: påsen fälls ut till tre flaskor. Varje tryck lägger en kort fläck bakom dig, ketchup, senap och sist hamburgerdressing.',
  use:squirtExtra,ai:s=>s.behind,
  icon:`<svg viewBox="0 0 48 48">
    <path d="M8 20h32l-3 24H11Z" fill="#f6f4ee" stroke="#8a6a40" stroke-width="2"/>
    <path d="M9 27h30" stroke="#d5202a" stroke-width="4"/>
    <circle cx="33" cy="36" r="2.4" fill="#1f4fb4"/>
    <path d="M14 20V8h5v12M22 20V4h5v16M30 20V9h5v11" fill="#c8201e" stroke="#2a2c32" stroke-width="1.6"/>
    <path d="M22 20V4h5v16" fill="#e8b81c" stroke="#2a2c32" stroke-width="1.6"/>
    <path d="M30 20V9h5v11" fill="#f0c8a0" stroke="#2a2c32" stroke-width="1.6"/></svg>`};
/** on an event track, a box may hand out the event's item before anything else */
function eventSig(k){
  if(!stage||!SIGS.extraallt||SIGS.extraallt.event!==stage.id)return null;
  return Math.random()<EXTRA.chance?'extraallt':null;
}
const extras=[];
const extraGeo=(function(){const g=new THREE.CircleGeometry(1,14);g.rotateX(-Math.PI/2);return g;})();
const extraMats=EXTRA_KINDS.map(K=>psMat({color:K.col,transparent:true,opacity:.92,depthWrite:false}));
/** one press: a patch behind, and the bag back in the slot while bottles remain */
function squirtExtra(k){
  const n=k.extraLeft>0?k.extraLeft:EXTRA.n;
  const keep=()=>{k.held='sig';k.heldLvl=1;k.heldSig='extraallt';};
  if(k.extraCool>0||k.air){keep();return;}                   /* too soon after the last one, or in the air: nothing yet */
  const kind=EXTRA.n-n;
  dropExtra(k,kind);
  k.extraLeft=n-1;k.extraCool=EXTRA.gap;
  if(k.extraLeft>0)keep();
  if(k===player){toast(EXTRA_KINDS[kind].name+'!'+(k.extraLeft?' '+k.extraLeft+' KVAR':''));ping(820,520,.08);}
}
function dropExtra(k,kind){
  const Fx=Math.sin(k.yaw),Fz=Math.cos(k.yaw);
  const x=k.x-Fx*EXTRA.back,z=k.z-Fz*EXTRA.back,i=k.rib?k.mi:nearestLocal(x,z,k.si);
  const lat=clamp((x-sx[i])*rx[i]+(z-sz[i])*rz[i],-HW+EXTRA.w,HW-EXTRA.w);
  const g=new THREE.Group();
  if(k.rib){g.position.set(x,k.y+.06,z);g.rotation.y=k.yaw;}
  else{roadPt(i,lat,.06+extras.length%5*.004,g.position);onRoadSurface(g,i);}
  const blob=new THREE.Mesh(extraGeo,extraMats[kind]);blob.scale.set(EXTRA.w,1,EXTRA.len);g.add(blob);
  const ol=borasOutline(EXTRA.len+.25,EXTRA.w+.25);ol.position.y=.02;g.add(ol);
  scene.add(g);
  extras.push({x:g.position.x,y:g.position.y,z:g.position.z,yaw:k.rib?k.yaw:Math.atan2(fx[i],fz[i]),kind,t:EXTRA.life,g,owner:k});
  if(extras.length>EXTRA.cap){scene.remove(extras[0].g);extras.shift();}
  const c=new THREE.Color(EXTRA_KINDS[kind].col);
  for(let p=0;p<8;p++)puff(x+rand(-1,1),k.y+rand(.3,1.2),z+rand(-1,1),c.r,c.g,c.b,.45);
}
function updateExtra(dt){
  for(const k of karts){
    if(k.extraCool>0)k.extraCool=Math.max(0,k.extraCool-dt);
    if(k.sauced>0)k.sauced=Math.max(0,k.sauced-dt);
  }
  for(let n=extras.length-1;n>=0;n--){
    const p=extras[n];p.t-=dt;
    if(p.t<=0){scene.remove(p.g);extras.splice(n,1);continue;}
    if(p.t<1.2)p.g.scale.setScalar(p.t/1.2);                  /* soaks in */
  }
  if(!extras.length)return;
  for(const k of karts){
    if(k.parked||k.air||k.sauced>0||k.dive>0)continue;
    for(const p of extras){
      if(p.owner===k||Math.abs(k.y-p.y)>1.6)continue;
      const dx=k.x-p.x,dz=k.z-p.z,s=p.g.scale.x,c=Math.cos(p.yaw),sn=Math.sin(p.yaw);
      const f=dx*sn+dz*c,l=dx*c-dz*sn;
      if((f*f)/(EXTRA.len*EXTRA.len*s*s)+(l*l)/(EXTRA.w*EXTRA.w*s*s)>1)continue;
      k.sauced=EXTRA.guard;                                   /* shared: no other patch catches this kart for a moment */
      if(blockHit(k))break;
      k.slick=Math.max(k.slick||0,EXTRA.slick);k.drift=0;k.charge=0;
      const col=new THREE.Color(EXTRA_KINDS[p.kind].col);
      for(let q=0;q<10;q++)puff(k.x+rand(-1.2,1.2),k.y+rand(.2,1),k.z+rand(-1.2,1.2),col.r,col.g,col.b,.5);
      if(k===player){toast(EXTRA_KINDS[p.kind].name+'!');if(typeof sibSizzle==='function')sibSizzle(.8);}
      break;
    }
  }
}
function clearExtra(){
  for(const p of extras)scene.remove(p.g);
  extras.length=0;
  for(const k of karts){k.extraLeft=0;k.extraCool=0;k.sauced=0;}
}
