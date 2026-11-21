;(async()=>{let now=1e7;const step=n=>{for(let i=0;i<n;i++){now+=16;frame(now);}};const log=console.log;globalThis.setTimeout=(f)=>{f();return 0;};
const clear=()=>{enemies.forEach(e=>{e.alive=false;scene.remove(e.g)});enemies=[];};
for(const c of Object.keys(CLS)){cls=c;loadout.primary='needle';loadout.melee='saw';prepareMatch(3);state='playing';clear();wallMeshes.length=0;colliders.length=0;
  player.pos.set(0,0,0);player.yaw=0;player.pitch=0;step(2);
  const es=[0,1,2,3].map(i=>{const e=spawnEnemy('imp',(i-1.5)*.8,(c==='reforged'||c==='bastion'?-9.5:-2.2)-i*0.4);e.hp=e.maxHp=500;e.cd=99;return e;});
  const p0=player.pos.clone();classAbility();step(90);const hurt=es.filter(e=>e.hp<500||!e.alive).length;
  log(c.padEnd(8),'hp',player.maxHp,'| eye',player.eye,'| loadout',WEAPONS[0].id,'/',WEAPONS[2].id,'| Z',ZAB[CLS[c].z].name,'-> enemies hit',hurt,'| moved',p0.distanceTo(player.pos).toFixed(1),'| cd',Math.round(player.zcd),'| stim',player.stimT>0||'-','| aura',player.auraT>0||'-');}
cls='ward';prepareMatch(3);state='playing';PSY.lift.cd=0;const ann=$('announce');keys.KeyV=false;
log('ward cannot use psychic: CLS.ward.psy',CLS.ward.psy,'| walker no jump',CLS.walker.noJump);
const m=buildCharacter('walker');let n=0;m.traverse(()=>n++);log('walker model parts',n);
cls='walker';prepareMatch(3);state='playing';cur=0;switchWeapon(1);const c1=cur;switchWeapon(2);step(20);log('walker pistol blocked: after switch(1) cur',c1,'| switch(2) cur',cur);
log('DONE');})();
