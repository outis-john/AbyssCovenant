;(async()=>{let now=0;const step=n=>{for(let i=0;i<n;i++){now+=16;frame(now);}};const log=console.log;globalThis.setTimeout=(f)=>{f();return 0;};
const clear=()=>{enemies.forEach(e=>{e.alive=false;scene.remove(e.g)});enemies=[];};
for(const b of Object.keys(CFG.biomes)){loadout.biome=b;prepareMatch(11);const cnt={};enemies.forEach(e=>cnt[e.type]=(cnt[e.type]||0)+1);
  log(b.padEnd(8),'biome',curBiome,'| enemies',JSON.stringify(cnt));}
loadout.biome='random';prepareMatch(12);log('random biome from seed',curBiome);
cls='ward';loadout.biome='hive';prepareMatch(1);state='playing';clear();wallMeshes.length=0;colliders.length=0;player.pos.set(0,0,0);player.yaw=0;player.pitch=0;player.hp=player.maxHp=500;
// 腐爆者：靠近自爆，伤玩家也炸旁边的恶魔
let b=spawnEnemy('bloater',0,-5);const imp=spawnEnemy('imp',1.2,-1.8);imp.cd=99;imp.reach=0;let hp0=player.hp;for(let i=0;i<120&&b.alive;i++)step(1);step(3);
log('bloater: exploded',!b.alive,'| player dmg',Math.round(hp0-player.hp),'| nearby imp hurt',!imp.alive||imp.hp<imp.maxHp);clear();
// 打死腐爆者也会爆
b=spawnEnemy('bloater',0,-8);const imp2=spawnEnemy('imp',0.8,-8.5);imp2.cd=99;damageEnemy(b,999,'body',new THREE.Vector3(0,0,-1));step(2);log('shot bloater bursts, chain hit imp',!imp2.alive||imp2.hp<imp2.maxHp);clear();
// 猎犬扑跳
const h=spawnEnemy('hound',0,-6.5);h.leapCd=0;h.los=true;h.losT=99;hp0=player.hp;let leapt=false;for(let i=0;i<60;i++){step(1);leapt=leapt||!!h.leap;}log('hound leapt',leapt,'| player dmg',Math.round(hp0-player.hp));clear();
// 骨盾：正面挡枪，背后全伤，重击破盾
let w=spawnEnemy('bulwark',0,-4);w.cd=99;step(2);const fwdHit=new THREE.Vector3(0,0,-1);
let h0=w.hp;damageEnemy(w,100,'body',fwdHit,{});const front=h0-w.hp;h0=w.hp;damageEnemy(w,100,'body',fwdHit.clone().negate(),{});const back=h0-w.hp;
log('bulwark front dmg',Math.round(front),'| back dmg',Math.round(back),'| shield hp',Math.round(w.shieldHp));
for(let i=0;i<3&&w.shieldHp>0;i++)damageEnemy(w,60,'body',fwdHit,{how:{burst:{p:w.g.position.clone(),dir:fwdHit}}});log('explosions break shield',w.shieldHp<=0,'| shield removed',!w.shieldM.parent);
log('DONE');})();
