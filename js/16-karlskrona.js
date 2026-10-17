"use strict";
/* ───────── Karlskrona: örlogsvarvet ───────── */
/* Imperial Grand Prix's counterpart: a fast run through the old naval dockyard, the long straight beside the ropewalk,
   a secret quay passage behind a stack of herring barrels, and the fortress across the water firing cannonballs */
ROADTEX.kkrSten=()=>pixTex(64,64,g=>{                 /* big granite setts, laid in courses */
  g.fillStyle='#4a4644';g.fillRect(0,0,64,64);
  for(let r=0;r<8;r++)for(let c=0;c<6;c++){
    const o=(r%2)?5:0,v=104+((Math.random()*40)|0),pk=Math.random()>.7?14:0;
    g.fillStyle='rgb('+(v+pk)+','+(v-4)+','+(v-8-pk/2)+')';
    g.fillRect((c*11+o)%64,r*8+1,9,6);
    g.fillStyle='rgba(255,255,255,.12)';g.fillRect((c*11+o)%64,r*8+1,9,1);
  }
  for(let i=0;i<120;i++){g.fillStyle='rgba(30,28,26,.35)';g.fillRect((Math.random()*64)|0,(Math.random()*64)|0,1,1);}
});
VERGEC.kkrKant=['#9a958e','#b4b0a8','#77736c'];
GROUND.kkrVarv={cell:30,stripe:0.9,verge:0x8e8a84,
  cols:[0x8a857c,0x7d786f,0x6e8a4c,0x7a9a52,0x948d80,0x6a665e,0x86a058]};
EDGES.kkrPollare=st=>{                               /* cast-iron bollards with a chain slung between */
  const step=4,cnt=Math.ceil(N/step)*2;
  const post=new THREE.InstancedMesh(flat(new THREE.CylinderGeometry(.2,.26,1.1,6)),psMat({color:0x26282c}),cnt);
  const cap=new THREE.InstancedMesh(flat(new THREE.SphereGeometry(.24,6,4)),psMat({color:0x26282c}),cnt);
  const chain=new THREE.InstancedMesh(flat(new THREE.BoxGeometry(.07,.07,SEG*step*.52)),psMat({color:0x4a4c50}),cnt*2);
  const m4=new THREE.Matrix4(),q=new THREE.Quaternion(),e=new THREE.Euler(),p=new THREE.Vector3(),one=new THREE.Vector3(1,1,1);
  /* where buildStations will put the pumps: the edges are built before the stations are */
  const pumps=(st.stations||[[0.27,1],[0.71,-1]]).map(sp=>{let at=Math.round(N*sp[0]);
    for(const J of JUMPS)if(Math.min(Math.abs(at-J.at),N-Math.abs(at-J.at))<J.up+J.dn+16)at=(at+46)%N;
    return {at:(at-2+N)%N,side:sp[1],len:14};});
  let a=0,b=0;
  for(let i=0;i<N;i+=step)for(const side of [-1,1]){
    const o=side*(HW+3.6),x=sx[i]+rx[i]*o,z=sz[i]+rz[i]*o;
    if(nearAlt(x,z,2.2))continue;
    if(pumps.some(S=>side===S.side&&((i-S.at+N)%N)<S.len+4))continue;   /* the forecourts stay open */
    const y=meshY(x,z),yaw=Math.atan2(fx[i],fz[i]);
    e.set(0,yaw,0);q.setFromEuler(e);
    p.set(x,y+.55,z);m4.compose(p,q,one);post.setMatrixAt(a,m4);
    p.set(x,y+1.12,z);m4.compose(p,q,one);cap.setMatrixAt(a,m4);a++;
    const j=(i+step)%N,x2=sx[j]+rx[j]*o,z2=sz[j]+rz[j]*o;
    if(nearAlt(x2,z2,2.2))continue;
    const y2=meshY(x2,z2),dx=x2-x,dz=z2-z,cy=Math.atan2(dx,dz);
    for(const h of [0,1]){                              /* two links sagging to the middle */
      const mx=x+dx*(.25+h*.5),mz=z+dz*(.25+h*.5),my=lerp(y,y2,.25+h*.5)+.72;
      e.set(h?-.35:.35,cy,0,'YXZ');q.setFromEuler(e);p.set(mx,my,mz);m4.compose(p,q,one);chain.setMatrixAt(b++,m4);
    }
  }
  post.count=cap.count=a;chain.count=b;
  post.instanceMatrix.needsUpdate=cap.instanceMatrix.needsUpdate=chain.instanceMatrix.needsUpdate=true;
  world.add(post);world.add(cap);world.add(chain);
};
/* the harbour lies south and east of the yard; d > 0 is open water, the quay edge sits on a terrain grid line */
const karlskronaSea=(x,z)=>Math.max(z-160,x-300);

STAGES.push({ id:'karlskrona', group:'kust', name:'KARLSKRONA', sub:'ÖRLOGSVARVET',
  order:8, tag:'Fullt ös genom det gamla örlogsvarvet längs repslagarbanan. Fortet på andra sidan vattnet skjuter kanonkulor.',
  view:{x:20,z:140,h:9,to:{x:70,z:330,h:2},fov:55},
  hw:8.4,
  bars:[0.85,0.55,0.45], laps:3,
  blurb:'The old naval dockyard: three hundred metres of red ropewalk beside the long straight, granite quays, wooden warships at their moorings and a ship up in the dry dock. A secret passage runs along the quay, but a stack of herring barrels blocks the mouth: blow it apart with a spettekaka. Across the water Kungsholms fort is firing, and a cannonball landing on its mark spins you round.',
  role:'Långa raka på kullersten och kanonkulor från fästningen.',
  sky:[0xf4e6cc,0x4f86c0], fog:[0xdcd6c8,100,470], amb:0x6c6c74, dif:0xffe8c4,
  road:'kkrSten', verge:'kkrKant', edge:'kkrPollare', ground:'kkrVarv', paint:false,
  sfxRoad:'cobble', terrain:{size:960,seg:96},
  jumpSpec:[{h:3.4,drop:2.4,up:12,dn:7,rec:16},{h:2.6,drop:1.8,up:10,dn:6,rec:14}],
  ctrl:[[-120,3,-164],[ -20,3,-164],[  80,3,-162],[ 170,3,-158],[ 226,4,-128],
        [ 240,5, -72],[ 216,6, -20],[ 230,6,  32],[ 206,4,  82],[ 150,2, 114],
        [  95,2, 120],[  45,2,  80],[   0,2,  56],[ -50,2,  80],[-100,2, 120],
        [-158,3, 104],[-172,5,  45],[-125,7,   2],[ -92,8, -40],[-118,7, -84],
        [-172,5, -98],[-214,4,-124],[-212,3,-158],[-172,3,-170]],
  /* a flat town on the rock; the quay drops straight into the harbour */
  mod:(x,z,t)=>-rolls(x,z)*t*0.95-8*smooth(.5,9.5,karlskronaSea(x,z)),
  land:(x,z,out)=>{
    const d=karlskronaSea(x,z);
    if(d>0)out.setHex(0x3a5a66);
    else if(d>-16)out.setHex(hash2(Math.floor(x/4),Math.floor(z/4))>.5?0x9a958c:0x8a857c);   /* granite quay */
  },
  stations:[[0.2,1],[0.6,1]],
  hazards:H=>hazardsKarlskrona(H), scenery:()=>sceneryKarlskrona(),
  routes:[
    {id:'kaj',name:'KAJEN',a:322,b:462,hw:4.0,side:-1,lead:9,leadLat:10,
     mid:[[0.5,-12]],surface:'cobble',risk:0.25,hidden:true,shoot:true,
     blurb:'Straight along the quay edge past the moored warships. A stack of herring barrels blocks the way in.',
     blockMesh:(R,j)=>karlskronaBarrels(R,j),
     blockAnim:(B,drop)=>karlskronaScatter(B,drop)}],
  stamps:[
    {id:'kkr1',dish:'Kroppkakor',ini:'K',kind:'intro',route:'main',i:70,lat:-6.2,
     hint:'Längs repslagarbanan, på vänster sida.',
     story:'Blekinge\'s potato dumplings: grated raw potato and flour wrapped round diced salt pork and onion, simmered until they float, and served with melted butter and lingonberries. The dockyard workers\' wives made them by the potful, and Karlskrona still argues with Öland over whose are right.'},
    {id:'kkr2',dish:'Sotare',ini:'S',kind:'line',route:'main',i:'tight',lat:'inside',
     hint:'Tätt intill innerkanten i den tväraste kurvan.',
     story:'Sotare, chimney sweeps, are fresh Baltic herring grilled whole over a hot fire until the skins go black with soot. On the Blekinge archipelago they are eaten on the jetty, straight off the grill, with salt and a slice of rye bread.'},
    {id:'kkr3',dish:'Skeppsskorpor',ini:'S',kind:'master',route:'kaj',f:0.62,lat:'edge',
     hint:'Vid kanten av kajpassagen bakom sillfaten. Kanske en spettekaka?',
     story:'Ship\'s biscuit: rye and wheat dough baked hard and dried twice, so it would last a year at sea. The navy\'s own bakery in Karlskrona turned them out by the barrel. Sailors soaked them in beer or soup before risking a tooth on one.'}] });

/** a stack of herring barrels across the passage mouth: 4, 3, 2 high, two deep */
function karlskronaBarrels(R,j){
  const g=new THREE.Group();g.rotation.y=Math.atan2(R.FX[j],R.FZ[j]);
  const bG=flat(new THREE.CylinderGeometry(.55,.48,1.0,8)),bM=psMat({color:0x9a7448}),hM=psMat({color:0x2e2c2a});
  const lid=psMat({map:pixTex(16,16,c=>{c.fillStyle='#b88e5a';c.fillRect(0,0,16,16);
    c.fillStyle='#e8e4dc';c.beginPath();c.ellipse(8,8,6,2.4,0,0,6.283);c.fill();c.fillRect(1,6,3,4);c.fillStyle='#2e2c2a';c.fillRect(11,7,1,1);})});
  const list=[];
  for(const [row,n] of [[0,4],[1,3],[2,2]])for(let k=0;k<n;k++)for(const dz of [0,1.1]){
    const b=new THREE.Group();
    b.add(new THREE.Mesh(bG,bM));
    for(const y of [-.32,.32]){const h=new THREE.Mesh(flat(new THREE.CylinderGeometry(.56,.56,.1,8)),hM);h.position.y=y;b.add(h);}
    const top=new THREE.Mesh(new THREE.CircleGeometry(.5,8).rotateX(-Math.PI/2),lid);top.position.y=.51;b.add(top);
    const x=(k-(n-1)/2)*1.15,y=.5+row*1.0,z=dz-.55+(row%2)*.1;
    b.position.set(x,y,z);b.userData.base=new THREE.Vector3(x,y,z);
    b.userData.dir=(x===0?(dz?1:-1):Math.sign(x));b.userData.h=hash2(k*3+row,dz*7);
    g.add(b);list.push(b);
  }
  g.userData.barrels=list;return g;
}
/** the rocket blows them out to both sides, where they roll to a stop */
function karlskronaScatter(B,drop){
  for(const b of B.mesh.userData.barrels){
    const u=b.userData,s=u.dir,h=u.h,f=drop;
    const far=4.8+h*3.2+u.base.y;
    b.position.set(u.base.x*(1-f)+s*far*f,u.base.y*(1-f)+.5*f+Math.sin(Math.PI*Math.min(1,f*1.15))*(2.5+u.base.y),u.base.z+(h-.5)*5*f);
    b.rotation.set(0,h*6*f,s*Math.PI/2*Math.min(1,f*1.4)+f*h*3);
  }
}
/** a hull lofted between stem and stern, keel at y=0 */
function karlskronaHull(L,b,D,sheer,nl,na){
  const pos=[],uv=[],idx=[];
  for(let i=0;i<=nl;i++){
    const s=-1+2*i/nl,bw=b*Math.pow(Math.max(0,1-Math.pow(Math.abs(s),2.4)),.5)*(s>0?1:Math.max(.62,1-.4*s*s))+.05,dd=D+sheer*s*s;
    for(let a=0;a<=na;a++){
      const th=-Math.PI/2+Math.PI*a/na,c=Math.cos(th);
      pos.push(bw*Math.sin(th)*(1-.18*c),dd*(1-Math.pow(c,.6)),s*L/2);
      uv.push(a/na,i/nl);
    }
  }
  for(let i=0;i<nl;i++)for(let a=0;a<na;a++){const p=i*(na+1)+a,q=p+na+1;idx.push(p,q,p+1,q,q+1,p+1);}
  const g=new THREE.BufferGeometry();
  g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));
  g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));
  g.setIndex(idx);return flat(g);
}
const karlskronaHullTex=pixTex(32,64,g=>{
  g.fillStyle='#3a2a1e';g.fillRect(0,0,32,64);
  for(const [u0,u1] of [[0,5],[27,32]]){
    g.fillStyle='#1a1614';g.fillRect(u0,0,u1-u0,64);
    const w=u0?27:2;g.fillStyle='#c89a3a';g.fillRect(u0?24:5,0,3,64);
    g.fillStyle='#1a1614';for(let v=4;v<60;v+=7)g.fillRect(u0?24:5,v,3,3);
  }
  g.fillStyle='#2a1e16';for(let u=6;u<26;u+=3)g.fillRect(u,0,1,64);
});
/** a ship of the line at her moorings: three masts, yards with furled sails, an ensign */
function karlskronaShip(L,ensign){
  const g=new THREE.Group(),dk=psMat({color:0x2a1e16}),sailM=psMat({color:0xeae4d4});
  g.add(new THREE.Mesh(karlskronaHull(L,5.2,6,1.6,16,8),psMat({map:karlskronaHullTex,side:THREE.DoubleSide})));
  const deck=new THREE.Mesh(flat(new THREE.BoxGeometry(8.6,.3,L*.82)),psMat({color:0x8a7258}));deck.position.y=5.9;g.add(deck);
  const stern=new THREE.Mesh(flat(new THREE.BoxGeometry(8.4,3,5)),psMat({color:0x3a2a1e}));stern.position.set(0,7.2,-L*.4);g.add(stern);
  const gilt=new THREE.Mesh(flat(new THREE.BoxGeometry(8.6,.6,5.2)),psMat({color:0xc89a3a}));gilt.position.set(0,8.6,-L*.4);g.add(gilt);
  const bow=new THREE.Mesh(flat(new THREE.CylinderGeometry(.25,.35,14,5)),dk);bow.position.set(0,9,L*.5+4);bow.rotation.x=1.1;g.add(bow);
  for(const [zf,h] of [[.28,26],[0,30],[-.26,22]]){
    const m=new THREE.Mesh(flat(new THREE.CylinderGeometry(.3,.5,h,6)),dk);m.position.set(0,6+h/2,zf*L);g.add(m);
    for(const yf of [.45,.72,.92]){
      const w=13*(1.15-yf*.5);
      const yd=new THREE.Mesh(flat(new THREE.BoxGeometry(w,.25,.25)),dk);yd.position.set(0,6+h*yf,zf*L);g.add(yd);
      const sl=new THREE.Mesh(flat(new THREE.CylinderGeometry(.4,.4,w*.9,6)),sailM);sl.rotation.z=Math.PI/2;sl.position.set(0,6+h*yf-.45,zf*L);g.add(sl);
    }
  }
  if(ensign){
    const fl=new THREE.Mesh(new THREE.PlaneGeometry(4,2.4),psMat({side:THREE.DoubleSide,map:pixTex(20,12,c=>{
      c.fillStyle='#1f5aa8';c.fillRect(0,0,20,12);c.fillStyle='#f0c419';c.fillRect(6,0,2,12);c.fillRect(0,5,20,2);
      c.clearRect(16,4,4,4);})}));
    fl.position.set(0,11,-L*.4-3.4);fl.rotation.y=Math.PI/2;g.add(fl);g.userData.flag=fl;
  }
  return g;
}

function sceneryKarlskrona(){
  const m4=new THREE.Matrix4(),q=new THREE.Quaternion(),e=new THREE.Euler(),
        p=new THREE.Vector3(),sc=new THREE.Vector3(),one=new THREE.Vector3(1,1,1);
  const at=(i,o)=>{i=((Math.round(i)%N)+N)%N;const x=sx[i]+rx[i]*o,z=sz[i]+rz[i]*o;return {x,z,y:meshY(x,z),yaw:Math.atan2(fx[i],fz[i])};};
  const free=(x,z,pad)=>latAt(x,z)>HW+pad&&!stations.some(S=>{const i=(S.at+6)%N,o=S.side*(HW+10);
    return Math.hypot(x-(sx[i]+rx[i]*o),z-(sz[i]+rz[i]*o))<22;});
  /* the big footprints, so trees and barrels keep out of them: [x, z, radius] */
  const TAKEN=[[0,110,26],[-30,-40,22],[255,128,16],[95,-10,22],[100,40,15],[-45,-95,17],[-210,10,19],[150,-80,14]];
  const taken=(x,z,pad)=>TAKEN.some(T=>Math.hypot(x-T[0],z-T[1])<T[2]+pad);
  /* a footprint is clear when its corners and middle are all off the road */
  const freeRect=(x,z,w,d,yaw,pad)=>[[0,0],[-1,-1],[1,-1],[-1,1],[1,1],[-1,0],[1,0],[0,-1],[0,1]].every(([a,b])=>{
    const lx=a*w/2,lz=b*d/2;return free(x+lx*Math.cos(yaw)+lz*Math.sin(yaw),z-lx*Math.sin(yaw)+lz*Math.cos(yaw),pad);});
  const box=(w,h,d,col)=>new THREE.Mesh(flat(new THREE.BoxGeometry(w,h,d)),typeof col==='number'?psMat({color:col}):col);
  /* the harbour, and the granite quay wall along its edge */
  const sea=new THREE.Mesh(new THREE.PlaneGeometry(2600,2600).rotateX(-Math.PI/2),psMat({color:0x2f6688}));
  sea.position.set(0,-1.6,0);world.add(sea);
  const qw=new THREE.InstancedMesh(flat(new THREE.BoxGeometry(10.2,1,2)),psMat({color:0x8f8a82}),200);
  let nq=0;
  for(let x=-475;x<300;x+=10){const y=meshY(x+5,158);p.set(x+5,(y-3.2)/2+.15,161);sc.set(1,y+3.2+.3,1);q.identity();m4.compose(p,q,sc);qw.setMatrixAt(nq++,m4);}
  for(let z=-475;z<160;z+=10){const y=meshY(298,z+5);p.set(301,(y-3.2)/2+.15,z+5);sc.set(1,y+3.2+.3,1);e.set(0,Math.PI/2,0);q.setFromEuler(e);m4.compose(p,q,sc);qw.setMatrixAt(nq++,m4);}
  qw.count=nq;qw.instanceMatrix.needsUpdate=true;world.add(qw);
  const ripple=new THREE.InstancedMesh(new THREE.PlaneGeometry(6,.4).rotateX(-Math.PI/2),
    psMat({color:0xcfe0ea,unlit:true,transparent:true,opacity:.45,depthWrite:false}),120);
  let rp=0;for(let k=0;k<400&&rp<120;k++){const x=rand(-470,470),z=rand(-470,470);if(karlskronaSea(x,z)<6)continue;
    p.set(x,-1.54,z);e.set(0,rand(-.2,.2),0);q.setFromEuler(e);sc.set(rand(.5,1.5),1,1);m4.compose(p,q,sc);ripple.setMatrixAt(rp++,m4);}
  ripple.count=rp;ripple.instanceMatrix.needsUpdate=true;world.add(ripple);
  /* the ropewalk: one red building three hundred metres long, beside the start straight */
  const RW={x0:-140,x1:160,z:-183,d:10,h:7};
  const winT=pixTex(32,32,c=>{c.fillStyle='#8b2b1c';c.fillRect(0,0,32,32);c.fillStyle='#7a2416';for(let y=0;y<32;y+=3)c.fillRect(0,y,32,1);
    for(const x of [4,20]){c.fillStyle='#ece6d8';c.fillRect(x,6,8,10);c.fillStyle='#3a4450';c.fillRect(x+1,7,6,8);c.fillStyle='#ece6d8';c.fillRect(x+3,7,1,8);c.fillRect(x+1,10,6,1);}
    c.fillStyle='#ece6d8';c.fillRect(0,26,32,2);});
  const segs=Math.round((RW.x1-RW.x0)/8);
  const wall=new THREE.InstancedMesh(flat(new THREE.BoxGeometry(8,RW.h,RW.d)),psMat({map:winT}),segs);
  const roofL=new THREE.InstancedMesh(flat(new THREE.BoxGeometry(8.02,.3,RW.d*.62)),psMat({color:0x4a4644}),segs*2);
  let wr=0;
  for(let k=0;k<segs;k++){
    const x=RW.x0+4+k*8,y=meshY(x,RW.z);
    p.set(x,y+RW.h/2-.3,RW.z);q.identity();m4.compose(p,q,one);wall.setMatrixAt(k,m4);
    for(const sg of [-1,1]){p.set(x,y+RW.h-.3+1.45,RW.z+sg*RW.d*.27);e.set(-sg*.55,0,0);q.setFromEuler(e);m4.compose(p,q,one);roofL.setMatrixAt(wr++,m4);}
  }
  wall.count=segs;roofL.count=wr;wall.instanceMatrix.needsUpdate=roofL.instanceMatrix.needsUpdate=true;world.add(wall);world.add(roofL);
  for(const x of [RW.x0-6,RW.x1+6,10]){                    /* gable houses at each end and a gate block in the middle */
    const y=meshY(x,RW.z),hb=box(12,10,13,0x9a2f1e);hb.position.set(x,y+5,RW.z);world.add(hb);
    const r=gableRoof(13,14,4,0x4a4644);r.rotation.y=Math.PI/2;r.position.set(x,y+10,RW.z);world.add(r);
    const door=box(3,4,.3,0x2e2420);door.position.set(x,y+2,RW.z+6.6);world.add(door);
  }
  {const x=10,y=meshY(x,RW.z),cl=box(3,3,3,0xece6d8);cl.position.set(x,y+15.5,RW.z);world.add(cl);
    const sp=new THREE.Mesh(flat(new THREE.ConeGeometry(2.1,5,4)),psMat({color:0x3a6a5a}));sp.position.set(x,y+19.5,RW.z);sp.rotation.y=.785;world.add(sp);}
  /* rope coils and tarred hemp along the front of it */
  const coil=new THREE.InstancedMesh(flat(new THREE.CylinderGeometry(.8,.8,.5,8)),psMat({color:0xb89a64}),24);
  for(let k=0;k<24;k++){const x=RW.x0+10+k*12+hash2(k,2)*4,z=RW.z+7.5;p.set(x,meshY(x,z)+.25+(k%3===0?.5:0),z);q.identity();m4.compose(p,q,one);coil.setMatrixAt(k,m4);}
  coil.instanceMatrix.needsUpdate=true;world.add(coil);
  /* yellow stone storehouses and the admiralty church in the yard */
  for(const [x,z,w,d,yaw] of [[95,-10,40,16,.1],[100,40,26,14,-.2],[-45,-95,30,14,0],[-210,10,22,30,.05],[150,-80,24,14,.4]]){
    if(!freeRect(x,z,w,d,yaw,4))continue;
    const y=meshY(x,z),hb=box(w,11,d,0xd8b45a);hb.position.set(x,y+5.5,z);hb.rotation.y=yaw;world.add(hb);
    const tr=box(w+.4,.6,d+.4,0xece6d8);tr.position.set(x,y+11,z);tr.rotation.y=yaw;world.add(tr);
    const r=gableRoof(w*1.04,d*1.1,4.5,0x3e4448);r.position.set(x,y+11.2,z);r.rotation.y=yaw;world.add(r);
    for(let k=0;k<Math.floor(w/5);k++)for(const sg of [-1,1]){
      const wn=box(1.4,2.2,.2,0x2a3440);const lx=-w/2+3+k*5,lz=sg*(d/2+.05);
      wn.position.set(x+lx*Math.cos(yaw)+lz*Math.sin(yaw),y+6,z-lx*Math.sin(yaw)+lz*Math.cos(yaw));wn.rotation.y=yaw;world.add(wn);
    }
  }
  {const x=-30,z=-40;if(freeRect(x,z,28,28,.3,4)){const y=meshY(x,z),ch=new THREE.Group();   /* Ulrica Pia, the red wooden church */
    const a=box(28,10,12,0x8b2b1c),b=box(12,10,28,0x8b2b1c);a.position.y=b.position.y=5;ch.add(a);ch.add(b);
    const r1=gableRoof(29,13,5,0x2e2a28);r1.position.y=10;ch.add(r1);const r2=gableRoof(29,13,5,0x2e2a28);r2.rotation.y=Math.PI/2;r2.position.y=10.05;ch.add(r2);
    const tw=box(4,6,4,0xece6d8);tw.position.y=17;ch.add(tw);const sp=new THREE.Mesh(flat(new THREE.ConeGeometry(2.8,6,4)),psMat({color:0x2e2a28}));sp.position.y=23;sp.rotation.y=.785;ch.add(sp);
    ch.position.set(x,y,z);ch.rotation.y=.3;world.add(ch);}}
  /* lime trees in rows across the yard */
  const LT=160;
  const tk=new THREE.InstancedMesh(flat(new THREE.CylinderGeometry(.25,.35,3,5)).translate(0,1.5,0),psMat({color:0x4a3a2c}),LT);
  const cr=new THREE.InstancedMesh(flat(new THREE.SphereGeometry(2.4,6,5)).translate(0,4.6,0),psMat({color:0x5e8a3e}),LT);
  let nt=0;
  for(let gx=-300;gx<=300&&nt<LT;gx+=12)for(let gz=-300;gz<=150&&nt<LT;gz+=26){
    if(hash2(Math.floor(gx/60),Math.floor(gz/52))<.5)continue;
    const x=gx,z=gz+(hash2(gx,1)-.5)*2;
    if(!free(x,z,10)||karlskronaSea(x,z)>-20||(z<-170&&z>-200&&x>-160&&x<180)||taken(x,z,4))continue;
    p.set(x,meshY(x,z)-.1,z);q.identity();const s=.85+hash2(gx,gz)*.3;sc.set(s,s,s);m4.compose(p,q,sc);tk.setMatrixAt(nt,m4);cr.setMatrixAt(nt,m4);nt++;
  }
  tk.count=cr.count=nt;tk.instanceMatrix.needsUpdate=cr.instanceMatrix.needsUpdate=true;world.add(tk);world.add(cr);
  /* the warships at the quay */
  karlskronaShips=[];
  for(const [x,L,ens] of [[-150,40,true],[-30,46,true],[110,38,true],[230,34,false]]){
    const s=karlskronaShip(L,ens);s.position.set(x,-3.2,173);s.rotation.y=Math.PI/2+(hash2(x,3)-.5)*.04;world.add(s);karlskronaShips.push(s);
  }
  /* bollards and a mooring line from each ship, barrels and cannon on the quay */
  const bl=new THREE.InstancedMesh(flat(new THREE.CylinderGeometry(.35,.45,.9,6)),psMat({color:0x26282c}),80);
  let nb=0;for(let x=-280;x<290&&nb<80;x+=14){const z=157;if(!free(x,z,2))continue;p.set(x,meshY(x,z)+.45,z);q.identity();m4.compose(p,q,one);bl.setMatrixAt(nb++,m4);}
  bl.count=nb;bl.instanceMatrix.needsUpdate=true;world.add(bl);
  const R=ALTS.find(a=>a.id==='kaj');
  const bar=new THREE.InstancedMesh(flat(new THREE.CylinderGeometry(.5,.44,.95,8)),psMat({color:0x9a7448}),90);
  let nr=0;
  for(let k=0;k<90;k++){
    const x=rand(-290,290),z=rand(140,157);
    if(!free(x,z,2.5))continue;
    p.set(x,meshY(x,z)+.47+(k%5===0?.95:0),z);e.set(0,rand(0,6),0);q.setFromEuler(e);m4.compose(p,q,one);bar.setMatrixAt(nr++,m4);
  }
  bar.count=nr;bar.instanceMatrix.needsUpdate=true;world.add(bar);
  /* stacked cannonballs and old guns on the quay */
  const ballG=flat(new THREE.SphereGeometry(.38,6,4)),ballM=psMat({color:0x2a2c30});
  for(const [x,z] of [[-200,150],[60,152],[180,150],[-60,150]]){
    if(!free(x,z,4))continue;const y=meshY(x,z),pile=new THREE.Group();
    for(let l=0;l<3;l++)for(let a=0;a<3-l;a++)for(let b=0;b<3-l;b++){const m=new THREE.Mesh(ballG,ballM);m.position.set((a-(2-l)/2)*.76,.38+l*.6,(b-(2-l)/2)*.76);pile.add(m);}
    const gun=new THREE.Mesh(flat(new THREE.CylinderGeometry(.3,.45,3.2,7)),ballM);gun.rotation.z=Math.PI/2;gun.position.set(3,.7,0);pile.add(gun);
    pile.position.set(x,y,z);world.add(pile);
  }
  /* Polhem's dry dock, cut into the rock, with a frigate up on her blocks */
  {const D={x:0,z:110,w:30,l:38},y=meshY(D.x,D.z);
    const dock=new THREE.Group();
    const floor=new THREE.Mesh(new THREE.PlaneGeometry(D.w,D.l).rotateX(-Math.PI/2),psMat({map:pixTex(16,32,c=>{
      c.fillStyle='#3e3a36';c.fillRect(0,0,16,32);c.fillStyle='#2a2826';for(let k=0;k<32;k+=4)c.fillRect(0,k,16,1);c.fillStyle='#4a5a60';c.fillRect(5,0,6,32);})}));
    floor.position.y=.12;dock.add(floor);
    for(let st=0;st<3;st++){                                  /* granite steps up the sides */
      const w=D.w-st*3,l=D.l-st*2.4,h=2.6-st*.8;
      for(const sg of [-1,1]){
        const s1=box(1.6,h,l,0x8f8a82);s1.position.set(sg*(w/2+.8),h/2,-st*1.2);dock.add(s1);
      }
      const s2=box(w+3.2,h,1.6,0x8f8a82);s2.position.set(0,h/2,-l/2-.8-st*1.2);dock.add(s2);
    }
    const gate=box(D.w+3,2.4,1.4,0x4a3a2c);gate.position.set(0,1.2,D.l/2+.7);dock.add(gate);
    const hull=new THREE.Mesh(karlskronaHull(30,4.4,5,1.2,12,8),psMat({map:karlskronaHullTex,side:THREE.DoubleSide}));
    hull.position.y=-.6;dock.add(hull);
    for(const zz of [-9,-3,3,9]){const kb=box(1.4,.8,1.4,0x5a4634);kb.position.set(0,.3,zz);dock.add(kb);
      for(const sg of [-1,1]){const sh=box(.3,.3,6,0x6b5540);sh.position.set(sg*6.4,2.8,zz);sh.rotation.z=sg*.9;sh.rotation.y=Math.PI/2;dock.add(sh);}}
    const ms=new THREE.Mesh(flat(new THREE.CylinderGeometry(.25,.4,18,6)),psMat({color:0x2a1e16}));ms.position.set(0,13,2);dock.add(ms);
    dock.position.set(D.x,y,D.z);world.add(dock);}
  /* the mast crane: a tall timber shear-leg house at the corner of the quay */
  {const x=255,z=128,y=meshY(x,z);if(freeRect(x,z,14,30,.2,3)){
    const mc=new THREE.Group();
    const hb=box(14,22,12,0x8b2b1c);hb.position.y=11;mc.add(hb);
    const r=gableRoof(14.6,13,4,0x3a3634);r.position.y=22;mc.add(r);
    for(const sg of [-1,1]){const leg=box(.8,34,.8,0x4a3a2c);leg.position.set(sg*4,17,14);leg.rotation.x=-.32;mc.add(leg);}
    const top=box(9,1,1,0x4a3a2c);top.position.set(0,33,19);mc.add(top);
    const rope=box(.12,18,.12,0xb89a64);rope.position.set(0,24,19.4);mc.add(rope);
    mc.position.set(x,y,z);mc.rotation.y=.2;world.add(mc);karlskronaHook=rope;}}
  /* two timber derricks out over the water */
  for(const x of [-100,160]){
    const z=157,y=meshY(x,z),dr=new THREE.Group();
    for(const sg of [-1,1]){const lg=box(.45,18,.45,0x5a4634);lg.position.set(sg*2.4,8.2,3);lg.rotation.x=.35;lg.rotation.z=-sg*.12;dr.add(lg);}
    const ln=box(.1,9,.1,0x2a2826);ln.position.set(0,11,6.6);dr.add(ln);
    const crate=box(1.8,1.4,1.8,0x8a6a44);crate.position.set(0,6.2,6.6);dr.add(crate);
    dr.position.set(x,y,z);world.add(dr);
  }
  /* Kungsholms fort on its island across the water */
  const F={x:70,z:375};
  {const isl=new THREE.Mesh(flat(new THREE.CylinderGeometry(70,82,6,14)),psMat({color:0x7a8a56}));isl.position.set(F.x,-1.4,F.z);world.add(isl);
    const rock=new THREE.Mesh(flat(new THREE.CylinderGeometry(82,86,1.4,14)),psMat({color:0x8a857c}));rock.position.set(F.x,-.2,F.z);world.add(rock);
    const fort=new THREE.Group();
    const ring=new THREE.Mesh(flat(new THREE.CylinderGeometry(34,36,10,20,1,true)),psMat({color:0xa49c8e,side:THREE.DoubleSide}));ring.position.y=5;fort.add(ring);
    const cren=new THREE.InstancedMesh(flat(new THREE.BoxGeometry(2.4,1.6,1.6)),psMat({color:0xa49c8e}),30);
    for(let k=0;k<30;k++){const a=k/30*6.283;p.set(Math.cos(a)*35,10.8,Math.sin(a)*35);e.set(0,-a,0);q.setFromEuler(e);m4.compose(p,q,one);cren.setMatrixAt(k,m4);}
    cren.instanceMatrix.needsUpdate=true;fort.add(cren);
    const tw=new THREE.Mesh(flat(new THREE.CylinderGeometry(10,11,18,12)),psMat({color:0xb8b0a2}));tw.position.y=9;fort.add(tw);
    const tr=new THREE.Mesh(flat(new THREE.ConeGeometry(11.5,7,12)),psMat({color:0x3e4448}));tr.position.y=21.5;fort.add(tr);
    const fp=box(.3,10,.3,0x2a2826);fp.position.y=29;fort.add(fp);
    const flag=new THREE.Mesh(new THREE.PlaneGeometry(6,3.6),psMat({side:THREE.DoubleSide,map:pixTex(20,12,c=>{
      c.fillStyle='#1f5aa8';c.fillRect(0,0,20,12);c.fillStyle='#f0c419';c.fillRect(6,0,2,12);c.fillRect(0,5,20,2);})}));
    flag.position.set(3.2,32,0);fort.add(flag);karlskronaFlag=flag;
    fort.position.set(F.x,.5,F.z);world.add(fort);}
  /* lamp posts down the long straight */
  const lp=new THREE.InstancedMesh(flat(new THREE.CylinderGeometry(.12,.16,4.6,5)),psMat({color:0x26282c}),40);
  const lh=new THREE.InstancedMesh(flat(new THREE.BoxGeometry(.6,.8,.6)),psMat({color:0xfff0b8,unlit:true}),40);
  let nl=0;for(let i=4;i<150&&nl<40;i+=12)for(const sg of [1]){const Q=at(i,sg*(HW+5.2));if(!free(Q.x,Q.z,4))continue;
    p.set(Q.x,Q.y+2.3,Q.z);q.identity();m4.compose(p,q,one);lp.setMatrixAt(nl,m4);p.set(Q.x,Q.y+4.9,Q.z);m4.compose(p,q,one);lh.setMatrixAt(nl,m4);nl++;}
  lp.count=lh.count=nl;lp.instanceMatrix.needsUpdate=lh.instanceMatrix.needsUpdate=true;world.add(lp);world.add(lh);
  /* the quay passage gets dressed granite, not gravel */
  if(R){
    const t=roadTex('kkrSten'),m=psMat({map:t});m.polygonOffset=true;m.polygonOffsetFactor=-4;m.polygonOffsetUnits=-4;
    world.add(new THREE.Mesh(altRibbon(R,-R.hw,R.hw,.05,7,0,R.n-1),m));
  }
}
let karlskronaShips=[],karlskronaFlag=null,karlskronaHook=null;

/** Kungsholms fort fires on the dockyard: a ringed mark on the road, a whistle, then the ball lands with a thud */
function hazardsKarlskrona(H){
  const F={x:70,z:375,y:10.5};
  const markT=pixTex(32,32,g=>{
    g.strokeStyle='#ffffff';g.lineWidth=3;g.beginPath();g.arc(16,16,13,0,6.283);g.stroke();
    g.lineWidth=4;g.beginPath();g.moveTo(8,8);g.lineTo(24,24);g.moveTo(24,8);g.lineTo(8,24);g.stroke();
  });
  const ballM=psMat({color:0x1e2024});
  /* three guns on the fort's wall, each laid on its own stretch of road */
  const SPEC=[{tg:[[292,-3.0],[300,3.2]],period:5.0,phase:0.0},
              {tg:[[396,2.6],[404,-3.0]],period:5.4,phase:1.7},
              {tg:[[488,-2.4],[496,3.0]],period:5.8,phase:3.4}];
  const T0=0.30,T1=0.74;
  SPEC.forEach((S,n)=>{
    const gx=F.x+(n-1)*16,gz=F.z-33,gy=F.y;
    const gun=new THREE.Group();
    const barrel=new THREE.Mesh(flat(new THREE.CylinderGeometry(.5,.75,4.4,7)),ballM);barrel.rotation.x=Math.PI/2-.25;barrel.position.z=1.2;gun.add(barrel);
    const car=new THREE.Mesh(flat(new THREE.BoxGeometry(2,1.2,2.6)),psMat({color:0x5a4634}));car.position.y=-.8;gun.add(car);
    gun.position.set(gx,gy,gz);world.add(gun);
    const ball=new THREE.Mesh(flat(new THREE.SphereGeometry(.85,7,5)),ballM);ball.visible=false;world.add(ball);
    const mark=new THREE.Mesh(new THREE.PlaneGeometry(6.8,6.8).rotateX(-Math.PI/2),
      psMat({map:markT,color:0xff3a2a,unlit:true,transparent:true,alphaTest:.4,depthWrite:false}));
    mark.visible=false;world.add(mark);
    const shadow=new THREE.Mesh(new THREE.CircleGeometry(1.1,10).rotateX(-Math.PI/2),
      psMat({color:0x000000,unlit:true,transparent:true,opacity:.45,depthWrite:false}));
    shadow.visible=false;world.add(shadow);
    const crater=new THREE.Mesh(new THREE.CircleGeometry(2.2,9).rotateX(-Math.PI/2),
      psMat({color:0x1a1816,unlit:true,transparent:true,opacity:.6,depthWrite:false}));
    crater.visible=false;world.add(crater);
    let lastCyc=-1,fired=false,landed=false,whistled=false;
    H.push({id:'kanon'+n,period:S.period,phase:S.phase,mesh:gun,
      update(u){
        const cyc=Math.floor((raceTime+S.phase)/S.period);
        if(cyc!==lastCyc){lastCyc=cyc;fired=landed=whistled=false;}
        const T=S.tg[((cyc%2)+2)%2],q=mainPt(T[0],T[1]);this.p=q;
        gun.lookAt(q.x,gy,q.z);
        barrel.position.z=1.2-(u>T0&&u<T0+.08?.9*(1-(u-T0)/.08):0);   /* recoil */
        const near=typeof player!=='undefined'&&player?Math.hypot(player.x-q.x,player.z-q.z):1e9;
        if(u>=T0&&!fired){fired=true;
          for(let k=0;k<10;k++)puff(gx+rand(-1.5,1.5),gy+rand(0,2),gz-3+rand(-1.5,1.5),.85,.84,.8,1.2);}
        if(u>=T0+.12&&!whistled&&near<110){whistled=true;ping(2600,700,(T1-T0-.12)*S.period);}
        if(u>=T0&&u<T1){
          const f=(u-T0)/(T1-T0);
          ball.visible=true;ball.position.set(lerp(gx,q.x,f),lerp(gy+1,q.y+.8,f)+Math.sin(Math.PI*f)*55,lerp(gz,q.z,f));
          shadow.visible=true;shadow.position.set(q.x,q.y+.09,q.z);const s=.3+.9*f*f;shadow.scale.set(s,1,s);
        }else{ball.visible=false;shadow.visible=false;}
        if(u>.05&&u<T1+.03){
          mark.visible=true;mark.position.set(q.x,q.y+.12,q.z);
          const g=.6+.4*smooth(.05,T1,u),pl=u>.5?1+Math.sin(clock*16)*.07:1;mark.scale.set(g*pl,1,g*pl);
          mark.material.uniforms.uOpacity.value=.5+.5*smooth(.25,T1,u);
        }else mark.visible=false;
        if(u>=T1&&!landed){landed=true;
          for(let k=0;k<14;k++)puff(q.x+rand(-1.8,1.8),q.y+rand(.2,1.8),q.z+rand(-1.8,1.8),.55,.52,.48,.8);
          if(near<70){ping(110,40,.35);if(near<24)shake=Math.min(1,shake+.35);}}
        if(u>=T1){crater.visible=true;crater.position.set(q.x,q.y+.07,q.z);
          crater.material.uniforms.uOpacity.value=.6*(1-smooth(T1,1,u));}
        else crater.visible=false;
      },
      hit(k,u){return this.p&&u>=T1&&u<T1+.045&&near3(k,this.p.x,this.p.y,this.p.z,3.3);},
      effect(k){k.spun=Math.max(k.spun,0.9*k.spinResist);k.boost=0;k.drift=0;k.charge=0;
        if(k===player){toast('KANONKULA!');ping(140,50,.35);shake=Math.min(1,shake+.6);}}});
  });
  /* the flags stream in the sea breeze (no hit) */
  H.push({id:'flaggor',period:5,phase:0,update(u){
    if(karlskronaFlag)karlskronaFlag.rotation.y=Math.sin(clock*2.2)*.35;
    for(const s of karlskronaShips){const f=s.userData.flag;if(f)f.rotation.y=Math.PI/2+Math.sin(clock*2+s.position.x)*.3;
      s.position.y=-3.2+Math.sin(clock*.8+s.position.x*.1)*.12;s.rotation.z=Math.sin(clock*.6+s.position.x)*.012;}
    if(karlskronaHook)karlskronaHook.rotation.z=Math.sin(clock*.9)*.05;}});
}
