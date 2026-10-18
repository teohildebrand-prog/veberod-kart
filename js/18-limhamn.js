"use strict";
/* ───────── Limhamn ───────── */
/* Magma Moon Marathon's counterpart: down into a limestone quarry at night, glowing lime kilns for lava, a switch-opened rock passage */
ROADTEX.kalk=()=>pixTex(64,64,g=>{                  /* packed white limestone gravel with tyre ruts */
  g.fillStyle='#b9b5aa';g.fillRect(0,0,64,64);
  for(let i=0;i<1000;i++){g.fillStyle=Math.random()>.5?'rgba(236,232,222,.55)':'rgba(120,114,104,.45)';
    g.fillRect((Math.random()*64)|0,(Math.random()*64)|0,1,1);}
  g.fillStyle='rgba(110,104,94,.35)';for(const x of [12,18,44,50])g.fillRect(x,0,3,64);
});
VERGEC.kalk=['#a8a397','#c8c4b8','#7e7a70'];
GROUND.kalk={cell:40,stripe:0.9,verge:0xa8a397,cols:[0xd4cfc2,0xc8c3b6,0xbcb7aa,0xdcd8cc,0xb0ab9e,0xc4bfb0]};
SURF.kalk={top:o=>o+(1-o)*0.7,grip:o=>1-0.35*(1-o),fuel:1.1,name:'KALKGRUS'};
SFX.kalk={dust:[.92,.91,.86],noise:{f:1800,g:.02}};
const LIM_POOL=[0,-64,112,40];                       /* the turquoise water: centre x,z and radii */
let LIM_IN=0, LIM_KEY=null;
/** which side of the road is the pit (the inside of the loop): +1 or -1 */
function limInside(){
  if(LIM_KEY===sx[0]+sz[5])return LIM_IN;
  let cx=0,cz=0;for(let i=0;i<N;i++){cx+=sx[i];cz+=sz[i];}cx/=N;cz/=N;
  let s=0;for(let i=0;i<N;i+=4)s+=(cx-sx[i])*rx[i]+(cz-sz[i])*rz[i];
  LIM_KEY=sx[0]+sz[5];LIM_IN=s>0?1:-1;return LIM_IN;
}
/** the quarry's own ground: terraces stepping down into the pit and up the far walls */
function limNat(x,z){
  const i=nearestGlobal(x,z),lat=(x-sx[i])*rx[i]+(z-sz[i])*rz[i],y=sy[i];
  const d=Math.max(0,Math.abs(lat)-(HW+5)),q=d/13,l=Math.floor(q),st=6*(l+smooth(.68,1,q-l));
  let h;
  if(lat*limInside()>0){
    h=Math.max(1.2,y-st);
    const P=LIM_POOL,pe=Math.hypot((x-P[0])/P[2],(z-P[1])/P[3]);
    if(pe<1.3)h=Math.min(h,lerp(-5,h,smooth(.75,1.3,pe)));
  }else h=Math.min(34,y+st);
  return h;
}
STAGES.push({ id:'limhamn', group:'kust', name:'LIMHAMN', sub:'KALKBROTTET',
  order:10, tag:'Ner i kalkbrottet en natt när ugnarna glöder. Vita väggar och ånga ur marken.',
  view:{i:110,lat:0,h:6,to:{i:150,lat:-40,h:8},fov:55},
  hw:9.0,
  bars:[0.70,0.75,0.85], laps:3,
  blurb:'Down the white terraces of the great Limhamn limestone quarry by moonlight, past turquoise water at the bottom and back up the gravel ramps. The lime kilns glow like lava and vent steam through grates in the road. Pull the lever on the way down and next lap the cracked boulder lets you through the old cutting.',
  role:'Ner i gropen och upp igen, med ånga ur gallren.',
  sky:[0x22304e,0x04060e], fog:[0x18213a,60,360], amb:0x56607c, dif:0xa8bce8, moon:true,
  road:'kalk', verge:'kalk', edge:'limhamn', ground:'kalk', paint:false, sfxRoad:'kalk', sfxOff:'kalk',
  terrain:{size:760,seg:110},
  jumpSpec:[{h:3.6,drop:2.6,up:12,dn:7,rec:18},{h:2.8,drop:2.0,up:10,dn:6,rec:15}],
  ctrl:[[-150,32,-152],[-60,32,-158],[50,32,-150],[140,31,-130],[200,28,-85],[225,22,-20],[210,16,45],
        [160,11,92],[100,6,116],[52,3,78],[5,3,22],[-50,3,28],[-90,3,80],[-145,4,116],[-205,9,72],
        [-240,15,0],[-232,21,-60],[-205,27,-115]],
  mod:(x,z,t)=>{const i=nearestGlobal(x,z);return Math.min(1,t*3)*(limNat(x,z)-sy[i])-rolls(x,z)*t;},
  land:(x,z,out)=>limLand(x,z,out),
  stations:[[0.12,-1],[0.62,1]],
  routes:[
    {id:'sprickan',name:'SPRICKAN',a:365,b:500,hw:4.4,side:-1,lead:11,leadLat:22,
     mid:[[0.5,-8]],surface:'kalk',risk:0.2,hidden:true,shoot:true,noRocket:true,
     blockMesh:(R,j)=>limBlock(R,j),blockAnim:(B,drop)=>limBlockAnim(B,drop),
     blurb:'An old cutting along the foot of the south wall. A cracked boulder blocks it until someone pulls the lever on the ramp; it opens for them the lap after.'}],
  hazards:H=>hazardsLimhamn(H), scenery:()=>sceneryLimhamn(),
  stamps:[
    {id:'lim1',dish:'Lufsa',ini:'L',kind:'line',route:'main',i:'tight',lat:'inside',
     hint:'Tätt på innerkanten i den skarpaste kurvan.',
     story:'Lufsa is a Skåne oven dish of grated potato, milk, egg and flour baked round pieces of salted pork until the edges go crisp. It filled the quarry workers of Limhamn for a whole shift, and it still tastes best eaten straight from the tin.'},
    {id:'lim2',dish:'Rabarberkräm',ini:'R',kind:'air',route:'main',jump:0,after:5,lat:0,air:4.6,
     hint:'Högt i luften över första hoppet.',
     story:'In May the rhubarb in every Limhamn garden comes up first, long before anything else is ripe. Stewed with sugar and thickened with potato flour it turns into rabarberkräm, pink and tart, eaten cold with a splash of milk on a light spring evening.'},
    {id:'lim3',dish:'Stekt rödspätta',ini:'R',kind:'route',route:'sprickan',f:0.5,lat:0,
     hint:'Mitt i Sprickan. Dra i spaken, så öppnas den nästa varv.',
     story:'Before the quarry grew, Limhamn was a fishing village, and its boats brought plaice in from the sound. Rolled in rye flour and fried in butter, served with boiled potatoes and melted butter, stekt rödspätta is still what the harbour kiosks are proudest of.'}] });
EDGES.limhamn=st=>{                                  /* white quarry blocks, reflector posts with amber lamps */
  const g=flat(new THREE.BoxGeometry(1.6,1.2,2.6));
  const bl=new THREE.InstancedMesh(g,psMat({color:0xd8d4c8}),Math.ceil(N/2)*2);
  const post=new THREE.InstancedMesh(flat(new THREE.BoxGeometry(.18,1.5,.18)),psMat({color:0xeeeeea}),Math.ceil(N/12)*2);
  const lamp=new THREE.InstancedMesh(flat(new THREE.BoxGeometry(.3,.3,.3)),psMat({color:0xffa640,unlit:true}),Math.ceil(N/12)*2);
  const m4=new THREE.Matrix4(),q=new THREE.Quaternion(),e=new THREE.Euler(),p=new THREE.Vector3(),sc=new THREE.Vector3(),one=new THREE.Vector3(1,1,1);
  let a=0,b=0;
  for(let i=0;i<N;i+=2)for(const side of [-1,1]){
    const o=side*(HW+4.3),x=sx[i]+rx[i]*o,z=sz[i]+rz[i]*o;
    if(nearAlt(x,z,2.6))continue;
    e.set(0,Math.atan2(fx[i],fz[i])+hash2(i,side)*.3-.15,0);q.setFromEuler(e);
    sc.set(1,.8+hash2(side,i)*.5,1);p.set(x,meshY(x,z)+.5,z);m4.compose(p,q,sc);bl.setMatrixAt(a++,m4);
    if(i%12===0){
      const o2=side*(HW+2.9),x2=sx[i]+rx[i]*o2,z2=sz[i]+rz[i]*o2,y2=meshY(x2,z2);
      p.set(x2,y2+.75,z2);m4.compose(p,q,one);post.setMatrixAt(b,m4);
      p.set(x2,y2+1.55,z2);m4.compose(p,q,one);lamp.setMatrixAt(b++,m4);
    }
  }
  bl.count=a;post.count=lamp.count=b;
  bl.instanceMatrix.needsUpdate=post.instanceMatrix.needsUpdate=lamp.instanceMatrix.needsUpdate=true;
  world.add(bl);world.add(post);world.add(lamp);
};
function limLand(x,z,out){
  const h=limNat(x,z);
  const P=LIM_POOL,pe=Math.hypot((x-P[0])/P[2],(z-P[1])/P[3]);
  if(h>=33.5){out.setHex(hash2(Math.floor(x/30),Math.floor(z/30))>.5?0x3d5236:0x4a5a3a);return;}  /* the town's grass round the rim */
  if(pe<1.15&&h<1){out.setHex(pe<1?0x2f9a96:0x7fc4b6);return;}
  const band=Math.floor((h+1)/6)%2;                  /* each terrace a shade apart */
  if(band)out.lerp(tmpC.setHex(0x9c978a),.35);
  if(h<2.5)out.lerp(tmpC.setHex(0x8f8a7e),.3);       /* the floor: wet and trodden */
}
/** hiss: high noise for the steam valves */
function limHiss(vol){
  if(typeof actx==='undefined'||!actx||vol<=0)return;
  const t=actx.currentTime,len=(actx.sampleRate*.9)|0,b=actx.createBuffer(1,len,actx.sampleRate),d=b.getChannelData(0);
  for(let i=0;i<len;i++)d[i]=(Math.random()*2-1)*Math.min(1,i/(len*.15))*(1-i/len);
  const n=actx.createBufferSource(),hp=actx.createBiquadFilter(),g=actx.createGain();
  hp.type='highpass';hp.frequency.value=2600;g.gain.value=.22*vol;
  n.buffer=b;n.connect(hp);hp.connect(g);g.connect(audioOutput());n.start(t);
}
/** the cracked boulder in the mouth of Sprickan, in two halves */
function limBlock(R,j){
  const g=new THREE.Group(),lime=psMat({color:0xdcd8cc}),limeD=psMat({color:0xb4b0a4});
  const yaw=Math.atan2(R.FX[j],R.FZ[j]);
  const inner=new THREE.Group();inner.rotation.y=yaw+Math.PI/2;g.add(inner);
  for(const sg of [-1,1]){
    const h=new THREE.Group();h.position.x=sg*1.15;
    const r=new THREE.Mesh(flat(new THREE.DodecahedronGeometry(2.4,0)),sg>0?lime:limeD);
    r.scale.set(.55,1.15,1.05);r.position.set(sg*.2,2.3,0);h.add(r);
    const r2=new THREE.Mesh(flat(new THREE.DodecahedronGeometry(1.3,0)),limeD);r2.position.set(sg*.4,4.3,.6);h.add(r2);
    inner.add(h);
  }
  const crack=new THREE.Mesh(new THREE.PlaneGeometry(.35,4.6),psMat({color:0xffb040,unlit:true,side:THREE.DoubleSide}));
  crack.position.set(0,2.4,0);crack.rotation.y=Math.PI/2;inner.add(crack);
  g.userData.crack=crack;g.userData.halves=inner.children.slice(0,2);
  return g;
}
function limBlockAnim(B,drop){
  const H=B.mesh.userData.halves;if(!H)return;
  H.forEach((h,n)=>{const sg=n?1:-1;h.position.x=sg*(1.15+drop*3.2);h.position.y=-drop*1.6;h.rotation.z=-sg*drop*.5;});
  const c=B.mesh.userData.crack;
  /* the seam glows while the player's switch is set, so you know it will give next lap */
  const armed=typeof player!=='undefined'&&player.limSw!=null;
  c.visible=drop<.5&&(armed?Math.floor(clock*4)%2===0:true);
  c.material.uniforms.uColor.value.setHex(armed?0xffe070:0xa86a2a);
}
function sceneryLimhamn(){
  const m4=new THREE.Matrix4(),q=new THREE.Quaternion(),e=new THREE.Euler(),
        p=new THREE.Vector3(),sc=new THREE.Vector3(),one=new THREE.Vector3(1,1,1);
  const at=(i,o)=>{i=((Math.round(i)%N)+N)%N;const x=sx[i]+rx[i]*o,z=sz[i]+rz[i]*o;
    return {x,z,y:meshY(x,z),yaw:Math.atan2(fx[i],fz[i])};};
  const bx=(g,w,h,d,mat,x,y,z)=>{const m=new THREE.Mesh(flat(new THREE.BoxGeometry(w,h,d)),mat);m.position.set(x,y,z);g.add(m);return m;};
  const IN=limInside();
  const brick=psMat({color:0x7a3a2a}),brickD=psMat({color:0x5a2a20}),glow=psMat({color:0xff8a2a,unlit:true}),
        glowY=psMat({color:0xffc060,unlit:true}),steel=psMat({color:0x5a5e62}),dark=psMat({color:0x1c1e22}),
        lime=psMat({color:0xdcd8cc}),yel=psMat({color:0xd8a020}),corr=psMat({color:0x6f7a80});
  /* ── the turquoise pool at the bottom ── */
  {
    const P=LIM_POOL,g=new THREE.CircleGeometry(1,40);g.rotateX(-Math.PI/2);
    const w=new THREE.Mesh(g,psMat({color:0x1fa3a0,unlit:true}));w.scale.set(P[2]*1.08,1,P[3]*1.08);
    w.position.set(P[0],-.6,P[1]);world.add(w);
    const shine=new THREE.Mesh(g,psMat({color:0x9fe8e0,unlit:true,transparent:true,opacity:.25,depthWrite:false}));
    shine.scale.set(P[2]*.4,1,P[3]*.18);shine.position.set(P[0]+30,-.5,P[1]-6);world.add(shine);
  }
  /* ── the lime kilns on the north rim: brick shafts glowing at the mouths ── */
  const kilns=[];
  for(const [i,o] of [[132,22],[146,24],[160,23],[174,25]]){
    const v=at(i,-IN*(HW+o));
    const g=new THREE.Group();
    bx(g,8,12,8,brick,0,6,0);
    const top=new THREE.Mesh(flat(new THREE.CylinderGeometry(2.4,3.6,6,4)),brickD);top.position.y=15;top.rotation.y=Math.PI/4;g.add(top);
    bx(g,2.4,.6,2.4,glow,0,18.1,0);
    for(const r of [0,Math.PI/2,Math.PI,-Math.PI/2]){                  /* draw arches on every side */
      const a=bx(g,2.6,3.2,.3,glow,Math.sin(r)*4.05,1.6,Math.cos(r)*4.05);a.rotation.y=r;}
    const pad=new THREE.Mesh(new THREE.CircleGeometry(9,10).rotateX(-Math.PI/2),
      psMat({color:0xff7a20,unlit:true,transparent:true,opacity:.22,depthWrite:false}));pad.position.y=.15;g.add(pad);
    g.position.set(v.x,v.y-.2,v.z);g.rotation.y=v.yaw;world.add(g);kilns.push(g);
  }
  sceneryLimhamn.kilns=kilns;
  /* a sign on the kiln wall */
  {
    const sg=pixTex(128,32,g=>{g.fillStyle='#2a1a14';g.fillRect(0,0,128,32);g.fillStyle='#ffc060';
      g.font='12px "Press Start 2P",monospace';g.textAlign='center';g.textBaseline='middle';g.fillText('KALKUGNAR',64,17);});
    const v=at(153,-IN*(HW+12));
    const pl=new THREE.Mesh(new THREE.PlaneGeometry(8,2),psMat({map:sg,unlit:true,side:THREE.DoubleSide}));
    pl.position.set(v.x,v.y+4.4,v.z);pl.rotation.y=v.yaw+Math.PI/2*IN;world.add(pl);
    for(const s2 of [-3.6,3.6]){const po=new THREE.Mesh(flat(new THREE.BoxGeometry(.25,4.4,.25)),steel);
      po.position.set(v.x+fx[153]*s2,v.y+2.2,v.z+fz[153]*s2);world.add(po);}
  }
  /* ── the old kiln down on the floor, by the second set of grates ── */
  {
    const v=at(LIM_GRATES[1][0],IN*(HW+16));
    const g=new THREE.Group();
    bx(g,7,9,7,brickD,0,4.5,0);bx(g,2.2,2.8,.3,glow,0,1.4,3.55);bx(g,2.2,2.8,.3,glow,0,1.4,-3.55);
    const ch=new THREE.Mesh(flat(new THREE.CylinderGeometry(.9,1.2,10,6)),brick);ch.position.y=14;g.add(ch);
    bx(g,1.4,.5,1.4,glow,0,19.1,0);
    g.position.set(v.x,v.y-.2,v.z);g.rotation.y=v.yaw;world.add(g);kilns.push(g);
  }
  /* steam pipes from the kilns to the grates */
  {
    const pm=psMat({color:0x6a6e70});
    LIM_GRATES.forEach((site,si)=>site.forEach(G=>{
      const sg=si?IN:-IN,v=at(G[0],sg*(HW+4.6)),b=at(G[0],sg*(HW+(si?13:18)));
      const L=Math.hypot(v.x-b.x,v.z-b.z);
      const pipe=new THREE.Mesh(flat(new THREE.BoxGeometry(.7,.7,L)),pm);
      pipe.position.set((v.x+b.x)/2,(v.y+b.y)/2+.4,(v.z+b.z)/2);pipe.lookAt(b.x,b.y+.4,b.z);world.add(pipe);
    }));
  }
  /* ── the conveyor: up from the pit floor to the crusher tower, then over the road to the stockpile ── */
  {
    const t0=at(70,IN*(HW+20)),t1=at(70,-IN*(HW+40));
    const hop=new THREE.Vector3(-60,2.5,-20);
    const tower=new THREE.Group();
    bx(tower,8,30,8,corr,0,15,0);bx(tower,9,2,9,steel,0,30,0);bx(tower,1.2,1.2,8.2,glowY,0,24,0);
    tower.position.set(t0.x,t0.y,t0.z);world.add(tower);
    const pile=new THREE.Mesh(flat(new THREE.ConeGeometry(16,14,7)),lime);pile.position.set(t1.x,t1.y+6,t1.z);world.add(pile);
    const top=new THREE.Vector3(t0.x,t0.y+28,t0.z),far=new THREE.Vector3(t1.x,t1.y+20,t1.z);
    const legs=[[hop,top],[top,far]];
    const belt=psMat({color:0x2a2c2e});
    for(const [a,b] of legs){
      const L=a.distanceTo(b),m=new THREE.Mesh(flat(new THREE.BoxGeometry(2.4,1,L)),belt);
      m.position.copy(a).add(b).multiplyScalar(.5);m.lookAt(b);world.add(m);
      const n=Math.floor(L/14);
      for(let k=1;k<n;k++){const pt=a.clone().lerp(b,k/n);const gy=meshY(pt.x,pt.z);
        if(latAt(pt.x,pt.z)<HW+3)continue;
        const leg=new THREE.Mesh(flat(new THREE.BoxGeometry(.5,pt.y-gy,.5)),steel);leg.position.set(pt.x,(pt.y+gy)/2,pt.z);world.add(leg);}
    }
    const hp=new THREE.Mesh(flat(new THREE.CylinderGeometry(4,1.5,5,6)),steel);hp.position.set(hop.x,hop.y+2,hop.z);world.add(hp);
    sceneryLimhamn.belt=legs;
  }
  /* ── floodlight masts round the rim, sodium-yellow ── */
  {
    const FL=16;
    const mast=new THREE.InstancedMesh(flat(new THREE.BoxGeometry(.5,16,.5)).translate(0,8,0),steel,FL);
    const head=new THREE.InstancedMesh(flat(new THREE.BoxGeometry(3,1.2,1.2)).translate(0,16.4,0),glowY,FL);
    let c=0;
    for(let i=20;i<N&&c<FL;i+=45){
      const v=at(i,-IN*(HW+9));if(v.y<20&&i>300&&i<560)continue;
      e.set(0,v.yaw,0);q.setFromEuler(e);p.set(v.x,v.y-.2,v.z);m4.compose(p,q,one);
      mast.setMatrixAt(c,m4);head.setMatrixAt(c,m4);c++;
    }
    mast.count=head.count=c;mast.instanceMatrix.needsUpdate=head.instanceMatrix.needsUpdate=true;world.add(mast);world.add(head);
  }
  /* ── machines parked on the terraces: dump trucks and an excavator ── */
  for(const [x0,z0,r,kind] of [[120,-60,.6,0],[-150,-40,2.1,0],[60,-100,-.4,1],[-120,30,1.2,1],[-30,-115,.2,0]]){
    if(latAt(x0,z0)<HW+10)continue;
    const g=new THREE.Group(),y=meshY(x0,z0);
    if(kind===0){
      bx(g,4,2.4,4,yel,0,2.4,3.2);bx(g,4.6,3,7,yel,0,3.4,-2);bx(g,3.6,1.2,1,dark,0,3,5.25);
      for(const [wx,wz] of [[-2.2,3.4],[2.2,3.4],[-2.2,-3.4],[2.2,-3.4]]){const w=bx(g,.9,2.2,2.2,dark,wx,1.1,wz);}
    }else{
      bx(g,4.2,1.2,6,dark,0,.6,0);bx(g,3.6,2.6,4,yel,0,2.5,0);bx(g,1.6,2,1.8,yel,1,4.6,-.6);
      const arm=bx(g,.8,.8,9,yel,-.6,6,4.4);arm.rotation.x=-.5;const bk=bx(g,1.6,1.6,1.4,steel,-.6,3.2,8.4);
    }
    g.position.set(x0,y,z0);g.rotation.y=r;world.add(g);
  }
  /* ── limestone rubble, and Limhamn's roofs and church spire beyond the north rim ── */
  {
    const RB=220;
    const rub=new THREE.InstancedMesh(flat(new THREE.DodecahedronGeometry(1,0)),lime,RB);
    let c=0,g2=0;
    while(c<RB&&g2++<5000){
      const x=rand(-330,330),z=rand(-300,260);
      if(latAt(x,z)<HW+6)continue;
      const P=LIM_POOL;if(Math.hypot((x-P[0])/P[2],(z-P[1])/P[3])<1.1)continue;
      const s2=rand(.5,1.8);p.set(x,meshY(x,z)+s2*.3,z);e.set(rand(0,3),rand(0,3),0);q.setFromEuler(e);
      sc.set(s2,s2*.7,s2);m4.compose(p,q,sc);rub.setMatrixAt(c++,m4);
    }
    rub.count=c;rub.instanceMatrix.needsUpdate=true;world.add(rub);
    const HS=30;
    const hs=new THREE.InstancedMesh(flat(new THREE.BoxGeometry(1,1,1)),psMat({color:0x8a5a46}),HS);
    const win=new THREE.InstancedMesh(flat(new THREE.BoxGeometry(1,1,1)),psMat({color:0xffd27a,unlit:true}),HS);
    let h=0;
    for(let n=0;n<80&&h<HS;n++){
      const x=-300+n*8+hash2(n,1)*6,z=-232-hash2(n,2)*50;
      if(latAt(x,z)<HW+20)continue;
      const w=6+hash2(n,3)*6,ht=5+hash2(n,4)*6,y=meshY(x,z);
      e.set(0,0,0);q.setFromEuler(e);p.set(x,y+ht/2,z);sc.set(w,ht,7);m4.compose(p,q,sc);hs.setMatrixAt(h,m4);
      p.set(x,y+ht*.6,z+3.6);sc.set(1.2,1.2,.2);m4.compose(p,q,sc);win.setMatrixAt(h,m4);h++;
    }
    hs.count=win.count=h;hs.instanceMatrix.needsUpdate=win.instanceMatrix.needsUpdate=true;world.add(hs);world.add(win);
    const ch=new THREE.Group();bx(ch,6,16,6,psMat({color:0x8a5a46}),0,8,0);
    const sp=new THREE.Mesh(flat(new THREE.ConeGeometry(3.6,14,4)),psMat({color:0x3a4a44}));sp.position.y=23;sp.rotation.y=Math.PI/4;ch.add(sp);
    ch.position.set(-40,meshY(-40,-262),-262);world.add(ch);
  }
  /* ── Sprickan: white walls of the cutting, rails and a forgotten cart ── */
  const S=ALTS.find(r=>r.id==='sprickan');
  if(S){
    const WL=S.n*2;
    const wall=new THREE.InstancedMesh(flat(new THREE.BoxGeometry(2.4,1,2.6)),lime,WL);
    let c=0;
    for(let j=COMMIT+6;j<S.n-MERGE-2;j+=2)for(const sg of [-1,1]){
      const o=sg*(S.hw+2.4),x=S.X[j]+S.RX[j]*o,z=S.Z[j]+S.RZ[j]*o;
      const mi=nearestGlobal(x,z);if(Math.abs((x-sx[mi])*rx[mi]+(z-sz[mi])*rz[mi])<HW+5)continue;
      const ht=4+hash2(j,sg)*5;
      e.set(0,Math.atan2(S.FX[j],S.FZ[j]),0);q.setFromEuler(e);p.set(x,S.Y[j]+ht/2-.3,z);sc.set(1,ht,1);
      m4.compose(p,q,sc);if(c<WL)wall.setMatrixAt(c++,m4);
    }
    wall.count=c;wall.instanceMatrix.needsUpdate=true;world.add(wall);
    const rail=psMat({color:0x5a4a3a});
    for(const o of [-.75,.75]){
      const pos=[],idx=[];
      for(let j=COMMIT+4;j<S.n-MERGE;j++){for(const d of [-.08,.08])pos.push(S.X[j]+S.RX[j]*(o+d),S.Y[j]+.12,S.Z[j]+S.RZ[j]*(o+d));}
      for(let k=0;k<pos.length/6-1;k++){const a=2*k;idx.push(a,a+1,a+2,a+1,a+3,a+2);}
      const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setIndex(idx);g.computeVertexNormals();
      world.add(new THREE.Mesh(g,psMat({color:0x7a6a58,side:THREE.DoubleSide})));
    }
    const jc=Math.round(S.n*.72),cart=new THREE.Group();
    bx(cart,1.8,1.3,2.6,rail,0,1.1,0);bx(cart,1.6,.4,2.2,lime,0,1.9,0);
    const o=S.hw+1.0;cart.position.set(S.X[jc]+S.RX[jc]*o,S.Y[jc],S.Z[jc]+S.RZ[jc]*o);
    cart.rotation.set(0,Math.atan2(S.FX[jc],S.FZ[jc]),.25);world.add(cart);
  }
  /* ── the switch: a pressure plate in the road and a big lever beside it ── */
  {
    const v=mainPt(LIM_SW[0],-IN*LIM_SW[1]);
    const stripe=pixTex(32,32,g=>{for(let i=-32;i<64;i+=8){g.fillStyle='#e8c020';g.beginPath();g.moveTo(i,0);g.lineTo(i+4,0);g.lineTo(i+36,32);g.lineTo(i+32,32);g.fill();}
      g.globalCompositeOperation='destination-over';g.fillStyle='#1c1c1c';g.fillRect(0,0,32,32);});
    const plate=new THREE.Mesh(flat(new THREE.BoxGeometry(3.4,.18,3.4)),psMat({map:stripe}));
    plate.position.set(v.x,v.y+.1,v.z);plate.rotation.y=v.yaw;world.add(plate);
    const lv=new THREE.Group(),o=-IN*(HW+2.8),w=mainPt(LIM_SW[0],o);
    bx(lv,1.6,1.2,1.6,steel,0,.6,0);
    const arm=new THREE.Group();arm.position.y=1.2;lv.add(arm);
    bx(arm,.3,3.4,.3,psMat({color:0xc8321f}),0,1.7,0);bx(arm,.7,.7,.7,psMat({color:0xffe070,unlit:true}),0,3.5,0);
    lv.position.set(w.x,meshY(w.x,w.z),w.z);lv.rotation.y=w.yaw;world.add(lv);
    const sg=pixTex(64,32,g=>{g.fillStyle='#1c1c1c';g.fillRect(0,0,64,32);g.fillStyle='#e8c020';
      g.font='9px "Press Start 2P",monospace';g.textAlign='center';g.textBaseline='middle';g.fillText('SPAKEN',32,16);});
    const s2=mainPt(LIM_SW[0]-8,-IN*(HW+3.4));
    const po=new THREE.Mesh(flat(new THREE.BoxGeometry(.2,2.8,.2)),steel);po.position.set(s2.x,meshY(s2.x,s2.z)+1.4,s2.z);world.add(po);
    const pl=new THREE.Mesh(new THREE.PlaneGeometry(3,1.5),psMat({map:sg,unlit:true,side:THREE.DoubleSide}));
    pl.position.set(s2.x,meshY(s2.x,s2.z)+3.2,s2.z);pl.rotation.y=s2.yaw+Math.PI;world.add(pl);
    sceneryLimhamn.sw={plate,arm,y:v.y};
  }
}
const LIM_SW=[334,5.6];                              /* the switch: main sample, metres out from centre toward the quarry wall */
/* steam grates: [sample, lateral, period, phase] at the rim kilns and at the old floor kiln */
const LIM_GRATES=[[[150,-4.5,6.4,0],[162,3.5,6.4,2.2],[174,-1,6.4,4.3]],[[426,3.5,7.2,1],[438,-3.5,7.2,4.6]]];
function hazardsLimhamn(H){
  const IN=limInside();
  /* steam vents: hiss and wisps first, then a tall white plume that lifts and slows you */
  const grateTex=pixTex(16,16,g=>{g.fillStyle='#202224';g.fillRect(0,0,16,16);g.fillStyle='#55585a';
    for(let i=1;i<16;i+=3)g.fillRect(i,1,1,14);g.fillRect(0,0,16,1);g.fillRect(0,15,16,1);});
  const gm=psMat({map:grateTex});gm.polygonOffset=true;gm.polygonOffsetFactor=-2;gm.polygonOffsetUnits=-2;
  const plumeM=psMat({color:0xf2f4f6,unlit:true,transparent:true,opacity:.6,depthWrite:false});
  const plumeG=new THREE.CylinderGeometry(1.2,2.2,10,8,1,true).translate(0,5,0);
  LIM_GRATES.flat().forEach(([i0,lat0,per,ph],n)=>{
    const lat=lat0*IN,v=mainPt(i0,lat);
    const gr=new THREE.Mesh(new THREE.PlaneGeometry(2.8,2.8).rotateX(-Math.PI/2),gm);
    gr.position.set(v.x,v.y+.06,v.z);gr.rotation.y=v.yaw;world.add(gr);
    const pl=new THREE.Mesh(plumeG,plumeM);pl.position.set(v.x,v.y,v.z);pl.visible=false;world.add(pl);
    let hissed=-1;
    H.push({id:'limVent'+n,period:per,phase:ph,mesh:pl,
      update(u){
        const cyc=Math.floor((raceTime+ph)/per);
        if(u>0.5&&u<0.7){                                  /* the warning: hiss and wisps */
          if(Math.random()<.35)puff(v.x+rand(-1,1),v.y+.3,v.z+rand(-1,1),.95,.96,.98,.6);
          if(hissed!==cyc&&state==='race'){hissed=cyc;const d=Math.hypot(player.x-v.x,player.z-v.z);if(d<70)limHiss(1-d/80);}
          pl.visible=false;
        }else if(u>=0.7&&u<0.92){
          const s=Math.min(1,(u-0.7)/0.05),f=u>0.87?1-(u-0.87)/0.05:1;
          pl.visible=true;pl.scale.set(.6+.4*f,s*f+.05,.6+.4*f);pl.rotation.y=clock*2;
          if(Math.random()<.5)puff(v.x+rand(-1.5,1.5),v.y+rand(1,8),v.z+rand(-1.5,1.5),.92,.94,.96,.8);
        }else pl.visible=false;
        this.on=u>=0.71&&u<0.9;
      },
      hit(k){if(!this.on||k.rib)return false;const dx=k.x-v.x,dz=k.z-v.z;return dx*dx+dz*dz<2.6*2.6&&Math.abs(k.y-v.y)<4;},
      effect(k){k.slow=Math.max(k.slow,1.0);k.vy=Math.max(k.vy,10);k.vx*=0.75;k.vz*=0.75;k.boost=0;
        for(let p=0;p<10;p++)puff(k.x+rand(-1,1),k.y+rand(.2,1.5),k.z+rand(-1,1),.95,.95,.97,.7);
        if(k===player){toast('ÅNGA!');ping(1800,600,.25);shake=Math.min(1,shake+.35);}}});
  });
  /* kiln smoke drifting off the tops, purely for looks */
  const smokeM=psMat({color:0x6a6670,transparent:true,opacity:.45,depthWrite:false});
  const smokeG=flat(new THREE.IcosahedronGeometry(2.4,0));
  const K=sceneryLimhamn.kilns||[];
  const puffs=[];
  K.forEach((kg,n)=>{for(let s=0;s<3;s++){const m=new THREE.Mesh(smokeG,smokeM);world.add(m);puffs.push({m,kg,s,top:n<4?18:19.5});}});
  H.push({id:'limSmoke',period:6,phase:0,update(u){
    for(const P of puffs){const f=(u+P.s/3)%1,top=P.kg.position.y+P.top;
      P.m.position.set(P.kg.position.x+f*9,top+f*18,P.kg.position.z+f*4);P.m.scale.setScalar(.6+f*1.8);}}});
  /* limestone chunks riding the conveyor */
  const legs=sceneryLimhamn.belt;
  if(legs){
    const CH=36,chunk=new THREE.InstancedMesh(flat(new THREE.DodecahedronGeometry(.6,0)),psMat({color:0xe4e0d4}),CH);
    world.add(chunk);
    const L0=legs[0][0].distanceTo(legs[0][1]),L1=legs[1][0].distanceTo(legs[1][1]);
    const m4=new THREE.Matrix4(),q=new THREE.Quaternion(),sc=new THREE.Vector3(1,1,1),pt=new THREE.Vector3();
    H.push({id:'limBelt',period:30,phase:0,update(u){
      for(let c=0;c<CH;c++){let s=((u+c/CH)%1)*(L0+L1);
        if(s<L0)pt.copy(legs[0][0]).lerp(legs[0][1],s/L0);else pt.copy(legs[1][0]).lerp(legs[1][1],(s-L0)/L1);
        pt.y+=.8;m4.compose(pt,q,sc);chunk.setMatrixAt(c,m4);}
      chunk.instanceMatrix.needsUpdate=true;}});
  }
  /* the switch: touch the plate and the boulder in Sprickan cracks open for you at your next line crossing */
  const R=ALTS.find(r=>r.id==='sprickan'),SW=sceneryLimhamn.sw;
  if(R&&SW){
    const v=mainPt(LIM_SW[0],-IN*LIM_SW[1]);
    let lastT=0,leverT=-9;
    H.push({id:'limSwitch',period:1,phase:0,update(){
      if(raceTime<lastT-0.5||state==='grid'||state==='menu')for(const k of karts)k.limSw=null;   /* a new race */
      lastT=raceTime;
      const down=clamp(1-(clock-leverT)/1.4,0,1);
      SW.arm.rotation.x=-1.0*down+.35*(1-down);SW.plate.position.y=SW.y+.1-.12*down;
      if(state!=='race')return;
      for(const k of karts){
        if(k.parked||k.done)continue;
        if(!k.rib&&k.limSw==null){
          const dx=k.x-v.x,dz=k.z-v.z;
          if(dx*dx+dz*dz<2.3*2.3&&Math.abs(k.y-v.y)<2.5){
            k.limSw=k.lap;leverT=clock;
            for(let p=0;p<8;p++)puff(v.x+rand(-1.5,1.5),v.y+.4,v.z+rand(-1.5,1.5),1,.85,.4,.5);
            if(k===player){toast('SPAKEN! BERGET SPRICKER NÄSTA VARV');klonk();}
          }
        }
        if(k.limSw!=null&&k.lap>k.limSw){                    /* crossed the line since: open it for them */
          k.limSw=null;
          if(k.lap>=LAPS)continue;
          const was=R.open;R.open=true;R.opener=k;
          const B=BLOCKERS.find(b=>b.R===R);
          if(!was&&B)for(let p=0;p<22;p++)puff(B.x+rand(-2.5,2.5),B.y+rand(.5,4),B.z+rand(-2.5,2.5),.92,.9,.84,.9);
          if(k===player){toast('SPRICKAN ÄR ÖPPEN!');ping(300,900,.25);}
        }
      }
    }});
  }
}
