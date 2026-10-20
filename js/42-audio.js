"use strict";
/* A quiet, band-limited mix. Engine/road loops and effects have separate buses. */
let actx=null,engine=null,skid=null,muted=false,audioMix=null;
const AUDIO_DEFAULTS={master:.7,engine:.35,effects:.65};
const audioVolumes={...AUDIO_DEFAULTS};
try{
  const saved=JSON.parse(localStorage.getItem('vk.audio.v1')||'{}');
  for(const key of Object.keys(audioVolumes))
    if(typeof saved[key]==='number'&&Number.isFinite(saved[key]))audioVolumes[key]=clamp(saved[key],0,1);
  muted=saved.muted===true;
}catch(_){}
let audioVoices=0,lastPing=-10,lastMoo=-10,lastFart=-10;
function audioOutput(){return audioMix.effects;}
function applyAudioMix(){
  if(!actx||!audioMix)return;
  const t=actx.currentTime;
  audioMix.master.gain.setTargetAtTime(muted||document.hidden?0:audioVolumes.master,t,.035);
  audioMix.engine.gain.setTargetAtTime(audioVolumes.engine,t,.05);
  audioMix.effects.gain.setTargetAtTime(audioVolumes.effects,t,.05);
}
function bootAudio(){
  if(muted)return;
  if(actx){if(actx.state==='suspended')actx.resume().catch(()=>{});return;}
  const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;
  try{actx=new AC();}catch(_){return;}
  audioVoices=0;lastPing=lastMoo=lastFart=-10;
  const master=actx.createGain(),motor=actx.createGain(),effects=actx.createGain();
  const limiter=actx.createDynamicsCompressor();
  limiter.threshold.value=-12;limiter.knee.value=12;limiter.ratio.value=8;
  limiter.attack.value=.004;limiter.release.value=.18;
  const effectFilter=actx.createBiquadFilter();effectFilter.type='lowpass';effectFilter.frequency.value=2400;effectFilter.Q.value=.5;
  motor.connect(master);effects.connect(effectFilter);effectFilter.connect(master);master.connect(limiter);limiter.connect(actx.destination);
  master.gain.value=0;audioMix={master,engine:motor,effects};applyAudioMix();
  const lp=actx.createBiquadFilter();lp.type='lowpass';lp.frequency.value=480;lp.Q.value=.5;
  const g=actx.createGain();g.gain.value=0;
  const o1=actx.createOscillator(),o2=actx.createOscillator();
  // A handful of low harmonics replaces the old bright saw/square drone.
  const real=new Float32Array(7),imag=new Float32Array([0,1,.32,.13,.06,.025,.01]);
  o1.setPeriodicWave(actx.createPeriodicWave(real,imag));o1.frequency.value=42;
  o2.type='sine';o2.frequency.value=21;
  const sub=actx.createGain();sub.gain.value=.28;
  o1.connect(lp);o2.connect(sub);sub.connect(lp);lp.connect(g);g.connect(motor);
  o1.start();o2.start();engine={o1,o2,g,lp};
  const len=actx.sampleRate*2,buf=actx.createBuffer(1,len,actx.sampleRate),d=buf.getChannelData(0);
  let smooth=0;
  for(let i=0;i<len;i++){smooth=.82*smooth+.18*(Math.random()*2-1);d[i]=smooth;}
  const src=actx.createBufferSource();src.buffer=buf;src.loop=true;
  const bp=actx.createBiquadFilter();bp.type='bandpass';bp.frequency.value=850;bp.Q.value=.55;
  const sg=actx.createGain();sg.gain.value=0;
  src.connect(bp);bp.connect(sg);sg.connect(motor);src.start();
  const rbp=actx.createBiquadFilter();rbp.type='lowpass';rbp.frequency.value=650;rbp.Q.value=.5;
  const rg=actx.createGain();rg.gain.value=0;
  src.connect(rbp);rbp.connect(rg);rg.connect(motor);
  skid={g:sg,bp,road:{bp:rbp,g:rg}};
  if(actx.state==='suspended')actx.resume().catch(()=>{});
}
/** Rounded attack/release avoids clicks; a voice cap bounds busy combat mixes. */
function audioTone(f0,f1,dur,volume=.055,type='sine',delay=0){
  if(!actx||muted||document.hidden||audioVoices>=8)return;
  const o=actx.createOscillator(),g=actx.createGain(),t=actx.currentTime+delay;
  dur=Math.max(.04,Math.min(dur,.6));audioVoices++;
  o.type=type;o.frequency.setValueAtTime(clamp(f0,45,1100),t);
  o.frequency.exponentialRampToValueAtTime(clamp(f1,45,1100),t+dur);
  g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(volume,t+.008);
  g.gain.exponentialRampToValueAtTime(.0001,t+dur);
  o.connect(g);g.connect(audioOutput());
  o.onended=()=>{o.disconnect();g.disconnect();audioVoices--;};
  o.start(t);o.stop(t+dur+.02);
}
function ping(f0,f1,dur){
  if(!actx||actx.currentTime-lastPing<.06)return;
  lastPing=actx.currentTime;audioTone(f0,f1,dur);
}
function moo(){
  if(!actx||muted||document.hidden||actx.currentTime-lastMoo<1.8||audioVoices>=7)return;
  lastMoo=actx.currentTime;
  const t=actx.currentTime,g=actx.createGain(),lp=actx.createBiquadFilter();
  lp.type='lowpass';lp.frequency.setValueAtTime(260,t);lp.frequency.linearRampToValueAtTime(520,t+.2);
  lp.frequency.linearRampToValueAtTime(220,t+.8);lp.Q.value=.7;
  g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.1,t+.08);
  g.gain.exponentialRampToValueAtTime(.0001,t+.85);lp.connect(g);g.connect(audioOutput());
  let remaining=2;
  for(const detune of [0,3]){
    const o=actx.createOscillator();audioVoices++;o.type='triangle';
    o.frequency.setValueAtTime(105+detune,t);o.frequency.linearRampToValueAtTime(125+detune,t+.2);
    o.frequency.linearRampToValueAtTime(84+detune,t+.8);o.connect(lp);
    o.onended=()=>{o.disconnect();audioVoices--;if(!--remaining){lp.disconnect();g.disconnect();}};
    o.start(t);o.stop(t+.9);
  }
}
/** one short pig grunt: a nasal sawtooth through a band-pass, roughened by a fast wobble */
function grunt(delay,vol){
  if(!actx||muted||document.hidden||audioVoices>=7)return;
  const t=actx.currentTime+(delay||0),dur=.17,v=vol||.09;
  const o=actx.createOscillator(),lfo=actx.createOscillator(),lg=actx.createGain(),bp=actx.createBiquadFilter(),g=actx.createGain();
  o.type='sawtooth';o.frequency.setValueAtTime(210,t);o.frequency.exponentialRampToValueAtTime(150,t+dur);
  lfo.type='square';lfo.frequency.value=38;lg.gain.value=28;lfo.connect(lg);lg.connect(o.frequency);
  bp.type='bandpass';bp.frequency.value=720;bp.Q.value=1.4;
  g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v,t+.02);g.gain.exponentialRampToValueAtTime(.0001,t+dur);
  o.connect(bp);bp.connect(g);g.connect(audioOutput());audioVoices+=2;
  o.onended=()=>{o.disconnect();lfo.disconnect();lg.disconnect();bp.disconnect();g.disconnect();audioVoices-=2;};
  o.start(t);lfo.start(t);o.stop(t+dur+.02);lfo.stop(t+dur+.02);
}
function klonk(){
  audioTone(155,55,.16,.12,'triangle');audioTone(660,880,.09,.04,'sine',.14);
}
function fartSound(lvl){
  if(!actx||muted||document.hidden||actx.currentTime-lastFart<.65||audioVoices>=7)return;
  lastFart=actx.currentTime;lvl=clamp(lvl,1,3);
  const t=actx.currentTime,dur=[.28,.42,.65][lvl-1],base=[100,85,65][lvl-1];
  const o=actx.createOscillator(),lfo=actx.createOscillator(),lg=actx.createGain();
  o.type='triangle';o.frequency.setValueAtTime(base*1.2,t);o.frequency.exponentialRampToValueAtTime(base*.7,t+dur);
  lfo.type='sine';lfo.frequency.value=22;lg.gain.value=base*.25;lfo.connect(lg);lg.connect(o.frequency);
  const lp=actx.createBiquadFilter();lp.type='lowpass';lp.frequency.value=340;lp.Q.value=.65;
  const g=actx.createGain();g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.1+lvl*.015,t+.025);
  g.gain.exponentialRampToValueAtTime(.0001,t+dur);
  o.connect(lp);lp.connect(g);g.connect(audioOutput());audioVoices+=2;
  o.onended=()=>{o.disconnect();lfo.disconnect();lg.disconnect();lp.disconnect();g.disconnect();audioVoices-=2;};
  o.start(t);lfo.start(t);o.stop(t+dur+.03);lfo.stop(t+dur+.03);
}
function honk(){
  if(CHARS[charSel].id==='cow'||stampCount()>=6){moo();toast('MUUUU!');}
  else if(CARS[carSel].id==='svinexpress'){grunt(0);grunt(.2);}      /* the Svinexpress horn: two short oinks */
  else if(CARS[carSel].id==='burgarbus')sibBell(1.2);                /* the Burgarbus horn: the order bell */
  else{audioTone(330,320,.15,.07,'triangle');audioTone(330,320,.15,.07,'triangle',.19);}
}
function saveAudioSettings(){
  try{localStorage.setItem('vk.audio.v1',JSON.stringify({...audioVolumes,muted}));}catch(_){}
  applyAudioMix();refreshAudioControls();
}
function toggleAudio(){muted=!muted;if(!muted)bootAudio();saveAudioSettings();toast(muted?'LJUD AV':'LJUD PÅ');}
function refreshAudioControls(){
  for(const key of Object.keys(audioVolumes)){
    const el=document.getElementById('audio-'+key);if(el)el.textContent=Math.round(audioVolumes[key]*100)+'%';
  }
  const el=document.getElementById('btnSoundMute');if(el){el.textContent=muted?'LJUD: AV':'LJUD: PÅ';el.setAttribute('aria-pressed',String(muted));}
}
for(const button of document.querySelectorAll('[data-volume]'))button.addEventListener('click',()=>{
  const key=button.dataset.volume;
  audioVolumes[key]=Math.round(clamp(audioVolumes[key]+Number(button.dataset.step),0,1)*100)/100;
  bootAudio();saveAudioSettings();
});
const soundButton=document.getElementById('btnSoundMute');if(soundButton)soundButton.addEventListener('click',toggleAudio);
refreshAudioControls();
function audioUpdate(){
  if(!engine)return;
  const active=state==='race'&&!paused&&!document.hidden;
  const r=clamp(player.speed/Math.max(1,player.maxSpeed),0,1.2),t=actx.currentTime;
  const throttle=active?clamp(input.throttle,0,1):0;
  // Virtual gear changes keep the pitch from rising into a continuous whine.
  const gear=Math.min(3,Math.floor(r*4)),rpm=clamp(r*4-gear,0,1);
  const f=42+rpm*30+gear*5+throttle*7+(player.boost>0?8:0);
  engine.o1.frequency.setTargetAtTime(f,t,.14);engine.o2.frequency.setTargetAtTime(f*.5,t,.14);
  engine.lp.frequency.setTargetAtTime(350+throttle*220+r*100,t,.15);
  engine.g.gain.setTargetAtTime(active?(.045+throttle*.035+r*.018):0,t,.09);
  const grounded=active&&!player.air&&player.speed>6;
  skid.g.gain.setTargetAtTime(grounded&&player.drift!==0?.065:0,t,.1);
  const S=SFX[player.sfx],n=S&&S.noise;
  if(n)skid.road.bp.frequency.setTargetAtTime(Math.min(900,n.f*.6),t,.12);
  const rattle=S&&S.rattle?.8+.2*Math.sin(t*35):1;
  skid.road.g.gain.setTargetAtTime(grounded&&n?Math.min(.09,n.g*.6)*r*rattle:0,t,.12);
}
document.addEventListener('visibilitychange',()=>{applyAudioMix();audioUpdate();});
