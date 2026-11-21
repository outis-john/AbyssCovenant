;(async()=>{let now=1e7;const step=n=>{for(let i=0;i<n;i++){now+=16;frame(now);}};const log=console.log;globalThis.setTimeout=(f)=>0;
cls='ward';startCampaignLevel('4-1');endScene(true);step(3);for(const e of enemies){e.alive=false;scene.remove(e.g);}enemies=[];CAMP.S={update:()=>false};CAMP.timers=[];CAMP.step=1;player.hp=player.maxHp=99999;
const clear=()=>{for(const e of enemies){e.alive=false;scene.remove(e.g);}enemies=[];};
log('barrels scattered',BAR.list.length>0);
// 油桶：射线打中就炸，炸死旁边的敌人
const B=addBarrel(player.pos.x,player.pos.z-12);const e1=spawnEnemy('soh',player.pos.x+1.5,player.pos.z-12);e1.speed=0;blowBarrel(B);step(30);log('barrel blown → exploded',B.dead,'| enemy killed',!e1.alive);clear();
// 新敌人各自的行为
const sn=spawnEnemy('snp',player.pos.x,player.pos.z-38);let laser=false;for(let i=0;i<200;i++){step(1);if(sn.las&&sn.las.visible)laser=true;}log('sniper paints laser',laser);clear();
const hw=spawnEnemy('hwt',player.pos.x,player.pos.z-20);hw.hp=hw.maxHp=1e6;const nb=ebolts.length;let shots=0;for(let i=0;i<200;i++){step(1);if(hw.burstN>0)shots++;}log('heavy weapon team bursts',shots>0,'static',!!hw.static);clear();
const rp=spawnEnemy('raptor',player.pos.x,player.pos.z-18);let jumped=false;for(let i=0;i<200;i++){step(1);if(rp.rj)jumped=true;}log('raptor jump-pack leap',jumped);clear();
const tm=spawnEnemy('term',player.pos.x,player.pos.z-10);const h0=tm.hp;WEAPONS[0]&&(cur=0);damageEnemy(tm,100,'body',new THREE.Vector3(0,0,-1),{});log('terminator armour soaks bolts',h0-tm.hp<100);clear();
const kk=spawnEnemy('kako',player.pos.x,player.pos.z-10);kk.sonCd=0;let son=false;for(let i=0;i<120;i++){step(1);if(kk.sonic>0)son=true;}log('kakophoni sonic blast',son);clear();
// 队友倒地 → 按 F 救起
const g=allies.find(a=>a.alive&&a.def.generic&&!a.vehicle);g.wasDowned=false;let downed=false;for(let k=0;k<10&&!downed;k++){g.alive=true;g.down=false;g.wasDowned=false;allyDie(g);downed=g.down;}
log('generic ally goes down instead of dying',downed,'| revive point',!!g.revInter);player.pos.copy(g.pos);keys.KeyF=true;step(160);keys.KeyF=false;log('player revives ally',g.alive&&!g.down);
// 药剂师治疗
const ap=allies.find(a=>a.sub==='apoth');if(ap){player.hp=player.maxHp*.4;ap.pos.copy(player.pos).add(V3(2,0,0));ap.healCd=0;step(10);log('apothecary heals player',player.hp>player.maxHp*.4);}else log('apothecary heals player','no apoth');
// 随机战场事件
EV.t=0;step(5);log('battlefield event started',!!EV.cur,EV.cur&&EV.cur.name);
// 搭乘坦克
clear();const G=startRide('Test Raider',player.pos.clone(),player.pos.clone().add(V3(0,0,-20)),Math.PI);const p0=G.ride.pos.clone();step(240);log('ride: tank moves with player on top',G.ride.pos.distanceTo(p0)>5,player.pos.y>2);
log('DONE');})();
