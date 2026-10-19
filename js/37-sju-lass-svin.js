"use strict";
/* ───────── sju lass svin ───────── */
/* Grisabonden Carl's own item. He whistles, shouts UT MED ER, PÅGAR! and seven pigs tumble
   out ahead of him and scamper up his line. Each pig eats one food trap inside a narrow
   corridor: an Äppelpaj in a quick nibble, a whole Kafferep (the pie and its coffee together),
   or a Tårtmina, whose candle it snuffs first. Seven pigs, seven traps at most. The herd
   ignores karts, milk, fuel and stamps, keeps to the main road and scatters before a fork Carl
   hasn't chosen yet, and anyone behind can follow through the gap it leaves. Tune it here. */
const SVIN={
  pigs:7,
  time:6,           /* seconds the herd runs before it scatters */
  start:9,          /* metres ahead of Carl the pigs land */
  lead:48,          /* the furthest they get ahead of him, metres */
  run:8,            /* how much faster than Carl they scamper, m/s */
  min:22,           /* and never slower than this */
  corr:2.2,         /* half-width of the corridor they clear, metres */
  reach:1.2,        /* plus a trap's own size */
  pace:30,          /* a pig's dash to a trap, m/s */
  eat:.45,          /* seconds to nibble, mop up or snuff */
  leave:.9,         /* seconds to trot off the road afterwards */
  back:10           /* seconds before the road's own pies come back */
};
const SVIN_FOOD={pie:1,coffee:1,mine:1};
const svinHerds=[];
let lastHerdOink=-9;

SIGS.carl={name:'SJU LASS SVIN',lane:false,
  text:'Vissla ut sju grisar som springer före längs din linje. Varje gris äter upp en fälla: äppelpaj, kafferep eller tårtmina.',
  use:fireSvin,ai:(s,k)=>(!!k&&svinWork(k)>0)||Math.random()<0.002,
  icon:`<svg viewBox="0 0 48 48">
    <path d="M10 15 6 4 18 9ZM38 15 42 4 30 9Z" fill="#e9a3a0" stroke="#a85a58" stroke-width="2" stroke-linejoin="round"/>
    <circle cx="24" cy="25" r="16" fill="#f3b8b0" stroke="#a85a58" stroke-width="2"/>
    <ellipse cx="24" cy="30" rx="8" ry="6" fill="#e9a3a0" stroke="#a85a58" stroke-width="2"/>
    <ellipse cx="21" cy="30" rx="1.6" ry="2.4" fill="#5a2a2a"/><ellipse cx="27" cy="30" rx="1.6" ry="2.4" fill="#5a2a2a"/>
    <circle cx="17" cy="20" r="2.2" fill="#23272e"/><circle cx="31" cy="20" r="2.2" fill="#23272e"/>
    <circle cx="39" cy="39" r="8" fill="#5f7a4c" stroke="#fff" stroke-width="2"/>
    <path d="M35.5 35h7l-4 9" fill="none" stroke="#fff" stroke-width="2.6" stroke-linejoin="round" stroke-linecap="round"/></svg>`};

const fwdS=(a,b)=>((a-b)%N+N)%N;                     /* samples from b forward to a */
/** a point on the main road at fractional sample s, lat metres across */
function svinPt(s,lat,o){
  const i=Math.floor(s)%N,j=(i+1)%N,f=s-Math.floor(s);
  o.x=lerp(sx[i],sx[j],f)+lerp(rx[i],rx[j],f)*lat;o.z=lerp(sz[i],sz[j],f)+lerp(rz[i],rz[j],f)*lat;
  o.si=i;o.yaw=Math.atan2(lerp(fx[i],fx[j],f),lerp(fz[i],fz[j],f));return o;
}
/** samples ahead of the kart where the herd must stop: just short of the next fork it could still take */
function svinCap(k){
  let cap=Infinity;
  for(const R of ALTS){
    if(R.hidden&&!R.open)continue;                     /* a shut secret passage is no choice */
    const d=fwdS(R.a,k.mi);
    if(d<N/2)cap=Math.min(cap,d-3);
  }
  return cap;
}
/** food traps a herd fired now would reach: on Carl's line, before the next fork */
function svinWork(k){
  if(k.rib)return 0;
  const reach=Math.min(SVIN.lead/SEG,svinCap(k));
  let n=0;
  for(const it of items){
    if(!SVIN_FOOD[it.type]||it.cool>0||!it.mesh.visible||it.svin)continue;
    const d=fwdS(it.si,k.mi);
    if(d>2&&d<reach&&Math.abs(it.lat-k.lat)<SVIN.corr+SVIN.reach)n++;
  }
  return n;
}

const pigParts=(function(){
  const pink=psMat({color:0xf0a8a0}),pinkL=psMat({color:0xf7c6b8}),pinkD=psMat({color:0xd98a80}),
        dark=psMat({color:0x2a1c1c});
  const body=flat(new THREE.BoxGeometry(.62,.44,.92)),head=flat(new THREE.BoxGeometry(.44,.4,.38)),
        sn=flat(new THREE.CylinderGeometry(.12,.12,.12,8).rotateX(Math.PI/2)),dot=flat(new THREE.BoxGeometry(.05,.07,.03)),
        ear=flat(new THREE.BoxGeometry(.16,.16,.05)),leg=flat(new THREE.BoxGeometry(.13,.3,.13)),
        tail=flat(new THREE.TorusGeometry(.07,.025,4,6));
  return ()=>{
    const g=new THREE.Group(),m=(geo,mat,x,y,z)=>{const e=new THREE.Mesh(geo,mat);e.position.set(x,y,z);g.add(e);return e;};
    m(body,pink,0,.5,0);m(head,pink,0,.62,.56);m(sn,pinkL,0,.56,.8);
    for(const s of [-1,1]){
      m(dot,dark,s*.045,.56,.87);m(dot,dark,s*.12,.7,.755);
      m(ear,pinkD,s*.16,.86,.52).rotation.z=s*.5;
    }
    const legs=[];for(const [x,z] of [[-.19,.3],[.19,.3],[-.19,-.3],[.19,-.3]]){
      const l=new THREE.Group();l.position.set(x,.3,z);g.add(l);
      const e=new THREE.Mesh(leg,pinkD);e.position.y=-.14;l.add(e);legs.push(l);}
    m(tail,pinkD,0,.62,-.5).rotation.y=Math.PI/2;
    g.userData.legs=legs;g.scale.setScalar(1.3);                  /* a little big, so they read at 320x240 */
    return g;
  };
})();

function fireSvin(k){
  if(k.svinHerd)endSvin(k.svinHerd);
  const h={owner:k,s:(k.mi+SVIN.start/SEG)%N,lat:clamp(k.lat,-HW*.75,HW*.75),t:0,pigs:[],cleared:0,stop:false,why:''};
  const at={};
  for(let n=0;n<SVIN.pigs;n++){
    const g=pigParts();scene.add(g);
    svinPt(h.s,h.lat+(n%2?.75:-.75),at);                 /* they land in a bunch just ahead of him */
    h.pigs.push({g,n,mode:'run',t:0,x:at.x+rand(-1,1),z:at.z+rand(-1,1),y:k.y,yaw:at.yaw,si:at.si,trap:null,side:1});
  }
  svinPt(h.s,h.lat,at);
  for(let p=0;p<16;p++)puff(at.x+rand(-1.5,1.5),k.y+rand(.2,1.4),at.z+rand(-1.5,1.5),.95,.72,.7,.55);
  svinHerds.push(h);k.svinHerd=h;
  if(k===player){
    toast('UT MED ER, PÅGAR!');
    audioTone(820,1100,.12,.05,'sine');audioTone(900,1100,.16,.05,'sine',.16);   /* the whistle */
    grunt(.38,.08);lastHerdOink=clock+.4;
  }else if(Math.hypot(k.x-player.x,k.z-player.z)<45){grunt(0,.05);lastHerdOink=clock;}
  return h;
}
/** gone: a puff of dust where each pig stood */
function endSvin(h){
  for(const p of h.pigs){
    if(p.mode==='gone')continue;
    puff(p.x,p.y+.5,p.z,.85,.75,.6,.5);scene.remove(p.g);p.mode='gone';
    if(p.trap&&p.trap.svin===h)p.trap.svin=null;
  }
  const i=svinHerds.indexOf(h);if(i>=0)svinHerds.splice(i,1);
  if(h.owner.svinHerd===h)h.owner.svinHerd=null;
}
/** a trap eaten: a temporary one goes for good, the road's own pie comes back later.
    A Kafferep's pie and coffee go together. */
function svinClear(it){
  const kill=o=>{
    if(!o||items.indexOf(o)<0||o.cool>0)return;
    for(let p=0;p<10;p++)puff(o.x+rand(-1,1),o.y+rand(.1,.9),o.z+rand(-1,1),
      o.type==='coffee'?.42:1,o.type==='coffee'?.26:o.type==='mine'?.9:.82,o.type==='coffee'?.14:.6,.5);
    o.mesh.visible=false;o.svin=null;
    if(o.temp!==undefined){o.temp=0.001;o.cool=1;}else o.cool=SVIN.back;
  };
  kill(it);kill(it.pair);
}
function svinOink(p){
  if(clock-lastHerdOink<.7||Math.hypot(p.x-player.x,p.z-player.z)>40)return;   /* seven pigs, not seven sounds */
  lastHerdOink=clock;grunt(0,.05);
}
const svinTo={};
function updateSvin(dt){
  for(let n=svinHerds.length-1;n>=0;n--){
    const h=svinHerds[n],k=h.owner;
    h.t+=dt;
    if(!h.stop&&(h.t>SVIN.time||k.done||k.parked||k.rib||state!=='race')){h.stop=true;h.why=h.t>SVIN.time?'time':'gone';}
    let ahead=fwdS(h.s,k.mi);if(ahead>N/2)ahead=0;    /* he drove past the herd */
    if(!h.stop){                                       /* the lead pig runs on, but never too far ahead */
      let step=Math.max(SVIN.min,k.speed+SVIN.run)*dt/SEG;
      step=Math.max(0,Math.min(step,SVIN.lead/SEG-ahead));
      const cap=svinCap(k);
      if(ahead+step>=cap){step=Math.max(0,cap-ahead);h.stop=true;h.why='fork';
        if(k===player&&h.pigs.some(p=>p.mode==='run'))toast('GRISARNA STANNAR VID VÄGSKÄLET');}
      h.s=(h.s+step)%N;ahead+=step;
      h.lat=lerp(h.lat,clamp(k.lat,-HW*.75,HW*.75),Math.min(1,dt*1.5));
      /* point a free pig at each food trap in the corridor, up to where the herd has got */
      for(const it of items){
        if(!SVIN_FOOD[it.type]||it.cool>0||!it.mesh.visible||it.svin)continue;
        const d=fwdS(it.si,k.mi);
        if(d>ahead+2||d>N/2||Math.abs(it.lat-h.lat)>SVIN.corr+SVIN.reach)continue;
        let best=null,bd=1e9;
        for(const p of h.pigs){if(p.mode!=='run')continue;const q=Math.hypot(p.x-it.x,p.z-it.z);if(q<bd){bd=q;best=p;}}
        if(!best)break;
        best.mode='go';best.trap=it;best.t=0;it.svin=h;
      }
    }
    let live=0;
    for(const p of h.pigs){
      if(p.mode==='gone')continue;
      live++;p.t+=dt;
      if(p.mode==='run'&&h.stop){p.mode='leave';p.t=0;p.side=p.n%2?1:-1;}
      if((p.mode==='go'||p.mode==='eat')&&(items.indexOf(p.trap)<0||p.trap.cool>0)){   /* someone drove into it first */
        p.mode=h.stop||p.mode==='eat'?'leave':'run';p.trap=null;p.t=0;p.g.rotation.x=0;}
      let tx,tz,spd=0;
      if(p.mode==='run'){                              /* formation: pairs behind the lead, a little waddle */
        const back=(Math.floor(p.n/2)*1.5+(p.n%2)*.6)/SEG,l=h.lat+(p.n===6?0:p.n%2?.75:-.75)+Math.sin(clock*3+p.n)*.25;
        svinPt((h.s-back+N)%N,l,svinTo);
        p.x=lerp(p.x,svinTo.x,Math.min(1,dt*10));p.z=lerp(p.z,svinTo.z,Math.min(1,dt*10));
        p.si=svinTo.si;p.yaw=svinTo.yaw+Math.sin(clock*8+p.n)*.2;spd=1;
      }else if(p.mode==='go'){                         /* a dash to the trap */
        tx=p.trap.x;tz=p.trap.z;
        const dx=tx-p.x,dz=tz-p.z,d=Math.hypot(dx,dz),m=Math.min(d,SVIN.pace*dt);
        if(d>1e-3){p.x+=dx/d*m;p.z+=dz/d*m;p.yaw=Math.atan2(dx,dz);}
        p.si=p.trap.si;spd=1;
        if(d<.9){p.mode='eat';p.t=0;
          if(p.trap.type==='mine'){p.trap.arm=1e9;p.trap.mesh.userData.flame.visible=false;   /* snuffed: disarmed */
            puff(p.trap.x,p.trap.y+1.8,p.trap.z,.6,.6,.6,.35);}}
      }else if(p.mode==='eat'){                        /* nibble, nibble */
        p.g.rotation.x=Math.abs(Math.sin(clock*20))*.25;
        if(p.t>=SVIN.eat){
          const it=p.trap;svinClear(it);h.cleared++;svinOink(p);
          if(k===player)toast(it.type==='mine'?'LJUSET SLÄCKT! TÅRTMINAN DESARMERAD':it.pair?'KAFFEREPET UPPÄTET!':'MUMS! PAJEN ÄR BORTA');
          p.trap=null;p.mode='leave';p.t=0;p.g.rotation.x=0;
          const L=(p.x-sx[p.si])*rx[p.si]+(p.z-sz[p.si])*rz[p.si];p.side=L>=0?1:-1;
        }
      }else if(p.mode==='leave'){                      /* trots off the road and away */
        const i=p.si;p.x+=(rx[i]*p.side*6+fx[i]*3)*dt;p.z+=(rz[i]*p.side*6+fz[i]*3)*dt;
        p.yaw=Math.atan2(rx[i]*p.side*2+fx[i],rz[i]*p.side*2+fz[i]);spd=1;
        if(p.t>SVIN.leave){puff(p.x,p.y+.5,p.z,.85,.75,.6,.5);scene.remove(p.g);p.mode='gone';live--;continue;}
      }
      p.y=groundAt(p.x,p.z,p.si);
      p.g.position.set(p.x,p.y+(spd?Math.abs(Math.sin(clock*14+p.n))*.12:0),p.z);
      p.g.rotation.y=p.yaw;
      p.g.userData.legs.forEach((l,i)=>{l.rotation.x=spd?Math.sin(clock*22+i*Math.PI*(i<2?1:.5)+p.n)*.6:0;});
    }
    if(!live){svinHerds.splice(n,1);if(k.svinHerd===h)k.svinHerd=null;}
  }
}
function clearSvin(){
  while(svinHerds.length)endSvin(svinHerds[svinHerds.length-1]);
  for(const it of items)it.svin=null;
}
