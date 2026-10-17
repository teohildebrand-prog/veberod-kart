"use strict";
/* ───────── Skånecupen ───────── */
const CUP_ROUNDS=['veberod','lund','tollarp','ahus','bron'];
const CUP_ROLE={veberod:'Blandat underlag och de första genvägarna.',lund:'Precision och kurvtagning.',
  tollarp:'Långa raksträckor och fart.',ahus:'Hopp och jämn kontroll.',bron:'Två varv fullt ut, under press.'};
const POINTS=[10,7,5,3,2,1];
const CLASSES=[
  {id:'easy',name:'SÖNDAGSFÖRARE',sub:'LÄTT',speed:0.92,caution:1.15,band:1.08,risk:1.3,
   blurb:'Sunday drivers. The field is slower, brakes early and is wary of shortcuts. A gentle first cup.'},
  {id:'normal',name:'BYGDEMÄSTARE',sub:'NORMAL',speed:1,caution:1,band:1.16,risk:1,
   blurb:'The village champions: the AI exactly as tuned for single races. Gold here unlocks the golden churn paint.'},
  {id:'hard',name:'RIKSDAGSNIVÅ',sub:'SVÅR',speed:1.05,caution:0.90,band:1.20,risk:0.8,
   blurb:'Parliament level. Faster, braver drivers who take a muddy shortcut without blinking.'}];
let CUP=null;                              /* the cup being raced, null in single races */
function cupClass(){return CLASSES[CUP?Math.max(0,CLASSES.findIndex(c=>c.id===CUP.cls)):1];}
/* cosmetic paints: never touch handling */
const PAINTS=[{id:null,name:'ORIGINAL'},
  {id:'blue',name:'KORNBLÅ',color:0x3f63c8,unlock:'cup'},
  {id:'gold',name:'GULDKANNAN',color:0xd4a62a,unlock:'gold'},
  {id:'r1',name:'MAJROS-VIT',color:0xf0ece2,unlock:'rival1'},
  {id:'r2',name:'ROGERS RÖD',color:0x8f2f24,unlock:'rival2'},
  {id:'r3',name:'LINNÉAS SVART',color:0x1d1f24,unlock:'rival3'},
  {id:'r4',name:'NISSES TURKOS',color:0x1fa8a0,unlock:'rival4'},
  {id:'r5',name:'BRITTAS GRÖN',color:0x5faf4a,unlock:'rival5'}];
let paintSel=SAVE.paint;
function paintColor(ci){const P=PAINTS.find(p=>p.id===paintSel&&p.id&&SAVE.unlock[p.unlock]);return P?P.color:CHARS[ci].color;}
let charSel=0, carSel=0, playerRig=null, previewChar=null, previewOn=false;
const rigCache=new Map();                 /* char+car -> rig, so hovering is instant */
function rigFor(ci,ri){
  const pen=SAVE.unlock.pennant&&SAVE.pennantOn?SAVE.pennant:0, bask=stampCount()>=9;
  const key=ci+':'+ri+':'+paintColor(ci)+':'+pen+':'+bask;
  let v=rigCache.get(key);
  if(!v){v=buildKart(paintColor(ci),kindOf(CHARS[ci]),CARS[ri].id);v.root.visible=false;
         if(pen)addPennant(v,pen);if(bask)addBasket(v);
         scene.add(v.root);rigCache.set(key,v);}
  return v;
}
/** the rival's pennant on a whip aerial at the back */
function addPennant(v,color){
  const pole=new THREE.Mesh(flat(new THREE.CylinderGeometry(.03,.03,2.2,4)),psMat({color:0xd8dde2}));
  pole.position.set(.62,1.6,-1.25);v.lean.add(pole);
  const tri=new THREE.BufferGeometry();
  tri.setAttribute('position',new THREE.Float32BufferAttribute([0,0,0, 0,-.5,0, 0,-.25,-.9],3));
  const fl=new THREE.Mesh(flat(tri),psMat({color,side:THREE.DoubleSide}));
  fl.position.set(.62,2.68,-1.25);v.lean.add(fl);
}
/** nine picnic stamps: a basket strapped on behind the driver */
function addBasket(v){
  const w=psMat({color:0xb07a3a}),c=psMat({color:0xc8281c});
  const b=new THREE.Mesh(flat(new THREE.BoxGeometry(.9,.5,.6)),w);b.position.set(0,1.05,-1.35);v.lean.add(b);
  const cl=new THREE.Mesh(flat(new THREE.BoxGeometry(.94,.08,.64)),c);cl.position.set(0,1.32,-1.35);v.lean.add(cl);
  const h=new THREE.Mesh(flat(new THREE.TorusGeometry(.3,.04,4,8,Math.PI)),w);h.position.set(0,1.36,-1.35);v.lean.add(h);
}
/** show whichever driver is being previewed, falling back to the chosen one */
let lastFreeCar=0;
/** the car a driver races: their own vehicle, or the free car last picked */
function carFor(ci){const c=CHARS[ci];return c.sig?CARS.findIndex(r=>r.id===c.sig):(CARS[carSel].sig?lastFreeCar:carSel);}
function showRig(){
  const ci=previewChar==null?charSel:previewChar;
  const v=rigFor(ci,carFor(ci));
  if(playerRig&&playerRig!==v)playerRig.root.visible=false;
  v.root.visible=true;playerRig=v;player.v=v;
  player.color=CHARS[charSel].color;
  player.name=CHARS[charSel].short;
  karts.forEach((k,i)=>{if(i)k.name=ROSTER[i].name;});      /* only one of each */
  const tw=TWIN[CHARS[charSel].id];if(tw)karts[tw[0]].name=tw[1];
  renderCombo();
}
function applyCharacter(i){
  const c=CHARS[i];
  if(c.sig){if(!CARS[carSel].sig)lastFreeCar=carSel;carSel=CARS.findIndex(r=>r.id===c.sig);}
  else if(CARS[carSel].sig)carSel=lastFreeCar;
  charSel=i;previewChar=null;showRig();
}
function peekCharacter(i){                /* hover/focus: look, don't commit */
  if(!previewOn||previewChar===i)return;
  previewChar=i;showRig();
}
function unpeek(){
  if(previewChar==null)return;
  previewChar=null;showRig();
}
/* the panel's three bars: the driver's own numbers scaled by the car */
const COMBO=[['FART',(c,M)=>c.stats[0]*M.maxSpeed],['GREPP',(c,M)=>c.stats[1]*M.gripOn],['ÅKER',(c,M)=>c.stats[2]*M.offRoad]];
function renderCombo(){
  const host=document.getElementById('combo');if(!host)return;
  const ci=previewChar==null?charSel:previewChar,c=CHARS[ci],ri=carFor(ci),R=CARS[ri],M=R.mul;
  host.innerHTML=COMBO.map(([k,f])=>{
    const v=clamp(f(c,M),0.05,1),n=Math.round(v*10);
    let cells='';for(let q=0;q<10;q++)cells+='<b'+(q<n?' class="on"':'')+'></b>';
    return '<div class="vbar"><span>'+k+'</span><i>'+cells+'</i><em>'+Math.round(v*100)+'%</em></div>';
  }).join('');
  const peek=previewChar!=null&&previewChar!==charSel;
  const set=(id,t)=>{const e=document.getElementById(id);if(e)e.textContent=t;};
  set('vsName',c.name);set('vsHome',c.role);set('ptag',peek?'FÖRHANDSVISNING':'');
  set('vsCar',R.name);set('vsCarSub',c.sig?'EGET FORDON · '+R.sub:R.sub);
  set('vsQuirk',c.quirk[0]);set('vsQuirkT',c.quirk[1]);set('cblurb',c.blurb);
  set('btnGoT',cupSetup?'STARTA CUPEN':'VÄLJ '+CHARS[charSel].short);
  for(const id of ['carPrev','carNext']){const b=document.getElementById(id);if(b)b.disabled=!!c.sig;}
  document.querySelectorAll('#cards .vcard').forEach(el=>{const n=+el.dataset.i;
    el.classList.toggle('sel',n===charSel);el.classList.toggle('peek',peek&&n===ci);
    el.setAttribute('aria-selected',n===charSel);});
}
function applyCar(i){
  const sig=CHARS[charSel].sig;
  if(sig?CARS[i].id!==sig:!!CARS[i].sig)return;     /* own vehicles stay with their driver */
  carSel=i;if(!sig)lastFreeCar=i;showRig();
}
function stepCar(d){
  if(CHARS[charSel].sig)return;
  const n=FREECARS.indexOf(carSel);applyCar(FREECARS[(n+d+FREECARS.length)%FREECARS.length]);
}

/** grid slots front to back: today's order, the player last in cup round 1,
    then reverse standings so the cup leader starts at the back */
function gridOrder(){
  if(!CUP)return [0,1,2,3,4,5];
  if(!CUP.res.length)return [1,2,3,4,5,0];
  return standings(CUP).reverse();
}
function placeOnGrid(){
  const G=gridOrder(),C=cupClass();
  karts.forEach((k,i)=>{
    const g=G.indexOf(i),row=Math.floor(g/2),col=(g%2)?1:-1;
    const s=(10+row*16)%N,off=col*3.4;
    k.x=sx[s]+rx[s]*off;k.z=sz[s]+rz[s]*off;k.si=s;
    k.rib=0;k.plan=0;k.planned={};k.mi=s;k.recoverT=0;k.ghost=0;k.stuckT=0;k.stuckP=-1e9;
    k.yaw=Math.atan2(fx[s],fz[s]);
    k.vx=k.vz=0;k.vy=0;k.air=false;k.airT=0;k.lap=0;k.cp=0;k.gate=0;k.progress=s;
    k.drift=0;k.charge=0;k.dstage=0;k.boost=0;k.slow=0;k.itemBias=0;k.lean=0;k.spin=0;k.speed=0;
    k.lapStart=0;k.best=null;k.total=null;k.done=false;
    k.lineVar=k.ai?((Math.random()*3)|0)-1:0;k.wantFuel=false;k.rtp=false;k.offT=0;k.sugar=0;k.curse=0;k.hazAt=-9;
    k.lapTimes=[];k.ghostBuf=TT&&!k.ai?[]:null;k.noBand=false;
    k.parked=(TT||FREE)&&k.ai;k.v.root.visible=!k.parked;k.blob.visible=!k.parked;
    const R=k.cfg;
    k.line=k.ai?rand(-R.lineSpread,R.lineSpread):0;
    k.fuel=TANK;k.atPump=false;k.warned=0;k.held=null;k.shield=0;k.spun=0;
    k.burn=1;k.spinResist=1;
    if(k.ai){
      k.maxSpeed=R.maxSpeed*C.speed;k.power=R.power;k.offRoad=R.offRoad;
      k.boostMul=R.boostMul;k.gripOn=R.gripOn;
      k.caution=R.caution*C.caution;k.lookAdd=R.lookAdd;
      k.bandMax=C.band;k.rival=!!CUP&&CUP.rival===i;
    }
    else{
      const c=CHARS[charSel], M=CARS[carSel].mul;
      k.maxSpeed=c.maxSpeed*M.maxSpeed;k.power=c.power*M.power;
      k.offRoad=Math.min(.95,c.offRoad*M.offRoad);
      k.boostMul=c.boostMul*M.boostMul;k.gripOn=c.gripOn*M.gripOn;
      k.burn=M.burn*(c.burn||1);k.spinResist=M.spinResist||1;
    }
    const P=k.ai?null:CHARS[charSel];
    k.milk=P?(P.milk||1):1;
    k.mass=P?(P.mass||1):1;k.shieldMul=P?(P.shieldMul||1):1;
    k.bucket=!!P&&P.id==='anders';k.bucketLap=-1;
    k.kvart=!!P&&P.id==='bjorn';k.kvartCue=false;k.suck=0;k.wheelie=!!P&&P.id==='mehmet';
    k.y=groundAt(k.x,k.z,s);
    k.v.root.position.set(k.x,k.y,k.z);
  });
}
