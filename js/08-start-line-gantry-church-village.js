"use strict";
/* ───────── start line, gantry, church, village ───────── */
function gableRoof(w,d,h,color){
  const g=new THREE.Group();
  const slope=Math.hypot(d/2,h);
  const half=flat(new THREE.BoxGeometry(w,.22,slope));
  for(const s of [-1,1]){
    const m=new THREE.Mesh(half,psMat({color:color}));
    m.position.set(0,h/2,s*d/4);
    m.rotation.x=s*Math.atan2(h,d/2);
    g.add(m);
  }
  return g;
}
function house(w,d,wallH,wallCol,roofCol,roofH){
  const g=new THREE.Group();
  const body=new THREE.Mesh(flat(new THREE.BoxGeometry(w,wallH,d)),psMat({color:wallCol}));
  body.position.y=wallH/2;g.add(body);
  const r=gableRoof(w*1.12,d*1.12,roofH||2.6,roofCol);
  r.position.y=wallH;g.add(r);
  const trim=psMat({color:0xeceee8});
  for(const s of [-1,1]){
    const win=new THREE.Mesh(flat(new THREE.BoxGeometry(w*.7,wallH*.34,.12)),trim);
    win.position.set(0,wallH*.58,s*(d/2+.05));g.add(win);
  }
  return g;
}
function farm(x,z,rot){
  const g=new THREE.Group();
  const h=house(9,6.5,4,0x8b2b1c,0x3b3f44,3);h.position.set(0,0,0);g.add(h);
  const barn=house(16,9,6,0x8b2b1c,0x2f3338,4);barn.position.set(15,0,-9);g.add(barn);
  const silo=new THREE.Mesh(flat(new THREE.CylinderGeometry(2,2,11,8)),psMat({color:0xb9bdc0}));
  silo.position.set(26,5.5,-9);g.add(silo);
  const cap=new THREE.Mesh(flat(new THREE.ConeGeometry(2.3,1.8,8)),psMat({color:0x3b3f44}));
  cap.position.set(26,11.8,-9);g.add(cap);
  g.position.set(x,meshY(x,z),z);g.rotation.y=rot;
  world.add(g);
}
function buildStart(st){
  // checkered line
  const chk=pixTex(32,8,(g)=>{
    for(let y=0;y<2;y++)for(let x=0;x<8;x++){
      g.fillStyle=((x+y)%2)?'#e9eef2':'#181c22';g.fillRect(x*4,y*4,4,4);
    }
  });
  const geo=new THREE.PlaneGeometry(HW*2,3.2);geo.rotateX(-Math.PI/2);
  const m=new THREE.Mesh(geo,psMat({map:chk,unlit:true}));
  m.position.set(sx[0],sy[0]+.06,sz[0]);
  m.rotation.y=Math.atan2(fx[0],fz[0]);world.add(m);

  // timber gantry
  const wood=psMat({color:0x7a6047});
  const pg=flat(new THREE.BoxGeometry(1,9,1));
  for(const s of [-1,1]){
    const p=new THREE.Mesh(pg,wood);
    p.position.set(sx[0]+rx[0]*s*(HW+2.6),sy[0]+4.5,sz[0]+rz[0]*s*(HW+2.6));
    world.add(p);
  }
  const beam=new THREE.Mesh(flat(new THREE.BoxGeometry((HW+3.1)*2,1.9,1.1)),wood);
  beam.position.set(sx[0],sy[0]+9.3,sz[0]);
  beam.rotation.y=Math.atan2(fx[0],fz[0]);world.add(beam);

  const sign=pixTex(256,32,(g)=>{
    g.fillStyle='#0b2a4a';g.fillRect(0,0,256,32);
    g.fillStyle='#fecc02';g.font='16px "Press Start 2P",monospace';
    g.textAlign='center';g.textBaseline='middle';
    g.fillText(st.name,128,18);
  });
  for(const s of [0,Math.PI]){
    const pl=new THREE.Mesh(new THREE.PlaneGeometry((HW+3.1)*2,1.9),psMat({map:sign,unlit:true}));
    pl.position.set(sx[0]-fx[0]*Math.cos(s)*.6,sy[0]+9.3,sz[0]-fz[0]*Math.cos(s)*.6);
    pl.rotation.y=Math.atan2(fx[0],fz[0])+s;world.add(pl);
  }

  if(st.ground==='sea'||st.stand===false)return;   /* stand:false = the track brings its own spectators */
  // wooden grandstand
  const stand=new THREE.Group();
  for(let i=0;i<6;i++){
    const row=new THREE.Mesh(flat(new THREE.BoxGeometry(46,1.5,3)),psMat({color:i%2?0x7a6047:0x8d7154}));
    row.position.set(0,1.1+i*1.4,-i*3);stand.add(row);
  }
  const o=HW+12;
  stand.position.set(sx[0]+rx[0]*o,meshY(sx[0]+rx[0]*o,sz[0]+rz[0]*o),sz[0]+rz[0]*o);
  stand.rotation.y=Math.atan2(fx[0],fz[0])+Math.PI/2;
  world.add(stand);

  if(st.id!=='veberod')return;
  // whitewashed church with a black spire
  const ch=new THREE.Group();
  const nave=new THREE.Mesh(flat(new THREE.BoxGeometry(11,7,20)),psMat({color:0xe6e6df}));
  nave.position.y=3.5;ch.add(nave);
  const nr=gableRoof(12,21,3.6,0x2b2f33);nr.position.y=7;ch.add(nr);
  const tower=new THREE.Mesh(flat(new THREE.BoxGeometry(8,16,8)),psMat({color:0xe6e6df}));
  tower.position.set(0,8,-13);ch.add(tower);
  const spire=new THREE.Mesh(flat(new THREE.ConeGeometry(5.6,10,4)),psMat({color:0x22262a}));
  spire.position.set(0,21,-13);spire.rotation.y=Math.PI/4;ch.add(spire);
  const face=psMat({color:0x3b3f44});
  for(const s of [-1,1]){
    const clk=new THREE.Mesh(flat(new THREE.BoxGeometry(.2,2.4,2.4)),face);
    clk.position.set(s*4.1,12,-13);ch.add(clk);
  }
  const cpos=new THREE.Vector3(sx[0]-rx[0]*46-fx[0]*30,0,sz[0]-rz[0]*46-fz[0]*30);
  ch.position.set(cpos.x,meshY(cpos.x,cpos.z),cpos.z);
  ch.rotation.y=Math.atan2(fx[0],fz[0])+0.4;
  world.add(ch);

  // midsummer pole
  const pole=new THREE.Group();
  const mast=new THREE.Mesh(flat(new THREE.CylinderGeometry(.22,.28,11,6)),psMat({color:0x5f7f3c}));
  mast.position.y=5.5;pole.add(mast);
  const cross=new THREE.Mesh(flat(new THREE.BoxGeometry(6,.3,.3)),psMat({color:0x5f7f3c}));
  cross.position.y=9.2;pole.add(cross);
  for(const s of [-1,1]){
    const ring=new THREE.Mesh(flat(new THREE.TorusGeometry(1.15,.22,4,8)),psMat({color:0x6f9243}));
    ring.position.set(s*2.6,8.1,0);ring.rotation.x=Math.PI/2;pole.add(ring);
  }
  const mp=new THREE.Vector3(sx[0]+rx[0]*(HW+28),0,sz[0]+rz[0]*(HW+28));
  pole.position.set(mp.x,meshY(mp.x,mp.z),mp.z);world.add(pole);
}
