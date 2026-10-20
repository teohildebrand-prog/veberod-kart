"use strict";
/* ───────── HUD ───────── */
const el={lap:document.getElementById('lap'),pos:document.getElementById('pos'),
  time:document.getElementById('time'),best:document.getElementById('best'),
  laps:document.getElementById('laps'),
  spd:document.getElementById('spd'),fill:document.getElementById('fill'),
  fmeter:document.getElementById('fmeter'),ffill:document.getElementById('ffill'),
  pumpCue:document.getElementById('pumpCue'),fuelTag:document.getElementById('fuelTag'),
  slot:document.getElementById('slot'),slotv:document.getElementById('slotv'),
  slotn:document.getElementById('slotn'),slotname:document.getElementById('slotname'),
  meter:document.getElementById('meter'),flash:document.getElementById('flashtxt'),
  toast:document.getElementById('toast')};
let toastT=0, lastSlot='';
const lvlEl=document.getElementById('lvlbadge'), ROMAN=['I','II','III'];
function toast(m){el.toast.textContent=m;el.toast.classList.add('on');toastT=1.5;}
/** Victor's clean drift: a small pixel PERFEKT! over the kart */
const perfektEl=document.getElementById('perfekt');
function perfekt(){
  perfektEl.classList.remove('on');void perfektEl.offsetWidth;perfektEl.classList.add('on');
  bark('perfect',6);
}
function flash(m){el.flash.textContent=m;el.flash.classList.remove('pop');void el.flash.offsetWidth;el.flash.classList.add('pop');}
/* the box roulette passes the five families and, every third frame, a signature item */
const REEL=['boost','rocket','sig','shield','pie','sig','fart','sig'];
/** what the item slot shows now: the held item at its awarded level, or the shield that is running;
    a fresh item box spins through the reel first, ticking slower and slower */
function slotFrame(k){
  const spin=!!k.held&&k.roll>0;
  if(!spin){
    const fam=k.held||(k.shield>0?'shield':null);
    return {spin,frame:0,fam,lvl:k.held?itemLvl(k):(k.shieldLvl||1),sid:k.heldSig};
  }
  const frame=Math.floor((1-(k.roll/ROLLT)**2)*14);     /* 0..13, the last one just before the real item */
  const at=k.held==='sig'?2:REEL.indexOf(k.held), fam=REEL[(at+frame+1)%REEL.length];
  const ids=sigPool().concat(k.heldSig&&SIGS[k.heldSig].event?[k.heldSig]:[]), sid=ids[(ids.indexOf(k.heldSig)+1+frame*3+ids.length)%ids.length];
  return {spin,frame,fam,lvl:(itemLvl(k)+frame)%3+1,sid};
}
const PUMP_ICON='<svg viewBox="0 0 16 16" aria-hidden="true"><path fill="currentColor" fill-rule="evenodd" d="M2 2h7v12H2zM3.5 3.5v3h4v-3z"/>'+
  '<path d="M9 6h2l2 2v5a1 1 0 0 1-2 0v-3H9" fill="none" stroke="currentColor" stroke-width="1.4"/></svg>';
let lastCue='',lastTag='';
/** the words over the speedo: the next station while it is worth knowing, and the tank's state */
function fuelChips(){
  let cue='',tag='',tc='';
  if(!TT&&!FREE&&state==='race'&&!player.done){
    const P=pumpsAhead(player),X=P[0],m=X?X.d*SEG:1e9;
    if(X&&m>=0&&m<FUEL.cue&&player.fuel<TANK-15&&X.d<toFinish(player)){
      const right=X.S.side*(MIRROR?-1:1)>0;
      cue=(right?'':'◀ ')+PUMP_ICON+'STATOLJA '+Math.max(0,Math.round(m/10)*10)+' M'+(right?' ▶':'');
    }
    if(player.filling){tag=PUMP_ICON+'TANKAR +'+FUEL.fill+'/s';tc='fill';}
    else if(player.court&&player.fuel<TANK-1){tag=PUMP_ICON+'SAKTA IN FÖR ATT TANKA';tc='brake';}
    else if(player.fuel<=0){tag=PUMP_ICON+'TOM TANK';tc='dry';}
    else if(player.fuel<=FUEL.crit){tag=PUMP_ICON+'TANKA SNART!';tc='low';}
    else if(player.fuel<=FUEL.low){tag=PUMP_ICON+'LÅG BENSIN';tc='warn';}
  }
  if(cue!==lastCue){lastCue=cue;el.pumpCue.innerHTML=cue;el.pumpCue.classList.toggle('off',!cue);}
  const tk=tc+tag;
  if(tk!==lastTag){lastTag=tk;el.fuelTag.innerHTML=tag;el.fuelTag.className='chip '+(tag?tc:'off');}
}
function drawHUD(dt){
  el.lap.textContent=Math.min(player.lap+1,LAPS);
  el.laps.textContent=FREE?'/∞':'/'+LAPS;
  el.pos.textContent=player.place;
  el.time.textContent=fmt(player.done?player.total:raceTime);
  el.best.textContent=fmt(player.best);
  el.spd.innerHTML=Math.round(player.speed*4.35)+'<b>KM/H</b>';
  el.spd.className=player.slow>0?'sour':'';
  el.fill.style.width=((player.boost>0?1:clamp(player.charge/1.45,0,1))*100)+'%';
  const {spin,frame,fam,lvl,sid}=slotFrame(player);
  const key=fam?fam+lvl+(fam==='sig'?sid+SIGS[sid].name:'')+(player.held?'':'!')+(spin?'~'+frame:''):'';
  if(key!==lastSlot){
    if(fam){
      const own=fam==='sig';                             /* a signature item: a star, no level */
      el.slotv.innerHTML=own?SIGS[sid].icon:ITEMICON[fam+lvl];
      el.slot.title=el.slotname.textContent=own?SIGS[sid].name:itemName(fam,lvl);
      el.slot.className=el.slotname.className='plate '+(own?'sig':'lvl'+lvl)+(player.held?'':' run');
      lvlEl.textContent=own?'★':ROMAN[lvl-1];lvlEl.className='plate '+(own?'sig':'lvl'+lvl);lvlEl.title=own?'Signaturföremål':'Nivå '+lvl;
      void el.slot.offsetWidth;el.slot.classList.add(spin?'spin':'pop');
      if(spin)ping(1500-frame*40,1100-frame*30,.03);
    }
    lastSlot=key;
  }
  el.slot.classList.toggle('off',!key);
  el.slotname.classList.toggle('off',!player.held||spin);
  el.slotn.textContent=(!player.held&&player.shield>0)?(player.pans?'×'+player.pans:Math.ceil(player.shield)):'';
  lvlEl.classList.toggle('off',!key||spin);
  const fr=clamp(player.fuel/TANK,0,1);
  el.ffill.style.width=(fr*100)+'%';
  const fs=player.fuel<=0?' dry':player.fuel<=FUEL.crit?' low':player.fuel<=FUEL.low?' warn':'';
  el.fmeter.className='meter fuelm'+fs+(player.filling?' filling':'');
  fuelChips();
  el.meter.className='meter'+(player.boost>0||player.charge>1.45?' fire':(player.charge>0.55?' hot':''));
  if(toastT>0){toastT-=dt;if(toastT<=0)el.toast.classList.remove('on');}
}
