"use strict";
/* ───────── Söderåsen och Skäralids ravin ───────── */
/* Dark Forest Dash's counterpart: down through the beech forest into the gorge, a rock tunnel before the ford, wild boar on the road */
ROADTEX.soderasen=()=>pixTex(64,64,g=>{              /* a forest road: worn tarmac under a litter of beech leaves */
  g.fillStyle='#4a4840';g.fillRect(0,0,64,64);
  for(let i=0;i<800;i++){
    g.fillStyle=Math.random()>.5?'rgba(120,116,100,.5)':'rgba(28,28,24,.45)';
    g.fillRect((Math.random()*64)|0,(Math.random()*64)|0,1,1);
  }
  for(let i=0;i<70;i++){
    g.fillStyle=['#a8782c','#c49a3a','#7a5a26','#8a6a2a'][i%4];
    g.fillRect((Math.random()*62)|0,(Math.random()*63)|0,2,1);
  }
});
VERGEC.soderasenLov=['#6b5330','#8f6c38','#45381f'];
GROUND.bokskog={cell:40,stripe:0.9,verge:0x6b5530,
  cols:[0x6b5832,0x7a6436,0x5c6a32,0x4e5e2c,0x86703c,0x66703a,0x58482a]};
SURF.soderasenBerg={top:o=>o+(1-o)*0.32,grip:o=>1-0.40*(1-o),fuel:1.1,name:'BERGGRUND'};
SFX.soderasenBerg={dust:[.55,.53,.5],noise:{f:760,g:.024},rattle:true};
/* the ford: the main-road sample where Skärån runs over the road */
const SODER={ford:512};
/** distance from the stream's line and position along it (0 at the ford) */
function soderasenStream(x,z){
  const F=SODER.ford,dx=x-sx[F],dz=z-sz[F];
  return {d:Math.abs(dx*fx[F]+dz*fz[F]),s:dx*rx[F]+dz*rz[F]};
}
/** the ridge top is a flat beech plateau; the road cuts down into it, the north edge falls to the plain */
function soderasenPlateau(x,z){return 44-36*smooth(-206,-262,z);}
EDGES.soderasenStock=st=>{                          /* beech logs laid on stones along the forest road */
  const log=flat(new THREE.CylinderGeometry(.32,.36,1,6));log.rotateX(Math.PI/2);
  const stone=flat(new THREE.DodecahedronGeometry(.5,0));
  const L=new THREE.InstancedMesh(log,psMat({color:0x8a8478}),N),S=new THREE.InstancedMesh(stone,psMat({color:0x6f7062}),N);
  const m4=new THREE.Matrix4(),q=new THREE.Quaternion(),e=new THREE.Euler(),p=new THREE.Vector3(),sc=new THREE.Vector3();
  let a=0,b=0;
  for(let i=0;i<N;i+=4)for(const side of [-1,1]){
    if(Math.abs(i-SODER.ford)<9)continue;          /* the stream runs through */
    const o=side*(HW+4.3),j=(i+2)%N,x=sx[j]+rx[j]*o,z=sz[j]+rz[j]*o;
    if(nearAlt(x,z,2.6))continue;
    const x0=sx[i]+rx[i]*o,z0=sz[i]+rz[i]*o,y0=meshY(x0,z0);
    p.set(x0,y0+.3,z0);e.set(0,i,0);q.setFromEuler(e);sc.set(1,1,1);m4.compose(p,q,sc);S.setMatrixAt(b++,m4);
    const h=hash2(i,side);
    p.set(x,meshY(x,z)+.75,z);e.set(0,Math.atan2(fx[j],fz[j]),0);q.setFromEuler(e);
    sc.set(1+h*.3,1+h*.3,SEG*4+.6);m4.compose(p,q,sc);L.setMatrixAt(a++,m4);
  }
  L.count=a;S.count=b;L.instanceMatrix.needsUpdate=S.instanceMatrix.needsUpdate=true;world.add(L);world.add(S);
};

STAGES.push({ id:'soderasen', group:'osterlen', name:'SÖDERÅSEN', sub:'SKÄRALIDS RAVIN', hw:8.2,
  bars:[0.55,0.85,0.6], laps:3,
  blurb:'Start high on the Söderåsen ridge, then drop through green-gold beech forest into the Skäralid gorge, splash over the ford at the bottom and climb back out under the Kopparhatten lookout. Just before the stream a rough rock tunnel cuts through the gorge wall, and a sounder of wild boar charges across the road: watch the bushes rustle and listen for the grunts.',
  role:'Utför i ravinen, genom berget och upp igen. Se upp för vildsvinen.',
  sky:[0xeee8bc,0x6c9cc8], fog:[0xbcc49a,60,320], amb:0x5e6a4c, dif:0xffeab0,
  road:'soderasen', verge:'soderasenLov', edge:'soderasenStock', ground:'bokskog', paint:false,
  terrain:{size:900,seg:110},
  jumpSpec:[{h:3.4,drop:2.4,up:12,dn:7,rec:16},{h:2.8,drop:2.0,up:10,dn:6,rec:14}],
  ctrl:[[-170,40,-172],[-80,41,-178],[10,40,-172],[90,38,-150],[150,34,-110],[180,28,-50],
        [176,21,10],[150,15,60],[100,10,96],[54,8,112],[24,7,146],[8,6,190],[-40,5,210],[-86,4,188],
        [-108,4,152],[-146,4,132],[-186,9,96],[-212,16,40],[-205,23,-20],[-228,30,-90],[-214,36,-148]],
  mod:(x,z,t)=>{
    const i=nearestGlobal(x,z),base=sy[i],r=rolls(x,z),S=soderasenStream(x,z);
    const W=smooth(10,52,S.d)+(1-smooth(70,110,Math.abs(S.s)));    /* Skärån's own little valley */
    const w=clamp(W,0,1);
    let h=t*(w*(soderasenPlateau(x,z)-base)-r*(0.6+0.4*(1-w)));
    const lat=Math.abs((x-sx[i])*rx[i]+(z-sz[i])*rz[i]);
    h-=2.6*(1-smooth(3,7,S.d))*smooth(HW+3,HW+7,lat)*(1-smooth(80,110,Math.abs(S.s)));
    return h;
  },
  land:(x,z,out)=>{
    if(z<-224){const h=hash2(Math.floor(x/60),Math.floor(z/50));     /* the Skåne plain below the ridge */
      out.setHex([0xd8c070,0x7fa04c,0xc4a85a,0x8fae58,0x6e5a40][Math.floor(h*5)]);return;}
    const S=soderasenStream(x,z);
    if(S.d<6&&Math.abs(S.s)>HW+2&&Math.abs(S.s)<110)out.setHex(0x5a6450);
  },
  sfxOff:'grass', stations:[[0.27,1],[0.80,-1]],
  routes:[
    {id:'tunneln',name:'TUNNELN',a:370,b:494,hw:4.2,side:1,lead:9,leadLat:10,
     mid:[[0.5,3]],surface:'soderasenBerg',risk:0.4,
     blurb:'A rough rock tunnel through the gorge wall, short but bumpy, out just above the ford.'}],
  stamps:[
    {id:'sod1',dish:'Nyponsoppa',ini:'N',kind:'intro',route:'main',i:56,lat:-6.2,
     hint:'Uppe på åsen, vid kanten mot slätten.',
     story:'Rose hips grow red along every forest edge on Söderåsen in late summer. Boiled, sieved and sweetened they become nyponsoppa, a warm sweet soup carried in a thermos up to the ridge and drunk with a few almond biscuits while you get your breath back.'},
    {id:'sod2',dish:'Vildsvinskorv',ini:'V',kind:'master',route:'tunneln',f:0.84,lat:'edge',
     hint:'Längs väggen i tunneln, nära utgången.',
     story:'Skåne has more wild boar than anywhere else in Sweden, and the sounders turning over the forest floor round Söderåsen are why. What the hunters bring home ends up as coarse, smoky boar sausage, grilled at the hut with mustard.'},
    {id:'sod3',dish:'Kokkaffe',ini:'K',kind:'air',route:'main',jump:0,after:5,lat:0,air:4.6,
     hint:'Högt i luften över det första hoppet.',
     story:'Boiled coffee is the hiker\'s coffee: grounds straight into the pot over the fire, brought to the boil, then left to settle. Drunk out of a wooden cup at the Kopparhatten lookout, with the whole gorge below, it tastes better than it has any right to.'}],
  hazards:H=>hazardsSoderasen(H), scenery:()=>scenerySoderasen()
});

function soderasenInst(geo,mat,list){
  const m=new THREE.InstancedMesh(geo,mat,Math.max(1,list.length));
  const m4=new THREE.Matrix4(),q=new THREE.Quaternion(),e=new THREE.Euler(),p=new THREE.Vector3(),s=new THREE.Vector3(),c=new THREE.Color();
  list.forEach((o,i)=>{
    p.set(o.x,o.y,o.z);e.set(o.rx||0,o.ry||0,o.rz||0);q.setFromEuler(e);
    const k=o.s||1;s.set(o.sx||k,o.sy||k,o.sz||k);m4.compose(p,q,s);m.setMatrixAt(i,m4);
    if(o.c!=null){c.setHex(o.c);m.setColorAt(i,c);}
  });
  m.count=list.length;m.instanceMatrix.needsUpdate=true;world.add(m);return m;
}
/** a rock mass over a lane with a roofed corridor through it */
function soderasenMound(R,o){
  const S=SEG,jc=o.jc,nL=Math.round(o.L/S),j0=Math.max(2,jc-nL),j1=Math.min(R.n-3,jc+nL);
  const prof=(j,v)=>{const u=(j-jc)*S/o.L,w=v/o.W,f=1-u*u-w*w;return f>0?o.H*Math.pow(f,o.pow):0;};
  const clr=(x,z)=>{const i=nearestGlobal(x,z);return smooth(HW+5,HW+16,Math.abs((x-sx[i])*rx[i]+(z-sz[i])*rz[i]));};
  const vs=[o.cw];for(let v=o.cw+1.4;v<o.W+3;v+=2.4)vs.push(v);
  const pos=[],col=[],top={},pts=[];
  const tc=new THREE.Color();
  for(const s of [-1,1]){
    const P=[];
    for(let j=j0;j<=j1;j++){
      const row=[];
      vs.forEach((v,vi)=>{
        const x=R.X[j]+R.RX[j]*s*v,z=R.Z[j]+R.RZ[j]*s*v,h=prof(j,v)*clr(x,z);
        const y=vi===0?R.Y[j]-.3+h:meshY(x,z)-.45+h+(h>1?(hash2(Math.round(x*2),Math.round(z*2))-.5)*o.noise:0);
        row.push([x,y,z,h/o.H]);
        if(vi===0)top[s+':'+j]=y;else if(h>2)pts.push([x,y,z,h/o.H]);
      });
      P.push(row);
    }
    for(let a=0;a<P.length-1;a++)for(let b=0;b<vs.length-1;b++){
      const A=P[a][b],B=P[a+1][b],C=P[a][b+1],D=P[a+1][b+1];
      for(const T of [[A,B,C],[B,D,C]]){
        const ux=T[1][0]-T[0][0],uz=T[1][2]-T[0][2],wx=T[2][0]-T[0][0],wz=T[2][2]-T[0][2];
        const tri=(uz*wx-ux*wz)<0?[T[0],T[2],T[1]]:T;
        o.col(tc,hash2(T[0][0]+a,T[0][2]+b),(T[0][3]+T[1][3]+T[2][3])/3);
        for(const V of tri){pos.push(V[0],V[1],V[2]);col.push(tc.r,tc.g,tc.b);}
      }
    }
  }
  const g=new THREE.BufferGeometry();
  g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));
  g.setAttribute('color',new THREE.Float32BufferAttribute(col,3));
  g.computeVertexNormals();
  world.add(new THREE.Mesh(g,psMat({vertexColors:true})));
  const quad=(arr,a,b,c,d)=>arr.push(a[0],a[1],a[2],b[0],b[1],b[2],c[0],c[1],c[2],b[0],b[1],b[2],d[0],d[1],d[2],c[0],c[1],c[2]);
  const wall=[],cover=[];
  let cA=-1,cB=-1;
  const E=(j,s,y)=>[R.X[j]+R.RX[j]*s*o.cw,y,R.Z[j]+R.RZ[j]*s*o.cw];
  for(let j=j0;j<j1;j++){
    for(const s of [-1,1])quad(wall,E(j,s,R.Y[j]-.3),E(j+1,s,R.Y[j+1]-.3),E(j,s,top[s+':'+j]),E(j+1,s,top[s+':'+(j+1)]));
    const cov=k=>Math.min(top['-1:'+k],top['1:'+k])-R.Y[k]>=o.roofH+.9;
    if(cov(j)&&cov(j+1)){
      if(cA<0)cA=j;cB=j+1;
      quad(cover,E(j,-1,top['-1:'+j]),E(j+1,-1,top['-1:'+(j+1)]),E(j,1,top['1:'+j]),E(j+1,1,top['1:'+(j+1)]));
    }
  }
  const mk=(arr,mat)=>{const gg=new THREE.BufferGeometry();gg.setAttribute('position',new THREE.Float32BufferAttribute(arr,3));
    gg.computeVertexNormals();world.add(new THREE.Mesh(gg,mat));};
  mk(wall,o.wallMat);mk(cover,o.coverMat);
  if(cA>=0){
    const roof=[],fac=[];
    for(let j=cA;j<=cB;j++)roof.push({x:R.X[j],y:R.Y[j]+o.roofH+.5+hash2(j,1)*.5,z:R.Z[j],ry:Math.atan2(R.FX[j],R.FZ[j])+(hash2(j,2)-.5)*.2,
      rz:(hash2(j,3)-.5)*.12,sx:2*o.cw+1.8,sy:1.2,sz:S*1.05});
    soderasenInst(flat(new THREE.BoxGeometry(1,1,1)),o.roofMat,roof);
    for(const j of [cA,cB]){
      const hT=Math.max(top['-1:'+j],top['1:'+j])-R.Y[j];
      fac.push({x:R.X[j],y:R.Y[j]+(o.roofH+hT)/2+.3,z:R.Z[j],ry:Math.atan2(R.FX[j],R.FZ[j]),sx:2*o.cw+3.4,sy:hT-o.roofH+.8,sz:2.2});
    }
    soderasenInst(flat(new THREE.BoxGeometry(1,1,1)),o.roofMat,fac);
  }
  return {j0,j1,cA,cB,pts};
}
function scenerySoderasen(){
  const box=flat(new THREE.BoxGeometry(1,1,1)),ico=flat(new THREE.IcosahedronGeometry(1,0)),dod=flat(new THREE.DodecahedronGeometry(1,0));
  const at=(i,o,up)=>{i=((i%N)+N)%N;const x=sx[i]+rx[i]*o,z=sz[i]+rz[i]*o;return {x,y:meshY(x,z)+(up||0),z,ry:Math.atan2(fx[i],fz[i])};};
  const F=SODER.ford;
  /* ── the rock tunnel through the gorge wall ── */
  const R=ALTS.find(r=>r.id==='tunneln');
  let knoll=null;
  if(R){
    const jc=Math.round(R.n*0.5),rockM=psMat({color:0x6a665c});
    const wallT=pixTex(32,32,g=>{g.fillStyle='#57534a';g.fillRect(0,0,32,32);
      for(let i=0;i<260;i++){g.fillStyle=Math.random()>.5?'#6e695e':'#3e3b35';g.fillRect((Math.random()*32)|0,(Math.random()*32)|0,2,2);}
      g.fillStyle='#4a5a32';for(let i=0;i<12;i++)g.fillRect((Math.random()*30)|0,(Math.random()*8)|0,3,2);});
    wallT.wrapS=wallT.wrapT=THREE.RepeatWrapping;
    const M=soderasenMound(R,{jc,L:44,W:32,H:18,pow:0.5,roofH:7.0,cw:R.hw+1.5,noise:2.4,
      wallMat:psMat({map:wallT,side:THREE.DoubleSide}),coverMat:psMat({color:0x5e6a3c,side:THREE.DoubleSide}),roofMat:rockM,
      col:(c,h,f)=>{const v=.36+h*.14;c.setRGB(v,v*.97,v*.88);if(f>.55&&h>.35)c.setRGB(.33,.42,.22);if(f<.08)c.setRGB(.35,.4,.24);}});
    knoll={cx:R.X[jc],cz:R.Z[jc],M};
    /* a rough rock floor */
    const fl=pixTex(32,32,g=>{g.fillStyle='#5c5850';g.fillRect(0,0,32,32);
      for(let i=0;i<220;i++){g.fillStyle=Math.random()>.5?'#77726a':'#3c3934';g.fillRect((Math.random()*32)|0,(Math.random()*32)|0,2,1);}});
    fl.wrapS=fl.wrapT=THREE.RepeatWrapping;
    const fm=psMat({map:fl});fm.polygonOffset=true;fm.polygonOffsetFactor=-4;fm.polygonOffsetUnits=-4;
    world.add(new THREE.Mesh(altRibbon(R,-R.hw-.6,R.hw+.6,.07,5,COMMIT,R.n-1-MERGE),fm));
    if(M.cA>=0){
      /* jagged lumps along the walls, lanterns, portal rocks at both mouths */
      const lumps=[],lamps=[],port=[];
      for(let j=M.cA;j<=M.cB;j+=2)for(const s of [-1,1]){
        const l=s*(R.hw+1.6+hash2(j,s)*.4);
        lumps.push({x:R.X[j]+R.RX[j]*l,y:R.Y[j]+1+hash2(j,s+4)*4.5,z:R.Z[j]+R.RZ[j]*l,ry:hash2(j,s)*6,rx:hash2(s,j)*2,s:.8+hash2(j*1.3,s)*.8,c:0x6a665c});
      }
      for(let j=M.cA+3;j<M.cB-1;j+=7)for(const s of [-1,1])
        lamps.push({x:R.X[j]+R.RX[j]*s*(R.hw+1.1),y:R.Y[j]+5.6,z:R.Z[j]+R.RZ[j]*s*(R.hw+1.1),sx:.35,sy:.5,sz:.35});
      for(const j of [M.cA,M.cB])for(const s of [-1,1]){
        const l=s*(R.hw+2.6);port.push({x:R.X[j]+R.RX[j]*l,y:R.Y[j]+3,z:R.Z[j]+R.RZ[j]*l,ry:hash2(j,s)*3,s:3.2,sy:4.4,c:0x77736a});
      }
      soderasenInst(dod,psMat({color:0xffffff}),lumps.concat(port));
      soderasenInst(box,psMat({color:0xffc35a,unlit:true}),lamps);
    }
  }
  /* ── Skärån: the stream over the ford and down its little valley ── */
  {
    const wt=pixTex(32,32,g=>{g.fillStyle='#3c6c7a';g.fillRect(0,0,32,32);
      for(let i=0;i<60;i++){g.fillStyle=Math.random()>.5?'#7aa8b0':'#2c5866';g.fillRect((Math.random()*28)|0,(Math.random()*32)|0,5,1);}});
    wt.wrapS=wt.wrapT=THREE.RepeatWrapping;
    const wm=psMat({map:wt,unlit:true,transparent:true,opacity:.85,depthWrite:false});
    /* the ford: a sheet of water over the road */
    const ford=sweep(F-4,F+4,-HW-3.2,.08,HW+3.2,.08,wm);
    const fo=[];
    for(const s of [-1,1])for(let n=0;n<5;n++){const p=at(F-3+n*1.5,s*(HW+3.4),.15);fo.push({x:p.x,y:p.y,z:p.z,ry:n,sx:1.6,sy:.3,sz:1.2});}
    soderasenInst(box,psMat({color:0xe8f2f4,unlit:true}),fo);
    for(const s of [-1,1]){
      const pos=[],uv=[],idx=[];let k=0;
      for(let d=HW+3;d<=112;d+=4){
        const cx=sx[F]+rx[F]*s*d,cz=sz[F]+rz[F]*s*d,y=meshY(cx,cz)+.55;
        for(const w of [-3.4,3.4]){pos.push(cx+fx[F]*w,y,cz+fz[F]*w);uv.push(w>0?1:0,d/6);}
        if(k)idx.push(2*k-2,2*k-1,2*k, 2*k-1,2*k+1,2*k);k++;
      }
      const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));
      g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(idx);g.computeVertexNormals();
      const m=new THREE.Mesh(g,psMat({map:wt,unlit:true,side:THREE.DoubleSide}));world.add(m);
    }
    /* a little stone footbridge for the walkers, a stride downstream */
    {const d=-(HW+22),cx=sx[F]+rx[F]*d,cz=sz[F]+rz[F]*d,y=meshY(cx,cz)+.55,yaw=Math.atan2(fx[F],fz[F]);
      const fb=new THREE.Group();fb.position.set(cx,y,cz);fb.rotation.y=yaw;world.add(fb);
      const st=psMat({color:0x8a867a});
      const deck=new THREE.Mesh(box,st);deck.scale.set(2.6,.5,12);deck.position.y=2.1;fb.add(deck);
      for(const s of [-1,1]){const pa=new THREE.Mesh(box,st);pa.scale.set(.4,.9,12);pa.position.set(s*1.2,2.8,0);fb.add(pa);
        const ab=new THREE.Mesh(box,st);ab.scale.set(2.6,2.4,2.4);ab.position.set(0,.9,s*5.2);fb.add(ab);}
    }
  }
  /* ── the beech forest ── */
  const trunks=[],crowns=[],ferns=[],rocks=[],moss=[];
  const greens=[0x5f8a34,0x6f9a3a,0x7fa842,0x8fae48,0xa8ac44,0xbca848,0x6a8e30];
  const okTree=(x,z)=>{
    if(z<-226)return false;
    if(latAt(x,z)<HW+6.5)return false;
    const S=soderasenStream(x,z);if(S.d<7&&Math.abs(S.s)<112)return false;
    if(knoll&&Math.hypot(x-knoll.cx,z-knoll.cz)<36)return false;
    return true;
  };
  const tree=(x,z,big)=>{
    const y=meshY(x,z),h=(big?11:8)+hash2(x,z)*5,yaw=hash2(z,x)*6;
    trunks.push({x,y:y+h/2-.3,z,ry:yaw,sx:.9,sy:h,sz:.9});
    const r=(big?5.6:4.4)+hash2(x*.3,z)*1.6;
    crowns.push({x,y:y+h+r*.35,z,ry:yaw,sx:r,sy:r*.62,sz:r,c:greens[Math.floor(hash2(x*1.7,z*.9)*greens.length)]});
  };
  for(let i=0;i<N;i+=3)for(const side of [-1,1])for(let r=0;r<3;r++){
    if(trunks.length>1500)break;
    const o=side*(HW+7+r*9+hash2(i,r+side)*7),i2=(i+Math.round(hash2(r,i)*3))%N;
    const x=sx[i2]+rx[i2]*o,z=sz[i2]+rz[i2]*o;
    if(okTree(x,z))tree(x,z,r>0);
  }
  for(let n=0;n<700&&trunks.length<1900;n++){
    const x=rand(-420,420),z=rand(-220,420);
    if(okTree(x,z))tree(x,z,true);
  }
  soderasenInst(flat(new THREE.CylinderGeometry(.35,.5,1,6)),psMat({color:0x8c8a80}),trunks);
  soderasenInst(ico,psMat({color:0xffffff}),crowns);
  /* trees on top of the tunnel rock */
  if(knoll){
    const kt=[],kc=[];
    knoll.M.pts.forEach((p,n)=>{if(n%7||p[3]<.3)return;const h=7+hash2(n,2)*4;
      kt.push({x:p[0],y:p[1]+h/2-.3,z:p[2],sx:.8,sy:h,sz:.8});
      kc.push({x:p[0],y:p[1]+h+1.6,z:p[2],sx:4.4,sy:2.8,sz:4.4,c:greens[n%greens.length]});});
    soderasenInst(flat(new THREE.CylinderGeometry(.35,.5,1,6)),psMat({color:0x8c8a80}),kt);
    soderasenInst(ico,psMat({color:0xffffff}),kc);
  }
  /* mossy boulders, ferns and the gorge's rock faces */
  for(let n=0;n<1400;n++){
    const i=Math.floor(hash2(n,7.7)*N),side=hash2(n,1.1)>.5?1:-1,gorge=i>340&&i<540;
    const o=side*(HW+5+hash2(n,2.2)*(gorge?40:28)),x=sx[i]+rx[i]*o,z=sz[i]+rz[i]*o;
    if(z<-226||latAt(x,z)<HW+4.5)continue;
    const y=meshY(x,z);
    if(n%3===0){const s=gorge?1.6+hash2(n,3)*3.4:1+hash2(n,3)*2;
      rocks.push({x,y:y+s*.25,z,ry:hash2(n,4)*6,rx:hash2(n,5),s,sy:s*.7,c:hash2(n,6)>.5?0x7c7a70:0x6a685e});
      moss.push({x,y:y+s*.62,z,ry:hash2(n,4)*6,sx:s*.8,sy:s*.3,sz:s*.8});}
    else ferns.push({x,y:y+.35,z,ry:hash2(n,8)*6,s:.9+hash2(n,9)*.6,sy:.7,c:hash2(n,10)>.3?0x4f7a2c:0x8a8a34});
  }
  /* cliffs: the gorge walls break out in grey rock */
  for(let i=340;i<560;i+=3)for(const side of [-1,1]){
    const o=side*(HW+16+hash2(i,side)*14),x=sx[i]+rx[i]*o,z=sz[i]+rz[i]*o;
    if(latAt(x,z)<HW+10)continue;
    const S=soderasenStream(x,z);if(S.d<10)continue;
    if(knoll&&Math.hypot(x-knoll.cx,z-knoll.cz)<34)continue;
    const s=5+hash2(i,side+3)*5;
    rocks.push({x,y:meshY(x,z)+s*.2,z,ry:Math.atan2(fx[i],fz[i])+hash2(i,9)*.6,rx:(hash2(i,4)-.5)*.4,sx:s*1.2,sy:s*1.1,sz:s*.6,c:0x77756c});
  }
  soderasenInst(dod,psMat({color:0xffffff}),rocks);
  soderasenInst(flat(new THREE.SphereGeometry(1,6,4)),psMat({color:0x5a7a2e}),moss);
  soderasenInst(flat(new THREE.ConeGeometry(.9,1,5)),psMat({color:0xffffff}),ferns);
  /* fallen beech trunks among the trees */
  const logs=[];
  for(let n=0;n<40;n++){
    const i=Math.floor(hash2(n,3.3)*N),side=n%2?1:-1,o=side*(HW+10+hash2(n,4.4)*20),x=sx[i]+rx[i]*o,z=sz[i]+rz[i]*o;
    if(!okTree(x,z))continue;
    logs.push({x,y:meshY(x,z)+.45,z,ry:hash2(n,5)*6,rx:Math.PI/2,sx:.9,sy:9+hash2(n,6)*5,sz:.9});
  }
  soderasenInst(flat(new THREE.CylinderGeometry(.5,.6,1,6)),psMat({color:0x6e6a5e}),logs);
  /* shafts of sunlight through the canopy */
  const beams=[];
  for(let n=0;n<34;n++){
    const i=Math.floor(hash2(n,8.1)*N),side=n%2?1:-1,o=side*(2+hash2(n,2.9)*(HW+8)),p=at(i,o);
    beams.push({x:p.x,y:p.y+12,z:p.z,ry:p.ry+hash2(n,1)*1.2,rz:.35*side,sx:2.4+hash2(n,3)*2,sy:26,sz:.05});
  }
  const bm=psMat({color:0xfff2a8,unlit:true,transparent:true,opacity:.13,depthWrite:false,side:THREE.DoubleSide});
  soderasenInst(box,bm,beams);
  /* ── Kopparhatten: the lookout on the cliff edge above the gorge ── */
  {const i=432,p=at(i,-(HW+40)),g=new THREE.Group();g.position.set(p.x,p.y,p.z);g.rotation.y=p.ry;world.add(g);
    const crag=new THREE.Mesh(dod,psMat({color:0x8a7a64}));crag.scale.set(9,7,8);crag.position.set(0,1,0);g.add(crag);
    const deck=new THREE.Mesh(box,psMat({color:0x7a6047}));deck.scale.set(8,.4,7);deck.position.set(3,7.6,0);g.add(deck);
    const wood=psMat({color:0x5a4430});
    for(const [x,z,w,d] of [[7,0,.2,7],[3,3.5,8,.2],[3,-3.5,8,.2]]){const r=new THREE.Mesh(box,wood);r.scale.set(w,.2,d);r.position.set(x,8.8,z);g.add(r);}
    for(const [x,z] of [[7,3.4],[7,-3.4],[-1,3.4],[-1,-3.4],[7,0]]){const r=new THREE.Mesh(box,wood);r.scale.set(.2,1.4,.2);r.position.set(x,8.3,z);g.add(r);}
    for(const [x,z,c] of [[4,1,0xc8281c],[5,-1.5,0x2a5fa8]]){
      const b=new THREE.Mesh(box,psMat({color:c}));b.scale.set(.6,1.5,.4);b.position.set(x,8.6,z);g.add(b);
      const h=new THREE.Mesh(box,psMat({color:0xe8b890}));h.scale.setScalar(.42);h.position.set(x,9.6,z);g.add(h);}
    const sign=pixTex(128,24,g2=>{g2.fillStyle='#5a4430';g2.fillRect(0,0,128,24);g2.fillStyle='#f4e2b0';
      g2.font='9px "Press Start 2P",monospace';g2.textAlign='center';g2.textBaseline='middle';g2.fillText('KOPPARHATTEN',64,13);});
    const sp=new THREE.Mesh(new THREE.PlaneGeometry(9,1.7),psMat({map:sign,unlit:true,side:THREE.DoubleSide}));
    sp.position.set(7.3,10.6,0);sp.rotation.y=Math.PI/2;g.add(sp);
  }
  /* the plain below the north edge: farms and a church far off */
  for(const [x,z] of [[-260,-330],[-60,-360],[120,-320],[260,-380]]){
    const h=house(14,8,4,0xe6e2d6,0x8b2b1c,3);h.position.set(x,meshY(x,z)-.2,z);h.rotation.y=hash2(x,z)*3;world.add(h);
  }
  /* a trail sign at the top of the descent */
  {const p=at(150,HW+5),sg=pixTex(64,32,g=>{g.fillStyle='#e8e2d0';g.fillRect(0,0,64,32);g.fillStyle='#c8641c';g.fillRect(0,0,64,6);
      g.fillStyle='#2a2622';g.font='7px "Press Start 2P",monospace';g.textAlign='center';g.textBaseline='middle';
      g.fillText('SKÄRALID',32,15);g.fillText('1,2 KM',32,25);});
    const post=new THREE.Mesh(box,psMat({color:0x5a4430}));post.scale.set(.2,2.6,.2);post.position.set(p.x,p.y+1.3,p.z);world.add(post);
    const pl=new THREE.Mesh(new THREE.PlaneGeometry(2.4,1.2),psMat({map:sg,unlit:true,side:THREE.DoubleSide}));
    pl.position.set(p.x,p.y+2.8,p.z);pl.rotation.y=p.ry+Math.PI;world.add(pl);}
}
/** piglets wear stripes */
function soderasenBoar(adult){
  const g=new THREE.Group();
  const fur=adult?psMat({color:0x6a5442}):psMat({map:pixTex(16,16,c=>{c.fillStyle='#8a6a44';c.fillRect(0,0,16,16);
    c.fillStyle='#e0c890';for(let y=1;y<16;y+=4)c.fillRect(0,y,16,2);})});
  const dark=psMat({color:0x2e2620}),snout=psMat({color:0x9a7a6a});
  const k=adult?1.3:.65;
  const b=(w,h,d,m,x,y,z)=>{const e=new THREE.Mesh(flat(new THREE.BoxGeometry(w*k,h*k,d*k)),m);e.position.set(x*k,y*k,z*k);g.add(e);return e;};
  b(1.2,1.15,2.3,fur,0,1.25,0);
  if(adult)b(.4,.35,2.0,dark,0,1.95,-.1);
  b(.9,.85,.9,fur,0,1.15,1.45);b(.5,.42,.4,snout,0,.95,2.05);
  b(.18,.3,.12,dark,-.32,1.65,1.3);b(.18,.3,.12,dark,.32,1.65,1.3);
  if(adult){const t=psMat({color:0xf2ecd8});b(.08,.25,.08,t,-.22,1.12,2.15);b(.08,.25,.08,t,.22,1.12,2.15);}
  const legs=[];
  for(const [x,z] of [[-.4,.75],[.4,.75],[-.4,-.75],[.4,-.75]]){
    const piv=new THREE.Group();piv.position.set(x*k,.75*k,z*k);g.add(piv);
    const l=new THREE.Mesh(flat(new THREE.BoxGeometry(.26*k,.75*k,.26*k)),dark);l.position.y=-.37*k;piv.add(l);legs.push(piv);
  }
  g.userData.legs=legs;return g;
}
/** a sounder of wild boar: rustling bushes and grunts, then sow and piglets charge across */
function hazardsSoderasen(H){
  const bushM=psMat({color:0x4f7a2c}),bushG=flat(new THREE.IcosahedronGeometry(1,0));
  [[176,0,15,1],[618,6.5,13,-1]].forEach(([i0,ph,per,s0],n)=>{
    const herd=[soderasenBoar(true),soderasenBoar(false),soderasenBoar(false),soderasenBoar(false)];
    herd.forEach(m=>world.add(m));
    const W=HW+10;
    const bush={};
    for(const s of [-1,1]){
      const grp=new THREE.Group(),p=mainPt(i0,s*(W+.5));
      grp.position.set(p.x,meshY(p.x,p.z),p.z);world.add(grp);
      for(let k=0;k<4;k++){const m=new THREE.Mesh(bushG,bushM);m.scale.set(2.4,1.8,2.4);m.position.set((k-1.5)*1.6*fx[i0],1.2+(k%2)*.5,(k-1.5)*1.6*fz[i0]);grp.add(m);}
      bush[s]=grp;
    }
    let lastGrunt=-9;
    H.push({id:'galt'+n,period:per,phase:ph,mesh:herd[0],
      update(u){
        const half=u<0.5,h=half?u*2:(u-0.5)*2,from=half?s0:-s0;
        for(const s of [-1,1])bush[s].rotation.set(0,0,0);
        this.pts=null;
        if(h<0.26){                                          /* rustle: the bush they are in shakes */
          const b=bush[from],a=smooth(0,.06,h);
          b.rotation.set(Math.sin(clock*31)*.12*a,0,Math.cos(clock*27)*.12*a);
          if(state==='race'&&player&&clock-lastGrunt>.45&&Math.hypot(player.x-b.position.x,player.z-b.position.z)<95){
            lastGrunt=clock;ping(150+Math.random()*40,70,.16);
            if(Math.random()<.5)puff(b.position.x+rand(-2,2),b.position.y+rand(1,3),b.position.z+rand(-2,2),.35,.55,.2,.5);}
        }
        const pts=[];
        herd.forEach((m,k)=>{
          const v=(h-0.26-k*0.035)/0.26;
          if(v<=0||v>=1){m.visible=false;return;}
          m.visible=true;
          const l=from*W*(1-2*v),q=mainPt(i0+(k?(k%2?1.2:-1.2):0)+v*3,l),onRoad=Math.abs(l)<HW+3.7;
          const y=onRoad?q.y:meshY(q.x,q.z);
          m.position.set(q.x,y+Math.abs(Math.sin(clock*18+k))*.15,q.z);
          m.rotation.y=q.yaw+(from>0?Math.PI/2:-Math.PI/2);
          m.userData.legs.forEach((L,j)=>L.rotation.x=Math.sin(clock*22+j*1.7+k)*.7);
          pts.push({x:q.x,y:q.y,z:q.z,r:k?1.7:2.4,dx:-from*q.rx,dz:-from*q.rz});
        });
        if(pts.length)this.pts=pts;
      },
      hit(k){if(k.rib||!this.pts)return false;
        for(const p of this.pts)if(near3(k,p.x,p.y,p.z,p.r)){this.hp=p;return true;}return false;},
      effect(k){const p=this.hp||{dx:0,dz:0};
        k.vx=k.vx*.5+p.dx*10;k.vz=k.vz*.5+p.dz*10;k.slow=Math.max(k.slow,1.1);k.boost=0;k.drift=0;k.charge=0;
        for(let q=0;q<10;q++)puff(k.x+rand(-1,1),k.y+rand(.3,1.5),k.z+rand(-1,1),.5,.4,.28,.6);
        if(k===player){toast('VILDSVIN!');ping(130,55,.3);shake=Math.min(1,shake+.6);}}});
  });
  /* the ford: spray off the wheels */
  const F=SODER.ford;
  H.push({id:'vadstalle',period:1,phase:0,update(){
    if(state!=='race')return;
    for(const k of karts){
      if(k.rib||k.speed<6||k.air)continue;
      const d=((k.si-F+N/2)%N+N)%N-N/2;
      if(Math.abs(d)<4.5&&Math.random()<.7){
        const fx_=Math.sin(k.yaw),fz_=Math.cos(k.yaw);
        for(const s of [-1,1])puff(k.x-fx_*1.2+fz_*s*1.1,k.y+.3,k.z-fz_*1.2-fx_*s*1.1,.82,.9,.95,.5);
      }
    }}});
  /* in the tunnel the light drops away */
  const R=ALTS.find(r=>r.id==='tunneln');
  if(R){
    const jc=Math.round(R.n*0.5),half=Math.round(26/SEG);let f=1;
    const A=new THREE.Color(stage.amb),D=new THREE.Color(stage.dif);
    H.push({id:'tunnelljus',period:1,phase:0,update(u,dt){
      const inside=state==='race'&&player&&player.rib===R.idx&&Math.abs(player.si-jc)<half;
      const want=inside?.5:1,nf=lerp(f,want,Math.min(1,(dt||.016)*4));
      if(Math.abs(nf-f)<1e-4&&f===want)return;
      f=Math.abs(nf-want)<.01?want:nf;
      U.amb.value.copy(A).multiplyScalar(f);U.dif.value.copy(D).multiplyScalar(f);}});
  }
}
