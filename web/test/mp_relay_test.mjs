// 中继联机测试：假的 MQTT 服务器（WebSocket），跑和 mp_test 一样的流程
import {U} from './three-stub.mjs';
globalThis.AudioContext=U;globalThis.location={hash:''};
const queue=[],subs=new Map();let split=0;
class FakeWS{constructor(url,proto){this.url=url;this.readyState=0;this.subs=[];queue.push(()=>{this.readyState=1;this.onopen&&this.onopen();});}
  deliver(bytes){const ab=bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.length);
    if((split++)%3===0&&bytes.length>4){const k=2+(split%(bytes.length-2));queue.push(()=>this.onmessage&&this.onmessage({data:ab.slice(0,k)}));queue.push(()=>this.onmessage&&this.onmessage({data:ab.slice(k)}));}
    else queue.push(()=>this.onmessage&&this.onmessage({data:ab}));}
  send(u){u=new Uint8Array(u);const type=u[0]>>4;let i=1,len=0,mul=1,d;do{d=u[i++];len+=(d&127)*mul;mul*=128;}while(d&128);const b=u.subarray(i,i+len);
    if(type===1)this.deliver(new Uint8Array([0x20,2,0,0]));
    else if(type===8){const tl=(b[2]<<8)|b[3];const t=new TextDecoder().decode(b.subarray(4,4+tl));if(!subs.has(t))subs.set(t,new Set());subs.get(t).add(this);this.deliver(new Uint8Array([0x90,3,b[0],b[1],0]));}
    else if(type===3){const tl=(b[0]<<8)|b[1];const t=new TextDecoder().decode(b.subarray(2,2+tl));for(const w of subs.get(t)||[])if(w.readyState===1)w.deliver(u.slice());}
    else if(type===12)this.deliver(new Uint8Array([0xD0,0]));}
  close(){this.readyState=3;for(const v of subs.values())v.delete(this);queue.push(()=>this.onclose&&this.onclose());}}
globalThis.WebSocket=FakeWS;
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const flush=()=>{let n=0;while(queue.length&&n<10000){queue.shift()();n++;}};
const A=await import('./game_a.mjs'),B=await import('./game_b.mjs');
const log=console.log;let now=1000;
const tick=(n=1)=>{for(let i=0;i<n;i++){now+=16;A.ev(`frame(${now})`);flush();B.ev(`frame(${now})`);flush();}};
// 1 建房 / 加入
await A.ev('hostRoom()');flush();await sleep(20);flush();const code=A.ev('net.code');log('host code',code,'mode',A.ev('net.mode'));
await B.ev(`joinRoom('${code}')`);for(let i=0;i<5;i++){flush();await sleep(120);}flush();log('relay used: host',A.ev('net.peer.relay'),'client',B.ev('net.peer.relay'),'broker',A.ev('net.peer.bi'));
log('lobby on host',A.ev('net.lobby.length'),'| client mode',B.ev('net.mode'),'| client sees lobby',B.ev('net.lobby.length'));
// 2 开局
A.ev("net.inMatch=true;bcast({t:'start',seed:777});beginNetMatch(777,false);");flush();
A.ev("endCutscene();state='playing';");B.ev("endCutscene();state='playing';");tick(10);
log('enemies host',A.ev('enemies.filter(e=>e.alive).length'),'client',B.ev('enemies.filter(e=>e.alive).length'),'| same seed',A.ev('seed')===B.ev('seed'),
  '| same pickups',A.ev('interactables.length')===B.ev('interactables.length'));
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
// 7 房间码错误
await B.ev("joinRoom('ZZZZZ')");for(let i=0;i<12;i++){flush();await sleep(1000);}log('bad code -> back to',B.ev('net.mode'));
log('DONE');process.exit(0);
