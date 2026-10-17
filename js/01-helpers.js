"use strict";
/* ───────── helpers ───────── */
const clamp=(v,a,b)=>v<a?a:v>b?b:v;
const lerp=(a,b,t)=>a+(b-a)*t;
const smooth=(e0,e1,x)=>{const t=clamp((x-e0)/(e1-e0),0,1);return t*t*(3-2*t);};
const wrapAng=a=>{while(a>Math.PI)a-=6.283185307;while(a<-Math.PI)a+=6.283185307;return a;};
const rand=(a,b)=>a+Math.random()*(b-a);
const hash2=(a,b)=>{const s=Math.sin(a*127.1+b*311.7)*43758.5453;return s-Math.floor(s);};
const fmt=t=>{if(t==null||!isFinite(t))return'-:--.--';const m=Math.floor(t/60),s=t-m*60;
  return m+':'+(s<10?'0':'')+s.toFixed(2);};
