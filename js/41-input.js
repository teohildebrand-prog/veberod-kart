"use strict";
/* ───────── input ───────── */
const keys=Object.create(null);
const input={throttle:0,brake:0,steer:0,drift:false};
const touch={b:false,d:false,stickSteer:0,auto:isTouch&&matchMedia('(pointer:coarse)').matches,go:false};   /* auto: the phone pads are in use, so gas is automatic */
addEventListener('keydown',e=>{
  const k=e.key.toLowerCase();
  if(nameKeys(e))return;                  /* typing a name: letters are letters, not shortcuts */
  if(['arrowup','arrowdown','arrowleft','arrowright',' '].includes(k))e.preventDefault();
  if(stageKeys(e,k))return;               /* the stage picker has its own keys, V and Esc included */
  keys[k]=true;
  if(state==='select'){
    const g=GRID.indexOf(charSel),mv=d=>{unpeek();     /* step over locked champions */
      let n=g;do n=(n+d+GRID.length)%GRID.length;while(n!==g&&!charOpen(GRID[n]));
      applyCharacter(GRID[n]);ping(700,980,.04);};
    if(vsTwoStep()&&vsStep==='car'){       /* the phone's vehicle step: arrows flip through vehicles */
      if(k==='arrowleft'||k==='a'||k==='arrowup'||k==='w')stepCar(-1);
      if(k==='arrowright'||k==='d'||k==='arrowdown'||k==='s')stepCar(1);
    }else{
      if(k==='arrowleft'||k==='a')mv(-1);
      if(k==='arrowright'||k==='d')mv(1);
      if(k==='arrowup'||k==='w')mv(-gridCols());
      if(k==='arrowdown'||k==='s')mv(gridCols());
    }
    if(k==='q')stepCar(-1);
    if(k==='e')stepCar(1);
    if(k.length===1&&k>='1'&&k<='9')applyCar(FREECARS[+k-1]);
    if(k==='backspace')document.getElementById('btnBack').click();
    if(k==='enter'||k===' '){bootAudio();goFromSelect();}
  }else if((state==='menu'||state==='over')&&k==='enter'&&
           !(document.activeElement&&document.activeElement.tagName==='BUTTON')){
    const sh=document.querySelector('.sheet:not(.hide)'),b=sh&&sh.querySelector('.go:not([hidden])');
    if(b){bootAudio();b.click();}
  }
  if(k==='escape'||k==='p')setPause(!paused);
  if(k==='e'&&state==='race'&&!paused)useItem(player);
  if(k==='h'&&(state==='race'||state==='grid')&&!paused&&!e.repeat)honk();
  if(k==='t'&&!paused&&!e.repeat)askRecover(player);
  if(k==='r'&&state!=='menu'&&state!=='select'&&!(CUP&&state==='over'))resetRace();
  if(k==='c')camMode=(camMode+1)%3;
  if(k==='m')toggleAudio();
  if(k==='v')document.getElementById('crt').classList.toggle('off');
  bootAudio();
},{passive:false});
addEventListener('keyup',e=>{keys[e.key.toLowerCase()]=false;});
addEventListener('blur',()=>{for(const k in keys)keys[k]=false;});
/* ── phone controls: every finger is tracked by its own pointerId, so a steering thumb and
   a drift thumb never fight; left thumb is an analog stick, gas is automatic, the right
   thumb has BROMS, SLADD and ANVÄND (and can slide between BROMS and SLADD) ── */
const PADS=document.getElementById('pads'),ZONE=document.getElementById('stickzone');
const STICK=document.getElementById('stick'),KNOB=document.getElementById('knob');
const fingers=new Map();                  /* pointerId -> 'stick' | 'b' | 'd' */
let stickX0=0,stickY0=0;
function padRole(el){return el&&el.closest?(el.closest('#pB')?'b':el.closest('#pD')?'d':null):null;}
function syncPads(){
  touch.b=touch.d=false;touch.steer=0;
  for(const r of fingers.values())if(r==='b'||r==='d')touch[r]=true;
  document.getElementById('pB').classList.toggle('down',touch.b);
  document.getElementById('pD').classList.toggle('down',touch.d);
}
function steerTo(x){
  const R=STICK.offsetWidth*0.36,dx=clamp(x-stickX0,-R,R),n=dx/R;
  KNOB.style.transform='translateX('+dx.toFixed(1)+'px)';
  const a=Math.abs(n);                     /* small dead zone, then proportional, full lock before the rim */
  touch.stickSteer=a<0.1?0:-Math.sign(n)*Math.min(1,(a-0.1)/0.75);
}
function padDown(e){
  if(e.pointerType==='mouse'&&e.button!==0)return;
  e.preventDefault();bootAudio();touch.auto=true;
  if(state==='race')touch.go=true;
  if(e.currentTarget===ZONE){
    for(const [id,r] of fingers)if(r==='stick')return;    /* one steering thumb at a time */
    fingers.set(e.pointerId,'stick');
    const zr=ZONE.getBoundingClientRect(),sr=STICK.getBoundingClientRect();
    let cx=sr.left+sr.width/2,cy=sr.top+sr.height/2;
    if(Math.hypot(e.clientX-cx,e.clientY-cy)>sr.width/2){     /* landed outside the ring: the stick comes to the thumb */
      STICK.style.left=(e.clientX-zr.left-sr.width/2)+'px';
      STICK.style.top=(e.clientY-zr.top-sr.height/2)+'px';STICK.style.bottom='auto';
      cx=e.clientX;cy=e.clientY;
    }
    stickX0=cx;stickY0=cy;STICK.classList.add('down');steerTo(e.clientX);
  }else if(e.currentTarget.id==='pF'){
    e.currentTarget.classList.add('down');useItem(player);
    fingers.set(e.pointerId,'f');
  }else fingers.set(e.pointerId,padRole(e.currentTarget));
  try{e.currentTarget.setPointerCapture(e.pointerId);}catch(_){}
  syncPads();
}
function padMove(e){
  const r=fingers.get(e.pointerId);if(!r)return;
  e.preventDefault();
  if(r==='stick')steerTo(e.clientX);
  else if(r==='b'||r==='d'){                 /* slide BROMS <-> SLADD without lifting */
    const n=padRole(document.elementFromPoint(e.clientX,e.clientY));
    if(n&&n!==r){fingers.set(e.pointerId,n);syncPads();}
  }
}
function padUp(e){
  const r=fingers.get(e.pointerId);if(!r)return;
  fingers.delete(e.pointerId);
  if(r==='stick'){
    STICK.classList.remove('down');KNOB.style.transform='';touch.stickSteer=0;
    STICK.style.left=STICK.style.top=STICK.style.bottom='';
  }
  if(r==='f')document.getElementById('pF').classList.remove('down');
  syncPads();
}
function padsReset(){fingers.clear();touch.stickSteer=0;KNOB.style.transform='';STICK.classList.remove('down');
  STICK.style.left=STICK.style.top=STICK.style.bottom='';document.getElementById('pF').classList.remove('down');syncPads();}
for(const el of [ZONE,document.getElementById('pB'),document.getElementById('pD'),document.getElementById('pF')]){
  el.addEventListener('pointerdown',padDown);el.addEventListener('pointermove',padMove);
  el.addEventListener('pointerup',padUp);el.addEventListener('pointercancel',padUp);
  el.addEventListener('lostpointercapture',padUp);
  el.addEventListener('contextmenu',e=>e.preventDefault());
}
addEventListener('blur',padsReset);
addEventListener('pointerdown',e=>{if(e.pointerType==='touch')touch.auto=true;},true);
document.addEventListener('visibilitychange',()=>{if(document.hidden)padsReset();});
/* keep the browser's own gestures off the race: iPhone Safari ignores touch-action and
   user-scalable, so pinch, double-tap zoom and page drags are stopped at the touch events.
   Menus (sheets) still scroll and zoom normally; real buttons still get their clicks. */
const onTrack=t=>document.body.classList.contains('racing')&&!(t.closest&&t.closest('.sheet'));
const freeTap=t=>t.closest&&t.closest('button:not(.pad),input,a,.sheet');
document.addEventListener('touchstart',e=>{if(onTrack(e.target)&&(e.touches.length>1||!freeTap(e.target)))e.preventDefault();},{passive:false});
document.addEventListener('touchmove',e=>{if(onTrack(e.target)||e.touches.length>1&&!(e.target.closest&&e.target.closest('.sheet')))e.preventDefault();},{passive:false});
document.addEventListener('touchend',e=>{if(onTrack(e.target)&&!freeTap(e.target))e.preventDefault();},{passive:false});
for(const g of ['gesturestart','gesturechange','gestureend'])
  document.addEventListener(g,e=>{if(onTrack(e.target))e.preventDefault();},{passive:false});
document.addEventListener('dblclick',e=>{if(onTrack(e.target))e.preventDefault();},{passive:false});
/* the ANVÄND button wears the item slot (and its level badge) on phones */
if(isTouch){const f=document.getElementById('pF');
  f.prepend(document.getElementById('slot'));f.append(document.getElementById('lvlbadge'));}
document.getElementById('camBtn').addEventListener('click',()=>{camMode=(camMode+1)%3;});
/* phones: the first tap goes fullscreen and holds landscape where the browser allows it
   (Android Chrome; iPhone Safari has no fullscreen, add the page to the home screen instead) */
if(isTouch&&matchMedia('(pointer:coarse)').matches)addEventListener('pointerdown',function goFull(){
  removeEventListener('pointerdown',goFull);
  const el=document.documentElement,rq=el.requestFullscreen||el.webkitRequestFullscreen;
  if(!rq||document.fullscreenElement)return;
  Promise.resolve(rq.call(el,{navigationUI:'hide'})).then(()=>{
    if(screen.orientation&&screen.orientation.lock)screen.orientation.lock('landscape').catch(()=>{});
  }).catch(()=>{});
});
function readInput(){
  const up=keys['w']||keys['arrowup'],dn=keys['s']||keys['arrowdown'];
  const lf=keys['a']||keys['arrowleft'],rt=keys['d']||keys['arrowright'];
  if(up||dn||lf||rt||pad.throttle||pad.steer)touch.auto=false;   /* keyboard or controller took over */
  if(state!=='race')touch.go=false;
  /* auto-gas, held off while braking; Björn's academic quarter waits for the first touch after the lights */
  const gas=touch.auto&&!touch.b&&state==='race'&&!(player.kvart&&!touch.go)?1:0;
  input.throttle=Math.max(up?1:0,gas,pad.throttle);
  input.brake=Math.max((dn||touch.b)?1:0,pad.brake);
  input.steer=clamp((lf?1:0)-(rt?1:0)+touch.stickSteer+pad.steer,-1,1);
  if(MIRROR)input.steer=-input.steer;             /* the world is drawn flipped; the sim is not */
  input.drift=!!(keys[' ']||keys['shift']||touch.d||pad.drift);
  document.body.classList.toggle('autogas',touch.auto);
}
