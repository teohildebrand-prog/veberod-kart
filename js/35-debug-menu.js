"use strict";
/* ───────── debug menu ───────── */
/* F1, § or `: a glass panel over the running game, for testing: switch track, driver and car
   mid-race (own vehicles stay with their driver), change the light, jump to a checkpoint, cheats, item spawns, the AI,
   FPS and physics readouts, time scale. Nothing here is saved. */
const DBG={open:false,god:false,fuel:false,items:false,lastItem:null,ai:'auto',ts:1,fps:false,phys:false,sky:-1,
  fpsS:60};
const dbgEl=document.getElementById('dbg'),dbgHud=document.getElementById('dbgHud');
const SKIES=[['BANANS',null],['DAG','veberod'],['KVÄLL','bron'],['NATT','glimminge'],['DIMMA','fog']];
const AIMODES=[['auto','SOM VANLIGT'],['on','KÖR'],['freeze','FRYST'],['off','BORTA']];
const TIMES=[0.25,0.5,1,2,3];
const AI_STOP={throttle:0,brake:1,steer:0,drift:false};
function racingNow(){return state==='race'||state==='grid'||state==='over';}
function dbgRestart(){if(racingNow())resetRace();}
function dbgSky(n){
  DBG.sky=n;
  const id=SKIES[n]&&SKIES[n][1],S=id==='fog'?null:(id?STAGES.find(T=>T.id===id):stage);
  if(id==='fog'){
    skyMat.uniforms.uLow.value.setHex(0xc9d1d6);skyMat.uniforms.uHigh.value.setHex(0x9eabb4);
    U.fogColor.value.setHex(0xc9d1d6);U.fogNear.value=6;U.fogFar.value=75;
    U.amb.value.setHex(stage.amb);U.dif.value.setHex(0xd8dde2);moon.visible=false;
    return;
  }
  skyMat.uniforms.uLow.value.setHex(S.sky[0]);skyMat.uniforms.uHigh.value.setHex(S.sky[1]);
  U.fogColor.value.setHex(S.fog[0]);U.fogNear.value=S.fog[1];U.fogFar.value=S.fog[2];
  U.amb.value.setHex(S.amb);U.dif.value.setHex(S.dif);moon.visible=S.id==='glimminge';
}
/** the AI mode on top of what the race set up: KÖR wakes parked karts, BORTA parks them */
function dbgApplyAI(){
  for(const k of karts){
    if(!k.ai)continue;
    if(DBG.ai==='on'||DBG.ai==='freeze')k.parked=false;   /* frozen karts stay in view as obstacles */
    else if(DBG.ai==='off')k.parked=true;
    else k.parked=TT||FREE;
    k.v.root.visible=!k.parked;k.blob.visible=!k.parked;
  }
}
/** resetRace calls this: the chosen light and AI mode outlive a restart or a new track */
function dbgOnReset(){if(DBG.sky>0)dbgSky(DBG.sky);dbgApplyAI();}
/** to checkpoint s on the main road, just past its line, standing still */
function dbgTeleport(s){
  if(!racingNow())return;
  const k=player,i=(Math.round(s*N/CPN)+3)%N;
  k.rib=0;k.plan=0;k.si=i;k.mi=i;k.x=sx[i];k.z=sz[i];k.yaw=Math.atan2(fx[i],fz[i]);
  k.vx=k.vz=k.vy=0;k.speed=0;k.drift=0;k.charge=0;k.dstage=0;k.spun=0;k.slow=0;
  k.y=groundK(k,k.x,k.z);k.air=false;k.airT=0;k.ghost=1;k.stuckT=0;k.stuckP=-1e9;k.recoverT=0;k.rtp=false;k.offT=0;
  k.gate=s;k.cp=s;                         /* the gate counts as passed, so the lap still adds up */
  camInit=false;toast('KONTROLLPUNKT '+(s+1));
}
function dbgGive(t){
  if(!racingNow())return;
  if(t==='sugar'){player.sugar=3;toast('SOCKERBIT 3/3');return;}
  if(t==='turbo'){player.boost=Math.max(player.boost,3);toast('TURBO!');return;}
  player.held=t;DBG.lastItem=t;toast(ITEMNAME[t]+'!');
}
function dbgRow(title,items){
  return '<div class="dh">'+title+'</div><div class="dr">'+items.map(([label,act,sel,off])=>
    '<button class="tab'+(sel?' sel':'')+'" data-a="'+act+'"'+(off?' disabled':'')+'>'+label+'</button>').join('')+'</div>';
}
function renderDbg(){
  if(!DBG.open)return;
  const lock=!!CUP,R=racingNow(),on=v=>v?'PÅ':'AV';
  const iT=[...new Set(ITEMPOOL)];
  let h='<div class="dtop"><b>DEBUG</b><span>F1 · § · `</span><button class="tab" data-a="close">STÄNG</button></div>';
  h+=dbgRow('BANA',STAGES.map((S,i)=>[S.name,'stage:'+i,S===stage,lock]));
  h+=dbgRow('FÖRARE',CHARS.map((c,i)=>[c.short||c.name,'char:'+i,i===charSel,lock]));
  const sig=CHARS[charSel].sig;              /* own vehicles stay with their driver, here too */
  h+=dbgRow('FORDON',CARS.map((c,i)=>[c.name,'car:'+i,i===carSel,lock||(sig?c.id!==sig:!!c.sig)]));
  if(lock)h+='<p class="dn">Bana, förare och fordon är låsta under cupen.</p>';
  h+=dbgRow('VÄDER OCH LJUS',SKIES.map(([n],i)=>[n,'sky:'+i,i===Math.max(0,DBG.sky)]));
  h+=dbgRow('TELEPORT',[...Array(CPN).keys()].map(s=>['KP '+(s+1),'tp:'+s,false,!R]));
  h+=dbgRow('FUSK',[['GUDALÄGE: '+on(DBG.god),'god',DBG.god],['OÄNDLIG BENSIN: '+on(DBG.fuel),'fuel',DBG.fuel],
    ['OÄNDLIGA FÖREMÅL: '+on(DBG.items),'items',DBG.items],['SISTA VARVET','last',false,!R||FREE||TT||player.done]]);
  h+=dbgRow('FÖREMÅL',iT.map(t=>[ITEMNAME[t],'give:'+t,false,!R]).concat([['3 SOCKERBITAR','give:sugar',false,!R],['TURBO','give:turbo',false,!R]]));
  h+=dbgRow('DATORFÖRARE',AIMODES.map(([m,n])=>[n,'ai:'+m,DBG.ai===m]));
  h+=dbgRow('VISA',[['FPS: '+on(DBG.fps),'fps',DBG.fps],['FYSIK: '+on(DBG.phys),'phys',DBG.phys]]);
  h+=dbgRow('TIDSSKALA',TIMES.map(t=>[t+'×','ts:'+t,DBG.ts===t]));
  dbgEl.innerHTML=h;
}
function dbgAct(a){
  const [cmd,arg]=a.split(':');
  if(cmd==='close')return setDbg(false);
  if(cmd==='stage'&&!CUP){applyStage(+arg);if(racingNow())resetRace();else dbgOnReset();}
  if(cmd==='char'&&!CUP){applyCharacter(+arg);dbgRestart();}
  if(cmd==='car'&&!CUP){applyCar(+arg);dbgRestart();}
  if(cmd==='sky')dbgSky(+arg);
  if(cmd==='tp')dbgTeleport(+arg);
  if(cmd==='god')DBG.god=!DBG.god;
  if(cmd==='fuel')DBG.fuel=!DBG.fuel;
  if(cmd==='items'){DBG.items=!DBG.items;if(DBG.items&&!DBG.lastItem)DBG.lastItem=player.held||'rocket';}
  if(cmd==='last'&&racingNow()&&!player.done){player.lap=LAPS-1;toast('SISTA VARVET');}
  if(cmd==='give')dbgGive(arg);
  if(cmd==='ai'){DBG.ai=arg;if(racingNow())dbgApplyAI();}
  if(cmd==='fps'){DBG.fps=!DBG.fps;}
  if(cmd==='phys'){DBG.phys=!DBG.phys;}
  if(cmd==='ts')DBG.ts=+arg;
  dbgHud.hidden=!(DBG.fps||DBG.phys);
  renderDbg();
}
function setDbg(on){DBG.open=!!on;dbgEl.hidden=!DBG.open;renderDbg();}
dbgEl.addEventListener('click',e=>{
  const b=e.target.closest('button[data-a]');if(!b||b.disabled)return;
  b.blur();                                /* space is the drift key; a focused button would eat it */
  bootAudio();dbgAct(b.dataset.a);
});
addEventListener('keydown',e=>{
  if(e.key==='F1'||e.key==='§'||e.key==='`'){e.preventDefault();if(!e.repeat)setDbg(!DBG.open);}
});
document.getElementById('btnDbg').addEventListener('click',()=>{setPause(false);setDbg(true);});
/** per frame, before time scale: cheats and the readouts */
function dbgFrame(rawDt){
  if(rawDt>0)DBG.fpsS+=(1/rawDt-DBG.fpsS)*0.05;
  if(DBG.fuel)player.fuel=TANK;
  if(DBG.items&&!player.held&&DBG.lastItem&&racingNow())player.held=DBG.lastItem;
  if(dbgHud.hidden)return;
  const k=player,f=v=>v.toFixed(1);
  let t=DBG.fps?Math.round(DBG.fpsS)+' FPS'+(DBG.ts!==1?' · TID '+DBG.ts+'×':'')+'\n':'';
  if(DBG.phys)t+='FART  '+Math.round(k.speed*4.35)+' km/h ('+f(k.speed)+' m/s)\n'+
    'V     '+f(k.vx)+' '+f(k.vy)+' '+f(k.vz)+'\n'+
    'POS   '+f(k.x)+' '+f(k.y)+' '+f(k.z)+'  YAW '+Math.round(((k.yaw*180/Math.PI)%360+360)%360)+'°\n'+
    'SPÅR  si '+k.si+'  mi '+Math.round(k.mi)+'  rutt '+(k.rib?(ALTS[k.rib-1].name||'genväg '+k.rib):'huvudväg')+'  '+(k.surf||k.sfx||'')+'\n'+
    'VARV  '+k.lap+'/'+(FREE?'∞':LAPS)+'  grind '+k.gate+'  kp '+(k.cp+1)+'  plats '+k.place+'\n'+
    'LUFT  '+(k.air?'ja '+f(k.airT)+' s':'nej')+'  SLADD '+f(k.charge)+'  TURBO '+f(k.boost)+'\n'+
    'BENSIN '+Math.round(k.fuel)+'  SOCKER '+k.sugar+'  ITEM '+(k.held||'-')+'\n'+
    'LÄGE  '+state+'  tid '+f(raceTime)+'  aktiva '+karts.filter(q=>!q.parked).length;
  dbgHud.textContent=t;
}
