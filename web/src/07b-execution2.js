// ============================================================ 处决扩展：新武器处决、快速处决
// 枪械处决用当前武器自己的模型（机甲是驾驶舱机炮）；近战用 sword（机甲是驾驶舱巨拳）
function exGun(T,keys){const m=WEAPONS[cur].model;m.position.set(...kf(T,keys));return m;}
function exFlash(){const fl=WEAPONS[cur].flash;if(!fl)return;fl.visible=true;setTimeout(()=>fl.visible=false,50);}
function exQuick(T,t,f,rt,up,bloodAt,tp){
  if(ex.melee){sword.rotation.set(...kf(T,[[0,[.8,1.5,1]],[.2,[-.85,-1.6,-.85]],[.45,[-.8,-1.5,-.8]]]));sword.position.set(...kf(T,[[0,[.6,-.1,-.4]],[.2,[-.3,-.6,-.3]],[.45,[-.3,-.6,-.3]]]));
    at('kill',.18,()=>{meleeSound(WEAPONS[2],true);exKill({how:{cut:{p:tp(1.3),n:new THREE.Vector3().crossVectors(rt.clone().add(up).normalize(),f).normalize(),imp:4}}});});}
  else{exGun(T,[[0,[.32,-.28,-.55]],[.12,[.08,-.12,-.75]],[.45,[.08,-.12,-.75]]]);at('kill',.18,()=>{play(WEAPONS[cur].snd==='none'?'plasma':WEAPONS[cur].snd);exFlash();gunKick=1.8;exKill({how:{headBurst:true}});});}}
function exExtra(T,dt,t,f,rt,up,bloodAt,tp){const S=t.g.scale.y;
  switch(ex.type){
    case 'plasma':{ // 枪口抵胸，线圈过充发光，近距离轰爆
      exGun(T,[[0,[.32,-.28,-.55]],[.2,[.05,-.2,-.95]],[ex.dur,[.05,-.2,-.95]]]);const k=clamp((T-.2)/.6,0,1);heat.charge=k;loopSound('charge',T>.2&&T<.8,k);
      if(T>.2&&T<.8){player.shake=Math.max(player.shake,.05+k*.15);if(Math.random()<.5)embersBlue(contactPoint(t),2);}
      at('kill',.82,()=>{loopSound('charge',false);heat.charge=0;play('plasmaBig');exFlash();embersBlue(contactPoint(t),30);player.punch=.14;exKill({fling:2,how:{burst:{p:contactPoint(t),dir:f}}});});break;}
    case 'hbolter':{ // 枪管顶住，转管抵近扫射把它撕碎
      exGun(T,[[0,[.32,-.28,-.55]],[.18,[.1,-.25,-.9]],[ex.dur,[.1,-.25,-.9]]]);player.spin=Math.min(1,T*2);loopSound('spin',T<1,player.spin);
      if(T>.3&&T<.95){ex.tick=(ex.tick||0)-dt;if(ex.tick<=0){ex.tick=.06;play('hbolter');exFlash();gunKick=1;bloodAt(4);hitSparks(contactPoint(t),f.clone().negate(),2);t.lean=1;t.headSnap=1;t.g.position.addScaledVector(f,.02);}player.shake=Math.max(player.shake,.18);}
      at('kill',.95,()=>{exKill({fling:3,how:{cut:{p:tp(1.15),n:up.clone(),imp:2,fling:f.clone().multiplyScalar(9)}}});});break;}
    case 'flamer':{ // 近距离焚烧：从红到焦黑，最后化成一滩
      exGun(T,[[0,[.32,-.28,-.55]],[.18,[.1,-.22,-.8]],[ex.dur,[.1,-.22,-.8]]]);
      if(T>.2&&T<1.0){player.flameT=.15;const k=(T-.2)/.8;if(t.alive){t.mat.emissive.setRGB(1-k*.8,.35*(1-k),0);t.g.rotation.z=Math.sin(T*30)*.08;}
        for(let i=0;i<3;i++){const m=new THREE.Mesh(bloodGeo,new THREE.MeshBasicMaterial({color:[0xff5010,0xff9030,0xffe080][i]}));m.position.copy(contactPoint(t)).add(new THREE.Vector3((Math.random()-.5)*.6,(Math.random()-.3)*1.2,(Math.random()-.5)*.6));m.scale.setScalar(2);scene.add(m);sparks.push({m,v:new THREE.Vector3(0,3+Math.random()*2,0),life:.4});}}
      at('kill',1.02,()=>{loopSound('flame',false);play('melta');addFirePatch(t.g.position.x,t.g.position.z);exKill({how:{melt:true}});});break;}
    case 'needle':{ // 抵住下巴，一枪掀飞头颅，慢动作
      exGun(T,[[0,[.32,-.28,-.55]],[.25,[.05,-.32,-.9]],[ex.dur,[.05,-.32,-.9]]]);WEAPONS[cur].model.rotation.set(-.35,0,0);
      at('kill',.5,()=>{play('needle');exFlash();hitstop=.25;gunKick=2.5;player.punch=.12;exKill({how:{headBurst:true}});});break;}
    case 'hammer':{ // 高举过顶，雷霆砸下，把它砸扁
      sword.rotation.set(...kf(T,[[0,[0,.3,.1]],[.45,[2.2,.1,.1]],[.62,[-1.4,0,0]],[ex.dur,[-1.3,0,0]]]));sword.position.set(...kf(T,[[0,[.3,-.42,-.3]],[.45,[.15,.5,0]],[.62,[0,-.7,-.9]],[ex.dur,[0,-.7,-.9]]]));
      if(T>.15&&T<.6&&Math.random()<.4)embersBlue(camera.position.clone().add(new THREE.Vector3(0,.5,0)),1);
      at('kill',.62,()=>{play('zap');play('boom');slamFx(t.g.position.x,t.g.position.z);embersBlue(t.g.position.clone().setY(.5),24);t.g.scale.y=t.s0*.35;player.shake=.6;exKill({how:{burst:{p:tp(1),dir:up.clone().negate()}}});});break;}
    case 'fist':{ // 抓住、举起、捏碎
      sword.rotation.set(...kf(T,[[0,[0,0,0]],[.25,[-.2,0,0]],[.9,[-.5,0,.2]]]));sword.position.set(...kf(T,[[0,[.4,-.38,-.1]],[.25,[.05,-.15,-1.0]],[.6,[.05,.15,-.95]],[.9,[.05,.2,-.9]]]));
      if(T>.25&&T<.95&&t.alive){t.g.position.y=Math.min(.9,(T-.25)*2.2);t.g.rotation.z=Math.sin(T*40)*.06*(T>.6?2:1);player.shake=Math.max(player.shake,T>.6?.2:.05);}
      at('grab',.25,()=>{play('clang');hitstop=.06;t.headSnap=1;});at('squeeze',.62,()=>{play('grind');bloodAt(12);});
      at('kill',.95,()=>{play('rip');play('kill');t.g.position.y=.3;spawnBlood(contactPoint(t),null,60);exKill({how:{burst:{p:contactPoint(t),dir:up.clone()}}});});break;}
    case 'axe':{ // 先横斩砍断腿，再竖劈成两半
      sword.rotation.set(...kf(T,[[0,[0,.3,.1]],[.15,[.1,2.4,.3]],[.35,[.1,-2.4,-.3]],[.6,[1.9,.2,.1]],[.8,[-1.4,0,0]],[ex.dur,[-1.3,0,0]]]));
      sword.position.set(...kf(T,[[0,[.3,-.42,-.3]],[.15,[.8,-.6,-.4]],[.35,[-.8,-.6,-.5]],[.6,[.2,.45,-.2]],[.8,[0,-.6,-.8]],[ex.dur,[0,-.6,-.8]]]));
      at('legs',.3,()=>{play('grind');t.legsLost=true;t.g.position.y=-.4*S;bloodAt(16);hitstop=.06;});
      at('kill',.8,()=>{play('rip');play('grind');exKill({how:{cut:{p:tp(1.1),n:rt.clone(),imp:4}}});});break;}
  }}
// X：点按 = 快速处决；按住 0.3 秒 = 完整处决
const exHold={on:false,t:0};
function updateExHold(dt){if(!exHold.on)return;exHold.t+=dt;if(exHold.t>=0.3){exHold.on=false;execute('full');}}
