"use strict";
/* ───────── dust ───────── */
const PMAX=300;
const pPos=new Float32Array(PMAX*3),pCol=new Float32Array(PMAX*3);
const pLife=new Float32Array(PMAX),pVel=new Float32Array(PMAX*3);
let pHead=0;
for(let i=0;i<PMAX;i++)pPos[i*3+1]=-9999;
const pGeo=new THREE.BufferGeometry();
pGeo.setAttribute('position',new THREE.BufferAttribute(pPos,3));
pGeo.setAttribute('color',new THREE.BufferAttribute(pCol,3));
const points=new THREE.Points(pGeo,new THREE.PointsMaterial({
  size:1.7,sizeAttenuation:true,vertexColors:true,transparent:true,opacity:.6,depthWrite:false}));
scene.add(points);
function puff(x,y,z,r,g,b,life){
  const i=pHead;pHead=(pHead+1)%PMAX;
  pPos[i*3]=x;pPos[i*3+1]=y;pPos[i*3+2]=z;
  pVel[i*3]=rand(-1.4,1.4);pVel[i*3+1]=rand(1,2.8);pVel[i*3+2]=rand(-1.4,1.4);
  pCol[i*3]=r;pCol[i*3+1]=g;pCol[i*3+2]=b;pLife[i]=life;
}
function stepParticles(dt){
  for(let i=0;i<PMAX;i++){
    if(pLife[i]<=0)continue;
    pLife[i]-=dt;
    if(pLife[i]<=0){pPos[i*3+1]=-9999;continue;}
    pPos[i*3]+=pVel[i*3]*dt;pPos[i*3+1]+=pVel[i*3+1]*dt;pPos[i*3+2]+=pVel[i*3+2]*dt;
    pVel[i*3+1]-=1.5*dt;
  }
  pGeo.attributes.position.needsUpdate=true;
  pGeo.attributes.color.needsUpdate=true;
}
