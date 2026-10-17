"use strict";
/* ───────── roadside fence ───────── */
function fenceVeberod(){
  const step=6,gaps=Math.floor(N/step);
  const postG=flat(new THREE.BoxGeometry(.22,1.6,.22));
  const railG=flat(new THREE.BoxGeometry(.1,.2,SEG*step+.3));
  const wood=psMat({color:0x6b5540});
  const posts=new THREE.InstancedMesh(postG,wood,gaps*2);
  const rails=new THREE.InstancedMesh(railG,psMat({color:0x8a7259}),gaps*4);
  const m4=new THREE.Matrix4(),q=new THREE.Quaternion(),e=new THREE.Euler(),
        p=new THREE.Vector3(),s=new THREE.Vector3(1,1,1);
  let a=0,b=0;
  for(let i=0;i<N;i+=step){
    const j=(i+Math.floor(step/2))%N;
    for(const side of [-1,1]){
      const o=side*(HW+4.3);
      if(nearAlt(sx[i]+rx[i]*o,sz[i]+rz[i]*o,2.6))continue;   /* the gap where a lane leaves */
      p.set(sx[i]+rx[i]*o,meshY(sx[i]+rx[i]*o,sz[i]+rz[i]*o)+.75,sz[i]+rz[i]*o);
      e.set(0,Math.atan2(fx[i],fz[i]),0);q.setFromEuler(e);
      m4.compose(p,q,s);posts.setMatrixAt(a++,m4);
      for(const hgt of [.55,1.15]){
        p.set(sx[j]+rx[j]*o,meshY(sx[j]+rx[j]*o,sz[j]+rz[j]*o)+hgt,sz[j]+rz[j]*o);
        e.set(0,Math.atan2(fx[j],fz[j]),0);q.setFromEuler(e);
        m4.compose(p,q,s);rails.setMatrixAt(b++,m4);
      }
    }
  }
  posts.count=a;rails.count=b;
  posts.instanceMatrix.needsUpdate=rails.instanceMatrix.needsUpdate=true;
  world.add(posts);world.add(rails);
}

function wallLund(){                       /* low stone wall along the lanes */
  const g=flat(new THREE.BoxGeometry(1.1,1.5,2.4));
  const m=new THREE.InstancedMesh(g,psMat({color:0x9d988d}),Math.ceil(N/2)*2);
  const m4=new THREE.Matrix4(),q=new THREE.Quaternion(),e=new THREE.Euler(),
        p=new THREE.Vector3(),sc=new THREE.Vector3();
  let c=0;
  for(let i=0;i<N;i+=2)for(const side of [-1,1]){
    const o=side*(HW+4.3), x=sx[i]+rx[i]*o, z=sz[i]+rz[i]*o;
    p.set(x,meshY(x,z)+.7,z);
    e.set(0,Math.atan2(fx[i],fz[i]),0);q.setFromEuler(e);
    sc.set(1,1+hash2(i,side)*.3,1.05);
    m4.compose(p,q,sc);m.setMatrixAt(c++,m4);
  }
  m.count=c;m.instanceMatrix.needsUpdate=true;world.add(m);
}
function jerseyTollarp(){                  /* concrete barriers and mesh fence */
  const g=flat(new THREE.CylinderGeometry(.9,1.6,1.3,4));
  g.rotateY(Math.PI/4);
  const m=new THREE.InstancedMesh(g,psMat({color:0x9a958c}),Math.ceil(N/3)*2);
  const post=new THREE.InstancedMesh(flat(new THREE.BoxGeometry(.16,3.2,.16)),
    psMat({color:0x5d5f5c}),Math.ceil(N/9)*2);
  const m4=new THREE.Matrix4(),q=new THREE.Quaternion(),e=new THREE.Euler(),
        p=new THREE.Vector3(),sc=new THREE.Vector3(1,1,3.2);
  let c=0,d=0;
  for(let i=0;i<N;i+=3)for(const side of [-1,1]){
    const o=side*(HW+4.3), x=sx[i]+rx[i]*o, z=sz[i]+rz[i]*o, y=meshY(x,z);
    p.set(x,y+.65,z);
    e.set(0,Math.atan2(fx[i],fz[i]),0);q.setFromEuler(e);
    m4.compose(p,q,sc);m.setMatrixAt(c++,m4);
    if(i%9===0){
      const o2=side*(HW+6.4), x2=sx[i]+rx[i]*o2, z2=sz[i]+rz[i]*o2;
      p.set(x2,meshY(x2,z2)+1.6,z2);
      m4.compose(p,q,new THREE.Vector3(1,1,1));post.setMatrixAt(d++,m4);
    }
  }
  m.count=c;post.count=d;
  m.instanceMatrix.needsUpdate=post.instanceMatrix.needsUpdate=true;
  world.add(m);world.add(post);
}
function railBron(){
  const steel=psMat({color:0x9aa2a8,side:THREE.DoubleSide});
  for(const sg of [-1,1]){
    sweep(0,N,sg*(HW+3.9),1.00,sg*(HW+3.9),1.32,steel);
    sweep(0,N,sg*(HW+3.9),0.42,sg*(HW+3.9),0.62,steel);
  }
  const post=new THREE.InstancedMesh(flat(new THREE.BoxGeometry(.2,1.5,.2)),
    psMat({color:0x848c92}),Math.ceil(N/2)*2);
  const m4=new THREE.Matrix4(),q=new THREE.Quaternion(),e=new THREE.Euler(),
        p=new THREE.Vector3(),one=new THREE.Vector3(1,1,1);
  let c=0;
  for(let i=0;i<N;i+=2)for(const sg of [-1,1]){
    const o=sg*(HW+3.9);
    p.set(sx[i]+rx[i]*o, sy[i]+o*bank[i]+.7, sz[i]+rz[i]*o);
    e.set(0,Math.atan2(fx[i],fz[i]),0);q.setFromEuler(e);
    m4.compose(p,q,one);post.setMatrixAt(c++,m4);
  }
  post.count=c;post.instanceMatrix.needsUpdate=true;world.add(post);
}
function buildEdges(st){
  if(EDGES[st.edge])return EDGES[st.edge](st);
  if(st.edge==='rail')return railBron();
  if(st.edge==='wall')wallLund();
  else if(st.edge==='jersey')jerseyTollarp();
  else fenceVeberod();
}
