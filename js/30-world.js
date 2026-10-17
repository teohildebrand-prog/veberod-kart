"use strict";
/* ───────── world ───────── */
function buildWorld(st){
  stage=st;
  scene.remove(world);
  world.traverse(o=>{if(o.geometry)o.geometry.dispose();});
  world=new THREE.Group();scene.add(world);
  turbines.length=0;
  LAPS=st.laps||3;
  sampleTrack(st);
  buildAlts(st);
  computeMB();
  skyMat.uniforms.uLow.value.setHex(st.sky[0]);
  skyMat.uniforms.uHigh.value.setHex(st.sky[1]);
  U.fogColor.value.setHex(st.fog[0]);
  U.fogNear.value=st.fog[1];U.fogFar.value=st.fog[2];
  U.amb.value.setHex(st.amb);U.dif.value.setHex(st.dif);
  buildRoad(st);
  buildTerrain(st);
  buildEdges(st);
  buildStart(st);
  buildStations(st);
  if(st.id==='veberod'){sceneryVeberod();landmarksVeberod();}
  else if(st.id==='lund')sceneryLund();
  else if(st.id==='bron')sceneryBron();
  else if(st.id==='ahus')sceneryAhus();
  else sceneryTollarp();
  buildAltWorld();
  buildItems();
  buildStamps(st);
}
