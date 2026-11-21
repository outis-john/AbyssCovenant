// ============================================================ 邪神专属灵能（被腐化后获得，按 Y）：瘟疫之风 / 幻欲魅影 / 血祭收割 / 万变诡计
const GOD_SKILL={
  decay: {name:'Plague Wind',cd:14,desc:'Three lingering plague clouds: enemies inside rot (DoT) and slow down'},
  excess:{name:'Phantasm',cd:16,desc:'Three phantom copies lure demons; when struck they burst and stun'},
  blood: {name:'Blood Reaper',cd:16,desc:'Blink-slash through up to 5 nearby enemies, healing on each kill'},
  change:{name:'Trickster’s Gambit',cd:18,desc:'Enemies within 10m turn on each other for 7s'}};
let clouds=[],decoys=[],reap=null;
function castGodSkill(){const g=player.godSkill;if(!g){announce('No dark gift yet — fill your corruption',1.2);return;}
  if(player.godCd>0){announce(GOD_SKILL[g].name+' cooling down '+Math.ceil(player.godCd)+'s',.8);return;}
  const S=GOD_SKILL[g],G=GODS[g];player.godCd=S.cd;ultBanner(S.name,{color:G.css,sub:G.name+'’s gift'});addTaint(10,g);
  const f=fwdFlat(),p=player.pos;
  if(g==='decay'){for(let i=1;i<=3;i++){const x=p.x+f.x*i*3.2,z=p.z+f.z*i*3.2;addCloud(x,z);fxSend('ult',{k:'cloud',x,z});}play('hole');}
  else if(g==='excess'){const list=[];for(let i=0;i<3;i++){const a=(i-1)*1.1+Math.atan2(f.x,f.z);const x=p.x+Math.sin(a)*3,z=p.z+Math.cos(a)*3;list.push([x,z]);}
    spawnDecoys(list);if(isClient())sendNet({t:'decoys',list});fxSend('ult',{k:'decoys',list});play('choir');}
  else if(g==='blood'){const tg=enemies.filter(e=>e.alive&&!e.static&&e.g.position.distanceTo(p)<12).sort((a,b)=>a.g.position.distanceTo(p)-b.g.position.distanceTo(p)).slice(0,5);
    if(!tg.length){announce('No prey nearby',.8);player.godCd=1;return;}reap={list:tg,i:0,t:0};play('frenzy');}
  else if(g==='change'){const ids=[];for(const e of enemies)if(e.alive&&!e.static&&!e.boss&&e.g.position.distanceTo(p)<10){e.confusedT=7;ids.push(e.id);}
    if(isClient())sendNet({t:'confuse',ids});fxSend('ult',{k:'confuse',x:p.x,z:p.z});confuseFx(p.x,p.z);play('zap');play('choir');}}
// 瘟疫云
function addCloud(x,z){const m=new THREE.Mesh(new THREE.SphereGeometry(2.5,12,8),new THREE.MeshBasicMaterial({color:0x7a9a20,transparent:true,opacity:.28,depthWrite:false}));m.position.set(x,1,z);m.scale.y=.6;scene.add(m);clouds.push({m,x,z,t:6,tick:0});}
// 幻影（房主用来吸引恶魔）
function spawnDecoys(list){for(const [x,z] of list){const m=new THREE.Group();const mat=new THREE.MeshBasicMaterial({color:0xff70d0,transparent:true,opacity:.45,depthWrite:false});
  for(const [w,h,d,y] of [[.9,1.1,.5,1.3],[.45,.45,.45,2.1],[.3,.9,.3,.45]]){const b=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat);b.position.y=y;m.add(b);}m.position.set(x,0,z);scene.add(m);
  const d={m,pos:m.position,t:7};decoys.push(d);}}
function decoyTargets(){return decoys.map(d=>({pos:d.pos,decoy:d}));}
function popDecoy(d){if(d.dead)return;d.dead=true;scene.remove(d.m);puff(d.pos.clone().setY(1),10,0xff70d0,1.3);play('zap');
  for(const e of enemies)if(e.alive&&e.g.position.distanceTo(d.pos)<3.5){e.stun=Math.max(e.stun,1.5);}}
// 错乱：去打离自己最近的其他恶魔
function confusedTargets(e){let best=null,bd=1e9;for(const o of enemies){if(o===e||!o.alive||o.static)continue;const d=o.g.position.distanceTo(e.g.position);if(d<bd){bd=d;best=o;}}return best?[{pos:best.g.position,foe:best}]:[];}
function confuseFx(x,z){ringAt(x,.3,z,0x60a0ff,.5,10,.6,.15);for(const e of enemies)if(e.alive&&e.g.position.distanceTo(new THREE.Vector3(x,0,z))<10)embersBlue(e.g.position.clone().setY(2.2),6);}
// 敌人攻击命中：幻影 / 被诱骗去打的同类；返回 true 表示已处理（不伤玩家）
function hitTarget(T,n,e){if(!T)return false;if(T.decoy){popDecoy(T.decoy);return true;}
  if(T.foe){if(T.foe.alive)damageEnemy(T.foe,n*2.5,'body',T.foe.g.position.clone().sub(e.g.position).setY(0).normalize(),{_remote:true,knock:.8,stagger:.4});return true;}return false;}
function updateGodSkill(dt){player.godCd=Math.max(0,(player.godCd||0)-dt);
  for(const c of clouds){c.t-=dt;c.m.material.opacity=.28*Math.min(1,c.t);c.m.rotation.y+=dt*.3;if(Math.random()<dt*6)puff(new THREE.Vector3(c.x+(Math.random()-.5)*4,.5,c.z+(Math.random()-.5)*4),1,0x6a8a20,1.4);
    c.tick-=dt;if(c.tick<=0){c.tick=.5;for(const e of enemies)if(e.alive&&Math.hypot(e.g.position.x-c.x,e.g.position.z-c.z)<2.6+e.r){damageEnemy(e,9,'body',null,{stagger:0,_noShield:true});e.slowT=1;}}
    if(c.t<=0)scene.remove(c.m);}clouds=clouds.filter(c=>c.t>0);
  for(const d of decoys){d.t-=dt;d.m.rotation.y+=dt*2;d.m.children.forEach(b=>b.material.opacity=.3+Math.sin(gameTime*12)*.15);if(d.t<=0)popDecoy(d);}decoys=decoys.filter(d=>!d.dead);
  for(const e of enemies){if(e.confusedT>0){e.confusedT-=dt;if(Math.random()<dt*3)embersBlue(e.g.position.clone().setY(2.3*e.g.scale.y),1);}if(e.slowT>0){e.slowT-=dt;}}
  if(reap){reap.t-=dt;if(reap.t<=0){const e=reap.list[reap.i++];if(e&&e.alive){const dir=e.g.position.clone().sub(player.pos).setY(0).normalize();const from=player.pos.clone();
        player.pos.copy(e.g.position).addScaledVector(dir,-1.4).setY(0);collide(player.pos,player.r||.45);player.yaw=Math.atan2(-dir.x,-dir.z);
        bolt(from.clone().setY(1.2),player.pos.clone().setY(1.2),0xff2020);const p=contactPoint(e);
        const k=damageEnemy(e,120*(player.meleeMul||1),'body',dir,{stagger:.8,knock:1,point:p,how:{cut:{p,n:new THREE.Vector3(Math.cos(player.yaw),.4,-Math.sin(player.yaw)).normalize(),imp:5}}});
        if(k)player.hp=Math.min(player.maxHp,player.hp+player.maxHp*.08);spawnBlood(p,dir,25);play('rip');play('kill');hitstop=.05;player.shake=.3;splat();}
      reap.t=.14;if(reap.i>=reap.list.length)reap=null;}}
  const G=player.godSkill&&GOD_SKILL[player.godSkill];const el=$('godab');if(el){el.style.display=G?'':'none';if(G)el.innerHTML=`<b style="color:${GODS[player.godSkill].css}">[Y] ${G.name}</b> ${player.godCd>0?Math.ceil(player.godCd)+'s':'READY'}<br><span>${G.desc}</span>`;}}
