"use strict";
/* ───────── tidslopp: alone on the track against Bonden Arne's ghost ───────── */
let TT=false,FREE=false;                  /* FREE: the sandbox, no AI, laps or clock */
const GHOST_HZ=10, ARNE_GHOST={};        /* stage id -> {t, s:[x,y,z,yaw, ...]} at 10 Hz, made once per visit */
function ghostSample(k,buf){
  const tt=raceTime-k.lapStart;
  while(buf.length/4<=tt*GHOST_HZ)buf.push(+k.x.toFixed(2),+k.y.toFixed(2),+k.z.toFixed(2),+k.yaw.toFixed(3));
}
/** Arne drives two laps in the plain kart, alone, no rubber band; the flying lap is his ghost */
function recordArne(st){
  if(ARNE_GHOST[st.id])return ARNE_GHOST[st.id];
  const was=state,rt=raceTime,k=karts[1];
  placeOnGrid();
  const s=10;k.x=sx[s];k.z=sz[s];k.si=s;k.mi=s;k.yaw=Math.atan2(fx[s],fz[s]);k.y=groundAt(k.x,k.z,s);
  Object.assign(k,effStats(CHARS[0],0));k.caution=2.6;k.lookAdd=2;k.line=0;k.lineVar=0;
  k.noBand=true;k.parked=false;k.ghostBuf=[];k.ai=true;
  state='race';raceTime=0;
  let steps=0,buf=null;
  while(k.lap<2&&steps<120*300){
    if(k.lap===1&&!buf)buf=k.ghostBuf;
    const ctl=aiControl(k);k.aiSteer=ctl.steer;drive(k,FIXED,ctl);raceTime+=FIXED;steps++;
  }
  const G={t:k.best||k.lapTimes[1]||999,s:buf||[]};
  ARNE_GHOST[st.id]=G;
  k.noBand=false;k.ghostBuf=null;state=was;raceTime=rt;tractor.visible=false;tractorT=0;
  return G;
}
/** a see-through copy of a rig; shared fog and light uniforms stay shared */
function ghostify(root,op){
  root.traverse(o=>{if(!o.material||!o.material.uniforms)return;
    const m0=o.material,m=m0.clone();
    for(const key in m0.uniforms)if(key!=='uOpacity'&&key!=='uColor')m.uniforms[key]=m0.uniforms[key];
    m.uniforms.uOpacity={value:op};m.transparent=true;m.depthWrite=false;o.material=m;});
  return root;
}
const ghostRigs={};
function ghostRig(key,color,kind,car){
  let v=ghostRigs[key];
  if(!v){v=buildKart(color,kind,car);ghostify(v.root,.38);v.root.visible=false;scene.add(v.root);ghostRigs[key]=v;}
  return v;
}
function placeGhost(v,G){
  if(!G||!G.s||G.s.length<8){v.root.visible=false;return;}
  const f=(raceTime-player.lapStart)*GHOST_HZ,n=G.s.length/4;
  if(f<0||f>=n-1){v.root.visible=false;return;}
  const i=Math.floor(f),a=f-i,S=G.s,o=i*4;
  v.root.visible=true;
  v.root.position.set(lerp(S[o],S[o+4],a),lerp(S[o+1],S[o+5],a),lerp(S[o+2],S[o+6],a));
  v.root.rotation.set(0,S[o+3]+wrapAng(S[o+7]-S[o+3])*a,0);
}
function drawGhosts(){
  const on=TT&&state==='race'&&player.lap>=1&&!player.done;
  if(!TT){for(const v of Object.values(ghostRigs))v.root.visible=false;return;}
  const arne=ghostRig('arne',CHARS[0].color,'arne','kart');
  const mine=ghostRig('me'+charSel+':'+carSel,0xffffff,kindOf(CHARS[charSel]),CARS[carSel].id);
  for(const v of Object.values(ghostRigs))if(v!==arne&&v!==mine)v.root.visible=false;
  if(!on){arne.root.visible=false;mine.root.visible=false;return;}
  placeGhost(arne,ARNE_GHOST[stage.id]);
  placeGhost(mine,SAVE.ghosts[stage.id]);
}
function ttLap(lt){
  const id=stage.id,A=ARNE_GHOST[id],flying=player.lap>=2;
  let msg='VARV '+player.lap+': '+fmt(lt);
  if(flying&&A){
    const d=lt-A.t;msg+=' · '+(d<0?'−':'+')+Math.abs(d).toFixed(2)+' MOT ARNE';
    if(d<0&&!SAVE.unlock['mirror_'+id]){SAVE.unlock['mirror_'+id]=true;writeSave();
      setTimeout(()=>{toast('SPEGELVÄND '+stage.name+' UPPLÅST!');ping(520,1300,.25);},1600);}
  }
  const G=SAVE.ghosts[id];
  if(flying&&(!G||lt<G.t)&&player.ghostBuf&&player.ghostBuf.length>8){
    SAVE.ghosts[id]={t:lt,s:player.ghostBuf.slice()};writeSave();}
  toast(msg);
}
