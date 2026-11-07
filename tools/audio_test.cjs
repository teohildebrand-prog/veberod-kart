const vm=require('node:vm'),fs=require('node:fs'),assert=require('node:assert/strict');
class Param{constructor(){this.value=0}setTargetAtTime(v){assert(Number.isFinite(v));this.value=v}setValueAtTime(v){assert(Number.isFinite(v));this.value=v}linearRampToValueAtTime(v){this.value=v}exponentialRampToValueAtTime(v){assert(v>0);this.value=v}cancelScheduledValues(){}}
const nodes=[];
class Node{constructor(){for(const k of ['gain','frequency','Q','threshold','knee','ratio','attack','release','detune','delayTime'])this[k]=new Param();nodes.push(this)}connect(n){this.destination=n}disconnect(){}start(){}stop(){if(this.onended)this.onended()}setPeriodicWave(){}}
class Context{constructor(){this.currentTime=1;this.sampleRate=44100;this.state='running';this.destination={}}createGain(){return new Node()}createOscillator(){return new Node()}createBiquadFilter(){return new Node()}createDynamicsCompressor(){return new Node()}createBufferSource(){return new Node()}createDelay(){return new Node()}createPeriodicWave(){return {}}createBuffer(n,len){return {getChannelData:()=>new Float32Array(len)}}}
const storage={},elements={},handlers={};
for(const k of ['master','engine','effects','music'])elements['audio-'+k]={};
elements.btnSoundMute={setAttribute(){}};
const ctx=vm.createContext({console,Float32Array,Math,Number,JSON,setTimeout,window:{AudioContext:Context},document:{hidden:false,querySelectorAll:()=>[],getElementById:id=>elements[id],addEventListener:(k,f)=>handlers[k]=f},localStorage:{getItem:k=>storage[k]||null,setItem:(k,v)=>storage[k]=v},clamp:(x,a,b)=>Math.max(a,Math.min(b,x)),state:'menu',paused:false,stage:{id:'plain'},countdown:3.6,settleT:0,LAPS:3,input:{throttle:1},player:{lap:0,place:1,speed:25,maxSpeed:40,boost:0,drift:1,onRoad:true,air:false,sfx:'road'},SFX:{road:{noise:{f:1000,g:.1}}},toast(){},CHARS:[{id:'cow'}],charSel:0,stampCount:()=>0});
elements.btnSoundMute.addEventListener=()=>{};
const source=fs.readFileSync(require('node:path').join(__dirname,'../js/42-audio.js'),'utf8');vm.runInContext(source,ctx);
const read=s=>vm.runInContext(s,ctx);
vm.runInContext(fs.readFileSync(require('node:path').join(__dirname,'../js/42-music.js'),'utf8'),ctx);
read('bootAudio();audioUpdate()');assert.equal(read('engine.g.gain.value'),0,'menus are silent');
read('musicUpdate()');assert(read('music.s')>0&&read("music.id")==='menu','menu theme schedules ahead');assert.equal(read('musicFx.gate.gain.value'),1);
let made=nodes.length;read('musicUpdate()');assert.equal(nodes.length,made,'nothing new inside the lookahead');
for(let i=0;i<340;i++)read('actx.currentTime+=.1;musicUpdate()');assert(read('music.s')>=256,'the loop wraps round');
read("state='select';musicUpdate()");assert.equal(read('music.id'),'menu','driver select keeps the menu theme');
read("state='grid';musicUpdate()");assert.equal(read('music'),null,'a stage without music is silent');assert.equal(read('musicFx.gate.gain.value'),0);
read("state='race';musicUpdate()");assert.equal(read('music'),null);
for(const id of read('Object.keys(SONGS)'))for(const mood of [{semi:0,fill:false,last:false},{semi:1,fill:true,last:true}]){
  ctx.mood=mood;read(`for(let s=0;s<SONGS.${id}.loop;s++)SONGS.${id}.step(actx,musicFx,s,actx.currentTime+s*.01,mood)`);
  if(read(`!!SONGS.${id}.sting`)){read(`SONGS.${id}.sting(actx,musicFx,actx.currentTime,true,mood.semi);SONGS.${id}.sting(actx,musicFx,actx.currentTime,false,mood.semi)`);}
}
read("stage={id:'rune',music:'rune'};state='grid';countdown=2;musicUpdate()");assert.equal(read('music'),null,'silent through the countdown');
read('countdown=.2;musicUpdate()');assert.equal(read('music.id'),'rune');assert(Math.abs(read('music.t0-actx.currentTime')-.2)<1e-9,'bar 1 lands on KÖR!');
read('countdown=3.6;musicUpdate()');assert.equal(read('music'),null,'a restarted countdown starts over');
read('countdown=.1;musicUpdate();countdown=0;state="race"');
made=nodes.length;read('musicUpdate()');assert.equal(nodes.length,made,'nothing new inside the lookahead');
for(let i=0;i<700;i++)read('actx.currentTime+=.1;musicUpdate()');assert(read('music.s')>=640,'the stage song wraps round');
read('paused=true;musicUpdate()');assert.equal(read('musicFx.gate.gain.value'),.3,'paused: down to 30 %');
read('actx.currentTime+=1;musicUpdate()');assert.equal(read('music.held'),true,'keeps playing while paused');
read('paused=false;musicUpdate()');assert.equal(read('musicFx.gate.gain.value'),1);
read('player.lap=LAPS-1');let fill=false;
for(let i=0;i<40;i++){read('actx.currentTime+=.1;musicUpdate()');fill=fill||read('music.fill');}
assert(fill,'a fill bar before the lift');assert.equal(read('music.semi'),1,'last lap: a semitone up');assert.equal(read('music.rate'),1.04);
read('musicDuck()');assert.equal(read('musicFx.duck.gain.value'),1,'the duck comes back');
made=nodes.length;read("state='over';player.place=2;musicUpdate()");assert.equal(read('music'),null);assert.equal(read('musicFx.gate.gain.value'),0,'fades at the flag');
assert(nodes.length>made,'a sting plays');
read("state='menu';stage={id:'plain'};player.lap=0;musicUpdate()");assert.equal(read('music.id'),'menu');
read('actx.currentTime=1');
read("state='race';audioUpdate()");assert(read('engine.g.gain.value')>0);assert(read('skid.g.gain.value')>0);
read('paused=true;audioUpdate()');assert.equal(read('engine.g.gain.value'),0);assert.equal(read('skid.g.gain.value'),0);assert.equal(read('skid.road.g.gain.value'),0);
read('paused=false;toggleAudio()');assert.equal(read('audioMix.master.gain.value'),0);assert.equal(read('audioVoices'),0);
read('toggleAudio();audioVolumes.engine=.25;audioVolumes.music=.3;saveAudioSettings()');assert.equal(JSON.parse(storage['vk.audio.v1']).engine,.25);assert.equal(JSON.parse(storage['vk.audio.v1']).music,.3);assert.equal(read('audioMix.music.gain.value'),.3);
read('moo();fartSound(3);klonk();ping(1500,20,.1)');assert.equal(read('audioVoices'),0,'one-shot nodes release');
read('audioVoices=8;ping(600,900,.1)');assert.equal(read('audioVoices'),8,'voice cap');read('audioVoices=0');
ctx.document.hidden=true;handlers.visibilitychange();assert.equal(read('audioMix.master.gain.value'),0);assert.equal(read('engine.g.gain.value'),0);
const ctx2=vm.createContext({...ctx,document:ctx.document});vm.runInContext(source,ctx2);assert.equal(vm.runInContext('audioVolumes.engine',ctx2),.25,'reload settings');
const jsDir=require('node:path').join(__dirname,'../js');
for(const f of fs.readdirSync(jsDir))if(f!=='42-audio.js'&&/actx\.destination/.test(fs.readFileSync(require('node:path').join(jsDir,f),'utf8')))assert.fail(f+' bypasses the mixer: connect to audioOutput(), not actx.destination');
console.log('PASS: every sound goes through the mixer, music (menu theme in menus and driver select, stage songs: silent countdown, start on KÖR!, wrap, 30 % when paused, last-lap fill and lift, duck, fade and sting at the flag; every song step and sting schedules finite values), race loops, paused engine/tyres, mute, saved settings, effect cleanup, voice cap, hidden-tab silence, reload. Audio API simulated; browser playback not verified.');
