;(async()=>{const mem={};globalThis.localStorage={getItem:k=>mem[k]??null,setItem:(k,v)=>{mem[k]=String(v);}};const log=console.log;let now=0;const step=n=>{for(let i=0;i<n;i++){now+=16;frame(now);}};
saveVault({loot:100,rare:3,runs:0,extracted:0});
// 1 购买升级
buyUpgrade('armor');buyUpgrade('armor');buyUpgrade('mag');buyUpgrade('blade');buyUpgrade('psy');buyUpgrade('beacon');
let v=loadVault();log('after buying: loot',v.loot,'rare',v.rare,'levels',JSON.stringify(v.up));
buyUpgrade('beacon');log('max level blocks rebuy: loot still',loadVault().loot);
// 2 开局套用
loadout.primary='bolter';loadout.melee='saw';loadout.threat=1;loadout.amulet=false;cls='ward';prepareMatch(5);state='playing';
log('ward hp',player.maxHp,'(150+30)','| bolter mag',WEAPONS[0].magSize,'(24×1.3)','| original untouched',RANGED.bolter.magSize,'| saw dmg',WEAPONS[2].dmg.toFixed(1),'| mana',player.maxMana,'| beacons',match.beacons);
// 3 威胁等级
const avgHp=()=>{const a=enemies.filter(e=>e.type==='imp');return Math.round(a.reduce((s,e)=>s+e.maxHp,0)/a.length);};
const n1=enemies.length,h1=avgHp();loadout.threat=3;prepareMatch(5);state='playing';
log('threat 1 -> 3: enemies',n1,'->',enemies.length,'| imp hp',h1,'->',avgHp(),'| match.threat',match.threat);
// 4 护符：带上，然后阵亡 -> 失去一件圣物；物资倍率
loadout.amulet=true;loadout.threat=2;prepareMatch(5);state='playing';const r0=loadVault().rare,hpA=player.maxHp;
match.safeLoot=10;player.hp=0;endMatch(false);
log('amulet: hp bonus',hpA,'| died -> rare',r0,'->',loadVault().rare,'| safe loot 10 × 1.6 kept',loadVault().loot-v.loot);
loadout.amulet=true;prepareMatch(5);state='playing';const r1=loadVault().rare,l1=loadVault().loot;match.loot=5;endMatch(true);
log('amulet extract -> rare',r1,'->',loadVault().rare,'| loot 5 × 1.6 =',loadVault().loot-l1);
log('DONE');})();
