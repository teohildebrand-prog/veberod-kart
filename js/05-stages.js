"use strict";
/* ───────── stages ───────── */
const N=720, TANK=100, CPN=8, AI_G=30;   /* AI cornering grip */   /* checkpoints per lap */
let HW=8.2, BANKLAT=12.7, SEG=1, JUMPS=[];
const sx=new Float32Array(N),sy=new Float32Array(N),sz=new Float32Array(N);
const fx=new Float32Array(N),fz=new Float32Array(N);
const rx=new Float32Array(N),rz=new Float32Array(N);
const curv=new Float32Array(N), bank=new Float32Array(N), scurv=new Float32Array(N);

const STAGES=[
{ id:'lund', name:'LUND', sub:'GAMLA STADEN', hw:7.0,
  bars:[0.40,0.95,0.25], laps:3,
  blurb:'Cobbled lanes wound between the old houses, with the cathedral towers over everything. Nineteen corners and barely a straight — the slowest lap and the hardest to drive clean.',
  sky:[0xdde4e9,0x6f9cc4], fog:[0xccd7de,55,300], amb:0x6d7686, dif:0xfff2da,
  road:'cobble', verge:'kerb', edge:'wall', ground:'town',
  jumpSpec:[{h:2.4,drop:1.6,up:12,dn:7,rec:16}],
  ctrl:[[   0, 0, -92],[  52, 1, -98],[  96, 2, -72],[ 108, 3, -28],
        [  88, 4,   8],[ 110, 4,  46],[  98, 2,  90],[  54, 1, 110],
        [  12, 2,  92],[ -10, 5,  56],[ -40, 6,  74],[ -78, 5, 102],
        [-116, 3,  74],[-106, 1,  28],[ -70, 2,   4],[ -92, 4, -38],
        [-110, 3, -80],[ -64, 1,-104],[ -22, 0,-106]] },

{ id:'veberod', name:'VEBERÖD', sub:'LANDSBYGDEN', hw:8.2,
  bars:[0.75,0.60,0.90], laps:3,
  blurb:'Rapeseed, spruce and a barn you drive straight through. Thirty-two metres of elevation and three ramps through the fields.',
  sky:[0xdde4e9,0x2f7fd6], fog:[0xc2d0d9,70,340], amb:0x62707f, dif:0xfff0d4,
  road:'asphalt', verge:'gravel', edge:'fence', ground:'fields',
  jumpSpec:[{h:4.2,drop:3.0,up:13,dn:7,rec:20},
            {h:3.4,drop:2.6,up:12,dn:7,rec:18},
            {h:2.2,drop:1.6,up:10,dn:6,rec:14}],
  ctrl:[[   0,  0,-150],[  66,  0,-154],[ 120,  3,-128],[ 146, 12, -74],
        [ 142, 24, -26],[ 112, 31,  -8],[ 116, 30,  24],[ 158, 22,  56],
        [ 172,  8, 104],[ 132,  2, 140],[  74,  3, 134],[  40,  6,  96],
        [  14,  8,  62],[ -24,  5,  80],[ -50,  2, 128],[-104,  1, 138],
        [-152,  6,  98],[-158, 18,  44],[-120, 26,   6],[ -70, 20, -14],
        [ -56,  6, -54],[ -88,  1, -96],[-118,  0,-130],[ -68,  0,-160]],
  /* genvägar: a = fork, b = merge on the main loop; mid = bends off the chord */
  routes:[
    {id:'grus',name:'GRUSVÄGEN',a:130,b:194,hw:3.6,side:-1,lead:10,leadLat:9,
     mid:[[0.25,3.5],[0.5,-1],[0.75,3.5]],surface:'gravel',risk:0.3,
     blurb:'Narrow gravel through the farmyard, a pair of drift bends past the hens.'},
    {id:'raps',name:'RAPSFÄLTET',a:294,b:404,hw:4.0,side:-1,lead:9,leadLat:10,
     mid:[[0.25,-5],[0.5,3],[0.75,-5]],surface:'dirt',mud:[[0.12,0.88]],risk:0.7,
     blurb:'Tractor track through the rapeseed. Mud in the middle, blind exit.'}],
  /* picknickstämplar: one by the road, one on each shortcut */
  stamps:[
    {id:'veb1',dish:'Spettekaka',ini:'S',kind:'intro',route:'main',i:494,lat:-6.4,
     hint:'Strax efter ladan, ute vid vägkanten.',
     story:'Skåne\'s tower cake. Egg, sugar and potato starch are dripped onto a spit turning over an open fire, layer on layer, until it stands like a lace-white pagoda. You break it with a light tap, never a knife.'},
    {id:'veb2',dish:'Äggakaka',ini:'Ä',kind:'route',route:'grus',f:0.55,lat:1.4,
     hint:'Hönsen på grusvägen vaktar något gott.',
     story:'The Skåne farmhouse pancake: a thick egg batter fried in the pan and served with crisp pork belly and lingonberries. Every farm with hens had it on the table, which is why it hides among them.'},
    {id:'veb3',dish:'Fläderblomssaft',ini:'F',kind:'master',route:'raps',f:0.84,lat:'edge',bale:true,
     hint:'Högt upp på en halmbal där rapsen tar slut.',
     story:'In June the elder along the field edges flowers white, and the umbels go into fläderblomssaft, a sweet cordial with lemon. It is the drink of every midsummer picnic: diluted, ice cold, with a wasp in it.'}] },

{ id:'bron', name:'ÖRESUNDSBRON', sub:'ÖVER SUNDET', hw:11.0,
  bars:[1.00,0.08,0.00], laps:2,
  blurb:'Two kilometres of deck over open water at blue hour, lit down both edges, a hairpin at each end and nothing else. Flat out the whole way — the only stage where nothing matters but top speed. Two laps.',
  sky:[0xf2a874,0x1f3a72], fog:[0xae97a6,140,640], amb:0x5c6079, dif:0xffd2a0,
  road:'concrete', verge:'glow', edge:'rail', ground:'sea',
  terrain:{size:1900,seg:44}, jumpSpec:[],
  ctrl:[[-520, 12, -20],[-380, 16, -20],[-240, 21, -20],[-120, 25, -20],
        [   0, 27, -20],[ 120, 25, -20],[ 240, 21, -20],[ 380, 16, -20],
        [ 520, 12, -20],[ 566, 11,  -8],[ 566, 11,   8],
        [ 520, 12,  20],[ 380, 16,  20],[ 240, 21,  20],[ 120, 25,  20],
        [   0, 27,  20],[-120, 25,  20],[-240, 21,  20],[-380, 16,  20],
        [-520, 12,  20],[-566, 11,   8],[-566, 11,  -8]] },

{ id:'ahus', name:'ÅHUS-PARKEN', sub:'NÖJESFÄLTET', hw:8.6,
  bars:[0.80,0.70,1.00], laps:3, bankGain:0.95, bankMax:1.50,
  blurb:'A seaside funfair that someone paved a road through. Fifty metres of climb, four ramps and corners banked so hard you drive them sideways, in under the coaster loops and past the ferris wheel.',
  sky:[0xffb27a,0x2e5fa8], fog:[0xcfb4a2,80,400], amb:0x6a6478, dif:0xffdcb0,
  road:'asphalt', verge:'kerb', edge:'rail', ground:'park',
  jumpSpec:[{h:4.6,drop:3.4,up:13,dn:7,rec:20},{h:3.8,drop:2.8,up:12,dn:7,rec:18},
            {h:3.2,drop:2.4,up:11,dn:6,rec:16},{h:2.6,drop:1.9,up:10,dn:6,rec:14}],
  ctrl:[[   0,  0,-130],[  64,  2,-138],[ 124, 12,-112],[ 152, 28, -66],
        [ 146, 44, -16],[ 104, 50,  14],[ 120, 38,  58],[ 162, 20,  92],
        [ 136,  6, 134],[  76,  2, 150],[  20, 10, 126],[  -8, 26,  86],
        [ -44, 34, 104],[ -92, 28, 136],[-140, 14, 110],[-150,  4,  58],
        [-108,  8,  22],[ -62, 20,  -6],[ -88, 34, -46],[-136, 24, -92],
        [-104,  8,-132],[ -48,  0,-146]] },

{ id:'tollarp', name:'TOLLARP', sub:'INDUSTRIHÅLAN', hw:9.4,
  bars:[0.95,0.45,0.70], laps:3,
  blurb:'Wide cracked concrete between the sheds, under the pipe bridges and over the slag heap. Long straights, flat-out and filthy — the fastest lap on the card.',
  sky:[0xd8b083,0x8a6f5a], fog:[0xc09a68,40,250], amb:0x6f6355, dif:0xffd8a4,
  road:'concrete', verge:'dirt', edge:'jersey', ground:'waste',
  jumpSpec:[{h:3.8,drop:2.8,up:13,dn:7,rec:18},
            {h:3.0,drop:2.2,up:11,dn:6,rec:16},
            {h:2.6,drop:1.9,up:10,dn:6,rec:14}],
  ctrl:[[   0,  0,-170],[  90,  0,-174],[ 160,  4,-146],[ 190, 10, -88],
        [ 182, 16, -20],[ 200, 18,  44],[ 182, 12, 108],[ 126,  6, 150],
        [  54,  8, 146],[  -6, 14, 112],[ -56, 16,  72],[-112, 12,  92],
        [-166,  8, 124],[-206, 12,  66],[-188, 18,   0],[-140, 22, -40],
        [-152, 15,-100],[-188,  8,-140],[-120,  3,-172],[ -50,  0,-178]] },

/* Knightmare-athon's counterpart: no shortcut, a castle ghost */
{ id:'glimminge', name:'GLIMMINGEHUS', sub:'BORGEN I MÅNSKEN', hw:8.0,
  bars:[0.55,0.85,0.45], laps:3,
  blurb:'Round the medieval stone castle on Österlen under a full moon, on cobbles lit by torches and through the gatehouse arch. No shortcut, like the old castle track it borrows from, and the castle ghost drifts through the walls and spins whoever it touches.',
  sky:[0x23304f,0x05070f], fog:[0x18203a,45,280], amb:0x46506c, dif:0xa8bce8,
  road:'cobble', verge:'kerb', edge:'wall', ground:'night',
  jumpSpec:[{h:3.4,drop:2.4,up:12,dn:7,rec:16},{h:2.6,drop:1.8,up:10,dn:6,rec:14}],
  ctrl:[[   0, 0,-180],[  84, 0,-178],[ 144, 2,-144],[ 180, 5, -84],[ 168, 6, -24],
        [ 118, 5,   4],[  84, 3,  48],[ 110, 2, 108],[  72, 1, 162],[   0, 0, 180],
        [ -60, 1, 144],[ -70, 3,  84],[-130, 5,  72],[-182, 7,  24],[-168, 6, -48],
        [-120, 3, -84],[ -84, 1,-132],[ -48, 0,-180]],
  castle:[6,6],
  hazards:H=>hazardsGlimminge(H),
  stamps:[
    {id:'glm1',dish:'Svartsoppa',ini:'S',kind:'intro',route:'main',i:606,lat:-6.2,
     hint:'Strax innanför porttornet, vid vägkanten.',
     story:'Black soup: goose blood and stock spiced with cloves, ginger and a dash of port, served on Mårten Gås eve in November with apple, prunes and a slice of goose liver sausage. Skåne\'s darkest dish, eaten by candlelight, which suits a castle at night.'},
    {id:'glm2',dish:'Ålagille',ini:'Å',kind:'line',route:'main',i:'tight',lat:'inside',
     hint:'Tätt intill innerkanten, där vägen svänger tvärast.',
     story:'An Österlen eel feast. In autumn the eel fishers along the coast invite everyone in, and the eel comes smoked, fried, boiled, in aspic and grilled on straw, a dozen ways in one evening, with schnapps between the courses.'},
    {id:'glm3',dish:'Äppelkaka',ini:'Ä',kind:'air',route:'main',jump:0,after:5,lat:0,air:4.6,
     hint:'Högt i luften över det första hoppet.',
     story:'Österlen grows Sweden\'s apples, around Kivik and all the way up the coast. Äppelkaka is the autumn answer to a full orchard: sliced apples, cinnamon and a crumb of butter and breadcrumbs, baked soft and eaten warm with vanilla sauce.'}] },

/* Desert Adventure Dragway's counterpart: two secret passages, opened with a rocket */
{ id:'ales', name:'ALES STENAR', sub:'SANDDRAGET', hw:9.0,
  bars:[0.95,0.35,0.60], laps:3,
  blurb:'A drag strip over the Sandhammaren dunes out to the stone ship on the cliff above the sea. Two secret passages run between the standing stones, but a boulder sits in each mouth: blow it out of the way with a spettekaka. Drive the ship backwards and Ale\'s curse swaps your steering.',
  sky:[0xf6eed4,0x3a8ad6], fog:[0xe8dec4,90,430], amb:0x6c6a62, dif:0xfff4dc,
  road:'sand', verge:'sand', edge:'fence', ground:'dunes', terrain:{size:900,seg:84},
  jumpSpec:[{h:4.0,drop:3.0,up:13,dn:7,rec:20},{h:3.2,drop:2.4,up:12,dn:7,rec:16}],
  ctrl:[[-260, 3, -40],[-130, 4, -44],[   0, 4, -40],[ 130, 6, -44],[ 240, 9, -42],
        [ 300,14, -24],[ 322,16,  14],[ 306,16,  52],[ 250,13,  66],[ 170, 9,  58],
        [ 100, 7,  72],[  56, 8, 124],[  -6, 9, 138],[ -52, 7,  96],[-120, 5,  82],
        [-220, 3,  64],[-300, 2,  40],[-322, 2,   4],[-306, 2, -30]],
  /* the sea lies north and east, below the cliff */
  shore:(x,z)=>-24*smooth(0,46,Math.max(x-342,-(z+92))),
  hazards:H=>hazardsAles(H),
  routes:[
    {id:'skepp',name:'SKEPPSSÄTTNINGEN',a:248,b:350,hw:4.5,side:1,lead:9,leadLat:10,
     mid:[[0.3,-20],[0.7,-20]],surface:'sand',risk:0.4,hidden:true,shoot:true,
     blurb:'Straight down the length of the stone ship. A boulder blocks the way in.'},
    {id:'stenar',name:'STENRADEN',a:414,b:536,hw:4.5,side:1,lead:9,leadLat:10,
     mid:[[0.5,0]],surface:'gravel',risk:0.3,hidden:true,shoot:true,
     blurb:'Between two rows of standing stones over the dune. A boulder blocks the way in.'}],
  stamps:[
    {id:'ale1',dish:'Böckling',ini:'B',kind:'intro',route:'main',i:64,lat:-6.4,
     hint:'Vid rökeriet på långa rakan, mot havet.',
     story:'Kåseberga below the stones is a fishing village of smokehouses. Herring goes in over alder smoke and comes out golden as böckling, eaten warm on the harbour wall with a slice of bread and the wind straight off the Baltic.'},
    {id:'ale2',dish:'Fiskesoppa',ini:'F',kind:'route',route:'skepp',f:0.5,lat:0,
     hint:'Mitt i skeppet. Porten är spärrad: kanske en spettekaka?',
     story:'The fish soup of the south coast: whatever the boats brought in, cod, salmon and a few prawns, in a saffron and tomato broth with a spoon of aioli. It is what everyone eats after a cold walk out to the stones.'},
    {id:'ale3',dish:'Sandkaka',ini:'S',kind:'air',route:'main',jump:1,after:5,lat:0,air:4.6,
     hint:'Högt i luften över det andra hoppet.',
     story:'Sand cake is named for its crumb, not the beach: a pound cake of butter, sugar, eggs and potato flour that falls apart like dry sand. It belongs on the coffee table of every summer cottage in the dunes.'}] }
];
let stage=STAGES[1];

/** put the ramps on the straightest bits of whatever layout we just sampled */
function autoJumps(spec,spans){
  spans=spans||[];
  const head=i=>{const a=(i-3+N)%N,b=(i+3)%N;return Math.atan2(sx[b]-sx[a],sz[b]-sz[a]);};
  const sc=[];
  for(let i=0;i<N;i++){
    const h0=head(i);let m=0;
    for(let k=-14;k<=22;k++)m=Math.max(m,Math.abs(wrapAng(head((i+k+N)%N)-h0)));
    sc.push([m,i]);
  }
  sc.sort((a,b)=>a[0]-b[0]);
  const out=[];
  for(const e of sc){
    if(out.length>=spec.length)break;
    const i=e[1];
    if(Math.min(Math.abs(i-10),N-Math.abs(i-10))<80)continue;       /* clear of the grid */
    if(out.some(j=>Math.min(Math.abs(i-j.at),N-Math.abs(i-j.at))<70))continue;
    const q=spec[out.length];
    if(spans.some(s=>i+q.dn+q.rec+8>=s[0]-10&&i-q.up-8<=s[1]+10))continue;
    out.push({at:i,h:q.h,drop:q.drop,up:q.up,dn:q.dn,rec:q.rec});
  }
  return out;
}

function sampleTrack(st){
  HW=st.hw; BANKLAT=HW+4.5;
  const curve=new THREE.CatmullRomCurve3(
    st.ctrl.map(p=>new THREE.Vector3(p[0],p[1],p[2])),true,'catmullrom',.5);
  const pts=curve.getSpacedPoints(N);
  for(let i=0;i<N;i++){sx[i]=pts[i].x;sy[i]=pts[i].y;sz[i]=pts[i].z;}
  for(let i=0;i<N;i++){
    const a=(i-1+N)%N,b=(i+1)%N;
    let dx=sx[b]-sx[a],dz=sz[b]-sz[a];
    const L=Math.hypot(dx,dz)||1;dx/=L;dz/=L;
    fx[i]=dx;fz[i]=dz;rx[i]=-dz;rz[i]=dx;
  }
  JUMPS=autoJumps(st.jumpSpec,(st.routes||[]).map(r=>[r.a,r.b]));
  for(const J of JUMPS){                       /* ramp up, then the ground falls away */
    for(let k=0;k<=J.up;k++){const t=k/J.up;sy[(J.at-J.up+k+N)%N]+=J.h*t*t;}
    for(let k=1;k<=J.dn;k++){const t=k/J.dn;sy[(J.at+k)%N]+=J.h*(1-t)-J.drop*t;}
    for(let k=1;k<=J.rec;k++){const t=k/J.rec;sy[(J.at+J.dn+k)%N]+=-J.drop*(1-t);}
  }
  for(let i=0;i<N;i++){
    const j=(i+14)%N;
    curv[i]=Math.abs(wrapAng(Math.atan2(fx[j],fz[j])-Math.atan2(fx[i],fz[i])));
  }
  const raw=new Float32Array(N);               /* lift the outside of every corner */
  for(let i=0;i<N;i++){
    const a=(i-7+N)%N,b=(i+7)%N;
    raw[i]=wrapAng(Math.atan2(fx[b],fz[b])-Math.atan2(fx[a],fz[a]));
    scurv[i]=raw[i];                           /* signed: >0 bends toward -right */
  }
  for(let i=0;i<N;i++){
    let acc=0;for(let k=-12;k<=12;k++)acc+=raw[(i+k+N)%N];
    const BG=st.bankGain||0.34, BM=st.bankMax||0.45;
    bank[i]=clamp(acc/25*BG,-BM,BM);
  }
  let L=0;for(let i=0;i<N;i++){const j=(i+1)%N;L+=Math.hypot(sx[j]-sx[i],sz[j]-sz[i]);}
  SEG=L/N;
}

/* ───────── genvägar: authored alternatives beside the main loop ─────────
   The main loop stays the global arrays (route 0). Each alternative is an open
   spline sampled at the same spacing, starting and ending on the main road's edge.
   A kart's k.rib says which one it is on (0 = main) and k.si indexes that route. */
const SURF={
  /* top speed and grip both scale with the kart's off-road factor o, so a loose
     surface rewards the karts built for fields */
  road:  {top:o=>1,           grip:o=>1,            fuel:1.0,name:'ASFALT'},
  gravel:{top:o=>o+(1-o)*0.4, grip:o=>1-0.45*(1-o), fuel:1.1,name:'GRUS'},
  dirt:  {top:o=>o+(1-o)/2,   grip:o=>1-0.45*(1-o), fuel:1.2,name:'JORD'},
  mud:   {top:o=>o,           grip:o=>1-0.60*(1-o), fuel:1.3,name:'LERA'}
};
/* the effects columns of the surface table: what the wheels throw up, the noise
   under the tyres, and what happens the moment a kart rolls onto it */
SURF.cobble={top:o=>1,grip:o=>1,fuel:1.0,name:'KULLERSTEN'};
SURF.sand={top:o=>o+(1-o)/2,grip:o=>1-0.40*(1-o),fuel:1.2,name:'SAND'};
const SFX={
  road:  {dust:null,                    noise:null},
  cobble:{dust:null,                    noise:{f:820,g:.024},rattle:true},
  gravel:{dust:[.80,.72,.55],           noise:{f:1500,g:.020}},
  dirt:  {dust:[.55,.42,.28],field:true,noise:{f:700,g:.022}},
  mud:   {dust:[.33,.25,.16],field:true,spray:true,noise:{f:420,g:.026}},
  grass: {dust:[.45,.62,.30],field:true,noise:{f:1100,g:.014}},
  sand:  {dust:[.93,.85,.66],           noise:{f:2600,g:.018}}
};
const isCow=k=>k===player?CHARS[charSel].id==='cow':k.cfg.kind==='cow';
function surfaceEnter(k,s){
  const S=SFX[s];
  if(S&&S.field&&isCow(k)&&clock-(k.mooT||-9)>4&&
     (k===player||Math.hypot(k.x-player.x,k.z-player.z)<45)){k.mooT=clock;moo();}
}
const COMMIT=10, MERGE=12;           /* samples where you can still change your mind */
let ALTS=[];
const MAIN={X:sx,Y:sy,Z:sz,FX:fx,FZ:fz,RX:rx,RZ:rz,CURV:curv,get hw(){return HW;}};
function buildAlts(st){
  ALTS=[];
  (st.routes||[]).forEach((R,ri)=>{
    const lat0=R.side*(HW-R.hw), ld=R.lead||9, ll=R.side*(R.leadLat||10);
    const P=(i,l)=>{i=((i%N)+N)%N;return new THREE.Vector3(sx[i]+rx[i]*l,0,sz[i]+rz[i]*l);};
    const A=P(R.a+ld,ll), B=P(R.b-ld,ll);
    const cx=B.x-A.x,cz=B.z-A.z,cl=Math.hypot(cx,cz)||1,px=-cz/cl,pz=cx/cl;
    const pts=[P(R.a,lat0),P(R.a+5,lat0),A];
    for(const m of R.mid)pts.push(new THREE.Vector3(A.x+cx*m[0]+px*m[1],0,A.z+cz*m[0]+pz*m[1]));
    pts.push(B,P(R.b-5,lat0),P(R.b,lat0));
    const cur=new THREE.CatmullRomCurve3(pts,false,'catmullrom',.5);
    const M=Math.max(16,Math.round(cur.getLength()/SEG)+1), Q=cur.getSpacedPoints(M-1);
    const F=()=>new Float32Array(M);
    const o=Object.assign({},R,{idx:ri+1,n:M,X:F(),Y:F(),Z:F(),FX:F(),FZ:F(),RX:F(),RZ:F(),
      CURV:F(),MAP:F(),MI:new Int16Array(M),TM:new Int8Array(M),S:[]});
    for(let j=0;j<M;j++){o.X[j]=Q[j].x;o.Z[j]=Q[j].z;}
    for(let j=0;j<M;j++){
      const a=Math.max(0,j-1),b=Math.min(M-1,j+1);
      let dx=o.X[b]-o.X[a],dz=o.Z[b]-o.Z[a];const L=Math.hypot(dx,dz)||1;dx/=L;dz/=L;
      o.FX[j]=dx;o.FZ[j]=dz;o.RX[j]=-dz;o.RZ[j]=dx;
    }
    const span=((R.b-R.a)%N+N)%N;
    for(let j=0;j<M;j++){
      const mi=nearestGlobal(o.X[j],o.Z[j]);o.MI[j]=mi;
      o.TM[j]=((sx[mi]-o.X[j])*o.RX[j]+(sz[mi]-o.Z[j])*o.RZ[j])>=0?1:-1;
      o.MAP[j]=R.a+span*j/(M-1);
      const f=j/(M-1);
      o.S.push((R.mud||[]).some(m=>f>=m[0]&&f<=m[1])?'mud':R.surface);
    }
    /* height: the main road's own surface where they overlap, a smooth farm lane between */
    const hm=j=>groundAt(o.X[j],o.Z[j],o.MI[j]);
    const y0=hm(5),y1=hm(M-6);
    for(let j=0;j<M;j++){
      const mi=o.MI[j],ml=Math.abs((o.X[j]-sx[mi])*rx[mi]+(o.Z[j]-sz[mi])*rz[mi]);
      const lane=y0+(y1-y0)*smooth(0,1,(j-5)/(M-11));
      o.Y[j]=(j<=5||j>=M-6)?hm(j):lerp(lane,hm(j),1-smooth(HW-1,HW+6,ml));
    }
    /* curvature reads on into the main road after the merge, so the AI brakes for it */
    const hd=j=>{if(j<M)return Math.atan2(o.FX[j],o.FZ[j]);
      const i=(R.b+(j-(M-1)))%N;return Math.atan2(fx[i],fz[i]);};
    /* lanes are twisty: an S-bend cancels out over 14 samples, so also read each half */
    for(let j=0;j<M;j++)o.CURV[j]=Math.max(Math.abs(wrapAng(hd(j+14)-hd(j))),
      2*Math.abs(wrapAng(hd(j+7)-hd(j))),2*Math.abs(wrapAng(hd(j+14)-hd(j+7))));
    ALTS.push(o);
  });
}
function nearestAlt(R,x,z,hint){
  let best=clamp(hint|0,0,R.n-1),bd=Infinity;
  const lo=Math.max(0,best-14),hi=Math.min(R.n-1,best+14);
  for(let j=lo;j<=hi;j++){const dx=x-R.X[j],dz=z-R.Z[j],d=dx*dx+dz*dz;if(d<bd){bd=d;best=j;}}
  return best;
}
function nearestAltAll(R,x,z){
  let best=0,bd=Infinity;
  for(let j=0;j<R.n;j++){const dx=x-R.X[j],dz=z-R.Z[j],d=dx*dx+dz*dz;if(d<bd){bd=d;best=j;}}
  return best;
}
const altLat=(R,j,x,z)=>(x-R.X[j])*R.RX[j]+(z-R.Z[j])*R.RZ[j];
const altFwd=(R,j,x,z)=>(x-R.X[j])*R.FX[j]+(z-R.Z[j])*R.FZ[j];
function altBase(R,j,x,z){
  const f=altFwd(R,j,x,z), j2=f>=0?Math.min(j+1,R.n-1):Math.max(j-1,0);
  return R.Y[j]+(R.Y[j2]-R.Y[j])*Math.min(1,Math.abs(f)/SEG);
}
/** height a kart on an alternative drives on */
function groundAlt(R,x,z,j){
  const lat=Math.abs(altLat(R,j,x,z)), mi=R.MI[j];
  let h=lerp(altBase(R,j,x,z),groundAt(x,z,mi),smooth(R.hw+3,R.hw+30,lat));
  if(j<COMMIT+6||j>R.n-1-MERGE-6){                 /* still on the main road's asphalt */
    const k=nearestLocal(x,z,mi);
    const ml=Math.abs((x-sx[k])*rx[k]+(z-sz[k])*rz[k]);
    h=lerp(h,groundAt(x,z,k),1-smooth(HW-1,HW+6,ml));
  }
  return h;
}
function groundK(k,x,z){
  return k.rib?groundAlt(ALTS[k.rib-1],x,z,k.si):groundAt(x,z,k.si);
}
/** is (x,z) within pad of any alternative's lane? */
function nearAlt(x,z,pad){
  for(const R of ALTS){
    const j=nearestAltAll(R,x,z),f=altFwd(R,j,x,z);
    if((j===0&&f<0)||(j===R.n-1&&f>0))continue;
    if(Math.abs(altLat(R,j,x,z))<R.hw+pad)return true;
  }
  return false;
}
/** a fork or merge is no place for items or pumps */
function clearOfForks(i,pad){
  for(const R of ALTS){
    const da=((i-R.a)%N+N)%N, db=((R.b-i)%N+N)%N;
    if(da<COMMIT+pad||N-da<pad||db<MERGE+pad||N-db<pad)return false;
  }
  return true;
}

function nearestGlobal(x,z){
  let best=0,bd=Infinity;
  for(let i=0;i<N;i+=8){const dx=x-sx[i],dz=z-sz[i],d=dx*dx+dz*dz;if(d<bd){bd=d;best=i;}}
  let b=best,bb=bd;
  for(let k=-8;k<=8;k++){const i=(best+k+N)%N,dx=x-sx[i],dz=z-sz[i],d=dx*dx+dz*dz;if(d<bb){bb=d;b=i;}}
  return b;
}
function nearestLocal(x,z,hint){
  let best=hint,bd=Infinity;
  for(let k=-26;k<=26;k++){
    const i=(hint+k+N)%N,dx=x-sx[i],dz=z-sz[i],d=dx*dx+dz*dz;
    if(d<bd){bd=d;best=i;}
  }
  return best;
}
const rolls=(x,z)=>Math.sin(x*.0121)*Math.cos(z*.0168)*5.5
                  +Math.sin((x+z*.7)*.0067)*8.0
                  +Math.cos((x*.6-z)*.0231)*1.8;
const DIP=0.25;                      /* grass sits just below the tarmac */
/** height a kart drives on: exactly the road where the road is */
function groundAt(x,z,hint){
  const i=hint==null?nearestGlobal(x,z):nearestLocal(x,z,hint);
  const dx=x-sx[i],dz=z-sz[i];
  const lat=Math.abs(dx*rx[i]+dz*rz[i]);
  const fwd=dx*fx[i]+dz*fz[i];
  const j=(i+1)%N;
  const base=sy[i]+(sy[j]-sy[i])*(fwd/SEG);
  const t=smooth(HW+8,HW+50,lat);
  return base+clamp(dx*rx[i]+dz*rz[i],-BANKLAT,BANKLAT)*bank[i]*(1-t)+rolls(x,z)*t;
}
/** height the terrain mesh and every prop sits at */
function meshY(x,z){
  let h=meshMain(x,z);
  if(stage.ground==='sea')return h;
  for(const R of ALTS){                         /* the fields settle onto the farm lanes */
    const j=nearestAltAll(R,x,z),f=altFwd(R,j,x,z);
    if((j===0&&f<0)||(j===R.n-1&&f>0))continue;
    const lat=Math.abs(altLat(R,j,x,z));
    if(lat>R.hw+34)continue;
    h=lerp(altBase(R,j,x,z)-DIP,h,smooth(R.hw+4,R.hw+34,lat));
  }
  return h;
}
function meshMain(x,z){
  if(stage.ground==='sea')return 0;   /* off the deck is open water */
  const i=nearestGlobal(x,z);
  const dx=x-sx[i],dz=z-sz[i];
  const lat=Math.abs(dx*rx[i]+dz*rz[i]);
  const fwd=dx*fx[i]+dz*fz[i];
  const j=(i+1)%N;
  const base=sy[i]+(sy[j]-sy[i])*(fwd/SEG);
  const t=smooth(HW+8,HW+50,lat);
  return base+clamp(dx*rx[i]+dz*rz[i],-BANKLAT,BANKLAT)*bank[i]*(1-t)
         +rolls(x,z)*t-DIP*(1-t)+(stage.shore?stage.shore(x,z)*t:0)+(stage.castle?castleMod(x,z)*t:0);
}
function latAt(x,z){
  const k=nearestGlobal(x,z);
  let l=Math.abs((x-sx[k])*rx[k]+(z-sz[k])*rz[k]);
  for(const R of ALTS){                         /* a lane counts as road for scenery */
    const j=nearestAltAll(R,x,z),f=altFwd(R,j,x,z);
    if((j===0&&f<0)||(j===R.n-1&&f>0))continue;
    l=Math.min(l,Math.abs(altLat(R,j,x,z))+HW-R.hw);
  }
  return l;
}

/** ribbon along the road, every `step` samples (low poly = era correct) */
function ribbon(inner,outer,up,vScale,step){
  step=step||1;
  const ids=[];for(let i=0;i<N;i+=step)ids.push(i);
  const M=ids.length,pos=[],uv=[],idx=[];
  for(let a=0;a<M;a++){
    const i=ids[a];
    pos.push(sx[i]+rx[i]*inner, sy[i]+up+inner*bank[i], sz[i]+rz[i]*inner);
    pos.push(sx[i]+rx[i]*outer, sy[i]+up+outer*bank[i], sz[i]+rz[i]*outer);
    uv.push(0,i*SEG/vScale, 1,i*SEG/vScale);
  }
  for(let a=0;a<M;a++){
    const p=2*a,q=2*a+1,r=(2*a+2)%(2*M),s=(2*a+3)%(2*M);
    idx.push(p,q,r, q,s,r);
  }
  const g=new THREE.BufferGeometry();
  g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));
  g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));
  g.setIndex(idx);g.computeVertexNormals();
  return g;
}

let world=new THREE.Group();scene.add(world);

/** quad strip swept along the road between two offset/height pairs */
function sweep(a,b,o1,h1,o2,h2,mat){
  const M=b-a+1,pos=[],uv=[],idx=[];
  for(let q=0;q<M;q++){
    const i=(a+q+N)%N;
    pos.push(sx[i]+rx[i]*o1, sy[i]+o1*bank[i]+h1, sz[i]+rz[i]*o1);
    pos.push(sx[i]+rx[i]*o2, sy[i]+o2*bank[i]+h2, sz[i]+rz[i]*o2);
    uv.push(0,q*SEG/5, 1,q*SEG/5);
  }
  for(let q=0;q<M-1;q++){const p=2*q;idx.push(p,p+1,p+2, p+1,p+3,p+2);}
  const g=new THREE.BufferGeometry();
  g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));
  g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));
  g.setIndex(idx);g.computeVertexNormals();
  const m=new THREE.Mesh(g,mat);world.add(m);return m;
}
/** a box spanning two points, +Z along the span */
function strut(a,b,w,mat){
  const L=a.distanceTo(b);
  const m=new THREE.Mesh(flat(new THREE.BoxGeometry(w,w,L)),mat);
  m.position.copy(a).add(b).multiplyScalar(.5);
  m.lookAt(b);world.add(m);return m;
}
const ROADSTEP=4;

function roadTex(kind){
  let t;
  if(kind==='cobble'){
    t=pixTex(64,64,(g)=>{
      g.fillStyle='#4f4b45';g.fillRect(0,0,64,64);
      for(let r=0;r<16;r++)for(let c=0;c<16;c++){
        const o=(r%2)?2:0, v=120+((Math.random()*46)|0);
        g.fillStyle='rgb('+v+','+(v-6)+','+(v-16)+')';
        g.fillRect((c*4+o)%64,r*4,3,3);
      }
    });
  }else if(kind==='sand'){                        /* packed sand with tyre ruts */
    t=pixTex(64,64,(g)=>{
      g.fillStyle='#cdb88a';g.fillRect(0,0,64,64);
      for(let i=0;i<800;i++){
        g.fillStyle=Math.random()>.5?'rgba(232,216,172,.55)':'rgba(150,128,90,.45)';
        g.fillRect((Math.random()*64)|0,(Math.random()*64)|0,1,1);
      }
      g.fillStyle='rgba(140,118,82,.35)';
      for(const x of [14,20,42,48])g.fillRect(x,0,3,64);
    });
  }else if(kind==='concrete'){
    t=pixTex(64,64,(g)=>{
      g.fillStyle='#8d8a82';g.fillRect(0,0,64,64);
      for(let i=0;i<700;i++){
        g.fillStyle=Math.random()>.5?'rgba(160,156,146,.45)':'rgba(60,56,50,.45)';
        g.fillRect((Math.random()*64)|0,(Math.random()*64)|0,1,1);
      }
      g.fillStyle='rgba(40,36,30,.55)';
      g.fillRect(0,0,64,1);g.fillRect(0,32,64,1);g.fillRect(31,0,1,64);
      g.fillStyle='rgba(74,52,30,.30)';
      for(let i=0;i<5;i++)g.fillRect((Math.random()*64)|0,(Math.random()*64)|0,7,3);
    });
  }else{
    t=pixTex(64,64,(g)=>{
      g.fillStyle='#41454a';g.fillRect(0,0,64,64);
      for(let i=0;i<900;i++){
        g.fillStyle=Math.random()>.55?'rgba(120,126,132,.5)':'rgba(24,26,30,.5)';
        g.fillRect((Math.random()*64)|0,(Math.random()*64)|0,1,1);
      }
      g.fillStyle='rgba(30,32,36,.5)';
      for(let i=0;i<7;i++)g.fillRect(0,(Math.random()*64)|0,64,1);
    });
  }
  t.wrapS=t.wrapT=THREE.RepeatWrapping;return t;
}
function vergeTex(kind){
  const C={kerb:['#8e8a84','#a8a49c','#6e6a64'],
           gravel:['#9b8f74','#b4aa91','#6e6450'],
           dirt:['#6d6152','#82755f','#4a4238'],
           sand:['#d9c79a','#ebdcb4','#b8a476']}[kind]||['#9b8f74','#b4aa91','#6e6450'];
  const t=pixTex(32,32,(g)=>{
    g.fillStyle=C[0];g.fillRect(0,0,32,32);
    for(let i=0;i<300;i++){
      g.fillStyle=Math.random()>.5?C[1]:C[2];
      g.fillRect((Math.random()*32)|0,(Math.random()*32)|0,1,1);
    }
  });
  t.wrapS=t.wrapT=THREE.RepeatWrapping;return t;
}

function buildRoad(st){
  world.add(new THREE.Mesh(ribbon(-HW,HW,0,7,ROADSTEP),psMat({map:roadTex(st.road)})));
  if(st.verge==='glow'){                             /* the rainbow-road bit */
    const band=['#1e3f8c','#1f7fbf','#3fc9c0','#e8c33a','#f08a3c','#d8465e','#7a4fb5'];
    const gl=pixTex(4,56,(g)=>{
      for(let i=0;i<56;i++){
        g.fillStyle=band[Math.floor(i/56*band.length)%band.length];
        g.fillRect(0,i,4,1);
      }
    });
    gl.wrapS=gl.wrapT=THREE.RepeatWrapping;
    const gm=psMat({map:gl,unlit:true});
    world.add(new THREE.Mesh(ribbon(-HW-2.6,-HW+.1,-.10,34,ROADSTEP),gm));
    world.add(new THREE.Mesh(ribbon(HW-.1,HW+2.6,-.10,34,ROADSTEP),gm));
  }else{
    const vg=vergeTex(st.verge);
    world.add(new THREE.Mesh(ribbon(-HW-2.6,-HW+.1,-.12,5,ROADSTEP),psMat({map:vg})));
    world.add(new THREE.Mesh(ribbon(HW-.1,HW+2.6,-.12,5,ROADSTEP),psMat({map:vg})));
  }
  if(st.road==='cobble'||st.road==='sand')return;    /* no paint on cobbles or sand */
  const solid=st.road==='concrete';
  const col=solid?'#d8c257':'#dfe4e8';
  const edge=pixTex(4,16,(g)=>{
    g.fillStyle=col;g.fillRect(0,0,4,solid?16:10);
  });
  edge.wrapS=edge.wrapT=THREE.RepeatWrapping;
  const em=psMat({map:edge,unlit:true,transparent:true,alphaTest:.5,depthWrite:false});
  world.add(new THREE.Mesh(ribbon(-HW+.5,-HW+1.0,.05,3.2,ROADSTEP),em));
  world.add(new THREE.Mesh(ribbon(HW-1.0,HW-.5,.05,3.2,ROADSTEP),em));
}
