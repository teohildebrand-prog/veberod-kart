"use strict";
/* ───────── Ven ───────── */
/* Tribal Island Trail's counterpart: a lap round an island in the sound, a cave corner and a narrow statue gap, boulders off the cliff */
ROADTEX.ven=()=>pixTex(64,64,g=>{                    /* pale island tarmac, patched, a dashed centre line */
  g.fillStyle='#5a5c5c';g.fillRect(0,0,64,64);
  for(let i=0;i<900;i++){g.fillStyle=Math.random()>.5?'rgba(140,142,138,.5)':'rgba(40,42,44,.45)';
    g.fillRect((Math.random()*64)|0,(Math.random()*64)|0,1,1);}
  g.fillStyle='rgba(32,34,36,.45)';g.fillRect(8,10,14,9);g.fillRect(40,38,12,14);
  g.fillStyle='#e8e6da';g.fillRect(31,0,2,30);
});
VERGEC.ven=['#7f8f4c','#98a85c','#5f6e3a'];
GROUND.ven={cell:58,stripe:0.42,verge:0x8a9858,
  cols:[0xd9c272,0xcdb35e,0x7aa04c,0x8fb257,0xe2c62a,0x6d9a45,0xbdb26e,0x9cb862]};
SURF.grotta={top:o=>o+(1-o)*0.6,grip:o=>1-0.32*(1-o),fuel:1.05,name:'GROTTA'};
SFX.grotta={dust:[.62,.6,.55],noise:{f:1300,g:.02},rattle:true};
const VEN_SEA=-3.5, VEN_HARB=Math.atan2(-150,250);
/** signed distance (m) outside the island's cliff edge; Bäckviken bites a cove into the east side */
function venEdge(x,z){
  const dx=x-25,dz=z,th=Math.atan2(dz,dx),rho=Math.hypot(dx,dz),c=Math.cos(th),s=Math.sin(th);
  let R=1/Math.sqrt((c/318)*(c/318)+(s/236)*(s/236));
  R*=1+0.035*Math.sin(3*th+1.1)+0.025*Math.sin(7*th+2.3)+0.012*Math.sin(13*th+.4);
  const dh=wrapAng(th-VEN_HARB);R-=22*Math.exp(-dh*dh/0.010);
  return rho-R;
}
/** the island's own ground: a flat top of fields, steep clay cliffs down to the sea bed */
function venNat(x,z){
  const d=venEdge(x,z);
  let h=23.5+rolls(x,z)*0.2;
  if(d>-9)h=lerp(h,-22,smooth(-9,9,d));
  return h;
}
STAGES.push({ id:'ven', group:'kust', name:'VEN', sub:'ÖN I SUNDET', hw:8.2,
  bars:[0.75,0.70,0.65], laps:3,
  blurb:'Round the little island of Ven in the middle of Öresund: wheat on top, clay cliffs all round and Denmark and Sweden on either horizon. Cut through the cave in the harbour cliff or thread the narrow gap past the stone astronomer, and watch for dust on the cliff path: the boulders come next.',
  role:'Klippor, en grotta och stenras vid hamnen.',
  sky:[0xd2e4ee,0x2f86d8], fog:[0xc8dce6,150,860], amb:0x66727f, dif:0xfff2da,
  road:'ven', verge:'ven', edge:'fence', ground:'ven', paint:false,
  terrain:{size:780,seg:100},
  jumpSpec:[{h:3.4,drop:2.6,up:12,dn:7,rec:18},{h:2.6,drop:1.9,up:10,dn:6,rec:14}],
  ctrl:[[-130,23,165],[-40,23,170],[50,23,162],[130,23,140],[190,23,98],[228,21,42],[265,17,0],
        [298,12,-40],[296,7,-92],[255,5,-122],[205,8,-118],[150,13,-138],[90,17,-155],[25,22,-168],
        [-45,25,-162],[-105,25,-130],[-120,25,-76],[-72,25,-48],[-70,24,8],[-118,23,32],[-182,23,30],
        [-222,23,72],[-212,23,125],[-180,23,155]],
  mod:(x,z,t)=>venMod(x,z,t),
  land:(x,z,out)=>venLand(x,z,out),
  stations:[[0.13,-1],[0.83,1]],
  routes:[
    {id:'grotta',name:'GROTTAN',a:205,b:335,hw:4.2,side:-1,lead:12,leadLat:8,
     mid:[[0.5,18],[0.62,14]],surface:'grotta',risk:0.3,
     blurb:'Into the harbour cliff and round a sharp bend in the dark, under the rock and out of the way of the falling stones.'},
    {id:'tycho',name:'TYCHOS GLIPA',a:455,b:540,hw:3.2,side:-1,lead:9,leadLat:7,
     mid:[[0.5,0]],surface:'gravel',risk:0.4,
     blurb:'A garden path through Uraniborg, so narrow at the statue that a wheel on the plinth costs you.'}],
  hazards:H=>hazardsVen(H), scenery:()=>sceneryVen(),
  stamps:[
    {id:'ven1',dish:'Inlagd sill',ini:'I',kind:'intro',route:'main',i:398,lat:6.2,
     hint:'På norra kusten, ut mot havet.',
     story:'Ven\'s fishermen once lived off the herring that crowded the sound every autumn. Salted in barrels and then pickled with vinegar, sugar, onion and allspice, it kept all winter, and it still comes out at every midsummer table with new potatoes and chives.'},
    {id:'ven2',dish:'Skånsk limpa',ini:'S',kind:'route',route:'grotta',f:0.55,lat:0,
     hint:'Mitt i grottan, där det svänger tvärt.',
     story:'The fields on top of Ven grow rye and wheat right to the cliff edge. Skånsk limpa is the sweet loaf made from it: rye, syrup, orange peel and a little fennel and anise, dark and soft, best sliced thick with salted butter.'},
    {id:'ven3',dish:'Jordgubbstårta',ini:'J',kind:'master',route:'tycho',f:0.3,lat:'edge',
     hint:'I kanten av Tychos glipa, före statyn.',
     story:'Ven\'s warm, sea-sheltered fields ripen strawberries early, and in June the farm stands sell them by the litre. Jordgubbstårta is what happens next: sponge cake, vanilla cream and whipped cream, piled with strawberries for midsummer.'}] });
/** terrain off the road: the island's own ground, but never a bank between the road and the sea */
function venMod(x,z,t){
  const i=nearestGlobal(x,z),ox=x-sx[i],oz=z-sz[i];
  let h=venNat(x,z);
  const sea=ox*(sx[i]-25)+oz*sz[i];                   /* > 0: this side of the road faces the sea */
  if(sea>0)h=Math.min(h,lerp(h,sy[i]+1.2,smooth(0,900,sea)));
  return Math.min(1,t*3)*(h-sy[i])-rolls(x,z)*t;
}
function venLand(x,z,out){
  const d=venEdge(x,z);
  if(d>-7){                                     /* clay cliffs, then the shingle at the foot */
    const v=hash2(Math.floor(x/6),Math.floor(z/6));
    out.setHex(d>4?0xcfc3a4:(v>.5?0xa98458:0x93714a));
    if(d>-7&&d<-3)out.lerp(tmpC.setHex(0x8d9a52),.5);
  }
}
/** a rumble you feel more than hear: low noise for a second */
function venRumble(vol){
  if(typeof actx==='undefined'||!actx)return;
  const t=actx.currentTime,len=(actx.sampleRate*1.3)|0,b=actx.createBuffer(1,len,actx.sampleRate),d=b.getChannelData(0);
  for(let i=0;i<len;i++)d[i]=(Math.random()*2-1)*Math.sin(Math.PI*i/len);
  const n=actx.createBufferSource(),lp=actx.createBiquadFilter(),g=actx.createGain();
  lp.type='lowpass';lp.frequency.value=140;g.gain.value=.5*vol;
  n.buffer=b;n.connect(lp);lp.connect(g);g.connect(actx.destination);n.start(t);
}
function sceneryVen(){
  const m4=new THREE.Matrix4(),q=new THREE.Quaternion(),e=new THREE.Euler(),
        p=new THREE.Vector3(),sc=new THREE.Vector3(),one=new THREE.Vector3(1,1,1);
  const at=(i,o)=>{i=((Math.round(i)%N)+N)%N;const x=sx[i]+rx[i]*o,z=sz[i]+rz[i]*o;
    return {x,z,y:meshY(x,z),yaw:Math.atan2(fx[i],fz[i])};};
  const bx=(g,w,h,d,mat,x,y,z)=>{const m=new THREE.Mesh(flat(new THREE.BoxGeometry(w,h,d)),mat);m.position.set(x,y,z);g.add(m);return m;};
  const place=(g,x,z,yaw,dy)=>{g.position.set(x,meshY(x,z)+(dy||0),z);g.rotation.y=yaw||0;world.add(g);return g;};
  const white=psMat({color:0xeeebe2}),tile=psMat({color:0xa8452e}),thatch=psMat({color:0x8a7a50}),
        stone=psMat({color:0x9a978e}),rockM=psMat({color:0x857a68}),rockD=psMat({color:0x5e564a}),
        dark=psMat({color:0x2a2c30}),wood=psMat({color:0x6b5540});
  /* ── the sea all round, surf at the cliff foot, both coasts on the horizon ── */
  const sea=new THREE.Mesh(new THREE.PlaneGeometry(3200,3200).rotateX(-Math.PI/2),psMat({color:0x2f78a6,unlit:true}));
  sea.position.y=VEN_SEA;world.add(sea);
  {
    const K=160,pos=[],idx=[];
    for(let k=0;k<=K;k++){
      const th=k/K*Math.PI*2,c=Math.cos(th),s=Math.sin(th);
      let lo=60,hi=420;                                  /* where the cliff meets the water */
      for(let it=0;it<22;it++){const m=(lo+hi)/2;if(venNat(25+c*m,s*m)>VEN_SEA)lo=m;else hi=m;}
      for(const r of [lo-1.5,lo+3.5])pos.push(25+c*r,VEN_SEA+.12,s*r);
    }
    for(let k=0;k<K;k++){const a=2*k;idx.push(a,a+2,a+1,a+1,a+2,a+3);}
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));
    g.setIndex(idx);g.computeVertexNormals();
    world.add(new THREE.Mesh(g,psMat({color:0xeef4f2,unlit:true,side:THREE.DoubleSide})));
  }
  {                                                    /* Denmark west, Sweden east, hazy */
    const hill=new THREE.InstancedMesh(flat(new THREE.SphereGeometry(1,8,4,0,Math.PI*2,0,Math.PI/2)),psMat({color:0x6f8f7a}),64);
    let c=0;
    for(const sg of [-1,1])for(let n=0;n<26;n++){
      const z=-900+n*72,h=10+hash2(n,sg)*16+(sg<0?6:0);
      p.set(sg*(720+hash2(sg,n)*70),-3,z);e.set(0,hash2(n,1)*3,0);q.setFromEuler(e);
      sc.set(70+hash2(sg,n*2)*40,h,90);m4.compose(p,q,sc);hill.setMatrixAt(c++,m4);
    }
    hill.count=c;hill.instanceMatrix.needsUpdate=true;world.add(hill);
    const town=new THREE.InstancedMesh(flat(new THREE.BoxGeometry(1,1,1)),psMat({color:0xd8d6cc}),40);
    let t=0;
    for(let n=0;n<40;n++){                           /* Landskrona's roofs across the water */
      const x=640+hash2(n,3)*40,z=-260+n*9+hash2(n,5)*6,h=4+hash2(n,7)*14;
      p.set(x,h/2+6,z);sc.set(10,h,7);m4.compose(p,q,sc);town.setMatrixAt(t++,m4);
    }
    town.count=t;town.instanceMatrix.needsUpdate=true;world.add(town);
    /* the bridge far to the south, a thin line on two pylons */
    const brM=psMat({color:0xb8c2c8});
    const deck=new THREE.Mesh(flat(new THREE.BoxGeometry(1500,2,8)),brM);deck.position.set(0,14,660);world.add(deck);
    for(const x of [-150,150])for(const z of [654,666]){
      const py=new THREE.Mesh(flat(new THREE.BoxGeometry(3,70,3)),brM);py.position.set(x,32,z);world.add(py);}
  }
  /* sailing boats on the sound */
  {
    const hullG=flat(new THREE.BoxGeometry(2.2,1.2,7)),sailG=flat(new THREE.ConeGeometry(2.6,8,3));
    const hulls=new THREE.InstancedMesh(hullG,white,10),sails=new THREE.InstancedMesh(sailG,psMat({color:0xfafaf4}),10);
    let c=0;
    for(let n=0;n<14&&c<10;n++){
      const th=hash2(n,9.1)*Math.PI*2,r=360+hash2(n,2.2)*240,x=25+Math.cos(th)*r,z=Math.sin(th)*r;
      if(venEdge(x,z)<40)continue;
      e.set(0,hash2(n,4)*6,0);q.setFromEuler(e);
      p.set(x,VEN_SEA+.4,z);m4.compose(p,q,one);hulls.setMatrixAt(c,m4);
      p.set(x,VEN_SEA+5.4,z);sc.set(1,1,.25);m4.compose(p,q,sc);sails.setMatrixAt(c,m4);c++;
    }
    hulls.count=sails.count=c;hulls.instanceMatrix.needsUpdate=sails.instanceMatrix.needsUpdate=true;
    world.add(hulls);world.add(sails);
  }
  /* ── fields: hedgerow trees, sheep, farms with white walls ── */
  {
    const TR=240;
    const trunk=new THREE.InstancedMesh(flat(new THREE.CylinderGeometry(.25,.35,2.4,5)).translate(0,1.2,0),psMat({color:0x5a4634}),TR);
    const crown=new THREE.InstancedMesh(flat(new THREE.IcosahedronGeometry(2.6,0)).translate(0,4.2,0),psMat({color:0x4f7a36}),TR);
    const cA=new THREE.Color(.8,.9,.78),cB=new THREE.Color(1.15,1.1,1);
    let a=0,g=0;
    while(a<TR&&g++<9000){
      const line=Math.floor(rand(-6,6))*58,along=rand(-300,300),hz=Math.random()>.5;
      const x=(hz?along:line)+rand(-1.5,1.5),z=(hz?line:along)+rand(-1.5,1.5);
      if(venEdge(x,z)>-14||latAt(x,z)<HW+10)continue;
      const s2=rand(.7,1.3);p.set(x,meshY(x,z)-.2,z);e.set(0,rand(0,6),0);q.setFromEuler(e);
      sc.set(s2,s2*rand(.8,1.2),s2);m4.compose(p,q,sc);
      trunk.setMatrixAt(a,m4);crown.setMatrixAt(a,m4);crown.setColorAt(a,cA.clone().lerp(cB,Math.random()));a++;
    }
    trunk.count=crown.count=a;
    [trunk,crown].forEach(m=>{m.instanceMatrix.needsUpdate=true;if(m.instanceColor)m.instanceColor.needsUpdate=true;world.add(m);});
    const SH=46;
    const wool=new THREE.InstancedMesh(flat(new THREE.BoxGeometry(1.1,.8,1.6)).translate(0,.8,0),psMat({color:0xf0ece0}),SH);
    const head=new THREE.InstancedMesh(flat(new THREE.BoxGeometry(.45,.5,.5)).translate(0,1.0,1.0),dark,SH);
    let s=0;g=0;
    while(s<SH&&g++<4000){
      const cx=rand(-200,200),cz=rand(-150,150);
      if(hash2(Math.floor(cx/58),Math.floor(cz/58))<.7)continue;     /* sheep in a few pastures */
      if(venEdge(cx,cz)>-12||latAt(cx,cz)<HW+9)continue;
      p.set(cx,meshY(cx,cz)-.1,cz);e.set(0,rand(0,6),0);q.setFromEuler(e);m4.compose(p,q,one);
      wool.setMatrixAt(s,m4);head.setMatrixAt(s,m4);s++;
    }
    wool.count=head.count=s;wool.instanceMatrix.needsUpdate=head.instanceMatrix.needsUpdate=true;
    world.add(wool);world.add(head);
    let f=0;
    for(let n=0;n<60&&f<9;n++){                      /* whitewashed farms, tile and thatch */
      const x=rand(-230,230),z=rand(-170,170);
      if(venEdge(x,z)>-24||latAt(x,z)<HW+22)continue;
      const h=house(12,7,3.4,0xeeebe2,f%3?0xa8452e:0x8a7a50,3.2);
      const b2=house(14,8,4,0xb03a28,0x3a3a3a,3.4);b2.position.set(4,0,-11);h.add(b2);
      place(h,x,z,rand(0,6.28),-.2);f++;
    }
  }
  /* ── cycling paths across the fields, and the hire bikes ── */
  {
    const pm=psMat({color:0xc9b88e});pm.polygonOffset=true;pm.polygonOffsetFactor=-1;pm.polygonOffsetUnits=-1;
    const paths=[[[-200,-60],[-120,-10],[-20,30],[80,40],[170,10]],[[-60,120],[-20,60],[30,0],[40,-90],[10,-130]],
                 [[100,120],[120,60],[150,-20],[170,-70]]];
    for(const P of paths){
      const cur=new THREE.CatmullRomCurve3(P.map(v=>new THREE.Vector3(v[0],0,v[1])),false);
      const pts=cur.getSpacedPoints(80);
      for(let k=0;k<pts.length-1;k++){
        const a2=pts[k],b2=pts[k+1];
        const mx=(a2.x+b2.x)/2,mz=(a2.z+b2.z)/2;
        if(latAt(mx,mz)<HW+4||venEdge(mx,mz)>-8)continue;
        const L=Math.hypot(b2.x-a2.x,b2.z-a2.z),y0=meshY(a2.x,a2.z),y1=meshY(b2.x,b2.z);
        const seg=new THREE.Mesh(new THREE.BoxGeometry(2.2,.12,L+.4),pm);
        seg.position.set(mx,(y0+y1)/2+.12,mz);seg.lookAt(b2.x,y1+.12,b2.z);world.add(seg);
      }
    }
    const BK=16;
    const wg=flat(new THREE.TorusGeometry(.42,.06,3,8)),fg=flat(new THREE.BoxGeometry(.08,.5,1.0));
    const wheels=new THREE.InstancedMesh(wg,dark,BK*2),frames=new THREE.InstancedMesh(fg,psMat({color:0xc8321f}),BK);
    let c=0;
    const spots=[];for(let n=0;n<8;n++)spots.push(at(318+n*1.4,HW+5.2));     /* the hire rack by the harbour */
    for(const [i,o] of [[40,-HW-6],[44,-HW-6.5],[150,HW+6],[372,-HW-6],[610,HW+6],[612,HW+6.6],[700,-HW-6],[520,HW+7]])spots.push(at(i,o));
    for(const s2 of spots){
      if(c>=BK)break;
      e.set(0,s2.yaw+1.4,0);q.setFromEuler(e);
      for(const dz of [-.55,.55]){const v=new THREE.Vector3(0,.45,dz).applyQuaternion(q);
        p.set(s2.x+v.x,s2.y+.45,s2.z+v.z);m4.compose(p,q,one);wheels.setMatrixAt(c*2+(dz>0?1:0),m4);}
      p.set(s2.x,s2.y+.8,s2.z);m4.compose(p,q,one);frames.setMatrixAt(c,m4);c++;
    }
    wheels.count=c*2;frames.count=c;wheels.instanceMatrix.needsUpdate=frames.instanceMatrix.needsUpdate=true;
    world.add(wheels);world.add(frames);
  }
  /* ── the post mill on the ridge by the long straight ── */
  {
    const g=new THREE.Group();
    bx(g,.8,5,.8,wood,0,2.5,0);
    for(const r of [0,1.57]){const leg=bx(g,6,.4,.4,wood,0,.5,0);leg.rotation.y=r;}
    bx(g,4.4,6,5.6,psMat({color:0x8b6a4a}),0,8,0);
    const rf=gableRoof(4.8,6,2,0x4a4038);rf.position.y=11;rf.rotation.y=Math.PI/2;g.add(rf);
    const rot=new THREE.Group();rot.position.set(0,8.6,3.1);
    for(let k=0;k<4;k++){const h=new THREE.Group();h.rotation.z=k*1.5708;
      const sl=bx(h,1.6,8.5,.2,psMat({color:0xe2d8c0}),.4,4.6,0);sl.userData.k=k;rot.add(h);}
    g.add(rot);turbines.push({rot,speed:.55});
    const v=at(70,-(HW+38));place(g,v.x,v.z,v.yaw+.3);
  }
  /* ── S:t Ibbs church on the west cliff ── */
  {
    const g=new THREE.Group();
    bx(g,8,6,18,white,0,3,0);
    const rf=gableRoof(9,19,3.4,0x3a3a3a);rf.position.y=6;g.add(rf);
    bx(g,6,13,6,white,0,6.5,-11);
    const sp=new THREE.Mesh(flat(new THREE.ConeGeometry(4.2,7,4)),dark);sp.position.set(0,16.5,-11);sp.rotation.y=Math.PI/4;g.add(sp);
    bx(g,.2,1.4,1.4,dark,3.05,10,-11);bx(g,.2,1.4,1.4,dark,-3.05,10,-11);
    const wall=psMat({color:0xd8d4c8});
    for(const [w,d,x,z] of [[22,.8,0,12],[22,.8,0,-18],[.8,30,11,-3],[.8,30,-11,-3]])bx(g,w,1.1,d,wall,x,.55,z);
    const crosses=new THREE.InstancedMesh(flat(new THREE.BoxGeometry(.7,1.1,.2)),stone,10);
    for(let n=0;n<10;n++){p.set(-7+(n%5)*3.2,.5,5+Math.floor(n/5)*3.5);m4.compose(p,new THREE.Quaternion(),one);crosses.setMatrixAt(n,m4);}
    crosses.instanceMatrix.needsUpdate=true;g.add(crosses);
    const v=at(628,HW+17);place(g,v.x,v.z,v.yaw+Math.PI/2+.2,-.3);
  }
  /* ── Bäckviken: a stone pier, boathouses and the fishing boats ── */
  {
    const v=at(300,HW+13),out=new THREE.Vector3(rx[300],0,rz[300]);
    const sheds=[0xa8452e,0x3d5e7a,0xa8452e];
    for(let n=0;n<3;n++){const w=at(286+n*14,HW+11);
      const h=house(5,7,3,sheds[n],0x3a3a3a,2);place(h,w.x,w.z,w.yaw+Math.PI/2,-.3);}
    const pier=new THREE.Group();
    bx(pier,7,3,46,stone,0,-1.2,23);bx(pier,9,3.6,8,stone,0,-1,47);
    const pierY=VEN_SEA+1.3;
    pier.position.set(v.x+out.x*14,pierY,v.z+out.z*14);pier.rotation.y=Math.atan2(out.x,out.z);world.add(pier);
    for(let n=0;n<4;n++){
      const g=new THREE.Group();
      bx(g,2.6,1.4,7,n%2?psMat({color:0x2f5d8a}):white,0,.3,0);
      bx(g,1.6,1.4,2,white,0,1.6,-.6);bx(g,.15,4,.15,dark,0,2.6,1.6);
      const d=20+n*8,sd=(n%2?1:-1)*6.6;
      g.position.set(pier.position.x+out.x*d-out.z*sd,VEN_SEA+.3,pier.position.z+out.z*d+out.x*sd);
      g.rotation.y=Math.atan2(out.x,out.z);world.add(g);
    }
  }
  /* ── Uraniborg's garden walls, the star-tower and the stone astronomer ── */
  const T=ALTS.find(r=>r.id==='tycho');
  if(T){
    const mid=Math.round(T.n*.5),cx=T.X[mid]+T.RX[mid]*-20,cz=T.Z[mid]+T.RZ[mid]*-20,yaw=Math.atan2(T.FX[mid],T.FZ[mid]);
    const earth=new THREE.InstancedMesh(flat(new THREE.BoxGeometry(4.2,1.6,2.4)),psMat({color:0x6e9446}),140);
    let c=0;const ca=Math.cos(yaw),sa=Math.sin(yaw);
    for(const side of [0,1,2,3])for(let k=-8;k<=8;k++){
      const u=k*4,w=34,lx=side<2?u:(side===2?w:-w),lz=side<2?(side?w:-w):u;
      const x=cx+lx*ca+lz*sa,z=cz-lx*sa+lz*ca;
      if(latAt(x,z)<HW+3)continue;
      e.set(0,yaw+(side<2?0:Math.PI/2),0);q.setFromEuler(e);p.set(x,meshY(x,z)+.4,z);m4.compose(p,q,one);
      if(c<140)earth.setMatrixAt(c++,m4);
    }
    earth.count=c;earth.instanceMatrix.needsUpdate=true;world.add(earth);
    /* the palace foundations: a ring of stone in the grass */
    const ring=new THREE.Mesh(flat(new THREE.TorusGeometry(7,.6,3,16)),stone);ring.rotation.x=Math.PI/2;
    const rx0=cx+sa*-6,rz0=cz+ca*-6;
    if(latAt(rx0,rz0)>HW+12){ring.position.set(rx0,meshY(rx0,rz0)+.2,rz0);world.add(ring);}
    /* Stjärneborg: a round brick tower under a copper dome with the slit open to the sky */
    const tw=new THREE.Group();
    const brick=psMat({color:0xa0563c});
    const cyl=new THREE.Mesh(flat(new THREE.CylinderGeometry(5,5.6,9,10)),brick);cyl.position.y=4.5;tw.add(cyl);
    const dome=new THREE.Mesh(flat(new THREE.SphereGeometry(5.2,10,6,0,Math.PI*2,0,Math.PI/2)),psMat({color:0x6fae94}));dome.position.y=9;tw.add(dome);
    bx(tw,1.2,5.4,.6,dark,0,11.4,4.4).rotation.x=-.6;
    const tip=new THREE.Mesh(flat(new THREE.ConeGeometry(.5,2,5)),psMat({color:0xd8b84a}));tip.position.y=15;tw.add(tip);
    for(const [dx,dz,r] of [[11,4,2.6],[-9,7,2.2]]){
      const d2=new THREE.Mesh(flat(new THREE.SphereGeometry(r,8,4,0,Math.PI*2,0,Math.PI/2)),psMat({color:0x6fae94}));
      d2.position.set(dx,0,dz);tw.add(d2);}
    const tx=cx+sa*14+ca*-14,tz=cz+ca*14-sa*-14;
    if(latAt(tx,tz)>HW+12)place(tw,tx,tz,yaw,-.2);
    /* the gap: the stone astronomer on his plinth on one side, a boulder on the other */
    const j=Math.round(T.n*.58),gy=T.Y[j],ya=Math.atan2(T.FX[j],T.FZ[j]);
    const st=new THREE.Group();
    bx(st,2.6,2.2,2.6,stone,0,1.1,0);
    const robe=new THREE.Mesh(flat(new THREE.CylinderGeometry(.7,1.2,3.2,7)),stone);robe.position.y=3.8;st.add(robe);
    const ruff=new THREE.Mesh(flat(new THREE.CylinderGeometry(1.15,1.15,.35,10)),stone);ruff.position.y=5.5;st.add(ruff);
    const hd=new THREE.Mesh(flat(new THREE.SphereGeometry(.62,7,5)),stone);hd.position.y=6.1;st.add(hd);
    bx(st,.22,.22,.3,psMat({color:0xd8b84a}),0,6.1,.6);                   /* his famous brass nose */
    const arm=bx(st,.32,2.2,.32,stone,.8,6.2,.3);arm.rotation.set(-.5,0,-.55);    /* pointing at the stars */
    const sx2=T.X[j]+T.RX[j]*(T.hw+1.5),sz2=T.Z[j]+T.RZ[j]*(T.hw+1.5);
    st.position.set(sx2,gy-.1,sz2);st.rotation.y=ya-Math.PI/2;world.add(st);
    const bo=new THREE.Mesh(flat(new THREE.DodecahedronGeometry(2.2,0)),rockM);
    bo.scale.set(1,.85,1.2);
    const bx2=T.X[j]-T.RX[j]*(T.hw+1.7),bz2=T.Z[j]-T.RZ[j]*(T.hw+1.7);
    bo.position.set(bx2,gy+1.3,bz2);bo.rotation.y=1.1;world.add(bo);
    const sg=pixTex(64,32,g=>{g.fillStyle='#e8e2cf';g.fillRect(0,0,64,32);g.fillStyle='#3a3226';
      g.font='8px "Press Start 2P",monospace';g.textAlign='center';g.textBaseline='middle';g.fillText('URANI',32,10);g.fillText('BORG',32,22);});
    const v=at(446,-(HW+3.6));
    const post=new THREE.Mesh(flat(new THREE.CylinderGeometry(.12,.14,2.6,5)),wood);post.position.set(v.x,v.y+1.3,v.z);world.add(post);
    const pl=new THREE.Mesh(new THREE.PlaneGeometry(2.6,1.3),psMat({map:sg,unlit:true,side:THREE.DoubleSide}));
    pl.position.set(v.x,v.y+2.8,v.z);pl.rotation.y=v.yaw+Math.PI;world.add(pl);
  }
  /* ── the cave: rock walls, a rock roof and a mound of cliff over the sharp bend ── */
  const G=ALTS.find(r=>r.id==='grotta');
  if(G){
    const j0=Math.round(G.n*.22),j1=Math.round(G.n*.84);
    const rg=flat(new THREE.DodecahedronGeometry(1,0));
    const walls=new THREE.InstancedMesh(rg,rockM,400),walls2=new THREE.InstancedMesh(rg,rockD,400);
    let a=0,b=0;
    const put=(x,y,z,s,dark2)=>{
      const mi=nearestGlobal(x,z);if(Math.abs((x-sx[mi])*rx[mi]+(z-sz[mi])*rz[mi])<HW+3+s)return;   /* never on the main road */
      e.set(hash2(x,z)*3,hash2(z,x)*3,0);q.setFromEuler(e);p.set(x,y,z);sc.set(s,s*rand(.8,1.2),s);
      m4.compose(p,q,sc);if(dark2){if(b<400)walls2.setMatrixAt(b++,m4);}else if(a<400)walls.setMatrixAt(a++,m4);};
    for(let j=j0;j<=j1;j+=2)for(const sg of [-1,1]){
      for(const [o,h,s] of [[G.hw+2.2,1.6,2.2],[G.hw+2.4,4.4,2.2],[G.hw+1.6,6.8,1.9]]){
        const x=G.X[j]+G.RX[j]*sg*o,z=G.Z[j]+G.RZ[j]*sg*o;put(x,G.Y[j]+h,z,s+hash2(j,sg)*.6,(j+sg)%3===0);
      }
    }
    for(let j=j0+2;j<=j1-2;j+=2)for(const o of [-3.2,0,3.2]){                       /* the roof */
      const x=G.X[j]+G.RX[j]*o,z=G.Z[j]+G.RZ[j]*o;put(x,G.Y[j]+8.4+hash2(j,o)*.8,z,2.8,true);
    }
    for(const jj of [j0,j1]){                                                          /* the mouths */
      for(let k=-4;k<=4;k++){const ang=k/4*1.35,o=Math.sin(ang)*(G.hw+2.4),h=Math.cos(ang)*7.6;
        const x=G.X[jj]+G.RX[jj]*o,z=G.Z[jj]+G.RZ[jj]*o;put(x,G.Y[jj]+h+.4,z,2.1,false);}
    }
    walls.count=a;walls2.count=b;walls.instanceMatrix.needsUpdate=walls2.instanceMatrix.needsUpdate=true;
    world.add(walls);world.add(walls2);
    /* the cliff the cave runs through: a hump of clay over the bend, capped at both mouths */
    {
      const OF=[-34,-24,-15,-(G.hw+2),0,G.hw+2,15,24,34],UP=[null,7,10.5,9,11.5,9,10.5,7,null];
      const hy=(j,k)=>{const x=G.X[j]+G.RX[j]*OF[k],z=G.Z[j]+G.RZ[j]*OF[k],mi=nearestGlobal(x,z);
        const ml=Math.abs((x-sx[mi])*rx[mi]+(z-sz[mi])*rz[mi]);
        return UP[k]==null||ml<HW+16?meshY(x,z)-1:Math.max(G.Y[j]+UP[k]+hash2(j,k)*1.2,meshY(x,z)+.5);};
      const pos=[],idx=[],K=OF.length,J=[];
      for(let j=j0;j<=j1;j+=2)J.push(j);
      for(const j of J)for(let k=0;k<K;k++)pos.push(G.X[j]+G.RX[j]*OF[k],hy(j,k),G.Z[j]+G.RZ[j]*OF[k]);
      for(let a2=0;a2<J.length-1;a2++)for(let k=0;k<K-1;k++){const v=a2*K+k;idx.push(v,v+1,v+K,v+1,v+K+1,v+K);}
      for(const [a2,jj] of [[0,J[0]],[J.length-1,J[J.length-1]]]){          /* end caps above the mouths */
        const base=pos.length/3;
        for(let k=0;k<K;k++){const x=G.X[jj]+G.RX[jj]*OF[k],z=G.Z[jj]+G.RZ[jj]*OF[k];
          const low=Math.abs(OF[k])<=G.hw+2.1?G.Y[jj]+6.8:meshY(x,z)-1;pos.push(x,low,z);}
        for(let k=0;k<K-1;k++){const t2=a2*K+k,b3=base+k;idx.push(t2,t2+1,b3,t2+1,b3+1,b3);}
      }
      const col=[];for(let v=0;v<pos.length/3;v++){const k=v%K,top=v<J.length*K&&k>=2&&k<=6;
        const c=tmpC.setHex(top?(hash2(v,1)>.5?0x7f9a4a:0x8fa656):(hash2(v,2)>.5?0xb48a5a:0xa07a50));col.push(c.r,c.g,c.b);}
      const hg=new THREE.BufferGeometry();hg.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));
      hg.setAttribute('color',new THREE.Float32BufferAttribute(col,3));hg.setIndex(idx);
      world.add(new THREE.Mesh(flat(hg),psMat({vertexColors:true,side:THREE.DoubleSide})));
    }
    /* dark ceiling slab, so the inside reads as a cave and not the sky */
    const roofM=psMat({color:0x2c2822,side:THREE.DoubleSide});
    const pos=[],idx=[];
    for(let j=j0;j<=j1;j++){for(const o of [-(G.hw+2),G.hw+2])pos.push(G.X[j]+G.RX[j]*o,G.Y[j]+7.2,G.Z[j]+G.RZ[j]*o);}
    for(let k=0;k<j1-j0;k++){const q2=2*k;idx.push(q2,q2+1,q2+2,q2+1,q2+3,q2+2);}
    const rgm=new THREE.BufferGeometry();rgm.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));
    rgm.setIndex(idx);rgm.computeVertexNormals();world.add(new THREE.Mesh(rgm,roofM));
    /* lanterns hung inside so you can find the bend */
    const lamp=new THREE.InstancedMesh(flat(new THREE.BoxGeometry(.5,.7,.5)),psMat({color:0xffd27a,unlit:true}),20);
    let l=0;
    for(let j=j0+3;j<j1-1&&l<20;j+=6)for(const sg of [-1,1]){
      p.set(G.X[j]+G.RX[j]*sg*(G.hw+.6),G.Y[j]+4.2,G.Z[j]+G.RZ[j]*sg*(G.hw+.6));m4.compose(p,new THREE.Quaternion(),one);
      if(l<20)lamp.setMatrixAt(l++,m4);}
    lamp.count=l;lamp.instanceMatrix.needsUpdate=true;world.add(lamp);
    const sg=pixTex(64,32,g=>{g.fillStyle='#4a3c2c';g.fillRect(0,0,64,32);g.fillStyle='#f0e4c8';
      g.font='8px "Press Start 2P",monospace';g.textAlign='center';g.textBaseline='middle';g.fillText('GROTTAN',32,16);});
    const pl=new THREE.Mesh(new THREE.PlaneGeometry(4.2,2.1),psMat({map:sg,unlit:true,side:THREE.DoubleSide}));
    pl.position.set(G.X[j0],G.Y[j0]+8.6,G.Z[j0]);pl.rotation.y=Math.atan2(G.FX[j0],G.FZ[j0])+Math.PI;world.add(pl);
  }
  /* ── the cliff path the stones come down, and the warning signs ── */
  const warn=pixTex(64,64,g=>{
    g.fillStyle='#d8282a';g.beginPath();g.moveTo(32,3);g.lineTo(61,56);g.lineTo(3,56);g.closePath();g.fill();
    g.fillStyle='#f4d23a';g.beginPath();g.moveTo(32,13);g.lineTo(52,51);g.lineTo(12,51);g.closePath();g.fill();
    g.fillStyle='#222';g.fillRect(20,44,24,3);
    for(const [x,y,r] of [[26,38,4],[36,32,3],[40,40,3.5]]){g.beginPath();g.arc(x,y,r,0,6.3);g.fill();}
    g.font='7px "Press Start 2P",monospace';g.textAlign='center';g.fillStyle='#f4ecd8';g.fillText('STENRAS',32,63);
  });
  const wm=psMat({map:warn,unlit:true,side:THREE.DoubleSide,transparent:true,alphaTest:.5});
  for(const i of [268,276]){
    const v=at(i,-(HW+3.4));
    const post=new THREE.Mesh(flat(new THREE.CylinderGeometry(.1,.12,2.4,5)),psMat({color:0x9aa2a8}));post.position.set(v.x,v.y+1.2,v.z);world.add(post);
    const pl=new THREE.Mesh(new THREE.PlaneGeometry(2.2,2.2),wm);pl.position.set(v.x,v.y+3.1,v.z);pl.rotation.y=v.yaw+Math.PI;world.add(pl);
  }
  const pm=psMat({color:0x9a7a52});pm.polygonOffset=true;pm.polygonOffsetFactor=-1;pm.polygonOffsetUnits=-1;
  for(const i0 of VEN_ROCKS.map(r=>r[0])){
    for(let k=0;k<7;k++){                            /* a scar of bare clay down the slope */
      const l0=-(HW+5+k*3.2),l1=l0-3.2,a2=at(i0,l0),b2=at(i0,l1);
      const seg=new THREE.Mesh(new THREE.BoxGeometry(4.5,.15,3.6),pm);
      seg.position.set((a2.x+b2.x)/2,(a2.y+b2.y)/2+.15,(a2.z+b2.z)/2);seg.lookAt(b2.x,b2.y+.15,b2.z);world.add(seg);
    }
    const top=at(i0,-(HW+VEN_TOP+3));
    for(let k=0;k<4;k++){const r=new THREE.Mesh(flat(new THREE.DodecahedronGeometry(1.2+hash2(k,i0)*.6,0)),rockM);
      r.position.set(top.x+rand(-3,3),top.y+.6,top.z+rand(-3,3));world.add(r);}
  }
}
const VEN_ROCKS=[[288,10,1.2],[312,11.5,6.3]];       /* [sample, period, phase] */
const VEN_TOP=17;
/** boulders roll down the harbour cliff, across the road and off the edge into the sea */
function hazardsVen(H){
  const R=2.0;
  VEN_ROCKS.forEach(([i0,per,ph],n)=>{
    const m=new THREE.Mesh(flat(new THREE.DodecahedronGeometry(R,0)),psMat({color:0x8a7a62}));world.add(m);
    let rumbled=-1;
    H.push({id:'venRock'+n,period:per,phase:ph,mesh:m,
      update(u,dt){
        const L0=HW+VEN_TOP,L1=HW+26;
        let lat=-L0,roll=0,show=true;
        if(u>0.3&&u<0.5){                                 /* the warning: it rocks, dust pours off the lip */
          lat=-L0+Math.sin(clock*24)*.25;
          if(Math.random()<.35){const q=mainPt(i0,-L0+rand(-2,3));puff(q.x+rand(-2,2),meshY(q.x,q.z)+rand(0,2),q.z+rand(-2,2),.72,.6,.44,.8);}
          const cyc=Math.floor((raceTime+ph)/per);
          if(rumbled!==cyc&&state==='race'&&Math.hypot(player.x-sx[i0],player.z-sz[i0])<130){rumbled=cyc;venRumble(1-Math.hypot(player.x-sx[i0],player.z-sz[i0])/160);}
        }else if(u>=0.5&&u<0.86){const v=(u-0.5)/0.36;roll=Math.pow(v,1.25);lat=-L0+(L0+L1)*roll;}
        else if(u>=0.86)show=false;
        const q=mainPt(i0+roll*4,lat);
        let y=meshY(q.x,q.z)+R;
        if(Math.abs(lat)<HW+1)y=q.y+R;
        m.visible=show&&y>VEN_SEA-1;
        m.position.set(q.x,y,q.z);m.rotation.set(roll*30,q.yaw,0);
        this.p=show&&u>=0.5?{x:q.x,y:y-R,z:q.z}:null;
        if(show&&u>=0.5&&Math.random()<.5)puff(q.x+rand(-1,1),y-R+.3,q.z+rand(-1,1),.7,.6,.45,.5);
      },
      hit(k){return !k.rib&&this.p&&near3(k,this.p.x,this.p.y,this.p.z,R+1.1);},
      effect(k){k.spun=Math.max(k.spun,0.9*k.spinResist);k.boost=0;k.drift=0;k.charge=0;
        if(k===player){toast('STENRAS!');ping(160,60,.3);shake=Math.min(1,shake+.6);}}});
  });
  /* the ferry plods to Landskrona and back */
  const fg=new THREE.Group();
  const hb=(w,h,d,c,y,z)=>{const o=new THREE.Mesh(flat(new THREE.BoxGeometry(w,h,d)),psMat({color:c}));o.position.set(0,y,z||0);fg.add(o);};
  hb(9,3,32,0xeeebe2,1.2);hb(9.2,.8,32.4,0x2f5d8a,0);hb(7,3,12,0xeeebe2,4,-3);hb(1.4,3,1.4,0xc8321f,7,-3);
  world.add(fg);
  const A0=new THREE.Vector3(250,0,-160),A1=new THREE.Vector3(660,0,-330);
  H.push({id:'venFerry',period:120,phase:20,mesh:fg,update(u){
    const v=u<.5?smooth(0,.45,u):1-smooth(.5,.95,u);
    fg.position.lerpVectors(A0,A1,v);fg.position.y=VEN_SEA+.2;
    fg.rotation.y=Math.atan2(A1.x-A0.x,A1.z-A0.z)+(u<.5?0:Math.PI);}});
  /* the statue's plinth and the boulder: clip either and you scrape to a crawl */
  const T=ALTS.find(r=>r.id==='tycho');
  if(T){
    const j=Math.round(T.n*.58);
    H.push({id:'venGap',period:1,phase:0,update(){},
      hit(k){if(k.rib!==T.idx||Math.abs(k.si-j)>2)return false;
        return Math.abs(altLat(T,k.si,k.x,k.z))>T.hw-0.5;},
      effect(k){k.slow=Math.max(k.slow,0.7);k.vx*=0.6;k.vz*=0.6;k.boost=0;
        for(let n=0;n<8;n++)puff(k.x+rand(-1,1),k.y+rand(.3,1.2),k.z+rand(-1,1),.62,.6,.56,.5);
        if(k===player){toast('AJ, TYCHO!');ping(300,140,.15);shake=Math.min(1,shake+.35);}}});
  }
}
