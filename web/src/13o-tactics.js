// ============================================================ 战术层：掩体、包抄、冲锋、小队指令、火力支援、近战回报、战斗间歇、检查点
const TAC={claims:new Map(),flankBark:-99,rushBark:-99,strikes:[],crate:null,tips:0};
const SQUAD={order:'follow',focus:null,focusT:0,ringT:0};
let CKPT=null;
const pickOne=a=>a[Math.floor(Math.random()*a.length)];
function rayBlocked(x,y,z,tx,ty,tz){const d=new THREE.Vector3(tx-x,ty-y,tz-z);const L=d.length();if(L<1)return false;d.divideScalar(L);return !!castRayWalls(new THREE.Vector3(x,y,z),d,L-.6);}
// 视线遮挡：先查导航网格里的障碍格（不依赖模型），再用真实射线补充
function gridBlocked(ax,az,bx,bz){if(!NAV.ok)return false;const L=Math.hypot(bx-ax,bz-az),n=Math.ceil(L/(NAV.cs*.5));for(let s=1;s<n-1;s++){const t=s/n,i=navI(ax+(bx-ax)*t),j=navJ(az+(bz-az)*t);if(i>=0&&j>=0&&i<NAV.w&&j<NAV.h&&NAV.blk[j*NAV.w+i])return true;}return false;}
const concealed=(x,z,pp)=>gridBlocked(x,z,pp.x,pp.z)||rayBlocked(x,1.1,z,pp.x,1.4,pp.z);
const navOK=(x,z,need=1)=>!NAV.ok||navFree(navI(x),navJ(z),need);
function navCell(P,need=1){if(!NAV.ok)return P;const s=navSnap(navI(P.x),navJ(P.z),need);return s?new THREE.Vector3(NAV.x0+(s[0]+.5)*NAV.cs,0,NAV.z0+(s[1]+.5)*NAV.cs):P;}
// ---------------- 掩体：在附近的碰撞盒背后（相对目标）找一个看不见目标的位置
function coverSpot(e,pp,band){const P=e.g.position,cand=[],mid=(band[0]+band[1])/2;
  for(const b of colliders){const hw=(b.maxX-b.minX)/2,hd=(b.maxZ-b.minZ)/2;if(hw>9||hd>9||hw+hd<.6)continue;const cx=b.minX+hw,cz=b.minZ+hd;if(Math.abs(cx-P.x)>18||Math.abs(cz-P.z)>18)continue;
    let ax=cx-pp.x,az=cz-pp.z;const L=Math.hypot(ax,az);if(L<band[0]-1||L>band[1]+10)continue;ax/=L;az/=L;const ext=Math.abs(ax)*hw+Math.abs(az)*hd,sx=cx+ax*(ext+e.r+.45),sz=cz+az*(ext+e.r+.45);
    if(!navOK(sx,sz))continue;let taken=false;for(const [id,c] of TAC.claims)if(id!==e.id&&Math.hypot(c.x-sx,c.z-sz)<1.7){taken=true;break;}if(taken)continue;
    cand.push([Math.hypot(sx-P.x,sz-P.z)+Math.abs(L-mid)*.4,sx,sz]);}
  cand.sort((a,b)=>a[0]-b[0]);const bad=e.badCov||[];for(const [,sx,sz] of cand.slice(0,8)){if(bad.some(b=>Math.hypot(b.x-sx,b.z-sz)<1.5))continue;const c=new THREE.Vector3(sx,0,sz);if(concealed(sx,sz,pp)&&peekSpot(e,c,pp))return c;}return null;}
// 探头位置：矮掩体直接站起来，高掩体向侧面探出
function peekSpot(e,c,pp){if(wallMeshes.length&&!rayBlocked(c.x,1.8,c.z,pp.x,1.5,pp.z))return c.clone();let dx=pp.x-c.x,dz=pp.z-c.z;const L=Math.hypot(dx,dz)||1;dx/=L;dz/=L;const s0=e.peekSide||1;
  for(const s of [s0,-s0])for(const off of [1.4,2.4,3.6,4.8]){const x=c.x-dz*s*off,z=c.z+dx*s*off;if(!navOK(x,z))continue;if(!gridBlocked(x,z,pp.x,pp.z)&&!rayBlocked(x,1.5,z,pp.x,1.5,pp.z)){e.peekSide=s;return new THREE.Vector3(x,0,z);}}return null;}
function tacMove(e,C,p,k,dt){const nw=navWaypoint(C,e.g.position,p,1);const d=(nw?nw.p:p).clone().sub(e.g.position).setY(0);const L=d.length();if(L<.15)return;d.divideScalar(L);
  const sp=e.speed*k*(e.slowT>0?.5:1);e.g.position.addScaledVector(steer(e,d,dt),sp*Math.min(1,L/.6+.3)*dt);walkLegs(e,sp,dt);collide(e.g.position,e.r);}
function crouch(e,C,on,dt){C.ck=lerp(C.ck||0,on?1:0,Math.min(1,dt*7));if(e.leap)return;e.g.position.y=-.36*C.ck;if(C.ck>.03){e.parts.legL.rotation.x=-1.05*C.ck;e.parts.legR.rotation.x=.55*C.ck;}}
const playerIsTarget=pp=>Math.abs(pp.x-player.pos.x)+Math.abs(pp.z-player.pos.z)<.5;
function flankWarn(e){if(gameTime-TAC.flankBark<14)return;const v=e.g.position.clone().sub(player.pos).setY(0),L=v.length()||1,y=player.yaw;
  const fw=(-Math.sin(y)*v.x-Math.cos(y)*v.z)/L,rt=(Math.cos(y)*v.x-Math.sin(y)*v.z)/L;const side=fw<-.35?'behind us':rt>0?'right':'left';
  const sp=allies.filter(a=>a.alive&&!a.def.generic&&!a.vehicle&&!a.big);if(!sp.length)return;TAC.flankBark=gameTime;
  vox(pickOne(sp).id,pickOne([`Flankers — ${side}!`,`They’re working round us — ${side}!`,`Contact ${side}! Watch the flank!`]),true);if(actx){tone('square',520,390,.05,.16);tone('square',520,390,.05,.16,.2);}}
const _shooter=shooterAI;
shooterAI=function(e,T,pp,to,dist,dt,W,band,burst,cool,interval){const a=arguments;
  if(!(e.type==='soh'||e.type==='militia')||e.static||e.named||!NAV.ok||e.legsLost||dist<e.reach+.4||dist>band[1]+30)return _shooter.apply(null,a);
  const C=e.cov||(e.cov={ph:'none',re:Math.random()*1.5,t:0,chk:0});if(e.role===undefined)e.role=e.id%4===1?'flank':'cover';
  C.re-=dt;C.t-=dt;
  // 包抄：绕到玩家侧面再开打
  if(e.role==='flank'&&playerIsTarget(pp)&&dist<45){if(!C.fp){const s=e.id%2?1:-1,y=player.yaw;let P=V3(pp.x+Math.cos(y)*s*13+Math.sin(y)*3,0,pp.z-Math.sin(y)*s*13+Math.cos(y)*3);
      if(OPEN.on){P.x=clamp(P.x,-OPEN.R+3,OPEN.R-3);P.z=clamp(P.z,-OPEN.R+3,OPEN.R-3);}C.fp=navCell(P);C.ft=13;}
    C.ft-=dt;crouch(e,C,false,dt);aimPose(e,0);tacMove(e,C,C.fp,1.2,dt);
    if(e.g.position.distanceTo(C.fp)<2.5||C.ft<=0){e.role='cover';C.fp=null;C.ph='none';C.re=0;if(hasLOS(e,pp))flankWarn(e);}return true;}
  if(e.role==='flank')e.role='cover';
  if(C.re<=0){C.re=5+Math.random()*4;const s=coverSpot(e,pp,band);if(s){C.p=s;C.ph='move';C.t=8;TAC.claims.set(e.id,s);}else{C.ph='none';TAC.claims.delete(e.id);}}
  if(C.ph==='none'){crouch(e,C,false,dt);return _shooter.apply(null,a);}
  if(C.ph==='move'){crouch(e,C,false,dt);aimPose(e,0);tacMove(e,C,C.p,1.05,dt);if(e.g.position.distanceTo(C.p)<.8||C.t<=0){C.ph='hide';C.t=.7+Math.random()*1.3;}return true;}
  // 掩体被绕过去（目标能直接看到掩体位置）就换地方
  C.chk-=dt;if(C.chk<=0){C.chk=.5;if(!concealed(C.p.x,C.p.z,pp)){C.re=0;C.ph='none';return _shooter.apply(null,a);}}
  if(C.ph==='hide'){crouch(e,C,true,dt);aimPose(e,0);if(e.g.position.distanceTo(C.p)>.5)tacMove(e,C,C.p,.8,dt);
    if(C.t<=0||(reloadT>0&&playerIsTarget(pp))){const pk=peekSpot(e,C.p,pp);if(pk){C.pk=pk;C.ph='peek';C.t=1.6+Math.random()*1.6;e.fireCd=Math.min(e.fireCd??0,.25);}else{(e.badCov=e.badCov||[]).push(C.p);if(e.badCov.length>4)e.badCov.shift();C.re=2.5;C.ph='none';TAC.claims.delete(e.id);}}return true;}
  // 探头开火：用原来的射击逻辑，但把人拉回探头点
  crouch(e,C,false,dt);const r=_shooter(e,T,pp,to,dist,dt,W,[0,1e3],burst,cool,interval);e.g.position.x=lerp(e.g.position.x,C.pk.x,Math.min(1,dt*6));e.g.position.z=lerp(e.g.position.z,C.pk.z,Math.min(1,dt*6));
  if(C.t<=0&&!(e.burst>0)){C.ph='hide';C.t=1+Math.random()*1.8;if(Math.random()<.25)C.re=0;}return r||true;};
// ---------------- 近战军团趁玩家换弹 / 上机枪 / 刚挨打时冲锋
for(const k of ['we','ec']){const f=ENEMY_AI[k];if(!f)continue;ENEMY_AI[k]=(e,T,pp,to,dist,dt)=>{
  if(e.rushT>0){e.rushT-=dt;if(e.rushT<=0)e.speed/=1.55;}
  else if(playerIsTarget(pp)&&dist>5&&dist<26&&gameTime-(e.rushAt||-99)>8&&(reloadT>0||player.mounted||gameTime-(player.lastHurt||-99)<.5)){e.rushAt=gameTime;e.rushT=2.2;e.speed*=1.55;if(e.g.position.distanceTo(player.pos)<30)play('growl');
    if(gameTime-TAC.rushBark>18){TAC.rushBark=gameTime;const sp=allies.filter(a=>a.alive&&!a.def.generic&&!a.vehicle);if(sp.length)vox(pickOne(sp).id,k==='we'?'World Eaters — they’re charging! Blades up!':'Emperor’s Children closing — they smell weakness!',true);}}
  return f(e,T,pp,to,dist,dt);};}
// ---------------- 准星指向
function tacAim(){const y=player.yaw,p=player.pitch||0;return [camera.position.clone(),new THREE.Vector3(-Math.sin(y)*Math.cos(p),Math.sin(p),-Math.cos(y)*Math.cos(p))];}
function aimGround(maxD){const [o,d]=tacAim();let best=null;if(d.y<-.02){const t=-o.y/d.y;if(t<maxD)best=o.clone().addScaledVector(d,t);}
  const h=castRayWalls(o,d,maxD);if(h&&(!best||h.distance<best.distanceTo(o)))best=o.clone().addScaledVector(d,Math.max(0,h.distance-.8));if(best)best.y=0;return best;}
function aimEnemy(maxD){const [o,d]=tacAim();let best=null,bs=1e9;for(const e of enemies){if(!e.alive)continue;const v=e.g.position.clone();v.y+=1.2*e.g.scale.y;v.sub(o);const t=v.dot(d);if(t<1||t>maxD)continue;
    const perp=v.addScaledVector(d,-t).length(),tol=(e.vehicle||e.heavy?3:1.3)*e.g.scale.x+t*.02;if(perp>tol)continue;const sc=perp/tol+t*.003;if(sc>=bs)continue;const h=castRayWalls(o,d,t);if(h&&h.distance<t-2)continue;bs=sc;best=e;}return best;}
// ---------------- 小队指令（Y）：对准敌人 = 集火；对准地面 = 坚守该处；对准天空 / 脚下 = 跟我来
function squadOrder(){const live=allies.filter(a=>a.alive&&!a.parked);if(!live.length){announce('No squad to command',1);return;}
  const E=aimEnemy(90);if(E){SQUAD.focus=E;SQUAD.focusT=15;SQUAD.ringT=0;announce('ORDER: FOCUS FIRE',1);vox('kaedric',pickOne(['Focus fire — that one!','All guns on my target!','Bring that one down!']));if(actx)tone('square',880,660,.05,.1);return;}
  const P=aimGround(45);
  if(P&&P.distanceTo(player.pos)>5){SQUAD.order='hold';let i=0;for(const a of live){const ang=i*2.4,r=a.vehicle?7:(i?1.8+Math.sqrt(i)*1.3:0);a.hold=navCell(P.clone().add(V3(Math.sin(ang)*r,0,Math.cos(ang)*r)),a.vehicle?2:1);a.cmdHold=true;i++;}
    ringAt(P.x,.15,P.z,0x60ff80,.5,4.5,1.1,.1);announce('ORDER: HOLD POSITION',1);vox('kaedric',pickOne(['Take that ground and hold it!','Dig in there, brothers!','Hold that position!']));}
  else{SQUAD.order='follow';for(const a of live){if(a.cmdHold||SQUAD.order)a.hold=null;a.cmdHold=false;}announce('ORDER: FALL IN',1);vox('kaedric',pickOne(['On me, brothers!','Fall in — with me!','Form on me!']));}
  if(actx)tone('square',660,880,.05,.1);}
function squadFocus(a){const F=SQUAD.focus;return F&&F.alive&&F.g.position.distanceTo(a.pos)<75?F:null;}
// ---------------- 火力支援（战役里按 B）：泰坦在场就是火山炮，否则是舰队光矛
function fireSupport(){if((CAMP.fs|0)<=0){announce('No fire support — regroup to rearm',1.3);return;}
  const P=aimGround(120);if(!P){announce('No target — aim at the ground',1);return;}if(P.distanceTo(player.pos)<10){announce('Danger close — strike refused',1);return;}
  CAMP.fs--;const tit=(OPEN.titans||[]).find(t=>t.side==='loyal'&&!t.dead);
  vox(tit?'loken':'fleet',tit?'Legio Solaria acknowledges. Volcano cannon — on your mark, Sergeant!':'Lance strike authorised. Impact in four seconds — clear the zone!',true);
  TAC.strikes.push({P,t:0,dur:4,tit,smoke:0,hit:false});if(actx){tone('sine',440,440,.06,.15);tone('sine',660,660,.06,.2,.18);}}
function strikeBeam(S){const top=S.tit?S.tit.g.position.clone().add(V3(0,40,0)):S.P.clone().add(V3(18,190,-12));const d=S.P.clone().sub(top),L=d.length();
  const m=new THREE.Mesh(new THREE.CylinderGeometry(S.tit?.9:2.6,S.tit?.9:2.6,L,10,1,true),new THREE.MeshBasicMaterial({color:S.tit?0xffc070:0xbfe8ff,transparent:true,opacity:.95,depthWrite:false,blending:THREE.AdditiveBlending}));
  m.position.copy(top).addScaledVector(d,.5);try{m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d.clone().divideScalar(L));}catch(err){}scene.add(m);return m;}
function updateStrikes(dt){for(const S of TAC.strikes){S.t+=dt;
    if(!S.hit){S.smoke-=dt;if(S.smoke<=0){S.smoke=.18;puff(S.P.clone().setY(.4),2,0xc02018,1.4);if(Math.floor(S.t*2)!==Math.floor((S.t-dt)*2))ringAt(S.P.x,.12,S.P.z,0xff3020,1,9,.5,.08);}
      if(S.t>=S.dur){S.hit=true;S.beam=strikeBeam(S);const P=S.P;ringAt(P.x,.3,P.z,0xfff0c0,.5,16,.8,.4);ringAt(P.x,.3,P.z,0xff8030,.5,11,1.1,.6);puff(P.clone().setY(1.5),40,0x3a3028,6);dust(P.clone(),30);hitSparks(P.clone().setY(1),new THREE.Vector3(0,1,0),40);
        play('boom');play('boom');const pd=P.distanceTo(player.pos);player.shake=Math.max(player.shake,pd<40?1.2:.4);if(OPEN.on)addFire(P.x,1.5,P.z,2.5);
        for(const e of enemies){if(!e.alive)continue;const d=e.g.position.distanceTo(P);if(d>12)continue;const dir=e.g.position.clone().sub(P).setY(0);const L=dir.length()||1;dir.divideScalar(L);
          damageEnemy(e,(e.vehicle||e.heavy?2200:1600)*(1-d/14),'body',dir,{_remote:true,explode:true,how:{burst:{p:P.clone(),dir}}});}
        if(pd<7&&state==='playing')hurtPlayer(70*(1-pd/7),true);}}
    if(S.beam){const k=(S.t-S.dur)/.9;S.beam.material.opacity=Math.max(0,.95*(1-k));S.beam.scale.x=S.beam.scale.z=1+k*.6;if(k>=1){scene.remove(S.beam);S.beam=null;S.done=true;}}}
  TAC.strikes=TAC.strikes.filter(S=>!S.done);}
// ---------------- 近战击杀回报：生命 + 主武器弹药
const _deT=damageEnemy;damageEnemy=function(e,dmg,part,dir,opts={}){if(e&&e.g&&!opts._remote){const W=WEAPONS[cur];if(W&&W.melee&&e.g.position.distanceTo(player.pos)<7)e.pmT=gameTime;}
  if(e&&e.cov&&e.cov.ph==='none')e.cov.re=Math.min(e.cov.re,.4);return _deT(e,dmg,part,dir,opts);};
const _keT=killEnemy;killEnemy=function(e,...r){const was=e.alive;const out=_keT(e,...r);TAC.claims.delete(e.id);if(SQUAD.focus===e)SQUAD.focus=null;
  if(was&&!e.rewarded&&e.pmT&&gameTime-e.pmT<.3&&state==='playing'){e.rewarded=true;const big=e.marine||e.heavy||e.type==='brute';player.hp=Math.min(player.maxHp,player.hp+player.maxHp*(big?.08:.04));
    const A=ammo[0],G=WEAPONS[0];if(A&&G&&isFinite(G.reserveMax))A.res=Math.min(G.reserveMax,A.res+Math.ceil(G.magSize*(big?.5:.25)));if(actx)tone('sine',520,780,.04,.12);if(TAC.tips<3&&big){TAC.tips++;announce('Blade kill — vigour and ammunition restored',1.1);}}
  return out;};
// ---------------- 战斗间歇：清完一阶段后整补、听队友说话、看远处的战争
const LULLS={
  '3-1':{2:[['krosk','Barrels are glowing red. Give me a fresh belt and a minute’s quiet, Sergeant.'],['ardan','Sergeant… those were Sons of Horus on the far ridge. Our colours. I watched them fire on Solaria’s escort.'],
      ['kaedric','I saw it too. Eyes on the Sirenhold. We sort out the truth when the song is silent.'],['tavik','The truth is already singing, brother. I simply cannot make out the words yet.']],
    4:[['lucan','Five choristers dead. Five. And still the city hums.'],['tavik','Because the hymn has a root, and the root is below us. I can feel it in my teeth.'],['vell','Then we dig it out. There’s a munitions cache by the transept — take what you need.'],['kaedric','Load up. We go down together, or not at all.']]},
  '3-2':{3:[['tarvitz','Eidolon gave the order himself. My own Legion. My own Lord Commander.'],['kaedric','Ours too, Captain. Horus knew we would not kneel, so he burned the city to be certain.'],
      ['krosk','Vell would have liked you, Captain. He never trusted quiet men.'],['tarvitz','Then I will be loud for him. Resupply, brothers. The palace is the last high ground in this city.']]},
  '3-3':{1:[['hesk','Two assaults broken. My hull remembers Ullanor. It did not shake there. It does not shake now.'],['lucan','Their guns are walking closer, Sergeant. Every salvo lands nearer the wounded.'],
      ['loken','Then we go out and take those guns. Resupply — two minutes, no more.'],['ardan','Two minutes. Long enough to pray, if any of us still remember how.']],
    3:[['tavik','They are massing beyond the ridge. I count… no. I will not count them.'],['krosk','Good. Counting is for logisticians.'],['hesk','Brothers — if my sarcophagus falls today, stand on the wreck and keep firing. It is the only grave I want.'],
      ['kaedric','You heard the Ancient. Make it a long day for the traitors.'],['loken','Here they come. For the Emperor — and for each other.']]}};
function buildCrate(P){const g=new THREE.Group();g.position.copy(P);const base=new THREE.Mesh(B3(1.3,.7,.9),lmat(0x3a3e2c));base.position.y=.35;g.add(base);const lid=new THREE.Mesh(B3(1.36,.12,.96),lmat(0x2c3022));lid.position.y=.76;g.add(lid);
  const band=new THREE.Mesh(B3(1.34,.12,.2),lmat(0xb89040));band.position.y=.5;g.add(band);const glow=new THREE.Mesh(B3(.3,.05,.3),lmat(0x80ff90,true));glow.position.y=.84;g.add(glow);g.userData.lid=lid;scene.add(g);return g;}
function resupply(){const A=ammo[0],G=WEAPONS[0];if(A&&G&&isFinite(G.reserveMax)){A.res=G.reserveMax;A.mag=G.magSize;}player.hp=player.maxHp;CAMP.fs=Math.min(3,(CAMP.fs|0)+1);play('pickup');announce('Resupplied — fire support +1',1.4);}
function startLull(lines){const live=lines.filter(([w])=>['kaedric','loken','fleet'].includes(w)||allies.some(a=>a.id===w&&a.alive));
  const y=player.yaw,P=navCell(player.pos.clone().add(V3(-Math.sin(y)*5,0,-Math.cos(y)*5)));TAC.crate=buildCrate(P);
  live.forEach(([w,t],i)=>later(1.5+i*5.5,()=>{if(w==='kaedric'||w==='loken'||w==='fleet'||allies.some(a=>a.id===w&&a.alive))vox(w,t,true);}));
  for(const a of allies)if(a.alive&&!a.cmdHold&&!a.vehicle)a.hold=null;const dur=3+live.length*5.5;CAMP.wp=P.clone();CAMP.wpName='RESUPPLY';objBanner('Regroup — resupply at the cache');
  CAMP.S={lull:true,t:0,got:false,update(dt){this.t+=dt;if(!this.got&&(player.pos.distanceTo(P)<2.6||this.t>dur+20)){this.got=true;resupply();if(TAC.crate)TAC.crate.userData.lid.rotation.x=-1.2;CAMP.wp=null;}
      if(this.got&&this.t>dur){if(TAC.crate)scene.remove(TAC.crate);TAC.crate=null;return true;}return false;}};}
// ---------------- 检查点
function saveCk(step){if(step<=0||!CSTEPS[CAMP.id][step])return;
  CKPT={id:CAMP.id,step,map:CAMP.curMap||null,pos:player.pos.clone(),yaw:player.yaw,allies:allies.filter(a=>a.alive).map(a=>({id:a.id,veh:!!a.vehicle,name:a.name,hold:a.hold?a.hold.clone():null})),
    titans:(CAMP.titanLog||[]).slice(),camp:{flags:{...CAMP.flags},met:CAMP.met,bunker:CAMP.bunker?CAMP.bunker.clone():undefined,wentDown:CAMP.wentDown,lullDone:{...CAMP.lullDone},fs:Math.max(1,CAMP.fs|0)},t:CAMP.t,kills:match.kills};
  if(CAMP.step>=0)announce('CHECKPOINT',1.1);}
function restoreCk(ck){if(ck.map)campRebuild(ck.map);const want=new Map(ck.allies.map(x=>[x.id,x]));
  for(const a of allies)if(a.alive&&!want.has(a.id)){a.alive=false;if(a.root)a.root.visible=false;}
  for(const x of ck.allies)if(!x.veh&&ALLY_DEFS[x.id]&&!allies.some(a=>a.id===x.id&&a.alive))spawnAlly(x.id,ck.pos.x,ck.pos.z);
  player.pos.copy(ck.pos);player.yaw=ck.yaw;player.hp=player.maxHp;const live=allies.filter(a=>a.alive);
  live.forEach((a,i)=>{const ang=player.yaw+Math.PI+(i-(live.length-1)/2)*.45,r=a.vehicle?9:3.2;a.pos.copy(navCell(V3(ck.pos.x+Math.sin(ang)*r,0,ck.pos.z+Math.cos(ang)*r),a.vehicle?2:1));if(a.root)a.root.position.copy(a.pos);const w=want.get(a.id);a.hold=w&&w.hold?w.hold.clone():null;});
  for(const [c,p,o] of ck.titans)spawnTitan(c,p,o);CAMP.titanLog=ck.titans.slice();Object.assign(CAMP,ck.camp);CAMP.flags={...ck.camp.flags};CAMP.lullDone={...ck.camp.lullDone};CAMP.t=ck.t;match.kills=ck.kills;
  CAMP.step=ck.step-1;state='playing';titleCard('CHECKPOINT',CAMP.L.obj[Math.min(ck.step,CAMP.L.obj.length-1)]||'',2.4);nextCampStep();}
function restoreCheckpoint(){const ck=CKPT;if(!ck)return;$('result').classList.remove('show');CAMP.restoring=ck;const oi=CAMP.intro[ck.id];CAMP.intro[ck.id]=()=>{};
  try{startCampaignLevel(ck.id);}finally{CAMP.intro[ck.id]=oi;CAMP.restoring=null;}canvas.requestPointerLock?.();}
// ---------------- 挂到战役流程上
const _scl=startCampaignLevel;startCampaignLevel=function(id){const ck=CAMP.restoring;_scl(id);CAMP.titanLog=[];CAMP.curMap=null;SQUAD.order='follow';SQUAD.focus=null;TAC.strikes=[];TAC.claims.clear();
  if(TAC.crate){scene.remove(TAC.crate);TAC.crate=null;}if(ck)restoreCk(ck);else{CKPT=null;CAMP.fs=2;CAMP.lullDone={};}};
const _crb=campRebuild;campRebuild=function(spec){_crb(spec);CAMP.curMap=spec;CAMP.titanLog=[];TAC.claims.clear();SQUAD.order='follow';for(const a of allies)a.cmdHold=false;if(TAC.crate){scene.remove(TAC.crate);TAC.crate=null;}};
const _stT=spawnTitan;spawnTitan=function(col,path,opt={}){const T=_stT(col,path,opt);if(T&&CAMP.on&&CAMP.titanLog)CAMP.titanLog.push([col,path,opt]);return T;};
const _ncs=nextCampStep;nextCampStep=function(){const k=CAMP.step,L=LULLS[CAMP.id];CAMP.lullDone=CAMP.lullDone||{};
  if(k>=0&&L&&L[k]&&!CAMP.lullDone[k]){CAMP.lullDone[k]=true;startLull(L[k]);return;}saveCk(k+1);_ncs();};
const sqordHtml=()=>{const ord=SQUAD.focus&&SQUAD.focus.alive?'FOCUS FIRE':SQUAD.order==='hold'?'HOLD':'FOLLOW';return `<div class="sqord"><span>SQUAD <b>${ord}</b> [Y]</span><span>FIRE SUPPORT <b>×${CAMP.fs|0}</b> [B]</span></div>`;};
const _coh=campObjHtml;campObjHtml=function(){const h=_coh()+sqordHtml();if(!(CAMP.S&&CAMP.S.lull))return h;const o=CAMP.L.obj[Math.min(CAMP.step,CAMP.L.obj.length-1)];
  return h.replace(/<div class="ocur">[\s\S]*?<\/div>/,`<div class="odone">✔ ${o}</div><div class="ocur">◆ Regroup — resupply at the cache</div>`);};
const _cend=campEnd;campEnd=function(win){_cend(win);const b=$('campCk');if(b&&b.style){const ok=!win&&CKPT&&CKPT.id===CAMP.id;b.style.display=ok?'':'none';b.onclick=()=>restoreCheckpoint();}};
const _xc=exitCampaign;exitCampaign=function(){_xc.apply(null,arguments);const b=$('campCk');if(b&&b.style)b.style.display='none';SQUAD.focus=null;TAC.strikes=[];if(TAC.crate){scene.remove(TAC.crate);TAC.crate=null;}};
const _ucT=updateCampaign;updateCampaign=function(dt){_ucT(dt);if(state!=='playing')return;updateStrikes(dt);
  if(SQUAD.focus){SQUAD.focusT-=dt;if(!SQUAD.focus.alive||SQUAD.focusT<=0)SQUAD.focus=null;else{SQUAD.ringT-=dt;if(SQUAD.ringT<=0){SQUAD.ringT=.55;const p=SQUAD.focus.g.position;ringAt(p.x,.12,p.z,0xff3030,.6,1.4*SQUAD.focus.g.scale.x+.6,.5,.07);}}}};
addEventListener('keydown',e=>{if(state!=='playing'||e.repeat)return;
  if(e.code==='KeyY'){squadOrder();return;}
  if(e.code==='KeyB'&&CAMP.on){e.stopPropagation();fireSupport();}},true);
