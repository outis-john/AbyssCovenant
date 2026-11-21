;(async()=>{const mem={};globalThis.localStorage={getItem:k=>mem[k]??null,setItem:(k,v)=>{mem[k]=String(v);}};let now=1e7;const step=n=>{for(let i=0;i<n;i++){now+=16;frame(now);}};const log=console.log;globalThis.setTimeout=(f)=>{f();return 0;};
saveVault({loot:50,rare:5,runs:0,extracted:0});CFG.unlockAll=false;
cls='walker';log('walker locked',!isUnlocked('walker'),'| deploy blocked',!classOk());unlockClass('walker');const v=loadVault();log('unlocked',isUnlocked('walker'),'| paid rare',5-v.rare,'| tide free',isUnlocked('tide'));
cls='ward';loadout.primary='bolter';loadout.melee='saw';prepareMatch(1);state='playing';enemies.forEach(e=>{e.alive=false;scene.remove(e.g)});enemies=[];
cur=0;for(let i=0;i<30;i++){const e=spawnEnemy('imp',0,-3);damageEnemy(e,999,'body',new THREE.Vector3(0,0,-1));}step(2);
log('mastery this match',JSON.stringify(match.mastery));endMatch(true);log('saved mastery bolter',loadVault().mastery.bolter,'| level',masteryLv('bolter'),'| text',masteryText('bolter'));
const base=RANGED.bolter.dmg;applyLoadout();log('mastery dmg bonus',(WEAPONS[0].dmg/base).toFixed(2));
loadout.paint={ward:1};const m=buildCharacter('ward');paintModel(m,1);let painted=0;m.traverse(o=>{if(o.isMesh&&o.material&&o.material.color&&o.material.color.getHex&&o.material.color.getHex()===PAINTS[1])painted++;});log('paint applied parts',painted>0||'(stub)');
log('DONE');})();
