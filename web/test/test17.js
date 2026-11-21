;(async()=>{let now=1e7;const step=n=>{for(let i=0;i<n;i++){now+=16;frame(now);}};const log=console.log;globalThis.setTimeout=(f)=>{f();return 0;};
const force=types=>{prepareMatch(5);state='playing';for(const it of interactables)scene.remove(it.m);enemies.forEach(e=>{e.alive=false;scene.remove(e.g)});enemies=[];
  match.conds=types.map(t=>({type:t,prog:0,target:COND_INFO[t].target,revealed:true}));missionSetup(types,[[0,0]]);player.hp=player.maxHp=99999;};
// 坚守
force(['defend']);const dp=interactables.find(i=>i.type==='defend');player.pos.set(dp.x,0,dp.z+2);interact(dp);for(let i=0;i<52*30;i++){step(2);enemies.forEach(e=>{if(e.alive&&e.type!=='nest'){e.alive=false;scene.remove(e.g);}});}
log('defend: done',match.conds[0].prog>=1,'| timer',Math.round(match.defend));
// 巢穴
force(['nest']);const nests=enemies.filter(e=>e.type==='nest');player.pos.copy(nests[0].g.position).add(new THREE.Vector3(3,0,0));step(500);const spawned=enemies.filter(e=>e.alive&&e.type==='imp').length;
for(const n of nests)damageEnemy(n,9999,'body',new THREE.Vector3(1,0,0));step(3);log('nests',nests.length,'| spawned imps',spawned>0,'| progress',match.conds[0].prog,'/3 | cannot execute nest',!canExecute(Object.assign(nests[0],{alive:true})));
// 圣物棺
force(['carry']);const rq=interactables.find(i=>i.type==='reliquary');interact(rq);cur=0;step(2);const blocked=cur!==0;
player.hp=0;step(2);const dropped=interactables.some(i=>i.type==='reliquary'&&!i.used);player.hp=99999;
interact(interactables.filter(i=>i.type==='reliquary'&&!i.used).pop());interact(match.pod);
log('carry: primary blocked',blocked,'| dropped on death',dropped,'| delivered',match.conds[0].prog>=1,'| carrier cleared',match.carrier===null);
log('DONE');})();
