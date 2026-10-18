"use strict";
/* ───────── race flow ───────── */
let state='menu',clock=0,raceTime=0,countdown=0,lastBeep=-1;
const sheetStart=document.getElementById('start'),sheetDone=document.getElementById('done');
function order(){
  const s=karts.filter(k=>!k.parked).sort((a,b)=>{
    if(a.done&&b.done)return a.total-b.total;
    if(a.done)return -1;if(b.done)return 1;
    return b.progress-a.progress;
  });
  s.forEach((k,i)=>k.place=i+1);
  return s;
}
function resetRace(){
  raceSeed=Math.random()*100;
  LAPS=TT?4:FREE?1e9:(stage.laps||3);                       /* a time trial gets three flying laps */
  if(TT)recordArne(stage);
  placeOnGrid();
  setMirror(CUP?!!CUP.mirror:(!TT&&mirrorSel&&!!SAVE.unlock['mirror_'+stage.id]));
  previewOn=false;setPause(false);
  raceTime=0;countdown=FREE?0.6:3.6;lastBeep=-1;camInit=false;shake=0;state='grid';
  hideSheets();document.body.classList.toggle('free',FREE);
  document.body.classList.add('racing');
  for(let i=0;i<PMAX;i++){pLife[i]=0;pPos[i*3+1]=-9999;}
  resetItems();
  shutPassages(null);
  if(TT)for(const it of items){it.cool=1e9;it.mesh.visible=false;}   /* no items in a time trial */
  for(const o of stampObjs)o.mesh.visible=!TT;
  clearPowerups();
  for(const k of karts){k.dome.visible=false;if(k.panG)k.panG.visible=false;}
  dbgOnReset();
  if(FREE)toast('SANDLÅDA · F1 FÖR DEBUG');
}
let lastWord='';
function finish(){
  state='over';setPause(false);
  lastWord=sayLine(player.place===1?'win':'lose')||'';
  if(lastWord)toast(lastWord);
  if(CUP){cupFinishPending=true;return;}    /* the rest of the field finishes first */
  showDone();
}
function showDone(){
  if(TT){showTTDone();return;}
  const sorted=order(),me=player.place,c=CUP;
  document.getElementById('doneTitle').textContent=(me===1?'SEGER!':'PLATS '+me);
  document.getElementById('doneSub').textContent=
    'TID '+fmt(player.total)+'  ·  BÄSTA VARV '+fmt(player.best);
  document.getElementById('doneSay').textContent=lastWord?CHARS[charSel].short+': ”'+lastWord+'”':'';
  const ol=document.getElementById('grid');ol.innerHTML='';
  sorted.forEach((k,i)=>{
    const li=document.createElement('li');
    if(k===player)li.className='me';
    li.innerHTML='<span class="p">'+(i+1)+'</span><span class="chip" style="background:#'+
      k.color.toString(16).padStart(6,'0')+'"></span><span class="nm">'+k.name+(c&&c.rival===k.idx?HORN:'')+
      '</span><span class="t">'+(k.done?fmt(k.total):'+'+((sorted[0].progress-k.progress)/N).toFixed(2)+' V')+'</span>'+
      (c?'<span class="pt">+'+(POINTS[i]||0)+'</span>':'');
    ol.appendChild(li);
  });
  const [got,of]=stageStamps(stage);
  document.getElementById('doneStamps').textContent=of?'PICKNICKSTÄMPLAR PÅ '+stage.name+': '+got+'/'+of:'';
  for(const id of ['btnAgain','btnSwap','btnStage','btnMenu'])document.getElementById(id).hidden=!!c;
  document.getElementById('btnTable').hidden=!c;
  if(!c&&player.done)saveBest();
  sheetDone.classList.remove('hide');
}
/** the single-race record per stage, normal and mirrored kept apart, shown on the stage picker */
function saveBest(){
  const key=stage.id+(MIRROR?'_m':''),B=SAVE.best[key]||{t:Infinity,lap:Infinity};
  SAVE.best[key]={t:Math.min(B.t,player.total),lap:Math.min(B.lap,player.best==null?Infinity:player.best)};
  writeSave();
}
function showTTDone(){
  const A=ARNE_GHOST[stage.id],G=SAVE.ghosts[stage.id],beat=A&&player.best!=null&&player.best<A.t;
  document.getElementById('doneTitle').textContent=beat?'ARNE SLAGEN!':'TIDSLOPP';
  document.getElementById('doneSub').textContent=stage.name+' · BÄSTA VARV '+fmt(player.best)+'  ·  ARNE '+fmt(A&&A.t);
  const row=(n,nm,t,me,col)=>'<li'+(me?' class="me"':'')+'><span class="p">'+n+'</span><span class="chip" style="background:'+col+
    '"></span><span class="nm">'+nm+'</span><span class="t">'+t+'</span></li>';
  let h=player.lapTimes.map((t,i)=>row(i+1,i?'FLYGANDE VARV':'START',fmt(t),t===player.best,'#'+player.color.toString(16).padStart(6,'0'))).join('');
  if(A)h+=row('A','BONDEN ARNE',fmt(A.t),false,'#8b2b1c');
  if(G)h+=row('★','DITT REKORD',fmt(G.t),false,'#ffffff');
  document.getElementById('grid').innerHTML=h;
  document.getElementById('doneStamps').textContent=SAVE.unlock['mirror_'+stage.id]?
    'SPEGELVÄND '+stage.name+' ÄR UPPLÅST: VÄLJ DEN PÅ BANVALET.':'SLÅ ARNES VARV FÖR ATT LÅSA UPP SPEGELVÄND '+stage.name+'.';
  for(const id of ['btnAgain','btnSwap','btnStage','btnMenu'])document.getElementById(id).hidden=false;
  document.getElementById('btnTable').hidden=true;
  sheetDone.classList.remove('hide');
}
const HORN='<svg class="horn" viewBox="0 0 16 16" role="img" aria-label="Rivalen"><title>Rivalen</title>'+
  '<path d="M1 6h3l7-4v12l-7-4H1z" fill="currentColor"/><path d="M12.5 5q2.5 3 0 6" stroke="currentColor" fill="none" stroke-width="1.6"/></svg>';
let cupFinishPending=false,raceRound=-1;
function hideSheets(){document.querySelectorAll('.sheet').forEach(e=>e.classList.add('hide'));}
function ordSv(n){return n+(n===1||n===2?':a':':e');}
/** best first: points, then most wins, most seconds and so on, then the last round */
function standings(c){
  const cnt=i=>{const a=[0,0,0,0,0,0];for(const r of c.res)a[r[i]-1]++;return a;};
  return [0,1,2,3,4,5].sort((a,b)=>{
    if(c.pts[b]!==c.pts[a])return c.pts[b]-c.pts[a];
    const A=cnt(a),B=cnt(b);
    for(let p=0;p<6;p++)if(A[p]!==B[p])return B[p]-A[p];
    const L=c.res[c.res.length-1];return L?L[a]-L[b]:a-b;
  });
}
/** after the player's flag the field races on for up to 30 s, run at once behind the sheet */
function cupComplete(){
  const brake={throttle:0,brake:0.4,steer:0,drift:false};
  for(let s=0;s<3600&&karts.some(k=>!k.done);s++){
    for(const k of karts){
      if(!k.ai){drive(k,FIXED,brake);continue;}
      const ctl=aiControl(k);k.aiSteer=ctl.steer;drive(k,FIXED,ctl);
    }
    separate();raceTime+=FIXED;
  }
  order();commitRound();showDone();
}
/** points go in exactly once: the round id joins applied in the same write */
function commitRound(){
  const c=SAVE.cup;
  if(!c||c!==CUP||raceRound!==c.round||c.applied.includes(c.round))return;
  raceRound=-1;                            /* this race can score once, and only for its own round */
  const before=standings(c),places=karts.map(k=>k.place);
  places.forEach((p,i)=>c.pts[i]+=POINTS[p-1]||0);
  c.res.push(places);c.applied.push(c.round);
  c.last={before,earned:places.map(p=>POINTS[p-1]||0)};
  c.round++;
  if(c.round>=cupRounds(c).length){
    c.done=true;
    const pl=standings(c).indexOf(0)+1,C=cupDef(c);c.final=pl;c.unlocked=[];
    const tk=trophyKey(c);
    if(pl<=3&&(!SAVE.trophies[tk]||pl<SAVE.trophies[tk]))SAVE.trophies[tk]=pl;
    if(!SAVE.unlock.cup){SAVE.unlock.cup=true;c.unlocked.push('KORNBLÅ LACK');}
    if(pl===1&&c.cls!=='easy'&&!SAVE.unlock.gold){SAVE.unlock.gold=true;c.unlocked.push('GULDKANNAN-LACK');}
    if(pl<=3&&C.champ&&!SAVE.unlock['cup_'+C.id]){       /* a podium opens the next championship */
      SAVE.unlock['cup_'+C.id]=true;const nx=CUPS.find(D=>D.need===C.id);if(nx)c.unlocked.push(nx.name+' ÖPPNAD');}
    if(pl===1&&C.champ){                   /* beat the champion: their paint and a piece of their kart */
      if(!SAVE.unlock['win_'+C.id]){
        SAVE.unlock['win_'+C.id]=true;
        const P=PAINTS.find(q=>q.unlock==='win_'+C.id),Q=PARTS.find(q=>q.unlock==='win_'+C.id);
        c.unlocked.push(P.name+'-LACK',Q.name);
        if(C.id!=='final'&&cupOpen(cupDef({cup:'final'})))c.unlocked.push('FINALEN MOT RAKET-RUNE');
        if(C.id!=='final')c.unlocked.push(C.name+' SPEGELVÄND');
        const B=CHARS.find(d=>d.boss===C.id);if(B)c.newDriver=B.id;        /* the champion joins the drivers */
      }
    }else if(pl===1){                      /* beat the rival: their paint, and their pennant on your kart */
      const rk='rival'+c.rival,P=PAINTS.find(p=>p.unlock===rk);
      if(!SAVE.unlock[rk]){SAVE.unlock[rk]=true;c.unlocked.push(P.name+'-LACK');}
      SAVE.unlock.pennant=true;SAVE.pennant=ROSTER[c.rival].color;SAVE.pennantOn=true;
      c.unlocked.push(ROSTER[c.rival].name+'S VIMPEL');
    }
  }
  writeSave();
}
const rivalTag=new THREE.Sprite(new THREE.SpriteMaterial({map:pixTex(32,32,(g)=>{
  g.fillStyle='#063a66';g.beginPath();g.arc(16,16,15,0,6.283);g.fill();
  g.fillStyle='#ffd54a';g.beginPath();g.moveTo(5,13);g.lineTo(10,13);g.lineTo(22,6);g.lineTo(22,26);
  g.lineTo(10,19);g.lineTo(5,19);g.fill();
  g.strokeStyle='#ffd54a';g.lineWidth=2.5;g.beginPath();g.arc(23,16,5,-1,1);g.stroke();
}),depthWrite:false,transparent:true}));
rivalTag.scale.set(1.5,1.5,1);rivalTag.visible=false;scene.add(rivalTag);
function drawRivalTag(){
  const k=CUP&&karts[CUP.rival];
  rivalTag.visible=!!k&&(state==='race'||state==='grid'||state==='over');
  if(k)rivalTag.position.set(k.x,k.y+3.6,k.z);
}
const sheetPick=document.getElementById('pick');
let cupSetup=false;
/** a pixel portrait per driver, drawn once by the game renderer into a data URL */
const SILHOUETTE=new THREE.MeshBasicMaterial({color:0x0a1a4a});
/** sil: an unbeaten champion's card, the shape in solid navy */
function portrait(ci,sil){
  const c=CHARS[ci],v=buildKart(c.color,kindOf(c),'kart'),ps=new THREE.Scene();
  ps.add(v.root);if(sil)ps.overrideMaterial=SILHOUETTE;
  const cam=new THREE.PerspectiveCamera(30,1,.1,50);
  const hy=kindOf(c)==='cow'?1.92:1.86;
  cam.position.set(.7,hy+.32,1.55);cam.lookAt(0,hy-.12,-.6);
  const keep=RES.clone(),cc=new THREE.Color();renderer.getClearColor(cc);const ca=renderer.getClearAlpha();
  RES.set(72,72);renderer.setSize(72,72,false);renderer.setClearColor(0x3d86dc,1);
  renderer.render(ps,cam);
  const url=canvas.toDataURL('image/png');
  RES.copy(keep);renderer.setSize(keep.x,keep.y,false);renderer.setClearColor(cc,ca);
  return url;
}
(function buildCards(){
  document.getElementById('cards').style.setProperty('--cols',GRID_COLS);
  document.getElementById('cards').innerHTML=GRID.map(i=>
    '<button class="vcard" role="option" data-i="'+i+'" aria-label="'+CHARS[i].name+'"><img alt="" src="'+portrait(i)+'"'+
    (CHARS[i].boss?' data-sil="'+portrait(i,true)+'"':'')+'><span>'+
    CHARS[i].short+'</span></button>').join('');
  resize();
  document.querySelectorAll('#cards .vcard').forEach(el=>{
    const i=+el.dataset.i;
    el.addEventListener('click',()=>{bootAudio();ping(700,980,.05);applyCharacter(i);});
    el.addEventListener('pointerenter',()=>peekCharacter(i));
    el.addEventListener('focus',()=>peekCharacter(i));
    el.addEventListener('pointerleave',unpeek);
    el.addEventListener('blur',unpeek);
  });
  document.getElementById('carPrev').addEventListener('click',()=>{bootAudio();ping(700,980,.05);stepCar(-1);});
  document.getElementById('carNext').addEventListener('click',()=>{bootAudio();ping(700,980,.05);stepCar(1);});
  document.getElementById('btnBack').addEventListener('click',()=>{bootAudio();
    if(cupSetup){previewOn=false;unpeek();showCupSetup();}else showStages();});
  applyCharacter(0);
})();
let stageSel=1,mirrorSel=false;                /* the stage picker lives in its own section */
function showSelect(){
  hideSheets();
  previewOn=true;
  document.getElementById('vsMode').textContent=(cupSetup?CUPS[cupSel].name+' · '+CLASSES[classSel].name:TT?'TIDSLOPP':FREE?'SANDLÅDA':'ENKELLOPP')+
    ' · '+STAGES[stageSel].name;
  renderPaints();
  sheetStages.classList.add('hide');
  state='select';camInit=false;
  document.body.classList.remove('racing');
  sheetStart.classList.add('hide');sheetDone.classList.add('hide');
  sheetPick.classList.remove('hide');
  applyCharacter(charSel);placeOnGrid();
}
const sheetPaused=document.getElementById('paused');
let paused=false;
function setPause(on){
  if(on&&state!=='race'&&state!=='grid')return;
  paused=!!on;
  document.getElementById('btnQuit').hidden=!!CUP;
  document.getElementById('btnCupQuit').hidden=!CUP;
  sheetPaused.classList.toggle('hide',!paused);
}
document.getElementById('pause').addEventListener('click',()=>setPause(!paused));
document.getElementById('rescue').addEventListener('click',()=>askRecover(player));
document.getElementById('btnResume').addEventListener('click',()=>setPause(false));
document.getElementById('btnRestart').addEventListener('click',()=>{setPause(false);resetRace();});
document.getElementById('btnQuit').addEventListener('click',()=>{setPause(false);showStages();});
function startRace(){previewOn=false;unpeek();sheetPick.classList.add('hide');resetRace();}
function goFromSelect(){
  if(!cupSetup){CUP=null;startRace();return;}
  cupSetup=false;previewOn=false;unpeek();
  SAVE.cup={v:CUP_SAVE_V,cup:CUPS[cupSel].id,cls:CLASSES[classSel].id,char:charSel,car:carSel,rival:1+((Math.random()*5)|0),
    rounds:CUPS[cupSel].rounds.slice(),round:0,pts:[0,0,0,0,0,0],res:[],applied:[],done:false,mirror:mirrorOpen(CUPS[cupSel])&&cupMirrorSel};
  writeSave();                             /* autosave after setup */
  showBrief();
}
document.getElementById('btnStart').addEventListener('click',()=>{bootAudio();CUP=null;cupSetup=false;TT=false;FREE=false;showStages();});
document.getElementById('btnTT').addEventListener('click',()=>{bootAudio();CUP=null;cupSetup=false;TT=true;FREE=false;showStages();});
document.getElementById('btnGo').addEventListener('click',()=>{bootAudio();goFromSelect();});
document.getElementById('btnMenu').addEventListener('click',showMenu);
document.getElementById('btnCupQuit').addEventListener('click',()=>{setPause(false);showMenu();});

/* ───────── menu, cup sheets, album ───────── */
const CUPSVG=(c,label)=>'<svg viewBox="0 0 24 24" role="img" aria-label="'+label+'"><path d="M6 3h12v4a6 6 0 0 1-12 0z" fill="'+c+
  '"/><path d="M6 5H3a3 3 0 0 0 3 4M18 5h3a3 3 0 0 1-3 4" stroke="'+c+'" stroke-width="1.6" fill="none"/>'+
  '<rect x="10.5" y="12" width="3" height="5" fill="'+c+'"/><rect x="7" y="17" width="10" height="3" rx="1" fill="'+c+'"/></svg>';
const CHURN='<svg viewBox="0 0 44 52" role="img" aria-label="Den gyllene mjölkkannan"><path d="M14 4h16v5l5 6v30a4 4 0 0 1-4 4H13a4 4 0 0 1-4-4V15l5-6z" fill="#ffd54a" stroke="#fff" stroke-width="2"/>'+
  '<rect x="12" y="2" width="20" height="5" rx="2" fill="#f0a818"/><path d="M9 26h26M9 38h26" stroke="#f0a818" stroke-width="2.5"/></svg>';
const OSTKAKA='<svg viewBox="0 0 54 30" role="img" aria-label="Ostkaka"><ellipse cx="27" cy="20" rx="24" ry="8" fill="#e9d7a6"/>'+
  '<rect x="3" y="11" width="48" height="9" fill="#efe2b8"/><ellipse cx="27" cy="11" rx="24" ry="8" fill="#f7eecd"/>'+
  '<ellipse cx="27" cy="10" rx="9" ry="3.5" fill="#b8243a"/></svg>';
const MEDAL=['','GULD','SILVER','BRONS'],MEDALC=['','#ffd54a','#dfe7ee','#d08a4a'];
function refreshMenu(){
  const c=SAVE.cup,b=document.getElementById('btnResumeCup');
  b.hidden=!(c&&!c.done);
  if(c&&!c.done)b.textContent='FORTSÄTT '+cupDef(c).name+' · '+(c.round+1)+'/'+cupRounds(c).length;
  const h2=document.querySelector('#start h2');if(h2)h2.textContent='SKÅNE · '+STAGES.length+' BANOR · '+CHARS.length+' FÖRARE';
  document.getElementById('btnName').textContent='NAMN · '+(SAVE.name||CHARS[charSel].short);
  document.getElementById('btnAlbum').textContent='PICKNICKPASSET · '+stampCount()+'/'+allStamps().length;
  const shelf=(C,m)=>{const t=SAVE.trophies[C.id+m];
    return '<div>'+(t?CUPSVG(MEDALC[t],MEDAL[t]):CUPSVG('rgba(255,255,255,.18)','Ingen pokal'))+C.sub+(m?' · SPEGEL':'')+
      '<b>'+(t?MEDAL[t]:'—')+'</b></div>';};
  const champs=CUPS.filter(C=>C.id!=='skane'&&(cupOpen(C)||bestMedal(C))).map(C=>{const t=bestMedal(C);
    return '<div>'+(t?CUPSVG(MEDALC[t],MEDAL[t]):CUPSVG('rgba(255,255,255,.18)','Ingen pokal'))+C.short+'<b>'+(t?MEDAL[t]:'—')+'</b></div>';}).join('');
  document.getElementById('shelf').innerHTML=CLASSES.map(C=>shelf(C,'')).join('')+
    (SAVE.unlock.cup?CLASSES.map(C=>shelf(C,'_m')).join(''):'')+champs;
  document.getElementById('saveNote').hidden=saveOK;
}
function showMenu(){
  hideSheets();setPause(false);previewOn=false;unpeek();
  state='menu';camInit=false;CUP=null;cupSetup=false;TT=false;FREE=false;setMirror(false);
  document.body.classList.remove('racing','free');
  refreshMenu();sheetStart.classList.remove('hide');
}
let classSel=1;
(function buildClassCards(){
  document.getElementById('classcards').innerHTML=CLASSES.map((C,i)=>
    '<button class="card'+(i===classSel?' sel':'')+'" data-i="'+i+'"><div class="cn">'+C.name+
    '</div><div class="cr">'+C.sub+'</div></button>').join('');
  document.querySelectorAll('#classcards .card').forEach(el=>el.addEventListener('click',()=>{
    bootAudio();ping(700,980,.05);pickClass(+el.dataset.i);}));
})();
function pickClass(i){
  classSel=i;
  document.querySelectorAll('#classcards .card').forEach((el,n)=>el.classList.toggle('sel',n===i));
  document.getElementById('classblurb').textContent=CLASSES[i].blurb;
}
let cupMirrorSel=false,cupSel=0;
function bestMedal(C){
  let b=0;for(const k in SAVE.trophies)if(C.id==='skane'?!/_/.test(k.replace(/_m$/,'')):k.indexOf(C.id+'_')===0)
    b=b?Math.min(b,SAVE.trophies[k]):SAVE.trophies[k];
  return b;
}
function renderCups(){
  document.getElementById('cupcards').innerHTML=CUPS.map((C,i)=>{const open=cupOpen(C),m=bestMedal(C),ch=C.champ&&CHAMPS[C.champ];
    return '<button class="card'+(i===cupSel?' sel':'')+(open?'':' lock')+'" data-i="'+i+'"><div class="cn">'+C.name+'</div><div class="cr">'+
      (open?C.rounds.length+(C.rounds.length>1?' BANOR':' LOPP')+(ch?' · '+ch.name:'')+(m?' · '+MEDAL[m]:''):'LÅST')+'</div></button>';}).join('');
  document.querySelectorAll('#cupcards .card').forEach(el=>el.addEventListener('click',()=>{
    bootAudio();ping(700,980,.05);pickCup(+el.dataset.i);}));
}
function pickCup(i){
  cupSel=i;const C=CUPS[i],open=cupOpen(C);
  if(!mirrorOpen(C))cupMirrorSel=false;
  renderCups();renderCupMirror();
  const ch=C.champ&&CHAMPS[C.champ];
  document.getElementById('cupblurb').textContent=open?C.blurb+(ch?' Champion: '+ch.full+'.':''):cupLockText(C);
  document.getElementById('btnCupNext').disabled=!open;
}
function renderCupMirror(){
  const C=CUPS[cupSel],host=document.getElementById('cupMirror'),open=mirrorOpen(C);
  host.innerHTML=open?'<button class="tab'+(cupMirrorSel?' sel':'')+'" id="btnCupMirror">'+(!C.champ?'SPEGELCUPEN':'SPEGELVÄND OCH BAKLÄNGES')+': '+(cupMirrorSel?'PÅ':'AV')+'</button>':'';
  if(open)document.getElementById('btnCupMirror').addEventListener('click',()=>{cupMirrorSel=!cupMirrorSel;renderCupMirror();});
}
function showCupSetup(){
  hideSheets();state='menu';CUP=null;TT=false;
  pickClass(classSel);pickCup(cupOpen(CUPS[cupSel])?cupSel:0);
  document.getElementById('cupWarn').hidden=!(SAVE.cup&&!SAVE.cup.done);
  document.getElementById('cupsetup').classList.remove('hide');
}
function renderPaints(){
  const host=document.getElementById('paints'),open=PAINTS.filter(p=>!p.id||SAVE.unlock[p.unlock]);
  const parts=PARTS.filter(q=>!q.id||SAVE.unlock[q.unlock]);
  host.hidden=open.length<2&&!SAVE.unlock.pennant&&parts.length<2;
  host.innerHTML=open.map(p=>'<button class="tab'+(p.id===paintSel||(!p.id&&!open.some(q=>q.id&&q.id===paintSel))?' sel':'')+
    '" data-p="'+(p.id||'')+'">LACK: '+p.name+'</button>').join('')+
    (SAVE.unlock.pennant?'<button class="tab'+(SAVE.pennantOn?' sel':'')+'" id="btnPennant">VIMPEL: '+(SAVE.pennantOn?'PÅ':'AV')+'</button>':'')+
    (parts.length>1?'<button class="tab'+(partOn()?' sel':'')+'" id="btnPart">DEL: '+(PARTS.find(q=>q.id===partOn())||PARTS[0]).name+'</button>':'');
  host.querySelectorAll('.tab[data-p]').forEach(el=>el.addEventListener('click',()=>{
    paintSel=el.dataset.p||null;SAVE.paint=paintSel;writeSave();showRig();renderPaints();}));
  const pb=document.getElementById('btnPennant');
  if(pb)pb.addEventListener('click',()=>{SAVE.pennantOn=!SAVE.pennantOn;writeSave();showRig();renderPaints();});
  const qb=document.getElementById('btnPart');           /* cycles through the parts won so far */
  if(qb)qb.addEventListener('click',()=>{const n=parts.findIndex(q=>q.id===partOn());
    SAVE.part=parts[(n+1)%parts.length].id;writeSave();showRig();renderPaints();});
}
function showBrief(){
  nameKarts();
  const c=SAVE.cup;CUP=c;
  hideSheets();previewOn=false;state='menu';camInit=false;
  document.body.classList.remove('racing');
  applyCharacter(c.char,true);applyCar(c.car);
  const RR=cupRounds(c),si=STAGES.findIndex(S=>S.id===RR[c.round]),S=STAGES[si],CD=cupDef(c);
  applyStage(si);
  document.getElementById('briefTitle').innerHTML=S.name+'<i>'+CD.name+' · RUNDA '+(c.round+1)+' AV '+RR.length+'</i>';
  document.getElementById('briefSub').textContent=S.sub+' · '+(S.laps||3)+' VARV · '+cupClass().name+(c.mirror?(CD.champ?' · SPEGELVÄND':' · SPEGELCUPEN'):'');
  const surf=['ASFALT'].concat((S.routes||[]).map(R=>SURF[R.surface].name),(S.routes||[]).some(R=>R.mud)?['LERA']:[]);
  const [got,of]=stageStamps(S),st=standings(c),me=st.indexOf(0);
  const gap=i=>{const d=c.pts[0]-c.pts[i];return (d>0?'+':'')+d+' p';};
  const ahead=me>0?karts[st[me-1]]:null;
  const rows=[['BANAN',CUP_ROLE[S.id]||S.role||S.blurb],
    ['UNDERLAG',[...new Set(surf)].join(', ')],
    ['GENVÄGAR',(S.routes||[]).map(R=>R.name).join(', ')||'Inga kända'],
    ['PICKNICK',of?got+'/'+of+' stämplar':'Kommer i nästa version'],
    [SAVE.name||'DU',(c.res.length?c.pts[0]+' p · '+ordSv(me+1)+' plats':'Du startar sist i första rundan')+' · '+CHARS[c.char].short+' i '+CARS[c.car].name],
    [CD.champ?'MÄSTAREN':'RIVALEN',(CD.champ?CHAMPS[CD.champ].full:karts[c.rival].name)+HORN+' · '+c.pts[c.rival]+' p ('+gap(c.rival)+')']];
  if(CD.champ&&!c.res.length)rows.push(['',CHAMPS[CD.champ].name+': ”'+CHAMPS[CD.champ].say+'”']);
  if(ahead&&ahead.idx!==c.rival)rows.push(['NÄRMAST FÖRE',ahead.name+' · '+c.pts[ahead.idx]+' p ('+gap(ahead.idx)+')']);
  document.getElementById('briefBody').innerHTML=rows.map(r=>'<dt>'+r[0]+'</dt><dd>'+r[1]+'</dd>').join('');
  document.getElementById('brief').classList.remove('hide');
}
function startCupRound(){CUP=SAVE.cup;raceRound=CUP.round;previewOn=false;resetRace();}
function showTable(){
  const c=SAVE.cup;
  hideSheets();state='menu';document.body.classList.remove('racing');
  const st=standings(c),L=c.last||{before:st,earned:[0,0,0,0,0,0]};
  document.getElementById('tableSub').textContent=cupDef(c).name+' · EFTER RUNDA '+c.round+' AV '+cupRounds(c).length+' · '+cupClass().name;
  document.getElementById('tgrid').innerHTML=st.map((i,n)=>{
    const k=karts[i],mv=L.before.indexOf(i)-n;
    return '<li'+(i===0?' class="me"':'')+'><span class="p">'+(n+1)+'</span><span class="chip" style="background:#'+
      k.color.toString(16).padStart(6,'0')+'"></span><span class="nm">'+k.name+(i===c.rival?HORN:'')+
      '</span><span class="mv" aria-label="placeringar">'+(mv>0?'▲'+mv:mv<0?'▼'+(-mv):'–')+
      '</span><span class="pt">+'+L.earned[i]+'</span><span class="tot">'+c.pts[i]+'</span></li>';}).join('');
  document.getElementById('btnTableNext').textContent=c.done?'PRISPALLEN':'NÄSTA BANA';
  document.getElementById('table').classList.remove('hide');
}
function showPodium(){
  const c=SAVE.cup,st=standings(c);
  hideSheets();state='menu';document.body.classList.remove('racing');
  const step=(n,h)=>{const k=karts[st[n]];return '<div class="st">'+(n===0?CHURN:'')+'<div class="nm">'+k.name+
    '</div><div class="bl" style="height:'+h+'px">'+(n+1)+'</div></div>';};
  document.getElementById('pod').innerHTML=step(1,86)+step(0,124)+step(2,62);
  const pl=c.final||st.indexOf(0)+1;
  document.getElementById('podSub').textContent='DU BLEV '+ordSv(pl)+' · '+cupDef(c).name+' · '+cupClass().name+' · '+c.pts[0]+' POÄNG';
  let note=pl<=3?CUPSVG(MEDALC[pl],MEDAL[pl])+' '+MEDAL[pl]+'POKAL TILL HYLLAN.':
    OSTKAKA+'Ingen pall i år, men Majros bjuder på en tröstande ostkaka.';
  const CH=cupDef(c).champ&&CHAMPS[cupDef(c).champ];
  if(CH&&pl===1)note+=' Du slog '+CH.full+'!';
  if(c.unlocked&&c.unlocked.length)note+=' Upplåst: '+c.unlocked.join(', ')+'.';
  const ND=c.newDriver&&CHARS.find(d=>d.id===c.newDriver);
  if(ND)note+='<div class="newdrv">NY FÖRARE: '+ND.name+'! Välj '+ND.short+' på förarskärmen.</div>';
  const pn=document.getElementById('podNote');pn.innerHTML=note;
  pn.querySelector('svg').style.cssText='width:30px;height:30px;vertical-align:middle;margin-right:6px';
  if(pl>3)pn.querySelector('svg').style.cssText='width:54px;height:30px;vertical-align:middle;margin-right:6px';
  document.getElementById('podium').classList.remove('hide');
  moo();                                   /* Majros moos whoever won */
}
let albumTab=1,albumBack=showMenu;
const KIND={intro:'VID VÄGEN',route:'PÅ GENVÄGEN',master:'MÄSTARPROVET',line:'INNERLINJEN',air:'I LUFTEN'};
const REWARDS=[[1,'Varje stämpel: sin sida i passet och sin historia'],[3,'Alla 3 på en bana: banans vykort'],
  [6,'6 stämplar: muu-tutan för alla förare (H)'],[9,'9 stämplar: picknickkorg på taket'],
  [allStamps().length,'Alla '+allStamps().length+': Gyllene Picknickpasset och titeln Picknickmästare']];
function showAlbum(back){
  albumBack=back||showMenu;
  hideSheets();state='menu';document.body.classList.remove('racing');
  renderAlbum();document.getElementById('album').classList.remove('hide');
}
function renderAlbum(){
  document.getElementById('atabs').innerHTML=STAGES.map((S,i)=>{const [g,o]=stageStamps(S);
    return '<button class="tab'+(i===albumTab?' sel':'')+'" data-i="'+i+'">'+S.name+(o?' '+g+'/'+o:'')+'</button>';}).join('');
  document.querySelectorAll('#atabs .tab').forEach(el=>el.addEventListener('click',()=>{albumTab=+el.dataset.i;renderAlbum();}));
  const S=STAGES[albumTab],L=S.stamps||[];
  let h;
  if(!L.length)h='<p class="soon">Kommer i nästa version.</p>';
  else{
    h=stageStamps(S)[0]===L.length?'<div class="post">HÄLSNINGAR FRÅN '+S.name+'!<small>Banans vykort: alla tre stämplar hittade.</small></div>':'';
    h+='<div class="slots">'+L.map(d=>SAVE.stamps[d.id]?
      '<div class="slot own"><div class="disc">'+d.ini+'</div><b>'+d.dish+'</b><span class="kind">'+KIND[d.kind]+'</span><p>'+d.story+'</p></div>':
      '<div class="slot"><div class="disc sil">?</div><b>???</b><span class="kind">'+KIND[d.kind]+'</span><p class="hint">'+d.hint+'</p></div>').join('')+'</div>';
  }
  document.getElementById('apage').innerHTML=h;
  const n=stampCount(),full=STAGES.some(T=>{const [g,o]=stageStamps(T);return o&&g===o;});
  document.getElementById('arewards').innerHTML=REWARDS.map(r=>{
    const got=r[0]===3?full:n>=r[0];
    return '<li'+(got?' class="got"':'')+'><span>'+(got?'✓':'·')+'</span>'+r[1]+'</li>';}).join('');
}
document.getElementById('btnCup').addEventListener('click',()=>{bootAudio();showCupSetup();});
document.getElementById('btnCupBack').addEventListener('click',showMenu);
document.getElementById('btnCupNext').addEventListener('click',()=>{
  if(!cupOpen(CUPS[cupSel]))return;
  bootAudio();cupSetup=true;CUP=null;
  applyStage(STAGES.findIndex(S=>S.id===cupRounds({cup:CUPS[cupSel].id,mirror:mirrorOpen(CUPS[cupSel])&&cupMirrorSel})[0]));showSelect();});
document.getElementById('btnResumeCup').addEventListener('click',()=>{bootAudio();showBrief();});
document.getElementById('btnAlbum').addEventListener('click',()=>{bootAudio();showAlbum(showMenu);});
document.getElementById('btnAlbumBack').addEventListener('click',()=>albumBack());
document.getElementById('btnBriefGo').addEventListener('click',()=>{bootAudio();startCupRound();});
document.getElementById('btnBriefAlbum').addEventListener('click',()=>showAlbum(showBrief));
document.getElementById('btnBriefMenu').addEventListener('click',showMenu);
document.getElementById('btnTable').addEventListener('click',showTable);
document.getElementById('btnTableAlbum').addEventListener('click',()=>showAlbum(showTable));
document.getElementById('btnTableNext').addEventListener('click',()=>{if(SAVE.cup.done)showPodium();else showBrief();});
document.getElementById('btnPodDone').addEventListener('click',showMenu);
refreshMenu();
document.getElementById('btnAgain').addEventListener('click',resetRace);
document.getElementById('btnSwap').addEventListener('click',showSelect);
document.getElementById('btnStage').addEventListener('click',()=>showStages());
