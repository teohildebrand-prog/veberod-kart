"use strict";
/* ───────── Ängelholms UFO-skog ───────── */
/* Alien Rally Asteroid's counterpart: a rocket opens the strange-triangle hallway, and a flying saucer's beam lifts and stuns */
ROADTEX.angelholm=()=>pixTex(64,64,g=>{            /* sandy forest track strewn with pine needles */
  g.fillStyle='#8c7a58';g.fillRect(0,0,64,64);
  for(let i=0;i<700;i++){
    g.fillStyle=Math.random()>.5?'rgba(196,178,134,.5)':'rgba(92,76,52,.5)';
    g.fillRect((Math.random()*64)|0,(Math.random()*64)|0,1,1);
  }
  g.fillStyle='rgba(110,92,62,.40)';for(const x of [12,19,43,50])g.fillRect(x,0,3,64);
  g.fillStyle='rgba(74,50,30,.75)';                  /* needles */
  for(let i=0;i<46;i++){const x=(Math.random()*62)|0,y=(Math.random()*62)|0;
    if(Math.random()>.5)g.fillRect(x,y,3,1);else g.fillRect(x,y,1,3);}
});
VERGEC.angelholm=['#3c4a30','#55603c','#2a3322'];
GROUND.ufoskog={cell:44,stripe:0.55,verge:0x4c5034,
  cols:[0x2c4a2c,0x34502e,0x3a4a2a,0x4c4a32,0x283e2e,0x564e38,0x32462a,0x3e3a48]};
SURF.bunker={top:o=>0.97,grip:o=>0.92,fuel:1.0,name:'BETONG'};
SFX.bunker={dust:[.55,.58,.55],noise:{f:560,g:.022}};
/* the edge: low pine logs on stakes, the way a forest track is fenced */
EDGES.angelholm=st=>{
  const step=6,cnt=Math.ceil(N/step)*2;
  const logG=flat(new THREE.CylinderGeometry(.24,.26,SEG*step+.4,5));logG.rotateX(Math.PI/2);
  const logs=new THREE.InstancedMesh(logG,psMat({color:0x6a5038}),cnt);
  const stakes=new THREE.InstancedMesh(flat(new THREE.BoxGeometry(.2,1.0,.2)),psMat({color:0x4a3a2a}),cnt);
  const m4=new THREE.Matrix4(),q=new THREE.Quaternion(),e=new THREE.Euler(),
        p=new THREE.Vector3(),one=new THREE.Vector3(1,1,1);
  let a=0,b=0;
  for(let i=0;i<N;i+=step)for(const side of [-1,1]){
    const o=side*(HW+4.3),x=sx[i]+rx[i]*o,z=sz[i]+rz[i]*o;
    if(nearAlt(x,z,2.6))continue;
    e.set(0,Math.atan2(fx[i],fz[i]),0);q.setFromEuler(e);
    p.set(x,meshY(x,z)+.45,z);m4.compose(p,q,one);stakes.setMatrixAt(b++,m4);
    const j=(i+3)%N,x2=sx[j]+rx[j]*o,z2=sz[j]+rz[j]*o;
    if(nearAlt(x2,z2,2.6))continue;
    e.set(0,Math.atan2(fx[j],fz[j]),0);q.setFromEuler(e);
    p.set(x2,meshY(x2,z2)+.62,z2);m4.compose(p,q,one);logs.setMatrixAt(a++,m4);
  }
  logs.count=a;stakes.count=b;logs.instanceMatrix.needsUpdate=stakes.instanceMatrix.needsUpdate=true;
  world.add(logs);world.add(stakes);
};
/* where things stand: the memorial clearing and the saucer's flight path, in main-road samples */
const ANG_MEM={i:396,side:-1,off:15};
const ANG_UFO={i0:140,len:70,period:12,lats:[-4.2,4.2,0]};

STAGES.push({ id:'angelholm', group:'vild', name:'ÄNGELHOLM', sub:'UFO-SKOGEN',
  order:17, tag:'Mörk skog där ett flygande tefat svävar över vägen. Strålen lyfter och snurrar den som kommer under.',
  view:{i:125,lat:0,h:2,to:{i:155,lat:0,h:9},fov:60,t:1.1},
  hw:8.4,
  bars:[0.70,0.70,0.55], laps:3,
  blurb:'Sandy tracks through the tall pines of Kronoskogen at dusk, where a man met a flying saucer in 1946 and the landing marks are still in the moss. A strange triangle marks a sealed bunker hallway behind the dunes: a spettekaka slides its door open. A saucer patrols the forest road and its green beam lifts you off the sand and leaves you wobbling.',
  role:'Lång skogsväg i skymningen, ett hemligt bunkerhål och ett tefat som inte vill vara ifred.',
  sky:[0x4a7a62,0x2a1446], fog:[0x3c5550,42,300], amb:0x4a4a6c, dif:0xa8c0e8,
  road:'angelholm', verge:'angelholm', edge:'angelholm', ground:'ufoskog', paint:false,
  sfxRoad:'sand', sfxOff:'grass', moon:true,
  jumpSpec:[{h:3.6,drop:2.6,up:12,dn:7,rec:18},{h:2.8,drop:2.0,up:10,dn:6,rec:15}],
  ctrl:[[   0, 2,-160],[  84, 2,-162],[ 150, 4,-140],[ 186, 7, -90],[ 172,10, -36],
        [ 206,12,  20],[ 198,11,  84],[ 150, 9, 116],[  98, 7, 100],[  76, 6,  52],
        [  20, 8,  34],[ -36,10,  76],[-104, 8, 118],[-176, 6, 116],[-232, 4,  76],
        [-272, 3,  16],[-272, 3, -50],[-238, 2,-106],[-170, 2,-150],[ -90, 2,-164]],
  /* Skälderviken lies west, below the dune ridge */
  shore:(x,z)=>-20*smooth(0,44,-(x+316)),
  land:(x,z,out)=>{if(-(x+316)>18)out.setHex(0xb8ab88);},
  stations:[[0.30,-1],[0.88,1]],
  routes:[
    {id:'bunker',name:'BUNKERGÅNGEN',a:468,b:600,hw:3.8,side:1,lead:9,leadLat:14,
     mid:[[0.5,8]],surface:'bunker',risk:0.25,hidden:true,shoot:true,
     blockMesh:(R,j)=>angDoor(R,j),blockAnim:(B,d)=>{const D=B.mesh.userData.door;if(D)D.position.x=d*(2*B.R.hw+.8);},
     blurb:'A narrow concrete hallway through the dune ridge, with a strange green triangle over the steel door. Shoot the door and it slides aside.'}],
  stamps:[
    {id:'ang1',dish:'Kantarellsmörgås',ini:'K',kind:'intro',route:'main',i:398,lat:-6.2,
     hint:'Vid minnesplatsen, där tefatet landade.',
     story:'Kronoskogen is chanterelle country: in August the golden caps come up in the moss between the pines. Fried in butter with a little cream, salt and pepper and heaped on toasted bread, they are the forest\'s own open sandwich, eaten on a stump with the sea breathing behind the trees.'},
    {id:'ang2',dish:'Stenbitsrom',ini:'S',kind:'route',route:'bunker',f:0.5,lat:0,
     hint:'Inne i bunkergången bakom triangeln. Dörren är stängd: en spettekaka?',
     story:'In late winter the lumpfish come into Skälderviken to spawn and the boats bring them in. The roe is salted, rinsed and served bright and cold on a blini or a piece of toast with sour cream and chopped red onion: little orange pearls that pop like the lights in the forest.'},
    {id:'ang3',dish:'Gravlax',ini:'G',kind:'air',route:'main',jump:0,after:5,lat:0,air:4.6,
     hint:'Högt i luften över det första hoppet.',
     story:'The Rönne å runs through Ängelholm to the bay and once ran thick with salmon. Gravlax is the old fishers\' trick: a side of salmon buried in salt, sugar and plenty of dill for a couple of days, sliced thin and eaten with mustard sauce and new potatoes.'}],
  hazards:H=>hazardsAngelholm(H), scenery:()=>sceneryAngelholm()
});
/** the steel door with the triangle, built at local origin and turned along the lane */
function angDoor(R,j){
  const g=new THREE.Group(),turn=new THREE.Group();
  turn.rotation.y=Math.atan2(R.FX[j],R.FZ[j]);g.add(turn);
  const door=new THREE.Group();turn.add(door);
  const w=2*R.hw+.6;
  const panel=new THREE.Mesh(flat(new THREE.BoxGeometry(w,4.4,.35)),psMat({color:0x46524c}));
  panel.position.y=2.2;door.add(panel);
  for(const y of [.6,3.8]){const rib=new THREE.Mesh(flat(new THREE.BoxGeometry(w,.25,.5)),psMat({color:0x2e3632}));rib.position.y=y;door.add(rib);}
  const sh=new THREE.Shape();sh.moveTo(0,1.6);sh.lineTo(1.5,-1.0);sh.lineTo(-1.5,-1.0);sh.closePath();
  const hole=new THREE.Path();hole.moveTo(0,.95);hole.lineTo(.92,-.62);hole.lineTo(-.92,-.62);hole.closePath();sh.holes.push(hole);
  const tri=new THREE.Mesh(new THREE.ShapeGeometry(sh),psMat({color:0x7dff8a,unlit:true,side:THREE.DoubleSide}));
  tri.position.set(0,2.3,-.2);door.add(tri);
  const eye=new THREE.Mesh(new THREE.CircleGeometry(.28,8),psMat({color:0x7dff8a,unlit:true,side:THREE.DoubleSide}));
  eye.position.set(0,2.1,-.2);door.add(eye);
  g.userData.door=door;
  return g;
}

function sceneryAngelholm(){
  const m4=new THREE.Matrix4(),q=new THREE.Quaternion(),e=new THREE.Euler(),
        p=new THREE.Vector3(),sc=new THREE.Vector3(),one=new THREE.Vector3(1,1,1);
  const nearStation=(x,z,pad)=>{const i=nearestGlobal(x,z),l=(x-sx[i])*rx[i]+(z-sz[i])*rz[i];
    return stations.some(S=>{let d=i-S.at;if(d<-N/2)d+=N;else if(d>N/2)d-=N;
      return d>-8&&d<S.len+10&&l*S.side>0&&Math.abs(l)<HW+pad;});};
  const memI=ANG_MEM.i,memO=ANG_MEM.side*(HW+ANG_MEM.off);
  const MX=sx[memI]+rx[memI]*memO,MZ=sz[memI]+rz[memI]*memO,MY=meshY(MX,MZ);
  const B=ALTS.find(r=>r.id==='bunker');
  const sea=x=>-(x+316);
  /* ── Scots pines: tall straight trunks, crowns high up ── */
  const PT=1100;
  const trunkG=flat(new THREE.CylinderGeometry(.22,.38,15,5)).translate(0,7.5,0);
  const crownG=flat(new THREE.ConeGeometry(2.8,4.6,6)).translate(0,15.4,0);
  const crown2G=flat(new THREE.SphereGeometry(2.3,6,4)).scale(1,.55,1).translate(0,13.6,0);
  const trunks=new THREE.InstancedMesh(trunkG,psMat({color:0x8a5236}),PT);
  const crowns=new THREE.InstancedMesh(crownG,psMat({color:0x22382a}),PT);
  const crowns2=new THREE.InstancedMesh(crown2G,psMat({color:0x2a4430}),PT);
  let t=0,guard=0;
  while(t<PT&&guard++<9000){
    const x=rand(-390,330),z=rand(-390,390);
    if(sea(x)>4)continue;
    if(sea(x)>-34&&hash2(Math.floor(z/18),3.3)<.62)continue;            /* gaps toward the sea */
    const l=latAt(x,z);if(l<HW+5+hash2(x,z)*5)continue;
    if(Math.hypot(x-MX,z-MZ)<20||nearStation(x,z,26))continue;
    p.set(x,meshY(x,z)-.2,z);e.set(0,rand(0,6.3),0);q.setFromEuler(e);
    const s=rand(.75,1.25);sc.set(s,s*rand(.9,1.2),s);m4.compose(p,q,sc);
    trunks.setMatrixAt(t,m4);crowns.setMatrixAt(t,m4);crowns2.setMatrixAt(t,m4);t++;
  }
  trunks.count=crowns.count=crowns2.count=t;
  for(const M of [trunks,crowns,crowns2]){M.instanceMatrix.needsUpdate=true;world.add(M);}
  /* ── heather, blueberry scrub and young pines on the forest floor ── */
  const HT=700;
  const heath=new THREE.InstancedMesh(flat(new THREE.DodecahedronGeometry(.9,0)).scale(1,.5,1),psMat({color:0x4a3c52}),HT);
  const blue=new THREE.InstancedMesh(flat(new THREE.DodecahedronGeometry(.8,0)).scale(1,.55,1),psMat({color:0x2e4a2a}),HT);
  const young=new THREE.InstancedMesh(flat(new THREE.ConeGeometry(1.1,3.2,5)).translate(0,1.6,0),psMat({color:0x2c4a2e}),260);
  let h1=0,h2=0,y1=0;guard=0;
  while((h1<HT||h2<HT)&&guard++<8000){
    const x=rand(-380,330),z=rand(-380,380);
    if(sea(x)>2)continue;
    const l=latAt(x,z);if(l<HW+3.4)continue;
    if(nearStation(x,z,20))continue;
    p.set(x,meshY(x,z)-.05,z);e.set(0,rand(0,6.3),0);q.setFromEuler(e);
    const s=rand(.7,1.5);sc.set(s,s,s);m4.compose(p,q,sc);
    if(Math.hypot(x-MX,z-MZ)>14&&y1<260&&l>HW+6&&hash2(x*.3,z*.7)<.18)young.setMatrixAt(y1++,m4);
    else if(hash2(x,z)<.45){if(h1<HT)heath.setMatrixAt(h1++,m4);}else if(h2<HT)blue.setMatrixAt(h2++,m4);
  }
  heath.count=h1;blue.count=h2;young.count=y1;
  for(const M of [heath,blue,young]){M.instanceMatrix.needsUpdate=true;world.add(M);}
  /* ── Skälderviken: dark water, a moon path, and Kullen's light far across the bay ── */
  const seaM=psMat({color:0x1b2a48,unlit:true});
  const water=new THREE.Mesh(new THREE.PlaneGeometry(900,1800).rotateX(-Math.PI/2),seaM);
  water.position.set(-786,-5.2,0);world.add(water);
  const glitM=psMat({color:0x8fa4c8,unlit:true});
  for(let n=0;n<26;n++){
    const gl=new THREE.Mesh(new THREE.PlaneGeometry(rand(3,9),.5).rotateX(-Math.PI/2),glitM);
    gl.position.set(-360-n*14+rand(-4,4),-5.1,-60+rand(-14,14)-n*6);world.add(gl);
  }
  /* ── the memorial clearing: the saucer replica, the landing marks and a board ── */
  const mem=new THREE.Group();mem.position.set(MX,MY,MZ);
  mem.rotation.y=Math.atan2(fx[memI],fz[memI]);world.add(mem);
  const conc=psMat({color:0xa8a49a}),dark=psMat({color:0x1e2a20});
  for(let n=0;n<3;n++){                                   /* the three marks in the moss */
    const a=n*2.094+.3,mk=new THREE.Mesh(flat(new THREE.CylinderGeometry(.75,.75,.14,8)),conc);
    mk.position.set(Math.cos(a)*4.2,.05,Math.sin(a)*4.2);mem.add(mk);
    const pit=new THREE.Mesh(flat(new THREE.CylinderGeometry(.45,.45,.16,8)),dark);
    pit.position.set(Math.cos(a)*4.2,.08,Math.sin(a)*4.2);mem.add(pit);
  }
  const ringP=new THREE.InstancedMesh(flat(new THREE.BoxGeometry(.16,.7,.16)),psMat({color:0x6b5540}),20);
  for(let n=0;n<20;n++){const a=n/20*6.283;p.set(Math.cos(a)*7.5,.35,Math.sin(a)*7.5);m4.compose(p,q.identity(),one);ringP.setMatrixAt(n,m4);}
  ringP.instanceMatrix.needsUpdate=true;mem.add(ringP);
  const rep=new THREE.Group();rep.position.y=2.2;rep.scale.set(1.5,1.5,1.5);mem.add(rep);  /* the little replica on its stand */
  const metal=psMat({color:0xb4bcc4});
  const pole=new THREE.Mesh(flat(new THREE.CylinderGeometry(.1,.14,1.5,5)),psMat({color:0x4a4e52}));pole.position.y=-.75;rep.add(pole);
  const plinth=new THREE.Mesh(flat(new THREE.CylinderGeometry(1.2,1.4,.5,8)),conc);plinth.position.y=.25;mem.add(plinth);
  const glow=new THREE.Mesh(new THREE.ConeGeometry(2.6,4,10,1,true),psMat({color:0x9dffaa,unlit:true,transparent:true,opacity:.16,depthWrite:false,side:THREE.DoubleSide}));glow.position.y=2.4;glow.rotation.x=Math.PI;mem.add(glow);
  const d1=new THREE.Mesh(flat(new THREE.CylinderGeometry(1.0,1.5,.35,12)),metal);d1.position.y=.2;rep.add(d1);
  const d2=new THREE.Mesh(flat(new THREE.CylinderGeometry(1.5,.8,.3,12)),metal);d2.position.y=-.12;rep.add(d2);
  const dm=new THREE.Mesh(flat(new THREE.SphereGeometry(.6,8,4,0,6.283,0,1.57)),psMat({color:0x9fe8b0,unlit:true}));dm.position.y=.37;rep.add(dm);
  const board=new THREE.Group();board.position.set(-5.5,0,-6.5);board.rotation.y=Math.PI*0.85;mem.add(board);
  for(const sg of [-1,1]){const bp=new THREE.Mesh(flat(new THREE.BoxGeometry(.18,2.2,.18)),psMat({color:0x4a3a2a}));bp.position.set(sg*1.3,1.1,0);board.add(bp);}
  const bt=pixTex(64,40,g=>{g.fillStyle='#2e4a34';g.fillRect(0,0,64,40);g.fillStyle='#e8eadc';
    g.font='8px "Press Start 2P",monospace';g.textAlign='center';g.textBaseline='middle';
    g.fillText('UFO',32,10);g.fillText('LANDNING',32,21);g.fillText('1946',32,32);});
  const bpl=new THREE.Mesh(new THREE.PlaneGeometry(3,1.9),psMat({map:bt,side:THREE.DoubleSide}));
  bpl.position.y=1.85;board.add(bpl);
  const bench=new THREE.Mesh(flat(new THREE.BoxGeometry(2.4,.18,.6)),psMat({color:0x6b5540}));
  bench.position.set(5,.55,-5);bench.rotation.y=.8;mem.add(bench);
  /* ── the bunker hallway: a concrete corridor through the dune ridge ── */
  if(B){
    const atB=(j,l,up)=>{const x=B.X[j]+B.RX[j]*l,z=B.Z[j]+B.RZ[j]*l;return new THREE.Vector3(x,B.Y[j]+(up||0),z);};
    const mainClear=(v,pad)=>{const i=nearestGlobal(v.x,v.z);return Math.abs((v.x-sx[i])*rx[i]+(v.z-sz[i])*rz[i])>HW+pad;};
    const fm=psMat({map:pixTex(32,32,g=>{g.fillStyle='#7d7a72';g.fillRect(0,0,32,32);
      for(let i=0;i<180;i++){g.fillStyle=Math.random()>.5?'#8e8b82':'#5f5c56';g.fillRect((Math.random()*32)|0,(Math.random()*32)|0,1,1);}
      g.fillStyle='#4e4b46';g.fillRect(0,0,32,1);})});
    fm.uniforms.uMap.value.wrapS=fm.uniforms.uMap.value.wrapT=THREE.RepeatWrapping;
    fm.polygonOffset=true;fm.polygonOffsetFactor=-4;fm.polygonOffsetUnits=-4;
    const j0=COMMIT+4,j1=B.n-MERGE-5;
    world.add(new THREE.Mesh(altRibbon(B,-B.hw,B.hw,.06,5,j0,j1),fm));
    const wallG=flat(new THREE.BoxGeometry(.7,4.6,SEG*2+.25));
    const walls=new THREE.InstancedMesh(wallG,psMat({color:0x8a877e}),B.n*2);
    const roofG=flat(new THREE.BoxGeometry(2*B.hw+3.2,.6,SEG*2+.2));
    const roofs=new THREE.InstancedMesh(roofG,psMat({color:0x77746c}),B.n);
    const moss=new THREE.InstancedMesh(flat(new THREE.BoxGeometry(2*B.hw+4.4,.5,SEG*2+.6)),psMat({color:0x3a4a2c}),B.n);
    const lampG=flat(new THREE.BoxGeometry(.12,.3,.9));
    const lamps=new THREE.InstancedMesh(lampG,psMat({color:0x7dff8a,unlit:true}),B.n);
    let w=0,r=0,mo=0,la=0;
    for(let j=j0+2;j<=j1-2;j+=2){
      const yaw=Math.atan2(B.FX[j],B.FZ[j]);e.set(0,yaw,0);q.setFromEuler(e);
      let ok=true;
      for(const sg of [-1,1]){const v=atB(j,sg*(B.hw+1.45),2.2);if(!mainClear(v,3))ok=false;}
      if(!ok)continue;
      for(const sg of [-1,1]){const v=atB(j,sg*(B.hw+1.45),2.2);m4.compose(v,q,one);walls.setMatrixAt(w++,m4);
        if(j%6===0){const v2=atB(j,sg*(B.hw+1.05),3.2);m4.compose(v2,q,one);lamps.setMatrixAt(la++,m4);}}
      if(j%8!==4){const v=atB(j,0,4.8);m4.compose(v,q,one);roofs.setMatrixAt(r++,m4);
        const v3=atB(j,0,5.3);m4.compose(v3,q,one);moss.setMatrixAt(mo++,m4);}
    }
    walls.count=w;roofs.count=r;moss.count=mo;lamps.count=la;
    for(const M of [walls,roofs,moss,lamps]){M.instanceMatrix.needsUpdate=true;world.add(M);}
    /* the mouths: concrete portals, the strange triangle over the way in */
    for(const [j,front] of [[COMMIT+4,true],[j1-1,false]]){
      const pg=new THREE.Group(),v=atB(j,0,0);pg.position.copy(v);pg.rotation.y=Math.atan2(B.FX[j],B.FZ[j]);world.add(pg);
      const cm=psMat({color:0x9a968c});
      for(const sg of [-1,1]){const pl=new THREE.Mesh(flat(new THREE.BoxGeometry(1.6,5.6,1.6)),cm);pl.position.set(sg*(B.hw+1.6),2.8,0);pg.add(pl);}
      const li=new THREE.Mesh(flat(new THREE.BoxGeometry(2*B.hw+4.8,1.8,1.6)),cm);li.position.y=6.0;pg.add(li);
      if(front){
        const sh=new THREE.Shape();sh.moveTo(0,1.1);sh.lineTo(1.1,-.75);sh.lineTo(-1.1,-.75);sh.closePath();
        const ho=new THREE.Path();ho.moveTo(0,.62);ho.lineTo(.64,-.45);ho.lineTo(-.64,-.45);ho.closePath();sh.holes.push(ho);
        const tri=new THREE.Mesh(new THREE.ShapeGeometry(sh),psMat({color:0x7dff8a,unlit:true,side:THREE.DoubleSide}));
        tri.position.set(0,6.0,-.85);pg.add(tri);
      }
    }
    /* sand dunes heaped over the corridor so it reads as a bunker in the ridge */
    const dune=new THREE.InstancedMesh(flat(new THREE.DodecahedronGeometry(1,0)),psMat({color:0x5a5a3c}),60);
    let du=0;
    for(let j=j0+6;j<=j1-6&&du<60;j+=5)for(const sg of [-1,1]){
      const v=atB(j,sg*(B.hw+7.2),0);if(!mainClear(v,9))continue;
      v.y=meshY(v.x,v.z)+.4;e.set(0,Math.atan2(B.FX[j],B.FZ[j]),0);q.setFromEuler(e);sc.set(3.6,3.4+hash2(sg,j)*1.4,5.5);
      m4.compose(v,q,sc);if(du<60)dune.setMatrixAt(du++,m4);
    }
    dune.count=du;dune.instanceMatrix.needsUpdate=true;world.add(dune);
  }
}

/** the flying saucer and the forest's odd green lights */
function hazardsAngelholm(H){
  /* ── the saucer: descends, sweeps down the road with its beam on, then zips back ── */
  const g=new THREE.Group(),body=new THREE.Group();g.add(body);
  const metal=psMat({color:0xaab2ba}),under=psMat({color:0x5a6068});
  const top=new THREE.Mesh(flat(new THREE.CylinderGeometry(3.2,5.4,1.0,14)),metal);body.add(top);
  const bot=new THREE.Mesh(flat(new THREE.CylinderGeometry(5.4,2.4,.9,14)),under);bot.position.y=-.95;body.add(bot);
  const dome=new THREE.Mesh(flat(new THREE.SphereGeometry(2.2,10,5,0,6.283,0,1.57)),
    psMat({color:0x9fe8b0,unlit:true,transparent:true,opacity:.8}));dome.position.y=.45;body.add(dome);
  const lights=[];
  for(let n=0;n<10;n++){const a=n/10*6.283;
    const l=new THREE.Mesh(flat(new THREE.BoxGeometry(.5,.35,.5)),psMat({color:n%2?0x7dff8a:0xff6ad8,unlit:true}));
    l.position.set(Math.cos(a)*5.0,-.45,Math.sin(a)*5.0);body.add(l);lights.push(l);}
  const beamM=psMat({color:0x9dffaa,unlit:true,transparent:true,opacity:.26,depthWrite:false,side:THREE.DoubleSide});
  const beam=new THREE.Mesh(new THREE.ConeGeometry(3.6,1,14,1,true).translate(0,-.5,0),beamM);g.add(beam);
  const ringM=psMat({color:0x9dffaa,unlit:true,transparent:true,opacity:.75,depthWrite:false,side:THREE.DoubleSide});
  const ring=new THREE.Mesh(new THREE.RingGeometry(2.7,3.5,18).rotateX(-Math.PI/2),ringM);
  const spot=new THREE.Mesh(new THREE.CircleGeometry(2.7,18).rotateX(-Math.PI/2),
    psMat({color:0x6add80,unlit:true,transparent:true,opacity:.22,depthWrite:false,side:THREE.DoubleSide}));
  world.add(g);world.add(ring);world.add(spot);
  const U=ANG_UFO,HOV=8.5,R=3.4;
  H.push({id:'ufo',period:U.period,phase:2.5,mesh:g,
    update(u,dt){
      const pass=Math.floor((raceTime+this.phase)/this.period),lat=U.lats[((pass%3)+3)%3];
      let s,h,on=false,show=0;
      if(u<0.16){s=U.i0;h=lerp(34,HOV,smooth(0,0.16,u));show=Math.sin(clock*18)>0?1:.25;}   /* coming down: the ring blinks */
      else if(u<0.82){s=U.i0+U.len*(u-0.16)/0.66;h=HOV;on=true;show=1;}
      else{const v=smooth(0.82,1,u);s=U.i0+U.len*(1-v);h=lerp(HOV,34,smooth(0.82,0.88,u));}
      const q=mainPt(s,lat),q2=mainPt(s+1,lat);
      this.on=on;this.p={x:q.x,y:q.y,z:q.z};this.s=s;this.lat=lat;
      g.position.set(q.x,q.y+h+Math.sin(clock*2.3)*.25,q.z);
      body.rotation.y+=dt*2.2;body.rotation.z=Math.sin(clock*1.7)*.06;
      lights.forEach((l,n)=>l.visible=((n+Math.floor(clock*8))%3)!==0);
      beam.visible=on;beam.scale.y=h;
      ring.visible=spot.visible=show>0;
      ring.position.set(q.x,Math.max(q.y,q2.y)+.18,q.z);spot.position.set(q.x,Math.max(q.y,q2.y)+.14,q.z);
      ringM.uniforms.uOpacity.value=.75*show;
      if(on&&Math.random()<.5)puff(q.x+rand(-2.4,2.4),q.y+rand(.2,h*.8),q.z+rand(-2.4,2.4),.6,1,.65,.6);
      /* the AI sees it coming and edges to the other side */
      if(state==='race'&&show>0)for(const k of karts){
        if(!k.ai||k.rib||k.parked)continue;
        let d=s-k.mi;if(d>N/2)d-=N;else if(d<-N/2)d+=N;
        if(d<1||d>42)continue;
        const gap=(k.line+k.itemBias)-lat;
        if(Math.abs(gap)<R+2.2)k.itemBias+=(gap>=0?1:(gap<0?-1:(k.idx%2?1:-1)))*(R+2.2-Math.abs(gap))*0.16*(1-d/60);
      }
    },
    hit(k){return this.on&&!k.rib&&this.p&&near3(k,this.p.x,this.p.y,this.p.z,R);},
    effect(k){
      k.vy=Math.max(k.vy,7);k.y+=.3;k.air=true;
      k.slow=Math.max(k.slow,1.6);k.vx*=.55;k.vz*=.55;k.boost=0;k.drift=0;k.charge=0;
      for(let n=0;n<12;n++)puff(k.x+rand(-1.2,1.2),k.y+rand(.3,2.2),k.z+rand(-1.2,1.2),.55,1,.6,.7);
      if(k===player){toast('UFO-STRÅLEN!');ping(1200,300,.45);shake=Math.min(1,shake+.35);}
    }});
  /* ── odd green lights drifting between the pines, and Kullen's lighthouse across the bay ── */
  const WN=34,wis=new THREE.InstancedMesh(flat(new THREE.OctahedronGeometry(.45,0)),psMat({color:0x8dff9a,unlit:true}),WN);
  const W=[];let guard=0;
  while(W.length<WN&&guard++<3000){
    const x=rand(-300,240),z=rand(-200,180),l=latAt(x,z);
    if(l<HW+7||l>HW+40||-(x+316)>0)continue;
    W.push([x,meshY(x,z)+rand(1.5,4.5),z,rand(0,6.3)]);
  }
  wis.count=W.length;world.add(wis);
  const lh=new THREE.Mesh(new THREE.SphereGeometry(3.5,6,4),new THREE.MeshBasicMaterial({color:0xfff2b0}));
  lh.position.set(-860,30,-520);world.add(lh);
  const m4=new THREE.Matrix4(),pp=new THREE.Vector3(),qq=new THREE.Quaternion(),ss=new THREE.Vector3(1,1,1);
  H.push({id:'irrbloss',period:1,phase:0,
    update(){
      for(let n=0;n<W.length;n++){const w=W[n],t=clock*.6+w[3];
        pp.set(w[0]+Math.sin(t)*2.2,w[1]+Math.sin(t*1.9)*.7,w[2]+Math.cos(t*.8)*2.2);
        const s=.7+.35*Math.sin(clock*3+w[3]);ss.set(s,s,s);m4.compose(pp,qq,ss);wis.setMatrixAt(n,m4);}
      wis.instanceMatrix.needsUpdate=true;
      lh.visible=(clock%5)<0.5;
    }});
}
