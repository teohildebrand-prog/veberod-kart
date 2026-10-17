"use strict";
/* ───────── physics ───────── */
function drive(k,dt,ctl){
  if(k.recoverT>0){k.recoverT-=dt;if(k.recoverT<=0)recoverKart(k);}
  if(k.ghost>0)k.ghost-=dt;
  const RT=k.rib?ALTS[k.rib-1]:null, T=RT||MAIN, hwR=RT?RT.hw:HW;
  k.si=RT?nearestAlt(RT,k.x,k.z,k.si):nearestLocal(k.x,k.z,k.si);
  const i=k.si, i1=RT?Math.min(i+1,RT.n-1):(i+1)%N;
  const dx=k.x-T.X[i],dz=k.z-T.Z[i];
  let lat=dx*T.RX[i]+dz*T.RZ[i];
  const surf=RT&&Math.abs(lat)<RT.hw+0.8?SURF[RT.S[i]]:null;
  k.surf=surf?RT.S[i]:'';
  k.atPump=!RT&&!!atPumpNow(i,lat);
  if(k.atPump)k.fuel=Math.min(TANK,k.fuel+26*dt);
  else if(!k.air)k.fuel=Math.max(0,k.fuel-(0.5+ctl.throttle*2.0+(k.boost>0?1.6:0))*k.burn*(surf?surf.fuel:1)*dt);
  const dry=k.fuel<=0;
  const thr=k.spun>0?0:(dry?ctl.throttle*0.17:ctl.throttle);   /* dry = limp, not dead */
  if(!k.ai){
    if(dry&&k.warned<2){k.warned=2;toast('SOPPA-TORSK!');ping(260,70,.28);}
    else if(!dry&&k.fuel<26&&k.warned<1){k.warned=1;toast('BENSIN LÅGT');ping(500,320,.14);}
    else if(k.fuel>40)k.warned=0;
  }
  const onRoad=Math.abs(lat)<hwR+(RT?0.8:1.3)||k.atPump;
  if(k.boost>0)k.boost=Math.max(0,k.boost-dt);
  if(k.slow>0)k.slow=Math.max(0,k.slow-dt);
  if(k.shield>0)k.shield=Math.max(0,k.shield-dt);
  if(k.spun>0){k.spun=Math.max(0,k.spun-dt);k.yaw+=11*dt;}   /* spettekaka-träff */

  const sp=Math.hypot(k.vx,k.vz);
  let turn=2.35*Math.min(1,sp/7)*(1-0.26*clamp(sp/k.maxSpeed,0,1));
  if(k.drift!==0)turn*=1.42;
  if(k.air)turn*=0.5;                              /* half authority airborne */
  k.yaw+=(k.spun>0?0:ctl.steer)*turn*dt;
  if(k.slow>0)k.yaw+=Math.sin(k.slow*31.0)*1.5*dt;   /* pie wobble */

  const Fx=Math.sin(k.yaw),Fz=Math.cos(k.yaw),Rx=-Fz,Rz=Fx;
  /* longitudinal road gradient only: a banked corner is not a hill, and sliding
     across one must not read as climbing. Also saves two height lookups a step. */
  const gslope=k.air?0:((T.Y[i1]-T.Y[i])/SEG)*(Fx*T.FX[i]+Fz*T.FZ[i]);
  let fwd=k.vx*Fx+k.vz*Fz, side=k.vx*Rx+k.vz*Rz;

  {                                          /* AI drifts too, same rules */
    const want=ctl.drift&&!k.air&&sp>13&&Math.abs(ctl.steer)>0.15;
    if(want&&k.drift===0)k.drift=Math.sign(ctl.steer)||1;
    if(k.drift!==0&&(!ctl.drift||sp<8)){
      if(k.charge>0.55){
        const big=k.charge>1.45;
        k.boost=big?1.5:0.95;
        for(let p=0;p<10;p++)puff(k.x+rand(-1,1),k.y+.5,k.z+rand(-1,1),
          big?1:.42, big?.70:.76, big?.18:.95, .5);
        if(k===player){toast(big?'TURBO!':'FART!');ping(big?520:620,big?1200:900,.17);}
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

  side*=Math.exp(-(k.air?0.35:(k.drift!==0?2.1:(k.slow>0?3.2:(onRoad?k.gripOn*(surf?surf.grip(k.offRoad):1):4.2))))*dt);
  const top=k.maxSpeed*(onRoad?(surf?surf.top(k.offRoad):1):k.offRoad)*(k.boost>0?k.boostMul:1)*(k.slow>0?0.5:1)*(k.spun>0?0.35:1)*(dry?0.30:1);
  if(!k.air){
    const torque=1+0.35*clamp(1-sp/k.maxSpeed,0,1);  /* short gears down low */
    fwd+=thr*(k.boost>0?k.power+21:k.power)*torque*(onRoad?1:0.6)*(k.slow>0?0.55:1)*dt;
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
    k.vx=T.FX[j]*vf*keep-T.RX[j]*vl*0.25;k.vz=T.FZ[j]*vf*keep-T.RZ[j]*vl*0.25;
    if(!k.ai&&Math.abs(vl)>9)shake=Math.min(1,shake+0.5);
    /* pinned nose-first at walking pace: the fence turns you along itself */
    if(Math.hypot(k.vx,k.vz)<6){const d=wrapAng(Math.atan2(T.FX[j],T.FZ[j])-k.yaw);
      if(Math.abs(d)<2.2)k.yaw+=d*Math.min(1,dt*2.5);}
  }
  if(routeSwitch(k,lat)){
    const T2=k.rib?ALTS[k.rib-1]:MAIN,s2=k.si;
    lat=(k.x-T2.X[s2])*T2.RX[s2]+(k.z-T2.Z[s2])*T2.RZ[s2];
  }

  const gy=groundK(k,k.x,k.z);
  k.vy-=34*dt;
  k.y+=k.vy*dt;
  if(k.y<=gy){
    if(k.air&&k.vy<-8){                              /* touchdown */
      const big=k.airT>0.42;
      for(let p=0;p<(big?14:6);p++)
        puff(k.x+rand(-1.2,1.2),gy+rand(.1,.7),k.z+rand(-1.2,1.2),.78,.72,.56,.6);
      if(big){
        k.boost=Math.max(k.boost,.85);
        if(k===player){toast('SNYGGT HOPP!');ping(420,900,.12);}
      }
      if(k===player)shake=Math.min(1,shake+clamp(-k.vy*0.035,0,.7));
    }
    k.y=gy;k.vy=0;k.air=false;k.airT=0;
  }else{k.air=true;k.airT+=dt;}
  k.spin+=fwd*dt/0.44;
  k.lean=lerp(k.lean,clamp(-side*0.045,-0.34,0.34),Math.min(1,dt*9));
  k.speed=Math.hypot(k.vx,k.vz);k.onRoad=onRoad;k.lat=lat;

  /* a lap counts only once every gate has been passed in order. Gates sit on the
     sector boundaries of the main loop; on a shortcut the kart's progress is mapped
     onto the same interval, so a lane's own stretch of gates must be driven too */
  k.mi=mappedIdx(k);
  const cur=((Math.floor(k.mi)%N)+N)%N, sec=Math.floor(cur*CPN/N)%CPN;
  if(k===player&&state==='race'&&sec!==k.cp&&sec!==(k.cp+1)%CPN&&
     (sec-k.cp+CPN)%CPN<CPN/2&&clock-missT>3){missT=clock;toast('MISSAD KONTROLLPUNKT');ping(240,180,.2);}
  if(sec===(k.cp+1)%CPN){
    k.cp=sec;
    if(sec===0){
    k.lap++;
    const t=raceTime,lt=t-k.lapStart;k.lapStart=t;
    if(k.lap>=2&&(k.best==null||lt<k.best))k.best=lt;
    if(k.lap>=LAPS&&!k.done){k.done=true;k.total=t;if(k===player)finish();}
    else if(k===player)toast('VARV '+Math.min(k.lap+1,LAPS)+'/'+LAPS);
    }
  }
  k.prev=cur;
  k.progress=k.lap*N+k.mi;

  if(k.drift!==0&&k.speed>12){
    for(const s of [-1.05,1.05])
      puff(k.x+Fx*-1.5+Rx*s,k.y+.22,k.z+Fz*-1.5+Rz*s,
        k.charge>1.45?1:(k.charge>0.55?.45:.8),
        k.charge>1.45?.66:(k.charge>0.55?.72:.8),
        k.charge>1.45?.18:(k.charge>0.55?.92:.82),.55);
  }else if(!k.onRoad&&k.speed>8&&Math.random()<0.5){
    puff(k.x+rand(-1,1),k.y+.2,k.z+rand(-1,1),.72,.64,.44,.75);
  }
  if(k.slow>0&&Math.random()<0.6)
    puff(k.x+rand(-1,1),k.y+rand(.3,1.1),k.z+rand(-1,1),.9,.52,.56,.5);
  if(k.boost>0&&Math.random()<0.7)
    puff(k.x-Fx*2.2+rand(-.4,.4),k.y+.7,k.z-Fz*2.2+rand(-.4,.4),1,.55,.15,.35);
}

let missT=-9, raceSeed=0;
/** hop between the main road and a lane at a fork or merge: whichever centreline
    is nearer wins. Returns true when the kart changed route. */
function routeSwitch(k,lat){
  if(!ALTS.length)return false;
  if(!k.rib){
    for(const R of ALTS){
      const d=((k.si-R.a)%N+N)%N;
      if(d>COMMIT+16)continue;
      if(k.ai&&k.plan!==R.idx)continue;            /* the AI only goes where it planned */
      const j=nearestAlt(R,k.x,k.z,Math.min(d,R.n-1));
      if(j>COMMIT+6)continue;
      const la=Math.abs(altLat(R,j,k.x,k.z));
      if(la<R.hw-0.3||la+0.4<Math.abs(lat)){k.rib=R.idx;k.si=j;return true;}
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
  let t=0;const G=AI_G*(2.7/k.caution);
  for(let q=0;q<n;q++){
    const i=T===MAIN?(i0+q)%N:i0+q, s=T===MAIN?null:SURF[T.S[i]];
    const top=k.maxSpeed*(s?s.top(k.offRoad):1);
    const v=Math.min(top,Math.sqrt(G*(k.gripOn*(s?s.grip(k.offRoad):1)/9.5)*14*SEG/Math.max(T.CURV[i],1e-4)));
    t+=SEG/Math.max(v,4);
  }
  return t;
}
/** at a fork: score every legal route and take the cheapest. Personality moves
    the weights, never the physics. */
function chooseRoute(k,R){
  if(k.lap===0)return false;                           /* lap 1 stays readable */
  const span=((R.b-R.a)%N+N)%N;
  if(k.fuel<64&&stations.some(S=>{const d=((S.at-R.a)%N+N)%N;return d>0&&d<span;}))return false;
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
  for(const R of ALTS){
    const d=((R.a-k.si)%N+N)%N;
    if(d<12||d>90||k.planned[R.idx]===k.lap)continue;
    k.planned[R.idx]=k.lap;
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
  k.vx=k.vz=k.vy=0;k.speed=0;k.drift=0;k.charge=0;k.dstage=0;k.boost=0;k.spun=0;k.slow=0;
  k.y=groundK(k,k.x,k.z);k.air=false;k.airT=0;k.ghost=1.5;k.stuckT=0;k.stuckP=-1e9;k.recoverT=0;
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

function aiControl(k){
  planRoutes(k);
  /* a farm lane is too twisty to aim far ahead: look closer while in one */
  const inLane=k.rib||(k.plan&&((ALTS[k.plan-1].a-k.si)%N+N)%N<8);
  const [T,t]=walkPt(k,inLane?Math.round(5+k.speed*0.3):Math.round(12+k.lookAdd+k.speed*0.55));
  const L=T===MAIN?clamp(k.line+(k.rib?0:k.itemBias),-HW+2,HW-2)
                  :clamp(k.line*0.3,-(T.hw-1),T.hw-1);
  const err=wrapAng(Math.atan2(T.X[t]+T.RX[t]*L-k.x,T.Z[t]+T.RZ[t]*L-k.z)-k.yaw);
  let steer=clamp(err*(k.drift!==0?2.0:2.85),-1,1);  /* calmer hands mid-slide */
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
  const sg=T===MAIN?1:SURF[T.S[t]].grip(k.offRoad);    /* loose lanes: brake earlier */
  const hold=AI_G*(k.gripOn*sg/9.5)*(2.7/k.caution)*(k.drift!==0?1.18:1);
  const limit=Math.min(k.maxSpeed,Math.sqrt(hold*R));
  let band=clamp(1+((player.progress-k.progress)/N)*0.095,0.95,k.bandMax);
  if(typeof CUP!=='undefined'&&CUP&&!k.rival)band=1+(band-1)*0.7;  /* only the rival chases hard */
  let throttle=1,brake=0;
  if(k.atPump&&k.fuel<82){throttle=0;brake=k.speed>14?1:0;}   /* fill up */
  if(k.speed>limit*band){throttle=0;brake=k.speed>limit*band*1.16?1:0;}
  if(Math.abs(k.lat)>(k.rib?ALTS[k.rib-1].hw:HW))throttle=1;
  /* stuck against something: back out for a second, then call the tractor */
  /* judged on progress, not speed: a kart bouncing off a barrier still reads as moving */
  if(state==='race'&&!k.atPump&&!k.done&&k.recoverT<=0){
    if(k.progress>k.stuckP+6/SEG){k.stuckP=k.progress;k.stuckT=0;}else k.stuckT+=FIXED;   /* 6 m */
  }
  if(k.stuckT>2.5){throttle=0;brake=1;steer=-steer;drift=false;
    if(k.stuckT>3.5){k.stuckT=0;askRecover(k);}}
  return {throttle,brake,steer,drift};
}
function separate(){
  for(let a=0;a<karts.length;a++)for(let b=a+1;b<karts.length;b++){
    const A=karts[a],B=karts[b];
    if(A.ghost>0||B.ghost>0)continue;
    let dx=B.x-A.x,dz=B.z-A.z;
    const d=Math.hypot(dx,dz);
    if(d>2.9||d<1e-4)continue;
    dx/=d;dz/=d;
    const push=(2.9-d)*0.5;
    A.x-=dx*push;A.z-=dz*push;B.x+=dx*push;B.z+=dz*push;
    const rel=(B.vx-A.vx)*dx+(B.vz-A.vz)*dz;
    if(rel<0){
      A.vx+=dx*rel*0.4;A.vz+=dz*rel*0.4;B.vx-=dx*rel*0.4;B.vz-=dz*rel*0.4;
      if(A===player||B===player)shake=Math.min(1,shake+0.22);
    }
  }
}
