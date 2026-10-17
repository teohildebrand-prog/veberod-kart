"use strict";
/* ───────── renderer @ PS1 resolution ───────── */
const canvas=document.getElementById('gl');
const isTouch=('ontouchstart'in window)||navigator.maxTouchPoints>0;
if(isTouch)document.body.classList.add('touch');

let renderer;
try{renderer=new THREE.WebGLRenderer({canvas,antialias:false,powerPreference:'high-performance'});}
catch(e){fail('INGEN WEBGL');throw new Error('INGEN WEBGL');}
renderer.setPixelRatio(1);
renderer.autoClear=true;

const BUDGET=320*240;                       // PS1 framebuffer budget
const RES=new THREE.Vector2(320,240);
function resize(){
  const a=Math.max(innerWidth,1)/Math.max(innerHeight,1);
  let h=Math.round(Math.sqrt(BUDGET/a)), w=Math.round(h*a);
  h=clamp(h,150,420); w=clamp(w,150,560);
  RES.set(w,h);
  renderer.setSize(w,h,false);
  camera.aspect=a;camera.updateProjectionMatrix();
}

const scene=new THREE.Scene();
const camera=new THREE.PerspectiveCamera(62,1,.5,1400);
addEventListener('resize',resize);
