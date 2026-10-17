"use strict";
/* ───────── gamepad ───────── */
/* Xbox layout, browser standard mapping: left stick steers, RT gas, LT brake/reverse, A drift,
   X item, Y camera, Menu pause. In menus the stick or D-pad moves focus between the open sheet's
   buttons, A picks and B goes back. The KONTROLLER sheet shows this the first time a pad wakes up. */
const pad={throttle:0,brake:0,steer:0,drift:false};
const PB={A:0,B:1,X:2,Y:3,LB:4,RB:5,LT:6,RT:7,MENU:9,UP:12,DOWN:13,LEFT:14,RIGHT:15};
const padHelp=document.getElementById('padhelp');
let padPrev=[],padDir='',padHold=0,padRoot=null,padLast=null,padT=performance.now();
const deadzone=(v,d)=>Math.abs(v)<d?0:Math.sign(v)*(Math.abs(v)-d)/(1-d);
function showPadHelp(){
  if(state==='race'||state==='grid')setPause(true);
  padHelp.classList.remove('hide');
  document.getElementById('btnPadClose').focus();
}
function hidePadHelp(){padHelp.classList.add('hide');padRoot=null;}
document.getElementById('btnPadClose').addEventListener('click',hidePadHelp);
document.getElementById('btnPadHelp').addEventListener('click',showPadHelp);
addEventListener('pointerdown',()=>document.body.classList.remove('padnav'));
/** whatever the pad is steering in the menus: the KONTROLLER sheet, the debug panel, or the open sheet */
function padMenu(){
  if(!padHelp.classList.contains('hide'))return padHelp;
  if(DBG.open)return dbgEl;
  return document.querySelector('.sheet:not(.hide)');
}
const padItems=root=>[...root.querySelectorAll('button')].filter(b=>!b.disabled&&b.getClientRects().length);
const padId=b=>b&&(b.id||b.dataset.a||b.dataset.i||b.dataset.p||b.textContent);
function padHome(root){
  const L=padItems(root),again=padLast&&L.find(b=>padId(b)===padLast);
  const b=again||root.querySelector('.vcard.sel,.card.sel')||L.find(b=>b.matches('.go,.vs-go'))||L[0];
  if(b)b.focus();
}
/** move focus to the nearest button in a direction, favouring ones in line with the current one */
function padMove(root,dx,dy){
  const cur=document.activeElement;
  if(!cur||!root.contains(cur)||cur===root){padHome(root);return;}
  const r=cur.getBoundingClientRect(),x=r.left+r.width/2,y=r.top+r.height/2;
  let best=null,score=1e9;
  for(const b of padItems(root)){
    if(b===cur)continue;
    const q=b.getBoundingClientRect(),ex=q.left+q.width/2-x,ey=q.top+q.height/2-y;
    const along=ex*dx+ey*dy,side=Math.abs(ex*dy-ey*dx);
    if(along<4)continue;
    const s=along+side*2.5;
    if(s<score){score=s;best=b;}
  }
  if(best){best.focus();ping(700,980,.03);}
}
function padPick(root){
  const b=document.activeElement;
  if(!b||!root.contains(b)||b===root){padHome(root);return;}
  /* A on the driver or track that is already chosen moves on, like Enter */
  const go=b.matches('.vcard.sel')?document.getElementById('btnGo'):
    b.matches('#classcards .card.sel')?document.getElementById('btnCupNext'):null;
  padLast=padId(b);bootAudio();
  (go||b).click();
}
const PADBACK={pick:'btnBack',cupsetup:'btnCupBack',album:'btnAlbumBack',brief:'btnBriefMenu',
  podium:'btnPodDone',paused:'btnResume',stages:'btnStageBack'};
function padBack(root){
  if(root===padHelp)return hidePadHelp();
  if(root===dbgEl)return setDbg(false);
  const b=document.getElementById(PADBACK[root.id]);
  if(b&&!b.hidden){padLast=null;b.click();}
}
function pollPad(){
  const now=performance.now(),dt=(now-padT)/1000;padT=now;
  pad.throttle=pad.brake=pad.steer=0;pad.drift=false;
  const gp=navigator.getGamepads?[...navigator.getGamepads()].find(g=>g&&g.connected):null;
  if(!gp)return;
  const B=gp.buttons,down=i=>!!(B[i]&&B[i].pressed),val=i=>B[i]?B[i].value:0;
  const hit=i=>down(i)&&!padPrev[i];
  if(!SAVE.padHelp&&B.some(b=>b.pressed)){SAVE.padHelp=true;writeSave();padPrev=B.map(b=>b.pressed);showPadHelp();return;}
  const sx=deadzone(gp.axes[0]||0,.18),sy=gp.axes[1]||0;
  const root=padMenu();
  if(root){
    if(root!==padRoot){                    /* a new sheet: put focus on its obvious choice */
      padRoot=root;
      if(document.body.classList.contains('padnav')&&root.id!=='stages'&&!root.contains(document.activeElement))padHome(root);
    }
    const dir=down(PB.LEFT)||sx<-.5?'l':down(PB.RIGHT)||sx>.5?'r':down(PB.UP)||sy<-.5?'u':down(PB.DOWN)||sy>.5?'d':'';
    const step=dir&&(dir!==padDir||(padHold-=dt)<=0);
    if(step){padHold=dir===padDir?.12:.38;document.body.classList.add('padnav');}
    padDir=dir;
    if(root.id==='stages'){                /* the stage roster moves its own highlight */
      if(B.some(b=>b.pressed))document.body.classList.add('padnav');
      stagePad(step?dir:'',hit);
    }else{
      if(step)padMove(root,dir==='l'?-1:dir==='r'?1:0,dir==='u'?-1:dir==='d'?1:0);
      if(hit(PB.A)){document.body.classList.add('padnav');padPick(root);}
      else if(hit(PB.B))padBack(root);
      else if(hit(PB.MENU)&&root.id==='paused')setPause(false);
    }
  }else{
    padDir='';padRoot=null;
    pad.steer=-sx+(down(PB.LEFT)?1:0)-(down(PB.RIGHT)?1:0);
    pad.throttle=val(PB.RT);pad.brake=val(PB.LT);pad.drift=down(PB.A);
    if(hit(PB.X)&&state==='race'&&!paused)useItem(player);
    if(hit(PB.Y))camMode=(camMode+1)%3;
    if(hit(PB.MENU))setPause(!paused);
    if(pad.throttle||pad.steer)bootAudio();
  }
  padPrev=B.map(b=>b.pressed);
}
