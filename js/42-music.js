"use strict";
/* Music: songs synthesized note by note on the music bus. SONGS holds each song's tempo, swing, loop length and a
   step(ctx,fx,s,t,mood) that schedules one sixteenth; a stage opts in with music:'<song id>'.
   Menu theme: a 90s kart-funk loop (125 BPM, swung 16ths).
   Sixteen bars: A (groove), A with the hook, B (held brass and a new tune), A with the hook and a snare fill. */
const MUSIC_STEP=60/125/4,MUSIC_LOOP=16*16;
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
let music=null,musicFx=null;
/** the music bus's own chain: a gate for fading, a duck under big effects, a warm low-pass, a dotted-eighth echo
    for the leads, and a sting input that skips the gate so it sounds after the song has faded */
function musicChain(ctx,dest){
  const gate=ctx.createGain(),duck=ctx.createGain(),lp=ctx.createBiquadFilter(),echo=ctx.createDelay(1),fb=ctx.createGain(),wet=ctx.createGain(),sting=ctx.createGain();
  lp.type='lowpass';lp.frequency.value=6500;lp.Q.value=.5;gate.gain.value=0;duck.gain.value=1;
  echo.delayTime.value=MUSIC_STEP*3;fb.gain.value=.28;wet.gain.value=.3;
  gate.connect(duck);duck.connect(lp);lp.connect(dest);sting.connect(lp);echo.connect(fb);fb.connect(echo);echo.connect(wet);wet.connect(gate);
  const len=ctx.sampleRate,buf=ctx.createBuffer(1,len,ctx.sampleRate),d=buf.getChannelData(0);
  for(let i=0;i<len;i++)d[i]=Math.random()*2-1;
  return {gate,duck,echo,sting,noise:buf};
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
function musicNoise(ctx,fx,t,dur,vol,type,f,out){
  const src=ctx.createBufferSource(),flt=ctx.createBiquadFilter(),g=ctx.createGain();
  src.buffer=fx.noise;flt.type=type;flt.frequency.value=f;flt.Q.value=.7;
  g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(.001,t+dur);
  src.connect(flt);flt.connect(g);g.connect(out||fx.gate);
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

/* Raket-Runes runda, "Nedräkningen": final-boss space synth, 150 BPM, straight 16ths, D minor with a D major lift.
   Forty bars: the 3-2-1 countdown (it lands on KÖR!), A (groove, the filter opening), A with the hook, the countdown
   again, B (major, held tune), B with the arpeggio doubled, A with the hook and a two-bar rocket build. */
const RUNE_STEP=60/150/4;
/** bass is the root (MIDI, played root and octave on 8ths); arp is the four notes the 16th arpeggio runs over */
const RUNE_CHORDS={
  Dm:{bass:38,arp:[62,65,69,74]},Bb:{bass:34,arp:[62,65,70,74]},C:{bass:36,arp:[64,67,72,76]},A:{bass:33,arp:[61,64,69,73]},
  D:{bass:38,arp:[62,66,69,74]},Bm:{bass:35,arp:[62,66,71,74]},G:{bass:31,arp:[62,67,71,74]}};
const RUNE_A=['Dm','Bb','C','A'],RUNE_B=['D','A','Bm','G'],RUNE_B_END=['D','A','G','A'];
const RUNE_ARP=[0,1,2,3,2,1,2,3,0,1,2,3,3,2,1,2];
const RUNE_HOOK=menuNotes([[0,74,2],[2,77,2],[4,81,4],[8,79,2],[10,77,2],[12,76,4],[16,74,2],[18,77,2],[20,82,4],[24,81,2],[26,79,2],[28,77,4],
  [32,76,2],[34,79,2],[36,84,4],[40,84,2],[42,82,2],[44,79,4],[48,81,4],[52,76,2],[54,73,2],[56,76,8]]);
const RUNE_TUNE=menuNotes([[0,78,8],[8,81,8],[16,76,8],[24,81,4],[28,83,4],[32,86,12],[44,83,4],[48,83,8],[56,81,4],[60,78,4]]);
const RUNE_TUNE_END=menuNotes([[0,78,8],[8,81,8],[16,76,8],[24,81,4],[28,83,4],[32,83,8],[40,79,8],[48,81,4],[52,83,4],[56,85,8]]);
/** what bar b (0..39) is: its part, chord, lead (a four-bar map) and the bar its four-bar phrase starts on */
function runeBar(b){
  if(b===0||b===17)return {part:'count'};
  if(b<=16)return {part:'A',ch:RUNE_A[(b-1)&3],lead:b>=9?RUNE_HOOK:null,from:b>=9?9:1};
  if(b<=33){const p=b-18&7;return {part:b<26?'B':'B2',ch:(p<4?RUNE_B:RUNE_B_END)[p&3],lead:p<4?RUNE_TUNE:RUNE_TUNE_END,from:b-(p&3)};}
  if(b<=37)return {part:'A',ch:RUNE_A[(b-34)&3],lead:RUNE_HOOK,from:34};
  return {part:'build',ch:b===38?'C':'A'};
}
/** a hand clap: three quick band-passed bursts */
function musicClap(ctx,fx,t,v){
  musicNoise(ctx,fx,t,.03,.12*v,'bandpass',1400);musicNoise(ctx,fx,t+.012,.03,.12*v,'bandpass',1400);
  musicNoise(ctx,fx,t+.024,.16,.14*v,'bandpass',1200);
}
/** the rocket: looped noise through a band-pass that climbs for dur seconds, cut at the end */
function runeSweep(ctx,fx,t,dur){
  const src=ctx.createBufferSource(),bp=ctx.createBiquadFilter(),g=ctx.createGain();
  src.buffer=fx.noise;src.loop=true;bp.type='bandpass';bp.Q.value=2;
  bp.frequency.setValueAtTime(350,t);bp.frequency.exponentialRampToValueAtTime(7000,t+dur);
  g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.09,t+dur*.95);g.gain.linearRampToValueAtTime(0,t+dur);
  src.connect(bp);bp.connect(g);g.connect(fx.gate);
  src.onended=()=>{src.disconnect();bp.disconnect();g.disconnect();};
  src.start(t);src.stop(t+dur+.02);
}
function runeStep(ctx,fx,s,t,mood){
  const b=s>>4,i=s&15,k=mood.semi,B=runeBar(b);
  if(B.part==='count'){                                   /* three falling stabs, a rest, then everything hits */
    if(i===0||i===4||i===8){
      const n=[81,77,74][i>>2]+k;
      for(const m of [n-12,n-5,n])musicVoice(ctx,[fx.gate],'sawtooth',midiHz(m),t,.16,.035,3200,900,[-8,8]);
      musicVoice(ctx,[fx.gate,fx.echo],'square',midiHz(n+12),t,.12,.03,3000);
      musicKick(ctx,fx,t);
    }
    if(i===8)runeSweep(ctx,fx,t,8*RUNE_STEP);
    return;
  }
  const ch=RUNE_CHORDS[B.ch],fill=mood.fill||B.part==='build',big=B.part==='B2'||mood.last;
  if(i===0&&(b===1||b===18||b===26||b===34))musicNoise(ctx,fx,t,1.1,.06,'highpass',5000);   /* crash into each part */
  if(i%4===0)musicKick(ctx,fx,t);
  if(fill){
    if(b===38&&!mood.fill){if(!(i&1))musicSnare(ctx,fx,t,.3+i*.03);}
    else{musicSnare(ctx,fx,t,.25+i*.045);if(i===0)runeSweep(ctx,fx,t,16*RUNE_STEP);}
  }else if(i===4||i===12)musicClap(ctx,fx,t,1);
  if(i%4===2)musicNoise(ctx,fx,t,.08,.04,'highpass',8000);
  else if(big&&i&1)musicNoise(ctx,fx,t,.03,.016,'highpass',9000);
  if(!(i&1))musicVoice(ctx,[fx.gate],'sawtooth',midiHz(ch.bass+(i&2?12:0)+k),t,.09,.15,1400,300,[-6,6]);
  const open=B.part==='A'?(b-B.from)/7:1,a=ch.arp[RUNE_ARP[i]]+k;
  musicVoice(ctx,[fx.gate],'sawtooth',midiHz(a),t,.08,.022,700+2200*open,500,[-6,6]);
  if(big)musicVoice(ctx,[fx.gate],'sawtooth',midiHz(a+12),t,.07,.013,3000,800);
  const n=!fill&&B.lead&&B.lead[((b-B.from)&3)*16+i];
  if(n){
    if(B.part==='A')musicVoice(ctx,[fx.gate,fx.echo],'square',midiHz(n[1]+k),t,n[2]*RUNE_STEP*.9,.045,2600,1700);
    else musicVoice(ctx,[fx.gate,fx.echo],'square',midiHz(n[1]+k),t,n[2]*RUNE_STEP*.95,.032,3000,1800,[-5,5]);
  }
}
/** win: a fast D major run up into a held chord; lose: the rocket fizzles down and thuds */
function runeSting(ctx,fx,t,win,k){
  if(win){
    [62,66,69,74,78].forEach((m,j)=>musicVoice(ctx,[fx.sting],'square',midiHz(m+k),t+j*.07,.1,.04,3000));
    for(const m of [50,62,66,69,74,81])musicVoice(ctx,[fx.sting],'sawtooth',midiHz(m+k),t+.35,1.4,.03,2600,900,[-7,7]);
    musicNoise(ctx,fx,t+.35,1.4,.06,'highpass',5000,fx.sting);
  }else{
    const o=ctx.createOscillator(),g=ctx.createGain();o.type='sawtooth';
    o.frequency.setValueAtTime(880,t);o.frequency.exponentialRampToValueAtTime(110,t+1.1);
    g.gain.setValueAtTime(.05,t);g.gain.exponentialRampToValueAtTime(.001,t+1.2);
    o.connect(g);g.connect(fx.sting);o.onended=()=>{o.disconnect();g.disconnect();};o.start(t);o.stop(t+1.25);
    musicNoise(ctx,fx,t+1.1,.4,.08,'lowpass',300,fx.sting);
  }
}

/** bpm, swing (a fraction of a step on the off sixteenths), loop length in steps, the step function, an optional sting */
const SONGS={
  menu:{bpm:125,swing:.17,loop:MUSIC_LOOP,step:menuStep},
  rune:{bpm:150,swing:0,loop:40*16,step:runeStep,sting:runeSting}};
function musicStart(id,t0){
  const S=SONGS[id],g=musicFx.gate.gain;
  musicFx.echo.delayTime.setValueAtTime(60/S.bpm/4*3,t0);
  g.cancelScheduledValues(actx.currentTime);g.setTargetAtTime(1,actx.currentTime,.02);
  music={id,song:S,t0,tb:t0,s:0,rate:1,semi:0,fill:false,last:false,lift:0,held:false};
}
function musicStop(tau){musicFx.gate.gain.setTargetAtTime(0,actx.currentTime,tau);music=null;}
/** a gentle dip under big effect sounds (the overljud boom, the player knocked off the line) */
function musicDuck(){
  if(!actx||!musicFx)return;
  const g=musicFx.duck.gain,t=actx.currentTime;
  g.cancelScheduledValues(t);g.setTargetAtTime(.75,t,.02);g.setTargetAtTime(1,t+.25,.25);
}
/** the menus play the menu theme; a stage with music starts its song so bar 1 lands on KÖR!, lifts it a semitone and
    4 % on the player's last lap (after a one-bar fill), holds it at 30 % while paused and fades it at the flag before a sting.
    Schedules a quarter second ahead. */
function musicUpdate(){
  if(!actx||!audioMix)return;
  const now=actx.currentTime,on=!muted&&!document.hidden&&audioVolumes.music>0;
  const song=stage.music&&SONGS[stage.music]?stage.music:null;
  let want=null,t0=now+.08;
  if(state==='menu'||state==='select')want='menu';
  else if(song&&state==='race')want=song;
  else if(song&&state==='grid'&&!settleT&&countdown<.3){want=song;t0=now+Math.max(0,countdown);}
  if(!on)want=null;
  if(!musicFx)musicFx=musicChain(actx,audioMix.music);
  if(music&&music.id!==want){
    const S=music.song,semi=music.semi;musicStop(state==='over'?.17:.15);
    if(state==='over'&&on&&S.sting)S.sting(actx,musicFx,now+.5,player.place<=3,semi);
  }
  if(!want)return;
  if(!music)musicStart(want,t0);
  if(music.held!==paused){music.held=paused;musicFx.gate.gain.setTargetAtTime(paused?.3:1,now,.08);}
  if(state==='race'&&!music.last&&!music.lift&&LAPS>1&&LAPS<1e9&&player.lap===LAPS-1)music.lift=1;
  const S=music.song;
  if(music.tb<now-.1)music.tb=now+.05;                                                  /* back from a stall: carry on, don't catch up */
  for(;;){
    const len=60/(S.bpm*music.rate)/4,t=music.tb+(music.s&1?S.swing*len:0);
    if(t>=now+.25)break;
    S.step(actx,musicFx,music.s%S.loop,t,music);
    music.tb+=len;music.s++;
    if(music.s%16===0&&music.lift){                                                    /* bar lines: the fill bar, then the lift */
      if(++music.lift===2)music.fill=true;
      else{music.fill=false;music.semi=1;music.rate=1.04;music.last=true;music.lift=0;}
    }
  }
}
