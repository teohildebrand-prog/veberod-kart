"use strict";
/* ───────── Glimmingehus by night ───────── */
const moon=(function(){                       /* rides on the sky dome, where the sky's glow is */
  const g=new THREE.Group();
  const disc=new THREE.Mesh(new THREE.CircleGeometry(46,16),new THREE.MeshBasicMaterial({color:0xf4f0dc}));
  g.add(disc);
  for(const [x,y,r] of [[-12,8,9],[14,-10,7],[6,16,5]]){
    const c=new THREE.Mesh(new THREE.CircleGeometry(r,8),new THREE.MeshBasicMaterial({color:0xd8d2bc}));
    c.position.set(x,y,.5);g.add(c);
  }
  g.position.copy(LIGHTDIR).multiplyScalar(820);g.lookAt(0,0,0);
  g.visible=false;skyMesh.add(g);return g;
})();
function crowGable(g,mat,x,y,w,steps,th){     /* the stepped gable end of a Skåne stone house */
  for(let s=0;s<steps;s++){
    const e=new THREE.Mesh(flat(new THREE.BoxGeometry(th,1.5,w*(1-s/steps))),mat);
    e.position.set(x,y+s*1.5+.75,0);g.add(e);
  }
}
function sceneryGlimminge(){
  const m4=new THREE.Matrix4(),q=new THREE.Quaternion(),e=new THREE.Euler(),
        p=new THREE.Vector3(),one=new THREE.Vector3(1,1,1);
  const lime=psMat({color:0xd6d2c4}),limeD=psMat({color:0xaaa698}),roofM=psMat({color:0x3c3632}),
        lit=psMat({color:0xffc35a,unlit:true}),hole=psMat({color:0x15171d});
  const C=stage.castle;
  /* the keep: a tall limestone block with crow-stepped gables at both ends */
  const keep=new THREE.Group();
  const bx=(w,h,d,m,x,y,z)=>{const o=new THREE.Mesh(flat(new THREE.BoxGeometry(w,h,d)),m);o.position.set(x,y,z);keep.add(o);return o;};
  bx(26,24,14,lime,0,12,0);
  const r=gableRoof(26,14.6,6.5,0x3c3632);r.position.y=24;keep.add(r);
  for(const sg of [-1,1])crowGable(keep,lime,sg*12.6,24,14,5,1.2);
  bx(5,9,5,limeD,-8,4.5,9);                                  /* stair tower */
  for(let fl=0;fl<4;fl++)for(let c=0;c<5;c++)for(const sg of [-1,1]){
    const on=hash2(fl*3+c,sg)>0.72;
    bx(1.2,1.8,.2,on?lit:hole,-9+c*4.5,4+fl*5.2,sg*7.05);
  }
  keep.position.set(C[0],meshY(C[0],C[1]),C[1]);keep.rotation.y=0.35;world.add(keep);
  /* the moat and the bridge over it */
  const ring=new THREE.RingGeometry(21,35,28,1);ring.rotateX(-Math.PI/2);
  const water=new THREE.Mesh(ring,psMat({color:0x1d2c4a,unlit:true}));
  water.position.set(C[0],meshY(C[0],C[1])-1.6,C[1]);world.add(water);
  const br=new THREE.Mesh(flat(new THREE.BoxGeometry(4,.5,16)),psMat({color:0x5a4634}));
  br.position.set(C[0]+Math.sin(0.35)*28,meshY(C[0],C[1])-.6,C[1]+Math.cos(0.35)*28);br.rotation.y=0.35;world.add(br);
  /* the gatehouse arch over the road, with a stretch of curtain wall either side */
  const gi=598,gyaw=Math.atan2(fx[gi],fz[gi]);
  const gate=new THREE.Group();
  const gb=(w,h,d,m,x,y,z)=>{const o=new THREE.Mesh(flat(new THREE.BoxGeometry(w,h,d)),m);o.position.set(x,y,z);gate.add(o);return o;};
  for(const sg of [-1,1]){
    gb(5,15,7,lime,sg*(HW+6.4),7.5,0);
    gb(26,6,2,limeD,sg*(HW+21),3,0);
    for(let c=0;c<3;c++)gb(1.4,1.4,7.4,lime,sg*(HW+4.6+c*1.8),15.7,0);
  }
  gb((HW+9)*2,4,7,lime,0,12.5,0);
  for(let c=-4;c<=4;c++)gb(1.4,1.4,7.4,lime,c*2.2,15.2,0);
  gate.position.set(sx[gi],sy[gi],sz[gi]);gate.rotation.y=gyaw;world.add(gate);
  /* torches on posts down both sides */
  const post=new THREE.InstancedMesh(flat(new THREE.CylinderGeometry(.12,.16,3.2,5)),psMat({color:0x3a2c20}),Math.ceil(N/12)*2);
  const flame=new THREE.InstancedMesh(flat(new THREE.ConeGeometry(.35,.9,5)),psMat({color:0xffa030,unlit:true}),Math.ceil(N/12)*2);
  let c=0;
  for(let i=0;i<N;i+=12)for(const side of [-1,1]){
    const o=side*(HW+5.4),x=sx[i]+rx[i]*o,z=sz[i]+rz[i]*o,y=meshY(x,z);
    e.set(0,0,0);q.setFromEuler(e);
    p.set(x,y+1.6,z);m4.compose(p,q,one);post.setMatrixAt(c,m4);
    p.set(x,y+3.6,z);m4.compose(p,q,one);flame.setMatrixAt(c,m4);c++;
  }
  post.count=flame.count=c;post.instanceMatrix.needsUpdate=flame.instanceMatrix.needsUpdate=true;
  world.add(post);world.add(flame);
  /* Österlen apple orchards in rows, and a few farmhouses with a lamp in the window */
  const AT=260;
  const tr=new THREE.InstancedMesh(flat(new THREE.CylinderGeometry(.22,.3,1.8,5)).translate(0,.9,0),psMat({color:0x4a3a2c}),AT);
  const cn=new THREE.InstancedMesh(flat(new THREE.SphereGeometry(1.9,6,5)).translate(0,2.9,0),psMat({color:0x2f4a2c}),AT);
  let t=0;
  for(let gx=-330;gx<=330&&t<AT;gx+=11)for(let gz=-330;gz<=330&&t<AT;gz+=9){
    if(hash2(Math.floor(gx/66),Math.floor(gz/66))<0.55)continue;   /* orchards come in blocks */
    const x=gx+hash2(gx,gz)*3,z=gz+hash2(gz,gx)*3;
    if(latAt(x,z)<HW+16||Math.hypot(x-C[0],z-C[1])<70)continue;
    p.set(x,meshY(x,z)-.1,z);e.set(0,hash2(x,z)*6,0);q.setFromEuler(e);
    const sc=.8+hash2(z,x)*.5;m4.compose(p,q,new THREE.Vector3(sc,sc,sc));
    tr.setMatrixAt(t,m4);cn.setMatrixAt(t,m4);t++;
  }
  tr.count=cn.count=t;tr.instanceMatrix.needsUpdate=cn.instanceMatrix.needsUpdate=true;
  world.add(tr);world.add(cn);
  for(const [i,side] of [[90,1],[300,-1],[470,1],[690,-1]]){
    const o=side*(HW+24),x=sx[i]+rx[i]*o,z=sz[i]+rz[i]*o;
    const h=house(12,7,3.6,0xe6e2d6,0x2e2a26,3);
    crowGable(h,psMat({color:0xe6e2d6}),6.1,3.6,7,3,.6);
    const w=new THREE.Mesh(flat(new THREE.BoxGeometry(1.2,1.2,.2)),lit);w.position.set(-2,1.9,3.6);h.add(w);
    h.position.set(x,meshY(x,z)-.2,z);h.rotation.y=Math.atan2(fx[i],fz[i]);world.add(h);
  }
}
/** the castle ghost: drifts across the road and through the walls on a slow beat */
function hazardsGlimminge(H){
  const mat=psMat({color:0xe4ecff,unlit:true,transparent:true,opacity:.55,depthWrite:false});
  [[196,0],[430,3.7],[640,6.1]].forEach(([i0,ph],n)=>{
    const g=new THREE.Group();
    const body=new THREE.Mesh(flat(new THREE.ConeGeometry(1.3,3.2,7)),mat);body.position.y=1.6;g.add(body);
    const head=new THREE.Mesh(flat(new THREE.SphereGeometry(.9,7,5)),mat);head.position.y=3.5;g.add(head);
    for(const sg of [-1,1]){const eye=new THREE.Mesh(flat(new THREE.BoxGeometry(.22,.3,.1)),psMat({color:0x101018,unlit:true}));
      eye.position.set(sg*.3,3.6,.82);g.add(eye);}
    world.add(g);
    H.push({id:'spoke'+n,period:9+n*1.7,phase:ph,mesh:g,
      update(u){const l=Math.sin(u*6.283)*(HW+14),q=mainPt(i0+Math.sin(u*12.566)*6,l);
        g.position.set(q.x,q.y+.6+Math.sin(clock*2.1+n)*.4,q.z);g.rotation.y=q.yaw+(Math.cos(u*6.283)>0?-1.57:1.57);this.p=q;},
      hit(k){return !k.rib&&this.p&&near3(k,this.p.x,this.p.y,this.p.z,2.5);},
      effect(k){k.spun=Math.max(k.spun,1.2*k.spinResist);k.boost=0;k.drift=0;k.charge=0;
        if(k===player){toast('SPÖKET!');ping(500,120,.35);shake=Math.min(1,shake+.4);}}});
  });
}
