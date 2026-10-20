"use strict";
/* ───────── Bodils promenad ───────── */
/* BARA EN LITEN RUNDA: Bodil's bonus track, modelled on Teo and Amanda's own block (stylised; the
   photos were reference only). Six square apartment towers in two staggered rows on a slope: dark
   brick with wooden shutters, white glass balconies, beige brick. A paved courtyard between them
   with a wooden deck round a sandpit, rust-brown picnic tables and tall black lamp posts with two
   heads; a street along the west side and woods up the hillside beyond it, concrete steps with
   black railings climbing to them.
   The lap: out of Porten past the giant HAR DU BAJSPÅSAR? sign, up into the woods on gravel
   (Nosrundan), round Den Viktiga Busken, down to the agility event on the lawn (Agilityängen),
   north along Pinnrakan under the trees and the fallen branch, and home through the courtyard
   past the window with the sofa (Hem till soffan) to NU VILAR VI. */

/* x east, z south (the aerial view the right way round). Blocks: [x, z, kind]; kind 0 = dark
   brick with wooden shutters (home is one), 1 = white with glass balconies, 2 = beige brick */
const PROM={home:{x:-62,z:-36},blocks:[[-62,-36,0],[14,-58,2],[88,-70,1],[-46,46,1],[30,32,0],[104,22,2]],
  size:22,floors:9,
  bush:{x:-284,z:176},
  /* where the lap's sections start (main-road samples), worked out from the laid track */
  sec:{street:16,woods:36,bush:176,lawn:312,agility:352,park:506,court:640},
  ramp:486,sign:8,sprinkler:668,launcher:540,branch:588,
  anim:null,dogs:[],tv:null,perk:0};
/* the gravel paths in the woods: packed fine, almost as quick as tarmac, and it crunches */
SURF.promGrus={top:o=>.97+.03*o,grip:o=>.95+.05*o,fuel:1.05,name:'GRUSSTIG'};
SFX.promGrus={dust:[.78,.72,.6],noise:{f:1500,g:.018}};
ROADTEX.promGrus=()=>pixTex(64,64,g=>{
  g.fillStyle='#a89a7c';g.fillRect(0,0,64,64);
  for(let i=0;i<1100;i++){g.fillStyle=Math.random()>.5?'rgba(214,204,178,.6)':'rgba(110,96,74,.5)';
    g.fillRect((Math.random()*64)|0,(Math.random()*64)|0,1,1);}
  g.fillStyle='rgba(120,104,80,.35)';for(const x of [16,22,42,48])g.fillRect(x,0,3,64);
  g.fillStyle='rgba(96,74,40,.5)';for(let i=0;i<26;i++)g.fillRect((Math.random()*60)|0,(Math.random()*62)|0,3,2);   /* leaves */
});
/* the agility event's artificial turf: bright, grippy, chalked lines */
SURF.promTurf={top:o=>1,grip:o=>1,fuel:1.0,name:'KONSTGRÄS'};
SFX.promTurf={dust:null,noise:{f:1900,g:.012}};
ROADTEX.promTurf=()=>pixTex(64,64,g=>{
  g.fillStyle='#4aa040';g.fillRect(0,0,64,64);
  for(let i=0;i<900;i++){g.fillStyle=Math.random()>.5?'rgba(110,190,90,.5)':'rgba(40,110,40,.5)';
    g.fillRect((Math.random()*64)|0,(Math.random()*64)|0,1,2);}
  g.fillStyle='rgba(0,0,0,.06)';g.fillRect(0,0,64,32);                 /* mowing stripes */
  g.fillStyle='rgba(250,250,240,.8)';g.fillRect(2,0,2,64);g.fillRect(60,0,2,64);
});
/* the courtyard: grey concrete pavers in a herringbone, a darker border row */
SURF.promPlattor={top:o=>1,grip:o=>1,fuel:1.0,name:'MARKSTEN'};
SFX.promPlattor={dust:null,noise:{f:1100,g:.016},rattle:true};
ROADTEX.promPlattor=()=>pixTex(64,64,g=>{
  g.fillStyle='#8e8a84';g.fillRect(0,0,64,64);
  for(let y=0;y<64;y+=4)for(let x=0;x<64;x+=8){const o=(y/4)%2?4:0,v=128+((Math.random()*30)|0);
    g.fillStyle='rgb('+v+','+(v-4)+','+(v-10)+')';g.fillRect((x+o)%64,y,7,3);}
  g.fillStyle='#6a6660';g.fillRect(0,0,3,64);g.fillRect(61,0,3,64);
});
/* Bakom busken: a rough dirt path with roots and paw prints */
ROADTEX.promJord=()=>pixTex(64,64,g=>{
  g.fillStyle='#6e5a42';g.fillRect(0,0,64,64);
  for(let i=0;i<900;i++){g.fillStyle=Math.random()>.5?'rgba(140,116,86,.55)':'rgba(60,44,30,.5)';
    g.fillRect((Math.random()*64)|0,(Math.random()*64)|0,1,1);}
  g.fillStyle='rgba(90,64,40,.8)';for(let i=0;i<4;i++){const y=(Math.random()*60)|0;g.fillRect(0,y,64,2);}   /* roots */
  g.fillStyle='rgba(50,36,24,.6)';for(let i=0;i<5;i++){const x=(Math.random()*54)|0,y=(Math.random()*54)|0;
    g.fillRect(x+2,y+3,3,3);g.fillRect(x,y,2,2);g.fillRect(x+3,y-1,2,2);g.fillRect(x+6,y,2,2);}   /* paw prints */
});
VERGEC.promenad=['#8a8270','#a0987e','#6e6656'];          /* worn edges: grit, crumbs of tarmac */
GROUND.promenad={cell:28,stripe:1.0,verge:0x6c9446,
  cols:[0x5e9442,0x68a04a,0x56883c,0x70a650,0x4c803a,0x62984a]};

/** the lie of the land: the courtyard on a shelf, the lawn below it to the south, the hillside
    rising to the west under the woods, and the ridge behind everything to the north */
function promHill(x,z){
  return lerp(2,0,smooth(64,112,z))
    +13*smooth(-108,-214,x)*(1-.3*smooth(130,230,z))
    +12*smooth(-262,-420,x)
    +22*smooth(-130,-300,z);
}

STAGES.push({ id:'promenad', group:'bonus', name:'BODILS PROMENAD', sub:'BARA EN LITEN RUNDA', bonus:true,
  order:28, modes:['race','tt','free'],
  tag:'Bonusbana. Tre varv. Fyrtiosju intressanta lukter. Ut genom porten, upp i skogen, runt den viktiga busken, agility på ängen och hem till soffan.',
  view:{x:-90,z:-2,h:3.2,to:{x:-40,z:-20,h:7},fov:66},          /* out of the woods, back towards the door */
  hw:8.6,
  /* gravel through the woods and round the shrub, artificial turf on the agility course, pavers
     in the courtyard; the street, the lawn and Pinnrakan are tarmac */
  zones:[[PROM.sec.woods,PROM.sec.lawn,'promGrus'],[PROM.sec.agility,PROM.sec.park,'promTurf'],[PROM.sec.court,PROM.sec.street,'promPlattor']],
  jumpSpec:[{at:PROM.ramp,h:1.7,drop:1.3,up:9,dn:5,rec:11}],     /* the low agility ramp */
  stations:[[0.44,1],[0.80,1]],
  bars:[0.6,0.85,0.7], laps:3, stand:false, bankGain:0.16, bankMax:0.16,
  blurb:'Bodil\'s bonus track: an ordinary walk turned into a sporting event. Three laps from the door of her block, past the giant HAR DU BAJSPÅSAR? sign, up the gravel paths in the woods (Nosrundan), round the absurdly prominent shrub every dog stops at (Den Viktiga Busken), down to a full agility event on the lawn with a low ramp and colourful tunnels (Agilityängen), north along the park under the trees and the enormous fallen branch (Pinnrakan), and home through the courtyard past the sofa in the window to NU VILAR VI. Genom tunneln cuts through the big agility tunnel; Bakom busken is the rough dirt path round the back of the hairpin.',
  role:'Grusstigar i skogen, en bred hårnål runt busken, agilitybana på ängen, en snabb parkraka och spurten hem genom gården.',
  sky:[0xe8eef0,0x4a8ed8], fog:[0xd4dee4,90,420], amb:0x66707c, dif:0xfff0d8,
  road:'asphalt', paint:false, verge:'promenad', edge:'promenad', ground:'promenad',
  terrain:{size:1000,seg:130},
  /* away from the paths the ground follows the slope, not the nearest stretch of track */
  mod:(x,z,t)=>t*(promHill(x,z)-sy[nearestGlobal(x,z)])-rolls(x,z)*t*.8,
  land:(x,z,out)=>landPromenad(x,z,out),
  ctrl:promCtrl([
        [-58,-6],[-98,-8],[-128,-20],
        [-148,-46],[-178,-60],[-206,-44],[-212,-12],[-234,16],[-230,48],[-250,78],[-246,108],
        [-230,132],[-252,144],[-284,142],[-320,144],[-342,174],[-322,204],[-284,208],
        [-240,206],[-190,210],[-140,210],[-100,204],
        [-66,196],[-44,182],[-32,160],[-30,136],[-20,112],[4,100],[28,110],[34,134],[36,162],[40,192],[56,224],[84,242],[116,246],[144,238],
        [162,214],[166,180],[164,140],[160,96],[162,52],[160,14],[146,-14],[118,-24],
        [80,-20],[40,-14],[0,-8],[-28,-5]]),
  routes:[
    {id:'busken',name:'BAKOM BUSKEN',a:184,b:254,hw:4,side:-1,lead:12,leadLat:14,
     mid:[[0.5,14]],surface:'dirt',tex:'promJord',risk:0.4,
     blurb:'The rough dirt path round the back of the hairpin, worn by a thousand dogs who knew a better way. Shorter, bumpy and loose: good for karts built for fields.'},
    {id:'tunnel',name:'GENOM TUNNELN',a:356,b:466,hw:4.6,side:1,lead:6,leadLat:4,
     mid:[[0.5,0]],surface:'road',tex:'promTurf',risk:0.35,
     blurb:'Straight through the big agility tunnel. Much shorter than the bend round it, but the way in is tight: come in badly and you lose it all.'}],
  stamps:[
    {id:'pro1',dish:'Hundkex',ini:'H',kind:'intro',route:'main',i:PROM.sign+16,lat:5.6,
     hint:'Utanför porten, efter den stora skylten.',
     story:'A bone-shaped dog biscuit from the paper bag in the hall, hard enough to crunch across the whole flat. Bodil hears that bag open from three rooms away, through a closed door, in her sleep, and she has never once heard the word kom.'},
    {id:'pro2',dish:'Morotsbit',ini:'M',kind:'route',route:'busken',f:0.5,lat:0,
     hint:'Bakom busken, mitt på jordstigen.',
     story:'A piece of carrot: the treat that is supposed to be healthy. It gets carried round the flat with enormous ceremony, buried in the sofa, dug up again and eventually eaten with the expression of a dog who expected a sausage and is making the best of it.'},
    {id:'pro3',dish:'Vattenskål',ini:'V',kind:'route',route:'tunnel',f:0.5,lat:0,
     hint:'Mitt inne i den stora agilitytunneln.',
     story:'The steel water bowl at the end of every walk, refilled at the tap, emptied in eleven loud seconds and spread generously across the hall floor. Half goes in the dog, half goes on the floor, and all of the ears go in the bowl.'}],
  album:'dog',bonusNote:'Ingen cup. Bodils egen runda, hemma vid gården.',
  postcard:{draw:(g,w,h)=>promenadPostcard(g,w,h),caption:'En väldigt jobbig dag.'},
  hazards:H=>hazardsPromenad(H), scenery:()=>sceneryPromenad()
});
/** the track's control points: [x, z] pairs, height from the hillside */
function promCtrl(P){return P.map(([x,z])=>[x,promHill(x,z),z]);}


/* ───── where things are ───── */
/** which part of the lap a main-road sample is in */
function promSec(i){
  const S=PROM.sec;i=((Math.round(i)%N)+N)%N;
  if(i<S.street||i>=S.court)return 'court';if(i<S.woods)return 'street';if(i<S.lawn)return 'woods';
  if(i<S.agility)return 'lawn';if(i<S.park)return 'agility';return 'park';
}
/** the paved yard between the two rows of towers: its centre line rises to the east like the rows */
const promCourtZ=x=>-6-.13*(x+58);
function promInCourt(x,z,pad){const p=pad||0;return x>-98-p&&x<146+p&&Math.abs(z-promCourtZ(x))<24+p;}
/** the agility arena on the lawn below the yard */
const PROM_ARENA={x0:-70,x1:76,z0:82,z1:214};
function promInArena(x,z,pad){const p=pad||0,A=PROM_ARENA;return x>A.x0-p&&x<A.x1+p&&z>A.z0-p&&z<A.z1+p;}
/** the street along the west side, under the woods */
const PROM_STREET=[[-60,-330],[-92,-180],[-112,-60],[-118,40],[-110,140],[-92,250],[-70,360]];
function promStreetD(x,z){
  let best=1e9;
  for(let n=0;n<PROM_STREET.length-1;n++){const [ax,az]=PROM_STREET[n],[bx,bz]=PROM_STREET[n+1];
    const dx=bx-ax,dz=bz-az,t=clamp(((x-ax)*dx+(z-az)*dz)/(dx*dx+dz*dz),0,1);
    best=Math.min(best,Math.hypot(x-ax-dx*t,z-az-dz*t));}
  return best;
}
/** the hillside woods west of the street, and the ridge to the north */
const promWoods=(x,z)=>(x<-128&&promStreetD(x,z)>14)||z<-150;
/** inside a tower's footprint (with a margin) */
function promInBlock(x,z,pad){
  const h=PROM.size/2+(pad||0);
  return PROM.blocks.some(([bx,bz])=>{const dx=x-bx,dz=z-bz,c=Math.cos(.17),s=Math.sin(.17);
    return Math.abs(dx*c-dz*s)<h&&Math.abs(dx*s+dz*c)<h;});
}

function landPromenad(x,z,out){
  if(promInCourt(x,z,0)&&!promInBlock(x,z,1)){out.setHex(0x9a968e);return;}                   /* the yard's pavers */
  if(promStreetD(x,z)<6){out.setHex(0x55575a);return;}                                       /* the street */
  if(promInArena(x,z,0)){out.setHex(Math.floor((x+z*.3)/6)&1?0x5cae4a:0x52a042);return;}       /* the mown event field */
  if(promWoods(x,z)){const h=hash2(Math.floor(x/9),Math.floor(z/9));
    out.setHex(h<.3?0x5a5a34:h<.6?0x4a6a32:0x557a3a);}                                        /* leaf litter under the trees */
}

/* ───── roadside: a granite kerb in the yard and on the park path, logs along the woodland
   gravel, padded event barriers round the agility course ───── */
EDGES.promenad=st=>{
  const step=2,L=SEG*step+.1;
  const kerb=rosInst(flat(new THREE.BoxGeometry(.5,.32,L)).translate(0,.16,0),psMat({color:0xb4b0a8}),N*2);
  const log=rosInst(flat(new THREE.CylinderGeometry(.3,.3,L,6)).rotateX(Math.PI/2).translate(0,.24,0),psMat({}),N*2,true);
  const pad=rosInst(flat(new THREE.BoxGeometry(.5,.9,L-.15)).translate(0,.45,0),psMat({}),N*2,true);
  for(let i=0;i<N;i+=step)for(const side of [-1,1]){
    const o=side*(HW+1.2),x=sx[i]+rx[i]*o,z=sz[i]+rz[i]*o;
    if(nearAlt(x,z,2.6))continue;
    if(stations.some(S=>{let d=i-S.at;if(d<-N/2)d+=N;else if(d>N/2)d-=N;return S.side===side&&d>-3&&d<S.len+3;}))continue;
    const sec=promSec(i),y=meshY(x,z),yw=Math.atan2(fx[i],fz[i]);
    if(sec==='woods')log.put(x,y-.05,z,yw,1,1,1,(i/step)%3?0x6a4a30:0x5a3e28);
    else if(sec==='agility'){if(JUMPS.some(J=>Math.abs(i-J.at)<J.dn+3))continue;
      pad.put(x,y-.05,z,yw,1,1,1,[0x2f62c8,0xf2c81c,0xc8321f,0x3fa04a][((i/step)>>1)%4]);}
    else if(sec==='street')continue;
    else if(sec==='court'&&(i/step)%5)continue;                              /* the yard is open: a bollard now and then */
    else kerb.put(x,y-.05,z,yw);
  }
  kerb.done();log.done();pad.done();
};

/* ───── textures ───── */
/** façade, two window bays by two floors per tile: 0 dark brick with sliding wooden shutters,
    1 white slabs with glass balconies, 2 beige brick */
function promFacadeTex(kind){
  const t=pixTex(32,32,g=>{
    const R=(c,x,y,w,h)=>{g.fillStyle=c;g.fillRect(x,y,w,h);};
    if(kind===1){
      R('#8e969c',0,0,32,32);
      for(const f of [0,16]){
        R('#f2f0ea',0,f,32,2);                                            /* the slab edge */
        for(const b of [0,16]){R('#5e7486',b+2,f+3,12,12);R('#eeeae2',b+3,f+3,3,9);R('#8aa6ba',b+8,f+4,4,3);}
        g.fillStyle='rgba(206,226,236,.72)';g.fillRect(0,f+9,32,7);       /* the glass railing */
        R('#d8dee2',0,f+9,32,1);
        for(const x of [0,15,16,31])R('#eeece6',x,f+2,1,14);
      }
    }else{
      const brick=kind===0?['#4c4642','#3e3936','#5a534e']:['#c4a87c','#b09468','#d2b88c'];
      R(brick[0],0,0,32,32);
      for(let y=0;y<32;y+=2)for(let x=(y%4?0:2);x<32;x+=4){g.fillStyle=Math.random()>.5?brick[1]:brick[2];g.fillRect(x,y,3,1);}
      for(const f of [0,16])for(const b of [0,16]){
        if(kind===0){const swap=(f+b)%32===16;                             /* the shutter slid one way or the other */
          const wx=b+(swap?8:2),sxx=b+(swap?2:9);
          R('#22262a',wx,f+3,6,10);R('#3c4c5a',wx+1,f+4,4,8);R('rgba(255,230,180,.35)',wx+1,f+4,2,2);
          R('#9a6440',sxx,f+3,5,10);for(let x=sxx;x<sxx+5;x+=2)R('#7a4a2c',x,f+3,1,10);
          R('#2a2624',b+1,f+13,14,1);}
        else{R('#f2eee6',b+3,f+3,10,10);R('#3c4a58',b+4,f+4,8,8);R('#f2eee6',b+8,f+4,1,8);R('rgba(255,226,170,.5)',b+4,f+4,2,3);}
      }
    }
  });
  t.wrapS=t.wrapT=THREE.RepeatWrapping;return t;
}
/** a tennis ball: yellow-green felt, the white seam */
const promBallTex=()=>pixTex(32,16,g=>{
  g.fillStyle='#d4e83a';g.fillRect(0,0,32,16);
  for(let i=0;i<120;i++){g.fillStyle=Math.random()>.5?'rgba(240,250,120,.6)':'rgba(150,170,30,.5)';g.fillRect((Math.random()*32)|0,(Math.random()*16)|0,1,1);}
  g.fillStyle='#f6f6ee';for(let x=0;x<32;x++){g.fillRect(x,Math.round(8+Math.sin(x/32*6.283*2)*4),1,1);}
});

/* ───── dogs: every scenery dog in the game lives here ───── */
const PROM_BREEDS=[
  {c:0xd8b070,ear:'flop',s:1,leg:.48,len:1.15},                     /* a yellow labrador */
  {c:0x22201e,ear:'flop',s:1,leg:.48,len:1.15},                     /* a black one */
  {c:0xf2f0ea,spots:0x1e1c1c,ear:'flop',s:1,leg:.55,len:1.1},       /* a dalmatian */
  {c:0x8a4a22,ear:'flop',s:.75,leg:.18,len:1.5},                    /* a dachshund, low and long */
  {c:0xd88a3a,belly:0xf4f0e8,ear:'up',s:.75,leg:.2,len:1.15},       /* a corgi */
  {c:0x8a8e94,belly:0xf2f0ea,ear:'up',s:1,leg:.56,len:1.1},         /* a husky */
  {c:0xf4f2ee,ear:'flop',s:.85,leg:.5,len:.95,fluff:true},          /* a poodle */
  {c:0x6a3a1e,belly:0xf2ece2,ear:'long',s:.9,leg:.42,len:1.05},     /* a springer spaniel, Bodil's cousin */
  {c:0xc89a5a,belly:0xf4ead8,ear:'up',s:.6,leg:.3,len:.8}           /* a little terrier */
];
/** a low-poly dog, nose along +z, feet at y=0; returns {g, head, tail}. Body, head and tail are
    each folded into one mesh, so a field of them stays cheap */
function promDog(n){
  const B=PROM_BREEDS[((n%PROM_BREEDS.length)+PROM_BREEDS.length)%PROM_BREEDS.length];
  const g=new THREE.Group(),bodyG=new THREE.Group();g.add(bodyG);
  const coat=psMat({color:B.c}),dk=psMat({color:0x1a1616}),bl=psMat({color:B.belly||B.c});
  const L=B.len,Hl=B.leg,bw=.42;
  if(B.spots){const sp=psMat({map:pixTex(16,16,c=>{c.fillStyle='#f2f0ea';c.fillRect(0,0,16,16);
      c.fillStyle='#1e1c1c';for(let i=0;i<9;i++)c.fillRect((Math.random()*15)|0,(Math.random()*15)|0,2,2);})});
    const m=new THREE.Mesh(flat(new THREE.BoxGeometry(bw,.44,L)),sp);m.position.set(0,Hl+.24,0);g.add(m);}
  else hoorBox(bodyG,bw,.44,L,coat,0,Hl+.24,0);
  if(B.belly)hoorBox(bodyG,bw*.9,.2,L*.7,bl,0,Hl+.08,.05);
  if(B.fluff)for(const z of [-L/2,L/2-.1]){const f=new THREE.Mesh(flat(new THREE.IcosahedronGeometry(.32,0)),coat);f.position.set(0,Hl+.3,z);bodyG.add(f);}
  for(const [x,z] of [[-.14,L/2-.14],[.14,L/2-.14],[-.14,-L/2+.14],[.14,-L/2+.14]])hoorBox(bodyG,.13,Hl+.06,.13,z>0?bl:coat,x,(Hl+.06)/2,z);
  hoorMerge(bodyG);
  const head=new THREE.Group();head.position.set(0,Hl+.52,L/2-.02);g.add(head);
  hoorBox(head,.36,.36,.36,coat,0,.06,.1);
  hoorBox(head,.22,.18,.26,bl,0,-.02,.36);hoorBox(head,.09,.07,.06,dk,0,.04,.5);           /* the snout, the nose */
  for(const sd of [-1,1]){hoorBox(head,.06,.06,.03,dk,sd*.1,.14,.29);                      /* eyes */
    if(B.ear==='up'){const e=hoorBox(head,.12,.2,.06,coat,sd*.13,.32,.06);e.rotation.z=-sd*.2;}
    else{const e=hoorBox(head,.08,B.ear==='long'?.46:.3,.2,coat,sd*.21,B.ear==='long'?-.1:-.02,.06);e.rotation.z=sd*.12;}}
  hoorMerge(head);
  const tail=new THREE.Group();tail.position.set(0,Hl+.36,-L/2);g.add(tail);
  const tl=hoorBox(tail,.08,.08,.42,coat,0,.12,-.16);tl.rotation.x=.7;hoorMerge(tail);
  g.scale.setScalar(B.s*1.5);                                       /* scenery dogs read from a kart */
  return {g,head,tail};
}

/* ───── the scenery ───── */
function sceneryPromenad(){
  const RES=[];
  const res=(x,z,r)=>RES.push([x,z,r]);
  const free=(x,z,pad)=>{
    if(latAt(x,z)<HW+pad||promInBlock(x,z,3))return false;
    for(const r of RES)if(Math.hypot(x-r[0],z-r[1])<r[2])return false;
    return true;
  };
  const at=(i,o)=>{const q=mainPt(i,o);q.y=meshY(q.x,q.z);return q;};
  const yawAt=i=>{i=((Math.round(i)%N)+N)%N;return Math.atan2(fx[i],fz[i]);};
  const H=(a,b)=>hash2(a*1.37+3.1,b*0.71-2.3);
  const K=ALTS.find(r=>r.id==='busken'),T=ALTS.find(r=>r.id==='tunnel');
  const wood=psMat({color:0x8a5a34}),rust=psMat({color:0x8e4a2a}),dark=psMat({color:0x1e2022}),white=psMat({color:0xf2f0ea});
  const steel=psMat({color:0xa8aeb4}),conc=psMat({color:0xb8b4ac});
  PROM.dogs=[];PROM.anim=[];
  const dogAt=(n,x,z,yaw,watch)=>{const d=promDog(n);d.g.position.set(x,meshY(x,z),z);d.g.rotation.y=yaw;world.add(d.g);
    PROM.dogs.push({head:d.head,tail:d.tail,g:d.g,base:yaw,ph:H(x,z)*6,watch});res(x,z,1.6);return d;};
  for(const S_ of stations){const q=mainPt(S_.at+6,S_.side*(HW+13));res(q.x,q.z,22);}

  /* ── the six towers ── */
  {const FL=8,FH=3.1,S=PROM.size;
    const facades=[0,1,2].map(k=>promFacadeTex(k)),lists=[[],[],[]];
    for(const [x,z,k] of PROM.blocks){let y=1e9;
      for(const [a,b] of [[-1,-1],[1,-1],[-1,1],[1,1],[0,0]])y=Math.min(y,meshY(x+a*S/2,z+b*S/2));
      lists[k].push([x,y-.6,z]);res(x,z,S*.75);}
    lists.forEach((l,k)=>{if(!l.length)return;
      const M=rosInst(rosBoxUV(S,FL*FH+.6,S,7.4,FH*2),psMat({map:facades[k]}),8);
      for(const [x,y,z] of l)M.put(x,y,z,.17);M.done();});
    const cap=rosInst(flat(new THREE.BoxGeometry(S+.8,.7,S+.8)).translate(0,.35,0),psMat({color:0x6a4a3a}),8);
    const plant=rosInst(flat(new THREE.BoxGeometry(6,2.6,5)).translate(0,1.3,0),psMat({color:0x8a8a86}),8);
    const base=rosInst(flat(new THREE.BoxGeometry(S+.3,1.2,S+.3)).translate(0,.6,0),psMat({color:0x6a6662}),8);
    for(const l of lists)for(const [x,y,z] of l){cap.put(x,y+FL*FH+.6,z,.17);plant.put(x+3,y+FL*FH+1.3,z-2,.17);base.put(x,y,z,.17);}
    cap.done();plant.done();base.done();
  }

  /* ── home: the door (Porten), and the ground-floor window with the sofa and the television ── */
  {const B=PROM.home,S=PROM.size,g=new THREE.Group();
    const y0=Math.min(meshY(B.x-S/2,B.z+S/2),meshY(B.x+S/2,B.z+S/2));
    g.position.set(B.x,y0,B.z);g.rotation.y=.17;world.add(g);
    const f=S/2+.05;                                                         /* the south face, towards the yard */
    hoorBox(g,3.4,3.2,.4,dark,-3,1.6,f);hoorBox(g,2.6,2.7,.1,psMat({color:0xffe6b0,unlit:true}),-3,1.35,f+.22);   /* the door, lit */
    hoorBox(g,5,.3,2.4,dark,-3,3.45,f+1.2);for(const x of [-5.3,-.7])hoorBox(g,.14,3.4,.14,dark,x,1.7,f+2.3);  /* a canopy */
    hoorBox(g,3.2,.12,1.4,psMat({color:0x6a3a2a}),-3,.06,f+1);              /* the doormat */
    /* the window: a lit room in a shallow glass bay */
    const wx=6,ww=8,wh=3.6,wd=2.8,wall=psMat({color:0xe8d8bc}),flr=psMat({color:0xa07a52});
    hoorBox(g,ww,.2,wd,flr,wx,.1,f+wd/2);hoorBox(g,ww,.2,wd,dark,wx,wh+.1,f+wd/2);
    for(const sd of [-1,1])hoorBox(g,.2,wh,wd,wall,wx+sd*ww/2,wh/2+.1,f+wd/2);
    hoorBox(g,ww,wh,.1,wall,wx,wh/2+.1,f+.05);
    const sofa=psMat({color:0x56687a}),cush=psMat({color:0x6e8296});         /* the sofa along the west wall, facing the TV */
    hoorBox(g,1.0,.5,2.2,sofa,wx-ww/2+.7,.45,f+1.3);hoorBox(g,.3,.9,2.2,sofa,wx-ww/2+.3,.75,f+1.3);
    for(const z of [.25,2.35])hoorBox(g,1.0,.7,.25,sofa,wx-ww/2+.7,.55,f+z);
    hoorBox(g,.5,.4,.6,cush,wx-ww/2+.5,.9,f+.8);hoorBox(g,.9,.08,1,psMat({color:0xc8a040}),wx-ww/2+.75,.72,f+1.7);   /* a cushion, a blanket */
    hoorBox(g,1.2,.25,.9,psMat({color:0x8a5a3a}),wx+.2,.22,f+1.2);           /* the dog bed on the floor */
    hoorBox(g,.1,1.8,.1,dark,wx-ww/2+.4,.95,f+.3);hoorBox(g,.5,.4,.5,psMat({color:0xfff0c8,unlit:true}),wx-ww/2+.4,1.9,f+.3);   /* a floor lamp */
    hoorBox(g,1.2,.5,.5,psMat({color:0x6a4a32}),wx+ww/2-.6,.35,f+1.3);      /* the TV bench */
    hoorMerge(g);
    const tvc=document.createElement('canvas');tvc.width=32;tvc.height=20;
    const tvt=new THREE.CanvasTexture(tvc);tvt.magFilter=tvt.minFilter=THREE.NearestFilter;tvt.generateMipmaps=false;
    const tv=new THREE.Group();tv.position.set(wx+ww/2-.65,1.25,f+1.3);tv.rotation.y=-Math.PI/2+.75;g.add(tv);   /* turned towards the sofa and the window */
    tv.add(hoorBox(new THREE.Group(),.01,.01,.01,dark,0,0,0));
    const bez=new THREE.Mesh(flat(new THREE.BoxGeometry(1.7,1.05,.1)),dark);tv.add(bez);
    const scr=new THREE.Mesh(new THREE.PlaneGeometry(1.56,.92),psMat({map:tvt,unlit:true}));scr.position.z=.06;tv.add(scr);
    PROM.tv={c:tvc,t:tvt,mode:'',frame:-1,x:B.x,z:B.z+S/2+4};
    /* the glass front of the bay, with a frame */
    const gl=new THREE.Mesh(new THREE.PlaneGeometry(ww,wh),psMat({color:0xbcd4e0,transparent:true,opacity:.22,depthWrite:false}));
    gl.position.set(wx,wh/2+.1,f+wd);g.add(gl);
    const fr=new THREE.Group();g.add(fr);
    for(const x of [-ww/2,0,ww/2])hoorBox(fr,.14,wh,.14,dark,wx+x,wh/2+.1,f+wd);
    hoorBox(fr,ww,.14,.14,dark,wx,wh+.1,f+wd);hoorBox(fr,ww,.14,.14,dark,wx,.15,f+wd);
    hoorMerge(fr);
    /* the bike rack by the door */
    const bike=rosInst(flat(new THREE.BoxGeometry(.08,.9,1.6)).translate(0,.5,0),psMat({}),12,true);
    for(let n=0;n<6;n++)bike.put(B.x-11+n*.8+Math.sin(.17)*0,y0,B.z+S/2+3.4-n*.14,.17+Math.PI/2,1,1,1,[0xc8321f,0x2f78d8,0x1e2022,0x3fa04a,0xe8e4da,0xf2c81c][n]);
    bike.done();res(B.x-6,B.z+S/2+4,6);
    res(B.x+8,B.z+S/2+7,7);                                                   /* nothing planted between the window and the road */
  }

  /* ── the giant sign at Porten ── */
  {const i=PROM.sign,q=at(i,HW+5),g=new THREE.Group();g.position.set(q.x,q.y,q.z);g.rotation.y=yawAt(i)-.45;   /* turned to the karts leaving the door */
   world.add(g);res(q.x,q.z,5);
    const grn=psMat({color:0x2f6a3a});
    hoorBox(g,.5,9,.5,grn,0,4.5,0);
    hoorBox(g,1.6,2.2,1.2,grn,0,3.2,-.5);hoorBox(g,1.2,.5,.3,dark,0,2.6,-1.15);              /* the bag dispenser */
    hoorBox(g,.9,.04,.6,psMat({color:0x1e1e1e}),0,2.3,-1.35);                                  /* a bag hanging out */
    hoorBox(g,8.6,3.6,.3,grn,0,10.6,0);
    hoorMerge(g);
    const s=sibSign('HAR DU BAJSPÅSAR?','#f2f0ea','#1e3a24',176,36,8.2,3.2,12,'#2f6a3a');s.position.set(0,10.6,.18);g.add(s);
    const s2=sibSign('HAR DU BAJSPÅSAR?','#f2f0ea','#1e3a24',176,36,8.2,3.2,12,'#2f6a3a');s2.position.set(0,10.6,-.18);s2.rotation.y=Math.PI;g.add(s2);}

  /* ── the finish: NU VILAR VI on a gantry outside the door ── */
  {const g=new THREE.Group();g.position.set(sx[0],sy[0],sz[0]);g.rotation.y=yawAt(0);world.add(g);
    const blue=psMat({color:0x2f5ad8});
    for(const sd of [-1,1])hoorBox(g,1.2,9.1,1.2,blue,sd*(HW+2.6),4.5,0);
    hoorBox(g,(HW+3.1)*2+.2,2.1,1.25,blue,0,9.3,0);
    hoorMerge(g);
    for(const sd of [-1,1]){const s=sibSign('NU VILAR VI','#f4efe2','#2f5ad8',160,22,2*HW+5,2.0,12);s.position.set(0,9.3,sd*.66);if(sd<0)s.rotation.y=Math.PI;g.add(s);}}
  {const i=N-22,g=new THREE.Group();g.position.set(sx[i],sy[i],sz[i]);g.rotation.y=yawAt(i)+Math.PI;world.add(g);
    for(const sd of [-1,1])hoorBox(g,.3,9.4,.3,dark,sd*(HW+2.2),4.7,0);
    hoorMerge(g);
    const b=new THREE.Mesh(new THREE.PlaneGeometry(2*HW+3,1.8,8,1),psMat({map:horbyBannerTex('HEM TILL SOFFAN',176,22),unlit:true,side:THREE.DoubleSide}));
    const pa=b.geometry.attributes.position;for(let v=0;v<pa.count;v++){const x=pa.getX(v)/(HW+1.5);pa.setY(v,pa.getY(v)-(1-x*x)*.5);}
    b.position.set(0,8.6,0);g.add(b);}

  /* ── the yard: pavers, the deck round the sandpit, picnic tables, lamp posts, planted beds ── */
  {const pt=pixTex(16,16,c=>{c.fillStyle='#a6a29a';c.fillRect(0,0,16,16);
      for(let y=0;y<16;y+=4)for(let x=0;x<16;x+=8){const v=150+((Math.random()*26)|0);c.fillStyle='rgb('+v+','+(v-4)+','+(v-10)+')';c.fillRect((x+(y/4)%2*4)%16,y,7,3);}});
    pt.wrapS=pt.wrapT=THREE.RepeatWrapping;
    const st=3,X0=-98,X1=146,pos=[],uv=[],idx=[],nx=Math.ceil((X1-X0)/st),nz=Math.ceil(48/st);
    for(let a=0;a<=nz;a++)for(let b=0;b<=nx;b++){const x=X0+b*st,z=promCourtZ(x)-24+a*st;
      const out=!promInCourt(x,z,.1)||promInBlock(x,z,.5);
      pos.push(x,meshY(x,z)+(latAt(x,z)<HW+5||out?-1.4:.12),z);uv.push(x/8,z/8);}
    for(let a=0;a<nz;a++)for(let b=0;b<nx;b++){const p0=a*(nx+1)+b,p1=p0+1,p2=p0+nx+1,p3=p2+1;idx.push(p0,p2,p1,p1,p2,p3);}
    const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));
    geo.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));geo.setIndex(idx);geo.computeVertexNormals();
    world.add(new THREE.Mesh(geo,psMat({map:pt})));
  }
  {/* the deck: grey timber, sloping down to the sand in the middle (the yard's centrepiece) */
    const x=-12,z=promCourtZ(-12)+21,y=meshY(x,z),g=new THREE.Group();g.position.set(x,y,z);g.rotation.y=-.13;world.add(g);res(x,z,11);
    const dt=pixTex(16,16,c=>{c.fillStyle='#a8a090';c.fillRect(0,0,16,16);c.fillStyle='#8a8272';for(let y=0;y<16;y+=4)c.fillRect(0,y,16,1);
      c.fillStyle='rgba(60,50,40,.3)';for(let i=0;i<8;i++)c.fillRect((Math.random()*14)|0,(Math.random()*16)|0,2,1);});
    dt.wrapS=dt.wrapT=THREE.RepeatWrapping;dt.repeat.set(3,3);
    const dm=psMat({map:dt});
    for(const [w,d,px,pz,rx,rz] of [[16,3,0,-4.5,.18,0],[16,3,0,4.5,-.18,0],[3,6,-6.5,0,0,-.18],[3,6,6.5,0,0,.18]]){
      const m=new THREE.Mesh(flat(new THREE.BoxGeometry(w,.4,d)),dm);m.position.set(px,.35,pz);m.rotation.set(rx,0,rz);g.add(m);}
    hoorBox(g,10,.3,6,psMat({color:0xd8c89a}),0,.05,0);                                  /* the sand */
    hoorBox(g,1.2,.5,1,psMat({color:0xc8321f}),-2,.3,1);hoorBox(g,.5,.3,.5,psMat({color:0x2f78d8}),2.2,.25,-.8);   /* a bucket, a spade */
    hoorMerge(g);}
  /* picnic tables, rust-brown, either side of the yard */
  {const tab=rosInst(flat(new THREE.BoxGeometry(1.0,.1,2.4)).translate(0,.82,0),rust,20),ben=rosInst(flat(new THREE.BoxGeometry(.38,.1,2.4)).translate(0,.46,0),rust,40);
    const leg=rosInst(flat(new THREE.BoxGeometry(1.9,.82,.12)).translate(0,.41,0),psMat({color:0x6a3a22}),40);
    for(const [x,dz,yw] of [[-36,17,.3],[12,20,-.2],[44,13,.1],[-24,-17,0],[30,-20,.4],[80,-14,-.1],[96,14,.2]]){
      const z=promCourtZ(x)+dz;if(!free(x,z,2))continue;const y=meshY(x,z);
      tab.put(x,y,z,yw);for(const sd of [-1,1])ben.put(x+Math.cos(yw)*sd*.85,y,z-Math.sin(yw)*sd*.85,yw);
      for(const sd of [-1,1])leg.put(x+Math.sin(yw)*sd*.9,y,z+Math.cos(yw)*sd*.9,yw);res(x,z,3);}
    tab.done();ben.done();leg.done();}
  /* the tall black lamp posts with two heads, one high, one lower on the other side */
  {const pole=rosInst(flat(new THREE.CylinderGeometry(.1,.14,7.4,5)).translate(0,3.7,0),dark,80);
    const hd=rosInst(flat(new THREE.CylinderGeometry(.26,.2,.36,6)),dark,160),glow=rosInst(flat(new THREE.BoxGeometry(.3,.08,.3)),psMat({color:0xfff6dc,unlit:true}),160);
    const put=(x,z)=>{const y=meshY(x,z);pole.put(x,y,z,0);hd.put(x+.3,y+7.2,z,0);glow.put(x+.3,y+7.0,z,0);hd.put(x-.3,y+5.6,z,0);glow.put(x-.3,y+5.4,z,0);};
    for(let i=PROM.sec.court-6;i<N+PROM.sec.street;i+=12)for(const sd of [-1,1]){const q=at(i,sd*(HW+3.4));if(free(q.x,q.z,2.5)){put(q.x,q.z);res(q.x,q.z,2);}}
    for(let i=PROM.sec.park;i<PROM.sec.court;i+=16){const q=at(i,-(HW+3.4));if(free(q.x,q.z,2.5)){put(q.x,q.z);res(q.x,q.z,2);}}
    for(const [x,z] of [[-50,30],[0,10],[60,4],[120,-6],[-80,-24],[20,-38]])if(free(x,z,2))put(x,z);
    pole.done();hd.done();glow.done();}
  /* planted beds along the yard's edges: low shrubs behind a row of short wooden posts */
  {const sh=rosInst(flat(new THREE.IcosahedronGeometry(.9,0)).translate(0,.6,0),psMat({}),400,true),post=rosInst(flat(new THREE.BoxGeometry(.18,.6,.18)).translate(0,.3,0),wood,300);
    for(let i=PROM.sec.court+2;i<N+PROM.sec.street-4;i+=2)for(const sd of [-1,1]){const ii=i%N;if(promSec(ii)!=='court'||H(ii,sd)<.35)continue;
      const q=at(ii,sd*(HW+6.4));if(!free(q.x,q.z,5))continue;
      sh.put(q.x,q.y,q.z,H(sd,ii)*6,1+H(ii,1)*.6,.8+H(ii,2)*.5,1+H(ii,3)*.5,[0x4e8a3a,0x5c9a42,0x6aa64a,0x3f7a34][Math.floor(H(ii,4)*4)]);
      if(ii%4===0){const p=at(ii,sd*(HW+4.6));post.put(p.x,p.y,p.z,yawAt(ii));}}
    sh.done();post.done();}

  /* ── the street: tarmac and kerbs under the west side, cars parked along it ── */
  {const pos=[],idx=[],cols=[];let n=0;
    const strip=(w,lift,c)=>{const col=new THREE.Color(c),b=n;let k=0;
      for(let s=0;s<PROM_STREET.length-1;s++){const [ax,az]=PROM_STREET[s],[bx,bz]=PROM_STREET[s+1],L=Math.hypot(bx-ax,bz-az),m=Math.ceil(L/4);
        for(let j=0;j<m;j++){const t=j/m,x=lerp(ax,bx,t),z=lerp(az,bz,t),dx=(bz-az)/L,dz=-(bx-ax)/L;
          for(const sd of [-1,1]){const px=x+dx*w*sd,pz=z+dz*w*sd;pos.push(px,meshY(px,pz)+(latAt(px,pz)<HW+1?-1:lift),pz);cols.push(col.r,col.g,col.b);n++;}
          if(k)idx.push(n-4,n-2,n-3,n-3,n-2,n-1);k++;}}};
    strip(7,.16,0x9a9890);strip(4.6,.24,0x4c4e52);
    const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));
    geo.setAttribute('color',new THREE.Float32BufferAttribute(cols,3));geo.setIndex(idx);geo.computeVertexNormals();
    world.add(new THREE.Mesh(geo,psMat({vertexColors:true})));
    const car=rosInst(flat(new THREE.BoxGeometry(1.9,1.1,4.2)).translate(0,.75,0),psMat({}),30,true),cab=rosInst(flat(new THREE.BoxGeometry(1.7,.7,2.2)).translate(0,1.6,-.2),psMat({color:0x2a3440}),30);
    const cc=[0xc8c8c4,0x2a3a5a,0x8a1f1f,0x3a3a3c,0xe8e4da,0x2f5a3a];let c=0;
    for(let s=0;s<PROM_STREET.length-1;s++){const [ax,az]=PROM_STREET[s],[bx,bz]=PROM_STREET[s+1],L=Math.hypot(bx-ax,bz-az),yw=Math.atan2(bx-ax,bz-az);
      for(let d=6;d<L;d+=9){const t=d/L,x=lerp(ax,bx,t)+(bz-az)/L*3,z=lerp(az,bz,t)-(bx-ax)/L*3;
        if(H(x,z)<.5||!free(x,z,4))continue;const y=meshY(x,z);car.put(x,y+.2,z,yw,1,1,1,cc[c%cc.length]);cab.put(x,y+.2,z,yw);c++;res(x,z,3);}}
    car.done();cab.done();
    for(let s=0;s<PROM_STREET.length-1;s++){const [ax,az]=PROM_STREET[s],[bx,bz]=PROM_STREET[s+1];for(let t=.2;t<1;t+=.3)res(lerp(ax,bx,t),lerp(az,bz,t),8);}
  }

  /* ── the concrete steps with black railings, up the bank from the street into the woods ── */
  {const i0=PROM.sec.woods+2,steps=26,g=new THREE.Group();world.add(g);
    for(let n=0;n<steps;n++){const q=at(i0+n*.9,-(HW+7.5)),y=meshY(q.x,q.z);
      const s=hoorBox(g,3.2,.5,1.6,conc,q.x,y,q.z);s.rotation.y=q.yaw;
      if(n%2===0)for(const sd of [-1,1]){const p=at(i0+n*.9,-(HW+7.5)+sd*1.7);hoorBox(g,.08,1.1,.08,dark,p.x,meshY(p.x,p.z)+.8,p.z);}
      res(q.x,q.z,2.6);}
    for(const sd of [-1,1])for(let n=0;n<steps-1;n++){const a=at(i0+n*.9,-(HW+7.5)+sd*1.7),b=at(i0+(n+1)*.9,-(HW+7.5)+sd*1.7);
      strut(new THREE.Vector3(a.x,meshY(a.x,a.z)+1.35,a.z),new THREE.Vector3(b.x,meshY(b.x,b.z)+1.35,b.z),.08,dark);}
    hoorMerge(g);}

  /* ── Den Viktiga Busken: one absurdly prominent shrub, roped off, lit, admired ── */
  {const B=PROM.bush,y=meshY(B.x,B.z),g=new THREE.Group();g.position.set(B.x,y,B.z);g.scale.setScalar(1.6);world.add(g);res(B.x,B.z,22);   /* a clearing, so it is seen */
    const lv=[0x3f8a34,0x4e9a3c,0x5aa844,0x36782e];
    for(let n=0;n<11;n++){const a=n/11*6.283,r=n?2.6:0,s=n?2.6+H(n,1):3.6;
      const m=new THREE.Mesh(flat(new THREE.IcosahedronGeometry(s,1)),psMat({color:lv[n%4]}));m.position.set(Math.cos(a)*r,s+.4+(n%3)*.8,Math.sin(a)*r);g.add(m);}
    const top=new THREE.Mesh(flat(new THREE.IcosahedronGeometry(2.4,1)),psMat({color:0x5aa844}));top.position.y=7.2;g.add(top);
    for(let n=0;n<30;n++){const a=H(n,3)*6.283,h=1+H(n,4)*7,r=3.4+Math.sin(h/8*3)*1.6;
      hoorBox(g,.3,.3,.3,psMat({color:n%3?0xf4f0f4:0xe86a9a}),Math.cos(a)*r,h,Math.sin(a)*r);}   /* little flowers */
    const brass=psMat({color:0xd8a838});
    for(let n=0;n<12;n++){const a=n/12*6.283;hoorBox(g,.14,1.1,.14,brass,Math.cos(a)*8,.55,Math.sin(a)*8);
      const b=n+1,a2=b/12*6.283,mx=(Math.cos(a)+Math.cos(a2))*4,mz=(Math.sin(a)+Math.sin(a2))*4;
      const rope=hoorBox(g,.12,.12,8*2*Math.sin(Math.PI/12),psMat({color:0xa01828}),mx,.85,mz);rope.rotation.y=Math.atan2(Math.cos(a2)-Math.cos(a),Math.sin(a2)-Math.sin(a))+Math.PI/2;}
    /* a spotlight on a tripod, aimed at it */
    for(const [a,h] of [[.6,0],[3.4,1]]){const sx_=Math.cos(a)*10.5,sz_=Math.sin(a)*10.5;
      for(let k=0;k<3;k++){const l=hoorBox(g,.08,2.6,.08,dark,sx_+Math.cos(k*2.1)*.4,1.2,sz_+Math.sin(k*2.1)*.4);l.rotation.x=Math.sin(k*2.1)*.2;l.rotation.z=-Math.cos(k*2.1)*.2;}
      const lamp=hoorBox(g,.7,.6,.9,dark,sx_,2.6,sz_);lamp.rotation.y=Math.atan2(-sx_,-sz_);
      hoorBox(g,.5,.5,.1,psMat({color:0xfff6c8,unlit:true}),sx_*.95,2.6,sz_*.95).rotation.y=lamp.rotation.y;}
    hoorMerge(g);
    const pl=sibSign('DEN VIKTIGA BUSKEN','#2a2420','#e8c860',128,16,4.2,.6,8,'#d8a838');
    const pg=new THREE.Group(),pq={x:B.x+14.4,z:B.z};pg.position.set(pq.x,meshY(pq.x,pq.z),pq.z);pg.rotation.y=Math.PI/2;world.add(pg);
    hoorBox(pg,.12,1.2,.12,brass,-1.6,.6,0);hoorBox(pg,.12,1.2,.12,brass,1.6,.6,0);hoorMerge(pg);pl.position.set(0,1.45,0);pg.add(pl);
    /* the admirers: dogs round the hairpin, every one of them staring at it */
    let n=0;
    for(const [a,r] of [[.2,18.6],[1.4,19.2],[2.4,18.8],[4.0,19],[5.2,18.6],[3.0,19.4],[1.0,19.6]]){const x=B.x+Math.cos(a)*r,z=B.z+Math.sin(a)*r;
      if(latAt(x,z)<HW+1.5)continue;dogAt(n++,x,z,Math.atan2(B.x-x,B.z-z),'bush');}
    for(let i=PROM.sec.bush+6;i<PROM.sec.bush+80;i+=9){const q=at(i,(Math.sign(scurv[i])||1)*(HW+5.5)),side=Math.sign(scurv[i])||1;
      if(!free(q.x,q.z,4.5)||nearAlt(q.x,q.z,4))continue;dogAt(n++,q.x,q.z,Math.atan2(B.x-q.x,B.z-q.z),'bush');}
    {const s=at(PROM.sec.bush-30,HW+3.4),sg=new THREE.Group();sg.position.set(s.x,s.y,s.z);sg.rotation.y=yawAt(PROM.sec.bush-30)+Math.PI;world.add(sg);
      hoorBox(sg,.2,2.8,.2,wood,-2.8,1.4,0);hoorBox(sg,.2,2.8,.2,wood,2.8,1.4,0);hoorMerge(sg);
      const t=sibSign('DEN VIKTIGA BUSKEN →','#f4efe2','#3f6a2e',128,16,6.2,.9,8);t.position.set(0,3,0);sg.add(t);}
  }

  /* ── Bakom busken: worn dirt, roots, a sign saying what every dog already knows ── */
  if(K){const root=rosInst(flat(new THREE.CylinderGeometry(.16,.2,3,4)).rotateZ(Math.PI/2),psMat({color:0x5a3e28}),60);
    for(let j=COMMIT+2;j<K.n-MERGE;j+=3)for(const sd of [-1,1]){const q=lanePt(K,j/(K.n-1),sd*(K.hw+1.2));
      if(nearAltMain(q.x,q.z)<HW+1.5)continue;root.put(q.x,meshY(q.x,q.z)+.1,q.z,q.yaw+.4*sd);res(q.x,q.z,1.6);}
    root.done();
    const q=lanePt(K,(COMMIT+4)/(K.n-1),-(K.hw+1.4)),g=new THREE.Group();g.position.set(q.x,meshY(q.x,q.z),q.z);g.rotation.y=q.yaw+Math.PI;world.add(g);
    hoorBox(g,.14,2.2,.14,wood,0,1.1,0);hoorMerge(g);
    const s=sibSign('HUNDARNAS GENVÄG','#6a4a30','#f4efe2',112,14,3.2,.5,7);s.position.set(0,2.3,0);g.add(s);}

  /* ── the woods: oaks and beeches on the hillside, spruce higher up, birches at the edges ── */
  {const TN=1500,trT=rosInst(flat(new THREE.CylinderGeometry(.28,.42,7,5)).translate(0,3.5,0),psMat({}),TN,true);
    const trC=rosInst(flat(new THREE.IcosahedronGeometry(4.2,0)).translate(0,9,0),psMat({}),TN,true);
    const sp=rosInst(flat(new THREE.ConeGeometry(3,11,6)).translate(0,7.5,0),psMat({color:0x2a5230}),300);
    const plant=(x,z,big)=>{const y=meshY(x,z),r=hash2(x*.3,z*.3),s=big?1.25:rand(.8,1.15);
      if(r<.18&&!big){trT.put(x,y,z,0,.8,1,.8,0x5e4634);sp.put(x,y,z,rand(0,3),s,s*rand(.9,1.2),s);}
      else{const birch=r>.86;trT.put(x,y,z,0,s,s,s,birch?0xe8e6dc:0x5a4632);
        trC.put(x,y,z,rand(0,3),s*rand(.9,1.2),s*rand(.8,1.1),s*rand(.9,1.2),birch?0x8ab84a:[0x3f6e30,0x4a7a36,0x36602a,0x56883a][Math.floor(r*40)%4]);}
      res(x,z,3.4);};
    /* Pinnrakan: an avenue, the crowns meeting over the path */
    for(let i=PROM.sec.park+8;i<PROM.sec.court-10;i+=5)for(const sd of [-1,1]){const q=at(i,sd*(HW+3.6+H(i,sd)*1.4));
      if(free(q.x,q.z,2.8)&&!nearAlt(q.x,q.z,4))plant(q.x,q.z,true);}
    /* Nosrundan and the shrub's clearing: trunks close to the gravel on both sides */
    for(let i=PROM.sec.woods+4;i<PROM.sec.lawn+10;i+=2)for(const sd of [-1,1])for(const far of [0,1]){
      const q=at(i+H(i,far)*2,sd*(HW+3.4+far*7+H(sd,i+far)*5));
      if(promInArena(q.x,q.z,8)||promStreetD(q.x,q.z)<9||nearAlt(q.x,q.z,3)||!free(q.x,q.z,3)||Math.hypot(q.x-PROM.bush.x,q.z-PROM.bush.z)<16)continue;
      plant(q.x,q.z,far===0&&H(i,sd)>.5);}
    let n=0;for(let guard=0;guard<16000&&n<TN-120;guard++){
      const x=rand(-480,300),z=rand(-480,420);
      const woods=promWoods(x,z),edge=!woods&&(x>180||z>230||(x<-80&&z>60&&!promInArena(x,z,12)))&&H(x,z)<.45;
      if(!woods&&!edge)continue;
      if(promInArena(x,z,10)||promInCourt(x,z,6)||promStreetD(x,z)<9||!free(x,z,4+H(z,x)*3))continue;
      plant(x,z,false);n++;}
    trT.done();trC.done();sp.done();
    /* ferns and boulders on the woodland floor */
    const fern=rosInst(flat(new THREE.ConeGeometry(.9,.7,5)).translate(0,.35,0),psMat({color:0x4a8a3a}),500),rock=rosInst(flat(new THREE.DodecahedronGeometry(.8,0)),psMat({color:0x8a8a84}),80);
    for(let k=0,g2=0;k<500&&g2<8000;g2++){const x=rand(-420,-110),z=rand(-160,260);if(!promWoods(x,z)||!free(x,z,1.6))continue;
      const y=meshY(x,z);if(k%7===0)rock.put(x,y+.2,z,rand(0,3),rand(.6,1.6),rand(.5,1),rand(.6,1.4));else fern.put(x,y,z,rand(0,3),rand(.7,1.3));k++;}
    fern.done();rock.done();
    /* a bench and a green dog-bag bin now and then along Nosrundan */
    const ben=rosInst(flat(new THREE.BoxGeometry(2.2,.1,.5)).translate(0,.5,0),wood,30),bin=rosInst(flat(new THREE.BoxGeometry(.6,1.0,.5)).translate(0,.5,0),psMat({color:0x2f6a3a}),30);
    for(let i=PROM.sec.woods+10;i<PROM.sec.lawn;i+=34){const sd=-(Math.sign(scurv[i])||1),q=at(i,sd*(HW+3));if(!free(q.x,q.z,2.4)||nearAlt(q.x,q.z,3))continue;
      ben.put(q.x,q.y,q.z,q.yaw);const b=at(i+2,sd*(HW+2.6));bin.put(b.x,b.y,b.z,b.yaw);res(q.x,q.z,2.5);}
    ben.done();bin.done();
    const s=at(PROM.sec.woods+4,HW+3.2),sg=new THREE.Group();sg.position.set(s.x,s.y,s.z);sg.rotation.y=yawAt(PROM.sec.woods+4)+Math.PI;world.add(sg);
    hoorBox(sg,.2,2.6,.2,wood,-2,1.3,0);hoorBox(sg,.2,2.6,.2,wood,2,1.3,0);hoorMerge(sg);
    const t=sibSign('NOSRUNDAN','#6a4a30','#f4efe2',96,16,4.6,.8,9);t.position.set(0,2.8,0);sg.add(t);
  }

  /* ── Agilityängen: the event fence, the spectators, the equipment, the tunnels ── */
  {const A=PROM.sec.agility,P_=PROM.sec.park;
    /* the outer event fence, white panels with a coloured band; dogs and owners behind it */
    const panel=rosInst(flat(new THREE.BoxGeometry(.12,1.1,SEG*2-.1)).translate(0,.55,0),white,600),band=rosInst(flat(new THREE.BoxGeometry(.14,.28,SEG*2-.1)).translate(0,.8,0),psMat({}),600,true);
    let dn=20;const people=[];
    for(let i=A-6;i<P_+4;i+=2){const side=Math.sign(scurv[i])||1,out=side;            /* the outside of the bend */
      for(const sd of [-1,1]){const q=at(i,sd*(HW+7));
        if(promInCourt(q.x,q.z,0)||nearAlt(q.x,q.z,5)||latAt(q.x,q.z)<HW+6.5)continue;
        panel.put(q.x,q.y,q.z,q.yaw);band.put(q.x,q.y,q.z,q.yaw,1,1,1,[0x2f62c8,0xf2c81c,0xc8321f][((i>>1)%3)]);res(q.x,q.z,1.2);
        if(sd===out&&i%7===0&&H(i,sd)>.3){const d=at(i,sd*(HW+9));if(free(d.x,d.z,8.5)){dogAt(dn++,d.x,d.z,Math.atan2(-sd*rx[i],-sd*rz[i]),'race');
          if(H(sd,i)>.4){const p=at(i+1.2,sd*(HW+10.4));if(free(p.x,p.z,9.6))people.push([p.x,p.z,Math.atan2(-sd*rx[i],-sd*rz[i]),i]);}}}}}
    panel.done();band.done();
    for(const [x,z,yw,i] of people){const nb=lerumNeighbour([0xc8321f,0x2f78d8,0xf2c81c,0x3fa04a,0xe86a9a,0x8b4fb5][i%6],[0x3a2a1e,0xd8c08a,0x8a8a8a,0x6a3a22][i%4],false);
      nb.g.position.set(x,meshY(x,z),z);nb.g.rotation.y=yw;world.add(nb.g);res(x,z,1.4);}
    /* weave poles, hurdles, a tyre jump and the A-frame in the infield */
    const pole=rosInst(flat(new THREE.CylinderGeometry(.06,.06,1.6,4)).translate(0,.8,0),psMat({}),200,true);
    const bar=rosInst(flat(new THREE.CylinderGeometry(.05,.05,2.4,4)).rotateZ(Math.PI/2),psMat({}),60,true);
    const up=rosInst(flat(new THREE.BoxGeometry(.12,1.3,.12)).translate(0,.65,0),white,120);
    const spot=(f,pad)=>{for(let k=0;k<40;k++){const x=lerp(PROM_ARENA.x0+8,PROM_ARENA.x1-8,H(f,k)),z=lerp(PROM_ARENA.z0+8,PROM_ARENA.z1-8,H(k,f));
      if(free(x,z,pad)&&!nearAlt(x,z,pad))return [x,z];}return null;};
    for(let w=0;w<3;w++){const s=spot(w+1,6);if(!s)continue;const yw=H(w,9)*3;
      for(let k=0;k<12;k++){const x=s[0]+Math.sin(yw)*(k-6)*.7,z=s[1]+Math.cos(yw)*(k-6)*.7;pole.put(x,meshY(x,z),z,0,1,1,1,k%2?0xf4f2ee:0xc8321f);}
      res(s[0],s[1],5.5);}
    for(let h=0;h<5;h++){const s=spot(h+11,4);if(!s)continue;const yw=H(h,7)*3,y=meshY(s[0],s[1]);
      for(const sd of [-1,1])up.put(s[0]+Math.cos(yw)*sd*1.2,y,s[1]-Math.sin(yw)*sd*1.2,yw);
      bar.put(s[0],y+.7,s[1],yw,1,1,1,[0x2f62c8,0xf2c81c,0xc8321f,0x3fa04a][h%4]);bar.put(s[0],y+1.1,s[1],yw,1,1,1,0xf4f2ee);res(s[0],s[1],2.5);}
    pole.done();bar.done();up.done();
    {const s=spot(21,7);if(s){const g=new THREE.Group(),y=meshY(s[0],s[1]);g.position.set(s[0],y,s[1]);g.rotation.y=H(4,4)*3;world.add(g);res(s[0],s[1],6);
      for(const sd of [-1,1]){const p=hoorBox(g,1.2,.12,4.2,psMat({color:0x2f62c8}),0,1.4,sd*1.6);p.rotation.x=sd*.72;
        const c=hoorBox(g,1.22,.13,1.2,psMat({color:0xf2c81c}),0,.45,sd*2.9);c.rotation.x=sd*.72;}
      hoorMerge(g);}}
    {const s=spot(31,5);if(s){const g=new THREE.Group(),y=meshY(s[0],s[1]);g.position.set(s[0],y,s[1]);world.add(g);res(s[0],s[1],3);
      for(const sd of [-1,1])hoorBox(g,.14,2.6,.14,white,sd*1.2,1.3,0);hoorBox(g,2.54,.14,.14,white,0,2.6,0);
      const t=new THREE.Mesh(flat(new THREE.TorusGeometry(.6,.16,4,10)),psMat({color:0xf2c81c}));t.position.y=1.5;g.add(t);hoorMerge(g);}}
    /* decorative tunnels lying beside the racing line, curved and striped */
    const tunTex=c1=>{const t=pixTex(16,8,c=>{for(let x=0;x<16;x+=4){c.fillStyle=x%8?c1:'#f4f2ee';c.fillRect(x,0,4,8);}});t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(4,1);return t;};
    for(const [i,sd,c1] of [[A+12,1,'#2f62c8'],[A+70,-1,'#c8321f'],[P_-30,1,'#3fa04a'],[A+100,-1,'#e8a020']]){
      const side=sd*(Math.sign(scurv[i])||1),q=at(i,side*(HW+3.6));if(!free(q.x,q.z,3)||nearAlt(q.x,q.z,4))continue;
      const m=new THREE.Mesh(new THREE.TorusGeometry(5,1.1,6,10,Math.PI*.8),psMat({map:tunTex(c1),side:THREE.DoubleSide}));
      m.rotation.set(Math.PI/2,0,yawAt(i)-Math.PI*.4);m.position.set(q.x,q.y+.6,q.z);world.add(m);res(q.x,q.z,5);}
    /* the judges' gazebo and the scoreboard */
    {const s=spot(41,9);if(s){const g=new THREE.Group(),y=meshY(s[0],s[1]);g.position.set(s[0],y,s[1]);g.rotation.y=H(2,2)*3;world.add(g);res(s[0],s[1],7);
      for(const [x,z] of [[-2.5,-2.5],[2.5,-2.5],[-2.5,2.5],[2.5,2.5]])hoorBox(g,.14,2.6,.14,white,x,1.3,z);
      const r=new THREE.Mesh(flat(new THREE.ConeGeometry(4,1.4,4)).rotateY(Math.PI/4),psMat({color:0xf4f2ee}));r.position.y=3.3;g.add(r);
      hoorBox(g,3,.8,1,psMat({color:0x2f62c8}),0,.4,-1.4);hoorMerge(g);}}
    {const i=A+30,side=-(Math.sign(scurv[i])||1),q=at(i,side*(HW+12));if(free(q.x,q.z,10)){const g=new THREE.Group();g.position.set(q.x,q.y,q.z);g.rotation.y=yawAt(i)+(side>0?-Math.PI/2:Math.PI/2);world.add(g);res(q.x,q.z,6);
      hoorBox(g,.3,6,.3,dark,-4,3,0);hoorBox(g,.3,6,.3,dark,4,3,0);hoorMerge(g);
      const b=sibSign('AGILITYÄNGEN','#2f62c8','#f2c81c',128,20,8.6,1.6,10,'#f4f2ee');b.position.set(0,5.6,.2);g.add(b);
      const b2=sibSign('NOLL FEL · NOLL RÄTT','#1e2022','#f4f2ee',128,14,8.6,.9,8);b2.position.set(0,4.5,.2);g.add(b2);}}
    /* the low ramp: painted like a dog walk, blue with yellow contact zones */
    const J=JUMPS[0];
    if(J){const tex=pixTex(32,16,c=>{c.fillStyle='#2f62c8';c.fillRect(0,0,32,16);c.fillStyle='#1e4aa8';for(let y=0;y<16;y+=4)c.fillRect(0,y,32,1);});
      const yl=pixTex(32,16,c=>{c.fillStyle='#f2c81c';c.fillRect(0,0,32,16);c.fillStyle='#c8a010';for(let y=0;y<16;y+=4)c.fillRect(0,y,32,1);});
      const mk=(m,cnt)=>new THREE.InstancedMesh(flat(new THREE.BoxGeometry(2*HW-1.2,.12,SEG*1.02)),psMat({map:m}),cnt);
      const blue=mk(tex,J.up+1),yel=mk(yl,J.up+1),o=new THREE.Object3D();o.rotation.order='YXZ';let nb=0,ny=0;
      for(let k=-J.up;k<=0;k++){const ii=(J.at+k+N)%N;o.position.set(sx[ii],sy[ii]+.06,sz[ii]);
        o.rotation.set(-Math.atan2(sy[(ii+1)%N]-sy[(ii-1+N)%N],2*SEG),yawAt(ii),0);o.updateMatrix();
        if(k<-J.up+3)yel.setMatrixAt(ny++,o.matrix);else blue.setMatrixAt(nb++,o.matrix);}
      blue.count=nb;yel.count=ny;blue.frustumCulled=yel.frustumCulled=false;world.add(blue);world.add(yel);}
    /* Genom tunneln: the big striped tube over the lane, open at both ends */
    if(T){const j0=COMMIT+4,j1=T.n-MERGE-4,r=T.hw+2.2,ring=new THREE.TorusGeometry(r,.5,4,14,Math.PI);
      const cols=[0x2f62c8,0xf2c81c,0xc8321f,0x3fa04a];
      const rm=rosInst(flat(ring),psMat({}),80,true),skin=[];
      for(let j=j0;j<=j1;j++){const q=lanePt(T,j/(T.n-1),0),y=T.Y[j];
        rm.put(q.x,y,q.z,q.yaw,1,1,1,cols[j%4]);}
      rm.done();
      /* a canvas skin between the hoops */
      const tex=pixTex(16,8,c=>{c.fillStyle='#2f62c8';c.fillRect(0,0,16,8);c.fillStyle='#f2c81c';c.fillRect(0,0,16,2);c.fillRect(0,4,16,1);});
      tex.wrapS=tex.wrapT=THREE.RepeatWrapping;
      const pos=[],uv=[],idx=[],M=12;
      for(let j=j0;j<=j1;j++){const q=lanePt(T,j/(T.n-1),0),y=T.Y[j];
        for(let m=0;m<=M;m++){const a=m/M*Math.PI,l=Math.cos(a)*r,h=Math.sin(a)*r;
          pos.push(q.x+q.rx*l,y+h,q.z+q.rz*l);uv.push(m/M*3,j*.5);}}
      for(let j=0;j<j1-j0;j++)for(let m=0;m<M;m++){const p0=j*(M+1)+m,p1=p0+1,p2=p0+M+1,p3=p2+1;idx.push(p0,p1,p2,p1,p3,p2);}
      const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));
      geo.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));geo.setIndex(idx);geo.computeVertexNormals();
      world.add(new THREE.Mesh(geo,psMat({map:tex,side:THREE.DoubleSide})));
      for(let j=j0;j<=j1;j+=2){const q=lanePt(T,j/(T.n-1),0);res(q.x,q.z,r+1);}
      const q=lanePt(T,j0/(T.n-1),0),g=new THREE.Group();g.position.set(q.x,T.Y[j0],q.z);g.rotation.y=q.yaw+Math.PI;world.add(g);
      const s=sibSign('TUNNEL','#f2c81c','#1e2022',64,14,4,.8,9);s.position.set(0,r+.9,0);g.add(s);}
  }

  /* ── Pinnrakan: the enormous fallen branch across the path, resting on both banks ── */
  {const i=PROM.branch,a=at(i,-(HW+9)),b=at(i+3,HW+9),bark=psMat({color:0x6a5034}),g=new THREE.Group();world.add(g);
    const pa=new THREE.Vector3(a.x,sy[i]+5.6,a.z),pb=new THREE.Vector3(b.x,sy[i]+7.2,b.z);
    const log=strut(pa,pb,2.2,bark);world.remove(log);g.add(log);
    const st1=hoorBox(g,3.4,6.6,3.4,psMat({color:0x5a4430}),a.x,meshY(a.x,a.z)+3.1,a.z);                    /* the stump it fell from */
    const rk=new THREE.Mesh(flat(new THREE.DodecahedronGeometry(3.6,0)),psMat({color:0x8a8a84}));rk.position.set(b.x,meshY(b.x,b.z)+3,b.z);g.add(rk);   /* a boulder it landed on */
    for(let n=0;n<7;n++){const t=.15+n*.12,p=pa.clone().lerp(pb,t),up=new THREE.Vector3(p.x+(H(n,1)-.5)*5,p.y+3+H(n,2)*3,p.z+(H(n,3)-.5)*5);
      const tw=strut(p,up,.5,bark);world.remove(tw);g.add(tw);
      const lf=new THREE.Mesh(flat(new THREE.IcosahedronGeometry(1.6,0)),psMat({color:[0x4a7a36,0x5a8a3a,0x8a9a3a][n%3]}));lf.position.copy(up);g.add(lf);}
    hoorMerge(g);res(a.x,a.z,5);res(b.x,b.z,5);
    const s=at(i-14,HW+3.2),sg=new THREE.Group();sg.position.set(s.x,s.y,s.z);sg.rotation.y=yawAt(i-14)+Math.PI;world.add(sg);
    hoorBox(sg,.2,2.6,.2,wood,-2.2,1.3,0);hoorBox(sg,.2,2.6,.2,wood,2.2,1.3,0);hoorMerge(sg);
    const t=sibSign('PINNRAKAN','#6a4a30','#f4efe2',96,16,4.8,.8,9);t.position.set(0,2.8,0);sg.add(t);
    const t2=sibSign('FÅR EJ TAS MED HEM','#f4efe2','#8a2a1a',112,12,4.8,.5,7);t2.position.set(0,2.15,.01);sg.add(t2);}
  /* park benches and bins along the avenue */
  {const ben=rosInst(flat(new THREE.BoxGeometry(2.2,.1,.5)).translate(0,.5,0),wood,20),bk=rosInst(flat(new THREE.BoxGeometry(2.2,.5,.08)).translate(0,.8,-.22),wood,20);
    for(let i=PROM.sec.park+20;i<PROM.sec.court-10;i+=22){const q=at(i,-(HW+2.8));if(!free(q.x,q.z,2.2))continue;ben.put(q.x,q.y,q.z,q.yaw+Math.PI/2);bk.put(q.x,q.y,q.z,q.yaw+Math.PI/2);res(q.x,q.z,2);}
    ben.done();bk.done();}

  /* ── the neighbourhood: the old red-brick building north of the towers, offices to the east,
     more blocks beyond, all in the facade style of the area ── */
  {const red=pixTex(16,16,c=>{c.fillStyle='#a8452e';c.fillRect(0,0,16,16);c.fillStyle='rgba(60,20,10,.25)';for(let y=1;y<16;y+=3)c.fillRect(0,y,16,1);
      c.fillStyle='#f4f0e6';c.fillRect(4,3,8,10);c.fillStyle='#3c4a58';c.fillRect(5,4,6,8);c.fillStyle='#f4f0e6';c.fillRect(5,8,6,1);c.fillRect(8,4,1,8);});
    red.wrapS=red.wrapT=THREE.RepeatWrapping;
    const l=[[20,meshY(20,-150)-.4,-150,.17,140,22,16]];
    world.add(new THREE.Mesh(borasMergeBoxes(l),psMat({map:red})));
    const rf=rosInst(flat(new THREE.BoxGeometry(1,.6,1)).translate(0,.3,0),psMat({color:0x3a3c40}),300);rf.put(20,l[0][1]+16,-150,.17,141,1,23);res(20,-150,72);
    const tex=['#c2a77c','#d8d0c0','#a8a49c','#8a7a6a'].map(c=>borasFacadeTex(c,c!=='#d8d0c0')),lists=tex.map(()=>[]);
    const cand=[[230,60,30,20,20],[236,-60,24,22,26],[200,-140,30,22,22],[110,-190,40,22,18],[-30,-210,30,20,18],[260,170,30,26,16],[180,300,40,20,14],[60,320,36,20,14],
      [-40,300,30,22,12],[300,-10,24,24,30],[320,100,30,24,18]];
    for(const [x,z,L,D,Ht] of cand){if(!free(x,z,L/2+2)||promWoods(x,z))continue;const k=Math.floor(H(x,z)*tex.length);
      lists[k].push([x,meshY(x,z)-.3,z,.17,L,D,Ht]);rf.put(x,meshY(x,z)-.3+Ht,z,.17,L+.4,1,D+.4);res(x,z,Math.max(L,D)/2+3);}
    lists.forEach((li,k)=>{if(li.length)world.add(new THREE.Mesh(borasMergeBoxes(li),psMat({map:tex[k]})));});
    rf.done();
    /* a car park by the red building */
    const car=rosInst(flat(new THREE.BoxGeometry(1.9,1.1,4.2)).translate(0,.75,0),psMat({}),40,true),cab=rosInst(flat(new THREE.BoxGeometry(1.7,.7,2.2)).translate(0,1.6,-.2),psMat({color:0x2a3440}),40);
    for(let n=0;n<18;n++){const x=-40+n*7+Math.floor(n/9)*4,z=-118-.17*(x-20)+(n%2)*0;if(H(n,5)<.3||!free(x,z,2))continue;const y=meshY(x,z);
      car.put(x,y,z,.17,1,1,1,[0xc8c8c4,0x2a3a5a,0x8a1f1f,0x3a3a3c,0xe8e4da,0x2f5a3a][n%6]);cab.put(x,y,z,.17);}
    car.done();cab.done();}

  /* ── the forty-seven interesting smells: little numbered markers round the lap ── */
  {const atlas=pixTex(128,64,c=>{for(let n=0;n<48;n++){const x=(n%8)*16,y=Math.floor(n/8)*10;
      c.fillStyle='#f2c81c';c.fillRect(x,y,16,10);c.fillStyle='#1e2022';c.fillRect(x+1,y+3,3,3);c.fillRect(x+2,y+2,1,1);   /* a sniffing nose */
      c.font='7px "Press Start 2P",monospace';c.textAlign='center';c.textBaseline='middle';c.fillText(String(n+1),x+10,y+5.5);}});
    const pos=[],uv=[],idx=[];let n=0;
    const post=rosInst(flat(new THREE.BoxGeometry(.08,1.1,.08)).translate(0,.55,0),white,48);
    for(let k=0;k<47;k++){let done=false;
      for(let tries=0;tries<16&&!done;tries++){const i=Math.round(N*(k+.3)/47)+(tries>>1)*2,sd=((k+tries)%2?1:-1),q=at(i,sd*(HW+2.4));   /* this side, then the other */
        if(nearAlt(q.x,q.z,3)||!clearOfForks(((i%N)+N)%N,4)||!free(q.x,q.z,1.6))continue;
        post.put(q.x,q.y,q.z,0);
        const yw=yawAt(i)+Math.PI,cx=Math.cos(yw),cz=-Math.sin(yw),b=pos.length/3,w=.5,h=.32,y=q.y+1.2;
        pos.push(q.x-cx*w,y-h,q.z-cz*w, q.x+cx*w,y-h,q.z+cz*w, q.x+cx*w,y+h,q.z+cz*w, q.x-cx*w,y+h,q.z-cz*w);
        const u0=(k%8)*16/128,u1=u0+16/128,v1=1-Math.floor(k/8)*10/64,v0=v1-10/64;
        uv.push(u0,v0,u1,v0,u1,v1,u0,v1);idx.push(b,b+1,b+2,b,b+2,b+3);n++;done=true;}}
    post.done();
    const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));
    geo.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));geo.setIndex(idx);geo.computeVertexNormals();
    world.add(new THREE.Mesh(geo,psMat({map:atlas,unlit:true,side:THREE.DoubleSide})));
    PROM.smells=n;}
}

/* ───── hazards: the ball launcher on Pinnrakan, the sprinkler's wet patch in the yard; the dogs,
   the television ───── */
/** the ball launcher's thunk */
function promThunk(vol){if(!actx)return;audioTone(140,60,.18,.12*(vol||1),'square');audioTone(900,1400,.08,.03*(vol||1),'sine',.02);}
/** the television: static and a weather map, until a cartoon dog bounces across for a couple of seconds */
function promTV(mode,frame){
  const T=PROM.tv;if(!T||(T.mode===mode&&T.frame===frame))return;
  T.mode=mode;T.frame=frame;
  const g=T.c.getContext('2d'),R=(c,x,y,w,h)=>{g.fillStyle=c;g.fillRect(x,y,w,h);};
  if(mode==='dog'){
    R('#7ac8f0',0,0,32,20);R('#5ab040',0,14,32,6);R('#f8f4e4',4+frame%3,3,6,2);
    const x=2+(frame*3)%22,y=frame%2?7:8;                                   /* a cartoon dog, bouncing along */
    R('#e8a040',x,y+2,9,4);R('#e8a040',x+7,y-1,5,4);R('#1e1c1c',x+11,y,1,1);R('#1e1c1c',x+10,y-1,1,1);
    R('#a86020',x+7,y-2,2,4);R('#e8a040',x-2,y+1-(frame%2),3,1);
    for(const lx of [x+1,x+3,x+6,x+8])R('#e8a040',lx,y+6,1,2+(frame+lx)%2);
    R('#c8321f',x+8,y+3,3,1);
  }else{
    R('#2a3a5a',0,0,32,20);R('#4a8a3a',4,4,10,9);R('#4a8a3a',16,6,8,8);R('#f4f2ee',22,2,8,4);   /* the weather map */
    R('#f2c81c',8,6,3,3);R('#f4f2ee',18,9,4,2);R('#1e2022',0,17,32,3);R('#f4f2ee',2+frame%20,18,8,1);
  }
  T.t.needsUpdate=true;
}
function hazardsPromenad(H){
  vastPA();
  const inPool=(k,i,lat,a,b)=>{if(k.rib||k.air)return false;
    const dx=k.x-(sx[i]+rx[i]*lat),dz=k.z-(sz[i]+rz[i]*lat),f=dx*fx[i]+dz*fz[i],l=dx*rx[i]+dz*rz[i];
    return (f*f)/(a*a)+(l*l)/(b*b)<1;};
  /* the automatic ball launcher: its lamp flashes, then a ball as big as a kart rolls out across
     the west half of Pinnrakan, stops, and is called home again. The east side is always clear. */
  {const i=PROM.launcher,sd=-1,home=sd*(HW+2.6),far=sd*-1.2,R=1.5;
    const m=new THREE.Group(),q=mainPt(i,sd*(HW+4.2));m.position.set(q.x,meshY(q.x,q.z),q.z);m.rotation.y=q.yaw+Math.PI/2;world.add(m);
    hoorBox(m,2.6,2.2,2.4,psMat({color:0xe86a1c}),0,1.1,0);hoorBox(m,2.7,.4,2.5,psMat({color:0x1e2022}),0,2.4,0);
    hoorBox(m,.4,1.6,1.4,psMat({color:0x2a2c30}),1.4,1.2,0);                     /* the mouth, towards the path */
    hoorMerge(m);
    const lamp=new THREE.Mesh(flat(new THREE.SphereGeometry(.4,6,4)),psMat({color:0xff3a1c,unlit:true}));lamp.position.set(0,2.9,0);m.add(lamp);
    const s=sibSign('BOLLKASTAREN','#1e2022','#f2c81c',96,14,2.6,.42,7);s.position.set(0,1.6,1.22);m.add(s);
    const ball=new THREE.Mesh(flat(new THREE.SphereGeometry(R,10,7)),psMat({map:promBallTex()}));world.add(ball);
    const paint=psMat({color:0xf4f2ec,unlit:true,transparent:true,opacity:.8,depthWrite:false});
    for(const k of [-8,-4,0,4,8]){const p=mainPt(i+k,4.2),d=new THREE.Mesh(new THREE.PlaneGeometry(.35,SEG*2.2).rotateX(-Math.PI/2),paint);
      d.position.set(p.x,p.y+.07,p.z);d.rotation.y=p.yaw;world.add(d);}             /* a dashed line: keep right of it */
    let roll=0,last=0,beep=0;
    H.push({id:'bollkastare',period:7.5,phase:2,mesh:ball,
      update(u,dt){
        const warn=u<.16,out=smooth(.16,.36,u),back=smooth(.62,.86,u),v=out*(1-back);
        const l=lerp(home,far,v),p=mainPt(i,l);
        const y=Math.abs(l)<HW+.5?p.y:meshY(p.x,p.z);
        ball.position.set(p.x,y+R+(v>.98?Math.abs(Math.sin(clock*9))*.15:0),p.z);
        roll+=(l-last)/R;last=l;ball.rotation.set(0,p.yaw,roll);
        ball.visible=v>.02;
        lamp.material.uniforms.uColor.value.setHex(warn&&Math.floor(clock*8)%2?0xffe040:0x6a1a10);
        const near=player&&Math.hypot(player.x-p.x,player.z-p.z)<90&&state==='race';
        if(near&&warn){beep-=dt;if(beep<=0){beep=.25;ping(1500,1500,.05);}}
        if(near&&u>=.16&&u<.17&&this.fired!==Math.floor(raceTime/7.5)){this.fired=Math.floor(raceTime/7.5);promThunk(.8);}
        this.p={x:p.x,y,z:p.z};this.on=v>.12;
      },
      hit(k){return this.on&&!k.rib&&near3(k,this.p.x,this.p.y,this.p.z,R+1.1);},
      effect(k){k.spun=Math.max(k.spun,.8*k.spinResist);k.slow=Math.max(k.slow,.5);k.boost=0;k.drift=0;k.charge=0;
        for(let n=0;n<12;n++)puff(k.x+rand(-1,1),k.y+rand(.3,1.4),k.z+rand(-1,1),.85,.92,.3,.6);
        if(k===player){toast('BOLLEN!');promThunk(1);shake=Math.min(1,shake+.4);}}});
  }
  /* the sprinkler on the yard's lawn and its wet patch, outlined, on the inside of the path */
  {const i=PROM.sprinkler,lat=-4.2,A=5.6,B=3.2;
    const p=mainPt(i,lat),g=new THREE.Group();g.position.set(p.x,p.y+.07,p.z);g.rotation.y=p.yaw;world.add(g);
    const wet=new THREE.Mesh(new THREE.CircleGeometry(1,16).rotateX(-Math.PI/2),psMat({color:0x30383e,transparent:true,opacity:.55,depthWrite:false}));
    wet.scale.set(B,1,A);g.add(wet);
    const sh=new THREE.Mesh(new THREE.CircleGeometry(1,10).rotateX(-Math.PI/2),psMat({color:0xa8c8dc,transparent:true,opacity:.4,depthWrite:false}));
    sh.scale.set(B*.4,1,A*.3);sh.position.set(-B*.2,.01,A*.2);g.add(sh);
    const ol=borasOutline(A+.3,B+.3);ol.position.y=.02;g.add(ol);
    const sq=mainPt(i,-(HW+3.4)),spr=new THREE.Group();spr.position.set(sq.x,meshY(sq.x,sq.z),sq.z);world.add(spr);
    hoorBox(spr,.9,.16,.9,psMat({color:0x2f9a3a}),0,.08,0);hoorBox(spr,.2,.7,.2,psMat({color:0xf2c81c}),0,.45,0);
    const arm=new THREE.Group();arm.position.y=.85;spr.add(arm);hoorBox(arm,.14,.14,1.4,psMat({color:0xf2c81c}),0,0,.4);
    const drops=[],dm=psMat({color:0xcfe6f4,unlit:true,transparent:true,opacity:.75,depthWrite:false});
    for(let n=0;n<14;n++){const d=new THREE.Mesh(flat(new THREE.BoxGeometry(.28,.28,.28)),dm);world.add(d);drops.push(d);}
    let tick=0;
    H.push({id:'vattenspridare',period:5,phase:0,mesh:g,unblockable:true,
      update(u,dt){
        const base=Math.atan2(p.x-sq.x,p.z-sq.z),a=base+Math.sin(u*6.283)*.5;arm.rotation.y=a;
        const L=Math.hypot(p.x-sq.x,p.z-sq.z)+3;
        for(let n=0;n<drops.length;n++){const t=(clock*1.3+n/drops.length)%1,d=t*L;
          drops[n].position.set(sq.x+Math.sin(a+(n%3-1)*.1)*d,sq.y+.9+Math.sin(Math.PI*t)*2.4,sq.z+Math.cos(a+(n%3-1)*.1)*d);}
        tick+=dt||0;if(tick>.2){tick=0;if(player&&state==='race'&&Math.hypot(player.x-sq.x,player.z-sq.z)<50)ping(2400,2200,.012);}},
      hit(k){return inPool(k,i,lat,A,B);},
      effect(k){k.slick=Math.max(k.slick,.6);k.drift=0;k.charge=0;
        for(let n=0;n<8;n++)puff(k.x+rand(-1,1),k.y+rand(.2,1),k.z+rand(-1,1),.8,.9,1,.5);
        if(k===player){toast('BLÖTT!');ping(1800,900,.12);}}});
  }
  /* the dogs: heads turn to a kart going past, otherwise back to the shrub; tails wag. The TV
     shows a cartoon dog for a couple of seconds once a lap, as the player (or the leader, in a
     race the player has finished) comes up the yard towards the window. Bodil's ears perk up at
     it (js/30-bodil.js). */
  {const B=PROM.bush;let tvT=0,tvLap=-1;
    H.push({id:'hundar',period:1,phase:0,
      update(u,dt){
        if(stage.id!=='promenad')return;
        const px=player?player.x:0,pz=player?player.z:0;
        for(const d of PROM.dogs){const gx=d.g.position.x,gz=d.g.position.z,dx=px-gx,dz=pz-gz,near=dx*dx+dz*dz<2500;
          const look=near?Math.atan2(dx,dz):Math.atan2(B.x-gx,B.z-gz);
          const want=clamp(wrapAng(look-d.base),-1.3,1.3);d.head.rotation.y+=(want-d.head.rotation.y)*Math.min(1,(dt||0)*5);
          d.head.rotation.x=!near&&d.watch==='bush'?.35+Math.sin(clock*3+d.ph)*.08:0;             /* sniff, sniff */
          d.tail.rotation.y=Math.sin(clock*(near?16:9)+d.ph)*.7;}
        /* the television */
        const T=PROM.tv;if(!T)return;
        const lead=player&&!player.done&&!player.parked?player:karts.filter(k=>!k.parked).reduce((a,k)=>!a||k.progress>a.progress?k:a,null)||player;
        const dist=Math.hypot(lead.x-T.x,lead.z-T.z),pd=player?Math.hypot(player.x-T.x,player.z-T.z):1e9;
        if((state==='race'||state==='over')&&dist<62&&lead.mi>N*.85&&lead.lap!==tvLap){tvLap=lead.lap;tvT=2.6;}
        tvT=Math.max(0,tvT-(dt||0));
        if(pd<160)promTV(tvT>0?'dog':'news',Math.floor(clock*8));
        PROM.dogOnTV=tvT>0;
      }});
  }
}

/** the stage's postcard, for the picnic passport: Bodil asleep upside down on the sofa with the
    trophy beside her, Teo and Amanda tiptoeing round, tidying away the racing equipment.
    Drawn on a 192 x 120 canvas, shown pixelated. */
function promenadPostcard(g,w,h){
  const R=(c,x,y,a,b)=>{g.fillStyle=c;g.fillRect(x,y,a,b);};
  R('#e8d8bc',0,0,w,86);for(let x=0;x<w;x+=12)R('#e0cfb0',x,0,6,86);                    /* the living-room wall */
  R('#3a5a8a',138,10,46,34);R('#f2c890',138,10,46,10);R('#7ab0e0',138,20,46,24);R('#2a2420',138,10,46,2);R('#2a2420',160,10,2,34);   /* the window, evening */
  R('#2a2420',136,8,50,2);R('#2a2420',136,44,50,2);
  R('#a07a52',0,86,w,34);for(let x=0;x<w;x+=16)R('#8e6a46',x,86,1,34);                  /* the floor */
  R('#d8c49a',36,98,96,14);                                                             /* a rug */
  /* the sofa */
  R('#56687a',14,52,104,26);R('#4a5a6a',14,52,104,4);R('#6e8296',8,60,12,28);R('#6e8296',112,60,12,28);
  R('#6e8296',18,72,96,14);R('#3a4652',18,86,4,6);R('#3a4652',110,86,4,6);
  /* Bodil: on her back, four paws in the air, ears spread over the cushion, a white blaze */
  R('#f2ece2',40,64,38,10);R('#7a4a2a',40,70,38,5);R('#7a4a2a',46,64,6,4);R('#7a4a2a',62,65,7,3);   /* belly up, mottled */
  R('#f2ece2',44,54,4,10);R('#f2ece2',54,52,4,12);R('#f2ece2',64,54,4,10);R('#f2ece2',72,52,4,12);  /* paws up */
  R('#7a4a2a',44,54,4,3);R('#7a4a2a',72,52,4,3);
  R('#7a4a2a',78,62,14,12);R('#f2ece2',84,63,3,11);R('#2a1e18',90,68,3,2);                 /* the head, upside down, the blaze, the nose */
  R('#5a3420',76,72,8,10);R('#5a3420',88,72,8,10);                                       /* ears flopped over the edge */
  R('#2a1e18',81,67,3,1);R('#2a1e18',87,67,3,1);                                         /* eyes shut */
  R('#e86a8a',91,71,2,3);                                                                /* the tongue */
  R('#7a4a2a',30,66,12,3);                                                               /* the tail */
  g.fillStyle='#2a3a5a';g.font='bold 9px "Titillium Web",sans-serif';g.fillText('z',96,52);g.font='bold 11px "Titillium Web",sans-serif';g.fillText('Z',102,44);
  /* the trophy, beside her on the sofa */
  R('#e8b830',22,58,12,10);R('#c89818',20,58,2,6);R('#c89818',34,58,2,6);R('#e8b830',26,68,4,4);R('#c89818',23,72,10,3);
  /* Teo, cobalt, carrying a stack of tyres on tiptoe; Amanda, burgundy, folding the chequered flag */
  R('#2a2f3a',140,98,4,12);R('#2a2f3a',147,96,4,12);R('#2f5ad8',138,74,15,24);R('#e8bc98',141,63,9,10);R('#22242a',140,61,11,4);
  R('#1e2022',154,66,16,6);R('#1e2022',154,73,16,6);R('#1e2022',154,80,16,6);R('#5a5c60',160,68,4,2);R('#5a5c60',160,75,4,2);R('#5a5c60',160,82,4,2);
  R('#2a2f3a',170,100,4,12);R('#2a2f3a',176,100,4,12);R('#6e1f2c',168,76,14,25);R('#e8bc98',170,65,9,10);R('#d9b56e',169,62,11,5);R('#d9b56e',178,66,3,9);
  for(let y=0;y<3;y++)for(let x=0;x<4;x++)R((x+y)%2?'#f4f2ee':'#1e2022',152+x*4,92+y*4,4,4);
  R('#e8bc98',174,70,1,3);                                                               /* shh */
  /* the stamp corner: a paw */
  R('#f4efe2',4,92,28,24);R('#2f5ad8',6,94,24,20);R('#f4efe2',14,104,8,7);for(const [x,y] of [[11,99],[15,97],[19,97],[23,99]])R('#f4efe2',x,y,3,3);
  g.fillStyle='#2a2420';g.font='bold 11px "Titillium Web",sans-serif';g.textAlign='left';g.fillText('Hälsningar från',6,14);g.fillText('promenaden!',6,26);
  g.lineWidth=2;g.strokeStyle='#fff';g.strokeRect(1,1,w-2,h-2);
}
