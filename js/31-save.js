"use strict";
/* ───────── save: one versioned key, every touch wrapped ───────── */
const SAVE_KEY='vk.save.v1';
let saveOK=true;
function freshSave(){return {v:1,stamps:{},trophies:{},unlock:{},paint:null,cup:null,ghosts:{},best:{},rec:2,legacy:null,routes:{},pennant:null,pennantOn:true,part:null,name:null};}
const SAVE=(function(){
  try{
    localStorage.setItem('vk.probe','1');localStorage.removeItem('vk.probe');
    const o=JSON.parse(localStorage.getItem(SAVE_KEY)||'null');
    if(o&&o.v===1)return Object.assign(freshSave(),{rec:1},o);   /* a save from before rec counts as 1 */
  }catch(e){saveOK=false;}
  return freshSave();
})();
/* rec: the handling the lap records were set with. The vehicle rework (rec 2) made older ghosts
   and times incomparable, so they move to legacy; unlocks earned with them stay */
if(SAVE.rec!==2){
  if(Object.keys(SAVE.ghosts).length||Object.keys(SAVE.best).length)SAVE.legacy={rec:SAVE.rec||1,ghosts:SAVE.ghosts,best:SAVE.best};
  SAVE.ghosts={};SAVE.best={};SAVE.rec=2;
}
function writeSave(){
  try{localStorage.setItem(SAVE_KEY,JSON.stringify(SAVE));saveOK=true;}catch(e){saveOK=false;}
}
