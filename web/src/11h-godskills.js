// ============================================================ 邪神之赐（被腐化后获得，Tab）+ 赐福回响（灵能/职业技能的落点按邪神强化）
const GOD_SKILL={
  decay: {name:'Plague Wind',cd:14,desc:'Three rotting plague clouds swarming with flies: enemies inside take damage over time and slow down'},
  excess:{name:'Phantasm',cd:16,desc:'Three phantom copies of you lure demons; when struck they burst in a stunning pink shockwave'},
  blood: {name:'Blood Reaper',cd:16,desc:'Blink-slash through up to 5 nearby enemies, healing on each kill'},
  change:{name:'Trickster’s Gambit',cd:18,desc:'Enemies within 10m are marked by the Eye and turn on each other for 7s'}};
const ECHO_TXT={decay:'Your powers leave plague clouds where they land',excess:'Psy cooldowns ×1.5 faster; impacts stun nearby enemies',blood:'Impacts burst in a blood nova that heals you',change:'Impacts arc warp-lightning into up to 3 enemies'};
let clouds=[],decoys=[],reap=null,ghosts=[];
function addM(geo,mat,parent,x=0,y=0,z=0){const m=new THREE.Mesh(geo,mat);m.position.set(x,y,z);parent.add(m);return m;}
// 一个“星际战士”剪影（幻影和残影共用）
function silhouette(color,op){const g=new THREE.Group(),mat=new THREE.MeshBasicMaterial({color,transparent:true,opacity:op,depthWrite:false,blending:THREE.AdditiveBlending});
  const B=(w,h,d,x,y,z)=>addM(new THREE.BoxGeometry(w,h,d),mat,g,x,y,z);
  B(.3,.9,.35,-.22,.45,0);B(.3,.9,.35,.22,.45,0);B(.85,.95,.55,0,1.4,0);B(.5,.32,.6,-.58,1.85,0);B(.5,.32,.6,.58,1.85,0);B(.36,.38,.38,0,2.08,.04);
  B(.22,.75,.24,-.6,1.35,.05);const arm=B(.22,.75,.24,.6,1.35,.1);arm.rotation.x=-.9;const blade=B(.08,.08,1.4,.62,1.45,-.7);g.userData.mat=mat;return g;}
function castGodSkill(){const g=player.godSkill;if(!g){announce('No dark gift yet — let the Abyss claim you first',1.2);return;}
  if(player.godCd>0){announce(GOD_SKILL[g].name+' cooling down '+Math.ceil(player.godCd)+'s',.8);return;}
  const S=GOD_SKILL[g],G=GODS[g];player.godCd=S.cd;ultBanner(S.name,{color:G.css,sub:G.name+'’s gift'});
  const f=fwdFlat(),p=player.pos;
  if(g==='decay'){for(let i=1;i<=3;i++){const x=p.x+f.x*i*3.4+(Math.random()-.5),z=p.z+f.z*i*3.4+(Math.random()-.5);addCloud(x,z,1.1,7);fxSend('ult',{k:'cloud',x,z,s:1.1,life:7});}play('hole');play('growl');}
  else if(g==='excess'){const list=[];for(let i=0;i<3;i++){const a=(i-1)*1.1+Math.atan2(f.x,f.z);list.push([p.x+Math.sin(a)*3.2,p.z+Math.cos(a)*3.2]);}
    spawnDecoys(list);if(isClient())sendNet({t:'decoys',list});fxSend('ult',{k:'decoys',list});play('choir');}
  else if(g==='blood'){const tg=enemies.filter(e=>e.alive&&!e.static&&e.g.position.distanceTo(p)<12).sort((a,b)=>a.g.position.distanceTo(p)-b.g.position.distanceTo(p)).slice(0,5);
    if(!tg.length){announce('No prey nearby',.8);player.godCd=1;return;}reap={list:tg,i:0,t:0};play('frenzy');}
  else if(g==='change'){const ids=[];for(const e of enemies)if(e.alive&&!e.static&&!e.boss&&e.g.position.distanceTo(p)<10){e.confusedT=7;ids.push(e.id);bolt(p.clone().setY(1.6),e.g.position.clone().setY(1.8),Math.random()<.5?0x60a0ff:0xd060ff);}
    if(isClient())sendNet({t:'confuse',ids});fxSend('ult',{k:'confuse',x:p.x,z:p.z});confuseFx(p.x,p.z);play('zap');play('choir');}}
// ---- 瘟疫云：多团翻滚的毒雾 + 地面腐渍 + 苍蝇
function addCloud(x,z,s=1,life=6){const g=new THREE.Group();g.position.set(x,0,z);scene.add(g);const blobs=[],flies=[];
  const ground=addM(new THREE.CircleGeometry(2.8*s,24),new THREE.MeshBasicMaterial({color:0x24300a,transparent:true,opacity:.55,depthWrite:false}),g,0,.04,0);ground.rotation.x=-Math.PI/2;
  for(let i=0;i<7;i++){const c=[0x5a7a18,0x7a8a30,0x3a5010,0x8a9a40][i%4];const b=addM(new THREE.SphereGeometry((.9+Math.random()*.8)*s,10,8),new THREE.MeshBasicMaterial({color:c,transparent:true,opacity:.22,depthWrite:false}),g,(Math.random()-.5)*3*s,(.6+Math.random()*1.4)*s,(Math.random()-.5)*3*s);b.userData.ph=Math.random()*6;blobs.push(b);}
  const fm=new THREE.MeshBasicMaterial({color:0x080806});for(let i=0;i<14;i++){const f=addM(new THREE.BoxGeometry(.05,.05,.05),fm,g);f.userData={a:Math.random()*6.28,r:(.6+Math.random()*2)*s,y:.5+Math.random()*2,sp:3+Math.random()*4};flies.push(f);}
  clouds.push({m:g,x,z,s,t:life,life,tick:0,blobs,flies,ground});}
// ---- 幻影
function spawnDecoys(list){for(const [x,z] of list){const m=silhouette(0xff60c8,.5);m.position.set(x,0,z);scene.add(m);
    const ring=addM(new THREE.RingGeometry(.8,1,24),new THREE.MeshBasicMaterial({color:0xff70d0,transparent:true,opacity:.6,depthWrite:false,side:2}),m,0,.05,0);ring.rotation.x=-Math.PI/2;
    const echo=silhouette(0xffa0e8,.18);echo.scale.setScalar(1.06);m.add(echo);
    decoys.push({m,pos:m.position,t:7,echo,ring});bolt(player.pos.clone().setY(1.4),new THREE.Vector3(x,1.4,z),0xff70d0);puff(new THREE.Vector3(x,1,z),12,0xff90e0,1.2);ringAt(x,.1,z,0xff60c8,.3,2.5,.5);}}
function decoyTargets(){return decoys.map(d=>({pos:d.pos,decoy:d}));}
function popDecoy(d){if(d.dead)return;d.dead=true;scene.remove(d.m);const P=d.pos.clone();puff(P.clone().setY(1.2),26,0xff70d0,1.6);ringAt(P.x,.2,P.z,0xff60c8,.4,4.5,.45,.2);ringAt(P.x,1.4,P.z,0xffb0f0,.2,3,.35);play('zap');play('whoosh');
  for(const e of enemies)if(e.alive&&e.g.position.distanceTo(P)<4){e.stun=Math.max(e.stun,1.8);}}
// ---- 万变：错乱的敌人头顶浮现一只眼
function confusedTargets(e){let best=null,bd=1e9;for(const o of enemies){if(o===e||!o.alive||o.static)continue;const d=o.g.position.distanceTo(e.g.position);if(d<bd){bd=d;best=o;}}return best?[{pos:best.g.position,foe:best}]:[];}
function confuseFx(x,z){ufxAdd((()=>{const m=new THREE.Mesh(new THREE.RingGeometry(9.4,10,6),tmat(0x60a0ff,.7));m.rotation.x=-Math.PI/2;m.position.set(x,.06,z);return m;})(),2.5,{spin:1.5,op:.7});
  ufxAdd((()=>{const m=new THREE.Mesh(new THREE.RingGeometry(5,5.5,3),tmat(0xd060ff,.7));m.rotation.x=-Math.PI/2;m.position.set(x,.07,z);return m;})(),2.5,{spin:-2.4,op:.7});
  ringAt(x,1,z,0x80b0ff,.5,10,.7,.15);for(const e of enemies)if(e.alive&&e.g.position.distanceTo(new THREE.Vector3(x,0,z))<10)embersBlue(e.g.position.clone().setY(2.2),6);}
function eyeMark(e){if(e.eye)return;const g=new THREE.Group();addM(new THREE.SphereGeometry(.16,10,8),new THREE.MeshBasicMaterial({color:0xe8f0ff}),g);addM(new THREE.SphereGeometry(.08,8,6),new THREE.MeshBasicMaterial({color:0x2040ff}),g,0,0,.12);
  const r=addM(new THREE.TorusGeometry(.32,.03,4,20),new THREE.MeshBasicMaterial({color:0xd060ff}),g);g.userData.r=r;const sc=1/(e.g.scale.y||1);g.scale.setScalar(sc);g.position.y=2.7;e.g.add(g);e.eye=g;}
// 敌人攻击命中：幻影 / 被诱骗去打的同类；返回 true 表示已处理（不伤玩家）
function hitTarget(T,n,e){if(!T)return false;if(T.decoy){popDecoy(T.decoy);return true;}
  if(T.foe){if(T.foe.alive){damageEnemy(T.foe,n*2.5,'body',T.foe.g.position.clone().sub(e.g.position).setY(0).normalize(),{_remote:true,knock:.8,stagger:.4});sparkAt(T.foe);}return true;}return false;}
function sparkAt(e){embersBlue(e.g.position.clone().setY(1.5),5);}
// ---- 血祭收割的残影和刀光
function reapFx(from,to){const dir=to.clone().sub(from).setY(0).normalize();const gh=silhouette(0xff2020,.45);gh.position.copy(from);gh.rotation.y=Math.atan2(dir.x,dir.z)+Math.PI;scene.add(gh);ghosts.push({m:gh,t:.45});
  const arc=new THREE.Mesh(new THREE.RingGeometry(1.1,1.7,24,1,0,Math.PI*.9),tmat(0xff1818,.9));arc.position.copy(to).setY(1.4);arc.rotation.set(0,Math.atan2(dir.x,dir.z),(Math.random()-.5)*1.6);ufxAdd(arc,.3,{grow:1.5,s0:.8,op:.9});
  const line=new THREE.Mesh(new THREE.BoxGeometry(.06,.06,from.distanceTo(to)),tmat(0xff4040,.8));line.position.copy(from.clone().lerp(to,.5)).setY(1.3);line.lookAt(to.clone().setY(1.3));ufxAdd(line,.25,{op:.8});}
// ---- 赐福回响：灵能 / 职业技能落点
function godEcho(P,pow=1){const g=player.bless;if(!g||!P)return;P=P.clone().setY(0);echoFx(g,P,pow);fxSend('ult',{k:'echo',g,x:P.x,z:P.z,p:pow});
  if(g==='decay'){addCloud(P.x,P.z,.7*pow,4);}
  else if(g==='blood'){let n=0;for(const e of enemies)if(e.alive&&e.g.position.distanceTo(P)<3.5){damageEnemy(e,25*pow,'body',e.g.position.clone().sub(P).setY(.3).normalize(),{knock:.8,stagger:.3});n++;}player.hp=Math.min(player.maxHp,player.hp+n*3*pow);}
  else if(g==='excess'){for(const e of enemies)if(e.alive&&!e.boss&&e.g.position.distanceTo(P)<4)e.stun=Math.max(e.stun,1.1*pow);}
  else if(g==='change'){const tg=enemies.filter(e=>e.alive&&e.g.position.distanceTo(P)<10).slice(0,3);for(const e of tg){bolt(P.clone().setY(1.2),e.g.position.clone().setY(1.5),0x8060ff);damageEnemy(e,25*pow,'body',null,{stagger:.4});}player.mana=Math.min(player.maxMana||100,player.mana+8);}}
function echoFx(g,P,pow){const G=GODS[g];if(!G)return;
  if(g==='decay'){puff(P.clone().setY(.6),10,0x6a8a20,1.5);}
  else if(g==='blood'){ringAt(P.x,.15,P.z,0xff1010,.3,3.5*pow,.4,.18);spawnBlood(P.clone().setY(1),new THREE.Vector3(0,1,0),18);}
  else if(g==='excess'){ringAt(P.x,.2,P.z,0xff60c8,.3,4*pow,.45,.16);puff(P.clone().setY(1),14,0xff90e0,1.2);}
  else if(g==='change'){ringAt(P.x,.2,P.z,0x6090ff,.3,3,.4);embersBlue(P.clone().setY(1),10);}}
function updateGodSkill(dt){player.godCd=Math.max(0,(player.godCd||0)-dt);
  for(const c of clouds){c.t-=dt;const k=Math.min(1,c.t,(c.life-c.t)*3);c.m.rotation.y+=dt*.25;
    for(const b of c.blobs){b.userData.ph+=dt;b.material.opacity=.22*k;b.position.y+=Math.sin(b.userData.ph*1.3)*dt*.3;b.scale.setScalar(1+Math.sin(b.userData.ph*.9)*.12);}
    c.ground.material.opacity=.55*k;for(const f of c.flies){const u=f.userData;u.a+=dt*u.sp;f.position.set(Math.cos(u.a)*u.r,u.y+Math.sin(u.a*3)*.3,Math.sin(u.a*1.3)*u.r);f.visible=k>.2;}
    if(Math.random()<dt*5)puff(new THREE.Vector3(c.x+(Math.random()-.5)*3*c.s,.3,c.z+(Math.random()-.5)*3*c.s),1,0x9aba30,.8);
    c.tick-=dt;if(c.tick<=0){c.tick=.5;for(const e of enemies)if(e.alive&&Math.hypot(e.g.position.x-c.x,e.g.position.z-c.z)<2.7*c.s+e.r){damageEnemy(e,9*c.s,'body',null,{stagger:0,_noShield:true});e.slowT=1;}}
    if(c.t<=0)scene.remove(c.m);}clouds=clouds.filter(c=>c.t>0);
  for(const d of decoys){d.t-=dt;d.m.userData.mat.opacity=.35+Math.sin(gameTime*14+d.t)*.15;d.echo.position.x=Math.sin(gameTime*7)*.08;d.ring.rotation.z+=dt*2;
    const e=nearestEnemy(d.pos.clone().setY(1.2),20);if(e)d.m.rotation.y=Math.atan2(e.g.position.x-d.pos.x,e.g.position.z-d.pos.z);if(Math.random()<dt*4)puff(d.pos.clone().setY(1+Math.random()),1,0xff90e0,.7);if(d.t<=0)popDecoy(d);}
  decoys=decoys.filter(d=>!d.dead);
  for(const G of ghosts){G.t-=dt;G.m.userData.mat.opacity=Math.max(0,G.t);if(G.t<=0)scene.remove(G.m);}ghosts=ghosts.filter(G=>G.t>0);
  for(const e of enemies){if(e.confusedT>0&&e.alive){e.confusedT-=dt;if(!isClient()||true)eyeMark(e);if(e.eye){e.eye.rotation.y+=dt*3;e.eye.userData.r.rotation.x+=dt*5;e.eye.position.y=2.7+Math.sin(gameTime*4)*.1;}}
    else if(e.eye){e.eye.parent&&e.eye.parent.remove(e.eye);e.eye=null;}if(e.slowT>0){e.slowT-=dt;}}
  if(reap){reap.t-=dt;if(reap.t<=0){const e=reap.list[reap.i++];if(e&&e.alive){const dir=e.g.position.clone().sub(player.pos).setY(0).normalize();const from=player.pos.clone();
        player.pos.copy(e.g.position).addScaledVector(dir,-1.4).setY(0);collide(player.pos,player.r||.45);player.yaw=Math.atan2(-dir.x,-dir.z);
        reapFx(from,e.g.position.clone());fxSend('ult',{k:'reap',ax:from.x,az:from.z,x:e.g.position.x,z:e.g.position.z});const p=contactPoint(e);
        const k=damageEnemy(e,120*(player.meleeMul||1),'body',dir,{stagger:.8,knock:1,point:p,how:{cut:{p,n:new THREE.Vector3(Math.cos(player.yaw),.4,-Math.sin(player.yaw)).normalize(),imp:5}}});
        if(k)player.hp=Math.min(player.maxHp,player.hp+player.maxHp*.08);spawnBlood(p,dir,25);play('rip');play('kill');hitstop=.05;player.shake=.3;splat();}
      reap.t=.14;if(reap.i>=reap.list.length){reap=null;ringAt(player.pos.x,.15,player.pos.z,0xff1010,.5,5,.5,.2);}}}
  const S=player.godSkill&&GOD_SKILL[player.godSkill];const el=$('godab');if(el){el.style.display=S?'block':'none';if(S)el.innerHTML=`<b style="color:${GODS[player.godSkill].css}">[Tab] ${S.name}</b> ${player.godCd>0?Math.ceil(player.godCd)+'s':'READY'}<br><span>${S.desc}</span><br><span style="color:${GODS[player.godSkill].css}">◆ ${ECHO_TXT[player.godSkill]}</span>`;}}
