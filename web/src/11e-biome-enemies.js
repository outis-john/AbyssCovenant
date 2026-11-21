// ============================================================ 区域专属敌人 + 三种 Boss 变体 + 伤害玩家的地面危险（火海 / 冰锥）
const BOSS_NAME={hive:'熔炉巨像',sanctum:'堕落大主教',frost:'冰霜巨兽'};
Object.assign(ENEMY_BUILD,{
  tanker:e=>{const t=new THREE.Mesh(new THREE.CylinderGeometry(.32,.32,.9,8),new THREE.MeshLambertMaterial({color:0x8a2a1a,emissive:0x200400}));t.position.set(0,.15,-.42);e.parts.body.add(t);
    const n=new THREE.Mesh(new THREE.BoxGeometry(.12,.12,.5),gunDark);n.position.set(0,-.3,.25);e.parts.armR.add(n);e.tankM=t;e.flameCd=2;},
  priest:e=>{const h=new THREE.Mesh(new THREE.TorusGeometry(.32,.04,4,14),new THREE.MeshBasicMaterial({color:0xa040ff}));h.rotation.x=Math.PI/2;h.position.y=.55;e.parts.head.add(h);
    const robe=new THREE.Mesh(new THREE.BoxGeometry(1,1.1,.7),new THREE.MeshLambertMaterial({color:0x2a1830}));robe.position.set(0,-.7,0);e.parts.body.add(robe);e.blessCd=2;},
  frostling:e=>{for(let i=0;i<5;i++){const c=new THREE.Mesh(new THREE.ConeGeometry(.08,.4,4),BM.glow);c.position.set((Math.random()-.5)*.6,.4,(Math.random()-.5)*.4-.2);c.rotation.x=-.4;e.parts.body.add(c);}},
  lord:e=>{e.variant=curBiome;const col={hive:0x4a2010,sanctum:0x2a1a30,frost:0x4a6a8a}[curBiome];if(col)e.mat.color.setHex(col);
    if(curBiome==='hive'){const g=new THREE.Mesh(new THREE.BoxGeometry(.6,.3,.3),new THREE.MeshBasicMaterial({color:0xff6020}));g.position.set(0,.2,.32);e.parts.body.add(g);}
    if(curBiome==='sanctum'){const h=new THREE.Mesh(new THREE.TorusGeometry(.4,.05,4,16),new THREE.MeshBasicMaterial({color:0xc040ff}));h.rotation.x=Math.PI/2;h.position.y=.6;e.parts.head.add(h);}
    if(curBiome==='frost')for(let i=0;i<8;i++){const c=new THREE.Mesh(new THREE.ConeGeometry(.12,.7,4),BM.ice);c.position.set((Math.random()-.5)*.9,.5,-.3);c.rotation.x=-.5;e.parts.body.add(c);}}});
Object.assign(ENEMY_AI,{
  tanker(e,T,pp,to,dist,dt){e.flameCd-=dt;if(e.flaming>0){e.flaming-=dt;e.flTick=(e.flTick||0)-dt;const f=to.clone().normalize();
      if(e.flTick<=0){e.flTick=.18;const o=e.g.position.clone().setY(1.2*e.g.scale.y).addScaledVector(f,.8);flameBurst(o,f);fxSend('eflame',{x:o.x,y:o.y,z:o.z,dx:f.x,dz:f.z});
        if(T&&dist<5.5){if(T.remote)sendTo(T.remote.id,{t:'hurt',n:e.dmg,att:e.id});else hurtPlayer(e.dmg,false,e);}}return true;}
    if(dist<5&&e.flameCd<=0){e.flaming=1;e.flameCd=3.5;play('melta');return true;}return false;},
  priest(e,T,pp,to,dist,dt){e.blessCd-=dt;if(e.blessCd<=0){e.blessCd=5;let n=0;for(const o of enemies){if(!o.alive||o===e||o.static)continue;if(o.g.position.distanceTo(e.g.position)<9){o.hp=Math.min(o.maxHp,o.hp+40);o.blessT=5;n++;}}
      if(n){blessFx(e.g.position.x,e.g.position.z);fxSend('bless',{x:e.g.position.x,z:e.g.position.z});play('choir');}}
    if(dist<9){const away=to.clone().normalize().multiplyScalar(-1);const sd=steer(e,away,dt);e.g.position.addScaledVector(sd,e.speed*.8*dt);collide(e.g.position,e.r);e.walk+=dt*5;e.parts.legL.rotation.x=Math.sin(e.walk)*.6;e.parts.legR.rotation.x=-Math.sin(e.walk)*.6;return true;}
    return dist<14;}});
// ---------- 视觉
function flameBurst(o,f){for(let i=0;i<6;i++){const m=new THREE.Mesh(bloodGeo,new THREE.MeshBasicMaterial({color:[0xff5010,0xff9030,0xffe080][i%3],transparent:true,opacity:.9,depthWrite:false}));m.position.copy(o);m.scale.setScalar(1.6+Math.random());scene.add(m);
  puffs.push({m,v:f.clone().multiplyScalar(7+Math.random()*3).add(new THREE.Vector3((Math.random()-.5)*2,Math.random()*1.5,(Math.random()-.5)*2)),life:.45,max:.6});}}
function blessFx(x,z){const m=new THREE.Mesh(new THREE.TorusGeometry(1,.06,4,24),new THREE.MeshBasicMaterial({color:0xa040ff,transparent:true,opacity:.8}));m.rotation.x=Math.PI/2;m.position.set(x,.2,z);scene.add(m);
  hazFx.push({m,t:0,grow:9});embersBlue(new THREE.Vector3(x,1.5,z),10);}
function tankerBurst(e){const p=e.g.position;play('boom');play('melta');puff(p.clone().setY(1),12,0x2a1a10,1.6);flameBurst(p.clone().setY(1),new THREE.Vector3(0,1,0));
  if(!isClient())for(let k=0;k<6;k++){const a=k/6*6.28;addHazard('fire',p.x+Math.cos(a)*1.6,p.z+Math.sin(a)*1.6,5);}
  if(!isClient())for(const o of enemies)if(o!==e&&o.alive&&o.g.position.distanceTo(p)<3.5)damageEnemy(o,50,'body',o.g.position.clone().sub(p).setY(0).normalize(),{_remote:true,how:{melt:true}});}
function iceBurst(e){const c=e.g.position.clone().setY(1);for(let i=0;i<10;i++){const m=new THREE.Mesh(new THREE.BoxGeometry(.18,.18,.18),BM.ice);m.position.copy(c);scene.add(m);
  throwGib(m,new THREE.Vector3((Math.random()-.5)*7,2+Math.random()*4,(Math.random()-.5)*7));}play('clang');}
function slowTarget(T,d){if(!T)return;if(T.remote)sendTo(T.remote.id,{t:'slow',d});else{player.slowT=Math.max(player.slowT||0,d);announce('被冻住了：移动变慢',0.8);}}
// ---------- 伤害玩家的地面危险（房主判定）
let hazards=[],hazFx=[];
function addHazard(kind,x,z,life){hazards.push({kind,x,z,life,tick:0});if(kind==='fire'){addFirePatch(x,z,true);}}
function iceWarn(x,z){const m=new THREE.Mesh(new THREE.RingGeometry(1.6,1.9,20),new THREE.MeshBasicMaterial({color:0x80d0ff,side:2,transparent:true,opacity:.8}));m.rotation.x=-Math.PI/2;m.position.set(x,.05,z);scene.add(m);hazFx.push({m,t:0,life:1});}
function iceSpikes(x,z){for(let i=0;i<7;i++){const a=i/7*6.28,r=i?1:0;const c=new THREE.Mesh(new THREE.ConeGeometry(.3,2.2,5),BM.ice);c.position.set(x+Math.cos(a)*r,1.1,z+Math.sin(a)*r);scene.add(c);hazFx.push({m:c,t:0,life:2.5,spike:true});}play('clang');play('boom');}
function updateHazards(dt){for(const h of hazards){h.life-=dt;h.tick-=dt;if(h.tick>0)continue;h.tick=.5;if(isClient())continue;
    for(const t of targetsList())if(Math.hypot(t.pos.x-h.x,t.pos.z-h.z)<1.2){if(t.remote)sendTo(t.remote.id,{t:'hurt',n:6,att:null});else hurtPlayer(6,false,null);}}
  hazards=hazards.filter(h=>h.life>0);
  for(const f of hazFx){f.t+=dt;if(f.grow){f.m.scale.setScalar(1+f.t*f.grow);f.m.material.opacity=Math.max(0,.8-f.t*1.6);if(f.t>.5){scene.remove(f.m);f.dead=true;}}
    else if(f.t>f.life){scene.remove(f.m);f.dead=true;}else if(f.spike&&f.t>f.life-.5)f.m.position.y-=dt*4;}
  hazFx=hazFx.filter(f=>!f.dead);}
// ---------- Boss 变体行为（在 bossAI 里调用；返回 true 表示这一帧已处理）
function bossVariantTick(e,T,ph,dt){if(!T||ph<2)return false;
  if(e.variant==='sanctum'){e.tpCd=(e.tpCd??6)-dt;if(e.tpCd<=0){e.tpCd=9;const b=new THREE.Vector3(Math.sin((T.remote?T.remote.yaw:player.yaw)),0,Math.cos(T.remote?T.remote.yaw:player.yaw));
      fxSend('tport',{x:e.g.position.x,z:e.g.position.z});embersBlue(e.g.position.clone().setY(1.5),20);e.g.position.set(T.pos.x+b.x*3,0,T.pos.z+b.z*3);collide(e.g.position,e.r);
      embersBlue(e.g.position.clone().setY(1.5),20);fxSend('tport',{x:e.g.position.x,z:e.g.position.z});play('zap');annTeam('大主教出现在你身后！',1.2);e.cd=0.4;}}
  if(e.variant==='frost'){e.iceCd=(e.iceCd??4)-dt;if(e.iceCd<=0){e.iceCd=6;const x=T.pos.x,z=T.pos.z;iceWarn(x,z);fxSend('icewarn',{x,z});
      setTimeout(()=>{if(!e.alive)return;iceSpikes(x,z);fxSend('ice',{x,z});for(const t of targetsList())if(Math.hypot(t.pos.x-x,t.pos.z-z)<2){if(t.remote)sendTo(t.remote.id,{t:'hurt',n:28,att:null});else hurtPlayer(28,false,null);slowTarget(t,2);}},1000);}}
  return false;}
