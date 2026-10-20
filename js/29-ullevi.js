"use strict";
/* ───────── Ullevi ───────── */
/* Sista visslan: the finale of Göteborgscupen and Domaren's home track. A fictional motor
   festival at blue hour: start on the event racing mat inside the arena, out through the
   service tunnel under the east stand, a fast sweep round the forecourt, back in through the
   visitors' tunnel, a broad hairpin at the west end and the long sprint past the stands. */
SURF.ulleviMatta={top:o=>1,grip:o=>1,fuel:1.0,name:'EVENTMATTA'};
SFX.ulleviMatta={dust:null,noise:{f:520,g:.012}};
ROADTEX.ulleviMatta=()=>pixTex(64,64,g=>{            /* the event mat: interlocking rubber tiles, scuffed */
  g.fillStyle='#2e3442';g.fillRect(0,0,64,64);
  for(let i=0;i<700;i++){g.fillStyle=Math.random()>.5?'rgba(84,94,116,.45)':'rgba(14,16,22,.45)';
    g.fillRect((Math.random()*64)|0,(Math.random()*64)|0,1,1);}
  g.fillStyle='#454e62';for(const v of [0,16,32,48]){g.fillRect(v,0,1,64);g.fillRect(0,v,64,1);}
  g.fillStyle='rgba(20,22,28,.6)';for(const v of [1,17,33,49]){g.fillRect(v,0,1,64);g.fillRect(0,v,64,1);}
  g.fillStyle='rgba(16,18,22,.45)';for(let i=0;i<5;i++)g.fillRect((Math.random()*54)|0,(Math.random()*60)|0,10,2);
});
VERGEC.ullevi=['#8e8c88','#a6a49e','#6e6c68'];            /* concrete concourse kerbs */
GROUND.ullevi={cell:22,stripe:0.9,verge:0x8a8884,
  cols:[0x77767a,0x6e6d72,0x838288,0x56684e,0x7c7a76,0x68696e,0x5e7054]};

/* the arena: the stands make an elliptical ring between IN and OUT; the pitch and the
   running track lie inside IN. Both tunnels are gaps in the ring the road drives through. */
const ULLEVI_IN={a:130,b:78}, ULLEVI_OUT={a:156,b:102};
const ULLEVI_Y0=2.6, ULLEVI_TUN=8.2, ULLEVI_T=7;
const ulleviEll=(x,z,E)=>(x/E.a)*(x/E.a)+(z/E.b)*(z/E.b);
const ulleviInRing=(x,z,pad)=>{const p=pad||0;
  return ulleviEll(x,z,{a:ULLEVI_OUT.a+p,b:ULLEVI_OUT.b+p})<1&&ulleviEll(x,z,{a:ULLEVI_IN.a-p,b:ULLEVI_IN.b-p})>=1;};
const ulleviInArena=(x,z)=>ulleviEll(x,z,ULLEVI_IN)<1;
/** a point of the stand ring: angle t round the bowl, s from the front wall (0) to the back (1) */
function ulleviRingPt(t,s){return [lerp(ULLEVI_IN.a,ULLEVI_OUT.a,s)*Math.cos(t),lerp(ULLEVI_IN.b,ULLEVI_OUT.b,s)*Math.sin(t)];}
/* where the set pieces sit, worked out from the samples once the track is laid */
const ULLEVI_BALL={i:492,home:-24,lats:[-24,-17,-10,-3,-10,-17,-24]}, ULLEVI_KIOSK=455, ULLEVI_WHISTLE=118, ULLEVI_FANS=[-1.97,-1.42];

STAGES.push({ id:'ullevi', group:'goteborg', name:'ULLEVI', sub:'SISTA VISSLAN',
  order:26, tag:'Finalen. Ut genom servicetunneln, ett varv runt förplatsen och in igen till strålkastarna och en publik som vinkar med allt den har. Domaren har visslan. Maskoten har en boll han inte borde ha.',
  view:{i:704,lat:4,h:3.2,to:{i:40,lat:-30,h:12},fov:62},
  hw:8.6,
  bars:[0.85,0.65,0.55], laps:3, stand:false, bankGain:0.16, bankMax:0.22,
  blurb:'The finale of Göteborgscupen and Domaren\'s home track: a fictional motor festival in a floodlit arena at blue hour. Start on the event racing mat in front of a waving crowd, leave through the wide service tunnel under the east stand, sweep round the forecourt past the event ramp and the sausage kiosk, and come back in through the visitors\' tunnel for a broad hairpin and the long sprint past the stands. Materialgången is the tight equipment corridor across the north-west corner; Bakom läktaren is the paved lane round the back of the stands. Out on the plaza the mascot has got hold of a giant ball, and it bounces the same way every time.',
  role:'Eventmatta i arenan, en snabb förplats, trånga servicekurvor och en lång upploppsraka framför läktarna.',
  sky:[0x8a90c8,0x0e1a48], fog:[0x5a6496,110,460], amb:0x6a70a0, dif:0xc4ccf4,
  road:'asphalt', verge:'ullevi', edge:'ullevi', ground:'ullevi',
  terrain:{size:900,seg:110},
  /* a flat city site: away from the road the ground settles at the arena floor */
  mod:(x,z,t)=>t*(3-sy[nearestGlobal(x,z)])-rolls(x,z)*t,
  land:(x,z,out)=>landUllevi(x,z,out),
  zones:[[570,56,'ulleviMatta']],
  jumpSpec:[{at:186,h:2.4,drop:1.6,up:10,dn:6,rec:14}],
  ctrl:[[-15,3,-42],[45,3,-42],[105,3,-42],
        [150,3,-43],[176,3,-54],[188,3,-78],[182,3,-106],[160,3,-126],[118,3,-134],
        [60,3,-136],[0,3,-136],[-60,3,-135],
        [-126,3,-134],[-166,3,-128],[-180,3,-98],
        [-178,3,-26],[-178,3,26],[-174,3,64],
        [-168,3,108],[-138,3,136],[-86,3,148],[-17,3,146],[48,3,142],[106,3,128],
        [150,3,104],[176,3,74],[184,3,46],[172,3,26],[146,3,21],
        [100,3,21],[40,3,21],[-20,3,21],
        [-58,3,17],[-82,3,6],[-96,3,-12],[-92,3,-31],[-74,3,-41],[-50,3,-42]],
  stations:[[0.2,1],[0.82,-1]],
  routes:[
    {id:'material',name:'MATERIALGÅNGEN',a:226,b:298,hw:3.8,side:-1,lead:16,leadLat:14,
     mid:[[0.5,0]],surface:'road',tex:'concrete',risk:0.3,
     blurb:'The equipment corridor across the north-west corner, between stacks of flight cases. Tight as a door frame on the way in; it saves the bend if you get in cleanly.'},
    {id:'lakt',name:'BAKOM LÄKTAREN',a:328,b:432,hw:4.2,side:-1,lead:20,leadLat:14,
     mid:[[0.5,0]],surface:'road',tex:'asphalt',risk:0.35,
     blurb:'The paved service lane round the back of the south-west stand. Two awkward kinks past the coffee stall, then a wide, safe merge out on the plaza.'}],
  stamps:[
    {id:'ull1',dish:'Halvtidskorv',ini:'H',kind:'intro',route:'main',i:ULLEVI_KIOSK,lat:6.6,
     hint:'Vid korvkiosken på torget utanför arenan, i ytterkanten.',
     story:'The half-time sausage: a grilled hot dog in a soft bread roll with mustard and ketchup, or korv med mos with a scoop of mashed potato and prawn salad if the kiosk is feeling generous. The queue forms the moment the whistle goes and is longest exactly when the second half starts.'},
    {id:'ull2',dish:'Läktarkaffe',ini:'L',kind:'route',route:'lakt',f:0.5,lat:0,
     hint:'Mitt i gången bakom läktaren, vid kaffeståndet.',
     story:'Stand coffee: strong filter coffee poured from a pump flask into a paper cup that is always too hot to hold, with a cinnamon bun on the side. Behind the stands it is drunk standing up in a thick jacket, steam rising, while the crowd noise rolls over the roof.'},
    {id:'ull3',dish:'Segerbulle',ini:'S',kind:'air',route:'main',jump:0,after:5,lat:0,air:4.2,
     hint:'Högt över eventrampen på norra förplatsen.',
     story:'The festival\'s own invention: a big cardamom bun knotted like a laurel wreath, glazed with syrup and showered in pearl sugar, handed out on the podium to whoever finishes. Everyone else has to buy one, and nobody has ever been seen to eat one sitting down.'}],
  postcard:{draw:(g,w,h)=>ulleviPostcard(g,w,h),
    caption:'All konfetti var lika stor. Utom en.'},
  hazards:H=>hazardsUllevi(H), scenery:()=>sceneryUllevi()
});

function landUllevi(x,z,out){
  if(ulleviInArena(x,z)){
    if(Math.abs(x)<104&&Math.abs(z)<58){out.setHex(Math.floor((x+200)/9)&1?0x3e8a3e:0x4a9a48);return;}   /* the pitch, mown in stripes */
    out.setHex(0xa4523a);return;                                                                       /* the running track */
  }
  if(ulleviInRing(x,z,0)){out.setHex(0x55575e);return;}                                                /* under the stands */
  if(ulleviInRing(x,z,10)){out.setHex(0x9c9aa0);return;}                                               /* the concourse round it */
  const q=ulleviBallBase(),d=q?Math.hypot(x-q.x,z-q.z):99;
  if(d<26)out.setHex(d>21?0x6c6a72:0xa8a6ae);                                                          /* the plaza: pale paving, a dark rim */
}
let ULLEVI_PLAZA=null;
/** the middle of the mascot's plaza beside the road */
function ulleviBallBase(){
  if(stage.id!=='ullevi')return null;
  const key=sx[ULLEVI_BALL.i]+','+sz[ULLEVI_BALL.i];
  if(!ULLEVI_PLAZA||ULLEVI_PLAZA.key!==key){const i=ULLEVI_BALL.i,o=ULLEVI_BALL.home+6;
    ULLEVI_PLAZA={key,x:sx[i]+rx[i]*o,z:sz[i]+rz[i]*o};}
  return ULLEVI_PLAZA;
}

/* the edge: advertising boards round the event course inside the arena, concrete barriers
   with a blue band outside; nothing in the tunnels (the stand walls are there), the lane
   mouths or the fuel bays */
EDGES.ullevi=st=>{
  const step=2,L=SEG*step+.12;
  const board=rosInst(flat(new THREE.BoxGeometry(.3,1.1,L)).translate(0,.55,0),psMat({map:pixTex(16,8,c=>{
    c.fillStyle='#ffffff';c.fillRect(0,0,16,8);c.fillStyle='rgba(0,0,0,.28)';
    for(let x=0;x<16;x+=4){c.fillRect(x,1,2,2);c.fillRect(x+2,3,2,2);c.fillRect(x,5,2,2);}
    c.fillStyle='rgba(0,0,0,.45)';c.fillRect(0,7,16,1);})}),N*2,true);
  const base=rosInst(flat(new THREE.BoxGeometry(.9,.9,L)).translate(0,.45,0),psMat({color:0x9a9890}),N*2);
  const band=rosInst(flat(new THREE.BoxGeometry(.94,.22,L+.02)).translate(0,.11,0),psMat({color:0x2f62c8}),N*2);
  const cols=[0xe8c21c,0xd8322a,0x2f78d8,0xf4f2ec,0xf08a1c,0x8a4fd8,0x2aa8a0];
  for(let i=0;i<N;i+=step)for(const side of [-1,1]){
    const o=side*(HW+3.4),x=sx[i]+rx[i]*o,z=sz[i]+rz[i]*o;
    if(nearAlt(x,z,2.6)||ulleviInRing(x,z,3))continue;
    if(stations.some(S=>{let d=i-S.at;if(d<-N/2)d+=N;else if(d>N/2)d-=N;return S.side===side&&d>-3&&d<S.len+3;}))continue;
    const y=meshY(x,z),yw=Math.atan2(fx[i],fz[i]);
    if(ulleviInArena(x,z))board.put(x,y-.05,z,yw,1,1,1,cols[Math.floor(i/12)%cols.length]);
    else{base.put(x,y-.05,z,yw);band.put(x,y+.6,z,yw);}
  }
  board.done();base.done();band.done();
};

/** concatenate geometries (already placed) into one */
function ulleviMergeGeos(list){
  const pos=[],nor=[],uv=[];
  for(const g0 of list){const g=g0.index?g0.toNonIndexed():g0;if(!g.attributes.normal)g.computeVertexNormals();
    pos.push(...g.attributes.position.array);nor.push(...g.attributes.normal.array);
    if(g.attributes.uv)uv.push(...g.attributes.uv.array);else for(let k=0;k<g.attributes.position.count;k++)uv.push(0,0);}
  const out=new THREE.BufferGeometry();
  out.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));
  out.setAttribute('normal',new THREE.Float32BufferAttribute(nor,3));
  out.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));
  return out;
}
/** a flat sign board with text */
function ulleviSign(text,bg,fg,w,h,pw,ph,px,border){
  return new THREE.Mesh(new THREE.PlaneGeometry(pw,ph),psMat({map:lerumSignTex(text,bg,fg,w,h,px,border),unlit:true,side:THREE.DoubleSide}));
}
/** soft round glow for the floodlights */
const ulleviGlowTex=()=>pixTex(32,32,c=>{
  const gr=c.createRadialGradient(16,16,1,16,16,16);gr.addColorStop(0,'rgba(255,252,236,1)');gr.addColorStop(.35,'rgba(255,244,210,.55)');gr.addColorStop(1,'rgba(255,240,200,0)');
  c.fillStyle=gr;c.fillRect(0,0,32,32);});
const ULLEVI={wave:null,waveL:[],flags:null,flagL:[],sayLap:-1,m4:new THREE.Matrix4(),q:new THREE.Quaternion(),e:new THREE.Euler(),v:new THREE.Vector3(),sc:new THREE.Vector3()};

function sceneryUllevi(){
  const RES=[];
  const res=(x,z,r)=>RES.push([x,z,r]);
  const free=(x,z,pad)=>{
    if(latAt(x,z)<HW+pad||ulleviInRing(x,z,pad))return false;
    for(const r of RES)if(Math.hypot(x-r[0],z-r[1])<r[2])return false;
    return true;
  };
  const at=(i,o)=>{const q=mainPt(i,o);q.y=meshY(q.x,q.z);return q;};
  const yawAt=i=>{i=((i%N)+N)%N;return Math.atan2(fx[i],fz[i]);};
  const H=(a,b)=>hash2(a*1.37+3.1,b*0.71-2.3);
  const M=ALTS.find(r=>r.id==='material'),B=ALTS.find(r=>r.id==='lakt');
  const grey=psMat({color:0x8a9096}),dark=psMat({color:0x26282e}),white=psMat({color:0xeeece6});
  const Y0=ULLEVI_Y0;
  for(const S_ of stations){const q=mainPt(S_.at+6,S_.side*(HW+13));res(q.x,q.z,22);}
  {const q=ulleviBallBase();res(q.x,q.z,26);}
  ULLEVI.flagL=[];ULLEVI.waveL=[];

  /* ── the stand ring ── */
  const NT=256,tw=Math.PI*2/NT;
  const tunnelAt=t=>{for(let s=-.04;s<=1.05;s+=.09){const [x,z]=ulleviRingPt(t,s);if(nearAltMain(x,z)<HW+2.6)return true;}return false;};
  const edgeT=[];for(let n=0;n<=NT;n++)edgeT.push(tunnelAt(-Math.PI+n*tw));
  const tun=[];for(let n=0;n<NT;n++)tun.push(edgeT[n]||edgeT[n+1]||tunnelAt(-Math.PI+(n+.5)*tw));
  const fans=t=>t>ULLEVI_FANS[0]&&t<ULLEVI_FANS[1];
  const sK=k=>k/ULLEVI_T*.88, hK=k=>2.2+k*2.2;
  {const pos=[],col=[],c=new THREE.Color();
    const P=(t,s,y)=>{const [x,z]=ulleviRingPt(t,s);return [x,Y0+y,z];};
    const quad=(a,b,cc,d,hex)=>{c.setHex(hex);for(const p of [a,b,cc,a,cc,d]){pos.push(p[0],p[1],p[2]);col.push(c.r,c.g,c.b);}};
    const Q=(ta,tb,s0,y0,s1,y1,hex)=>quad(P(ta,s0,y0),P(tb,s0,y0),P(tb,s1,y1),P(ta,s1,y1),hex);
    for(let n=0;n<NT;n++){
      const ta=-Math.PI+n*tw,tb=ta+tw,T=tun[n],tm=ta+tw/2;
      const lift=y=>T?Math.max(y,ULLEVI_TUN):y,yb=T?ULLEVI_TUN:-.5;
      const seat=k=>fans(tm)?(k%2?0x1f7a3a:0x1a1c20):(((n>>2)+k)%5===0?0xe8c21c:((n>>2)&1?0x2a58b0:0x24509c));
      if(lift(hK(0))>yb)Q(ta,tb,0,yb,0,lift(hK(0)),0x30343e);                 /* the padded front wall */
      for(let k=0;k<ULLEVI_T;k++){
        Q(ta,tb,sK(k),lift(hK(k)),sK(k+1),lift(hK(k)),seat(k));
        if(k<ULLEVI_T-1&&lift(hK(k+1))>lift(hK(k)))Q(ta,tb,sK(k+1),lift(hK(k)),sK(k+1),lift(hK(k+1)),0x7e8088);
      }
      Q(ta,tb,.88,hK(ULLEVI_T-1),1,hK(ULLEVI_T-1),0x6a6c74);                   /* the walkway at the back */
      Q(ta,tb,1,yb,1,21,(n&1)?0x8c8e96:0x84868e);                                /* the back wall, the façade */
      Q(ta,tb,1.001,16.5,1.001,18.6,0x2f62c8);                                   /* a blue band round the top */
      Q(ta,tb,.5,21,1.02,21,0x4a4e58);Q(ta,tb,.5,20.2,.5,21,0xd8dade);            /* the roof and its white lip */
      if(T)Q(ta,tb,0,ULLEVI_TUN,1,ULLEVI_TUN,0x2a2e36);                          /* the tunnel ceiling */
      if(T!==tun[(n+NT-1)%NT]){const p0=P(ta,0,-.5),p1=P(ta,1,-.5),p2=P(ta,1,ULLEVI_TUN),p3=P(ta,0,ULLEVI_TUN);quad(p0,p1,p2,p3,0x6e7078);}
    }
    const geo=new THREE.BufferGeometry();
    geo.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));
    geo.setAttribute('color',new THREE.Float32BufferAttribute(col,3));
    geo.setAttribute('uv',new THREE.Float32BufferAttribute(new Float32Array(pos.length/3*2),2));
    geo.computeVertexNormals();
    world.add(new THREE.Mesh(geo,psMat({vertexColors:true,side:THREE.DoubleSide})));
  }
  /* pillars up the façade, roof posts, and lights in the tunnels */
  {const pil=rosInst(flat(new THREE.BoxGeometry(1.4,22,1.4)).translate(0,11,0),psMat({color:0x9a9ca4}),NT);
    const post=rosInst(flat(new THREE.BoxGeometry(.5,1,.5)).translate(0,.5,0),psMat({color:0xd8dade}),NT);
    const tl=rosInst(flat(new THREE.BoxGeometry(2.4,.25,.6)),psMat({color:0xfff2c8,unlit:true}),NT*3);
    for(let n=0;n<NT;n+=2){const t=-Math.PI+n*tw,[x,z]=ulleviRingPt(t,1.03),yaw=Math.atan2(x/ULLEVI_OUT.a**2,z/ULLEVI_OUT.b**2);
      if(!tun[n])pil.put(x,Y0-.4,z,yaw);
      if(n%4===0&&!tun[n]){const [px,pz]=ulleviRingPt(t,.54),y=Y0+hK(4);post.put(px,y,pz,0,1,21-hK(4),1);}}
    for(let n=0;n<NT;n++)if(tun[n])for(const s of [.2,.5,.8]){const [x,z]=ulleviRingPt(-Math.PI+(n+.5)*tw,s);tl.put(x,Y0+ULLEVI_TUN-.2,z,0);}
    pil.done();post.done();tl.done();}

  /* ── the crowd: one box person per seat, the front two rows wave as the wave goes round ── */
  {const body=new THREE.BoxGeometry(.56,.72,.4).translate(0,.36,0),head=new THREE.BoxGeometry(.34,.34,.34).translate(0,.92,0);
    const pg=ulleviMergeGeos([flat(body),flat(head)]);
    const crowd=rosInst(pg,psMat({}),4200,true),wave=rosInst(pg,psMat({}),1400,true);
    const shirts=[0xd8322a,0x2f78d8,0xf4f2ec,0xe8c21c,0xf08a1c,0x3a3c44,0x8a4fd8,0xe86a9a,0x2aa8a0,0x1e2a48];
    for(let k=0;k<ULLEVI_T;k++){
      const s=(sK(k)+sK(k+1))/2+.004;
      for(let n=0;n<NT;n++){
        if(tun[n]&&hK(k)<ULLEVI_TUN)continue;
        const ta=-Math.PI+n*tw,[x0,z0]=ulleviRingPt(ta,s),[x1,z1]=ulleviRingPt(ta+tw,s),len=Math.hypot(x1-x0,z1-z0),m=Math.max(1,Math.round(len/1.7));
        for(let p=0;p<m;p++){
          const f=(p+.5)/m,t=ta+tw*f;if(H(n*7+p,k)<.1)continue;                  /* a few empty seats */
          const [x,z]=ulleviRingPt(t,s),yaw=Math.atan2(-x/ULLEVI_IN.a**2,-z/ULLEVI_IN.b**2);
          const fan=fans(t),c=fan?((n+p)%4<2?0x1f8a40:(k%3===2?0xf4f2ec:0x18191c)):shirts[Math.floor(H(n+p*3,k*5)*shirts.length)];
          const y=Y0+hK(k);
          if(k<2){wave.put(x,y,z,yaw,1,1,1,c);ULLEVI.waveL.push([x,y,z,yaw,t,fan?1:0]);}
          else crowd.put(x,y,z,yaw,1,1,1,c);
        }
      }
    }
    crowd.done();wave.done();ULLEVI.wave=wave;}

  /* ── the flags: green and black over the home section, saturated colours round the rim ── */
  {const fg=new THREE.PlaneGeometry(1.8,1.1).translate(.9,-.55,0);
    const flags=rosInst(fg,psMat({side:THREE.DoubleSide}),200,true);
    const pole=rosInst(flat(new THREE.CylinderGeometry(.05,.05,3.2,4)).translate(0,1.6,0),psMat({color:0xd8dade}),200);
    const add=(x,y,z,c,ph,h)=>{pole.put(x,y,z,0,1,h/3.2,1);flags.put(x,y+h,z,ph,1,1,1,c);ULLEVI.flagL.push([x,y+h,z,ph]);};
    for(let n=0;n<NT;n++){const tm=-Math.PI+(n+.5)*tw;if(!fans(tm))continue;      /* the home section: a forest of flags in the rows */
      for(const k of [1,3,5]){if((n+k)%2)continue;const [x,z]=ulleviRingPt(tm,(sK(k)+sK(k+1))/2);add(x,Y0+hK(k)+.6,z,(n+k)%4<2?0x1f8a40:0x18191c,n*.7+k,2.6);}}
    const rim=[0xe8c21c,0xd8322a,0x2f78d8,0xf4f2ec,0xf08a1c,0x8a4fd8];
    for(let n=0;n<NT;n+=6){const tm=-Math.PI+(n+.5)*tw;if(fans(tm))continue;const [x,z]=ulleviRingPt(tm,.95);
      add(x,Y0+21,z,rim[(n/6)%rim.length],n*.3,4);}
    flags.done();pole.done();ULLEVI.flags=flags;
    /* banners hung over the front wall of the home section: stripes, no names */
    const ban=psMat({map:pixTex(32,8,c=>{for(let x=0;x<32;x+=4){c.fillStyle=(x/4)%2?'#18191c':'#1f8a40';c.fillRect(x,0,4,8);}
      c.fillStyle='#f4f2ec';c.fillRect(0,0,32,1);c.fillRect(0,7,32,1);}),side:THREE.DoubleSide});
    const ban2=psMat({map:pixTex(32,8,c=>{c.fillStyle='#18191c';c.fillRect(0,0,32,8);c.fillStyle='#1f8a40';c.fillRect(0,2,32,4);
      c.fillStyle='#f4f2ec';for(let x=2;x<32;x+=6)c.fillRect(x,3,2,2);}),side:THREE.DoubleSide});
    for(let n=0;n<5;n++){const t=lerp(ULLEVI_FANS[0]+.04,ULLEVI_FANS[1]-.04,n/4),[x,z]=ulleviRingPt(t,-.004);
      const m=new THREE.Mesh(new THREE.PlaneGeometry(9,2.0),n%2?ban2:ban);m.position.set(x,Y0+1.25,z);
      m.rotation.y=Math.atan2(-x/ULLEVI_IN.a**2,-z/ULLEVI_IN.b**2);world.add(m);}
  }

  /* ── four floodlight masts at the corners, and the big screens at the ends ── */
  {const glow=psMat({map:ulleviGlowTex(),unlit:true,transparent:true,depthWrite:false,side:THREE.DoubleSide});
    const beam=psMat({color:0xdce6ff,unlit:true,transparent:true,opacity:.035,depthWrite:false,side:THREE.DoubleSide});
    for(const t of [-.62,.62,Math.PI-.62,-Math.PI+.62]){
      const [x,z]=ulleviRingPt(t,1.16),y=meshY(x,z),g=new THREE.Group();g.position.set(x,y,z);
      g.rotation.y=Math.atan2(-x,-z);world.add(g);res(x,z,8);
      hoorBox(g,2.6,1,2.6,grey,0,.5,0);
      const mast=hoorBox(g,1.3,48,1.3,psMat({color:0xa8acb4}),0,24,1.6);mast.rotation.x=.07;
      hoorBox(g,12,7.4,.8,dark,0,50,5.2);
      for(let r=0;r<3;r++)for(let c=0;c<5;c++)hoorBox(g,1.8,1.7,.3,psMat({color:0xfffbe8,unlit:true}),-4.4+c*2.2,47.6+r*2.4,5.75);
      hoorMerge(g);
      const gl=new THREE.Mesh(new THREE.PlaneGeometry(26,18),glow);gl.position.set(0,50,6.2);g.add(gl);
      /* a faint beam down onto the pitch */
      const top=new THREE.Vector3(),tgt=new THREE.Vector3(x*.25,Y0,z*.25);g.updateMatrixWorld(true);top.set(0,50,6).applyMatrix4(g.matrixWorld);
      const L=top.distanceTo(tgt),cone=new THREE.Mesh(new THREE.ConeGeometry(34,L,12,1,true),beam);
      cone.position.copy(top).add(tgt).multiplyScalar(.5);
      cone.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),top.clone().sub(tgt).normalize());world.add(cone);
    }
    /* the screens: the east one over the service tunnel, the west one over the hairpin */
    const screen=(t,draw)=>{const [x,z]=ulleviRingPt(t,.86),g=new THREE.Group();g.position.set(x,Y0+21,z);g.rotation.y=Math.atan2(-x,-z);world.add(g);
      hoorBox(g,36,15,1.2,dark,0,8.5,0);for(const sx_ of [-12,12])hoorBox(g,.8,6,.8,grey,sx_,-2,0);
      const p=new THREE.Mesh(new THREE.PlaneGeometry(34.4,13.4),psMat({map:pixTex(128,48,draw),unlit:true}));p.position.set(0,8.5,.62);g.add(p);};
    screen(0,c=>{c.fillStyle='#0c1020';c.fillRect(0,0,128,48);c.fillStyle='#f2c81c';c.font='8px "Press Start 2P",monospace';c.textAlign='center';c.textBaseline='middle';
      c.fillText('SISTA',64,14);c.fillText('VISSLAN',64,28);c.fillStyle='#1f8a40';c.fillRect(8,40,112,3);c.fillStyle='#f4f2ec';c.fillRect(8,40,12,3);});
    screen(Math.PI,c=>{c.fillStyle='#0c1020';c.fillRect(0,0,128,48);c.fillStyle='#f4f2ec';c.font='7px "Press Start 2P",monospace';c.textAlign='center';c.textBaseline='middle';
      c.fillText('GÄSTANDE LAG',64,12);c.fillText('OCH EN KO',52,27);
      const R=(col,x,y,w,h)=>{c.fillStyle=col;c.fillRect(x,y,w,h);};                 /* the cow, in pixels */
      R('#f2efe6',92,24,14,8);R('#22201e',96,24,4,4);R('#22201e',102,28,3,3);R('#f2efe6',104,21,6,5);R('#e0a0a0',107,24,4,2);
      for(const lx of [93,96,101,104])R('#f2efe6',lx,32,2,4);R('#22201e',106,20,1,2);
      c.fillStyle='rgba(255,255,255,.08)';for(let y=0;y<48;y+=2)c.fillRect(0,y,128,1);});
  }

  /* ── the tunnel portals: signs to read on the way through ── */
  {const mouth=(from)=>{for(let k=0;k<70;k++){const i=(from+k)%N;if(ulleviInRing(sx[i],sz[i],-2))return i;}return from;};
    const portal=(i,txt,bg,fg,back)=>{const ii=((i%N)+N)%N,q=at(ii,0),g=new THREE.Group();g.position.set(q.x,sy[ii],q.z);
      g.rotation.y=yawAt(ii)+Math.PI;world.add(g);
      const s=ulleviSign(txt,bg,fg,128,16,2*HW+1,1.4,8);s.position.set(0,ULLEVI_TUN+Y0-sy[ii]-.9,back?-.1:.1);if(back)s.rotation.y=Math.PI;g.add(s);};
    const m1=mouth(20),m2=mouth(530);
    portal(m1,'SERVICETUNNEL','#f2c81c','#1a1c20',false);
    portal(m2,'GÄSTERNAS INGÅNG','#1a1c20','#f4f2ec',false);}

  /* ── the finish: the start gantry dressed in steel and a chequered board, an event banner,
     the referee's chair, the podium on the infield ── */
  {const g=new THREE.Group();g.position.set(sx[0],sy[0],sz[0]);g.rotation.y=yawAt(0);world.add(g);
    const st=psMat({color:0x2a2c32});
    for(const sd of [-1,1])hoorBox(g,1.2,9.1,1.2,st,sd*(HW+2.6),4.5,0);
    hoorBox(g,(HW+3.1)*2+.2,2.1,1.25,st,0,9.3,0);
    const t=pixTex(160,20,c=>{for(let x=0;x<160;x+=4)for(let y=0;y<20;y+=4){c.fillStyle=((x+y)/4)%2?'#f4f2ec':'#1a1c20';c.fillRect(x,y,4,4);}
      c.fillStyle='#1a1c20';c.fillRect(44,2,72,16);c.fillStyle='#f2c81c';c.font='8px "Press Start 2P",monospace';c.textAlign='center';c.textBaseline='middle';c.fillText('MÅL',80,11);});
    for(const sd of [-1,1]){const b=new THREE.Mesh(new THREE.PlaneGeometry((HW+3.1)*2,1.9),psMat({map:t,unlit:true}));b.position.set(0,9.3,sd*.66);if(sd<0)b.rotation.y=Math.PI;g.add(b);}
    hoorMerge(g);}
  {const i=N-26,g=new THREE.Group();g.position.set(sx[i],sy[i],sz[i]);g.rotation.y=yawAt(i)+Math.PI;world.add(g);
    for(const sd of [-1,1])hoorBox(g,.5,8,.5,psMat({color:0x1a1c20}),sd*(HW+2.4),4,0);
    const b=new THREE.Mesh(new THREE.PlaneGeometry(2*HW+4,2.6),psMat({map:pixTex(192,32,c=>{
      c.fillStyle='#1a1c20';c.fillRect(0,0,192,32);c.fillStyle='#f2c81c';for(let x=0;x<192;x+=16){c.fillRect(x,0,8,3);c.fillRect(x+8,29,8,3);}
      c.fillStyle='#f4f2ec';c.font='9px "Press Start 2P",monospace';c.textAlign='center';c.textBaseline='middle';c.fillText('MOTORFESTIVALEN',96,17);}),unlit:true,side:THREE.DoubleSide}));
    b.position.set(0,7,0);g.add(b);hoorMerge(g);}
  {const q=at(10,HW+6.5),g=new THREE.Group();g.position.set(q.x,q.y,q.z);g.rotation.y=yawAt(10)-Math.PI/2;world.add(g);res(q.x,q.z,5);   /* Domaren's chair, facing the line */
    const blk=psMat({color:0x1a1c20});
    for(const [x,z] of [[-.9,-.9],[.9,-.9],[-.9,.9],[.9,.9]])hoorBox(g,.18,3.6,.18,blk,x,1.8,z);
    hoorBox(g,1.6,.18,1.6,white,0,3.6,0);hoorBox(g,1.6,1.2,.16,white,0,4.2,-.75);for(const sd of [-1,1])hoorBox(g,.12,.6,1.4,blk,sd*.78,4,0);
    for(let r=0;r<6;r++)hoorBox(g,1.2,.1,.12,blk,0,.5+r*.55,1.05);
    hoorBox(g,2.2,.12,2.2,psMat({color:0x1f8a40}),0,6.2,0);hoorBox(g,.1,1.4,.1,blk,0,5.5,-.9);
    const s=ulleviSign('DOMAREN','#1a1c20','#f4f2ec',48,12,1.5,.38,7);s.position.set(0,2.6,.95);g.add(s);hoorMerge(g);}
  {const q=at(36,HW+16),g=new THREE.Group();g.position.set(q.x,q.y,q.z);g.rotation.y=yawAt(36)+Math.PI;world.add(g);res(q.x,q.z,9);  /* the podium, waiting */
    hoorBox(g,3,2.2,3,white,0,1.1,0);hoorBox(g,3,1.6,3,white,-3,.8,0);hoorBox(g,3,1.1,3,white,3,.55,0);
    hoorBox(g,9.4,.06,4.4,psMat({color:0xc8321f}),0,.03,0);
    for(const [x,y,t] of [[0,1.4,'1'],[-3,1,'2'],[3,.7,'3']]){const s=ulleviSign(t,'#f4f2ec','#1a1c20',8,8,1,1,8);s.position.set(x,y,-1.52);s.rotation.y=Math.PI;g.add(s);}
    hoorBox(g,10,4,.3,psMat({color:0x1a1c20}),0,3.4,1.8);
    const s=ulleviSign('SISTA VISSLAN','#1a1c20','#f2c81c',112,14,9,1.1,8);s.position.set(0,4.4,1.6);s.rotation.y=Math.PI;g.add(s);
    hoorMerge(g);}
  /* tyre stacks round the infield of the event course */
  {const tyre=rosInst(flat(new THREE.CylinderGeometry(.6,.6,1.2,8)).translate(0,.6,0),psMat({}),300,true);
    for(let i=560;i<N+60;i+=7){const ii=i%N;for(const sd of [-1,1]){const q=at(ii,sd*(HW+5.2));
      if(!ulleviInArena(q.x*1.06,q.z*1.06)||!free(q.x,q.z,4.5)||nearAlt(q.x,q.z,4))continue;
      if(stations.some(S=>{let d=ii-S.at;if(d<-N/2)d+=N;else if(d>N/2)d-=N;return S.side===sd&&d>-6&&d<S.len+6;}))continue;
      tyre.put(q.x,q.y,q.z,0,1,1,1,(i/7)%2?0x1a1c20:0xd8322a);tyre.put(q.x,q.y+1.2,q.z,0,1,1,1,0x1a1c20);}}
    tyre.done();}

  /* ── the event paddock beside the inside fuel stop: tents, trailers ── */
  {const S=stations.find(s=>ulleviInArena(sx[s.at],sz[s.at]));
    if(S){const tentTop=rosInst(flat(new THREE.ConeGeometry(3.6,1.4,4)).rotateY(Math.PI/4).translate(0,.7,0),psMat({}),20,true);
      const leg=rosInst(flat(new THREE.BoxGeometry(.12,2.6,.12)).translate(0,1.3,0),grey,80);
      const trailer=rosInst(flat(new THREE.BoxGeometry(12,3.6,2.6)).translate(0,1.9,0),psMat({}),10,true);
      const cols=[0xd8322a,0x2f78d8,0xe8c21c,0x1f8a40,0xf4f2ec];
      for(let n=0;n<6;n++){const i=S.at-14+n*7,q=at(i,S.side*(HW+28));if(!ulleviInArena(q.x*1.05,q.z*1.05))continue;
        const yw=yawAt(i);tentTop.put(q.x,q.y+2.6,q.z,yw,1,1,1,cols[n%cols.length]);
        for(const [a,b] of [[-2.4,-2.4],[2.4,-2.4],[-2.4,2.4],[2.4,2.4]])leg.put(q.x+Math.cos(yw)*a+Math.sin(yw)*b,q.y,q.z-Math.sin(yw)*a+Math.cos(yw)*b,yw);}
      for(let n=0;n<3;n++){const i=S.at-30+n*30,q=at(i,S.side*(HW+35));if(!ulleviInArena(q.x*1.06,q.z*1.06))continue;trailer.put(q.x,q.y,q.z,yawAt(i),1,1,1,cols[(n+2)%cols.length]);}
      tentTop.done();leg.done();trailer.done();
      const q=at(S.at+S.len+4,S.side*(HW+4)),g=new THREE.Group();g.position.set(q.x,q.y,q.z);g.rotation.y=yawAt(S.at)+Math.PI;world.add(g);
      for(const x of [-1.3,1.3])hoorBox(g,.12,2.4,.12,grey,x,1.2,0);
      const s=ulleviSign('DEPÅ','#1f8a40','#f4f2ec',48,14,3,.9,8);s.position.set(0,2.7,0);g.add(s);}}

  /* ── outside: the service yard by the north fuel stop, the giant whistle, the TV trucks ── */
  {const S=stations.find(s=>!ulleviInArena(sx[s.at],sz[s.at]));
    const cont=rosInst(rosBoxUV(6,2.6,2.4,2,2.6),psMat({map:pixTex(16,16,c=>{c.fillStyle='#ffffff';c.fillRect(0,0,16,16);c.fillStyle='rgba(0,0,0,.2)';for(let x=0;x<16;x+=3)c.fillRect(x,0,1,16);})}),40,true);
    if(S)for(let n=0;n<8;n++){const i=S.at-10+n*5,q=at(i,S.side*(HW+30+(n%2)*3));
      const c=[0x2f62c8,0xd8322a,0x3a7a4a,0xe8a01c][n%4];cont.put(q.x,q.y-.1,q.z,yawAt(i),1,1,1,c);if(n%3===0)cont.put(q.x,q.y+2.5,q.z,yawAt(i)+.05,1,1,1,0x8a8c94);res(q.x,q.z,5);}
    for(const [i,o] of [[84,-24],[100,-22]]){const q=at(i,o);if(!free(q.x,q.z,3))continue;
      cont.put(q.x,q.y-.1,q.z,yawAt(i),1.6,1.4,1.1,0xf4f2ec);res(q.x,q.z,7);
      const d=new THREE.Mesh(flat(new THREE.CylinderGeometry(1.1,1.1,.2,10)),psMat({color:0xe0e2e6}));d.position.set(q.x,q.y+4.6,q.z);d.rotation.z=.6;world.add(d);}
    cont.done();
    /* Domaren's giant whistle on a pole */
    {const i=ULLEVI_WHISTLE,q=at(i,HW+16),g=new THREE.Group();g.position.set(q.x,q.y,q.z);g.rotation.y=yawAt(i)+Math.PI;g.scale.setScalar(1.8);world.add(g);res(q.x,q.z,10);
      const steel=psMat({color:0xc8ccd4});
      hoorBox(g,.5,7,.5,dark,0,3.5,0);
      const body=new THREE.Mesh(flat(new THREE.CylinderGeometry(1.4,1.4,2.6,12)).rotateX(Math.PI/2),steel);body.position.set(0,8.6,0);g.add(body);
      hoorBox(g,3.6,.9,1.3,steel,-2.6,9.2,0);hoorBox(g,.9,.5,1.2,dark,-4.5,9.2,0);
      const ring=new THREE.Mesh(flat(new THREE.TorusGeometry(.6,.14,4,10)),steel);ring.position.set(1.6,9.6,0);g.add(ring);
      hoorBox(g,.1,2.4,.1,psMat({color:0x1f8a40}),2.4,8.6,0);
      const s=ulleviSign('DOMARENS HÖRNA','#1a1c20','#f4f2ec',96,14,5,.8,8);s.position.set(0,5.6,.3);g.add(s);
      hoorMerge(g);}
  }

  /* ── the event ramp on the north forecourt: steel plates, flags, a landing box ── */
  {const J=JUMPS[0];
    if(J){const plate=new THREE.InstancedMesh(flat(new THREE.BoxGeometry(2*HW-1,.14,SEG*.9)),psMat({map:pixTex(32,8,c=>{
        c.fillStyle='#5a6470';c.fillRect(0,0,32,8);c.fillStyle='rgba(255,255,255,.18)';for(let x=1;x<32;x+=4)c.fillRect(x,3,2,1);
        for(let x=0;x<32;x+=4){c.fillStyle=(x/4)%2?'#1a1c20':'#f2c81c';c.fillRect(x,0,4,1);}})}),J.up+1),o=new THREE.Object3D();
      o.rotation.order='YXZ';
      for(let k=-J.up;k<=0;k++){const ii=(J.at+k+N)%N;o.position.set(sx[ii],sy[ii]+.08,sz[ii]);
        o.rotation.set(-Math.atan2(sy[(ii+1)%N]-sy[(ii-1+N)%N],2*SEG),yawAt(ii),0);o.updateMatrix();plate.setMatrixAt(k+J.up,o.matrix);}
      plate.frustumCulled=false;world.add(plate);
      /* the ramp's side skirts, striped, so it reads as a ramp from a distance */
      const skirt=rosInst(flat(new THREE.BoxGeometry(.2,1,SEG*1.02)),psMat({map:pixTex(8,8,c=>{for(let x=0;x<8;x+=2){c.fillStyle=(x/2)%2?'#1a1c20':'#f2c81c';c.fillRect(x,0,2,8);}})}),2*(J.up+1));
      const y0=sy[(J.at-J.up-1+N)%N];
      for(let k=-J.up;k<=0;k++){const ii=(J.at+k+N)%N,hh=sy[ii]-y0+.25;
        for(const sd of [-1,1]){const a=mainPt(ii,sd*(HW-.4));skirt.put(a.x,y0+hh/2-.05,a.z,yawAt(ii),1,hh,1);}}
      skirt.done();
      for(const sd of [-1,1]){const i=J.at-J.up-14,q=at(i,sd*(HW+2.8)),g=new THREE.Group();g.position.set(q.x,q.y,q.z);g.rotation.y=yawAt(i)+Math.PI;world.add(g);
        hoorBox(g,.12,2.4,.12,grey,0,1.2,0);
        const s=ulleviSign('EVENTRAMP','#f2c81c','#1a1c20',72,16,1.9,.5,7);s.position.set(0,2.5,0);g.add(s);}
      const paint=psMat({color:0xf4f2ec,unlit:true,transparent:true,opacity:.85,depthWrite:false});
      for(const k of [J.dn+4,J.dn+12]){const a=mainPt((J.at+k)%N,0);
        const m=new THREE.Mesh(new THREE.PlaneGeometry(2*HW-2.4,.5).rotateX(-Math.PI/2),paint);m.position.set(a.x,a.y+.06,a.z);m.rotation.y=a.yaw;world.add(m);}
      for(const l of [-1,1]){const a=mainPt((J.at+J.dn+8)%N,l*(HW-1.4));
        const m=new THREE.Mesh(new THREE.PlaneGeometry(.5,SEG*8).rotateX(-Math.PI/2),paint);m.position.set(a.x,a.y+.06,a.z);m.rotation.y=a.yaw;world.add(m);}
      const chk=psMat({map:pixTex(8,6,c=>{for(let x=0;x<8;x+=2)for(let y=0;y<6;y+=2){c.fillStyle=(x+y)%4?'#1a1c20':'#f4f2ec';c.fillRect(x,y,2,2);}}),side:THREE.DoubleSide});
      for(const sd of [-1,1]){const q=at(J.at,sd*(HW+1.8)),f=new THREE.Mesh(new THREE.PlaneGeometry(1.6,1.1),chk);
        f.position.set(q.x+q.rx*sd*.8,q.y+4,q.z+q.rz*sd*.8);f.rotation.y=q.yaw+Math.PI/2;world.add(f);
        const p=new THREE.Mesh(flat(new THREE.CylinderGeometry(.06,.06,4.6,4)),white);p.position.set(q.x,q.y+2.3,q.z);world.add(p);}}}

  /* ── Materialgången: flight cases wall to wall, a lighting truss overhead ── */
  if(M){
    const fc=rosInst(flat(new THREE.BoxGeometry(1.2,1.1,1.4)).translate(0,.55,0),psMat({map:pixTex(8,8,c=>{c.fillStyle='#ffffff';c.fillRect(0,0,8,8);
      c.fillStyle='#b8bcc4';c.fillRect(0,0,8,1);c.fillRect(0,7,8,1);c.fillRect(0,0,1,8);c.fillRect(7,0,1,8);c.fillStyle='#9a9ea6';c.fillRect(3,3,2,2);})}),700,true);
    const truss=rosInst(flat(new THREE.BoxGeometry(1,.5,.5)),psMat({color:0x9aa0a8}),M.n);
    const tpost=rosInst(flat(new THREE.BoxGeometry(.4,6,.4)).translate(0,3,0),psMat({color:0x9aa0a8}),M.n*2);
    const lamp=rosInst(flat(new THREE.BoxGeometry(.5,.4,.5)),psMat({color:0xfff2c8,unlit:true}),M.n*3);
    const cols=[0x2a2c32,0x1e2026,0x343840,0x2a2c32,0xc8321f];
    for(let j=COMMIT+1;j<M.n-MERGE;j++){
      const tight=j<COMMIT+8;
      for(const sd of [-1,1]){const q=lanePt(M,j/(M.n-1),sd*(M.hw+(tight?.75:1.2)));
        if(nearAltMain(q.x,q.z)<HW+1.2)continue;const y=meshY(q.x,q.z);
        fc.put(q.x,y,q.z,q.yaw+(H(j,sd)-.5)*.2,1,1,1,cols[Math.floor(H(j*3,sd)*cols.length)]);
        if(H(sd,j)>.35)fc.put(q.x,y+1.1,q.z,q.yaw+(H(j,sd*3)-.5)*.3,1,.9,1,cols[Math.floor(H(j,sd*5)*cols.length)]);
        res(q.x,q.z,3);}
      if(j%5===0&&j>COMMIT+3){const q=lanePt(M,j/(M.n-1),0),y=M.Y[j];
        truss.put(q.x,y+6,q.z,q.yaw+Math.PI/2,2*M.hw+4.4,1,1);
        for(const sd of [-1,1]){const p=lanePt(M,j/(M.n-1),sd*(M.hw+2.4));if(nearAltMain(p.x,p.z)>HW+1)tpost.put(p.x,meshY(p.x,p.z),p.z,q.yaw);}
        for(const l of [-1.4,0,1.4]){const p=lanePt(M,j/(M.n-1),l);lamp.put(p.x,y+5.6,p.z,q.yaw);}}
    }
    fc.done();truss.done();tpost.done();lamp.done();
    const cont=rosInst(rosBoxUV(6,2.6,2.4,2,2.6),psMat({map:pixTex(16,16,c=>{c.fillStyle='#ffffff';c.fillRect(0,0,16,16);c.fillStyle='rgba(0,0,0,.2)';for(let x=0;x<16;x+=3)c.fillRect(x,0,1,16);})}),40,true);
    for(let j=COMMIT+8;j<M.n-MERGE-4;j+=3)for(const sd of [-1,1]){const q=lanePt(M,j/(M.n-1),sd*(M.hw+4.6));
      if(nearAltMain(q.x,q.z)<HW+5||!free(q.x,q.z,-HW+1))continue;cont.put(q.x,meshY(q.x,q.z)-.1,q.z,q.yaw,1,1,1,[0x2f62c8,0xd8322a,0x8a8c94,0xe8a01c][(j+sd+4)%4]);res(q.x,q.z,4);}
    cont.done();
    const j=COMMIT+2,q=lanePt(M,j/(M.n-1),0),g=new THREE.Group();g.position.set(q.x,M.Y[j],q.z);g.rotation.y=q.yaw+Math.PI;world.add(g);
    for(const sd of [-1,1])hoorBox(g,.3,6,.3,dark,sd*(M.hw+1.6),3,0);
    const s=ulleviSign('MATERIALGÅNGEN','#f2c81c','#1a1c20',112,16,2*M.hw+3.4,1.1,7);s.position.set(0,6.1,0);g.add(s);
  }

  /* ── Bakom läktaren: a fence, lamps, the coffee stall halfway along ── */
  if(B){
    const fence=rosInst(flat(new THREE.BoxGeometry(.1,1.8,2.3)).translate(0,.9,0),psMat({map:pixTex(8,8,c=>{c.clearRect(0,0,8,8);
      c.fillStyle='#9aa0a8';for(let k=0;k<8;k+=2){c.fillRect(k,0,1,8);c.fillRect(0,k,8,1);}}),transparent:true,alphaTest:.5,side:THREE.DoubleSide}),B.n);
    const pole=rosInst(flat(new THREE.CylinderGeometry(.09,.12,6,4)).translate(0,3,0),dark,40),head=rosInst(flat(new THREE.BoxGeometry(.5,.25,1)),psMat({color:0xfff2c8,unlit:true}),40);
    for(let j=COMMIT+4;j<B.n-MERGE-2;j++){const q=lanePt(B,j/(B.n-1),B.hw+2.2);if(nearAltMain(q.x,q.z)<HW+3)continue;
      fence.put(q.x,meshY(q.x,q.z),q.z,q.yaw);res(q.x,q.z,2.5);
      if(j%8===0){pole.put(q.x,meshY(q.x,q.z),q.z,0);const h=lanePt(B,j/(B.n-1),B.hw+1.4);head.put(h.x,meshY(q.x,q.z)+6,h.z,q.yaw+Math.PI/2);}}
    fence.done();pole.done();head.done();
    {const q=lanePt(B,.5,B.hw+5.6),g=new THREE.Group();g.position.set(q.x,meshY(q.x,q.z),q.z);g.rotation.y=q.yaw-Math.PI/2;world.add(g);res(q.x,q.z,5);
      hoorBox(g,4.4,2.6,2.6,psMat({color:0x8a4a2a}),0,1.3,-.4);hoorBox(g,4.6,.14,3.4,psMat({color:0x1f8a40}),0,2.9,0);
      hoorBox(g,4.4,.9,.5,psMat({color:0xe8dcc4}),0,1,.95);
      for(let n=0;n<4;n++)hoorBox(g,.22,.3,.22,psMat({color:0xf4f2ec}),-1.2+n*.8,1.6,.95);
      const s=ulleviSign('KAFFE','#1f8a40','#f4f2ec',48,14,2.2,.6,8);s.position.set(0,3.4,.9);g.add(s);hoorMerge(g);}
    const j=COMMIT+2,q=lanePt(B,j/(B.n-1),0),g=new THREE.Group();g.position.set(q.x,B.Y[j],q.z);g.rotation.y=q.yaw+Math.PI;world.add(g);
    for(const sd of [-1,1])hoorBox(g,.3,6,.3,dark,sd*(B.hw+1.6),3,0);
    const s=ulleviSign('BAKOM LÄKTAREN','#2f62c8','#f4f2ec',112,16,2*B.hw+3.4,1.1,7);s.position.set(0,6.1,0);g.add(s);
  }

  /* ── the plaza: the sausage kiosk, benches ── */
  {const i=ULLEVI_KIOSK,q=at(i,HW+7.5),g=new THREE.Group();g.position.set(q.x,q.y,q.z);g.rotation.y=yawAt(i);world.add(g);res(q.x,q.z,7);
    hoorBox(g,5,2.8,3,psMat({color:0xf4f2ec}),0,1.4,1.2);hoorBox(g,5.4,.16,2.4,psMat({color:0xd8322a}),0,3,-.6);
    hoorBox(g,5,.9,.4,psMat({color:0xe8c21c}),0,1.1,-.35);
    const s=ulleviSign('HALVTIDSKORV','#d8322a','#f4f2ec',96,14,4.6,.7,8);s.position.set(0,3.6,-.4);g.add(s);
    const s2=ulleviSign('MED MOS 35:-','#f4f2ec','#1a1c20',96,14,3,.45,7);s2.position.set(0,2.2,-.58);g.add(s2);
    hoorMerge(g);}
  {const bench=rosInst(flat(new THREE.BoxGeometry(2.4,.5,.6)).translate(0,.25,0),psMat({color:0x7a5a3a}),30);
    const P=ulleviBallBase();for(let n=0;n<8;n++){const a=n/8*6.283,x=P.x+Math.cos(a)*24,z=P.z+Math.sin(a)*24;if(latAt(x,z)<HW+4)continue;bench.put(x,meshY(x,z),z,-a);}
    bench.done();}

  /* ── the forecourt: lamps, flags on poles along the road, trees, the city round about ── */
  {const pole=rosInst(flat(new THREE.CylinderGeometry(.12,.16,9,4)).translate(0,4.5,0),dark,N),head=rosInst(flat(new THREE.BoxGeometry(.6,.3,1.4)),psMat({color:0xfff6dc,unlit:true}),N);
    const fp=rosInst(flat(new THREE.CylinderGeometry(.07,.07,7,4)).translate(0,3.5,0),psMat({color:0xd8dade}),N);
    const ff=rosInst(new THREE.PlaneGeometry(1.2,3.4).translate(.6,-1.7,0),psMat({side:THREE.DoubleSide}),N,true);
    const fcol=[0xe8c21c,0xd8322a,0x2f78d8,0xf08a1c,0x8a4fd8,0x2aa8a0];
    for(let i=0;i<N;i+=9)for(const sd of [-1,1]){
      const q=at(i,sd*(HW+5.6));if(ulleviInArena(q.x,q.z)||ulleviInRing(q.x,q.z,4)||nearAlt(q.x,q.z,3)||!free(q.x,q.z,-HW+5))continue;
      if(stations.some(S=>{let d=i-S.at;if(d<-N/2)d+=N;else if(d>N/2)d-=N;return S.side===sd&&d>-6&&d<S.len+6;}))continue;
      if(((i/9)+(sd>0?1:0))%2){pole.put(q.x,q.y,q.z,0);head.put(q.x-sd*q.rx*.7,q.y+9,q.z-sd*q.rz*.7,q.yaw);}
      else{fp.put(q.x,q.y,q.z,0);ff.put(q.x,q.y+7,q.z,q.yaw+Math.PI/2,1,1,1,fcol[Math.floor(i/9)%fcol.length]);}}
    pole.done();head.done();fp.done();ff.done();
    const TN=150,trT=rosInst(flat(new THREE.CylinderGeometry(.16,.24,3.4,5)).translate(0,1.7,0),psMat({color:0x3a2e26}),TN);
    const trC=rosInst(flat(new THREE.IcosahedronGeometry(2.3,0)).translate(0,4.6,0),psMat({}),TN,true);
    for(let n=0,g2=0;n<TN&&g2<5000;g2++){const x=rand(-330,330),z=rand(-300,300);
      if(ulleviEll(x,z,{a:ULLEVI_OUT.a+14,b:ULLEVI_OUT.b+14})<1||!free(x,z,6))continue;const y=meshY(x,z);
      trT.put(x,y,z,0);trC.put(x,y,z,rand(0,3),rand(.8,1.2),rand(.9,1.2),rand(.8,1.2),[0x2e4a3a,0x355440,0x2a4234][n%3]);res(x,z,3);n++;}
    trT.done();trC.done();
    /* the city: blocks of brick and plaster with lit windows, all round */
    const tex=['#8a4a3a','#b89a6a','#a8a49c','#7a5a4a','#c8b48a'].map(c=>borasFacadeTex(c,c==='#8a4a3a'||c==='#7a5a4a')),lists=tex.map(()=>[]);
    const rf=rosInst(flat(new THREE.BoxGeometry(1,.5,1)).translate(0,.25,0),psMat({color:0x3a3c44}),400);
    for(let gx=-420;gx<=420;gx+=32)for(let gz=-420;gz<=420;gz+=30){
      const x=gx+H(gx,gz)*8,z=gz+H(gz,gx)*8;if(Math.hypot(x/1.45,z)<175)continue;
      const L=Math.round((14+H(gz,gx*2)*10)/4)*4,D=12+Math.round(H(gx*2,gz)*8),Ht=Math.round((10+H(gx,gz*3)*16)/3.4)*3.4,yw=H(gx*3,gz)>.5?0:Math.PI/2;
      const c=Math.cos(yw),s=Math.sin(yw);let ok=true;
      for(const [lx,lz] of [[-L/2,-D/2],[L/2,-D/2],[-L/2,D/2],[L/2,D/2],[0,0]]){const wx=x+c*lx+s*lz,wz=z-s*lx+c*lz;if(!free(wx,wz,10)||nearAlt(wx,wz,8)){ok=false;break;}}
      if(!ok)continue;
      const k=Math.floor(H(gz*5,gx)*tex.length),y=meshY(x,z)-.2;lists[k].push([x,y,z,yw,L,D,Ht]);rf.put(x,y+Ht,z,yw,L+.4,1,D+.4);res(x,z,Math.max(L,D)/2+2);}
    lists.forEach((l,k)=>{if(l.length)world.add(new THREE.Mesh(borasMergeBoxes(l),psMat({map:tex[k]})));});
    rf.done();}
}

/* ───── Ullevi hazards: the mascot's ball on the plaza; the crowd, the flags, the speaker ───── */
/** Domaren's whistle: two short trills */
function ulleviWhistle(vol){
  if(!actx)return;
  const t=actx.currentTime;
  for(const [st,len] of [[0,.16],[.22,.32]]){
    const o=actx.createOscillator(),lfo=actx.createOscillator(),lg=actx.createGain(),g=actx.createGain();
    o.type='sine';o.frequency.value=2900;lfo.frequency.value=34;lg.gain.value=160;lfo.connect(lg);lg.connect(o.frequency);
    g.gain.setValueAtTime(.0001,t+st);g.gain.exponentialRampToValueAtTime(.07*(vol||1),t+st+.02);g.gain.setValueAtTime(.07*(vol||1),t+st+len-.03);g.gain.exponentialRampToValueAtTime(.0001,t+st+len);
    o.connect(g);g.connect(audioOutput());o.start(t+st);lfo.start(t+st);o.stop(t+st+len+.02);lfo.stop(t+st+len+.02);
  }
}
/** a rubbery boing as the ball lands */
function ulleviBoing(vol){
  if(!actx)return;
  const t=actx.currentTime,o=actx.createOscillator(),g=actx.createGain();
  o.type='triangle';o.frequency.setValueAtTime(110,t);o.frequency.exponentialRampToValueAtTime(260,t+.08);o.frequency.exponentialRampToValueAtTime(90,t+.3);
  g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(.12*(vol||1),t+.02);g.gain.exponentialRampToValueAtTime(.0001,t+.34);
  o.connect(g);g.connect(audioOutput());o.start(t);o.stop(t+.36);
}
function hazardsUllevi(H){
  vastPA();ULLEVI.sayLap=-1;
  /* maskotbollen: the mascot points and whistles, the landing shadow appears, and the ball
     hops in from the plaza onto the inside half of the road and back. The outside half is
     always clear. Same hops, same spots, every time. */
  {const i=ULLEVI_BALL.i,L=ULLEVI_BALL.lats,R=2.3,PER=7.5,T0=.26,T1=.94,hops=L.length-1;
    const pt=l=>{const q=mainPt(i,l);q.y=Math.abs(l)<HW+1?q.y:meshY(q.x,q.z);return q;};
    const ball=new THREE.Mesh(flat(new THREE.IcosahedronGeometry(R,1)),psMat({map:pixTex(16,16,c=>{
      c.fillStyle='#f2c81c';c.fillRect(0,0,16,16);c.fillStyle='#2f62c8';c.fillRect(0,0,8,8);c.fillRect(8,8,8,8);
      c.fillStyle='#f4f2ec';c.fillRect(7,0,2,16);c.fillRect(0,7,16,2);})}));world.add(ball);
    const shadow=new THREE.Mesh(new THREE.CircleGeometry(1,16).rotateX(-Math.PI/2),psMat({color:0x0a0c14,transparent:true,opacity:.5,depthWrite:false}));world.add(shadow);
    const ringM=psMat({color:0xf2c81c,unlit:true,transparent:true,opacity:.9,depthWrite:false});
    const ring=new THREE.Mesh(new THREE.RingGeometry(.86,1,20).rotateX(-Math.PI/2),ringM);world.add(ring);
    /* the mascot: a round furry thing in festival colours, one arm out to point */
    const P=pt(ULLEVI_BALL.home-5),mg=new THREE.Group();mg.position.set(P.x,P.y,P.z);
    mg.rotation.y=Math.atan2(rx[i],rz[i]);mg.scale.setScalar(1.6);world.add(mg);                  /* facing the road */
    const fur=psMat({color:0x2f62c8}),yel=psMat({color:0xf2c81c});
    const bod=new THREE.Mesh(flat(new THREE.IcosahedronGeometry(1.3,1)),fur);bod.position.y=2;mg.add(bod);
    for(const sd of [-1,1]){hoorBox(mg,.5,1,.5,yel,sd*.5,.5,0);
      const eye=new THREE.Mesh(flat(new THREE.SphereGeometry(.32,6,4)),psMat({color:0xf4f2ec}));eye.position.set(sd*.45,2.5,1.05);mg.add(eye);
      const pu=new THREE.Mesh(flat(new THREE.SphereGeometry(.14,5,3)),psMat({color:0x1a1c20}));pu.position.set(sd*.45,2.5,1.34);mg.add(pu);}
    hoorBox(mg,.9,.24,.4,yel,0,1.9,1.2);
    const arm=new THREE.Group();arm.position.set(1.2,2.2,0);mg.add(arm);hoorBox(arm,.36,.36,1.9,fur,0,0,.9);hoorBox(arm,.42,.42,.42,yel,0,0,1.9);
    const arm2=hoorBox(mg,.36,1.4,.36,fur,-1.3,1.6,0);arm2.rotation.z=-.4;
    let tick=0,lastHop=-1;
    H.push({id:'maskotboll',period:PER,phase:1.5,mesh:ball,
      update(u,dt){
        const warn=u>=.1&&u<T0,live=u>=T0&&u<T1,v=clamp((u-T0)/(T1-T0),0,1),n=Math.min(hops-1,Math.floor(v*hops)),t=v*hops-n;
        let l=L[0],h=0,next=L[1];
        if(live){l=lerp(L[n],L[n+1],t);h=Math.sin(Math.PI*t)*5;next=L[n+1];}
        const q=pt(l);ball.position.set(q.x,q.y+R+h+(u<T0?Math.abs(Math.sin(clock*3))*.3:0),q.z);
        ball.rotation.set(0,q.yaw,live?-v*hops*2.4:0);
        /* the landing shadow: where it comes down next, darker as it falls */
        const s=pt(next),show=warn||live;
        shadow.visible=ring.visible=show;
        if(show){const k=live?clamp(1-h/5,0,1):.5;shadow.position.set(s.x,s.y+.06,s.z);shadow.scale.setScalar(R*(.6+.5*k));
          shadow.material.uniforms.uOpacity.value=.25+.4*k;ring.position.set(s.x,s.y+.08,s.z);ring.scale.setScalar(R+.6);
          ringM.uniforms.uOpacity.value=.5+.4*Math.abs(Math.sin(clock*8));}
        /* the mascot points at the spot, waves the other arm */
        arm.rotation.x=show?-.15+Math.sin(clock*10)*.08:1.2;arm2.rotation.x=Math.sin(clock*4)*.5;
        mg.position.y=P.y+(warn?Math.abs(Math.sin(clock*9))*.25:0);
        const near=player&&Math.hypot(player.x-P.x,player.z-P.z)<120&&state==='race';
        tick-=dt||0;if(near&&warn&&tick<=0){tick=1;ulleviWhistle(.8);}
        if(live&&n!==lastHop){if(near&&lastHop>=0)ulleviBoing(.7);lastHop=n;}
        if(!live)lastHop=-1;
        this.p={x:ball.position.x,y:q.y,z:ball.position.z};this.low=live&&h<2.4;
      },
      hit(k){if(k.rib||k.air||!this.low||(typeof TT!=='undefined'&&TT))return false;      /* time trial: the ball is only for show */const dx=k.x-this.p.x,dz=k.z-this.p.z;return dx*dx+dz*dz<(R+1.1)*(R+1.1)&&Math.abs(k.y-this.p.y)<2.6;},
      effect(k){
        k.slow=Math.max(k.slow,.5);k.vx*=.8;k.vz*=.8;k.spun=Math.max(k.spun,.45*k.spinResist);k.boost=0;k.drift=0;k.charge=0;
        for(let p=0;p<14;p++){const c=[[.95,.78,.1],[.18,.38,.78],[.95,.95,.92]][p%3];puff(k.x+rand(-1.4,1.4),k.y+rand(.4,2),k.z+rand(-1.4,1.4),c[0],c[1],c[2],.8);}
        if(k===player){toast('MASKOTBOLLEN!');ulleviBoing(1.3);shake=Math.min(1,shake+.3);}
      }});
  }
  /* the crowd: the wave goes round, the home section bounces, the flags flap; the speaker */
  H.push({id:'ulleviPublik',period:1,phase:0,
    update(u,dt){
      if(stage.id!=='ullevi')return;
      const S=ULLEVI,m=S.m4,qq=S.q,e=S.e,v=S.v,sc=S.sc.set(1,1,1);
      const W=S.wave;
      if(W){const ph=clock*.55;
        for(let n=0;n<S.waveL.length;n++){const [x,y,z,yw,t,fan]=S.waveL[n];
          const c=Math.cos(t-ph),lift=c>0?Math.pow(c,14):0,bob=fan?Math.max(0,Math.sin(clock*7+n*1.3))*.35:0;
          e.set(0,yw,0);qq.setFromEuler(e);v.set(x,y+lift+bob,z);m.compose(v,qq,sc);W.setMatrixAt(n,m);}
        W.instanceMatrix.needsUpdate=true;}
      const F=S.flags;
      if(F){for(let n=0;n<S.flagL.length;n++){const [x,y,z,p]=S.flagL[n];
          e.set(0,p+Math.sin(clock*2.6+p)*.6,Math.sin(clock*5+p*2)*.08);qq.setFromEuler(e);v.set(x,y,z);m.compose(v,qq,sc);F.setMatrixAt(n,m);}
        F.instanceMatrix.needsUpdate=true;}
      /* the speaker, once a lap, on the long run inside the arena */
      if(state==='race'&&player&&!player.rib&&player.si>=600&&player.si<640&&S.sayLap!==player.lap){
        S.sayLap=player.lap;
        vastPA(player.lap>=LAPS?'Sista varvet! Domaren har visslan i munnen. Publiken ombeds att inte mata förarna med spettekaka.':
          player.lap===2?'Halvtid i finalen. Korven är slut i kiosk C, men det finns mos.':
          'Publiken ombeds att inte mata förarna med spettekaka.');
      }
    }});
}

/** the stage's postcard, for the picnic passport: the field on a stadium podium under the
    floodlights, confetti everywhere, and one piece of it shaped like a cow and far too big.
    Drawn on a 192 x 120 canvas, shown pixelated. */
function ulleviPostcard(g,w,h){
  const R=(c,x,y,a,b)=>{g.fillStyle=c;g.fillRect(x,y,a,b);};
  const sky=g.createLinearGradient(0,0,0,64);sky.addColorStop(0,'#0e1a48');sky.addColorStop(1,'#8a90c8');
  g.fillStyle=sky;g.fillRect(0,0,w,64);
  /* the stands, in rows of tiny people, and the green-and-black end */
  for(let r=0;r<6;r++){R(r%2?'#2a58b0':'#24509c',0,34+r*5,w,5);
    for(let x=(r*3)%5;x<w;x+=4){const fan=x>118&&x<168;R(fan?((x>>2)%2?'#1f8a40':'#18191c'):['#d8322a','#f4f2ec','#e8c21c','#2f78d8','#f08a1c'][(x*7+r)%5],x,33+r*5,2,2);}}
  R('#4a4e58',0,30,w,3);
  /* the floodlights */
  for(const x of [18,174]){R('#a8acb4',x,6,2,26);R('#1a1c20',x-6,2,14,7);for(let c=0;c<4;c++)R('#fffbe8',x-5+c*3,3,2,2);for(let c=0;c<4;c++)R('#fffbe8',x-5+c*3,6,2,2);}
  R('#a4523a',0,64,w,10);R('#3e8a3e',0,74,w,46);for(let x=0;x<w;x+=16)R('#4a9a48',x,74,8,46);
  /* the podium */
  R('#eeece6',70,82,30,30);R('#eeece6',40,90,30,22);R('#eeece6',100,96,30,16);R('#c8321f',36,110,98,3);
  g.fillStyle='#1a1c20';g.font='8px monospace';g.textAlign='center';g.fillText('1',85,100);g.fillText('2',55,104);g.fillText('3',115,108);
  /* the field: drivers with their arms up */
  const D=(x,y,c)=>{R(c,x,y,8,9);R('#e8bc98',x+2,y-5,4,4);R('#22242a',x+2,y-6,4,2);R(c,x-2,y-3,2,4);R(c,x+8,y-3,2,4);};
  D(81,73,'#1a1c20');D(51,81,'#2f62c8');D(111,87,'#f2c81c');D(26,98,'#6e1f2c');D(142,100,'#3f8a3a');
  R('#f4f2ec',82,66,6,1);R('#1a1c20',84,62,2,4);                                                    /* the winner's whistle */
  /* confetti, all the same size... */
  const cc=['#f2c81c','#d8322a','#2f78d8','#f4f2ec','#1f8a40','#e86a9a'];
  for(let n=0;n<90;n++)R(cc[n%cc.length],(n*41)%w,6+(n*23)%74,2,1+(n%2));
  /* ...except one: a black-and-white cow, far too big, tumbling down */
  g.save();g.translate(140,40);g.rotate(-.35);
  R('#f2efe6',-11,-5,22,11);R('#22201e',-6,-5,6,5);R('#22201e',4,0,5,5);R('#f2efe6',10,-9,8,8);R('#e0a0a0',15,-5,4,3);R('#22201e',12,-10,1,2);R('#22201e',16,-10,1,2);
  for(const lx of [-10,-5,3,8])R('#f2efe6',lx,6,2,5);R('#22201e',-13,-4,2,5);
  g.restore();
  /* the stamp corner and the greeting */
  R('#f4efe2',156,92,30,22);R('#2a58b0',158,94,26,18);R('#1f8a40',161,98,9,10);R('#18191c',170,98,9,10);R('#f4f2ec',168,96,2,14);
  g.fillStyle='#fff';g.font='bold 11px "Titillium Web",sans-serif';g.textAlign='left';g.fillText('Hälsningar från Ullevi!',6,14);
  g.lineWidth=2;g.strokeStyle='#fff';g.strokeRect(1,1,w-2,h-2);
}
