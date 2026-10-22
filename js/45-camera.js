"use strict";
/* ───────── camera ───────── */
let camMode=0,shake=0,camInit=false;
/* shake is trauma: events add to it (capped at 1), the camera moves by trauma squared, so a bump barely
   stirs it and a rocket hit snaps hard. The motion is smooth noise (three detuned sines per axis) plus a
   little roll, not a fresh random offset every frame. */
const SHAKE_DECAY=1.6,SHAKE_MOVE=.6,SHAKE_ROLL=.07;
let shakeT=0,fovKick=0,camFov=camera.fov;
function wobble(t,s){return Math.sin(t+s)*.5+Math.sin(t*2.31+s*1.7)*.3+Math.sin(t*4.13+s*2.9)*.2;}
/** a quick widening of the view that springs back in about 0.2 s: the turbo's punch */
function kickFov(deg){fovKick=Math.min(10,fovKick+deg);}
/* ───────── spegelvänd: the whole scene is drawn mirrored ─────────
   The GDD planned to negate x at load. The scenery is placed by hand in world
   coordinates, so instead the sim runs unchanged and only the picture flips: the scene
   scales x by -1, the camera is mirrored to match, steering input is swapped and every
   sign with text on it is flipped back so it still reads. */
let MIRROR=false;
function setMirror(on){
  MIRROR=!!on;scene.scale.x=MIRROR?-1:1;
  world.traverse(o=>{const u=o.material&&o.material.uniforms&&o.material.uniforms.uMap;
    if(u&&u.value&&u.value.hasText)o.scale.x=Math.abs(o.scale.x)*(MIRROR?-1:1);});
}
function mirrorCam(){
  camera.position.x*=-1;const q=camera.quaternion;q.set(q.x,-q.y,-q.z,q.w);
  camera.userData.mir=!camera.userData.mir;
}
/** where the driver screen wants the kart: the #vsStage box, as its centre in NDC and its size as a
    share of the canvas; null when the box is hidden or squeezed shut */
function stageSlot(){
  const b=document.getElementById('vsStage');if(!b||!b.offsetParent)return null;
  const r=b.getBoundingClientRect(),c=canvas.getBoundingClientRect();
  if(r.width<40||r.height<40||!c.width||!c.height)return null;
  return {x:(r.left+r.width/2-c.left)/c.width*2-1,y:1-(r.top+r.height/2-c.top)/c.height*2,w:r.width/c.width,h:r.height/c.height};
}
const previewBox=new THREE.Box3(),previewBall=new THREE.Sphere();
const camPos=new THREE.Vector3(),camAim=new THREE.Vector3(),wantV=new THREE.Vector3();
function updateCamera(dt){
  const Fx=Math.sin(player.yaw),Fz=Math.cos(player.yaw);
  if(previewOn){                                   /* driver select: the kart on its turntable */
    const a=camera.aspect,t=Math.tan(20*Math.PI/180),slot=stageSlot();
    /* the kart (its bounding sphere) fills the empty slot the layout leaves for it (#vsStage), whatever the screen */
    previewBox.setFromObject(player.v.root).getBoundingSphere(previewBall);
    const R=(previewBall.radius||2.4)*.8;                 /* a kart is flatter than its sphere: fit a little tighter */
    const d=slot?clamp(Math.max(R/(t*slot.h),R/(t*a*slot.w)),5,90):(a>1.15?16:24);
    const Rx=-Fz,Rz=Fx,cx=Fx*.9+Rx*.44,cz=Fz*.9+Rz*.44,n=Math.hypot(cx,cz,.22);
    if(slot){camAim.copy(previewBall.center);
      camera.position.set(camAim.x+cx/n*d,camAim.y+.22/n*d,camAim.z+cz/n*d);}
    else{camera.position.set(player.x+cx*d,player.y+PEDESTAL+d*.22,player.z+cz*d);
      camAim.set(player.x,player.y+PEDESTAL+1.2,player.z);}
    camera.lookAt(camAim);
    camFov=camera.fov=40;camera.updateProjectionMatrix();
    if(slot){const e=camera.projectionMatrix.elements;e[8]=-slot.x;e[9]=-slot.y;}   /* lens shift: the kart lands mid-slot */
    return;
  }
  if(state==='grid'||state==='menu'||state==='select'){
    const a=clock*0.5;
    camera.position.set(player.x+Math.sin(a)*12,player.y+4.8+Math.sin(clock*.6)*.5,player.z+Math.cos(a)*12);
    camAim.set(player.x,player.y+1.3,player.z);
    camera.lookAt(camAim);
    camFov=camera.fov=lerp(camFov,58,0.08);camera.updateProjectionMatrix();
    return;
  }
  let dist,hgt,ahead;
  if(camMode===0){dist=9.6;hgt=4.3;ahead=6;}
  else if(camMode===1){dist=1.1;hgt=2.5;ahead=12;}
  else{dist=15.5;hgt=7.4;ahead=4;}
  const bx=player.x-Fx*dist,bz=player.z-Fz*dist;
  wantV.set(bx,Math.max(groundK(player,bx,bz),player.y)+hgt,bz);
  if(!camInit){camPos.copy(wantV);camInit=true;}
  const kk=1-Math.pow(0.0016,dt);
  camPos.lerp(wantV,clamp(kk*(camMode===1?1.8:1),0,1));
  camAim.lerp(wantV.set(player.x+Fx*ahead,player.y+1.5,player.z+Fz*ahead),clamp(kk*1.5,0,1));
  camera.position.copy(camPos);
  shakeT+=dt;
  let roll=0;
  if(shake>0){
    shake=Math.max(0,shake-dt*SHAKE_DECAY);
    const s=shake*shake*SHAKE_MOVE,t=shakeT*30;
    camera.position.x+=s*wobble(t,1);camera.position.y+=s*wobble(t,2);camera.position.z+=s*wobble(t,3);
    roll=shake*shake*SHAKE_ROLL*wobble(t,4);
  }
  if(!player.onRoad&&player.speed>10){
    camera.position.x+=.09*wobble(shakeT*45,5);camera.position.y+=.09*wobble(shakeT*45,6);
  }
  if(player.sfx==='cobble'&&player.speed>10)camera.position.y+=.05*wobble(shakeT*60,7);   /* cobble shake */
  camera.lookAt(camAim);
  if(roll)camera.rotateZ(roll);
  camFov=lerp(camFov,(camMode===1?66:60)+clamp(player.speed/player.maxSpeed,0,1.2)*13+(player.boost>0?(player.boostLvl>=3?10:7):0),
    1-Math.pow(0.01,dt));
  fovKick=fovKick<.01?0:fovKick*Math.exp(-dt/.2);
  camera.fov=camFov+fovKick;
  camera.updateProjectionMatrix();
}
