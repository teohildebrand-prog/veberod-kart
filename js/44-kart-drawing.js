"use strict";
/* ───────── kart drawing ───────── */
const PEDESTAL=.55;
const pedestal=(function(){
  const tex=pixTex(32,8,g=>{for(let x=0;x<32;x+=4)for(let y=0;y<8;y+=4){
    const v=110+((x*7+y*13)%5)*14;g.fillStyle='rgb('+v+','+(v-4)+','+(v-12)+')';g.fillRect(x,y,4,4);}
    g.fillStyle='rgba(30,30,36,.5)';for(let x=0;x<32;x+=8)g.fillRect(x,0,1,8);});
  const g=new THREE.Group();
  const side=new THREE.Mesh(flat(new THREE.CylinderGeometry(3.4,3.6,1.6,14)),psMat({map:tex}));side.position.y=-.25;g.add(side);
  const top=new THREE.Mesh(flat(new THREE.CylinderGeometry(3.3,3.3,.06,14)),psMat({color:0x6e7078}));top.position.y=PEDESTAL;g.add(top);
  g.visible=false;scene.add(g);return g;
})();
const upV=new THREE.Vector3(0,1,0),nV=new THREE.Vector3(),
      qTilt=new THREE.Quaternion(),qYaw=new THREE.Quaternion();
function drawKart(k){
  if(k.parked)return;
  if(previewOn&&k!==player){k.v.root.visible=false;k.blob.visible=false;return;}
  const h=1.6;
  nV.set(groundK(k,k.x-h,k.z)-groundK(k,k.x+h,k.z),2*h,
         groundK(k,k.x,k.z-h)-groundK(k,k.x,k.z+h)).normalize();
  const turn=k===player&&previewOn;               /* on the turntable: level, slowly spinning */
  qTilt.setFromUnitVectors(upV,turn?upV:nV);
  qYaw.setFromAxisAngle(upV,k.yaw+(turn?clock*0.6+2.4:0));
  k.v.root.position.set(k.x,k.y+(turn?PEDESTAL:0),k.z);
  if(k===player){pedestal.visible=turn;if(turn)pedestal.position.set(k.x,k.y,k.z);}
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
  drawShield(k);
  if(k.rattle>0||(k.boost>0&&k.boostLvl>=3))       /* beans or cream: the whole kart shakes */
    k.v.root.position.add(nV.set(rand(-.07,.07),rand(0,.08),rand(-.07,.07)));
  const dt=clamp(clock-(k.v.at==null?clock:k.v.at),0,.1);k.v.at=clock;
  for(const f of k.v.anim)f(k,dt);               /* each vehicle's own moving prop */
  k.blob.scale.setScalar(clamp(1-Math.max(0,k.y-gy)*0.045,0.4,1));
  k.v.lean.rotation.x=k.air?clamp(-k.vy*0.024,-0.42,0.42)
                           :lerp(k.v.lean.rotation.x,k.wheelie&&k.boost>0?-0.3:0,0.22);
  k.v.lean.position.y=k.wheelie?Math.max(0,-Math.sin(k.v.lean.rotation.x))*1.1:0;
}
