"use strict";
/* ───────── power-ups ───────── */
/* Five families, three levels each. An item box gives the family; the sugar cubes held
   when it is used pick the level (0 → 1, 1 → 2, 2 → 3) and are spent with it. */
const rockets=[], hooks=[], walls=[], farts=[];
/** an unprotected weapon or hazard hit knocks one sugar cube loose */
function dropSugar(k){
  if(!k.sugar)return;
  for(let p=0;p<6;p++)puff(k.x+rand(-1.2,1.2),k.y+rand(.4,1.6),k.z+rand(-1.2,1.2),1,1,1,.45);
  k.sugar--;
  if(k===player)setTimeout(()=>toast(k.held?'SOCKERBIT TAPPAD: '+itemName(k.held,itemLvl(k)):'SOCKERBIT TAPPAD'),700);
}
function useItem(k){
  if(!k.held||k.spun>0||k.fartT>0)return;
  if(k.rib&&(k.held==='pie'||k.held==='rocket')){            /* no room in a farm lane */
    if(k===player)toast('FÖR TRÅNGT HÄR!');
    return;
  }
  const fam=k.held,lvl=itemLvl(k);k.held=null;k.sugar=0;
  USE[fam](k,lvl);
}
const USE={
  /* Mjölk, Gräddfil, Skånsk grädde: longer first, then raw power */
  boost(k,lvl){
    k.boost=Math.max(k.boost,[1.2,2.4,3.0][lvl-1]*k.milk);k.boostLvl=Math.max(k.boostLvl,lvl);k.slow=0;
    for(let p=0;p<12+lvl*8;p++)puff(k.x+rand(-.8,.8),k.y+rand(.3,1.5),k.z+rand(-.8,.8),1,1,1,.55);
    if(k===player){
      toast(lvl===3?'SKÅNSK GRÄDDE!!!':lvl===2?'GRÄDDFIL! LÅNG FART':(k.milk>1?'EGEN MJÖLK! MUUU':'MJÖLK! FULL FART'));
      ping(560,[980,1200,1600][lvl-1],.10+lvl*.05);if(k.milk>1)moo();
      if(lvl===3)shake=Math.min(.3,shake+.25);
    }
  },
  rocket(k,lvl){
    if(lvl===1)fireCake(k);else if(lvl===2)fireHook(k);else raiseWall(k);
  },
  /* Äggakaka blocks one hit; the hot one also shoves whoever you ram;
     the flying pans are three blocks or three bashes, whichever comes first */
  shield(k,lvl){
    k.shield=lvl===3?10:9*k.shieldMul;k.shieldLvl=lvl;k.pans=lvl===3?3:0;k.panHit={};
    for(let p=0;p<12;p++)puff(k.x+rand(-.9,.9),k.y+rand(.3,1.4),k.z+rand(-.9,.9),.95,lvl===2?.5:.82,lvl===2?.2:.4,.5);
    if(k===player){toast(lvl===3?'DEN FLYGANDE STEKPANNAN!':lvl===2?'STEKHET ÄGGAKAKA! KÖR PÅ DEM':'ÄGGAKAKA! SKÖLD');
      ping(380,[720,860,1000][lvl-1],.14);}
  },
  /* Äppelpaj, then a pie with spilled coffee, then the cake mine */
  pie(k,lvl){
    const back=n=>((k.si-n)%N+N)%N, lat=clamp(k.lat,-HW*.8,HW*.8);
    if(lvl===3){
      const m=addItem('mine',back(9),clamp(k.lat,-HW*.45,HW*.45));
      m.owner=k;m.arm=0.9;m.temp=22;
      if(k===player){toast('TÅRTMINA UTLAGD!');ping(500,250,.12);}
      return;
    }
    addItem('pie',back(8),lat).temp=15;
    if(lvl===2){addItem('coffee',back(12),clamp(lat+rand(-1.4,1.4),-HW*.8,HW*.8)).temp=15;}
    if(k===player){toast(lvl===2?'KAFFEREP!':'ÄPPELPAJ SLÄPPT!');ping(330,150,.12);}
  },
  fart(k,lvl){
    if(lvl===3){                                       /* a tiny pause, then the thunder */
      k.fartT=0.4;k.rattle=0.5;
      if(k===player){toast('…');ping(140,120,.3);}
      return;
    }
    blast(k,lvl);
  }
};

/* forward attack */
function fireCake(k){
  const mesh=makeSpettekaka();
  mesh.scale.setScalar(.85);mesh.rotation.x=-Math.PI/2;   /* nose forward */
  const holder=new THREE.Group();holder.add(mesh);scene.add(holder);
  rockets.push({si:(k.si+2)%N,lat:k.lat,owner:k,t:0,speed:Math.max(k.speed,26)+24,holder});
  if(k===player){toast('AVFYRAD!');ping(820,180,.16);}
}
/** the next kart up the main road within reach, for homing */
function nextAhead(si,owner,reach){
  let best=null,bd=1e9;
  for(const k of karts){
    if(k===owner||k.rib||k.parked)continue;
    let d=k.mi-si;
    if(d<-N/2)d+=N;else if(d>N/2)d-=N;
    if(d<0||d>reach)continue;
    if(d<bd){bd=d;best=k;}
  }
  return [best,bd];
}
/** a closed passage up the road, which stops whatever is flying down it */
function blockerAhead(si,reach){
  let bb=null,bd=1e9;
  for(const B of BLOCKERS){
    if(B.R.open)continue;
    let d=B.mi-si;if(d<-N/2)d+=N;else if(d>N/2)d-=N;
    if(d>=0&&d<reach&&d<bd){bd=d;bb=B;}
  }
  return [bb,bd];
}
function updateRockets(dt){
  for(let n=rockets.length-1;n>=0;n--){
    const r=rockets[n];
    r.t+=dt;
    r.si+=r.speed*dt/SEG;
    while(r.si>=N)r.si-=N;
    const i=Math.floor(r.si)%N;
    /* mild homing onto whoever is next up the road */
    let [best,bd]=nextAhead(r.si,r.owner,60), bb=null;
    for(const B of BLOCKERS){
      if(B.R.open||B.R.noRocket)continue;          /* a switch-only passage ignores rockets */
      let d=B.mi-r.si;if(d<-N/2)d+=N;else if(d>N/2)d-=N;
      if(d>=0&&d<60&&d<bd){bd=d;bb=B;}
    }
    if(bb){
      r.lat+=clamp(bb.lat-r.lat,-12*dt,12*dt);
      let d=bb.mi-r.si;if(d<-N/2)d+=N;else if(d>N/2)d-=N;
      if(Math.abs(d)<3&&Math.abs(bb.lat-r.lat)<3.6){openPassage(bb,r.owner);scene.remove(r.holder);rockets.splice(n,1);continue;}
    }
    else if(best)r.lat+=clamp(best.lat-r.lat,-9*dt,9*dt);
    const x=sx[i]+rx[i]*r.lat, z=sz[i]+rz[i]*r.lat;
    const y=sy[i]+r.lat*bank[i]+1.0;
    r.holder.position.set(x,y,z);
    r.holder.rotation.y=Math.atan2(fx[i],fz[i]);
    if(Math.random()<.7)puff(x+rand(-.3,.3),y+.2,z+rand(-.3,.3),.9,.62,.3,.34);
    let done=r.t>4.5;
    if(!done)for(const k of karts){
      if(k===r.owner||k.rib)continue;
      let d=k.mi-r.si;
      if(d<-N/2)d+=N;else if(d>N/2)d-=N;
      if(Math.abs(d)>3||Math.abs(k.lat-r.lat)>3.4)continue;
      if(!blockHit(k)){
        dropSugar(k);
        k.spun=1.5*k.spinResist;k.boost=0;k.drift=0;k.charge=0;
        for(let p=0;p<18;p++)
          puff(k.x+rand(-1.3,1.3),k.y+rand(.2,1.4),k.z+rand(-1.3,1.3),1,.72,.34,.7);
        if(k===player){toast(sayLine('hit')||'TRÄFFAD!');ping(300,60,.3);shake=Math.min(1,shake+.8);}
        else if(r.owner===player){toast('TRÄFF!');ping(880,420,.12);}
      }
      done=true;break;
    }
    if(done){scene.remove(r.holder);rockets.splice(n,1);}
  }
  updateHooks(dt);updateWalls(dt);updateFarts(dt);shieldContacts();
}

/* Spettigare kaka: a cake on a skewer, on a rope. It needs a clear shot within reach;
   once it bites, the rope reels the thrower in toward the target's slipstream and lets
   go just short of contact, so the overtake is still yours to steer. The target keeps
   full control. A shield blocks it; a lane, a corner the rope cuts across, or time
   breaks it. */
const HOOK_REACH=1.0, HOOK_HOLD=2.4, ropeMat=new THREE.LineBasicMaterial({color:0xe8d8b0});
function fireHook(k){
  const mesh=makeSpettekaka();
  mesh.scale.setScalar(.6);mesh.rotation.x=-Math.PI/2;
  const holder=new THREE.Group();holder.add(mesh);scene.add(holder);
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.BufferAttribute(new Float32Array(6),3));
  const rope=new THREE.Line(geo,ropeMat);rope.frustumCulled=false;scene.add(rope);
  hooks.push({owner:k,si:(k.si+2)%N,lat:k.lat,t:0,speed:Math.max(k.speed,26)+34,holder,rope,target:null});
  if(k===player){toast('SPETTIGARE KAKA!');ping(700,300,.14);}
}
function dropHook(n,why){
  const h=hooks[n];
  scene.remove(h.holder);scene.remove(h.rope);h.rope.geometry.dispose();hooks.splice(n,1);
  if(why&&h.owner===player)toast(why);
}
/** does a straight rope between two karts leave the road, i.e. cut across scenery? */
function ropeCut(a,b){
  if(a.rib||b.rib)return a.rib!==b.rib;
  for(const f of [.33,.66]){
    const mx=lerp(a.x,b.x,f),mz=lerp(a.z,b.z,f),i=nearestLocal(mx,mz,a.si);
    if(Math.abs((mx-sx[i])*rx[i]+(mz-sz[i])*rz[i])>HW+2.5)return true;
  }
  return false;
}
function updateHooks(dt){
  for(let n=hooks.length-1;n>=0;n--){
    const h=hooks[n],k=h.owner;
    h.t+=dt;
    if(!h.target){
      h.si+=h.speed*dt/SEG;while(h.si>=N)h.si-=N;
      const i=Math.floor(h.si)%N,[best]=nextAhead(h.si,k,40),[bb,bd]=blockerAhead(h.si,3);
      if(best)h.lat+=clamp(best.lat-h.lat,-7*dt,7*dt);
      if(bb&&bd<2){dropHook(n,'KROKEN FASTNADE');continue;}
      if(h.t>HOOK_REACH||k.rib){dropHook(n,'MISS!');continue;}
      h.holder.position.set(sx[i]+rx[i]*h.lat,sy[i]+h.lat*bank[i]+1.0,sz[i]+rz[i]*h.lat);
      h.holder.rotation.y=Math.atan2(fx[i],fz[i]);
      for(const o of karts){
        if(o===k||o.rib||o.parked||o.ghost>0)continue;
        let d=o.mi-h.si;if(d<-N/2)d+=N;else if(d>N/2)d-=N;
        if(Math.abs(d)>3||Math.abs(o.lat-h.lat)>3.2)continue;
        if(blockHit(o)){h.t=99;if(k===player)toast('SKÖLDEN STOPPADE KROKEN');break;}
        h.target=o;h.t=0;
        if(k===player){toast('FAST! HÄNG MED');ping(500,900,.12);}
        else if(o===player)toast(k.name+' HAR KROKAT DIG!');
        break;
      }
    }else{
      const o=h.target,dx=o.x-k.x,dz=o.z-k.z,d=Math.hypot(dx,dz);
      if(h.t>HOOK_HOLD||o.parked||o.done||k.spun>0||k.recoverT>0||o.recoverT>0||d>70||ropeCut(k,o)){
        dropHook(n,h.t>HOOK_HOLD?'REPET SLÄPPTE':'REPET GICK AV');continue;}
      if(d<6.5){                                         /* in the slipstream: steer out and pass */
        k.boost=Math.max(k.boost,.45);
        dropHook(n,'SLÄPP! KÖR OM');continue;}
      k.tow=0.12;
      const pull=Math.min(30,8+d*0.9)*dt;
      k.vx+=dx/d*pull;k.vz+=dz/d*pull;
      h.holder.position.set(o.x-Math.sin(o.yaw)*1.9,o.y+1.0,o.z-Math.cos(o.yaw)*1.9);
      h.holder.rotation.y=o.yaw;
    }
    const P=h.rope.geometry.attributes.position;
    P.setXYZ(0,k.x,k.y+1.1,k.z);P.setXYZ(1,h.holder.position.x,h.holder.position.y,h.holder.position.z);
    P.needsUpdate=true;
  }
}

/* Semmelväggen: semlor stack up in front of the kart, then surge down the road as one
   wide wave. It hits each rival once, stops at a closed passage and runs out of steam
   after a stretch, so it clears a contested piece of road, not the whole lap. */
const semlaParts=(function(){
  const bun=psMat({color:0xd9a050}),cream=psMat({color:0xfffaf0}),sugar=psMat({color:0xffffff,unlit:true});
  return [
    [flat(new THREE.SphereGeometry(.7,8,3,0,6.283,Math.PI/2,Math.PI/2)),bun,.7,1],
    [flat(new THREE.CylinderGeometry(.66,.7,.34,8)),cream,.86,1],
    [flat(new THREE.SphereGeometry(.6,8,3,0,6.283,0,Math.PI/2)),bun,1.0,.6],
    [flat(new THREE.CylinderGeometry(.3,.36,.05,6)),sugar,1.37,1]];
})();
function makeSemla(){
  const g=new THREE.Group();
  for(const [geo,mat,y,sy] of semlaParts){const m=new THREE.Mesh(geo,mat);m.position.y=y;m.scale.y=sy;g.add(m);}
  return g;
}
const WALL_WIND=0.55, WALL_RANGE=115;
function raiseWall(k){
  const g=new THREE.Group(),bits=[];
  const half=HW*0.85,n=Math.max(4,Math.round(half*2/2.3));
  for(let r=0;r<2;r++)for(let q=0;q<n-r;q++){
    const s=makeSemla();s.scale.setScalar(1.5);
    s.userData.l=-half+(q+0.5+r*0.5)*(half*2/n);s.userData.h=r*1.55;s.userData.at=(q+r*n)/(2*n)*WALL_WIND;
    s.visible=false;g.add(s);bits.push(s);
  }
  scene.add(g);
  walls.push({owner:k,g,bits,t:0,si:k.si,lat:0,half,dist:0,speed:Math.max(k.speed,28)+20,hit:new Set([k])});
  if(k===player){toast('SEMMELVÄGGEN!');ping(260,520,.3);}
}
function dropWall(n){
  const w=walls[n];
  for(const s of w.bits)if(s.visible)for(let p=0;p<3;p++)
    puff(w.g.position.x+rand(-w.half,w.half)*.5,w.g.position.y+rand(.5,2.5),w.g.position.z+rand(-1,1),1,.95,.85,.7);
  scene.remove(w.g);walls.splice(n,1);
}
function updateWalls(dt){
  for(let n=walls.length-1;n>=0;n--){
    const w=walls[n],k=w.owner;
    w.t+=dt;
    if(w.t<WALL_WIND){                                   /* stacking in front of the kart */
      w.si=(k.si+3)%N;w.lat=clamp(k.lat,-HW*.15,HW*.15);w.speed=Math.max(k.speed,28)+20;
      for(const s of w.bits)if(!s.visible&&w.t>=s.userData.at){s.visible=true;
        if(k===player)ping(300+s.userData.h*200,500,.04);}
    }else{
      for(const s of w.bits)s.visible=true;
      const step=w.speed*dt;w.dist+=step;w.si+=step/SEG;while(w.si>=N)w.si-=N;
      const [bb,bd]=blockerAhead(w.si,3);
      if(w.dist>WALL_RANGE||(bb&&bd<2)){dropWall(n);continue;}
      for(const o of karts){
        if(w.hit.has(o)||o.rib||o.parked||o.ghost>0)continue;
        let d=o.mi-w.si;if(d<-N/2)d+=N;else if(d>N/2)d-=N;
        if(Math.abs(d)>2.6||Math.abs(o.lat-w.lat)>w.half+1.2)continue;
        w.hit.add(o);
        if(blockHit(o))continue;
        dropSugar(o);
        o.spun=Math.max(o.spun,1.2*o.spinResist);o.slow=Math.max(o.slow,.6);o.boost=0;o.drift=0;o.charge=0;
        for(let p=0;p<20;p++)puff(o.x+rand(-1.4,1.4),o.y+rand(.3,1.8),o.z+rand(-1.4,1.4),1,.96,.88,.8);
        if(o===player){toast('SEMLOR I ANSIKTET!');ping(260,70,.3);shake=Math.min(1,shake+.7);}
        else if(k===player){toast('SEMLA-TRÄFF!');ping(880,420,.12);}
      }
    }
    const i=Math.floor(w.si)%N;
    w.g.position.set(sx[i]+rx[i]*w.lat,sy[i]+w.lat*bank[i],sz[i]+rz[i]*w.lat);
    w.g.rotation.y=Math.atan2(fx[i],fz[i]);
    for(const s of w.bits){
      const u=s.userData,surge=w.t<WALL_WIND?Math.min(1,(w.t-u.at)*6):1;
      s.position.set(-u.l,u.h*surge+Math.abs(Math.sin(clock*9+u.l))*(w.t<WALL_WIND?0:.35),0);
    }
    if(w.t>=WALL_WIND&&Math.random()<.8)
      puff(w.g.position.x+rand(-2,2),w.g.position.y+.4,w.g.position.z+rand(-2,2),1,.97,.9,.4);
  }
}

/* protection */
/** Stekhet äggakaka and the flying pans hit back. A pan never strikes the same rival
    twice in quick succession, and a bump only counts if you drove into them. */
function bash(k,o,force,ux,uz){
  if(o.panHit)o.panHit[k.idx]=raceTime;              /* pan against pan: one clash, not two */
  for(let p=0;p<10;p++)puff((k.x+o.x)/2+rand(-.6,.6),(k.y+o.y)/2+rand(.4,1.4),(k.z+o.z)/2+rand(-.6,.6),1,.85,.5,.35);
  if(k===player||o===player)ping(1100,700,.08);
  if(blockHit(o))return;
  dropSugar(o);
  o.vx+=ux*force;o.vz+=uz*force;o.slow=Math.max(o.slow,.5);o.boost=0;o.drift=0;o.charge=0;
  if(o===player){toast('PANG!');shake=Math.min(1,shake+.45);}
  else if(k===player)toast(k.shieldLvl===3?'PANG! STEKPANNA':'STEKHET!');
}
/** from separate(), at the moment two karts meet hard: a hot äggakaka on whoever drove in */
function hotBump(A,B,dx,dz){
  const hot=k=>k.shield>0&&k.shieldLvl===2&&!k.pans;
  if(hot(A)&&A.vx*dx+A.vz*dz>3){A.shield=0;bash(A,B,14,dx,dz);}
  else if(hot(B)&&-(B.vx*dx+B.vz*dz)>3){B.shield=0;bash(B,A,14,-dx,-dz);}
}
function shieldContacts(){
  if(state!=='race')return;
  for(const k of karts){
    if(k.shield<=0||k.parked||!k.pans)continue;
    for(const o of karts){
      if(o===k||o.parked||o.ghost>0||Math.abs(o.y-k.y)>2.5)continue;
      const dx=o.x-k.x,dz=o.z-k.z,d=Math.hypot(dx,dz);
      if(d<1e-3||d>3.9||raceTime-(k.panHit[o.idx]||-9)<1.5)continue;
      k.panHit[o.idx]=raceTime;
      bash(k,o,10,dx/d,dz/d);
      if(--k.pans<=0){k.shield=0;break;}
    }
  }
}
/** three spinning pans round the kart while it has any left */
const panParts=(function(){
  const iron=psMat({color:0x6a727c}),wood=psMat({color:0x6b4a2a});
  const pan=flat(new THREE.CylinderGeometry(.62,.5,.16,10)),handle=flat(new THREE.BoxGeometry(.14,.1,.9));
  return ()=>{const g=new THREE.Group();g.add(new THREE.Mesh(pan,iron));
    const h=new THREE.Mesh(handle,wood);h.position.z=.95;g.add(h);g.scale.setScalar(1.25);return g;};
})();
function drawShield(k){
  const lvl=k.shieldLvl||1,on=k.shield>0;
  k.dome.visible=on&&lvl<3;
  if(k.dome.visible){
    k.dome.position.set(k.x,k.y+1.15,k.z);k.dome.rotation.y+=.05;
    k.dome.material.uniforms.uColor.value.setHex(lvl===2?(Math.floor(clock*8)%2?0xff5a1f:0xffa02a):0xe8c33a);
    if(lvl===2&&Math.random()<.3)puff(k.x+rand(-1.5,1.5),k.y+rand(1,2.4),k.z+rand(-1.5,1.5),.95,.95,.95,.4);
  }
  if(!k.panG&&!(on&&k.pans))return;
  if(!k.panG){k.panG=new THREE.Group();for(let q=0;q<3;q++)k.panG.add(panParts());scene.add(k.panG);}
  k.panG.visible=on&&k.pans>0;
  if(!k.panG.visible)return;
  k.panG.position.set(k.x,k.y+1.5,k.z);
  k.panG.children.forEach((p,q)=>{
    const a=clock*4.2+q*2.094;
    p.visible=q<k.pans;p.position.set(Math.cos(a)*2.7,Math.sin(clock*6+q)*.2,Math.sin(a)*2.7);
    p.rotation.y=-a;p.rotation.x=.25;
  });
}

/* close-range disruption */
/* Skånska bönor push a tailgater off your bumper, ärtsoppa breaks up the pack behind and
   beside you and takes their grip for a moment, bruna bönor med fläsk shove everyone
   round you outward and steal some speed. The cloud is quick and clears again. */
const FART=[{r:13,push:9},{r:15,push:11},{r:20,push:17}];
function blast(k,lvl){
  const F=FART[lvl-1],Fx=Math.sin(k.yaw),Fz=Math.cos(k.yaw);
  farts.push({x:k.x,y:k.y,z:k.z,yaw:k.yaw,lvl,t:0,r:F.r});
  for(let p=0;p<8*lvl;p++)puff(k.x-Fx*1.8+rand(-1,1),k.y+rand(.3,1.2),k.z-Fz*1.8+rand(-1,1),.8,.88,.32,.5);
  k.rattle=0.5+lvl*0.25;k.boost=Math.max(k.boost,.2*lvl);
  if(k===player||Math.hypot(k.x-player.x,k.z-player.z)<30)fartSound(lvl);
  if(k===player){toast(lvl===3?'BRÖÖÖÖP!':lvl===2?'ÄRTSOPPA!':'PRRRT!');shake=Math.min(.5,shake+.12*lvl);}
  let hits=0;
  for(const o of karts){
    if(o===k||o.parked||o.ghost>0||Math.abs(o.y-k.y)>3)continue;
    const dx=o.x-k.x,dz=o.z-k.z,d=Math.hypot(dx,dz);
    if(d>F.r||d<1e-3)continue;
    const f=dx*Fx+dz*Fz,s=Math.abs(dx*Fz-dz*Fx);
    if(lvl===1&&!(f<0&&s<-f*0.7+2))continue;           /* a short cone straight back */
    if(lvl===2&&f>1.5)continue;                        /* behind and beside, not ahead */
    if(blockHit(o))continue;
    dropSugar(o);hits++;
    const push=F.push*(1-0.5*d/F.r);
    o.vx+=dx/d*push;o.vz+=dz/d*push;o.drift=0;o.charge=0;o.suck=Math.min(o.suck,-1.5);   /* no slipstream either */
    o.rattle=0.5;
    if(lvl>=2)o.slick=Math.max(o.slick,1.3);
    if(lvl===3){o.slow=Math.max(o.slow,1.0);o.boost=0;}
    if(o===player){toast(lvl===3?'BRÖÖÖÖP! VILKEN STANK':'USCH! BÖNOR');shake=Math.min(1,shake+.3);}
  }
  if(k===player&&hits)setTimeout(()=>toast(hits>1?hits+' TRÄFFADE!':'TRÄFF!'),600);
}
function updateFarts(dt){
  for(const k of karts){
    if(k.rattle>0)k.rattle=Math.max(0,k.rattle-dt);
    if(k.fartT>0){k.fartT-=dt;if(k.fartT<=0)blast(k,3);}
  }
  for(let n=farts.length-1;n>=0;n--){
    const c=farts[n];c.t+=dt;
    if(c.t>0.42){farts.splice(n,1);continue;}
    const R=c.r*(0.2+0.8*c.t/0.42),spread=[0.6,1.9,Math.PI][c.lvl-1],back=c.yaw+Math.PI;
    for(let p=0;p<4+c.lvl*4;p++){
      const a=back+rand(-spread,spread),rr=R*rand(.75,1);
      const g=rand(.7,.9);
      puff(c.x+Math.sin(a)*rr,c.y+rand(.3,1.6),c.z+Math.cos(a)*rr,g*.9,g,g*.36,.45);
    }
  }
}
function clearPowerups(){
  for(const r of rockets)scene.remove(r.holder);
  rockets.length=0;
  while(hooks.length)dropHook(hooks.length-1);
  for(const w of walls)scene.remove(w.g);
  walls.length=0;farts.length=0;
}
