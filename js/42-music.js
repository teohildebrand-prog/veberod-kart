"use strict";
/* Menu theme: a 90s kart-funk loop (125 BPM, swung 16ths), synthesized note by note on the music bus.
   Sixteen bars: A (groove), A with the hook, B (held brass and a new tune), A with the hook and a snare fill. */
const MUSIC_STEP=60/125/4,MUSIC_SWING=.17*MUSIC_STEP,MUSIC_LOOP=16*16;
const midiHz=m=>440*Math.pow(2,(m-69)/12);
/** root is the bass note (MIDI); tones are the chord's root, third, fifth, seventh above it; stab is the brass voicing */
const MENU_CHORDS={
  G:{root:43,tones:[0,4,7,11],stab:[59,62,66,67]},
  Fm:{root:42,tones:[0,3,7,10],stab:[57,61,64,66]},
  Em:{root:40,tones:[0,3,7,10],stab:[59,62,64,67]},
  A:{root:45,tones:[0,4,7,10],stab:[57,61,64,67]},
  Bm:{root:47,tones:[0,3,7,10],stab:[57,59,62,66]}};
const MENU_A=['G','Fm','Em','A'],MENU_B=['Bm','G','Em','A'];
/* the slap bass: step -> [chord tone index (4 = octave), velocity]; octave notes are the pops */
const MENU_BASS={0:[0,1],3:[0,.7],6:[4,.9],8:[0,.8],10:[2,.7],11:[3,.6],13:[4,.8],14:[3,.6]};
/* melodies over four bars: [step, MIDI note, length in steps] */
const MENU_HOOK=[[0,78,2],[2,81,2],[4,83,3],[8,81,2],[10,78,2],[12,76,4],[16,74,2],[18,76,2],[20,78,3],[24,81,2],[26,76,2],[28,73,4],
  [32,71,2],[34,74,2],[36,76,3],[40,79,2],[42,78,2],[44,76,2],[46,74,2],[48,76,6],[54,73,2],[56,69,2],[58,71,2],[60,73,2],[62,76,2]];
const MENU_HOOK_END=MENU_HOOK.slice(0,20).concat([[48,76,4],[52,78,2],[54,76,2],[56,73,3],[60,74,4]]);
const MENU_TUNE=[[0,86,3],[4,83,2],[6,81,2],[8,78,4],[14,81,2],[16,83,6],[22,81,2],[24,78,2],[26,74,2],[28,76,4],
  [32,79,3],[36,78,2],[38,76,2],[40,74,2],[42,76,2],[44,79,4],[48,81,4],[52,79,2],[54,78,2],[56,76,2],[58,73,2],[60,69,4]];
const menuNotes=list=>{const m={};for(const n of list)m[n[0]]=n;return m;};
const MENU_LEAD=[null,menuNotes(MENU_HOOK),menuNotes(MENU_TUNE),menuNotes(MENU_HOOK_END)];
let menuMusic=null,musicFx=null;
/** the music bus's own chain: a warm low-pass, a gate for fading, and a dotted-eighth echo for the lead */
function musicChain(ctx,dest){
  const gate=ctx.createGain(),lp=ctx.createBiquadFilter(),echo=ctx.createDelay(1),fb=ctx.createGain(),wet=ctx.createGain();
  lp.type='lowpass';lp.frequency.value=6500;lp.Q.value=.5;
  echo.delayTime.value=MUSIC_STEP*3;fb.gain.value=.28;wet.gain.value=.3;
  gate.connect(lp);lp.connect(dest);echo.connect(fb);fb.connect(echo);echo.connect(wet);wet.connect(gate);
  const len=ctx.sampleRate,buf=ctx.createBuffer(1,len,ctx.sampleRate),d=buf.getChannelData(0);
  for(let i=0;i<len;i++)d[i]=Math.random()*2-1;
  return {gate,echo,noise:buf};
}
/** one enveloped voice: oscillators (detuned in cents) through a low-pass whose cutoff can sweep */
function musicVoice(ctx,out,type,f,t,dur,vol,cut,cutEnd,detunes){
  const lp=ctx.createBiquadFilter(),g=ctx.createGain(),oscs=[];
  lp.type='lowpass';lp.frequency.setValueAtTime(cut,t);if(cutEnd)lp.frequency.exponentialRampToValueAtTime(cutEnd,t+dur);
  g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(vol,t+.006);g.gain.setTargetAtTime(vol*.6,t+.03,dur*.5);
  g.gain.setTargetAtTime(0,t+dur,.03);lp.connect(g);
  for(const c of out)g.connect(c);
  for(const dt of detunes||[0]){
    const o=ctx.createOscillator();o.type=type;o.frequency.setValueAtTime(f,t);o.detune.value=dt;o.connect(lp);
    o.start(t);o.stop(t+dur+.2);oscs.push(o);
  }
  oscs[0].onended=()=>{for(const o of oscs)o.disconnect();lp.disconnect();g.disconnect();};
}
function musicNoise(ctx,fx,t,dur,vol,type,f){
  const src=ctx.createBufferSource(),flt=ctx.createBiquadFilter(),g=ctx.createGain();
  src.buffer=fx.noise;flt.type=type;flt.frequency.value=f;flt.Q.value=.7;
  g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(.001,t+dur);
  src.connect(flt);flt.connect(g);g.connect(fx.gate);
  src.onended=()=>{src.disconnect();flt.disconnect();g.disconnect();};
  src.start(t,Math.random()*.5);src.stop(t+dur+.02);
}
function musicKick(ctx,fx,t){
  const o=ctx.createOscillator(),g=ctx.createGain();
  o.frequency.setValueAtTime(160,t);o.frequency.exponentialRampToValueAtTime(42,t+.12);
  g.gain.setValueAtTime(.5,t);g.gain.exponentialRampToValueAtTime(.001,t+.28);
  o.connect(g);g.connect(fx.gate);o.onended=()=>{o.disconnect();g.disconnect();};
  o.start(t);o.stop(t+.3);
}
function musicSnare(ctx,fx,t,v){
  musicNoise(ctx,fx,t,.14,.22*v,'bandpass',1800);
  musicVoice(ctx,[fx.gate],'triangle',190,t,.05,.12*v,1200);
}
/** schedules everything that sounds on one sixteenth step s (0..MUSIC_LOOP-1) at time t */
function menuStep(ctx,fx,s,t){
  const bar=s>>4,i=s&15,part=bar>>2,b=bar&3,key=(part===2?MENU_B:MENU_A)[b],ch=MENU_CHORDS[key];
  const fill=bar===15&&i>=12;
  if(i===0||i===6||i===10)musicKick(ctx,fx,t);
  if(i===4||i===12)musicSnare(ctx,fx,t,1);
  else if(fill)musicSnare(ctx,fx,t,.4+(i-12)*.2);
  else if(i===7||i===15)musicSnare(ctx,fx,t,.25);
  if(i===14&&!fill)musicNoise(ctx,fx,t,.14,.045,'highpass',7000);
  else musicNoise(ctx,fx,t,.035,i&1?.022:.045,'highpass',7000);
  const bs=MENU_BASS[i];
  if(bs){
    const pop=bs[0]===4,m=ch.root+(pop?12:ch.tones[bs[0]]);
    musicVoice(ctx,[fx.gate],'sawtooth',midiHz(m),t,pop?.09:.13,(pop?.13:.17)*bs[1],pop?2600:1800,280);
  }
  if(part===2){
    if(i===0)for(const m of ch.stab)musicVoice(ctx,[fx.gate],'sawtooth',midiHz(m),t,MUSIC_STEP*15,.022,900,1600,[-7,7]);
  }else if(i===3||i===6||i===11)for(const m of ch.stab)musicVoice(ctx,[fx.gate],'sawtooth',midiHz(m),t,.11,.03,2600,700,[-7,7]);
  const lead=MENU_LEAD[part],n=lead&&lead[s&63];
  if(n)musicVoice(ctx,[fx.gate,fx.echo],'square',midiHz(n[1]),t,n[2]*MUSIC_STEP*.9,.05,2400,1500);
}
const menuStepTime=(m,s)=>m.t0+s*MUSIC_STEP+(s&1?MUSIC_SWING:0);
/** plays the theme while the menus are up: schedules a quarter second ahead, fades out when a race starts */
function musicUpdate(){
  if(!actx||!audioMix)return;
  const now=actx.currentTime,on=state==='menu'&&!muted&&!document.hidden&&audioVolumes.music>0;
  if(!on){if(menuMusic){musicFx.gate.gain.setTargetAtTime(0,now,.15);menuMusic=null;}return;}
  if(!musicFx)musicFx=musicChain(actx,audioMix.music);
  if(!menuMusic){menuMusic={t0:now+.08,s:0};musicFx.gate.gain.cancelScheduledValues(now);musicFx.gate.gain.setTargetAtTime(1,now,.02);}
  if(menuStepTime(menuMusic,menuMusic.s)<now-.1)menuMusic.t0=now+.05-menuMusic.s*MUSIC_STEP;   /* back from a stall: carry on, don't catch up */
  for(let t;(t=menuStepTime(menuMusic,menuMusic.s))<now+.25;menuMusic.s++)menuStep(actx,musicFx,menuMusic.s%MUSIC_LOOP,t);
}
