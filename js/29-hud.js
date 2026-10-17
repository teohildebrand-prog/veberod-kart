"use strict";
/* ───────── HUD ───────── */
const el={lap:document.getElementById('lap'),pos:document.getElementById('pos'),
  time:document.getElementById('time'),best:document.getElementById('best'),
  laps:document.getElementById('laps'),
  spd:document.getElementById('spd'),fill:document.getElementById('fill'),
  fmeter:document.getElementById('fmeter'),ffill:document.getElementById('ffill'),
  slot:document.getElementById('slot'),slotv:document.getElementById('slotv'),
  slotn:document.getElementById('slotn'),
  meter:document.getElementById('meter'),flash:document.getElementById('flashtxt'),
  toast:document.getElementById('toast')};
let toastT=0, lastSlot='';
function toast(m){el.toast.textContent=m;el.toast.classList.add('on');toastT=1.5;}
function flash(m){el.flash.textContent=m;el.flash.classList.remove('pop');void el.flash.offsetWidth;el.flash.classList.add('pop');}
function drawHUD(dt){
  el.lap.textContent=Math.min(player.lap+1,LAPS);
  el.laps.textContent='/'+LAPS;
  el.pos.textContent=player.place;
  el.time.textContent=fmt(player.done?player.total:raceTime);
  el.best.textContent=fmt(player.best);
  el.spd.innerHTML=Math.round(player.speed*4.35)+'<b>KM/H</b>';
  el.spd.className=player.slow>0?'sour':'';
  el.fill.style.width=((player.boost>0?1:clamp(player.charge/1.45,0,1))*100)+'%';
  const held=player.held||(player.shield>0?'shield':null);
  const key=player.held?player.held:(player.shield>0?'shield!':'');
  el.slot.classList.toggle('off',!key);
  if(key!==lastSlot){
    if(held){
      el.slotv.innerHTML=ITEMICON[held];
      el.slot.title=ITEMNAME[held];
      el.slot.classList.remove('pop');void el.slot.offsetWidth;el.slot.classList.add('pop');
    }
    lastSlot=key;
  }
  el.slotn.textContent=(!player.held&&player.shield>0)?Math.ceil(player.shield):'';
  const fr=clamp(player.fuel/TANK,0,1);
  el.ffill.style.width=(fr*100)+'%';
  el.fmeter.className='meter fuelm'+(fr<=0?' dry':(fr<0.26?' warn':''));
  el.meter.className='meter'+(player.boost>0||player.charge>1.45?' fire':(player.charge>0.55?' hot':''));
  if(toastT>0){toastT-=dt;if(toastT<=0)el.toast.classList.remove('on');}
}
