"use strict";
/* ───────── Raket-Runes runda ───────── */
/* Rocket Racer Run's counterpart, the championship final: a climb past a twisting tower, a split-ring gate a rocket opens */
GROUND.runehamn={cell:30,stripe:0.9,verge:0x8a8780,
  cols:[0x7d7a74,0x8a867e,0x6f6c66,0x938e84,0x5d7a4c,0x7a7068,0x86827a,0x6e8a52]};
/* the sculpture park's paving: quick enough, but the joints rattle the kart about */
SURF.runeplaza={top:o=>o+(1-o)*0.72,grip:o=>1-0.30*(1-o),fuel:1.05,name:'STENPLATTOR'};
SFX.runeplaza={dust:null,noise:{f:900,g:.022},rattle:true};
/* 0 on the quays, 1 out on the water: the Sound to the south and west, a bay and the marina */
function runeSea(x,z){
  const box=(x0,x1,z0,z1,e)=>Math.min(smooth(x0,x0+e,x),smooth(x1,x1-e,x),smooth(z0,z0+e,z),smooth(z1,z1-e,z));
  return Math.max(smooth(90,104,z),smooth(-182,-194,x)*smooth(28,40,z),smooth(-246,-258,x),
    box(-160,-88,-118,-60,5));
}
const runeY0=(x,z)=>-6*runeSea(x,z);
/* the dusk deepens as the race goes on: 0 at the start, 1 by the last lap */
const runeDusk=()=>0.12+0.88*smooth(0,150,typeof raceTime==='number'?raceTime:0);

STAGES.push({ id:'rune', group:'final', name:'RAKET-RUNES RUNDA', sub:'FINALEN',
  order:18, tag:'Raket-Runes egen bana i Malmö hamn, uppför spiralen förbi det vridna tornet. Finalen.',
  view:{i:110,lat:0,h:6,to:{x:126,z:-28,h:40},fov:60},
  hw:8.6,
  bars:[0.95,0.75,1.00], laps:3,
  blurb:'The championship final, round Malmö\'s western harbour at sunset. The road climbs a switchback ramp beside the twisting tower, dives back down to the waterfront and flies out over the water on a bridge deck while the city lights come on. A split steel ring in the sculpture park hides a shortcut that only a rocket opens, and a container crane drags its load across the quay road.',
  role:'Finalen: rampen upp längs tornet, bron över vattnet och Raket-Rune själv.',
  sky:[0xf6a35a,0x34407e], fog:[0xc98f78,90,520], amb:0x6a6278, dif:0xffc89a,
  road:'asphalt', verge:'kerb', edge:'rail', ground:'runehamn', terrain:{size:900,seg:84},
  jumpSpec:[{h:4.2,drop:3.0,up:13,dn:7,rec:20},{h:3.4,drop:2.6,up:12,dn:7,rec:18},{h:2.8,drop:2.0,up:10,dn:6,rec:15}],
  ctrl:[[-129,2,-148],[-34,2,-151],[60,2,-151],[129,4,-131],[165,8,-83],[170,14,-26],[165,20,28],
        [146,24,65],[110,26,76],[84,28,50],[83,32,-3],[88,36,-53],[72,38,-95],[26,37,-101],
        [-26,33,-86],[-53,27,-45],[-50,20,5],[-29,14,45],[-48,9,83],[-95,7,112],[-150,8,120],
        [-196,8,89],[-215,7,38],[-206,5,-17],[-205,3,-77],[-185,2,-129]],
  stations:[[0.1,-1],[0.52,-1]],
  /* the quays are flat; where the road is up on its ramp the ground stays down under it */
  mod:(x,z,t)=>{
    const i=nearestGlobal(x,z),lat=Math.abs((x-sx[i])*rx[i]+(z-sz[i])*rz[i]),y0=runeY0(x,z);
    const w=Math.max(smooth(2.5,5.5,sy[i]-y0),smooth(HW+3,HW+14,lat));
    return w?w*(y0-groundAt(x,z,i)+DIP*(1-t)):0;
  },
  land:(x,z,out)=>{
    const s=runeSea(x,z);
    if(s>0.55)out.setHex(0x22384a);                          /* the seabed, under the water */
    else if(s>0.04)out.setHex(0x5a5853);                     /* granite quay edge */
    else if(nearAlt(x,z,22))out.setHex(hash2(Math.floor(x/9),Math.floor(z/9))>0.5?0x5f8a46:0x6a9550);  /* the park mound */
  },
  routes:[
    {id:'ringen',name:'SKULPTURPARKEN',a:480,b:612,hw:4.2,side:1,lead:9,leadLat:10,
     mid:[[0.3,9],[0.55,-6],[0.8,4]],surface:'runeplaza',risk:0.35,hidden:true,shoot:true,
     blurb:'Through the sculpture park on the hill instead of out over the water. A split steel ring stands closed in the way in.',
     blockMesh:(R,j)=>runeRingGate(R,j),
     blockAnim:(B,d)=>{const H=B.mesh.userData.halves;if(!H)return;
       H[0].rotation.y=d*1.85;H[1].rotation.y=-d*1.85;
       B.mesh.userData.seam.visible=d<0.05;}}],
  stamps:[
    {id:'run1',dish:'Falafel',ini:'F',kind:'intro',route:'main',i:40,lat:-6.2,
     hint:'Vid falafelkiosken på kajen, strax efter starten.',
     story:'Malmö is the falafel city: a pocket bread stuffed with fried chickpea balls, salad, pickled things and two sauces, garlic and chilli, from a kiosk that is open whenever you are hungry. Locals argue about the best one the way other towns argue about football.'},
    {id:'run2',dish:'Wienerbröd',ini:'W',kind:'route',route:'ringen',f:0.5,lat:0,
     hint:'Mitt i skulpturparken. Ringen är stängd: kanske en spettekaka?',
     story:'Across the bridge they call it Danish pastry and on this side Vienna bread, and Malmö\'s bakeries make it the Copenhagen way: layer on layer of butter dough, a spoon of vanilla custard or almond paste in the middle and white icing over the top, eaten with coffee in the sun.'},
    {id:'run3',dish:'Räkmacka',ini:'R',kind:'air',route:'main',jump:0,after:5,lat:0,air:4.6,
     hint:'Högt i luften över det största hoppet.',
     story:'The harbour café sandwich: a slice of bread, butter, lettuce, a boiled egg and a mountain of freshly peeled prawns with mayonnaise, dill and a wedge of lemon. You eat it on the quay with the bridge in the haze and the gulls watching every bite.'}],
  hazards:H=>hazardsRune(H), scenery:()=>sceneryRune()
});

/** the split steel ring at the mouth of the sculpture park: two half discs that swing open */
function runeRingGate(R,j){
  const g=new THREE.Group(),inner=new THREE.Group();
  inner.rotation.y=Math.atan2(R.FX[j],R.FZ[j]);g.add(inner);
  const rust=psMat({color:0x9a4a26}),steel=psMat({color:0xc8ccd0}),dark=psMat({color:0x3a3c40});
  const r=4.3,cy=5.0;
  const plinth=new THREE.Mesh(flat(new THREE.BoxGeometry(10.4,.8,3.2)),dark);plinth.position.y=.1;inner.add(plinth);
  const halves=[];
  for(const sg of [1,-1]){                            /* sg=+1 the half on local +x */
    const piv=new THREE.Group();piv.position.set(sg*r,0,0);inner.add(piv);
    const dg=new THREE.CylinderGeometry(r,r,.9,14,1,false,sg>0?0:Math.PI,Math.PI);dg.rotateX(Math.PI/2);
    const disc=new THREE.Mesh(flat(dg),rust);disc.position.set(-sg*r,cy,0);piv.add(disc);
    const tg=new THREE.TorusGeometry(r,.42,4,10,Math.PI);tg.rotateZ(sg>0?-Math.PI/2:Math.PI/2);
    const rim=new THREE.Mesh(flat(tg),steel);rim.position.set(-sg*r,cy,0);piv.add(rim);
    const foot=new THREE.Mesh(flat(new THREE.BoxGeometry(.9,1.2,1.2)),steel);foot.position.set(-sg*1.2,.6,0);piv.add(foot);
    halves.push(piv);
  }
  const seam=new THREE.Mesh(flat(new THREE.BoxGeometry(.18,r*2,1.0)),psMat({color:0xffe08a,unlit:true}));
  seam.position.set(0,cy,0);inner.add(seam);
  g.userData.halves=halves;g.userData.seam=seam;
  return g;
}

function sceneryRune(){
  const m4=new THREE.Matrix4(),q=new THREE.Quaternion(),e=new THREE.Euler(),
        p=new THREE.Vector3(),sc=new THREE.Vector3(),one=new THREE.Vector3(1,1,1);
  const conc=psMat({color:0xa49e94,side:THREE.DoubleSide}),concD=psMat({color:0x5e5a56,side:THREE.DoubleSide}),
        steel=psMat({color:0x8e959b}),white=psMat({color:0xeeeeea}),dark=psMat({color:0x2a2c30});
  const IM=(geo,mat,n)=>{const m=new THREE.InstancedMesh(geo,mat,n);m.frustumCulled=false;return m;};
  const done=(...ms)=>ms.forEach(m=>{m.instanceMatrix.needsUpdate=true;if(m.instanceColor)m.instanceColor.needsUpdate=true;world.add(m);});
  const RUNE=stage.rune={};                            /* things the visual hazards animate */
  /* ── the sea and the sun going down behind the bridge ── */
  const sea=new THREE.Mesh(new THREE.PlaneGeometry(3200,3200).rotateX(-Math.PI/2),psMat({color:0x2c4a6c,unlit:true}));
  sea.position.y=-2.2;world.add(sea);
  const glit=new THREE.Mesh(new THREE.PlaneGeometry(60,900).rotateX(-Math.PI/2),
    psMat({color:0xf0a060,unlit:true,transparent:true,opacity:.28,depthWrite:false}));
  const SD=new THREE.Vector3(-0.54,0,0.84).normalize();
  glit.position.set(SD.x*520,-2.1,SD.z*520);glit.rotation.y=Math.atan2(SD.x,SD.z);world.add(glit);
  const sun=new THREE.Mesh(new THREE.CircleGeometry(38,16),new THREE.MeshBasicMaterial({color:0xffb050}));
  world.add(sun);RUNE.sun=sun;RUNE.SD=SD;
  /* ── the bridge to Denmark, a silhouette on the horizon with its lights ── */
  const sil=new THREE.MeshBasicMaterial({color:0x4a3a58}),sil2=new THREE.MeshBasicMaterial({color:0x3a2e48});
  const bA=new THREE.Vector3(-1000,0,300),bB=new THREE.Vector3(-250,0,1050),bd=bB.clone().sub(bA),bl=bd.length();
  const bridge=new THREE.Group();bridge.position.copy(bA);bridge.rotation.y=Math.atan2(bd.x,bd.z);world.add(bridge);
  const prof=f=>5+18*Math.exp(-Math.pow((f-0.45)/0.1,2));       /* the deck rises to the main span */
  for(let k=0;k<20;k++){
    const f0=k/20,f1=(k+1)/20,y0=prof(f0),y1=prof(f1),L=bl/20;
    const d=new THREE.Mesh(new THREE.BoxGeometry(4,1.8,L*1.02),sil);
    d.position.set(0,(y0+y1)/2,(f0+f1)/2*bl);d.rotation.x=-Math.atan2(y1-y0,L);bridge.add(d);
    const pier=new THREE.Mesh(new THREE.BoxGeometry(2.4,y0+2,2.4),sil2);pier.position.set(0,y0/2-1,f0*bl);bridge.add(pier);
  }
  const lightsB=[];
  for(const f of [0.4,0.5]){
    const pz=f*bl,yd=prof(f);
    for(const sg of [-1,1]){
      const py=new THREE.Mesh(new THREE.BoxGeometry(2.4,72,2.4),sil2);py.position.set(sg*3.5,34,pz);bridge.add(py);
      for(let k=1;k<=4;k++)for(const dir of [-1,1]){            /* the cable fans */
        const a=new THREE.Vector3(sg*3.5,68-k*5,pz),b=new THREE.Vector3(sg*2.5,prof((pz+dir*k*12)/bl)+.5,pz+dir*k*12);
        const c=new THREE.Mesh(new THREE.BoxGeometry(.35,.35,a.distanceTo(b)),sil);c.position.copy(a).add(b).multiplyScalar(.5);
        c.quaternion.setFromUnitVectors(new THREE.Vector3(0,0,1),b.clone().sub(a).normalize());bridge.add(c);
      }
      const top=new THREE.Mesh(new THREE.BoxGeometry(1.6,1.6,1.6),new THREE.MeshBasicMaterial({color:0xff3020}));
      top.position.set(sg*3.5,71,pz);bridge.add(top);lightsB.push(top);
    }
  }
  const bl2=new THREE.MeshBasicMaterial({color:0xffd27a});
  for(let k=0;k<50;k++){const f=k/50,lm=new THREE.Mesh(new THREE.BoxGeometry(1.2,1.2,1.2),bl2);
    lm.position.set(2.4,prof(f)+1.8,f*bl);bridge.add(lm);}
  bridge.traverse(o=>o.renderOrder=1);sun.renderOrder=1;   /* drawn after the sky dome, which writes no depth */
  RUNE.bridgeLights=lightsB;RUNE.bridgeDeckLight=bl2;
  /* ── the road up on its deck: fascia, soffit, walkway and piers ── */
  const E=HW+4.4;
  sweep(0,N,-E,-.12,-HW-2.5,-.12,conc);sweep(0,N,HW+2.5,-.12,E,-.12,conc);
  sweep(0,N,-E,-.12,-E,-1.6,conc);sweep(0,N,E,-.12,E,-1.6,conc);
  sweep(0,N,-E,-1.6,E,-1.6,concD);
  const pierM=IM(flat(new THREE.BoxGeometry(1,1,1)),conc,Math.ceil(N/9)*3+60);
  let pc=0;
  const pier=(x,z,yTop,yaw,w,d)=>{const yb=runeY0(x,z)-1.5,h=yTop-yb;if(h<2.5||pc>=pierM.count)return;
    p.set(x,yb+h/2,z);e.set(0,yaw,0);q.setFromEuler(e);sc.set(w,h,d);m4.compose(p,q,sc);pierM.setMatrixAt(pc++,m4);};
  for(let i=0;i<N;i+=9){
    const yaw=Math.atan2(fx[i],fz[i]);
    if(sy[i]-runeY0(sx[i],sz[i])<4)continue;
    for(const sg of [-1,1]){const o=sg*(HW-2);pier(sx[i]+rx[i]*o,sz[i]+rz[i]*o,sy[i]+o*bank[i]-1.6,yaw,2.6,2.2);}
    if(pc<pierM.count-1){p.set(sx[i],sy[i]-2.3,sz[i]);e.set(0,yaw,0);q.setFromEuler(e);sc.set(2*E-1,1.4,2.2);
      m4.compose(p,q,sc);pierM.setMatrixAt(pc++,m4);}
  }
  /* a petrol station up on the ramp gets its own platform */
  for(const S of stations){
    const i=S.at;if(sy[i]-runeY0(sx[i],sz[i])<4)continue;
    const a=S.at-2,b=S.at+S.len+4,sg=S.side;
    sweep(a,b,sg*E,-.3,sg*(HW+21),-.3,conc);sweep(a,b,sg*E,-1.6,sg*(HW+21),-1.6,concD);
    sweep(a,b,sg*(HW+21),-.3,sg*(HW+21),-1.6,conc);
    for(let k=a;k<=b;k+=5){const ii=(k+N)%N,o=sg*(HW+18);
      pier(sx[ii]+rx[ii]*o,sz[ii]+rz[ii]*o,sy[ii]-1.6,Math.atan2(fx[ii],fz[ii]),2.2,2.2);}
  }
  pierM.count=pc;done(pierM);
  /* ── street lamps on the deck edge; they light up in three waves as the dusk comes ── */
  const poleM=IM(flat(new THREE.CylinderGeometry(.13,.18,7.4,5)),dark,Math.ceil(N/14)*2);
  const armM=IM(flat(new THREE.BoxGeometry(.16,.16,2.2)),dark,Math.ceil(N/14)*2);
  const lampMats=[0,1,2].map(()=>psMat({color:0x4a4640,unlit:true}));
  const heads=lampMats.map(m=>IM(flat(new THREE.BoxGeometry(.7,.35,1.1)),m,Math.ceil(N/14)*2));
  const hc=[0,0,0];let lc=0,ac=0;
  for(let i=4,n=0;i<N;i+=14,n++)for(const sg of [-1,1]){
    if(sg>0&&n%2)continue;                             /* staggered, one side or both */
    const o=sg*(HW+4.15),x=sx[i]+rx[i]*o,z=sz[i]+rz[i]*o,y=sy[i]+o*bank[i];
    if(stations.some(S=>{let d=i-S.at;if(d<-N/2)d+=N;if(d>N/2)d-=N;return d>-4&&d<S.len+6&&sg===S.side;}))continue;
    const yaw=Math.atan2(fx[i],fz[i]);e.set(0,yaw,0);q.setFromEuler(e);
    p.set(x,y+3.6,z);m4.compose(p,q,one);poleM.setMatrixAt(lc++,m4);
    const ax=-rx[i]*sg,az=-rz[i]*sg;                    /* the arm reaches out over the road */
    e.set(0,Math.atan2(ax,az),0);q.setFromEuler(e);
    p.set(x+ax*1.0,y+7.2,z+az*1.0);m4.compose(p,q,one);armM.setMatrixAt(ac,m4);
    p.set(x+ax*2.0,y+7.0,z+az*2.0);m4.compose(p,q,one);const g=(n*7+(sg>0?1:0))%3;heads[g].setMatrixAt(hc[g]++,m4);ac++;
  }
  poleM.count=lc;armM.count=ac;heads.forEach((h,k)=>h.count=hc[k]);done(poleM,armM,...heads);
  RUNE.lampMats=lampMats;
  /* ── the twisting tower: nine white cubes stacked and turned, round a concrete spine ── */
  const TC={x:126,z:-28},cubes=9,CW=13,CH=11.6;
  const winTex=pixTex(32,32,(g)=>{g.fillStyle='#e8e6e0';g.fillRect(0,0,32,32);
    g.fillStyle='#5a6878';for(let r=0;r<5;r++)for(let c=0;c<6;c++)g.fillRect(1+c*5+((r%2)?1:0),1+r*6+1,3,3);});
  const litTex=pixTex(32,32,(g)=>{g.clearRect(0,0,32,32);
    for(let r=0;r<5;r++)for(let c=0;c<6;c++)if(hash2(r*7+c,3.3)>0.35){g.fillStyle=hash2(c,r)>.5?'#ffd890':'#fff0c8';g.fillRect(1+c*5+((r%2)?1:0),1+r*6+1,3,3);}});
  const cubeM=psMat({map:winTex});
  const tower=new THREE.Group();tower.position.set(TC.x,0,TC.z);world.add(tower);
  const core=new THREE.Mesh(flat(new THREE.CylinderGeometry(4.2,4.6,cubes*(CH+.8)+4,8)),psMat({color:0xcfcac0}));
  core.position.y=(cubes*(CH+.8)+4)/2;tower.add(core);
  RUNE.cubeLit=[];
  const spine=[];
  for(let k=0;k<cubes;k++){
    const a=k*Math.PI/2/(cubes-1),y=2+k*(CH+.8)+CH/2;
    const c=new THREE.Mesh(flat(new THREE.BoxGeometry(CW,CH,CW)),cubeM);
    c.position.set(Math.cos(a)*1.5,y,Math.sin(a)*1.5);c.rotation.y=-a;tower.add(c);
    const lm=psMat({map:litTex,unlit:true,alphaTest:.5});
    const l=new THREE.Mesh(new THREE.BoxGeometry(CW+.12,CH+.05,CW+.12),lm);
    l.position.copy(c.position);l.rotation.y=c.rotation.y;tower.add(l);
    RUNE.cubeLit.push({mesh:l,at:hash2(k,9.1)});
    const slab=new THREE.Mesh(flat(new THREE.BoxGeometry(CW+.5,.8,CW+.5)),white);slab.position.set(c.position.x,y-CH/2-.4,c.position.z);slab.rotation.y=-a;tower.add(slab);
    const sa=-a+Math.PI*0.75;                          /* the steel spine on one corner, turning with it */
    spine.push(new THREE.Vector3(TC.x+Math.cos(sa)*12.2,y-CH/2,TC.z+Math.sin(sa)*12.2));
    spine.push(new THREE.Vector3(TC.x+Math.cos(sa)*12.2,y+CH/2,TC.z+Math.sin(sa)*12.2));
  }
  for(let k=0;k+1<spine.length;k++)strut(spine[k],spine[k+1],.9,steel);
  for(let k=0;k+3<spine.length;k+=2){                  /* cross bracing back to the cubes */
    const c=spine[k+1].clone().lerp(new THREE.Vector3(TC.x,spine[k+1].y,TC.z),.45);
    strut(spine[k],c,.45,steel);strut(c,spine[k+3],.45,steel);
  }
  const mast=new THREE.Mesh(flat(new THREE.CylinderGeometry(.25,.4,10,4)),steel);mast.position.y=cubes*(CH+.8)+9;tower.add(mast);
  const beacon=new THREE.Mesh(new THREE.BoxGeometry(1.2,1.2,1.2),psMat({color:0xff2a1a,unlit:true}));
  beacon.position.y=cubes*(CH+.8)+14.6;tower.add(beacon);RUNE.beacon=beacon;
  /* the spiral ramp wound round the foot of the tower: scenery, nobody drives it */
  {
    const turns=2.25,steps=110,r0=11.4,r1=16.4,h0=1.2,h1=36,pos=[],idx=[];
    for(let s=0;s<=steps;s++){const t=s/steps,a=t*turns*6.283,y=h0+(h1-h0)*t;
      pos.push(TC.x+Math.cos(a)*r0,y,TC.z+Math.sin(a)*r0, TC.x+Math.cos(a)*r1,y,TC.z+Math.sin(a)*r1);}
    for(let s=0;s<steps;s++){const a=2*s;idx.push(a,a+1,a+2,a+1,a+3,a+2);}
    const hg=new THREE.BufferGeometry();hg.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));hg.setIndex(idx);
    world.add(new THREE.Mesh(flat(hg),psMat({color:0xb8b2a8,side:THREE.DoubleSide})));
    const hr=psMat({color:0xd8362a});
    const posts=IM(flat(new THREE.CylinderGeometry(.35,.35,1,5)),concD,40),bulbs=IM(flat(new THREE.BoxGeometry(.5,.5,.5)),psMat({color:0xffd890,unlit:true}),110);
    let a2=0,b2=0;
    for(let s=0;s<=steps;s++){const t=s/steps,a=t*turns*6.283,y=h0+(h1-h0)*t;
      if(s%2===0){p.set(TC.x+Math.cos(a)*(r1+.1),y+.6,TC.z+Math.sin(a)*(r1+.1));m4.compose(p,q.identity(),one);bulbs.setMatrixAt(b2++,m4);}
      if(s%6===3&&y>3){p.set(TC.x+Math.cos(a)*(r0+r1)/2,y/2,TC.z+Math.sin(a)*(r0+r1)/2);sc.set(1,y,1);m4.compose(p,q.identity(),sc);posts.setMatrixAt(a2++,m4);}
    }
    posts.count=a2;bulbs.count=b2;done(posts,bulbs);
    const lip=[];for(let s=0;s<=steps;s+=2){const t=s/steps,a=t*turns*6.283,y=h0+(h1-h0)*t;lip.push(new THREE.Vector3(TC.x+Math.cos(a)*r1,y+.5,TC.z+Math.sin(a)*r1));}
    for(let k=0;k+1<lip.length;k++)strut(lip[k],lip[k+1],.3,hr);
  }
  /* ── the old shipyard crane straddling its dock to the north ── */
  {
    const yel=psMat({color:0xc9b48a}),cg=new THREE.Group();
    const span=110,H=62;
    for(const sx2 of [-span/2,span/2])for(const sz2 of [-7,7]){
      const leg=new THREE.Mesh(flat(new THREE.BoxGeometry(3,H,3)),yel);leg.position.set(sx2,H/2,sz2);cg.add(leg);
    }
    for(const sx2 of [-span/2,span/2]){const b=new THREE.Mesh(flat(new THREE.BoxGeometry(4,4,18)),yel);b.position.set(sx2,H-2,0);cg.add(b);}
    const girder=new THREE.Mesh(flat(new THREE.BoxGeometry(span+16,7,12)),yel);girder.position.y=H+3.5;cg.add(girder);
    const cab=new THREE.Mesh(flat(new THREE.BoxGeometry(8,6,10)),psMat({color:0x8a8478}));cab.position.set(14,H-4,0);cg.add(cab);
    const capt=pixTex(64,16,(g)=>{g.fillStyle='#c9b48a';g.fillRect(0,0,64,16);g.fillStyle='#3a3428';
      for(let k=0;k<8;k++)g.fillRect(k*8+2,4,4,8);});
    for(const sg of [-1,1]){const pl=new THREE.Mesh(new THREE.PlaneGeometry(span+16,7),psMat({map:capt}));
      pl.position.set(0,H+3.5,sg*6.05);if(sg<0)pl.rotation.y=Math.PI;cg.add(pl);}
    for(const sx2 of [-30,30]){const w=new THREE.Mesh(new THREE.BoxGeometry(1.4,1.4,1.4),psMat({color:0xff3020,unlit:true}));w.position.set(sx2,H+7.6,0);cg.add(w);}
    cg.position.set(30,0,-262);world.add(cg);
    const dock=new THREE.Mesh(new THREE.PlaneGeometry(90,26).rotateX(-Math.PI/2),psMat({color:0x2c4a6c,unlit:true}));
    dock.position.set(30,.15,-262);world.add(dock);
  }
  /* ── containers stacked on the quays ── */
  const cTex=pixTex(16,16,(g)=>{g.fillStyle='#fff';g.fillRect(0,0,16,16);g.fillStyle='rgba(0,0,0,.28)';for(let x=1;x<16;x+=3)g.fillRect(x,0,1,16);
    g.fillStyle='rgba(0,0,0,.4)';g.fillRect(0,0,16,1);g.fillRect(0,15,16,1);});
  const CCOL=[0xb8382a,0x2f6aa8,0x2f8a5a,0xd8a030,0x8a8a86,0x6a3a8a,0xd86a2a,0x2a7a8a];
  const cont=IM(new THREE.BoxGeometry(2.5,2.6,6.1),psMat({map:cTex}),520);
  let cc=0;const col=new THREE.Color();
  const stack=(x,z,yaw,hgt,seed)=>{
    for(let lv=0;lv<hgt&&cc<cont.count;lv++){
      p.set(x,runeY0(x,z)+1.3+lv*2.6,z);e.set(0,yaw,0);q.setFromEuler(e);m4.compose(p,q,one);
      cont.setMatrixAt(cc,m4);cont.setColorAt(cc,col.setHex(CCOL[Math.floor(hash2(seed,lv)*CCOL.length)]));cc++;}
  };
  const clearOf=(x,z,pad)=>runeSea(x,z)<0.01&&latAt(x,z)>HW+pad&&Math.hypot(x-TC.x,z-TC.z)>30&&
    !stations.some(S=>{const i=(S.at+6)%N,o=S.side*(HW+14);return Math.hypot(x-sx[i]-rx[i]*o,z-sz[i]-rz[i]*o)<26;});
  /* yards: blocks of stacks in rows, set square to the quay */
  for(const [x0,z0,w,d,yaw] of [[-150,-200,120,30,0],[60,-215,90,24,0],[180,-200,70,40,0],[205,-130,40,110,Math.PI/2],
                                 [-235,-150,20,60,Math.PI/2],[-30,-40,50,40,Math.PI/2],[-140,-40,60,50,0]]){
    for(let gx=0;gx<w;gx+=(yaw?7.2:3.2))for(let gz=0;gz<d;gz+=(yaw?3.2:7.2)){
      const x=x0+gx,z=z0+gz,hs=hash2(Math.floor(x/12),Math.floor(z/10));
      if(hs<0.22||!clearOf(x,z,9))continue;
      stack(x,z,yaw,1+Math.floor(hash2(x,z)*3.6),x*3+z);
    }
  }
  cont.count=cc;done(cont);
  /* ── harbour homes and offices of the new district: white blocks, wood, big windows ── */
  const flatTex=pixTex(32,32,(g)=>{g.fillStyle='#fff';g.fillRect(0,0,32,32);g.fillStyle='#3a4250';
    for(let r=0;r<4;r++)for(let c=0;c<4;c++)g.fillRect(2+c*8,3+r*8,5,4);
    g.fillStyle='#ffd890';for(let r=0;r<4;r++)for(let c=0;c<4;c++)if(hash2(r,c*3)>.6)g.fillRect(2+c*8,3+r*8,5,4);});
  flatTex.wrapS=flatTex.wrapT=THREE.RepeatWrapping;
  const blocks=[];
  for(const [x,z,w,d,h,c] of [[10,30,26,16,22,0xeae6dc],[20,-10,18,28,16,0xc89a6a],[40,62,30,14,18,0xd8dce0],
                              [-10,-58,22,14,14,0xeae6dc],[230,-40,24,40,24,0xd8dce0],[232,30,30,20,18,0xc89a6a],
                              [215,-170,26,18,16,0xeae6dc],[-110,-200,30,16,14,0xb0705a],[-60,-205,24,16,20,0xd8dce0],
                              [-150,30,22,14,12,0xeae6dc],[-120,-25,16,24,16,0xc89a6a],[ -95,70,18,14,10,0xd8dce0]]){
    if(!clearOf(x,z,Math.max(w,d)/2+6))continue;
    const geo=new THREE.BoxGeometry(w,h,d);
    const uv=geo.attributes.uv;for(let k=0;k<uv.count;k++){                        /* windows tile per 4 m */
      const f=Math.floor(k/4),u=uv.getX(k),v=uv.getY(k);
      const W=(f<2)?d:w,Hh=(f===2||f===3)?d:h;uv.setXY(k,u*W/8,v*Hh/8);}
    const m=new THREE.Mesh(geo,psMat({map:flatTex,color:c}));m.position.set(x,h/2,z);world.add(m);
    const roof=new THREE.Mesh(flat(new THREE.BoxGeometry(w+.6,.6,d+.6)),dark);roof.position.set(x,h+.3,z);world.add(roof);
    blocks.push(m);
  }
  /* ── the marina: pontoons and moored boats, a few more out on the Sound ── */
  const hullG=flat(new THREE.CylinderGeometry(1.4,.7,1.2,6).scale(1,1,2.6));
  const hulls=IM(hullG,white,70),masts=IM(flat(new THREE.CylinderGeometry(.08,.1,9,4)).translate(0,5,0),steel,70);
  const pont=IM(flat(new THREE.BoxGeometry(1,1,1)),psMat({color:0x7a6a58}),12);
  let hb=0,pb=0,mb=0;
  for(let k=0;k<4;k++){const z=-110+k*16;p.set(-124,-1.7,z);sc.set(58,.5,2.2);m4.compose(p,q.identity(),sc);pont.setMatrixAt(pb++,m4);
    for(let x=-150;x<-98;x+=5.2)for(const sg of [-1,1]){
      if(hash2(x,z+sg)<0.3)continue;
      p.set(x,-1.9,z+sg*4);e.set(0,Math.PI/2+(hash2(x,sg)-.5)*.2,0);q.setFromEuler(e);m4.compose(p,q,one);
      if(hb<70)hulls.setMatrixAt(hb++,m4);
      if(hash2(z,x)>.35&&mb<70){p.y=-1.4;m4.compose(p,q,one);masts.setMatrixAt(mb++,m4);}
    }}
  hulls.count=hb;masts.count=mb;pont.count=pb;done(hulls,masts,pont);
  /* boats that potter about out on the water; the hazards loop moves them */
  RUNE.boats=[];
  for(const [cx,cz,rx2,rz2,sp,kind] of [[-60,190,70,26,.05,0],[-300,60,30,90,.035,0],[60,170,90,30,-.03,1],[-420,320,160,60,.012,2]]){
    const b=new THREE.Group();
    const s=kind===2?3.2:(kind===1?1.6:1);
    const h=new THREE.Mesh(hullG,kind===1?psMat({color:0x2a4a7a}):white);h.scale.set(s,s,s);b.add(h);
    if(kind===0){const m=new THREE.Mesh(flat(new THREE.CylinderGeometry(.08,.1,10,4)),steel);m.position.y=5;b.add(m);
      const sail=new THREE.Mesh(new THREE.PlaneGeometry(3.4,8),psMat({color:0xf4f0e6,side:THREE.DoubleSide}));sail.position.set(0,5.2,-1.6);sail.rotation.y=Math.PI/2;b.add(sail);}
    else{const cab=new THREE.Mesh(flat(new THREE.BoxGeometry(2*s,1.6*s,3*s)),white);cab.position.y=1.4*s;b.add(cab);
      const w=new THREE.Mesh(new THREE.BoxGeometry(2.1*s,.4*s,2.6*s),psMat({color:0xffd890,unlit:true}));w.position.y=1.6*s;b.add(w);}
    b.position.y=-1.8;world.add(b);RUNE.boats.push({b,cx,cz,rx:rx2,rz:rz2,sp});
  }
  /* harbour beacons on the pier heads: red to port, green to starboard */
  RUNE.beacons=[];
  for(const [x,z,c] of [[-166,-62,0xff2a1a],[-82,-62,0x30e060],[-182,48,0xff2a1a],[-30,102,0x30e060],[120,104,0xff2a1a]]){
    const y=meshY(x,z);
    const post=new THREE.Mesh(flat(new THREE.CylinderGeometry(.5,.7,5,6)),white);post.position.set(x,Math.max(y,-2.2)+2.5,z);world.add(post);
    const l=new THREE.Mesh(new THREE.BoxGeometry(1,1,1),psMat({color:c,unlit:true}));l.position.set(x,Math.max(y,-2.2)+5.4,z);world.add(l);
    RUNE.beacons.push(l);
  }
  /* the fireworks barge out on the Sound */
  {
    const bx=-40,bz=210;
    const barge=new THREE.Mesh(flat(new THREE.BoxGeometry(14,2,30)),psMat({color:0x3a3c40}));barge.position.set(bx,-1.6,bz);world.add(barge);
    for(let k=0;k<5;k++){const t=new THREE.Mesh(flat(new THREE.CylinderGeometry(.5,.5,2,5)),psMat({color:0xb8382a}));t.position.set(bx-4+k*2,.4,bz+(k%2?4:-4));world.add(t);}
    const fw=IM(new THREE.BoxGeometry(1.1,1.1,1.1),psMat({unlit:true}),6*16);
    const FC=[0xff4a3a,0xffd84a,0x5ae0ff,0xff6ad8,0x8aff6a,0xffffff];
    for(let s=0;s<6;s++)for(let k=0;k<16;k++)fw.setColorAt(s*16+k,col.setHex(FC[s]));
    fw.count=96;done(fw);RUNE.fw=fw;RUNE.fwAt={x:bx,z:bz};
  }
  /* ── the falafel kiosk on the quay by the first stamp ── */
  {
    const i=40,o=-(HW+8.5),x=sx[i]+rx[i]*o,z=sz[i]+rz[i]*o,y=meshY(x,z);
    const k=new THREE.Group();
    const body=new THREE.Mesh(flat(new THREE.BoxGeometry(5,3,3.4)),psMat({color:0x2f8a5a}));body.position.y=1.5;k.add(body);
    const aw=new THREE.Mesh(flat(new THREE.BoxGeometry(5.6,.3,2)),psMat({color:0xf2c500}));aw.position.set(0,3.1,2.2);aw.rotation.x=.25;k.add(aw);
    const sign=pixTex(64,16,(g)=>{g.fillStyle='#f2c500';g.fillRect(0,0,64,16);g.fillStyle='#1a1a1a';g.font='8px "Press Start 2P",monospace';
      g.textAlign='center';g.textBaseline='middle';g.fillText('FALAFEL',32,9);});
    const sp=new THREE.Mesh(new THREE.PlaneGeometry(5,1.3),psMat({map:sign,unlit:true}));sp.position.set(0,3.9,1.75);k.add(sp);
    const win=new THREE.Mesh(new THREE.PlaneGeometry(3.4,1.2),psMat({color:0xffe0a0,unlit:true}));win.position.set(0,1.9,1.72);k.add(win);
    k.position.set(x,y,z);k.rotation.y=Math.atan2(-rx[i],-rz[i])+Math.PI;world.add(k);
  }
  /* ── the sculpture park on its hill: paving over the lane and a few odd shapes ── */
  const R=ALTS.find(r=>r.id==='ringen');
  if(R){
    const pave=pixTex(32,32,(g)=>{g.fillStyle='#a8a296';g.fillRect(0,0,32,32);g.fillStyle='#7c776e';
      for(let k=0;k<32;k+=8){g.fillRect(0,k,32,1);g.fillRect(k+((k/8)%2?4:0),0,1,32);}
      for(let k=0;k<120;k++){g.fillStyle=Math.random()>.5?'#b8b2a6':'#8e897e';g.fillRect((Math.random()*32)|0,(Math.random()*32)|0,1,1);}});
    pave.wrapS=pave.wrapT=THREE.RepeatWrapping;
    const pm=psMat({map:pave});pm.polygonOffset=true;pm.polygonOffsetFactor=-4;pm.polygonOffsetUnits=-4;
    world.add(new THREE.Mesh(altRibbon(R,-R.hw,R.hw,.04,6,COMMIT+2,R.n-MERGE),pm));
    const mats=[psMat({color:0xd8362a}),psMat({color:0x2f6aa8}),psMat({color:0xf2c500}),white];
    for(let n=0;n<7;n++){
      const j=Math.round(R.n*(.2+.6*n/6)),sg=n%2?1:-1,o=sg*(R.hw+5+hash2(n,2)*6);
      const x=R.X[j]+R.RX[j]*o,z=R.Z[j]+R.RZ[j]*o;if(latAt(x,z)<R.hw+3)continue;
      const y=meshY(x,z),g=new THREE.Group();
      const kind=n%3;
      if(kind===0){const t=new THREE.Mesh(flat(new THREE.TorusGeometry(2.2,.5,4,10)),mats[n%4]);t.position.y=3;g.add(t);}
      else if(kind===1){for(let s=0;s<4;s++){const c=new THREE.Mesh(flat(new THREE.BoxGeometry(2-.3*s,1.6,2-.3*s)),mats[(n+s)%4]);c.position.y=.8+s*1.6;c.rotation.y=s*.4;g.add(c);}}
      else{const c=new THREE.Mesh(flat(new THREE.ConeGeometry(1.6,5,4)),mats[n%4]);c.position.y=2.5;c.rotation.z=.3;g.add(c);}
      g.position.set(x,y,z);world.add(g);
    }
    /* lamp bollards down both sides of the paving */
    const bol=IM(flat(new THREE.BoxGeometry(.4,1.1,.4)),psMat({color:0xffe6b0,unlit:true}),Math.ceil(R.n/6)*2);
    let bc=0;
    for(let j=COMMIT+4;j<R.n-MERGE-2;j+=6)for(const sg of [-1,1]){
      const o=sg*(R.hw+1.6),x=R.X[j]+R.RX[j]*o,z=R.Z[j]+R.RZ[j]*o;
      {const mi=nearestGlobal(x,z);if(Math.abs((x-sx[mi])*rx[mi]+(z-sz[mi])*rz[mi])<HW+2)continue;}
      p.set(x,R.Y[j]+.4,z);m4.compose(p,q.identity(),one);bol.setMatrixAt(bc++,m4);
    }
    bol.count=bc;done(bol);
  }
  /* trees in the parks and along the promenades */
  const TN=160;
  const trunk=IM(flat(new THREE.CylinderGeometry(.2,.28,2.2,5)).translate(0,1.1,0),psMat({color:0x4a3a2c}),TN);
  const crown=IM(flat(new THREE.SphereGeometry(1.8,6,4)).translate(0,3.2,0),psMat({color:0x3f6a34}),TN);
  let tc=0,guard=0;
  while(tc<TN&&guard++<5000){
    const x=rand(-260,250),z=rand(-230,95);
    if(!clearOf(x,z,7)||blocks.some(b=>Math.abs(b.position.x-x)<b.geometry.parameters.width/2+3&&Math.abs(b.position.z-z)<b.geometry.parameters.depth/2+3))continue;
    if(z<-160&&z>-235)continue;                           /* not in the container yards */
    p.set(x,meshY(x,z)-.1,z);const s2=.8+hash2(x,z)*.5;sc.set(s2,s2,s2);m4.compose(p,q.identity(),sc);
    trunk.setMatrixAt(tc,m4);crown.setMatrixAt(tc,m4);tc++;
  }
  trunk.count=crown.count=tc;done(trunk,crown);
}

/** the dusk, the lights, the boats and the fireworks; and the container crane on the quay */
function hazardsRune(H){
  const RU=stage.rune||{};
  const skyA=new THREE.Color(0xf6a35a),skyB=new THREE.Color(0xc0584a),hiA=new THREE.Color(0x34407e),hiB=new THREE.Color(0x121838),
        fogA=new THREE.Color(0xc98f78),fogB=new THREE.Color(0x5e4250),ambA=new THREE.Color(0x6a6278),ambB=new THREE.Color(0x4c4864),
        difA=new THREE.Color(0xffc89a),difB=new THREE.Color(0xc87a62),off=new THREE.Color(0x4a4640),on=new THREE.Color(0xffd890);
  H.push({id:'runeDusk',period:1,phase:0,update(u,dt){
    const D=runeDusk();
    skyMat.uniforms.uLow.value.copy(skyA).lerp(skyB,D);skyMat.uniforms.uHigh.value.copy(hiA).lerp(hiB,D);
    U.fogColor.value.copy(fogA).lerp(fogB,D);U.amb.value.copy(ambA).lerp(ambB,D);U.dif.value.copy(difA).lerp(difB,D);
    if(RU.sun){const el=lerp(0.07,-0.05,D);RU.sun.position.set(RU.SD.x*800,el*800,RU.SD.z*800);RU.sun.lookAt(0,el*800,0);
      RU.sun.material.color.setHex(D>0.6?0xff7a3a:0xffb050);}
    if(RU.lampMats)RU.lampMats.forEach((m,k)=>{const t=smooth(0.18+k*0.14,0.26+k*0.14,D);m.uniforms.uColor.value.copy(off).lerp(on,t);});
    if(RU.cubeLit)for(const c of RU.cubeLit)c.mesh.visible=D>0.1+c.at*0.6;
    const blink=Math.floor(clock*1.4)%2===0;
    if(RU.beacon)RU.beacon.visible=blink;
    if(RU.bridgeLights)RU.bridgeLights.forEach(l=>l.visible=blink);
    if(RU.bridgeDeckLight)RU.bridgeDeckLight.color.setHex(D>0.3?0xffd27a:0x8a6a5a);
    if(RU.beacons)RU.beacons.forEach((l,k)=>l.visible=Math.floor(clock*2+k*0.7)%3!==0);
    if(RU.boats)for(const B of RU.boats){const a=clock*B.sp;
      B.b.position.x=B.cx+Math.cos(a)*B.rx;B.b.position.z=B.cz+Math.sin(a)*B.rz;
      B.b.rotation.y=Math.atan2(-Math.sin(a)*B.rx*Math.sign(B.sp),Math.cos(a)*B.rz*Math.sign(B.sp));
      B.b.rotation.z=Math.sin(clock*1.3+B.cx)*.05;}
    if(RU.fw){                                       /* six shells on their own clocks, more of them as it darkens */
      const m4=new THREE.Matrix4(),z0=new THREE.Matrix4().makeScale(0,0,0);
      for(let s=0;s<6;s++){
        const per=5.2+s*0.7,t=((clock+s*1.9)%per),seed=Math.floor((clock+s*1.9)/per)+s*13;
        const live=s<2+Math.round(D*4);
        const bx=RU.fwAt.x+(hash2(seed,1)-.5)*20,bz=RU.fwAt.z+(hash2(seed,2)-.5)*20,top=45+hash2(seed,3)*30;
        for(let k=0;k<16;k++){
          const n=s*16+k;
          if(!live||t>3.2){RU.fw.setMatrixAt(n,z0);continue;}
          if(t<1.2){                                 /* the climb: one spark per shell shows */
            if(k){RU.fw.setMatrixAt(n,z0);continue;}
            m4.makeTranslation(bx,lerp(0,top,t/1.2),bz);RU.fw.setMatrixAt(n,m4);continue;}
          const tt=t-1.2,a=k/16*6.283,el=(hash2(k,seed)-.3)*2.2,r=tt*14*(1-tt*0.12);
          const s2=Math.max(0,1.3-tt*0.6);
          m4.makeScale(s2,s2,s2).setPosition(bx+Math.cos(a)*Math.cos(el)*r,top+Math.sin(el)*r-tt*tt*3,bz+Math.sin(a)*Math.cos(el)*r);
          RU.fw.setMatrixAt(n,m4);
        }
      }
      RU.fw.instanceMatrix.needsUpdate=true;
    }
  }});
  /* the container crane: a gantry over the quay road whose trolley drags a box across it and back */
  let ci=-1;
  for(const c of [104,112,96,120,88,660,670,650,680]){
    if(sy[c]>5||!clearOfForks(c,24))continue;
    if(JUMPS.some(J=>{const d=Math.min(Math.abs(c-J.at),N-Math.abs(c-J.at));return d<J.up+J.dn+J.rec+16;}))continue;
    if(stations.some(S=>{let d=c-S.at;if(d<-N/2)d+=N;if(d>N/2)d-=N;return d>-14&&d<S.len+14;}))continue;
    ci=c;break;
  }
  if(ci<0)return;
  const yaw=Math.atan2(fx[ci],fz[ci]),base=sy[ci];
  const blue=psMat({color:0x2f6aa8}),dark=psMat({color:0x2a2c30}),amber=psMat({color:0xffa020,unlit:true});
  const crane=new THREE.Group();crane.position.set(sx[ci],base,sz[ci]);crane.rotation.y=yaw;world.add(crane);
  const LX=HW+6.6,GH=22;
  for(const sgx of [-1,1])for(const sgz of [-1,1]){
    const leg=new THREE.Mesh(flat(new THREE.BoxGeometry(1.4,GH,1.4)),blue);leg.position.set(sgx*LX,GH/2-1,sgz*7);crane.add(leg);}
  for(const sgx of [-1,1]){const sill=new THREE.Mesh(flat(new THREE.BoxGeometry(1.6,1.6,16)),blue);sill.position.set(sgx*LX,GH,0);crane.add(sill);
    const bogie=new THREE.Mesh(flat(new THREE.BoxGeometry(2.2,1.2,17)),dark);bogie.position.set(sgx*LX,-.4,0);crane.add(bogie);}
  for(const sgz of [-1,1]){const boom=new THREE.Mesh(flat(new THREE.BoxGeometry(2*(HW+16),2,1.6)),blue);boom.position.set(0,GH+1.6,sgz*2.2);crane.add(boom);}
  const cabin=new THREE.Mesh(flat(new THREE.BoxGeometry(3,2.6,3)),psMat({color:0xe8e6e0}));cabin.position.set(LX-2,GH-1.2,4);crane.add(cabin);
  const lamps=[];
  for(const sgx of [-1,1])for(const sgz of [-1,1]){const l=new THREE.Mesh(new THREE.BoxGeometry(.8,.8,.8),amber);l.position.set(sgx*LX,GH+1.2,sgz*7.8);crane.add(l);lamps.push(l);}
  /* the warning stripes painted across the road under it */
  const hatch=pixTex(32,8,(g)=>{for(let k=0;k<8;k++){g.fillStyle=k%2?'#1a1a1a':'#f2c500';g.beginPath();g.moveTo(k*4,0);g.lineTo(k*4+4,0);g.lineTo(k*4,8);g.lineTo(k*4-4,8);g.fill();}});
  hatch.wrapS=THREE.RepeatWrapping;hatch.repeat.set(6,1);
  for(const sgz of [-1,1]){const st=new THREE.Mesh(new THREE.PlaneGeometry(2*HW,2.2).rotateX(-Math.PI/2),psMat({map:hatch,unlit:true}));
    st.position.set(0,.07,sgz*8.6);crane.add(st);}
  /* trolley, ropes and the box itself */
  const trolley=new THREE.Mesh(flat(new THREE.BoxGeometry(3.2,1.6,5.4)),dark);crane.add(trolley);
  const ropes=[-1,1].map(sg=>{const r=new THREE.Mesh(new THREE.BoxGeometry(.12,1,.12),dark);crane.add(r);return r;});
  const box=new THREE.Group();crane.add(box);
  const cb=new THREE.Mesh(flat(new THREE.BoxGeometry(2.6,2.7,12.2)),psMat({color:0xd86a2a}));cb.position.y=1.35;box.add(cb);
  const spreader=new THREE.Mesh(flat(new THREE.BoxGeometry(2.8,.4,12.6)),psMat({color:0xf2c500}));spreader.position.y=2.9;box.add(spreader);
  const W=HW+9.5;
  const latOf=u=>u<0.3?lerp(-W,W,smooth(0,0.3,u)):(u<0.5?W:(u<0.8?lerp(W,-W,smooth(0.5,0.8,u)):-W));
  H.push({id:'runeCrane',period:9,phase:2.5,mesh:crane,
    update(u){
      const L=latOf(u),lift=smooth(HW+3,W,Math.abs(L))*5.5,bot=0.5+lift;
      const sw=Math.sin(clock*2.4)*.35*(u<0.3||(u>0.5&&u<0.8)?1:.3);
      /* the group is turned to the road: local +x is the left of the road, so lateral L sits at x=-L */
      box.position.set(-L,bot,sw);trolley.position.set(-L,GH+2.8,0);
      const rl=GH+2-(bot+3.1);ropes.forEach((r,k)=>{r.scale.y=rl;r.position.set(-L,bot+3.1+rl/2,(k?1:-1)*3.5);});
      const warn=u<0.3||(u>0.4&&u<0.8)||u>0.9;          /* the amber lights flash before and while it moves */
      const fl=warn&&Math.floor(clock*6)%2===0;lamps.forEach(l=>l.visible=fl);
      this.L=L;this.bot=bot;
      if(player&&state==='race'&&(u>0.9&&this.lu<=0.9||u>0.4&&this.lu<=0.4)){
        const d=Math.hypot(player.x-sx[ci],player.z-sz[ci]);if(d<90)ping(520,380,.18);}
      this.lu=u;},
    hit(k){if(k.rib||this.bot>1.8)return false;
      const dx=k.x-sx[ci],dz=k.z-sz[ci],l=dx*rx[ci]+dz*rz[ci],f=dx*fx[ci]+dz*fz[ci];
      return Math.abs(f)<7.0&&Math.abs(l-this.L)<2.3&&Math.abs(k.y-base)<3;},
    effect(k){k.spun=Math.max(k.spun,0.9*k.spinResist);k.boost=0;k.drift=0;k.charge=0;
      if(k===player){toast('CONTAINER!');ping(240,80,.3);shake=Math.min(1,shake+.5);}}});
}
