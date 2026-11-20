// ============================================================ 新敌人：腐爆者 / 裂隙猎犬 / 骨盾恶魔 + 地图区域刷怪
const ENEMY_BUILD={
  bloater:e=>{e.parts.body.scale.set(1.7,1.25,1.7);e.parts.head.scale.setScalar(.8);e.fuse=0;
    for(let i=0;i<5;i++){const b=new THREE.Mesh(new THREE.BoxGeometry(.22,.22,.22),new THREE.MeshLambertMaterial({color:0xa0c040,emissive:0x203000}));b.position.set((Math.random()-.5)*.8,(Math.random()-.5)*.8,.32);b.userData.part='boil';e.parts.body.add(b);}},
  hound:e=>{e.parts.body.scale.set(.8,.7,1.5);e.parts.body.position.y=.9;e.parts.head.position.set(0,1.25,.55);e.parts.armL.position.y=e.parts.armR.position.y=.75;e.parts.armL.position.z=e.parts.armR.position.z=.45;e.leapCd=1+Math.random()*2;},
  bulwark:e=>{const T=CFG.enemies.bulwark;e.shieldHp=T.shield*curThreat().hp;const m=new THREE.Mesh(new THREE.BoxGeometry(1.25,1.6,.18),new THREE.MeshLambertMaterial({map:texBone,color:0xd8c8a8}));
    m.position.set(0,1.25,.62);e.g.add(m);for(const y of [.4,-.3]){const s=new THREE.Mesh(new THREE.ConeGeometry(.09,.3,4),new THREE.MeshLambertMaterial({color:0x2a2018}));s.rotation.x=Math.PI/2;s.position.set(0,y,.2);m.add(s);}e.shieldM=m;}};
// 骨盾：从正面打来的伤害只剩 10%；重击、爆炸、热熔对盾牌伤害 ×3
function shieldBlock(e,dmg,dir,opts){const fwd=new THREE.Vector3(Math.sin(e.g.rotation.y),0,Math.cos(e.g.rotation.y));if(dir.clone().setY(0).normalize().dot(fwd)>-0.3)return dmg;
  const how=opts.how||{};const heavy=how.burst||how.melt||how.hole||(opts.stagger||0)>=0.8;e.shieldHp-=dmg*(heavy?3:1);
  hitSparks(e.g.position.clone().setY(1.3*e.g.scale.y).addScaledVector(fwd,.7*e.g.scale.x),dir.clone().negate(),4);play('clang');
  if(e.shieldHp<=0)breakShield(e);return dmg*0.1;}
function breakShield(e){e.shieldHp=0;if(!e.shieldM||!e.shieldM.parent)return;const wp=new THREE.Vector3();e.shieldM.getWorldPosition(wp);e.g.remove(e.shieldM);
  for(let i=0;i<6;i++){const m=new THREE.Mesh(new THREE.BoxGeometry(.35,.4,.15),matBone);m.position.copy(wp).add(new THREE.Vector3((Math.random()-.5),(Math.random()-.5),0));scene.add(m);throwGib(m,new THREE.Vector3((Math.random()-.5)*5,3+Math.random()*3,(Math.random()-.5)*5));}
  play('rip');if(e.g.position.distanceTo(player.pos)<20)announce('骨盾碎了！',0.8);}
// 腐爆者爆炸：所有端都播放画面；伤害只由房主 / 单人计算
function bloaterBurst(e){const P=e.g.position.clone().setY(1);puff(P,14,0x6a8020,1.6);spawnBlood(P,null,40);embersGreen(P);play('boom');play('sizzle');if(P.distanceTo(player.pos)<12)player.shake=Math.max(player.shake,.4);
  if(isClient())return;const R=3.6;
  for(const t of targetsList())if(Math.hypot(t.pos.x-P.x,t.pos.z-P.z)<R){if(t.remote)sendTo(t.remote.id,{t:'hurt',n:e.dmg,att:null});else hurtPlayer(e.dmg,false,null);}
  for(const o of enemies)if(o!==e&&o.alive&&o.g.position.distanceTo(P)<R+o.r)damageEnemy(o,60,'body',o.g.position.clone().sub(P).setY(0).normalize(),{_remote:true,knock:1.5,how:{burst:{p:P,dir:o.g.position.clone().sub(P).normalize()}}});}
const ENEMY_AI={
  bloater(e,T,pp,to,dist,dt){if(e.fuse>0){e.fuse-=dt;const k=1-e.fuse/0.8;e.parts.body.scale.set(1.7+k*.6,1.25+k*.5,1.7+k*.6);e.flash=Math.sin(gameTime*40)>0?.05:0;
      if(e.fuse<=0)damageEnemy(e,99999,'body',null,{_remote:true});return true;}
    if(dist<e.reach){e.fuse=0.8;play('hiss');return true;}return false;},
  hound(e,T,pp,to,dist,dt){if(e.leap){const L=e.leap;L.t+=dt;e.g.position.addScaledVector(L.v,dt);e.g.position.y=Math.max(0,Math.sin(Math.min(1,L.t/0.55)*Math.PI)*1.4);collide(e.g.position,e.r);
      if(!L.hit&&T&&Math.hypot(T.pos.x-e.g.position.x,T.pos.z-e.g.position.z)<1.3){L.hit=true;if(T.remote)sendTo(T.remote.id,{t:'hurt',n:e.dmg*1.6,att:e.id});else hurtPlayer(e.dmg*1.6,false,e);}
      if(L.t>=0.55){e.g.position.y=0;e.leap=null;e.leapCd=2.5+Math.random()*2;e.stagger=.25;}return true;}
    e.leapCd-=dt;if(dist>3&&dist<8&&e.leapCd<=0&&hasLOS(e,pp)){e.leap={t:0,v:to.clone().normalize().multiplyScalar(dist/0.55)};play('growl');return true;}return false;}};
// ---------- 区域：配色 / 灯光 / 刷怪
let curBiome='hive',pendingBiome=null;
function pickBiome(){const ks=Object.keys(CFG.biomes);if(pendingBiome&&CFG.biomes[pendingBiome])return pendingBiome;const want=loadout.biome||'random';return want!=='random'&&CFG.biomes[want]?want:ks[seed%ks.length];}
function applyBiome(){const B=CFG.biomes[curBiome];matBrick.color.setHex(B.wall);scene.fog.color.setHex(B.fog);scene.fog.density=B.fogD;scene.background.setHex(B.bg);
  scene.traverse(o=>{if(o.isHemisphereLight){o.color.setHex(B.hemi[0]);o.groundColor.setHex(B.hemi[1]);}});for(const l of candleLights)l.color.setHex(B.lamp);}
function pickEnemy(noBrute){const sp=CFG.biomes[curBiome].spawn,w=Object.entries(sp);if(!noBrute)w.push(['brute',CFG.wave.bruteChance*10]);let t=w.reduce((a,[,v])=>a+v,0)*Math.random();
  for(const [k,v] of w){t-=v;if(t<=0)return k;}return 'imp';}
// 区域装饰（在 buildLevel 末尾调用；用 rng，房主和队友一样）
function biomeProps(){const B=curBiome;
  for(let i=0;i<G;i++)for(let j=0;j<G;j++){if(i+j===0)continue;const cx=i*C,cz=j*C;
    if(B==='sanctum'){for(let r=0;r<3;r++)if(rng()<.6){const z=cz-4+r*3.5;addBox(cx-2.6,z,3.2,.7,0,.9,matDark);addBox(cx+2.6,z,3.2,.7,0,.9,matDark);}
      if(rng()<.5){addBox(cx,cz-HALF+1.2,1.2,1.2,0,1,matDark);const st=new THREE.Mesh(new THREE.BoxGeometry(.8,2.6,.6),matBone);st.position.set(cx,2.3,cz-HALF+1.2);levelGroup.add(st);}}
    if(B==='frost'){for(let k=0;k<3;k++)if(rng()<.55){const x=cx+(rng()-.5)*13,z=cz+(rng()-.5)*13,h=1+rng()*2.5;const m=new THREE.Mesh(new THREE.ConeGeometry(.5+rng()*.5,h,5),iceMat);m.position.set(x,h/2,z);levelGroup.add(m);
        colliders.push({minX:x-.45,maxX:x+.45,minZ:z-.45,maxZ:z+.45});}}
    if(B==='hive'&&rng()<.5){const m=new THREE.Mesh(new THREE.BoxGeometry(C*.8,.35,.35),matMetal);m.position.set(cx,H-1,cz+(rng()-.5)*12);levelGroup.add(m);}}
  levelGroup.traverse(o=>{if(o.isMesh&&o.material&&o.material.map===texFloor){o.material.color.setHex(CFG.biomes[B].floor);}if(o.isMesh&&o.material&&o.material.map===texCeil)o.material.color.setHex(CFG.biomes[B].ceil);});}
const iceMat=new THREE.MeshLambertMaterial({color:0xa8d8ff,emissive:0x203858,transparent:true,opacity:.85});
