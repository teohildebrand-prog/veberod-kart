"use strict";
/* ───────── pickups: mjölk, paj, kaffe & tårtmina ───────── */
const milkTex=pixTex(64,64,(g)=>{
  g.fillStyle='#f2f4f5';g.fillRect(0,0,64,64);
  g.fillStyle='#0b56a4';g.fillRect(0,0,64,13);g.fillRect(0,51,64,13);
  g.fillStyle='#0b56a4';g.beginPath();g.arc(32,32,11,0,6.283);g.fill();
  g.fillStyle='#f2f4f5';g.beginPath();g.arc(32,30,5,0,6.283);g.fill();
  g.fillRect(30,30,4,9);
  g.fillStyle='#d8362a';g.fillRect(4,20,56,3);
});
const pieTex=pixTex(64,64,(g)=>{
  g.fillStyle='#c9a163';g.fillRect(0,0,64,64);
  g.fillStyle='#c98a3a';g.beginPath();g.arc(32,32,24,0,6.283);g.fill();
  g.fillStyle='#f0d090';
  for(let i=8;i<64;i+=13){g.fillRect(i,6,5,52);g.fillRect(6,i,52,5);}
  g.fillStyle='#8a6a3c';g.beginPath();g.arc(32,32,29,0,6.283);g.lineWidth=6;
  g.strokeStyle='#a8823f';g.stroke();
});

function makeMilk(){
  const m=new THREE.Mesh(flat(new THREE.TetrahedronGeometry(.95,0)),psMat({map:milkTex}));
  m.rotation.x=.38;return m;
}
function makePie(){
  const g=new THREE.Group();
  const tin=new THREE.Mesh(flat(new THREE.CylinderGeometry(1.15,.92,.42,10)),psMat({color:0xb6bbc0}));
  tin.position.y=.21;g.add(tin);
  const top=new THREE.Mesh(flat(new THREE.CylinderGeometry(1.06,1.06,.2,10)),psMat({map:pieTex}));
  top.position.y=.5;g.add(top);
  return g;
}

const items=[];
/* an item box gives a whole variant, family and level, from the first box of the race:
   a family by its weight, then a level by its odds. Tune both here. */
const FAMILIES=['boost','rocket','shield','pie','fart'];
const ITEMODDS={family:{boost:1,rocket:1,shield:1,pie:1,fart:1},level:[0.5,0.3,0.2]};
function pickWeighted(keys,w){
  let sum=0;for(const q of keys)sum+=w[q];
  let r=Math.random()*sum;
  for(const q of keys){r-=w[q];if(r<0)return q;}
  return keys[keys.length-1];
}
/** what an item box hands out: [family, level 1..3]; first a roll for a signature item, any driver's,
    which comes back as ['sig', 1, which] */
function rollItem(k){
  const ev=k&&eventSig(k);if(ev)return ['sig',1,ev];                /* an event's own item first: js/37-extra-allt.js */
  if(k&&Math.random()<SIG_CHANCE)return ['sig',1,pickSig(k)];
  return [pickWeighted(FAMILIES,ITEMODDS.family),pickWeighted([0,1,2],ITEMODDS.level)+1];
}
/** put an item in the slot; it keeps its level until it is used */
function giveItem(k,fam,lvl,sig){k.held=fam;k.heldLvl=lvl||1;k.heldSig=fam==='sig'?sig:null;k.heldAt=raceTime;}
const ITEMNAMES={boost:['MJÖLK','GRÄDDFIL','SKÅNSK GRÄDDE'],
  rocket:['SPETTEKAKA','SPETTIGARE KAKA','SEMMELVÄGGEN'],
  shield:['ÄGGAKAKA','STEKHET ÄGGAKAKA','DEN FLYGANDE STEKPANNAN'],
  pie:['ÄPPELPAJ','KAFFEREP','TÅRTMINA'],
  fart:['SKÅNSKA BÖNOR','SKÅNSK ÄRTSOPPA','BRUNA BÖNOR MED FLÄSK']};
const itemName=(f,l,k)=>f==='sig'?SIGS[(k||player).heldSig].name:ITEMNAMES[f][l-1];
const itemLvl=k=>k.heldLvl||1;
const ROLLT=1.5;                 /* seconds the item slot spins before the item can be used */
const ITEMICON={
  boost1:`<svg viewBox="0 0 48 48"><defs>
    <linearGradient id="ik1" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#fff"/><stop offset=".47" stop-color="#eaf4fa"/>
      <stop offset=".47" stop-color="#cde2ef"/><stop offset="1" stop-color="#f4fafd"/></linearGradient>
    <clipPath id="ik2"><path d="M24 4 44 42 4 42Z"/></clipPath></defs>
    <path d="M24 4 44 42 4 42Z" fill="url(#ik1)" stroke="#85b1ce" stroke-width="2.2" stroke-linejoin="round"/>
    <g clip-path="url(#ik2)"><rect x="0" y="27" width="48" height="7" fill="#0b6fc4"/>
      <rect x="0" y="36.5" width="48" height="3" fill="#d8362a"/></g>
    <path d="M24 6V42" stroke="#aecde0" stroke-width="1.5"/>
    <circle cx="24" cy="20" r="4.2" fill="#0b6fc4"/></svg>`,
  boost2:`<svg viewBox="0 0 48 48"><defs>
    <linearGradient id="ig1" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#dfe9e0"/><stop offset=".45" stop-color="#fff"/><stop offset="1" stop-color="#cfdccf"/></linearGradient></defs>
    <path d="M12 16 24 6 36 16Z" fill="#eef4ee" stroke="#6f9a72" stroke-width="2" stroke-linejoin="round"/>
    <rect x="12" y="16" width="24" height="28" rx="2" fill="url(#ig1)" stroke="#6f9a72" stroke-width="2"/>
    <rect x="12" y="25" width="24" height="10" fill="#3f9a4c"/>
    <path d="M16 31q3-5 6-1t6-1 4 1" fill="#fff" stroke="#fff" stroke-width="1.6" stroke-linejoin="round"/>
    <rect x="12" y="38" width="24" height="2.4" fill="#2e7a3a"/>
    <path d="M40 18l4-2M40 25h5M40 32l4 2" stroke="#f2c500" stroke-width="2.4" stroke-linecap="round"/></svg>`,
  boost3:`<svg viewBox="0 0 48 48"><defs>
    <linearGradient id="ig2" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#a00813"/><stop offset=".45" stop-color="#e3202c"/><stop offset="1" stop-color="#9a0812"/></linearGradient></defs>
    <path d="M2 30h9M0 37h10M3 23h8" stroke="#f2c500" stroke-width="2.6" stroke-linecap="round"/>
    <path d="M15 17 25 9 35 17Z" fill="#f2c500" stroke="#8a5d00" stroke-width="1.8" stroke-linejoin="round"/>
    <rect x="15" y="17" width="20" height="28" rx="2" fill="url(#ig2)" stroke="#6c050c" stroke-width="2"/>
    <rect x="15" y="27" width="20" height="5" fill="#f2c500"/><rect x="22" y="17" width="5" height="28" fill="#f2c500"/>
    <g fill="#fffaf0" stroke="#e0d2b8" stroke-width="1.2">
      <circle cx="31" cy="8" r="5"/><circle cx="38" cy="5" r="4"/><circle cx="41" cy="12" r="3.6"/>
      <circle cx="44" cy="20" r="2.6"/><circle cx="25" cy="5" r="3"/></g></svg>`,
  rocket1:`<svg viewBox="0 0 48 48"><defs>
    <linearGradient id="ik3" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#a97a2e"/><stop offset=".38" stop-color="#e6bd65"/>
      <stop offset=".6" stop-color="#f2d492"/><stop offset="1" stop-color="#a1742c"/></linearGradient>
    <clipPath id="ik4"><path d="M24 3 38 43 10 43Z"/></clipPath></defs>
    <path d="M24 3 38 43 10 43Z" fill="url(#ik3)" stroke="#87601f" stroke-width="2.2" stroke-linejoin="round"/>
    <g clip-path="url(#ik4)" stroke="#fff9ec" stroke-width="2.6" fill="none" stroke-linecap="round">
      <path d="M2 15Q24 21 46 15"/><path d="M2 24Q24 30 46 24"/><path d="M2 33Q24 39 46 33"/></g></svg>`,
  rocket2:`<svg viewBox="0 0 48 48"><defs>
    <linearGradient id="ig3" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#a97a2e"/><stop offset=".45" stop-color="#ecc673"/><stop offset="1" stop-color="#a1742c"/></linearGradient>
    <clipPath id="ig4"><path d="M27 12 37 40 17 40Z"/></clipPath></defs>
    <path d="M27 2V46" stroke="#6b4a26" stroke-width="2.6" stroke-linecap="round"/>
    <path d="M27 2q-7 1-6 8" fill="none" stroke="#c7ccd2" stroke-width="2.6" stroke-linecap="round"/>
    <path d="M27 12 37 40 17 40Z" fill="url(#ig3)" stroke="#87601f" stroke-width="2" stroke-linejoin="round"/>
    <g clip-path="url(#ig4)" stroke="#fff9ec" stroke-width="2.2" fill="none"><path d="M10 22Q27 27 44 22"/><path d="M10 31Q27 36 44 31"/></g>
    <path d="M27 46Q14 46 9 36T4 22" fill="none" stroke="#e8d8b0" stroke-width="1.8" stroke-dasharray="3 2"/></svg>`,
  rocket3:`<svg viewBox="0 0 48 48"><defs>
    <radialGradient id="ig5" cx=".4" cy=".3" r=".8"><stop offset="0" stop-color="#f1c27a"/><stop offset="1" stop-color="#b9792c"/></radialGradient>
    <g id="ig6"><path d="M-8 2a8 6 0 0 0 16 0Z" fill="url(#ig5)" stroke="#8a561c" stroke-width="1.2"/>
      <rect x="-8" y="-2" width="16" height="4.4" rx="2.2" fill="#fffaf0" stroke="#d8cdb9" stroke-width="1"/>
      <path d="M-7-2a7 5 0 0 1 14 0Z" fill="url(#ig5)" stroke="#8a561c" stroke-width="1.2"/>
      <path d="M-4-5h8" stroke="#fff" stroke-width="2" stroke-linecap="round"/></g></defs>
    <use href="#ig6" x="9" y="38"/><use href="#ig6" x="24" y="38"/><use href="#ig6" x="39" y="38"/>
    <use href="#ig6" x="16.5" y="25"/><use href="#ig6" x="31.5" y="25"/><use href="#ig6" x="24" y="12"/></svg>`,
  shield1:`<svg viewBox="0 0 48 48"><defs>
    <radialGradient id="ik5" cx=".36" cy=".28" r=".85">
      <stop offset="0" stop-color="#fdf0bc"/><stop offset=".55" stop-color="#eccd6a"/>
      <stop offset="1" stop-color="#c2942c"/></radialGradient></defs>
    <ellipse cx="24" cy="30" rx="19" ry="13" fill="#a87c22"/>
    <ellipse cx="24" cy="25" rx="19" ry="13" fill="url(#ik5)" stroke="#9c7420" stroke-width="1.8"/>
    <g fill="#b5674a" stroke="#8a4631" stroke-width="1.1">
      <rect x="9" y="20" width="14" height="4.4" rx="1.8" transform="rotate(-13 16 22)"/>
      <rect x="25" y="17" width="14" height="4.4" rx="1.8" transform="rotate(11 32 19)"/>
      <rect x="16" y="28" width="15" height="4.4" rx="1.8" transform="rotate(-4 24 30)"/></g>
    <ellipse cx="17" cy="19" rx="7" ry="3.4" fill="#fff" opacity=".42"/></svg>`,
  shield2:`<svg viewBox="0 0 48 48"><defs>
    <radialGradient id="ig7" cx=".4" cy=".3" r=".85">
      <stop offset="0" stop-color="#ffe9a0"/><stop offset=".5" stop-color="#f29a3a"/><stop offset="1" stop-color="#c8361c"/></radialGradient></defs>
    <path d="M14 13q-3-4 0-7t0-6M24 12q-3-4 0-7t0-6M34 13q-3-4 0-7t0-6" fill="none" stroke="#fff" stroke-width="2" opacity=".75" stroke-linecap="round"/>
    <ellipse cx="24" cy="33" rx="20" ry="12" fill="#8c2a14"/>
    <ellipse cx="24" cy="28" rx="20" ry="12" fill="url(#ig7)" stroke="#9c2a14" stroke-width="1.8"/>
    <g fill="#7a2c1c" stroke="#4e1a10" stroke-width="1.1">
      <rect x="9" y="24" width="14" height="4.4" rx="1.8" transform="rotate(-13 16 26)"/>
      <rect x="25" y="21" width="14" height="4.4" rx="1.8" transform="rotate(11 32 23)"/>
      <rect x="16" y="31" width="15" height="4.4" rx="1.8" transform="rotate(-4 24 33)"/></g></svg>`,
  shield3:`<svg viewBox="0 0 48 48"><defs>
    <radialGradient id="ig8" cx=".4" cy=".35" r=".8"><stop offset="0" stop-color="#7d858e"/><stop offset="1" stop-color="#2b3036"/></radialGradient>
    <g id="ig9"><path d="M0-9V-20" stroke="#5a3a22" stroke-width="3.2" stroke-linecap="round"/>
      <circle r="8" fill="url(#ig8)" stroke="#1d2125" stroke-width="1.6"/><circle r="5" fill="none" stroke="#9aa3ad" stroke-width="1" opacity=".6"/></g></defs>
    <circle cx="24" cy="25" r="17" fill="none" stroke="#fff" stroke-width="1.4" stroke-dasharray="3 3" opacity=".7"/>
    <use href="#ig9" transform="translate(24 10) rotate(180)"/>
    <use href="#ig9" transform="translate(11 33) rotate(60)"/>
    <use href="#ig9" transform="translate(37 33) rotate(-60)"/>
    <ellipse cx="24" cy="26" rx="6" ry="4" fill="#eccd6a" stroke="#9c7420" stroke-width="1.2"/></svg>`,
  pie1:`<svg viewBox="0 0 48 48"><defs>
    <radialGradient id="ik6" cx=".38" cy=".3" r=".85">
      <stop offset="0" stop-color="#f6d58a"/><stop offset=".58" stop-color="#d49a3a"/>
      <stop offset="1" stop-color="#9c6420"/></radialGradient>
    <clipPath id="ik7"><ellipse cx="24" cy="24" rx="15" ry="10.5"/></clipPath></defs>
    <ellipse cx="24" cy="29" rx="20" ry="13" fill="#949aa0"/>
    <ellipse cx="24" cy="25" rx="20" ry="13" fill="#c6ccd2" stroke="#878e95" stroke-width="1.6"/>
    <ellipse cx="24" cy="24" rx="15" ry="10.5" fill="url(#ik6)"/>
    <g clip-path="url(#ik7)" stroke="#f3dca6" stroke-width="2.6" opacity=".95" stroke-linecap="round">
      <path d="M8 18 40 30"/><path d="M8 30 40 18"/><path d="M18 11 30 37"/><path d="M30 11 18 37"/></g>
    <ellipse cx="24" cy="24" rx="15" ry="10.5" fill="none" stroke="#a8823f" stroke-width="2.2"/>
    <path d="M37 6q4 0 4 4M37 6q-2 3 0 6" stroke="#4a8a2a" stroke-width="2" fill="#7cbf3c"/></svg>`,
  pie2:`<svg viewBox="0 0 48 48"><defs>
    <radialGradient id="ig10" cx=".38" cy=".3" r=".85"><stop offset="0" stop-color="#f6d58a"/><stop offset="1" stop-color="#b47a2a"/></radialGradient></defs>
    <ellipse cx="19" cy="33" rx="17" ry="10" fill="#949aa0"/>
    <ellipse cx="19" cy="30" rx="17" ry="10" fill="#c6ccd2" stroke="#878e95" stroke-width="1.4"/>
    <ellipse cx="19" cy="29" rx="12.5" ry="7.5" fill="url(#ig10)" stroke="#a8823f" stroke-width="1.6"/>
    <path d="M10 26 28 32M10 32 28 26" stroke="#f3dca6" stroke-width="2"/>
    <path d="M30 14h14l-2 14a5 5 0 0 1-5 4h0a5 5 0 0 1-5-4Z" fill="#fff" stroke="#9aa6b0" stroke-width="1.6"/>
    <path d="M44 17a4 4 0 0 1 0 7" fill="none" stroke="#9aa6b0" stroke-width="2"/>
    <ellipse cx="37" cy="15" rx="6.4" ry="1.8" fill="#5a3214"/>
    <path d="M34 10q-2-3 0-5M40 10q-2-3 0-5" fill="none" stroke="#fff" stroke-width="1.6" stroke-linecap="round" opacity=".8"/>
    <ellipse cx="39" cy="42" rx="7" ry="2.4" fill="#5a3214" opacity=".85"/></svg>`,
  pie3:`<svg viewBox="0 0 48 48">
    <rect x="7" y="32" width="34" height="11" rx="3" fill="#ef8fb8" stroke="#b44f7c" stroke-width="1.6"/>
    <rect x="12" y="22" width="24" height="11" rx="3" fill="#f7b7d2" stroke="#b44f7c" stroke-width="1.6"/>
    <path d="M7 34q4 4 8.5 0t8.5 0 8.5 0 8.5 0M12 24q3 3 6 0t6 0 6 0 6 0" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round"/>
    <rect x="22.4" y="11" width="3.2" height="11" fill="#fff" stroke="#d8362a" stroke-width="1"/>
    <path d="M24 2q4 4 0 8-4-4 0-8Z" fill="#ffcc33" stroke="#f08a00" stroke-width="1.2"/>
    <circle cx="24" cy="7" r="9" fill="none" stroke="#ffcc33" stroke-width="1" stroke-dasharray="2 3" opacity=".8"/></svg>`,
  fart1:`<svg viewBox="0 0 48 48">
    <g fill="#9bbf55" opacity=".85"><circle cx="9" cy="14" r="6"/><circle cx="16" cy="9" r="5"/><circle cx="5" cy="22" r="4"/></g>
    <path d="M8 26h32l-3 14a4 4 0 0 1-4 3H15a4 4 0 0 1-4-3Z" fill="#e8e0d0" stroke="#8c8270" stroke-width="1.8"/>
    <rect x="10" y="30" width="28" height="4" fill="#3a6fb0"/>
    <g fill="#8a3e22" stroke="#5a2412" stroke-width=".8">
      <ellipse cx="16" cy="25" rx="3.6" ry="2.4"/><ellipse cx="23" cy="24" rx="3.6" ry="2.4"/>
      <ellipse cx="30" cy="25" rx="3.6" ry="2.4"/><ellipse cx="20" cy="21.5" rx="3.6" ry="2.4"/><ellipse cx="27" cy="21.5" rx="3.6" ry="2.4"/></g></svg>`,
  fart2:`<svg viewBox="0 0 48 48">
    <g fill="#9bbf55" opacity=".85"><circle cx="7" cy="12" r="6"/><circle cx="41" cy="12" r="6"/><circle cx="14" cy="6" r="4"/><circle cx="34" cy="6" r="4"/></g>
    <path d="M4 24h40a20 16 0 0 1-40 0Z" fill="#2d63a8" stroke="#1b3e6c" stroke-width="1.8"/>
    <ellipse cx="24" cy="24" rx="20" ry="5" fill="#e3c13c" stroke="#1b3e6c" stroke-width="1.8"/>
    <g fill="#c7a12a"><circle cx="16" cy="24" r="1.6"/><circle cx="24" cy="23" r="1.6"/><circle cx="31" cy="25" r="1.6"/></g>
    <path d="M30 22 42 4" stroke="#c7ccd2" stroke-width="3" stroke-linecap="round"/>
    <path d="M10 33h28" stroke="#fff" stroke-width="1.4" opacity=".5"/></svg>`,
  fart3:`<svg viewBox="0 0 48 48">
    <g fill="#8fb34a" opacity=".9"><circle cx="24" cy="10" r="8"/><circle cx="12" cy="13" r="6"/><circle cx="36" cy="13" r="6"/>
      <circle cx="5" cy="22" r="4.4"/><circle cx="43" cy="22" r="4.4"/></g>
    <ellipse cx="24" cy="34" rx="21" ry="11" fill="#f4efe4" stroke="#9a907c" stroke-width="1.8"/>
    <ellipse cx="24" cy="33" rx="14" ry="7" fill="#7a3418"/>
    <g fill="#9a4a26"><circle cx="17" cy="32" r="2"/><circle cx="23" cy="30" r="2"/><circle cx="29" cy="33" r="2"/><circle cx="21" cy="36" r="2"/></g>
    <g fill="#e28a7a" stroke="#a24a3a" stroke-width="1">
      <path d="M27 27q5-2 9 1l-1 3q-4-3-8-1Z"/><path d="M28 35q5-1 8 2l-2 2q-3-3-7-2Z"/></g></svg>`
};
const skaneTex=pixTex(32,32,(g)=>{
  g.fillStyle='#cc0a17';g.fillRect(0,0,32,32);        /* rött fält */
  g.fillStyle='#f2c500';                              /* gult nordiskt kors */
  g.fillRect(0,13,32,6);
  g.fillRect(10,0,6,32);
});
function makeDunk(){
  const g=new THREE.Group();
  const red=psMat({color:0xcc2a1e});
  const b=new THREE.Mesh(flat(new THREE.BoxGeometry(.85,1.15,.5)),red);
  b.position.y=.58;g.add(b);
  const sp=new THREE.Mesh(flat(new THREE.CylinderGeometry(.11,.13,.5,6)),psMat({color:0x3a3f45}));
  sp.position.set(.3,1.3,0);sp.rotation.z=-.5;g.add(sp);
  const h=new THREE.Mesh(flat(new THREE.BoxGeometry(.5,.12,.14)),psMat({color:0x3a3f45}));
  h.position.y=1.22;g.add(h);
  const st=new THREE.Mesh(flat(new THREE.BoxGeometry(.5,.3,.04)),psMat({color:0xf2ece0}));
  st.position.set(0,.62,.27);g.add(st);
  return g;
}
function makeBox(){
  const g=new THREE.Group();
  g.add(new THREE.Mesh(flat(new THREE.BoxGeometry(1.5,1.5,1.5)),psMat({map:skaneTex,unlit:true})));
  return g;
}
function makeSpettekaka(){
  const g=new THREE.Group();
  const cone=new THREE.Mesh(flat(new THREE.ConeGeometry(.62,1.9,8)),psMat({color:0xc89a4e}));
  cone.position.y=.95;g.add(cone);
  for(let k=0;k<4;k++){                                /* the icing drizzle */
    const r=.56-k*.12;
    const ring=new THREE.Mesh(flat(new THREE.TorusGeometry(r,.055,4,8)),
      psMat({color:0xf2ece0}));
    ring.rotation.x=Math.PI/2;ring.position.y=.34+k*.4;g.add(ring);
  }
  return g;
}
function makeAggkaka(){
  const g=new THREE.Group();
  const cake=new THREE.Mesh(flat(new THREE.CylinderGeometry(.95,.88,.34,10)),
    psMat({color:0xe8c866}));
  cake.position.y=.3;g.add(cake);
  for(let k=0;k<4;k++){                                /* fläsk on top */
    const b=new THREE.Mesh(flat(new THREE.BoxGeometry(.5,.1,.18)),psMat({color:0xb5674a}));
    b.position.set(Math.cos(k*1.57)*.36,.5,Math.sin(k*1.57)*.36);
    b.rotation.y=k*1.57;g.add(b);
  }
  return g;
}
/** Kafferep: a spilled cup and its puddle */
function makeCoffee(){
  const g=new THREE.Group();
  const p=new THREE.Mesh(flat(new THREE.CylinderGeometry(1.35,1.35,.05,10)),psMat({color:0x4a2a14}));
  p.position.y=.03;p.scale.z=.8;g.add(p);
  const cup=new THREE.Mesh(flat(new THREE.CylinderGeometry(.34,.26,.5,8)),psMat({color:0xf4f1ea}));
  cup.rotation.z=Math.PI/2;cup.position.set(.95,.3,.2);g.add(cup);
  return g;
}
/** Tårtmina: a pink layered cake whose candle lights once it is armed */
function makeMine(){
  const g=new THREE.Group();
  const add=(geo,col,y,unlit)=>{const m=new THREE.Mesh(flat(geo),psMat({color:col,unlit}));m.position.y=y;g.add(m);return m;};
  add(new THREE.CylinderGeometry(1.0,1.0,.46,10),0xef8fb8,.23);
  add(new THREE.CylinderGeometry(1.04,1.04,.1,10),0xfffaf0,.48);
  add(new THREE.CylinderGeometry(.7,.7,.42,10),0xf7b7d2,.72);
  add(new THREE.CylinderGeometry(.74,.74,.08,10),0xfffaf0,.94);
  add(new THREE.CylinderGeometry(.08,.08,.6,5),0xf4f1ea,1.25);
  g.userData.flame=add(new THREE.ConeGeometry(.16,.36,5),0xffc21a,1.72,true);
  g.userData.flame.visible=false;
  return g;
}
/** traps that sit on the road instead of spinning above it */
const GROUNDED={pie:1,coffee:1,mine:1};
function addItem(type,si,lat){
  const x=sx[si]+rx[si]*lat, z=sz[si]+rz[si]*lat, y=groundAt(x,z,si);
  const mesh=type==='fuel'?makeDunk():type==='box'?makeBox():type==='milk'?makeMilk():type==='pie'?makePie():
             type==='coffee'?makeCoffee():type==='mine'?makeMine():
             type==='rocket'?makeSpettekaka():makeAggkaka();
  const low=GROUNDED[type];
  mesh.position.set(x,y+(low?.04:1.15),z);
  if(low)mesh.rotation.y=rand(0,6.283);
  world.add(mesh);
  const o={type,si,lat,x,z,y,mesh,cool:0,base:mesh.position.y};
  items.push(o);return o;
}
function buildItems(){
  items.length=0;
  const off=HW*0.56;
  for(let i=40;i<N;i+=72){
    let at=i;while(!clearOfForks(at,10))at=(at+8)%N;
    for(const l of [-off,0,off])addItem('box',at,l);
  }
  for(let k=0;k<9;k++){
    let at=Math.round(N*(k+0.37)/9)%N;
    for(const J of JUMPS)                                  /* never in a landing zone */
      if(Math.min(Math.abs(at-J.at),N-Math.abs(at-J.at))<J.up+J.dn+8)at=(at+36)%N;
    if(Math.min(at,N-at)<32)at=(at+44)%N;
    while(!clearOfForks(at,6))at=(at+8)%N;
    addItem('pie',at,(hash2(k*3.7,k*1.9)*2-1)*HW*0.55);
  }
  for(let k=0;k<6;k++){                                    /* bensindunkar */
    let at=Math.round(N*(k+0.78)/6)%N;
    for(const J of JUMPS)
      if(Math.min(Math.abs(at-J.at),N-Math.abs(at-J.at))<J.up+J.dn+8)at=(at+30)%N;
    while(!clearOfForks(at,6))at=(at+8)%N;
    addItem('fuel',at,(k%2?1:-1)*HW*0.62);
  }
}

function resetItems(){
  for(let n=items.length-1;n>=0;n--){
    const it=items[n];
    if(it.temp!==undefined){world.remove(it.mesh);items.splice(n,1);continue;}
    it.cool=0;it.mesh.visible=true;
  }
}

function updateItems(dt){
  for(let n=items.length-1;n>=0;n--){
    const it=items[n];
    if(it.temp!==undefined){
      it.temp-=dt;
      if(it.temp<=0){world.remove(it.mesh);items.splice(n,1);continue;}
    }
    if(it.cool>0){
      it.cool-=dt;
      if(it.cool<=0)it.mesh.visible=true; else continue;
    }
    if(it.type==='mine'){                                /* arming, then the candle blinks */
      if(it.arm>0)it.arm-=dt;
      it.mesh.userData.flame.visible=it.arm<=0&&Math.floor(clock*7)%2===0;
    }
    if(!GROUNDED[it.type]){
      it.mesh.rotation.y+=dt*2.1;
      it.mesh.rotation.x+=dt*1.3;
      it.mesh.position.y=it.base+Math.sin(clock*2.6+it.si*.37)*.2;
    }
  }
}
function checkPickups(){
  for(const it of items){
    if(it.cool>0)continue;
    if(it.type==='mine'){checkMine(it);continue;}
    const milk=it.type==='milk', trap=it.type==='pie'||it.type==='coffee';
    const r2=trap?4.4:6.25;
    for(const k of karts){
      const dx=k.x-it.x,dz=k.z-it.z;
      if(dx*dx+dz*dz>(k.nose&&it.type==='box'?NOSE.r2:r2))continue;   /* Godisnosen: 37-brak-och-trak.js */
      if(Math.abs(k.y-it.y)>3.4)continue;    /* sailing over it does not count */
      if(trap&&raceTime-k.trapAt<1.2)continue;           /* one trap at a time, then a moment to recover */
      if(it.type==='fuel'){
        if(k.fuel>TANK-6)continue;                       /* already brimmed */
        k.fuel=Math.min(TANK,k.fuel+38);
        for(let p=0;p<8;p++)puff(it.x+rand(-.6,.6),it.y+rand(.3,1.2),it.z+rand(-.6,.6),.9,.3,.24,.45);
        if(k===player){toast('BENSINDUNK +38');ping(300,620,.12);}
        it.cool=11;
      }else if(it.type==='box'){
        if(k.held)continue;                              /* hands already full */
        giveItem(k,...rollItem(k));k.roll=ROLLT;   /* the slot spins first */
        for(let p=0;p<8;p++)puff(it.x+rand(-.7,.7),it.y+rand(.4,1.5),it.z+rand(-.7,.7),.95,.76,.2,.4);
        it.cool=6;
      }else if(it.type==='rocket'){
        if(k.held)continue;
        giveItem(k,'rocket',1);
        if(k===player){toast('SPETTEKAKA!');ping(440,760,.10);}
        it.cool=8;
      }else if(it.type==='shield'){
        k.shield=Math.max(k.shield,9*k.shieldMul);
        for(let p=0;p<12;p++)puff(it.x+rand(-.9,.9),it.y+rand(.3,1.4),it.z+rand(-.9,.9),.95,.82,.4,.5);
        if(k===player){toast('ÄGGKAKA! SKÖLD');ping(380,720,.14);}
        it.cool=9;
      }else if(milk){
        k.boost=Math.max(k.boost,1.3*k.milk);k.boostLvl=Math.max(k.boostLvl,1);k.slow=0;
        for(let p=0;p<12;p++)puff(it.x+rand(-.8,.8),it.y+rand(.3,1.5),it.z+rand(-.8,.8),1,1,1,.55);
        if(k===player){toast(k.milk>1?'EGEN MJÖLK! MUUU':'MJÖLK! FULL FART');ping(560,980,.10);if(k.milk>1)moo();}
        it.cool=7;
      }else if(trap&&(k.trapAt=raceTime,blockHit(k))){   /* äggakakan eller skopan tar smällen */
        for(let p=0;p<14;p++)puff(it.x+rand(-1,1),it.y+rand(.3,1.3),it.z+rand(-1,1),.95,.82,.4,.6);
        it.cool=5;
      }else if(it.type==='coffee'){                      /* kaffe på vägen: a short spin */
        k.spun=Math.max(k.spun,0.9*k.spinResist*(k.chores?.6:1));k.boost=0;k.drift=0;k.charge=0;
        for(let p=0;p<14;p++)puff(it.x+rand(-1.1,1.1),it.y+rand(.1,.9),it.z+rand(-1.1,1.1),.42,.26,.14,.6);
        if(k===player){toast('KAFFE PÅ VÄGEN!');ping(420,110,.2);shake=Math.min(1,shake+.35);}
        it.cool=5;
      }else{
        k.boost=0;k.slow=k.chores?.95:1.45;k.drift=0;k.charge=0;
        for(let p=0;p<16;p++)puff(it.x+rand(-1.1,1.1),it.y+rand(.2,1.2),it.z+rand(-1.1,1.1),.88,.44,.48,.75);
        if(k===player){toast('PAJ I ANSIKTET!');ping(300,90,.22);shake=Math.min(1,shake+.45);}
        it.cool=5;
      }
      it.mesh.visible=false;
      if(it.temp!==undefined)it.temp=0.001;
      break;
    }
  }
}
/** Tårtmina: once armed, a rival driving close sets it off. The cream knocks everyone
    near it sideways and slows them a little; the owner is never the one to trigger it. */
function checkMine(it){
  if(it.cool>0||it.arm>0)return;
  const tr=Math.min(3.6,HW*0.42);
  const near=karts.find(k=>k!==it.owner&&!k.parked&&k.ghost<=0&&!k.rib&&Math.abs(k.y-it.y)<3.4&&
    (k.x-it.x)**2+(k.z-it.z)**2<tr*tr);
  if(!near)return;
  const i=it.si;
  for(let p=0;p<34;p++){const w=Math.random()<.6;
    puff(it.x+rand(-2.2,2.2),it.y+rand(.2,2.4),it.z+rand(-2.2,2.2),1,w?.98:.72,w?.95:.84,.9);}
  for(const k of karts){
    if(k.parked||k.ghost>0||Math.abs(k.y-it.y)>3.4)continue;
    const dx=k.x-it.x,dz=k.z-it.z;if(dx*dx+dz*dz>42)continue;
    k.trapAt=raceTime;
    if(blockHit(k))continue;
    const s=Math.sign(dx*rx[i]+dz*rz[i])||1;
    k.vx+=rx[i]*s*13;k.vz+=rz[i]*s*13;
    k.slow=Math.max(k.slow,k.chores?.6:0.9);k.boost=0;k.drift=0;k.charge=0;
    if(k===player){toast('TÅRTMINA! GRÄDDE ÖVERALLT');ping(200,60,.3);shake=Math.min(1,shake+.6);}
    else if(it.owner===player)toast('BOOM! TÅRTA!');
  }
  it.mesh.visible=false;it.temp=0.001;it.cool=1e9;
}
