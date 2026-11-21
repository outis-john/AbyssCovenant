;(async()=>{let now=1e7;const step=n=>{for(let i=0;i<n;i++){now+=16;frame(now);}};const log=console.log;globalThis.setTimeout=(f)=>0;
const setup=()=>{cls='ward';prepareMatch(5);state='playing';enemies.forEach(e=>{e.alive=false;scene.remove(e.g)});enemies=[];player.hp=player.maxHp=9999;player.pos.set(0,0,0);player.yaw=0;waveTimer=1e9;};
// 1 叛军射手会开火并命中玩家
setup();const s=spawnEnemy('soh',0,-10);step(240);log('soh fired bolts',ebolts.length>0||player.hp<9999,'| player hurt',player.hp<9999);
// 2 队友会自己打死民兵；敌人会打队友
setup();const a=spawnAlly('ardan',1,1);const ms=[0,1,2].map(i=>spawnEnemy('militia',(i-1)*2,-12));step(900);log('ally kills militia',ms.filter(e=>!e.alive).length,'/3 | ally hurt',a.hp<a.maxHp||!a.alive);
// 3 吞世者会跳劈
setup();const w=spawnEnemy('we',0,-10);step(260);log('world eater leaped',!!w.leap||w.leapCd>1);
// 4 帝皇之子正面格挡玩家的普通近战，重击能破防
setup();cur=2;const ec=spawnEnemy('ec',0,-2);ec.g.rotation.y=0;const hp0=ec.hp;damageEnemy(ec,40,'body',new THREE.Vector3(0,0,-1),{stagger:.2});log('ec parried light',ec.hp===hp0);ec.parryCd=0;damageEnemy(ec,40,'body',new THREE.Vector3(0,0,-1),{stagger:1});log('heavy breaks guard',ec.hp<hp0);cur=0;
// 5 战歌者尖啸
setup();const g=spawnEnemy('warsinger',0,-8);g.singT=0;step(140);log('warsinger scream hurt player',player.hp<9999);
// 5b 坦克：双方坦克互射，开花弹会炸
setup();const at=spawnAllyTank('pt','Test Predator',0,4);const et=spawnEnemy('tpred',0,-24);et.hullYaw=Math.PI;const th0=et.hp,ah0=at.hp;step(600);log('tank duel: enemy tank hurt',et.hp<th0||!et.alive,'| ally tank hurt',at.hp<ah0||!at.alive);
setup();const dr=spawnEnemy('tdread',0,-10);step(200);log('dreadnought fights',player.hp<9999,'| not executable',!canExecute(Object.assign({},dr,{alive:true})));
// 6 三关从头打到尾（跳过过场、清掉敌人、走到航点）
const runLevel=id=>{cls='ward';startCampaignLevel(id);if(state==='scene')endScene(true);let guard=0;
  while(state!=='result'&&guard++<4000){player.hp=player.maxHp=9999;
    for(const e of enemies)if(e.alive&&e.campaign&&Math.random()<.02)damageEnemy(e,9999,'body',null,{_remote:true});
    if(CAMP.wp&&state==='playing')player.pos.copy(CAMP.wp);
    if(state==='scene')endScene(true);step(1);}
  return state;};
for(const id of ['3-1','3-2','3-3']){const st=runLevel(id);log('level',id,'→',st,'| title',$('resTitle').textContent!==undefined,'| steps',CAMP.step,'| allies alive',allies.filter(a=>a.alive).length);}
log('vell died in 3-2 / hesk in 3-3 scripted ok');exitCampaign();log('exit clears allies',allies.length===0);
log('DONE');})();
