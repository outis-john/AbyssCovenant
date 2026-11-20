// 联机测试：同一进程里跑两份游戏，用假的 Peer 连接
import {U} from './three-stub.mjs';
globalThis.AudioContext=U;globalThis.location={hash:'#p2p'};
const reg=new Map(),queue=[];
class FakeConn{constructor(peerId){this.peer=peerId;this.open=false;this.h={};this.other=null;}
  on(ev,fn){this.h[ev]=fn;} send(d){const o=this.other;queue.push(()=>o.h.data&&o.h.data(d));} close(){}}
class FakePeer{constructor(id){this.id=id||('p'+Math.random().toString(36).slice(2,8));this.h={};reg.set(this.id,this);queue.push(()=>this.h.open&&this.h.open(this.id));}
  on(ev,fn){this.h[ev]=fn;}
  connect(id){const t=reg.get(id);const a=new FakeConn(id),b=new FakeConn(this.id);a.other=b;b.other=a;
    queue.push(()=>{if(!t){this.h.error&&this.h.error({type:'peer-unavailable'});return;}t.h.connection&&t.h.connection(b);b.open=true;b.h.open&&b.h.open();a.open=true;a.h.open&&a.h.open();});return a;}
  destroy(){reg.delete(this.id);}}
globalThis.Peer=FakePeer;
const flush=()=>{let n=0;while(queue.length&&n<10000){queue.shift()();n++;}};
const A=await import('./game_a.mjs'),B=await import('./game_b.mjs');
const log=console.log;let now=1000;
const tick=(n=1)=>{for(let i=0;i<n;i++){now+=16;A.ev(`frame(${now})`);flush();B.ev(`frame(${now})`);flush();}};
// 1 建房 / 加入
await A.ev('hostRoom()');flush();const code=A.ev('net.code');log('host code',code,'mode',A.ev('net.mode'));
await B.ev(`joinRoom('${code}')`);flush();flush();
log('lobby on host',A.ev('net.lobby.length'),'| client mode',B.ev('net.mode'),'| client sees lobby',B.ev('net.lobby.length'));
// 2 开局
A.ev("net.inMatch=true;bcast({t:'start',seed:777});beginNetMatch(777,false);");flush();
A.ev("endCutscene();state='playing';");B.ev("endCutscene();state='playing';");tick(10);
log('enemies host',A.ev('enemies.filter(e=>e.alive).length'),'client',B.ev('enemies.filter(e=>e.alive).length'),'| same seed',A.ev('seed')===B.ev('seed'),
  '| same pickups',A.ev('interactables.length')===B.ev('interactables.length'));
log('same biome',A.ev('curBiome'),B.ev('curBiome'),A.ev('curBiome')===B.ev('curBiome'));
const id=A.ev('enemies.find(e=>e.alive&&e.type==="imp").id');
log('enemy',id,'host pos',A.ev(`enemyById(${id}).g.position.x.toFixed(1)`),'client pos',B.ev(`enemyById(${id}).g.position.x.toFixed(1)`));
// 3 队友打死敌人（链锯切开）
const g0=B.ev('gibs.length');
B.ev(`{const e=enemyById(${id});damageEnemy(e,999,'body',new THREE.Vector3(0,0,-1),{how:{cut:{p:e.g.position.clone().setY(1.2),n:new THREE.Vector3(1,0,0),imp:3}}});}`);flush();tick(2);
log('client kill -> host enemy alive',A.ev(`enemyById(${id}).alive`),'| client enemy alive',B.ev(`enemyById(${id}).alive`),'| client gore pieces +',B.ev('gibs.length')-g0,'| host kills',A.ev('match.kills'),'client kills(synced)',B.ev('match.kills'));
// 4 敌人攻击队友：把一个敌人放到队友身边，房主离得很远
const id2=A.ev('enemies.find(e=>e.alive).id');
B.ev('player.pos.set(40,0,40)');A.ev('player.pos.set(0,0,0)');tick(5);
A.ev(`{const e=enemyById(${id2});e.g.position.set(40.8,0,40);e.cd=0;e.stagger=0;e.stun=0;}`);
const hp0=B.ev('player.hp');tick(60);
log('enemy attacks the nearest player: client hp',hp0,'->',Math.round(B.ev('player.hp')),'| host hp',Math.round(A.ev('player.hp')));
// 4b 瘟火术士朝队友吐火球：队友能看到类型和火球，伤害由房主判定
A.ev('enemies.forEach(e=>{if(e.alive){e.alive=false;scene.remove(e.g);}})');tick(4);
A.ev("player.pos.set(0,0,0);{const e=spawnEnemy('caster',40,34);e.cast=0;e.los=true;e.losT=999;}");B.ev('player.hp=100;player.blocking=false');
let sawSpit=0,ctype=null;const hp1=100;for(let i=0;i<120;i++){tick(1);sawSpit=Math.max(sawSpit,B.ev('spits.length'));ctype=ctype||B.ev("enemies.some(e=>e.alive&&e.type==='caster')");}
log('client sees caster type',ctype,'| client sees spit',sawSpit>0,'| client hp',hp1,'->',Math.round(B.ev('player.hp')));
// 5 队友拾取线索、遗物 -> 房主结算 -> 同步回队友
const ci=B.ev("interactables.find(i=>i.type==='clue'&&!i.used).idx");B.ev(`interact(interactables[${ci}])`);flush();
B.ev("interact(interactables.find(i=>i.type==='relic'&&!i.used))");flush();tick(8);
log('clue used host',A.ev(`interactables[${ci}].used`),'client',B.ev(`interactables[${ci}].used`),'| revealed host',A.ev('match.conds.filter(c=>c.revealed).length'),'client',B.ev('match.conds.filter(c=>c.revealed).length'),'| team loot host',A.ev('match.loot'),'client',B.ev('match.loot'));
// 6 队友阵亡 -> 观战；房主再阵亡 -> 全灭结算
B.ev('player.hp=0;beginDeath();');tick(150);
log('client after death:',B.ev('state'),'| host sees client dead',A.ev('[...net.remotes.values()][0].dead'));
A.ev('player.hp=0;beginDeath();');tick(150);
log('host after death:',A.ev('state'),'| client state',B.ev('state'));
log('DONE');process.exit(0);
