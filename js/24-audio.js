"use strict";
/* ───────── audio ───────── */
let actx=null,engine=null,skid=null,muted=false;
function bootAudio(){
  if(actx||muted)return;
  const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;
  actx=new AC();
  const lp=actx.createBiquadFilter();lp.type='lowpass';lp.frequency.value=900;
  const g=actx.createGain();g.gain.value=0;
  const o1=actx.createOscillator();o1.type='sawtooth';o1.frequency.value=70;
  const o2=actx.createOscillator();o2.type='square';o2.frequency.value=35;
  o1.connect(lp);o2.connect(lp);lp.connect(g);g.connect(actx.destination);
  o1.start();o2.start();engine={o1,o2,g,lp};
  const len=actx.sampleRate*2,buf=actx.createBuffer(1,len,actx.sampleRate),d=buf.getChannelData(0);
  for(let i=0;i<len;i++)d[i]=Math.random()*2-1;
  const src=actx.createBufferSource();src.buffer=buf;src.loop=true;
  const bp=actx.createBiquadFilter();bp.type='bandpass';bp.frequency.value=2000;bp.Q.value=1.3;
  const sg=actx.createGain();sg.gain.value=0;
  src.connect(bp);bp.connect(sg);sg.connect(actx.destination);src.start();
  skid={g:sg};
}
function ping(f0,f1,dur){
  if(!actx)return;
  const o=actx.createOscillator(),g=actx.createGain(),t=actx.currentTime;
  o.type='square';
  o.frequency.setValueAtTime(f0,t);
  o.frequency.exponentialRampToValueAtTime(Math.max(40,f1),t+dur);
  g.gain.setValueAtTime(.075,t);
  g.gain.exponentialRampToValueAtTime(.0001,t+dur);
  o.connect(g);g.connect(actx.destination);o.start(t);o.stop(t+dur+.02);
}
function moo(){                            /* two detuned saws through a lowpass */
  if(!actx)return;
  const t=actx.currentTime,g=actx.createGain(),lp=actx.createBiquadFilter();
  lp.type='lowpass';lp.frequency.setValueAtTime(380,t);lp.frequency.linearRampToValueAtTime(900,t+.25);
  lp.frequency.linearRampToValueAtTime(300,t+1.0);lp.Q.value=4;
  g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(.16,t+.12);
  g.gain.setValueAtTime(.16,t+.7);g.gain.exponentialRampToValueAtTime(.0001,t+1.05);
  for(const d of [0,4]){
    const o=actx.createOscillator();o.type='sawtooth';
    o.frequency.setValueAtTime(118+d,t);o.frequency.linearRampToValueAtTime(142+d,t+.25);
    o.frequency.linearRampToValueAtTime(96+d,t+1.0);
    o.connect(lp);o.start(t);o.stop(t+1.1);
  }
  lp.connect(g);g.connect(actx.destination);
}
function klonk(){                          /* rubber stamp on paper */
  if(!actx)return;
  const t=actx.currentTime,o=actx.createOscillator(),g=actx.createGain();
  o.type='triangle';o.frequency.setValueAtTime(190,t);o.frequency.exponentialRampToValueAtTime(55,t+.14);
  g.gain.setValueAtTime(.3,t);g.gain.exponentialRampToValueAtTime(.0001,t+.2);
  o.connect(g);g.connect(actx.destination);o.start(t);o.stop(t+.22);
  const len=(actx.sampleRate*.05)|0,b=actx.createBuffer(1,len,actx.sampleRate),d=b.getChannelData(0);
  for(let i=0;i<len;i++)d[i]=(Math.random()*2-1)*(1-i/len);
  const n=actx.createBufferSource(),ng=actx.createGain();ng.gain.value=.22;
  n.buffer=b;n.connect(ng);ng.connect(actx.destination);n.start(t);
  setTimeout(()=>ping(880,1320,.09),170);
}
function honk(){
  if(CHARS[charSel].id==='cow'||stampCount()>=6){moo();toast('MUUUU!');}
  else{ping(420,400,.18);setTimeout(()=>ping(420,400,.18),220);}
}
function toggleAudio(){
  muted=!muted;
  if(muted&&actx){actx.close();actx=null;engine=null;skid=null;}
  else bootAudio();
  toast(muted?'LJUD AV':'LJUD PÅ');
}
function audioUpdate(){
  if(!engine)return;
  const r=clamp(player.speed/player.maxSpeed,0,1.2);
  const f=64+r*330+(player.boost>0?70:0);
  engine.o1.frequency.setTargetAtTime(f,actx.currentTime,.05);
  engine.o2.frequency.setTargetAtTime(f*.5,actx.currentTime,.05);
  engine.lp.frequency.setTargetAtTime(600+r*1700,actx.currentTime,.08);
  engine.g.gain.setTargetAtTime(state==='race'?(0.028+r*0.05):0.012,actx.currentTime,.1);
  if(skid)skid.g.gain.setTargetAtTime(player.drift!==0?0.03:(player.onRoad?0:0.014),actx.currentTime,.06);
}
