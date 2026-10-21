"use strict";
/* ───────── vykort ───────── */
/* The postcard every stage gives for finding all three of its picnic stamps. The western stages, Sibylla and
   Bodils promenad draw their own in their stage files; these are the other twenty, drawn the same way on a
   192 x 120 canvas (shown pixelated) and keyed by stage id. A stage that already has one keeps it. */
function pcKit(g,w,h){
  const R=(c,x,y,a,b)=>{g.fillStyle=c;g.fillRect(x,y,a,b);};
  const sky=(a,b,y)=>{const s=g.createLinearGradient(0,0,0,y);s.addColorStop(0,a);s.addColorStop(1,b);g.fillStyle=s;g.fillRect(0,0,w,y);};
  const disc=(c,x,y,r)=>{g.fillStyle=c;g.beginPath();g.arc(x,y,r,0,7);g.fill();};
  const poly=(c,...p)=>{g.fillStyle=c;g.beginPath();g.moveTo(p[0],p[1]);for(let i=2;i<p.length;i+=2)g.lineTo(p[i],p[i+1]);g.closePath();g.fill();};
  const kart=(x,y,c,hair)=>{R('#1e2022',x,y+8,4,4);R('#1e2022',x+11,y+8,4,4);R(c,x-1,y+2,17,7);R('#e8bc98',x+6,y-3,5,5);R(hair||'#22242a',x+6,y-4,5,2);};
  const speed=(x,y)=>{g.fillStyle='rgba(244,242,236,.6)';for(let k=0;k<3;k++)g.fillRect(x-14-k*3,y+3+k*2,10,1);};
  const karts=(y,cols)=>cols.forEach((c,n)=>{const x=20+n*36,yy=y+(n%2)*8;kart(x,yy,c);speed(x,yy);});
  /* the stamp corner, the greeting (shrunk to fit), the white border */
  const end=(name,bg,icon)=>{
    R('#f4efe2',156,92,30,22);R(bg,158,94,26,18);if(icon)icon();
    const t='Hälsningar från '+name+'!';let fs=11;
    g.textAlign='left';g.textBaseline='alphabetic';
    do{g.font='bold '+fs+'px "Titillium Web",sans-serif';}while(g.measureText(t).width>w-14&&--fs>7);
    g.fillStyle='rgba(0,0,0,.45)';g.fillText(t,7,15);g.fillStyle='#fff';g.fillText(t,6,14);
    g.lineWidth=2;g.strokeStyle='#fff';g.strokeRect(1,1,w-2,h-2);
  };
  return {R,sky,disc,poly,kart,speed,karts,end};
}
const KART_COLS=['#c8321f','#2a5aa8','#f2c81c','#3a8a3c'];
const VYKORT={
  lund:{caption:'Jätten i domkyrkan höll i pelaren. Vi höll i ratten.',draw(g,w,h){
    const {R,sky,poly,karts,end}=pcKit(g,w,h);
    sky('#6aa2dc','#e4eef2',70);
    /* the cathedral front: two towers, the round west door */
    R('#b8a07a',56,34,80,40);R('#c8b08a',62,14,22,60);R('#c8b08a',108,14,22,60);
    poly('#4a6a5a',62,14,73,2,84,14);poly('#4a6a5a',108,14,119,2,130,14);
    for(const x of [68,114])for(let y=20;y<60;y+=12)R('#3a3028',x,y,8,7);
    R('#3a3028',88,50,16,24);R('#b8a07a',88,48,16,3);R('#6a5040',90,54,12,20);
    for(let x=0;x<w;x+=30)if(x<50||x>140)R(['#d89a6a','#e8d2a0','#c87a5a'][x/30%3],x,46,28,28);
    R('#8a8478',0,74,w,46);for(let y=76;y<120;y+=5)for(let x=(y%10)?0:4;x<w;x+=8)R('#9a948a',x,y,6,3);   /* cobbles */
    karts(86,KART_COLS.slice(0,3));
    end('Lund','#b8a07a',()=>{R('#f4efe2',162,98,6,13);R('#f4efe2',176,98,6,13);R('#f4efe2',166,103,12,8);});
  }},
  veberod:{caption:'Anders traktor stod mitt i rapsen. Ingen vet hur den kom dit.',draw(g,w,h){
    const {R,sky,poly,disc,karts,end}=pcKit(g,w,h);
    sky('#4c8ad8','#d8ecf4',56);
    R('#f8f4e4',30,16,20,4);R('#f8f4e4',120,22,26,4);
    R('#6a9a48',0,48,w,10);
    R('#c8321f',138,32,30,20);poly('#5a2a22',134,32,153,18,172,32);R('#f4efe2',149,40,8,12);   /* the red barn */
    R('#f4f2ec',20,30,12,20);poly('#3a3a3a',20,30,26,14,32,30);                                   /* the church */
    R('#f2d21c',0,56,w,28);for(let x=0;x<w;x+=4)R(x%8?'#e8c414':'#fae04a',x,56+(x%3),3,2);       /* the rapeseed */
    /* Anders' tractor in the middle of it */
    R('#3a8a3c',84,50,24,12);R('#3a8a3c',98,40,10,12);R('#2a3440',100,42,6,6);
    disc('#1e2022',90,64,7);disc('#1e2022',106,66,4);disc('#c8b040',90,64,3);
    R('#5a5a5a',0,84,w,36);R('#f4f2ec',0,100,w,1);
    karts(90,KART_COLS);
    end('Veberöd','#f2d21c',()=>{R('#c8321f',164,100,14,9);poly('#5a2a22',162,100,171,95,180,100);});
  }},
  bron:{caption:'Halva vägen var dansk. Korven också.',draw(g,w,h){
    const {R,sky,karts,end}=pcKit(g,w,h);
    sky('#3c78c8','#cce4f0',60);
    R('#2c5a8a',0,60,w,60);g.fillStyle='rgba(200,230,245,.6)';for(let n=0;n<16;n++)g.fillRect((n*41)%w,64+(n*13)%50,5,1);
    /* the pylons and the cables to the deck */
    for(const x of [50,140]){R('#c8ccd0',x-3,10,3,56);R('#c8ccd0',x+4,10,3,56);R('#c8ccd0',x-3,24,10,2);
      g.strokeStyle='#e8ecf0';g.lineWidth=1;for(let k=0;k<6;k++){g.beginPath();g.moveTo(x+1,14+k*3);g.lineTo(x-40+k*6,64);g.stroke();g.beginPath();g.moveTo(x+1,14+k*3);g.lineTo(x+42-k*6,64);g.stroke();}}
    R('#9aa0a6',0,64,w,6);R('#6a7076',0,70,w,3);
    R('#58585c',0,82,w,26);R('#f4f2ec',0,94,w,1);R('#9aa0a6',0,80,w,2);R('#9aa0a6',0,108,w,2);
    karts(84,KART_COLS.slice(0,3));
    R('#c8321f',124,104,18,4);R('#e8c27a',122,105,22,2);                                          /* a red hot dog on the rail */
    end('Öresundsbron','#2c5a8a',()=>{R('#c8ccd0',166,96,2,14);R('#c8ccd0',176,96,2,14);R('#c8ccd0',160,106,24,2);});
  }},
  ahus:{caption:'Sockervadden åkte berg-och-dalbanan. Vi åkte efter.',draw(g,w,h){
    const {R,sky,disc,karts,end}=pcKit(g,w,h);
    sky('#e86aa0','#f8d8a0',70);
    /* the big wheel */
    g.strokeStyle='#f4f2ec';g.lineWidth=2;g.beginPath();g.arc(46,40,26,0,7);g.stroke();
    for(let k=0;k<8;k++){const a=k*Math.PI/4;g.beginPath();g.moveTo(46,40);g.lineTo(46+Math.cos(a)*26,40+Math.sin(a)*26);g.stroke();
      R(KART_COLS[k%4],44+Math.cos(a)*26,38+Math.sin(a)*26,5,5);}
    R('#f4f2ec',44,40,4,32);
    /* the coaster, a car upside down at the top */
    g.strokeStyle='#c8321f';g.lineWidth=2;g.beginPath();g.moveTo(90,72);g.quadraticCurveTo(120,0,150,50);g.quadraticCurveTo(165,72,192,30);g.stroke();
    for(let x=96;x<190;x+=12)R('#8a2a1c',x,48,1,24);
    R('#f2c81c',114,26,10,5);
    R('#4a8a3c',0,70,w,10);R('#c8a878',0,80,w,40);
    /* the candyfloss stand */
    R('#f4f2ec',130,72,20,16);R('#e86aa0',128,70,24,3);disc('#f8b8d8',138,64,5);R('#f4f2ec',138,68,1,4);
    karts(90,KART_COLS.slice(0,3));
    end('Åhus','#e86aa0',()=>{g.strokeStyle='#f4f2ec';g.lineWidth=1;g.beginPath();g.arc(171,103,6,0,7);g.stroke();R('#f4f2ec',170,103,2,8);});
  }},
  tollarp:{caption:'Skorstenen rökte. Det gjorde kolbullen också.',draw(g,w,h){
    const {R,sky,poly,disc,karts,end}=pcKit(g,w,h);
    sky('#8a8a90','#d8c8a8',64);
    for(const [x,y] of [[40,10],[48,4],[58,0],[110,14],[120,6]])disc('rgba(220,216,206,.8)',x,y,7);
    R('#7a3a2a',34,14,10,50);R('#7a3a2a',104,20,10,44);                                          /* the chimneys */
    R('#6a6a6e',10,40,70,24);R('#5a5a5e',90,44,80,20);for(let x=14;x<80;x+=10)R('#e8c87a',x,46,6,4);
    poly('#3a3634',120,64,150,30,186,64);                                                        /* the slag heap */
    R('#4a4844',0,64,w,56);R('#8a8478',0,80,w,1);
    /* a kolbulle frying on a fire by the road */
    R('#c84a1c',140,96,12,4);R('#f2a83a',143,94,6,3);R('#2a2826',136,92,20,3);R('#e8c27a',140,90,12,3);R('#3a3634',152,92,10,1);
    karts(84,KART_COLS.slice(1,4));
    end('Tollarp','#6a6a6e',()=>{R('#7a3a2a',166,98,4,12);R('#5a5a5e',162,104,20,6);R('#dcd8ce',165,95,6,3);});
  }},
  glimminge:{caption:'Spöket ville vara med på bilden. Det syns inte, men det är där.',draw(g,w,h){
    const {R,sky,disc,poly,karts,end}=pcKit(g,w,h);
    sky('#0e1430','#2a3a6a',70);
    for(let n=0;n<26;n++)R('#f4f2ec',(n*53)%w,(n*29)%50+18,1,1);
    disc('#f4ecc8',150,30,13);disc('#0e1430',146,27,12);disc('#f4ecc8',150,30,0);                  /* the crescent moon */
    disc('#f4ecc8',152,30,11);disc('#16204a',147,27,10);
    /* the castle: a tall stone block, stepped gables */
    R('#5a5a68',40,28,70,48);for(let k=0;k<5;k++){R('#5a5a68',40+k*4,24-k*4,4,4);R('#5a5a68',106-k*4,24-k*4,4,4);}
    R('#5a5a68',56,8,38,20);
    for(const [x,y] of [[50,36],[70,36],[90,36],[60,52],[84,52]])R('#e8b84a',x,y,5,7);
    R('#1a2240',0,70,w,10);R('#2a2e3a',0,76,w,44);R('#3a3e4a',0,92,w,1);
    /* the ghost, faint, waving */
    g.globalAlpha=.35;disc('#f4f6f8',130,66,8);R('#f4f6f8',122,66,16,14);R('#f4f6f8',118,62,5,3);
    R('#1a2240',126,64,2,3);R('#1a2240',132,64,2,3);g.globalAlpha=1;
    karts(86,KART_COLS.slice(0,3));
    end('Glimmingehus','#1a2240',()=>{R('#5a5a68',164,98,16,12);R('#e8b84a',170,102,3,4);R('#f4ecc8',178,95,3,3);});
  }},
  ales:{caption:'Femtionio stenar och en kart. Kartan stod still kortast.',draw(g,w,h){
    const {R,sky,disc,karts,end}=pcKit(g,w,h);
    sky('#e87a4a','#f8d89a',58);
    disc('#ffd88a',96,58,14);
    R('#3a6a9a',0,58,w,14);g.fillStyle='rgba(255,220,160,.6)';for(let n=0;n<10;n++)g.fillRect(84+(n*7)%26,60+n,6,1);
    R('#8aa04a',0,70,w,14);R('#d8c48a',0,84,w,36);
    /* the stone ship, standing stones in a long oval */
    for(let k=0;k<14;k++){const a=Math.PI*(k/13),x=30+k*10,y=72-Math.sin(a)*6+((k%2)?4:0);
      R('#6a645a',x,y-8-(k===0||k===13?6:0),5,10+(k===0||k===13?6:0));R('#8a8478',x,y-8,2,8);}
    karts(94,KART_COLS.slice(0,3));
    end('Ales stenar','#3a6a9a',()=>{for(let k=0;k<5;k++)R('#d8d0c0',161+k*5,103-(k===0||k===4?4:0),3,6+(k===0||k===4?4:0));});
  }},
  kivik:{caption:'Äpplena rullade nedför backen. Vi rullade upp.',draw(g,w,h){
    const {R,sky,disc,poly,karts,end}=pcKit(g,w,h);
    sky('#5a9ade','#e4f0f4',60);
    poly('#8a8478',40,64,90,28,140,64);for(let k=0;k<30;k++)R('#a8a296',50+(k*17)%80,40+(k*11)%22,4,3);   /* the cairn */
    R('#3a3028',84,52,12,12);
    R('#6aa04a',0,60,w,22);
    for(const x of [10,26,152,172]){R('#6a4a2a',x+5,48,3,14);disc('#3a7a34',x+6,44,9);for(let k=0;k<4;k++)disc('#c8321f',x+1+k*4,42+(k%2)*5,1.6);}
    R('#5b5a55',0,82,w,38);R('#f4f2ec',0,98,w,1);
    for(let k=0;k<7;k++)disc(k%3?'#c8321f':'#8ac83a',12+k*26,84+(k%3)*12,2.5);                   /* the apples on the road */
    karts(88,KART_COLS.slice(0,3));
    end('Kivik','#6aa04a',()=>{disc('#c8321f',171,104,6);R('#6a4a2a',170,96,2,3);R('#3a7a34',172,96,4,2);});
  }},
  soderasen:{caption:'Vildsvinet hade företräde. Det sa det i alla fall.',draw(g,w,h){
    const {R,sky,disc,poly,karts,end}=pcKit(g,w,h);
    sky('#7ab0d8','#d8e8c8',50);
    poly('#7a7468',0,30,40,16,70,60,0,80);poly('#6a6458',192,24,150,14,120,60,192,80);              /* the ravine walls */
    for(let k=0;k<12;k++){const x=(k*37)%w;R('#5a4a3a',x,30,2,40);disc(['#a8782c','#c49a3a','#5a8a3a'][k%3],x+1,30,9);}
    R('#4a4840',0,72,w,48);for(let k=0;k<40;k++)R(['#a8782c','#c49a3a','#7a5a26'][k%3],(k*29)%w,74+(k*7)%44,2,1);
    /* the wild boar, standing its ground */
    R('#3a2e26',100,78,26,14);R('#3a2e26',122,80,10,10);R('#5a4a3a',130,84,4,3);R('#f4efe2',129,87,3,1);
    R('#3a2e26',103,92,3,5);R('#3a2e26',118,92,3,5);R('#1a1410',124,82,2,2);R('#3a2e26',96,80,4,2);
    karts(90,['#c8321f','#2a5aa8']);
    g.fillStyle='#1e2022';g.font='bold 8px monospace';g.fillText('!',64,86);
    end('Skäralid','#5a4a3a',()=>{R('#3a2e26',162,100,16,8);R('#3a2e26',176,101,6,6);R('#f4efe2',181,105,2,1);});
  }},
  foteviken:{caption:'Hövdingen sa att tunnan var en gåva.',draw(g,w,h){
    const {R,sky,disc,poly,karts,end}=pcKit(g,w,h);
    sky('#7aa6c8','#e8e4d4',56);
    R('#5a7a9a',0,50,w,10);
    for(const x of [14,62]){poly('#8a6a3a',x,44,x+20,24,x+40,44);R('#6a4a2a',x+2,44,36,14);R('#2a1a10',x+16,48,8,10);}   /* longhouses */
    /* the longship, dragon prow, striped sail */
    poly('#6a4a2a',110,52,186,52,178,60,118,60);R('#6a4a2a',184,40,3,14);R('#6a4a2a',184,40,6,3);
    R('#5a3a1a',146,22,2,32);for(let k=0;k<4;k++)R(k%2?'#f4efe2':'#c8321f',136+k*6,24,6,22);
    R('#8a7354',0,60,w,60);
    /* a barrel in the air above the road */
    R('#8a5a2a',96,64,10,12);R('#3a2a1a',96,67,10,1);R('#3a2a1a',96,72,10,1);
    g.fillStyle='rgba(244,242,236,.6)';for(let k=0;k<3;k++)g.fillRect(84-k*6,62+k*4,8,1);
    karts(90,KART_COLS.slice(0,3));
    end('Foteviken','#5a7a9a',()=>{poly('#6a4a2a',161,106,183,106,180,110,164,110);for(let k=0;k<3;k++)R(k%2?'#f4efe2':'#c8321f',166+k*4,96,4,9);});
  }},
  karlskrona:{caption:'Fästningen sköt salut. Vi tror att det var salut.',draw(g,w,h){
    const {R,sky,disc,poly,karts,end}=pcKit(g,w,h);
    sky('#4a82c0','#dce8f0',56);
    R('#3a6a92',0,46,w,14);
    R('#7a7068',130,30,52,18);for(let k=0;k<6;k++)R('#7a7068',130+k*9,26,5,4);                       /* the fortress across the water */
    disc('#2a2826',112,26,3);g.fillStyle='rgba(220,216,206,.7)';disc('rgba(220,216,206,.7)',130,32,5);  /* its cannonball, mid-flight */
    R('#b8442a',0,52,120,12);poly('#6a2a1a',0,52,60,44,120,52);for(let x=6;x<118;x+=10)R('#f4efe2',x,56,4,4);   /* the ropewalk */
    R('#4a4644',0,64,w,56);for(let y=66;y<120;y+=6)for(let x=(y%12)?0:5;x<w;x+=10)R('#5a5654',x,y,8,4);
    for(const x of [140,152,146]){const y=x===146?72:80;R('#8a5a2a',x,y,10,12);R('#3a2a1a',x,y+3,10,1);R('#3a2a1a',x,y+8,10,1);}   /* herring barrels */
    karts(88,KART_COLS.slice(0,3));
    end('Karlskrona','#3a6a92',()=>{R('#7a7068',162,100,20,9);for(let k=0;k<3;k++)R('#7a7068',162+k*8,97,4,3);disc('#2a2826',168,95,1.6);});
  }},
  ven:{caption:'Tycho räknade stjärnorna. Vi räknade varven.',draw(g,w,h){
    const {R,sky,disc,poly,karts,end}=pcKit(g,w,h);
    sky('#4a86cc','#d8ecf4',52);
    R('#2c5a8a',0,46,w,74);g.fillStyle='rgba(200,230,245,.6)';for(let n=0;n<10;n++)g.fillRect((n*43)%w,50+(n*7)%10,5,1);
    /* the island: green on top, chalky cliffs */
    poly('#d8d0b8',8,96,24,56,170,52,188,96);R('#7f8f4c',22,50,150,10);
    for(let k=0;k<6;k++)R('#c8c0a8',30+k*24,62,2,30);
    /* Tycho's statue on the top, looking up */
    R('#4a5a52',90,26,8,22);disc('#4a5a52',94,22,4);R('#4a5a52',97,22,8,2);R('#3a4a42',86,46,16,4);
    R('#5a5c5c',0,96,w,24);R('#e8e6da',0,108,w,1);
    karts(96,KART_COLS.slice(0,3));
    end('Ven','#2c5a8a',()=>{poly('#7f8f4c',162,108,166,100,178,100,182,108);R('#f4f2ec',177,96,1,1);R('#f4f2ec',170,96,1,1);R('#f4f2ec',165,97,1,1);});
  }},
  limhamn:{caption:'Kalkbrottet är djupt. Varvtiden också.',draw(g,w,h){
    const {R,sky,disc,poly,karts,end}=pcKit(g,w,h);
    sky('#0a1024','#1e2a48',40);
    for(let n=0;n<20;n++)R('#f4f2ec',(n*47)%w,(n*13)%30+4,1,1);
    /* the quarry walls, terraced, pale in the dark */
    for(let k=0;k<4;k++){R(['#b9b5aa','#a8a397','#c8c4b8','#9e9a8e'][k],0,40+k*10,40-k*6,10);R(['#b9b5aa','#a8a397','#c8c4b8','#9e9a8e'][k],152+k*6,40+k*10,40,10);}
    R('#8a867c',0,40,w,0);R('#7e7a70',40,40,112,40);
    /* the glowing lime kilns */
    for(const x of [56,96,128]){R('#5a5248',x,54,18,26);disc('#ff8a2a',x+9,66,6);disc('#ffd06a',x+9,66,3);
      g.fillStyle='rgba(255,140,50,.18)';g.beginPath();g.arc(x+9,66,16,0,7);g.fill();}
    R('#b9b5aa',0,80,w,40);R('#a8a397',0,96,w,2);
    karts(86,KART_COLS.slice(0,3));
    end('Limhamn','#1e2a48',()=>{R('#5a5248',164,98,16,12);disc('#ff8a2a',172,104,3);});
  }},
  angelholm:{caption:'Gröna gubben lånade en kart. Han lämnade tillbaka den. Nästan.',draw(g,w,h){
    const {R,sky,disc,poly,kart,end}=pcKit(g,w,h);
    sky('#1a2a3a','#5a7a6a',70);
    for(let x=0;x<w;x+=14){poly('#1e3a28',x,70,x+7,30+(x*7)%16,x+14,70);R('#3a2a1a',x+6,66,2,6);}
    /* the saucer and its beam, a kart floating up in it */
    g.fillStyle='rgba(180,255,160,.28)';g.beginPath();g.moveTo(84,30);g.lineTo(108,30);g.lineTo(124,104);g.lineTo(68,104);g.fill();
    R('#9aa4ae',70,24,52,6);R('#c8ccd0',80,18,32,6);disc('#8ae86a',96,16,6);
    for(let k=0;k<5;k++)R(k%2?'#f2c81c':'#8ae86a',74+k*10,26,3,2);
    R('#5cc84a',94,13,2,2);R('#5cc84a',98,13,2,2);                                             /* Gröna gubben in the dome */
    g.save();g.translate(96,62);g.rotate(.4);kart(-8,-6,'#2a5aa8');g.restore();
    R('#8c7a58',0,90,w,30);R('#6e5e40',0,104,w,1);
    kart(20,94,'#c8321f');kart(142,96,'#f2c81c');
    end('Ängelholm','#1a2a3a',()=>{R('#9aa4ae',162,104,20,3);R('#c8ccd0',166,101,12,3);disc('#8ae86a',172,99,3);});
  }},
  hoor:{caption:'Älgen stod kvar. Vi står där fortfarande.',draw(g,w,h){
    const {R,sky,disc,kart,end}=pcKit(g,w,h);
    sky('#6aa2d0','#d8ecd8',50);
    for(let k=0;k<14;k++){const x=(k*29)%w;R('#4a3a2a',x+4,30,3,30);disc(k%2?'#2e5a34':'#3a6a3c',x+5,30,11);}
    R('#8ac8e8',150,24,14,44);g.fillStyle='rgba(255,255,255,.6)';for(let y=26;y<66;y+=4)g.fillRect(152+(y%3),y,10,1);   /* the waterfall */
    R('#a8977a',0,60,w,60);R('#8a7a5e',0,84,w,1);
    /* the elk on the road, not moving */
    R('#5a3a22',76,62,36,16);R('#5a3a22',108,52,10,14);R('#5a3a22',112,48,12,8);R('#3a2414',122,52,4,4);
    R('#5a3a22',80,78,4,16);R('#5a3a22',104,78,4,16);R('#5a3a22',88,78,4,16);R('#5a3a22',98,78,4,16);
    R('#d8c8a0',108,40,2,10);R('#d8c8a0',104,40,8,2);R('#d8c8a0',118,40,2,10);R('#d8c8a0',116,40,8,2);R('#1a1410',116,51,2,2);
    /* the karts queued behind it */
    kart(20,96,'#c8321f');kart(42,98,'#2a5aa8');kart(4,100,'#f2c81c');
    g.fillStyle='#1e2022';g.font='6px monospace';g.fillText('...',30,88);
    end('Höör','#4a3a2a',()=>{R('#5a3a22',162,102,14,6);R('#5a3a22',175,98,4,6);R('#d8c8a0',174,95,6,1);R('#d8c8a0',176,95,1,3);});
  }},
  romele:{caption:'Snöplogen vann. Den var inte ens anmäld.',draw(g,w,h){
    const {R,sky,disc,poly,karts,end}=pcKit(g,w,h);
    sky('#9aaabb','#e8eef3',60);
    poly('#f4f6f8',0,60,50,34,110,58,160,30,192,52,192,60);
    for(let k=0;k<8;k++){const x=12+k*24;poly('#2e4a3a',x,62,x+6,42,x+12,62);R('#f4f6f8',x+3,48,6,2);}
    R('#e8eef3',0,62,w,58);R('#737a80',0,82,w,22);R('#e8eef3',0,90,w,1);
    /* the snow plough, out ahead of everyone */
    R('#f28a1c',120,70,30,14);R('#2a3440',136,72,10,6);R('#f2c81c',138,66,6,3);R('#c8ccd0',152,70,6,16);
    disc('#1e2022',126,86,4);disc('#1e2022',144,86,4);
    g.fillStyle='rgba(244,246,248,.9)';for(let k=0;k<8;k++)g.fillRect(160+(k*5)%20,66+(k*7)%18,3,3);
    karts(86,KART_COLS.slice(0,2));
    g.fillStyle='rgba(255,255,255,.85)';for(let n=0;n<40;n++)g.fillRect((n*37)%w,(n*23)%110+4,1,1);
    R('#f4f6f8',20,62,10,10);disc('#f4f6f8',25,58,4);R('#f28a1c',27,58,3,1);                        /* a snowman */
    end('Romeleåsen','#9aaabb',()=>{disc('#f4f6f8',171,106,5);disc('#f4f6f8',171,99,3.5);R('#f28a1c',173,99,3,1);});
  }},
  kalmar:{caption:'Riddaren väntade på sin tur. Vindbryggan väntade inte.',draw(g,w,h){
    const {R,sky,disc,poly,karts,end}=pcKit(g,w,h);
    sky('#4a8ad0','#e0ecf4',60);
    R('#d8d0bc',40,26,110,40);for(let x=40;x<150;x+=8)R('#d8d0bc',x,22,5,4);
    for(const x of [34,140]){R('#c8c0aa',x,14,16,52);poly('#3a6a5a',x-2,14,x+8,0,x+18,14);}       /* the round towers, green caps */
    R('#3a3028',84,40,22,26);
    R('#6a4a2a',82,62,26,6);g.save();g.translate(84,62);g.rotate(-.5);R('#6a4a2a',0,0,24,4);g.restore();   /* the drawbridge, rising */
    R('#3a6a92',0,66,w,8);R('#6f685c',0,74,w,46);
    /* the knight, lance up, waiting */
    R('#f4efe2',148,78,18,10);R('#9aa4ae',154,66,8,12);disc('#9aa4ae',158,64,4);R('#6a4a2a',164,48,2,34);
    R('#f4efe2',150,88,3,8);R('#f4efe2',162,88,3,8);R('#c8321f',148,80,18,2);
    karts(90,KART_COLS.slice(0,3));
    end('Kalmar','#3a6a92',()=>{R('#d8d0bc',162,100,20,9);R('#c8c0aa',160,96,5,13);R('#c8c0aa',179,96,5,13);});
  }},
  rune:{caption:'Raket-Rune räknade ner. Vi hann två varv innan han kom till noll.',draw(g,w,h){
    const {R,sky,disc,poly,karts,end}=pcKit(g,w,h);
    sky('#f28a4a','#f8e0b0',62);
    /* the twisting tower */
    for(let k=0;k<12;k++)R(k%2?'#d8dce0':'#c8ccd0',32+Math.sin(k*.5)*3,8+k*4.5,14,5);
    R('#3a6a9a',0,58,w,10);
    /* Rune's rocket on the quay, counting down */
    poly('#f4f2ec',122,14,130,0,138,14);R('#f4f2ec',122,14,16,40);R('#c8321f',122,26,16,4);disc('#2a5aa8',130,20,3);
    poly('#c8321f',116,54,122,40,122,54);poly('#c8321f',144,54,138,40,138,54);
    g.fillStyle='#1e2022';g.font='bold 16px monospace';g.textAlign='center';g.fillText('2',156,38);g.textAlign='left';
    R('#7d7a74',0,66,w,54);for(let y=70;y<120;y+=8)R('#6f6c66',0,y,w,1);
    karts(84,KART_COLS);
    end('Runes runda','#3a6a9a',()=>{poly('#f4f2ec',167,104,171,95,175,104);R('#f4f2ec',167,104,8,5);R('#f28a1c',169,109,4,2);});
  }},
  rosengard:{caption:'Bollen gick i buren. Mehmet också.',draw(g,w,h){
    const {R,sky,disc,karts,end}=pcKit(g,w,h);
    sky('#f2a85a','#f8e0a8',62);
    for(const [x,t] of [[6,46],[48,54],[150,44]]){R('#c8b8a0',x,62-t,36,t);for(let y=66-t;y<58;y+=6)for(let wx=x+3;wx<x+33;wx+=6)R(y%12?'#ffd88a':'#5a5a6a',wx,y,3,3);}
    /* the football cage, a ball and a moped in the net */
    R('#6fa04a',88,48,56,16);g.strokeStyle='#2a2c30';g.lineWidth=1;g.strokeRect(88.5,30.5,56,32);
    for(let x=92;x<144;x+=4){g.beginPath();g.moveTo(x+.5,31);g.lineTo(x+.5,62);g.stroke();}
    R('#f4f2ec',96,36,4,24);R('#f4f2ec',96,36,16,3);
    disc('#f4f2ec',106,52,3);R('#1e2022',105,51,2,2);
    R('#2a5aa8',114,52,14,6);disc('#1e2022',116,59,3);disc('#1e2022',126,59,3);R('#e8bc98',119,44,5,5);R('#22242a',118,43,7,2);   /* Mehmet's moped */
    R('#b3ad9f',0,64,w,10);R('#5a5a5e',0,74,w,46);R('#f4f2ec',0,96,w,1);
    karts(84,['#c8321f','#f2c81c','#3a8a3c']);
    end('Rosengård','#6fa04a',()=>{disc('#f4f2ec',171,103,6);R('#1e2022',169,101,4,4);});
  }},
  horby:{caption:'Sju lass svin. Vi räknade till åtta.',draw(g,w,h){
    const {R,sky,disc,kart,end}=pcKit(g,w,h);
    sky('#5a96d8','#e0ecf4',54);
    for(let k=0;k<4;k++){const x=6+k*46;R('#8a8a90',x,40,40,16);R('#5a5a60',x,40,40,2);disc('#1e2022',x+8,58,4);disc('#1e2022',x+30,58,4);
      R('#5a5a60',x+40,50,6,8);}                                                                  /* the trailers, gates open */
    R('#a49378',0,60,w,60);
    /* the pigs everywhere */
    const pig=(x,y)=>{R('#f2a8b0',x,y,14,8);R('#f2a8b0',x+12,y+1,5,6);R('#e88a98',x+16,y+3,2,2);R('#1e2022',x+13,y+2,1,1);
      R('#e88a98',x+2,y+8,2,3);R('#e88a98',x+10,y+8,2,3);R('#e88a98',x-2,y+1,2,1);};
    for(const [x,y] of [[12,66],[50,62],[90,70],[130,64],[160,72],[30,84],[110,88],[70,98]])pig(x,y);
    kart(140,96,'#c8321f');kart(46,104,'#2a5aa8');
    end('Hörby','#f2a8b0',()=>{R('#e88a98',164,100,12,7);R('#e88a98',175,101,5,5);R('#1e2022',176,102,1,1);});
  }},
};
for(const S of STAGES)if(!S.postcard&&VYKORT[S.id])S.postcard=VYKORT[S.id];
