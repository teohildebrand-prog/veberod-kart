"use strict";
/* ───────── Rosengård ───────── */
/* Mehmet's home track, not a LEGO Racers counterpart: from the Rosengård blocks in Malmö, over the railway
   and round the market square at Möllevångstorget, on a golden summer evening */
GROUND.rosengard={cell:26,stripe:0.9,verge:0x9c978d,
  cols:[0x6fa04a,0x7caf52,0x64963f,0x86b55a,0xb3ad9f,0x72a24c,0x7aa850,0xc4bba8]};
/* konstgräs: grippy, but the rubber crumb drags at the tyres */
SURF.turf={top:o=>o+(1-o)*0.62,grip:o=>1-0.12*(1-o),fuel:1.1,name:'KONSTGRÄS'};
SFX.turf={dust:[.40,.62,.32],noise:{f:1250,g:.013}};
EDGES.rosengard=st=>edgeRosengard(st);

STAGES.push({ id:'rosengard', group:'skane', name:'ROSENGÅRD', sub:'MALMÖ',
  order:19, tag:'Kvarteren runt Rosengård centrum, under järnvägsbron och förbi fotbollsburen.',
  view:{r:'bur',f:0,lat:0,h:9,to:{r:'bur',f:0.5,h:0},fov:55},
  hw:8.8,
  bars:[0.75,0.65,0.45], laps:3,
  blurb:'Mehmet\'s home turf on a golden summer evening: wide Malmö streets between the big blocks with their colourful balconies, round the roundabout, over the railway and out to the market square at Möllan. Cut through the football cage and over the park on slow, grippy turf, and watch for footballs flying out of the cage and delivery mopeds on the zebra crossing.',
  role:'Mehmets hemmabana: breda gator, en fotbollsbur att gena genom och torghandel på Möllan.',
  sky:[0xffcf94,0x4a8fd8], fog:[0xf0d2a8,100,430], amb:0x76707a, dif:0xffdcae,
  road:'asphalt', verge:'kerb', edge:'rosengard', ground:'rosengard', terrain:{size:860,seg:96},
  jumpSpec:[{h:3.6,drop:2.6,up:12,dn:7,rec:18},{h:2.6,drop:1.8,up:10,dn:6,rec:14}],
  ctrl:[[ -30,2,-152],[  60,2,-154],[ 150,2,-148],[ 206,3,-118],[ 228,4, -60],[ 222,4,   0],
        [ 238,4,  60],[ 222,3, 122],[ 172,2, 156],[ 110,2, 160],[  30,1, 164],[ -60,1, 166],
        [-140,1, 170],[-200,1, 152],[-222,1, 110],[-196,2,  74],[-140,2,  66],[-102,2,  36],
        [ -90,2, -14],[ -82,2, -52],[-100,2, -92],[ -96,2,-128],[ -70,2,-148]],
  /* Malmö is flat: iron out the countryside rolls, and dig the railway cutting and the cycle underpass */
  mod:(x,z,t)=>modRosengard(x,z,t),
  land:(x,z,out)=>landRosengard(x,z,out),
  stations:[[0.13,-1],[0.47,-1]],
  routes:[
    {id:'bur',name:'FOTBOLLSBUREN',a:196,b:318,hw:4.2,side:1,lead:9,leadLat:10,
     mid:[[0.38,8],[0.7,8]],surface:'turf',risk:0.3,
     blurb:'In through the gate of the football cage, over the halfway line and out across the park strip between two blocks. Shorter, but the turf is slow.'}],
  stamps:[
    {id:'ros1',dish:'Ma\'amoul',ini:'M',kind:'route',route:'bur',f:0.36,lat:0,
     hint:'På mittpunkten inne i fotbollsburen.',
     story:'Mehmet\'s mum bakes ma\'amoul the way her mother did in Aleppo: buttery semolina shells pressed in a carved wooden mould and filled with dates, pistachio or walnut, then dusted with icing sugar. A tin of them comes to every one of his matches, and the whole team knows it.'},
    {id:'ros2',dish:'Gözleme',ini:'G',kind:'intro',route:'main',i:168,lat:6.2,
     hint:'Vid marknadsstånden på torget i Rosengård.',
     story:'At the stalls on the square a woman rolls the dough paper thin, folds it round spinach, feta and spring onion and cooks it on a domed griddle until it blisters. Gözleme is torn in half, wrapped in paper and eaten standing up, with a squeeze of lemon.'},
    {id:'ros3',dish:'Baklava',ini:'B',kind:'line',route:'main',i:'tight',lat:'inside',
     hint:'Tätt intill torget på Möllan, i den tvära kurvan.',
     story:'The bakeries round Möllevångstorget stack baklava in their windows by the tray: paper-thin filo, butter and chopped pistachio, soaked in syrup and cut into diamonds. Buy a box as the market packs up for the evening and share it on the steps by the statue.'}],
  hazards:H=>hazardsRosengard(H), scenery:()=>sceneryRosengard()
});

/* the places on the lap, worked out once per build from the sampled road */
let rosK=null;
function rosL(){
  const key=sx[7]+'/'+sz[7]+'/'+JUMPS.map(J=>J.at).join(',')+'/'+ALTS.length+'/'+HW;
  if(rosK&&rosK.key===key)return rosK;
  const K={key},dR=(x,z)=>{const i=nearestGlobal(x,z);return Math.hypot(x-sx[i],z-sz[i]);};
  /* Möllevångstorget: the open ground inside the hairpin */
  let best=-1;K.mx=-160;K.mz=118;
  for(let x=-200;x<=-150;x+=3)for(let z=90;z<=150;z+=3){const d=dR(x,z);if(d>best){best=d;K.mx=x;K.mz=z;}}
  K.mr=Math.max(16,best-HW-8);
  /* the southern ramp crosses the railway, the other one a cycle underpass */
  const Js=JUMPS.slice().sort((a,b)=>sz[b.at]-sz[a.at]);
  const cut=(J,half,depth,l0,l1,fade)=>{const i=J.at,b=((J.at-J.up-4)%N+N)%N;
    return {J,i,x:sx[i],z:sz[i],fx:fx[i],fz:fz[i],rx:rx[i],rz:rz[i],half,depth,l0,l1,fade,floor:sy[b]-depth};};
  K.cuts=[];
  if(Js[0])K.cuts.push(K.rail=cut(Js[0],6.5,4.4,-230,74,6));
  if(Js[1])K.cuts.push(K.tun=cut(Js[1],3.2,2.8,-70,64,26));
  /* the roundabout sits inside the north-east corner */
  let bi=112,bv=0;for(let i=90;i<160;i++)if(Math.abs(scurv[i])>bv){bv=Math.abs(scurv[i]);bi=i;}
  K.ri=bi;
  /* the zebra crossing on the way into Möllan: the straightest sample after the railway landing */
  let mi=452,mv=9;for(let i=440;i<466;i++)if(Math.abs(scurv[i])<mv){mv=Math.abs(scurv[i]);mi=i;}
  K.mi=mi;
  const R=ALTS.find(r=>r.id==='bur');
  if(R){K.cf=0.36;const j=Math.round(K.cf*(R.n-1));K.cj=j;K.cx=R.X[j];K.cz=R.Z[j];K.cy=R.Y[j];
    K.cyaw=Math.atan2(R.FX[j],R.FZ[j]);}
  /* Rosengård centrum's square, inside the long eastern sweep */
  const q=mainPt(168,HW+38);K.sqx=q.x;K.sqz=q.z;K.sqr=18;
  rosK=K;return K;
}
/** which cutting (x,z) lies in, with a 0..1 weight */
function rosCutAt(x,z){
  const K=rosL();
  for(const C of K.cuts){
    const dx=x-C.x,dz=z-C.z,d=dx*C.fx+dz*C.fz,l=dx*C.rx+dz*C.rz;
    if(Math.abs(d)>C.half+6||l<C.l0-C.fade||l>C.l1+C.fade)continue;
    const w=(1-smooth(C.half,C.half+6,Math.abs(d)))*smooth(C.l0-C.fade,C.l0,l)*(1-smooth(C.l1,C.l1+C.fade,l));
    if(w>0)return {C,w,d,l};
  }
  return null;
}
function modRosengard(x,z,t){
  let h=-rolls(x,z)*t*0.92;
  const c=rosCutAt(x,z);
  if(c){
    const i=nearestGlobal(x,z),lat=Math.abs((x-sx[i])*rx[i]+(z-sz[i])*rz[i]);
    const w=c.w*smooth(HW+3.6,HW+8.5,lat);
    if(w>0)h+=w*(c.C.floor-sy[i]);
  }
  return h;
}
function landRosengard(x,z,out){
  const K=rosL();
  const c=rosCutAt(x,z);
  if(c&&c.w>0.45){out.setHex(c.C===K.rail?0x7a6e62:0xb25a48);return;}     /* ballast, red cycle path */
  if(Math.hypot(x-K.mx,z-K.mz)<K.mr+3){out.setHex(((Math.floor(x/6)+Math.floor(z/6))&1)?0xcdc3b0:0xbdb3a0);return;}
  if(Math.hypot(x-K.sqx,z-K.sqz)<K.sqr+6){out.setHex(((Math.floor(x/6)+Math.floor(z/6))&1)?0xc9c2b4:0xb7b0a2);return;}
  const i=nearestGlobal(x,z),v=Math.abs((x-sx[i])*rx[i]+(z-sz[i])*rz[i]);
  if(v>HW+3&&v<HW+8){out.setHex(0xb4aea2);return;}                             /* the pavement */
  if(v>HW+10&&latAt(x,z)<v-1)out.setHex(hash2(Math.floor(x/9),Math.floor(z/9))>0.5?0x6fa04a:0x7aa850);  /* park round the lane */
}
/** pumps, worked out the same way buildStations will place them */
function rosStations(st){
  return (st.stations||[]).map(sp=>{let at=Math.round(N*sp[0]);
    for(const J of JUMPS)if(Math.min(Math.abs(at-J.at),N-Math.abs(at-J.at))<J.up+J.dn+16)at=(at+46)%N;
    return [((at%N)+N)%N,sp[1]];});
}
function rosNearPump(i,side,pad){
  for(const [at,sd] of rosStations(stage)){
    let d=((i-at)%N+N)%N;if(d>N/2)d-=N;
    if(sd===side&&d>=-pad&&d<=12+pad)return true;
  }
  return false;
}
/** an instanced mesh with a put() that takes position, yaw, scale and colour */
function rosInst(geo,mat,max,colored){
  const m=new THREE.InstancedMesh(geo,mat,max);m.frustumCulled=false;
  const m4=new THREE.Matrix4(),q=new THREE.Quaternion(),e=new THREE.Euler(),p=new THREE.Vector3(),s=new THREE.Vector3(),c=new THREE.Color();
  let n=0;
  m.put=(x,y,z,yaw,a,b,d,col,pitch,roll)=>{
    if(n>=max)return;
    e.set(pitch||0,yaw||0,roll||0);q.setFromEuler(e);p.set(x,y,z);
    s.set(a==null?1:a,b==null?(a==null?1:a):b,d==null?(a==null?1:a):d);
    m4.compose(p,q,s);m.setMatrixAt(n,m4);
    if(colored){c.setHex(col==null?0xffffff:col);m.setColorAt(n,c);}
    n++;
  };
  m.done=()=>{m.count=n;m.instanceMatrix.needsUpdate=true;if(m.instanceColor)m.instanceColor.needsUpdate=true;world.add(m);};
  return m;
}
/** a box from the ground up whose sides tile one window bay per (bay x floor) metres; flat roof */
function rosBoxUV(L,H,D,bay,fl){
  const g=new THREE.BoxGeometry(L,H,D);g.translate(0,H/2,0);
  const uv=g.attributes.uv,dims=[[D,H],[D,H],null,null,[L,H],[L,H]];
  for(let f=0;f<6;f++)for(let v=0;v<4;v++){const k=f*4+v;
    if(!dims[f]){uv.setXY(k,.03,.03);continue;}
    uv.setXY(k,uv.getX(k)*Math.max(1,Math.round(dims[f][0]/bay)),uv.getY(k)*Math.max(1,Math.round(dims[f][1]/fl)));}
  return flat(g);
}
function rosWinTex(tall){
  const t=pixTex(16,16,g=>{
    g.fillStyle='#ffffff';g.fillRect(0,0,16,16);
    g.fillStyle='#d8d4cc';g.fillRect(0,15,16,1);
    if(tall){g.fillStyle='#f4f0e8';g.fillRect(5,2,6,11);g.fillStyle='#4a5866';g.fillRect(6,3,4,9);
      g.fillStyle='#f4f0e8';g.fillRect(6,6,4,1);g.fillStyle='#c8c0b0';g.fillRect(4,13,8,1);}
    else{g.fillStyle='#f4f2ee';g.fillRect(3,5,10,6);g.fillStyle='#4a5a68';g.fillRect(4,6,8,4);
      g.fillStyle='#f4f2ee';g.fillRect(8,6,1,4);}
    g.fillStyle='rgba(255,236,200,.45)';g.fillRect(tall?6:4,tall?3:6,2,2);
  });
  t.wrapS=t.wrapT=THREE.RepeatWrapping;return t;
}
/** a triangular roof prism, 1 x 1 x 1, ridge along x, base at y=0 */
function rosPrism(){
  const v=[-.5,0,-.5, -.5,0,.5, -.5,1,0,   .5,0,-.5, .5,1,0, .5,0,.5,
           -.5,0,-.5, -.5,1,0, .5,1,0,     -.5,0,-.5, .5,1,0, .5,0,-.5,
           -.5,0,.5, .5,0,.5, .5,1,0,      -.5,0,.5, .5,1,0, -.5,1,0];
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(v,3));
  g.setAttribute('uv',new THREE.Float32BufferAttribute(new Array(36).fill(0),2));
  g.computeVertexNormals();return g;
}
/** community mosaics for the gable ends of the blocks */
function rosMural(kind){
  return pixTex(64,64,g=>{
    const R=(a,b)=>a+Math.random()*(b-a);
    if(kind===0){                                      /* the sun over the Sound, with birds */
      for(let y=0;y<40;y++){g.fillStyle='rgb('+(250-y*2)+','+(190+y)+','+(120+y*3)+')';g.fillRect(0,y,64,1);}
      g.fillStyle='#f4a020';g.beginPath();g.arc(32,30,12,0,6.283);g.fill();
      g.fillStyle='#f6d040';g.beginPath();g.arc(32,30,8,0,6.283);g.fill();
      for(let k=0;k<12;k++){const a=k/12*6.283;g.fillStyle='#f08a20';g.fillRect(32+Math.cos(a)*16-1,30+Math.sin(a)*16-1,3,3);}
      g.fillStyle='#2f78b8';g.fillRect(0,40,64,24);
      g.fillStyle='#5fa8d8';for(let y=43;y<64;y+=5)for(let x=(y%2)*4;x<64;x+=8)g.fillRect(x,y,5,2);
      g.fillStyle='#2a2a30';for(const [x,y] of [[12,12],[18,8],[48,10],[54,15]]){g.fillRect(x,y,3,1);g.fillRect(x+3,y-1,3,1);}
    }else if(kind===1){                                /* a kid volleying a ball, under a star */
      g.fillStyle='#3f9a58';g.fillRect(0,0,64,64);
      g.fillStyle='#57b26c';for(let y=0;y<64;y+=8)g.fillRect(0,y,64,4);
      g.fillStyle='#f2cf3a';g.beginPath();for(let k=0;k<10;k++){const a=k/10*6.283-1.57,r=k%2?4:9;g.lineTo(50+Math.cos(a)*r,13+Math.sin(a)*r);}g.fill();
      g.fillStyle='#d8442c';g.fillRect(22,22,10,14);                      /* shirt */
      g.fillStyle='#8a5a3a';g.fillRect(24,14,7,7);g.fillRect(16,23,6,3);g.fillRect(32,24,7,3);
      g.fillStyle='#1d2a4a';g.fillRect(22,36,10,6);
      g.fillStyle='#8a5a3a';g.fillRect(22,42,4,12);g.save();g.translate(30,40);g.rotate(-0.9);g.fillRect(0,0,4,13);g.restore();
      g.fillStyle='#f4f4f0';g.beginPath();g.arc(46,40,5,0,6.283);g.fill();
      g.fillStyle='#222';g.fillRect(45,38,2,2);g.fillRect(43,41,2,2);g.fillRect(48,42,2,1);
    }else{                                             /* jasmine and many-coloured hands */
      g.fillStyle='#2fa7a0';g.fillRect(0,0,64,64);
      const C=['#d8442c','#f0a020','#f2cf3a','#8b4fa0','#2f78b8','#f4f4f0','#e86a9a'];
      for(let k=0;k<14;k++){const x=R(4,56),y=R(4,56);g.fillStyle=C[k%C.length];
        g.fillRect(x,y,6,7);for(let f=0;f<4;f++)g.fillRect(x+f*1.6,y-4,1.2,4);g.fillRect(x-2,y+2,2,3);}
      for(let k=0;k<10;k++){const x=R(4,60),y=R(4,60);g.fillStyle='#ffffff';
        for(let p=0;p<5;p++){const a=p/5*6.283;g.fillRect(x+Math.cos(a)*2.5-1,y+Math.sin(a)*2.5-1,2,2);}
        g.fillStyle='#f2cf3a';g.fillRect(x-.5,y-.5,1.5,1.5);}
    }
    g.fillStyle='rgba(0,0,0,.18)';                     /* the grout between the tiles */
    for(let k=0;k<64;k+=4){g.fillRect(k,0,1,64);g.fillRect(0,k,64,1);}
  });
}
function rosTextTex(w,h,bg,fg,text,px){
  return pixTex(w,h,g=>{g.fillStyle=bg;g.fillRect(0,0,w,h);g.fillStyle=fg;
    g.font=(px||8)+'px "Press Start 2P",monospace';g.textAlign='center';g.textBaseline='middle';g.fillText(text,w/2,h/2+1);});
}
function rosStripeTex(col){
  return pixTex(16,8,g=>{for(let k=0;k<4;k++){g.fillStyle=k%2?'#f4f0e6':col;g.fillRect(k*4,0,4,8);}
    g.fillStyle='rgba(0,0,0,.2)';g.fillRect(0,7,16,1);});
}
