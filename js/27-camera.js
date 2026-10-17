"use strict";
/* ───────── camera ───────── */
let camMode=0,shake=0,camInit=false;
const camPos=new THREE.Vector3(),camAim=new THREE.Vector3(),wantV=new THREE.Vector3();
function updateCamera(dt){
  const Fx=Math.sin(player.yaw),Fz=Math.cos(player.yaw);
  if(previewOn){                                   /* driver preview: close orbit */
    const a=clock*0.45, d=4.8;
    camera.position.set(player.x+Math.sin(a)*d,
                        player.y+2.7+Math.sin(clock*.5)*.16,
                        player.z+Math.cos(a)*d);
    camAim.set(player.x,player.y+1.58,player.z);
    camera.lookAt(camAim);
    camera.fov=lerp(camera.fov,44,0.10);camera.updateProjectionMatrix();
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
  camera.lookAt(camAim);
  camera.fov=lerp(camera.fov,(camMode===1?66:60)+clamp(player.speed/player.maxSpeed,0,1.2)*13+(player.boost>0?7:0),
    1-Math.pow(0.01,dt));
  camera.updateProjectionMatrix();
}
