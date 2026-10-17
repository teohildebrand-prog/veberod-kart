"use strict";
/* ───────── pickups: mjölk & paj ───────── */
const milkTex=pixTex(64,64,(g)=>{
  g.fillStyle='#f2f4f5';g.fillRect(0,0,64,64);
  g.fillStyle='#0b56a4';g.fillRect(0,0,64,13);g.fillRect(0,51,64,13);
  g.fillStyle='#0b56a4';g.beginPath();g.arc(32,32,11,0,6.283);g.fill();
  g.fillStyle='#f2f4f5';g.beginPath();g.arc(32,30,5,0,6.283);g.fill();
  g.fillRect(30,30,4,9);
  g.fillStyle='#d8362a';g.fillRect(4,20,56,3);
});
const pieTex=pixTex(64,64,(g)=>{
  g.fillStyle='#c9a163';g.fillRect(0,0,64,64);
  g.fillStyle='#b8455c';g.beginPath();g.arc(32,32,24,0,6.283);g.fill();
  g.fillStyle='#e0b878';
  for(let i=8;i<64;i+=13){g.fillRect(i,6,5,52);g.fillRect(6,i,52,5);}
  g.fillStyle='#8a6a3c';g.beginPath();g.arc(32,32,29,0,6.283);g.lineWidth=6;
  g.strokeStyle='#a8823f';g.stroke();
});

function makeMilk(){
  const m=new THREE.Mesh(flat(new THREE.TetrahedronGeometry(.95,0)),psMat({map:milkTex}));
  m.rotation.x=.38;return m;
}
function makePie(){
  const g=new THREE.Group();
  const tin=new THREE.Mesh(flat(new THREE.CylinderGeometry(1.15,.92,.42,10)),psMat({color:0xb6bbc0}));
  tin.position.y=.21;g.add(tin);
  const top=new THREE.Mesh(flat(new THREE.CylinderGeometry(1.06,1.06,.2,10)),psMat({map:pieTex}));
  top.position.y=.5;g.add(top);
  return g;
}

const items=[];
const ITEMPOOL=['boost','boost','boost','rocket','rocket','shield','pie','pie'];
const ITEMNAME={boost:'MJÖLK',rocket:'SPETTEKAKA',shield:'ÄGGKAKA',pie:'PAJ'};
const ITEMICON={
  boost:`<svg viewBox="0 0 48 48"><defs>
    <linearGradient id="ik1" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#fff"/><stop offset=".47" stop-color="#eaf4fa"/>
      <stop offset=".47" stop-color="#cde2ef"/><stop offset="1" stop-color="#f4fafd"/></linearGradient>
    <clipPath id="ik2"><path d="M24 4 44 42 4 42Z"/></clipPath></defs>
    <path d="M24 4 44 42 4 42Z" fill="url(#ik1)" stroke="#85b1ce" stroke-width="2.2" stroke-linejoin="round"/>
    <g clip-path="url(#ik2)"><rect x="0" y="27" width="48" height="7" fill="#0b6fc4"/>
      <rect x="0" y="36.5" width="48" height="3" fill="#d8362a"/></g>
    <path d="M24 6V42" stroke="#aecde0" stroke-width="1.5"/>
    <circle cx="24" cy="20" r="4.2" fill="#0b6fc4"/></svg>`,
  rocket:`<svg viewBox="0 0 48 48"><defs>
    <linearGradient id="ik3" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#a97a2e"/><stop offset=".38" stop-color="#e6bd65"/>
      <stop offset=".6" stop-color="#f2d492"/><stop offset="1" stop-color="#a1742c"/></linearGradient>
    <clipPath id="ik4"><path d="M24 3 38 43 10 43Z"/></clipPath></defs>
    <path d="M24 3 38 43 10 43Z" fill="url(#ik3)" stroke="#87601f" stroke-width="2.2" stroke-linejoin="round"/>
    <g clip-path="url(#ik4)" stroke="#fff9ec" stroke-width="2.6" fill="none" stroke-linecap="round">
      <path d="M2 15Q24 21 46 15"/><path d="M2 24Q24 30 46 24"/><path d="M2 33Q24 39 46 33"/></g></svg>`,
  shield:`<svg viewBox="0 0 48 48"><defs>
    <radialGradient id="ik5" cx=".36" cy=".28" r=".85">
      <stop offset="0" stop-color="#fdf0bc"/><stop offset=".55" stop-color="#eccd6a"/>
      <stop offset="1" stop-color="#c2942c"/></radialGradient></defs>
    <ellipse cx="24" cy="30" rx="19" ry="13" fill="#a87c22"/>
    <ellipse cx="24" cy="25" rx="19" ry="13" fill="url(#ik5)" stroke="#9c7420" stroke-width="1.8"/>
    <g fill="#b5674a" stroke="#8a4631" stroke-width="1.1">
      <rect x="9" y="20" width="14" height="4.4" rx="1.8" transform="rotate(-13 16 22)"/>
      <rect x="25" y="17" width="14" height="4.4" rx="1.8" transform="rotate(11 32 19)"/>
      <rect x="16" y="28" width="15" height="4.4" rx="1.8" transform="rotate(-4 24 30)"/></g>
    <ellipse cx="17" cy="19" rx="7" ry="3.4" fill="#fff" opacity=".42"/></svg>`,
  pie:`<svg viewBox="0 0 48 48"><defs>
    <radialGradient id="ik6" cx=".38" cy=".3" r=".85">
      <stop offset="0" stop-color="#d79ec9"/><stop offset=".58" stop-color="#b8455c"/>
      <stop offset="1" stop-color="#8b2a40"/></radialGradient>
    <clipPath id="ik7"><ellipse cx="24" cy="24" rx="15" ry="10.5"/></clipPath></defs>
    <ellipse cx="24" cy="29" rx="20" ry="13" fill="#949aa0"/>
    <ellipse cx="24" cy="25" rx="20" ry="13" fill="#c6ccd2" stroke="#878e95" stroke-width="1.6"/>
    <ellipse cx="24" cy="24" rx="15" ry="10.5" fill="url(#ik6)"/>
    <g clip-path="url(#ik7)" stroke="#e3bd81" stroke-width="2.6" opacity=".95" stroke-linecap="round">
      <path d="M8 18 40 30"/><path d="M8 30 40 18"/><path d="M18 11 30 37"/><path d="M30 11 18 37"/></g>
    <ellipse cx="24" cy="24" rx="15" ry="10.5" fill="none" stroke="#a8823f" stroke-width="2.2"/>
    <ellipse cx="17" cy="19.5" rx="6" ry="2.6" fill="#fff" opacity=".3"/></svg>`
};
const skaneTex=pixTex(32,32,(g)=>{
  g.fillStyle='#cc0a17';g.fillRect(0,0,32,32);        /* rött fält */
  g.fillStyle='#f2c500';                              /* gult nordiskt kors */
  g.fillRect(0,13,32,6);
  g.fillRect(10,0,6,32);
});
function makeDunk(){
  const g=new THREE.Group();
  const red=psMat({color:0xcc2a1e});
  const b=new THREE.Mesh(flat(new THREE.BoxGeometry(.85,1.15,.5)),red);
  b.position.y=.58;g.add(b);
  const sp=new THREE.Mesh(flat(new THREE.CylinderGeometry(.11,.13,.5,6)),psMat({color:0x3a3f45}));
  sp.position.set(.3,1.3,0);sp.rotation.z=-.5;g.add(sp);
  const h=new THREE.Mesh(flat(new THREE.BoxGeometry(.5,.12,.14)),psMat({color:0x3a3f45}));
  h.position.y=1.22;g.add(h);
  const st=new THREE.Mesh(flat(new THREE.BoxGeometry(.5,.3,.04)),psMat({color:0xf2ece0}));
  st.position.set(0,.62,.27);g.add(st);
  return g;
}
function makeBox(){
  const g=new THREE.Group();
  g.add(new THREE.Mesh(flat(new THREE.BoxGeometry(1.5,1.5,1.5)),psMat({map:skaneTex,unlit:true})));
  return g;
}
function makeSpettekaka(){
  const g=new THREE.Group();
  const cone=new THREE.Mesh(flat(new THREE.ConeGeometry(.62,1.9,8)),psMat({color:0xc89a4e}));
  cone.position.y=.95;g.add(cone);
  for(let k=0;k<4;k++){                                /* the sugar drizzle */
    const r=.56-k*.12;
    const ring=new THREE.Mesh(flat(new THREE.TorusGeometry(r,.055,4,8)),
      psMat({color:0xf2ece0}));
    ring.rotation.x=Math.PI/2;ring.position.y=.34+k*.4;g.add(ring);
  }
  return g;
}
function makeAggkaka(){
  const g=new THREE.Group();
  const cake=new THREE.Mesh(flat(new THREE.CylinderGeometry(.95,.88,.34,10)),
    psMat({color:0xe8c866}));
  cake.position.y=.3;g.add(cake);
  for(let k=0;k<4;k++){                                /* fläsk on top */
    const b=new THREE.Mesh(flat(new THREE.BoxGeometry(.5,.1,.18)),psMat({color:0xb5674a}));
    b.position.set(Math.cos(k*1.57)*.36,.5,Math.sin(k*1.57)*.36);
    b.rotation.y=k*1.57;g.add(b);
  }
  return g;
}
const sugarMat=psMat({color:0xffffff});
function makeSugar(){
  const g=new THREE.Group();
  const c=new THREE.Mesh(flat(new THREE.BoxGeometry(.62,.62,.62)),sugarMat);
  c.rotation.set(.6,.3,.5);g.add(c);
  const c2=new THREE.Mesh(flat(new THREE.BoxGeometry(.4,.4,.4)),sugarMat);
  c2.position.set(.42,-.18,.2);c2.rotation.set(.2,.9,.1);g.add(c2);
  return g;
}
/** an item somewhere other than the main road's centreline grid, e.g. in a lane */
function addItemAt(type,x,z,y,si,lat,rib){
  const mesh=type==='sugar'?makeSugar():type==='milk'?makeMilk():makeBox();
  mesh.position.set(x,y+1.15,z);world.add(mesh);
  const o={type,si,lat,x,z,y,mesh,cool:0,base:mesh.position.y,rib:rib||0};
  items.push(o);return o;
}
function addItem(type,si,lat){
  const x=sx[si]+rx[si]*lat, z=sz[si]+rz[si]*lat, y=groundAt(x,z,si);
  const mesh=type==='fuel'?makeDunk():type==='box'?makeBox():type==='milk'?makeMilk():type==='pie'?makePie():
             type==='sugar'?makeSugar():
             type==='rocket'?makeSpettekaka():makeAggkaka();
  mesh.position.set(x,y+(type==='pie'?.04:1.15),z);
  if(type==='pie')mesh.rotation.y=rand(0,6.283);
  world.add(mesh);
  const o={type,si,lat,x,z,y,mesh,cool:0,base:mesh.position.y};
  items.push(o);return o;
}
function buildItems(){
  items.length=0;
  const off=HW*0.56;
  for(let i=40;i<N;i+=72){
    let at=i;while(!clearOfForks(at,10))at=(at+8)%N;
    for(const l of [-off,0,off])addItem('box',at,l);
  }
  for(let k=0;k<9;k++){
    let at=Math.round(N*(k+0.37)/9)%N;
    for(const J of JUMPS)                                  /* never in a landing zone */
      if(Math.min(Math.abs(at-J.at),N-Math.abs(at-J.at))<J.up+J.dn+8)at=(at+36)%N;
    if(Math.min(at,N-at)<32)at=(at+44)%N;
    while(!clearOfForks(at,6))at=(at+8)%N;
    addItem('pie',at,(hash2(k*3.7,k*1.9)*2-1)*HW*0.55);
  }
  for(let k=0;k<6;k++){                                    /* bensindunkar */
    let at=Math.round(N*(k+0.78)/6)%N;
    for(const J of JUMPS)
      if(Math.min(Math.abs(at-J.at),N-Math.abs(at-J.at))<J.up+J.dn+8)at=(at+30)%N;
    while(!clearOfForks(at,6))at=(at+8)%N;
    addItem('fuel',at,(k%2?1:-1)*HW*0.62);
  }
  /* sockerbitar: two in every lane, then the risky lines of the main road: just past
     each jump's landing and on the inside verge of the two tightest corners */
  for(const R of ALTS)for(const f of [0.35,0.7]){
    const j=Math.round(f*(R.n-1));addItemAt('sugar',R.X[j],R.Z[j],R.Y[j],R.MI[j],0,R.idx);}
  for(const J of JUMPS)addItem('sugar',(J.at+J.dn+5)%N,(hash2(J.at*.37,3.1)*2-1)*HW*0.45);
  const tight=[];
  for(let i=0;i<N;i++){
    if(Math.abs(scurv[i])<0.22||!clearOfForks(i,8))continue;
    if(Math.abs(scurv[i])<Math.abs(scurv[(i+1)%N])||Math.abs(scurv[i])<Math.abs(scurv[(i-1+N)%N]))continue;
    tight.push(i);
  }
  tight.sort((a,b)=>Math.abs(scurv[b])-Math.abs(scurv[a]));
  const used=[];
  for(const i of tight){
    if(used.length>=2)break;
    if(used.some(j=>Math.min(Math.abs(i-j),N-Math.abs(i-j))<90)||Math.min(i,N-i)<40)continue;
    if((stage.stamps||[]).some(d=>d.i==='tight')&&Math.min(Math.abs(i-tightestCorner()),N-Math.abs(i-tightestCorner()))<40)continue;
    used.push(i);addItem('sugar',(i+7)%N,-Math.sign(scurv[i])*(HW-0.6));
  }
}

function resetItems(){
  for(let n=items.length-1;n>=0;n--){
    const it=items[n];
    if(it.temp!==undefined){world.remove(it.mesh);items.splice(n,1);continue;}
    it.cool=0;it.mesh.visible=true;
  }
}

function updateItems(dt){
  for(let n=items.length-1;n>=0;n--){
    const it=items[n];
    if(it.temp!==undefined){
      it.temp-=dt;
      if(it.temp<=0){world.remove(it.mesh);items.splice(n,1);continue;}
    }
    if(it.cool>0){
      it.cool-=dt;
      if(it.cool<=0)it.mesh.visible=true; else continue;
    }
    if(it.type!=='pie'){
      it.mesh.rotation.y+=dt*2.1;
      it.mesh.rotation.x+=dt*1.3;
      it.mesh.position.y=it.base+Math.sin(clock*2.6+it.si*.37)*.2;
    }
  }
}
function checkPickups(){
  for(const it of items){
    if(it.cool>0)continue;
    const milk=it.type==='milk', r2=it.type==='pie'?4.4:6.25;
    for(const k of karts){
      const dx=k.x-it.x,dz=k.z-it.z;
      if(dx*dx+dz*dz>r2)continue;
      if(Math.abs(k.y-it.y)>3.4)continue;    /* sailing over it does not count */
      if(it.type==='fuel'){
        if(k.fuel>TANK-6)continue;                       /* already brimmed */
        k.fuel=Math.min(TANK,k.fuel+38);
        for(let p=0;p<8;p++)puff(it.x+rand(-.6,.6),it.y+rand(.3,1.2),it.z+rand(-.6,.6),.9,.3,.24,.45);
        if(k===player){toast('BENSINDUNK +38');ping(300,620,.12);}
        it.cool=11;
      }else if(it.type==='box'){
        if(k.held)continue;                              /* hands already full */
        k.held=ITEMPOOL[(Math.random()*ITEMPOOL.length)|0];
        for(let p=0;p<8;p++)puff(it.x+rand(-.7,.7),it.y+rand(.4,1.5),it.z+rand(-.7,.7),.95,.76,.2,.4);
        if(k===player){toast(ITEMNAME[k.held]+'!');ping(620,980,.10);}
        it.cool=6;
      }else if(it.type==='rocket'){
        if(k.held)continue;
        k.held='rocket';
        if(k===player){toast('SPETTEKAKA!');ping(440,760,.10);}
        it.cool=8;
      }else if(it.type==='shield'){
        k.shield=Math.max(k.shield,9*k.shieldMul);
        for(let p=0;p<12;p++)puff(it.x+rand(-.9,.9),it.y+rand(.3,1.4),it.z+rand(-.9,.9),.95,.82,.4,.5);
        if(k===player){toast('ÄGGKAKA! SKÖLD');ping(380,720,.14);}
        it.cool=9;
      }else if(it.type==='sugar'){
        if(k.sugar>=3)continue;
        k.sugar++;
        for(let p=0;p<10;p++)puff(it.x+rand(-.6,.6),it.y+rand(.3,1.4),it.z+rand(-.6,.6),1,1,1,.4);
        if(k===player){toast('SOCKERBIT '+k.sugar+'/3');ping(900,1400,.08);}
        it.cool=12;
      }else if(milk){
        k.boost=Math.max(k.boost,1.3*k.milk);k.slow=0;
        for(let p=0;p<12;p++)puff(it.x+rand(-.8,.8),it.y+rand(.3,1.5),it.z+rand(-.8,.8),1,1,1,.55);
        if(k===player){toast(k.milk>1?'EGEN MJÖLK! MUUU':'MJÖLK! FULL FART');ping(560,980,.10);if(k.milk>1)moo();}
        it.cool=7;
      }else if(it.type==='pie'&&blockHit(k)){             /* äggkakan eller skopan tar smällen */
        for(let p=0;p<14;p++)puff(it.x+rand(-1,1),it.y+rand(.3,1.3),it.z+rand(-1,1),.95,.82,.4,.6);
        it.cool=5;
      }else{
        dropSugar(k);
        k.boost=0;k.slow=1.45;k.drift=0;k.charge=0;
        for(let p=0;p<16;p++)puff(it.x+rand(-1.1,1.1),it.y+rand(.2,1.2),it.z+rand(-1.1,1.1),.88,.44,.48,.75);
        if(k===player){toast('PAJ I ANSIKTET!');ping(300,90,.22);shake=Math.min(1,shake+.45);}
        it.cool=5;
      }
      it.mesh.visible=false;
      if(it.temp!==undefined)it.temp=0.001;
      break;
    }
  }
}
