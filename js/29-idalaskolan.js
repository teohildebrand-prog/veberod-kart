"use strict";
/* ───────── Idalaskolan ───────── */
/* SISTA RASTEN: Victor and Carl's old school in Veberöd as a bonus track, a school reunion turned
   sports day. A lap is a whole school day in one break: out of the playground (Skolgårdsstarten),
   through the hallway with its two sharp bends (Korridoren), round the gym's broad S and over its
   bench ramp (Gympalektionen), out to recess round the sandpit and past the football pitch (Ut på
   rast), and home past the bike stands to the yellow façade (Cykelställen och sista svängen).
   The exterior follows the school's look (low red-brown brick, a mustard-yellow ribbed upper
   façade, rows of white-framed windows, lilac entrance frames); the interiors, the layout and the
   jokes are made up. Both indoor rooms are open to the sky, like Sibylla's kitchen, so the chase
   camera never meets a ceiling, and their walls only face inwards: a camera that swings behind one
   on a tight bend looks straight through it. */

/* x east, z south, flat ground at y=3 */
const IDA={
  /* the old wing north of the yard (scenery) and the gym (raced through); the hallway wing follows the road */
  wing:{x0:-80,x1:104,z0:-292,z1:-226},
  gym:{x0:352,x1:564,z0:-354,z1:-30},
  /* the lap's sections (main-road samples), worked out from the laid track */
  sec:{hallIn:135,b1:155,b2:176,gymIn:231,sOut:338,gymOut:411,sand:460,hop:488,bend:538,straight:582,bikes:630,final:664},
  ramp:362,ball:394,
  anim:null,said:null,board:null,teacher:null
};
const idaSec=i=>{const S=IDA.sec;i=((Math.round(i)%N)+N)%N;
  return i<S.hallIn?'yard':i<S.gymIn?'hall':i<S.gymOut?'gym':i<S.straight?'recess':'bikes';};
const idaInGym=(x,z,pad)=>{const G=IDA.gym,p=pad||0;return x>G.x0-p&&x<G.x1+p&&z>G.z0-p&&z<G.z1+p;};
const idaInWing=(x,z,pad)=>{const W=IDA.wing,p=pad||0;return x>W.x0-p&&x<W.x1+p&&z>W.z0-p&&z<W.z1+p;};
/* the hallway wing: classroom blocks either side of the corridor (x0, x1, z0, z1) */
const IDA_BLOCKS=[[140,180,-278,-180],[140,208,-150,-126],[210,352,-218,-126],[180,352,-284,-254]];
const idaInBlock=(x,z,pad)=>{const p=pad||0;return IDA_BLOCKS.some(([a,b,c,d])=>x>a-p&&x<b+p&&z>c-p&&z<d+p);};

/* the hallway: pale linoleum with a speck pattern; grips like tarmac and squeaks */
SURF.idaGolv={top:o=>1,grip:o=>1,fuel:1.0,name:'LINOLEUM'};
SFX.idaGolv={dust:null,noise:{f:2600,g:.014}};
ROADTEX.idaGolv=()=>pixTex(64,64,g=>{
  g.fillStyle='#cfc8b4';g.fillRect(0,0,64,64);
  for(let i=0;i<700;i++){g.fillStyle=Math.random()>.5?'rgba(150,140,120,.5)':'rgba(236,230,214,.6)';
    g.fillRect((Math.random()*64)|0,(Math.random()*64)|0,1,1);}
  g.fillStyle='rgba(120,110,96,.35)';for(const v of [0,32]){g.fillRect(0,v,64,1);g.fillRect(v,0,1,64);}
});
/* the gym: varnished boards; a fixed, predictable grip a shade under tarmac, not ice */
SURF.idaParkett={top:o=>1,grip:o=>.97,fuel:1.0,name:'GYMPAGOLV'};
SFX.idaParkett={dust:null,noise:{f:3000,g:.016}};
const idaBoards=()=>pixTex(64,64,g=>{
  g.fillStyle='#c8975a';g.fillRect(0,0,64,64);
  for(let y=0;y<64;y+=4){const o=(y/4)%2?13:0;for(let x=-16;x<64;x+=26){const v=180+((Math.random()*26)|0);
    g.fillStyle='rgb('+v+','+((v*.74)|0)+','+((v*.44)|0)+')';g.fillRect(x+o,y,25,3);}}
  g.fillStyle='rgba(90,56,24,.4)';for(let y=3;y<64;y+=4)g.fillRect(0,y,64,1);
});
ROADTEX.idaParkett=idaBoards;
/* the playground paths: pale concrete slabs */
SURF.idaPlattor={top:o=>1,grip:o=>1,fuel:1.0,name:'PLATTOR'};
SFX.idaPlattor={dust:null,noise:{f:1100,g:.014},rattle:true};
ROADTEX.idaPlattor=()=>pixTex(64,64,g=>{
  g.fillStyle='#b8b2a6';g.fillRect(0,0,64,64);
  for(let y=0;y<64;y+=16)for(let x=0;x<64;x+=16){const v=176+((Math.random()*22)|0);
    g.fillStyle='rgb('+v+','+(v-4)+','+(v-12)+')';g.fillRect(x+1,y+1,14,14);}
});
VERGEC.idalaskolan=['#8e8a82','#a4a096','#6e6a64'];
GROUND.idalaskolan={cell:24,stripe:1.0,verge:0x6c9446,cols:[0x5e9a44,0x68a24a,0x58903e,0x70a650,0x5a943f,0x64984a]};

STAGES.push({ id:'idalaskolan', group:'bonus', name:'IDALASKOLAN', sub:'SISTA RASTEN', bonus:true,
  order:29, modes:['race','tt','free'],
  tag:'Korridoren är ingen racerbana. Än.',
  view:{x:30,z:-176,h:3,to:{x:10,z:-228,h:6},fov:60},              /* from the yard: the yellow façade, the lilac doors, the sign */
  hw:8,
  aiLook:0.7,                                    /* tight indoor bends: the AI aims a little closer */
  bars:[0.65,0.8,0.6], laps:3, stand:false, bankGain:0.1, bankMax:0.08,
  blurb:'Victor and Carl\'s old school in Veberöd as a bonus track: a school reunion turned sports day. Three laps from the asphalt playground under the yellow façade, through the hallway with its two sharp bends (Korridoren), round the gym\'s broad S, over the bench ramp and down the long straight while the PE teacher sends the big ball across (Gympalektionen), out to recess round the sandpit and past the football pitch (Ut på rast), and home past the bike stands. Bakom cykelstället cuts the playground bend; Redskapsförrådet cuts the gym\'s S through the equipment store.',
  role:'Ett brett skolgårdssvep, en korridor med två skarpa svängar, ett S runt skumblocken, bänkrampen och en lång raka med gympabollen, sedan rasten runt sandlådan och sista svängen vid cykelställen.',
  bonusNote:'Ingen cup. Victors och Carls gamla skola i Veberöd: skolgård, korridor, gympasal.',
  sky:[0xd8ecf6,0x3f8ed8], fog:[0xd4e4ec,140,560], amb:0x7a8494, dif:0xfff4dc,
  road:'asphalt', paint:false, verge:'idalaskolan', edge:'idalaskolan', ground:'idalaskolan',
  terrain:{size:1100,seg:140},
  mod:(x,z,t)=>-rolls(x,z)*t,                  /* the school sits on level ground */
  land:(x,z,out)=>landIdala(x,z,out),
  /* linoleum in the hallway, boards in the gym, slabs on the hopscotch path; the yard is tarmac */
  zones:[[135,231,'idaGolv'],[231,411,'idaParkett'],[488,528,'idaPlattor']],
  jumpSpec:[{at:362,h:1.6,drop:1.2,up:9,dn:5,rec:11}],              /* the bench ramp in the gym */
  stations:[[0.972,-1],[0.835,-1]],                                 /* by the start yard, on the way back */
  ctrl:[[0,3,30],[0,3,-10],[0,3,-50],[-2,3,-90],[-3,3,-130],[-2,3,-168],[4,3,-190],[16,3,-201],[34,3,-203],[54,3,-198],[74,3,-189],[92,3,-175],[110,3,-166],
        [150,3,-165],[178,3,-165],[187,3,-167],[192,3,-174],[194,3,-185],[194,3,-200],[195,3,-214],
        [198,3,-225],[205,3,-232],[216,3,-235],[232,3,-236],[300,3,-240],[340,3,-240],[364,3,-241],
        [382,3,-246],[396,3,-260],[402,3,-282],[406,3,-304],[414,3,-324],[428,3,-336],[446,3,-338],
        [462,3,-328],[476,3,-310],[496,3,-292],[514,3,-276],[526,3,-256],[532,3,-234],[533,3,-206],[533,3,-180],[533,3,-140],[533,3,-100],[532,3,-62],
        [532,3,-20],[532,3,16],[529,3,42],[519,3,82],[503,3,92],[487,3,88],[478,3,54],[475,3,36],
        [466,3,22],[448,3,16],[426,3,20],[406,3,34],[384,3,80],[366,3,108],[344,3,130],[316,3,144],
        [236,3,150],[190,3,150],[160,3,148],[140,3,141],[120,3,141],[100,3,149],[76,3,154],[50,3,153],
        [30,3,147],[16,3,135],[7,3,116],[2,3,92],[0,3,52]],
  routes:[
    {id:'cykel',name:'BAKOM CYKELSTÄLLET',a:30,b:126,hw:5.5,side:1,lead:12,leadLat:10,
     mid:[[0.5,0]],surface:'idaPlattor',tex:'idaPlattor',risk:0.35,
     blurb:'The slab path behind the bike shed, cutting the playground bend on its way to the hallway. Shorter, but the way in is a sharp kink off the start straight and there is little room to get going again before the doors.'},
    {id:'forrad',name:'REDSKAPSFÖRRÅDET',a:232,b:346,hw:5,side:1,lead:10,leadLat:10,
     mid:[[0.5,6]],surface:'idaParkett',tex:'idaParkett',risk:0.3,
     blurb:'Straight through the gym\'s equipment store between the stacked mats and the vaulting horses, cutting off the broad S. A slow way in and an awkward way out can cost everything it saves.'}],
  stamps:[
    {id:'ida1',dish:'Knäckemacka',ini:'K',kind:'intro',route:'main',i:546,lat:-5.6,
     hint:'Vid picknickbordet i rastens långa sväng, på utsidan.',
     story:'Crispbread with butter and a slice of cheese, the school snack that every class remembers differently: one swears it came with cucumber, another that the cheese was always too thick for the bread and slid off in one piece. It is eaten at speed in the last two minutes of break, in crumbs, mostly on the jumper.'},
    {id:'ida2',dish:'Mjölkpaket',ini:'M',kind:'route',route:'forrad',f:0.5,lat:0,
     hint:'Inne i redskapsförrådet, mellan mattorna.',
     story:'The small carton of milk from the lunch line, opened along the wrong edge, then along the right one, then with a pencil. Somebody always finds one at the back of the equipment store weeks later, and nobody admits which class it came from.'},
    {id:'ida3',dish:'Pannkaka',ini:'P',kind:'air',route:'main',jump:0,after:5,lat:0,air:3.6,
     hint:'Högt över bänkrampen i gympasalen.',
     story:'Thursday pancakes with strawberry jam after the pea soup, the one lunch everyone queued early for. The rumour that the dinner ladies flipped them across the hall like frisbees is almost certainly made up, which has never stopped anyone repeating it.'}],
  /* Victor and Carl at their old school; their lines here replace the usual ones (cosmetic only) */
  say:{
    victor:{start:'Här behöver jag ingen karta.',hall:'Man fick faktiskt inte springa här.',gym:'Nu gäller det. På riktigt.',
            pass:'Du tog fel väg redan då.',win:'Fortfarande bäst på rasten.',lose:'Vi kör bäst av tre raster.'},
    carl:{start:'Jag skulle bara lämna en grej.',hall:'Det här räknas som transport.',gym:'Är det här uppvärmningen?',
          pass:'Du får fråga fröken om omkörning.',win:'Levererat innan det ringde.',lose:'Jag hade last på gympan också.'}},
  duo:{victor:'Du vet att jag kan den här banan?',carl:'Bra. Då slipper jag vänta.'},
  rivals:{victor:'carl',carl:'victor'},
  postcard:{draw:(g,w,h)=>idalaPostcard(g,w,h),caption:'Utvecklingssamtalet blev längre än väntat.'},
  aiDodge:(k,t,L)=>idaDodge(k,t,L),
  hazards:H=>hazardsIdala(H), scenery:()=>sceneryIdala()
});

/* ───── the ground: tarmac in the yards, sand in the pit, grass round the edges ───── */
const IDA_YARDS=[[-74,122,-210,64],[360,578,-24,128]];
const idaInYard=(x,z)=>IDA_YARDS.some(([a,b,c,d])=>x>a&&x<b&&z>c&&z<d);
function landIdala(x,z,out){
  if(idaInGym(x,z,0)||idaInBlock(x,z,0)||idaInWing(x,z,0)){out.setHex(0x8a8682);return;}
  if(idaInYard(x,z)){out.setHex(0x5c5e62);return;}
  const h=hash2(Math.floor(x/16),Math.floor(z/16));
  if(h>.82)out.setHex(0x6aa64c);
}

/* ───── roadside: kerbs outside, nothing indoors (the walls), blue foam pads round the gym's S ───── */
EDGES.idalaskolan=st=>{
  const step=2,L=SEG*step+.1;
  const kerb=rosInst(flat(new THREE.BoxGeometry(.4,.26,L)).translate(0,.13,0),psMat({color:0xb4b0a8}),N*2);
  const pad=rosInst(flat(new THREE.BoxGeometry(.6,.8,L-.15)).translate(0,.4,0),psMat({}),N,true);
  for(let i=0;i<N;i+=step)for(const side of [-1,1]){
    const o=side*(HW+1.2),x=sx[i]+rx[i]*o,z=sz[i]+rz[i]*o;
    if(nearAlt(x,z,2.6))continue;
    if(stations.some(S=>{let d=i-S.at;if(d<-N/2)d+=N;else if(d>N/2)d-=N;return S.side===side&&d>-3&&d<S.len+3;}))continue;
    const sec=idaSec(i),y=meshY(x,z),yw=Math.atan2(fx[i],fz[i]);
    if(sec==='hall')continue;
    if(sec==='gym'){if(JUMPS.some(J=>Math.abs(i-J.at)<J.dn+3))continue;
      if(i>IDA.sec.gymIn+6&&i<IDA.sec.sOut)pad.put(x,y-.05,z,yw,1,1,1,((i/step)>>1)%2?0x2f62c8:0x3f78d8);continue;}
    kerb.put(x,y-.05,z,yw);
  }
  kerb.done();pad.done();
};

/* ───── textures ───── */
/** the school's exterior, one window bay by one floor per tile: red-brown brick below a white-framed
    window; up = the mustard-yellow ribbed façade of the upper floor */
function idaBrickTex(){
  const t=pixTex(32,32,g=>{
    g.fillStyle='#8a4632';g.fillRect(0,0,32,32);
    for(let y=0;y<32;y+=3)for(let x=(y%6?0:3);x<32;x+=6){const v=Math.random();g.fillStyle=v>.6?'#9a5038':v>.3?'#7a3c2a':'#844230';g.fillRect(x,y,5,2);}
    g.fillStyle='#f2f0ea';g.fillRect(3,8,26,17);g.fillStyle='#3e4e5c';g.fillRect(5,10,22,13);
    g.fillStyle='#f2f0ea';g.fillRect(15,10,2,13);g.fillRect(5,16,22,1);
    g.fillStyle='rgba(190,214,232,.5)';g.fillRect(6,11,4,3);g.fillRect(18,11,4,3);
    g.fillStyle='#d8d4cc';g.fillRect(2,25,28,2);                                       /* the sill */
  });
  t.wrapS=t.wrapT=THREE.RepeatWrapping;return t;
}
function idaRibTex(){
  const t=pixTex(16,16,g=>{
    g.fillStyle='#d8a838';g.fillRect(0,0,16,16);
    for(let x=0;x<16;x+=4){g.fillStyle='#e8bc4c';g.fillRect(x,0,2,16);g.fillStyle='#b88a28';g.fillRect(x+3,0,1,16);}
  });
  t.wrapS=t.wrapT=THREE.RepeatWrapping;return t;
}
/** the hallway walls, u = height (0 floor .. 1 top, 7 m), v = along: a green dado, a rail, cream
    plaster, a band, then a row of high windows */
function idaHallTex(){
  const t=pixTex(32,16,g=>{
    g.fillStyle='#e8e0cc';g.fillRect(0,0,32,16);
    g.fillStyle='#6a9a7a';g.fillRect(0,0,6,16);g.fillStyle='#4a6a58';g.fillRect(0,0,1,16);g.fillRect(6,0,1,16);   /* skirting, dado, rail */
    g.fillStyle='#c8bca0';g.fillRect(17,0,1,16);                                                                 /* the band */
    g.fillStyle='#f4f2ec';g.fillRect(20,0,9,16);g.fillStyle='#9ec4e0';g.fillRect(21,1,7,6);g.fillRect(21,9,7,6);   /* high windows */
    g.fillStyle='#f4f2ec';g.fillRect(24,1,1,14);
    g.fillStyle='#d8d0bc';g.fillRect(30,0,2,16);
  });
  t.wrapS=t.wrapT=THREE.RepeatWrapping;return t;
}
/** wall bars, u = height across, v = along */
function idaBarsTex(){
  const t=pixTex(32,16,g=>{
    g.fillStyle='#e8e2d4';g.fillRect(0,0,32,16);
    g.fillStyle='#b88a52';for(let x=1;x<27;x+=2)g.fillRect(x,0,1,16);                   /* the rungs, across */
    g.fillStyle='#8a6034';g.fillRect(0,2,26,2);g.fillRect(0,10,26,2);                  /* the uprights */
    g.fillStyle='#c8c0ae';g.fillRect(28,0,4,16);
  });
  t.wrapS=t.wrapT=THREE.RepeatWrapping;return t;
}
/** an upright quad strip along the road at one lateral offset, facing the road (single-sided, so a
    camera behind it sees through) */
function idaWall(a,b,lat,h0,h1,mat,vScale){
  const pos=[],uv=[],idx=[],M=b-a+1;
  for(let q=0;q<M;q++){const i=(a+q+N)%N,x=sx[i]+rx[i]*lat,z=sz[i]+rz[i]*lat,y=sy[i]+lat*bank[i];
    pos.push(x,y+h0,z,x,y+h1,z);uv.push(0,q*SEG/(vScale||6),1,q*SEG/(vScale||6));}
  for(let q=0;q<M-1;q++){const p=2*q;
    if(lat>0)idx.push(p,p+1,p+2,p+1,p+3,p+2);else idx.push(p,p+2,p+1,p+1,p+2,p+3);}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));
  g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(idx);g.computeVertexNormals();
  const m=new THREE.Mesh(g,mat);world.add(m);return m;
}
/** a flat painted decal on the ground (unlit), centred at x,z, turned to yaw */
function idaDecal(tex,x,z,w,d,yaw,y){
  const m=new THREE.Mesh(new THREE.PlaneGeometry(w,d).rotateX(-Math.PI/2),psMat({map:tex,unlit:true,transparent:true,depthWrite:false}));
  m.position.set(x,(y==null?meshY(x,z):y)+.06,z);m.rotation.y=yaw;world.add(m);return m;
}

/* ───── people: a plain stand-in for staff, parents and old classmates; kids at 0.7 ───── */
function idaPerson(n,kid){
  const p=lerumNeighbour([0xc8321f,0x2f78d8,0xf2c81c,0x3fa04a,0xe86a9a,0x8b4fb5,0xf4f2ee,0x2a2e34][n%8],
    [0x3a2a1e,0xd8c08a,0x8a8a8a,0x6a3a22,0xe8d8a8][n%5],false);
  if(kid)p.g.scale.setScalar(.7);
  return p;
}

/* ───── the scenery ───── */
function sceneryIdala(){
  const RES=[];
  const res=(x,z,r)=>RES.push([x,z,r]);
  const free=(x,z,pad)=>{
    if(latAt(x,z)<HW+pad||idaInGym(x,z,2)||idaInBlock(x,z,2)||idaInWing(x,z,2))return false;
    for(const r of RES)if(Math.hypot(x-r[0],z-r[1])<r[2])return false;
    return true;
  };
  const at=(i,o)=>{const q=mainPt(i,o);q.y=meshY(q.x,q.z);return q;};
  const yawAt=i=>{i=((Math.round(i)%N)+N)%N;return Math.atan2(fx[i],fz[i]);};
  const H=(a,b)=>hash2(a*1.37+3.1,b*0.71-2.3);
  const S=IDA.sec,Y=3;
  const CY=ALTS.find(r=>r.id==='cykel'),FO=ALTS.find(r=>r.id==='forrad');
  const dark=psMat({color:0x2a2c30}),white=psMat({color:0xf2f0ea}),wood=psMat({color:0x8a5a34}),steel=psMat({color:0xa8aeb4});
  const lilac=psMat({color:0x9a8ac8}),blue=psMat({color:0x4a6ab8}),red=psMat({color:0xc8321f}),yellow=psMat({color:0xf2c81c});
  IDA.anim={swings:[],ball:null,cart:null,flags:[]};
  for(const S_ of stations){const q=mainPt(S_.at+6,S_.side*(HW+13));res(q.x,q.z,24);}

  /* ── the tarmac of the two yards, and pale slabs on the paths: a ground mesh following the
     terrain, tucked under the road ── */
  {const tt=pixTex(32,32,c=>{c.fillStyle='#5c5e62';c.fillRect(0,0,32,32);
      for(let i=0;i<260;i++){c.fillStyle=Math.random()>.5?'rgba(120,124,130,.5)':'rgba(40,42,46,.5)';c.fillRect((Math.random()*32)|0,(Math.random()*32)|0,1,1);}});
    tt.wrapS=tt.wrapT=THREE.RepeatWrapping;
    for(const [x0,x1,z0,z1] of IDA_YARDS){const st=4,nx=Math.ceil((x1-x0)/st),nz=Math.ceil((z1-z0)/st),pos=[],uv=[],idx=[];
      for(let a=0;a<=nz;a++)for(let b=0;b<=nx;b++){const x=x0+b*st,z=z0+a*st;
        pos.push(x,meshY(x,z)+(latAt(x,z)<HW+3||idaInGym(x,z,1)?-1.2:.05),z);uv.push(x/12,z/12);}
      for(let a=0;a<nz;a++)for(let b=0;b<nx;b++){const p0=a*(nx+1)+b,p1=p0+1,p2=p0+nx+1,p3=p2+1;idx.push(p0,p2,p1,p1,p2,p3);}
      const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));
      geo.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));geo.setIndex(idx);geo.computeVertexNormals();
      world.add(new THREE.Mesh(geo,psMat({map:tt})));}
  }

  /* ── the old wing north of the yard: brick, the yellow ribbed upper floor, lilac doors, the sign ── */
  {const W=IDA.wing,L=W.x1-W.x0,D=W.z1-W.z0,cx=(W.x0+W.x1)/2,cz=(W.z0+W.z1)/2;
    world.add(new THREE.Mesh(borasMergeBoxes([[cx,Y-.4,cz,0,L,D,4.6]]),psMat({map:idaBrickTex()})));
    const rib=new THREE.Mesh(flat(new THREE.BoxGeometry(L+.6,3.4,D+.6)),psMat({map:idaRibTex()}));
    {const uv=rib.geometry.attributes.uv;for(let v=0;v<uv.count;v++)uv.setXY(v,uv.getX(v)*L/2,uv.getY(v));}
    rib.position.set(cx,Y+5.9,cz);world.add(rib);
    const cap=new THREE.Mesh(flat(new THREE.BoxGeometry(L+1.4,.5,D+1.4)),dark);cap.position.set(cx,Y+7.8,cz);world.add(cap);
    res(cx,cz,Math.max(L,D)*.6);
    /* the entrances on the south face: lilac frames, small canopies, a pale step */
    const g=new THREE.Group();g.position.set(0,Y,W.z1);world.add(g);
    for(const x of [-40,52]){hoorBox(g,6,4,.5,lilac,x,2,.3);hoorBox(g,4.4,3.4,.3,psMat({color:0x2a3a4a}),x,1.7,.5);
      hoorBox(g,7.4,.4,3.2,lilac,x,4.4,1.6);for(const s of [-1,1])hoorBox(g,.24,4.2,.24,lilac,x+s*3.4,2.1,3.1);
      hoorBox(g,6,.3,2.4,psMat({color:0xc8c4bc}),x,.15,1.4);}
    /* the school bell under the eaves, between the doors */
    hoorBox(g,.9,.9,.5,dark,6,6.4,.6);const bell=new THREE.Mesh(flat(new THREE.CylinderGeometry(.3,.6,.7,8)),psMat({color:0xd8a838}));
    bell.position.set(6,5.7,.9);g.add(bell);
    hoorMerge(g);
    /* IDALASKOLAN in big letters on the yellow façade, facing the yard */
    const s=sibSign('IDALASKOLAN','#d8a838','#1e3a6a',176,24,30,4.1,14);s.position.set(6,Y+5.9,W.z1+.36);world.add(s);
    /* a flagpole on the yard side */
    const fp=new THREE.Group();fp.position.set(-62,Y,W.z1+14);world.add(fp);
    hoorBox(fp,.2,13,.2,white,0,6.5,0);hoorBox(fp,1.6,.6,1.6,psMat({color:0xb8b4ac}),0,.3,0);hoorMerge(fp);
    const flag=new THREE.Mesh(new THREE.PlaneGeometry(3.2,2,4,1),psMat({map:pixTex(16,10,c=>{c.fillStyle='#2f62c8';c.fillRect(0,0,16,10);
      c.fillStyle='#f2c81c';c.fillRect(5,0,2,10);c.fillRect(0,4,16,2);}),side:THREE.DoubleSide}));
    flag.position.set(-60.4,Y+11.8,W.z1+14);world.add(flag);IDA.anim.flags.push(flag);res(-62,W.z1+14,3);
  }

  /* ── the hallway wing: brick classroom blocks either side of the corridor, the yellow band above ── */
  {const bm=psMat({map:idaBrickTex()}),list=[];
    for(const [x0,x1,z0,z1] of IDA_BLOCKS)list.push([(x0+x1)/2,Y-.4,(z0+z1)/2,0,x1-x0,z1-z0,4.6]);
    world.add(new THREE.Mesh(borasMergeBoxes(list),bm));
    const rm=psMat({map:idaRibTex()});
    for(const [x0,x1,z0,z1] of IDA_BLOCKS){const L=x1-x0,D=z1-z0;
      const r=new THREE.Mesh(flat(new THREE.BoxGeometry(L+.4,2.6,D+.4)),rm);
      const uv=r.geometry.attributes.uv;for(let v=0;v<uv.count;v++)uv.setXY(v,uv.getX(v)*Math.max(L,D)/2,uv.getY(v));
      r.position.set((x0+x1)/2,Y+5.5,(z0+z1)/2);world.add(r);
      const c=new THREE.Mesh(flat(new THREE.BoxGeometry(L+1,.4,D+1)),dark);c.position.set((x0+x1)/2,Y+7,(z0+z1)/2);world.add(c);}
    /* the corridor itself: walls facing in, the floor between them */
    const hm=psMat({map:idaHallTex()});
    for(const s of [-1,1])idaWall(S.hallIn-1,S.gymIn,s*(HW+4.9),-.2,7,hm,4);
    const fl=psMat({map:ROADTEX.idaGolv()});fl.uniforms.uMap.value.wrapS=fl.uniforms.uMap.value.wrapT=THREE.RepeatWrapping;
    for(const s of [-1,1])sweep(S.hallIn-1,S.gymIn,s<0?-(HW+5):HW-.1,.012,s<0?-(HW-.1):HW+5,.012,fl);   /* inner to outer, so both face up */
  }
  /* the main entrance: a widened event doorway in a lilac frame, a canopy, GÅ INOMHUS! */
  {const i=S.hallIn,q=at(i,0),g=new THREE.Group();g.position.set(q.x,Y,q.z);g.rotation.y=yawAt(i);world.add(g);
    const w=HW+5;
    for(const s of [-1,1]){hoorBox(g,1.4,8.4,1.2,lilac,s*(w+.7),4.2,0);hoorBox(g,1.6,.3,6,lilac,s*(w+.7),8.2,-3);}
    hoorBox(g,2*w+2.8,1.4,1.4,lilac,0,8.4,0);
    hoorBox(g,2*w+2.8,.3,6,psMat({color:0xb8a8e0}),0,9,-3);                                  /* the canopy over the approach */
    hoorMerge(g);
    const t=sibSign('GÅ INOMHUS!','#f4f2ec','#c8321f',128,16,12,1.5,10,'#9a8ac8');t.position.set(0,8.4,-.72);t.rotation.y=Math.PI;g.add(t);
    const t2=sibSign('ÅTERTRÄFF · KORRIDOREN →','#9a8ac8','#f4f2ec',160,14,14,1.1,8);t2.position.set(0,8.4,.72);g.add(t2);
  }
  /* inside the corridor: classroom doors, coat hooks and cubbies, noticeboards, a wall clock, the
     classroom signs, crooked race drawings, a floor arrow to the gym */
  {const doorCols=[0xc8321f,0x2f78d8,0x3fa04a,0xe8a020,0x8b4fb5,0xe86a9a];
    const door=rosInst(flat(new THREE.BoxGeometry(.12,3.2,2.2)).translate(0,1.6,0),psMat({}),40,true);
    const knob=rosInst(flat(new THREE.BoxGeometry(.2,.12,.12)),psMat({color:0xd8c060}),40);
    const hook=rosInst(flat(new THREE.BoxGeometry(.2,.08,.08)),steel,300);
    const coat=rosInst(flat(new THREE.BoxGeometry(.14,1.1,.7)).translate(0,-.55,0),psMat({}),200,true);
    const cub=rosInst(flat(new THREE.BoxGeometry(.6,1.0,1.6)).translate(0,.5,0),psMat({color:0xd8b47a}),60);
    const board=rosInst(flat(new THREE.BoxGeometry(.08,1.4,2.6)).translate(0,2.6,0),psMat({color:0xb88a5a}),40);
    const paper=rosInst(flat(new THREE.BoxGeometry(.04,.5,.4)),psMat({}),200,true);
    const put=(m,i,lat,h,col,yw)=>{const q=mainPt(i,lat);m.put(q.x,sy[q.j]+h,q.z,yawAt(i)+(yw||0),1,1,1,col);};
    let n=0;
    for(let i=S.hallIn+4;i<S.gymIn-4;i+=3){const sec=i<S.b1-8||i>S.b2+10;
      if(i>S.b1-5&&i<S.b2+8)continue;                                               /* the bends: plain walls, nothing to read wrong */
      for(const s of [-1,1]){const lat=s*(HW+4.82),k=(i+(s>0?1:0))%9;
        if(k===0){put(door,i,lat,0,doorCols[n++%doorCols.length]);put(knob,i+.4,s*(HW+4.7),1.2);}
        else if(k===3||k===4){for(let h=0;h<4;h++){put(hook,i+h*.3-.45,s*(HW+4.75),1.8);if(H(i,h+s)>.35)put(coat,i+h*.3-.45,s*(HW+4.7),1.75,[0xc8321f,0x2f78d8,0xf2c81c,0x3fa04a,0xe86a9a][(i+h)%5]);}
          put(cub,i,s*(HW+4.5),0);}
        else if(k===6&&sec){put(board,i,s*(HW+4.82),0);for(let p=0;p<4;p++)put(paper,i+(p%2?.25:-.25),s*(HW+4.74),2.3+(p>>1)*.6,[0xf4f2ec,0xf2e08a,0xa8d0f0,0xf4b8c8][p]);}
      }}
    door.done();knob.done();hook.done();coat.done();cub.done();board.done();paper.done();
    /* the wall clock over the first stretch, and the classroom signs */
    const sign=(i,s,txt,bg,fg,w)=>{const q=mainPt(i,s*(HW+4.7)),m=sibSign(txt,bg,fg,96,14,w||3.4,.6,8);
      m.position.set(q.x,sy[q.j]+3.6,q.z);m.rotation.y=yawAt(i)+(s>0?-Math.PI/2:Math.PI/2);world.add(m);return m;};
    sign(S.b1-10,1,'MATTE','#2f78d8','#f4f2ec');sign(S.b1-10,-1,'1 + 1 = 2','#f4f2ec','#2f78d8',3);
    const clk=new THREE.Mesh(new THREE.CircleGeometry(.9,12),psMat({map:pixTex(16,16,c=>{c.fillStyle='#f4f2ec';c.beginPath();c.arc(8,8,8,0,6.283);c.fill();
      c.fillStyle='#1e2022';for(let h=0;h<12;h++){const a=h/12*6.283;c.fillRect(8+Math.sin(a)*6.5-.5,8-Math.cos(a)*6.5-.5,1,1);}
      c.fillRect(7.5,3,1,5);c.fillRect(8,7.5,4,1);}),unlit:true,side:THREE.DoubleSide}));
    {const q=mainPt(S.hallIn+14,-(HW+4.7));clk.position.set(q.x,sy[q.j]+5,q.z);clk.rotation.y=yawAt(S.hallIn+14)+Math.PI/2;world.add(clk);}
    /* BILD: a wall of deliberately crooked race drawings */
    {const dr=[0,1,2,3,4,5].map(k=>pixTex(16,12,c=>{c.fillStyle='#f4f2ec';c.fillRect(0,0,16,12);
        c.fillStyle=['#c8321f','#2f78d8','#3fa04a','#e8a020','#8b4fb5','#1e2022'][k];c.fillRect(3,6,9,3);c.fillRect(5,4,4,2);
        c.fillStyle='#1e2022';c.fillRect(4,9,2,2);c.fillRect(10,9,2,2);c.fillStyle='#f2c81c';c.fillRect(0,0,3,3);
        c.fillStyle='#2f78d8';c.fillRect(12+k%3,2,2,2);}));
      const s=1,base=S.b2+14;sign(base-2,s,'BILD','#e8a020','#1e2022');
      for(let k=0;k<6;k++){const q=mainPt(base+k*2.2,s*(HW+4.7)),m=new THREE.Mesh(new THREE.PlaneGeometry(1.5,1.1),psMat({map:dr[k],unlit:true,side:THREE.DoubleSide}));
        m.position.set(q.x,sy[q.j]+2.2+(k%2)*.9,q.z);m.rotation.set(0,yawAt(base+k*2.2)-Math.PI/2,(H(k,3)-.5)*.5);world.add(m);}}
    /* TYST ARBETE, hanging high over the loudest stretch: the run out of the second bend */
    {const i=S.b2+22,q=at(i,0),g=new THREE.Group();g.position.set(q.x,Y,q.z);g.rotation.y=yawAt(i);world.add(g);
      hoorBox(g,2*(HW+5),.4,.4,dark,0,8.6,0);for(const s of [-1,1])hoorBox(g,.05,1.2,.05,dark,s*2.4,8,0);hoorMerge(g);
      const t=sibSign('TYST ARBETE','#f4f2ec','#1e2022',112,16,6,.9,9);t.position.set(0,7.4,0);g.add(t);}
    /* the big floor arrow towards the gym, and a notice for the tractor */
    {const arr=pixTex(16,32,c=>{c.fillStyle='#f2c81c';c.fillRect(5,10,6,22);c.beginPath();c.moveTo(0,12);c.lineTo(8,0);c.lineTo(16,12);c.closePath();c.fill();});
      for(const i of [S.gymIn-26,S.gymIn-14]){const q=mainPt(i,0);idaDecal(arr,q.x,q.z,3.4,6.4,yawAt(i),sy[q.j]);}
      sign(S.gymIn-20,-1,'GYMPASAL →','#3fa04a','#f4f2ec',4);
      const q=mainPt(S.hallIn+30,HW+4.7),m=sibSign('DEN SOM LÄMNAT EN TRAKTOR I KAPPRUMMET','#f4f2ec','#1e2022',224,14,7,.5,7);
      m.position.set(q.x,sy[q.j]+3.6,q.z);m.rotation.y=yawAt(S.hallIn+30)-Math.PI/2;world.add(m);
      const m2=sibSign('FÅR GÄRNA HÄMTA DEN.','#f4f2ec','#1e2022',128,14,4,.5,7);m2.position.set(q.x,sy[q.j]+3.05,q.z);m2.rotation.copy(m.rotation);world.add(m2);}
  }

  /* ── the gym: walls with doorways where the road goes through, wall bars inside, brick and the
     yellow band outside, the boards ── */
  {const G=IDA.gym,bm=psMat({map:idaBrickTex()}),rm=psMat({map:idaRibTex()}),bars=psMat({map:idaBarsTex()});
    const wall=(x0,z0,x1,z1)=>{
      const L=Math.hypot(x1-x0,z1-z0),n=Math.ceil(L/6),cx=(G.x0+G.x1)/2,cz=(G.z0+G.z1)/2;
      let nx=(z1-z0)/L,nz=-(x1-x0)/L;if(nx*(cx-(x0+x1)/2)+nz*(cz-(z0+z1)/2)<0){nx=-nx;nz=-nz;}   /* (nx,nz): towards the inside */
      for(let k=0;k<n;k++){const f0=k/n,f1=(k+1)/n,ax=lerp(x0,x1,f0),az=lerp(z0,z1,f0),bx=lerp(x0,x1,f1),bz=lerp(z0,z1,f1),mx=(ax+bx)/2,mz=(az+bz)/2;
        if(latAt(mx,mz)<HW+6)continue;                                                            /* a doorway */
        const len=Math.hypot(bx-ax,bz-az),yw=Math.atan2(bx-ax,bz-az)+Math.PI/2;
        const o=new THREE.Mesh(flat(new THREE.BoxGeometry(len+.05,5,1.6)),bm);
        {const uv=o.geometry.attributes.uv;for(let v=0;v<uv.count;v++)uv.setXY(v,uv.getX(v)*len/6,uv.getY(v)*1.2);}
        o.position.set(mx,Y+2.1,mz);o.rotation.y=yw;world.add(o);
        const r=new THREE.Mesh(flat(new THREE.BoxGeometry(len+.05,5.2,1.6)),rm);
        {const uv=r.geometry.attributes.uv;for(let v=0;v<uv.count;v++)uv.setXY(v,uv.getX(v)*len/2,uv.getY(v));}
        r.position.set(mx,Y+7.2,mz);r.rotation.y=yw;world.add(r);
        /* the inside: wall bars along the lower wall */
        const p=new THREE.Mesh(new THREE.PlaneGeometry(len,6),bars);
        {const uv=p.geometry.attributes.uv;for(let v=0;v<uv.count;v++){const u0=uv.getX(v),v0=uv.getY(v);uv.setXY(v,v0,u0*len/6);}}
        p.position.set(mx+nx*.85,Y+3,mz+nz*.85);p.rotation.y=Math.atan2(nx,nz);world.add(p);}
    };
    wall(G.x0,G.z0,G.x1,G.z0);wall(G.x1,G.z0,G.x1,G.z1);wall(G.x1,G.z1,G.x0,G.z1);wall(G.x0,G.z1,G.x0,G.z0);
    /* the boards, under the road: varnished planks; court lines painted on top */
    const ft=idaBoards();ft.wrapS=ft.wrapT=THREE.RepeatWrapping;
    {const st=4,nx=Math.ceil((G.x1-G.x0)/st),nz=Math.ceil((G.z1-G.z0)/st),pos=[],uv=[],idx=[];
      for(let a=0;a<=nz;a++)for(let b=0;b<=nx;b++){const x=G.x0+b*st,z=G.z0+a*st;pos.push(x,meshY(x,z)+(latAt(x,z)<HW+6?-1.2:.04),z);uv.push(x/10,z/10);}
      for(let a=0;a<nz;a++)for(let b=0;b<nx;b++){const p0=a*(nx+1)+b,p1=p0+1,p2=p0+nx+1,p3=p2+1;idx.push(p0,p2,p1,p1,p2,p3);}
      const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));
      geo.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));geo.setIndex(idx);geo.computeVertexNormals();
      world.add(new THREE.Mesh(geo,psMat({map:ft})));}
    const bf=psMat({map:idaBoards()});bf.uniforms.uMap.value.wrapS=bf.uniforms.uMap.value.wrapT=THREE.RepeatWrapping;
    for(const s of [-1,1])sweep(S.gymIn,S.gymOut,s<0?-(HW+6.2):HW-.1,.012,s<0?-(HW-.1):HW+6.2,.012,bf);
    /* the bench ramp: varnished like a gym bench, blue legs at the sides */
    {const J=JUMPS[0];if(J){const top=pixTex(32,16,c=>{c.fillStyle='#e8c48a';c.fillRect(0,0,32,16);c.fillStyle='#d4a868';for(let y=0;y<16;y+=4)c.fillRect(0,y,32,1);
        c.fillStyle='#2f62c8';c.fillRect(0,0,2,16);c.fillRect(30,0,2,16);}),o=new THREE.Object3D();o.rotation.order='YXZ';
      const m=new THREE.InstancedMesh(flat(new THREE.BoxGeometry(2*HW-1.2,.14,SEG*1.02)),psMat({map:top}),J.up+1);let n=0;
      const leg=rosInst(flat(new THREE.BoxGeometry(.5,1,.5)).translate(0,-.5,0),psMat({color:0x2f62c8}),2*(J.up+1));
      for(let k=-J.up;k<=0;k++){const ii=(J.at+k+N)%N;o.position.set(sx[ii],sy[ii]+.07,sz[ii]);
        o.rotation.set(-Math.atan2(sy[(ii+1)%N]-sy[(ii-1+N)%N],2*SEG),Math.atan2(fx[ii],fz[ii]),0);o.updateMatrix();m.setMatrixAt(n++,o.matrix);
        if(k%3===0)for(const sd of [-1,1]){const q=mainPt(ii,sd*(HW-.8));leg.put(q.x,sy[ii]+.07,q.z,0,1,Math.max(.1,sy[ii]-Y+.1),1);}}
      m.count=n;m.frustumCulled=false;world.add(m);leg.done();}}
    /* court lines: two big courts on the open boards, red and blue */
    const line=(x0,z0,x1,z1,c)=>{const L=Math.hypot(x1-x0,z1-z0),m=new THREE.Mesh(new THREE.PlaneGeometry(.35,L).rotateX(-Math.PI/2),psMat({color:c,unlit:true}));
      m.position.set((x0+x1)/2,Y+.07,(z0+z1)/2);m.rotation.y=Math.atan2(x1-x0,z1-z0);world.add(m);};
    for(const [x0,x1,z0,z1,c] of [[372,520,-200,-130,0xc8321f],[380,505,-112,-60,0x2f62c8]]){
      for(const [a,b,cc,d] of [[x0,z0,x1,z0],[x1,z0,x1,z1],[x1,z1,x0,z1],[x0,z1,x0,z0],[(x0+x1)/2,z0,(x0+x1)/2,z1]])
        if(latAt((a+cc)/2,(b+d)/2)>HW+4)line(a,b,cc,d,c);
      const cc=new THREE.Mesh(new THREE.RingGeometry(5.6,6,20).rotateX(-Math.PI/2),psMat({color:c,unlit:true}));
      cc.position.set((x0+x1)/2,Y+.07,(z0+z1)/2);if(latAt((x0+x1)/2,(z0+z1)/2)>HW+7)world.add(cc);}
    res((G.x0+G.x1)/2,(G.z0+G.z1)/2,0);
  }
  /* the gym's doorways: frames, INGA UTESKOR in, a lilac frame out into the daylight */
  for(const [i,txt,bg] of [[S.gymIn,'INGA UTESKOR I GYMPASALEN','#f4f2ec'],[S.gymOut,'UT PÅ RAST!','#f2c81c']]){
    const q=at(i,0),g=new THREE.Group();g.position.set(q.x,Y,q.z);g.rotation.y=yawAt(i);world.add(g);
    const w=HW+6,c=i===S.gymOut?lilac:psMat({color:0x8a6034});
    for(const s of [-1,1])hoorBox(g,1.6,10,2,c,s*(w+.8),5,0);
    hoorBox(g,2*w+3.2,1.6,2,c,0,10.4,0);hoorMerge(g);
    const t=sibSign(txt,bg,'#1e2022',192,14,2*w-2,1.3,8);t.position.set(0,10.4,-1.05);t.rotation.y=Math.PI;g.add(t);
    if(i===S.gymIn){const t2=sibSign('VÅRDA MATERIALEN','#3fa04a','#f4f2ec',128,14,10,1.1,8);t2.position.set(0,10.4,1.05);g.add(t2);}
  }
  /* inside the gym: foam blocks in the S, mats and benches along the walls, folded hoops, the
     scoreboard, DELTAGANDE ÄR VIKTIGAST and the tape under it */
  {const G=IDA.gym;
    const foam=rosInst(flat(new THREE.BoxGeometry(1,1,1)).translate(0,.5,0),psMat({}),40,true);
    const fc=[0xe8402a,0x2f78d8,0xf2c81c,0x3fa04a,0xe86a9a,0x8b4fb5];let n=0;
    for(let i=S.gymIn+12;i<S.sOut-4;i+=7){const side=(Math.sign(scurv[i])||1);             /* the inside of each half of the S */
      for(const far of [0,1]){const q=at(i+far*3,side*(HW+5+far*4.5));if(!free(q.x,q.z,4)&&!idaInGym(q.x,q.z,0))continue;
        if(nearAlt(q.x,q.z,3)||latAt(q.x,q.z)<HW+4)continue;
        const s=2.2+H(i,far)*1.6;foam.put(q.x,q.y,q.z,H(far,i)*3,s,s*(.7+H(i,7)*.6),s,fc[n++%fc.length]);res(q.x,q.z,s);}}
    foam.done();
    const mat=rosInst(flat(new THREE.BoxGeometry(2,.4,4)).translate(0,.2,0),psMat({color:0x2f62c8}),60);
    const ben=rosInst(flat(new THREE.BoxGeometry(.4,.5,5)).translate(0,.25,0),psMat({color:0xc89a5a}),40);
    for(let k=0;k<26;k++){const t=k/26,side=k%4,x=side===0?G.x0+4:side===1?G.x1-4:lerp(G.x0+8,G.x1-8,t),z=side>1?(side===2?G.z0+4:G.z1-4):lerp(G.z0+8,G.z1-8,t);
      if(latAt(x,z)<HW+8||nearAlt(x,z,6))continue;
      if(k%2)mat.put(x,Y,z,side<2?0:Math.PI/2,1,1+(k%3),1);else ben.put(x,Y,z,side<2?0:Math.PI/2);}
    mat.done();ben.done();
    /* folded basketball hoops high on the long walls */
    const hoop=rosInst(flat(new THREE.BoxGeometry(3,2,.2)).translate(0,0,0),white,8),rim=rosInst(flat(new THREE.TorusGeometry(.5,.07,4,8)).rotateX(Math.PI/2),red,8);
    for(const z of [-250,-120])for(const [x,s] of [[G.x0+1.2,1],[G.x1-1.2,-1]]){if(latAt(x,z)<HW+8)continue;hoop.put(x,Y+7.4,z,Math.PI/2);rim.put(x+s*.6,Y+6.4,z,0);}
    hoop.done();rim.done();
    /* the scoreboard over the straight, on the east wall: VARV n / 3 */
    {const c=document.createElement('canvas');c.width=48;c.height=24;
      const tex=new THREE.CanvasTexture(c);tex.magFilter=tex.minFilter=THREE.NearestFilter;tex.generateMipmaps=false;
      const g=new THREE.Group();g.position.set(G.x1-1.6,Y+7.6,-170);g.rotation.y=-Math.PI/2;world.add(g);
      hoorBox(g,8.4,4.6,.4,dark,0,0,-.2);hoorMerge(g);
      const m=new THREE.Mesh(new THREE.PlaneGeometry(8,4.2),psMat({map:tex,unlit:true}));m.position.z=.02;g.add(m);
      IDA.board={c,tex,shown:''};}
    /* DELTAGANDE ÄR VIKTIGAST, with VICTOR HÅLLER INTE MED taped underneath, on the east wall by the straight */
    {const g=new THREE.Group();g.position.set(G.x1-1.6,Y+3.6,-118);g.rotation.y=-Math.PI/2;world.add(g);
      const t=sibSign('DELTAGANDE ÄR VIKTIGAST','#2f62c8','#f4f2ec',176,16,11,1.1,8);g.add(t);
      const t2=sibSign('VICTOR HÅLLER INTE MED','#f4f2ec','#c8321f',144,14,6.4,.7,8);t2.position.set(1.4,-1.1,.02);t2.rotation.z=-.06;g.add(t2);
      for(const x of [-1.8,4.6]){const tp=hoorBox(new THREE.Group(),.8,.2,.02,psMat({color:0xd8d0b8}),x,-.75,.04);tp.rotation.z=.6;g.add(tp);}}
  }
  /* Redskapsförrådet: the equipment store round the lane, low partition walls, stacked mats,
     vaulting horses, a sign over the way in */
  if(FO){const pm=psMat({color:0xd8d0c0}),stk=rosInst(flat(new THREE.BoxGeometry(2,1,3.6)).translate(0,.5,0),psMat({}),120,true);
    const horse=rosInst(flat(new THREE.BoxGeometry(1.2,1.4,3)).translate(0,.7,0),psMat({color:0x8a5a34}),20);
    const j0=COMMIT+4,j1=FO.n-MERGE-4;
    for(const s of [-1,1]){const pos=[],idx=[];const W=FO.hw+3.4;
      for(let j=j0;j<=j1;j++){const q=lanePt(FO,j/(FO.n-1),s*W);pos.push(q.x,FO.Y[j]-.1,q.z,q.x,FO.Y[j]+3.2,q.z);}
      for(let j=0;j<j1-j0;j++){const p=2*j;if(s>0)idx.push(p,p+1,p+2,p+1,p+3,p+2);else idx.push(p,p+2,p+1,p+1,p+2,p+3);}
      const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));geo.setIndex(idx);geo.computeVertexNormals();
      world.add(new THREE.Mesh(geo,psMat({color:0xc8bca8})));
      for(let j=j0+4;j<j1-4;j+=4){const q=lanePt(FO,j/(FO.n-1),s*(W-1.4));
        if(j%8<4)for(let h=0;h<2+(j%3);h++)stk.put(q.x,FO.Y[j]+h*1.02,q.z,q.yaw,1,1,1,[0x2f62c8,0x3f78d8,0xe8402a,0x3fa04a][(h+j)%4]);
        else horse.put(q.x,FO.Y[j],q.z,q.yaw);}}
    stk.done();horse.done();
    const q=lanePt(FO,j0/(FO.n-1),0),g=new THREE.Group();g.position.set(q.x,FO.Y[j0],q.z);g.rotation.y=q.yaw;world.add(g);
    for(const s of [-1,1])hoorBox(g,.5,6,.5,pm,s*(FO.hw+3.4),3,0);hoorBox(g,2*(FO.hw+3.4)+.5,.6,.5,pm,0,6,0);hoorMerge(g);
    const t=sibSign('REDSKAPSFÖRRÅDET','#c8321f','#f4f2ec',144,14,2*FO.hw+4,1,8);t.position.set(0,6,-.3);t.rotation.y=Math.PI;g.add(t);
  }
  /* the PE teacher's platform beside the straight, opposite the ball rack, protected by a rail */
  {const i=IDA.ball-6,s=1,q=at(i,s*(HW+6.4)),g=new THREE.Group();g.position.set(q.x,Y,q.z);g.rotation.y=yawAt(i);world.add(g);
    hoorBox(g,3.6,1.6,3.6,psMat({color:0x6a6e74}),0,.8,0);for(const x of [-1.7,1.7])hoorBox(g,.1,1.1,3.6,steel,x,2.15,0);hoorBox(g,3.6,.1,.1,steel,0,2.7,-1.75);
    hoorMerge(g);res(q.x,q.z,4);
    const p=idaPerson(1,false);p.g.position.set(0,1.6,0);p.g.rotation.y=-Math.PI/2*s;g.add(p.g);
    hoorBox(p.head,.1,.08,.18,psMat({color:0xd8c040}),.12,-.12,.22);                       /* the whistle */
    const arm=new THREE.Group();arm.position.set(-.38,1.5,0);p.g.add(arm);hoorBox(arm,.16,.7,.16,psMat({color:0xc8321f}),0,-.35,0);
    hoorBox(p.g,.44,.56,.06,psMat({color:0xf4f2ec}),.38,1.2,.24);                           /* the clipboard */
    IDA.teacher={arm};}

  /* ── recess: the sandpit inside the hairpin, hopscotch on the slabs, the fenced football pitch,
     the climbing frame and the swings, picnic tables ── */
  {/* the sandpit: a timber frame, sand, a red bucket */
    const i=IDA.sec.sand,side=-(Math.sign(scurv[i])||1),q=at(i,side*(HW+11)),g=new THREE.Group();g.position.set(q.x,Y,q.z);world.add(g);
    const sand=new THREE.Mesh(new THREE.CircleGeometry(9,14).rotateX(-Math.PI/2),psMat({color:0xd8c48a}));sand.position.y=.06;g.add(sand);
    for(let n=0;n<14;n++){const a=n/14*6.283,b=(n+1)/14*6.283,l=hoorBox(g,.5,.5,18*Math.sin(Math.PI/14)+.2,wood,Math.cos((a+b)/2)*9,.25,Math.sin((a+b)/2)*9);l.rotation.y=-(a+b)/2;}
    hoorBox(g,.7,.7,.7,red,2,.4,-1);hoorBox(g,.3,.2,1.1,psMat({color:0x2f78d8}),-2,.15,1.6);
    hoorMerge(g);res(q.x,q.z,10);IDA.sandAt={x:q.x,z:q.z};}
  {/* hopscotch: numbered chalk squares on the tarmac beside the slab path */
    const hop=pixTex(16,48,c=>{c.strokeStyle='#f4f2ec';c.lineWidth=1;c.fillStyle='#f4f2ec';c.font='7px "Press Start 2P",monospace';c.textAlign='center';c.textBaseline='middle';
      for(let k=0;k<4;k++){c.strokeRect(2.5,2.5+k*11,11,10);c.fillText(String(k+1),8,8+k*11);}});
    for(const [i,s] of [[S.hop+6,1],[S.hop+22,-1],[S.hop+36,1]]){const q=at(i,s*(HW+4));idaDecal(hop,q.x,q.z,2.6,7.6,yawAt(i));}}
  {/* the football pitch, fenced, in the middle of the recess loop, a ball that bounces in it */
    const cx=420,cz=88,L=50,D=30;res(cx,cz,30);
    const grass=new THREE.Mesh(new THREE.PlaneGeometry(D,L).rotateX(-Math.PI/2),psMat({map:pixTex(16,32,c=>{for(let y=0;y<32;y+=4){c.fillStyle=(y/4)%2?'#4a9a3e':'#56a846';c.fillRect(0,y,16,4);}
      c.fillStyle='#f4f2ec';c.fillRect(0,15,16,1);c.fillRect(0,0,16,1);c.fillRect(0,31,16,1);c.fillRect(0,0,1,32);c.fillRect(15,0,1,32);})}));
    grass.position.set(cx,meshY(cx,cz)+.08,cz);grass.rotation.y=Math.PI/2;world.add(grass);
    const post=rosInst(flat(new THREE.CylinderGeometry(.06,.06,3,4)).translate(0,1.5,0),steel,80),net=psMat({map:pixTex(8,8,c=>{c.strokeStyle='rgba(200,206,212,.9)';c.beginPath();c.moveTo(0,0);c.lineTo(8,8);c.moveTo(8,0);c.lineTo(0,8);c.stroke();}),transparent:true,side:THREE.DoubleSide,depthWrite:false});
    const fence=[[cx-L/2-2,cz-D/2-2],[cx+L/2+2,cz-D/2-2],[cx+L/2+2,cz+D/2+2],[cx-L/2-2,cz+D/2+2]];
    for(let k=0;k<4;k++){const [ax,az]=fence[k],[bx,bz]=fence[(k+1)%4],len=Math.hypot(bx-ax,bz-az);
      const m=new THREE.Mesh(new THREE.PlaneGeometry(len,3),net);m.material.uniforms.uMap.value.wrapS=m.material.uniforms.uMap.value.wrapT=THREE.RepeatWrapping;m.material.uniforms.uMap.value.repeat.set(len/1.2,3/1.2);
      m.position.set((ax+bx)/2,meshY((ax+bx)/2,(az+bz)/2)+1.5,(az+bz)/2);m.rotation.y=Math.atan2(bx-ax,bz-az)-Math.PI/2;world.add(m);
      for(let t=0;t<=len;t+=4){const x=lerp(ax,bx,t/len),z=lerp(az,bz,t/len);post.put(x,meshY(x,z),z,0);}}
    post.done();
    for(const s of [-1,1]){const g=new THREE.Group();g.position.set(cx+s*(L/2-1),meshY(cx,cz),cz);world.add(g);
      hoorBox(g,.14,2,.14,white,0,1,-2.5);hoorBox(g,.14,2,.14,white,0,1,2.5);hoorBox(g,.14,.14,5.1,white,0,2,0);hoorMerge(g);}
    const ball=new THREE.Mesh(flat(new THREE.IcosahedronGeometry(.55,1)),psMat({map:pixTex(8,8,c=>{c.fillStyle='#f4f2ec';c.fillRect(0,0,8,8);c.fillStyle='#1e2022';c.fillRect(2,2,3,3);c.fillRect(6,5,2,2);})}));
    world.add(ball);IDA.anim.ball={m:ball,x:cx,z:cz,y:meshY(cx,cz)};}
  {/* the climbing frame and the swings, beside the long bend */
    const i=S.bend+8,side=-(Math.sign(scurv[i])||1);
    const cq=at(i,side*(HW+16));if(free(cq.x,cq.z,8)){const g=new THREE.Group();g.position.set(cq.x,cq.y,cq.z);g.rotation.y=yawAt(i);world.add(g);res(cq.x,cq.z,8);
      for(const [x,z] of [[-3,-3],[3,-3],[-3,3],[3,3]])hoorBox(g,.24,5,.24,red,x,2.5,z);
      for(const h of [1.6,3.2,4.8])for(const s of [-1,1]){hoorBox(g,6.2,.16,.16,yellow,0,h,s*3);hoorBox(g,.16,.16,6.2,yellow,s*3,h,0);}
      hoorBox(g,6.4,.24,6.4,psMat({color:0x2f78d8}),0,5,0);const sl=hoorBox(g,1.4,.2,7,psMat({color:0x3fa04a}),4.6,2.4,0);sl.rotation.z=-.6;hoorMerge(g);}
    const sq=at(i+16,side*(HW+15));if(free(sq.x,sq.z,7)){const g=new THREE.Group();g.position.set(sq.x,sq.y,sq.z);g.rotation.y=yawAt(i+16);world.add(g);res(sq.x,sq.z,7);
      for(const s of [-1,1]){const a=hoorBox(g,.2,4.6,.2,blue,s*4,2.2,-1.2);a.rotation.x=.25;const b=hoorBox(g,.2,4.6,.2,blue,s*4,2.2,1.2);b.rotation.x=-.25;}
      hoorBox(g,8.4,.24,.24,blue,0,4.4,0);hoorMerge(g);
      for(const x of [-2,1.6]){const sw=new THREE.Group();sw.position.set(x,4.3,0);g.add(sw);
        for(const s of [-.4,.4])hoorBox(sw,.05,3,.05,steel,s,-1.5,0);hoorBox(sw,1,.12,.4,red,0,-3,0);IDA.anim.swings.push(sw);}}}
  {/* picnic tables in the long bend, one with the knäckemacka on it */
    const tab=rosInst(flat(new THREE.BoxGeometry(1.0,.1,2.4)).translate(0,.82,0),psMat({color:0x8e4a2a}),12),bn=rosInst(flat(new THREE.BoxGeometry(.38,.1,2.4)).translate(0,.46,0),psMat({color:0x8e4a2a}),24);
    for(const [i,s] of [[546,-1],[530,-1],[560,-1]]){const q=at(i,s*(HW+3.6));if(!free(q.x,q.z,2.5))continue;const yw=yawAt(i);
      tab.put(q.x,q.y,q.z,yw);for(const sd of [-1,1])bn.put(q.x+Math.cos(yw)*sd*.85,q.y,q.z-Math.sin(yw)*sd*.85,yw);res(q.x,q.z,3);}
    tab.done();bn.done();}

  /* ── the bike stands and the parked pedal carts (behind a low rail), the small red one rattling ── */
  {const bike=rosInst(flat(new THREE.BoxGeometry(.08,1,1.7)).translate(0,.55,0),psMat({}),80,true),wheel=rosInst(flat(new THREE.TorusGeometry(.34,.05,3,8)).rotateY(Math.PI/2),dark,160);
    const rack=rosInst(flat(new THREE.BoxGeometry(.1,.7,1)).translate(0,.35,0),steel,80);
    const bc=[0xc8321f,0x2f78d8,0x1e2022,0x3fa04a,0xe8e4da,0xf2c81c,0xe86a9a];let n=0;
    for(let i=S.bikes;i<S.final-4;i+=1.6){const side=1,q=at(i,side*(HW+4.2));if(!free(q.x,q.z,3.5))continue;const yw=yawAt(i)+Math.PI/2;
      rack.put(q.x,q.y,q.z,yw);if(H(i,2)>.25){bike.put(q.x,q.y,q.z,yw,1,1,1,bc[n++%bc.length]);
        for(const d of [-.6,.6])wheel.put(q.x+Math.sin(yw)*d,q.y+.38,q.z+Math.cos(yw)*d,yw);}}
    bike.done();wheel.done();rack.done();
    /* the bike shed over the Bakom cykelstället lane's corner of the yard */
    const shed=CY&&[.35,.5,.65].flatMap(f=>[-1,1].map(sd=>lanePt(CY,f,sd*(CY.hw+6)))).find(q=>free(q.x,q.z,5));
    if(shed){const q=shed,g=new THREE.Group();g.position.set(q.x,Y,q.z);g.rotation.y=q.yaw;world.add(g);res(q.x,q.z,7);
      for(const z of [-6,0,6])for(const x of [-1.6,1.6])hoorBox(g,.2,2.6,.2,steel,x,1.3,z);
      const rf=hoorBox(g,4.4,.2,13,psMat({color:0x3fa04a}),0,2.7,0);rf.rotation.z=.12;hoorMerge(g);
      for(let k=0;k<7;k++){const b=hoorBox(g,.08,1,1.7,psMat({color:bc[k%bc.length]}),-.4+(k%2)*.8,.55,-5.4+k*1.8);b.rotation.y=Math.PI/2;}
      const s=at(CY.a+COMMIT+2,HW+3.4),sg=new THREE.Group();sg.position.set(s.x,Y,s.z);sg.rotation.y=yawAt(CY.a+COMMIT+2)+Math.PI;world.add(sg);
      hoorBox(sg,.14,2.4,.14,wood,0,1.2,0);hoorMerge(sg);
      const t=sibSign('BAKOM CYKELSTÄLLET →','#3fa04a','#f4efe2',128,14,4.4,.6,8);t.position.set(0,2.5,0);sg.add(t);}
    /* the protected row of pedal carts, and the small red one that rattles */
    const pc=rosInst(flat(new THREE.BoxGeometry(1.1,.5,1.8)).translate(0,.45,0),psMat({}),12,true),pw=rosInst(flat(new THREE.CylinderGeometry(.24,.24,.16,6)).rotateZ(Math.PI/2),dark,48);
    const i0=S.bikes-14,side=1;let cart=null;
    for(let k=0;k<6;k++){const q=at(i0+k*1.8,side*(HW+5.6));if(!free(q.x,q.z,4.4))continue;const yw=yawAt(i0)+Math.PI/2;
      if(k===2&&!cart){cart={q,yw};continue;}
      pc.put(q.x,q.y,q.z,yw,1,1,1,[0x2f78d8,0xf2c81c,0x3fa04a,0xe86a9a,0x8b4fb5][k%5]);
      for(const [a,b] of [[-.55,-.6],[.55,-.6],[-.55,.6],[.55,.6]])pw.put(q.x+Math.cos(yw)*a+Math.sin(yw)*b,q.y+.24,q.z-Math.sin(yw)*a+Math.cos(yw)*b,yw);res(q.x,q.z,1.6);}
    pc.done();pw.done();
    if(cart){const g=new THREE.Group();g.position.set(cart.q.x,Y,cart.q.z);g.rotation.y=cart.yw;world.add(g);
      hoorBox(g,1.1,.5,1.8,red,0,.45,0);hoorBox(g,.9,.5,.2,red,0,.85,-.8);hoorBox(g,.5,.08,.08,dark,0,.9,.7);
      for(const [a,b] of [[-.55,-.6],[.55,-.6],[-.55,.6],[.55,.6]]){const w=new THREE.Mesh(flat(new THREE.CylinderGeometry(.24,.24,.16,6)).rotateZ(Math.PI/2),dark);w.position.set(a,.24,b);g.add(w);}
      hoorMerge(g);IDA.anim.cart={g,y:Y};res(cart.q.x,cart.q.z,1.6);}
    /* the low rail in front of them */
    const rl=rosInst(flat(new THREE.BoxGeometry(.1,.1,SEG*1.6+.1)).translate(0,.8,0),psMat({color:0xf2c81c}),60),rp=rosInst(flat(new THREE.BoxGeometry(.1,.8,.1)).translate(0,.4,0),psMat({color:0xf2c81c}),60);
    for(let i=i0-2;i<i0+12;i+=1.6){const q=at(i,side*(HW+4));rl.put(q.x,q.y,q.z,yawAt(i));rp.put(q.x,q.y,q.z,0);}
    rl.done();rp.done();
  }
  /* hedges along the final corner, on its outside */
  {const hd=rosInst(flat(new THREE.BoxGeometry(1.6,1.8,SEG*2.2)).translate(0,.9,0),psMat({}),120,true);
    for(let i=S.final-4;i<N-6;i+=2){const side=-(Math.sign(scurv[i])||1),q=at(i,side*(HW+4.6));if(!free(q.x,q.z,3.6))continue;
      hd.put(q.x,q.y,q.z,yawAt(i),1,1+H(i,1)*.2,1,[0x3f7a34,0x4a8a3a,0x36702e][i%3]);res(q.x,q.z,1.4);}
    hd.done();}

  /* ── the start yard: the reunion banner over the road, chalk boxes on the grid, bunting, little
     cones, spectators behind barriers, SKOLGÅRDEN ÄR INTE EN PARKERING ── */
  {const i=34,g=new THREE.Group(),q=at(i,0);g.position.set(q.x,Y,q.z);g.rotation.y=yawAt(i);world.add(g);
    for(const sd of [-1,1])hoorBox(g,.3,9.4,.3,dark,sd*(HW+2.4),4.7,0);hoorMerge(g);
    const b=new THREE.Mesh(new THREE.PlaneGeometry(2*HW+3,1.9,8,1),psMat({map:horbyBannerTex('ÅTERTRÄFF · TA MED EGEN HJÄLM',224,22),unlit:true,side:THREE.DoubleSide}));
    const pa=b.geometry.attributes.position;for(let v=0;v<pa.count;v++){const x=pa.getX(v)/(HW+1.5);pa.setY(v,pa.getY(v)-(1-x*x)*.5);}
    b.position.set(0,8.6,0);b.rotation.y=Math.PI;g.add(b);}
  {const chalk=pixTex(16,24,c=>{c.strokeStyle='#f4f2ec';c.lineWidth=1;c.strokeRect(1.5,1.5,13,21);c.fillStyle='#f4f2ec';c.fillRect(6,8,4,1);c.fillRect(7,6,2,5);});
    for(let row=0;row<4;row++)for(const col of [-1,1]){const s=10+row*16;const q=mainPt(s,col*3.4);idaDecal(chalk,q.x,q.z,2.6,4,yawAt(s),sy[s]);}
    const cone=rosInst(flat(new THREE.ConeGeometry(.3,.7,6)).translate(0,.35,0),psMat({color:0xf07a1c}),80);
    for(let i=2;i<58;i+=4)for(const sd of [-1,1]){const q=at(i,sd*(HW+.8));cone.put(q.x,sy[q.j],q.z,0);}
    cone.done();
    /* bunting: strings of little flags on poles both sides of the start straight */
    const pole=rosInst(flat(new THREE.CylinderGeometry(.1,.1,6,5)).translate(0,3,0),white,40);
    const flag=rosInst(flat(new THREE.ConeGeometry(.28,.5,3)).rotateX(Math.PI),psMat({}),400,true);
    const fc=[0xc8321f,0xf2c81c,0x2f78d8,0x3fa04a,0xf4f2ec];
    for(const sd of [-1,1]){let prev=null;
      for(let i=-30;i<70;i+=10){const q=at(i,sd*(HW+3.2));if(idaInWing(q.x,q.z,2)||nearAlt(q.x,q.z,2)){prev=null;continue;}pole.put(q.x,q.y,q.z,0);
        if(prev)for(let k=1;k<8;k++){const t=k/8,x=lerp(prev.x,q.x,t),z=lerp(prev.z,q.z,t),y=lerp(prev.y,q.y,t)+5.6-Math.sin(Math.PI*t)*.8;flag.put(x,y,z,yawAt(i),1,1,1,fc[(i+k)%5]);}
        prev=q;}}
    pole.done();flag.done();
    /* the spectators: barriers on the west side of the yard, the reunion crowd behind them */
    const bar=rosInst(flat(new THREE.BoxGeometry(.12,1,SEG*3-.2)).translate(0,.5,0),psMat({}),60,true);
    let n=0;
    for(let i=-24;i<52;i+=3){const q=at(i,-(HW+6.4));if(!free(q.x,q.z,5.8))continue;bar.put(q.x,q.y,q.z,yawAt(i),1,1,1,(i/3)%2?0xf4f2ec:0xc8321f);
      if(H(i,3)>.3){const p=at(i+H(i,5),-(HW+8+H(i,6)*2.4)),kid=H(i,8)>.62,pp=idaPerson(n++,kid);pp.g.position.set(p.x,p.y,p.z);pp.g.rotation.y=yawAt(i)+Math.PI/2;world.add(pp.g);}}
    bar.done();
    const sq=at(-16,HW+5),sg=new THREE.Group();sg.position.set(sq.x,Y,sq.z);sg.rotation.y=yawAt(-16)+Math.PI;world.add(sg);
    hoorBox(sg,.16,2.6,.16,dark,-2.4,1.3,0);hoorBox(sg,.16,2.6,.16,dark,2.4,1.3,0);hoorMerge(sg);
    const t=sibSign('SKOLGÅRDEN ÄR INTE EN PARKERING','#f4f2ec','#2f62c8',224,14,5.6,.55,7);t.position.set(0,2.6,0);sg.add(t);
    /* a few kids and staff on the recess yard too, well back from the road */
    for(const [x,z] of [[540,110],[560,60],[470,130],[380,-20],[400,-30]]){if(!free(x,z,6))continue;const pp=idaPerson(n++,true);pp.g.position.set(x,meshY(x,z),z);pp.g.rotation.y=H(x,z)*6;world.add(pp.g);res(x,z,1.5);}
  }

  /* ── round the school: trees, a chain-link fence round the grounds, houses beyond ── */
  {const TN=420,trT=rosInst(flat(new THREE.CylinderGeometry(.26,.38,6,5)).translate(0,3,0),psMat({}),TN,true),trC=rosInst(flat(new THREE.IcosahedronGeometry(3.8,0)).translate(0,8,0),psMat({}),TN,true);
    let n=0;for(let guard=0;guard<9000&&n<TN;guard++){const x=rand(-260,780),z=rand(-520,380);
      if(x>-90&&x<590&&z>-340&&z<190&&H(x,z)<.82)continue;                                 /* the grounds stay open, a few trees only */
      if(!free(x,z,7))continue;const y=meshY(x,z),r=hash2(x*.3,z*.3),birch=r>.8,s=rand(.85,1.25);
      trT.put(x,y,z,0,s,s,s,birch?0xe8e6dc:0x5a4632);trC.put(x,y,z,rand(0,3),s,s*rand(.85,1.15),s,birch?0x8ab84a:[0x3f6e30,0x4a7a36,0x56883a,0x36602a][Math.floor(r*40)%4]);res(x,z,3.2);n++;}
    trT.done();trC.done();
    const tex=['#e8e2d4','#c8a87c','#f2e8d4','#b8b4ac'].map(c=>borasFacadeTex(c,true)),lists=tex.map(()=>[]);
    const rf=rosInst(flat(new THREE.BoxGeometry(1,.6,1)).translate(0,.3,0),psMat({color:0x6a3a2a}),40);
    for(const [x,z,L,D,Ht] of [[-170,-120,22,14,7],[-180,0,20,14,7],[-160,120,24,14,7],[650,-200,26,16,8],[660,-60,22,14,7],[650,80,22,16,7],[200,280,30,16,8],[340,290,26,14,7],[60,300,24,14,7],[300,-420,40,18,10],[120,-400,30,16,8]]){
      if(!free(x,z,Math.max(L,D)/2+3))continue;const k=Math.floor(H(x,z)*tex.length),y=meshY(x,z)-.3;
      lists[k].push([x,y,z,0,L,D,Ht]);rf.put(x,y+Ht,z,0,L+.6,1,D+.6);res(x,z,Math.max(L,D)/2+3);}
    lists.forEach((li,k)=>{if(li.length)world.add(new THREE.Mesh(borasMergeBoxes(li),psMat({map:tex[k]})));});
    rf.done();
    /* the chain-link fence round the grounds, with gates */
    const post=rosInst(flat(new THREE.CylinderGeometry(.06,.06,2.4,4)).translate(0,1.2,0),steel,600);
    const mesh=psMat({map:pixTex(8,8,c=>{c.strokeStyle='rgba(190,196,202,.9)';c.beginPath();c.moveTo(0,0);c.lineTo(8,8);c.moveTo(8,0);c.lineTo(0,8);c.stroke();}),transparent:true,side:THREE.DoubleSide,depthWrite:false});
    mesh.uniforms.uMap.value.wrapS=mesh.uniforms.uMap.value.wrapT=THREE.RepeatWrapping;
    const ring=[[-110,-300],[600,-360],[610,200],[-100,200]];
    for(let k=0;k<4;k++){const [ax,az]=ring[k],[bx,bz]=ring[(k+1)%4],len=Math.hypot(bx-ax,bz-az),n2=Math.ceil(len/30);
      for(let s=0;s<n2;s++){const t0=s/n2,t1=(s+1)/n2,x0=lerp(ax,bx,t0),z0=lerp(az,bz,t0),x1=lerp(ax,bx,t1),z1=lerp(az,bz,t1),mx=(x0+x1)/2,mz=(z0+z1)/2;
        if(s%4===2)continue;                                                                          /* a gate */
        const L2=Math.hypot(x1-x0,z1-z0),m=new THREE.Mesh(new THREE.PlaneGeometry(L2,2.2),mesh.clone());m.material.uniforms.uMap.value.repeat.set(L2/1.2,2);
        m.position.set(mx,meshY(mx,mz)+1.1,mz);m.rotation.y=Math.atan2(x1-x0,z1-z0)-Math.PI/2;world.add(m);
        for(let t=0;t<=L2;t+=5){const x=lerp(x0,x1,t/L2),z=lerp(z0,z1,t/L2);post.put(x,meshY(x,z),z,0);}}}
    post.done();
  }
}

/* ───── the gym ball, the bell, the loudspeaker, Victor and Carl, and the playground moving ───── */
/** the school bell: a quick metallic trill (long for the end of the race) */
function idaBell(vol,long){
  if(!actx)return;const n=long?14:6;
  for(let k=0;k<n;k++)audioTone(k%2?1480:1320,k%2?1460:1300,.07,.05*(vol||1),'square',k*.075);
}
/** the PE teacher's whistle: two short peeps */
function idaWhistle(vol){if(!actx)return;audioTone(2600,2900,.12,.05*(vol||1),'sine');audioTone(2700,3000,.22,.05*(vol||1),'sine',.17);}
/** the big ball's bounce */
function idaBoing(vol){if(!actx)return;audioTone(220,90,.22,.09*(vol||1),'sine');}

/* the gym ball's state, read by the hazard and by the AI: it comes out from its rack on the east
   side of the straight (the teacher's platform is opposite) to just past the middle and goes back.
   The west side is always clear. */
const IDA_BALL={R:1.8,home:-(8+5),far:.8,period:9,phase:3,warn:.16,on:false,lat:-13,active:false};
function idaBallLat(u){const B=IDA_BALL,out=smooth(B.warn,.38,u),back=smooth(.62,.86,u),v=out*(1-back);return {l:lerp(B.home,B.far,v),v};}
/** the AI line for a kart coming up the gym straight while the ball is out or about to come out */
function idaDodge(k,t,L){
  const B=IDA_BALL,i=IDA.ball;if(!B.active||TT)return L;
  const d=((i-k.si)%N+N)%N;if(d>22)return L;                                  /* from the ramp's landing on: over the ramp, any line */
  return Math.max(L,B.far+B.R+3.4);                                            /* keep to the clear side */
}

function hazardsIdala(H){
  vastPA();
  IDA.said={hall:false,gym:false,end:false,lap:0,start:false,pa:false};
  const S=IDA.sec;IDA_BALL.home=-(HW+5);
  /* milk cartons line the clean exit out of the corridor's second bend */
  for(const [i,l] of [[S.b2+12,-2.5],[S.b2+18,2.5],[S.b2+24,-2.5]])addItem('milk',i,l);
  /* the big gym ball: the teacher points, the whistle goes, the ball rolls out of its rack */
  {const i=IDA.ball,B=IDA_BALL,R=B.R;
    const rk=new THREE.Group(),q=mainPt(i,-(HW+6.4));rk.position.set(q.x,meshY(q.x,q.z),q.z);rk.rotation.y=q.yaw;world.add(rk);
    for(const z of [-2.4,2.4])hoorBox(rk,.3,4.2,.3,psMat({color:0x8a6034}),-1,2.1,z);
    hoorBox(rk,.3,.3,5,psMat({color:0x8a6034}),-1,4.2,0);hoorBox(rk,2.4,.3,5,psMat({color:0x8a6034}),0,.15,0);hoorMerge(rk);
    const lamp=new THREE.Mesh(flat(new THREE.SphereGeometry(.35,6,4)),psMat({color:0xff3a1c,unlit:true}));lamp.position.set(-1,4.8,0);rk.add(lamp);
    const ball=new THREE.Mesh(flat(new THREE.IcosahedronGeometry(R,1)),psMat({map:pixTex(16,16,c=>{c.fillStyle='#e8402a';c.fillRect(0,0,16,16);
      c.fillStyle='#f2c81c';c.fillRect(0,6,16,4);c.fillStyle='#2f78d8';c.fillRect(6,0,4,16);})}));world.add(ball);
    const paint=psMat({color:0xf4f2ec,unlit:true,transparent:true,opacity:.8,depthWrite:false});
    for(const k of [-10,-5,0,5,10]){const p=mainPt(i+k,B.far+B.R+.8),dd=new THREE.Mesh(new THREE.PlaneGeometry(.35,SEG*2.2).rotateX(-Math.PI/2),paint);
      dd.position.set(p.x,p.y+.08,p.z);dd.rotation.y=p.yaw;world.add(dd);}                  /* a dashed line: the clear side is east of it */
    let roll=0,last=B.home,cycle=-1;
    H.push({id:'gympaboll',period:B.period,phase:B.phase,mesh:ball,
      update(u,dt){
        const {l,v}=idaBallLat(u),p=mainPt(i,l);
        ball.position.set(p.x,p.y+R+(v>.98?Math.abs(Math.sin(clock*7))*.25:0),p.z);
        roll+=(l-last)/R;last=l;ball.rotation.set(0,p.yaw,roll);
        ball.visible=true;
        B.lat=l;B.on=v>.1;B.active=u<.88&&(u>.02);
        const warn=u<B.warn;
        lamp.material.uniforms.uColor.value.setHex(warn&&Math.floor(clock*8)%2?0xffe040:0x6a1a10);
        if(IDA.teacher)IDA.teacher.arm.rotation.z=warn||v>.1?-1.5:-.1;                     /* points at the ball's lane */
        const near=player&&Math.hypot(player.x-p.x,player.z-p.z)<110&&state==='race';
        const cyc=Math.floor((raceTime+B.phase)/B.period);
        if(near&&u<.05&&cycle!==cyc){cycle=cyc;idaWhistle(.8);}
        this.p={x:p.x,y:p.y+R,z:p.z};
      },
      hit(k){return !TT&&B.on&&!k.rib&&near3(k,this.p.x,this.p.y,this.p.z,R+1.1);},
      /* one small shove away from the ball and a short slowdown: no spin, no pinning */
      effect(k){const s=Math.sign(k.lat-B.lat)||1;
        k.vx*=.72;k.vz*=.72;k.vx+=rx[i]*s*4.5;k.vz+=rz[i]*s*4.5;k.vy=Math.max(k.vy,3.2);k.air=true;
        k.slow=Math.max(k.slow,.25);k.boost=0;k.drift=0;k.charge=0;
        for(let n=0;n<10;n++)puff(k.x+rand(-1,1),k.y+rand(.3,1.4),k.z+rand(-1,1),.95,.5,.35,.55);
        if(k===player){toast('GYMPABOLLEN!');idaBoing(1);shake=Math.min(1,shake+.35);}}});
  }
  /* the bell, the loudspeaker, the scoreboard, the brothers' lines, the playground moving */
  H.push({id:'idaSkola',period:1,phase:0,
    update(u,dt){
      if(stage.id!=='idalaskolan')return;
      const A=IDA.anim,D=IDA.said;
      if(A){for(const s of A.swings)s.rotation.x=Math.sin(clock*1.7+s.position.x)*.55;
        if(A.ball){const t=(clock*.9)%1,bx=A.x+Math.sin(clock*.7)*14,bz=A.z+Math.cos(clock*.53)*8;A.ball.m.position.set(bx,A.ball.y+.55+Math.abs(Math.sin(t*Math.PI))*2.4,bz);A.ball.m.rotation.x=clock*3;}
        if(A.cart)A.cart.g.position.y=A.cart.y+Math.abs(Math.sin(clock*23))*.04;
        for(const f of A.flags){const pa=f.geometry.attributes.position;for(let v=0;v<pa.count;v++){const x=pa.getX(v)+1.6;pa.setZ(v,Math.sin(clock*4+x*1.6)*.18*x/3.2);}pa.needsUpdate=true;}}
      /* the scoreboard: VARV n / 3 for the player */
      const Bd=IDA.board;
      if(Bd){const lap=player?clamp(player.lap,1,LAPS):1,txt=state==='race'||state==='over'?lap+'/'+LAPS:'-/-';
        if(txt!==Bd.shown){Bd.shown=txt;const g=Bd.c.getContext('2d');g.fillStyle='#14161a';g.fillRect(0,0,48,24);
          g.fillStyle='#f2c81c';g.font='6px "Press Start 2P",monospace';g.textAlign='center';g.textBaseline='middle';g.fillText('VARV',24,6);
          g.fillStyle='#ff5a2a';g.font='8px "Press Start 2P",monospace';g.fillText(txt,24,16);Bd.tex.needsUpdate=true;}}
      if(state==='grid'){if(countdown>2)D.start=false;else if(!D.start&&countdown<=.75&&!settleT){D.start=true;idaBell(.7);}return;}
      if(!player||(state!=='race'&&state!=='over'))return;
      if(raceTime<.5&&D.lap>1)Object.assign(D,{hall:false,gym:false,end:false,lap:0,pa:false});     /* a restart */
      /* a short ding as the player starts each new lap; the long bell when they finish */
      if(player.lap>D.lap){if(D.lap>=1&&!player.done&&state==='race')idaBell(.35);D.lap=player.lap;}
      if(player.done&&!D.end){D.end=true;idaBell(.8,true);
        setTimeout(()=>vastPA('Rasten är slut. Victor vill köra om.'),900);}
      if(state!=='race'||player.rib)return;
      const sec=idaSec(player.si);
      if(sec==='hall'&&!D.hall){D.hall=true;bark('hall',0);}
      if(sec==='gym'&&!D.gym){D.gym=true;bark('gym',0);
        if(!D.pa&&karts.some(k=>!k.parked&&(k.cfg.kind==='carl'||k===player&&CHARS[charSel].id==='carl'))){D.pa=true;setTimeout(()=>{if(state==='race')vastPA('Carl, grisarna ska inte till fritids.');},1200);}}
      if(!D.pa&&player.lap===LAPS&&sec==='recess'){D.pa=true;vastPA(CHARS[charSel].id==='victor'?'Victor. Rasten. Är. Slut.':'Vi påminner om att bensin inte ingår i mellanmålet.');}
    }});
}

/** the stage's postcard, for the picnic passport: grown-up Victor and Carl on comically tiny school
    chairs in a classroom, racing helmets on their knees, Majros looking in through the window.
    Drawn on a 192 x 120 canvas, shown pixelated. */
function idalaPostcard(g,w,h){
  const R=(c,x,y,a,b)=>{g.fillStyle=c;g.fillRect(x,y,a,b);};
  R('#e8e0cc',0,0,w,84);R('#6a9a7a',0,64,w,20);R('#4a6a58',0,63,w,2);                    /* the classroom wall, the dado */
  R('#2a4a3a',14,12,70,38);R('#8a6034',12,10,74,2);R('#8a6034',12,50,74,3);              /* the blackboard */
  g.fillStyle='#f4f2ec';g.font='bold 9px "Titillium Web",sans-serif';g.textAlign='left';g.fillText('UTVECKLINGS-',18,26);g.fillText('SAMTAL',18,38);
  R('#f4f2ec',122,10,58,44);R('#7ab8e8',125,13,52,38);R('#f4f2ec',150,13,2,38);           /* the window, daylight */
  R('#5ab040',125,40,52,11);
  /* Majros at the window: white and black, pink nose, ears */
  R('#f2efe6',132,24,18,16);R('#22201e',138,26,6,6);R('#e0a0a0',134,34,10,5);R('#22201e',129,24,4,3);R('#22201e',149,24,4,3);
  R('#1e1c1c',136,29,2,2);R('#1e1c1c',144,29,2,2);
  R('#b88a52',0,84,w,36);for(let x=0;x<w;x+=14)R('#a87a44',x,84,1,36);                    /* the floor */
  /* two tiny chairs and the brothers folded onto them */
  const chair=(x)=>{R('#2f78d8',x,96,20,3);R('#2f78d8',x+17,84,3,15);R('#9aa0a6',x+1,99,2,12);R('#9aa0a6',x+17,99,2,12);};
  chair(54);chair(104);
  /* Victor: white overalls, black cap, knees up to his chin, the helmet on his lap */
  R('#f4f2ec',56,72,16,24);R('#e8bc98',58,60,12,12);R('#1a1c20',57,58,14,4);R('#f4f2ec',50,90,12,8);R('#f4f2ec',66,90,12,8);
  R('#1a1c20',50,98,6,4);R('#1a1c20',72,98,6,4);R('#c8321f',58,82,12,10);R('#f4f2ec',60,84,8,3);   /* his helmet */
  /* Carl: green, cap, holding his helmet against his chest, a piglet peeking out of it */
  R('#7c9468',106,72,16,24);R('#e8bc98',108,60,12,12);R('#c8a040',107,58,14,4);R('#7c9468',100,90,12,8);R('#7c9468',116,90,12,8);
  R('#3a2a1e',100,98,6,4);R('#3a2a1e',122,98,6,4);R('#3fa04a',108,78,12,10);R('#f0b0b0',112,74,5,4);R('#1e1c1c',113,75,1,1);
  /* the stamp corner, a milk carton */
  R('#f4efe2',160,92,26,24);R('#2f78d8',162,94,22,20);R('#f4f2ec',168,97,10,14);R('#2f78d8',168,97,10,3);
  g.fillStyle='#fff';g.font='bold 10px "Titillium Web",sans-serif';g.textAlign='left';g.fillText('Hälsningar från Idalaskolan!',5,115);
  g.lineWidth=2;g.strokeStyle='#fff';g.strokeRect(1,1,w-2,h-2);
}
