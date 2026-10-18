"use strict";
/* ───────── input ───────── */
const keys=Object.create(null);
const input={throttle:0,brake:0,steer:0,drift:false};
const touch={l:false,r:false,a:false,b:false,d:false};
addEventListener('keydown',e=>{
  const k=e.key.toLowerCase();
  if(nameKeys(e))return;                  /* typing a name: letters are letters, not shortcuts */
  if(['arrowup','arrowdown','arrowleft','arrowright',' '].includes(k))e.preventDefault();
  if(stageKeys(e,k))return;               /* the stage picker has its own keys, V and Esc included */
  keys[k]=true;
  if(state==='select'){
    const g=GRID.indexOf(charSel),mv=d=>{unpeek();applyCharacter(GRID[(g+d+GRID.length)%GRID.length]);ping(700,980,.04);};
    if(k==='arrowleft'||k==='a')mv(-1);
    if(k==='arrowright'||k==='d')mv(1);
    if(k==='arrowup'||k==='w')mv(-GRID_COLS);
    if(k==='arrowdown'||k==='s')mv(GRID_COLS);
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
function bindPad(el,set){
  const on=e=>{e.preventDefault();set(true);el.classList.add('down');bootAudio();};
  const off=e=>{e.preventDefault();set(false);el.classList.remove('down');};
  el.addEventListener('pointerdown',on);el.addEventListener('pointerup',off);
  el.addEventListener('pointercancel',off);el.addEventListener('pointerleave',off);
}
bindPad(document.getElementById('pL'),v=>touch.l=v);
bindPad(document.getElementById('pR'),v=>touch.r=v);
bindPad(document.getElementById('pA'),v=>touch.a=v);
bindPad(document.getElementById('pB'),v=>touch.b=v);
bindPad(document.getElementById('pD'),v=>touch.d=v);
document.getElementById('pF').addEventListener('pointerdown',e=>{
  e.preventDefault();bootAudio();useItem(player);});
document.getElementById('pH').addEventListener('pointerdown',e=>{
  e.preventDefault();bootAudio();if((state==='race'||state==='grid')&&!paused)honk();});
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
  input.throttle=Math.max((up||touch.a)?1:0,pad.throttle);
  input.brake=Math.max((dn||touch.b)?1:0,pad.brake);
  input.steer=clamp(((lf||touch.l)?1:0)-((rt||touch.r)?1:0)+pad.steer,-1,1);
  if(MIRROR)input.steer=-input.steer;             /* the world is drawn flipped; the sim is not */
  input.drift=!!(keys[' ']||keys['shift']||touch.d||pad.drift);
}
