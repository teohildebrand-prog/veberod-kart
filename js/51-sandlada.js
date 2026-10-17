"use strict";
/* ───────── sandlåda ───────── */
/* fri åkning: a main-menu mode: any track, any driver, no AI, no laps or clock, a full tank.
   It is a normal race underneath with the AI parked and LAPS out of reach. */
document.getElementById('btnFree').addEventListener('click',()=>{
  bootAudio();CUP=null;cupSetup=false;TT=false;FREE=true;showStages();});
