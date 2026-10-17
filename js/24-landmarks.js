"use strict";
/* ───────── landmarks ───────── */
function landmarksVeberod(){
  /** quad strip swept along the road between two offset/height pairs */
  function sweep(a,b,o1,h1,o2,h2,mat){
    const M=b-a+1,pos=[],uv=[],idx=[];
    for(let q=0;q<M;q++){
      const i=(a+q+N)%N;
      pos.push(sx[i]+rx[i]*o1, sy[i]+o1*bank[i]+h1, sz[i]+rz[i]*o1);
      pos.push(sx[i]+rx[i]*o2, sy[i]+o2*bank[i]+h2, sz[i]+rz[i]*o2);
      uv.push(0,q*SEG/5, 1,q*SEG/5);
    }
    for(let q=0;q<M-1;q++){const p=2*q;idx.push(p,p+1,p+2, p+1,p+3,p+2);}
    const g=new THREE.BufferGeometry();
    g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));
    g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));
    g.setIndex(idx);g.computeVertexNormals();
    const m=new THREE.Mesh(g,mat);world.add(m);return m;
  }
  const atTrack=(i,o,up)=>{
    const x=sx[i]+rx[i]*o, z=sz[i]+rz[i]*o;
    return new THREE.Vector3(x,meshY(x,z)+(up||0),z);
  };

  /* ── LADAN: a barn you drive straight through ── */
  const A=440,B=478,W=12.2;
  const barnWall=psMat({color:0x8b2b1c,side:THREE.DoubleSide});
  const barnRoof=psMat({color:0x2e3237,side:THREE.DoubleSide});
  sweep(A,B,-W,0,-W,7,barnWall);
  sweep(A,B, W,0, W,7,barnWall);
  sweep(A,B,-W-1.1,6.8,0,10.4,barnRoof);
  sweep(A,B,0,10.4, W+1.1,6.8,barnRoof);
  const ladan=pixTex(128,32,(g)=>{
    g.fillStyle='#2e3237';g.fillRect(0,0,128,32);
    g.fillStyle='#f0e6d2';g.font='16px "Press Start 2P",monospace';
    g.textAlign='center';g.textBaseline='middle';g.fillText('LADAN',64,18);
  });
  for(const e of [{i:A,r:Math.PI},{i:B,r:0}]){
    const p=atTrack(e.i,0,0);
    const pl=new THREE.Mesh(new THREE.PlaneGeometry(9,2.2),psMat({map:ladan,unlit:true}));
    pl.position.set(p.x,sy[e.i]+8.4,p.z);
    pl.rotation.y=Math.atan2(fx[e.i],fz[e.i])+e.r;
    world.add(pl);
  }

  /* ── giant dalahäst at the summit hairpin ── */
  (function dala(){
    const g=new THREE.Group();
    const red=psMat({color:0xb2281d}),gold=psMat({color:0xe8bf3c}),blue=psMat({color:0x2a5fa8});
    const box=(w,h,d,m,x,y,z)=>{const e=new THREE.Mesh(flat(new THREE.BoxGeometry(w,h,d)),m);
      e.position.set(x,y,z);g.add(e);return e;};
    for(const dx of [-.78,.78])for(const dz of [-1.95,1.95])box(.66,4.6,.66,red,dx,2.3,dz);
    box(2.3,2.0,5.6,red,0,5.6,0);
    box(1.5,3.2,1.5,red,0,7.3,2.0).rotation.x=-.34;
    box(1.4,1.2,2.7,red,0,8.9,3.2);
    box(.4,1.6,.5,red,0,9.6,2.2);
    box(.45,2.4,1.5,red,0,6.5,-2.8).rotation.x=.55;
    box(2.4,.4,1.3,gold,0,6.2,-.5);
    box(2.4,.34,1.0,blue,0,5.4,1.0);
    const p=atTrack(154,34,0);
    g.position.copy(p);g.rotation.y=Math.atan2(fx[154],fz[154])+1.9;
    g.scale.setScalar(2.3);world.add(g);
  })();

  /* ── väderkvarn ── */
  (function mill(){
    const g=new THREE.Group();
    const tw=new THREE.Mesh(flat(new THREE.CylinderGeometry(2.4,3.8,13,8)),psMat({color:0x6d5741}));
    tw.position.y=6.5;g.add(tw);
    const cap=new THREE.Mesh(flat(new THREE.ConeGeometry(3.4,3,8)),psMat({color:0x33373b}));
    cap.position.y=14.5;g.add(cap);
    const rot=new THREE.Group();rot.position.set(0,13,3.4);
    const sail=flat(new THREE.BoxGeometry(1.5,10,.3));
    for(let k=0;k<4;k++){
      const b=new THREE.Mesh(sail,psMat({color:0xd9cdb4}));
      b.position.y=5.4;
      const h=new THREE.Group();h.rotation.z=k*1.5708;h.add(b);rot.add(h);
    }
    g.add(rot);turbines.push({rot,speed:.42});
    const p=atTrack(248,-46,0);
    g.position.copy(p);g.rotation.y=Math.atan2(fx[248],fz[248])+.6;world.add(g);
  })();

  /* ── giant milk carton ── */
  (function carton(){
    const m=new THREE.Mesh(flat(new THREE.TetrahedronGeometry(9,0)),psMat({map:milkTex}));
    const p=atTrack(64,40,7.4);
    m.position.copy(p);m.rotation.set(.32,.7,0);world.add(m);
    const post=new THREE.Mesh(flat(new THREE.CylinderGeometry(.5,.7,7,6)),psMat({color:0x8d949a}));
    post.position.set(p.x,p.y-5.2,p.z);world.add(post);
  })();

  /* ── ramp furniture: bales down the edges, chevrons at the lip ── */
  const chev=pixTex(32,32,(g)=>{
    for(let i=0;i<4;i++){g.fillStyle=i%2?'#e9edf0':'#c8281c';g.fillRect(0,i*8,32,8);}
  });
  const chevMat=psMat({map:chev,unlit:true,side:THREE.DoubleSide});
  const baleG=flat(new THREE.CylinderGeometry(1.0,1.0,1.5,8));baleG.rotateZ(Math.PI/2);
  const baleM=psMat({color:0xe2e4de});
  for(const J of JUMPS){
    for(let k=0;k<=J.up;k+=3){
      const i=(J.at-J.up+k+N)%N;
      for(const sgn of [-1,1]){
        const p=atTrack(i,sgn*(HW+2.4),1.0);
        const b=new THREE.Mesh(baleG,baleM);b.position.copy(p);
        b.rotation.y=Math.atan2(fx[i],fz[i]);world.add(b);
      }
    }
    const i=(J.at-J.up-3+N)%N;
    for(const sgn of [-1,1]){
      const p=atTrack(i,sgn*(HW+3.4),1.6);
      const pl=new THREE.Mesh(new THREE.PlaneGeometry(3,3),chevMat);
      pl.position.copy(p);pl.rotation.y=Math.atan2(fx[i],fz[i])+Math.PI/2;
      world.add(pl);
    }
  }
}
