"use strict";
/* ───────── genvägar: lanes, signs and furniture ───────── */
/** a secret passage the player has driven stays on the stage picker's route outline */
function foundRoute(R){const key=stage.id+'.'+R.id;if(!SAVE.routes[key]){SAVE.routes[key]=true;writeSave();}}
function altRibbon(R,inner,outer,up,vScale,j0,j1){
  const pos=[],uv=[],idx=[];
  for(let j=j0;j<=j1;j++){
    pos.push(R.X[j]+R.RX[j]*inner,R.Y[j]+up,R.Z[j]+R.RZ[j]*inner);
    pos.push(R.X[j]+R.RX[j]*outer,R.Y[j]+up,R.Z[j]+R.RZ[j]*outer);
    uv.push(0,j*SEG/vScale,1,j*SEG/vScale);
  }
  for(let q=0;q<j1-j0;q++){const p=2*q;idx.push(p,p+1,p+2,p+1,p+3,p+2);}
  const g=new THREE.BufferGeometry();
  g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));
  g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));
  g.setIndex(idx);g.computeVertexNormals();
  return g;
}
const mudTex=pixTex(32,32,(g)=>{
  g.fillStyle='#4a3a2a';g.fillRect(0,0,32,32);
  for(let i=0;i<260;i++){g.fillStyle=Math.random()>.5?'#5d4a35':'#33281d';
    g.fillRect((Math.random()*32)|0,(Math.random()*32)|0,2,1);}
  g.fillStyle='#6d7f8a';for(let i=0;i<5;i++)g.fillRect((Math.random()*28)|0,(Math.random()*28)|0,4,2);
});
mudTex.wrapS=mudTex.wrapT=THREE.RepeatWrapping;
/** hand-painted farm sign: GENVÄG? and, where a stamp hides, a picnic check */
function farmSign(text,picnic){
  return pixTex(64,32,(g)=>{
    g.fillStyle='#7a5a3a';g.fillRect(0,0,64,32);
    g.fillStyle='#8d6a46';for(let y=2;y<32;y+=8)g.fillRect(0,y,64,3);
    g.fillStyle='#f4ecd8';g.font='9px "Press Start 2P",monospace';
    g.textAlign='left';g.textBaseline='middle';g.fillText(text,4,picnic?11:16);
    if(picnic){
      for(let i=0;i<4;i++)for(let j=0;j<2;j++){g.fillStyle=(i+j)%2?'#f4ecd8':'#c8281c';g.fillRect(4+i*5,19+j*5,5,5);}
      g.fillStyle='#f4ecd8';g.font='7px "Press Start 2P",monospace';g.fillText('PICKNICK',27,24);
    }
  });
}
/* ───────── boulders in the mouths of secret passages ─────────
   A rocket that reaches one blows it aside and the passage stays open until whoever
   fired it crosses the line again. Karts on the main road bounce off a boulder. */
let BLOCKERS=[];
function addBlocker(R){
  const j=R.mouth||COMMIT+3,x=R.X[j],z=R.Z[j],mi=R.MI[j];   /* a track may set the door deeper in */
  let g;
  if(R.blockMesh)g=R.blockMesh(R,j);                /* a track's own: barrels, a door, a gate */
  else{
    g=new THREE.Group();
    const rock=new THREE.Mesh(flat(new THREE.DodecahedronGeometry(2.6,0)),psMat({color:0x8a8780}));
    rock.scale.set(1.1,1.25,1);rock.position.y=2.2;g.add(rock);
    const moss=new THREE.Mesh(flat(new THREE.DodecahedronGeometry(1.4,0)),psMat({color:0x6e7a52}));
    moss.position.set(.8,3.8,.3);g.add(moss);
  }
  const y=meshY(x,z);g.position.set(x,y,z);world.add(g);
  const top=new THREE.Box3().setFromObject(g).max.y;
  BLOCKERS.push({R,x,z,y,mi,top,lat:(x-sx[mi])*rx[mi]+(z-sz[mi])*rz[mi],mesh:g,drop:0});
}
function shutPassages(k){
  for(const R of ALTS)if(R.open&&(!k||R.opener===k)){R.open=false;R.opener=null;}
}
function openPassage(B,k){
  if(B.R.open)return;
  B.R.open=true;B.R.opener=k;
  for(let p=0;p<22;p++)puff(B.x+rand(-2.5,2.5),B.y+rand(.5,4),B.z+rand(-2.5,2.5),.75,.72,.66,.9);
  if(k===player){toast('HEMLIG PASSAGE ÖPPEN!');ping(300,900,.25);}
}
function updateBlockers(dt){
  for(const B of BLOCKERS){
    const want=B.R.open?1:0;B.drop=lerp(B.drop,want,Math.min(1,dt*3));
    if(B.R.blockAnim){B.R.blockAnim(B,B.drop);continue;}
    B.mesh.position.y=B.y-B.drop*5.2;B.mesh.rotation.z=B.drop*0.9;
  }
  aimAtMouth();
}
/* While you hold something that can open it, a target spins over the next closed mouth,
   so a secret passage stays secret until you have the means to blow it open. */
const aimMark=(function(){
  const g=new THREE.Group(),m=psMat({color:0xffd23a,unlit:true,side:THREE.DoubleSide});
  g.add(new THREE.Mesh(new THREE.RingGeometry(1.0,1.45,16),m));
  const tip=new THREE.Mesh(new THREE.ConeGeometry(.7,1.3,4),m);tip.rotation.x=Math.PI;tip.position.y=-2.0;g.add(tip);
  g.visible=false;scene.add(g);return g;
})();
function aimAtMouth(){
  const armed=state==='race'&&(player.held==='rocket'||player.held==='sig'&&!!SIGS[player.heldSig].opens)&&!(player.roll>0)&&!player.rib;
  const [B]=armed?mouthAhead(player.mi,120):[null];
  aimMark.visible=!!B;
  if(!B)return;
  aimMark.position.set(B.x,B.top+2.6+Math.sin(clock*5)*.35,B.z);
  aimMark.rotation.y=clock*2.5;
}
/* Signature items open passages too (Teo, 2026-10-22: most of them should). How each one does it:
   'ahead' opens the next closed mouth up the road within OPEN.reach a moment after it is used, as
   the rope, the cows, the mates, the container or the wave get there; 'near' opens any closed
   mouth within OPEN.r of the kart; 'shot' flies into the mouth like a Spettekaka (its own update
   steers it); 'own' opens it at its own moment (Raket-Rune's sonic boom). Items not listed
   (the bike, the map, the muck, the yarn and the crop circles behind, the lock gate, the dive, the gull, the yellow
   card, the order number) leave passages alone. A switch-only passage ignores them all. */
const SIG_OPENS={arne:'ahead',billy:'ahead',cow:'ahead',mehmet:'ahead',teo:'ahead',carl:'ahead',
  regnmolnet:'ahead',hamnkranen:'ahead',viking:'ahead',bodil:'ahead',
  victor:'near',spoket:'near',lask:'near',rulle:'near',torn:'near',
  rune:'own',weiron:'shot',mos:'shot',korv:'shot'};
const OPEN={reach:90,speed:60,r:22};        /* samples up the road; m/s the 'ahead' effect travels; metres round the kart */
const breaches=[];
/** the closed mouths within r metres of k */
function mouthsNear(k,r){
  if(k.rib)return [];
  return BLOCKERS.filter(B=>!B.R.open&&!B.R.noRocket&&Math.hypot(k.x-B.x,k.z-B.z)<r);
}
/** what a signature item does to passages when k uses it (called from USE.sig) */
function sigBreach(k,id){
  const how=SIGS[id]&&SIGS[id].opens;
  if(!how||k.rib)return;
  if(how==='near')for(const B of mouthsNear(k,OPEN.r))openPassage(B,k);
  else if(how==='ahead'){
    const [B,d]=mouthAhead(k.mi,OPEN.reach);
    if(B&&!breaches.some(b=>b.B===B))breaches.push({B,k,t:Math.max(.25,d*SEG/OPEN.speed)});
  }
}
function updateBreaches(dt){
  for(let n=breaches.length-1;n>=0;n--){
    const b=breaches[n];b.t-=dt;
    if(b.t>0)continue;
    if(!b.k.parked)openPassage(b.B,b.k);
    breaches.splice(n,1);
  }
}
/** would the AI's held signature item open a passage from here? */
function sigOpensHere(k){
  const how=k.held==='sig'&&SIGS[k.heldSig]&&SIGS[k.heldSig].opens;
  if(!how||k.rib)return false;
  if(how==='near')return mouthsNear(k,OPEN.r*.8).length>0;
  return !!mouthAhead(k.mi,how==='shot'?40:OPEN.reach*.6,how==='shot'?k:null)[0];
}
/** karts on the main road bump off a closed boulder */
function bumpBlockers(k){
  if(k.rib)return;
  for(const B of BLOCKERS){
    if(B.R.open)continue;
    const dx=k.x-B.x,dz=k.z-B.z,d=Math.hypot(dx,dz);
    if(d>3.1||d<1e-3)continue;
    k.x=B.x+dx/d*3.1;k.z=B.z+dz/d*3.1;
    const vn=(k.vx*dx+k.vz*dz)/d;
    if(vn<0){k.vx-=dx/d*vn*1.4;k.vz-=dz/d*vn*1.4;}
    k.vx*=0.7;k.vz*=0.7;
    if(k===player&&Math.abs(vn)>8)shake=Math.min(1,shake+.5);
  }
}
for(const id in SIG_OPENS)if(SIGS[id])SIGS[id].opens=SIG_OPENS[id];
function buildAltWorld(){
  BLOCKERS=[];breaches.length=0;
  if(!ALTS.length)return;
  const wood=psMat({color:0x6b5540}),rail=psMat({color:0x8a7259});
  const m4=new THREE.Matrix4(),q=new THREE.Quaternion(),e=new THREE.Euler(),
        p=new THREE.Vector3(),sc=new THREE.Vector3(1,1,1);
  const at=(R,j,l,up)=>{const x=R.X[j]+R.RX[j]*l,z=R.Z[j]+R.RZ[j]*l;return new THREE.Vector3(x,meshY(x,z)+(up||0),z);};
  const mainGap=(x,z,pad)=>{const i=nearestGlobal(x,z);return Math.abs((x-sx[i])*rx[i]+(z-sz[i])*rz[i])>HW+pad;};
  for(const R of ALTS){
    /* the lane itself, laid over the main road's edge where they share it */
    const lm=psMat({map:R.tex?roadTex(R.tex):vergeTex(R.surface==='dirt'?'dirt':(R.surface==='sand'?'sand':'gravel'))});
    lm.polygonOffset=true;lm.polygonOffsetFactor=-2;lm.polygonOffsetUnits=-2;
    world.add(new THREE.Mesh(altRibbon(R,-R.hw,R.hw,.03,6,0,R.n-1),lm));
    let j=0;
    while(j<R.n){                                         /* mud patches */
      if(R.S[j]!=='mud'){j++;continue;}
      let e2=j;while(e2+1<R.n&&R.S[e2+1]==='mud')e2++;
      const mm=psMat({map:mudTex});mm.polygonOffset=true;mm.polygonOffsetFactor=-3;mm.polygonOffsetUnits=-3;
      world.add(new THREE.Mesh(altRibbon(R,-R.hw-.4,R.hw+.4,.05,5,j,e2),mm));
      j=e2+1;
    }
    if(R.shoot)addBlocker(R);
    if(R.hidden)continue;                                 /* a secret passage has no sign */
    /* GENVÄG? boards: one well before the fork, one at the mouth */
    const hasStamp=(stage.stamps||[]).some(s=>s.route===R.id);
    const sm=psMat({map:farmSign('GENVÄG?',hasStamp),unlit:true,side:THREE.DoubleSide});
    for(const back of [70,8]){
      const i=((R.a-back)%N+N)%N,o=R.side*(HW+3.2);
      const x=sx[i]+rx[i]*o,z=sz[i]+rz[i]*o,y=meshY(x,z);
      const post=new THREE.Mesh(flat(new THREE.CylinderGeometry(.12,.14,2.6,5)),wood);
      post.position.set(x,y+1.3,z);world.add(post);
      const pl=new THREE.Mesh(new THREE.PlaneGeometry(3.2,1.6),sm);
      pl.position.set(x,y+2.7,z);pl.rotation.y=Math.atan2(fx[i],fz[i])+Math.PI;world.add(pl);
    }
    if(R.id==='grus'){
      /* gate posts at the mouth, then a post-and-rail fence down both sides */
      const gp=new THREE.Mesh(flat(new THREE.BoxGeometry(.5,2.4,.5)),psMat({color:0xeceee8}));
      for(const sg of [-1,1]){const g2=gp.clone();g2.position.copy(at(R,COMMIT+2,sg*(R.hw+1.3),1.2));world.add(g2);}
      const posts=new THREE.InstancedMesh(flat(new THREE.BoxGeometry(.2,1.4,.2)),wood,R.n);
      const rails=new THREE.InstancedMesh(flat(new THREE.BoxGeometry(.1,.18,SEG*3+.3)),rail,R.n*2);
      let a=0,b=0;
      for(let j=COMMIT+4;j<R.n-MERGE-2;j+=3)for(const sg of [-1,1]){
        const v=at(R,j,sg*(R.hw+1.5),.7);if(!mainGap(v.x,v.z,4.5))continue;
        e.set(0,Math.atan2(R.FX[j],R.FZ[j]),0);q.setFromEuler(e);
        m4.compose(v,q,sc);posts.setMatrixAt(a++,m4);
        const jj=Math.min(j+1,R.n-1),w=at(R,jj,sg*(R.hw+1.5),.95);
        e.set(0,Math.atan2(R.FX[jj],R.FZ[jj]),0);q.setFromEuler(e);
        m4.compose(w,q,sc);rails.setMatrixAt(b++,m4);
      }
      posts.count=a;rails.count=b;world.add(posts);world.add(rails);
      /* the farmyard: a house, a coop and the hens */
      const mid=Math.round(R.n*.5);
      for(const sg of [1,-1]){
        const v=at(R,mid,sg*(R.hw+9));
        if(!mainGap(v.x,v.z,14))continue;
        const h=house(8,6,3.4,0xc8b48a,0x8b2b1c,2.4);h.position.copy(v);
        h.rotation.y=Math.atan2(R.FX[mid],R.FZ[mid]);world.add(h);break;
      }
      const hen=flat(new THREE.BoxGeometry(.5,.45,.7)),comb=flat(new THREE.BoxGeometry(.1,.16,.2));
      const henM=psMat({color:0xf2efe6}),combM=psMat({color:0xc8281c});
      for(let n=0;n<12;n++){
        const jj=Math.round(R.n*(.3+.45*hash2(n,3.1))),sg=n%2?1:-1;
        const v=at(R,jj,sg*(R.hw+.6+hash2(n,7.7)*2.2),.25);
        const g=new THREE.Group();g.position.copy(v);g.rotation.y=hash2(n,1.3)*6.28;
        const b2=new THREE.Mesh(hen,henM);g.add(b2);
        const c2=new THREE.Mesh(comb,combM);c2.position.set(0,.3,.28);g.add(c2);
        world.add(g);
      }
      const coop=new THREE.Mesh(flat(new THREE.BoxGeometry(3,2,2.2)),psMat({color:0x8b2b1c}));
      coop.position.copy(at(R,Math.round(R.n*.62),-(R.hw+4.5),1));world.add(coop);
    }
    if(R.id==='raps'){
      /* rapeseed above head height down both sides, right up to the blind exit */
      const stalk=flat(new THREE.BoxGeometry(1.3,3.0,1.3));
      const yA=new THREE.InstancedMesh(stalk,psMat({color:0xe4c624}),R.n*10);
      const yB=new THREE.InstancedMesh(stalk,psMat({color:0xc9b21d}),R.n*10);
      let a=0,b=0;
      for(let j=COMMIT+2;j<R.n-5;j++)for(const sg of [-1,1])for(let r=0;r<3;r++){
        const l=sg*(R.hw+1.7+r*1.3+hash2(j,r+sg)*.6);
        const v=at(R,j,l,1.2+hash2(j*.7,r)*.5);
        if(!mainGap(v.x,v.z,3.2))continue;
        if(sg===1&&(stage.stamps||[]).some(d=>d.bale&&d.route===R.id&&Math.abs(j-Math.round(d.f*(R.n-1)))<=2))continue;
        e.set(0,hash2(j,r)*3,0);q.setFromEuler(e);sc.set(1,.85+hash2(r,j)*.35,1);
        m4.compose(v,q,sc);
        if((j+r)%2){if(a<yA.count)yA.setMatrixAt(a++,m4);}else if(b<yB.count)yB.setMatrixAt(b++,m4);
      }
      sc.set(1,1,1);
      yA.count=a;yB.count=b;world.add(yA);world.add(yB);
    }
  }
}
