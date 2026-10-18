"use strict";
/* ───────── HUD ───────── */
const el={lap:document.getElementById('lap'),pos:document.getElementById('pos'),
  time:document.getElementById('time'),best:document.getElementById('best'),
  laps:document.getElementById('laps'),
  spd:document.getElementById('spd'),fill:document.getElementById('fill'),
  fmeter:document.getElementById('fmeter'),ffill:document.getElementById('ffill'),
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
function drawHUD(dt){
  el.lap.textContent=Math.min(player.lap+1,LAPS);
  el.laps.textContent=FREE?'/∞':'/'+LAPS;
  el.pos.textContent=player.place;
  el.time.textContent=fmt(player.done?player.total:raceTime);
  el.best.textContent=fmt(player.best);
  el.spd.innerHTML=Math.round(player.speed*4.35)+'<b>KM/H</b>';
  el.spd.className=player.slow>0?'sour':'';
  el.fill.style.width=((player.boost>0?1:clamp(player.charge/1.45,0,1))*100)+'%';
  /* the held item at its awarded level, or the shield that is running;
     a fresh item box spins through every variant first, ticking slower and slower */
  const spin=player.held&&player.roll>0;
  const frame=spin?Math.floor((1-(player.roll/ROLLT)**2)*14):0;   /* 0..13, the last one just before the real item */
  const fam=spin?FAMILIES[(FAMILIES.indexOf(player.held)+frame+1)%FAMILIES.length]:player.held||(player.shield>0?'shield':null);
  const lvl=spin?(itemLvl(player)+frame)%3+1:player.held?itemLvl(player):(player.shieldLvl||1);
  const key=fam?fam+lvl+(player.held?'':'!')+(spin?'~'+frame:''):'';
  if(key!==lastSlot){
    if(fam){
      el.slotv.innerHTML=ITEMICON[fam+lvl];
      el.slot.title=el.slotname.textContent=itemName(fam,lvl);
      el.slot.className=el.slotname.className='plate lvl'+lvl+(player.held?'':' run');
      lvlEl.textContent=ROMAN[lvl-1];lvlEl.className='plate lvl'+lvl;lvlEl.title='Nivå '+lvl;
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
  el.fmeter.className='meter fuelm'+(fr<=0?' dry':(fr<0.26?' warn':''));
  el.meter.className='meter'+(player.boost>0||player.charge>1.45?' fire':(player.charge>0.55?' hot':''));
  if(toastT>0){toastT-=dt;if(toastT<=0)el.toast.classList.remove('on');}
}
