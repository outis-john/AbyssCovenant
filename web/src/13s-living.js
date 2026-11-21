// ============================================================ 活的战场：新兵种、队友专职、倒地救援、随机战场事件、油桶、搭乘坦克、沉浸细节
// ---------------- 新敌人：终结者 / 跳帮突击兵 / 狙击手 / 重武器组 / 音波战士（Kakophoni）/ 冠军（小队头目）
SPEAKER.vox=SPEAKER.vox||'Vox-net';LEG.just={armor:0x16181a,trim:0x8a1810,metal:0x9a7a3a,eye:0xff2a10};
let NEXT_LEG=null;// 生成前指定军团配色
Object.assign(ENEMY,{term:{hp:950,speed:2.3,dmg:30,reach:2.3,scale:1.36,color:0x16181a},raptor:{hp:200,speed:6.8,dmg:24,reach:2.0,scale:1.1,color:0x1a2244},
  snp:{hp:150,speed:3.2,dmg:58,reach:1.8,scale:1.08,color:0x2a6a78},hwt:{hp:520,speed:0,dmg:12,reach:1.6,scale:1.12,color:0x6c7076},
  kako:{hp:240,speed:3.4,dmg:30,reach:1.9,scale:1.12,color:0x5c2470},ldr:{hp:440,speed:3.6,dmg:28,reach:2.2,scale:1.2,color:0x3a6e62}});
ETYPES.push('term','raptor','snp','hwt','kako','ldr');
const legOf=(e,def)=>LEG[NEXT_LEG||def]||LEG.soh;
function jumpPack(e){const P=e.parts.body;addTo(P,B3(.8,.7,.36),lmat(0x2a2a2a),0,.2,-.62);for(const s of [-1,1]){addTo(P,new THREE.CylinderGeometry(.13,.17,.5,8),lmat(0x3a3a3a),s*.3,-.1,-.7);addTo(P,new THREE.CylinderGeometry(.1,.1,.06,8),lmat(0xff9040,true),s*.3,-.36,-.7);}}
Object.assign(ENEMY_BUILD,{
  term:e=>{const L=legOf(e,'just');restyleMarine(e,L,{legion:'soh'});e.parts.body.scale.set(1.22,1.06,1.2);for(const a of [e.parts.armL,e.parts.armR])a.scale.set(1.25,1,1.25);
    e.muzzle=gunBolter(e.parts.armR,true);addTo(e.parts.armL,B3(.46,.42,.46),lmat(0x3a3a3a),0,-.62,0);addTo(e.parts.armL,B3(.5,.08,.5),lmat(0x80c0ff,true),0,-.62,0);
    e.onHit=(e,d,dir,o)=>{const r=tankArmour(e,d,dir,o);return r<d?d*.55:r;};e.heavy=true;rigSetup(e);
    if(CAMP.on){const P=e.g.position;ringAt(P.x,.2,P.z,0x9fd8ff,.4,4,.5,.3);hitSparks(P.clone().setY(1.5),new THREE.Vector3(0,1,0),20);if(P.distanceTo(player.pos)<40&&actx){tone('sine',1800,200,.05,.4);noiseHit(3000,.08,.2,'bandpass');}}},
  raptor:e=>{restyleMarine(e,legOf(e,'nl'),{legion:'nl'});jumpPack(e);chainSword(e.parts.armR);for(const s of [-1,1])addTo(e.parts.head,B3(.05,.3,.12),lmat(0x1a1a1a),s*.26,.32,0).rotation.z=s*-.5;rigSetup(e);},
  snp:e=>{restyleMarine(e,legOf(e,'al'),{legion:'al'});const g=gunBolter(e.parts.armR);addTo(g,B3(.06,.06,1.3),lmat(0x1a1a1a),0,-.2,.55);e.muzzle=g;
    addTo(e.parts.body,B3(1.1,1.3,.08),lmat(0x3a3a2e),0,-.1,-.42);const glint=addTo(e.parts.head,B3(.08,.08,.04),lmat(0xff2010,true),.12,.04,.28);e.glint=glint;rigSetup(e);},
  hwt:e=>{restyleMarine(e,legOf(e,'iw'),{legion:'iw'});e.static=true;e.parts.legL.rotation.x=-1.2;e.parts.legR.rotation.x=.5;e.g.position.y=-.35;
    const t=new THREE.Group();t.position.set(0,1.05,.9);e.g.add(t);const D=lmat(0x1a1a1c);for(const s of [-1,1]){const l=new THREE.Mesh(B3(.06,1,.06),D);l.position.set(s*.3,-.5,0);l.rotation.z=s*.3;t.add(l);}
    const gun=new THREE.Mesh(B3(.34,.34,1.5),new THREE.MeshLambertMaterial({map:texMetal,color:0x4a4a46}));t.add(gun);const br=new THREE.Mesh(new THREE.CylinderGeometry(.07,.08,1.1,8),D);br.rotation.x=Math.PI/2;br.position.z=1.2;t.add(br);
    const mz=new THREE.Object3D();mz.position.z=1.8;t.add(mz);e.muzzle=mz;e.tripod=t;e.burstN=0;rigSetup(e);},
  kako:e=>{restyleMarine(e,LEG.ec,{legion:'ec'});const h=addTo(e.parts.armR,new THREE.CylinderGeometry(.1,.34,.7,10,1,true),lmat(0xc8a040),0,-.8,.15);h.rotation.x=0;e.muzzle=h;
    for(let i=0;i<3;i++)addTo(e.parts.body,new THREE.CylinderGeometry(.08,.14,.4,8),lmat(0xc8a040),-.25+i*.25,.62,-.6);rigSetup(e);},
  ldr:e=>{const L=legOf(e,'soh');restyleMarine(e,L,{legion:'soh',plume:0xc0201a});powerSword(e.parts.armR);e.muzzle=gunBolter(e.parts.armL);
    const pole=addTo(e.parts.body,new THREE.CylinderGeometry(.03,.03,2.2,6),lmat(0x2a2018),.3,1.2,-.6);const ban=addTo(e.parts.body,B3(.05,.9,.6),lmat(L.trim),.3,1.75,-.92);e.banner=ban;e.dmgMul=1;rigSetup(e);}});
// AI
function raptorAI(e,T,pp,to,dist,dt){if(e.rj){const R=e.rj;R.t+=dt;const k=Math.min(1,R.t/R.dur);e.g.position.copy(R.a).lerp(R.b,k);e.g.position.y=Math.sin(k*Math.PI)*6;if(Math.random()<.8)puff(e.g.position.clone().add(V3(0,.6,0)),1,0xff9040,1.2);
    e.parts.armR.rotation.x=-2.6+k*2.6;if(k>=1){e.rj=null;e.g.position.y=0;collide(e.g.position,e.r);dust(e.g.position.clone(),10);ringAt(e.g.position.x,.2,e.g.position.z,0xffa040,.4,3.5,.4,.2);
      if(T&&Math.hypot(T.pos.x-e.g.position.x,T.pos.z-e.g.position.z)<2.8)damageTarget(T,e.dmg*1.4,e);if(e.g.position.distanceTo(player.pos)<20)play('boom');}return true;}
  e.rjCd=(e.rjCd??(.5+Math.random()*2))-dt;
  if(e.rjCd<=0&&dist>7&&dist<28){const tgt=pp.clone().setY(0),d=tgt.clone().sub(e.g.position).setY(0),L=d.length();d.multiplyScalar(Math.max(0,L-1.5)/L);
    e.rj={a:e.g.position.clone(),b:navCell(e.g.position.clone().add(d)),t:0,dur:.6+L/40};e.rjCd=5+Math.random()*3;play('whoosh');if(actx&&e.g.position.distanceTo(player.pos)<40)noiseHit(600,.12,.6,'bandpass');return true;}
  e.parts.armR.rotation.z=-.25;return false;}
function sniperAI(e,T,pp,to,dist,dt){aimPose(e,1);const tgt=T&&T.pos?T.pos:player.pos;
  if(dist<26){const away=e.g.position.clone().sub(pp).setY(0).normalize();e.g.position.addScaledVector(steer(e,away,dt),e.speed*dt);walkLegs(e,e.speed,dt);collide(e.g.position,e.r);e.aimT=0;if(e.las)e.las.visible=false;return true;}
  const see=hasLOS(e,pp);if(!see){e.aimT=0;if(e.las)e.las.visible=false;return false;}
  e.snCd=(e.snCd??2)-dt;if(e.snCd>0){if(e.las)e.las.visible=false;return true;}
  if(!e.las){e.las=new THREE.Mesh(B3(.025,.025,1),new THREE.MeshBasicMaterial({color:0xff2010,transparent:true,opacity:.65,depthWrite:false}));scene.add(e.las);}
  e.aimT=(e.aimT||0)+dt;const from=e.muzzle.getWorldPosition(new THREE.Vector3()),aim=pp.clone().setY(1.5);const L=from.distanceTo(aim);e.las.visible=true;e.las.scale.z=L;e.las.position.copy(from).lerp(aim,.5);e.las.lookAt(aim);
  e.las.material.opacity=.3+.5*Math.min(1,e.aimT/1.7)+(Math.sin(gameTime*30)>0?.1:0);
  if(e.aimT>=1.8){e.aimT=0;e.snCd=3.5+Math.random()*2;e.las.visible=false;fireBolt(from,aim,{speed:240,spread:.004,kind:'bolt',color:0xfff0c0,len:2.2,snd:'bolter'},'chaos',e.dmg,e);play('shotgun');
    if(!TAC.snBark||gameTime-TAC.snBark>20){TAC.snBark=gameTime;const sp=allies.filter(a=>a.alive&&!a.def.generic&&!a.vehicle);if(sp.length)vox(pickOne(sp).id,pickOne(['Sniper! Watch the red line!','Marksman on the ridge — break his line of sight!']),true);}}
  return true;}
function hwtAI(e,T,pp,to,dist,dt){const want=Math.atan2(pp.x-e.g.position.x,pp.z-e.g.position.z);e.g.rotation.y+=wrapA(want-e.g.rotation.y)*Math.min(1,dt*2.5);
  if(dist>55||!hasLOS(e,pp))return true;e.fireCd=(e.fireCd??1.5)-dt;
  if(e.burstN>0){e.shotT=(e.shotT||0)-dt;if(e.shotT<=0){e.shotT=.08;e.burstN--;const from=e.muzzle.getWorldPosition(new THREE.Vector3());fireBolt(from,pp.clone().setY(1.3),EWEAP.heavy,'chaos',e.dmg,e);if(e.tripod)e.tripod.rotation.x=(Math.random()-.5)*.05;}}
  else if(e.fireCd<=0){e.burstN=10;e.fireCd=2.2+Math.random()*1.2;}return true;}
function kakoAI(e,T,pp,to,dist,dt){if(e.sonic>0){e.sonic-=dt;aimPose(e,1);if(e.sonic<=0){const P=e.g.position,dir=pp.clone().sub(P).setY(0).normalize();for(let i=1;i<=5;i++){const C=P.clone().addScaledVector(dir,i*3);ringAt(C.x,1.2,C.z,0xd080ff,.3,1+i*.5,.35,.12);}play('backlash');
      const v=player.pos.clone().sub(P).setY(0),d=v.length();if(state==='playing'&&d<17&&v.normalize().dot(dir)>.9&&hasLOS(e,player.pos)){hurtPlayer(e.dmg,false,e);player.warp=Math.max(player.warp||0,1);player.pos.addScaledVector(dir,2.4);collide(player.pos,(CLS[cls]&&CLS[cls].r)||.5);}
      for(const a of allies)if(a.alive){const w=a.pos.clone().sub(P).setY(0);const dd=w.length();if(dd<17&&w.normalize().dot(dir)>.9)allyHurt(a,e.dmg,e);}}return true;}
  e.sonCd=(e.sonCd??(2+Math.random()*3))-dt;if(e.sonCd<=0&&dist<16&&dist>4&&hasLOS(e,pp)){e.sonic=.8;e.sonCd=5+Math.random()*2;const P=e.g.position;ringAt(P.x,.1,P.z,0xc060ff,2,2,.8,.06);return true;}
  return shooterAI(e,T,pp,to,dist,dt,EWEAP.las,[8,16],2,[1.4,2.4],.18);}
function ldrAI(e,T,pp,to,dist,dt){if(e.banner)e.banner.rotation.y=Math.sin(gameTime*3)*.2;e.dmgMul=1;if(dist<6)return ENEMY_AI.ec?ENEMY_AI.ec(e,T,pp,to,dist,dt):false;return shooterAI(e,T,pp,to,dist,dt,EWEAP.bolter,[5,13],3,[1.2,2],.11);}
Object.assign(ENEMY_AI,{term:(e,T,pp,to,dist,dt)=>dist<e.reach+.3?false:shooterAI(e,T,pp,to,dist,dt,EWEAP.bolter,[2,12],5,[.9,1.6],.08),raptor:raptorAI,snp:sniperAI,hwt:hwtAI,kako:kakoAI,ldr:ldrAI});
TAC_COVER.add('ldr');
// 冠军光环：附近同小队开火更快；冠军阵亡 → 小队后撤
const _shL=shooterAI;shooterAI=function(e,T,pp,to,dist,dt,...r){if(e.squad&&e.type!=='ldr'){const L=WAR.sqMap.get(e.squad);const c=L&&L.find(x=>x.type==='ldr'&&x.alive);if(c&&c.g.position.distanceTo(e.g.position)<12)e.fireCd=(e.fireCd??1)-dt*.6;}return _shL(e,T,pp,to,dist,dt,...r);};
const _keL=killEnemy;killEnemy=function(e,...r){const was=e.alive;const out=_keL(e,...r);if(was&&!e.alive){if(e.las){scene.remove(e.las);e.las=null;}
    if(e.type==='ldr'&&e.squad){for(const m of WAR.sqMap.get(e.squad)||[])if(m.alive&&m!==e){m.fellBack=true;if(m.cov){m.cov.re=0;m.cov.ph='none';}}const sp=allies.filter(a=>a.alive&&!a.def.generic&&!a.vehicle);if(sp.length&&CAMP.on)vox(pickOne(sp).id,'Their champion is down — they’re faltering!',true);}
    if(CAMP.on&&e.g.position.distanceTo(player.pos)<30&&Math.random()<.12){const sp=allies.filter(a=>a.alive&&!a.def.generic&&!a.vehicle&&a.pos.distanceTo(player.pos)<25);if(sp.length&&!e.vehicle)vox(pickOne(sp).id,pickOne(['Good kill!','Clean shot, brother.','He won’t get up from that.','That’s one less traitor.']));}
    if(e.vehicle&&CAMP.on){const sp=allies.filter(a=>a.alive&&!a.def.generic&&!a.vehicle);if(sp.length)vox(pickOne(sp).id,pickOne(['Armour destroyed!','Tank down — burn, you traitors!']),true);}}return out;};
// 小队编制：大一点的叛军小队里混入冠军、狙击手、重武器组、终结者、跳帮兵
const _osL=openSpawn;openSpawn=function(type,n,c,rmin,rmax,opt={}){const out=_osL(type,n,c,rmin,rmax,opt);if(!CAMP.on||opt.pure||!out.length)return out;
  const legion={soh:'soh',wb:'wb',al:'al',dg:'dg',iw:'iw',nl:'nl',we:'we',ec:'ec'}[type];const sq=out[0].squad;const add=(t,leg,p)=>{NEXT_LEG=leg;const e=spawnEnemy(t,p.x,p.z);NEXT_LEG=null;e.campaign=true;e.squad=sq;e.sqN=out[0].sqN;out.push(e);return e;};
  const swap=(i,t,leg)=>{const o=out[i];const p=o.g.position.clone();o.alive=false;scene.remove(o.g);enemies=enemies.filter(x=>x!==o);out.splice(i,1);return add(t,leg,p);};
  const late=CAMP.step>=2;
  if(legion&&['soh','wb','al','dg','iw'].includes(type)&&n>=4){if(Math.random()<.55)swap(0,'ldr',legion);if(Math.random()<.35){const p=navCell(c.clone().add(V3((Math.random()-.5)*20,0,(Math.random()-.5)*20)).addScaledVector(c.clone().sub(player.pos).setY(0).normalize(),14));add('snp',type==='soh'?'soh':'al',p);}
    if(late&&Math.random()<.3){for(let i=0;i<2;i++)add('term',type==='soh'?'just':legion,navCell(c.clone().add(V3((Math.random()-.5)*6,0,(Math.random()-.5)*6))));}}
  if(type==='militia'&&n>=8&&Math.random()<.45)add('hwt','iw',navCell(c.clone()));
  if((type==='we'||type==='nl')&&n>=6&&Math.random()<.4){swap(0,'raptor',type==='we'?'we':'nl');swap(0,'raptor',type==='we'?'we':'nl');}
  if(type==='ec'&&n>=4&&Math.random()<.5)swap(0,'kako','ec');
  return out;};
// ---------------- 队友专职：重武器 / 火焰兵 / 药剂师 / 跳帮突击
Object.assign(ALLY_DEFS.leg2||{},{sub:'heavy'});Object.assign(ALLY_DEFS.leg3||{},{sub:'flamer'});Object.assign(ALLY_DEFS.leg6||{},{sub:'apoth',role:'bolter',legion:'soh'});
if(ALLY_DEFS.leg5){ALLY_DEFS.leg5.sub='jump';ALLY_DEFS.leg5.role='melee';}
Object.assign(ALLY_DEFS.ivl2,{sub:'heavy'});Object.assign(ALLY_DEFS.ivl3,{sub:'jump',role:'melee'});Object.assign(ALLY_DEFS.ivl5,{sub:'flamer'});Object.assign(ALLY_DEFS.ivl6,{sub:'apoth',role:'bolter'});
const SUB_TITLE={heavy:'Heavy Gunner',flamer:'Flamer',apoth:'Apothecary',jump:'Assault'};
const _spL=spawnAlly;spawnAlly=function(id,x,z,yaw){const def=ALLY_DEFS[id];if(def&&/^rf\d+$/.test(id)&&!def.sub){const k=+id.slice(2);def.sub=[null,'heavy','flamer',null,'apoth','jump'][k%6];if(def.sub==='jump')def.role='melee';}
  const a=_spL(id,x,z,yaw);if(def&&def.sub&&a.J&&a.J.torso){a.sub=def.sub;const J=a.J;
    if(def.sub==='heavy'){const g=new THREE.Mesh(B3(.3,.3,1.4),new THREE.MeshLambertMaterial({map:texMetal,color:0x3a3a36}));g.position.set(0,-.5,.5);J.elR.add(g);const box=new THREE.Mesh(B3(.5,.6,.3),lmat(0x5a4a2a));box.position.set(0,.6,-.6);J.torso.add(box);}
    if(def.sub==='flamer'){const g=new THREE.Mesh(new THREE.CylinderGeometry(.06,.1,.9,8),lmat(0x3a3a3a));g.rotation.x=Math.PI/2;g.position.set(0,-.5,.45);J.elR.add(g);const fl=new THREE.Mesh(B3(.08,.08,.08),lmat(0x60a0ff,true));fl.position.set(0,-.5,.92);J.elR.add(fl);
      for(const s of [-1,1]){const t=new THREE.Mesh(new THREE.CylinderGeometry(.16,.16,.7,10),lmat(0x8a2a14));t.position.set(s*.2,.6,-.62);J.torso.add(t);}}
    if(def.sub==='apoth'){if(a.mat)a.mat.color.setHex(0xe4e2da);const c1=new THREE.Mesh(B3(.24,.07,.03),lmat(0xc01818,true)),c2=new THREE.Mesh(B3(.07,.24,.03),lmat(0xc01818,true));for(const c of [c1,c2]){c.position.set(0,.75,.37);J.torso.add(c);}
      const nar=new THREE.Mesh(B3(.16,.2,.3),lmat(0x9aa0a8));nar.position.set(0,-.4,.1);J.elL.add(nar);}
    if(def.sub==='jump'){const pk=new THREE.Mesh(B3(.8,.7,.36),lmat(0x2a2a2a));pk.position.set(0,.7,-.62);J.torso.add(pk);for(const s of [-1,1]){const th=new THREE.Mesh(new THREE.CylinderGeometry(.13,.17,.5,8),lmat(0x3a3a3a));th.position.set(s*.3,.3,-.7);J.torso.add(th);}}}
  return a;};
const _ashL=allyShoot;allyShoot=function(a,E){if(a.sub==='flamer'){const d=E.g.position.distanceTo(a.pos);if(d>11)return;const dir=E.g.position.clone().sub(a.pos).setY(0).normalize();
    for(let i=0;i<3;i++)puff(a.pos.clone().setY(1.3).addScaledVector(dir,1.5+i*2.5),2,i<1?0xffd060:0xff6020,1.2+i*.4);if(a.pos.distanceTo(player.pos)<20&&actx)noiseHit(500,.06,.25);
    for(const e of enemies){if(!e.alive)continue;const v=e.g.position.clone().sub(a.pos).setY(0);const dd=v.length();if(dd<11&&v.normalize().dot(dir)>.8)damageEnemy(e,22,'body',dir,{_remote:true,how:{burn:true}});}return;}
  _ashL(a,E);if(a.sub==='heavy'){const from=a.muzzle.getWorldPosition(new THREE.Vector3());for(let i=0;i<2;i++)fireBolt(from,E.g.position.clone().setY(1.3),EWEAP.heavy,'loyal',26,a);a.burst=Math.max(a.burst,a.mag>2?2:0);}};
// 火焰兵要贴近、重武器手走得慢、跳帮兵跃入敌群、药剂师治疗和救人
function allySpecials(dt){for(const a of allies){if(!a.alive||!a.sub||a.down)continue;const E=a.target&&a.target.alive?a.target:null;
    if(a.sub==='heavy'&&a.vel)a.pos.addScaledVector(a.vel,-dt*.35);
    if(a.sub==='flamer'&&E&&!a.hold){const d=E.g.position.distanceTo(a.pos);if(d>9&&d<26){const dir=E.g.position.clone().sub(a.pos).setY(0).normalize();a.pos.addScaledVector(dir,dt*3);collide(a.pos,a.r);}}
    if(a.sub==='jump'){if(a.jl){const R=a.jl;R.t+=dt;const k=Math.min(1,R.t/R.dur);a.pos.copy(R.a).lerp(R.b,k);a.pos.y=Math.sin(k*Math.PI)*5.5;if(a.vel)a.vel.set(0,0,0);if(Math.random()<.8)puff(a.pos.clone().add(V3(0,1.2,0)),1,0xffa040,1);
        if(k>=1){a.jl=null;a.pos.y=0;collide(a.pos,a.r);dust(a.pos.clone(),12);ringAt(a.pos.x,.2,a.pos.z,0x9fd8ff,.4,3.5,.4,.2);for(const e of enemies)if(e.alive&&e.g.position.distanceTo(a.pos)<3.2)damageEnemy(e,110,'body',e.g.position.clone().sub(a.pos).setY(0).normalize(),{_remote:true,stagger:.6,knock:1});}continue;}
      a.jlCd=(a.jlCd??2)-dt;if(E&&a.jlCd<=0){const d=E.g.position.distanceTo(a.pos);if(d>7&&d<24){const b=navCell(E.g.position.clone().add(a.pos.clone().sub(E.g.position).setY(0).normalize().multiplyScalar(1.6)));a.jl={a:a.pos.clone(),b,t:0,dur:.6+d/40};a.jlCd=6+Math.random()*3;if(a.pos.distanceTo(player.pos)<30)play('whoosh');}}}
    if(a.sub==='apoth'){a.healCd=(a.healCd??3)-dt;
      const downed=allies.find(o=>o.alive&&o.down&&o.bleed>0&&o.pos.distanceTo(a.pos)<30);if(downed){a.hold=downed.pos.clone();a.apoHold=true;if(a.pos.distanceTo(downed.pos)<1.9){downed.reviveT=(downed.reviveT||0)+dt;if(downed.reviveT>2.2)reviveAlly(downed,a);}}
      else if(a.apoHold){a.hold=null;a.apoHold=false;}
      if(a.healCd<=0){a.healCd=3.5;let tgt=null,lo=.8;if(player.hp<player.maxHp*.75&&player.pos.distanceTo(a.pos)<14){tgt=player;lo=0;}
        if(!tgt)for(const o of allies)if(o.alive&&!o.down&&!o.vehicle&&o!==a&&o.hp<o.maxHp*lo&&o.pos.distanceTo(a.pos)<14){lo=o.hp/o.maxHp;tgt=o;}
        if(tgt){const P=tgt===player?player.pos:tgt.pos;if(tgt===player){player.hp=Math.min(player.maxHp,player.hp+player.maxHp*.12);if(actx)tone('sine',660,990,.04,.3);}else tgt.hp=Math.min(tgt.maxHp,tgt.hp+tgt.maxHp*.2);
          ringAt(P.x,.15,P.z,0x60ff90,.4,1.6,.5,.12);hitSparks(P.clone().setY(1.4),new THREE.Vector3(0,1,0),6);}}}}}
// ---------------- 倒地与救援：普通兄弟中弹倒地，按住 F 或药剂师救起，22 秒内没人救就牺牲
function reviveAlly(a,by){if(!a.down)return;a.down=false;a.hp=a.maxHp*.5;a.bleed=0;a.reviveT=0;if(a.J.torso){a.J.torso.position.y=.98;a.J.torso.rotation.x=0;}if(a.revInter&&!a.revInter.done){a.revInter.done=true;levelGroup.remove(a.revInter.mesh);}
  if(a.J.chev)a.J.chev.visible=true;play('pickup');if(by===player){if(!a.def.generic)vox(a.id,'I owe you, brother.',true);else{const sp=allies.filter(o=>o.alive&&!o.def.generic&&!o.vehicle);if(sp.length)vox(pickOne(sp).id,pickOne(['He’s up! Good work.','On your feet, brother!']));}}}
const _adL=allyDie;allyDie=function(a,silent){if(CAMP.on&&state==='playing'&&!silent&&a.alive&&!a.down&&!a.vehicle&&!a.big&&!a.def.betrayer&&!a.def.essential&&!a.wasDowned&&Math.random()<.7){
    a.wasDowned=true;a.down=true;a.downT=1e9;a.hp=1;a.bleed=22;a.target=null;const n=a.name;a.revInter=addInter(a.pos.clone(),'Revive '+n,1.8,()=>reviveAlly(a,player),0x60ff90);
    const sp=allies.filter(o=>o.alive&&!o.def.generic&&!o.vehicle&&o!==a);if(sp.length)vox(pickOne(sp).id,pickOne([`Man down! ${n} is hit!`,`${n} is down — someone get to him!`,'Apothecary! Brother down!']),true);return;}
  if(!a.def.generic&&CAMP.on&&a.alive){later(1.2,()=>{const sp=allies.filter(o=>o.alive&&!o.def.generic&&!o.vehicle&&o!==a);if(sp.length)vox(pickOne(sp).id,pickOne([`No… ${a.name.split(' ').pop()}!`,`${a.name.split(' ').pop()} is gone. Make them pay for it!`]),true);});}
  if(a.revInter&&!a.revInter.done){a.revInter.done=true;levelGroup.remove(a.revInter.mesh);}return _adL(a,silent);};
function updateDowned(dt){for(const a of allies){if(!a.alive||!a.down||!a.bleed)continue;a.bleed-=dt;if(a.revInter&&a.revInter.prog>0)a.bleed+=dt*.6;if(a.bleed<=0){a.down=false;a.bleed=0;if(a.revInter&&!a.revInter.done){a.revInter.done=true;levelGroup.remove(a.revInter.mesh);}_adL(a,true);}}}
// ---------------- 可引爆的钷素油桶（打一枪就炸，会连锁、会点燃敌人）
const BAR={list:[]};
function addBarrel(x,z){const g=new THREE.Group();g.position.set(x,0,z);const b=new THREE.Mesh(new THREE.CylinderGeometry(.42,.42,1.2,12),lmat(0x6a2a14));b.position.y=.6;g.add(b);
  const band=new THREE.Mesh(new THREE.CylinderGeometry(.44,.44,.18,12),lmat(0xc8a020));band.position.y=.75;g.add(band);const top=new THREE.Mesh(new THREE.CylinderGeometry(.3,.3,.05,10),lmat(0x1a1a1a));top.position.y=1.22;g.add(top);
  levelGroup.add(g);b.userData.barrel=true;const B={g,b,x,z,hp:1,dead:false};b.userData.bar=B;wallMeshes.push(b);const c={minX:x-.45,maxX:x+.45,minZ:z-.45,maxZ:z+.45,barrel:B};colliders.push(c);B.col=c;BAR.list.push(B);return B;}
function blowBarrel(B){if(B.dead)return;B.dead=true;const P=V3(B.x,.6,B.z);levelGroup.remove(B.g);const i=wallMeshes.indexOf(B.b);if(i>=0)wallMeshes.splice(i,1);const j=colliders.indexOf(B.col);if(j>=0)colliders.splice(j,1);
  ringAt(P.x,.3,P.z,0xffa040,.5,7,.5,.3);puff(P.clone().setY(1.5),24,0x2a1a10,4);hitSparks(P,new THREE.Vector3(0,1,0),24);if(OPEN.on)addFire(P.x,.1,P.z,1.6);play('boom');
  const pd=P.distanceTo(player.pos);player.shake=Math.max(player.shake,pd<30?.7*(1-pd/30):0);if(pd<7)tinnitus(1-pd/7);
  for(const e of enemies){if(!e.alive)continue;const d=e.g.position.distanceTo(P);if(d>6.5)continue;const dir=e.g.position.clone().sub(P).setY(0);const L=dir.length()||1;dir.divideScalar(L);damageEnemy(e,(e.vehicle?200:420)*(1-d/7.5),'body',dir,{_remote:true,explode:true,how:{burst:{p:P.clone(),dir}}});}
  if(pd<5.5&&state==='playing')hurtPlayer(55*(1-pd/6),true);for(const a of allies)if(a.alive&&a.pos.distanceTo(P)<5.5)allyHurt(a,40,null);
  for(const o of BAR.list)if(!o.dead&&Math.hypot(o.x-B.x,o.z-B.z)<5.5)later(.15+Math.random()*.2,()=>blowBarrel(o));}
function barrelsNear(P,R){for(const B of BAR.list)if(!B.dead&&Math.hypot(B.x-P.x,B.z-P.z)<R)later(.1,()=>blowBarrel(B));}
const _crL=castRay;castRay=function(o,d,far){const h=_crL(o,d,far);if(h&&h.object&&h.object.userData.barrel){blowBarrel(h.object.userData.bar);}return h;};
const _sbL=shellBlast;shellBlast=function(P,b){_sbL(P,b);barrelsNear(P,(b&&b.W&&b.W.splash)||4);};
const _unL=updateNades;updateNades=function(dt){for(const N of WAR.nades)if(!N.done&&N.t+dt>=N.fly+N.fuse)barrelsNear(N.b,5);_unL(dt);};
function scatterBarrels(){BAR.list=[];if(!OPEN.on)return;for(let k=0;k<9;k++){let p=null;for(let t=0;t<20;t++){const q=V3((Math.random()-.5)*(OPEN.R*2-16),0,(Math.random()-.5)*(OPEN.R*2-16));if(navOK(q.x,q.z,2)&&q.distanceTo(player.pos)>14){p=q;break;}}
  if(!p)continue;const n=1+Math.floor(Math.random()*3);for(let i=0;i<n;i++)addBarrel(p.x+(i%2)*1.0,p.z+Math.floor(i/2)*1.0);}}
// ---------------- 随机战场事件（可选目标）
const EV={cur:null,t:50,used:[]};
function evBeam(P,col){const m=new THREE.Mesh(new THREE.CylinderGeometry(.5,.5,60,8,1,true),new THREE.MeshBasicMaterial({color:col,transparent:true,opacity:.28,depthWrite:false,side:THREE.DoubleSide}));m.position.set(P.x,30,P.z);levelGroup.add(m);return m;}
function evPoint(){for(let t=0;t<30;t++){const P=farPt(26,46);if(Math.abs(P.x)<OPEN.R-8&&Math.abs(P.z)<OPEN.R-8&&navOK(P.x,P.z,1))return navCell(P);}return null;}
function actLegion(){return act4()?pickOne(['ih','sal','rg']):'soh';}
function baseFoe(){return act4()?pickOne(['iw','wb','al','nl']):pickOne(['soh','militia']);}
const EVENTS={
  pinned(P){const ids=[];for(let i=0;i<3;i++){const id='pin'+(++WAR.sq);ALLY_DEFS[id]={name:'Brother '+pickOne(['Avric','Tolm','Serk','Ivo','Haddon','Mire','Quell']),legion:actLegion(),role:'bolter',hp:240,generic:true};
      const a=spawnAlly(id,P.x+(i-1)*1.8,P.z);a.hold=P.clone().add(V3((i-1)*2.2,0,0));ids.push(a);}
    const foes=openSpawn(baseFoe(),6,P,10,16,{minP:14,pure:true});return {name:'Relieve the pinned squad',P,foes,friends:ids,col:0x60ff90,
      win(){return this.foes.every(e=>!e.alive)&&this.friends.some(a=>a.alive);},fail(){return this.friends.every(a=>!a.alive);},
      reward(){for(const a of this.friends)if(a.alive)a.hold=null;CAMP.fs=Math.min(3,(CAMP.fs|0)+1);const a=this.friends.find(a=>a.alive);if(a)vox('vox','We owe you our lives, brothers. We fight with you now.',true);}};},
  nest(P){NEXT_LEG=act4()?'iw':'soh';const h=spawnEnemy('hwt',P.x,P.z);NEXT_LEG=null;sandbags(P.x,P.z+1.6,3.4,0);const foes=[h,...openSpawn(baseFoe(),3,P,3,7,{minP:12,pure:true})];
    return {name:'Silence the heavy weapon nest',P,foes,col:0xff9040,win(){return !h.alive;},fail(){return false;},reward(){CAMP.fs=Math.min(3,(CAMP.fs|0)+1);announce('Nest silenced — fire support +1',1.4);}};},
  snipers(P){const foes=[];for(let i=0;i<2;i++){NEXT_LEG=act4()?'al':'soh';const e=spawnEnemy('snp',P.x+(i?6:-6),P.z+(i?3:-3));NEXT_LEG=null;foes.push(e);}
    return {name:'Hunt the traitor marksmen',P,foes,col:0xff4030,win(){return foes.every(e=>!e.alive);},fail(){return false;},reward(){announce('Marksmen eliminated',1.2);const A=ammo[0],G=WEAPONS[0];if(A&&G&&isFinite(G.reserveMax))A.res=G.reserveMax;}};},
  supply(P){let got=false;podDrop(P,Q=>{dust(Q.clone(),10);});const foes=openSpawn(act4()?'nl':'we',4,P,14,20,{minP:16,pure:true});
    return {name:'Recover the supply drop',P,foes,col:0x80c0ff,win(){if(!got&&player.pos.distanceTo(this.P)<3.2){got=true;}return got;},fail(){return false;},reward(){resupply();}};},
  apoth(P){const id='apx'+(++WAR.sq);ALLY_DEFS[id]={name:'Apothecary '+pickOne(['Vael','Corso','Idris','Maelon']),legion:actLegion(),role:'bolter',hp:300,generic:true,sub:'apoth'};
    const a=spawnAlly(id,P.x,P.z);a.wasDowned=true;a.down=true;a.downT=1e9;a.hp=1;a.bleed=45;a.revInter=addInter(P.clone(),'Revive '+a.name,1.8,()=>reviveAlly(a,player),0x60ff90);
    const foes=openSpawn(baseFoe(),5,P,12,18,{minP:14,pure:true});return {name:'Save the Apothecary',P,foes,friends:[a],col:0x60ff90,win(){return a.alive&&!a.down;},fail(){return !a.alive;},reward(){a.hold=null;vox('vox','Apothecary attached to your squad. I will keep you breathing.',true);}};},
  depot(P){for(let i=0;i<6;i++)addBarrel(P.x+(i%3)*1.1-1.1,P.z+Math.floor(i/3)*1.1);const foes=openSpawn(baseFoe(),6,P,2,5,{minP:14,pure:true});
    return {name:'Ignite the promethium depot',P,foes,col:0xffa040,win(){return foes.every(e=>!e.alive);},fail(){return false;},reward(){announce('Depot burned',1.2);}};}};
function updateEvents(dt){if(!CAMP.on||!OPEN.on||state!=='playing')return;const C=EV.cur;
  if(C){C.t+=dt;if(C.beam)C.beam.material.opacity=.2+Math.sin(gameTime*3)*.08;
    const end=(ok)=>{if(C.beam)levelGroup.remove(C.beam);EV.cur=null;EV.t=60+Math.random()*40;for(const e of C.foes||[])e.campaign=false;
      if(ok){C.reward();objBanner('OPTIONAL COMPLETE — '+C.name);if(actx)tone('sine',880,880,.05,.3);}else announce('Optional objective failed',1.3);};
    if(C.win())end(true);else if(C.fail()||C.t>150)end(false);return;}
  if(!CAMP.S||CAMP.S.lull||CAMP.step<1||SC.on)return;EV.t-=dt;if(EV.t>0)return;const P=evPoint();if(!P){EV.t=10;return;}
  const keys=Object.keys(EVENTS).filter(k=>!EV.used.includes(k));const k=pickOne(keys.length?keys:Object.keys(EVENTS));EV.used.push(k);if(EV.used.length>4)EV.used.shift();
  const C2=EVENTS[k](P);for(const e of C2.foes||[])e.campaign=false;C2.kind=k;C2.t=0;C2.beam=evBeam(P,C2.col);EV.cur=C2;objBanner('OPTIONAL — '+C2.name);
  const sp=allies.filter(a=>a.alive&&!a.def.generic&&!a.vehicle);if(sp.length)vox(pickOne(sp).id,{pinned:'Brothers pinned down out there — we can reach them!',nest:'Heavy weapon nest chewing up our lines — take it out!',snipers:'Marksmen on the high ground. Hunt them.',
    supply:'Supply pod coming down — grab it before they do!',apoth:'An Apothecary is down out there! Get to him!',depot:'Promethium stockpile by their position. One shot and it all goes up.'}[k],true);}
const _cohL=campObjHtml;campObjHtml=function(){let h=_cohL();const C=EV.cur;if(C)h+=`<div class="oopt">◇ OPTIONAL · ${C.name} — ${Math.round(player.pos.distanceTo(C.P))} m</div>`;return h;};
// ---------------- 搭乘坦克：站在陆行舰顶上操纵重爆弹，一路冲过敌阵
function startRide(name,from,to,yaw){const t=spawnAllyTank('ride'+(++WAR.sq),name,from.x,from.z,yaw);t.parked=true;t.invuln=true;t.side=0;
  const path=(NAV.ok&&navPath(from.x,from.z,to.x,to.z,2))||[to.clone()];const g=new THREE.Group();g.position.set(0,2.5,.4);t.root.add(g);const piv=new THREE.Group();g.add(piv);
  const S=new THREE.MeshLambertMaterial({map:texMetal,color:0x4a4a46});const body=new THREE.Mesh(B3(.34,.36,1.3),S);body.position.z=.2;piv.add(body);const br=new THREE.Mesh(new THREE.CylinderGeometry(.07,.08,1.2,8),lmat(0x1a1a1c));br.rotation.x=Math.PI/2;br.position.set(0,.04,1.3);piv.add(br);
  const mz=new THREE.Object3D();mz.position.set(0,.04,1.95);piv.add(mz);const G={g,piv,mz,pos:t.pos,yaw:t.yaw,heat:0,over:0,cd:0,ride:t,path,pi:0,done:false};player.mounted=G;play('equip');CAMP.ride=G;return G;}
function rideUpdate(dt,M){const t=M.ride,pr=$('prompt');M.heat=Math.max(0,M.heat-dt*(M.over>0?18:26));M.over=Math.max(0,M.over-dt);M.cd-=dt;
  if(!M.done){const P=M.path[M.pi];if(P){const to=P.clone().sub(t.pos).setY(0),d=to.length();if(d<1.5)M.pi++;else{const want=Math.atan2(to.x,to.z);t.yaw+=wrapA(want-t.yaw)*Math.min(1,dt*1.6);t.pos.x+=Math.sin(t.yaw)*3.6*dt;t.pos.z+=Math.cos(t.yaw)*3.6*dt;t.root.rotation.y=t.yaw;if(Math.random()<.3)dust(t.pos.clone().add(V3(0,0,0)),1);}}else M.done=true;}
  player.pos.set(t.pos.x,2.3,t.pos.z);player.vy=0;M.piv.rotation.set(-player.pitch,wrapA(player.yaw-t.yaw),0);view.visible=false;
  if(mouseDown&&M.over<=0&&M.cd<=0&&state==='playing'){M.cd=.06;M.heat+=6;const from=new THREE.Vector3();M.mz.getWorldPosition(from);const {o,d}=aimRay(0);fireBolt(from,o.clone().addScaledVector(d,70),{...EWEAP.heavyb,spread:.018,snd:'bolter'},'loyal',38,null);player.shake=Math.max(player.shake,.06);if(M.heat>=100){M.over=2;play('vent');}}
  setProgress(M.over>0?1-M.over/2:M.heat/100,M.over>0?'VENTING':'HEAT');if(pr&&pr.style){pr.textContent=M.done?'Press F — dismount':'Pintle heavy bolter — LMB fire';pr.style.opacity=1;}}
function endRide(){const M=CAMP.ride;if(!M)return;const t=M.ride;player.mounted=null;view.visible=true;setProgress(-1);player.pos.set(t.pos.x+Math.cos(t.yaw)*3.2,0,t.pos.z-Math.sin(t.yaw)*3.2);collide(player.pos,.5);t.parked=false;t.invuln=false;t.hold=t.pos.clone();CAMP.ride=null;play('equip');}
const _ugL=updateGuns;updateGuns=function(dt){const M=player.mounted;if(M&&M.ride){rideUpdate(dt,M);return;}_ugL(dt);};
const _tmL=toggleMount;toggleMount=function(){const M=player.mounted;if(M&&M.ride){if(M.done)endRide();return true;}return _tmL();};
// ---------------- 关卡改动：减少重复
// 3-1 推进 Sirenhold：改成搭乘掠食者冲过街区
CSTEPS['3-1'][3]={enter(){if(player.mounted)toggleMount();CAMP.wpName='SIRENHOLD';CAMP.wp=V3(0,0,-34);startRide('Predator ‘Unbroken Oath’ (ride)',player.pos.clone().add(V3(3,0,0)),V3(0,0,-30),Math.PI);
    vox('loken','Mount up! Ride the armour through the hab-blocks — Sirenhold is dead ahead!',true);openSpawn('militia',10,V3(-14,0,-16),3,10,{minP:12});openSpawn('soh',5,V3(16,0,-22),3,8,{minP:12});
    later(10,()=>openSpawn('militia',8,V3(10,0,-12),3,9,{minP:10}));later(16,()=>{const t=spawnEnemy('rtank',-24,-34);t.campaign=true;vox('ardan','Rebel tank in the square — light it up!',true);});
    later(14,()=>vox('malk','Kaedric, it’s Malk. Listen — stay close to the Sirenhold. Whatever happens. Trust me on this.',true));later(20,()=>vox('kaedric','Malk? Why aren’t you down here with us, brother?',true));later(25,()=>vox('malk','…The Warmaster has other work for me. Good hunting.',true));},
  update(){if(CAMP.ride&&CAMP.ride.done&&campAlive()<=4){endRide();}return !CAMP.ride&&player.pos.distanceTo(V3(0,0,-34))<14;}};
// 4-1 第四步：不再炸炮台（和 3-3 重复），改成搭乘陆行舰冲上火力基地，终结者传送迎击，拔掉重武器组
CLEVELS['4-1'].obj=['Hold the drop zone','Break the Death Guard line','Hold the breach','Ride the Land Raider to the firebase','Storm the Sons of Horus firebase'];
CSTEPS['4-1'].splice(3,1,
  {enter(){if(player.mounted)toggleMount();CAMP.wp=V3(0,0,-30);CAMP.wpName='FIREBASE';startRide('Land Raider ‘Gorgon’s Anvil’',player.pos.clone().add(V3(3,0,0)),V3(0,0,-28),Math.PI);
      vox('haldrek','Up on the Raider, Corvan! Take the pintle — we drive straight down their throats!',true);openSpawn('soh',5,V3(-16,0,-14),3,8,{minP:12});NEXT_LEG='soh';const h=spawnEnemy('hwt',14,-20);NEXT_LEG=null;h.campaign=true;sandbags(14,-18.4,3.4,0);
      later(9,()=>openSpawn('we',6,V3(20,0,-26),3,9,{minP:12}));later(15,()=>{const t=spawnEnemy('tpred',-22,-40);t.campaign=true;vox('ostvar','Predator by the firebase wall!',true);});},
    update(){if(CAMP.ride&&CAMP.ride.done&&campAlive()<=4)endRide();return !CAMP.ride&&campAlive()<=4;}},
  {enter(){CAMP.wp=V3(0,0,-46);CAMP.wpName='FIREBASE';const nests=[];for(const [x,z] of [[-8,-48],[8,-44]]){NEXT_LEG='soh';const h=spawnEnemy('hwt',x,z);NEXT_LEG=null;h.campaign=true;nests.push(h);}CAMP.nests=nests;
      openSpawn('soh',6,V3(0,0,-50),3,9,{minP:16});vox('ferrus','The firebase! Take it, and Horus stands naked before us!',true);
      later(12,()=>{for(let i=0;i<3;i++){NEXT_LEG='just';const e=spawnEnemy('term',(i-1)*3,-38);NEXT_LEG=null;e.campaign=true;}vox('senn','Teleport flare — Justaerin! The Warmaster’s own Terminators!',true);});},
    mark:e=>e.type==='hwt'||e.type==='term',update(){return CAMP.nests.every(h=>!h.alive)&&campAlive()<=2&&CAMP.timers.length===0;}});
// ---------------- 沉浸细节：头盔面罩、空中余烬、动力甲脚步、队友闲聊、首次遭遇喊话
let visor=null;try{visor=document.createElement('div');visor.id='visorFx';if(visor.style){visor.style.cssText='position:fixed;inset:0;pointer-events:none;z-index:3;opacity:0;transition:opacity .4s';
  visor.innerHTML='<div style="position:absolute;inset:14px;border:1px solid rgba(200,230,210,.07);border-radius:28px;box-shadow:inset 0 0 90px rgba(0,0,0,.55)"></div>'+
    ['top:18px;left:18px;border-width:2px 0 0 2px','top:18px;right:18px;border-width:2px 2px 0 0','bottom:18px;left:18px;border-width:0 0 2px 2px','bottom:18px;right:18px;border-width:0 2px 2px 0'].map(s=>`<div style="position:absolute;width:42px;height:42px;border:solid rgba(220,235,220,.22);${s}"></div>`).join('')+
    '<div id="visorCrack" style="position:absolute;inset:0;opacity:0;background:linear-gradient(118deg,transparent 48.6%,rgba(255,255,255,.35) 49%,transparent 49.4%),linear-gradient(32deg,transparent 61.7%,rgba(255,255,255,.28) 62%,transparent 62.3%),linear-gradient(77deg,transparent 30.8%,rgba(255,255,255,.22) 31%,transparent 31.2%);"></div>'+
    '<div id="visorRed" style="position:absolute;inset:0;opacity:0;box-shadow:inset 0 0 160px rgba(200,20,10,.7)"></div>';document.body.appendChild(visor);}}catch(err){visor=null;}
let ashEmb=null;
function buildAshEmb(){try{const n=260,g=new THREE.BufferGeometry(),p=new Float32Array(n*3);for(let i=0;i<n;i++){p[i*3]=(Math.random()-.5)*40;p[i*3+1]=Math.random()*14;p[i*3+2]=(Math.random()-.5)*40;}
  g.setAttribute('position',new THREE.BufferAttribute(p,3));const m=new THREE.PointsMaterial({color:0xff9050,size:.09,transparent:true,opacity:.85,depthWrite:false});ashEmb=new THREE.Points(g,m);ashEmb.frustumCulled=false;scene.add(ashEmb);ashEmb.userData.lg=levelGroup;}catch(err){ashEmb=null;}}
function updateAshEmb(dt){if(!OPEN.on||!CAMP.on){if(ashEmb)ashEmb.visible=false;return;}if(!ashEmb||!ashEmb.geometry||!ashEmb.geometry.attributes)buildAshEmb();if(!ashEmb||!ashEmb.geometry||!ashEmb.geometry.attributes)return;ashEmb.visible=true;
  const p=ashEmb.geometry.attributes.position,a=p.array,cx=camera.position.x,cz=camera.position.z;if(!a)return;for(let i=0;i<a.length;i+=3){a[i+1]+=dt*(.4+((i*7)%10)*.05);a[i]+=Math.sin(gameTime*.7+i)*dt*.6+dt*.8;a[i+2]+=Math.cos(gameTime*.5+i)*dt*.4;
    if(a[i+1]>16)a[i+1]=0;if(a[i]-cx>20)a[i]-=40;if(a[i]-cx<-20)a[i]+=40;if(a[i+2]-cz>20)a[i+2]-=40;if(a[i+2]-cz<-20)a[i+2]+=40;}p.needsUpdate=true;}
const IMM={stepT:0,quiet:0,banterI:0,seen:new Set()};
const BANTER={
  3:[['ardan','Strange to be fighting our own colours. I keep checking the eye on their pauldrons.'],['krosk','My axe doesn’t check. That’s the difference between us, Ardan.'],
    ['lucan','When this is over, I will ask Tarvitz why our Legion sent so few of us.'],['tavik','Nikaea forbade me my gift. I wonder who forbids the warp to the other side.'],
    ['vell','Remember the Triumph on Ullanor? All those banners. I thought we had won the galaxy.'],['ardan','We had. Then someone decided to want more than the galaxy.']],
  4:[['ostvar','Flesh tires. Iron doesn’t. That’s why we will be the last ones standing.'],['kavel','Every Salamander here carries a hammer he made himself. Ask me to show you mine — later.'],
    ['senn','You are loud, Iron Hands. We could hear you coming from the other side of the valley.'],['haldrek','Good. Let the traitors hear us too.'],
    ['corvan','Sergeant… do you think the Gorgon knew? About the second wave?'],['haldrek','If he knew, he would have charged anyway. That is what he is.']]};
function updateImmersion(dt){const camp=CAMP.on&&state==='playing';if(visor&&visor.style){visor.style.opacity=camp?'1':'0';const k=player.maxHp?player.hp/player.maxHp:1;const c=document.getElementById?document.getElementById('visorCrack'):null,r=document.getElementById?document.getElementById('visorRed'):null;
    if(c&&c.style)c.style.opacity=k<.35?((.35-k)/.35).toFixed(2):'0';if(r&&r.style)r.style.opacity=k<.3?((.3-k)/.3*(.6+.4*Math.sin(gameTime*6))).toFixed(2):'0';}
  updateAshEmb(dt);if(!camp)return;
  // 动力甲脚步：沉重的落地声 + 伺服声
  const mv=(keys.KeyW||keys.KeyA||keys.KeyS||keys.KeyD)&&!player.mounted&&player.onGround!==false;IMM.stepT-=dt*(keys.ShiftLeft?1.5:1);
  if(mv&&IMM.stepT<=0&&actx){IMM.stepT=.42;noiseHit(140,.07,.14);tone('square',52,38,.018,.09);if(Math.random()<.25)tone('sawtooth',380,520,.006,.18);}
  // 安静时队友闲聊
  const near=enemies.some(e=>e.alive&&e.g.position.distanceTo(player.pos)<38);IMM.quiet=near?0:IMM.quiet+dt;
  if(IMM.quiet>14&&!SC.on){IMM.quiet=-30;const pool=BANTER[act4()?4:3]||[];for(let tries=0;tries<pool.length;tries++){const i=(IMM.banterI++)%pool.length;if(i%2)continue;const L1=pool[i],L2=pool[i+1];
      const ok=w=>w==='corvan'||w==='kaedric'||allies.some(a=>a.id===w&&a.alive);if(ok(L1[0])&&L2&&ok(L2[0])){vox(L1[0],L1[1],true);vox(L2[0],L2[1],true);break;}}}
  // 第一次遇到某种敌人时喊话
  for(const e of enemies){if(!e.alive||IMM.seen.has(e.type))continue;if(e.g.position.distanceTo(player.pos)>45)continue;const line={term:'Terminators! Heavy weapons up — bolts won’t crack that plate!',raptor:'Jump packs overhead! They’re coming down on us!',snp:'Marksman! Watch for the red line!',
      hwt:'Heavy weapon team dug in — flank it!',kako:'Kakophoni — that noise will burst your ears. Close the distance!',ldr:'Champion with a banner — kill him and the rest falter!',tdread:'Dreadnought!',tpred:'Enemy armour!'}[e.type];
    IMM.seen.add(e.type);if(line){const sp=allies.filter(a=>a.alive&&!a.def.generic&&!a.vehicle);if(sp.length)vox(pickOne(sp).id,line,true);}}}
// 处决时队友喝彩
const _exL=execute;execute=function(mode){const was=ex.active;const r=_exL(mode);if(CAMP.on&&!was&&ex.active&&Math.random()<.45){const sp=allies.filter(a=>a.alive&&!a.def.generic&&!a.vehicle&&a.pos.distanceTo(player.pos)<25);
    if(sp.length)later(.8,()=>vox(pickOne(sp).id,pickOne(['The Emperor’s judgement!','Brutal. Well done, brother.','Ha! Rip him open!','That is how it’s done.'])));}return r;};
// ---------------- 挂进主循环
const _ucS=updateCampaign;updateCampaign=function(dt){_ucS(dt);if(state==='playing'){allySpecials(dt);updateDowned(dt);updateEvents(dt);}updateImmersion(dt);};
const _sclS=startCampaignLevel;startCampaignLevel=function(id){if(EV.cur&&EV.cur.beam&&EV.cur.beam.parent)EV.cur.beam.parent.remove(EV.cur.beam);EV.cur=null;EV.t=50;IMM.seen.clear();IMM.quiet=0;CAMP.ride=null;_sclS(id);scatterBarrels();};
const _crS=campRebuild;campRebuild=function(spec){EV.cur=null;EV.t=50;CAMP.ride=null;_crS(spec);scatterBarrels();};
const _xcS=exitCampaign;exitCampaign=function(){_xcS.apply(null,arguments);EV.cur=null;CAMP.ride=null;if(visor&&visor.style)visor.style.opacity='0';if(ashEmb)ashEmb.visible=false;};
