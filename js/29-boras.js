"use strict";
/* ───────── Borås ───────── */
/* Regn överallt: Regnmolnet's home track in Västgötacupen. A fictional Borås: out of a textile-mill
   courtyard, round the huge roundabout with the umbrella sculpture, along the canal, through the
   market street and the roadworks, and back to the mill. It rains. It always rains. Only the
   puddles with a white outline are slippery, and each leaves a dry line on the outside. */
SURF.borasGrus={top:o=>o+(1-o)*0.5,grip:o=>1-0.38*(1-o),fuel:1.1,name:'GRUS'};
SFX.borasGrus=SFX.gravel;
ROADTEX.boras=()=>pixTex(64,64,g=>{                  /* wet tarmac: dark, with the grey sky lying in it in streaks */
  g.fillStyle='#363a40';g.fillRect(0,0,64,64);
  for(let i=0;i<900;i++){g.fillStyle=Math.random()>.55?'rgba(112,122,136,.42)':'rgba(16,18,22,.5)';
    g.fillRect((Math.random()*64)|0,(Math.random()*64)|0,1,1);}
  g.fillStyle='rgba(150,166,186,.14)';for(let i=0;i<9;i++)g.fillRect((Math.random()*60)|0,0,2+((Math.random()*3)|0),64);
  g.fillStyle='rgba(18,20,24,.4)';for(let i=0;i<3;i++)g.fillRect((Math.random()*48)|0,(Math.random()*52)|0,14,9);
});
ROADTEX.borasGrus=()=>pixTex(64,64,g=>{              /* the roadworks: wet crushed stone, tyre ruts full of water */
  g.fillStyle='#7c7568';g.fillRect(0,0,64,64);
  for(let i=0;i<1100;i++){g.fillStyle=Math.random()>.5?'rgba(170,162,146,.6)':'rgba(60,56,50,.55)';
    g.fillRect((Math.random()*64)|0,(Math.random()*64)|0,1,1);}
  g.fillStyle='rgba(70,82,96,.55)';for(const x of [14,21,41,48])g.fillRect(x,0,3,64);
  g.fillStyle='rgba(150,170,190,.3)';for(const x of [15,42])g.fillRect(x,0,1,64);
});
VERGEC.boras=['#6a6964','#82807a','#52514d'];         /* wet granite kerbs and paving */
GROUND.boras={cell:26,stripe:0.95,verge:0x77756f,
  cols:[0x6c6a64,0x77746c,0x605e59,0x4c6a44,0x827e76,0x67635d,0x56724a]};

/* the canal (Viskan, more or less) runs east to west north of the canal road; the roundabout's
   island is a circle inside the big U at the east end */
/** the west-coast tracks' loudspeaker: one line in a box under the top of the screen for a few
    seconds. vastPA() with no text hides it (each track's hazards call that when the race is laid). */
let vastPAel=null,vastPAt=0;
function vastPA(text){
  if(!vastPAel){
    vastPAel=document.createElement('div');vastPAel.id='vastPA';
    vastPAel.style.cssText='position:fixed;top:64px;left:50%;transform:translateX(-50%);max-width:min(560px,86vw);z-index:30;'+
      'padding:8px 16px;border-radius:12px;background:rgba(20,26,34,.72);color:#f4efe2;font-size:13px;line-height:1.35;'+
      'text-align:center;pointer-events:none;opacity:0;transition:opacity .3s;box-shadow:0 4px 14px rgba(0,0,0,.4)';
    document.body.appendChild(vastPAel);
  }
  clearTimeout(vastPAt);
  if(!text){vastPAel.style.opacity='0';return;}
  vastPAel.innerHTML='<b style="letter-spacing:.08em">📢 SPEAKERN</b><br>'+text;vastPAel.style.opacity='1';
  vastPAt=setTimeout(()=>{vastPAel.style.opacity='0';},5500);
}
const BORAS_CANAL={z:-40,w:9,x0:-44};
const BORAS_ISLE={x:126,z:44,r:32};
function borasCanal(x,z){
  const d=Math.abs(z-BORAS_CANAL.z);
  return -5.2*(1-smooth(BORAS_CANAL.w,BORAS_CANAL.w+6,d))*smooth(BORAS_CANAL.x0-10,BORAS_CANAL.x0+4,x);
}
const borasInCanal=(x,z,pad)=>x>BORAS_CANAL.x0-6-(pad||0)&&Math.abs(z-BORAS_CANAL.z)<BORAS_CANAL.w+6+(pad||0);
/* where the set pieces sit, worked out from the samples once the track is laid */
const BORAS_PUDDLES=[118,372,636], BORAS_GUTTER=205, BORAS_BOARD=356;

STAGES.push({ id:'boras', group:'vastgota', name:'BORÅS', sub:'REGN ÖVERALLT',
  order:22, tag:'Det regnar i Borås. Det har alltid regnat i Borås. Tre varv runt textilfabriken, rondellen med jätteparaplyet och vägarbetet som aldrig blir klart. Bara pölarna med vit kant är hala.',
  view:{i:58,lat:-3,h:3.6,to:{i:100,lat:-34,h:9},fov:60},
  hw:8.4,
  bars:[0.65,0.75,0.6], laps:3,
  blurb:'Regnmolnet\'s home track: three wet laps out of a textile-mill courtyard, round a huge roundabout with an umbrella sculpture you never quite get away from, along the canal, through the market street and a roadworks that will never be finished. The rain is mostly for show: only the puddles with a white outline are slippery, and each leaves a dry line on the outside. A gutter empties onto the canal road on a timetable. Under the umbrellas is the open way through the market; the old textile factory is a secret, and a spettekaka opens its loading door.',
  role:'Blöta rondellkurvor, en kanalraka, marknadsgatan och ett grusigt vägarbete med plankhopp.',
  sky:[0x9aa6b2,0x5c6a7a], fog:[0x8e9aa6,70,330], amb:0x5c6672, dif:0xc4ccd8,
  road:'boras', verge:'boras', edge:'boras', ground:'boras',
  terrain:{size:840,seg:120},
  /* a flat town: the rolling Skåne ground ironed out, the canal dug into it */
  mod:(x,z,t)=>-rolls(x,z)*t*0.85+borasCanal(x,z),
  land:(x,z,out)=>landBoras(x,z,out),
  zones:[[446,494,'borasGrus']],
  jumpSpec:[{at:470,h:2.6,drop:1.8,up:10,dn:6,rec:14}],
  ctrl:[[-40,5,93],[20,4,92],[80,3,92],
        [130,2,93],[156,2,87],[174,2,68],[180,2,44],[174,2,20],[156,2,2],[130,2,-5],
        [80,2,-8],[20,2,-10],[-40,3,-12],[-66,4,-13],[-82,5,-20],[-89,6,-36],
        [-90,9,-70],[-90,12,-96],[-87,13,-112],[-74,14,-121],[-54,15,-124],
        [-20,15,-126],[10,15,-130],[36,16,-140],[54,17,-160],[56,18,-184],[38,18,-204],[6,18,-212],
        [-40,18,-210],[-100,17,-208],[-160,16,-198],
        [-196,15,-176],[-212,13,-136],[-216,11,-70],[-216,9,-10],[-216,8,50],[-213,7,82],[-198,6,94],[-160,6,95],[-100,6,94]],
  stations:[[0.07,1],[0.6,1]],
  routes:[
    {id:'paraply',name:'UNDER PARAPLYERNA',a:272,b:340,hw:3.8,side:1,lead:12,leadLat:9,
     mid:[[0.5,0]],surface:'road',tex:'cobble',risk:0.3,
     blurb:'The covered market passage under a ceiling of hanging umbrellas. Narrow cobbles between the stalls; it cuts the corner, but brake early for the way out.'},
    {id:'textil',name:'TEXTILFABRIKEN',a:586,b:692,hw:4.2,side:-1,lead:12,leadLat:9,
     mid:[[0.5,0]],surface:'road',tex:'concrete',risk:0.3,hidden:true,shoot:true,mouth:22,
     blockMesh:(R,j)=>borasDoor(R,j),blockAnim:(B,d)=>borasDoorAnim(B,d),
     blurb:'A dry loading passage straight through the old textile factory, between stacks of fabric rolls. Behind a marked loading door: blow it open with a spettekaka.'}],
  stamps:[
    {id:'bor1',dish:'Vaniljbulle',ini:'V',kind:'intro',route:'main',i:322,lat:-5.6,
     hint:'Vid marknadsstånden, där Under paraplyerna kommer ut.',
     story:'A soft wheat bun baked round a spoonful of vanilla custard and rolled in sugar while it is still warm. The market café keeps a tray of them under a plastic dome so the rain cannot get at them, and sells them two for one when it pours, which is always.'},
    {id:'bor2',dish:'Varm choklad',ini:'C',kind:'route',route:'textil',f:0.5,lat:0,
     hint:'Inne i Textilfabriken. Porten är stängd: skjut upp den.',
     story:'Cocoa, sugar and a pinch of salt stirred into hot milk in a big dented pan, poured into mugs with a dollop of whipped cream that melts straight away. The mill night shift kept a pan of it on a hot plate by the looms, and the factory still smells faintly of it.'},
    {id:'bor3',dish:'Regnkaka',ini:'R',kind:'air',route:'main',jump:0,after:5,lat:0,air:4.2,
     hint:'Högt över plankrampen i vägarbetet.',
     story:'Not a real cake, or not yet: the roadworks crew\'s name for whatever sponge cake someone brings on Friday, eaten standing in the site hut while the rain drums on the roof. Usually a sockerkaka, always a bit damp, and nobody minds.'}],
  postcard:{draw:(g,w,h)=>borasPostcard(g,w,h),
    caption:'Det höll upp i målbilden.'},
  hazards:H=>hazardsBoras(H), scenery:()=>sceneryBoras()
});

/* the edge: low concrete barriers with a coloured band, one colour per part of town, so you
   always know where you are even when everything else looks wet and grey */
const BORAS_BANDS=[[650,0xb5392a],[80,0x2f62a8],[170,0x2a8a84],[250,0xe8b020],[350,0x8a4fa8],[420,0xf08a1c],[540,0x3f8a3a],[650,0xb5392a]];
function borasBand(i){
  let c=BORAS_BANDS[BORAS_BANDS.length-1][1];
  for(const [a,col] of BORAS_BANDS)if(i>=a)c=col;            /* the courtyard band wraps past the line */
  return i<BORAS_BANDS[1][0]?BORAS_BANDS[0][1]:c;
}
EDGES.boras=st=>{
  const step=2,L=SEG*step+.15;
  const base=rosInst(flat(new THREE.BoxGeometry(.9,1.0,L)).translate(0,.5,0),psMat({color:0x9a968e}),N*2);
  const band=rosInst(flat(new THREE.BoxGeometry(.94,.3,L+.02)).translate(0,.15,0),psMat({}),N*2,true);
  for(let i=0;i<N;i+=step)for(const side of [-1,1]){
    const o=side*(HW+4.3),x=sx[i]+rx[i]*o,z=sz[i]+rz[i]*o;
    if(nearAlt(x,z,2.6))continue;
    if(stations.some(S=>{let d=i-S.at;if(d<-N/2)d+=N;else if(d>N/2)d-=N;return S.side===side&&d>-3&&d<S.len+3;}))continue;
    const y=meshY(x,z),yw=Math.atan2(fx[i],fz[i]);
    base.put(x,y-.05,z,yw);band.put(x,y+.62,z,yw,1,1,1,borasBand(i));
  }
  base.done();band.done();
};
function landBoras(x,z,out){
  const di=Math.hypot(x-BORAS_ISLE.x,z-BORAS_ISLE.z);
  if(di<BORAS_ISLE.r){out.setHex(di<9?0x8a5a8a:(Math.floor(di/5)&1?0x5a8a44:0x4f7e3c));return;}   /* the island: lawn rings, a flower bed */
  if(di<BORAS_ISLE.r+1.6){out.setHex(0xb8b4aa);return;}                                              /* its kerb */
  if(borasInCanal(x,z,0)){out.setHex(Math.abs(z-BORAS_CANAL.z)>BORAS_CANAL.w+2?0x6e6c66:0x3e4a52);return;}   /* quay stones */
}
/** façade tile: one window bay across, one floor up; brick or plaster */
function borasFacadeTex(col,brick){
  const t=pixTex(16,16,g=>{
    g.fillStyle=col;g.fillRect(0,0,16,16);
    if(brick){g.fillStyle='rgba(0,0,0,.15)';for(let y=1;y<16;y+=3)g.fillRect(0,y,16,1);
      for(let y=0;y<16;y+=3)for(let x=(y%6?0:2);x<16;x+=4)g.fillRect(x,y,1,3);}
    else{g.fillStyle='rgba(0,0,0,.08)';g.fillRect(0,14,16,2);}
    g.fillStyle='#e6e0d4';g.fillRect(4,3,8,10);g.fillStyle='#3c4a58';g.fillRect(5,4,6,8);
    g.fillStyle='#e6e0d4';g.fillRect(7,4,1,8);g.fillStyle='rgba(255,226,170,.5)';g.fillRect(5,4,2,3);
  });
  t.wrapS=t.wrapT=THREE.RepeatWrapping;return t;
}
/** many window-tiled boxes in one geometry: [x,y,z,yaw,L,D,H] each, base at y */
function borasMergeBoxes(list){
  const pos=[],nor=[],uv=[],m=new THREE.Matrix4(),q=new THREE.Quaternion(),e=new THREE.Euler(),v=new THREE.Vector3(),one=new THREE.Vector3(1,1,1),nm=new THREE.Matrix3();
  for(const [x,y,z,yw,L,D,Ht] of list){
    const g=rosBoxUV(L,Ht,D,4,3.4);e.set(0,yw,0);q.setFromEuler(e);v.set(x,y,z);m.compose(v,q,one);
    g.applyMatrix4(m);
    pos.push(...g.attributes.position.array);nor.push(...g.attributes.normal.array);uv.push(...g.attributes.uv.array);g.dispose();
  }
  const out=new THREE.BufferGeometry();
  out.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));
  out.setAttribute('normal',new THREE.Float32BufferAttribute(nor,3));
  out.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));
  return out;
}
/** an open umbrella, handle down, canopy striped in two colours; tip at y = 0 */
function borasUmbrella(r,h,c1,c2,seg){
  const g=new THREE.Group(),n=seg||8;
  const tex=pixTex(n*2,2,c=>{for(let k=0;k<n;k++){c.fillStyle=k%2?c2:c1;c.fillRect(k*2,0,2,2);}});
  const can=new THREE.Mesh(flat(new THREE.ConeGeometry(r,h*.28,n,1,true)),psMat({map:tex,side:THREE.DoubleSide}));
  can.position.y=-h*.14;g.add(can);
  const shaft=new THREE.Mesh(flat(new THREE.CylinderGeometry(r*.02,r*.02,h,4)),psMat({color:0x2a2a2e}));
  shaft.position.y=-h*.5+h*.14;g.add(shaft);
  const hook=new THREE.Mesh(flat(new THREE.TorusGeometry(r*.08,r*.02,3,8,Math.PI)),psMat({color:0x6a3a22}));
  hook.position.set(r*.08,-h+h*.14,0);hook.rotation.z=Math.PI;g.add(hook);
  return g;
}
function sceneryBoras(){
  const RES=[];
  const res=(x,z,r)=>RES.push([x,z,r]);
  const free=(x,z,pad)=>{
    if(latAt(x,z)<HW+pad||borasInCanal(x,z,pad)||Math.hypot(x-BORAS_ISLE.x,z-BORAS_ISLE.z)<BORAS_ISLE.r+pad)return false;
    for(const r of RES)if(Math.hypot(x-r[0],z-r[1])<r[2])return false;
    return true;
  };
  const at=(i,o)=>{const q=mainPt(i,o);q.y=meshY(q.x,q.z);return q;};
  const yawAt=i=>{i=((i%N)+N)%N;return Math.atan2(fx[i],fz[i]);};
  const H=(a,b)=>hash2(a*1.37+3.1,b*0.71-2.3);
  const P=ALTS.find(r=>r.id==='paraply'),T=ALTS.find(r=>r.id==='textil');
  const sign=(text,bg,fg,w,h,pw,ph,px,border)=>new THREE.Mesh(new THREE.PlaneGeometry(pw,ph),
    psMat({map:lerumSignTex(text,bg,fg,w,h,px,border),unlit:true,side:THREE.DoubleSide}));
  const grey=psMat({color:0x8a9096}),dark=psMat({color:0x2a2c30}),wood=psMat({color:0x7a5a3a});
  for(const S_ of stations){const q=mainPt(S_.at+6,S_.side*(HW+13));res(q.x,q.z,22);}
  {const q=mainPt(0,HW+20);res(q.x,q.z,30);}                       /* the grandstand */
  BORAS.anim=[];

  /* the finish: GRATTIS. DU HAR LÄMNAT BORÅS. And beyond the barrier, BORÅS */
  {const i=8,g=new THREE.Group();g.position.set(sx[i],sy[i],sz[i]);g.rotation.y=yawAt(i)+Math.PI;world.add(g);
    for(const sd of [-1,1])hoorBox(g,.3,7.4,.3,grey,sd*(HW+2.2),3.7,0);
    const b=new THREE.Mesh(new THREE.PlaneGeometry(2*HW+3.6,3.2),psMat({map:pixTex(192,40,c=>{
      c.fillStyle='#1e3a5a';c.fillRect(0,0,192,40);c.fillStyle='#f2c81c';c.fillRect(0,0,192,3);c.fillRect(0,37,192,3);
      c.fillStyle='#f4f2ec';c.font='9px "Press Start 2P",monospace';c.textAlign='center';c.textBaseline='middle';
      c.fillText('GRATTIS.',96,13);c.fillText('DU HAR LÄMNAT BORÅS.',96,27);}),unlit:true,side:THREE.DoubleSide}));
    b.position.set(0,6.2,0);g.add(b);
    const lt=new THREE.Mesh(new THREE.PlaneGeometry(40,14),psMat({map:pixTex(160,56,c=>{
      c.font='bold 36px sans-serif';c.textAlign='center';c.textBaseline='middle';
      c.lineWidth=4;c.strokeStyle='#3a3c40';c.strokeText('BORÅS',80,34);c.fillStyle='#f4f2ec';c.fillText('BORÅS',80,34);}),
      unlit:true,transparent:true,alphaTest:.5,side:THREE.DoubleSide}));
    const k=30,q=at(k,-(HW+24)),nx=rx[k]-fx[k]*.55,nz=rz[k]-fz[k]*.55;
    const lg=new THREE.Group();lg.position.set(q.x,q.y,q.z);lg.rotation.y=Math.atan2(nx,nz);world.add(lg);
    lt.position.y=8.6;lg.add(lt);
    for(const x of [-14,-5,5,14])hoorBox(lg,.4,4.4,.4,dark,x,2.2,-.3);
    res(q.x,q.z,22);}

  /* the tiny cloud over the grandstand: it rains on the spectators and nowhere near the road */
  {const o=HW+20,cx=sx[0]+rx[0]*o,cz=sz[0]+rz[0]*o,cy=meshY(cx,cz)+15;
    const c=new THREE.Group();c.position.set(cx,cy,cz);world.add(c);
    const m=psMat({color:0xa9b1bb,unlit:true});
    for(const [x,y,z,r] of [[0,0,0,2.1],[1.9,.3,.2,1.6],[-1.9,.1,-.2,1.7],[.5,1.1,.1,1.5]]){
      const s=new THREE.Mesh(flat(new THREE.IcosahedronGeometry(r,0)),m);s.position.set(x,y,z);c.add(s);}
    const n=40,pos=new Float32Array(n*6);
    const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.BufferAttribute(pos,3));
    const drz=new THREE.LineSegments(geo,new THREE.LineBasicMaterial({color:0xa8c0d8,transparent:true,opacity:.7}));
    drz.frustumCulled=false;c.add(drz);
    BORAS.cloud={g:c,x:cx,z:cz,y:cy,pos,geo,n,fx:fx[0],fz:fz[0]};}

  /* the mill along the courtyard: red brick, rows of windows, a chimney; the factory staging yard */
  const mill=[],blocks=[],roofs=[],chim=[];
  const brickA=borasFacadeTex('#9a3a2a',true),brickB=borasFacadeTex('#7e3424',true);
  const plaster=['#c8b89a','#d8cfbe','#a9b4b8','#c49a7a','#e0d8c4','#9aa38a'].map(c=>borasFacadeTex(c,false));
  const tryBlock=(x,z,yw,L,D,Ht,tex,pad)=>{
    const c=Math.cos(yw),s=Math.sin(yw);
    for(const [lx,lz] of [[-L/2,-D/2],[L/2,-D/2],[-L/2,D/2],[L/2,D/2],[0,0],[-L/4,0],[L/4,0],[0,-D/2],[0,D/2]]){
      const wx=x+c*lx+s*lz,wz=z-s*lx+c*lz;
      if(!free(wx,wz,pad)||nearAlt(wx,wz,4))return false;
    }
    blocks.push([x,meshY(x,z),z,yw,L,D,Ht,tex]);res(x,z,Math.min(L,D)/2+2);
    for(const [lx,lz] of [[-L/3,0],[L/3,0]])res(x+c*lx+s*lz,z-s*lx+c*lz,Math.min(L,D)/2+2);
    return true;
  };
  for(let i=652;i<N+44;i+=1){
    const ii=i%N,q=mainPt(ii,HW+21);
    if(tryBlock(q.x,q.z,yawAt(ii)+Math.PI/2,18,24,13,H(ii,1)>.5?brickA:brickB,3)){mill.push(q);if(mill.length===3)chim.push(q);i+=8;}
  }
  /* the roundabout island: the umbrella sculpture you can see from everywhere, lawn and a flower bed */
  {const x=BORAS_ISLE.x,z=BORAS_ISLE.z,y=meshY(x,z);
    const g=new THREE.Group();g.position.set(x,y,z);world.add(g);
    const plinth=new THREE.Mesh(flat(new THREE.CylinderGeometry(3.2,3.8,1.4,8)),psMat({color:0x8a8780}));plinth.position.y=.7;g.add(plinth);
    const u=borasUmbrella(12,30,'#c8321f','#f4f2ec',10);u.position.y=27.4;u.rotation.z=.06;g.add(u);
    BORAS.umb=u;
    const drip=rosInst(flat(new THREE.BoxGeometry(.12,1.2,.12)),psMat({color:0xa8c0d8,unlit:true,transparent:true,opacity:.7,depthWrite:false}),20);
    BORAS.drips=[];for(let n=0;n<10;n++){const a=n/10*6.283;BORAS.drips.push([x+Math.cos(a)*11.6,z+Math.sin(a)*11.6,y+19,n/10]);}
    BORAS.drip=drip;drip.done();
    const fl=rosInst(flat(new THREE.IcosahedronGeometry(.5,0)),psMat({}),120,true);
    for(let n=0;n<110;n++){const a=rand(0,6.283),r=rand(4,8.4);fl.put(x+Math.cos(a)*r,y+.3,z+Math.sin(a)*r,0,1,rand(.6,1.1),1,[0xe8b020,0xc8321f,0xf4f2ec,0x8a4fa8][n%4]);}
    fl.done();
    /* blue roundabout signs on the island, facing the way in */
    for(const i of [74,150]){const q=at(i+6,HW+6),sg=new THREE.Group();sg.position.set(q.x,q.y,q.z);sg.rotation.y=yawAt(i)+Math.PI;world.add(sg);
      hoorBox(sg,.12,2.4,.12,grey,0,1.2,0);
      const d=new THREE.Mesh(new THREE.CircleGeometry(.8,12),psMat({map:pixTex(32,32,c=>{c.fillStyle='#2f62a8';c.beginPath();c.arc(16,16,16,0,6.283);c.fill();
        c.strokeStyle='#f4f2ec';c.lineWidth=3;c.beginPath();c.arc(16,16,9,.4,5.6);c.stroke();c.fillStyle='#f4f2ec';
        c.beginPath();c.moveTo(25,10);c.lineTo(29,18);c.lineTo(21,18);c.fill();}),unlit:true,side:THREE.DoubleSide}));
      d.position.set(0,2.8,0);sg.add(d);}}

  /* the canal: water between stone quays, a railing on the road side, footbridges and moored boats */
  {const L=520,x0=BORAS_CANAL.x0-2,cx=x0+L/2,wy=meshY(cx,BORAS_CANAL.z+BORAS_CANAL.w+8)-3.4;
    const w=new THREE.Mesh(new THREE.PlaneGeometry(L,2*BORAS_CANAL.w+5).rotateX(-Math.PI/2),psMat({color:0x46606e,unlit:true}));
    w.position.set(cx,wy,BORAS_CANAL.z);world.add(w);BORAS.water={m:w,y:wy};
    const rip=psMat({color:0x8aa4b4,unlit:true});const rg=new THREE.Group();
    for(let n=0;n<70;n++){const r=new THREE.Mesh(new THREE.PlaneGeometry(rand(1,4),.25).rotateX(-Math.PI/2),rip);
      r.position.set(rand(x0+4,x0+L-4),wy+.04,BORAS_CANAL.z+rand(-BORAS_CANAL.w,BORAS_CANAL.w));rg.add(r);}
    world.add(hoorMerge(rg));
    const post=rosInst(flat(new THREE.BoxGeometry(.12,1.1,.12)).translate(0,.55,0),dark,200);
    const rail=rosInst(flat(new THREE.BoxGeometry(.08,.08,4.2)),dark,200);
    for(let x=x0+2;x<x0+L;x+=4){const z=BORAS_CANAL.z+BORAS_CANAL.w+5.4;if(latAt(x,z)<HW+5)continue;
      const y=meshY(x,z);post.put(x,y,z,0);rail.put(x+2,y+1.05,z,Math.PI/2);}
    post.done();rail.done();
    for(const bx of [-10,64]){const g=new THREE.Group(),y=meshY(bx,BORAS_CANAL.z+BORAS_CANAL.w+7);g.position.set(bx,y,BORAS_CANAL.z);world.add(g);
      const span=2*BORAS_CANAL.w+14;
      for(let n=0;n<10;n++){const t=n/9,zz=(t-.5)*span,yy=Math.sin(Math.PI*t)*1.6;hoorBox(g,3,.3,span/9+.1,psMat({color:0x6a6058}),0,yy+.2,zz);}
      for(const s of [-1,1])hoorBox(g,.1,1,span,dark,s*1.45,1.9,0);
      hoorMerge(g);}
    const boat=(x,c)=>{const g=new THREE.Group();g.position.set(x,wy,BORAS_CANAL.z+(H(x,1)>.5?5.5:-5.5));g.rotation.y=Math.PI/2;world.add(g);
      hoorBox(g,1.8,.7,6,psMat({color:c}),0,.2,0);hoorBox(g,1.4,.9,2,psMat({color:0xe8e4da}),0,.9,-.6);hoorMerge(g);};
    boat(20,0x2f62a8);boat(100,0xc8321f);boat(170,0x3f8a3a);}

  /* the gutter house on the canal road: the downpipe that empties onto the road on a timetable */
  {const i=BORAS_GUTTER,q=at(i,-(HW+10)),g=new THREE.Group(),yw=Math.atan2(rx[i],rz[i]);   /* front to the road */
    g.position.set(q.x,q.y,q.z);g.rotation.y=yw;world.add(g);
    res(q.x,q.z,10);
    const body=new THREE.Mesh(rosBoxUV(16,11,10,4,3.4),psMat({map:borasFacadeTex('#c8b89a',false)}));body.position.y=-.2;g.add(body);
    hoorBox(g,16.4,.4,10.4,psMat({color:0x4a4c50}),0,11,0);
    hoorBox(g,16.6,.3,.5,grey,0,10.6,4.9);                                  /* the gutter */
    hoorBox(g,.4,10.2,.4,grey,0,5.5,5.3);                                    /* the downpipe */
    hoorBox(g,.5,.5,1.6,grey,0,.6,6.1);
    const lamp=new THREE.Mesh(flat(new THREE.BoxGeometry(.5,.5,.3)),psMat({color:0x5a3008,unlit:true}));lamp.position.set(q.x+Math.cos(yw)*1.1+Math.sin(yw)*5.2,q.y+3.2,q.z-Math.sin(yw)*1.1+Math.cos(yw)*5.2);lamp.rotation.y=yw;world.add(lamp);
    const s=sign('STUPRÄNNAN','#2a2c30','#f08a1c',64,14,3,.7,7);s.position.set(2.6,4.2,5.25);s.rotation.y=Math.PI;g.add(s);
    BORAS.gutterLamp=lamp;BORAS.gutterOut=new THREE.Vector3(q.x+Math.sin(yw)*6.9,q.y+.6,q.z+Math.cos(yw)*6.9);
    hoorMerge(g);}

  /* Under paraplyerna: a ceiling of hanging umbrellas over the market passage, stalls on both sides */
  if(P){
    const can=rosInst(flat(new THREE.ConeGeometry(1.3,.5,8,1,true)),psMat({side:THREE.DoubleSide}),220,true);
    const shaft=rosInst(flat(new THREE.CylinderGeometry(.03,.03,1.1,3)),dark,220);
    const wire=rosInst(flat(new THREE.BoxGeometry(1,.04,.04)),dark,80);
    const cols=[0xc8321f,0x2f78d8,0xf2c81c,0x3fa04a,0xe86a9a,0xf08a1c,0x8a4fa8,0xf4f2ec];
    for(let j=COMMIT+2;j<P.n-MERGE-2;j+=2){
      const q=lanePt(P,j/(P.n-1),0),y=P.Y[j]+5.6;
      wire.put(q.x,y+.3,q.z,q.yaw+Math.PI/2,2*P.hw+5,1,1);
      for(const l of [-2.6,0,2.6]){const x=q.x+q.rx*l,z=q.z+q.rz*l,yy=y-.2+H(j,l)*.4;
        can.put(x,yy,z,H(l,j)*6,1,1,1,cols[Math.floor(H(j*3,l)*cols.length)],(H(j,l*3)-.5)*.3,(H(l*5,j)-.5)*.3);
        shaft.put(x,yy-.5,z,0);}
    }
    can.done();shaft.done();wire.done();
    for(const sd of [-1,1])for(let j=COMMIT;j<P.n-MERGE;j++){const q=lanePt(P,j/(P.n-1),sd*(P.hw+3));res(q.x,q.z,5);}
    /* the stalls: striped awnings, crates of fruit and flowers */
    const awn=rosInst(flat(new THREE.BoxGeometry(3.2,.12,2.4)),psMat({map:rosStripeTex('#c8321f')}),60);
    const awn2=rosInst(flat(new THREE.BoxGeometry(3.2,.12,2.4)),psMat({map:rosStripeTex('#2f62a8')}),60);
    const table=rosInst(flat(new THREE.BoxGeometry(2.8,.9,1.6)).translate(0,.45,0),wood,120);
    const fruit=rosInst(flat(new THREE.BoxGeometry(.5,.3,.5)),psMat({}),400,true);
    const leg=rosInst(flat(new THREE.BoxGeometry(.1,2.6,.1)).translate(0,1.3,0),grey,240);
    for(let j=COMMIT+3;j<P.n-MERGE-2;j+=3)for(const sd of [-1,1]){
      const q=lanePt(P,j/(P.n-1),sd*(P.hw+2.4)),y=meshY(q.x,q.z),yw=q.yaw;
      if(nearAltMain(q.x,q.z)<HW+3)continue;
      (H(j,sd)>.5?awn:awn2).put(q.x+q.rx*sd*.4,y+2.6,q.z+q.rz*sd*.4,yw+Math.PI/2,1,1,1,null,0,sd*.18);
      table.put(q.x,y,q.z,yw+Math.PI/2);
      for(const a of [-1,0,1])for(const b of [-.4,.4])fruit.put(q.x+Math.sin(yw)*a*.9+q.rx*b,y+1.05,q.z+Math.cos(yw)*a*.9+q.rz*b,yw,1,1,1,
        [0xc8321f,0xf2c81c,0x3fa04a,0xf08a1c,0xe86a9a,0x8a4fa8][Math.floor(H(j*a+3,b*7+sd)*6)]);
      for(const a of [-1.4,1.4])leg.put(q.x+Math.sin(yw)*a+q.rx*sd*1.2,y,q.z+Math.cos(yw)*a+q.rz*sd*1.2,yw);
    }
    awn.done();awn2.done();table.done();fruit.done();leg.done();
    const j=COMMIT-4,q=lanePt(P,j/(P.n-1),0),g=new THREE.Group();g.position.set(q.x,P.Y[j],q.z);g.rotation.y=q.yaw+Math.PI;world.add(g);
    for(const sd of [-1,1])hoorBox(g,.25,6.2,.25,dark,sd*(P.hw+1.4),3.1,0);
    const s=sign('UNDER PARAPLYERNA','#c8321f','#f4f2ec',128,16,2*P.hw+3,1.1,7);s.position.set(0,6.4,0);g.add(s);
  }

  /* the market street after the passage, with the vaniljbulle café */
  {const i=318,q=at(i,-(HW+9)),g=new THREE.Group();g.position.set(q.x,q.y,q.z);g.rotation.y=yawAt(i);world.add(g);res(q.x,q.z,9);
    const cafe=new THREE.Mesh(rosBoxUV(12,7,8,4,3.4),psMat({map:borasFacadeTex('#e0d8c4',false)}));cafe.position.set(0,-.2,-2);g.add(cafe);
    const aw=new THREE.Mesh(flat(new THREE.BoxGeometry(12,.15,3)),psMat({map:rosStripeTex('#3f8a3a')}));aw.position.set(0,3.4,3.4);aw.rotation.x=-.25;g.add(aw);
    const s=sign('KONDITORI','#3f8a3a','#f4f2ec',80,16,6,1.2,8);s.position.set(0,5.2,2.05);s.rotation.y=Math.PI;g.add(s);
    for(const x of [-4,0,4]){hoorBox(g,1,.08,1,psMat({color:0xf4f2ec}),x,.8,4.6);hoorBox(g,.1,.8,.1,dark,x,.4,4.6);
      const u=borasUmbrella(1.6,2.6,'#3f8a3a','#f4f2ec',8);u.position.set(x,3.0,4.6);g.add(u);}
    hoorMerge(g);}

  /* SNART UPPEHÅLL: the weather board that flickers and never changes */
  {const i=BORAS_BOARD,sd=Math.sign(scurv[i])||1,q=at(i,sd*(HW+6)),g=new THREE.Group();
    g.position.set(q.x,q.y,q.z);g.rotation.y=yawAt(i)+Math.PI;world.add(g);res(q.x,q.z,6);
    for(const x of [-2.4,2.4])hoorBox(g,.3,4,.3,dark,x,2,0);
    hoorBox(g,6,2.4,.4,dark,0,5,0);
    const scr=new THREE.Mesh(new THREE.PlaneGeometry(5.4,1.9),psMat({map:pixTex(96,32,c=>{
      c.fillStyle='#101418';c.fillRect(0,0,96,32);c.fillStyle='#f2a01c';c.font='7px "Press Start 2P",monospace';c.textAlign='center';c.textBaseline='middle';
      c.fillText('SNART',48,10);c.fillText('UPPEHÅLL',48,22);
      c.fillStyle='rgba(0,0,0,.35)';for(let y=0;y<32;y+=2)c.fillRect(0,y,96,1);}),unlit:true,transparent:true,side:THREE.DoubleSide}));
    scr.position.set(0,5,.22);g.add(scr);BORAS.board=scr;}

  /* the roadworks: cones, a site hut, an excavator, work lights, and planks over the ramp */
  {const cone=rosInst(flat(new THREE.ConeGeometry(.32,.9,6)).translate(0,.45,0),psMat({map:pixTex(4,8,c=>{c.fillStyle='#f08a1c';c.fillRect(0,0,4,8);c.fillStyle='#f4f2ec';c.fillRect(0,2,4,2);})}),120);
    for(let i=424;i<506;i+=3)for(const sd of [-1,1]){
      if(sd>0&&i>=428&&i<=448)continue;                                   /* the service bay */
      const q=at(i,sd*(HW+1.4));cone.put(q.x,q.y,q.z,0);}
    cone.done();
    const J=JUMPS[0];
    if(J){const plank=new THREE.InstancedMesh(flat(new THREE.BoxGeometry(2*HW-1,.12,SEG*.8)),psMat({color:0x8a6a46}),J.up+1),o=new THREE.Object3D();
      o.rotation.order='YXZ';
      for(let k=-J.up;k<=0;k++){const ii=(J.at+k+N)%N;o.position.set(sx[ii],sy[ii]+.07,sz[ii]);
        o.rotation.set(-Math.atan2(sy[(ii+1)%N]-sy[(ii-1+N)%N],2*SEG),yawAt(ii),0);o.updateMatrix();plank.setMatrixAt(k+J.up,o.matrix);}
      plank.frustumCulled=false;world.add(plank);
      for(const sd of [-1,1]){const i=J.at-J.up-14,q=at(i,sd*(HW+2.8)),g=new THREE.Group();g.position.set(q.x,q.y,q.z);g.rotation.y=yawAt(i)+Math.PI;world.add(g);
        hoorBox(g,.12,2.2,.12,grey,0,1.1,0);
        const t=new THREE.Mesh(new THREE.PlaneGeometry(1.4,1.25),psMat({map:pixTex(32,28,c=>{
          c.fillStyle='#c8281c';c.beginPath();c.moveTo(16,0);c.lineTo(32,28);c.lineTo(0,28);c.fill();
          c.fillStyle='#f2c81c';c.beginPath();c.moveTo(16,5);c.lineTo(28,25);c.lineTo(4,25);c.fill();
          c.fillStyle='#1e2022';c.fillRect(10,20,12,2);c.fillRect(13,12,2,8);c.beginPath();c.arc(14,10,2,0,6.3);c.fill();c.fillRect(17,15,5,2);}),
          unlit:true,transparent:true,alphaTest:.5,side:THREE.DoubleSide}));
        t.position.set(0,2.7,0);g.add(t);
        const p=sign('VÄGARBETE','#f4f2ec','#1e2022',64,16,1.6,.45,7);p.position.set(0,1.85,0);g.add(p);}}
    /* the work lights: tall poles, a cluster of yellow lamps */
    BORAS.lamps=[];
    for(const [i,sd] of [[440,-1],[462,1],[486,-1],[500,1]]){const q=at(i,sd*(HW+3.4)),g=new THREE.Group();g.position.set(q.x,q.y,q.z);world.add(g);
      hoorBox(g,.9,.5,.9,psMat({color:0xf2c81c}),0,.25,0);hoorBox(g,.18,7,.18,grey,0,3.5,0);
      const l=new THREE.Mesh(flat(new THREE.BoxGeometry(1.6,.7,.5)),psMat({color:0xffe68a,unlit:true}));
      l.position.set(0,7.2,0);l.rotation.y=Math.atan2(-sd*rx[i],-sd*rz[i]);l.rotation.x=.4;g.add(l);BORAS.lamps.push(l);res(q.x,q.z,3);}
    /* the excavator, the site hut and the gravel heap, out of the way on the inside */
    {const i=456,q=at(i,-(HW+11)),g=new THREE.Group();g.position.set(q.x,q.y,q.z);g.rotation.y=yawAt(i)+.7;world.add(g);res(q.x,q.z,9);
      const yel=psMat({color:0xe8b020});
      hoorBox(g,3.2,.9,4.6,dark,0,.45,0);hoorBox(g,3,1.6,3,yel,0,1.8,-.3);hoorBox(g,1.4,1.4,1.4,psMat({color:0x2a3440}),.7,2.9,.4);
      const arm=new THREE.Group();arm.position.set(-.6,2.2,1.2);arm.rotation.x=-.5;g.add(arm);
      hoorBox(arm,.4,.4,4.4,yel,0,0,2.2);const a2=new THREE.Group();a2.position.set(0,0,4.4);a2.rotation.x=1.6;arm.add(a2);
      hoorBox(a2,.36,.36,3,yel,0,0,1.5);hoorBox(a2,1.2,.9,.8,dark,0,-.2,3);
      BORAS.digger=arm;}
    {const i=490,q=at(i,-(HW+9)),g=new THREE.Group();g.position.set(q.x,q.y,q.z);g.rotation.y=yawAt(i);world.add(g);res(q.x,q.z,8);
      hoorBox(g,6,2.6,2.6,psMat({color:0xe8b020}),0,1.4,0);hoorBox(g,6.2,.15,2.8,dark,0,2.75,0);
      for(const x of [-1.8,0,1.8])hoorBox(g,.9,.7,.06,psMat({color:0x3c4a58}),x,1.7,1.32);
      hoorBox(g,1.1,2.2,1.1,psMat({color:0x2f62a8}),4,1.1,0);
      const s=sign('BODEN','#f4f2ec','#1e2022',40,12,1.4,.4,7);s.position.set(-2.4,2.2,1.34);s.rotation.y=Math.PI;g.add(s);
      const heap=new THREE.Mesh(flat(new THREE.ConeGeometry(4,2.6,7)),psMat({color:0x7c7568}));heap.position.set(-6,1.2,-3);g.add(heap);
      hoorMerge(g);}
    {const i=444,q=at(i,-(HW+4.2)),g=new THREE.Group();g.position.set(q.x,q.y,q.z);g.rotation.y=yawAt(i)+Math.PI;world.add(g);
      for(const x of [-1.4,1.4])hoorBox(g,.12,2.4,.12,grey,x,1.2,0);
      const s=sign('OMLEDNING','#f2c81c','#1e2022',80,18,3.2,.8,8);s.position.set(0,2.6,0);g.add(s);
      const s2=sign('SEDAN 1994','#f4f2ec','#1e2022',80,14,3.2,.5,7);s2.position.set(0,1.95,0);g.add(s2);}}

  /* Textilfabriken: the passage between two halls, fabric rolls stacked along the walls, roof trusses */
  if(T){
    const j0=(T.mouth||22)+2,j1=T.n-MERGE-10,W=T.hw+4.6,D=14;
    const hall=[];
    for(let j=j0;j<=j1;j+=2)for(const sd of [-1,1]){const q=lanePt(T,j/(T.n-1),sd*(W+D/2));hall.push([q.x,T.Y[j]-.3,q.z,q.yaw,D,SEG*2+.3,8.6]);res(q.x,q.z,9);}
    world.add(new THREE.Mesh(borasMergeBoxes(hall),psMat({map:borasFacadeTex('#8a3424',true)})));
    const roofL=rosInst(flat(new THREE.BoxGeometry(D+.4,.5,SEG*2+.3)),psMat({color:0x4a4c50}),hall.length);
    for(const [x,y,z,yw,L,Dd,Ht] of hall)roofL.put(x,y+Ht,z,yw);
    roofL.done();
    const truss=rosInst(flat(new THREE.BoxGeometry(1,.4,.4)),dark,T.n);
    const roll=rosInst(flat(new THREE.CylinderGeometry(.68,.68,2.2,8)).rotateX(Math.PI/2),psMat({}),500,true);
    const cols=[0xc8321f,0x2f62a8,0xf2c81c,0x3fa04a,0xe86a9a,0xf4f2ec,0x8a4fa8,0x2a8a84];
    for(let j=j0;j<=j1;j++){
      for(const sd of [-1,1])for(let k=0;k<3;k++)for(const r of [2.0,3.4]){
        if(H(j*7+k,sd*r)<.22||(k===2&&r<3))continue;
        const p=lanePt(T,j/(T.n-1),sd*(T.hw+r));
        roll.put(p.x,T.Y[j]+.68+k*1.34,p.z,p.yaw,1,1,1,cols[Math.floor(H(j+k,r*sd)*cols.length)]);}
      if(j%4===0){const q=lanePt(T,j/(T.n-1),0);truss.put(q.x,T.Y[j]+8.4,q.z,q.yaw,2*W,1,1);}
    }
    truss.done();roll.done();
    for(const [jj,txt] of [[j0,'TEXTILFABRIKEN'],[j1,'LASTKAJ 3']]){const q=lanePt(T,jj/(T.n-1),0);
      const s=sign(txt,'#2a2c30','#f4f2ec',112,16,2*T.hw+4,1.2,7);s.position.set(q.x,T.Y[jj]+7.4,q.z);s.rotation.y=q.yaw+Math.PI;world.add(s);
      const bm=new THREE.Mesh(flat(new THREE.BoxGeometry(2*W,1.2,.6)),psMat({color:0x6a2a20}));bm.position.set(q.x,T.Y[jj]+8.2,q.z);bm.rotation.y=q.yaw;world.add(bm);}
  }

  /* the town: blocks along every street, then the ones behind */
  for(const [i0,i1,sd] of [[60,250,-1],[60,250,1],[250,420,1],[250,420,-1],[420,650,1],[420,650,-1]]){
    for(let i=i0;i<i1;i+=2){
      const D=12+H(i,sd)*8,L=14+H(sd,i)*12,Ht=8+H(i*3,sd)*10,q=mainPt(i,sd*(HW+9+D/2));
      if(tryBlock(q.x,q.z,yawAt(i)+Math.PI/2,L,D,Ht,plaster[Math.floor(H(i,sd*7)*plaster.length)],3))i+=Math.round(L/SEG*.6);
    }
  }
  for(let gx=-380;gx<=360;gx+=30)for(let gz=-380;gz<=300;gz+=28){
    const x=gx+H(gx,gz)*8,z=gz+H(gz,gx)*8,Ht=8+H(gx,gz*3)*14;
    tryBlock(x,z,H(gx*3,gz)>.5?0:Math.PI/2,14+H(gz,gx*2)*10,12+H(gx*2,gz)*8,Ht,H(gz*5,gx)>.7?brickA:plaster[Math.floor(H(gx,gz*7)*plaster.length)],6);
  }
  {const byTex=new Map();                                   /* one merged mesh per façade */
    for(const b of blocks){const [x,y,z,yw,L,D,Ht,tex]=b;
      if(!byTex.has(tex))byTex.set(tex,[]);
      byTex.get(tex).push([x,y-.2,z,yw,Math.round(L/4)*4||4,Math.round(D),Math.round(Ht/3.4)*3.4||3.4]);
      roofs.push([x,y-.2+(Math.round(Ht/3.4)*3.4||3.4),z,yw,Math.round(L/4)*4||4,Math.round(D)]);}
    for(const [tex,list] of byTex)world.add(new THREE.Mesh(borasMergeBoxes(list),psMat({map:tex})));
    const rf=rosInst(flat(new THREE.BoxGeometry(1,.5,1)).translate(0,.25,0),psMat({color:0x4a4c50}),blocks.length+4);
    const box=rosInst(flat(new THREE.BoxGeometry(2.2,1.4,1.8)).translate(0,.7,0),psMat({color:0x8a8e92}),blocks.length+4);
    for(const [x,y,z,yw,L,D] of roofs){rf.put(x,y,z,yw,L+.4,1,D+.4);box.put(x+Math.cos(yw)*L*.2,y+.5,z-Math.sin(yw)*L*.2,yw);}
    rf.done();box.done();}
  for(const q of chim){const x=q.x-q.rx*6,z=q.z-q.rz*6,y=meshY(x,z);
    const st=new THREE.Mesh(flat(new THREE.CylinderGeometry(1.3,2.0,34,8)),psMat({map:borasFacadeTex('#8a3424',true)}));
    st.position.set(x,y+17,z);world.add(st);
    const bd=new THREE.Mesh(flat(new THREE.CylinderGeometry(1.42,1.42,1.2,8)),psMat({color:0xe8e0d0}));bd.position.set(x,y+31,z);world.add(bd);}
  /* a sign over the mill's gate */
  if(mill.length>1){const q=mill[1],g=new THREE.Group();g.position.set(q.x-q.rx*(12+.2),meshY(q.x,q.z),q.z-q.rz*(12+.2));
    g.rotation.y=Math.atan2(-q.rx,-q.rz);world.add(g);
    const s=sign('VÄVERIET','#2a2c30','#f2c81c',96,20,10,2,8);s.position.set(0,10.4,0);g.add(s);}

  /* street lamps along the roads, and a few wet trees */
  {const pole=rosInst(flat(new THREE.CylinderGeometry(.1,.14,6,4)).translate(0,3,0),dark,N);
    const head=rosInst(flat(new THREE.BoxGeometry(.5,.25,1.1)),psMat({color:0xffe6a8,unlit:true}),N);
    for(let i=0;i<N;i+=16)for(const sd of [-1,1]){
      if((i/16+(sd>0?1:0))%2)continue;
      const q=at(i,sd*(HW+5.6));if(nearAlt(q.x,q.z,3)||!free(q.x,q.z,-HW+5))continue;
      if(stations.some(S=>{let d=i-S.at;if(d<-N/2)d+=N;else if(d>N/2)d-=N;return S.side===sd&&d>-6&&d<S.len+6;}))continue;
      pole.put(q.x,q.y,q.z,0);head.put(q.x-sd*q.rx*.6,q.y+6,q.z-sd*q.rz*.6,q.yaw);}
    pole.done();head.done();
    const TN=160,trT=rosInst(flat(new THREE.CylinderGeometry(.16,.24,3.6,5)).translate(0,1.8,0),psMat({color:0x4a3a2e}),TN);
    const trC=rosInst(flat(new THREE.IcosahedronGeometry(2.2,0)).translate(0,4.6,0),psMat({}),TN,true);
    for(let n=0,g2=0;n<TN&&g2<5000;g2++){const x=rand(-360,330),z=rand(-360,280);
      if(!free(x,z,4))continue;const y=meshY(x,z);
      trT.put(x,y,z,0);trC.put(x,y,z,rand(0,3),rand(.8,1.2),rand(.9,1.2),rand(.8,1.2),[0x3e6a3a,0x4a7642,0x355e34][n%3]);res(x,z,3);n++;}
    trT.done();trC.done();
    /* trees on the island too */
    for(let n=0;n<6;n++){const a=n/6*6.283+.3,x=BORAS_ISLE.x+Math.cos(a)*20,z=BORAS_ISLE.z+Math.sin(a)*20,y=meshY(x,z);
      const t=new THREE.Mesh(flat(new THREE.IcosahedronGeometry(2.4,0)),psMat({color:0x3e6a3a}));t.position.set(x,y+4.4,z);world.add(t);
      const s=new THREE.Mesh(flat(new THREE.CylinderGeometry(.16,.24,3.4,5)),psMat({color:0x4a3a2e}));s.position.set(x,y+1.7,z);world.add(s);}}
}
/** the factory's loading door: a curtain of striped fabric that rolls up onto its bolt */
function borasDoor(R,j){
  const g=new THREE.Group();g.rotation.y=Math.atan2(R.FX[j],R.FZ[j]);
  const W=2*R.hw+2.2;
  const tex=pixTex(32,32,c=>{const cols=['#c8321f','#f4f2ec','#2f62a8','#f2c81c'];
    for(let x=0;x<32;x+=4){c.fillStyle=cols[(x/4)%4];c.fillRect(x,0,4,32);}
    c.fillStyle='rgba(0,0,0,.12)';for(let y=0;y<32;y+=2)c.fillRect(0,y,32,1);
    c.fillStyle='#1e1e20';c.fillRect(0,26,32,6);c.fillStyle='#e8b020';for(let x=0;x<32;x+=8)c.fillRect(x,26,4,6);});
  const sh=new THREE.Mesh(flat(new THREE.BoxGeometry(W,6.8,.25)),psMat({map:tex}));sh.position.y=3.4;g.add(sh);g.userData.shutter=sh;
  const bolt=new THREE.Mesh(flat(new THREE.CylinderGeometry(.5,.5,W+.2,8)).rotateZ(Math.PI/2),psMat({color:0xc8321f}));bolt.position.y=7.2;g.add(bolt);g.userData.bolt=bolt;
  for(const sd of [-1,1])hoorBox(g,.5,8,.5,psMat({color:0x2a2c30}),sd*(W/2+.3),4,0);
  return g;
}
function borasDoorAnim(B,drop){
  const sh=B.mesh.userData.shutter,bo=B.mesh.userData.bolt;if(!sh)return;
  sh.scale.y=Math.max(.04,1-drop);sh.position.y=6.8-3.4*sh.scale.y;
  if(bo){const s=1+drop*.9;bo.scale.set(1,s,s);}                         /* the cloth winds onto the bolt */
}
const BORAS={m4:new THREE.Matrix4(),anim:[],cloud:null,umb:null,drip:null,drips:[],board:null,lamps:[],gutterLamp:null,gutterOut:null,water:null,digger:null};

/* ───── Borås hazards: the outlined puddles, the gutter on the canal road; rain for show ───── */
/** a puddle splash: a short hiss of white noise */
function borasSplash(vol){
  if(!actx)return;
  const t=actx.currentTime,n=actx.sampleRate*.25|0,buf=actx.createBuffer(1,n,actx.sampleRate),d=buf.getChannelData(0);
  for(let i=0;i<n;i++)d[i]=(Math.random()*2-1)*(1-i/n);
  const s=actx.createBufferSource(),f=actx.createBiquadFilter(),g=actx.createGain();
  s.buffer=buf;f.type='bandpass';f.frequency.value=1800;g.gain.value=.18*(vol||1);
  s.connect(f);f.connect(g);g.connect(audioOutput());s.start(t);
}
/** a white dashed outline round an ellipse: the sign that this water is slippery */
function borasOutline(a,b){
  const g=new THREE.Group(),m=psMat({color:0xf4f2ec,unlit:true});
  for(let n=0;n<20;n++){if(n%2)continue;const t0=n/20*6.283,t1=(n+1)/20*6.283;
    const x0=Math.sin(t0)*b,z0=Math.cos(t0)*a,x1=Math.sin(t1)*b,z1=Math.cos(t1)*a;
    const d=new THREE.Mesh(new THREE.PlaneGeometry(.3,Math.hypot(x1-x0,z1-z0)).rotateX(-Math.PI/2),m);
    d.position.set((x0+x1)/2,0,(z0+z1)/2);d.rotation.y=Math.atan2(x1-x0,z1-z0);g.add(d);}
  return hoorMerge(g);
}
function hazardsBoras(H){
  const inPool=(k,i,lat,a,b)=>{                        /* inside an ellipse laid along the road at sample i */
    if(k.rib||k.air)return false;
    const dx=k.x-(sx[i]+rx[i]*lat),dz=k.z-(sz[i]+rz[i]*lat);
    const f=dx*fx[i]+dz*fz[i],l=dx*rx[i]+dz*rz[i];
    return (f*f)/(a*a)+(l*l)/(b*b)<1;
  };
  const isCloud=k=>!!k.wet;                              /* Regnmolnet: ALLTID BLÖTT, it does not notice puddles */
  /* the puddles: on the inside of three corners, outlined in white; the outside line stays dry */
  const A=7,B=3.7;
  for(const i of BORAS_PUDDLES){
    const lat=-(Math.sign(scurv[i])||1)*4.5;
    const g=new THREE.Group(),q=mainPt(i,lat);g.position.set(q.x,q.y+.07,q.z);g.rotation.y=q.yaw;world.add(g);
    const pool=new THREE.Mesh(new THREE.CircleGeometry(1,16).rotateX(-Math.PI/2),psMat({color:0x4a5a6a,transparent:true,opacity:.72,depthWrite:false}));
    pool.scale.set(B,1,A);g.add(pool);
    const ol=borasOutline(A+.2,B+.2);ol.position.y=.02;g.add(ol);
    const rings=[];for(let n=0;n<3;n++){const r=new THREE.Mesh(new THREE.RingGeometry(.8,1,10).rotateX(-Math.PI/2),psMat({color:0xb8cad8,unlit:true,transparent:true,opacity:.6,depthWrite:false}));
      r.position.set(rand(-B*.5,B*.5),.03,rand(-A*.5,A*.5));g.add(r);rings.push(r);}
    H.push({id:'pöl'+i,period:1.3,phase:i*.01,mesh:g,unblockable:true,
      update(u){rings.forEach((r,n)=>{const t=(u+n/3)%1;r.scale.setScalar(.2+t*1.4);r.material.uniforms.uOpacity.value=.6*(1-t);});},
      hit(k){return inPool(k,i,lat,A,B)&&!isCloud(k);},
      effect(k){k.slick=Math.max(k.slick,.6);k.drift=0;k.charge=0;
        for(let p=0;p<10;p++)puff(k.x+rand(-1.2,1.2),k.y+rand(.2,1),k.z+rand(-1.2,1.2),.7,.78,.86,.5);
        if(k===player){toast('VATTENPÖL!');borasSplash(1);}}});
  }
  /* the gutter: a lamp blinks and the pipe gurgles, then it gushes onto the left half of the canal road for a few seconds */
  {const i=BORAS_GUTTER,lat=-4.2,a=6.5,b=3.9;
    const g=new THREE.Group(),q=mainPt(i,lat);g.position.set(q.x,q.y+.07,q.z);g.rotation.y=q.yaw;world.add(g);
    const ol=borasOutline(a+.2,b+.2);ol.position.y=.02;g.add(ol);
    const pool=new THREE.Mesh(new THREE.CircleGeometry(1,16).rotateX(-Math.PI/2),psMat({color:0x4a5a6a,transparent:true,opacity:0,depthWrite:false}));
    pool.scale.set(b,1,a);g.add(pool);
    const jet=new THREE.Mesh(flat(new THREE.BoxGeometry(.7,.35,1)),psMat({color:0xa8c4dc,unlit:true,transparent:true,opacity:.8,depthWrite:false}));world.add(jet);
    let gurgle=0;
    H.push({id:'stupränna',period:8,phase:2,mesh:g,
      update(u,dt){
        const warn=u>=.3&&u<.45,on=u>=.45&&u<.82,wet=smooth(.42,.5,u)*(1-smooth(.82,.98,u));
        pool.material.uniforms.uOpacity.value=.75*wet;
        const L=BORAS.gutterLamp;if(L)L.material.uniforms.uColor.value.setHex(warn||on?(Math.floor(clock*6)%2?0xff9a1a:0x5a3008):0x5a3008);
        const O=BORAS.gutterOut;
        if(O&&on){const tx=q.x,tz=q.z,d=Math.hypot(tx-O.x,tz-O.z);
          jet.visible=true;jet.position.set((O.x+tx)/2,(O.y+q.y)/2+.2,(O.z+tz)/2);jet.rotation.y=Math.atan2(tx-O.x,tz-O.z);jet.scale.set(1,1,d);
          if(Math.random()<dt*20)puff(tx+rand(-2,2),q.y+.3,tz+rand(-2,2),.72,.82,.92,.4);}
        else jet.visible=false;
        const near=player&&Math.hypot(player.x-q.x,player.z-q.z)<70&&state==='race';
        gurgle-=dt||0;if(near&&(warn||on)&&gurgle<=0){gurgle=warn?.22:.4;ping(warn?rand(180,320):rand(500,900),rand(90,160),.06);}
        this.on=on;
      },
      hit(k){return this.on&&inPool(k,i,lat,a,b)&&!isCloud(k);},
      effect(k){k.slick=Math.max(k.slick,.8);k.slow=Math.max(k.slow,.25);k.drift=0;k.charge=0;
        for(let p=0;p<14;p++)puff(k.x+rand(-1.2,1.2),k.y+rand(.2,1.4),k.z+rand(-1.2,1.2),.72,.82,.92,.6);
        if(k===player){toast('STUPRÄNNAN!');borasSplash(1.4);shake=Math.min(1,shake+.2);}}});
  }
  /* the rain itself: light streaks round the camera, gone when you are indoors in the factory */
  {const RN=420,pos=new Float32Array(RN*6);
    for(let n=0;n<RN;n++){const x=rand(-45,45),y=rand(-6,26),z=rand(-45,45);pos.set([x,y,z,x+.15,y+1.1,z],n*6);}
    const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.BufferAttribute(pos,3));
    const mat=new THREE.LineBasicMaterial({color:0xb8c8d8,transparent:true,opacity:.42,depthWrite:false});
    const rain=new THREE.LineSegments(geo,mat);rain.frustumCulled=false;world.add(rain);
    const T=ALTS.find(r=>r.id==='textil');
    H.push({id:'borasRegn',period:1,phase:0,mesh:rain,
      update(u,dt){
        const c=camera.position,step=Math.min(dt||0,.1),fall=26*step,drift=2.5*step;
        const inside=T&&player&&player.rib===T.idx&&player.si>(T.mouth||22)&&player.si<T.n-MERGE-8;
        mat.opacity=lerp(mat.opacity,inside?0:.42,Math.min(1,step*5));
        for(let n=0;n<RN;n++){const o=n*6;let x=pos[o]+drift,y=pos[o+1]-fall,z=pos[o+2];
          x=c.x+((((x-c.x+45)%90)+90)%90)-45;z=c.z+((((z-c.z+45)%90)+90)%90)-45;
          if(y<c.y-8)y+=34;else if(y>c.y+28)y-=34;
          pos[o]=x;pos[o+1]=y;pos[o+2]=z;pos[o+3]=x+.15;pos[o+4]=y+1.1;pos[o+5]=z;}
        geo.attributes.position.needsUpdate=true;
        /* the tiny cloud drifts to and fro over the crowd, raining on them */
        const C=BORAS.cloud;
        if(C){const s=Math.sin(clock*.25)*12;C.g.position.set(C.x+C.fx*s,C.y+Math.sin(clock*.9)*.4,C.z+C.fz*s);
          for(let n=0;n<C.n;n++){const t=((clock*1.6+n/C.n*7.3)%1),px=Math.sin(n*12.9)*1.6,pz=Math.cos(n*7.7)*1.2,py=-1-t*14;
            C.pos.set([px,py,pz,px,py-.9,pz],n*6);}
          C.geo.attributes.position.needsUpdate=true;}
        /* the board flickers; it never changes */
        const Bd=BORAS.board;if(Bd)Bd.material.uniforms.uOpacity.value=Math.random()<.06?.25:1;
        /* water drips off the sculpture's rim; work lights hum; the digger nods */
        const D=BORAS.drip;
        if(D){for(let n=0;n<BORAS.drips.length;n++){const [x,z,y0,ph]=BORAS.drips[n],t=(clock*.8+ph)%1;
          D.setMatrixAt(n,BORAS.m4.makeTranslation(x,y0-t*17,z));}
          D.count=BORAS.drips.length;D.instanceMatrix.needsUpdate=true;}
        if(BORAS.digger)BORAS.digger.rotation.x=-.5+Math.sin(clock*.7)*.25;
        for(const l of BORAS.lamps)l.material.uniforms.uColor.value.setHex(Math.random()<.02?0xb8a050:0xffe68a);
      }});
  }
}

/** the stage's postcard, for the picnic passport: the whole field squeezed under one absurdly
    small umbrella in the rain. Drawn on a 192 x 120 canvas, shown pixelated. */
function borasPostcard(g,w,h){
  const R=(c,x,y,a,b)=>{g.fillStyle=c;g.fillRect(x,y,a,b);};
  const sky=g.createLinearGradient(0,0,0,70);sky.addColorStop(0,'#5c6a7a');sky.addColorStop(1,'#a8b4c0');
  g.fillStyle=sky;g.fillRect(0,0,w,70);
  for(let x=0;x<w;x+=22){const t=18+((x*13)%20);R(x%44?'#6a5a52':'#7c4a3a',x,70-t,20,t);              /* the town: brick and plaster */
    for(let y=72-t;y<66;y+=6)for(let wx=x+3;wx<x+18;wx+=5)R('#d8c890',wx,y,2,3);}
  R('#363a40',0,70,w,50);g.fillStyle='rgba(150,166,186,.25)';for(let n=0;n<16;n++)g.fillRect((n*29)%w,74+(n*7)%40,10+(n%3)*6,1);
  R('#4a5a6a',10,100,70,10);R('#4a5a6a',120,92,60,8);                                                    /* puddles */
  /* the field, six karts squeezed together */
  const cols=['#2f62a8','#6e1f2c','#f2c81c','#3f8a3a','#c8321f','#8a4fa8'];
  cols.forEach((c,n)=>{const x=50+n*16,y=90+(n%2)*6;R('#1e2022',x,y+10,4,4);R('#1e2022',x+10,y+10,4,4);R(c,x-1,y+3,16,8);R('#e8bc98',x+5,y-2,5,5);R('#22242a',x+5,y-3,5,2);});
  /* the tiny umbrella, over the middle two */
  R('#6a3a22',96,62,1,30);g.fillStyle='#c8321f';g.beginPath();g.moveTo(84,64);g.quadraticCurveTo(96,50,109,64);g.fill();
  R('#f4f2ec',94,56,4,1);
  /* the rain, everywhere except under the umbrella */
  g.strokeStyle='rgba(200,215,230,.75)';g.lineWidth=1;g.beginPath();
  for(let n=0;n<130;n++){const x=(n*37)%w,y=(n*53)%118;if(x>82&&x<111&&y>58&&y<100)continue;g.moveTo(x,y);g.lineTo(x-2,y+6);}
  g.stroke();
  /* the stamp corner and the greeting */
  R('#f4efe2',156,92,30,22);R('#5c6a7a',158,94,26,18);R('#c8321f',165,98,12,4);R('#6a3a22',171,102,1,7);
  g.fillStyle='#fff';g.font='bold 11px "Titillium Web",sans-serif';g.textAlign='left';g.fillText('Hälsningar från Borås!',6,14);
  g.lineWidth=2;g.strokeStyle='#fff';g.strokeRect(1,1,w-2,h-2);
}
