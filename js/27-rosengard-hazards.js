"use strict";
/* ───── Rosengård hazards: a football kicked out of the cage, a delivery moped on the zebra crossing ───── */
function hazardsRosengard(H){
  const K=rosL(),R=ALTS.find(r=>r.id==='bur');
  if(R){
    const i0=nearestGlobal(K.cx,K.cz);
    const s=Math.sign((K.cx-sx[i0])*rx[i0]+(K.cz-sz[i0])*rz[i0])||1;   /* which side the cage is on */
    const ball=new THREE.Group();
    const bt=pixTex(16,16,g=>{g.fillStyle='#f4f4f0';g.fillRect(0,0,16,16);g.fillStyle='#202022';
      for(const [x,y] of [[2,2],[10,1],[6,7],[1,11],[11,10]])g.fillRect(x,y,4,4);});
    const bm=new THREE.Mesh(flat(new THREE.IcosahedronGeometry(.95,1)),psMat({map:bt,unlit:true}));ball.add(bm);
    const sh=new THREE.Mesh(new THREE.CircleGeometry(.9,10).rotateX(-Math.PI/2),
      psMat({color:0x000000,transparent:true,opacity:.35,depthWrite:false}));
    world.add(ball);world.add(sh);
    const P0={x:K.cx,y:K.cy+.8,z:K.cz};
    const land=mainPt(i0,s*(HW+2.5)),rest=mainPt(i0,-s*(HW+11));
    const lerpP=(a,b,t)=>({x:a.x+(b.x-a.x)*t,z:a.z+(b.z-a.z)*t});
    const BH=[2.6,1.7,1.0,.5];
    H.push({id:'fotboll',period:8.5,phase:2,mesh:ball,
      update(u){
        let x,z,h=0,gy,vis=true;
        if(u<0.16){                                      /* volleyed high over the cage fence */
          const t=u/0.16,p=lerpP(P0,land,t);x=p.x;z=p.z;
          gy=lerp(P0.y-.8,meshY(land.x,land.z),t);h=.8+Math.sin(Math.PI*t)*13*(1-t*.25);
        }else if(u<0.5){                                 /* bouncing across the road */
          const t=(u-0.16)/0.34,l=lerp(s*(HW+2.5),-s*(HW+9),t);
          const q=mainPt(i0,l);x=q.x;z=q.z;gy=Math.max(q.y,meshY(q.x,q.z));
          const b=Math.min(3,Math.floor(t*4)),bt2=t*4-b;h=BH[b]*Math.sin(Math.PI*bt2);
        }else if(u<0.6){                                 /* rolls to the far kerb */
          const t=smooth(0.5,0.6,u),l=lerp(-s*(HW+9),-s*(HW+11),t);
          const q=mainPt(i0,l);x=q.x;z=q.z;gy=meshY(q.x,q.z);
        }else{x=rest.x;z=rest.z;gy=meshY(rest.x,rest.z);vis=u<0.93;}
        ball.visible=vis;sh.visible=vis;
        ball.position.set(x,gy+.95+h,z);sh.position.set(x,gy+.06,z);
        bm.rotation.x=u*40;bm.rotation.z=u*23;
        this.p={x,y:gy,z};this.h=h;this.on=vis&&u>0.12&&u<0.6;
      },
      hit(k){return !k.rib&&this.on&&this.h<1.7&&near3(k,this.p.x,this.p.y,this.p.z,1.9);},
      effect(k){k.spun=Math.max(k.spun,0.9*k.spinResist);k.boost=0;k.drift=0;k.charge=0;
        if(k===player){toast('BOLLEN!');ping(620,240,.18);shake=Math.min(1,shake+.45);}}});
  }
  /* the delivery moped waits at the zebra, blinks, then crosses; back again half a beat later */
  {
    const g=new THREE.Group();
    const bx=(w,h,d,c,x,y,z,un)=>{const m=new THREE.Mesh(flat(new THREE.BoxGeometry(w,h,d)),psMat({color:c,unlit:un}));m.position.set(x,y,z);g.add(m);return m;};
    bx(.5,.5,1.5,0xe8e4dc,0,.6,0);bx(.45,.25,.7,0x202224,0,.98,-.15);bx(.12,.7,.12,0x8d949a,0,1.1,.62);
    bx(.7,.08,.08,0x202224,0,1.45,.62);
    for(const z of [-.62,.62]){const w=new THREE.Mesh(flat(new THREE.CylinderGeometry(.3,.3,.18,8)),psMat({color:0x1e2022}));
      w.rotation.z=Math.PI/2;w.position.set(0,.3,z);g.add(w);}
    bx(.5,.7,.32,0x2f78b8,0,1.45,-.05);bx(.32,.32,.3,0xf2cf3a,0,2.0,-.05);   /* rider and helmet */
    bx(.62,.6,.62,0xf08a1c,0,1.45,-.72);                                   /* the delivery box */
    const lamp=bx(.2,.16,.2,0xffb020,0,1.84,-.72,true);
    g.scale.setScalar(1.25);world.add(g);
    const W0=HW+7;
    H.push({id:'matbud',period:15,phase:9,mesh:g,
      update(u){
        const half=u<0.5,v=half?u/0.5:(u-0.5)/0.5,from=half?-1:1;
        const t=smooth(0.24,0.66,v),l=from*W0*(1-2*t);
        const q=mainPt(K.mi,l);
        g.position.set(q.x,Math.max(q.y,meshY(q.x,q.z)),q.z);
        g.rotation.y=q.yaw+(from<0?Math.PI/2:-Math.PI/2);
        lamp.visible=(v<0.7&&Math.floor(clock*6)%2===0)||(v>0.9&&Math.floor(clock*6)%2===0);
        this.p=q;this.on=t>0.02&&t<0.98;
      },
      hit(k){return !k.rib&&this.on&&near3(k,this.p.x,this.p.y,this.p.z,2.1);},
      effect(k){k.slow=Math.max(k.slow,1.0);k.vx*=0.55;k.vz*=0.55;k.boost=0;
        if(k===player){toast('MATBUDET!');ping(900,500,.14);shake=Math.min(1,shake+.35);}}});
  }
}
