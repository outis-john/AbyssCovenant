// ============================================================ 训练场：一步步教操作（不计入战舰仓库）
const training={on:false,step:0,k0:0};
const TSTEPS_ALL=[
  {t:'LMB to shoot: kill a target demon  (1 primary · R reload · 2 bolt pistol)',ok:()=>match.kills>training.k0},
  {t:'Press 3 for melee, tap LMB repeatedly for the 4-hit combo',ok:()=>cur===2&&MS.combo>=4},
  {t:'Hold LMB to charge, release for a heavy attack (every melee weapon’s heavy is different)',ok:()=>player.didHeavy},
  {t:'Press V: psychic Choke lifts the enemies in front into the air',psy:true,ok:()=>PSY.lift.cd>0},
  {t:'Press G: Void Rift sucks in a crowd',psy:true,ok:()=>PSY.hole.cd>0},
  {t:'Press Z: use your class ability',psy:false,ok:()=>player.zcd>0},
  {t:'Press X: execute (charge filled for you) — aim at a glowing enemy',enter:()=>{player.exCharge=100;},ok:()=>ex.active},
  {t:'A Plague Caster! Strafe to dodge the green fireballs, then kill it (cut off its right arm to stop its casting)',enter:()=>{training.caster=spawnEnemy('caster',0,-16);training.caster.dmg=6;},ok:()=>training.caster&&!training.caster.alive},
  {t:'Training complete! Esc → "Abandon" to return to the ship. Time for the real battlefield.',ok:()=>false}];
let TSTEPS=TSTEPS_ALL;
function startTraining(){TSTEPS=TSTEPS_ALL.filter(s=>s.psy===undefined||s.psy===!!CLS[cls].psy);player.didHeavy=false;if(isNet())leaveRoom();initAudio();actx.resume?.();prepareMatch();training.on=true;training.step=-1;
  for(const e of enemies){e.alive=false;scene.remove(e.g);}enemies=[];waveTimer=1e9;player.pos.set(0,0,0);player.yaw=0;
  $('hub').classList.remove('show');document.body.classList.remove('inhub');view.visible=true;$('trainBox').style.display='';
  state='playing';canvas.requestPointerLock?.();nextTrainStep();}
function nextTrainStep(){training.step++;const S=TSTEPS[training.step];training.k0=match.kills;if(S.enter)S.enter();
  $('trainBox').innerHTML=`<small>Training ${Math.min(training.step+1,TSTEPS.length-1)} / ${TSTEPS.length-1}</small><br>${S.t}`;if(training.step>0)play('pickup');}
function updateTraining(dt){if(player.hp<40)player.hp=40;   // 训练里不会死
  const dummies=enemies.filter(e=>e.alive&&e.dummy);
  if(dummies.length<4){const e=spawnEnemy('imp',(Math.random()-.5)*8,-7-Math.random()*3);e.dummy=true;e.speed=0;e.reach=0;e.dmg=0;}
  const S=TSTEPS[training.step];if(S.ok())nextTrainStep();}
function exitTraining(){training.on=false;$('trainBox').style.display='none';for(const e of enemies){e.alive=false;scene.remove(e.g);}enemies=[];enterHub();}
$('trainBtn').onclick=()=>{if(classOk())startTraining();};
