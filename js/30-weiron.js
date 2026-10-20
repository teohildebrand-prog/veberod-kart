"use strict";
/* ───────── Weiron i ottan ───────── */
/* The harbour workshop's man from Hisingen and his HISINGEN SKIFTSEX, the workshop forklift. He
   only entered because someone borrowed his workshop trolley, fitted a transponder and wrote
   MOTORSPORT on the overtime sheet. Vehicle follows js/30-vehicles.js, the driver buildVictor in js/30-karts.js (jointed, so
   he can check his watch on the select turntable). His item and quirk: js/37-cementblandaren.js.
   Everything here is looks only. */

Object.assign(VEHICLES,{
  /* Hisingen Skiftsex: the workshop's forklift, entered as it stood. Industrial yellow, a black
     counterweight with the sticker on it, the overhead guard with the beacon that spins in a boost,
     his lunchbox on a tiny pallet on the forks, the toolbox strapped to the counterweight and a time
     clock for a dashboard. When an item goes the clock stamps a card and the forks give a lift. */
  skiftsex(add,paint,dark,steel,A){
    const yel=psMat({color:A.color}),black=psMat({color:0x1f2126}),rubber=psMat({color:0x1b1d22}),
          red=psMat({color:0xc8322a}),wood=psMat({color:0xb08a52}),grey=psMat({color:0x8a8f96}),
          strap=psMat({color:0xe86a1a}),stripe=psMat({map:pixTex(16,4,g=>{for(let x=0;x<16;x+=4){g.fillStyle='#e0a81a';g.fillRect(x,0,2,4);g.fillStyle='#15161a';g.fillRect(x+2,0,2,4);}})});
    /* the body and the counterweight behind the seat */
    add(VB(1.9,.62,2.4),yel,0,.78,-.2);
    add(VB(1.7,.3,1.0),yel,0,1.2,.5);                                     /* the floor plate and the cowl in front of him */
    add(VB(2.0,1.0,.85),black,0,1.05,-1.6);                               /* the counterweight */
    add(VB(2.02,.16,.87),stripe,0,1.4,-1.6);
    add(VB(1.3,.26,.03),psMat({map:pixTex(64,16,g=>{g.fillStyle='#f4f0e6';g.fillRect(0,0,64,16);g.fillStyle='#15161a';
      g.font='5px "Press Start 2P",monospace';g.textAlign='center';g.textBaseline='middle';
      g.fillText('OM DU KAN LÄSA',32,4.5);g.fillText('DETTA STÅR DU',32,9.5);g.fillText('I VÄGEN',32,14);})}),0,.95,-2.04);   /* the rear sticker */
    add(VB(.5,.14,.08),psMat({color:0xff3a2a,unlit:true}),-.7,1.25,-2.04);add(VB(.5,.14,.08),psMat({color:0xff3a2a,unlit:true}),.7,1.25,-2.04);
    /* the toolbox strapped down on the counterweight */
    add(VB(1.1,.42,.56),red,0,1.76,-1.62);
    add(VB(1.12,.06,.58),dark,0,1.98,-1.62);
    for(const x of [-.36,.36])add(VB(.1,.46,.6),strap,x,1.76,-1.62);
    /* the overhead guard: four posts and a roof of bars */
    for(const [x,z] of [[-.86,.9],[.86,.9],[-.86,-1.15],[.86,-1.15]])add(VB(.1,1.95,.1),dark,x,2.0,z);
    add(VB(1.84,.08,2.15),dark,0,2.97,-.12);
    for(let z=-.9;z<=.7;z+=.4)add(VB(1.74,.1,.1),grey,0,2.95,z);
    /* the beacon on the guard: dull amber, spinning bright in a boost */
    const dome=add(VC(.14,.16,.26,8),psMat({color:0x9a6a12}),.6,3.14,-.9);
    const lit=add(VC(.15,.17,.27,8),psMat({color:0xffb020,unlit:true}),.6,3.14,-.9);
    const spin=A.grp(.6,3.14,-.9);
    A.put(spin,VB(.42,.12,.06),psMat({color:0xffe08a,unlit:true}),0,0,0);
    /* the thermos within reach, the time clock on the dash; the card pops out when an item goes */
    add(VC(.13,.13,.62,8),black,-.72,1.72,-.25);add(VC(.14,.14,.08,8),steel,-.72,1.98,-.25);add(VC(.1,.1,.1,8),black,-.72,2.08,-.25);
    const clk=A.grp(.45,1.62,.75);
    A.put(clk,VB(.5,.56,.3),grey,0,0,0);
    A.put(clk,VC(.17,.17,.04,10),psMat({color:0xf4f6f8}),0,.06,.16).rotation.x=Math.PI/2;
    A.put(clk,VB(.03,.13,.02),dark,0,.1,.19);A.put(clk,VB(.1,.03,.02),dark,.04,.06,.19);
    const card=A.grp(0,.12,-.05,clk);
    A.put(card,VB(.3,.4,.02),psMat({color:0xf2e6c4}),0,0,0);
    A.put(card,VB(.2,.04,.025),red,0,.08,0);
    add(VB(.3,.06,.3),dark,-.15,1.58,.55).rotation.x=-.5;                 /* the steering knob plate */
    /* the mast in front, and the carriage that runs up it with the forks, pallet and lunchbox */
    for(const x of [-.55,.55]){add(VB(.14,2.3,.16),dark,x,1.45,1.42);add(VB(.06,2.3,.06),steel,x*.8,1.45,1.48);}
    add(VB(1.24,.12,.16),dark,0,2.55,1.42);add(VB(1.24,.12,.16),dark,0,.42,1.42);
    const lift=A.grp(0,0,0);
    A.put(lift,VB(1.2,.7,.08),dark,0,.85,1.56);                           /* the backrest */
    for(let x=-.45;x<=.45;x+=.3)A.put(lift,VB(.05,.62,.06),grey,x,.86,1.6);
    for(const x of [-.36,.36])A.put(lift,VB(.16,.08,1.25),steel,x,.32,2.2);   /* the forks */
    A.put(lift,VB(1.1,.08,.9),wood,0,.42,2.2);                            /* the tiny pallet */
    for(const x of [-.42,0,.42])A.put(lift,VB(.12,.1,.9),wood,x,.33,2.2);
    A.put(lift,VB(.7,.34,.46),psMat({color:0x3a7ab8}),0,.63,2.15);        /* his lunchbox */
    A.put(lift,VB(.72,.06,.48),psMat({color:0xf4f6f8}),0,.83,2.15);
    add(VB(2.0,.2,.2),rubber,0,.5,-2.06);
    const st={used:null,t:9};
    A.anim.push((k,dt)=>{
      const on=k.boost>0;lit.visible=on;spin.visible=on;dome.visible=!on;
      if(on)spin.rotation.y+=(dt||0)*14;
      if(k.usedAt!==st.used){if(st.used!=null||k.usedAt!=null)st.t=0;st.used=k.usedAt;}   /* an item went: stamp a card */
      st.t+=dt||0;
      const u=st.t/.7;card.visible=u<1;
      if(u<1)card.position.y=.12+Math.sin(Math.min(1,u*2)*Math.PI*.5)*.3-(u>.75?(u-.75)*1.6:0);
      clk.position.y=1.62-(u<.12?.04:0);                                  /* ka-chunk */
      const up=st.t<1.2?Math.sin(st.t/1.2*Math.PI)*.9:0;                  /* and the forks give a lift */
      lift.position.y=up+(k.speed>4?Math.abs(Math.sin(clock*9))*.03:0);
    });
    /* big drive wheels at the front, small steer wheels under the counterweight */
    return {fx:.98,fz:.95,rx:.86,rz:-1.45,r:.52,rr:.36,fw:.42,rw:.36,hub:0x6a6e74,hubK:.55,cy:.5,cz:-.35};
  }
});

/** Weiron i ottan: short reddish-blond hair going thin on top, a red-and-brown check flannel shirt
    under a brown knitted vest with the TIO I TOLV MANNEN badge, dark work trousers, big work boots.
    A stylized take on Teo's reference picture; no photo is in the game.
    Jointed like Victor: on the select turntable he checks his watch, looks along the grid and
    slowly shakes his head. Racing, he just sits. */
function buildWeiron(cab,skin,dark,anim){
  const B=(w,h,d)=>new THREE.BoxGeometry(w,h,d);
  const put=(p,g,m,x,y,z)=>{const e=new THREE.Mesh(flat(g),m);e.position.set(x,y,z);p.add(e);return e;};
  const addc=(g,m,x,y,z)=>put(cab,g,m,x,y,z);
  const check=psMat({map:pixTex(16,16,g=>{g.fillStyle='#d8cdbc';g.fillRect(0,0,16,16);   /* flannel check */
          g.fillStyle='#9a4a3a';g.fillRect(0,0,5,16);g.fillRect(8,0,2,16);g.fillRect(0,0,16,5);g.fillRect(0,8,16,2);
          g.fillStyle='#6a3028';g.fillRect(0,0,5,5);g.fillRect(8,8,2,2);g.fillRect(8,0,2,5);g.fillRect(0,8,5,2);
          g.fillStyle='#4a4a58';g.fillRect(12,0,1,16);g.fillRect(0,12,16,1);})}),
        vest=psMat({color:0x6e4a2c}),vestD=psMat({color:0x5a3a22}),pants=psMat({color:0x2e3036}),
        boot=psMat({color:0x2a2018}),hair=psMat({color:0xc07a48}),brow=psMat({color:0xa8683c}),watch=psMat({color:0xc6ced6}),
        badge=psMat({map:pixTex(32,16,g=>{g.fillStyle='#f4f0e6';g.fillRect(0,0,32,16);g.fillStyle='#15161a';
          g.font='5px "Press Start 2P",monospace';g.textAlign='center';g.textBaseline='middle';
          g.fillText('TIO I',16,3.5);g.fillText('TOLV',16,8.5);g.fillText('MANNEN',16,13.5);})});
  /* the torso: the shirt, the vest over it open at the collar, the badge on the vest */
  addc(B(1.0,.68,.58),check,0,1.32,-.6);
  addc(B(1.02,.56,.6),vest,0,1.28,-.6);
  for(let x=-.4;x<=.4;x+=.1)addc(B(.03,.5,.02),vestD,x,1.27,-.295);       /* the knit ribs */
  addc(B(.3,.18,.04),check,0,1.58,-.3);                                   /* the shirt in the vest's V */
  for(const sg of [-1,1])addc(B(.22,.08,.18),check,sg*.14,1.67,-.38).rotation.z=-sg*.3;   /* the collar */
  addc(B(.26,.13,.02),badge,.24,1.4,-.29);
  addc(B(.92,.26,.56),pants,0,.92,-.6);
  const limb=[];
  for(const sg of [-1,1]){
    const sh=new THREE.Group();sh.position.set(sg*.48,1.56,-.6);cab.add(sh);
    put(sh,B(.28,.48,.28),check,0,-.22,0);
    const el=new THREE.Group();el.position.y=-.5;sh.add(el);
    put(el,B(.26,.36,.26),check,0,-.18,0);
    put(el,B(.28,.06,.28),vestD,0,-.37,0);                                 /* the cuff */
    put(el,B(.2,.2,.22),skin,0,-.48,0);
    if(sg<0)put(el,B(.24,.06,.24),watch,0,-.41,0);                        /* the watch */
    const hip=new THREE.Group();hip.position.set(sg*.22,.86,-.6);cab.add(hip);
    put(hip,B(.33,.62,.38),pants,0,-.31,0);
    put(hip,B(.38,.3,.56),boot,0,-.76,.08);                                /* big work boots */
    limb.push({sg,sh,el,hip});
  }
  /* the head on its neck, so it can look along the grid and shake */
  const head=new THREE.Group();head.position.set(0,1.62,-.6);cab.add(head);
  const hc=(g,m,x,y,z)=>put(head,g,m,x,y-1.62,z+.6);
  const y=1.9;
  hc(B(.2,.14,.2),skin,0,1.7,-.6);                                         /* the neck */
  blockFace(hc,skin,dark,y,{w:.5,mouth:0x9a4a42});
  hc(B(.14,.04,.05),brow,-.13,y+.13,-.355);hc(B(.14,.04,.05),brow,.13,y+.15,-.355).rotation.z=-.15;   /* pale brows */
  hc(B(.5,.08,.06),psMat({color:0xe0a088}),0,y-.22,-.36);                  /* a long chin */
  /* short reddish-blond hair: full at the sides and back, thin on top, the hairline well back */
  hc(B(.56,.2,.36),hair,0,y+.2,-.7);
  hc(B(.52,.1,.28),hair,0,y+.3,-.66);
  hc(B(.4,.06,.12),hair,0,y+.32,-.47);                                     /* the little tuft in front */
  for(const sg of [-1,1]){hc(B(.06,.24,.36),hair,sg*.28,y+.08,-.66);}
  /* poses: shoulder (x tilt, z spread), elbow bend, hip bend; the seat is the only pose racing */
  const SIT={sx:-1.25,sz:.05,ex:-.12,ez:0,hx:-1.45};
  function pose(P){for(const L of limb){L.sh.rotation.set(P.sx,0,L.sg*P.sz);L.el.rotation.set(P.ex,0,L.sg*P.ez);L.hip.rotation.x=P.hx;}}
  const ease=u=>{u=clamp(u,0,1);return u*u*(3-2*u);};
  pose(SIT);
  const st={t:0,last:-9};
  anim.push((k,dt)=>{
    if(!(previewOn&&k===player)){if(st.t){st.t=0;pose(SIT);head.rotation.set(0,0,0);}return;}
    if(clock-st.last>.25)st.t=0;                       /* shown again: start over */
    st.last=clock;st.t+=dt;const t=st.t%7;
    pose(SIT);head.rotation.set(0,0,0);
    const L=limb[0];
    if(t<2.2){                                          /* checks his watch: the wrist up, a look down */
      const u=ease(t/.5)*(1-ease((t-1.7)/.5));
      L.sh.rotation.set(lerp(SIT.sx,-1.2,u),0,lerp(-SIT.sz,-.9,u));
      L.el.rotation.set(lerp(SIT.ex,-1.9,u),0,lerp(0,.8,u));
      head.rotation.x=.35*u;head.rotation.y=-.25*u;
    }else if(t<4.6){                                    /* looks along the grid, one way then the other */
      const u=(t-2.2)/2.4;head.rotation.y=Math.sin(u*Math.PI*2)*.75*ease(u*4)*ease((1-u)*4);
    }else if(t<6.4){                                    /* and slowly shakes his head */
      const u=(t-4.6)/1.8;head.rotation.y=Math.sin(u*Math.PI*3)*.28*(1-u*.4);head.rotation.x=.08;
    }
  });
}
