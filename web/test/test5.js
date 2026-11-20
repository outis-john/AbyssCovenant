;(async()=>{let now=0;const step=n=>{for(let i=0;i<n;i++){now+=16;frame(now);}};const log=console.log;
prepareMatch();state='playing';enemies.forEach(e=>{e.alive=false;scene.remove(e.g);});enemies=[];player.pos.set(0,0,0);player.yaw=0;player.pitch=0;castRay=()=>null;
loadout.melee='power';applyLoadout();cur=2;step(2);const e=spawnEnemy('brute',0,-2.3);e.hp=e.maxHp=9999;
MS.combo=0;player.meleeCd=0;let h0=e.hp;melee();step(30);const normal=h0-e.hp;
activateField();log('field on',player.field>0,'cd',player.fieldCd,'aura opacity >0 after a frame:');step(1);log(' ',powAura.material.opacity>0);
MS.combo=0;MS.phase='none';player.meleeCd=0;h0=e.hp;melee();step(30);log('power left slash dmg normal',Math.round(normal),'with field',Math.round(h0-e.hp),'litany shown #',litIdx);
activateField();log('second activation blocked by cooldown',player.fieldCd>0&&player.field<8);
step(520);log('field expired',player.field<=0,'aura off',powAura.material.opacity===0);log('DONE');})();
