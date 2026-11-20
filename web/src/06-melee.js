// ============================================================ 近战（三种近战武器共用挥砍框架）
const MS={phase:'none',t:0,dir:1,combo:0,s:0,target:null,tick:0,hitDone:false};
const SWING=0.6;let swing=0,swordOut=0;
const POSE={rest:[0.02,0.3,0.12],restPos:[.3,-.42,-.3],
  a:{start:[0.8,1.5,1.05],end:[-0.85,-1.6,-0.85],ps:[.62,-.12,-.4],pe:[-.32,-.62,-.3]},
  b:{start:[-0.75,-1.45,-0.95],end:[0.85,1.6,0.9],ps:[-.28,-.62,-.3],pe:[.62,-.1,-.4]},
  h:{start:[0.05,1.75,0.15],end:[0.05,-1.8,-0.15],ps:[.65,-.32,-.36],pe:[-.45,-.36,-.36]}};   // 防反后的横斩
const posAt=k=>{const P=poseSet();return P.ps.map((v,i)=>lerp(v,P.pe[i],k));};
function poseAt(k){const P=poseSet();return P.start.map((v,i)=>lerp(v,P.end[i],k));}
function applyPose(k){sword.rotation.set(...poseAt(k));sword.position.set(...posAt(k));}
function blendPose(r0,p0,r1,p1,e,over){sword.rotation.set(...r0.map((v,i)=>lerp(v,r1[i]*over,e)));sword.position.set(...p0.map((v,i)=>lerp(v,p1[i],e)));}
// 连招：每段有自己的刀路姿势，切割平面按刀路计算
Object.assign(POSE,{
  r:{start:[0.8,-1.5,-1.05],end:[-0.85,1.6,0.85],ps:[-.3,-.12,-.4],pe:[.62,-.62,-.3]},      // 右劈：左上 -> 右下
  t:{start:[0.08,0.25,0.0],end:[-0.04,0.02,0.0],ps:[.32,-.38,-.12],pe:[.06,-.26,-.82]},     // 突刺
  u:{start:[-0.85,0.35,0.25],end:[1.05,-0.25,-0.2],ps:[.2,-.7,-.32],pe:[.22,.02,-.46]}});   // 上挑
const COMBOS={
  power:[{p:'a',dm:1,name:'左劈'},{p:'r',dm:1,name:'右劈'},{p:'t',dm:1.3,thrust:true,name:'突刺'},{p:'u',dm:1.7,fin:true,name:'上挑'}],
  saw:[{p:'a',dm:1,name:'斜劈'},{p:'h',dm:1,name:'横斩'},{p:'t',dm:1,thrust:true,bite:true,biteDur:.62,name:'突刺锯入'},{p:'u',dm:2.2,fin:true,name:'切开'}],
  ssword:[{p:'a',dm:1},{p:'b',dm:1}]};
const frenzyMul=()=>player.frenzy>0?0.62:1;
const LITANIES=['以圣约之名，斩断深渊的低语。','斥退亚空间之地狱，此身即是壁垒。','我的剑即是誓言，誓言永不熄灭。','血肉终将腐朽，信仰不会。',
  '不洁之物，回到你们来的黑暗里去。','退去吧，地狱的造物——此地仍有人守望。','每一次挥剑，都是一次祷告。','沉睡者在注视着我，我不会令祂失望。',
  '恐惧是叛徒，怜悯是破绽。','以钢铁与圣火，净化此地。','我不求胜利，只求无愧。','黑暗终有尽头，而我便是那尽头。'];
let litIdx=0,litT=0;
const fieldMul=()=>(WEAPONS[2].id==='power'&&player.field>0)?CFG.field.mul:1;
function activateField(){if(player.fieldCd>0){announce('分解力场冷却中 '+Math.ceil(player.fieldCd)+' 秒',0.8);return;}
  player.field=CFG.field.dur;player.fieldCd=CFG.field.cd;play('fieldOn');play('choir');announce('分解力场 · 激活',1.2);showLitany();}
function showLitany(){const el=$('litany');el.textContent='「'+LITANIES[litIdx++%LITANIES.length]+'」';el.style.transition='none';el.style.opacity=1;litT=1.8;}
function melee(){
  if(ex.active||player.revving)return;if(player.meleeCd>0||MS.phase==='bite'){MS.queued=true;return;}MS.queued=false;const M=WEAPONS[2],list=COMBOS[M.id];
  if(MS.phase==='none'&&gameTime-(MS.lastEnd??-9)>1.0)MS.combo=0;
  MS.step=list[MS.combo%list.length];MS.combo++;MS.dir=stepDir();MS.counter=false;
  MS.phase='windup';MS.t=0;MS.s=0;MS.target=null;MS.hitDone=false;
  const fm=frenzyMul();player.meleeCd=(M.windup+M.slash*(MS.step.thrust?1.2:1))*fm+0.14*fm;swordOut=1.4;swing=1;
}
function poseSet(){return MS.step?POSE[MS.step.p]:POSE.a;}
function stepDir(){const P=poseSet();return P.pe[0]<P.ps[0]?1:-1;}
const sdir=()=>typeof MS.dir==='number'?MS.dir:-1;
function meleeCandidates(range=3.0,cos=0.45){
  const fwd=fwdFlat();const out=[];
  for(const e of enemies){if(!e.alive||e.lifted)continue;const to=e.g.position.clone().sub(player.pos).setY(0);const d=to.length();
    if(d<range+e.r&&to.normalize().dot(fwd)>cos)out.push([d,e]);}
  return out.sort((a,b)=>a[0]-b[0]).map(x=>x[1]);
}
function contactPoint(e){return e.g.position.clone().setY(1.25*e.g.scale.y).lerp(player.pos.clone().setY(1.3),0.25);}
function bladeDirWorld(){const q=new THREE.Quaternion();sword.getWorldQuaternion(q);return new THREE.Vector3(0,0,-1).applyQuaternion(q);}
function swingPlane(P){
  const right=new THREE.Vector3(Math.cos(player.yaw),0,-Math.sin(player.yaw));
  if(MS.step&&MS.step.thrust)return {p:P,n:right};              // 突刺：沿前进方向竖着剖开
  const a=posAt(0),b=posAt(1);
  const fwd=new THREE.Vector3(-Math.sin(player.yaw)*Math.cos(player.pitch),Math.sin(player.pitch),-Math.cos(player.yaw)*Math.cos(player.pitch));
  const up=new THREE.Vector3().crossVectors(right,fwd).normalize();const sweep=right.clone().multiplyScalar(b[0]-a[0]).addScaledVector(up,b[1]-a[1]).normalize();
  return {p:P,n:new THREE.Vector3().crossVectors(sweep,fwd).normalize()};}
function sprayAlongChain(p,n){
  const right=new THREE.Vector3(Math.cos(player.yaw),0,-Math.sin(player.yaw)).multiplyScalar(sdir());
  const blade=bladeDirWorld(),toCam=player.pos.clone().setY(1.6).sub(p).normalize();
  for(let i=0;i<n;i++){const m=new THREE.Mesh(bloodGeo,matBlood);m.position.copy(p);scene.add(m);
    const v=blade.clone().multiplyScalar(5+Math.random()*4).addScaledVector(right,2+Math.random()*3).add(new THREE.Vector3(0,2+Math.random()*3,0)).addScaledVector(toCam,Math.random()*2);
    v.x+=(Math.random()-.5)*2;v.z+=(Math.random()-.5)*2;bloods.push({m,v,rest:false});}
  capBloods();
}
function meleeSound(M,fin){play(M.id==='power'?'powerHit':M.id==='saw'?'grind':'clang');play('hit');if(fin)play('rip');}
function updateMelee(dt){
  if(MS.phase==='none')return;MS.t+=dt;const M=WEAPONS[2],st=MS.step||{dm:1},fm=frenzyMul();
  const fwd=fwdFlat(),W=M.windup*fm,SL=M.slash*fm*(st.thrust?1.2:1);
  if(MS.phase==='windup'){const k=Math.min(1,MS.t/W),e=1-(1-k)*(1-k);
    blendPose(POSE.rest,POSE.restPos,poseAt(0),posAt(0),e,1.1);if(MS.t>=W){MS.phase='slash';MS.t=0;play(M.id==='power'?'zap':'whoosh');if(M.id==='power'&&player.field>0){showLitany();play('choir');}}}
  else if(MS.phase==='slash'){MS.s=Math.min(1,(MS.t/SL)**(st.thrust?1:1.6));applyPose(MS.s);
    if(!MS.hitDone&&MS.s>=0.5){MS.hitDone=true;const c=meleeCandidates(st.thrust?3.8:3.0,st.thrust?0.8:0.45);
      if(c.length&&st.bite){MS.target=c[0];MS.phase='bite';MS.t=0;MS.tick=0;MS.s=0.5;MS.biteDur=st.biteDur||0.34;
        hitstop=Math.max(hitstop,0.07);player.shake=Math.max(player.shake,0.3);player.punch=0.06;splat();play('grind');
        for(const e of c.slice(1))damageEnemy(e,30,'body',fwd,{stagger:.4,knock:1.2,point:contactPoint(e)});}
      else if(c.length){const targets=(M.cleave||st.cleave||st.thrust&&M.id==='power')?c:[c[0]];let k=false;const dmgv=M.dmg*st.dm*fieldMul();
        for(const e of targets){const p=contactPoint(e);const pl=swingPlane(p);if(!st.thrust)severArmsByPlane(e,pl.p,pl.n,dmgv);
          k=damageEnemy(e,dmgv,'body',fwd,{stagger:st.fin?.8:.45,knock:st.fin?2.4:0.45,point:p,how:{cut:{p:pl.p,n:pl.n,imp:st.fin?6:M.cleave?5:3.5}}})||k;
          sprayAlongChain(p,st.fin?24:12);hitSparks(p,fwd.clone().negate(),M.id==='power'?8:4);if(fieldMul()>1)embersBlue(p,10);}
        meleeSound(M,st.fin);hitstop=Math.max(hitstop,st.fin?0.12:0.07);player.shake=Math.max(player.shake,st.fin?0.4:0.25);player.punch=st.fin?0.09:0.05;splat();showHit(k);}}
    if(MS.s>=1){MS.phase='recover';MS.t=0;}}
  else if(MS.phase==='bite'){const e=MS.target;
    const j=()=>(Math.random()-.5)*0.07;const P=poseAt(0.5+Math.min(0.12,MS.t*0.3));sword.rotation.set(P[0]+j(),P[1]+j(),P[2]+j());
    {const q=posAt(st.thrust?0.5+Math.min(0.4,MS.t*0.8):0.5);sword.position.set(q[0],q[1],q[2]+Math.sin(MS.t*60)*0.025);}player.shake=Math.max(player.shake,0.14);
    if(e&&e.alive){e.stagger=Math.max(e.stagger,0.2);e.lean=Math.max(e.lean,0.6);e.g.rotation.z=(Math.random()-.5)*0.15;}
    MS.tick-=dt;if(MS.tick<=0){MS.tick=0.06;const p=e?contactPoint(e):player.pos.clone().addScaledVector(fwd,1.5).setY(1.3);
      sprayAlongChain(p,8);hitSparks(p,fwd.clone().negate(),2);
      if(e&&e.alive){const pl=swingPlane(p);const k=damageEnemy(e,11,'body',null,{stagger:.2,point:p,how:{cut:{p:pl.p,n:pl.n,imp:3}}});if(k){spawnBlood(p,null,30);showHit(true);MS.phase='rip';MS.t=0;}else play('hit');}}
    if(MS.phase==='bite'&&(MS.t>=MS.biteDur||!e||!e.alive)){MS.phase='rip';MS.t=0;}
    if(MS.phase==='rip'){play('rip');splat();player.punch=0.08;hitstop=Math.max(hitstop,0.06);
      if(e&&e.alive){const pl=swingPlane(contactPoint(e));const k=damageEnemy(e,18,'body',fwd,{stagger:.6,knock:(MS.step&&MS.step.thrust)?0.4:2.2,point:contactPoint(e),how:{cut:{p:pl.p,n:pl.n,imp:4}}});showHit(k);}
      if(e)sprayAlongChain(contactPoint(e),24);}}
  else if(MS.phase==='rip'){MS.s=Math.min(1,0.5+MS.t/0.08*0.5);applyPose(MS.s);if(MS.t>=0.08){MS.phase='recover';MS.t=0;}}
  else if(MS.phase==='recover'){const k=Math.min(1,MS.t/(0.22*fm)),e=k*k*(3-2*k);
    blendPose(poseAt(1),posAt(1),POSE.rest,POSE.restPos,e,1);if(k>=1){MS.phase='none';swing=0;MS.counter=false;MS.lastEnd=gameTime;}}
}
function splat(){const el=$('splat');el.style.transition='none';el.style.opacity=0.75;requestAnimationFrame(()=>{el.style.transition='opacity .7s';el.style.opacity=0;});}
function hitSparks(p,dir,n){if(!p)return;for(let i=0;i<n;i++){const m=new THREE.Mesh(bloodGeo,new THREE.MeshBasicMaterial({color:Math.random()<.5?0xffe080:0xffffff}));m.position.copy(p);m.scale.setScalar(.6);scene.add(m);
  const v=new THREE.Vector3((Math.random()-.5)*6,Math.random()*4,(Math.random()-.5)*6);if(dir)v.addScaledVector(dir,-5);sparks.push({m,v,life:.18+Math.random()*.12});}}
let sparks=[];
function updateSparks(dt){while(sparks.length>CFG.perf.sparks){const o=sparks.shift();scene.remove(o.m);}for(const k of sparks){k.life-=dt;k.v.y-=15*dt;k.m.position.addScaledVector(k.v,dt);if(k.life<=0)scene.remove(k.m);}sparks=sparks.filter(k=>k.life>0);}

