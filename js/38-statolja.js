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
  stations.push({at:((a%N)+N)%N,len,side});
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

/** would this kart's fuel last past the next pump to the one after it? */
function wantsFuel(k){
  let nx=null,bd=1e9;
  for(const S of stations){const d=((S.at-k.mi)%N+N)%N;if(d<bd){bd=d;nx=S;}}
  if(!nx)return false;
  let gap=N;for(const S of stations)if(S!==nx){const d=((S.at-nx.at)%N+N)%N;if(d<gap)gap=d;}
  const secs=(bd+gap)*SEG/(k.maxSpeed*0.7);
  return k.fuel<secs*2.6*k.burn+10;
}
/** fuel for the leg from this pump to the next one, with a margin */
function legFuel(k){
  const S=atPumpNow(k.si,k.lat);if(!S)return 82;
  let gap=N;for(const T of stations)if(T!==S){const d=((T.at-S.at)%N+N)%N;if(d<gap)gap=d;}
  return gap*SEG/(k.maxSpeed*0.7)*2.6*k.burn+14;
}
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
        if(k.fuel<70)bias+=(it.lat-k.line)*1.1*w;
      }else{
        const gap=k.line-it.lat;
        if(Math.abs(gap)<3.6)bias+=(gap>=0?1:-1)*(3.6-Math.abs(gap))*1.15*w;
      }
    }
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
        if(d<0&&g<11)tail=true;
        if(g<12)close=true;
      }
      const lvl=itemLvl(k),h=k.held;
      if(h==='boost')useItem(k);
      else if(h==='rocket'&&(lvl===2?near:ahead))useItem(k);
      else if(h==='pie'&&behind)useItem(k);
      else if(h==='shield'&&(lvl===3?close||behind:behind||Math.random()<0.004))useItem(k);
      else if(h==='fart'&&(lvl===1?tail:close))useItem(k);
      else if(h==='sig'&&SIGS[k.sig].ai({ahead,near,behind,close},k))useItem(k);
    }
    if(!k.wantFuel&&!k.atPump&&wantsFuel(k))k.wantFuel=true;  /* decided before the pump */
    if(k.wantFuel&&k.atPump&&k.fuel>=Math.min(96,Math.max(82,legFuel(k)))||k.fuel>=96)k.wantFuel=false;
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
