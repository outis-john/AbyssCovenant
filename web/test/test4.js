;(async()=>{globalThis.setTimeout=(f)=>{f();return 0;};let now=0;const step=n=>{for(let i=0;i<n;i++){now+=16;frame(now);}};const log=console.log;
prepareMatch();state='playing';enemies.forEach(e=>{e.alive=false;scene.remove(e.g);});enemies=[];
// 去掉墙，只留敌人，方便射线测试
wallMeshes.length=0;colliders.length=0;
player.pos.set(0,0,0);player.yaw=0;player.pitch=0;
const front=(t='imp',d=4)=>{const f=fwdFlat();return spawnEnemy(t,f.x*d,f.z*d);};
const clear=()=>{enemies.forEach(e=>{e.alive=false;scene.remove(e.g)});enemies=[];};
const aimAt=(e,y=1.2)=>{const to=e.g.position.clone().setY(y*e.g.scale.y).sub(new THREE.Vector3(player.pos.x,1.6,player.pos.z));player.pitch=Math.atan2(to.y,Math.hypot(to.x,to.z));step(1);};
const shoot=(slot)=>{player.fireCd=0;reloadT=0;switchT=0;cur=slot;tryFire(true);};
const cutCount=g0=>gibs.slice(g0).filter(x=>x.m.children&&x.m.children.some(c=>c.material===matCut||c.material&&c.material.color&&c.material!==matCut&&x.m.children.length)).length;
// 爆弹枪
loadout.primary='bolter';applyLoadout();
let e=front('brute',5);e.hp=e.maxHp=999;aimAt(e,1.2);let hp0=e.hp;shoot(0);step(30);
log('bolter body hit (alive brute): dmg',Math.round(hp0-e.hp),'bolts left',bolts.length);
const ar0=e.arms;for(let i=0;i<4;i++){e.kv.set(0,0,0);e.g.position.set(0.3,0,-4);e.stagger=1;const f=fwdFlat();const arm=new THREE.Vector3();e.parts.armR.getWorldPosition(arm);const to=arm.sub(new THREE.Vector3(0,1.6,0));player.yaw=Math.atan2(-to.x,-to.z);player.pitch=Math.atan2(to.y,Math.hypot(to.x,to.z));shoot(0);step(25);}
log('bolter arm hits: arms',ar0,'->',e.arms);clear();
player.yaw=0;e=front('imp',5);e.hp=10;aimAt(e,1.2);let g0=gibs.length;shoot(0);step(30);log('bolter lethal: killed',!e.alive,'pieces +',gibs.length-g0);clear();
// 霰弹枪
loadout.primary='shotgun';applyLoadout();player.yaw=0;
for(let i=0;i<4;i++){e=front('imp',3);aimAt(e,1.2);g0=gibs.length;const b0=bleeders.length;shoot(0);step(5);
  log('shotgun close kill',i+1,': killed',!e.alive,'pieces +',gibs.length-g0,'bleeders +',bleeders.length-b0);clear();}
e=front('brute',3);e.hp=e.maxHp=9999;aimAt(e,1.3);hp0=e.hp;shoot(0);step(5);log('shotgun on brute: dmg',Math.round(hp0-e.hp));clear();
// 热熔枪
loadout.primary='melta';applyLoadout();player.yaw=0;heat.v=0;heat.over=0;
e=front('imp',5);aimAt(e,1.2);g0=gibs.length;heat.charge=0.5;shoot(0);step(5);
const glow=gibs.slice(g0).filter(x=>x.m.children.length>0).length;
log('melta half charge kill: killed',!e.alive,'pieces +',gibs.length-g0,'glowing caps',glow,'coolMats',coolMats.length);clear();
e=front('imp',5);e.hp=e.maxHp=9999;e.g.position.x=0.6;step(1);{const arm=new THREE.Vector3();e.parts.armR.getWorldPosition(arm);const to=arm.sub(new THREE.Vector3(0,1.6,0));player.yaw=Math.atan2(-to.x,-to.z);player.pitch=Math.atan2(to.y,Math.hypot(to.x,to.z));}
heat.v=0;heat.over=0;heat.charge=0;const a0=e.arms;shoot(0);step(5);log('melta arm hit (alive): arms',a0,'->',e.arms);clear();
log('DONE');})();
