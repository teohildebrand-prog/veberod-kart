"use strict";
/* ───────── power-ups ───────── */
/* Five families, three levels each. An item box gives the family and the level together;
   the item keeps that level until it is used, whatever hits the kart meanwhile. */
const rockets=[], hooks=[], walls=[], farts=[];
function useItem(k){
  if(!k.held||k.roll>0||k.spun>0||k.fartT>0||k.frozen>0)return;   /* nothing while the slot still spins, or frozen */
  if(k.rib&&(k.held==='pie'||k.held==='rocket'||(k.held==='sig'&&SIGS[k.heldSig].lane===false))){            /* no room in a farm lane */
    if(k===player)toast('FÖR TRÅNGT HÄR!');
    return;
  }
  const fam=k.held,lvl=itemLvl(k);k.held=null;k.heldLvl=0;k.usedAt=clock;
  USE[fam](k,lvl);
}
const USE={
  sig(k){const id=k.heldSig;k.lastSig=id;k.heldSig=null;SIGS[id].use(k);},   /* a signature item: 37-signature-items.js */
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
/* A shot fired toward a closed passage with no rival before it goes for the passage, and is
   steered so it arrives in the mouth however far off the road that sits. It is checked
   before the shot moves, so a long frame can't carry it past. */
const SHOT_REACH=90;
function mouthAhead(si,reach,owner){
  let bb=null,bd=1e9;
  for(const B of BLOCKERS){
    if(B.R.open||B.R.noRocket)continue;              /* a switch-only passage ignores shots */
    let d=B.mi-si;if(d<-N/2)d+=N;else if(d>N/2)d-=N;
    if(d>=0&&d<reach&&d<bd){bd=d;bb=B;}
  }
  if(bb&&owner&&nextAhead(si,owner,bd)[0])return [null,1e9];   /* a rival in between comes first */
  return [bb,bd];
}
/** line a shot up on the mouth for this frame's step; true when it is within two samples of it after the step */
function steerToMouth(p,B,d,step){
  p.lat+=(B.lat-p.lat)/Math.max(1,(d-1)/Math.max(step,1e-3));
  return d<=step+2;
}
function updateRockets(dt){
  for(let n=rockets.length-1;n>=0;n--){
    const r=rockets[n];
    r.t+=dt;
    const step=r.speed*dt/SEG,[mb,md]=mouthAhead(r.si,SHOT_REACH,r.owner);
    if(mb&&steerToMouth(r,mb,md,step)){openPassage(mb,r.owner);scene.remove(r.holder);rockets.splice(n,1);continue;}
    r.si+=step;
    while(r.si>=N)r.si-=N;
    const i=Math.floor(r.si)%N;
    /* otherwise mild homing onto whoever is next up the road */
    if(!mb){const [best]=nextAhead(r.si,r.owner,60);if(best)r.lat+=clamp(best.lat-r.lat,-9*dt,9*dt);}
    const x=sx[i]+rx[i]*r.lat, z=sz[i]+rz[i]*r.lat;
    const y=sy[i]+r.lat*bank[i]+1.0;
    r.holder.position.set(x,y,z);
    r.holder.rotation.y=Math.atan2(fx[i],fz[i]);
    if(Math.random()<.7)puff(x+rand(-.3,.3),y+.2,z+rand(-.3,.3),.9,.62,.3,.34);
    let done=r.t>4.5&&!mb;
    if(!done)for(const k of karts){
      if(k===r.owner||k.rib)continue;
      let d=k.mi-r.si;
      if(d<-N/2)d+=N;else if(d>N/2)d-=N;
      if(Math.abs(d)>3||Math.abs(k.lat-r.lat)>3.4)continue;
      if(!blockHit(k)){
        k.spun=1.5*k.spinResist;k.boost=0;k.drift=0;k.charge=0;
        for(let p=0;p<18;p++)
          puff(k.x+rand(-1.3,1.3),k.y+rand(.2,1.4),k.z+rand(-1.3,1.3),1,.72,.34,.7);
        if(k===player){toast(hitLine(r.owner,'TRÄFFAD!'));ping(300,60,.3);shake=Math.min(1,shake+.8);}
        else if(r.owner===player){toast('TRÄFF!');ping(880,420,.12);}
      }
      done=true;break;
    }
    if(done){scene.remove(r.holder);rockets.splice(n,1);}
  }
  updateHooks(dt);updateWalls(dt);updateFarts(dt);shieldContacts();updateSigs(dt);
}

/* Spettigare kaka: a cake on a skewer, on a rope. Fired forward, it bites the first rival
   it reaches; the rope snaps tight and launches the thrower forward, steering still in
   their hands, and lets go before the two karts touch so the overtake is theirs to make.
   The rival is only an anchor: it keeps its speed and its steering. A shield or scenery
   stops the hook; a reset, a finish, a different route, a rope across the verge or
   something in the way breaks it. The launch is ordinary driving with more push, so the
   fence, blockers and gates all still apply. Tune it in HOOK. */
const HOOK={
  reach:0.7,        /* seconds the hook flies before it counts as a miss */
  tighten:0.1,      /* seconds from the clank to the rope going taut */
  launch:0.9,       /* the longest the surge can last */
  push:60,          /* extra forward acceleration while launching, m/s² */
  top:1.45,         /* the surge's top speed, as a share of the kart's own */
  release:7,        /* let go this far from the anchor, before contact */
  maxRope:70        /* a rope stretched further than this snaps */
};
const ROPE_PTS=9, ropeMat=new THREE.LineBasicMaterial({color:0xe8d8b0});
function fireHook(k){
  const mesh=makeSpettekaka();
  mesh.scale.setScalar(.6);mesh.rotation.x=-Math.PI/2;
  const holder=new THREE.Group();holder.add(mesh);scene.add(holder);
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.BufferAttribute(new Float32Array(ROPE_PTS*3),3));
  const rope=new THREE.Line(geo,ropeMat);rope.frustumCulled=false;scene.add(rope);
  hooks.push({owner:k,si:(k.si+2)%N,lat:k.lat,t:0,speed:Math.max(k.speed,26)+34,holder,rope,target:null,rib:k.rib});
  if(k===player){toast('SPETTIGARE KAKA!');ping(700,300,.14);}
}
function dropHook(n,why){
  const h=hooks[n];
  if(h.target){h.owner.launch=0;h.owner.tow=0;}       /* the surge ends with the rope */
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
/** would another quarter second of surge put the kart into the fence or a closed passage? */
function launchBlocked(k){
  const ax=k.x+k.vx*.25,az=k.z+k.vz*.25;
  if(!k.rib){
    const i=nearestLocal(ax,az,k.si);
    if(Math.abs((ax-sx[i])*rx[i]+(az-sz[i])*rz[i])>HW+3.2)return true;   /* the fence */
    for(const B of BLOCKERS)if(!B.R.open&&Math.hypot(ax-B.x,az-B.z)<4.5)return true;
  }else{
    const R=ALTS[k.rib-1],j=nearestAlt(R,ax,az,k.si);
    if(Math.abs((ax-R.X[j])*R.RX[j]+(az-R.Z[j])*R.RZ[j])>R.hw+.6)return true;
  }
  return false;
}
function updateHooks(dt){
  for(let n=hooks.length-1;n>=0;n--){
    const h=hooks[n],k=h.owner;
    h.t+=dt;
    if(!h.target){
      /* a closed passage up the road and no rival before it: the rope pays out as far as it takes, and the hook
         bites into it and yanks it open */
      const step=h.speed*dt/SEG,[mb,md]=mouthAhead(h.si,SHOT_REACH,k);
      if(mb&&steerToMouth(h,mb,md,step)){openPassage(mb,k);dropHook(n);continue;}
      h.si+=step;while(h.si>=N)h.si-=N;
      const i=Math.floor(h.si)%N,[best]=nextAhead(h.si,k,h.tow?TOW.home:40),[bb,bd]=blockerAhead(h.si,3);
      if(best&&!mb)h.lat+=clamp(best.lat-h.lat,-(h.tow?11:7)*dt,(h.tow?11:7)*dt);
      if(bb&&bd<2){dropHook(n,'KROKEN FASTNADE');continue;}
      if((h.t>(h.tow?TOW.reach:HOOK.reach)&&!mb)||k.rib||k.rib!==h.rib||k.done){dropHook(n,'MISS!');continue;}
      h.holder.position.set(sx[i]+rx[i]*h.lat,sy[i]+h.lat*bank[i]+1.0,sz[i]+rz[i]*h.lat);
      h.holder.rotation.y=Math.atan2(fx[i],fz[i]);
      let gone=false;
      for(const o of karts){
        if(o===k||o.rib||o.parked||o.ghost>0||o.done)continue;
        let d=o.mi-h.si;if(d<-N/2)d+=N;else if(d>N/2)d-=N;
        if(Math.abs(d)>3||Math.abs(o.lat-h.lat)>3.2)continue;
        if(blockHit(o)){if(k===player)toast('SKÖLDEN STOPPADE KROKEN');dropHook(n);gone=true;break;}
        h.target=o;h.t=0;
        for(let p=0;p<8;p++)puff(h.holder.position.x+rand(-.5,.5),h.holder.position.y+rand(-.3,.5),h.holder.position.z+rand(-.5,.5),.85,.85,.9,.35);
        if(k===player){ping(1700,1150,.06);toast(h.tow?'JAG DRAR DIG HEM, POJK!':'KLONK!');}            /* the clank */
        else if(o===player){toast(k.name+(h.tow?' BOGSERAR DIG! SLADDA LOSS':' HAR KROKAT DIG!'));ping(1500,1000,.06);}
        break;
      }
      if(gone)continue;
    }else{
      const o=h.target,dx=o.x-k.x,dz=o.z-k.z,d=Math.hypot(dx,dz);
      if(o.parked||o.done||k.done){dropHook(n,'REPET SLÄPPTE');continue;}
      if(k.ghost>0||o.ghost>0||k.recoverT>0||o.recoverT>0||k.rtp||k.spun>0){dropHook(n,'REPET GICK AV');continue;}
      if(d>HOOK.maxRope||k.rib!==o.rib||ropeCut(k,o)){dropHook(n,'REPET GICK AV');continue;}
      const taut=h.t>=HOOK.tighten;
      if(taut&&!h.surge){                                 /* the rope snaps tight: go */
        h.surge=true;if(h.tow)k.tow=TOW.time;else k.launch=HOOK.launch;
        if(k===player){flash(h.tow?'BOGSERAD!':'HÅLL I DIG!');ping(420,1300,.22);shake=Math.min(.5,shake+.3);}
      }
      if(h.tow){
        o.towed=.15;                                      /* the rope drags on the one in front */
        if(o.drift!==0&&h.t>TOW.grace){                   /* a drift shakes it off */
          dropHook(n,'DE SLET SIG LOSS!');if(o===player){toast('LOSS!');ping(700,1100,.08);}continue;}
      }
      if(h.surge){
        if(d<HOOK.release){                               /* just short of their bumper: let go and pass */
          k.boost=Math.max(k.boost,h.tow?TOW.sling:.45);
          dropHook(n,'SLÄPP! KÖR OM');if(k===player)ping(900,1400,.08);continue;}
        if(h.tow?k.tow<=0:k.launch<=0){dropHook(n,'REPET SLÄPPTE');continue;}
        if(launchBlocked(k)){dropHook(n,'SLÄPP!');continue;}
        if(Math.random()<.8)puff(k.x-Math.sin(k.yaw)*2+rand(-.5,.5),k.y+rand(.4,1.2),k.z-Math.cos(k.yaw)*2+rand(-.5,.5),1,.9,.6,.45);
      }
      h.holder.position.set(o.x-Math.sin(o.yaw)*1.9,o.y+1.0,o.z-Math.cos(o.yaw)*1.9);
      h.holder.rotation.y=o.yaw;
    }
    /* the rope: slack while it flies and as it bites, a straight line once it is taut */
    const P=h.rope.geometry.attributes.position,hp=h.holder.position;
    const sag=h.target?(h.surge?0:1-h.t/HOOK.tighten):.6;
    const L=Math.hypot(hp.x-k.x,hp.z-k.z);
    for(let q=0;q<ROPE_PTS;q++){
      const f=q/(ROPE_PTS-1);
      P.setXYZ(q,lerp(k.x,hp.x,f),lerp(k.y+1.1,hp.y,f)-Math.sin(f*Math.PI)*sag*Math.min(3,L*.08),lerp(k.z,hp.z,f));
    }
    P.needsUpdate=true;
  }
}

/* Semmelväggen: semlor stack up in front of the kart, then surge down the road as one
   wide wave. It hits each rival once, bursts open a closed passage it reaches and runs out of steam
   after a stretch, so it clears a contested piece of road, not the whole lap. */
const semlaParts=(function(){
  const bun=psMat({color:0xd9a050}),cream=psMat({color:0xfffaf0}),icing=psMat({color:0xffffff,unlit:true});
  return [
    [flat(new THREE.SphereGeometry(.7,8,3,0,6.283,Math.PI/2,Math.PI/2)),bun,.7,1],
    [flat(new THREE.CylinderGeometry(.66,.7,.34,8)),cream,.86,1],
    [flat(new THREE.SphereGeometry(.6,8,3,0,6.283,0,Math.PI/2)),bun,1.0,.6],
    [flat(new THREE.CylinderGeometry(.3,.36,.05,6)),icing,1.37,1]];
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
      const [bb,bd]=blockerAhead(w.si,3),[mb]=mouthAhead(w.si,SHOT_REACH);
      if(bb&&bd<2&&!bb.R.noRocket)openPassage(bb,k);   /* the wave bursts a closed passage open */
      if((w.dist>WALL_RANGE&&!mb)||(bb&&bd<2)){dropWall(n);continue;}   /* and keeps going until it gets there */
      for(const o of karts){
        if(w.hit.has(o)||o.rib||o.parked||o.ghost>0)continue;
        let d=o.mi-w.si;if(d<-N/2)d+=N;else if(d>N/2)d-=N;
        if(Math.abs(d)>2.6||Math.abs(o.lat-w.lat)>w.half+1.2)continue;
        w.hit.add(o);
        if(blockHit(o))continue;
        o.spun=Math.max(o.spun,1.2*o.spinResist);o.slow=Math.max(o.slow,.6);o.boost=0;o.drift=0;o.charge=0;
        for(let p=0;p<20;p++)puff(o.x+rand(-1.4,1.4),o.y+rand(.3,1.8),o.z+rand(-1.4,1.4),1,.96,.88,.8);
        if(o===player){toast(hitLine(k,'SEMLOR I ANSIKTET!'));ping(260,70,.3);shake=Math.min(1,shake+.7);}
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
    hits++;
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
    if(k.roll>0){                                       /* the item slot lands */
      k.roll=k.held?Math.max(0,k.roll-dt):0;
      if(!k.roll&&k===player){toast(itemName(k.held,itemLvl(k))+'!');ping(620,980,.10);}
    }
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
  clearSigs();
}
