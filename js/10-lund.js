"use strict";
/* ───────── Lund ───────── */
function streetRow(step,off,pal,roofs,hmin,hmax){
  for(let i=0;i<N;i+=step)for(const side of [-1,1]){
    if(hash2(i,side)>0.80)continue;                     /* gaps and side streets */
    const o=side*(off+hash2(i+3,side)*3.5);
    const x=sx[i]+rx[i]*o, z=sz[i]+rz[i]*o;
    if(nearAlt(x,z,8))continue;                         /* the lanes keep their own houses */
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
    if(nearAlt(x,z,1))continue;
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
  lundLanes();
}
/* ───────── Lund's genvägar ─────────
   Domkyrkogränden: a cobbled alley between tall old houses, a lamp at every doorway,
   the cathedral towers over the roofs. Saluhallen: a red-brick market hall the lane
   runs straight through, stalls along both walls; its roller shutter is down until a
   forward attack blows it up into the roof. */
function lundLanes(){
  const at=(R,j,l)=>{const x=R.X[j]+R.RX[j]*l,z=R.Z[j]+R.RZ[j]*l;return new THREE.Vector3(x,meshY(x,z),z);};
  const yaw=(R,j)=>Math.atan2(R.FX[j],R.FZ[j]);
  const clearOfMain=(v,pad)=>{const i=nearestGlobal(v.x,v.z);
    return Math.abs((v.x-sx[i])*rx[i]+(v.z-sz[i])*rz[i])>HW+pad;};
  const D=ALTS.find(r=>r.id==='domkyrka');
  if(D){
    const pal=[0xd9c9a8,0xc98b62,0xe0d6c2,0xb8a78c,0xcfc0a4,0xe6c88a],roofs=[0x7d4030,0x6b3b2a,0x45484d];
    for(let j=COMMIT+6;j<D.n-MERGE-4;j+=7)for(const sg of [-1,1]){
      const w=6.2+hash2(j,sg)*1.6,d=5+hash2(sg,j)*2,v=at(D,j,sg*(D.hw+1.4+d/2));
      if(!clearOfMain(v,d/2+3)||!clearOfMain(at(D,j,sg*(D.hw+1.2)),2.5))continue;
      const h=house(w,d,7.5+hash2(j*3,sg)*4.5,pal[Math.floor(hash2(j*7,sg)*pal.length)],
        roofs[Math.floor(hash2(j*11,sg)*roofs.length)],2.6);
      h.position.set(v.x,v.y-.2,v.z);h.rotation.y=yaw(D,j);world.add(h);
      const lp=at(D,j+3,sg*(D.hw+.7));                  /* a wall lamp by the door */
      const arm=new THREE.Mesh(flat(new THREE.BoxGeometry(.5,.8,.5)),psMat({color:0xffe9a8,unlit:true}));
      arm.position.set(lp.x,lp.y+3.6,lp.z);world.add(arm);
    }
    /* the street sign on the corner house at the mouth, and an arch over the way in */
    const j0=COMMIT+4,a=at(D,j0,0),stone=psMat({color:0xcfc3a6});
    for(const sg of [-1,1]){const p=at(D,j0,sg*(D.hw+.8));
      const post=new THREE.Mesh(flat(new THREE.BoxGeometry(1,5.6,1)),stone);post.position.set(p.x,p.y+2.8,p.z);world.add(post);}
    const beam=new THREE.Mesh(flat(new THREE.BoxGeometry(Math.max(2*D.hw+2.6,9),1.1,1.1)),stone);
    beam.position.set(a.x,a.y+6,a.z);beam.rotation.y=yaw(D,j0)+Math.PI/2;world.add(beam);
    const sign=new THREE.Mesh(new THREE.PlaneGeometry(8,1),psMat({map:pixTex(128,16,g=>{
      g.fillStyle='#24427a';g.fillRect(0,0,128,16);g.fillStyle='#f4f0e2';g.fillRect(1,1,126,1);g.fillRect(1,14,126,1);
      g.font='7px "Press Start 2P",monospace';g.textAlign='center';g.textBaseline='middle';g.fillText('DOMKYRKOGRÄNDEN',64,8);}),
      unlit:true,side:THREE.DoubleSide}));
    sign.position.set(a.x,a.y+7.2,a.z);sign.rotation.y=yaw(D,j0)+Math.PI;world.add(sign);
  }
  const S=ALTS.find(r=>r.id==='saluhall');
  if(S){
    const brick=psMat({map:(function(){const t=pixTex(16,16,g=>{
      g.fillStyle='#9a3e2a';g.fillRect(0,0,16,16);g.fillStyle='rgba(0,0,0,.18)';
      for(let y=1;y<16;y+=3)g.fillRect(0,y,16,1);
      for(let y=0;y<16;y+=3)for(let x=(y%6?0:2);x<16;x+=4)g.fillRect(x,y,1,3);
      g.fillStyle='#e8dcc4';g.fillRect(5,4,6,8);g.fillStyle='#5a6a78';g.fillRect(6,5,4,6);});
      t.wrapS=t.wrapT=THREE.RepeatWrapping;return t;})()});
    const roofM=psMat({color:0x4a4d50}),glass=psMat({color:0xa8c8d8,unlit:true});
    const j0=S.mouth||COMMIT+3,j1=S.n-1-(S.mouth||COMMIT+3);
    const wallOff=S.hw+3.4,step=3;
    for(let j=j0;j<j1;j+=step){
      const jj=Math.min(j+step,j1),m=Math.round((j+jj)/2),len=Math.hypot(S.X[jj]-S.X[j],S.Z[jj]-S.Z[j])+.4;
      for(const sg of [-1,1]){
        const v=at(S,m,sg*wallOff);
        const w=new THREE.Mesh(flat(new THREE.BoxGeometry(1,7,len)),brick);
        w.position.set(v.x,v.y+3.3,v.z);w.rotation.y=yaw(S,m);world.add(w);
      }
      /* the roof: two pitches with a strip of skylight along the ridge */
      const c=at(S,m,0),cy=Math.max(c.y,meshY(c.x,c.z));
      for(const sg of [-1,1]){
        const r=new THREE.Mesh(flat(new THREE.BoxGeometry(wallOff+.9,.3,len)),roofM);
        r.position.set(c.x+S.RX[m]*sg*(wallOff/2+.6),cy+8.1,c.z+S.RZ[m]*sg*(wallOff/2+.6));
        r.rotation.set(0,yaw(S,m),0);r.rotateZ(sg*0.42);world.add(r);
      }
      const sk=new THREE.Mesh(flat(new THREE.BoxGeometry(1.4,.2,len)),glass);
      sk.position.set(c.x,cy+9.7,c.z);sk.rotation.y=yaw(S,m);world.add(sk);
    }
    /* stalls along both walls: a counter, a striped awning and a row of produce */
    const stripes=[0xc8321f,0x2f7a3a,0x2f78b8,0xe8a020],produce=[0xd8442c,0xf2a020,0x5aa03a,0xe8d040,0xf4ecd8,0xb8243a];
    const counter=psMat({color:0x8a6a46});
    for(let j=j0+5,n=0;j<j1-4;j+=6,n++)for(const sg of [-1,1]){
      const v=at(S,j,sg*(S.hw+1.7)),y=yaw(S,j);
      const ct=new THREE.Mesh(flat(new THREE.BoxGeometry(1.4,1.1,4.2)),counter);ct.position.set(v.x,v.y+.55,v.z);ct.rotation.y=y;world.add(ct);
      const pr=new THREE.Mesh(flat(new THREE.BoxGeometry(1.1,.3,3.8)),psMat({color:produce[(n*2+(sg>0?1:0))%produce.length]}));
      pr.position.set(v.x,v.y+1.25,v.z);pr.rotation.y=y;world.add(pr);
      const aw=new THREE.Mesh(flat(new THREE.BoxGeometry(2.2,.18,4.4)),psMat({color:stripes[(n+(sg>0?2:0))%4]}));
      const va=at(S,j,sg*(S.hw+2.2));aw.position.set(va.x,va.y+3.1,va.z);aw.rotation.y=y;aw.rotateZ(-sg*.3);world.add(aw);
    }
    /* the name over both doors */
    const nameTex=pixTex(96,16,g=>{g.fillStyle='#f0e6cc';g.fillRect(0,0,96,16);g.fillStyle='#7a2a1c';
      g.font='8px "Press Start 2P",monospace';g.textAlign='center';g.textBaseline='middle';g.fillText('SALUHALLEN',48,9);});
    for(const [j,back] of [[j0,0],[j1,Math.PI]]){
      const c=at(S,j,0);
      const gable=new THREE.Mesh(flat(new THREE.BoxGeometry(2*wallOff+1,2.4,1)),brick);
      gable.position.set(c.x,c.y+7.6,c.z);gable.rotation.y=yaw(S,j);world.add(gable);
      const pl=new THREE.Mesh(new THREE.PlaneGeometry(7,1.2),psMat({map:nameTex,unlit:true,side:THREE.DoubleSide}));
      pl.position.set(c.x-S.FX[j]*.6*(back?-1:1),c.y+7.6,c.z-S.FZ[j]*.6*(back?-1:1));pl.rotation.y=yaw(S,j)+back+Math.PI;world.add(pl);
    }
  }
}
/** the market hall's roller shutter, filling the doorway */
function lundShutter(R,j){
  const g=new THREE.Group();g.rotation.y=Math.atan2(R.FX[j],R.FZ[j]);
  const tex=pixTex(32,32,c=>{c.fillStyle='#8f9498';c.fillRect(0,0,32,32);
    for(let y=0;y<32;y+=4){c.fillStyle='#6c7176';c.fillRect(0,y,32,1);c.fillStyle='#b4b9bd';c.fillRect(0,y+1,32,1);}
    c.fillStyle='#c8321f';c.fillRect(4,14,24,5);c.fillStyle='#f4ecd8';c.fillRect(6,16,20,1);});
  const sh=new THREE.Mesh(flat(new THREE.BoxGeometry(2*R.hw+1.6,6.4,.35)),psMat({map:tex}));
  sh.position.y=3.2;g.add(sh);g.userData.shutter=sh;
  const box=new THREE.Mesh(flat(new THREE.BoxGeometry(2*R.hw+2,.9,.9)),psMat({color:0x5a5e62}));
  box.position.y=6.85;g.add(box);
  return g;
}
function lundShutterAnim(B,drop){
  const sh=B.mesh.userData.shutter;if(!sh)return;
  sh.scale.y=Math.max(.04,1-drop);sh.position.y=6.4-3.2*sh.scale.y;   /* rolls up into its box */
}
