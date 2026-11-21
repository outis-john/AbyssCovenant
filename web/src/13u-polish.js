// ============================================================ 战役打磨：主角身份、剧情配乐、存档继续、难度
// ---------------- 主角身份：战役里你就是 Kaedric Vorne / Corvan Thale（名字、徽记、军团涂装）；机甲职业不出战役
const HERO={3:{name:'Sgt. Kaedric Vorne',tag:'KV',col:0x4a8474},4:{name:'Brother Corvan Thale',tag:'CT',col:0x1e1f22}};
const heroNow=()=>CAMP.on&&CAMP.id?(HERO[CAMP.id]||HERO[CAMP.id[0]]):null;
function hudHeroName(def){const h=heroNow();return h?h.name:def;}
function heroPaint(g){const h=heroNow();if(!h||!g||!g.traverse)return;g.traverse(o=>{if(o.isMesh&&o.material&&o.material.map===texMetal){o.material=o.material.clone();o.material.color.setHex(h.col);}});}
const MECH=['walker','redeemer'];
// ---------------- 难度
const DIFF=[{n:'Legionary',d:'Enemies hit softer · 3 fire support · long bleed-out',hp:.75,dmg:.6,fs:3,bleed:32},{n:'Veteran',d:'The intended experience',hp:1,dmg:1,fs:2,bleed:22},
  {n:'Primarch',d:'Tougher, deadlier enemies · 1 fire support · short bleed-out',hp:1.35,dmg:1.3,fs:1,bleed:13}];
const diffNow=()=>{const v=loadVault();return DIFF[v.campDiff??1]||DIFF[1];};
const _seU=spawnEnemy;spawnEnemy=function(...a){const e=_seU(...a);if(CAMP.on&&e){const D=diffNow();e.hp*=D.hp;e.maxHp*=D.hp;e.dmg*=D.dmg;}return e;};
function renderDiff(){const el=$('briefDiff');if(!el||el.innerHTML===undefined)return;const v=loadVault(),cur=v.campDiff??1;
  el.innerHTML=DIFF.map((D,i)=>`<button class="dbtn${i===cur?' on':''}" data-d="${i}"><b>${D.n}</b><small>${D.d}</small></button>`).join('');
  if(el.querySelectorAll)el.querySelectorAll('.dbtn').forEach(b=>b.onclick=()=>{const v=loadVault();v.campDiff=+b.dataset.d;saveVault(v);play('equip');renderDiff();});}
const _obU=openBrief;openBrief=function(id){_obU(id);renderDiff();};
// ---------------- 剧情配乐：全部用 WebAudio 现场合成，按拍子提前排程（每帧，不用 setInterval）
const SM={bus:null,theme:null,next:0,beat:0,bars:0};
const NOTE=s=>{const m={C:0,'C#':1,Db:1,D:2,'D#':3,Eb:3,E:4,F:5,'F#':6,Gb:6,G:7,'G#':8,Ab:8,A:9,'A#':10,Bb:10,B:11};const r=s.match(/^([A-G][#b]?)(\d)$/);return 440*Math.pow(2,(m[r[1]]+(+r[2]+1)*12-69)/12);};
const chord=(...n)=>n.map(NOTE);
const THEMES={
  // 不祥：低音弦乐 + 小二度不协和 + 缓慢定音鼓（病毒轰炸、背叛）
  dread:{bpm:66,loop:true,pad:'sawtooth',cut:520,vol:.05,chords:[chord('C2','G2','Eb3','D4'),chord('Db2','Ab2','F3','C4'),chord('C2','G2','Eb3','B3'),chord('Gb1','Db2','A2','C4')],
    drums:{0:'timp',2:'tom',8:'timp',11:'tom',12:'tom'},sub:4,high:[NOTE('C5'),NOTE('Db5')]},
  // 挽歌：温暖的弦乐垫 + 人声般的独唱（费鲁斯之死、兄弟牺牲）
  lament:{bpm:54,loop:false,bars:8,pad:'triangle',cut:1300,vol:.06,chords:[chord('D2','A2','F3','D4'),chord('Bb1','F2','D3','F4'),chord('F2','C3','A3','C4'),chord('A1','E2','C#3','E4')],
    voice:[['A4',0,3],['G4',3,1],['F4',4,2],['D4',6,2],['F4',8,2],['A4',10,2],['C5',12,3],['A4',15,1],['E4',16,4],['C#4',20,4],['D4',24,6],[null,30,2],['F4',32,2],['E4',34,2],['D4',36,4]],sub:1},
  // Boss：132 拍的鼓、铜管切分、合唱垫
  boss:{bpm:132,loop:true,pad:'sawtooth',cut:900,vol:.045,chords:[chord('E2','B2','G3','E4'),chord('C2','G2','E3','C4'),chord('D2','A2','F#3','D4'),chord('B1','F#2','D#3','B3')],
    drums:{0:'kick',4:'snare',6:'kick',8:'kick',10:'kick',12:'snare',14:'tom',15:'tom'},sub:4,brass:[2,7,10],choir:true},
  // 胜利：铜管 + 管风琴，定音鼓滚奏开场
  victory:{bpm:76,loop:false,bars:6,pad:'square',cut:1800,vol:.035,chords:[chord('C2','G2','E3','C4'),chord('F2','C3','A3','F4'),chord('G2','D3','B3','G4'),chord('C2','G2','E3','E4')],
    drums:{0:'timp',8:'timp'},sub:4,brass:[0,6],roll:true},
  // 空降：紧张的上行脉冲 + 重击
  drop:{bpm:104,loop:false,bars:4,pad:'sawtooth',cut:700,vol:.04,chords:[chord('A1','E2','A2','C4'),chord('A1','E2','B2','D4'),chord('A1','F2','C3','E4'),chord('E1','B1','G#2','E4')],
    drums:{0:'kick',3:'kick',8:'kick',11:'kick',12:'tom',13:'tom',14:'tom',15:'snare'},sub:4,pulse:true}};
function smBus(){if(!actx)return null;if(!SM.bus){SM.bus=actx.createGain();SM.bus.gain.value=0;SM.bus.connect(master||actx.destination);}return SM.bus;}
function smEnv(g,t,a,peak,hold,rel){g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(peak,t+a);g.gain.setValueAtTime(peak,t+a+hold);g.gain.exponentialRampToValueAtTime(.0001,t+a+hold+rel);}
function smPad(f,t,dur,T){const B=smBus();const lp=actx.createBiquadFilter();lp.type='lowpass';lp.frequency.value=T.cut;const g=actx.createGain();smEnv(g,t,.5,T.vol,Math.max(.1,dur-.6),.9);lp.connect(g).connect(B);
  for(const det of [-6,6]){const o=actx.createOscillator();o.type=T.pad;o.frequency.value=f;o.detune.value=det;o.connect(lp);o.start(t);o.stop(t+dur+1.2);}}
function smVoice(f,t,dur){const B=smBus();const o=actx.createOscillator();o.type='sawtooth';o.frequency.value=f;const lfo=actx.createOscillator();lfo.frequency.value=5.3;const lg=actx.createGain();lg.gain.value=f*.012;lfo.connect(lg).connect(o.frequency);
  const b1=actx.createBiquadFilter();b1.type='bandpass';b1.frequency.value=800;b1.Q.value=4;const b2=actx.createBiquadFilter();b2.type='bandpass';b2.frequency.value=1150;b2.Q.value=6;const g=actx.createGain();smEnv(g,t,.25,.09,Math.max(.1,dur-.4),.6);
  o.connect(b1).connect(g);o.connect(b2).connect(g);g.connect(B);o.start(t);lfo.start(t);o.stop(t+dur+.8);lfo.stop(t+dur+.8);}
function smBrass(f,t,dur){const B=smBus();const lp=actx.createBiquadFilter();lp.type='lowpass';lp.frequency.setValueAtTime(350,t);lp.frequency.linearRampToValueAtTime(2600,t+.08);lp.frequency.exponentialRampToValueAtTime(700,t+dur);
  const g=actx.createGain();smEnv(g,t,.03,.05,dur*.6,.25);lp.connect(g).connect(B);for(const det of [-8,0,8]){const o=actx.createOscillator();o.type='sawtooth';o.frequency.value=f;o.detune.value=det;o.connect(lp);o.start(t);o.stop(t+dur+.4);}}
function smDrum(k,t){const B=smBus();const g=actx.createGain();g.connect(B);
  if(k==='kick'||k==='timp'||k==='tom'){const o=actx.createOscillator();o.type='sine';const f0=k==='kick'?130:k==='tom'?110:70,f1=k==='kick'?40:k==='tom'?65:58;o.frequency.setValueAtTime(f0,t);o.frequency.exponentialRampToValueAtTime(f1,t+(k==='timp'?.8:.18));
    smEnv(g,t,.005,k==='timp'?.32:k==='kick'?.42:.25,.02,k==='timp'?1.3:k==='kick'?.3:.45);o.connect(g);o.start(t);o.stop(t+1.6);}
  if(k==='snare'||k==='timp'){const s=actx.createBufferSource();s.buffer=noiseBuf;const f=actx.createBiquadFilter();f.type=k==='snare'?'bandpass':'lowpass';f.frequency.value=k==='snare'?1900:200;const g2=actx.createGain();smEnv(g2,t,.003,k==='snare'?.18:.12,.01,k==='snare'?.18:.6);s.connect(f).connect(g2).connect(B);s.start(t);s.stop(t+.9);}}
function playTheme(name){if(!actx)return;try{initAudio();}catch(err){}if(SM.theme===name)return;smBus();const t=actx.currentTime;SM.bus.gain.cancelScheduledValues(t);SM.bus.gain.setTargetAtTime((SET.music??60)/100*.9,t,.4);
  SM.theme=name;SM.next=t+.08;SM.beat=0;SM.bars=0;}
function stopTheme(fade=1.5){if(!SM.bus||!SM.theme)return;SM.theme=null;SM.bus.gain.setTargetAtTime(0,actx.currentTime,fade/3);}
function updateTheme(){if(!actx||!SM.theme)return;const T=THEMES[SM.theme];const spb=60/T.bpm/(T.sub||1);
  while(SM.next<actx.currentTime+.35){const b=SM.beat,per=4*(T.sub||1),inBar=b%per,bar=Math.floor(b/per),ch=T.chords[bar%T.chords.length],t=SM.next;
    if(!T.loop&&bar>=T.bars){stopTheme(3);return;}
    if(inBar===0){for(const f of ch)smPad(f,t,spb*per,T);if(T.roll&&bar===0)for(let i=0;i<12;i++)smDrum('timp',t+i*.06);if(T.choir)smVoice(ch[3],t,spb*per*.9);}
    if(T.drums&&T.drums[inBar])smDrum(T.drums[inBar],t);
    if(T.brass&&T.brass.includes(inBar))smBrass(ch[2]*2,t,spb*2.5);
    if(T.pulse)smBrass(ch[0]*4*(1+inBar/per*.06),t,spb*.5);
    if(T.high&&inBar%8===0&&Math.random()<.6){const o=actx.createOscillator(),g=actx.createGain();o.type='sine';o.frequency.value=T.high[(bar+inBar)%2];smEnv(g,t,1,.012,spb*4,1.5);o.connect(g).connect(smBus());o.start(t);o.stop(t+spb*8);}
    if(T.voice){const beatAbs=b;for(const [n,at,len] of T.voice)if(n&&at===beatAbs%(T.bars*4))smVoice(NOTE(n),t,len*spb);}
    SM.next+=spb;SM.beat++;}}
// 剧情配乐时把动态配乐压低
const _miU=musicIntensity;musicIntensity=function(dt){_miU(dt);if(SM.theme&&MUS.bus&&actx)MUS.bus.gain.setTargetAtTime((SET.music??60)/100*.5*.2,actx.currentTime,.4);};
// 触发点
const _cIntroU={...CAMP.intro};for(const k of Object.keys(CAMP.intro)){const f=CAMP.intro[k];CAMP.intro[k]=function(){playTheme(k==='3-2'?'dread':'drop');return f.apply(this,arguments);};}
const _btU=betrayalScene;betrayalScene=function(){playTheme('dread');return _btU();};
const _gfU=gorgonFalls;gorgonFalls=function(){playTheme('lament');return _gfU();};
const _vcU=vellCrushed;vellCrushed=function(v){playTheme('lament');return _vcU(v);};
const _vsU=victoryScene;victoryScene=function(done){playTheme('victory');return _vsU(done);};
const _bfU=bossFallScene;bossFallScene=function(e){stopTheme(.6);const r=_bfU(e);playTheme(CAMP.id==='4-3'?'lament':'victory');return r;};
for(const id of ['4-2','4-3','3-3']){const f=CAMP.outro[id];if(f)CAMP.outro[id]=function(done){playTheme('lament');return f.call(this,done);};}
function themeDirector(){if(!CAMP.on||state!=='playing')return;const boss=enemies.find(e=>e.alive&&e.named&&e.campaign!==false);
  if(boss&&SM.theme!=='boss'&&boss.g.position.distanceTo(player.pos)<60)playTheme('boss');
  else if(!boss&&SM.theme==='boss')stopTheme();
  if(SM.theme==='dread'&&((CAMP.id==='3-2'&&CAMP.step>=2)||(CAMP.id==='4-2'&&CAMP.step>=3)))stopTheme(4);}
// ---------------- 存档：检查点写进本地，战役面板出现“继续”
const STATIC_ALLIES=new Set(Object.keys(ALLY_DEFS));
const mapKey=m=>{if(!m)return null;for(const k of Object.keys(MAPS))if(MAPS[k]===m)return k;return null;};
const colKey=c=>{for(const k of Object.keys(TITANCOL))if(TITANCOL[k]===c)return k;return 'loyal';};
function serCk(ck){return {id:ck.id,step:ck.step,map:mapKey(ck.map),pos:[ck.pos.x,ck.pos.z],yaw:ck.yaw,
  allies:ck.allies.map(a=>({id:a.id,veh:a.veh,hold:a.hold?[a.hold.x,a.hold.z]:null,def:STATIC_ALLIES.has(a.id)?null:ALLY_DEFS[a.id]})),
  titans:ck.titans.map(([c,p,o])=>[colKey(c),p.map(v=>[v.x,v.z]),o||{}]),camp:{...ck.camp,bunker:ck.camp.bunker?[ck.camp.bunker.x,ck.camp.bunker.z]:null},t:ck.t,kills:ck.kills,when:Date.now(),obj:(CLEVELS[ck.id].obj||[])[Math.min(ck.step,(CLEVELS[ck.id].obj||[]).length-1)]||''};}
function deserCk(s){for(const a of s.allies)if(a.def&&!ALLY_DEFS[a.id])ALLY_DEFS[a.id]=a.def;
  return {id:s.id,step:s.step,map:s.map?MAPS[s.map]:null,pos:V3(s.pos[0],0,s.pos[1]),yaw:s.yaw,allies:s.allies.map(a=>({id:a.id,veh:a.veh,name:'',hold:a.hold?V3(a.hold[0],0,a.hold[1]):null})),
    titans:s.titans.map(([c,p,o])=>[TITANCOL[c]||TITANCOL.loyal,p.map(([x,z])=>V3(x,0,z)),o]),camp:{...s.camp,bunker:s.camp.bunker?V3(s.camp.bunker[0],0,s.camp.bunker[1]):undefined},t:s.t,kills:s.kills};}
const _skU=saveCk;saveCk=function(step){_skU(step);if(CKPT&&CKPT.id===CAMP.id&&CKPT.step===step){try{const v=loadVault();v.campSave=serCk(CKPT);saveVault(v);}catch(err){}}};
function continueCampaign(){const v=loadVault();if(!v.campSave)return;try{CKPT=deserCk(v.campSave);}catch(err){v.campSave=null;saveVault(v);return;}$('campaign').classList.remove('show');restoreCheckpoint();}
const _ocU=openCampaign;openCampaign=function(){_ocU();const v=loadVault(),S=v.campSave,box=$('campActs');if(!S||!box||box.innerHTML===undefined||!CLEVELS[S.id])return;
  const L=CLEVELS[S.id];const ago=Math.max(1,Math.round((Date.now()-(S.when||Date.now()))/60000));
  box.innerHTML=`<div class="ccont" id="campCont"><div class="cct">CONTINUE</div><div class="ccl">${S.id} · ${L.title}</div><div class="cco">◆ ${S.obj||''}</div><div class="ccw">Checkpoint saved ${ago<60?ago+' min':Math.round(ago/60)+' h'} ago · ${(DIFF[v.campDiff??1]||DIFF[1]).n}</div></div>`+box.innerHTML;
  const c=$('campCont');if(c)c.onclick=()=>{play('equip');continueCampaign();};};
const _ceU=campEnd;campEnd=function(win){_ceU(win);stopTheme(win?4:1.5);if(win){const v=loadVault();if(v.campSave&&v.campSave.id===CAMP.id){v.campSave=null;saveVault(v);}}};
// ---------------- 开局：机甲换成军团战士、难度决定火力支援次数、保存难度
const _sclU=startCampaignLevel;startCampaignLevel=function(id){if(MECH.includes(cls)){CAMP.prevCls=cls;cls='ward';}const restoring=!!CAMP.restoring;_sclU(id);
  if(CAMP.prevCls)announce('Dreadnought frames do not deploy with the Legion here — you fight as a Legionary',3);if(!restoring)CAMP.fs=diffNow().fs;};
const _xcU=exitCampaign;exitCampaign=function(){_xcU.apply(null,arguments);stopTheme(1);if(CAMP.prevCls){cls=CAMP.prevCls;CAMP.prevCls=null;}};
// 倒地等待时间随难度变化
function diffBleed(){const D=diffNow();for(const a of allies)if(a.alive&&a.down&&a.bleed>0&&!a.bleedScaled){a.bleedScaled=true;if(a.bleed>=20&&a.bleed<=23)a.bleed=D.bleed;}}
const _ucU=updateCampaign;updateCampaign=function(dt){_ucU(dt);themeDirector();diffBleed();updateTheme();};
const _usU=updateScene;updateScene=function(dt){_usU(dt);updateTheme();};
