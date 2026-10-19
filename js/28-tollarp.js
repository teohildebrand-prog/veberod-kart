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
    const w=16+hash2(i*2,side)*18, d=12+hash2(i,side*5)*14, h=7+hash2(i*3,side)*9;
    if(nearAlt(x,z,Math.max(w,d)/2+3))continue;       /* not on a shortcut */
    const g=new THREE.Group();
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
    if(lt<HW+14||nearAlt(x,z,12))continue;
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
  tollarpLanes();
}
/* black slag grit for Slagghögen */
ROADTEX.slag=()=>pixTex(64,64,g=>{
  g.fillStyle='#34302c';g.fillRect(0,0,64,64);
  for(let i=0;i<1100;i++){
    g.fillStyle=Math.random()>.6?'rgba(120,108,96,.55)':Math.random()>.5?'rgba(150,84,46,.35)':'rgba(14,12,10,.55)';
    g.fillRect((Math.random()*64)|0,(Math.random()*64)|0,1+(Math.random()*2|0),1);
  }
  g.fillStyle='rgba(20,18,16,.4)';
  for(const x of [16,22,40,46])g.fillRect(x,0,3,64);  /* ruts from the dumpers */
});

/** the two shortcuts: over the slag heap and through the warehouse */
function tollarpLanes(){
  const at=(R,j,l)=>{const x=R.X[j]+R.RX[j]*l,z=R.Z[j]+R.RZ[j]*l;return new THREE.Vector3(x,meshY(x,z),z);};
  const yaw=(R,j)=>Math.atan2(R.FX[j],R.FZ[j]);
  const clearOfMain=(v,pad)=>{const i=nearestGlobal(v.x,v.z);
    return Math.abs((v.x-sx[i])*rx[i]+(v.z-sz[i])*rz[i])>HW+pad;};
  const sign=(txt,bg,fg,w)=>new THREE.Mesh(new THREE.PlaneGeometry(w,w/8),psMat({map:pixTex(128,16,g=>{
    g.fillStyle=bg;g.fillRect(0,0,128,16);g.fillStyle=fg;g.fillRect(1,1,126,1);g.fillRect(1,14,126,1);
    g.font='7px "Press Start 2P",monospace';g.textAlign='center';g.textBaseline='middle';g.fillText(txt,64,8);}),
    unlit:true,side:THREE.DoubleSide}));
  const S=ALTS.find(r=>r.id==='slagg');
  if(S){
    /* heaps of grit along both sides, a dumper left on the crest, a striped board at the way in */
    const grit=psMat({color:0x3a3530}),rustM=psMat({color:0x8a5a33}),yel=psMat({color:0xe8b020});
    for(let j=COMMIT+6;j<S.n-MERGE-6;j+=4)for(const sg of [-1,1]){
      const r=2.4+hash2(j,sg)*2.6,v=at(S,j,sg*(S.hw+1.6+r));
      if(!clearOfMain(v,r+1))continue;
      const c=new THREE.Mesh(flat(new THREE.ConeGeometry(r,r*1.1,6)),grit);
      c.position.set(v.x,Math.max(v.y,S.Y[j])+r*.45,v.z);c.rotation.y=hash2(sg,j)*3;world.add(c);
    }
    const jc=Math.round((S.n-1)/2),dv=at(S,jc,-(S.hw+3.2));
    if(clearOfMain(dv,4)){
      const g=new THREE.Group();
      const bed=new THREE.Mesh(flat(new THREE.BoxGeometry(3.2,1.6,4.6)),yel);bed.position.y=1.6;bed.rotation.x=-.25;g.add(bed);
      const cab=new THREE.Mesh(flat(new THREE.BoxGeometry(2.4,2,1.8)),yel);cab.position.set(0,1.9,3.3);g.add(cab);
      for(const [x,z] of [[-1.5,-1.2],[1.5,-1.2],[-1.5,2.9],[1.5,2.9]]){
        const w=new THREE.Mesh(flat(new THREE.CylinderGeometry(.75,.75,.6,8)),psMat({color:0x1e1e20}));
        w.rotation.z=Math.PI/2;w.position.set(x,.75,z);g.add(w);
      }
      g.position.set(dv.x,Math.max(dv.y,S.Y[jc]),dv.z);g.rotation.y=yaw(S,jc)+.3;world.add(g);
    }
    const j0=COMMIT+4,a=at(S,j0,0);
    for(const sg of [-1,1]){const p=at(S,j0,sg*(S.hw+.8));
      const post=new THREE.Mesh(flat(new THREE.BoxGeometry(.4,4.2,.4)),rustM);post.position.set(p.x,p.y+2.1,p.z);world.add(post);}
    const b=sign('SLAGGHÖGEN','#e8b020','#1e1e20',8);
    b.position.set(a.x,Math.max(a.y,S.Y[j0])+4.4,a.z);b.rotation.y=yaw(S,j0)+Math.PI;world.add(b);
  }
  const L=ALTS.find(r=>r.id==='lager');
  if(L){
    /* the warehouse: corrugated walls, a flat roof with skylights, pallet racks down both sides */
    const corr=pixTex(16,16,g=>{g.fillStyle='#7d8a8c';g.fillRect(0,0,16,16);
      for(let x=0;x<16;x+=4){g.fillStyle='#5f6b6d';g.fillRect(x,0,1,16);g.fillStyle='#98a4a6';g.fillRect(x+2,0,1,16);}
      g.fillStyle='rgba(138,90,51,.5)';g.fillRect(9,11,5,5);});
    corr.wrapS=corr.wrapT=THREE.RepeatWrapping;
    const wall=psMat({map:corr}),roofM=psMat({color:0x4c4f52}),glass=psMat({color:0xc8dce0,unlit:true}),
          up=psMat({color:0xe0641e}),beam=psMat({color:0x2f62a8}),pal=psMat({color:0xb08a58}),
          boxes=[0xc8a070,0xa87e50,0xd8c8a0,0x6e8a9a];
    const j0=L.mouth||COMMIT+3,j1=L.n-1-(L.mouth||COMMIT+3),wo=L.hw+3.6,step=3;
    for(let j=j0;j<j1;j+=step){
      const jj=Math.min(j+step,j1),m=Math.round((j+jj)/2),len=Math.hypot(L.X[jj]-L.X[j],L.Z[jj]-L.Z[j])+.4;
      for(const sg of [-1,1]){
        const v=at(L,m,sg*wo);
        const w=new THREE.Mesh(flat(new THREE.BoxGeometry(1,8,len)),wall);
        w.position.set(v.x,v.y+3.8,v.z);w.rotation.y=yaw(L,m);world.add(w);
      }
      const c=at(L,m,0),cy=Math.max(c.y,L.Y[m]);
      const r=new THREE.Mesh(flat(new THREE.BoxGeometry(2*wo+2,.5,len)),roofM);
      r.position.set(c.x,cy+8,c.z);r.rotation.y=yaw(L,m);world.add(r);
      if((j/step)%2){const sk=new THREE.Mesh(flat(new THREE.BoxGeometry(3,.3,len*.7)),glass);
        sk.position.set(c.x,cy+7.9,c.z);sk.rotation.y=yaw(L,m);world.add(sk);}
    }
    for(let j=j0+3;j<j1-3;j+=4)for(const sg of [-1,1]){
      const v=at(L,j,sg*(wo-1.5)),g=new THREE.Group();
      for(const z of [-1.6,1.6]){const u=new THREE.Mesh(flat(new THREE.BoxGeometry(.25,6.4,.25)),up);u.position.set(0,3.2,z);g.add(u);}
      for(let lv=0;lv<3;lv++){
        const bm=new THREE.Mesh(flat(new THREE.BoxGeometry(1.4,.22,3.4)),beam);bm.position.y=.6+lv*2;g.add(bm);
        const pl=new THREE.Mesh(flat(new THREE.BoxGeometry(1.2,.18,2.8)),pal);pl.position.y=.8+lv*2;g.add(pl);
        if(hash2(j*3+lv,sg)>.25){const h=.6+hash2(j,lv+sg)*.9;
          const bx=new THREE.Mesh(flat(new THREE.BoxGeometry(1.1,h,2.5)),psMat({color:boxes[(j+lv)%4]}));
          bx.position.y=.9+lv*2+h/2;g.add(bx);}
      }
      g.position.copy(v);g.rotation.y=yaw(L,j);world.add(g);
    }
    /* the name over the door */
    const d=at(L,j0,0),dy=Math.max(d.y,L.Y[j0]);
    const fasc=new THREE.Mesh(flat(new THREE.BoxGeometry(2*wo+2,2.4,1)),wall);
    fasc.position.set(d.x,dy+7.4,d.z);fasc.rotation.y=yaw(L,j0);world.add(fasc);
    const nb=sign('LAGERHALLEN','#2f62a8','#f4f0e2',8);
    nb.position.set(d.x-L.FX[j0]*.6,dy+7.4,d.z-L.FZ[j0]*.6);nb.rotation.y=yaw(L,j0)+Math.PI;world.add(nb);
  }
}
/** the warehouse's roller door, built at local origin and turned along the lane */
function tollarpDoor(R,j){
  const g=new THREE.Group();g.rotation.y=Math.atan2(R.FX[j],R.FZ[j]);
  const tex=pixTex(32,32,c=>{c.fillStyle='#a4a8a0';c.fillRect(0,0,32,32);
    for(let y=0;y<32;y+=3){c.fillStyle='#7c8078';c.fillRect(0,y,32,1);}
    c.fillStyle='#e8b020';for(let x=0;x<32;x+=8)c.fillRect(x,28,4,4);
    c.fillStyle='#1e1e20';for(let x=4;x<32;x+=8)c.fillRect(x,28,4,4);});
  const sh=new THREE.Mesh(flat(new THREE.BoxGeometry(2*R.hw+2,6.6,.35)),psMat({map:tex}));
  sh.position.y=3.3;g.add(sh);g.userData.shutter=sh;
  const box=new THREE.Mesh(flat(new THREE.BoxGeometry(2*R.hw+2.4,1,1)),psMat({color:0x4c4f52}));
  box.position.y=7.1;g.add(box);
  return g;
}
function tollarpDoorAnim(B,drop){
  const sh=B.mesh.userData.shutter;if(!sh)return;
  sh.scale.y=Math.max(.04,1-drop);sh.position.y=6.6-3.3*sh.scale.y;   /* rolls up into its box */
}
