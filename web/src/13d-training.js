// ============================================================ 训练场：一步步教操作（不计入战舰仓库）
const training={on:false,step:0,k0:0};
const TSTEPS_ALL=[
  {t:'左键射击：打死一个靶子恶魔　（1 主武器 · R 换弹 · 2 爆弹手枪）',ok:()=>match.kills>training.k0},
  {t:'按 3 换近战，连续按左键打出四段连招',ok:()=>cur===2&&MS.combo>=4},
  {t:'按住左键蓄力，松开打出重击（每把近战武器的重击都不一样）',ok:()=>player.didHeavy},
  {t:'按 V：灵能锁喉，把前方的敌人提到空中',psy:true,ok:()=>PSY.lift.cd>0},
  {t:'按 G：灵能黑洞，把一群敌人吸进去',psy:true,ok:()=>PSY.hole.cd>0},
  {t:'按 Z：使用职业技能',psy:false,ok:()=>player.zcd>0},
  {t:'按 X：处决（已帮你充满能量），对准发光的敌人',enter:()=>{player.exCharge=100;},ok:()=>ex.active},
  {t:'瘟火术士来了！横移躲开绿色火球，然后干掉它（打断它右臂就不能施法）',enter:()=>{training.caster=spawnEnemy('caster',0,-16);training.caster.dmg=6;},ok:()=>training.caster&&!training.caster.alive},
  {t:'训练完成！按 Esc →「放弃行动」返回战舰，去真正的战场吧。',ok:()=>false}];
let TSTEPS=TSTEPS_ALL;
function startTraining(){TSTEPS=TSTEPS_ALL.filter(s=>s.psy===undefined||s.psy===!!CLS[cls].psy);player.didHeavy=false;if(isNet())leaveRoom();initAudio();actx.resume?.();prepareMatch();training.on=true;training.step=-1;
  for(const e of enemies){e.alive=false;scene.remove(e.g);}enemies=[];waveTimer=1e9;player.pos.set(0,0,0);player.yaw=0;
  $('hub').classList.remove('show');document.body.classList.remove('inhub');view.visible=true;$('trainBox').style.display='';
  state='playing';canvas.requestPointerLock?.();nextTrainStep();}
function nextTrainStep(){training.step++;const S=TSTEPS[training.step];training.k0=match.kills;if(S.enter)S.enter();
  $('trainBox').innerHTML=`<small>训练 ${Math.min(training.step+1,TSTEPS.length-1)} / ${TSTEPS.length-1}</small><br>${S.t}`;if(training.step>0)play('pickup');}
function updateTraining(dt){if(player.hp<40)player.hp=40;   // 训练里不会死
  const dummies=enemies.filter(e=>e.alive&&e.dummy);
  if(dummies.length<4){const e=spawnEnemy('imp',(Math.random()-.5)*8,-7-Math.random()*3);e.dummy=true;e.speed=0;e.reach=0;e.dmg=0;}
  const S=TSTEPS[training.step];if(S.ok())nextTrainStep();}
function exitTraining(){training.on=false;$('trainBox').style.display='none';for(const e of enemies){e.alive=false;scene.remove(e.g);}enemies=[];enterHub();}
$('trainBtn').onclick=()=>{if(classOk())startTraining();};
