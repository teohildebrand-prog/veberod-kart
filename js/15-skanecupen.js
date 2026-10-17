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
  {id:'gold',name:'GULDKANNAN',color:0xd4a62a,unlock:'gold'}];
let paintSel=SAVE.paint;
function paintColor(ci){const P=PAINTS.find(p=>p.id===paintSel&&p.id&&SAVE.unlock[p.unlock]);return P?P.color:CHARS[ci].color;}
let charSel=0, carSel=0, playerRig=null, previewChar=null, previewOn=false;
const rigCache=new Map();                 /* char+car -> rig, so hovering is instant */
function rigFor(ci,ri){
  const key=ci+':'+ri+':'+paintColor(ci);
  let v=rigCache.get(key);
  if(!v){v=buildKart(paintColor(ci),CHARS[ci].id,CARS[ri].id);v.root.visible=false;
         scene.add(v.root);rigCache.set(key,v);}
  return v;
}
/** show whichever driver is being previewed, falling back to the chosen one */
function showRig(){
  const ci=previewChar==null?charSel:previewChar;
  const v=rigFor(ci,carSel);
  if(playerRig&&playerRig!==v)playerRig.root.visible=false;
  v.root.visible=true;playerRig=v;player.v=v;
  player.color=CHARS[charSel].color;
  player.name=CHARS[charSel].short;
  karts[1].name=CHARS[charSel].id==='cow'?'STJÄRNA':ROSTER[1].name;   /* only one Majros */
  renderCombo();
  const tag=document.getElementById('ptag');
  if(tag){
    tag.textContent=CHARS[ci].name+(previewChar!=null&&previewChar!==charSel?' — FÖRHANDSVISNING':'');
    tag.className=previewChar!=null&&previewChar!==charSel?'ptag peek':'ptag';
  }
}
function applyCharacter(i){
  charSel=i;previewChar=null;showRig();
  document.querySelectorAll('#cards .card').forEach((el,n)=>el.classList.toggle('sel',n===i));
  const b=document.getElementById('cblurb');if(b)b.textContent=CHARS[i].blurb;
}
function peekCharacter(i){                /* hover/focus: look, don't commit */
  if(!previewOn||previewChar===i)return;
  previewChar=i;showRig();
  const b=document.getElementById('cblurb');if(b)b.textContent=CHARS[i].blurb;
}
function unpeek(){
  if(previewChar==null)return;
  previewChar=null;showRig();
  const b=document.getElementById('cblurb');if(b)b.textContent=CHARS[charSel].blurb;
}
const COMBO=[
  {k:'FART', lo:36,   hi:49.5, f:(c,M)=>c.maxSpeed*M.maxSpeed},
  {k:'ACC',  lo:23,   hi:30.5, f:(c,M)=>c.power*M.power},
  {k:'GREPP',lo:7,    hi:12.8, f:(c,M)=>c.gripOn*M.gripOn},
  {k:'ÅKER', lo:0.34, hi:0.96, f:(c,M)=>Math.min(.95,c.offRoad*M.offRoad)},
  {k:'TANK', lo:0.68, hi:1.12, f:(c,M)=>1/M.burn}
];
function renderCombo(){
  const host=document.getElementById('combo');if(!host)return;
  const c=CHARS[previewChar==null?charSel:previewChar], M=CARS[carSel].mul;
  host.innerHTML=COMBO.map(b=>{
    const v=clamp((b.f(c,M)-b.lo)/(b.hi-b.lo),0.05,1);
    return '<div class="bar"><span>'+b.k+'</span><i><b style="width:'+
           Math.round(v*100)+'%"></b></i></div>';
  }).join('');
}
function applyCar(i){
  carSel=i;showRig();renderCombo();
  document.querySelectorAll('#carcards .card').forEach((el,n)=>el.classList.toggle('sel',n===i));
  const b=document.getElementById('carblurb');if(b)b.textContent=CARS[i].blurb;
}
applyCharacter(0);

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
    k.vx=k.vz=0;k.vy=0;k.air=false;k.airT=0;k.lap=0;k.cp=0;k.prev=s;k.progress=s;
    k.drift=0;k.charge=0;k.dstage=0;k.boost=0;k.slow=0;k.itemBias=0;k.lean=0;k.spin=0;k.speed=0;
    k.lapStart=0;k.best=null;k.total=null;k.done=false;
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
      k.burn=M.burn;k.spinResist=M.spinResist||1;
    }
    k.milk=k.ai?1:(CHARS[charSel].milk||1);
    k.y=groundAt(k.x,k.z,s);
    k.v.root.position.set(k.x,k.y,k.z);
  });
}
