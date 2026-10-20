"use strict";
/* ───────── Lerum ───────── */
/* Aspenäsvarvet: Amanda's home track and the first guest track outside Skåne. A fictional
   Aspenäs: three laps through a leafy radhusområde, down to the lake and back up the hill
   before the barbecue is ready. Not a LEGO Racers counterpart. */
SURF.lerumGrus={top:o=>o+(1-o)*0.45,grip:o=>1-0.40*(1-o),fuel:1.1,name:'GRUS'};
SFX.lerumGrus=SFX.gravel;
ROADTEX.lerumGrus=()=>pixTex(64,64,g=>{               /* the shore path: pale gravel, pine needles, two ruts */
  g.fillStyle='#b6a888';g.fillRect(0,0,64,64);
  for(let i=0;i<1000;i++){g.fillStyle=Math.random()>.5?'rgba(222,212,186,.6)':'rgba(116,100,76,.5)';
    g.fillRect((Math.random()*64)|0,(Math.random()*64)|0,1,1);}
  g.fillStyle='rgba(130,112,86,.4)';for(const x of [14,21,41,48])g.fillRect(x,0,3,64);
  g.fillStyle='rgba(120,84,48,.55)';for(let i=0;i<40;i++)g.fillRect((Math.random()*62)|0,(Math.random()*62)|0,3,1);
});
VERGEC.lerum=['#5e8a3e','#72a04a','#4a7432'];          /* clipped lawn right up to the kerb */
GROUND.lerum={cell:30,stripe:1.1,verge:0x6a9446,
  cols:[0x5f9a42,0x6aa64a,0x579038,0x74aa50,0x4f8a3a,0x66a046]};

/* the lake lies south of the shore road; d > 0 is out in the water */
const LERUM_SHORE=166;
const lerumLake=(x,z)=>z-LERUM_SHORE-6*Math.sin(x*.021)-3*Math.cos(x*.047);
const lerumSlope=z=>lerp(20,1.2,smooth(-125,135,z));

STAGES.push({ id:'lerum', group:'vastgota', name:'LERUM', sub:'ASPENÄSVARVET',
  order:21, tag:'Lugnt område. Oroliga grannar. Tre varv genom radhusen, ner till badplatsen och hem innan grillen är varm. Amanda hittar. Teo kör efter GPS:en.',
  view:{i:398,lat:2,h:3.4,to:{i:420,lat:-16,h:.5},fov:58},
  hw:7.8,
  bars:[0.70,0.75,0.65], laps:3, stand:false, bankGain:0.12, bankMax:0.16,   /* residential streets: hardly banked */
  blurb:'Amanda\'s home track, her guest track outside Skåne: three laps through a leafy radhusområde, down to the lake and back uphill before the barbecue is ready. Matching garages, clipped hedges, bicycle sheds and picnic tables. Slalom between the houses, jump the crest on the way down, fly along the bathing beach, round the communal green where the neighbours sit in folding chairs, and climb home. A sprinkler soaks one corner and a wheelie bin rattles out of the collection point.',
  role:'Radhuskurvor, en backe ner till sjön, en lång strandraka och grannarna i grillkurvan.',
  sky:[0xe4eef2,0x3f86d4], fog:[0xcfdde4,80,380], amb:0x66707c, dif:0xfff2da,
  road:'asphalt', verge:'lerum', edge:'lerum', ground:'lerum',
  /* the lake: the land falls away under the beach */
  shore:(x,z)=>-12*smooth(-4,26,lerumLake(x,z)),
  land:(x,z,out)=>landLerum(x,z,out),
  /* the area slopes down to the lake as a whole: away from the streets the ground follows the slope, not the nearest road */
  mod:(x,z,t)=>t*(lerumSlope(z)-sy[nearestGlobal(x,z)])-rolls(x,z)*t*0.75,
  stations:[[0.33,1],[0.80,1]],
  jumpSpec:[{at:188,h:2.8,drop:2.2,up:11,dn:7,rec:16}],
  ctrl:[[ -60,20,-160],[ -20,20,-161],[  16,20,-160],
        [  48,20,-144],[  80,20,-168],[ 112,20,-144],[ 142,20,-166],
        [ 172,19,-148],[ 188,18,-108],
        [ 192,15, -60],[ 190,11, -15],[ 184, 7,  35],[ 176, 3,  85],
        [ 160,1.5,125],[ 126,1, 146],
        [  70,1, 152],[  10,1, 154],[ -40,1, 150],
        [ -72,1.5,136],[ -86,2, 112],[ -96,2.5,92],[-114,3, 80],[-136,3, 82],[-150,2.5,96],[-158,2,116],
        [-170,1, 138],[-200,1, 150],[-235,1.5,148],
        [-262,3, 120],[-270,6,  80],[-268,10, 30],[-262,14,-20],[-254,17,-70],
        [-238,19,-110],[-200,20,-130],[-170,20,-152],[-120,20,-162]],
  routes:[
    {id:'garage',name:'BAKOM GARAGEN',a:14,b:164,hw:3.6,side:-1,lead:14,leadLat:8,
     mid:[[0.124,-27],[0.54,-54],[0.833,-68],[0.98,-40]],surface:'road',tex:'asphalt',risk:0.35,
     blurb:'The paved service lane behind the garage row. Tight in between the bins, a kink on the way out.'},
    {id:'strand',name:'STRANDSTIGEN',a:338,b:492,hw:4.0,side:-1,lead:14,leadLat:8,
     mid:[[0.5,-4]],surface:'lerumGrus',tex:'lerumGrus',risk:0.4,
     blurb:'The gravel path along the water\'s edge, past the reeds. Shorter than the road round the green, but loose underfoot.'}],
  stamps:[
    {id:'ler1',dish:'Kanelbulle',ini:'K',kind:'intro',route:'main',i:300,lat:-5.6,
     hint:'Vid picknickborden på badplatsrakan.',
     story:'Every Swedish coffee break has a kanelbulle in it: a soft cardamom dough rolled up with butter, sugar and cinnamon, knotted or curled and topped with pearl sugar. The radhusområde bakes them in batches for the summer party and leaves a tray on the picnic table by the beach.'},
    {id:'ler2',dish:'Termoskaffe',ini:'T',kind:'route',route:'strand',f:0.5,lat:0,
     hint:'Mitt på Strandstigen, nere vid vattnet.',
     story:'Bryggkaffe in a thermos: brewed strong at home, poured into a battered steel flask and carried down to the jetty with a bag of buns. Somebody always forgets the cups, so it gets drunk out of the lid, passed round, while the lake goes quiet.'},
    {id:'ler3',dish:'Jordgubbssaft',ini:'J',kind:'route',route:'garage',f:0.5,lat:0,
     hint:'Bakom garagen, mitt i servicegränden.',
     story:'Homemade strawberry cordial from the allotment\'s berries: crushed, boiled with sugar and bottled in old glass bottles. Diluted in a big jug with ice for the barbecue on the green, it is bright red, very sweet and the reason every child in the area has a pink moustache in July.'}],
  postcard:{draw:(g,w,h)=>lerumPostcard(g,w,h),
    caption:'Amandas vinröda kombi vid sjön. Teo håller kartan upp och ner.'},
  hazards:H=>hazardsLerum(H), scenery:()=>sceneryLerum()
});


/* the edge: a clipped hedge along the radhus streets, open lawn down by the water */
EDGES.lerum=st=>{
  const step=3,hedge=rosInst(flat(new THREE.BoxGeometry(1.1,1.3,SEG*step+.2)),psMat({color:0x3f7a34}),N*2);
  for(let i=0;i<N;i+=step)for(const side of [-1,1]){
    const o=side*(HW+4.3),x=sx[i]+rx[i]*o,z=sz[i]+rz[i]*o;
    if(nearAlt(x,z,2.6)||lerumLake(x,z)>-24||lerumOnGreen(x,z,4))continue;
    if(stations.some(S=>{let d=i-S.at;if(d<-N/2)d+=N;else if(d>N/2)d-=N;return S.side===side&&d>-3&&d<S.len+3;}))continue;
    hedge.put(x,meshY(x,z)+.55,z,Math.atan2(fx[i],fz[i]));
  }
  hedge.done();
};
/** the communal green inside Grillkvällens kurva: the main road's most inland sample on the bend round it */
const LERUM={tip:-1,key:'',gx:0,gz:0,spr:null,heads:[],grill:null,smokeT:0};
function lerumTip(){
  const key=sx[400]+','+sz[400];if(key===LERUM.key)return LERUM.tip;      /* once per laid track */
  let best=-1,bz=1e9;
  for(let i=360;i<480;i++)if(sz[i]<bz){bz=sz[i];best=i;}
  LERUM.key=key;LERUM.tip=best;LERUM.gx=sx[best];LERUM.gz=sz[best]+HW+24;
  return best;
}
function lerumOnGreen(x,z,pad){
  if(stage.id!=='lerum')return false;
  lerumTip();
  return Math.abs(x-LERUM.gx)<22+(pad||0)&&Math.abs(z-LERUM.gz)<20+(pad||0)&&latAt(x,z)>HW+1;
}
function landLerum(x,z,out){
  if(lerumOnGreen(x,z,0)){out.setHex(Math.floor((x-LERUM.gx)/4)&1?0x74b452:0x68a848);return;}   /* the mown green */
  const d=lerumLake(x,z);
  if(d>-4&&d<3)out.setHex(0xe2d4a8);                                                             /* the bathing beach */
}
/** radhus façade, one unit per tile across, one floor per tile up: wooden panels, a white window */
function lerumPanelTex(col){
  const t=pixTex(16,16,g=>{
    g.fillStyle=col;g.fillRect(0,0,16,16);
    g.fillStyle='rgba(0,0,0,.13)';for(let x=1;x<16;x+=2)g.fillRect(x,0,1,16);
    g.fillStyle='#f2efe6';g.fillRect(3,4,10,8);g.fillStyle='#3e4c5a';g.fillRect(4,5,8,6);
    g.fillStyle='#f2efe6';g.fillRect(8,5,1,6);g.fillStyle='rgba(255,240,210,.45)';g.fillRect(4,5,3,2);
    g.fillStyle='rgba(0,0,0,.2)';g.fillRect(0,0,1,16);                      /* the line between two units */
  });
  t.wrapS=t.wrapT=THREE.RepeatWrapping;return t;
}
/** a painted plank sign: a board with a border, the text centred */
function lerumSignTex(text,bg,fg,w,h,px,border){
  return pixTex(w,h,g=>{
    g.fillStyle=bg;g.fillRect(0,0,w,h);
    if(border){g.fillStyle=border;g.fillRect(0,0,w,2);g.fillRect(0,h-2,w,2);g.fillRect(0,0,2,h);g.fillRect(w-2,0,2,h);}
    g.fillStyle=fg;g.font=(px||8)+'px "Press Start 2P",monospace';g.textAlign='center';g.textBaseline='middle';
    g.fillText(text,w/2,h/2+1);
  });
}
/** a neighbour, sitting (on a folding chair) or standing; nose along +z, feet at y=0. Returns {g,head} */
function lerumNeighbour(shirt,hair,sit){
  const g=new THREE.Group(),skin=psMat({color:0xe8bc98}),pants=psMat({color:[0x2f3a52,0x4a4038,0x6a6a6a][Math.floor(shirt%3)]});
  if(sit){
    const cloth=psMat({color:[0x2f78b8,0x3f8a3a,0xc8321f,0xe8a020][shirt%4]}),frame=psMat({color:0xb8bcc0});
    hoorBox(g,.9,.08,.8,cloth,0,.55,0);hoorBox(g,.9,.8,.08,cloth,0,.95,-.42);
    for(const sx_ of [-.42,.42]){hoorBox(g,.05,.6,.05,frame,sx_,.28,.3);hoorBox(g,.05,.6,.05,frame,sx_,.28,-.3);}
    hoorBox(g,.6,.22,.6,pants,0,.68,.1);hoorBox(g,.5,.5,.22,pants,0,.4,.4);
    hoorBox(g,.62,.7,.36,psMat({color:shirt}),0,1.12,-.2);
  }else{
    hoorBox(g,.5,.85,.3,pants,0,.42,0);hoorBox(g,.6,.75,.34,psMat({color:shirt}),0,1.22,0);
  }
  const head=new THREE.Group();head.position.set(0,sit?1.7:1.82,sit?-.18:0);g.add(head);
  hoorBox(head,.36,.38,.34,skin,0,0,0);hoorBox(head,.4,.14,.38,psMat({color:hair}),0,.2,-.02);
  hoorBox(head,.06,.06,.04,psMat({color:0x1e1a1a}),-.09,.04,.18);hoorBox(head,.06,.06,.04,psMat({color:0x1e1a1a}),.09,.04,.18);
  return {g,head};
}
/** Amanda's burgundy touring estate, parked: long roof, roof rails, a map on the dashboard */
function lerumEstate(col){
  const g=new THREE.Group(),paint=psMat({color:col||0x6e1f2c}),glass=psMat({color:0x2a3440}),blk=psMat({color:0x1e2022}),chrome=psMat({color:0xc8ccd0});
  hoorBox(g,1.8,.7,4.6,paint,0,.7,0);hoorBox(g,1.66,.62,3.0,glass,0,1.36,-.3);hoorBox(g,1.7,.08,3.1,paint,0,1.7,-.3);
  hoorBox(g,1.7,.32,.9,paint,0,1.2,1.75);
  for(const s of [-1,1]){hoorBox(g,.05,.06,2.8,chrome,s*.7,1.8,-.3);
    for(const z of [-1.45,1.45]){const w=new THREE.Mesh(flat(new THREE.CylinderGeometry(.36,.36,.26,8)),blk);w.rotation.z=Math.PI/2;w.position.set(s*.86,.36,z);g.add(w);}}
  hoorBox(g,.5,.04,.36,psMat({color:0xf2e6c4}),.3,1.1,1.05);                     /* the map, folded the wrong way */
  return g;
}
function sceneryLerum(){
  lerumTip();
  const RES=[];
  const res=(x,z,r)=>RES.push([x,z,r]);
  const free=(x,z,pad)=>{
    if(latAt(x,z)<HW+pad||lerumLake(x,z)>-16||lerumOnGreen(x,z,pad))return false;
    for(const r of RES)if(Math.hypot(x-r[0],z-r[1])<r[2])return false;
    return true;
  };
  const at=(i,o)=>{const q=mainPt(i,o);q.y=meshY(q.x,q.z);return q;};
  const yawAt=i=>{i=((i%N)+N)%N;return Math.atan2(fx[i],fz[i]);};
  const H=(a,b)=>hash2(a*1.37+3.1,b*0.71-2.3);
  const G=ALTS.find(r=>r.id==='garage'),S=ALTS.find(r=>r.id==='strand');
  const wood=psMat({color:0x7a5a3a}),woodL=psMat({color:0xa07a52}),white=psMat({color:0xeeece4});
  for(const S_ of stations){const q=mainPt(S_.at+6,S_.side*(HW+13));res(q.x,q.z,22);}
  res(LERUM.gx,LERUM.gz,30);

  /* the start: homemade bunting over the grid, the sign with today's exception taped under it */
  {const wd=psMat({color:0x6b5540}),line=psMat({color:0x2a2222});
    const fl=rosInst(flat(new THREE.ConeGeometry(.42,.8,3)).rotateX(Math.PI),psMat({side:THREE.DoubleSide}),300,true);
    const cols=[0x6e1f2c,0xf4efe2,0x2f78d8,0xf2c81c,0x3fa04a,0xe86a9a,0x181c22];
    for(const i of [N-26,N-8,12]){
      const g=new THREE.Group(),y0=sy[(i+N)%N];g.position.set(sx[(i+N)%N],y0,sz[(i+N)%N]);g.rotation.y=yawAt(i);world.add(g);
      for(const sd of [-1,1])hoorBox(g,.25,7,.25,wd,sd*(HW+2.2),3.5,0);
      for(let n=0;n<=18;n++){const t=n/18,x=(t*2-1)*(HW+2.2),y=6.8-(1-(t*2-1)**2)*1.5;
        if(n<18){const x2=((n+1)/18*2-1)*(HW+2.2),y2=6.8-(1-((n+1)/18*2-1)**2)*1.5;
          const sg=hoorBox(g,Math.hypot(x2-x,y2-y),.05,.05,line,(x+x2)/2,(y+y2)/2,0);sg.rotation.z=Math.atan2(y2-y,x2-x);}
        if(n>0&&n<18){const c=Math.cos(yawAt(i)),sn=Math.sin(yawAt(i)),ii=(i+N)%N;
          fl.put(sx[ii]+c*x,y0+y-.45,sz[ii]-sn*x,yawAt(i),1,1,1,cols[n%cols.length]);}}
      hoorMerge(g);}
    fl.done();
    const i=N-14,q=at(i,HW+3.4),g=new THREE.Group();g.position.set(q.x,q.y,q.z);g.rotation.y=yawAt(i)+Math.PI;world.add(g);
    hoorBox(g,.12,2.6,.12,psMat({color:0x8a9096}),-.9,1.3,0);hoorBox(g,.12,2.6,.12,psMat({color:0x8a9096}),.9,1.3,0);
    const sg=new THREE.Mesh(new THREE.PlaneGeometry(2.6,1.1),psMat({map:lerumSignTex('MOTORTRAFIK',  '#f4f2ec','#1e2022',96,40,8,'#c8281c'),unlit:true,side:THREE.DoubleSide}));
    sg.position.set(0,2.75,0);g.add(sg);
    const sg2=new THREE.Mesh(new THREE.PlaneGeometry(2.6,.5),psMat({map:lerumSignTex('UNDANBEDES','#f4f2ec','#1e2022',96,18,8),unlit:true,side:THREE.DoubleSide}));
    sg2.position.set(0,2.3,.01);g.add(sg2);
    const tape=new THREE.Mesh(new THREE.PlaneGeometry(1.8,.42),psMat({map:pixTex(64,16,c=>{
      c.fillStyle='#fffbe8';c.fillRect(0,0,64,16);c.fillStyle='rgba(200,200,190,.8)';c.fillRect(0,0,6,16);c.fillRect(58,0,6,16);
      c.fillStyle='#c8281c';c.font='bold 10px "Comic Sans MS",cursive';c.textAlign='center';c.textBaseline='middle';c.fillText('UTOM IDAG!',32,9);}),unlit:true,side:THREE.DoubleSide}));
    tape.position.set(.1,1.8,.02);tape.rotation.z=-.08;g.add(tape);
    const ban=new THREE.Mesh(new THREE.PlaneGeometry(2*HW+3,1.8,8,1),psMat({map:horbyBannerTex('ASPENÄSVARVET',160,22),unlit:true,side:THREE.DoubleSide}));
    const pa=ban.geometry.attributes.position;
    for(let v=0;v<pa.count;v++){const x=pa.getX(v)/(HW+1.5);pa.setY(v,pa.getY(v)-(1-x*x)*.5);}
    const ii=N-26,bg=new THREE.Group();bg.position.set(sx[ii],sy[ii],sz[ii]);bg.rotation.y=yawAt(ii)+Math.PI;world.add(bg);ban.position.set(0,5.2,0);bg.add(ban);}   /* read on the way in */

  /* matching garages: a row along the start, and the row the service lane runs behind */
  {const body=rosInst(flat(new THREE.BoxGeometry(3.3,2.6,6)).translate(0,1.3,0),psMat({color:0x8a6a4c}),200);
    const door=rosInst(flat(new THREE.BoxGeometry(2.7,2.1,.1)).translate(0,1.05,0),psMat({map:pixTex(16,16,c=>{c.fillStyle='#eeece4';c.fillRect(0,0,16,16);
      c.fillStyle='rgba(0,0,0,.14)';for(let y=2;y<16;y+=3)c.fillRect(0,y,16,1);c.fillStyle='#8a9096';c.fillRect(7,9,2,1);})}),200);
    const top=rosInst(flat(new THREE.BoxGeometry(3.5,.22,6.6)),psMat({color:0x3b3f44}),200);
    const put=(x,z,yw,tx,tz)=>{const y=meshY(x,z);body.put(x,y-.1,z,yw);top.put(x,y+2.6,z,yw);door.put(x+tx*3.05,y,z+tz*3.05,yw);};
    /* along the start alley, on the left, doors to the road */
    for(let i=N-56;i<N+10;i+=1.6){const ii=Math.round(i)%N,q=mainPt(ii,-(HW+8)),y=meshY(q.x,q.z);
      if(!free(q.x,q.z,4)||nearAlt(q.x,q.z,5))continue;
      put(q.x,q.z,yawAt(ii)+Math.PI/2,rx[ii],rz[ii]);}
    if(G){for(let j=COMMIT+6;j<G.n-MERGE-4;j+=1.6){const q=lanePt(G,j/(G.n-1),G.hw+4.4);
      if(latAt(q.x,q.z)<0||nearAltMain(q.x,q.z)<HW+5)continue;
      put(q.x,q.z,q.yaw+Math.PI/2,q.rx,q.rz);res(q.x,q.z,5);}}
    body.done();door.done();top.done();}

  /* Bakom garagen: wheelie bins right up to the line at the way in, bins and a fence along the back */
  if(G){
    const bin=rosInst(flat(new THREE.BoxGeometry(.7,1.1,.8)).translate(0,.55,0),psMat({}),200,true);
    const lid=rosInst(flat(new THREE.BoxGeometry(.76,.1,.86)),psMat({}),200,true);
    const binC=[0x3f6a3a,0x5a4030,0x3b4048,0x2f62a8];
    for(let j=COMMIT+1;j<G.n-MERGE;j++)for(const sd of [-1,1]){
      const tight=j<COMMIT+7||j>G.n-MERGE-8;                    /* the way in and the way out: bins to the line */
      if(!tight&&(sd>0||j%5))continue;
      const q=lanePt(G,j/(G.n-1),sd*(G.hw+(tight?.55:1.2)));
      if(nearAltMain(q.x,q.z)<HW+.8)continue;
      const c=binC[Math.floor(H(j,sd)*4)],y=meshY(q.x,q.z);
      bin.put(q.x,y,q.z,q.yaw+rand(-.2,.2),1,1,1,c);lid.put(q.x,y+1.14,q.z,q.yaw,1,1,1,c);
    }
    bin.done();lid.done();
    /* a plank fence along the far side of the lane, the gardens behind it */
    const plank=rosInst(flat(new THREE.BoxGeometry(.1,1.6,2.1)).translate(0,.8,0),psMat({color:0x8a6a4c}),G.n);
    for(let j=COMMIT+8;j<G.n-MERGE-8;j++){const q=lanePt(G,j/(G.n-1),-(G.hw+2.4));
      if(nearAltMain(q.x,q.z)<HW+3)continue;plank.put(q.x,meshY(q.x,q.z),q.z,q.yaw);}
    plank.done();
    const q=lanePt(G,(COMMIT+3)/(G.n-1),G.hw+1.6),g=new THREE.Group();g.position.set(q.x,meshY(q.x,q.z),q.z);g.rotation.y=q.yaw+Math.PI;world.add(g);
    hoorBox(g,.12,2.3,.12,psMat({color:0x8a9096}),0,1.15,0);
    const sg=new THREE.Mesh(new THREE.PlaneGeometry(2.4,.9),psMat({map:lerumSignTex('ENDAST BEHÖRIGA','#f4f2ec','#1e2022',96,36,7,'#2f62a8'),unlit:true,side:THREE.DoubleSide}));
    sg.position.set(0,2.4,0);g.add(sg);
  }

  /* radhus rows along the streets, each row one colour, pitched roofs, a bike shed now and then */
  const RCOL=[0xd9a441,0x8b2b1c,0xe8e4da,0x7d93a8,0x9fb89a,0xc89a6a];
  const UNIT=6.4,D=9,HT=5.6;
  const rows=RCOL.map(c=>({c,m:[]}));
  const roofs=[],sheds=[];
  const tryRow=(x,z,yw,units,pad)=>{
    const L=units*UNIT,c=Math.cos(yw),s=Math.sin(yw);
    for(const [lx,lz] of [[-L/2,-D/2],[L/2,-D/2],[-L/2,D/2],[L/2,D/2],[0,0],[-L/4,0],[L/4,0]]){
      const wx=x+c*lx+s*lz,wz=z-s*lx+c*lz;
      if(!free(wx,wz,pad)||nearAlt(wx,wz,4))return false;
    }
    const k=Math.floor(hash2(x*.13,z*.17)*RCOL.length);
    rows[k].m.push([x,meshY(x,z),z,yw,units]);roofs.push([x,z,yw,L]);res(x,z,L/2+2);
    return true;
  };
  for(const [i0,i1,sd] of [[N-70,128,1],[150,200,1],[536,N-60,1],[536,N-40,-1],[146,176,-1]]){
    let last=-99;
    for(let i=i0;i<i1;i++){
      if(i-last<16)continue;
      const ii=((i%N)+N)%N,units=3+Math.floor(H(ii,sd)*3),q=mainPt(ii,sd*(HW+9.5+D/2));
      if(tryRow(q.x,q.z,yawAt(ii)+Math.PI/2,units,4.5)){last=i;if(H(sd,ii)>.55)sheds.push(mainPt(ii+units*2,sd*(HW+7.2)));}
    }
  }
  for(let gx=-230;gx<=170;gx+=38)for(let gz=-120;gz<=90;gz+=26){        /* the blocks behind, off the race streets */
    const x=gx+H(gx,gz)*10,z=gz+H(gz,gx)*8;
    tryRow(x,z,H(gx*3,gz)>.5?0:Math.PI/2,3+Math.floor(H(gz,gx*2)*3),9);
  }
  rows.forEach(r=>{
    if(!r.m.length)return;
    const mats={};
    for(const [x,y,z,yw,u] of r.m){
      const M=mats[u]||(mats[u]=rosInst(rosBoxUV(u*UNIT,HT,D,UNIT,HT/2),psMat({map:lerumPanelTex('#'+r.c.toString(16).padStart(6,'0'))}),40));
      M.put(x,y-.2,z,yw);
    }
    for(const k in mats)mats[k].done();
  });
  {const roof=rosInst(rosPrism(),psMat({}),200,true);
    for(const [x,z,yw,L] of roofs)roof.put(x,meshY(x,z)+HT-.2,z,yw,L+.8,2.6,D+1.2,H(x,z)>.5?0x3b3f44:0x7a3a2c);
    roof.done();}
  /* bicycle sheds: a little roof on posts, a rack of bikes */
  {const post=rosInst(flat(new THREE.BoxGeometry(.12,2.2,.12)),wood,200),top=rosInst(flat(new THREE.BoxGeometry(4.4,.14,2.2)),psMat({color:0x3b3f44}),60);
    const bike=rosInst(flat(new THREE.BoxGeometry(.08,.9,1.6)),psMat({}),300,true);
    for(const q of sheds){const x=q.x,z=q.z,y=meshY(x,z);if(!free(x,z,2.5))continue;res(x,z,4);
      for(const [a,b] of [[-2,-1],[2,-1],[-2,1],[2,1]])post.put(x+Math.cos(q.yaw)*a+Math.sin(q.yaw)*b,y+1.1,z-Math.sin(q.yaw)*a+Math.cos(q.yaw)*b,q.yaw);
      top.put(x,y+2.2,z,q.yaw);
      for(let n=0;n<5;n++){const a=-1.6+n*.8;bike.put(x+Math.cos(q.yaw)*a,y+.5,z-Math.sin(q.yaw)*a,q.yaw+Math.PI/2,1,1,1,[0xc8321f,0x2f78d8,0x1e2022,0x3fa04a,0xe8e4da][(n+Math.floor(x))%5]);}}
    post.done();top.done();bike.done();}

  /* the collection point in the slalom, where the wheelie bin lives */
  {const i=LERUM_BIN.i,sd=LERUM_BIN.sd,q=at(i,sd*(HW+6.5)),g=new THREE.Group();g.position.set(q.x,q.y,q.z);g.rotation.y=yawAt(i);world.add(g);
    res(q.x,q.z,7);
    hoorBox(g,6,.12,3,psMat({color:0x9a958c}),0,.06,0);
    for(const [x,z] of [[-2.9,-1.4],[2.9,-1.4],[-2.9,1.4],[2.9,1.4]])hoorBox(g,.12,2.4,.12,wood,x,1.2,z);
    hoorBox(g,6.4,.14,3.4,psMat({color:0x3f6a3a}),0,2.45,0);
    const cols=[0x3f6a3a,0x5a4030,0xc8321f,0x2f62a8,0xf2c81c];
    cols.forEach((c,n)=>{if(n===2)return;hoorBox(g,.8,1.15,.9,psMat({color:c}),-2.2+n*1.1,.6,sd*.6);});
    const sg=new THREE.Mesh(new THREE.PlaneGeometry(2.6,.6),psMat({map:lerumSignTex('ÅTERVINNING','#3f6a3a','#f4f2ec',96,22,7),unlit:true,side:THREE.DoubleSide}));
    sg.position.set(0,2.85,0);sg.rotation.y=sd>0?Math.PI:0;g.add(sg);
    hoorMerge(g);}

  /* the crest on the way down: a bump sign before it, and a white landing box after */
  {const J=JUMPS[0];
    if(J){const i=J.at-J.up-16,q=at(i,-(HW+3.2)),g=new THREE.Group();g.position.set(q.x,q.y,q.z);g.rotation.y=yawAt(i)+Math.PI;world.add(g);
      hoorBox(g,.12,2.4,.12,psMat({color:0x8a9096}),0,1.2,0);
      const tri=new THREE.Mesh(new THREE.PlaneGeometry(1.4,1.25),psMat({map:pixTex(32,28,c=>{
        c.fillStyle='#c8281c';c.beginPath();c.moveTo(16,0);c.lineTo(32,28);c.lineTo(0,28);c.fill();
        c.fillStyle='#f2c81c';c.beginPath();c.moveTo(16,5);c.lineTo(28,25);c.lineTo(4,25);c.fill();
        c.fillStyle='#1e2022';c.beginPath();c.arc(16,22,5,Math.PI,0);c.fill();c.fillRect(6,22,20,2);}),unlit:true,transparent:true,alphaTest:.5,side:THREE.DoubleSide}));
      tri.position.set(0,2.8,0);g.add(tri);
      const pl=new THREE.Mesh(new THREE.PlaneGeometry(1.2,.4),psMat({map:lerumSignTex('GUPP','#f4f2ec','#1e2022',48,16,8),unlit:true,side:THREE.DoubleSide}));
      pl.position.set(0,1.95,0);g.add(pl);
      const paint=psMat({color:0xf4f2ec,unlit:true,transparent:true,opacity:.85,depthWrite:false});
      for(const k of [J.dn+5,J.dn+12])for(let l=-1;l<=1;l+=2){const ii=(J.at+k)%N,a=mainPt(ii,l*(HW-1.4));
        const m=new THREE.Mesh(new THREE.PlaneGeometry(.5,SEG*7).rotateX(-Math.PI/2),paint);m.position.set(a.x,a.y+.06,a.z);m.rotation.y=a.yaw;world.add(m);}
      for(const k of [J.dn+5,J.dn+12]){const ii=(J.at+k)%N,a=mainPt(ii,0);
        const m=new THREE.Mesh(new THREE.PlaneGeometry(2*HW-2.4,.5).rotateX(-Math.PI/2),paint);m.position.set(a.x,a.y+.06,a.z);m.rotation.y=a.yaw;world.add(m);}}}

  /* the lake: water to the far shore, forest over there, reeds by the path, the jetty and the hut */
  {const water=new THREE.Mesh(new THREE.PlaneGeometry(1800,800).rotateX(-Math.PI/2),psMat({color:0x4f86ae,unlit:true}));
    water.position.set(0,-2.6,LERUM_SHORE+380);world.add(water);
    const glint=psMat({color:0x9ec4dc,unlit:true}),glG=new THREE.Group();
    for(let n=0;n<40;n++){const gl=new THREE.Mesh(new THREE.PlaneGeometry(rand(2,7),.4).rotateX(-Math.PI/2),glint);
      gl.position.set(rand(-360,360),-2.5,rand(LERUM_SHORE+30,LERUM_SHORE+300));glG.add(gl);}
    world.add(hoorMerge(glG));
    const far=rosInst(flat(new THREE.DodecahedronGeometry(9,0)),psMat({}),300,true);
    for(let n=0;n<220;n++){const x=-900+n*8.2+rand(-3,3),z=LERUM_SHORE+250+rand(0,30);far.put(x,-2,z,rand(0,3),rand(1,1.6),rand(.6,1.2),rand(1,1.6),[0x2a5230,0x335c34,0x3e6a3a][n%3]);}
    far.done();
    const RN=700,reed=rosInst(flat(new THREE.ConeGeometry(.16,1.5,3)).translate(0,.75,0),psMat({color:0xc4c070}),RN);
    for(let n=0,g2=0;n<RN&&g2<6000;g2++){const x=rand(-320,240),z=LERUM_SHORE+rand(0,26),d=lerumLake(x,z);
      if(d<5||d>16||latAt(x,z)<HW+5)continue;
      const s=rand(.7,1.3);reed.put(x,Math.max(meshY(x,z),-2.7),z,rand(0,6),s,s,s);n++;}
    reed.done();
    /* the bathing jetty with a ladder, and the changing hut beside the beach */
    const i=LERUM_JETTY,c=at(i,-(HW+8));
    const jt=new THREE.Group();jt.position.set(c.x,0,c.z);jt.rotation.y=Math.atan2(rx[i],rz[i])+Math.PI;world.add(jt);
    const deckY=-1.6,y0=c.y;
    hoorBox(jt,2.6,.25,34,woodL,0,deckY+.12,22);
    const ramp=hoorBox(jt,2.6,.25,9,woodL,0,(y0+deckY)/2,2.5);ramp.rotation.x=Math.atan2(y0-deckY,9);
    hoorBox(jt,4.6,.25,4,woodL,0,deckY+.12,40);
    for(let s=0;s<8;s++)for(const sg of [-1,1])hoorBox(jt,.25,3,.25,wood,sg*1.2,deckY-1.4,8+s*4.6);
    for(const sg of [-1,1])hoorBox(jt,.08,1.6,.08,psMat({color:0xc8ccd0}),sg*.4,deckY-.3,42.2);
    for(let s=0;s<4;s++)hoorBox(jt,.86,.06,.08,psMat({color:0xc8ccd0}),0,deckY-1+s*.4,42.2);
    const boat=new THREE.Group();boat.position.set(3.4,-2.4,26);boat.rotation.y=.25;jt.add(boat);
    hoorBox(boat,1.4,.5,4,psMat({color:0xf4f2ec}),0,0,0);hoorBox(boat,1.2,.1,.4,woodL,0,.25,.3);
    hoorMerge(jt);
    const ring=new THREE.Mesh(flat(new THREE.TorusGeometry(.42,.12,4,10)),psMat({color:0xf08a1c}));
    const lb=new THREE.Group(),lq=at(i+6,-(HW+5));lb.position.set(lq.x,lq.y,lq.z);lb.rotation.y=yawAt(i);world.add(lb);
    hoorBox(lb,.14,2.2,.14,white,0,1.1,0);ring.position.set(0,1.6,.12);lb.add(ring);
    const hq=at(i-16,-(HW+7)),hut=house(4.6,3.2,2.6,0xf4f2ec,0x2f62a8,1.4);hut.position.set(hq.x,hq.y,hq.z);hut.rotation.y=yawAt(i);world.add(hut);
    for(const [t,x] of [['DAMER',-1.15],['HERRAR',1.15]]){
      hoorBox(hut,1.0,1.9,.08,psMat({color:0x2f62a8}),x,.95,1.64);
      const sg=new THREE.Mesh(new THREE.PlaneGeometry(1.1,.32),psMat({map:lerumSignTex(t,'#f4f2ec','#2f62a8',48,14,7),unlit:true,side:THREE.DoubleSide}));
      sg.position.set(x,2.2,1.66);hut.add(sg);}
    hoorMerge(hut);
    /* picnic tables along the beach, where the bun waits */
    for(const k of [-28,-20,-12]){const q=at(i+k,-(HW+5.4)),g=new THREE.Group();g.position.set(q.x,q.y,q.z);g.rotation.y=yawAt(i+k)+Math.PI/2;world.add(g);
      hoorBox(g,1.0,.12,2.4,woodL,0,.82,0);for(const s of [-1,1])hoorBox(g,.4,.1,2.4,woodL,s*.85,.48,0);
      for(const s of [-1,1])hoorBox(g,1.9,.1,.12,wood,0,.4,s*1.0);hoorMerge(g);}
    /* the beach car park, with Amanda's estate in it */
    const pq=at(i-34,HW+9),pg=new THREE.Group();pg.position.set(pq.x,pq.y,pq.z);pg.rotation.y=yawAt(i-34);world.add(pg);
    hoorBox(pg,8,.06,14,psMat({color:0x7c7a74}),0,.03,0);
    const car=lerumEstate();car.position.set(-1.8,0,0);pg.add(car);
    const car2=lerumEstate(0x9aa4ae);car2.position.set(2.4,0,1);pg.add(car2);
    hoorMerge(pg);res(pq.x,pq.z,10);
    /* a buoy line off the beach */
    const buoy=rosInst(flat(new THREE.SphereGeometry(.35,6,4)),psMat({}),40,true);
    for(let n=0;n<16;n++){const q=mainPt(i-40+n*5,-(HW+40));buoy.put(q.x,-2.5,q.z+ (n%2),0,1,1,1,n%2?0xf4f2ec:0xf08a1c);}
    buoy.done();
  }

  /* the communal green: the barbecue, the long table, the flag, and the neighbours in folding chairs */
  {const gx=LERUM.gx,gz=LERUM.gz,gy=meshY(gx,gz),tip=LERUM.tip,inside=-Math.sign(scurv[tip])||1;
    const g=new THREE.Group();g.position.set(gx,gy,gz);world.add(g);
    hoorBox(g,1.2,.08,7,woodL,4,.8,2);for(const s of [-1,1])hoorBox(g,.4,.08,7,woodL,4+s*.9,.46,2);
    hoorBox(g,1.22,.02,7.02,psMat({color:0xc8321f}),4,.85,2);
    for(let n=0;n<6;n++)hoorBox(g,.18,.3,.18,psMat({color:n%2?0xc8281c:0xf2e6c4}),4+(n%2?.3:-.3),1.0,-.6+n*1.1);   /* saft and buns */
    const kg=new THREE.Group();kg.position.set(-3,0,4);g.add(kg);
    const bowl=new THREE.Mesh(flat(new THREE.SphereGeometry(.55,8,4,0,Math.PI*2,Math.PI/2,Math.PI/2)),psMat({color:0x1e2022}));bowl.position.y=1.0;kg.add(bowl);
    for(let n=0;n<3;n++){const a=n/3*6.283;const lg=hoorBox(kg,.06,1,.06,psMat({color:0x1e2022}),Math.cos(a)*.35,.5,Math.sin(a)*.35);lg.rotation.z=Math.cos(a)*.2;lg.rotation.x=-Math.sin(a)*.2;}
    hoorBox(kg,.9,.05,.9,psMat({color:0x8a9096}),0,1.02,0);
    LERUM.grill={x:gx-3,y:gy+1.2,z:gz+4};
    hoorBox(g,.14,9,.14,white,-8,4.5,-6);
    const flag=new THREE.Mesh(new THREE.PlaneGeometry(2.4,1.5),psMat({map:pixTex(16,10,c=>{c.fillStyle='#2f62a8';c.fillRect(0,0,16,10);c.fillStyle='#f2c81c';c.fillRect(5,0,2,10);c.fillRect(0,4,16,2);}),side:THREE.DoubleSide}));
    flag.position.set(-6.75,8.2,-6);g.add(flag);
    const sw=new THREE.Group();sw.position.set(8,0,-8);g.add(sw);
    for(const s of [-1,1]){const a=hoorBox(sw,.12,3,.12,psMat({color:0xc8321f}),s*1.4,1.4,.6);a.rotation.x=.2;const b=hoorBox(sw,.12,3,.12,psMat({color:0xc8321f}),s*1.4,1.4,-.6);b.rotation.x=-.2;}
    hoorBox(sw,3,.12,.12,psMat({color:0xc8321f}),0,2.85,0);hoorBox(sw,.7,.06,.3,psMat({color:0x1e2022}),0,.6,0);
    hoorMerge(g);
    LERUM.heads=[];
    const shirts=[0xc8321f,0x2f78d8,0xf2c81c,0x3fa04a,0xe86a9a,0xf4f2ec,0x8b4fb5,0xf08a1c];
    const hairs=[0x3a2a1e,0xd8c08a,0x8a8a8a,0x6a3a22,0xe8e4da,0x2a2222];
    for(let n=0;n<9;n++){
      const i=tip-20+n*5,q=at(i,inside*(HW+5.2));
      const nb=lerumNeighbour(shirts[n%shirts.length],hairs[(n*5)%hairs.length],n!==4);
      nb.g.position.set(q.x,q.y,q.z);nb.g.rotation.y=Math.atan2(-inside*rx[((i%N)+N)%N],-inside*rz[((i%N)+N)%N]);world.add(nb.g);
      LERUM.heads.push({head:nb.head,g:nb.g,base:nb.g.rotation.y});
    }
  }

  /* the sprinkler's lawn: a garden hose snaking to it */
  {const P=LERUM_SPR;const q=at(P.i,P.sd*(HW+3.2)),g=new THREE.Group();g.position.set(q.x,q.y,q.z);world.add(g);
    hoorBox(g,.9,.16,.9,psMat({color:0x2f9a3a}),0,.08,0);hoorBox(g,.2,.8,.2,psMat({color:0xf2c81c}),0,.5,0);
    const arm=new THREE.Group();arm.position.y=.95;g.add(arm);hoorBox(arm,.14,.14,1.6,psMat({color:0xf2c81c}),0,0,.4);
    hoorBox(arm,.24,.24,.24,psMat({color:0x2f78d8}),0,0,1.2);
    const hose=rosInst(flat(new THREE.BoxGeometry(.12,.08,1.2)),psMat({color:0x3fa04a}),30);
    for(let n=0;n<14;n++){const a=n*.45;hose.put(q.x+P.sd*rx[P.i]*(1+n*.9)+Math.sin(a)*.6,q.y+.05,q.z+P.sd*rz[P.i]*(1+n*.9)+Math.cos(a)*.6,a);}
    hose.done();LERUM.spr={g,arm,x:q.x,y:q.y,z:q.z};res(q.x,q.z,5);}

  /* trees between the houses: birches, maples and a few pines, thicker down the hill */
  const TN=420,trT=rosInst(flat(new THREE.CylinderGeometry(.18,.28,4,5)).translate(0,2,0),psMat({}),TN,true);
  const trC=rosInst(flat(new THREE.IcosahedronGeometry(2.6,0)).translate(0,5.4,0),psMat({}),TN,true);
  const pnC=rosInst(flat(new THREE.ConeGeometry(2.4,8,6)).translate(0,6.5,0),psMat({color:0x2a5230}),TN);
  let tc=0,pc=0;
  for(let guard=0;guard<9000&&tc+pc<TN;guard++){
    const x=rand(-380,380),z=rand(-380,LERUM_SHORE+10);
    if(!free(x,z,5+hash2(x,z)*4))continue;
    const y=meshY(x,z),r=hash2(x*.3,z*.3);
    if(r<.2){trT.put(x,y,z,0,1.2,1,1.2,0x5e4634);pnC.put(x,y,z,rand(0,3),rand(.8,1.2),rand(.8,1.3),rand(.8,1.2));pc++;}
    else{const birch=r<.6;trT.put(x,y,z,0,1,1,1,birch?0xe8e6dc:0x5e4634);
      trC.put(x,y,z,rand(0,3),rand(.8,1.2),rand(.9,1.3)*(birch?1.2:1),rand(.8,1.2),birch?0x7ab24a:[0x4f8a3a,0x5c9a42,0x3e7a34][tc%3]);tc++;}
  }
  trT.done();trC.done();pnC.done();
  /* garden lawns get the odd trampoline and washing line */
  const tramp=rosInst(flat(new THREE.CylinderGeometry(1.8,1.8,.14,10)),psMat({color:0x1e2022}),20);
  const rim=rosInst(flat(new THREE.TorusGeometry(1.85,.08,3,10)).rotateX(Math.PI/2),psMat({color:0x2f78d8}),20);
  for(let n=0,g2=0;n<12&&g2<600;g2++){const x=rand(-260,200),z=rand(-210,110);if(!free(x,z,7))continue;
    const y=meshY(x,z);tramp.put(x,y+.8,z,0);rim.put(x,y+.86,z,0);res(x,z,3);n++;}
  tramp.done();rim.done();
}
/* where the set pieces sit, worked out from the samples once the track is laid */
const LERUM_BIN={i:56,sd:1}, LERUM_SPR={i:652,sd:1}, LERUM_JETTY=318;
/** distance from the main road's centre line alone (latAt also counts the lanes) */
function nearAltMain(x,z){const i=nearestGlobal(x,z);return Math.abs((x-sx[i])*rx[i]+(z-sz[i])*rz[i]);}

/* ───── Lerum hazards: the wheelie bin, the sprinkler, the neighbours ───── */
/** a wheelie bin on its two wheels: rattle, rattle */
function lerumRattle(vol){
  if(!actx)return;
  const t=actx.currentTime;
  for(let n=0;n<6;n++){
    const o=actx.createOscillator(),g=actx.createGain();o.type='square';o.frequency.setValueAtTime(90+Math.random()*60,t+n*.07);
    g.gain.setValueAtTime(.0001,t+n*.07);g.gain.exponentialRampToValueAtTime(.08*(vol||1),t+n*.07+.01);g.gain.exponentialRampToValueAtTime(.0001,t+n*.07+.05);
    o.connect(g);g.connect(audioOutput());o.start(t+n*.07);o.stop(t+n*.07+.06);
  }
}
function hazardsLerum(H){
  const ST=LERUM;ST.sayLap=-1;
  /* the wheelie bin: rattles at the collection point, rolls out into the inside half of the road, waits, goes home */
  {const i=LERUM_BIN.i,sd=LERUM_BIN.sd;
    const g=new THREE.Group(),c=psMat({color:0xc8321f});
    hoorBox(g,.8,1.15,.9,c,0,.68,0);const lid=hoorBox(g,.86,.1,.96,c,0,1.3,0);
    for(const s of [-1,1]){const w=new THREE.Mesh(flat(new THREE.CylinderGeometry(.22,.22,.12,8)),psMat({color:0x1e2022}));w.rotation.z=Math.PI/2;w.position.set(s*.42,.22,-.4);g.add(w);}
    g.scale.setScalar(1.3);world.add(g);
    const home=sd*(HW+6.5),out=sd*1.4;
    let cyc=-1,kick=null;
    H.push({id:'soptunna',period:11,phase:4,mesh:g,
      update(u,dt){
        const c=Math.floor((raceTime+4)/11);if(c!==cyc){cyc=c;kick=null;}
        const warn=u<0.22,v=smooth(0.22,0.4,u)*(1-smooth(0.78,0.96,u));
        const l=lerp(home,out,v),q=mainPt(i,l);
        let x=q.x,z=q.z,y=Math.abs(l)<HW+1?q.y:meshY(q.x,q.z),rot=0;
        if(kick){const t=clamp((clock-kick.t)*2.5,0,1);x+=kick.dx*t*6;z+=kick.dz*t*6;y+=Math.sin(Math.PI*t)*2;rot=t*5;}
        g.position.set(x,y,z);g.rotation.set(rot,q.yaw+(warn?Math.sin(clock*40)*.08:0),0);
        lid.rotation.x=warn||(v>0&&v<1)?-Math.abs(Math.sin(clock*18))*.4:0;     /* the lid clatters */
        const near=Math.hypot(player.x-x,player.z-z)<70;
        if(near&&state==='race'&&(warn||(v>0&&v<1))&&Math.random()<dt*5)lerumRattle(.6);
        this.p={x,y,z};this.on=!kick&&v>0.05;
      },
      hit(k){return this.on&&!k.rib&&near3(k,this.p.x,this.p.y,this.p.z,1.9);},
      effect(k){
        const sp=Math.hypot(k.vx,k.vz)||1;kick={t:clock,dx:k.vx/sp,dz:k.vz/sp};
        k.slow=Math.max(k.slow,.6);k.vx*=0.72;k.vz*=0.72;k.boost=0;k.drift=0;k.charge=0;
        for(let p=0;p<12;p++)puff(k.x+rand(-1.2,1.2),k.y+rand(.3,1.6),k.z+rand(-1.2,1.2),.62,.58,.5,.6);
        if(k===player){toast('SOPTUNNAN!');lerumRattle(1.2);shake=Math.min(1,shake+.35);}
      }});
  }
  /* the sprinkler: it ticks round over the inside of the corner; drive through the jet and the tyres let go */
  {const P=LERUM_SPR,R=HW+3.4;
    const drops=[],dm=psMat({color:0xcfe6f4,unlit:true,transparent:true,opacity:.75,depthWrite:false});
    for(let n=0;n<18;n++){const m=new THREE.Mesh(flat(new THREE.BoxGeometry(.32,.32,.32)),dm);world.add(m);drops.push(m);}
    const wet=new THREE.Mesh(new THREE.CircleGeometry(R,16,0,Math.PI).rotateX(-Math.PI/2),
      psMat({color:0x2a3038,transparent:true,opacity:.35,depthWrite:false}));
    world.add(wet);
    let tick=0;
    H.push({id:'vattenspridare',period:6,phase:0,mesh:wet,
      update(u,dt){
        const S=LERUM.spr;if(!S)return;
        const base=Math.atan2(-P.sd*rx[P.i],-P.sd*rz[P.i]);          /* pointing across the road */
        const a=base+Math.sin(u*Math.PI*2)*1.25;this.a=a;               /* sweeps back and forth over the inside half */
        S.arm.rotation.y=a;
        wet.position.set(S.x,sy[P.i]+.05,S.z);wet.rotation.y=base-Math.PI/2;
        for(let n=0;n<drops.length;n++){const t=((clock*1.4+n/drops.length)%1),d=t*R;
          const sp=(n%3-1)*.08;drops[n].position.set(S.x+Math.sin(a+sp)*d,S.y+1+Math.sin(Math.PI*t)*2.6,S.z+Math.cos(a+sp)*d);}
        tick+=dt;const near=Math.hypot(player.x-S.x,player.z-S.z)<60;
        if(tick>.18){tick=0;if(near&&state==='race')ping(2400,2200,.015);}         /* tick tick tick */
      },
      hit(k){const S=LERUM.spr;if(!S||k.rib||k.wet)return false;   /* Regnmolnet is wet already */
        const dx=k.x-S.x,dz=k.z-S.z,d=Math.hypot(dx,dz);if(d>R)return false;
        return Math.abs(wrapAng(Math.atan2(dx,dz)-this.a))<.5;},
      effect(k){
        k.slick=Math.max(k.slick,.7);k.drift=0;k.charge=0;
        for(let p=0;p<10;p++)puff(k.x+rand(-1,1),k.y+rand(.4,1.4),k.z+rand(-1,1),.8,.9,1,.5);
        if(k===player){toast('BLÖTT!');ping(1800,900,.12);}
      }});
  }
  /* the neighbours turn to watch, the grill smokes, Amanda's lap line */
  H.push({id:'grannar',period:1,phase:0,
    update(u,dt){
      if(stage.id!=='lerum')return;
      for(const h of LERUM.heads){const dx=player.x-h.g.position.x,dz=player.z-h.g.position.z;
        if(dx*dx+dz*dz>3600){h.head.rotation.y*=.9;continue;}
        h.head.rotation.y=clamp(wrapAng(Math.atan2(dx,dz)-h.base),-1.1,1.1);}
      const G=LERUM.grill;
      if(G&&Math.hypot(player.x-G.x,player.z-G.z)<160){LERUM.smokeT-=dt;
        if(LERUM.smokeT<0){LERUM.smokeT=.25;puff(G.x+rand(-.3,.3),G.y+.4,G.z+rand(-.3,.3),.72,.72,.74,1.6);}}
    }});
}

/** the stage's postcard, for the picnic passport: Amanda's burgundy estate by the lake, and Teo
    holding the map upside down. Drawn on a 192 x 120 canvas, shown pixelated. */
function lerumPostcard(g,w,h){
  const R=(c,x,y,a,b)=>{g.fillStyle=c;g.fillRect(x,y,a,b);};
  const sky=g.createLinearGradient(0,0,0,58);sky.addColorStop(0,'#5d9ee0');sky.addColorStop(1,'#d8ecf4');
  g.fillStyle=sky;g.fillRect(0,0,w,58);
  R('#f8f4e4',150,10,10,6);R('#f8f4e4',146,13,18,4);R('#f8f4e4',28,18,14,4);R('#f8f4e4',24,20,22,3);   /* clouds */
  for(let x=0;x<w;x+=5){const t=6+((x*7)%5);R(x%10?'#2e5a34':'#3a6a3c',x,52-t,5,t+4);}             /* the far shore */
  R('#4f86ae',0,56,w,30);
  g.fillStyle='rgba(200,230,245,.7)';for(let n=0;n<14;n++)g.fillRect((n*37)%w,60+(n*11)%22,4+(n%3)*2,1);
  R('#8a6a46',120,64,46,3);for(let x=124;x<166;x+=8)R('#6a4e32',x,66,2,8);                            /* the jetty */
  R('#e2d4a8',0,82,w,8);R('#5f9a42',0,88,w,32);                                                      /* beach, lawn */
  for(let x=0;x<w;x+=3)R('#6aa64a',x,88+(x%2),2,2);
  /* the estate: long and low, roof rails, burgundy */
  R('#1e2022',22,98,12,8);R('#1e2022',66,98,12,8);
  R('#6e1f2c',14,86,76,14);R('#5a1824',14,97,76,3);R('#6e1f2c',22,76,56,11);
  R('#2a3440',26,78,22,8);R('#2a3440',51,78,24,8);R('#c8ccd0',22,74,56,1);R('#c8ccd0',30,72,1,2);R('#c8ccd0',70,72,1,2);
  R('#f2e6a0',86,88,4,3);R('#c8281c',14,88,3,3);
  R('#d9b56e',56,79,8,5);R('#e8bc98',58,80,5,4);R('#e9e1cf',56,78,8,2);                                 /* Amanda at the wheel */
  /* Teo beside it, map open the wrong way round */
  R('#2a2f3a',104,100,4,12);R('#2a2f3a',110,100,4,12);R('#1e2a48',102,84,14,17);
  R('#e8bc98',105,74,8,9);R('#b8662c',105,80,8,3);R('#22242a',104,71,10,4);R('#1e2a48',96,86,6,4);R('#1e2a48',116,86,6,4);
  g.save();g.translate(109,90);g.rotate(Math.PI);
  R('#f4efe2',-15,-8,30,16);R('#cfe6f4',-13,-1,26,7);R('#7ab24a',-13,-6,26,5);R('#c8321f',-6,-4,12,1);R('#c8321f',5,-4,1,6);
  g.fillStyle='#1e2022';g.beginPath();g.moveTo(10,-7);g.lineTo(7,-3);g.lineTo(13,-3);g.fill();R('#1e2022',9,-3,2,5);   /* north arrow: pointing down */
  g.font='6px monospace';g.textAlign='center';g.textBaseline='middle';g.fillText('N',10,5);
  g.restore();
  g.fillStyle='#1e2022';g.font='6px monospace';g.fillText('?',120,72);g.fillText('?',97,70);
  /* the stamp corner and the greeting */
  R('#f4efe2',156,92,30,22);R('#6e1f2c',158,94,26,18);R('#f4efe2',163,99,16,6);R('#6e1f2c',165,101,12,2);   /* a little estate on the stamp */
  g.fillStyle='#fff';g.font='bold 11px "Titillium Web",sans-serif';g.textAlign='left';g.fillText('Hälsningar från Aspenäs!',6,14);
  g.lineWidth=2;g.strokeStyle='#fff';g.strokeRect(1,1,w-2,h-2);
}
