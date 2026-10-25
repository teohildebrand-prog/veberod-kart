"use strict";
/* ───────── Lomma Beach ───────── */
/* SAND MELLAN DÄCKEN: a fictional beach-day circuit at Lomma, built from Teo's track GDD
   (Veberod-Kart-Lomma-Beach-GDD.md). Not a street map and not the real bathing facilities.
   Three laps: out of the beach car park (Badparkeringen), north along the paved seaside
   promenade past the cafés (Strandpromenaden), round the enormous sandcastle with a firm outer
   line and a loose sandy inside line (Sandkurvan), west over the wide approach where the big
   beach ball gets loose and round the landward end of the bathing jetty (Bryggsvängen), the long
   sweep behind the dunes onto the firm beach-access road past the sail racks and over a low crest
   (Vindsurfarrakan), and back south past the flats to the ice-cream kiosk's two bends
   (Glasskiosken). The sea lies west of everything and is never part of the course. */

/* x east, z south; the land sits at y=2 and falls into the sea to the west. LOM_SC scales the
   whole layout (track, shoreline, car park) to set the lap length */
const LOM_SC=1;
const LOM={
  /* the lap's sections (main-road samples), worked out from the laid track */
  sec:{prom:66,sand0:157,sand1:214,appr:214,brygg:258,sweep:296,vind:428,back:517,kiosk:645},
  jetty:276,ball:247,kioskAt:664,
  anim:null,said:null,surf:null
};
const lomSec=i=>{const S=LOM.sec;i=((Math.round(i)%N)+N)%N;
  return i<S.prom?'park':i<S.sand0?'prom':i<S.sand1?'sand':i<S.brygg?'appr':i<S.sweep?'brygg':i<S.vind?'sweep':i<S.back?'vind':i<S.kiosk?'back':'kiosk';};
/** the shoreline's x at z: close to the promenade in the south, swinging out west round the bay */
const lomShoreX=z=>{z/=LOM_SC;return LOM_SC*(-275-245*smooth(-60,-300,z)-Math.max(0,-300-z)*.25+4*Math.sin(z*.031));};
/** > 0 out in the water, metres past the waterline */
const lomSea=(x,z)=>lomShoreX(z)-x;
/* the flats east of the return road, and the car park south of the start straight */
const LOM_PARK={x0:-150*LOM_SC,x1:40*LOM_SC,z0:214*LOM_SC+3,z1:268*LOM_SC};
/** distance across the main road only (latAt counts the lanes as road too) */
const lomMainLat=(x,z)=>{const i=nearestGlobal(x,z);return Math.abs((x-sx[i])*rx[i]+(z-sz[i])*rz[i]);};
const lomInPark=(x,z,p)=>{const P=LOM_PARK,q=p||0;return x>P.x0-q&&x<P.x1+q&&z>P.z0-q&&z<P.z1+q;};

/* the promenade: pale concrete paving, grips like tarmac */
SURF.lomPlattor={top:o=>1,grip:o=>1,fuel:1.0,name:'PLATTOR'};
SFX.lomPlattor={dust:null,noise:{f:1200,g:.014}};
ROADTEX.lomPlattor=()=>pixTex(64,64,g=>{
  g.fillStyle='#b4aea2';g.fillRect(0,0,64,64);
  for(let y=0;y<64;y+=8)for(let x=(y%16?4:0);x<68;x+=16){const v=168+((Math.random()*24)|0);
    g.fillStyle='rgb('+v+','+(v-4)+','+(v-12)+')';g.fillRect(x+1,y+1,14,6);}
  g.fillStyle='rgba(220,206,170,.5)';for(let i=0;i<60;i++)g.fillRect((Math.random()*64)|0,(Math.random()*64)|0,2,1);   /* blown sand */
});
/* the beach-access road: compacted sand and shell grit, firm but a touch slower for road karts */
SURF.lomPackad={top:o=>o+(1-o)*0.86,grip:o=>1-0.14*(1-o),fuel:1.05,name:'PACKAD SAND'};
SFX.lomPackad={dust:[.86,.80,.64],noise:{f:1700,g:.016}};
ROADTEX.lomPackad=()=>pixTex(64,64,g=>{
  g.fillStyle='#c2b08a';g.fillRect(0,0,64,64);
  for(let i=0;i<900;i++){g.fillStyle=Math.random()>.5?'rgba(222,208,172,.55)':'rgba(130,112,84,.45)';
    g.fillRect((Math.random()*64)|0,(Math.random()*64)|0,1,1);}
  g.fillStyle='rgba(236,232,220,.7)';for(let i=0;i<40;i++)g.fillRect((Math.random()*63)|0,(Math.random()*63)|0,2,1);   /* shell grit */
  g.fillStyle='rgba(128,108,78,.35)';for(const x of [12,19,43,50])g.fillRect(x,0,3,64);
});
/* Sandspåret's tyre tracks: loose dry sand, kinder than an open field of it but still the
   karts built for sand that gain most; a road kart about breaks even */
SURF.lomLos={top:o=>o+(1-o)*0.6,grip:o=>1-0.3*(1-o),fuel:1.15,name:'LÖS SAND'};
SFX.lomLos=SFX.sand;
VERGEC.lomma=['#dccb9c','#ece0bc','#bfae82'];
GROUND.lomma={cell:26,stripe:0.5,verge:0xd6c69a,cols:[0xe8dcb6,0xe2d4aa,0xeadfba,0xdccda0,0xe6d8b0,0xd8c89a]};

STAGES.push({ id:'lomma', group:'skane', name:'LOMMA BEACH', sub:'SAND MELLAN DÄCKEN',
  order:20.5, modes:['race','tt','free'],
  tag:'Mjölken är varm, glassen smälter och någon har parkerat en traktor vid badplatsen. Kör tre varv längs stranden, hitta vägen mellan badhytterna och spara lite grädde till sista rakan.',
  view:{x:-130,z:-250,h:16,to:{x:-430,z:-345,h:0},fov:55},          /* over the sandcastle and the huts to the sea */
  hw:9,
  bars:[0.8,0.65,0.7], laps:3, stand:false, bankGain:0.14, bankMax:0.16,
  aiLook:0.55,                                   /* tight beach bends: the AI aims a little closer, or it chords them into the sand */
  blurb:'A fictional beach day at Lomma, three laps between the sea and the dunes. Start in the beach car park, run north along the paved promenade past the cafés, round the enormous sandcastle where the outside line is firm and the inside line is loose sand, over the wide approach where a giant beach ball gets loose, round the landward end of the bathing jetty, behind the dunes onto the firm beach-access road past the sail racks and over a low crest, and back past the flats to the ice-cream kiosk\'s two bends. Mellan badhytterna is a paved service passage between the changing huts; Sandspåret is a shorter sandy track behind the dunes that suits a kart built for it.',
  role:'Ett brett startrakt på parkeringen, promenaden längs havet, sandslottskurvan med fast yttre linje och lös sand inåt, bryggsvängen, en lång fast strandväg med ett lågt krön och två tekniska svängar vid glasskiosken.',
  sky:[0xe2f0f6,0x2f7fd4], fog:[0xd8e8ee,170,640], amb:0x7a8494, dif:0xfff6e2,
  road:'asphalt', verge:'lomma', edge:'lomma', ground:'lomma',
  terrain:{size:1500,seg:150},
  /* level beach land, low dunes behind the sand, the bay to the west */
  mod:(x,z,t)=>t*(lomDunes(x,z)-rolls(x,z)),
  shore:(x,z)=>-3.4*smooth(-6,30,lomSea(x,z)),
  land:(x,z,out)=>landLomma(x,z,out),
  sfxOff:'sand',
  /* paving on the promenade, the sandy inside line of Sandkurvan (half the width), sand blown over
     the dune side of the sweep and of the way back (half the width), the compacted access road */
  zones:[[66,157,'lomPlattor'],[159,214,'sand',-1],[346,374,'sand',1],[428,517,'lomPackad'],[532,555,'sand',-1]],
  jumpSpec:[{at:450,h:2.0,drop:1.4,up:11,dn:6,rec:16}],                /* the low crest on Vindsurfarrakan */
  stations:[[0.11,1],[0.83,1]],                                        /* the car park's staging forecourt, the beach-access bay */
  ctrl:[[0,2,206],[-81,2,207],[-135,2,203],[-180,2,184],[-203,2,148],[-214,2,90],[-218,2,36],[-217,2,-18],[-212,2,-72],
        [-203,2,-115],[-187,2,-155],[-167,2,-187],[-150,2,-240],[-160,2,-288],[-200,2,-305],[-250,2,-298],[-333,2,-286],
        [-378,2,-288],[-414,2,-293],[-439,2,-310],[-452,2,-337],[-468,2,-382],[-490,2,-450],[-482,2,-515],[-430,2,-560],
        [-350,2,-568],[-263,2,-531],[-203,2,-518],[-126,2,-497],[-54,2,-490],[18,2,-490],[81,2,-484],[126,2,-459],
        [149,2,-416],[157,2,-351],[149,2,-279],[158,2,-207],[151,2,-135],[157,2,-63],[155,2,9],[149,2,68],
        [133,2,103],[106,2,119],[79,2,126],[58,2,139],[50,2,162],[36,2,193]].map(p=>[p[0]*LOM_SC,2,p[2]*LOM_SC]),
  routes:[
    {id:'hytterna',name:'MELLAN BADHYTTERNA',a:150,b:224,hw:6,side:-1,lead:10,leadLat:7,
     mid:[[0.5,16]],surface:'lomPlattor',tex:'lomPlattor',risk:0.35,
     blurb:'A narrow paved service passage between the changing huts, skipping the long way round the sandcastle. Two offset corners and a slow way out: a bad entry gives back everything it saves.'},
    {id:'sandsparet',name:'SANDSPÅRET',a:293,b:425,hw:6,side:1,lead:24,leadLat:14,
     mid:[[0.35,-30],[0.65,-30]],surface:'lomLos',tex:'sand',risk:0.45,
     blurb:'Tyre tracks behind the dunes, cutting the broad sweep onto the access road. Shorter, with a firm patch in the middle, but loose sand most of the way: a kart built for it gains, a road kart may lose.'}],
  stamps:[
    {id:'lom1',dish:'Mjukglass',ini:'M',kind:'intro',route:'main',i:675,lat:6.6,
     hint:'Någon hann beställa före starten.',
     story:'Soft-serve from the kiosk window, vanilla in a crisp cone with a chocolate dip if you ask nicely, and a strawberry-flavoured sauce if you ask the teenager behind the counter twice. On a hot afternoon it runs down your wrist before you have found your towel again, which is why the queue starts eating it in the queue.'},
    {id:'lom2',dish:'Saftflaska',ini:'S',kind:'route',route:'hytterna',f:0.76,lat:0,
     hint:'Det står något kvar mellan badhytterna.',
     story:'A plastic bottle of red cordial, mixed at home far too strong, frozen overnight so it stays cold until lunch and then melts all at once. Every family on the beach has one, and every family has left one behind a changing hut at some point.'},
    {id:'lom3',dish:'Jordgubbar',ini:'J',kind:'air',route:'main',jump:0,after:5,lat:0,air:2.8,
     hint:'Sommaren ligger lite ovanför marken.',
     story:'Swedish strawberries from a roadside stall, sold by the litre in a little cardboard basket and eaten on the beach without being washed. The best ones are always at the top of the basket, and by the time you reach the bottom they are warm, squashed and, somehow, still the best thing you have eaten all summer.'}],
  /* Victor's beach line, and nobody else's lines change */
  say:{victor:{start:'Blöt sand greppar bättre. Det vet alla.'}},
  postcard:{draw:(g,w,h)=>lommaPostcard(g,w,h),caption:'Vi skulle bara ta ett dopp.'},
  aiDodge:(k,t,L)=>lomDodge(k,t,L),
  hazards:H=>hazardsLomma(H), scenery:()=>sceneryLomma()
});

/* the ground: low dunes behind the beach, wet sand at the waterline, grass inland */
function lomDunes(x,z){
  const d=lomSea(x,z);                                           /* the dune belt: 30-150 m back from the water */
  const belt=smooth(-24,-50,d)*(1-smooth(-140,-190,d));
  const inner=x>-200*LOM_SC&&x<130*LOM_SC&&z>-470*LOM_SC&&z<180*LOM_SC?.7:0;                 /* hummocks inside the lap too */
  const h=Math.max(0,Math.sin(x*.061+1.3)*Math.cos(z*.052-.4))*3.2+Math.max(0,Math.sin((x-z)*.037))*1.6;
  return h*Math.max(belt,inner);
}
function landLomma(x,z,out){
  const d=lomSea(x,z);
  if(d>-4){out.setHex(d>2?0x5a8aa0:0xb8a47a);return;}            /* wet sand at the waterline */
  if(lomInPark(x,z,0)){out.setHex(0x5e6064);return;}
  if(d>-60)return;                                               /* the beach: the sand palette */
  const h=hash2(Math.floor(x/14),Math.floor(z/14));
  if(x>176*LOM_SC&&h>.25){out.setHex(h>.7?0x6a9a4a:0x7aa456);return;}   /* the lawns round the flats */
  if(lomDunes(x,z)>1.2&&h>.35)out.setHex(h>.75?0xc4bc84:0xccc490);   /* marram on the dune tops */
}

/* roadside: low event fencing in white and blue, open at the forks and forecourts */
EDGES.lomma=st=>{
  const step=3,post=rosInst(flat(new THREE.BoxGeometry(.16,1.0,.16)).translate(0,.5,0),psMat({color:0xf4f2ec}),N*2);
  const rope=rosInst(flat(new THREE.BoxGeometry(.08,.08,SEG*step+.1)).translate(0,.85,0),psMat({}),N*2,true);
  for(let i=0;i<N;i+=step)for(const side of [-1,1]){
    const o=side*(HW+2.4),x=sx[i]+rx[i]*o,z=sz[i]+rz[i]*o;
    if(nearAlt(x,z,2.6)||lomInPark(x,z,2))continue;
    if(stations.some(S=>{let d=i-S.at;if(d<-N/2)d+=N;else if(d>N/2)d-=N;return S.side===side&&d>-3&&d<S.len+3;}))continue;
    const y=meshY(x,z),yw=Math.atan2(fx[i],fz[i]);
    post.put(x,y-.05,z,yw);rope.put(x,y-.05,z,yw,1,1,1,(i/step)%2?0x2f62c8:0xf4f2ec);
  }
  post.done();rope.done();
};

/* textures and small props */
/** the flats behind the beach: white render, a dark window band per floor, glass balconies */
function lomFlatTex(){
  const t=pixTex(16,16,g=>{
    g.fillStyle='#eeeeea';g.fillRect(0,0,16,16);
    g.fillStyle='#3a4a5a';g.fillRect(1,3,14,7);g.fillStyle='#8ab4d0';g.fillRect(2,4,5,3);
    g.fillStyle='rgba(190,220,236,.6)';g.fillRect(0,10,16,3);g.fillStyle='#c8ccd0';g.fillRect(0,10,16,1);
    g.fillStyle='#d8d8d2';g.fillRect(0,15,16,1);
  });
  t.wrapS=t.wrapT=THREE.RepeatWrapping;return t;
}
/** a changing hut: a timber box with a pitched roof and a door; nose along +z, base at y=0 */
function lomHut(col,roof){
  const g=new THREE.Group(),c=psMat({color:col});
  hoorBox(g,2.4,2.5,2.4,c,0,1.25,0);
  const r=hoorBox(g,1.8,.18,2.8,psMat({color:roof}),-.6,2.85,0);r.rotation.z=.55;
  const r2=hoorBox(g,1.8,.18,2.8,psMat({color:roof}),.6,2.85,0);r2.rotation.z=-.55;
  hoorBox(g,1.0,1.9,.08,psMat({color:0xf4f2ec}),0,1.0,1.22);
  hoorBox(g,.3,.3,.06,psMat({color:0x2a2c30}),0,2.2,1.24);
  return g;
}
/** a towel laid on the sand, striped; a plane facing up */
function lomTowelTex(a,b){return pixTex(8,16,c=>{for(let y=0;y<16;y+=4){c.fillStyle=(y/4)%2?b:a;c.fillRect(0,y,8,4);}c.fillStyle='#f4f2ec';c.fillRect(0,0,8,1);c.fillRect(0,15,8,1);});}
/** a rack of windsurf sails: two posts, a bar, sails leaning on it (returned for the sway) */
function lomSailRack(g,cols){
  const steel=psMat({color:0xa8aeb4}),sails=[];
  hoorBox(g,.14,2.6,.14,steel,-3.4,1.3,0);hoorBox(g,.14,2.6,.14,steel,3.4,1.3,0);hoorBox(g,7,.12,.12,steel,0,2.5,0);
  cols.forEach((col,k)=>{
    const s=new THREE.Group();s.position.set(-2.6+k*1.3,.1,.2);g.add(s);
    const tex=pixTex(8,16,c=>{c.fillStyle=col;c.fillRect(0,0,8,16);c.fillStyle='rgba(255,255,255,.55)';c.fillRect(0,5,8,1);c.fillRect(0,10,8,1);
      c.fillStyle='#1e2022';c.fillRect(0,0,1,16);});
    const shape=new THREE.BufferGeometry();
    shape.setAttribute('position',new THREE.Float32BufferAttribute([0,0,0, 0,4.6,0, 1.9,.2,0],3));
    shape.setAttribute('uv',new THREE.Float32BufferAttribute([0,0, 0,1, 1,0],2));shape.computeVertexNormals();
    const m=new THREE.Mesh(shape,psMat({map:tex,side:THREE.DoubleSide}));m.rotation.x=-.32;s.add(m);
    sails.push(s);
  });
  return sails;
}

/* the scenery */
function sceneryLomma(){
  const RES=[];
  const res=(x,z,r)=>RES.push([x,z,r]);
  const free=(x,z,pad)=>{
    if(latAt(x,z)<HW+pad||lomSea(x,z)>-3)return false;
    for(const r of RES)if(Math.hypot(x-r[0],z-r[1])<r[2])return false;
    return true;
  };
  const at=(i,o)=>{const q=mainPt(i,o);q.y=Math.abs(o)<HW+1?q.y:meshY(q.x,q.z);return q;};
  const yawAt=i=>{i=((Math.round(i)%N)+N)%N;return Math.atan2(fx[i],fz[i]);};
  const H=(a,b)=>hash2(a*1.37+3.1,b*0.71-2.3);
  const S=LOM.sec,Y=2;
  const HY=ALTS.find(r=>r.id==='hytterna'),SP=ALTS.find(r=>r.id==='sandsparet');
  const dark=psMat({color:0x2a2c30}),white=psMat({color:0xf4f2ec}),wood=psMat({color:0x9a7a52}),woodL=psMat({color:0xc8a878}),steel=psMat({color:0xa8aeb4});
  const red=psMat({color:0xd8402a}),blue=psMat({color:0x2f62c8}),yellow=psMat({color:0xf2c81c});
  const sign=(txt,bg,fg,w,pw,ph,px)=>sibSign(txt,bg,fg,w,14,pw,ph,px||8);
  /** a sign on two posts beside the road at sample i, side s, facing the oncoming karts */
  const roadSign=(i,s,txt,bg,fg,w,pw,lat)=>{
    const q=at(i,s*(lat||HW+4)),g=new THREE.Group();g.position.set(q.x,q.y,q.z);g.rotation.y=yawAt(i)+Math.PI;world.add(g);
    hoorBox(g,.14,2.3,.14,dark,-pw/2+.3,1.15,0);hoorBox(g,.14,2.3,.14,dark,pw/2-.3,1.15,0);hoorMerge(g);
    const t=sign(txt,bg,fg,w,pw,pw*14/w*1.1);t.position.set(0,2.4,0);g.add(t);res(q.x,q.z,pw/2+1);return g;};
  LOM.anim={sails:[],flags:[],towels:[],kite:null,gull:null,bob:null,wave:[],glints:[],boats:[]};
  for(const S_ of stations){const q=mainPt(S_.at+6,S_.side*(HW+13));res(q.x,q.z,24);}

  /* ── the sea: one big plane, turquoise over the shallows, deep blue out in the bay, glints ── */
  {const W=2200,seg=88,g=new THREE.PlaneGeometry(W,W,seg,seg).rotateX(-Math.PI/2),p=g.attributes.position,col=[];
    const shal=new THREE.Color(0x6cc0c4),mid=new THREE.Color(0x3c8eb4),deep=new THREE.Color(0x245e96),c=new THREE.Color();
    for(let v=0;v<p.count;v++){const x=p.getX(v)-560,z=p.getZ(v)-200,d=lomSea(x,z);p.setX(v,x);p.setZ(v,z);if(d<-30)p.setY(v,-8);   /* tucked under the land */
      if(d<40)c.copy(shal);else if(d<140)c.copy(shal).lerp(mid,(d-40)/100);else c.copy(mid).lerp(deep,clamp((d-140)/260,0,1));
      c.offsetHSL(0,0,(hash2(Math.floor(x/30),Math.floor(z/30))-.5)*.03);col.push(c.r,c.g,c.b);}
    g.setAttribute('color',new THREE.Float32BufferAttribute(col,3));
    const sea=new THREE.Mesh(g,psMat({vertexColors:true,unlit:true}));sea.position.y=.32;world.add(sea);
    /* the foam line and bright glints that drift and blink */
    const gm=psMat({color:0xe8f6f8,unlit:true,transparent:true,opacity:.75,depthWrite:false});
    for(let n=0;n<70;n++){const z=-640+n*14+H(n,1)*8,d=6+H(n,2)*160,x=lomShoreX(z)+d;
      const m=new THREE.Mesh(new THREE.PlaneGeometry(2+H(n,3)*6,.35).rotateX(-Math.PI/2),gm);m.position.set(x,.38,z);m.rotation.y=Math.PI/2+H(n,4)*.3;world.add(m);
      LOM.anim.glints.push({m,x,z,ph:H(n,5)*6.28,d});}
    for(let z=-700;z<380;z+=6){const x=lomShoreX(z)+3.5,m=new THREE.Mesh(new THREE.PlaneGeometry(6.2,.5).rotateX(-Math.PI/2),gm);
      m.position.set(x,.36,z);m.rotation.y=Math.PI/2-Math.atan2(lomShoreX(z+3)-lomShoreX(z-3),6);world.add(m);LOM.anim.wave.push({m,x,z});}
    /* sails offshore and a far coast across the sound */
    for(let n=0;n<10;n++){const near=n<3,g2=new THREE.Group(),z=near?-268-n*48:-560+(n-3)*130,x=lomShoreX(z)-(near?40+n*22:180+H(n,7)*260);   /* three windsurfers off the jetty, sailboats further out */g2.position.set(x,.3,z);world.add(g2);
      hoorBox(g2,near?.7:1.2,near?.25:.6,near?2.6:4,white,0,.3,0);if(near)g2.scale.setScalar(.8);
      const sail=new THREE.Mesh(new THREE.BufferGeometry().setAttribute('position',new THREE.Float32BufferAttribute([0,.6,-1.6, 0,7,0, 0,.6,1.4],3)),
        psMat({color:[0xf4f2ec,0xf4f2ec,0xd8402a,0xf2c81c][n%4],side:THREE.DoubleSide}));sail.geometry.computeVertexNormals();g2.add(sail);
      LOM.anim.boats.push({g:g2,x,z,ph:H(n,8)*6});}
    const far=rosInst(flat(new THREE.BoxGeometry(1,1,1)).translate(0,.5,0),psMat({}),60,true);
    for(let n=0;n<44;n++){const z=-900+n*30,x=-1120+H(n,9)*30;far.put(x,0,z,0,40,4+H(n,10)*10,30,[0x8aa0a8,0x9aaeb4,0x7e949c][n%3]);}
    far.done();
  }

  /* ── the beach between the road and the water: parasols, towels, wind breaks, a lifeguard tower ── */
  {const para=[];
    for(let n=0;n<70;n++){const z=-560+n*12.4+H(n,11)*6,d=-12-H(n,12)*30,x=lomShoreX(z)+d;
      if(!free(x,z,10))continue;para.push([x,z,n]);res(x,z,2.4);}
    const cols=[['#d8402a','#f4f2ec'],['#2f62c8','#f4f2ec'],['#f2c81c','#3fa04a'],['#e86a9a','#f4f2ec'],['#3fb0b0','#f2e8c8']];
    para.forEach(([x,z,n])=>{const [a,b]=cols[n%cols.length];
      if(n%3!==2){const u=borasUmbrella(1.6,2.6,a,b,8);u.position.set(x,meshY(x,z)+2.6,z);world.add(u);}
      const t=new THREE.Mesh(new THREE.PlaneGeometry(1.1,2).rotateX(-Math.PI/2),psMat({map:lomTowelTex(a,b)}));
      t.position.set(x+1.6,meshY(x+1.6,z)+.05,z+.4);t.rotation.y=H(n,13)*.8;world.add(t);});
    /* wind breaks: striped cloth on poles, like every Swedish beach */
    const wb=rosInst(flat(new THREE.BoxGeometry(.06,1.1,4)).translate(0,.55,0),psMat({}),40,true);
    for(let n=0;n<24;n++){const z=-500+n*32+H(n,14)*10,x=lomShoreX(z)-18-H(n,15)*20;if(!free(x,z,6))continue;
      wb.put(x,meshY(x,z),z,H(n,16)*3,1,1,1,[0x3f8ac8,0xe8a020,0xd8402a,0x3fa04a][n%4]);res(x,z,2.4);}
    wb.done();
    /* the lifeguard tower on the beach, between the promenade and the water */
    {const z=-60,x=lomShoreX(z)-14,g=new THREE.Group();g.position.set(x,meshY(x,z),z);g.rotation.y=-Math.PI/2;world.add(g);
      for(const [a,b] of [[-1,-1],[1,-1],[-1,1],[1,1]])hoorBox(g,.2,4,.2,woodL,a*1.2,2,b*1.2);
      hoorBox(g,3,.2,3,woodL,0,4,0);hoorBox(g,3,1.6,.12,red,0,4.9,1.45);hoorBox(g,3.2,.16,3.2,red,0,6.6,0);
      for(const [a,b] of [[-1,-1],[1,-1],[-1,1],[1,1]])hoorBox(g,.1,1.8,.1,white,a*1.4,5.7,b*1.4);
      hoorMerge(g);res(x,z,4);
      const fl=new THREE.Mesh(new THREE.PlaneGeometry(1.4,.9,3,1),psMat({map:pixTex(8,6,c=>{c.fillStyle='#3fa04a';c.fillRect(0,0,8,6);}),side:THREE.DoubleSide}));
      fl.position.set(x,meshY(x,z)+8.2,z+.7);world.add(fl);LOM.anim.flags.push(fl);
      const pole=new THREE.Mesh(flat(new THREE.CylinderGeometry(.05,.05,2.2,4)),white);pole.position.set(x,meshY(x,z)+7.6,z);world.add(pole);}
    /* the low stone pier out into the shallows (photo 1): boulders on a sand spit */
    {const st=rosInst(flat(new THREE.DodecahedronGeometry(1,0)),psMat({}),120,true),z0=-130;
      const sp=new THREE.Mesh(new THREE.CircleGeometry(1,12).rotateX(-Math.PI/2),psMat({color:0xd8c89a}));
      sp.scale.set(10,1,34);sp.position.set(lomShoreX(z0)+30,.4,z0+6);sp.rotation.y=.25;world.add(sp);
      for(let n=0;n<60;n++){const t=n/60,x=lomShoreX(z0)-4+t*78,z=z0+Math.sin(t*3)*4+H(n,17)*2;
        st.put(x,.1+H(n,18)*.4,z,H(n,19)*6,.8+H(n,20)*.8,.5+H(n,21)*.5,.8+H(n,22)*.8,[0x6a645c,0x7a746a,0x5a554e][n%3]);}
      st.done();}
  }

  /* ── the car park and the start: tarmac, painted bays, parked cars, bicycles, coolers and rings,
     the FULLT board over six neatly painted starting boxes ── */
  {const P=LOM_PARK,tt=pixTex(32,32,c=>{c.fillStyle='#5e6064';c.fillRect(0,0,32,32);
      for(let i=0;i<240;i++){c.fillStyle=Math.random()>.5?'rgba(130,130,134,.5)':'rgba(40,40,44,.5)';c.fillRect((Math.random()*32)|0,(Math.random()*32)|0,1,1);}
      c.fillStyle='#f4f2ec';c.fillRect(0,0,1,20);});
    tt.wrapS=tt.wrapT=THREE.RepeatWrapping;
    const st=4,nx=Math.ceil((P.x1-P.x0)/st),nz=Math.ceil((P.z1-P.z0)/st),pos=[],uv=[],idx=[];
    for(let a=0;a<=nz;a++)for(let b=0;b<=nx;b++){const x=P.x0+b*st,z=P.z0+a*st;pos.push(x,meshY(x,z)+(latAt(x,z)<HW+2?-1:.05),z);uv.push(x/5,z/9);}
    for(let a=0;a<nz;a++)for(let b=0;b<nx;b++){const p0=a*(nx+1)+b,p1=p0+1,p2=p0+nx+1,p3=p2+1;idx.push(p0,p2,p1,p1,p2,p3);}
    const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));
    geo.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));geo.setIndex(idx);geo.computeVertexNormals();
    world.add(new THREE.Mesh(geo,psMat({map:tt})));
    /* overloaded picnic cars, parked nose in */
    const car=rosInst(flat(new THREE.BoxGeometry(1.8,1.0,4.2)).translate(0,.75,0),psMat({}),40,true);
    const cab=rosInst(flat(new THREE.BoxGeometry(1.6,.7,2.2)).translate(0,1.6,-.2),psMat({color:0x2a3440}),40);
    const load=rosInst(flat(new THREE.BoxGeometry(1.4,.5,1.8)).translate(0,2.2,-.2),psMat({}),40,true);
    let n=0;
    for(let x=P.x0+6;x<P.x1-4;x+=5)for(const z of [P.z0+22,P.z1-6]){if(H(x,z)<.18)continue;
      car.put(x,meshY(x,z),z,0,1,1,1,[0xd8402a,0x2f62c8,0xf4f2ec,0x3a3c40,0x6e1f2c,0xc8c8c0,0x3fa04a][n%7]);cab.put(x,meshY(x,z),z,0);
      if(H(z,x)>.45)load.put(x,meshY(x,z),z,0,1,1,1,[0xf2c81c,0x2f62c8,0xe86a9a,0x3fb0b0][n%4]);n++;}
    car.done();cab.done();load.done();
    /* coolers, inflatable rings and bicycles along the barrier */
    const cool=rosInst(flat(new THREE.BoxGeometry(.8,.5,.5)).translate(0,.25,0),psMat({}),30,true),ring=rosInst(flat(new THREE.TorusGeometry(.5,.18,4,8)).rotateX(Math.PI/2),psMat({}),30,true);
    for(let k=0;k<26;k++){const x=P.x0+8+k*6.8,z=P.z0+9+H(k,23)*3;if(latAt(x,z)<HW+5)continue;
      if(k%2)cool.put(x,meshY(x,z),z,H(k,24),1,1,1,[0x2f62c8,0xd8402a,0xf4f2ec][k%3]);else ring.put(x,meshY(x,z)+.2,z,0,1,1,1,[0xf2c81c,0xe86a9a,0x3fb0b0,0xf08a1c][k%4]);}
    cool.done();ring.done();
    res((P.x0+P.x1)/2,(P.z0+P.z1)/2,0);
    /* the six starting boxes, painted with great care, and the FULLT board above them */
    const box=pixTex(16,24,c=>{c.strokeStyle='#f4f2ec';c.lineWidth=1;c.strokeRect(1.5,1.5,13,21);c.fillStyle='#f2c81c';c.fillRect(6,8,4,8);});
    for(let row=0;row<3;row++)for(const col of [-1,1]){const s=10+row*16,q=mainPt(s,col*3.4),
      m=new THREE.Mesh(new THREE.PlaneGeometry(2.6,4).rotateX(-Math.PI/2),psMat({map:box,unlit:true,transparent:true,depthWrite:false}));
      m.position.set(q.x,sy[s]+.07,q.z);m.rotation.y=yawAt(s);world.add(m);}
    {const q=at(24,-(HW+4.4)),g=new THREE.Group();g.position.set(q.x,q.y,q.z);g.rotation.y=yawAt(24)+Math.PI/2;world.add(g);
      hoorBox(g,.2,4.4,.2,dark,-1.6,2.2,0);hoorBox(g,.2,4.4,.2,dark,1.6,2.2,0);hoorMerge(g);
      const t=sign('P  FULLT','#2f62c8','#f4f2ec',96,4,1.6,10);t.position.set(0,4,0);g.add(t);
      const t2=sign('GÄSTPARKERING — EJ STARTGRID','#f4f2ec','#1e2022',224,4.6,.5,7);t2.position.set(0,2.9,0);g.add(t2);res(q.x,q.z,3);}
    /* TRE VARV. SEN GLASS. over the start, on a timber arch */
    {const i=24,q=at(i,0),g=new THREE.Group();g.position.set(q.x,q.y,q.z);g.rotation.y=yawAt(i);world.add(g);
      for(const sd of [-1,1])hoorBox(g,.4,7,.4,woodL,sd*(HW+2.2),3.5,0);hoorMerge(g);
      const b=new THREE.Mesh(new THREE.PlaneGeometry(2*HW+3,1.8,8,1),psMat({map:horbyBannerTex('TRE VARV. SEN GLASS.',192,22),unlit:true,side:THREE.DoubleSide}));
      const pa=b.geometry.attributes.position;for(let v=0;v<pa.count;v++){const x=pa.getX(v)/(HW+1.5);pa.setY(v,pa.getY(v)-(1-x*x)*.4);}
      b.position.set(0,6.2,0);b.rotation.y=Math.PI;g.add(b);}
    /* bunting on poles along the start straight, and the spectators behind the barrier */
    const pole=rosInst(flat(new THREE.CylinderGeometry(.1,.1,6,5)).translate(0,3,0),white,30),flag=rosInst(flat(new THREE.ConeGeometry(.28,.5,3)).rotateX(Math.PI),psMat({}),300,true);
    const fc=[0xd8402a,0xf2c81c,0x2f62c8,0x3fb0b0,0xf4f2ec];let prev=null;
    for(let i=-20;i<44;i+=8){const q=at(i,HW+3.4);pole.put(q.x,q.y,q.z,0);
      if(prev)for(let k=1;k<7;k++){const t=k/7,x=lerp(prev.x,q.x,t),z=lerp(prev.z,q.z,t),y=lerp(prev.y,q.y,t)+5.6-Math.sin(Math.PI*t)*.8;flag.put(x,y,z,yawAt(i),1,1,1,fc[(i+k)%5]);}
      prev=q;}
    pole.done();flag.done();
    for(let i=-16;i<40;i+=2.6){if(H(i,25)<.35)continue;const q=at(i+H(i,26),HW+5+H(i,27)*2.6),p=lerumNeighbour([0xd8402a,0x2f78d8,0xf2c81c,0x3fa04a,0xe86a9a,0xf4f2ee][Math.floor(H(i,28)*6)],[0x3a2a1e,0xd8c08a,0x8a8a8a,0xe8d8a8][Math.floor(H(i,29)*4)],false);
      p.g.position.set(q.x,q.y,q.z);p.g.rotation.y=yawAt(i)-Math.PI/2;world.add(p.g);LOM.anim.towels.push({wave:p.g,ph:H(i,30)*6});res(q.x,q.z,1);}
  }

  /* ── Strandpromenaden: the café row inland, flags, protected outdoor seating, a towel line ── */
  {const cafes=[['KAFÉ SANDLÅDAN','#3fb0b0'],['VÅFFELSTUGAN','#f2c81c'],['FISK & FRITERAT','#2f62c8'],['STRANDKIOSKEN','#e86a9a']];
    let n=0;
    for(let i=S.prom+10;i<S.sand0-10;i+=22){const q=at(i,HW+15);if(!free(q.x,q.z,10))continue;
      const [nm,col]=cafes[n++%cafes.length],g=new THREE.Group();g.position.set(q.x,q.y,q.z);g.rotation.y=yawAt(i)-Math.PI/2;world.add(g);
      hoorBox(g,12,4,7,white,0,2,0);hoorBox(g,12.6,.4,7.6,psMat({color:0x6a6e74}),0,4.2,0);
      hoorBox(g,8,2,.1,psMat({color:0x3a4a5a}),0,1.6,3.52);                                          /* the window */
      const aw=hoorBox(g,12,.12,2.6,psMat({color:parseInt(col.slice(1),16)}),0,3.4,4.6);aw.rotation.x=.3;
      hoorMerge(g);
      const t=sign(nm,'#f4f2ec',col,160,8,.9,8);t.position.set(0,3.9,3.6);g.add(t);res(q.x,q.z,9);
      /* the outdoor seating behind a low barrier: tables and parasols */
      for(let k=-1;k<=1;k++){const tq=at(i+k*3.4,HW+7.4);if(!free(tq.x,tq.z,4))continue;
        const tb=new THREE.Group();tb.position.set(tq.x,tq.y,tq.z);world.add(tb);
        hoorBox(tb,1.2,.1,1.2,white,0,.85,0);hoorBox(tb,.1,.85,.1,steel,0,.42,0);hoorMerge(tb);
        const u=borasUmbrella(1.4,2.4,col,'#f4f2ec',6);u.position.set(tq.x,tq.y+2.5,tq.z);world.add(u);res(tq.x,tq.z,1.8);}
    }
    /* flags along the promenade's sea side */
    const fp=rosInst(flat(new THREE.CylinderGeometry(.08,.1,7,5)).translate(0,3.5,0),white,20);
    for(let i=S.prom+6;i<S.sand0-6;i+=12){const q=at(i,-(HW+3.4));fp.put(q.x,q.y,q.z,0);
      const fl=new THREE.Mesh(new THREE.PlaneGeometry(1.8,1.1,4,1),psMat({map:pixTex(8,6,c=>{c.fillStyle=['#2f62c8','#f2c81c','#3fb0b0','#d8402a'][(i>>2)%4];c.fillRect(0,0,8,6);c.fillStyle='#f4f2ec';c.fillRect(0,2,8,1);}),side:THREE.DoubleSide}));
      fl.position.set(q.x+.9,q.y+6.4,q.z);world.add(fl);LOM.anim.flags.push(fl);res(q.x,q.z,1);}
    fp.done();
    /* HANDDUK RESERVERAR INTE RACINGLINJEN, by a towel laid at the very edge of the paving */
    {const i=S.prom+40,q=at(i,-(HW+1.6)),t=new THREE.Mesh(new THREE.PlaneGeometry(1.2,2.2).rotateX(-Math.PI/2),psMat({map:lomTowelTex('#e86a9a','#f4f2ec')}));
      t.position.set(q.x,q.y+.06,q.z);t.rotation.y=yawAt(i);world.add(t);
      roadSign(i+2,-1,'HANDDUK RESERVERAR INTE RACINGLINJEN','#f4f2ec','#d8402a',256,6.4);}
    /* a towel line strung between two poles on the beach side, the towels flapping */
    {const i=S.prom+66,a=at(i,-(HW+9)),b=at(i+6,-(HW+9));
      for(const q of [a,b]){const p=new THREE.Mesh(flat(new THREE.CylinderGeometry(.06,.06,2.4,4)),wood);p.position.set(q.x,q.y+1.2,q.z);world.add(p);}
      for(let k=1;k<6;k++){const t=k/6,x=lerp(a.x,b.x,t),z=lerp(a.z,b.z,t),m=new THREE.Mesh(new THREE.PlaneGeometry(.9,1.4,1,3),
        psMat({map:lomTowelTex(['#d8402a','#2f62c8','#f2c81c','#3fb0b0','#e86a9a'][k%5],'#f4f2ec'),side:THREE.DoubleSide}));
        m.position.set(x,lerp(a.y,b.y,t)+1.6,z);m.rotation.y=yawAt(i);world.add(m);LOM.anim.towels.push({m,ph:k*.9});}
      res(a.x,a.z,4);res(b.x,b.z,4);}
    /* the seagull behind the café fence, trying for someone's chip */
    {const i=S.prom+24,q=at(i,HW+9.6),G=avenynGullGeos(),g=new THREE.Group();g.position.set(q.x,q.y,q.z);g.rotation.y=yawAt(i)+Math.PI/2;world.add(g);
      g.add(new THREE.Mesh(G.white,psMat({color:0xf4f2ec})));g.add(new THREE.Mesh(G.grey,psMat({color:0x9aa4ac})));g.add(new THREE.Mesh(G.yellow,psMat({color:0xf2c81c})));
      const chip=new THREE.Mesh(flat(new THREE.BoxGeometry(.06,.06,.3)),psMat({color:0xf2d070}));chip.position.set(0,.64,.62);g.add(chip);
      LOM.anim.gull={g,y:q.y,chip};}
  }

  /* ── Sandkurvan: the enormous sandcastle at the apex with a tiny flag, the sand line marked ── */
  {const i=190,side=-(Math.sign(scurv[i])||1),q=at(i,side*(HW+13)),g=new THREE.Group();g.position.set(q.x,q.y-.2,q.z);world.add(g);
    const sm=psMat({color:0xe2cc94}),sd=psMat({color:0xcfb67c});
    const tower=(x,z,r,h)=>{const t=new THREE.Mesh(flat(new THREE.CylinderGeometry(r*.85,r,h,8)),sm);t.position.set(x,h/2,z);g.add(t);
      for(let k=0;k<8;k++){const a=k/8*6.283;hoorBox(g,r*.5,r*.4,r*.5,sd,x+Math.cos(a)*r*.75,h+r*.2,z+Math.sin(a)*r*.75);}};
    hoorBox(g,14,3.2,14,sm,0,1.6,0);                                                               /* the base */
    tower(-5.2,-5.2,2.3,7);tower(5.2,-5.2,2.3,7);tower(-5.2,5.2,2.3,7);tower(5.2,5.2,2.3,7);
    hoorBox(g,9,6,9,sm,0,6,0);tower(0,0,3.2,13);
    hoorBox(g,2.4,3,.4,psMat({color:0x6a5a40}),0,1.6,7.05);                                         /* the gate */
    hoorMerge(g);
    const pole=new THREE.Mesh(flat(new THREE.CylinderGeometry(.06,.06,2.4,4)),white);pole.position.set(0,15.2,0);g.add(pole);
    const fl=new THREE.Mesh(new THREE.PlaneGeometry(1,.6,3,1),psMat({map:pixTex(8,6,c=>{c.fillStyle='#2f62c8';c.fillRect(0,0,8,6);c.fillStyle='#f2c81c';c.fillRect(2,0,2,6);c.fillRect(0,2,8,2);}),side:THREE.DoubleSide}));
    fl.position.set(q.x+.5,q.y+15.8,q.z);world.add(fl);LOM.anim.flags.push(fl);
    /* a bucket and spade for scale */
    const b=new THREE.Mesh(flat(new THREE.CylinderGeometry(1.2,.9,1.6,8)),red);b.position.set(q.x+mainPt(i,0).rx*side*-9.4,q.y+.8,q.z+mainPt(i,0).rz*side*-9.4);world.add(b);
    res(q.x,q.z,12);LOM.castle={x:q.x,z:q.z};
    /* the line between firm and loose: a row of little flags on the paving edge of the sand half */
    const fm=rosInst(flat(new THREE.ConeGeometry(.22,.6,3)).translate(0,.3,0),psMat({color:0xf2c81c}),40);
    for(let k=S.sand0+2;k<S.sand1-1;k+=4){const p=mainPt(k,0);fm.put(p.x,sy[k]+.02,p.z,yawAt(k),1,.6,1);}
    fm.done();
    roadSign(S.sand0-12,1,'FAST ← · → LÖS SAND','#f4f2ec','#1e2022',160,4.4,HW+3.6);
  }

  /* ── Mellan badhytterna: the colourful changing huts down both sides of the passage, beach
     chairs and towels behind them, a sign at the fork ── */
  if(HY){const hc=[[0xd8402a,0xf4f2ec],[0x3fb0b0,0xf4f2ec],[0xf2c81c,0xd8402a],[0xe8a8c0,0xf4f2ec],[0x8ac4e8,0x2f62c8],[0xf4f2ec,0xd8402a]];
    let n=0;
    for(let j=COMMIT+6;j<HY.n-MERGE-4;j+=3)for(const s of [-1,1]){
      const p=lanePt(HY,j/(HY.n-1),s*(HY.hw+2.8));if(lomMainLat(p.x,p.z)<HW+4)continue;
      const [c,r]=hc[n++%hc.length],h=lomHut(c,r);h.position.set(p.x,meshY(p.x,p.z),p.z);h.rotation.y=p.yaw+(s>0?-Math.PI/2:Math.PI/2);world.add(h);hoorMerge(h);
      if((j>>1)%3===0){const q=lanePt(HY,j/(HY.n-1),s*(HY.hw+6.2)),t=new THREE.Mesh(new THREE.PlaneGeometry(1.1,2).rotateX(-Math.PI/2),psMat({map:lomTowelTex(['#d8402a','#2f62c8','#f2c81c'][n%3],'#f4f2ec')}));
        t.position.set(q.x,meshY(q.x,q.z)+.05,q.z);t.rotation.y=q.yaw;world.add(t);
        const ch=lerumNeighbour([0xd8402a,0x2f78d8,0xf2c81c,0x3fa04a][n%4],[0x3a2a1e,0xd8c08a][n%2],true);ch.g.position.set(q.x+1.4,meshY(q.x,q.z),q.z);ch.g.rotation.y=q.yaw+s*Math.PI/2;world.add(ch.g);}
    }
    roadSign(HY.a-10,-1,'MELLAN BADHYTTERNA ←','#3fb0b0','#f4f2ec',160,4.6);
  }

  /* ── the approach to Bryggsvängen: the protected picnic area the ball escapes from (south of the
     road), the catch net it rolls into, the beach attendant, the warning sign ── */
  {const i=LOM.ball,s=-1;
    const pq=at(i-6,s*(HW+11));LOM.picnic={x:pq.x,z:pq.z};res(pq.x,pq.z,9);
    const tab=rosInst(flat(new THREE.BoxGeometry(1.0,.1,2.4)).translate(0,.82,0),psMat({color:0x8a7a62}),8),bn=rosInst(flat(new THREE.BoxGeometry(.38,.1,2.4)).translate(0,.46,0),psMat({color:0x8a7a62}),16);
    for(const [di,dl] of [[-10,13],[-4,15],[-12,18],[-2,19]]){const q=at(i+di,s*(HW+dl)),yw=yawAt(i);tab.put(q.x,q.y,q.z,yw);for(const sd of [-1,1])bn.put(q.x+Math.cos(yw)*sd*.85,q.y,q.z-Math.sin(yw)*sd*.85,yw);}
    tab.done();bn.done();
    /* a low hedge round the picnic area, open towards the road where the ball gets out */
    const hd=rosInst(flat(new THREE.BoxGeometry(1.4,1.2,SEG*2.2)).translate(0,.6,0),psMat({color:0x4a7a3a}),40);
    for(let k=-18;k<=4;k+=2){const q=at(i+k,s*(HW+22));hd.put(q.x,q.y,q.z,yawAt(i+k));}
    hd.done();
    /* the catch net where the ball ends up */
    const cq=at(i+22,s*(HW+7)),cg=new THREE.Group();cg.position.set(cq.x,cq.y,cq.z);cg.rotation.y=yawAt(i+22);world.add(cg);
    for(const [x,z] of [[-3,-3],[3,-3],[-3,3],[3,3]])hoorBox(cg,.14,3.2,.14,steel,x,1.6,z);hoorMerge(cg);
    const net=psMat({map:pixTex(8,8,c=>{c.strokeStyle='rgba(240,240,236,.9)';c.strokeRect(.5,.5,7,7);}),transparent:true,side:THREE.DoubleSide,depthWrite:false});
    net.uniforms.uMap.value.wrapS=net.uniforms.uMap.value.wrapT=THREE.RepeatWrapping;
    for(const [x,z,ry] of [[0,-3,0],[-3,0,Math.PI/2],[0,3,0]]){const m=new THREE.Mesh(new THREE.PlaneGeometry(6,3.2),net);m.position.set(x,1.6,z);m.rotation.y=ry;cg.add(m);}
    res(cq.x,cq.z,5);LOM.catchAt={x:cq.x,z:cq.z};
    /* the warning sign well before the zone: a triangle with a ball */
    const wq=at(i-34,HW+3.6),wg=new THREE.Group();wg.position.set(wq.x,wq.y,wq.z);wg.rotation.y=yawAt(i-34)+Math.PI;world.add(wg);
    hoorBox(wg,.14,2.4,.14,dark,0,1.2,0);hoorMerge(wg);
    const tri=new THREE.Mesh(new THREE.PlaneGeometry(2,1.8),psMat({map:pixTex(32,28,c=>{c.fillStyle='#d8402a';c.beginPath();c.moveTo(16,0);c.lineTo(32,28);c.lineTo(0,28);c.fill();
      c.fillStyle='#f4f2ec';c.beginPath();c.moveTo(16,5);c.lineTo(27,25);c.lineTo(5,25);c.fill();
      c.fillStyle='#d8402a';c.beginPath();c.arc(16,18,5,0,6.283);c.fill();c.fillStyle='#2f62c8';c.fillRect(11,17,10,2);}),transparent:true,alphaTest:.5,side:THREE.DoubleSide,unlit:true}));
    tri.position.y=3.1;wg.add(tri);const wt=sign('BADBOLL!','#f2c81c','#1e2022',64,1.8,.5,7);wt.position.y=1.9;wg.add(wt);res(wq.x,wq.z,2);
  }

  /* ── Bryggsvängen: the bathing jetty from the beach out over the shallows, its landward end at the
     outside of the bend behind the fencing; BADPLATS signs ── */
  {const i=LOM.jetty,side=-(Math.sign(scurv[i])||1)*-1;           /* the outside of the bend */
    const q0=mainPt(i,side*(HW+10)),dx=-1,dz=0,len=lomSea(q0.x,q0.z)<0?(-lomSea(q0.x,q0.z))+130:130;
    const g=new THREE.Group();g.position.set(q0.x,0,q0.z);g.rotation.y=Math.atan2(dx,dz);world.add(g);
    hoorBox(g,4.4,.3,len,woodL,0,2.1,len/2);
    for(let z=4;z<len;z+=5)for(const s of [-1,1])hoorBox(g,.34,3.4,.34,wood,s*1.9,.6,z);
    for(let z=2;z<len;z+=2.5)for(const s of [-1,1])hoorBox(g,.1,1.1,.1,white,s*2.1,2.8,z);
    for(const s of [-1,1])hoorBox(g,.1,.1,len,white,s*2.1,3.35,len/2);                                /* the rails */
    hoorBox(g,10,.3,10,woodL,0,2.1,len+4);                                                           /* the platform at the end */
    hoorBox(g,3,2.6,3,white,-3,3.5,len+6);hoorBox(g,3.4,.3,3.4,blue,-3,4.9,len+6);                   /* the bathing hut */
    hoorBox(g,1.4,.2,2.6,woodL,2.4,3.4,len+8.4);for(const s of [-1,1])hoorBox(g,.1,1.4,.1,steel,2.4+s*.7,2.7,len+7.2);   /* the diving board */
    hoorMerge(g);res(q0.x,q0.z,6);
    {const fp=new THREE.Mesh(flat(new THREE.CylinderGeometry(.07,.07,6,4)),white);fp.position.set(q0.x-len-4,5.2,q0.z+3.5);world.add(fp);
      const ff=new THREE.Mesh(new THREE.PlaneGeometry(1.8,1.1,4,1),psMat({map:pixTex(8,6,c=>{c.fillStyle='#2f62c8';c.fillRect(0,0,8,6);c.fillStyle='#f2c81c';c.fillRect(2,0,2,6);c.fillRect(0,2,8,2);}),side:THREE.DoubleSide}));
      ff.position.set(q0.x-len-4+.9,7.6,q0.z+3.5);world.add(ff);LOM.anim.flags.push(ff);}
    /* the ladder and a life ring at the landward end */
    const lr=new THREE.Mesh(flat(new THREE.TorusGeometry(.42,.12,4,10)),psMat({color:0xf08a1c}));lr.position.set(q0.x-2,2.6,q0.z+1.8);world.add(lr);
    roadSign(i-16,side,'BADPLATS — EJ DEPÅ','#2f62c8','#f4f2ec',160,4.6);
    /* bathers on the jetty and a scenery ball bobbing beyond the racing area */
    for(let k=0;k<4;k++){const p=lerumNeighbour([0xd8402a,0x2f78d8,0xf2c81c,0xe86a9a][k],[0x3a2a1e,0xd8c08a][k%2],false);
      p.g.position.set(q0.x-20-k*16,2,q0.z+(k%2?.8:-.8));p.g.rotation.y=k*1.3;world.add(p.g);}
    const bb=new THREE.Mesh(flat(new THREE.IcosahedronGeometry(.9,1)),psMat({map:lomBallTex()}));
    bb.position.set(q0.x-48,.6,q0.z+18);world.add(bb);LOM.anim.bob=bb;
  }

  /* ── Sandspåret: the tyre-tracked path behind the dunes, a firm patch midway, GENVÄG? at the fork ── */
  if(SP){const j0=Math.round(SP.n*.44),j1=Math.round(SP.n*.58);
    for(let j=j0;j<=j1;j++)SP.S[j]='lomPackad';                                                     /* the firm patch */
    const pm=psMat({map:roadTex('lomPackad')});pm.polygonOffset=true;pm.polygonOffsetFactor=-2;pm.polygonOffsetUnits=-2;
    const pos=[],uv=[],idx=[];
    for(let j=j0;j<=j1;j++){const a=lanePt(SP,j/(SP.n-1),-SP.hw),b=lanePt(SP,j/(SP.n-1),SP.hw);
      pos.push(a.x,SP.Y[j]+.04,a.z,b.x,SP.Y[j]+.04,b.z);uv.push(0,j*SEG/5,1,j*SEG/5);}
    for(let j=0;j<j1-j0;j++){const p=2*j;idx.push(p,p+1,p+2,p+1,p+3,p+2);}
    const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));geo.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));
    geo.setIndex(idx);geo.computeVertexNormals();world.add(new THREE.Mesh(geo,pm));
    /* the board at the fork */
    const q=lanePt(SP,(COMMIT+3)/(SP.n-1),SP.hw+3),g=new THREE.Group();g.position.set(q.x,meshY(q.x,q.z),q.z);g.rotation.y=q.yaw+Math.PI;world.add(g);
    hoorBox(g,.16,2.6,.16,wood,0,1.3,0);hoorMerge(g);
    const t=sign('GENVÄG?','#c8a060','#3a2a1e',64,2.4,.8,8);t.position.set(0,2.6,0);g.add(t);res(q.x,q.z,2);
  }

  /* ── Vindsurfarrakan: sail racks and flag clusters along the access road, a kite on its anchor ── */
  {const sc=[['#d8402a','#f2c81c','#2f62c8','#3fb0b0','#e86a9a'],['#f2c81c','#3fa04a','#f4f2ec','#d8402a','#2f62c8']];let n=0;
    for(let i=S.vind+14;i<S.back-8;i+=18){const s=-1,q=at(i,s*(HW+7));if(!free(q.x,q.z,5))continue;
      const g=new THREE.Group();g.position.set(q.x,q.y,q.z);g.rotation.y=yawAt(i);world.add(g);
      LOM.anim.sails.push(...lomSailRack(g,sc[n++%2]));res(q.x,q.z,5);}
    /* one tall flag cluster per open sector, to steer by */
    for(const [i,s] of [[S.sweep+50,-1],[S.vind+40,1],[S.back+70,-1],[S.sand0+20,1]]){const q=at(i,s*(HW+12));if(!free(q.x,q.z,4))continue;
      for(let k=0;k<3;k++){const x=q.x+k*2.2,z=q.z+(k%2)*1.4,h=9+k*1.6,p=new THREE.Mesh(flat(new THREE.CylinderGeometry(.08,.1,h,4)),white);p.position.set(x,q.y+h/2,z);world.add(p);
        const fl=new THREE.Mesh(new THREE.PlaneGeometry(1.2,3.4,1,4),psMat({map:pixTex(4,16,c=>{c.fillStyle=['#d8402a','#2f62c8','#f2c81c'][k];c.fillRect(0,0,4,16);c.fillStyle='#f4f2ec';c.fillRect(0,0,4,2);}),side:THREE.DoubleSide}));
        fl.position.set(x+.6,q.y+h-1.9,z);world.add(fl);LOM.anim.flags.push(fl);}
      res(q.x,q.z,5);}
    /* the kite, tugging at a fixed anchor on the dune */
    {const i=S.vind+60,q=at(i,HW+26);if(free(q.x,q.z,3)){const st=hoorBox(new THREE.Group(),.3,.6,.3,dark,0,.3,0);st.parent.position.set(q.x,q.y,q.z);world.add(st.parent);
      const kite=new THREE.Mesh(new THREE.BufferGeometry().setAttribute('position',new THREE.Float32BufferAttribute([0,1.4,0, -1,0,0, 0,-1.6,0, 0,1.4,0, 0,-1.6,0, 1,0,0],3)),
        psMat({color:0xe86a9a,side:THREE.DoubleSide}));kite.geometry.computeVertexNormals();world.add(kite);
      const line=new THREE.Mesh(flat(new THREE.BoxGeometry(.04,.04,1)),dark);world.add(line);
      LOM.anim.kite={kite,line,x:q.x,y:q.y,z:q.z};res(q.x,q.z,3);}}
    /* the crest: a sand-coloured ramp face and the landing marks */
    const J=JUMPS[0];
    if(J){const paint=psMat({color:0xf4f2ec,unlit:true,transparent:true,opacity:.85,depthWrite:false});
      for(const k of [J.dn+6,J.dn+12]){const a=mainPt(J.at+k,0),m=new THREE.Mesh(new THREE.PlaneGeometry(2*HW-2.4,.5).rotateX(-Math.PI/2),paint);
        m.position.set(a.x,sy[a.j]+.06,a.z);m.rotation.y=a.yaw;world.add(m);}}
  }

  /* ── the way back: the flats behind the lawns, the beach-access service bay, a tractor parked
     where it should not be ── */
  {const ft=lomFlatTex(),list=[];
    for(let k=0;k<11;k++){const z=-470+k*62,x=232+H(k,31)*40,L=34+H(k,32)*14,D=16,Ht=11+((k*7)%3)*3.4;
      if(!free(x,z,Math.max(L,D)/2+2))continue;list.push([x,meshY(x,z)-.3,z,Math.PI/2,L,D,Ht]);res(x,z,L/2+3);
      const r=new THREE.Mesh(flat(new THREE.BoxGeometry(D+.8,.7,L+.8)),psMat({color:0x3a3e44}));r.position.set(x,meshY(x,z)+Ht,z);world.add(r);}
    if(list.length)world.add(new THREE.Mesh(borasMergeBoxes(list),psMat({map:ft})));
    /* the same white blocks across the south too, behind the car park */
    const l2=[];for(const [x,z,L] of [[-110,330,40],[-40,336,34],[40,320,38],[120,300,30]]){if(!free(x,z,L/2+2))continue;
      l2.push([x,meshY(x,z)-.3,z,0,L,16,12]);res(x,z,L/2+3);}
    if(l2.length)world.add(new THREE.Mesh(borasMergeBoxes(l2),psMat({map:ft})));
    /* the tractor on the sand by the bathing place */
    const tq=at(S.back+40,-(HW+16));if(free(tq.x,tq.z,4)){const g=new THREE.Group();g.position.set(tq.x,tq.y,tq.z);g.rotation.y=yawAt(S.back+40)+.6;world.add(g);
      hoorBox(g,1.6,1.2,3,psMat({color:0x3f9a3a}),0,1.4,0);hoorBox(g,1.4,1.4,1.4,psMat({color:0x3f9a3a}),0,2.6,-.6);hoorBox(g,1.2,1,1.2,psMat({color:0x2a3440}),0,2.7,-.6);
      for(const [x,z,r] of [[-1,1.1,.6],[1,1.1,.6],[-1,-.9,1],[1,-.9,1]]){const w=new THREE.Mesh(flat(new THREE.CylinderGeometry(r,r,.5,8)).rotateZ(Math.PI/2),dark);w.position.set(x,r,z);g.add(w);}
      hoorMerge(g);res(tq.x,tq.z,4);}
  }

  /* ── Glasskiosken: the kiosk on the outside of the first bend, its menu board, café furniture
     and the crowd behind barriers ── */
  {const i=LOM.kioskAt,side=-(Math.sign(scurv[i])||1)*-1,q=at(i,side*(HW+9)),g=new THREE.Group();
    g.position.set(q.x,q.y,q.z);g.rotation.y=yawAt(i)+(side>0?-Math.PI/2:Math.PI/2);world.add(g);
    hoorBox(g,6,3.4,4.4,psMat({color:0xf4e0e8}),0,1.7,0);hoorBox(g,6.6,.4,5,psMat({color:0xe86a9a}),0,3.6,0);
    hoorBox(g,3.2,1.2,.1,psMat({color:0x3a4a5a}),0,2,2.22);hoorBox(g,3.6,.12,.8,white,0,1.36,2.5);
    const cone=new THREE.Mesh(flat(new THREE.ConeGeometry(.6,1.8,6)).rotateX(Math.PI),psMat({color:0xd8a050}));cone.position.set(0,4.9,0);g.add(cone);
    const scoop=new THREE.Mesh(flat(new THREE.IcosahedronGeometry(.75,0)),psMat({color:0xf8f2e0}));scoop.position.set(0,6.1,0);g.add(scoop);
    hoorMerge(g);
    const t=sign('GLASSKIOSKEN','#e86a9a','#f4f2ec',112,5,.8,8);t.position.set(0,3.6,2.56);g.add(t);
    /* the menu board: MJUKGLASS, and the hand-painted line under it */
    const mb=new THREE.Group(),mq=at(i-8,side*(HW+4.4));mb.position.set(mq.x,mq.y,mq.z);mb.rotation.y=yawAt(i-8)+Math.PI;world.add(mb);
    hoorBox(mb,.14,2.8,.14,dark,-1.5,1.4,0);hoorBox(mb,.14,2.8,.14,dark,1.5,1.4,0);hoorMerge(mb);
    const m1=sign('MJUKGLASS','#f4f2ec','#e86a9a',96,3.4,.9,10);m1.position.set(0,2.8,0);mb.add(m1);
    const m2=sign('EFTER MÅLGÅNG','#f2c81c','#1e2022',112,3,.5,7);m2.position.set(.2,2.15,.02);m2.rotation.z=-.05;mb.add(m2);
    res(q.x,q.z,7);res(mq.x,mq.z,2.5);
    /* café furniture and spectators behind the barrier, well back from the line */
    const bar=rosInst(flat(new THREE.BoxGeometry(.12,1,SEG*2.6-.2)).translate(0,.5,0),psMat({}),40,true);let n=0;
    for(let k=i-24;k<i+30;k+=3){if(Math.abs(k-i)<6)continue;const bq=at(k,side*(HW+5.2));if(!free(bq.x,bq.z,4.6))continue;
      bar.put(bq.x,bq.y,bq.z,yawAt(k),1,1,1,((k/3)|0)%2?0xf4f2ec:0xe86a9a);
      if(H(k,33)>.4){const pq=at(k+H(k,34),side*(HW+7+H(k,35)*2)),p=lerumNeighbour([0xd8402a,0x2f78d8,0xf2c81c,0x3fa04a,0xe86a9a][n++%5],[0x3a2a1e,0xd8c08a,0xe8d8a8][n%3],false);
        p.g.position.set(pq.x,pq.y,pq.z);p.g.rotation.y=yawAt(k)-side*Math.PI/2;world.add(p.g);LOM.anim.towels.push({wave:p.g,ph:H(k,36)*6});}}
    bar.done();
  }

  /* ── round the bay: dune grass, the low pines and scrub inland ── */
  {const MG=1300,grass=rosInst(flat(new THREE.ConeGeometry(.5,1.4,4)).translate(0,.7,0),psMat({}),MG,true);
    for(let n=0,g=0;n<MG&&g<30000;g++){const x=rand(-640,320),z=rand(-700,420),d=lomSea(x,z);
      if(d>-22||d<-260||latAt(x,z)<HW+5||lomInPark(x,z,4)||nearAlt(x,z,4))continue;
      if(lomDunes(x,z)<.5&&hash2(x*.1,z*.1)>.25)continue;
      let ok=true;for(const r of RES)if(Math.hypot(x-r[0],z-r[1])<r[2]){ok=false;break;}if(!ok)continue;
      const s=rand(.7,1.5);grass.put(x,meshY(x,z)-.1,z,rand(0,6),s,s*rand(.8,1.4),s,[0x9ea35a,0xa8ac64,0x8e9a52][n%3]);n++;}
    grass.done();
    const TN=360,trT=rosInst(flat(new THREE.CylinderGeometry(.25,.35,4,5)).translate(0,2,0),psMat({color:0x5a4632}),TN),trC=rosInst(flat(new THREE.IcosahedronGeometry(3.4,0)).translate(0,5.4,0),psMat({}),TN,true);
    let n=0;for(let guard=0;guard<12000&&n<TN;guard++){const x=rand(-300,600),z=rand(-760,460);
      if(lomSea(x,z)>-150||!free(x,z,8))continue;
      if(x>-190&&x<130&&z>-470&&z<180&&hash2(x*.2,z*.2)<.7)continue;                               /* the dunes inside the lap stay open */
      const s=rand(.8,1.3),y=meshY(x,z);trT.put(x,y,z,0,s,s,s);trC.put(x,y,z,rand(0,3),s*1.1,s*rand(.7,1),s*1.1,[0x2f5a2a,0x3a6a32,0x46763a][Math.floor(hash2(x,z)*30)%3]);res(x,z,3);n++;}
    trT.done();trC.done();
  }
}

/* the beach ball, the surf, the speaker and the beach moving */
const lomBallTex=()=>pixTex(16,16,c=>{const cs=['#d8402a','#f4f2ec','#2f62c8','#f2c81c'];for(let k=0;k<4;k++){c.fillStyle=cs[k];c.fillRect(k*4,0,4,16);}
  c.fillStyle='#f4f2ec';c.fillRect(0,0,16,2);});
/** the attendant's warning: a rubbery double squeak, kept short */
function lomSqueak(vol){if(!actx)return;audioTone(900,1100,.07,.05*(vol||1),'triangle');audioTone(950,1100,.09,.05*(vol||1),'triangle',.11);}
/** the ball landing: a soft hollow boing */
function lomBoing(vol){if(!actx)return;audioTone(240,110,.24,.08*(vol||1),'sine');}
/** a gull far off, now and then */
function lomGull(vol){if(!actx)return;audioTone(1050,780,.16,.018*(vol||1),'triangle');audioTone(1000,760,.18,.016*(vol||1),'triangle',.22);}
/** the surf: brown noise through a low-pass, swelling slowly, louder near the water. Each update
    holds it up for half a second, so it fades out by itself off this stage, in a pause or a menu */
function lomSurf(on,near,duck){
  if(!actx||muted)return;
  if(!LOM.surf){
    const len=actx.sampleRate*3,buf=actx.createBuffer(1,len,actx.sampleRate),d=buf.getChannelData(0);
    let b=0;for(let i=0;i<len;i++){b=(b+.02*(Math.random()*2-1))/1.02;d[i]=b*3.2;}
    const src=actx.createBufferSource();src.buffer=buf;src.loop=true;
    const lp=actx.createBiquadFilter();lp.type='lowpass';lp.frequency.value=520;lp.Q.value=.4;
    const g=actx.createGain();g.gain.value=0;src.connect(lp);lp.connect(g);g.connect(audioOutput());src.start();
    LOM.surf={g,lp};
  }
  const t=actx.currentTime,swell=.6+.4*Math.sin(t*.55)*Math.sin(t*.21+1),v=on?.05*(.35+.65*near)*swell*(duck?.35:1):0;
  const G=LOM.surf.g.gain;G.cancelScheduledValues(t);G.setTargetAtTime(v,t,.25);G.setTargetAtTime(0,t+.5,.3);
  LOM.surf.lp.frequency.setTargetAtTime(380+260*swell,t,.4);
}

/* the beach ball's path: it bounces out of the picnic area on the south side of the approach,
   forward and across to just past the middle of the road, then rolls back into the catch net
   further along. The north side (lat > clear) is always open. Points are [sample offset, lat]. */
const LOM_BALL={R:2.2,period:10,phase:2,warn:.14,live:.62,
  path:[[-6,-20],[-1,-9],[4,-3.2],[9,.6],[14,-3.6],[18,-9],[22,-16]],clear:.6+2.2+1.2,on:false,active:false,lat:-20};
/** the AI line round the ball, and the firm line through Sandkurvan for the karts not built for sand */
function lomDodge(k,t,L){
  const B=LOM_BALL,i=LOM.ball;
  if(B.active&&!TT){const d=((i-k.si)%N+N)%N;if(d<22||N-d<8)return Math.max(L,B.clear+.6);}   /* only round the ball itself */
  const s=MSIDE[t];                                                  /* a road kart keeps off a sandy half */
  if(s&&MAINS[t]==='sand'&&k.offRoad<.8)return s>0?Math.min(L,-1.5):Math.max(L,1.5);
  return L;
}

function hazardsLomma(H){
  vastPA();
  LOM.said={start:false,towel:false,cow:false,kiosk:false,ball:false,lap:0,gullT:0};
  /* milk cartons on the clean exit of the start bend onto the promenade, and before the crest */
  for(const [i,l] of [[LOM.sec.prom+6,3],[LOM.sec.prom+12,1.5],[LOM.sec.prom+18,0]])addItem('milk',i,l);
  for(const [i,l] of [[LOM.sec.vind+6,-2.5],[LOM.sec.vind+10,0],[LOM.sec.vind+14,2.5]])addItem('milk',i,l);
  /* den stora badbollen: the attendant points and squeaks, the landing shadow shows the next
     bounce, the ball follows the same path every time and rolls into the catch net */
  {const B=LOM_BALL,i=LOM.ball,R=B.R,P=B.path,hops=P.length-1;
    const pt=([di,l])=>{const q=mainPt(i+di,l);q.y=Math.abs(l)<HW+1?q.y:meshY(q.x,q.z);return q;};
    const ball=new THREE.Mesh(flat(new THREE.IcosahedronGeometry(R,1)),psMat({map:lomBallTex()}));world.add(ball);
    const shadow=new THREE.Mesh(new THREE.CircleGeometry(1,16).rotateX(-Math.PI/2),psMat({color:0x2a2418,transparent:true,opacity:.45,depthWrite:false}));world.add(shadow);
    const ringM=psMat({color:0xd8402a,unlit:true,transparent:true,opacity:.9,depthWrite:false});
    const ring=new THREE.Mesh(new THREE.RingGeometry(.86,1,20).rotateX(-Math.PI/2),ringM);world.add(ring);
    /* the beach attendant on a little platform with a red flag: the warning you can see */
    const aq=pt([-12,-(HW+6)]),ag=new THREE.Group();ag.position.set(aq.x,aq.y,aq.z);ag.rotation.y=Math.atan2(rx[i],rz[i]);world.add(ag);
    hoorBox(ag,2.4,1,2.4,psMat({color:0xc8a878}),0,.5,0);hoorMerge(ag);
    const at_=lerumNeighbour(0xd8402a,0xd8c08a,false);at_.g.position.y=1;ag.add(at_.g);
    const arm=new THREE.Group();arm.position.set(.38,2.3,0);at_.g.add(arm);hoorBox(arm,.16,.16,.9,psMat({color:0xd8402a}),0,0,.45);
    const fl=new THREE.Mesh(new THREE.PlaneGeometry(.9,.6),psMat({color:0xd8402a,side:THREE.DoubleSide,unlit:true}));fl.position.set(0,.3,.95);arm.add(fl);
    let lastHop=-1,tick=0;
    H.push({id:'badboll',period:B.period,phase:B.phase,mesh:ball,
      update(u,dt){
        const warn=u<B.warn,live=u>=B.warn&&u<B.live,v=clamp((u-B.warn)/(B.live-B.warn),0,1),n=Math.min(hops-1,Math.floor(v*hops)),t=v*hops-n;
        let p=P[0],h=0,next=P[1];
        if(live){p=[lerp(P[n][0],P[n+1][0],t),lerp(P[n][1],P[n+1][1],t)];h=Math.sin(Math.PI*t)*(n>=hops-2?1.2:4.2);next=P[n+1];}
        else if(!warn)p=P[hops];                                                                     /* resting in the net */
        const q=pt(p);ball.position.set(q.x,q.y+R+h+(warn?Math.abs(Math.sin(clock*4))*.5:0),q.z);
        ball.rotation.set(live?-v*9:0,q.yaw,0);
        const s=pt(next),show=warn||live;
        shadow.visible=ring.visible=show;
        if(show){const k=live?clamp(1-h/4.2,0,1):.5;shadow.position.set(s.x,s.y+.06,s.z);shadow.scale.setScalar(R*(.6+.5*k));
          shadow.material.uniforms.uOpacity.value=.2+.4*k;ring.position.set(s.x,s.y+.08,s.z);ring.scale.setScalar(R+.6);
          ringM.uniforms.uOpacity.value=.5+.4*Math.abs(Math.sin(clock*8));}
        arm.rotation.x=show?-1.4+Math.sin(clock*9)*.25:-.1;                                          /* points and waves the flag */
        B.lat=p[1];B.on=live;B.active=warn||live;
        const near=player&&Math.hypot(player.x-q.x,player.z-q.z)<130&&state==='race';
        tick-=dt||0;if(near&&warn&&tick<=0){tick=.7;lomSqueak(.8);LOM.duck=clock+1;}
        if(live&&n!==lastHop){if(near&&lastHop>=0)lomBoing(.6);lastHop=n;}
        if(!live)lastHop=-1;
        this.cyc=raceSeed+'/'+Math.floor((raceTime+B.phase)/B.period);   /* a new race starts its own count */
        this.p={x:ball.position.x,y:q.y,z:ball.position.z};this.low=live&&h<2.6;
      },
      /* one shove per bounce sequence: a kart it has hit this time round is left alone */
      hit(k){if(TT||k.rib||k.air||!this.low||k.lomBall===this.cyc)return false;
        const dx=k.x-this.p.x,dz=k.z-this.p.z;return dx*dx+dz*dz<(R+1.1)*(R+1.1)&&Math.abs(k.y-this.p.y)<2.8;},
      /* a mild shove sideways, away from the ball and towards the open side, and a short slowdown */
      effect(k){k.lomBall=this.cyc;
        const j=((Math.round(k.si)%N)+N)%N,s=k.lat>=B.lat?1:-1,push=s>0?4.2:2.4;               /* towards the open side harder */
        k.vx*=.8;k.vz*=.8;k.vx+=rx[j]*s*push;k.vz+=rz[j]*s*push;k.vy=Math.max(k.vy,2.6);k.air=true;
        k.slow=Math.max(k.slow,.3);k.boost=0;k.drift=0;k.charge=0;
        for(let n=0;n<12;n++){const c=[[.85,.25,.16],[.95,.95,.92],[.18,.38,.78],[.95,.78,.1]][n%4];puff(k.x+rand(-1.2,1.2),k.y+rand(.4,1.8),k.z+rand(-1.2,1.2),c[0],c[1],c[2],.6);}
        if(k===player){toast('BADBOLLEN!');lomBoing(1.2);shake=Math.min(1,shake+.3);
          if(!LOM.said.ball){LOM.said.ball=true;setTimeout(()=>{if(state==='race')vastPA('Badbollen deltar inte i mästerskapet.');},700);}}}});
  }
  /* the beach: sails, flags, towels, the gull and its chip, the kite, the bobbing ball, the sea;
     the surf and the gulls; the speaker's lines, each once a race */
  H.push({id:'lommaStrand',period:1,phase:0,
    update(u,dt){
      if(stage.id!=='lomma')return;
      const A=LOM.anim,D=LOM.said;
      if(A){for(const s of A.sails)s.rotation.z=Math.sin(clock*1.3+s.position.x)*.08;
        for(const f of A.flags){const pa=f.geometry.attributes.position;for(let v=0;v<pa.count;v++){const x=pa.getX(v)+.9;pa.setZ(v,Math.sin(clock*5+x*2)*.16*x);}pa.needsUpdate=true;}
        for(const t of A.towels){if(t.m)t.m.rotation.x=Math.sin(clock*3+t.ph)*.25;if(t.wave)t.wave.position.y+=(Math.abs(Math.sin(clock*4+t.ph))*.12-(t.wave.userData.h||0));if(t.wave)t.wave.userData.h=Math.abs(Math.sin(clock*4+t.ph))*.12;}
        if(A.gull){const c=(clock*.4)%1,hop=c<.15?Math.sin(c/.15*Math.PI)*.5:0;A.gull.g.position.y=A.gull.y+.9+hop;A.gull.chip.visible=c>.12&&c<.7;}
        if(A.kite){const K=A.kite,kx=K.x+Math.sin(clock*.7)*3,ky=K.y+16+Math.sin(clock*1.1)*1.5,kz=K.z-8+Math.cos(clock*.5)*2;
          K.kite.position.set(kx,ky,kz);K.kite.rotation.set(0,clock*.2,Math.sin(clock*1.7)*.3);
          const dx=kx-K.x,dy=ky-K.y,dz=kz-K.z,L=Math.hypot(dx,dy,dz);K.line.position.set((kx+K.x)/2,(ky+K.y)/2,(kz+K.z)/2);K.line.scale.set(1,1,L);K.line.lookAt(kx,ky,kz);}
        if(A.bob){A.bob.position.y=.5+Math.sin(clock*1.6)*.25;A.bob.rotation.y=clock*.4;}
        for(const g of A.glints){const b=Math.sin(clock*1.2+g.ph);g.m.visible=b>-.2;g.m.position.x=g.x+Math.sin(clock*.3+g.ph)*2;}
        for(const w of A.wave){w.m.position.x=w.x+Math.sin(clock*.8+w.z*.05)*1.6;}
        for(const b of A.boats){b.g.position.z=b.z+Math.sin(clock*.05+b.ph)*30;b.g.rotation.z=Math.sin(clock*.9+b.ph)*.06;}}
      /* the surf, louder near the water; ducked under the ball's warning */
      const racing=(state==='race'||state==='grid'||state==='over')&&!paused;
      if(player){const d=lomSea(player.x,player.z);lomSurf(racing,clamp(1-(-d-20)/260,0,1),(LOM.duck||0)>clock);}
      if(racing&&player&&clock>D.gullT){D.gullT=clock+9+Math.random()*12;if(lomSea(player.x,player.z)>-220)lomGull(.8);}
      if(!player||state!=='race'||raceTime<.5)return;
      if(D.lap>1&&raceTime<1)Object.assign(D,{start:false,towel:false,cow:false,kiosk:false,ball:false,lap:0});   /* a restart */
      D.lap=Math.max(D.lap,player.lap);
      if(!D.start&&raceTime>4){D.start=true;vastPA('Föraren till traktorn ombeds lämna badplatsen.');}
      const sec=lomSec(player.si);
      if(!D.towel&&player.lap===2&&sec==='prom'){D.towel=true;vastPA('Det är inte tillåtet att reservera racinglinjen med en handduk.');}
      if(!D.cow&&player.lap>=2&&sec==='vind'&&karts.some(k=>!k.parked&&(k.cfg.kind==='cow'||k===player&&CHARS[charSel].id==='cow'))){D.cow=true;vastPA('Majros, mjölken ska inte stå i solen.');}
      if(!D.kiosk&&player.lap===LAPS&&sec==='kiosk'){D.kiosk=true;vastPA('Den som tappat en spettekaka vid glasskiosken behöver inte hämta den.');}
    }});
}

/** the stage's postcard, for the picnic passport: the roster's beach picnic. Bodil has claimed the
    biggest towel, Carl counts his pigs, Victor draws racing lines in the sand with a stick.
    Drawn on a 192 x 120 canvas, shown pixelated. */
function lommaPostcard(g,w,h){
  const R=(c,x,y,a,b)=>{g.fillStyle=c;g.fillRect(x,y,a,b);};
  R('#7ec0ec',0,0,w,40);R('#a8d8f0',0,30,w,10);                                                   /* the sky */
  R('#3c8eb4',0,40,w,10);R('#6cc0c4',0,48,w,6);                                                    /* the sea */
  R('#f4f2ec',30,34,2,8);R('#f4f2ec',28,40,8,2);R('#d8402a',150,32,2,10);R('#f4f2ec',147,41,8,2);  /* two sails */
  R('#8a6a46',96,42,60,2);for(let x=98;x<156;x+=6)R('#6a4a2e',x,44,1,4);                          /* the jetty */
  R('#ead9ac',0,54,w,66);for(let i=0;i<70;i++)R('rgba(200,176,124,.6)',(i*37)%w,56+(i*13)%60,2,1);  /* the sand */
  /* the biggest towel, red and white, and Bodil spread out across it */
  R('#d8402a',14,74,52,26);for(let x=14;x<66;x+=8)R('#f4f2ec',x,74,4,26);
  R('#c8873c',24,80,30,12);R('#a86a2c',20,78,10,10);R('#7a4a1e',18,80,4,9);R('#7a4a1e',29,80,4,9);R('#1e1c1c',23,82,2,2);R('#3fb0b0',30,88,10,3);
  /* Carl counting pigs: green, cap, a finger up, four pink piglets in a row */
  R('#7c9468',80,70,12,22);R('#e8bc98',81,60,10,10);R('#c8a040',80,58,12,4);R('#e8bc98',92,66,2,6);
  for(let k=0;k<4;k++){R('#f0b0b0',98+k*10,86,8,6);R('#e08a9a',104+k*10,86,2,2);R('#1e1c1c',99+k*10,87,1,1);}
  /* Victor in white overalls with a stick, racing lines drawn in the sand */
  R('#f4f2ec',150,66,12,24);R('#e8bc98',151,56,10,10);R('#1a1c20',150,54,12,4);
  g.strokeStyle='#6a4a2e';g.lineWidth=2;g.beginPath();g.moveTo(162,74);g.lineTo(172,96);g.stroke();
  g.strokeStyle='#a88a5a';g.lineWidth=1;g.beginPath();g.moveTo(124,108);g.bezierCurveTo(140,96,158,112,176,100);g.moveTo(124,112);g.bezierCurveTo(140,102,158,118,176,106);g.stroke();
  /* a picnic basket, a cordial bottle and a parasol */
  R('#b88a52',66,94,14,10);R('#8a6034',68,90,10,2);R('#d8402a',84,92,3,10);R('#f4f2ec',84,90,3,2);
  R('#f2c81c',120,40,30,6);R('#2f62c8',126,40,6,6);R('#2f62c8',138,40,6,6);R('#2a2c30',134,46,2,24);
  g.fillStyle='#fff';g.font='bold 10px "Titillium Web",sans-serif';g.textAlign='left';g.fillText('Hälsningar från Lomma!',5,115);
  g.lineWidth=2;g.strokeStyle='#fff';g.strokeRect(1,1,w-2,h-2);
}
