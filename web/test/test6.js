;(async()=>{globalThis.setTimeout=(f)=>{f();return 0;};let now=0;const step=n=>{for(let i=0;i<n;i++){now+=16;frame(now);}};const log=console.log;
prepareMatch();state='playing';enemies.forEach(e=>{e.alive=false;scene.remove(e.g);});enemies=[];
wallMeshes.length=0;colliders.length=0;
player.pos.set(0,0,0);player.yaw=0;player.pitch=0;player.hp=player.maxHp=1000;
const clear=()=>{enemies.forEach(e=>{e.alive=false;scene.remove(e.g)});enemies=[];spits.forEach(s=>scene.remove(s.m));spits=[];};
// 1. 远处施法，火球飞来命中
let e=spawnEnemy('caster',0,-14);e.cast=0;let hp0=player.hp,fired=0;
for(let i=0;i<200;i++){step(1);if(spits.length)fired=Math.max(fired,spits.length);if(player.hp<hp0)break;}
log('caster fires spit',fired>0,'| player hit dmg',Math.round(hp0-player.hp),'| caster stayed back',e.g.position.distanceTo(player.pos).toFixed(1)>3);
// 2. 太近会后撤
clear();e=spawnEnemy('caster',0,-5);e.cast=99;const d0=e.g.position.distanceTo(player.pos);step(60);
log('caster retreats',d0.toFixed(1),'->',e.g.position.distanceTo(player.pos).toFixed(1));
// 3. 躲开火球（横移）
clear();e=spawnEnemy('caster',0,-18);e.cast=0;hp0=player.hp;for(let i=0;i<60&&!spits.length;i++)step(1);
player.pos.x=3;for(let i=0;i<120;i++)step(1);log('dodged spit: no damage',player.hp===hp0,'spits left',spits.length);player.pos.x=0;
// 4. 墙挡住火球
clear();colliders.push({minX:-3,maxX:3,minZ:-8.5,maxZ:-7.5});e=spawnEnemy('caster',0,-14);e.los=true;e.losT=99;e.cast=0;hp0=player.hp;for(let i=0;i<150;i++)step(1);
log('wall blocks spit: no damage',player.hp===hp0);colliders.length=0;
// 5. 砍掉右臂 -> 不能施法，改近战追击
clear();e=spawnEnemy('caster',0,-12);detach(e,'armR',null);e.arms--;e.cast=0;const dd=e.g.position.distanceTo(player.pos);for(let i=0;i<60;i++)step(1);
log('armless caster: can cast',canCast(e),'spits',spits.length,'closes in',dd.toFixed(1),'->',e.g.position.distanceTo(player.pos).toFixed(1));
// 6. 完美格挡反弹眩晕
clear();e=spawnEnemy('caster',0,-10);e.cast=0;for(let i=0;i<80&&!spits.length;i++)step(1);
const sp=spits[0];sp.m.position.set(0,1.2,-0.4);player.blocking=true;player.blockStart=gameTime;hp0=player.hp;const ch0=e.hp;step(2);const refl=sp.reflected;player.blocking=false;for(let i=0;i<80;i++)step(1);
log('perfect block vs spit: dmg',Math.round(hp0-player.hp),'reflected',refl,'caster hurt by own spit',Math.round(ch0-e.hp)||(!e.alive?'killed':0));
// 7. 击杀
clear();e=spawnEnemy('caster',0,-4);const k=damageEnemy(e,999,'body',new THREE.Vector3(0,0,-1));step(5);log('caster killable',k,!e.alive);
log('DONE');})();
