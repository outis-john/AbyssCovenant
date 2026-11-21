;(async()=>{let now=0;const step=n=>{for(let i=0;i<n;i++){now+=16;frame(now);}};const log=console.log;globalThis.setTimeout=(f)=>{f();return 0;};
prepareMatch(3);state='playing';enemies.forEach(e=>{e.alive=false;scene.remove(e.g)});enemies=[];wallMeshes.length=0;colliders.length=0;player.hp=player.maxHp=9999;player.pos.set(0,0,0);
// 一排长椅挡在中间
colliders.push({minX:-3,maxX:3,minZ:-4.4,maxZ:-3.6});colliders.push({minX:-3,maxX:-2.6,minZ:-7,maxZ:-3.6});
const e=spawnEnemy('imp',0.2,-8);e.cd=99;e.reach=0.5;let t=0;for(;t<400;t++){step(1);if(e.g.position.distanceTo(player.pos)<2)break;}
log('enemy reached player around obstacle',t<400,'in',(t*0.016).toFixed(1),'s');
log('DONE');})();
