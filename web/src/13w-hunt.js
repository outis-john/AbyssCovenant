// ============================================================ 第四幕 · 叛军视角 4-T “The Night Hunt”：午夜领主 Talon Ashur Vesk 追猎溃散的忠诚派
// 新玩法：夜战（雾更浓、光更暗）；“恐惧”——近战/处决击杀会吓瘫 10 米内的敌人；B 键变成“音频尖啸”（午夜领主的扰频器尖叫，范围眩晕 + 敌人溃退）；
// 逃兵 lrun 会往东边撤离点跑，抓住多少算多少；暗鸦守卫 lrg 隐身（离得远看不见，开火或被打中才显形）；Boss 铁父 Kasdrel。
LEG.ih={armor:0x1e1f22,trim:0xa8acb0,metal:0x8a8e92,eye:0xff3020};LEG.sal={armor:0x1f5a2a,trim:0x161616,metal:0xb08a30,eye:0xff7020};LEG.rg={armor:0x1b1b1d,trim:0xd8d8d0,metal:0x6a6a6a,eye:0xe8f0ff};
Object.assign(ENEMY,{lih:{hp:250,speed:3.2,dmg:15,reach:1.9,scale:1.12,color:0x1e1f22},lsal:{hp:270,speed:3.4,dmg:9,reach:1.9,scale:1.14,color:0x1f5a2a},
  lrg:{hp:190,speed:6.6,dmg:24,reach:2,scale:1.1,color:0x1b1b1d},lrun:{hp:170,speed:5.2,dmg:12,reach:1.8,scale:1.1,color:0x1e1f22},ironfather:{hp:8200,speed:4.2,dmg:36,reach:2.8,scale:1.36,color:0x1e1f22}});
ETYPES.push('lih','lsal','lrg','lrun','ironfather');
Object.assign(ENEMY_BUILD,{
  lih:e=>{restyleMarine(e,LEG.ih,{legion:'ih'});e.muzzle=gunBolter(e.parts.armR);for(const a of [e.parts.armL,e.parts.armR])a.children.slice(-2).forEach(c=>{if(c.material)c.material=lmat(0xc8ccd0);});rigSetup(e);},
  lsal:e=>{restyleMarine(e,LEG.sal,{legion:'sal'});const n=addTo(e.parts.armR,new THREE.CylinderGeometry(.06,.1,.9,8),lmat(0x3a3a3a),0,-.75,.2);e.muzzle=n;for(const s of [-1,1])addTo(e.parts.body,new THREE.CylinderGeometry(.16,.16,.7,10),lmat(0x8a2a14),s*.2,.1,-.62);rigSetup(e);},
  lrg:e=>{restyleMarine(e,LEG.rg,{legion:'rg'});jumpPack(e);for(const a of [e.parts.armL,e.parts.armR])for(let k=0;k<3;k++)addTo(a,B3(.04,.5,.04),lmat(0x9fd8ff,true),(k-1)*.08,-.7,.12);rigSetup(e);},
  lrun:e=>{const L=pickOne([LEG.ih,LEG.sal,LEG.rg]);restyleMarine(e,L,{legion:'x'});e.muzzle=gunBolter(e.parts.armR);addTo(e.parts.body,B3(.5,.06,.5),lmat(0xe8e0c8),0,.55,.1);rigSetup(e);},
  ironfather:e=>{restyleMarine(e,LEG.ih,{legion:'ih',plume:0xa8acb0});e.parts.body.scale.set(1.15,1.05,1.15);const ax=powerSword(e.parts.armR);e.muzzle=gunBolter(e.parts.armL,true);
    for(const s of [-1,1]){const arm=addTo(e.parts.body,B3(.12,.9,.12),lmat(0x8a8e92),s*.45,.9,-.6);arm.rotation.z=s*.6;addTo(e.parts.body,B3(.22,.22,.22),lmat(0xffa040,true),s*.75,1.25,-.6);}
    e.onHit=(e,d,dir,o)=>{const r=tankArmour(e,d,dir,o);return r<d?d*.6:r;};e.named='Iron Father Kasdrel';e.spk='kasdrel';e.l2='Medusa remembers every traitor’s name. I will carve yours myself.';e.l3='Flesh fails — but IRON ENDURES!';e.adds='lih';
    e.slamCd=3;e.scrCd=1e9;e.leapCd2=2;rigSetup(e);}});
function salFlameAI(e,T,pp,to,dist,dt){if(dist>8.5){return shooterAI(e,T,pp,to,dist,dt,EWEAP.bolter,[5,8],2,[1.6,2.4],.14);}
  aimPose(e,1);e.flT=(e.flT||0)-dt;if(e.flT<=0){e.flT=.12;const dir=to.clone().setY(0).normalize(),P=e.g.position;for(let i=0;i<3;i++)puff(P.clone().setY(1.3).addScaledVector(dir,1.5+i*2.4),2,i<1?0xffd060:0xff6020,1.2+i*.4);
    const v=player.pos.clone().sub(P).setY(0),d=v.length();if(state==='playing'&&d<9.5&&v.normalize().dot(dir)>.8)hurtPlayer(e.dmg,false,e);for(const a of allies)if(a.alive){const w=a.pos.clone().sub(P).setY(0);if(w.length()<9.5&&w.normalize().dot(dir)>.8)allyHurt(a,e.dmg,e);}}
  if(dist>3)e.g.position.addScaledVector(steer(e,to.clone().setY(0).normalize(),dt),e.speed*.5*dt);return true;}
function rgCloakAI(e,T,pp,to,dist,dt){e.revealT=Math.max(0,(e.revealT||0)-dt);const vis=dist<13||e.revealT>0||!!e.rj;e.g.visible=vis;if(e.rj||e.rjCd<=.05)e.revealT=Math.max(e.revealT,1.2);return raptorAI(e,T,pp,to,dist,dt);}
function runnerAI(e,T,pp,to,dist,dt){const X=e.exit;if(!X)return false;const nw=navWaypoint(e,e.g.position,X,1);const d=(nw?nw.p:X).clone().sub(e.g.position).setY(0);const L=d.length();
  if(L>.1){d.divideScalar(L);e.g.position.addScaledVector(steer(e,d,dt),e.speed*dt);walkLegs(e,e.speed,dt);collide(e.g.position,e.r);e.g.rotation.y=Math.atan2(d.x,d.z);}
  if(dist<11&&hasLOS(e,pp)){e.fireCd=(e.fireCd??1)-dt;if(e.fireCd<=0){e.fireCd=1.2+Math.random();enemyShoot(e,T,EWEAP.bolter);}}
  if(e.g.position.distanceTo(X)<3){e.alive=false;scene.remove(e.g);CAMP.run.escaped++;if(gameTime-(CAMP.run.bark||-99)>8){CAMP.run.bark=gameTime;vox('kharos',pickOne(['One slipped through. Sloppy, Vesk.','Another escapes into the hills. Faster!']),true);}}return true;}
Object.assign(ENEMY_AI,{lih:(e,T,pp,to,dist,dt)=>shooterAI(e,T,pp,to,dist,dt,EWEAP.bolter,[7,16],3,[1.2,2.1],.11),lsal:salFlameAI,lrg:rgCloakAI,lrun:runnerAI,ironfather:(e,T,pp,to,dist,dt)=>eidolonAI(e,T,pp,to,dist,dt)});
TAC_COVER.add('lih');
const _deH=damageEnemy;damageEnemy=function(e,...r){if(e&&e.type==='lrg'){e.revealT=3;if(e.g)e.g.visible=true;}return _deH(e,...r);};
// ---------------- 午夜领主小队、主角、配音
HERO['4-T']={name:'Talon Ashur Vesk',tag:'AV',col:0x1a2244};
Object.assign(ALLY_DEFS,{kharos:{name:'Sergeant Kharos Vey',legion:'nl',role:'bolter',hp:460,essential:true,traitor:true},ixan:{name:'Brother Ixan',legion:'nl',role:'melee',hp:340,sub:'jump',traitor:true},
  thraile:{name:'Brother Thraile',legion:'nl',role:'bolter',hp:320,traitor:true}});
['Morr','Sevrak','Hul','Daeth'].forEach((n,i)=>{ALLY_DEFS['nlg'+(i+1)]={name:'Brother '+n,legion:'nl',role:i===2?'melee':'bolter',hp:250,generic:true,traitor:true,sub:i===1?'heavy':i===2?'jump':null};});
Object.assign(SPEAKER,{vesk:'Talon Ashur Vesk',kharos:'Sgt. Kharos Vey',ixan:'Brother Ixan',thraile:'Brother Thraile',kasdrel:'Iron Father Kasdrel',curze:'Konrad Curze'});
Object.assign(VOICE,{vesk:{p:.5,r:.84},kharos:{p:.3,r:.78},ixan:{p:.7,r:.95},thraile:{p:.55,r:.88},kasdrel:{p:.2,r:.76},curze:{p:.35,r:.72}});
const _meH=meV;meV=function(){return CAMP.id==='4-T'?'vesk':_meH();};
// 叛军队友不穿忠诚派的象牙布罩
const _spH=spawnAlly;spawnAlly=function(id,x,z,yaw){const a=_spH(id,x,z,yaw);if(ALLY_DEFS[id]&&ALLY_DEFS[id].traitor&&a.J&&a.J.cloth)a.J.cloth.visible=false;return a;};
// ---------------- 恐惧：近战 / 处决击杀吓瘫附近敌人；音频尖啸代替火力支援
const _keH=killEnemy;killEnemy=function(e,...r){const was=e.alive;const out=_keH(e,...r);
  if(was&&!e.alive&&CAMP.on&&CAMP.id==='4-T'&&state==='playing'&&((e.pmT&&gameTime-e.pmT<.3)||ex.active)){const P=e.g.position;let n=0;
    for(const o of enemies)if(o.alive&&!o.named&&!o.vehicle&&o.g.position.distanceTo(P)<10){o.stun=Math.max(o.stun||0,1.1);if(Math.random()<.4){o.fellBack=true;if(o.cov){o.cov.re=0;o.cov.ph='none';}}n++;}
    if(n){ringAt(P.x,.2,P.z,0x3040a0,.5,10,.6,.12);if(actx)tone('sawtooth',220,90,.03,.5);if(gameTime-(CAMP.fearBark||-99)>14&&n>=2){CAMP.fearBark=gameTime;vox(pickOne(['kharos','ixan','thraile']),pickOne(['Hear them scream. Good.','They break so easily.','Fear is the oldest weapon, brother.']),true);}}}
  return out;};
const _fsH=fireSupport;fireSupport=function(){if(CAMP.id!=='4-T')return _fsH();if((CAMP.fs|0)<=0){announce('Vox-scramblers recharging — hunt to recharge',1.3);return;}CAMP.fs--;
  const P=player.pos.clone();for(let i=0;i<3;i++)ringAt(P.x,.4+i*.6,P.z,0x5060ff,1,26,.8+i*.2,.15);play('backlash');if(actx){noiseHit(2400,.3,1.4,'bandpass');tone('sawtooth',880,110,.06,1.6);tone('square',1320,180,.04,1.3,.1);}player.shake=Math.max(player.shake,.4);
  let n=0;for(const e of enemies){if(!e.alive||e.vehicle)continue;const d=e.g.position.distanceTo(P);if(d>26)continue;n++;e.stun=Math.max(e.stun||0,e.named?.8:2.6);if(!e.named){e.fellBack=true;if(e.cov){e.cov.re=0;e.cov.ph='none';}if(e.type==='lrg'){e.revealT=6;e.g.visible=true;}}}
  vox('vesk',pickOne(['Scream for us.','Let the dark speak.','Hear the voice of the Night Haunter!']),true);if(n>=3)later(1.2,()=>vox('kharos','Ha! Look at them run.',true));};
// ---------------- 关卡
const EXITS=[V3(66,0,-34),V3(66,0,0),V3(66,0,32)];
function nightLighting(){scene.fog.density=.019;scene.fog.color.setHex(0x0a0810);scene.background.setHex(0x06050c);if(levelGroup&&levelGroup.traverse)levelGroup.traverse(o=>{if(o.isLight)o.intensity*=.42;});
  const moon=new THREE.DirectionalLight(0x7088c8,.75);moon.position.set(40,90,30);levelGroup.add(moon);for(const X of EXITS){const b=new THREE.Mesh(new THREE.CylinderGeometry(.3,.3,30,6),lmat(0x60ff90,true));b.position.set(X.x,15,X.z);levelGroup.add(b);}}
CLEVELS['4-T']={title:'The Night Hunt',place:'Isstvan V · After the massacre · TRAITOR PERSPECTIVE',seed:4401,biome:'sanctum',open:'urgall',keep:[[0,-24,10],[-20,-24,8],[20,-24,8]],
  build(){fortLine(-24,[-30,30]);nightLighting();},start:V3(-52,0,40),allies:['kharos','ixan','thraile','nlg1','nlg2','nlg3','nlg4'],
  obj:['Hunt the fleeing loyalists','Break the Iron Hands rearguard','Hunt the Raven Guard in the dark','Kill the Iron Father'],
  brief:[['curze','My sons. The galaxy will remember this night — not for the dead, but for how they died.'],['kharos','The loyalists are scattering into the hills. The Warmaster wants none of them to reach the gunships.'],
    ['ixan','Raven Guard are hiding in the dark. Our dark.'],['vesk','Then we teach them who the dark belongs to. Masks on.']],
  end:'The drop site is silent. Somewhere in the hills, a handful of loyalists are still running — and they will remember the screaming. — Act IV complete.'};
ACTS[3].lv=['4-1','4-2','4-3','4-T'];if(!CORDER.includes('4-T'))CORDER.push('4-T');
function runnerWave(n){const z0=-40+Math.random()*80;for(let i=0;i<n;i++){const p=navCell(V3(-30+Math.random()*24,0,clamp(z0+(Math.random()-.5)*14,-60,60)));const e=spawnEnemy('lrun',p.x,p.z);e.campaign=true;e.exit=EXITS[Math.floor(Math.random()*3)].clone();CAMP.run.spawned++;}}
CSTEPS['4-T']=[
  {enter(){CAMP.run={spawned:0,escaped:0,waves:0,t:2};vox('kharos','Wounded, stragglers, cowards — they all run east for the gunships. Cut them down.',true);},
    update(dt){const R=CAMP.run;R.t-=dt;if(R.waves<4&&R.t<=0){R.waves++;R.t=10;runnerWave(4);if(R.waves===2)openSpawn('lih',3,V3(-6,0,10),2,6,{minP:14,pure:true});if(R.waves===3)vox('thraile','More of them by the wreck — moving fast!',true);}
      return R.waves>=4&&campAlive()===0;}},
  {enter(){CAMP.wp=V3(0,0,-18);CAMP.wpName='REARGUARD';openSpawn('lih',8,V3(0,0,-30),2,12,{minP:16,pure:true});openSpawn('lsal',4,V3(0,0,-28),2,10,{minP:16,pure:true});
      for(let i=0;i<2;i++){NEXT_LEG='ih';const t=spawnEnemy('term',-6+i*12,-34);NEXT_LEG=null;t.campaign=true;}vox('kharos','Iron Hands, dug in behind a Salamander line. They will hold until they die. Oblige them.',true);},
    update(){if(CAMP.wp&&player.pos.distanceTo(CAMP.wp)<10)CAMP.wp=null;return campAlive()<=1;}},
  {enter(){CAMP.wp=null;scene.fog.density=.03;for(let i=0;i<8;i++){const p=navCell(V3((Math.random()-.5)*110,0,(Math.random()-.5)*110));const e=spawnEnemy('lrg',p.x,p.z);e.campaign=true;e.g.visible=false;}
      vox('ixan','Ravens. I can smell them, but I cannot see them.',true);later(5,()=>vox('vesk','Then let them come to us. Listen for the jump packs.',true));},mark:e=>e.type==='lrg',update(){return campAlive(e=>e.type==='lrg')===0;}},
  {enter(){scene.fog.density=.019;ironFatherArrives();},mark:e=>!!e.named,update(){return CAMP.boss&&!CAMP.boss.alive&&campAlive()===0;}}];
function ironFatherArrives(){const P=V3(10,0,-20);
  runScene([
    {d:2,from:shotAt(player.pos.clone().add(V3(2,2.2,2)),P.clone().setY(2)),act(){const e=spawnEnemy('ironfather',P.x,P.z);e.campaign=true;CAMP.boss=e;for(let i=0;i<2;i++){NEXT_LEG='ih';const t=spawnEnemy('term',P.x+(i?3:-3),P.z-2);NEXT_LEG=null;t.campaign=true;}
        ringAt(P.x,.2,P.z,0x9fd8ff,.5,6,.6,.3);hitSparks(P.clone().setY(1.5),new THREE.Vector3(0,1,0),30);if(actx){tone('sine',1800,200,.05,.5);noiseHit(3000,.1,.3,'bandpass');}}},
    {d:3.6,from:()=>shotAt(P.clone().add(V3(-2.6,2.2,3.4)),P.clone().setY(2.6)),act(){vox('kasdrel','Night Lords. Carrion-birds picking at the dead. Come, then. Medusa has a word for your kind.',true);}},
    {d:3,from:()=>shotAt(player.pos.clone().add(V3(1.5,2,1.5)),P.clone().setY(2.2)),act(){vox('vesk','We have a word for yours, old man. Prey.',true);}}],()=>{});}
BOSS_FALL.ironfather={sub:'The iron breaks',line:['kharos','Let them run. Let them tell the galaxy what hunts in the dark.'],rout:'flee'};
LULLS['4-T']={0:[['thraile','How many got away?'],['kharos','Enough to spread the story. That is the point, brother. Terror needs witnesses.'],['ixan','I took a Salamander’s helm. It is still warm.'],['vesk','Save the trophies. The Iron Hands have not finished dying yet.']]};
HINTS['4-T']=['Catch the loyalists fleeing east before they reach the green beacons. Melee kills and executions terrify everyone nearby.','Break the Iron Hands rearguard. Their Terminators shrug off bolts — flank them, or press B to scream them into a rout.',
  'Raven Guard are cloaked — they only appear up close or when they strike. Listen for jump packs.','Kill Iron Father Kasdrel. Step out of his hammer slam; his Terminators guard his flanks.'];
Object.assign(CAMP.intro,{'4-T'(){if(typeof playTheme==='function')playTheme('dread');dropIntro('ACT IV · ISSTVAN V','The Night Hunt',6,[['kharos','Night Lords. The drop site is ours. Now we hunt the survivors.'],['ixan','I hear them in the dark. Heavy breathing. Iron and fear.'],
    ['thraile','The Warmaster’s orders: none reach the gunships.'],['vesk','Masks on, brothers. Let them hear us coming.']],()=>nextCampStep());}});
CAMP.outro['4-T']=function(done){runScene([
    {d:3.6,from:()=>shotAt(player.pos.clone().add(V3(2.2,1.9,2.2)),player.pos.clone().setY(1.6)),act(){vox('vesk','He fought well. They all did.',true);}},
    {d:4,from:()=>{const k=allyById('kharos')||allies[0];const p=(k?k.pos:player.pos).clone();return shotAt(p.clone().add(V3(1.8,2,2.4)),p.clone().setY(1.9));},act(){vox('kharos','Sentiment, Vesk? Strip his armour. The Warmaster collects trophies, and so do we.',true);}},
    {d:4.2,from:()=>shotAt(player.pos.clone().add(V3(-2,2.4,-2)),player.pos.clone().add(V3(40,8,0))),act(){vox('vesk','…As you say, Sergeant.',true);},tick(dt,k){$('fade').style.opacity=Math.max(0,(k-.55)*2.4);}},
    {d:3.4,from:shotAt(V3(0,40,0),V3(0,0,-1)),act(){$('fade').style.opacity=1;titleCard('ISSTVAN V','The hunt is over. The galaxy will learn fear.',3.4);}}],done);};
// 4-T 的 HUD：B 显示为音频尖啸；关掉随机战场事件（它们会刷出“叛军”）；逃兵计数
const _cohH=campObjHtml;campObjHtml=function(){let h=_cohH();if(CAMP.id!=='4-T')return h;h=h.replace('FIRE SUPPORT','VOX SCREAM');
  if(CAMP.run&&CAMP.step===0){const R=CAMP.run,caught=R.spawned-R.escaped-enemies.filter(e=>e.alive&&e.type==='lrun').length;h+=`<div class="ohost">Caught ${caught} · Escaped ${R.escaped}</div>`;}return h;};
const _ucH=updateCampaign;updateCampaign=function(dt){if(CAMP.id==='4-T'){EV.t=999;}_ucH(dt);
  // 逃兵离玩家超过 40 米时主循环会让他“休眠”——逃兵要一直跑
  if(CAMP.id==='4-T'&&state==='playing')for(const e of enemies){if(!e.alive||e.type!=='lrun'||e.stun>0)continue;const to=player.pos.clone().sub(e.g.position).setY(0);const d=to.length();if(d>39)runnerAI(e,null,player.pos,to,d,dt);}};
