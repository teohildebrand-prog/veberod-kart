"use strict";
/* ───────── Lund ───────── */
function streetRow(step,off,pal,roofs,hmin,hmax){
  for(let i=0;i<N;i+=step)for(const side of [-1,1]){
    if(hash2(i,side)>0.80)continue;                     /* gaps and side streets */
    const o=side*(off+hash2(i+3,side)*3.5);
    const x=sx[i]+rx[i]*o, z=sz[i]+rz[i]*o;
    const g=house(6+hash2(i*2,side)*7, 7+hash2(i,side*3)*5,
      hmin+hash2(i*5,side)*(hmax-hmin),
      pal[Math.floor(hash2(i*7,side)*pal.length)%pal.length],
      roofs[Math.floor(hash2(i*11,side)*roofs.length)%roofs.length], 2.8);
    g.position.set(x,meshY(x,z)-.2,z);
    g.rotation.y=Math.atan2(fx[i],fz[i])+(side>0?Math.PI/2:-Math.PI/2);
    world.add(g);
  }
}
function sceneryLund(){
  streetRow(11,HW+11,[0xd9c9a8,0xc98b62,0xb8a78c,0xe0d6c2,0x9a5f4a,0xcfc0a4],
                     [0x7d4030,0x45484d,0x6b3b2a],6,13);
  /* domkyrkan: sandstone nave with twin towers */
  const ch=new THREE.Group();
  const stone=psMat({color:0xcfc3a6}), roof=psMat({color:0x4a4d50});
  const bx=(w,h,d,m,x,y,z)=>{const e=new THREE.Mesh(flat(new THREE.BoxGeometry(w,h,d)),m);
    e.position.set(x,y,z);ch.add(e);return e;};
  bx(16,13,34,stone,0,6.5,0);
  const nr=gableRoof(17,35,5,0x4a4d50);nr.position.y=13;ch.add(nr);
  for(const sgn of [-1,1]){
    bx(9,30,9,stone,sgn*6.5,15,-20);
    const sp=new THREE.Mesh(flat(new THREE.ConeGeometry(6.4,11,4)),roof);
    sp.position.set(sgn*6.5,35.5,-20);sp.rotation.y=Math.PI/4;ch.add(sp);
    bx(1.6,3.0,1.6,psMat({color:0xe8dcc0}),sgn*6.5,31.5,-24.6);
  }
  bx(11,10,8,stone,0,5,19).rotation.y=Math.PI/4;
  const cp=new THREE.Vector3(sx[120]+rx[120]*(HW+46),0,sz[120]+rz[120]*(HW+46));
  ch.position.set(cp.x,meshY(cp.x,cp.z),cp.z);
  ch.rotation.y=Math.atan2(fx[120],fz[120])+0.5;world.add(ch);
  /* gas lamps and park lindens */
  const lamp=new THREE.InstancedMesh(flat(new THREE.CylinderGeometry(.13,.2,4.6,5)),
    psMat({color:0x2f3338}),Math.ceil(N/14)*2);
  const glo=new THREE.InstancedMesh(flat(new THREE.BoxGeometry(.6,.8,.6)),
    psMat({color:0xffe9a8,unlit:true}),Math.ceil(N/14)*2);
  const m4=new THREE.Matrix4(),q=new THREE.Quaternion(),e=new THREE.Euler(),
        p=new THREE.Vector3(),one=new THREE.Vector3(1,1,1);
  let c=0;
  for(let i=0;i<N;i+=14)for(const side of [-1,1]){
    const o=side*(HW+5.6), x=sx[i]+rx[i]*o, z=sz[i]+rz[i]*o, y=meshY(x,z);
    e.set(0,Math.atan2(fx[i],fz[i]),0);q.setFromEuler(e);
    p.set(x,y+2.3,z);m4.compose(p,q,one);lamp.setMatrixAt(c,m4);
    p.set(x,y+4.9,z);m4.compose(p,q,one);glo.setMatrixAt(c,m4);c++;
  }
  lamp.count=glo.count=c;
  lamp.instanceMatrix.needsUpdate=glo.instanceMatrix.needsUpdate=true;
  world.add(lamp);world.add(glo);
  const tr=new THREE.InstancedMesh(flat(new THREE.CylinderGeometry(.3,.45,3,5)).translate(0,1.5,0),
    psMat({color:0x5e4634}),150);
  const cn=new THREE.InstancedMesh(flat(new THREE.SphereGeometry(3,6,5)).translate(0,5.2,0),
    psMat({color:0x6d9a48}),150);
  let t=0,guard=0;
  while(t<150&&guard++<6000){
    const x=rand(-330,330),z=rand(-330,330);
    if(latAt(x,z)<HW+26)continue;
    const sc=rand(.8,1.5);
    p.set(x,meshY(x,z)-.2,z);e.set(0,rand(0,6.283),0);q.setFromEuler(e);
    m4.compose(p,q,new THREE.Vector3(sc,sc*rand(.9,1.3),sc));
    tr.setMatrixAt(t,m4);cn.setMatrixAt(t,m4);t++;
  }
  tr.count=cn.count=t;
  tr.instanceMatrix.needsUpdate=cn.instanceMatrix.needsUpdate=true;
  world.add(tr);world.add(cn);
}
