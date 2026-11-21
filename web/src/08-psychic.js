// ============================================================ 新灵能技能：V 锁喉提摔 · G 黑洞 · Q 子弹时间（C 为符文技能）
const PSY={lift:{cd:0,max:CFG.psy.lift},hole:{cd:0,max:CFG.psy.hole},bt:{cd:0,max:CFG.psy.bt}};
const bt={t:0};let lifts=[],holes=[];
function payPsy(cost,ovlMul=1){const paid=Math.min(player.mana,cost),miss=cost-paid;player.mana-=paid;player.ovl+=(paid*0.6+miss*2)*ovlMul;}
function fwdFlat(){return new THREE.Vector3(-Math.sin(player.yaw),0,-Math.cos(player.yaw));}
function castLift(free=false){
  if(!free&&PSY.lift.cd>0){announce('Choke cooling down',0.8);return;}
  if(isClient()){payPsy(30);PSY.lift.cd=PSY.lift.max;player.channelT=1.7;play('lift');sendNet({t:'cast',k:'lift'});if(player.ovl>=player.maxOvl)backlash();return;}
  const f=fwdFlat(),list=[];
  for(const e of enemies){if(!e.alive||e.lifted||e.boss||e.static)continue;const to=e.g.position.clone().sub(player.pos).setY(0);const d=to.length();if(d<16&&to.normalize().dot(f)>Math.cos(0.66))list.push([d,e]);}
  list.sort((a,b)=>a[0]-b[0]);const targets=list.slice(0,cls==='tide'?10:6).map(x=>x[1]);
  // 扇形范围提示
  const fan=new THREE.Mesh(new THREE.CircleGeometry(16,20,Math.PI/2-0.66,1.32),new THREE.MeshBasicMaterial({color:0xa040ff,transparent:true,opacity:.3,side:THREE.DoubleSide,depthWrite:false}));
  const fg=new THREE.Group();fg.position.set(player.pos.x,.05,player.pos.z);fg.rotation.y=player.yaw;fan.rotation.x=-Math.PI/2;fg.add(fan);scene.add(fg);beams.push({m:fg,life:.45,fadeChild:fan});
  if(!targets.length){if(!free)announce('No target in range',1);return;}
  if(!free){payPsy(30);PSY.lift.cd=PSY.lift.max;player.channelT=1.7;}play('lift');
  targets.forEach((e,i)=>{e.lifted=true;e.kv.set(0,0,0);lifts.push({e,t:-i*0.05,vy:0,phase:'rise',tend:0});});
  if(player.ovl>=player.maxOvl)backlash();
}
function updateLifts(dt){
  const hand=camera.position.clone().add(new THREE.Vector3(Math.cos(player.yaw)*-.25,-.35,-Math.sin(player.yaw)*-.25));
  for(const L of lifts){const e=L.e;if(!e.alive){L.done=true;continue;}L.t+=dt;if(L.t<0)continue;
    const g=e.g;
    if(L.phase==='rise'){const k=Math.min(1,L.t/0.9);g.position.y=(1-(1-k)**3)*5.5;if(k>=1){L.phase='hold';L.t=0;}}
    else if(L.phase==='hold'){g.position.y=5.5+Math.sin(L.t*20)*.08;if(L.t>=0.4){L.phase='slam';L.vy=-6;play('whoosh');}}
    else if(L.phase==='slam'){L.vy-=70*dt;g.position.y+=L.vy*dt;
      if(g.position.y<=0){g.position.y=0;e.lifted=false;L.done=true;g.rotation.set(0,g.rotation.y,0);
        play('boom');player.shake=Math.max(player.shake,0.3);hitstop=Math.max(hitstop,0.05);dust(g.position,18);
        damageEnemy(e,e.elite?90:70,'body',new THREE.Vector3(0,1,0),{stagger:.9,point:g.position.clone().setY(.5)});
        for(const o of enemies)if(o!==e&&o.alive&&!o.lifted&&o.g.position.distanceTo(g.position)<2.6)damageEnemy(o,20,'body',o.g.position.clone().sub(g.position).normalize(),{knock:1.2});}}
    if(L.phase!=='slam'){g.rotation.x=Math.sin(L.t*18)*0.25;g.rotation.z=Math.sin(L.t*13)*0.2;
      e.parts.legL.rotation.x=Math.sin(L.t*26)*.9;e.parts.legR.rotation.x=-Math.sin(L.t*26)*.9;
      if(e.parts.armL.parent===g)e.parts.armL.rotation.x=-2.7;if(e.parts.armR.parent===g)e.parts.armR.rotation.x=-2.7;
      L.tend-=dt;if(L.tend<=0){L.tend=0.1;beam(hand.clone(),g.position.clone().add(new THREE.Vector3(0,1.9*g.scale.y,0)),0xb060ff);}}
  }
  lifts=lifts.filter(L=>!L.done);
}
function dust(p,n){for(let i=0;i<n;i++){const m=new THREE.Mesh(bloodGeo,new THREE.MeshBasicMaterial({color:0x6a6058}));m.position.set(p.x,.2,p.z);m.scale.setScalar(2);scene.add(m);const a=Math.random()*6.28,s=3+Math.random()*4;sparks.push({m,v:new THREE.Vector3(Math.cos(a)*s,1+Math.random()*2,Math.sin(a)*s),life:.5+Math.random()*.4});}}
function castHole(free=false,origin=null){
  if(!free&&PSY.hole.cd>0){announce('Void Rift cooling down',0.8);return;}
  const {o,d}=aimRay(0);const h=castRay(o,d,30);const P=(h?h.point:o.clone().addScaledVector(d,18)).addScaledVector(d,-0.8);P.y=1.3;
  if(isClient()){payPsy(40);PSY.hole.cd=PSY.hole.max;spawnHoleVisual(P);sendNet({t:'cast',k:'hole'});if(player.ovl>=player.maxOvl)backlash();return;}
  if(!free){payPsy(40);PSY.hole.cd=PSY.hole.max;}play('hole');
  const g=new THREE.Group();g.position.copy(P);scene.add(g);
  const core=new THREE.Mesh(new THREE.SphereGeometry(.55,10,8),new THREE.MeshBasicMaterial({color:0x000000}));g.add(core);
  const ring=new THREE.Mesh(new THREE.TorusGeometry(1.3,.12,4,24),new THREE.MeshBasicMaterial({color:0xb050ff}));ring.rotation.x=Math.PI/2.3;g.add(ring);
  const halo=new THREE.Mesh(new THREE.SphereGeometry(2.2,12,8),new THREE.MeshBasicMaterial({color:0x3a0060,transparent:true,opacity:.35,depthWrite:false}));g.add(halo);
  holes.push({P,t:0,dur:3,g,ring,halo,tick:0,caught:new Set()});if(isHost())bcast({t:'fx',k:'hole',p:P},origin);
  if(!free&&player.ovl>=player.maxOvl)backlash();
}
function updateHoles(dt){
  for(const H of holes){H.t+=dt;H.ring.rotation.z+=dt*6;H.halo.scale.setScalar(1+Math.sin(H.t*8)*.08);H.tick-=dt;const tick=H.tick<=0;if(tick)H.tick=0.25;
    if(Math.random()<0.7){const a=Math.random()*6.28,r=6;const m=new THREE.Mesh(bloodGeo,new THREE.MeshBasicMaterial({color:0x8040c0}));m.position.set(H.P.x+Math.cos(a)*r,H.P.y+(Math.random()-.5)*2,H.P.z+Math.sin(a)*r);scene.add(m);
      sparks.push({m,v:H.P.clone().sub(m.position).multiplyScalar(2.2),life:.45});}
    if(!H.visual)for(const e of enemies){if(!e.alive||e.lifted||e.boss||e.static)continue;const to=H.P.clone().setY(0).sub(e.g.position.clone().setY(0));const d=to.length();
      if(d>9){if(H.caught.has(e)){H.caught.delete(e);e.inHole=false;e.g.scale.setScalar(e.s0);e.g.position.y=0;}continue;}
      H.caught.add(e);e.inHole=true;const k=1-d/9;
      if(d>0.6)e.g.position.addScaledVector(to.normalize(),Math.min(d-0.5,(3+k*9)*dt));
      e.g.position.y=lerp(e.g.position.y,k*1.0,dt*3);e.g.rotation.y+=dt*(3+k*10);
      e.g.scale.set(e.s0*(1-0.5*k),e.s0*(1-0.35*k),e.s0*(1-0.5*k));       // 被挤压
      if(tick)damageEnemy(e,5+k*5,'body',null,{stagger:.3});}
    if(H.t>=H.dur){H.done=true;scene.remove(H.g);play('boom');player.shake=Math.max(player.shake,.4);
      const fl=new THREE.Mesh(new THREE.SphereGeometry(1,10,8),new THREE.MeshBasicMaterial({color:0xe0b0ff,transparent:true,opacity:.8}));fl.position.copy(H.P);scene.add(fl);beams.push({m:fl,life:.3,grow:true});
      if(!H.visual)for(const e of H.caught){if(!e.alive)continue;e.inHole=false;const dir=e.g.position.clone().sub(H.P).setY(.4).normalize();
        e.g.scale.setScalar(e.s0);e.g.position.y=0;if(e.g.position.distanceTo(H.P.clone().setY(0))<5)damageEnemy(e,60,'body',dir,{knock:2.5,stagger:.6,explode:true});}}}
  holes=holes.filter(H=>!H.done);
}
function castBT(){
  if(PSY.bt.cd>0){announce('Slow Time cooling down',0.8);return;}
  payPsy(60,0.8);PSY.bt.cd=PSY.bt.max;bt.t=cls==='tide'?8:6;play('bt');announce('Slow Time · Lifesteal',1.6);
  if(player.ovl>=player.maxOvl)backlash();
}
// ============================================================ 灵能
const FORMS={bolt:'Bolt',blast:'Blast',shield:'Shield',summon:'Summon'};
const ELEMS={fire:'Fire',lightning:'Lightning',void:'Void',mind:'Mind'};
const MODS={homing:'Homing',split:'Split',delayed:'Delayed'};
const ELEM_COLOR={fire:0xff6a20,lightning:0x8fd0ff,void:0xa040ff,mind:0x60ffb0};
const ELEM_MUL={fire:1,lightning:.9,void:1.3,mind:.6};
const spellCost=s=>({bolt:15,blast:30,shield:20,summon:40}[s.form])+10*s.mods.length;
const spellSlots=s=>2+s.mods.length;
const spellName=s=>(s.elem==='fire'&&s.form==='bolt'?'Pyre Beam':ELEMS[s.elem]+FORMS[s.form])+(s.mods.length?'·'+s.mods.map(m=>MODS[m]).join(''):'');
function castSpell(i){
  const s=spells[i];if(!s||spellSlots(s)>player.slots)return;
  const cost=spellCost(s),paid=Math.min(player.mana,cost),miss=cost-paid;
  player.mana-=paid;player.ovl+=paid*0.6*(s.elem==='void'?1.2:1)+miss*2;
  play('spell',s.elem==='lightning'?900:s.elem==='void'?250:500);
  const go=()=>{if(state!=='playing')return;const n=s.mods.includes('split')?3:1;
    for(let k=0;k<n;k++){const {o,d}=aimRay(0);if(n>1)d.applyAxisAngle(new THREE.Vector3(0,1,0),(k-1)*0.14);execSpell(s,o,d,(n>1?0.6:1)*(s.mods.includes('delayed')?1.5:1));}};
  if(s.mods.includes('delayed')){announce('Delayed rune: releases in 1s',1);setTimeout(go,1000);}else go();
  if(player.ovl>=player.maxOvl)backlash();
}
function nearestEnemy(p,maxD,cone){let best=null,bd=maxD;for(const e of enemies){if(!e.alive)continue;const to=e.g.position.clone().setY(1.2).sub(p);const d=to.length();if(d>bd)continue;if(cone&&to.normalize().dot(cone)<0.85)continue;bd=d;best=e;}return best;}
function applyElement(e,s,dir){
  if(!e.alive)return;
  if(s.elem==='fire')e.burn=3;
  if(s.elem==='mind')e.stun=1.5;
  if(s.elem==='lightning'){const n=nearestEnemyFrom(e,6);if(n){beam(e.g.position.clone().setY(1.3),n.g.position.clone().setY(1.3),ELEM_COLOR.lightning);damageEnemy(n,12,'body',dir);}}
}
function nearestEnemyFrom(src,maxD){let best=null,bd=maxD;for(const e of enemies){if(!e.alive||e===src)continue;const d=e.g.position.distanceTo(src.g.position);if(d<bd){bd=d;best=e;}}return best;}
function execSpell(s,o,d,scale){
  const col=ELEM_COLOR[s.elem], mul=ELEM_MUL[s.elem]*scale;
  if(s.form==='bolt'&&s.elem==='fire'){startPyreBeam(mul);return;}
  if(s.form==='bolt'){
    if(s.mods.includes('homing')){const t=nearestEnemy(o,40,d);if(t)d=t.g.position.clone().setY(1.5).sub(o).normalize();}
    const h=castRay(o,d,60);const end=h?h.point:o.clone().addScaledVector(d,60);
    beam(o.clone().add(new THREE.Vector3(0,-.15,0)),end,col);
    if(h&&h.object.userData.enemy){const e=h.object.userData.enemy;const part=h.object.userData.part==='eye'?'head':h.object.userData.part;const k=damageEnemy(e,25*mul,part,d,{point:h.point});applyElement(e,s,d);showHit(k);play('hit');}
  } else if(s.form==='blast'){
    const m=new THREE.Mesh(new THREE.SphereGeometry(.25,6,4),new THREE.MeshBasicMaterial({color:col}));m.position.copy(o).addScaledVector(d,.8);scene.add(m);
    projectiles.push({m,v:d.clone().multiplyScalar(24),s,mul,life:3,homing:s.mods.includes('homing')});
  } else if(s.form==='shield'){player.shield=Math.max(player.shield,4*scale);announce('Psychic Shield',1);}
  else if(s.form==='summon'){
    const m=new THREE.Mesh(new THREE.OctahedronGeometry(.3),new THREE.MeshBasicMaterial({color:col}));scene.add(m);
    wisps.push({m,s,mul,life:8*scale,cd:0,a:Math.random()*6});
  }
}
function explode(p,s,mul){
  play('boom');player.shake=Math.max(player.shake,0.3);
  const col=ELEM_COLOR[s.elem];const m=new THREE.Mesh(new THREE.SphereGeometry(1,8,6),new THREE.MeshBasicMaterial({color:col,transparent:true,opacity:.7}));m.position.copy(p);scene.add(m);beams.push({m,life:.25,grow:true});
  let any=false;for(const e of enemies){if(!e.alive)continue;const d=e.g.position.clone().setY(1).distanceTo(p);if(d<4.5){const dir=e.g.position.clone().sub(p).setY(.3).normalize();const k=damageEnemy(e,40*mul*(1-d/9),'body',dir,{knock:1.2,stagger:.4});applyElement(e,s,dir);any=true;if(k)showHit(true);}}
  if(any)hitstop=Math.max(hitstop,0.05);
}
function beam(a,b,col){const g=new THREE.BufferGeometry().setFromPoints([a,b]);const l=new THREE.Line(g,new THREE.LineBasicMaterial({color:col}));scene.add(l);beams.push({m:l,life:.12});}
function backlash(){
  const over=player.ovl-player.maxOvl;player.ovl=player.maxOvl*0.5;
  if(Math.random()<player.ignoreChance){announce('You suppressed the backlash',2);return;}
  if(player.bless==='change'){hurtPlayer(5,true);announce('The Blessing of Change swallowed the backlash',1.2);return;}
  addTaint(CFG.taint.backlash,'change');play('backlash');player.warp=2.5;player.shake=0.5;
  if(over>=35){announce('Severe backlash — the rift tears open!',3);hurtPlayer(20,true);
    for(let k=0;k<3;k++){const a=Math.random()*6.28;spawnEnemy('imp',player.pos.x+Math.cos(a)*4,player.pos.z+Math.sin(a)*4);}}
  else if(over>=15){announce('Moderate backlash — psychic eruption!',2);hurtPlayer(30,true);
    for(const e of enemies)if(e.alive&&e.g.position.distanceTo(player.pos)<5)damageEnemy(e,30,'body',e.g.position.clone().sub(player.pos).normalize(),{knock:1.5});}
  else{announce('Minor backlash',1.5);hurtPlayer(10,true);}
}
function updateSpells(dt){
  for(const p of projectiles){p.life-=dt;
    if(p.homing){const t=nearestEnemy(p.m.position,25,null);if(t){const want=t.g.position.clone().setY(1.2).sub(p.m.position).normalize().multiplyScalar(24);p.v.lerp(want,dt*4);}}
    const step=p.v.clone().multiplyScalar(dt);const h=castRay(p.m.position,step.clone().normalize(),step.length()+.3);
    if(h||p.life<=0){explode(h?h.point:p.m.position,p.s,p.mul);scene.remove(p.m);p.dead=true;continue;}
    p.m.position.add(step);}
  projectiles=projectiles.filter(p=>!p.dead);
  for(const b of beams){b.life-=dt;if(b.fade)b.m.material.opacity=Math.max(0,b.life*5);if(b.grow){b.m.scale.addScalar(dt*14);b.m.material.opacity=Math.max(0,b.life*3);}if(b.life<=0)scene.remove(b.m);}
  beams=beams.filter(b=>b.life>0);
  for(const w of wisps){w.life-=dt;w.a+=dt*2;w.m.position.set(player.pos.x+Math.cos(w.a)*1.6,2.2+Math.sin(w.a*2)*.2,player.pos.z+Math.sin(w.a)*1.6);w.m.rotation.y+=dt*3;w.cd-=dt;
    if(w.cd<=0){const t=nearestEnemy(w.m.position,14,null);if(t){w.cd=.6;beam(w.m.position.clone(),t.g.position.clone().setY(1.3),ELEM_COLOR[w.s.elem]);damageEnemy(t,10*w.mul,'body',null);applyElement(t,w.s,null);}}
    if(w.life<=0)scene.remove(w.m);}
  wisps=wisps.filter(w=>w.life>0);
}

