"use strict";
/* ───────── countryside props ───────── */
const turbines=[];
function sceneryVeberod(){
  const m4=new THREE.Matrix4(),q=new THREE.Quaternion(),e=new THREE.Euler(),
        p=new THREE.Vector3(),s=new THREE.Vector3();

  // spruce
  const SP=300;
  const sprTrunk=new THREE.InstancedMesh(flat(new THREE.CylinderGeometry(.22,.34,2,5)).translate(0,1,0),psMat({color:0x54412f}),SP);
  const sprBody =new THREE.InstancedMesh(flat(new THREE.ConeGeometry(2.2,9,6)).translate(0,6.4,0),psMat({color:0x3a5a30}),SP);
  const cA=new THREE.Color(0.80,0.86,0.78),cB=new THREE.Color(1.18,1.10,1.02);
  // birch
  const BI=150;
  const birTrunk=new THREE.InstancedMesh(flat(new THREE.CylinderGeometry(.2,.26,5,5)).translate(0,2.5,0),psMat({color:0xdfe2da}),BI);
  const birTop  =new THREE.InstancedMesh(flat(new THREE.ConeGeometry(2.4,5,6)).translate(0,7,0),psMat({color:0x87a94b}),BI);
  const bA=new THREE.Color(0.84,0.90,0.80),bB=new THREE.Color(1.14,1.08,1.00);

  let a=0,b=0,guard=0;
  while((a<SP||b<BI)&&guard++<14000){
    const x=rand(-370,370),z=rand(-370,370);
    if(latAt(x,z)<HW+17)continue;
    const cell=hash2(Math.floor(x/74),Math.floor(z/74));
    const wood=cell>0.62;                    // forest only in some parcels
    const birch=hash2(x*0.3,z*0.3)>0.72;
    if(!wood&&Math.random()>0.06)continue;
    const sc=rand(.75,1.45);
    p.set(x,meshY(x,z)-.3,z);
    e.set(0,rand(0,6.283),0);q.setFromEuler(e);
    s.set(sc,sc*rand(.8,1.35),sc);
    m4.compose(p,q,s);
    if(birch&&b<BI){
      birTrunk.setMatrixAt(b,m4);birTop.setMatrixAt(b,m4);
      birTop.setColorAt(b,bA.clone().lerp(bB,Math.random()));b++;
    }else if(a<SP){
      sprTrunk.setMatrixAt(a,m4);sprBody.setMatrixAt(a,m4);
      sprBody.setColorAt(a,cA.clone().lerp(cB,Math.random()));a++;
    }
  }
  sprTrunk.count=sprBody.count=a;birTrunk.count=birTop.count=b;
  [sprTrunk,sprBody,birTrunk,birTop].forEach(m=>{
    m.instanceMatrix.needsUpdate=true;
    if(m.instanceColor)m.instanceColor.needsUpdate=true;
    world.add(m);
  });

  // wrapped hay bales
  const HB=90;
  const baleG=flat(new THREE.CylinderGeometry(1.1,1.1,1.6,8));baleG.rotateZ(Math.PI/2);
  const bale=new THREE.InstancedMesh(baleG,psMat({color:0xe4e6e0}),HB);
  let h=0,g2=0;
  while(h<HB&&g2++<4000){
    const x=rand(-330,330),z=rand(-330,330);
    if(latAt(x,z)<HW+16)continue;
    p.set(x,meshY(x,z)+1.05,z);
    e.set(0,rand(0,6.283),0);q.setFromEuler(e);s.set(1,1,1);
    m4.compose(p,q,s);bale.setMatrixAt(h++,m4);
  }
  bale.count=h;bale.instanceMatrix.needsUpdate=true;world.add(bale);

  // stone walls on a few field edges
  const ST=260;
  const stone=new THREE.InstancedMesh(flat(new THREE.IcosahedronGeometry(1,0)),psMat({color:0x9aa0a0}),ST);
  let st=0,g3=0;
  while(st<ST&&g3++<6000){
    const cx=Math.floor(rand(-4,4))*74, along=rand(-260,260);
    const horiz=Math.random()>.5;
    const x=horiz?along:cx, z=horiz?cx:along;
    if(latAt(x,z)<HW+14)continue;
    const sc=rand(.5,1.0);
    p.set(x+rand(-.7,.7),meshY(x,z)+sc*.4,z+rand(-.7,.7));
    e.set(rand(0,6),rand(0,6),rand(0,6));q.setFromEuler(e);
    s.set(sc,sc*.8,sc);m4.compose(p,q,s);stone.setMatrixAt(st++,m4);
  }
  stone.count=st;stone.instanceMatrix.needsUpdate=true;world.add(stone);

  // farms
  farm(-210, -40, 0.7); farm(180, 150, -2.1); farm(-120, 235, 1.9);
  farm(250, -190, 2.6); farm(40, -250, 0.2);

  // cows
  const cowBody=flat(new THREE.BoxGeometry(2.6,1.5,1.3));
  const cowLeg=flat(new THREE.BoxGeometry(.28,1.1,.28));
  for(let i=0;i<10;i++){
    let x,z,tries=0;
    do{x=rand(-260,260);z=rand(-260,260);tries++;}while(latAt(x,z)<HW+20&&tries<60);
    const g=new THREE.Group();
    const body=new THREE.Mesh(cowBody,psMat({color:Math.random()>.4?0xe6e2da:0x6b4a3a}));
    body.position.y=1.5;g.add(body);
    const head=new THREE.Mesh(flat(new THREE.BoxGeometry(.9,.8,.9)),psMat({color:0x4a382c}));
    head.position.set(1.6,1.45,0);g.add(head);
    for(const dx of [-.9,.9])for(const dz of [-.45,.45]){
      const l=new THREE.Mesh(cowLeg,psMat({color:0x4a382c}));
      l.position.set(dx,.55,dz);g.add(l);
    }
    g.position.set(x,meshY(x,z),z);g.rotation.y=rand(0,6.283);
    g.scale.setScalar(.85);world.add(g);
  }

  // moose warning sign
  const mooseTex=pixTex(32,32,(g)=>{
    g.clearRect(0,0,32,32);
    g.fillStyle='#c8281c';g.beginPath();g.moveTo(16,1);g.lineTo(31,29);g.lineTo(1,29);g.closePath();g.fill();
    g.fillStyle='#f0ead8';g.beginPath();g.moveTo(16,6);g.lineTo(27,26);g.lineTo(5,26);g.closePath();g.fill();
    g.fillStyle='#15171a';
    g.fillRect(12,17,9,5); g.fillRect(19,14,4,4); g.fillRect(22,15,2,2);
    g.fillRect(12,22,2,4); g.fillRect(19,22,2,4);
    g.fillRect(18,11,1,3); g.fillRect(16,10,2,1); g.fillRect(22,11,1,3); g.fillRect(23,10,2,1);
  });
  const signMat=psMat({map:mooseTex,unlit:true,transparent:true,alphaTest:.5,side:THREE.DoubleSide});
  for(const idx of [96,318,540]){
    const o=HW+6.5;
    const px=sx[idx]+rx[idx]*o, pz=sz[idx]+rz[idx]*o, gy=meshY(px,pz);
    const post=new THREE.Mesh(flat(new THREE.CylinderGeometry(.1,.1,3,5)),psMat({color:0x8d949a}));
    post.position.set(px,gy+1.5,pz);world.add(post);
    const pl=new THREE.Mesh(new THREE.PlaneGeometry(2,2),signMat);
    pl.position.set(px,gy+3.4,pz);
    pl.rotation.y=Math.atan2(fx[idx],fz[idx])+Math.PI/2;world.add(pl);
  }

  // wind turbines on the horizon
  for(let i=0;i<7;i++){
    const ang=rand(0,6.283),d=rand(215,330);
    const x=Math.cos(ang)*d,z=Math.sin(ang)*d;
    if(latAt(x,z)<HW+40)continue;
    const g=new THREE.Group();
    const H=rand(38,52);
    const tow=new THREE.Mesh(flat(new THREE.CylinderGeometry(.8,1.8,H,6)),psMat({color:0xe4e7e6}));
    tow.position.y=H/2;g.add(tow);
    const nac=new THREE.Mesh(flat(new THREE.BoxGeometry(1.6,1.6,4.4)),psMat({color:0xdadedd}));
    nac.position.y=H;g.add(nac);
    const rot=new THREE.Group();rot.position.set(0,H,2.4);
    const bl=flat(new THREE.BoxGeometry(.9,H*0.62,.25));
    for(let k=0;k<3;k++){
      const b2=new THREE.Mesh(bl,psMat({color:0xeef1f0}));
      b2.position.y=H*0.31;
      const holder=new THREE.Group();holder.rotation.z=k*2.0944;holder.add(b2);
      rot.add(holder);
    }
    g.add(rot);turbines.push({rot,speed:rand(.28,.5)});
    g.position.set(x,meshY(x,z),z);g.rotation.y=rand(0,6.283);
    world.add(g);
  }

  // dark tree line at the fog edge
  const TL=120;
  const line=new THREE.InstancedMesh(flat(new THREE.ConeGeometry(1,1,5)),psMat({color:0x46604a}),TL);
  for(let i=0;i<TL;i++){
    const ang=(i/TL)*6.283+rand(-.02,.02),d=rand(330,375);
    const x=Math.cos(ang)*d,z=Math.sin(ang)*d;
    const hh=rand(16,30),w=rand(12,26);
    p.set(x,meshY(x,z)+hh*.42,z);e.set(0,rand(0,6.283),0);q.setFromEuler(e);
    s.set(w,hh,w);m4.compose(p,q,s);line.setMatrixAt(i,m4);
  }
  line.instanceMatrix.needsUpdate=true;world.add(line);
}
