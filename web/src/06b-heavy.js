// ============================================================ 重击（按住左键）+ 新近战武器模型
// 每把近战武器：轻攻击 = COMBOS 里的连招；重击 = HEAVY 里的独特动作（蓄力时举起武器，松开释放）
const HEAVY={
  saw:   {p:'h',dm:2.2,k:'spin',  name:'回旋锯斩'},
  power: {p:'a',dm:2.6,k:'line',  name:'裂地斩'},
  ssword:{p:'t',dm:0.8,k:'bash',  thrust:true,name:'盾击'},
  hammer:{p:'a',dm:1.9,k:'quake', name:'雷霆砸地'},
  fist:  {p:'t',dm:3.0,k:'crush', thrust:true,name:'捏碎'},
  axe:   {p:'h',dm:2.4,k:'behead',name:'斩首'}};
Object.assign(COMBOS,{
  hammer:[{p:'a',dm:1,name:'横扫'},{p:'r',dm:1.1,name:'回扫'},{p:'u',dm:1.5,fin:true,name:'上撩'}],
  fist:[{p:'t',dm:.8,thrust:true,name:'刺拳'},{p:'t',dm:1,thrust:true,name:'直拳'},{p:'u',dm:1.6,fin:true,name:'上勾拳'}],
  axe:[{p:'a',dm:1,name:'斜劈'},{p:'r',dm:1.1,name:'回劈'},{p:'h',dm:1.3,bite:true,biteDur:.4,name:'锯入'}]});
// ---------- 模型
const hammerG=new THREE.Group();view.add(hammerG);hammerG.visible=false;
{const hd=new THREE.Mesh(new THREE.BoxGeometry(.36,.26,.26),new THREE.MeshLambertMaterial({map:texMetal,color:0x8a8a9a}));hd.position.z=-.95;hammerG.add(hd);
 for(const x of [-.19,.19]){const f=new THREE.Mesh(new THREE.BoxGeometry(.02,.2,.2),powMat);f.position.set(x,0,-.95);hammerG.add(f);}
 const h=new THREE.Mesh(new THREE.BoxGeometry(.06,.06,1),new THREE.MeshLambertMaterial({color:0x2a1a12}));h.position.z=-.4;hammerG.add(h);
 const c=new THREE.Mesh(new THREE.BoxGeometry(.1,.1,.08),new THREE.MeshLambertMaterial({color:0xb8952e}));c.position.z=-.78;hammerG.add(c);}
const fistG=new THREE.Group();view.add(fistG);fistG.visible=false;
{const m=new THREE.MeshLambertMaterial({map:texMetal,color:0x6a5a4a});const g=new THREE.Mesh(new THREE.BoxGeometry(.3,.3,.42),m);g.position.z=-.3;fistG.add(g);
 for(let i=0;i<4;i++){const f=new THREE.Mesh(new THREE.BoxGeometry(.06,.08,.16),m);f.position.set(-.1+i*.067,.08,-.57);fistG.add(f);}
 const glow=new THREE.Mesh(new THREE.BoxGeometry(.32,.04,.44),powMat);glow.position.set(0,-.16,-.3);fistG.add(glow);
 const cuff=new THREE.Mesh(new THREE.BoxGeometry(.24,.24,.2),new THREE.MeshLambertMaterial({color:0xb8952e}));cuff.position.z=-.02;fistG.add(cuff);}
const axeG=new THREE.Group();view.add(axeG);axeG.visible=false;
{const h=new THREE.Mesh(new THREE.BoxGeometry(.07,.07,1.05),new THREE.MeshLambertMaterial({color:0x2a1a12}));h.position.z=-.45;axeG.add(h);
 const b=new THREE.Mesh(new THREE.BoxGeometry(.05,.4,.34),new THREE.MeshLambertMaterial({map:texMetal,color:0xa09080}));b.position.set(0,.16,-.88);axeG.add(b);
 const e=new THREE.Mesh(new THREE.BoxGeometry(.06,.05,.36),chainMat);e.position.set(0,.37,-.88);axeG.add(e);
 const eng=new THREE.Mesh(new THREE.BoxGeometry(.14,.16,.18),gunDark);eng.position.set(0,0,-.7);axeG.add(eng);}
Object.assign(MELEE_GROUP,{hammer:hammerG,fist:fistG,axe:axeG});
applyLoadout();
// ---------- 输入：按下开始计时；短按 = 轻攻击，按住超过 heavyHold 秒 = 蓄力重击
const hold={t:0,on:false,charged:false};
function meleePress(){if(ex.active||player.revving)return;hold.on=true;hold.t=0;hold.charged=false;}
function meleeRelease(){if(!hold.on)return;hold.on=false;if(hold.charged)heavyAttack();else melee();hold.charged=false;}
function updateHold(dt){if(!hold.on)return;if(cur!==2||activeGun()){hold.on=false;return;}hold.t+=dt;
  if(!hold.charged&&hold.t>=CFG.heavyHold&&MS.phase==='none'&&player.meleeCd<=0){hold.charged=true;play('charge');MS.step=HEAVY[WEAPONS[2].id];MS.phase='charge';swordOut=1.4;swing=1;}
  if(hold.charged){MS.t=0;const k=Math.min(1,hold.t/0.6);blendPose(POSE.rest,POSE.restPos,poseAt(0),posAt(0),0.6+0.4*k,1.25);sword.position.x+=(Math.random()-.5)*0.01*k;}}
function heavyAttack(){const M=WEAPONS[2];const st=HEAVY[M.id];if(!st)return melee();player.didHeavy=true;
  MS.step=st;MS.dir=stepDir();MS.counter=false;MS.phase='windup';MS.t=M.windup*0.6;MS.s=0;MS.hitDone=false;MS.combo=0;
  player.meleeCd=(M.windup+M.slash)*1.6+0.25;swordOut=1.4;swing=1;}
// ---------- 重击效果（在挥到一半时调用）
function stunE(e,d){e.stun=Math.max(e.stun,d);if(isClient()&&e.remote)sendNet({t:'stun',id:e.id,dur:d});}
function doHeavy(M,st){const fwd=fwdFlat(),right=new THREE.Vector3(Math.cos(player.yaw),0,-Math.sin(player.yaw)),base=M.dmg*st.dm*fieldMul();
  const near=(r)=>enemies.filter(e=>e.alive&&!e.lifted&&e.g.position.distanceTo(player.pos)<r+e.r);let hit=0,kill=false;
  const front=(r,c)=>meleeCandidates(r,c);
  if(st.k==='spin'){for(const e of near(3.4)){const p=contactPoint(e);kill=damageEnemy(e,base,'body',e.g.position.clone().sub(player.pos).setY(0).normalize(),{stagger:.8,knock:2,point:p,how:{cut:{p:p.clone().setY(1.05*e.g.scale.y),n:new THREE.Vector3(0,1,0),imp:6}}})||kill;sprayAlongChain(p,14);hit++;}play('grind');play('rip');}
  else if(st.k==='line'){for(const e of enemies){if(!e.alive)continue;const to=e.g.position.clone().sub(player.pos).setY(0);const a=to.dot(fwd),lat=Math.abs(to.dot(right));
      if(a>0&&a<8&&lat<1.3+e.r){const p=contactPoint(e);kill=damageEnemy(e,base*(1-a/16),'body',fwd,{stagger:.9,knock:1,point:p,how:{cut:{p,n:right.clone(),imp:5}}})||kill;hit++;}}
    for(let i=1;i<8;i++)embersBlue(player.pos.clone().addScaledVector(fwd,i).setY(.3),3);play('zap');play('boom');}
  else if(st.k==='bash'){for(const e of front(3.2,0.3)){damageEnemy(e,base,'body',fwd,{stagger:1,knock:3.5,point:contactPoint(e)});stunE(e,1.6);hit++;}play('clang');}
  else if(st.k==='quake'){const P=player.pos.clone().addScaledVector(fwd,2);
    for(const e of enemies){if(!e.alive)continue;const d=Math.hypot(e.g.position.x-P.x,e.g.position.z-P.z);if(d>4.8)continue;
      const dir=e.g.position.clone().sub(P).setY(0).normalize();kill=damageEnemy(e,base*(1-d/9.6),'body',dir,{stagger:1,knock:3,point:contactPoint(e),how:{burst:{p:contactPoint(e),dir}}})||kill;if(e.alive)stunE(e,1.3);hit++;}
    slamFx(P.x,P.z);embersBlue(P.clone().setY(.4),20);play('zap');}
  else if(st.k==='crush'){const e=front(2.8,0.5)[0];if(e){const p=contactPoint(e);const can=!e.boss&&(!e.elite||e.hp<=e.maxHp*0.5);
      kill=damageEnemy(e,can?99999:base,'body',fwd,{stagger:1,knock:.5,point:p,how:{burst:{p,dir:fwd}}});spawnBlood(p,fwd,40);hit++;play('rip');}}
  else if(st.k==='behead'){for(const e of front(3.2,0.4)){const p=e.g.position.clone().setY(1.95*e.g.scale.y);
      kill=damageEnemy(e,base,'head',fwd,{stagger:.8,knock:1,point:p,how:{headBurst:true}})||kill;sprayAlongChain(p,18);hit++;}play('grind');}
  if(hit){meleeSound(M,true);hitstop=0.14;player.shake=Math.max(player.shake,.5);player.punch=.1;splat();showHit(kill);}else play('whoosh');
}
