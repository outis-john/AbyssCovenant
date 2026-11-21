// ============================================================ 忠诚派队友（AI）：关节式星际战士模型、跟随 / 交火 / 拼刀 / 受伤 / 倒地 / 阵亡、无线电喊话、头顶名牌
let allies=[];
const ALLY_DEFS={
  ardan:{name:'Brother Ardan',legion:'soh',role:'bolter',hp:300},
  vell: {name:'Brother Vell',legion:'soh',role:'bolter',hp:280},
  krosk:{name:'Brother Krosk',legion:'we',role:'melee',hp:340},
  lucan:{name:'Brother Lucan',legion:'ec',role:'blade',hp:300},
  tarvitz:{name:'Captain Saul Tarvitz',legion:'ec',role:'blade',hp:620,essential:true},
  tavik:{name:'Librarian Tavik',legion:'lib',role:'psyker',hp:360,essential:true},
  hesk: {name:'Ancient Hesk',legion:'soh',role:'dread',hp:2200,big:true,essential:false}};
['Sabik','Orrin','Daelus','Kell','Varo','Thane'].forEach((n,i)=>{ALLY_DEFS['leg'+(i+1)]={name:'Brother '+n,legion:i===4?'we':'soh',role:i===4?'melee':'bolter',hp:240,generic:true};});
const ALLY_COL={soh:{armor:0x4a8474,trim:0x1a1d1e,metal:0x7a5e26},we:{armor:0xe0dcd2,trim:0x2a52a8,metal:0x8a8a8a},ec:{armor:0x6a2c80,trim:0x8a6a22,metal:0x9a7a2a},lib:{armor:0x2c4c80,trim:0x141820,metal:0x8a6e2a}};
const VOX_COL={kaedric:'#e8d8b0',ardan:'#9fd8c8',vell:'#9fd8c8',krosk:'#a8c0ff',lucan:'#e0a8ff',tavik:'#8fb8ff',hesk:'#d8c890',loken:'#c8e8d8',malk:'#ff9a7a',tarvitz:'#e8b8ff',fleet:'#ffd080',angron:'#ff5040'};
function buildAllyModel(def){const C=ALLY_COL[def.legion]||ALLY_COL.soh;const A=new THREE.MeshLambertMaterial({map:texMetal,color:C.armor}),T=lmat(C.trim),M=lmat(C.metal);
  const root=new THREE.Group(),J={};const box=(p,w,h,d,x,y,z,m=A)=>{const b=new THREE.Mesh(B3(w,h,d),m);b.position.set(x,y,z);p.add(b);return b;};
  const grp=(p,x,y,z)=>{const g=new THREE.Group();g.position.set(x,y,z);p.add(g);return g;};
  // 腿（髋、膝两个关节）
  for(const s of [-1,1]){const hip=grp(root,s*.27,.95,0);box(hip,.36,.5,.4,0,-.25,0);const knee=grp(hip,0,-.5,0);box(knee,.34,.46,.38,0,-.22,0);box(knee,.38,.2,.1,0,-.02,.21,T);box(knee,.4,.2,.52,0,-.42,.06,T);
    J[s<0?'hipL':'hipR']=hip;J[s<0?'kneeL':'kneeR']=knee;}
  // 躯干（腰关节）
  const torso=grp(root,0,.98,0);J.torso=torso;box(torso,1.0,1.0,.66,0,.5,0);box(torso,.72,.34,.06,0,.74,.34,T);box(torso,1.04,.16,.7,0,.04,0,T);box(torso,.88,.8,.42,0,.62,-.52);
  for(const s of [-1,1]){const c=new THREE.Mesh(new THREE.CylinderGeometry(.08,.1,.32,8),M);c.position.set(s*.24,1.12,-.6);torso.add(c);}
  // 忠诚派的象牙色布罩，一眼和叛军分开
  if(def.legion!=='lib'){const cl=new THREE.Mesh(new THREE.PlaneGeometry(.42,.95),new THREE.MeshLambertMaterial({color:0xe8e0c8,side:THREE.DoubleSide}));cl.position.set(0,-.4,.35);torso.add(cl);J.cloth=cl;
    box(torso,.46,.08,.04,0,.08,.36,M);}
  if(def.legion==='soh'){const w=new THREE.Mesh(new THREE.CylinderGeometry(.1,.1,.03,12),lmat(0xe8e0c8));w.rotation.x=Math.PI/2;w.position.set(0,.74,.38);torso.add(w);}
  // 头（颈关节）：蓝白目镜
  const head=grp(torso,0,1.12,.02);J.head=head;box(head,.44,.46,.5,0,.2,0);const EYE=lmat(def.legion==='lib'?0x80c0ff:0xbfe8ff,true);
  box(head,.13,.06,.04,-.1,.24,.26,EYE);box(head,.13,.06,.04,.1,.24,.26,EYE);box(head,.2,.13,.06,0,.08,.26,M);box(head,.07,.07,.46,0,.45,0);
  if(def.legion==='ec')box(head,.05,.2,.5,0,.54,-.02,M);if(def.legion==='we')box(head,.1,.47,.52,0,.2,0,T);
  if(def.legion==='lib'){const hood=grp(torso,0,1.2,-.32);box(hood,.7,.5,.18,0,.15,0,M);for(const s of [-1,0,1]){const c=new THREE.Mesh(new THREE.CylinderGeometry(.03,.03,.5,6),lmat(0x60a0ff,true));c.position.set(s*.2,.3,.02);hood.add(c);}J.hood=hood;}
  // 手臂（肩、肘两个关节）+ 大肩甲
  for(const s of [-1,1]){const sh=grp(torso,s*.7,.82,.04);const pa=new THREE.Mesh(new THREE.SphereGeometry(.32,10,6,0,Math.PI*2,0,Math.PI/2),A);pa.scale.set(1.15,.85,1.2);pa.position.y=.1;sh.add(pa);
    const rim=new THREE.Mesh(new THREE.TorusGeometry(.33,.03,4,14),M);rim.rotation.x=Math.PI/2;rim.scale.set(1.15,1.2,1);rim.position.y=.1;sh.add(rim);
    box(sh,.3,.46,.32,0,-.2,0);const el=grp(sh,0,-.44,0);box(el,.28,.42,.3,0,-.2,0);box(el,.34,.26,.36,0,-.38,.02,T);J[s<0?'shL':'shR']=sh;J[s<0?'elL':'elR']=el;}
  // 武器
  let muzzle=null,blade=null;
  if(def.role==='bolter'){muzzle=gunBolter(J.elR);J.elR.children.at(-1).position.set(0,-.36,.14);}
  else if(def.role==='melee'){blade=chainAxe(J.elR);}
  else if(def.role==='blade'){blade=powerSword(J.elR);muzzle=gunLas(J.elL);}
  else if(def.role==='psyker'){const st=grp(J.elR,0,-.4,.06);const c=new THREE.Mesh(new THREE.CylinderGeometry(.035,.035,1.9,6),lmat(0x3a2a1a));c.position.y=-.2;st.add(c);
    const orb=new THREE.Mesh(new THREE.OctahedronGeometry(.14),lmat(0x80c0ff,true));orb.position.y=-1.2;st.add(orb);J.orb=orb;muzzle=gunBolter(J.elL);}
  // 头顶绿色箭头：一眼认出队友
  const chev=new THREE.Mesh(new THREE.ConeGeometry(.12,.22,3),new THREE.MeshBasicMaterial({color:0x60ff90,transparent:true,opacity:.85,depthTest:false}));chev.rotation.x=Math.PI;chev.position.y=2.95;chev.renderOrder=5;root.add(chev);J.chev=chev;
  return {root,J,mat:A,muzzle,blade};}
function spawnAlly(id,x,z,yaw=0){const def=ALLY_DEFS[id];let a;
  if(def.role==='dread'){const root=buildCharacter('walker');root.position.set(x,0,z);scene.add(root);const chev=new THREE.Mesh(new THREE.ConeGeometry(.2,.35,3),new THREE.MeshBasicMaterial({color:0x60ff90,depthTest:false}));chev.rotation.x=Math.PI;chev.position.y=5.4;chev.renderOrder=5;root.add(chev);
    const mz=new THREE.Object3D();mz.position.set(-1.3,2.6,1.6);root.add(mz);a={root,J:{chev},mat:null,muzzle:mz};}
  else{a=buildAllyModel(def);a.root.position.set(x,0,z);scene.add(a.root);}
  Object.assign(a,{id,def,name:def.name,pos:a.root.position,yaw,hp:def.hp,maxHp:def.hp,alive:true,down:false,big:!!def.big,r:def.big?.9:.45,role:def.role,target:null,scanT:Math.random()*.4,
    burst:0,shotT:0,fireCd:Math.random(),swing:0,swingCd:0,walk:0,lastHit:-9,flash:0,hold:null,psyCd:3,aimK:0,deathT:0});
  allies.push(a);return a;}
function clearAllies(){for(const a of allies)scene.remove(a.root);allies=[];const t=$('allyTags');if(t&&t.innerHTML!==undefined)t.innerHTML='';}
function allyTargets(){const t=[];for(const a of allies)if(a.alive&&!a.down&&!a.parked)t.push({pos:a.pos,ally:a});return t;}
function allyHurt(a,n,src){if(!a||!a.alive||a.down||a.invuln)return;n*=a.big?.5:.6;a.hp-=n;a.lastHit=gameTime;a.flash=.1;a.flinch=Math.min(1,(a.flinch||0)+.6);if(src&&src.alive&&!a.target)a.target=src;
  if(a.hp<a.maxHp*.35&&Math.random()<.15)bark(a,'hurt');
  if(a.hp<=0){if(a.vehicle){allyVehicleDie(a);return;}if(a.def.essential){a.down=true;a.hp=0;a.downT=9;bark(a,'down');}else allyDie(a);}}
function allyDie(a,silent){if(!a.alive)return;a.alive=false;a.deathT=0;a.fallDir=Math.random()<.5?-1:1;spawnBlood(a.pos.clone().setY(1.3),null,30);if(a.J.chev)a.J.chev.visible=false;
  if(!silent){play('hurt');const o=allies.find(b=>b.alive&&b!==a&&!b.down);if(o)vox(o.id,ALLY_LINES.lost[Math.floor(Math.random()*ALLY_LINES.lost.length)].replace('#',a.name.split(' ').pop()),true);}}
const ALLY_LINES={
  contact:['Contact! Rebels on the galleries!','Hostiles, moving to engage!','Eyes front — they’re coming through the arches!','Targets sighted. Open fire!'],
  contactAst:['Legionaries! Those are Astartes!','Sons of Horus... our own brothers.','World Eaters, charging! Brace!','Emperor’s Children — watch their blades!'],
  kill:['Target down.','Another one for the pyre.','Clear.','That one’s finished.','Down he goes.'],
  hurt:['I’m hit — still standing!','Armour breached, I can fight!','Taking fire!'],
  down:['I’m down... give me a moment...','Can’t... rise... cover me!'],
  up:['I’m back. Let’s finish this.','On my feet, brothers.'],
  lost:['# is down!','We’ve lost #!','Brother #... rest now.']};
function bark(a,k,force){const L=ALLY_LINES[k];if(!L||!a)return;vox(a.id,L[Math.floor(Math.random()*L.length)],force);}
// 跨房间寻路：和敌人用同一套门洞 BFS
function navStep(pos,goal,o){if(NAV.ok&&o){const w=navWaypoint(o,pos,goal,1);if(w)return w.p.clone();}if(OPEN.on)return goal.clone();const [ei,ej]=cellOf(pos),[gi,gj]=cellOf(goal);if(ei===gi&&ej===gj)return goal.clone();
  const d=distFor(gi,gj);let best=null,bd=d[ei][ej];for(const [x,y] of [[1,0],[-1,0],[0,1],[0,-1]]){const ni=ei+x,nj=ej+y;if(ni<0||nj<0||ni>=G||nj>=G||!connected(ei,ej,ni,nj))continue;if(d[ni][nj]<bd){bd=d[ni][nj];best=[ni,nj];}}
  if(!best)return goal.clone();const door=new THREE.Vector3((ei+best[0])/2*C,0,(ej+best[1])/2*C);return door.distanceTo(pos)<1.6?new THREE.Vector3(best[0]*C,0,best[1]*C):door;}
function allyLOS(a,e){const o=a.pos.clone();o.y+=a.big?3:2.1;const t=e.g.position.clone();t.y+=1.3*e.g.scale.y;const d=t.clone().sub(o);const L=d.length();return !castRayWalls(o,d.divideScalar(L),L);}
// 身体碰撞：玩家、队友、敌人互相推开，谁也穿不过谁（玩家被推得少一些，手感不黏）
function separateBodies(){const B=[];const pr=CLS[cls]&&CLS[cls].r||.45;if(state==='playing'||state==='scene')B.push({p:player.pos,r:pr,w:.25});
  for(const a of allies)if(a.alive&&!a.parked)B.push({p:a.pos,r:a.r+.08,w:a.big?.15:1});
  for(const e of enemies)if(e.alive&&!e.lifted&&!e.inHole&&!e.static&&!e.leap)B.push({p:e.g.position,r:e.r+.05,w:e.vehicle?.04:e.heavy?.2:e.boss?.1:.8});
  for(let i=0;i<B.length;i++)for(let j=i+1;j<B.length;j++){const A=B[i],C2=B[j];const dx=C2.p.x-A.p.x,dz=C2.p.z-A.p.z,R=A.r+C2.r;const d2=dx*dx+dz*dz;if(d2>=R*R)continue;
    const d=Math.sqrt(d2)||.001,o=R-d,nx=dx/d,nz=dz/d,wt=A.w+C2.w||1;A.p.x-=nx*o*A.w/wt;A.p.z-=nz*o*A.w/wt;C2.p.x+=nx*o*C2.w/wt;C2.p.z+=nz*o*C2.w/wt;}}
function updateAllies(dt){
  for(const a of allies){const J=a.J;if(a.parked)continue;if(a.vehicle){if(a.alive)updateAllyVehicle(a,dt);continue;}
    if(!a.alive){if(a.deathT<1.2){a.deathT+=dt;const k=Math.min(1,a.deathT/.9),e=1-Math.pow(1-k,3);
        if(a.big){a.root.rotation.z=a.fallDir*e*.35;a.pos.y=-e*.4;}
        else{const kn=Math.min(1,k*2.2);J.kneeL.rotation.x=J.kneeR.rotation.x=kn*1.6;J.hipL.rotation.x=J.hipR.rotation.x=-kn*.6;a.pos.y=-kn*.5;
          a.root.rotation.x=-Math.max(0,k-.35)/.65*1.35;J.torso.rotation.x=e*.25;J.head.rotation.x=e*.5;J.shR.rotation.x=-e*.4;J.shL.rotation.x=-e*.2;J.shR.rotation.z=-e*.8;J.shL.rotation.z=e*.8;}}continue;}
    if(a.flash>0)a.flash-=dt;if(a.mat)a.mat.emissive.setHex(a.flash>0?0x502020:0);
    if(gameTime-a.lastHit>6)a.hp=Math.min(a.maxHp,a.hp+a.maxHp*.03*dt);
    a.flinch=Math.max(0,(a.flinch||0)-dt*4);a.recoil=Math.max(0,(a.recoil||0)-dt*9);
    if(a.down){a.downT-=dt;a.vel&&a.vel.set(0,0,0);if(J.kneeL){J.hipL.rotation.x=-1.3;J.kneeL.rotation.x=1.6;J.hipR.rotation.x=.2;J.kneeR.rotation.x=1.4;J.torso.position.y=.5;J.torso.rotation.x=.45+Math.sin(gameTime*2)*.05;J.shR.rotation.set(-.3,0,0);J.shL.rotation.set(.2,0,.3);J.head.rotation.x=.4;}
      if(a.downT<=0){a.down=false;a.hp=a.maxHp*.45;J.torso.position.y=.98;J.torso.rotation.x=0;J.head.rotation.x=0;bark(a,'up',true);}continue;}
    // 选目标
    a.scanT-=dt;if(a.scanT<=0){a.scanT=.35+Math.random()*.25;let best=null,bd=a.role==='melee'||a.role==='blade'?18:34,cur=a.target&&a.target.alive?a.target:null;
      for(const e of enemies){if(!e.alive||e.lifted)continue;const d=e.g.position.distanceTo(a.pos)-(e===cur?4:0);if(d<bd&&allyLOS(a,e)){bd=d;best=e;}}
      if(best&&!cur&&gameTime-(a.contactT||-99)>20){a.contactT=gameTime;bark(a,best.marine?'contactAst':'contact');}a.target=(typeof squadFocus==='function'&&squadFocus(a))||best;}
    const E=a.target&&a.target.alive?a.target:null;if(!E)a.target=null;
    // 目的地
    let goal;const idx=allies.indexOf(a),n=allies.length,row=Math.floor(idx/4),ang=player.yaw+((idx%4)-1.5)*.62;
    const tac=typeof allyTacGoal==='function';
    if(a.hold){goal=a.hold.clone();if(E&&tac&&!a.vehicle)goal=allyTacGoal(a,E,goal,6);}
    else if(E&&(a.role==='melee'||a.role==='blade')&&E.g.position.distanceTo(a.pos)<16)goal=tac?allyMeleeGoal(a,E):E.g.position.clone();
    else{const rr=3.4+row*2.4;goal=player.pos.clone().add(new THREE.Vector3(Math.sin(ang)*rr,0,Math.cos(ang)*rr));collide(goal,a.r);if(E&&tac)goal=allyTacGoal(a,E,goal,11);}
    const way=navStep(a.pos,goal,a);const to=way.sub(a.pos).setY(0);const dd=goal.distanceTo(a.pos);
    const near=E&&(a.role==='melee'||a.role==='blade')&&E.g.position.distanceTo(a.pos)<E.r+1.7;
    const firing=a.burst>0||(a.reloadT||0)>0;
    // 平滑加减速（不再瞬间起停）
    a.vel=a.vel||new THREE.Vector3();let want=new THREE.Vector3();
    if(!near&&dd>(a.hold?.6:1.8)&&to.lengthSq()>.001){const sp=(a.big?3.2:5.2)*(dd>9?1.4:dd<4?.6:1)*(firing?.45:1)*(a.swing>0?.2:1);want=to.normalize().multiplyScalar(sp);}
    a.vel.lerp(want,Math.min(1,dt*(want.lengthSq()>a.vel.lengthSq()?5:8)));a.pos.addScaledVector(a.vel,dt);collide(a.pos,a.r);const speed=a.vel.length();
    // 朝向：腿跟着移动方向，上半身单独扭向目标
    let moveYaw=speed>.4?Math.atan2(a.vel.x,a.vel.z):a.yaw,aimYaw=E?Math.atan2(E.g.position.x-a.pos.x,E.g.position.z-a.pos.z):moveYaw;
    let body=speed>.4?moveYaw:aimYaw;let tw=wrapA(aimYaw-body);if(Math.abs(tw)>1.1){body=aimYaw-Math.sign(tw)*1.1;tw=Math.sign(tw)*1.1;}
    if(E&&speed>.4&&Math.abs(wrapA(aimYaw-moveYaw))>1.6){body=wrapA(moveYaw+Math.PI);tw=wrapA(aimYaw-body);tw=clamp(tw,-1.1,1.1);a.back=true;}else a.back=false;
    a.yaw+=wrapA(body-a.yaw)*Math.min(1,dt*(a.big?3:7));a.root.rotation.y=a.yaw;a.twist=lerp(a.twist||0,wrapA(aimYaw-a.yaw),Math.min(1,dt*10));
    // 步态：步频随速度，后退时腿反着走
    a.walk+=dt*speed*(a.big?1.1:1.9)*(a.back?-1:1);const sw=Math.sin(a.walk),amp=Math.min(1,speed/4.5);
    if(a.big){a.pos.y=Math.abs(sw)*.08*amp;if(speed>.5&&Math.sign(Math.sin(a.walk))!==Math.sign(Math.sin(a.walk-dt*speed*1.1))&&a.pos.distanceTo(player.pos)<16){play('boom');player.shake=Math.max(player.shake,.15);}}
    else{const br=Math.sin(gameTime*2.1+idx)*.012;J.hipL.rotation.x=sw*.62*amp;J.hipR.rotation.x=-sw*.62*amp;J.kneeL.rotation.x=Math.max(0,-sw)*.9*amp+.05;J.kneeR.rotation.x=Math.max(0,sw)*.9*amp+.05;
      J.torso.position.y=.98+Math.abs(Math.cos(a.walk))*.05*amp+br-(a.reloadT>0?.03:0);J.torso.rotation.y=clamp(a.twist,-1.1,1.1);J.torso.rotation.x=a.flinch*-.35+(speed>6?.12:0)+(near?.15:0);J.torso.rotation.z=Math.cos(a.walk)*.04*amp;
      if(J.cloth)J.cloth.rotation.x=-Math.abs(sw)*.3*amp-(speed>6?.25:0);
      // 头：看目标，没目标时偶尔看玩家
      const look=E?0:(Math.sin(gameTime*.3+idx*2)>.7?clamp(wrapA(Math.atan2(player.pos.x-a.pos.x,player.pos.z-a.pos.z)-a.yaw-J.torso.rotation.y),-.9,.9):0);J.head.rotation.y=lerp(J.head.rotation.y,look,Math.min(1,dt*4));J.head.rotation.x=a.flinch*.3;}
    a.aimK=lerp(a.aimK,E&&!near&&!(a.reloadT>0)?1:0,Math.min(1,dt*7));
    if(!a.big){const k=a.aimK,rc=a.recoil||0,swA=(1-k)*sw*.35*amp;
      if(a.role==='bolter'||a.role==='psyker'&&false){J.shR.rotation.set(-1.35*k-swA+rc*.25+(a.reloadT>0?.55:0),0,-.05*k);J.elR.rotation.x=-.2*k-(a.reloadT>0?.9:0)-rc*.15;J.shL.rotation.set(-1.1*k+swA+(a.reloadT>0?-.7:0),0,.55*k+(a.reloadT>0?.3:0));J.elL.rotation.x=-.65*k-(a.reloadT>0?.8:0);}
      else if(a.swing<=0){J.shR.rotation.set(-.6*k-swA-(a.role==='melee'?.3:0),0,-.15);J.elR.rotation.x=-.5*k-.3;J.shL.rotation.set(swA+(a.role==='blade'?-1.4*k:0)+(a.role==='psyker'?-1.3*k:0),0,a.role==='blade'||a.role==='psyker'?.3*k:.1);J.elL.rotation.x=a.role==='psyker'?-.2*k:0;}
      if(J.orb)J.orb.rotation.y+=dt*3;}
    // 射击 / 换弹
    if(a.reloadT>0){a.reloadT-=dt;if(a.reloadT<=0&&a.pos.distanceTo(player.pos)<14)play('magIn');}
    else if(E&&!near&&a.muzzle&&a.role!=='melee'){const d=E.g.position.distanceTo(a.pos);a.fireCd-=dt;
      if(a.burst>0){a.shotT-=dt;if(a.shotT<=0){a.shotT=a.big?.07:.12;a.burst--;allyShoot(a,E);a.recoil=1;a.mag=(a.mag??(a.big?60:20))-1;}}
      else if(a.mag<=0&&!a.big){a.reloadT=1.6;a.mag=20;if(a.pos.distanceTo(player.pos)<14){play('magOut');if(Math.random()<.3)vox(a.id,'Reloading!');}}
      else if(a.fireCd<=0&&a.aimK>.85&&Math.abs(wrapA(Math.atan2(E.g.position.x-a.pos.x,E.g.position.z-a.pos.z)-a.yaw-a.twist))<.3&&d<34){a.burst=a.big?6:(a.role==='bolter'?3:1);a.fireCd=a.big?1.6:(a.role==='bolter'?.8+Math.random()*.8:1.6);}}
    // 近战：蓄力 → 劈 → 收招，劈的瞬间向前一小步
    a.swingCd-=dt;if(a.swing>0){a.swing-=dt;const k=1-a.swing/.5;const wind=k<.35,str=k>=.35&&k<.6;
      J.shR.rotation.set(wind?-1.2-k*3.5:str?-2.4+(k-.35)*12:.6-(k-.6)*1.5,0,wind?-.4:-.1);J.elR.rotation.x=wind?-1.2:-.3;J.torso.rotation.y=wind?-.6:str?-.6+(k-.35)*5:.6-(k-.6)*1.2;
      if(str&&E)a.pos.addScaledVector(E.g.position.clone().sub(a.pos).setY(0).normalize(),dt*4);
      if(!a.swHit&&k>.5){a.swHit=true;if(E&&E.g.position.distanceTo(a.pos)<E.r+2.3)allyStrike(a,E);}}
    else if(near&&a.swingCd<=0&&E){a.swing=.5;a.swHit=false;a.swingCd=a.role==='blade'?.6:.8;if(a.pos.distanceTo(player.pos)<16)play('whoosh');}
    if(a.role==='psyker'&&E&&CAMP.flags&&CAMP.flags.tavikPsy){a.psyCd-=dt;if(a.psyCd<=0){a.psyCd=6+Math.random()*2;tavikLightning(a,E);}}
    if(J.chev){J.chev.position.y=(a.big?5.4:2.95)+Math.sin(gameTime*3+idx)*.05;J.chev.material.color.setHex(a.turned?0xff3020:a.hp<a.maxHp*.35?0xffc040:0x60ff90);}
  }
  separateBodies();updateAllyTags();}
function wrapA(x){while(x>Math.PI)x-=Math.PI*2;while(x<-Math.PI)x+=Math.PI*2;return x;}
function allyShoot(a,E){const from=new THREE.Vector3();a.muzzle.getWorldPosition(from);const aim=E.g.position.clone();aim.y+=(Math.random()<.2?1.95:1.25)*E.g.scale.y;
  const W=a.big?EWEAP.heavy:a.role==='bolter'?EWEAP.bolter:a.role==='blade'?EWEAP.las:EWEAP.pistol;fireBolt(from,aim,W,'loyal',a.big?32:a.role==='bolter'?24:16,a);}
function allyStrike(a,E){const dir=E.g.position.clone().sub(a.pos).setY(0).normalize();const p=contactPoint(E);const dmg=a.role==='blade'?70:85;
  const k=damageEnemy(E,dmg,'body',dir,{_remote:true,stagger:.45,knock:.6,point:p,how:{cut:{p,n:new THREE.Vector3(Math.cos(a.yaw),.5,-Math.sin(a.yaw)).normalize(),imp:4}}});
  if(a.pos.distanceTo(player.pos)<18){play(a.role==='melee'?'saw':'powerHit');}if(k&&Math.random()<.4)bark(a,'kill');}
function tavikLightning(a,E){const o=a.pos.clone();o.y+=2.2;let prev=o,list=[E];for(const e of enemies)if(e.alive&&e!==E&&list.length<4&&e.g.position.distanceTo(E.g.position)<7)list.push(e);
  for(const e of list){const t=e.g.position.clone();t.y+=1.3*e.g.scale.y;bolt(prev,t,0x80c0ff);damageEnemy(e,45,'body',t.clone().sub(prev).normalize(),{_remote:true,stagger:.6,knock:.6});prev=t;}
  if(a.pos.distanceTo(player.pos)<25){play('zap');play('lift');}if(Math.random()<.3)vox('tavik','The Emperor’s decree be damned — I will not watch you die!');}
// 头顶名牌 + 血条（DOM 叠加）
function updateAllyTags(){const box=$('allyTags');if(!box||!box.appendChild||!new THREE.Vector3().project)return;
  for(let k=box.children.length|0;k<allies.length;k++){const d=document.createElement('div');d.className='atag';d.innerHTML='<b></b><i><s></s></i>';box.appendChild(d);}
  allies.forEach((a,i)=>{const el=box.children[i];if(!el||!el.style||!el.firstChild)return;const p=a.pos.clone();p.y+=a.big?5.8:3.25;const d=p.distanceTo(camera.position);
    if(!a.alive||state!=='playing'||d>(a.def.generic?14:34)){el.style.display='none';return;}p.project(camera);if(p.z>1||Math.abs(p.x)>1.05||Math.abs(p.y)>1.05){el.style.display='none';return;}
    el.style.display='';el.style.left=((p.x+1)/2*innerWidth)+'px';el.style.top=((1-p.y)/2*innerHeight)+'px';el.style.opacity=d>22?.5:1;
    el.firstChild.textContent=a.down?a.name+' · DOWN':a.name;el.lastChild.firstChild.style.width=Math.max(0,a.hp/a.maxHp*100)+'%';el.classList.toggle('low',a.hp<a.maxHp*.35||a.down);});}
