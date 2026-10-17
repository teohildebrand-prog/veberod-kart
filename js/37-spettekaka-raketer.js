"use strict";
/* ───────── spettekaka-raketer ───────── */
const rockets=[];
/** a hit knocks the sugar cubes out of your hands */
function dropSugar(k){
  if(!k.sugar)return;
  for(let p=0;p<k.sugar*5;p++)puff(k.x+rand(-1.2,1.2),k.y+rand(.4,1.6),k.z+rand(-1.2,1.2),1,1,1,.45);
  k.sugar=0;
  if(k===player)setTimeout(()=>toast('SOCKERBITARNA TAPPADE'),700);
}
/* every sugar cube held makes the item stronger, and using it spends them all */
function useItem(k){
  if(!k.held||k.spun>0)return;
  if(k.rib&&(k.held==='pie'||k.held==='rocket')){            /* no room in a farm lane */
    if(k===player)toast('FÖR TRÅNGT HÄR!');
    return;
  }
  const pick=k.held,lvl=k.sugar;k.held=null;k.sugar=0;
  if(pick==='boost'){
    k.boost=Math.max(k.boost,(lvl>=3?3.4:1.3*(1+0.45*lvl))*k.milk);k.slow=0;
    for(let p=0;p<12+lvl*6;p++)puff(k.x+rand(-.8,.8),k.y+rand(.3,1.5),k.z+rand(-.8,.8),1,1,1,.55);
    if(k===player){
      toast(lvl>=3?'MJÖLKKANNE-TURBO!':lvl?'MJÖLK +'+lvl+'!':(k.milk>1?'EGEN MJÖLK! MUUU':'MJÖLK! FULL FART'));
      ping(560,lvl>=3?1400:980,.10+lvl*.04);if(k.milk>1)moo();}
    return;
  }
  if(pick==='shield'){
    k.shield=Math.max(k.shield,9*(1+0.4*lvl)*k.shieldMul);
    for(let p=0;p<12;p++)puff(k.x+rand(-.9,.9),k.y+rand(.3,1.4),k.z+rand(-.9,.9),.95,.82,.4,.5);
    if(k===player){toast(lvl?'ÄGGKAKA +'+lvl+'! LÅNG SKÖLD':'ÄGGKAKA! SKÖLD');ping(380,720,.14);}
    return;
  }
  if(pick==='pie'){
    if(lvl>=3){                                        /* pie rain on the two leaders */
      const lead=karts.filter(o=>o!==k&&!o.parked&&!o.done).sort((a,b)=>b.progress-a.progress).slice(0,2);
      for(const o of lead)for(let q=0;q<3;q++){
        const d=addItem('pie',(Math.round(o.mi)+16+q*7)%N,clamp(o.lat+rand(-3,3),-HW*.8,HW*.8));
        if(d)d.temp=12;
      }
      if(k===player){toast('PAJREGN!');ping(300,1200,.2);}
      return;
    }
    const n=lvl?3:1;                                   /* drop them behind you */
    for(let q=0;q<n;q++){
      const d=addItem('pie',((k.si-8-q*5)%N+N)%N,clamp(k.lat+(n>1?(q-1)*2.8:0),-HW*.8,HW*.8));
      if(d)d.temp=15;
    }
    if(k===player){toast(n>1?'TRE PAJER!':'PAJ SLÄPPT!');ping(330,150,.12);}
    return;
  }
  const count=lvl>=3?3:(lvl>=2?2:1);
  for(let q=0;q<count;q++){
    const mesh=makeSpettekaka();
    mesh.scale.setScalar(.85);mesh.rotation.x=-Math.PI/2;   /* nose forward */
    const holder=new THREE.Group();holder.add(mesh);scene.add(holder);
    rockets.push({si:(k.si+2+q*2)%N,lat:k.lat+(q-(count-1)/2)*2.6,owner:k,t:0,
                  speed:Math.max(k.speed,26)+24+(lvl?12:0),holder});
  }
  if(k===player){toast(count>1?count+' SPETTEKAKOR!':(lvl?'SNABB SPETTEKAKA!':'AVFYRAD!'));ping(820,180,.16);}
}
function updateRockets(dt){
  for(let n=rockets.length-1;n>=0;n--){
    const r=rockets[n];
    r.t+=dt;
    r.si+=r.speed*dt/SEG;
    while(r.si>=N)r.si-=N;
    const i=Math.floor(r.si)%N;
    /* mild homing onto whoever is next up the road */
    let best=null,bd=1e9;
    for(const k of karts){
      if(k===r.owner||k.rib)continue;
      let d=k.mi-r.si;
      if(d<-N/2)d+=N;else if(d>N/2)d-=N;
      if(d<0||d>60)continue;
      if(d<bd){bd=d;best=k;}
    }
    let bb=null;
    for(const B of BLOCKERS){
      if(B.R.open||B.R.noRocket)continue;          /* a switch-only passage ignores rockets */
      let d=B.mi-r.si;if(d<-N/2)d+=N;else if(d>N/2)d-=N;
      if(d>=0&&d<60&&d<bd){bd=d;bb=B;}
    }
    if(bb){
      r.lat+=clamp(bb.lat-r.lat,-12*dt,12*dt);
      let d=bb.mi-r.si;if(d<-N/2)d+=N;else if(d>N/2)d-=N;
      if(Math.abs(d)<3&&Math.abs(bb.lat-r.lat)<3.6){openPassage(bb,r.owner);scene.remove(r.holder);rockets.splice(n,1);continue;}
    }
    else if(best)r.lat+=clamp(best.lat-r.lat,-9*dt,9*dt);
    const x=sx[i]+rx[i]*r.lat, z=sz[i]+rz[i]*r.lat;
    const y=sy[i]+r.lat*bank[i]+1.0;
    r.holder.position.set(x,y,z);
    r.holder.rotation.y=Math.atan2(fx[i],fz[i]);
    if(Math.random()<.7)puff(x+rand(-.3,.3),y+.2,z+rand(-.3,.3),.9,.62,.3,.34);
    let done=r.t>4.5;
    if(!done)for(const k of karts){
      if(k===r.owner||k.rib)continue;
      let d=k.mi-r.si;
      if(d<-N/2)d+=N;else if(d>N/2)d-=N;
      if(Math.abs(d)>3||Math.abs(k.lat-r.lat)>3.4)continue;
      if(blockHit(k)){
      }else{
        dropSugar(k);
        k.spun=1.5*k.spinResist;k.boost=0;k.drift=0;k.charge=0;
        for(let p=0;p<18;p++)
          puff(k.x+rand(-1.3,1.3),k.y+rand(.2,1.4),k.z+rand(-1.3,1.3),1,.72,.34,.7);
        if(k===player){toast(sayLine('hit')||'TRÄFFAD!');ping(300,60,.3);shake=Math.min(1,shake+.8);}
        else if(r.owner===player){toast('TRÄFF!');ping(880,420,.12);}
      }
      done=true;break;
    }
    if(done){scene.remove(r.holder);rockets.splice(n,1);}
  }
}
