"use strict";
/* ───────── PS1 material system ───────── */
const LIGHTDIR=new THREE.Vector3(-0.44,0.58,0.69).normalize();
const HAZE=new THREE.Color(0xc2d0d9);

function ditherTexture(){                    // 4x4 Bayer
  const M=[0,8,2,10, 12,4,14,6, 3,11,1,9, 15,7,13,5];
  const c=document.createElement('canvas');c.width=c.height=4;
  const g=c.getContext('2d'),im=g.createImageData(4,4);
  for(let i=0;i<16;i++){
    const v=Math.round((M[i]/16)*255);
    im.data[i*4]=im.data[i*4+1]=im.data[i*4+2]=v;im.data[i*4+3]=255;
  }
  g.putImageData(im,0,0);
  const t=new THREE.CanvasTexture(c);
  t.magFilter=t.minFilter=THREE.NearestFilter;
  t.wrapS=t.wrapT=THREE.RepeatWrapping;t.generateMipmaps=false;
  return t;
}
function whiteTexture(){
  const c=document.createElement('canvas');c.width=c.height=1;
  const g=c.getContext('2d');g.fillStyle='#fff';g.fillRect(0,0,1,1);
  const t=new THREE.CanvasTexture(c);t.magFilter=t.minFilter=THREE.NearestFilter;
  t.generateMipmaps=false;return t;
}
const DITHER=ditherTexture(), WHITE=whiteTexture();

const U={
  res:{value:RES},
  dither:{value:DITHER},
  lightDir:{value:LIGHTDIR},
  amb:{value:new THREE.Color(0x62707f)},
  dif:{value:new THREE.Color(0xfff0d4)},
  fogColor:{value:HAZE},
  fogNear:{value:70},
  fogFar:{value:340}
};

const PS_VERT=`
uniform vec2 uRes;
uniform vec3 uLightDir,uAmb,uDif,uColor;
uniform float uSnap,uAffine,uUnlit,uFogNear,uFogFar;
varying vec2 vUv; varying float vW; varying vec3 vCol; varying float vFog;
void main(){
  vec3 p=position; vec3 n=normal; vec3 ic=vec3(1.0);
  #ifdef USE_INSTANCING
    p=(instanceMatrix*vec4(p,1.0)).xyz;
    n=mat3(instanceMatrix)*n;
  #endif
  #ifdef USE_INSTANCING_COLOR
    ic=instanceColor;
  #endif
  vec4 mv=modelViewMatrix*vec4(p,1.0);
  vec4 cp=projectionMatrix*mv;
  if(cp.w>0.0001){                         /* snap to the framebuffer grid */
    vec2 h=uRes*0.5;
    vec2 ndc=cp.xy/cp.w;
    cp.xy=mix(ndc,floor(ndc*h+0.5)/h,uSnap)*cp.w;
  }
  gl_Position=cp;
  vW=mix(1.0,max(cp.w,0.0001),uAffine);    /* affine texture mapping */
  vUv=uv*vW;
  vec3 wn=normalize(mat3(modelMatrix)*n);
  float d=max(dot(wn,uLightDir),0.0);
  vec3 lit=uAmb+uDif*(d*0.82+0.18*max(wn.y,0.0));
  vec3 base=uColor*ic;
  #ifdef USE_COLOR
    base*=color;
  #endif
  vCol=base*mix(lit,vec3(1.0),uUnlit);
  vFog=clamp((-mv.z-uFogNear)/(uFogFar-uFogNear),0.0,1.0);
}`;

const PS_FRAG=`
uniform sampler2D uMap,uDither;
uniform vec3 uFogColor;
uniform float uOpacity,uAlphaTest;
varying vec2 vUv; varying float vW; varying vec3 vCol; varying float vFog;
void main(){
  vec4 t=texture2D(uMap,vUv/vW);
  if(t.a<uAlphaTest) discard;
  vec3 c=t.rgb*vCol;
  c=mix(c,uFogColor,vFog);
  float d=texture2D(uDither,gl_FragCoord.xy*0.25).r;
  c=floor(c*31.0+d)/31.0;                  /* 15-bit colour + ordered dither */
  gl_FragColor=vec4(c,t.a*uOpacity);
}`;

function psMat(o){
  o=o||{};
  const m=new THREE.ShaderMaterial({
    vertexShader:PS_VERT,fragmentShader:PS_FRAG,
    vertexColors:!!o.vertexColors,
    transparent:!!o.transparent,
    depthWrite:o.depthWrite!==false,
    side:o.side||THREE.FrontSide,
    uniforms:{
      uRes:U.res,uDither:U.dither,uLightDir:U.lightDir,uAmb:U.amb,uDif:U.dif,
      uFogColor:U.fogColor,uFogNear:U.fogNear,uFogFar:U.fogFar,
      uMap:{value:o.map||WHITE},
      uColor:{value:new THREE.Color(o.color===undefined?0xffffff:o.color)},
      uSnap:{value:o.snap===undefined?1:o.snap},
      uAffine:{value:o.map?1:0},
      uUnlit:{value:o.unlit?1:0},
      uOpacity:{value:o.opacity===undefined?1:o.opacity},
      uAlphaTest:{value:o.alphaTest||0}
    }
  });
  return m;
}
const flat=g=>{const n=g.index?g.toNonIndexed():g;n.computeVertexNormals();return n;};
function pixTex(w,h,draw){
  const c=document.createElement('canvas');c.width=w;c.height=h;
  draw(c.getContext('2d'),w,h);
  const t=new THREE.CanvasTexture(c);
  t.magFilter=t.minFilter=THREE.NearestFilter;t.generateMipmaps=false;
  return t;
}
