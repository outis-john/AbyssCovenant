// ============================================================ 职业扩展：属性、武器限制、Z 职业技能、模型
// psy：能否用灵能（V G Q C）；guns/melee：可用武器（null = 全部）；eye：视线高度；r：碰撞半径
const CLS={
  tide:    {hp:100,speed:1,   dmgTaken:1,   gunMul:1,   meleeMul:1,  psy:true, guns:null,melee:null,z:'surge'},
  ward:    {hp:150,speed:1,   dmgTaken:.8,  gunMul:1.3, meleeMul:1,  psy:false,guns:['bolter','shotgun','melta','plasma','needle'],melee:['saw','power','ssword','axe'],z:'stim'},
  reforged:{hp:175,speed:1.08,dmgTaken:.75, gunMul:1.3, meleeMul:1.1,psy:false,guns:['bolter','shotgun','plasma','needle'],melee:['saw','power','axe','ssword'],z:'grenade'},
  bastion: {hp:240,speed:.8,  dmgTaken:.6,  gunMul:1.2, meleeMul:1.2,psy:false,guns:['bolter','hbolter','flamer','melta'],melee:['hammer','fist','power','ssword'],z:'warp',noSprint:true,heavy:true},
  relic:   {hp:265,speed:.78, dmgTaken:.55, gunMul:1.25,meleeMul:1.3,psy:false,guns:['plasma','hbolter','melta','flamer'],melee:['hammer','power','axe'],z:'aegis',noSprint:true,heavy:true},
  walker:  {hp:450,speed:.66, dmgTaken:.5,  gunMul:1.4, meleeMul:1.6,psy:false,guns:['hbolter','melta','plasma'],melee:['fist'],z:'stomp',noSprint:true,noJump:true,heavy:true,eye:3.0,r:.85},
  redeemer:{hp:520,speed:.72, dmgTaken:.48, gunMul:1.35,meleeMul:1.6,psy:false,guns:['flamer','hbolter'],melee:['fist'],z:'pyre',noSprint:true,noJump:true,heavy:true,eye:3.2,r:.9}};
const ZAB={surge:{name:'深渊回响',cd:25,desc:'清空过载、回复 15 生命'},stim:{name:'战斗兴奋剂',cd:18,desc:'6 秒移速 +30%、伤害 +25%，回复 20 生命'},
  grenade:{name:'震爆手雷',cd:10,desc:'投出手雷，爆炸伤害并震晕'},warp:{name:'跃迁突袭',cd:14,desc:'瞬移到前方 10 米，落地冲击波震晕敌人'},
  aegis:{name:'圣盾领域',cd:20,desc:'6 秒内你和附近队友受到伤害减半'},stomp:{name:'践踏冲锋',cd:10,desc:'向前冲锋，撞飞并碾碎路上的敌人'},pyre:{name:'烈焰风暴',cd:14,desc:'向四周喷出火焰，点燃 6 米内所有敌人'}};
Object.assign(CLS_INFO,{
  reforged:{name:'新铸卫士',tag:'强化战士',desc:'第二代改造战士，骨骼与器官重新铸造。比前辈更高、更快、更耐打。',perks:'生命 175 · 枪械伤害 +30% · 移速 +8% · Z：震爆手雷'},
  bastion:{name:'壁垒重甲',tag:'重甲突击',desc:'穿着能在虚空中行走的厚重战甲，几乎打不穿。不能冲刺，但能跃迁突入敌阵。',perks:'生命 240 · 减伤 40% · 近战 +20% · 不能冲刺 · Z：跃迁突袭'},
  relic:{name:'圣遗壁垒',tag:'圣物重甲',desc:'从战舰圣库里请出的古老重甲，只交给最资深的战士。慢，但每一击都是审判。',perks:'生命 265 · 减伤 45% · 近战 +30% · 不能冲刺 · Z：圣盾领域'},
  walker:{name:'长眠机神',tag:'步行机甲',desc:'一位阵亡英雄长眠在机甲的棺椁里，被唤醒再战。巨拳能捏碎一切。',perks:'生命 450 · 减伤 50% · 视线高 · 不能冲刺跳跃 · Z：践踏冲锋'},
  redeemer:{name:'救赎机神',tag:'重型机甲',desc:'更新、更大的步行机甲，用火焰净化整条走廊。',perks:'生命 520 · 减伤 52% · 只能用火焰 / 重爆弹 · Z：烈焰风暴'}});
CLS_INFO.tide.tag='灵能者';CLS_INFO.ward.tag='动力甲战士';CLS_INFO.tide.perks+=' · 唯一能用灵能（V G Q C）· Z：深渊回响';CLS_INFO.ward.perks+=' · Z：战斗兴奋剂';
for(const k in CLS){const c=CLS[k];CLS_INFO[k].stats=[['生命',c.hp,520],['枪械伤害',c.gunMul,1.4],['近战伤害',c.meleeMul,1.6],['减伤',1-c.dmgTaken,.55],['速度',c.speed,1.1]];}
// ---------- 开局套用职业
function applyClassStats(){const c=CLS[cls]||CLS.ward;
  Object.assign(player,{maxHp:c.hp,hp:c.hp,gunMul:c.gunMul,dmgTaken:c.dmgTaken,meleeMul:c.meleeMul,speedMul:c.speed,eye:c.eye||1.6,r:c.r||.45,zcd:0,stimT:0,auraT:0,dash:0});
  if(cls==='tide'){player.slots=4;player.maxOvl=130;player.ignoreChance=0.25;}}
function fixLoadoutForClass(){const c=CLS[cls];if(!c)return;
  if(c.guns&&!c.guns.includes(loadout.primary))loadout.primary=c.guns[0];if(c.melee&&!c.melee.includes(loadout.melee))loadout.melee=c.melee[0];}
// ---------- Z 技能
function classAbility(){if(ex.active)return;const c=CLS[cls],Z=ZAB[c.z];if(player.zcd>0){announce(Z.name+' 冷却中 '+Math.ceil(player.zcd)+' 秒',0.8);return;}
  player.zcd=Z.cd;announce(Z.name+'！',1);const fwd=fwdFlat();
  if(c.z==='surge'){player.ovl=0;player.hp=Math.min(player.maxHp,player.hp+15);play('choir');embersBlue(player.pos.clone().setY(1.2),16);}
  else if(c.z==='stim'){player.stimT=6;player.hp=Math.min(player.maxHp,player.hp+20);play('frenzy');}
  else if(c.z==='grenade'){const {o,d}=aimRay(0);grenades.push({p:o.clone().addScaledVector(d,.6),v:d.clone().multiplyScalar(16).add(new THREE.Vector3(0,4,0)),t:1.1,
    m:(()=>{const m=new THREE.Mesh(new THREE.BoxGeometry(.16,.16,.16),gunDark);scene.add(m);return m;})()});play('whoosh');}
  else if(c.z==='warp'){const to=player.pos.clone();for(let i=0;i<20;i++){const n=to.clone().addScaledVector(fwd,.5);const t=n.clone();collide(t,player.r);if(t.distanceTo(n)>0.01)break;to.copy(n);}
    embersBlue(player.pos.clone().setY(1),16);player.pos.copy(to);play('zap');play('boom');shockwave(player.pos,4,90,1.5);}
  else if(c.z==='aegis'){auraAt(player.pos.x,player.pos.z);sendNet({t:'aura',x:player.pos.x,z:player.pos.z});if(isHost())bcast({t:'aura',x:player.pos.x,z:player.pos.z});play('choir');}
  else if(c.z==='stomp'){player.dash=0.6;player.dashHit=new Set();play('charge');play('growl');}
  else if(c.z==='pyre'){play('melta');for(const e of enemies){if(!e.alive)continue;const d=e.g.position.distanceTo(player.pos);if(d>6+e.r)continue;
      damageEnemy(e,80*player.gunMul,'body',e.g.position.clone().sub(player.pos).setY(0).normalize(),{knock:1,stagger:.5,how:{melt:d<2.5}});if(!isClient())e.burn=Math.max(e.burn,4);}
    for(let i=0;i<40;i++){const a=i/40*6.28,m=new THREE.Mesh(bloodGeo,new THREE.MeshBasicMaterial({color:i%2?0xff8030:0xffd060}));m.position.copy(player.pos).setY(1);m.scale.setScalar(2);scene.add(m);
      sparks.push({m,v:new THREE.Vector3(Math.cos(a)*12,1+Math.random()*2,Math.sin(a)*12),life:.5});}}}
function stunE2(e,d){e.stun=Math.max(e.stun,d);if(isClient()&&e.remote)sendNet({t:'stun',id:e.id,dur:d});}
function shockwave(P,R,dmg,stun){for(const e of enemies){if(!e.alive)continue;const d=Math.hypot(e.g.position.x-P.x,e.g.position.z-P.z);if(d>R+e.r)continue;
  const dir=e.g.position.clone().sub(P).setY(0).normalize();damageEnemy(e,dmg*(1-d/(R*2)),'body',dir,{knock:2,stagger:.6,point:contactPoint(e)});if(e.alive)stunE2(e,stun);}slamFx(P.x,P.z);}
function auraAt(x,z){if(Math.hypot(player.pos.x-x,player.pos.z-z)<8){player.auraT=6;announce('圣盾领域：受到伤害减半',1.2);}
  const m=new THREE.Mesh(new THREE.CylinderGeometry(7,7,.1,24,1,true),new THREE.MeshBasicMaterial({color:0xffd060,transparent:true,opacity:.35,side:2,depthWrite:false}));m.position.set(x,1,z);m.scale.y=20;scene.add(m);beams.push({m,life:6,fade:true});}
let grenades=[];
function updateClassExtras(dt){player.zcd=Math.max(0,(player.zcd||0)-dt);player.stimT=Math.max(0,(player.stimT||0)-dt);player.auraT=Math.max(0,(player.auraT||0)-dt);
  for(const g of grenades){g.t-=dt;g.v.y-=18*dt;g.p.addScaledVector(g.v,dt);if(g.p.y<.1){g.p.y=.1;g.v.y*=-.3;g.v.x*=.6;g.v.z*=.6;}g.m.position.copy(g.p);
    if(g.t>0&&enemies.some(e=>e.alive&&e.g.position.distanceTo(g.p.clone().setY(0))<e.r+.8&&g.p.y<2.5*e.g.scale.y))g.t=0;   // 碰到敌人就炸
    if(g.t<=0){g.dead=true;scene.remove(g.m);play('boom');puff(g.p,8,0x444444,1.2);hitSparks(g.p,null,10);shockwave(g.p,3.5,120*player.gunMul,1.2);}}
  grenades=grenades.filter(g=>!g.dead);
  if(player.dash>0){player.dash-=dt;const f=fwdFlat();player.pos.addScaledVector(f,14*dt);collide(player.pos,player.r);player.shake=Math.max(player.shake,.2);
    for(const e of enemies){if(!e.alive||player.dashHit.has(e))continue;if(e.g.position.distanceTo(player.pos)<player.r+e.r+.6){player.dashHit.add(e);
      damageEnemy(e,140*player.meleeMul,'body',f,{knock:4,stagger:1,point:contactPoint(e),how:{burst:{p:contactPoint(e),dir:f}}});if(e.alive)stunE2(e,1);play('clang');hitstop=.06;}}}
  const z=ZAB[(CLS[cls]||CLS.ward).z];$('zab').textContent=`Z ${z.name}${player.zcd>0?' · '+Math.ceil(player.zcd)+'s':' · 就绪'}`;$('zab').style.opacity=player.zcd>0?.55:1;}
// ---------- 模型：在铸甲卫士模型上换颜色 / 加厚；机甲是独立的箱形棺椁
function recolor(g,map){g.traverse(o=>{if(o.material&&o.material.color){const h=o.material.color.getHex();if(map[h]!==undefined){o.material=o.material.clone();o.material.color.setHex(map[h]);}}});return g;}
const EXTRA_MODELS={
  reforged:()=>{const g=recolor(buildCharacter('ward'),{0x41557e:0x6a2a2a});g.scale.setScalar(1.07);return g;},
  bastion:()=>{const g=recolor(buildCharacter('ward'),{0x41557e:0xb8b0a0});g.scale.set(1.22,1.08,1.25);return g;},
  relic:()=>{const g=recolor(buildCharacter('ward'),{0x41557e:0x8a7a3a,0x7a1612:0x2a1a50});g.scale.set(1.25,1.1,1.28);
    const b=new THREE.Mesh(new THREE.PlaneGeometry(.5,1.1),new THREE.MeshLambertMaterial({color:0x7a1612,side:2}));b.position.set(0,2.7,-.6);g.add(b);return g;},
  walker:()=>walkerModel(0x8a9070,false),redeemer:()=>walkerModel(0x9a6a4a,true)};
function walkerModel(col,big){const g=new THREE.Group();const M=new THREE.MeshLambertMaterial({map:texMetal,color:col}),D=new THREE.MeshLambertMaterial({color:0x3a3a40}),Gd=new THREE.MeshLambertMaterial({color:0xb8952e,emissive:0x2a1a00});
  const add=(w,h,d,x,y,z,m)=>{const b=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);b.position.set(x,y,z);g.add(b);return b;};
  for(const sx of [-1,1]){add(.4,1.1,.5,sx*.45,.55,0,D);add(.5,.25,.7,sx*.45,.12,.1,M);}
  add(1.4,.4,1,0,1.25,0,D);add(1.7,1.5,1.3,0,2.15,0,M);add(.9,.9,.1,0,2.2,.66,Gd);add(.7,.3,.4,0,3.0,.2,D);
  const win=add(.5,.12,.05,0,2.55,.68,new THREE.MeshBasicMaterial({color:0xff5020}));
  add(.55,.9,.7,-1.15,2.1,.1,M);add(.7,.6,.7,-1.15,1.45,.3,D);   // 左：巨拳
  add(.5,.6,.6,1.12,2.2,0,M);add(.22,.22,1.1,1.05,2.0,.6,D);add(.22,.22,1.1,1.28,2.0,.6,D);   // 右：枪
  if(big){add(.5,.4,.6,0,3.15,-.4,D);for(const sx of [-1,1])add(.18,.6,.18,sx*.5,3.2,-.55,D);g.scale.setScalar(1.08);}
  return g;}
// ---------- 战舰里的职业卡片
$('clsCards').innerHTML=Object.keys(CLS).map(k=>`<div class="card" data-cls="${k}"><b>${CLS_INFO[k].name}</b><div>${CLS_INFO[k].tag}</div></div>`).join('');
document.querySelectorAll('#clsCards .card').forEach(el=>el.onclick=()=>{initAudio();selectClass(el.dataset.cls);});
