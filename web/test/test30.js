;(async()=>{let now=1e7;const step=n=>{for(let i=0;i<n;i++){now+=16;frame(now);}};const log=console.log;globalThis.setTimeout=(f)=>0;
let store={};globalThis.localStorage={getItem:k=>store[k]??null,setItem:(k,v)=>{store[k]=String(v);}};
// 机甲不进战役、主角名字
cls='walker';startCampaignLevel('4-1');endScene(true);step(3);log('mech swapped to',cls,'| hero',hudHeroName('x'),heroNow().tag);
// 难度
const v=loadVault();v.campDiff=2;saveVault(v);const e=spawnEnemy('soh',0,-30);log('primarch hp x1.35',Math.round(e.hp),'| fire support',CAMP.fs);e.alive=false;scene.remove(e.g);
v.campDiff=1;saveVault(v);
// 打到第 2 步，存档写进本地
for(const x of enemies){x.alive=false;scene.remove(x.g);}CAMP.timers=[];CAMP.S={update:()=>true};step(3);
const sv=loadVault().campSave;log('checkpoint saved to vault',!!sv,sv&&sv.id,sv&&sv.step,sv&&sv.obj);
// 回战舰 → 继续
exitCampaign();cls='ward';continueCampaign();step(5);log('continue → level',CAMP.id,'step',CAMP.step,'state',state,'allies',allies.filter(a=>a.alive).length);
// 通关后清掉存档
campEnd(true);log('save cleared after win',!loadVault().campSave);
log('DONE');})();
