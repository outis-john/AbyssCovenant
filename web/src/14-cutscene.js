// ============================================================ 空降过场
const cut={t:0,pod:null,door:null,char:null,parts:[],done:false,impacted:false,opened:false};
function makeDropPod(){
  const g=new THREE.Group();
  const hull=new THREE.MeshLambertMaterial({map:texMetal,color:0x8a8478});
  const dark=new THREE.MeshLambertMaterial({color:0x2a2420});
  const red=new THREE.MeshLambertMaterial({color:0x7a1612});
  const b=new THREE.Mesh(new THREE.CylinderGeometry(1.15,1.45,3.0,8),hull);b.position.y=1.7;g.add(b);
  const n=new THREE.Mesh(new THREE.ConeGeometry(1.15,1.4,8),hull);n.position.y=3.9;g.add(n);
  const band=new THREE.Mesh(new THREE.CylinderGeometry(1.2,1.2,.25,8),red);band.position.y=2.6;g.add(band);
  for(let i=0;i<4;i++){const f=new THREE.Mesh(new THREE.BoxGeometry(.12,1.6,.9),dark);const a=i*Math.PI/2+Math.PI/4;f.position.set(Math.cos(a)*1.35,.9,Math.sin(a)*1.35);f.rotation.y=-a;g.add(f);}
  const jet=new THREE.Mesh(new THREE.ConeGeometry(.9,1.4,8),new THREE.MeshBasicMaterial({color:0xff9a40}));jet.rotation.x=Math.PI;jet.position.y=-.6;g.add(jet);g.userData.jet=jet;
  const pivot=new THREE.Group();pivot.position.set(1.25,.25,0);g.add(pivot);
  const door=new THREE.Mesh(new THREE.BoxGeometry(.12,2.3,1.3),hull);door.position.set(0,1.15,0);pivot.add(door);
  const glow=new THREE.Mesh(new THREE.PlaneGeometry(1.1,2.1),new THREE.MeshBasicMaterial({color:0xff8a40}));glow.position.set(1.2,1.4,0);glow.rotation.y=Math.PI/2;g.add(glow);
  cut.door=pivot;return g;
}
function cutParticle(p,v,color,life,size=1){const m=new THREE.Mesh(bloodGeo,new THREE.MeshBasicMaterial({color}));m.position.copy(p);m.scale.setScalar(size);scene.add(m);cut.parts.push({m,v,life,grav:color===0x6a6058?-1:1});}
function startCutscene(){
  state='cutscene';cut.t=0;cut.impacted=false;cut.opened=false;cut.done=false;
  cut.pod=makeDropPod();cut.pod.position.set(0,70,0);levelGroup.add(cut.pod);
  cut.char=buildCharacter(cls);cut.char.position.set(0.4,0,0);cut.char.rotation.y=Math.PI/2;cut.char.visible=false;scene.add(cut.char);
  view.visible=false;$('letterbox').classList.add('show');$('cutCap').textContent='';
  play('whistle');
}
function updateCutscene(dt){
  cut.t+=dt;const t=cut.t,P=cut.pod;
  // 下落：从高空加速砸下
  if(t<2.4){const k=t/2.4;P.position.y=70*(1-k*k);P.rotation.y+=dt*2;
    if(Math.random()<0.9)for(let i=0;i<3;i++)cutParticle(P.position.clone().add(new THREE.Vector3((Math.random()-.5)*1.5,-.5,(Math.random()-.5)*1.5)),new THREE.Vector3((Math.random()-.5)*2,6+Math.random()*4,(Math.random()-.5)*2),Math.random()<.5?0xff7a20:0xffd060,0.6,2);
    player.shake=0.08;
  } else if(!cut.impacted){cut.impacted=true;P.position.y=0;P.rotation.y=0.2;P.userData.jet.visible=false;
    play('boom');play('kill');player.shake=1.0;$('hurt').style.background='rgba(255,240,220,.9)';$('hurt').style.opacity=1;setTimeout(()=>{$('hurt').style.opacity=0;setTimeout(()=>$('hurt').style.background='',300);},90);
    for(let i=0;i<70;i++){const a=Math.random()*6.28,s=4+Math.random()*7;cutParticle(new THREE.Vector3(Math.cos(a)*1.5,.3,Math.sin(a)*1.5),new THREE.Vector3(Math.cos(a)*s,1+Math.random()*3,Math.sin(a)*s),0x6a6058,1.6+Math.random(),2.5);}
    for(let i=0;i<14;i++){const s=.4+Math.random()*.8;const m=new THREE.Mesh(scaleBoxUV(new THREE.BoxGeometry(s,s*.5,s),s,s*.5,s),matBrick);const a=Math.random()*6.28,r=2+Math.random()*4;m.position.set(Math.cos(a)*r,H+Math.random()*3,Math.sin(a)*r);m.rotation.set(Math.random(),Math.random(),Math.random());scene.add(m);levelGroup.add(m);
      gibs.push({m,v:new THREE.Vector3(0,-2,0),spin:new THREE.Vector3(Math.random()*3,0,Math.random()*3),rest:false});}
    colliders.push({minX:-1.4,maxX:1.4,minZ:-1.4,maxZ:1.4});
    setTimeout(()=>{if(state==='cutscene')$('cutCap').textContent='巢都第七区 · 空降坐标确认';},400);
  }
  // 舱门炸开，角色走出来
  if(t>3.6&&!cut.opened){cut.opened=true;play('saw');noiseHit&&actx&&noiseHit(1500,0.4,0.4);
    for(let i=0;i<20;i++)cutParticle(new THREE.Vector3(1.4,1.2,0),new THREE.Vector3(2+Math.random()*3,Math.random()*2,(Math.random()-.5)*3),0xbbbbbb,1.2,2);}
  if(cut.opened)cut.door.rotation.z=-Math.min(Math.PI/2,(t-3.6)*6)*1.0;
  if(t>3.9){cut.char.visible=true;const k=clamp((t-3.9)/2.1,0,1);cut.char.position.x=lerp(0.4,3.4,k);cut.char.position.y=Math.abs(Math.sin(t*7))*0.06*(k<1?1:0);}
  // 镜头
  const c=camera,target=new THREE.Vector3(0,Math.max(1.5,P.position.y*0.9),0);
  let camPos=new THREE.Vector3(7.5,2.2,2.5);
  if(t>3.9){target.set(cut.char.position.x,1.7,0);camPos=new THREE.Vector3(7.5,2.0,2.2+Math.min(1,(t-3.9)/2)*-0.6);}
  if(t>6.0){const k=clamp((t-6)/0.8,0,1);camPos.lerp(new THREE.Vector3(cut.char.position.x-0.1,2.3,0),k);target.set(10,1.6,0);$('fade').style.opacity=k;}
  const sh=player.shake*player.shake;player.shake=Math.max(0,player.shake-dt*1.5);
  c.position.copy(camPos).add(new THREE.Vector3((Math.random()-.5)*sh,(Math.random()-.5)*sh,(Math.random()-.5)*sh));c.lookAt(target);
  for(const p of cut.parts){p.life-=dt;p.v.y-=9*dt*p.grav;p.m.position.addScaledVector(p.v,dt);p.v.multiplyScalar(1-dt*1.5);if(p.m.position.y<0.05)p.m.position.y=0.05;if(p.life<=0)scene.remove(p.m);}
  cut.parts=cut.parts.filter(p=>p.life>0);
  updateDebris(dt);
  candleLights.forEach((l,i)=>{const near=candles.slice().sort((a,b)=>a.lengthSq()-b.lengthSq());if(near[i])l.position.copy(near[i]);});
  if(t>6.8)endCutscene();
}
function endCutscene(){
  if(state!=='cutscene')return;
  if(!cut.impacted){cut.t=2.39;updateCutscene(0.02);} // 跳过时也要落地
  for(const p of cut.parts)scene.remove(p.m);cut.parts=[];
  cut.door.rotation.z=-Math.PI/2;cut.pod.position.y=0;
  scene.remove(cut.char);
  player.pos.set(3.4,0,0);player.yaw=-Math.PI/2;player.pitch=0;player.shake=0;
  camera.position.set(3.4,1.6,0);camera.rotation.set(0,player.yaw,0,'YXZ');view.visible=true;
  $('letterbox').classList.remove('show');$('fade').style.opacity=0;
  state='ready';$('ready').classList.add('show');
}

