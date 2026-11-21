;(async()=>{let now=1e7;const step=n=>{for(let i=0;i<n;i++){now+=16;frame(now);}};const log=console.log;globalThis.setTimeout=(f)=>{f();return 0;};
const clear=()=>{enemies.forEach(e=>{e.alive=false;scene.remove(e.g)});enemies=[];spits.forEach(s=>scene.remove(s.m));spits=[];hazards=[];};
const setup=b=>{loadout.biome=b;prepareMatch(4);state='playing';clear();wallMeshes.length=0;colliders.length=0;player.hp=player.maxHp=9999;player.pos.set(0,0,0);player.yaw=0;};
setup('hive');let t=spawnEnemy('tanker',0,-8);t.cd=99;step(2);let h0=t.hp;damageEnemy(t,10,'body',new THREE.Vector3(0,0,-1));const front=h0-t.hp;t.g.rotation.y=Math.PI;h0=t.hp;damageEnemy(t,10,'body',new THREE.Vector3(0,0,-1));const back=h0-t.hp;
log('tanker front',Math.round(front),'back',Math.round(back));t.g.rotation.y=0;t.g.position.set(0,0,-3);t.flameCd=0;let hp0=player.hp;step(80);log('tanker flame dmg',Math.round(hp0-player.hp));
damageEnemy(t,9999,'body',new THREE.Vector3(0,0,-1));step(2);log('tanker burst hazards',hazards.length);player.pos.set(hazards[0].x,0,hazards[0].z);hp0=player.hp;step(60);log('hazard burns player',hp0>player.hp);
setup('sanctum');const p=spawnEnemy('priest',0,-12),imp=spawnEnemy('imp',1,-11);imp.cd=99;imp.reach=0;imp.speed=0;imp.hp=10;p.blessCd=0;step(3);log('priest heals+blesses',imp.hp>10,imp.blessT>0);
setup('frost');const f=spawnEnemy('frostling',0,-1.5);f.cd=0;step(60);log('frostling slows',player.slowT>0);
for(const b of ['hive','sanctum','frost']){setup(b);player.pos.set(0,0,0);const L=spawnEnemy('lord',0,-12);L.hp=L.maxHp*0.5;L.los=true;L.losT=99;L.vcd=0;L.tpCd=0;L.iceCd=0;const p0=L.g.position.clone();hp0=player.hp;step(150);
  log('boss',b,'variant',L.variant,'| teleported',L.g.position.distanceTo(p0)>5,'| hazards',hazards.length,'| player hurt',hp0>player.hp);}
log('DONE');})();
