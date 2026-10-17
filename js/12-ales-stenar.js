"use strict";
/* ───────── Ales stenar ───────── */
function sceneryAles(){
  const m4=new THREE.Matrix4(),q=new THREE.Quaternion(),e=new THREE.Euler(),
        p=new THREE.Vector3(),sc=new THREE.Vector3();
  const stoneM=psMat({color:0x8f8b83}),stoneD=psMat({color:0x77736c});
  const stoneG=flat(new THREE.BoxGeometry(1.4,1,1.0));
  const stones=new THREE.InstancedMesh(stoneG,stoneM,160),stones2=new THREE.InstancedMesh(stoneG,stoneD,160);
  let a=0,b=0;
  const put=(x,z,h,yaw,big)=>{
    p.set(x,meshY(x,z)+h/2-.2,z);e.set(hash2(x,z)*.12-.06,yaw,hash2(z,x)*.12-.06);q.setFromEuler(e);
    sc.set(big?1.5:1,h,big?1.3:1);m4.compose(p,q,sc);
    if((a+b)%2&&a<160)stones.setMatrixAt(a++,m4);else if(b<160)stones2.setMatrixAt(b++,m4);
  };
  /* the stone ship: 59 stones in a ship's outline, 67 m long, along the passage */
  const S=ALTS.find(r=>r.id==='skepp');
  if(S){
    const n=S.n,j0=Math.round(n*0.5-16),j1=Math.round(n*0.5+16);
    for(let k=0;k<=28;k++){
      const t=k/28,j=Math.round(j0+(j1-j0)*t),w=9.6*Math.pow(Math.sin(Math.PI*t),0.75);
      for(const sg of [-1,1]){
        if(w<S.hw+1.6)continue;                         /* bow and stern stay open */
        const x=S.X[j]+S.RX[j]*sg*w,z=S.Z[j]+S.RZ[j]*sg*w;
        put(x,z,2.2+hash2(k,sg)*1.2,Math.atan2(S.FX[j],S.FZ[j]),false);
      }
    }
    for(const j of [j0-3,j1+3])for(const sg of [-1,1]){           /* the tall stem and stern stones */
      const x=S.X[j]+S.RX[j]*sg*(S.hw+2.2),z=S.Z[j]+S.RZ[j]*sg*(S.hw+2.2);
      put(x,z,3.6,Math.atan2(S.FX[j],S.FZ[j]),true);
    }
  }
  /* two rows of standing stones along the second passage */
  const T=ALTS.find(r=>r.id==='stenar');
  if(T)for(let j=COMMIT+6;j<T.n-MERGE-2;j+=4)for(const sg of [-1,1]){
    const x=T.X[j]+T.RX[j]*sg*(T.hw+1.8),z=T.Z[j]+T.RZ[j]*sg*(T.hw+1.8);
    put(x,z,1.6+hash2(j,sg)*1.4,Math.atan2(T.FX[j],T.FZ[j]),false);
  }
  stones.count=a;stones2.count=b;stones.instanceMatrix.needsUpdate=stones2.instanceMatrix.needsUpdate=true;
  world.add(stones);world.add(stones2);
  /* the sea below the cliff, north and east */
  const seaM=psMat({color:0x2f6c9a,unlit:true});
  for(const [w,d,x,z] of [[1500,700,0,-450],[420,1500,560,0]]){
    const sea=new THREE.Mesh(new THREE.PlaneGeometry(w,d).rotateX(-Math.PI/2),seaM);
    sea.position.set(x,-6.5,z);world.add(sea);
  }
  /* Kåseberga: smokehouses with tall chimneys, by the long straight */
  for(const [i,o] of [[56,-26],[74,-30],[92,-25]]){
    const x=sx[i]+rx[i]*o,z=sz[i]+rz[i]*o;
    const h=house(9,6,3.2,0x2a2624,0x8b2b1c,2.6);
    const ch=new THREE.Mesh(flat(new THREE.BoxGeometry(1.4,6,1.4)),psMat({color:0x6a3a2a}));ch.position.set(3,5,0);h.add(ch);
    h.position.set(x,meshY(x,z)-.2,z);h.rotation.y=Math.atan2(fx[i],fz[i]);world.add(h);
  }
  /* the lighthouse on the point */
  const lh=new THREE.Group();
  const tw=new THREE.Mesh(flat(new THREE.CylinderGeometry(2.4,3.4,24,8)),psMat({color:0xf2f0ea}));tw.position.y=12;lh.add(tw);
  const band=new THREE.Mesh(flat(new THREE.CylinderGeometry(2.6,2.7,3,8)),psMat({color:0xc8281c}));band.position.y=16;lh.add(band);
  const lamp=new THREE.Mesh(flat(new THREE.CylinderGeometry(1.8,1.8,2.4,8)),psMat({color:0xfff2b0,unlit:true}));lamp.position.y=25.2;lh.add(lamp);
  const cap=new THREE.Mesh(flat(new THREE.ConeGeometry(2.4,2.4,8)),psMat({color:0x2a2e34}));cap.position.y=27.6;lh.add(cap);
  lh.position.set(-200,meshY(-200,-86),-86);world.add(lh);
  /* marram grass on the dunes */
  const MG=900;
  const grass=new THREE.InstancedMesh(flat(new THREE.ConeGeometry(.5,1.4,4)).translate(0,.7,0),psMat({color:0x9ea35a}),MG);
  let g=0,guard=0;
  while(g<MG&&guard++<20000){
    const x=rand(-420,420),z=rand(-420,420);
    if(latAt(x,z)<HW+5||stage.shore(x,z)<-3)continue;
    p.set(x,meshY(x,z)-.1,z);e.set(0,rand(0,6),0);q.setFromEuler(e);
    const s2=rand(.7,1.5);sc.set(s2,s2*rand(.8,1.4),s2);m4.compose(p,q,sc);grass.setMatrixAt(g++,m4);
  }
  grass.count=g;grass.instanceMatrix.needsUpdate=true;world.add(grass);
}
/** Ale's curse: drive back through the ship and your hands swap */
function hazardsAles(H){
  const S=ALTS.find(r=>r.id==='skepp');if(!S)return;
  H.push({id:'curse',period:1,phase:0,unblockable:true,update(){},
    hit(k){if(k.rib!==S.idx||k.speed<4||k.curse>0)return false;
      const j=k.si;if(j<S.n*0.25||j>S.n*0.75)return false;
      return (k.vx*S.FX[j]+k.vz*S.FZ[j])<-3;},
    effect(k){k.curse=3;
      for(let p=0;p<16;p++)puff(k.x+rand(-1.2,1.2),k.y+rand(.3,2),k.z+rand(-1.2,1.2),.55,.4,.75,.6);
      if(k===player){toast('ALES FÖRBANNELSE! STYRNINGEN BYTT');ping(180,90,.5);}}});
}
