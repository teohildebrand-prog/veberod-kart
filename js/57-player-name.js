"use strict";
/* ───────── player name ───────── */
/* asked once on first launch, changed from NAMN on the menu. A Swedish QWERTY board for thumbs and pads
   (A types, B rubs out); a physical keyboard types straight in, and on phones TANGENTBORD (or a tap on
   the box) brings up the phone's own keyboard. Every way in goes through cleanName and NAME_MAX. */
const NAME_MAX=12;
const sheetName=document.getElementById('namn'),nameBox=document.getElementById('nameBox');
/** letters, digits, space, dot and dash only: the name goes into innerHTML in the tables */
const cleanName=s=>s.toUpperCase().replace(/[^\p{L}\p{N} .\-]/gu,'').replace(/\s+/g,' ').slice(0,NAME_MAX);
const nameTouch=isTouch&&matchMedia('(pointer:coarse)').matches;
function nameType(k){nameBox.value=k==='del'?nameBox.value.slice(0,-1):cleanName(nameBox.value+k);}
(function buildNameKeys(){
  const rows=['QWERTYUIOPÅ','ASDFGHJKLÖÄ','ZXCVBNM-.'],key=c=>'<button class="nk" data-k="'+c+'">'+c+'</button>';
  document.getElementById('nameKeys').innerHTML=rows.map(r=>'<div class="nk-row">'+[...r].map(key).join('')+'</div>').join('')+
    '<div class="nk-row nk-ctl">'+
    (nameTouch?'<button class="nk nk-w" id="nkNative" aria-label="Telefonens tangentbord">⌨ TANGENTBORD</button>':'')+
    '<button class="nk nk-w nk-sp" data-k=" ">MELLANSLAG</button>'+
    '<button class="nk nk-w" id="nkDel" data-k="del" aria-label="Sudda">⌫ SUDDA</button>'+
    '<button class="go" id="btnNameOk">KLAR</button></div>';
  document.querySelectorAll('#nameKeys .nk[data-k]').forEach(b=>b.addEventListener('click',()=>{
    bootAudio();ping(700,980,.03);nameType(b.dataset.k);}));
  document.querySelectorAll('#nameKeys .nk').forEach(b=>b.addEventListener('pointerdown',e=>{
    if(document.activeElement===nameBox)e.preventDefault();}));   /* the box keeps focus, the phone's keyboard stays up */
  const nat=document.getElementById('nkNative');
  if(nat)nat.addEventListener('click',()=>{bootAudio();       /* focus inside the tap, so iOS opens its keyboard */
    nameBox.focus();const n=nameBox.value.length;try{nameBox.setSelectionRange(n,n);}catch(e){}});
})();
nameBox.addEventListener('input',()=>{const v=cleanName(nameBox.value);if(v!==nameBox.value)nameBox.value=v;});
function showName(){
  hideSheets();state='menu';
  nameBox.value=SAVE.name||'';
  sheetName.classList.remove('hide');
  if(!matchMedia('(pointer:coarse)').matches&&!document.body.classList.contains('padnav'))nameBox.focus();
}
function saveName(){
  SAVE.name=cleanName(nameBox.value).trim();writeSave();
  nameKarts();nameBox.blur();showMenu();
}
/** a physical keyboard on the name sheet: in the box it types as usual; anywhere else on the sheet
    letters, Backspace and Enter still reach the name (Tab and the arrows keep moving focus) */
function nameKeys(e){
  if(e.target===nameBox){if(e.key==='Enter'){e.preventDefault();saveName();}return true;}
  if(sheetName.classList.contains('hide')||e.ctrlKey||e.metaKey||e.altKey)return false;
  if(e.key==='Enter'&&!(e.target.tagName==='BUTTON'))saveName();
  else if(e.key==='Backspace')nameType('del');
  else if(e.key.length===1&&cleanName(e.key)&&!(e.key===' '&&e.target.tagName==='BUTTON'))nameType(e.key);
  else return false;
  e.preventDefault();return true;
}
document.getElementById('btnNameOk').addEventListener('click',()=>{bootAudio();saveName();});
document.getElementById('btnName').addEventListener('click',()=>{bootAudio();showName();});
if(SAVE.name==null)showName();
