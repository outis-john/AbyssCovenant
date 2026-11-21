// ============================================================ 成长：职业解锁、武器熟练度、涂装
function isUnlocked(c){if(CFG.unlockAll)return true;const v=loadVault();return !CFG.unlock[c]||(v.unlocked||[]).includes(c);}
function classOk(){if(isUnlocked(cls))return true;announce('先在职业面板里解锁「'+CLS_INFO[cls].name+'」',1.5);play('dry');return false;}
function unlockClass(c){const v=loadVault(),u=CFG.unlock[c];if(!u||isUnlocked(c))return;if(v.loot<(u.loot||0)||v.rare<(u.rare||0)){play('dry');return;}
  v.loot-=u.loot||0;v.rare-=u.rare||0;v.unlocked=(v.unlocked||[]).concat(c);saveVault(v);play('beacon');showVault();renderShop();selectClass(c);refreshCards();}
function refreshCards(){document.querySelectorAll('#clsCards .card').forEach(el=>{const c=el.dataset.cls;el.classList.toggle('locked',!isUnlocked(c));});}
function unlockPanel(c){if(isUnlocked(c))return'';const u=CFG.unlock[c],v=loadVault();const can=v.loot>=(u.loot||0)&&v.rare>=(u.rare||0);
  return `<div class="unl">🔒 未解锁 · 需要 ${[u.loot?u.loot+' 物资':'',u.rare?u.rare+' 圣物':''].filter(Boolean).join(' + ')} <button id="unlockBtn" ${can?'':'disabled'}>解锁</button></div>`;}
// 熟练度：本局记在 match.mastery，结算时存进仓库
function masteryKill(){if(!match||training.on)return;const w=WEAPONS[cur];if(!w)return;const id=(w.block&&player.ssPistol)?'pistol':w.id;match.mastery=match.mastery||{};match.mastery[id]=(match.mastery[id]||0)+1;}
function saveMastery(v){v.mastery=v.mastery||{};const before={};for(const k in (match.mastery||{})){before[k]=masteryLvFrom(v.mastery[k]||0);v.mastery[k]=(v.mastery[k]||0)+match.mastery[k];
  if(masteryLvFrom(v.mastery[k])>before[k])match.masteryUp=(match.masteryUp||[]).concat(k);}}
function masteryLvFrom(n){return CFG.mastery.filter(t=>n>=t).length;}
function masteryLv(id){return masteryLvFrom(((loadVault().mastery)||{})[id]||0);}
function masteryText(id){const n=((loadVault().mastery)||{})[id]||0,lv=masteryLvFrom(n),next=CFG.mastery[lv];const nm=(RANGED[id]||MELEE[id]||{}).name||id;
  return `${nm} 熟练 Lv${lv}${next?`（${n}/${next} 击杀）`:'（满级）'}${lv?` 伤害 +${lv*5}%`:''}`;}
// 涂装：替换带金属贴图的装甲材质颜色
const PAINTS=[null,0x8a1a14,0x2a2a2e,0xd0c8b0,0x2e5a3a,0x5a3a7a];
const PAINT_NAMES=['原色','血红','漆黑','骨白','军绿','暗紫'];
function paintModel(g,idx){if(!idx||!PAINTS[idx])return;g.traverse(o=>{if(o.isMesh&&o.material&&o.material.map===texMetal){o.material=o.material.clone();o.material.color.setHex(PAINTS[idx]);}});}
function paintRow(c){const cur=(loadout.paint||{})[c]||0;return `<div class="paints">${PAINTS.map((p,i)=>`<span class="sw ${i===cur?'sel':''}" data-paint="${i}" title="${PAINT_NAMES[i]}" style="background:${p?'#'+p.toString(16).padStart(6,'0'):'linear-gradient(135deg,#41557e,#b8952e)'}"></span>`).join('')}</div>`;}
function bindClassPanel(c){const b=$('unlockBtn');if(b)b.onclick=()=>unlockClass(c);
  document.querySelectorAll('[data-paint]').forEach(s=>s.onclick=()=>{loadout.paint=loadout.paint||{};loadout.paint[c]=+s.dataset.paint;saveLoadout();selectClass(c);});}
