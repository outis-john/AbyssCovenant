;(async()=>{globalThis.setTimeout=(f)=>{f();return 0;};let now=0;const step=n=>{for(let i=0;i<n;i++){now+=16;frame(now);}};const log=console.log;
prepareMatch(9);state='playing';const lords=enemies.filter(e=>e.type==='lord');log('boss spawned in far room',lords.length===1,lords[0]&&cellOf(lords[0].g.position).join(','));
enemies.forEach(e=>{e.alive=false;scene.remove(e.g);});enemies=[];wallMeshes.length=0;colliders.length=0;
player.pos.set(0,0,0);player.yaw=0;player.pitch=0;player.hp=player.maxHp=2000;
// 1 砸地
let b=spawnEnemy('lord',0,-3.5);b.cd=0;let hp0=player.hp;for(let i=0;i<90;i++)step(1);log('slam hits player: dmg',Math.round(hp0-player.hp),'| resists knockback/stagger',b.stagger<0.2);
// 2 二阶段：扇形火球
player.pos.set(0,0,12);b.act=null;b.hp=b.maxHp*0.6;b.vcd=0;b.los=true;b.losT=99;let maxS=0;for(let i=0;i<60;i++){step(1);maxS=Math.max(maxS,spits.length);}
log('phase',b.phase,'| volley spits',maxS);
// 3 三阶段：召唤
b.hp=b.maxHp*0.2;const n0=enemies.filter(e=>e.alive).length;for(let i=0;i<200;i++)step(1);log('phase',b.phase,'| summoned imps',enemies.filter(e=>e.alive).length-n0>0,'| speed',b.speed.toFixed(2));
// 4 免疫：锁喉、处决
player.pos.set(0,0,0);b.g.position.set(0,0,-4);player.exCharge=100;log('cannot execute boss',!canExecute(b));PSY.lift.cd=0;player.mana=999;castLift(true);log('cannot lift boss',!b.lifted);
// 5 击杀掉落
const p0=interactables.length;damageEnemy(b,99999,'body',new THREE.Vector3(0,0,-1));step(3);
log('boss killed',!b.alive,'| drops',interactables.length-p0,'(rare + 4 relic)',interactables.slice(p0).map(i=>i.type).join(','));
log('DONE');})();
