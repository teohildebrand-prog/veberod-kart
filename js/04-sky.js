"use strict";
/* ───────── sky ───────── */
const skyMat=new THREE.ShaderMaterial({
  side:THREE.BackSide,depthWrite:false,
  uniforms:{uDither:U.dither,uLow:{value:new THREE.Color(0xd6dfe2)},
            uHigh:{value:new THREE.Color(0x5c93c4)},uSun:{value:LIGHTDIR}},
  vertexShader:'varying vec3 vP;void main(){vP=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
  fragmentShader:[
    'uniform sampler2D uDither;uniform vec3 uLow,uHigh,uSun;varying vec3 vP;',
    'void main(){vec3 v=normalize(vP);',
    'float h=clamp(v.y*0.5+0.5,0.,1.);',
    'vec3 c=mix(uLow,uHigh,pow(h,1.35));',
    'float s=max(dot(v,normalize(uSun)),0.);',
    'c+=vec3(1.0,.94,.80)*pow(s,7.)*.20;',
    'c=mix(c,uLow*1.02,smoothstep(.10,-.04,v.y));',
    'float d=texture2D(uDither,gl_FragCoord.xy*0.25).r;',
    'c=floor(c*31.0+d)/31.0;gl_FragColor=vec4(c,1.);}'
  ].join('\n')
});
const skyMesh=new THREE.Mesh(new THREE.SphereGeometry(900,14,10),skyMat);
skyMesh.frustumCulled=false;scene.add(skyMesh);
