"use strict";
/* ───────── fields ───────── */
const GROUND={
  fields:{cell:74,stripe:0.38,verge:0x968a6d,
    cols:[0xe0c11d,0xe0c11d,0xd6c488,0x74a24c,0x8cab55,0x7c6048,0x5f8a46,0xc4b36a]},
  town:{cell:34,stripe:0.95,verge:0x8e8a84,
    cols:[0x6f6a62,0x7b756c,0x5e7a49,0x8a8177,0x6b6259,0x88806f,0x4f6b3e]},
  waste:{cell:46,stripe:0.62,verge:0x5f564a,
    cols:[0x7a736a,0x6a6158,0x8a7c66,0x5a5248,0x8a5a33,0x4a453e,0x6e6a62,0x3e3a34]},
  park:{cell:38,stripe:0.8,verge:0xcbb98c,
    cols:[0xe0cc96,0xd8c489,0x6ea84e,0x8fbb55,0xc85a4a,0x3f7fbf,0xe8c33a,0xd8d2c4]},
  night:{cell:52,stripe:0.5,verge:0x55554f,
    cols:[0x2c3d2e,0x354832,0x2a3a2a,0x3d4c36,0x30404a,0x434b30,0x283624]},
  dunes:{cell:40,stripe:0.7,verge:0xd2c08e,
    cols:[0xe6d6a8,0xdccb98,0xd2c18a,0xa9ad62,0x9ca05a,0xe2d2a0,0xc8b984]}
};
const tmpC=new THREE.Color(), verge=new THREE.Color(0x968a6d);
function landColor(x,z,out){
  if(stage.ground==='sea'){
    out.setHex(0x2d5874);
    const w=Math.sin(x*0.052)*Math.cos(z*0.039)+Math.sin((x+z)*0.019)*0.7;
    const h={h:0,s:0,l:0};out.getHSL(h);
    out.setHSL(h.h,h.s,clamp(h.l+w*0.05,0.06,0.46));
    return;
  }
  const G=GROUND[stage.ground]||GROUND.fields;
  verge.setHex(G.verge);
  const cx=Math.floor(x/G.cell),cz=Math.floor(z/G.cell);
  const h=hash2(cx,cz);
  out.setHex(G.cols[Math.floor(h*G.cols.length)%G.cols.length]);
  const ang=hash2(cx+7.3,cz-2.1)*Math.PI;
  const stripe=Math.sin((x*Math.cos(ang)+z*Math.sin(ang))*G.stripe);
  const l=clamp(0.5+stripe*0.05+(hash2(cx*3.1,cz*1.7)-0.5)*0.09,0.08,0.92);
  const hsl={h:0,s:0,l:0};out.getHSL(hsl);
  out.setHSL(hsl.h,hsl.s,clamp(hsl.l+(l-0.5)*0.85,0.06,0.94));
  const v=1-smooth(HW+2.6,HW+11,latAt(x,z));
  if(v>0)out.lerp(verge,v*0.92);
  if(stage.shore&&stage.shore(x,z)<-2)out.setHex(0xe9dcb4);          /* the beach under the cliff */
  if(stage.land)stage.land(x,z,out);
}
/** Glimmingehus stands on a flat island inside its moat */
function castleMod(x,z){
  const C=stage.castle,d=Math.hypot(x-C[0],z-C[1]);
  if(d>64)return 0;
  const flatTo=4-rolls(x,z);                       /* the island sits at a fixed height */
  if(d<22)return flatTo;
  if(d<34)return flatTo-3.2;                        /* the moat */
  return flatTo*(1-smooth(34,64,d));
}
function buildTerrain(st){
  const S=(st.terrain&&st.terrain.size)||780, D=(st.terrain&&st.terrain.seg)||78;
  const g=new THREE.PlaneGeometry(S,S,D,D);g.rotateX(-Math.PI/2);
  const p0=g.attributes.position;
  for(let i=0;i<p0.count;i++)p0.setY(i,meshY(p0.getX(i),p0.getZ(i)));
  const ng=g.toNonIndexed();g.dispose();
  const p=ng.attributes.position,cnt=p.count,col=new Float32Array(cnt*3);
  for(let t=0;t<cnt;t+=3){
    const cx=(p.getX(t)+p.getX(t+1)+p.getX(t+2))/3;
    const cz=(p.getZ(t)+p.getZ(t+1)+p.getZ(t+2))/3;
    landColor(cx,cz,tmpC);
    for(let k=0;k<3;k++){col[(t+k)*3]=tmpC.r;col[(t+k)*3+1]=tmpC.g;col[(t+k)*3+2]=tmpC.b;}
  }
  ng.setAttribute('color',new THREE.BufferAttribute(col,3));
  ng.computeVertexNormals();
  world.add(new THREE.Mesh(ng,psMat({vertexColors:true})));
}
