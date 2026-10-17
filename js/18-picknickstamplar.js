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
      const i=d.i;x=sx[i]+rx[i]*d.lat;z=sz[i]+rz[i]*d.lat;y=groundAt(x,z,i)+1.4;yaw=Math.atan2(fx[i],fz[i]);
      const o=Math.sign(d.lat)*(HW+2.4);mx=sx[i]+rx[i]*o;mz=sz[i]+rz[i]*o;
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
  if(state!=='race')return;
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
