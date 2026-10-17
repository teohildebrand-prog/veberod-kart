"use strict";
/* ───── Rosengård scenery ───── */
function sceneryRosengard(){
  const K=rosL(),R=ALTS.find(r=>r.id==='bur');
  const RES=[],OCC=[];
  const res=(x,z,r)=>RES.push([x,z,r]);
  const free=(x,z,pad)=>{
    if(latAt(x,z)<HW+pad)return false;
    for(const r of RES)if(Math.hypot(x-r[0],z-r[1])<r[2])return false;
    for(const o of OCC){const dx=x-o.x,dz=z-o.z,lx=dx*o.c-dz*o.s,lz=dx*o.s+dz*o.c;
      if(Math.abs(lx)<o.hl&&Math.abs(lz)<o.hd)return false;}
    return !rosCutAt(x,z);
  };
  const W=(x,z,th,lx,lz)=>[x+lx*Math.cos(th)+lz*Math.sin(th),z-lx*Math.sin(th)+lz*Math.cos(th)];
  const fits=(x,z,th,L,D,pad)=>{
    const nx=Math.max(2,Math.ceil(L/8)),nz=Math.max(2,Math.ceil(D/8));
    for(let a=0;a<=nx;a++)for(let b=0;b<=nz;b++){
      const p=W(x,z,th,(a/nx-.5)*L,(b/nz-.5)*D);if(!free(p[0],p[1],pad))return false;}
    return true;
  };
  const occupy=(x,z,th,L,D,gap)=>OCC.push({x,z,c:Math.cos(th),s:Math.sin(th),hl:L/2+gap,hd:D/2+gap});
  const H=(a,b)=>hash2(a*1.37+3.1,b*0.71-2.3);
  const yawAt=i=>Math.atan2(fx[(i+N)%N],fz[(i+N)%N]);

  /* ── reserve the set pieces before anything else is placed ── */
  res(mainPt(0,HW+20).x,mainPt(0,HW+20).z,32);                              /* the start grandstand */
  for(const [at,sd] of rosStations(stage)){const q=mainPt(at+6,sd*(HW+13));res(q.x,q.z,20);}
  const bus=mainPt(44,-(HW+10));res(bus.x,bus.z,15);
  const isl=mainPt(K.ri,HW+16);res(isl.x,isl.z,19);
  res(K.sqx,K.sqz,K.sqr+16);
  const lib=mainPt(136,HW+30);res(lib.x,lib.z,19);
  if(R)res(K.cx,K.cz,25);
  res(K.mx,K.mz,K.mr+4);
  const sqOpen=[K.mx,K.mz,K.mr+16];                  /* no houses between the square and the hairpin */
  for(const sg of [-1,1]){const q=mainPt(K.mi,sg*(HW+7));res(q.x,q.z,5);}
  if(K.rail){const q=mainPt(K.rail.i,K.rail.l1+6);res(q.x,q.z,12);}

  /* ── shared materials and instanced parts ── */
  const facade=psMat({map:rosWinTex(false)}),tenF=psMat({map:rosWinTex(true)});
  const slabT=[{L:45,F:8,D:12},{L:33,F:4,D:11},{L:18,F:12,D:18}];
  const slabM=slabT.map(t=>rosInst(rosBoxUV(t.L,t.F*2.9,t.D,3,2.9),facade,60,true));
  const tenT=[{L:16,F:5,D:12},{L:22,F:4,D:12},{L:12,F:6,D:12}];
  const tenM=tenT.map(t=>rosInst(rosBoxUV(t.L,t.F*3.3,t.D,2.75,3.3),tenF,90,true));
  const roof=rosInst(rosPrism(),psMat({side:THREE.DoubleSide}),280,true);
  const balc=rosInst(flat(new THREE.BoxGeometry(2.5,1.1,1.25)),psMat({}),4200,true);
  const dishG=flat(new THREE.ConeGeometry(.42,.22,8));dishG.rotateX(-Math.PI/2-0.35);
  const dish=rosInst(dishG,psMat({color:0xeceae4}),900);
  const awn=rosInst(flat(new THREE.BoxGeometry(1,.18,1.6)),psMat({}),300,true);
  const crate=rosInst(flat(new THREE.BoxGeometry(.55,.3,.42)),psMat({color:0x9a7448}),900);
  const fruit=rosInst(flat(new THREE.BoxGeometry(.5,.12,.38)),psMat({}),900,true);
  const trunk=rosInst(flat(new THREE.CylinderGeometry(.22,.32,3,5)).translate(0,1.5,0),psMat({color:0x5e4634}),420);
  const crown=rosInst(flat(new THREE.IcosahedronGeometry(2.6,0)).translate(0,4.6,0),psMat({}),420,true);
  const bush=rosInst(flat(new THREE.IcosahedronGeometry(1,0)),psMat({}),300,true);
  const wheel=rosInst(flat(new THREE.TorusGeometry(.32,.05,3,9)),psMat({color:0x1e2022}),900);
  const frame=rosInst(flat(new THREE.BoxGeometry(1.0,.07,.07)),psMat({}),450,true);
  const bar=rosInst(flat(new THREE.BoxGeometry(.07,.55,.5)),psMat({color:0x2a2c2e}),450);
  const pBody=rosInst(flat(new THREE.BoxGeometry(.56,.78,.32)),psMat({}),260,true);
  const pLegs=rosInst(flat(new THREE.BoxGeometry(.46,.82,.28)),psMat({}),260,true);
  const pHead=rosInst(flat(new THREE.BoxGeometry(.32,.34,.32)),psMat({}),260,true);
  const steel=rosInst(flat(new THREE.BoxGeometry(1,1,1)),psMat({color:0x8d949a}),700);
  const conc=rosInst(flat(new THREE.BoxGeometry(1,1,1)),psMat({color:0xb9b4aa}),120);
  const BAL=[0xd8442c,0xf0a020,0x2f78b8,0x3f9a58,0xf2cf3a,0x8b4fa0,0x2fa7a0,0xe86a4a];
  const WALL=[0xf2ede2,0xe8d9b8,0xdcdcd6,0xf0e1c0,0xe9c9b0,0xe4e8ea];
  const TEN=[0xd9a066,0xe6c27a,0xc8735a,0xefe0c0,0xb8544a,0xe8b8a0,0xd8c8a0,0x9fb0a0];
  const FRU=[0xd8281c,0xf08a1c,0x7ab830,0xf2d43a,0x5a2a6a,0xe8402a,0x3f8a3a];
  const SKIN=[0x8a5a3a,0xc89070,0xe8c0a0,0x5a3a2a,0xb07850,0xf0d0b0];
  const SHIRT=[0xd8442c,0xf2f2ee,0x2f78b8,0x3f9a58,0xf2cf3a,0x1d2a4a,0xe86a9a,0x8b4fa0,0x2fa7a0,0xf08a1c];
  const pick=(A,h)=>A[Math.floor(h*A.length)%A.length];

  const person=(x,z,yaw,h,kid,lift)=>{
    const s=kid?0.72:1,y=meshY(x,z)+(lift||0);
    pLegs.put(x,y+.41*s,z,yaw,s,s,s,pick([0x1d2a4a,0x2a2c30,0x4a5a6a,0x6a5a48,0x1f1f24],H(h,3)));
    pBody.put(x,y+1.2*s,z,yaw,s,s,s,pick(SHIRT,H(h,5)));
    pHead.put(x,y+1.77*s,z,yaw,s,s,s,pick(SKIN,H(h,7)));
  };
  const bike=(x,z,yaw,h)=>{
    const y=meshY(x,z),c=Math.cos(yaw),s=Math.sin(yaw);
    for(const d of [-.55,.55])wheel.put(x+d*c,y+.36,z-d*s,yaw);
    frame.put(x,y+.62,z,yaw,1,1,1,pick(BAL.concat([0x1d2a4a,0xe4e4e0,0x2a2c30]),H(h,2)));
    bar.put(x+.48*c,y+.86,z-.48*s,yaw);
  };
  const tree=(x,z,sc,h)=>{
    const y=meshY(x,z)-.1;
    trunk.put(x,y,z,H(h,1)*6,sc,sc*(.9+H(h,4)*.4),sc);
    crown.put(x,y,z,H(h,2)*6,sc,sc*(.9+H(h,4)*.4),sc,pick([0x5f8f3e,0x6d9a48,0x7aa850,0x4f7f3a,0x86ad4e],H(h,3)));
  };
  /* a market stall: table, crates of fruit, striped awning */
  const stall=(x,z,yaw,h)=>{
    const y=meshY(x,z),P=(lx,lz)=>W(x,z,yaw,lx,lz);
    for(const [a,b] of [[-1.5,-.8],[1.5,-.8],[-1.5,.8],[1.5,.8]]){const p=P(a,b);steel.put(p[0],y+1.15,p[1],yaw,.08,2.3,.08);}
    conc.put(x,y+.8,z,yaw,3.1,.1,1.5);
    for(let k=0;k<5;k++){const p=P(-1.2+k*.6,-.2);crate.put(p[0],y+.97,p[1],yaw);
      fruit.put(p[0],y+1.12,p[1],yaw,1,1,1,pick(FRU,H(h+k,9)));}
    for(let k=0;k<3;k++){const p=P(-1+k,.95);crate.put(p[0],y+.15,p[1],yaw+.1*k);
      fruit.put(p[0],y+.33,p[1],yaw,1,1,1,pick(FRU,H(h-k,11)));}
    awn.put(x,y+2.4,z,yaw,3.5,1,1.25,pick([0xd8442c,0x2f78b8,0x3f9a58,0xf0a020,0x8b4fa0],H(h,13)),0.18);
    const p=P(0,-1.6);person(p[0],p[1],yaw,h+5);
  };
  /* a Rosengård block: concrete slab, coloured balcony stacks, the odd satellite dish */
  const muralM=[0,1,2].map(k=>psMat({map:rosMural(k),side:THREE.DoubleSide}));
  let murals=0;
  const block=(x,z,th,type,h)=>{
    const T=slabT[type],y=meshY(x,z)-.3,Hh=T.F*2.9;
    slabM[type].put(x,y,z,th,1,1,1,pick(WALL,H(h,1)));
    occupy(x,z,th,T.L,T.D,3);
    const bays=Math.round(T.L/3);
    for(const face of [-1,1]){
      for(let b=0;b<bays;b++){
        if(type!==2&&(b%3===1))continue;                       /* stairwells between the stacks */
        const col=pick(BAL,H(h+b,face*3)),lx=(b+.5)*T.L/bays-T.L/2;
        for(let f=1;f<T.F;f++){
          const p=W(x,z,th,lx,face*(T.D/2+.6));
          balc.put(p[0],y+f*2.9+.55,p[1],th,1,1,1,col);
          if(H(h+b*7,f)>0.8){const q=W(x,z,th,lx+.8,face*(T.D/2+1.3));
            dish.put(q[0],y+f*2.9+1.5,q[1],th+(face<0?Math.PI:0));}
        }
      }
      for(let k=0;k<4;k++){const p=W(x,z,th,-T.L/2+3+k*1.1+H(h,k)*T.L*.6,face*(T.D/2+3));
        if(free(p[0],p[1],3.5))bike(p[0],p[1],th+Math.PI/2,h+k*3+face);}
    }
    if(murals<11&&H(h,17)>0.45){                                /* a mosaic on a gable end */
      murals++;const end=H(h,19)>0.5?1:-1,p=W(x,z,th,end*(T.L/2+.08),0);
      const m=new THREE.Mesh(new THREE.PlaneGeometry(T.D-2,Hh-3.5),muralM[Math.floor(H(h,23)*3)%3]);
      m.position.set(p[0],y+Hh/2+.5,p[1]);m.rotation.y=th+end*Math.PI/2;world.add(m);
    }
  };
  /* a Möllan tenement: plastered front, pitched roof, a shop with an awning toward the street */
  const tenement=(x,z,th,type,h,streetSide)=>{
    const T=tenT[type],y=meshY(x,z)-.3,Hh=T.F*3.3;
    tenM[type].put(x,y,z,th,1,1,1,pick(TEN,H(h,1)));
    roof.put(x,y+Hh,z,th,T.L+.2,2.6+H(h,2)*1.6,T.D+.6,H(h,3)>0.5?0x5a4a44:0xa0503a);
    occupy(x,z,th,T.L,T.D,1);
    if(streetSide&&H(h,5)>0.35){
      const p=W(x,z,th,0,streetSide*(T.D/2+.8));
      awn.put(p[0],y+3.2,p[1],th,T.L*.7,1,1,pick([0xd8442c,0x2f78b8,0x3f9a58,0xf0a020,0x8b4fa0,0x2fa7a0],H(h,7)),streetSide*-0.25);
      if(H(h,9)>0.45)for(let k=0;k<4;k++){                       /* crates outside the greengrocer's */
        const q=W(x,z,th,-T.L*.3+k*1.2,streetSide*(T.D/2+1.6));
        crate.put(q[0],y+.45,q[1],th);fruit.put(q[0],y+.62,q[1],th,1,1,1,pick(FRU,H(h+k,11)));
        crate.put(q[0],y+.15,q[1],th);}
      if(H(h,13)>0.5)person(...W(x,z,th,T.L*.3,streetSide*(T.D/2+2.6)),th,h+3);
    }
  };

  /* ── set pieces ── */
  /* the roundabout island: grass, flowers and a stack of coloured cubes */
  {
    const y=meshY(isl.x,isl.z);
    const g=new THREE.Mesh(flat(new THREE.CylinderGeometry(9,9.4,.5,14)),psMat({color:0x6fa04a}));
    g.position.set(isl.x,y+.1,isl.z);world.add(g);
    const kerb=new THREE.Mesh(flat(new THREE.CylinderGeometry(9.5,9.6,.35,14)),psMat({color:0xb9b4aa}));
    kerb.position.set(isl.x,y,isl.z);world.add(kerb);
    for(let k=0;k<26;k++){const a=k/26*6.283;bush.put(isl.x+Math.cos(a)*7.4,y+.5,isl.z+Math.sin(a)*7.4,a,.7,.5,.7,pick([0xd8442c,0xf2cf3a,0xe86a9a,0xf4f0e6,0x8b4fa0],H(k,31)));}
    for(let k=0;k<6;k++){const b=new THREE.Mesh(flat(new THREE.BoxGeometry(2.6-k*.25,2.6-k*.25,2.6-k*.25)),psMat({color:BAL[k%BAL.length]}));
      b.position.set(isl.x,y+1.6+k*2.3,isl.z);b.rotation.set(.2*k,.5*k,.15*k);world.add(b);}
    const st=psMat({map:pixTex(32,32,g2=>{g2.clearRect(0,0,32,32);g2.fillStyle='#1f5aa8';g2.beginPath();g2.arc(16,16,15,0,6.283);g2.fill();
      g2.strokeStyle='#f4f4f0';g2.lineWidth=3;for(let k=0;k<3;k++){const a=k*2.094;g2.beginPath();g2.arc(16,16,8,a,a+1.4);g2.stroke();
        g2.fillStyle='#f4f4f0';g2.fillRect(16+Math.cos(a+1.4)*8-2,16+Math.sin(a+1.4)*8-2,4,4);}}),unlit:true,transparent:true,alphaTest:.5,side:THREE.DoubleSide});
    for(const i of [K.ri-34,K.ri-26]){const o=HW+5.2,x=sx[(i+N)%N]+rx[(i+N)%N]*o,z=sz[(i+N)%N]+rz[(i+N)%N]*o,yy=meshY(x,z);
      steel.put(x,yy+1.3,z,0,.12,2.6,.12);
      const pl=new THREE.Mesh(new THREE.PlaneGeometry(1.4,1.4),st);pl.position.set(x,yy+3,z);pl.rotation.y=yawAt(i)+Math.PI;world.add(pl);}
  }
  /* Rosengård centrum: the low mall, the market stalls on the square, the greengrocer, the library */
  {
    const i=168,yaw=yawAt(i),th=yaw+Math.PI/2;
    const mp=mainPt(i,HW+38+K.sqr+8),y=meshY(mp.x,mp.z);
    const mall=new THREE.Mesh(flat(new THREE.BoxGeometry(54,7.5,16)),psMat({color:0xe8e0d0}));
    mall.position.set(mp.x,y+3.75,mp.z);mall.rotation.y=th;world.add(mall);
    const band=new THREE.Mesh(flat(new THREE.BoxGeometry(54.4,1.4,16.4)),psMat({color:0x2fa7a0}));
    band.position.set(mp.x,y+6.8,mp.z);band.rotation.y=th;world.add(band);
    const gl=new THREE.Mesh(flat(new THREE.BoxGeometry(50,3,16.2)),psMat({color:0x3a4c5c}));
    gl.position.set(mp.x,y+1.8,mp.z);gl.rotation.y=th;world.add(gl);
    const sg=new THREE.Mesh(new THREE.PlaneGeometry(22,2.2),psMat({map:rosTextTex(128,16,'#f4f0e6','#1f5aa8','ROSENGÅRD CENTRUM',8),unlit:true}));
    const sp=W(mp.x,mp.z,th,0,8.25);sg.position.set(sp[0],y+5.4,sp[1]);sg.rotation.y=th;world.add(sg);
    /* the side facing the square is the one toward the road: local +z points to -right, toward the road */
    for(let r=0;r<2;r++)for(let c=0;c<4;c++){
      const p=W(K.sqx,K.sqz,th,-9+c*6,-5+r*8);stall(p[0],p[1],th+(r?Math.PI:0),c*7+r*31);
    }
    for(let k=0;k<14;k++){const a=H(k,41)*6.283,d=4+H(k,43)*14;person(K.sqx+Math.cos(a)*d,K.sqz+Math.sin(a)*d,H(k,47)*6.3,k*13+5,H(k,49)>0.7);}
    for(const [lx,lz] of [[-16,-12],[16,-12],[-16,12],[16,12],[0,-14]])tree(...W(K.sqx,K.sqz,th,lx,lz),1.1,lx*3+lz);
    for(let k=0;k<10;k++)bike(...W(K.sqx,K.sqz,th,-22+k*1.1,12.5),th+Math.PI/2,k+77);
    /* the library: a glass ground floor and a white box on top */
    const ly=meshY(lib.x,lib.z),lth=yawAt(136)+Math.PI/2;
    const lb=new THREE.Mesh(flat(new THREE.BoxGeometry(26,3.6,14)),psMat({color:0x3e5a70}));lb.position.set(lib.x,ly+1.8,lib.z);lb.rotation.y=lth;world.add(lb);
    const lu=new THREE.Mesh(flat(new THREE.BoxGeometry(27,4.4,15)),psMat({color:0xf2efe8}));lu.position.set(lib.x,ly+5.8,lib.z);lu.rotation.y=lth;world.add(lu);
    const ls=new THREE.Mesh(new THREE.PlaneGeometry(13,1.8),psMat({map:rosTextTex(96,14,'#f2efe8','#c8321f','BIBLIOTEK',8),unlit:true}));
    const lp=W(lib.x,lib.z,lth,0,7.56);ls.position.set(lp[0],ly+6,lp[1]);ls.rotation.y=lth;world.add(ls);
    for(let k=0;k<8;k++)bike(...W(lib.x,lib.z,lth,-10+k*1.1,10),lth+Math.PI/2,k+91);
    occupy(lib.x,lib.z,lth,27,15,2);occupy(mp.x,mp.z,th,54,16,2);
  }
  /* the bus stop on the start straight, with a green city bus waiting */
  {
    const i=44,yaw=yawAt(i),sh=mainPt(i,-(HW+12.5)),y=meshY(sh.x,sh.z);
    const glass=psMat({color:0x9fc4d8,transparent:true,opacity:.55,depthWrite:false,side:THREE.DoubleSide});
    const back=new THREE.Mesh(new THREE.PlaneGeometry(6,2.4),glass);
    const bp=mainPt(i,-(HW+13.6));back.position.set(bp.x,y+1.3,bp.z);back.rotation.y=yaw+Math.PI/2;world.add(back);
    const rf=new THREE.Mesh(flat(new THREE.BoxGeometry(2.6,.2,6.4)),psMat({color:0x2a2c30}));rf.position.set(sh.x,y+2.6,sh.z);rf.rotation.y=yaw;world.add(rf);
    for(const d of [-3,3]){const p=mainPt(i+d/SEG,-(HW+13.6));steel.put(p.x,y+1.3,p.z,0,.1,2.6,.1);}
    for(let k=0;k<3;k++){const p=mainPt(i-2+k*1.6,-(HW+12));person(p.x,p.z,yaw-Math.PI/2,k+300,k===1);}
    const hs=mainPt(i+5,-(HW+10.2));steel.put(hs.x,y+1.5,hs.z,0,.1,3,.1);
    const hp=new THREE.Mesh(new THREE.PlaneGeometry(1,1),psMat({map:pixTex(16,16,g=>{g.fillStyle='#f2cf3a';g.fillRect(0,0,16,16);
      g.fillStyle='#2f8a3a';g.fillRect(1,1,14,14);g.fillStyle='#f4f4f0';g.fillRect(4,3,2,10);g.fillRect(10,3,2,10);g.fillRect(4,7,8,2);}),unlit:true,side:THREE.DoubleSide}));
    hp.position.set(hs.x,y+3.3,hs.z);hp.rotation.y=yaw+Math.PI/2;world.add(hp);
    const bc=mainPt(i+3,-(HW+8.2)),by=meshY(bc.x,bc.z);
    const bus=new THREE.Group();
    const bb=new THREE.Mesh(flat(new THREE.BoxGeometry(2.6,2.9,17)),psMat({color:0x58a83c}));bb.position.y=1.85;bus.add(bb);
    const win=new THREE.Mesh(flat(new THREE.BoxGeometry(2.66,1.1,15.6)),psMat({color:0x26323c}));win.position.set(0,2.4,-.3);bus.add(win);
    const rfb=new THREE.Mesh(flat(new THREE.BoxGeometry(2.4,.3,14)),psMat({color:0xe4e8e4}));rfb.position.y=3.45;bus.add(rfb);
    const ds=new THREE.Mesh(new THREE.PlaneGeometry(2,.4),psMat({map:rosTextTex(64,12,'#141414','#f0a020','ROSENGÅRD',6),unlit:true}));
    ds.position.set(0,3.05,8.52);bus.add(ds);
    for(const wz of [-6,-1,6])for(const wx of [-1.3,1.3]){const w=new THREE.Mesh(flat(new THREE.CylinderGeometry(.5,.5,.3,8)),psMat({color:0x1e2022}));
      w.rotation.z=Math.PI/2;w.position.set(wx,.5,wz);bus.add(w);}
    bus.position.set(bc.x,by,bc.z);bus.rotation.y=yaw;world.add(bus);
  }
  /* the football cage on the shortcut: artificial turf, goals, a fence all round with a gate each side */
  if(R){
    const th=K.cyaw,cx=K.cx,cz=K.cz,LX=16,LZ=11;
    const laneY=(x,z)=>{const j=nearestAltAll(R,x,z),l=Math.abs(altLat(R,j,x,z));return l<R.hw+2.5?R.Y[j]:-1e9;};
    const pitchT=pixTex(128,88,g=>{
      for(let k=0;k<8;k++){g.fillStyle=k%2?'#3f9a48':'#47a650';g.fillRect(k*16,0,16,88);}
      g.strokeStyle='#f4f4f0';g.lineWidth=2;g.strokeRect(3,3,122,82);
      g.beginPath();g.moveTo(64,3);g.lineTo(64,85);g.stroke();
      g.beginPath();g.arc(64,44,12,0,6.283);g.stroke();
      g.strokeRect(3,26,14,36);g.strokeRect(111,26,14,36);
      g.fillStyle='#f4f4f0';g.fillRect(62,42,4,4);
    });
    const pg=new THREE.PlaneGeometry(2*LX,2*LZ,12,8);pg.rotateX(-Math.PI/2);
    const pp=pg.attributes.position;
    for(let k=0;k<pp.count;k++){const w=W(cx,cz,th,pp.getX(k),pp.getZ(k));
      pp.setXYZ(k,w[0],Math.max(meshY(w[0],w[1])+.08,laneY(w[0],w[1])+.07),w[1]);}
    pg.computeVertexNormals();
    const pm=psMat({map:pitchT});pm.polygonOffset=true;pm.polygonOffsetFactor=-4;pm.polygonOffsetUnits=-4;
    world.add(new THREE.Mesh(pg,pm));
    const netT=pixTex(16,16,g=>{g.clearRect(0,0,16,16);g.fillStyle='#c9cdd0';
      for(let k=0;k<16;k+=4){g.fillRect(k,0,1,16);g.fillRect(0,k,16,1);}});
    netT.wrapS=netT.wrapT=THREE.RepeatWrapping;
    const net=psMat({map:netT,transparent:true,alphaTest:.5,side:THREE.DoubleSide});
    const gate=R.hw+1.8,FH=4;
    const panel=(ax,az,bx,bz)=>{                           /* a fence run between two local points */
      const a=W(cx,cz,th,ax,az),b=W(cx,cz,th,bx,bz),L=Math.hypot(b[0]-a[0],b[1]-a[1]);if(L<.5)return;
      const gy=Math.min(meshY(a[0],a[1]),meshY(b[0],b[1]));
      const g=new THREE.PlaneGeometry(L,FH);const uv=g.attributes.uv;
      for(let k=0;k<uv.count;k++)uv.setXY(k,uv.getX(k)*L/1.2,uv.getY(k)*FH/1.2);
      const m=new THREE.Mesh(g,net);m.position.set((a[0]+b[0])/2,gy+FH/2,(a[1]+b[1])/2);
      m.rotation.y=Math.atan2(b[0]-a[0],b[1]-a[1])+Math.PI/2;world.add(m);
      const n=Math.ceil(L/3.2);
      for(let k=0;k<=n;k++){const x=a[0]+(b[0]-a[0])*k/n,z=a[1]+(b[1]-a[1])*k/n;steel.put(x,meshY(x,z)+FH/2,z,0,.12,FH,.12);}
    };
    for(const sz_ of [-LZ,LZ]){panel(-LX,sz_,-gate,sz_);panel(gate,sz_,LX,sz_);}
    for(const sx_ of [-LX,LX])panel(sx_,-LZ,sx_,LZ);
    /* gate posts painted club colours */
    for(const sz_ of [-LZ,LZ])for(const sx_ of [-gate,gate]){const p=W(cx,cz,th,sx_,sz_);
      const gp=new THREE.Mesh(flat(new THREE.BoxGeometry(.3,FH+.6,.3)),psMat({color:0xd8442c}));gp.position.set(p[0],meshY(p[0],p[1])+(FH+.6)/2,p[1]);world.add(gp);}
    /* goals at the two ends, kids playing either side of the lane */
    const gm=psMat({color:0xf4f4f0});
    for(const e of [-1,1]){
      const gx=e*(LX-.8),gy=meshY(...W(cx,cz,th,gx,0));
      for(const d of [-1.6,1.6]){const p=W(cx,cz,th,gx,d);const m=new THREE.Mesh(flat(new THREE.BoxGeometry(.12,2,.12)),gm);m.position.set(p[0],gy+1.1,p[1]);world.add(m);}
      const cb=W(cx,cz,th,gx,0),cm=new THREE.Mesh(flat(new THREE.BoxGeometry(.12,.12,3.3)),gm);cm.position.set(cb[0],gy+2.1,cb[1]);cm.rotation.y=th;world.add(cm);
      for(let k=0;k<3;k++){const lx=e*(R.hw+3+k*3.3),lz=(H(k,e)-.5)*14;const p=W(cx,cz,th,lx,lz);
        person(p[0],p[1],th+(e>0?-Math.PI/2:Math.PI/2)+H(k,e*5)-.5,k*17+e*3+500,true,Math.max(0,laneY(p[0],p[1])-meshY(p[0],p[1])));}
    }
    res(cx,cz,26);occupy(cx,cz,th,2*LX,2*LZ,3);
    /* the lane outside the cage: worn grass over the park strip */
    const grassT=pixTex(32,32,g=>{g.fillStyle='#5f9a40';g.fillRect(0,0,32,32);
      for(let k=0;k<260;k++){g.fillStyle=Math.random()>.5?'#76ae4c':'#4c8034';g.fillRect((Math.random()*32)|0,(Math.random()*32)|0,1,2);}
      g.fillStyle='rgba(150,120,80,.35)';g.fillRect(9,0,4,32);g.fillRect(19,0,4,32);});
    grassT.wrapS=grassT.wrapT=THREE.RepeatWrapping;
    const gmm=psMat({map:grassT});gmm.polygonOffset=true;gmm.polygonOffsetFactor=-3;gmm.polygonOffsetUnits=-3;
    const jIn=Math.max(8,K.cj-Math.round(LZ/SEG)-1),jOut=Math.min(R.n-9,K.cj+Math.round(LZ/SEG)+1);
    world.add(new THREE.Mesh(altRibbon(R,-R.hw,R.hw,.05,6,8,jIn),gmm));
    world.add(new THREE.Mesh(altRibbon(R,-R.hw,R.hw,.05,6,jOut,R.n-9),gmm));
    /* two blocks either side of the park strip, trees along it, the outdoor gym */
    const jp=Math.round(0.72*(R.n-1)),pth=Math.atan2(R.FX[jp],R.FZ[jp])+Math.PI/2;
    for(const sg of [-1,1]){const q=lanePt(R,0.72,sg*(R.hw+14));
      if(fits(q.x,q.z,pth,45,12,4))block(q.x,q.z,pth,0,sg*91+7);}
    for(let j=jOut+3;j<R.n-14;j+=5)for(const sg of [-1,1]){
      const q=lanePt(R,j/(R.n-1),sg*(R.hw+4.5+H(j,sg)*2));if(free(q.x,q.z,5))tree(q.x,q.z,.9+H(j,sg*3)*.4,j*3+sg);}
    for(let j=12;j<jIn-3;j+=6)for(const sg of [-1,1]){
      const q=lanePt(R,j/(R.n-1),sg*(R.hw+5+H(j,sg)*2));if(free(q.x,q.z,5))tree(q.x,q.z,.9+H(j,sg*5)*.4,j*5+sg);}
    const gq=lanePt(R,0.6,-(R.hw+9)),gth=gq.yaw,gy=meshY(gq.x,gq.z);
    const mat=new THREE.Mesh(flat(new THREE.BoxGeometry(12,.12,7)),psMat({color:0x8a3a30}));mat.position.set(gq.x,gy+.06,gq.z);mat.rotation.y=gth;world.add(mat);
    for(let k=0;k<3;k++){const lx=-4+k*4;
      for(const d of [-.9,.9]){const p=W(gq.x,gq.z,gth,lx+d,0);steel.put(p[0],gy+1.25,p[1],0,.1,2.5,.1);}
      const p=W(gq.x,gq.z,gth,lx,0);steel.put(p[0],gy+2.45,p[1],gth,1.9,.07,.07);
      if(k===1)person(p[0],p[1],gth,701,false,.55);}
    for(const d of [-.4,.4]){const p=W(gq.x,gq.z,gth,0,2.5+d);steel.put(p[0],gy+1.0,p[1],gth+Math.PI/2,2.2,.07,.07);}
    person(...W(gq.x,gq.z,gth,3,2),gth+2,707);person(...W(gq.x,gq.z,gth,-3,2.6),gth-1,709);
    res(gq.x,gq.z,9);
  }
  /* the railway in its cutting under the southern ramp, and the cycle underpass under the other */
  const portal=psMat({color:0xa8a49a,side:THREE.DoubleSide});
  for(const C of K.cuts){
    const J=C.J,isRail=C===K.rail,half=C.half;
    for(const sg of [-1,1]){                                         /* the bridge's parapets and side walls */
      sweep(J.at-8,J.at+3,sg*(HW+3.9),.1,sg*(HW+3.9),1.15,portal);
      sweep(J.at-8,J.at+3,sg*(HW+3.7),.2,sg*(HW+3.7),-9,portal);
    }
    const along=(l,d)=>[C.x+C.rx*l+C.fx*d,C.z+C.rz*l+C.fz*d];
    const ty=Math.atan2(C.rx,C.rz);
    if(isRail){
      const offRoad=l=>Math.abs(l)>HW+9;
      for(let l=C.l0+2;l<C.l1-2;l+=1.6)for(const tr of [-2.4,2.4]){       /* sleepers and rails */
        if(!offRoad(l))continue;const p=along(l,tr);conc.put(p[0],meshY(p[0],p[1])+.08,p[1],ty,2.6,.14,.3);}
      for(const tr of [-2.4,2.4])for(const d of [-.72,.72]){
        for(let l=C.l0+2;l<C.l1-4;l+=8){if(!offRoad(l)||!offRoad(l+8))continue;const p=along(l+4,tr+d);steel.put(p[0],meshY(p[0],p[1])+.25,p[1],ty,.1,.14,8);}}
      for(let l=C.l0+12;l<C.l1-6;l+=24){                                 /* catenary masts */
        if(!offRoad(l))continue;
        const p=along(l,-half+.4),q=along(l,half-.4),y=meshY(p[0],p[1]);
        steel.put(p[0],y+3.6,p[1],0,.2,7.2,.2);steel.put(q[0],meshY(q[0],q[1])+3.6,q[1],0,.2,7.2,.2);
        const m=along(l,0);steel.put(m[0],y+7,m[1],ty,2*half-.8,.15,.15);}
      for(const sg of [1]){                                              /* the tunnel mouth at the inside end */
        const p=along(C.l1+1.5,0),y=meshY(p[0],p[1]);
        const w=new THREE.Mesh(flat(new THREE.BoxGeometry(2*half+6,9,1.5)),portal);w.position.set(p[0],y+3.5,p[1]);w.rotation.y=ty;world.add(w);
        const hole=new THREE.Mesh(flat(new THREE.BoxGeometry(9,5.5,.4)),psMat({color:0x15171a}));
        const h2=along(C.l1+.6,0);hole.position.set(h2[0],y+2.75,h2[1]);hole.rotation.y=ty;world.add(hole);}
    }else{
      for(let k=0;k<5;k++){const l=C.l0+12+k*(C.l1-C.l0-24)/4,p=along(l,(k%2?-1:1)*1.0);  /* cyclists */
        const yy=meshY(p[0],p[1]);bike(p[0],p[1],ty+(k%2?Math.PI:0)-Math.PI/2,k+800);
        person(p[0],p[1],ty+(k%2?Math.PI:0),k+810,k===2,.15);}
      for(const sg of [-1,1])for(let l=C.l0;l<C.l1;l+=7){const p=along(l,sg*(half+2.5));
        if(free(p[0],p[1],7))bush.put(p[0],meshY(p[0],p[1])+.4,p[1],l,1,.7,1,0x4f7f3a);}
    }
  }
  /* Möllevångstorget: rows of market stalls round the statue, trees round the edge */
  {
    const y=meshY(K.mx,K.mz),th=0.2;
    const pl=new THREE.Mesh(flat(new THREE.BoxGeometry(3.6,3,3.6)),psMat({color:0x8a8478}));pl.position.set(K.mx,y+1.5,K.mz);world.add(pl);
    const br=psMat({color:0x3a4a3a});                                   /* the bronze workers on the plinth */
    for(let k=0;k<5;k++){const a=k/5*6.283,f=new THREE.Mesh(flat(new THREE.BoxGeometry(.7,2.2+H(k,3)*.6,.6)),br);
      f.position.set(K.mx+Math.cos(a)*.9,y+4.1,K.mz+Math.sin(a)*.9);f.rotation.set(H(k,5)*.3-.15,a,H(k,7)*.3-.15);world.add(f);}
    const rows=Math.max(1,Math.floor((K.mr-6)/6.5));
    for(let r=-rows;r<=rows;r++)for(let c=-3;c<=3;c++){
      const lx=c*4.2,lz=r*6.5;if(Math.abs(r)<1&&Math.abs(c)<2)continue;
      if(Math.hypot(lx,lz)>K.mr-3)continue;
      const p=W(K.mx,K.mz,th,lx,lz);stall(p[0],p[1],th+(r%2?Math.PI:0),r*11+c*3+200);
    }
    for(let k=0;k<26;k++){const a=H(k,51)*6.283,d=4+H(k,53)*(K.mr-4);
      const x=K.mx+Math.cos(a)*d,z=K.mz+Math.sin(a)*d;person(x,z,H(k,57)*6.3,k*7+400,H(k,59)>0.75);}
    const nt=Math.round(2*Math.PI*(K.mr+1)/8);
    for(let k=0;k<nt;k++){const a=k/nt*6.283,x=K.mx+Math.cos(a)*(K.mr+1),z=K.mz+Math.sin(a)*(K.mr+1);
      if(latAt(x,z)>HW+6)tree(x,z,1.15,k+600);
      if(k%3===0){const bx=K.mx+Math.cos(a+.2)*(K.mr-1.5),bz=K.mz+Math.sin(a+.2)*(K.mr-1.5);bike(bx,bz,a,k+650);bike(bx+.6,bz+.6,a,k+660);}}
  }
  /* the zebra crossing on the way into Möllan */
  {
    const zm=psMat({color:0xf2f2ee});zm.polygonOffset=true;zm.polygonOffsetFactor=-3;zm.polygonOffsetUnits=-3;
    for(let l=-HW+1.2;l<HW-.8;l+=1.6){const q=mainPt(K.mi,l);const s=new THREE.Mesh(new THREE.PlaneGeometry(.8,4).rotateX(-Math.PI/2),zm);
      s.position.set(q.x,q.y+.05,q.z);s.rotation.y=q.yaw;world.add(s);}
    const signT=pixTex(32,32,g=>{g.fillStyle='#1f5aa8';g.fillRect(0,0,32,32);g.fillStyle='#f4f4f0';g.beginPath();g.moveTo(16,4);g.lineTo(29,27);g.lineTo(3,27);g.closePath();g.fill();
      g.fillStyle='#141414';g.fillRect(14,9,4,4);g.fillRect(13,13,6,7);g.fillRect(12,20,3,5);g.fillRect(17,20,3,5);g.fillStyle='#141414';g.fillRect(6,25,20,1);});
    for(const sg of [-1,1]){const q=mainPt(K.mi+sg*3,sg*(HW+4.6)),y=meshY(q.x,q.z);steel.put(q.x,y+1.5,q.z,0,.1,3,.1);
      const pl=new THREE.Mesh(new THREE.PlaneGeometry(1.2,1.2),psMat({map:signT,unlit:true,side:THREE.DoubleSide}));
      pl.position.set(q.x,y+3.4,q.z);pl.rotation.y=q.yaw;world.add(pl);}
  }
  /* Turning Torso on the skyline, far off to the north-west */
  {
    const tx=-330,tz=-320,y=meshY(tx,tz),tm=psMat({color:0xeef0f2});
    for(let k=0;k<9;k++){const b=new THREE.Mesh(flat(new THREE.BoxGeometry(16,12.6,16)),tm);
      b.position.set(tx,y+6.6+k*13,tz);b.rotation.y=k*0.17;world.add(b);}
    steel.put(tx,y+126,tz,0,.6,14,.6);
  }

  /* ── the blocks of Rosengård: along the streets, then filling in between ── */
  RES.push(sqOpen);
  const moll=(x,z)=>x<-55&&z>-5;
  let nb=0;
  for(let i=0;i<N;i+=8)for(const side of [-1,1])for(const o of [HW+24,HW+52,HW+84]){
    const h=i*3+side*7+o;
    const type=H(h,1)<0.55?0:(H(h,1)<0.8?1:2),T=slabT[type];
    const q=mainPt(i,side*(o+T.D/2));if(moll(q.x,q.z))continue;
    const th=yawAt(i)+Math.PI/2+(H(h,2)>0.72?Math.PI/2:0);
    if(fits(q.x,q.z,th,T.L,T.D,13)){block(q.x,q.z,th,type,h);nb++;}
  }
  for(let gx=-60;gx<=210;gx+=22)for(let gz=-118;gz<=130;gz+=22){
    const h=gx*.37+gz*1.3,x=gx+(H(h,3)-.5)*10,z=gz+(H(h,4)-.5)*10;
    if(moll(x,z))continue;
    const type=H(h,1)<0.5?0:(H(h,1)<0.8?1:2),T=slabT[type];
    const i=nearestGlobal(x,z),th=yawAt(i)+Math.PI/2+(H(h,2)>0.6?Math.PI/2:0);
    if(fits(x,z,th,T.L,T.D,14)){block(x,z,th,type,h);nb++;}
  }
  /* ── Möllan's tenements: in rows along the streets, then in the blocks behind ── */
  for(let i=380;i<720;i+=3)for(const side of [-1,1]){
    const h=i*5+side*3,type=Math.floor(H(h,1)*3)%3,T=tenT[type];
    const q=mainPt(i,side*(HW+11+T.D/2));if(!moll(q.x,q.z))continue;
    const th=yawAt(i)+Math.PI/2;
    if(fits(q.x,q.z,th,T.L,T.D,9))tenement(q.x,q.z,th,type,h,side);
  }
  for(let gx=-300;gx<=-50;gx+=17)for(let gz=-10;gz<=260;gz+=17){
    const h=gx*1.1+gz*.53,type=Math.floor(H(h,1)*3)%3,T=tenT[type];
    const x=gx+(H(h,3)-.5)*5,z=gz+(H(h,4)-.5)*5;if(!moll(x,z))continue;
    const i=nearestGlobal(x,z),th=yawAt(i)+Math.PI/2;
    if(fits(x,z,th,T.L,T.D,22))tenement(x,z,th,type,h,0);
  }
  RES.splice(RES.indexOf(sqOpen),1);
  /* ── parks between the blocks: trees, bushes, people out in the evening sun, bikes everywhere ── */
  let nt=0,guard=0;
  while(nt<300&&guard++<5000){
    const x=-320+hash2(guard,1.7)*640,z=-300+hash2(guard,4.1)*600;
    if(!free(x,z,7))continue;
    const cl=hash2(Math.floor(x/60),Math.floor(z/60));
    if(cl<0.35&&hash2(guard,9.3)>0.25)continue;                 /* trees come in clumps */
    tree(x,z,.8+hash2(guard,2.2)*.6,guard);nt++;
    if(hash2(guard,5.5)>0.7){const bx=x+3,bz=z+2;if(free(bx,bz,6))bush.put(bx,meshY(bx,bz)+.3,bz,guard,1.2,.8,1.2,pick([0x4f7f3a,0x5f8f40,0x6a9a48],hash2(guard,6.1)));}
  }
  let np=0;guard=0;
  while(np<36&&guard++<900){
    const x=-260+hash2(guard,7.7)*520,z=-200+hash2(guard,8.8)*400;
    if(!free(x,z,7))continue;
    person(x,z,hash2(guard,1.1)*6.3,guard+900,hash2(guard,2.3)>0.6);np++;
    if(hash2(guard,3.3)>0.6){const b=x+1.2;if(free(b,z,6))bike(b,z,hash2(guard,4.4)*6.3,guard);}
  }
  [slabM[0],slabM[1],slabM[2],tenM[0],tenM[1],tenM[2],roof,balc,dish,awn,crate,fruit,trunk,crown,bush,
   wheel,frame,bar,pBody,pLegs,pHead,steel,conc].forEach(m=>m.done());
  /* awnings take their own colour; the prisms read as tiles */
  void nb;
}
