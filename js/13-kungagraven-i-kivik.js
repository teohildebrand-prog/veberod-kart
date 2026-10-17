"use strict";
/* ───────── Kungagraven i Kivik ───────── */
/* Adventure Temple Trail's counterpart: a side passage straight through the Bronze Age grave chamber, apples rolling from the market */
ROADTEX.kivik=()=>pixTex(64,64,g=>{                 /* sun-bleached country tarmac with tar patches */
  g.fillStyle='#5b5a55';g.fillRect(0,0,64,64);
  for(let i=0;i<900;i++){
    g.fillStyle=Math.random()>.5?'rgba(150,146,134,.5)':'rgba(40,38,34,.45)';
    g.fillRect((Math.random()*64)|0,(Math.random()*64)|0,1,1);
  }
  g.fillStyle='rgba(30,30,32,.45)';
  for(let i=0;i<4;i++)g.fillRect((Math.random()*50)|0,(Math.random()*56)|0,8+((Math.random()*10)|0),5);
});
GROUND.kivik={cell:58,stripe:0.42,verge:0x9d9070,
  cols:[0xcdb35e,0xd9c06c,0x8aa850,0x7b9b47,0xbca24e,0x9fb05a,0x6f8e41,0xc4a85a]};
SURF.kivikSten={top:o=>o+(1-o)*0.3,grip:o=>1-0.35*(1-o),fuel:1.1,name:'STENHÄLLAR'};
SFX.kivikSten={dust:[.62,.6,.56],noise:{f:900,g:.022},rattle:true};
/** apple orchards come in blocks on the slopes inland */
const kivikOrchard=(x,z)=>x<150&&hash2(Math.floor((x+400)/52),Math.floor((z+400)/44))>0.42;
EDGES.kivikGard=st=>{                               /* stengärdesgård: a dry wall of round field stones */
  const g=flat(new THREE.DodecahedronGeometry(.62,0));
  const a=new THREE.InstancedMesh(g,psMat({color:0x9a968c}),N*4),b=new THREE.InstancedMesh(g,psMat({color:0x7f7b72}),N*4);
  const m4=new THREE.Matrix4(),q=new THREE.Quaternion(),e=new THREE.Euler(),p=new THREE.Vector3(),sc=new THREE.Vector3();
  let na=0,nb=0;
  for(let i=0;i<N;i++)for(const side of [-1,1]){
    if(i>=176&&i<=240)continue;                     /* the market is open to the road */
    for(let r=0;r<2;r++){
      const o=side*(HW+4.3+(r?0:.4)),x=sx[i]+rx[i]*o+fx[i]*r*.8,z=sz[i]+rz[i]*o+fz[i]*r*.8;
      if(nearAlt(x,z,2.4))continue;
      const h=hash2(i*1.7+r,side);
      p.set(x,meshY(x,z)+.35+r*.62,z);e.set(h*3,h*7,h*5);q.setFromEuler(e);
      const s=.8+h*.55;sc.set(s,s*.85,s);m4.compose(p,q,sc);
      if(h>.5)a.setMatrixAt(na++,m4);else b.setMatrixAt(nb++,m4);
    }
  }
  a.count=na;b.count=nb;a.instanceMatrix.needsUpdate=b.instanceMatrix.needsUpdate=true;world.add(a);world.add(b);
};

STAGES.push({ id:'kivik', group:'osterlen', name:'KUNGAGRAVEN', sub:'KIVIK',
  order:16, tag:'Marknadsdag vid Kungagraven bland äppelträden. Äpplen rullar över vägen från stånden.',
  view:{r:'kammaren',f:0.1,lat:0,h:4,to:{r:'kammaren',f:0.5,h:6},fov:55},
  hw:8.4,
  bars:[0.6,0.7,0.5], laps:3,
  blurb:'Late summer on the Österlen coast: past the striped stalls of Kivik market, along the sea and up through the orchards to the great Bronze Age cairn. A side passage runs straight through the grave chamber between the carved slabs and out into the next room, and giant apples roll off the market stalls across the road, so watch for one wobbling at the top of its chute.',
  role:'Marknad, äppelodlingar och en gravkammare att köra rakt igenom.',
  sky:[0xf2e8c8,0x4a8ad0], fog:[0xe0dcc2,90,420], amb:0x6c6a5e, dif:0xfff0c8,
  road:'kivik', verge:'gravel', edge:'kivikGard', ground:'kivik', terrain:{size:900,seg:90},
  jumpSpec:[{h:3.6,drop:2.6,up:12,dn:7,rec:18},{h:2.8,drop:2.0,up:10,dn:6,rec:14}],
  ctrl:[[-150,10,-150],[-60,9,-158],[30,8,-156],[100,7,-136],[150,5,-96],[172,4,-36],
        [170,4,24],[158,5,80],[118,7,112],[66,10,120],[32,12,146],[16,13,190],[-32,14,212],[-80,14,194],
        [-104,14,158],[-146,14,134],[-184,14,92],[-165,13,40],[-205,12,-10],[-222,11,-70],[-196,10,-124]],
  /* Hanöbukten lies east, below the coast road; the land climbs gently inland to the west */
  shore:(x,z)=>-30*smooth(0,40,x-206),
  mod:(x,z,t)=>t*(5+14*smooth(150,-260,x)-0.6*rolls(x,z)-sy[nearestGlobal(x,z)]),
  land:(x,z,out)=>{
    if(x>200)return;
    if(kivikOrchard(x,z)&&latAt(x,z)>HW+12){out.setHex((Math.floor(x/5)+Math.floor(z/5))%2?0x6f9a44:0x7aa64a);}
  },
  stations:[[0.17,-1],[0.80,1]],
  routes:[
    {id:'kammaren',name:'GRAVKAMMAREN',a:356,b:494,hw:4.2,side:1,lead:9,leadLat:10,
     mid:[[0.5,2]],surface:'kivikSten',risk:0.35,
     blurb:'Through the cairn on stone slabs, past the carved walls of the grave chamber and out the other side.'}],
  stamps:[
    {id:'kiv1',dish:'Äppelmust',ini:'Ä',kind:'intro',route:'main',i:158,lat:6.2,
     hint:'Vid vägkanten innan backen ner mot marknaden.',
     story:'Kivik is apple country, and in September the presses run day and night. Äppelmust is the sweet, cloudy juice that comes out, pressed from the windfalls and drunk cold out of a glass bottle at the market, with a wasp circling.'},
    {id:'kiv2',dish:'Äppelmos',ini:'Ä',kind:'route',route:'kammaren',f:0.5,lat:0,
     hint:'Djupt inne i gravkammaren, mellan de ristade hällarna.',
     story:'Every Österlen kitchen turns the autumn windfalls into äppelmos: sour cooking apples simmered soft with a little sugar and cinnamon. It goes on pancakes, porridge and pork, and a jar of it has kept many a long winter, which the old chieftain under the cairn would surely have approved of.'},
    {id:'kiv3',dish:'Polkagris',ini:'P',kind:'line',route:'main',i:'tight',lat:'inside',
     hint:'Tätt intill innerkanten, där vägen svänger tvärast.',
     story:'No Swedish market is complete without a polkagris stall: peppermint sugar pulled by hand, twisted with a red stripe and sold in sticks as long as your arm. At Kivik market they are bought by the bag and eaten in the car on the way home.'}],
  hazards:H=>hazardsKivik(H), scenery:()=>sceneryKivik()
});

/** list of {x,y,z,ry,rx,rz,sx,sy,sz,c} as one InstancedMesh */
function kivikInst(geo,mat,list){
  const m=new THREE.InstancedMesh(geo,mat,Math.max(1,list.length));
  const m4=new THREE.Matrix4(),q=new THREE.Quaternion(),e=new THREE.Euler(),p=new THREE.Vector3(),s=new THREE.Vector3(),c=new THREE.Color();
  list.forEach((o,i)=>{
    p.set(o.x,o.y,o.z);e.set(o.rx||0,o.ry||0,o.rz||0);q.setFromEuler(e);
    const k=o.s||1;s.set(o.sx||k,o.sy||k,o.sz||k);m4.compose(p,q,s);m.setMatrixAt(i,m4);
    if(o.c!=null){c.setHex(o.c);m.setColorAt(i,c);}
  });
  m.count=list.length;m.instanceMatrix.needsUpdate=true;world.add(m);return m;
}
/** a mound built over a lane with a roofed corridor through it; returns the covered sample range */
function kivikMound(R,o){
  const S=SEG,jc=o.jc,nL=Math.round(o.L/S),j0=Math.max(2,jc-nL),j1=Math.min(R.n-3,jc+nL);
  const prof=(j,v)=>{const u=(j-jc)*S/o.L,w=v/o.W,f=1-u*u-w*w;return f>0?o.H*Math.pow(f,o.pow):0;};
  const clr=(x,z)=>{const i=nearestGlobal(x,z);return smooth(HW+5,HW+16,Math.abs((x-sx[i])*rx[i]+(z-sz[i])*rz[i]));};
  const vs=[o.cw];for(let v=o.cw+1.4;v<o.W+3;v+=2.4)vs.push(v);
  const pos=[],col=[],top={};
  const tc=new THREE.Color();
  for(const s of [-1,1]){
    const P=[];
    for(let j=j0;j<=j1;j++){
      const row=[];
      vs.forEach((v,vi)=>{
        const x=R.X[j]+R.RX[j]*s*v,z=R.Z[j]+R.RZ[j]*s*v,h=prof(j,v)*clr(x,z);
        const y=vi===0?R.Y[j]-.3+h:meshY(x,z)-.45+h+(h>1?(hash2(Math.round(x*2),Math.round(z*2))-.5)*o.noise:0);
        row.push([x,y,z,h/o.H]);
        if(vi===0)top[s+':'+j]=y;
      });
      P.push(row);
    }
    for(let a=0;a<P.length-1;a++)for(let b=0;b<vs.length-1;b++){
      const A=P[a][b],B=P[a+1][b],C=P[a][b+1],D=P[a+1][b+1];
      for(const T of [[A,B,C],[B,D,C]]){
        const ux=T[1][0]-T[0][0],uy=T[1][1]-T[0][1],uz=T[1][2]-T[0][2],
              wx=T[2][0]-T[0][0],wy=T[2][1]-T[0][1],wz=T[2][2]-T[0][2];
        const ny=uz*wx-ux*wz;
        const tri=ny<0?[T[0],T[2],T[1]]:T;
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
  /* the corridor walls up to the mound's edge, the covered stretch, its roof and the two mouths */
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
    const roof=[];
    for(let j=cA;j<=cB;j++)roof.push({x:R.X[j],y:R.Y[j]+o.roofH+.4,z:R.Z[j],ry:Math.atan2(R.FX[j],R.FZ[j]),sx:2*o.cw+1.8,sy:.8,sz:S*.9});
    kivikInst(flat(new THREE.BoxGeometry(1,1,1)),o.roofMat,roof);
    const fac=[];
    for(const j of [cA,cB]){
      const hT=Math.max(top['-1:'+j],top['1:'+j])-R.Y[j];
      fac.push({x:R.X[j],y:R.Y[j]+(o.roofH+hT)/2+.3,z:R.Z[j],ry:Math.atan2(R.FX[j],R.FZ[j]),sx:2*o.cw+3.4,sy:hT-o.roofH+.8,sz:1.8});
    }
    kivikInst(flat(new THREE.BoxGeometry(1,1,1)),o.roofMat,fac);
  }
  return {j0,j1,cA,cB};
}
/** carved slab: ships, horses, a sun wheel, picked out in ochre on grey granite */
function kivikSlab(kind){
  return pixTex(64,64,g=>{
    g.fillStyle='#7d7a72';g.fillRect(0,0,64,64);
    for(let i=0;i<500;i++){g.fillStyle=Math.random()>.5?'rgba(160,156,146,.5)':'rgba(50,48,44,.45)';
      g.fillRect((Math.random()*64)|0,(Math.random()*64)|0,1,1);}
    g.strokeStyle='#c4703a';g.fillStyle='#c4703a';g.lineWidth=2;
    const ship=(y)=>{g.beginPath();g.moveTo(8,y-6);g.quadraticCurveTo(14,y+4,32,y+4);g.quadraticCurveTo(50,y+4,56,y-6);g.stroke();
      for(let x=18;x<48;x+=5){g.fillRect(x,y-4,2,6);}};
    const horse=(x,y)=>{g.fillRect(x,y,12,4);g.fillRect(x+10,y-5,3,6);g.fillRect(x+11,y-6,5,3);
      g.fillRect(x,y+4,2,6);g.fillRect(x+10,y+4,2,6);g.fillRect(x-3,y,3,2);};
    const wheel=(x,y,r)=>{g.beginPath();g.arc(x,y,r,0,6.283);g.stroke();g.fillRect(x-r,y-1,2*r,2);g.fillRect(x-1,y-r,2,2*r);};
    if(kind===0){ship(18);ship(44);}
    else if(kind===1){horse(10,16);horse(36,16);wheel(20,44,9);wheel(46,44,9);}
    else{wheel(32,20,12);g.beginPath();for(let x=6;x<60;x+=8){g.moveTo(x,44);g.lineTo(x+4,36);g.lineTo(x+8,44);}g.stroke();
      ship(56);}
    g.strokeStyle='#4a4842';g.lineWidth=2;g.strokeRect(1,1,62,62);
  });
}
function sceneryKivik(){
  const box=flat(new THREE.BoxGeometry(1,1,1));
  const at=(i,o,up)=>{i=((i%N)+N)%N;const x=sx[i]+rx[i]*o,z=sz[i]+rz[i]*o;return {x,y:meshY(x,z)+(up||0),z,ry:Math.atan2(fx[i],fz[i])};};
  /* ── Hanöbukten ── */
  const sea=new THREE.Mesh(new THREE.PlaneGeometry(700,1400).rotateX(-Math.PI/2),psMat({color:0x3b7db2,unlit:true}));
  sea.position.set(560,-3,0);world.add(sea);
  /* Stenshuvud: the wooded headland down the coast */
  const sh=new THREE.Mesh(flat(new THREE.IcosahedronGeometry(1,1)),psMat({color:0x3e6a34}));
  sh.scale.set(120,46,90);sh.position.set(330,-6,360);world.add(sh);
  const sh2=new THREE.Mesh(flat(new THREE.IcosahedronGeometry(1,1)),psMat({color:0x8c8a7c}));
  sh2.scale.set(60,30,50);sh2.position.set(250,-8,330);world.add(sh2);
  /* sailing boats out on the bay */
  const hullL=[],sailL=[];
  for(const [x,z,yw] of [[300,-120,.4],[380,40,2.1],[290,170,1.2],[460,-260,.9]]){
    hullL.push({x,y:-2.6,z,ry:yw,sx:2.2,sy:1,sz:6.5});
    sailL.push({x,y:2.4,z,ry:yw,sx:.15,sy:7,sz:3.6});
  }
  kivikInst(box,psMat({color:0x8b2b1c}),hullL);kivikInst(box,psMat({color:0xf4f0e2}),sailL);
  /* the harbour: a stone pier and fishing boats, by the ramp */
  {const i=262,p=at(i,-(HW+30));
    const pier=new THREE.Mesh(box,psMat({color:0x8f8b82}));pier.scale.set(7,2.2,60);
    const yaw=Math.atan2(fx[i],fz[i])+Math.PI/2;
    pier.position.set(sx[i]+rx[i]*-(HW+38),-2.2,sz[i]+rz[i]*-(HW+38));pier.rotation.y=yaw;world.add(pier);
    const fb=[];for(let n=0;n<3;n++){const o=-(HW+30+n*12);
      fb.push({x:sx[i+6]+rx[i+6]*o,y:-2.4,z:sz[i+6]+rz[i+6]*o,ry:yaw+.2,sx:2.4,sy:1.4,sz:7,c:[0x2a5fa8,0xf2f0ea,0x3f7a3a][n]});}
    kivikInst(box,psMat({color:0xffffff}),fb);
    const hut=house(8,6,3,0x8b2b1c,0x2e2a26,2.4);hut.position.set(p.x,Math.max(p.y,1),p.z);hut.rotation.y=p.ry;world.add(hut);
  }
  /* ── the cairn: Kungagraven, a low round mound of grey stones over the passage ── */
  const R=ALTS.find(r=>r.id==='kammaren');
  if(R){
    const jc=Math.round(R.n*0.5);
    const stoneW=psMat({color:0x6f6c66,side:THREE.DoubleSide}),roofM=psMat({color:0x5e5b55});
    const M=kivikMound(R,{jc,L:38,W:36,H:11.5,pow:0.6,roofH:7.0,cw:R.hw+1.5,noise:1.1,
      wallMat:stoneW,coverMat:psMat({color:0x8a877f,side:THREE.DoubleSide}),roofMat:roofM,
      col:(c,h,f)=>{const v=.47+h*.16;c.setRGB(v,v*.98,v*.93);if(h>.88)c.setRGB(.55,.58,.4);if(f<.05)c.setRGB(.5,.55,.36);}});
    /* stone slabs on the floor, darker under the roof */
    const slab=pixTex(32,32,g=>{g.fillStyle='#6a665e';g.fillRect(0,0,32,32);
      for(let i=0;i<200;i++){g.fillStyle=Math.random()>.5?'#7e7a70':'#55524b';g.fillRect((Math.random()*32)|0,(Math.random()*32)|0,1,1);}
      g.fillStyle='#3a3833';g.fillRect(0,0,32,1);g.fillRect(0,16,32,1);g.fillRect(15,0,1,16);g.fillRect(7,16,1,16);g.fillRect(25,16,1,16);});
    slab.wrapS=slab.wrapT=THREE.RepeatWrapping;
    const sm=psMat({map:slab});sm.polygonOffset=true;sm.polygonOffsetFactor=-4;sm.polygonOffsetUnits=-4;
    world.add(new THREE.Mesh(altRibbon(R,-R.hw-.6,R.hw+.6,.07,5,COMMIT,R.n-1-MERGE),sm));
    if(M.cA>=0){
      /* inside: carved slabs on both walls, the grave chamber in the middle */
      const slabs=[kivikSlab(0),kivikSlab(1),kivikSlab(2)].map(t=>psMat({map:t,side:THREE.DoubleSide}));
      const plain=psMat({color:0x5f5c56,side:THREE.DoubleSide});
      const pg=new THREE.PlaneGeometry(1,1);
      for(let j=M.cA+1;j<M.cB;j+=2)for(const s of [-1,1]){
        const mid=Math.abs(j-jc)<9;
        const m=new THREE.Mesh(pg,mid?slabs[(j+(s>0?1:0))%3]:plain);
        const l=s*(R.hw+1.3);
        m.scale.set(SEG*2-.2,mid?5.2:6.4,1);
        m.position.set(R.X[j]+R.RX[j]*l,R.Y[j]+(mid?2.9:3.2),R.Z[j]+R.RZ[j]*l);
        m.rotation.y=Math.atan2(R.FX[j],R.FZ[j])+Math.PI/2;world.add(m);
      }
      /* oil lamps hung from the roof, so the chamber reads at speed */
      const lamps=[];
      for(let j=M.cA+3;j<M.cB-1;j+=6)for(const s of [-1,1])
        lamps.push({x:R.X[j]+R.RX[j]*s*(R.hw+1.1),y:R.Y[j]+5.9,z:R.Z[j]+R.RZ[j]*s*(R.hw+1.1),sx:.35,sy:.5,sz:.35});
      kivikInst(box,psMat({color:0xffc35a,unlit:true}),lamps);
      /* tall portal stones at both mouths */
      const ps=[];
      for(const j of [M.cA,M.cB])for(const s of [-1,1]){
        const l=s*(R.hw+2.4);ps.push({x:R.X[j]+R.RX[j]*l,y:R.Y[j]+4,z:R.Z[j]+R.RZ[j]*l,ry:Math.atan2(R.FX[j],R.FZ[j]),sx:1.8,sy:8.6,sz:2.2});
      }
      kivikInst(box,roofM,ps);
      /* KUNGAGRAVEN carved over the way in */
      const sign=pixTex(128,24,g=>{g.fillStyle='#4a3a2a';g.fillRect(0,0,128,24);
        g.fillStyle='#f4e2b0';g.font='10px "Press Start 2P",monospace';g.textAlign='center';g.textBaseline='middle';g.fillText('KUNGAGRAVEN',64,13);});
      const j=M.cA,pl=new THREE.Mesh(new THREE.PlaneGeometry(10,1.9),psMat({map:sign,unlit:true}));
      pl.position.set(R.X[j]-R.FX[j]*1.5,R.Y[j]+8.3,R.Z[j]-R.FZ[j]*1.5);pl.rotation.y=Math.atan2(R.FX[j],R.FZ[j])+Math.PI;world.add(pl);
    }
    /* a kerb of upright stones round the foot of the mound */
    const kerb=[],cx=R.X[jc],cz=R.Z[jc];
    for(let a=0;a<64;a++){
      const ang=a/64*6.283,x=cx+Math.sin(ang)*37,z=cz+Math.cos(ang)*37;
      if(latAt(x,z)<HW+3)continue;
      kerb.push({x,y:meshY(x,z)+.6,z,ry:ang,sx:1.6,sy:1.6+hash2(a,1)*.8,sz:.9});
    }
    kivikInst(box,psMat({color:0x8d8a82}),kerb);
  }
  /* ── Kiviks marknad: striped stalls on the slope above the coast road ── */
  const stripe=(a,b)=>{const t=pixTex(16,16,g=>{for(let i=0;i<4;i++){g.fillStyle=i%2?a:b;g.fillRect(i*4,0,4,16);}});return psMat({map:t,side:THREE.DoubleSide});};
  const aw=[stripe('#c8281c','#f4ecd8'),stripe('#2f7a3a','#f4ecd8'),stripe('#2a5fa8','#f4ecd8'),stripe('#e8bf3c','#c8281c')];
  const wood=psMat({color:0x7a6047}),counter=[],posts=[],crates=[],appl=[],people=[],heads=[];
  const stall=(i,o,k)=>{
    const p=at(i,o),yaw=p.ry,cx=Math.cos(yaw),sz_=Math.sin(yaw);
    const L=(dl,df,up)=>({x:p.x+rx[i]*dl+fx[i]*df,y:p.y+up,z:p.z+rz[i]*dl+fz[i]*df});
    const side=Math.sign(o);
    counter.push(Object.assign(L(-side*1,0,.6),{ry:yaw,sx:2.2,sy:1.2,sz:4.4}));
    for(const df of [-2.1,2.1])for(const dl of [-1.9,1.6])posts.push(Object.assign(L(-side*dl,df,1.6),{sx:.18,sy:3.2,sz:.18}));
    const ag=new THREE.Group(),a=new THREE.Mesh(box,aw[k%4]);a.scale.set(4.8,.14,5);a.rotation.z=-side*0.3;ag.add(a);
    const c=L(0,0,3.4);ag.position.set(c.x,c.y,c.z);ag.rotation.y=yaw;world.add(ag);
    for(let n=0;n<3;n++){const q=L(-side*1,(n-1)*1.3,1.35);crates.push(Object.assign(q,{ry:yaw,sx:1,sy:.5,sz:1.1}));
      appl.push(Object.assign(L(-side*1,(n-1)*1.3,1.65),{ry:yaw,sx:.9,sy:.18,sz:1,c:n%2?0xc8281c:0x8fb33a}));}
    for(let n=0;n<2;n++){const q=L(side*(2.2+hash2(i,n)*2),(n-.5)*2.4,0);
      const col=[0xc8281c,0x2a5fa8,0xe8bf3c,0x2f7a3a,0xf4f0e2,0x6a3a8a][Math.floor(hash2(i+n,o)*6)];
      people.push(Object.assign({},q,{y:q.y+.85,ry:yaw+side*1.57,sx:.62,sy:1.7,sz:.4,c:col}));
      heads.push(Object.assign({},q,{y:q.y+1.95,sx:.42,sy:.42,sz:.42}));}
  };
  let k=0;
  for(let i=180;i<=238;i+=6){
    if(KIVIK_CHUTES.some(c=>Math.abs(i-c)<3))continue;
    stall(i,HW+9.5,k++);
    if(i%12===0)stall(i+3,-(HW+9),k++);
  }
  for(let i=184;i<=236;i+=13)stall(i,HW+21,k++);              /* a second row further up */
  kivikInst(box,wood,counter);kivikInst(box,wood,posts);
  kivikInst(box,psMat({color:0x9a7a4a}),crates);kivikInst(box,psMat({color:0xffffff}),appl);
  /* market-goers by the stalls and round the cairn */
  for(let n=0;n<70;n++){
    const i=Math.round(rand(150,250)),o=(hash2(n,3)>.35?1:-1)*(HW+rand(6,26)),q=at(i,o);
    if(latAt(q.x,q.z)<HW+4.5)continue;
    people.push({x:q.x,y:q.y+.85,z:q.z,ry:rand(0,6),sx:.62,sy:1.7,sz:.4,c:[0xc8281c,0x2a5fa8,0xe8bf3c,0x2f7a3a,0xf4f0e2,0x6a3a8a,0x4a4a4a][n%7]});
    heads.push({x:q.x,y:q.y+1.95,z:q.z,s:.42});
  }
  kivikInst(box,psMat({color:0xffffff}),people);kivikInst(box,psMat({color:0xe8b890}),heads);
  /* bunting strung over the road on tall poles */
  const pennant=new THREE.BufferGeometry();
  pennant.setAttribute('position',new THREE.Float32BufferAttribute([-.45,0,0, .45,0,0, 0,-1.0,0],3));pennant.computeVertexNormals();
  const flags=[],poles=[];
  for(const i of [186,204,222,240]){
    const a=at(i,HW+5),b=at(i,-(HW+5));
    poles.push({x:a.x,y:a.y+4.5,z:a.z,sx:.25,sy:9,sz:.25},{x:b.x,y:b.y+4.5,z:b.z,sx:.25,sy:9,sz:.25});
    for(let n=0;n<=16;n++){
      const t=n/16,sag=Math.sin(Math.PI*t)*1.4,x=lerp(a.x,b.x,t),z=lerp(a.z,b.z,t),y=lerp(a.y,b.y,t)+8.8-sag;
      flags.push({x,y,z,ry:Math.atan2(fx[i],fz[i])+Math.PI/2,c:[0xc8281c,0xe8bf3c,0x2a5fa8,0xf4f0e2,0x2f7a3a][n%5]});
    }
  }
  kivikInst(box,wood,poles);kivikInst(pennant,psMat({color:0xffffff,side:THREE.DoubleSide}),flags);
  /* the fairground: a carousel and a striped tent behind the stalls */
  {const p=at(212,HW+44);
    const car=new THREE.Group();car.position.set(p.x,p.y,p.z);world.add(car);
    const base=new THREE.Mesh(flat(new THREE.CylinderGeometry(7,7.4,1,12)),psMat({color:0xe8bf3c}));base.position.y=.5;car.add(base);
    const pole=new THREE.Mesh(flat(new THREE.CylinderGeometry(.5,.5,7,6)),psMat({color:0xf4ecd8}));pole.position.y=4;car.add(pole);
    const rt=pixTex(32,8,g=>{for(let i=0;i<8;i++){g.fillStyle=i%2?'#c8281c':'#f4ecd8';g.fillRect(i*4,0,4,8);}});
    const roof=new THREE.Mesh(flat(new THREE.ConeGeometry(8,3.4,12)),psMat({map:rt}));roof.position.y=8.6;car.add(roof);
    const spin=new THREE.Group();car.add(spin);
    for(let n=0;n<8;n++){const a=n/8*6.283,hx=Math.sin(a)*5.4,hz=Math.cos(a)*5.4;
      const st=new THREE.Mesh(box,psMat({color:0xd8d2c4}));st.scale.set(.15,6,.15);st.position.set(hx,4,hz);spin.add(st);
      const h=new THREE.Mesh(box,psMat({color:[0xf4f0e2,0x6a3a20,0x2a2622,0xc8281c][n%4]}));h.scale.set(.7,1.1,2);
      h.position.set(hx,2.4+(n%2)*.6,hz);h.rotation.y=a+Math.PI/2;spin.add(h);}
    KIVIK_ANIM.carousel=spin;
    const tp=at(196,HW+46),tent=new THREE.Group();tent.position.set(tp.x,tp.y,tp.z);world.add(tent);
    const tw=new THREE.Mesh(flat(new THREE.CylinderGeometry(9,9,4,12)),psMat({map:rt}));tw.position.y=2;tent.add(tw);
    const tr=new THREE.Mesh(flat(new THREE.ConeGeometry(10,6,12)),psMat({color:0xc8281c}));tr.position.y=7;tent.add(tr);
    const fl=new THREE.Mesh(box,psMat({color:0xe8bf3c}));fl.scale.set(.1,1.2,2);fl.position.set(0,10.6,1);tent.add(fl);
  }
  /* ── orchards on the slopes: rows of apple trees, red with fruit ── */
  const trunks=[],crowns=[],fruit=[];
  for(let gx=-330;gx<=190;gx+=10)for(let gz=-320;gz<=320;gz+=9){
    if(trunks.length>=1300)break;
    const x=gx+hash2(gx,gz)*1.4,z=gz+hash2(gz,gx)*1.4;
    if(!kivikOrchard(x,z))continue;
    if(latAt(x,z)<HW+14)continue;
    if(R&&Math.hypot(x-R.X[Math.round(R.n/2)],z-R.Z[Math.round(R.n/2)])<46)continue;
    const y=meshY(x,z),s=.85+hash2(x,z)*.35,yaw=hash2(z,x)*6;
    trunks.push({x,y:y+.9*s,z,ry:yaw,sx:.36*s,sy:1.8*s,sz:.36*s});
    crowns.push({x,y:y+2.9*s,z,ry:yaw,s:2.0*s,c:hash2(x*3,z)>.5?0x4f7a34:0x5d8a3a});
    for(let n=0;n<4;n++){const a=n*1.57+yaw;fruit.push({x:x+Math.sin(a)*1.75*s,y:y+(2.6+(n%2)*.8)*s,z:z+Math.cos(a)*1.75*s,s:.38});}
  }
  kivikInst(box,psMat({color:0x5a4430}),trunks);
  kivikInst(flat(new THREE.IcosahedronGeometry(1,0)),psMat({color:0xffffff}),crowns);
  kivikInst(box,psMat({color:0xd0281c}),fruit);
  /* white Österlen farmhouses with thatch-brown roofs among the orchards */
  for(const [i,o] of [[30,-34],[100,-40],[300,38],[540,-36],[620,40],[690,-30]]){
    const p=at(i,o);if(latAt(p.x,p.z)<HW+14)continue;
    const h=house(13,7,3.4,0xeeeae0,0x7a6a48,3.4);h.position.set(p.x,p.y-.2,p.z);h.rotation.y=p.ry;world.add(h);
  }
}
const KIVIK_CHUTES=[192,208,224], KIVIK_ANIM={carousel:null};
/** giant apples wobble at the top of a chute behind a stall, then roll across the road toward the sea */
function hazardsKivik(H){
  const box=flat(new THREE.BoxGeometry(1,1,1));
  const wood=psMat({color:0x8a6a44}),red=psMat({color:0xd02a1c}),stem=psMat({color:0x4a3220}),leaf=psMat({color:0x5a9a34});
  const top=HW+15,bot=HW+3.4,lift=4.2,far=-(HW+9);
  KIVIK_CHUTES.forEach((ic,n)=>{
    /* the chute: a plank ramp from the stall platform down to the road edge, and a basket over the road */
    const A=mainPt(ic,top),B=mainPt(ic,bot),yA=meshY(A.x,A.z)+lift,yB=B.y+.25;
    const len=Math.hypot(top-bot,yA-yB);
    const ch=new THREE.Group();
    const pl=new THREE.Mesh(box,wood);pl.scale.set(len,.25,3.4);ch.add(pl);
    for(const s of [-1,1]){const r=new THREE.Mesh(box,wood);r.scale.set(len,.6,.2);r.position.set(0,.4,s*1.7);ch.add(r);}
    ch.position.set((A.x+B.x)/2,(yA+yB)/2-.1,(A.z+B.z)/2);
    ch.rotation.order='YXZ';ch.rotation.y=A.yaw;ch.rotation.z=-Math.atan2(yA-yB,top-bot);world.add(ch);
    const plat=new THREE.Mesh(box,wood);plat.scale.set(4,lift,4);
    const P=mainPt(ic,top+1.6);plat.position.set(P.x,meshY(P.x,P.z)+lift/2-.15,P.z);plat.rotation.y=A.yaw;world.add(plat);
    const sign=pixTex(64,16,g=>{g.fillStyle='#c8281c';g.fillRect(0,0,64,16);g.fillStyle='#f4ecd8';
      g.font='8px "Press Start 2P",monospace';g.textAlign='center';g.textBaseline='middle';g.fillText('ÄPPLEN',32,9);});
    const sp=new THREE.Mesh(new THREE.PlaneGeometry(4,1),psMat({map:sign,unlit:true,side:THREE.DoubleSide}));
    sp.position.set(P.x,meshY(P.x,P.z)+lift+3.4,P.z);sp.rotation.y=A.yaw+Math.PI/2;world.add(sp);
    for(const s of [-1,1]){const po=new THREE.Mesh(box,wood);po.scale.set(.2,3.6,.2);
      po.position.set(P.x+fx[ic]*s*2,meshY(P.x,P.z)+lift+1.6,P.z+fz[ic]*s*2);world.add(po);}
    const C=mainPt(ic,far),bk=new THREE.Mesh(flat(new THREE.CylinderGeometry(2.6,2.0,2.2,8,1,true)),psMat({color:0xa8834a,side:THREE.DoubleSide}));
    const yC=meshY(C.x,C.z);bk.position.set(C.x,yC+1.0,C.z);world.add(bk);
    /* the apple: comically big, with a stem and a leaf */
    const g=new THREE.Group();
    const ball=new THREE.Mesh(flat(new THREE.SphereGeometry(1.45,8,6)),red);g.add(ball);
    const st=new THREE.Mesh(box,stem);st.scale.set(.2,.8,.2);st.position.y=1.65;g.add(st);
    const lf=new THREE.Mesh(box,leaf);lf.scale.set(.9,.08,.5);lf.position.set(.45,1.75,0);lf.rotation.z=.4;g.add(lf);
    world.add(g);
    H.push({id:'apple'+n,period:7.2,phase:n*2.4,mesh:g,
      update(u){
        let l=top,y=yA+1.45,roll=0,sc=1,vis=true,wob=0;
        if(u<0.08){sc=Math.max(.05,u/0.08);}
        else if(u<0.30){wob=1;}
        else if(u<0.42){const s=smooth(0.30,0.42,u);l=lerp(top,bot,s);y=lerp(yA,yB,s)+1.45;}
        else if(u<0.62){const s=(u-0.42)/0.20;l=lerp(bot,-(HW+4),s);y=mainPt(ic,l).y+1.45;}
        else if(u<0.70){const s=(u-0.62)/0.08;l=lerp(-(HW+4),far,s);y=lerp(mainPt(ic,-(HW+4)).y,yC,s)+1.45+Math.sin(Math.PI*s)*3;}
        else if(u<0.74){l=far;y=yC+1.45-smooth(0.70,0.74,u)*2.6;}
        else vis=false;
        const q=mainPt(ic,l);g.visible=vis;
        g.position.set(q.x,y+(wob?Math.abs(Math.sin(clock*9))*.35:0),q.z);g.scale.setScalar(sc);
        g.rotation.set(0,q.yaw,wob?Math.sin(clock*22)*.22:-(l-top)/1.45);
        this.p=(u>0.40&&u<0.63)?{x:q.x,y:mainPt(ic,l).y,z:q.z}:null;
        /* a creak and a knock as it starts to wobble, if you are near enough to care */
        const w=u>0.08&&u<0.30;
        if(w&&!this.w&&state==='race'&&player&&Math.hypot(player.x-q.x,player.z-q.z)<90){ping(240,520,.09);setTimeout(()=>ping(520,240,.09),180);}
        this.w=w;
        if(n===0&&KIVIK_ANIM.carousel)KIVIK_ANIM.carousel.rotation.y=clock*.9;
      },
      hit(k){return !k.rib&&this.p&&near3(k,this.p.x,this.p.y,this.p.z,2.6);},
      effect(k){k.spun=Math.max(k.spun,0.9*k.spinResist);k.boost=0;k.drift=0;k.charge=0;
        for(let p=0;p<10;p++)puff(k.x+rand(-1,1),k.y+rand(.4,1.8),k.z+rand(-1,1),.95,.85,.55,.6);
        if(k===player){toast('ÄPPLE!');ping(300,90,.22);shake=Math.min(1,shake+.5);}}});
  });
  /* inside the cairn the light drops away, then comes back at the far mouth */
  const R=ALTS.find(r=>r.id==='kammaren');
  if(R){
    const jc=Math.round(R.n*0.5),half=Math.round(24/SEG);let f=1;
    const A=new THREE.Color(stage.amb),D=new THREE.Color(stage.dif);
    H.push({id:'kammarljus',period:1,phase:0,update(u,dt){
      const inside=state==='race'&&player&&player.rib===R.idx&&Math.abs(player.si-jc)<half;
      const want=inside?.5:1,nf=lerp(f,want,Math.min(1,(dt||.016)*4));
      if(Math.abs(nf-f)<1e-4&&f===want)return;
      f=Math.abs(nf-want)<.01?want:nf;
      U.amb.value.copy(A).multiplyScalar(f);U.dif.value.copy(D).multiplyScalar(f);}});
  }
}
