"use strict";
/* ───────── Tollarp ───────── */
function sceneryTollarp(){
  const m4=new THREE.Matrix4(),q=new THREE.Quaternion(),e=new THREE.Euler(),
        p=new THREE.Vector3(),one=new THREE.Vector3(1,1,1);
  const rust=psMat({color:0x8a5a33}), steel=psMat({color:0x7e8286}),
        conc=psMat({color:0x9a958c}), dark=psMat({color:0x4c4f52});
  /* sheds and works along the road */
  for(let i=0;i<N;i+=26)for(const side of [-1,1]){
    if(hash2(i,side)>0.72)continue;
    const o=side*(HW+20+hash2(i+9,side)*14);
    const x=sx[i]+rx[i]*o, z=sz[i]+rz[i]*o;
    const g=new THREE.Group();
    const w=16+hash2(i*2,side)*18, d=12+hash2(i,side*5)*14, h=7+hash2(i*3,side)*9;
    const body=new THREE.Mesh(flat(new THREE.BoxGeometry(w,h,d)),
      hash2(i*13,side)>.5?conc:rust);
    body.position.y=h/2;g.add(body);
    const r=gableRoof(w*1.06,d*1.06,2.2,0x55585b);r.position.y=h;g.add(r);
    if(hash2(i*17,side)>.55){                       /* smokestack */
      const H=16+hash2(i*19,side)*22;
      const st=new THREE.Mesh(flat(new THREE.CylinderGeometry(1.5,2.4,H,7)),
        psMat({color:0xa89484}));
      st.position.set(w*0.32,H/2,-d*0.3);g.add(st);
      const band=new THREE.Mesh(flat(new THREE.CylinderGeometry(1.62,1.62,2.4,7)),
        psMat({color:0xb5392a}));
      band.position.set(w*0.32,H-3,-d*0.3);g.add(band);
      const plume=new THREE.Mesh(flat(new THREE.SphereGeometry(4.2,6,5)),
        psMat({color:0x8c8880,unlit:true,transparent:true,opacity:.62,depthWrite:false}));
      plume.position.set(w*0.32,H+4,-d*0.3);plume.scale.set(1.5,.7,1.2);g.add(plume);
    }
    g.position.set(x,meshY(x,z),z);
    g.rotation.y=Math.atan2(fx[i],fz[i])+(side>0?Math.PI/2:-Math.PI/2);
    world.add(g);
  }
  /* pipe bridges over the road */
  for(const i of [Math.round(N*0.17),Math.round(N*0.46),Math.round(N*0.78)]){
    const g=new THREE.Group();
    for(const sgn of [-1,1]){
      const leg=new THREE.Mesh(flat(new THREE.BoxGeometry(1.5,11,1.5)),steel);
      leg.position.set(sgn*(HW+5),5.5,0);g.add(leg);
    }
    for(let k=0;k<3;k++){
      const pipe=new THREE.Mesh(flat(new THREE.CylinderGeometry(.85,.85,(HW+6)*2,7)),
        k===1?rust:steel);
      pipe.rotation.z=Math.PI/2;pipe.position.set(0,9.4+k*1.8,k*1.1-1.1);g.add(pipe);
    }
    const x=sx[i],z=sz[i];
    g.position.set(x,sy[i],z);g.rotation.y=Math.atan2(fx[i],fz[i]);world.add(g);
  }
  /* cooling tower */
  const ct=new THREE.Group();
  ct.add(new THREE.Mesh(flat(new THREE.CylinderGeometry(13,19,34,10)),conc));
  ct.children[0].position.y=17;
  const cap=new THREE.Mesh(flat(new THREE.SphereGeometry(13,8,4)),
    psMat({color:0x8c8880,unlit:true,transparent:true,opacity:.6,depthWrite:false}));
  cap.position.y=38;cap.scale.y=.5;ct.add(cap);
  const cq=new THREE.Vector3(sx[300]+rx[300]*(HW+62),0,sz[300]+rz[300]*(HW+62));
  ct.position.set(cq.x,meshY(cq.x,cq.z),cq.z);world.add(ct);
  /* silos, drums, slag heaps, dead trees */
  const silo=new THREE.InstancedMesh(flat(new THREE.CylinderGeometry(3,3,16,8)),
    psMat({color:0xb6b0a4}),26);
  const drum=new THREE.InstancedMesh(flat(new THREE.CylinderGeometry(.8,.8,1.7,7)),rust,140);
  const heap=new THREE.InstancedMesh(flat(new THREE.ConeGeometry(1,1,6)),
    psMat({color:0x3f3a35}),60);
  const dead=new THREE.InstancedMesh(flat(new THREE.CylinderGeometry(.16,.4,6,5)).translate(0,3,0),
    psMat({color:0x6a6258}),120);
  let a=0,b=0,c=0,d2=0,guard=0;
  while((a<26||b<140||c<60||d2<120)&&guard++<14000){
    const x=rand(-360,360),z=rand(-360,360);
    const lt=latAt(x,z);
    if(lt<HW+14)continue;
    const y=meshY(x,z);
    e.set(0,rand(0,6.283),0);q.setFromEuler(e);
    const r=Math.random();
    if(r<.10&&a<26&&lt>HW+30){p.set(x,y+8,z);m4.compose(p,q,one);silo.setMatrixAt(a++,m4);}
    else if(r<.50&&b<140){p.set(x,y+.85,z);m4.compose(p,q,one);drum.setMatrixAt(b++,m4);}
    else if(r<.70&&c<60&&lt>HW+26){
      const w=rand(8,22),h=rand(5,16);
      p.set(x,y+h*.45,z);m4.compose(p,q,new THREE.Vector3(w,h,w));heap.setMatrixAt(c++,m4);
    }else if(d2<120){
      const sc=rand(.7,1.5);
      p.set(x,y-.2,z);m4.compose(p,q,new THREE.Vector3(sc,sc,sc));dead.setMatrixAt(d2++,m4);
    }
  }
  silo.count=a;drum.count=b;heap.count=c;dead.count=d2;
  [silo,drum,heap,dead].forEach(m=>{m.instanceMatrix.needsUpdate=true;world.add(m);});
}
