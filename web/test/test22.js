;(async()=>{let now=1e7;const step=n=>{for(let i=0;i<n;i++){now+=16;frame(now);}};const log=console.log;globalThis.setTimeout=(f)=>{f();return 0;};
const setup=()=>{cls='ward';prepareMatch(3);state='playing';enemies.forEach(e=>{e.alive=false;scene.remove(e.g)});enemies=[];wallMeshes.length=0;colliders.length=0;player.hp=player.maxHp=9999;player.pos.set(0,0,0);player.yaw=0;};
setup();player.taint=100;step(2);const g=HELL.god;log('random god',g,'| falling',HELL.on);for(let i=0;i<500&&HELL.on;i++)step(1);log('after fall: alive',player.hp>0,'| godSkill',player.godSkill===g,'| corrupt',player.corrupt);
const res={};
for(const god of ['decay','excess','blood','change']){setup();player.godSkill=god;player.godCd=0;
  if(god==='decay'){const e=spawnEnemy('imp',0,-6.4);e.hp=e.maxHp=500;e.cd=99;e.speed=0;castGodSkill();step(120);res.decay=`cloud dmg ${Math.round(500-e.hp)} slowed ${e.slowT>0}`;}
  if(god==='excess'){const e=spawnEnemy('imp',0,-9);e.cd=0;castGodSkill();const hp0=player.hp;step(240);res.excess=`decoys ${decoys.length}/3 left, player untouched ${player.hp===hp0}, demon stunned ${e.stun>0||!e.alive}`;}
  if(god==='blood'){const es=[0,1,2,3].map(i=>{const e=spawnEnemy('imp',(i-1.5)*2,-5-i);e.cd=99;return e;});castGodSkill();step(60);res.blood=`killed ${es.filter(e=>!e.alive).length}/4, player moved ${player.pos.length().toFixed(1)}m`;}
  if(god==='change'){const a=spawnEnemy('imp',-1,-4),b=spawnEnemy('imp',1,-4);a.hp=b.hp=a.maxHp=b.maxHp=400;castGodSkill();step(200);res.change=`confused ${a.confusedT>0}, they hurt each other ${a.hp<400||b.hp<400}`;}}
for(const k in res)log('god skill',k,'→',res[k]);
// 死亡时关掉持续音效 / 堕落画面
setup();player.taint=100;step(2);beginDeath();log('death stops fall + loops',!HELL.on);
log('DONE');})();
