"use strict";
/* ───────── Bodil, Godisinspektören ───────── */
/* Teo's cocker spaniel. "Hon hör inte 'kom'. Hon hör en påse öppnas." She drives GRISÖRAT, a
   racing machine shaped like a curled pig-ear treat. Vehicle follows js/30-vehicles.js; the dog is
   jointed so her ears can stream in a boost and swing out in the corners, and so she can roll onto
   her back on the select turntable. Her item, BRÅK OCH TRÅK OCH SKRÅK, and her quirk are in
   js/37-brak-och-trak.js, which borrows bodilDog() for the flying tackle.
   A stylized take on Teo's photos (brown-and-white roan coat, a white stripe down the muzzle,
   soft brown eyes, enormous floppy ears); no photo is in the game. */

Object.assign(VEHICLES,{
  /* Grisörat: a curled pig-ear treat on a low racing chassis. The front curls up and over and
     bounces in a boost, the cockpit is padded like a dog bed in the driver's colour, the wheels
     are chunky, and the treat tin rattles on the back. */
  grisorat(add,paint,dark,steel,A){
    const treat=psMat({map:pixTex(32,32,g=>{g.fillStyle='#bf7a3e';g.fillRect(0,0,32,32);   /* dried ear: tan, veins, a dark rim */
            g.fillStyle='#d89a58';for(let n=0;n<6;n++){g.fillRect(4+n*5,0,2,32);g.fillRect(0,(n*11)%32,32,1);}
            g.fillStyle='#9a5a2a';g.fillRect(0,0,32,2);g.fillRect(0,30,32,2);
            g.fillStyle='#e8b878';for(let n=0;n<14;n++)g.fillRect((n*7)%32,(n*13+5)%32,2,1);})}),
          rim=psMat({color:0x8a4a22}),pad=paint,tuft=psMat({color:0xf0e2c4}),
          tin=psMat({color:0xc8322a}),gold=psMat({color:0xd8b04a}),
          label=psMat({map:plateTex(32,8,'GODIS','#c8322a','#f4ecd8')});
    add(VB(1.6,.24,3.0),dark,0,.42,-.05);                                 /* the racing chassis under it all */
    /* the ear itself: a cupped tub with the sides curling up, rounded at the back */
    add(VB(1.86,.4,2.3),treat,0,.78,-.25);
    for(const s of [-1,1]){add(VB(.46,.12,2.3),treat,s*1.02,1.0,-.25).rotation.z=-s*.55;
      add(VB(.08,.1,2.3),rim,s*1.2,1.13,-.25);}
    add(VC(.93,.93,.4,10),treat,0,.78,-1.4);
    add(VB(1.5,.08,.4),rim,0,.99,-1.9);
    /* the curl at the front: the ear rolls forward, up and back over itself */
    const curl=A.grp(0,.82,1.0);
    for(let n=0;n<8;n++){
      const a=n*.46,R=.36,w=1.78-n*.07;
      const s=A.put(curl,VB(w,.13,.28),n%3===2?rim:treat,0,R*(1-Math.cos(a)),.25+R*Math.sin(a));
      s.rotation.x=-a;
    }
    /* the padded cockpit: a little dog bed with button tufts */
    add(VB(1.08,.16,1.0),pad,0,1.02,-.88);
    add(VB(1.24,.5,.3),pad,0,1.2,-1.46);
    for(const s of [-1,1])add(VB(.26,.34,1.24),pad,s*.68,1.12,-.88);
    for(const [x,y,z] of [[-.3,1.32,-1.31],[.3,1.32,-1.31],[0,1.12,-1.31],[-.68,1.3,-.6],[.68,1.3,-.6],[-.68,1.3,-1.1],[.68,1.3,-1.1]])
      add(VB(.08,.08,.04),tuft,x,y,z);
    /* the treat tin, strapped on behind and rattling */
    const box=A.grp(0,1.42,-1.95);
    A.put(box,VC(.32,.32,.5,10),tin,0,0,0);
    A.put(box,VC(.34,.34,.18,10),label,0,.02,0);
    const lid=A.grp(0,.3,0,box);
    A.put(lid,VC(.35,.35,.09,10),gold,0,0,0);A.put(lid,VB(.2,.08,.08),gold,0,.08,0);
    add(VB(.9,.08,.14),dark,0,1.3,-1.82);
    for(const s of [-1,1])add(VB(.32,.14,.06),psMat({color:0xff3a2a,unlit:true}),s*.62,.86,-1.84);   /* the tail lights */
    A.anim.push((k)=>{
      const run=clamp(Math.abs(k.speed||0)/40,0,1),rough=!k.onRoad&&!k.air&&run>.1;
      if(k.boost>0){curl.rotation.x=Math.sin(clock*17)*.2;curl.position.y=.82+Math.abs(Math.sin(clock*17))*.14;}
      else{curl.rotation.x=lerp(curl.rotation.x,0,.2);curl.position.y=.82+Math.sin(clock*6)*.015*run;}
      const shake=(rough||k.boost>0?.07:.025)*run;                            /* the tin rattles, the lid hops */
      box.position.x=Math.sin(clock*31)*shake;box.rotation.z=Math.sin(clock*27)*shake*1.4;
      lid.position.y=.3+Math.abs(Math.sin(clock*23))*shake*1.6;
    });
    return {fx:1.0,fz:1.15,rx:1.02,rz:-1.25,r:.5,rr:.56,fw:.48,rw:.56,hub:0xf0e2c4,hubK:.55,cy:.06,cz:-.25};
  }
});

/** the dog herself, sitting, facing +z, the origin at her hips. Shared with the flying tackle.
    Returns the group and her moving parts. */
const bodilDog=(function(){
  let M=null;
  const speck=(base,dot,n,size)=>pixTex(size,size,g=>{g.fillStyle=base;g.fillRect(0,0,size,size);g.fillStyle=dot;
    for(let i=0;i<n;i++)g.fillRect((i*7+(i*i)%5)%size,(i*11+3)%size,1+(i%2),1);});
  function mats(){
    return M||(M={
      coat:psMat({map:speck('#b5693a','#ead8c0',22,16)}),                    /* roan: brown flecked with white */
      head:psMat({map:speck('#a85a2e','#e6c8a4',18,16)}),                    /* the brown face around the eyes */
      curl:psMat({map:pixTex(16,16,g=>{g.fillStyle='#d9a878';g.fillRect(0,0,16,16);g.fillStyle='#f0dcc0';
        for(let y=0;y<16;y+=3)for(let x=(y%2)*2;x<16;x+=4)g.fillRect(x,y,2,2);})}),
      ear:psMat({map:pixTex(16,16,g=>{g.fillStyle='#b06a3c';g.fillRect(0,0,16,16);g.fillStyle='#d9a476';   /* long curly ear */
        for(let y=1;y<16;y+=3)for(let x=0;x<16;x+=2)g.fillRect(x,y+(x%4?1:0),1,1);
        g.fillStyle='#ecdcc6';for(let i=0;i<8;i++)g.fillRect((i*5)%16,(i*7+2)%16,1,1);})}),
      white:psMat({map:speck('#fffaf2','#c98f62',5,8)}),
      bib:psMat({color:0xfffbf4}),
      iris:psMat({color:0x6a3a1a}),pupil:psMat({color:0x1a120c}),shine:psMat({color:0xffffff,unlit:true}),
      lid:psMat({color:0xb85a4a}),nose:psMat({color:0x7a4636}),dark:psMat({color:0x2a1a14})
    });
  }
  return ()=>{
    const m=mats(),g=new THREE.Group(),B=(w,h,d)=>flat(new THREE.BoxGeometry(w,h,d));
    const put=(p,geo,mat,x,y,z)=>{const e=new THREE.Mesh(geo,mat);e.position.set(x,y,z);p.add(e);return e;};
    const body=new THREE.Group();g.add(body);
    put(body,B(.84,.4,.72),m.coat,0,.16,-.08);                               /* haunches on the seat */
    for(const s of [-1,1])put(body,B(.2,.14,.34),m.white,s*.3,.04,.32);      /* hind feet */
    put(body,B(.68,.72,.5),m.coat,0,.6,.02).rotation.x=.12;                  /* sitting up straight */
    put(body,B(.46,.56,.06),m.bib,0,.6,.29).rotation.x=.12;                  /* the white chest */
    const tail=new THREE.Group();tail.position.set(0,.24,-.44);body.add(tail);
    put(tail,B(.13,.13,.34),m.ear,0,0,-.15);
    const legs=[];
    for(const s of [-1,1]){                                                  /* front paws up on the wheel */
      const sh=new THREE.Group();sh.position.set(s*.2,.82,.2);body.add(sh);
      put(sh,B(.17,.86,.19),m.coat,0,-.43,0);
      put(sh,B(.21,.13,.27),m.white,0,-.88,.06);
      sh.rotation.x=-1.05;legs.push(sh);
    }
    /* the head: roan, curly on top, the white stripe down to a white freckled muzzle */
    const head=new THREE.Group();head.position.set(0,1.06,.12);body.add(head);
    put(head,B(.5,.44,.46),m.head,0,.06,0);
    put(head,B(.5,.16,.46),m.curl,0,.3,-.02);
    for(const [x,z] of [[-.16,.16],[.14,.18],[0,-.18]])put(head,B(.14,.1,.14),m.curl,x,.4,z);
    put(head,B(.12,.38,.04),m.bib,0,.12,.235);                               /* the stripe */
    const eyes=[],lids=[],brows=[];
    for(const s of [-1,1]){
      const e=new THREE.Group();e.position.set(s*.14,.1,.235);head.add(e);
      put(e,B(.11,.09,.03),m.iris,0,0,0);
      put(e,B(.05,.05,.02),m.pupil,0,0,.016);
      put(e,B(.025,.025,.01),m.shine,-s*.02,.02,.026);
      put(e,B(.1,.02,.02),m.lid,0,-.052,.008);                               /* the droopy lower lid */
      eyes.push(e);
      const l=put(head,B(.12,.1,.03),m.head,s*.14,.1,.245);l.visible=false;lids.push(l);   /* shut, asleep */
      const b=put(head,B(.12,.035,.03),m.curl,s*.14,.175,.245);b.rotation.z=-s*.25;brows.push(b);   /* the worried brow */
    }
    put(head,B(.3,.26,.36),m.white,0,-.06,.4);                               /* the muzzle */
    put(head,B(.16,.11,.08),m.nose,0,.01,.6);
    for(const s of [-1,1]){put(head,B(.04,.03,.02),m.dark,s*.035,.0,.645);
      put(head,B(.1,.14,.26),m.white,s*.12,-.17,.38);}                       /* the flews */
    const ears=[];
    for(const s of [-1,1]){                                                  /* enormous, floppy, curly */
      const e=new THREE.Group();e.position.set(s*.28,.16,-.08);head.add(e);
      put(e,B(.09,.74,.32),m.ear,0,-.36,0);
      put(e,B(.11,.2,.36),m.ear,0,-.66,0);
      e.rotation.z=s*.12;ears.push({e,s});
    }
    const D={g,body,head,ears,legs,eyes,lids,brows,tail};
    g.userData.bodil=D;D.earL=ears[0].e;D.earR=ears[1].e;                    /* for tracks and celebrations */
    return D;
  };
})();
/** her favourite pose: rolled onto her back, paws in the air, u from sitting (0) to asleep (1).
    Leaves the ears to the caller. t, if given, makes her breathe. */
function bodilSleep(D,u,t){
  const e=clamp(u,0,1),a=e*e*(3-2*e);
  D.body.rotation.x=-1.45*a;D.body.rotation.z=.25*a*Math.sin(e*Math.PI);
  D.body.position.set(0,.5*a,-.2*a);
  for(const L of D.legs)L.rotation.x=lerp(-1.05,-2.7,a);
  D.head.rotation.x=-.3*a;D.head.rotation.z=.35*a;
  const shut=a>.9;
  for(const v of D.eyes)v.scale.set(1,shut?.2:1,1);for(const l of D.lids)l.visible=shut;
  D.body.scale.set(1,shut&&t!=null?1+Math.sin(t*2.2)*.02:1,1);
}

/** Bodil in her seat. Racing, the ears stream back in a boost and swing out in the corners. On the
    starting grid she looks perfectly innocent; at green she stares hard at something nobody else
    can see, and does again now and then. While her own item is out the seat is empty (the item
    flies her). On the select turntable she sits nicely, hears a bag, and rolls onto her back. */
function buildBodil(cab,skin,dark,anim){
  const D=bodilDog();D.g.position.set(0,.9,-.62);D.g.name='bodil';cab.add(D.g);
  const ease=u=>{u=clamp(u,0,1);return u*u*(3-2*u);};
  const st={t:0,last:-9};
  const rest=()=>{
    D.body.rotation.set(0,0,0);D.body.position.set(0,0,0);D.body.scale.set(1,1,1);D.head.rotation.set(0,0,0);
    for(const L of D.legs)L.rotation.set(-1.05,0,0);
    for(const e of D.eyes)e.scale.set(1,1,1);for(const l of D.lids)l.visible=false;
    D.brows.forEach((b,i)=>{b.position.y=.175;b.rotation.z=(i?-1:1)*.25;});
  };
  /* the faces: innocent (big eyes, brows up), focused (narrow eyes, ears up), asleep (eyes shut) */
  const innocent=a=>{for(const e of D.eyes)e.scale.set(1+.15*a,1+.35*a,1);D.brows.forEach(b=>b.position.y=.175+.04*a);};
  const focused=a=>{for(const e of D.eyes)e.scale.set(1,1-.55*a,1);D.brows.forEach((b,i)=>b.rotation.z=(i?-1:1)*(.25-.6*a));};
  anim.push((k,dt)=>{
    dt=dt||0;rest();
    D.g.visible=!k.dogOut;
    const sp=Math.abs(k.speed||0),run=clamp(sp/40,0,1),preview=previewOn&&k===player;
    const steer=preview?0:clamp(k.ai?(k.aiSteer||0):input.steer,-1,1);
    let earX,earZ=-steer*.75*run,perk=0;
    if(k.boost>0)earX=1.35+Math.sin(clock*38)*.12;                    /* streaming straight back */
    else earX=run*.5+Math.sin(clock*6)*.05*run;
    /* the starting grid: innocent. Green: focused on nothing at all, and again every so often */
    const back=clock-(k.dogBack==null?-9:k.dogBack);
    if(!preview&&back<1.8)innocent(1-ease((back-1.4)/.4));               /* landed: as if nothing happened */
    else if(!preview&&state==='grid'){innocent(1);D.head.rotation.z=.18+Math.sin(clock*1.3)*.05;D.tail.rotation.y=Math.sin(clock*9)*.5;}
    else if(!preview&&state==='race'&&(raceTime<3.2||(raceTime>6&&raceTime%11<1.2))){
      const side=raceTime<3.2?1:(Math.floor(raceTime/11)%2?-1:1);
      focused(1);D.head.rotation.y=.62*side;D.head.rotation.x=.12;D.body.rotation.x=.08;perk=1;
    }
    if(k.dogWarn>0){                                                   /* the leap coming: down on the haunches */
      const u=1-k.dogWarn/.38;D.body.position.y=-.14*ease(u*2);D.body.rotation.x=.3*ease(u*2);
      focused(1);perk=1;for(const L of D.legs)L.rotation.x=-.6;
    }
    if(perk){earX=Math.min(earX,-.1);earZ*=.5;}
    if(preview){                                                       /* the turntable */
      if(clock-st.last>.25)st.t=0;
      st.last=clock;st.t+=dt;const t=st.t%10;
      if(t<2.4){innocent(1);D.head.rotation.z=Math.sin(t*1.6)*.22;D.tail.rotation.y=Math.sin(t*10)*.45;}
      else if(t<3.6){                                                  /* somewhere, a bag rustles */
        const u=ease((t-2.4)/.25);focused(u);D.head.rotation.y=-.7*u;D.head.rotation.x=-.12*u;perk=1;earX=-.25;earZ=.2;
      }else{                                                           /* and down she goes, belly up */
        const u=(t-3.6)/.9;bodilSleep(D,u,t);                            /* asleep, breathing */
        earX=-.9*ease(u);earZ=0;
      }
    }
    for(const {e,s} of D.ears){
      e.rotation.x=lerp(e.rotation.x,earX,.3);
      e.rotation.z=lerp(e.rotation.z,s*(.12+perk*.2)+earZ,.3);
    }
  });
}
