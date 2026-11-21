// ============================================================ 大型单位：掠食者坦克（双方）、叛军无畏、远处的战争泰坦
// 敌方坦克仍是“敌人”（六个部位：车体/炮塔/两侧炮座/两条履带），所以玩家的武器、断肢射线照常命中；我方坦克是 vehicle 型队友
EWEAP.shell={speed:46,spread:.015,kind:'shell',color:0xffd090,len:1.1,snd:'boom',splash:3.8};
EWEAP.heavyb={speed:60,spread:.05,kind:'bolt',color:0xffb050,len:.9,snd:'bolter'};
const TANKCOL={traitor:{hull:0x2f5a52,trim:0x15191a,metal:0x7a5e26},loyal:{hull:0x4a8474,trim:0x1a1d1e,metal:0x7a5e26},rebel:{hull:0x5a5444,trim:0x2a2620,metal:0x4a4a40}};
function tankParts(root,C,big){const A=new THREE.MeshLambertMaterial({map:texMetal,color:C.hull}),T=lmat(C.trim),M=lmat(C.metal),D=lmat(0x141414);
  const box=(p,w,h,d,x,y,z,m=A)=>{const b=new THREE.Mesh(B3(w,h,d),m);b.position.set(x,y,z);p.add(b);return b;};
  const hull=box(root,3.0,1.4,5.2,0,1.35,0);box(hull,2.9,.7,1.4,0,-.05,2.9,A).rotation.x=.55;box(hull,1.2,.3,.8,0,.85,-1.6,T);for(const s of [-1,1])box(hull,.3,.6,.3,s*.9,.95,-2.1,M);
  const tracks=[];for(const s of [-1,1]){const tr=box(root,.75,1.2,5.8,s*1.75,.62,0,D);for(let i=0;i<6;i++){const w=new THREE.Mesh(new THREE.CylinderGeometry(.42,.42,.8,10),T);w.rotation.z=Math.PI/2;w.position.set(0,-.12,-2.3+i*.92);tr.add(w);}tracks.push(tr);}
  const tur=new THREE.Group();tur.position.set(0,2.35,-.3);root.add(tur);box(tur,1.8,.8,2.1,0,0,0);box(tur,1.9,.12,2.2,0,.42,0,T);box(tur,.4,.3,.4,.5,.55,-.4,M);
  const gun=new THREE.Mesh(new THREE.CylinderGeometry(.13,.16,2.8,10),D);gun.rotation.x=Math.PI/2;gun.position.set(0,.05,2.3);tur.add(gun);box(tur,.36,.36,.5,0,.05,1.05,M);
  const muzzle=new THREE.Object3D();muzzle.position.set(0,.05,3.8);tur.add(muzzle);
  const spons=[];for(const s of [-1,1]){const sp=new THREE.Group();sp.position.set(s*1.65,1.55,.6);root.add(sp);box(sp,.6,.6,.8,0,0,0,A);const b=new THREE.Mesh(new THREE.CylinderGeometry(.08,.1,1.5,8),D);b.rotation.x=Math.PI/2;b.position.set(0,0,1);sp.add(b);const mz=new THREE.Object3D();mz.position.set(0,0,1.8);sp.add(mz);spons.push(mz);}
  return {hull,tur,muzzle,spons,tracks,mat:A};}
// 敌方坦克：把六个部位改成车体/炮塔/炮座/履带
function restyleTank(e,C){const A=new THREE.MeshLambertMaterial({map:texMetal,color:C.hull});e.mat=A;const P=e.parts,T=lmat(C.trim),M=lmat(C.metal),D=lmat(0x141414);
  const set=(p,w,h,d,x,y,z,m=A)=>{stripPart(p);p.geometry=B3(w,h,d);p.material=m;p.position.set(x,y,z);p.rotation.set(0,0,0);};
  set(P.body,3.0,1.4,5.2,0,1.35,0);set(P.head,1.8,.8,2.1,0,2.35,-.3);set(P.armL,.6,.6,.8,-1.65,1.55,.6);set(P.armR,.6,.6,.8,1.65,1.55,.6);set(P.legL,.75,1.2,5.8,-1.75,.62,0,D);set(P.legR,.75,1.2,5.8,1.75,.62,0,D);
  addTo(P.body,B3(2.9,.7,1.4),A,0,-.05,2.9,.55);addTo(P.body,B3(1.2,.3,.8),T,0,.85,-1.6);for(const s of [-1,1])addTo(P.body,B3(.3,.6,.3),M,s*.9,.95,-2.1);
  addTo(P.head,B3(1.9,.12,2.2),T,0,.42,0);addTo(P.head,new THREE.CylinderGeometry(.13,.16,2.8,10),D,0,.05,2.3,Math.PI/2);addTo(P.head,B3(.36,.36,.5),M,0,.05,1.05);
  const mz=new THREE.Object3D();mz.position.set(0,.05,3.8);P.head.add(mz);e.muzzle=mz;
  for(const [p,s] of [[P.armL,-1],[P.armR,1]]){addTo(p,new THREE.CylinderGeometry(.08,.1,1.5,8),D,0,0,1,Math.PI/2);const m=new THREE.Object3D();m.position.set(0,0,1.8);p.add(m);(e.spons=e.spons||[]).push(m);}
  for(const tr of [P.legL,P.legR])for(let i=0;i<6;i++)addTo(tr,new THREE.CylinderGeometry(.42,.42,.8,10),T,0,-.12,-2.3+i*.92,0,0,Math.PI/2);
  e.onHit=tankArmour;e.vehicle=true;e.r=2.3;e.growl=1e9;e.hullYaw=0;e.turYaw=0;e.shellCd=1.5+Math.random()*2;e.lasCd=3+Math.random()*2;e.marine=true;}
Object.assign(ENEMY_BUILD,{
  tpred:e=>{restyleTank(e,TANKCOL.traitor);e.named=null;},
  rtank:e=>{restyleTank(e,TANKCOL.rebel);},
  tdread:e=>{restyleMarine(e,LEG.soh,{legion:'soh'});e.muzzle=gunBolter(e.parts.armR,true);const f=addTo(e.parts.armL,B3(.62,.6,.62),lmat(0x1a1a1a),0,-.55,.05);for(let i=0;i<4;i++)addTo(f,B3(.12,.3,.12),lmat(0x7a5e26),-.2+i*.13,-.4,.2);
    addTo(e.parts.body,B3(.7,.6,.08),lmat(0x7a5e26),0,.05,.36);e.heavy=true;e.growl=1e9;rigSetup(e);}});
// 坦克 AI：车体慢慢转向、保持 14–26 米、炮塔独立追踪；主炮开花弹、侧面激光炮
function tankAI(e,T,pp,to,dist,dt){const want=Math.atan2(to.x,to.z);e.turYaw+=wrapA(want-e.hullYaw-e.turYaw)*Math.min(1,dt*2.2);e.parts.head.rotation.y=e.turYaw;
  let mv=0;if(dist>26)mv=1;else if(dist<12)mv=-.6;const see=hasLOS(e,pp);if(!see&&dist>10)mv=1;
  if(mv){const r=driveVehicle(e,e.g.position,e.hullYaw,want,mv,e.speed,dt,pp);e.hullYaw=r;
    if(Math.random()<dt*3)puff(e.g.position.clone().add(new THREE.Vector3(Math.sin(e.hullYaw+Math.PI)*2.4,1.6,Math.cos(e.hullYaw+Math.PI)*2.4)),1,0x2a2a2a,1.2);}
  e.g.rotation.set(0,e.hullYaw,0);e.parts.body.position.y=1.35+Math.sin(gameTime*30)*.01*(mv?1:0);
  if(!see||dist>48)return true;
  e.shellCd-=dt;e.lasCd-=dt;
  if(e.shellCd<=0&&Math.abs(wrapA(want-e.hullYaw-e.turYaw))<.12){e.shellCd=2.6+Math.random()*1.4;const from=new THREE.Vector3();e.muzzle.getWorldPosition(from);const aim=T.pos.clone().setY(1);fireBolt(from,aim,EWEAP.shell,'chaos',e.dmg,e);
    puff(from,4,0x4a4038,1.4);e.parts.head.position.z=-.55;if(e.g.position.distanceTo(player.pos)<30)player.shake=Math.max(player.shake,.2);}
  e.parts.head.position.z=lerp(e.parts.head.position.z,-.3,Math.min(1,dt*4));
  if(e.lasCd<=0&&e.spons){e.lasCd=4+Math.random()*2;const m=e.spons[Math.random()<.5?0:1];if(m&&m.parent&&isAttached(e,m)){const from=new THREE.Vector3();m.getWorldPosition(from);lasBeam(from,T,e.dmg*.8,'chaos',e);}}
  return true;}
ENEMY_AI.tpred=tankAI;ENEMY_AI.rtank=tankAI;
ENEMY_AI.tdread=(e,T,pp,to,dist,dt)=>{if(dist<e.reach+.5){aimPose(e,0);return false;}return shooterAI(e,T,pp,to,dist,dt,EWEAP.heavyb,[6,16],5,[1.6,2.6],.09);};
// 激光炮：瞬间命中的粗红光束
function lasBeam(from,T,dmg,team,src){const to=team==='chaos'?T.pos.clone().setY((T.pos.y||0)+1.3):T.g.position.clone().setY(1.3*T.g.scale.y);const d=to.clone().sub(from),L=d.length();d.normalize();const w=castRayWalls(from,d,L);const end=w?from.clone().addScaledVector(d,w.distance):to;
  const m=new THREE.Mesh(B3(.16,.16,from.distanceTo(end)),lmat(0xff3a20,true));m.position.copy(from).lerp(end,.5);m.lookAt(end);scene.add(m);beams.push({m,life:.12});const m2=new THREE.Mesh(B3(.05,.05,from.distanceTo(end)),lmat(0xffffff,true));m2.position.copy(m.position);m2.quaternion.copy(m.quaternion);scene.add(m2);beams.push({m:m2,life:.1});
  hitSparks(end,d.clone().negate(),10);if(from.distanceTo(player.pos)<40)play('melta');if(w)return;
  if(team==='chaos')damageTarget(T,dmg,src);else damageEnemy(T,dmg,'body',d,{_remote:true,stagger:.4,point:end});}
// 开花弹爆炸：范围伤害（敌方炮弹伤玩家和队友，我方炮弹伤敌人）
function shellBlast(P,b){ringAt(P.x,.3,P.z,0xffa040,.4,b.W.splash*1.4,.45,.2);puff(P.clone().setY(.8),10,0x3a3028,2.2);hitSparks(P,new THREE.Vector3(0,1,0),14);dust(P.clone().setY(0),10);
  const d=P.distanceTo(player.pos);if(d<45){play('boom');player.shake=Math.max(player.shake,Math.max(0,.6-d/50));}const R=b.W.splash;
  if(b.team==='chaos'){if(state==='playing'&&d<R+.5)hurtPlayer(b.dmg*(1-d/(R+1)),false,null);for(const a of allies)if(a.alive&&a.pos.distanceTo(P)<R+a.r)allyHurt(a,b.dmg*.8,b.src);}
  else for(const e of enemies)if(e.alive&&e.g.position.distanceTo(P)<R+e.r){const dir=e.g.position.clone().sub(P).setY(.4).normalize();damageEnemy(e,b.dmg*(e.vehicle?.6:1.4),'body',dir,{_remote:true,knock:1.4,stagger:.6,explode:true,how:{burst:{p:P,dir}}});}}
// 坦克被摧毁：大爆炸、炮塔飞上天、留下燃烧的残骸（仍然是掩体）
function vehicleDeath(e){const P=e.g.position.clone();ringAt(P.x,1,P.z,0xff8030,.5,9,.6,.3);puff(P.clone().setY(2),26,0x2a2420,3);hitSparks(P.clone().setY(2),new THREE.Vector3(0,1,0),30);
  play('boom');play('boom');if(P.distanceTo(player.pos)<40)player.shake=Math.max(player.shake,.8);
  const h=e.parts.head;if(h.parent===e.g){detach(e,'head',new THREE.Vector3(0,1,0));const gb=gibs.find(g=>g.m===h);if(gb){gb.v.set((Math.random()-.5)*4,11,(Math.random()-.5)*4);}}
  e.mat.color.setHex(0x1a1816);e.mat.emissive&&e.mat.emissive.setHex(0);e.g.rotation.z=(Math.random()-.5)*.12;
  const c=Math.abs(Math.cos(e.hullYaw||0)),s=Math.abs(Math.sin(e.hullYaw||0));colliders.push({minX:P.x-(2.1*c+2.9*s),maxX:P.x+(2.1*c+2.9*s),minZ:P.z-(2.1*s+2.9*c),maxZ:P.z+(2.1*s+2.9*c)});
  if(typeof addFire==='function'&&OPEN.on){addFire(P.x,2.4,P.z,1.6);}if(e.g.position.distanceTo(player.pos)<60&&typeof vox==='function'&&CAMP.on)vox('ardan',e.type==='rtank'?'Rebel armour destroyed!':'Enemy tank down!');}
// ---------------- 我方坦克（vehicle 型队友）
function spawnAllyTank(id,name,x,z,yaw=0){const root=new THREE.Group();root.position.set(x,0,z);root.rotation.y=yaw;scene.add(root);const P=tankParts(root,TANKCOL.loyal);
  const chev=new THREE.Mesh(new THREE.ConeGeometry(.25,.4,3),new THREE.MeshBasicMaterial({color:0x60ff90,depthTest:false}));chev.rotation.x=Math.PI;chev.position.y=4.2;chev.renderOrder=5;root.add(chev);
  const a={id,def:{name,role:'tank',generic:false},name,root,J:{chev},mat:P.mat,muzzle:P.muzzle,P,pos:root.position,yaw,hp:2600,maxHp:2600,alive:true,down:false,big:true,vehicle:true,r:2.3,role:'tank',target:null,scanT:0,
    shellCd:2,lasCd:3,turYaw:0,lastHit:-9,flash:0,hold:null,aimK:0,deathT:0,vel:new THREE.Vector3()};allies.push(a);return a;}
function updateAllyVehicle(a,dt){a.scanT-=dt;if(a.scanT<=0){a.scanT=.5;let best=null,bd=48;for(const e of enemies){if(!e.alive)continue;const d=e.g.position.distanceTo(a.pos)-(e.vehicle||e.heavy?12:0);if(d<bd&&allyLOS(a,e)){bd=d;best=e;}}a.target=best;}
  const E=a.target&&a.target.alive?a.target:null;
  // 跟在玩家侧前方开路，或者开到指定坚守点
  const goal0=a.hold?a.hold.clone():player.pos.clone().add(new THREE.Vector3(-Math.sin(player.yaw)*6+Math.cos(player.yaw)*(a.side||7),0,-Math.cos(player.yaw)*6-Math.sin(player.yaw)*(a.side||7)));
  const goal=goal0.clone();const to=goal.sub(a.pos).setY(0),d=to.length();let mv=d>4?1:0;const want=Math.atan2(to.x,to.z);
  if(mv){a.yaw=driveVehicle(a,a.pos,a.yaw,want,1,3.4*(d>15?1.3:1),dt,a.hold?a.hold:goal0);
    if(Math.random()<dt*3)puff(a.pos.clone().add(new THREE.Vector3(Math.sin(a.yaw+Math.PI)*2.4,1.6,Math.cos(a.yaw+Math.PI)*2.4)),1,0x2a2a2a,1.2);}
  a.root.rotation.y=a.yaw;a.P.hull.position.y=1.35+Math.sin(gameTime*30)*.01*mv;
  const tw=E?wrapA(Math.atan2(E.g.position.x-a.pos.x,E.g.position.z-a.pos.z)-a.yaw):0;a.turYaw+=wrapA(tw-a.turYaw)*Math.min(1,dt*2.5);a.P.tur.rotation.y=a.turYaw;a.P.tur.position.z=lerp(a.P.tur.position.z,-.3,Math.min(1,dt*4));
  if(a.flash>0)a.flash-=dt;a.mat.emissive.setHex(a.flash>0?0x502020:0);if(gameTime-a.lastHit>8)a.hp=Math.min(a.maxHp,a.hp+40*dt);
  if(!E)return;a.shellCd-=dt;a.lasCd-=dt;
  if(a.shellCd<=0&&Math.abs(wrapA(tw-a.turYaw))<.1){a.shellCd=2.4+Math.random();const from=new THREE.Vector3();a.muzzle.getWorldPosition(from);fireBolt(from,E.g.position.clone().setY(1.2),EWEAP.shell,'loyal',70,a);a.P.tur.position.z=-.6;puff(from,4,0x4a4038,1.4);
    if(a.pos.distanceTo(player.pos)<30)player.shake=Math.max(player.shake,.18);}
  if(a.lasCd<=0){a.lasCd=3.5+Math.random()*2;const from=new THREE.Vector3();a.P.spons[Math.random()<.5?0:1].getWorldPosition(from);lasBeam(from,E,E.vehicle||E.heavy?160:70,'loyal',a);}
  if(a.J.chev)a.J.chev.material.color.setHex(a.hp<a.maxHp*.35?0xffc040:0x60ff90);}
function allyVehicleDie(a){a.alive=false;const P=a.pos.clone();ringAt(P.x,1,P.z,0xff8030,.5,9,.6,.3);puff(P.clone().setY(2),26,0x2a2420,3);hitSparks(P.clone().setY(2),new THREE.Vector3(0,1,0),30);play('boom');play('boom');
  if(P.distanceTo(player.pos)<40)player.shake=Math.max(player.shake,.8);a.mat.color.setHex(0x1a1816);a.J.chev.visible=false;const t=a.P.tur;a.root.remove(t);t.position.copy(P).add(new THREE.Vector3(0,2.4,0));scene.add(t);gibs.push({m:t,v:new THREE.Vector3((Math.random()-.5)*4,10,(Math.random()-.5)*4),spin:new THREE.Vector3(3,2,1),rest:false});
  const c=Math.abs(Math.cos(a.yaw)),s=Math.abs(Math.sin(a.yaw));colliders.push({minX:P.x-(2.1*c+2.9*s),maxX:P.x+(2.1*c+2.9*s),minZ:P.z-(2.1*s+2.9*c),maxZ:P.z+(2.1*s+2.9*c)});if(OPEN.on)addFire(P.x,2.4,P.z,1.6);
  if(typeof vox==='function'&&CAMP.on)vox('ardan',a.name+' is gone! We’ve lost our armour!',true);}
// ============================================================ 战争泰坦（远景巨人，真的会走、会开火、脚步会震）
function buildTitan(col){const g=new THREE.Group();const A=new THREE.MeshLambertMaterial({map:texMetal,color:col.hull}),T=lmat(col.trim),M=lmat(col.metal),D=lmat(0x121212),EYE=lmat(col.eye,true);
  const box=(p,w,h,d,x,y,z,m=A)=>{const b=new THREE.Mesh(B3(w,h,d),m);b.position.set(x,y,z);p.add(b);return b;};const J={};
  const pelvis=new THREE.Group();pelvis.position.y=15;g.add(pelvis);box(pelvis,5,2.4,4,0,0,0,T);J.pelvis=pelvis;
  for(const s of [-1,1]){const hip=new THREE.Group();hip.position.set(s*2.8,-.6,0);pelvis.add(hip);box(hip,2,7.5,2.4,0,-3.6,0);box(hip,2.6,2.2,2.6,0,0,0,M);
    const knee=new THREE.Group();knee.position.set(0,-7.2,0);hip.add(knee);box(knee,1.7,7,2,0,-3.4,-.4);box(knee,2.2,1.6,2.8,0,0,.3,T);box(knee,3.4,1.2,5,0,-7.2,.6,D);J[s<0?'hipL':'hipR']=hip;J[s<0?'kneeL':'kneeR']=knee;}
  const body=new THREE.Group();body.position.y=2.2;pelvis.add(body);box(body,7,5,6,0,1.2,0);box(body,7.6,1.4,6.6,0,3.9,0,M);box(body,3.2,2.2,3,0,1.4,3.6,T);box(body,2.2,.5,.2,0,1.8,5.15,EYE);
  for(let i=0;i<4;i++)box(body,.6,2.2,.6,-2.4+i*1.6,5.2,-1.8,D);J.body=body;
  for(const s of [-1,1]){const arm=new THREE.Group();arm.position.set(s*5,1.6,0);body.add(arm);box(arm,2.4,2.4,3,0,0,0,M);const gun=new THREE.Mesh(new THREE.CylinderGeometry(.9,1.1,9,10),D);gun.rotation.x=Math.PI/2;gun.position.set(0,-.6,4.5);arm.add(gun);
    for(let i=0;i<3;i++)box(arm,2.2,2.2,.4,0,-.6,1.2+i*2.2,T);const mz=new THREE.Object3D();mz.position.set(0,-.6,9.2);arm.add(mz);J[s<0?'gunL':'gunR']=mz;J[s<0?'armL':'armR']=arm;}
  // 细节：头冠、肩甲、挂在腰间的军团旗、背后的排气塔
  box(body,1.2,1.6,.4,0,3.4,4.6,T);for(const s of [-1,1]){const pa=box(body,3.2,1.2,4.4,s*4.6,4.6,0,A);pa.rotation.z=s*-.25;box(body,3.4,.3,4.6,s*4.7,5.25,0,M).rotation.z=s*-.25;}
  const ban=new THREE.Mesh(new THREE.PlaneGeometry(3.2,7),new THREE.MeshLambertMaterial({color:col.banner||col.trim,side:THREE.DoubleSide}));ban.position.set(0,-4.6,2.3);pelvis.add(ban);J.banner=ban;
  const emb=new THREE.Mesh(new THREE.CircleGeometry(.9,16),lmat(col.metal));emb.position.set(0,-3.4,2.32);pelvis.add(emb);
  for(const s of [-1,1]){const st=new THREE.Mesh(new THREE.CylinderGeometry(.5,.7,4,8),D);st.position.set(s*1.8,5.4,-3.2);body.add(st);(J.stacks=J.stacks||[]).push(st);}
  g.scale.setScalar(2.4);return {g,J};}
function spawnTitan(col,path,opt={}){if(!OPEN.on)return null;const t=buildTitan(col);t.g.position.copy(path[0]);t.g.position.y=groundH(path[0].x,path[0].z)-1;levelGroup.add(t.g);const T={...t,path,pi:1,walk:0,fireT:3+Math.random()*3,hornT:4,side:opt.side||'loyal',target:opt.target||null,lastStep:0};(OPEN.titans=OPEN.titans||[]).push(T);return T;}
function titanHorn(T){if(!actx)return;const d=T.g.position.distanceTo(player.pos);const v=Math.max(.05,.5-d/400);tone('sawtooth',62,58,v,2.2);tone('sawtooth',93,88,v*.7,2.2);tone('square',46,44,v*.5,2.4);}
function updateTitans(dt){if(!OPEN.titans)return;for(const T of OPEN.titans){const tgt=T.path[T.pi];const to=tgt.clone().sub(T.g.position).setY(0);const d=to.length();
    if(d<2){T.pi=(T.pi+1)%T.path.length;}else{const yaw=Math.atan2(to.x,to.z);T.g.rotation.y+=wrapA(yaw-T.g.rotation.y)*Math.min(1,dt*.4);T.g.position.addScaledVector(to.normalize(),4.6*dt);}
    T.g.position.y=lerp(T.g.position.y,groundH(T.g.position.x,T.g.position.z)-1,Math.min(1,dt*2));T.walk+=dt*.85;if(T.J.banner)T.J.banner.rotation.x=Math.sin(gameTime*1.3)*.12;if(T.J.stacks&&Math.random()<dt*3){const st=T.J.stacks[Math.random()<.5?0:1];puff(st.getWorldPosition(new THREE.Vector3()).add(new THREE.Vector3(0,5,0)),1,0x2a2622,8);}const sw=Math.sin(T.walk);T.J.hipL.rotation.x=sw*.32;T.J.hipR.rotation.x=-sw*.32;T.J.kneeL.rotation.x=Math.max(0,-sw)*.45;T.J.kneeR.rotation.x=Math.max(0,sw)*.45;T.J.pelvis.position.y=15+Math.abs(Math.cos(T.walk))*.5;T.J.body.rotation.z=Math.cos(T.walk)*.03;
    const step=Math.sign(sw);if(step!==T.lastStep){T.lastStep=step;const dd=T.g.position.distanceTo(player.pos);if(dd<260){player.shake=Math.max(player.shake,Math.max(.05,.5-dd/500));if(actx)noiseHit(55,Math.max(.06,.35-dd/700),1.2);}}
    T.hornT-=dt;if(T.hornT<=0){T.hornT=22+Math.random()*16;titanHorn(T);}
    T.fireT-=dt;if(T.fireT<=0){T.fireT=3.5+Math.random()*3;titanFire(T);}}}
// 泰坦开火：我方泰坦专打远处成群的敌人；敌方泰坦轰击玩家附近（25 米以外）的阵地
function titanFire(T){let P=null;
  if(T.side==='loyal'){let best=null,bn=0;for(const e of enemies){if(!e.alive||e.g.position.distanceTo(player.pos)<22)continue;const n=enemies.filter(o=>o.alive&&o.g.position.distanceTo(e.g.position)<6).length;if(n>bn){bn=n;best=e;}}if(best)P=best.g.position.clone();}
  else{const a=Math.random()*6.28,r=22+Math.random()*20;P=player.pos.clone().add(new THREE.Vector3(Math.cos(a)*r,0,Math.sin(a)*r));P.x=clamp(P.x,-OPEN.R+3,OPEN.R-3);P.z=clamp(P.z,-OPEN.R+3,OPEN.R-3);}
  if(!P)return;const mz=Math.random()<.5?T.J.gunL:T.J.gunR;const from=new THREE.Vector3();mz.getWorldPosition(from);P.y=.3;
  const m=new THREE.Mesh(B3(.9,.9,from.distanceTo(P)),new THREE.MeshBasicMaterial({color:T.side==='loyal'?0xbfe8ff:0xff6030,fog:false}));m.position.copy(from).lerp(P,.5);m.lookAt(P);scene.add(m);beams.push({m,life:.22});
  const m2=new THREE.Mesh(B3(.3,.3,from.distanceTo(P)),new THREE.MeshBasicMaterial({color:0xffffff,fog:false}));m2.position.copy(m.position);m2.quaternion.copy(m.quaternion);scene.add(m2);beams.push({m:m2,life:.18});
  ringAt(P.x,.4,P.z,0xffc080,.6,11,.6,.4);puff(P.clone().setY(1),24,0x2a2420,4);hitSparks(P,new THREE.Vector3(0,1,0),26);dust(P,20);if(actx){noiseHit(60,.4,1.6);play('boom');}
  const d=P.distanceTo(player.pos);player.shake=Math.max(player.shake,Math.max(.15,1.1-d/40));
  for(const e of enemies)if(e.alive&&e.g.position.distanceTo(P)<7+e.r){const dir=e.g.position.clone().sub(P).setY(.5).normalize();damageEnemy(e,T.side==='loyal'?900:300,'body',dir,{_remote:true,knock:3,explode:true,how:{burst:{p:P,dir}}});}
  if(T.side!=='loyal'){if(state==='playing'&&d<7)hurtPlayer(60*(1-d/8),false,null);for(const a of allies)if(a.alive&&a.pos.distanceTo(P)<7)allyHurt(a,a.vehicle?600:120,null);}}
// 坦克装甲：普通爆弹和近战只打掉 40%；热熔、等离子、重爆弹、狙击、爆炸全额
function tankArmour(e,dmg,dir,opts){const w=WEAPONS[cur];const heavy=opts._remote||(opts.how&&(opts.how.melt||opts.how.burst||opts.how.hole))||(w&&['melta','plasma','hbolter','needle','flamer'].includes(w.id))||(opts.stagger||0)>=.8;
  if(!heavy&&Math.random()<.3){hitSparks(opts.point||e.g.position.clone().setY(1.5),dir?dir.clone().negate():new THREE.Vector3(0,1,0),3);play('clang');}return heavy?dmg:dmg*.4;}
// 载具驾驶：前方 7 米探测废墟，挡住就找最近的空方向绕；1.5 秒没挪动就倒车转向（以前会顶着墙一直卡住）
function driveVehicle(o,pos,yaw,want,mv,speed,dt,goal){if(goal&&mv>0&&NAV.ok){const nw=navWaypoint(o,pos,goal,2);if(nw)want=Math.atan2(nw.p.x-pos.x,nw.p.z-pos.z);}const probe=(y)=>{const o3=pos.clone();o3.y=1.2;const d=new THREE.Vector3(Math.sin(y),0,Math.cos(y));const h=castRayWalls(o3,d,7);if(h)return false;
    const p2=pos.clone().addScaledVector(d,5);return !colliders.some(b=>p2.x>b.minX-2&&p2.x<b.maxX+2&&p2.z>b.minZ-2&&p2.z<b.maxZ+2&&!(pos.x>b.minX-2.4&&pos.x<b.maxX+2.4&&pos.z>b.minZ-2.4&&pos.z<b.maxZ+2.4));};
  o.avoidT=Math.max(0,(o.avoidT||0)-dt);let target=want;
  if(o.revT>0){o.revT-=dt;yaw+=dt*.9*(o.revSide||1);pos.addScaledVector(new THREE.Vector3(Math.sin(yaw),0,Math.cos(yaw)),-speed*.7*dt);collide(pos,o.r||2.3);return yaw;}
  if(o.avoidT>0)target=o.avoidYaw;else if(mv>0&&!probe(want)){for(const k of [.6,-.6,1.2,-1.2,1.8,-1.8]){if(probe(want+k)){o.avoidYaw=want+k;o.avoidT=1.4;target=o.avoidYaw;break;}}}
  yaw+=clamp(wrapA(target-yaw),-dt*.85,dt*.85);const before=pos.clone();
  pos.addScaledVector(new THREE.Vector3(Math.sin(yaw),0,Math.cos(yaw)),mv*speed*dt*(Math.abs(wrapA(target-yaw))<.6?1:.35));collide(pos,o.r||2.3);
  const moved=before.distanceTo(pos);o.stuckT=moved<speed*dt*.25?(o.stuckT||0)+dt:Math.max(0,(o.stuckT||0)-dt*2);
  if(o.stuckT>1.5){o.stuckT=0;o.revT=1.4;o.revSide=Math.random()<.5?-1:1;o.avoidT=0;}
  if(Math.random()<dt*3)puff(pos.clone().add(new THREE.Vector3(Math.sin(yaw+Math.PI)*2.4,1.6,Math.cos(yaw+Math.PI)*2.4)),1,0x2a2a2a,1.2);return yaw;}
