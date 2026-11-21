// ============================================================ 重击（按住左键）+ 新近战武器模型
// 每把近战武器：轻攻击 = COMBOS 里的连招；重击 = HEAVY 里的独特动作（蓄力时举起武器，松开释放）
const HEAVY={
  saw:   {p:'h',dm:2.2,k:'spin',  name:'Spin Saw'},
  power: {p:'a',dm:2.6,k:'line',  name:'Earth Splitter'},
  ssword:{p:'t',dm:0.8,k:'bash',  thrust:true,name:'Shield Bash'},
  hammer:{p:'hm3',dm:1.9,k:'quake', name:'Thunder Slam'},
  fist:  {p:'f4',dm:3.0,k:'crush', thrust:true,name:'Crush'},
  axe:   {p:'x3',dm:2.4,k:'behead',name:'Behead'}};
// 新武器自己的动作：幅度更大，彼此不同（锤：抡圆横扫 + 过顶砸；拳：直拳 / 勾拳 / 上勾；斧：过顶劈 / 反手上撩 / 整圈横斩）
Object.assign(POSE,{
  hm1:{start:[0.25,2.5,1.5],end:[0.05,-2.5,-1.3],ps:[.72,-.08,-.35],pe:[-.8,-.5,-.6]},
  hm2:{start:[0.1,-2.4,-1.4],end:[0.3,2.4,1.3],ps:[-.7,-.45,-.4],pe:[.85,-.2,-.6]},
  hm3:{start:[2.1,0.15,0.1],end:[-1.5,-0.1,0],ps:[.22,.38,-.3],pe:[0,-.85,-.8]},
  f1:{start:[0.15,0.05,0.1],end:[-0.05,0,-0.35],ps:[.4,-.38,-.05],pe:[.08,-.18,-1.05]},
  f2:{start:[0.1,1.1,0.2],end:[0,-1.0,-0.5],ps:[.7,-.3,-.4],pe:[-.5,-.22,-.8]},
  f3:{start:[1.1,0.1,0],end:[-1.3,0,0],ps:[.25,-.95,-.25],pe:[.05,.3,-.85]},
  f4:{start:[0.3,0.3,0.6],end:[-0.2,0,-0.2],ps:[.45,-.15,-.3],pe:[0,-.15,-1.2]},
  x1:{start:[1.7,0.9,0.7],end:[-1.4,-0.7,-0.6],ps:[.55,.3,-.35],pe:[-.25,-.8,-.65]},
  x2:{start:[-1.3,-1.5,-0.9],end:[1.2,1.4,1.1],ps:[-.42,-.65,-.45],pe:[.7,.12,-.6]},
  x3:{start:[0.1,2.7,0.35],end:[0.1,-2.7,-0.35],ps:[.75,-.25,-.35],pe:[-.85,-.3,-.5]}});
Object.assign(COMBOS,{
  hammer:[{p:'hm1',dm:1,name:'Wide sweep'},{p:'hm2',dm:1.1,name:'Back sweep'},{p:'hm3',dm:1.6,fin:true,name:'Overhead smash'}],
  fist:[{p:'f1',dm:.8,thrust:true,name:'Cross'},{p:'f2',dm:1.1,name:'Hook'},{p:'f3',dm:1.6,fin:true,name:'Uppercut'}],
  axe:[{p:'x1',dm:1,name:'Overhead chop'},{p:'x2',dm:1.1,name:'Rising backhand'},{p:'x3',dm:1.4,bite:true,biteDur:.35,name:'Spin Saw'}]});
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
{const steel=new THREE.MeshLambertMaterial({map:texMetal,color:0xb8b0a0}),dark=new THREE.MeshLambertMaterial({color:0x2a1a12}),gold=new THREE.MeshLambertMaterial({color:0xb8952e,emissive:0x1a1000});
 const add=(w,h,d,x,y,z,m,rx=0)=>{const b=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);b.position.set(x,y,z);b.rotation.x=rx;axeG.add(b);return b;};
 add(.06,.06,1.15,0,0,-.42,dark);for(const z of [-.05,-.2,.1])add(.075,.075,.04,0,0,z,gold);           // 握柄 + 缠金箍
 add(.16,.18,.2,0,0,-.86,gunDark);add(.04,.04,.12,.09,.06,-.82,gunMat);                              // 中央锯链引擎
 for(const sy of [1,-1]){                                                                             // 两面月牙斧刃
   add(.05,.16,.3,0,sy*.17,-.86,steel);add(.045,.14,.42,0,sy*.31,-.86,steel);add(.04,.1,.52,0,sy*.42,-.86,steel);
   add(.05,.04,.56,0,sy*.49,-.86,chainMat);add(.05,.12,.04,0,sy*.44,-.6,chainMat,sy*.5);add(.05,.12,.04,0,sy*.44,-1.12,chainMat,-sy*.5);}
 add(.05,.05,.28,0,0,-1.1,steel);add(.03,.03,.1,0,0,-1.27,gold);}                                     // 顶部尖刺
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
    for(let i=1;i<8;i++)embersBlue(player.pos.clone().addScaledVector(fwd,i).setY(.3),3);play('zap');play('boom');fxSend('line',{x:player.pos.x,z:player.pos.z,fx:fwd.x,fz:fwd.z});}
  else if(st.k==='bash'){for(const e of front(3.2,0.3)){damageEnemy(e,base,'body',fwd,{stagger:1,knock:3.5,point:contactPoint(e)});stunE(e,1.6);hit++;}play('clang');}
  else if(st.k==='quake'){const P=player.pos.clone().addScaledVector(fwd,2);
    for(const e of enemies){if(!e.alive)continue;const d=Math.hypot(e.g.position.x-P.x,e.g.position.z-P.z);if(d>4.8)continue;
      const dir=e.g.position.clone().sub(P).setY(0).normalize();kill=damageEnemy(e,base*(1-d/9.6),'body',dir,{stagger:1,knock:3,point:contactPoint(e),how:{burst:{p:contactPoint(e),dir}}})||kill;if(e.alive)stunE(e,1.3);hit++;}
    slamFx(P.x,P.z);embersBlue(P.clone().setY(.4),20);play('zap');fxSend('slam',{x:P.x,z:P.z});}
  else if(st.k==='crush'){const e=front(2.8,0.5)[0];if(e){const p=contactPoint(e);const can=!e.boss&&(!e.elite||e.hp<=e.maxHp*0.5);
      kill=damageEnemy(e,can?99999:base,'body',fwd,{stagger:1,knock:.5,point:p,how:{burst:{p,dir:fwd}}});spawnBlood(p,fwd,40);hit++;play('rip');}}
  else if(st.k==='behead'){for(const e of front(3.2,0.4)){const p=e.g.position.clone().setY(1.95*e.g.scale.y);
      kill=damageEnemy(e,base,'head',fwd,{stagger:.8,knock:1,point:p,how:{headBurst:true}})||kill;sprayAlongChain(p,18);hit++;}play('grind');}
  if(hit){meleeSound(M,true);hitstop=0.14;player.shake=Math.max(player.shake,.5);player.punch=.1;splat();showHit(kill);}else play('whoosh');
}

// ---------- 链锯战斧音效：沉重斧劈（低频重击 + 骨裂 + 金属余震）+ 低沉锯链咬肉
Object.assign(sfx,{
  axeSwing(){noiseHit(380,0.32,0.38,'bandpass');tone('sine',95,55,0.18,0.32);},
  axeChop(){tone('sine',85,30,1.0,0.45);noiseHit(320,0.9,0.4);noiseHit(2600,0.45,0.08,'highpass');tone('square',160,70,0.25,0.18);
    noiseHit(5200,0.25,0.05,'highpass',0.03);tone('triangle',620,560,0.12,0.6,0.02);},
  axeBite(){noiseHit(900,0.55,0.3,'bandpass');tone('sawtooth',70,110,0.35,0.3);noiseHit(180,0.5,0.35);tone('square',140,90,0.18,0.25);}});
