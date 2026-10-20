"use strict";
/* ───────── Hisingen ───────── */
/* Fel sida älven: Hamnkranen's home track in the Göteborg rounds. A fictional Hisingen port at
   golden dusk: out of the shipyard staging area along the quay, through the container avenue, round
   the broad crane base, out past the dry dock, round the workshop courtyard's two square corners and
   back along the dock fence. The ship beside the yard is enormous; the arrow painted on it is not. */
SURF.hisingenGrus={top:o=>o+(1-o)*0.6,grip:o=>1-0.32*(1-o),fuel:1.1,name:'GRUS'};
SFX.hisingenGrus=SFX.gravel;
SURF.hisingenBetong={top:o=>1,grip:o=>1,fuel:1.0,name:'BETONG'};
SFX.hisingenBetong={dust:null,noise:{f:560,g:.012}};
ROADTEX.hisingen=()=>pixTex(64,64,g=>{               /* port asphalt: dark, patched, oil spots, a crack */
  g.fillStyle='#3f4144';g.fillRect(0,0,64,64);
  for(let i=0;i<900;i++){g.fillStyle=Math.random()>.55?'rgba(128,124,118,.45)':'rgba(20,20,22,.5)';
    g.fillRect((Math.random()*64)|0,(Math.random()*64)|0,1,1);}
  g.fillStyle='rgba(70,72,76,.55)';g.fillRect(6,10,18,12);g.fillRect(38,40,20,14);   /* patches */
  g.fillStyle='rgba(12,12,14,.45)';for(let i=0;i<4;i++){g.beginPath();g.arc(8+Math.random()*48,8+Math.random()*48,2+Math.random()*3,0,6.3);g.fill();}
  g.fillStyle='rgba(16,16,18,.6)';let x=44;for(let y=0;y<64;y++){x+=Math.round(Math.random()*2-1);g.fillRect(x,y,1,1);}
});
ROADTEX.hisingenBetong=()=>pixTex(64,64,g=>{         /* the terminal's concrete slabs, joints and tyre marks */
  g.fillStyle='#8c887e';g.fillRect(0,0,64,64);
  for(let i=0;i<800;i++){g.fillStyle=Math.random()>.5?'rgba(170,164,150,.45)':'rgba(70,66,58,.4)';
    g.fillRect((Math.random()*64)|0,(Math.random()*64)|0,1,1);}
  g.fillStyle='rgba(40,38,34,.6)';g.fillRect(0,0,64,1);g.fillRect(0,32,64,1);           /* joints across only: long lines wobble */
  g.fillStyle='rgba(30,30,30,.18)';for(const x of [12,20,44,52])g.fillRect(x,0,3,64);
});
ROADTEX.hisingenGolv=()=>pixTex(64,64,g=>{           /* the workshop floor: smooth grey epoxy, yellow walkway lines */
  g.fillStyle='#9a9a94';g.fillRect(0,0,64,64);
  for(let i=0;i<300;i++){g.fillStyle=Math.random()>.5?'rgba(190,190,182,.35)':'rgba(90,90,86,.3)';
    g.fillRect((Math.random()*64)|0,(Math.random()*64)|0,1,1);}
  g.fillStyle='rgba(60,60,58,.35)';g.fillRect(0,0,64,1);
  g.fillStyle='#e8b81c';g.fillRect(2,0,3,64);g.fillRect(59,0,3,64);
  g.fillStyle='rgba(60,40,20,.25)';g.fillRect(24,18,9,5);
});
ROADTEX.hisingenGrus=()=>pixTex(64,64,g=>{           /* the aggregate yard: crushed stone, loader ruts */
  g.fillStyle='#8a8070';g.fillRect(0,0,64,64);
  for(let i=0;i<1100;i++){g.fillStyle=Math.random()>.5?'rgba(190,178,156,.6)':'rgba(70,62,52,.55)';
    g.fillRect((Math.random()*64)|0,(Math.random()*64)|0,1,1);}
  g.fillStyle='rgba(80,70,58,.45)';for(const x of [13,21,41,49])g.fillRect(x,0,3,64);
});
VERGEC.hisingen=['#7a766c','#908b80','#5e5a52'];
GROUND.hisingen={cell:30,stripe:0.9,verge:0x78746a,
  cols:[0x6a675f,0x75716a,0x5e5b55,0x807a6e,0x6e6a60,0x5a5650,0x7a705e]};

/* the harbour lies south of the quay; the dry dock is a pit east of the aggregate yard */
const HIS_QUAY=168, HIS_DOCK={x0:378,x1:416,z0:-150,z1:-6}, HIS_WATER=-2.2;
/* where the set pieces sit, worked out from the samples once the track is laid */
const HIS_TROLLEY=108, HIS_CRANE=132, HIS_OVERLOOK=216;
function hisingenDockIn(x,z){const D=HIS_DOCK;return Math.min(x-D.x0,D.x1-x,z-D.z0,D.z1-z);}
function hisingenDig(x,z){
  let d=-9.5*smooth(HIS_QUAY-2,HIS_QUAY+2,z);
  const k=hisingenDockIn(x,z);if(k>-2)d-=11*smooth(-1,1.2,k);
  return d;
}

STAGES.push({ id:'hisingen', group:'goteborg', name:'HISINGEN', sub:'FEL SIDA ÄLVEN',
  order:25, tag:'Containrar, kranar och ett skepp stort som Veberöd. Tre varv genom hamnen på fel sida älven. Centrum är åt andra hållet. Det har det alltid varit.',
  view:{i:14,lat:-3,h:4.2,to:{i:62,lat:40,h:14},fov:62},
  hw:8.5,
  bars:[0.7,0.7,0.65], laps:3,
  blurb:'Hamnkranen\'s home track: three laps of a fictional Hisingen port at golden dusk. Out of the shipyard staging area along the quay, past a ship so big it blocks the sunset, through the container avenue and round the broad crane base. The road swings out to the dry-dock overlook, jumps a low crest by the aggregate yard and goes round the workshop courtyard\'s two square corners before sweeping back along the dock fence. A workshop trolley rattles across part of the yard on its own rails, with a bell. The gravel aggregate yard is the open way across; the workshop floor is a secret, and a spettekaka opens its door.',
  role:'Containergator, breda driftkurvor, en grusgenväg och två fyrkantiga verkstadshörn.',
  sky:[0xf6a85a,0x3a4a86], fog:[0xd89c6a,90,470], amb:0x6c6272, dif:0xffcc94,
  road:'hisingen', verge:'hisingen', edge:'hisingen', ground:'hisingen',
  terrain:{size:900,seg:120},
  /* a flat port: the rolling Skåne ground ironed out, the harbour and the dry dock dug into it */
  mod:(x,z,t)=>-rolls(x,z)*t*0.9+hisingenDig(x,z),
  land:(x,z,out)=>landHisingen(x,z,out),
  zones:[[24,118,'hisingenBetong'],[372,462,'hisingenBetong']],
  jumpSpec:[{at:336,h:2.4,drop:1.6,up:10,dn:6,rec:14}],
  ctrl:[[-40,3,120],[30,3,120],[100,3,120],[170,3,119],[222,3,115],
        [258,3,104],[280,3,80],[290,3,46],[293,3,20],
        [303,4,0],[324,4,-20],[344,4,-46],[350,4,-76],[344,4,-106],[324,4,-132],[303,4,-152],[294,4,-172],
        [292,5,-200],[291,5,-226],[283,5,-244],[266,5,-251],[232,5,-252],
        [190,5,-252],[140,5,-252],[95,5,-252],
        [72,5,-257],[62,5,-268],[58,5,-274],[50,5,-279],[30,5,-280],[-10,5,-280],[-30,5,-279],[-38,5,-274],[-42,5,-268],[-52,5,-257],[-76,5,-252],
        [-152,5,-251],
        [-174,5,-248],[-188,5,-235],[-192,5,-208],
        [-192,4,-150],[-192,4,-80],[-192,4,-10],[-192,3,50],
        [-188,3,88],[-170,3,110],[-140,3,119],[-95,3,120]],
  stations:[[0.097,-1],[0.82,1]],
  routes:[
    {id:'grusupplaget',name:'GRUSUPPLAGET',a:160,b:276,hw:4.2,side:-1,lead:12,leadLat:9,
     mid:[[0.5,0]],hills:[[0.5,2.2,14]],surface:'hisingenGrus',tex:'hisingenGrus',risk:0.35,
     blurb:'Straight across the aggregate yard between the gravel heaps, over a modest rise, while the road swings out to the dry dock. Shorter, but loose stone: the karts built for rough ground gain the most.'},
    {id:'verkstad',name:'VERKSTADSGOLVET',a:362,b:472,hw:3.8,side:-1,lead:12,leadLat:11,
     mid:[[0.25,-3],[0.75,-3]],surface:'road',tex:'hisingenGolv',risk:0.3,hidden:true,shoot:true,mouth:22,
     blockMesh:(R,j)=>hisingenDoor(R,j),blockAnim:(B,d)=>hisingenDoorAnim(B,d),
     blurb:'A smooth concrete cut straight through the workshop hall while the road goes round the courtyard\'s two square corners. Precise way in, narrow way out. Behind a marked roller door: blow it open with a spettekaka.'}],
  stamps:[
    {id:'his1',dish:'Ostmacka',ini:'O',kind:'intro',route:'main',i:HIS_OVERLOOK,lat:5.4,
     hint:'Vid räcket ut mot torrdockan.',
     story:'A slice of rye bread with butter and a thick slice of hushållsost, cut with the cheese slicer so it curls. The welders on the dry dock eat theirs at the railing at nine sharp, looking down at the hull they are building, and argue about whether cucumber belongs on top.'},
    {id:'his2',dish:'Arbetarkaffe',ini:'A',kind:'route',route:'verkstad',f:0.5,lat:0,
     hint:'Inne på Verkstadsgolvet. Porten är stängd: skjut upp den.',
     story:'Bryggkaffe from the big machine in the workshop corner, strong enough to stand a spoon in and poured into a mug with someone else\'s name on it. Fika in a Swedish workplace is close to sacred: twice a day the grinders stop and the whole floor sits down together.'},
    {id:'his3',dish:'Hamnkaka',ini:'H',kind:'air',route:'main',jump:0,after:5,lat:0,air:4.2,
     hint:'Högt över krönet vid grusupplaget.',
     story:'Not a real cake: the dockers\' name for the tray bake that arrives whenever a ship is finally unloaded, a flat almond sponge cut into squares and sold by the crane drivers\' union for the coffee fund. It is said to taste of diesel. It does not.'}],
  postcard:{draw:(g,w,h)=>hisingenPostcard(g,w,h),
    caption:'Majros kom med mjölken. Båten hade beställt lite mer.'},
  hazards:H=>hazardsHisingen(H), scenery:()=>sceneryHisingen()
});

/* the edge: low concrete blocks with a yellow-and-black band, gaps left for lanes, pumps and the trolley */
EDGES.hisingen=st=>{
  const step=2,L=SEG*step+.15;
  const base=rosInst(flat(new THREE.BoxGeometry(.9,.9,L)).translate(0,.45,0),psMat({color:0x9a968c}),N*2);
  const band=rosInst(flat(new THREE.BoxGeometry(.94,.28,L+.02)).translate(0,.14,0),psMat({}),N*2,true);
  for(let i=0;i<N;i+=step)for(const side of [-1,1]){
    const o=side*(HW+4.3),x=sx[i]+rx[i]*o,z=sz[i]+rz[i]*o;
    if(nearAlt(x,z,2.6))continue;
    if(stations.some(S=>{let d=i-S.at;if(d<-N/2)d+=N;else if(d>N/2)d-=N;return S.side===side&&d>-3&&d<S.len+3;}))continue;
    if(side>0&&Math.abs(i-HIS_TROLLEY)<5)continue;                      /* the trolley's rails come through here */
    const y=meshY(x,z),yw=Math.atan2(fx[i],fz[i]);
    base.put(x,y-.05,z,yw);band.put(x,y+.52,z,yw,1,1,1,(i/step)%2?0xf2b01c:0x26262a);
  }
  base.done();band.done();
};
function landHisingen(x,z,out){
  if(z>HIS_QUAY+1){out.setHex(0x2c3a42);return;}                                          /* under the water */
  if(z>HIS_QUAY-5){out.setHex(z>HIS_QUAY-1.4&&z<HIS_QUAY-.8?0xe8b81c:0xa29e94);return;}  /* the quay edge, a yellow line */
  const k=hisingenDockIn(x,z);
  if(k>0){out.setHex(0x5c5a54);return;}                                                   /* the dock floor */
  if(k>-4){out.setHex(0xa29e94);return;}                                                  /* its rim */
  const i=HIS_CRANE,cx=sx[i]-rx[i]*(HW+34),cz=sz[i]-rz[i]*(HW+34);
  if(Math.hypot(x-cx,z-cz)<24)out.setHex(Math.hypot(x-cx,z-cz)>21.5?0xe8b81c:0x8e8a82);  /* the crane base pad */
}
/** corrugated steel cladding, one panel across, 3.4 m up */
function hisingenCladTex(col,trim){
  const t=pixTex(16,16,g=>{
    g.fillStyle=col;g.fillRect(0,0,16,16);
    for(let x=0;x<16;x+=4){g.fillStyle='rgba(0,0,0,.18)';g.fillRect(x,0,1,16);g.fillStyle='rgba(255,255,255,.12)';g.fillRect(x+2,0,1,16);}
    if(trim){g.fillStyle=trim;g.fillRect(0,0,16,2);}
    g.fillStyle='rgba(120,70,40,.25)';g.fillRect(11,12,3,4);
  });
  t.wrapS=t.wrapT=THREE.RepeatWrapping;return t;
}
/** a shipping container box, 2.44 x 2.6 x 12.2, base at y = 0; the ends get the door tile */
function hisingenBoxGeo(L){
  const g=new THREE.BoxGeometry(2.44,2.6,L||12.2);g.translate(0,1.3,0);
  const uv=g.attributes.uv;
  for(let f=0;f<6;f++)for(let v=0;v<4;v++){const k=f*4+v;
    if(f<2)uv.setXY(k,uv.getX(k)*.75,uv.getY(k));                                  /* the ribbed sides */
    else if(f===2||f===3)uv.setXY(k,.02+uv.getX(k)*.05,.02+uv.getY(k)*.05);          /* roof and floor: plain */
    else if(f>=4)uv.setXY(k,.75+uv.getX(k)*.25,uv.getY(k));}                       /* the doors */
  return flat(g);
}
/** the container's side: ribs, a door end; white so the instance colour shows through. text: a fictional line name */
function hisingenBoxTex(text,bg){
  return pixTex(64,16,g=>{
    g.fillStyle=bg||'#ffffff';g.fillRect(0,0,64,16);
    for(let x=0;x<48;x+=2){g.fillStyle='rgba(0,0,0,.16)';g.fillRect(x,1,1,14);}
    g.fillStyle='rgba(0,0,0,.25)';g.fillRect(0,0,64,1);g.fillRect(0,15,64,1);
    g.fillStyle='rgba(0,0,0,.22)';g.fillRect(55,1,1,14);g.fillRect(51,6,1,4);g.fillRect(59,6,1,4);
    g.fillStyle='rgba(255,255,255,.5)';g.fillRect(49,2,1,12);g.fillRect(61,2,1,12);
    if(text){g.fillStyle='#f4f2ec';g.font='6px "Press Start 2P",monospace';g.textAlign='center';g.textBaseline='middle';g.fillText(text,24,8.5);}
  });
}
const HIS_BOXCOLS=[0xc8321f,0x2f62a8,0x3f8a3a,0xe8b020,0xf08a1c,0x8a4fa8,0x2a8a84,0x9a3a2a,0xd8d4c8,0x5a6a7a,0xb84a6a];
/** the orange crane look: a box beam between two points */
function hisingenBeam(g,a,b,w,m){
  const v=new THREE.Vector3().subVectors(b,a),L=v.length();
  const o=new THREE.Mesh(flat(new THREE.BoxGeometry(w,w,L)),m);
  o.position.copy(a).add(b).multiplyScalar(.5);o.lookAt(o.position.clone().add(v));g.add(o);return o;
}
function sceneryHisingen(){
  const RES=[];
  const res=(x,z,r)=>RES.push([x,z,r]);
  const free=(x,z,pad)=>{
    if(latAt(x,z)<HW+pad||z>HIS_QUAY-6-(pad>4?2:0)||hisingenDockIn(x,z)>-4-pad)return false;
    for(const r of RES)if(Math.hypot(x-r[0],z-r[1])<r[2])return false;
    return true;
  };
  const at=(i,o)=>{const q=mainPt(i,o);q.y=meshY(q.x,q.z);return q;};
  const yawAt=i=>{i=((i%N)+N)%N;return Math.atan2(fx[i],fz[i]);};
  const H=(a,b)=>hash2(a*1.37+3.1,b*0.71-2.3);
  const G=ALTS.find(r=>r.id==='grusupplaget'),V=ALTS.find(r=>r.id==='verkstad');
  const sign=(text,bg,fg,w,h,pw,ph,px,border)=>new THREE.Mesh(new THREE.PlaneGeometry(pw,ph),
    psMat({map:lerumSignTex(text,bg,fg,w,h,px,border),unlit:true,side:THREE.DoubleSide}));
  const orange=psMat({color:0xe86a1c}),grey=psMat({color:0x8a9096}),dark=psMat({color:0x2a2c30}),
        conc=psMat({color:0x9a968c}),white=psMat({color:0xeceae2}),warm=psMat({color:0xffd27a,unlit:true});
  HIS.anim=[];HIS.lamps=[];
  for(const S_ of stations){const q=mainPt(S_.at+6,S_.side*(HW+13));res(q.x,q.z,22);}
  {const q=mainPt(0,HW+20);res(q.x,q.z,30);}                                /* the grandstand */
  {const q=mainPt(HIS_TROLLEY,HW+11);res(q.x,q.z,14);}                       /* the trolley's bay */
  const box=hisingenBoxGeo();
  const plain=rosInst(box,psMat({map:hisingenBoxTex('')}),2400,true);
  const named=[['ÄLVLASTEN','#2f62a8'],['GODS & GOTT','#c8321f'],['KAJ 7','#3f8a3a'],['FEL SIDA','#e8b020']]
    .map(([t,c])=>rosInst(box,psMat({map:hisingenBoxTex(t,c)}),160));
  /** a stack of containers, some levels short; returns false if it does not fit */
  const stack=(x,z,yw,lv,pad,shipY)=>{
    const c=Math.cos(yw),s=Math.sin(yw);
    if(shipY==null){for(const [lx,lz] of [[-1.3,-6.2],[1.3,-6.2],[-1.3,6.2],[1.3,6.2],[0,0]]){
      const wx=x+c*lx+s*lz,wz=z-s*lx+c*lz;if(!free(wx,wz,pad)||nearAlt(wx,wz,3))return false;}}
    const y=shipY!=null?shipY:meshY(x,z);
    for(let l=0;l<lv;l++){const h=H(x*.3+l,z*.3);if(l>0&&h<.12)break;
      if(h>.9)named[Math.floor(H(z,x+l)*4)].put(x,y+l*2.62,z,yw+(h-.5)*.02);
      else plain.put(x,y+l*2.62,z,yw+(h-.5)*.03,1,1,1,HIS_BOXCOLS[Math.floor(H(l+x*.7,z*.9)*HIS_BOXCOLS.length)]);}
    if(shipY==null)res(x,z,4.5);
    return true;
  };

  /* the harbour: water out to the far shore, the quay wall, the dock fence, bollards */
  {const w=new THREE.Mesh(new THREE.PlaneGeometry(1000,320).rotateX(-Math.PI/2),psMat({color:0x3a5a6e,unlit:true}));
    w.position.set(0,HIS_WATER,HIS_QUAY+160);world.add(w);
    const glint=psMat({color:0xf2b878,unlit:true}),gg=new THREE.Group();
    for(let n=0;n<70;n++){const r=new THREE.Mesh(new THREE.PlaneGeometry(rand(2,9),.35).rotateX(-Math.PI/2),glint);
      r.position.set(rand(-420,420),HIS_WATER+.03,rand(HIS_QUAY+50,HIS_QUAY+260));gg.add(r);}
    world.add(hoorMerge(gg));
    const wall=new THREE.Mesh(flat(new THREE.BoxGeometry(1000,9,1.2)),conc);wall.position.set(0,meshY(0,HIS_QUAY-4)-4.4,HIS_QUAY+.2);world.add(wall);
    const post=rosInst(flat(new THREE.BoxGeometry(.12,2.2,.12)).translate(0,1.1,0),grey,300);
    const mesh=rosInst(flat(new THREE.PlaneGeometry(4,1.9)).translate(0,1.15,0),psMat({color:0x9aa8b0,transparent:true,opacity:.45,depthWrite:false,side:THREE.DoubleSide}),300);
    const boll=rosInst(flat(new THREE.CylinderGeometry(.35,.45,.8,7)).translate(0,.4,0),dark,120);
    for(let x=-440;x<440;x+=4){const z=HIS_QUAY-6.5;if(latAt(x,z)<HW+5)continue;
      const y=meshY(x,z);post.put(x,y,z,0);mesh.put(x+2,y,z,0);}
    for(let x=-430;x<430;x+=14)boll.put(x,meshY(x,HIS_QUAY-2.2),HIS_QUAY-2.2,0);
    post.done();mesh.done();boll.done();
    /* the far shore: the city, the right side of the river, catching the last of the sun */
    const fac=[borasFacadeTex('#d8c8a8',false),borasFacadeTex('#c49a7a',false),borasFacadeTex('#a9b4b8',false)];
    const lists=[[],[],[]];
    for(let x=-440;x<440;x+=16+H(x,1)*10){const h=10+H(x,2)*26;lists[Math.floor(H(x,3)*3)].push([x,HIS_WATER,440+H(x,4)*20,0,14+H(x,5)*10,12,Math.round(h/3.4)*3.4]);}
    lists.forEach((l,n)=>world.add(new THREE.Mesh(borasMergeBoxes(l),psMat({map:fac[n]}))));
    const spire=new THREE.Mesh(flat(new THREE.ConeGeometry(3,26,4)),psMat({color:0x4a6a5a}));spire.position.set(-60,HIS_WATER+46,450);world.add(spire);
    const tw=new THREE.Mesh(flat(new THREE.BoxGeometry(7,34,7)),psMat({color:0xc49a7a}));tw.position.set(-60,HIS_WATER+17,450);world.add(tw);
    const fq=new THREE.Mesh(flat(new THREE.BoxGeometry(1000,3,30)),conc);fq.position.set(0,HIS_WATER-.6,438);world.add(fq);}

  /* the ship: enormous, moored along the quay, and a tiny painted arrow on its side */
  {const g=new THREE.Group(),cx=70,cz=HIS_QUAY+44,L=250,B=36;g.position.set(cx,HIS_WATER,cz);world.add(g);
    hoorBox(g,L,26,B,psMat({color:0x22344e}),0,9,0);                                  /* hull */
    hoorBox(g,L+.2,3.6,B+.2,psMat({color:0x9a2a22}),0,-.4,0);                         /* boot top at the waterline */
    hoorBox(g,L+.3,.6,B+.3,white,0,21.8,0);                                           /* sheer line */
    const bow=new THREE.Mesh(flat(new THREE.CylinderGeometry(B/2,B/2,26,3,1,false,0,Math.PI)),psMat({color:0x22344e}));bow.position.set(L/2,9,0);bow.rotation.y=Math.PI/2;bow.scale.set(1,1,1.6);g.add(bow);
    const sup=new THREE.Mesh(rosBoxUV(22,26,B-4,4,3.4),psMat({map:borasFacadeTex('#eceae2',false)}));sup.position.set(-L/2+18,22,0);g.add(sup);
    hoorBox(g,8,2,B+10,white,-L/2+18,48.4,0);                                         /* the bridge wings */
    hoorBox(g,6,12,8,psMat({color:0xe86a1c}),-L/2+6,54,0);hoorBox(g,6.4,2,8.4,dark,-L/2+6,60.6,0);   /* funnel */
    hoorBox(g,.4,14,.4,dark,-L/2+18,56,0);
    hoorMerge(g);
    for(let bx=-L/2+40;bx<L/2-14;bx+=13)for(let bz=-B/2+3;bz<B/2-2;bz+=2.6){             /* the cargo, many colours */
      const lv=2+Math.floor(H(bx,bz)*4);stack(cx+bx,cz+bz,Math.PI/2,lv,0,HIS_WATER+22.1);}
    const nm=new THREE.Mesh(new THREE.PlaneGeometry(26,4.4),psMat({map:pixTex(96,16,c=>{c.fillStyle='#22344e';c.fillRect(0,0,96,16);
      c.fillStyle='#f4f2ec';c.font='8px "Press Start 2P",monospace';c.textAlign='center';c.textBaseline='middle';c.fillText('JÄTTEN',48,9);}),unlit:true}));
    nm.position.set(cx+L/2-30,HIS_WATER+15,cz-B/2-.2);nm.rotation.y=Math.PI;world.add(nm);
    /* GOKART →, about as big as a kart */
    const ar=new THREE.Mesh(new THREE.PlaneGeometry(3.6,.9),psMat({map:pixTex(48,12,c=>{c.fillStyle='#22344e';c.fillRect(0,0,48,12);
      c.fillStyle='#f2c81c';c.font='6px "Press Start 2P",monospace';c.textAlign='left';c.textBaseline='middle';c.fillText('GOKART →',2,7);}),unlit:true}));
    ar.position.set(cx-6,HIS_WATER+5.4,cz-B/2-.25);ar.rotation.y=Math.PI;world.add(ar);
    /* mooring lines to the bollards */
    for(const x of [cx-L/2+10,cx-L/2+40,cx+L/2-40,cx+L/2-6]){const a=new THREE.Vector3(x,HIS_WATER+21.8,cz-B/2),b=new THREE.Vector3(x+(x<cx?-8:8),meshY(x,HIS_QUAY-2)+.7,HIS_QUAY-2.2);
      const lg=new THREE.Group();world.add(lg);hisingenBeam(lg,a,b,.18,dark);}}

  /* quay cranes: orange A-frames on the quay, booms out over the ship */
  for(const qx of [-10,74,158]){const g=new THREE.Group(),y=meshY(qx,HIS_QUAY-12);g.position.set(qx,y,0);world.add(g);
    const zl=HIS_QUAY-22,zw=HIS_QUAY-4;res(qx,(zl+zw)/2,16);
    for(const sx_ of [-8,8])for(const z of [zl,zw]){hoorBox(g,1.4,34,1.4,orange,sx_,17,z);hoorBox(g,2.4,1,3,dark,sx_,.5,z);}
    for(const sx_ of [-8,8])hoorBox(g,1.2,1.2,zw-zl,orange,sx_,30,(zl+zw)/2);
    for(const z of [zl,zw])hoorBox(g,17.4,1.4,1.4,orange,0,34,z);
    for(const sx_ of [-3,3])hoorBox(g,1.2,1.6,96,orange,sx_,40,HIS_QUAY+26);          /* the boom */
    hoorBox(g,8,1,1,orange,0,40,HIS_QUAY+73);
    for(const sx_ of [-3,3]){const a=hisingenBeam(g,new THREE.Vector3(sx_,58,zl+4),new THREE.Vector3(sx_,40.8,HIS_QUAY+72),.5,orange);
      hisingenBeam(g,new THREE.Vector3(sx_,58,zl+4),new THREE.Vector3(sx_,34,zl-8),.5,orange);hoorBox(g,1,24,1,orange,sx_,46,zl+4);}
    hoorBox(g,4,3,4,white,0,37.5,HIS_QUAY+8);                                         /* the cab under the boom */
    hoorMerge(g);
    const tr=new THREE.Group();hoorBox(tr,7,1.6,4,dark,0,0,0);hoorBox(tr,.15,4.6,.15,dark,0,-2.9,0);
    const sp=new THREE.Mesh(hisingenBoxGeo(),psMat({color:HIS_BOXCOLS[Math.floor(H(qx,9)*HIS_BOXCOLS.length)]}));sp.rotation.y=Math.PI/2;sp.position.y=-7.6;tr.add(sp);
    tr.position.set(qx,y+38.6,HIS_QUAY+40);world.add(tr);HIS.anim.push({kind:'quay',g:tr,y:y+38.6,ph:H(qx,3)*6});}

  /* the broad crane base: a rail-mounted gantry crane on its pad inside the corner */
  {const i=HIS_CRANE,q=at(i,-(HW+34)),g=new THREE.Group();g.position.set(q.x,q.y,q.z);g.rotation.y=yawAt(i)+.6;world.add(g);res(q.x,q.z,26);
    for(const sx_ of [-15,15])for(const sz_ of [-8,8]){hoorBox(g,1.6,26,1.6,orange,sx_,13,sz_);hoorBox(g,3,1.4,4,dark,sx_,.7,sz_);}
    for(const sz_ of [-8,8])hoorBox(g,33,2,1.8,orange,0,26.5,sz_);
    for(const sx_ of [-15,15])hoorBox(g,1.4,1.4,16,orange,sx_,20,0);
    hoorBox(g,6,3,18,orange,4,28.8,0);hoorBox(g,3,2.6,3,white,4,26,6);
    hoorMerge(g);
    /* containers parked under it, one of them hanging */
    for(let n=0;n<4;n++){const lx=-9+n*6,c=Math.cos(g.rotation.y),s=Math.sin(g.rotation.y);
      for(let l=0;l<2+(n%2);l++)plain.put(q.x+c*lx,q.y+l*2.62,q.z-s*lx,g.rotation.y,1,1,1,HIS_BOXCOLS[(n*3+l)%HIS_BOXCOLS.length]);}
    const sign0=sign('KRANBASEN','#e86a1c','#1e2022',80,16,6,1.2,8);sign0.position.set(0,24.5,8.95);g.add(sign0);}

  /* the dry dock: a pit with a half-built hull in it, a gate at the far end, the overlook railing */
  {const D=HIS_DOCK,cx=(D.x0+D.x1)/2,cz=(D.z0+D.z1)/2,yt=meshY(D.x0-6,cz),yb=yt-11;
    const wall=psMat({color:0x7e7a72});
    for(const [x,z,w,d] of [[D.x0,cz,1,D.z1-D.z0],[D.x1,cz,1,D.z1-D.z0],[cx,D.z0,D.x1-D.x0,1]]){const m=new THREE.Mesh(flat(new THREE.BoxGeometry(w,11.4,d)),wall);m.position.set(x,yb+5.5,z);world.add(m);}
    const gate=new THREE.Mesh(flat(new THREE.BoxGeometry(D.x1-D.x0,12,2)),psMat({color:0x3a4a5a}));gate.position.set(cx,yb+6,D.z1);world.add(gate);
    const hull=new THREE.Group();hull.position.set(cx,yb,cz-6);world.add(hull);
    hoorBox(hull,16,7,90,psMat({color:0x9a2a22}),0,4.6,0);hoorBox(hull,16.2,1,90.2,psMat({color:0x6a6a6a}),0,8.6,0);
    for(let z=-40;z<=40;z+=8)hoorBox(hull,4,1.1,1.4,psMat({color:0x6a5a4a}),0,.55,z);
    for(const sd of [-1,1])for(let z=-42;z<=42;z+=6)hoorBox(hull,.3,12,.3,grey,sd*9.5,6,z);           /* scaffolding */
    for(const sd of [-1,1])for(const y of [3,7,11])hoorBox(hull,.2,.2,86,grey,sd*9.5,y,0);
    hoorMerge(hull);
    const post=rosInst(flat(new THREE.BoxGeometry(.12,1.2,.12)).translate(0,.6,0),psMat({color:0xe8b81c}),120);
    const rail=rosInst(flat(new THREE.BoxGeometry(.1,.1,3.1)),psMat({color:0xe8b81c}),120);
    for(let z=D.z0;z<=D.z1;z+=3){const x=D.x0-2.2,y=meshY(x,z);post.put(x,y,z,0);rail.put(x,y+1.15,z+1.5,0);}
    post.done();rail.done();
    /* a dockside crane leaning over the pit */
    const dc=new THREE.Group(),dq={x:D.x1+8,z:cz+20};dc.position.set(dq.x,meshY(dq.x,dq.z),dq.z);world.add(dc);
    hoorBox(dc,4,30,4,orange,0,15,0);hoorBox(dc,6,4,6,white,0,31,0);
    const jib=hisingenBeam(dc,new THREE.Vector3(0,33,0),new THREE.Vector3(-30,44,-10),1.2,orange);hoorMerge(dc);
    /* the coffee hut at the railing: the overlook */
    const q=at(HIS_OVERLOOK,HW+7),h=new THREE.Group();h.position.set(q.x,q.y,q.z);h.rotation.y=yawAt(HIS_OVERLOOK);world.add(h);res(q.x,q.z,5);
    hoorBox(h,3,2.6,2.4,psMat({color:0x2f62a8}),0,1.3,0);hoorBox(h,3.4,.2,2.8,dark,0,2.7,0);
    for(const x of [-1,1])hoorBox(h,.6,.8,.6,psMat({color:0xc8321f}),x*2.4,.4,.5);
    const s=sign('TORRDOCKAN','#f4f2ec','#1e2022',80,16,3,.6,7);s.position.set(0,3.3,0);h.add(s);
    hoorMerge(h);}

  /* the aggregate yard: heaps of crushed stone either side of the gravel lane, a conveyor, a loader */
  if(G){const heap=rosInst(flat(new THREE.ConeGeometry(1,1,7)),psMat({}),60,true);
    const cols=[0x8a8070,0x9a9080,0x6e665a,0xb0a48e];
    for(let j=COMMIT+8;j<G.n-MERGE-6;j+=7)for(const sd of [-1,1]){
      const r=5+H(j,sd)*5,q=lanePt(G,j/(G.n-1),sd*(G.hw+3+r));
      if(nearAltMain(q.x,q.z)<HW+r+4||latAt(q.x,q.z)<G.hw+r*.7)continue;
      heap.put(q.x,meshY(q.x,q.z)-.3,q.z,H(j,sd)*6,r,r*.55,r,cols[Math.floor(H(sd,j)*4)]);res(q.x,q.z,r+1);}
    heap.done();
    const jc=Math.round(G.n*.62),q=lanePt(G,jc/(G.n-1),G.hw+7),cg=new THREE.Group();cg.position.set(q.x,meshY(q.x,q.z),q.z);cg.rotation.y=q.yaw+.5;world.add(cg);
    hoorBox(cg,1.4,.4,22,dark,0,6,0);cg.children[0].rotation.x=-.42;
    for(const z of [-8,0,8])hoorBox(cg,.3,7.5-z*.38,.3,grey,0,(7.5-z*.38)/2,z);
    hoorMerge(cg);
    const lq=lanePt(G,.3,-(G.hw+5)),ld=new THREE.Group();ld.position.set(lq.x,meshY(lq.x,lq.z),lq.z);ld.rotation.y=lq.yaw+2.4;world.add(ld);
    const yel=psMat({color:0xe8b020});
    hoorBox(ld,2.6,1.6,5,yel,0,1.6,0);hoorBox(ld,2,1.8,2,psMat({color:0x2a3440}),0,3.1,-.6);hoorBox(ld,3.4,1.4,1,dark,0,1,3.2);
    for(const [x,z] of [[-1.4,-1.6],[1.4,-1.6],[-1.4,1.6],[1.4,1.6]]){const w=new THREE.Mesh(flat(new THREE.CylinderGeometry(.85,.85,.6,8)),dark);w.rotation.z=Math.PI/2;w.position.set(x,.85,z);ld.add(w);}
    hoorMerge(ld);
    const j0=COMMIT+3,q0=lanePt(G,j0/(G.n-1),0),gg=new THREE.Group();gg.position.set(q0.x,G.Y[j0],q0.z);gg.rotation.y=q0.yaw+Math.PI;world.add(gg);
    for(const sd of [-1,1])hoorBox(gg,.3,5.6,.3,orange,sd*(G.hw+1.2),2.8,0);
    const s=sign('GRUSUPPLAGET','#e86a1c','#1e2022',96,16,2*G.hw+2.6,1,7);s.position.set(0,5.8,0);gg.add(s);}

  /* the crest by the yard: warning sign before it, a gravel heap beside the landing */
  {const J=JUMPS[0];
    if(J){for(const sd of [-1,1]){const i=J.at-J.up-14,q=at(i,sd*(HW+2.8)),g=new THREE.Group();g.position.set(q.x,q.y,q.z);g.rotation.y=yawAt(i)+Math.PI;world.add(g);
        hoorBox(g,.12,2.2,.12,grey,0,1.1,0);
        const t=new THREE.Mesh(new THREE.PlaneGeometry(1.4,1.25),psMat({map:pixTex(32,28,c=>{
          c.fillStyle='#c8281c';c.beginPath();c.moveTo(16,0);c.lineTo(32,28);c.lineTo(0,28);c.fill();
          c.fillStyle='#f2c81c';c.beginPath();c.moveTo(16,5);c.lineTo(28,25);c.lineTo(4,25);c.fill();
          c.fillStyle='#1e2022';c.beginPath();c.arc(16,22,5,Math.PI,0);c.fill();c.fillRect(6,22,20,2);}),unlit:true,transparent:true,alphaTest:.5,side:THREE.DoubleSide}));
        t.position.set(0,2.7,0);g.add(t);
        const p=sign('KRÖN','#f4f2ec','#1e2022',48,16,1.2,.4,7);p.position.set(0,1.85,0);g.add(p);}
      const paint=psMat({color:0xf2c81c,unlit:true,transparent:true,opacity:.85,depthWrite:false});
      for(let k=-J.up;k<=0;k+=3){const ii=(J.at+k+N)%N,a=mainPt(ii,0);
        const m=new THREE.Mesh(new THREE.PlaneGeometry(2*HW-2.4,.5).rotateX(-Math.PI/2),paint);m.position.set(a.x,sy[ii]+.07,a.z);m.rotation.y=a.yaw;world.add(m);}
      for(const sd of [-1,1]){const q=at(J.at+4,sd*(HW+12));if(!free(q.x,q.z,6))continue;
        const hp=new THREE.Mesh(flat(new THREE.ConeGeometry(7,4.4,7)),psMat({color:0x8a8070}));hp.position.set(q.x,q.y+1.6,q.z);world.add(hp);res(q.x,q.z,8);}}}

  /* Verkstadsgolvet: the workshop hall over the lane, a roller door, an overhead crane, a jib crane with a container */
  if(V){
    const j0=(V.mouth||22)+1,j1=V.n-MERGE-6,W=V.hw+2.6;
    const halls=[],roof=rosInst(flat(new THREE.BoxGeometry(1,.5,1)),psMat({color:0x4c4f52}),V.n);
    const sky=rosInst(flat(new THREE.BoxGeometry(2.4,.2,1)),psMat({color:0xf2dcb0,unlit:true}),V.n);
    for(let j=j0;j<=j1;j+=2){const q=lanePt(V,j/(V.n-1),0),y=V.Y[j];
      for(const sd of [-1,1]){const D=sd>0?6:12,p=lanePt(V,j/(V.n-1),sd*(W+D/2));
        if(nearAltMain(p.x,p.z)<HW+4+D/2)continue;
        halls.push([p.x,y-.3,p.z,q.yaw,D,SEG*2+.3,9.4]);res(p.x,p.z,D/2+3);}
      roof.put(q.x,y+9.2,q.z,q.yaw,2*W+2,1,SEG*2+.3);if(j%6===1)sky.put(q.x,y+8.95,q.z,q.yaw,1,1,SEG*1.4);}
    world.add(new THREE.Mesh(borasMergeBoxes(halls),psMat({map:hisingenCladTex('#6a7e8a')})));
    roof.done();sky.done();
    /* inside: benches and racks against the walls, warm lamps, the overhead crane's runway */
    const bench=rosInst(flat(new THREE.BoxGeometry(1.2,1,3)).translate(0,.5,0),psMat({color:0x2f62a8}),V.n);
    const tool=rosInst(flat(new THREE.BoxGeometry(.5,.4,.5)),psMat({}),V.n*2,true);
    const lamp=rosInst(flat(new THREE.BoxGeometry(.9,.3,.9)),warm,V.n);
    for(let j=j0+2;j<j1-1;j+=3){for(const sd of [-1,1]){const p=lanePt(V,j/(V.n-1),sd*(V.hw+1.6)),y=V.Y[j];
        bench.put(p.x,y,p.z,p.yaw);tool.put(p.x,y+1.2,p.z,p.yaw+H(j,sd),1,1,1,[0xc8321f,0xe8b020,0x3f8a3a,0x8a9096][Math.floor(H(sd,j)*4)]);}
      const q=lanePt(V,j/(V.n-1),0);lamp.put(q.x,V.Y[j]+7.6,q.z,q.yaw);}
    bench.done();tool.done();lamp.done();
    {const jm=Math.round((j0+j1)/2),q=lanePt(V,jm/(V.n-1),0),g=new THREE.Group();g.position.set(q.x,V.Y[jm],q.z);g.rotation.y=q.yaw;world.add(g);
      hoorBox(g,2*W,1,1.2,orange,0,7.2,0);hoorBox(g,1.6,1.2,2,dark,1.5,6.4,0);hoorBox(g,.1,3,.1,dark,1.5,4.4,0);hoorBox(g,1,.3,.6,psMat({color:0xe8b020}),1.5,2.8,0);
      hoorMerge(g);HIS.bridge={g,q,W,len:(j1-j0)*SEG/2};}
    /* the facade over the door, and at the narrow way out bollards right up to the line */
    for(const [jj,txt] of [[j0-1,'VERKSTAD 2'],[j1,'UTFART']]){const q=lanePt(V,jj/(V.n-1),0);
      const s=sign(txt,'#2a2c30','#f2c81c',96,16,2*V.hw+2,1.1,7);s.position.set(q.x,V.Y[jj]+7.8,q.z);s.rotation.y=q.yaw+Math.PI;world.add(s);
      const bm=new THREE.Mesh(flat(new THREE.BoxGeometry(2*W+2,2.2,.8)),psMat({map:hisingenCladTex('#6a7e8a','#e86a1c')}));bm.position.set(q.x,V.Y[jj]+8.1,q.z);bm.rotation.y=q.yaw;world.add(bm);}
    const bol=rosInst(flat(new THREE.CylinderGeometry(.22,.22,1.1,6)).translate(0,.55,0),psMat({map:pixTex(4,8,c=>{c.fillStyle='#e8b81c';c.fillRect(0,0,4,8);c.fillStyle='#1e2022';c.fillRect(0,2,4,2);c.fillRect(0,6,4,2);})}),40);
    for(let j=j1-4;j<V.n-MERGE+2;j++)for(const sd of [-1,1]){const p=lanePt(V,j/(V.n-1),sd*(V.hw+.5));if(nearAltMain(p.x,p.z)<HW+1)continue;bol.put(p.x,meshY(p.x,p.z),p.z,0);}
    bol.done();
    /* the jib crane by the door: it lowers a container in front of the door and lifts it clear again */
    const jm=V.mouth||22,q=lanePt(V,(jm-4)/(V.n-1),0),base=lanePt(V,(jm-4)/(V.n-1),-(V.hw+5)),yb=meshY(base.x,base.z);
    const g=new THREE.Group();g.position.set(base.x,yb,base.z);world.add(g);res(base.x,base.z,4);
    hoorBox(g,2,20,2,orange,0,10,0);hoorBox(g,3.4,1,3.4,dark,0,.5,0);hoorMerge(g);
    const arm=new THREE.Group();arm.position.set(base.x,yb+20,base.z);arm.rotation.y=Math.atan2(q.x-base.x,q.z-base.z);world.add(arm);
    hoorBox(arm,1.2,1.4,14,orange,0,.7,4.5);hoorBox(arm,2,2,3,white,0,-.4,-1.6);
    const hook=new THREE.Group(),cable=hoorBox(hook,.12,1,.12,dark,0,0,0);arm.add(hook);
    const ct=new THREE.Mesh(hisingenBoxGeo(),psMat({color:0x2f62a8}));hook.add(ct);
    HIS.jib={hook,cable,ct,dz:base.x===q.x&&base.z===q.z?0:Math.hypot(q.x-base.x,q.z-base.z),yb,yl:V.Y[jm-4]};
  }

  /* the signs: the way to the city centre, and later the one that says you have been here before */
  for(const [i,txt,bg] of [[150,'CENTRUM →','#2f62a8'],[688,'DU VAR JU NYSS HÄR','#2a7a3a']]){
    const q=at(i,HW+7.5),g=new THREE.Group();g.position.set(q.x,q.y,q.z);g.rotation.y=yawAt(i)+Math.PI;world.add(g);res(q.x,q.z,6);
    for(const x of [-3.6,3.6])hoorBox(g,.24,5.2,.24,grey,x,2.6,0);
    const s=sign(txt,bg,'#f4f2ec',144,24,8.4,1.4,8,'#f4f2ec');s.position.set(0,5.3,0);g.add(s);}

  /* industrial service forecourts: a sign over each Statolja that says what it really is */
  for(const S_ of stations){const q=at(S_.at-3,S_.side*(HW+6)),g=new THREE.Group();g.position.set(q.x,q.y,q.z);g.rotation.y=yawAt(S_.at)+Math.PI;world.add(g);
    for(const x of [-1.4,1.4])hoorBox(g,.18,4.4,.18,grey,x,2.2,0);
    const s=sign('INDUSTRISERVICE','#e86a1c','#1e2022',112,16,3.6,.6,6);s.position.set(0,4.2,0);g.add(s);}

  /* the start: a banner over the grid and the shipyard staging area */
  {const ii=N-26,bg=new THREE.Group();bg.position.set(sx[ii],sy[ii],sz[ii]);bg.rotation.y=yawAt(ii)+Math.PI;world.add(bg);
    for(const sd of [-1,1])hoorBox(bg,.6,8,.6,orange,sd*(HW+2.4),4,0);
    const b=new THREE.Mesh(new THREE.PlaneGeometry(2*HW+4,2.2),psMat({map:pixTex(160,24,c=>{c.fillStyle='#e86a1c';c.fillRect(0,0,160,24);
      c.fillStyle='#1e2022';for(let x=0;x<160;x+=8){c.fillRect(x,0,4,2);c.fillRect(x+4,22,4,2);}
      c.font='8px "Press Start 2P",monospace';c.textAlign='center';c.textBaseline='middle';c.fillText('VARVSPLAN 3',80,13);}),unlit:true,side:THREE.DoubleSide}));
    b.position.set(0,7,0);bg.add(b);}

  /* container stacks: the avenue along the roads, then the yard behind it */
  for(const [i0,i1,sd,o] of [[86,124,-1,9],[300,368,-1,9],[470,500,-1,9],[540,650,-1,9],[0,60,-1,12],[300,360,1,9],[470,520,1,10],[530,660,1,10],[140,170,1,9],[N-60,N,-1,10]]){
    for(let i=i0;i<i1;i+=1){const ii=((i%N)+N)%N,q=mainPt(ii,sd*(HW+o));
      if(stack(q.x,q.z,yawAt(ii),2+Math.floor(H(ii,sd)*3),3))i+=1;}}
  /* warehouses and workshops round the edge of the port */
  {const lists=[[],[],[]],tex=[hisingenCladTex('#8a9aa4','#2f62a8'),hisingenCladTex('#b8a888','#c8321f'),hisingenCladTex('#6a7e8a','#e86a1c')];
    const tryShed=(x,z,yw,L,D,Ht)=>{const c=Math.cos(yw),s=Math.sin(yw);
      for(const [lx,lz] of [[-L/2,-D/2],[L/2,-D/2],[-L/2,D/2],[L/2,D/2],[0,0]]){const wx=x+c*lx+s*lz,wz=z-s*lx+c*lz;if(!free(wx,wz,6)||nearAlt(wx,wz,6))return false;}
      lists[Math.floor(H(x,z)*3)].push([x,meshY(x,z)-.2,z,yw,Math.round(L/4)*4,Math.round(D),Math.round(Ht/3.4)*3.4]);res(x,z,Math.max(L,D)/2+2);return true;};
    for(let gx=-440;gx<=440;gx+=44)for(let gz=-440;gz<=140;gz+=36){
      const x=gx+H(gx,gz)*10,z=gz+H(gz,gx)*8;
      if(z>-300&&z<120&&x>-205&&x<360)continue;                 /* the yard inside the loop is for containers */
      tryShed(x,z,H(gx*3,gz)>.5?0:Math.PI/2,24+H(gz,gx*2)*16,16+H(gx*2,gz)*10,8+H(gx,gz*3)*8);}
    lists.forEach((l,n)=>{if(!l.length)return;world.add(new THREE.Mesh(borasMergeBoxes(l),psMat({map:tex[n]})));
      const rf=rosInst(flat(new THREE.BoxGeometry(1,.5,1)),psMat({color:0x4c4f52}),l.length);
      for(const [x,y,z,yw,L,D,Ht] of l)rf.put(x,y+Ht,z,yw,L+.4,1,D+.4);rf.done();});}

  for(let gx=-420;gx<=440;gx+=8)for(let gz=-420;gz<=150;gz+=16){
    const x=gx+H(gx,gz)*1.5,z=gz+H(gz,gx)*2;if(H(gx*.1,gz*.1)<.18||(z>100&&x>-120&&x<300))continue;   /* the quay stays open to the ship */
    stack(x,z,Math.PI/2,1+Math.floor(H(gx*3,gz)*4),6);}
  plain.done();named.forEach(m=>m.done());

  /* the floodlight masts: warm work lights all round the yard */
  {const pole=rosInst(flat(new THREE.CylinderGeometry(.22,.32,22,5)).translate(0,11,0),grey,120);
    const head=rosInst(flat(new THREE.BoxGeometry(2.6,.9,.6)),warm,120);
    const put=(x,z,yw)=>{const y=meshY(x,z);pole.put(x,y,z,0);head.put(x,y+22,z,yw,1,1,1,null,.35);head.put(x,y+21,z,yw+Math.PI,.8,1,1,null,.35);res(x,z,2);};
    for(let i=0;i<N;i+=34){const sd=(i/34)%2?1:-1,q=mainPt(i,sd*(HW+6.4));
      if(nearAlt(q.x,q.z,3)||!free(q.x,q.z,-HW+5))continue;
      if(stations.some(S=>{let d=i-S.at;if(d<-N/2)d+=N;else if(d>N/2)d-=N;return Math.abs(d-6)<14;}))continue;
      put(q.x,q.z,Math.atan2(-sd*rx[i],-sd*rz[i]));}
    for(let n=0,g2=0;n<26&&g2<800;g2++){const x=rand(-400,420),z=rand(-400,140);if(!free(x,z,5))continue;put(x,z,rand(0,6));n++;}
    pole.done();head.done();}
}
/** the workshop's roller door: yellow-and-black chevrons and a target; rolls up into its box */
function hisingenDoor(R,j){
  const g=new THREE.Group();g.rotation.y=Math.atan2(R.FX[j],R.FZ[j]);
  const W=2*R.hw+2;
  const tex=pixTex(32,32,c=>{c.fillStyle='#b8b4aa';c.fillRect(0,0,32,32);
    for(let y=0;y<32;y+=3){c.fillStyle='#8a867c';c.fillRect(0,y,32,1);}
    c.fillStyle='#e8b81c';c.fillRect(0,25,32,7);c.fillStyle='#1e2022';for(let x=-8;x<32;x+=6){c.beginPath();c.moveTo(x,32);c.lineTo(x+3,32);c.lineTo(x+10,25);c.lineTo(x+7,25);c.fill();}
    c.fillStyle='#c8321f';c.beginPath();c.arc(16,12,7,0,6.3);c.fill();c.fillStyle='#f4f2ec';c.beginPath();c.arc(16,12,4.5,0,6.3);c.fill();
    c.fillStyle='#c8321f';c.beginPath();c.arc(16,12,2,0,6.3);c.fill();});
  const sh=new THREE.Mesh(flat(new THREE.BoxGeometry(W,6.6,.35)),psMat({map:tex}));sh.position.y=3.3;g.add(sh);g.userData.shutter=sh;
  const box=new THREE.Mesh(flat(new THREE.BoxGeometry(W+.4,1,1)),psMat({color:0xe86a1c}));box.position.y=7.1;g.add(box);
  for(const sd of [-1,1]){const p=new THREE.Mesh(flat(new THREE.BoxGeometry(.5,7.6,.5)),psMat({color:0x2a2c30}));p.position.set(sd*(W/2+.25),3.8,0);g.add(p);}
  return g;
}
function hisingenDoorAnim(B,drop){
  const sh=B.mesh.userData.shutter;if(!sh)return;
  sh.scale.y=Math.max(.04,1-drop);sh.position.y=6.6-3.3*sh.scale.y;
}
const HIS={anim:[],lamps:[],jib:null,bridge:null,sayLap:-1};

/* ───── Hisingen hazards: lastkärran on its rails; the cranes for show ───── */
/** the trolley's bell: two bright partials ringing out */
function hisingenBell(vol){
  if(!actx)return;
  const t=actx.currentTime;
  for(const [f,a] of [[1320,.09],[2210,.05],[3170,.025]]){
    const o=actx.createOscillator(),g=actx.createGain();o.type='sine';o.frequency.value=f;
    g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(a*(vol||1),t+.005);g.gain.exponentialRampToValueAtTime(.0001,t+.55);
    o.connect(g);g.connect(audioOutput());o.start(t);o.stop(t+.6);
  }
}
function hazardsHisingen(H){
  vastPA();HIS.sayLap=-1;
  /* lastkärran: an unmanned workshop trolley on a marked track from its bay to the middle of the road
     and back. Bell and a flashing lamp first, then it rolls; the left half of the road stays clear. */
  {const i=HIS_TROLLEY,home=HW+9,out=1.9,BL=1.5,BW=1.9;                   /* half length across, half width along the road */
    const yaw=Math.atan2(rx[i],rz[i]);
    /* the rails and the hatched travel zone, from the bay to the middle of the road */
    const mk=new THREE.Group(),q0=mainPt(i,0);mk.position.set(q0.x,q0.y,q0.z);mk.rotation.y=Math.atan2(fx[i],fz[i])+Math.PI;world.add(mk);   /* local x: to the right */
    const steel=psMat({color:0x6a6e72}),paint=psMat({color:0xf2c81c,unlit:true}),blk=psMat({color:0x26262a});
    for(const m of [paint,blk]){m.polygonOffset=true;m.polygonOffsetFactor=-2;m.polygonOffsetUnits=-2;}
    const len=home+BL+1-(out-BL-.6),mid=(home+BL+1+out-BL-.6)/2;
    /* heights follow the banked road out to its edge, then the ground */
    const hy=l=>Math.abs(l)<HW+.6?l*bank[i]:meshY(sx[i]+rx[i]*l,sz[i]+rz[i]*l)-q0.y+DIP*.9;
    const sleeper=psMat({color:0x4a3a2a});
    for(let l=out-BL-.6;l<home+BL+1;l+=1.2){
      const s=new THREE.Mesh(flat(new THREE.BoxGeometry(.22,.06,2.8)),sleeper);s.position.set(l,hy(l)+.04,0);mk.add(s);
      for(const f of [-1.1,1.1]){const r=new THREE.Mesh(flat(new THREE.BoxGeometry(1.24,.08,.14)),steel);r.position.set(l+.6,hy(l+.6)+.1,f);r.rotation.z=Math.atan(bank[i]);mk.add(r);}}
    for(const f of [-1,1]){const e=new THREE.Mesh(new THREE.PlaneGeometry(HW-out+BL+.6,.4).rotateX(-Math.PI/2),paint);e.position.set((HW+out-BL-.6)/2,hy((HW+out-BL-.6)/2)+.07,f*(BW+1.2));e.rotation.z=Math.atan(bank[i]);mk.add(e);}
    for(let l=out-BL;l<HW-.6;l+=1.2){const h=new THREE.Mesh(new THREE.PlaneGeometry(.6,2*BW+1.6).rotateX(-Math.PI/2),(Math.round(l/1.2)%2)?paint:blk);h.position.set(l,hy(l)+.07,0);h.rotation.y=.35;mk.add(h);}
    /* the bay: a post with the bell and the lamp, a buffer stop */
    const post=new THREE.Group();post.position.set(home+BL+.6,hy(home+BL+.6),-BW-1.4);mk.add(post);
    hoorBox(post,.25,3.4,.25,psMat({color:0x2a2c30}),0,1.7,0);hoorBox(post,1.4,1.4,.4,psMat({color:0xf2c81c}),0,2.6,.2);
    const bell=new THREE.Mesh(flat(new THREE.ConeGeometry(.45,.6,8,1,true)),psMat({color:0xd8a838,side:THREE.DoubleSide}));bell.position.set(0,3.6,0);post.add(bell);
    const lamp=new THREE.Mesh(flat(new THREE.BoxGeometry(.5,.5,.5)),psMat({color:0x5a3008,unlit:true}));lamp.position.set(.9,3.3,0);post.add(lamp);
    hoorBox(mk,.6,1,2.8,psMat({color:0xc8321f}),home+BL+1.3,hy(home+BL+1.3)+.5,0);
    /* the trolley: a low flatbed with a pipe rack and a gas bottle, orange, on four small wheels */
    const g=new THREE.Group();world.add(g);
    /* local x along the road (half BW), local z across it (half BL) */
    hoorBox(g,2*BW,.5,2*BL,psMat({color:0xe86a1c}),0,.65,0);
    for(const [x,z] of [[-BW+.4,-BL+.3],[BW-.4,-BL+.3],[-BW+.4,BL-.3],[BW-.4,BL-.3]]){const w=new THREE.Mesh(flat(new THREE.CylinderGeometry(.32,.32,.2,8)),psMat({color:0x1e2022}));w.rotation.z=Math.PI/2;w.position.set(x,.32,z);g.add(w);}
    for(const x of [-BW+.3,BW-.3])hoorBox(g,.14,1.6,2*BL,psMat({color:0x2a2c30}),x,1.7,0);
    for(let n=0;n<4;n++){const p=new THREE.Mesh(flat(new THREE.CylinderGeometry(.22,.22,2*BL+.4,6)),psMat({color:[0x8a9096,0x6a8a6a,0x8a9096,0x9a7a5a][n]}));p.rotation.x=Math.PI/2;p.position.set(-.6+(n%2)*1.2,1.15+Math.floor(n/2)*.46,0);g.add(p);}
    const gas=new THREE.Mesh(flat(new THREE.CylinderGeometry(.3,.3,1.4,8)),psMat({color:0x2f62a8}));gas.position.set(BW-.6,1.6,BL-.6);g.add(gas);
    const flag=new THREE.Mesh(new THREE.PlaneGeometry(.6,.4),psMat({color:0xf2c81c,side:THREE.DoubleSide}));flag.position.set(-BW+.3,3,0);g.add(flag);
    hoorBox(g,.06,1.2,.06,psMat({color:0x2a2c30}),-BW+.3,2.6,0);
    let cyc=-1,rang=0,hitThis=new Set(),said=false;
    H.push({id:'lastkarran',period:9,phase:3,mesh:g,
      update(u,dt){
        const c=Math.floor((raceTime+3)/9);if(c!==cyc){cyc=c;hitThis=new Set();said=false;}
        const warn=u<.2,v=smooth(.2,.38,u)*(1-smooth(.62,.8,u)),moving=(u>.2&&u<.38)||(u>.62&&u<.8);
        const l=lerp(home,out,v),q=mainPt(i,l),y=Math.abs(l)<HW+1?q.y:meshY(q.x,q.z);
        g.position.set(q.x,y+(moving?Math.abs(Math.sin(clock*30))*.05:0),q.z);g.rotation.y=yaw+(warn?Math.sin(clock*38)*.03:0);
        bell.rotation.z=warn||moving?Math.sin(clock*22)*.35:0;
        lamp.material.uniforms.uColor.value.setHex((warn||v>0)&&Math.floor(clock*5)%2?0xff9a1a:0x5a3008);
        flag.rotation.y=Math.sin(clock*6)*.4;
        const near=player&&state==='race'&&Math.hypot(player.x-q.x,player.z-q.z)<90;
        rang-=dt||0;
        if(near&&(warn||moving)&&rang<=0){rang=warn?.32:.6;hisingenBell(warn?1:.7);}
        if(near&&moving&&Math.random()<(dt||0)*6)lerumRattle(.35);
        /* the loudspeaker, once a lap, as the trolley sets off */
        if(!said&&warn&&player&&state==='race'&&player.lap!==HIS.sayLap&&Math.hypot(player.x-q.x,player.z-q.z)<160){
          said=true;HIS.sayLap=player.lap;vastPA('Godset ska till kajen. Inte till mållinjen.');}
        this.l=l;this.on=v>.02;
      },
      hit(k){
        if(!this.on||k.rib||k.air||hitThis.has(k))return false;
        const dx=k.x-sx[i],dz=k.z-sz[i],f=dx*fx[i]+dz*fz[i],lt=dx*rx[i]+dz*rz[i];
        return Math.abs(f)<BW+1.1&&Math.abs(lt-this.l)<BL+1.1&&Math.abs(k.y-sy[i])<2.6;
      },
      effect(k){
        hitThis.add(k);                                   /* one knock per trip: it never pushes or pins */
        k.slow=Math.max(k.slow,.45);k.vx*=0.78;k.vz*=0.78;k.boost=0;k.drift=0;k.charge=0;
        for(let p=0;p<12;p++)puff(k.x+rand(-1.2,1.2),k.y+rand(.3,1.4),k.z+rand(-1.2,1.2),.9,.6,.3,.5);
        if(k===player){toast('LASTKÄRRAN!');hisingenBell(1.3);klonk();shake=Math.min(1,shake+.3);}
      }});
  }
  /* the port moves for show: the jib crane lifts its container clear of the workshop door and lowers it again,
     the quay cranes' trolleys run out over the ship, the overhead crane creeps, the floodlights hum */
  H.push({id:'hisingenHamn',period:16,phase:0,
    update(u,dt){
      const J=HIS.jib,V=ALTS.find(r=>r.id==='verkstad');
      if(J){const keepUp=V&&(V.open||karts.some(k=>k.rib===V.idx));
        const d=keepUp?0:smooth(.5,.62,u)*(1-smooth(.8,.92,u));          /* mostly up: the door stays readable */
        const yTop=J.yb+20,yHook=lerp(yTop-3,J.yl+5.8,d),Lc=yTop-yHook;    /* container bottom 3.2 m over the floor at its lowest */
        J.hook.position.set(0,-Lc,J.dz);J.cable.scale.y=Math.max(.1,Lc);J.cable.position.y=Lc/2;J.ct.position.y=-2.6;}
      for(const A of HIS.anim){const t=(clock*.06+A.ph)%1,s=t<.5?smooth(0,.5,t):1-smooth(.5,1,t);A.g.position.z=HIS_QUAY+4+s*58;}
      const B=HIS.bridge;if(B){const s=Math.sin(clock*.15)*B.len*.8;B.g.position.set(B.q.x+Math.sin(B.q.yaw)*s,B.g.position.y,B.q.z+Math.cos(B.q.yaw)*s);}
    }});
}

/** the stage's postcard, for the picnic passport: Majros' little milk tanker on the quay beside a
    ship that does not fit on the card. Drawn on a 192 x 120 canvas, shown pixelated. */
function hisingenPostcard(g,w,h){
  const R=(c,x,y,a,b)=>{g.fillStyle=c;g.fillRect(x,y,a,b);};
  const sky=g.createLinearGradient(0,0,0,64);sky.addColorStop(0,'#3a4a86');sky.addColorStop(1,'#f6a85a');
  g.fillStyle=sky;g.fillRect(0,0,w,64);
  R('#ffd88a',150,40,12,12);R('#ffe8b0',152,42,8,8);                                       /* the low sun */
  R('#e86a1c',8,14,3,50);R('#e86a1c',30,14,3,50);R('#e86a1c',4,14,60,3);R('#e86a1c',60,10,40,2);   /* a crane */
  R('#4a5a7a',0,60,w,10);g.fillStyle='rgba(255,200,120,.5)';for(let n=0;n<12;n++)g.fillRect((n*41)%w,62+(n*5)%7,8,1);
  /* the ship: from the left edge past the right, hull and a wall of containers */
  R('#22344e',0,34,w,40);R('#9a2a22',0,70,w,4);R('#eceae2',0,34,w,2);
  const cols=['#c8321f','#2f62a8','#3f8a3a','#e8b020','#f08a1c','#8a4fa8','#2a8a84'];
  for(let x=0;x<w;x+=12)for(let y=0;y<4;y++)if((x*7+y*3)%11>1)R(cols[(x/12+y*3)%cols.length],x+1,22+y*3,11,3);
  R('#eceae2',150,4,30,18);for(let y=7;y<20;y+=4)for(let x=152;x<178;x+=4)R('#3c4a58',x,y,2,2);
  R('#f2c81c',70,52,16,3);g.fillStyle='#f2c81c';g.beginPath();g.moveTo(86,50);g.lineTo(90,53.5);g.lineTo(86,57);g.fill();   /* GOKART → */
  /* the quay and the tiny tanker */
  R('#a29e94',0,74,w,46);R('#e8b81c',0,76,w,1);
  R('#1e2022',38,104,8,8);R('#1e2022',62,104,8,8);R('#1e2022',86,104,8,8);
  R('#eceae2',52,88,46,17);R('#d8d4c8',52,100,46,3);R('#2f62a8',54,92,42,3);                 /* the milk tank */
  R('#2f62a8',30,84,20,21);R('#cfe6f4',33,87,14,9);                                          /* the cab */
  R('#f2efe6',36,88,8,8);R('#22201e',36,88,4,3);R('#e0a0a0',37,93,6,3);R('#1e2022',38,90,1,1);R('#1e2022',42,90,1,1);   /* Majros at the wheel */
  R('#d8c8a0',34,86,2,2);R('#d8c8a0',44,86,2,2);
  for(const [x,y] of [[58,90],[70,95],[82,89],[90,96]])R('#22201e',x,y,5,3);                  /* the tank in cow spots */
  /* the stamp corner and the greeting */
  R('#f4efe2',156,92,30,22);R('#e86a1c',158,94,26,18);R('#22344e',161,103,20,5);R('#f4f2ec',165,99,4,4);
  g.fillStyle='#fff';g.font='bold 11px "Titillium Web",sans-serif';g.textAlign='left';g.fillText('Hälsningar från Hisingen!',6,14);
  g.lineWidth=2;g.strokeStyle='#fff';g.strokeRect(1,1,w-2,h-2);
}
