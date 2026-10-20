"use strict";
/* ───────── stage select ───────── */
/* Teo's spec: a roster of illustrated stage cards like the driver screen, four by two per page,
   and a large preview of the highlighted track. Everything here is read from STAGES: a track
   section brings its own order, tag line and portrait camera (view), and the roster, surfaces,
   shortcuts, stamps and route outline follow from its data. Moving the highlight never builds a
   world; only confirming does. Portraits are baked from the real scenery by tools/stage_art.py
   into STAGE_ART; a track without one gets a live render once the highlight rests on it.
   On phones (Teo, 2026-10-18) the roster is one scrolling list of compact rows beside, or in
   portrait under, a single preview; TILLBAKA and VÄLJ BANA stay in the bottom bar. */
const SS_COLS_WIDE=4, SS_PAGE=8;
const ROADNAME={asphalt:'ASFALT',cobble:'KULLERSTEN',concrete:'BETONG',sand:'SAND',kivik:'ASFALT',
  soderasen:'ASFALT',fotJord:'JORD',kkrSten:'GATSTEN',ven:'ASFALT',kalk:'KALKGRUS',angelholm:'GRUS',
  hoor:'GRUS',romeleSno:'SNÖ',kalmarSten:'GATSTEN'};
const MODENAME={race:'ENKELLOPP',tt:'TIDSLOPP',free:'SANDLÅDA',cup:'MÄSTERSKAP'};
const sheetStages=document.getElementById('stages');
const ssGrid=document.getElementById('ssGrid'),ssShot=document.getElementById('ssShot');
const SS={list:[],hi:0,cup:null,busy:false,art:{},outline:{}};
let artReq=0,artTimer=0;

const ssMode=()=>SS.cup?'cup':TT?'tt':FREE?'free':'race';
const stageModes=S=>S.modes||['race','tt','free','cup'];
/** the fixed roster: authored order first, anything without one after, in STAGES order */
function rosterOrder(){
  return STAGES.map((S,i)=>i).sort((a,b)=>(STAGES[a].order||100+a)-(STAGES[b].order||100+b));
}
/* phones (portrait, or a short landscape screen): one scrolling list of compact rows instead of pages */
const SS_LIST=matchMedia('(max-width:760px),(max-height:540px)');
const ssPer=()=>SS_LIST.matches?1e9:SS_PAGE;
const ssCols=()=>SS_LIST.matches?1:SS_COLS_WIDE;
const knownRoutes=S=>(S.routes||[]).filter(R=>!R.hidden||SAVE.routes[S.id+'.'+R.id]);
const stageArt=S=>(typeof STAGE_ART!=='undefined'&&STAGE_ART[S.id])||SS.art[S.id]||'';

/** a stand-in portrait until a real one exists: the stage's own sky, ground and initial */
function artStandIn(S){
  const c=document.createElement('canvas');c.width=160;c.height=90;
  const g=c.getContext('2d'),hex=n=>'#'+n.toString(16).padStart(6,'0');
  const gr=g.createLinearGradient(0,0,0,60);gr.addColorStop(0,hex(S.sky[1]));gr.addColorStop(1,hex(S.sky[0]));
  g.fillStyle=gr;g.fillRect(0,0,160,90);g.fillStyle=hex(S.fog[0]);g.fillRect(0,58,160,32);
  g.fillStyle='rgba(10,26,74,.55)';g.font='900 italic 44px "Titillium Web",sans-serif';g.textAlign='center';
  g.fillText(S.name[0],80,62);
  return c.toDataURL();
}
/** a portrait from the real scenery: build the world, hide the karts, shoot it from the stage's view */
function renderStageArt(S,w,h,type,q){
  w=w||320;h=h||180;
  if(stage!==S)buildWorld(S);
  const V=S.view||{i:N-36,lat:0,h:7,to:{i:30,lat:0,h:2}};
  /* a view point is a main-road sample {i,lat,h}, a lane {r,f,lat,h} or a spot {x,z,h}; y overrides the height */
  const P=q=>{
    let x,z,y;
    if(q.r){const R=ALTS.find(a=>a.id===q.r),j=clamp(Math.round((q.f==null?.5:q.f)*(R.n-1)),0,R.n-1),l=q.lat||0;
      x=R.X[j]+R.RX[j]*l;z=R.Z[j]+R.RZ[j]*l;y=R.Y[j];}
    else if(q.x!=null){x=q.x;z=q.z;y=meshY(x,z);}
    else{const i=((q.i%N)+N)%N,l=q.lat||0;x=sx[i]+rx[i]*l;z=sz[i]+rz[i]*l;y=Math.abs(l)<HW+2?sy[i]:meshY(x,z);}
    return new THREE.Vector3(x,q.y!=null?q.y:y+(q.h||0),z);};
  if(V.t!=null){const rt=raceTime;raceTime=V.t;updateHazards(0);raceTime=rt;}   /* hazards caught mid-act */
  const cam=new THREE.PerspectiveCamera(V.fov||55,w/h,.5,1400);
  cam.position.copy(P(V));cam.lookAt(P(V.to));
  const hid=items.filter(it=>it.mesh.visible).map(it=>it.mesh);   /* no item boxes in a portrait */
  for(const m of hid)m.visible=false;
  for(const o of scene.children)if(o!==world&&o!==skyMesh&&o!==moon&&o.visible){o.visible=false;hid.push(o);}
  const mir=MIRROR;if(mir)setMirror(false);
  skyMesh.position.copy(cam.position);
  const keep=RES.clone(),cc=new THREE.Color();renderer.getClearColor(cc);const ca=renderer.getClearAlpha();
  RES.set(w,h);renderer.setSize(w,h,false);renderer.setClearColor(0x0d2463,1);
  renderer.render(scene,cam);
  const url=canvas.toDataURL(type||'image/png',q);
  RES.copy(keep);renderer.setSize(keep.x,keep.y,false);renderer.setClearColor(cc,ca);
  for(const o of hid)o.visible=true;
  if(mir)setMirror(true);
  return url;
}
/** the route outline in plan view: the main loop and the lanes, sampled like sampleTrack/buildAlts
    but into local arrays, so it never touches the live track */
function stageOutline(S){
  if(SS.outline[S.id])return SS.outline[S.id];
  const pts=new THREE.CatmullRomCurve3(S.ctrl.map(p=>new THREE.Vector3(p[0],p[1],p[2])),true,'catmullrom',.5)
    .getSpacedPoints(N);
  const X=[],Z=[],RX=[],RZ=[];
  for(let i=0;i<N;i++){X.push(pts[i].x);Z.push(pts[i].z);}
  for(let i=0;i<N;i++){const a=(i-1+N)%N,b=(i+1)%N;let dx=X[b]-X[a],dz=Z[b]-Z[a];const L=Math.hypot(dx,dz)||1;
    RX.push(-dz/L);RZ.push(dx/L);}
  const routes={};
  for(const R of S.routes||[]){
    const lat0=R.side*(S.hw-R.hw),ld=R.lead||9,ll=R.side*(R.leadLat||10);
    const Q=(i,l)=>{i=((i%N)+N)%N;return new THREE.Vector3(X[i]+RX[i]*l,0,Z[i]+RZ[i]*l);};
    const A=Q(R.a+ld,ll),B=Q(R.b-ld,ll),cx=B.x-A.x,cz=B.z-A.z,cl=Math.hypot(cx,cz)||1,px=-cz/cl,pz=cx/cl;
    const L=[Q(R.a,lat0),Q(R.a+5,lat0),A];
    for(const m of R.mid)L.push(new THREE.Vector3(A.x+cx*m[0]+px*m[1],0,A.z+cz*m[0]+pz*m[1]));
    L.push(B,Q(R.b-5,lat0),Q(R.b,lat0));
    routes[R.id]=new THREE.CatmullRomCurve3(L,false,'catmullrom',.5).getSpacedPoints(40).map(v=>[v.x,v.z]);
  }
  return SS.outline[S.id]={main:X.map((x,i)=>[x,Z[i]]),routes};
}
function drawOutline(cv,S,mirror){
  const g=cv.getContext('2d'),W=cv.width,H=cv.height,O=stageOutline(S),show=knownRoutes(S);
  const all=O.main.concat(...show.map(R=>O.routes[R.id]));
  let x0=1e9,x1=-1e9,z0=1e9,z1=-1e9;
  for(const p of all){x0=Math.min(x0,p[0]);x1=Math.max(x1,p[0]);z0=Math.min(z0,p[1]);z1=Math.max(z1,p[1]);}
  const s=Math.min((W-16)/(x1-x0||1),(H-16)/(z1-z0||1));
  const XY=p=>[W/2+((mirror?-1:1)*(p[0]-(x0+x1)/2))*s,H/2+(p[1]-(z0+z1)/2)*s];
  const line=(L,closed)=>{g.beginPath();L.forEach((p,i)=>{const q=XY(p);i?g.lineTo(q[0],q[1]):g.moveTo(q[0],q[1]);});
    if(closed)g.closePath();g.stroke();};
  g.clearRect(0,0,W,H);g.lineJoin='round';
  g.strokeStyle='#0a1a4a';g.lineWidth=7;line(O.main,true);
  g.strokeStyle='#eef2fb';g.lineWidth=3.5;line(O.main,true);
  g.setLineDash([4,3]);g.strokeStyle='#ffd54a';g.lineWidth=2.5;
  for(const R of show)line(O.routes[R.id],false);
  g.setLineDash([]);
  const st=XY(O.main[10]);g.fillStyle='#ffd54a';g.fillRect(st[0]-3,st[1]-3,6,6);
}

/* the cards */
/** the cup's rounds in their fixed order, or the whole roster */
function ssList(){
  if(SS.cup)return cupRounds(SS.cup).map(id=>STAGES.findIndex(S=>S.id===id));
  return rosterOrder();
}
/** why a stage can't be picked in this mode, or '' */
function ssBlocked(S){
  const m=ssMode();
  if(!stageModes(S).includes(m))return 'INTE I '+MODENAME[m];
  return '';
}
function cupStatus(k){const c=SS.cup;return k<c.round?'done':k===c.round?'next':'later';}
const CUPTAG={done:'AVKLARAD',next:'NÄSTA',later:'KOMMANDE'};
function buildStageCards(){
  SS.list=ssList();
  ssGrid.innerHTML=SS.list.map((si,k)=>{
    const S=STAGES[si],[got,of]=stageStamps(S),why=ssBlocked(S),cs=SS.cup&&cupStatus(k);
    const mir=!SS.cup&&SAVE.unlock['mirror_'+S.id];
    return '<button class="scard'+(why?' off':'')+(cs?' cup-'+cs:'')+'" role="option" data-k="'+k+'" aria-label="'+S.name+
      (why?', '+why:'')+(cs?', '+CUPTAG[cs]:'')+'">'+
      '<span class="sc-img"><img alt="" src="'+(stageArt(S)||artStandIn(S))+'"></span>'+
      '<span class="sc-name">'+S.name+'</span>'+
      (of||mir?'<span class="sc-badges">'+(of?'<em class="sc-stamp" title="Picknickstämplar">'+got+'/'+of+'</em>':'')+
        (mir?'<em class="sc-mir" title="Spegelvänd upplåst">'+MIRSVG+'</em>':'')+'</span>':'')+
      (cs?'<span class="sc-cup">'+CUPTAG[cs]+'</span>':'')+
      (S.bonus&&!cs?'<span class="sc-bonus">BONUSBANA</span>':'')+
      (why?'<span class="sc-why">'+why+'</span>':'')+'</button>';
  }).join('');
  ssGrid.querySelectorAll('.scard').forEach(el=>el.addEventListener('click',()=>{
    if(SS.swiped)return;bootAudio();ssHighlight(+el.dataset.k,true);}));
}
const MIRSVG='<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M7 1h2v14H7zM5 4 1 8l4 4zm6 0 4 4-4 4z" fill="currentColor"/></svg>';
const LOCKSVG='<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4 7V5a4 4 0 0 1 8 0v2h1v8H3V7zm2 0h4V5a2 2 0 0 0-4 0z" fill="currentColor"/></svg>';
const ssPages=()=>Math.max(1,Math.ceil(SS.list.length/ssPer()));
const ssPage=()=>Math.floor(SS.hi/ssPer());
function renderPage(){
  const p=ssPage(),n=ssPages(),per=ssPer();
  sheetStages.classList.toggle('sslist',SS_LIST.matches);
  ssGrid.querySelectorAll('.scard').forEach((el,k)=>{
    el.hidden=Math.floor(k/per)!==p;
    const on=k===SS.hi;el.classList.toggle('sel',on);el.setAttribute('aria-selected',on);
    if(on&&SS_LIST.matches){            /* keep the highlighted row inside the scrolling list */
      const t=el.offsetTop,b=t+el.offsetHeight,g=ssGrid;
      if(t<g.scrollTop)g.scrollTop=t-4;else if(b>g.scrollTop+g.clientHeight)g.scrollTop=b-g.clientHeight+4;
    }});
  document.getElementById('ssPageN').textContent=(p+1)+' / '+n;
  document.getElementById('ssPrev').disabled=p===0;
  document.getElementById('ssNext').disabled=p>=n-1;
  document.getElementById('ssPager').hidden=n<2;
}

/* the preview */
const fmtOr=t=>t!=null&&isFinite(t)?fmt(t):'—';
function ssInfoRows(S){
  const m=ssMode(),rows=[],mir=m!=='tt'&&m!=='cup'&&mirrorSel&&!!SAVE.unlock['mirror_'+S.id];
  if(S.bonus)rows.push(['BONUSBANA',S.bonusNote||'Ingen cup. Eget föremål i lådorna'+(SIGS.extraallt&&SIGS.extraallt.event===S.id?': Extra Allt':'')]);
  if(m==='race'||m==='cup')rows.push(['VARV',String(S.laps||3)]);
  if(m==='tt')rows.push(['VARV','1 + 3 flygande']);
  const known=knownRoutes(S);
  const surf=[ROADNAME[S.road]||'ASFALT'].concat((S.zones||[]).map(z=>SURF[z[2]].name),known.map(R=>SURF[R.surface].name),known.some(R=>R.mud)?['LERA']:[]);
  rows.push(['UNDERLAG',[...new Set(surf)].map(t=>t[0]+t.slice(1).toLowerCase()).join(' · ')]);
  rows.push(['GENVÄGAR',known.length?String(known.length):'Inga kända']);
  const [got,of]=stageStamps(S);
  if(of)rows.push(['PICKNICKPASS',got+' / '+of]);
  if(m==='race'){
    const B=SAVE.best[S.id+(mir?'_m':'')];
    rows.push(['REKORD',B?fmt(B.t)+' · varv '+fmtOr(B.lap)+'<small>ENKELLOPP · '+(mir?'SPEGELVÄND':'NORMAL')+'</small>':
      'INGET REKORD ÄN<small>ENKELLOPP · '+(mir?'SPEGELVÄND':'NORMAL')+'</small>']);
  }else if(m==='tt'){
    const G=SAVE.ghosts[S.id],A=ARNE_GHOST[S.id];
    rows.push(['REKORD',(G?'Bästa varv '+fmt(G.t):'INGET REKORD ÄN')+'<small>TIDSLOPP · NORMAL</small>']);
    if(A)rows.push(['ARNE','Bästa varv '+fmt(A.t)]);
    rows.push(['SPEGELVÄND',SAVE.unlock['mirror_'+S.id]?'Upplåst: välj den i Enkellopp':'Slå Bonden Arnes varv för att låsa upp']);
  }else if(m==='cup'){
    const k=SS.list.indexOf(STAGES.indexOf(S)),c=SS.cup,cs=cupStatus(k);
    rows.push(['RUNDA',(k+1)+' av '+SS.list.length+' · '+CUPTAG[cs][0]+CUPTAG[cs].slice(1).toLowerCase()]);
    if(cs==='done'&&c.res[k])rows.push(['DU BLEV',ordSv(c.res[k][0])+' · +'+(POINTS[c.res[k][0]-1]||0)+' p']);
  }
  return rows;
}
function renderPreview(){
  const si=SS.list[SS.hi],S=STAGES[si],m=ssMode();
  if(!S)return;
  const art=stageArt(S);
  ssShot.src=art||artStandIn(S);
  ssShot.classList.remove('pan');void ssShot.offsetWidth;ssShot.classList.add('pan');
  document.getElementById('ssName').textContent=S.name;
  document.getElementById('ssSub').textContent=S.sub;
  document.getElementById('ssTag').textContent=S.tag||'';
  document.getElementById('ssInfo').innerHTML=ssInfoRows(S).map(r=>'<dt>'+r[0]+'</dt><dd>'+r[1]+'</dd>').join('');
  const mirOn=m!=='tt'&&m!=='cup'&&mirrorSel&&!!SAVE.unlock['mirror_'+S.id];
  drawOutline(document.getElementById('ssMap'),S,m==='cup'?!!SS.cup.mirror:mirOn);
  /* mirror: a toggle where it is open, a padlock where it is not, nothing in a time trial or a cup */
  const mb=document.getElementById('btnSsMirror'),open=!!SAVE.unlock['mirror_'+S.id];
  mb.hidden=m==='tt'||m==='cup';
  mb.disabled=!open;
  mb.classList.toggle('on',mirOn);
  mb.innerHTML=(open?MIRSVG:LOCKSVG)+'<span>SPEGELVÄND: '+(open?(mirOn?'PÅ':'AV'):'LÅST')+'</span>';
  mb.title=open?'':'Slå Bonden Arnes varv i Tidslopp för att låsa upp';
  const why=ssBlocked(S);
  document.getElementById('ssWhy').textContent=why;
  /* the launch button: the highlighted stage, or in a cup always the next round */
  const go=document.getElementById('btnStageGo');
  if(m==='cup'){const nx=STAGES[SS.list[SS.cup.round]];
    document.getElementById('btnStageGoT').textContent='STARTA NÄSTA LOPP · '+nx.name;go.disabled=false;}
  else{document.getElementById('btnStageGoT').textContent='VÄLJ '+S.name;go.disabled=!!why;}
}
/** the live render for a stage with no baked portrait, once the highlight has rested on it */
function queueArt(){
  const tok=++artReq;clearTimeout(artTimer);
  const S=STAGES[SS.list[SS.hi]];
  if(!S||stageArt(S))return;
  artTimer=setTimeout(()=>{
    if(tok!==artReq||sheetStages.classList.contains('hide'))return;
    const url=renderStageArt(S);SS.art[S.id]=url;
    const el=ssGrid.querySelector('.scard[data-k="'+SS.list.indexOf(STAGES.indexOf(S))+'"] img');if(el)el.src=url;
    if(tok===artReq&&STAGES[SS.list[SS.hi]]===S)renderPreview();   /* never onto a newer highlight */
  },450);
}
function ssHighlight(k,sound){
  k=clamp(k,0,SS.list.length-1);
  const page=Math.floor(k/ssPer())!==ssPage();
  if(k===SS.hi&&!page&&SS.shown)return;
  if(sound)page?ping(420,260,.08):ping(700,980,.04);
  SS.hi=k;SS.shown=true;
  if(!SS.cup)stageSel=SS.list[k];
  renderPage();renderPreview();queueArt();
}

/* moving the highlight */
function ssCell(k){const c=ssCols(),per=ssPer(),o=k%per;return {p:Math.floor(k/per),r:Math.floor(o/c),c:o%c};}
/** the card on page p nearest to row r, column c, or -1 */
function ssNearest(p,r,c){
  let best=-1,d=1e9;
  const per=ssPer();
  for(let k=p*per;k<Math.min(SS.list.length,(p+1)*per);k++){
    const q=ssCell(k),e=(q.r-r)*(q.r-r)*4+(q.c-c)*(q.c-c);
    if(e<d){d=e;best=k;}
  }
  return best;
}
function ssMove(dir){
  if(SS_LIST.matches&&(dir==='l'||dir==='r'))dir=dir==='l'?'u':'d';   /* one column: sideways steps the list */
  const q=ssCell(SS.hi),cols=ssCols(),n=SS.list.length;
  let k=-1;
  if(dir==='l'||dir==='r'){
    const s=dir==='l'?-1:1,t=SS.hi+s,tc=q.c+s;
    if(tc>=0&&tc<cols&&t<n&&Math.floor(t/ssPer())===q.p)k=t;
    else if(q.p+s>=0&&q.p+s<ssPages())k=ssNearest(q.p+s,q.r,s<0?cols-1:0);   /* off the edge: the next page */
  }else{                                  /* up and down stay on the page, nearest column in the next row */
    const r=q.r+(dir==='u'?-1:1);let d=1e9;
    const per=ssPer();
    for(let t=q.p*per;t<Math.min(n,(q.p+1)*per);t++){const c=ssCell(t);
      if(c.r===r&&Math.abs(c.c-q.c)<d){d=Math.abs(c.c-q.c);k=t;}}
  }
  if(k>=0&&k!==SS.hi)ssHighlight(k,true);
}
function ssTurn(s){
  const p=ssPage()+s;
  if(p<0||p>=ssPages())return;
  const q=ssCell(SS.hi);ssHighlight(ssNearest(p,q.r,q.c),true);
}
function ssMirror(){
  const S=STAGES[SS.list[SS.hi]],m=ssMode();
  if(m==='tt'||m==='cup'||!SAVE.unlock['mirror_'+S.id])return;
  mirrorSel=!mirrorSel;ping(600,900,.05);renderPreview();
}
function ssConfirm(){
  if(SS.busy||sheetStages.classList.contains('hide'))return;
  const m=ssMode(),k=m==='cup'?SS.cup.round:SS.hi,si=SS.list[k],S=STAGES[si];
  if(!S||ssBlocked(S))return;
  SS.busy=true;bootAudio();ping(520,1400,.22);
  const el=ssGrid.querySelector('.scard[data-k="'+k+'"]');if(el)el.classList.add('flash');
  artReq++;clearTimeout(artTimer);
  setTimeout(()=>{
    SS.busy=false;if(el)el.classList.remove('flash');
    if(m==='cup'){if(stage!==S)applyStage(si);startCupRound();return;}
    stageSel=si;applyStage(si);showSelect();
  },220);
}
function ssBack(){
  if(SS.busy)return;
  artReq++;clearTimeout(artTimer);
  if(SS.cup)showBrief();else showMenu();
}

/** pick a stage and build its world (the debug menu and the cup brief use this too) */
function applyStage(i){
  stageSel=i;
  buildWorld(STAGES[i]);
  placeOnGrid();camInit=false;
}
function openStages(cup){
  hideSheets();setMirror(false);
  previewOn=false;unpeek();setPause(false);
  state='select';camInit=false;
  document.body.classList.remove('racing');
  SS.cup=cup||null;SS.shown=false;
  buildStageCards();
  const hm=document.getElementById('ssMode');
  hm.textContent=SS.cup?cupDef(SS.cup).name+' · '+cupClass().name+(SS.cup.mirror?' · SPEGELVÄND':'')+
    ' · RUNDA '+(SS.cup.round+1)+' AV '+SS.list.length:MODENAME[ssMode()];
  sheetStages.classList.toggle('cupview',!!SS.cup);
  sheetStages.classList.remove('hide');
  const k=SS.cup?SS.cup.round:SS.list.indexOf(stageSel);
  SS.hi=-1;ssHighlight(k<0?0:k,false);
}
function showStages(){openStages(null);}
/** the championship's schedule: any round can be looked at, only the next one started */
function showCupStages(){if(SAVE.cup&&!SAVE.cup.done)openStages(SAVE.cup);}

/** keyboard on this screen; true when the key was ours */
function stageKeys(e,k){
  if(sheetStages.classList.contains('hide')||!padHelp.classList.contains('hide')||DBG.open)return false;
  document.body.classList.remove('padnav');
  if(k==='arrowleft'||k==='a')ssMove('l');
  else if(k==='arrowright'||k==='d')ssMove('r');
  else if(k==='arrowup'||k==='w')ssMove('u');
  else if(k==='arrowdown'||k==='s')ssMove('d');
  else if(k==='q')ssTurn(-1);
  else if(k==='e')ssTurn(1);
  else if(k==='v'){if(!e.repeat)ssMirror();}
  else if(k==='enter'||k===' '){if(!e.repeat)ssConfirm();}
  else if(k==='backspace'||k==='escape'){if(!e.repeat)ssBack();}
  else return false;
  e.preventDefault();bootAudio();
  return true;
}
/** the controller on this screen: D-pad or stick moves, LB/RB turn the page, A starts, B back, X mirror */
function stagePad(dir,hit){
  if(dir)ssMove(dir);
  if(hit(PB.A))ssConfirm();
  else if(hit(PB.B))ssBack();
  else if(hit(PB.X))ssMirror();
  else if(hit(PB.LB))ssTurn(-1);
  else if(hit(PB.RB))ssTurn(1);
}

document.getElementById('btnStageGo').addEventListener('click',ssConfirm);
document.getElementById('btnStageBack').addEventListener('click',ssBack);
document.getElementById('btnSsMirror').addEventListener('click',ssMirror);
document.getElementById('ssPrev').addEventListener('click',()=>{bootAudio();ssTurn(-1);});
document.getElementById('ssNext').addEventListener('click',()=>{bootAudio();ssTurn(1);});
document.getElementById('btnBriefStages').addEventListener('click',()=>{bootAudio();showCupStages();});
/* a sideways swipe over the roster turns the page; the tap that ends it picks nothing */
(function swipe(){
  let x0=0,y0=0,id=null;
  ssGrid.addEventListener('pointerdown',e=>{id=e.pointerId;x0=e.clientX;y0=e.clientY;SS.swiped=false;});
  ssGrid.addEventListener('pointerup',e=>{
    if(e.pointerId!==id)return;id=null;
    const dx=e.clientX-x0,dy=e.clientY-y0;
    if(Math.abs(dx)>48&&Math.abs(dx)>Math.abs(dy)*1.5){SS.swiped=true;ssTurn(dx<0?1:-1);
      setTimeout(()=>{SS.swiped=false;},0);}
  });
})();
addEventListener('resize',()=>{if(!sheetStages.classList.contains('hide'))renderPage();});
