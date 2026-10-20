"use strict";
/* ───────── Sibylla ───────── */
/* Extra Allt Grand Prix: a bonus track, like a promotional extra on a late-90s demo disc. Start in
   the car park outside a Sibylla with a timber façade, red umbrellas and the red-and-white sign
   with the blue dot; slalom through the drive-through between the ordering stations, sweep round
   the outdoor seating and drive into a giant, imaginary kitchen: up Pommesbacken beside an
   enormous carton of fries, over the sauce conveyor, round the sizzling hairpin on the griddle
   (Stekbordskurvan) and down the tray-return chute (Brickreturen) to the finishing straight.
   Teo chose to keep the real Sibylla name and sign (2026-10-20), like the GAIS scarf. */
SURF.stekbord={top:o=>1,grip:o=>0.97,fuel:1.0,name:'STEKBORD'};
SFX.stekbord={dust:null,noise:{f:2400,g:.02}};
ROADTEX.stekbord=()=>pixTex(64,64,g=>{               /* the griddle: brushed steel, dark with grease, scraped lines */
  g.fillStyle='#4e5258';g.fillRect(0,0,64,64);
  for(let i=0;i<900;i++){g.fillStyle=Math.random()>.5?'rgba(120,124,130,.35)':'rgba(24,22,20,.35)';
    g.fillRect((Math.random()*64)|0,(Math.random()*64)|0,2,1);}
  g.fillStyle='rgba(150,154,160,.35)';for(let y=3;y<64;y+=6)g.fillRect(0,y,64,1);
  g.fillStyle='rgba(90,60,30,.35)';for(let i=0;i<7;i++)g.fillRect((Math.random()*52)|0,(Math.random()*56)|0,12,5);
});
SURF.bricka={top:o=>1,grip:o=>1,fuel:1.0,name:'BRICKRETUR'};
SFX.bricka={dust:null,noise:{f:640,g:.024},rattle:true};
ROADTEX.bricka=()=>pixTex(64,64,g=>{                 /* the tray return: steel rollers across the chute */
  g.fillStyle='#8a9098';g.fillRect(0,0,64,64);
  for(let y=0;y<64;y+=8){g.fillStyle='#b8bec6';g.fillRect(0,y,64,3);g.fillStyle='#d8dde2';g.fillRect(0,y,64,1);
    g.fillStyle='#5a6068';g.fillRect(0,y+5,64,2);}
  g.fillStyle='rgba(30,30,34,.25)';for(let i=0;i<200;i++)g.fillRect((Math.random()*64)|0,(Math.random()*64)|0,1,1);
});
SURF.driveIn={top:o=>1,grip:o=>1,fuel:1.0,name:'DRIVE-THROUGH'};
SFX.driveIn={dust:null,noise:null};
ROADTEX.driveIn=()=>pixTex(64,64,g=>{                /* the drive-through lane: red tarmac, white arrows worn thin */
  g.fillStyle='#8e3a32';g.fillRect(0,0,64,64);
  for(let i=0;i<600;i++){g.fillStyle=Math.random()>.5?'rgba(160,80,70,.45)':'rgba(60,20,18,.45)';
    g.fillRect((Math.random()*64)|0,(Math.random()*64)|0,1,1);}
  g.fillStyle='rgba(240,236,228,.55)';g.fillRect(29,10,6,26);g.beginPath();g.moveTo(22,36);g.lineTo(42,36);g.lineTo(32,50);g.closePath();g.fill();
});
VERGEC.sibylla=['#9a9892','#b0aea8','#82807a'];          /* grey kerbstones; the red-and-white blocks stand on them */
GROUND.sibylla={cell:30,stripe:0.9,verge:0x6e9a4a,
  cols:[0x6a9a48,0x76a650,0x5f8c42,0x80aa56,0x6e9e4a]};

/* the kitchen: a walled hall north of the west road; both roads through its south wall go
   through doorways */
const SIB_K={x0:-262,x1:14,z0:338,z1:644,h:24};
const sibInKitchen=(x,z,pad)=>{const p=pad||0;return x>SIB_K.x0-p&&x<SIB_K.x1+p&&z>SIB_K.z0-p&&z<SIB_K.z1+p;};
/* the car park round the start: everything south of the restaurant's line */
const sibInPark=(x,z)=>z<64&&z>-82&&x>-262&&x<150;
/* where the set pieces sit (main-road samples), worked out from the laid track */
const SIB={shop:22,pylon:52,drive:[86,96,108,120,132],pickup:132,stamp:118,
  terrace:{x:222,z:282},seat:[176,214],kitchenIn:330,fries:352,patches:[[426,-1],[444,-1],[462,-1]],
  chute:[482,606],trays:[490,600],
  anim:[],pa:null,sayLap:-1,sayDrive:-1,tractor:false,bell:0};

STAGES.push({ id:'sibylla', group:'bonus', name:'SIBYLLA', sub:'EXTRA ALLT GRAND PRIX', bonus:true,
  order:27, modes:['race','tt','free'],
  tag:'Bonusbana. Två varv. Extra mos. Full gas. Genom drive-through, runt uteserveringen och in i ett jättekök där pommesen är högre än du.',
  view:{i:12,lat:-7,h:3.4,to:{i:26,lat:26,h:6},fov:64},
  hw:8.2,
  bars:[0.7,0.8,0.55], laps:2, stand:false, bankGain:0.16, bankMax:0.14,
  aiLook:0.75,                                   /* long samples (1.9 km lap): the AI aims a little closer */
  blurb:'The bonus track: two laps from the car park of a Sibylla with a timber façade, red umbrellas and the red-and-white sign with the blue dot. Slalom through the drive-through between the ordering stations while the speaker asks if you want to upgrade, sweep round the outdoor seating, then drive into a giant kitchen: up Pommesbacken beside an enormous carton of fries, over the sauce conveyor, round Stekbordskurvan on the sizzling griddle (the dressing patches are marked, and the outside line is dry) and down Brickreturen, the tray-return chute, to the finishing straight. Bakom kiosken is the narrow delivery passage past the soft-serve kiosk; Personalvägen runs through the kitchen behind a stack of takeaway boxes, and a spettekaka knocks them over.',
  role:'Drive-through-slalom, en snabb sväng runt uteserveringen, hopp över såsbandet, en hal stekbordskurva och en lång brickretur nedför.',
  sky:[0xbfe0f4,0x3f8ad8], fog:[0xcfe2ee,140,560], amb:0x8a96a8, dif:0xfff2dc,
  road:'asphalt', verge:'sibylla', edge:'sibylla', ground:'sibylla',
  terrain:{size:900,seg:120},
  /* flat suburban ground; the kitchen floor is level with its road, the chute and the climb are ramps */
  mod:(x,z,t)=>-rolls(x,z)*t,
  land:(x,z,out)=>landSibylla(x,z,out),
  zones:[[84,136,'driveIn'],[404,480,'stekbord'],[484,604,'bricka']],
  jumpSpec:[{at:374,h:2.8,drop:2.0,up:10,dn:6,rec:12}],
  ctrl:[[-50,3,0],[25,3,0],[88,3,0],
        [135,3,8],[160,3,30],
        [168,3,58],[154,3,84],[172,3,110],[154,3,136],[168,3,162],
        [172,3,196],[186,3,224],[218,3,238],[252,3,256],[266,3,286],[254,3,312],[222,3,326],[180,3,328],
        [125,3,326],[62,3,324],[0,3,322],
        [-38,3,328],[-62,4,350],
        [-70,6,382],[-72,10,418],[-72,14,452],
        [-72,16,490],[-72,16,520],
        [-82,16,558],[-108,16,588],[-142,16,598],[-178,16,585],[-198,16,555],
        [-202,16,515],[-204,14,462],[-205,11,400],[-205,7,338],[-205,4,275],[-205,3,212],[-202,3,150],
        [-195,3,88],[-175,3,38],[-140,3,8],[-100,3,0]],
  stations:[[0.37,1],[0.86,1]],
  routes:[
    {id:'kiosk',name:'BAKOM KIOSKEN',a:138,b:252,hw:3.6,side:1,lead:14,leadLat:9,
     mid:[[0.3,9],[0.7,-9]],surface:'road',tex:'asphalt',risk:0.35,
     blurb:'The narrow delivery passage behind the soft-serve kiosk, between the crates and the bins. Shorter than the sweep round the seating, but the way in is a dog-leg off the end of the drive-through and the way out a squeeze onto the main road.'},
    {id:'personal',name:'PERSONALVÄGEN',a:398,b:492,hw:4.4,side:1,lead:18,leadLat:15,
     mid:[[0.5,-20]],surface:'road',tex:'concrete',risk:0.3,hidden:true,shoot:true,mouth:22,
     blockMesh:(R,j)=>sibBoxStack(R,j),blockAnim:(B,d)=>sibBoxStackAnim(B,d),
     blurb:'The staff passage straight through the kitchen between the shelves, cutting off Stekbordskurvan. Behind a stack of takeaway boxes: knock it over with a spettekaka. Tight corners at both ends keep it honest.'}],
  stamps:[
    {id:'sib1',dish:'Hamburgare',ini:'H',kind:'intro',route:'main',i:SIB.stamp,lat:-5.8,
     hint:'I drive-through, vid sista beställningsstationen, på utsidan av svängen.',
     story:'The Swedish grill-bar hamburger: a thin, well-done patty in a soft, slightly sweet bun with shredded lettuce, onion, pickled cucumber and a generous squirt of hamburger dressing, wrapped in paper. Ordered through a crackling speaker, and nobody has ever heard the price the first time.'},
    {id:'sib2',dish:'Pommes',ini:'P',kind:'air',route:'main',jump:0,after:5,lat:0,air:4.2,
     hint:'Högt över såsbandet, efter rampen i Pommesbacken.',
     story:'Pommes frites, always called pommes: thin, salted, served in a paper cup or carton, and eaten with ketchup, bearnaise or, in Skåne, sometimes all of it at once. A large portion is larger than anyone expects, and the last few at the bottom of the bag are the best.'},
    {id:'sib3',dish:'Mjukglass',ini:'M',kind:'route',route:'kiosk',f:0.5,lat:0,
     hint:'Bakom kiosken, mitt i den smala gången.',
     story:'Soft-serve ice cream pulled from the machine in a tall swirl into a wafer cone, usually vanilla, sometimes dipped in chocolate that sets into a shell, and in summer finished with a strösselbad of sprinkles. It drips down your wrist before you have walked back to the car.'}],
  postcard:{draw:(g,w,h)=>sibyllaPostcard(g,w,h),
    caption:'Victors hamburgare såg inte ut som på bilden. Han mätte.'},
  hazards:H=>hazardsSibylla(H), scenery:()=>scenerySibylla()
});

function landSibylla(x,z,out){
  if(sibInKitchen(x,z)){out.setHex(0xb8b4ac);return;}                                      /* under the kitchen's tiled floor */
  if(sibInPark(x,z)){out.setHex(0x5e5f62);return;}                                          /* the car park */
  const T=SIB.terrace,d=Math.hypot(x-T.x,z-T.z);
  if(d<34)out.setHex(d>31?0x7a6a5a:0xc8b48e);                                               /* the terrace: decking */
}

/* the edge: red-and-white kerb blocks outside, a stainless rail in the kitchen; nothing at lane
   mouths, fuel bays, or the chute (its own walls) */
EDGES.sibylla=st=>{
  const step=2,L=SEG*step+.12;
  const kerb=rosInst(flat(new THREE.BoxGeometry(.7,.55,L)).translate(0,.27,0),psMat({}),N*2,true);
  const rail=rosInst(flat(new THREE.BoxGeometry(.18,.14,L)).translate(0,1.0,0),psMat({color:0xd0d6dc}),N*2);
  const post=rosInst(flat(new THREE.BoxGeometry(.14,1.0,.14)).translate(0,.5,0),psMat({color:0xa8aeb4}),N*2);
  for(let i=0;i<N;i+=step)for(const side of [-1,1]){
    if(i>=SIB.chute[0]-2&&i<=SIB.chute[1]+2)continue;
    const o=side*(HW+1.6),x=sx[i]+rx[i]*o,z=sz[i]+rz[i]*o;
    if(nearAlt(x,z,2.6))continue;
    if(stations.some(S=>{let d=i-S.at;if(d<-N/2)d+=N;else if(d>N/2)d-=N;return S.side===side&&d>-3&&d<S.len+3;}))continue;
    const y=meshY(x,z),yw=Math.atan2(fx[i],fz[i]);
    if(sibInKitchen(x,z,-2)){rail.put(x,y,z,yw);if(i%6===0)post.put(x,y,z,yw);}
    else kerb.put(x,y-.05,z,yw,1,1,1,(i/step)%2?0xc8322a:0xf4f2ec);
  }
  kerb.done();rail.done();post.done();
};

/** a flat sign board with text */
function sibSign(text,bg,fg,w,h,pw,ph,px,border){
  return new THREE.Mesh(new THREE.PlaneGeometry(pw,ph),psMat({map:lerumSignTex(text,bg,fg,w,h,px,border),unlit:true,side:THREE.DoubleSide}));
}
/** the Sibylla sign: red lettering on white in a red frame, and the blue dot */
function sibLogoTex(w,h){
  return pixTex(w,h,g=>{
    g.fillStyle='#f6f4ee';g.fillRect(0,0,w,h);
    g.fillStyle='#d5202a';const b=Math.max(2,Math.round(h/12));g.fillRect(0,0,w,b);g.fillRect(0,h-b,w,b);g.fillRect(0,0,b,h);g.fillRect(w-b,0,b,h);
    g.font='italic 900 '+Math.round(h*.58)+'px "Titillium Web",sans-serif';g.textAlign='center';g.textBaseline='middle';
    g.fillStyle='#d5202a';g.fillText('Sibylla',w*.46,h*.54);
    g.fillStyle='#1f4fb4';g.beginPath();g.arc(w*.86,h*.36,h*.13,0,6.283);g.fill();
  });
}
/** the Sibylla sign as a mesh, both faces */
function sibLogo(pw,ph){
  return new THREE.Mesh(new THREE.PlaneGeometry(pw,ph),psMat({map:sibLogoTex(128,40),unlit:true,side:THREE.DoubleSide}));
}
/** a menu board for the ordering stations: burger, fries, a cone, prices */
const sibMenuTex=()=>pixTex(32,40,g=>{
  g.fillStyle='#1c1e24';g.fillRect(0,0,32,40);g.fillStyle='#d5202a';g.fillRect(0,0,32,6);
  g.fillStyle='#f6f4ee';g.font='5px "Press Start 2P",monospace';g.textAlign='center';g.textBaseline='middle';g.fillText('MENY',16,3.5);
  const R=(c,x,y,w,h)=>{g.fillStyle=c;g.fillRect(x,y,w,h);};
  R('#d8a050',3,10,10,3);R('#6a3a20',3,13,10,2);R('#5aa040',3,15,10,1);R('#d8a050',3,16,10,2);   /* the burger */
  R('#d5202a',4,23,8,6);R('#f2d040',5,20,1,3);R('#f2d040',7,19,1,4);R('#f2d040',9,20,1,3);        /* the fries */
  R('#e8c890',6,34,4,4);R('#f8f4ec',5,31,6,3);                                                     /* the cone */
  for(const y of [13,25,34])R('#f2c81c',18,y,10,2);
});
/** the takeaway box stack that shuts Personalvägen */
function sibBoxStack(R,j){
  const g=new THREE.Group();g.rotation.y=Math.atan2(R.FX[j],R.FZ[j]);
  const W=2*R.hw+2;
  const box=psMat({map:pixTex(16,16,c=>{c.fillStyle='#f6f4ee';c.fillRect(0,0,16,16);c.fillStyle='#d5202a';c.fillRect(0,0,16,4);c.fillRect(0,12,16,4);
    c.fillStyle='#1f4fb4';c.fillRect(11,6,3,3);})});
  const boxes=[];
  for(let r=0;r<4;r++)for(let c=0;c<6;c++){
    const m=new THREE.Mesh(flat(new THREE.BoxGeometry(W/6-.08,1.5,1.5)),box);
    m.position.set(-W/2+W/12+c*W/6+(r%2?.3:0),.75+r*1.5,0);m.rotation.y=(hash2(r,c)-.5)*.2;g.add(m);
    boxes.push({m,x:m.position.x,y:m.position.y,ry:m.rotation.y,vx:(c-2.5)*.9,vy:2+r*.5,spin:hash2(c,r)*6-3});}
  g.userData.boxes=boxes;
  const s=sibSign('ENDAST PERSONAL','#d5202a','#f6f4ee',96,14,W*.8,.9,7);s.position.set(0,6.9,-.8);s.rotation.y=Math.PI;g.add(s);g.userData.sign=s;   /* read from the way in */
  return g;
}
/** the stack tumbles over as it opens, and builds itself again as it shuts */
function sibBoxStackAnim(B,d){
  const L=B.mesh.userData.boxes;if(!L)return;
  for(const b of L){const t=d*1.1;
    b.m.position.set(b.x+b.vx*t*3,Math.max(.4,b.y+b.vy*t-6*t*t),-t*4);b.m.rotation.set(b.spin*t*.6,b.ry+b.spin*t,b.spin*t*.3);}
}

function scenerySibylla(){
  const RES=[];
  const res=(x,z,r)=>RES.push([x,z,r]);
  const free=(x,z,pad)=>{
    if(latAt(x,z)<HW+pad)return false;
    for(const r of RES)if(Math.hypot(x-r[0],z-r[1])<r[2])return false;
    return true;
  };
  const at=(i,o)=>{const q=mainPt(i,o);q.y=meshY(q.x,q.z);return q;};
  const yawAt=i=>{i=((i%N)+N)%N;return Math.atan2(fx[i],fz[i]);};
  const H=(a,b)=>hash2(a*1.37+3.1,b*0.71-2.3);
  const K=ALTS.find(r=>r.id==='kiosk'),P=ALTS.find(r=>r.id==='personal');
  const red=psMat({color:0xd5202a}),white=psMat({color:0xf6f4ee}),steel=psMat({color:0xc4cad0}),dark=psMat({color:0x2a2c32});
  const wood=psMat({color:0x8a5a34}),woodD=psMat({color:0x6a4226});
  SIB.anim=[];
  for(const S_ of stations){const q=mainPt(S_.at+6,S_.side*(HW+13));res(q.x,q.z,22);}

  /* ── the restaurant: a low timber building beside the start, glass front, the sign on the roof ── */
  {const i=SIB.shop,q=at(i,HW+30),g=new THREE.Group();g.position.set(q.x,q.y,q.z);g.rotation.y=yawAt(i)+Math.PI/2;world.add(g);res(q.x,q.z,26);
    const boards=psMat({map:pixTex(32,16,c=>{c.fillStyle='#9a6638';c.fillRect(0,0,32,16);
      for(let x=0;x<32;x+=4){c.fillStyle='#7a4c28';c.fillRect(x,0,1,16);c.fillStyle='#ac7444';c.fillRect(x+1,0,1,16);}
      c.fillStyle='rgba(40,20,10,.25)';for(let i=0;i<20;i++)c.fillRect((Math.random()*32)|0,(Math.random()*16)|0,1,2);})});
    boards.uniforms.uMap.value.wrapS=boards.uniforms.uMap.value.wrapT=THREE.RepeatWrapping;boards.uniforms.uMap.value.repeat.set(6,1);
    const glass=psMat({color:0x37506a}),warm=psMat({color:0xfff0c8,unlit:true});
    const body=new THREE.Mesh(flat(new THREE.BoxGeometry(34,6.4,18)),boards);body.position.set(0,3.2,0);g.add(body);
    hoorBox(g,35,.6,19,dark,0,6.7,0);                                                         /* the flat roof */
    hoorBox(g,22,3.6,.2,glass,-3,2.6,9.05);                                                   /* the glass front */
    for(let x=-13;x<=8;x+=3.4)hoorBox(g,.24,3.8,.3,woodD,x,2.6,9.1);
    hoorBox(g,3,3.4,.2,warm,11,1.8,9.06);hoorBox(g,3.4,.3,.3,red,11,3.65,9.1);                 /* the door, lit */
    hoorBox(g,36,.5,2.4,red,0,5.8,10.2);                                                      /* a red canopy over the front */
    for(const x of [-16,-6,4,14])hoorBox(g,.2,5.6,.2,steel,x,2.8,11.2);
    const s=sibLogo(15,4.7);s.position.set(0,9.6,.4);g.add(s);                                /* the sign on the roof */
    hoorBox(g,.4,2.4,.4,dark,-5,7.6,.2);hoorBox(g,.4,2.4,.4,dark,5,7.6,.2);
    const s2=sibLogo(7,2.2);s2.position.set(0,4.85,10.08);g.add(s2);                          /* and over the door */
    const s3=sibSign('NYGRILLAT','#1c1e24','#f2c81c',64,12,4.2,.8,7);s3.position.set(-12,4.6,10.08);g.add(s3);
    /* the terrace in front: tables under red umbrellas */
    const um=[];
    for(let n=0;n<5;n++){const x=-14+n*7,z=13.6;
      hoorBox(g,1.4,.08,1.4,white,x,1.05,z);hoorBox(g,.12,1.05,.12,steel,x,.52,z);
      for(const sd of [-1,1])hoorBox(g,1.2,.08,.45,steel,x,.5,z+sd*1.1);
      hoorBox(g,.08,2.6,.08,steel,x,2.3,z);um.push([x,3.6,z]);}
    hoorMerge(g);
    const top=new THREE.ConeGeometry(1.9,.8,8).translate(0,.4,0);
    for(const [x,y,z] of um){const m=new THREE.Mesh(flat(top),red);m.position.set(x,y,z);g.add(m);
      const r=new THREE.Mesh(flat(new THREE.CylinderGeometry(1.92,1.92,.18,8)),white);r.position.set(x,y-.05,z);g.add(r);}
  }
  /* the pylon sign on the corner, tall enough to see from the whole car park */
  {const i=SIB.pylon,q=at(i,HW+7),g=new THREE.Group();g.position.set(q.x,q.y,q.z);g.rotation.y=yawAt(i)+Math.PI/2;world.add(g);res(q.x,q.z,5);
    hoorBox(g,.8,13,.8,dark,0,6.5,0);hoorBox(g,1.6,.6,1.6,steel,0,.3,0);
    hoorBox(g,10,3.4,.5,red,0,14.4,-.3);
    hoorMerge(g);
    const s=sibLogo(9.6,3.2);s.position.set(0,14.4,0);g.add(s);
    const t=sibSign('DRIVE-THROUGH →','#d5202a','#f6f4ee',112,14,7.6,1,7);t.position.set(0,11.6,.3);g.add(t);}

  /* ── the car park: bays, parked cars, lamp posts ── */
  {const line=rosInst(new THREE.PlaneGeometry(.18,5).rotateX(-Math.PI/2),psMat({color:0xf2f0ea,unlit:true}),400);
    const car=rosInst(flat(new THREE.BoxGeometry(1.9,1.1,4.2)).translate(0,.75,0),psMat({}),60,true);
    const cab=rosInst(flat(new THREE.BoxGeometry(1.7,.7,2.2)).translate(0,1.6,-.2),psMat({}),60,true);
    const cols=[0xc8c8c4,0x2a3a5a,0x8a1f1f,0x3a3a3c,0xe8e4da,0x2f5a3a,0x5a6a7a];
    let n=0;
    for(let i=0;i<N;i++){if(!(i<60||i>650)||i%3)continue;
      for(const row of [0,1]){const o=-(HW+9+row*12);                                       /* bays on the south side of the straight */
        const q=at(i,o);if(!sibInPark(q.x,q.z)||!free(q.x,q.z,-HW+6))continue;
        line.put(q.x,q.y+.05,q.z,yawAt(i)+Math.PI/2);
        if(i%6===0&&H(i,row)>.45){const c=at(i+1.5,o-(row?-1:1)*1.4);car.put(c.x,c.y,c.z,yawAt(i)+Math.PI/2+(row?Math.PI:0),1,1,1,cols[n%cols.length]);
          cab.put(c.x,c.y,c.z,yawAt(i)+Math.PI/2+(row?Math.PI:0),1,1,1,0x2a3440);n++;}}}
    line.done();car.done();cab.done();
    const pole=rosInst(flat(new THREE.CylinderGeometry(.12,.16,8,4)).translate(0,4,0),dark,60),head=rosInst(flat(new THREE.BoxGeometry(.6,.3,1.4)),psMat({color:0xfff6dc,unlit:true}),60);
    for(let i=0;i<N;i+=14)for(const sd of [-1,1]){const q=at(i,sd*(HW+4));
      if(sibInKitchen(q.x,q.z,6)||nearAlt(q.x,q.z,3)||!free(q.x,q.z,-HW+3.5))continue;
      if(i>=SIB.chute[0]&&i<=SIB.chute[1])continue;
      if(stations.some(S=>{let d=i-S.at;if(d<-N/2)d+=N;else if(d>N/2)d-=N;return S.side===sd&&d>-6&&d<S.len+6;}))continue;
      pole.put(q.x,q.y,q.z,0);head.put(q.x-sd*q.rx*.7,q.y+8,q.z-sd*q.rz*.7,q.yaw);}
    pole.done();head.done();}

  /* ── the drive-through: a canopy at the way in, an ordering station on the inside of every
     bend, the pick-up booth at the end ── */
  {const i0=SIB.drive[0],g=new THREE.Group();g.position.set(sx[i0],sy[i0],sz[i0]);g.rotation.y=yawAt(i0);world.add(g);
    for(const sd of [-1,1])hoorBox(g,.8,7,.8,red,sd*(HW+2.4),3.5,0);
    hoorBox(g,2*HW+6,1.6,1.4,red,0,7.6,0);
    hoorMerge(g);
    for(const f of [-1,1]){const s=sibSign('DRIVE-THROUGH','#d5202a','#f6f4ee',112,14,2*HW+4,1.3,8);s.position.set(0,7.6,f*.72);if(f<0)s.rotation.y=Math.PI;g.add(s);}
    const menu=psMat({map:sibMenuTex(),unlit:true,side:THREE.DoubleSide});
    SIB.drive.slice(1).forEach((i,n)=>{
      const sd=-(Math.sign(scurv[i])||1),p=at(i,sd*(HW+3.2)),h=new THREE.Group();     /* the inside of the bend */
      h.position.set(p.x,p.y,p.z);h.rotation.y=yawAt(i)+(sd>0?Math.PI/2:-Math.PI/2);world.add(h);res(p.x,p.z,4);
      hoorBox(h,.3,2.2,.3,dark,-1.4,1.1,0);hoorBox(h,.7,.9,.5,steel,-1.4,1.9,.1);             /* the speaker post */
      hoorBox(h,.36,.36,.08,dark,-1.4,2.0,.38);
      hoorBox(h,.2,3.4,.2,dark,.6,1.7,-.1);hoorBox(h,.2,3.4,.2,dark,2.4,1.7,-.1);
      hoorMerge(h);
      const m=new THREE.Mesh(new THREE.PlaneGeometry(2.2,2.8),menu);m.position.set(1.5,2.6,0);m.rotation.y=sd>0?1.1:-1.1;h.add(m);   /* turned to the drivers coming */
      const nb=sibSign(String(n+1),'#f2c81c','#1c1e24',12,12,.7,.7,8);nb.position.set(-1.4,2.75,.3);h.add(nb);});
    /* the pick-up booth with its window, on the outside of the last bend */
    {const i=SIB.pickup,sd=Math.sign(scurv[i])||1,p=at(i,sd*(HW+6)),b=new THREE.Group();
      b.position.set(p.x,p.y,p.z);b.rotation.y=yawAt(i)+(sd>0?Math.PI/2:-Math.PI/2);world.add(b);res(p.x,p.z,6);
      hoorBox(b,6,3.6,4,psMat({color:0x9a6638}),0,1.8,-1);hoorBox(b,6.4,.4,4.6,red,0,3.8,-1);
      hoorBox(b,2.4,1.2,.1,psMat({color:0xfff0c8,unlit:true}),0,1.9,1.02);hoorBox(b,2.6,.14,.6,steel,0,1.3,1.25);
      hoorMerge(b);
      const s=sibSign('HÄMTA HÄR','#d5202a','#f6f4ee',72,12,3.6,.6,7);s.position.set(0,3.1,1.06);b.add(s);}
  }

  /* ── Bakom kiosken: the soft-serve kiosk, crates and bins along the passage, a delivery van ── */
  if(K){
    const crate=rosInst(flat(new THREE.BoxGeometry(1,.8,1)).translate(0,.4,0),psMat({}),200,true);
    const bin=rosInst(flat(new THREE.BoxGeometry(1.3,1.4,1.1)).translate(0,.7,0),psMat({}),40,true);
    for(let j=COMMIT+3;j<K.n-MERGE-2;j+=2)for(const sd of [-1,1]){const q=lanePt(K,j/(K.n-1),sd*(K.hw+.9+H(j,sd)*.6));
      if(nearAltMain(q.x,q.z)<HW+1.5)continue;const y=meshY(q.x,q.z);
      if(j%6===0&&sd>0)bin.put(q.x,y,q.z,q.yaw,1,1,1,[0x2f6a3a,0x3a3c44][j%2]);
      else{crate.put(q.x,y,q.z,q.yaw+(H(j,sd)-.5)*.3,1,1,1,[0xd5202a,0x8a6a40,0x1f4fb4][(j+sd+3)%3]);
        if(H(sd,j)>.5)crate.put(q.x,y+.8,q.z,q.yaw+(H(j*2,sd)-.5)*.4,.9,1,.9,[0x8a6a40,0xd5202a][j%2]);}
      res(q.x,q.z,2);}
    crate.done();bin.done();
    {const q=lanePt(K,.5,-(K.hw+3.4)),g=new THREE.Group();g.position.set(q.x,meshY(q.x,q.z),q.z);g.rotation.y=q.yaw-Math.PI/2;world.add(g);res(q.x,q.z,5);
      hoorBox(g,4,2.8,3,white,0,1.4,-.6);hoorBox(g,4.6,.3,3.6,red,0,2.95,-.4);
      hoorBox(g,2.4,1.1,.1,psMat({color:0xfff0c8,unlit:true}),0,1.7,.92);
      const c=hoorBox(g,.01,.01,.01,white,0,0,0);c.visible=false;
      const cone=new THREE.Mesh(flat(new THREE.ConeGeometry(.7,2,8)).rotateX(Math.PI),psMat({color:0xd8b070}));cone.position.set(0,4.2,-.6);g.add(cone);   /* a giant cone on the roof */
      for(let k=0;k<3;k++){const s=new THREE.Mesh(flat(new THREE.CylinderGeometry(.75-k*.22,.8-k*.22,.5,8)),psMat({color:0xf8f4ec}));s.position.set(0,5.45+k*.45,-.6);g.add(s);}
      hoorMerge(g);
      const s=sibSign('MJUKGLASS','#f6f4ee','#d5202a',72,12,3.4,.6,7);s.position.set(0,2.4,.95);g.add(s);}
    {const q=lanePt(K,.78,K.hw+4.2),g=new THREE.Group();g.position.set(q.x,meshY(q.x,q.z),q.z);g.rotation.y=q.yaw;world.add(g);res(q.x,q.z,5);   /* the delivery van */
      hoorBox(g,2.2,2.6,5.2,white,0,1.6,0);hoorBox(g,2.2,1.6,1.6,white,0,1.1,3.2);hoorBox(g,2.0,.7,.1,psMat({color:0x37506a}),0,1.6,4.02);
      hoorBox(g,2.24,.5,5.24,red,0,2.2,0);
      for(const [x,z] of [[-1,-1.6],[1,-1.6],[-1,2.8],[1,2.8]]){const w=new THREE.Mesh(flat(new THREE.CylinderGeometry(.45,.45,.3,8)).rotateZ(Math.PI/2),dark);w.position.set(x,.45,z);g.add(w);}
      hoorMerge(g);}
  }

  /* ── the outdoor seating inside the sweep: tables, umbrellas, a fence, and people eating ── */
  {const T=SIB.terrace;res(T.x,T.z,33);
    const tab=rosInst(flat(new THREE.BoxGeometry(1.6,.08,1.6)).translate(0,1.05,0),white,80);
    const leg=rosInst(flat(new THREE.BoxGeometry(.12,1.05,.12)).translate(0,.52,0),steel,80);
    const bench=rosInst(flat(new THREE.BoxGeometry(1.6,.1,.5)).translate(0,.5,0),wood,160);
    const pole=rosInst(flat(new THREE.CylinderGeometry(.05,.05,2.8,4)).translate(0,1.4,0),steel,80);
    const top=rosInst(flat(new THREE.ConeGeometry(1.9,.8,8)).translate(0,3.0,0),psMat({}),80,true);
    const body=rosInst(flat(new THREE.BoxGeometry(.5,.66,.34)).translate(0,.9,0),psMat({}),200,true);
    const head=rosInst(flat(new THREE.BoxGeometry(.32,.32,.32)).translate(0,1.42,0),psMat({color:0xe8bc98}),200);
    const tray=rosInst(flat(new THREE.BoxGeometry(.7,.05,.5)).translate(0,1.12,0),psMat({color:0xd5202a}),80);
    const shirts=[0xd5202a,0x2f78d8,0xf4f2ec,0xe8c21c,0x3a3c44,0x2aa8a0,0x8a4fd8];
    for(let r=-3;r<=3;r++)for(let c=-3;c<=3;c++){
      const x=T.x+c*7.6+(r%2?3.8:0),z=T.z+r*7.6;if(Math.hypot(x-T.x,z-T.z)>27)continue;const yy=meshY(x,z),yw=(H(r,c)-.5)*.4;
      tab.put(x,yy,z,yw);leg.put(x,yy,z,yw);pole.put(x,yy+1.1,z,0);top.put(x,yy+1.1,z,H(c,r)*6,1,1,1,H(r*3,c)>.15?0xd5202a:0xf6f4ee);
      tray.put(x,yy,z,yw);
      for(const sd of [-1,1]){const bx=x+Math.sin(yw+Math.PI/2)*sd*1.1,bz=z+Math.cos(yw+Math.PI/2)*sd*1.1;bench.put(bx,yy,bz,yw);
        if(H(r+sd,c*2)>.4){body.put(bx,yy,bz,yw+(sd>0?Math.PI:0),1,1,1,shirts[Math.floor(H(c+sd,r*5)*shirts.length)]);head.put(bx,yy,bz,yw);}}}
    tab.done();leg.done();bench.done();pole.done();top.done();body.done();head.done();tray.done();
    /* a low white fence round the edge with flower boxes */
    const fence=rosInst(flat(new THREE.BoxGeometry(.12,.9,2.4)).translate(0,.45,0),white,90),flower=rosInst(flat(new THREE.BoxGeometry(.6,.4,1.6)).translate(0,1,0),psMat({}),40,true);
    for(let n=0;n<84;n++){const a=n/84*6.283,x=T.x+Math.cos(a)*31.5,z=T.z+Math.sin(a)*31.5;if(latAt(x,z)<HW+2.5)continue;
      fence.put(x,meshY(x,z),z,-a);if(n%5===0)flower.put(x,meshY(x,z),z,-a,1,1,1,n%10?0xd5202a:0xe8c21c);}
    fence.done();flower.done();
    const i=SIB.seat[0],q=at(i,-(HW+4)),sg=new THREE.Group();sg.position.set(q.x,q.y,q.z);sg.rotation.y=yawAt(i)+Math.PI;world.add(sg);
    hoorBox(sg,.16,2.4,.16,dark,-2.7,1.2,0);hoorBox(sg,.16,2.4,.16,dark,2.7,1.2,0);hoorMerge(sg);
    const s=sibSign('UTESERVERING','#f6f4ee','#d5202a',96,14,6,.9,7);s.position.set(0,2.6,0);sg.add(s);
  }

  /* ── the giant kitchen: tiled walls round it with doorways where the roads go through, and
     lamps hanging from nowhere in particular ── */
  {const tile=pixTex(16,16,c=>{c.fillStyle='#f2f0ea';c.fillRect(0,0,16,16);c.fillStyle='#c8c6c0';c.fillRect(0,0,16,1);c.fillRect(0,0,1,16);
      c.fillStyle='#d5202a';c.fillRect(0,12,16,2);});
    tile.wrapS=tile.wrapT=THREE.RepeatWrapping;
    const wm=psMat({map:tile});
    const wall=(x0,z0,x1,z1)=>{
      const L=Math.hypot(x1-x0,z1-z0),n=Math.ceil(L/6);
      for(let k=0;k<n;k++){const f0=k/n,f1=(k+1)/n,ax=lerp(x0,x1,f0),az=lerp(z0,z1,f0),bx=lerp(x0,x1,f1),bz=lerp(z0,z1,f1),mx=(ax+bx)/2,mz=(az+bz)/2;
        if(latAt(mx,mz)<HW+5)continue;                                                               /* a doorway */
        const len=Math.hypot(bx-ax,bz-az),y=Math.min(meshY(ax,az),meshY(bx,bz))-1,h=SIB_K.h+16-y;
        const geo=new THREE.BoxGeometry(len+.05,h,2);const uv=geo.attributes.uv;for(let v=0;v<uv.count;v++)uv.setXY(v,uv.getX(v)*len/4,uv.getY(v)*h/4);
        const m=new THREE.Mesh(flat(geo),wm);m.position.set(mx,y+h/2,mz);m.rotation.y=Math.atan2(bx-ax,bz-az)+Math.PI/2;world.add(m);}
    };
    /* the floor: big red-and-white tiles following the ground, under the roads */
    {const ft=pixTex(16,16,c=>{for(let x=0;x<2;x++)for(let y=0;y<2;y++){c.fillStyle=(x+y)%2?'#c8382e':'#efebe2';c.fillRect(x*8,y*8,8,8);}
        c.fillStyle='rgba(60,50,40,.35)';for(const v of [0,8]){c.fillRect(v,0,1,16);c.fillRect(0,v,16,1);}});
      ft.wrapS=ft.wrapT=THREE.RepeatWrapping;
      const st=4,nx=Math.ceil((SIB_K.x1-SIB_K.x0)/st),nz=Math.ceil((SIB_K.z1-SIB_K.z0)/st),pos=[],uv=[],idx=[];
      for(let a=0;a<=nz;a++)for(let b=0;b<=nx;b++){const x=SIB_K.x0+b*st,z=SIB_K.z0+a*st;pos.push(x,meshY(x,z)+(latAt(x,z)<HW+6?-1.2:.04),z);   /* tucked under the road, so a coarse tile never pokes through */uv.push(x/16,z/16);}
      for(let a=0;a<nz;a++)for(let b=0;b<nx;b++){const p0=a*(nx+1)+b,p1=p0+1,p2=p0+nx+1,p3=p2+1;idx.push(p0,p2,p1,p1,p2,p3);}
      const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));
      geo.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));geo.setIndex(idx);geo.computeVertexNormals();
      world.add(new THREE.Mesh(geo,psMat({map:ft})));}
    const K_=SIB_K;wall(K_.x0,K_.z0,K_.x1,K_.z0);wall(K_.x1,K_.z0,K_.x1,K_.z1);wall(K_.x1,K_.z1,K_.x0,K_.z1);wall(K_.x0,K_.z1,K_.x0,K_.z0);
    /* the doorways: a frame and a sign over each road where it crosses the south wall */
    for(const [i,txt] of [[SIB.kitchenIn,'KÖKET'],[SIB.chute[1]-30,'UT']]){
      let k=-1;for(let d=0;d<80&&k<0;d++){const a=(i+d)%N,b=(i-d+N)%N;if(Math.abs(sz[a]-K_.z0)<2.5)k=a;else if(Math.abs(sz[b]-K_.z0)<2.5)k=b;}
      if(k<0)continue;
      const g=new THREE.Group();g.position.set(sx[k],sy[k],sz[k]);g.rotation.y=yawAt(k);world.add(g);
      for(const sd of [-1,1])hoorBox(g,1.4,12,2.4,steel,sd*(HW+4.3),6,0);
      hoorBox(g,2*HW+10,2.4,2.4,steel,0,13,0);
      hoorMerge(g);
      for(const f of [-1,1]){const s=sibSign(txt,'#1c1e24','#f2c81c',96,14,2*HW+3,1.6,8);s.position.set(0,13,f*1.25);if(f<0)s.rotation.y=Math.PI;g.add(s);}}
    const cord=rosInst(flat(new THREE.CylinderGeometry(.05,.05,12,3)).translate(0,6,0),dark,60),shade=rosInst(flat(new THREE.ConeGeometry(1.4,1,8)),red,60),bulb=rosInst(flat(new THREE.SphereGeometry(.5,6,4)),psMat({color:0xfff6dc,unlit:true}),60);
    for(let x=K_.x0+30;x<K_.x1-10;x+=44)for(let z=K_.z0+30;z<K_.z1-10;z+=44){const y=SIB_K.h+10;cord.put(x,y,z,0);shade.put(x,y-.3,z,0);bulb.put(x,y-.8,z,0);}
    cord.done();shade.done();bulb.done();
  }

  /* ── Pommesbacken: a carton of fries as tall as a house beside the climb, fries lying about ── */
  {const i=SIB.fries,q=at(i,-(HW+16)),g=new THREE.Group();g.position.set(q.x,q.y-1,q.z);g.rotation.y=yawAt(i);g.scale.setScalar(2.2);world.add(g);res(q.x,q.z,16);
    const carton=new THREE.Mesh(flat(new THREE.CylinderGeometry(4.2,3.0,7,4,1)).rotateY(Math.PI/4),red);carton.scale.set(1,1,.62);carton.position.y=3.5;g.add(carton);
    const band=new THREE.Mesh(flat(new THREE.CylinderGeometry(3.66,3.5,.8,4,1)).rotateY(Math.PI/4),white);band.scale.set(1,1,.64);band.position.y=2.6;g.add(band);
    const fry=psMat({color:0xf2c43a}),fryD=psMat({color:0xd8a028});
    for(let n=0;n<26;n++){const x=(H(n,1)-.5)*5,z=(H(n,2)-.5)*2.4,h=2.6+H(n,3)*3.2;
      const f=hoorBox(g,.42,h,.42,n%3?fry:fryD,x,7+h/2-1.2,z);f.rotation.z=(H(n,4)-.5)*.4;f.rotation.x=(H(n,5)-.5)*.3;}
    hoorMerge(g);
    const fl=rosInst(flat(new THREE.BoxGeometry(.9,.9,7)).translate(0,.45,0),psMat({color:0xf2c43a}),40);
    for(let n=0;n<28;n++){const j=SIB.fries-30+n*3,sd=n%2?1:-1,p=at(j,sd*(HW+5+H(n,9)*16));if(!free(p.x,p.z,-HW+3))continue;fl.put(p.x,p.y,p.z,H(n,7)*6);}
    fl.done();
    const j=SIB.fries-26,p=at(j,HW+3.4),sg=new THREE.Group();
    sg.position.set(p.x,p.y,p.z);sg.rotation.y=yawAt(j)+Math.PI;world.add(sg);hoorBox(sg,.25,3,.25,dark,-3,1.5,0);hoorBox(sg,.25,3,.25,dark,3,1.5,0);hoorMerge(sg);
    const s=sibSign('POMMESBACKEN','#f2c43a','#d5202a',96,14,7,1,8);s.position.set(0,3.4,0);sg.add(s);}

  /* ── the ramp and the sauce conveyor it jumps: belt across the road, bottles riding it ── */
  {const J=JUMPS[0];
    if(J){const plate=new THREE.InstancedMesh(flat(new THREE.BoxGeometry(2*HW-1,.14,SEG*.9)),psMat({map:pixTex(32,8,c=>{
        c.fillStyle='#8a9098';c.fillRect(0,0,32,8);for(let x=0;x<32;x+=4){c.fillStyle=(x/4)%2?'#f2c43a':'#d5202a';c.fillRect(x,0,4,2);}})}),J.up+1),o=new THREE.Object3D();
      o.rotation.order='YXZ';
      for(let k=-J.up;k<=0;k++){const ii=(J.at+k+N)%N;o.position.set(sx[ii],sy[ii]+.08,sz[ii]);
        o.rotation.set(-Math.atan2(sy[(ii+1)%N]-sy[(ii-1+N)%N],2*SEG),yawAt(ii),0);o.updateMatrix();plate.setMatrixAt(k+J.up,o.matrix);}
      plate.frustumCulled=false;world.add(plate);
      const c=J.at+3,q=mainPt(c,0),cy=sy[J.at]-.9;                              /* under the flight path, over the landing dip */
      const belt=new THREE.Group();belt.position.set(q.x,cy,q.z);belt.rotation.y=yawAt(c)+Math.PI/2;world.add(belt);
      const bl=pixTex(16,8,g2=>{g2.fillStyle='#2a2c32';g2.fillRect(0,0,16,8);g2.fillStyle='#4a4e56';for(let x=0;x<16;x+=4)g2.fillRect(x,0,1,8);});
      bl.wrapS=THREE.RepeatWrapping;
      const W=2*HW+40,top=new THREE.Mesh(flat(new THREE.BoxGeometry(W,.4,3.2)),psMat({map:bl}));belt.add(top);
      const fr=new THREE.Group();belt.add(fr);
      for(let x=-W/2+2;x<W/2;x+=6){if(Math.abs(x)<HW+1.5)continue;for(const sd of [-1,1])hoorBox(fr,.3,6,.3,steel,x,-3,sd*1.4);}   /* legs off the road only */
      for(const sd of [-1,1])hoorBox(fr,W,.5,.2,steel,0,.35,sd*1.7);
      hoorMerge(fr);
      SIB.belt={tex:bl,W,bottles:[]};
      const kinds=[[0xd5202a,0xf6f4ee],[0xf2c81c,0x2a2c32],[0xf0d8b0,0xd5202a]];
      for(let n=0;n<9;n++){const b=new THREE.Group(),[cc,cap]=kinds[n%3];belt.add(b);
        const bb=new THREE.Mesh(flat(new THREE.CylinderGeometry(.55,.6,2.2,8)),psMat({color:cc}));bb.position.y=1.3;b.add(bb);
        const nk=new THREE.Mesh(flat(new THREE.CylinderGeometry(.18,.4,.6,8)),psMat({color:cc}));nk.position.y=2.7;b.add(nk);
        const cp=new THREE.Mesh(flat(new THREE.CylinderGeometry(.14,.14,.4,6)),psMat({color:cap}));cp.position.y=3.15;b.add(cp);
        SIB.belt.bottles.push({g:b,u:n/9});}
      const s=sibSign('SÅSBANDET','#d5202a','#f6f4ee',72,14,4,.8,7);s.position.set(W/2-6,3.4,1.7);s.rotation.y=Math.PI/2;belt.add(s);
      for(const sd of [-1,1]){const p=at(J.at-J.up-12,sd*(HW+2.6)),g=new THREE.Group();g.position.set(p.x,p.y,p.z);g.rotation.y=yawAt(J.at-J.up-12)+Math.PI;world.add(g);
        hoorBox(g,.12,2.4,.12,steel,0,1.2,0);hoorMerge(g);const t=sibSign('HOPP!','#f2c43a','#1c1e24',40,14,1.6,.55,8);t.position.set(0,2.5,0);g.add(t);}
    }}

  /* ── Stekbordskurvan: the hairpin on the griddle under an extractor hood, giant patties sizzling
     on the infield, a spatula and the bottles standing guard ── */
  {const a=404,b=480;let cx=0,cz=0;for(let i=a;i<b;i++){cx+=sx[i];cz+=sz[i];}cx/=b-a;cz/=b-a;
    SIB.hood={x:cx,z:cz};
    const g=new THREE.Group();g.position.set(cx,16,cz);world.add(g);
    hoorBox(g,150,6,110,psMat({color:0xb8bec6}),0,46,-6);                                     /* the hood, high above */
    hoorBox(g,120,2,80,dark,0,42.6,-6);
    for(let x=-50;x<=50;x+=25)for(let z=-30;z<=20;z+=25)hoorBox(g,6,.4,6,psMat({color:0xfff6dc,unlit:true}),x,41.4,z-6);
    hoorMerge(g);
    /* patties on the griddle in the middle of the hairpin, with puffs of smoke */
    const pat=rosInst(flat(new THREE.CylinderGeometry(5,5,1.6,10)).translate(0,.8,0),psMat({color:0x5a3220}),12);
    const cheese=rosInst(flat(new THREE.BoxGeometry(8.4,.3,8.4)).translate(0,1.7,0),psMat({color:0xf2c43a}),12);
    SIB.smoke=[];
    for(let n=0;n<9;n++){const ang=n/9*6.283,r=8+H(n,3)*12,x=cx+Math.cos(ang)*r,z=cz-14+Math.sin(ang)*r*.6;
      if(!free(x,z,6)||nearAlt(x,z,6))continue;pat.put(x,meshY(x,z),z,H(n,2)*3);if(n%2)cheese.put(x,meshY(x,z),z,H(n,4)*3);SIB.smoke.push([x,meshY(x,z)+2,z]);res(x,z,6);}
    pat.done();cheese.done();
    const sg=new THREE.Group(),q=at(442,-(HW+14));sg.position.set(q.x,q.y,q.z);sg.rotation.y=yawAt(442);world.add(sg);res(q.x,q.z,10);   /* the spatula, leaning */
    const sp=hoorBox(sg,9,.4,7,steel,0,10,0);sp.rotation.x=-1.2;const hd=hoorBox(sg,1.2,1.2,14,dark,0,3.4,3.4);hd.rotation.x=-1.2;hoorMerge(sg);
    for(const [i,cc,cap,lbl,ink] of [[418,0xd5202a,0xf6f4ee,'KETCHUP','#d5202a'],[466,0xf2c81c,0x2a2c32,'SENAP','#a87c08']]){
      const p=at(i,-(HW+12)),bg=new THREE.Group();bg.position.set(p.x,p.y,p.z);bg.scale.setScalar(3.4);world.add(bg);res(p.x,p.z,9);
      const bb=new THREE.Mesh(flat(new THREE.CylinderGeometry(1.4,1.5,5,10)),psMat({color:cc}));bb.position.y=2.5;bg.add(bb);
      const nk=new THREE.Mesh(flat(new THREE.CylinderGeometry(.4,1.1,1.4,10)),psMat({color:cc}));nk.position.y=5.7;bg.add(nk);
      const cp=new THREE.Mesh(flat(new THREE.CylinderGeometry(.34,.34,.8,8)),psMat({color:cap}));cp.position.y=6.8;bg.add(cp);
      hoorMerge(bg);
      const l=sibSign(lbl,'#f6f4ee',ink,64,14,2.6,.7,7);const ry=Math.atan2(sx[i]-p.x,sz[i]-p.z);l.position.set(Math.sin(ry)*1.52,2.6,Math.cos(ry)*1.52);l.rotation.y=ry;bg.add(l);}
    {const j=408,p=at(j,-(HW+3)),sgn=new THREE.Group();
      sgn.position.set(p.x,p.y,p.z);sgn.rotation.y=yawAt(j)+Math.PI;world.add(sgn);hoorBox(sgn,.25,3,.25,steel,-3.2,1.5,0);hoorBox(sgn,.25,3,.25,steel,3.2,1.5,0);hoorMerge(sgn);
      const s=sibSign('STEKBORDSKURVAN','#1c1e24','#f2c43a',112,14,7.4,1,8);s.position.set(0,3.4,0);sgn.add(s);}
  }

  /* ── Personalvägen: steel shelving both sides, stacked with takeaway boxes and bags ── */
  if(P){
    const shelf=rosInst(flat(new THREE.BoxGeometry(.6,.12,2.8)),steel,400),up=rosInst(flat(new THREE.BoxGeometry(.12,4.4,.12)).translate(0,2.2,0),steel,200);
    const box=rosInst(flat(new THREE.BoxGeometry(.5,.5,.5)).translate(0,.25,0),psMat({}),900,true);
    for(let j=COMMIT+1;j<P.n-MERGE;j++)for(const sd of [-1,1]){const q=lanePt(P,j/(P.n-1),sd*(P.hw+1.1));
      if(nearAltMain(q.x,q.z)<HW+1.2)continue;const y=meshY(q.x,q.z);
      if(j%2===0)up.put(q.x,y,q.z,q.yaw);
      for(const h of [.3,1.5,2.7,3.9]){shelf.put(q.x,y+h,q.z,q.yaw);
        if(H(j*3+h,sd)>.3)box.put(q.x,y+h+.06,q.z,q.yaw,1,1+H(j,h)*.6,2.6,[0xd5202a,0xf6f4ee,0xd5202a,0x8a6a40][Math.floor(H(h,j*sd)*4)]);}
      res(q.x,q.z,2);}
    shelf.done();up.done();box.done();
  }

  /* ── Brickreturen: the chute's steel walls, a slide of trays running down beside it ── */
  {const [c0,c1]=SIB.chute;
    const wl=rosInst(flat(new THREE.BoxGeometry(.5,1.6,SEG*2+.1)).translate(0,.8,0),psMat({color:0xb8bec6}),N),lip=rosInst(flat(new THREE.BoxGeometry(.6,.24,SEG*2+.1)).translate(0,1.72,0),red,N);
    for(let i=c0;i<=c1;i+=2)for(const sd of [-1,1]){
      if(stations.some(S=>{let d=i-S.at;if(d<-N/2)d+=N;else if(d>N/2)d-=N;return S.side===sd&&d>-3&&d<S.len+3;}))continue;
      const q=mainPt(i,sd*(HW+.9));if(nearAlt(q.x,q.z,2.6))continue;
      const pitch=-Math.atan2(sy[(i+1)%N]-sy[(i-1+N)%N],2*SEG);
      wl.put(q.x,q.y-.1,q.z,q.yaw,1,1,1,null,pitch);lip.put(q.x,q.y-.1,q.z,q.yaw,1,1,1,null,pitch);}
    wl.done();lip.done();
    /* the trays: a parallel slide on the outside, trays riding down it in a loop */
    const [t0,t1]=SIB.trays;SIB.trayL=[];
    SIB.trayM=rosInst(flat(new THREE.BoxGeometry(2.6,.25,3.6)),psMat({}),20,true);
    for(let n=0;n<14;n++){SIB.trayL.push({u:n/14,c:[0xd5202a,0x8a6a40,0xd5202a,0xf2c43a][n%4]});SIB.trayM.put(0,-50,0,0,1,1,1,SIB.trayL[n].c);}
    SIB.trayM.done();
    const rail=rosInst(flat(new THREE.BoxGeometry(.3,.6,SEG*2+.1)).translate(0,.3,0),steel,N);
    for(let i=t0;i<=t1;i+=2)for(const o of [HW+4.2,HW+8]){const q=mainPt(i,-o),pitch=-Math.atan2(sy[(i+1)%N]-sy[(i-1+N)%N],2*SEG);
      rail.put(q.x,sy[i]-1.2,q.z,q.yaw,1,1,1,null,pitch);}
    rail.done();
    for(let i=t0;i<=t1;i+=6){const q=mainPt(i,-(HW+6.1));res(q.x,q.z,4);}
    const p=at(c0+4,HW+3),sgn=new THREE.Group();
    sgn.position.set(p.x,p.y,p.z);sgn.rotation.y=yawAt(c0+4)+Math.PI;world.add(sgn);hoorBox(sgn,.25,3,.25,steel,-2.8,1.5,0);hoorBox(sgn,.25,3,.25,steel,2.8,1.5,0);hoorMerge(sgn);
    const s=sibSign('BRICKRETUREN','#d5202a','#f6f4ee',96,14,6.4,1,8);s.position.set(0,3.4,0);sgn.add(s);
  }

  /* ── the start: a red gantry with the sign on it, and the event banner before the line ── */
  {const g=new THREE.Group();g.position.set(sx[0],sy[0],sz[0]);g.rotation.y=yawAt(0);world.add(g);
    for(const sd of [-1,1])hoorBox(g,1.2,9.1,1.2,red,sd*(HW+2.6),4.5,0);
    hoorBox(g,(HW+3.1)*2+.2,2.1,1.25,red,0,9.3,0);
    hoorMerge(g);
    for(const sd of [-1,1]){const s=sibLogo(8,2.5);s.position.set(0,9.3,sd*.66);if(sd<0)s.rotation.y=Math.PI;g.add(s);}}
  {const i=N-24,g=new THREE.Group();g.position.set(sx[i],sy[i],sz[i]);g.rotation.y=yawAt(i)+Math.PI;world.add(g);
    for(const sd of [-1,1])hoorBox(g,.5,8,.5,dark,sd*(HW+2.4),4,0);
    hoorMerge(g);
    const b=sibSign('EXTRA ALLT GRAND PRIX','#d5202a','#f6f4ee',192,24,2*HW+4,2.4,9);b.position.set(0,7,0);g.add(b);}

  /* ── outside: trees, hedges round the car park, a suburb beyond ── */
  {const TN=170,trT=rosInst(flat(new THREE.CylinderGeometry(.18,.26,3,5)).translate(0,1.5,0),psMat({color:0x5a4030}),TN);
    const trC=rosInst(flat(new THREE.IcosahedronGeometry(2.6,0)).translate(0,4.4,0),psMat({}),TN,true);
    for(let n=0,g2=0;n<TN&&g2<6000;g2++){const x=rand(-420,420),z=rand(-380,440);
      if(sibInKitchen(x,z,16)||sibInPark(x,z)||!free(x,z,7)||nearAlt(x,z,6))continue;const y=meshY(x,z);
      trT.put(x,y,z,0);trC.put(x,y,z,rand(0,3),rand(.8,1.2),rand(.9,1.2),rand(.8,1.2),[0x3f6e34,0x4a7a3a,0x36602e][n%3]);res(x,z,3);n++;}
    trT.done();trC.done();
    const hedge=rosInst(flat(new THREE.BoxGeometry(2.2,1.3,1)).translate(0,.65,0),psMat({color:0x3e6a32}),300);
    for(let x=-250;x<140;x+=2.2)for(const z of [-80,62]){if(latAt(x,z)<HW+3||!free(x,z,-HW+2))continue;hedge.put(x,meshY(x,z),z,Math.PI/2);}
    hedge.done();
    const tex=['#c8b48a','#a8a49c','#b89a6a','#d8d0c0'].map(c=>borasFacadeTex(c,false)),lists=tex.map(()=>[]);
    const rf=rosInst(flat(new THREE.BoxGeometry(1,.5,1)).translate(0,.25,0),psMat({color:0x4a4c54}),200);
    for(let gx=-440;gx<=440;gx+=34)for(let gz=-420;gz<=480;gz+=32){
      const x=gx+H(gx,gz)*8,z=gz+H(gz,gx)*8;if(Math.abs(x)<300&&z>-140&&z<500)continue;
      const L=Math.round((12+H(gz,gx*2)*10)/4)*4,D=10+Math.round(H(gx*2,gz)*6),Ht=Math.round((7+H(gx,gz*3)*10)/3.4)*3.4,yw=H(gx*3,gz)>.5?0:Math.PI/2;
      if(!free(x,z,12)||nearAlt(x,z,8)||sibInKitchen(x,z,20))continue;
      const k=Math.floor(H(gz*5,gx)*tex.length),y=meshY(x,z)-.2;lists[k].push([x,y,z,yw,L,D,Ht]);rf.put(x,y+Ht,z,yw,L+.4,1,D+.4);res(x,z,Math.max(L,D)/2+2);}
    lists.forEach((l,k)=>{if(l.length)world.add(new THREE.Mesh(borasMergeBoxes(l),psMat({map:tex[k]})));});
    rf.done();}
}

/* ───── Sibylla hazards: the dressing patches in Stekbordskurvan; the speaker, the belt, the trays ───── */
/** the order bell: two bright dings */
function sibBell(vol){
  if(!actx)return;
  const v=vol||1;
  audioTone(1568,1560,.5,.06*v,'sine');audioTone(3136,3130,.3,.02*v,'sine');
  audioTone(1318,1312,.6,.06*v,'sine',.16);audioTone(2636,2630,.3,.02*v,'sine',.16);
}
/** a short sizzle: filtered noise */
function sibSizzle(vol){
  if(!actx||muted)return;
  const t=actx.currentTime,n=actx.sampleRate*.4|0,buf=actx.createBuffer(1,n,actx.sampleRate),d=buf.getChannelData(0);
  for(let i=0;i<n;i++)d[i]=(Math.random()*2-1)*(Math.random()<.3?1:.3)*(1-i/n);
  const s=actx.createBufferSource(),f=actx.createBiquadFilter(),g=actx.createGain();
  s.buffer=buf;f.type='highpass';f.frequency.value=3200;g.gain.value=.12*(vol||1);
  s.connect(f);f.connect(g);g.connect(audioOutput());s.start(t);
}
const SIB_ORD=['Etta','Tvåa','Trea','Fyra','Femma','Sexa','Sjua','Åtta'];
/** what the drive-through speaker says as you reach the first station */
function sibDriveLine(k){
  const c=CARS[carSel];
  if(c&&(c.id==='lant'||c.id==='aker'))return 'Traktorn får inte stå i drive-through.';
  const p=SIB_ORD[k.place-1]||(k.place+':a');
  return p+'? Vill du plussa på?';
}
function hazardsSibylla(H){
  vastPA();SIB.sayLap=-1;SIB.sayDrive=-1;SIB.tractor=false;
  const inPool=(k,i,lat,a,b)=>{                        /* inside an ellipse laid along the road at sample i */
    if(k.rib||k.air)return false;
    const dx=k.x-(sx[i]+rx[i]*lat),dz=k.z-(sz[i]+rz[i]*lat);
    const f=dx*fx[i]+dz*fz[i],l=dx*rx[i]+dz*rz[i];
    return (f*f)/(a*a)+(l*l)/(b*b)<1;
  };
  /* the dressing patches: ketchup, mustard and hamburger dressing on the inside of the hairpin,
     outlined in white. The outside line is always dry. */
  const A=6.4,B=3.6,cols=[0xc8201e,0xe8b81c,0xf0c8a0],names=['KETCHUP!','SENAP!','HAMBURGERDRESSING!'];
  SIB.patches.forEach(([i,sd],n)=>{
    const lat=sd*(Math.sign(scurv[i])||1)*3.8;
    const g=new THREE.Group(),q=mainPt(i,lat);g.position.set(q.x,q.y+.07,q.z);g.rotation.y=q.yaw;world.add(g);
    const pool=new THREE.Mesh(new THREE.CircleGeometry(1,16).rotateX(-Math.PI/2),psMat({color:cols[n],transparent:true,opacity:.9,depthWrite:false}));
    pool.scale.set(B,1,A);g.add(pool);
    const blob=new THREE.Mesh(new THREE.CircleGeometry(1,10).rotateX(-Math.PI/2),psMat({color:cols[n],transparent:true,opacity:.9,depthWrite:false}));
    blob.scale.set(B*.5,1,A*.4);blob.position.set(B*.7,.01,A*.5);g.add(blob);
    const ol=borasOutline(A+.3,B+.3);ol.position.y=.02;g.add(ol);
    const c=new THREE.Color(cols[n]);
    H.push({id:'dressing'+n,period:1.6,phase:n*.3,mesh:g,unblockable:true,
      update(u){blob.scale.set(B*(.45+.08*Math.sin(u*6.283)),1,A*.4);},
      hit(k){return inPool(k,i,lat,A,B);},
      effect(k){k.slick=Math.max(k.slick,.6);k.drift=0;k.charge=0;
        for(let p=0;p<10;p++)puff(k.x+rand(-1.2,1.2),k.y+rand(.2,1),k.z+rand(-1.2,1.2),c.r,c.g,c.b,.5);
        if(k===player){toast(names[n]);sibSizzle(.8);}}});
  });
  /* the kitchen machinery: the sauce belt runs, the trays slide down, the griddle smokes; and
     the speaker, which grows steadily more worried */
  let sizz=0;
  const m4=new THREE.Matrix4(),qq=new THREE.Quaternion(),e=new THREE.Euler(0,0,0,'YXZ'),v=new THREE.Vector3(),one=new THREE.Vector3(1,1,1);
  H.push({id:'sibKok',period:1,phase:0,
    update(u,dt){
      if(stage.id!=='sibylla')return;
      const Bt=SIB.belt;
      if(Bt){Bt.tex.offset.x=(clock*.6)%1;
        for(const b of Bt.bottles){const f=(b.u+clock*.05)%1;b.g.position.set(-Bt.W/2+2+f*(Bt.W-4),.2,0);}}
      const T=SIB.trayM,L=SIB.trayL;
      if(T&&L){const [t0,t1]=SIB.trays;
        L.forEach((tr,n)=>{const f=(tr.u+clock*.08)%1,ii=Math.floor(lerp(t0,t1,f)),p=mainPt(ii,-(HW+6.1));
          e.set(-Math.atan2(sy[(ii+1)%N]-sy[(ii-1+N)%N],2*SEG),p.yaw,0);qq.setFromEuler(e);v.set(p.x,sy[ii]-.4,p.z);m4.compose(v,qq,one);T.setMatrixAt(n,m4);});
        T.instanceMatrix.needsUpdate=true;}
      if(SIB.smoke&&SIB.smoke.length&&Math.random()<(dt||0)*8){const s=SIB.smoke[Math.floor(Math.random()*SIB.smoke.length)];puff(s[0]+rand(-3,3),s[1]+rand(0,1),s[2]+rand(-3,3),.86,.86,.86,1.2);}
      if(state!=='race'||!player)return;
      if(typeof tractorT!=='undefined'&&tractorT>1.6)SIB.tractor=true;        /* Arne's tractor came out: the kitchen hears about it */
      const near=SIB.hood&&Math.hypot(player.x-SIB.hood.x,player.z-SIB.hood.z)<70;
      sizz-=dt||0;if(near&&sizz<=0){sizz=1.4+Math.random();sibSizzle(.35);}
      if(player.rib)return;
      /* the drive-through, as you reach the first ordering station */
      if(player.si>=SIB.drive[1]&&player.si<SIB.drive[1]+8&&SIB.sayDrive!==player.lap){
        SIB.sayDrive=player.lap;sibBell(.8);vastPA(sibDriveLine(player));}
      /* the kitchen, once a lap, as you go in */
      if(player.si>=SIB.kitchenIn&&player.si<SIB.kitchenIn+10&&SIB.sayLap!==player.lap){
        SIB.sayLap=player.lap;sibBell(.6);
        vastPA(SIB.tractor?'Traktorn får inte stå i drive-through.':
          player.lap>=LAPS?'Victor, din beställning är fortfarande tretton.':'Beställning tretton är klar.');
        SIB.tractor=false;
      }
    }});
}

/** the stage's postcard, for the picnic passport: the whole roster round one outdoor table under
    a red umbrella, and Victor with a ruler, measuring his burger against the picture on the menu.
    Drawn on a 192 x 120 canvas, shown pixelated. */
function sibyllaPostcard(g,w,h){
  const R=(c,x,y,a,b)=>{g.fillStyle=c;g.fillRect(x,y,a,b);};
  const sky=g.createLinearGradient(0,0,0,60);sky.addColorStop(0,'#3f8ad8');sky.addColorStop(1,'#bfe0f4');
  g.fillStyle=sky;g.fillRect(0,0,w,60);
  /* the restaurant behind: timber boards, the sign with the blue dot */
  R('#9a6638',0,30,w,34);for(let x=0;x<w;x+=5)R('#7a4c28',x,30,1,34);
  R('#37506a',20,40,60,18);R('#fff0c8',150,42,14,22);
  R('#f6f4ee',96,18,62,16);R('#d5202a',96,18,62,2);R('#d5202a',96,32,62,2);R('#d5202a',96,18,2,16);R('#d5202a',156,18,2,16);
  g.fillStyle='#d5202a';g.font='italic bold 11px "Titillium Web",sans-serif';g.textAlign='center';g.fillText('Sibylla',123,30);
  g.fillStyle='#1f4fb4';g.beginPath();g.arc(149,23,2.2,0,6.283);g.fill();
  R('#5e5f62',0,64,w,56);
  /* the umbrella */
  g.fillStyle='#d5202a';g.beginPath();g.moveTo(40,52);g.lineTo(152,52);g.lineTo(96,38);g.closePath();g.fill();
  R('#f6f4ee',40,52,112,2);R('#c4cad0',95,54,2,24);
  /* the roster on the benches round the table: a row of little drivers */
  const D=(x,y,c,hat)=>{R(c,x,y,7,8);R('#e8bc98',x+1,y-5,5,5);R(hat,x+1,y-6,5,2);};
  const cast=[['#6e1f2c','#1a1a1a'],['#3f8a3a','#c8a040'],['#1f3a7a','#1f3a7a'],['#f0ece2','#8a4a2c'],['#2f62c8','#1a1c20'],
              ['#a8323a','#e8dcc0'],['#e8c33a','#f4f2ec'],['#7c9468','#c8a040'],['#4a5a6a','#7c8794']];
  cast.forEach(([c,hat],n)=>D(10+n*15,74,c,hat));
  R('#f6f4ee',6,82,140,6);R('#c4cad0',20,88,3,14);R('#c4cad0',128,88,3,14);         /* the table */
  for(let n=0;n<8;n++){R('#d8a050',12+n*16,79,8,2);R('#6a3a20',12+n*16,81,8,1);}   /* burgers on it */
  /* Victor at the end, standing, holding a ruler against his burger and the picture */
  R('#1a1c20',158,72,8,12);R('#e8bc98',159,66,6,6);R('#1a1c20',159,65,6,2);
  R('#f2c81c',142,68,16,2);for(let x=142;x<158;x+=3)R('#1a1c20',x,68,1,1);
  R('#d8a050',144,71,8,3);R('#6a3a20',144,74,8,1);
  R('#1c1e24',172,40,16,20);R('#d8a050',174,44,12,5);R('#6a3a20',174,49,12,3);R('#5aa040',174,48,12,1);R('#d8a050',174,52,12,4);  /* the picture: much bigger */
  /* the stamp corner and the greeting */
  R('#f4efe2',156,94,30,22);R('#d5202a',158,96,26,18);R('#f6f4ee',160,98,22,14);R('#1f4fb4',176,99,4,4);
  g.fillStyle='#fff';g.font='bold 11px "Titillium Web",sans-serif';g.textAlign='left';g.fillText('Hälsningar från Sibylla!',6,14);
  g.lineWidth=2;g.strokeStyle='#fff';g.strokeRect(1,1,w-2,h-2);
}
