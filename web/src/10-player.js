// ============================================================ 玩家
function hurtPlayer(n,self=false,att=null){
  if(HELL.on&&!self&&HELL.phase==='fall')return;   // 坠落过程中不会受伤
  if(state!=='playing'||ex.active)return;
  if(!self&&player.shield>0)n*=0.3;if(!self&&player.auraT>0)n*=0.5;if(!self)taintAffinity('decay',n/10);
  if(!self&&player.blocking){
    if(att&&gameTime-player.blockStart<0.3){   // 完美格挡 -> 防反横斩
      play('clang');play('parry');hitstop=0.12;player.shake=.3;att.stun=1.4;att.lean=1.2;if(isClient()&&att.remote)sendNet({t:'stun',id:att.id,dur:1.4});att.kv.addScaledVector(att.g.position.clone().sub(player.pos).setY(0).normalize(),6);
      $('shieldfx').style.opacity=1;setTimeout(()=>$('shieldfx').style.opacity=0,150);announce('Parry!',0.8);
      player.blocking=false;MS.step={p:'h',dm:2.4,cleave:true,fin:true};MS.dir=stepDir();MS.counter=true;MS.phase='windup';MS.t=0.06;MS.s=0;MS.hitDone=false;swordOut=1.4;player.meleeCd=0.5;return;}
    n*=0.2;play('clang');player.shake=Math.max(player.shake,.15);}n*=player.dmgTaken;
  if(HELL.on&&player.hp-n<1)n=Math.max(0,player.hp-1);   // 在深渊里不会死
  if(n>0&&!self)player.lastHurt=gameTime;
  player.hp-=n;play('hurt');player.shake=Math.max(player.shake,0.2);$('hurt').style.opacity=0.9;setTimeout(()=>$('hurt').style.opacity=0,120);
  if(player.hp<=0)beginDeath();
}
function updatePlayer(dt){
  breathRegen(dt);
  updateHold(dt);updateExHold(dt);updateGunExtras(dt);updateClassExtras(dt);
  const sprint=!CLS[cls].noSprint&&keys.ShiftLeft&&player.stamina>0&&(keys.KeyW||keys.KeyA||keys.KeyS||keys.KeyD);
  let sp=(sprint&&!player.blocking)?9.5:6;if(player.blocking)sp*=0.55;if(player.frenzy>0)sp*=1.3;sp*=(player.speedMul||1)*(player.stimT>0?1.3:1)*(match&&match.carrier&&match.carrier===net.myId?0.7:1)*(player.slowT>0?0.55:1);if(mouseDown&&cur===0&&WEAPONS[0].spin)sp*=0.6;if(ex.active||player.mounted)sp=0;
  if(sprint){player.stamina-=28*dt;player.stDelay=0.8;}else{player.stDelay-=dt;if(player.stDelay<=0)player.stamina=Math.min(100,player.stamina+22*dt);}
  const f=(keys.KeyW?1:0)-(keys.KeyS?1:0),s=(keys.KeyD?1:0)-(keys.KeyA?1:0);
  const fx=-Math.sin(player.yaw),fz=-Math.cos(player.yaw),rx=Math.cos(player.yaw),rz=-Math.sin(player.yaw);
  let mx=fx*f+rx*s,mz=fz*f+rz*s;const l=Math.hypot(mx,mz);if(l>0){mx/=l;mz/=l;}
  player.pos.x+=mx*sp*dt;player.pos.z+=mz*sp*dt;
  player.vy-=22*dt;player.pos.y+=player.vy*dt;if(player.pos.y<=0){player.pos.y=0;player.vy=0;player.onGround=true;}
  collide(player.pos,player.r||0.45);
  // 镜头：后坐力恢复、震动、行走晃动
  player.recoil=Math.max(0,player.recoil-dt*0.6);player.shake=Math.max(0,player.shake-dt*1.6);
  const bob=l>0&&player.onGround?Math.sin(gameTime*(sprint?13:9))*0.05:0;
  const sh=player.shake*player.shake;
  camera.position.set(player.pos.x+(Math.random()-.5)*sh*.4,player.pos.y+(player.eye||1.6)+bob+(Math.random()-.5)*sh*.4,player.pos.z);
  const roll=player.warp>0?Math.sin(gameTime*3)*0.08*Math.min(1,player.warp):0;
  player.punch=Math.max(0,(player.punch||0)-dt*0.5);
  camera.rotation.set(player.pitch-player.punch,player.yaw,roll+(player.swingRoll||0),'YXZ');
  // 视角模型
  gunKick=Math.max(0,gunKick-dt*11);
  if(switchT>0)switchT=Math.max(0,switchT-dt);
  if(heat.over>0){heat.over-=dt;heat.v=Math.max(0,heat.over/2.5*100);if(heat.over<=0){heat.v=0;heat.over=0;}}else heat.v=Math.max(0,heat.v-dt*14);
  if(player.charging&&WEAPONS[cur].heat&&heat.over<=0)heat.charge=Math.min(1,heat.charge+dt);else heat.charge=Math.max(0,heat.charge-dt*2);
  heatMat.color.setRGB(lerp(.35,1,Math.max(heat.v/100,heat.charge)),lerp(.12,.55,heat.charge),lerp(.06,.2,heat.charge));
  if(WEAPONS[cur].heat){meltaFlash.visible=heat.charge>0.05||meltaFlash.visible&&player.fireCd>0;if(heat.charge>0.05)meltaFlash.scale.setScalar(.4+heat.charge*1.2);}
  player.channelT=Math.max(0,(player.channelT||0)-dt);
  if(reloadT>0){reloadT-=dt;if(reloadT<=0)finishReload();}
  const W=WEAPONS[cur],AG=activeGun();let rl=0;if(reloadT>0&&AG&&AG.w.reload){rl=Math.sin(Math.PI*(1-reloadT/AG.w.reload));}
  const sw=switchT/0.3;
  for(const m of RANGED_MODELS){const k=W.kick||1;
    m.position.set(.32+Math.sin(gameTime*4.5)*.004,-.28+bob*.3-gunKick*.015-rl*.22-sw*.5,-.55+player.recoil*0.4+gunKick*0.08);
    m.rotation.set(player.recoil*1.0+gunKick*0.14-rl*0.7,rl*0.3,gunRoll*gunKick+rl*0.5);}
  if(mouseDown&&cur===0&&WEAPONS[0].spin&&player.spin>0.2){const k=player.spin;hbM.position.x+=(Math.random()-.5)*.018*k;hbM.position.y+=(Math.random()-.5)*.018*k+gunKick*.01;hbM.rotation.x+=(Math.random()-.3)*.04*k;hbM.rotation.z+=(Math.random()-.5)*.05*k;}   // 转管机枪开火时整把枪抖动
  for(const g of Object.values(MELEE_GROUP))if(g!==sword)g.visible=false;
  if(player.revving){player.revCharge=Math.min(1,(player.revCharge||0)+dt/1.2);player.shake=Math.max(player.shake,0.04+player.revCharge*0.08);}
  if(player.frenzy>0)player.frenzy-=dt;
  if(player.field>0)player.field-=dt;if(player.fieldCd>0)player.fieldCd-=dt;
  {const on=player.field>0&&WEAPONS[2].id==='power';powAura.material.opacity=on?0.3+Math.sin(gameTime*14)*0.12:0;powAura.scale.set(1,1,1+(on?Math.sin(gameTime*9)*0.04:0));
   powMat.color.setHex(on?0xe0f4ff:0x8fd0ff);}
  if(litT>0){litT-=dt;if(litT<=0){const el=$('litany');el.style.transition='opacity .8s';el.style.opacity=0;}}
  if(cur===2)swordOut=Math.max(swordOut,0.5);
  const M=WEAPONS[2],meleeShown=swordOut>0&&(!ex.active||ex.melee);
  if(meleeShown){if(MS.phase==='none'&&cur!==2&&!ex.active)swordOut-=dt;sword.visible=true;RANGED_MODELS.forEach(m=>m.visible=false);
    const fast=MS.phase==='slash'||MS.phase==='rip'||MS.phase==='bite';if(M.id==='saw')texChain.offset.x-=dt*(fast?22:6);
    sword.rotation.order='YXZ';sword.position.set(.3,-.42-sw*.5,-.3);
    if(MS.phase==='none'){const rv=player.revving?player.revCharge:0;const j=M.id==='saw'?(Math.random()-.5)*(0.008+rv*0.03):0;sword.rotation.set(POSE.rest[0]+j+rv*0.25,POSE.rest[1]-rv*0.2,POSE.rest[2]+j);if(rv)texChain.offset.x-=dt*30*rv;}
    else updateMelee(dt);
    ghost.visible=MS.phase==='slash'||MS.phase==='rip';ghost.material.color.setHex(M.id==='power'?(player.field>0?0x4090ff:0x8fd0ff):0xd8d0c0);ghost.material.opacity=M.id==='power'&&player.field>0?.45:.25;
    ghost.rotation.order='YXZ';ghost.position.copy(sword.position);
    ghost.rotation.x=lerp(ghost.rotation.x,sword.rotation.x,0.45);ghost.rotation.y=lerp(ghost.rotation.y,sword.rotation.y,0.45);ghost.rotation.z=lerp(ghost.rotation.z,sword.rotation.z,0.45);
    sawPitch=M.id==='axe'?.62:1;   // 战斧的锯链引擎更低沉
    sawEngine(M.id==='saw'||M.id==='axe',(MS.phase==='bite'||(ex.active&&ex.type==='saw'&&ex.t>.15&&ex.t<.85))?'bite':player.revving?'rev':(fast||MS.phase==='windup'||player.frenzy>0)?'swing':'idle',player.revCharge||0);humEngine(M.id==='power',fast||player.field>0);
  } else {sword.visible=false;ghost.visible=false;RANGED_MODELS.forEach(m=>m.visible=m===W.model||(ex.active&&!ex.melee&&m===WEAPONS[cur].model));sawEngine(false,'idle');humEngine(false,false);}
  if(M.block&&player.ssPistol&&cur===2&&!ex.active){sword.visible=false;ghost.visible=false;pistol.visible=true;}
  // 盾牌
  const showShield=M.id==='ssword'&&meleeShown;shieldG.visible=showShield;
  if(showShield&&!ex.active){const b=player.blocking?1:0;shieldG.position.set(lerp(-.38,-.08,b),lerp(-.38,-.22,b)-sw*.5,lerp(-.5,-.42,b));shieldG.rotation.set(0,lerp(.5,.05,b),lerp(.15,0,b));}
  if(ex.active)updateExecution(dt);
  {const want=ex.active?60:(bt.t>0?88:80);if(Math.abs(camera.fov-want)>0.05){camera.fov=lerp(camera.fov,want,0.12);camera.updateProjectionMatrix();}}
  player.swingRoll=lerp(player.swingRoll||0,MS.phase==='slash'||MS.phase==='rip'?-sdir()*0.1:MS.phase==='bite'?-sdir()*0.05:0,0.3);
  player.fireCd-=dt;player.meleeCd-=dt;
  if(MS.queued&&player.meleeCd<=0&&MS.phase!=='bite'&&cur===2&&!activeGun()&&!ex.active)melee();
  // 灵能恢复与过载衰减
  player.mana=Math.min(player.maxMana,player.mana+8*dt*(player.bless==='change'?2:1));player.ovl=Math.max(0,player.ovl-4*dt);player.shield-=dt;player.warp-=dt;
}

// 呼吸回血：5 秒没挨打就开始喘息回血，越喘越快；有呼吸声，屏幕边缘的红色慢慢褪去
function breathRegen(dt){if(state!=='playing'||player.hp<=0||player.hp>=player.maxHp||HELL.on){player.breathT=0;return;}
  const since=gameTime-(player.lastHurt??-99);if(since<5){player.breathT=0;return;}
  player.breathT=(player.breathT||0)+dt;const rate=player.maxHp*(.04+Math.min(.08,player.breathT*.02));player.hp=Math.min(player.maxHp,player.hp+rate*dt);
  player.breathP=(player.breathP||0)-dt;if(player.breathP<=0){player.breathP=2.4;if(actx){noiseHit(700,.05,.9);tone('sine',140,110,.02,.8,1.1);noiseHit(420,.04,1.1);}}
  const h=$('hurt');if(h&&h.style&&player.hp<player.maxHp*.4)h.style.opacity=.15+(1-player.hp/player.maxHp)*.25;}
