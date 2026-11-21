;(async()=>{let now=1e7;const step=n=>{for(let i=0;i<n;i++){now+=16;frame(now);}};const log=console.log;globalThis.setTimeout=(f)=>0;
cls='ward';startCampaignLevel('3-1');endScene(true);step(3);for(const e of enemies){e.alive=false;scene.remove(e.g);}enemies=[];CAMP.S={update:()=>false};CAMP.timers=[];player.hp=player.maxHp=99999;
const minPair=L=>{let m=1e9;for(let i=0;i<L.length;i++)for(let j=i+1;j<L.length;j++)m=Math.min(m,L[i].distanceTo(L[j]));return m;};
// 1 队友交战时散开到射击位
const live=allies.filter(a=>a.alive&&!a.vehicle&&!a.big);log('allies',live.length,'spacing before',minPair(live.map(a=>a.pos)).toFixed(2));
const sq=openSpawn('soh',5,V3(player.pos.x,0,player.pos.z-30),2,6,{minP:10});for(const e of sq){e.cd=999;e.dmg=0;e.hp=e.maxHp=1e6;}
for(let i=0;i<500;i++)step(1);log('enemy squad id shared',new Set(sq.map(e=>e.squad)).size===1,'| allies with tactical pos',live.filter(a=>a.tc&&a.tc.p).length,'| spacing in combat',minPair(live.filter(a=>a.alive).map(a=>a.pos)).toFixed(2));
// 2 玩家蹲着不动 → 敌人扔手雷
const sq2=openSpawn('soh',4,V3(player.pos.x,0,player.pos.z-16),2,5,{minP:10});for(const e of sq2){e.hp=e.maxHp=1e6;e.dmg=0;}let thrown=0;const n0=WAR.nadeT;for(let i=0;i<2000&&!thrown;i++){step(1);if(WAR.nadeT!==n0)thrown=1;}log('enemy grenade when player camps',!!thrown);
for(const e of enemies){e.alive=false;scene.remove(e.g);}enemies=[];
// 3 民兵士气崩溃
const mil=openSpawn('militia',6,V3(player.pos.x,0,player.pos.z-25),2,5,{minP:10});for(let i=0;i<4;i++)killEnemy(mil[i],null,false);step(30);log('militia flee after losses',mil.slice(4).some(e=>e.flee>0||e.sqBroken));
for(const e of enemies){e.alive=false;scene.remove(e.g);}enemies=[];
// 4 队友对扎堆的敌人扔手雷
const cl=[0,1,2,3].map(i=>{const e=spawnEnemy('soh',player.pos.x+i*.8,player.pos.z-18);e.cd=999;e.dmg=0;e.speed=0;return e;});WAR.allyNadeT=0;let an=0;for(let i=0;i<300&&!an;i++){step(1);if(WAR.nades.some(N=>N.team==='loyal')||cl.some(e=>!e.alive))an=1;}
log('ally grenade on cluster',!!an);
// 5 压制
const S0=WAR.sup;fireBolt(player.pos.clone().add(V3(1.5,1.6,-20)),player.pos.clone().add(V3(1.5,1.6,5)),EWEAP.bolter,'chaos',0,null);for(let i=0;i<30;i++)step(1);log('near-miss suppression',WAR.sup>S0||WAR.sup>0);
// 6 氛围对象在跑
log('ambience tracers',WAR.tr.length>0,'smoke',WAR.smoke.length);
log('DONE');})();
