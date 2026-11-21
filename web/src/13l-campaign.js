// ============================================================ 战役：荷鲁斯之乱（垂直切片：第三幕 伊斯塔万三号）
// 组成：导演系统（runScene 镜头/字幕/动作）· 无线电字幕 vox · 标题卡 · 航点 · 关卡步骤机 · 简报 / 结算 / 进度存档
const CAMP={on:false,id:null,L:null,step:-1,S:null,t:0,flags:{},timers:[],rally:null,wp:null,wpName:'',stats:{kills:0,lost:0},cellsHit:new Set()};
const SPEAKER={kaedric:'Sgt. Kaedric Vorne',ardan:'Brother Ardan',vell:'Brother Vell',krosk:'Brother Krosk',lucan:'Brother Lucan',tavik:'Librarian Tavik',hesk:'Ancient Hesk',
  loken:'Captain Loken',malk:'Brother Malk',tarvitz:'Captain Tarvitz',fleet:'Vengeful Spirit · Bridge',angron:'Angron'};
// ---------------- 无线电字幕
const VX={q:[],cur:null,t:0,lastBark:-9};
function vox(who,text,force){if(!force&&(VX.q.length>0||gameTime-VX.lastBark<3.5))return;if(!force)VX.lastBark=gameTime;VX.q.push({who,text});}
function voxClear(){VX.q=[];VX.cur=null;const v=$('vox');if(v&&v.classList)v.classList.remove('show');}
function updateVox(dt){const v=$('vox');if(!v||!v.classList)return;
  if(VX.cur){VX.t-=dt;if(VX.t<=0){VX.cur=null;v.classList.remove('show');}}
  if(!VX.cur&&VX.q.length){VX.cur=VX.q.shift();VX.t=2.2+VX.cur.text.length*.045;const c=VOX_COL[VX.cur.who]||'#d8d0c0';
    v.innerHTML=`<b style="color:${c}">${SPEAKER[VX.cur.who]||VX.cur.who}</b><span>${VX.cur.text}</span>`;v.classList.add('show');
    if(actx){tone('square',1150,900,.04,.05);tone('square',820,820,.03,.04,.07);noiseHit(2400,.05,.12,'bandpass');}}}
// ---------------- 标题卡
function titleCard(big,small,dur=3.2){const t=$('titleCard');if(!t||!t.classList)return;t.innerHTML=`<div class="tb">${big}</div><div class="ts">${small||''}</div>`;t.classList.remove('go');void t.offsetWidth;t.style.setProperty('--d',dur+'s');t.classList.add('go');if(actx){tone('sine',55,40,.25,2.6);noiseHit(180,.12,2.2);}}
// ---------------- 导演系统：一串镜头（起止机位可以跟随演员）、每个镜头开头执行动作
const SC={on:false,shots:[],i:-1,t:0,done:null,sim:false};
function runScene(shots,done,opt={}){SC.on=true;SC.shots=shots;SC.i=-1;SC.t=0;SC.done=done;SC.sim=!!opt.sim;state='scene';view.visible=false;mouseDown=false;document.body.classList.add('inscene');
  $('letterbox').classList.add('show');$('cutCap').textContent='';document.exitPointerLock?.();if(AUS.rig)AUS.rig.visible=false;nextShot();}
function nextShot(){SC.i++;const S=SC.shots[SC.i];if(!S){endScene();return;}SC.t=0;if(S.cap!==undefined)$('cutCap').textContent=S.cap;if(S.act)S.act();}
function camKey(f){const r=typeof f==='function'?f():f;return r;}
function updateScene(dt){const S=SC.shots[SC.i];if(!S)return;SC.t+=dt;const k=S.d?Math.min(1,SC.t/S.d):1,e=k<.5?2*k*k:1-Math.pow(-2*k+2,2)/2;
  if(S.tick)S.tick(dt,k);
  if(S.from){const A=camKey(S.from),Bk=camKey(S.to||S.from);const p=A.p.clone().lerp(Bk.p,e),l=A.l.clone().lerp(Bk.l,e);const sh=player.shake*player.shake;player.shake=Math.max(0,player.shake-dt*1.2);
    p.x=clamp(p.x,-HALF+.6,(G-1)*C+HALF-.6);p.z=clamp(p.z,-HALF+.6,(G-1)*C+HALF-.6);p.y=Math.min(p.y,H-.4);
    camera.position.copy(p).add(new THREE.Vector3((Math.random()-.5)*sh,(Math.random()-.5)*sh,(Math.random()-.5)*sh));camera.lookAt(l);}
  if(SC.sim){gameTime+=dt;updateEnemies(dt);updateEbolts(dt);updateSpits(dt);updateBleeders(dt);}
  updateAllies(dt);updateDebris(dt);updateUfx(dt);updatePuffs(dt);updateSparks(dt);updateVox(dt);campFx(dt);
  if(SC.t>=(S.d||0))nextShot();}
function endScene(skip){if(!SC.on)return;if(skip){for(let i=SC.i+1;i<SC.shots.length;i++){const S=SC.shots[i];if(S.act)S.act();if(S.tick)S.tick(0,1);}}
  SC.on=false;document.body.classList.remove('inscene');$('letterbox').classList.remove('show');$('cutCap').textContent='';$('fade').style.opacity=0;view.visible=true;player.shake=0;
  camera.position.set(player.pos.x,player.pos.y+(CLS[cls].eye||1.6),player.pos.z);camera.rotation.set(player.pitch,player.yaw,0,'YXZ');
  const d=SC.done;SC.done=null;state='playing';SC.endAt=performance.now();canvas.requestPointerLock?.();if(!document.pointerLockElement)announce('Click to take control',2.5);if(d)d();}
const V3=(x,y,z)=>new THREE.Vector3(x,y,z);
const shotAt=(p,l)=>({p,l});
// ---------------- 地图工具
const cellC=(i,j)=>V3(i*C,0,j*C);
function campPath(ti,tj){const d=bfs(ti,tj),path=[[0,0]];let [i,j]=[0,0];let guard=40;while((i!==ti||j!==tj)&&guard--){let best=null;for(const [a,b] of [[1,0],[-1,0],[0,1],[0,-1]]){const ni=i+a,nj=j+b;if(ni<0||nj<0||ni>=G||nj>=G||!connected(i,j,ni,nj))continue;if(d[ni][nj]<d[i][j]){best=[ni,nj];break;}}if(!best)break;[i,j]=best;path.push(best);}return path;}
function farCell(){const d=bfs(0,0);let best=[0,0],bd=-1;for(let i=0;i<G;i++)for(let j=0;j<G;j++)if(d[i][j]<1e8&&d[i][j]>bd&&!(i===G-1&&j===G-1&&bd>=d[i][j])){bd=d[i][j];best=[i,j];}return best;}
function freeSpot(i,j,rmin=2,rmax=7){const c=cellC(i,j);for(let k=0;k<12;k++){const a=Math.random()*6.28,r=rmin+Math.random()*(rmax-rmin);const p=V3(c.x+Math.cos(a)*r,0,c.z+Math.sin(a)*r);
    if(!colliders.some(b=>p.x>b.minX-.7&&p.x<b.maxX+.7&&p.z>b.minZ-.7&&p.z<b.maxZ+.7)&&p.distanceTo(player.pos)>5)return p;}return V3(c.x+(Math.random()-.5)*4,0,c.z+(Math.random()-.5)*4);}
function campSpawn(type,i,j,n,opt={}){const out=[];for(let k=0;k<n;k++){const p=opt.at?opt.at.clone().add(V3((Math.random()-.5)*3,0,(Math.random()-.5)*3)):freeSpot(i,j,opt.rmin,opt.rmax);collide(p,.5);const e=spawnEnemy(type,p.x,p.z,!!opt.elite);e.campaign=true;out.push(e);}return out;}
// 从相邻房间的门洞涌入（离玩家最远的那扇门）
function campBreach(type,n,ci=0,cj=0){let best=null,bd=-1;for(const [a,b] of [[1,0],[-1,0],[0,1],[0,-1]]){const ni=ci+a,nj=cj+b;if(ni<0||nj<0||ni>=G||nj>=G||!connected(ci,cj,ni,nj))continue;const d=cellC(ni,nj).distanceTo(player.pos)+Math.random()*6;if(d>bd){bd=d;best=[ni,nj];}}
  if(!best)return campSpawn(type,ci,cj,n,{rmin:6,rmax:8});const door=V3((ci+best[0])/2*C,0,(cj+best[1])/2*C),out=campSpawn(type,best[0],best[1],n,{at:door.clone().lerp(cellC(...best),.35)});return out;}
const campAlive=f=>enemies.filter(e=>e.alive&&e.campaign&&(!f||f(e))).length;
const inCell=(p,i,j)=>{const [a,b]=cellOf(p);return a===i&&b===j;};
function later(t,f){CAMP.timers.push({t,f});}
// ---------------- 视觉特效：战歌合唱扭曲、病毒浪潮、燃烧天空
function campFx(dt){if(!CAMP.on)return;
  const singers=enemies.filter(e=>e.alive&&e.type==='warsinger'&&e.g.position.distanceTo(player.pos)<22).length;if(singers){player.warp=Math.max(player.warp||0,Math.min(.3,.1*singers));}
  if(CAMP.flags.fireSky){CAMP.skyT=(CAMP.skyT||0)-dt;if(CAMP.skyT<=0){CAMP.skyT=.5+Math.random()*.9;fireStreak();}
    scene.background.setHex(Math.random()<.02?0x6a2008:0x2a0804);}
  for(const f of CAMP.fires||[]){f.t+=dt;const k=Math.min(1,f.t/f.dur);f.m.position.copy(f.a).lerp(f.b,k);if(k>=1&&!f.hit){f.hit=true;scene.remove(f.m);fireImpact(f.b);}}
  if(CAMP.fires)CAMP.fires=CAMP.fires.filter(f=>!f.hit);
  if(CAMP.wave)updateVirusWave(dt);}
function fireStreak(){const a=Math.random()*6.28,r=6+Math.random()*20;const b=V3(player.pos.x+Math.cos(a)*r,0,player.pos.z+Math.sin(a)*r);
  const m=new THREE.Mesh(new THREE.SphereGeometry(.35,8,6),lmat(0xffa040,true));const A=b.clone().add(V3((Math.random()-.5)*10,H-.3,(Math.random()-.5)*10));m.position.copy(A);scene.add(m);
  (CAMP.fires=CAMP.fires||[]).push({m,a:A,b,t:0,dur:.55});}
function fireImpact(P){ringAt(P.x,.2,P.z,0xff7020,.3,3,.4,.15);puff(P.clone().setY(.5),6,0x3a2a1a,1.4);hitSparks(P.clone().setY(.3),V3(0,1,0),8);
  if(P.distanceTo(player.pos)<20){play('boom');player.shake=Math.max(player.shake,.15);}
  if(state==='playing'&&P.distanceTo(player.pos)<2.6)hurtPlayer(14,false,null);for(const a of allies)if(a.alive&&a.pos.distanceTo(P)<2.6)allyHurt(a,10,null);}
// 病毒浪潮：从起点沿 BFS 层层推进，被吞没的房间变成死地
function updateVirusWave(dt){const W=CAMP.wave;W.t+=dt;const reach=(W.t-W.delay)/W.per;
  for(let i=0;i<G;i++)for(let j=0;j<G;j++){const d=W.d[i][j];if(d>=1e8||W.dead.has(i+','+j)||d>reach)continue;W.dead.add(i+','+j);
    const fog=new THREE.Mesh(B3(C,H,C),new THREE.MeshBasicMaterial({color:0x2a4a10,transparent:true,opacity:.42,depthWrite:false}));fog.position.set(i*C,H/2,j*C);scene.add(fog);W.fogs.push(fog);
    for(const e of enemies)if(e.alive&&inCell(e.g.position,i,j))killEnemy(e,null,false,{melt:true});
    if(cellOf(player.pos)[0]===i&&cellOf(player.pos)[1]===j)announce('The Life-Eater is here — RUN!',1.5);}
  for(const f of W.fogs)f.material.opacity=.35+Math.sin(gameTime*3+f.position.x)*.07;
  const [pi,pj]=cellOf(player.pos);if(W.dead.has(pi+','+pj)&&state==='playing'){hurtPlayer(26*dt,true);$('hurt').style.opacity=.5;player.warp=Math.max(player.warp||0,.6);if(Math.random()<dt*6)puff(player.pos.clone().setY(1),2,0x4a6a20,1.2);}
  for(const a of allies){if(!a.alive)continue;const [ai,aj]=cellOf(a.pos);if(W.dead.has(ai+','+aj))allyHurt(a,30*dt,null);}
  if(Math.random()<dt*20&&W.fogs.length){const f=W.fogs[Math.floor(Math.random()*W.fogs.length)];puff(V3(f.position.x+(Math.random()-.5)*C,1+Math.random()*3,f.position.z+(Math.random()-.5)*C),1,0x3a5a14,2.5);}}
// ---------------- 关卡数据
const ACTS=[
  {n:'I',name:'The Lost Son',lv:['Cthonia','Ullanor','The Triumph']},
  {n:'II',name:'The Warmaster’s Shadow',lv:['Sixty-Three Nineteen','Davin’s Moon','The Lodge']},
  {n:'III',name:'Isstvan III',lv:['3-1','3-2','3-3']},
  {n:'IV',name:'The Drop Site Massacre',lv:['Urgall Depression','The Second Wave','Death of a Primarch']},
  {n:'V',name:'The Galaxy Burns',lv:['Calth','Signus','Beta-Garmon']},
  {n:'VI',name:'The Siege of Terra',lv:['Lion’s Gate','The Delphic Battlement','The Inner Palace']},
  {n:'VII',name:'The Vengeful Spirit',lv:['Boarding','The Warmaster’s Court','The Throne Room']}];
const CLEVELS={
  '3-1':{title:'The Choral City',place:'Isstvan III · Choral City outskirts',seed:3101,biome:'sanctum',allies:['ardan','vell','krosk','lucan','tavik'],
    obj:['Secure the drop zone','Advance through the city to the Sirenhold','Silence the Warsingers','Hold the Sirenhold'],
    brief:[['fleet','Isstvan III has renounced the Imperium. Its governor, Vardus Praal, hides behind the Choral City and its psychic choirs.'],
      ['loken','The Warmaster chose the assault force himself. Four Legions — and only the brothers he calls ‘unreliable’. I don’t like it. We go anyway.'],
      ['ardan','Every brother who spoke against the lodges is on that list, sergeant. Every single one.'],
      ['kaedric','Then let’s show him what unreliable looks like. Check your seals. We drop in ten.']]},
  '3-2':{title:'Life-Eater',place:'Isstvan III · The Sirenhold',seed:3102,biome:'sanctum',allies:['ardan','vell','krosk','lucan','tavik'],
    obj:['Reach the bunkers before the virus does'],
    brief:[['tarvitz','…this is Captain Saul Tarvitz. Any loyal ear on Isstvan III — our own fleet is loading virus bombs. The Life-Eater.'],
      ['tarvitz','They mean to kill every one of us. Get underground. Now.'],
      ['loken','Garro took the Eisenstein to warn Terra. We are what is left. The bunkers lie beneath the palace — run, and don’t look back.']]},
  '3-3':{title:'The Precentor’s Palace',place:'Isstvan III · Ruins of the Precentor’s Palace',seed:3103,biome:'sanctum',allies:['ardan','krosk','lucan','tavik','hesk'],
    obj:['Hold the palace','Hold the palace','Hold the palace','Face Oren Malk'],
    brief:[['loken','The virus failed. We still breathe, and they will not forgive us for it. They are coming down now — all of them.'],
      ['tavik','Three Legions in the sky, Kaedric. And among them a voice I know.'],
      ['tavik','Malk is coming.'],
      ['kaedric','Then I’ll be waiting for him.']]}};
const CORDER=['3-1','3-2','3-3'];
// ---------------- 每关的步骤
const CSTEPS={
  '3-1':[
    {enter(){CAMP.wave1=0;CAMP.wT=1;},update(dt){CAMP.wT-=dt;if(CAMP.wave1<3&&CAMP.wT<=0&&campAlive()<4){CAMP.wave1++;CAMP.wT=6;campBreach('militia',5);if(CAMP.wave1===3){campBreach('warsinger',1);vox('tavik','A Warsinger. Kill it before it finds its voice!',true);}}
      return CAMP.wave1>=3&&campAlive()===0;}},
    {enter(){const [ti,tj]=farCell();CAMP.target=[ti,tj];CAMP.path=campPath(ti,tj);CAMP.wp=cellC(ti,tj);CAMP.wpName='SIRENHOLD';CAMP.amb=new Set(['0,0']);
      vox('loken','Drop zone secure? Good. Push for the Sirenhold — that’s where the choirs sing.',true);
      later(20,()=>vox('malk','Kaedric, it’s Malk. Listen — stay close to the Sirenhold. Whatever happens. Trust me on this.',true));
      later(24,()=>vox('kaedric','Malk? Why aren’t you down here with us, brother?',true));later(29,()=>vox('malk','…The Warmaster has other work for me. Good hunting.',true));},
      update(dt){const [pi,pj]=cellOf(player.pos);const k=pi+','+pj;
        if(!CAMP.amb.has(k)&&CAMP.path.some(([a,b])=>a===pi&&b===pj)&&!(pi===CAMP.target[0]&&pj===CAMP.target[1])){CAMP.amb.add(k);campSpawn('militia',pi,pj,4,{rmin:5,rmax:8});if(Math.random()<.5)campSpawn('warsinger',pi,pj,1,{rmin:6,rmax:8});}
        return player.pos.distanceTo(CAMP.wp)<8;}},
    {enter(){const [ti,tj]=CAMP.target;campSpawn('warsinger',ti,tj,4,{rmin:4,rmax:8});campSpawn('militia',ti,tj,5,{rmin:5,rmax:8});CAMP.wp=null;
      vox('tavik','The choir — four of them. Their song is in my skull. Silence them!',true);},update(){return campAlive(e=>e.type==='warsinger')===0;}},
    {enter(){campBreach('militia',6,...CAMP.target);vox('lucan','More of Praal’s faithful. Let them come.',true);},update(){return campAlive()===0;}}],
  '3-2':[
    {enter(){const [ti,tj]=farCell();CAMP.target=[ti,tj];CAMP.wp=cellC(ti,tj);CAMP.wpName='BUNKER';CAMP.limit=160;CAMP.path=campPath(ti,tj);CAMP.flags.fireSky=true;
      CAMP.wave={t:0,delay:16,per:14,d:bfs(0,0),dead:new Set(),fogs:[]};CAMP.amb=new Set(['0,0']);
      later(12,()=>vox('loken','All squads, to the bunkers! Do not stop for anything!',true));
      later(45,()=>{vox('tavik','Forgive me, Lord. I take up the gift again.',true);CAMP.flags.tavikPsy=true;const t=allies.find(a=>a.id==='tavik');if(t)ringAt(t.pos.x,1.2,t.pos.z,0x80c0ff,.3,6,.6,.15);});
      later(70,()=>{const v=allies.find(a=>a.id==='vell'&&a.alive);if(v)vellCrushed(v);});},
      update(dt){CAMP.limit-=dt;setProgress(Math.max(0,CAMP.limit/160),'Virus strike '+Math.ceil(Math.max(0,CAMP.limit))+'s');
        const [pi,pj]=cellOf(player.pos),k=pi+','+pj;if(!CAMP.amb.has(k)&&!(pi===CAMP.target[0]&&pj===CAMP.target[1])){CAMP.amb.add(k);campSpawn('militia',pi,pj,3,{rmin:5,rmax:8});}
        if(CAMP.limit<=0&&state==='playing'){hurtPlayer(9999,true);}
        return player.pos.distanceTo(CAMP.wp)<6;}}],
  '3-3':[
    {enter(){CAMP.hold=true;for(const a of allies)a.hold=null;vox('ardan','Those are our own colours on the ridge... Sons of Horus.',true);campBreach('soh',3);later(3,()=>campBreach('soh',3));CAMP.wN=1;},update(){return campAlive()===0&&CAMP.timers.length===0;}},
    {enter(){vox('angron','KILL THEM! TEAR THEM APART!',true);later(3,()=>vox('krosk','My own Legion... I knew those voices once.',true));campBreach('we',4);later(4,()=>campBreach('we',3));CAMP.wN=2;},update(){return campAlive()===0&&CAMP.timers.length===0;}},
    {enter(){vox('lucan','Emperor’s Children. My former brothers. Mind their blades.',true);campBreach('ec',3);campBreach('soh',3);later(5,()=>campBreach('ec',2));CAMP.wN=3;CAMP.heskDone=false;},
      update(){if(!CAMP.heskDone&&campAlive()<=3&&CAMP.timers.length===0){CAMP.heskDone=true;heskLastStand();}return CAMP.heskDone&&campAlive()===0&&CAMP.timers.length===0&&!SC.on;}},
    {enter(){malkArrives();},update(){return CAMP.malk&&!CAMP.malk.alive&&campAlive()===0;}}]};
// ---------------- 关卡流程
function startCampaignLevel(id){const L=CLEVELS[id];if(!L)return;try{initAudio();actx&&actx.resume?.();}catch(err){}if(isNet())leaveRoom();
  const ob=loadout.biome;loadout.biome=L.biome;prepareMatch(L.seed);loadout.biome=ob;training.on=false;
  for(const e of enemies){e.alive=false;scene.remove(e.g);}enemies=[];for(const it of interactables)scene.remove(it.m);interactables=[];match.conds=[];waveTimer=1e9;
  Object.assign(CAMP,{on:true,id,L,step:-1,S:null,t:0,flags:{tavikPsy:id!=='3-1'},timers:[],wp:null,wpName:'',stats:{kills:0,lost:0},fires:[],wave:null,malk:null,hold:false,target:[0,0]});
  clearAllies();clearEbolts();voxClear();
  const n=L.allies.length;L.allies.forEach((a,i)=>{const ang=Math.PI*.75+(i-(n-1)/2)*.6;spawnAlly(a,Math.sin(ang)*3.5,Math.cos(ang)*3.5,ang+Math.PI);});
  $('hub').classList.remove('show');$('brief').classList.remove('show');$('campaign').classList.remove('show');document.body.classList.remove('inhub');document.body.classList.add('incamp');view.visible=true;
  CAMP.intro[id]();}
function nextCampStep(){CAMP.step++;const S=CSTEPS[CAMP.id][CAMP.step];CAMP.S=S||null;if(!S){campaignWin();return;}if(CAMP.step>0)play('pickup');if(S.enter)S.enter();}
function updateCampaign(dt){CAMP.t+=dt;for(const T of CAMP.timers){T.t-=dt;if(T.t<=0&&!T.fired){T.fired=true;T.f();}}CAMP.timers=CAMP.timers.filter(T=>!T.fired);
  updateVox(dt);campFx(dt);if(CAMP.S&&!SC.on&&state==='playing'&&CAMP.S.update(dt))nextCampStep();updateWaypoint();}
function campObjHtml(){const L=CAMP.L;if(!L)return'';const o=L.obj[Math.min(CAMP.step,L.obj.length-1)]||'';
  let h=`<h3>${L.title}</h3><div>◆ ${o}${CAMP.id==='3-3'&&CAMP.wN&&CAMP.step<3?` <span class="dim">— wave ${CAMP.wN} / 3</span>`:''}</div>`;
  const left=campAlive();if(left&&CAMP.id!=='3-2')h+=`<div class="dim">Hostiles remaining: ${left}</div>`;return h;}
function campSquadHtml(){return allies.map(a=>`<div class="sq mate${a.alive?'':' dead'}"><div class="pf">${a.name.split(' ').pop().slice(0,2).toUpperCase()}</div><div><div class="nm">${a.name}${a.alive?(a.down?' · DOWN':''):' · KIA'}</div><i><b style="width:${a.alive?Math.max(0,a.hp/a.maxHp*100):0}%"></b></i></div></div>`).join('');}
function updateWaypoint(){const w=$('wp');if(!w||!w.style||!new THREE.Vector3().project)return;if(!CAMP.wp||state!=='playing'){w.style.display='none';return;}
  const p=CAMP.wp.clone().setY(2);const d=p.distanceTo(player.pos);p.project(camera);let x=p.x,y=p.y;const behind=p.z>1;if(behind){x=-x;y=-1;}
  const m=.9;x=clamp(x,-m,m);y=clamp(y,-m,m);w.style.display='';w.style.left=((x+1)/2*innerWidth)+'px';w.style.top=((1-y)/2*innerHeight)+'px';w.innerHTML=`<i></i><b>${CAMP.wpName}</b><span>${Math.round(d)} m</span>`;}
// ---------------- 结算
function campaignWin(){CAMP.wp=null;const id=CAMP.id;CAMP.outro[id](()=>campEnd(true));}
function campEnd(win){if(state==='result')return;state='result';document.exitPointerLock?.();setProgress(-1);view.visible=true;voxClear();CAMP.flags.fireSky=false;
  const L=CAMP.L,id=CAMP.id,v=loadVault();v.camp=v.camp||[];if(win&&!v.camp.includes(id))v.camp.push(id);saveVault(v);
  const t=Math.floor(CAMP.t),mm=String(Math.floor(t/60)).padStart(2,'0'),ss=String(t%60).padStart(2,'0');const lost=allies.filter(a=>!a.alive).map(a=>a.name);
  $('resTitle').textContent=win?'Mission Complete':'Fallen in Battle';$('resTitle').style.color=win?'#8fd08f':'#e05a4a';
  $('resText').textContent=win?(CAMP.L.end||'The Choral City remembers your name.'):'Your brothers fight on without you. The Legion does not forget — rise and try again.';
  const row=(a,b,c='')=>`<tr><td>${a}</td><td class="${c}">${b}</td></tr>`;
  $('resTable').innerHTML=row('Mission',`${id} · ${L.title}`)+row('Time',mm+':'+ss)+row('Enemies slain',match.kills)+row('Brothers lost',lost.length?lost.join(', '):'None',lost.length?'lost':'gain');
  const i=CORDER.indexOf(id),nx=CORDER[i+1];const nb=$('campNext'),rb=$('campRetry');
  if(nb&&nb.style){nb.style.display=win&&nx?'':'none';nb.onclick=()=>{$('result').classList.remove('show');openBrief(nx);};}
  if(rb&&rb.style){rb.style.display='';rb.textContent=win?'Replay Mission':'Retry Mission';rb.onclick=()=>{$('result').classList.remove('show');startCampaignLevel(id);};}
  $('result').classList.add('show');}
function exitCampaign(){CAMP.on=false;SC.on=false;document.body.classList.remove('inscene');CAMP.flags={};clearAllies();clearEbolts();voxClear();document.body.classList.remove('incamp');const n=$('campNext'),r=$('campRetry');if(n&&n.style)n.style.display='none';if(r&&r.style)r.style.display='none';
  if(CAMP.wave){for(const f of CAMP.wave.fogs)scene.remove(f);CAMP.wave=null;}$('wp')&&$('wp').style&&($('wp').style.display='none');}
// ---------------- 大厅：战役面板与简报
function campDone(){return(loadVault().camp)||[];}
function campUnlocked(id){if(CFG.unlockAll)return true;const i=CORDER.indexOf(id);return i<=0||campDone().includes(CORDER[i-1]);}
function openCampaign(){initAudio();const done=campDone();
  $('campActs').innerHTML=ACTS.map((A,ai)=>`<div class="cact${A.n==='III'?' live':''}"><div class="an">ACT ${A.n}</div><div class="at">${A.name}</div>`+A.lv.map((lv,li)=>{
    if(A.n!=='III')return `<div class="clv locked"><span>${ai+1}-${li+1}</span>${lv}<em>In development</em></div>`;
    const L=CLEVELS[lv],ok=campUnlocked(lv);return `<div class="clv${ok?'':' locked'}${done.includes(lv)?' done':''}" data-lv="${lv}"><span>${lv}</span>${L.title}<em>${done.includes(lv)?'Completed':ok?'Ready':'Locked'}</em></div>`;}).join('')+'</div>').join('');
  document.querySelectorAll('#campActs .clv[data-lv]').forEach(el=>el.onclick=()=>{if(!campUnlocked(el.dataset.lv))return;play('equip');openBrief(el.dataset.lv);});
  $('campaign').classList.add('show');}
let briefTimer=0;
function openBrief(id){const L=CLEVELS[id];$('campaign').classList.remove('show');$('hub').classList.remove('show');
  $('briefAct').textContent='ACT III · ISSTVAN III';$('briefTitle').textContent=L.title;$('briefPlace').textContent=L.place;
  $('briefObj').innerHTML=[...new Set(L.obj)].map(o=>`<div>◇ ${o}</div>`).join('');$('briefLog').innerHTML='';$('brief').classList.add('show');
  $('briefGo').onclick=()=>{clearTimeout(briefTimer);startCampaignLevel(id);};$('briefBack').onclick=()=>{clearTimeout(briefTimer);$('brief').classList.remove('show');enterHub();};
  let li=0;const typeLine=()=>{if(li>=L.brief.length||!$('brief').classList.contains('show'))return;const [who,text]=L.brief[li++];const row=document.createElement('div');row.className='bl';
    row.innerHTML=`<b style="color:${VOX_COL[who]||'#ddd'}">${SPEAKER[who]}</b><span></span>`;$('briefLog').appendChild(row);const sp=row.lastChild;let c=0;
    const tick=()=>{if(!$('brief').classList.contains('show'))return;sp.textContent=text.slice(0,++c);if(c%3===0&&actx)tone('square',1400,1300,.012,.02);if(c<text.length)briefTimer=setTimeout(tick,18);else briefTimer=setTimeout(typeLine,650);};tick();};
  briefTimer=setTimeout(typeLine,400);}
// ============================================================ 过场：开场与结尾
function makePodAt(x,z,y){const p=makeDropPod();p.children.forEach(c=>{if(c.geometry&&c.geometry.type==='PlaneGeometry')c.material=lmat(0x2a140a,true);});p.position.set(x,y,z);levelGroup.add(p);const door=cut.door;return {p,door};}
function podImpact(P,k=1){play('boom');play('kill');player.shake=Math.max(player.shake,.7*k);dust(P,16);ringAt(P.x,.2,P.z,0xd0b090,.5,6*k,.6,.15);for(let i=0;i<6;i++){const s=.4+Math.random()*.6;const m=new THREE.Mesh(scaleBoxUV(B3(s,s*.5,s),s,s*.5,s),matBrick);m.position.set(P.x+(Math.random()-.5)*4,H,P.z+(Math.random()-.5)*4);levelGroup.add(m);gibs.push({m,v:V3(0,-2,0),spin:V3(Math.random()*3,0,Math.random()*3),rest:false});}}
const allyById=id=>allies.find(a=>a.id===id);
CAMP.intro={
  '3-1'(){titleCard('ACT III · ISSTVAN III','The Choral City',3.6);
    const spots=[[0,0],[4.5,-4],[-4.5,-3.5],[3.5,4.5],[-4,4]],pods=[];
    const hideAll=()=>allies.forEach(a=>a.root.visible=false);hideAll();
    const P=(i)=>pods[i];
    runScene([
      {d:3.4,from:shotAt(V3(-8,6.2,9),V3(0,5,0)),to:shotAt(V3(-7,5.8,8),V3(0,4.5,0)),act(){for(const [x,z] of spots){const o=makePodAt(x,z,60+Math.random()*20);o.landed=false;o.t0=Math.random()*1.2;pods.push(o);}play('whistle');},
        tick(dt){for(const o of pods){o.t0-=dt;if(o.t0>0)continue;o.p.position.y=Math.max(0,o.p.position.y-dt*38);o.p.rotation.y+=dt*2;if(Math.random()<.6)puff(o.p.position.clone().add(V3(0,-.5,0)),1,0xff8030,1.5);
          if(o.p.position.y<=0&&!o.landed){o.landed=true;o.p.userData.jet.visible=false;podImpact(o.p.position,o===pods[0]?1.2:.7);}}}},
      {d:2.6,from:shotAt(V3(8.6,2.8,.5),V3(0,1.4,0)),to:shotAt(V3(8,2.3,-.5),V3(0,1.2,0)),act(){for(const o of pods){o.p.position.y=0;o.p.userData.jet.visible=false;if(!o.landed){o.landed=true;podImpact(o.p.position,.5);}}
          vox('loken','All loyal squads, this is Captain Loken. Praal’s rebels hold the Choral City. We take it from them.',true);},
        tick(dt,k){for(const o of pods){if(o.door)o.door.rotation.z=-Math.min(Math.PI/2,k*6);}}},
      {d:4.2,from:()=>shotAt(V3(5.5,1.9,3.5),allyById('ardan').pos.clone().setY(1.7)),to:()=>shotAt(V3(4.2,1.8,1.2),allyById('tavik').pos.clone().setY(2)),act(){allies.forEach((a,i)=>{a.root.visible=true;const o=pods[i+1]||pods[0];a.pos.set(o.p.position.x+2.2,0,o.p.position.z+(i>=4?1.2:0));a.yaw=Math.PI/2;a.root.rotation.y=a.yaw;});
          vox('ardan','Strange. He sends only those of us who spoke against the lodges.',true);vox('tavik','Hold your tongue, brother. Listen — the singing. Can you hear it?',true);}},
      {d:2.4,from:shotAt(V3(2,2.2,-3),V3(-3,1.8,5)),to:shotAt(V3(1,2,-2),V3(-4,1.6,6)),act(){vox('kaedric','Squad Vorne, on me. Eyes on the arches.',true);for(const o of pods)if(o!==pods[0])colliders.push({minX:o.p.position.x-1.4,maxX:o.p.position.x+1.4,minZ:o.p.position.z-1.4,maxZ:o.p.position.z+1.4});}}],
      ()=>{player.pos.set(2.6,0,0);player.yaw=-Math.PI/2;nextCampStep();});},
  '3-2'(){titleCard('ACT III · ISSTVAN III','Life-Eater',3.6);CAMP.flags.fireSky=true;
    runScene([
      {d:3.6,from:shotAt(V3(-3,1.8,-3),V3(6,6,6)),to:shotAt(V3(-2.5,1.6,-2.5),V3(5,6.5,5)),act(){vox('tarvitz','Any loyal ear on Isstvan Three — the fleet has dropped the Life-Eater. Get underground. NOW!',true);}},
      {d:3.6,from:()=>shotAt(allyById('tavik').pos.clone().add(V3(2.2,1.9,1.8)),allyById('tavik').pos.clone().setY(2.1)),act(){vox('tavik','He speaks the truth. Millions of souls... going out, like candles.',true);player.shake=.5;play('boom');}},
      {d:2.6,from:shotAt(V3(3,2.2,3),V3(-6,1.5,-6)),act(){vox('kaedric','Move, all of you! Follow the beacon — run!',true);}}],
      ()=>{nextCampStep();});},
  '3-3'(){titleCard('ACT III · ISSTVAN III','The Precentor’s Palace',3.6);CAMP.flags.tavikPsy=true;
    // 掩体：几道断墙围成防线
    for(const [x,z,w,d] of [[5,0,.6,3.4],[-5,0,.6,3.4],[0,5,3.4,.6],[0,-5,3.4,.6]]){const m=new THREE.Mesh(scaleBoxUV(B3(w,1.1,d),w,1.1,d),matBrick);m.position.set(x,.55,z);levelGroup.add(m);colliders.push({minX:x-w/2,maxX:x+w/2,minZ:z-d/2,maxZ:z+d/2});wallMeshes.push(m);}
    const hesk=allyById('hesk');if(hesk){hesk.pos.set(-2.5,-2,-2.5);hesk.invuln=true;}
    runScene([
      {d:3.4,from:shotAt(V3(6,2.5,6),V3(0,1.5,0)),to:shotAt(V3(5,2.2,4.5),V3(0,1.3,0)),act(){vox('loken','Drop-ships on the horizon. Sons of Horus. World Eaters. Emperor’s Children. Hold the palace as long as you can.',true);}},
      {d:4.4,from:shotAt(V3(3,1.4,3),V3(-2.5,1.5,-2.5)),to:shotAt(V3(2.4,1.2,2),V3(-2.5,3.5,-2.5)),tick(dt,k){if(hesk){hesk.pos.y=-2+Math.min(1,k*1.4)*2;player.shake=Math.max(player.shake,.15*(1-k));if(Math.random()<.5)dust(hesk.pos.clone().setY(0),2);}},
        act(){play('boom');play('grind');vox('hesk','Who wakes me...? Ah. Brothers. I have slept since Ullanor. Show me the foe.',true);}},
      {d:2.4,from:shotAt(V3(-3,2,4),V3(3,1.6,-3)),act(){if(hesk)hesk.pos.y=0;vox('kaedric','Positions! Nobody falls back past these walls.',true);}}],
      ()=>{if(hesk){hesk.pos.y=0;hesk.invuln=false;hesk.hold=V3(-3,0,-3);}for(const a of allies)if(a.id!=='hesk')a.hold=V3((Math.random()-.5)*6,0,(Math.random()-.5)*6);player.pos.set(1.5,0,1.5);nextCampStep();});}};
CAMP.outro={
  '3-1'(done){CLEVELS['3-1'].end='The Sirenhold falls. Above, the fleet is silent — too silent.';
    runScene([
      {d:3.6,from:()=>shotAt(player.pos.clone().add(V3(4,2.4,4)),player.pos.clone().setY(1.6)),act(){vox('loken','The Sirenhold is ours. Well fought, all of you.',true);}},
      {d:4.4,from:()=>{const t=allyById('tavik')||allies[0];return shotAt(t.pos.clone().add(V3(1.8,2,1.6)),t.pos.clone().setY(2.1));},act(){vox('tavik','Captain... the fleet above. I cannot feel their minds. It is as if they have already mourned us.',true);}},
      {d:3.2,from:()=>shotAt(player.pos.clone().add(V3(-3,1.6,2)),player.pos.clone().add(V3(4,5,-4))),act(){vox('ardan','Mourned? We have won.',true);$('fade').style.opacity=0;},tick(dt,k){$('fade').style.opacity=Math.max(0,k*1.6-.6);}}],done);},
  '3-2'(done){CLEVELS['3-2'].end='The firestorm passes overhead. In the dark below the palace, a handful of loyal hearts still beat.';
    const bc=cellC(...CAMP.target),door=new THREE.Mesh(B3(4,4,.5),lmat(0x3a3a38));door.position.set(bc.x+3,6,bc.z);door.rotation.y=Math.PI/2;levelGroup.add(door);
    for(const a of allies)if(a.alive){a.hold=bc.clone().add(V3((Math.random()-.5)*4,0,(Math.random()-.5)*4));}
    runScene([
      {d:2.4,from:shotAt(bc.clone().add(V3(-3,1.8,-2)),bc.clone().add(V3(3,2,0))),tick(dt,k){door.position.y=Math.max(2,6-k*5);if(k>.8&&!door.userData.s){door.userData.s=1;play('boom');play('clang');player.shake=.8;}}},
      {d:3,from:shotAt(bc.clone().add(V3(-3,1.8,-2)),bc.clone().add(V3(3,2,0))),act(){vox('tavik','Hold... hold the shield... I have you...',true);play('boom');},tick(dt,k){player.shake=Math.max(player.shake,.5);$('fade').style.background='#fff4e0';$('fade').style.opacity=Math.sin(k*Math.PI)*.85;}},
      {d:3,from:shotAt(bc.clone().add(V3(-2,1.2,-1)),bc.clone().add(V3(2,1,1))),act(){$('fade').style.background='';$('fade').style.opacity=0;vox('krosk','...It’s quiet. Are we... alive?',true);vox('tavik','For now.',true);}}],done);},
  '3-3'(done){CLEVELS['3-3'].end='Isstvan III burns. Beneath the rubble, Kaedric Vorne still breathes. — To be continued: Act IV, The Drop Site Massacre.';
    runScene([
      {d:3.6,from:()=>shotAt(player.pos.clone().add(V3(3,1.8,3)),player.pos.clone().setY(1.2)),act(){vox('malk','He promised us... the stars, Kaedric. All of them...',true);}},
      {d:4.6,from:()=>shotAt(player.pos.clone().add(V3(5,3,5)),player.pos.clone().setY(1.5)),to:()=>shotAt(player.pos.clone().add(V3(2,2.5,2)),player.pos.clone().setY(3)),
        act(){vox('loken','Orbital strike — the palace is coming down! Get to cover!',true);play('boom');},
        tick(dt,k){player.shake=Math.max(player.shake,.4+k*.6);if(Math.random()<dt*14){const s=.5+Math.random()*1.2;const m=new THREE.Mesh(scaleBoxUV(B3(s,s*.6,s),s,s*.6,s),matBrick);m.position.set(player.pos.x+(Math.random()-.5)*14,H,player.pos.z+(Math.random()-.5)*14);levelGroup.add(m);gibs.push({m,v:V3(0,-4,0),spin:V3(Math.random()*3,0,Math.random()*3),rest:false});if(Math.random()<.3)play('boom');}
          $('fade').style.opacity=Math.max(0,(k-.55)*2.2);}},
      {d:3.4,from:()=>shotAt(player.pos.clone().add(V3(1,1,1)),player.pos.clone().setY(3)),act(){$('fade').style.opacity=1;titleCard('ISSTVAN III','Beneath the rubble, Kaedric Vorne still breathes.',3.4);}}],done);}};
// ---------------- 第二关：维尔被落石砸死
function vellCrushed(v){const P=v.pos.clone();const m=new THREE.Mesh(scaleBoxUV(B3(2.2,1.4,2.2),2.2,1.4,2.2),matBrick);m.position.set(P.x,H,P.z);levelGroup.add(m);
  vox('vell','The ceiling —',true);CAMP.timers.push({t:.45,f:()=>{m.position.y=.7;play('boom');play('rip');player.shake=Math.max(player.shake,.4);dust(P,20);allyDie(v,true);spawnBlood(P.clone().setY(.4),null,40);
    vox('ardan','VELL! — No... keep moving! He would want us to keep moving!',true);colliders.push({minX:P.x-1.1,maxX:P.x+1.1,minZ:P.z-1.1,maxZ:P.z+1.1});}});}
// ---------------- 第三关：赫斯克的最后一战、马尔克登场
function heskLastStand(){const h=allyById('hesk');if(!h||!h.alive){return;}
  const sw=campSpawn('we',0,0,4,{at:h.pos.clone().add(V3(3,0,3))});for(const e of sw)e.dmg*=1.5;
  runScene([
    {d:3,from:()=>shotAt(h.pos.clone().add(V3(5,3,4)),h.pos.clone().setY(2.5)),act(){vox('hesk','They come for the gate. Then the gate is where I stand.',true);}},
    {d:3,from:()=>shotAt(h.pos.clone().add(V3(4,2,-3)),h.pos.clone().setY(2.2)),act(){vox('hesk','I held at Ullanor... I hold here. Go, Kaedric. LIVE!',true);play('bolter');},tick(dt,k){if(Math.random()<dt*10)allyShoot(h,sw.find(e=>e.alive)||sw[0]);player.shake=Math.max(player.shake,.15);}},
    {d:2.6,from:()=>shotAt(h.pos.clone().add(V3(6,3,6)),h.pos.clone().setY(1.8)),act(){const P=h.pos.clone().setY(1.5);ringAt(P.x,1,P.z,0xff8030,.5,8,.6,.3);puff(P,20,0x3a2a1a,2);hitSparks(P,V3(0,1,0),20);play('boom');play('melta');player.shake=1;
        allyDie(h,true);for(const e of sw)if(e.alive&&e.g.position.distanceTo(h.pos)<5)damageEnemy(e,999,'body',e.g.position.clone().sub(h.pos).normalize(),{_remote:true,explode:true,how:{burst:{p:P,dir:e.g.position.clone().sub(P).normalize()}}});}},
    {d:2.2,from:()=>shotAt(player.pos.clone().add(V3(-2,1.9,2)),h.pos.clone().setY(1)),act(){vox('krosk','The Ancient is gone... Make them pay for every step!',true);}}],null,{sim:false});}
function malkArrives(){const P=V3(4,0,-4);
  runScene([
    {d:2.4,from:shotAt(V3(-1,2,3),V3(4,5,-4)),act(){vox('malk','Kaedric!',true);play('whoosh');}},
    {d:1.2,from:shotAt(V3(0,1.6,2),P.clone().setY(1.8)),act(){const m=spawnEnemy('malk',P.x,P.z);m.campaign=true;CAMP.malk=m;m.g.position.y=6;m.leap={t:0,dur:.9,from:V3(P.x,6,P.z-3),to:P.clone()};campSpawn('soh',0,0,2,{at:P.clone().add(V3(2,0,-1))});},
      tick(dt){if(CAMP.malk&&CAMP.malk.leap){CAMP.malk.leap.t+=dt;const k=Math.min(1,CAMP.malk.leap.t/.9);CAMP.malk.g.position.copy(CAMP.malk.leap.from).lerp(CAMP.malk.leap.to,k);CAMP.malk.g.position.y=(1-k)*6;
        if(k>=1){CAMP.malk.leap=null;CAMP.malk.g.position.y=0;dust(P,20);play('boom');player.shake=.7;}}}},
    {d:4.4,from:()=>shotAt(CAMP.malk.g.position.clone().add(V3(-2.2,1.9,2.6)),CAMP.malk.g.position.clone().setY(2.4)),act(){if(CAMP.malk){CAMP.malk.leap=null;CAMP.malk.g.position.y=0;CAMP.malk.g.rotation.y=Math.atan2(player.pos.x-P.x,player.pos.z-P.z);}
        vox('malk','I asked them to let me be the one. You should have come to the lodge, brother.',true);}},
    {d:2.8,from:()=>shotAt(player.pos.clone().add(V3(1.5,2,1.5)),CAMP.malk.g.position.clone().setY(2)),act(){vox('kaedric','You were my brother, Oren. Now you are only a traitor.',true);}}],
    ()=>{CAMP.wp=null;},{sim:false});}
$('campBtn').onclick=()=>{play('equip');openCampaign();};
$('campClose').onclick=()=>{$('campaign').classList.remove('show');};
