;(async()=>{let now=0;const step=n=>{for(let i=0;i<n;i++){now+=16;frame(now);}};const log=console.log;
prepareMatch();state='playing';enemies.forEach(e=>{e.alive=false;scene.remove(e.g);});enemies=[];player.pos.set(0,0,0);player.yaw=0;player.pitch=0;castRay=()=>null;
const front=(t='imp',d=2.2)=>{const f=fwdFlat();return spawnEnemy(t,f.x*d,f.z*d);};
const clear=()=>{enemies.forEach(e=>{e.alive=false;scene.remove(e.g)});enemies=[];};
for(const m of ['power','saw']){loadout.melee=m;applyLoadout();cur=2;MS.phase='none';MS.combo=0;player.meleeCd=0;
  const e=front('brute',2.3);e.hp=e.maxHp=99999;const names=[];
  for(let i=0;i<4;i++){const hp0=e.hp,g0=gibs.length;try{melee();if(i>0){melee();}names.push(MS.step.name);step(i===2&&m==='saw'?70:28);}catch(err){log('ERR',m,i,err.stack.split('\n').slice(0,2).join(' | '));}
    log(m.padEnd(6),'step',i+1,(MS.step&&COMBOS[m][i].name||'').padEnd(5),'dmg',Math.round(hp0-e.hp),'arm gibs +',gibs.length-g0);}
  clear();
  // 每一段的致命一击都要切开
  for(let i=0;i<4;i++){MS.phase='none';MS.combo=i;MS.lastEnd=gameTime;player.meleeCd=0;const v=front('imp',2.2);v.hp=5;const g0=gibs.length;
    try{melee();step(i===2&&m==='saw'?70:30);}catch(err){log('ERR lethal',m,i,err.stack.split('\n')[0]);}
    const cut=gibs.slice(g0).filter(x=>x.m.children.some(c=>c.material===matCut)).length;
    log(m.padEnd(6),'lethal step',i+1,COMBOS[m][i].name.padEnd(5),'killed',!v.alive,'cut pieces',cut);clear();}
}
// 切换武器：模型立即同步
loadout.primary='bolter';loadout.melee='saw';applyLoadout();cur=2;swordOut=1;step(5);switchWeapon(0);step(1);
log('switch 3->1: sword visible',sword.visible,'| bolter visible',gun.visible);
switchWeapon(2);step(1);log('switch 1->3: sword visible',sword.visible,'| bolter visible',gun.visible);
// 剑盾：右键切手枪 -> 开枪消耗手枪弹药；E 格挡
loadout.melee='ssword';applyLoadout();cur=2;step(2);player.ssPistol=true;step(2);const m0=ammo[1].mag;player.fireCd=0;switchT=0;
tryFire(true);log('ssword pistol: pistol visible',pistol.visible,'sword visible',sword.visible,'shield visible',shieldG.visible,'pistol ammo',m0,'->',ammo[1].mag);
player.ssPistol=false;step(2);log('ssword sword back: sword visible',sword.visible,'pistol visible',pistol.visible);
// 链锯狂热：攻击冷却更短
loadout.melee='saw';applyLoadout();cur=2;MS.phase='none';player.meleeCd=0;player.frenzy=0;melee();const cdN=player.meleeCd;step(40);
MS.phase='none';player.meleeCd=0;player.frenzy=3;melee();log('saw cooldown normal',cdN.toFixed(2),'frenzy',player.meleeCd.toFixed(2));
player.revving=true;step(60);log('rev charge after 1s',player.revCharge.toFixed(2));
log('DONE');})();
