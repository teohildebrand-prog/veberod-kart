"use strict";
/* ───────── Höörs älgskog ───────── */
/* Amazon Adventure Alley's counterpart: a lane straight through the waterfall in the bear enclosure, and an elk that steps out and will not move */
ROADTEX.hoor=()=>pixTex(64,64,g=>{                 /* the wildlife park's packed gravel road */
  g.fillStyle='#a8977a';g.fillRect(0,0,64,64);
  for(let i=0;i<900;i++){
    g.fillStyle=Math.random()>.5?'rgba(204,192,166,.55)':'rgba(112,96,72,.5)';
    g.fillRect((Math.random()*64)|0,(Math.random()*64)|0,1,1);
  }
  g.fillStyle='rgba(126,108,82,.38)';for(const x of [13,20,42,49])g.fillRect(x,0,3,64);
  g.fillStyle='rgba(90,84,76,.8)';
  for(let i=0;i<30;i++)g.fillRect((Math.random()*62)|0,(Math.random()*62)|0,2,2);
});
VERGEC.hoor=['#5f8a3e','#77a04a','#46692e'];
GROUND.hoorskog={cell:40,stripe:0.6,verge:0x6a8a44,
  cols:[0x4f8a3a,0x5c9a42,0x3e7a34,0x6aa24a,0x7a9a48,0x4a7038,0x8aa858,0x5a8040]};
/* the edge: a gärdesgård, the old roundpole fence with its slanted poles */
EDGES.hoor=st=>{
  const step=3,cnt=Math.ceil(N/step)*2;
  const poleG=flat(new THREE.CylinderGeometry(.07,.08,SEG*step*1.7,4));poleG.rotateX(Math.PI/2-0.5);
  const poles=new THREE.InstancedMesh(poleG,psMat({color:0x8a7a62}),cnt);
  const posts=new THREE.InstancedMesh(flat(new THREE.CylinderGeometry(.09,.1,1.6,4)),psMat({color:0x6a5a46}),cnt);
  const m4=new THREE.Matrix4(),q=new THREE.Quaternion(),e=new THREE.Euler(),
        p=new THREE.Vector3(),one=new THREE.Vector3(1,1,1);
  let a=0,b=0;
  for(let i=0;i<N;i+=step)for(const side of [-1,1]){
    const o=side*(HW+4.3),x=sx[i]+rx[i]*o,z=sz[i]+rz[i]*o;
    if(nearAlt(x,z,2.6))continue;
    if(stations.some(S=>{let d=i-S.at;if(d<-N/2)d+=N;else if(d>N/2)d-=N;return S.side===side&&d>-3&&d<S.len+3;}))continue;
    const y=meshY(x,z);
    e.set(0,Math.atan2(fx[i],fz[i]),0);q.setFromEuler(e);
    p.set(x,y+.75,z);m4.compose(p,q,one);poles.setMatrixAt(a++,m4);
    if(i%(step*2)===0){for(const d of [-.14,.14]){p.set(x+rx[i]*d,y+.7,z+rz[i]*d);m4.compose(p,q,one);posts.setMatrixAt(b++,m4);}}
  }
  poles.count=a;posts.count=b;poles.instanceMatrix.needsUpdate=posts.instanceMatrix.needsUpdate=true;
  world.add(poles);world.add(posts);
};
/* where the elk come out of the forest: [main-road sample, side, period, phase] */
const HOOR_ELK=[[428,-1,15,3],[566,-1,17,11]];

STAGES.push({ id:'hoor', group:'vild', name:'HÖÖR', sub:'ÄLGSKOGEN', hw:8.6,
  bars:[0.60,0.80,0.50], laps:3,
  blurb:'A gravel loop through a wildlife park in the deep green woods above Lake Ringsjön, past the bison meadow, the lynx rocks and the lakeshore. The shortcut runs through the bear enclosure and straight through the waterfall, on mud. Elk wander out of the trees, stand in the road and do not move for anyone: steer round them.',
  role:'Grusväg genom djurparken, en genväg rakt genom björnarnas vattenfall och älgar som inte flyttar sig.',
  sky:[0xe6efe2,0x4a8ed6], fog:[0xc6d8cc,70,340], amb:0x667468, dif:0xfff0d2,
  road:'hoor', verge:'hoor', edge:'hoor', ground:'hoorskog', paint:false, sfxRoad:'gravel',
  jumpSpec:[{h:3.4,drop:2.4,up:12,dn:7,rec:17},{h:2.6,drop:1.9,up:10,dn:6,rec:14}],
  ctrl:[[   0, 4,-150],[  80, 4,-156],[ 150, 5,-142],[ 214, 7,-110],[ 250, 9, -46],
        [ 244,11,  20],[ 196,13,  56],[ 154,15, 104],[  96,12, 128],[  40, 8, 108],
        [ -12, 5, 126],[ -72, 2, 158],[-142, 2, 160],[-198, 4, 122],[-204, 8,  58],
        [-236,10,  -6],[-216, 8, -84],[-152, 6,-126],[ -72, 4,-148]],
  /* Ringsjön lies south, below the shore road */
  shore:(x,z)=>{const d=z-188;return -14*smooth(0,34,d)-rolls(x,z)*smooth(-46,-4,d);},   /* the hills settle to the shore */
  land:(x,z,out)=>{const d=z-188;if(d>2&&d<16)out.setHex(d<8?0x8a8a52:0x6f8048);else if(d<=2&&d>-50&&out.getHex()===0xe9dcb4)out.setHex(0x6a9a44);},
  stations:[[0.40,1],[0.90,-1]],
  routes:[
    {id:'fall',name:'BJÖRNFALLET',a:110,b:230,hw:4.2,side:1,lead:9,leadLat:10,
     mid:[[0.3,-5],[0.7,5]],surface:'dirt',mud:[[0.40,0.62]],risk:0.45,
     blurb:'A muddy track through the bear enclosure and straight through the waterfall. Shorter, but slippery.'}],
  stamps:[
    {id:'hoo1',dish:'Stekt gös',ini:'S',kind:'intro',route:'main',i:404,lat:-6.2,
     hint:'Nere vid sjön, på strandvägen.',
     story:'Ringsjön is a pikeperch lake, and the fishermen in Höör and Sjöholmen still set their nets for gös. The firm white fillets are fried in butter and served with boiled potatoes, a heap of dill and a sharp horseradish cream, eaten on a jetty with the lake going pink.'},
    {id:'hoo2',dish:'Kalvdans',ini:'K',kind:'route',route:'fall',f:0.56,lat:0,
     hint:'Bakom vattenfallet hos björnarna.',
     story:'The old farm pudding of the Skåne woods: the first milk after a cow has calved, baked slowly until it sets like a soft cheese, then eaten cold with cinnamon and berries. It only happens in spring, which makes it as rare as a bear coming out to say hello.'},
    {id:'hoo3',dish:'Blåbärspaj',ini:'B',kind:'line',route:'main',i:'tight',lat:'inside',
     hint:'Tätt intill innerkanten, där vägen svänger tvärast.',
     story:'In July the forest floor round Ringsjön turns blue. Everyone goes out with a bucket and comes home with purple fingers, and the blueberries go into a quick pie with a crumbly butter crust and a cold jug of vanilla sauce.'}],
  hazards:H=>hazardsHoor(H), scenery:()=>sceneryHoor()
});

/** a wooden signpost plank with a word on it */
function hoorPlank(text,w){
  return pixTex(w||64,16,g=>{
    g.fillStyle='#7a5a3a';g.fillRect(0,0,w||64,16);g.fillStyle='#8d6a46';g.fillRect(0,3,w||64,2);g.fillRect(0,11,w||64,2);
    g.fillStyle='#f4ecd8';g.font='8px "Press Start 2P",monospace';g.textAlign='center';g.textBaseline='middle';
    g.fillText(text,(w||64)/2,8.5);
  });
}
/** low-poly animals, all nose along +z, feet at y=0 */
function hoorBox(g,w,h,d,m,x,y,z,rx){const o=new THREE.Mesh(flat(new THREE.BoxGeometry(w,h,d)),m);o.position.set(x,y,z);if(rx)o.rotation.x=rx;g.add(o);return o;}
function hoorElk(){
  const g=new THREE.Group(),fur=psMat({color:0x5e4232}),dk=psMat({color:0x3a2a1e}),leg=psMat({color:0xb0a088}),
        ant=psMat({color:0xe6d8b4});
  hoorBox(g,1.1,1.25,2.7,fur,0,2.05,0);hoorBox(g,1.15,.6,1.1,dk,0,2.75,.65);
  const neck=hoorBox(g,.62,1.0,.8,fur,0,2.65,1.45,-.6);
  const head=new THREE.Group();head.position.set(0,2.95,1.85);g.add(head);
  hoorBox(head,.55,.6,1.1,fur,0,0,.45,.35);hoorBox(head,.5,.5,.5,dk,0,-.3,.95,.35);
  hoorBox(head,.14,.5,.2,dk,0,-.55,.15);
  for(const sg of [-1,1]){
    hoorBox(head,.12,.4,.22,fur,sg*.32,.38,-.05);
    const a=hoorBox(head,1.5,.14,.95,ant,sg*1.0,.7,-.1);a.rotation.z=sg*.4;
    for(let t=0;t<4;t++){const ti=hoorBox(head,.1,.42,.1,ant,sg*(.55+t*.32),1.0+t*.13,-.4+t*.05);ti.rotation.z=sg*.2;}
  }
  const legs=[];
  for(const [x,z] of [[-.38,1.0],[.38,1.0],[-.38,-1.0],[.38,-1.0]]){
    const piv=new THREE.Group();piv.position.set(x,1.5,z);g.add(piv);
    hoorBox(piv,.24,1.55,.26,leg,0,-.75,0);legs.push(piv);
  }
  hoorBox(g,.2,.3,.15,dk,0,2.4,-1.4);
  g.userData.legs=legs;g.userData.head=head;return g;
}
function hoorBear(){
  const g=new THREE.Group(),fur=psMat({color:0x5a3a22}),dk=psMat({color:0x2a1c12});
  hoorBox(g,1.5,1.3,2.3,fur,0,1.35,0);hoorBox(g,1.3,.6,.9,fur,0,2.0,.5);
  hoorBox(g,.9,.85,.9,fur,0,1.75,1.45);hoorBox(g,.45,.4,.5,psMat({color:0x8a6a4a}),0,1.6,2.0);
  hoorBox(g,.18,.14,.1,dk,0,1.75,2.26);
  for(const sg of [-1,1])hoorBox(g,.24,.24,.16,fur,sg*.36,2.25,1.35);
  for(const [x,z] of [[-.48,.75],[.48,.75],[-.48,-.75],[.48,-.75]])hoorBox(g,.5,.85,.55,fur,x,.42,z);
  return g;
}
function hoorBison(){
  const g=new THREE.Group(),fur=psMat({color:0x3a2a1c}),mane=psMat({color:0x5a4028}),horn=psMat({color:0xd8ceb8});
  hoorBox(g,1.4,1.4,2.6,fur,0,1.55,-.2);hoorBox(g,1.6,1.9,1.4,mane,0,1.95,.9);
  hoorBox(g,.8,.9,.9,mane,0,1.4,1.75);hoorBox(g,.5,.5,.4,fur,0,1.0,1.75);
  for(const sg of [-1,1]){const h=hoorBox(g,.5,.12,.12,horn,sg*.5,1.95,1.8);h.rotation.z=sg*.6;}
  for(const [x,z] of [[-.45,1.0],[.45,1.0],[-.45,-1.1],[.45,-1.1]])hoorBox(g,.3,1.0,.3,fur,x,.5,z);
  return g;
}
function hoorLynx(){
  const g=new THREE.Group(),fur=psMat({color:0xb8925e}),dk=psMat({color:0x2a2420}),sp=psMat({color:0x8a6a44});
  hoorBox(g,.55,.55,1.2,fur,0,.75,0);hoorBox(g,.5,.5,.45,fur,0,1.1,.7);hoorBox(g,.3,.12,.3,sp,0,.95,.85);
  for(const sg of [-1,1]){hoorBox(g,.1,.24,.1,fur,sg*.18,1.45,.65);hoorBox(g,.04,.16,.04,dk,sg*.18,1.65,.65);}
  hoorBox(g,.14,.14,.25,dk,0,.88,-.66);
  for(const [x,z] of [[-.18,.42],[.18,.42],[-.18,-.42],[.18,-.42]])hoorBox(g,.16,.5,.16,fur,x,.25,z);
  return g;
}
/** the yellow elk-warning triangle */
function hoorElkSign(){
  return pixTex(64,56,g=>{
    g.fillStyle='#c8281c';g.beginPath();g.moveTo(32,2);g.lineTo(62,54);g.lineTo(2,54);g.closePath();g.fill();
    g.fillStyle='#f2c81c';g.beginPath();g.moveTo(32,11);g.lineTo(54,49);g.lineTo(10,49);g.closePath();g.fill();
    g.fillStyle='#16120e';
    g.fillRect(22,30,18,7);g.fillRect(36,26,4,6);g.fillRect(38,24,8,4);g.fillRect(43,27,3,3);
    g.fillRect(22,36,2,9);g.fillRect(26,36,2,9);g.fillRect(34,36,2,9);g.fillRect(38,36,2,9);
    g.fillRect(36,20,2,4);g.fillRect(40,20,2,4);g.fillRect(34,20,4,1);g.fillRect(40,20,4,1);
  });
}

/** fold a static group's plain-coloured meshes into one vertex-coloured mesh per lit/unlit kind (draw calls) */
function hoorMerge(g){
  const P=g.position.clone(),R=g.rotation.clone(),S=g.scale.clone();
  g.position.set(0,0,0);g.rotation.set(0,0,0);g.scale.set(1,1,1);g.updateMatrixWorld(true);
  const B=[{pos:[],nor:[],col:[]},{pos:[],nor:[],col:[]}],gone=[];
  const v=new THREE.Vector3(),n=new THREE.Vector3(),nm=new THREE.Matrix3();
  g.traverse(o=>{
    if(!o.isMesh||o.isInstancedMesh)return;
    const U=o.material.uniforms;if(!U||U.uMap.value!==WHITE||o.material.transparent||o.material.vertexColors)return;
    const geo=o.geometry.index?o.geometry.toNonIndexed():o.geometry,pa=geo.attributes.position,na=geo.attributes.normal;
    if(!na)return;
    const b=B[U.uUnlit.value?1:0],c=U.uColor.value;nm.getNormalMatrix(o.matrixWorld);
    for(let i=0;i<pa.count;i++){
      v.fromBufferAttribute(pa,i).applyMatrix4(o.matrixWorld);b.pos.push(v.x,v.y,v.z);
      n.fromBufferAttribute(na,i).applyMatrix3(nm).normalize();b.nor.push(n.x,n.y,n.z);b.col.push(c.r,c.g,c.b);
    }
    gone.push(o);
  });
  for(const o of gone)o.parent.remove(o);
  B.forEach((b,u)=>{if(!b.pos.length)return;
    const geo=new THREE.BufferGeometry();
    geo.setAttribute('position',new THREE.Float32BufferAttribute(b.pos,3));
    geo.setAttribute('normal',new THREE.Float32BufferAttribute(b.nor,3));
    geo.setAttribute('color',new THREE.Float32BufferAttribute(b.col,3));
    geo.setAttribute('uv',new THREE.Float32BufferAttribute(new Float32Array(b.pos.length/3*2),2));
    g.add(new THREE.Mesh(geo,psMat({vertexColors:true,unlit:!!u})));});
  g.position.copy(P);g.rotation.copy(R);g.scale.copy(S);
  return g;
}

function sceneryHoor(){
  const m4=new THREE.Matrix4(),q=new THREE.Quaternion(),e=new THREE.Euler(),
        p=new THREE.Vector3(),sc=new THREE.Vector3(),one=new THREE.Vector3(1,1,1);
  const wood=psMat({color:0x6b5540}),woodL=psMat({color:0x8a7259});
  const nearStation=(x,z,pad)=>{const i=nearestGlobal(x,z),l=(x-sx[i])*rx[i]+(z-sz[i])*rz[i];
    return stations.some(S=>{let d=i-S.at;if(d<-N/2)d+=N;else if(d>N/2)d-=N;
      return d>-8&&d<S.len+10&&l*S.side>0&&Math.abs(l)<HW+pad;});};
  const lake=(x,z)=>z-188;
  const at=(i,o)=>{i=((i%N)+N)%N;const x=sx[i]+rx[i]*o,z=sz[i]+rz[i]*o;return new THREE.Vector3(x,meshY(x,z),z);};
  const yawAt=i=>{i=((i%N)+N)%N;return Math.atan2(fx[i],fz[i]);};
  const keep=[];                         /* clearings the forest leaves alone: [x,z,r] */
  const F=ALTS.find(r=>r.id==='fall');
  /* ── the enclosures beside the main road ── */
  const pen=(i,side,off,w,d,tall)=>{     /* a fenced rectangle, long side along the road */
    const c=at(i,side*off),yaw=yawAt(i),g=new THREE.Group();
    g.position.copy(c);g.rotation.y=yaw;world.add(g);
    keep.push([c.x,c.z,Math.max(w,d)*0.6]);
    const postG=flat(new THREE.CylinderGeometry(.14,.16,tall?3.2:1.8,5)),railG=flat(new THREE.BoxGeometry(.12,.16,1));
    const ps=new THREE.InstancedMesh(postG,wood,90),rs=new THREE.InstancedMesh(railG,woodL,180);
    let a=0,b=0;
    const edge=(x0,z0,x1,z1)=>{const L=Math.hypot(x1-x0,z1-z0),n=Math.max(1,Math.round(L/4));
      for(let s=0;s<n;s++){const t0=s/n,t1=(s+1)/n,xa=x0+(x1-x0)*t0,za=z0+(z1-z0)*t0,xb=x0+(x1-x0)*t1,zb=z0+(z1-z0)*t1;
        const wx=c.x+Math.cos(yaw)*xa+Math.sin(yaw)*za,wz=c.z-Math.sin(yaw)*xa+Math.cos(yaw)*za;
        if(latAt(wx,wz)<HW+4)continue;
        const ly=meshY(wx,wz)-c.y;
        p.set(xa,ly+(tall?1.6:.9),za);m4.compose(p,q.identity(),one);if(a<90)ps.setMatrixAt(a++,m4);
        for(const hh of (tall?[1.0,2.0,2.9]:[.6,1.3])){
          p.set((xa+xb)/2,ly+hh,(za+zb)/2);e.set(0,Math.atan2(xb-xa,zb-za),0);q.setFromEuler(e);
          sc.set(1,1,L/n);m4.compose(p,q,sc);if(b<180)rs.setMatrixAt(b++,m4);}
      }};
    edge(-w/2,-d/2,w/2,-d/2);edge(w/2,-d/2,w/2,d/2);edge(w/2,d/2,-w/2,d/2);edge(-w/2,d/2,-w/2,-d/2);
    ps.count=a;rs.count=b;ps.instanceMatrix.needsUpdate=rs.instanceMatrix.needsUpdate=true;g.add(ps);g.add(rs);
    return g;
  };
  /* the bison meadow on the start straight */
  {const i=60,side=-1,off=HW+30,g=pen(i,side,off,36,56,false);
    for(let n=0;n<5;n++){const b=hoorBison(),lx=(hash2(n,1.7)-.5)*24,lz=(hash2(n,4.1)-.5)*42;
      b.position.set(lx,meshY(g.position.x+Math.cos(g.rotation.y)*lx+Math.sin(g.rotation.y)*lz,g.position.z-Math.sin(g.rotation.y)*lx+Math.cos(g.rotation.y)*lz)-g.position.y,lz);
      b.rotation.y=hash2(n,9.3)*6.28;g.add(b);}
    const hay=new THREE.Mesh(flat(new THREE.BoxGeometry(3,1.2,1.6)),psMat({color:0xd9b25a}));hay.position.set(6,.6,8);g.add(hay);
    hoorMerge(g);}
  /* the lynx rocks on the west side */
  {const i=520,side=1,off=HW+28,g=pen(i,side,off,34,40,true);
    const rockM=psMat({color:0x8a877e});
    const rk=[[0,0,4.2],[-7,6,3],[6,-8,3.4],[8,9,2.4]];
    rk.forEach(([x,z,r],n)=>{const o=new THREE.Mesh(flat(new THREE.DodecahedronGeometry(r,0)),rockM);
      o.scale.set(1.2,.8,1);o.position.set(x,r*.45,z);g.add(o);
      if(n<2){const l=hoorLynx();l.position.set(x,r*.45+r*.75,z);l.rotation.y=n?2.2:-0.8;g.add(l);}});
    for(const [x,z] of [[-10,-10],[10,-2],[-4,12]]){
      const t=new THREE.Mesh(flat(new THREE.ConeGeometry(2.2,8,6)).translate(0,5,0),psMat({color:0x2c4c2c}));t.position.set(x,0,z);g.add(t);
      const tr=new THREE.Mesh(flat(new THREE.CylinderGeometry(.25,.3,1.4,5)).translate(0,.7,0),wood);tr.position.set(x,0,z);g.add(tr);}
    hoorMerge(g);}
  /* ── the bear enclosure and the waterfall on the shortcut ── */
  let fallInfo=null;
  if(F){
    const jw=Math.round(F.n*0.5),yawF=Math.atan2(F.FX[jw],F.FZ[jw]);
    const atF=(j,l)=>{const x=F.X[j]+F.RX[j]*l,z=F.Z[j]+F.RZ[j]*l;return new THREE.Vector3(x,meshY(x,z),z);};
    const mainClear=(v,pad)=>{const i=nearestGlobal(v.x,v.z);return Math.abs((v.x-sx[i])*rx[i]+(v.z-sz[i])*rz[i])>HW+pad;};
    const rockM=psMat({color:0x7e7b72}),rockD=psMat({color:0x68655e}),moss=psMat({color:0x4a6a34});
    const fg=new THREE.Group();fg.position.set(F.X[jw],F.Y[jw],F.Z[jw]);fg.rotation.y=yawF;world.add(fg);
    keep.push([F.X[jw],F.Z[jw],26]);
    const W=F.hw+1.6;
    /* rock pillars either side and the ledge the water pours over */
    for(const sg of [-1,1]){
      hoorBox(fg,4,9,6,rockM,sg*(W+2),4.5,0);hoorBox(fg,3,5,4,rockD,sg*(W+4.5),2.5,-3);
      hoorBox(fg,4.4,.8,6.4,moss,sg*(W+2),9.2,0);
    }
    hoorBox(fg,2*W+8,2.6,6,rockM,0,9.6,-.5);hoorBox(fg,2*W+8.4,.6,6.4,moss,0,11.1,-.5);
    /* the cliff behind, rising away to one side, with the river coming over the top */
    for(let n=0;n<6;n++){const sg=n%2?1:-1;
      const o=new THREE.Mesh(flat(new THREE.DodecahedronGeometry(5+hash2(n,2)*3,0)),n%3?rockM:rockD);
      o.position.set(sg*(W+8+n*2.2),5+hash2(n,5)*4,-4-n*1.5);o.scale.set(1,1.3,.9);fg.add(o);}
    const river=new THREE.Mesh(new THREE.PlaneGeometry(2*W-1,10).rotateX(-Math.PI/2),psMat({color:0x5a9ac8,unlit:true}));
    river.position.set(0,11.45,-6);fg.add(river);
    /* the falling sheet itself: two translucent layers, their texture scrolled each frame */
    const ft=pixTex(32,64,g=>{g.fillStyle='rgba(150,200,232,.78)';g.fillRect(0,0,32,64);
      for(let i=0;i<190;i++){g.fillStyle=Math.random()>.35?'rgba(250,253,255,.95)':'rgba(90,150,200,.8)';
        g.fillRect((Math.random()*32)|0,(Math.random()*64)|0,1+((Math.random()*2)|0),5+((Math.random()*14)|0));}});
    ft.wrapS=ft.wrapT=THREE.RepeatWrapping;
    const sheets=[];
    for(const [dz,op] of [[2.6,.85],[1.4,.6]]){
      const geo=new THREE.PlaneGeometry(2*W+.4,9.6,1,1);
      const mat=psMat({map:ft,unlit:true,transparent:true,opacity:op,depthWrite:false,side:THREE.DoubleSide});
      const sh=new THREE.Mesh(geo,mat);sh.position.set(0,4.4,dz);fg.add(sh);sheets.push(geo);
    }
    /* white water where it lands, either side of the lane */
    const foamM=psMat({color:0xf2f8ff,unlit:true,transparent:true,opacity:.8,depthWrite:false});
    for(let n=0;n<8;n++){const fo=new THREE.Mesh(flat(new THREE.DodecahedronGeometry(.9+hash2(n,1)*.5,0)),foamM);
      const lx=(n<4?-1:1)*(F.hw+.4+(n%4)*.7);fo.position.set(lx,.3,2.2+hash2(n,3)*1.2);fo.scale.y=.6;fg.add(fo);}
    /* the plunge pool beside the lane, and the stream leaving it */
    const pool=new THREE.Mesh(new THREE.CircleGeometry(6,12).rotateX(-Math.PI/2),psMat({color:0x4a8ab8,unlit:true}));
    const pv=atF(jw+6,F.hw+8);pool.position.set(pv.x,pv.y+.08,pv.z);world.add(pool);
    hoorMerge(fg);
    fallInfo={sheets,fg,W,pool:pv};
    /* bears: one fishing in the pool, one by the falls, one wandering further on */
    const bs=[[jw+6,F.hw+8,0],[jw-8,-(F.hw+6),1.2],[Math.round(F.n*.78),F.hw+7,-2.2]];
    const bearG=new THREE.Group();
    for(const [j,l,r] of bs){const v=atF(clamp(j,0,F.n-1),l);if(!mainClear(v,6))continue;
      const b=hoorBear();b.position.copy(v);b.rotation.y=yawF+r;bearG.add(b);}
    world.add(hoorMerge(bearG));
    /* tall log palisade down both sides of the lane, and the gates at each end */
    const pal=new THREE.InstancedMesh(flat(new THREE.CylinderGeometry(.22,.24,3.4,5)),wood,F.n*2);
    let pc=0;
    for(let j=COMMIT+6;j<F.n-MERGE-4;j++)for(const sg of [-1,1]){
      if(Math.abs(j-jw)<5)continue;
      const v=atF(j,sg*(F.hw+3.2));if(!mainClear(v,4))continue;
      if(Math.hypot(v.x-pv.x,v.z-pv.z)<8)continue;
      p.set(v.x,v.y+1.4,v.z);m4.compose(p,q.identity(),one);pal.setMatrixAt(pc++,m4);
    }
    pal.count=pc;pal.instanceMatrix.needsUpdate=true;world.add(pal);
    const gateTex=hoorPlank('BJÖRNHÄGN',72);
    for(const j of [COMMIT+5,F.n-MERGE-4]){
      const gg=new THREE.Group(),v=atF(j,0);gg.position.copy(v);gg.rotation.y=Math.atan2(F.FX[j],F.FZ[j]);world.add(gg);
      for(const sg of [-1,1])hoorBox(gg,.6,6,.6,wood,sg*(F.hw+2),3,0);
      hoorBox(gg,2*F.hw+5,.5,.5,wood,0,5.8,0);
      const pl=new THREE.Mesh(new THREE.PlaneGeometry(5.4,1.2),psMat({map:gateTex,unlit:true,side:THREE.DoubleSide}));
      pl.position.set(0,5.0,-.3);pl.rotation.y=Math.PI;gg.add(pl);hoorMerge(gg);
    }
    /* GENVÄG? boards already stand at the mouth; one more pointing at the bears */
  }
  /* ── Ringsjön: water, reeds, a jetty with a rowing boat, and a viewing tower ── */
  const water=new THREE.Mesh(new THREE.PlaneGeometry(1600,700).rotateX(-Math.PI/2),psMat({color:0x4f86ae,unlit:true}));
  water.position.set(0,-3.2,560);world.add(water);
  const glint=psMat({color:0x9ec4dc,unlit:true}),glG=new THREE.Group();
  for(let n=0;n<30;n++){const gl=new THREE.Mesh(new THREE.PlaneGeometry(rand(2,6),.4).rotateX(-Math.PI/2),glint);
    gl.position.set(rand(-300,300),-3.1,rand(230,420));glG.add(gl);}
  world.add(hoorMerge(glG));
  const RN=520,reed=new THREE.InstancedMesh(flat(new THREE.ConeGeometry(.5,1.5,4)).translate(0,.75,0),psMat({color:0x9aa456}),RN);
  let rc=0,guard=0;
  while(rc<RN&&guard++<6000){const x=rand(-380,380),z=rand(190,240),d=lake(x,z),y=meshY(x,z);
    if(d<3||d>22||y<-3.6||latAt(x,z)<HW+6)continue;
    p.set(x,Math.max(y,-3.3),z);e.set(0,rand(0,6),0);q.setFromEuler(e);const s=rand(.7,1.3);sc.set(s,s,s);
    m4.compose(p,q,sc);reed.setMatrixAt(rc++,m4);}
  reed.count=rc;reed.instanceMatrix.needsUpdate=true;world.add(reed);
  {const i=440,c=at(i,-(HW+18));
    const jt=new THREE.Group();jt.position.set(c.x,0,c.z);jt.rotation.y=Math.atan2(0,1);world.add(jt);
    const deckY=-2.4,y0=c.y;
    const dk=new THREE.Mesh(flat(new THREE.BoxGeometry(2.6,.25,30)),woodL);dk.position.set(0,deckY+.12,22);jt.add(dk);
    const ramp=new THREE.Mesh(flat(new THREE.BoxGeometry(2.6,.25,10)),woodL);ramp.position.set(0,(y0+deckY)/2,4);
    ramp.rotation.x=Math.atan2(y0-deckY,10);jt.add(ramp);
    for(let s=0;s<6;s++)for(const sg of [-1,1])hoorBox(jt,.25,3,.25,wood,sg*1.2,deckY-1.2,10+s*5);
    const boat=new THREE.Group();boat.position.set(3.2,-3.0,30);boat.rotation.y=.3;jt.add(boat);
    hoorBox(boat,1.4,.5,4,psMat({color:0xc8321f}),0,0,0);hoorBox(boat,1.2,.1,.4,woodL,0,.25,.3);
    hoorMerge(jt);keep.push([c.x,c.z+18,14]);}
  {const i=470,c=at(i,HW+16);                               /* viewing tower over the lake */
    const tw=new THREE.Group();tw.position.copy(c);tw.rotation.y=yawAt(i);world.add(tw);
    for(const [x,z] of [[-1.6,-1.6],[1.6,-1.6],[-1.6,1.6],[1.6,1.6]])hoorBox(tw,.35,9,.35,wood,x,4.5,z);
    hoorBox(tw,4.2,.3,4.2,woodL,0,8.2,0);
    for(const sg of [-1,1]){hoorBox(tw,4.2,1,.15,woodL,0,8.9,sg*2.05);hoorBox(tw,.15,1,4.2,woodL,sg*2.05,8.9,0);}
    const rf=gableRoof(4.8,4.8,1.8,0x5a3a2a);rf.position.y=10.2;tw.add(rf);
    for(let s=0;s<6;s++)hoorBox(tw,1,.15,.5,woodL,0,1+s*1.3,-2.4-s*.1);
    hoorMerge(tw);keep.push([c.x,c.z,8]);}
  /* the kiosk by the start, falu red with white trim */
  {const i=24,c=at(i,HW+15),h=house(7,5,3,0x8b2b1c,0x3b3f44,2.2);
    h.position.copy(c);h.rotation.y=yawAt(i);world.add(h);
    const sg=new THREE.Mesh(new THREE.PlaneGeometry(3.6,.9),psMat({map:hoorPlank('KIOSK'),unlit:true,side:THREE.DoubleSide}));
    sg.position.set(0,3.6,2.6);h.add(sg);
    for(let n=0;n<3;n++){const tb=new THREE.Group();tb.position.set(-4+n*4,0,6);h.add(tb);
      hoorBox(tb,2.4,.15,1.0,woodL,0,.8,0);for(const s of [-1,1])hoorBox(tb,2.4,.12,.4,woodL,0,.45,s*.8);}
    hoorMerge(h);keep.push([c.x,c.z,12]);}
  /* wooden signposts with arrows to the animals */
  const posts=[[44,1,['RINGSJÖN','VISENT']],[96,1,['BJÖRN','LO']],[300,-1,['ÄLG','RINGSJÖN']],[612,1,['LO','KIOSK']]];
  for(const [i,side,words] of posts){
    const c=at(i,side*(HW+5.2)),g=new THREE.Group();g.position.copy(c);g.rotation.y=yawAt(i);world.add(g);
    hoorBox(g,.22,3.4,.22,wood,0,1.7,0);
    words.forEach((w,n)=>{const pl=new THREE.Mesh(new THREE.PlaneGeometry(2.4,.6),psMat({map:hoorPlank(w),unlit:true,side:THREE.DoubleSide}));
      pl.position.set(n?.9:-.9,2.9-n*.75,0);pl.rotation.y=Math.PI+(n?.5:-.5);g.add(pl);});
    hoorMerge(g);
  }
  /* elk warning signs before each crossing */
  const es=hoorElkSign();
  for(const [i0,side] of HOOR_ELK){
    const i=i0-46,c=at(i,HW+3.6),g=new THREE.Group();g.position.copy(c);g.rotation.y=yawAt(i)+Math.PI;world.add(g);
    hoorBox(g,.14,2.4,.14,psMat({color:0x8a9096}),0,1.2,0);
    const pl=new THREE.Mesh(new THREE.PlaneGeometry(1.8,1.6),psMat({map:es,unlit:true,transparent:true,alphaTest:.5,side:THREE.DoubleSide}));
    pl.position.set(0,2.9,-.1);g.add(pl);
  }
  /* ── lush mixed forest: spruce, birch and oak ── */
  const TN=760;
  const spT=new THREE.InstancedMesh(flat(new THREE.CylinderGeometry(.22,.3,2,5)).translate(0,1,0),wood,TN);
  const spC=new THREE.InstancedMesh(flat(new THREE.ConeGeometry(2.6,9,6)).translate(0,6.2,0),psMat({color:0x2a5230}),TN);
  const biT=new THREE.InstancedMesh(flat(new THREE.CylinderGeometry(.16,.22,7,5)).translate(0,3.5,0),psMat({color:0xe8e6dc}),TN);
  const biC=new THREE.InstancedMesh(flat(new THREE.SphereGeometry(2.2,6,5)).scale(.8,1.3,.8).translate(0,7.6,0),psMat({color:0x7ab24a}),TN);
  const okT=new THREE.InstancedMesh(flat(new THREE.CylinderGeometry(.35,.5,4,5)).translate(0,2,0),psMat({color:0x5a4632}),TN);
  const okC=new THREE.InstancedMesh(flat(new THREE.DodecahedronGeometry(3.6,0)).scale(1,.8,1).translate(0,6.4,0),psMat({color:0x4a8a36}),TN);
  let s1=0,s2=0,s3=0;guard=0;
  while(s1+s2+s3<TN*1.5&&guard++<8000){
    const x=rand(-390,390),z=rand(-390,200);
    if(lake(x,z)>-4||keep.some(k=>Math.hypot(x-k[0],z-k[1])<k[2]))continue;
    const l=latAt(x,z);if(l<HW+5.5+hash2(x,z)*4)continue;
    if(nearStation(x,z,28))continue;
    p.set(x,meshY(x,z)-.15,z);e.set(0,rand(0,6.3),0);q.setFromEuler(e);
    const s=rand(.75,1.3);sc.set(s,s*rand(.9,1.15),s);m4.compose(p,q,sc);
    const h=hash2(Math.floor(x/60),Math.floor(z/60))*.6+hash2(x,z)*.4;    /* stands of one kind, mixed at the edges */
    if(h<.42){if(s1<TN){spT.setMatrixAt(s1,m4);spC.setMatrixAt(s1,m4);s1++;}}
    else if(h<.72){if(s2<TN){biT.setMatrixAt(s2,m4);biC.setMatrixAt(s2,m4);s2++;}}
    else if(s3<TN){okT.setMatrixAt(s3,m4);okC.setMatrixAt(s3,m4);s3++;}
  }
  spT.count=spC.count=s1;biT.count=biC.count=s2;okT.count=okC.count=s3;
  for(const M of [spT,spC,biT,biC,okT,okC]){M.instanceMatrix.needsUpdate=true;world.add(M);}
  /* ferns and bushes along the verges */
  const BN=600,bush=new THREE.InstancedMesh(flat(new THREE.DodecahedronGeometry(1,0)).scale(1.2,.6,1.2),psMat({color:0x3e7a30}),BN);
  const fern=new THREE.InstancedMesh(flat(new THREE.ConeGeometry(.9,.8,5)).translate(0,.4,0),psMat({color:0x5a9a3a}),BN);
  let b1=0,b2=0;guard=0;
  while((b1<BN||b2<BN)&&guard++<6000){
    const x=rand(-390,390),z=rand(-390,200);if(lake(x,z)>-2)continue;
    const l=latAt(x,z);if(l<HW+3.4||l>HW+40)continue;
    if(nearStation(x,z,18))continue;
    p.set(x,meshY(x,z)-.05,z);e.set(0,rand(0,6.3),0);q.setFromEuler(e);const s=rand(.7,1.5);sc.set(s,s,s);m4.compose(p,q,sc);
    if(hash2(x,z)<.5){if(b1<BN)bush.setMatrixAt(b1++,m4);}else if(b2<BN)fern.setMatrixAt(b2++,m4);
  }
  bush.count=b1;fern.count=b2;bush.instanceMatrix.needsUpdate=fern.instanceMatrix.needsUpdate=true;
  world.add(bush);world.add(fern);
  HOOR_FALL.info=fallInfo;
}
const HOOR_FALL={info:null};

/** the elk, the waterfall's water and spray */
function hazardsHoor(H){
  const elkR=1.95;
  HOOR_ELK.forEach(([i0,side,period,phase],n)=>{
    const elk=hoorElk();world.add(elk);
    const L=elk.userData.legs,head=elk.userData.head;
    const far=side*(HW+11),stand=side*4.8;
    H.push({id:'alg'+n,period,phase,mesh:elk,unblockable:true,
      update(u,dt){
        let lat,walk=false,turn=0;               /* turn: 0 walking in, 1 turned round to walk out */
        if(u<0.14)lat=far;
        else if(u<0.30){lat=lerp(far,stand,smooth(0.14,0.30,u));walk=true;}
        else if(u<0.74)lat=stand;
        else if(u<0.80){lat=stand;turn=smooth(0.74,0.80,u);walk=true;}
        else if(u<0.94){lat=lerp(stand,far,smooth(0.80,0.94,u));walk=true;turn=1;}
        else{lat=far;turn=1;}
        const q=mainPt(i0,lat),gy=Math.abs(lat)<HW+1?q.y:meshY(q.x,q.z);
        elk.position.set(q.x,gy-.05,q.z);
        /* across the road, nose toward where it is going; the turn round happens in place */
        const yIn=Math.atan2(-side*rx[i0],-side*rz[i0]);
        elk.rotation.y=yIn+turn*Math.PI;
        L.forEach((g,k)=>g.rotation.x=walk?Math.sin(clock*6+k*1.6)*.5:0);
        /* standing: it looks down the road at whoever is coming, chewing */
        head.rotation.y=(u>0.30&&u<0.74)?Math.sin(clock*.5+n)*.5+side*.7:0;
        head.rotation.x=(u>0.30&&u<0.74)?Math.sin(clock*3)*.04:0;
        const ax=Math.sin(elk.rotation.y),az=Math.cos(elk.rotation.y);
        this.c={x:q.x+ax*.3,z:q.z+az*.3,y:gy,ax,az};this.on=Math.abs(lat)<HW+3;
        if(!this.on)return;
        for(const k of karts){                   /* a big, solid animal */
          if(k.parked||k.rib||k.ghost>0)continue;
          const d=hoorSeg(k,this.c);if(d.d>=elkR||Math.abs(k.y-gy)>3)continue;
          k.x=d.px+d.nx*elkR;k.z=d.pz+d.nz*elkR;
          const vn=k.vx*d.nx+k.vz*d.nz;if(vn<0){k.vx-=d.nx*vn*1.3;k.vz-=d.nz*vn*1.3;}
        }
        if(state==='race'&&u>0.04&&u<0.90)for(const k of karts){   /* the AI steers round it */
          if(!k.ai||k.rib||k.parked)continue;
          let d=i0-k.mi;if(d>N/2)d-=N;else if(d<-N/2)d+=N;
          if(d<-3||d>90)continue;                  /* the AI aims far ahead, so it starts early */
          if(hash2(k.idx*3.7+n,k.lap*1.9)<0.15)continue;   /* now and then one of them is daydreaming */
          const cur=k.line+k.itemBias,want=-side*4.6;     /* the wide-open half of the road */
          if(cur*side>want*side)k.itemBias+=(want-cur)*0.4;
        }
      },
      hit(k){if(!this.on||!this.c||k.rib)return false;const d=hoorSeg(k,this.c);return d.d<elkR+.35&&Math.abs(k.y-this.c.y)<3;},
      effect(k){
        const d=hoorSeg(k,this.c);
        const sp=Math.hypot(k.vx,k.vz);
        k.vx=d.nx*Math.min(6,2+sp*.12);k.vz=d.nz*Math.min(6,2+sp*.12);
        k.boost=0;k.drift=0;k.charge=0;k.slow=Math.max(k.slow,.5);
        for(let p=0;p<10;p++)puff(k.x+rand(-1,1),k.y+rand(.3,1.5),k.z+rand(-1,1),.62,.5,.36,.6);
        if(k===player){toast('ÄLGEN FLYTTAR SIG INTE!');ping(140,70,.3);shake=Math.min(1,shake+.6);}
      }});
  });
  /* the waterfall: scroll the water, throw spray, and splash whoever drives through */
  const F=ALTS.find(r=>r.id==='fall');
  H.push({id:'fall',period:1,phase:0,unblockable:true,
    update(u,dt){
      const I=HOOR_FALL.info;if(!I)return;
      for(const g of I.sheets){const uv=g.attributes.uv;const o=(clock*1.6)%1;
        uv.setY(0,1+o);uv.setY(1,1+o);uv.setY(2,o);uv.setY(3,o);uv.needsUpdate=true;}
      if(Math.random()<.6){const fg=I.fg,lx=rand(-I.W,I.W),c=Math.cos(fg.rotation.y),s=Math.sin(fg.rotation.y);
        puff(fg.position.x+c*lx+s*2.4,fg.position.y+rand(.2,1.4),fg.position.z-s*lx+c*2.4,.86,.94,1,.8);}
      if(Math.random()<.3)puff(I.pool.x+rand(-3,3),I.pool.y+.4,I.pool.z+rand(-3,3),.86,.94,1,.6);
      if(F)for(const k of karts){                /* a soaking for whoever drives through, nothing worse */
        if(k.rib!==F.idx)continue;
        const dx=k.x-I.fg.position.x,dz=k.z-I.fg.position.z,inn=dx*dx+dz*dz<12;
        if(inn&&!k.hoorWet){for(let p=0;p<16;p++)puff(k.x+rand(-1.4,1.4),k.y+rand(.4,2.4),k.z+rand(-1.4,1.4),.86,.94,1,.7);
          if(k===player&&state==='race'){toast('PLASK!');ping(900,300,.18);}}
        k.hoorWet=inn;
      }
    }});
}
/** nearest point on an elk's body line to a kart, and the push-out direction */
function hoorSeg(k,c){
  const t=clamp((k.x-c.x)*c.ax+(k.z-c.z)*c.az,-1.25,1.25);
  const px=c.x+c.ax*t,pz=c.z+c.az*t;let nx=k.x-px,nz=k.z-pz;const d=Math.hypot(nx,nz)||1e-4;
  return {d,px,pz,nx:nx/d,nz:nz/d};
}
