"use strict";
/* ───────── Aero bokeh ───────── */
(function bubbles(){
  const host=document.getElementById('bub');if(!host)return;
  let html='';
  for(let i=0;i<13;i++){
    const d=rand(26,96)|0, x=rand(-2,98)|0;
    const dur=rand(17,34).toFixed(1), delay=(-rand(0,34)).toFixed(1);
    html+='<i style="width:'+d+'px;height:'+d+'px;left:'+x+'%;'+
          'animation-duration:'+dur+'s;animation-delay:'+delay+'s"></i>';
  }
  host.innerHTML=html;
})();
