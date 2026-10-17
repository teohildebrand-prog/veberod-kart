"use strict";
/* ───────── camera ───────── */
let camMode=0,shake=0,camInit=false;
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
const camPos=new THREE.Vector3(),camAim=new THREE.Vector3(),wantV=new THREE.Vector3();
function updateCamera(dt){
  const Fx=Math.sin(player.yaw),Fz=Math.cos(player.yaw);
  if(previewOn){                                   /* driver select: the kart on its turntable */
    const a=camera.aspect,wide=a>1.15,d=wide?16:24,t=Math.tan(20*Math.PI/180);
    const Rx=-Fz,Rz=Fx,cx=Fx*.9+Rx*.44,cz=Fz*.9+Rz*.44;
    camera.position.set(player.x+cx*d,player.y+PEDESTAL+d*.22,player.z+cz*d);
    /* push the kart into the gap the layout leaves: the right column, between name and panel */
    const off=wide?0.46*d*t*a:0, up=(wide?-0.12:0.02)*d*t, cRx=-cz, cRz=cx;
    camAim.set(player.x+cRx*off,player.y+PEDESTAL+1.2+up,player.z+cRz*off);
    camera.lookAt(camAim);
    camera.fov=40;camera.updateProjectionMatrix();
    return;
  }
  if(state==='grid'||state==='menu'||state==='select'){
    const a=clock*0.5;
    camera.position.set(player.x+Math.sin(a)*12,player.y+4.8+Math.sin(clock*.6)*.5,player.z+Math.cos(a)*12);
    camAim.set(player.x,player.y+1.3,player.z);
    camera.lookAt(camAim);
    camera.fov=lerp(camera.fov,58,0.08);camera.updateProjectionMatrix();
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
  if(shake>0){
    shake=Math.max(0,shake-dt*2.2);
    const s=shake*0.45;
    camera.position.x+=rand(-s,s);camera.position.y+=rand(-s,s);camera.position.z+=rand(-s,s);
  }
  if(!player.onRoad&&player.speed>10){
    camera.position.x+=rand(-.09,.09);camera.position.y+=rand(-.09,.09);
  }
  if(player.sfx==='cobble'&&player.speed>10)camera.position.y+=rand(-.05,.05);   /* cobble shake */
  camera.lookAt(camAim);
  camera.fov=lerp(camera.fov,(camMode===1?66:60)+clamp(player.speed/player.maxSpeed,0,1.2)*13+(player.boost>0?7:0),
    1-Math.pow(0.01,dt));
  camera.updateProjectionMatrix();
}
