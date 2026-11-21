;(async()=>{let now=1e7;const step=n=>{for(let i=0;i<n;i++){now+=16;frame(now);}};const log=console.log;globalThis.setTimeout=(f)=>0;
// 新敌人能生成、能打
for(const t of ['dg','iw','nl','wb','al','eidolon']){const e=spawnEnemy(t,0,-10);log('spawn',t,e.alive,e.hp,!!e.marine);e.alive=false;scene.remove(e.g);}
let seen={};const runLevel=id=>{cls='ward';startCampaignLevel(id);if(state==='scene')endScene(true);let guard=0;
  while(state!=='result'&&guard++<16000){player.hp=player.maxHp=9999;
    for(const e of enemies){if(!e.alive)continue;seen[e.type]=1;if(e.campaign&&Math.random()<.02)damageEnemy(e,99999,'body',null,{_remote:true});}
    if(CAMP.betrayed)seen.betrayed=1;if(CAMP.ship)seen['ship'+CAMP.ship.n+CAMP.ship.phase]=1;if(CAMP.duel&&CAMP.duel.dead)seen.ferrusDead=1;if(CAMP.boss&&CAMP.boss.type==='eidolon')seen.eidolon=1;
    keys.KeyF=true;const it=(CAMP.inter||[]).find(i=>!i.done);if(it&&state==='playing')player.pos.copy(it.pos);else if(CAMP.wp&&state==='playing')player.pos.copy(CAMP.wp);
    if(state==='scene')endScene(true);step(1);}
  return state+' guard '+guard;};
for(const id of ['4-1','4-2','4-3']){seen={};const st=runLevel(id);log('level',id,'→',st,'| steps',CAMP.step,'| allies alive',allies.filter(a=>a.alive).length,'| seen',Object.keys(seen).sort().join(','));}
log('act IV in CORDER',CORDER.join(','));
log('DONE');})();
