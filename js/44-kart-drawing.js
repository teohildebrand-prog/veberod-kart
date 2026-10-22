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
/* the body's knocks: a damped spring per axis (nose-up pitch, roll, squash) on top of the drawn pose.
   Stiff and under-damped, so a kick overshoots once and settles in about 0.4 s. Looks only, never physics.
   The damping keeps 0.58 of a plain kick's swing, so BODY_W scales the kick up to make its peak the asked size. */
const BODY_K=260,BODY_C=14,BODY_W=Math.sqrt(BODY_K)/0.58;
/** knock k's body: each argument is roughly the peak it reaches (radians, or a share of height for the squash) */
function bodyKick(k,pitch,roll,squash){
  const b=k.body||(k.body={p:0,vp:0,r:0,vr:0,s:0,vs:0});
  b.vp+=pitch*BODY_W;b.vr+=roll*BODY_W;b.vs+=squash*BODY_W;
}
function stepBody(b,dt){
  for(let t=dt;t>1e-6;t-=1/120){                  /* small steps: the spring is too stiff for a 0.1 s frame */
    const h=Math.min(t,1/120);
    b.vp-=(BODY_K*b.p+BODY_C*b.vp)*h;b.p+=b.vp*h;
    b.vr-=(BODY_K*b.r+BODY_C*b.vr)*h;b.r+=b.vr*h;
    b.vs-=(BODY_K*b.s+BODY_C*b.vs)*h;b.s+=b.vs*h;
  }
}
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
  const dt=clamp(clock-(k.v.at==null?clock:k.v.at),0,.1);k.v.at=clock;
  const b=k.body;if(b)stepBody(b,dt);
  k.v.lean.rotation.z=k.lean+(b?b.r:0);
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
  for(const f of k.v.anim)f(k,dt);               /* each vehicle's own moving prop */
  k.blob.scale.setScalar(clamp(1-Math.max(0,k.y-gy)*0.045,0.4,1));
  k.pitch=k.air?clamp(-k.vy*0.024,-0.42,0.42)
               :lerp(k.pitch||0,k.wheelie&&k.boost>0?-0.3:0,0.22);
  k.v.lean.rotation.x=k.pitch+(b?b.p:0);
  k.v.lean.position.y=k.wheelie?Math.max(0,-Math.sin(k.pitch))*1.1:0;
  if(b){const y=1-clamp(b.s,-.2,.3),xz=1/Math.sqrt(y);k.v.lean.scale.set(xz,y,xz);}   /* volume kept: squat and bulge */
}
