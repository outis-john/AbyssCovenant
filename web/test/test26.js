;(async()=>{let now=1e7;const step=n=>{for(let i=0;i<n;i++){now+=16;frame(now);}};const log=console.log;globalThis.setTimeout=(f)=>0;
for(const id of ['3-1','3-3']){cls='ward';startCampaignLevel(id);endScene(true);step(3);player.hp=player.maxHp=99999;
  for(const e of enemies){e.alive=false;scene.remove(e.g);}enemies=[];const last=CSTEPS[id].length-1;CAMP.step=last-1;CAMP.S={update:()=>true};step(3);
  if(SC.on)endScene(true);step(3);
  let b=id==='3-1'?null:CAMP.malk;if(id==='3-1'){b=spawnEnemy('warsinger',player.pos.x,player.pos.z-8);b.named='Choir-Mistress Ysolde';CAMP.boss=b;}
  const minion=spawnEnemy('militia',player.pos.x+5,player.pos.z-10);
  log(id,'boss present',!!b,'step',CAMP.step,'/',last);
  damageEnemy(b,1e7,'body',new THREE.Vector3(0,0,-1),{});log(id,'boss scene started',SC.on,'state',state);
  for(let i=0;i<4000&&state!=='result';i++){step(1);}
  log(id,'minion dead',!minion.alive,'final state',state,'result title',$('resTitle').textContent);
}
log('DONE');})();
