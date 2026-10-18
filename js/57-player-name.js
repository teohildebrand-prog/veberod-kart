"use strict";
/* ───────── player name ───────── */
/* asked once on first launch, changed from NAMN on the menu. Keyboard types into the box,
   touch and the pad press the letter keys (A types, B rubs out, KLAR saves). */
const NAME_MAX=12;
const sheetName=document.getElementById('namn'),nameBox=document.getElementById('nameBox');
/** letters, digits, space, dot and dash only: the name goes into innerHTML in the tables */
const cleanName=s=>s.toUpperCase().replace(/[^\p{L}\p{N} .\-]/gu,'').replace(/\s+/g,' ').slice(0,NAME_MAX);
(function buildNameKeys(){
  const rows=['ABCDEFGHIJ','KLMNOPQRST','UVWXYZÅÄÖ-'];
  document.getElementById('nameKeys').innerHTML=rows.map(r=>'<div class="nk-row">'+
    [...r].map(c=>'<button class="nk" data-k="'+c+'">'+c+'</button>').join('')+'</div>').join('')+
    '<div class="nk-row"><button class="nk nk-w" data-k=" ">MELLANSLAG</button>'+
    '<button class="nk nk-w" id="nkDel" data-k="del">⌫ SUDDA</button></div>';
  document.querySelectorAll('#nameKeys .nk').forEach(b=>b.addEventListener('click',()=>{
    bootAudio();ping(700,980,.03);
    const k=b.dataset.k;
    nameBox.value=k==='del'?nameBox.value.slice(0,-1):cleanName(nameBox.value+k);
  }));
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
/** keys while the name box has focus: Enter saves, everything else just types */
function nameKeys(e){
  if(e.target!==nameBox)return false;
  if(e.key==='Enter'){e.preventDefault();saveName();}
  return true;
}
document.getElementById('btnNameOk').addEventListener('click',()=>{bootAudio();saveName();});
document.getElementById('btnName').addEventListener('click',()=>{bootAudio();showName();});
if(SAVE.name==null)showName();
