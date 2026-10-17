"use strict";
/* ───────── kart drawing ───────── */
const upV=new THREE.Vector3(0,1,0),nV=new THREE.Vector3(),
      qTilt=new THREE.Quaternion(),qYaw=new THREE.Quaternion();
function drawKart(k){
  const h=1.6;
  nV.set(groundK(k,k.x-h,k.z)-groundK(k,k.x+h,k.z),2*h,
         groundK(k,k.x,k.z-h)-groundK(k,k.x,k.z+h)).normalize();
  qTilt.setFromUnitVectors(upV,nV);
  qYaw.setFromAxisAngle(upV,k.yaw);
  k.v.root.position.set(k.x,k.y,k.z);
  k.v.root.quaternion.copy(qTilt).multiply(qYaw);
  k.v.lean.rotation.z=k.lean;
  for(const w of k.v.wheels)w.rotation.x=k.spin;
  const st=k.ai?k.aiSteer:input.steer;
  for(const p of k.v.pivots)p.rotation.y=lerp(p.rotation.y,clamp(st,-1,1)*0.45,0.3);
  const gy=groundK(k,k.x,k.z);
  k.blob.position.set(k.x,gy+0.07,k.z);
  if(k.ghost>0){k.v.root.visible=Math.floor(clock*14)%2===0;k.blink=true;}
  else if(k.blink){k.v.root.visible=true;k.blink=false;}
  k.blob.rotation.y=k.yaw;
  k.dome.visible=k.shield>0;
  if(k.shield>0){k.dome.position.set(k.x,k.y+1.15,k.z);k.dome.rotation.y+=.05;}
  k.blob.scale.setScalar(clamp(1-Math.max(0,k.y-gy)*0.045,0.4,1));
  k.v.lean.rotation.x=k.air?clamp(-k.vy*0.024,-0.42,0.42)
                           :lerp(k.v.lean.rotation.x,0,0.22);
}
