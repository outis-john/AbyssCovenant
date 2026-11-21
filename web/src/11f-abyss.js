// ============================================================ 深渊侵蚀 → 被拖入深渊彼岸 → 邪神赐福（四位原创邪神）
const GODS={
  blood: {name:'Blood King',realm:'Throne of Blood',color:0xc01010,css:'#ff3030',daemon:'dblood', fog:0x2a0404,bg:0x180202,lamp:0xff2010,whisper:'Blood... more blood for the throne...',
    bless:'Blessing of Blood',desc:'Melee damage +40%, melee lifesteal 10%; gun damage -20%'},
  decay: {name:'Mother of Rot',realm:'Garden of Rot',color:0x6a8a20,css:'#a0d040',daemon:'ddecay', fog:0x1a2206,bg:0x0e1404,lamp:0x90c030,whisper:'Don’t be afraid, child... decay is eternity...',
    bless:'Blessing of Rot',desc:'Max HP +50%, regen 2 HP/s, damage taken -15%; move speed -15%'},
  excess:{name:'Lord of Excess',realm:'Palace of Excess',color:0xd040a0,css:'#ff60c0',daemon:'dexcess',fog:0x240616,bg:0x14040e,lamp:0xff50c0,whisper:'Faster... more... again...',
    bless:'Blessing of Excess',desc:'Move speed +25%, attack speed +25%; damage taken +15%'},
  change:{name:'Eye of Change',realm:'Labyrinth of Change',color:0x3080ff,css:'#60a0ff',daemon:'dchange',fog:0x061430,bg:0x040a1c,lamp:0x4080ff,whisper:'Everything can change... even you...',
    bless:'Blessing of Change',desc:'Psy cooldowns -50%, psy regen ×2, overload no longer backlashes (burns 5 HP); max HP -20%'}};
const HELL={on:false,t:0,god:null,wave:0,aff:{blood:0,decay:0,excess:0,change:0}};
function taintAffinity(g,n){HELL.aff[g]=(HELL.aff[g]||0)+n;}
function addTaint(n,g){if(HELL.on||state!=='playing')return;player.taint=Math.min(100,(player.taint||0)+n);if(g)taintAffinity(g,n/4);}
function pickGod(){return Object.entries(HELL.aff).sort((a,b)=>b[1]-a[1])[0][0];}
function updateAbyss(dt){if(!match)return;
  const r=player.ovl/player.maxOvl;if(r>0.4&&!HELL.on)addTaint(dt*(r-0.4)*CFG.taint.ovlRate,'change');
  if(!HELL.on&&player.taint>=100&&state==='playing')enterHell(Object.keys(GODS)[Math.floor(Math.random()*4)]);
  if(!HELL.on&&r<0.2)player.taint=Math.max(0,(player.taint||0)-dt*1.5);   // 不用灵能时侵蚀慢慢消退
  if(player.bless==='decay')player.hp=Math.min(player.maxHp,player.hp+2*dt);
  if(HELL.on){HELL.t-=dt;const G=GODS[HELL.god],k=1-HELL.t/CFG.taint.hell;setProgress(k,'Falling');
    $('hellTint').style.opacity=.45+Math.sin(gameTime*4)*.2;player.warp=Math.max(player.warp||0,.6);player.shake=Math.max(player.shake,.08+k*.12);
    HELL.wT=(HELL.wT||0)-dt;if(HELL.wT<=0){HELL.wT=1.6;announce(G.whisper,1.5);play('backlash');}
    if(HELL.t<=0)exitHell();}
  else $('hellTint').style.opacity=player.corrupt?.12+Math.sin(gameTime*1.3)*.06:0;
  updateGodSkill(dt);
  $('taint').firstElementChild.style.width=(player.taint||0)+'%';$('taintTxt').textContent=Math.round(player.taint||0)+'%';
  const B=player.bless&&GODS[player.bless];$('blessTag').innerHTML=B?`<span style="color:${B.css}">◆ ${B.bless}</span>`:'';}
function realmVisual(G){scene.fog.color.setHex(G.fog);scene.fog.density=.055;scene.background.setHex(G.bg);for(const l of candleLights)l.color.setHex(G.lamp);
  matBrick.color.setHex(G.color).lerp(new THREE.Color(0xffffff),.45);$('hellTint').style.background=`radial-gradient(ellipse at center,transparent 40%,${G.css} 140%)`;}
// 侵蚀满了：随机一位邪神开始腐化你（6 秒堕落过程，期间不会受伤），结束后获得赐福 + 专属灵能技能，画面留下扭曲
function enterHell(god){HELL.on=true;HELL.god=god;HELL.t=CFG.taint.hell;HELL.wT=0;const G=GODS[god];
  realmVisual(G);play('backlash');play('hole');player.shake=.6;
  ultBanner(G.realm,{color:G.css,sub:`${G.name} claims you. Your soul is being reshaped...`});}
function exitHell(){HELL.on=false;player.taint=0;applyBiome();setProgress(-1);
  const G=GODS[HELL.god];grantBless(HELL.god);player.godSkill=HELL.god;player.godCd=0;player.corrupt=(player.corrupt||0)+1;
  $('hellTint').style.background=`radial-gradient(ellipse at center,transparent 45%,${G.css} 150%)`;
  ultBanner(G.bless,{color:G.css,sub:`${G.desc} · New power: [Y] ${GOD_SKILL[HELL.god].name}`});play('choir');}
function corruptFilter(){if(!player.corrupt||state==='hub')return'';const c=Math.min(3,player.corrupt);return ` hue-rotate(${Math.sin(gameTime*.9)*8*c}deg) blur(${(.25+Math.sin(gameTime*2.3)*.2)*c}px) contrast(${1+.05*c})`;}
function stopAllLoops(){if(typeof loops!=='undefined')for(const k of Object.keys(loops))loopSound(k,false);if(typeof whisperGain!=='undefined'&&whisperGain)whisperGain.gain.value=0;
  if(HELL.on){HELL.on=false;applyBiome();}$('hellTint').style.opacity=0;}
function grantBless(god){const old=player.bless;if(old===god)return;
  if(old)revertBless(old);player.bless=god;
  if(god==='blood'){player.gunMul*=.8;WEAPONS[2].dmg*=1.4;}
  if(god==='decay'){player.maxHp=Math.round(player.maxHp*1.5);player.hp=Math.min(player.maxHp,player.hp+player.maxHp*.3);player.dmgTaken*=.85;player.speedMul=(player.speedMul||1)*.85;}
  if(god==='excess'){player.speedMul=(player.speedMul||1)*1.25;player.atkSpd=1.25;player.dmgTaken*=1.15;}
  if(god==='change'){player.maxHp=Math.round(player.maxHp*.8);player.hp=Math.min(player.hp,player.maxHp);}}
function revertBless(god){if(god==='blood'){player.gunMul/=.8;WEAPONS[2].dmg/=1.4;}
  if(god==='decay'){player.maxHp=Math.round(player.maxHp/1.5);player.hp=Math.min(player.hp,player.maxHp);player.dmgTaken/=.85;player.speedMul/=.85;}
  if(god==='excess'){player.speedMul/=1.25;player.atkSpd=1;player.dmgTaken/=1.15;}
  if(god==='change'){player.maxHp=Math.round(player.maxHp/.8);}}
// 仆从由房主生成（队友发请求）
function spawnDaemons(type,n,x=player.pos.x,z=player.pos.z){if(isClient()){sendNet({t:'daemons',type,n,x,z});return;}
  for(let k=0;k<n;k++){const a=Math.random()*6.28;const e=spawnEnemy(type,x+Math.cos(a)*7,z+Math.sin(a)*7);e.daemon=true;embersBlue(e.g.position.clone().setY(1),8);}play('growl');}
function resetAbyss(){player.godSkill=null;player.corrupt=0;decoys.forEach(d=>scene.remove(d.m));decoys=[];HELL.on=false;HELL.god=null;for(const k in HELL.aff)HELL.aff[k]=0;player.taint=0;player.bless=null;player.atkSpd=1;$('hellTint').style.opacity=0;}
// 仆从外观：在基础恶魔上换形
Object.assign(ENEMY_BUILD,{
  dblood:e=>{ENEMY_BUILD.hound(e);for(const s of [-1,1]){const h=new THREE.Mesh(new THREE.ConeGeometry(.1,.6,4),new THREE.MeshLambertMaterial({color:0x2a0a0a}));h.position.set(s*.25,.45,.1);h.rotation.z=-s*.5;e.parts.head.add(h);}e.daemon=true;},
  ddecay:e=>{ENEMY_BUILD.bloater(e);e.fuse=-1;e.daemon=true;},
  dexcess:e=>{e.parts.body.scale.set(.75,1.1,.7);for(const s of ['armL','armR']){const c=new THREE.Mesh(new THREE.BoxGeometry(.12,.12,.5),new THREE.MeshLambertMaterial({color:0xf0c0e0}));c.position.set(0,-.5,.25);e.parts[s].add(c);}e.daemon=true;},
  dchange:e=>{const h=new THREE.Mesh(new THREE.TorusGeometry(.3,.05,4,12),new THREE.MeshBasicMaterial({color:0x60c0ff}));h.rotation.x=Math.PI/2;h.position.y=.5;e.parts.head.add(h);e.daemon=true;}});
ENEMY_AI.dblood=(...a)=>ENEMY_AI.hound(...a);
