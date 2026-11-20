// ============================================================ 恶魔
const ENEMY=CFG.enemies;
const ETYPES=['imp','brute','caster'];
function makePart(geo,mat,x,y,z,parent,name){const m=new THREE.Mesh(geo,mat);m.position.set(x,y,z);m.userData.part=name;parent.add(m);return m;}
function spawnEnemy(type,x,z,elite=false){
  const T=ENEMY[type], s=T.scale*(elite?1.15:1);
  const g=new THREE.Group();g.position.set(x,0,z);g.scale.setScalar(s);
  const flesh=new THREE.MeshLambertMaterial({map:texFlesh,color:elite?0xffc0ff:T.color,emissive:0x000000});
  const horn=new THREE.MeshLambertMaterial({color:0x2a2018});
  const eye=new THREE.MeshBasicMaterial({color:elite?0x66ffcc:0xffd23a});
  const body=makePart(new THREE.BoxGeometry(.9,1.1,.6),flesh,0,1.15,0,g,'body');
  const head=makePart(new THREE.BoxGeometry(.55,.5,.5),flesh,0,1.98,0,g,'head');
  makePart(new THREE.BoxGeometry(.1,.08,.02),eye,-.13,.03,.26,head,'eye');makePart(new THREE.BoxGeometry(.1,.08,.02),eye,.13,.03,.26,head,'eye');
  makePart(new THREE.ConeGeometry(.08,.35,4),horn,-.2,.35,0,head,'horn').rotation.z=.4;makePart(new THREE.ConeGeometry(.08,.35,4),horn,.2,.35,0,head,'horn').rotation.z=-.4;
  const armL=makePart(new THREE.BoxGeometry(.25,.95,.25),flesh,-.6,1.2,.1,g,'armL');
  const armR=makePart(new THREE.BoxGeometry(.25,.95,.25),flesh,.6,1.2,.1,g,'armR');
  const legL=makePart(new THREE.BoxGeometry(.3,.65,.3),flesh,-.25,.33,0,g,'legL');
  const legR=makePart(new THREE.BoxGeometry(.3,.65,.3),flesh,.25,.33,0,g,'legR');
  let orb=null;
  if(T.ranged){const hood=new THREE.MeshLambertMaterial({color:0x1c2414});
    makePart(new THREE.BoxGeometry(.66,.2,.62),hood,0,.3,-.02,head,'hood');makePart(new THREE.BoxGeometry(.66,.55,.12),hood,0,0,-.3,head,'hood');
    orb=makePart(new THREE.BoxGeometry(.24,.24,.24),new THREE.MeshBasicMaterial({color:0x7dff3a}),0,-.6,0,armR,'orb');}
  scene.add(g);
  const hp=T.hp*(elite?1.6:1);
  const e={id:++enemySeq,remote:false,type,g,mat:flesh,parts:{body,head,armL,armR,legL,legR},hp,maxHp:hp,armHp:{armL:hp*.3,armR:hp*.3},arms:2,kv:new THREE.Vector3(),lean:0,headSnap:0,
    s0:s,speed:T.speed,dmg:T.dmg*(elite?1.3:1),reach:T.reach*(elite?1.1:1),r:.45*s,alive:true,elite,cd:0,windup:0,stagger:0,flash:0,burn:0,stun:0,walk:Math.random()*6,growl:2+Math.random()*4,ranged:!!T.ranged,orb,cast:1+Math.random()*2,casting:0,losT:0,los:false};
  for(const p of Object.values(e.parts))p.userData.enemy=e;
  head.children.forEach(c=>c.userData.enemy=e);
  enemies.push(e);return e;
}
function damageEnemy(e,dmg,part,dir,opts={}){
  if(!e.alive)return false;
  if(isClient()&&e.remote){const hd=part==='head'?2:1,est=Math.min(dmg*hd,Math.max(0,e.hp));
    if(state==='playing'&&!ex.active)player.exCharge=Math.min(100,(player.exCharge||0)+est*0.12);if(bt.t>0)player.hp=Math.min(player.maxHp,player.hp+est*0.3);
    sendNet({t:'dmg',id:e.id,dmg,part,dir,o:{stagger:opts.stagger,knock:opts.knock,limbMul:opts.limbMul,explode:opts.explode,how:opts.how}});net.lastDmg.set(e.id,gameTime);
    e.flash=0.08;e.lean=Math.min(1.2,e.lean+0.6);spawnBlood(opts.point||e.g.position.clone().setY(1.4),dir,part==='head'?10:5);return false;}
  const head=part==='head';if(head)dmg*=2;
  if(bt.t>0&&state==='playing'&&!opts._remote)player.hp=Math.min(player.maxHp,player.hp+Math.min(dmg,Math.max(0,e.hp))*0.3);
  if(state==='playing'&&!ex.active&&!opts._remote)player.exCharge=Math.min(100,(player.exCharge||0)+Math.min(dmg,e.hp)*0.12);
  e.hp-=dmg;e.flash=0.08;e.stagger=Math.max(e.stagger,opts.stagger??0.12);
  if(dir){e.kv.addScaledVector(dir.clone().setY(0),(opts.knock??0.15)*9);}
  e.lean=Math.min(1.2,e.lean+(head?1:0.6));e.headSnap=head?1:e.headSnap;
  spawnBlood(opts.point||e.g.position.clone().setY(1.4),dir,head?10:5);
  // 部位破坏：打断手臂
  if((part==='armL'||part==='armR')&&e.parts[part].parent===e.g){e.armHp[part]-=dmg*(opts.limbMul||1);if(e.armHp[part]<=0){detach(e,part,dir);e.arms--;}}
  if(e.hp<=0){killEnemy(e,dir,opts.explode,opts.how||{});return true;}
  return false;
}
function detach(e,part,dir){const m=e.parts[part];const wp=new THREE.Vector3();m.getWorldPosition(wp);const wq=new THREE.Quaternion();m.getWorldQuaternion(wq);const ws=new THREE.Vector3();m.getWorldScale(ws);
  e.g.remove(m);m.position.copy(wp);m.quaternion.copy(wq);m.scale.copy(ws);scene.add(m);
  const v=(dir?dir.clone():new THREE.Vector3()).multiplyScalar(4).add(new THREE.Vector3((Math.random()-.5)*4,4+Math.random()*3,(Math.random()-.5)*4));
  gibs.push({m,v,spin:new THREE.Vector3(Math.random()*10,Math.random()*10,Math.random()*10),rest:false});
  spawnBlood(wp,dir,12);if(gibs.length>260){const old=gibs.shift();scene.remove(old.m);}
}
function killEnemy(e,dir,explode,how={}){
  if(isHost())bcast({t:'kill',id:e.id,dir,how});
  e.alive=false;play('kill');hitstop=Math.max(hitstop,explode?0.12:0.06);player.shake=Math.max(player.shake,0.25);e.lifted=false;e.inHole=false;
  e.g.updateMatrixWorld(true);
  try{
    if(how.melt){meltPuddle(e);}
    else if(how.burst){burstKill(e,how.burst.p,how.burst.dir);}
    else if(how.half){halfKill(e,how.half.dir);}
    else if(how.hole){holeKill(e,how.hole.p,how.hole.dir,how.hole.mode);}
    else if(how.cut){cutApart(e,how.cut.p,how.cut.n,how.cut.imp||4,how.cut);}
    else if(how.headBurst)headBurst(e,dir||new THREE.Vector3());
  }catch(err){console.error('gore failed',err);}
  for(const k of Object.keys(e.parts))if(e.parts[k].parent===e.g)detach(e,k,dir);
  scene.remove(e.g);if(!how.melt)spawnBlood(e.g.position.clone().setY(1),dir,24);
  if(!ex.active)player.exCharge=Math.min(100,(player.exCharge||0)+6);
  match.kills++;addProgress('kill',1);if(e.elite){addProgress('elite',1);match.elites++;}
  if(!isClient()){const x=e.g.position.x,z=e.g.position.z;if(rng()<0.25)netDrop('relic',x,z);else if(Math.random()<0.35)netDrop('ammo',x+.5,z);}
}

