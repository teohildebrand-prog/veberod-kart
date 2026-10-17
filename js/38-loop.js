"use strict";
/* ───────── loop ───────── */
buildWorld(stage);placeOnGrid();resize();
let prevT=performance.now(),acc=0;
const FIXED=1/120;
function frame(now){
  requestAnimationFrame(frame);
  let dt=(now-prevT)/1000;prevT=now;
  if(dt>0.1)dt=0.1;
  dbgFrame(dt);dt*=DBG.ts;                 /* debug time scale */
  if(paused){renderer.render(scene,camera);return;}   /* prevT already advanced: no jump on resume */
  clock+=dt;
  if(camera.userData.mir)mirrorCam();
  for(const t of turbines){
    if(t.yaxis)t.rot.rotation.y+=t.speed*dt;
    else t.rot.rotation.z+=t.speed*dt;
  }
  skyMesh.position.copy(camera.position);
  updateItems(dt);updateRockets(dt);updateStamps(dt);updateBlockers(dt);
  if(state!=='race'&&state!=='over')updateHazards(dt);
  if(tractorT>0){tractorT-=dt;tractor.position.y+=dt*(tractorT<0.5?2:0);if(tractorT<=0)tractor.visible=false;}
  const lamps=player.v.lamps;
  if(lamps.length===2){const on=Math.floor(clock*5)%2===0;lamps[0].visible=on;lamps[1].visible=!on;}

  if(state==='grid'){
    countdown-=dt;
    const n=Math.ceil(countdown-0.6);
    if(n!==lastBeep&&n>=0&&n<=3){lastBeep=n;flash(n===0?'KÖR!':String(n));}
    if(countdown<=0){state='race';raceTime=0;karts.forEach(k=>k.lapStart=0);
      const ln=sayLine('start');if(ln)setTimeout(()=>{if(state==='race')toast(ln);},player.kvart?2600:900);}
  }
  readInput();

  if(state==='race'||state==='over'){
    acc+=dt;let steps=0;
    while(acc>=FIXED&&steps<10){
      for(const k of karts){
        if(k.parked)continue;
        let ctl;
        if(k.ai){ctl=DBG.ai==='freeze'?AI_STOP:aiControl(k);k.aiSteer=ctl.steer;}
        else if(state==='over')ctl={throttle:0,brake:0.4,steer:input.steer*0.4,drift:false};
        else ctl=input;
        drive(k,FIXED,ctl);
      }
      separate();acc-=FIXED;steps++;
    }
    if(steps>=10)acc=0;                       /* frame-rate spiral guard */
    raceTime+=steps*FIXED;          /* sim time, and it runs on after the flag so late finishers get real times */
    checkPickups();checkStamps();updateHazards(dt);aiItemLines();
    order();
    if(cupFinishPending){cupFinishPending=false;cupComplete();}
  }else{
    for(const k of karts)k.y=groundK(k,k.x,k.z);
  }

  for(const k of karts)drawKart(k);
  drawRivalTag();
  drawGhosts();
  stepParticles(dt);updateCamera(dt);drawHUD(dt);drawMap();audioUpdate();
  if(MIRROR)mirrorCam();
  renderer.render(scene,camera);
}
requestAnimationFrame(frame);
document.addEventListener('visibilitychange',()=>{if(!document.hidden)prevT=performance.now();});
