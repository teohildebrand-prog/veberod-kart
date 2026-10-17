"use strict";
const fail=m=>{document.getElementById('start').innerHTML='<div class="sheet-in"><h1>'+m+'</h1></div>';};
if(!window.THREE){fail('INGEN 3D');throw new Error('INGEN 3D');}
