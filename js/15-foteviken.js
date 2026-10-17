"use strict";
/* ───────── Foteviken: vikingastaden ───────── */
/* Pirate Skull Pass's counterpart: a Viking village on the shore, a lane straight through an upturned longship,
   and barrels lobbed onto the road from a catapult (the original's cannon fire, Viking style) */
ROADTEX.fotJord=()=>pixTex(64,64,g=>{                 /* trodden earth with cart ruts and shell grit */
  g.fillStyle='#8a7354';g.fillRect(0,0,64,64);
  for(let i=0;i<900;i++){
    const r=Math.random();
    g.fillStyle=r>.66?'rgba(176,152,112,.55)':r>.33?'rgba(98,78,54,.5)':'rgba(214,206,186,.45)';
    g.fillRect((Math.random()*64)|0,(Math.random()*64)|0,1,1);
  }
  g.fillStyle='rgba(84,66,44,.45)';for(const x of [13,19,43,49])g.fillRect(x,0,3,64);
  g.fillStyle='rgba(112,138,70,.55)';
  for(let i=0;i<10;i++)g.fillRect((Math.random()*64)|0,(Math.random()*64)|0,2,1);
});
VERGEC.fotGras=['#7d8f4a','#9aab5c','#6a6a3c'];
GROUND.fotViken={cell:36,stripe:0.7,verge:0x8b8a5a,
  cols:[0x86a050,0x7a9a48,0x94a85a,0xc8b888,0x6f8c44,0xa8a468,0x8a9c52]};
EDGES.fotFlata=st=>{                                  /* woven hazel hurdles on stakes */
  const step=5,cnt=Math.ceil(N/step)*2;
  const hurd=new THREE.InstancedMesh(flat(new THREE.BoxGeometry(.18,.9,SEG*step-.4)),psMat({color:0x7a6040}),cnt);
  const weave=new THREE.InstancedMesh(flat(new THREE.BoxGeometry(.24,.12,SEG*step-.3)),psMat({color:0x5c4630}),cnt*2);
  const stake=new THREE.InstancedMesh(flat(new THREE.CylinderGeometry(.09,.11,1.5,4)),psMat({color:0x4c3a28}),cnt);
  const m4=new THREE.Matrix4(),q=new THREE.Quaternion(),e=new THREE.Euler(),p=new THREE.Vector3(),one=new THREE.Vector3(1,1,1);
  let a=0,b=0,c=0;
  for(let i=0;i<N;i+=step){
    const j=(i+Math.floor(step/2))%N;
    for(const side of [-1,1]){
      const o=side*(HW+4.3),x=sx[j]+rx[j]*o,z=sz[j]+rz[j]*o;
      if(nearAlt(x,z,2.6))continue;
      if(fotevikenPumps(st).some(S=>side===S.side&&((j-S.at+N)%N)<S.len+3))continue;
      const y=meshY(x,z);
      e.set(0,Math.atan2(fx[j],fz[j]),0);q.setFromEuler(e);
      p.set(x,y+.55,z);m4.compose(p,q,one);hurd.setMatrixAt(a++,m4);
      for(const h of [.3,.75]){p.set(x,y+h,z);m4.compose(p,q,one);weave.setMatrixAt(b++,m4);}
      const xi=sx[i]+rx[i]*o,zi=sz[i]+rz[i]*o;
      p.set(xi,meshY(xi,zi)+.6,zi);e.set(0,Math.atan2(fx[i],fz[i]),0);q.setFromEuler(e);
      m4.compose(p,q,one);stake.setMatrixAt(c++,m4);
    }
  }
  hurd.count=a;weave.count=b;stake.count=c;
  hurd.instanceMatrix.needsUpdate=weave.instanceMatrix.needsUpdate=stake.instanceMatrix.needsUpdate=true;
  world.add(hurd);world.add(weave);world.add(stake);
};
/** where buildStations will put the pumps (the edges are built before the stations are) */
function fotevikenPumps(st){
  return (st.stations||[[0.27,1],[0.71,-1]]).map(sp=>{let at=Math.round(N*sp[0]);
    for(const J of JUMPS)if(Math.min(Math.abs(at-J.at),N-Math.abs(at-J.at))<J.up+J.dn+16)at=(at+46)%N;
    return {at,side:sp[1],len:12};});
}
/* the bay lies north and west of the village; d > 0 is out in the water */
const fotevikenSea=(x,z)=>Math.max(-(z+162),-(x+262));

STAGES.push({ id:'foteviken', group:'kust', name:'FOTEVIKEN', sub:'VIKINGASTADEN',
  order:15, tag:'En vikingastad på stranden och en väg rakt genom ett uppvänt långskepp. Katapulten slänger tunnor.',
  view:{x:-240,z:-8,h:3,to:{x:-266,z:-28,h:5},fov:60},
  hw:8.4,
  bars:[0.65,0.70,0.55], laps:3,
  blurb:'The rebuilt Viking town on the shore at Höllviken: turf-roofed longhouses, a palisade, a market and longships pulled up on the beach. Just past the shield wall a sharp left takes you over the sand and straight through an upturned longship. Mind the rings on the road: the Vikings are lobbing barrels from a catapult, and a hit spins you round.',
  role:'Strandsand, en vikingaby och tunnor som regnar över vägen.',
  sky:[0xeaf3f8,0x3f93df], fog:[0xd9e7ee,95,430], amb:0x6a7482, dif:0xfff6e2,
  road:'fotJord', verge:'fotGras', edge:'fotFlata', ground:'fotViken', paint:false,
  sfxRoad:'dirt', terrain:{size:960,seg:88},
  jumpSpec:[{h:3.6,drop:2.6,up:12,dn:7,rec:18},{h:2.8,drop:2.0,up:11,dn:6,rec:15}],
  ctrl:[[-120,2,-130],[ -20,2,-134],[  80,2,-130],[ 160,3,-110],[ 205,5, -60],
        [ 215,7,   0],[ 190,9,  50],[ 205,10,105],[ 170,9, 160],[ 105,8, 170],
        [  55,7, 135],[  10,6,  95],[ -45,6, 110],[ -95,6, 160],[-155,5, 180],
        [-205,4, 150],[-200,5,  95],[-128,4,  40],[-138,3, -25],[-205,2, -72],
        [-212,2,-110],[-175,2,-132]],
  /* flat coastal land: most of the hills ironed out, then the beach runs down into the bay */
  mod:(x,z,t)=>-rolls(x,z)*t*0.92-7*smooth(-6,26,fotevikenSea(x,z)),
  land:(x,z,out)=>{
    const d=fotevikenSea(x,z);
    if(d>-14)out.setHex(d>-2?0xd8c89a:0xe6d8ae);          /* the beach */
    else if(d>-26&&hash2(Math.floor(x/7),Math.floor(z/7))>.5)out.setHex(0x9aa25c);   /* dune grass */
  },
  stations:[[0.36,1],[0.66,-1]],
  hazards:H=>hazardsFoteviken(H), scenery:()=>sceneryFoteviken(),
  routes:[
    {id:'langskepp',name:'LÅNGSKEPPET',a:532,b:630,hw:4.2,side:-1,lead:9,leadLat:10,
     mid:[[0.25,-9],[0.5,-10],[0.75,-9]],surface:'sand',risk:0.35,
     blurb:'Hard left over the beach and straight through the hull of an upturned longship. Shorter, but sand all the way.'}],
  stamps:[
    {id:'fot1',dish:'Mjöd',ini:'M',kind:'intro',route:'main',i:66,lat:6.2,
     hint:'Vid marknadsstånden på långa rakan.',
     story:'Mead, honey wine, is what the market at Foteviken pours every summer: honey, water and yeast left to work in a crock, sometimes with a handful of meadowsweet. The Vikings drank it from horns at feasts; the market sells it by the jug to tourists who have been throwing axes all day.'},
    {id:'fot2',dish:'Kålsoppa',ini:'K',kind:'route',route:'langskepp',f:0.5,lat:0,
     hint:'Inne i det uppochnedvända långskeppet.',
     story:'Skånsk kålsoppa is the oldest kind of supper there is: white cabbage, root vegetables and a piece of salt pork simmered for hours in one pot over the hearth. In the longhouses at Foteviken the pot hangs over the fire all day, and anyone who comes in out of the wind gets a bowl.'},
    {id:'fot3',dish:'Kavring',ini:'K',kind:'air',route:'main',jump:0,after:5,lat:0,air:4.6,
     hint:'Högt i luften över första hoppet.',
     story:'Kavring is Skåne\'s dark, sweet rye bread, baked with syrup and buttermilk until the crust is almost black. It keeps for weeks, which is why it went to sea and to market, and it is best in thin slices with butter and a slice of cheese.'}] });

/** a clinker hull lofted between stems: length along z, beam x, keel at y=0, gunwale up */
function fotevikenHull(L,b,D,sheer,s0,s1,nl,na){
  const pos=[],uv=[],idx=[];
  for(let i=0;i<=nl;i++){
    const s=s0+(s1-s0)*i/nl, bw=b*Math.pow(Math.max(0,1-s*s),.55), dd=D+sheer*s*s;
    for(let a=0;a<=na;a++){
      const th=-Math.PI/2+Math.PI*a/na;
      pos.push(bw*Math.sin(th),dd*(1-Math.cos(th)),s*L/2);
      uv.push(a/na*4,i/nl*2);
    }
  }
  for(let i=0;i<nl;i++)for(let a=0;a<na;a++){
    const p=i*(na+1)+a,q=p+na+1;idx.push(p,q,p+1,q,q+1,p+1);
  }
  const g=new THREE.BufferGeometry();
  g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));
  g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));
  g.setIndex(idx);return flat(g);
}
const fotevikenPlank=pixTex(32,32,g=>{
  g.fillStyle='#5a4028';g.fillRect(0,0,32,32);
  for(let y=0;y<32;y+=4){g.fillStyle=y%8?'#6e5034':'#4a3420';g.fillRect(0,y,32,3);g.fillStyle='#2e2016';g.fillRect(0,y+3,32,1);}
  g.fillStyle='#8a7a5a';for(let i=0;i<10;i++)g.fillRect((Math.random()*32)|0,((Math.random()*8)|0)*4+1,1,1);
});
fotevikenPlank.wrapS=fotevikenPlank.wrapT=THREE.RepeatWrapping;
/** a longship drawn up on the beach: hull, dragon stems, mast and a striped sail */
function fotevikenShip(L,sail){
  const g=new THREE.Group(),wood=psMat({map:fotevikenPlank,side:THREE.DoubleSide}),dk=psMat({color:0x3c2a1a});
  g.add(new THREE.Mesh(fotevikenHull(L,2.4,1.6,1.2,-1,1,14,6),wood));
  for(const sg of [-1,1]){                              /* stem and stern rise and curl */
    const st=new THREE.Mesh(flat(new THREE.BoxGeometry(.3,2.2,.5)),dk);
    st.position.set(0,2.8,sg*(L/2+.1));st.rotation.x=sg*.35;g.add(st);
    const hd=new THREE.Mesh(flat(new THREE.BoxGeometry(.4,.6,1.1)),dk);
    hd.position.set(0,3.9,sg*(L/2+.55));g.add(hd);
  }
  const SH=[0xc8281c,0xe8c33a,0x2c5aa0,0xf2ece0,0x3a7a3a];
  for(let k=-3;k<=3;k++)for(const sg of [-1,1]){        /* shields along the gunwale */
    const sh=new THREE.Mesh(flat(new THREE.CylinderGeometry(.45,.45,.08,8)),psMat({color:SH[(k+3+(sg>0?2:0))%5]}));
    sh.rotation.z=Math.PI/2;sh.position.set(sg*2.42,1.75,k*L*.1);g.add(sh);
  }
  if(sail){
    const mast=new THREE.Mesh(flat(new THREE.CylinderGeometry(.15,.2,9,5)),dk);mast.position.y=5.3;g.add(mast);
    const yard=new THREE.Mesh(flat(new THREE.BoxGeometry(6.4,.18,.18)),dk);yard.position.y=8.8;g.add(yard);
    const sm=psMat({map:pixTex(16,16,c=>{for(let i=0;i<4;i++){c.fillStyle=i%2?'#f2ece0':'#b8261c';c.fillRect(i*4,0,4,16);}}),side:THREE.DoubleSide});
    const s=new THREE.Mesh(new THREE.PlaneGeometry(6,4.6,2,2),sm);s.position.set(0,6.4,.25);g.add(s);g.userData.sail=s;
  }
  return g;
}
/** a person in a tunic, with or without a helmet */
function fotevikenViking(tunic,helm){
  const g=new THREE.Group();
  const body=new THREE.Mesh(flat(new THREE.BoxGeometry(.7,1.0,.45)),psMat({color:tunic}));body.position.y=1.15;g.add(body);
  const legs=new THREE.Mesh(flat(new THREE.BoxGeometry(.55,.65,.38)),psMat({color:0x4a3c30}));legs.position.y=.33;g.add(legs);
  const head=new THREE.Mesh(flat(new THREE.BoxGeometry(.42,.45,.42)),psMat({color:0xe0b08a}));head.position.y=1.9;g.add(head);
  const beard=new THREE.Mesh(flat(new THREE.BoxGeometry(.36,.3,.12)),psMat({color:0xc87a30}));beard.position.set(0,1.75,.24);g.add(beard);
  if(helm){const h=new THREE.Mesh(flat(new THREE.ConeGeometry(.3,.4,6)),psMat({color:0x8a8e92}));h.position.y=2.28;g.add(h);}
  return g;
}

function sceneryFoteviken(){
  const m4=new THREE.Matrix4(),q=new THREE.Quaternion(),e=new THREE.Euler(),
        p=new THREE.Vector3(),sc=new THREE.Vector3(),one=new THREE.Vector3(1,1,1);
  const at=(i,o)=>{i=((i%N)+N)%N;const x=sx[i]+rx[i]*o,z=sz[i]+rz[i]*o;return {x,z,y:meshY(x,z),yaw:Math.atan2(fx[i],fz[i])};};
  const free=(x,z,pad)=>latAt(x,z)>HW+pad&&!stations.some(S=>{const i=(S.at+6)%N,o=S.side*(HW+10);
    return Math.hypot(x-(sx[i]+rx[i]*o),z-(sz[i]+rz[i]*o))<20;});
  /* the bay */
  const sea=new THREE.Mesh(new THREE.PlaneGeometry(2400,2400).rotateX(-Math.PI/2),psMat({color:0x3d7fae}));
  sea.position.set(0,-2.8,0);world.add(sea);
  const foam=psMat({color:0xe8f2f6,unlit:true,transparent:true,opacity:.55,depthWrite:false});
  const FM=new THREE.InstancedMesh(new THREE.PlaneGeometry(5,.5).rotateX(-Math.PI/2),foam,140);
  let fm=0;
  for(let k=0;k<140;k++){
    const x=rand(-470,470),z=rand(-470,470);
    if(fotevikenSea(x,z)<8)continue;
    p.set(x,-2.72,z);e.set(0,rand(-.3,.3)+(x<-262&&z>-162?Math.PI/2:0),0);q.setFromEuler(e);
    sc.set(rand(.6,1.6),1,1);m4.compose(p,q,sc);FM.setMatrixAt(fm++,m4);
  }
  FM.count=fm;FM.instanceMatrix.needsUpdate=true;world.add(FM);
  /* reeds along the waterline */
  const RD=700;
  const reed=new THREE.InstancedMesh(flat(new THREE.ConeGeometry(.35,2.2,3)).translate(0,1.1,0),psMat({color:0x9c9a52}),RD);
  let r=0,guard=0;
  while(r<RD&&guard++<20000){
    const x=rand(-470,300),z=rand(-470,300),d=fotevikenSea(x,z);
    if(d<-3||d>9||!free(x,z,5))continue;
    p.set(x,meshY(x,z)-.2,z);e.set(rand(-.15,.15),rand(0,6),rand(-.15,.15));q.setFromEuler(e);
    const s=rand(.6,1.3);sc.set(s,s*rand(.8,1.3),s);m4.compose(p,q,sc);reed.setMatrixAt(r++,m4);
  }
  reed.count=r;reed.instanceMatrix.needsUpdate=true;world.add(reed);
  /* longships pulled up on the beach, bows to the land */
  const ships=[];
  for(const [x,z,yaw,L] of [[-60,-160,-.2,20],[-20,-162,.15,17],[40,-160,-.1,22],[110,-158,.25,16],[-266,40,1.5,18],[-264,-30,1.7,21]]){
    if(!free(x,z,6))continue;
    const s=fotevikenShip(L,true);s.position.set(x,Math.max(-2.4,meshY(x,z))-.15,z);s.rotation.set(0,yaw,.08);
    world.add(s);ships.push(s);
  }
  /* the village: a palisade ring with turf-roofed longhouses inside */
  const C={x:45,z:-30},PR=56;
  const logs=new THREE.InstancedMesh(flat(new THREE.CylinderGeometry(.42,.42,4.2,5)).translate(0,2.1,0),psMat({color:0x6e5232}),260);
  const tips=new THREE.InstancedMesh(flat(new THREE.ConeGeometry(.42,.9,5)).translate(0,4.6,0),psMat({color:0x5a4228}),260);
  let lg=0;
  for(let k=0;k<240;k++){
    const a=k/240*6.283;
    if(Math.abs(wrapAng(a+1.57))<.12)continue;                /* the gate, facing the long straight */
    const x=C.x+Math.cos(a)*PR,z=C.z+Math.sin(a)*PR*.8;
    if(!free(x,z,6))continue;
    p.set(x,meshY(x,z)-.3,z);e.set(0,a,0);q.setFromEuler(e);sc.set(1,.85+hash2(k,1)*.3,1);
    m4.compose(p,q,sc);logs.setMatrixAt(lg,m4);tips.setMatrixAt(lg,m4);lg++;
  }
  logs.count=tips.count=lg;logs.instanceMatrix.needsUpdate=tips.instanceMatrix.needsUpdate=true;
  world.add(logs);world.add(tips);
  {const gx=C.x,gz=C.z-PR*.8,gy=meshY(gx,gz);               /* gate towers */
    for(const sg of [-1,1]){const t=new THREE.Mesh(flat(new THREE.BoxGeometry(2.4,7,2.4)),psMat({color:0x5a4228}));
      t.position.set(gx+sg*6,gy+3.5,gz);world.add(t);
      const rf=new THREE.Mesh(flat(new THREE.ConeGeometry(2.2,2,4)),psMat({color:0x6c7a3a}));
      rf.position.set(gx+sg*6,gy+8,gz);rf.rotation.y=.785;world.add(rf);}
    const beam=new THREE.Mesh(flat(new THREE.BoxGeometry(14,.8,.8)),psMat({color:0x4c3a28}));beam.position.set(gx,gy+6.2,gz);world.add(beam);}
  const turf=0x6c7f3a, wallC=[0x6a5032,0x7a5c3a,0x5e4630];
  const lhouses=[[C.x-18,C.z-8,.3,22],[C.x+16,C.z-14,-.2,18],[C.x-6,C.z+20,1.4,24],[C.x+28,C.z+16,.9,16],[C.x-30,C.z+18,-.6,14]];
  for(const [x,z,yaw,L] of lhouses){
    const h=new THREE.Group();
    const body=new THREE.Mesh(flat(new THREE.BoxGeometry(7,2.4,L)),psMat({color:wallC[(L|0)%3]}));body.position.y=1.2;h.add(body);
    const rf=gableRoof(L*1.08,8.8,4.2,turf);rf.rotation.y=Math.PI/2;rf.position.y=2.4;h.add(rf);
    for(const sg of [-1,1]){                                    /* crossed gable boards */
      for(const t of [-1,1]){const b=new THREE.Mesh(flat(new THREE.BoxGeometry(.25,2.4,.25)),psMat({color:0x3c2a1a}));
        b.position.set(t*.5,6.9,sg*L*.54);b.rotation.z=t*.5;h.add(b);}
      const door=new THREE.Mesh(flat(new THREE.BoxGeometry(1.4,2,.1)),psMat({color:0x2a1e14}));door.position.set(0,1,sg*(L/2+.05));h.add(door);
    }
    h.position.set(x,meshY(x,z)-.1,z);h.rotation.y=yaw;world.add(h);
  }
  /* market stands along the inside of the long straight, under striped awnings */
  const awn=[0xc8281c,0x2c5aa0,0xe8c33a,0x3a7a3a];
  for(let n=0;n<7;n++){
    const i=34+n*12,Q=at(i,HW+7.5+(n%2)*1.5);
    if(!free(Q.x,Q.z,5))continue;
    const s=new THREE.Group(),wood=psMat({color:0x6b5540});
    for(const [a,b] of [[-1.6,-1],[1.6,-1],[-1.6,1],[1.6,1]]){const po=new THREE.Mesh(flat(new THREE.BoxGeometry(.18,2.6,.18)),wood);po.position.set(a,1.3,b);s.add(po);}
    const tex=pixTex(16,8,c=>{for(let k=0;k<4;k++){c.fillStyle=k%2?'#f2ece0':'#'+awn[n%4].toString(16).padStart(6,'0');c.fillRect(k*4,0,4,8);}});
    const aw=new THREE.Mesh(flat(new THREE.BoxGeometry(3.8,.15,2.8)),psMat({map:tex}));aw.position.y=2.7;aw.rotation.x=-.18;s.add(aw);
    const tb=new THREE.Mesh(flat(new THREE.BoxGeometry(3.2,.9,1.1)),wood);tb.position.set(0,.45,-.5);s.add(tb);
    for(let k=0;k<4;k++){const gd=new THREE.Mesh(flat(new THREE.BoxGeometry(.5,.35,.5)),psMat({color:[0xd8b25a,0xa83020,0x8a6a40,0xe8e0c8][(k+n)%4]}));
      gd.position.set(-1.2+k*.8,1.08,-.5);s.add(gd);}
    const vk=fotevikenViking([0x3a5a8a,0x8a2a20,0x5a7a3a][n%3],n%3===0);vk.position.set(0,0,.9);vk.rotation.y=Math.PI;s.add(vk);
    s.position.set(Q.x,Q.y-.05,Q.z);s.rotation.y=Q.yaw+Math.PI/2;world.add(s);
  }
  /* the shield wall: a timber rail hung with painted round shields, just before the left turn onto the beach */
  const SC=[0xc8281c,0xe8c33a,0x2c5aa0,0xf2ece0,0x3a7a3a,0x1e1e22];
  const SW=new THREE.InstancedMesh(flat(new THREE.CylinderGeometry(.62,.62,.12,10)),psMat({color:0xffffff}),80);
  const BS=new THREE.InstancedMesh(flat(new THREE.SphereGeometry(.17,5,4)),psMat({color:0x9a9ea2}),80);
  let sw=0;const col=new THREE.Color();
  for(let i=488;i<=526;i+=1){
    for(const row of [0,1]){
      const o=-(HW+3.4+row*.5),Q=at(i,o);
      if(!free(Q.x,Q.z,2.4)||sw>=80)continue;
      p.set(Q.x,Q.y+.95+row*.7,Q.z);e.set(Math.PI/2,Q.yaw+Math.PI/2,0,'YXZ');q.setFromEuler(e);
      m4.compose(p,q,one);SW.setMatrixAt(sw,m4);
      p.set(Q.x+rx[i]*.12,Q.y+.95+row*.7,Q.z+rz[i]*.12);m4.compose(p,q,one);BS.setMatrixAt(sw,m4);
      col.setHex(SC[Math.floor(hash2(i,row)*SC.length)]);SW.setColorAt(sw,col);sw++;
    }
  }
  SW.count=BS.count=sw;SW.instanceMatrix.needsUpdate=BS.instanceMatrix.needsUpdate=true;
  if(SW.instanceColor)SW.instanceColor.needsUpdate=true;
  world.add(SW);world.add(BS);
  for(let n=0;n<6;n++){                                       /* the warriors standing behind it */
    const Q=at(492+n*6,-(HW+5.4));if(!free(Q.x,Q.z,4))continue;
    const v=fotevikenViking([0x8a2a20,0x3a5a8a,0x6a5a40][n%3],true);v.position.set(Q.x,Q.y-.05,Q.z);v.rotation.y=Q.yaw+Math.PI/2;
    const sp=new THREE.Mesh(flat(new THREE.CylinderGeometry(.05,.05,3.4,4)),psMat({color:0x6b5540}));sp.position.set(.5,1.7,0);v.add(sp);
    world.add(v);
  }
  /* the upturned longship over the beach lane, on low stones; you drive in at the stern and out at the bow */
  const R=ALTS.find(a=>a.id==='langskepp');
  if(R){
    const jm=Math.round(R.n*.5),L=26;
    const hull=new THREE.Mesh(fotevikenHull(L,7.2,6.4,0,-.62,.62,10,8),psMat({map:fotevikenPlank,side:THREE.DoubleSide}));
    hull.rotation.z=Math.PI;hull.position.y=7.2;
    const g=new THREE.Group();g.add(hull);
    const dk=psMat({color:0x3c2a1a}),stoneM=psMat({color:0x8f8b83});
    for(const sg of [-1,1]){
      for(const zz of [-9,-3,3,9]){const st=new THREE.Mesh(flat(new THREE.DodecahedronGeometry(.9,0)),stoneM);st.position.set(sg*6.8,.3,zz);g.add(st);}
      const keelEnd=new THREE.Mesh(flat(new THREE.BoxGeometry(.5,.5,3)),dk);keelEnd.position.set(0,7.2,sg*(L*.31+1.4));g.add(keelEnd);
      const head=new THREE.Mesh(flat(new THREE.BoxGeometry(.6,1.6,.8)),dk);head.position.set(0,8.2,sg*(L*.31+2.7));head.rotation.x=sg*.4;g.add(head);
      const eye=new THREE.Mesh(flat(new THREE.BoxGeometry(.7,.25,.25)),psMat({color:0xe8c33a,unlit:true}));eye.position.set(0,8.6,sg*(L*.31+2.9));g.add(eye);
    }
    g.position.set(R.X[jm],R.Y[jm]-.2,R.Z[jm]);g.rotation.y=Math.atan2(R.FX[jm],R.FZ[jm]);world.add(g);
    /* oars and a mast laid out on the sand beside it */
    for(let k=0;k<6;k++){
      const jj=jm-10+k*4,o=(k%2?1:-1)*(R.hw+3.5),x=R.X[jj]+R.RX[jj]*o,z=R.Z[jj]+R.RZ[jj]*o;
      const oar=new THREE.Mesh(flat(new THREE.BoxGeometry(.18,.12,5.5)),psMat({color:0x8a7259}));
      oar.position.set(x,meshY(x,z)+.1,z);oar.rotation.y=Math.atan2(R.FX[jj],R.FZ[jj])+.3*(k%3-1);world.add(oar);
    }
  }
  /* birch and alder clumps inland, juniper on the dunes */
  const TT=300;
  const trunk=new THREE.InstancedMesh(flat(new THREE.CylinderGeometry(.18,.26,3.4,5)).translate(0,1.7,0),psMat({color:0xe4e0d6}),TT);
  const crown=new THREE.InstancedMesh(flat(new THREE.SphereGeometry(2.0,6,5)).translate(0,4.4,0),psMat({color:0x6f9a42}),TT);
  const jun=new THREE.InstancedMesh(flat(new THREE.ConeGeometry(1.1,2.6,5)).translate(0,1.3,0),psMat({color:0x3e5e34}),TT);
  let t=0,ju=0;guard=0;
  while((t<TT||ju<TT)&&guard++<30000){
    const x=rand(-460,460),z=rand(-460,460),d=fotevikenSea(x,z);
    if(d>-10||!free(x,z,9)||Math.hypot(x-C.x,(z-C.z)/.8)<PR+8)continue;
    if(FOTEVIKEN_CATS.some(S=>{const c=fotevikenCatXZ(S);return Math.hypot(x-c.x,z-c.z)<22;}))continue;
    p.set(x,meshY(x,z)-.15,z);e.set(0,rand(0,6),0);q.setFromEuler(e);
    const s=rand(.75,1.3);sc.set(s,s,s);m4.compose(p,q,sc);
    if(d>-40||hash2(Math.floor(x/40),Math.floor(z/40))<.35){if(ju<TT)jun.setMatrixAt(ju++,m4);}
    else if(hash2(Math.floor(x/55),Math.floor(z/55))>.45&&t<TT){trunk.setMatrixAt(t,m4);crown.setMatrixAt(t,m4);t++;}
  }
  trunk.count=crown.count=t;jun.count=ju;
  trunk.instanceMatrix.needsUpdate=crown.instanceMatrix.needsUpdate=jun.instanceMatrix.needsUpdate=true;
  world.add(trunk);world.add(crown);world.add(jun);
  /* a painted rune stone by the road, and a fish-drying rack on the beach */
  {const Q=at(150,-(HW+7));const rs=new THREE.Mesh(flat(new THREE.BoxGeometry(1.6,3.2,.7)),psMat({map:pixTex(16,32,c=>{
      c.fillStyle='#8f8b83';c.fillRect(0,0,16,32);c.strokeStyle='#b8261c';c.lineWidth=2;
      c.beginPath();c.moveTo(3,30);c.quadraticCurveTo(2,4,8,3);c.quadraticCurveTo(14,4,13,30);c.stroke();
      c.fillStyle='#1e1e22';for(let k=0;k<6;k++)c.fillRect(6+(k%2),7+k*3.5,4,1);})}));
    rs.position.set(Q.x,Q.y+1.5,Q.z);rs.rotation.y=Q.yaw+Math.PI/2;world.add(rs);}
  for(const [x,z] of [[-140,-168],[160,-160]]){
    if(!free(x,z,5))continue;
    const y=meshY(x,z),g=new THREE.Group();
    for(const sg of [-1,1]){const po=new THREE.Mesh(flat(new THREE.BoxGeometry(.2,2.4,.2)),psMat({color:0x6b5540}));po.position.set(sg*2.5,1.2,0);g.add(po);}
    const bar=new THREE.Mesh(flat(new THREE.BoxGeometry(5.4,.15,.15)),psMat({color:0x6b5540}));bar.position.y=2.3;g.add(bar);
    for(let k=0;k<8;k++){const f=new THREE.Mesh(flat(new THREE.BoxGeometry(.25,.9,.08)),psMat({color:0xb8b0a0}));f.position.set(-2.1+k*.6,1.75,0);g.add(f);}
    g.position.set(x,y,z);world.add(g);
  }
  fotevikenShips=ships;
}
let fotevikenShips=[];
/* the catapults: [sample, side, distance off the road edge, targets as [sample, lat]] */
const FOTEVIKEN_CATS=[{ci:215,side:1,off:19,tg:[[188,-3.2],[214,3.4],[240,-1.4]],period:4.2,phase:0},
                      {ci:425,side:1,off:18,tg:[[402,2.8],[428,-3.4],[452,1.2]],period:4.6,phase:2.1}];
const fotevikenCatXZ=S=>{const o=S.side*(HW+S.off);return {x:sx[S.ci]+rx[S.ci]*o,z:sz[S.ci]+rz[S.ci]*o};};

/** the catapults: each lobs a barrel at a spot on the road; the spot is ringed first, then the barrel lands and bursts */
function hazardsFoteviken(H){
  const ringT=pixTex(32,32,g=>{
    g.strokeStyle='#ffffff';g.lineWidth=3;g.beginPath();g.arc(16,16,13,0,6.283);g.stroke();
    g.lineWidth=2;g.beginPath();g.arc(16,16,6,0,6.283);g.stroke();
    g.fillRect(15,1,2,6);g.fillRect(15,25,2,6);g.fillRect(1,15,6,2);g.fillRect(25,15,6,2);
  });
  const wood=psMat({color:0x6b5540}),dark=psMat({color:0x3c2a1a}),rope=psMat({color:0xb8a070});
  const barrelG=flat(new THREE.CylinderGeometry(.75,.75,1.4,8));
  const barrelM=psMat({color:0x8a6236}),hoopM=psMat({color:0x3a3632});
  const makeBarrel=()=>{const b=new THREE.Group();b.add(new THREE.Mesh(barrelG,barrelM));
    for(const y of [-.45,.45]){const h=new THREE.Mesh(flat(new THREE.CylinderGeometry(.79,.79,.14,8)),hoopM);h.position.y=y;b.add(h);}return b;};
  const SPEC=FOTEVIKEN_CATS;
  SPEC.forEach((S,n)=>{
    const c0=fotevikenCatXZ(S),cx=c0.x,cz=c0.z,cy=meshY(cx,cz);
    /* a mangonel: frame, axle, an arm that whips up against the crossbar */
    const cat=new THREE.Group();
    for(const sg of [-1,1]){
      const rail=new THREE.Mesh(flat(new THREE.BoxGeometry(.5,.5,7)),wood);rail.position.set(sg*1.4,.5,0);cat.add(rail);
      const up=new THREE.Mesh(flat(new THREE.BoxGeometry(.4,3.6,.4)),wood);up.position.set(sg*1.4,2.3,1.2);cat.add(up);
      for(const zz of [-2.6,2.6]){const wh=new THREE.Mesh(flat(new THREE.CylinderGeometry(.8,.8,.3,8)),dark);wh.rotation.z=Math.PI/2;wh.position.set(sg*1.75,.8,zz);cat.add(wh);}
    }
    const cross=new THREE.Mesh(flat(new THREE.BoxGeometry(3.2,.4,.4)),wood);cross.position.set(0,4.0,1.2);cat.add(cross);
    const axle=new THREE.Mesh(flat(new THREE.BoxGeometry(2.8,.5,.5)),rope);axle.position.set(0,.9,-1.6);cat.add(axle);
    /* the arm lies back along -z and whips up and over toward the road */
    const arm=new THREE.Group();arm.position.set(0,.9,-1.6);cat.add(arm);
    const beam=new THREE.Mesh(flat(new THREE.BoxGeometry(.35,.35,6.2)),dark);beam.position.z=-3.1;arm.add(beam);
    const cup=new THREE.Mesh(flat(new THREE.BoxGeometry(1.4,.4,1.4)),wood);cup.position.set(0,.3,-6.0);arm.add(cup);
    const loaded=makeBarrel();loaded.rotation.x=Math.PI/2;loaded.position.set(0,1.1,-6.0);arm.add(loaded);
    for(let k=0;k<3;k++){const v=fotevikenViking([0x8a2a20,0x3a5a8a,0x6a5a40][k],k!==1);
      v.position.set(k===1?-3.4:(k?2.8:-2.8),0,k===1?-7.5:-4.4);v.rotation.y=k===1?0:(k?-1.2:1.2);cat.add(v);}
    const pile=[];for(let k=0;k<5;k++){const b=makeBarrel();b.position.set(-4.6-(k%3)*1.6,.7+(k>2?1.4:0),-1+(k>2?.8:0)+(k%3)*.1);cat.add(b);pile.push(b);}
    const flag=new THREE.Mesh(new THREE.PlaneGeometry(1.6,1),psMat({color:0xc8281c,side:THREE.DoubleSide}));
    flag.position.set(-1.4,4.4,1.2);cat.add(flag);
    const fp=new THREE.Mesh(flat(new THREE.CylinderGeometry(.06,.06,2,4)),dark);fp.position.set(-1.4,4.4,1.2);cat.add(fp);
    flag.position.x=-2.2;
    cat.scale.set(1.3,1.3,1.3);cat.position.set(cx,cy,cz);world.add(cat);
    /* aim the frame at the middle target */
    const mid=mainPt(S.tg[1][0],S.tg[1][1]);cat.rotation.y=Math.atan2(mid.x-cx,mid.z-cz);
    /* the flying barrel, its ring on the road, its shadow, and the staves when it bursts */
    const fly=makeBarrel();fly.visible=false;world.add(fly);
    const ring=new THREE.Mesh(new THREE.PlaneGeometry(6.4,6.4).rotateX(-Math.PI/2),
      psMat({map:ringT,color:0xff5a2a,unlit:true,transparent:true,alphaTest:.4,depthWrite:false}));
    ring.visible=false;world.add(ring);
    const shadow=new THREE.Mesh(new THREE.CircleGeometry(1.2,10).rotateX(-Math.PI/2),
      psMat({color:0x000000,unlit:true,transparent:true,opacity:.45,depthWrite:false}));
    shadow.visible=false;world.add(shadow);
    const staves=[];for(let k=0;k<8;k++){const s=new THREE.Mesh(flat(new THREE.BoxGeometry(.3,1.3,.12)),barrelM);s.visible=false;world.add(s);staves.push(s);}
    let lastCyc=-1,burst=false;
    const T0=0.3,T1=0.72;                                    /* release, and landing */
    H.push({id:'katapult'+n,period:S.period,phase:S.phase,mesh:cat,
      update(u){
        const cyc=Math.floor((raceTime+S.phase)/S.period);
        if(cyc!==lastCyc){lastCyc=cyc;burst=false;}
        const T=S.tg[((cyc%3)+3)%3],q=mainPt(T[0],T[1]);this.p=q;this.u=u;
        /* the arm: hauled back, whipped up at release, eased down again */
        let a;
        if(u<T0)a=0.12-0.1*smooth(0,T0,u);
        else if(u<T0+.05)a=lerp(0.02,1.75,smooth(T0,T0+.05,u));
        else a=lerp(1.75,0.12,smooth(T0+.15,.95,u));
        arm.rotation.x=a;flag.rotation.y=Math.sin(clock*3+n)*.4;loaded.visible=u<T0||u>.9;
        const pv=pile[cyc%5];pile.forEach(b=>b.visible=b!==pv||u<.85);
        /* flight: from the cup at release to the ring */
        const ox=cx,oy=cy+8.6,oz=cz;
        if(u>=T0&&u<T1){
          const f=(u-T0)/(T1-T0),hy=lerp(oy,q.y+.75,f)+Math.sin(Math.PI*f)*22;
          fly.visible=true;fly.position.set(lerp(ox,q.x,f),hy,lerp(oz,q.z,f));fly.rotation.set(f*9,f*4,0);
          shadow.visible=true;shadow.position.set(q.x,q.y+.08,q.z);const s=.4+.9*f;shadow.scale.set(s,1,s);
        }else{fly.visible=false;shadow.visible=false;}
        /* the ring shows from the moment the arm is hauled back */
        if(u>0.04&&u<T1+.04){
          ring.visible=true;ring.position.set(q.x,q.y+.12,q.z);
          const g=.55+.45*smooth(.04,T1,u),pl=1+Math.sin(clock*14)*.06*(u>.5?1:0);ring.scale.set(g*pl,1,g*pl);
          ring.material.uniforms.uOpacity.value=.55+.45*smooth(.3,T1,u);
        }else ring.visible=false;
        /* the burst: staves fly, dust and herring brine */
        if(u>=T1&&!burst){burst=true;
          for(let k=0;k<12;k++)puff(q.x+rand(-1.5,1.5),q.y+rand(.3,1.6),q.z+rand(-1.5,1.5),.62,.48,.3,.7);
          if(typeof player!=='undefined'&&player&&Math.hypot(player.x-q.x,player.z-q.z)<60){
            ping(220,60,.25);if(Math.hypot(player.x-q.x,player.z-q.z)<22)shake=Math.min(1,shake+.25);}
        }
        const bt=(u-T1)/.22;
        staves.forEach((s,k)=>{
          if(bt<0||bt>1){s.visible=false;return;}
          const a2=k/8*6.283,r2=1+bt*5;s.visible=true;
          s.position.set(q.x+Math.cos(a2)*r2,q.y+.6+Math.sin(Math.PI*Math.min(1,bt*1.3))*2.2,q.z+Math.sin(a2)*r2);
          s.rotation.set(bt*7+k,a2,bt*5);
        });
      },
      hit(k,u){return this.p&&u>=T1&&u<T1+.05&&near3(k,this.p.x,this.p.y,this.p.z,3.2);},
      effect(k){k.spun=Math.max(k.spun,0.9*k.spinResist);k.boost=0;k.drift=0;k.charge=0;
        if(k===player){toast('TUNNAN TRÄFFADE!');ping(300,80,.3);shake=Math.min(1,shake+.5);}}});
  });
  /* the breeze: sails on the beached ships fill and slacken (no hit) */
  H.push({id:'bris',period:6,phase:0,update(u){
    for(const s of fotevikenShips){const sl=s.userData.sail;if(!sl)continue;
      sl.scale.set(1,1,1);sl.rotation.x=.08+Math.sin(clock*1.3+s.position.x)*.12;}}});
}
