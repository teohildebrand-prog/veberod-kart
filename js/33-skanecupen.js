"use strict";
/* ───────── Skånecupen ───────── */
const CUP_ROUNDS=['veberod','lund','tollarp','horby'];
const CUP_ROLE={veberod:'Blandat underlag och de första genvägarna.',lund:'Precision och kurvtagning.',
  tollarp:'Långa raksträckor och fart.',horby:'Torgkurvor, grus och gyttja, och grisar på vägen.',ahus:'Hopp och jämn kontroll.',bron:'Två varv fullt ut, under press.',
  glimminge:'Ren racing i månsken, utan genvägar.',ales:'Fart på sanden och två hemliga passager.'};
/* No cup runs longer than four rounds. Skånecupen and Sommarcupen are the home cups, no champion.
   LEGO Racers' shape: three cups of four with a champion each, the same three mirrored and
   in reverse order once won, then Finalen: Rosengård, then Raket-Rune's own circuit. */
const CUPS=[
  {id:'skane',name:'SKÅNECUPEN',short:'SKÅNE',rounds:CUP_ROUNDS,
   blurb:'The home four: Veberöd, Lund, Tollarp and Hörby. No champion, just the village rivals.'},
  {id:'sommar',name:'SOMMARCUPEN',short:'SOMMAR',rounds:['ahus','glimminge','ales','bron'],
   blurb:'A summer trip: Åhus, Glimmingehus by moonlight, Ales stenar and the bridge. No champion, just the village rivals.'},
  {id:'osterlen',name:'ÖSTERLENCUPEN',short:'ÖSTERLEN',rounds:['glimminge','kivik','ales','soderasen'],champ:'spoket',
   blurb:'Castle, cairn, sand and gorge. The ghost of Glimmingehus has never lost on home ground.'},
  {id:'kust',name:'KUSTCUPEN',short:'KUSTEN',rounds:['foteviken','karlskrona','ven','limhamn'],champ:'viking',need:'osterlen',
   blurb:'Vikings, warships, an island and a quarry by night. The Viking chieftain takes the coast personally.'},
  {id:'vild',name:'VILDMARKSCUPEN',short:'VILDMARKEN',rounds:['angelholm','hoor','romele','kalmar'],champ:'gubbe',need:'kust',
   blurb:'A UFO forest, the elk woods, a snowstorm and a joust. The Green Man from the forest is waiting.'},
  {id:'final',name:'FINALEN',short:'FINALEN',rounds:['rosengard','rune'],champ:'rune',
   blurb:'Rosengård, then Raket-Rune\'s own circuit in Malmö harbour. Win all three championships to be invited.'}];
const cupDef=c=>CUPS.find(C=>C.id===((c&&c.cup)||'skane'))||CUPS[0];
/* a saved championship carries its own schedule (cup save v2), so a cup started before a schedule
   changed finishes on the rounds it started with. v1 saves stored none: they get the schedule v1 raced. */
const CUP_SAVE_V=2;
const CUP_ROUNDS_V1={skane:['veberod','lund','tollarp','horby','ahus','bron'],final:['rune']};
function migrateCup(c){
  if(!c||c.v>=CUP_SAVE_V)return false;
  const id=cupDef(c).id;c.rounds=(CUP_ROUNDS_V1[id]||cupDef(c).rounds).slice();c.v=CUP_SAVE_V;
  return true;
}
if(migrateCup(SAVE.cup))writeSave();
/** the schedule: the saved cup's own, or today's for a cup not started yet;
    a won championship can be raced again mirrored, rounds in reverse */
function cupRounds(c){const C=cupDef(c),r=((c&&c.rounds)||C.rounds).slice();if(c&&c.mirror&&C.champ)r.reverse();return r;}
function cupOpen(C){
  if(C.id==='final')return CUPS.every(D=>!D.champ||D.id==='final'||SAVE.unlock['win_'+D.id]);
  return !C.need||!!SAVE.unlock['cup_'+C.need];
}
function mirrorOpen(C){return !C.champ?!!SAVE.unlock.cup:(C.id!=='final'&&!!SAVE.unlock['win_'+C.id]);}
function cupLockText(C){
  if(C.id==='final')return 'Locked: win Österlencupen, Kustcupen and Vildmarkscupen to be invited.';
  return 'Locked: finish on the podium in '+cupDef({cup:C.need}).name+' to open it.';
}
function trophyKey(c){const C=cupDef(c);return (C.id==='skane'?'':C.id+'_')+c.cls+(c.mirror?'_m':'');}
function cupChamp(){const C=CUP&&cupDef(CUP);return C&&C.champ?CHAMPS[C.champ]:null;}
const champRigs={};
/** the champion takes the rival's slot (kart, name, numbers); everyone else races as themselves */
function applyChampion(){
  const ch=cupChamp();
  karts.forEach((k,i)=>{
    if(!k.ai)return;
    const cfg=ch&&CUP.rival===i?ch:ROSTER[i];
    if(!k.v0)k.v0=k.v;
    const v=cfg===ROSTER[i]?k.v0:(champRigs[cupDef(CUP).champ]||(champRigs[cupDef(CUP).champ]=
      (()=>{const r=buildKart(cfg.color,cfg.kind,cfg.car);scene.add(r.root);return r;})()));
    if(k.v!==v){k.v.root.visible=false;k.v=v;}
    k.cfg=cfg;k.name=cfg.name;k.color=cfg.color;
  });
  nameKarts();
  const ck=ch&&karts[CUP.rival];   /* the player drives this cup's own champion: the other one is II */
  if(ck&&CHARS[charSel].id===cupDef(CUP).champ&&ck.name===ch.name)ck.name=ch.name+' II';
}
const POINTS=[10,7,5,3,2,1];
const CLASSES=[
  {id:'easy',name:'SÖNDAGSFÖRARE',sub:'LÄTT',speed:0.92,caution:1.15,band:1.08,risk:1.3,
   blurb:'Sunday drivers. The field is slower, brakes early and is wary of shortcuts. A gentle first cup.'},
  {id:'normal',name:'BYGDEMÄSTARE',sub:'NORMAL',speed:1,caution:1,band:1.16,risk:1,
   blurb:'The village champions: the AI exactly as tuned for single races. Gold here unlocks the golden churn paint.'},
  {id:'hard',name:'RIKSDAGSNIVÅ',sub:'SVÅR',speed:1.05,caution:0.90,band:1.20,risk:0.8,
   blurb:'Parliament level. Faster, braver drivers who take a muddy shortcut without blinking.'}];
let CUP=null;                              /* the cup being raced, null in single races */
function cupClass(){return CLASSES[CUP?Math.max(0,CLASSES.findIndex(c=>c.id===CUP.cls)):1];}
/* cosmetic paints: never touch handling */
const PAINTS=[{id:null,name:'ORIGINAL'},
  {id:'blue',name:'KORNBLÅ',color:0x3f63c8,unlock:'cup'},
  {id:'gold',name:'GULDKANNAN',color:0xd4a62a,unlock:'gold'},
  {id:'r1',name:'MAJROS-VIT',color:0xf0ece2,unlock:'rival1'},
  {id:'r2',name:'TEOS KOBOLT',color:0x2f62d8,unlock:'rival2'},
  {id:'r3',name:'AMANDAS VINRÖD',color:0x6e1f2c,unlock:'rival3'},
  {id:'r4',name:'NISSES TURKOS',color:0x1fa8a0,unlock:'rival4'},
  {id:'r5',name:'BRITTAS SMÖRGUL',color:0xf2d36b,unlock:'rival5'},
  {id:'c1',name:'SPÖKVIT',color:0xcfe0ea,unlock:'win_osterlen'},
  {id:'c2',name:'VIKINGABRUN',color:0x7a4a2a,unlock:'win_kust'},
  {id:'c3',name:'UFO-GRÖN',color:0x4fd04a,unlock:'win_vild'},
  {id:'c4',name:'RAKETRÖD',color:0xd82a2a,unlock:'win_final'}];
/* beating a champion also gives one piece of their kart, cosmetic only */
const PARTS=[{id:null,name:'INGEN'},
  {id:'lantern',name:'SPÖKLYKTAN',unlock:'win_osterlen'},
  {id:'horns',name:'VIKINGAHORNEN',unlock:'win_kust'},
  {id:'antenna',name:'UFO-ANTENNEN',unlock:'win_vild'},
  {id:'fins',name:'RAKETFENORNA',unlock:'win_final'}];
const partOn=()=>{const P=PARTS.find(q=>q.id&&q.id===SAVE.part&&SAVE.unlock[q.unlock]);return P?P.id:null;};
function addPart(v,id){
  const add=(g,m,x,y,z)=>{const e=new THREE.Mesh(flat(g),m);e.position.set(x,y,z);v.lean.add(e);return e;};
  if(id==='lantern'){
    add(new THREE.CylinderGeometry(.03,.03,1.5,4),psMat({color:0x4a4e56}),-.62,1.55,-1.25);
    add(new THREE.BoxGeometry(.28,.34,.28),psMat({color:0xffcc55,unlit:true}),-.62,2.35,-1.25);
    add(new THREE.BoxGeometry(.34,.06,.34),psMat({color:0x4a4e56}),-.62,2.55,-1.25);
  }else if(id==='horns'){
    for(const sg of [-1,1]){const h=add(new THREE.ConeGeometry(.12,.7,5),psMat({color:0xeee4c8}),sg*.62,1.0,1.45);
      h.rotation.z=-sg*1.1;h.rotation.x=.3;}
  }else if(id==='antenna'){
    add(new THREE.CylinderGeometry(.025,.025,1.8,4),psMat({color:0xb8c4cc}),-.5,1.9,-1.3);
    add(new THREE.SphereGeometry(.14,6,4),psMat({color:0xb6ff7a,unlit:true}),-.5,2.85,-1.3);
  }else if(id==='fins'){
    const tri=new THREE.BufferGeometry();
    tri.setAttribute('position',new THREE.Float32BufferAttribute([0,0,0, 0,.9,-.5, 0,0,-.9],3));
    for(const sg of [-1,1]){const f=new THREE.Mesh(flat(tri.clone()),psMat({color:0xd82a2a,side:THREE.DoubleSide}));
      f.position.set(sg*.7,.8,-1.2);f.rotation.z=sg*.5;v.lean.add(f);}
    const c=add(new THREE.ConeGeometry(.22,.5,8),psMat({color:0xffa83a,unlit:true}),0,.75,-2.0);c.rotation.x=-Math.PI/2;
  }
}
let paintSel=SAVE.paint;
function paintColor(ci){const P=PAINTS.find(p=>p.id===paintSel&&p.id&&SAVE.unlock[p.unlock]);return P?P.color:CHARS[ci].color;}
let charSel=0, carSel=0, playerRig=null, previewChar=null, previewOn=false;
const rigCache=new Map();                 /* char+car -> rig, so hovering is instant */
function rigFor(ci,ri){
  const pen=SAVE.unlock.pennant&&SAVE.pennantOn?SAVE.pennant:0, bask=stampCount()>=9, part=partOn();
  const key=ci+':'+ri+':'+paintColor(ci)+':'+pen+':'+bask+':'+part;
  let v=rigCache.get(key);
  if(!v){v=buildKart(paintColor(ci),kindOf(CHARS[ci]),CARS[ri].id);v.root.visible=false;
         if(pen)addPennant(v,pen);if(bask)addBasket(v);if(part)addPart(v,part);
         scene.add(v.root);rigCache.set(key,v);}
  return v;
}
/** the rival's pennant on a whip aerial at the back */
function addPennant(v,color){
  const pole=new THREE.Mesh(flat(new THREE.CylinderGeometry(.03,.03,2.2,4)),psMat({color:0xd8dde2}));
  pole.position.set(.62,1.6,-1.25);v.lean.add(pole);
  const tri=new THREE.BufferGeometry();
  tri.setAttribute('position',new THREE.Float32BufferAttribute([0,0,0, 0,-.5,0, 0,-.25,-.9],3));
  const fl=new THREE.Mesh(flat(tri),psMat({color,side:THREE.DoubleSide}));
  fl.position.set(.62,2.68,-1.25);v.lean.add(fl);
}
/** nine picnic stamps: a basket strapped on behind the driver */
function addBasket(v){
  const w=psMat({color:0xb07a3a}),c=psMat({color:0xc8281c});
  const b=new THREE.Mesh(flat(new THREE.BoxGeometry(.9,.5,.6)),w);b.position.set(0,1.05,-1.35);v.lean.add(b);
  const cl=new THREE.Mesh(flat(new THREE.BoxGeometry(.94,.08,.64)),c);cl.position.set(0,1.32,-1.35);v.lean.add(cl);
  const h=new THREE.Mesh(flat(new THREE.TorusGeometry(.3,.04,4,8,Math.PI)),w);h.position.set(0,1.36,-1.35);v.lean.add(h);
}
let carPicked=false;
const ownCar=ci=>Math.max(0,CARS.findIndex(r=>r.id===CHARS[ci].sig));
/** the car a driver races: the chosen driver's pick, or a previewed driver's own vehicle */
function carFor(ci){return ci===charSel?carSel:ownCar(ci);}
function showRig(){
  const ci=previewChar==null?charSel:previewChar;
  const v=rigFor(ci,carFor(ci));
  if(playerRig&&playerRig!==v)playerRig.root.visible=false;
  v.root.visible=true;playerRig=v;player.v=v;
  player.color=CHARS[charSel].color;
  nameKarts();
  renderCombo();
}
/** the player races under their own name (or the driver's); nobody else may share it */
function nameKarts(){
  player.name=SAVE.name||CHARS[charSel].short;
  karts.forEach((k,i)=>{if(i)k.name=k.cfg.name;});         /* only one of each */
  const tw=TWIN[CHARS[charSel].id];if(tw&&karts[tw[0]].cfg===ROSTER[tw[0]])karts[tw[0]].name=tw[1];
  dressTwins(tw);
  karts.forEach((k,i)=>{
    if(!i||k.name!==player.name)return;
    const t=Object.values(TWIN).find(w=>w[0]===i&&k.cfg===ROSTER[i]);
    k.name=t&&t[1]!==player.name?t[1]:k.name+' II';
  });
}
/** the twin races the same vehicle in its own paint; everyone else in their usual rig */
const twinRigs={};
function dressTwins(tw){
  karts.forEach((k,i)=>{
    if(!i||k.cfg!==ROSTER[i])return;
    if(!k.v0)k.v0=k.v;
    const R=ROSTER[i],want=tw&&tw[0]===i?(twinRigs[i]||(twinRigs[i]=(()=>{
      const v=buildKart(tw[2],R.kind,R.car,{twin:true});v.root.visible=false;scene.add(v.root);return v;})())):k.v0;
    if(k.v!==want){want.root.visible=k.v.root.visible;k.v.root.visible=false;k.v=want;}
  });
}
/** what a locked champion's card says: which cup to win */
const bossLockText=ci=>'Låst: vinn '+cupDef({cup:CHARS[ci].boss}).name+' för att köra som '+CHARS[ci].short+'.';
function applyCharacter(i,force){
  if(!force&&!charOpen(i)){peekCharacter(i);ping(220,160,.06);return;}   /* a look, and the lock text */
  if(i!==charSel||!carPicked){carSel=ownCar(i);carPicked=true;cmpCar=null;}   /* a new driver starts in their own vehicle */
  charSel=i;previewChar=null;showRig();
}
function peekCharacter(i){                /* hover/focus: look, don't commit */
  if(!previewOn||previewChar===i)return;
  previewChar=i;showRig();
}
function unpeek(){
  if(previewChar==null)return;
  previewChar=null;showRig();
}
/* phones pick in two steps: the driver (portraits beside one preview), then the vehicle */
const VS_PHONE=matchMedia('(max-width:760px),(max-height:540px)');
let vsStep='driver';
const vsTwoStep=()=>VS_PHONE.matches;
function vsShowStep(step){
  vsStep=step;
  const el=document.getElementById('pick'),two=vsTwoStep();
  el.classList.toggle('vsphone',two);el.dataset.step=two?step:'';
  document.querySelector('#pick .vs-title').textContent=two&&step==='car'?'VÄLJ FORDON':'VÄLJ FÖRARE';
  renderCombo();
  if(document.body.classList.contains('padnav'))       /* a pad keeps its focus on something visible */
    (document.querySelector(step==='car'&&two?'#btnGo':'#cards .vcard.sel')||document.getElementById('btnGo')).focus();
}
VS_PHONE.addEventListener('change',()=>vsShowStep(vsStep));
/* the panel's five bars: what the driver races with in this vehicle (effStats, the same numbers as
   physics) on one fixed scale for everyone. [label, stat, worst, best]; fuel burn runs backwards */
const COMBO=[['FART','maxSpeed',34,48],['ACCELERATION','power',22,37],['GREPP','gripOn',7,13.2],
  ['ÅKER','offRoad',.35,.95],['BRÄNSLESNÅLHET','burn',1.6,.7]];
const barCells=(E,f)=>Math.max(1,Math.round(clamp((E[f[1]]-f[2])/(f[3]-f[2]),0,1)*10));
/** a vehicle's own effect, better positive: +5 %, −8 % */
function pct(x,inv){const v=Math.round((inv?1-x:x-1)*100);return v?(v>0?'+':'−')+Math.abs(v)+' %':'±0';}
let cmpCar=null;                          /* the vehicle shown before this one, for gained/lost cells */
function renderCombo(){
  const host=document.getElementById('combo');if(!host)return;
  const ci=previewChar==null?charSel:previewChar,c=CHARS[ci],ri=carFor(ci),R=CARS[ri],M=R.mul;
  const E=effStats(c,ri),P=ci===charSel&&cmpCar!=null&&cmpCar!==ri?effStats(c,cmpCar):null;
  const capped=c.offRoad*M.offRoad>OFFROAD_CAP&&M.offRoad>1;
  host.innerHTML=COMBO.map(f=>{
    const n=barCells(E,f),was=P?barCells(P,f):n,inv=f[1]==='burn';
    let cells='';for(let q=0;q<10;q++)cells+='<b class="'+(q<n?(q>=was?'on gain':'on'):(q<was?'lost':''))+'"></b>';
    const top=f[1]==='offRoad'&&capped,m=pct(M[f[1]],inv);
    return '<div class="vbar"><span>'+f[0]+'</span><i>'+cells+'</i><em class="'+(top?'cap':m[0]==='+'?'up':m[0]==='−'?'down':'')+
      '">'+(top?'TAK':m)+'</em></div>';
  }).join('');
  const sr=M.spinResist,spin=sr<1?'KORTARE SPINN VID VISSA TRÄFFAR':sr>1?'LÄNGRE SPINN VID VISSA TRÄFFAR':'VANLIGA SPINN';
  const more=['<p>STAPLAR: FÖRARE OCH BIL. SIFFROR: BILEN SJÄLV.'+(P?' GULT/RÖTT: MOT '+CARS[cmpCar].name+'.':'')+'</p>',
    '<p><b>BOOST</b> '+pct(M.boostMul)+' FARTTAK MED BOOST</p>',
    '<p><b>SPINN</b> '+(sr===1?'':pct(sr,true)+' · ')+spin+'</p>'];
  if(capped)more.push('<p><b>ÅKER</b> '+c.short+' NÅR REDAN TAKET: BILENS '+pct(M.offRoad)+' GER INGET MER I TERRÄNGEN.</p>');
  host.parentNode.querySelector('#vsMore').innerHTML=more.join('');
  const peek=previewChar!=null&&previewChar!==charSel;
  const set=(id,t)=>{const e=document.getElementById(id);if(e)e.textContent=t;};
  set('vsName',c.name);set('vsHome',c.role);set('ptag',peek?'FÖRHANDSVISNING':'');
  set('vsCar',R.name);set('vsRole',R.role);set('vsCarSub',R.id===c.sig?'EGET FORDON · '+R.sub:R.sub);
  set('vsQuirk',c.quirk[0]);set('vsQuirkT',c.quirk[1]);set('cblurb',charOpen(ci)?c.blurb:bossLockText(ci));
  set('btnGoT',vsTwoStep()&&vsStep==='driver'?'NÄSTA':cupSetup?'STARTA CUPEN':vsTwoStep()?'STARTA':'VÄLJ '+CHARS[charSel].short);
  document.querySelectorAll('#cards .vcard').forEach(el=>{const n=+el.dataset.i,open=charOpen(n);
    if(el.classList.contains('locked')===open){const im=el.querySelector('img'),was=im.src;
      if(im.dataset.sil){im.src=im.dataset.sil;im.dataset.sil=was;}}   /* silhouette and portrait trade places */
    el.classList.toggle('locked',!open);el.querySelector('span').textContent=open?CHARS[n].short:'LÅST';
    el.classList.toggle('sel',n===charSel);el.classList.toggle('peek',peek&&n===ci);
    el.setAttribute('aria-selected',n===charSel);});
}
function applyCar(i){
  if(!CARS[i])return;
  if(i!==carSel)cmpCar=carSel;
  carSel=i;showRig();
}
function stepCar(d){
  const n=FREECARS.indexOf(carSel);applyCar(FREECARS[(n+d+FREECARS.length)%FREECARS.length]);
}

/** grid slots front to back: today's order, the player last in cup round 1,
    then reverse standings so the cup leader starts at the back */
function gridOrder(){
  if(!CUP)return [0,1,2,3,4,5];
  if(!CUP.res.length)return [1,2,3,4,5,0];
  return standings(CUP).reverse();
}
function placeOnGrid(){
  applyChampion();
  const G=gridOrder(),C=cupClass();
  karts.forEach((k,i)=>{
    const g=G.indexOf(i),row=Math.floor(g/2),col=(g%2)?1:-1;
    const s=(10+row*16)%N,off=col*3.4;
    k.x=sx[s]+rx[s]*off;k.z=sz[s]+rz[s]*off;k.si=s;
    k.rib=0;k.plan=0;k.planned={};k.mi=s;k.recoverT=0;k.ghost=0;k.stuckT=0;k.stuckP=-1e9;
    k.yaw=Math.atan2(fx[s],fz[s]);
    k.vx=k.vz=0;k.vy=0;k.air=false;k.airT=0;k.lap=0;k.cp=0;k.gate=0;k.progress=s;
    k.drift=0;k.charge=0;k.dstage=0;k.boost=0;k.slow=0;k.itemBias=0;k.lean=0;k.spin=0;k.speed=0;
    k.lapStart=0;k.best=null;k.total=null;k.done=false;
    k.lineVar=k.ai?((Math.random()*3)|0)-1:0;k.wantFuel=false;k.rtp=false;k.offT=0;k.curse=0;k.hazAt=-9;
    k.lapTimes=[];k.ghostBuf=TT&&!k.ai?[]:null;k.noBand=false;
    k.parked=(TT||FREE)&&k.ai;k.v.root.visible=!k.parked;k.blob.visible=!k.parked;
    const R=k.cfg;
    k.line=k.ai?rand(-R.lineSpread,R.lineSpread):0;
    k.fuel=TANK;k.atPump=false;k.warned=0;k.held=null;k.heldLvl=0;k.roll=0;k.shield=0;k.spun=0;
    k.boostLvl=0;k.shieldLvl=0;k.pans=0;k.panHit={};k.trapAt=-9;k.slick=0;k.launch=0;k.rattle=0;k.fartT=0;
    /* driver times vehicle, every stat set fresh each race so no old car lingers */
    Object.assign(k,k.ai?effStats(R,carIndex(R.car)):effStats(CHARS[charSel],carSel));
    if(k.ai){                                    /* class and rival tweaks on top, kept apart */
      k.maxSpeed*=C.speed*(CUP&&CUP.mirror&&CUP.rival===i&&cupChamp()?1.02:1);
      k.caution=R.caution*C.caution;k.lookAdd=R.lookAdd;
      k.bandMax=C.band;k.rival=!!CUP&&CUP.rival===i;
    }
    const P=k.ai?null:CHARS[charSel];
    k.milk=P?(P.milk||1):1;
    k.mass=P?(P.mass||1):1;k.shieldMul=P?(P.shieldMul||1):1;
    k.bucket=!!P&&P.id==='anders';k.bucketLap=-1;
    k.kvart=!!P&&P.id==='bjorn';k.kvartCue=false;k.suck=0;k.wheelie=!!P&&P.id==='mehmet';
    k.orig=!!P&&!!P.orig;k.clean=false;k.teoGap=0;k.idleT=0;k.idleDone=false;
    k.y=groundAt(k.x,k.z,s);
    k.v.root.position.set(k.x,k.y,k.z);
  });
}
