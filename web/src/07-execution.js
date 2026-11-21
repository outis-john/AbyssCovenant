// ============================================================ 处决：需要充能，动作由手持武器决定，期间无敌，回复等量生命
const ex={active:false,t:0,dur:1.1,type:'',target:null,fired:{}};
const exChain={until:0,left:0};
const canExecute=e=>player.exCharge>=100&&e.alive&&!e.boss&&!e.static&&(!e.elite||e.hp<=e.maxHp*0.5);
function executeTarget(){if(player.exCharge<100)return null;const fwd=new THREE.Vector3(-Math.sin(player.yaw),0,-Math.cos(player.yaw));let best=null,bd=3.6;
  for(const e of enemies){if(!canExecute(e))continue;const to=e.g.position.clone().sub(player.pos).setY(0);const d=to.length();if(d<bd&&to.normalize().dot(fwd)>0.2){bd=d;best=e;}}return best;}
function execute(mode='full'){
  if(ex.active)return;const chain=gameTime<(exChain.until||0)&&exChain.left>0&&player.exCharge<100;const save=player.exCharge;if(chain)player.exCharge=100;   // 连环处决：窗口内不耗充能
  const t=executeTarget();if(!t){player.exCharge=save;return;}if(chain){exChain.left--;announce('连环处决！',0.8);}
  const W=WEAPONS[cur];ex.active=true;ex.t=0;ex.target=t;ex.fired={};ex.melee=!!W.melee;ex.type=W.melee?W.id:W.id;
  ex.mode=mode;ex.dur=mode==='quick'?0.45:({saw:1.15,power:1.0,ssword:1.05,bolter:0.9,pistol:0.75,shotgun:0.85,melta:1.05,plasma:1.1,hbolter:1.2,flamer:1.25,needle:0.95,hammer:1.15,fist:1.2,axe:1.2}[ex.type]||1);
  player.exCharge=0;reloadT=0;player.blocking=false;MS.phase='none';
  t.stun=0;t.stagger=99;t.kv.set(0,0,0);if(isClient()&&t.remote)sendNet({t:'stun',id:t.id,dur:ex.dur+0.5});
  const dir=t.g.position.clone().sub(player.pos).setY(0).normalize();player.pos.copy(t.g.position).addScaledVector(dir,-(1.7+t.r*1.2+(isMech()?1:0))).setY(0);$('exBars').classList.add('show');
  if(ex.melee)swordOut=ex.dur+0.3;
  play('exStart');hitstop=0.05;
}
function exKill(opts={}){
  const t=ex.target;if(!t.alive)return;const dealt=Math.max(1,Math.ceil(t.hp));
  const dir=t.g.position.clone().sub(player.pos).setY(0).normalize();
  damageEnemy(t,dealt+1,'body',dir.clone().multiplyScalar(opts.fling||1),{explode:true,how:opts.how||{}});
  const before=player.hp;player.hp=Math.min(player.maxHp,player.hp+dealt*(ex.mode==='quick'?0.5:1));
  announce((ex.mode==='quick'?'快速处决！':'处决！')+'回复 '+Math.round(player.hp-before)+' 生命',1.6);
  exChain.until=gameTime+3;if(exChain.left<=0)exChain.left=2;
  if(ex.mode!=='quick')for(const o of enemies){if(!o.alive||o===t||o.boss)continue;if(o.g.position.distanceTo(t.g.position)<7){o.stun=Math.max(o.stun,1.6);o.lean=1.2;if(isClient()&&o.remote)sendNet({t:'stun',id:o.id,dur:1.6});}}   // 震慑
  hitstop=0.13;player.shake=0.45;player.punch=0.08;splat();showHit(true);play('kill');
}
function kf(t,keys){if(t<=keys[0][0])return keys[0][1];for(let i=1;i<keys.length;i++)if(t<=keys[i][0]){const [t0,a]=keys[i-1],[t1,b]=keys[i];const k=(t-t0)/(t1-t0);return a.map((v,j)=>lerp(v,b[j],k));}return keys[keys.length-1][1];}
function at(name,time,fn){if(ex.t>=time&&!ex.fired[name]){ex.fired[name]=true;fn();}}
function updateExecution(dt){
  ex.t+=dt;const t=ex.target,T=ex.t,S=t.g.scale.y,head=t.g.position.clone().setY(1.3*S);   // 看胸口，不看头
  const eye=player.eye||1.6;const to=head.clone().sub(player.pos.clone().setY(eye));player.yaw=lerp(player.yaw,Math.atan2(-to.x,-to.z),0.25);player.pitch=lerp(player.pitch,Math.atan2(to.y,Math.hypot(to.x,to.z)),0.25);
  if(t.alive){t.stagger=99;t.g.rotation.z=(Math.random()-.5)*0.06;}
  const f=fwdFlat(),rt=new THREE.Vector3(Math.cos(player.yaw),0,-Math.sin(player.yaw)),up=new THREE.Vector3(0,1,0);
  const bloodAt=n=>{if(t.alive)sprayAlongChain(contactPoint(t),n);};
  const tp=y=>t.g.position.clone().setY(y*S);
  {const back=new THREE.Vector3(Math.sin(player.yaw),0,Math.cos(player.yaw));camera.position.addScaledVector(back,.55).y+=.3;}   // 镜头往后、往上
  if(ex.mode==='quick'){exQuick(T,t,f,rt,up,bloodAt,tp);}
  else switch(ex.type){
    case 'saw': // 竖着锯进去，从中间劈成左右两半
      sword.rotation.set(...kf(T,[[0,[0,.3,.1]],[.15,[1.3,0,0]],[.85,[1.35,0,0]],[1.0,[1.5,0,0]]]));
      sword.position.set(...kf(T,[[0,[.3,-.42,-.3]],[.15,[0,.2,-.55]],[.85,[0,-.55,-.6]],[1.0,[0,-.7,-.5]]]));
      if(T>.15&&T<.85){sword.position.x+=(Math.random()-.5)*.04;texChain.offset.x-=dt*25;ex.tick=(ex.tick||0)-dt;if(ex.tick<=0){ex.tick=.05;bloodAt(10);hitSparks(contactPoint(t),f.clone().negate(),2);}player.shake=Math.max(player.shake,.18);player.swingRoll=(Math.random()-.5)*.04;}
      at('in',.15,()=>{play('grind');splat();});
      at('kill',.88,()=>{play('rip');exKill({how:{cut:{p:tp(1.2),n:rt.clone(),imp:3.5}}});});break;
    case 'power': // 断臂 -> 斩首 -> 拦腰斩断
      sword.rotation.set(...kf(T,[[0,[0,.3,.1]],[.12,[.6,1.4,.9]],[.24,[-.6,-1.5,-.8]],[.4,[.1,-1.6,.05]],[.52,[.1,1.6,-.05]],[.66,[.05,1.7,0]],[.8,[.05,-1.7,0]]]));
      sword.position.set(...kf(T,[[0,[.3,-.42,-.3]],[.24,[-.2,-.5,-.3]],[.4,[-.35,-.2,-.35]],[.52,[.55,-.2,-.35]],[.66,[.55,-.4,-.35]],[.8,[-.35,-.4,-.35]]]));
      player.swingRoll=kf(T,[[0,[0]],[.24,[-.08]],[.52,[.1]],[.8,[-.1]],[1,[0]]])[0];
      at('arm',.2,()=>{play('powerHit');severArmsByPlane(t,tp(1.3),new THREE.Vector3().crossVectors(rt.clone().add(up).normalize(),f).normalize(),999);bloodAt(14);hitstop=.06;});
      at('head',.5,()=>{play('powerHit');if(t.parts.head.parent===t.g){const h=worldize(t.parts.head);throwGib(h,f.clone().multiplyScalar(2).add(new THREE.Vector3(0,7,0)),12);const neck=new THREE.Object3D();neck.position.set(0,1.75,0);t.g.add(neck);bleed(neck,1.2,2);}hitstop=.07;});
      at('kill',.78,()=>{play('powerHit');exKill({how:{cut:{p:tp(1.0),n:up.clone(),imp:4}}});});break;
    case 'ssword': // 盾击 -> 刺穿并挑起 -> 踹开
      shieldG.position.set(...kf(T,[[0,[-.35,-.35,-.5]],[.12,[-.05,-.2,-.8]],[.25,[-.38,-.4,-.5]]]));
      sword.rotation.set(...kf(T,[[0,[0,.3,.1]],[.4,[.05,.05,0]],[.55,[0,0,0]],[.75,[.35,0,0]],[1.0,[.3,.4,.2]]]));
      sword.position.set(...kf(T,[[0,[.3,-.42,-.3]],[.4,[.2,-.35,-.2]],[.55,[.05,-.3,-.85]],[.75,[.05,-.05,-.85]],[1.0,[.3,-.42,-.3]]]));
      if(T>.55&&T<.85&&t.alive){t.g.position.y=Math.min(.7,(T-.55)*3);}
      at('bash',.12,()=>{play('clang');player.shake=.35;hitstop=.07;t.lean=1.2;t.headSnap=1;});
      at('stab',.55,()=>{play('hit');bloodAt(20);splat();});
      at('kill',.85,()=>{play('rip');t.g.position.y=0;exKill({how:{cut:{p:tp(1.3),n:new THREE.Vector3().crossVectors(rt.clone().sub(up).normalize(),f).normalize(),imp:3,fling:f.clone().multiplyScalar(7)}}});});break;
    case 'bolter': case 'pistol': { // 抵近爆头
      const m=WEAPONS[cur].model;m.position.set(...kf(T,[[0,[.32,-.28,-.55]],[.2,[.05,-.08,-.8]],[ex.dur,[.05,-.08,-.8]]]));m.rotation.set(-.08,0,0);
      const shots=ex.type==='bolter'?[.28,.42,.56]:[.4];shots.forEach((s,i)=>at('sh'+i,s,()=>{play(WEAPONS[cur].snd);WEAPONS[cur].flash.visible=true;setTimeout(()=>WEAPONS[cur].flash.visible=false,50);gunKick=1.6;player.punch=.04;bloodAt(8);
        if(i===shots.length-1)exKill({how:{headBurst:true}});else{hitstop=.05;t.headSnap=1;t.lean=1;}}));break;}
    case 'shotgun': { // 枪管顶进胸口，上半身被轰飞
      const m=shotgun;m.position.set(...kf(T,[[0,[.32,-.28,-.55]],[.15,[.08,-.32,-1.0]],[.45,[.08,-.32,-.95]],[.6,[.2,-.15,-.5]]]));m.rotation.set(...kf(T,[[0,[0,0,0]],[.45,[.05,0,.1]],[.55,[.6,0,.25]],[.8,[0,0,0]]]));
      at('shove',.15,()=>{play('clang');hitstop=.05;t.lean=1;});
      at('kill',.45,()=>{play('shotgun');sgFlash.visible=true;setTimeout(()=>sgFlash.visible=false,60);bloodAt(40);player.punch=.12;exKill({how:{cut:{p:tp(1.25),n:up.clone(),imp:1.5,fling:f.clone().multiplyScalar(14)}}});});break;}
    case 'melta': { // 抵近熔化成一滩
      const m=melta;m.position.set(...kf(T,[[0,[.32,-.28,-.55]],[.2,[.08,-.2,-.8]],[ex.dur,[.08,-.2,-.8]]]));
      if(T>.25&&T<.85&&t.alive){const k=(T-.25)/.6;t.mat.emissive.setRGB(1,k*0.7,k*0.2);if(Math.random()<.6)heatBeam(camera.position.clone().add(new THREE.Vector3(0,-.2,0)),contactPoint(t),.7);t.g.scale.y=t.s0*(1-k*0.75);t.g.scale.x=t.g.scale.z=t.s0*(1+k*0.3);player.shake=Math.max(player.shake,.1);}
      at('fire',.25,()=>play('melta'));at('kill',.88,()=>{play('melta');play('boom');exKill({how:{melt:true}});});break;}
    default:exExtra(T,dt,t,f,rt,up,bloodAt,tp);
  }
  if(T>=ex.dur){ex.active=false;if(t.alive)exKill();shieldG.position.set(-.35,-.35,-.5);$('exBars').classList.remove('show');}
}

