;(async()=>{let now=0;const step=n=>{for(let i=0;i<n;i++){now+=16;frame(now);}};const log=console.log;globalThis.setTimeout=(f)=>{f();return 0;};
prepareMatch(3);state='playing';enemies.forEach(e=>{e.alive=false;scene.remove(e.g)});enemies=[];wallMeshes.length=0;colliders.length=0;player.hp=player.maxHp=99999;player.pos.set(0,0,0);
// 骨盾挡在术士前面
const c=spawnEnemy('caster',0,-12);c.cast=99;const w=spawnEnemy('bulwark',4,-8);w.cd=99;step(150);
const between=w.g.position.distanceTo(c.g.position)<4&&w.g.position.distanceTo(player.pos)<c.g.position.distanceTo(player.pos);log('bulwark guards caster',between,!!w.guarding);
enemies.forEach(e=>{e.alive=false;scene.remove(e.g)});enemies=[];
// 小恶魔围成一圈
const imps=[0,1,2,3,4,5].map(i=>{const e=spawnEnemy('imp',(i-2.5)*.3,-10);e.cd=99;return e;});step(200);
const angs=imps.map(e=>Math.atan2(e.g.position.z,e.g.position.x));let spread=0;for(let i=0;i<angs.length;i++)for(let j=i+1;j<angs.length;j++){let d=Math.abs(angs[i]-angs[j]);d=Math.min(d,6.283-d);spread=Math.max(spread,d);}
log('imps surround: max angle spread',spread.toFixed(2),'(>2 = 围住)');
log('DONE');})();
