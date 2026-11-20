;(async()=>{
const log=(...a)=>console.log(...a);
let now=0;const step=(n=1)=>{for(let i=0;i<n;i++){now+=16;frame(now);}};
try{prepareMatch();}catch(e){log('PREPARE FAIL',e.stack);return;}
state='playing';enemies.forEach(e=>{e.alive=false;scene.remove(e.g);});enemies=[];
function front(type='imp',dist=2.2,elite=false){const f=fwdFlat();return spawnEnemy(type,player.pos.x+f.x*dist,player.pos.z+f.z*dist,elite);}
player.pos.set(0,0,0);player.yaw=0;player.pitch=0;
const report=(tag,e,g0,b0)=>log(tag.padEnd(26),'hp',Math.round(e.hp),'/',e.maxHp,'alive',e.alive,'arms',e.arms,'gibs +',gibs.length-g0,'bleeders',bleeders.length);
for(const m of ['saw','power','ssword']){
  loadout.melee=m;applyLoadout();cur=2;swordOut=1;MS.phase='none';player.meleeCd=0;
  // 1) 非致命（精英巨魔，血厚）
  let e=front('brute',2.4,false);let g0=gibs.length;
  try{melee();step(60);}catch(err){log('MELEE ERR',m,err.stack.split('\n').slice(0,3).join(' | '));}
  report(m+' vs brute',e,g0);
  // 2) 致命（小恶魔）
  enemies.forEach(x=>{x.alive=false;scene.remove(x.g)});enemies=[];player.meleeCd=0;MS.phase='none';
  e=front('imp',2.2);e.hp=10;g0=gibs.length;
  try{melee();step(60);}catch(err){log('MELEE ERR',m,err.stack.split('\n').slice(0,3).join(' | '));}
  const cutPieces=gibs.slice(g0).filter(x=>x.m.children.some(c=>c.material===matCut)).length;
  report(m+' lethal on imp',e,g0);log('   pieces with red cut face:',cutPieces);
  enemies.forEach(x=>{x.alive=false;scene.remove(x.g)});enemies=[];
}
// 处决：每种武器
const types=[['bolter',0],['shotgun',0],['melta',0],['pistol',1],['saw',2],['power',2],['ssword',2]];
for(const [id,slot] of types){
  if(slot===0)loadout.primary=id;if(slot===2)loadout.melee=id;applyLoadout();cur=slot;switchT=0;
  const e=front('imp',2.0);player.exCharge=100;const g0=gibs.length;
  try{execute();if(!ex.active)log('exec did not start',id);step(90);}catch(err){log('EXEC ERR',id,err.stack.split('\n').slice(0,3).join(' | '));}
  log(('exec '+id).padEnd(26),'alive',e.alive,'ex.active',ex.active,'gibs +',gibs.length-g0,'puddles',puddles.length,'hp',Math.round(player.hp));
  enemies.forEach(x=>{x.alive=false;scene.remove(x.g)});enemies=[];
}
// 灵能
cur=0;player.mana=100;player.ovl=0;
let es=[front('imp',5),front('imp',7)];
try{castLift();step(160);}catch(err){log('LIFT ERR',err.stack.split('\n').slice(0,3).join(' | '));}
log('lift: alive after slam',es.map(e=>e.alive+':'+Math.round(e.hp)).join(','),'lifts left',lifts.length);
enemies.forEach(x=>{x.alive=false;scene.remove(x.g)});enemies=[];player.mana=100;player.ovl=0;
es=[front('imp',6),front('brute',7)];
try{castRay=()=>null;castHole();step(220);}catch(err){log('HOLE ERR',err.stack.split('\n').slice(0,3).join(' | '));}
log('hole: ',es.map(e=>e.alive+':'+Math.round(e.hp)).join(','),'holes left',holes.length);
try{player.mana=100;castBT();const hp0=player.hp=50;const e=front('imp',2);loadout.primary='bolter';cur=2;step(5);log('bt active',bt.t>0);}catch(err){log('BT ERR',err.stack);}
// 防反
loadout.melee='ssword';applyLoadout();cur=2;MS.phase='none';const a=front('imp',1.5);player.blocking=true;player.blockStart=gameTime;
try{hurtPlayer(10,false,a);step(40);log('parry: attacker stun',a.stun>0||!a.alive,'counter phase ran, attacker hp',Math.round(a.hp),'alive',a.alive);}catch(err){log('PARRY ERR',err.stack);}
// 热熔
loadout.primary='melta';applyLoadout();cur=0;player.fireCd=0;
try{player.charging=true;step(70);player.charging=false;log('melta charge',heat.charge.toFixed(2));fire(WEAPONS[0]);log('melta heat after shot',Math.round(heat.v));for(let i=0;i<5;i++){player.fireCd=0;heat.charge=1;if(heat.over<=0)fire(WEAPONS[0]);}log('overheated',heat.over>0);}catch(err){log('MELTA ERR',err.stack);}
log('DONE');
})();
