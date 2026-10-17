"use strict";
/* ───── Rosengård roadside: kerbside rails in Rosengård, bollards at Möllan, street lamps ───── */
function edgeRosengard(st){
  const K=rosL();
  const rail=psMat({color:0x4f7a5a}),blk=psMat({color:0x2c2e30}),pole=psMat({color:0x8d949a});
  const posts=rosInst(flat(new THREE.BoxGeometry(.12,1.0,.12)),rail,N);
  const rails=rosInst(flat(new THREE.BoxGeometry(.07,.09,1)),rail,N);
  const boll=rosInst(flat(new THREE.CylinderGeometry(.16,.18,.9,6)),blk,N);
  const lp=rosInst(flat(new THREE.CylinderGeometry(.1,.16,7.4,5)).translate(0,3.7,0),pole,N/8);
  const arm=rosInst(flat(new THREE.BoxGeometry(.1,.1,2.2)),pole,N/8);
  const head=rosInst(flat(new THREE.BoxGeometry(.5,.18,.9)),psMat({color:0xfff0c0,unlit:true}),N/8);
  const skip=(i,side)=>{
    const o=side*(HW+4.3),x=sx[i]+rx[i]*o,z=sz[i]+rz[i]*o;
    if(nearAlt(x,z,2.6)||rosNearPump(i,side,3)||rosCutAt(x,z))return true;
    for(const C of K.cuts)if(Math.min(Math.abs(i-C.i),N-Math.abs(i-C.i))<9)return true;
    if(side<0&&i>=28&&i<=60)return true;                                    /* the bus stop */
    if(Math.abs(i-K.mi)<5)return true;                                      /* the zebra crossing */
    return false;
  };
  const moll=(x,z)=>x<-55&&z>0;
  for(let i=0;i<N;i+=4)for(const side of [-1,1]){
    if(skip(i,side))continue;
    const o=side*(HW+4.3),x=sx[i]+rx[i]*o,z=sz[i]+rz[i]*o,y=meshY(x,z),yaw=Math.atan2(fx[i],fz[i]);
    if(moll(x,z)){boll.put(x,y+.45,z,0);continue;}
    posts.put(x,y+.5,z,yaw);
    const j=(i+2)%N,o2=o,x2=sx[j]+rx[j]*o2,z2=sz[j]+rz[j]*o2,y2=meshY(x2,z2),yw=Math.atan2(fx[j],fz[j]);
    if(skip((i+4)%N,side))continue;
    rails.put(x2,y2+.95,z2,yw,1,1,SEG*4+.1);rails.put(x2,y2+.5,z2,yw,1,1,SEG*4+.1);
  }
  for(let i=6;i<N;i+=22)for(const side of [-1,1]){
    if(skip(i,side))continue;
    const o=side*(HW+5.4),x=sx[i]+rx[i]*o,z=sz[i]+rz[i]*o,y=meshY(x,z);
    const ay=Math.atan2(-rx[i]*side,-rz[i]*side);          /* the arm reaches out over the road */
    lp.put(x,y,z,0);
    arm.put(x-rx[i]*side*1.0,y+7.3,z-rz[i]*side*1.0,ay);
    head.put(x-rx[i]*side*2.0,y+7.2,z-rz[i]*side*2.0,ay);
  }
  [posts,rails,boll,lp,arm,head].forEach(m=>m.done());
}
