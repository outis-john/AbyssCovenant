// ============================================================ 对局流程
function updateMatch(dt){
  {const [ci,cj]=cellOf(player.pos);match.explored.add(ci+','+cj);}
  // 刷怪潮
  if(isClient()){if(match.hack>=0&&match.hack<8)setProgress(match.hack/8);else if(match.launching>=0)setProgress(1-match.launching/7);else if(match.ritual>=0&&match.ritual<12)setProgress(match.ritual/12);else setProgress(-1);}
  else{waveTimer-=dt;if(waveTimer<=0){waveTimer=CFG.wave.interval;spawnWave(CFG.wave.size,false);annTeam('远处传来裂隙撕开的声音……',2);}}
  // 终端破解
  const term=interactables.find(i=>i.type==='terminal');
  if(!isClient()&&term&&match.hack>=0&&match.hack<8){if(anyPlayerNear(term.x,term.z,6)){match.hack+=dt;if(Math.random()<dt*0.25)spawnWave(1,true);}
    setProgress(match.hack/8,'破解中');if(match.hack>=8){addProgress('hack',1);term.used=true;annTeam('终端破解完成',2);setProgress(-1);}}
  // 仪式法阵
  const rit=interactables.find(i=>i.type==='ritual');
  if(!isClient()&&rit&&!rit.used){const inside=anyPlayerNear(rit.x,rit.z,3);
    if(inside){if(match.ritual<0){match.ritual=0;annTeam('仪式开始——守住法阵 12 秒！',2.5);spawnWave(5,true);}match.ritual+=dt;setProgress(match.ritual/12,'仪式');if(Math.hypot(rit.x-player.pos.x,rit.z-player.pos.z)<3)player.ovl+=dt*1.5;
      if(Math.random()<dt*0.3)spawnWave(1,true);if(match.ritual>=12){rit.used=true;addProgress('ritual',1);annTeam('仪式完成',2);setProgress(-1);rit.m.material.color.setHex(0x40ff80);}}
    else if(match.ritual>=0)setProgress(-1);}
  // 发射倒计时
  if(!isClient()&&match.launching>=0){match.launching-=dt;setProgress(1-match.launching/7,'发射倒计时');if(match.launching<=0){match.launching=-2;endMatch(true);}}
  // 最近的蜡烛光
  if(Math.floor(gameTime*2)!==Math.floor((gameTime-dt)*2)){const near=candles.slice().sort((a,b)=>a.distanceToSquared(player.pos)-b.distanceToSquared(player.pos));
    candleLights.forEach((l,i)=>{if(near[i])l.position.copy(near[i]);});}
  candleLights.forEach((l,i)=>l.intensity=18+Math.sin(gameTime*9+i*3)*4+Math.random()*3);
  // 拾取物旋转
  for(const it of interactables)if(!it.used&&it.type==='ammo'&&Math.hypot(it.x-player.pos.x,it.z-player.pos.z)<1.5&&state==='playing'){it.used=true;scene.remove(it.m);if(isClient())sendNet({t:'interact',idx:it.idx});
    if(!WEAPONS[0].heat){const add=Math.ceil(WEAPONS[0].magSize*1.5);ammo[0].res=Math.min(WEAPONS[0].reserveMax,ammo[0].res+add);play('pickup');announce(WEAPONS[0].name+' 弹药 +'+add,1);}}
  for(const it of interactables)if(!it.used&&['ammo','clue','thruster','fuel','hull','core','relic','rare'].includes(it.type)){it.m.rotation.y+=dt*1.5;it.m.position.y=0.8+Math.sin(gameTime*2+it.x)*0.1;}
  for(const b of beams)if(b.rise)b.m.position.y+=dt*6;
}
function setProgress(v,label){const p=$('progress');if(v<0){p.style.display='none';return;}p.style.display='block';p.firstElementChild.style.width=(clamp(v,0,1)*100)+'%';}
function announce(t,dur=2){const a=$('announce');a.textContent=t;a.style.opacity=1;announceT=dur;}

// ============================================================ HUD
let mapT=0;
const MAP_COL={ammo:'#9aa060',clue:'#60ffb0',terminal:'#60ffb0',ritual:'#ff4040',thruster:'#ff9a40',fuel:'#40c0ff',hull:'#c0c0c0',core:'#ffe060',relic:'#d8a657',rare:'#d040ff'};
function drawMinimap(){
  const cv=$('minimap'),g=cv.getContext('2d'),W=cv.width,s=W/G,ex=(i,j)=>match.explored.has(i+','+j);
  g.fillStyle='#080403';g.fillRect(0,0,W,W);
  for(let i=0;i<G;i++)for(let j=0;j<G;j++){const x=i*s,y=j*s;
    if(ex(i,j)){g.fillStyle='#4a3428';g.fillRect(x+4,y+4,s-8,s-8);}else{g.strokeStyle='#241812';g.strokeRect(x+4.5,y+4.5,s-9,s-9);}
    g.fillStyle='#4a3428';
    if(i<G-1&&connected(i,j,i+1,j)&&(ex(i,j)||ex(i+1,j)))g.fillRect(x+s-5,y+s/2-3,10,6);
    if(j<G-1&&connected(i,j,i,j+1)&&(ex(i,j)||ex(i,j+1)))g.fillRect(x+s/2-3,y+s-5,6,10);}
  const toMap=(wx,wz)=>[(wx/C+.5)*s,(wz/C+.5)*s];
  for(const it of interactables){if(it.used)continue;const [ci,cj]=cellOf({x:it.x,z:it.z});if(!ex(ci,cj))continue;const [mx,my]=toMap(it.x,it.z);
    if(it.type==='pod'){g.fillStyle='#d8a657';g.fillRect(mx-4,my-4,8,8);g.strokeStyle='#000';g.strokeRect(mx-4.5,my-4.5,9,9);}
    else{g.fillStyle=MAP_COL[it.type]||'#fff';g.fillRect(mx-2,my-2,4,4);}}
  g.fillStyle='#8a7a6a';g.fillRect(...toMap(0,0).map(v=>v-3),6,6); // 空降点
  const [px,py]=toMap(player.pos.x,player.pos.z);g.save();g.translate(px,py);g.rotate(Math.atan2(-Math.cos(player.yaw),-Math.sin(player.yaw)));
  g.fillStyle='#f0e0c0';g.beginPath();g.moveTo(7,0);g.lineTo(-4,-4.5);g.lineTo(-4,4.5);g.closePath();g.fill();g.restore();
}
function updateHUD(dt){
  const bar=(id,v)=>$(id).firstElementChild.style.width=(clamp(v,0,1)*100)+'%';
  bar('hp',player.hp/player.maxHp);bar('st',player.stamina/100);bar('mana',player.mana/player.maxMana);bar('ovl',player.ovl/player.maxOvl);
  $('hpTxt').textContent=Math.ceil(Math.max(0,player.hp))+' / '+player.maxHp;$('manaTxt').textContent=Math.floor(player.mana);$('ovlTxt').textContent=Math.floor(player.ovl/player.maxOvl*100)+'%';
  const sk=[['V','锁喉提摔',PSY.lift],['G','黑洞',PSY.hole],['Q','子弹时间',PSY.bt]];
  $('spells').innerHTML=sk.map(([k,n,P])=>`<div class="spell" style="border-color:${P.cd>0?'#3a2a20':'#a040ff'}">${k} ${n}<br><span class="small">${P.cd>0?Math.ceil(P.cd)+' 秒':'就绪'}</span></div>`).join('')+`<div class="spell">C ${spellName(spells[0])}<br><span class="small">${spellCost(spells[0])} 灵能</span></div>`;
  if(bt.t>0){canvas.style.filter='saturate(.35) contrast(1.15) brightness(1.1)';$('btfx').style.opacity=1;}else $('btfx').style.opacity=0;
  if(masterLP)masterLP.frequency.setTargetAtTime(bt.t>0?650:20000,actx.currentTime,0.1);
  let h='<h3>撤离条件</h3>';
  for(const c of match.conds)h+=c.revealed?`<div class="${c.prog>=c.target?'done':''}">${c.prog>=c.target?'✔':'◇'} ${COND_INFO[c.type].name} ${c.target>1?c.prog+'/'+c.target:''}</div>`:`<div class="hidden">？ 未知条件——寻找数据板线索</div>`;
  h+=`<div style="margin-top:6px">逃生舱：${podPartsText()}</div>`;
  const c=match.carried;const carry=Object.keys(c).filter(k=>c[k]).map(k=>PART_NAME[k]+'×'+c[k]).join(' ');if(carry)h+=`<div>携带零件：${carry}</div>`;
  h+=`<div>身上物资：${match.loot}${match.rare?' + 灵能圣物':''} · 已送回：${match.safeLoot} · 回收装置：${match.beacons}</div>`;
  if(isNet()){const ts=[...net.remotes.values()].filter(r=>r.inMatch);if(ts.length)h+='<div style="margin-top:6px;color:#8fd0ff">队友：'+ts.map(r=>(CLS_INFO[r.cls]?.name||'队友')+' '+(r.dead?'阵亡':Math.max(0,r.hp)+'/'+r.maxHp)).join(' · ')+'</div>';}
  $('obj').innerHTML=h;
  $('weapons').innerHTML=WEAPONS.map((w,i)=>{const a=ammo[i];const txt=(w.block&&player.ssPistol)?`手枪 ${ammo[1].mag} / ∞`:(w.id==='power'&&player.field>0)?`<span style="color:#8fd0ff">分解力场 ${player.field.toFixed(1)}</span>`:(w.id==='power'&&player.fieldCd>0)?`力场冷却 ${Math.ceil(player.fieldCd)}`:(w.id==='saw'&&player.frenzy>0)?`<span style="color:#ffb040">狂热 ${player.frenzy.toFixed(1)}</span>`:w.heat?(heat.over>0?'<span class="low">过热</span>':`热量 ${Math.round(heat.v)}%`+(heat.charge>0.05?` · 蓄力 ${Math.round(heat.charge*100)}%`:'')):w.melee?'—':`<span class="${a.mag<=w.magSize*0.25?'low':''}">${a.mag}</span> / ${a.res===Infinity?'∞':a.res}`;return `<div class="wslot ${i===cur?'on':''}">${i+1} ${w.name}<b>${reloadT>0&&i===cur?'换弹中…':txt}</b></div>`;}).join('');
  mapT-=dt;if(mapT<=0){mapT=0.1;drawMinimap();}
  interactTarget=nearestInteractable();
  const xt=executeTarget();$('prompt').textContent=ex.active?'':xt?'按 X 处决':promptFor(interactTarget);
  $('exb').firstElementChild.style.width=(player.exCharge||0)+'%';$('exTxt').textContent=(player.exCharge||0)>=100?'就绪 · X':Math.floor(player.exCharge||0)+'%';$('exb').classList.toggle('full',(player.exCharge||0)>=100);
  if(announceT>0){announceT-=dt;if(announceT<=0)$('announce').style.opacity=0;}
  // 过载：画面和声音
  const r=player.ovl/player.maxOvl;
  $('warp').style.opacity=clamp((r-0.5)*2,0,1)*0.8+(player.warp>0?0.5:0);
  canvas.style.filter=r>0.5||player.warp>0?`hue-rotate(${Math.sin(gameTime*2)*25*clamp((r-0.5)*2,0,1)+(player.warp>0?40:0)}deg) saturate(${1+r*0.6})`:'';
  $('shieldfx').style.opacity=player.shield>0?0.8:0;
  if(actx){whisperGain.gain.value=clamp((r-0.5)*2,0,1)*0.22;whisperFilter.frequency.value=700+Math.sin(gameTime*1.7)*400+Math.sin(gameTime*5.3)*200;
    heartT-=dt;if(r>0.8&&heartT<=0){heartT=0.8;play('heart');}}
}

// ============================================================ 符文界面
function openRunes(){
  state='runes';document.exitPointerLock?.();$('runes').classList.add('show');$('slotInfo').textContent=player.slots;
  const opt=(o,v)=>Object.entries(o).map(([k,n])=>`<option value="${k}" ${k===v?'selected':''}>${n}</option>`).join('');
  $('runeList').innerHTML=spells.map((s,i)=>`<div class="rune" data-i="${i}"><b>技能 ${i+1}</b>　形态 <select data-f="form">${opt(FORMS,s.form)}</select>　元素 <select data-f="elem">${opt(ELEMS,s.elem)}</select>　修饰 ${Object.entries(MODS).map(([k,n])=>`<label><input type="checkbox" data-m="${k}" ${s.mods.includes(k)?'checked':''}> ${n}</label>`).join(' ')}
    <div class="small" data-info></div></div>`).join('');
  const refresh=()=>document.querySelectorAll('.rune').forEach(d=>{const s=spells[d.dataset.i];d.querySelector('[data-info]').textContent=`占用 ${spellSlots(s)} / ${player.slots} 槽 · 消耗 ${spellCost(s)} 灵能`+(spellSlots(s)>player.slots?' · 槽位不够，无法施放':'');});
  document.querySelectorAll('.rune').forEach(d=>{const s=spells[d.dataset.i];
    d.querySelectorAll('select').forEach(sel=>sel.onchange=()=>{s[sel.dataset.f]=sel.value;refresh();});
    d.querySelectorAll('input').forEach(cb=>cb.onchange=()=>{const m=cb.dataset.m;if(cb.checked){if(spellSlots(s)>=player.slots){cb.checked=false;return;}s.mods.push(m);}else s.mods=s.mods.filter(x=>x!==m);refresh();});});
  refresh();
}
$('runeDone').onclick=()=>{$('runes').classList.remove('show');resumeGame();};

// ============================================================ 开始 / 结束
