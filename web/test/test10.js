;(async()=>{let now=0;const step=n=>{for(let i=0;i<n;i++){now+=16;frame(now);}};const log=console.log;
prepareMatch();state='playing';const clear=()=>{enemies.forEach(e=>{e.alive=false;scene.remove(e.g)});enemies=[];};clear();
wallMeshes.length=0;colliders.length=0;player.hp=player.maxHp=9999;
const ring=(n,r,t='imp')=>{const a=[];for(let i=0;i<n;i++){const ang=i/n*6.28;const e=spawnEnemy(t,Math.sin(ang)*r,-Math.cos(ang)*r);e.cd=99;a.push(e);}return a;};
for(const id of ['saw','power','ssword','hammer','fist','axe']){
  loadout.melee=id;applyLoadout();player.pos.set(0,0,0);player.yaw=0;player.pitch=0;switchWeapon(0);step(2);switchWeapon(2);step(25);player.meleeCd=0;MS.phase='none';
  // 轻攻击：点一下
  clear();let es=ring(1,2.2).map(e=>{e.hp=e.maxHp=9999;return e;});meleePress();step(1);meleeRelease();step(30);const light=Math.round(9999-es[0].hp);
  // 重击：按住
  clear();player.meleeCd=0;MS.phase='none';es=id==='spin'||id==='saw'?ring(4,2.6):ring(1,2.2);if(id==='hammer')es=ring(3,2.5).concat([spawnEnemy('imp',0,-4)]);
  if(id==='power')es=[spawnEnemy('imp',0,-2.5),spawnEnemy('imp',0.3,-5.5)];
  meleePress();step(Math.ceil(CFG.heavyHold/0.016)+4);const charged=hold.charged;meleeRelease();step(40);
  log(id.padEnd(7),'light dmg',light,'| heavy charged',charged,'| killed',es.filter(e=>!e.alive).length,'/',es.length,'| stunned',es.filter(e=>e.alive&&e.stun>0).length);}
log('DONE');})();
