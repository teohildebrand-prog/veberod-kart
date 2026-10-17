"use strict";
/* ───────── save: one versioned key, every touch wrapped ───────── */
const SAVE_KEY='vk.save.v1';
let saveOK=true;
function freshSave(){return {v:1,stamps:{},trophies:{},unlock:{},paint:null,cup:null,ghosts:{},pennant:null,pennantOn:true,part:null};}
const SAVE=(function(){
  try{
    localStorage.setItem('vk.probe','1');localStorage.removeItem('vk.probe');
    const o=JSON.parse(localStorage.getItem(SAVE_KEY)||'null');
    if(o&&o.v===1)return Object.assign(freshSave(),o);
  }catch(e){saveOK=false;}
  return freshSave();
})();
function writeSave(){
  try{localStorage.setItem(SAVE_KEY,JSON.stringify(SAVE));saveOK=true;}catch(e){saveOK=false;}
}
