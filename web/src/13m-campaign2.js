// ============================================================ 战役第二版：多阶段长关卡（每关 8–10 分钟）、中途换场景、双方空降增援、新玩法
// 新机制：campTransition 换地图（开放战场 ↔ 地下房间 ↔ 灰烬废土）· 我方空降增援 loyalReinforce · 战歌放大塔 pylon · 热熔炸药（按住 F）· 重爆弹机枪阵地（F 上去）
// ---------------- 换场景：淡出 → 重建地图（保留玩家状态和活着的队友）→ 淡入
function campRebuild(spec){for(const e of enemies)scene.remove(e.g);enemies=[];clearEbolts();for(const g of gibs)scene.remove(g.m);gibs=[];for(const b of bloods)scene.remove(b.m);bloods=[];
  for(const it of CAMP.inter||[])if(it.mesh&&it.mesh.parent)it.mesh.parent.remove(it.mesh);CAMP.inter=[];CAMP.guns=[];player.mounted=null;CAMP.wall=null;CAMP.wave=null;CAMP.pods=[];CAMP.wp=null;CAMP.flags.fireSky=!!spec.fireSky;
  seed=spec.seed;rng=mulberry32(seed);const ob=loadout.biome;loadout.biome=spec.biome||'sanctum';curBiome=pickBiome();loadout.biome=ob;
  if(spec.open)buildOpenField(spec.open);else{OPEN.on=false;OPEN.war=null;OPEN.titans=[];buildLevel();}
  document.body.classList.toggle('openmap',OPEN.on);if(spec.build)spec.build();try{mergeProps();}catch(err){}distCache=new Map();match.explored=new Set(['0,0']);
  player.pos.copy(spec.start);player.yaw=spec.yaw||0;player.vy=0;
  const live=allies.filter(a=>a.alive);live.forEach((a,i)=>{if(a.vehicle){a.parked=!spec.open;a.root.visible=!!spec.open;}const ang=player.yaw+(i-(live.length-1)/2)*.45;
    a.pos.set(spec.start.x+Math.sin(ang)*(a.vehicle?9:3.2),0,spec.start.z+Math.cos(ang)*(a.vehicle?9:3.2));collide(a.pos,a.r);a.hold=null;a.target=null;a.down=false;});
  if(spec.titan)spawnTitan(TITANCOL[spec.titan.col],spec.titan.path,{side:spec.titan.side});}
function campTransition(spec,title,done){const f=$('fade');f.style.transition='opacity .7s';f.style.opacity=1;state='scene';SC.on=true;SC.shots=[];document.body.classList.add('inscene');
  CAMP.trans={t:0,spec,title,done};}
function updateTransition(dt){const T=CAMP.trans;if(!T)return false;T.t+=dt;
  if(T.t>.8&&!T.built){T.built=true;campRebuild(T.spec);if(T.title)titleCard(T.title[0],T.title[1],3.2);camera.position.set(player.pos.x,player.pos.y+(CLS[cls].eye||1.6),player.pos.z);camera.rotation.set(0,player.yaw,0,'YXZ');}
  if(T.t>1.3){$('fade').style.opacity=0;}
  if(T.t>1.9){CAMP.trans=null;SC.on=false;document.body.classList.remove('inscene');state='playing';SC.endAt=performance.now();canvas.requestPointerLock?.();if(T.done)T.done();}return true;}
// ---------------- 我方空降增援
let rfSeq=0;
function loyalReinforce(n,near){if(!OPEN.on)return;const c=near||player.pos;const a0=player.yaw+Math.PI*(Math.random()<.5?.5:-.5);
  for(let i=0;i<Math.ceil(n/2);i++){const P=ringPt(c,10+Math.random()*6,a0+(i-.5)*.9);P.x=clamp(P.x,-OPEN.R+5,OPEN.R-5);P.z=clamp(P.z,-OPEN.R+5,OPEN.R-5);
    later(i*.9,()=>podDrop(P,(Q)=>{for(let k=0;k<2&&n-->0;k++){if(allies.filter(a=>a.alive).length>=14)return;const id='rf'+(++rfSeq);const nm=['Hask','Merin','Taddeus','Corvan','Iorek','Vasco','Lutor','Ameth','Dorn-born Sev','Kaleb'][rfSeq%10];
        ALLY_DEFS[id]={name:'Brother '+nm,legion:rfSeq%4===0?'ec':'soh',role:rfSeq%4===0?'blade':'bolter',hp:240,generic:true};const a=spawnAlly(id,Q.x+k*1.4,Q.z);a.yaw=-Math.PI/2;}}));}
  vox('fleet','Reinforcements inbound — drop pods on your position!',true);}
// ---------------- 战歌放大塔（静态目标）
ENEMY_BUILD.pylon=e=>{const P=e.parts;for(const k of ['head','armL','armR','legL','legR']){P[k].scale.setScalar(.01);P[k].position.set(0,1,0);}
  stripPart(P.body);P.body.geometry=B3(1.4,7,1.4);P.body.position.set(0,3.5,0);const A=new THREE.MeshLambertMaterial({map:texMetal,color:0x3a3036});P.body.material=A;e.mat=A;
  for(let i=0;i<4;i++)addTo(P.body,B3(1.7,.25,1.7),lmat(0x7a5e26),0,-2.8+i*1.9,0);const cr=addTo(P.body,new THREE.OctahedronGeometry(.9),lmat(0xb060ff,true),0,4.3,0);e.crystal=cr;
  for(const s of [-1,1])addTo(P.body,B3(.2,2.5,.2),lmat(0x1a1a1a),s*.9,4,0,0,0,s*.3);e.growl=1e9;e.r=1;e.pylon=true;};
ENEMY_AI.pylon=(e)=>{if(e.crystal){e.crystal.rotation.y+=.03;e.crystal.scale.setScalar(1+Math.sin(gameTime*4+e.id)*.12);}if(Math.random()<.02)ringAt(e.g.position.x,6,e.g.position.z,0xb060ff,.4,4,.6,.08);
  if(e.g.position.distanceTo(player.pos)<18)player.warp=Math.max(player.warp||0,.1);return true;};
// ---------------- 交互点（按住 F）：热熔炸药、下行通道等
function addInter(pos,label,time,onDone,color=0xff4020){const m=new THREE.Group();m.position.copy(pos);const r=new THREE.Mesh(new THREE.RingGeometry(1.4,1.7,32),new THREE.MeshBasicMaterial({color,transparent:true,opacity:.8,side:THREE.DoubleSide,depthWrite:false}));r.rotation.x=-Math.PI/2;r.position.y=.08;m.add(r);
  const l=new THREE.Mesh(new THREE.SphereGeometry(.18,8,6),new THREE.MeshBasicMaterial({color}));l.position.y=1.4;m.add(l);levelGroup.add(m);const it={pos:pos.clone(),label,time,prog:0,done:false,mesh:m,ring:r,light:l,onDone};(CAMP.inter=CAMP.inter||[]).push(it);return it;}
function updateInter(dt){let near=null;for(const it of CAMP.inter||[]){if(it.done)continue;it.light.visible=Math.sin(gameTime*8)>0;it.ring.rotation.z+=dt;const d=Math.hypot(player.pos.x-it.pos.x,player.pos.z-it.pos.z);if(d<3.2)near=it;}
  const pr=$('prompt');if(near&&state==='playing'&&!player.mounted){if(keys.KeyF){near.prog+=dt;if(Math.random()<dt*10)hitSparks(near.pos.clone().setY(1),new THREE.Vector3(0,1,0),2);}else near.prog=Math.max(0,near.prog-dt*.5);
    setProgress(near.prog/near.time,near.label);if(pr&&pr.style){pr.textContent=`Hold F — ${near.label}`;pr.style.opacity=1;}
    if(near.prog>=near.time){near.done=true;setProgress(-1);play('pickup');levelGroup.remove(near.mesh);near.onDone(near);}}
  else if(CAMP.inter&&CAMP.inter.some(i=>!i.done&&i.prog>0)){for(const i of CAMP.inter)i.prog=Math.max(0,i.prog-dt*.5);setProgress(-1);}}
// ---------------- 重爆弹机枪阵地（F 上去 / 下来）
function addGun(pos,yaw){const g=new THREE.Group();g.position.copy(pos);g.rotation.y=yaw;levelGroup.add(g);const D=lmat(0x1a1a1c),M=lmat(0x7a5e26),S=new THREE.MeshLambertMaterial({map:texMetal,color:0x4a4a46});
  const tri=new THREE.Mesh(new THREE.CylinderGeometry(.12,.3,1.1,6),D);tri.position.y=.55;g.add(tri);const piv=new THREE.Group();piv.position.y=1.15;g.add(piv);
  const body=new THREE.Mesh(B3(.34,.36,1.3),S);body.position.z=.2;piv.add(body);const br=new THREE.Mesh(new THREE.CylinderGeometry(.07,.08,1.2,8),D);br.rotation.x=Math.PI/2;br.position.set(0,.04,1.3);piv.add(br);
  const sh=new THREE.Mesh(B3(1.2,.5,.08),S);sh.position.set(0,-.12,.75);piv.add(sh);const box=new THREE.Mesh(B3(.3,.3,.4),M);box.position.set(-.32,-.05,.1);piv.add(box);const mz=new THREE.Object3D();mz.position.set(0,.04,1.95);piv.add(mz);
  for(const s of [-1,1])sandbags(pos.x+Math.sin(yaw)*1.6+Math.cos(yaw)*s*1.6,pos.z+Math.cos(yaw)*1.6-Math.sin(yaw)*s*1.6,2.2,yaw+Math.PI/2+s*.5);
  const G={g,piv,mz,pos:pos.clone(),yaw,heat:0,over:0,cd:0};(CAMP.guns=CAMP.guns||[]).push(G);return G;}
function updateGuns(dt){const pr=$('prompt');for(const G of CAMP.guns||[]){G.heat=Math.max(0,G.heat-dt*(G.over>0?18:28));G.over=Math.max(0,G.over-dt);G.cd-=dt;}
  const M=player.mounted;if(M){const seat=M.pos.clone().add(new THREE.Vector3(-Math.sin(M.yaw)*1.1,0,-Math.cos(M.yaw)*1.1));player.pos.x=seat.x;player.pos.z=seat.z;
    let dy=wrapA(player.yaw-(M.yaw+Math.PI));if(Math.abs(dy)>1.2)player.yaw=M.yaw+Math.PI+Math.sign(dy)*1.2;M.piv.rotation.set(-player.pitch,wrapA(player.yaw-(M.yaw+Math.PI)),0);view.visible=false;
    if(mouseDown&&M.over<=0&&M.cd<=0&&state==='playing'){M.cd=.065;M.heat+=7;const from=new THREE.Vector3();M.mz.getWorldPosition(from);const {o,d}=aimRay(0);const aim=o.clone().addScaledVector(d,60);
      fireBolt(from,aim,{...EWEAP.heavyb,spread:.02,snd:'bolter'},'loyal',34,null);player.shake=Math.max(player.shake,.06);puff(from,1,0x6a5a4a,.6);if(M.heat>=100){M.over=2.2;play('vent');announce('Overheated — venting',1);}}
    setProgress(M.over>0?1-M.over/2.2:M.heat/100,M.over>0?'VENTING':'HEAT');if(pr&&pr.style){pr.textContent='Heavy bolter — LMB fire · F dismount';pr.style.opacity=1;}}
  else for(const G of CAMP.guns||[])if(G.pos.distanceTo(player.pos)<2.6&&pr&&pr.style){pr.textContent='Press F — man the heavy bolter';pr.style.opacity=1;}}
function toggleMount(){if(!CAMP.on)return false;if(player.mounted){player.mounted=null;view.visible=true;setProgress(-1);play('equip');return true;}
  const G=(CAMP.guns||[]).find(G=>G.pos.distanceTo(player.pos)<2.6);if(G){player.mounted=G;player.yaw=G.yaw+Math.PI;play('equip');return true;}return false;}
// ---------------- 叛军炮兵阵地（3-3：要靠热熔炸药炸掉，炸掉之前一直炮击宫殿）
function addArtillery(pos,yaw){const g=new THREE.Group();g.position.copy(pos);g.rotation.y=yaw;levelGroup.add(g);const A=new THREE.MeshLambertMaterial({map:texMetal,color:0x2f5a52}),D=lmat(0x141414);
  const hull=new THREE.Mesh(B3(3,1.4,5),A);hull.position.y=.9;g.add(hull);for(const s of [-1,1]){const t=new THREE.Mesh(B3(.7,1,5.4),D);t.position.set(s*1.7,.5,0);g.add(t);}
  const gun=new THREE.Mesh(new THREE.CylinderGeometry(.22,.3,6,10),D);gun.position.set(0,2.8,1.2);gun.rotation.x=-.7;g.add(gun);const bk=new THREE.Mesh(B3(1.8,1.2,1.6),A);bk.position.set(0,2,-.6);g.add(bk);
  wallMeshes.push(hull);colliders.push({minX:pos.x-2.8,maxX:pos.x+2.8,minZ:pos.z-2.8,maxZ:pos.z+2.8});const art={g,pos:pos.clone(),alive:true,fireT:3+Math.random()*3,gun};(CAMP.arts=CAMP.arts||[]).push(art);
  addInter(pos.clone().add(new THREE.Vector3(Math.sin(yaw)*3.4,0,Math.cos(yaw)*3.4)),'Plant melta charge',3,()=>{vox('kaedric','Charge set — get clear!',true);later(4,()=>{art.alive=false;const P=art.pos.clone();ringAt(P.x,1,P.z,0xff8030,.5,12,.7,.4);puff(P.clone().setY(2),30,0x2a2420,4);hitSparks(P.clone().setY(2),new THREE.Vector3(0,1,0),30);play('boom');play('melta');
      player.shake=Math.max(player.shake,P.distanceTo(player.pos)<30?1:.3);art.g.children.forEach(c=>{if(c.material)c.material=lmat(0x1a1816);});addFire(P.x,2.5,P.z,2);
      for(const e of enemies)if(e.alive&&e.g.position.distanceTo(P)<8)damageEnemy(e,999,'body',e.g.position.clone().sub(P).normalize(),{_remote:true,explode:true,how:{burst:{p:P,dir:e.g.position.clone().sub(P).normalize()}}});
      vox('ardan','Battery destroyed!',true);});},0xff6020);return art;}
function updateArtillery(dt){for(const A of CAMP.arts||[]){if(!A.alive)continue;A.fireT-=dt;if(A.fireT>0)continue;A.fireT=5+Math.random()*3;const from=A.gun.getWorldPosition(new THREE.Vector3());puff(from.clone().setY(from.y+2),6,0x4a4038,2);
    if(from.distanceTo(player.pos)<45){play('boom');player.shake=Math.max(player.shake,.2);}
    const P=V3((Math.random()-.5)*20,0,(Math.random()-.5)*20);const m=new THREE.Mesh(new THREE.SphereGeometry(.4,8,6),lmat(0xffc060,true));m.position.set(P.x,45,P.z);scene.add(m);ringAt(P.x,.1,P.z,0xff3020,1,3.5,1.6,.06);
    (CAMP.fires=CAMP.fires||[]).push({m,a:m.position.clone(),b:P,t:0,dur:1.6,shell:true});}}
// ============================================================ 关卡数据（覆盖第一版）
Object.assign(CLEVELS['3-1'],{obj:['Secure the drop zone','Destroy the vox-choir pylons','Hold the line','Advance to the Sirenhold','Silence the Warsingers','Descend into the Undercroft','Hunt the Choir-Mistress'],
  allies:['ardan','vell','krosk','lucan','tavik','leg1','leg2']});
Object.assign(CLEVELS['3-2'],{obj:['Reach the bunkers before the virus does','Reach the deep vault','Survive the traitor kill-teams','Link up with Captain Tarvitz','Make for the Precentor’s Palace'],
  allies:['ardan','vell','krosk','lucan','tavik','leg1','leg2','leg3']});
Object.assign(CLEVELS['3-3'],{obj:['Hold the palace','Hold the palace','Silence the traitor artillery','Return to the palace','Hold the palace','Face Oren Malk'],
  allies:['ardan','krosk','lucan','tavik','hesk','tarvitz','leg1','leg3','leg4']});
const MAPS={
  choral31b:{seed:3111,biome:'sanctum',start:V3(0,0,0),yaw:0},
  bunker32:{seed:3121,biome:'sanctum',start:V3(0,0,0),yaw:0},
  ash32:{seed:3122,biome:'sanctum',open:'ash',start:V3(0,0,60),yaw:0,fireSky:true,build(){bunkerGate(0,66);palaceRing(0,-48);}}};
const waveDone=()=>campAlive()===0&&CAMP.timers.length===0&&!(CAMP.pods&&CAMP.pods.some(q=>!q.done));
CSTEPS['3-1']=[
  // A. 降落场
  {enter(){CAMP.wave1=0;CAMP.wT=1.5;},update(dt){CAMP.wT-=dt;if(CAMP.wave1<3&&CAMP.wT<=0&&campAlive()<5){CAMP.wave1++;CAMP.wT=8;const c=V3((CAMP.wave1-2)*22,0,32);openSpawn('militia',10,c,3,12);if(CAMP.wave1>=2)openSpawn('warsinger',1,c,8,14);
      if(CAMP.wave1===2)later(3,()=>loyalReinforce(2));if(CAMP.wave1===3){const t=spawnEnemy('rtank',-14,30);t.campaign=true;t.hullYaw=Math.PI;vox('ardan','Rebel armour on the left flank!',true);}}
    return CAMP.wave1>=3&&waveDone();}},
  // B. 摧毁三座战歌放大塔
  {enter(){CAMP.pyl=[[-32,22],[30,8],[-8,-12]].map(([x,z])=>{const p=spawnEnemy('pylon',x,z);p.campaign=true;return p;});CAMP.pylAmb=new Set();spawnTitan(TITANCOL.loyal,[V3(125,0,80),V3(125,0,-80),V3(70,0,-125),V3(125,0,80)]);
      vox('tavik','Those spires — vox-choir pylons. They amplify the Warsingers’ song across the whole city. Bring them down.',true);later(6,()=>vox('loken','Titan support is walking with us. Legio Solaria — mind their fire lanes.',true));},
    mark:e=>e.type==='pylon',update(){for(const p of CAMP.pyl){if(!p.alive||CAMP.pylAmb.has(p.id))continue;if(p.g.position.distanceTo(player.pos)<32){CAMP.pylAmb.add(p.id);openSpawn('militia',8,p.g.position,4,12,{minP:12});openSpawn('warsinger',2,p.g.position,3,8,{minP:12});}}
      const left=CAMP.pyl.filter(p=>p.alive).length;if(left!==CAMP.pylLeft){if(CAMP.pylLeft!==undefined&&left<CAMP.pylLeft)vox('tavik',left?`Pylon down. ${left} remain.`:'The last pylon falls. The song weakens.',true);CAMP.pylLeft=left;}
      return left===0&&campAlive(e=>e.type==='militia'||e.type==='warsinger')<=3;}},
  // C. 防线：机枪阵地抵挡反扑
  {enter(){CAMP.wp=V3(0,0,-4);CAMP.wpName='HOLD';const g=addGun(V3(0,0,-6),Math.PI);CAMP.holdN=0;CAMP.hT=4;vox('loken','Praal is throwing everything at you. Hold that line — there’s a heavy bolter on the barricade.',true);},
    update(dt){if(player.pos.distanceTo(V3(0,0,-4))<10)CAMP.wp=null;CAMP.hT-=dt;if(CAMP.holdN<3&&CAMP.hT<=0&&campAlive()<8){CAMP.holdN++;CAMP.hT=12;openSpawn('militia',12,V3((CAMP.holdN-2)*20,0,-34),3,12,{minP:20});
        if(CAMP.holdN===2){for(const x of [-20,20]){const t=spawnEnemy('rtank',x,-42);t.campaign=true;t.hullYaw=0;}vox('krosk','Two more tanks! Lascannons — anyone!',true);}if(CAMP.holdN===3){openSpawn('warsinger',3,V3(0,0,-30),3,8,{minP:20});later(2,()=>loyalReinforce(2,V3(0,0,-2)));}}
      return CAMP.holdN>=3&&waveDone();}},
  // D. 推进到 Sirenhold
  {enter(){if(player.mounted)toggleMount();CAMP.wp=V3(0,0,-36);CAMP.wpName='SIRENHOLD';CAMP.amb=0;vox('loken','The line holds. Now — the Sirenhold. Push!',true);
      later(14,()=>vox('malk','Kaedric, it’s Malk. Listen — stay close to the Sirenhold. Whatever happens. Trust me on this.',true));later(19,()=>vox('kaedric','Malk? Why aren’t you down here with us, brother?',true));later(24,()=>vox('malk','…The Warmaster has other work for me. Good hunting.',true));},
    update(){if(CAMP.amb===0&&player.pos.z<-18){CAMP.amb=1;openSpawn('militia',10,V3(0,0,-30),4,14);}return player.pos.distanceTo(CAMP.wp)<10;}},
  // E. 合唱团
  {enter(){openSpawn('warsinger',5,V3(0,0,-50),3,9,{minP:6});openSpawn('militia',12,V3(0,0,-48),3,10,{minP:6});CAMP.wp=V3(0,0,-50);CAMP.wpName='CHOIR';vox('tavik','The choir — five of them. Their song is in my skull. Silence them!',true);},
    mark:e=>e.type==='warsinger',update(){return campAlive(e=>e.type==='warsinger')===0;}},
  // F. 下到地下圣堂
  {enter(){CAMP.wp=V3(0,0,-56);CAMP.wpName='UNDERCROFT';addInter(V3(0,0,-56),'Force the undercroft gate',2.5,()=>{CAMP.wentDown=true;campTransition(MAPS.choral31b,['THE UNDERCROFT','Beneath the Sirenhold'],()=>{vox('tavik','She is down here. The Choir-Mistress. Every song in this city begins with her.',true);});},0xffd070);
      vox('loken','Praal’s Choir-Mistress went to ground beneath the cathedral. Dig her out.',true);},update(){return CAMP.wentDown&&!CAMP.trans&&!OPEN.on;}},
  // G. 地下：猎杀合唱团女主
  {enter(){const [ti,tj]=farCell();CAMP.target=[ti,tj];CAMP.path=campPath(ti,tj);CAMP.wp=cellC(ti,tj);CAMP.wpName='CHOIR-MISTRESS';CAMP.amb=new Set(['0,0']);CAMP.boss=null;},
    mark:e=>e.named||e.type==='warsinger',update(){const [pi,pj]=cellOf(player.pos),k=pi+','+pj;
      if(!CAMP.amb.has(k)&&!(pi===CAMP.target[0]&&pj===CAMP.target[1])){CAMP.amb.add(k);campSpawn('militia',pi,pj,5,{rmin:5,rmax:8});if(Math.random()<.6)campSpawn('warsinger',pi,pj,1,{rmin:6,rmax:8});}
      if(!CAMP.boss&&pi===CAMP.target[0]&&pj===CAMP.target[1]){const [b]=campSpawn('warsinger',pi,pj,1,{rmin:3,rmax:5});b.hp=b.maxHp=b.maxHp*7;b.named='Choir-Mistress Ysolde';b.g.scale.setScalar(1.35);b.dmg*=1.4;CAMP.boss=b;campSpawn('warsinger',pi,pj,3,{rmin:5,rmax:8});CAMP.wp=null;
        vox('tavik','There — the Mistress! Do not let her finish the hymn!',true);}
      if(CAMP.boss&&CAMP.boss.alive&&Math.random()<.004)CAMP.boss.singT=0;
      return CAMP.boss&&!CAMP.boss.alive&&campAlive()<=2;}}];
CSTEPS['3-2']=[
  // A. 病毒墙追赶，跑到地堡
  {...CSTEPS['3-2'][0]},
  // B. 地堡隧道：病毒在后面一层层灌进来
  {enter(){campTransition(MAPS.bunker32,['THE BUNKERS','Beneath the Precentor’s Palace'],()=>{const [ti,tj]=farCell();CAMP.target=[ti,tj];CAMP.wp=cellC(ti,tj);CAMP.wpName='DEEP VAULT';CAMP.amb=new Set(['0,0']);CAMP.limit=95;
      CAMP.wave={t:0,delay:10,per:11,d:bfs(0,0),dead:new Set(),fogs:[]};vox('loken','The virus is pouring in behind you! The deep vault — seal yourselves in!',true);});},
    update(dt){if(!CAMP.wave||CAMP.trans)return false;CAMP.limit-=dt;setProgress(Math.max(0,CAMP.limit/95),'Virus breach '+Math.ceil(Math.max(0,CAMP.limit))+'s');
      const [pi,pj]=cellOf(player.pos),k=pi+','+pj;if(!CAMP.amb.has(k)&&!(pi===CAMP.target[0]&&pj===CAMP.target[1])){CAMP.amb.add(k);campSpawn('militia',pi,pj,4,{rmin:5,rmax:8});}
      if(CAMP.limit<=0&&state==='playing')hurtPlayer(9999,true);return player.pos.distanceTo(CAMP.wp)<6;}},
  // C. 关门、火风暴过去，再走出去——外面已是灰烬，叛军空降小队来清扫幸存者
  {enter(){setProgress(-1);for(const f of (CAMP.wave&&CAMP.wave.fogs)||[])scene.remove(f);CAMP.wave=null;CAMP.bunker=player.pos.clone().add(V3(0,0,6));CAMP.outro['3-2'](()=>{campTransition(MAPS.ash32,['AFTERMATH','The Choral City is ash'],()=>{CAMP.flags.fireSky=true;
        vox('tavik','They are coming down to finish it. Drop pods — Sons of Horus.',true);later(3,()=>traitorPods('soh',3,5,player.pos));later(16,()=>traitorPods('soh',2,5,player.pos));CAMP.kt=0;});});},
    update(){return !CAMP.trans&&OPEN.on&&CAMP.timers.length===0&&waveDone()&&CAMP.kt===0;}},
  // D. 和塔维兹会合（帝皇之子的忠诚派从废墟里杀出来）
  {enter(){const P=V3(-38,0,20);CAMP.wp=P.clone();CAMP.wpName='TARVITZ';const t=spawnAlly('tarvitz',P.x,P.z);t.hold=P.clone();for(let i=0;i<2;i++){const id='ecl'+i;ALLY_DEFS[id]={name:['Brother Ancelin','Brother Vespasian'][i],legion:'ec',role:'blade',hp:260,generic:true};const a=spawnAlly(id,P.x+2+i,P.z+2);a.hold=P.clone().add(V3(2+i,0,2));}
      traitorPods('ec',2,4,P);vox('tarvitz','Vorne! Over here — we’re pinned by my own Legion’s blades!',true);},
    update(){if(!CAMP.met&&CAMP.wp&&player.pos.distanceTo(CAMP.wp)<14){CAMP.met=true;CAMP.wp=null;}return CAMP.met&&waveDone();}},
  // E. 一起杀回宫殿
  {enter(){for(const a of allies)a.hold=null;CAMP.wp=V3(0,0,-48);CAMP.wpName='PALACE';vox('tarvitz','Loken is gathering everyone at the Precentor’s Palace. We make our stand there.',true);later(8,()=>traitorPods('soh',2,4,V3(0,0,-20)));later(9,()=>{const t=spawnEnemy('tpred',-40,-40);t.campaign=true;t.hullYaw=.8;});},
    update(){return player.pos.distanceTo(CAMP.wp)<9&&campAlive()<=3;}}];
const CSTEPS3old=CSTEPS['3-3'].slice();
CSTEPS['3-3']=[
  CSTEPS3old[0],CSTEPS3old[1],
  // 出击：炸掉两门叛军火炮
  {enter(){CAMP.arts=[];addArtillery(V3(-52,0,-44),.7);addArtillery(V3(50,0,40),-2.4);for(const A of CAMP.arts){openSpawn('soh',5,A.pos,4,10,{minP:20});}
      vox('loken','Traitor artillery is walking shells into the palace. Two batteries — east and west. Plant melta charges and bring them down!',true);CAMP.wpName='BATTERY';},
    update(){const live=CAMP.arts.filter(a=>a.alive);CAMP.wp=live.length?live.reduce((b,a)=>a.pos.distanceTo(player.pos)<b.pos.distanceTo(player.pos)?a:b).pos.clone():null;
      if(!CAMP.artWave&&live.length===1){CAMP.artWave=1;traitorPods('soh',2,4,live[0].pos);loyalReinforce(2);}return live.length===0;}},
  // 回到宫殿
  {enter(){CAMP.wp=V3(0,0,0);CAMP.wpName='PALACE';vox('lucan','Both batteries silenced. Back to the palace — they’re massing for the final push!',true);},update(){return player.pos.distanceTo(V3(0,0,0))<12;}},
  {...CSTEPS3old[2],enter(){CAMP.wp=null;CSTEPS3old[2].enter();}},
  CSTEPS3old[3]];
// 战役更新：加入换场景、交互、机枪、炮兵
const _updCamp=updateCampaign;updateCampaign=function(dt){if(updateTransition(dt)){updateVox(dt);return;}updateInter(dt);updateGuns(dt);updateArtillery(dt);_updCamp(dt);};
// F 键：先尝试机枪阵地
addEventListener('keydown',e=>{if(e.code==='KeyF'&&!e.repeat&&CAMP.on&&state==='playing')toggleMount();},true);
