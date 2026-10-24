"use strict";
/* ───────── STATOLJA — bensinstationer ───────── */
const stations=[];
function statoljaSign(){
  return pixTex(64,48,(g)=>{
    g.fillStyle='#14396e';g.fillRect(0,0,64,48);
    g.fillStyle='#e8ecef';g.fillRect(3,3,58,26);
    g.fillStyle='#c8321f';                                   /* fuel drop */
    g.beginPath();g.moveTo(14,9);g.lineTo(21,23);g.lineTo(7,23);g.closePath();g.fill();
    g.fillRect(7,20,14,4);
    g.fillStyle='#14396e';g.font='7px "Press Start 2P",monospace';
    g.textBaseline='middle';g.fillText('STAT',26,12);g.fillText('OLJA',26,22);
    g.fillStyle='#e8c33a';g.font='8px "Press Start 2P",monospace';
    g.fillText('18:94',12,39);
  });
}
function addStation(at,side){
  const a=at, len=12, b=at+len;
  const conc=psMat({color:0xb9b6ae,side:THREE.DoubleSide});
  const roof=psMat({color:0xeceff2,side:THREE.DoubleSide});
  const band=psMat({color:0xc8321f,side:THREE.DoubleSide});
  const steel=psMat({color:0x9aa2a8});
  sweep(a,b,side*(HW+.4),-.04,side*(HW+12),-.26,conc);        /* forecourt */
  sweep(a,b,side*(HW+1.6),5.7,side*(HW+11),5.7,roof);         /* canopy */
  sweep(a,b,side*(HW+1.6),5.7,side*(HW+1.6),4.9,band);
  sweep(a,b,side*(HW+11),5.7,side*(HW+11),4.9,band);
  const put=(q,o,h,geo,mat)=>{
    const i=((q%N)+N)%N, x=sx[i]+rx[i]*o, z=sz[i]+rz[i]*o;
    const m=new THREE.Mesh(flat(geo),mat);
    m.position.set(x,sy[i]+o*bank[i]+h,z);
    m.rotation.y=Math.atan2(fx[i],fz[i]);
    world.add(m);return m;
  };
  for(const q of [a+1,b-1])for(const o of [side*(HW+2.2),side*(HW+10.4)])
    put(q,o,2.85,new THREE.BoxGeometry(.5,5.7,.5),steel);
  for(const q of [a+4,a+8]){                                   /* pumps */
    put(q,side*(HW+6.3),1.1,new THREE.BoxGeometry(1.2,2.2,2.8),roof);
    put(q,side*(HW+6.3),2.5,new THREE.BoxGeometry(1.0,.8,1.8),psMat({color:0x14396e}));
  }
  put(a+6,side*(HW+17),2.0,new THREE.BoxGeometry(10,4,6.5),roof);   /* shop */
  put(a+6,side*(HW+17),4.3,new THREE.BoxGeometry(10.4,.5,6.9),band);
  put(b+2,side*(HW+14),3.4,new THREE.BoxGeometry(.6,6.8,.6),steel); /* totem */
  const i=((b+2)%N+N)%N, o=side*(HW+14);
  const pl=new THREE.Mesh(new THREE.PlaneGeometry(5,3.8),
    psMat({map:statoljaSign(),unlit:true,side:THREE.DoubleSide}));
  pl.position.set(sx[i]+rx[i]*o, sy[i]+8.2, sz[i]+rz[i]*o);
  pl.rotation.y=Math.atan2(fx[i],fz[i])+Math.PI/2;
  world.add(pl);
  /* readable from a phone: a hatched pump lane on the road edge where karts stop, chevrons
     leading into it, and a board far enough back to brake for */
  sweep(a,b,side*(HW-4.6),.05,side*(HW-.3),.05,psMat({map:pumpLaneTex(),side:THREE.DoubleSide}));
  for(let q=a-26;q<a;q+=6)sweep(q,q+2,side*(HW-.4-(a-q)*.16),.05,side*(HW-.3),.05,psMat({color:0xf0c419,side:THREE.DoubleSide}));
  const sa=a-30, si=((sa%N)+N)%N, so=side*(HW+4.6);
  put(sa,so,1.7,new THREE.BoxGeometry(.35,3.4,.35),steel);
  const bd=new THREE.Mesh(new THREE.PlaneGeometry(4.2,2.4),
    psMat({map:statoljaAhead(Math.max(10,Math.round(30*SEG/10)*10)),unlit:true,side:THREE.DoubleSide}));
  bd.position.set(sx[si]+rx[si]*so, sy[si]+4.3, sz[si]+rz[si]*so);
  bd.rotation.y=Math.atan2(fx[si],fz[si])+Math.PI;
  world.add(bd);
  stations.push({at:((a%N)+N)%N,len,side});
}
/** yellow hatching for the stretch of road edge where the pumps reach */
function pumpLaneTex(){
  const t=pixTex(32,32,(g)=>{
    g.fillStyle='#4a4d52';g.fillRect(0,0,32,32);
    g.fillStyle='#f0c419';
    for(let i=-32;i<32;i+=10){g.beginPath();g.moveTo(i,32);g.lineTo(i+5,32);g.lineTo(i+37,0);g.lineTo(i+32,0);g.closePath();g.fill();}
    g.fillRect(0,0,3,32);g.fillRect(29,0,3,32);
  });
  t.wrapS=t.wrapT=THREE.RepeatWrapping;
  return t;
}
/** the board before a station: the name, a pump and how far */
function statoljaAhead(m){
  return pixTex(84,48,(g)=>{
    g.fillStyle='#14396e';g.fillRect(0,0,84,48);
    g.fillStyle='#e8ecef';g.fillRect(3,3,78,42);
    g.fillStyle='#c8321f';g.fillRect(8,10,12,20);g.fillRect(20,14,6,3);g.fillRect(24,14,3,14);
    g.fillStyle='#e8ecef';g.fillRect(10,12,8,6);
    g.fillStyle='#14396e';g.font='8px "Press Start 2P",monospace';g.textBaseline='middle';
    g.fillText('STATOLJA',30,16);
    g.fillStyle='#c8321f';g.fillText(m+' M',36,32);
  });
}
function buildStations(st){
  stations.length=0;
  for(const sp of (st.stations||[[0.27,1],[0.71,-1]])){
    let at=Math.round(N*sp[0]);
    for(const J of JUMPS)                                      /* never on a ramp */
      if(Math.min(Math.abs(at-J.at),N-Math.abs(at-J.at))<J.up+J.dn+16)at=(at+46)%N;
    addStation(at,sp[1]);
  }
}
/** are we on a forecourt? returns the station or null */
function atPumpNow(si,lat){
  for(const S of stations){
    let d=si-S.at;
    if(d<-N/2)d+=N;else if(d>N/2)d-=N;
    if(d<-1||d>S.len)continue;
    const l=lat*S.side;
    if(l>HW-5&&l<HW+12)return S;
  }
  return null;
}

/* Petrol. The drain is the same rule for every kart, player or bot: idle plus throttle plus
   boost, times the driver's and the vehicle's burn, the surface, and this stage's fixed
   multiplier. FUEL_MUL is measured, not guessed: tools/fuel_audit.py --calibrate drives the
   neutral reference (Nisse's line in a GOKART) round each stage and fits it so a race costs
   about 112, 37 a lap over three laps (a two-lap stage costs the same in total). It never
   changes with place, fuel left or the vehicle. */
/* fill a second; below this speed (m/s) a forecourt fills; warning levels; the bots' reserve;
   metres out a bot's stop-or-not is locked; metres out the HUD names the next station; a bot's
   speed limit once it is pulling in */
const FUEL={fill:25,slow:12,low:25,crit:10,reserve:8,commit:70,cue:230,pitLane:22};
const FUEL_MUL={lund:0.69,veberod:0.58,bron:0.65,ahus:0.70,tollarp:0.63,glimminge:0.58,ales:0.52,kivik:0.65,
  soderasen:0.71,foteviken:0.49,karlskrona:0.50,ven:0.50,limhamn:0.61,angelholm:0.56,hoor:0.56,romele:0.66,
  kalmar:0.61,rune:0.54,rosengard:0.54,horby:0.56,lerum:0.45,boras:0.54,trollhattan:0.46,avenyn:0.35,
  hisingen:0.47,ullevi:0.39,sibylla:0.57,promenad:0.40,idalaskolan:0.31,lomma:0.25};
const stageFuel=()=>FUEL_MUL[stage.id]||0.5;
/** a surface's fuel factor for this kart. Rough ground that already slows you costs no extra
    a second on top: you pay in time, or, in a kart built for it, in fuel, never both */
function surfFuel(k,surf){
  if(!surf||surf.fuel<=1)return surf?surf.fuel:1;
  return Math.max(1,surf.fuel*surf.top(k.offRoad));
}
/** fuel a second for this kart right now */
function fuelRate(k,throttle,boosting,surf){
  return (0.5+throttle*2.0+(boosting?1.6:0))*k.burn*surfFuel(k,surf)*stageFuel();
}
/** one physics step of the tank: on a forecourt and slow enough it fills, otherwise it burns */
function pumpStep(k,dt,ctl,S,surf){
  k.court=!!S;
  k.atPump=!!S&&k.speed<FUEL.slow;
  if(k.atPump){
    const f=Math.min(TANK-k.fuel,FUEL.fill*dt);
    if(f>0&&!k.filling&&raceTime-(k.fillEnd??-9)>3)k.stops=(k.stops||0)+1;   /* a nudge on the same forecourt is the same stop */
    k.filling=f>0;if(k.filling)k.fillEnd=raceTime;k.fuel+=f;k.fuelIn=(k.fuelIn||0)+f;
    return;
  }
  k.filling=false;
  if(k.air||k.bike>0)return;                                 /* pedalling is free */
  const u=fuelRate(k,ctl.throttle,k.boost>0,surf)*dt;
  k.fuelUsed=(k.fuelUsed||0)+u;k.fuel=Math.max(0,k.fuel-u);
}
/** the player's warnings: each one once on the way down, again only after a real refill */
function fuelWarn(k){
  const lvl=k.fuel<=0?3:k.fuel<=FUEL.crit?2:k.fuel<=FUEL.low?1:0;
  const back=k.fuel>FUEL.low+15?0:k.fuel>FUEL.crit+8?1:k.fuel>3?2:3;
  if(back<k.warned)k.warned=back;
  if(lvl<=k.warned)return;
  k.warned=lvl;
  if(lvl===3){toast('SOPPA-TORSK!');ping(260,70,.28);}
  else if(lvl===2){toast('TANKA SNART!');ping(520,300,.16);}
  else{toast('LÅG BENSIN');ping(500,380,.1);}
}

/* AI fuel planning. A bot predicts what the road ahead costs it from its own burn: on ground it
   has driven this stage it uses what that stretch really cost it (climbs, mud, braking and
   all), elsewhere the corner-speed model. Before each station it asks whether it can reach the
   next usable one (or the flag) with a reserve; the answer is locked in once it is close enough
   to brake. If it stops, it fills to what the finish needs, or to the brim: one proper stop,
   not a string of small ones. Catch-up never touches any of this. */
function fuelModel(k,i){
  const s=mainSurfAll(i);
  return sampleSecs(k,MAIN,i)*fuelRate(k,0.95,false,s)*1.1;
}
/** predicted fuel for the next n main-road samples from where k is */
function fuelNeed(k,n){
  if(k.fpStage!==stage.id){k.fp=new Float32Array(N).fill(-1);k.fpStage=stage.id;}
  let f=0;const m=Math.floor(k.mi);
  const sc=k.fpMod>3?clamp(k.fpAct/k.fpMod,0.7,1.6):1.15;   /* the model, corrected by how this race has gone */
  for(let q=0;q<n;q++){const i=((m+q)%N+N)%N;f+=k.fp[i]>=0?k.fp[i]:fuelModel(k,i)*sc;}
  return f;
}
/** remember what each stretch cost, so the next prediction is this kart's own */
function fuelLearn(k){
  if(k.fpStage!==stage.id){k.fp=new Float32Array(N).fill(-1);k.fpStage=stage.id;}
  const m=((Math.floor(k.mi)%N)+N)%N,u=k.fuelUsed||0;
  if(k.fpAt==null||k.fpRace!==raceSeed||u<k.fpU){k.fpAt=m;k.fpU=u;k.fpRace=raceSeed;k.fpAct=0;k.fpMod=0;return;}
  let d=m-k.fpAt;if(d<-N/2)d+=N;else if(d>N/2)d-=N;
  if(d===0)return;
  if(d>0&&d<40&&!k.court){
    const per=(u-k.fpU)/d;
    for(let q=0;q<d;q++){const i=(k.fpAt+q)%N;k.fp[i]=k.fp[i]>=0?k.fp[i]*.5+per*.5:per;k.fpMod+=fuelModel(k,i);}
    k.fpAct+=u-k.fpU;
  }
  k.fpAt=m;k.fpU=u;
}
/** samples to the flag on the main road's scale */
const toFinish=k=>Math.max(0,LAPS*N-k.progress);
/** does lane R take a kart past station S? Inside its span, or so close to its mouth or merge
    that a kart on the lane's line can not also make the forecourt */
function laneSkips(R,S){
  const span=((R.b-R.a)%N+N)%N,o=((S.at-R.a)%N+N)%N;
  return o<span+20||o>N-S.len-30;
}
/** the stations still ahead, nearest first, with the distance to each forecourt's start; one
    inside a shortcut the kart has taken or planned is skipped this time round */
function pumpsAhead(k){
  const R=k.rib?ALTS[k.rib-1]:(k.plan?ALTS[k.plan-1]:null),out=[];
  for(const S of stations){
    const d=((S.at+S.len-k.mi)%N+N)%N-S.len;
    const skip=!!R&&laneSkips(R,S);
    out.push({S,d:skip?d+N:d},{S,d:skip?d+2*N:d+N});
  }
  return out.sort((a,b)=>a.d-b.d);
}
/** the margin a bot keeps: a thirstier kart loses more to the same delay */
const reserveOf=k=>FUEL.reserve*Math.max(1,k.burn);
/** how much to take on at a pump: enough for the flag with the reserve, or a full tank */
const fillTarget=k=>Math.min(TANK-1,fuelNeed(k,toFinish(k))+reserveOf(k)+2);
function planFuel(k){
  if(k.done)return;
  fuelLearn(k);
  if(k.court&&k.wantFuel){if(k.fuel>=fillTarget(k))k.wantFuel=false;return;}
  if(raceTime<(k.fuelChk||0))return;                        /* four looks a second */
  k.fuelChk=raceTime+0.25;
  if(k.wantFuel&&k.plan&&!k.rib&&!laneFuelOk(k,ALTS[k.plan-1]))k.plan=0;   /* not down a lane past the pumps it needs */
  const P=pumpsAhead(k),fin=toFinish(k),X=P[0];
  if(k.fuelLock&&X&&X.S!==k.fuelLock&&!(X.d<0)){              /* left a pump behind: did it stop when it meant to? */
    if(k.lockWant&&!((k.fillEnd??-9)>=k.lockAt))k.pumpMiss=(k.pumpMiss||0)+1;
    k.fuelLock=null;
  }
  if(!X||X.d>=fin){k.wantFuel=false;k.fuelLock=null;return;}
  if(X.d*SEG<FUEL.commit){                                   /* close enough to brake: stick to it */
    if(k.fuelLock===X.S)return;
    if(k.fuelLock&&X.d<0)return;                             /* passing it: keep the call made */
    k.fuelLock=X.S;k.lockAt=raceTime;
  }else k.fuelLock=null;
  const reach=Math.min(P[1]?P[1].d:fin,fin);
  k.wantFuel=k.fuel<fuelNeed(k,Math.max(0,reach))+reserveOf(k);
  if(k.fuelLock)k.lockWant=k.wantFuel;
}
/** could k take this shortcut and still reach the next station it can use, or the flag? */
function laneFuelOk(k,R){
  const span=((R.b-R.a)%N+N)%N;
  if(!stations.some(S=>laneSkips(R,S)))return true;
  if(k.wantFuel)return false;
  const toA=((R.a-k.mi)%N+N)%N,fin=toFinish(k);
  let reach=fin;
  for(const S of stations){const d=toA+span+((S.at-R.b)%N+N)%N;if(d<reach)reach=d;}
  return k.fuel>=fuelNeed(k,reach)+reserveOf(k);
}
const AI_HOLD=8;                  /* seconds an AI keeps an item it has no use for before spending it anyway */
function aiItemLines(){
  for(const k of karts){
    if(!k.ai||k.parked)continue;
    let bias=0;
    for(const it of items){
      if(it.cool>0)continue;
      let d=it.si-k.mi;
      if(d>N/2)d-=N; else if(d<-N/2)d+=N;
      if(d<2||d>26)continue;
      const w=1-(d-2)/24;
      if(it.type==='box')bias+=(it.lat-k.line)*.45*w;
      else if(it.type==='fuel'){
        if(k.wantFuel||k.fuel<50)bias+=(it.lat-k.line)*1.1*w;   /* a can is a bonus, never the plan */
      }else{
        const gap=k.line-it.lat;
        if(Math.abs(gap)<3.6)bias+=(gap>=0?1:-1)*(3.6-Math.abs(gap))*1.15*w;
      }
    }
    for(const c of gasClouds){                                   /* steer round green gas up the road */
      if(c.owner===k||c.hit.has(k))continue;
      let push=0;
      for(const b of c.blobs){
        let d=b.si-k.mi;
        if(d>N/2)d-=N;else if(d<-N/2)d+=N;
        if(d<1||d>30)continue;
        const gap=k.line-b.lat,R=b.r*.85+1.6;
        if(Math.abs(gap)<R){const f=(gap>=0?1:-1)*(R-Math.abs(gap))*(1-(d-1)/29);if(Math.abs(f)>Math.abs(push))push=f;}
      }
      bias+=push*.9;
    }
    if(sigWalls.length)bias+=sigWallAvoid(k)*1.2;              /* round a container or a shut lock gate */
    if(k.held){                                            /* play what they picked up */
      let ahead=false,near=false,behind=false,tail=false,close=false;
      for(const o of karts){
        if(o===k||o.parked)continue;
        let d=o.mi-k.mi;
        if(d>N/2)d-=N;else if(d<-N/2)d+=N;
        if(d>4&&d<48)ahead=true;
        if(d>4&&d<30&&!o.rib)near=true;                    /* in reach of the hook */
        if(d<-2&&d>-30)behind=true;
        const g=Math.hypot(o.x-k.x,o.z-k.z);
        if(d<0&&g<20)tail=true;                           /* close enough to drive into the gas */
        if(g<12)close=true;
      }
      const lvl=itemLvl(k),h=k.held;
      /* held too long with nothing to aim at: spend it anyway, so a leader keeps picking up boxes.
         A forward shot with a closed passage up the road goes for the passage. */
      const stale=raceTime-(k.heldAt||0)>AI_HOLD+k.roll, mouth=!k.rib&&(h==='rocket'?!!mouthAhead(k.mi,40,k)[0]:sigOpensHere(k));   /* a signature item that opens it too: 40-genvagar.js */
      if(stale||mouth)useItem(k);
      else if(h==='boost')useItem(k);
      else if(h==='rocket'&&(lvl===2?near:ahead))useItem(k);
      else if(h==='pie'&&behind)useItem(k);
      else if(h==='shield'&&(lvl===3?close||behind:behind||Math.random()<0.004))useItem(k);
      else if(h==='fart'&&(lvl===1?tail:behind||close))useItem(k);
      else if(h==='sig'&&SIGS[k.heldSig].ai({ahead,near,behind,close},k))useItem(k);
    }
    planFuel(k);
    if(k.wantFuel)for(const S of stations){                   /* head for the pumps */
      let d=S.at-k.mi;
      if(d>N/2)d-=N;else if(d<-N/2)d+=N;
      if(d<-S.len||d>60)continue;
      const urgent=k.fuel<30?2.2:1.0;
      bias+=(S.side*(HW+3)-k.line)*1.15*urgent*(1-Math.max(0,d)/60);
    }
    k.itemBias=lerp(k.itemBias,clamp(bias,-7,7),.12);
  }
}
