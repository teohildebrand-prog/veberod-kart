"use strict";
/* ───────── Avenyn ───────── */
/* Avenyruset: Kapten Mås's home track, round one of Göteborgscupen. A fictional Göteborg boulevard
   in the early-evening sun: down the broad avenue toward the cultural square and its fountain,
   along the café street, down the parallel street to the tram plaza and round the far boulevard
   turnaround, then home along the second boulevard. Tram wires overhead, long shadows, gulls. */
ROADTEX.avenyn=()=>pixTex(64,64,g=>{                 /* evening tarmac: warm grey, the low sun in the grain */
  g.fillStyle='#4a494c';g.fillRect(0,0,64,64);
  for(let i=0;i<700;i++){g.fillStyle=Math.random()>.5?'rgba(128,122,118,.3)':'rgba(30,30,34,.3)';
    g.fillRect((Math.random()*64)|0,(Math.random()*64)|0,1,1);}
  g.fillStyle='rgba(232,180,120,.07)';for(let i=0;i<4;i++)g.fillRect(0,(Math.random()*64)|0,64,3);
});
ROADTEX.avenynSten=()=>pixTex(64,64,g=>{             /* the alley: small reddish setts in a herringbone */
  g.fillStyle='#5a4c44';g.fillRect(0,0,64,64);
  for(let y=0;y<64;y+=4)for(let x=0;x<64;x+=8){const o=(y/4)%2?4:0,v=118+((Math.random()*40)|0);
    g.fillStyle='rgb('+v+','+(v-22)+','+(v-36)+')';g.fillRect((x+o)%64,y,7,3);}
  g.fillStyle='rgba(0,0,0,.18)';for(let i=0;i<6;i++)g.fillRect((Math.random()*60)|0,(Math.random()*60)|0,4,3);
});
VERGEC.avenyn=['#a49e94','#bcb6aa','#7e786e'];         /* granite kerbs and pale paving */
GROUND.avenyn={cell:22,stripe:0.9,verge:0x9e988e,
  cols:[0xa09a90,0xaca698,0x928c82,0x6e8c4e,0xb2aa9a,0x968e82,0x628248]};

STAGES.push({ id:'avenyn', group:'goteborg', name:'AVENYN', sub:'AVENYRUSET',
  order:24, tag:'Kvällssol, spårvagnar och uteserveringar. Tre varv nerför avenyn, runt fontänen och över spårvagnsplatsen. Spårvagnen väjer inte. Den har tidtabell.',
  view:{i:690,lat:-4,h:3.4,to:{i:60,lat:2,h:5},fov:60},
  hw:8.6,
  bars:[0.85,0.6,0.65], laps:3, bankGain:0.14, bankMax:0.18,     /* city streets: hardly banked */
  blurb:'Kapten Mås\'s home track, round one of Göteborgscupen: three laps of a fictional Göteborg boulevard in the early-evening sun, with tram wires overhead and long shadows across the road. Launch down the broad avenue toward the cultural square and its sweeping fountain, thread the kinks past the café terraces, brake hard for the square corner and run down the parallel street to the tram plaza, where a slow tram crosses the outside line on its timetable while the inside stays open. Round the far boulevard turnaround and come home along the second boulevard over a small event ramp. Behind the café terraces is a narrow paved alley; the concert loading lane cuts the plaza with two tight turns.',
  role:'Breda boulevarder i kvällssol, kafékurvor, en fontän och en spårvagn som inte väntar på någon.',
  sky:[0xf6bc86,0x4a6eb0], fog:[0xeec09a,90,380], amb:0x6e6476, dif:0xffd4a0,
  road:'avenyn', verge:'avenyn', edge:'avenyn', ground:'avenyn',
  terrain:{size:840,seg:120},
  /* a flat town: the rolling Skåne ground ironed out */
  mod:(x,z,t)=>-rolls(x,z)*t*0.9,
  land:(x,z,out)=>landAvenyn(x,z,out),
  jumpSpec:[{at:585,h:2.4,drop:1.6,up:10,dn:6,rec:14}],
  ctrl:[[-220,3,60],[-220,3,0],[-220,3,-60],[-217,4,-110],[-204,4,-150],[-178,4,-182],[-140,4,-200],[-100,4,-206],
        [-70,4,-206],[-48,4,-198],[-26,4,-198],[-4,4,-208],[18,4,-206],[32,4,-196],[38,4,-176],[38,3,-120],[38,3,-60],[38,2,0],
        [38,2,50],[38,2,96],[44,2,116],[62,2,127],[92,2,130],[140,2,130],[190,2,130],[222,2,134],[246,2,152],[256,2,180],[248,2,208],[224,2,226],[190,2,232],
        [140,2,232],[60,2,232],[-30,2,232],[-120,3,232],[-176,3,228],[-206,3,212],[-219,3,180],[-220,3,120]],
  stations:[[0.05,-1],[0.678,1]],
  routes:[
    {id:'utes',name:'BAKOM UTESERVERINGEN',a:145,b:250,hw:4.0,side:1,lead:16,leadLat:11,
     mid:[[0.5,4]],surface:'road',tex:'avenynSten',risk:0.3,
     blurb:'A narrow paved alley behind the café terraces, between the tables and the kitchens. It saves a lot of road, but brake early for the way out and keep it clean.'},
    {id:'scen',name:'SCENLEVERANSEN',a:278,b:390,hw:4.2,side:-1,lead:16,leadLat:10,
     mid:[[0.5,4]],surface:'road',tex:'concrete',risk:0.3,
     blurb:'The concert loading lane behind the open-air stage, between flight cases and trucks. Two tight turns, one each end: not a speed tunnel, but it misses the tram plaza.'}],
  stamps:[
    {id:'av1',dish:'Räkmacka',ini:'R',kind:'intro',route:'main',i:362,lat:-5.5,
     hint:'På den breda platsen efter spårvagnsspåret, vid kaféborden.',
     story:'Half a slice of bread piled high with hand-peeled prawns, sliced egg, mayonnaise, lettuce, lemon and a sprig of dill, built so tall it needs a knife and fork. Every café on the avenue serves one, and every gull in town knows exactly which tables they land on.'},
    {id:'av2',dish:'Chokladboll',ini:'C',kind:'route',route:'scen',f:0.5,lat:0,
     hint:'Mitt i Scenleveransen, bakom scenen.',
     story:'Oats, sugar, butter and cocoa with a splash of cold coffee, kneaded into a sticky dough and rolled into balls in pearl sugar or coconut. No oven needed, which is why the stage crew keeps a box of them in the loading-bay fridge for the long wait before the show.'},
    {id:'av3',dish:'Päronsaft',ini:'P',kind:'air',route:'main',jump:0,after:5,lat:0,air:4.2,
     hint:'Högt över eventrampen på andra boulevarden.',
     story:'Pear cordial: ripe pears simmered with sugar and a squeeze of lemon, strained and bottled, then diluted with cold water in a tall glass. Pale gold and tasting of somebody\'s garden, it is sold in paper cups from a cart beside the ramp.'}],
  postcard:{draw:(g,w,h)=>avenynPostcard(g,w,h),
    caption:'Hon tittade upp från tidningen. Sedan läste hon vidare.'},
  hazards:H=>hazardsAvenyn(H), scenery:()=>sceneryAvenyn()
});

/* where the set pieces sit, worked out from the samples once the track is laid */
const AVENYN_TRAM={i0:312,i1:356,lat:5.2}, AVENYN_FOUNT=100, AVENYN_CAFE=[150,192];
/** the fixed spots, once per laid track: the fountain, the museum, the tram stops, the stage */
function avenynSpots(){
  const key=sx[100]+','+sz[300];if(AVENYN.key===key)return AVENYN.spot;
  const at=(i,o)=>mainPt(i,o);
  const F=at(AVENYN_FOUNT,-(HW+30)),M=at(AVENYN_FOUNT-4,-(HW+64));
  const S=ALTS.find(r=>r.id==='scen');
  let st=null;
  if(S){const q=lanePt(S,.55,0),m=mainPt(334,0);st={x:lerp(m.x,q.x,.5),z:lerp(m.z,q.z,.5)};
    st.yaw=Math.atan2(m.x-q.x,m.z-q.z);}
  AVENYN.key=key;AVENYN.spot={F,M,st};
  return AVENYN.spot;
}
function landAvenyn(x,z,out){
  if(stage.id!=='avenyn')return;
  const P=avenynSpots(),F=P.F,d=Math.hypot(x-F.x,z-F.z);
  if(d<30){out.setHex(d<9?0x6a8aa0:(Math.floor(d/3)&1?0xc8bca4:0xb8ac94));return;}   /* the square: rings of pale stone */
  if(P.st&&Math.hypot(x-P.st.x,z-P.st.z)<34){out.setHex(Math.floor((x+z)/4)&1?0x8c8680:0x96908a);return;}    /* the stage plaza */
}

/* the edge: low event barriers in the cup's colours, a banner panel on every other block */
EDGES.avenyn=st=>{
  const step=2,L=SEG*step+.1;
  const base=rosInst(flat(new THREE.BoxGeometry(.8,.9,L)).translate(0,.45,0),psMat({color:0xb4b0a6}),N*2);
  const band=rosInst(flat(new THREE.BoxGeometry(.12,.7,L-.3)).translate(0,.35,0),psMat({}),N*2,true);
  const cols=[0x2a5aa8,0xf2c81c,0xf4f2ec,0x2a5aa8];
  for(let i=0;i<N;i+=step)for(const side of [-1,1]){
    if(side>0&&i>AVENYN_TRAM.i0-2&&i<AVENYN_TRAM.i1+2)continue;        /* the tram crosses into the plaza here */
    const o=side*(HW+4.3),x=sx[i]+rx[i]*o,z=sz[i]+rz[i]*o;
    if(nearAlt(x,z,2.6))continue;
    if(stations.some(S=>{let d=i-S.at;if(d<-N/2)d+=N;else if(d>N/2)d-=N;return S.side===side&&d>-3&&d<S.len+3;}))continue;
    const y=meshY(x,z),yw=Math.atan2(fx[i],fz[i]);
    base.put(x,y-.05,z,yw);
    if((i/step)%2===0)band.put(x-rx[i]*side*.46,y+.95,z-rz[i]*side*.46,yw,1,1,1,cols[(i/step/2)%4]);
  }
  base.done();band.done();
};

/** a herring gull, standing; nose along +z, feet at y=0 (for instancing: body, wings, beak) */
function avenynGullGeos(){
  const body=new THREE.BoxGeometry(.32,.3,.62);body.translate(0,.42,0);
  const head=new THREE.BoxGeometry(.22,.22,.24);head.translate(0,.66,.3);
  const b=flat(body),h=flat(head);
  const merge=(list)=>{const pos=[],nor=[];for(const g of list){pos.push(...g.attributes.position.array);nor.push(...g.attributes.normal.array);}
    const o=new THREE.BufferGeometry();o.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));
    o.setAttribute('normal',new THREE.Float32BufferAttribute(nor,3));return o;};
  const wing=flat(new THREE.BoxGeometry(.36,.12,.56).translate(0,.5,-.06));
  const tail=flat(new THREE.BoxGeometry(.2,.06,.22).translate(0,.5,-.4));
  const beak=flat(new THREE.BoxGeometry(.07,.07,.16).translate(0,.64,.48));
  const legs=flat(new THREE.BoxGeometry(.18,.28,.05).translate(0,.14,0));
  return {white:merge([b,h]),grey:merge([wing,tail]),yellow:merge([beak,legs])};
}
function sceneryAvenyn(){
  const RES=[];
  const res=(x,z,r)=>RES.push([x,z,r]);
  const free=(x,z,pad)=>{
    if(latAt(x,z)<HW+pad)return false;
    for(const r of RES)if(Math.hypot(x-r[0],z-r[1])<r[2])return false;
    return true;
  };
  const at=(i,o)=>{const q=mainPt(i,o);q.y=meshY(q.x,q.z);return q;};
  const yawAt=i=>{i=((i%N)+N)%N;return Math.atan2(fx[i],fz[i]);};
  const Hs=(a,b)=>hash2(a*1.37+3.1,b*0.71-2.3);
  const U=ALTS.find(r=>r.id==='utes'),S=ALTS.find(r=>r.id==='scen');
  const sign=(text,bg,fg,w,h,pw,ph,px,border)=>new THREE.Mesh(new THREE.PlaneGeometry(pw,ph),
    psMat({map:lerumSignTex(text,bg,fg,w,h,px,border),unlit:true,side:THREE.DoubleSide}));
  const grey=psMat({color:0x8a9096}),dark=psMat({color:0x2a2c30}),white=psMat({color:0xf2efe6}),
    stone=psMat({color:0xd8ccb4}),green=psMat({color:0x2f5a3a});
  const P=avenynSpots();
  AVENYN.anim=[];AVENYN.gulls=[];AVENYN.tram=avenynTramLine();
  for(const S_ of stations){const q=mainPt(S_.at+6,S_.side*(HW+13));res(q.x,q.z,24);}
  {const q=mainPt(0,HW+20);res(q.x,q.z,30);}                       /* the grandstand */
  /* the open squares: the cultural square outside the first corner, the tram plaza outside the second */
  for(let i=AVENYN_FOUNT-30;i<=AVENYN_FOUNT+30;i+=4)for(const o of [14,30,46]){const q=mainPt(i,-(HW+o));res(q.x,q.z,10);}
  for(let i=AVENYN_TRAM.i0-4;i<=AVENYN_TRAM.i1+4;i+=4)for(const o of [10,22]){const q=mainPt(i,HW+o);res(q.x,q.z,9);}
  const shadows=[];                                                /* long evening shadows: [x,z,len,width] */

  /* the low sun in the west, behind the town */
  {const sun=new THREE.Mesh(new THREE.CircleGeometry(26,24),new THREE.MeshBasicMaterial({color:0xffe6b0,fog:false}));
    sun.position.set(-700,70,-60);sun.lookAt(0,0,-60);world.add(sun);
    const halo=new THREE.Mesh(new THREE.CircleGeometry(48,24),new THREE.MeshBasicMaterial({color:0xffc890,transparent:true,opacity:.35,fog:false,depthWrite:false}));
    halo.position.set(-701,70,-60);halo.lookAt(0,0,-60);world.add(halo);}

  /* the finish: a cup gantry over the avenue, MÅL on the way in */
  {const i=8,g=new THREE.Group();g.position.set(sx[i],sy[i],sz[i]);g.rotation.y=yawAt(i)+Math.PI;world.add(g);
    for(const sd of [-1,1])hoorBox(g,.35,7.6,.35,grey,sd*(HW+2.4),3.8,0);
    const b=new THREE.Mesh(new THREE.PlaneGeometry(2*HW+4,3),psMat({map:pixTex(192,36,c=>{
      c.fillStyle='#2a5aa8';c.fillRect(0,0,192,36);c.fillStyle='#f2c81c';c.fillRect(0,0,192,3);c.fillRect(0,33,192,3);
      c.fillStyle='#f4f2ec';c.font='9px "Press Start 2P",monospace';c.textAlign='center';c.textBaseline='middle';
      c.fillText('AVENYRUSET',96,12);c.fillText('VÄSTGÖTACUPEN',96,25);}),unlit:true,side:THREE.DoubleSide}));
    b.position.set(0,6.4,0);g.add(b);}

  /* the cultural square: a fountain on rings of pale stone, the museum behind it */
  {const F=P.F,y=meshY(F.x,F.z),g=new THREE.Group();g.position.set(F.x,y,F.z);world.add(g);res(F.x,F.z,32);
    const rim=new THREE.Mesh(flat(new THREE.CylinderGeometry(9,9.4,.9,16,1,true)),psMat({color:0xd8ccb4,side:THREE.DoubleSide}));rim.position.y=.45;g.add(rim);
    const cap=new THREE.Mesh(flat(new THREE.TorusGeometry(9.2,.35,3,16)).rotateX(Math.PI/2),stone);cap.position.y=.92;g.add(cap);
    const water=new THREE.Mesh(new THREE.CircleGeometry(9,16).rotateX(-Math.PI/2),psMat({color:0x5a8aa8,unlit:true}));water.position.y=.6;g.add(water);
    const ped=new THREE.Mesh(flat(new THREE.CylinderGeometry(1.2,1.8,3,8)),stone);ped.position.y=1.5;g.add(ped);
    const bowl=new THREE.Mesh(flat(new THREE.CylinderGeometry(3,1.2,.9,10)),stone);bowl.position.y=3.3;g.add(bowl);
    /* the sculpture: a fictional figure, a big fish standing on its tail (nobody remembers why) */
    const fish=new THREE.Group();fish.position.y=3.8;g.add(fish);
    const bronze=psMat({color:0x4a7a6a});
    hoorBox(fish,1.1,3.6,1.6,bronze,0,2,0);hoorBox(fish,.6,1.2,2.6,bronze,0,.4,0);hoorBox(fish,.4,1,.9,bronze,0,4,.3);
    AVENYN.fount={x:F.x,y,z:F.z};
    /* the sweeping arm: a ring of nozzles on the rim, and the spray drops */
    const drop=rosInst(flat(new THREE.BoxGeometry(.28,.28,.28)),psMat({color:0xd8ecf8,unlit:true,transparent:true,opacity:.8,depthWrite:false}),90);
    drop.count=0;world.add(drop);AVENYN.drop=drop;
    /* the decorative bed the spray sweeps over: a mosaic of blue and white tiles beside the basin */
    const tile=rosInst(flat(new THREE.BoxGeometry(1.8,.06,1.8)),psMat({}),200,true);
    for(let a=0;a<6.283;a+=.11)for(const r of [11.2,13.2,15.2,17.2]){const x=F.x+Math.cos(a)*r,z=F.z+Math.sin(a)*r;if(latAt(x,z)<HW+8)continue;
      tile.put(x,meshY(x,z)+.03,z,a,1,1,1,(Math.floor(a/.33)+r)%2?0x3a6ab8:0xe8eef4);}
    tile.done();
    /* benches round the square */
    const bench=rosInst(flat(new THREE.BoxGeometry(2.4,.5,.7)).translate(0,.45,0),psMat({color:0x6a4a32}),20);
    for(let n=0;n<10;n++){const a=n/10*6.283,x=F.x+Math.cos(a)*24,z=F.z+Math.sin(a)*24;if(latAt(x,z)<HW+5)continue;bench.put(x,meshY(x,z),z,-a);}
    bench.done();
    const s=sign('KULTURTORGET','#2a3a4a','#f2e6c8',112,16,7,1,8);
    const q=at(AVENYN_FOUNT-26,-(HW+6)),sg=new THREE.Group();sg.position.set(q.x,q.y,q.z);sg.rotation.y=yawAt(AVENYN_FOUNT-26)+Math.PI;world.add(sg);
    for(const x of [-3,3])hoorBox(sg,.2,3,.2,dark,x,1.5,0);s.position.set(0,3.4,0);sg.add(s);hoorMerge(sg);
    hoorMerge(g);}
  {const M=P.M,y=meshY(M.x,M.z),g=new THREE.Group(),yw=Math.atan2(P.F.x-M.x,P.F.z-M.z);
    g.position.set(M.x,y,M.z);g.rotation.y=yw;world.add(g);res(M.x,M.z,36);
    const body=new THREE.Mesh(rosBoxUV(56,15,22,4,5),psMat({map:borasFacadeTex('#d8c49c',false)}));body.position.set(0,0,-6);g.add(body);
    hoorBox(g,58,1.2,24,stone,0,15.6,-6);
    hoorBox(g,26,2.4,6,stone,0,1.2,7);hoorBox(g,24,1,8,stone,0,.5,9.5);                /* the steps */
    for(let x=-10;x<=10;x+=4){const c=new THREE.Mesh(flat(new THREE.CylinderGeometry(.7,.8,11,8)),stone);c.position.set(x,7.9,8.4);g.add(c);}
    hoorBox(g,26,1.6,6,stone,0,14.2,7.4);
    const pg=new THREE.Mesh(flat(new THREE.ConeGeometry(14.6,4.4,4,1)).rotateY(Math.PI/4).scale(1,1,.3),stone);pg.position.set(0,17.2,7.4);g.add(pg);
    const s=sign('KONSTHALLEN','#d8c49c','#3a3026',112,16,16,2.2,9);s.position.set(0,12.2,10.5);s.rotation.y=0;g.add(s);
    /* a banner for the race between the columns */
    const ban=new THREE.Mesh(new THREE.PlaneGeometry(3,8),psMat({map:pixTex(16,48,c=>{c.fillStyle='#2a5aa8';c.fillRect(0,0,16,48);c.fillStyle='#f2c81c';c.fillRect(0,20,16,6);
      c.fillStyle='#f4f2ec';for(let k=0;k<4;k++)c.fillRect(2+(k%2)*8,32+Math.floor(k/2)*6,4,4);}),unlit:true,side:THREE.DoubleSide}));
    for(const x of [-14,14]){const b=ban.clone();b.position.set(x,9,5.2);g.add(b);}
    hoorMerge(g);
    shadows.push([M.x+4,M.z,90,40]);}

  /* the café street: terraces along the road, the alley behind them, the cafés across the alley */
  const cafeTex=['#e0c890','#c87a5a','#e8dcc0','#a9b89a'].map(c=>borasFacadeTex(c,false));
  {const tab=rosInst(flat(new THREE.CylinderGeometry(.55,.55,.06,8)).translate(0,.78,0),white,160);
    const leg=rosInst(flat(new THREE.CylinderGeometry(.05,.05,.78,4)).translate(0,.39,0),dark,160);
    const chair=rosInst(flat(new THREE.BoxGeometry(.45,.06,.45)).translate(0,.46,0),psMat({}),400,true);
    const back=rosInst(flat(new THREE.BoxGeometry(.45,.5,.06)).translate(0,.72,-.22),psMat({}),400,true);
    const can=rosInst(flat(new THREE.ConeGeometry(1.9,.6,8,1,true)),psMat({side:THREE.DoubleSide}),120,true);
    const pole=rosInst(flat(new THREE.CylinderGeometry(.05,.05,2.6,4)).translate(0,1.3,0),dark,120);
    const plant=rosInst(flat(new THREE.BoxGeometry(1.6,.7,.6)).translate(0,.35,0),psMat({color:0x6a5a4a}),120);
    const bush=rosInst(flat(new THREE.BoxGeometry(1.5,.6,.5)).translate(0,.95,0),psMat({color:0x4a7a3a}),120);
    const heat=rosInst(flat(new THREE.CylinderGeometry(.08,.12,2.2,5)).translate(0,1.1,0),grey,60);
    const heatTop=rosInst(flat(new THREE.ConeGeometry(.5,.3,6)).translate(0,2.35,0),psMat({color:0xff9a4a,unlit:true}),60);
    const cols=[0x3a7a4a,0xc8321f,0xf4f2ec,0x2a5aa8,0xe8b020];
    for(let i=AVENYN_CAFE[0];i<=AVENYN_CAFE[1];i+=3){
      for(const o of [HW+4.2,HW+7.4]){
        const q=at(i,o);if(nearAlt(q.x,q.z,1.6))continue;
        const c=cols[Math.floor(Hs(i,o)*cols.length)];
        tab.put(q.x,q.y,q.z,0);leg.put(q.x,q.y,q.z,0);
        for(const s of [-1,1]){const cx=q.x+fx[i]*s*.85,cz=q.z+fz[i]*s*.85,yw=yawAt(i)+(s>0?Math.PI:0);
          chair.put(cx,q.y,cz,yw,1,1,1,c);back.put(cx,q.y,cz,yw,1,1,1,c);}
        if((i/3)%2===0){can.put(q.x,q.y+2.75,q.z,Hs(i,o)*3,1,1,1,c);pole.put(q.x,q.y,q.z,0);}
        else if(o<HW+5){heat.put(q.x+fx[i]*1.5,q.y,q.z+fz[i]*1.5,0);heatTop.put(q.x+fx[i]*1.5,q.y,q.z+fz[i]*1.5,0);}
        res(q.x,q.z,2.2);
      }
      const r=at(i,HW+2.4);if(!nearAlt(r.x,r.z,1.2)){plant.put(r.x,r.y,r.z,yawAt(i)+Math.PI/2);bush.put(r.x,r.y,r.z,yawAt(i)+Math.PI/2);}
    }
    tab.done();leg.done();chair.done();back.done();can.done();pole.done();plant.done();bush.done();heat.done();heatTop.done();
    /* UTESERVERING / EJ DEPÅ: the board at the start of the terraces, facing the traffic */
    {const i=AVENYN_CAFE[0]+2,q=at(i,HW+2.6),g=new THREE.Group();g.position.set(q.x,q.y,q.z);g.rotation.y=yawAt(i)+Math.PI;world.add(g);
      for(const x of [-1.5,1.5])hoorBox(g,.14,2.6,.14,dark,x,1.3,0);
      const b=new THREE.Mesh(new THREE.PlaneGeometry(3.6,1.8),psMat({map:pixTex(96,48,c=>{
        c.fillStyle='#f4f2ec';c.fillRect(0,0,96,48);c.fillStyle='#c8321f';c.fillRect(0,0,96,3);c.fillRect(0,45,96,3);c.fillRect(0,0,3,48);c.fillRect(93,0,3,48);
        c.fillStyle='#1e2022';c.font='8px "Press Start 2P",monospace';c.textAlign='center';c.textBaseline='middle';
        c.fillText('UTESERVERING',48,17);c.fillStyle='#c8321f';c.fillText('EJ DEPÅ',48,32);}),unlit:true,side:THREE.DoubleSide}));
      b.position.set(0,2.4,0);g.add(b);hoorMerge(g);res(q.x,q.z,2);}
    /* the abandoned räkmacka on the last table, and the gull eyeing it */
    {const i=AVENYN_CAFE[1]-3,q=at(i,HW+4.2),g=new THREE.Group();g.position.set(q.x,q.y,q.z);g.rotation.y=yawAt(i);world.add(g);
      const plate=new THREE.Mesh(flat(new THREE.CylinderGeometry(.34,.3,.04,10)),white);plate.position.y=.83;g.add(plate);
      hoorBox(g,.42,.08,.26,psMat({color:0xc89a5a}),0,.88,0);
      hoorBox(g,.38,.06,.22,psMat({color:0x6aa04a}),0,.94,0);
      for(let n=0;n<7;n++)hoorBox(g,.1,.07,.07,psMat({color:0xf09a7a}),-.15+n*.05,1.0+(n%2)*.04,(n%3-1)*.06);
      hoorBox(g,.12,.05,.12,psMat({color:0xf4f0e0}),.1,1.05,.05);hoorBox(g,.06,.06,.06,psMat({color:0xf2c81c}),.1,1.08,.05);
      hoorBox(g,.08,.06,.02,psMat({color:0x3a7a2a}),-.05,1.1,-.02);
      AVENYN.gulls.push([q.x+fx[i]*.5,q.y+.8,q.z+fz[i]*.5,yawAt(i)+Math.PI*.8]);
      hoorMerge(g);}
  }
  if(U){
    /* the alley: string lights over it, bins and crates against the café backs */
    const bulb=rosInst(flat(new THREE.BoxGeometry(.22,.22,.22)),psMat({unlit:true}),300,true);
    const wire=[];
    for(let j=COMMIT+6;j<U.n-MERGE-4;j+=5){
      const a=lanePt(U,j/(U.n-1),-(U.hw+1.2)),b=lanePt(U,j/(U.n-1),U.hw+1.2),y=U.Y[j]+4.8;
      wire.push(a.x,y,a.z,b.x,y,b.z);
      for(let n=1;n<6;n++){const t=n/6;bulb.put(lerp(a.x,b.x,t),y-.3*Math.sin(Math.PI*t),lerp(a.z,b.z,t),0,1,1,1,[0xffe08a,0xffb04a,0xfff4d0][n%3]);}
    }
    bulb.done();
    {const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(wire,3));
      world.add(new THREE.LineSegments(geo,new THREE.LineBasicMaterial({color:0x2a2a2e})));}
    const posts=rosInst(flat(new THREE.CylinderGeometry(.08,.08,5,4)).translate(0,2.5,0),dark,80);
    for(let j=COMMIT+6;j<U.n-MERGE-4;j+=5)for(const s of [-1,1]){const q=lanePt(U,j/(U.n-1),s*(U.hw+1.2));posts.put(q.x,meshY(q.x,q.z),q.z,0);}
    posts.done();
    /* the cafés across the alley: one row of buildings, awnings and lit windows toward the alley */
    const list=new Map();
    const awn=rosInst(flat(new THREE.BoxGeometry(1,.14,2.4)),psMat({}),80,true);
    for(let j=COMMIT+4;j<U.n-MERGE-2;j+=6){
      const q=lanePt(U,j/(U.n-1),U.hw+9),x=q.x,z=q.z;
      if(latAt(x,z)<U.hw+2||nearAltMain(x,z)<HW+8)continue;
      const tex=cafeTex[Math.floor(Hs(j,3)*cafeTex.length)];
      if(!list.has(tex))list.set(tex,[]);
      list.get(tex).push([x,meshY(x,z)-.2,z,q.yaw,12,10,10.2]);res(x,z,8);
      const a=lanePt(U,j/(U.n-1),U.hw+3.4);
      awn.put(a.x,meshY(a.x,a.z)+3.2,a.z,q.yaw+Math.PI/2,1,1,1,[0x3a7a4a,0xc8321f,0x2a5aa8,0xe8b020][j%4],0,0);
    }
    for(const [tex,l] of list)world.add(new THREE.Mesh(borasMergeBoxes(l),psMat({map:tex})));
    awn.done();
    const bin=rosInst(flat(new THREE.BoxGeometry(.9,1.2,.9)).translate(0,.6,0),psMat({}),40,true);
    for(let j=COMMIT+8;j<U.n-MERGE-6;j+=7){const q=lanePt(U,j/(U.n-1),U.hw+1.6);bin.put(q.x,meshY(q.x,q.z),q.z,q.yaw,1,1,1,[0x3a6a3a,0x2a2c30,0x8a8e92][j%3]);}
    bin.done();
    /* the terrace rail between the alley and the tables */
    const rail=rosInst(flat(new THREE.BoxGeometry(.08,.9,2.3)).translate(0,.45,0),psMat({color:0x3a3c40}),100);
    for(let j=COMMIT+8;j<U.n-MERGE-6;j+=1){const q=lanePt(U,j/(U.n-1),-(U.hw+1.3));if(nearAltMain(q.x,q.z)<HW+3)continue;rail.put(q.x,meshY(q.x,q.z),q.z,q.yaw);}
    rail.done();
    for(let j=COMMIT;j<U.n-MERGE;j+=2)for(const s of [-1,1]){const q=lanePt(U,j/(U.n-1),s*(U.hw+3));res(q.x,q.z,4);}
    const j=COMMIT+3,q=lanePt(U,j/(U.n-1),0),g=new THREE.Group();g.position.set(q.x,U.Y[j],q.z);g.rotation.y=q.yaw+Math.PI;world.add(g);
    for(const sd of [-1,1])hoorBox(g,.25,5.6,.25,dark,sd*(U.hw+1.4),2.8,0);
    const s=sign('BAKOM UTESERVERINGEN','#3a7a4a','#f4f2ec',160,16,2*U.hw+3,1.1,7);s.position.set(0,5.8,0);g.add(s);
  }

  /* Scenleveransen: the open-air stage on the plaza, its back to the loading lane; trucks and flight cases */
  if(S&&P.st){
    const st=P.st,y=meshY(st.x,st.z),g=new THREE.Group();g.position.set(st.x,y,st.z);g.rotation.y=st.yaw;world.add(g);res(st.x,st.z,18);
    hoorBox(g,18,1.6,10,dark,0,.8,0);                                            /* the deck */
    const truss=psMat({color:0xb8bcc0});
    for(const [x,z] of [[-8.6,-4.6],[8.6,-4.6],[-8.6,4.6],[8.6,4.6]])hoorBox(g,.6,9,.6,truss,x,4.5,z);
    for(const z of [-4.6,4.6])hoorBox(g,18,.6,.6,truss,0,9,z);
    for(const x of [-8.6,8.6])hoorBox(g,.6,.6,9.8,truss,x,9,0);
    hoorBox(g,18.6,.3,10.4,psMat({color:0x1e2022}),0,9.5,0);
    for(const x of [-7.8,7.8]){hoorBox(g,1.6,2.4,1.4,dark,x,2.8,3.6);hoorBox(g,1.4,2,1.2,dark,x,5,3.6);}
    const back=new THREE.Mesh(new THREE.PlaneGeometry(16,7),psMat({map:pixTex(128,56,c=>{
      const gr=c.createLinearGradient(0,0,0,56);gr.addColorStop(0,'#2a2a5a');gr.addColorStop(1,'#c84a6a');c.fillStyle=gr;c.fillRect(0,0,128,56);
      c.fillStyle='#f2c81c';c.font='10px "Press Start 2P",monospace';c.textAlign='center';c.textBaseline='middle';c.fillText('AVENYRUSET',64,22);
      c.fillStyle='#f4f2ec';c.font='7px "Press Start 2P",monospace';c.fillText('LIVE I KVÄLL',64,38);}),unlit:true,side:THREE.DoubleSide}));
    back.position.set(0,5.4,-4.3);g.add(back);
    AVENYN.lights=[];
    for(let n=0;n<6;n++){const l=new THREE.Mesh(flat(new THREE.BoxGeometry(.6,.5,.6)),psMat({color:[0xff4a8a,0x4ac8ff,0xf2c81c][n%3],unlit:true}));
      l.position.set(-7+n*2.8,8.5,3.6);g.add(l);AVENYN.lights.push(l);}
    hoorMerge(g);
    /* the crowd barrier in front, a sound desk */
    const crowd=rosInst(flat(new THREE.BoxGeometry(.5,1.5,.4)).translate(0,.75,0),psMat({}),140,true);
    const head=rosInst(flat(new THREE.BoxGeometry(.34,.34,.34)),psMat({color:0xe0b494}),140);
    const fwdX=Math.sin(st.yaw),fwdZ=Math.cos(st.yaw),sideX=Math.cos(st.yaw),sideZ=-Math.sin(st.yaw);
    for(let n=0;n<60;n++){const a=rand(-9,9),b=rand(8,16),x=st.x+fwdX*b+sideX*a,z=st.z+fwdZ*b+sideZ*a;
      if(latAt(x,z)<HW+4)continue;const yy=meshY(x,z);
      crowd.put(x,yy,z,st.yaw+Math.PI+rand(-.3,.3),1,1,1,[0xc8321f,0x2a5aa8,0xf2c81c,0x3a7a4a,0xf4f2ec,0x2a2c30][n%6]);head.put(x,yy+1.7,z,0);}
    crowd.done();head.done();
    /* along the lane: flight cases and two trucks on the far side */
    const fc=rosInst(flat(new THREE.BoxGeometry(1.2,1.1,.9)).translate(0,.55,0),psMat({color:0x2a2c30}),80);
    const fcEdge=rosInst(flat(new THREE.BoxGeometry(1.24,.12,.94)).translate(0,1.0,0),psMat({color:0xb8bcc0}),80);
    for(let j=COMMIT+10;j<S.n-MERGE-8;j+=3){if(Hs(j,7)<.35)continue;const q=lanePt(S,j/(S.n-1),S.hw+1.8);const yy=meshY(q.x,q.z);
      fc.put(q.x,yy,q.z,q.yaw);fcEdge.put(q.x,yy,q.z,q.yaw);if(Hs(j,9)>.6){fc.put(q.x,yy+1.1,q.z,q.yaw+.3);fcEdge.put(q.x,yy+1.1,q.z,q.yaw+.3);}}
    fc.done();fcEdge.done();
    for(const f of [.32,.7]){const q=lanePt(S,f,-(S.hw+5.5)),tg=new THREE.Group();tg.position.set(q.x,meshY(q.x,q.z),q.z);tg.rotation.y=q.yaw;world.add(tg);res(q.x,q.z,10);
      hoorBox(tg,2.6,3.2,12,psMat({color:0xe8e4da}),0,2.1,-1);hoorBox(tg,2.5,2.4,3,psMat({color:0x2a5aa8}),0,1.6,6.6);
      hoorBox(tg,2.2,.9,.1,psMat({color:0x3c4a58}),0,2.4,8.12);
      for(const z of [-5,-2,4,7])for(const s of [-1,1])hoorBox(tg,.3,.9,.9,dark,s*1.2,.45,z);
      const s=sign('SCENTEKNIK','#e8e4da','#2a5aa8',64,12,6,1.1,7);s.position.set(1.32,2.6,-1);s.rotation.y=Math.PI/2;tg.add(s);
      hoorMerge(tg);}
    /* chevrons on the two tight turns, and the lane's board at the mouth */
    for(const f of [.16,.86]){const q=lanePt(S,f,(f<.5?1:1)*(S.hw+1.2)),cg=new THREE.Group();cg.position.set(q.x,meshY(q.x,q.z),q.z);cg.rotation.y=q.yaw+Math.PI;world.add(cg);
      hoorBox(cg,.12,1.6,.12,dark,0,.8,0);
      const c=new THREE.Mesh(new THREE.PlaneGeometry(1.6,.8),psMat({map:pixTex(32,16,cc=>{cc.fillStyle='#f2c81c';cc.fillRect(0,0,32,16);cc.fillStyle='#1e2022';
        for(const x of [4,14,24]){cc.beginPath();cc.moveTo(x,2);cc.lineTo(x+6,8);cc.lineTo(x,14);cc.lineTo(x+3,14);cc.lineTo(x+9,8);cc.lineTo(x+3,2);cc.fill();}}),unlit:true,side:THREE.DoubleSide}));
      c.position.y=1.9;cg.add(c);if(f>.5)c.scale.x=-1;}
    for(let j=COMMIT;j<S.n-MERGE;j+=2)for(const s of [-1,1]){const q=lanePt(S,j/(S.n-1),s*(S.hw+3));res(q.x,q.z,4);}
    const j=COMMIT+3,q=lanePt(S,j/(S.n-1),0),gg=new THREE.Group();gg.position.set(q.x,S.Y[j],q.z);gg.rotation.y=q.yaw+Math.PI;world.add(gg);
    for(const sd of [-1,1])hoorBox(gg,.25,5.6,.25,dark,sd*(S.hw+1.4),2.8,0);
    const s=sign('SCENLEVERANSEN','#1e2022','#f2c81c',128,16,2*S.hw+3,1.1,7);s.position.set(0,5.8,0);gg.add(s);
  }

  /* the tram plaza: stops at both ends of the line, the warning lamps, the line's wires */
  {const T=AVENYN.tram;
    {
      for(const e of [T.stopA,T.stopB]){const g=new THREE.Group();g.position.set(e.x,meshY(e.x,e.z),e.z);g.rotation.y=e.yaw;world.add(g);res(e.x,e.z,14);
        hoorBox(g,3.2,.3,22,stone,-3,.15,0);                                       /* the platform */
        for(const z of [-4,4])hoorBox(g,.14,2.8,.14,dark,-4.2,1.6,z);
        hoorBox(g,1.8,.12,10,psMat({color:0x2a5aa8}),-3.6,3,0);
        const s=sign('SPÅRVAGNSPLATSEN','#2a5aa8','#f4f2ec',128,14,6,.66,7);s.position.set(-2.66,2.6,0);s.rotation.y=Math.PI/2;g.add(s);
        hoorMerge(g);}
      /* the warning lamps: a post at each place the line meets the road */
      AVENYN.lamps=[];
      for(const i of [AVENYN_TRAM.i0+6,AVENYN_TRAM.i1-6]){const q=at(i,HW+2.6),g=new THREE.Group();g.position.set(q.x,q.y,q.z);g.rotation.y=yawAt(i)+Math.PI;world.add(g);
        hoorBox(g,.18,3.4,.18,dark,0,1.7,0);hoorBox(g,1.6,.7,.3,dark,0,3.2,0);
        const L=[];for(const x of [-.45,.45]){const l=new THREE.Mesh(flat(new THREE.CylinderGeometry(.24,.24,.12,8)).rotateX(Math.PI/2),psMat({color:0x4a1010,unlit:true}));
          l.position.set(x,3.2,-.2);g.add(l);L.push(l);}
        const t=new THREE.Mesh(new THREE.PlaneGeometry(1.3,1.15),psMat({map:pixTex(32,28,c=>{
          c.fillStyle='#c8281c';c.beginPath();c.moveTo(16,0);c.lineTo(32,28);c.lineTo(0,28);c.fill();
          c.fillStyle='#f4f2ec';c.beginPath();c.moveTo(16,5);c.lineTo(28,25);c.lineTo(4,25);c.fill();
          c.fillStyle='#1e2022';c.fillRect(9,14,14,7);c.fillRect(15,10,2,4);c.fillRect(11,21,3,2);c.fillRect(18,21,3,2);
          c.fillStyle='#f4f2ec';c.fillRect(11,15,4,3);c.fillRect(17,15,4,3);}),unlit:true,transparent:true,alphaTest:.5,side:THREE.DoubleSide}));
        t.position.set(0,4.3,-.1);g.add(t);
        const bell=new THREE.Mesh(flat(new THREE.ConeGeometry(.3,.4,8)),psMat({color:0xd8b040}));bell.position.set(0,2.5,-.15);g.add(bell);
        AVENYN.lamps.push(L);res(q.x,q.z,3);}
      /* rails along the whole line, and the dashed yellow line that keeps the inside open */
      const railM=rosInst(flat(new THREE.BoxGeometry(.18,.05,2.1)),psMat({color:0x5a5650}),700);
      const sleeper=rosInst(flat(new THREE.BoxGeometry(2.4,.04,.5)),psMat({color:0x6a6058}),300);
      for(let s=0;s<T.len;s+=2){const p=avenynTramAt(T,s);
        for(const o of [-.72,.72])railM.put(p.x+p.rx*o,p.y+.05,p.z+p.rz*o,p.yaw);
        if(!p.road)sleeper.put(p.x,p.y+.02,p.z,p.yaw);}
      railM.done();sleeper.done();
      const dash=rosInst(new THREE.PlaneGeometry(.3,1.6).rotateX(-Math.PI/2),psMat({color:0xf2c81c,unlit:true}),80);
      for(let i=AVENYN_TRAM.i0+4;i<AVENYN_TRAM.i1-2;i+=2){const q=mainPt(i,2.6);dash.put(q.x,q.y+.06,q.z,q.yaw);}
      dash.done();
      /* the line's wire on poles beside it */
      const pole=rosInst(flat(new THREE.CylinderGeometry(.12,.16,7.4,5)).translate(0,3.7,0),dark,80);
      const pts=[];
      for(let s=6;s<T.len-4;s+=12){const p=avenynTramAt(T,s),ox=p.x+p.rx*3.4,oz=p.z+p.rz*3.4;
        if(latAt(ox,oz)<HW+.8)continue;pole.put(ox,meshY(ox,oz),oz,0);}
      for(let s=0;s<T.len-3;s+=3){const a=avenynTramAt(T,s),b=avenynTramAt(T,s+3);pts.push(a.x,a.y+6.2,a.z,b.x,b.y+6.2,b.z);}
      pole.done();
      const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(pts,3));
      world.add(new THREE.LineSegments(geo,new THREE.LineBasicMaterial({color:0x26262a})));
      for(let s=0;s<T.len;s+=6){const p=avenynTramAt(T,s);res(p.x,p.z,5);}
    }
  }

  /* the event ramp on the second boulevard: planks, banners and a little crowd */
  {const J=JUMPS[0];
    if(J){const plank=new THREE.InstancedMesh(flat(new THREE.BoxGeometry(2*HW-2,.12,SEG*.8)),psMat({color:0x9a7a52}),J.up+1),o=new THREE.Object3D();
      o.rotation.order='YXZ';
      for(let k=-J.up;k<=0;k++){const ii=(J.at+k+N)%N;o.position.set(sx[ii],sy[ii]+.07,sz[ii]);
        o.rotation.set(-Math.atan2(sy[(ii+1)%N]-sy[(ii-1+N)%N],2*SEG),yawAt(ii),0);o.updateMatrix();plank.setMatrixAt(k+J.up,o.matrix);}
      plank.frustumCulled=false;world.add(plank);
      const stripe=rosInst(new THREE.PlaneGeometry(2*HW-2,.5).rotateX(-Math.PI/2),psMat({color:0xf2c81c,unlit:true}),2);
      {const ii=J.at,yy=sy[ii]+.15;stripe.put(sx[ii],yy,sz[ii],yawAt(ii));}stripe.done();
      for(const sd of [-1,1]){const i=J.at-J.up-4,q=at(i,sd*(HW+3.4)),g=new THREE.Group();g.position.set(q.x,q.y,q.z);g.rotation.y=yawAt(i)+Math.PI;world.add(g);res(q.x,q.z,4);
        for(const x of [-1.2,1.2])hoorBox(g,.14,4.6,.14,dark,x,2.3,0);
        const b=new THREE.Mesh(new THREE.PlaneGeometry(2.8,1.4),psMat({map:horbyBannerTex('HOPP',64,32),unlit:true,side:THREE.DoubleSide}));b.position.set(0,3.8,0);g.add(b);}
      const fan=rosInst(flat(new THREE.BoxGeometry(.5,1.5,.4)).translate(0,.75,0),psMat({}),80,true);
      const fh=rosInst(flat(new THREE.BoxGeometry(.34,.34,.34)),psMat({color:0xe0b494}),80);
      for(let n=0;n<40;n++){const i=J.at-12+(n%20)*1.4,sd=n<20?1:-1,q=at(Math.round(i),sd*(HW+6+(n%3)*.8));
        if(nearAlt(q.x,q.z,2))continue;fan.put(q.x,q.y,q.z,yawAt(Math.round(i))+(sd>0?-Math.PI/2:Math.PI/2),1,1,1,[0xc8321f,0x2a5aa8,0xf2c81c,0x3a7a4a,0xf4f2ec][n%5]);fh.put(q.x,q.y+1.7,q.z,0);}
      fan.done();fh.done();
      for(let k=-16;k<=10;k+=2)for(const sd of [-1,1]){const q=at(J.at+k,sd*(HW+7));res(q.x,q.z,4);}
      /* the päronsaft cart */
      {const i=J.at+16,q=at(i,-(HW+7)),g=new THREE.Group();g.position.set(q.x,q.y,q.z);g.rotation.y=yawAt(i)+Math.PI/2;world.add(g);res(q.x,q.z,5);
        hoorBox(g,2.6,1.1,1.4,psMat({color:0xe8d070}),0,.9,0);for(const x of [-1,1])hoorBox(g,.2,.6,.6,dark,x,.3,.7);
        const u=borasUmbrella(1.8,2.8,'#e8d070','#f4f2ec',8);u.position.set(0,3.6,0);g.add(u);
        const s=sign('PÄRONSAFT','#e8d070','#3a5a2a',64,12,2.4,.45,7);s.position.set(0,1.1,.72);s.rotation.y=Math.PI;g.add(s);
        hoorMerge(g);}}}

  /* the event staging area by the first fuel bay: crew trucks, flight cases, a marquee */
  {const S1=stations.find(s=>s.at<100);
    if(S1){const i=S1.at+6,sd=S1.side;
      for(const [k,o] of [[-14,30],[22,30]]){const q=at(i+k,sd*(HW+o)),tg=new THREE.Group();tg.position.set(q.x,q.y,q.z);tg.rotation.y=yawAt(i+k);world.add(tg);res(q.x,q.z,10);
        hoorBox(tg,2.6,3.4,13,psMat({color:0xf4f2ec}),0,2.2,0);hoorBox(tg,2.5,2.4,3,psMat({color:0xc8321f}),0,1.6,8);
        for(const z of [-5,-2,6,9])for(const s of [-1,1])hoorBox(tg,.3,.9,.9,dark,s*1.2,.45,z);
        const b=new THREE.Mesh(new THREE.PlaneGeometry(10,1.6),psMat({map:horbyBannerTex('DEPÅ',96,16),unlit:true,side:THREE.DoubleSide}));
        b.position.set(-sd*1.33,2.8,0);b.rotation.y=Math.PI/2;tg.add(b);hoorMerge(tg);}
      const q=at(i+4,sd*(HW+40)),g=new THREE.Group();g.position.set(q.x,q.y,q.z);g.rotation.y=yawAt(i);world.add(g);res(q.x,q.z,12);
      hoorBox(g,12,3,9,white,0,1.5,0);
      const roof=new THREE.Mesh(flat(new THREE.ConeGeometry(8.6,3,4,1)).rotateY(Math.PI/4).scale(1,1,.72),psMat({color:0x2a5aa8}));roof.position.y=4.5;g.add(roof);
      hoorMerge(g);}}

  /* the avenue and the streets: two rows of lindens, street lamps, and the tram wires overhead */
  {const TN=420,trT=rosInst(flat(new THREE.CylinderGeometry(.2,.3,3.8,5)).translate(0,1.9,0),psMat({color:0x4a3a2e}),TN);
    const trC=rosInst(flat(new THREE.IcosahedronGeometry(2.8,0)).translate(0,5.6,0),psMat({}),TN,true);
    let tn=0;
    const tree=(x,z,sc)=>{if(tn>=TN)return;const y=meshY(x,z);trT.put(x,y,z,0,sc,sc,sc);
      trC.put(x,y,z,Hs(x,z)*3,sc*rand(.9,1.1),sc*rand(.9,1.2),sc*rand(.9,1.1),[0x4a7a3a,0x5a8a42,0x3e6e34,0x6a8a3a][tn%4]);
      shadows.push([x,z,13*sc,2.6*sc]);res(x,z,3);tn++;};
    /* the avenue (from the turnaround corner up to the square) gets the double rows */
    for(let i=672;i<N+70;i+=4)for(const o of [HW+5.4,HW+9.4]){const ii=i%N;
      if(Math.abs(ii-0)<4||Math.abs(ii-N)<4)continue;
      for(const sd of [-1,1]){const q=mainPt(ii,sd*o);if(!free(q.x,q.z,4))continue;
        if(stations.some(S_=>{let d=ii-S_.at;if(d<-N/2)d+=N;else if(d>N/2)d-=N;return S_.side===sd&&d>-8&&d<S_.len+8;}))continue;
        tree(q.x,q.z,1);}}
    /* the second boulevard and the parallel street: one row a side */
    for(const [i0,i1] of [[214,312],[490,640]])for(let i=i0;i<i1;i+=5)for(const sd of [-1,1]){
      const q=mainPt(i,sd*(HW+5.4));if(!free(q.x,q.z,4)||nearAlt(q.x,q.z,3))continue;
      if(stations.some(S_=>{let d=i-S_.at;if(d<-N/2)d+=N;else if(d>N/2)d-=N;return S_.side===sd&&d>-8&&d<S_.len+8;}))continue;
      tree(q.x,q.z,.9);}
    trT.done();trC.done();
    /* street lamps, some with a gull on top */
    const pole=rosInst(flat(new THREE.CylinderGeometry(.1,.14,7,4)).translate(0,3.5,0),dark,N);
    const arm=rosInst(flat(new THREE.BoxGeometry(.12,.12,1.4)),dark,N);
    const head=rosInst(flat(new THREE.BoxGeometry(.5,.3,.9)),psMat({color:0xffe6b0,unlit:true}),N);
    let gn=0;
    for(let i=0;i<N;i+=14)for(const sd of [-1,1]){
      if((i/14+(sd>0?1:0))%2)continue;
      const q=at(i,sd*(HW+3.2));if(nearAlt(q.x,q.z,3)||!free(q.x,q.z,-HW+3))continue;
      if(stations.some(S_=>{let d=i-S_.at;if(d<-N/2)d+=N;else if(d>N/2)d-=N;return S_.side===sd&&d>-6&&d<S_.len+6;}))continue;
      pole.put(q.x,q.y,q.z,0);arm.put(q.x-sd*q.rx*.6,q.y+7,q.z-sd*q.rz*.6,q.yaw+Math.PI/2);head.put(q.x-sd*q.rx*1.2,q.y+6.9,q.z-sd*q.rz*1.2,q.yaw);
      shadows.push([q.x,q.z,16,.5]);
      if(Hs(i,sd*3)>.55){AVENYN.gulls.push([q.x,q.y+7.06,q.z,Hs(sd,i)*6.28]);gn++;}}
    pole.done();arm.done();head.done();
    /* the tram wires: span wires between poles across the avenue and the café street, two contact wires along */
    const cpole=rosInst(flat(new THREE.CylinderGeometry(.12,.16,8,5)).translate(0,4,0),psMat({color:0x3a4a3a}),N);
    const wires=[];
    for(const [i0,i1] of [[672,N+58],[216,306]]){
      for(let i=i0;i<i1;i+=12){const ii=i%N,a=mainPt(ii,-(HW+2.4)),b=mainPt(ii,HW+2.4);
        const ya=meshY(a.x,a.z),yb=meshY(b.x,b.z);
        if(!nearAlt(a.x,a.z,1.5))cpole.put(a.x,ya,a.z,0);if(!nearAlt(b.x,b.z,1.5))cpole.put(b.x,yb,b.z,0);
        wires.push(a.x,ya+7.6,a.z,b.x,yb+7.6,b.z);}
      for(let i=i0;i<i1-3;i+=3){const a0=i%N,b0=(i+3)%N;
        for(const o of [-1.6,1.6]){const a=mainPt(a0,o),b=mainPt(b0,o);wires.push(a.x,sy[a0]+7.3,a.z,b.x,sy[b0]+7.3,b.z);}}}
    cpole.done();
    {const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(wires,3));
      world.add(new THREE.LineSegments(geo,new THREE.LineBasicMaterial({color:0x222226})));}
  }

  /* the town: stone and plaster blocks along every street, then the ones behind */
  const blocks=[];
  const plaster=['#d8b46a','#e8dcc0','#c8a888','#a9b89a','#b8b4ac','#d8a898','#e0d0a8'].map(c=>borasFacadeTex(c,false));
  const brick=borasFacadeTex('#9a4a32',true);
  const tryBlock=(x,z,yw,L,D,Ht,tex,pad)=>{
    const c=Math.cos(yw),s=Math.sin(yw);
    for(const [lx,lz] of [[-L/2,-D/2],[L/2,-D/2],[-L/2,D/2],[L/2,D/2],[0,0],[-L/4,0],[L/4,0],[0,-D/2],[0,D/2]]){
      const wx=x+c*lx+s*lz,wz=z-s*lx+c*lz;
      if(!free(wx,wz,pad)||nearAlt(wx,wz,4))return false;
    }
    blocks.push([x,meshY(x,z),z,yw,L,D,Ht,tex]);res(x,z,Math.min(L,D)/2+2);
    for(const [lx,lz] of [[-L/3,0],[L/3,0]])res(x+c*lx+s*lz,z-s*lx+c*lz,Math.min(L,D)/2+2);
    shadows.push([x,z,Ht*2.6,Math.min(L,D)*.9]);
    return true;
  };
  for(let i=0;i<N;i+=2)for(const sd of [-1,1]){
    const D=12+Hs(i,sd)*8,L=14+Hs(sd,i)*12,Ht=12+Hs(i*3,sd)*12,q=mainPt(i,sd*(HW+12+D/2));
    if(tryBlock(q.x,q.z,yawAt(i)+Math.PI/2,L,D,Ht,Hs(i,sd*5)>.82?brick:plaster[Math.floor(Hs(i,sd*7)*plaster.length)],3))i+=Math.round(L/SEG*.6);
  }
  for(let gx=-400;gx<=400;gx+=30)for(let gz=-400;gz<=400;gz+=28){
    const x=gx+Hs(gx,gz)*8,z=gz+Hs(gz,gx)*8,Ht=12+Hs(gx,gz*3)*16;
    tryBlock(x,z,Hs(gx*3,gz)>.5?0:Math.PI/2,14+Hs(gz,gx*2)*10,12+Hs(gx*2,gz)*8,Ht,Hs(gz*5,gx)>.75?brick:plaster[Math.floor(Hs(gx,gz*7)*plaster.length)],6);
  }
  {const byTex=new Map(),roofs=[];
    for(const b of blocks){const [x,y,z,yw,L,D,Ht,tex]=b;
      if(!byTex.has(tex))byTex.set(tex,[]);
      const h=Math.round(Ht/3.4)*3.4||3.4,l=Math.round(L/4)*4||4;
      byTex.get(tex).push([x,y-.2,z,yw,l,Math.round(D),h]);roofs.push([x,y-.2+h,z,yw,l,Math.round(D)]);}
    for(const [tex,list] of byTex)world.add(new THREE.Mesh(borasMergeBoxes(list),psMat({map:tex})));
    const rf=rosInst(flat(new THREE.BoxGeometry(1,.6,1)).translate(0,.3,0),psMat({color:0x5a4a44}),blocks.length+4);
    const rf2=rosInst(flat(new THREE.CylinderGeometry(.1,1,2.4,4,1)).rotateY(Math.PI/4).translate(0,1.2,0),psMat({color:0x6a3a2e}),blocks.length+4);
    for(const [x,y,z,yw,L,D] of roofs){rf.put(x,y,z,yw,L+.4,1,D+.4);rf2.put(x,y+.6,z,yw,L*.6,1,D*.7);}
    rf.done();rf2.done();}

  /* the gulls: on lamp tops and on the café table */
  {const G=avenynGullGeos(),n=AVENYN.gulls.length+8;
    const w=rosInst(G.white,psMat({color:0xf4f6f8}),n),g=rosInst(G.grey,psMat({color:0x9aa4ae}),n),y=rosInst(G.yellow,psMat({color:0xf2c81c}),n);
    for(const [x,yy,z,yw] of AVENYN.gulls){w.put(x,yy,z,yw);g.put(x,yy,z,yw);y.put(x,yy,z,yw);}
    w.done();g.done();y.done();
    /* and three that circle over the café street, waiting for someone to look away */
    AVENYN.fly=[];const c=avenynCafeCentre();
    for(let k=0;k<3;k++){const fg=new THREE.Group();
      hoorBox(fg,.4,.32,.9,psMat({color:0xf4f6f8}),0,0,0);
      const wl=hoorBox(fg,1.3,.06,.5,psMat({color:0x9aa4ae}),-.75,0,0),wr=hoorBox(fg,1.3,.06,.5,psMat({color:0x9aa4ae}),.75,0,0);
      world.add(fg);AVENYN.fly.push({g:fg,wl,wr,cx:c.x,cz:c.z,cy:c.y+14+k*2.5,r:10+k*4,ph:k*2.1});}}

  /* long evening shadows: the sun is low in the west, so everything throws a stripe east */
  {const sh=rosInst(new THREE.PlaneGeometry(1,1).rotateX(-Math.PI/2).translate(0,0,.5),psMat({color:0x2a2238,transparent:true,opacity:.34,depthWrite:false}),shadows.length+4);
    sh.material.polygonOffset=true;sh.material.polygonOffsetFactor=-1;sh.material.polygonOffsetUnits=-1;
    const dirYaw=Math.atan2(1,0.12);                                /* toward +x, a touch south */
    for(const [x,z,len,wd] of shadows){const xm=x+Math.sin(dirYaw)*len*.5,zm=z+Math.cos(dirYaw)*len*.5;
      const y=Math.max(meshY(x,z),meshY(xm,zm),latAt(xm,zm)<HW+1?groundAt(xm,zm):-99)+.06;
      sh.put(x,y,z,dirYaw,wd,1,len);}
    sh.done();}
}
/** the middle of the café terraces, for the gulls that circle above them */
function avenynCafeCentre(){const i=Math.round((AVENYN_CAFE[0]+AVENYN_CAFE[1])/2),q=mainPt(i,HW+6);q.y=sy[i];return q;}

/* ───── Avenyn hazards: spårvagnspassagen; the fountain and the gulls for show ───── */
/** the tram line: in from a stop beside the plaza, along the outside of the corner, out to a stop on the far side */
function avenynTramLine(){
  const A=AVENYN_TRAM,lat=A.lat;
  const pts=[mainPt(A.i0-6,HW+44),mainPt(A.i0,HW+26),mainPt(A.i0+8,HW+5),mainPt(A.i0+14,lat),mainPt(Math.round((A.i0+A.i1)/2),lat),
    mainPt(A.i1-14,lat),mainPt(A.i1-8,HW+5),mainPt(A.i1,HW+26),mainPt(A.i1+6,HW+44)];
  const cur=new THREE.CatmullRomCurve3(pts.map(p=>new THREE.Vector3(p.x,0,p.z)),false,'catmullrom',.5);
  const len=cur.getLength(),M=Math.ceil(len)+1,Q=cur.getSpacedPoints(M-1);
  const X=new Float32Array(M),Z=new Float32Array(M),Y=new Float32Array(M),R=new Uint8Array(M);
  for(let j=0;j<M;j++){X[j]=Q[j].x;Z[j]=Q[j].z;const road=latAt(X[j],Z[j])<HW+.6;R[j]=road?1:0;
    Y[j]=road?groundAt(X[j],Z[j]):meshY(X[j],Z[j]);}
  const T={X,Z,Y,R,M,len:len};
  const end=(j0,j1)=>{const p=avenynTramAt(T,j0),q=avenynTramAt(T,j1);return {x:p.x,z:p.z,yaw:Math.atan2(q.x-p.x,q.z-p.z)};};
  T.stopA=end(8,9);T.stopB=end(len-8,len-9);
  /* where the line is on the road: the first and the last metre of tarmac */
  let r0=-1,r1=-1;for(let j=0;j<M;j++)if(R[j]){if(r0<0)r0=j;r1=j;}
  T.r0=r0*len/(M-1);T.r1=r1*len/(M-1);
  return T;
}
/** a point on the tram line, s metres along: position, height, heading and right vector */
function avenynTramAt(T,s){
  const f=clamp(s/T.len,0,1)*(T.M-1),j=Math.min(T.M-2,Math.floor(f)),t=f-j;
  const x=lerp(T.X[j],T.X[j+1],t),z=lerp(T.Z[j],T.Z[j+1],t),dx=T.X[j+1]-T.X[j],dz=T.Z[j+1]-T.Z[j],l=Math.hypot(dx,dz)||1;
  return {x,z,y:lerp(T.Y[j],T.Y[j+1],t),yaw:Math.atan2(dx,dz),fx:dx/l,fz:dz/l,rx:-dz/l,rz:dx/l,road:!!(T.R[j]||T.R[j+1])};
}
/** one car of the tram: blue below, cream above, windows with passengers, a destination board at each end */
function avenynTramCar(end){
  const g=new THREE.Group(),blue=psMat({color:0x2a5aa8}),cream=psMat({color:0xf2ead4}),dark=psMat({color:0x2a3440});
  hoorBox(g,2.6,1.3,9,blue,0,.95,0);hoorBox(g,2.6,1.5,9,cream,0,2.35,0);hoorBox(g,2.4,.3,8.6,psMat({color:0xb8bcc0}),0,3.25,0);
  for(const s of [-1,1])hoorBox(g,.06,.9,7.6,dark,s*1.31,2.4,0);
  for(const z of [-4.52,4.52])hoorBox(g,2.2,1,.06,dark,0,2.4,z);
  const skin=[0xe8bc98,0xc89a74,0xf0cca8];
  for(let n=0;n<6;n++){const s=n%2?1:-1,z=-3+Math.floor(n/2)*3;hoorBox(g,.3,.36,.3,psMat({color:skin[n%3]}),s*.95,2.55,z);
    hoorBox(g,.5,.5,.4,psMat({color:[0x6a4a8a,0xc8321f,0x3a7a4a][n%3]}),s*.95,2.1,z);}
  hoorBox(g,.1,1.4,.1,psMat({color:0x2a2c30}),0,4,0);hoorBox(g,1.4,.08,.1,psMat({color:0x2a2c30}),0,4.7,0);   /* the pantograph */
  for(const s of [-1,1])for(const z of [-3,3])hoorBox(g,.3,.5,.9,psMat({color:0x1e2022}),s*1.1,.2,z);
  hoorMerge(g);
  {const b=new THREE.Mesh(new THREE.PlaneGeometry(1.9,.4),psMat({map:pixTex(64,14,c=>{c.fillStyle='#14161a';c.fillRect(0,0,64,14);
      c.fillStyle='#ffa83a';c.font='7px "Press Start 2P",monospace';c.textAlign='center';c.textBaseline='middle';c.fillText('MÅLGÅNG',32,8);}),unlit:true,side:THREE.DoubleSide}));
    b.position.set(0,3.05,end*4.53);if(end<0)b.rotation.y=Math.PI;g.add(b);
    const hl=new THREE.Mesh(flat(new THREE.BoxGeometry(2,.18,.06)),psMat({color:0xfff2c0,unlit:true}));hl.position.set(0,1.2,end*4.53);g.add(hl);}
  return g;
}
/** the tram's bell: two bright dings */
function avenynBell(vol){
  if(!actx)return;
  for(const d of [0,.22]){audioTone(1320,1280,.32,.05*(vol||1),'triangle',d);audioTone(2640,2600,.18,.02*(vol||1),'sine',d);}
}
function hazardsAvenyn(H){
  vastPA();
  const T=AVENYN.tram||avenynTramLine();AVENYN.tram=T;
  /* the tram: 40 s timetable, out and back. Each way: wait at the stop, bell and lamps, then
     a slow, steady crossing along the outside of the corner. The inside half stays open. */
  {const PER=40,CAR=9,GAP=1.2,TL=2*CAR+GAP;
    const cars=[avenynTramCar(1),avenynTramCar(-1)];
    const tg=new THREE.Group();tg.add(cars[0]);tg.add(cars[1]);world.add(tg);
    const s0=3+TL,s1=T.len-3;                                   /* front of the tram at either stop */
    let cyc=-1,dingT=0;
    const place=(sFront,dir)=>{                                 /* dir +1: A to B, -1: B to A */
      const out=[];
      for(let n=0;n<2;n++){const sc=dir>0?sFront-CAR/2-n*(CAR+GAP):T.len-sFront+CAR/2+n*(CAR+GAP);
        const p=avenynTramAt(T,sc),c=cars[n];c.position.set(p.x,p.y,p.z);c.rotation.y=p.yaw+(dir>0?0:Math.PI);
        out.push({x:p.x,z:p.z,y:p.y,fx:p.fx,fz:p.fz,rx:p.rx,rz:p.rz,road:p.road});}
      return out;
    };
    H.push({id:'spårvagn',period:PER,phase:6,mesh:tg,
      update(u,dt){
        const half=u<.5?0:1,v=(u-half*.5)*2,dir=half?-1:1;
        const c=Math.floor((raceTime+6)/PER)*2+half;if(c!==cyc){cyc=c;this.hitSet=new Set();}
        /* 0..0.2 at the stop, 0.2..0.32 bell and lamps, then 0.32..0.92 the crossing, eased in and out */
        const w=smooth(.32,.92,v);
        const sF=lerp(s0,s1,w*w*(3-2*w)*.5+w*.5);
        this.cars=place(sF,dir);
        const r0=dir>0?T.r0:T.len-T.r1,r1=dir>0?T.r1:T.len-T.r0;     /* the tarmac, in this trip's metres */
        const sRear=sF-TL,onRoad=sF>r0-2&&sRear<r1+2;
        const warn=(v>.2&&v<.32)||(v>=.32&&v<.97&&(onRoad||sF<r0));
        this.warn=warn;
        const flash=warn&&Math.floor(clock*3)%2;
        if(AVENYN.lamps)AVENYN.lamps.forEach(L=>{L[0].material.uniforms.uColor.value.setHex(warn&&flash?0xff3a2a:0x4a1010);
          L[1].material.uniforms.uColor.value.setHex(warn&&!flash?0xff3a2a:0x4a1010);});
        const near=player&&state==='race'&&Math.hypot(player.x-T.X[T.M>>1],player.z-T.Z[T.M>>1])<110;
        dingT-=dt||0;if(near&&warn&&dingT<=0){dingT=1.6;avenynBell(.8);}
      },
      hit(k){
        if(k.rib||k.air||!this.cars||(this.hitSet&&this.hitSet.has(k)))return false;
        for(const c of this.cars){if(!c.road)continue;
          const dx=k.x-c.x,dz=k.z-c.z,f=dx*c.fx+dz*c.fz,l=dx*c.rx+dz*c.rz;
          if(Math.abs(f)<CAR/2+.9&&Math.abs(l)<1.3+.9&&Math.abs(k.y-c.y)<3)return true;}
        return false;
      },
      effect(k){
        if(this.hitSet)this.hitSet.add(k);                    /* one knock per crossing, never pinned */
        k.slow=Math.max(k.slow,.7);k.vx*=0.55;k.vz*=0.55;k.boost=0;k.drift=0;k.charge=0;
        for(let p=0;p<12;p++)puff(k.x+rand(-1.2,1.2),k.y+rand(.3,1.6),k.z+rand(-1.2,1.2),.7,.72,.8,.6);
        if(k===player){toast('SPÅRVAGNEN!');avenynBell(1.3);shake=Math.min(1,shake+.35);}
      }});
  }
  /* for show: the fountain sweeps its spray over the mosaic, the stage lights, the gulls, the announcer */
  {const F=AVENYN.fount,D=AVENYN.drop,m4=new THREE.Matrix4();let said=false,mist=0;
    H.push({id:'avenynShow',period:12,phase:0,
      update(u,dt){
        if(stage.id!=='avenyn')return;
        if(F&&D){const sweep=Math.sin(u*Math.PI*2)*1.3,n=D.instanceMatrix.count;let c=0;
          const cx=camera.position.x-F.x,cz=camera.position.z-F.z;
          if(cx*cx+cz*cz<200*200){
            for(let k=0;k<30&&c<n;k++){const t=((clock*.7+k/30)%1),a=sweep+(k%5-2)*.07,r=2+t*13;     /* the sweeping arc */
              D.setMatrixAt(c++,m4.makeTranslation(F.x+Math.cos(a)*r,F.y+4.2+Math.sin(Math.PI*t)*5,F.z+Math.sin(a)*r));}
            for(let k=0;k<24&&c<n;k++){const t=((clock*1.1+k/24)%1),a=k/24*6.283;              /* the crown on the bowl */
              D.setMatrixAt(c++,m4.makeTranslation(F.x+Math.cos(a)*(.6+t*2.4),F.y+3.8+Math.sin(Math.PI*t)*2.2,F.z+Math.sin(a)*(.6+t*2.4)));}
            for(let k=0;k<12&&c<n;k++){const t=((clock*.9+k/12)%1);                              /* the fish spouts upward */
              D.setMatrixAt(c++,m4.makeTranslation(F.x+Math.sin(k)*.3,F.y+8.6+t*3-t*t*3,F.z+Math.cos(k)*.3));}
            mist-=dt||0;if(mist<0){mist=.3;const a=sweep,r=rand(9,15);puff(F.x+Math.cos(a)*r,F.y+.6,F.z+Math.sin(a)*r,.86,.92,.98,.9);}
          }
          D.count=c;D.instanceMatrix.needsUpdate=true;}
        if(AVENYN.lights)AVENYN.lights.forEach((l,n)=>{const on=Math.sin(clock*3+n*1.3)>0;l.visible=on;});
        if(AVENYN.fly)for(const f of AVENYN.fly){const a=clock*.5+f.ph;
          f.g.position.set(f.cx+Math.cos(a)*f.r,f.cy+Math.sin(clock*.9+f.ph)*.8,f.cz+Math.sin(a)*f.r);f.g.rotation.y=-a;
          const fl=Math.sin(clock*7+f.ph)*.45;f.wl.rotation.z=fl;f.wr.rotation.z=-fl;}
        /* the announcer, once, as the last lap starts */
        if(raceTime<1)said=false;
        if(!said&&state==='race'&&player&&player.lap===LAPS-1&&raceTime>5){said=true;vastPA('Nästa hållplats: målgång. Förhoppningsvis.');}
      }});
  }
}

/** the stage's postcard, for the picnic passport: a tram passenger, unbothered, as the karts
    flash past the café tables. Drawn on a 192 x 120 canvas, shown pixelated. */
function avenynPostcard(g,w,h){
  const R=(c,x,y,a,b)=>{g.fillStyle=c;g.fillRect(x,y,a,b);};
  const sky=g.createLinearGradient(0,0,0,64);sky.addColorStop(0,'#3c62a4');sky.addColorStop(1,'#f2c49c');
  g.fillStyle=sky;g.fillRect(0,0,w,64);
  R('#ffd8a0',164,22,18,18);R('#ffe6b0',167,25,12,12);                                               /* the low sun */
  for(let x=0;x<w;x+=24){const t=22+((x*11)%18);R(['#d8b46a','#e8dcc0','#c8a888','#a9b89a'][(x/24)%4],x,64-t,22,t);   /* the street */
    for(let y=66-t;y<60;y+=6)for(let wx=x+3;wx<x+19;wx+=5)R('#5a5a6a',wx,y,2,3);}
  R('#222226',0,20,w,1);                                                                               /* the tram wire */
  R('#47464a',0,64,w,56);R('#2a2a2e',0,63,126,1);R('#6a6660',0,66,126,1);                                /* the road, the rails */
  /* the tram, top half of the picture, a passenger at the window with her paper */
  R('#f2ead4',4,34,120,16);R('#2a5aa8',4,50,120,12);R('#b8bcc0',6,32,116,2);R('#2a2c30',60,21,1,11);
  for(let x=10;x<120;x+=18)R('#2a3440',x,37,14,10);
  R('#e8bc98',48,39,5,5);R('#8a5a3a',47,38,7,2);R('#6a4a8a',46,44,8,3);R('#f4f2ec',53,42,8,5);R('#9aa4ae',54,43,6,1);R('#9aa4ae',54,45,6,1);
  R('#14161a',100,52,20,5);g.fillStyle='#ffa83a';g.font='5px monospace';g.fillText('MÅLGÅNG',101,56);
  /* the café tables along the kerb, a gull on one */
  for(const x of [134,160,184]){R('#f4f2ec',x-6,82,12,2);R('#2a2c30',x-1,84,2,8);R('#c8321f',x-8,70,16,3);R('#2a2c30',x,73,1,9);}
  R('#f4f6f8',156,77,6,4);R('#9aa4ae',157,77,4,2);R('#f2c81c',162,78,2,1);
  /* the karts going past, speed lines behind */
  const cols=['#c8321f','#2a5aa8','#f2c81c'];
  cols.forEach((c,n)=>{const x=20+n*38,y=92+(n%2)*10;R('#1e2022',x,y+8,4,4);R('#1e2022',x+11,y+8,4,4);R(c,x-1,y+2,17,7);R('#e8bc98',x+6,y-3,5,5);R('#22242a',x+6,y-4,5,2);
    g.fillStyle='rgba(244,242,236,.6)';for(let k=0;k<3;k++)g.fillRect(x-14-k*3,y+3+k*2,10,1);});
  /* the stamp corner and the greeting */
  R('#f4efe2',156,92,30,22);R('#2a5aa8',158,94,26,18);R('#f2ead4',161,99,20,6);R('#2a3440',163,100,4,3);R('#2a3440',170,100,4,3);
  g.fillStyle='#fff';g.font='bold 11px "Titillium Web",sans-serif';g.textAlign='left';g.fillText('Hälsningar från Avenyn!',6,14);
  g.lineWidth=2;g.strokeStyle='#fff';g.strokeRect(1,1,w-2,h-2);
}
const AVENYN={key:'',spot:null,anim:[],gulls:[],fly:null,fount:null,drop:null,lights:null,lamps:null,tram:null};
