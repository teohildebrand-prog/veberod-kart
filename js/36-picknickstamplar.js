"use strict";
/* ───────── picknickstämplar ───────── */
const stampTex=pixTex(64,64,(g)=>{
  for(let i=0;i<8;i++)for(let j=0;j<8;j++){g.fillStyle=(i+j)%2?'#c8281c':'#f4ecd8';g.fillRect(i*8,j*8,8,8);}
  g.fillStyle='#f4ecd8';g.beginPath();g.arc(32,34,19,0,6.283);g.fill();
  g.fillStyle='#7a4e22';g.fillRect(17,32,30,14);
  g.fillStyle='#a8743a';for(let x=19;x<46;x+=6)g.fillRect(x,34,3,10);
  g.strokeStyle='#7a4e22';g.lineWidth=4;g.beginPath();g.arc(32,32,11,Math.PI,0);g.stroke();
});
let stampObjs=[];
/** the sharpest corner on the main loop, away from the grid and the forks */
function tightestCorner(){
  let best=0,bv=-1;
  for(let i=0;i<N;i++){
    if(Math.min(i,N-i)<50||!clearOfForks(i,10))continue;
    if(JUMPS.some(J=>Math.min(Math.abs(i-J.at),N-Math.abs(i-J.at))<J.up+J.dn+10))continue;
    if(Math.abs(scurv[i])>bv){bv=Math.abs(scurv[i]);best=i;}
  }
  return best;
}
function allStamps(){return STAGES.reduce((a,S)=>a.concat(S.stamps||[]),[]);}
function stampCount(){return allStamps().filter(d=>SAVE.stamps[d.id]).length;}
function stageStamps(S){const L=S.stamps||[];return [L.filter(d=>SAVE.stamps[d.id]).length,L.length];}
function ghostStamp(o){                     /* owned: translucent, gives nothing again */
  o.mesh.traverse(m=>{if(m.material){m.material.transparent=true;m.material.depthWrite=false;
    m.material.uniforms.uOpacity.value=.3;m.material.needsUpdate=true;}});
}
function buildStamps(st){
  stampObjs=[];
  for(const d of st.stamps||[]){
    let x,z,y,yaw,rib=0,mx,mz;
    if(d.route==='main'){
      let i=d.i,lat=d.lat,up=1.4;
      if(i==='tight'){i=tightestCorner();lat=-Math.sign(scurv[i])*(HW-1.6);}   /* on the apex */
      if(d.jump!=null&&JUMPS.length){const J=JUMPS[Math.min(d.jump,JUMPS.length-1)];i=(J.at+d.after)%N;up=d.air;}
      x=sx[i]+rx[i]*lat;z=sz[i]+rz[i]*lat;y=groundAt(x,z,i)+up;yaw=Math.atan2(fx[i],fz[i]);
      const o=(Math.sign(lat)||1)*(HW+2.4);mx=sx[i]+rx[i]*o;mz=sz[i]+rz[i]*o;
    }else{
      const R=ALTS.find(r=>r.id===d.route);if(!R)continue;
      const j=Math.round(d.f*(R.n-1)),l=d.lat==='edge'?R.hw+.6:d.lat;
      rib=R.idx;yaw=Math.atan2(R.FX[j],R.FZ[j]);
      x=R.X[j]+R.RX[j]*l;z=R.Z[j]+R.RZ[j]*l;y=R.Y[j]+1.4;
      const o=(d.lat==='edge'?1:Math.sign(d.lat)||1)*(R.hw+(d.bale?3.8:2.2));
      mx=R.X[j]+R.RX[j]*o;mz=R.Z[j]+R.RZ[j]*o;
      if(d.bale){                            /* a hay bale at the lane edge, token on top */
        const bo=R.hw+2.0,bx=R.X[j]+R.RX[j]*bo,bz=R.Z[j]+R.RZ[j]*bo,by=meshY(bx,bz);
        const bg=flat(new THREE.CylinderGeometry(1.1,1.1,1.7,8));bg.rotateX(Math.PI/2);
        const bale=new THREE.Mesh(bg,psMat({color:0xd9b25a}));
        bale.position.set(bx,by+1.05,bz);bale.rotation.y=yaw;world.add(bale);
        y=Math.max(by+2.5,R.Y[j]+1.6);
      }
    }
    const g=new THREE.Group();
    const disc=new THREE.Mesh(flat(new THREE.CylinderGeometry(.95,.95,.18,12)),psMat({map:stampTex}));
    disc.rotation.x=Math.PI/2;g.add(disc);
    g.add(new THREE.Mesh(flat(new THREE.TorusGeometry(1.02,.13,4,12)),psMat({color:0xffffff,unlit:true})));
    g.position.set(x,y,z);world.add(g);
    /* the small roadside marker: a post with the picnic board */
    const my=meshY(mx,mz);
    const post=new THREE.Mesh(flat(new THREE.CylinderGeometry(.1,.12,1.8,5)),psMat({color:0x6b5540}));
    post.position.set(mx,my+.9,mz);world.add(post);
    const pl=new THREE.Mesh(new THREE.PlaneGeometry(1.8,.9),
      psMat({map:farmSign('',true),unlit:true,side:THREE.DoubleSide}));
    pl.position.set(mx,my+1.9,mz);pl.rotation.y=yaw+Math.PI;world.add(pl);
    const o={def:d,x,y,z,rib,mesh:g,owned:!!SAVE.stamps[d.id]};
    if(o.owned)ghostStamp(o);
    stampObjs.push(o);
  }
}
function updateStamps(dt){
  for(const o of stampObjs){o.mesh.rotation.y+=dt*1.7;o.mesh.position.y=o.y+Math.sin(clock*2.2+o.x)*.15;}
}
/** player only, and only from a valid run: the right road, and every gate before it */
function checkStamps(){
  if(state!=='race'||TT)return;
  const k=player;
  for(const o of stampObjs){
    if(o.owned||k.rib!==o.rib)continue;
    const dx=k.x-o.x,dz=k.z-o.z;
    if(dx*dx+dz*dz>4.84||Math.abs(k.y-o.y)>3.4)continue;
    const sec=Math.floor((((Math.floor(k.mi)%N)+N)%N)*CPN/N)%CPN;
    if(sec!==k.cp)continue;
    o.owned=true;SAVE.stamps[o.def.id]=Date.now();writeSave();   /* kept the moment it's touched */
    ghostStamp(o);
    for(let p=0;p<14;p++)puff(o.x+rand(-.8,.8),o.y+rand(-.4,.8),o.z+rand(-.8,.8),.95,.3,.25,.6);
    klonk();
    const n=stampCount();
    toast('PICKNICK! '+o.def.dish.toUpperCase()+' '+n+'/'+allStamps().length);
    if(n===6)setTimeout(()=>toast('MUU-TUTAN UPPLÅST! TRYCK H'),1600);
  }
}
/** AI leans toward milk and steps around pies */
/* ───────── hazards: track objects on timers ─────────
   Each one runs off raceTime with its own period and phase, so a restart resets it.
   hit(k,u) says whether a kart is touching it; a shield takes the hit instead. */
let HAZARDS=[];
/** the äggakaka shield (or one flying pan), then Anders' bucket (once a lap), takes a hit; true if one did */
function blockHit(k){
  if(k===player&&DBG.god)return true;     /* debug: nothing lands */
  if(k.bike>0){if(k===player)toast('CYKELN SMET FÖRBI!');return true;}   /* Björn on his bike: nothing to hit */
  if(k.shield>0&&k.pans>1){k.pans--;if(k===player){toast('STEKPANNAN TOG DEN! '+k.pans+' KVAR');ping(1200,500,.12);}return true;}
  if(k.shield>0){k.shield=0;k.pans=0;if(k===player){toast('BLOCKERAT!');ping(700,300,.12);}return true;}
  if(k.bucket&&k.bucketLap!==k.lap){
    k.bucketLap=k.lap;k.bucketAt=clock;
    for(let p=0;p<10;p++)puff(k.x+Math.sin(k.yaw)*3+rand(-.8,.8),k.y+rand(.3,1),k.z+Math.cos(k.yaw)*3+rand(-.8,.8),.6,.45,.3,.5);
    if(k===player){toast('SKOPAN TOG DEN!');ping(420,200,.16);}
    return true;
  }
  return false;
}
function sayLine(w){const c=CHARS[charSel];return c.say&&c.say[w];}
/** the player's driver says their line for the moment, at most once per cd seconds */
const barkAt={};
function bark(w,cd){
  const ln=sayLine(w);if(!ln||clock-(w in barkAt?barkAt[w]:-1e9)<(cd||0))return false;
  barkAt[w]=clock;toast(ln);return true;
}
/** what the player shouts when hit: Victor and Carl have a special line for Teo */
function hitLine(src,fallback){
  return (src&&src.cfg&&src.cfg.kind==='teo'&&sayLine('hitTeo'))||sayLine('hit')||fallback;
}
/** lines that come from the race itself: passing the rival (Teo, or Victor for Carl),
    standing still too long */
function raceLines(dt){
  const c=CHARS[charSel];if(!c.say||state!=='race'||raceTime<3)return;
  if(c.say.pass){
    const t=karts.find(k=>k!==player&&!k.parked&&k.cfg.kind===(c.rival||'teo'));
    if(t){const ahead=player.progress>t.progress;
      if(ahead&&player.teoGap<0)bark('pass',20);
      player.teoGap=ahead?1:-1;}
  }
  if(c.say.idle&&!player.idleDone){                  /* rare: only after a long wait, and only sometimes */
    player.idleT=input.throttle===0&&player.speed<1?player.idleT+dt:0;
    if(player.idleT>8){player.idleDone=true;if(Math.random()<.5)bark('idle');}
  }
}
function hazU(H){return ((((raceTime+H.phase)%H.period)+H.period)%H.period)/H.period;}
function updateHazards(dt){
  for(const H of HAZARDS){
    const u=hazU(H);
    H.update(u,dt);
    if(state!=='race'||!H.hit)continue;
    for(const k of karts){
      if(k.parked||k.ghost>0||raceTime-k.hazAt<1.5)continue;
      if(!H.hit(k,u))continue;
      k.hazAt=raceTime;
      if(!H.unblockable&&blockHit(k))continue;
      H.effect(k);
    }
  }
}
/** a point on a lane (f = 0..1 along it) or on the main loop (sample i) */
function lanePt(R,f,lat){
  const j=clamp(Math.round(f*(R.n-1)),0,R.n-1);
  return {j,x:R.X[j]+R.RX[j]*lat,z:R.Z[j]+R.RZ[j]*lat,y:R.Y[j],yaw:Math.atan2(R.FX[j],R.FZ[j]),rx:R.RX[j],rz:R.RZ[j]};
}
function mainPt(i,lat){
  i=((Math.round(i)%N)+N)%N;
  return {j:i,x:sx[i]+rx[i]*lat,z:sz[i]+rz[i]*lat,y:sy[i]+clamp(lat,-BANKLAT,BANKLAT)*bank[i],
          yaw:Math.atan2(fx[i],fz[i]),rx:rx[i],rz:rz[i]};
}
const near3=(k,x,y,z,r)=>{const dx=k.x-x,dz=k.z-z;return dx*dx+dz*dz<r*r&&Math.abs(k.y-y)<2.6;};
/** a black-and-white cow, built nose along +z */
function makeCow(){
  const g=new THREE.Group(),w=psMat({color:0xf2efe6}),b=psMat({color:0x22201e}),pk=psMat({color:0xe0a0a0});
  const box=(sx_,sy_,sz_,m,x,y,z)=>{const e=new THREE.Mesh(flat(new THREE.BoxGeometry(sx_,sy_,sz_)),m);e.position.set(x,y,z);g.add(e);return e;};
  box(1.3,1.1,2.4,w,0,1.5,0);box(1.32,.7,.8,b,0,1.7,.3);box(1.32,.5,.6,b,0,1.4,-.7);
  box(.7,.7,.8,w,0,1.9,1.5);box(.5,.35,.3,pk,0,1.7,1.95);box(.9,.12,.15,b,0,2.3,1.45);
  const legs=[];
  for(const [x,z] of [[-.45,.85],[.45,.85],[-.45,-.85],[.45,-.85]]){
    const piv=new THREE.Group();piv.position.set(x,1.0,z);g.add(piv);
    const l=new THREE.Mesh(flat(new THREE.BoxGeometry(.28,1.0,.28)),w);l.position.y=-.5;piv.add(l);legs.push(piv);
  }
  g.userData.legs=legs;return g;
}
function hazardsFor(st){
  HAZARDS=[];
  const R=id=>ALTS.find(r=>r.id===id);
  if(st.id==='veberod'){
    const raps=R('raps'),grus=R('grus');
    if(raps){                                   /* a hay bale rolls across the rapeseed track */
      const bg=flat(new THREE.CylinderGeometry(1.2,1.2,1.8,10));bg.rotateX(Math.PI/2);
      const m=new THREE.Mesh(bg,psMat({color:0xd9b25a}));world.add(m);
      const W=raps.hw+4;
      const H={id:'bale',period:6.5,phase:1.3,mesh:m,
        update(u){const l=u<0.5?-W*Math.cos(Math.PI*smooth(0,0.35,u)):W*Math.cos(Math.PI*smooth(0.5,0.85,u));
          const q=lanePt(raps,0.45,l);this.p=q;
          m.position.set(q.x,Math.max(q.y,meshY(q.x,q.z))+1.2,q.z);
          m.rotation.set(0,q.yaw,-l/1.2);},             /* rolls about the lane's own axis */
        hit(k){return k.rib===raps.idx&&this.p&&near3(k,this.p.x,this.p.y,this.p.z,2.4);},
        effect(k){k.spun=Math.max(k.spun,0.9*k.spinResist);k.boost=0;k.drift=0;k.charge=0;
          if(k===player){toast('HALMBALEN!');ping(260,90,.2);shake=Math.min(1,shake+.5);}}};
      HAZARDS.push(H);
    }
    if(grus){                                   /* a cow wanders across Grusvägen and stops for no one */
      const cow=makeCow();world.add(cow);
      const W=grus.hw+5;
      HAZARDS.push({id:'cow',period:14,phase:4,mesh:cow,
        update(u){const go=u<0.5,v=go?smooth(0,0.3,u):smooth(0.5,0.8,u),l=go?-W+2*W*v:W-2*W*v;
          const q=lanePt(grus,0.28,l);this.p=q;
          cow.position.set(q.x,Math.max(q.y,meshY(q.x,q.z))-.1,q.z);
          cow.rotation.y=q.yaw+(go?-Math.PI/2:Math.PI/2);
          const walk=(v>0&&v<1);cow.userData.legs.forEach((L,n)=>L.rotation.x=walk?Math.sin(clock*7+n*1.6)*.45:0);},
        hit(k){return k.rib===grus.idx&&this.p&&near3(k,this.p.x,this.p.y,this.p.z,2.3);},
        effect(k){k.slow=Math.max(k.slow,1.2);k.vx*=0.5;k.vz*=0.5;k.boost=0;
          if(k===player){toast('KOSSA PÅ VÄGEN!');shake=Math.min(1,shake+.4);}
          if(Math.hypot(k.x-player.x,k.z-player.z)<40)moo();}});
    }
  }
  if(st.id==='bron'){                           /* gulls circle the deck and dive */
    const wM=psMat({color:0xf4f6f8}),gM=psMat({color:0x9aa4ae});
    [0.15,0.4,0.62,0.87].forEach((f,n)=>{
      const g=new THREE.Group();
      const body=new THREE.Mesh(flat(new THREE.BoxGeometry(.5,.4,1.2)),wM);g.add(body);
      const wl=new THREE.Mesh(flat(new THREE.BoxGeometry(1.6,.08,.6)),gM);wl.position.x=-.9;g.add(wl);
      const wr=wl.clone();wr.position.x=.9;g.add(wr);
      world.add(g);
      const i0=Math.round(N*f),lat=(hash2(n*3.1,7.7)*2-1)*HW*0.5;
      HAZARDS.push({id:'gull'+n,period:7+n*1.3,phase:n*2.1,mesh:g,
        update(u){
          const a=u*6.283*2,base=mainPt(i0,lat);
          let h=14,ox=Math.cos(a)*9,oz=Math.sin(a)*9;
          if(u>0.72){const d=u<0.86?smooth(0.72,0.86,u):1-smooth(0.9,1,u);h=lerp(14,1.1,d);ox*=1-d;oz*=1-d;}
          g.position.set(base.x+ox,base.y+h,base.z+oz);this.p={x:g.position.x,y:base.y,z:g.position.z};this.h=h;
          g.rotation.y=-a;const fl=Math.sin(clock*12+n)*.5;wl.rotation.z=fl;wr.rotation.z=-fl;},
        hit(k){return this.h<2.5&&near3(k,this.p.x,this.p.y,this.p.z,2.6);},
        effect(k){k.slow=Math.max(k.slow,0.9);
          if(k===player){toast('MÅSATTACK!');ping(1400,900,.12);}}});
    });
  }
  if(st.hazards)st.hazards(HAZARDS);            /* the new stages bring their own */
}
