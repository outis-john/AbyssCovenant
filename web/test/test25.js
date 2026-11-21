;(async()=>{let now=1e7;const step=n=>{for(let i=0;i<n;i++){now+=16;frame(now);}};const log=console.log;globalThis.setTimeout=(f)=>0;
cls='ward';startCampaignLevel('3-1');endScene(true);step(5);
for(const e of enemies){e.alive=false;scene.remove(e.g);}enemies=[];player.hp=player.maxHp=99999;
log('fire support charges',CAMP.fs,'| obj html has order',campObjHtml().includes('sqord'));
// 掩体：在一个箱子附近放一个荷鲁斯之子，玩家在另一边
let box=null;for(const b of colliders){const hw=(b.maxX-b.minX)/2,hd=(b.maxZ-b.minZ)/2;if(hw>.8&&hd>.8&&hw<4&&hd<4&&Math.abs(b.minX)<55&&Math.abs(b.minZ)<55){box=b;break;}}
const cx=(box.minX+box.maxX)/2,cz=(box.minZ+box.maxZ)/2;player.pos.set(cx,0,cz+16);for(const a of allies){a.alive=false;}
const e=spawnEnemy('soh',cx+3,cz-4);e.role='cover';let phases=new Set();for(let i=0;i<500;i++){step(1);if(e.cov){phases.add(e.cov.ph);}}
log('cover phases seen',[...phases].join(','));
// 包抄
const f=spawnEnemy('soh',cx,cz-8);f.role='flank';let fl=false;for(let i=0;i<400;i++){step(1);if(f.cov&&f.cov.fp)fl=true;}log('flanker planned route',fl,'role now',f.role);
for(const x of enemies){x.alive=false;scene.remove(x.g);}enemies=[];
// 冲锋
reloadT=1;const w=spawnEnemy('we',player.pos.x,player.pos.z-15);w.leapCd=999;const s0=w.speed;step(3);log('we rushes on reload',w.rushT>0,(w.speed/s0).toFixed(2));reloadT=0;w.alive=false;scene.remove(w.g);enemies=[];
// 火力支援
const tgt=spawnEnemy('soh',player.pos.x,player.pos.z-30);tgt.speed=0;player.yaw=0;player.pitch=-Math.atan2(1.6,30);tgt.speed=0;fireSupport();log('strike queued',TAC.strikes.length,'charges',CAMP.fs);step(320);log('strike killed target',!tgt.alive,tgt.hp,TAC.strikes.length,state);
// 小队指令
for(const a of allies){a.alive=true;}const tgt2=spawnEnemy('soh',player.pos.x,player.pos.z-25);player.pitch=-Math.atan2(.4,25);squadOrder();log('focus order',SQUAD.focus===tgt2);
player.pitch=-.12;squadOrder();log('hold order',SQUAD.order,allies.filter(a=>a.cmdHold).length);player.pitch=1.2;squadOrder();log('fall in',SQUAD.order,allies.filter(a=>a.hold).length);
// 近战回报
WEAPONS[cur]=WEAPONS[cur];const mi=WEAPONS.findIndex(W=>W.melee);if(mi>=0)cur=mi;player.hp=player.maxHp*.5;const r0=ammo[0].res=10;const m=spawnEnemy('soh',player.pos.x,player.pos.z-2);damageEnemy(m,99999,'body',new THREE.Vector3(0,0,-1),{});
log('melee kill reward hp',player.hp>player.maxHp*.5,'ammo',ammo[0].res>r0);
// 间歇 + 检查点：直接跳到第 3 步结束
for(const x of enemies){x.alive=false;scene.remove(x.g);}enemies=[];CAMP.timers=[];CAMP.step=2;CAMP.S={update:()=>true};step(2);log('lull started',!!(CAMP.S&&CAMP.S.lull),'objective',campObjHtml().includes('Regroup'));
player.pos.copy(CAMP.wp);for(let i=0;i<2400&&CAMP.S&&CAMP.S.lull;i++)step(1);log('lull ended, step',CAMP.step,'checkpoint step',CKPT&&CKPT.step,'fs',CAMP.fs);
hurtPlayer(1e9);step(30);log('state after death',state);restoreCheckpoint();step(5);log('restored step',CAMP.step,'state',state,'allies',allies.filter(a=>a.alive).length);
log('DONE');})();
