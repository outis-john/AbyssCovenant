// ============================================================ 战舰工坊：升级（物资 / 圣物）、威胁等级、圣物护符（带进去可能会丢）
loadout.threat=loadout.threat||1;
function upLv(id){return (loadVault().up||{})[id]||0;}
function curThreat(){return CFG.threat[(match&&match.threat)||pendingThreat];}
function renderShop(){const v=loadVault();v.up=v.up||{};
  const rows=CFG.upgrades.map(u=>{const lv=v.up[u.id]||0,max=lv>=u.max,c=max?0:u.cost[lv],r=max?0:(u.rare?u.rare[lv]:0);
    const can=!max&&v.loot>=c&&v.rare>=r;const price=max?'已满级':[c?c+' 物资':'',r?r+' 圣物':''].filter(Boolean).join(' + ');
    return `<div class="up"><div><b>${u.name}</b> <span class="lv">${'■'.repeat(lv)}${'□'.repeat(u.max-lv)}</span><div class="small">${u.desc}</div></div><button data-up="${u.id}" ${can?'':'disabled'}>${price}</button></div>`;}).join('');
  const th=CFG.threat.slice(1).map((t,i)=>`<button class="th ${loadout.threat===i+1?'sel':''}" data-th="${i+1}">${t.name}<small>物资 ×${t.loot}</small></button>`).join('');
  const am=v.rare>0?`<label class="am"><input type="checkbox" id="amulet" ${loadout.amulet?'checked':''}> 佩戴圣物护符出击（生命 +${CFG.amulet.hp}，伤害 +${Math.round((CFG.amulet.dmg-1)*100)}%；<b style="color:#e05a4a">阵亡会失去 1 件圣物</b>）</label>`:'<div class="small">拥有灵能圣物后可以佩戴圣物护符出击。</div>';
  $('shop').innerHTML=`<h3>战舰工坊</h3>${rows}`;const bi=[['random','随机区域']].concat(Object.entries(CFG.biomes).map(([k,b])=>[k,b.name])).map(([k,n])=>`<button class="th ${(loadout.biome||'random')===k?'sel':''}" data-bi="${k}">${n}</button>`).join('');
  $('deployOpts').innerHTML=`<div class="ths" style="margin-bottom:6px">${bi}</div><div class="lbl">威胁等级</div><div class="ths">${th}</div>${am}`;
  $('deployOpts').querySelectorAll('[data-bi]').forEach(b=>b.onclick=()=>{loadout.biome=b.dataset.bi;saveLoadout();renderShop();play('equip');});
  $('shop').querySelectorAll('[data-up]').forEach(b=>b.onclick=()=>buyUpgrade(b.dataset.up));
  $('deployOpts').querySelectorAll('[data-th]').forEach(b=>b.onclick=()=>{loadout.threat=+b.dataset.th;saveLoadout();renderShop();play('equip');});
  const a=$('amulet');if(a)a.onchange=()=>{loadout.amulet=a.checked;saveLoadout();play('equip');};}
function buyUpgrade(id){const v=loadVault();v.up=v.up||{};const u=CFG.upgrades.find(x=>x.id===id),lv=v.up[id]||0;if(lv>=u.max)return;
  const c=u.cost[lv],r=u.rare?u.rare[lv]:0;if(v.loot<c||v.rare<r)return;v.loot-=c;v.rare-=r;v.up[id]=lv+1;saveVault(v);play('pickup');showVault();renderShop();applyLoadout();}
function saveLoadout(){try{localStorage.setItem('abyss_loadout',JSON.stringify(loadout));}catch(e){}}
// 开局时套用升级和护符（在职业属性之后调用）
function applyProgress(){const v=loadVault();
  player.maxHp+=15*upLv('armor');player.maxMana=100+25*upLv('psy');player.mana=player.maxMana;player.maxOvl+=20*upLv('psy');player.exRate=1+0.3*upLv('exec');
  player.amulet=!!(loadout.amulet&&v.rare>0);if(player.amulet){player.maxHp+=CFG.amulet.hp;player.gunMul*=CFG.amulet.dmg;}
  player.hp=player.maxHp;}
// 武器：复制一份再加升级，避免改到原始数据
function upgradeWeapons(P,M){const mg=1+0.3*upLv('mag');
  if(!P.heat){P.magSize=Math.round(P.magSize*mg);P.res0=Math.round(P.res0*mg);P.reserveMax=Math.round(P.reserveMax*mg);}else P.dmg*=1+0.2*upLv('melta');
  M.dmg*=(1+0.15*upLv('blade'))*(player.amulet?CFG.amulet.dmg:1)*(player.meleeMul||1);}
