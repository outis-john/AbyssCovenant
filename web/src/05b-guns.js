// ============================================================ 新枪械：等离子枪 / 重型爆弹机枪 / 火焰喷射器 / 穿甲狙击枪
function gunModel(parts,flashZ,flashSize=.22,flashColor=0xffd080){const g=new THREE.Group();view.add(g);g.visible=false;
  for(const [w,h,d,x,y,z,m] of parts){const b=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);b.position.set(x,y,z);g.add(b);}
  const f=new THREE.Mesh(new THREE.BoxGeometry(flashSize,flashSize,.05),new THREE.MeshBasicMaterial({color:flashColor}));f.position.set(0,.02,flashZ);f.visible=false;g.add(f);
  g.position.set(.32,-.28,-.55);RANGED_MODELS.push(g);return [g,f];}
const plasmaGlow=new THREE.MeshBasicMaterial({color:0x60c0ff});
const brass=new THREE.MeshLambertMaterial({color:0xb8952e,emissive:0x1a1000});
const copper=new THREE.MeshLambertMaterial({color:0xc06a30,emissive:0x200800});
function mesh(geo,mat,x,y,z,parent){const m=new THREE.Mesh(geo,mat);m.position.set(x,y,z);parent.add(m);return m;}
// 等离子枪：机匣 + 散热鳍片 + 侧面电容 + 枪管上的铜线圈和三道发光感应环
const [plasmaM,plasmaF]=gunModel([[.18,.18,.46,0,0,.08,gunMat],[.12,.22,.14,0,-.16,.14,gunDark],[.2,.03,.3,0,.105,.05,gunDark],[.14,.06,.08,0,.1,-.12,brass]],-.86,.28,0xa0e0ff);
const plasmaCells=[];{for(const sx of [-1,1]){const c=mesh(new THREE.BoxGeometry(.05,.1,.26),plasmaGlow.clone(),sx*.115,.01,.06,plasmaM);plasmaCells.push(c);}
  for(let i=0;i<4;i++)mesh(new THREE.BoxGeometry(.22,.04,.025),gunDark,0,.125,-.02+i*.06,plasmaM);
  mesh(new THREE.CylinderGeometry(.045,.05,.62,8),gunDark,0,.02,-.48,plasmaM).rotation.x=Math.PI/2;
  for(let i=0;i<22;i++){const a=i*0.95,z=-.24-i*.022;mesh(new THREE.BoxGeometry(.025,.025,.03),copper,Math.cos(a)*.07,.02+Math.sin(a)*.07,z,plasmaM);}   // 螺旋线圈
  for(let i=0;i<3;i++){const r=mesh(new THREE.TorusGeometry(.085,.018,5,12),plasmaGlow,0,.02,-.62-i*.08,plasmaM);plasmaCells.push(r);}
  mesh(new THREE.TorusGeometry(.065,.022,5,10),brass,0,.02,-.82,plasmaM);}
// 重型爆弹机枪：转管式，顶部提把，六根枪管绕轴旋转，侧挂弹箱和弹链
const [hbM,hbF]=gunModel([[.26,.24,.5,0,0,.1,gunMat],[.2,.26,.2,0,-.2,.12,gunDark],[.22,.22,.08,0,0,-.18,brass],[.2,.2,.06,0,0,-.78,gunDark]],-.98,.32);
const hbBarrels=new THREE.Group();hbBarrels.position.set(0,0,-.5);hbM.add(hbBarrels);
{for(let i=0;i<6;i++){const a=i/6*Math.PI*2;mesh(new THREE.BoxGeometry(.05,.05,.66),gunDark,Math.cos(a)*.07,Math.sin(a)*.07,0,hbBarrels);}
 mesh(new THREE.BoxGeometry(.06,.06,.7),gunMat,0,0,0,hbBarrels);
 for(const z of [-.15,.2])mesh(new THREE.TorusGeometry(.1,.02,4,10),gunMat,0,0,z,hbBarrels);
 for(const z of [-.1,.3])mesh(new THREE.BoxGeometry(.04,.14,.04),gunDark,0,.19,z,hbM);mesh(new THREE.BoxGeometry(.05,.04,.5),brass,0,.27,.1,hbM);   // 提把
 mesh(new THREE.BoxGeometry(.18,.2,.26),new THREE.MeshLambertMaterial({color:0x3a4a2a}),-.22,-.1,.12,hbM);   // 弹箱
 for(let i=0;i<5;i++)mesh(new THREE.BoxGeometry(.04,.06,.03),brass,-.13+i*.012,-.02+i*.02,.02,hbM);}       // 弹链
// 火焰喷射器：双燃料罐、长喷嘴、喷嘴下方一直燃着的小引燃火苗
const [flM,flF]=gunModel([[.16,.16,.42,0,0,.08,gunMat],[.12,.2,.12,0,-.14,.2,gunDark],[.06,.06,.5,0,.02,-.38,gunDark],[.1,.1,.08,0,.02,-.64,brass]],-.72,.2,0xff8030);
const pilot=new THREE.Mesh(new THREE.BoxGeometry(.05,.07,.05),new THREE.MeshBasicMaterial({color:0x60a0ff}));pilot.position.set(0,-.05,-.7);flM.add(pilot);
const pilotO=new THREE.Mesh(new THREE.BoxGeometry(.04,.1,.04),new THREE.MeshBasicMaterial({color:0xffa030}));pilotO.position.set(0,-.01,-.7);flM.add(pilotO);
{const tank=new THREE.MeshLambertMaterial({color:0x8a2a1a});for(const sx of [-.07,.07]){const t=mesh(new THREE.CylinderGeometry(.07,.07,.34,8),tank,sx,-.2,-.05,flM);t.rotation.x=Math.PI/2;mesh(new THREE.TorusGeometry(.07,.012,4,8),brass,sx,-.2,-.2,flM);}
 mesh(new THREE.BoxGeometry(.02,.1,.02),copper,0,-.04,-.66,flM);}
// 穿甲狙击枪：长枪管 + 炮口制退器 + 瞄准镜 + 两脚架
const [snM,snF]=gunModel([[.12,.14,.55,0,0,.15,gunMat],[.1,.2,.12,0,-.14,.25,new THREE.MeshLambertMaterial({color:0x4a3a2a})],[.1,.12,.3,0,-.02,.5,new THREE.MeshLambertMaterial({color:0x4a3a2a})]],-1.18,.18);
{const b=mesh(new THREE.CylinderGeometry(.025,.03,.85,6),gunDark,0,.02,-.55,snM);b.rotation.x=Math.PI/2;
 mesh(new THREE.BoxGeometry(.08,.06,.1),gunDark,0,.02,-1.0,snM);for(const sx of [-1,1])mesh(new THREE.BoxGeometry(.012,.04,.06),gunDark,sx*.045,.02,-1.0,snM);
 const sc=mesh(new THREE.CylinderGeometry(.04,.05,.36,8),gunDark,0,.14,.0,snM);sc.rotation.x=Math.PI/2;mesh(new THREE.CylinderGeometry(.045,.045,.01,8),plasmaGlow,0,.14,.18,snM).rotation.x=Math.PI/2;
 for(const z of [-.08,.1])mesh(new THREE.BoxGeometry(.03,.06,.03),gunDark,0,.09,z,snM);
 for(const sx of [-1,1]){const l=mesh(new THREE.BoxGeometry(.015,.015,.22),gunDark,sx*.04,-.06,-.35,snM);l.rotation.x=-.5;}}
// 视角模型整体缩小并往前挪，免得离镜头太近
for(const G of [plasmaM,hbM,flM,snM]){const inner=new THREE.Group();while(G.children.length)inner.add(G.children[0]);inner.scale.setScalar(.68);inner.position.set(0,-.03,-.26);G.add(inner);}
Object.assign(RANGED,{
  plasma:{id:'plasma',name:'等离子枪',heat:true,magSize:Infinity,reserveMax:Infinity,res0:Infinity,rate:3,dmg:46,pellets:1,spread:.006,auto:false,climb:.04,kick:1.8,reload:0,splash:2.2,snd:'none',
    desc:'发射飞行的等离子弹，命中后范围爆炸。右键蓄力过充：伤害 ×3、爆炸更大，但过热时会烫伤自己。',model:plasmaM,flash:plasmaF},
  hbolter:{id:'hbolter',name:'重型爆弹机枪',spin:true,magSize:120,reserveMax:480,res0:240,rate:13,dmg:20,pellets:1,spread:.03,auto:true,climb:.008,kick:1.1,reload:2.6,knock:.25,snd:'hbolter',
    desc:'按住开火，枪管越转越快，射速从 3 发 / 秒升到 13 发 / 秒。开火时移动变慢。',model:hbM,flash:hbF},
  flamer:{id:'flamer',name:'火焰喷射器',flame:true,magSize:100,reserveMax:300,res0:200,rate:12,dmg:9,pellets:1,spread:0,auto:true,climb:0,kick:.2,reload:2,range:7,snd:'flame',
    desc:'近距离锥形喷火，同时烧到一片敌人，被点燃的敌人会持续掉血。射程只有 7 米。',model:flM,flash:flF},
  needle:{id:'needle',name:'穿甲狙击枪',scope:true,magSize:5,reserveMax:30,res0:20,rate:1.1,dmg:150,pellets:1,spread:0,auto:false,climb:.12,kick:3.4,reload:1.8,knock:.9,pierce3:true,snd:'needle',
    desc:'右键开镜。一枪穿透最多 3 个敌人，爆头直接打爆头颅。',model:snM,flash:snF}});
for(const k of ['plasma','hbolter','flamer','needle'])if(CFG.guns[k])Object.assign(RANGED[k],CFG.guns[k]);
Object.assign(sfx,{
  plasma(){tone('sine',90,28,0.7,0.35);tone('sawtooth',1400,120,0.22,0.3);noiseHit(2500,0.45,0.35,'bandpass');tone('square',3200,600,0.08,0.12);},
  plasmaBig(){tone('sine',70,22,1.0,0.6);tone('sawtooth',900,60,0.35,0.55);noiseHit(1200,0.8,0.7);noiseHit(5000,0.3,0.3,'highpass');},
  hbolter(){tone('sine',70,30,0.75,0.2);noiseHit(480,0.6,0.22);noiseHit(2600,0.22,0.12,'bandpass');},
  flame(){},
  needle(){tone('sine',60,24,1.1,0.9);noiseHit(700,1.0,0.6);noiseHit(6000,0.6,0.25,'highpass');tone('square',2200,180,0.25,0.15);noiseHit(300,0.4,1.6,'bandpass');}});
// ---------- 持续音：等离子电容充能、转管电机、喷火器火焰
const loops={};
function loopSound(name,on,param){if(!actx)return;let L=loops[name];
  if(on&&!L){const t=actx.currentTime;L=loops[name]={g:actx.createGain()};L.g.gain.value=0;L.g.connect(master);
    if(name==='flame'){const s=actx.createBufferSource();s.buffer=noiseBuf;s.loop=true;const f=actx.createBiquadFilter();f.type='lowpass';f.frequency.value=900;const f2=actx.createBiquadFilter();f2.type='peaking';f2.frequency.value=180;f2.gain.value=12;s.connect(f).connect(f2).connect(L.g);s.start();L.src=[s];}
    else{const o=actx.createOscillator();o.type=name==='spin'?'sawtooth':'sine';const o2=actx.createOscillator();o2.type='square';const f=actx.createBiquadFilter();f.type='lowpass';f.frequency.value=name==='spin'?900:4000;
      o.connect(f);o2.connect(f);f.connect(L.g);o.start();o2.start();L.src=[o,o2];L.o=o;L.o2=o2;}}
  if(!L)return;const t=actx.currentTime;
  if(!on){L.g.gain.setTargetAtTime(0,t,0.05);if(!L.stopT)L.stopT=setTimeout(()=>{L.src.forEach(x=>{try{x.stop();}catch(e){}});delete loops[name];},300);return;}
  if(L.stopT){clearTimeout(L.stopT);L.stopT=null;}
  if(name==='charge'){L.o.frequency.setTargetAtTime(220+param*1900,t,0.03);L.o2.frequency.setTargetAtTime(110+param*950,t,0.03);L.g.gain.setTargetAtTime(0.05+param*0.12,t,0.03);}
  if(name==='spin'){L.o.frequency.setTargetAtTime(40+param*220,t,0.05);L.o2.frequency.setTargetAtTime(20+param*110,t,0.05);L.g.gain.setTargetAtTime(param*0.16,t,0.05);}
  if(name==='flame')L.g.gain.setTargetAtTime(0.55,t,0.04);}
// ---------- 开火（在 fire() 里调用；返回 true 表示已处理）
let plasmaBalls=[];
function fireSpecial(w,mScale){
  if(w.id==='plasma'){const {o,d,muzzle}=fromMuzzle(w,w.spread);const big=mScale>0.9;const m=new THREE.Mesh(new THREE.BoxGeometry(big?.3:.18,big?.3:.18,big?.3:.18),new THREE.MeshBasicMaterial({color:big?0xe0f4ff:0x60c0ff}));
    if(muzzle)m.position.copy(o);else m.position.copy(o).add(new THREE.Vector3(0,-.12,0)).addScaledVector(d,.6);scene.add(m);plasmaBalls.push({m,d:d.clone(),life:2,dmg:w.dmg*(big?3:1)*player.gunMul,r:w.splash*(big?1.6:1)});
    play(big?'plasmaBig':'plasma');heat.v+=big?55:16;heat.charge=0;if(heat.v>=100){heat.v=100;heat.over=2.5;play('vent');if(big){hurtPlayer(12,true);announce('等离子过热！你被烫伤了',1.5);}else announce('等离子枪过热！',1.2);}return true;}
  if(w.flame){const R=fromMuzzle(w,0);const fwd=R.d,o=R.o;let any=false,kill=false;
    const oc=o.clone().addScaledVector(fwd,-1);   // 判定从枪口后 1 米算，锥形更宽一点
    for(const e of enemies){if(!e.alive)continue;const to=e.g.position.clone().setY(Math.max(.6,o.y-.4)).sub(oc);const L=to.length();if(L>w.range+1+e.r)continue;if(to.normalize().dot(fwd)<Math.cos(0.5))continue;
      kill=damageEnemy(e,w.dmg*player.gunMul,'body',fwd,{stagger:.05,knock:.05,how:{melt:L<3}})||kill;if(!isClient())e.burn=Math.max(e.burn,3);any=true;}
    player.flameT=0.15;
    for(let i=0;i<12;i++){const m=new THREE.Mesh(bloodGeo,new THREE.MeshBasicMaterial({color:[0xff5010,0xff8030,0xffd060,0xfff0a0][i%4],transparent:true,opacity:.9,depthWrite:false}));m.position.copy(o).addScaledVector(fwd,.15);m.scale.setScalar(1.2+Math.random()*1.5);scene.add(m);
      puffs.push({m,v:fwd.clone().multiplyScalar(8+Math.random()*5).add(new THREE.Vector3((Math.random()-.5)*4,(Math.random()-.2)*2.5,(Math.random()-.5)*4)),life:.45+Math.random()*.3,max:.75});}
    if(Math.random()<0.6){const dd=2+Math.random()*(w.range-2);const ff=fwdFlat();const hit=castRay(o,ff,dd);const L=hit&&!hit.object.userData.enemy?Math.max(1,hit.distance-.6):dd;
      addFirePatch(player.pos.x+ff.x*L+(Math.random()-.5),player.pos.z+ff.z*L+(Math.random()-.5));}
    if(any)showHit(kill);return true;}
  if(w.pierce3){const {o,d}=aimRay(0);ray.set(o,d);ray.far=120;const hits=ray.intersectObjects(hitTargets(),false);const done=new Set();let any=false,kill=false,head=false;
    for(const h of hits){const e=h.object.userData.enemy;if(!e){spawnSpark(h.point);break;}if(done.has(e))continue;done.add(e);const part=h.object.userData.part==='eye'?'head':h.object.userData.part;
      kill=damageEnemy(e,w.dmg*player.gunMul*(1-done.size*0.2+0.2),part,d,{point:h.point,knock:w.knock,stagger:.5,limbMul:2,how:part==='head'?{headBurst:true}:{hole:{p:h.point,dir:d,mode:'blast'}}})||kill;head=head||part==='head';hitSparks(h.point,d,5);any=true;if(done.size>=3)break;}
    heatBeam(o.clone().add(new THREE.Vector3(0,-.15,0)),o.clone().addScaledVector(d,30),.25);if(any){play(head?'head':'hit');showHit(kill);}return true;}
  return false;}
function updatePlasma(dt){for(const b of plasmaBalls){b.life-=dt;const len=40*dt;const h=castRay(b.m.position,b.d,len+.15);
    if(h||b.life<=0){const P=h?h.point:b.m.position.clone();b.dead=true;scene.remove(b.m);embersBlue(P,14);play('boom');fxSend('plasma',{x:P.x,y:P.y,z:P.z});let kill=false;
      for(const e of enemies){if(!e.alive)continue;const c=e.g.position.clone().setY(1.2*e.g.scale.y);const dd=c.distanceTo(P);if(dd>b.r+e.r)continue;
        const dir=c.clone().sub(P).normalize();kill=damageEnemy(e,b.dmg*(1-dd/(b.r*2+e.r)),dd<1?'body':'body',dir,{knock:.8,stagger:.4,point:c,how:{burst:{p:P,dir}}})||kill;}
      showHit(kill);continue;}
    b.m.position.addScaledVector(b.d,len);}plasmaBalls=plasmaBalls.filter(b=>!b.dead);}
// 重型爆弹机枪的转速；狙击镜
function updateGunExtras(dt){const W=WEAPONS[cur];
  player.spin=Math.max(0,Math.min(1,(player.spin||0)+((mouseDown&&W&&W.spin&&state==='playing')?dt*1.1:-dt*1.5)));
  const zoom=player.aiming&&W&&W.scope&&cur===0;const f=zoom?26:SET.fov+(ex.active?12:0);if(Math.abs(camera.fov-f)>0.1){camera.fov+=(f-camera.fov)*Math.min(1,dt*14);camera.updateProjectionMatrix();}
  const on=state==='playing'&&cur===0&&W;
  hbBarrels.rotation.z+=dt*player.spin*48;loopSound('spin',!!(on&&W.spin&&player.spin>0.02),player.spin);
  const ch=on&&W.id==='plasma'&&player.charging&&heat.over<=0;loopSound('charge',!!ch,heat.charge);
  for(const c of plasmaCells){const k=W&&W.id==='plasma'?heat.charge:0;c.scale.setScalar(1+k*0.25+Math.sin(gameTime*30)*0.04*k);}
  if(plasmaCells[0])for(const c of plasmaCells.slice(0,2))c.material.color.setHSL(0.55-0.05*heat.charge,1,0.55+heat.charge*0.35);
  pilotO.scale.set(1+Math.random()*.3,0.8+Math.random()*.7,1);pilot.scale.y=0.8+Math.random()*.4;
  player.flameT=Math.max(0,(player.flameT||0)-dt);loopSound('flame',!!(on&&player.flameT>0));
  updatePlasma(dt);updateFirePatches(dt);updateBarrels(dt);}
// ---------- 地面燃烧：喷火器在落点留下一段时间的火，烧到走进去的敌人
let firePatches=[];const patchGeo=new THREE.PlaneGeometry(1.4,1.4);
function addFirePatch(x,z,visual=false){if(!visual)fxSend('patch',{x:+x.toFixed(2),z:+z.toFixed(2)});if(firePatches.length>45){const o=firePatches.shift();scene.remove(o.m);}
  const m=new THREE.Mesh(patchGeo,new THREE.MeshBasicMaterial({color:0xff6a20,transparent:true,opacity:.8,depthWrite:false}));m.rotation.x=-Math.PI/2;m.rotation.z=Math.random()*3;m.position.set(x,.04,z);scene.add(m);
  firePatches.push({m,x,z,life:4.5,tick:0,visual});}
function updateFirePatches(dt){for(const p of firePatches){p.life-=dt;p.m.material.opacity=Math.min(.8,p.life/1.5)*(0.7+Math.random()*.3);p.m.material.color.setHSL(0.05+Math.random()*.05,1,.5);
    if(Math.random()<dt*10){const q=new THREE.Mesh(bloodGeo,new THREE.MeshBasicMaterial({color:Math.random()<.5?0xff8030:0xffd060}));q.position.set(p.x+(Math.random()-.5),.1,p.z+(Math.random()-.5));q.scale.setScalar(1.6);scene.add(q);sparks.push({m:q,v:new THREE.Vector3(0,2+Math.random()*2,0),life:.35});}
    p.tick-=dt;if(p.tick<=0&&!p.visual){p.tick=0.3;for(const e of enemies)if(e.alive&&!e.boss&&Math.hypot(e.g.position.x-p.x,e.g.position.z-p.z)<0.9+e.r)damageEnemy(e,7,'body',null,{stagger:0,_noShield:true});}
    if(p.life<=0)scene.remove(p.m);}firePatches=firePatches.filter(p=>p.life>0);}

// ---------- 枪口：子弹 / 火焰 / 等离子都从当前枪模型的枪口发出，飞向准星指着的点（机甲视线高，也对得上）
function muzzleOf(w){const f=w&&w.flash;if(!f)return null;camera.updateMatrixWorld(true);const p=new THREE.Vector3();f.getWorldPosition(p);return p;}
function aimPoint(o,d,far=80){const h=castRay(o,d,far);return h?h.point:o.clone().addScaledVector(d,far);}
function fromMuzzle(w,spread=0){const {o,d}=aimRay(spread);const m=muzzleOf(w);if(!m)return {o,d};const t=aimPoint(o,d);const dd=t.clone().sub(m);if(dd.length()<1.5)return {o,d};return {o:m,d:dd.normalize(),muzzle:true};}

// ---------- 枪口余烟 + 枪管过热发红：每把枪自己记热量，连射越久越红，停火后冒烟慢慢散
const barrel=new Map();   // 武器 id → {heat, smoke, glow}
function barrelOf(w){let b=barrel.get(w.id);if(!b){b={heat:0,smoke:0,glow:null};barrel.set(w.id,b);}
  if(w.flash&&(!b.glow||b.glow.parent!==w.flash.parent)){if(b.glow&&b.glow.parent)b.glow.parent.remove(b.glow);const g=new THREE.Mesh(new THREE.BoxGeometry(.16,.16,.14),new THREE.MeshBasicMaterial({color:0x000000,transparent:true,opacity:0,depthWrite:false}));
    g.position.copy(w.flash.position);g.position.z+=.1;w.flash.parent.add(g);b.glow=g;}return b;}
function barrelShot(w){if(!w||w.melee)return;const b=barrelOf(w);b.heat=Math.min(1,b.heat+(w.spin?0.012:w.flame?0.008:w.rate<2?0.18:0.06));b.smoke=Math.min(2.2,b.smoke+(w.spin?0.05:0.35));}
function updateBarrels(dt){const W=WEAPONS[cur];
  for(const [id,b] of barrel){b.heat=Math.max(0,b.heat-dt*(id==='hbolter'?0.18:0.3));if(b.glow){const k=b.heat;b.glow.material.opacity=Math.min(.9,k*1.2);b.glow.material.color.setRGB(.5+k*.5,.08+k*.45,k*k*.15);b.glow.visible=k>0.03;}}
  if(!W||W.melee||state!=='playing')return;const b=barrel.get(W.id);if(!b||b.smoke<=0)return;b.smoke-=dt;
  b.st=(b.st||0)-dt;if(b.st<=0&&!(mouseDown&&W.auto)){b.st=0.07;const p=muzzleOf(W);if(p){const m=new THREE.Mesh(bloodGeo,new THREE.MeshBasicMaterial({color:0x9a9690,transparent:true,opacity:.35,depthWrite:false}));
    m.position.copy(p).add(new THREE.Vector3((Math.random()-.5)*.03,.02,(Math.random()-.5)*.03));m.scale.setScalar(.35+b.heat*.4);scene.add(m);
    puffs.push({m,v:new THREE.Vector3((Math.random()-.5)*.15,.35+Math.random()*.25,(Math.random()-.5)*.15),life:.9,max:1.6});}}}
