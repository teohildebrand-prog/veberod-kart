"use strict";
/* ───────── spettekaka-raketer ───────── */
const rockets=[];
function useItem(k){
  if(!k.held||k.spun>0)return;
  if(k.rib&&(k.held==='pie'||k.held==='rocket')){            /* no room in a farm lane */
    if(k===player)toast('FÖR TRÅNGT HÄR!');
    return;
  }
  const pick=k.held;k.held=null;
  if(pick==='boost'){
    k.boost=Math.max(k.boost,1.3*k.milk);k.slow=0;
    for(let p=0;p<12;p++)puff(k.x+rand(-.8,.8),k.y+rand(.3,1.5),k.z+rand(-.8,.8),1,1,1,.55);
    if(k===player){toast(k.milk>1?'EGEN MJÖLK! MUUU':'MJÖLK! FULL FART');ping(560,980,.10);if(k.milk>1)moo();}
    return;
  }
  if(pick==='shield'){
    k.shield=Math.max(k.shield,9);
    for(let p=0;p<12;p++)puff(k.x+rand(-.9,.9),k.y+rand(.3,1.4),k.z+rand(-.9,.9),.95,.82,.4,.5);
    if(k===player){toast('ÄGGKAKA! SKÖLD');ping(380,720,.14);}
    return;
  }
  if(pick==='pie'){                                    /* drop it behind you */
    const d=addItem('pie',((k.si-8)%N+N)%N,clamp(k.lat,-HW*.8,HW*.8));
    if(d)d.temp=15;
    if(k===player){toast('PAJ SLÄPPT!');ping(330,150,.12);}
    return;
  }
  const mesh=makeSpettekaka();
  mesh.scale.setScalar(.85);mesh.rotation.x=-Math.PI/2;   /* nose forward */
  const holder=new THREE.Group();holder.add(mesh);scene.add(holder);
  rockets.push({si:(k.si+2)%N,lat:k.lat,owner:k,t:0,
                speed:Math.max(k.speed,26)+24,holder});
  if(k===player){toast('AVFYRAD!');ping(820,180,.16);}
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
    if(best)r.lat+=clamp(best.lat-r.lat,-9*dt,9*dt);
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
      if(k.shield>0){
        k.shield=0;
        if(k===player){toast('BLOCKERAT!');ping(700,300,.12);}
      }else{
        k.spun=1.5*k.spinResist;k.boost=0;k.drift=0;k.charge=0;
        for(let p=0;p<18;p++)
          puff(k.x+rand(-1.3,1.3),k.y+rand(.2,1.4),k.z+rand(-1.3,1.3),1,.72,.34,.7);
        if(k===player){toast('TRÄFFAD!');ping(300,60,.3);shake=Math.min(1,shake+.8);}
        else if(r.owner===player){toast('TRÄFF!');ping(880,420,.12);}
      }
      done=true;break;
    }
    if(done){scene.remove(r.holder);rockets.splice(n,1);}
  }
}
