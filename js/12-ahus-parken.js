"use strict";
/* ───────── Åhus-parken ───────── */
function sceneryAhus(){
  const m4=new THREE.Matrix4(),q=new THREE.Quaternion(),e=new THREE.Euler(),
        p=new THREE.Vector3(),one=new THREE.Vector3(1,1,1);
  const steel=psMat({color:0xb9c2cc}), rail=psMat({color:0xe8e2d4}),
        hot=psMat({color:0xd8362a}), sun=psMat({color:0xf2c500});
  const stripes=(a,b)=>{
    const t=pixTex(16,16,(g)=>{
      for(let i=0;i<16;i+=4){g.fillStyle=((i/4)%2)?a:b;g.fillRect(i,0,4,16);}
    });
    return t;
  };
  const ground=(i,o)=>{
    const ii=((i%N)+N)%N, x=sx[ii]+rx[ii]*o, z=sz[ii]+rz[ii]*o;
    return {x,z,y:meshY(x,z),rot:Math.atan2(fx[ii],fz[ii])};
  };

  /* ── loop-the-loops arcing over the road ── */
  for(const fr of [0.18,0.47,0.82]){
    const i=Math.round(N*fr)%N;
    const g=new THREE.Group();
    const R=13;
    for(const side of [-1.7,1.7]){                      /* two rails */
      const t=new THREE.Mesh(flat(new THREE.TorusGeometry(R,.42,4,16)),hot);
      t.rotation.y=Math.PI/2;                           /* ring plane holds forward+up */
      t.position.set(side,0,0);
      g.add(t);
    }
    for(let k=0;k<16;k++){                              /* cross ties */
      const a=k/16*6.283;
      const tie=new THREE.Mesh(flat(new THREE.BoxGeometry(3.4,.22,.22)),steel);
      tie.position.set(0,Math.sin(a)*R,Math.cos(a)*R);
      tie.rotation.x=-a;g.add(tie);
    }
    for(const side of [-1,1]){                          /* legs */
      const leg=new THREE.Mesh(flat(new THREE.BoxGeometry(.8,R+2,.8)),steel);
      leg.position.set(side*(R*0.82),-(R*0.5),0);g.add(leg);
    }
    g.position.set(sx[i],sy[i]+R+2.4,sz[i]);
    g.rotation.y=Math.atan2(fx[i],fz[i]);
    world.add(g);
  }

  /* ── pariserhjul ── */
  (function ferris(){
    const base=ground(Math.round(N*0.30),-54);
    const g=new THREE.Group();
    for(const side of [-3,3]){
      const leg=new THREE.Mesh(flat(new THREE.BoxGeometry(1.4,34,1.4)),steel);
      leg.position.set(side*1.2,17,side);g.add(leg);
    }
    const rot=new THREE.Group();rot.position.y=32;
    for(const side of [-1.8,1.8]){
      const ring=new THREE.Mesh(flat(new THREE.TorusGeometry(22,.55,4,18)),rail);
      ring.position.z=side;rot.add(ring);
    }
    for(let k=0;k<12;k++){
      const a=k/12*6.283;
      const sp=new THREE.Mesh(flat(new THREE.BoxGeometry(.3,44,.3)),steel);
      sp.rotation.z=a;rot.add(sp);
      const car=new THREE.Mesh(flat(new THREE.BoxGeometry(2.6,2.4,3.4)),
        psMat({color:[0xd8362a,0xf2c500,0x3f7fbf,0x5faf4a][k%4]}));
      car.position.set(Math.cos(a)*22,Math.sin(a)*22,0);rot.add(car);
    }
    g.add(rot);turbines.push({rot,speed:.22});
    g.position.set(base.x,base.y,base.z);g.rotation.y=base.rot;world.add(g);
  })();

  /* ── karusell ── */
  (function carousel(){
    const base=ground(Math.round(N*0.62),46);
    const g=new THREE.Group();
    const rot=new THREE.Group();
    const deck=new THREE.Mesh(flat(new THREE.CylinderGeometry(9,9,.7,12)),rail);
    deck.position.y=1.4;rot.add(deck);
    const pole=new THREE.Mesh(flat(new THREE.CylinderGeometry(.7,.7,8,8)),sun);
    pole.position.y=5;rot.add(pole);
    const roof=new THREE.Mesh(flat(new THREE.ConeGeometry(10.5,4,12)),
      psMat({map:stripes('#d8362a','#f4efe4')}));
    roof.position.y=10.5;rot.add(roof);
    for(let k=0;k<8;k++){
      const a=k/8*6.283, rr=6.8;
      const bar=new THREE.Mesh(flat(new THREE.CylinderGeometry(.14,.14,6,5)),steel);
      bar.position.set(Math.cos(a)*rr,4.8,Math.sin(a)*rr);rot.add(bar);
      const horse=new THREE.Mesh(flat(new THREE.BoxGeometry(2.4,1.3,.9)),
        psMat({color:k%2?0xf4efe4:0xc8a46a}));
      horse.position.set(Math.cos(a)*rr,3.3,Math.sin(a)*rr);
      horse.rotation.y=-a;rot.add(horse);
    }
    g.add(rot);turbines.push({rot,speed:.55,yaxis:true});
    g.position.set(base.x,base.y,base.z);world.add(g);
  })();

  /* ── tents, kiosks, flags ── */
  const tent=new THREE.InstancedMesh(flat(new THREE.ConeGeometry(4.2,5.5,8)).translate(0,2.75,0),
    psMat({map:stripes('#d8362a','#f4efe4')}),46);
  let tc=0,guard=0;
  while(tc<46&&guard++<5000){
    const x=rand(-300,300),z=rand(-300,300);
    if(latAt(x,z)<HW+16)continue;
    const sc=rand(.7,1.5);
    p.set(x,meshY(x,z),z);e.set(0,rand(0,6.283),0);q.setFromEuler(e);
    m4.compose(p,q,new THREE.Vector3(sc,sc,sc));tent.setMatrixAt(tc++,m4);
  }
  tent.count=tc;tent.instanceMatrix.needsUpdate=true;world.add(tent);

  const kioskSign=pixTex(64,32,(g)=>{
    g.fillStyle='#14396e';g.fillRect(0,0,64,32);
    g.fillStyle='#f2c500';g.font='10px "Press Start 2P",monospace';
    g.textAlign='center';g.textBaseline='middle';g.fillText('GLASS',32,17);
  });
  for(const fr of [0.08,0.26,0.40,0.55,0.70,0.90]){
    const side=(fr*10|0)%2?1:-1;
    const b=ground(Math.round(N*fr),side*(HW+14));
    const g=new THREE.Group();
    const box=new THREE.Mesh(flat(new THREE.BoxGeometry(6,3.4,4.5)),rail);
    box.position.y=1.7;g.add(box);
    const rf=new THREE.Mesh(flat(new THREE.BoxGeometry(6.6,.5,5.1)),
      psMat({map:stripes('#3f7fbf','#f4efe4')}));
    rf.position.y=3.6;g.add(rf);
    const sg=new THREE.Mesh(new THREE.PlaneGeometry(4.4,2.2),
      psMat({map:kioskSign,unlit:true,side:THREE.DoubleSide}));
    sg.position.set(0,4.9,0);g.add(sg);
    const po=new THREE.Mesh(flat(new THREE.BoxGeometry(.25,2,.25)),steel);
    po.position.y=4.1;g.add(po);
    g.position.set(b.x,b.y,b.z);g.rotation.y=b.rot+(side>0?Math.PI/2:-Math.PI/2);
    world.add(g);
  }

  const pole=new THREE.InstancedMesh(flat(new THREE.CylinderGeometry(.11,.14,6,5)).translate(0,3,0),
    steel,Math.ceil(N/16)*2);
  let pc=0;
  for(let i=0;i<N;i+=16)for(const side of [-1,1]){
    const b=ground(i,side*(HW+5.4));
    p.set(b.x,b.y,b.z);e.set(0,b.rot,0);q.setFromEuler(e);
    m4.compose(p,q,one);pole.setMatrixAt(pc++,m4);
    const fl=new THREE.Mesh(new THREE.PlaneGeometry(1.8,1.2),
      psMat({map:skaneTex,unlit:true,side:THREE.DoubleSide}));
    fl.position.set(b.x,b.y+5.2,b.z);fl.rotation.y=b.rot;world.add(fl);
  }
  pole.count=pc;pole.instanceMatrix.needsUpdate=true;world.add(pole);

  /* ── dune pines ── */
  const pin=new THREE.InstancedMesh(flat(new THREE.ConeGeometry(2.6,7,6)).translate(0,4,0),
    psMat({color:0x3f6b3c}),130);
  const trk=new THREE.InstancedMesh(flat(new THREE.CylinderGeometry(.26,.4,2.4,5)).translate(0,1.2,0),
    psMat({color:0x6b4a32}),130);
  let pn=0;guard=0;
  while(pn<130&&guard++<6000){
    const x=rand(-330,330),z=rand(-330,330);
    if(latAt(x,z)<HW+22)continue;
    const sc=rand(.7,1.4);
    p.set(x,meshY(x,z)-.2,z);e.set(0,rand(0,6.283),0);q.setFromEuler(e);
    m4.compose(p,q,new THREE.Vector3(sc,sc*rand(.8,1.2),sc));
    pin.setMatrixAt(pn,m4);trk.setMatrixAt(pn,m4);pn++;
  }
  pin.count=trk.count=pn;
  pin.instanceMatrix.needsUpdate=trk.instanceMatrix.needsUpdate=true;
  world.add(pin);world.add(trk);
}

function sceneryBron(){
  const conc=psMat({color:0xb9bcbd,side:THREE.DoubleSide}),
        steel=psMat({color:0x8e959b}), pale=psMat({color:0xd3d7d8});
  const m4=new THREE.Matrix4(),q=new THREE.Quaternion(),e=new THREE.Euler(),
        p=new THREE.Vector3(),one=new THREE.Vector3(1,1,1);
  const E=HW+4.4;

  /* deck: edge beams, box girder, soffit */
  world.add(new THREE.Mesh(ribbon(-E,-HW-2.6,-.1,6,ROADSTEP),conc));
  world.add(new THREE.Mesh(ribbon(HW+2.6,E,-.1,6,ROADSTEP),conc));
  sweep(0,N,-E,-.1,-E,-3.6,conc);
  sweep(0,N, E,-.1, E,-3.6,conc);
  sweep(0,N,-E,-3.6,E,-3.6,conc);

  /* the two cable-stayed pylons, at the crown of each carriageway */
  const tops=[];
  for(let i=0;i<N;i++){
    const j=(i+1)%N;
    if(sx[i]*sx[j]<=0&&Math.abs(sx[i])<40)tops.push(i);
  }
  const piers=[];
  for(const at of tops){
    for(const sg of [-1,1]){
      const o=sg*(HW+7.5);
      const bx=sx[at]+rx[at]*o, bz=sz[at]+rz[at]*o, by=sy[at]-3.4;
      const leg=new THREE.Mesh(flat(new THREE.CylinderGeometry(1.3,2.6,58,4)),pale);
      leg.position.set(bx,by+29,bz);leg.rotation.y=Math.PI/4;world.add(leg);
      const foot=new THREE.Mesh(flat(new THREE.BoxGeometry(7,by+2,7)),conc);
      foot.position.set(bx,(by+2)/2,bz);world.add(foot);
      const top=new THREE.Vector3(bx,by+55,bz);
      for(let k=1;k<=9;k++){
        for(const dir of [-1,1]){
          const i2=(at+dir*k*7+N)%N;
          const lo=sg*(HW+2.2);
          strut(top,new THREE.Vector3(sx[i2]+rx[i2]*lo,sy[i2]+lo*bank[i2]+.4,
                                      sz[i2]+rz[i2]*lo),.22,steel);
        }
      }
    }
    for(const h of [22,46]){
      const a=new THREE.Vector3(sx[at]+rx[at]*(-HW-7.5),sy[at]-3.4+h,sz[at]+rz[at]*(-HW-7.5));
      const b=new THREE.Vector3(sx[at]+rx[at]*( HW+7.5),sy[at]-3.4+h,sz[at]+rz[at]*( HW+7.5));
      strut(a,b,2.0,pale);
    }
    piers.push(at);
  }

  /* concrete piers marching out to the horizon */
  const col=new THREE.InstancedMesh(flat(new THREE.BoxGeometry(3.4,1,5)),conc,Math.ceil(N/22)*2);
  let c=0;
  for(let i=0;i<N;i+=22){
    if(piers.some(a=>Math.min(Math.abs(i-a),N-Math.abs(i-a))<22))continue;
    const h=Math.max(2,sy[i]-3.6);
    for(const sg of [-1,1]){
      const o=sg*(HW-1.5);
      p.set(sx[i]+rx[i]*o,h/2,sz[i]+rz[i]*o);
      e.set(0,Math.atan2(fx[i],fz[i]),0);q.setFromEuler(e);
      m4.compose(p,q,new THREE.Vector3(1,h,1));col.setMatrixAt(c++,m4);
    }
  }
  col.count=c;col.instanceMatrix.needsUpdate=true;world.add(col);

  /* Turning Torso on the Malmö side */
  const tt=new THREE.Group();
  for(let k=0;k<9;k++){
    const b=new THREE.Mesh(flat(new THREE.BoxGeometry(11,7.4,11)),psMat({color:0xe8eaea}));
    b.position.y=4+k*7.6;b.rotation.y=k*0.19;tt.add(b);
  }
  tt.position.set(-690,0,-150);world.add(tt);

  /* Copenhagen side: a low skyline and two gantry cranes */
  for(let k=0;k<7;k++){
    const h=14+hash2(k,3)*34;
    const b=new THREE.Mesh(flat(new THREE.BoxGeometry(14+hash2(k,7)*16,h,16)),
      psMat({color:0x9aa4ac}));
    b.position.set(700+hash2(k,1)*90,h/2,-190+k*58);world.add(b);
  }
  for(const zz of [150,215]){
    const g=new THREE.Group();
    for(const sg of [-1,1]){
      const l=new THREE.Mesh(flat(new THREE.BoxGeometry(2,42,2)),psMat({color:0x2f6fa8}));
      l.position.set(sg*9,21,0);g.add(l);
    }
    const jib=new THREE.Mesh(flat(new THREE.BoxGeometry(2.4,2.4,64)),psMat({color:0x2f6fa8}));
    jib.position.set(0,42,10);g.add(jib);
    g.position.set(690,0,zz);world.add(g);
  }

  /* shipping */
  for(const sh of [[-260,-210,.5],[180,240,-2.3],[430,-260,1.1]]){
    const g=new THREE.Group();
    const hull=new THREE.Mesh(flat(new THREE.BoxGeometry(11,5,46)),psMat({color:0x7a3d33}));
    hull.position.y=1.6;g.add(hull);
    const dk=new THREE.Mesh(flat(new THREE.BoxGeometry(9,3.4,38)),psMat({color:0x2a3a44}));
    dk.position.y=5.4;g.add(dk);
    const hs=new THREE.Mesh(flat(new THREE.BoxGeometry(9,7,9)),psMat({color:0xe4e6e4}));
    hs.position.set(0,9.6,-13);g.add(hs);
    const fn=new THREE.Mesh(flat(new THREE.CylinderGeometry(1.5,1.7,6,6)),psMat({color:0xc0392b}));
    fn.position.set(0,15,-15);g.add(fn);
    g.position.set(sh[0],0,sh[1]);g.rotation.y=sh[2];world.add(g);
  }

  /* Lillgrund out in the sound */
  for(let k=0;k<9;k++){
    const g=new THREE.Group();
    const H=42;
    const tw=new THREE.Mesh(flat(new THREE.CylinderGeometry(.9,2.0,H,6)),psMat({color:0xe6e9e8}));
    tw.position.y=H/2;g.add(tw);
    const nac=new THREE.Mesh(flat(new THREE.BoxGeometry(1.7,1.7,4.6)),psMat({color:0xdadedd}));
    nac.position.y=H;g.add(nac);
    const rot=new THREE.Group();rot.position.set(0,H,2.5);
    const bl=flat(new THREE.BoxGeometry(1.0,26,.3));
    for(let b=0;b<3;b++){
      const m=new THREE.Mesh(bl,psMat({color:0xeef1f0}));m.position.y=13;
      const h=new THREE.Group();h.rotation.z=b*2.0944;h.add(m);rot.add(h);
    }
    g.add(rot);turbines.push({rot,speed:.3+hash2(k,5)*.2});
    g.position.set(-420+k*108,0,(k%2?1:-1)*(150+hash2(k,9)*90));
    g.rotation.y=1.4;world.add(g);
  }
}
