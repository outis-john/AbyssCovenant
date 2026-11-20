// ============================================================ 新枪械：等离子枪 / 重型爆弹机枪 / 火焰喷射器 / 穿甲狙击枪
function gunModel(parts,flashZ,flashSize=.22,flashColor=0xffd080){const g=new THREE.Group();view.add(g);g.visible=false;
  for(const [w,h,d,x,y,z,m] of parts){const b=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);b.position.set(x,y,z);g.add(b);}
  const f=new THREE.Mesh(new THREE.BoxGeometry(flashSize,flashSize,.05),new THREE.MeshBasicMaterial({color:flashColor}));f.position.set(0,.02,flashZ);f.visible=false;g.add(f);
  g.position.set(.32,-.28,-.55);RANGED_MODELS.push(g);return [g,f];}
const plasmaGlow=new THREE.MeshBasicMaterial({color:0x60c0ff});
const [plasmaM,plasmaF]=gunModel([[.18,.18,.5,0,0,.05,gunMat],[.1,.1,.35,0,.02,-.38,gunDark],[.22,.08,.3,0,.12,-.05,plasmaGlow],[.12,.2,.14,0,-.15,.12,gunDark],[.06,.06,.4,.12,0,-.2,plasmaGlow]],-.6,.26,0xa0e0ff);
const [hbM,hbF]=gunModel([[.26,.24,.6,0,0,.05,gunMat],[.06,.06,.7,-.05,.03,-.55,gunDark],[.06,.06,.7,.05,.03,-.55,gunDark],[.06,.06,.7,0,-.05,-.55,gunDark],[.2,.26,.2,0,-.2,.1,gunDark],[.3,.06,.4,0,.15,0,gunDark]],-.92,.3);
const [flM,flF]=gunModel([[.16,.16,.5,0,0,.05,gunMat],[.08,.08,.45,0,.02,-.4,gunDark],[.14,.3,.14,0,-.18,-.05,new THREE.MeshLambertMaterial({color:0x8a3a1a})],[.12,.2,.12,0,-.14,.2,gunDark]],-.66,.2,0xff8030);
const [snM,snF]=gunModel([[.12,.14,.7,0,0,.1,gunMat],[.05,.05,.8,0,.02,-.65,gunDark],[.07,.08,.3,0,.13,-.05,gunDark],[.1,.2,.12,0,-.14,.2,new THREE.MeshLambertMaterial({color:0x4a3a2a})],[.04,.04,.06,0,.13,-.22,plasmaGlow]],-1.08,.18);
Object.assign(RANGED,{
  plasma:{id:'plasma',name:'等离子枪',heat:true,magSize:Infinity,reserveMax:Infinity,res0:Infinity,rate:3,dmg:46,pellets:1,spread:.006,auto:false,climb:.03,kick:1.4,reload:0,splash:2.2,snd:'plasma',
    desc:'发射飞行的等离子弹，命中后范围爆炸。右键蓄力过充：伤害 ×3、爆炸更大，但过热时会烫伤自己。',model:plasmaM,flash:plasmaF},
  hbolter:{id:'hbolter',name:'重型爆弹机枪',spin:true,magSize:120,reserveMax:480,res0:240,rate:13,dmg:20,pellets:1,spread:.03,auto:true,climb:.006,kick:.8,reload:2.6,knock:.25,snd:'bolter',
    desc:'按住开火，枪管越转越快，射速从 3 发 / 秒升到 13 发 / 秒。开火时移动变慢。',model:hbM,flash:hbF},
  flamer:{id:'flamer',name:'火焰喷射器',flame:true,magSize:100,reserveMax:300,res0:200,rate:12,dmg:9,pellets:1,spread:0,auto:true,climb:0,kick:.2,reload:2,range:7,snd:'flame',
    desc:'近距离锥形喷火，同时烧到一片敌人，被点燃的敌人会持续掉血。射程只有 7 米。',model:flM,flash:flF},
  needle:{id:'needle',name:'穿甲狙击枪',scope:true,magSize:5,reserveMax:30,res0:20,rate:1.1,dmg:150,pellets:1,spread:0,auto:false,climb:.09,kick:2.6,reload:1.8,knock:.6,pierce3:true,snd:'needle',
    desc:'右键开镜。一枪穿透最多 3 个敌人，爆头直接打爆头颅。',model:snM,flash:snF}});
for(const k of ['plasma','hbolter','flamer','needle'])if(CFG.guns[k])Object.assign(RANGED[k],CFG.guns[k]);
Object.assign(sfx,{
  plasma(){tone('sine',1200,180,0.3,0.25);noiseHit(3000,0.25,0.2,'bandpass');},
  flame(){noiseHit(900,0.12,0.12,'bandpass');},
  needle(){tone('square',1800,300,0.3,0.12);noiseHit(4000,0.5,0.35,'highpass');tone('sine',90,40,0.5,0.4);}});
// ---------- 开火（在 fire() 里调用；返回 true 表示已处理）
let plasmaBalls=[];
function fireSpecial(w,mScale){
  if(w.id==='plasma'){const {o,d}=aimRay(w.spread);const big=mScale>0.9;const m=new THREE.Mesh(new THREE.BoxGeometry(big?.3:.18,big?.3:.18,big?.3:.18),new THREE.MeshBasicMaterial({color:big?0xe0f4ff:0x60c0ff}));
    m.position.copy(o).add(new THREE.Vector3(0,-.12,0)).addScaledVector(d,.6);scene.add(m);plasmaBalls.push({m,d:d.clone(),life:2,dmg:w.dmg*(big?3:1)*player.gunMul,r:w.splash*(big?1.6:1)});
    heat.v+=big?55:16;heat.charge=0;if(heat.v>=100){heat.v=100;heat.over=2.5;play('vent');if(big){hurtPlayer(12,true);announce('等离子过热！你被烫伤了',1.5);}else announce('等离子枪过热！',1.2);}return true;}
  if(w.flame){const fwd=new THREE.Vector3(0,0,-1).applyQuaternion(camera.quaternion);const o=player.pos.clone().setY(1.4);let any=false,kill=false;
    for(const e of enemies){if(!e.alive)continue;const to=e.g.position.clone().setY(1.2).sub(o);const L=to.length();if(L>w.range+e.r)continue;if(to.normalize().dot(fwd)<Math.cos(0.42))continue;
      kill=damageEnemy(e,w.dmg*player.gunMul,'body',fwd,{stagger:.05,knock:.05,how:{melt:L<3}})||kill;if(!isClient())e.burn=Math.max(e.burn,3);any=true;}
    for(let i=0;i<6;i++){const m=new THREE.Mesh(bloodGeo,new THREE.MeshBasicMaterial({color:Math.random()<.5?0xff8030:0xffd060}));m.position.copy(o).addScaledVector(fwd,.8);m.scale.setScalar(1.5);scene.add(m);
      sparks.push({m,v:fwd.clone().multiplyScalar(9+Math.random()*4).add(new THREE.Vector3((Math.random()-.5)*3,1+Math.random()*2,(Math.random()-.5)*3)),life:.5+Math.random()*.25});}
    if(any)showHit(kill);return true;}
  if(w.pierce3){const {o,d}=aimRay(0);ray.set(o,d);ray.far=120;const hits=ray.intersectObjects(hitTargets(),false);const done=new Set();let any=false,kill=false,head=false;
    for(const h of hits){const e=h.object.userData.enemy;if(!e){spawnSpark(h.point);break;}if(done.has(e))continue;done.add(e);const part=h.object.userData.part==='eye'?'head':h.object.userData.part;
      kill=damageEnemy(e,w.dmg*player.gunMul*(1-done.size*0.2+0.2),part,d,{point:h.point,knock:w.knock,stagger:.5,limbMul:2,how:part==='head'?{headBurst:true}:{hole:{p:h.point,dir:d,mode:'blast'}}})||kill;head=head||part==='head';hitSparks(h.point,d,5);any=true;if(done.size>=3)break;}
    heatBeam(o.clone().add(new THREE.Vector3(0,-.15,0)),o.clone().addScaledVector(d,30),.25);if(any){play(head?'head':'hit');showHit(kill);}return true;}
  return false;}
function updatePlasma(dt){for(const b of plasmaBalls){b.life-=dt;const len=40*dt;const h=castRay(b.m.position,b.d,len+.15);
    if(h||b.life<=0){const P=h?h.point:b.m.position.clone();b.dead=true;scene.remove(b.m);embersBlue(P,14);play('boom');let kill=false;
      for(const e of enemies){if(!e.alive)continue;const c=e.g.position.clone().setY(1.2*e.g.scale.y);const dd=c.distanceTo(P);if(dd>b.r+e.r)continue;
        const dir=c.clone().sub(P).normalize();kill=damageEnemy(e,b.dmg*(1-dd/(b.r*2+e.r)),dd<1?'body':'body',dir,{knock:.8,stagger:.4,point:c,how:{burst:{p:P,dir}}})||kill;}
      showHit(kill);continue;}
    b.m.position.addScaledVector(b.d,len);}plasmaBalls=plasmaBalls.filter(b=>!b.dead);}
// 重型爆弹机枪的转速；狙击镜
function updateGunExtras(dt){const W=WEAPONS[cur];
  player.spin=Math.max(0,Math.min(1,(player.spin||0)+((mouseDown&&W&&W.spin&&state==='playing')?dt*1.1:-dt*1.5)));
  const zoom=player.aiming&&W&&W.scope&&cur===0;const f=zoom?26:SET.fov;if(Math.abs(camera.fov-f)>0.1){camera.fov+=(f-camera.fov)*Math.min(1,dt*14);camera.updateProjectionMatrix();}
  updatePlasma(dt);}
