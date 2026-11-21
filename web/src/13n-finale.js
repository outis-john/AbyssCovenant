// ============================================================ 战役收尾：配音（浏览器语音合成，低沉缓慢、像诵经）· 胜利动画 · Boss 强化 · 战场弹药/灯光
// ---------------- 配音：每个角色一套音高/语速；剧情台词下面垫一层低沉的管风琴和弦
const VOICE={kaedric:{p:.62,r:.86},ardan:{p:.8,r:.92},vell:{p:.85,r:.95},krosk:{p:.5,r:.84},lucan:{p:.9,r:.9},tavik:{p:.42,r:.74},hesk:{p:.1,r:.66},loken:{p:.66,r:.84},
  malk:{p:.48,r:.82},tarvitz:{p:.75,r:.86},fleet:{p:.95,r:.98},angron:{p:.05,r:.8},vox:{p:.7,r:.9}};
let ttsVoice=null,ttsTried=0;
function pickVoice(){if(ttsVoice||typeof speechSynthesis==='undefined')return ttsVoice;const vs=speechSynthesis.getVoices();if(!vs.length){return null;}
  const pref=['Google UK English Male','Microsoft Guy','Microsoft Ryan','Microsoft David','Daniel','Arthur','Alex','Fred','Microsoft Mark','Google US English'];
  for(const n of pref){const v=vs.find(v=>v.name.includes(n));if(v){ttsVoice=v;return v;}}ttsVoice=vs.find(v=>/^en/i.test(v.lang))||vs[0];return ttsVoice;}
function chantDrone(){if(!actx)return;for(const [f,v] of [[49,.05],[73.5,.04],[98,.035],[147,.018]])tone('sine',f,f*.995,v*(SET.voice/100),3.4);noiseHit(160,.02*(SET.voice/100),2.4);}
function speakLine(L){if(!SET.voice||typeof speechSynthesis==='undefined'||typeof SpeechSynthesisUtterance==='undefined')return null;
  try{const txt=L.text.replace(/—/g,', ').replace(/…/g,'... ').replace(/’/g,"'");const u=new SpeechSynthesisUtterance(txt);const V=VOICE[L.who]||(allies.find(a=>a.id===L.who)?{p:.75,r:.92}:VOICE.vox);
    u.pitch=V.p;u.rate=V.r;u.volume=Math.min(1,SET.voice/100);const v=pickVoice();if(v)u.voice=v;u.lang='en-GB';speechSynthesis.speak(u);if(L.force)chantDrone();return u;}catch(e){return null;}}
if(typeof speechSynthesis!=='undefined'&&speechSynthesis.addEventListener)speechSynthesis.addEventListener('voiceschanged',()=>{ttsVoice=null;pickVoice();});
// ---------------- 胜利动画：队友围拢、竖起军旗、镜头环绕后升上战场全景，“MISSION COMPLETE”
function victoryScene(done){const P=player.pos.clone(),yaw=player.yaw;const body=buildCharacter(cls);body.position.copy(P);body.rotation.y=yaw+Math.PI;scene.add(body);
  const live=allies.filter(a=>a.alive&&!a.vehicle&&!a.parked);live.forEach((a,i)=>{const ang=yaw+(i-(live.length-1)/2)*.34;const r=4.2+(i%2)*1.8;a.hold=P.clone().add(V3(Math.sin(ang)*r,0,Math.cos(ang)*r));a.pos.lerp(a.hold,.6);a.target=null;});
  for(const e of enemies)if(e.alive&&e.g.position.distanceTo(P)>8)e.stun=99;
  // 军旗：旗杆从地里升起，忠诚派的象牙白旗面 + 海绿镶边
  const flag=new THREE.Group();flag.position.copy(P).add(V3(-Math.sin(yaw)*1.6,-4.5,-Math.cos(yaw)*1.6));scene.add(flag);
  const pole=new THREE.Mesh(new THREE.CylinderGeometry(.06,.06,4.6,6),lmat(0x3a2a1a));pole.position.y=2.3;flag.add(pole);const top=new THREE.Mesh(new THREE.OctahedronGeometry(.22),lmat(0xc8a040));top.position.y=4.7;flag.add(top);
  const cloth=new THREE.Mesh(new THREE.PlaneGeometry(1.5,2.2,6,6),new THREE.MeshLambertMaterial({color:0xe8e0c8,side:THREE.DoubleSide}));cloth.position.set(.78,3.3,0);flag.add(cloth);
  const trim=new THREE.Mesh(new THREE.PlaneGeometry(1.5,.2),new THREE.MeshLambertMaterial({color:0x3c6e62,side:THREE.DoubleSide}));trim.position.set(.78,2.25,.01);flag.add(trim);
  const eye=new THREE.Mesh(new THREE.CircleGeometry(.32,16),new THREE.MeshLambertMaterial({color:0x1a1d1e,side:THREE.DoubleSide}));eye.position.set(.78,3.4,.01);flag.add(eye);
  const wave=k=>{const p=cloth.geometry.attributes.position;for(let i=0;i<p.count;i++){const x=p.getX(i)+.75;p.setZ(i,Math.sin(x*3-gameTime*4)*.12*x);}p.needsUpdate=true;};
  const orbit=(a,r,h)=>shotAt(P.clone().add(V3(Math.sin(a)*r,h,Math.cos(a)*r)),P.clone().add(V3(0,1.6,0)));
  runScene([
    {d:3.2,from:()=>orbit(yaw+Math.PI+.9,6.5,2.2),to:()=>orbit(yaw+Math.PI+.2,5.5,2),act(){play('choir');if(actx){chantDrone();}vox(meV(),'It is done. Brothers — to me.',true);},tick(dt){gameTime+=dt;wave();}},
    {d:3.4,from:()=>orbit(yaw+Math.PI+.25,4.6,1.5),to:()=>orbit(yaw+Math.PI-.45,4.4,1.35),act(){vox(live[0]?live[0].id:'ardan',act4()?'For the Gorgon! For Medusa!':'For the Emperor. For the Legion that was.',true);},tick(dt,k){gameTime+=dt;flag.position.y=P.y-4.5+Math.min(1,k*1.8)*4.5;wave();if(k<.5&&Math.random()<.3)dust(flag.position.clone().setY(0),2);}},
    {d:5.2,from:()=>orbit(yaw+Math.PI-.5,7,3),to:()=>shotAt(P.clone().add(V3(Math.sin(yaw+Math.PI-1.2)*26,22,Math.cos(yaw+Math.PI-1.2)*26)),P.clone().add(V3(0,1,0))),
      act(){titleCard('MISSION COMPLETE',(CAMP.L&&CAMP.L.title)||'',4.6);if(actx){tone('sine',220,220,.05,3.5);tone('sine',277,277,.04,3.5,.3);tone('sine',330,330,.04,3.5,.6);}},tick(dt){gameTime+=dt;wave();}}],
    ()=>{scene.remove(body);scene.remove(flag);for(const a of live)a.hold=null;if(done)done();});}
const _campaignWin=campaignWin;campaignWin=function(){CAMP.wp=null;const id=CAMP.id;
  if(id==='3-3')victoryScene(()=>CAMP.outro[id](()=>campEnd(true)));else CAMP.outro[id](()=>victoryScene(()=>campEnd(true)));};
// ---------------- Boss 强化
// 马尔克：7200 血；新招——砸地冲击波（红圈预警 1 秒）、扔三颗破甲手雷（落点预警）；二阶段带两名 Justaerin 风格精英，三阶段狂暴
const _malkAI=malkAI;malkAI=function(e,T,pp,to,dist,dt){e.slamCd=(e.slamCd??5)-dt;e.nadeCd=(e.nadeCd??8)-dt;
  if(e.slam>0){e.slam-=dt;e.parts.armR.rotation.x=-2.8;e.parts.armL.rotation.x=-2.8;if(e.slam<=0){const P=e.g.position.clone();ringAt(P.x,.2,P.z,0xff8030,.5,6,.45,.25);dust(P,24);play('boom');player.shake=Math.max(player.shake,.6);
      if(P.distanceTo(player.pos)<6&&state==='playing'){hurtPlayer(e.dmg*1.4,false,e);}for(const a of allies)if(a.alive&&a.pos.distanceTo(P)<6)allyHurt(a,e.dmg*1.2,e);}return true;}
  if(e.slamCd<=0&&dist<5){e.slamCd=e.phase===3?4:6;e.slam=1;ringAt(e.g.position.x,.1,e.g.position.z,0xff2010,6,6,1,.08);if(typeof vox==='function'&&Math.random()<.5)vox('malk','Kneel!');return true;}
  if(e.nadeCd<=0&&dist>6&&dist<22&&T){e.nadeCd=e.phase===3?6:9;for(let i=0;i<3;i++){const Q=T.pos.clone().add(V3((Math.random()-.5)*6,0,(Math.random()-.5)*6));ringAt(Q.x,.1,Q.z,0xff2010,2.6,2.6,1.4,.06);
      const g=new THREE.Mesh(new THREE.SphereGeometry(.14,6,4),lmat(0x2a2a2a));g.position.copy(e.g.position).setY(2.2);scene.add(g);(CAMP.fires=CAMP.fires||[]).push({m:g,a:g.position.clone(),b:Q,t:0,dur:1.2+i*.12,shell:true});}play('whoosh');}
  return _malkAI(e,T,pp,to,dist,dt);};
ENEMY_AI.malk=(e,T,pp,to,dist,dt)=>malkAI(e,T,pp,to,dist,dt);
// 马尔克带精英护卫：进入二阶段时额外空降一队
const _malkPhase=ENEMY_AI.malk;ENEMY_AI.malk=(e,T,pp,to,dist,dt)=>{if(e.phase===2&&!e.guards){e.guards=true;if(typeof traitorPods==='function'&&OPEN.on)traitorPods('soh',1,4,e.g.position);}return _malkPhase(e,T,pp,to,dist,dt);};
// 合唱团女主：血量 ×25，挨打会闪烁传送，三分之二和三分之一血时召唤民兵，尖啸更频繁更痛
const _singer=ENEMY_AI.warsinger;ENEMY_AI.warsinger=(e,T,pp,to,dist,dt)=>{if(e.mistress){const r=e.hp/e.maxHp;
    if(r<.66&&!e.s1){e.s1=true;mistressCall(e);}if(r<.33&&!e.s2){e.s2=true;mistressCall(e);}
    if((e.blinkDmg||0)>e.maxHp*.08&&!(e.scream>0)){e.blinkDmg=0;const a=Math.random()*6.28,Q=e.g.position.clone().add(V3(Math.cos(a)*9,0,Math.sin(a)*9));collide(Q,e.r);ringAt(e.g.position.x,1.5,e.g.position.z,0xb060ff,.3,3,.4,.2);puff(e.g.position.clone().setY(1.5),12,0xb060ff,1.4);e.g.position.copy(Q);ringAt(Q.x,1.5,Q.z,0xb060ff,3,.3,.4,.2);play('zap');}
    if(!(e.scream>0)&&e.singT>2.8)e.singT=2.8;}
  return _singer(e,T,pp,to,dist,dt);};
function mistressCall(e){if(typeof campSpawn==='function'){const [i,j]=cellOf(e.g.position);campSpawn('militia',i,j,5,{rmin:5,rmax:8});}if(typeof vox==='function')vox('tavik','She calls her faithful — cut them down!',true);play('choir');}
const _dmgEnemy=damageEnemy;damageEnemy=function(e,dmg,part,dir,opts={}){if(e&&e.mistress&&e.alive)e.blinkDmg=(e.blinkDmg||0)+dmg;return _dmgEnemy(e,dmg,part,dir,opts);};
// 女主在 13m 的第 7 步里生成：这里把她标成 mistress、加血
const _s31=CSTEPS['3-1'][6];CSTEPS['3-1'][6]={..._s31,update(dt){const r=_s31.update.call(this,dt);if(CAMP.boss&&!CAMP.boss.mistress){const b=CAMP.boss;b.mistress=true;b.maxHp=b.hp=b.maxHp/7*25;b.dmg*=1.25;}return r;}};
// ---------------- 战场环境：灯光跟着火堆、弹药自动拾取（战役以前跳过了这段）
function campAmbient(dt){if(Math.floor(gameTime*2)!==Math.floor((gameTime-dt)*2)&&candles.length){const near=candles.slice().sort((a,b)=>a.distanceToSquared(player.pos)-b.distanceToSquared(player.pos));candleLights.forEach((l,i)=>{if(near[i])l.position.copy(near[i]);});}
  candleLights.forEach((l,i)=>l.intensity=18+Math.sin(gameTime*9+i*3)*4+Math.random()*3);
  for(const it of interactables){if(it.used||it.type!=='ammo')continue;it.m.rotation.y+=dt*1.5;it.m.position.y=.8+Math.sin(gameTime*2+it.x)*.1;
    if(Math.hypot(it.x-player.pos.x,it.z-player.pos.z)<1.8&&state==='playing'){it.used=true;scene.remove(it.m);const W=WEAPONS[0];
      if(W&&!W.heat&&ammo[0]&&!(CLS[cls]&&CLS[cls].noPrimary)){const add=Math.ceil(W.magSize*1.2);ammo[0].res=Math.min(W.reserveMax,ammo[0].res+add);announce((W.en||W.name)+' ammo +'+add,1);}
      else if(ammo[1]){announce('Ammunition recovered',1);}play('pickup');}}}
const _updCamp2=updateCampaign;updateCampaign=function(dt){campAmbient(dt);_updCamp2(dt);};
