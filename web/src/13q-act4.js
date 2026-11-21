// ============================================================ 第四幕 · 伊斯塔万五号（The Drop Site Massacre）
// 视角：铁手军团原创战士 Brother Corvan Thale。4-1 乌加尔洼地第一波 · 4-2 第二波“援军”倒戈 · 4-3 原体之死 + Boss 艾多隆。
// ---------------- 军团配色（敌人 LEG / 队友 ALLY_COL）
Object.assign(LEG,{dg:{armor:0xb4ae94,trim:0x4a5a30,metal:0x7a6a40,eye:0x9aff40},iw:{armor:0x6c7076,trim:0xc8a020,metal:0x2a2a2a,eye:0xff2a10},
  nl:{armor:0x1a2244,trim:0xc8b040,metal:0x5a6278,eye:0xff1010},wb:{armor:0x7a1a18,trim:0x2a2a2a,metal:0x9a7a3a,eye:0xff6020},
  al:{armor:0x2a6a78,trim:0x8aa0a8,metal:0x6a7a80,eye:0x40ffd0},eid:{armor:0x5c2470,trim:0xc8a040,metal:0xd8b050,eye:0xff50d0}});
Object.assign(ALLY_COL,{ih:{armor:0x1e1f22,trim:0xa8acb0,metal:0x8a8e92},sal:{armor:0x1f5a2a,trim:0x161616,metal:0xb08a30},rg:{armor:0x1b1b1d,trim:0xd8d8d0,metal:0x6a6a6a},
  iw:{armor:0x6c7076,trim:0xc8a020,metal:0x2a2a2a},nl:{armor:0x1a2244,trim:0xc8b040,metal:0x5a6278},wb:{armor:0x7a1a18,trim:0x2a2a2a,metal:0x9a7a3a},al:{armor:0x2a6a78,trim:0x8aa0a8,metal:0x6a7a80},
  ecp:{armor:0x6a2c80,trim:0xd8b050,metal:0xe0c060}});
Object.assign(ALLY_DEFS,{haldrek:{name:'Sergeant Haldrek Morn',legion:'ih',role:'bolter',hp:460,essential:true},ostvar:{name:'Brother Ostvar',legion:'ih',role:'melee',hp:360},
  kavel:{name:'Brother Ka’vel',legion:'sal',role:'bolter',hp:340},senn:{name:'Brother Senn Ashkari',legion:'rg',role:'blade',hp:300}});
['Dravo','Ulric','Tor’gan','Messin','Akhar','Vey'].forEach((n,i)=>{ALLY_DEFS['ivl'+(i+1)]={name:'Brother '+n,legion:['ih','sal','rg'][i%3],role:i===3?'melee':'bolter',hp:250,generic:true};});
Object.assign(SPEAKER,{corvan:'Brother Corvan Thale',haldrek:'Sgt. Haldrek Morn',ostvar:'Brother Ostvar',kavel:'Brother Ka’vel',senn:'Brother Senn Ashkari',ferrus:'Ferrus Manus',vulkan:'Vulkan',corax:'Corax',
  fulgrim:'Fulgrim',eidolon:'Lord Commander Eidolon',nlsgt:'Night Lords Sergeant',ironfleet:'Fist of Iron · Bridge'});
Object.assign(VOICE,{corvan:{p:.58,r:.86},haldrek:{p:.42,r:.8},ostvar:{p:.38,r:.86},kavel:{p:.5,r:.82},senn:{p:.78,r:.95},ferrus:{p:.15,r:.76},vulkan:{p:.25,r:.78},corax:{p:.65,r:.88},
  fulgrim:{p:1.05,r:.84},eidolon:{p:1.25,r:.98},nlsgt:{p:.25,r:.8},ironfleet:{p:.9,r:.98}});
const act4=()=>!!(CAMP.id&&CAMP.id[0]==='4');
function meV(){return act4()?'corvan':'kaedric';}
// ---------------- 新敌人：死亡守卫 / 钢铁勇士 / 午夜领主 / 怀言者 / 阿尔法军团 / 艾多隆
Object.assign(ENEMY,{dg:{hp:300,speed:2.6,dmg:16,reach:1.9,scale:1.14,color:0xb4ae94},iw:{hp:240,speed:3.0,dmg:14,reach:1.9,scale:1.12,color:0x6c7076},
  nl:{hp:200,speed:6.6,dmg:22,reach:2.0,scale:1.1,color:0x1a2244},wb:{hp:220,speed:3.6,dmg:15,reach:1.9,scale:1.12,color:0x7a1a18},
  al:{hp:210,speed:3.9,dmg:15,reach:1.9,scale:1.12,color:0x2a6a78},eidolon:{hp:9000,speed:4.8,dmg:34,reach:2.8,scale:1.3,color:0x5c2470}});
ETYPES.push('dg','iw','nl','wb','al','eidolon');
function thunderHammer(arm){const g=new THREE.Group();g.position.set(0,-.5,.1);arm.add(g);addTo(g,new THREE.CylinderGeometry(.045,.045,1.3,6),lmat(0x2a2018),0,-.35,0);
  addTo(g,B3(.5,.34,.34),lmat(0x8a8e94),0,-1.0,0);addTo(g,B3(.52,.08,.36),lmat(0x80c0ff,true),0,-1.0,0);return g;}
Object.assign(ENEMY_BUILD,{
  dg:e=>{restyleMarine(e,LEG.dg,{legion:'dg'});e.muzzle=gunBolter(e.parts.armR);addTo(e.parts.body,B3(.5,.18,.3),lmat(0x5a6a38),0,.55,-.78);e.onHit=(e,d)=>d*.72;rigSetup(e);},
  iw:e=>{restyleMarine(e,LEG.iw,{legion:'iw'});e.muzzle=gunBolter(e.parts.armR,true);for(let i=0;i<3;i++)addTo(e.parts.body,B3(.14,.5,.05),lmat(i%2?0x1a1a1a:0xc8a020),-.2+i*.2,.15,.35).rotation.z=.6;rigSetup(e);},
  nl:e=>{restyleMarine(e,LEG.nl,{legion:'nl'});for(const arm of [e.parts.armL,e.parts.armR])for(let k=0;k<3;k++)addTo(arm,B3(.04,.55,.04),lmat(0x80c0ff,true),(k-1)*.09,-.72,.12);
    for(const s of [-1,1])addTo(e.parts.head,B3(.05,.28,.12),lmat(0x1a2244),s*.26,.32,0).rotation.z=s*-.5;addTo(e.parts.body,B3(.06,.42,.04),lmat(0xd0c040),0,.1,.35).rotation.z=.4;rigSetup(e);},
  wb:e=>{restyleMarine(e,LEG.wb,{legion:'wb'});e.muzzle=gunBolter(e.parts.armR);addTo(e.parts.body,B3(.26,.42,.02),lmat(0xd8c8a0),.22,.05,.35);chainSword(e.parts.armL);rigSetup(e);},
  al:e=>{restyleMarine(e,LEG.al,{legion:'al'});e.muzzle=gunBolter(e.parts.armR);addTo(e.parts.head,B3(.05,.05,.3),lmat(0x8aa0a8),0,.3,0);e.role=e.id%2?'flank':'cover';rigSetup(e);},
  eidolon:e=>{restyleMarine(e,LEG.eid,{legion:'ec',plume:0xe8e0d0});thunderHammer(e.parts.armR);e.muzzle=gunLas(e.parts.armL);e.onHit=duelistGuard;e.named='Lord Commander Eidolon';
    e.slamCd=3;e.scrCd=5;e.leapCd2=2;rigSetup(e);}});
Object.assign(ENEMY_AI,{
  dg:(e,T,pp,to,dist,dt)=>shooterAI(e,T,pp,to,dist,dt,EWEAP.bolter,[4,13],4,[1.8,2.8],.14),
  iw:(e,T,pp,to,dist,dt)=>shooterAI(e,T,pp,to,dist,dt,EWEAP.heavy,[10,22],5,[2,3.2],.1),
  wb:(e,T,pp,to,dist,dt)=>shooterAI(e,T,pp,to,dist,dt,EWEAP.bolter,[7,17],3,[1.3,2.3],.11),
  al:(e,T,pp,to,dist,dt)=>shooterAI(e,T,pp,to,dist,dt,EWEAP.bolter,[6,16],3,[1.2,2.2],.11),
  nl:(e,T,pp,to,dist,dt)=>ENEMY_AI.we(e,T,pp,to,dist,dt),
  eidolon:(e,T,pp,to,dist,dt)=>eidolonAI(e,T,pp,to,dist,dt)});
TAC_COVER.add('wb');TAC_COVER.add('al');TAC_COVER.add('iw');
// 艾多隆：雷锤砸地 → 二阶段声波尖啸（击退 + 扭曲画面）→ 三阶段狂暴；远距离跳劈；正面格挡玩家轻近战
function eidolonAI(e,T,pp,to,dist,dt){const k=e.hp/e.maxHp,P=e.g.position;
  if(!e.ph2&&k<.66){e.ph2=true;vox('eidolon','You fight like your father — all iron and no grace!',true);openSpawn('ec',3,P,4,8,{minP:6});}
  if(!e.ph3&&k<.33){e.ph3=true;e.speed*=1.25;e.dmg*=1.15;vox('eidolon','ENOUGH! Hear the true song of Chemos!',true);openSpawn('ec',2,P,4,8,{minP:6});}
  e.slamCd-=dt;e.scrCd-=dt;e.leapCd2-=dt;
  if(e.leap){leapUpdate(e,T,dt);if(!e.leap){ringAt(P.x,.2,P.z,0x80c0ff,.5,7,.5,.25);if(P.distanceTo(player.pos)<5&&state==='playing')hurtPlayer(e.dmg*.8,false,e);}return true;}
  if(e.scream>0){e.scream-=dt;e.parts.armL.rotation.x=e.parts.armR.rotation.x=-2.2;e.parts.head.rotation.x=-.4;
    if(e.scream<=0){e.parts.head.rotation.x=0;const C=P.clone().setY(1.8);ringAt(P.x,1.4,P.z,0xd080ff,.5,18,.7,.3);ringAt(P.x,.2,P.z,0x9040d0,.5,15,.8,.2);play('backlash');
      const d=player.pos.distanceTo(P);if(d<16&&state==='playing'&&!castRayWalls(C,player.pos.clone().setY(1.5).sub(C).normalize(),d)){hurtPlayer(e.dmg*(e.ph3?1.3:1),false,e);player.warp=Math.max(player.warp||0,1.6);player.shake=Math.max(player.shake,.5);
        const kb=player.pos.clone().sub(P).setY(0);const L=kb.length()||1;player.pos.addScaledVector(kb,3.2/L);collide(player.pos,(CLS[cls]&&CLS[cls].r)||.5);}
      for(const a of allies)if(a.alive&&a.pos.distanceTo(P)<16)allyHurt(a,e.dmg*.8,e);}return true;}
  if(e.slam>0){e.slam-=dt;e.parts.armR.rotation.x=-2.9;if(e.slam<=0){ringAt(P.x,.2,P.z,0xffa040,.5,6.5,.45,.3);ringAt(P.x,.2,P.z,0x80c0ff,.5,5,.6,.2);dust(P.clone(),26);play('boom');play('clang');player.shake=Math.max(player.shake,.7);
      if(P.distanceTo(player.pos)<6.2&&state==='playing')hurtPlayer(e.dmg*1.6,false,e);for(const a of allies)if(a.alive&&a.pos.distanceTo(P)<6.2)allyHurt(a,e.dmg*1.4,e);e.parts.armR.rotation.x=0;}return true;}
  if(e.ph2&&e.scrCd<=0&&dist<15){e.scream=.75;e.scrCd=e.ph3?6:9;ringAt(P.x,.1,P.z,0xc060ff,15,15,.75,.06);vox('eidolon',pickOne(['Listen!','Hear me!','Kneel to the song!']));return true;}
  if(e.slamCd<=0&&dist<5){e.slam=.85;e.slamCd=e.ph3?3.5:5.5;ringAt(P.x,.1,P.z,0xff2010,6.2,6.2,.85,.08);return true;}
  if(e.leapCd2<=0&&dist>8&&dist<24&&hasLOS(e,pp)){startLeap(e,pp);e.leap.dur=.75;e.leapCd2=e.ph3?5:7.5;return true;}
  return ENEMY_AI.ec(e,T,pp,to,dist,dt);}
// ---------------- 地图布景：叛军堑壕线、山脊高地、着陆坪
function fortLine(z,gaps=[]){for(let x=-62;x<=62;x+=6.5){if(gaps.some(g=>Math.abs(g-x)<5))continue;sandbags(x,z,5.6,0);}
  for(const x of [-46,-22,26,48]){if(gaps.some(g=>Math.abs(g-x)<7))continue;openBox(x,z-4,6,3.6,0,3,matDark);openBox(x,z-4,6.6,4.2,3,3.4,matBrick,0,false);}
  for(const x of [-56,-34,6,38]){if(!gaps.some(g=>Math.abs(g-x)<8))ruinWall(x-4,z-8,x+4,z-8,oRand(2.5,4));}}
function ridge(cx,cz){for(let k=0;k<16;k++){if(k%4===1)continue;const a=k/16*Math.PI*2;const x=cx+Math.cos(a)*17,z=cz+Math.sin(a)*17;openBox(x,z,oRand(2,3.4),oRand(2,3.4),0,oRand(1.6,4.6),matDark,a);if(k%2)rubble(x+Math.cos(a)*2,z+Math.sin(a)*2,2.4);}
  const pad=new THREE.Mesh(new THREE.CircleGeometry(5,24),lmat(0x2a2a2c));pad.rotation.x=-Math.PI/2;pad.position.set(cx,.03,cz);levelGroup.add(pad);
  for(let k=0;k<8;k++){const a=k/8*Math.PI*2;const l=new THREE.Mesh(B3(.25,.12,.25),lmat(0x80c0ff,true));l.position.set(cx+Math.cos(a)*5,.08,cz+Math.sin(a)*5);levelGroup.add(l);}}
// ---------------- 暗鸦守卫炮艇：飞来 → 降落 → 等待（机鼻重爆弹支援）→ 起飞离开
function buildGunship(){const g=new THREE.Group(),K=lmat(0x18191b),W=lmat(0xd0d0c8),GL=lmat(0x80c0ff,true);const b=(w,h,d,x,y,z,m=K)=>{const o=new THREE.Mesh(B3(w,h,d),m);o.position.set(x,y,z);g.add(o);return o;};
  b(3.2,2.6,10,0,1.6,0);b(2.4,1.6,3,0,1.3,6.2).rotation.x=.25;b(1.6,.6,1.2,0,2.7,4.6,lmat(0x3a6080,true));b(14,.3,3,0,2.2,-1);b(.3,2.8,2.4,0,3.8,-4.4);b(14.2,.1,.5,0,2.38,-2.3,W);b(.32,.6,2.4,0,4.9,-4.4,W);
  for(const x of [-5.5,-3,3,5.5]){const en=new THREE.Mesh(new THREE.CylinderGeometry(.5,.6,2.6,10),K);en.rotation.x=Math.PI/2;en.position.set(x,2,-1.4);g.add(en);b(.8,.8,.1,x,2,-2.75,GL);}
  const ramp=new THREE.Group();ramp.position.set(0,.4,-5);g.add(ramp);const r=new THREE.Mesh(B3(2.6,.2,3),K);r.position.z=-1.5;ramp.add(r);const gun=b(.3,.3,1.6,0,.9,7.6,lmat(0x2a2a2a));g.userData={ramp,gun};return g;}
function startShip(n){if(CAMP.ship&&CAMP.ship.g)levelGroup.remove(CAMP.ship.g);const g=buildGunship();levelGroup.add(g);const from=V3(-170,60,-130);g.position.copy(from);CAMP.ship={g,n,phase:'in',t:0,from,fire:0};if(actx)tone('sawtooth',80,140,.05,5);}
function updateShip(dt){const S=CAMP.ship;if(!S||S.phase==='gone')return;S.t+=dt;const g=S.g,pad=V3(0,0,0);
  if(S.phase==='in'){const k=Math.min(1,S.t/7),e=1-Math.pow(1-k,3);g.position.copy(S.from).lerp(V3(0,14,0),e);g.rotation.y=Math.atan2(-S.from.x,-S.from.z);g.rotation.z=Math.sin(k*Math.PI)*.15;if(k>=1){S.phase='down';S.t=0;vox('senn','Gunship on final approach — clear the pad!',true);}}
  else if(S.phase==='down'){const k=Math.min(1,S.t/3);g.position.y=14-12.6*k;dust(pad.clone(),1);if(k>=1){S.phase='wait';S.t=0;play('clang');dust(pad.clone(),20);}}
  else if(S.phase==='wait'){const L=28;g.userData.ramp.rotation.x=Math.min(.6,S.t*.6);setProgress(Math.max(0,1-S.t/L),'Loading wounded — lift-off in '+Math.ceil(Math.max(0,L-S.t))+'s');
    S.fire-=dt;if(S.fire<=0){S.fire=.22;let best=null,bd=45;for(const e of enemies){if(!e.alive)continue;const d=e.g.position.distanceTo(g.position);if(d<bd){bd=d;best=e;}}
      if(best){const from=g.userData.gun.getWorldPosition(new THREE.Vector3());fireBolt(from,best.g.position.clone().setY(1.2),EWEAP.heavy,'loyal',34,null);}}
    if(S.t>=L){S.phase='up';S.t=0;setProgress(-1);vox('senn',S.n===3?'Lifting!':'Wounded aboard — lifting! Next bird in two minutes.',true);if(actx)tone('sawtooth',140,90,.05,4);}}
  else if(S.phase==='up'){const k=Math.min(1,S.t/6);g.userData.ramp.rotation.x=.6*(1-k);g.position.set(k*k*170,1.4+k*60,-k*k*60);g.rotation.y=Math.PI/2*k;if(k>=1){S.phase='gone';levelGroup.remove(g);}}}
// ---------------- 原体决斗：费鲁斯·马努斯 vs 福格瑞姆（远处实时 + 过场）
function buildPrimarch(kind){const M=buildAllyModel({legion:kind==='ferrus'?'ih':'ecp',role:'none'});M.J.chev.visible=false;if(M.J.cloth)M.J.cloth.visible=false;M.root.scale.setScalar(1.75);
  if(kind==='ferrus'){const h=new THREE.Group();h.position.set(0,-.4,.1);M.J.elR.add(h);const s=new THREE.Mesh(new THREE.CylinderGeometry(.05,.05,1.5,6),lmat(0x2a2a2a));s.position.y=-.4;h.add(s);
    const hd=new THREE.Mesh(B3(.7,.42,.42),lmat(0x9aa0a8));hd.position.y=-1.2;h.add(hd);const gl=new THREE.Mesh(B3(.72,.1,.44),lmat(0xffa040,true));gl.position.y=-1.2;h.add(gl);
    for(const el of [M.J.elL,M.J.elR])el.children.forEach(c=>{if(c.isMesh)c.material=lmat(0xc8ccd0);});}
  else{const sw=new THREE.Group();sw.position.set(0,-.42,.12);M.J.elR.add(sw);const bl=new THREE.Mesh(B3(.08,1.8,.18),lmat(0xffd080,true));bl.position.y=-.95;sw.add(bl);
    const hair=new THREE.Mesh(B3(.48,.7,.2),lmat(0xf0f0f0));hair.position.set(0,.05,-.28);M.J.head.add(hair);}
  levelGroup.add(M.root);return M;}
function setupDuel(c){const f=buildPrimarch('ferrus'),g=buildPrimarch('fulgrim');CAMP.duel={c:c.clone(),f,g,t:0,swing:0,final:false,ft:0,dead:false};}
function updateDuel(dt){const D=CAMP.duel;if(!D)return;D.t+=dt;const {f,g,c}=D;
  if(!D.final){const a=D.t*.55,r=2.4;f.root.position.set(c.x+Math.cos(a)*r,c.y,c.z+Math.sin(a)*r);g.root.position.set(c.x-Math.cos(a)*r,c.y,c.z-Math.sin(a)*r);
    const yawTo=(A,B)=>Math.atan2(B.root.position.x-A.root.position.x,B.root.position.z-A.root.position.z);f.root.rotation.y=yawTo(f,g);g.root.rotation.y=yawTo(g,f);
    const cyc=(D.t%1.2)/1.2,who=Math.floor(D.t/1.2)%2;for(const [M,me] of [[f,0],[g,1]]){const sw=who===me?(cyc<.6?-2.6*cyc/.6:-2.6+3.2*(cyc-.6)/.4):-.3;M.J.shR.rotation.x=sw;M.J.hipL.rotation.x=Math.sin(D.t*5+me)*.35;M.J.hipR.rotation.x=-Math.sin(D.t*5+me)*.35;}
    if(Math.floor(D.t/1.2)!==Math.floor((D.t-dt)/1.2)){const mid=f.root.position.clone().lerp(g.root.position,.5).setY(c.y+3);hitSparks(mid,new THREE.Vector3(0,1,0),18);ringAt(mid.x,c.y+.2,mid.z,0xffd080,.5,5,.4,.1);
      const d=mid.distanceTo(camera.position);if(actx&&d<160)tone('square',180,90,Math.max(.01,.08-d/2500),.18);}}
  else{D.ft+=dt;const k=D.ft;// 费鲁斯单膝跪地 → 福格瑞姆举剑 → 斩下
    f.J.hipL.rotation.x=-1.3;f.J.kneeL.rotation.x=1.6;f.J.kneeR.rotation.x=1.4;f.J.torso.position.y=.5;f.J.shR.rotation.x=.3;f.J.head.rotation.x=-.3;
    g.J.shR.rotation.x=k<1.6?-3*Math.min(1,k/1.2):Math.min(.6,-3+(k-1.6)*14);
    if(k>1.7&&!D.dead){D.dead=true;const P=f.root.position.clone().setY(c.y+2.5);hitSparks(P,new THREE.Vector3(0,1,0),40);ringAt(P.x,c.y+.2,P.z,0xfff0c0,.5,12,.8,.3);play('boom');play('kill');}
    if(D.dead){f.J.torso.rotation.x=Math.min(1.45,(k-1.7)*1.6);f.root.position.y=c.y-Math.min(.6,(k-1.7)*.5);}}}
// ---------------- 第二波：伪装成友军的叛军，然后倒戈
const BT_TYPE={iw:'iw',nl:'nl',wb:'wb',al:'al'};let btSeq=0;
function secondWave(){const legs=['iw','nl','wb','al'];legs.forEach((L,i)=>{const P=V3(-27+i*18+(Math.random()-.5)*4,0,24+Math.random()*6);
  later(i*1.1,()=>podDrop(P,Q=>{for(let k=0;k<3;k++){const id='bt'+(++btSeq);ALLY_DEFS[id]={name:['Iron Warrior','Night Lord','Word Bearer','Alpha Legionary'][i]+' '+['Kord','Vass','Ruhn','Ithar','Sevrin','Mok'][btSeq%6],legion:L,role:L==='nl'?'melee':'bolter',hp:260,generic:true,betrayer:true};
    const a=spawnAlly(id,Q.x+(k-1)*1.6,Q.z+1.5);a.yaw=Math.PI;a.hold=V3(Q.x+(k-1)*2,0,Q.z-2);CAMP.betray.push(a);}}));});}
function betrayCentre(){const B=(CAMP.betray||[]).filter(a=>a.alive);if(!B.length)return V3(0,0,24);const c=V3(0,0,0);for(const a of B)c.add(a.pos);return c.divideScalar(B.length).setY(0);}
function convertBetrayers(){for(const a of CAMP.betray||[]){if(!a.alive)continue;const e=spawnEnemy(BT_TYPE[a.def.legion]||'iw',a.pos.x,a.pos.z);e.campaign=true;e.g.rotation.y=a.yaw;a.alive=false;a.gone=true;scene.remove(a.root);}
  allies=allies.filter(x=>!x.gone);const t=$('allyTags');if(t&&t.innerHTML!==undefined)t.innerHTML='';}
function betrayalScene(){CAMP.betrayed=true;const B=CAMP.betray.filter(a=>a.alive),c=betrayCentre();const loyal=allies.filter(a=>a.alive&&!a.def.betrayer&&!a.vehicle);
  runScene([
    {d:3.4,from:()=>shotAt(c.clone().add(V3(-10,2.6,-5)),c.clone().lerp(player.pos,.3).setY(1.6)),to:()=>shotAt(c.clone().add(V3(-8,2.2,-6)),c.clone().lerp(player.pos,.3).setY(1.6)),
      act(){for(const a of B){a.hold=a.pos.clone();a.target=null;a.yaw=Math.atan2(player.pos.x-a.pos.x,player.pos.z-a.pos.z);a.turned=true;}vox('nlsgt','Cousins. The Warmaster sends his regards.',true);},
      tick(dt){for(const a of B){a.root.rotation.y=a.yaw;if(a.J.shR)a.J.shR.rotation.x=-1.5;}}},
    {d:2.8,from:()=>shotAt(player.pos.clone().add(V3(-2.5,1.8,-3.5)),c.clone().setY(1.6)),
      act(){play('bolter');play('boom');vox('haldrek','TREACHERY! They’re firing on us — the second wave is TRAITOR!',true);
        const gen=loyal.filter(a=>a.def.generic);gen.slice(0,3).forEach((a,i)=>later(.2+i*.35,()=>allyDie(a)));for(const a of loyal)if(!a.def.generic||gen.indexOf(a)>=3)a.hp*=.6;},
      tick(dt){for(let i=0;i<3;i++){const a=B[Math.floor(Math.random()*B.length)];if(!a||!a.muzzle)continue;const from=a.muzzle.getWorldPosition(new THREE.Vector3());const t=loyal[Math.floor(Math.random()*loyal.length)];
          if(t)fireBolt(from,t.pos.clone().setY(1.3).add(V3((Math.random()-.5)*2,0,(Math.random()-.5)*2)),EWEAP.bolter,'fx',0,null);}}},
    {d:3.4,from:()=>shotAt(c.clone().add(V3(-22,26,-36)),c.clone().setY(0)),to:()=>shotAt(c.clone().add(V3(-18,22,-30)),c.clone().setY(0)),
      act(){convertBetrayers();for(let i=0;i<6;i++){const P=V3(c.x+(Math.random()-.5)*60,0,c.z+(Math.random()-.5)*30);P.x=clamp(P.x,-OPEN.R+6,OPEN.R-6);P.z=clamp(P.z,-OPEN.R+6,OPEN.R-6);later(i*.3,()=>podDrop(P,()=>{}));}
        vox('vulkan','Brothers… what have you done? WHAT HAVE YOU DONE?',true);}}],
    ()=>{CAMP.wp=null;later(1,()=>vox(meV(),'Back to back! Make them pay for every step!',true));},{sim:false});}
// ---------------- 小工具
function shellNear(c,rmin,rmax){const P=ringPt(c,rmin+Math.random()*(rmax-rmin),Math.random()*6.28);P.x=clamp(P.x,-OPEN.R+3,OPEN.R-3);P.z=clamp(P.z,-OPEN.R+3,OPEN.R-3);
  const m=new THREE.Mesh(new THREE.SphereGeometry(.4,8,6),lmat(0xffc060,true));m.position.set(P.x,45,P.z);scene.add(m);ringAt(P.x,.1,P.z,0xff3020,1,3.5,1.6,.06);(CAMP.fires=CAMP.fires||[]).push({m,a:m.position.clone(),b:P,t:0,dur:1.6,shell:true});}
function podRain(dt){if(!CAMP.flags.podRain||!OPEN.on)return;CAMP.rainT=(CAMP.rainT??2)-dt;if(CAMP.rainT>0)return;CAMP.rainT=2.2+Math.random()*3;
  const P=ringPt(player.pos,30+Math.random()*30,Math.random()*6.28);P.x=clamp(P.x,-OPEN.R+4,OPEN.R-4);P.z=clamp(P.z,-OPEN.R+4,OPEN.R-4);podDrop(P,()=>{});}
function rgSquad(P){for(let i=0;i<4;i++){const id='rgs'+i;ALLY_DEFS[id]={name:'Brother '+['Kaeso','Nyx','Dhal','Ravir'][i],legion:'rg',role:i===1?'blade':'bolter',hp:260,generic:true};
  const a=spawnAlly(id,P.x+(i-1.5)*2.2,P.z+2);a.hold=P.clone().add(V3((i-1.5)*3,0,(i%2)*3));}}
// ---------------- 关卡数据
const ITITAN=[V3(125,0,80),V3(125,0,-80),V3(70,0,-125),V3(125,0,80)];
const keepLine=z=>[...Array(9)].map((_,i)=>[-60+i*15,z,9]);
Object.assign(CLEVELS,{
  '4-1':{title:'Urgall Depression',place:'Isstvan V · The first wave',seed:4101,biome:'sanctum',open:'urgall',keep:[...keepLine(0),[0,-46,16]],build(){fortLine(2,[-20,16]);palaceRing(0,-46);},start:V3(0,0,58),
    allies:['haldrek','ostvar','kavel','senn','ivl1','ivl2','ivl3','ivl4'],tanks:[{id:'lr1',name:'Land Raider ‘Medusan Wrath’',x:-10,z:62,side:-8}],titan:{col:'loyal',path:ITITAN,side:'loyal'},
    obj:['Hold the drop zone','Break the Death Guard line','Hold the breach','Silence the traitor guns'],
    brief:[['ironfleet','Isstvan V. Horus has fortified the Urgall Depression with four Legions. Seven loyal Legions are coming for him.'],
      ['ferrus','Iron Tenth — we are the first wave. Vulkan’s Salamanders and Corax’s Ravens drop with us. The second wave follows to finish what we start.'],
      ['haldrek','The Gorgon would not wait for the others. He never waits.'],['corvan','Then we make sure he does not stand alone. Seals locked, Sergeant.']],
    end:'The traitor line is broken. Above, seven more Legions are falling from the sky — and the Warmaster has not moved at all.'},
  '4-2':{title:'The Second Wave',place:'Isstvan V · The drop site',seed:4101,biome:'sanctum',open:'urgall',keep:[...keepLine(0),[0,-46,16],[58,-6,10]],build(){fortLine(2,[-20,16]);palaceRing(0,-46);},start:V3(0,0,-38),
    allies:['haldrek','ostvar','kavel','senn','ivl1','ivl2','ivl3','ivl5','ivl6'],tanks:[{id:'lr1',name:'Land Raider ‘Medusan Wrath’',x:-8,z:-30,side:-8}],
    obj:['Clear the World Eaters','Link up with the second wave','Survive the crossfire','Break out to the Raven Guard','Hold the ravine'],
    brief:[['ironfleet','The traitor line is broken. Second wave making planetfall at the drop site behind you.'],['haldrek','Iron Warriors. Night Lords. Word Bearers. Alpha Legion. By nightfall Horus will be in chains.'],
      ['senn','Corax does not trust them. He never says why.'],['corvan','Then we keep our eyes open. Move out.']],
    end:'The drop site is a graveyard. Three loyal Legions are bleeding into the hills — and Ferrus Manus has gone after Fulgrim alone.'},
  '4-3':{title:'Death of a Primarch',place:'Isstvan V · The ridge',seed:4301,biome:'sanctum',open:'urgall',keep:[[0,0,22]],build(){ridge(0,0);setupDuel(V3(0,groundH(0,-94),-94));},start:V3(0,0,9),
    allies:['haldrek','ostvar','senn','ivl1','ivl3','ivl5'],
    obj:['Hold the ridge — first gunship','Hold the ridge — second gunship','Face Lord Commander Eidolon'],
    brief:[['senn','The Raven Guard are lifting the wounded off a ridge above the valley. Gunships every few minutes.'],['haldrek','Ferrus is down in that valley, fighting the Phoenician. We cannot reach him.'],
      ['corvan','Then we hold the ridge, and pray he comes back to it.']],
    end:'Ferrus Manus is dead. Of three loyal Legions, only scattered remnants escape Isstvan V. — To be continued: Act V, The Galaxy Burns.'}});
ACTS[3].lv=['4-1','4-2','4-3'];CORDER.push('4-1','4-2','4-3');
// 第四幕的增援军团在 ALLY_DEFS 写入时就改掉
const _spA=spawnAlly;spawnAlly=function(id,x,z,yaw){if(act4()&&/^rf\d+$/.test(id)&&ALLY_DEFS[id]){const k=+id.slice(2);ALLY_DEFS[id].legion=['ih','sal','rg'][k%3];ALLY_DEFS[id].role=k%4===0?'melee':'bolter';}return _spA(id,x,z,yaw);};
// ---------------- 步骤
CSTEPS['4-1']=[
  {enter(){CAMP.flags.podRain=true;CAMP.w=0;CAMP.wT=2;},
    update(dt){CAMP.wT-=dt;if(CAMP.w<3&&CAMP.wT<=0&&campAlive()<5){CAMP.w++;CAMP.wT=9;const c=V3((CAMP.w-2)*20,0,26);openSpawn('dg',5+CAMP.w,c,3,10);if(CAMP.w>=2)openSpawn('soh',3,c,6,12);
        if(CAMP.w===1)vox('senn','Death Guard, dug in among the rocks. Slow — but they do not fall easily.',true);
        if(CAMP.w===2){later(2,()=>loyalReinforce(2));vox('haldrek','Their armour drinks bolts. Aim for the joints — or get in close and open them up!',true);}
        if(CAMP.w===3){const t=spawnEnemy('tpred',22,24);t.campaign=true;t.hullYaw=Math.PI;vox('ostvar','Traitor Predator — right flank!',true);}}
      return CAMP.w>=3&&waveDone();}},
  {enter(){CAMP.wp=V3(0,0,4);CAMP.wpName='THE LINE';openSpawn('dg',8,V3(0,0,0),2,22,{minP:20});openSpawn('soh',4,V3(0,0,-6),2,16,{minP:20});const d=spawnEnemy('tdread',-8,-6);d.campaign=true;
      vox('ferrus','Iron Tenth — the line! Break it and the rest will follow!',true);later(6,()=>vox('vulkan','Salamanders, with the Gorgon! Burn them out of their holes!',true));},
    update(){if(CAMP.wp&&player.pos.distanceTo(CAMP.wp)<9)CAMP.wp=null;return !CAMP.wp&&campAlive()<=2;}},
  {enter(){addGun(V3(0,0,-1),Math.PI);CAMP.wp=V3(0,0,0);CAMP.wpName='HOLD';CAMP.hN=0;CAMP.hT=5;vox('haldrek','Heavy bolter on the parapet — Corvan, take it! Here comes the counter-charge!',true);},
    update(dt){if(CAMP.wp&&player.pos.distanceTo(CAMP.wp)<8)CAMP.wp=null;CAMP.hT-=dt;if(CAMP.hN<3&&CAMP.hT<=0&&campAlive()<8){CAMP.hN++;CAMP.hT=13;openSpawn('we',8+CAMP.hN*2,V3((CAMP.hN-2)*18,0,-38),3,12,{minP:20});
        if(CAMP.hN===1)vox('angron','IRON HANDS! COME — COME AND BLEED!',true);
        if(CAMP.hN===2){openSpawn('ec',4,V3(0,0,-36),3,10,{minP:20});vox('senn','Emperor’s Children behind the berserkers — blades, not guns. Do not let them close!',true);}
        if(CAMP.hN===3){const t=spawnEnemy('tpred',-20,-50);t.campaign=true;t.hullYaw=0;later(2,()=>loyalReinforce(2,V3(0,0,4)));}}
      return CAMP.hN>=3&&waveDone();}},
  {enter(){if(player.mounted)toggleMount();CAMP.arts=[];addArtillery(V3(-34,0,-52),.6);addArtillery(V3(34,0,-54),-.6);for(const A of CAMP.arts)openSpawn('soh',4,A.pos,4,10,{minP:20});openSpawn('soh',6,V3(0,0,-46),3,10,{minP:20});
      CAMP.wpName='BATTERY';vox('ferrus','Their guns are on the ridge. Silence them, and Horus stands naked before us!',true);},
    update(){const live=CAMP.arts.filter(a=>a.alive);CAMP.wp=live.length?live.reduce((b,a)=>a.pos.distanceTo(player.pos)<b.pos.distanceTo(player.pos)?a:b).pos.clone():V3(0,0,-46);CAMP.wpName=live.length?'BATTERY':'FIREBASE';
      if(!CAMP.artWave&&live.length===1){CAMP.artWave=1;openSpawn('soh',5,V3(0,0,-50),3,10,{minP:18});vox('ostvar','Sons of Horus pouring into the firebase!',true);}
      return live.length===0&&player.pos.distanceTo(V3(0,0,-46))<13&&campAlive()<=3;}}];
CSTEPS['4-2']=[
  {enter(){CAMP.flags.podRain=true;CAMP.betray=[];openSpawn('we',8,V3(0,0,-14),3,12,{minP:12});openSpawn('ec',3,V3(0,0,-20),3,8,{minP:12});later(4,()=>secondWave());
      vox('haldrek','Clear the last of Angron’s butchers. Then we hold for the second wave.',true);},
    update(){return campAlive()===0&&CAMP.timers.length===0&&CAMP.betray.length>0&&!(CAMP.pods&&CAMP.pods.some(q=>!q.done));}},
  {enter(){CAMP.wp=betrayCentre();CAMP.wpName='SECOND WAVE';CAMP.flags.podRain=false;vox('ironfleet','Second wave is down. Iron Warriors, Night Lords, Word Bearers, Alpha Legion — forming up on the drop site.',true);
      later(7,()=>vox('ferrus','Greet our brothers. Then we finish this together.',true));},
    update(){const c=betrayCentre();if(!CAMP.betrayed){CAMP.wp=c;if(player.pos.distanceTo(c)<24)betrayalScene();}return CAMP.betrayed&&!SC.on;}},
  {enter(){CAMP.cfT=75;CAMP.shT=3;CAMP.wp=null;spawnTitan(TITANCOL.mortis,[V3(-125,0,90),V3(-125,0,-80),V3(-70,0,-125),V3(-125,0,90)],{side:'chaos'});
      later(4,()=>traitorPods('iw',2,4,player.pos));later(15,()=>traitorPods('nl',2,4,player.pos));later(26,()=>openSpawn('we',6,V3(0,0,-52),3,10,{minP:25}));later(36,()=>traitorPods('wb',2,4,player.pos));
      later(8,()=>vox('senn','Corax is cutting a path east. Hold out until he opens it!',true));},
    update(dt){CAMP.cfT-=dt;setProgress(Math.max(0,CAMP.cfT/75),'Survive — Raven Guard breakout in '+Math.ceil(Math.max(0,CAMP.cfT))+'s');CAMP.shT-=dt;if(CAMP.shT<=0){CAMP.shT=3.5+Math.random()*2.5;shellNear(player.pos,8,22);}
      return CAMP.cfT<=0&&campAlive()<=8;}},
  {enter(){setProgress(-1);CAMP.wp=V3(58,0,-6);CAMP.wpName='RAVEN GUARD';CAMP.amb=0;vox('senn','Corridor open — the eastern ravine! Break out, NOW!',true);for(const a of allies)if(a.alive&&!a.vehicle)a.hold=null;},
    update(dt){CAMP.shT-=dt;if(CAMP.shT<=0){CAMP.shT=5+Math.random()*3;shellNear(player.pos,10,24);}
      if(!CAMP.amb&&player.pos.x>16){CAMP.amb=1;openSpawn('nl',6,V3(38,0,-6),3,10,{minP:10});vox('haldrek','Night Lords — dropping from above!',true);}
      return player.pos.distanceTo(CAMP.wp)<10;}},
  {enter(){CAMP.wp=null;rgSquad(V3(58,0,-6));CAMP.hN=0;CAMP.hT=4;vox('senn','Ravens! Hold this ravine — the wounded go through first.',true);},
    update(dt){CAMP.hT-=dt;if(CAMP.hN<3&&CAMP.hT<=0&&campAlive()<7){CAMP.hN++;CAMP.hT=14;
        if(CAMP.hN===1){openSpawn('al',8,player.pos,12,24,{minP:10});vox('senn','Alpha Legion — they were wearing OUR colours! Among the wounded!',true);}
        if(CAMP.hN===2){openSpawn('iw',6,V3(22,0,-6),3,10,{minP:18});const t=spawnEnemy('tpred',12,30);t.campaign=true;vox('ostvar','Iron Warriors armour, coming up the ravine!',true);}
        if(CAMP.hN===3){traitorPods('nl',2,4,player.pos);openSpawn('wb',5,V3(26,0,-22),3,10,{minP:18});}}
      return CAMP.hN>=3&&waveDone();}}];
CSTEPS['4-3']=[
  {enter(){startShip(1);CAMP.hN=0;CAMP.hT=3;vox('senn','Gunship inbound. It needs half a minute on the ground — keep them off the pad!',true);},
    update(dt){CAMP.hT-=dt;if(CAMP.hN<3&&CAMP.hT<=0&&campAlive()<7){CAMP.hN++;CAMP.hT=11;const a=Math.random()*6.28,c=V3(Math.cos(a)*38,0,Math.sin(a)*38);openSpawn(CAMP.hN===2?'iw':'ec',6,c,2,8,{minP:16});if(CAMP.hN===3)openSpawn('wb',4,c,2,8,{minP:16});}
      return CAMP.ship&&CAMP.ship.phase==='gone'&&campAlive()<=4;}},
  {enter(){startShip(2);CAMP.hN=0;CAMP.hT=2;vox('haldrek','Second bird coming in. Night Lords will want it — make them pay for every step.',true);},
    update(dt){CAMP.hT-=dt;if(CAMP.hN<3&&CAMP.hT<=0&&campAlive()<7){CAMP.hN++;CAMP.hT=12;if(CAMP.hN===1)traitorPods('nl',3,3,V3(0,0,0));if(CAMP.hN===2)openSpawn('al',5,player.pos,14,24,{minP:12});if(CAMP.hN===3){openSpawn('ec',5,V3(0,0,-36),2,8,{minP:16});openSpawn('iw',3,V3(0,0,36),2,8,{minP:16});}}
      return CAMP.ship&&CAMP.ship.phase==='gone'&&campAlive()<=4;}},
  {enter(){CAMP.wp=null;gorgonFalls();},mark:e=>!!e.named,update(){return CAMP.boss&&!CAMP.boss.alive&&campAlive()===0;}}];
Object.assign(LULLS,{
  '4-1':{1:[['ostvar','Ha! Mortarion’s sons die like anyone else. They just take longer about it.'],['kavel','Four Legions in the dirt, and our brothers still falling from the sky. Vulkan says it will be over by dusk.'],
      ['senn','The Warmaster has not shown himself. Not once. A man who expects to lose does not hide so well.'],['haldrek','Enough. Reload and refit — the World Eaters always answer a breach.']],
    2:[['corvan','Sergeant — the World Eaters broke off. Pulled back in good order. Angron’s dogs never retreat.'],['haldrek','Then someone told them to.'],['ferrus','Iron Tenth! The guns on the ridge — take them and the day is ours!']]},
  '4-2':{0:[['kavel','Seven Legions against four. By nightfall Horus will be in chains.'],['ostvar','And I will be the one who drags him to Terra.'],
      ['senn','The Night Lords have not lit their beacons. The Iron Warriors neither. Silent on every channel.'],['haldrek','Perturabo was never one for talk. Refit. We greet our cousins in good order.']]},
  '4-3':{0:[['ostvar','Down in the valley — look. The Gorgon. And the Phoenician.'],['haldrek','Ferrus Manus and Fulgrim. They called each other brother. Closer than any two of the twenty.'],
      ['senn','Corax begged him to wait for the rest of us. He would not wait.'],['corvan','He will win. He has to.'],['haldrek','…Refit, Corvan. Whatever happens down there, the wounded still need this ridge.']]}});
BOSS_FALL.eidolon={sub:'The song is ended',line:['haldrek','That one was for the Gorgon.'],rout:'flee'};
// ---------------- 原体之死 → 艾多隆登场
function gorgonFalls(){const D=CAMP.duel;const c=D?D.c.clone():V3(0,0,-94);
  runScene([
    {d:3.6,from:shotAt(V3(0,5,-13),c.clone().setY(c.y+3)),to:shotAt(V3(0,4,-16),c.clone().setY(c.y+2)),act(){if(D){D.final=true;D.ft=0;}vox('corvan','The Gorgon — he’s down on one knee!',true);}},
    {d:3.4,from:()=>shotAt(c.clone().add(V3(7,4,8)),c.clone().setY(c.y+2.5)),to:()=>shotAt(c.clone().add(V3(5,3.2,6)),c.clone().setY(c.y+2.2)),act(){vox('fulgrim','Forgive me, brother. Forgive me.',true);}},
    {d:2.4,from:()=>shotAt(c.clone().add(V3(-6,2.6,7)),c.clone().setY(c.y+1.6)),act(){if(D)D.ft=Math.max(D.ft,1.65);},tick(dt,k){if(D&&D.dead){$('fade').style.background='#fff4e0';$('fade').style.opacity=Math.max(0,.9-k*1.6);}}},
    {d:4,from:()=>{const h=allyById('haldrek')||player;const p=(h.pos||player.pos).clone();return shotAt(p.clone().add(V3(1.8,2,-2.2)),p.clone().setY(2));},
      act(){$('fade').style.background='';$('fade').style.opacity=0;vox('haldrek','No. No… The Gorgon is fallen. FERRUS MANUS IS FALLEN!',true);if(actx){tone('sine',98,98,.08,4);tone('sine',147,147,.05,4,.4);}}}],
    ()=>eidolonArrives());}
function eidolonArrives(){const P=V3(0,0,-11);
  runScene([
    {d:1.6,from:shotAt(V3(2,2,0),V3(0,6,-14)),act(){vox('eidolon','The Gorgon is dead — and his sons are next!',true);play('whoosh');const e=spawnEnemy('eidolon',P.x,P.z);e.campaign=true;CAMP.boss=e;e.g.position.y=8;e.leap={t:0,dur:1,from:V3(P.x,8,P.z-6),to:P.clone()};}},
    {d:1.2,from:shotAt(V3(1.5,1.6,-4),P.clone().setY(1.8)),tick(dt){const e=CAMP.boss;if(e&&e.leap){e.leap.t+=dt*1.3;const k=Math.min(1,e.leap.t/1);e.g.position.copy(e.leap.from).lerp(e.leap.to,k);e.g.position.y=(1-k)*8;
        if(k>=1){e.leap=null;e.g.position.y=0;dust(P.clone(),26);ringAt(P.x,.2,P.z,0x80c0ff,.5,8,.6,.3);play('boom');player.shake=.8;}}}},
    {d:4,from:()=>shotAt(P.clone().add(V3(-2.4,2.2,3.2)),P.clone().setY(2.6)),act(){const e=CAMP.boss;if(e){e.leap=null;e.g.position.y=0;e.g.rotation.y=Math.atan2(player.pos.x-P.x,player.pos.z-P.z);}openSpawn('ec',4,P,3,7,{minP:6});
        vox('eidolon','Come, little iron men. Sing for me.',true);}},
    {d:3,from:()=>shotAt(player.pos.clone().add(V3(1.5,2,1.5)),P.clone().setY(2.2)),act(){vox('corvan','For Ferrus. For Medusa. Iron Hands — WITH ME!',true);}}],
    ()=>{CAMP.wp=null;});}
// ---------------- 开场
function dropIntro(title,sub,podN,lines,done){titleCard(title,sub,3.8);const S0=CAMP.L.start;const pods=[];allies.forEach(a=>{if(!a.vehicle)a.root.visible=false;});
  const spots=[...Array(podN)].map((_,i)=>i===0?V3(S0.x,0,S0.z):V3(S0.x+(i%2?1:-1)*(4+Math.floor(i/2)*4),0,S0.z+((i*7)%9)-3));
  runScene([
    {d:4.4,from:shotAt(V3(S0.x+26,10,S0.z-16),V3(S0.x,10,S0.z)),to:shotAt(V3(S0.x+22,6,S0.z-12),V3(S0.x,3,S0.z+2)),act(){spots.forEach((P,i)=>{const o=makePodAt(P.x,P.z,70+i*7+Math.random()*6);o.landed=false;pods.push(o);});
        for(let i=0;i<14;i++){const P=V3((Math.random()-.5)*120,0,(Math.random()-.5)*60+S0.z-20);P.x=clamp(P.x,-OPEN.R+5,OPEN.R-5);P.z=clamp(P.z,-OPEN.R+5,OPEN.R-5);const o=makePodAt(P.x,P.z,90+Math.random()*80);o.landed=false;o.far=true;pods.push(o);}play('whistle');},
      tick(dt){for(const o of pods){o.p.position.y=Math.max(0,o.p.position.y-dt*44);o.p.rotation.y+=dt*2;if(o.p.position.y>0&&Math.random()<.5)puff(o.p.position.clone().add(V3(0,-.5,0)),1,0xff8030,1.8);
        if(o.p.position.y<=0&&!o.landed){o.landed=true;o.p.userData.jet.visible=false;if(!o.far)podImpact(o.p.position,o===pods[0]?1.2:.6);else dust(o.p.position,6);}}}},
    {d:3,from:shotAt(V3(S0.x+9,2.3,S0.z-7),V3(S0.x,1.5,S0.z+3)),to:shotAt(V3(S0.x+8,2,S0.z-5),V3(S0.x,1.3,S0.z+3)),
      act(){for(const o of pods){if(o.p.position.y>0&&!o.far){o.p.position.y=0;}if(!o.landed&&!o.far){o.landed=true;o.p.userData.jet.visible=false;podImpact(o.p.position,.4);}}
        allies.forEach((a,i)=>{if(a.vehicle)return;const o=pods[i+1]&&!pods[i+1].far?pods[i+1]:pods[0];a.root.visible=true;a.pos.set(o.p.position.x+2.3,0,o.p.position.z);a.yaw=Math.PI;a.root.rotation.y=a.yaw;a.vel&&a.vel.set(0,0,0);});
        vox(lines[0][0],lines[0][1],true);},tick(dt,k){for(const o of pods)if(o.door)o.door.rotation.z=-Math.min(Math.PI/2,k*6);}},
    {d:4.6,from:()=>{const h=allyById('haldrek')||allies[0];return shotAt(h.pos.clone().add(V3(-2.5,1.9,-3)),h.pos.clone().setY(1.9));},act(){vox(lines[1][0],lines[1][1],true);vox(lines[2][0],lines[2][1],true);}},
    {d:4,from:shotAt(V3(S0.x-3,2.4,S0.z-2),V3(0,6,0)),to:shotAt(V3(S0.x-2,3.2,S0.z-6),V3(0,8,0)),act(){vox(lines[3][0],lines[3][1],true);
        for(const o of pods)if(o!==pods[0]&&!o.far)colliders.push({minX:o.p.position.x-1.4,maxX:o.p.position.x+1.4,minZ:o.p.position.z-1.4,maxZ:o.p.position.z+1.4});}}],
    ()=>{player.pos.set(S0.x+4,0,S0.z-2);player.yaw=0;done();});}
Object.assign(CAMP.intro,{
  '4-1'(){dropIntro('ACT IV · ISSTVAN V','Urgall Depression',7,[['ferrus','Iron Tenth! Horus has dug himself into this dead world like a tick. We burn him out.'],
      ['vulkan','Salamanders — with the Gorgon. Shield the wounded. Spare no traitor.'],['corax','Ravens to the flanks. Strike, and vanish.'],['haldrek','Squad Morn — on me. Corvan, eyes forward. Iron within.']],()=>nextCampStep());},
  '4-2'(){titleCard('ACT IV · ISSTVAN V','The Second Wave',3.8);const S0=CAMP.L.start;
    runScene([
      {d:4.4,from:shotAt(V3(S0.x-3,2.2,S0.z+2),V3(0,30,40)),to:shotAt(V3(S0.x-2,2.4,S0.z+4),V3(0,40,50)),act(){for(let i=0;i<8;i++){const P=V3((Math.random()-.5)*80,0,20+Math.random()*30);later(i*.4,()=>podDrop(P,()=>{}));}
          vox('ironfleet','Second wave entering the atmosphere. Seven Legions on the field — glory to the Emperor.',true);}},
      {d:4.2,from:()=>{const h=allyById('haldrek')||allies[0];return shotAt(h.pos.clone().add(V3(2,1.9,2.5)),h.pos.clone().setY(1.9));},act(){vox('haldrek','Look at them come. Perturabo’s whole Legion. Curze’s. Lorgar’s.',true);vox('senn','Landing behind us. Not beside us. Behind.',true);}},
      {d:3,from:shotAt(V3(S0.x+3,2.6,S0.z-4),V3(0,2,0)),act(){vox('corvan','Mop up the World Eaters. Then we go and shake our cousins’ hands.',true);}}],()=>{player.yaw=Math.PI;nextCampStep();});},
  '4-3'(){titleCard('ACT IV · ISSTVAN V','Death of a Primarch',3.8);const S0=CAMP.L.start,c=CAMP.duel?CAMP.duel.c:V3(0,0,-94);
    runScene([
      {d:4.6,from:shotAt(V3(S0.x+2,3,S0.z-4),c.clone().setY(c.y+3)),to:shotAt(V3(S0.x+1,2.6,S0.z-8),c.clone().setY(c.y+3)),act(){vox('senn','Down there — the valley. That is the Gorgon. And Fulgrim.',true);}},
      {d:4.4,from:()=>shotAt(c.clone().add(V3(10,5,10)),c.clone().setY(c.y+2.5)),to:()=>shotAt(c.clone().add(V3(7,4,7)),c.clone().setY(c.y+2.5)),act(){vox('ferrus','You were the best of us, Fulgrim! The BEST of us!',true);}},
      {d:3.8,from:()=>{const h=allyById('haldrek')||allies[0];return shotAt(h.pos.clone().add(V3(-2,1.9,2.4)),h.pos.clone().setY(1.9));},act(){vox('haldrek','We cannot reach him. So we hold this ridge until the Ravens have lifted every wounded brother off this rock.',true);}}],
      ()=>{player.yaw=0;nextCampStep();});}});
// ---------------- 结尾
Object.assign(CAMP.outro,{
  '4-1'(done){runScene([
      {d:3.8,from:shotAt(V3(4,2.4,-38),V3(0,3,-60)),act(){vox('ferrus','They break! The Warmaster’s line BREAKS!',true);}},
      {d:4.2,from:shotAt(V3(-2,1.8,-44),V3(0,60,40)),to:shotAt(V3(-2,1.8,-44),V3(0,70,60)),act(){for(let i=0;i<10;i++){const P=V3((Math.random()-.5)*100,0,10+Math.random()*50);later(i*.35,()=>podDrop(P,()=>{}));}vox('ironfleet','Second wave entering low orbit. Seven Legions on the field — the day is ours.',true);}},
      {d:4,from:()=>shotAt(player.pos.clone().add(V3(2,1.9,2)),player.pos.clone().setY(1.7)),act(){vox('corvan','Then why does the Warmaster not run?',true);vox('haldrek','Because he is waiting for something.',true);}}],done);},
  '4-2'(done){const kv=allyById('kavel');const P=player.pos.clone();if(kv&&kv.alive){kv.pos.set(P.x-4,0,P.z+3);kv.hold=kv.pos.clone();kv.invuln=true;}
    runScene([
      {d:4.2,from:()=>{const k=allyById('kavel');const p=(k&&k.alive?k.pos:P).clone();return shotAt(p.clone().add(V3(2,1.9,2.4)),p.clone().setY(1.9));},act(){vox('kavel','Go. I will hold the gap. Fire does not frighten a son of Nocturne.',true);}},
      {d:3.8,from:()=>shotAt(P.clone().add(V3(-12,6,10)),P.clone().add(V3(-4,1,3))),act(){const k=allyById('kavel');openSpawn('nl',5,(k&&k.alive?k.pos:P),6,10,{minP:4});},
        tick(dt,k){if(k>.75){const kv=allyById('kavel');if(kv&&kv.alive){kv.invuln=false;allyDie(kv);vox('ostvar','KA’VEL!',true);}}}},
      {d:4.6,from:()=>shotAt(P.clone().add(V3(2,1.9,-2)),P.clone().add(V3(30,6,0))),act(){vox('senn','Corax is pulling everyone into the hills. Nothing is left on the drop site but the dead.',true);vox('corvan','And the Gorgon?',true);vox('haldrek','Ferrus went after Fulgrim. Alone. He would not hear us.',true);},
        tick(dt,k){$('fade').style.opacity=Math.max(0,(k-.6)*2.5);}}],done);},
  '4-3'(done){startShip(3);const S=CAMP.ship;S.phase='wait';S.t=0;S.g.position.set(0,1.4,0);S.g.rotation.y=0;setProgress(-1);const h=allyById('haldrek');
    if(h&&h.alive){h.pos.set(0,0,-8);h.hold=h.pos.clone();h.invuln=true;}
    runScene([
      {d:4.4,from:()=>shotAt(V3(2.5,2,-4),V3(0,1.9,-8)),act(){vox('haldrek','Go, Corvan. Someone has to remember how the Tenth stood on this ridge. Tell them we did not break.',true);}},
      {d:3,from:()=>shotAt(V3(-1.5,1.9,-3),V3(0,1.9,-8)),act(){vox('corvan','Sergeant—',true);vox('haldrek','That is an order, brother. Go.',true);openSpawn('ec',6,V3(0,0,-26),3,9,{minP:8});openSpawn('iw',4,V3(-20,0,-24),3,9,{minP:8});}},
      {d:5.2,from:()=>shotAt(V3(0,3,-3),V3(0,0,-9)),to:()=>shotAt(V3(10,34,-2),V3(0,0,-10)),act(){S.phase='up';S.t=0;play('boom');},tick(dt,k){if(Math.random()<dt*8){const e=enemies.find(x=>x.alive);if(e&&h&&h.alive&&h.muzzle)fireBolt(h.muzzle.getWorldPosition(new THREE.Vector3()),e.g.position.clone().setY(1.2),EWEAP.bolter,'fx',0,null);}
          $('fade').style.opacity=Math.max(0,(k-.7)*3);}},
      {d:3.6,from:shotAt(V3(0,40,0),V3(0,0,-1)),act(){$('fade').style.opacity=1;titleCard('ISSTVAN V','The Gorgon is fallen. The Iron Tenth endures.',3.4);if(h)h.invuln=false;}}],done);}});
// 4-1 用胜利动画；4-2 / 4-3 是溃败中的幸存，不升旗
const _cwA=campaignWin;campaignWin=function(){if(CAMP.id==='4-2'||CAMP.id==='4-3'){CAMP.wp=null;CAMP.outro[CAMP.id](()=>campEnd(true));return;}_cwA();};
// 关卡专属的每帧更新
const _ucA=updateCampaign;updateCampaign=function(dt){_ucA(dt);if(!act4())return;updateDuel(dt);if(state!=='playing')return;podRain(dt);updateShip(dt);};
const _udS=updateScene;updateScene=function(dt){_udS(dt);if(CAMP.on&&act4()){updateDuel(dt);if(CAMP.ship&&CAMP.ship.phase!=='gone')updateShip(dt);}};
// 开局：保留地图空地（OPEN.extraKeep），清掉上一关的炮艇 / 决斗
const _sclQ=startCampaignLevel;startCampaignLevel=function(id){const L=CLEVELS[id];OPEN.extraKeep=L&&L.keep||null;CAMP.ship=null;CAMP.duel=null;CAMP.betray=[];CAMP.betrayed=false;_sclQ(id);OPEN.extraKeep=null;};
// 战役面板：第三、四幕可玩
openCampaign=function(){initAudio();const done=campDone();const live=n=>n==='III'||n==='IV';
  $('campActs').innerHTML=ACTS.map((A,ai)=>`<div class="cact${live(A.n)?' live':''}"><div class="an">ACT ${A.n}</div><div class="at">${A.name}</div>`+A.lv.map((lv,li)=>{
    if(!live(A.n)||!CLEVELS[lv])return `<div class="clv locked"><span>${ai+1}-${li+1}</span>${lv}<em>In development</em></div>`;
    const L=CLEVELS[lv],ok=campUnlocked(lv);return `<div class="clv${ok?'':' locked'}${done.includes(lv)?' done':''}" data-lv="${lv}"><span>${lv}</span>${L.title}<em>${done.includes(lv)?'Completed':ok?'Ready':'Locked'}</em></div>`;}).join('')+'</div>').join('');
  document.querySelectorAll('#campActs .clv[data-lv]').forEach(el=>el.onclick=()=>{if(!campUnlocked(el.dataset.lv))return;play('equip');openBrief(el.dataset.lv);});
  $('campaign').classList.add('show');};
$('campBtn').onclick=()=>{play('equip');openCampaign();};
const _obQ=openBrief;openBrief=function(id){_obQ(id);$('briefAct').textContent=id[0]==='4'?'ACT IV · ISSTVAN V':'ACT III · ISSTVAN III';};
