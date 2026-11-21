// ============================================================ 空降过场
const cut={t:0,pod:null,door:null,char:null,parts:[],objs:[],done:false,impacted:false,opened:false,mode:'pod',S:1,ex:3.4};
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
// ---- 每个职业一种登场方式
const ENTRY={tide:'rift',ward:'pod',reforged:'grav',bastion:'teleport',relic:'teleport',walker:'harness',redeemer:'bigpod'};
const ENTRY_CAP={rift:'The veil tears · the Tidecaller steps through',pod:'Drop pod impact · coordinates confirmed',grav:'Grav-chute descent · boots on the ground',
  teleport:'Teleportarium lock · strike confirmed',harness:'Drop harness · the ancient one walks again',bigpod:'Sarcophagus pod impact · purge protocol engaged'};
// 机甲用的四瓣式大型空降舱：舱壁向外倒下，不会穿模
function makePetalPod(S){const g=new THREE.Group();const hull=new THREE.MeshLambertMaterial({map:texMetal,color:0x7a7468}),red=new THREE.MeshLambertMaterial({color:0x7a1612}),dark=new THREE.MeshLambertMaterial({color:0x2a2420});
  const R=1.25*S,Hh=2.2*S;g.userData.petals=[];
  for(let i=0;i<4;i++){const a=i*Math.PI/2;const pv=new THREE.Group();pv.position.set(Math.cos(a)*R,0,Math.sin(a)*R);pv.rotation.y=-a;g.add(pv);
    const p=new THREE.Mesh(new THREE.BoxGeometry(.25,Hh,2*R*1.02),hull);p.position.set(0,Hh/2,0);pv.add(p);
    const st=new THREE.Mesh(new THREE.BoxGeometry(.28,.35*S,2*R*1.03),red);st.position.set(0,Hh*.7,0);pv.add(st);
    const fin=new THREE.Mesh(new THREE.BoxGeometry(.9*S,Hh*.55,.15),dark);fin.position.set(.5*S,Hh*.3,0);pv.add(fin);g.userData.petals.push(pv);}
  const roof=new THREE.Mesh(new THREE.ConeGeometry(R*1.45,.9*S,4),hull);roof.rotation.y=Math.PI/4;roof.position.y=Hh+.45*S;g.add(roof);g.userData.roof=roof;
  const jet=new THREE.Mesh(new THREE.ConeGeometry(R,1.8*S,8),new THREE.MeshBasicMaterial({color:0xff9a40}));jet.rotation.x=Math.PI;jet.position.y=-.8*S;g.add(jet);g.userData.jet=jet;return g;}
// 机甲空投挂架：四根立柱 + 顶框 + 四个反推喷口，落地后弹开
function makeHarness(S){const g=new THREE.Group();const m=new THREE.MeshLambertMaterial({map:texMetal,color:0x4a4a50}),y=new THREE.MeshLambertMaterial({color:0x8a6a10});const top=3.6*S;g.userData.flames=[];
  const B=(w,h,d,mat,x,yy,z)=>{const b=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat);b.position.set(x,yy,z);g.add(b);return b;};
  for(const [sx,sz] of [[-1,-1],[-1,1],[1,-1],[1,1]]){B(.22,top,.22,m,sx*1.5,top/2,sz*1.5);const th=B(.6,.5,.6,m,sx*1.6,.4,sz*1.6);
    const f=new THREE.Mesh(new THREE.ConeGeometry(.3,1.4,8),new THREE.MeshBasicMaterial({color:0xffa040}));f.rotation.x=Math.PI;f.position.set(sx*1.6,-.5,sz*1.6);g.add(f);g.userData.flames.push(f);}
  B(3.4,.25,.3,y,0,top,-1.5);B(3.4,.25,.3,y,0,top,1.5);B(.3,.25,3.4,m,-1.5,top,0);B(.3,.25,3.4,m,1.5,top,0);B(.8,.6,.8,m,0,top+.3,0);
  g.scale.setScalar(1/(cut.char&&cut.char.scale.x||1));return g;}
function cutAdd(o,parent=scene){parent.add(o);cut.objs.push(o);return o;}
function impactFx(x,z,k=1){play('boom');play('kill');player.shake=1.0*k;$('hurt').style.background='rgba(255,240,220,.9)';$('hurt').style.opacity=k;setTimeout(()=>{$('hurt').style.opacity=0;setTimeout(()=>$('hurt').style.background='',300);},90);
  for(let i=0;i<70*k;i++){const a=Math.random()*6.28,s=4+Math.random()*7;cutParticle(new THREE.Vector3(x+Math.cos(a)*1.5,.3,z+Math.sin(a)*1.5),new THREE.Vector3(Math.cos(a)*s,1+Math.random()*3,Math.sin(a)*s),0x6a6058,1.6+Math.random(),2.5);}
  ringAt(x,.2,z,0xd0b090,.5,7*k,.6,.15);}
function startCutscene(){
  state='cutscene';cut.t=0;cut.impacted=false;cut.opened=false;cut.done=false;cut.objs=[];cut.mode=ENTRY[cls]||'pod';cut.S=Math.max(1,(CLS[cls].eye||1.6)/1.6);cut.ex=3.4;cut.pod=null;cut.door=null;cut.ship=null;
  const S=cut.S,M=cut.mode;cut.char=buildCharacter(cls);cut.char.rotation.y=Math.PI/2;cut.char.visible=false;scene.add(cut.char);cut.char.position.set(0,0,0);
  if(M==='pod'){cut.pod=makeDropPod();cut.pod.position.set(0,70,0);levelGroup.add(cut.pod);cut.char.position.set(.2,0,0);}
  if(M==='bigpod'){cut.pod=makePetalPod(S);cut.pod.position.set(0,90,0);levelGroup.add(cut.pod);cut.ex=5.5;}
  if(M==='harness'){cut.ship=makeHarness(S);cut.char.add(cut.ship);cut.char.visible=true;cut.ex=4.5;}
  if(M==='rift'){const g=cutAdd(new THREE.Group());g.position.set(-.3,1.3,0);g.rotation.y=Math.PI/2;const core=new THREE.Mesh(new THREE.CircleGeometry(1,32),new THREE.MeshBasicMaterial({color:0x0a0014,side:2}));
    const glow=new THREE.Mesh(new THREE.RingGeometry(.95,1.25,40),new THREE.MeshBasicMaterial({color:0xb050ff,transparent:true,opacity:.9,side:2,blending:THREE.AdditiveBlending,depthWrite:false}));g.add(core);g.add(glow);g.scale.set(.01,.01,.01);cut.rift=g;cut.riftGlow=glow;cut.char.position.set(-.8,0,0);}
  view.visible=false;$('letterbox').classList.add('show');$('cutCap').textContent='';
  play(M==='rift'||M==='teleport'?'hole':'whistle');
}
function walkChar(t,t0,dur,x0){const k=clamp((t-t0)/dur,0,1);const c=cut.char;c.position.x=lerp(x0,cut.ex,k);const heavy=cut.S>1.3;
  c.position.y=k<1?Math.abs(Math.sin(t*(heavy?4:7)))*(heavy?.12:.06):0;if(heavy&&k<1&&Math.sin(t*4)*Math.sin((t-.016)*4)<0){play('boom');player.shake=Math.max(player.shake,.25);dust(c.position,6);}}
function updateCutscene(dt){
  cut.t+=dt;const t=cut.t,S=cut.S,M=cut.mode,C=cut.char;let target=new THREE.Vector3(0,1.6*S,0),camPos=new THREE.Vector3(7.5*S,2.2*S,2.5*S);
  const fall=(P,h,dur)=>{const k=Math.min(1,t/dur);P.position.y=h*(1-k*k);P.rotation.y+=dt*2;if(k<1){for(let i=0;i<3;i++)cutParticle(P.position.clone().add(new THREE.Vector3((Math.random()-.5)*1.5*S,-.5,(Math.random()-.5)*1.5*S)),new THREE.Vector3((Math.random()-.5)*2,6+Math.random()*4,(Math.random()-.5)*2),Math.random()<.5?0xff7a20:0xffd060,0.6,2*S);player.shake=.08;}return k>=1;};
  if(M==='pod'){const P=cut.pod;target.y=Math.max(1.5,P.position.y*.9);
    if(fall(P,70,2.4)&&!cut.impacted){cut.impacted=true;P.rotation.y=0;P.userData.jet.visible=false;impactFx(0,0,1);colliders.push({minX:-1.4,maxX:1.4,minZ:-1.4,maxZ:1.4});}
    if(t>3.6&&!cut.opened){cut.opened=true;play('saw');for(let i=0;i<20;i++)cutParticle(new THREE.Vector3(1.4,1.2,0),new THREE.Vector3(2+Math.random()*3,Math.random()*2,(Math.random()-.5)*3),0xbbbbbb,1.2,2);}
    if(cut.opened)cut.door.rotation.z=-Math.min(Math.PI/2,(t-3.6)*6);
    if(t>3.9){C.visible=true;walkChar(t,3.9,2.1,.2);target.set(C.position.x,1.7,0);camPos.set(7.5,2.0,2.2-Math.min(1,(t-3.9)/2)*.6);}}
  else if(M==='bigpod'){const P=cut.pod;target.y=Math.max(2*S,P.position.y*.9);camPos.set(8.5,3.4,7);
    if(fall(P,90,2.6)&&!cut.impacted){cut.impacted=true;P.rotation.y=Math.PI/4;P.userData.jet.visible=false;impactFx(0,0,1.5);C.visible=true;}
    if(t>3.4&&!cut.opened){cut.opened=true;play('boom');play('saw');for(let i=0;i<30;i++)cutParticle(new THREE.Vector3(0,2.2*S,0),new THREE.Vector3((Math.random()-.5)*6,4+Math.random()*4,(Math.random()-.5)*6),0xbbbbbb,1.4,2.5);}
    if(cut.opened){const k=Math.min(1,(t-3.4)/.7);P.userData.petals.forEach(pv=>pv.rotation.z=-k*k*Math.PI/2);const r=P.userData.roof;r.position.y=2.2*S+.45*S+(t-3.4)*(t-3.4)*14;r.position.x=(t-3.4)*6;r.rotation.x+=dt*2;r.visible=t<4.6;
      if(k>=1&&!cut.thud){cut.thud=true;play('boom');player.shake=.6;dust(new THREE.Vector3(0,0,0),20);}}
    if(t>4.2){walkChar(t,4.4,1.8,0);target.set(C.position.x,2.4*S,0);}}
  else if(M==='harness'){const hs=cut.ship;camPos.set(6.5,2.6,4);
    if(t<2.8){const k=t/2.8,e=1-(1-k)**2.5;C.position.set(0,45*(1-e),0);
      hs.userData.flames.forEach(f=>{f.scale.y=1.2+Math.random()*.8;});for(let i=0;i<2;i++)cutParticle(C.position.clone().add(new THREE.Vector3((Math.random()<.5?-1:1)*1.5,-.2,(Math.random()<.5?-1:1)*1.5)),new THREE.Vector3((Math.random()-.5)*2,-10,(Math.random()-.5)*2),Math.random()<.5?0xff8030:0x80c0ff,.4,2);
      if(!cut.roofHit&&C.position.y<H+2){cut.roofHit=1;play('boom');player.shake=.5;for(let i=0;i<12;i++){const sz=.4+Math.random()*.8;const m=new THREE.Mesh(scaleBoxUV(new THREE.BoxGeometry(sz,sz*.5,sz),sz,sz*.5,sz),matBrick);m.position.set((Math.random()-.5)*4,H,(Math.random()-.5)*4);levelGroup.add(m);gibs.push({m,v:new THREE.Vector3((Math.random()-.5)*3,-3,(Math.random()-.5)*3),spin:new THREE.Vector3(Math.random()*3,0,Math.random()*3),rest:false});}}}
    else if(!cut.impacted){cut.impacted=true;C.position.y=-.6;impactFx(0,0,1.5);hs.userData.flames.forEach(f=>f.visible=false);}
    if(cut.impacted){C.position.y=Math.min(0,C.position.y+dt*.8);
      if(t>3.3&&!cut.relT){cut.relT=1;play('clang');play('saw');const w=new THREE.Vector3();for(const p of hs.children.slice()){p.getWorldPosition(w);C.remove(p);levelGroup.add(p);p.position.copy(w);gibs.push({m:p,v:new THREE.Vector3(w.x*2+(Math.random()-.5)*2,3+Math.random()*3,w.z*2+(Math.random()-.5)*2),spin:new THREE.Vector3(Math.random()*4,0,Math.random()*4),rest:false});}}
      if(t>4.2)walkChar(t,4.2,1.8,0);}
    target.set(C.position.x,Math.min(5.5,Math.max(2.4,C.position.y+2.4)),0);}
  else if(M==='grav'){camPos.set(7*S,1.6,4);if(t<2.6){const k=t/2.6,e=1-(1-k)**2.2;C.visible=true;C.position.set(0,60*(1-e),0);C.rotation.x=0;
      if(Math.random()<.9)cutParticle(C.position.clone().add(new THREE.Vector3((Math.random()-.5)*.6,-.3,(Math.random()-.5)*.6)),new THREE.Vector3((Math.random()-.5)*2,-8,(Math.random()-.5)*2),Math.random()<.6?0x80d0ff:0xffffff,.4,1.6);}
    else if(!cut.impacted){cut.impacted=true;C.position.y=-.45;impactFx(0,0,.8);}
    if(cut.impacted){const k=clamp((t-2.9)/.8,0,1);C.position.y=-.45*(1-k);C.children.forEach(o=>{});if(t>3.8)walkChar(t,3.8,2,0);}
    target.set(C.position.x,Math.max(1.4,C.position.y+1.2),0);}
  else if(M==='teleport'){const gold=cls==='relic',col=gold?0xffd060:0x9fd8ff;camPos.set(7.5*S,2.2,3);target.set(0,1.4,0);
    if(t<1.4){if(Math.random()<dt*14){const a=Math.random()*6.28;bolt(new THREE.Vector3(Math.cos(a)*1.5,9,Math.sin(a)*1.5),new THREE.Vector3(Math.cos(a)*.6,0,Math.sin(a)*.6),col);play('zap');}if(!cut.ring){cut.ring=1;ringAt(0,.05,0,col,2.5,2.5,1.6,.08);}}
    else if(!cut.impacted){cut.impacted=true;C.visible=true;C.position.y=-.5;impactFx(0,0,.9);$('hurt').style.background=gold?'rgba(255,235,180,.95)':'rgba(220,240,255,.95)';
      for(let i=0;i<4;i++)bolt(new THREE.Vector3(0,12,0),new THREE.Vector3((Math.random()-.5)*2,0,(Math.random()-.5)*2),col);ringAt(0,.3,0,col,.4,6,.6,.2);for(let i=0;i<30;i++)cutParticle(new THREE.Vector3(0,1,0),new THREE.Vector3((Math.random()-.5)*6,Math.random()*5,(Math.random()-.5)*6),col,1,1.6);}
    if(cut.impacted){const k=clamp((t-2)/1,0,1);C.position.y=-.5*(1-k);if(t<3&&Math.random()<dt*6)bolt(new THREE.Vector3((Math.random()-.5)*2,2.2,(Math.random()-.5)*2),C.position.clone().setY(1),col);if(t>3.4)walkChar(t,3.4,2.2,0);target.set(C.position.x,1.6,0);}}
  else if(M==='rift'){const R=cut.rift;camPos.set(6.5,1.9,3);target.set(0,1.4,0);
    const open=t<4?clamp((t-.3)/1.2,0,1):Math.max(0,1-(t-4)/.35);R.scale.set(1.05*open+.001,1.7*open+.001,1);cut.riftGlow.material.opacity=.6+Math.sin(t*20)*.3;
    if(open>0&&Math.random()<.8){const a=Math.random()*6.28;cutParticle(new THREE.Vector3(-.3,1.3+Math.sin(a)*1.7,Math.cos(a)*1.1),new THREE.Vector3(1+Math.random()*2,(Math.random()-.5),(Math.random()-.5)),Math.random()<.5?0xb050ff:0x60ffb0,.7,1.4);}
    if(t>1.8){C.visible=true;walkChar(t,1.8,4,-.8);target.set(C.position.x,1.5,0);}
    if(t>4&&!cut.closed){cut.closed=true;play('hole');}if(t>4.35&&!cut.impacted){cut.impacted=true;R.visible=false;ringAt(-.3,1.3,0,0xb050ff,.2,4,.5,.15);player.shake=.5;play('boom');}}
  if(t>6.0){const k=clamp((t-6)/.8,0,1);camPos.lerp(new THREE.Vector3(C.position.x-0.1,(CLS[cls].eye||1.6)+.7,0),k);target.set(14,1.6,0);$('fade').style.opacity=k;}
  camPos.x=clamp(camPos.x,-HALF+.7,HALF-.7);camPos.z=clamp(camPos.z,-HALF+.7,HALF-.7);camPos.y=Math.min(camPos.y,H-.5);
  if(t<6){const tg=target.clone();tg.y=Math.min(tg.y,H-.6);const free=p=>{const d=p.clone().sub(tg),L=d.length();const h=castRayWalls(tg,d.normalize(),L);return h?h.distance:L;};
    if(cut.side===undefined){const m=camPos.clone();m.z=-m.z;cut.side=free(m)>free(camPos)+.5?-1:1;}if(cut.side<0)camPos.z=-camPos.z;
    const d=camPos.clone().sub(tg),L=d.length();d.normalize();const h=castRayWalls(tg,d,L);if(h&&h.distance<L)camPos.copy(tg).addScaledVector(d,Math.max(1.2,h.distance-.4));}
  if(t>.4&&!cut.capped){cut.capped=1;$('cutCap').textContent=ENTRY_CAP[M];}
  const c=camera,sh=player.shake*player.shake;player.shake=Math.max(0,player.shake-dt*1.5);
  c.position.copy(camPos).add(new THREE.Vector3((Math.random()-.5)*sh,(Math.random()-.5)*sh,(Math.random()-.5)*sh));c.lookAt(target);
  for(const p of cut.parts){p.life-=dt;p.v.y-=9*dt*p.grav;p.m.position.addScaledVector(p.v,dt);p.v.multiplyScalar(1-dt*1.5);if(p.m.position.y<0.05)p.m.position.y=0.05;if(p.life<=0)scene.remove(p.m);}
  cut.parts=cut.parts.filter(p=>p.life>0);
  updateDebris(dt);updateUfx(dt);
  candleLights.forEach((l,i)=>{const near=candles.slice().sort((a,b)=>a.lengthSq()-b.lengthSq());if(near[i])l.position.copy(near[i]);});
  if(t>6.8)endCutscene();
}
function endCutscene(){
  if(state!=='cutscene')return;
  if(cut.mode==='pod'&&!cut.impacted){cut.t=2.39;updateCutscene(0.02);}   // 跳过时也要落地
  for(const p of cut.parts)scene.remove(p.m);cut.parts=[];for(const o of cut.objs)scene.remove(o);cut.objs=[];
  if(cut.mode==='pod'){cut.door.rotation.z=-Math.PI/2;cut.pod.position.y=0;}
  if(cut.mode==='bigpod'){const P=cut.pod;P.position.y=0;P.userData.jet.visible=false;P.userData.petals.forEach(pv=>pv.rotation.z=-Math.PI/2);P.userData.roof.visible=false;}
  scene.remove(cut.char);cut.capped=0;cut.ring=0;cut.thud=0;cut.relT=0;cut.closed=0;cut.roofHit=0;cut.side=undefined;
  if(!SET.seenHelp){SET.seenHelp=true;saveSet();toggleHelp(true);setTimeout(()=>toggleHelp(false),10000);}   // 第一次出击自动显示按键
  player.pos.set(cut.ex,0,0);player.yaw=-Math.PI/2;player.pitch=0;player.shake=0;
  camera.position.set(cut.ex,1.6,0);camera.rotation.set(0,player.yaw,0,'YXZ');view.visible=true;
  $('letterbox').classList.remove('show');$('fade').style.opacity=0;
  state='ready';$('ready').classList.add('show');
}
