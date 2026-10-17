"use strict";
/* ───────── Romeleåsen i snö ───────── */
/* Ice Planet Pathway's counterpart: a snowed-in ridge, a frozen-lake shortcut, whiteout gusts and a snow plough */
ROADTEX.romeleSno=()=>pixTex(64,64,g=>{                 /* ploughed asphalt: darker wet wheel tracks, slush between */
  g.fillStyle='#737a80';g.fillRect(0,0,64,64);
  g.fillStyle='rgba(58,62,68,.28)';for(const x of [10,18,42,50])g.fillRect(x,0,5,64);
  for(let i=0;i<700;i++){g.fillStyle=Math.random()>.5?'rgba(160,168,176,.4)':'rgba(48,52,58,.35)';
    g.fillRect((Math.random()*64)|0,(Math.random()*64)|0,1,1);}
  for(let i=0;i<60;i++){g.fillStyle=Math.random()>.4?'rgba(232,238,243,.55)':'rgba(206,216,224,.5)';
    const x=[0,2,28,31,34,59,61][(Math.random()*7)|0]+((Math.random()*3)|0);g.fillRect(x,(Math.random()*64)|0,1+((Math.random()*2)|0),1+((Math.random()*3)|0));}
});
VERGEC.romeleSno=['#dfe6ec','#f6f9fb','#b9c3cc'];
GROUND.romeleSno={cell:58,stripe:0.42,verge:0xd6dee4,
  cols:[0xf1f4f6,0xe7edf1,0xdde5eb,0xf6f8fa,0xd2dbe0,0xe9eef0,0xcdd6d3,0xe3e9ee]};
SURF.ice={top:o=>1.07,grip:o=>0.24,fuel:0.85,name:'IS'};
SFX.ice={dust:[.86,.93,1],noise:{f:3600,g:.012}};
SFX.romeleSno={dust:[.96,.98,1],noise:{f:1300,g:.016}};
/** where the pumps will stand (buildStations runs after the edges, so work it out the same way) */
function romeleStationSpans(st){
  return (st.stations||[[0.27,1],[0.71,-1]]).map(sp=>{let at=Math.round(N*sp[0]);
    for(const J of JUMPS)if(Math.min(Math.abs(at-J.at),N-Math.abs(at-J.at))<J.up+J.dn+16)at=(at+46)%N;
    return {at,side:sp[1]};});
}
/* the plough's own ways on and off the road: no snowbank there */
const ROMELE_PLOW={from:186,to:112,side:-1};
function romeleGap(i,side,st){
  const d=(a,b)=>((a-b)%N+N)%N;
  if(side===ROMELE_PLOW.side&&(d(i,ROMELE_PLOW.from-3)<10||d(i,ROMELE_PLOW.to-8)<10))return true;
  for(const S of romeleStationSpans(st))if(S.side===side&&(d(i,S.at-3)<20))return true;
  return false;
}
/* ploughed-up banks down both sides, with orange snow poles to show where the road was */
EDGES.romeleBank=st=>{
  const m4=new THREE.Matrix4(),q=new THREE.Quaternion(),e=new THREE.Euler(),p=new THREE.Vector3(),s=new THREE.Vector3();
  const bank=new THREE.InstancedMesh(flat(new THREE.IcosahedronGeometry(1,0)),psMat({color:0xeef3f6}),N+20);
  const pole=new THREE.InstancedMesh(flat(new THREE.CylinderGeometry(.06,.06,1.9,4)).translate(0,.95,0),psMat({color:0xf06a1c,unlit:true}),Math.ceil(N/8)*2+4);
  let a=0,b=0;
  for(let i=0;i<N;i+=2)for(const side of [-1,1]){
    if(romeleGap(i,side,st))continue;
    const o=side*(HW+4.2+hash2(i,side)*.7),x=sx[i]+rx[i]*o,z=sz[i]+rz[i]*o;
    if(nearAlt(x,z,3))continue;
    p.set(x,meshY(x,z)-.15,z);e.set(0,Math.atan2(fx[i],fz[i])+hash2(side,i)*.5,0);q.setFromEuler(e);
    s.set(1.6+hash2(i*3,side)*.6,.75+hash2(i,side*7)*.55,2.3);m4.compose(p,q,s);bank.setMatrixAt(a++,m4);
    if(i%8===0&&b<pole.count){
      const o2=side*(HW+3.3),x2=sx[i]+rx[i]*o2,z2=sz[i]+rz[i]*o2;
      p.set(x2,meshY(x2,z2)-.1,z2);e.set(hash2(i,2)*.12-.06,0,hash2(2,i)*.12-.06);q.setFromEuler(e);s.set(1,1,1);
      m4.compose(p,q,s);pole.setMatrixAt(b++,m4);
    }
  }
  bank.count=a;pole.count=b;bank.instanceMatrix.needsUpdate=pole.instanceMatrix.needsUpdate=true;
  world.add(bank);world.add(pole);
};
/** the frozen lake: an ellipse along the ice lane, kept clear of the main road */
let romeleLakeC=null;
function romeleLakeW(x,z){
  if(!romeleLakeC||romeleLakeC.alts!==ALTS){
    const R=ALTS.find(r=>r.id==='isen');
    if(!R){romeleLakeC={alts:ALTS,none:true};}
    else{
      const j0=COMMIT+4,j1=R.n-1-MERGE-4,ax=R.X[j1]-R.X[j0],az=R.Z[j1]-R.Z[j0],L=Math.hypot(ax,az);
      romeleLakeC={alts:ALTS,cx:(R.X[j0]+R.X[j1])/2,cz:(R.Z[j0]+R.Z[j1])/2,ux:ax/L,uz:az/L,a:L*0.5+8,b:44};
    }
  }
  const C=romeleLakeC;if(C.none)return 0;
  const dx=x-C.cx,dz=z-C.cz,u=(dx*C.ux+dz*C.uz)/C.a,v=(-dx*C.uz+dz*C.ux)/C.b,e2=u*u+v*v;
  if(e2>1.05)return 0;
  const k=nearestGlobal(x,z),ml=Math.abs((x-sx[k])*rx[k]+(z-sz[k])*rz[k]);
  return (1-smooth(0.72,1.0,e2))*smooth(HW+7,HW+17,ml);
}
const ROMELE_HILL=[305,52], ROMELE_PISTE=[[298,50],[238,42]];
function romelePisteD(x,z){
  const [a,b]=ROMELE_PISTE,vx=b[0]-a[0],vz=b[1]-a[1],L2=vx*vx+vz*vz;
  const t=clamp(((x-a[0])*vx+(z-a[1])*vz)/L2,0,1);
  return Math.hypot(x-a[0]-vx*t,z-a[1]-vz*t);
}

STAGES.push({ id:'romele', group:'vild', name:'ROMELEÅSEN', sub:'SNÖKAOSET', hw:8.6,
  bars:[0.75,0.70,0.80], laps:3,
  blurb:'The one day a year it snows in Skåne, up over the Romeleåsen ridge past the lookout, the ski slope and a ditch full of snowed-in cars. Cut straight across the frozen lake on ice that is quick but barely steers, keep clear of the big yellow plough coming the other way, and drive blind when a snow squall closes in.',
  role:'Snöbyar, en plogbil i mötande och genväg över isen.',
  sky:[0xe2e8ec,0x9cb0c2], fog:[0xdfe6eb,55,290], amb:0x8a96a4, dif:0xf2f4ff,
  road:'romeleSno', verge:'romeleSno', edge:'romeleBank', ground:'romeleSno', paint:false,
  sfxRoad:'road', sfxOff:'romeleSno',
  jumpSpec:[{h:3.6,drop:2.6,up:12,dn:7,rec:18},{h:2.8,drop:2.0,up:11,dn:6,rec:16}],
  ctrl:[[0,0,-160],[80,0,-162],[150,2,-140],[195,7,-95],[210,13,-40],[200,19,15],[165,23,50],[125,21,75],
        [108,17,115],[108,13,158],[75,9,192],[15,5,192],[-35,3,182],[-80,2,198],[-140,2,195],[-185,3,155],
        [-198,4,98],[-178,5,42],[-188,7,-12],[-200,8,-62],[-180,6,-108],[-135,3,-145],[-70,1,-166]],
  stations:[[0.42,-1],[0.88,1]],
  routes:[
    {id:'isen',name:'ISEN',a:385,b:508,hw:4.5,side:1,lead:9,leadLat:10,
     mid:[[0.3,5],[0.7,-5]],surface:'ice',risk:0.55,
     blurb:'Straight over the frozen lake. Shorter and quick, but the ice hardly steers.'}],
  stamps:[
    {id:'rom1',dish:'Kalops',ini:'K',kind:'intro',route:'main',i:322,lat:6.2,
     hint:'Vid de röda stugorna nere i byn, vid vägkanten.',
     story:'Skånsk kalops is the winter stew of the farms on the ridge: beef braised slowly with onion, bay and whole allspice until it falls apart, eaten with boiled potatoes and pickled beetroot. It is what simmers on the stove while everyone else is out digging the car free.'},
    {id:'rom2',dish:'Glögg',ini:'G',kind:'route',route:'isen',f:0.5,lat:1.6,
     hint:'Ute på isen, hos pimpelfiskarna.',
     story:'Mulled wine with cloves, cinnamon and cardamom, served hot with raisins and almonds in the glass. Out on the lake the ice fishers keep a thermos of it beside the hole, and it is shared with anyone who skids past.'},
    {id:'rom3',dish:'Bruna bönor',ini:'B',kind:'air',route:'main',jump:0,after:5,lat:0,air:4.6,
     hint:'Högt i luften över det första hoppet.',
     story:'Brown beans stewed sweet and sour with syrup and vinegar, served with thick slices of fried pork. It is the farmhouse winter dinner of the south, simmered all afternoon while the snow piles up against the door.'}],
  /* the ski hill rises east of the ridge; the lake lies flat and dead level */
  mod:(x,z,t)=>{
    let d=t*36*Math.exp(-((x-ROMELE_HILL[0])**2+(z-ROMELE_HILL[1])**2)/(2*60*60));
    const w=romeleLakeW(x,z);if(w>0)d-=w*rolls(x,z)*t;
    return d;
  },
  land:(x,z,out)=>{
    const w=romeleLakeW(x,z);
    if(w>0.35){out.setHex(hash2(Math.floor(x/7),Math.floor(z/7))>0.5?0xb4d0df:0xc6dde8);
      if(hash2(Math.floor(x/3.1),Math.floor(z/11))>0.93)out.setHex(0xe6f1f6);return;}
    if(w>0.05){out.setHex(0xe8eef2);return;}
    if(romelePisteD(x,z)<11)out.setHex(0xfbfdff);
  },
  hazards:H=>hazardsRomele(H), scenery:()=>sceneryRomele()
});

/** a point on the main road at a fractional sample, with heading */
function romeleRoadPt(s,lat){
  const i0=Math.floor(s),f=s-i0,a=((i0%N)+N)%N,b=(a+1)%N;
  const X=lerp(sx[a],sx[b],f),Z=lerp(sz[a],sz[b],f),RX=lerp(rx[a],rx[b],f),RZ=lerp(rz[a],rz[b],f);
  return {x:X+RX*lat,z:Z+RZ*lat,y:lerp(sy[a],sy[b],f)+clamp(lat,-BANKLAT,BANKLAT)*lerp(bank[a],bank[b],f),
    yaw:Math.atan2(lerp(fx[a],fx[b],f),lerp(fz[a],fz[b],f)),rx:RX,rz:RZ,i:a};
}
function romeleInst(geo,mat,list,colors){
  const m=new THREE.InstancedMesh(geo,mat,Math.max(1,list.length));
  const m4=new THREE.Matrix4(),q=new THREE.Quaternion(),e=new THREE.Euler(),p=new THREE.Vector3(),s=new THREE.Vector3();
  list.forEach((v,n)=>{p.set(v[0],v[1],v[2]);e.set(v[7]||0,v[3]||0,v[8]||0,'YXZ');q.setFromEuler(e);
    s.set(v[4]||1,v[5]||v[4]||1,v[6]||v[4]||1);m4.compose(p,q,s);m.setMatrixAt(n,m4);
    if(colors)m.setColorAt(n,colors[n]);});
  m.count=list.length;m.instanceMatrix.needsUpdate=true;if(m.instanceColor)m.instanceColor.needsUpdate=true;
  world.add(m);return m;
}
/** a person in a winter coat; shovel in hand when asked */
function romelePerson(coat,hat,shovel){
  const g=new THREE.Group();
  const b=(w,h,d,c,x,y,z)=>{const m=new THREE.Mesh(flat(new THREE.BoxGeometry(w,h,d)),psMat({color:c}));m.position.set(x,y,z);g.add(m);return m;};
  b(.5,.8,.34,0x2b2f3a,0,.4,0);b(.66,.8,.44,coat,0,1.2,0);b(.36,.36,.36,0xe8c0a0,0,1.8,0);b(.4,.2,.4,hat,0,2.05,0);
  if(shovel){
    const arm=new THREE.Group();arm.position.set(0,1.3,.2);g.add(arm);
    const st=new THREE.Mesh(flat(new THREE.BoxGeometry(.07,.07,1.5)),psMat({color:0x7a5a3a}));st.position.set(.25,-.2,.6);st.rotation.x=.7;arm.add(st);
    const bl=new THREE.Mesh(flat(new THREE.BoxGeometry(.5,.05,.5)),psMat({color:0x2f6fb8}));bl.position.set(.25,-.75,1.2);arm.add(bl);
    g.userData.arm=arm;
  }
  return g;
}
function sceneryRomele(){
  const ST=romeleStationSpans(stage);
  const nearStation=(x,z)=>{const k=nearestGlobal(x,z);
    return ST.some(S=>{const d=((k-S.at+8)%N+N)%N;return d<34&&((x-sx[k])*rx[k]+(z-sz[k])*rz[k])*S.side>0&&latAt(x,z)<HW+30;});};
  const clear=(x,z,pad)=>latAt(x,z)>HW+pad&&!nearStation(x,z)&&romeleLakeW(x,z)===0&&romelePisteD(x,z)>14;
  const anim=[];stage.romeleAnim=anim;
  /* spruce under snow, and bare beech on the ridge */
  const spr=[],sprC=[],beech=[];
  let guard=0;
  while((spr.length<300||beech.length<130)&&guard++<16000){
    const x=rand(-380,380),z=rand(-380,380);
    if(!clear(x,z,15))continue;
    const cell=hash2(Math.floor(x/70),Math.floor(z/70));
    if(cell<0.55&&Math.random()>0.05)continue;
    const sc=rand(.75,1.4),y=meshY(x,z)-.3;
    if(x>60&&hash2(x*.2,z*.2)>0.55&&beech.length<130)beech.push([x,y,z,rand(0,6.3),sc,sc*rand(.9,1.3),sc]);
    else if(spr.length<300){spr.push([x,y,z,rand(0,6.3),sc,sc*rand(.85,1.3),sc]);
      sprC.push(new THREE.Color(1,1,1).multiplyScalar(rand(.8,1.12)));}
  }
  romeleInst(flat(new THREE.CylinderGeometry(.22,.34,2,5)).translate(0,1,0),psMat({color:0x4a3a2c}),spr);
  romeleInst(flat(new THREE.ConeGeometry(2.3,8.5,6)).translate(0,6.2,0),psMat({color:0x2f4a34}),spr,sprC);
  romeleInst(flat(new THREE.ConeGeometry(1.5,3.6,6)).translate(0,9.4,0),psMat({color:0xf2f6f8}),spr);
  romeleInst(flat(new THREE.ConeGeometry(2.4,1.0,6)).translate(0,4.6,0),psMat({color:0xeef3f6}),spr);
  romeleInst(flat(new THREE.CylinderGeometry(.18,.32,7,5)).translate(0,3.5,0),psMat({color:0x6c6a66}),beech);
  romeleInst(flat(new THREE.IcosahedronGeometry(2.8,0)).translate(0,8.2,0),psMat({color:0x857a70,transparent:true,opacity:.72}),beech);
  /* the tree line at the fog edge */
  const TL=[];
  for(let i=0;i<110;i++){const a=i/110*6.283,d=rand(330,375),x=Math.cos(a)*d,z=Math.sin(a)*d,h=rand(16,28),w=rand(12,24);
    TL.push([x,meshY(x,z)+h*.42,z,rand(0,6),w,h,w]);}
  romeleInst(flat(new THREE.ConeGeometry(1,1,5)),psMat({color:0x8d9c98}),TL);

  /* red cottages with snow on the roof and smoke from the chimney */
  const smokeM=psMat({color:0xc8ccd0,unlit:true,transparent:true,opacity:.55,depthWrite:false});
  const cott=[[316,1,22],[340,1,34],[300,-1,26],[362,-1,30],[30,-1,30],[56,-1,44],[646,1,28],[262,1,40],[440,-1,26],[590,-1,34]];
  const cottPos=[];
  for(const [i,side,o] of cott){
    const x=sx[i]+rx[i]*side*(HW+o),z=sz[i]+rz[i]*side*(HW+o);
    if(!clear(x,z,12))continue;
    const h=house(8.5,6,3.3,0x9a2b20,0xf2f5f8,2.6);
    const ch=new THREE.Mesh(flat(new THREE.BoxGeometry(.9,2.4,.9)),psMat({color:0x5a4a44}));ch.position.set(2.2,5.4,0);h.add(ch);
    const sm=new THREE.Mesh(flat(new THREE.SphereGeometry(1.1,5,4)),smokeM);sm.position.set(2.2,7.6,0);sm.scale.set(1.3,.8,1);h.add(sm);
    anim.push({k:'smoke',m:sm,ph:hash2(i,side)*6});
    const lit=new THREE.Mesh(flat(new THREE.BoxGeometry(1.1,1,.15)),psMat({color:0xffd27a,unlit:true}));lit.position.set(-2,1.7,3.05);h.add(lit);
    h.position.set(x,meshY(x,z)-.2,z);h.rotation.y=Math.atan2(fx[i],fz[i])+(side>0?Math.PI/2:-Math.PI/2);world.add(h);
    cottPos.push([x,z,h.rotation.y]);
  }
  /* people out with shovels, digging out paths and cars */
  const coats=[0xc8281c,0x2f6fb8,0xe8b21a,0x3f8a3a,0x7a3f8a,0xe0e4e8];
  let pn=0;
  const person=(x,z,yaw,shovel)=>{
    const g=romelePerson(coats[pn%coats.length],coats[(pn+3)%coats.length],shovel);
    g.position.set(x,meshY(x,z)-.05,z);g.rotation.y=yaw;world.add(g);
    if(shovel)anim.push({k:'dig',g,ph:pn*1.3});pn++;
  };
  cottPos.slice(0,6).forEach(([x,z,yaw],n)=>{const ox=Math.sin(yaw+1.57)*6,oz=Math.cos(yaw+1.57)*6;
    if(latAt(x+ox,z+oz)>HW+6)person(x+ox+n%2,z+oz,yaw+n,true);});
  /* snowed-in cars in the ditch, hazard lights going, an owner digging */
  const carCols=[0xb02a22,0x2c4e8a,0xd8d4c8,0x3c6a44,0x8a8f96,0xc8a020];
  for(const [i,side] of [[150,1],[176,1],[214,-1],[452,-1],[580,1],[612,-1],[680,1],[268,-1]]){
    const o=side*(HW+8.5),x=sx[i]+rx[i]*o,z=sz[i]+rz[i]*o;
    if(nearStation(x,z)||nearAlt(x,z,6)||romeleGap(i,side,stage))continue;
    const g=new THREE.Group(),yaw=Math.atan2(fx[i],fz[i])+(hash2(i,1)-.5)*.6;
    const body=new THREE.Mesh(flat(new THREE.BoxGeometry(1.9,1.0,4.2)),psMat({color:carCols[i%carCols.length]}));body.position.y=.8;g.add(body);
    const cab=new THREE.Mesh(flat(new THREE.BoxGeometry(1.7,.8,2.2)),psMat({color:0x2b3540}));cab.position.set(0,1.65,-.3);g.add(cab);
    const cap=new THREE.Mesh(flat(new THREE.BoxGeometry(1.95,.5,2.4)),psMat({color:0xf4f7f9}));cap.position.set(0,2.25,-.3);g.add(cap);
    const drift=new THREE.Mesh(flat(new THREE.IcosahedronGeometry(1.6,0)),psMat({color:0xeef3f6}));drift.position.set(side*.6,.6,1.2);drift.scale.set(1.4,.8,2.2);g.add(drift);
    const blink=psMat({color:0xff9a1a,unlit:true});
    for(const sg of [-1,1]){const l=new THREE.Mesh(flat(new THREE.BoxGeometry(.3,.2,.1)),blink);l.position.set(sg*.75,.95,-2.12);g.add(l);}
    anim.push({k:'blink',m:blink,ph:hash2(i,3)});
    g.position.set(x,meshY(x,z)-.45,z);g.rotation.set(.12,yaw,side*.22);world.add(g);
    const px=x+Math.sin(yaw)*3.4+rx[i]*side*1.4,pz=z+Math.cos(yaw)*3.4+rz[i]*side*1.4;
    if(latAt(px,pz)>HW+5)person(px,pz,yaw+Math.PI,true);
  }
  /* snowmen */
  const sm1=[],sm2=[],sm3=[],car=[];
  guard=0;
  while(sm1.length<26&&guard++<3000){
    const ref=cottPos.length&&Math.random()<.5?cottPos[(Math.random()*cottPos.length)|0]:null;
    const x=ref?ref[0]+rand(-16,16):rand(-300,300),z=ref?ref[1]+rand(-16,16):rand(-300,300);
    if(!clear(x,z,8))continue;
    const y=meshY(x,z),s=rand(.8,1.3),yaw=rand(0,6.3);
    sm1.push([x,y+.8*s,z,yaw,s]);sm2.push([x,y+1.95*s,z,yaw,s]);sm3.push([x,y+2.8*s,z,yaw,s]);
    car.push([x+Math.sin(yaw)*.5*s,y+2.8*s,z+Math.cos(yaw)*.5*s,yaw,s,s,s,Math.PI/2]);
  }
  const snowM=psMat({color:0xf6f9fb});
  romeleInst(flat(new THREE.IcosahedronGeometry(1,1)),snowM,sm1);
  romeleInst(flat(new THREE.IcosahedronGeometry(.72,1)),snowM,sm2);
  romeleInst(flat(new THREE.IcosahedronGeometry(.5,1)),snowM,sm3);
  romeleInst(flat(new THREE.ConeGeometry(.12,.6,4)).translate(0,.3,0),psMat({color:0xf07a1a}),car);

  /* Romeleklint: the lookout on top of the ridge */
  {
    const i=206,side=-1,o=side*(HW+15),x=sx[i]+rx[i]*o,z=sz[i]+rz[i]*o,y=meshY(x,z);
    const g=new THREE.Group(),wood=psMat({color:0x7a5a3c}),dk=psMat({color:0x5a4430});
    for(const [a,b] of [[-2,-2],[2,-2],[-2,2],[2,2]]){const p=new THREE.Mesh(flat(new THREE.BoxGeometry(.4,8,.4)),dk);p.position.set(a,4,b);g.add(p);}
    const deck=new THREE.Mesh(flat(new THREE.BoxGeometry(5.4,.4,5.4)),wood);deck.position.y=8;g.add(deck);
    const snow=new THREE.Mesh(flat(new THREE.BoxGeometry(5.2,.2,5.2)),snowM);snow.position.y=8.3;g.add(snow);
    for(const [a,b,w,d] of [[0,-2.6,5.4,.15],[0,2.6,5.4,.15],[-2.6,0,.15,5.4],[2.6,0,.15,5.4]]){
      const r=new THREE.Mesh(flat(new THREE.BoxGeometry(w,.8,d)),wood);r.position.set(a,9,b);g.add(r);}
    for(let k=0;k<6;k++){const st=new THREE.Mesh(flat(new THREE.BoxGeometry(1.4,.2,.6)),wood);st.position.set(3.4,1+k*1.3,-2+k*.8);g.add(st);}
    const rock=new THREE.Mesh(flat(new THREE.DodecahedronGeometry(4,0)),psMat({color:0x8c8a86}));rock.position.set(-6,1,3);rock.scale.set(1.3,.7,1);g.add(rock);
    const rs=new THREE.Mesh(flat(new THREE.DodecahedronGeometry(3.6,0)),snowM);rs.position.set(-6,2.2,3);rs.scale.set(1.3,.35,1);g.add(rs);
    const pole=new THREE.Mesh(flat(new THREE.CylinderGeometry(.08,.1,12,5)),psMat({color:0xeceff2}));pole.position.set(2,14,2);g.add(pole);
    const flag=pixTex(24,16,c=>{c.fillStyle='#c8281c';c.fillRect(0,0,24,16);c.fillStyle='#f2c418';c.fillRect(7,0,3,16);c.fillRect(0,6,24,3);});
    const fl=new THREE.Mesh(new THREE.PlaneGeometry(2.4,1.6),psMat({map:flag,side:THREE.DoubleSide}));fl.position.set(3.25,19.1,2);g.add(fl);
    anim.push({k:'flag',m:fl});
    const signT=pixTex(96,24,c=>{c.fillStyle='#6b4a2a';c.fillRect(0,0,96,24);c.fillStyle='#f4ecd8';c.font='9px "Press Start 2P",monospace';
      c.textAlign='center';c.textBaseline='middle';c.fillText('ROMELEKLINT',48,13);});
    const sp=new THREE.Mesh(new THREE.PlaneGeometry(4.8,1.2),psMat({map:signT,unlit:true,side:THREE.DoubleSide}));sp.position.set(0,2.2,5);g.add(sp);
    const sgp=new THREE.Mesh(flat(new THREE.BoxGeometry(.15,2,.15)),dk);sgp.position.set(0,1,5.1);g.add(sgp);
    g.position.set(x,y-.2,z);g.rotation.y=Math.atan2(fx[i],fz[i])+Math.PI/2;world.add(g);
  }
  /* the ski slope with its tow lift */
  {
    const [A,B]=ROMELE_PISTE;
    const pyl=[],L=[];
    const off=(t,sd)=>{const x=lerp(B[0],A[0],t),z=lerp(B[1],A[1],t),dx=A[0]-B[0],dz=A[1]-B[1],l=Math.hypot(dx,dz);
      return [x+(-dz/l)*sd,z+(dx/l)*sd];};
    for(let k=0;k<=6;k++){const [x,z]=off(k/6*.92,-15);pyl.push([x,meshY(x,z),z]);}
    const pm=psMat({color:0x8a9096});
    const tops=pyl.map(v=>new THREE.Vector3(v[0],v[1]+7,v[2]));
    romeleInst(flat(new THREE.CylinderGeometry(.25,.35,7,5)).translate(0,3.5,0),pm,pyl);
    romeleInst(flat(new THREE.BoxGeometry(3,.25,.25)).translate(0,7,0),pm,pyl.map((v,k)=>{const d=Math.atan2(A[0]-B[0],A[1]-B[1]);return [v[0],v[1],v[2],d+Math.PI/2];}));
    for(const sd of [-1.4,1.4])for(let k=0;k<tops.length-1;k++){
      const yaw=Math.atan2(A[0]-B[0],A[1]-B[1]),ox=Math.cos(yaw)*sd,oz=-Math.sin(yaw)*sd;
      strut(tops[k].clone().add(new THREE.Vector3(ox,0,oz)),tops[k+1].clone().add(new THREE.Vector3(ox,0,oz)),.08,psMat({color:0x30343a}));
    }
    const bars=new THREE.InstancedMesh(flat(new THREE.BoxGeometry(1.1,.12,.12)).translate(0,-2.4,0),psMat({color:0xe0a020}),16);
    const rods=new THREE.InstancedMesh(flat(new THREE.BoxGeometry(.06,2.4,.06)).translate(0,-1.2,0),psMat({color:0x30343a}),16);
    world.add(bars);world.add(rods);anim.push({k:'lift',bars,rods,tops});
    const hut=house(5,4,2.6,0x9a2b20,0xf2f5f8,1.8);hut.position.set(pyl[0][0]-4,pyl[0][1]-.1,pyl[0][2]-2);world.add(hut);
    /* skiers on the piste, and an orange fence down its edge */
    const sk=[],skc=[],fen=[];
    for(let k=0;k<14;k++){const t=hash2(k,4.4)*.85+.05,[x,z]=off(t,(hash2(k,9.1)-.5)*16);
      sk.push([x,meshY(x,z)+.7,z,hash2(k,1)*6]);skc.push(new THREE.Color(coats[k%coats.length]));}
    for(let k=0;k<26;k++){const [x,z]=off(k/26,11.5);fen.push([x,meshY(x,z)+.5,z,Math.atan2(A[0]-B[0],A[1]-B[1])]);}
    romeleInst(flat(new THREE.BoxGeometry(.5,1.4,.4)),psMat({color:0xffffff}),sk,skc);
    romeleInst(flat(new THREE.BoxGeometry(.08,1,4)),psMat({color:0xf06a1c,unlit:true}),fen);
  }
  /* the frozen lake: ice-fishing holes, a fisher on a box, reeds frozen at the shore */
  {
    const R=ALTS.find(r=>r.id==='isen');
    if(R){
      const iceT=pixTex(32,64,c=>{c.fillStyle='#a9c9da';c.fillRect(0,0,32,64);
        for(let n=0;n<160;n++){c.fillStyle=Math.random()>.5?'rgba(230,244,250,.7)':'rgba(120,160,185,.5)';c.fillRect((Math.random()*32)|0,(Math.random()*64)|0,1+((Math.random()*5)|0),1);}
        c.strokeStyle='rgba(240,250,255,.8)';c.lineWidth=1;for(let n=0;n<4;n++){c.beginPath();let x=Math.random()*32,y=Math.random()*64;c.moveTo(x,y);
          for(let s=0;s<4;s++){x+=rand(-6,6);y+=rand(-8,8);c.lineTo(x,y);}c.stroke();}});
      iceT.wrapS=iceT.wrapT=THREE.RepeatWrapping;
      const im=psMat({map:iceT});im.polygonOffset=true;im.polygonOffsetFactor=-4;im.polygonOffsetUnits=-4;
      world.add(new THREE.Mesh(altRibbon(R,-R.hw-.3,R.hw+.3,.04,9,0,R.n-1),im));
      /* snow ridges along the lane edges so the slippery bit has walls you can read */
      const rid=[],stk=[];
      for(let j=COMMIT+6;j<R.n-MERGE-4;j+=2)for(const sg of [-1,1]){
        const x=R.X[j]+R.RX[j]*sg*(R.hw+1.6),z=R.Z[j]+R.RZ[j]*sg*(R.hw+1.6);
        const mk=nearestGlobal(x,z);if(Math.abs((x-sx[mk])*rx[mk]+(z-sz[mk])*rz[mk])<HW+4)continue;
        rid.push([x,R.Y[j]+.05,z,Math.atan2(R.FX[j],R.FZ[j]),1.1,.45,2.2]);
        if(j%10===0)stk.push([x,R.Y[j],z]);
      }
      romeleInst(flat(new THREE.IcosahedronGeometry(1,0)),snowM,rid);
      romeleInst(flat(new THREE.CylinderGeometry(.05,.05,1.8,4)).translate(0,.9,0),psMat({color:0xf06a1c,unlit:true}),stk);
      const holes=[],fish=[];
      for(let k=0;k<9;k++){
        const j=Math.round(R.n*(.25+.5*hash2(k,2.2))),sg=k%2?1:-1,o=sg*(R.hw+6+hash2(k,5)*12);
        const x=R.X[j]+R.RX[j]*o,z=R.Z[j]+R.RZ[j]*o;
        if(romeleLakeW(x,z)<0.5)continue;
        holes.push([x,meshY(x,z)+.03,z,0,.9,.05,.9]);
        if(k%3===0)fish.push([x+1.2,z,j]);
      }
      romeleInst(flat(new THREE.CylinderGeometry(1,1,1,8)),psMat({color:0x1d3446,unlit:true}),holes);
      for(const [x,z] of fish){const p=romelePerson(0x2f4a6a,0xc8281c,false);p.position.set(x,meshY(x,z),z);p.scale.setScalar(.95);world.add(p);
        const box=new THREE.Mesh(flat(new THREE.BoxGeometry(.6,.5,.6)),psMat({color:0x2f6fb8}));box.position.set(x,meshY(x,z)+.25,z+.8);world.add(box);}
      const warnT=pixTex(64,32,c=>{c.fillStyle='#f2c418';c.fillRect(0,0,64,32);c.fillStyle='#15171a';c.font='8px "Press Start 2P",monospace';
        c.textAlign='center';c.textBaseline='middle';c.fillText('SVAG IS',32,11);c.fillText('?!',32,23);});
      for(const j of [COMMIT+3]){
        const x=R.X[j]+R.RX[j]*(R.hw+2.4),z=R.Z[j]+R.RZ[j]*(R.hw+2.4),y=meshY(x,z);
        const p=new THREE.Mesh(flat(new THREE.CylinderGeometry(.1,.12,2.6,5)),psMat({color:0x6b5540}));p.position.set(x,y+1.3,z);world.add(p);
        const s=new THREE.Mesh(new THREE.PlaneGeometry(2.4,1.2),psMat({map:warnT,unlit:true,side:THREE.DoubleSide}));
        s.position.set(x,y+2.8,z);s.rotation.y=Math.atan2(R.FX[j],R.FZ[j])+Math.PI;world.add(s);
      }
    }
  }
  /* the plough's garage and the track out of the spruce at the far end */
  {
    const P=ROMELE_PLOW,gi=P.from+4,o=P.side*(HW+27),x=sx[gi]+rx[gi]*o,z=sz[gi]+rz[gi]*o;
    const gar=house(12,9,6,0x8a8f96,0xf2f5f8,2);gar.position.set(x,meshY(x,z)-.2,z);gar.rotation.y=Math.atan2(fx[gi],fz[gi]);world.add(gar);
    const slushM=psMat({color:0xaab3ba});slushM.polygonOffset=true;slushM.polygonOffsetFactor=-2;slushM.polygonOffsetUnits=-2;
    for(const [i0,i1] of [[P.from-2,P.from+6],[P.to-10,P.to-2]]){
      const a=romeleRoadPt(i0,P.side*(HW-1)),b=romeleRoadPt(i1,P.side*(HW+26));
      const dx=b.x-a.x,dz=b.z-a.z,L=Math.hypot(dx,dz);
      const pl=new THREE.Mesh(new THREE.PlaneGeometry(6,L).rotateX(-Math.PI/2),slushM);
      pl.position.set((a.x+b.x)/2,Math.max(meshY((a.x+b.x)/2,(a.z+b.z)/2),lerp(a.y,meshY(b.x,b.z),.5))+.08,(a.z+b.z)/2);
      pl.rotation.y=Math.atan2(dx,dz);world.add(pl);
    }
  }
  /* a hand-painted panic sign near the start */
  {
    const t=pixTex(96,48,c=>{c.fillStyle='#c8281c';c.fillRect(0,0,96,48);c.fillStyle='#f4ecd8';c.fillRect(3,3,90,42);
      c.fillStyle='#15171a';c.font='9px "Press Start 2P",monospace';c.textAlign='center';c.textBaseline='middle';
      c.fillText('VARNING!',48,14);c.fillText('2 CM SNÖ',48,28);c.fillStyle='#c8281c';c.fillText('PANIK',48,40);});
    for(const [i,side] of [[60,-1],[420,1]]){
      const o=side*(HW+5.5),x=sx[i]+rx[i]*o,z=sz[i]+rz[i]*o,y=meshY(x,z);
      if(nearAlt(x,z,3))continue;
      const p=new THREE.Mesh(flat(new THREE.CylinderGeometry(.1,.1,3,5)),psMat({color:0x8d949a}));p.position.set(x,y+1.5,z);world.add(p);
      const s=new THREE.Mesh(new THREE.PlaneGeometry(3.2,1.6),psMat({map:t,unlit:true,side:THREE.DoubleSide}));
      s.position.set(x,y+3.6,z);s.rotation.y=Math.atan2(fx[i],fz[i])+Math.PI;world.add(s);
    }
  }
}
/** a big yellow snow plough, nose along +z */
function romelePlough(){
  const g=new THREE.Group(),yel=psMat({color:0xf2b705}),dk=psMat({color:0x2a2d32}),gl=psMat({color:0x23384a});
  const b=(w,h,d,m,x,y,z)=>{const e=new THREE.Mesh(flat(new THREE.BoxGeometry(w,h,d)),m);e.position.set(x,y,z);g.add(e);return e;};
  b(2.8,.9,9,dk,0,1.25,-.2);b(2.7,2.1,2.4,yel,0,2.75,2.6);b(2.72,.9,1.2,gl,0,3.2,3.2);
  b(2.8,2.2,5,yel,0,2.85,-2);b(2.9,.3,5.2,psMat({color:0xf4f7f9}),0,4.05,-2);
  for(const z of [3,-1.4,-3.4])for(const sg of [-1,1]){
    const c=new THREE.CylinderGeometry(.72,.72,.5,8);c.rotateZ(Math.PI/2);
    const w=new THREE.Mesh(flat(c),dk);w.position.set(sg*1.35,.72,z);g.add(w);}
  const blade=new THREE.Group();blade.position.set(0,.95,5.5);blade.rotation.y=.32;g.add(blade);
  const bm=new THREE.Mesh(flat(new THREE.BoxGeometry(6.4,1.6,.35)),yel);blade.add(bm);
  for(let k=-3;k<=3;k++){const s=new THREE.Mesh(flat(new THREE.BoxGeometry(.45,1.62,.37)),dk);s.position.x=k*.9;blade.add(s);}
  const spray=new THREE.Mesh(flat(new THREE.IcosahedronGeometry(1.4,0)),psMat({color:0xf6f9fb}));spray.position.set(3.4,.6,0);spray.scale.set(1.4,.7,1);blade.add(spray);
  const bA=psMat({color:0xff8a10,unlit:true}),bB=psMat({color:0xff8a10,unlit:true});
  const l1=b(.45,.4,.45,bA,-.9,4.05,3.2),l2=b(.45,.4,.45,bB,.9,4.05,3.2);
  g.userData={bA,bB,spray};
  g.scale.setScalar(1.15);
  return g;
}
function hazardsRomele(H){
  const P=ROMELE_PLOW, PER=24, PH=6;
  /* timeline inside one period: plough on the road .06-.52, squall .62-.90 */
  const plough=romelePlough();world.add(plough);
  const PL={lat:P.side*HW*0.5};
  let lastHorn=-9,hornCount=0;
  H.push({id:'plog',period:PER,phase:PH,mesh:plough,
    update(u,dt){
      let s,lat,vis=true;
      if(u<0.04||u>0.6)vis=false;
      if(u<0.12){const t=smooth(0.04,0.12,u);s=lerp(P.from+6,P.from,t);lat=lerp(P.side*(HW+24),PL.lat,t);}
      else if(u<0.5){const t=(u-0.12)/0.38;s=lerp(P.from,P.to,t);lat=PL.lat;}
      else{const t=smooth(0.5,0.6,u);s=lerp(P.to,P.to-8,t);lat=lerp(PL.lat,P.side*(HW+24),t);}
      const q=romeleRoadPt(s,lat);
      const gy=Math.abs(lat)<HW+1?q.y:Math.max(meshY(q.x,q.z),q.y-1);
      const ox=plough.position.x,oz=plough.position.z;
      plough.position.set(q.x,gy,q.z);plough.visible=vis;
      const mx=q.x-ox,mz=q.z-oz;
      if(mx*mx+mz*mz>1e-4&&mx*mx+mz*mz<9)plough.rotation.y=Math.atan2(mx,mz);
      this.p={x:q.x,y:q.y,z:q.z,yaw:plough.rotation.y,on:vis&&u>0.07&&u<0.56,i:q.i};
      const on=Math.floor(clock*4)%2===0,U2=plough.userData;
      U2.bA.uniforms.uColor.value.setHex(on?0xffb030:0x5a3008);U2.bB.uniforms.uColor.value.setHex(on?0x5a3008:0xffb030);
      U2.spray.scale.y=.6+Math.abs(Math.sin(clock*9))*.4;
      if(vis&&this.p.on&&Math.random()<0.5){const sd=Math.sin(plough.rotation.y+1.57),cd=Math.cos(plough.rotation.y+1.57);
        puff(q.x+Math.sin(plough.rotation.y)*6+sd*4,q.y+1.5,q.z+Math.cos(plough.rotation.y)*6+cd*4,.95,.97,1,.7);}
      /* loud: a deep two-tone horn when it pulls out, and again as it bears down on you */
      if(state==='race'&&vis&&player){
        const d=Math.hypot(player.x-q.x,player.z-q.z);
        if(u<0.13&&hornCount===0&&d<220){hornCount=1;ping(150,146,.5);setTimeout(()=>ping(118,115,.6),520);
          if(d<160)toast('PLOGBILEN KOMMER!');}
        if(this.p.on&&d<70&&clock-lastHorn>3){lastHorn=clock;ping(140,136,.55);setTimeout(()=>ping(112,110,.6),560);}
      }
      if(u>0.62)hornCount=0;
    },
    hit(k){const p=this.p;if(!p||!p.on||k.rib||k.air)return false;
      const dx=k.x-p.x,dz=k.z-p.z,f=dx*Math.sin(p.yaw)+dz*Math.cos(p.yaw),l=dx*Math.cos(p.yaw)-dz*Math.sin(p.yaw);
      return Math.abs(f)<6.6&&Math.abs(l)<3.9&&Math.abs(k.y-p.y)<3;},
    effect(k){
      const p=this.p,i=p.i,kl=(k.x-sx[i])*rx[i]+(k.z-sz[i])*rz[i],push=-P.side;   /* always shoved to the clear side */
      const target=PL.lat+push*5.0;
      if((kl-target)*push<0){k.x+=rx[i]*(target-kl);k.z+=rz[i]*(target-kl);}
      const vf=k.vx*fx[i]+k.vz*fz[i];
      k.vx=fx[i]*vf*0.45+rx[i]*push*9;k.vz=fz[i]*vf*0.45+rz[i]*push*9;
      k.slow=Math.max(k.slow,0.9);k.boost=0;k.drift=0;k.charge=0;
      for(let n=0;n<14;n++)puff(k.x+rand(-1.5,1.5),k.y+rand(.3,2),k.z+rand(-1.5,1.5),.95,.97,1,.7);
      if(k===player){toast('SNÖPLOGEN!');ping(160,70,.35);shake=Math.min(1,shake+.6);}
    }});
  /* snow squalls: the fog closes right in for a few seconds, then lifts again */
  const base={n:stage.fog[1],f:stage.fog[2],lo:new THREE.Color(stage.sky[0]),hi:new THREE.Color(stage.sky[1])},fogC=new THREE.Color(stage.fog[0]);
  const FL=900,fpos=new Float32Array(FL*3);
  for(let n=0;n<FL;n++){fpos[n*3]=rand(-40,40);fpos[n*3+1]=rand(-6,26);fpos[n*3+2]=rand(-40,40);}
  const fgeo=new THREE.BufferGeometry();fgeo.setAttribute('position',new THREE.BufferAttribute(fpos,3));
  const fmat=new THREE.PointsMaterial({color:0xffffff,size:.32,sizeAttenuation:true,transparent:true,opacity:.9,depthWrite:false});
  const flakes=new THREE.Points(fgeo,fmat);flakes.frustumCulled=false;world.add(flakes);
  let warned=false;
  H.push({id:'snöby',period:PER,phase:PH,mesh:flakes,
    update(u,dt){
      const g=smooth(0.60,0.66,u)*(1-smooth(0.86,0.92,u));
      U.fogNear.value=lerp(base.n,3,g);U.fogFar.value=lerp(base.f,46,g);
      skyMat.uniforms.uLow.value.copy(base.lo).lerp(fogC,g);skyMat.uniforms.uHigh.value.copy(base.hi).lerp(fogC,g);
      if(state==='race'&&u>0.58&&u<0.6&&!warned){warned=true;toast('SNÖBYGEL!');ping(260,90,.7);}
      if(u>0.7)warned=false;
      /* flakes: always a few, a blizzard in the squall, blown sideways */
      const c=camera.position,wind=4+g*22,fall=2.2+g*3,step=Math.min(dt||0,0.1);
      fmat.size=.3+g*.25;fmat.opacity=.55+g*.4;
      for(let n=0;n<FL;n++){
        let x=fpos[n*3]+wind*step*(0.7+0.3*((n%7)/7)),y=fpos[n*3+1]-fall*step*(0.8+0.4*((n%5)/5)),z=fpos[n*3+2]+wind*0.35*step;
        x=c.x+((((x-c.x+40)%80)+80)%80)-40;z=c.z+((((z-c.z+40)%80)+80)%80)-40;
        if(y<c.y-8)y+=34;else if(y>c.y+28)y-=34;
        if((x-c.x)*(x-c.x)+(z-c.z)*(z-c.z)<16&&Math.abs(y-c.y)<4)x+=(x>c.x?6:-6);   /* never right in the lens */
        fpos[n*3]=x;fpos[n*3+1]=y;fpos[n*3+2]=z;
      }
      fgeo.attributes.position.needsUpdate=true;
    }});
  /* the ice creaks under you; the tow lift runs; chimneys smoke; hazard lights blink; people dig */
  let creakT=0,iceToast=false;
  H.push({id:'romeleLiv',period:1,phase:0,
    update(u,dt){
      if(player&&state==='race'&&player.sfx==='ice'&&!player.air){
        if(!iceToast){iceToast=true;toast('ISEN BÄR… NOG');}
        creakT-=dt||0;if(creakT<=0){creakT=rand(.6,1.6);ping(rand(1400,2200),rand(300,600),.22);}
      }else if(player&&player.sfx!=='ice')iceToast=false;
      for(const a of stage.romeleAnim||[]){
        if(a.k==='smoke'){const t=(clock*.3+a.ph)%1;a.m.position.y=7.2+t*3;a.m.scale.setScalar(.8+t*1.2);}
        else if(a.k==='blink')a.m.uniforms.uColor.value.setHex(Math.floor(clock*2.4+a.ph*2)%2?0xff9a1a:0x5a3008);
        else if(a.k==='dig'&&a.g.userData.arm)a.g.userData.arm.rotation.x=Math.max(0,Math.sin(clock*3.2+a.ph))*.9-.3;
        else if(a.k==='flag')a.m.rotation.y=Math.sin(clock*2.3)*.25;
        else if(a.k==='lift'){
          const T=a.tops,m4=new THREE.Matrix4(),n=T.length-1;let c=0;
          for(const dir of [1,-1])for(let k=0;k<8;k++){
            let f=((clock*.035*dir+k/8)%1+1)%1,seg=Math.min(n-1,Math.floor(f*n)),t=f*n-seg;
            const p=T[seg].clone().lerp(T[seg+1],t),yaw=Math.atan2(T[n].x-T[0].x,T[n].z-T[0].z);
            p.x+=Math.cos(yaw)*1.4*dir;p.z-=Math.sin(yaw)*1.4*dir;
            m4.makeRotationY(yaw+Math.PI/2);m4.setPosition(p);a.bars.setMatrixAt(c,m4);a.rods.setMatrixAt(c,m4);c++;
          }
          a.bars.instanceMatrix.needsUpdate=a.rods.instanceMatrix.needsUpdate=true;
        }
      }
    }});
}
