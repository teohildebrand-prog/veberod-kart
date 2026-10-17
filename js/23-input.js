"use strict";
/* ───────── input ───────── */
const keys=Object.create(null);
const input={throttle:0,brake:0,steer:0,drift:false};
const touch={l:false,r:false,a:false,b:false,d:false};
addEventListener('keydown',e=>{
  const k=e.key.toLowerCase();
  if(['arrowup','arrowdown','arrowleft','arrowright',' '].includes(k))e.preventDefault();
  keys[k]=true;
  if(state==='select'&&!sheetStages.classList.contains('hide')){
    if(k>='1'&&k<='5')applyStage(+k-1);
    if(k==='enter'||k===' '){bootAudio();showSelect();}
  }else if(state==='select'){
    if(k==='arrowleft'||k==='a')applyCharacter((charSel+CHARS.length-1)%CHARS.length);
    if(k==='arrowright'||k==='d')applyCharacter((charSel+1)%CHARS.length);
    if(k>='1'&&k<='4')applyCar(+k-1);
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
function readInput(){
  const up=keys['w']||keys['arrowup'],dn=keys['s']||keys['arrowdown'];
  const lf=keys['a']||keys['arrowleft'],rt=keys['d']||keys['arrowright'];
  input.throttle=(up||touch.a)?1:0;
  input.brake=(dn||touch.b)?1:0;
  input.steer=((lf||touch.l)?1:0)-((rt||touch.r)?1:0);
  input.drift=!!(keys[' ']||keys['shift']||touch.d);
}
