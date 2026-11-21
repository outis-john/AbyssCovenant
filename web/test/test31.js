;(async()=>{let now=1e7;const step=n=>{for(let i=0;i<n;i++){now+=16;frame(now);}};const log=console.log;globalThis.setTimeout=(f)=>0;
cls='ward';startCampaignLevel('4-T');endScene(true);step(5);
log('hero',hudHeroName('x'),'| speaker',meV(),'| allies',allies.filter(a=>a.alive).length,'| traitor cloth hidden',allies.every(a=>!a.J.cloth||a.J.cloth.visible===false));
// 逃兵会跑向撤离点
for(const e of enemies){e.alive=false;scene.remove(e.g);}const r=spawnEnemy('lrun',40,0);r.campaign=true;r.exit=V3(66,0,0);CAMP.run.spawned++;for(const a of allies)a.alive=false;player.pos.set(-60,0,60);
for(let i=0;i<900&&r.alive;i++)step(1);log('runner escaped',!r.alive,'| escaped count',CAMP.run.escaped);
// 音频尖啸眩晕周围敌人
player.pos.set(0,0,0);const es=[0,1,2].map(i=>{const e=spawnEnemy('lih',i*2,-8);e.campaign=true;return e;});CAMP.fs=1;fireSupport();log('vox scream stuns',es.every(e=>e.stun>2),'| charges left',CAMP.fs);
// 隐身的暗鸦守卫：远处看不见
const g=spawnEnemy('lrg',0,-30);step(3);log('raven guard cloaked at range',g.g.visible===false);damageEnemy(g,1,'body',null,{});log('revealed when hit',g.g.visible===true);
for(const e of enemies){e.alive=false;scene.remove(e.g);}
// 恐惧：近战击杀吓瘫附近敌人
const mi=WEAPONS.findIndex(W=>W.melee);if(mi>=0)cur=mi;const v=spawnEnemy('lih',0,-2),w=spawnEnemy('lih',3,-3);damageEnemy(v,1e6,'body',new THREE.Vector3(0,0,-1),{});log('fear: melee kill stuns nearby',w.stun>0.5);
for(const e of enemies){e.alive=false;scene.remove(e.g);}
// 整关跑完
for(const a of allies)a.alive=true;let guard=0;while(state!=='result'&&guard++<16000){player.hp=player.maxHp=9999;for(const e of enemies)if(e.alive&&e.campaign&&Math.random()<.02)damageEnemy(e,99999,'body',null,{_remote:true});if(CAMP.wp&&state==='playing')player.pos.copy(CAMP.wp);if(state==='scene')endScene(true);step(1);}
log('4-T →',state,'guard',guard,'step',CAMP.step,'boss seen',CAMP.boss&&CAMP.boss.type);
log('DONE');})();
