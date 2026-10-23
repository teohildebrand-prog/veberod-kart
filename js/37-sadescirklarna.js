"use strict";
/* ───────── Sädescirklarna ───────── */
/* Gröna gubben's signature item, in the same pool as everyone else's (37-signature-items.js).
   His saucer swoops down behind the kart and burns a crop circle pattern into the road: one big
   circle and two small ones, and wheat sprouts out of the tarmac round their rims. Any kart that
   drives into a circle is lifted off the road and spun round it once, then let go with antennae
   on its head and flung sideways (never on up the road). Gröna gubben knows his own circles and
   drives straight over them. A shield or a jump gets through. Tune it here. */
const CROP={
  back:12,          /* metres behind the kart where the big circle lands */
  r:3.4,            /* the big circle's radius, metres */
  small:2.0,        /* the two little ones */
  side:5.6,         /* metres either side of the big one */
  aft:5,            /* and this far further back */
  draw:0.9,         /* seconds until they are burnt in (the saucer's swoop and hover); armed from then on */
  life:11,          /* seconds the circles stay */
  orbit:1.3,        /* seconds a caught kart goes round */
  lift:1.4,         /* metres it floats while it goes round */
  spins:3,          /* turns of its own on the way round */
  keep:0.4,         /* the speed kept */
  shove:9,          /* m/s sideways, out of the circle */
  slow:0.8,         /* the wobble after */
  ant:4             /* seconds the antennae stay on */
};

SIGS.gubbe={name:'SÄDESCIRKLARNA',lane:false,
  text:'Tefatet dyker ner bakom dig och bränner in sädescirklar i vägen. Den som kör in i en cirkel lyfts upp, snurrar ett varv runt den och slungas ut med antenner på huvudet. Gröna gubben känner igen sina egna cirklar.',
  use:burnCircles,ai:s=>s.behind,
  icon:`<svg viewBox="0 0 48 48">
    <ellipse cx="24" cy="36" rx="21" ry="10" fill="#e3b94a" stroke="#8a6a1e" stroke-width="2"/>
    <ellipse cx="24" cy="36" rx="13" ry="6" fill="none" stroke="#5fe86a" stroke-width="2.6"/>
    <ellipse cx="24" cy="36" rx="6" ry="2.8" fill="#5fe86a"/>
    <path d="M17 26 12 36M31 26l5 10" stroke="#9dffaa" stroke-width="2" opacity=".8"/>
    <ellipse cx="24" cy="18" rx="14" ry="5" fill="#9aa4ae" stroke="#3a4250" stroke-width="2"/>
    <path d="M16 16a8 7 0 0 1 16 0" fill="#bff6ff" stroke="#3a4250" stroke-width="2"/>
    <circle cx="24" cy="13" r="3" fill="#4fd04a"/>
    <circle cx="14" cy="19" r="1.4" fill="#ffe04a"/><circle cx="24" cy="21" r="1.4" fill="#ffe04a"/><circle cx="34" cy="19" r="1.4" fill="#ffe04a"/></svg>`};

/* ── the look ── */
const cropTex=pixTex(32,32,g=>{                    /* flattened wheat, swirled into rings */
  g.fillStyle='#d9ad3c';g.fillRect(0,0,32,32);
  g.strokeStyle='#8a6a1e';g.lineWidth=2;
  for(const r of [14,9,4]){g.beginPath();g.arc(16,16,r,0,Math.PI*2);g.stroke();}
  g.fillStyle='#f4d878';
  for(let a=0;a<8;a++){const c=Math.cos(a*Math.PI/4),s=Math.sin(a*Math.PI/4);g.fillRect(16+c*11.5-1,16+s*11.5-1,2,2);}
  g.fillRect(15,15,2,2);});
const cropDisc=(function(){const g=new THREE.CircleGeometry(1,20);g.rotateX(-Math.PI/2);return g;})(),
      cropRing=(function(){const g=new THREE.RingGeometry(.9,1.06,24);g.rotateX(-Math.PI/2);return g;})(),
      stalkGeo=flat(new THREE.ConeGeometry(.12,1,4)),
      stalkMat=psMat({color:0xe8c24e}),
      cropMat=psMat({map:cropTex,unlit:true,transparent:true,opacity:.95,depthWrite:false});
function circleParts(r){
  const glow=psMat({color:0x6aff7a,unlit:true,transparent:true,opacity:.8,depthWrite:false,side:THREE.DoubleSide});
  const g=new THREE.Group(),disc=new THREE.Mesh(cropDisc,cropMat),ring=new THREE.Mesh(cropRing,glow);
  disc.scale.setScalar(r);disc.position.y=.06;ring.scale.setScalar(r);ring.position.y=.1;g.add(disc);g.add(ring);
  const stalks=[],n=Math.round(r*6);
  for(let q=0;q<n;q++){                           /* wheat sprouting out of the tarmac round the rim */
    const a=q/n*Math.PI*2,rr=r*(1.08+(q%2)*.1),s=new THREE.Mesh(stalkGeo,stalkMat);
    s.position.set(Math.sin(a)*rr,0,Math.cos(a)*rr);s.userData.q=q;g.add(s);stalks.push(s);}
  g.userData={disc,ring,glow,stalks};scene.add(g);return g;
}
const saucerParts=(function(){
  const hull=psMat({color:0x9aa4ae}),rim=psMat({color:0x3a4250}),skin=psMat({color:0x4fd04a}),
        eye=psMat({color:0x101018,unlit:true}),lamp=psMat({color:0xffe04a,unlit:true});
  const disc=flat(new THREE.CylinderGeometry(2.8,1.6,.6,12)),lip=flat(new THREE.CylinderGeometry(3.0,3.0,.18,12)),
        dome=flat(new THREE.SphereGeometry(1.3,8,5,0,Math.PI*2,0,Math.PI/2)),head=flat(new THREE.SphereGeometry(.6,7,5)),
        bulb=flat(new THREE.OctahedronGeometry(.2,0)),beamGeo=flat(new THREE.CylinderGeometry(.6,1,1,12,1,true));
  beamGeo.translate(0,-.5,0);
  return ()=>{
    const glass=psMat({color:0xbff6ff,unlit:true,transparent:true,opacity:.45,depthWrite:false}),
          beamM=psMat({color:0x9dffaa,unlit:true,transparent:true,opacity:.35,depthWrite:false,side:THREE.DoubleSide});
    const g=new THREE.Group(),body=new THREE.Group();g.add(body);
    sigMesh(body,disc,hull,0,0,0);sigMesh(body,lip,rim,0,-.05,0);
    sigMesh(body,head,skin,0,.75,0);
    for(const s of [-1,1])sigMesh(body,sigBox(.18,.26,.1),eye,s*.24,.82,.52);   /* those black eyes */
    sigMesh(body,dome,glass,0,.28,0);
    const lights=[];
    for(let n=0;n<8;n++){const a=n/8*Math.PI*2;lights.push(sigMesh(body,bulb,lamp,Math.sin(a)*2.95,-.05,Math.cos(a)*2.95));}
    const beam=new THREE.Mesh(beamGeo,beamM);beam.position.y=-.3;g.add(beam);
    g.userData={body,lights,beam,beamM,glass};scene.add(g);return g;};
})();
const antParts=(function(){
  const skin=psMat({color:0x4fd04a}),tip=psMat({color:0x9dffaa,unlit:true});
  const stalk=flat(new THREE.CylinderGeometry(.05,.07,1,4)),ball=flat(new THREE.SphereGeometry(.2,6,4));
  return ()=>{const g=new THREE.Group(),arms=[];
    for(const s of [-1,1]){const a=new THREE.Group();a.position.set(s*.3,0,0);g.add(a);
      sigMesh(a,stalk,skin,0,.5,0);sigMesh(a,ball,tip,0,1.05,0);arms.push(a);}
    g.userData.arms=arms;g.visible=false;scene.add(g);return g;};
})();

/* ── laying the pattern ── */
const crops=[];
const _cp=new THREE.Vector3();
function burnCircles(k){
  const back=((Math.round(k.si)-Math.round(CROP.back/SEG))%N+N)%N,
        aft=((back-Math.round(CROP.aft/SEG))%N+N)%N,
        lat=clamp(k.lat,-(HW-CROP.r),HW-CROP.r);
  const P={owner:k,t:0,armed:false,hit:new Set([k]),circles:[],saucer:saucerParts()};
  const add=(i,l,r)=>{if(Math.abs(l)>HW+.5)return;
    const g=circleParts(r);roadPt(i,l,0,g.position);onRoadSurface(g,i);g.scale.setScalar(.01);
    P.circles.push({i,lat:l,r,g,x:g.position.x,y:g.position.y,z:g.position.z});};
  add(back,lat,CROP.r);
  add(aft,lat+CROP.side,CROP.small);add(aft,lat-CROP.side,CROP.small);
  roadPt(back,lat,0,_cp);P.cx=_cp.x;P.cy=_cp.y;P.cz=_cp.z;P.fx=fx[back];P.fz=fz[back];
  crops.push(P);
  const d=Math.hypot(player.x-k.x,player.z-k.z);
  if(d<90){const v=1-d/110;                        /* the theremin wobble of a saucer coming down */
    audioTone(900,300,.5,.05*v+.01,'sine');audioTone(300,1200,.5,.04*v+.01,'sine',.25);}
  if(k===player){toast('SÄDESCIRKLAR! BLIIP BLIIP');shake=Math.min(1,shake+.2);}
}

/* ── caught: round the circle once, floating ── */
function catchKart(P,C,o){
  P.hit.add(o);
  for(let p=0;p<12;p++)puff(o.x+rand(-1.2,1.2),o.y+rand(.2,1.6),o.z+rand(-1.2,1.2),.6,1,.5,.6);
  if(blockHit(o))return;
  const a0=Math.atan2(o.x-C.x,o.z-C.z),
        dir=((o.x-C.x)*P.fz-(o.z-C.z)*P.fx)>=0?1:-1;   /* round the way it came in */
  o.orbit={x:C.x,y:C.y,z:C.z,r:C.r*.8,a0,dir,t:0,v0:Math.max(o.speed,12),yaw0:o.yaw,i:C.i};
  o.boost=0;o.drift=0;o.charge=0;o.launch=0;
  const d=Math.hypot(player.x-o.x,player.z-o.z);
  if(d<80)for(let n=0;n<4;n++)audioTone(700+n*260,900+n*300,.08,.04*(1-d/100)+.01,'square',n*.12);   /* bliip bliip bliip bliip */
  if(o===player){toast('FÅNGAD I SÄDESCIRKELN!');shake=Math.min(1,shake+.35);}
  else if(P.owner===player)toast(o.name+' SNURRAR I CIRKELN');
}
/** a kart going round a circle: drive() hands it here instead of driving it (43-physics.js) */
function orbitStep(k,dt){
  const O=k.orbit;O.t+=dt;
  const u=Math.min(1,O.t/CROP.orbit),a=O.a0+O.dir*u*Math.PI*2;
  k.x=O.x+Math.sin(a)*O.r;k.z=O.z+Math.cos(a)*O.r;
  k.si=nearestLocal(k.x,k.z,k.si);
  k.y=groundAt(k.x,k.z,k.si)+CROP.lift*Math.min(1,u*5,(1-u)*5);
  k.yaw=O.yaw0+O.dir*u*Math.PI*2*CROP.spins;
  const w=O.dir*Math.PI*2/CROP.orbit*O.r;           /* moving round the rim, for anyone who bumps it */
  k.vx=Math.cos(a)*w;k.vz=-Math.sin(a)*w;k.vy=0;k.speed=Math.abs(w);k.air=false;
  k.drift=0;k.charge=0;k.boost=0;
  if(Math.random()<.6)puff(k.x+rand(-.8,.8),k.y-rand(0,.6),k.z+rand(-.8,.8),.6,1,.55,.45);
  if(u>=1||k.done||k.parked)releaseKart(k);
}
/** let go: facing up the road, slower, flung sideways out of the circle, with antennae */
function releaseKart(k){
  const O=k.orbit;k.orbit=null;
  const i=((Math.round(k.si)%N)+N)%N,l=(k.x-O.x)*rx[i]+(k.z-O.z)*rz[i],s=Math.abs(l)>.3?Math.sign(l):(Math.random()<.5?-1:1);
  k.yaw=Math.atan2(fx[i],fz[i]);
  k.vx=fx[i]*O.v0*CROP.keep+rx[i]*s*CROP.shove;k.vz=fz[i]*O.v0*CROP.keep+rz[i]*s*CROP.shove;
  k.vy=2;k.air=true;k.slow=Math.max(k.slow,CROP.slow);k.ant=CROP.ant;
  k.mi=mappedIdx(k);
  if(!k.antG)k.antG=antParts();
  if(k===player){flash('BLIIP!');toast('DU HAR FÅTT ANTENNER');}
}

/* ── the timers, the drawing, the clean-up: called from 37-signature-items.js ── */
function updateCrops(dt){
  for(const k of karts)if(k.ant>0)k.ant=Math.max(0,k.ant-dt);
  for(let n=crops.length-1;n>=0;n--){
    const P=crops[n];P.t+=dt;
    if(P.t>CROP.life){for(const C of P.circles)scene.remove(C.g);scene.remove(P.saucer);crops.splice(n,1);continue;}
    if(P.saucer.parent&&P.t>CROP.draw+.9)scene.remove(P.saucer);
    if(!P.armed&&P.t>=CROP.draw){P.armed=true;
      for(const C of P.circles)for(let p=0;p<10;p++)puff(C.x+rand(-C.r,C.r),C.y+rand(.2,1),C.z+rand(-C.r,C.r),.9,.8,.3,.6);}
    if(!P.armed)continue;
    for(const o of karts){
      if(P.hit.has(o)||!sigHittable(o,P.owner)||o.rib||o.air||o.orbit||o.sig==='gubbe')continue;   /* his own circles let him by */
      for(const C of P.circles)
        if(Math.abs(o.y-C.y)<3&&Math.hypot(o.x-C.x,o.z-C.z)<C.r+.6){catchKart(P,C,o);break;}
    }
  }
}
function drawCrops(){
  for(const P of crops){
    const burn=Math.min(1,P.t/CROP.draw),out=Math.max(0,(P.t-CROP.life+.6)/.6);
    for(const C of P.circles){
      const U=C.g.userData;C.g.scale.setScalar(Math.max(.01,burn*(1-out)));
      U.glow.uniforms.uOpacity.value=(.55+Math.sin(clock*6+C.i)*.25)*(1-out);
      for(const s of U.stalks){const q=s.userData.q,up=P.armed?Math.min(1,(P.t-CROP.draw)*4-q*.03):0;
        s.scale.set(1,Math.max(.01,up*(1-out)),1);s.position.y=.5*Math.max(0,up*(1-out));s.rotation.z=Math.sin(clock*3+q)*.15;}
    }
    if(P.saucer.parent){                             /* down from the sky, hover and burn, then gone */
      const S=P.saucer,U=S.userData,t=P.t;let h,b,sc=1;
      if(t<.4){const v=t/.4,e=v*v*(3-2*v);h=lerp(16,7,e);b=lerp(50,0,e);}   /* in low from up the road, over the kart's head */
      else if(t<CROP.draw+.1){h=7+Math.sin(clock*5)*.3;b=0;}
      else{const v=(t-CROP.draw-.1)/.8;h=7+v*v*40;b=v*v*30;sc=1-v*.6;}
      S.position.set(P.cx+P.fx*b,P.cy+h,P.cz+P.fz*b);S.scale.setScalar(sc);
      U.body.rotation.y+=.25;U.body.rotation.z=Math.sin(clock*4)*.12;
      U.lights.forEach((l,n)=>l.visible=((n+Math.floor(clock*10))%2)===0);
      const on=t>=.4&&t<CROP.draw+.1;U.beam.visible=on;U.beam.scale.set(CROP.r*1.3,h,CROP.r*1.3);
      U.beamM.uniforms.uOpacity.value=.25+Math.random()*.15;
    }
  }
  for(const k of karts){
    if(!k.antG)continue;
    const on=!k.parked&&k.ant>0;k.antG.visible=on;
    if(on){rideWith(k.antG,k,-.3,0,1.9);
      k.antG.userData.arms.forEach((a,s)=>{a.rotation.z=(s?-1:1)*.35+Math.sin(clock*14+s*2)*.3;a.rotation.x=Math.sin(clock*11+s)*.2;});}
  }
}
function clearCrops(){
  for(const k of karts){k.orbit=null;k.ant=0;if(k.antG)k.antG.visible=false;}
  for(const P of crops){for(const C of P.circles)scene.remove(C.g);scene.remove(P.saucer);}
  crops.length=0;
}
