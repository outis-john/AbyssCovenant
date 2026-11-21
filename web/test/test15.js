;(async()=>{let now=0;const step=n=>{for(let i=0;i<n;i++){now+=16;frame(now);}};const log=console.log;globalThis.setTimeout=(f)=>{f();return 0;};
const clear=()=>{enemies.forEach(e=>{e.alive=false;scene.remove(e.g)});enemies=[];};
const run=(c,slot,mode)=>{clear();player.pos.set(0,0,0);player.yaw=0;player.pitch=0;const e=spawnEnemy('imp',0,-2.5);e.cd=99;const n=spawnEnemy('imp',1.6,-3.5);n.cd=99;n.hp=n.maxHp=999;
  player.exCharge=100;switchWeapon(slot);step(25);let err=null;try{execute(mode);step(110);}catch(x){err=x.message;}return {killed:!e.alive,stunned:n.stun>0,err,camOk:true};};
const res=[];
for(const [c,g,m] of [['ward','plasma','axe'],['bastion','hbolter','hammer'],['bastion','flamer','fist'],['ward','needle','saw']]){cls=c;loadout.primary=g;loadout.melee=m;prepareMatch(2);state='playing';wallMeshes.length=0;colliders.length=0;player.hp=player.maxHp=9999;
  const a=run(c,0,'full'),b=run(c,2,'full');res.push(`${g}:${a.killed?'ok':'FAIL'}${a.err?'('+a.err+')':''} ${m}:${b.killed?'ok':'FAIL'}${b.err?'('+b.err+')':''}`);}
log('full executions',res.join(' | '));
let r=run('ward',2,'quick');log('quick execution killed',r.killed,'| quick does not terrify',!r.stunned);
r=run('ward',2,'full');log('full execution terrifies neighbour',r.stunned);
// 连环：处决后 3 秒内不耗充能
clear();const a=spawnEnemy('imp',0,-2.5),b=spawnEnemy('imp',.5,-3);a.cd=b.cd=99;player.exCharge=100;execute('quick');step(90);player.exCharge=0;player.yaw=0;b.g.position.set(player.pos.x,0,player.pos.z-2.5);execute('quick');step(40);
log('chain execution without charge',!b.alive,'| chains left',exChain.left);
cls='walker';loadout.primary='hbolter';prepareMatch(2);state='playing';wallMeshes.length=0;colliders.length=0;r=run('walker',2,'full');const r2=run('walker',0,'full');log('walker executions: fist',r.killed,r.err||'','| cannon',r2.killed,r2.err||'');
log('DONE');})();
