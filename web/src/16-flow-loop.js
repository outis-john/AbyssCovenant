// ============================================================ 开始 / 死亡 / 结算
function prepareMatch(seedArg){
  if(!isClient())pendingThreat=loadout.threat||1;
  seed=seedArg??Math.floor(Math.random()*1e9);rng=mulberry32(seed);enemySeq=0;net.missing=new Map();distCache=new Map();
  for(const e of enemies)scene.remove(e.g);for(const g of gibs)scene.remove(g.m);for(const b of bloods)scene.remove(b.m);for(const p of projectiles)scene.remove(p.m);for(const b of bolts)scene.remove(b.m);bolts=[];for(const b of plasmaBalls)scene.remove(b.m);plasmaBalls=[];for(const p of firePatches)scene.remove(p.m);firePatches=[];hazards=[];for(const f of hazFx)scene.remove(f.m);hazFx=[];for(const c of clouds)scene.remove(c.m);clouds=[];reap=null;for(const f of ufx)scene.remove(f.m);ufx=[];player.spin=0;player.aiming=false;for(const q of spits)scene.remove(q.m);spits=[];for(const p of puffs)scene.remove(p.m);puffs=[];for(const w of wisps)scene.remove(w.m);for(const b of beams)scene.remove(b.m);
  enemies=[];gibs=[];bloods=[];projectiles=[];wisps=[];beams=[];
  if(!isNet())pendingBiome=null;curBiome=pickBiome();buildLevel();
  Object.assign(player,{hp:100,maxHp:100,stamina:100,mana:100,ovl:0,maxOvl:100,slots:3,ignoreChance:0,gunMul:1,dmgTaken:1,shield:0,warp:0,recoil:0,shake:0,yaw:Math.PI*0.75,pitch:0,vy:0});
  applyClassStats();fixLoadoutForClass();resetAbyss();AUS.on=false;$('auspex').classList.remove('show');
  player.pos.set(0,0,0);
  spells=[{form:'bolt',elem:'fire',mods:[]}];for(const k in PSY)PSY[k].cd=0;bt.t=0;lifts=[];for(const H of holes)scene.remove(H.g);holes=[];bleeders=[];puddles=[];player.channelT=0;
  applyProgress();applyLoadout();swordOut=0;player.ssPistol=false;player.revving=false;player.frenzy=0;player.field=0;player.fieldCd=0;MS.combo=0;MS.step=null;ex.active=false;player.exCharge=0;player.blocking=false;shieldG.position.set(-.35,-.35,-.5);
  setupMatch();match.beacons+=upLv('beacon');updatePodLook();
  waveTimer=60;gameTime=0;setProgress(-1);
  camera.position.set(0,1.6,0);camera.rotation.set(0,player.yaw,0,'YXZ');
}
$('readyBtn').onclick=()=>{
  $('ready').classList.remove('show');document.body.classList.remove('inhub');
  announce('Drop complete. Extraction method unknown — find clues.',3.5);
  state='playing';canvas.requestPointerLock?.();
};
let deathT=0;
function beginDeath(){
  stopAllLoops();
  if(state!=='playing')return;state='dying';deathT=2.2;mouseDown=false;swordOut=0;swing=0;MS.phase='none';ex.active=false;player.blocking=false;sawEngine(false,'idle');humEngine(false,false);
  play('kill');play('hurt');$('hurt').style.opacity=1;setProgress(-1);announce('You have fallen...',2);
}
function updateDeath(dt){
  deathT-=dt;const k=1-clamp(deathT/2.2,0,1);
  camera.position.y=lerp(player.pos.y+1.6,0.35,Math.min(1,k*1.6));
  camera.rotation.set(lerp(player.pitch,-0.2,k),player.yaw,lerp(0,1.25,Math.min(1,k*1.4)),'YXZ');
  view.visible=false;canvas.style.filter=`grayscale(${k}) brightness(${1-k*0.5})`;
  if(deathT<=0){if(isClient())sendNet({t:'dead'});
    if(isNet()&&[...net.remotes.values()].some(r=>r.inMatch&&!r.dead)){state='spectate';$('hurt').style.opacity=0;canvas.style.filter='';announce('You’re down and spectating. Results come when the squad extracts or wipes.',5);checkWipe();}
    else endMatch(false);}
}
function endMatch(win){
  if(state==='result')return;if(isHost()&&net.inMatch)bcast({t:'end',win});net.inMatch=false;for(const r of net.remotes.values()){if(r.model)scene.remove(r.model);r.model=null;r.inMatch=false;r.dead=false;}
  const diedButWon=win&&player.hp<=0;state='result';document.exitPointerLock?.();setProgress(-1);view.visible=true;
  const v=loadVault();v.runs++;
  const TM=CFG.threat[match.threat||1].loot,kept=Math.round((win?match.safeLoot+match.loot:match.safeLoot)*TM), lost=win?0:match.loot;
  const amLost=player.amulet&&player.hp<=0&&!win;   // 阵亡：护符留在了深渊
  saveMastery(v);v.loot+=kept;if(win){v.extracted++;if(match.rare)v.rare++;}if(amLost)v.rare=Math.max(0,v.rare-1);saveVault(v);
  const t=Math.floor(gameTime),mm=String(Math.floor(t/60)).padStart(2,'0'),ss=String(t%60).padStart(2,'0');
  const done=match.conds.filter(c=>c.prog>=c.target).length,found=match.conds.filter(c=>c.revealed).length;
  const parts=Object.keys(PART_NEED).reduce((a,k)=>a+match.parts[k],0),need=Object.values(PART_NEED).reduce((a,b)=>a+b,0);
  $('resTitle').textContent=win?'Extracted':'Down';
  $('resTitle').style.color=win?'#8fd08f':'#e05a4a';
  $('resText').textContent=diedButWon?'You fell in action, but the squad extracted with everyone’s loot.':win?'The escape pod breaks atmosphere — the "Eternal Night Oath" catches you.':'The squad fell deep in the hive. Everything you carried is left to the Abyss.';
  const row=(a,b,c='')=>`<tr><td>${a}</td><td class="${c}">${b}</td></tr>`;
  $('resTable').innerHTML=
    row('Time survived',mm+':'+ss)+row('Slay demons',match.kills+(match.elites?`(elite ${match.elites})`:''))+
    row('Extraction',`done ${done} / ${match.conds.length} found ${found} / ${match.conds.length}`)+row('Pod parts',`${parts} / ${need}`)+
    row(win?'Loot brought back':'Saved by beacon',kept+'  ','gain')+(win?'':row('Loot lost',lost+'  ','lost'))+
    row('psy-relic',match.rare?(win?'Returned':'Lost'):'Not found',match.rare?(win?'gain':'lost'):'')+
    row('Threat level',CFG.threat[match.threat||1].name+`(Loot ×${TM})`)+(player.amulet?row('Relic amulet',amLost?'Lost':'Returned',amLost?'lost':'gain'):'')+
    row('Ship vault total',`${v.loot} loot ·  ${v.rare} relics`);
  $('result').classList.add('show');
}
function resumeGame(){state='playing';$('pause').classList.remove('show');canvas.requestPointerLock?.();}
$('backBtn').onclick=enterHub;
$('resume').onclick=resumeGame;
$('quit').onclick=()=>{$('pause').classList.remove('show');if(training.on)exitTraining();else endMatch(false);};
document.addEventListener('pointerlockchange',()=>{if(!document.pointerLockElement&&state==='playing'){state='paused';$('pause').classList.add('show');}});
canvas.addEventListener('click',()=>{if(state==='playing'&&!document.pointerLockElement)canvas.requestPointerLock?.();});
$('letterbox').addEventListener('click',()=>{if(state==='cutscene')endCutscene();});

// ============================================================ 输入
let mouseDown=false;
addEventListener('mousemove',e=>{if(state!=='playing'||!document.pointerLockElement)return;const k=0.0022*SET.sens*(camera.fov<40?0.35:1);player.yaw-=e.movementX*k;player.pitch=clamp(player.pitch-e.movementY*k,-1.5,1.5);});
addEventListener('mousedown',e=>{if(e.button===0){mouseDown=true;if(state==='playing'&&(document.pointerLockElement||pad.active))tryFire(true);}
  if(e.button===2&&state==='playing'&&WEAPONS[cur].block&&!ex.active){player.ssPistol=!player.ssPistol;switchT=0.2;reloadT=0;MS.phase='none';play('equip');announce(player.ssPistol?'Right hand: bolt pistol':'Right hand: sword',0.7);}
  if(e.button===2&&state==='playing'&&WEAPONS[cur].id==='saw'&&cur===2&&!ex.active&&MS.phase==='none'){player.revving=true;player.revCharge=0;}
  if(e.button===2&&state==='playing'&&WEAPONS[cur].id==='power'&&cur===2&&!ex.active)activateField();
  if(e.button===2&&state==='playing'&&WEAPONS[cur].scope&&cur===0)player.aiming=true;
  if(e.button===2&&state==='playing'&&WEAPONS[cur].heat&&!ex.active){player.charging=true;if(!heat.over)play('charge');}});
addEventListener('contextmenu',e=>e.preventDefault());
addEventListener('wheel',e=>{if(state!=='playing')return;let n=(cur+(e.deltaY>0?1:2))%3;if(n===1&&CLS[cls].noPistol)n=(n+(e.deltaY>0?1:2))%3;switchWeapon(n);});
addEventListener('mouseup',e=>{if(e.button===0){mouseDown=false;if(state==='playing')meleeRelease();}if(e.button===2){player.charging=false;player.aiming=false;
  if(player.revving){player.revving=false;if(player.revCharge>0.2){player.frenzy=1.5+player.revCharge*3.5;play('frenzy');announce('Chainsword frenzy! Move & attack speed up '+player.frenzy.toFixed(1)+' s',1.5);}player.revCharge=0;}}});
addEventListener('keydown',e=>{if(e.code==='F3'){e.preventDefault();SET.fps=!SET.fps;saveSet();applySet();return;}
  if(e.code==='KeyH'&&(state==='playing'||state==='paused')){toggleHelp();return;}
  if(e.code==='Tab'){e.preventDefault();if(state==='playing')castGodSkill();return;}
  if(state==='cutscene'&&(e.code==='Space'||e.code==='Escape'||e.code==='Enter')){endCutscene();return;}
  keys[e.code]=true;if(state!=='playing')return;
  if(e.code==='Space'&&player.onGround&&!CLS[cls].noJump){player.vy=7.5;player.onGround=false;}
  if(e.code==='Digit1')switchWeapon(0);if(e.code==='Digit2')switchWeapon(1);if(e.code==='Digit3')switchWeapon(2);
  if(e.code==='KeyZ')classAbility();if(e.code==='KeyT'){toggleAuspex();return;}
  if(!CLS[cls].psy&&['KeyV','KeyG','KeyQ','KeyC'].includes(e.code)){announce('Only Tidecallers can use psychic powers · press Z for your class ability',1.2);return;}
  if(e.code==='KeyV')castLift();if(e.code==='KeyG')castHole();if(e.code==='KeyQ')castBT();if(e.code==='KeyC')castSpell(0);
  if(e.code==='KeyM')$('mapWrap').classList.toggle('big');
  if(e.code==='KeyE'&&!e.repeat&&WEAPONS[cur].block&&!ex.active){player.blocking=true;player.blockStart=gameTime;play('equip');}
  if(e.code==='KeyX'&&!e.repeat){exHold.t=0;exHold.on=true;}if(e.code==='KeyF')interact();if(e.code==='KeyR')startReload();if(e.code==='KeyB')callBeacon();
});
addEventListener('keyup',e=>{keys[e.code]=false;if(e.code==='KeyX'&&exHold.on){exHold.on=false;if(state==='playing')execute('quick');}if(e.code==='KeyE')player.blocking=false;});
addEventListener('blur',()=>{for(const k in keys)keys[k]=false;mouseDown=false;});

// ============================================================ 主循环
let last=performance.now();
function simWorld(dt){if(isClient())updateEnemiesClient(dt);else updateEnemies(dt);updateLifts(dt);updateHoles(dt);updateDebris(dt);updateBolts(dt);updateSpits(dt);updatePuffs(dt);updateSparks(dt);updateBleeders(dt);updatePuddles(dt);updateMatch(dt);}
function frame(now){
  requestAnimationFrame(frame);
  let dt=Math.min(0.05,(now-last)/1000);last=now;
  netTick(dt);updatePerf(dt);updatePad(dt);if(actx){musicBiome(state==='hub'||state==='matching'||!match?'hub':curBiome);musicIntensity(dt);}
  if(state==='hub'||state==='matching'){updateHub(dt);renderer.render(hubScene,hubCam);return;}
  if(state==='playing'){
    if(hitstop>0){hitstop-=dt;dt*=0.05;}   // 顿帧
    gameTime+=dt;
    if(mouseDown&&(document.pointerLockElement||pad.active))tryFire(false);
    const ws=bt.t>0?0.25:(ex.active?0.35:1);bt.t=Math.max(0,bt.t-dt);for(const k in PSY)PSY[k].cd=Math.max(0,PSY[k].cd-dt*(player.bless==='change'?2:player.bless==='excess'?1.5:1));
    updatePlayer(dt);if(isClient())updateEnemiesClient(dt);else updateEnemies(dt*ws);updateLifts(dt*ws);updateHoles(dt*ws);updateSpells(dt);updateDebris(dt*ws);updateBolts(dt);updateSpits(dt*ws);updatePuffs(dt);updateSparks(dt*ws);updateBleeders(dt*ws);updatePuddles(dt);updateMatch(dt);updateHUD(dt);
  } else if(state==='dying'){updateDeath(dt);if(isNet())simWorld(dt);else updateDebris(dt*0.4);}
  else if(state==='spectate'){gameTime+=dt;simWorld(dt);spectateCam(dt);updateHUD(dt);}
  else if(state==='cutscene')updateCutscene(dt);
  renderer.render(scene,camera);
}
buildHub();enterHub();
requestAnimationFrame(frame);
window.__dbg=()=>({state,hp:player.hp,pos:[player.pos.x.toFixed(1),player.pos.z.toFixed(1)],enemies:enemies.filter(e=>e.alive).length,gibs:gibs.length,mana:player.mana|0,ovl:player.ovl|0,conds:match&&match.conds,kills:match&&match.kills,inter:interactables.length});
