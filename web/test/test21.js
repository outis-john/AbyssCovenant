;(async()=>{let now=1e7;const step=n=>{for(let i=0;i<n;i++){now+=16;frame(now);}};const log=console.log;globalThis.setTimeout=(f)=>{f();return 0;};
const res=[];
for(const [c,g] of [['bastion','flamer'],['redeemer','flamer'],['ward','plasma']])for(const t of ['imp','bulwark','tanker'])for(const mode of ['quick','full']){
  cls=c;loadout.primary=g;loadout.melee='fist';prepareMatch(2);state='playing';enemies.forEach(e=>{e.alive=false;scene.remove(e.g)});enemies=[];wallMeshes.length=0;colliders.length=0;player.hp=player.maxHp=9999;
  player.pos.set(0,0,0);player.yaw=0;cur=0;step(20);const e=spawnEnemy(t,0,-2.6);e.cd=99;e.blessT=5;e.g.rotation.y=0;step(1);player.exCharge=100;execute(mode);step(120);if(e.alive)res.push(`${c}/${g}/${t}/${mode}`);}
log('execution always kills (blessed + shielded):',res.length?'FAIL '+res.join(', '):'all ok');
log('DONE');})();
