"use strict";
/* ───────── Trollhättan ───────── */
/* Slusskalaset: Slusstrollet's home track in Västgötacupen. A fictional Trollhättan: start on the
   upper bank above a flight of three locks, run down the service road beside the chambers while a
   boat climbs them, round the brick machinery yard, along the lower canal bank and back up
   through the wooded industrial edge, past the power station's pipes. Not a real map. */
SURF.trollGrus={top:o=>o+(1-o)*0.42,grip:o=>1-0.40*(1-o),fuel:1.1,name:'GRUS'};
SFX.trollGrus=SFX.gravel;
ROADTEX.trollGrus=()=>pixTex(64,64,g=>{               /* the towpath: packed grey-brown gravel, two ruts, tufts of grass */
  g.fillStyle='#9a8e78';g.fillRect(0,0,64,64);
  for(let i=0;i<1100;i++){g.fillStyle=Math.random()>.5?'rgba(196,186,164,.6)':'rgba(84,74,60,.5)';
    g.fillRect((Math.random()*64)|0,(Math.random()*64)|0,1,1);}
  g.fillStyle='rgba(90,80,64,.4)';for(const x of [14,21,41,48])g.fillRect(x,0,3,64);
  g.fillStyle='rgba(88,128,60,.7)';for(let i=0;i<14;i++)g.fillRect(29+((Math.random()*6)|0),(Math.random()*62)|0,2,2);
});
ROADTEX.trollPlattor=()=>pixTex(64,64,g=>{            /* Maskinhuset's floor: worn concrete slabs, oil stains */
  g.fillStyle='#8e8a84';g.fillRect(0,0,64,64);
  for(let i=0;i<700;i++){g.fillStyle=Math.random()>.5?'rgba(170,166,158,.45)':'rgba(60,58,54,.4)';
    g.fillRect((Math.random()*64)|0,(Math.random()*64)|0,1,1);}
  g.fillStyle='rgba(40,38,34,.6)';for(let k=0;k<64;k+=16){g.fillRect(0,k,64,1);g.fillRect(k,0,1,64);}
  g.fillStyle='rgba(30,28,24,.3)';for(let i=0;i<4;i++)g.fillRect((Math.random()*56)|0,(Math.random()*56)|0,8,5);
});
VERGEC.trollhattan=['#8a8a86','#a2a29c','#6c6c68'];    /* granite kerbs, like the lock walls */
GROUND.trollhattan={cell:30,stripe:0.9,verge:0x7c8a68,
  cols:[0x5e8e44,0x6a9a4a,0x557f3e,0x72a050,0x6e7a5e,0x4f7a3c,0x80886e]};

/* The water: one line from the upper canal down through the three chambers to the lower canal,
   which bends round the machinery yard and runs east past the lower bank. [x, z, half-width] */
const TROLL_CANAL=[[-62,-480,10],[-62,-112,10],[-44,-72,10],[-44,-58,7],[-44,150,7],[-44,160,11],
  [-52,190,11],[-62,225,11],[-58,262,11],[-36,295,11],[0,312,11],[60,316,11],[480,316,11]];
const TROLL_UP=18.2, TROLL_LOW=2.0;                    /* upper and lower canal water */
const TROLL_GATES=[-58,11,80,150];                     /* the gate heads along x = -44, north to south */
const TROLL_HI=[18.2,13.5,8.8], TROLL_LO=[13.5,8.8,2.0];   /* each chamber full and empty, north to south */
const TROLL_CX=-44;
/* where the set pieces sit, worked out from the samples once the track is laid */
const TROLL_SPOL=488, TROLL_SIGN=46, TROLL_PICNIC=30;
const TROLL={noDig:false,water:[],boat:null,gates:[],lapSaid:-1,flag:null,crane:null};

/** the hill: the upper bank in the north, the lower bank in the south, one long slope between */
const trollField=(x,z)=>4+16*(1-smooth(-70,205,z));
/** distance from the canal's centre line, and its half-width there */
function trollCanalD(x,z){
  let best=1e9,w=10;
  for(let n=0;n<TROLL_CANAL.length-1;n++){
    const [ax,az,aw]=TROLL_CANAL[n],[bx,bz,bw]=TROLL_CANAL[n+1];
    const dx=bx-ax,dz=bz-az,L2=dx*dx+dz*dz,t=clamp(((x-ax)*dx+(z-az)*dz)/L2,0,1);
    const d=Math.hypot(x-ax-dx*t,z-az-dz*t);if(d<best){best=d;w=aw+(bw-aw)*t;}
  }
  return [best,w];
}
/** the canal and the chambers are dug deep; quays and water cover the hole */
function trollDig(x,z){
  if(TROLL.noDig)return 0;
  const [d,w]=trollCanalD(x,z);
  return d>w+3?0:-40*(1-smooth(w+2,w+3,d));
}
/** the ground as it would be without the canal dug into it: what quays and props stand on */
function trollGround(x,z){TROLL.noDig=true;const y=meshY(x,z);TROLL.noDig=false;return y;}
/** where buildStations will put the pumps: the edges are built before the stations are */
function trollPumps(st){
  return (st.stations||[]).map(sp=>{let at=Math.round(N*sp[0]);
    for(const J of JUMPS)if(Math.min(Math.abs(at-J.at),N-Math.abs(at-J.at))<J.up+J.dn+16)at=(at+46)%N;
    return {at,len:12,side:sp[1]};});
}
const trollInBay=(P,i,side,pad)=>P.some(S=>{let d=i-S.at;if(d<-N/2)d+=N;else if(d>N/2)d-=N;return S.side===side&&d>-pad&&d<S.len+pad;});

STAGES.push({ id:'trollhattan', group:'vastgota', name:'TROLLHÄTTAN', sub:'SLUSSKALASET',
  order:23, tag:'Tre slussar, en båt och tre varv. Båten har företräde. Båten är inte med i tävlingen. Båten vet inte om det.',
  view:{x:-10,z:-110,h:22,to:{x:-44,z:60,h:4},fov:60},
  hw:8.4,
  bars:[0.7,0.6,0.7], laps:3, stand:false, bankGain:0.2, bankMax:0.24,
  blurb:'Slusstrollet\'s home track: start on the upper bank above a flight of three locks, run down the service road beside the chambers while a boat climbs them in its own good time, swing round the brick machinery yard, race along the lower canal bank and climb back up through the wooded industrial edge, past the power station\'s great pipes. Maskinhuset is the paved way through the old machine hall, quick but tight; Dragvägen is the gravel towpath beside the old dry locks, shorter but rough, with a slow climb at the end. A service outlet on the climb flushes water across one half of the road when its amber lamp starts flashing.',
  role:'Långa nedförsbacken vid slussarna, en kanalraka och en lång klättring tillbaka upp till övre kajen.',
  sky:[0xdcebf4,0x3f86d4], fog:[0xcfdfe8,90,420], amb:0x66707c, dif:0xfff2da,
  road:'asphalt', verge:'trollhattan', edge:'trollhattan', ground:'trollhattan',
  terrain:{size:960,seg:160},
  /* away from the roads the ground follows the hill, not the nearest road; the canal is dug into it */
  mod:(x,z,t)=>t*(trollField(x,z)-sy[nearestGlobal(x,z)])-rolls(x,z)*t*0.85+trollDig(x,z),
  land:(x,z,out)=>landTroll(x,z,out),
  jumpSpec:[{at:256,h:2.6,drop:1.8,up:10,dn:6,rec:14}],
  ctrl:[[0,20,-150],[0,20,-100],[0,20,-50],[1,17.5,0],[2,13.5,50],[2,9.5,100],[0,6.5,145],
        [-12,5,185],[-22,4,224],[-16,4,254],[4,4,270],[34,4,274],[70,4,272],
        [120,4,270],[170,4,270],[220,4,270],[270,4,270],[316,4,272],
        [348,4.2,272],[368,4.6,256],[374,5.2,228],[366,6,192],
        [356,8,150],[348,10.5,100],[344,13,50],[346,15.5,0],[348,18,-60],[344,20,-108],[334,20,-150],
        [318,20,-186],[290,20,-210],[240,20,-228],[180,20,-232],[120,20,-232],[70,20,-230],
        [30,20,-226],[8,20,-214],[0,20,-194]],
  stations:[[0.61,1],[0.85,1]],
  routes:[
    {id:'maskinhuset',name:'MASKINHUSET',a:118,b:226,hw:4.0,side:-1,lead:14,leadLat:9,
     mid:[[0.25,10],[0.5,14],[0.75,10]],surface:'road',tex:'trollPlattor',risk:0.3,
     blurb:'The paved way straight through the old machine hall, between the turbines and the great gear wheels. It cuts the loop round the yard, but the hall is narrow: keep it tidy on the way in and out.'},
    {id:'dragvagen',name:'DRAGVÄGEN',a:292,b:414,hw:4.2,side:-1,lead:12,leadLat:9,
     mid:[[0.25,7],[0.5,9],[0.75,7]],surface:'trollGrus',tex:'trollGrus',risk:0.4,
     blurb:'The old towpath where horses once pulled the barges, beside the dry stone locks of the first canal. Shorter than the road round the bend, but rough gravel, and it climbs hard at the end.'}],
  stamps:[
    {id:'tro1',dish:'Äggmacka',ini:'Ä',kind:'intro',route:'main',i:TROLL_PICNIC,lat:5.6,
     hint:'Vid picknickbordet på övre kajen, där båtarna väntar.',
     story:'Sliced boiled egg on buttered bread, with a sprig of dill or a curl of kaviar from the tube on top. Every lock keeper\'s lunchbox has one, wrapped in greaseproof paper, eaten on the bench while the chamber fills.'},
    {id:'tro2',dish:'Kaffetermos',ini:'K',kind:'route',route:'maskinhuset',f:0.5,lat:0,
     hint:'Inne i Maskinhuset, mellan turbinerna.',
     story:'Boiled coffee, strong enough to stand a spoon in, kept hot in a dented steel flask on the machine hall\'s workbench. The fitters pour it into the lid, blow on it and drink it standing up, one ear on the turbines.'},
    {id:'tro3',dish:'Slussbulle',ini:'S',kind:'air',route:'main',jump:0,after:5,lat:0,air:4.2,
     hint:'Högt över rampen i maskingården.',
     story:'Not a real bun, or not yet: the yard crew\'s name for a cardamom bun with a stripe of blue-and-yellow icing across it, like a lock gate, and a pool of vanilla custard in the middle. Eaten in two bites between boats.'}],
  postcard:{draw:(g,w,h)=>trollPostcard(g,w,h),
    caption:'Kaptenen vinkade in oss i mål. Båten väntar fortfarande på sin tur.'},
  hazards:H=>hazardsTroll(H), scenery:()=>sceneryTroll()
});

/* the edge: a galvanised guardrail on posts, a gap at every lane mouth and forecourt */
EDGES.trollhattan=st=>{
  const step=2,L=SEG*step+.15,P=trollPumps(st);
  const post=rosInst(flat(new THREE.BoxGeometry(.18,.9,.18)).translate(0,.45,0),psMat({color:0x6a6e72}),N*2);
  const rail=rosInst(flat(new THREE.BoxGeometry(.12,.34,L)),psMat({color:0xb8bec4}),N*2);
  for(let i=0;i<N;i+=step)for(const side of [-1,1]){
    const o=side*(HW+4.3),x=sx[i]+rx[i]*o,z=sz[i]+rz[i]*o;
    if(nearAlt(x,z,2.6)||trollInBay(P,i,side,3))continue;
    if(side>0&&Math.abs(i-TROLL_SPOL)<6)continue;                       /* the service outlet stands in the gap */
    const y=meshY(x,z),yw=Math.atan2(fx[i],fz[i]);
    post.put(x,y-.05,z,yw);rail.put(x,y+.68,z,yw);
  }
  post.done();rail.done();
};
function landTroll(x,z,out){
  const [d,w]=trollCanalD(x,z);
  if(d<w+11)out.setHex(0x8e8c86);                                   /* quay stones */
  else if(d<w+14)out.setHex(0x9a9686);
}
/** a granite block texture for the quays and chamber walls */
function trollStoneTex(){
  const t=pixTex(32,32,g=>{
    g.fillStyle='#8c8a84';g.fillRect(0,0,32,32);
    for(let i=0;i<260;i++){g.fillStyle=Math.random()>.5?'rgba(168,164,156,.5)':'rgba(70,68,64,.45)';
      g.fillRect((Math.random()*32)|0,(Math.random()*32)|0,1,1);}
    g.fillStyle='rgba(40,40,38,.55)';
    for(let y=0;y<32;y+=8){g.fillRect(0,y,32,1);for(let x=(y%16?6:0);x<32;x+=12)g.fillRect(x,y,1,8);}
  });
  t.wrapS=t.wrapT=THREE.RepeatWrapping;return t;
}
/** a point along the canal line, s metres from its north end: {x,z,yaw} (yaw along the flow, southward) */
function trollAlong(s){
  for(let n=0;n<TROLL_CANAL.length-1;n++){
    const [ax,az]=TROLL_CANAL[n],[bx,bz]=TROLL_CANAL[n+1],L=Math.hypot(bx-ax,bz-az);
    if(s<=L||n===TROLL_CANAL.length-2){const t=clamp(s/L,0,1);return {x:ax+(bx-ax)*t,z:az+(bz-az)*t,yaw:Math.atan2(bx-ax,bz-az)};}
    s-=L;
  }
}
/** arc length along the canal line to the point nearest (x,z) on segment n */
function trollS(n,x,z){
  let s=0;for(let k=0;k<n;k++)s+=Math.hypot(TROLL_CANAL[k+1][0]-TROLL_CANAL[k][0],TROLL_CANAL[k+1][1]-TROLL_CANAL[k][1]);
  const [ax,az]=TROLL_CANAL[n],[bx,bz]=TROLL_CANAL[n+1],dx=bx-ax,dz=bz-az;
  return s+Math.hypot(dx,dz)*clamp(((x-ax)*dx+(z-az)*dz)/(dx*dx+dz*dz),0,1);
}
/** the lock cycle on the race clock, 120 s: where the boat is, each chamber's water, how far each gate stands open */
const TROLL_T=120;
function trollLock(t){
  const u=(((t+10)%TROLL_T)+TROLL_T)%TROLL_T/TROLL_T, ss=(a,b)=>smooth(a,b,u);
  const sIn=trollS(10,30,314),s3=trollS(3,TROLL_CX,115),s2=trollS(3,TROLL_CX,45.5),s1=trollS(3,TROLL_CX,-23.5),sOut=trollS(0,-62,-330);
  const HI=TROLL_HI,LO=TROLL_LO;
  /* chamber 1 (north), 2, 3 (south): each fills with the boat in it and empties once it has gone up */
  const c1=lerp(HI[0],LO[0],ss(.30,.45))+(HI[0]-LO[0])*ss(.58,.74);
  const c2=lerp(HI[1],LO[1],ss(.05,.20))+(HI[1]-LO[1])*ss(.33,.49);
  const c3=lerp(LO[2],HI[2],ss(.08,.24))-(HI[2]-LO[2])*ss(.35,.50);
  let s,vis=true;
  if(u<.08)s=lerp(sIn,s3,ss(0,.08));
  else if(u<.27)s=s3;
  else if(u<.33)s=lerp(s3,s2,ss(.27,.33));
  else if(u<.52)s=s2;
  else if(u<.58)s=lerp(s2,s1,ss(.52,.58));
  else if(u<.77)s=s1;
  else{s=lerp(s1,sOut,ss(.77,.97));vis=u<.97;}
  const p=trollAlong(s),G=TROLL_GATES;
  const y=p.z>G[3]?TROLL_LOW:p.z>G[2]?c3:p.z>G[1]?c2:p.z>G[0]?c1:TROLL_UP;
  const open=[ss(.74,.77)*(1-ss(.92,.95)),ss(.49,.52)*(1-ss(.58,.61)),ss(.24,.27)*(1-ss(.33,.36)),
              u<.5?1-ss(.08,.11):ss(.95,.98)];                   /* the bottom gate lets the next boat in */
  return {u,x:p.x,z:p.z,yaw:p.yaw,y,vis,lv:[c1,c2,c3],open};
}

function sceneryTroll(){
  const RES=[];
  const res=(x,z,r)=>RES.push([x,z,r]);
  const free=(x,z,pad)=>{
    if(latAt(x,z)<HW+pad)return false;
    const [d,w]=trollCanalD(x,z);if(d<w+11+pad)return false;
    for(const r of RES)if(Math.hypot(x-r[0],z-r[1])<r[2])return false;
    return true;
  };
  const at=(i,o)=>{const q=mainPt(i,o);q.y=meshY(q.x,q.z);return q;};
  const yawAt=i=>{i=((i%N)+N)%N;return Math.atan2(fx[i],fz[i]);};
  const H=(a,b)=>hash2(a*1.37+3.1,b*0.71-2.3);
  const M=ALTS.find(r=>r.id==='maskinhuset'),D=ALTS.find(r=>r.id==='dragvagen');
  const sign=(text,bg,fg,w,h,pw,ph,px,border)=>new THREE.Mesh(new THREE.PlaneGeometry(pw,ph),
    psMat({map:lerumSignTex(text,bg,fg,w,h,px,border),unlit:true,side:THREE.DoubleSide}));
  const grey=psMat({color:0x8a9096}),dark=psMat({color:0x2a2c30}),wood=psMat({color:0x7a5a3a});
  const stoneM=psMat({map:trollStoneTex()});
  const P=trollPumps(stage);
  for(const S_ of P){const q=mainPt(S_.at+6,S_.side*(HW+13));res(q.x,q.z,22);}
  TROLL.water=[];TROLL.gates=[];TROLL.lapSaid=-1;TROLL.crane=null;

  /* the canal: quays of granite blocks, water, bollards */
  {const quay=rosInst(flat(new THREE.BoxGeometry(1,1,1)).translate(0,.5,0),stoneM,900);
    const coping=rosInst(flat(new THREE.BoxGeometry(1,.3,1)),psMat({color:0xb4b0a6}),900);
    const boll=rosInst(flat(new THREE.CylinderGeometry(.32,.4,.8,6)).translate(0,.4,0),dark,200);
    const wpos=[],wuv=[],widx=[];let vb=0;
    for(let n=0;n<TROLL_CANAL.length-1;n++){
      const [ax,az,aw]=TROLL_CANAL[n],[bx,bz,bw]=TROLL_CANAL[n+1],L=Math.hypot(bx-ax,bz-az);
      const k=Math.max(1,Math.round(L/5)),fxx=(bx-ax)/L,fzz=(bz-az)/L,rxx=-fzz,rzz=fxx,yw=Math.atan2(fxx,fzz);
      const chamber=n===3;
      for(let m=0;m<k;m++){
        const t=(m+.5)/k,x=ax+(bx-ax)*t,z=az+(bz-az)*t,w=aw+(bw-aw)*t,len=L/k+.25;
        for(const sd of [-1,1]){
          const qx=x+rxx*sd*(w+5),qz=z+rzz*sd*(w+5);
          let top=Math.max(trollGround(x+rxx*sd*(w+11),z+rzz*sd*(w+11)),trollGround(qx,qz))+.25;
          if(chamber)top=Math.max(top,(z<TROLL_GATES[1]?TROLL_HI[0]:z<TROLL_GATES[2]?TROLL_HI[1]:TROLL_HI[2])+.7);
          const bot=(n<3?TROLL_UP:TROLL_LOW)-6;
          quay.put(qx,bot,qz,yw,10,top-bot,len);
          coping.put(x+rxx*sd*(w+.4),top,z+rzz*sd*(w+.4),yw,.9,1,len);
          if(m%3===1&&!chamber)boll.put(x+rxx*sd*(w+1.2),top,z+rzz*sd*(w+1.2),0);
        }
      }
      if(chamber)continue;                                 /* chamber water is its own, it moves */
      const y=n<3?TROLL_UP:TROLL_LOW;
      for(const [px,pz,pw] of [[ax,az,aw],[bx,bz,bw]])
        {wpos.push(px+rxx*(pw+.6),y,pz+rzz*(pw+.6),px-rxx*(pw+.6),y,pz-rzz*(pw+.6));wuv.push(0,0,1,0);}
      widx.push(vb,vb+1,vb+2,vb+1,vb+3,vb+2);vb+=4;
    }
    quay.done();coping.done();boll.done();
    const wg=new THREE.BufferGeometry();wg.setAttribute('position',new THREE.Float32BufferAttribute(wpos,3));
    wg.setAttribute('uv',new THREE.Float32BufferAttribute(wuv,2));wg.setIndex(widx);wg.computeVertexNormals();
    world.add(new THREE.Mesh(wg,psMat({color:0x3f6a80,unlit:true,side:THREE.DoubleSide})));
    /* ripples: short pale strokes on the open water */
    const rip=rosInst(new THREE.PlaneGeometry(1,.22).rotateX(-Math.PI/2),psMat({color:0x9cc0d0,unlit:true}),160);
    for(let n=0;n<150;n++){const seg=[0,1,5,6,7,8,9,10,11,11,11][n%11],[ax,az,aw]=TROLL_CANAL[seg],[bx,bz]=TROLL_CANAL[seg+1];
      const t=H(n,3),L=Math.hypot(bx-ax,bz-az),x=ax+(bx-ax)*t,z=az+(bz-az)*t,o=(H(3,n)*2-1)*(aw-1.5);
      rip.put(x-(bz-az)/L*o,(seg<3?TROLL_UP:TROLL_LOW)+.05,z+(bx-ax)/L*o,Math.atan2(bx-ax,bz-az)+Math.PI/2,rand(1.2,3.6),1,1);}
    rip.done();
    /* the chambers' water: one plane each, lifted and lowered on the race clock; the number on the far wall */
    for(let c=0;c<3;c++){const z0=TROLL_GATES[c],z1=TROLL_GATES[c+1];
      const w=new THREE.Mesh(new THREE.PlaneGeometry(14.8,z1-z0-.4).rotateX(-Math.PI/2),psMat({color:0x3f6a80,unlit:true}));
      w.position.set(TROLL_CX,TROLL_HI[c],(z0+z1)/2);world.add(w);TROLL.water.push(w);
      const q=new THREE.Mesh(new THREE.PlaneGeometry(3,3.4),psMat({map:pixTex(16,18,g=>{g.fillStyle='#f4f2ec';g.font='16px "Press Start 2P",monospace';
        g.textAlign='center';g.textBaseline='middle';g.fillText(String(c+1),8,10);}),unlit:true,transparent:true,alphaTest:.5,side:THREE.DoubleSide}));
      q.position.set(TROLL_CX-6.95,TROLL_HI[c]-1.1,(z0+z1)/2+12);q.rotation.y=Math.PI/2;world.add(q);}
  }

  /* the gates: mitre gates at each head, two leaves and a little gear house on each wall */
  for(let gi=0;gi<4;gi++){
    const z=TROLL_GATES[gi],W=7;
    const hi=(gi===0?TROLL_UP:TROLL_HI[gi-1])+1.6,lo=(gi<3?TROLL_LO[gi]:TROLL_LOW)-1.5,hh=hi-lo,Lf=W+.5;
    const leaves=[];
    for(const sd of [-1,1]){
      const piv=new THREE.Group();piv.position.set(TROLL_CX+sd*W,lo,z);world.add(piv);
      hoorBox(piv,Lf,hh,.7,psMat({color:0x4a3a2c}),-sd*Lf/2,hh/2,0);
      hoorBox(piv,Lf,.2,.9,psMat({color:0xf2c81c}),-sd*Lf/2,hh+.1,0);
      for(let b=1;b<4;b++)hoorBox(piv,Lf,.16,.76,dark,-sd*Lf/2,hh*b/4,0);
      hoorMerge(piv);piv.userData.sd=sd;leaves.push(piv);
    }
    for(const sd of [-1,1]){const x=TROLL_CX+sd*(W+3.2),y=Math.max(trollGround(x,z),hi-1.4);
      hoorBox(world,2.2,1.8,2.2,psMat({color:0x2f62a8}),x,y+.9,z+1.6);hoorBox(world,2.5,.25,2.5,dark,x,y+1.9,z+1.6);}
    TROLL.gates.push({leaves,z});
  }

  /* the boat: a white canal boat with a blue stripe, a red wheelhouse and its captain */
  {const g=new THREE.Group(),hull=psMat({color:0xf4f2ec}),blue=psMat({color:0x2f62a8});
    hoorBox(g,4.2,1.8,15,hull,0,.3,0);hoorBox(g,4.24,.5,15.04,blue,0,.6,0);
    const bow=new THREE.Mesh(flat(new THREE.ConeGeometry(2.1,3.4,4)).rotateX(Math.PI/2).rotateZ(Math.PI/4),hull);bow.position.set(0,.6,9.1);bow.scale.y=.6;g.add(bow);
    hoorBox(g,3.6,2.2,6,psMat({color:0xe8e4da}),0,2.3,-1);
    for(const sd of [-1,1])for(let n=0;n<4;n++)hoorBox(g,.06,.7,.9,psMat({color:0x3c4a58}),sd*1.82,2.6,-3.4+n*1.6);
    hoorBox(g,3.0,1.8,2.6,psMat({color:0xc8321f}),0,4.3,-3);
    hoorBox(g,2.6,.7,.08,psMat({color:0x3c4a58}),0,4.6,-1.66);
    hoorBox(g,.12,3,.12,dark,0,6.4,-4);
    const fl=new THREE.Mesh(new THREE.PlaneGeometry(1.4,.9),psMat({map:pixTex(10,6,c=>{c.fillStyle='#2f62a8';c.fillRect(0,0,10,6);c.fillStyle='#f2c81c';c.fillRect(3,0,2,6);c.fillRect(0,2,10,2);}),side:THREE.DoubleSide}));
    fl.position.set(0,7.4,-4.7);fl.rotation.y=Math.PI/2;g.add(fl);
    hoorMerge(g);
    /* the captain on the foredeck, with a tiny chequered flag he waves at anyone who passes */
    const cap=lerumNeighbour(0x1e2a48,0xe8e4da,false);cap.g.position.set(0,1.2,4.6);g.add(cap.g);
    hoorBox(cap.head,.46,.12,.46,psMat({color:0xf4f2ec}),0,.26,0);hoorBox(cap.head,.48,.06,.2,dark,0,.2,.26);
    const arm=new THREE.Group();arm.position.set(.36,1.5,0);cap.g.add(arm);
    hoorBox(arm,.16,.7,.16,psMat({color:0x1e2a48}),0,.35,0);hoorBox(arm,.03,.6,.03,dark,0,.95,0);
    const chk=new THREE.Mesh(new THREE.PlaneGeometry(.5,.36),psMat({map:pixTex(4,4,c=>{for(let i=0;i<4;i++)for(let j=0;j<4;j++){c.fillStyle=(i+j)%2?'#111':'#f4f4f4';c.fillRect(i,j,1,1);}}),side:THREE.DoubleSide}));
    chk.position.set(.25,1.1,0);arm.add(chk);
    cap.g.scale.setScalar(1.4);
    g.scale.setScalar(1.25);world.add(g);TROLL.boat=g;TROLL.flag=arm;
    const L=trollLock(0);g.position.set(L.x,L.y,L.z);g.rotation.y=L.yaw+Math.PI;}

  /* the lock keeper's tower beside the top of the flight */
  {const x=TROLL_CX-24,z=-40,y=trollGround(x,z),g=new THREE.Group();g.position.set(x,y,z);world.add(g);res(x,z,8);
    const body=new THREE.Mesh(rosBoxUV(6,9,6,3,3),psMat({map:borasFacadeTex('#b84a2e',true)}));body.position.y=-.3;g.add(body);
    hoorBox(g,7.2,2.6,7.2,psMat({color:0xd8d2c4}),0,10,0);
    for(const sd of [-1,1])hoorBox(g,.1,1.2,7.3,psMat({color:0x3c4a58}),sd*3.62,10.2,0);
    hoorBox(g,7.8,.4,7.8,psMat({color:0x2a5a3a}),0,11.5,0);
    hoorMerge(g);
    const s=sign('SLUSSVAKTEN','#2a2c30','#f4f2ec',80,14,5,.9,7);s.position.set(x+3.66,y+7.4,z);s.rotation.y=Math.PI/2;world.add(s);}
  /* the sign on the service road: it is meant for boats, but it stands where the karts are */
  {const i=TROLL_SIGN,q=at(i,HW+5),g=new THREE.Group();g.position.set(q.x,q.y,q.z);g.rotation.y=yawAt(i)+Math.PI;world.add(g);res(q.x,q.z,5);
    for(const x of [-2.6,2.6])hoorBox(g,.22,4.8,.22,dark,x,2.4,0);
    const s1=sign('VÄNTA PÅ DIN TUR','#2f62a8','#f4f2ec',136,18,6,.8,8,'#f4f2ec');s1.position.set(0,4.3,0);g.add(s1);
    const s2=sign('GÄLLER BÅTAR','#f2c81c','#1e2022',104,16,4.6,.7,8);s2.position.set(0,3.4,0);g.add(s2);}

  /* Slusstrollet's rock: a stone troll the size of a house on the far bank, watching the boats */
  {const x=TROLL_CX-33,z=36,y=trollGround(x,z),g=new THREE.Group();g.position.set(x,y-.5,z);g.rotation.y=Math.PI/2-.3;g.scale.setScalar(1.6);world.add(g);res(x,z,18);
    const rock=psMat({color:0x9a968a}),rockD=psMat({color:0x7a766c}),moss=psMat({color:0x4f7a34});
    const blob=(r,m,px,py,pz,a,b,c)=>{const o=new THREE.Mesh(flat(new THREE.IcosahedronGeometry(r,0)),m);o.position.set(px,py,pz);o.scale.set(a||1,b||1,c||1);g.add(o);};
    blob(5.4,rock,0,5,0,1.1,1,.9);blob(3.4,rockD,0,10.6,.6,1,1.05,1);            /* body, head */
    blob(1.5,rock,0,10.2,4,1,1.1,1.5);                                           /* the nose */
    for(const sd of [-1,1]){blob(1.1,rockD,sd*3.2,11.6,.2,.6,1.2,.8);             /* ears */
      blob(1.9,rockD,sd*4.8,5.2,2.4,.9,1.6,.9);blob(1.6,rock,sd*2.8,.9,2.4,1.2,.8,1.4);   /* arms, feet */
      hoorBox(g,.5,.5,.3,psMat({color:0xf2e6a0,unlit:true}),sd*1.2,11.4,3.3);}  /* eyes that catch the light */
    blob(2.2,moss,0,13.6,-.2,1.3,.5,1.2);for(let n=0;n<6;n++)blob(.9,moss,Math.cos(n)*2.8,12.6+H(n,1),Math.sin(n)*1.6-.5,1,1.3,1);   /* mossy hair */
    hoorMerge(g);
    const s=sign('SLUSSTROLLET','#5e5c56','#f4f2ec',80,14,5,.9,7);s.position.set(x+10,y+1.2,z+9);s.rotation.y=Math.PI/2;world.add(s);
    hoorBox(world,.2,1.4,.2,dark,x+10,y+.3,z+9);}

  /* the start: spectators on a stand on the quay side, the canal behind them */
  {const k=-14,q=at(k,HW+14),g=new THREE.Group();g.position.set(q.x,q.y,q.z);g.rotation.y=yawAt(k)+Math.PI/2;world.add(g);res(q.x,q.z,26);
    for(let r=0;r<5;r++)hoorBox(g,40,1.3,2.6,psMat({color:r%2?0x6a7480:0x7c8692}),0,.6+r*1.2,-r*2.6);
    hoorBox(g,42,.4,13,psMat({color:0x2f62a8}),0,8.2,-5.2);for(const x of [-20,20])hoorBox(g,.4,8,.4,dark,x,4,-10.6);
    hoorMerge(g);
    for(let n=0;n<24;n++){const p=lerumNeighbour([0x2f62a8,0xf2c81c,0xc8321f,0x3f8a3a,0xe8e4da][n%5],[0x3a2a1e,0xd8b878,0x1e1a1a,0x8a5a3a][n%4],true);
      const r=n%4,x=-18+(n/24)*36+H(n,2)*1.2;p.g.position.set(x,.6+r*1.2+.65,-r*2.6);g.add(p.g);}}
  /* the upper-bank picnic spot: a table under a parasol on the quay side, where the boats wait */
  {const i=TROLL_PICNIC,q=at(i,HW+6.5),g=new THREE.Group();g.position.set(q.x,q.y,q.z);g.rotation.y=yawAt(i);world.add(g);res(q.x,q.z,6);
    hoorBox(g,2.6,.12,1.2,wood,0,.85,0);for(const s of [-1,1]){hoorBox(g,2.6,.1,.4,wood,0,.5,s*1.0);hoorBox(g,.1,.85,1.2,wood,s*1.1,.42,0);}
    hoorBox(g,.5,.2,.4,psMat({color:0xf4f2ec}),.4,1.0,0);hoorBox(g,.3,.4,.3,psMat({color:0x8a8e92}),-.6,1.12,.1);
    hoorMerge(g);
    const u=borasUmbrella(1.8,3,'#2f62a8','#f2c81c',8);u.position.y=3.1;g.add(u);}

  /* Maskinhuset: a long brick hall over the passage, turbines and gear wheels along its walls */
  if(M){
    const j0=COMMIT+8,j1=M.n-MERGE-8,W=M.hw+4.4,Dp=10;
    const hall=[];
    for(let j=j0;j<=j1;j+=2)for(const sd of [-1,1]){const q=lanePt(M,j/(M.n-1),sd*(W+Dp/2));hall.push([q.x,M.Y[j]-.3,q.z,q.yaw,Dp,SEG*2+.3,9.4]);res(q.x,q.z,7);}
    world.add(new THREE.Mesh(borasMergeBoxes(hall),psMat({map:borasFacadeTex('#a8442c',true)})));
    const roofL=rosInst(flat(new THREE.BoxGeometry(2*W+2*Dp+.6,.5,SEG*2+.3)),psMat({color:0x4a5258}),hall.length);
    const lite=rosInst(flat(new THREE.BoxGeometry(3,.2,SEG*2+.3)),psMat({color:0xc8dce8,unlit:true}),hall.length);
    for(let j=j0;j<=j1;j+=2){const q=lanePt(M,j/(M.n-1),0);roofL.put(q.x,M.Y[j]+9.3,q.z,q.yaw);if(j%4===0)lite.put(q.x,M.Y[j]+9.0,q.z,q.yaw);}
    roofL.done();lite.done();
    const cog=rosInst(flat(new THREE.CylinderGeometry(1,1,.5,12)).rotateZ(Math.PI/2),psMat({color:0x3a5a6a}),40);
    const tooth=rosInst(flat(new THREE.BoxGeometry(.5,.5,.5)),psMat({color:0x3a5a6a}),500);
    const turb=rosInst(flat(new THREE.CylinderGeometry(1.4,1.8,2.4,10)).translate(0,1.2,0),psMat({color:0x2f62a8}),40);
    const dome=rosInst(flat(new THREE.SphereGeometry(1.4,8,4,0,6.283,0,1.57)),psMat({color:0xc8321f}),40);
    for(let j=j0+3;j<=j1-6;j+=7){
      const sd=j%14<7?-1:1,q=lanePt(M,j/(M.n-1),sd*(M.hw+2.6)),r=1.6+H(j,1)*1.2,yy=M.Y[j]+r+1.1;
      const ax=Math.sin(q.yaw),az=Math.cos(q.yaw);
      cog.put(q.x,yy,q.z,q.yaw,1,r,r);
      for(let t=0;t<12;t++){const a=t/12*6.283;tooth.put(q.x+ax*Math.cos(a)*(r+.2),yy+Math.sin(a)*(r+.2),q.z+az*Math.cos(a)*(r+.2),q.yaw,1,1,1,null,a);}
      const p=lanePt(M,(j+3)/(M.n-1),-sd*(M.hw+2.4));turb.put(p.x,M.Y[j+3],p.z,0);dome.put(p.x,M.Y[j+3]+2.4,p.z,0);
    }
    cog.done();tooth.done();turb.done();dome.done();
    const lamp=rosInst(flat(new THREE.BoxGeometry(.5,.3,.5)),psMat({color:0xffe6a8,unlit:true}),60);
    for(let j=j0;j<=j1;j+=5){const q=lanePt(M,j/(M.n-1),0);lamp.put(q.x,M.Y[j]+8.2,q.z,q.yaw);}
    lamp.done();
    for(const jj of [j0,j1]){const q=lanePt(M,jj/(M.n-1),0);
      const s=sign('MASKINHUSET','#2a2c30','#f2c81c',112,16,2*M.hw+4,1.1,7);s.position.set(q.x,M.Y[jj]+7.6,q.z);s.rotation.y=q.yaw+Math.PI;world.add(s);
      const bm=new THREE.Mesh(flat(new THREE.BoxGeometry(2*W,1.3,.6)),psMat({color:0x7a3020}));bm.position.set(q.x,M.Y[jj]+8.7,q.z);bm.rotation.y=q.yaw;world.add(bm);}
    for(let j=COMMIT;j<M.n-MERGE;j++)for(const sd of [-1,1]){const q=lanePt(M,j/(M.n-1),sd*(M.hw+3));res(q.x,q.z,5);}
  }

  /* Dragvägen: the old dry locks of the first canal beside the towpath, stepping up the slope */
  if(D){
    const off=-(D.hw+6.5),k0=COMMIT+6,k1=D.n-MERGE-6;
    const wall=rosInst(flat(new THREE.BoxGeometry(1,1,1)).translate(0,.5,0),stoneM,200);
    const wat=rosInst(new THREE.PlaneGeometry(1,1).rotateX(-Math.PI/2),psMat({color:0x4a6a5a,unlit:true}),100);
    const weir=rosInst(flat(new THREE.BoxGeometry(1,1,1)).translate(0,.5,0),psMat({color:0x5a4a3a}),30);
    const reed=rosInst(flat(new THREE.ConeGeometry(.25,1.6,3)).translate(0,.8,0),psMat({color:0x6a8a3a}),120);
    for(let j=k0;j<k1;j+=2){
      const q=lanePt(D,j/(D.n-1),off),y=trollGround(q.x,q.z);
      for(const sd of [-1,1])wall.put(q.x+q.rx*sd*3.4,y-1.2,q.z+q.rz*sd*3.4,q.yaw,.9,1.9,SEG*2+.2);
      wat.put(q.x,y+.12,q.z,q.yaw,6,1,SEG*2+.1);
      if(j%12===0)weir.put(q.x,y-.6,q.z,q.yaw+Math.PI/2,7.6,1.5,.8);
      if(H(j,5)>.55)reed.put(q.x+q.rx*(H(j,1)*4-2),y,q.z+q.rz*(H(j,1)*4-2),0,1,rand(.7,1.2),1);
      res(q.x,q.z,6);
    }
    wall.done();wat.done();weir.done();reed.done();
    const post=rosInst(flat(new THREE.CylinderGeometry(.18,.22,1.2,5)).translate(0,.6,0),wood,60);
    for(let j=k0;j<k1;j+=9){const q=lanePt(D,j/(D.n-1),-(D.hw+1.6));post.put(q.x,D.Y[j]-.1,q.z,0);}
    post.done();
    for(let j=COMMIT;j<D.n-MERGE;j++)for(const sd of [-1,1]){const q=lanePt(D,j/(D.n-1),sd*(D.hw+3));res(q.x,q.z,5);}
    const j=COMMIT-2,q=lanePt(D,j/(D.n-1),0),g=new THREE.Group();g.position.set(q.x,D.Y[j],q.z);g.rotation.y=q.yaw+Math.PI;world.add(g);
    for(const sd of [-1,1])hoorBox(g,.25,5.6,.25,wood,sd*(D.hw+1.2),2.8,0);
    const s=sign('DRAGVÄGEN','#5a4a3a','#f4f2ec',80,16,2*D.hw+2.4,1.1,7);s.position.set(0,5.4,0);g.add(s);
  }

  /* the machinery yard: the ramp of steel plates, cable drums, a crane, a fence */
  {const J=JUMPS[0];
    if(J){const plate=new THREE.InstancedMesh(flat(new THREE.BoxGeometry(2*HW-1,.12,SEG*.85)),psMat({map:pixTex(8,8,c=>{c.fillStyle='#6a7076';c.fillRect(0,0,8,8);
        c.fillStyle='#8a9096';for(let k=0;k<8;k+=2)c.fillRect(k,(k/2)%2*4,1,4);c.fillStyle='#f2c81c';c.fillRect(0,7,8,1);})}),J.up+1),o=new THREE.Object3D();
      o.rotation.order='YXZ';
      for(let k=-J.up;k<=0;k++){const ii=(J.at+k+N)%N;o.position.set(sx[ii],sy[ii]+.07,sz[ii]);
        o.rotation.set(-Math.atan2(sy[(ii+1)%N]-sy[(ii-1+N)%N],2*SEG),yawAt(ii),0);o.updateMatrix();plate.setMatrixAt(k+J.up,o.matrix);}
      plate.frustumCulled=false;world.add(plate);
      for(const sd of [-1,1]){const i=J.at-J.up-12,q=at(i,sd*(HW+2.8)),g=new THREE.Group();g.position.set(q.x,q.y,q.z);g.rotation.y=yawAt(i)+Math.PI;world.add(g);
        hoorBox(g,.14,2.4,.14,grey,0,1.2,0);
        const s=sign('RAMP','#f2c81c','#1e2022',32,14,1.4,.6,7);s.position.set(0,2.5,0);g.add(s);}}
    const drum=rosInst(flat(new THREE.CylinderGeometry(1.3,1.3,1.4,10)).rotateX(Math.PI/2),psMat({color:0x8a5a32}),20);
    const coil=rosInst(flat(new THREE.CylinderGeometry(.95,.95,1.42,10)).rotateX(Math.PI/2),psMat({color:0x2a2c30}),20);
    for(let n=0;n<14;n++){const i=198+n*6,q=at(i,-(HW+8+H(n,4)*5));if(!free(q.x,q.z,-HW+3))continue;
      drum.put(q.x,q.y+1.3,q.z,yawAt(i)+H(n,1));coil.put(q.x,q.y+1.3,q.z,yawAt(i)+H(n,1));res(q.x,q.z,3);}
    drum.done();coil.done();
    {const q=at(272,-(HW+22)),g=new THREE.Group();g.position.set(q.x,q.y,q.z);world.add(g);res(q.x,q.z,7);
      const yel=psMat({color:0xe8b020});
      for(const [a,b] of [[-1.4,-1.4],[1.4,-1.4],[-1.4,1.4],[1.4,1.4]])hoorBox(g,.4,18,.4,yel,a,9,b);
      for(let h=2;h<18;h+=3)hoorBox(g,3.2,.25,3.2,yel,0,h,0);
      hoorMerge(g);
      const jib=new THREE.Group();jib.position.set(q.x,q.y+18.4,q.z);world.add(jib);
      hoorBox(jib,1.2,1.2,22,yel,0,0,6);hoorBox(jib,2.4,2.2,3,psMat({color:0x2a3440}),0,1.4,0);hoorBox(jib,1.8,1.8,2.4,grey,0,0,-6);
      hoorBox(jib,.08,8,.08,dark,0,-4,14);hoorBox(jib,1.6,.6,1.6,psMat({color:0x4a3a2c}),0,-8.2,14);
      TROLL.crane=jib;}
    const fence=rosInst(flat(new THREE.BoxGeometry(.06,1.8,SEG*2+.1)).translate(0,.9,0),psMat({color:0x9aa2a8}),80);
    for(let i=232;i<286;i+=2){const q=at(i,-(HW+6.2));if(nearAlt(q.x,q.z,2))continue;fence.put(q.x,q.y,q.z,yawAt(i));}
    fence.done();
    const q=at(244,-(HW+6.5)),s=sign('MASKINGÅRDEN','#a8442c','#f4f2ec',96,14,6,.9,7);s.position.set(q.x,q.y+2.6,q.z);s.rotation.y=yawAt(244)+Math.PI;world.add(s);
  }

  /* the power station: three great pipes down the slope, the hall at the foot */
  {const top={x:236,z:-96},bot={x:226,z:146};
    const pipe=rosInst(flat(new THREE.CylinderGeometry(1.2,1.2,1,10)).rotateX(Math.PI/2),psMat({color:0x4a5a52}),220);
    const ring=rosInst(flat(new THREE.CylinderGeometry(1.4,1.4,.4,10)).rotateX(Math.PI/2),psMat({color:0x2a2c30}),80);
    const sup=rosInst(flat(new THREE.BoxGeometry(9,1,1.2)).translate(0,.5,0),psMat({color:0xa8a49a}),30);
    const L=Math.hypot(bot.x-top.x,bot.z-top.z),K=Math.round(L/4),yw=Math.atan2(bot.x-top.x,bot.z-top.z);
    for(let k=0;k<=K;k++){const t=k/K,x=top.x+(bot.x-top.x)*t,z=top.z+(bot.z-top.z)*t;
      const x2=top.x+(bot.x-top.x)*(t+1/K),z2=top.z+(bot.z-top.z)*(t+1/K);
      const y=trollGround(x,z)+1.6,y2=trollGround(x2,z2)+1.6,pt=Math.atan2(y-y2,L/K);
      for(const o of [-3,0,3]){const px=x+Math.cos(yw)*o,pz=z-Math.sin(yw)*o;
        if(k<K)pipe.put(px+(x2-x)/2,(y+y2)/2,pz+(z2-z)/2,yw,1,1,L/K+.1,null,pt);
        if(k%3===0)ring.put(px,y,pz,yw,1,1,1,null,pt);}
      if(k%3===0)sup.put(x,y-2.4,z,yw+Math.PI/2,1,1.2,1);
      res(x,z,8);}
    pipe.done();ring.done();sup.done();
    const y0=trollGround(bot.x,bot.z+12),g=new THREE.Group();g.position.set(bot.x,y0,bot.z+12);world.add(g);res(bot.x,bot.z+12,22);
    const hallM=new THREE.Mesh(rosBoxUV(30,13.6,16,4,3.4),psMat({map:borasFacadeTex('#a8442c',true)}));hallM.position.y=-.4;g.add(hallM);
    const rf=gableRoof(31,17,4,0x3a5a4a);rf.position.y=13.2;g.add(rf);
    const s=sign('KRAFTSTATIONEN','#2a2c30','#f4f2ec',112,16,14,1.3,7);s.position.set(0,11,8.06);g.add(s);
    const hd=trollGround(top.x,top.z-8),h2=new THREE.Group();h2.position.set(top.x,hd,top.z-8);world.add(h2);res(top.x,top.z-8,12);
    hoorBox(h2,14,4,8,psMat({color:0xa8a49a}),0,1.8,0);hoorBox(h2,14.4,.4,8.4,psMat({color:0x6a6e72}),0,4,0);hoorMerge(h2);}

  /* the town and the works: blocks along the roads, then further back */
  const blocks=[];
  const brickA=borasFacadeTex('#a8442c',true),brickB=borasFacadeTex('#8a3a26',true);
  const plaster=['#e4dcc8','#c8b89a','#d8cfbe','#b4bcc0','#e8d8a8','#c49a7a'].map(c=>borasFacadeTex(c,false));
  const tryBlock=(x,z,yw,L,Dd,Ht,tex,pad)=>{
    const c=Math.cos(yw),s=Math.sin(yw);
    for(const [lx,lz] of [[-L/2,-Dd/2],[L/2,-Dd/2],[-L/2,Dd/2],[L/2,Dd/2],[0,0],[-L/4,0],[L/4,0],[0,-Dd/2],[0,Dd/2]]){
      const wx=x+c*lx+s*lz,wz=z-s*lx+c*lz;
      if(!free(wx,wz,pad)||nearAlt(wx,wz,4))return false;
    }
    blocks.push([x,trollGround(x,z),z,yw,L,Dd,Ht,tex]);res(x,z,Math.min(L,Dd)/2+2);
    for(const [lx,lz] of [[-L/3,0],[L/3,0]])res(x+c*lx+s*lz,z-s*lx+c*lz,Math.min(L,Dd)/2+2);
    return true;
  };
  for(const [i0,i1,sd] of [[184,300,-1],[560,700,1],[560,700,-1],[40,116,-1],[430,560,-1],[300,360,1]]){
    for(let i=i0;i<i1;i+=2){
      const Dd=12+H(i,sd)*8,L=16+H(sd,i)*12,Ht=7+H(i*3,sd)*9,q=mainPt(i,sd*(HW+10+Dd/2));
      if(tryBlock(q.x,q.z,yawAt(i)+Math.PI/2,L,Dd,Ht,i<400?(H(i,7)>.5?brickA:brickB):plaster[Math.floor(H(i,sd*7)*plaster.length)],3))i+=Math.round(L/SEG*.6);
    }
  }
  for(let gx=-400;gx<=440;gx+=34)for(let gz=-460;gz<=-280;gz+=30){
    const x=gx+H(gx,gz)*8,z=gz+H(gz,gx)*8;
    tryBlock(x,z,H(gx*3,gz)>.5?0:Math.PI/2,14+H(gz,gx*2)*10,12+H(gx*2,gz)*8,7+H(gx,gz*3)*10,H(gz*5,gx)>.6?brickA:plaster[Math.floor(H(gx,gz*7)*plaster.length)],6);
  }
  for(let gx=40;gx<=320;gx+=36)for(let gz=-190;gz<=230;gz+=34){                        /* the works inside the loop */
    if(H(gx*7,gz)<.45)continue;
    const x=gx+H(gx,gz)*10,z=gz+H(gz,gx)*10;
    tryBlock(x,z,H(gx*3,gz)>.5?0:Math.PI/2,18+H(gz,gx*2)*14,14+H(gx*2,gz)*10,7+H(gx,gz*3)*8,H(gz*5,gx)>.5?brickA:brickB,8);
  }
  for(let gx=-300;gx<=-110;gx+=30)for(let gz=-260;gz<=300;gz+=28){                     /* the old town beyond the canal */
    const x=gx+H(gx,gz)*8,z=gz+H(gz,gx)*8;
    tryBlock(x,z,H(gx*3,gz)>.5?0:Math.PI/2,12+H(gz,gx*2)*8,10+H(gx*2,gz)*6,7+H(gx,gz*3)*8,plaster[Math.floor(H(gx,gz*7)*plaster.length)],5);
  }
  {const byTex=new Map(),roofs=[];
    for(const b of blocks){const [x,y,z,yw,L,Dd,Ht,tex]=b;
      if(!byTex.has(tex))byTex.set(tex,[]);
      const hh=Math.round(Ht/3.4)*3.4||3.4,ll=Math.round(L/4)*4||4;
      byTex.get(tex).push([x,y-.4,z,yw,ll,Math.round(Dd),hh]);roofs.push([x,y-.4+hh,z,yw,ll,Math.round(Dd)]);}
    for(const [tex,list] of byTex)world.add(new THREE.Mesh(borasMergeBoxes(list),psMat({map:tex})));
    const rf=rosInst(flat(new THREE.BoxGeometry(1,.5,1)).translate(0,.25,0),psMat({color:0x4a5258}),blocks.length+4);
    const vent=rosInst(flat(new THREE.BoxGeometry(2,1.2,1.6)).translate(0,.6,0),psMat({color:0x9a9e92}),blocks.length+4);
    for(const [x,y,z,yw,L,Dd] of roofs){rf.put(x,y,z,yw,L+.4,1,Dd+.4);vent.put(x+Math.cos(yw)*L*.2,y+.5,z-Math.sin(yw)*L*.2,yw);}
    rf.done();vent.done();}

  /* street lamps, then the woods: thick on the industrial edge, scattered elsewhere */
  {const pole=rosInst(flat(new THREE.CylinderGeometry(.1,.14,6,4)).translate(0,3,0),dark,N);
    const head=rosInst(flat(new THREE.BoxGeometry(.5,.25,1.1)),psMat({color:0xffe6a8,unlit:true}),N);
    for(let i=0;i<N;i+=18)for(const sd of [-1,1]){
      if((i/18+(sd>0?1:0))%2)continue;
      const q=at(i,sd*(HW+5.8));if(nearAlt(q.x,q.z,3)||!free(q.x,q.z,-HW+5)||trollInBay(P,i,sd,6))continue;
      if(sd>0&&Math.abs(i-TROLL_SPOL)<14)continue;
      pole.put(q.x,q.y,q.z,0);head.put(q.x-sd*q.rx*.6,q.y+6,q.z-sd*q.rz*.6,q.yaw);}
    pole.done();head.done();
    const TN=760,trT=rosInst(flat(new THREE.CylinderGeometry(.18,.26,3.6,5)).translate(0,1.8,0),psMat({color:0x4a3a2e}),TN);
    const trC=rosInst(flat(new THREE.IcosahedronGeometry(2.4,0)).translate(0,4.8,0),psMat({}),TN,true);
    const pine=rosInst(flat(new THREE.ConeGeometry(2.2,6.5,6)).translate(0,5.4,0),psMat({}),TN,true);
    let n=0;
    for(let g2=0;n<TN&&g2<14000;g2++){
      const k3=g2%4,x=k3<2?rand(250,470):k3<3?rand(30,330):rand(-440,470),z=k3<2?rand(-200,200):k3<3?rand(-200,240):rand(-470,470);
      if(!free(x,z,4.5))continue;const y=trollGround(x,z);
      trT.put(x,y,z,0);
      if(H(x,z)>.45)pine.put(x,y,z,rand(0,3),rand(.8,1.25),rand(.9,1.3),rand(.8,1.25),[0x2f5a34,0x3a6a3a,0x2a4e30][n%3]);
      else trC.put(x,y,z,rand(0,3),rand(.8,1.2),rand(.9,1.2),rand(.8,1.2),[0x4a7a3a,0x5a8a42,0x3e6a34,0x6a9440][n%4]);
      res(x,z,3.2);n++;}
    trT.done();trC.done();pine.done();}
}

/* ───── Trollhättan hazards: spolningen on the climb; the locks, the boat and the loudspeaker ───── */
/** water let go under pressure: a long hiss */
function trollHiss(vol,len){
  if(!actx)return;
  const t=actx.currentTime,n=actx.sampleRate*(len||.5)|0,buf=actx.createBuffer(1,n,actx.sampleRate),d=buf.getChannelData(0);
  for(let i=0;i<n;i++)d[i]=(Math.random()*2-1)*Math.min(1,i/(n*.1))*(1-i/n);
  const s=actx.createBufferSource(),f=actx.createBiquadFilter(),g=actx.createGain();
  s.buffer=buf;f.type='highpass';f.frequency.value=2400;g.gain.value=.12*(vol||1);
  s.connect(f);f.connect(g);g.connect(audioOutput());s.start(t);
}
function hazardsTroll(H){
  vastPA();
  /* spolningen: the outlet's lamp flashes, the gauge climbs, the pipe shudders and gurgles,
     then a low jet sweeps the right half of the road for a couple of seconds; the left half stays dry */
  {const i=TROLL_SPOL,sd=1,A=8.5,lat=sd*4.4,B=4.2;
    const q=mainPt(i,sd*(HW+5.2)),yw=Math.atan2(-sd*rx[i],-sd*rz[i]),by=meshY(q.x,q.z);   /* the nozzle points across the road */
    const box=new THREE.Group();box.position.set(q.x,by,q.z);box.rotation.y=yw;box.scale.setScalar(1.5);world.add(box);
    hoorBox(box,2.4,2.2,1.6,psMat({color:0x6a7a6e}),0,1.1,-.6);hoorBox(box,2.6,.2,1.8,psMat({color:0x4a5258}),0,2.3,-.6);
    hoorBox(box,.9,.9,.9,psMat({color:0x2f62a8}),.8,.45,.6);
    hoorBox(box,.14,1.6,.14,psMat({color:0x2a2c30}),-.9,3.1,-.6);
    const lamp=new THREE.Mesh(flat(new THREE.OctahedronGeometry(.42,0)),psMat({color:0x5a3008,unlit:true}));lamp.position.set(-.9,4.1,-.6);box.add(lamp);
    const pipe=new THREE.Mesh(flat(new THREE.CylinderGeometry(.32,.32,1.6,8)).rotateX(Math.PI/2),psMat({color:0x8a9096}));pipe.position.set(0,.5,.6);box.add(pipe);
    const gauge=new THREE.Mesh(new THREE.CircleGeometry(.36,10),psMat({color:0xf4f2ec,unlit:true,side:THREE.DoubleSide}));gauge.position.set(.6,1.5,.21);box.add(gauge);
    const needle=hoorBox(box,.05,.3,.04,psMat({color:0xc8321f,unlit:true}),.6,1.5,.24);
    const s=new THREE.Mesh(new THREE.PlaneGeometry(2.2,.5),psMat({map:lerumSignTex('SPOLNING','#f2c81c','#1e2022',64,14,7),unlit:true,side:THREE.DoubleSide}));
    s.position.set(0,1.95,.22);box.add(s);
    /* where the water lands: a dashed outline on the road, and a sheen that comes and goes */
    const g=new THREE.Group(),c=mainPt(i,lat);g.position.set(c.x,c.y+.07,c.z);g.rotation.y=c.yaw;world.add(g);
    const ol=borasOutline(A+.2,B+.2);ol.position.y=.02;g.add(ol);
    const pool=new THREE.Mesh(new THREE.CircleGeometry(1,16).rotateX(-Math.PI/2),psMat({color:0x6a8aa0,transparent:true,opacity:0,depthWrite:false}));
    pool.scale.set(B,1,A);g.add(pool);
    const jets=[];for(let n=0;n<16;n++){const m=new THREE.Mesh(flat(new THREE.BoxGeometry(.5,.4,.5)),psMat({color:0xcfe6f4,unlit:true,transparent:true,opacity:.8,depthWrite:false}));m.visible=false;world.add(m);jets.push(m);}
    const nx=q.x+Math.sin(yw)*2.1,ny=by+.75,nz=q.z+Math.cos(yw)*2.1;
    let tick=0,hissed=-1;
    H.push({id:'spolningen',period:9,phase:3,mesh:g,
      update(u,dt){
        const warn=u>=.32&&u<.55,on=u>=.55&&u<.8,cyc=Math.floor((raceTime+3)/9);
        const flash=(warn||on)&&Math.floor(clock*6)%2===0;
        lamp.material.uniforms.uColor.value.setHex(flash?0xffa01a:0x5a3008);
        lamp.scale.setScalar(flash?1.35:1);
        needle.rotation.z=1.2-2.4*(warn?smooth(.32,.55,u):on?1:Math.max(0,1-smooth(.8,.9,u)));
        pipe.position.x=warn?Math.sin(clock*50)*.05:0;                                  /* the pipe shudders */
        pool.material.uniforms.uOpacity.value=.6*smooth(.5,.6,u)*(1-smooth(.82,.98,u));
        const reach=on?1:warn?.15*smooth(.32,.55,u):0;                                  /* a dribble, then the jet */
        for(let n=0;n<jets.length;n++){const t=((clock*1.8+n/jets.length)%1)*reach,sp=(n%4-1.5)*.18;
          const d=t*(HW+5.8),ang=yw+sp*t;
          jets[n].visible=reach>0;
          jets[n].position.set(nx+Math.sin(ang)*d,ny+Math.sin(Math.PI*Math.min(1,t*1.4))*.6+.1,nz+Math.cos(ang)*d);
          jets[n].scale.setScalar(.6+t*1.4);}
        const near=player&&Math.hypot(player.x-q.x,player.z-q.z)<90&&state==='race';
        tick-=dt||0;
        if(near&&warn&&tick<=0){tick=.16;ping(lerp(160,520,smooth(.32,.55,u)),rand(90,140),.05);}   /* the gurgle climbs */
        if(near&&on&&hissed!==cyc){hissed=cyc;trollHiss(1.2,2.2);}
        if(on&&Math.random()<(dt||0)*16){const d=rand(.2,1)*(HW+5.8);puff(nx+Math.sin(yw)*d,ny+.3,nz+Math.cos(yw)*d,.8,.9,.98,.5);}
        this.on=on;
      },
      hit(k){
        if(!this.on||k.rib||k.air||k.wet)return false;                       /* Regnmolnet is wet already */
        const dx=k.x-c.x,dz=k.z-c.z,f=dx*fx[i]+dz*fz[i],l=dx*rx[i]+dz*rz[i];
        return (f*f)/(A*A)+(l*l)/(B*B)<1;
      },
      effect(k){k.slow=Math.max(k.slow,.3);k.slick=Math.max(k.slick,.5);k.drift=0;k.charge=0;
        for(let p=0;p<14;p++)puff(k.x+rand(-1.2,1.2),k.y+rand(.2,1.4),k.z+rand(-1.2,1.2),.78,.88,.96,.6);
        if(k===player){toast('SPOLNINGEN!');borasSplash(1.3);shake=Math.min(1,shake+.15);}}});
  }
  /* the locks: water in the chambers, the gates, the boat climbing on the race clock; the loudspeaker */
  H.push({id:'trollSlussar',period:1,phase:0,
    update(u,dt){
      if(stage.id!=='trollhattan')return;
      const L=trollLock(raceTime);
      TROLL.water.forEach((w,c)=>{w.position.y=L.lv[c];});
      TROLL.gates.forEach((G,gi)=>{const o=L.open[gi];
        for(const p of G.leaves){const sd=p.userData.sd;p.rotation.y=lerp(-sd*.32,sd*Math.PI/2*.96,o);}});
      const B=TROLL.boat;
      if(B){B.visible=L.vis;B.position.set(L.x,L.y-.2+Math.sin(clock*1.3)*.05,L.z);B.rotation.y=L.yaw+Math.PI;B.rotation.z=Math.sin(clock*.9)*.02;}
      if(TROLL.flag)TROLL.flag.rotation.z=-.4+Math.sin(clock*7)*.5;
      if(TROLL.crane)TROLL.crane.rotation.y=Math.sin(clock*.12)*.9;
      /* the loudspeaker, once a lap, as you come down past the chambers */
      if(state==='race'&&player&&!player.rib&&player.si>70&&player.si<110&&player.lap!==TROLL.lapSaid){
        TROLL.lapSaid=player.lap;vastPA('Båten i sluss tre leder inte tävlingen.');}
    }});
}

/** the stage's postcard, for the picnic passport: the captain of a canal boat in the lock,
    holding up a tiny chequered flag. Drawn on a 192 x 120 canvas, shown pixelated. */
function trollPostcard(g,w,h){
  const R=(c,x,y,a,b)=>{g.fillStyle=c;g.fillRect(x,y,a,b);};
  const sky=g.createLinearGradient(0,0,0,60);sky.addColorStop(0,'#3f86d4');sky.addColorStop(1,'#dcebf4');
  g.fillStyle=sky;g.fillRect(0,0,w,60);
  R('#f8f4e4',140,12,16,4);R('#f8f4e4',136,15,24,4);R('#f8f4e4',30,22,12,3);
  for(let x=0;x<w;x+=6){const t=8+((x*13)%9);R(x%12?'#2f5a34':'#3a6a3a',x,46-t,6,t+4);}         /* the wooded slope */
  R('#a8442c',150,24,30,24);for(let y=27;y<46;y+=5)for(let x=153;x<178;x+=6)R('#e8dcc0',x,y,2,3);  /* the machine hall */
  /* the lock chamber: granite walls, water, the gate behind */
  R('#8c8a84',0,48,w,6);R('#6c6a64',0,54,10,66);R('#6c6a64',w-10,54,10,66);
  R('#3f6a80',10,72,w-20,48);g.fillStyle='rgba(180,214,230,.5)';for(let n=0;n<10;n++)g.fillRect(14+(n*37)%160,100+(n*11)%18,8,1);
  R('#4a3a2c',10,54,w-20,18);R('#f2c81c',10,54,w-20,2);for(let x=20;x<w-20;x+=18)R('#2a2c30',x,58,1,14);
  /* the boat */
  R('#f4f2ec',34,80,120,18);R('#2f62a8',34,86,120,4);R('#e8e4da',62,64,60,16);
  for(let x=66;x<118;x+=12)R('#3c4a58',x,68,8,6);R('#c8321f',96,52,26,13);R('#3c4a58',99,55,20,5);
  /* the captain, holding up a tiny chequered flag */
  R('#1e2a48',42,62,12,18);R('#e8bc98',43,52,10,10);R('#f4f2ec',42,48,12,4);R('#22242a',42,51,12,1);
  R('#22242a',45,55,2,2);R('#22242a',49,55,2,2);R('#c8321f',46,58,4,1);
  R('#1e2a48',54,50,3,13);R('#22242a',56,34,1,18);
  for(let i=0;i<4;i++)for(let j=0;j<3;j++)R((i+j)%2?'#111':'#f4f4f4',57+i*3,34+j*3,3,3);
  /* the stamp corner and the greeting */
  R('#f4efe2',156,92,30,22);R('#3f6a80',158,94,26,18);R('#f4f2ec',162,102,18,5);R('#c8321f',170,98,6,4);
  g.fillStyle='#fff';g.font='bold 11px "Titillium Web",sans-serif';g.textAlign='left';g.fillText('Hälsningar från Trollhättan!',6,14);
  g.lineWidth=2;g.strokeStyle='#fff';g.strokeRect(1,1,w-2,h-2);
}
