// ============================================================ 新任务：坚守信标 / 摧毁巢穴 / 圣物棺护送
function missionSetup(types,used){
  if(types.includes('defend')){const c=randomCell(used);used.push(c);spawnPickup('defend',c[0]*C+3,c[1]*C);match.defend=-1;}
  if(types.includes('nest')&&!isClient())for(let k=0;k<3;k++){const c=randomCell([[0,0],podCell]);const e=spawnEnemy('nest',...cellPos(c,4));e.spawnT=3;}
  if(types.includes('carry')){const c=randomCell([[0,0],podCell,...used]);used.push(c);spawnPickup('reliquary',...cellPos(c,3));}
  match.carrier=null;}
function missionPrompt(it){if(it.type==='defend')return match.defend>=0?'Holding: stay near the beacon!':'[F] Activate beacon (hold 45s)';
  if(it.type==='reliquary')return'[F] Shoulder the reliquary (slower, sidearm & melee only)';
  if(it.type==='pod'&&match.carrier&&match.carrier===net.myId)return'[F] Load the reliquary into the pod';return'';}
function missionInteract(it,by){const who=by?by.id:net.myId;
  if(it.type==='defend'){if(match.defend<0){match.defend=0;annTeam('Beacon active — hold for 45 seconds!',3);spawnWave(4,true);}return true;}
  if(it.type==='reliquary'){if(match.carrier)return true;it.used=true;scene.remove(it.m);match.carrier=who;play('pickup');annTeam((by?by.name||'Teammate':'You')+'shouldered the reliquary',2);return true;}
  if(it.type==='pod'&&match.carrier&&match.carrier===who){match.carrier=null;addProgress('carry',1);play('beacon');annTeam('Reliquary loaded into the pod',2.5);return true;}
  return false;}
function missionTick(dt){if(!match)return;
  // 扛棺的人不能用主武器
  if(match.carrier&&match.carrier===net.myId&&cur===0&&state==='playing'){cur=2;switchT=0.3;}
  const dp=interactables.find(i=>i.type==='defend');
  if(dp&&match.defend>=0&&match.defend<45){setProgress(match.defend/45,'Holding');
    if(!isClient()){if(anyPlayerNear(dp.x,dp.z,8))match.defend+=dt;dp.waveT=(dp.waveT||0)-dt;if(dp.waveT<=0){dp.waveT=6;spawnWave(2,true);}
      if(match.defend>=45){match.defend=45;dp.used=true;addProgress('defend',1);annTeam('Beacon defended',2.5);setProgress(-1);}}}
  // 扛棺的人阵亡：圣物棺掉在原地
  if(!isClient()&&match.carrier){let pos=null;if(match.carrier===net.myId){if(player.hp<=0)pos=player.pos;}else{const r=net.remotes.get(match.carrier);if(!r||r.dead)pos=r?r.pos:player.pos;}
    if(pos){match.carrier=null;netDrop('reliquary',pos.x,pos.z);annTeam('The reliquary hit the ground!',2);}}}
ENEMY_BUILD.nest=e=>{for(const k of ['head','armL','armR','legL','legR']){e.parts[k].scale.setScalar(.01);e.parts[k].position.set(0,.8,0);}
  e.parts.body.scale.set(2.4,1.3,2.4);e.parts.body.position.y=.7;
  for(let i=0;i<6;i++){const s=new THREE.Mesh(new THREE.BoxGeometry(.3,.3,.3),new THREE.MeshLambertMaterial({color:0xc04060,emissive:0x400010}));const a=i/6*Math.PI*2;s.position.set(Math.cos(a)*.42,.3,Math.sin(a)*.42);s.userData.part='sac';e.parts.body.add(s);}
  e.armHp={armL:Infinity,armR:Infinity};};
ENEMY_AI.nest=(e,T,pp,to,dist,dt)=>{e.parts.body.scale.y=1.3+Math.sin(gameTime*3+e.id)*.08;e.spawnT=(e.spawnT||7)-dt;
  if(e.spawnT<=0&&dist<22){e.spawnT=7;const a=Math.random()*6.28;spawnEnemy('imp',e.g.position.x+Math.cos(a)*1.8,e.g.position.z+Math.sin(a)*1.8);play('growl');puff(e.g.position.clone().setY(.6),6,0x6a1a2a,1);}
  return true;};
