"use strict";
/* ───────── minimap ───────── */
const mapCv=document.getElementById('map'),mctx=mapCv.getContext('2d');
let MB={x0:-1,x1:1,z0:-1,z1:1};
function computeMB(){
  let x0=Infinity,x1=-Infinity,z0=Infinity,z1=-Infinity;
  for(let i=0;i<N;i++){x0=Math.min(x0,sx[i]);x1=Math.max(x1,sx[i]);z0=Math.min(z0,sz[i]);z1=Math.max(z1,sz[i]);}
  MB={x0:x0-22,x1:x1+22,z0:z0-22,z1:z1+22};
}
function mapXY(x,z){
  const W=mapCv.width,H=mapCv.height;
  const s=Math.min(W/(MB.x1-MB.x0),H/(MB.z1-MB.z0));
  return [(x-MB.x0)*s+(W-(MB.x1-MB.x0)*s)/2,(z-MB.z0)*s+(H-(MB.z1-MB.z0)*s)/2];
}
function drawMap(){
  const W=mapCv.width,H=mapCv.height;
  mctx.clearRect(0,0,W,H);
  mctx.beginPath();
  for(let i=0;i<=N;i+=8){const q=mapXY(sx[i%N],sz[i%N]);i===0?mctx.moveTo(q[0],q[1]):mctx.lineTo(q[0],q[1]);}
  mctx.closePath();
  mctx.strokeStyle='#e8eef2';mctx.lineWidth=3;mctx.stroke();
  mctx.setLineDash([2,2]);mctx.lineWidth=2;mctx.strokeStyle='#f2dfa6';
  for(const R of ALTS){
    mctx.beginPath();
    for(let j=0;j<R.n;j+=3){const q=mapXY(R.X[j],R.Z[j]);j===0?mctx.moveTo(q[0],q[1]):mctx.lineTo(q[0],q[1]);}
    const e=mapXY(R.X[R.n-1],R.Z[R.n-1]);mctx.lineTo(e[0],e[1]);mctx.stroke();
  }
  mctx.setLineDash([]);
  const L=mapXY(sx[0],sz[0]);
  mctx.fillStyle='#fecc02';mctx.fillRect(L[0]-2,L[1]-2,4,4);
  for(const k of karts){
    const q=mapXY(k.x,k.z);
    mctx.fillStyle='#'+k.color.toString(16).padStart(6,'0');
    const s=k===player?4:3;
    mctx.fillRect(Math.round(q[0]-s/2),Math.round(q[1]-s/2),s,s);
  }
}
