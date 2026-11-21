// ============================================================ 职业扩展：属性、武器限制、Z 职业技能、模型
// psy：能否用灵能（V G Q C）；guns/melee：可用武器（null = 全部）；eye：视线高度；r：碰撞半径
const CLS={
  tide:    {hp:100,speed:1,   dmgTaken:1,   gunMul:1,   meleeMul:1,  psy:true, guns:null,melee:null,z:'surge'},
  ward:    {hp:150,speed:1,   dmgTaken:.8,  gunMul:1.3, meleeMul:1,  psy:false,guns:['bolter','shotgun','melta','plasma','needle'],melee:['saw','power','ssword','axe'],z:'stim'},
  reforged:{hp:175,speed:1.08,dmgTaken:.75, gunMul:1.3, meleeMul:1.1,psy:false,guns:['bolter','shotgun','plasma','needle'],melee:['saw','power','axe','ssword'],z:'grenade'},
  bastion: {hp:240,speed:.8,  dmgTaken:.6,  gunMul:1.2, meleeMul:1.2,psy:false,guns:['bolter','hbolter','flamer','melta'],melee:['hammer','fist','power','ssword'],z:'warp',noSprint:true,heavy:true},
  relic:   {hp:265,speed:.78, dmgTaken:.55, gunMul:1.25,meleeMul:1.3,psy:false,guns:['plasma','hbolter','melta','flamer'],melee:['hammer','power','axe'],z:'aegis',noSprint:true,heavy:true},
  walker:  {hp:450,speed:.66, dmgTaken:.5,  gunMul:1.4, meleeMul:1.6,psy:false,guns:['hbolter','melta','plasma'],melee:['fist'],z:'stomp',noSprint:true,noJump:true,noPistol:true,heavy:true,eye:3.0,r:.85},
  redeemer:{hp:520,speed:.72, dmgTaken:.48, gunMul:1.35,meleeMul:1.6,psy:false,guns:['flamer','hbolter'],melee:['fist'],z:'pyre',noSprint:true,noJump:true,noPistol:true,heavy:true,eye:3.2,r:.9}};
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
  if(cls==='tide'){player.slots=4;player.maxOvl=130;player.ignoreChance=0.25;}
  document.body.classList.toggle('nopsy',!c.psy);}
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
    fxSend('warp',{x0:player.pos.x,z0:player.pos.z,x1:to.x,z1:to.z});embersBlue(player.pos.clone().setY(1),16);player.pos.copy(to);play('zap');play('boom');shockwave(player.pos,4,90,1.5);}
  else if(c.z==='aegis'){auraAt(player.pos.x,player.pos.z);sendNet({t:'aura',x:player.pos.x,z:player.pos.z});if(isHost())bcast({t:'aura',x:player.pos.x,z:player.pos.z});play('choir');}
  else if(c.z==='stomp'){player.dash=0.6;player.dashHit=new Set();play('charge');play('growl');}
  else if(c.z==='pyre'){play('melta');for(const e of enemies){if(!e.alive)continue;const d=e.g.position.distanceTo(player.pos);if(d>6+e.r)continue;
      damageEnemy(e,80*player.gunMul,'body',e.g.position.clone().sub(player.pos).setY(0).normalize(),{knock:1,stagger:.5,how:{melt:d<2.5}});if(!isClient())e.burn=Math.max(e.burn,4);}
    for(let i=0;i<40;i++){const a=i/40*6.28,m=new THREE.Mesh(bloodGeo,new THREE.MeshBasicMaterial({color:i%2?0xff8030:0xffd060}));m.position.copy(player.pos).setY(1);m.scale.setScalar(2);scene.add(m);
      sparks.push({m,v:new THREE.Vector3(Math.cos(a)*12,1+Math.random()*2,Math.sin(a)*12),life:.5});}}}
function stunE2(e,d){e.stun=Math.max(e.stun,d);if(isClient()&&e.remote)sendNet({t:'stun',id:e.id,dur:d});}
function shockwave(P,R,dmg,stun){fxSend('slam',{x:+P.x.toFixed(2),z:+P.z.toFixed(2)});for(const e of enemies){if(!e.alive)continue;const d=Math.hypot(e.g.position.x-P.x,e.g.position.z-P.z);if(d>R+e.r)continue;
  const dir=e.g.position.clone().sub(P).setY(0).normalize();damageEnemy(e,dmg*(1-d/(R*2)),'body',dir,{knock:2,stagger:.6,point:contactPoint(e)});if(e.alive)stunE2(e,stun);}slamFx(P.x,P.z);}
function auraAt(x,z){if(Math.hypot(player.pos.x-x,player.pos.z-z)<8){player.auraT=6;announce('圣盾领域：受到伤害减半',1.2);}
  const m=new THREE.Mesh(new THREE.CylinderGeometry(7,7,.1,24,1,true),new THREE.MeshBasicMaterial({color:0xffd060,transparent:true,opacity:.35,side:2,depthWrite:false}));m.position.set(x,1,z);m.scale.y=20;scene.add(m);beams.push({m,life:6,fade:true});}
let grenades=[];
function updateClassExtras(dt){updateCockpit(dt);player.zcd=Math.max(0,(player.zcd||0)-dt);player.stimT=Math.max(0,(player.stimT||0)-dt);player.auraT=Math.max(0,(player.auraT||0)-dt);
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
  walker:()=>venerableModel(),redeemer:()=>redeemerModel()};
// ---------- 机甲模型（正面朝 +z）：躯干正面嵌着棺椁，一侧巨拳、一侧重武器
function mk(g){const add=(geo,mat,x,y,z,rx=0,ry=0,rz=0,par=g)=>{const m=new THREE.Mesh(geo,mat);m.position.set(x,y,z);m.rotation.set(rx,ry,rz);par.add(m);return m;};
  const B=(w,h,d,mat,x,y,z,rx,ry,rz,par)=>add(new THREE.BoxGeometry(w,h,d),mat,x,y,z,rx,ry,rz,par);
  const Cy=(r1,r2,h,mat,x,y,z,rx,ry,rz,par,seg=10)=>add(new THREE.CylinderGeometry(r1,r2,h,seg),mat,x,y,z,rx,ry,rz,par);
  const S=(r,mat,x,y,z,sx=1,sy=1,sz=1,par)=>{const m=add(new THREE.SphereGeometry(r,10,8),mat,x,y,z,0,0,0,par);m.scale.set(sx,sy,sz);return m;};
  return {add,B,Cy,S};}
function legs(T,armor,trim,joint,wide){const {B,Cy}=T;const w=wide?1.15:1;
  for(const sx of [-1,1]){const x=sx*.46*w;
    Cy(.2*w,.2*w,.5,joint,x,1.35,0,0,0,Math.PI/2);                                    // 髋关节
    B(.42*w,.85,.5*w,armor,x,1.05,.04,-.22);                                          // 大腿甲
    B(.52*w,.42,.56*w,armor,x,.66,.22,.25);B(.54*w,.08,.58*w,trim,x,.86,.2,.25);       // 膝甲 + 金边
    B(.38*w,.62,.44*w,armor,x,.4,.02,.18);Cy(.12,.12,.4,joint,x,.48,-.24,.6);          // 小腿 + 液压杆
    B(.62*w,.18,.9*w,joint,x,.09,.16);for(const t of [-1,0,1])B(.14*w,.12,.26,armor,x+t*.2*w,.07,.66*w);}}   // 脚掌 + 脚趾
function sarcophagus(T,y,z,w,h,trim,core){const {B}=T;B(w,h,.12,core,0,y,z);
  B(w+.14,.1,.16,trim,0,y+h/2,z);B(w+.14,.1,.16,trim,0,y-h/2,z);B(.1,h,.16,trim,-w/2-.02,y,z);B(.1,h,.16,trim,w/2+.02,y,z);
  B(.08,h*.7,.06,trim,0,y,z+.08);B(w*.6,.08,.06,trim,0,y+h*.12,z+.08);                // 棺椁上的十字形金饰（原创纹样）
  B(w*.35,.12,.05,new THREE.MeshBasicMaterial({color:0xff4020}),0,y+h*.36,z+.08);}   // 棺椁里透出的生命维持灯
function fist(T,armor,trim,joint,glow,x,y,z,s){const {B,Cy}=T;
  B(.62*s,.78*s,.66*s,armor,x,y+.45*s,z);B(.66*s,.1*s,.7*s,trim,x,y+.86*s,z);           // 前臂护甲
  for(let i=0;i<3;i++)Cy(.2*s,.2*s,.04,glow,x,y+.1*s+i*.18*s,z,0,0,Math.PI/2);         // 力场线圈
  B(.58*s,.42*s,.6*s,joint,x,y-.22*s,z+.06);
  for(let i=0;i<4;i++){B(.12*s,.36*s,.14*s,armor,x-.21*s+i*.14*s,y-.56*s,z+.2*s,.25);B(.13*s,.06*s,.15*s,trim,x-.21*s+i*.14*s,y-.4*s,z+.2*s,.25);}
  B(.14*s,.3*s,.14*s,armor,x+(x>0?-.36:.36)*s,y-.36*s,z+.18*s,0,0,x>0?.5:-.5);}         // 拇指
// 长眠机神：圆桶形躯干、骨白重甲配金边、圆肩甲；左巨拳，右手蓝光重型能量炮
function venerableModel(){const g=new THREE.Group();const T=mk(g);const {B,Cy,S}=T;
  const armor=new THREE.MeshLambertMaterial({map:texMetal,color:0xe0d8c4,emissive:0x2a2620}),trim=new THREE.MeshLambertMaterial({color:0xc8a040,emissive:0x2a1800}),
    joint=new THREE.MeshLambertMaterial({color:0x34343c}),red=new THREE.MeshLambertMaterial({color:0x9a1a14}),glow=new THREE.MeshBasicMaterial({color:0x60c8ff});
  legs(T,armor,trim,joint,false);
  B(1.05,.42,.75,joint,0,1.5,0);B(1.1,.12,.8,trim,0,1.72,0);                           // 腰
  const tor=Cy(.78,.66,1.25,armor,0,2.35,0,0,0,0,g,14);tor.scale.z=.82;Cy(.8,.8,.1,trim,0,2.95,0,0,0,0,g,14).scale.z=.84;
  S(.72,armor,0,2.98,-.05,1,.5,.85);                                                   // 顶部弧形甲
  sarcophagus(T,2.3,.62,.72,.95,trim,red);
  B(.36,.3,.34,joint,0,3.02,.52);B(.26,.05,.02,new THREE.MeshBasicMaterial({color:0x80ff60}),0,3.02,.7);   // 低伏的头部
  for(const sx of [-1,1]){S(.52,armor,sx*1.02,2.82,0,1,.82,1);T.add(new THREE.TorusGeometry(.52,.05,4,14),trim,sx*1.02,2.7,0,Math.PI/2);
    B(.42,.55,.46,joint,sx*1.05,2.25,.02);}
  fist(T,armor,trim,joint,glow,-1.1,1.35,.18,1);
  const ax=1.1;B(.52,.62,.66,armor,ax,1.75,.12);B(.56,.08,.7,trim,ax,2.05,.12);             // 右臂：能量炮
  Cy(.16,.18,1.25,joint,ax,1.68,.82,Math.PI/2);for(let i=0;i<3;i++)Cy(.22,.22,.06,glow,ax,1.68,.45+i*.25,Math.PI/2);
  Cy(.2,.2,.12,trim,ax,1.68,1.45,Math.PI/2);B(.18,.3,.4,joint,ax,1.35,.3);
  for(const sx of [-.32,.32])Cy(.1,.12,.6,joint,sx,3.0,-.55);                              // 背后排气管
  return g;}
// 救赎机神：更宽更低、弓背前倾的箱形躯干，顶部装甲盖和双联小炮；右巨拳带喷火口，左手六管加特林
function redeemerModel(){const g=new THREE.Group();const T=mk(g);const {B,Cy,S}=T;
  const armor=new THREE.MeshLambertMaterial({map:texMetal,color:0x5a7ca4,emissive:0x0e1826}),dark=new THREE.MeshLambertMaterial({color:0x2c405e,emissive:0x080e18}),trim=new THREE.MeshLambertMaterial({color:0xc8a040,emissive:0x2a1800}),
    joint=new THREE.MeshLambertMaterial({color:0x2e2e34}),bone=new THREE.MeshLambertMaterial({color:0xd8ccb0}),glow=new THREE.MeshBasicMaterial({color:0xffa040});
  legs(T,armor,trim,joint,true);
  B(1.45,.46,.95,joint,0,1.55,0);B(1.5,.1,1,trim,0,1.8,0);
  const body=new THREE.Group();body.position.set(0,2.35,0);body.rotation.x=.14;g.add(body);const TB=mk(body);
  TB.B(2.1,1.35,1.5,armor,0,0,0);TB.B(2.2,.32,1.6,dark,0,.8,-.05,-.12);TB.B(2.24,.08,1.64,trim,0,.66,-.05,-.12);   // 躯干 + 顶盖
  TB.B(.6,.5,1.2,armor,0,.25,-.95);for(const sx of [-.5,0,.5])TB.Cy(.1,.12,.7,joint,sx,.75,-.9);                // 背包 + 烟囱
  sarcophagus(TB,-.05,.8,.95,1.0,trim,bone);
  TB.B(.42,.32,.36,joint,0,.62,.78);TB.B(.3,.05,.02,new THREE.MeshBasicMaterial({color:0xff3020}),0,.62,.97);        // 低伏头部
  for(const sx of [-.42,.42]){TB.B(.22,.22,.5,dark,sx,1.05,.35);TB.Cy(.05,.05,.5,joint,sx,1.05,.8,Math.PI/2);}       // 顶部双联小炮
  for(const sx of [-1,1]){TB.B(.75,.7,1.15,armor,sx*1.36,.55,0);TB.Cy(.38,.38,1.16,dark,sx*1.36,.9,0,Math.PI/2);TB.B(.78,.08,1.2,trim,sx*1.36,.2,0);}
  fist(T,armor,trim,joint,glow,1.55,1.25,.32,1.3);Cy(.08,.1,.6,joint,1.95,1.55,.75,Math.PI/2);B(.06,.1,.06,glow,1.95,1.55,1.06);   // 右：巨拳 + 喷火口
  const gx=-1.52;B(.72,.72,.95,armor,gx,1.75,.25);B(.76,.08,1,trim,gx,2.1,.25);B(.5,.5,.4,dark,gx,1.75,-.35);                      // 左：加特林
  for(let i=0;i<6;i++){const a=i/6*Math.PI*2;Cy(.07,.07,1.3,joint,gx+Math.cos(a)*.17,1.72+Math.sin(a)*.17,1.25,Math.PI/2);}
  for(const z of [.85,1.75])Cy(.26,.26,.08,trim,gx,1.72,z,Math.PI/2);
  return g;}
// ---------- 战舰里的职业卡片
$('clsCards').innerHTML=Object.keys(CLS).map(k=>`<div class="card" data-cls="${k}"><b>${CLS_INFO[k].name}</b><div>${CLS_INFO[k].tag}</div></div>`).join('');
document.querySelectorAll('#clsCards .card').forEach(el=>el.onclick=()=>{initAudio();selectClass(el.dataset.cls);});
