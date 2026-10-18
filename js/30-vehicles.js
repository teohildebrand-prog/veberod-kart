"use strict";
/* ───────── vehicles ───────── */
/* Every driver's own vehicle, readable from its silhouette alone: one dominant shape, one main
   colour and one animated prop each. Everything here is looks only: karts collide as points
   with a radius, so a bicycle, a sail or a fin never touches the scenery.
   Each builder gets (add, paint, dark, steel, A) like buildBody and returns the wheel layout.
   A.grp/A.put make sub-groups that can move, A.anim takes f(k,dt) run every drawn frame,
   A.lamps are the roof lights the loop flashes, A.twin is the AI twin's variant. */
const VB=(w,h,d)=>new THREE.BoxGeometry(w,h,d);
const VC=(rt,rb,h,n)=>new THREE.CylinderGeometry(rt,rb,h,n||8);
/** a small text panel, drawn at PS1 resolution */
function plateTex(w,h,text,fg,bg,px){
  return pixTex(w,h,g=>{g.fillStyle=bg;g.fillRect(0,0,w,h);g.fillStyle=fg;
    g.font=(px||5)+'px "Press Start 2P",monospace';g.textAlign='center';g.textBaseline='middle';
    g.fillText(text,w/2,h/2+.5);});
}
/** seconds since a kart flag last went up; st keeps the memory per rig */
function since(st,key,on){if(on)st[key]=clock;return st[key]==null?99:clock-st[key];}
const hexCss=c=>'#'+c.toString(16).padStart(6,'0');

const VEHICLES={
  /* Bonden Arne: Österlen Åkerloppa, a farm buggy made of old farm machinery */
  aker(add,paint,dark,steel,A){
    const wood=psMat({color:0x9a6a3a}),woodD=psMat({color:0x6e4a26}),rust=psMat({color:0x7a4a2e});
    const ch=A.grp(0,0,0);                                /* the sprung part: it bounces, Arne doesn't */
    A.put(ch,VB(1.25,.28,4.0),paint,0,.62,-.1);           /* narrow ladder chassis */
    A.put(ch,VB(1.05,.36,.8),paint,0,.74,1.95).rotation.x=-.18;
    A.put(ch,VB(.9,.5,.8),dark,0,1.0,1.15);                /* the exposed engine */
    for(const x of [-.24,0,.24])A.put(ch,VC(.1,.1,.24,6),steel,x,1.34,1.15);
    A.put(ch,VC(.06,.06,.9,5),rust,.4,1.5,.95).rotation.x=-.25;   /* exhaust stack */
    A.put(ch,VB(.95,.1,.85),steel,0,.86,-.85);              /* battered metal seat */
    A.put(ch,VB(.95,.8,.1),steel,0,1.3,-1.27).rotation.x=-.15;
    for(const x of [-.6,.6])A.put(ch,VB(.08,.08,1.7),rust,x,.98,-.2);  /* side rails */
    /* one crooked headlamp */
    const lamp=A.put(ch,VC(.2,.2,.18,8),psMat({color:0xfff2b0,unlit:true}),.36,1.08,2.38);
    lamp.rotation.x=Math.PI/2;lamp.rotation.z=.35;
    A.put(ch,VB(.08,.4,.08),rust,.36,.88,2.3).rotation.z=.35;
    /* a spade strapped along the left */
    A.put(ch,VB(.07,.07,1.8),wood,-.72,1.02,.15);
    A.put(ch,VB(.05,.34,.36),steel,-.72,1.02,1.2);
    /* the vegetable crate */
    A.put(ch,VB(1.15,.62,.82),wood,0,1.2,-1.85);
    for(const y of [1.0,1.2,1.4])A.put(ch,VB(1.17,.05,.84),woodD,0,y,-1.85);
    for(const [x,z] of [[-.3,-1.7],[.25,-2.0],[.05,-1.75]])
      A.put(ch,new THREE.SphereGeometry(.19,6,4),psMat({color:0x5fa83a}),x,1.58,z);  /* cabbages */
    for(const [x,z] of [[.35,-1.65],[-.32,-2.02]]){
      const c=A.put(ch,new THREE.ConeGeometry(.07,.42,5),psMat({color:0xe8761e}),x,1.66,z);c.rotation.x=.5;}
    /* the wind vane, spinning furiously in a boost */
    A.put(ch,VC(.03,.03,1.3,4),steel,.5,2.1,-2.1);
    const vane=A.grp(.5,2.78,-2.1,ch);
    A.put(vane,VB(.08,.16,.7),paint,0,0,-.4);                /* tail */
    const rot=A.grp(0,0,.08,vane);
    for(let n=0;n<4;n++){const b=A.put(rot,VB(.09,.42,.03),psMat({color:0xe8e2d0}),0,.22,0);
      const p=new THREE.Group();p.rotation.z=n*Math.PI/2;rot.add(p);p.add(b);}
    A.anim.push((k,dt)=>{
      rot.rotation.z+=dt*(k.boost>0?40:3+Math.abs(k.speed)*.15);
      vane.rotation.y=Math.sin(clock*.7)*.25;
      const rough=!k.onRoad&&!k.air&&Math.abs(k.speed)>4;
      ch.position.y=lerp(ch.position.y,rough?Math.abs(Math.sin(clock*17))*.12:0,.4);
    });
    return {fx:.88,fz:1.6,rx:.98,rz:-1.35,r:.5,rr:.6,rw:.56,fw:.48,cy:.12,cz:-.3};
  },

  /* Polisen Billy Bool: Landsvägspatrullen, a comically shortened pursuit estate */
  patrull(add,paint,dark,steel,A){
    const white=psMat({color:0xf2f4f6}),glass=psMat({color:0x2b3a4a});
    add(VB(2.3,.72,4.1),white,0,.8,0);
    add(VB(2.34,.2,4.0),paint,0,.96,0);                      /* the blue band */
    add(VB(2.2,.3,1.25),white,0,1.3,1.4);                     /* square nose */
    add(VB(2.0,.3,.1),dark,0,1.0,2.06);                       /* grille */
    add(VB(2.44,.2,.36),dark,0,.34,2.06);                     /* bumper on the tarmac */
    for(const g of [-.78,.78])add(VB(.42,.24,.1),psMat({color:0xf6f2d8,unlit:true}),g,1.24,2.06);
    add(VB(2.0,.62,.08),glass,0,1.72,.72).rotation.x=-.32;    /* broad windscreen */
    add(VB(2.2,.95,1.55),white,0,1.62,-1.3);                  /* the estate end, cut short */
    add(VB(2.24,.2,1.58),paint,0,1.62,-1.3);
    add(VB(2.0,.45,.06),glass,0,1.78,-2.08);
    for(const g of [-.85,.85])add(VB(.4,.24,.08),psMat({color:0xc83a2a}),g,1.2,-2.08);
    add(VB(1.9,.1,.5),dark,0,2.14,-1.0);                      /* light bar, oversized */
    A.lamps.push(add(VB(.8,.32,.46),psMat({color:0x2f78e8,unlit:true}),-.5,2.36,-1.0));
    A.lamps.push(add(VB(.8,.32,.46),psMat({color:0x2f78e8,unlit:true}), .5,2.36,-1.0));
    add(VB(1.7,.26,.42),psMat({color:0x1a2a52}),0,2.3,-1.0);
    /* the rear display: dark until he drops something */
    const disp=add(VB(1.2,.3,.06),psMat({map:plateTex(32,8,'STANNA!','#ffb020','#120c06')}),0,1.32,-2.1);disp.visible=false;
    const off=add(VB(1.2,.3,.05),psMat({color:0x120c06}),0,1.32,-2.09);
    /* ticket printer by the wheel and its paper strip */
    add(VB(.3,.2,.3),psMat({color:0x4a4e56}),.62,1.42,.35);
    const strip=A.grp(.62,1.46,.2);
    const paper=A.put(strip,VB(.16,.02,1),psMat({color:0xf8f6ee}),0,0,-.5);void paper;
    strip.scale.z=.05;
    A.anim.push(k=>{
      const t=k.usedAt==null?99:clock-k.usedAt,on=t<2.2&&Math.floor(clock*6)%2===0;
      disp.visible=on;off.visible=!on;
      strip.scale.z=lerp(strip.scale.z,k.boost>0?2.2:.05,k.boost>0?.04:.2);
      strip.rotation.x=k.boost>0?Math.sin(clock*24)*.12-.25:0;
    });
    return {fx:1.06,fz:1.35,rx:1.06,rz:-1.38,r:.42,fw:.26,rw:.28,cy:.3,cz:-.2};
  },

  /* Kossan Majros: Veberöd Mjölkexpress, a milk tanker built round a cow-sized cockpit */
  mjolk(add,paint,dark,steel,A){
    const base=hexCss(A.color);
    const patch=pixTex(16,16,g=>{g.fillStyle=base;g.fillRect(0,0,16,16);g.fillStyle='#1b1a1c';
      g.fillRect(2,2,5,4);g.fillRect(3,6,3,2);g.fillRect(10,9,5,5);g.fillRect(9,11,2,2);g.fillRect(12,1,3,2);});
    const hide=psMat({map:patch}),tankM=psMat({color:0xdfe6ec}),chrome=psMat({color:0xc6ced6});
    add(VB(2.1,.6,4.4),hide,0,.72,0);
    add(VB(1.9,.66,1.3),hide,0,1.18,1.5);                     /* short rounded cab nose */
    add(VC(.33,.33,1.9,8),hide,0,1.18,2.15).rotation.z=Math.PI/2;
    add(VB(2.0,.12,.3),chrome,0,.6,2.3);
    for(const g of [-.66,.66])add(VC(.17,.17,.1,8),psMat({color:0xfff2b0,unlit:true}),g,1.2,2.48).rotation.x=Math.PI/2;
    for(const g of [-1,1])add(VB(.2,.62,1.5),hide,g*.98,1.24,-.1);  /* high doors round the hooves */
    /* the polished tank rocks through corners; its gauge wobbles */
    const tank=A.grp(0,1.62,-1.95);
    A.put(tank,VC(.78,.78,2.0,10),tankM,0,0,0).rotation.x=Math.PI/2;
    for(const z of [-.85,.85])A.put(tank,VC(.82,.82,.12,10),chrome,0,0,z).rotation.x=Math.PI/2;
    A.put(tank,VC(.22,.22,.18,8),chrome,0,.82,0);           /* filler cap */
    A.put(tank,VC(.22,.22,.04,8),psMat({color:0xf8f8f2}),0,.3,1.02).rotation.x=Math.PI/2;
    const needle=A.grp(0,.3,1.05,tank);
    A.put(needle,VB(.03,.18,.02),psMat({color:0xd82a2a}),0,.07,0);
    add(VB(1.6,.3,2.1),dark,0,1.0,-1.95);                     /* the cradle */
    /* two churn-shaped exhausts, foaming in a milk boost */
    const churns=[];
    for(const g of [-.62,.62]){
      add(VC(.2,.2,.42,8),chrome,g,1.0,-2.55);
      add(VC(.12,.2,.14,8),chrome,g,1.28,-2.55);
      churns.push(add(VC(.13,.13,.1,8),dark,g,1.38,-2.55));
    }
    const wp=new THREE.Vector3(),st={n:0};
    A.anim.push(k=>{
      tank.rotation.z=lerp(tank.rotation.z,-k.lean*1.6+(k.ai?k.aiSteer:input.steer)*.06,.12);
      needle.rotation.z=Math.sin(clock*9)*.25+Math.sin(clock*23)*.12-(k.ai?k.aiSteer:input.steer)*.5;
      if(k.boost>0&&(st.n++&1)===0)for(const c of churns){c.getWorldPosition(wp);puff(wp.x,wp.y+.1,wp.z,.98,.98,.95,.7);}
    });
    const hoof=psMat({color:0x2a2420}),notch=psMat({color:0xf0ece2});
    return {fx:1.1,fz:1.45,rx:1.1,rz:-1.6,r:.5,fw:.56,rw:.6,cy:.34,cz:-.2,
      wheel(w,r,wd){const h=new THREE.Mesh(flat(VC(r*.62,r*.62,wd+.05,8).rotateZ(Math.PI/2)),hoof);w.add(h);
        const n=new THREE.Mesh(flat(VB(wd+.07,r*.6,.08)),notch);w.add(n);}};
  },

  /* Teo: Flyinge Fullgas, a prototype someone kept making faster instead of finishing */
  flyinge(add,paint,dark,steel,A){
    const sd=A.twin?-1:1;                                  /* Teodor's car is unfinished on the other side */
    const primer=psMat({color:0x8a8e92}),bolt=psMat({color:0xd8dde2});
    add(VB(2.2,.4,4.6),paint,0,.55,0);
    add(VB(2.0,.24,1.7),paint,0,.6,2.0).rotation.x=-.16;      /* the wedge */
    add(VB(2.24,.12,.4),dark,0,.38,2.7);
    for(const g of [-1,1])add(VB(.42,.42,2.2),paint,g*.95,.88,-.2);
    add(VB(.07,.38,1.5),primer,sd*1.17,.86,-.1);              /* replacement door, primer grey */
    for(const z of [-1.0,-.4,.2,.8])for(const g of [-1,1])add(VB(.06,.06,.06),bolt,g*1.17,1.06,z);
    for(const z of [1.3,1.9,2.4])for(const g of [-.8,.8])add(VB(.06,.06,.06),bolt,g,.78,z);
    for(const [c,x] of [[0xd8362a,-.72],[0xf0c030,-.66],[0x22c46a,.7]])
      add(VB(.04,.04,1.2),psMat({color:c}),x,1.13,-.3).rotation.y=x*.15;   /* cables tucked round the cockpit */
    /* exposed rear engine */
    add(VB(1.3,.55,1.1),dark,0,1.0,-1.55);
    for(const g of [-.35,.35])add(VC(.12,.12,.9,6),steel,g,1.15,-2.35).rotation.x=Math.PI/2;
    add(VC(.28,.32,.3,8),steel,0,1.42,-1.45);               /* air intake */
    /* enormous rear wing, shuddering at full speed */
    const wing=A.grp(0,1.0,-2.45);                         /* low enough to see Teo over it */
    A.put(wing,VB(3.0,.1,.9),paint,0,.56,0);
    A.put(wing,VB(3.0,.08,.4),sd>0?primer:paint,0,.7,-.35);
    for(const g of [-1,1]){A.put(wing,VB(.1,.5,.3),dark,g*.62,.28,0);A.put(wing,VB(.08,.7,1.0),dark,g*1.5,.5,0);}
    /* dashboard screen: DET FUNKADE NYSS after a hit */
    const scr=add(VB(.6,.2,.05),psMat({map:plateTex(48,12,'DET FUNKADE NYSS','#5cff7a','#0a140c',5),unlit:true}),0,1.18,.9);scr.visible=false;
    const blank=add(VB(.6,.2,.04),psMat({color:0x0a140c}),0,1.18,.91);
    const st={};
    A.anim.push(k=>{
      const t=since(st,'hit',k.spun>0);
      scr.visible=t<3&&Math.floor(clock*3)%3!==0;blank.visible=!scr.visible;
      const f=clamp((Math.abs(k.speed)/(k.maxSpeed||40)-.8)/.2,0,1);
      wing.rotation.x=Math.sin(clock*47)*.07*f+(k.boost>0?Math.sin(clock*31)*.05:0);
      wing.rotation.z=Math.sin(clock*39)*.03*f;
    });
    return {fx:1.0,fz:1.75,rx:1.22,rz:-1.45,r:.32,rr:.64,rw:.74,fw:.34,cy:-.08,cz:-.15};
  },

  /* Amanda: Lerum Linje, a touring estate prepared with suspicious competence */
  lerum(add,paint,dark,steel,A){
    const cream=psMat({color:0xefe6cf}),glass=psMat({color:0x2b3a4a}),chrome=psMat({color:0xc6ced6});
    add(VB(2.3,.82,4.4),paint,0,.84,0);
    add(VB(2.2,.3,1.3),paint,0,1.38,1.5);
    for(const z of [1.4,-1.4])for(const g of [-1,1])add(VB(.14,.36,1.2),paint,g*1.2,.92,z);  /* neat arches */
    add(VB(2.36,.18,.3),chrome,0,.56,2.24);
    add(VB(2.36,.18,.3),chrome,0,.56,-2.24);
    for(const g of [-.78,.78])add(VB(.46,.22,.08),psMat({color:0xf6f2d8,unlit:true}),g,1.16,2.22);
    for(const g of [-.85,.85])add(VB(.42,.22,.08),psMat({color:0xc83a2a}),g,1.16,-2.22);
    add(VB(1.96,.42,.06),psMat({color:0x9fc8e8,transparent:true,opacity:.35,depthWrite:false}),0,1.72,.72).rotation.x=-.3;
    add(VB(2.0,.06,.1),cream,0,1.94,.66);
    add(VB(2.2,.86,1.75),paint,0,1.68,-1.38);                /* the estate end */
    add(VB(2.28,.12,1.85),cream,0,2.16,-1.38);                /* cream roof */
    add(VB(2.0,.42,.06),glass,0,1.82,-2.27);
    add(VB(1.4,.38,1.3),cream,0,2.42,-1.4);                   /* roof box */
    for(const z of [-1.8,-1.0])add(VB(1.44,.04,.06),dark,0,2.62,z);
    add(VB(.7,.4,.5),psMat({color:0xb07a3a}),.55,1.34,-2.0);  /* picnic luggage, strapped */
    add(VB(.72,.05,.52),dark,.55,1.5,-2.0);
    add(VC(.09,.09,.36,8),chrome,.66,1.38,.4);              /* thermos in its holder */
    add(VC(.1,.1,.04,8),dark,.66,1.58,.4);
    /* the wiper: calmly clears the splat after a messy hit */
    const splat=add(VB(.7,.3,.04),psMat({color:0x8a5a2a}),-.35,1.7,.78);splat.rotation.x=-.3;splat.visible=false;
    const wip=A.grp(-.2,1.52,.8);wip.rotation.x=-.3;
    A.put(wip,VB(.03,.42,.03),dark,0,.21,0);
    const st={};
    A.anim.push(k=>{
      const t=since(st,'mess',k.spun>0||k.slick>0||k.slow>0.3);
      splat.visible=t<.6;
      wip.rotation.z=t<1.8?Math.sin(t*7)*1.1:0;
      k.v.lean.rotation.z*=.5;                             /* restrained body roll */
    });
    return {fx:1.2,fz:1.45,rx:1.2,rz:-1.45,r:.46,cy:.3,cz:-.25};
  },

  /* Victor: Veberöd Original, a proper racing kart with a few improvements of his own */
  original(add,paint,dark,steel,A){
    const burg=psMat({color:0x7a1f30}),blk=psMat({color:0x15161a}),tape=psMat({color:0xb8bcc2});
    const num=psMat({map:plateTex(16,16,'13','#15161a','#f6f5f0',8)});
    add(VB(1.5,.1,3.3),dark,0,.3,-.1);                       /* the frame, low and wide */
    for(const g of [-1,1]){                                  /* side pods: white, a burgundy flash, black below */
      add(VB(.4,.32,1.5),paint,g*1.0,.48,-.05);
      add(VB(.42,.08,1.52),burg,g*1.0,.6,-.05);
      add(VB(.42,.1,1.52),blk,g*1.0,.34,-.05);
      add(VB(.03,.3,.3),num,g*1.215,.5,.2);                  /* 13 on both sides */
    }
    /* the angular nose with its name across the top */
    const nose=add(VB(1.5,.26,1.1),paint,0,.5,1.5);nose.rotation.x=-.18;
    add(VB(1.62,.1,.36),blk,0,.38,2.12);
    add(VB(1.3,.03,.3),psMat({map:plateTex(96,12,'VEBERÖD ORIGINAL','#7a1f30','#f6f5f0',5)}),0,.66,1.62).rotation.x=-.18;
    for(const g of [-.42,.42])add(VB(.12,.03,.9),g<0?burg:blk,g,.65,1.35).rotation.x=-.18;
    add(VB(.44,.36,.04),num,0,.56,2.06).rotation.x=-.25;     /* number board on the nose */
    /* the low racing seat */
    add(VB(.82,.14,.75),blk,0,.42,-.55);
    add(VB(.82,.8,.14),blk,0,.8,-1.0).rotation.x=-.25;
    add(VC(.04,.04,.9,5),steel,0,.72,.5).rotation.x=1.05;    /* steering column */
    /* exposed rear engine with an oversized exhaust */
    add(VB(.8,.5,.66),dark,0,.66,-1.55);
    for(const z of [-1.4,-1.55,-1.7])add(VB(.86,.05,.1),steel,0,.94,z);   /* cooling fins */
    add(VC(.16,.16,.22,8),burg,-.42,.72,-1.5).rotation.z=Math.PI/2;     /* air box */
    const ex=add(VC(.13,.2,1.3,8),steel,.48,.86,-2.15);ex.rotation.x=Math.PI/2-.2;
    add(VC(.22,.22,.12,8),blk,.48,.98,-2.78).rotation.x=Math.PI/2-.2;
    const flame=A.grp(.48,1.0,-2.9);
    const fc=A.put(flame,new THREE.ConeGeometry(.2,.7,6),psMat({color:0xffa83a,unlit:true}),0,0,-.3);fc.rotation.x=-Math.PI/2+.2;
    A.put(flame,new THREE.ConeGeometry(.1,.4,5),psMat({color:0xfff2b0,unlit:true}),0,0,-.15).rotation.x=-Math.PI/2+.2;
    flame.visible=false;
    add(VB(1.7,.16,.22),blk,0,.42,-2.3);                     /* rear bumper and its sticker */
    add(VB(1.0,.13,.02),psMat({map:plateTex(80,10,'DET VAR BÄTTRE FÖRR','#15161a','#f2d21a',4)}),-.2,.42,-2.42);
    /* small, battered, carefully adjusted spoiler */
    const sp=A.grp(0,1.12,-2.1);
    A.put(sp,VB(1.5,.06,.42),paint,0,.28,0).rotation.z=.03;
    A.put(sp,VB(.5,.065,.42),burg,.48,.285,0).rotation.z=-.09;           /* the dented corner, repainted */
    A.put(sp,VB(.22,.07,.44),tape,-.3,.3,0);                              /* gaffer tape */
    for(const g of [-1,1]){A.put(sp,VB(.05,.36,.5),blk,g*.76,.2,0);A.put(sp,VB(.06,.3,.06),steel,g*.3,0,0);}
    const st={};
    A.anim.push(k=>{
      const t=since(st,'still',!(k.boost>0));                /* seconds into the current boost */
      flame.visible=k.boost>0&&(t<.35||Math.random()<.15);
      flame.scale.setScalar(.8+Math.random()*.5);
      sp.rotation.x=k.boost>0?Math.sin(clock*60)*.07:0;
      sp.position.y=1.12+(k.boost>0?Math.sin(clock*47)*.02:0);
    });
    return {fx:1.05,fz:1.35,rx:1.12,rz:-1.4,r:.34,rr:.42,fw:.38,rw:.56,cy:-.25,cz:-.1,trim:0xf2d21a};
  },

  /* Farmor Britta: Åhus Hembakat, a miniature bakery delivery van */
  hembak(add,paint,dark,steel,A){
    const blue=psMat({color:0x2f63c8}),brick=psMat({color:0x8a3a2a}),bun=psMat({color:0xc07a34});
    add(VB(2.0,.42,4.2),paint,0,.62,-.1);
    add(VB(1.9,.7,1.3),paint,0,1.02,1.4);
    add(VC(.38,.38,1.9,8),paint,0,1.0,2.05).rotation.z=Math.PI/2;   /* round nose */
    for(const g of [-.6,.6])add(VC(.15,.15,.1,8),psMat({color:0xfff2b0,unlit:true}),g,1.08,2.44).rotation.x=Math.PI/2;
    add(VB(2.0,.14,.24),dark,0,.48,2.36);
    /* the bread-oven rear with its chimney */
    add(VB(1.9,.7,1.9),paint,0,1.1,-1.6);
    add(VC(.95,.95,1.9,10),paint,0,1.45,-1.6).rotation.x=Math.PI/2;   /* the round oven top */
    add(VC(.12,.14,.7,6),dark,.42,2.55,-1.95);
    add(VB(.34,.08,.34),dark,.42,2.9,-1.95);
    /* BRITTAS sign and a scalloped blue awning over the counter */
    add(VB(1.5,.4,.1),psMat({map:plateTex(40,10,'BRITTAS','#2f63c8','#fbf3dc',6)}),0,2.5,-.7);
    for(const g of [-1,1]){
      const aw=add(VB(.55,.05,1.8),psMat({map:pixTex(8,8,c=>{for(let x=0;x<8;x+=2){c.fillStyle=x%4?'#f2f4f6':'#2f63c8';c.fillRect(x,0,2,8);}})}),g*1.1,1.92,-1.6);
      aw.rotation.z=-g*.45;
      for(let n=0;n<5;n++)add(new THREE.SphereGeometry(.13,6,3,0,6.283,Math.PI/2,Math.PI/2),blue,g*1.34,1.8,-2.32+n*.36);
      add(VB(.04,.5,.8),steel,g*1.01,1.05,-1.55);             /* baking trays on the sides */
      for(const z of [-1.8,-1.55,-1.3])add(new THREE.SphereGeometry(.09,5,3),bun,g*1.05,1.18,z);
    }
    /* cooling rack behind her seat */
    for(const y of [1.05,1.35,1.65])add(VB(1.3,.03,.4),steel,0,y,-.62);
    for(const g of [-.64,.64])add(VB(.04,.9,.04),steel,g,1.35,-.62);
    for(const x of [-.4,0,.4])add(new THREE.SphereGeometry(.09,5,3),bun,x,1.42,-.62);
    /* the oven door glows with her shield up; the hatch pops open to show the äggakaka */
    add(VB(1.0,.8,.08),brick,0,1.35,-2.56);
    const glow=psMat({color:0xff8a2a,unlit:true});
    const fire=add(VB(.6,.34,.06),glow,0,1.3,-2.6);fire.visible=false;
    const hatch=A.grp(0,1.8,-2.62);
    A.put(hatch,VB(1.04,.4,.06),paint,0,-.2,0);
    const cake=add(VC(.34,.34,.12,8),psMat({color:0xf0c040}),0,1.62,-2.4);cake.visible=false;
    const st={};
    A.anim.push(k=>{
      const t=since(st,'up',k.shield>0&&!st.was);st.was=k.shield>0;
      fire.visible=k.shield>0;
      glow.uniforms.uColor.value.setHex(Math.floor(clock*8)%2?0xff8a2a:0xffb04a);
      const open=t<1.2?Math.sin(Math.min(1,t/1.2)*Math.PI):0;
      hatch.rotation.x=-open*1.6;cake.visible=open>.2;
    });
    return {fx:1.0,fz:1.5,rx:1.0,rz:-1.45,r:.42,cy:.28,cz:-.1};
  },

  /* Nisse: Nisses Trängseltralla, a scrapyard kart with padding for squeezing through traffic */
  tralla(add,paint,dark,steel,A){
    const rub=psMat({color:0x2a2c30}),pad=psMat({color:0x3c4048}),rust=psMat({color:0x8a5a34});
    add(VB(1.8,.46,3.0),paint,0,.6,0);
    add(VB(1.2,.4,1.0),paint,0,.58,1.75);
    add(VB(.5,.3,.5),rust,.5,.85,-.6);                        /* a rust patch */
    add(VB(.4,.2,.6),psMat({color:0x7a9a3a}),-.55,.86,1.4);   /* a panel off another kart */
    add(VB(2.6,.44,.5),rub,0,.55,2.35);                       /* broad rubber bumpers */
    add(VB(2.6,.44,.5),rub,0,.55,-1.75);
    add(VB(1.3,.9,.26),paint,0,1.06,-1.16);
    add(VC(.11,.11,1,6),steel,-.36,1.2,-1.75).rotation.x=Math.PI/2;
    /* padded sides that squash when he squeezes through */
    const pads=[];
    for(const g of [-1,1]){const p=A.grp(g*1.02,.82,-.1);A.put(p,VB(.5,.56,2.3),pad,g*.12,0,0);
      for(const z of [-.7,0,.7])A.put(p,VB(.52,.04,.04),rub,g*.12,.12,z);pads.push(p);}
    /* bicycle bell on the wheel */
    add(new THREE.SphereGeometry(.09,6,3,0,6.283,0,Math.PI/2),psMat({color:0xd8dde2}),.3,1.42,.6);
    A.anim.push(k=>{
      let near=99;for(const o of karts)if(o!==k&&!o.parked)near=Math.min(near,Math.hypot(o.x-k.x,o.z-k.z));
      const sq=near<4.2?.5:1;
      for(const p of pads)p.scale.x=lerp(p.scale.x,sq,.25);
    });
    const hubs=[0xd8362a,0xa8b0ba,0xf0c030,0x4a4e56];
    return {fx:1.04,fz:1.3,rx:1.1,rz:-1.3,r:.44,radii:[.42,.46,.48,.44],
      wheel(w,r,wd,i){w.add(new THREE.Mesh(flat(VC(r*.5,r*.5,wd+.05,6).rotateZ(Math.PI/2)),psMat({color:hubs[i]})));}};
  },

  /* Spöket på Glimmingehus: Glimmingehus Nattvagn, a medieval carriage with a spectral glow */
  nattvagn(add,paint,dark,steel,A){
    const tim=psMat({color:0x1e1a18}),beam=psMat({color:0x3a2c22}),iron=psMat({color:0x3a3e46}),
          ghost=psMat({color:A.color,unlit:true});
    add(VB(1.5,.6,3.2),tim,0,1.0,.1);
    for(const g of [-1,1]){add(VB(.06,.1,3.2),beam,g*.76,1.24,.1);add(VB(.06,.1,3.2),ghost,g*.77,.72,.1);}
    add(VB(1.5,.3,.7),tim,0,1.1,1.85);                        /* footboard */
    /* the cabin behind the ghost, with a round roof and fluttering curtains */
    add(VB(1.5,1.3,1.4),tim,0,1.85,-1.5);
    add(VC(.75,.75,1.4,8),tim,0,2.5,-1.5).rotation.x=Math.PI/2;
    for(const g of [-1,1]){
      add(VB(.04,.6,.8),ghost,g*.76,1.95,-1.5);              /* pale glowing windows */
      for(const z of [-.85,-.15])add(VB(.06,1.3,.1),beam,g*.77,1.85,-1.5+z+.5);
    }
    const curtains=[];
    for(const g of [-1,1])for(const z of [-1.75,-1.25]){
      const c=A.grp(g*.8,2.25,z);A.put(c,VB(.03,.56,.42),psMat({color:0xb8a8d8}),0,-.28,0);curtains.push(c);}
    /* the curved front bracket with Spöklyktan */
    for(let n=0;n<5;n++){const a=n/4*1.2;add(VB(.1,.1,.42),iron,0,1.3+Math.sin(a)*1.2,1.95+(1-Math.cos(a))*.4+n*.08).rotation.x=-a;}
    const lan=A.grp(0,2.5,2.55);
    A.put(lan,VB(.04,.3,.04),iron,0,-.15,0);
    A.put(lan,VB(.3,.36,.3),psMat({color:0xffcc55,unlit:true}),0,-.46,0);
    A.put(lan,VB(.36,.06,.36),iron,0,-.26,0);
    A.anim.push(k=>{
      curtains.forEach((c,i)=>{c.rotation.z=(i<2?1:-1)*(.25+Math.sin(clock*5+i*1.7)*.25);});
      lan.rotation.x=lerp(lan.rotation.x,clamp(-k.speed*.012,-.5,.5)+Math.sin(clock*3)*.08,.1);
      lan.rotation.z=-k.lean*1.5;
    });
    return {fx:.85,fz:1.55,rx:.92,rz:-1.4,r:.46,rr:.62,fw:.18,rw:.2,hub:0x3a3e46,hubK:.25,cy:.2,cz:.05};
  },

  /* Vikingahövdingen: Kustens Långskepp, a short longship on four wheels */
  langskepp(add,paint,dark,steel,A){
    const wood=psMat({color:A.color}),plank=psMat({color:0x4a2e18}),red=psMat({color:0xb82a22});
    add(VB(1.9,.8,3.2),wood,0,.95,0);
    for(const y of [.72,.95,1.18])for(const g of [-1,1])add(VB(.02,.05,3.2),plank,g*.96,y,0);
    add(VB(1.3,.7,1.0),wood,0,1.15,2.0).rotation.x=-.45;      /* bow */
    add(VB(1.3,.7,1.0),wood,0,1.15,-2.0).rotation.x=.45;      /* stern */
    add(VB(.3,1.2,.3),wood,0,1.85,2.55).rotation.x=.35;       /* the neck */
    add(VB(.42,.42,.76),wood,0,2.48,2.9);                     /* dragon head */
    add(VB(.38,.12,.5),red,0,2.28,3.12);                      /* jaw */
    for(const g of [-.15,.15]){add(VB(.08,.08,.04),psMat({color:0xffd23a,unlit:true}),g,2.58,3.28);
      add(new THREE.ConeGeometry(.05,.3,4),psMat({color:0xeee4c8}),g,2.82,2.72).rotation.x=-.6;}
    add(VB(.26,1.1,.26),wood,0,1.9,-2.5).rotation.x=-.4;      /* stern curl */
    add(VB(.26,.26,.5),wood,0,2.48,-2.92);
    /* shields along the gunwale */
    const SH=[0xb82a22,0xe8c33a,0xf2efe0];
    for(const g of [-1,1])for(let n=0;n<3;n++){
      const s=add(VC(.3,.3,.06,8),psMat({color:SH[(n+(g>0?1:0))%3]}),g*1.0,1.25,-1.0+n*.85);s.rotation.z=Math.PI/2;}
    /* mast and a striped sail behind the chief */
    add(VB(.12,2.2,.12),plank,0,2.2,-1.45);
    add(VB(1.9,1.2,.05),psMat({map:pixTex(8,8,c=>{for(let x=0;x<8;x+=2){c.fillStyle=x%4?'#f2efe0':'#b82a22';c.fillRect(x,0,2,8);}})}),0,2.55,-1.5);
    add(VB(2.0,.08,.08),plank,0,3.18,-1.5);
    /* Vikingahornen frame the steering position */
    for(const g of [-1,1]){const h=add(new THREE.ConeGeometry(.1,.7,5),psMat({color:0xeee4c8}),g*.62,1.75,.55);h.rotation.z=-g*.7;}
    /* oars that paddle frantically in a boost */
    const oars=[];
    for(const g of [-1,1])for(const z of [-.4,.6]){
      const o=A.grp(g*.98,1.35,z);A.put(o,VB(.06,.06,1.5),plank,g*.4,-.3,0).rotation.z=g*.8;
      A.put(o,VB(.04,.24,.34),plank,g*.95,-.82,0);oars.push([o,g]);}
    A.anim.push(k=>{
      const f=k.boost>0?16:2.4,amp=k.boost>0?.7:.25;
      for(const [o,g] of oars){o.rotation.y=Math.sin(clock*f)*amp*g;o.rotation.z=Math.cos(clock*f)*.18*g;}
    });
    return {fx:1.0,fz:1.3,rx:1.0,rz:-1.3,r:.46,hub:0xb82a22,hubK:.82,cy:.3,cz:-.15};
  },

  /* Gröna gubben från skogen: Ängelholm Tallrik 46, a battered saucer on wheeled legs */
  tallrik(add,paint,dark,steel,A){
    const metal=psMat({color:0x9aa4ae}),dent=psMat({color:0x7a848e}),light=psMat({color:A.color,unlit:true});
    add(VC(2.0,2.3,.34,12),metal,0,1.36,0);
    add(VC(2.25,1.0,.42,12),metal,0,1.0,0);
    add(VC(2.32,2.32,.08,12),dark,0,1.22,0);
    for(const [x,z,r] of [[1.2,.9,.3],[-1.0,-1.2,.4],[.4,-1.7,.25]]){const d=add(VB(r*2,.06,r*1.5),dent,x,1.54,z);d.rotation.y=x;}
    for(let n=0;n<10;n++){const a=n/10*6.283;add(VB(.2,.12,.2),light,Math.sin(a)*2.1,1.24,Math.cos(a)*2.1);}
    add(new THREE.CylinderGeometry(.95,1.05,.5,10,1,true),psMat({color:0x9fe8ff,transparent:true,opacity:.35,depthWrite:false,side:THREE.DoubleSide}),0,1.78,-.45);
    /* four articulated legs to four little wheels: the saucer really does touch the ground */
    const legs=[];
    for(const [x,z] of [[-1.25,1.35],[1.25,1.35],[-1.25,-1.35],[1.25,-1.35]]){
      const l=A.grp(x*.7,.95,z*.7);
      A.put(l,VB(.1,.7,.1),steel,x*.15,-.25,z*.15).rotation.set(z*.25,0,-x*.25);
      A.put(l,VB(.16,.16,.16),dark,x*.3,-.55,z*.3);legs.push(l);
    }
    /* UFO-antennen: bends in corners, flashes when boosting */
    const ant=A.grp(0,1.52,-1.45),tip=A.grp(0,.8,0,ant);
    A.put(ant,VC(.03,.03,.8,4),steel,0,.4,0);
    A.put(tip,VC(.025,.025,.8,4),steel,0,.4,0);
    const ball=A.put(tip,new THREE.SphereGeometry(.15,6,4),light,0,.86,0);
    A.anim.push(k=>{
      const st=k.ai?k.aiSteer:input.steer,f=clamp(Math.abs(k.speed)/40,0,1);
      ant.rotation.z=lerp(ant.rotation.z,st*.35,.15);tip.rotation.z=ant.rotation.z*1.4;
      ant.rotation.x=lerp(ant.rotation.x,-f*.3,.1);tip.rotation.x=ant.rotation.x;
      ball.visible=k.boost>0?Math.floor(clock*10)%2===0:true;
      legs.forEach((l,i)=>{l.rotation.x=Math.sin(clock*41+i*2)*.06*f;l.rotation.z=Math.sin(clock*37+i)*.06*f;});
    });
    return {fx:1.25,fz:1.35,rx:1.25,rz:-1.35,r:.34,fw:.26,rw:.26,cy:.32,cz:-.1};
  },

  /* Raket-Rune: Malmö Överljud, a rocket dragster with a turbine where the sense should be */
  overljud(add,paint,dark,steel,A){
    const white=psMat({color:0xf2f2f4}),chrome=psMat({color:0xc6ced6}),
          amber=psMat({color:0xffb020,unlit:true}),flame=psMat({color:0xffa83a,unlit:true});
    add(VC(.55,.68,5.6,10),paint,0,.95,.1).rotation.x=Math.PI/2;
    add(VB(1.4,.06,5.0),white,0,1.0,.1);                      /* the white stripe */
    const nose=add(new THREE.ConeGeometry(.55,1.5,10),paint,0,.95,3.65);nose.rotation.x=Math.PI/2;
    add(VB(2.4,.06,.5),dark,0,.5,3.2);                        /* front canard */
    add(VB(.8,.5,.06),psMat({color:0x2b3a4a}),0,1.55,.5).rotation.x=-.4;   /* a tiny screen */
    /* the huge central turbine behind the cockpit */
    add(VC(.95,.95,1.7,12),chrome,0,1.6,-1.95).rotation.x=Math.PI/2;
    add(VC(1.02,1.02,.14,12),dark,0,1.6,-1.08).rotation.x=Math.PI/2;
    const fan=A.grp(0,1.6,-1.06);
    for(let n=0;n<6;n++){const b=A.put(fan,VB(.12,.82,.04),steel,0,.42,0);const p=new THREE.Group();p.rotation.z=n*1.047;fan.add(p);p.add(b);}
    add(VC(.7,.85,.4,12),dark,0,1.6,-2.95).rotation.x=Math.PI/2;
    const plume=A.grp(0,1.6,-3.15);
    plume.scale.z=.25;
    const pc=A.put(plume,new THREE.ConeGeometry(.6,2.4,8),flame,0,0,-1.2);pc.rotation.x=-Math.PI/2;
    /* the enormous fins */
    const fin=(pts)=>{const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pts,3));return g;};
    add(fin([0,0,0, 0,2.1,-1.2, 0,0,-1.9]),psMat({color:A.color,side:THREE.DoubleSide}),0,2.4,-1.3);
    for(const g of [-1,1]){const f=add(fin([0,0,0, 0,1.6,-1.0, 0,0,-1.6]),psMat({color:0xf2f2f4,side:THREE.DoubleSide}),g*.7,1.2,-1.5);f.rotation.z=g*1.1;}
    /* warning lamps before a boost */
    const warn=[];
    for(const g of [-.5,.5])warn.push(add(VB(.22,.22,.22),amber,g,2.62,-1.4));
    A.anim.push(k=>{
      fan.rotation.z+=.15+Math.abs(k.speed)*.02+(k.boost>0?.6:0);
      const arm=k.dstage>0||k.charge>.3||(k.boost>0&&k.boost<.3);
      for(const w of warn)w.visible=!arm||Math.floor(clock*10)%2===0;
      amber.uniforms.uColor.value.setHex(arm?0xff3a1a:0xffb020);
      const s=k.boost>0?2.6+Math.sin(clock*40)*.4:(arm?.7:.25);
      plume.scale.set(1,1,lerp(plume.scale.z,s,.3));
    });
    return {fx:.75,fz:2.6,rx:1.2,rz:-1.8,r:.3,rr:.62,rw:.72,fw:.24,cy:.2,cz:-.05};
  }
};
