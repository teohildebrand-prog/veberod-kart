"use strict";
/* ───────── physics ───────── */
/** Mehmet: tucked in behind another kart he charges a slingshot */
function suget(k,dt){
  const Fx=Math.sin(k.yaw),Fz=Math.cos(k.yaw);
  let behind=false;
  if(!k.air&&k.speed>14)for(const o of karts){
    if(o===k||o.parked||o.ghost>0)continue;
    const dx=o.x-k.x,dz=o.z-k.z,f=dx*Fx+dz*Fz,l=Math.abs(dx*Fz-dz*Fx);
    if(f>3&&f<15&&l<2.4){behind=true;break;}
  }
  if(k.mates>0&&!k.air)behind=true;                /* Kompisarna: always someone to tuck in behind */
  if(behind){
    const was=k.suck;k.suck+=dt;
    if(k===player&&was<0.6&&k.suck>=0.6)ping(600,700,.05);
    if(Math.random()<.4)puff(k.x+Fx*2.5+rand(-.5,.5),k.y+1,k.z+Fz*2.5+rand(-.5,.5),.85,.9,1,.25);
    if(k.suck>=1.1){
      k.suck=-1.5;                                   /* a short cooldown before the next one */
      k.boost=Math.max(k.boost,1.2);
      if(k===player){toast('SUGET!');ping(500,1300,.15);}
    }
  }else if(k.suck>0)k.suck=Math.max(0,k.suck-dt*2);
  else if(k.suck<0)k.suck=Math.min(0,k.suck+dt);
}
function drive(k,dt,ctl){
  stepPace(k,dt);
  if(k.recoverT>0){k.recoverT-=dt;if(k.recoverT<=0)recoverKart(k);}
  if(k.ghost>0)k.ghost-=dt;
  if(k.frozen>0){                                  /* Tidtagningsrättelse: time stands still for this kart */
    k.frozen=Math.max(0,k.frozen-dt);k.vx=0;k.vz=0;k.vy=0;k.speed=0;k.drift=0;k.charge=0;
    return;
  }
  const RT=k.rib?ALTS[k.rib-1]:null, T=RT||MAIN, hwR=RT?RT.hw:HW;
  k.si=RT?nearestAlt(RT,k.x,k.z,k.si):nearestLocal(k.x,k.z,k.si);
  const i=k.si, i1=RT?Math.min(i+1,RT.n-1):(i+1)%N;
  const dx=k.x-T.X[i],dz=k.z-T.Z[i];
  let lat=dx*T.RX[i]+dz*T.RZ[i];
  const ms=!RT&&MAINS[i]&&Math.abs(lat)<HW+1.3?MAINS[i]:'';
  const surf=RT&&Math.abs(lat)<RT.hw+0.8?SURF[RT.S[i]]:(ms?SURF[ms]:null);
  k.surf=surf?(RT?RT.S[i]:ms):'';
  pumpStep(k,dt,ctl,!RT&&atPumpNow(i,lat),surf);
  const dry=k.fuel<=0;
  const thr=k.spun>0||k.bunned>0?0:(dry?ctl.throttle*0.17:ctl.throttle);   /* dry = limp, not dead */
  if(!k.ai&&!TT&&!FREE)fuelWarn(k);
  const onRoad=Math.abs(lat)<hwR+(RT?0.8:1.3)||k.court;
  if(TT||FREE)k.fuel=TANK;                                /* nothing to manage in a time trial */
  {const sf=RT?(surf?RT.S[i]:'grass'):ms?(SFX[ms]?ms:'road'):(onRoad||stage.ground==='sea'?(stage.sfxRoad||(stage.road==='cobble'?'cobble':(stage.road==='sand'?'sand':'road'))):
      (stage.sfxOff||(stage.ground==='dunes'?'sand':'grass')));
   if(sf!==k.sfx){const was=k.sfx;k.sfx=sf;if(was)surfaceEnter(k,sf);}}
  if(k.boost>0)k.boost=Math.max(0,k.boost-dt);
  if(k.boost<=0)k.boostLvl=0;
  if(k.slick>0)k.slick=Math.max(0,k.slick-dt);   /* Garnnystanet: no grip */
  if(k.launch>0)k.launch=Math.max(0,k.launch-dt);   /* launched off the hook's rope */
  if(k.slow>0)k.slow=Math.max(0,k.slow-dt);
  if(k.shield>0)k.shield=Math.max(0,k.shield-dt);
  if(k.spun>0){k.spun=Math.max(0,k.spun-dt);k.yaw+=11*dt;}   /* spettekaka-träff */
  if(k.kvart){                       /* Björn: wait out the academic quarter, then launch */
    if(ctl.throttle>0||raceTime>2.2){
      if(raceTime>=0.8&&raceTime<=2.2&&ctl.throttle>0){
        k.boost=Math.max(k.boost,1.7);
        if(k===player){toast('AKADEMISK KVART!');ping(520,1250,.2);}
      }
      k.kvart=false;
    }else if(k===player&&raceTime>=0.8&&!k.kvartCue){k.kvartCue=true;toast('NU!');ping(880,880,.08);}
  }
  if(k.wheelie)suget(k,dt);

  const sp=Math.hypot(k.vx,k.vz);
  let turn=2.35*Math.min(1,sp/7)*(1-0.26*clamp(sp/k.maxSpeed,0,1));
  if(k.drift!==0)turn*=1.42;
  if(k.air)turn*=0.5;                              /* half authority airborne */
  if(k.curse>0)k.curse=Math.max(0,k.curse-dt);     /* Ale's curse: left is right */
  k.yaw+=(k.spun>0?0:ctl.steer*(k.curse>0?-1:1))*turn*dt;
  if(k.slow>0)k.yaw+=Math.sin(k.slow*31.0)*1.5*dt;   /* pie wobble */

  const Fx=Math.sin(k.yaw),Fz=Math.cos(k.yaw),Rx=-Fz,Rz=Fx;
  /* longitudinal road gradient only: a banked corner is not a hill, and sliding
     across one must not read as climbing. Also saves two height lookups a step. */
  const gslope=k.air?0:((T.Y[i1]-T.Y[i])/SEG)*(Fx*T.FX[i]+Fz*T.FZ[i]);
  let fwd=k.vx*Fx+k.vz*Fz, side=k.vx*Rx+k.vz*Rz;

  {                                          /* AI drifts too, same rules */
    const want=ctl.drift&&!k.air&&sp>13&&Math.abs(ctl.steer)>0.15;
    if(want&&k.drift===0){k.drift=Math.sign(ctl.steer)||1;k.clean=true;}
    if(k.drift!==0&&(!ctl.drift||sp<8)){
      if(k.charge>0.55){
        const big=k.charge>1.45;
        const perfect=big&&k.orig&&k.clean;              /* Victor: ORIGINALKÄNSLA */
        k.boost=big?(perfect?1.95:1.5):0.95;
        for(let p=0;p<10;p++)puff(k.x+rand(-1,1),k.y+.5,k.z+rand(-1,1),
          big?1:.42, big?.70:.76, big?.18:.95, .5);
        bodyKick(k,big?-.13:-.07,0,0);                   /* the nose kicks up as the boost bites */
        if(k===player)kickFov(perfect?6:(big?5:3));
        if(k===player&&perfect){perfekt();ping(520,1500,.2);}
        else if(k===player){toast(big?'TURBO!':'FART!');ping(big?520:620,big?1200:900,.17);}
      }
      k.drift=0;k.charge=0;k.dstage=0;
    }
    if(k.drift!==0){
      k.charge+=dt*(Math.abs(side)>4?1.25:0.6);
      const st=k.charge>1.45?2:(k.charge>0.55?1:0);     /* blue stage, then amber */
      if(st>k.dstage&&k===player)ping(st===2?760:540,st===2?1160:820,.07);
      k.dstage=st;
    }
  }

  /* gräddfil and up shrug off the verge; skånsk grädde also pulls harder and goes faster */
  const cream=k.boost>0?k.boostLvl:0, offR=cream>=2?Math.max(k.offRoad,0.88):k.offRoad;
  side*=Math.exp(-(k.air?0.35:(k.drift!==0?2.1:(k.slow>0?3.2:(onRoad?k.gripOn*(surf?surf.grip(offR):1):4.2))))*(k.slick>0?0.3:1)*sigGrip(k)*dt);
  const top=sigTop(k)*k.maxSpeed*(k.pace||1)*(onRoad?(surf?surf.top(offR):1):offR)*(k.boost>0?k.boostMul*(cream>=3?1.14:1):1)*(k.launch>0?HOOK.top:1)*(k.slow>0?0.5:1)*(k.spun>0?0.35:1)*(dry?0.30:1);
  if(!k.air){
    const torque=1+0.35*clamp(1-sp/k.maxSpeed,0,1);  /* short gears down low */
    fwd+=thr*(k.boost>0?k.power+(cream>=3?34:21):k.power)*(k.pace||1)*torque*(onRoad||cream>=2?1:0.6)*(k.slow>0?0.55:1)*dt;
    if(k.launch>0)fwd+=HOOK.push*dt;                 /* the hook's surge: forward along your own nose */
    fwd+=sigPush(k,thr)*dt;                          /* tow rope, bike legs, the planned line */
    if(dry)fwd-=Math.sign(fwd)*1.6*dt;              /* coughing along on fumes */
    fwd-=ctl.brake*52*dt;
    fwd-=gslope*15*dt;                             /* climbs cost you, but not the lap */
    if(thr===0&&ctl.brake===0)fwd-=Math.sign(fwd)*6*dt;
  }
  fwd-=fwd*(k.air?0.06:(onRoad?0.62:1.55))*dt;
  fwd=clamp(fwd,-11,top*(1+clamp(-gslope,0,0.45)*0.55));  /* steeper down, faster */

  k.vx=Fx*fwd+Rx*side;k.vz=Fz*fwd+Rz*side;
  k.x+=k.vx*dt;k.z+=k.vz*dt;

  k.si=RT?nearestAlt(RT,k.x,k.z,k.si):nearestLocal(k.x,k.z,k.si);
  const j=k.si;
  const ddx=k.x-T.X[j],ddz=k.z-T.Z[j];
  lat=ddx*T.RX[j]+ddz*T.RZ[j];
  /* walls: the main road's fence, or a lane's own edges once you are in it.
     At the mouth and the merge the side facing the main road stays open. */
  let lim=HW+3.7,open=false;
  if(RT){lim=RT.hw+1.1;if(j<COMMIT||j>RT.n-1-MERGE)open=lat*RT.TM[j]>0;}
  if(Math.abs(lat)>lim&&!open){
    const fo=ddx*T.FX[j]+ddz*T.FZ[j],cl=clamp(lat,-lim,lim);
    k.x=T.X[j]+T.FX[j]*fo+T.RX[j]*cl;k.z=T.Z[j]+T.FZ[j]*fo+T.RZ[j]*cl;
    const vl=k.vx*T.RX[j]+k.vz*T.RZ[j],vf=k.vx*T.FX[j]+k.vz*T.FZ[j];
    /* a real hit costs speed; leaning on the fence just slides you along it */
    const keep=Math.abs(vl)>3?0.72:0.995;
    if(keep<1){k.clean=false;                        /* a knock spoils a clean drift */
      if(raceTime-(k.wallAt??-9)>.3)                 /* the body rolls on into the fence, then rights itself; once per knock, not per grinding step */
        bodyKick(k,0,clamp(-vl*(T.RX[j]*Rx+T.RZ[j]*Rz)*.012,-.16,.16),clamp(Math.abs(vl)*.003,0,.05));
      k.wallAt=raceTime;}
    k.vx=T.FX[j]*vf*keep-T.RX[j]*vl*0.25;k.vz=T.FZ[j]*vf*keep-T.RZ[j]*vl*0.25;
    if(!k.ai&&Math.abs(vl)>9)shake=Math.min(1,shake+0.5);
    /* pinned nose-first at walking pace: the fence turns you along itself */
    if(Math.hypot(k.vx,k.vz)<6){const d=wrapAng(Math.atan2(T.FX[j],T.FZ[j])-k.yaw);
      if(Math.abs(d)<2.2)k.yaw+=d*Math.min(1,dt*2.5);}
  }
  if(BLOCKERS.length)bumpBlockers(k);
  if(sigWalls.length)bumpSigWalls(k);              /* Containern, Slussporten */
  if(routeSwitch(k,lat)){
    const T2=k.rib?ALTS[k.rib-1]:MAIN,s2=k.si;
    lat=(k.x-T2.X[s2])*T2.RX[s2]+(k.z-T2.Z[s2])*T2.RZ[s2];
  }

  const gy=groundK(k,k.x,k.z);
  k.vy-=(k.glide&&k.vy<0?GLIDE:34)*dt;              /* Kapten Mås glides down */
  k.y+=k.vy*dt;
  if(k.y<=gy||(k.court&&k.y-gy<0.6&&k.vy<=0)){           /* a forecourt is flat concrete: no hopping past the pumps */
    if(k.air&&k.vy<-8){                              /* touchdown */
      const big=k.airT>0.42;
      for(let p=0;p<(big?14:6);p++)
        puff(k.x+rand(-1.2,1.2),gy+rand(.1,.7),k.z+rand(-1.2,1.2),.78,.72,.56,.6);
      if(big){
        k.boost=Math.max(k.boost,.85);
        if(k===player){if(!k.jumpSaid)toast('SNYGGT HOPP!');ping(420,900,.12);}
      }
      bodyKick(k,0,0,clamp(-k.vy*.006,.04,.16));        /* squash on the springs */
      if(k===player)shake=Math.min(1,shake+clamp(-k.vy*0.035,0,.7));
    }
    k.y=gy;k.vy=0;k.air=false;k.airT=0;k.jumpSaid=false;
  }else{
    k.air=true;k.airT+=dt;
    if(k===player&&k.airT>=.42&&k.airT-dt<.42&&state==='race')k.jumpSaid=bark('jump',4);   /* Carl: HÅLL I LASTEN! */
  }
  k.spin+=fwd*dt/0.44;
  k.lean=lerp(k.lean,clamp(-side*0.045,-0.34,0.34),Math.min(1,dt*9));
  k.speed=Math.hypot(k.vx,k.vz);k.onRoad=onRoad;k.lat=lat;

  /* a lap counts only once every gate has been passed in order. Gates sit on the
     sector boundaries of the main loop; on a shortcut the kart's progress is mapped
     onto the same interval, so a lane's own stretch of gates must be driven too */
  const m0=k.mi;k.mi=mappedIdx(k);
  passGates(k,m0);
  k.progress=gateProgress(k);
  if(k.marks&&state==='race')while(k.marks.length*MARK<=k.progress)k.marks.push(raceTime);   /* for gapTo */
  if(k.ghostBuf&&k.lap>=1&&!k.done)ghostSample(k,k.ghostBuf);

  if(k.drift!==0&&k.speed>12){
    for(const s of [-1.05,1.05])
      puff(k.x+Fx*-1.5+Rx*s,k.y+.22,k.z+Fz*-1.5+Rz*s,
        k.charge>1.45?1:(k.charge>0.55?.45:.8),
        k.charge>1.45?.66:(k.charge>0.55?.72:.8),
        k.charge>1.45?.18:(k.charge>0.55?.92:.82),.55);
  }else if(k.speed>8&&!k.air){                     /* the surface table's wheel particles */
    const S=SFX[k.sfx],c=S&&S.dust;
    if(c&&Math.random()<(S.spray?0.8:(k.onRoad?0.3:0.5))){
      if(S.spray)puff(k.x-Fx*1.7+rand(-.9,.9),k.y+rand(.3,1.2),k.z-Fz*1.7+rand(-.9,.9),c[0],c[1],c[2],.7);
      else puff(k.x+rand(-1,1),k.y+.2,k.z+rand(-1,1),c[0],c[1],c[2],.75);
    }
  }
  if(k.slow>0&&Math.random()<0.6)
    puff(k.x+rand(-1,1),k.y+rand(.3,1.1),k.z+rand(-1,1),.9,.52,.56,.5);
  if(k.boost>0&&cream>=2)for(let p=0;p<cream-1;p++)    /* the cream trail */
    puff(k.x-Fx*(2.2+p)+rand(-.6,.6),k.y+rand(.4,1.1),k.z-Fz*(2.2+p)+rand(-.6,.6),1,.98,.9,cream>=3?1.1:.6);
  else if(k.boost>0&&Math.random()<0.7)
    puff(k.x-Fx*2.2+rand(-.4,.4),k.y+.7,k.z-Fz*2.2+rand(-.4,.4),1,.55,.15,.35);
}

let missT=-9, raceSeed=0;
/* ───────── one gate graph ─────────
   Main-loop gates sit on the CPN sector lines with lap fractions 0, 1/8, ... A lane
   that skips main gates gets twins of them at the same fraction, so its own stretch is
   driven gate by gate too. next[] lists the gates that may come after each one.
   Race position = laps + the last gate's fraction + the way on toward the next. */
let GATES=[];
function buildGates(){
  GATES=[];
  for(let s=0;s<CPN;s++)GATES.push({id:s,sec:s,route:0,at:s*N/CPN,frac:s/CPN,next:[(s+1)%CPN]});
  for(const R of ALTS){
    const span=((R.b-R.a)%N+N)%N,off=s=>((s*N/CPN-R.a)%N+N)%N;
    const tw=[];for(let s=0;s<CPN;s++){const d=off(s);if(d>0&&d<span)tw.push(s);}
    if(!tw.length)continue;
    tw.sort((p,q)=>off(p)-off(q));
    const ids=tw.map(s=>{const H={id:GATES.length,sec:s,route:R.idx,at:s*N/CPN,frac:s/CPN,next:[]};
      GATES.push(H);return H.id;});
    ids.forEach((id,n)=>GATES[id].next.push(n+1<ids.length?ids[n+1]:(tw[n]+1)%CPN));
    GATES[(tw[0]-1+CPN)%CPN].next.push(ids[0]);      /* the gate before the fork leads into the lane too */
  }
}
/** did this step carry the kart over a gate on its own route? */
function passGates(k,m0){
  let d=k.mi-m0;if(d<-N/2)d+=N;else if(d>N/2)d-=N;
  if(d<=0||d>24)return;                           /* standing, reversing, or lifted by the tractor */
  const cur=GATES[k.gate]||GATES[0];
  for(const H of GATES){
    if(H.id===k.gate||H.route!==k.rib)continue;
    const a=((H.at-m0)%N+N)%N;
    if(a<=0||a>d)continue;
    /* a twin of the gate already passed just re-anchors; the next sector is always fine */
    if(cur.next.includes(H.id)||H.sec===cur.sec||H.sec===(cur.sec+1)%CPN)enterGate(k,H);
    else if(k===player&&state==='race'&&clock-missT>3&&(H.sec-cur.sec+CPN)%CPN<CPN/2){
      missT=clock;toast('MISSAD KONTROLLPUNKT');ping(240,180,.2);}
    return;
  }
}
function enterGate(k,H){
  const lapLine=H.sec===0&&k.cp!==0;
  k.gate=H.id;k.cp=H.sec;
  if(!lapLine)return;
  k.lap++;
  const t=raceTime,lt=t-k.lapStart;k.lapStart=t;
  if(k.lapTimes)k.lapTimes.push(lt);
  if(k.lap>=2&&(k.best==null||lt<k.best))k.best=lt;
  if(TT&&k===player)ttLap(lt);
  if(k.ghostBuf)k.ghostBuf=[];
  shutPassages(k);                                /* your passage closes as you start a new lap */
  if(k.lap>=LAPS&&!k.done){k.done=true;k.total=t;if(k===player)finish();}
  else if(k===player&&FREE)toast('VARV '+fmt(lt));
  else if(k===player&&!TT)toast('VARV '+Math.min(k.lap+1,LAPS)+'/'+LAPS);
}
function gateProgress(k){
  const H=GATES[k.gate]||GATES[0],nx=GATES[H.next[0]];
  const span=((nx.at-H.at)%N+N)%N||N, d=((k.mi-H.at)%N+N)%N;
  return k.lap*N+H.frac*N+(d>N/2?0:Math.min(d,span));
}
/** hop between the main road and a lane at a fork or merge: whichever centreline
    is nearer wins. Returns true when the kart changed route. */
function routeSwitch(k,lat){
  if(!ALTS.length)return false;
  if(!k.rib){
    for(const R of ALTS){
      const d=((k.si-R.a)%N+N)%N;
      if(d>COMMIT+16)continue;
      if(k.ai&&k.plan!==R.idx)continue;            /* the AI only goes where it planned */
      if(R.hidden&&!R.open)continue;               /* a boulder in the mouth */
      const j=nearestAlt(R,k.x,k.z,Math.min(d,R.n-1));
      if(j>COMMIT+6)continue;
      const la=Math.abs(altLat(R,j,k.x,k.z));
      if(la<R.hw-0.3||la+0.4<Math.abs(lat)){k.rib=R.idx;k.si=j;if(k===player&&R.hidden)foundRoute(R);
        if(k===player&&state==='race')bark('shortcut',20);        /* Amanda at home: Det är kortare här. */
        return true;}
    }
    return false;
  }
  const R=ALTS[k.rib-1], j=k.si;
  const atEnd=j>=R.n-1-MERGE, atStart=j<=COMMIT;
  if(!atEnd&&!atStart)return false;
  const hint=atEnd?((R.b-(R.n-1-j))%N+N)%N:(R.a+j)%N;
  const mi=nearestLocal(k.x,k.z,hint);
  const lm=Math.abs((k.x-sx[mi])*rx[mi]+(k.z-sz[mi])*rz[mi]);
  if(lm+0.4<Math.abs(lat)||(atEnd&&j>=R.n-2)){
    k.rib=0;k.si=mi;if(atEnd)k.plan=0;return true;
  }
  return false;
}
/** progress on the main loop's scale, wherever the kart is */
function mappedIdx(k){
  const i=k.si;
  if(!k.rib)return i+clamp(((k.x-sx[i])*fx[i]+(k.z-sz[i])*fz[i])/SEG,-1,1);
  const R=ALTS[k.rib-1],f=clamp(altFwd(R,i,k.x,k.z)/SEG,-1,1);
  const i2=f>=0?Math.min(i+1,R.n-1):Math.max(i-1,0);
  return R.MAP[i]+Math.abs(f)*(R.MAP[i2]-R.MAP[i]);
}
/** the road a kart will be on s samples ahead: its lane, or the one it plans to take */
function walkPt(k,s){
  if(k.rib){const R=ALTS[k.rib-1],j=k.si+s;
    return j<R.n?[R,j]:[MAIN,(R.b+j-(R.n-1))%N];}
  if(k.plan){const R=ALTS[k.plan-1],d=((R.a-k.si)%N+N)%N;
    if(d<=s){const j=s-d;return j<R.n?[R,j]:[MAIN,(R.b+j-(R.n-1))%N];}}
  return [MAIN,(k.si+s)%N];
}
/** rough seconds to drive n samples of a route, from this kart's own grip and speed */
function routeCost(k,T,i0,n){
  let t=0;
  for(let q=0;q<n;q++)t+=sampleSecs(k,T,T===MAIN?(i0+q)%N:i0+q);
  return t;
}
/** rough seconds for this kart to cross one sample of a route */
function sampleSecs(k,T,i){
  const s=T===MAIN?(MAINS[i]?SURF[MAINS[i]]:null):SURF[T.S[i]], G=AI_G*(2.7/k.caution);
  const top=k.maxSpeed*(s?s.top(k.offRoad):1);
  const v=Math.min(top,Math.sqrt(G*(k.gripOn*(s?s.grip(k.offRoad):1)/9.5)*14*SEG/Math.max(T.CURV[i],1e-4)));
  return SEG/Math.max(v,4);
}
/** at a fork: score every legal route and take the cheapest. Personality moves
    the weights, never the physics. */
function chooseRoute(k,R){
  if(k.lap===0)return false;                           /* lap 1 stays readable */
  const span=((R.b-R.a)%N+N)%N;
  if(!laneFuelOk(k,R))return false;                    /* skips a pump it can not do without */
  const ln=k.cfg.lean||{};
  if(ln.defend&&k.place===1)return false;              /* Britta holds the lead on tarmac */
  const near=(o,onAlt)=>o!==k&&(onAlt?(o.rib===R.idx||o.plan===R.idx):(!o.rib&&o.plan!==R.idx))&&
                        ((o.mi-k.mi)%N+N)%N<40;
  const traffic=onAlt=>karts.filter(o=>near(o,onAlt)).length*0.35*(ln.traffic||1);
  const appetite=typeof cupClass==='function'?cupClass().risk:1;
  const rough=(R.surface!=='gravel'||R.mud)?(ln.rough||0):0;
  const noise=(hash2(k.idx*7.13+R.idx*1.7,k.lap*3.31+raceSeed)-0.5)*0.7;
  const cAlt=routeCost(k,R,0,R.n)+R.risk*(ln.risk||1)*appetite+traffic(true)
            +(SURF[R.surface].fuel-1)*(ln.fuel||1)*0.6+rough+noise;
  const cMain=routeCost(k,MAIN,R.a,span)+traffic(false);
  return cAlt<cMain;
}
function planRoutes(k){
  if(k.rib)return;
  if(k.plan&&ALTS[k.plan-1].hidden&&!ALTS[k.plan-1].open)k.plan=0;   /* shut again */
  for(const R of ALTS){
    const d=((R.a-k.si)%N+N)%N;
    if(d<12||d>90||k.planned[R.idx]===k.lap)continue;
    k.planned[R.idx]=k.lap;
    /* secret passages: only the cup rival dares, and only once someone has opened one */
    if(R.hidden&&!(R.open&&k.rival)){k.plan=0;continue;}
    k.plan=chooseRoute(k,R)?R.idx:0;
  }
}
/* Arne's tractor: lifts a stuck kart back onto the road behind where it was */
const tractor=(function(){
  const g=new THREE.Group();
  const grn=psMat({color:0x3f8a3a}),blk=psMat({color:0x23272e}),red=psMat({color:0xc8321f});
  const b=(w,h,d,m,x,y,z)=>{const e=new THREE.Mesh(flat(new THREE.BoxGeometry(w,h,d)),m);e.position.set(x,y,z);g.add(e);};
  b(1.6,1.1,3.0,grn,0,1.3,0);b(1.4,1.4,1.3,grn,0,2.4,-.6);b(.2,1.1,.2,blk,.4,2.6,.9);
  const wh=(r,x,z)=>{const c=new THREE.CylinderGeometry(r,r,.5,8);c.rotateZ(Math.PI/2);
    const e=new THREE.Mesh(flat(c),red);e.position.set(x,r,z);g.add(e);};
  wh(.95,-1.05,-.8);wh(.95,1.05,-.8);wh(.55,-.95,1.1);wh(.55,.95,1.1);
  b(3.2,.15,.6,blk,0,1.0,2.0);                              /* the front loader */
  g.visible=false;scene.add(g);return g;
})();
let tractorT=0;
function recoverKart(k){
  let T=k.rib?ALTS[k.rib-1]:MAIN,i;
  if(k.rib){
    const R=T;i=k.si-8;
    if(i<=COMMIT){T=MAIN;i=((R.a-6)%N+N)%N;k.rib=0;k.plan=0;}
  }else i=((k.si-10)%N+N)%N;
  k.si=i;k.x=T.X[i];k.z=T.Z[i];k.yaw=Math.atan2(T.FX[i],T.FZ[i]);
  k.vx=k.vz=k.vy=0;k.speed=0;k.drift=0;k.charge=0;k.dstage=0;k.boost=0;k.spun=0;k.slow=0;k.launch=0;
  k.y=groundK(k,k.x,k.z);k.air=false;k.airT=0;k.ghost=1.5;k.stuckT=0;k.stuckP=-1e9;k.recoverT=0;k.rtp=false;k.offT=0;
  if(k.fuel<14)k.fuel=14;                 /* Arne tips a can in: dry on a climb is not a dead end */
  tractor.position.set(k.x+T.RX[i]*3.4,k.y,k.z+T.RZ[i]*3.4);
  tractor.rotation.y=k.yaw;tractor.visible=true;tractorT=1.7;
  for(let p=0;p<14;p++)puff(k.x+rand(-1.4,1.4),k.y+rand(.2,1.6),k.z+rand(-1.4,1.4),.78,.72,.56,.6);
  if(k===player){toast('ARNES TRAKTOR!');ping(200,120,.25);}
}
function askRecover(k){
  if(k.recoverT>0||state!=='race')return;
  k.recoverT=1.0;
  if(k===player)toast('TILLBAKA PÅ BANAN…');
}

/* Catch-up, a strong rubber band. Each AI's pace follows its gap to the player in seconds along
   the race (shortcuts map onto the same progress), not its place: within the dead zone it races as
   it is, further ahead it eases off, further behind it pushes, harder with every second up to the
   cap. Pace scales the corner limit, top speed and pull together: karts spend most of a lap
   cornering, so a band on top speed alone barely moves the field. A bot ahead eases sooner than
   one behind pushes, so a faster player can still pass and keep the lead. The player gets a
   smaller pull of their own when the leading bot gets away. It all blends in over half a second.
   Tune it in PACE and PLAYER_PACE; tools/band_audit.py measures how close the field stays. */
const PACE={dead:1,deadAhead:0.5,ramp:3,ahead:0.20,behind:0.22,blend:2},MARK=4;
const PLAYER_PACE={dead:1.5,ramp:4,max:0.08};
/** seconds k is behind the player (negative: ahead), from when each passed the same point */
function gapTo(k){
  const a=player.marks,b=k.marks;
  if(!a||!b)return 0;
  if(player.progress>=k.progress){const t=a[Math.floor(k.progress/MARK)];return t===undefined?0:raceTime-t;}
  const t=b[Math.floor(player.progress/MARK)];return t===undefined?0:t-raceTime;
}
function paceTarget(k){
  if(k.noBand||state!=='race'||player.done||player.parked)return 1;
  if(k===player){                                  /* seconds the leading bot is up the road */
    let lead=0;for(const o of karts)if(o!==player&&!o.parked&&!o.noBand)lead=Math.max(lead,-gapTo(o));
    return 1+PLAYER_PACE.max*clamp((lead-PLAYER_PACE.dead)/PLAYER_PACE.ramp,0,1);
  }
  const g=gapTo(k),over=clamp((Math.abs(g)-(g>0?PACE.dead:PACE.deadAhead))/PACE.ramp,0,1);
  let p=g>0?1+PACE.behind*over*(k.bandMax-1)/0.16:1-PACE.ahead*over;    /* the class sets how hard they chase */
  if(typeof CUP!=='undefined'&&CUP&&!k.rival&&p>1)p=1+(p-1)*0.7;  /* only the rival chases hard */
  return p;
}
/** called every physics step for every kart, the player too */
function stepPace(k,dt){k.pace=k.noBand?1:lerp(k.pace||1,paceTarget(k),Math.min(1,dt*PACE.blend));}
function aiControl(k){
  planRoutes(k);
  /* a farm lane is too twisty to aim far ahead: look closer while in one */
  const inLane=k.rib||(k.plan&&((ALTS[k.plan-1].a-k.si)%N+N)%N<8);
  /* pulling in for fuel: aim close, or a forecourt on a bend gets cut past */
  const pitS=k.wantFuel&&!k.rib?stations.find(S=>{let d=S.at-k.si;if(d>N/2)d-=N;else if(d<-N/2)d+=N;return d>-S.len&&d*SEG<FUEL.commit+20;}):null;
  const pit=!!pitS;
  /* a stage with long samples can shorten the aim (stage.aiLook), or the AI chords its bends */
  const [T,t]=walkPt(k,inLane||pit?Math.round(5+k.speed*0.3):Math.round((12+k.lookAdd+k.speed*0.55)*(stage.aiLook||1)));
  /* each AI drives one of three lines this race: inside, middle or outside */
  const L=pit?pitS.side*(HW-1.5):T===MAIN&&k.fplan>0?planLat(t):T===MAIN?clamp(k.line+(k.rib?0:k.itemBias)-k.lineVar*clamp(scurv[t]/0.2,-1,1)*HW*0.38,-HW+2,HW-2)
                  :clamp(k.line*0.3,-(T.hw-1),T.hw-1);
  const err=wrapAng(Math.atan2(T.X[t]+T.RX[t]*L-k.x,T.Z[t]+T.RZ[t]*L-k.z)-k.yaw);
  let steer=clamp(err*(k.drift!==0?2.0:2.85),-1,1);  /* calmer hands mid-slide */
  if(k.blind>0)steer=clamp(steer+Math.sin(clock*6.5+k.idx*1.7)*0.6,-1,1);   /* Tifot: driving blind behind a scarf */
  let cmax=0;
  for(let o=6;o<46;o+=6){const w=walkPt(k,o);cmax=Math.max(cmax,w[0].CURV[w[1]]);}
  let cnear=0;                                         /* the corner they are in now */
  for(let o=0;o<20;o+=5){const w=walkPt(k,o);cnear=Math.max(cnear,w[0].CURV[w[1]]);}
  const dl=k.cfg.driftLove||1;
  let drift=!k.air&&k.speed>15&&
    (k.drift!==0 ? cnear>0.050/dl : cnear>0.115/dl);    /* hysteresis: enter late, hold long */
  /* Corner speed from the radius the curvature implies. The old linear falloff
     saturated at its floor on ordinary bends, pinning the whole field at 42%. */
  const R=14*SEG/Math.max(cmax,1e-4);
  const sg=T===MAIN?(MAINS[t]?SURF[MAINS[t]].grip(k.offRoad):1):SURF[T.S[t]].grip(k.offRoad);    /* loose lanes: brake earlier */
  const hold=AI_G*(k.gripOn*sg/9.5)*(2.7/k.caution)*(k.drift!==0?1.18:1);
  const limit=Math.min(k.maxSpeed,Math.sqrt(hold*R));
  const band=k.pace;
  let throttle=1,brake=0,pitStop=false;
  if(k.court&&k.wantFuel)pitStop=true;                       /* stop on the forecourt and fill */
  else if(k.wantFuel&&!k.rib)for(const S of stations){        /* slow in time to stop on it */
    let d=S.at-k.mi;if(d>N/2)d-=N;else if(d<-N/2)d+=N;
    if(d<0||d*SEG>FUEL.commit+20)continue;
    if(k.speed>Math.min(FUEL.pitLane,Math.sqrt((FUEL.slow-4)**2+2*12*d*SEG)))pitStop=true;   /* a pit-lane limit, then gently down */
  }
  if(k.speed>limit*band){throttle=0;brake=k.speed>limit*band*1.16?1:0;}
  if(Math.abs(k.lat)>(k.rib?ALTS[k.rib-1].hw:HW)&&!k.court)throttle=1;
  if(pitStop){                                               /* roll a few metres in, then stand on it */
    const into=pitS?((k.mi-pitS.at)%N+N)%N:9;
    throttle=into<4&&k.speed<3?0.4:0;brake=k.speed>(into<4?5:0.5)?1:0;
  }
  /* stuck against something: back out for a second, then call the tractor */
  /* judged on progress, not speed: a kart bouncing off a barrier still reads as moving */
  if(state==='race'&&!k.court&&!k.done&&k.recoverT<=0&&!(k.frozen>0)){   /* frozen in time is not stuck */
    if(k.progress>k.stuckP+6/SEG){k.stuckP=k.progress;k.stuckT=0;}else k.stuckT+=FIXED;   /* 6 m */
  }
  /* return to path: stuck, or crawling off the road, first drive back to a point about
     a second up the route. Arne's tractor only if that has not worked within 3 s. */
  const hwR=k.rib?ALTS[k.rib-1].hw:HW;
  k.offT=Math.abs(k.lat)>hwR+2.5&&k.speed<12&&!k.court?k.offT+FIXED:0;
  if(!k.rtp&&state==='race'&&!k.done&&k.recoverT<=0&&(k.stuckT>1.2||k.offT>1)){k.rtp=true;k.rtpT=0;}
  if(pitStop&&k.court)k.rtp=false;                         /* standing at the pumps is not being stuck */
  if(k.rtp){
    k.rtpT+=FIXED;
    const [T2,t2]=walkPt(k,Math.round(Math.max(10,k.speed)/SEG)+3);
    const e=wrapAng(Math.atan2(T2.X[t2]-k.x,T2.Z[t2]-k.z)-k.yaw);
    steer=clamp(e*3,-1,1);drift=false;
    if(Math.abs(e)>1.9){throttle=0;brake=1;}      /* facing away: back round */
    else{throttle=Math.abs(e)>0.7?0.55:1;brake=0;}
    if(Math.abs(k.lat)<hwR-0.5&&Math.abs(e)<0.5&&k.stuckT<0.4)k.rtp=false;
    else if(k.rtpT>3){k.rtp=false;k.stuckT=0;askRecover(k);}
  }
  if(k.stuckT>5){k.stuckT=0;k.rtp=false;askRecover(k);}
  return {throttle,brake,steer,drift};
}
function separate(){
  for(let a=0;a<karts.length;a++)for(let b=a+1;b<karts.length;b++){
    const A=karts[a],B=karts[b];
    if(A.ghost>0||B.ghost>0||A.parked||B.parked||A.bike>0||B.bike>0)continue;   /* a bike slips through */
    let dx=B.x-A.x,dz=B.z-A.z;
    const d=Math.hypot(dx,dz);
    if(d>2.9||d<1e-4)continue;
    dx/=d;dz/=d;
    const fa=A.frozen>0,fb=B.frozen>0;if(fa&&fb)continue;
    const ma=menuMass(A),mb=menuMass(B);                            /* Burgartornet: heavier with a tower on the roof */
    let wa=2*mb/(ma+mb),wb=2*ma/(ma+mb);   /* the tractor barely moves */
    if(fa){wa=0;wb=2;}else if(fb){wa=2;wb=0;}                        /* frozen in time: an ice block does not budge */
    const push=(2.9-d)*0.5;
    A.x-=dx*push*wa;A.z-=dz*push*wa;B.x+=dx*push*wb;B.z+=dz*push*wb;
    const rel=(B.vx-A.vx)*dx+(B.vz-A.vz)*dz;
    if(rel<-3.5&&state==='race')hotBump(A,B,dx,dz);
    if(rel<0){
      A.clean=B.clean=false;
      A.vx+=dx*rel*0.4*wa;A.vz+=dz*rel*0.4*wa;B.vx-=dx*rel*0.4*wb;B.vz-=dz*rel*0.4*wb;
      if(A===player||B===player)shake=Math.min(1,shake+0.22);
    }
  }
}
