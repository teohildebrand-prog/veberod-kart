"use strict";
/* ───────── Sibylla Burgarbus ───────── */
/* The bonus vehicle from the Sibylla track (js/29-sibylla.js): a low racing chassis shaped like a
   giant hamburger. Sesame bun, lettuce round the cockpit, cheese folded over the sides, a pickle
   for a steering wheel and a flag on a cocktail stick. Not anyone's own: every driver can take it.
   In a boost the top bun lifts, the lettuce flutters and the flag bends back. Looks only, like
   every vehicle: karts collide as points with a radius, so the tall bun has no bigger hitbox. */
Object.assign(VEHICLES,{
  burgarbus(add,paint,dark,steel,A){
    const bun=psMat({color:0xd8893a}),bunL=psMat({color:0xf0cf8e}),crumb=psMat({color:0xf4dfae}),
          patty=psMat({color:0x5a3220}),cheese=psMat({color:0xf2c43a}),lettuce=psMat({color:0x6cbf3a}),
          tomato=psMat({color:0xd8322a}),pickle=psMat({color:0x6e8a2a}),seed=psMat({color:0xfbf4e2}),
          stick=psMat({color:0xe8d8b0}),flagM=psMat({color:A.color,side:THREE.DoubleSide}),white=psMat({color:0xf6f4ee,side:THREE.DoubleSide});
    const S=1.3,T=1.08;                                                      /* the bun is an oval, longer than wide; the top a touch rounder */
    add(VB(1.7,.24,3.4),dark,0,.46,0);                                       /* the racing chassis underneath */
    const bot=add(VC(1.42,1.3,.5,14),bun,0,.86,0);bot.scale.z=S;            /* the bottom bun */
    const cut=add(VC(1.42,1.42,.06,14),bunL,0,1.12,0);cut.scale.z=S;
    const pt=add(VC(1.52,1.52,.3,14),patty,0,1.3,0);pt.scale.z=S;           /* the patty, wider than the bun */
    for(let n=0;n<10;n++){const a=n/10*6.283;                                  /* grill marks round the rim */
      add(VB(.06,.31,.3),psMat({color:0x3a2014}),Math.sin(a)*1.5,1.3,Math.cos(a)*1.5*S).rotation.y=a;}
    add(VB(2.3,.06,2.3),cheese,0,1.48,.15).rotation.y=Math.PI/4;               /* the cheese, square on a round burger */
    for(const g of [-1,1]){const c=add(VB(.06,.55,.9),cheese,g*1.54,1.26,.3);c.rotation.z=g*.18;   /* folded down over the sides */
      add(VB(.08,.3,.24),cheese,g*1.58,.98,.55);}
    for(const [x,z] of [[.7,1.4],[-.8,1.1],[.9,-1.2]]){const t=add(VC(.42,.42,.08,8),tomato,x,1.56,z);t.rotation.z=x>0?-.2:.2;}
    /* lettuce round the cockpit, leaves poking out past the patty */
    const leaves=[];
    for(let n=0;n<16;n++){const a=n/16*6.283,l=A.grp(Math.sin(a)*1.42,1.52,Math.cos(a)*1.42*S);l.rotation.y=a;
      A.put(l,VB(.7,.06,.5),lettuce,0,0,.12).rotation.x=-.35+(n%2)*.2;leaves.push(l);}
    /* the seat in the middle of the burger */
    add(VB(.9,.16,.7),dark,0,1.56,-.5);add(VB(.9,.6,.14),dark,0,1.86,-.88);
    /* the pickle steering wheel: a slice, seeds and all, on a short column */
    add(VC(.05,.05,.5,5),steel,0,1.62,.42).rotation.x=-.5;
    const pk=add(new THREE.TorusGeometry(.27,.075,5,10),pickle,0,1.82,.3);pk.rotation.x=Math.PI/2-.5;
    const pc=add(VC(.21,.21,.04,10),psMat({color:0xb8c860}),0,1.82,.3);pc.rotation.x=-.5;
    for(const [x,z] of [[.08,0],[-.08,0],[0,.08],[0,-.08]])add(VB(.03,.05,.03),psMat({color:0xe8e8b0}),x,1.86,.3+z*.9);
    /* the top bun, hinged behind the seat like a lid; it opens a little more in a boost */
    const lid=A.grp(0,1.6,-1.75);lid.rotation.x=-.9;lid.name='burgerLid';
    const dome=A.put(lid,new THREE.SphereGeometry(1.42,12,6,0,Math.PI*2,0,Math.PI/2),bun,0,0,1.42*T);dome.scale.set(1,.62,T);
    const under=A.put(lid,new THREE.CircleGeometry(1.42,12).rotateX(Math.PI/2),bunL,0,-.01,1.42*T);under.scale.set(1,1,T);
    for(let n=0;n<22;n++){const a=hash2(n,3)*6.283,r=Math.sqrt(hash2(n,7))*1.15,y=Math.sqrt(Math.max(0,1-(r/1.42)**2))*1.42*.62;
      A.put(lid,VB(.1,.05,.18),seed,Math.sin(a)*r,y+.02,1.42*T+Math.cos(a)*r*T).rotation.set(.2,a,0);}
    /* the flag on its cocktail stick, through the top of the bun */
    const pin=A.grp(0,.86,1.42*T,lid);pin.rotation.x=.9;                   /* stands upright when the lid is at rest */
    A.put(pin,VC(.035,.035,1.7,4),stick,0,.85,0);
    const flag=A.grp(0,1.6,0,pin);
    A.put(flag,new THREE.PlaneGeometry(.62,.4).translate(-.31,0,0),flagM,0,0,0);
    A.put(flag,new THREE.PlaneGeometry(.62,.1).translate(-.31,0,0),white,0,-.06,.005);
    /* the rear sticker */
    add(VB(1.5,.24,.02),psMat({map:plateTex(128,16,'NYGRILLAD. FELPARKERAD.','#1c1e24','#f6f4ee',5)}),0,.88,-1.86);
    for(const g of [-1,1])add(VC(.14,.14,.05,8),psMat({color:0xd5202a}),g*.95,.86,-1.84).rotation.x=Math.PI/2;   /* tail lamps */
    for(const g of [-1,1])add(VC(.15,.15,.05,8),psMat({color:0xfff2b0,unlit:true}),g*.75,.86,1.86).rotation.x=Math.PI/2;
    const st={};
    A.anim.push((k,dt)=>{
      const b=since(st,'b',k.boost>0)<.25;                                  /* a boost, or just after one */
      lid.rotation.x=lerp(lid.rotation.x,b?-1.15:-.9,.15);
      pin.rotation.x=-lid.rotation.x;                                       /* the stick stays upright */
      const fl=b?1:Math.min(1,Math.abs(k.speed)/30);
      flag.rotation.y=lerp(flag.rotation.y,-.2-fl*1.1+Math.sin(clock*(8+fl*10))*.12,.2);
      flag.rotation.z=-fl*.25;
      leaves.forEach((l,n)=>{l.children[0].rotation.x=-.35+(n%2)*.2+(b?Math.sin(clock*22+n*1.7)*.35:Math.sin(clock*3+n)*.03);});
    });
    return {fx:1.02,fz:1.5,rx:1.04,rz:-1.5,r:.5,rr:.56,fw:.5,rw:.56,hub:0xd5202a,hubK:.55,cy:.36,cz:-.25,noWheel:true};
  }
});
