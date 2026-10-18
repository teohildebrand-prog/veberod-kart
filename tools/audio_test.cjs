const vm=require('node:vm'),fs=require('node:fs'),assert=require('node:assert/strict');
class Param{constructor(){this.value=0}setTargetAtTime(v){assert(Number.isFinite(v));this.value=v}setValueAtTime(v){this.value=v}linearRampToValueAtTime(v){this.value=v}exponentialRampToValueAtTime(v){assert(v>0);this.value=v}}
const nodes=[];
class Node{constructor(){for(const k of ['gain','frequency','Q','threshold','knee','ratio','attack','release'])this[k]=new Param();nodes.push(this)}connect(n){this.destination=n}disconnect(){}start(){}stop(){if(this.onended)this.onended()}setPeriodicWave(){}}
class Context{constructor(){this.currentTime=1;this.sampleRate=44100;this.state='running';this.destination={}}createGain(){return new Node()}createOscillator(){return new Node()}createBiquadFilter(){return new Node()}createDynamicsCompressor(){return new Node()}createBufferSource(){return new Node()}createPeriodicWave(){return {}}createBuffer(n,len){return {getChannelData:()=>new Float32Array(len)}}}
const storage={},elements={},handlers={};
for(const k of ['master','engine','effects'])elements['audio-'+k]={};
elements.btnSoundMute={setAttribute(){}};
const ctx=vm.createContext({console,Float32Array,Math,Number,JSON,setTimeout,window:{AudioContext:Context},document:{hidden:false,querySelectorAll:()=>[],getElementById:id=>elements[id],addEventListener:(k,f)=>handlers[k]=f},localStorage:{getItem:k=>storage[k]||null,setItem:(k,v)=>storage[k]=v},clamp:(x,a,b)=>Math.max(a,Math.min(b,x)),state:'menu',paused:false,input:{throttle:1},player:{speed:25,maxSpeed:40,boost:0,drift:1,onRoad:true,air:false,sfx:'road'},SFX:{road:{noise:{f:1000,g:.1}}},toast(){},CHARS:[{id:'cow'}],charSel:0,stampCount:()=>0});
elements.btnSoundMute.addEventListener=()=>{};
const source=fs.readFileSync(require('node:path').join(__dirname,'../js/42-audio.js'),'utf8');vm.runInContext(source,ctx);
const read=s=>vm.runInContext(s,ctx);
read('bootAudio();audioUpdate()');assert.equal(read('engine.g.gain.value'),0,'menus are silent');
read("state='race';audioUpdate()");assert(read('engine.g.gain.value')>0);assert(read('skid.g.gain.value')>0);
read('paused=true;audioUpdate()');assert.equal(read('engine.g.gain.value'),0);assert.equal(read('skid.g.gain.value'),0);assert.equal(read('skid.road.g.gain.value'),0);
read('paused=false;toggleAudio()');assert.equal(read('audioMix.master.gain.value'),0);assert.equal(read('audioVoices'),0);
read('toggleAudio();audioVolumes.engine=.25;saveAudioSettings()');assert.equal(JSON.parse(storage['vk.audio.v1']).engine,.25);
read('moo();fartSound(3);klonk();ping(1500,20,.1)');assert.equal(read('audioVoices'),0,'one-shot nodes release');
read('audioVoices=8;ping(600,900,.1)');assert.equal(read('audioVoices'),8,'voice cap');read('audioVoices=0');
ctx.document.hidden=true;handlers.visibilitychange();assert.equal(read('audioMix.master.gain.value'),0);assert.equal(read('engine.g.gain.value'),0);
const ctx2=vm.createContext({...ctx,document:ctx.document});vm.runInContext(source,ctx2);assert.equal(vm.runInContext('audioVolumes.engine',ctx2),.25,'reload settings');
const jsDir=require('node:path').join(__dirname,'../js');
for(const f of fs.readdirSync(jsDir))if(f!=='42-audio.js'&&/actx\.destination/.test(fs.readFileSync(require('node:path').join(jsDir,f),'utf8')))assert.fail(f+' bypasses the mixer: connect to audioOutput(), not actx.destination');
console.log('PASS: every sound goes through the mixer, menu silence, race loops, paused engine/tyres, mute, saved settings, effect cleanup, voice cap, hidden-tab silence, reload. Audio API simulated; browser playback not verified.');
