;(async()=>{let now=0;const step=n=>{for(let i=0;i<n;i++){now+=16;frame(now);}};const log=console.log;globalThis.setTimeout=(f)=>{f();return 0;};
prepareMatch();state='playing';const clear=()=>{enemies.forEach(e=>{e.alive=false;scene.remove(e.g)});enemies=[];};clear();
wallMeshes.length=0;colliders.length=0;player.hp=player.maxHp=9999;player.pos.set(0,0,0);player.yaw=0;player.pitch=0;
const shoot=()=>{player.fireCd=0;reloadT=0;switchT=0;cur=0;tryFire(true);};
const use=id=>{loadout.primary=id;applyLoadout();clear();heat.v=0;heat.over=0;heat.charge=0;cur=0;step(2);};
// 等离子：普通 + 过充，范围伤害
use('plasma');let es=[spawnEnemy('imp',0,-6),spawnEnemy('imp',1,-6.5)];es.forEach(e=>{e.hp=e.maxHp=999;});shoot();step(30);
log('plasma splash: hit',es.filter(e=>e.hp<999).length,'enemies, dmg',es.map(e=>Math.round(999-e.hp)).join(','),'| heat',Math.round(heat.v));
es.forEach(e=>{e.hp=999});heat.v=0;heat.charge=1;shoot();step(30);log('plasma overcharged dmg',es.map(e=>Math.round(999-e.hp)).join(','));
heat.v=90;heat.charge=1;const hp0=player.hp;shoot();step(2);log('plasma overheat self-burn',Math.round(hp0-player.hp),'| over',heat.over>0);
// 重型爆弹机枪：转速
use('hbolter');es=[spawnEnemy('brute',0,-8)];es[0].hp=es[0].maxHp=99999;es[0].cd=99;mouseDown=true;let shots0=ammo[0].mag;step(31);const early=shots0-ammo[0].mag;shots0=ammo[0].mag;step(62);const late=shots0-ammo[0].mag;mouseDown=false;
log('heavy bolter shots in 1st 0.5s',early,'| next 1s',late,'| spin',player.spin.toFixed(2));
// 火焰：锥形多目标、点燃
use('flamer');es=[spawnEnemy('imp',-1,-4),spawnEnemy('imp',1,-4),spawnEnemy('imp',0,-12)];es.forEach(e=>{e.hp=e.maxHp=500;e.cd=99;});mouseDown=true;step(30);mouseDown=false;
const fp=firePatches.length;const onFire=spawnEnemy('imp',firePatches[0]?firePatches[0].x:0,firePatches[0]?firePatches[0].z:-4);onFire.hp=onFire.maxHp=500;onFire.cd=99;onFire.speed=0;step(40);
log('flamer ground fire patches',fp,'| enemy standing in fire hurt',onFire.hp<500);
log('flamer: burned in cone',es.slice(0,2).filter(e=>e.hp<500).length,'/2 | out of range untouched',es[2].hp===500,'| burning',es[0].burn>0);
// 穿甲狙击：穿透 3 个 + 开镜
use('needle');es=[0,1,2,3].map(i=>{const e=spawnEnemy('brute',0,-4-i*2);e.hp=e.maxHp=9999;e.cd=99;return e;});step(1);player.pitch=Math.atan2(1.2*1.7-1.6,4);
player.aiming=true;step(20);const fov=camera.fov;player.aiming=false;shoot();step(2);
log('needle pierce: hit',es.filter(e=>e.hp<9999).length,'(max 3) | scope fov',Math.round(fov));
log('DONE');})();
