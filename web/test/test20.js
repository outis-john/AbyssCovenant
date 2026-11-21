;(async()=>{let now=1e7;const step=n=>{for(let i=0;i<n;i++){now+=16;frame(now);}};const log=console.log;globalThis.setTimeout=(f)=>{f();return 0;};
cls='tide';prepareMatch(6);state='playing';enemies.forEach(e=>{e.alive=false;scene.remove(e.g)});enemies=[];wallMeshes.length=0;colliders.length=0;player.hp=player.maxHp=9999;player.pos.set(0,0,0);player.yaw=0;player.pitch=0;
// 焚灭火柱：引导、穿透、点燃
const es=[0,1,2].map(i=>{const e=spawnEnemy('imp',0,-4-i*2.5);e.hp=e.maxHp=500;e.cd=99;e.speed=0;return e;});step(2);player.mana=999;castSpell(0);step(110);
log('pyre beam: channel done',!PB.on,'| enemies hit',es.filter(e=>e.hp<500||!e.alive).length,'/3 | dmg',es.map(e=>Math.round(500-e.hp)).join(','),'| burning',es[0].burn>0||!es[0].alive);
// 侵蚀：被灵能打中 / 反噬 → 满了进深渊彼岸 → 活下来获得赐福
enemies.forEach(e=>{e.alive=false;scene.remove(e.g)});enemies=[];
for(let i=0;i<20;i++)taintAffinity('blood',5);addTaint(60,'change');player.ignoreChance=0;player.ovl=player.maxOvl+20;backlash();log('taint after psy hit+backlash',Math.round(player.taint));
addTaint(30);step(2);log('dragged into hell',HELL.on,'| god',HELL.god,GODS[HELL.god].name);
const hb=player.hp;hurtPlayer(50);log('invulnerable while falling',player.hp===hb);
const hp0=player.maxHp,gm=player.gunMul;HELL.t=0.01;step(3);log('survived → bless',player.bless,'| gun mul',(player.gunMul/gm).toFixed(2),'| daemons cleared',enemies.filter(e=>e.alive&&e.daemon).length===0,'| taint reset',player.taint===0);
// 万变：过载不反噬
grantBless('change');player.ovl=player.maxOvl+30;const h1=player.hp;backlash();log('change bless backlash only burns',Math.round(h1-player.hp));
// 连放 3 个灵能就会被拖进深渊彼岸
resetAbyss();player.bless=null;player.mana=999;for(const k in PSY)PSY[k].cd=0;enemies.forEach(e=>{e.alive=false;scene.remove(e.g)});enemies=[];
player.pos.set(0,0,0);player.yaw=0;for(let i=0;i<3;i++){const e=spawnEnemy('imp',(i-1),-5);e.cd=99;}step(1);const tl=[];castLift();step(2);tl.push(Math.round(player.taint));castHole();step(2);tl.push(Math.round(player.taint));castBT();step(3);
log('3 casts: taint',tl.join(' -> '),'| in hell after 3rd',HELL.on);
log('DONE');})();
