// ============================================================ 武器（视角模型）
const view=new THREE.Group();camera.add(view);
const gun=new THREE.Group();view.add(gun);
const gunMat=new THREE.MeshLambertMaterial({map:texMetal,color:0x9a9088});
const gunDark=new THREE.MeshLambertMaterial({color:0x2a2420});
[[.14,.16,.7,0,0,0,gunMat],[.1,.1,.4,0,.02,-.5,gunDark],[.1,.22,.12,0,-.16,.05,gunDark],[.08,.14,.2,0,-.12,.25,gunMat],[.16,.04,.3,0,.1,-.05,gunDark]]
  .forEach(([w,h,d,x,y,z,m])=>{const b=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);b.position.set(x,y,z);gun.add(b);});
const flash=new THREE.Mesh(new THREE.BoxGeometry(.18,.18,.05),new THREE.MeshBasicMaterial({color:0xffd080}));flash.position.set(0,.02,-.75);flash.visible=false;gun.add(flash);
gun.position.set(.32,-.28,-.55);
const shotgun=new THREE.Group();view.add(shotgun);shotgun.visible=false;
const sgWood=new THREE.MeshLambertMaterial({color:0x5a3a22});
[[.16,.14,.5,0,0,.1,sgWood],[.07,.07,.8,-.04,.03,-.45,gunDark],[.07,.07,.8,.04,.03,-.45,gunDark],[.13,.1,.3,0,-.06,-.35,sgWood],[.18,.05,.2,0,.09,0,gunMat],[.08,.2,.14,0,-.15,.22,sgWood]]
  .forEach(([w,h,d,x,y,z,m])=>{const b=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);b.position.set(x,y,z);shotgun.add(b);});
const sgFlash=new THREE.Mesh(new THREE.BoxGeometry(.3,.3,.05),new THREE.MeshBasicMaterial({color:0xffd080}));sgFlash.position.set(0,.03,-.9);sgFlash.visible=false;shotgun.add(sgFlash);
const sawG=new THREE.Group();view.add(sawG);let sword=sawG;
const texChain=pixelTex((g,s)=>{g.fillStyle='#1a1614';g.fillRect(0,0,s,s);for(let x=0;x<s;x+=4){g.fillStyle='#b8b0a0';g.fillRect(x,0,2,s);g.fillStyle='#6a625a';g.fillRect(x+2,0,1,s);}},16);
texChain.repeat.set(6,1);
const chainMat=new THREE.MeshBasicMaterial({map:texChain});
const swordBody=new THREE.Mesh(new THREE.BoxGeometry(.1,.16,1.05),new THREE.MeshLambertMaterial({map:texMetal,color:0xb0a080}));swordBody.position.z=-.62;sword.add(swordBody);
for(const y of [.1,-.1]){const c=new THREE.Mesh(new THREE.BoxGeometry(.12,.04,1.08),chainMat);c.position.set(0,y,-.62);sword.add(c);}
const swordTip=new THREE.Mesh(new THREE.CylinderGeometry(.1,.1,.12,8),chainMat);swordTip.rotation.z=Math.PI/2;swordTip.position.set(0,0,-1.15);sword.add(swordTip);
const housing=new THREE.Mesh(new THREE.BoxGeometry(.18,.24,.3),gunDark);housing.position.z=-.05;sword.add(housing);
const exhaust=new THREE.Mesh(new THREE.CylinderGeometry(.03,.03,.14,5),gunMat);exhaust.position.set(.1,.12,0);sword.add(exhaust);
const grip=new THREE.Mesh(new THREE.BoxGeometry(.07,.07,.28),new THREE.MeshLambertMaterial({color:0x3a1a12}));grip.position.z=.18;sword.add(grip);
sword.visible=false;
const ghost=new THREE.Mesh(new THREE.BoxGeometry(.14,.3,1.1),new THREE.MeshBasicMaterial({color:0xd8d0c0,transparent:true,opacity:.25,depthWrite:false}));
ghost.geometry.translate(0,0,-.62);view.add(ghost);ghost.visible=false;
let gunKick=0,gunRoll=0;
// ---------- 其他武器模型
const pistol=new THREE.Group();view.add(pistol);pistol.visible=false;
[[.1,.12,.36,0,0,-.05,gunMat],[.07,.07,.16,0,.01,-.3,gunDark],[.08,.2,.1,0,-.14,.08,gunDark],[.11,.03,.3,0,.075,-.05,new THREE.MeshLambertMaterial({color:0xb8952e})]]
  .forEach(([w,h,d,x,y,z,m])=>{const b=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);b.position.set(x,y,z);pistol.add(b);});
const pFlash=new THREE.Mesh(new THREE.BoxGeometry(.14,.14,.04),new THREE.MeshBasicMaterial({color:0xffd080}));pFlash.position.set(0,.01,-.42);pFlash.visible=false;pistol.add(pFlash);
const melta=new THREE.Group();view.add(melta);melta.visible=false;
const heatMat=new THREE.MeshBasicMaterial({color:0x5a2010});
const heat={v:0,over:0,charge:0};
[[.2,.2,.55,0,0,.05,gunMat],[.14,.14,.5,0,.02,-.45,gunDark],[.12,.22,.16,0,-.16,.12,gunDark],[.12,.12,.3,.14,.06,.1,new THREE.MeshLambertMaterial({color:0x3a5a7a})]]
  .forEach(([w,h,d,x,y,z,m])=>{const b=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);b.position.set(x,y,z);melta.add(b);});
for(let i=0;i<3;i++){const r=new THREE.Mesh(new THREE.TorusGeometry(.09,.02,4,8),heatMat);r.position.set(0,.02,-.3-i*.12);melta.add(r);}
const meltaFlash=new THREE.Mesh(new THREE.BoxGeometry(.3,.3,.05),new THREE.MeshBasicMaterial({color:0xfff0c0}));meltaFlash.position.set(0,.02,-.75);meltaFlash.visible=false;melta.add(meltaFlash);
const powG=new THREE.Group();view.add(powG);powG.visible=false;
const powMat=new THREE.MeshBasicMaterial({color:0x8fd0ff});
{const b=new THREE.Mesh(new THREE.BoxGeometry(.05,.14,1.15),new THREE.MeshLambertMaterial({color:0xc8d8e8,emissive:0x3060a0}));b.position.z=-.7;powG.add(b);
 for(const y of [.075,-.075]){const e=new THREE.Mesh(new THREE.BoxGeometry(.055,.015,1.15),powMat);e.position.set(0,y,-.7);powG.add(e);}
 const g=new THREE.Mesh(new THREE.BoxGeometry(.42,.06,.08),new THREE.MeshLambertMaterial({color:0xb8952e}));g.position.z=-.1;powG.add(g);
 const h=new THREE.Mesh(new THREE.BoxGeometry(.06,.06,.25),new THREE.MeshLambertMaterial({color:0x2a1a12}));h.position.z=.07;powG.add(h);}
const powAura=new THREE.Mesh(new THREE.BoxGeometry(.16,.3,1.3),new THREE.MeshBasicMaterial({color:0x60b0ff,transparent:true,opacity:0,depthWrite:false}));powAura.position.z=-.7;powG.add(powAura);
const ssG=new THREE.Group();view.add(ssG);ssG.visible=false;
{const b=new THREE.Mesh(new THREE.BoxGeometry(.06,.12,.75),new THREE.MeshLambertMaterial({map:texMetal,color:0xd8d0c0}));b.position.z=-.48;ssG.add(b);
 const g=new THREE.Mesh(new THREE.BoxGeometry(.3,.06,.07),new THREE.MeshLambertMaterial({color:0xb8952e}));g.position.z=-.08;ssG.add(g);
 const h=new THREE.Mesh(new THREE.BoxGeometry(.06,.06,.22),new THREE.MeshLambertMaterial({color:0x2a1a12}));h.position.z=.06;ssG.add(h);}
const shieldG=new THREE.Group();view.add(shieldG);shieldG.visible=false;
{const s=new THREE.Mesh(new THREE.BoxGeometry(.5,.7,.06),new THREE.MeshLambertMaterial({map:texMetal,color:0x41557e}));shieldG.add(s);
 const r=new THREE.Mesh(new THREE.BoxGeometry(.54,.74,.04),new THREE.MeshLambertMaterial({color:0xb8952e}));r.position.z=.02;shieldG.add(r);
 const e=new THREE.Mesh(new THREE.BoxGeometry(.22,.08,.02),new THREE.MeshLambertMaterial({color:0xb8952e}));e.position.z=-.04;shieldG.add(e);
 const e2=new THREE.Mesh(new THREE.BoxGeometry(.06,.26,.02),new THREE.MeshLambertMaterial({color:0xb8952e}));e2.position.z=-.04;shieldG.add(e2);}
const RANGED_MODELS=[gun,shotgun,melta,pistol];

const ray=new THREE.Raycaster();
function aimRay(spread=0){const d=new THREE.Vector3(0,0,-1);d.x+=(Math.random()-.5)*spread;d.y+=(Math.random()-.5)*spread;d.applyQuaternion(camera.quaternion).normalize();
  const o=new THREE.Vector3();camera.getWorldPosition(o);return {o,d};}
function hitTargets(){const t=wallMeshes.slice();for(const e of enemies)if(e.alive)for(const p of Object.values(e.parts))if(p.parent===e.g)t.push(p,...p.children.filter(c=>c.userData.part==='eye'));return t;}
function castRay(o,d,far=120){ray.set(o,d);ray.far=far;const h=ray.intersectObjects(hitTargets(),false);return h[0]||null;}
function showHit(kill){const h=$('hit');h.className=kill?'kill':'';h.style.opacity=1;h.style.transition='none';requestAnimationFrame(()=>{h.style.transition='opacity .25s';h.style.opacity=0;});}

function spawnSpark(p){const m=new THREE.Mesh(bloodGeo,new THREE.MeshBasicMaterial({color:0xffc060}));m.position.copy(p);scene.add(m);setTimeout(()=>scene.remove(m),80);}
// ============================================================ 武器与配装
const RANGED={
  bolter:{id:'bolter',name:'爆弹枪',magSize:24,reserveMax:192,res0:120,rate:7,dmg:24,pellets:1,spread:.012,auto:true,climb:.016,kick:1.2,reload:1.1,knock:.35,snd:'bolter',desc:'全自动火箭推进爆弹：钉进目标后小范围爆炸，能炸碎命中的部位。',model:gun,flash:flash},
  shotgun:{id:'shotgun',name:'霰弹枪',magSize:6,reserveMax:48,res0:30,rate:1.3,dmg:16,pellets:10,spread:.1,auto:false,climb:.06,kick:2.2,reload:1.3,knock:.5,snd:'shotgun',desc:'大口径，10 颗弹丸。近距离能把敌人胸口轰出大洞，或把半边身体轰飞。',model:shotgun,flash:sgFlash},
  melta:{id:'melta',name:'热熔枪',heat:true,magSize:Infinity,reserveMax:Infinity,res0:Infinity,rate:1.6,dmg:170,pellets:1,spread:0,auto:false,climb:.05,kick:2.4,reload:0,range:16,pierce:true,snd:'melta',desc:'无需弹药，会过热。右键蓄力、左键发射，直接烧穿一条线上所有敌人的身体。',model:melta,flash:meltaFlash}};
const PISTOL={id:'pistol',name:'爆弹手枪',magSize:10,reserveMax:Infinity,res0:Infinity,rate:4,dmg:20,pellets:1,spread:.008,auto:false,climb:.02,kick:1,reload:.8,knock:.25,snd:'pistol',model:pistol,flash:pFlash};
const MELEE={
  saw:{id:'saw',name:'链锯剑',melee:true,bite:true,dmg:35,windup:.13,slash:.17,desc:'四段连招：斜劈、横斩、突刺锯入、切开。右键按住蓄力，松开进入狂热（移速和攻速提升）。重击（按住左键）：回旋锯斩，拦腰锯断周围一圈敌人。'},
  power:{id:'power',name:'力场分解剑',melee:true,cleave:true,dmg:48,windup:.09,slash:.12,desc:'四段连招：左劈、右劈、突刺、上挑，每刀都能劈开前方所有敌人。右键：分解力场（8 秒，伤害 ×1.6，挥砍时吟诵祷言）。重击（按住左键）：裂地斩，劈开前方一条直线上的所有敌人。'},
  hammer:{id:'hammer',name:'雷殛锤',melee:true,cleave:true,dmg:72,windup:.24,slash:.2,desc:'三段大范围横扫，打退一片。重击：雷霆砸地，震晕周围所有敌人。'},
  fist:{id:'fist',name:'破甲巨拳',melee:true,dmg:50,windup:.1,slash:.11,desc:'刺拳、直拳、上勾拳，拳拳打碎血肉。重击：抓住面前的敌人当场捏碎（精英要先打残）。'},
  axe:{id:'axe',name:'链锯战斧',melee:true,bite:true,dmg:54,windup:.16,slash:.16,desc:'沉重的劈砍会咬进敌人身体。重击：横斩斩首。'},
  ssword:{id:'ssword',name:'剑盾',melee:true,block:true,dmg:42,windup:.14,slash:.17,desc:'按住 E 举盾格挡（时机准可防反）；右键切换剑 / 爆弹手枪。重击（按住左键）：盾击，撞飞并震晕前方敌人。'}};
for(const k in CFG.guns)if(RANGED[k])Object.assign(RANGED[k],CFG.guns[k]);for(const k in CFG.melee)Object.assign(MELEE[k],CFG.melee[k]);
const MELEE_GROUP={saw:sawG,power:powG,ssword:ssG};
function loadLoadout(){try{return JSON.parse(localStorage.getItem('abyss_loadout'))||{primary:'bolter',melee:'saw'};}catch(e){return{primary:'bolter',melee:'saw'};}}
let loadout=loadLoadout();
let WEAPONS=[],cur=0,ammo=[],reloadT=0,switchT=0,reloadFor=-1;
function applyLoadout(){const P={...RANGED[loadout.primary]},M={...MELEE[loadout.melee]};upgradeWeapons(P,M);WEAPONS=[P,PISTOL,M];sword=MELEE_GROUP[loadout.melee];
  heat.v=0;heat.over=0;heat.charge=0;
  ammo=[{mag:WEAPONS[0].magSize,res:WEAPONS[0].res0},{mag:PISTOL.magSize,res:Infinity},{}];cur=0;reloadT=0;switchT=0;reloadFor=-1;}
applyLoadout();
function activeGun(){const w=WEAPONS[cur];if(w.melee)return (w.block&&player.ssPistol)?{w:PISTOL,slot:1}:null;return {w,slot:cur};}
function switchWeapon(i){if(i===1&&CLS[cls]&&CLS[cls].noPistol){if(cur===1)return;announce('机甲没有副武器',0.8);return;}if(i===cur||i<0||i>2||MS.phase==='bite'||ex.active)return;cur=i;switchT=0.3;reloadT=0;reloadFor=-1;player.blocking=false;player.revving=false;
  if(i!==2){swordOut=0;sword.visible=false;ghost.visible=false;shieldG.visible=false;}MS.phase='none';swing=0;MS.queued=false;play('equip');if(cur!==2&&MS.phase!=='none'){MS.phase='none';swing=0;}}
function startReload(){const G=activeGun();if(!G)return;const w=G.w;if(player.channelT>0){announce('施法中无法换弹',0.8);return;}if(w.heat)return;if(reloadT>0||switchT>0||ex.active)return;const a=ammo[G.slot];if(a.mag>=w.magSize||a.res<=0){if(a.res<=0&&a.mag<=0)announce('没有备弹了',1);return;}
  reloadT=w.reload;reloadFor=G.slot;play('magOut');setTimeout(()=>{if(reloadT>0)play('magIn');},w.reload*550);}
function finishReload(){const w=reloadFor===1?PISTOL:WEAPONS[reloadFor],a=ammo[reloadFor];const n=Math.min(w.magSize-a.mag,a.res);a.mag+=n;if(a.res!==Infinity)a.res-=n;play('chamber');reloadFor=-1;}
function tryFire(pressed){if(ex.active)return;const G=activeGun();
  if(!G){if(pressed&&!player.blocking)meleePress();return;}const w=G.w,slot=G.slot;
  if(!w.auto&&!pressed)return;
  if(reloadT>0||switchT>0||player.fireCd>0)return;
  if(w.heat){if(!pressed)return;if(heat.over>0){play('dry');announce('热熔枪过热！',0.8);return;}fire(w);return;}
  if(ammo[slot].mag<=0){if(pressed)play('dry');startReload();return;}
  fire(w,slot);
}
function fire(w,slot=cur){
  player.fireCd=1/(w.rate*(w.spin?0.23+0.77*(player.spin||0):1));if(!w.heat)ammo[slot].mag--;const mScale=w.heat?0.35+0.65*heat.charge:1;
  play(w.snd);const fl=w.flash;fl.visible=true;muzzleLight.intensity=w.id==='melta'?70:w.id==='shotgun'?55:30;muzzleLight.color.setHex(w.id==='melta'?0xffa060:0xffb060);setTimeout(()=>{fl.visible=false;muzzleLight.intensity=0;},w.id==='melta'?120:50);
  player.recoil+=0.06*w.kick;gunKick=w.kick;gunRoll=(Math.random()-.5)*0.25*w.kick;player.pitch=clamp(player.pitch+w.climb,-1.5,1.5);player.yaw+=(Math.random()-.5)*0.006*w.kick;
  if(w.kick>=2){player.shake=Math.max(player.shake,0.22);player.punch=Math.max(player.punch||0,0.035);}
  let anyHit=false,anyKill=false,head=false;
  if(fireSpecial(w,mScale)){}
  else if(w.pierce){ // 热熔枪：穿透一条线
    const {o,d}=aimRay(0);ray.set(o,d);ray.far=w.range;const hits=ray.intersectObjects(hitTargets(),false);const done=new Set();let end=o.clone().addScaledVector(d,w.range);
    for(const h of hits){const e=h.object.userData.enemy;if(!e){end=h.point;break;}if(done.has(e))continue;done.add(e);
      const part=h.object.userData.part;
      const k=damageEnemy(e,w.dmg*mScale*player.gunMul*(1-h.distance/w.range*0.5),'body',d,{point:h.point,knock:.8*mScale+.3,stagger:.4,how:mScale>=0.95?{melt:true}:{hole:{p:h.point,dir:d,mode:'vapor'}}});
      if(!k&&(part==='armL'||part==='armR'))vaporizeLimb(e,part);
      e.burn=2;embers(h.point,6);puff(h.point,2,0x333333,.8);anyHit=true;anyKill=anyKill||k;}
    heatBeam(o.clone().add(new THREE.Vector3(0,-.18,0)),end,0.5+mScale);
    heat.v+=20+heat.charge*45;heat.charge=0;if(heat.v>=100){heat.v=100;heat.over=2.5;play('vent');announce('热熔枪过热！散热中…',1.5);}
  } else if(w.id==='bolter'||w.spin){const {o,d}=aimRay(w.spread*(w.spin?1.6-player.spin:1));spawnBolt(o,d,w);}
  else if(w.id==='shotgun'){const r=shotgunBlast(w);anyHit=r.anyHit;anyKill=r.anyKill;head=r.head;}
  else for(let k=0;k<w.pellets;k++){const {o,d}=aimRay(w.spread);const h=castRay(o,d);if(!h)continue;const e=h.object.userData.enemy;
    if(e){const part=h.object.userData.part==='eye'?'head':h.object.userData.part;const killed=damageEnemy(e,w.dmg*player.gunMul,part,d,{point:h.point,knock:w.knock,how:part==='head'?{headBurst:true}:{}});hitSparks(h.point,d,4);anyHit=true;anyKill=anyKill||killed;head=head||part==='head';}
    else spawnSpark(h.point);}
  if(anyHit){play(head?'head':'hit');showHit(anyKill);}
  if(!w.heat&&ammo[slot].mag<=0)setTimeout(startReload,250);
}
function boltBurstOld(p){setTimeout(()=>{if(state!=='playing')return;hitSparks(p,null,5);for(const e of enemies)if(e.alive&&e.g.position.clone().setY(1.2).distanceTo(p)<1.6)damageEnemy(e,8,'body',null,{stagger:.1});},40);}
function heatBeam(a,b,w=1){const len=a.distanceTo(b);const m=new THREE.Mesh(new THREE.CylinderGeometry(.09*w,.16*w,len,6),new THREE.MeshBasicMaterial({color:0xfff0c0,transparent:true,opacity:.9}));
  m.position.copy(a).lerp(b,.5);m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),b.clone().sub(a).normalize());scene.add(m);beams.push({m,life:.18,fade:true});
  const o=m.clone();o.material=new THREE.MeshBasicMaterial({color:0xff6a20,transparent:true,opacity:.5});o.scale.set(2.2,1,2.2);scene.add(o);beams.push({m:o,life:.25,fade:true});}

