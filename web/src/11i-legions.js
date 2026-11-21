// ============================================================ 大叛乱：叛军星际战士（荷鲁斯之子 / 吞世者 / 帝皇之子）、伊斯塔万民兵、战歌者、马尔克中士
// 模型在基础敌人的六个部位上改形（仍是盒子，所以断肢、切割、处决全部照常工作）；细节挂在部位下面，断肢时一起飞出去。
const LEG={
  soh:{armor:0x3a6e62,trim:0x15191a,metal:0x7a5e26,eye:0xff2a10},
  we: {armor:0xd8d4c8,trim:0x24448a,metal:0x8a8a8a,eye:0xff2a10},
  ec: {armor:0x5c2470,trim:0x8a6a22,metal:0x9a7a2a,eye:0xff50d0},
  malk:{armor:0x3a6e62,trim:0x15191a,metal:0x8a6a2a,eye:0xffa020}};
const LMAT={};function lmat(c,basic){const k=c+(basic?'b':'');return LMAT[k]||(LMAT[k]=basic?new THREE.MeshBasicMaterial({color:c}):new THREE.MeshLambertMaterial({color:c}));}
function stripPart(m){while(m.children.length)m.remove(m.children[0]);}
function addTo(p,geo,mat,x,y,z,rx=0,ry=0,rz=0){const m=new THREE.Mesh(geo,mat);m.position.set(x,y,z);m.rotation.set(rx,ry,rz);m.userData.part='deco';p.add(m);return m;}
const B3=(w,h,d)=>new THREE.BoxGeometry(w,h,d);
// ---- 武器（挂在手臂下方，沿手臂 -y 方向；手臂抬平时枪口朝前）
function gunBolter(arm,big){const g=new THREE.Group();g.position.set(0,-.5,.14);arm.add(g);const k=big?1.25:1,d=lmat(0x1a1a1c),m=lmat(0x6a5a3a);
  addTo(g,B3(.15*k,.66*k,.22*k),d,0,-.12,0);addTo(g,B3(.11*k,.16*k,.2*k),m,0,.06,-.16);addTo(g,new THREE.CylinderGeometry(.045*k,.05*k,.32*k,8),d,0,-.56*k,.02);
  addTo(g,B3(.06,.12,.06),d,0,-.18,.16);addTo(g,B3(.05,.2,.05),m,0,.02,.14);const mz=new THREE.Object3D();mz.position.set(0,-.74*k,.02);g.add(mz);return mz;}
function gunLas(arm){const g=new THREE.Group();g.position.set(0,-.45,.12);arm.add(g);const w=lmat(0x4a3a24),d=lmat(0x222222);
  addTo(g,B3(.09,.7,.14),w,0,-.15,0);addTo(g,new THREE.CylinderGeometry(.03,.03,.3,6),d,0,-.6,.02);addTo(g,B3(.06,.14,.1),d,0,.05,-.1);const mz=new THREE.Object3D();mz.position.set(0,-.76,.02);g.add(mz);return mz;}
function chainAxe(arm){const g=new THREE.Group();g.position.set(0,-.52,.08);arm.add(g);
  addTo(g,new THREE.CylinderGeometry(.04,.04,.7,6),lmat(0x2a2a2a),0,-.25,0);const h=addTo(g,B3(.08,.5,.42),lmat(0x9a9a9a),0,-.6,.18);
  for(let i=0;i<6;i++)addTo(g,B3(.09,.05,.06),lmat(0x3a3a3a),0,-.38-i*.08,.4);addTo(g,B3(.1,.18,.16),lmat(0x24448a),0,-.42,-.02);return h;}
function powerSword(arm){const g=new THREE.Group();g.position.set(0,-.5,.08);arm.add(g);
  addTo(g,B3(.06,.22,.06),lmat(0x2a1a10),0,0,0);addTo(g,B3(.34,.05,.08),lmat(0xd0a838),0,-.12,0);
  const bl=addTo(g,B3(.05,1.1,.12),new THREE.MeshBasicMaterial({color:0xd8c8ff}),0,-.7,0);addTo(g,B3(.02,1.08,.14),lmat(0x8a6aff,true),0,-.7,0);return bl;}
function chainSword(arm){const g=new THREE.Group();g.position.set(0,-.5,.08);arm.add(g);addTo(g,B3(.07,.24,.07),lmat(0x1a1a1a),0,0,0);
  addTo(g,B3(.06,.9,.16),lmat(0x8a8a8a),0,-.56,.02);for(let i=0;i<8;i++)addTo(g,B3(.07,.05,.05),lmat(0x2a2a2a),0,-.2-i*.1,.12);}
// ---- 星际战士外形
function restyleMarine(e,L,opt={}){const A=new THREE.MeshLambertMaterial({map:texMetal,color:L.armor});e.mat=A;const P=e.parts,T=lmat(L.trim),M=lmat(L.metal),EYE=lmat(L.eye,true);
  const set=(p,w,h,d,x,y,z)=>{stripPart(p);p.geometry=B3(w,h,d);p.material=A;p.position.set(x,y,z);p.rotation.set(0,0,0);};
  set(P.body,1.0,1.02,.66,0,1.3,0);set(P.head,.44,.46,.5,0,2.1,.02);set(P.armL,.3,.9,.32,-.7,1.32,.04);set(P.armR,.3,.9,.32,.7,1.32,.04);set(P.legL,.36,.9,.4,-.27,.46,0);set(P.legR,.36,.9,.4,.27,.46,0);
  // 躯干：胸甲、腰带、背包与排气管、军团徽记
  addTo(P.body,B3(.72,.34,.06),T,0,.22,.34);addTo(P.body,B3(1.04,.16,.7),T,0,-.44,0);addTo(P.body,B3(.88,.8,.42),A,0,.12,-.52);
  for(const s of [-1,1])addTo(P.body,new THREE.CylinderGeometry(.08,.1,.32,8),M,s*.24,.62,-.6);
  if(opt.legion==='soh'){addTo(P.body,new THREE.CylinderGeometry(.11,.11,.03,12),lmat(0xd04010,true),0,.22,.38,Math.PI/2);addTo(P.body,new THREE.CylinderGeometry(.045,.045,.04,8),lmat(0x0a0a0a),0,.22,.4,Math.PI/2);}
  if(opt.legion==='ec'){for(const s of [-1,1]){const w=addTo(P.body,B3(.32,.07,.04),M,s*.18,.3,.38);w.rotation.z=s*.35;}addTo(P.body,B3(.08,.16,.05),M,0,.22,.38);}
  if(opt.legion==='we'){addTo(P.body,B3(.16,1.0,.05),T,0,0,.34);}
  // 头盔：红色目镜、呼吸格栅、Mk IV 脊冠
  addTo(P.head,B3(.13,.06,.04),EYE,-.1,.04,.26);addTo(P.head,B3(.13,.06,.04),EYE,.1,.04,.26);addTo(P.head,B3(.2,.13,.06),M,0,-.12,.26);addTo(P.head,B3(.07,.07,.46),A,0,.25,0);
  if(opt.legion==='ec')addTo(P.head,B3(.05,.2,.5),M,0,.34,-.02);if(opt.legion==='we')addTo(P.head,B3(.1,.47,.52),T,0,0,0).scale.set(1,1,1);
  if(opt.plume)addTo(P.head,B3(.07,.22,.5),lmat(opt.plume),0,.36,-.05);
  // 手臂：大肩甲（带金边）、肘护、护手
  for(const arm of [P.armL,P.armR]){const pa=addTo(arm,new THREE.SphereGeometry(.32,10,6,0,Math.PI*2,0,Math.PI/2),A,0,.36,0);pa.scale.set(1.15,.85,1.2);
    addTo(arm,new THREE.TorusGeometry(.33,.03,4,14),M,0,.36,0,Math.PI/2).scale.set(1.15,1.2,1);addTo(arm,B3(.34,.26,.36),T,0,-.36,.02);addTo(arm,B3(.2,.14,.08),T,0,0,.17);}
  if(opt.legion==='soh')addTo(P.armL,new THREE.CylinderGeometry(.1,.1,.03,12),lmat(0xd04010,true),-.2,.38,0,0,0,Math.PI/2);
  // 腿：护膝、战靴
  for(const lg of [P.legL,P.legR]){addTo(lg,B3(.38,.2,.1),T,0,.06,.21);addTo(lg,B3(.4,.22,.52),T,0,-.36,.06);}
  e.growl=1e9;e.marine=true;}
function restyleMilitia(e){const A=new THREE.MeshLambertMaterial({map:texMetal,color:0x5a5444});e.mat=A;const P=e.parts,D=lmat(0x2a2620),G=lmat(0x3a4030);
  const set=(p,w,h,d,x,y,z)=>{stripPart(p);p.geometry=B3(w,h,d);p.material=A;p.position.set(x,y,z);};
  set(P.body,.7,.8,.42,0,1.15,0);set(P.head,.34,.36,.36,0,1.78,0);set(P.armL,.18,.75,.2,-.47,1.15,0);set(P.armR,.18,.75,.2,.47,1.15,0);set(P.legL,.24,.8,.26,-.18,.4,0);set(P.legR,.24,.8,.26,.18,.4,0);
  addTo(P.body,B3(.74,.3,.46),G,0,.1,0);addTo(P.body,B3(.5,.4,.2),D,0,.05,-.3);addTo(P.head,B3(.4,.14,.42),G,0,.16,0);addTo(P.head,B3(.22,.14,.08),D,0,-.08,.2);
  addTo(P.head,B3(.08,.06,.03),lmat(0xffa030,true),-.07,.0,.19);addTo(P.head,B3(.08,.06,.03),lmat(0xffa030,true),.07,.0,.19);for(const l of [P.legL,P.legR])addTo(l,B3(.26,.2,.36),D,0,-.32,.05);
  e.growl=1e9;e.human=true;}
function restyleSinger(e){const A=new THREE.MeshLambertMaterial({color:0xd8d0c0});e.mat=A;const P=e.parts,R=lmat(0x6a1a2a),Gd=lmat(0xc8a040);
  const set=(p,w,h,d,x,y,z)=>{stripPart(p);p.geometry=B3(w,h,d);p.material=A;p.position.set(x,y,z);};
  set(P.body,.58,.9,.36,0,1.4,0);set(P.head,.3,.36,.32,0,2.05,0);set(P.armL,.13,.8,.14,-.4,1.45,0);set(P.armR,.13,.8,.14,.4,1.45,0);set(P.legL,.2,.8,.2,-.12,.45,0);set(P.legR,.2,.8,.2,.12,.45,0);
  const skirt=addTo(P.body,new THREE.CylinderGeometry(.3,.62,1.15,10,1,true),R,0,-.75,0);skirt.material=new THREE.MeshLambertMaterial({color:0x6a1a2a,side:THREE.DoubleSide});
  addTo(P.body,B3(.62,.2,.4),Gd,0,.3,0);addTo(P.head,B3(.36,.46,.2),lmat(0x1a1010),0,.02,-.12);addTo(P.head,new THREE.TorusGeometry(.2,.025,4,14),Gd,0,.22,0,Math.PI/2);
  e.throat=addTo(P.head,B3(.12,.06,.04),new THREE.MeshBasicMaterial({color:0xb060ff}),0,-.1,.17);for(const s of [-1,1])addTo(P.head,B3(.06,.03,.02),lmat(0xe0c0ff,true),s*.07,.03,.17);
  e.growl=1e9;e.human=true;e.hover=true;}
Object.assign(ENEMY_BUILD,{
  soh:e=>{restyleMarine(e,LEG.soh,{legion:'soh'});e.muzzle=gunBolter(e.parts.armR);},
  we:e=>{restyleMarine(e,LEG.we,{legion:'we'});chainAxe(e.parts.armR);chainAxe(e.parts.armL);e.growl=3+Math.random()*4;},
  ec:e=>{restyleMarine(e,LEG.ec,{legion:'ec'});powerSword(e.parts.armR);e.muzzle=gunLas(e.parts.armL);e.onHit=duelistGuard;},
  militia:e=>{restyleMilitia(e);e.muzzle=gunLas(e.parts.armR);},
  warsinger:e=>{restyleSinger(e);},
  malk:e=>{restyleMarine(e,LEG.malk,{legion:'soh',plume:0x8a1010});chainSword(e.parts.armR);e.muzzle=gunBolter(e.parts.armL);e.named='Sergeant Oren Malk';e.phase=1;}});
// ============================================================ 敌我弹道（爆弹 / 激光）：可见的曳光弹，墙会挡，按阵营判定命中
let ebolts=[];
const EWEAP={
  bolter:{speed:58,spread:.035,kind:'bolt',color:0xffa040,len:.7,snd:'bolter'},
  las:   {speed:85,spread:.05,kind:'las',color:0xff3018,len:1.3,snd:'zap'},
  pistol:{speed:58,spread:.03,kind:'bolt',color:0xffb050,len:.6,snd:'pistol'},
  heavy: {speed:62,spread:.05,kind:'bolt',color:0xffc060,len:.9,snd:'bolter'}};
let eSndT=0;
function fireBolt(from,aim,W,team,dmg,src){const d=aim.clone().sub(from);const L=d.length();d.normalize();
  d.x+=(Math.random()-.5)*W.spread*2;d.y+=(Math.random()-.5)*W.spread;d.z+=(Math.random()-.5)*W.spread*2;d.normalize();
  const m=new THREE.Mesh(B3(.06,.06,W.len),lmat(W.color,true));m.position.copy(from);m.lookAt(from.clone().add(d));scene.add(m);
  ebolts.push({m,p:from.clone(),v:d.multiplyScalar(W.speed),life:1.4,dmg,team,src,W});
  const fl=new THREE.Mesh(new THREE.SphereGeometry(.12,6,4),lmat(W.color,true));fl.position.copy(from);scene.add(fl);beams.push({m:fl,life:.05});
  if(eSndT<=0&&from.distanceTo(player.pos)<30){eSndT=.06;play(W.snd);}}
function enemyShoot(e,T,W){if(!e.muzzle)return;const from=new THREE.Vector3();e.muzzle.getWorldPosition(from);
  const aim=T.pos.clone();aim.y=(T.pos.y||0)+(T.ally&&T.ally.big?2.2:1.25);if(T.local){aim.addScaledVector(player.vel||new THREE.Vector3(),.12);}
  fireBolt(from,aim,W,'chaos',e.dmg,e);}
function damageTarget(T,n,e,psy){if(!T)return;if(hitTarget(T,n,e))return;if(T.remote)sendTo(T.remote.id,{t:'hurt',n,att:e?e.id:null,psy:psy?1:0});else hurtPlayer(n,false,e);}
function updateEbolts(dt){eSndT-=dt;
  for(const b of ebolts){const step=b.v.clone().multiplyScalar(dt),L=step.length(),dir=step.clone().divideScalar(L||1),prev=b.p.clone();
    const w=castRayWalls(prev,dir,L);let hitLen=w?w.distance:L,hit=null;
    if(b.team==='chaos'){
      if(state==='playing'&&player.hp>0){const c=player.pos.clone();c.y+=1.2;const t=segT(prev,dir,hitLen,c,.6);if(t!==null){hit={kind:'player',t};hitLen=t;}}
      for(const a of allies){if(!a.alive)continue;const c=a.pos.clone();c.y+=a.big?2:1.25;const t=segT(prev,dir,hitLen,c,a.big?1.3:.6);if(t!==null){hit={kind:'ally',a,t};hitLen=t;}}}
    else for(const e of enemies){if(!e.alive||e===b.src)continue;const s=e.g.scale.y;const c=e.g.position.clone();c.y+=1.25*s;const t=segT(prev,dir,hitLen,c,.55*s+.1);if(t!==null){hit={kind:'enemy',e,t};hitLen=t;}}
    b.p.addScaledVector(dir,hitLen);b.m.position.copy(b.p);b.life-=dt;
    if(hit){const P=b.p.clone();
      if(hit.kind==='player'){hurtPlayer(b.dmg,false,b.src&&b.src.alive?b.src:null);}
      else if(hit.kind==='ally'){allyHurt(hit.a,b.dmg,b.src);}
      else{const e=hit.e,head=P.y>e.g.position.y+1.85*e.g.scale.y;const k=damageEnemy(e,b.dmg,head?'head':'body',dir,{_remote:true,point:P,knock:.25,stagger:.12});if(k&&b.W.kind==='bolt'&&Math.random()<.35)e.g.updateMatrixWorld();}
      boltPop(P,dir,b.W);if(b.W.splash)shellBlast(P,b);b.life=0;}
    else if(w){boltPop(b.p.clone(),dir,b.W,w.face&&w.face.normal);if(b.W.splash)shellBlast(b.p.clone(),b);b.life=0;}
    else if(b.W.splash&&(b.p.y<.25||b.life<=0)){b.p.y=Math.max(b.p.y,.2);shellBlast(b.p.clone(),b);b.life=0;}
    if(b.life<=0)scene.remove(b.m);}
  ebolts=ebolts.filter(b=>b.life>0);}
function segT(o,d,len,c,r){const oc=c.clone().sub(o);const t=oc.dot(d);if(t<0||t>len)return null;const q=o.clone().addScaledVector(d,t);return q.distanceTo(c)<r?t:null;}
function boltPop(P,dir,W){hitSparks(P,dir.clone().negate(),W.kind==='las'?3:5);if(W.kind==='bolt'){puff(P,2,0x6a5a4a,.8);if(P.distanceTo(player.pos)<18&&Math.random()<.5)play('boltBoom');}}
function clearEbolts(){for(const b of ebolts)scene.remove(b.m);ebolts=[];}
// ============================================================ AI
function aimPose(e,k){const R=e.parts.armR,L=e.parts.armL;if(R.parent===e.g){R.rotation.x=-1.5*k;R.rotation.z=-.08*k;}if(L.parent===e.g){L.rotation.x=-1.25*k;L.rotation.z=.5*k;}e.parts.body.rotation.y=-.12*k;}
function walkLegs(e,sp,dt){e.walk+=dt*sp*2;e.parts.legL.rotation.x=Math.sin(e.walk)*.55;e.parts.legR.rotation.x=-Math.sin(e.walk)*.55;}
// 射手：保持距离、左右移动、三连发
function shooterAI(e,T,pp,to,dist,dt,W,band,burst,cool,interval){
  if(!e.muzzle||!T||(e.muzzle.parent&&!isAttached(e,e.muzzle)))return false;
  if(dist<e.reach+.4){aimPose(e,0);return false;}
  const see=hasLOS(e,pp),inRange=see&&dist<band[1]+8;e.aimK=lerp(e.aimK||0,inRange?1:0,Math.min(1,dt*5));aimPose(e,e.aimK);
  if(!inRange)return false;
  const side=new THREE.Vector3(-to.z,0,to.x).normalize().multiplyScalar(Math.sin(gameTime*.55+e.id*1.7)*.8);
  const fwd=to.clone().normalize().multiplyScalar(dist>band[1]?1:dist<band[0]?-1:0);const mv=fwd.add(side);
  if(mv.lengthSq()>.04){const sp=e.speed*(e.burst>0?.3:.65)*(e.legsLost?.5:1)*(e.slowT>0?.5:1);e.g.position.addScaledVector(steer(e,mv.normalize(),dt),sp*dt);walkLegs(e,sp,dt);collide(e.g.position,e.r);}
  e.fireCd=(e.fireCd??(.8+Math.random()*1.6))-dt;
  if(e.burst>0){e.shotT-=dt;if(e.shotT<=0){e.shotT=interval;e.burst--;enemyShoot(e,T,W);e.parts.armR.rotation.x-=.15;}}
  else if(e.fireCd<=0&&e.aimK>.8){e.burst=burst;e.shotT=0;e.fireCd=cool[0]+Math.random()*(cool[1]-cool[0]);}
  return true;}
function isAttached(e,o){let p=o;while(p){if(p===e.g)return true;p=p.parent;}return false;}
// 冲锋跳劈（吞世者、马尔克共用）
function leapUpdate(e,T,dt){const L=e.leap;L.t+=dt;const k=Math.min(1,L.t/L.dur);e.g.position.copy(L.from).lerp(L.to,k);e.g.position.y=Math.sin(k*Math.PI)*1.6;
  e.parts.armR.rotation.x=e.parts.armL.rotation.x=-2.6+k*2.6;
  if(k>=1){e.g.position.y=0;e.leap=null;collide(e.g.position,e.r);dust(e.g.position,10);if(e.g.position.distanceTo(player.pos)<14){play('boom');player.shake=Math.max(player.shake,.3);}
    if(T&&Math.hypot(T.pos.x-e.g.position.x,T.pos.z-e.g.position.z)<2.6)damageTarget(T,e.dmg*1.3,e);}}
function startLeap(e,pp){const to=pp.clone().setY(0);const d=to.clone().sub(e.g.position).setY(0);{const L=d.length();if(L>0.01)d.multiplyScalar(Math.max(0,L-1.4)/L);}e.leap={t:0,dur:.55,from:e.g.position.clone(),to:e.g.position.clone().add(d)};play('whoosh');}
// 帝皇之子：正面挡下玩家的普通近战并反击，重击 / 背后 / 处决可破防
function duelistGuard(e,dmg,dir,opts){if((e.parryCd||0)>0||e.stun>0||!dir||opts._remote)return dmg;
  const W=WEAPONS[cur];if(!W||!W.melee||e.g.position.distanceTo(player.pos)>4.5)return dmg;
  const fwd=new THREE.Vector3(Math.sin(e.g.rotation.y),0,Math.cos(e.g.rotation.y));if(dir.clone().setY(0).normalize().dot(fwd)>-.25)return dmg;
  if((opts.stagger||0)>=.8){e.parryCd=1.2;play('clang');return dmg*1.25;}
  e.parryCd=1.8+Math.random();e.riposte=.32;play('clang');play('parry');hitSparks(e.g.position.clone().setY(1.5*e.g.scale.y).addScaledVector(fwd,.7),dir.clone().negate(),8);
  e.parts.armR.rotation.x=-2.3;e.parts.armR.rotation.z=-.6;if(Math.random()<.4)announce('Parried — use a heavy attack or strike from behind',1.2);return 0;}
Object.assign(ENEMY_AI,{
  soh:(e,T,pp,to,dist,dt)=>shooterAI(e,T,pp,to,dist,dt,EWEAP.bolter,[7,17],3,[1.3,2.3],.11),
  militia:(e,T,pp,to,dist,dt)=>shooterAI(e,T,pp,to,dist,dt,EWEAP.las,[6,20],2,[1.1,2.2],.16),
  we:(e,T,pp,to,dist,dt)=>{if(!e.rage&&e.hp<e.maxHp*.5){e.rage=true;e.speed*=1.35;e.dmg*=1.15;if(e.g.position.distanceTo(player.pos)<20){play('growl');play('frenzy');}}
    if(e.leap){leapUpdate(e,T,dt);return true;}
    e.leapCd=(e.leapCd??.2+Math.random()*.5)-dt;
    if(dist>3.5&&dist<11&&e.leapCd<=0&&hasLOS(e,pp)){startLeap(e,pp);e.leapCd=4+Math.random()*3;return true;}
    e.parts.armL.rotation.z=.25;e.parts.armR.rotation.z=-.25;return false;},
  ec:(e,T,pp,to,dist,dt)=>{e.parryCd=Math.max(0,(e.parryCd||0)-dt);
    if(e.riposte>0){e.riposte-=dt;if(e.riposte<=0){e.parts.armR.rotation.set(0,0,0);if(dist<e.reach+.9){damageTarget(T,e.dmg*1.3,e);play('whoosh');}}return true;}
    if(e.lunge>0){e.lunge-=dt;e.g.position.addScaledVector(to.clone().normalize(),11*dt);collide(e.g.position,e.r);e.parts.armR.rotation.x=-1.6;if(e.lunge<=0&&dist<e.reach+1.2)damageTarget(T,e.dmg,e);return true;}
    if(dist>9)return shooterAI(e,T,pp,to,dist,dt,EWEAP.las,[9,16],1,[1.4,2.4],.2);
    if(dist>e.reach&&dist<5.5){e.lungeCd=(e.lungeCd??1)-dt;if(e.lungeCd<=0){e.lunge=.28;e.lungeCd=2.2+Math.random()*1.5;play('whoosh');return true;}
      const side=new THREE.Vector3(-to.z,0,to.x).normalize().multiplyScalar(Math.sin(gameTime*.9+e.id));e.g.position.addScaledVector(side,e.speed*.6*dt);walkLegs(e,e.speed*.6,dt);collide(e.g.position,e.r);
      e.parts.armR.rotation.x=-.9;return true;}
    return false;},
  warsinger:(e,T,pp,to,dist,dt)=>{e.parts.body.position.y=1.4+Math.sin(gameTime*2+e.id)*.06;
    if(e.scream>0){e.scream-=dt;const k=1-e.scream/1.3;e.parts.head.rotation.x=-.5*k;e.throat.scale.setScalar(1+k*3);e.parts.armL.rotation.z=1.2*k;e.parts.armR.rotation.z=-1.2*k;
      if(Math.random()<dt*8)ringAt(e.g.position.x,1.9,e.g.position.z,0xb060ff,.2,1.5,.3,.05);
      if(e.scream<=0){e.throat.scale.setScalar(1);e.parts.armL.rotation.z=e.parts.armR.rotation.z=0;singerBlast(e);}return true;}
    e.singT=(e.singT??1.5+Math.random()*2)-dt;
    if(e.singT<=0&&dist<17&&hasLOS(e,pp)){e.scream=1.3;e.singT=4.5+Math.random()*2;if(e.g.position.distanceTo(player.pos)<30)play('choir');return true;}
    if(dist<7){const sp=e.speed*(e.legsLost?.5:1);e.g.position.addScaledVector(steer(e,to.clone().normalize().negate(),dt),sp*dt);walkLegs(e,sp,dt);collide(e.g.position,e.r);return true;}
    return dist<15&&hasLOS(e,pp);},
  malk:(e,T,pp,to,dist,dt)=>malkAI(e,T,pp,to,dist,dt)});
// 战歌者的灵能尖啸：看得见她的人都会受伤、画面扭曲
function singerBlast(e){const P=e.g.position.clone().setY(1.8);ringAt(P.x,1.4,P.z,0xc080ff,.4,15,.6,.25);ringAt(P.x,.2,P.z,0x8040c0,.4,12,.7,.15);
  if(P.distanceTo(player.pos)<30){play('backlash');}
  if(state==='playing'&&player.hp>0&&P.distanceTo(player.pos)<15&&!castRayWalls(P,player.pos.clone().setY(1.5).sub(P).normalize(),P.distanceTo(player.pos.clone().setY(1.5)))){
    hurtPlayer(e.dmg,false,e);player.warp=Math.max(player.warp||0,1.2);player.shake=Math.max(player.shake,.35);if(typeof addTaint==='function')addTaint(6,'change');}
  for(const a of allies)if(a.alive&&a.pos.distanceTo(P)<15)allyHurt(a,e.dmg*.6,e);}
// 马尔克：远处爆弹手枪点射，中距离冲锋跳劈，近身链锯剑连斩；半血呼叫增援，三成血狂暴
function malkAI(e,T,pp,to,dist,dt){const r=e.hp/e.maxHp;
  if(r<.6&&e.phase===1){e.phase=2;if(typeof vox==='function')vox('malk','Brothers! To me! For the Warmaster!');for(let i=0;i<2;i++){const a=Math.random()*6.28;const s=spawnEnemy('soh',e.g.position.x+Math.cos(a)*5,e.g.position.z+Math.sin(a)*5);s.campaign=true;}play('growl');}
  if(r<.3&&e.phase===2){e.phase=3;e.speed*=1.3;e.dmg*=1.2;if(typeof vox==='function')vox('malk','You were always too proud to see it, Kaedric!');play('frenzy');}
  if(e.leap){leapUpdate(e,T,dt);return true;}
  e.leapCd=(e.leapCd??3)-dt;
  if(dist>5&&dist<12&&e.leapCd<=0&&hasLOS(e,pp)){startLeap(e,pp);e.leapCd=e.phase===3?3:5;return true;}
  if(dist>7){const sh=shooterAI(e,T,pp,to,dist,dt,EWEAP.pistol,[7,14],2,[1,1.8],.18);if(sh){e.parts.armL.rotation.x=-1.5;return true;}}
  if(e.phase===3)e.cd=Math.min(e.cd,.25);return false;}
// ============================================================ 叛军关节动画：腿绕髋、手臂绕肩转（以前是绕部件中心转，枪和腿会“漂”）；呼吸、看向目标、受击后仰、步幅平滑
// AI 照旧只设部件的 rotation；这里每帧按关节点把 position 补回来，所以所有旧动画自动变成正确的关节运动
function rigSetup(e){const P=e.parts,R={};for(const k of ['legL','legR','armL','armR']){const p=P[k];const h=p.geometry&&p.geometry.parameters?p.geometry.parameters.height:.9;R[k]={x:p.position.x,y:p.position.y+h/2,z:p.position.z,h};}
  R.body={y:P.body.position.y};R.head={y:P.head.position.y,z:P.head.position.z};e.rig=R;e.stride=0;}
function jointPos(p,J){const rx=p.rotation.x,ry=p.rotation.y,rz=p.rotation.z,y=-J.h/2;const cz=Math.cos(rz),sz=Math.sin(rz),cy=Math.cos(ry),sy=Math.sin(ry),cx=Math.cos(rx),sx=Math.sin(rx);
  let x1=-y*sz,y1=y*cz,z1=0;let x2=x1*cy+z1*sy,y2=y1,z2=-x1*sy+z1*cy;let y3=y2*cx-z2*sx,z3=y2*sx+z2*cx;p.position.set(J.x+x2,J.y+y3,J.z+z3);}
function updateRigs(dt){for(const e of enemies){if(!e.alive||!e.rig||e.lifted||e.inHole)continue;const P=e.parts,R=e.rig;
    // 步幅：按实际移动速度平滑，停下时腿慢慢收回
    const mv=e.rigP?Math.hypot(e.g.position.x-e.rigP.x,e.g.position.z-e.rigP.z)/Math.max(dt,1e-4):0;e.rigP=e.rigP||new THREE.Vector3();e.rigP.copy(e.g.position);
    e.stride=lerp(e.stride,Math.min(1,mv/3.5),Math.min(1,dt*8));
    if(e.stride<.15&&!e.leap){for(const k of ['legL','legR'])if(P[k].parent===e.g)P[k].rotation.x*=Math.max(0,1-dt*10);}
    // 呼吸、后仰、头看目标
    const br=Math.sin(gameTime*2.2+e.id)*.015;P.body.position.y=R.body.y+br;if(!e.hover)P.body.rotation.x=-e.lean*.45-(e.stride>.5?.08:0);
    if(P.head.parent===e.g){P.head.position.y=R.head.y+br*1.3;P.head.rotation.y=Math.sin(gameTime*.7+e.id)*.12*(1-(e.aimK||0));}
    for(const k of ['legL','legR','armL','armR']){const p=P[k];if(p.parent!==e.g)continue;jointPos(p,R[k]);}}}
for(const t of ['soh','we','ec','militia','warsinger','malk']){const f=ENEMY_BUILD[t];ENEMY_BUILD[t]=e=>{f(e);rigSetup(e);};}
