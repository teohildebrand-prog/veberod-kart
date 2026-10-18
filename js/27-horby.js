"use strict";
/* ───────── Hörby ───────── */
/* Sju lass svin: market day in Hörby, out over the gravel to the agricultural fair, where seven
   trailers of pigs have arrived and someone forgot to shut the gates. Not a LEGO Racers counterpart. */
/* the main road changes underfoot: cobbles in town, packed gravel to the fair, soft mud between the trailers */
SURF.horbyGrus={top:o=>o+(1-o)*0.8,grip:o=>1-0.30*(1-o),fuel:1.05,name:'GRUS'};
SURF.horbyGyttja={top:o=>o+(1-o)*0.62,grip:o=>1-0.50*(1-o),fuel:1.2,name:'GYTTJA'};
SFX.horbyGrus=SFX.gravel;SFX.horbyGyttja=SFX.mud;
ROADTEX.horbyGrus=()=>pixTex(64,64,g=>{
  g.fillStyle='#a49378';g.fillRect(0,0,64,64);
  for(let i=0;i<900;i++){g.fillStyle=Math.random()>.5?'rgba(206,192,160,.55)':'rgba(104,90,68,.5)';
    g.fillRect((Math.random()*64)|0,(Math.random()*64)|0,1,1);}
  g.fillStyle='rgba(120,102,78,.4)';for(const x of [12,19,43,50])g.fillRect(x,0,3,64);
});
ROADTEX.horbyGyttja=()=>pixTex(64,64,g=>{
  g.fillStyle='#5e4a34';g.fillRect(0,0,64,64);
  for(let i=0;i<500;i++){g.fillStyle=Math.random()>.5?'rgba(120,96,66,.55)':'rgba(46,34,22,.6)';
    g.fillRect((Math.random()*64)|0,(Math.random()*64)|0,2,1);}
  g.fillStyle='rgba(150,160,170,.35)';for(let i=0;i<5;i++)g.fillRect((Math.random()*56)|0,(Math.random()*60)|0,8,3);  /* puddles */
  g.fillStyle='rgba(40,28,18,.55)';for(const x of [13,20,42,49])g.fillRect(x,0,3,64);
});
/* the edge: wooden fence out in the country, nothing but the kerb in town */
EDGES.horby=st=>{
  const step=6,cnt=Math.ceil(N/step)*2,wood=psMat({color:0x6b5540});
  const posts=rosInst(flat(new THREE.BoxGeometry(.22,1.6,.22)),wood,cnt),rails=rosInst(flat(new THREE.BoxGeometry(.1,.2,1)),psMat({color:0x8a7259}),cnt*2);
  for(let i=0;i<N;i+=step)for(const side of [-1,1]){
    const o=side*(HW+4.3),x=sx[i]+rx[i]*o,z=sz[i]+rz[i]*o;
    if(horbyTown(x,z)>0.3||nearAlt(x,z,2.6)||HORBY_TRAILERS.some(([t,sd])=>sd===side&&Math.abs(t-i)<7))continue;
    if(stations.some(S=>{let d=i-S.at;if(d<-N/2)d+=N;else if(d>N/2)d-=N;return S.side===side&&d>-4&&d<S.len+4;}))continue;
    const y=meshY(x,z),yw=Math.atan2(fx[i],fz[i]);posts.put(x,y+.75,z,yw);
    const j=(i+3)%N,x2=sx[j]+rx[j]*o,z2=sz[j]+rz[j]*o,y2=meshY(x2,z2);
    for(const h of [.55,1.15])rails.put(x2,y2+h,z2,Math.atan2(fx[j],fz[j]),1,1,SEG*step+.3);
  }
  posts.done();rails.done();
};
STAGES.push({ id:'horby', group:'skane', name:'HÖRBY', sub:'SJU LASS SVIN',
  order:20, tag:'Marknadsdag i Hörby. Tre varv, sju lass svin och alldeles för få stängda grindar. Sladda genom torget, ta sats över gyttjan och håll utkik efter korsande knorrar.',
  view:{i:344,lat:2,h:2.6,to:{i:354,lat:-4,h:1.4},fov:60,t:3.4},
  hw:8.4,
  bars:[0.70,0.70,0.80], laps:3,
  blurb:'Hörby on market day: two tight corners round the square, out through the brick arch and onto the gravel to the agricultural fair, where seven trailers of pigs have arrived and the gates are open. Slide through the mud between the trailers, jump the pig pen and come back down past the silo. Pigs cross the road in little groups: leave a gap or wear the straw.',
  role:'Torgkurvor, grus och gyttja, och grisar som korsar vägen i små flockar.',
  sky:[0xe8eef0,0x4f8fd6], fog:[0xd4dce0,80,380], amb:0x66707c, dif:0xfff0d6,
  road:'asphalt', verge:'gravel', edge:'horby', ground:'fields', paint:false,
  /* by hand: the big loading ramp over the pig pen first (the cinnamon bun hangs over it), then two small ones */
  jumpSpec:[{at:478,h:4.6,drop:3.2,up:14,dn:8,rec:20},{at:284,h:2.4,drop:1.6,up:10,dn:6,rec:14},
            {at:446,h:2.2,drop:1.5,up:10,dn:6,rec:14}],
  zones:[[690,150,'cobble'],[180,292,'horbyGrus'],[292,304,'horbyGyttja'],[304,452,'horbyGrus'],
         [452,464,'horbyGyttja'],[464,482,'horbyGrus'],[482,496,'horbyGyttja'],[496,506,'horbyGrus']],
  ctrl:[[ -90,2,-150],[ -40,2,-152],[  10,2,-151],[  48,2,-150],[  70,2,-147],[  86,2,-136],
        [  92,2,-115],[  86,2, -93],[  70,2, -82],[  46,2, -80],[  10,2, -80],[ -26,2, -78],
        [ -52,3, -66],[ -66,5, -40],[ -64,7,  -6],[ -48,9,  26],[ -16,11, 48],[  28,13, 62],
        [  70,15, 70],[ 112,16, 84],[ 150,16,102],[ 174,16,128],[ 176,16,158],[ 150,16,180],
        [ 110,16,172],[  70,16,188],[  30,16,176],[ -10,16,184],[ -50,16,182],[ -96,15,176],
        [-136,12,152],[-162,9, 112],[-176,6,  62],[-180,4,  12],[-178,3, -40],[-166,2, -98],[-138,2,-138]],
  /* the town is flat: iron the countryside rolls out of the streets and the square */
  mod:(x,z,t)=>-rolls(x,z)*t*horbyTown(x,z),
  land:(x,z,out)=>landHorby(x,z,out),
  stations:[[0.24,1],[0.85,-1]],
  routes:[
    {id:'korv',name:'BAKOM KORVKIOSKEN',a:62,b:134,hw:3.4,side:1,lead:8,leadLat:9,
     mid:[[0.3,5],[0.68,-5]],surface:'cobble',risk:0.45,
     blurb:'A narrow service yard behind the market stalls, past the sausage kiosk. Tight in, crates stacked either side.'},
    {id:'svin',name:'SVINSTIGEN',a:312,b:408,hw:4.0,side:1,lead:9,leadLat:10,
     mid:[[0.3,-6],[0.7,6]],surface:'dirt',mud:[[0.14,0.84]],risk:0.6,
     blurb:'The dirt track along the pig enclosure, under the INGEN GENOMFART sign. Shorter, but the mud is deep.'}],
  stamps:[
    {id:'hor1',dish:'Äggamacka',ini:'Ä',kind:'intro',route:'main',i:96,lat:-6.4,
     hint:'Vid picknickbordet i ytterkurvan runt torget.',
     story:'Market morning in Hörby starts with an äggamacka: a thick slice of rye bread, butter, sliced boiled egg and a curl of pickled herring or a few anchovies, with chives from somebody\'s window box. Eaten at the picnic table by the square, before the stalls are even up.'},
    {id:'hor2',dish:'Äppelmust',ini:'Ä',kind:'route',route:'svin',f:0.9,lat:0,
     hint:'På Svinstigen, strax efter gyttjan.',
     story:'Every autumn the farms round Hörby press their windfall apples into must: cloudy, sweet and a bit sharp, bottled without a bubble in it. A crate of bottles stands at the end of the pig enclosure for whoever made it through the mud.'},
    {id:'hor3',dish:'Kanelbulle',ini:'K',kind:'air',route:'main',jump:0,after:5,lat:0,air:4.6,
     hint:'Högt över det stora lastbryggehoppet.',
     story:'The bakery on the square sells kanelbullar by the bag on market day: soft cardamom dough rolled up with butter, sugar and cinnamon, topped with pearl sugar. One of them has ended up hanging over the pig pen, and nobody can say how.'}],
  hazards:H=>hazardsHorby(H), scenery:()=>sceneryHorby()
});

/* the seven trailers: [main-road sample, side, colour]; the pigs cross at #3 and #5 */
const HORBY_TRAILERS=[[300,-1,0xe8402c],[330,-1,0xf08a1c],[352,-1,0xf2c81c],[394,-1,0x3fa04a],
                      [428,-1,0x2f78d8],[414,1,0x8b4fb5],[462,1,0xe86a9a]];
const HORBY_CROSS=[{t:2,period:13,phase:3},{t:4,period:15,phase:10}];
/** 1 in the streets of Hörby, fading to 0 at the edge of town */
function horbyTown(x,z){return (1-smooth(-62,-40,z))*smooth(-150,-128,x)*(1-smooth(110,130,x));}
/** the market square: the open ground inside the hairpin, west of the service yard */
const HORBY_SQ={x:2,z:-114,hx:24,hz:16};
const horbyInSq=(x,z,pad)=>Math.abs(x-HORBY_SQ.x)<HORBY_SQ.hx+(pad||0)&&Math.abs(z-HORBY_SQ.z)<HORBY_SQ.hz+(pad||0);
function landHorby(x,z,out){
  const w=horbyTown(x,z);
  if(horbyInSq(x,z,2)){out.setHex(((Math.floor(x/4)+Math.floor(z/4))&1)?0x9a8f84:0x8a8076);return;}   /* cobbled square */
  if(w>0.6){const v=latAt(x,z);
    if(v>HW+2&&v<HW+6){out.setHex(0xa8a299);return;}                                      /* pavement */
    out.setHex(hash2(Math.floor(x/8),Math.floor(z/8))>0.5?0x7c7468:0x857c70);return;}           /* yards and lanes */
}
/** brick façade, one window bay per tile; tall shop windows on the ground floor when shop */
function horbyBrickTex(col,shop){
  const t=pixTex(16,16,g=>{
    g.fillStyle=col;g.fillRect(0,0,16,16);
    g.fillStyle='rgba(0,0,0,.16)';for(let y=1;y<16;y+=3)g.fillRect(0,y,16,1);
    for(let y=0;y<16;y+=3)for(let x=(y%6?0:2);x<16;x+=4)g.fillRect(x,y,1,3);
    g.fillStyle='#efe8dc';
    if(shop){g.fillRect(2,4,12,11);g.fillStyle='#4a5866';g.fillRect(3,5,10,9);g.fillStyle='rgba(255,236,200,.4)';g.fillRect(3,5,4,3);}
    else{g.fillRect(4,3,8,9);g.fillStyle='#4a5866';g.fillRect(5,4,6,7);g.fillStyle='#efe8dc';g.fillRect(7,4,1,7);g.fillRect(5,7,6,1);}
  });
  t.wrapS=t.wrapT=THREE.RepeatWrapping;return t;
}
/** a low-poly pig, nose along +z, feet at y=0: square snout, triangle ears, a tiny curly tail */
function horbyPig(col){
  const g=new THREE.Group(),pk=psMat({color:col||0xf2a6b4}),dk=psMat({color:0xd8808f}),eye=psMat({color:0x1e1a1a});
  hoorBox(g,1.0,.82,1.5,pk,0,.78,0);hoorBox(g,.74,.66,.6,pk,0,.98,.95);
  hoorBox(g,.44,.32,.16,dk,0,.88,1.32);
  for(const sg of [-1,1]){
    hoorBox(g,.08,.08,.08,eye,sg*.18,1.08,1.26);hoorBox(g,.07,.1,.04,eye,sg*.09,.88,1.41);
    const ear=new THREE.Mesh(flat(new THREE.ConeGeometry(.16,.3,3)),dk);ear.position.set(sg*.24,1.38,.9);ear.rotation.z=sg*.5;g.add(ear);
  }
  for(const [x,z] of [[-.32,.5],[.32,.5],[-.32,-.5],[.32,-.5]])hoorBox(g,.22,.42,.22,pk,x,.21,z);
  const tail=new THREE.Mesh(flat(new THREE.TorusGeometry(.12,.04,3,6)),dk);tail.position.set(0,.98,-.8);g.add(tail);
  return g;
}
/** a homemade cloth banner: hand-painted letters, a little uneven */
function horbyBannerTex(text,w,h){
  return pixTex(w,h,g=>{
    g.fillStyle='#f4efe2';g.fillRect(0,0,w,h);
    g.fillStyle='rgba(120,100,70,.18)';for(let i=0;i<40;i++)g.fillRect((Math.random()*w)|0,(Math.random()*h)|0,3,1);
    g.font='8px "Press Start 2P",monospace';g.textBaseline='middle';
    const chars=[...text],cw=(w-8)/chars.length;
    chars.forEach((c,n)=>{g.fillStyle=n%2?'#2f7a3a':'#c8321f';g.fillText(c,4+n*cw,h/2+1+((n*7)%3)-1);});
  });
}
/** trailer side: bright planks with gaps, pink backs packed in behind them, a big number */
function horbyTrailerTex(col,num){
  const c='#'+col.toString(16).padStart(6,'0');
  return pixTex(64,32,g=>{
    g.fillStyle=c;g.fillRect(0,0,64,32);
    for(let y=6;y<28;y+=7){g.fillStyle='#2a2222';g.fillRect(2,y,60,3);
      for(let x=4;x<60;x+=9){g.fillStyle=Math.random()>.3?'#f2a6b4':'#d8808f';g.fillRect(x+((y*3)%5),y,6,3);}}
    g.fillStyle='rgba(0,0,0,.25)';g.fillRect(0,0,64,2);g.fillRect(0,30,64,2);
    g.fillStyle='#ffffff';g.beginPath();g.arc(52,16,9,0,6.283);g.fill();
    g.fillStyle=c;g.font='12px "Press Start 2P",monospace';g.textAlign='center';g.textBaseline='middle';g.fillText(String(num),52,17);
  });
}
function sceneryHorby(){
  const RES=[];
  const res=(x,z,r)=>RES.push([x,z,r]);
  const free=(x,z,pad)=>{
    if(latAt(x,z)<HW+pad||horbyInSq(x,z,4))return false;
    for(const r of RES)if(Math.hypot(x-r[0],z-r[1])<r[2])return false;
    return true;
  };
  const at=(i,o)=>{const q=mainPt(i,o);q.y=meshY(q.x,q.z);return q;};
  const yawAt=i=>{i=((i%N)+N)%N;return Math.atan2(fx[i],fz[i]);};
  const H=(a,b)=>hash2(a*1.37+3.1,b*0.71-2.3);
  const K=ALTS.find(r=>r.id==='korv'),S=ALTS.find(r=>r.id==='svin');
  /* ── reserve the set pieces ── */
  {const q=mainPt(0,HW+20);res(q.x,q.z,30);}
  for(const S_ of stations){const q=mainPt(S_.at+6,S_.side*(HW+13));res(q.x,q.z,22);}
  for(const [i,sd] of HORBY_TRAILERS){const q=mainPt(i,sd*(HW+9));res(q.x,q.z,11);}
  {const q=mainPt(150,0);res(q.x,q.z,HW+6);}                                  /* the brick arch */
  {const q=mainPt(545,-(HW+14));res(q.x,q.z,10);}                             /* the feed silo */
  {const J=JUMPS[0];if(J){const q=mainPt(J.at+10,0);res(q.x,q.z,HW+16);}}     /* the pig pen */

  /* ── Hörby: brick houses close along the streets, shops on the ground floor ── */
  const bricks=[0xa34a32,0x8e3e2c,0xb55a3a,0x9a5a44,0xc0704e];
  const L=12,D=10;
  const facM=bricks.map(c=>rosInst(rosBoxUV(L,7.2,D,3,2.4),psMat({map:horbyBrickTex('#'+c.toString(16))}),60));
  const shopM=rosInst(rosBoxUV(L,3,D+.1,4,3),psMat({map:horbyBrickTex('#8a3a28',true)}),120);
  const roof=rosInst(rosPrism(),psMat({side:THREE.DoubleSide}),160,true);
  const awn=rosInst(flat(new THREE.BoxGeometry(1,.16,1.8)),psMat({}),200,true);
  const town=[];for(let i=688;i!==156;i=(i+1)%N)town.push(i);
  let last={'-1':-99,'1':-99};
  town.forEach((i,n)=>{
    for(const sd of [-1,1]){
      if(n-last[sd]<7)continue;
      const o=sd*(HW+5.5+D/2),q=at(i,o),yw=yawAt(i);
      let ok=true;
      for(const [lx,lz] of [[-L/2,-D/2],[L/2,-D/2],[-L/2,D/2],[L/2,D/2],[0,0]]){
        const x=q.x+fx[i]*lx+rx[i]*lz,z=q.z+fz[i]*lx+rz[i]*lz;
        if(!free(x,z,4.5)||nearAlt(x,z,4)){ok=false;break;}
      }
      if(!ok)continue;
      last[sd]=n;
      const k=Math.floor(H(i,sd)*bricks.length),fl=Math.round(H(sd,i)*1.0);
      const hgt=7.2+fl*2.4;
      facM[k].put(q.x,q.y+3-.2,q.z,yw+Math.PI/2,1,hgt/7.2,1);
      shopM.put(q.x,q.y-.2,q.z,yw+Math.PI/2);
      roof.put(q.x,q.y+3+hgt-.2,q.z,yw+Math.PI/2,L+.6,3.2,D+.8,H(i,7)>.5?0x5a3a30:0x3b3f44);
      if(H(i,sd*3)>.45)awn.put(q.x-rx[i]*sd*(D/2+.8),q.y+2.9,q.z-rz[i]*sd*(D/2+.8),yw+Math.PI/2,L*.8,1,1,[0xc8321f,0x2f7a3a,0x2f78b8,0xf2c81c][Math.floor(H(i,9)*4)]);
    }
  });
  [...facM,shopM,roof,awn].forEach(m=>m.done());

  /* ── the market square: striped stalls, produce crates, a bakery stall and the picnic tables ── */
  const stall=new THREE.Group();world.add(stall);
  const crate=rosInst(flat(new THREE.BoxGeometry(.7,.42,.5)),psMat({color:0x9a7448}),600);
  const fruit=rosInst(flat(new THREE.BoxGeometry(.6,.14,.42)),psMat({}),600,true);
  const pole=psMat({color:0xe8e4dc}),tbl=psMat({color:0x8a6a46});
  const stripes=['#c8321f','#2f7a3a','#2f78b8','#e8a020'].map(c=>psMat({map:rosStripeTex(c),side:THREE.DoubleSide}));
  const produce=[0xd8442c,0xf2a020,0x5aa03a,0xe8d040,0x8b4fa0,0xc87a3a];
  const sy0=meshY(HORBY_SQ.x,HORBY_SQ.z);
  for(let r=0;r<3;r++)for(let c=0;c<4;c++){
    const x=HORBY_SQ.x-15+c*10,z=HORBY_SQ.z-9+r*9,y=meshY(x,z);
    if(H(r,c)<.15)continue;
    const g=new THREE.Group();g.position.set(x,y,z);g.rotation.y=(r%2)*Math.PI;stall.add(g);
    hoorBox(g,4,.12,2,tbl,0,.9,0);
    for(const [px,pz] of [[-1.9,-.9],[1.9,-.9],[-1.9,.9],[1.9,.9]])hoorBox(g,.1,2.6,.1,pole,px,1.3,pz);
    const top=new THREE.Mesh(new THREE.PlaneGeometry(4.4,2.6),stripes[(r+c)%4]);top.rotation.x=-Math.PI/2+.25;top.position.set(0,2.7,0);g.add(top);
    for(let n=0;n<4;n++){const cx=x+(n-1.5)*.95*(r%2?-1:1),cz=z+(r%2?-.3:.3);
      crate.put(cx,y+1.17,cz,0);fruit.put(cx,y+1.43,cz,0,1,1,1,produce[Math.floor(H(r*4+c,n)*produce.length)]);}
    for(let n=0;n<3;n++)crate.put(x+rand(-2,2),y+.21+(n%2)*.42,z+(r%2?1.6:-1.6),rand(0,1));
  }
  hoorMerge(stall);
  /* picnic tables on the outside of the hairpin, where the egg sandwich waits */
  for(const [i,o] of [[90,-(HW+5)],[100,-(HW+5.5)],[110,-(HW+5)]]){
    const q=at(i,o),g=new THREE.Group();g.position.set(q.x,q.y,q.z);g.rotation.y=yawAt(i);world.add(g);
    hoorBox(g,1.0,.12,2.4,tbl,0,.82,0);for(const s of [-1,1])hoorBox(g,.4,.1,2.4,tbl,s*.85,.48,0);
    for(const s of [-1,1])hoorBox(g,1.9,.1,.12,tbl,0,.4,s*1.0);
    hoorMerge(g);
  }
  /* the bakery on the square, with a giant bun on the roof */
  {const x=HORBY_SQ.x-HORBY_SQ.hx+4,z=HORBY_SQ.z+HORBY_SQ.hz+5,y=meshY(x,z);
    const h=house(9,7,4,0xd8c4a0,0x8a3a28,2.6);h.position.set(x,y,z);world.add(h);
    const bun=new THREE.Mesh(flat(new THREE.TorusGeometry(1.1,.6,4,8)),psMat({color:0xc8843a}));
    bun.rotation.x=-Math.PI/2;bun.position.set(0,7.2,0);h.add(bun);
    const sg=new THREE.Mesh(new THREE.PlaneGeometry(4.2,1.0),psMat({map:rosTextTex(64,16,'#2f7a3a','#f4efe2','BAGERI'),unlit:true,side:THREE.DoubleSide}));
    sg.position.set(0,3.4,-3.6);h.add(sg);hoorMerge(h);}

  /* ── Bakom korvkiosken: the kiosk, then crates stacked either side of the yard ── */
  if(K){
    const ky=Math.round(K.n*.46),kp=lanePt(K,ky/(K.n-1),-(K.hw+3.2));
    const kg=new THREE.Group();kg.position.set(kp.x,meshY(kp.x,kp.z),kp.z);kg.rotation.y=kp.yaw;world.add(kg);
    hoorBox(kg,3.2,2.6,2.4,psMat({color:0xf2c81c}),0,1.3,0);hoorBox(kg,3.6,.25,2.8,psMat({color:0xc8321f}),0,2.75,0);
    const sausage=new THREE.Mesh(flat(new THREE.CylinderGeometry(.35,.35,2.6,6)),psMat({color:0xb8502c}));
    sausage.rotation.z=Math.PI/2;sausage.position.set(0,3.3,0);kg.add(sausage);
    const sg=new THREE.Mesh(new THREE.PlaneGeometry(3,.8),psMat({map:rosTextTex(64,16,'#c8321f','#f4efe2','KORV'),unlit:true,side:THREE.DoubleSide}));
    sg.position.set(0,2.0,1.25);kg.add(sg);hoorMerge(kg);
    const cr=rosInst(flat(new THREE.BoxGeometry(.9,.6,.9)),psMat({color:0x8a6a46}),400);
    for(let j=COMMIT+2;j<K.n-MERGE+2;j++)for(const sd of [-1,1]){
      if(Math.abs(j-ky)<3&&sd<0)continue;
      const tight=j<COMMIT+6;                                    /* the entrance: crates right up to the line */
      const q=lanePt(K,j/(K.n-1),sd*(K.hw+(tight?.5:.9)+H(j,sd)*.6));
      if(latAt(q.x,q.z)<HW+1&&!tight)continue;
      const m=Math.hypot(q.x-sx[nearestGlobal(q.x,q.z)],q.z-sz[nearestGlobal(q.x,q.z)]);
      if(m<HW+.8)continue;
      const st=1+Math.floor(H(j,sd*5)*3),y=meshY(q.x,q.z);
      for(let n=0;n<st;n++)cr.put(q.x+rand(-.15,.15),y+.3+n*.6,q.z+rand(-.15,.15),q.yaw+rand(-.3,.3));
    }
    cr.done();
  }

  /* ── the brick arch out of town ── */
  {const i=150,q=at(i,0),g=new THREE.Group();g.position.set(sx[i],sy[i],sz[i]);g.rotation.y=yawAt(i);world.add(g);
    const brk=psMat({map:horbyBrickTex('#9a4430')});
    for(const sd of [-1,1]){const pl=hoorBox(g,3,9,3,brk,sd*(HW+2),4.5,0);}
    hoorBox(g,2*HW+7,2.4,3,brk,0,9.6,0);
    for(let n=0;n<5;n++){const t=(n+.5)/5,a=Math.PI*t,x=-Math.cos(a)*(HW+.4),y=6.2+Math.sin(a)*2.2;   /* the curve under the arch */
      hoorBox(g,(2*HW+1)/5+.3,1.2,3.05,brk,x,y+1.0,0);}
    for(const sd of [-1,1])hoorBox(g,6,7.2,8,brk,sd*(HW+6.5),3.6,0);         /* the walls the arch joins */
    const sg=new THREE.Mesh(new THREE.PlaneGeometry(8,1.2),psMat({map:rosTextTex(96,16,'#f4efe2','#8a3a28','HÖRBY 1450'),unlit:true,side:THREE.DoubleSide}));
    sg.position.set(0,9.6,1.56);g.add(sg);}

  /* ── HÖRBY LANTBRUKSRALLY: a homemade banner on two poles over the start ── */
  {const i=14,g=new THREE.Group();g.position.set(sx[i],sy[i],sz[i]);g.rotation.y=yawAt(i);world.add(g);
    const wd=psMat({color:0x6b5540});
    for(const sd of [-1,1])hoorBox(g,.35,8.5,.35,wd,sd*(HW+2),4.25,0);
    const bn=new THREE.Mesh(new THREE.PlaneGeometry(2*HW+3,2.2,8,1),psMat({map:horbyBannerTex('HÖRBY LANTBRUKSRALLY',192,24),unlit:true,side:THREE.DoubleSide}));
    const pa=bn.geometry.attributes.position;
    for(let v=0;v<pa.count;v++){const x=pa.getX(v)/(HW+1.5);pa.setY(v,pa.getY(v)-(1-x*x)*.6);}   /* it sags in the middle */
    bn.position.set(0,7,0);g.add(bn);
    hoorBox(g,2*HW+4,.04,.04,psMat({color:0x2a2222}),0,8.2,0);}

  /* ── the fair: seven trailers, a tractor in front of each, pigs looking over the side ── */
  HORBY_TRAILERS.forEach(([i,sd,col],n)=>{
    const q=at(i,sd*(HW+9)),g=new THREE.Group();g.position.set(q.x,q.y,q.z);
    g.rotation.y=Math.atan2(-sd*rx[i],-sd*rz[i]);world.add(g);             /* the gate end faces the road */
    const side=psMat({map:horbyTrailerTex(col,n+1)}),body=psMat({color:col}),blk=psMat({color:0x222428});
    for(const s of [-1,1]){const m=new THREE.Mesh(new THREE.PlaneGeometry(6,2.2),side);m.position.set(s*1.25,1.9,0);m.rotation.y=s*Math.PI/2;g.add(m);}
    hoorBox(g,2.5,.25,6,blk,0,.75,0);hoorBox(g,2.5,2.2,.12,body,0,1.9,-3);
    for(const s of [-1,1]){const w=new THREE.Mesh(flat(new THREE.CylinderGeometry(.45,.45,.3,8)),blk);w.rotation.z=Math.PI/2;w.position.set(s*1.3,.45,-.4);g.add(w);}
    for(let k=0;k<3;k++){const pg=horbyPig();pg.scale.setScalar(.9);pg.position.set((k-1)*.75,1.05,-1.8+k*1.1);pg.rotation.y=Math.PI+(k-1)*.4;g.add(pg);}
    const tr=new THREE.Group();tr.position.set(0,0,-6.2);g.add(tr);                /* the tractor */
    const tc=[0x3f8a3a,0xc8321f,0x2f78d8][n%3];
    hoorBox(tr,1.6,1.1,2.8,psMat({color:tc}),0,1.3,0);hoorBox(tr,1.4,1.4,1.2,psMat({color:tc}),0,2.4,.6);
    for(const [x,z,r] of [[-1.0,.8,.95],[1.0,.8,.95],[-.9,-1.0,.55],[.9,-1.0,.55]]){
      const w=new THREE.Mesh(flat(new THREE.CylinderGeometry(r,r,.45,8)),blk);w.rotation.z=Math.PI/2;w.position.set(x,r,z);tr.add(w);}
    hoorMerge(g);
    g.userData.n=n;HORBY_STATE.trailers[n]={g,i,sd,q};
  });
  /* bunting over the fair road */
  {const wd=psMat({color:0x6b5540}),line=psMat({color:0x2a2222});
    const fl=rosInst(flat(new THREE.ConeGeometry(.42,.8,3)).rotateX(Math.PI),psMat({side:THREE.DoubleSide}),200,true);
    const cols=[0xc8321f,0xf2c81c,0x2f78d8,0x3fa04a,0xf4efe2,0xe86a9a];
    for(const i of [258,372,404,520]){
      const g=new THREE.Group();g.position.set(sx[i],sy[i],sz[i]);g.rotation.y=yawAt(i);world.add(g);
      for(const sd of [-1,1])hoorBox(g,.25,7,.25,wd,sd*(HW+2.2),3.5,0);
      for(let n=0;n<=16;n++){const t=n/16,x=(t*2-1)*(HW+2.2),y=6.8-(1-(t*2-1)**2)*1.4;
        if(n<16){const x2=((n+1)/16*2-1)*(HW+2.2),y2=6.8-(1-((n+1)/16*2-1)**2)*1.4;
          const sg=hoorBox(g,Math.hypot(x2-x,y2-y),.05,.05,line,(x+x2)/2,(y+y2)/2,0);sg.rotation.z=Math.atan2(y2-y,x2-x);}
        if(n>0&&n<16){const c=Math.cos(yawAt(i)),sn=Math.sin(yawAt(i));
          fl.put(sx[i]+c*x,sy[i]+y-.45,sz[i]-sn*x,yawAt(i),1,1,1,cols[n%cols.length]);}}
      hoorMerge(g);}
    fl.done();}
  /* the farmer at each crossing, with a red flag */
  HORBY_STATE.farmers=HORBY_CROSS.map(C=>{
    const [i,sd]=HORBY_TRAILERS[C.t],q=at(i-7,sd*(HW+4.5)),g=new THREE.Group();
    g.position.set(q.x,q.y,q.z);g.rotation.y=Math.atan2(-sd*rx[i],-sd*rz[i]);world.add(g);
    hoorBox(g,.5,.85,.3,psMat({color:0x2f5a8a}),0,.42,0);hoorBox(g,.56,.8,.34,psMat({color:0x2f5a8a}),0,1.25,0);
    hoorBox(g,.34,.34,.32,psMat({color:0xe0b090}),0,1.85,0);hoorBox(g,.5,.12,.5,psMat({color:0x3f8a3a}),0,2.05,0);
    const arm=new THREE.Group();arm.position.set(.34,1.55,0);g.add(arm);
    hoorBox(arm,.14,.7,.14,psMat({color:0x2f5a8a}),0,.3,0);hoorBox(arm,.05,1.4,.05,psMat({color:0x6b5540}),0,1.1,0);
    const fl=new THREE.Mesh(new THREE.PlaneGeometry(.9,.6),psMat({color:0xd8281c,side:THREE.DoubleSide}));fl.position.set(.45,1.5,0);arm.add(fl);
    return {g,arm};
  });
  /* hay bales, feed sacks and corrugated sheds round the fair */
  const bale=rosInst(flat(new THREE.CylinderGeometry(1.1,1.1,1.5,8)).rotateZ(Math.PI/2),psMat({color:0xd9b25a}),80);
  const sack=rosInst(flat(new THREE.BoxGeometry(.9,.35,.6)),psMat({color:0xe8dcc0}),200);
  const shedT=pixTex(16,16,g=>{g.fillStyle='#9aa0a4';g.fillRect(0,0,16,16);g.fillStyle='#7a8084';for(let x=0;x<16;x+=3)g.fillRect(x,0,1,16);
    g.fillStyle='rgba(150,80,40,.35)';g.fillRect(2,10,5,6);});
  shedT.wrapS=shedT.wrapT=THREE.RepeatWrapping;
  const shed=rosInst(rosBoxUV(14,5,9,2,5),psMat({map:shedT}),20);
  const shedR=rosInst(rosPrism(),psMat({color:0x8a9096,side:THREE.DoubleSide}),20);
  for(const [i,sd,off] of [[240,1,26],[318,-1,30],[372,-1,32],[520,1,22],[566,1,24],[640,1,26]]){
    const q=at(i,sd*(HW+off));if(!free(q.x,q.z,10))continue;res(q.x,q.z,12);
    shed.put(q.x,q.y-.2,q.z,yawAt(i));shedR.put(q.x,q.y+4.8,q.z,yawAt(i)+Math.PI/2,9.6,2.2,14.6);
    for(let n=0;n<6;n++)sack.put(q.x+rx[i]*sd*-6+rand(-3,3),q.y+.18+(n%3)*.35,q.z+rz[i]*sd*-6+rand(-3,3),rand(0,3));
  }
  for(let n=0;n<60;n++){const i=180+Math.floor(H(n,1)*340),sd=H(n,2)>.5?1:-1,q=at(i,sd*(HW+6+H(n,3)*20));
    if(!free(q.x,q.z,5))continue;bale.put(q.x,q.y+1.05,q.z,rand(0,3));}
  /* muddy puddles in the fields */
  const pud=rosInst(new THREE.CircleGeometry(1,8).rotateX(-Math.PI/2),psMat({color:0x4e3e2c}),60);
  for(let n=0;n<50;n++){const i=180+Math.floor(H(n,4)*340),sd=H(n,5)>.5?1:-1,q=at(i,sd*(HW+3+H(n,6)*24));
    if(latAt(q.x,q.z)<HW+3)continue;pud.put(q.x,q.y+.06,q.z,0,1.5+H(n,7)*2.5,1,1+H(n,8)*1.5);}
  [bale,sack,shed,shedR,pud].forEach(m=>m.done());

  /* ── Svinstigen: the enclosure fence beside the lane and the INGEN GENOMFART sign ── */
  if(S){
    const wd=psMat({color:0x6b5540}),post=rosInst(flat(new THREE.BoxGeometry(.18,1.3,.18)),wd,S.n*2),rail=rosInst(flat(new THREE.BoxGeometry(.08,.12,1)),wd,S.n*4);
    for(let j=COMMIT+4;j<S.n-MERGE-2;j+=2){
      const q=lanePt(S,j/(S.n-1),-(S.hw+2.2)),y=meshY(q.x,q.z);
      if(latAt(q.x,q.z)<HW+2.5)continue;
      post.put(q.x,y+.65,q.z,q.yaw);
      const q2=lanePt(S,(j+1)/(S.n-1),-(S.hw+2.2));for(const h of [.45,1.0])rail.put(q2.x,meshY(q2.x,q2.z)+h,q2.z,q2.yaw,1,1,SEG*2+.1);
    }
    post.done();rail.done();
    /* pigs inside the enclosure, watching */
    const watch=new THREE.Group();world.add(watch);
    for(let n=0;n<7;n++){const f=.2+n*.09,q=lanePt(S,f,-(S.hw+5+H(n,11)*8));if(latAt(q.x,q.z)<HW+6)continue;
      const pg=horbyPig();pg.position.set(q.x,meshY(q.x,q.z),q.z);pg.rotation.y=q.yaw+Math.PI/2+(H(n,12)-.5);watch.add(pg);}
    hoorMerge(watch);
    const q=lanePt(S,(COMMIT+3)/(S.n-1),S.hw+1.4),g=new THREE.Group();g.position.set(q.x,meshY(q.x,q.z),q.z);g.rotation.y=q.yaw+Math.PI;world.add(g);
    hoorBox(g,.14,2.4,.14,psMat({color:0x8a9096}),0,1.2,0);hoorBox(g,.14,2.4,.14,psMat({color:0x8a9096}),-3.2,1.2,0);
    const sg=new THREE.Mesh(new THREE.PlaneGeometry(4,1.1),psMat({map:rosTextTex(96,24,'#f4efe2','#c8281c','INGEN GENOMFART',8),unlit:true,side:THREE.DoubleSide}));
    sg.position.set(-1.6,2.6,0);g.add(sg);
    hoorBox(g,3.6,.06,.06,psMat({color:0x2a2222}),-1.6,2.0,0);
    /* the muddy tyre tracks that run straight under it */
    const trk=psMat({color:0x3a2c1e,transparent:true,opacity:.7,depthWrite:false});
    for(let j=COMMIT;j<COMMIT+16;j++)for(const l of [-1.1,1.1]){const a=lanePt(S,j/(S.n-1),l);
      const m=new THREE.Mesh(new THREE.PlaneGeometry(.45,SEG*1.05).rotateX(-Math.PI/2),trk);m.position.set(a.x,S.Y[a.j]+.05,a.z);m.rotation.y=a.yaw;world.add(m);}
  }

  /* ── the pig pen under the big jump, with one enormous, unimpressed pig ── */
  {const J=JUMPS[0];
    if(J){const wd=psMat({color:0x6b5540}),post=rosInst(flat(new THREE.BoxGeometry(.2,1.4,.2)),wd,60),rail=rosInst(flat(new THREE.BoxGeometry(.08,.12,1)),wd,120);
      const a=J.at+2,b=J.at+J.dn+10;
      for(const sd of [-1,1])for(let i=a;i<=b;i+=2){const q=at(i,sd*(HW+1.2));post.put(q.x,q.y+.7,q.z,yawAt(i));
        if(i<b){const q2=at(i+1,sd*(HW+1.2));for(const h of [.5,1.1])rail.put(q2.x,q2.y+h,q2.z,yawAt(i+1),1,1,SEG*2+.1);}}
      post.done();rail.done();
      const big=horbyPig();big.scale.setScalar(3.2);const q=at(J.at+J.dn+2,HW+6);
      big.position.set(q.x,q.y,q.z);big.rotation.y=yawAt(J.at)+Math.PI*0.65;world.add(big);
      HORBY_STATE.big=big;
      const sm=new THREE.Group();world.add(sm);
      for(let n=0;n<4;n++){const q2=at(J.at+4+n*4,(n%2?-1:1)*(HW+4+n));const pg=horbyPig();pg.position.set(q2.x,q2.y,q2.z);pg.rotation.y=n*1.7;sm.add(pg);}
      hoorMerge(sm);}}

  /* ── the feed silo on the way down ── */
  {const i=545,q=at(i,-(HW+14)),g=new THREE.Group();g.position.set(q.x,q.y,q.z);world.add(g);
    hoorBox(g,.1,.1,.1,psMat({color:0xb9bdc0}),0,0,0);
    const sil=new THREE.Mesh(flat(new THREE.CylinderGeometry(3.2,3.2,16,10)),psMat({color:0xc8ccd0}));sil.position.y=8;g.add(sil);
    const cap=new THREE.Mesh(flat(new THREE.ConeGeometry(3.5,2.4,10)),psMat({color:0x6f777c}));cap.position.y=17.2;g.add(cap);
    for(let n=0;n<4;n++){const ring=new THREE.Mesh(flat(new THREE.CylinderGeometry(3.25,3.25,.25,10)),psMat({color:0x8a9096}));ring.position.y=3+n*3.6;g.add(ring);}
    const hop=new THREE.Mesh(flat(new THREE.ConeGeometry(3.2,3,10)),psMat({color:0xc8ccd0}));hop.rotation.x=Math.PI;hop.position.y=-.5+1.5;g.add(hop);
    const sg=new THREE.Mesh(new THREE.PlaneGeometry(5,1.2),psMat({map:rosTextTex(96,24,'#2f7a3a','#f4efe2','FODER',12),unlit:true,side:THREE.DoubleSide}));
    sg.position.set(0,11,3.25);sg.rotation.y=yawAt(i)+Math.PI/2;g.add(sg);hoorMerge(g);}

  /* ── farmland: a few trees, fences of the default kind handled by the edge ── */
  const TN=220,trT=rosInst(flat(new THREE.CylinderGeometry(.22,.32,3,5)).translate(0,1.5,0),psMat({color:0x5e4634}),TN);
  const trC=rosInst(flat(new THREE.IcosahedronGeometry(2.8,0)).translate(0,4.8,0),psMat({}),TN,true);
  let guard=0,tc=0;
  while(tc<TN&&guard++<4000){const x=rand(-380,380),z=rand(-380,380);
    if(horbyTown(x,z)>.2||!free(x,z,12))continue;
    const y=meshY(x,z);trT.put(x,y,z,0);trC.put(x,y,z,rand(0,3),rand(.8,1.3),rand(.8,1.2),rand(.8,1.3),[0x4f8a3a,0x5c9a42,0x3e7a34][tc%3]);tc++;}
  trT.done();trC.done();
}
const HORBY_STATE={trailers:[],farmers:[],big:null,pa:null,paLap:-1,paT:0,honkLap:-1};

/* ───── Hörby hazards: sju lass svin over the road, the loudspeaker, the honking trailers ───── */
/** a grunt: a buzzing saw through a lowpass, falling in pitch */
function oink(vol){
  if(!actx)return;
  const t=actx.currentTime;
  for(const [d,f] of [[0,230],[.17,200]]){
    const o=actx.createOscillator(),lfo=actx.createOscillator(),lg=actx.createGain(),lp=actx.createBiquadFilter(),g=actx.createGain();
    o.type='sawtooth';o.frequency.setValueAtTime(f,t+d);o.frequency.exponentialRampToValueAtTime(f*.6,t+d+.14);
    lfo.type='square';lfo.frequency.value=42;lg.gain.value=60;lfo.connect(lg);lg.connect(o.frequency);
    lp.type='lowpass';lp.frequency.value=900;lp.Q.value=6;
    g.gain.setValueAtTime(.0001,t+d);g.gain.exponentialRampToValueAtTime(.16*(vol||1),t+d+.02);g.gain.exponentialRampToValueAtTime(.0001,t+d+.15);
    o.connect(lp);lp.connect(g);g.connect(audioOutput());o.start(t+d);lfo.start(t+d);o.stop(t+d+.17);lfo.stop(t+d+.17);
  }
}
/** the loudspeaker over the fair, more desperate every lap */
const HORBY_PA=['”Ägaren till sju lass svin ombeds omedelbart återvända till parkeringen.”',
  '”Vi upprepar: ägaren till SJU LASS SVIN ombeds omedelbart återvända till parkeringen.”',
  '”Snälla. Sju lass. Svin. Vem som helst. STÄNG GRINDARNA!”'];
function horbyPA(text){
  let el=HORBY_STATE.pa;
  if(!el){
    el=document.createElement('div');el.id='horbyPA';
    el.style.cssText='position:fixed;top:64px;left:50%;transform:translateX(-50%);max-width:min(560px,86vw);z-index:30;'+
      'padding:8px 16px;border-radius:12px;background:rgba(20,26,34,.72);color:#f4efe2;font-size:13px;line-height:1.35;'+
      'text-align:center;pointer-events:none;opacity:0;transition:opacity .3s;box-shadow:0 4px 14px rgba(0,0,0,.4)';
    document.body.appendChild(el);HORBY_STATE.pa=el;
  }
  el.innerHTML='<b style="letter-spacing:.08em">📢 HÖGTALAREN</b><br>'+text;el.style.opacity='1';HORBY_STATE.paT=5.5;
}
function hazardsHorby(H){
  const ST=HORBY_STATE;ST.paLap=-1;ST.honkLap=-1;
  if(ST.pa)ST.pa.style.opacity='0';
  /* the crossings: three little groups of pigs out of the trailer gate, with gaps between them */
  HORBY_CROSS.forEach((C,n)=>{
    const T=ST.trailers[C.t],F=ST.farmers[n];if(!T)return;
    const i0=T.i,sd=T.sd,from=sd*(HW+6),to=-sd*(HW+24);
    const pigs=[];
    for(let g=0;g<3;g++)for(let k=0;k<3;k++){
      const m=horbyPig();hoorMerge(m);m.scale.setScalar(1.25);world.add(m);m.visible=false;
      pigs.push({m,g,da:(k-1)*1.6+(g-1)*.6,dl:(k%2?.9:-.9)+(g*.37%1),kick:null});
    }
    if(n===0){                                   /* this one has stolen a chequered flag */
      const P=pigs[1],fl=new THREE.Group();
      const ft=pixTex(8,8,g=>{for(let y=0;y<4;y++)for(let x=0;x<4;x++){g.fillStyle=((x+y)%2)?'#f4f4f0':'#181c22';g.fillRect(x*2,y*2,2,2);}});
      hoorBox(fl,.06,1.6,.06,psMat({color:0x6b5540}),0,.8,0);
      const cl=new THREE.Mesh(new THREE.PlaneGeometry(1.0,.7),psMat({map:ft,side:THREE.DoubleSide}));cl.position.set(.5,1.3,0);fl.add(cl);
      fl.position.set(0,1.0,1.3);fl.rotation.x=-.5;P.m.add(fl);P.flag=cl;
    }
    const gp=mainPt(i0,sd*(HW+9-3.05)),gy=meshY(gp.x,gp.z);
    const gyaw=Math.atan2(-sd*rx[i0],-sd*rz[i0]);
    const gate=new THREE.Group();gate.position.set(gp.x,gy+.7,gp.z);gate.rotation.order='YXZ';gate.rotation.y=gyaw;world.add(gate);
    hoorBox(gate,2.4,2.1,.12,psMat({color:0x8a9096}),0,1.05,0);              /* hinged at the bottom */
    let cyc=-1;
    H.push({id:'svin'+n,period:C.period,phase:C.phase,mesh:gate,
      update(u,dt){
        const warn=u>0.28&&u<0.42,open=u>0.36&&u<0.92;
        /* the gate rattles, then folds down into a ramp */
        const sh=warn?Math.sin(clock*40)*.08:0,dn=open?smooth(0.36,0.40,u)*(1-smooth(0.88,0.92,u)):0;
        gate.rotation.x=dn*1.35;gate.rotation.z=sh;
        if(F){F.arm.rotation.z=warn||open&&u<0.6?-1.2+Math.sin(clock*9)*.7:-.1;}
        const c=Math.floor((raceTime+C.phase)/C.period),near=Math.hypot(player.x-gp.x,player.z-gp.z)<110;
        if(u>0.28&&c!==cyc){cyc=c;if(near&&state==='race'){oink(.8);ping(160,130,.05);setTimeout(()=>ping(160,130,.05),90);setTimeout(()=>ping(150,120,.05),180);}}
        this.live=[];
        for(const P of pigs){
          const u0=0.40+P.g*0.11,v=(u-u0)/0.30;
          if(v<0||v>1){P.m.visible=false;P.kick=null;continue;}
          const l=lerp(from,to,v)+P.dl,a=i0+P.da/SEG;
          const q=mainPt(a,l);let x=q.x,z=q.z;
          let y=Math.abs(l)<HW+1?q.y:meshY(q.x,q.z),turn=0;
          if(P.kick){const t=clamp((clock-P.kick.t)*3,0,1);x+=P.kick.dx*t*3.2;z+=P.kick.dz*t*3.2;y+=Math.sin(Math.PI*t)*1.4;turn=P.kick.turn*t;}
          y+=Math.abs(Math.sin(clock*11+P.da*3))*.18;            /* trotting */
          P.m.visible=true;P.m.position.set(x,y,z);
          P.m.rotation.y=Math.atan2(-sd*rx[i0],-sd*rz[i0])+turn;
          if(P.flag)P.flag.rotation.y=Math.sin(clock*8)*.3;
          P.p={x,y,z};if(Math.abs(l)<HW+2)this.live.push(P);
        }
        if(this.live.length&&near&&Math.random()<dt*1.5&&state==='race')oink(.5);
      },
      hit(k){
        if(!this.live)return false;
        for(const P of this.live)if(!P.kick&&near3(k,P.p.x,P.p.y,P.p.z,1.7)){this.hp=P;return true;}
        return false;
      },
      effect(k){
        const P=this.hp,sp=Math.hypot(k.vx,k.vz)||1;
        if(P){P.kick={t:clock,dx:k.vx/sp,dz:k.vz/sp,turn:(Math.random()<.5?-1:1)*2.4};}  /* bounced aside, offended */
        k.slow=Math.max(k.slow,.6);k.vx*=0.7;k.vz*=0.7;k.boost=0;k.drift=0;k.charge=0;
        for(let p=0;p<16;p++)puff(k.x+rand(-1.3,1.3),k.y+rand(.3,1.8),k.z+rand(-1.3,1.3),.86,.76,.42,.7);   /* straw */
        if(k===player){toast('NÖFF!');oink(1);shake=Math.min(1,shake+.35);}
        else if(Math.hypot(k.x-player.x,k.z-player.z)<50)oink(.6);
      }});
  });
  /* the loudspeaker, the big pig that looks up, and seven trailers honking under the big jump */
  H.push({id:'marknad',period:1,phase:0,
    update(u,dt){
      if(ST.paT>0){ST.paT-=dt;if(ST.paT<=0&&ST.pa)ST.pa.style.opacity='0';}
      if(state!=='race'||stage.id!=='horby')return;
      const lap=player.lap|0;
      if(lap!==ST.paLap&&lap<LAPS&&raceTime>(lap?0:7)&&((player.mi%N)+N)%N>200&&((player.mi%N)+N)%N<420){
        ST.paLap=lap;horbyPA(HORBY_PA[Math.min(lap,HORBY_PA.length-1)]);ping(660,660,.12);setTimeout(()=>ping(520,520,.16),160);}
      const J=JUMPS[0];
      if(J&&player.air&&!player.rib&&ST.honkLap!==lap){
        let d=((player.mi-J.at)%N+N)%N;
        if(d<16){ST.honkLap=lap;
          for(let n=0;n<7;n++)setTimeout(()=>ping(300+n*45,280+n*45,.16),n*110);
          oink(.7);}
      }
      if(ST.big&&J){const q=player,big=ST.big,dx=q.x-big.position.x,dz=q.z-big.position.z;
        big.rotation.x=q.air&&dx*dx+dz*dz<900?-.25:0;}       /* it looks up, and does not move */
    }});
}
