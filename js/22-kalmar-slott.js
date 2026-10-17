"use strict";
/* ───────── Kalmar slott ───────── */
/* Royal Knights Raceway's counterpart: a drawbridge that rises into a launch ramp, a tunnel beside it, jousting knights */
ROADTEX.kalmarSten=()=>pixTex(64,64,g=>{                /* pale Öland limestone setts */
  g.fillStyle='#6f685c';g.fillRect(0,0,64,64);
  for(let r=0;r<10;r++)for(let c=0;c<6;c++){
    const o=(r%2)?5:0,v=150+((Math.random()*40)|0);
    g.fillStyle='rgb('+v+','+(v-8)+','+(v-22)+')';g.fillRect((c*11+o)%64,r*6.4|0,10,5);
  }
  for(let i=0;i<220;i++){g.fillStyle=Math.random()>.5?'rgba(220,212,190,.35)':'rgba(80,72,60,.3)';
    g.fillRect((Math.random()*64)|0,(Math.random()*64)|0,1,1);}
});
VERGEC.kalmarGrus=['#c9b98f','#ddd0a8','#a8987a'];
GROUND.kalmar={cell:42,stripe:0.5,verge:0xbcae86,
  cols:[0x6fa04a,0x7aab52,0x86b35a,0x5e9444,0x9cbf5f,0x6a9a48,0x7fa858,0xb8c070]};
/* where the drawbridge, the castle and the jousting lists sit (main-road samples) */
const KALMAR={hinge:82,leaf:12,bastion:[77,95],gate:93,castleLat:-108,joust:[366,414],wallAt:560};
function kalmarStationSpans(st){
  return (st.stations||[[0.27,1],[0.71,-1]]).map(sp=>{let at=Math.round(N*sp[0]);
    for(const J of JUMPS)if(Math.min(Math.abs(at-J.at),N-Math.abs(at-J.at))<J.up+J.dn+16)at=(at+46)%N;
    return {at,side:sp[1]};});
}
const kalmarD=(a,b)=>((a-b)%N+N)%N;
/** sample ranges where the striped barrier steps aside: the bridge, the pumps, the town gate */
function kalmarGap(i,side,st){
  if(kalmarD(i,KALMAR.bastion[0]-3)<KALMAR.bastion[1]-KALMAR.bastion[0]+6)return true;
  if(kalmarD(i,KALMAR.wallAt-4)<9)return true;
  for(const S of kalmarStationSpans(st))if(S.side===side&&kalmarD(i,S.at-3)<20)return true;
  return false;
}
/* tournament barrier: posts and rails painted in red and gold, pennants on tall poles */
EDGES.kalmarList=st=>{
  const m4=new THREE.Matrix4(),q=new THREE.Quaternion(),e=new THREE.Euler(),p=new THREE.Vector3(),one=new THREE.Vector3(1,1,1);
  const step=3,cnt=Math.ceil(N/step)*2;
  const post=new THREE.InstancedMesh(flat(new THREE.BoxGeometry(.24,1.5,.24)),psMat({color:0x5a4430}),cnt);
  const rail=new THREE.InstancedMesh(flat(new THREE.BoxGeometry(.14,.32,SEG*step+.3)),psMat({color:0xffffff}),cnt*2);
  const pole=new THREE.InstancedMesh(flat(new THREE.CylinderGeometry(.07,.09,6,5)).translate(0,3,0),psMat({color:0xe8e2d0}),Math.ceil(N/18)*2);
  const flag=new THREE.InstancedMesh(new THREE.ConeGeometry(.55,2.2,3).rotateZ(-Math.PI/2).translate(1.1,5.3,0),psMat({color:0xffffff,side:THREE.DoubleSide}),Math.ceil(N/18)*2);
  const red=new THREE.Color(0xc0302a),gold=new THREE.Color(0xe8b830),blue=new THREE.Color(0x2f5aa8),white=new THREE.Color(0xf2efe6);
  let a=0,b=0,c=0;
  for(let i=0;i<N;i+=step){
    const j=(i+1)%N;
    for(const side of [-1,1]){
      if(kalmarGap(i,side,st))continue;
      const o=side*(HW+4.3),x=sx[i]+rx[i]*o,z=sz[i]+rz[i]*o;
      if(nearAlt(x,z,2.6))continue;
      p.set(x,meshY(x,z)+.75,z);e.set(0,Math.atan2(fx[i],fz[i]),0);q.setFromEuler(e);m4.compose(p,q,one);post.setMatrixAt(a++,m4);
      for(const h of [.55,1.15]){
        const x2=sx[j]+rx[j]*o,z2=sz[j]+rz[j]*o;
        p.set(x2,meshY(x2,z2)+h,z2);e.set(0,Math.atan2(fx[j],fz[j]),0);q.setFromEuler(e);m4.compose(p,q,one);
        rail.setMatrixAt(b,m4);rail.setColorAt(b,((i/step|0)+(h>1?1:0))%2?red:gold);b++;
      }
      if(i%18===0){
        const o2=side*(HW+5.6),x3=sx[i]+rx[i]*o2,z3=sz[i]+rz[i]*o2;
        p.set(x3,meshY(x3,z3),z3);e.set(0,Math.atan2(fx[i],fz[i])+Math.PI,0);q.setFromEuler(e);m4.compose(p,q,one);
        pole.setMatrixAt(c,m4);flag.setMatrixAt(c,m4);flag.setColorAt(c,[red,gold,blue,white][(i/18|0)%4]);c++;
      }
    }
  }
  post.count=a;rail.count=b;pole.count=flag.count=c;
  [post,rail,pole,flag].forEach(m=>{m.instanceMatrix.needsUpdate=true;if(m.instanceColor)m.instanceColor.needsUpdate=true;world.add(m);});
  stage.kalmarFlags=flag;
};
/** the castle island, its moat and the arm of the moat that runs under the drawbridge */
function kalmarGeo(){
  if(stage.kalmarG&&stage.kalmarG.sx0===sx[0]+sz[5])return stage.kalmarG;
  const i=KALMAR.hinge+Math.round(KALMAR.leaf/2/SEG),y0=sy[i];
  const C=[sx[i]+rx[i]*KALMAR.castleLat,sz[i]+rz[i]*KALMAR.castleLat];
  stage.kalmarG={sx0:sx[0]+sz[5],i,y0,C,yaw:Math.atan2(fx[i],fz[i]),bx:sx[i],bz:sz[i],fx:fx[i],fz:fz[i],rx:rx[i],rz:rz[i]};
  return stage.kalmarG;
}
/** 0..1 how much of (x,z) is moat water, and the island */
function kalmarMoat(x,z){
  const G=kalmarGeo(),d=Math.hypot(x-G.C[0],z-G.C[1]);
  let w=smooth(37,41,d)*(1-smooth(55,59,d));
  const dx=x-G.bx,dz=z-G.bz,along=dx*G.fx+dz*G.fz,lat=dx*G.rx+dz*G.rz;    /* the arm, castle side of the road */
  if(lat<-HW-0.2&&lat>KALMAR.castleLat+40)w=Math.max(w,1-smooth(5.5,8,Math.abs(along)));
  return w;
}
STAGES.push({ id:'kalmar', group:'vild', name:'KALMAR SLOTT', sub:'TORNERSPELET', hw:8.6,
  bars:[0.80,0.65,0.70], laps:3,
  blurb:'Round the moated Renaissance castle at Kalmar, its towers capped in green copper, the Baltic and the Öland bridge behind. The drawbridge on the main road rises on a bell and turns into a launch ramp, so the narrow grassy tunnel beside it is the safe line. Down the tournament lists, knights gallop both sides of the road and swing their lances at anyone near the barrier.',
  role:'Vindbrygga som blir hoppramp, tornerspel och en smal tunnel.',
  sky:[0xe4ecef,0x3f86d0], fog:[0xd2dde4,90,430], amb:0x6c7078, dif:0xfff2d8,
  road:'kalmarSten', verge:'kalmarGrus', edge:'kalmarList', ground:'kalmar', paint:false,
  sfxRoad:'cobble',
  jumpSpec:[{h:3.2,drop:2.4,up:12,dn:7,rec:17}],
  ctrl:[[-185,0,-153],[-115,0,-155],[-40,0,-157],[18,1,-150],[45,1,-118],[50,2,-68],[62,3,-20],[105,4,10],
        [160,5,5],[200,6,40],[198,6,95],[160,5,135],[100,4,148],[35,3,142],[-25,2,132],[-80,4,110],
        [-130,6,80],[-185,6,62],[-225,4,15],[-240,2,-50],[-232,1,-112]],
  stations:[[0.70,-1],[0.88,1]],
  routes:[
    {id:'valv',name:'VALVET',a:64,b:189,hw:3.6,side:1,lead:9,leadLat:12,
     mid:[[0.078,-5.8],[0.232,-23.3],[0.43,-16.9],[0.759,-13.1]],surface:'dirt',risk:0.15,
     blurb:'A narrow grassy tunnel through the bridge bastion, beside the drawbridge, then a cut across the castle meadow.'}],
  stamps:[
    {id:'kmr1',dish:'Stekt strömming',ini:'S',kind:'intro',route:'main',i:604,lat:-6.2,
     hint:'Innanför stadsmuren, vid vägkanten.',
     story:'Baltic herring, butterflied, sandwiched with dill and butter, rolled in rye flour and fried crisp, eaten with mashed potatoes and lingonberries. Kalmarsund is herring water, and the fish stalls by the old town have fried it for the castle\'s neighbours for centuries.'},
    {id:'kmr2',dish:'Ostkaka',ini:'O',kind:'route',route:'valv',f:0.62,lat:0,
     hint:'Ute på slottsängen, efter valvet.',
     story:'Småland\'s curd cake, baked from milk curdled with rennet, eggs, cream and a few bitter almonds, served lukewarm with jam and whipped cream. It has been the feast dish of the region for centuries, which makes it fit for a tournament.'},
    {id:'kmr3',dish:'Isterband',ini:'I',kind:'line',route:'main',i:'tight',lat:'inside',
     hint:'Tätt intill innerkanten, där vägen svänger tvärast.',
     story:'A coarse, slightly sour smoked sausage of pork, beef and barley, a speciality of the Småland farms. Fried until it splits and eaten with dill potatoes in white sauce, it is the knights\' lunch of choice in this telling.'}],
  /* the island stands flat, the moat and its arm drop below the road, the land falls to the Baltic in the north */
  mod:(x,z,t)=>{
    const G=kalmarGeo(),k=nearestGlobal(x,z),base=sy[k];
    let d=0;
    const dc=Math.hypot(x-G.C[0],z-G.C[1]);
    if(dc<70){const isl=1-smooth(34,40,dc),fl=1-smooth(56,72,dc);
      d+=(G.y0+1.2-base-rolls(x,z)*t)*Math.max(isl,fl*0.85)*(t>0?1:0);}
    const w=kalmarMoat(x,z);if(w>0)d-=w*4.2;
    const sea=smooth(0,50,G.C[1]-60-z);if(sea>0)d-=sea*(rolls(x,z)*t+base-G.y0+12)*t;
    return d;
  },
  land:(x,z,out)=>{
    const G=kalmarGeo();
    if(kalmarMoat(x,z)>0.4){out.setHex(0x3f6e7a);return;}
    const dc=Math.hypot(x-G.C[0],z-G.C[1]);
    if(dc<36){out.setHex(hash2(Math.floor(x/6),Math.floor(z/6))>.5?0xb9ae94:0xa79d84);return;}
    const sea=G.C[1]-60-z;
    if(sea>4&&sea<34)out.setHex(0xd8cfae);
  },
  hazards:H=>hazardsKalmar(H), scenery:()=>sceneryKalmar()
});

function kalmarInst(geo,mat,list,colors){
  const m=new THREE.InstancedMesh(geo,mat,Math.max(1,list.length));
  const m4=new THREE.Matrix4(),q=new THREE.Quaternion(),e=new THREE.Euler(),p=new THREE.Vector3(),s=new THREE.Vector3();
  list.forEach((v,n)=>{p.set(v[0],v[1],v[2]);e.set(v[7]||0,v[3]||0,v[8]||0,'YXZ');q.setFromEuler(e);
    s.set(v[4]||1,v[5]||v[4]||1,v[6]||v[4]||1);m4.compose(p,q,s);m.setMatrixAt(n,m4);if(colors)m.setColorAt(n,colors[n]);});
  m.count=list.length;m.instanceMatrix.needsUpdate=true;if(m.instanceColor)m.instanceColor.needsUpdate=true;
  world.add(m);return m;
}
/** a round tower with a green copper cap */
function kalmarTower(g,x,z,r,h,roof,mat){
  const t=new THREE.Mesh(flat(new THREE.CylinderGeometry(r,r*1.06,h,12)),mat);t.position.set(x,h/2,z);g.add(t);
  const cu=psMat({color:0x5fa58a});
  const cone=new THREE.Mesh(flat(new THREE.ConeGeometry(r*1.15,roof,12)),cu);cone.position.set(x,h+roof/2,z);g.add(cone);
  const knob=new THREE.Mesh(flat(new THREE.SphereGeometry(r*.22,6,4)),cu);knob.position.set(x,h+roof*.82,z);g.add(knob);
  const sp=new THREE.Mesh(flat(new THREE.ConeGeometry(r*.12,roof*.5,5)),cu);sp.position.set(x,h+roof*1.05,z);g.add(sp);
  const band=new THREE.Mesh(flat(new THREE.CylinderGeometry(r*1.08,r*1.08,.6,12)),psMat({color:0xd9cfb6}));band.position.set(x,h-.3,z);g.add(band);
}
function kalmarFlag(cols){
  return pixTex(24,16,c=>{c.fillStyle=cols[0];c.fillRect(0,0,24,16);c.fillStyle=cols[1];c.fillRect(7,0,3,16);c.fillRect(0,6,24,3);});
}
function sceneryKalmar(){
  const G=kalmarGeo(),anim=[];stage.kalmarAnim=anim;
  const ST=kalmarStationSpans(stage);
  const nearStation=(x,z)=>{const k=nearestGlobal(x,z);
    return ST.some(S=>{const d=((k-S.at+8)%N+N)%N;return d<34&&((x-sx[k])*rx[k]+(z-sz[k])*rz[k])*S.side>0&&latAt(x,z)<HW+30;});};
  const seaZ=G.C[1]-60;
  const free=(x,z,pad)=>latAt(x,z)>HW+pad&&!nearStation(x,z)&&kalmarMoat(x,z)===0&&Math.hypot(x-G.C[0],z-G.C[1])>62&&z>seaZ-6;
  const wall=psMat({color:0xe6dcc4}),wallD=psMat({color:0xcfc3a6}),stone=psMat({color:0x9a958a}),roofM=psMat({color:0x4a4d52});
  /* the castle: curtain walls, round towers with copper caps, the keep with its spire */
  {
    const g=new THREE.Group(),H0=G.y0+1.2,S=27;
    const bx=(w,h,d,m,x,y,z)=>{const o=new THREE.Mesh(flat(new THREE.BoxGeometry(w,h,d)),m);o.position.set(x,y,z);g.add(o);return o;};
    for(const [x,z,w,d] of [[0,-S,2*S,2.4],[0,S,2*S,2.4],[-S,0,2.4,2*S],[S,0,2.4,2*S]])bx(w,9,d,wall,x,4.5,z);
    for(const [x,z,w,d] of [[0,-S+6,2*S-6,9],[-S+6,4,9,2*S-14]]){bx(w,13,d,wall,x,6.5,z);
      const r=gableRoof(w,d*1.15,5,0x4a4d52);r.position.set(x,13,z);if(w<d)r.rotation.y=Math.PI/2;
      if(w<d){r.children.forEach(c=>{});}g.add(r);
      for(let k=0;k<Math.floor(Math.max(w,d)/4);k++){const along=-Math.max(w,d)/2+2+k*4;
        const win=bx(w<d?.2:1.1,1.6,w<d?1.1:.2,psMat({color:0x30353c}),w<d?x+d/2+.1:x+along,9,w<d?z+along:z+d/2+.1);}
    }
    kalmarTower(g,-S,-S,6.5,17,10,wall);kalmarTower(g,S,-S,6,16,9,wall);
    kalmarTower(g,-S,S,6,16,9,wall);kalmarTower(g,S,S,7,18,11,wall);
    bx(11,26,11,wall,8,13,-4);
    const lan=new THREE.Mesh(flat(new THREE.CylinderGeometry(3.4,4.4,5,8)),psMat({color:0x5fa58a}));lan.position.set(8,28.5,-4);g.add(lan);
    const spire=new THREE.Mesh(flat(new THREE.ConeGeometry(2.6,13,8)),psMat({color:0x5fa58a}));spire.position.set(8,37.5,-4);g.add(spire);
    bx(9,12,6,wallD,0,6,S+1);
    const gr=new THREE.Mesh(flat(new THREE.ConeGeometry(6.4,6,4)),psMat({color:0x5fa58a}));gr.position.set(0,15,S+1);gr.rotation.y=Math.PI/4;gr.scale.z=.7;g.add(gr);
    bx(4,5.5,.3,psMat({color:0x2a2420}),0,2.75,S+4.1);
    /* flags on the corner towers */
    const fl=kalmarFlag(['#2f5aa8','#f2c418']);
    for(const [x,z,h] of [[-S,-S,31],[S,S,33]]){
      const p=new THREE.Mesh(flat(new THREE.CylinderGeometry(.08,.08,5,4)),psMat({color:0xe8e2d0}));p.position.set(x,h,z);g.add(p);
      const f=new THREE.Mesh(new THREE.PlaneGeometry(2.4,1.6),psMat({map:fl,side:THREE.DoubleSide}));f.position.set(x+1.2,h+1.8,z);g.add(f);anim.push({k:'flag',m:f});
    }
    g.position.set(G.C[0],H0-.2,G.C[1]);g.rotation.y=Math.atan2(-G.fz,G.fx);world.add(g);
    /* moat water: the ring, and the arm down to the bridge */
    const wm=psMat({color:0x3d7090,unlit:true});
    const ring=new THREE.Mesh(new THREE.RingGeometry(36,60,36,1).rotateX(-Math.PI/2),wm);ring.position.set(G.C[0],G.y0-1.5,G.C[1]);world.add(ring);
    const armL=-KALMAR.castleLat-HW-40;
    const arm=new THREE.Mesh(new THREE.PlaneGeometry(16,armL).rotateX(-Math.PI/2),wm);
    const am=-(HW+armL/2-1);arm.position.set(G.bx+G.rx*am,G.y0-1.5,G.bz+G.rz*am);arm.rotation.y=G.yaw+Math.PI/2;world.add(arm);
    /* a little fixed bridge from the moat bank to the castle gate */
    const cb=new THREE.Mesh(flat(new THREE.BoxGeometry(5,.6,26)),psMat({color:0x6b5540}));
    const cbo=KALMAR.castleLat+S+14;cb.position.set(G.bx+G.rx*cbo,G.y0+.9,G.bz+G.rz*cbo);cb.rotation.y=G.yaw+Math.PI/2;
    cb.position.x+=G.fx*0;world.add(cb);
  }
  /* the bastion beside the drawbridge, with the tunnel the lane runs through */
  {
    const R=ALTS.find(r=>r.id==='valv'),[b0,b1]=KALMAR.bastion,mid=Math.round((b0+b1)/2);
    let laneLat=15;
    if(R){let bd=1e9;for(let j=0;j<R.n;j++){const d=Math.hypot(R.X[j]-sx[mid],R.Z[j]-sz[mid]);if(d<bd){bd=d;laneLat=(R.X[j]-sx[mid])*rx[mid]+(R.Z[j]-sz[mid])*rz[mid];}}}
    const half=(b1-b0)*SEG/2,yaw=Math.atan2(fx[mid],fz[mid]),y=sy[mid];
    const g=new THREE.Group();
    const bx=(w,h,d,m,x,yy,z)=>{const o=new THREE.Mesh(flat(new THREE.BoxGeometry(w,h,d)),m);o.position.set(x,yy,z);g.add(o);return o;};
    const inner=HW+1.2,tl=laneLat-5.2,tr=laneLat+5.2,outer=laneLat+13;
    const sgn=-1;                                    /* group +x is the road's left; the lane is on the right */
    bx(tl-inner,9,2*half,stone,sgn*(inner+tl)/2,4.5-1,0);
    bx(outer-tr,9,2*half,stone,sgn*(tr+outer)/2,4.5-1,0);
    bx(tr-tl,2.4,2*half,stone,sgn*laneLat,7.3,0);
    bx(tr-tl-.4,.3,2*half-.2,psMat({color:0x2a2622}),sgn*laneLat,6.05,0);
    for(let k=0;k<Math.floor((outer-inner)/2.2);k++)bx(1.1,1.2,2*half+.2,wallD,sgn*(inner+.6+k*2.2),9.1,0);
    /* the arch faces: darker stone round the mouths */
    for(const s2 of [-1,1])bx(tr-tl+1.6,1.4,.6,wallD,sgn*laneLat,6.3,s2*(half+.1));
    g.position.set(sx[mid],y,sz[mid]);g.rotation.y=yaw;world.add(g);
    /* grassy tunnel floor and lane: a green ribbon with two dirt ruts */
    if(R){
      const gt=pixTex(32,32,c=>{c.fillStyle='#5f8f3e';c.fillRect(0,0,32,32);
        for(let n=0;n<160;n++){c.fillStyle=Math.random()>.5?'#76a34c':'#4a7432';c.fillRect((Math.random()*32)|0,(Math.random()*32)|0,1,2);}
        c.fillStyle='rgba(110,86,58,.85)';c.fillRect(6,0,5,32);c.fillRect(21,0,5,32);});
      gt.wrapS=gt.wrapT=THREE.RepeatWrapping;
      const gm=psMat({map:gt});gm.polygonOffset=true;gm.polygonOffsetFactor=-4;gm.polygonOffsetUnits=-4;
      world.add(new THREE.Mesh(altRibbon(R,-R.hw-.2,R.hw+.2,.04,5,COMMIT+3,R.n-1-MERGE-3),gm));
      /* low hedges along the meadow part so the lane's walls read */
      const hed=[];
      for(let j=COMMIT+4;j<R.n-MERGE-3;j+=2)for(const s2 of [-1,1]){
        const x=R.X[j]+R.RX[j]*s2*(R.hw+1.6),z=R.Z[j]+R.RZ[j]*s2*(R.hw+1.6);
        const k=nearestGlobal(x,z);if(Math.abs((x-sx[k])*rx[k]+(z-sz[k])*rz[k])<HW+4)continue;
        const dd=Math.abs((x-sx[mid])*fx[mid]+(z-sz[mid])*fz[mid]);if(dd<half+1&&Math.abs((x-sx[mid])*rx[mid]+(z-sz[mid])*rz[mid])<outer+2)continue;
        hed.push([x,R.Y[j]+.55,z,Math.atan2(R.FX[j],R.FZ[j]),1.2,1.1,2.4]);
      }
      kalmarInst(flat(new THREE.BoxGeometry(1,1,1)),psMat({color:0x3f6a34}),hed);
    }
  }
  /* the gatehouse over the road at the far end of the drawbridge */
  {
    const gi=KALMAR.gate,gyaw=Math.atan2(fx[gi],fz[gi]),g=new THREE.Group();
    const bx=(w,h,d,m,x,y,z)=>{const o=new THREE.Mesh(flat(new THREE.BoxGeometry(w,h,d)),m);o.position.set(x,y,z);g.add(o);return o;};
    for(const sg of [-1,1]){bx(5,16,7,wall,sg*(HW+3.4),8,0);
      const r=new THREE.Mesh(flat(new THREE.ConeGeometry(4.4,6,4)),psMat({color:0x5fa58a}));r.position.set(sg*(HW+3.4),19,0);r.rotation.y=Math.PI/4;g.add(r);}
    bx((HW+6)*2,4,7,wall,0,13,0);
    for(let c=-4;c<=4;c++)bx(1.3,1.3,7.3,wallD,c*2.1,15.6,0);
    const lamp=psMat({color:0x30c040,unlit:true});
    for(const sg of [-1,1])bx(.9,.9,.4,lamp,sg*(HW+.6),10.4,-3.7);
    const bell=new THREE.Mesh(flat(new THREE.ConeGeometry(.8,1.2,8)),psMat({color:0xc8a040}));bell.position.set(0,12.2,-3.9);g.add(bell);
    g.position.set(sx[gi],sy[gi],sz[gi]);g.rotation.y=gyaw;world.add(g);
    stage.kalmarLamp=lamp;stage.kalmarBell=bell;
  }
  /* the Baltic, and the long bridge to Öland on the horizon */
  {
    const sea=new THREE.Mesh(new THREE.PlaneGeometry(2000,900).rotateX(-Math.PI/2),psMat({color:0x2f6c9a,unlit:true}));
    sea.position.set(0,G.y0-5,seaZ-10-450);world.add(sea);
    const bz=seaZ-150,pier=[];
    for(let x=-420;x<=420;x+=24){const hh=x<-300?16:6;pier.push([x,G.y0-5+hh/2,bz,0,1.2,hh,1.2]);}
    kalmarInst(flat(new THREE.BoxGeometry(1,1,1)),psMat({color:0xa8b0b6}),pier);
    for(let x=-420;x<420;x+=24){const h1=x<-300?16:6,h2=(x+24)<-300?16:6;
      strut(new THREE.Vector3(x,G.y0-5+h1+.6,bz),new THREE.Vector3(x+24,G.y0-5+h2+.6,bz),1.2,psMat({color:0xbcc4ca}));}
    /* sailing boats */
    for(let n=0;n<5;n++){const x=-260+n*120+hash2(n,1)*40,z=seaZ-40-hash2(n,2)*80;
      const b=new THREE.Mesh(flat(new THREE.BoxGeometry(1.6,.8,5)),psMat({color:0xf2efe6}));b.position.set(x,G.y0-4.4,z);world.add(b);
      const s=new THREE.Mesh(flat(new THREE.ConeGeometry(1.8,6,3)),psMat({color:0xf8f6f0}));s.position.set(x,G.y0-1,z);s.scale.z=.15;world.add(s);
      anim.push({k:'boat',a:b,b:s,x,z,ph:n});}
  }
  /* the old town wall across the road, with a gate tower the road runs through */
  {
    const wi=KALMAR.wallAt,wyaw=Math.atan2(fx[wi],fz[wi]),seg=[];
    for(const sg of [-1,1])for(let o=HW+7;o<HW+90;o+=4){
      const x=sx[wi]+rx[wi]*sg*o,z=sz[wi]+rz[wi]*sg*o;
      if(latAt(x,z)<HW+5||nearStation(x,z))break;
      const y=meshY(x,z);seg.push([x,y+3,z,wyaw+Math.PI/2,4.2,6,2.2]);
    }
    kalmarInst(flat(new THREE.BoxGeometry(1,1,1)),psMat({color:0xb7ad98}),seg);
    kalmarInst(flat(new THREE.BoxGeometry(1,1,1)),psMat({color:0xc9bfa8}),seg.filter((v,n)=>n%2===0).map(v=>[v[0],v[1]+3.6,v[2],v[3],1.6,1.2,2.4]));
    const g=new THREE.Group(),bx=(w,h,d,m,x,y,z)=>{const o=new THREE.Mesh(flat(new THREE.BoxGeometry(w,h,d)),m);o.position.set(x,y,z);g.add(o);};
    for(const sg of [-1,1])bx(5,13,8,psMat({color:0xb7ad98}),sg*(HW+3.4),6.5,0);
    bx((HW+6)*2,4.5,8,psMat({color:0xb7ad98}),0,11.5,0);
    const r=new THREE.Mesh(flat(new THREE.ConeGeometry(12,7,4)),psMat({color:0x8b3a2a}));r.position.y=17.2;r.rotation.y=Math.PI/4;r.scale.z=.55;g.add(r);
    g.position.set(sx[wi],sy[wi],sz[wi]);g.rotation.y=wyaw;world.add(g);
  }
  /* Kvarnholmen: plastered town houses in ochre, pink and pale yellow with red tile roofs */
  {
    const cols=[0xe8c87a,0xe6b0a0,0xf0e0b0,0xd8a860,0xe8e0d0,0xc8d0b0];
    for(let i=522;i<720;i+=10)for(const side of [-1,1]){
      if(hash2(i,side)>.7)continue;
      const o=side*(HW+12+hash2(i,side*3)*8),x=sx[i]+rx[i]*o,z=sz[i]+rz[i]*o;
      if(!free(x,z,10))continue;
      const h=house(7+hash2(i,2)*4,6.5,5+hash2(i,4)*3,cols[(i/10|0)%cols.length],0xa84a30,2.6);
      h.position.set(x,meshY(x,z)-.2,z);h.rotation.y=Math.atan2(fx[i],fz[i]);world.add(h);
    }
    /* the cathedral on the square: pale stone, four corner towers, a central lantern */
    const ci=640,co=HW+46,x=sx[ci]+rx[ci]*co,z=sz[ci]+rz[ci]*co;
    if(free(x,z,30)){
      const g=new THREE.Group(),bx=(w,h,d,m,x2,y,z2)=>{const o=new THREE.Mesh(flat(new THREE.BoxGeometry(w,h,d)),m);o.position.set(x2,y,z2);g.add(o);};
      bx(30,14,18,wall,0,7,0);bx(18,14,30,wall,0,7,0);
      const r1=gableRoof(31,19,6,0x4a4d52);r1.position.y=14;g.add(r1);
      const r2=gableRoof(19,31,6,0x4a4d52);r2.position.y=14;r2.rotation.y=Math.PI/2;g.add(r2);
      for(const [a,b] of [[-13,-7],[13,-7],[-13,7],[13,7]]){bx(5,20,5,wall,a,10,b);
        const d=new THREE.Mesh(flat(new THREE.SphereGeometry(2.8,8,4,0,6.3,0,1.6)),psMat({color:0x4a4d52}));d.position.set(a,20,b);g.add(d);}
      const lan=new THREE.Mesh(flat(new THREE.CylinderGeometry(3,3,5,8)),wall);lan.position.y=22;g.add(lan);
      const dm=new THREE.Mesh(flat(new THREE.SphereGeometry(3.4,8,4,0,6.3,0,1.6)),psMat({color:0x4a4d52}));dm.position.y=24.5;g.add(dm);
      g.position.set(x,meshY(x,z)-.3,z);g.rotation.y=Math.atan2(fx[ci],fz[ci]);world.add(g);
    }
  }
  /* trees: lindens and oaks in the park, with a ring of darker woods out at the fog */
  {
    const tr=[],cr=[],cc=[];let guard=0;
    while(tr.length<220&&guard++<12000){
      const x=rand(-370,370),z=rand(-370,370);
      if(!free(x,z,14))continue;
      if(hash2(Math.floor(x/60),Math.floor(z/60))<0.5&&Math.random()>.08)continue;
      const s=rand(.8,1.4),y=meshY(x,z)-.2;tr.push([x,y,z,rand(0,6),s]);cr.push([x,y,z,rand(0,6),s,s*rand(.85,1.2),s]);
      cc.push(new THREE.Color(1,1,1).multiplyScalar(rand(.82,1.15)));
    }
    kalmarInst(flat(new THREE.CylinderGeometry(.25,.4,3.4,5)).translate(0,1.7,0),psMat({color:0x5a4634}),tr);
    kalmarInst(flat(new THREE.IcosahedronGeometry(3,0)).translate(0,5.6,0),psMat({color:0x4f8a3c}),cr,cc);
    const TL=[];
    for(let n=0;n<90;n++){const a=n/90*6.283,d=rand(330,372),x=Math.cos(a)*d,z=Math.sin(a)*d;if(z<seaZ)continue;
      const h=rand(12,22),w=rand(14,26);TL.push([x,meshY(x,z)+h*.4,z,rand(0,6),w,h,w]);}
    kalmarInst(flat(new THREE.IcosahedronGeometry(1,0)),psMat({color:0x4a7448}),TL);
  }
  /* the tournament: the knights' lanes behind a second fence, striped tents, spectator stands */
  {
    const [j0,j1]=KALMAR.joust,fen=[],tents=[],tc=[],tops=[],crowd=[],ccol=[];
    for(let i=j0-4;i<=j1+4;i+=2)for(const sg of [-1,1]){
      const o=sg*(HW+8.6),x=sx[i]+rx[i]*o,z=sz[i]+rz[i]*o;
      fen.push([x,meshY(x,z)+.7,z,Math.atan2(fx[i],fz[i]),.22,1.4,SEG*2+.2]);
    }
    kalmarInst(flat(new THREE.BoxGeometry(1,1,1)),psMat({color:0xf2efe6}),fen);
    const stripe=pixTex(32,16,c=>{for(let k=0;k<8;k++){c.fillStyle=k%2?'#f2efe6':'#c0302a';c.fillRect(k*4,0,4,16);}});
    const stripeB=pixTex(32,16,c=>{for(let k=0;k<8;k++){c.fillStyle=k%2?'#f2c418':'#2f5aa8';c.fillRect(k*4,0,4,16);}});
    let n=0;
    for(let i=j0;i<=j1;i+=12)for(const sg of [-1,1]){
      const o=sg*(HW+22+hash2(i,sg)*5),x=sx[i]+rx[i]*o,z=sz[i]+rz[i]*o;
      if(!free(x,z,12))continue;
      const g=new THREE.Group(),m=psMat({map:n%2?stripe:stripeB});
      const body=new THREE.Mesh(flat(new THREE.CylinderGeometry(3,3,3,10,1,true)),m);body.position.y=1.5;g.add(body);
      const top=new THREE.Mesh(flat(new THREE.ConeGeometry(3.4,3,10)),m);top.position.y=4.5;g.add(top);
      const pl=new THREE.Mesh(flat(new THREE.CylinderGeometry(.06,.06,2.4,4)),psMat({color:0x5a4430}));pl.position.y=7;g.add(pl);
      const pen=new THREE.Mesh(new THREE.ConeGeometry(.4,1.8,3).rotateZ(-Math.PI/2).translate(.9,0,0),psMat({color:n%2?0xc0302a:0x2f5aa8,side:THREE.DoubleSide}));pen.position.y=7.8;g.add(pen);
      anim.push({k:'pen',m:pen,ph:n});
      g.position.set(x,meshY(x,z)-.1,z);world.add(g);n++;
    }
    /* stands with a crowd */
    for(const [i,sg] of [[Math.round((j0+j1)/2),1],[Math.round((j0+j1)/2)+16,-1]]){
      const o=sg*(HW+16),x=sx[i]+rx[i]*o,z=sz[i]+rz[i]*o;if(!free(x,z,10))continue;
      const g=new THREE.Group(),yaw=Math.atan2(fx[i],fz[i]);
      for(let r=0;r<3;r++){const row=new THREE.Mesh(flat(new THREE.BoxGeometry(22,1,2.2)),psMat({color:r%2?0x7a6047:0x8d7154}));row.position.set(0,.6+r*1.1,sg*r*2.2);g.add(row);}
      const can=new THREE.Mesh(flat(new THREE.BoxGeometry(23,.3,8)),psMat({map:stripe}));can.position.set(0,6,sg*2.2);g.add(can);
      for(const a of [-11,11])for(const b of [-1.5,5.8]){const p=new THREE.Mesh(flat(new THREE.BoxGeometry(.3,6,.3)),psMat({color:0x5a4430}));p.position.set(a,3,sg*b);g.add(p);}
      g.position.set(x,meshY(x,z),z);g.rotation.y=yaw;world.add(g);
      const cs=[0xc0302a,0x2f5aa8,0xe8b830,0x3f8a3a,0xf2efe6,0x7a3f8a];
      for(let r=0;r<3;r++)for(let c=0;c<14;c++){
        const lx=-10+c*1.5+hash2(r,c)*.4,lz=sg*(r*2.2),wx=x+Math.cos(yaw)*lx+Math.sin(yaw)*lz,wz=z-Math.sin(yaw)*lx+Math.cos(yaw)*lz;
        crowd.push([wx,meshY(x,z)+1.1+r*1.1+.7,wz,yaw,.6,1.2,.5]);ccol.push(new THREE.Color(cs[(r*5+c)%cs.length]));
      }
    }
    kalmarInst(flat(new THREE.BoxGeometry(1,1,1)),psMat({color:0xffffff}),crowd,ccol);
    stage.kalmarCrowd=crowd.length;
  }
}
/** a knight on horseback, facing +z; returns the group with the lance pivot */
function kalmarKnight(col,col2,hc){
  const g=new THREE.Group();
  const b=(w,h,d,c,x,y,z,p,u)=>{const m=new THREE.Mesh(flat(new THREE.BoxGeometry(w,h,d)),psMat({color:c,unlit:!!u}));m.position.set(x,y,z);(p||g).add(m);return m;};
  b(1.2,1.2,3.0,hc,0,1.95,0);                               /* the horse, under a long caparison */
  b(1.4,1.0,3.3,col,0,1.6,0);b(1.42,.55,1.0,col2,0,1.6,.4);b(1.42,.25,3.32,col2,0,1.12,0);
  b(.7,1.3,.9,hc,0,2.9,1.75).rotation.x=-.5;b(.62,.62,1.2,col,0,3.4,2.35);
  const legs=[];
  for(const [x,z] of [[-.42,1.1],[.42,1.1],[-.42,-1.1],[.42,-1.1]]){
    const piv=new THREE.Group();piv.position.set(x,1.3,z);g.add(piv);b(.28,1.3,.28,hc,0,-.65,0,piv);legs.push(piv);}
  b(.85,1.25,.65,0xdfe4ea,0,3.25,-.2,null,true);b(.62,.62,.62,0xdfe4ea,0,4.15,-.2,null,true);
  b(.64,.12,.2,0x15171a,0,4.2,.12);
  b(.18,1.0,.7,col2,0,4.9,-.35);b(.18,.6,.5,col,0,5.5,-.45);           /* plume */
  b(1.0,1.2,.14,col2,0,3.2,-.62);b(.4,.5,.16,col,0,3.3,-.7);             /* shield slung on the back */
  const lance=new THREE.Group();lance.position.set(-.55,3.3,0);g.add(lance);
  lance.rotation.order='YXZ';
  const st=pixTex(4,32,c=>{for(let k=0;k<8;k++){c.fillStyle=k%2?'#f2efe6':(typeof col==='number'?'#'+col.toString(16).padStart(6,'0'):col);c.fillRect(0,k*4,4,4);}});
  st.wrapS=st.wrapT=THREE.RepeatWrapping;
  const L=new THREE.Mesh(flat(new THREE.CylinderGeometry(.07,.2,6.4,6).rotateX(Math.PI/2).translate(0,0,3.0)),psMat({map:st,unlit:true}));lance.add(L);
  const gu=new THREE.Mesh(flat(new THREE.ConeGeometry(.4,.6,6).rotateX(Math.PI/2).translate(0,0,.1)),psMat({color:0xc8ccd0}));lance.add(gu);
  g.userData={legs,lance};
  g.scale.setScalar(1.35);
  return g;
}
function hazardsKalmar(H){
  const R=ALTS.find(r=>r.id==='valv'),G=kalmarGeo();
  /* the drawbridge: hinged at the near end, it rises on a bell and launches whoever hits it at speed */
  const BH=KALMAR.hinge,LEN=KALMAR.leaf,hy=sy[BH],yaw=Math.atan2(fx[BH],fz[BH]);
  const piv=new THREE.Group();piv.position.set(sx[BH],hy+.02,sz[BH]);piv.rotation.order='YXZ';piv.rotation.y=yaw;world.add(piv);
  const plank=pixTex(32,32,c=>{c.fillStyle='#6b4e34';c.fillRect(0,0,32,32);
    for(let y=0;y<32;y+=4){c.fillStyle=y%8?'#7a5a3c':'#5f442c';c.fillRect(0,y,32,3);}
    c.fillStyle='#2a2420';for(const x of [3,28])for(let y=1;y<32;y+=4)c.fillRect(x,y,1,1);});
  plank.wrapS=plank.wrapT=THREE.RepeatWrapping;
  const deckG=new THREE.BoxGeometry(2*HW+.6,.2,LEN);deckG.translate(0,0,LEN/2);
  const uv=deckG.attributes.uv;for(let n=0;n<uv.count;n++)uv.setXY(n,uv.getX(n)*4,uv.getY(n)*3);
  const deck=new THREE.Mesh(flat(deckG),psMat({map:plank}));piv.add(deck);
  const iron=psMat({color:0x2e3034});
  for(const z of [.6,LEN-.6]){const s=new THREE.Mesh(flat(new THREE.BoxGeometry(2*HW+.7,.4,.5)),iron);s.position.set(0,.05,z);piv.add(s);}
  /* the gap under the leaf: dark water where the road was */
  const gapM=psMat({color:0x1d3a50,unlit:true});gapM.polygonOffset=true;gapM.polygonOffsetFactor=-2;gapM.polygonOffsetUnits=-2;
  const gap=new THREE.Mesh(new THREE.PlaneGeometry(2*HW+.4,LEN-.4).rotateX(-Math.PI/2).translate(0,0,LEN/2),gapM);
  gap.position.set(sx[BH],hy+.05,sz[BH]);gap.rotation.y=yaw;world.add(gap);
  /* stone parapets either side of the bridge */
  for(const sg of [-1,1]){const p=new THREE.Mesh(flat(new THREE.BoxGeometry(1,1.2,LEN+3).translate(0,0,LEN/2)),psMat({color:0xb7ad98}));
    p.position.set(sx[BH]+rx[BH]*sg*(HW+1.1),hy+.6,sz[BH]+rz[BH]*sg*(HW+1.1));p.rotation.y=yaw;world.add(p);}
  /* chains from the gatehouse down to the leaf tip */
  const gi=KALMAR.gate,chM=psMat({color:0x1e2024});
  const chains=[-1,1].map(sg=>{const m=new THREE.Mesh(flat(new THREE.BoxGeometry(.18,.18,1).translate(0,0,.5)),chM);world.add(m);
    return {m,top:new THREE.Vector3(sx[gi]+rx[gi]*sg*(HW-.2),sy[gi]+11,sz[gi]+rz[gi]*sg*(HW-.2)),sg};});
  const tipW=new THREE.Vector3();
  const PER=16,PH=3;let rang=false;
  const BR={angle:0};stage.kalmarBR=BR;
  H.push({id:'vindbrygga',period:PER,phase:PH,mesh:piv,unblockable:true,
    update(u,dt){
      const up=smooth(0.55,0.63,u)*(1-smooth(0.86,0.95,u));
      const ang=up*0.42;BR.angle=ang;piv.rotation.x=-ang;gap.visible=ang>0.004;
      for(const C of chains){
        tipW.set(sx[BH]+rx[BH]*C.sg*(HW-.2)+fx[BH]*LEN*Math.cos(ang),hy+.3+LEN*Math.sin(ang),sz[BH]+rz[BH]*C.sg*(HW-.2)+fz[BH]*LEN*Math.cos(ang));
        C.m.position.copy(C.top);C.m.lookAt(tipW);C.m.scale.z=C.top.distanceTo(tipW);
      }
      /* the lamp turns red and the bell rings a second and a half before it moves */
      const warn=u>0.46&&u<0.95;
      if(stage.kalmarLamp)stage.kalmarLamp.uniforms.uColor.value.setHex(warn?(Math.floor(clock*4)%2||up>0.05?0xe02818:0x501008):0x30c040);
      if(stage.kalmarBell)stage.kalmarBell.rotation.z=warn&&u<0.6?Math.sin(clock*14)*.5:0;
      if(u>0.46&&u<0.5&&!rang){rang=true;
        if(state==='race'&&player){const d=Math.hypot(player.x-sx[BH],player.z-sz[BH]);
          if(d<260){ping(1320,1310,.3);setTimeout(()=>ping(1320,1310,.3),300);setTimeout(()=>ping(1320,1310,.3),600);}
          const ahead=((BH-player.si)%N+N)%N;
          if(!player.rib&&ahead<140&&ahead>0)toast('VINDBRYGGAN GÅR UPP!');}}
      if(u>0.6)rang=false;
      if(state!=='race'||ang<0.1)return;
      for(const k of karts){
        if(k.parked||k.rib||k.air||k.ghost>0)continue;
        const ahead=((k.si-BH)%N+N)%N;if(ahead>5&&ahead<N-1)continue;
        const f=(k.x-sx[BH])*fx[BH]+(k.z-sz[BH])*fz[BH];
        if(f<-1.5||f>8)continue;
        const lat=(k.x-sx[BH])*rx[BH]+(k.z-sz[BH])*rz[BH];if(Math.abs(lat)>HW+.4)continue;
        if(raceTime-(k.kmrBr||-9)<0.8)continue;
        k.kmrBr=raceTime;
        const vf=k.vx*fx[BH]+k.vz*fz[BH];
        if(vf>13){                                        /* up the ramp and off the end */
          k.vy=Math.min(14,vf*Math.tan(ang)*1.05+2);k.y+=.25;k.air=true;BR.launch=(BR.launch||0)+1;
          for(let n=0;n<8;n++)puff(k.x+rand(-1,1),k.y+.3,k.z+rand(-1,1),.6,.48,.32,.5);
          if(k===player){toast('VINDBRYGGAN! FLYG!');ping(300,900,.25);shake=Math.min(1,shake+.3);}
        }else{                                            /* too slow: it shoves you back */
          BR.bump=(BR.bump||0)+1;const back=f+1.8;k.x-=fx[BH]*back;k.z-=fz[BH]*back;
          const vl=k.vx*rx[BH]+k.vz*rz[BH];k.vx=-fx[BH]*4+rx[BH]*vl*.5;k.vz=-fz[BH]*4+rz[BH]*vl*.5;
          k.drift=0;k.charge=0;k.boost=0;
          if(k===player){toast('BRYGGAN ÄR UPPE!');ping(220,140,.2);shake=Math.min(1,shake+.4);}
        }
      }
    }});
  /* the joust: a knight down each side of the road, swinging the lance in over the barrier */
  const [j0,j1]=KALMAR.joust;
  [[1,0,0xd8382e,0xf0c030,0x8a6444],[-1,0.5,0x4a80e0,0xf2efe6,0xd8d2c8]].forEach(([sg,ph,c1,c2,hc],n)=>{
    const kn=kalmarKnight(c1,c2,hc);world.add(kn);
    const lance=kn.userData.lance,tip=new THREE.Vector3(),hand=new THREE.Vector3();
    let lastFan=-9;
    H.push({id:'riddare'+n,period:10,phase:ph*10,mesh:kn,
      update(u,dt){
        /* gallop one way, wheel round, gallop back */
        let s,dir,run;
        if(u<0.42){s=lerp(j0,j1,smooth(0,0.42,u));dir=1;run=1;}
        else if(u<0.5){s=j1;dir=-1;run=0;}
        else if(u<0.92){s=lerp(j1,j0,smooth(0.5,0.92,u));dir=-1;run=1;}
        else{s=j0;dir=1;run=0;}
        if(sg<0){s=j0+j1-s;dir=-dir;}
        const i0=Math.floor(s),f=s-i0,a=((i0%N)+N)%N,b=(a+1)%N;
        const lat=sg*(HW+5.5);
        const X=lerp(sx[a],sx[b],f)+lerp(rx[a],rx[b],f)*lat,Z=lerp(sz[a],sz[b],f)+lerp(rz[a],rz[b],f)*lat;
        const ry=Math.atan2(fx[a],fz[a])+(dir>0?0:Math.PI);
        kn.position.set(X,meshY(X,Z),Z);kn.rotation.y=ry;
        kn.userData.legs.forEach((L,q)=>L.rotation.x=run?Math.sin(clock*13+q*1.7)*.7:0);
        kn.position.y+=run?Math.abs(Math.sin(clock*13))*.25:0;
        /* the lance swings in over the road and back: lowered and pointing inwards for the hit */
        const sw=run?0.5+0.5*Math.sin(clock*3.6+n*2):0;
        const inward=sg*dir;                             /* which way the road is from the horse (+x is its left) */
        lance.position.x=.55*inward;lance.rotation.x=run?0.05:-.9;lance.rotation.y=inward*(0.15+sw*1.0);
        this.on=run;
        kn.updateMatrixWorld(true);
        hand.set(0,0,0);lance.localToWorld(hand);tip.set(0,0,6.2);lance.localToWorld(tip);
        this.h=hand;this.t=tip;this.y=kn.position.y;
        if(run&&state==='race'&&player&&n===0&&clock-lastFan>4&&u<0.05){
          const d=Math.hypot(player.x-X,player.z-Z);
          if(d<160){lastFan=clock;ping(523,523,.15);setTimeout(()=>ping(659,659,.15),160);setTimeout(()=>ping(784,790,.3),320);}
        }
      },
      hit(k){
        if(!this.on||!this.t||k.rib||k.air)return false;
        const ax=this.h.x,az=this.h.z,bx=this.t.x-ax,bz=this.t.z-az,L2=bx*bx+bz*bz;
        const t=clamp(((k.x-ax)*bx+(k.z-az)*bz)/L2,0,1),dx=k.x-ax-bx*t,dz=k.z-az-bz*t;
        return dx*dx+dz*dz<1.5*1.5&&Math.abs(k.y-this.y)<3.5;
      },
      effect(k){k.spun=Math.max(k.spun,1.1*k.spinResist);k.boost=0;k.drift=0;k.charge=0;
        for(let q=0;q<10;q++)puff(k.x+rand(-1,1),k.y+rand(.5,1.8),k.z+rand(-1,1),.95,.85,.3,.5);
        if(k===player){toast('TRÄFFAD AV LANSEN!');ping(900,200,.3);shake=Math.min(1,shake+.5);}}});
  });
  /* flags and pennants flutter, boats bob */
  H.push({id:'kalmarLiv',period:1,phase:0,update(u,dt){
    for(const a of stage.kalmarAnim||[]){
      if(a.k==='flag')a.m.rotation.y=Math.sin(clock*2.4+a.m.position.x)*.3;
      else if(a.k==='pen')a.m.rotation.y=Math.sin(clock*3+a.ph)*.5;
      else if(a.k==='boat'){const b=Math.sin(clock*1.3+a.ph)*.15;a.a.rotation.z=b;a.b.rotation.z=b;}
    }}});
}
