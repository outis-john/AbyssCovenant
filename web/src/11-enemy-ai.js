// ============================================================ 敌人 AI
function updateEnemies(dt){
  distTimer-=dt;if(distTimer<=0){distTimer=0.4;distCache=new Map();}
  const TL=targetsList();
  for(const e of enemies){
    if(!e.alive)continue;
    let T=null,td=1e9;for(const t of TL){const d=(t.pos.x-e.g.position.x)**2+(t.pos.z-e.g.position.z)**2;if(d<td){td=d;T=t;}}const pp=T?T.pos:player.pos;
    if(e.kv.lengthSq()>0.001){e.g.position.addScaledVector(e.kv,dt);e.kv.multiplyScalar(Math.max(0,1-dt*9));collide(e.g.position,e.r);}
    e.lean=Math.max(0,e.lean-dt*4);e.headSnap=Math.max(0,e.headSnap-dt*5);
    e.parts.body.rotation.x=-e.lean*0.45;e.parts.head.rotation.z=Math.sin(gameTime*40)*0.1*e.headSnap;
    e.flash-=dt;if(!(ex.active&&ex.target===e&&ex.type==='melta'))e.mat.emissive.setHex(e.flash>0?0xffffff:(canExecute(e)?0x774400:0x000000));
    if(e.lifted||e.inHole){if(e.burn>0)e.burn-=dt;continue;}
    if(e.burn>0){e.burn-=dt;if(Math.random()<dt*4){damageEnemy(e,5,'body',null,{stagger:0});}}
    e.growl-=dt;if(e.growl<=0){e.growl=4+Math.random()*6;if(e.g.position.distanceTo(pp)<14)play('growl');}
    if(e.stun>0){e.stun-=dt;e.g.rotation.z=Math.sin(gameTime*20)*0.1;continue;}
    if(e.stagger>0){e.stagger-=dt;e.parts.head.rotation.x=-0.3-e.lean*0.4;continue;}
    e.parts.head.rotation.x=0;
    const to=new THREE.Vector3(pp.x-e.g.position.x,0,pp.z-e.g.position.z);const dist=to.length();
    if(dist>40){continue;} // 太远：休眠
    // 寻路：同一房间直接冲，否则走向更靠近玩家的相邻房间的门
    let target=new THREE.Vector3(pp.x,0,pp.z);
    const [ei,ej]=cellOf(e.g.position),[pi,pj]=cellOf(pp);
    const cellDist=distFor(pi,pj);if(ei!==pi||ej!==pj){let best=null,bd=cellDist[ei][ej];
      for(const [a,b] of [[1,0],[-1,0],[0,1],[0,-1]]){const ni=ei+a,nj=ej+b;if(ni<0||nj<0||ni>=G||nj>=G||!connected(ei,ej,ni,nj))continue;if(cellDist[ni][nj]<bd){bd=cellDist[ni][nj];best=[ni,nj];}}
      if(best){const door=new THREE.Vector3((ei+best[0])/2*C,0,(ej+best[1])/2*C);
        const dd=door.distanceTo(e.g.position);target=dd<1.5?new THREE.Vector3(best[0]*C,0,best[1]*C):door;}}
    const dir=target.sub(e.g.position).setY(0);const dl=dir.length();if(dl>0.01)dir.divideScalar(dl);
    e.g.rotation.set(0,Math.atan2(to.x,to.z),0);
    if(e.windup>0){e.windup-=dt;e.parts.armL.rotation.x=e.parts.armR.rotation.x=-2.2*(1-e.windup/0.35);
      if(e.windup<=0){e.parts.armL.rotation.x=e.parts.armR.rotation.x=0;if(dist<e.reach+0.6){const dA=e.dmg*(e.arms===0?0.4:e.arms===1?0.7:1);if(T&&T.remote)sendTo(T.remote.id,{t:'hurt',n:dA,att:e.id});else hurtPlayer(dA,false,e);}e.cd=1.1;}continue;}
    e.cd-=dt;
    if(e.ranged&&casterAI(e,T,pp,to,dist,dt))continue;
    if(e.boss&&bossAI(e,T,pp,to,dist,dt))continue;
    if(ENEMY_AI[e.type]&&ENEMY_AI[e.type](e,T,pp,to,dist,dt))continue;
    if(dist<e.reach){if(e.cd<=0)e.windup=0.35;}
    else{const sp=e.speed*(e.legsLost?0.5:1);const sd=steer(e,dir,dt);e.g.position.addScaledVector(sd,sp*dt);e.walk+=dt*sp*2;
      e.parts.legL.rotation.x=Math.sin(e.walk)*.6;e.parts.legR.rotation.x=-Math.sin(e.walk)*.6;
      if(e.parts.armL.parent===e.g)e.parts.armL.rotation.x=-Math.sin(e.walk)*.5;if(e.parts.armR.parent===e.g)e.parts.armR.rotation.x=Math.sin(e.walk)*.5;}
    collide(e.g.position,e.r);
    const px2=e.g.position.x-pp.x,pz2=e.g.position.z-pp.z,pd=Math.hypot(px2,pz2),pm=e.r+0.45;
    if(pd<pm&&pd>0.001){e.g.position.x+=px2/pd*(pm-pd);e.g.position.z+=pz2/pd*(pm-pd);}
  }
  // 互相推开
  for(let a=0;a<enemies.length;a++){const A=enemies[a];if(!A.alive)continue;for(let b=a+1;b<enemies.length;b++){const B=enemies[b];if(!B.alive)continue;
    const dx=B.g.position.x-A.g.position.x,dz=B.g.position.z-A.g.position.z,d=Math.hypot(dx,dz),m=A.r+B.r;if(d<m&&d>0.001){const p=(m-d)/2;A.g.position.x-=dx/d*p;A.g.position.z-=dz/d*p;B.g.position.x+=dx/d*p;B.g.position.z+=dz/d*p;}}}
  if(enemies.length>140)enemies=enemies.filter(e=>e.alive);
}

// ---------- 瘟火术士：施法 / 后撤 / 瘟火球
let spits=[];
const spitGeo=new THREE.BoxGeometry(.32,.32,.32);
function canCast(e){return e.ranged&&e.orb&&e.parts.armR.parent===e.g;}
function hasLOS(e,pp){e.losT-=1;if(e.losT>0)return e.los;e.losT=8;
  const o=e.g.position.clone().setY(1.7*e.s0),t=new THREE.Vector3(pp.x,(pp.y||0)+1.3,pp.z),d=t.clone().sub(o),L=d.length();if(L<0.01)return e.los=true;
  ray.set(o,d.divideScalar(L));ray.far=L;e.los=ray.intersectObjects(wallMeshes,false).length===0;return e.los;}
function casterAI(e,T,pp,to,dist,dt){
  if(!canCast(e))return false;               // 没了右臂：退化成近战
  const arm=e.parts.armR;e.orb.scale.setScalar(1+Math.sin(gameTime*8)*.15+(e.casting>0?(0.7-e.casting)*1.6:0));
  if(e.casting>0){e.casting-=dt;arm.rotation.x=-1.5;arm.rotation.z=.2;
    if(e.casting<=0){arm.rotation.z=0;if(T)fireSpit(e,T);e.cast=CFG.spit.cooldown[0]+Math.random()*(CFG.spit.cooldown[1]-CFG.spit.cooldown[0]);}return true;}
  e.cast-=dt;if(dist<=e.reach)return false;
  const see=hasLOS(e,pp);if(!see)return false;     // 看不到就照常追
  if(dist<CFG.spit.range&&dist>3&&e.cast<=0){e.casting=CFG.spit.castTime;play('hiss');return true;}
  if(dist<16){const away=to.clone().normalize().multiplyScalar(dist<8?-1:0);
    const side=new THREE.Vector3(-to.z,0,to.x).normalize().multiplyScalar(Math.sin(gameTime*.7+e.id)*.6);
    const mv=away.add(side);if(mv.lengthSq()>0.01){const sp=e.speed*.7*(e.legsLost?0.5:1);e.g.position.addScaledVector(mv.normalize(),sp*dt);e.walk+=dt*sp*2;
      e.parts.legL.rotation.x=Math.sin(e.walk)*.6;e.parts.legR.rotation.x=-Math.sin(e.walk)*.6;collide(e.g.position,e.r);}
    arm.rotation.x=-.4;return true;}
  return false;
}
function fireSpit(e,T){
  const o=new THREE.Vector3();e.orb.getWorldPosition(o);
  const t=new THREE.Vector3(T.pos.x,(T.pos.y||0)+1.2,T.pos.z);const v=t.sub(o).normalize().multiplyScalar(CFG.spit.speed);
  addSpit(o,v,e.dmg,e,false);play('spit');
  if(isHost())bcast({t:'spit',p:[+o.x.toFixed(2),+o.y.toFixed(2),+o.z.toFixed(2)],v:[+v.x.toFixed(2),+v.y.toFixed(2),+v.z.toFixed(2)]});
}
function addSpit(o,v,dmg,att,visual){const m=new THREE.Mesh(spitGeo,new THREE.MeshBasicMaterial({color:0x8dff40}));m.position.copy(o);scene.add(m);
  spits.push({m,v:v.clone(),life:3,dmg,att,visual});}
function spitPop(s){scene.remove(s.m);s.dead=true;puff(s.m.position,6,0x5aa020,.8);embersGreen(s.m.position);if(s.m.position.distanceTo(player.pos)<20)play('sizzle');}
function embersGreen(p){for(let i=0;i<6;i++){const m=new THREE.Mesh(bloodGeo,new THREE.MeshBasicMaterial({color:0xb0ff60}));m.position.copy(p);scene.add(m);
  sparks.push({m,v:new THREE.Vector3((Math.random()-.5)*6,Math.random()*4,(Math.random()-.5)*6),life:.3+Math.random()*.2});}}
function updateSpits(dt){
  for(const s of spits){if(s.dead)continue;s.life-=dt;const P=s.m.position;P.addScaledVector(s.v,dt);s.m.rotation.x+=dt*9;s.m.rotation.y+=dt*7;
    if(Math.random()<dt*25){const q=new THREE.Mesh(bloodGeo,new THREE.MeshBasicMaterial({color:0x6ad02a}));q.position.copy(P);scene.add(q);sparks.push({m:q,v:new THREE.Vector3(0,.4,0),life:.15});}
    if(s.life<=0||P.y<0.05||P.y>H){spitPop(s);continue;}
    let wall=false;for(const b of colliders)if(P.x>b.minX-.1&&P.x<b.maxX+.1&&P.z>b.minZ-.1&&P.z<b.maxZ+.1){wall=true;break;}
    if(wall){spitPop(s);continue;}
    // 命中玩家：房主 / 单人负责判定伤害；队友那边只播放效果
    const tl=[];if(state==='playing'&&player.hp>0)tl.push({pos:player.pos,local:true});for(const r of net.remotes.values())if(r.inMatch&&!r.dead)tl.push({pos:r.pos,remote:r});
    if(s.reflected){if(s.att&&s.att.alive){const want=s.att.g.position.clone().setY(1.3*s.att.s0).sub(P).normalize().multiplyScalar(20);s.v.lerp(want,Math.min(1,dt*8));}
      let hitE=null;for(const e of enemies){if(!e.alive)continue;const q=e.g.position;if((P.x-q.x)**2+(P.z-q.z)**2<(e.r+.35)**2&&P.y<2.4*e.s0){hitE=e;break;}}
      if(hitE){damageEnemy(hitE,s.dmg*CFG.spit.reflectMul,'body',s.v.clone().normalize(),{knock:.6,stagger:.6,how:{burst:{p:P.clone(),dir:s.v.clone().normalize()}}});showHit(!hitE.alive);spitPop(s);}continue;}
    for(const t of tl){const dx=P.x-t.pos.x,dz=P.z-t.pos.z,dy=P.y-((t.pos.y||0)+1);if(dx*dx+dz*dz<0.5&&Math.abs(dy)<1.1){
      if(!s.visual&&t.local&&player.blocking&&gameTime-player.blockStart<0.3){   // 完美格挡：把瘟火球弹回去
        const back=s.att&&s.att.alive?s.att.g.position.clone().setY(1.3*s.att.s0).sub(P).normalize():s.v.clone().negate().normalize();
        s.v.copy(back.multiplyScalar(20));s.reflected=true;s.life=2;s.m.material.color.setHex(0xfff080);play('clang');play('parry');hitstop=0.08;announce('弹反！',0.8);
        $('shieldfx').style.opacity=1;setTimeout(()=>$('shieldfx').style.opacity=0,150);break;}
      if(!s.visual){if(t.remote)sendTo(t.remote.id,{t:'hurt',n:s.dmg,att:s.att&&s.att.id});else hurtPlayer(s.dmg,false,s.att&&s.att.alive?s.att:null);}
      spitPop(s);break;}}}
  spits=spits.filter(s=>!s.dead);
}


// ---------- Boss：深渊领主（房主判定；砸地特效用 fx 事件同步给队友）
function bossAI(e,T,pp,to,dist,dt){const B=CFG.boss,ph=e.hp>e.maxHp*0.66?1:e.hp>e.maxHp*0.33?2:3;
  if(ph>e.phase){e.phase=ph;annTeam(ph===2?'深渊领主怒吼——瘟火从它掌中涌出！':'深渊领主陷入狂暴！裂隙在它身边撕开……',2.5);play('backlash');e.speed=CFG.enemies.lord.speed*(ph===3?1.4:1);e.summonT=2;}
  const aL=e.parts.armL,aR=e.parts.armR;
  if(ph===3){e.summonT-=dt;if(e.summonT<=0){e.summonT=B.summonEvery;for(let k=0;k<B.summonN;k++){const a=Math.random()*6.28;spawnEnemy('imp',e.g.position.x+Math.cos(a)*3,e.g.position.z+Math.sin(a)*3);}play('growl');}}
  if(e.act){e.act.t-=dt;const A=e.act;
    if(A.k==='slam'){const k=1-A.t/B.slamWind;aL.rotation.x=aR.rotation.x=-2.6*Math.min(1,k*1.3);e.parts.body.rotation.x=-0.3*k;
      if(A.t<=0){aL.rotation.x=aR.rotation.x=0.4;e.parts.body.rotation.x=0.25;const P=e.g.position.clone().addScaledVector(to.clone().normalize(),1.5);slamFx(P.x,P.z);if(isHost())bcast({t:'fx',k:'slam',x:+P.x.toFixed(2),z:+P.z.toFixed(2)});
        for(const t of targetsList())if(Math.hypot(t.pos.x-P.x,t.pos.z-P.z)<B.slamR){const n=e.dmg*(e.arms===0?0.5:1);if(t.remote)sendTo(t.remote.id,{t:'hurt',n,att:e.id});else hurtPlayer(n,false,e);}
        e.act=null;e.cd=B.slamCd;e.stun=Math.min(e.stun,0.6);}}
    else if(A.k==='volley'){aR.rotation.x=-1.6;if(A.t<=0){if(T){const o=e.g.position.clone().setY(3.2);const base=new THREE.Vector3(T.pos.x,(T.pos.y||0)+1.2,T.pos.z).sub(o).normalize();
        for(let i=0;i<B.volley;i++){const ang=(i-(B.volley-1)/2)*0.16,c=Math.cos(ang),sn=Math.sin(ang);const v=new THREE.Vector3(base.x*c-base.z*sn,base.y,base.x*sn+base.z*c).multiplyScalar(CFG.spit.speed);
          addSpit(o,v,CFG.enemies.caster.dmg*curThreat().dmg,e,false);if(isHost())bcast({t:'spit',p:[+o.x.toFixed(2),+o.y.toFixed(2),+o.z.toFixed(2)],v:[+v.x.toFixed(2),+v.y.toFixed(2),+v.z.toFixed(2)]});}play('spit');}
      aR.rotation.x=0;e.act=null;e.vcd=B.volleyCd;}}
    return true;}
  e.vcd=(e.vcd??2)-dt;
  if(dist<B.slamR-0.5&&e.cd<=0&&e.arms>0){e.act={k:'slam',t:B.slamWind};play('growl');play('charge');return true;}
  if(ph>=2&&dist>6&&dist<26&&e.vcd<=0&&hasLOS(e,pp)){e.act={k:'volley',t:0.6};play('hiss');return true;}
  if(dist<B.slamR-0.5)return true;   // 贴身时等冷却，不用普通挥击
  return false;
}
function slamFx(x,z){const P=new THREE.Vector3(x,0.3,z);play('boom');for(let i=0;i<18;i++){const a=i/18*6.28;puff(new THREE.Vector3(x+Math.cos(a)*CFG.boss.slamR*.8,.3,z+Math.sin(a)*CFG.boss.slamR*.8),1,0x4a3a2a,1.2);}
  embers(P,10);if(player.pos.distanceTo(P)<14)player.shake=Math.max(player.shake,0.5);}
function bossDown(e){const p=e.g.position;annTeam('深渊领主倒下了！它的心脏化作一件灵能圣物。',3);
  netDrop('rare',p.x,p.z);for(let k=0;k<4;k++)netDrop('relic',p.x+(Math.random()-.5)*4,p.z+(Math.random()-.5)*4);}

// ---------- 绕障碍：前方有碰撞体就左右试探转向；原地卡住就侧移一会儿
function blockedAt(x,z,r){for(const b of colliders)if(x>b.minX-r&&x<b.maxX+r&&z>b.minZ-r&&z<b.maxZ+r)return true;return false;}
const _sd=new THREE.Vector3();
function steer(e,dir,dt){const p=e.g.position;
  e.stuckT=(e.stuckT||0)+dt;if(e.stuckT>0.8){const moved=e.lastP?Math.hypot(p.x-e.lastP.x,p.z-e.lastP.z):1;e.lastP={x:p.x,z:p.z};e.stuckT=0;
    if(moved<0.25*e.speed*0.8/3){e.unstick=0.7;e.side=-(e.side||1);}}
  if(e.unstick>0){e.unstick-=dt;return _sd.set(-dir.z*e.side,0,dir.x*e.side).addScaledVector(dir,.3).normalize();}
  const look=1.1+e.r,r=e.r*0.8;if(!blockedAt(p.x+dir.x*look,p.z+dir.z*look,r))return dir;
  const s0=e.side||(Math.random()<.5?1:-1);
  for(const a of [0.6,1.1,1.6,2.2])for(const s of [s0,-s0]){const c=Math.cos(a*s),sn=Math.sin(a*s);_sd.set(dir.x*c-dir.z*sn,0,dir.x*sn+dir.z*c);
    if(!blockedAt(p.x+_sd.x*look,p.z+_sd.z*look,r)){e.side=s;return _sd;}}
  return dir;}
