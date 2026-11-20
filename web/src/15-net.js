// ============================================================ 联机：PeerJS（WebRTC 点对点），房主权威
// 房主：跑完整模拟（敌人 AI、刷怪、撤离条件、拾取），每秒 12 次把快照发给队友
// 队友：自己移动和判定命中，把伤害、拾取、施法等请求发给房主结算
const net={mode:'solo',peer:null,conns:new Map(),conn:null,myId:'me',code:'',remotes:new Map(),lobby:[],snapT:0,stateT:0,inMatch:false,lastDmg:new Map(),missing:new Map()};
const isClient=()=>net.mode==='client',isHost=()=>net.mode==='host',isNet=()=>net.mode!=='solo';
let enemySeq=0;
const ser=o=>JSON.stringify(o,(k,v)=>v&&v.isVector3?{__v:[+v.x.toFixed(3),+v.y.toFixed(3),+v.z.toFixed(3)]}:v);
const deser=s=>JSON.parse(s,(k,v)=>v&&v.__v?new THREE.Vector3(...v.__v):(v&&typeof v==='object'&&!Array.isArray(v)&&Object.keys(v).length===3&&'x' in v&&'y' in v&&'z' in v)?new THREE.Vector3(v.x,v.y,v.z):v);
function sendNet(o){if(net.conn&&net.conn.open)net.conn.send(ser(o));}
function sendTo(id,o){const c=net.conns.get(id);if(c&&c.open)c.send(ser(o));}
function bcast(o,except){const s=ser(o);for(const [id,c] of net.conns)if(id!==except&&c.open)c.send(s);}
function annTeam(t,d=2){announce(t,d);if(isHost())bcast({t:'ann',text:t,dur:d});}
const enemyById=id=>enemies.find(e=>e.id===id);
// ---------- 中继联机：用公共 MQTT 服务器转发数据（国内外都能连，不需要 P2P）
// 接口模仿 PeerJS（on/open/connection/data/close、connect、send），游戏其余代码不用改
const RELAYS=['wss://broker.emqx.io:8084/mqtt','wss://broker.hivemq.com:8884/mqtt'];
const RALPH='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const relayOf=code=>Math.max(0,RALPH.indexOf(code[code.length-1]))%2;          // 房间码最后一位的奇偶 = 用哪台服务器
const withRelay=(code,bi)=>{const i=RALPH.indexOf(code[code.length-1]);return code.slice(0,-1)+RALPH[i-i%2+bi];};
function mqttConnect(url,cid,onMsg,onClose){return new Promise((res,rej)=>{
  const enc=new TextEncoder(),dec=new TextDecoder();let ws;try{ws=new WebSocket(url,'mqtt');}catch(e){return rej(e);}ws.binaryType='arraybuffer';
  const str=t=>{const b=enc.encode(t);return [b.length>>8,b.length&255,...b];};
  const pkt=(h,body)=>{const L=[];let n=body.length;do{let d=n%128;n=Math.floor(n/128);if(n>0)d|=128;L.push(d);}while(n>0);return new Uint8Array([h,...L,...body]);};
  let buf=new Uint8Array(0),pid=1,ok=false,ping=null;const timer=setTimeout(()=>{if(!ok){try{ws.close();}catch(e){}rej(new Error('timeout'));}},6000);
  const api={pub(t,m){if(ws.readyState!==1)return;const b=enc.encode(m),tt=str(t);const body=new Uint8Array(tt.length+b.length);body.set(tt);body.set(b,tt.length);ws.send(pkt(0x30,body));},
    sub(t){ws.send(pkt(0x82,[pid>>8,pid&255,...str(t),0]));pid++;},close(){clearInterval(ping);try{ws.send(new Uint8Array([0xE0,0]));ws.close();}catch(e){}}};
  ws.onopen=()=>ws.send(pkt(0x10,[...str('MQTT'),4,2,0,30,...str(cid)]));
  ws.onerror=()=>{if(!ok){clearTimeout(timer);rej(new Error('ws'));}};
  ws.onclose=()=>{clearInterval(ping);if(ok&&onClose)onClose();};
  ws.onmessage=ev=>{const a=new Uint8Array(ev.data),nb=new Uint8Array(buf.length+a.length);nb.set(buf);nb.set(a,buf.length);buf=nb;
    for(;;){if(buf.length<2)break;let len=0,mul=1,i=1,d;do{if(i>=buf.length)return;d=buf[i++];len+=(d&127)*mul;mul*=128;}while(d&128);
      if(buf.length<i+len)break;const type=buf[0]>>4,b=buf.subarray(i,i+len);buf=buf.slice(i+len);
      if(type===2){clearTimeout(timer);if(b[1]!==0)return rej(new Error('refused'));ok=true;ping=setInterval(()=>{if(ws.readyState===1)ws.send(new Uint8Array([0xC0,0]));},20000);res(api);}
      else if(type===3){const tl=(b[0]<<8)|b[1];const t=dec.decode(b.subarray(2,2+tl));onMsg(t,dec.decode(b.subarray(2+tl)));}}};
});}
class RelayConn{constructor(peer,other){this.p=peer;this.peer=other;this.open=false;this.h={};this.rx=Date.now();}
  on(ev,fn){this.h[ev]=fn;}emit(ev,a){this.h[ev]&&this.h[ev](a);}
  send(d){this.p._send(this.peer,'m',d);}
  close(){if(!this.open)return;this.open=false;this.p._send(this.peer,'bye');this.p.conns.delete(this.peer);this.emit('close');}
  _drop(){if(!this.open&&!this.h)return;this.open=false;this.p.conns.delete(this.peer);this.emit('close');}}
const RTOPIC='abysscov/v1/';
class RelayPeer{
  constructor(id,bi=0){this.h={};this.relay=true;this.conns=new Map();this.host=!!id;this.code=id?id.slice(PEER_PREFIX.length):'';
    this.id=id||('c'+Math.random().toString(36).slice(2,10));setTimeout(()=>this._start(bi),0);
    this.watch=setInterval(()=>{const now=Date.now();for(const c of [...this.conns.values()])if(c.open&&now-c.rx>12000)c._drop();
      for(const c of this.conns.values())if(c.open&&now-(c.tx||0)>3000){c.tx=now;this._send(c.peer,'k');}},1000);}
  on(ev,fn){this.h[ev]=fn;}emit(ev,a){this.h[ev]&&this.h[ev](a);}
  inbox(){return this.host?RTOPIC+this.code+'/h':RTOPIC+this.room+'/c/'+this.id;}
  async _start(bi){
    if(this.host)this.code=withRelay(this.code,bi);
    try{this.m=await mqttConnect(RELAYS[bi],'ac-'+this.id+'-'+Math.random().toString(36).slice(2,6),(t,s)=>this._rx(s),()=>{for(const c of [...this.conns.values()])c._drop();});}
    catch(e){if(this.dead)return;if(this.host&&bi+1<RELAYS.length)return this._start(bi+1);return this.emit('error',{type:'relay-unreachable'});}
    if(this.dead)return this.m.close();this.bi=bi;if(this.host){this.m.sub(this.inbox());this.id=PEER_PREFIX+this.code;}this.emit('open',this.id);}
  _send(to,k,d){if(!this.m)return;const c=this.conns.get(to);if(c)c.tx=Date.now();
    this.m.pub(this.host?RTOPIC+this.code+'/c/'+to:RTOPIC+this.room+'/h',JSON.stringify({f:this.id,k,d}));}
  _rx(s){let o;try{o=JSON.parse(s);}catch(e){return;}let c=this.conns.get(this.host?o.f:'host');
    if(this.host&&o.k==='hi'){if(!c){c=new RelayConn(this,o.f);this.conns.set(o.f,c);this.emit('connection',c);c.open=true;c.emit('open');}this._send(o.f,'ok');c.rx=Date.now();return;}
    if(!c)return;c.rx=Date.now();
    if(o.k==='ok'&&!c.open){c.open=true;clearInterval(c.retry);c.emit('open');}
    else if(o.k==='m'&&c.open)c.emit('data',o.d);
    else if(o.k==='bye')c._drop();}
  connect(id){this.room=id.slice(PEER_PREFIX.length);const c=new RelayConn(this,'host');this.conns.set('host',c);
    // 队友这边：所有消息都来自房主，用固定的 'host' 作为发送方
    this.m.sub(this.inbox());let n=0;const hi=()=>{if(c.open)return clearInterval(c.retry);if(++n>8){clearInterval(c.retry);this.conns.delete('host');this.emit('error',{type:'peer-unavailable'});return;}this._send('host','hi');};
    c.retry=setInterval(hi,1000);setTimeout(hi,200);return c;}
  destroy(){this.dead=true;clearInterval(this.watch);for(const c of [...this.conns.values()])c.close();if(this.m)this.m.close();}
}
const useP2P=()=>location.hash==='#p2p';   // 网址末尾加 #p2p 改用旧的 PeerJS 直连
function loadPeerJS(){return new Promise((res,rej)=>{if(window.Peer)return res();const s=document.createElement('script');s.src='https://unpkg.com/peerjs@1.5.4/dist/peerjs.min.js';s.onload=()=>res();s.onerror=()=>rej(new Error('load'));document.head.appendChild(s);});}
const PEER_PREFIX='abysscov-';
function netErrText(err){const t=err&&err.type;if(t==='peer-unavailable')return'找不到这个房间，请检查房间码。';
  if(t==='unavailable-id')return'房间码冲突，请再试一次。';
  if(t==='relay-unreachable')return'连不上中继服务器（broker.emqx.io）。请检查网络；Claude 页面里不能联机，请用 GitHub Pages 版或离线版。';
  return'无法连接联机服务器。注意：Claude 页面里不能联机，请在 GitHub Pages 版本中打开游戏。'+(t?'（'+t+'）':'');}
function myName(){return CLS_INFO[cls].name;}
async function hostRoom(){
  if(useP2P())try{await loadPeerJS();}catch(e){return netFail('无法加载联机组件。请在 GitHub Pages 版本中打开游戏。');}
  netReset();net.code=Array.from({length:5},()=>'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'[Math.floor(Math.random()*32)]).join('');
  if(!useP2P())net.code=withRelay(net.code,0);   // 先按主服务器定好房间码，免得连上后变
  let peer;try{peer=useP2P()?new Peer(PEER_PREFIX+net.code):new RelayPeer(PEER_PREFIX+net.code);}catch(e){return netFail(netErrText(e));}
  net.peer=peer;net.mode='host';showLobby('正在创建房间…');
  peer.on('open',id=>{net.myId=id;if(peer.relay)net.code=peer.code;net.lobby=[{id,name:myName()+'（房主）',cls}];renderLobby();});
  peer.on('connection',c=>{c.on('open',()=>{net.conns.set(c.peer,c);});c.on('data',d=>{try{hostRecv(c.peer,deser(d));}catch(err){console.error('net',err);}});c.on('close',()=>hostDrop(c.peer));});
  peer.on('error',err=>netFail(netErrText(err)));
}
async function joinRoom(code){
  code=(code||'').trim().toUpperCase();if(code.length<4){$('netMsg').textContent='请输入房间码';return;}
  if(useP2P())try{await loadPeerJS();}catch(e){return netFail('无法加载联机组件。请在 GitHub Pages 版本中打开游戏。');}
  netReset();let peer;try{peer=useP2P()?new Peer():new RelayPeer(null,relayOf(code));}catch(e){return netFail(netErrText(e));}
  net.peer=peer;showLobby('正在连接房间 '+code+' …');
  peer.on('open',id=>{net.myId=id;const c=peer.connect(PEER_PREFIX+code,{reliable:true});net.conn=c;
    c.on('open',()=>{net.mode='client';net.code=code;sendNet({t:'hello',cls,name:myName()});});
    c.on('data',d=>{try{clientRecv(deser(d));}catch(err){console.error('net',err);}});
    c.on('close',()=>{if(net.mode==='client')hostLost();});});
  peer.on('error',err=>netFail(netErrText(err)));
}
function netReset(){try{for(const c of net.conns.values())c.close();if(net.conn)net.conn.close();if(net.peer)net.peer.destroy();}catch(e){}
  for(const r of net.remotes.values())if(r.model)scene.remove(r.model);
  Object.assign(net,{mode:'solo',peer:null,conn:null,myId:'me',code:'',lobby:[],inMatch:false});net.conns=new Map();net.remotes=new Map();}
function netFail(msg){netReset();showLobby(msg,true);}
function hostLost(){const inGame=net.inMatch;netReset();if(inGame&&state!=='hub'){enterHub();}showLobby('房主已断开连接。',true);}
function leaveRoom(){netReset();$('lobby').classList.remove('show');}
// ---------- 大厅界面
function showLobby(msg,isErr){$('lobby').classList.add('show');$('netMsg').textContent=msg||'';$('netMsg').style.color=isErr?'#e05a4a':'#a8977c';renderLobby();}
function renderLobby(){
  $('lobbyCode').textContent=net.code?net.code:'—';
  $('lobbyList').innerHTML=net.lobby.map(p=>`<div class="slot ${p.id===net.myId?'me':''}">${p.name}</div>`).join('')+Array.from({length:Math.max(0,3-net.lobby.length)},()=>'<div class="slot wait">空位</div>').join('');
  $('lobbyStart').style.display=isHost()&&net.lobby.length>0?'':'none';
  if(isClient())$('netMsg').textContent='已加入，等待房主开始行动…';else if(isHost()&&net.myId!=='me')$('netMsg').textContent='把房间码发给朋友，他们在「加入房间」里输入即可。最多 3 人。';
}
// ---------- 房主收到消息
function hostRecv(id,m){
  let r=net.remotes.get(id);
  if(m.t==='aura'){auraAt(m.x,m.z);bcast({t:'aura',x:m.x,z:m.z},id);return;}
  if(m.t==='hello'){r={id,name:m.name,cls:m.cls,pos:new THREE.Vector3(),yaw:0,pitch:0,hp:100,maxHp:100,dead:false,model:null,tp:new THREE.Vector3()};net.remotes.set(id,r);
    net.lobby.push({id,name:m.name,cls:m.cls});bcast({t:'lobby',list:net.lobby});renderLobby();
    if(net.inMatch){sendTo(id,{t:'start',seed,mid:true,th:match.threat});annTeam('轨道空投信号已确认——'+m.name+' 降临战场。',3);}
    return;}
  if(!r)return;
  if(m.t==='state'){r.tp.set(m.x,m.y,m.z);r.yaw=m.yaw;r.pitch=m.pitch;r.hp=m.hp;r.maxHp=m.maxHp;r.dead=m.dead;r.inMatch=true;if(!r.pos.lengthSq())r.pos.copy(r.tp);}
  else if(m.t==='dmg'){const e=enemyById(m.id);if(e&&e.alive)damageEnemy(e,m.dmg,m.part,m.dir||null,{...m.o,_remote:true});}
  else if(m.t==='sever'){const e=enemyById(m.id);if(e&&e.alive&&e.parts[m.part].parent===e.g){detach(e,m.part,null);e.armHp[m.part]=Infinity;e.arms--;}}
  else if(m.t==='stun'){const e=enemyById(m.id);if(e&&e.alive){e.stagger=Math.max(e.stagger,m.dur);e.kv.set(0,0,0);}}
  else if(m.t==='interact'){const it=interactables[m.idx];if(it&&!it.used)interact(it,r);}
  else if(m.t==='cast'){asRemote(r,()=>{if(m.k==='lift')castLift(true);else if(m.k==='hole')castHole(true,id);});}
  else if(m.t==='beacon'){callBeacon(r.pos.clone());}
  else if(m.t==='dead'){r.dead=true;annTeam(r.name+' 阵亡了！',2);checkWipe();}
}
function hostDrop(id){const r=net.remotes.get(id);if(r&&r.model)scene.remove(r.model);net.remotes.delete(id);net.conns.delete(id);
  net.lobby=net.lobby.filter(p=>p.id!==id);bcast({t:'lobby',list:net.lobby});renderLobby();if(r&&net.inMatch){annTeam(r.name+' 离开了队伍',2);checkWipe();}}
function asRemote(r,fn){const sp=player.pos.clone(),sy=player.yaw,spi=player.pitch,cp=camera.position.clone(),cq=camera.quaternion.clone();
  player.pos.copy(r.pos);player.yaw=r.yaw;player.pitch=r.pitch;camera.position.set(r.pos.x,r.pos.y+1.6,r.pos.z);camera.rotation.set(r.pitch,r.yaw,0,'YXZ');
  try{fn();}finally{player.pos.copy(sp);player.yaw=sy;player.pitch=spi;camera.position.copy(cp);camera.quaternion.copy(cq);}}
function checkWipe(){if(!isHost()||!net.inMatch)return;const meAlive=player.hp>0&&(state==='playing'||state==='cutscene'||state==='ready');
  if(!meAlive&&![...net.remotes.values()].some(r=>!r.dead&&r.inMatch))endMatch(false);}
// ---------- 队友收到消息
function clientRecv(m){
  if(m.t==='lobby'){net.lobby=m.list;renderLobby();}
  else if(m.t==='start'){pendingThreat=m.th||1;beginNetMatch(m.seed,m.mid);}
  else if(m.t==='snap'){applySnapshot(m);}
  else if(m.t==='kill'){const e=enemyById(m.id);if(e&&e.alive){const mine=(net.lastDmg.get(m.id)||-9)>gameTime-0.6;const ch=player.exCharge;killEnemy(e,m.dir||null,true,m.how||{});if(!mine)player.exCharge=ch;}}
  else if(m.t==='drop'){spawnPickup(m.type,m.x,m.z);}
  else if(m.t==='ann'){announce(m.text,m.dur);}
  else if(m.t==='aura'){auraAt(m.x,m.z);}
  else if(m.t==='fx'&&m.k==='slam'){slamFx(m.x,m.z);}
  else if(m.t==='spit'){addSpit(new THREE.Vector3(...m.p),new THREE.Vector3(...m.v),0,null,true);play('spit');}
  else if(m.t==='hurt'){hurtPlayer(m.n,false,enemyById(m.att)||null);}
  else if(m.t==='fx'){if(m.k==='hole')spawnHoleVisual(m.p);else if(m.k==='beacon')beaconVisual(m.p);}
  else if(m.t==='end'){if(state!=='result'&&state!=='hub')endMatch(m.win);}
}
// ---------- 开局
$('lobbyStart').onclick=()=>{if(!isHost())return;initAudio();actx.resume?.();net.inMatch=true;const s=Math.floor(Math.random()*1e9);pendingThreat=loadout.threat||1;bcast({t:'start',seed:s,th:pendingThreat});beginNetMatch(s,false);};
function beginNetMatch(s,mid){initAudio();net.inMatch=true;$('lobby').classList.remove('show');$('hub').classList.remove('show');$('matching').classList.remove('show');
  for(const r of net.remotes.values()){if(r.model)scene.remove(r.model);r.model=null;r.dead=false;}
  prepareMatch(s);startCutscene();}
// ---------- 快照
function buildSnapshot(){
  const en=[];for(const e of enemies){if(!e.alive)continue;const p=e.g.position;
    en.push([e.id,ETYPES.indexOf(e.type),e.elite?1:0,+p.x.toFixed(2),+p.z.toFixed(2),+e.g.rotation.y.toFixed(2),+p.y.toFixed(2),Math.round(e.hp),Math.round(e.maxHp),(e.parts.armL.parent!==e.g?1:0)|(e.parts.armR.parent!==e.g?2:0),+(e.g.scale.x/e.s0).toFixed(2),+(e.g.scale.y/e.s0).toFixed(2),e.stagger>0||e.stun>0?1:0]);}
  const pl=[[net.myId,+player.pos.x.toFixed(2),+player.pos.y.toFixed(2),+player.pos.z.toFixed(2),+player.yaw.toFixed(2),Math.round(player.hp),player.maxHp,(player.hp<=0||state==='spectate'||state==='dying')?1:0,cls]];
  for(const r of net.remotes.values())if(r.inMatch)pl.push([r.id,+r.pos.x.toFixed(2),+r.pos.y.toFixed(2),+r.pos.z.toFixed(2),+r.yaw.toFixed(2),r.hp,r.maxHp,r.dead?1:0,r.cls]);
  const used=[];interactables.forEach((it,i)=>{if(it.used)used.push(i);});
  return{t:'snap',en,pl,used,m:{conds:match.conds,parts:match.parts,carried:match.carried,loot:match.loot,safeLoot:match.safeLoot,rare:match.rare,beacons:match.beacons,launching:match.launching,hack:match.hack,ritual:match.ritual,kills:match.kills,elites:match.elites}};
}
function applySnapshot(s){
  if(!match||state==='hub'||state==='result')return;
  const seen=new Set();
  for(const row of s.en){const [id,ty,el,x,z,ry,y,hp,mhp,arms,sx,sy,stg]=row;seen.add(id);let e=enemyById(id);
    if(!e){e=spawnEnemy(ETYPES[ty]||'imp',x,z,!!el);e.id=id;e.remote=true;}
    if(!e.alive)continue;e.tx=x;e.tz=z;e.ty=y;e.try=ry;e.hp=hp;e.maxHp=mhp;e.netStag=stg;
    if((arms&1)&&e.parts.armL.parent===e.g){detach(e,'armL',null);e.arms--;e.armHp.armL=Infinity;}
    if((arms&2)&&e.parts.armR.parent===e.g){detach(e,'armR',null);e.arms--;e.armHp.armR=Infinity;}
    e.g.scale.set(e.s0*sx,e.s0*sy,e.s0*sx);}
  for(const e of enemies){if(!e.alive||seen.has(e.id))continue;const n=(net.missing.get(e.id)||0)+1;net.missing.set(e.id,n);if(n>=3){e.alive=false;scene.remove(e.g);}}
  for(const row of s.pl){const [id,x,y,z,yaw,hp,mhp,dead,c]=row;if(id===net.myId)continue;let r=net.remotes.get(id);
    if(!r){r={id,cls:c,pos:new THREE.Vector3(x,y,z),tp:new THREE.Vector3(),yaw,model:null};net.remotes.set(id,r);}
    r.tp.set(x,y,z);r.yaw=yaw;r.hp=hp;r.maxHp=mhp;r.dead=!!dead;r.cls=c;r.inMatch=true;}
  for(const id of [...net.remotes.keys()])if(!s.pl.some(p=>p[0]===id)){const r=net.remotes.get(id);if(r.model)scene.remove(r.model);net.remotes.delete(id);}
  const partsBefore=JSON.stringify(match.parts);Object.assign(match,s.m);if(JSON.stringify(match.parts)!==partsBefore)updatePodLook();
  for(const i of s.used){const it=interactables[i];if(it&&!it.used){it.used=true;scene.remove(it.m);}}
}
// 队友这边：敌人只做插值和动画
function updateEnemiesClient(dt){
  for(const e of enemies){if(!e.alive||e.tx===undefined)continue;const p=e.g.position;
    const dx=e.tx-p.x,dz=e.tz-p.z,moving=Math.hypot(dx,dz)>0.05;
    const k=Math.min(1,dt*12);p.x+=dx*k;p.z+=dz*k;p.y+=(e.ty-p.y)*k;
    let dr=e.try-e.g.rotation.y;dr=Math.atan2(Math.sin(dr),Math.cos(dr));e.g.rotation.y+=dr*k;
    e.lean=Math.max(0,e.lean-dt*4);e.parts.body.rotation.x=-e.lean*0.45;e.flash-=dt;
    e.mat.emissive.setHex(e.flash>0?0xffffff:(canExecute(e)?0x774400:0x000000));
    if(moving&&!e.netStag){e.walk+=dt*e.speed*2;e.parts.legL.rotation.x=Math.sin(e.walk)*.6;e.parts.legR.rotation.x=-Math.sin(e.walk)*.6;}
    e.growl-=dt;if(e.growl<=0){e.growl=4+Math.random()*6;if(p.distanceTo(player.pos)<14)play('growl');}}
}
// ---------- 队友的模型
function updateRemotes(dt){
  for(const r of net.remotes.values()){if(!r.inMatch||!r.tp)continue;
    if(!r.model){r.model=buildCharacter(r.cls||'ward');scene.add(r.model);}
    r.pos.lerp(r.tp,Math.min(1,dt*12));r.model.position.set(r.pos.x,r.pos.y,r.pos.z);r.model.rotation.set(r.dead?-Math.PI/2:0,r.yaw+Math.PI,0);
    if(r.dead)r.model.position.y=0.3;}
}
// ---------- 每帧网络收发
function netTick(dt){
  if(!isNet()||!net.inMatch)return;
  updateRemotes(dt);
  if(isHost()){net.snapT-=dt;if(net.snapT<=0){net.snapT=1/12;if(match&&state!=='hub'&&state!=='result')bcast(buildSnapshot());}}
  else if(isClient()){net.stateT-=dt;if(net.stateT<=0){net.stateT=1/15;
    sendNet({t:'state',x:+player.pos.x.toFixed(2),y:+player.pos.y.toFixed(2),z:+player.pos.z.toFixed(2),yaw:+player.yaw.toFixed(3),pitch:+player.pitch.toFixed(3),hp:Math.round(player.hp),maxHp:player.maxHp,dead:player.hp<=0||state==='spectate'||state==='dying'});}}
}
// ---------- 敌人目标：离谁近打谁
function targetsList(){const t=[];if(state==='playing'&&player.hp>0)t.push({pos:player.pos,local:true});
  for(const r of net.remotes.values())if(r.inMatch&&!r.dead)t.push({pos:r.pos,remote:r});return t;}
let distCache=new Map(),distCacheT=0;
function distFor(pi,pj){const k=pi+','+pj;let d=distCache.get(k);if(!d){d=bfs(pi,pj);distCache.set(k,d);}return d;}
function anyPlayerNear(x,z,r){if(state==='playing'&&Math.hypot(player.pos.x-x,player.pos.z-z)<r)return true;for(const q of net.remotes.values())if(q.inMatch&&!q.dead&&Math.hypot(q.pos.x-x,q.pos.z-z)<r)return true;return false;}
// ---------- 观战
function spectateCam(dt){const alive=[...net.remotes.values()].filter(r=>r.inMatch&&!r.dead);const r=alive[0];
  if(!r){return;}const back=new THREE.Vector3(Math.sin(r.yaw)*4,3.2,Math.cos(r.yaw)*4);camera.position.lerp(r.pos.clone().add(back),Math.min(1,dt*4));camera.lookAt(r.pos.x,r.pos.y+1.4,r.pos.z);}
function spawnHoleVisual(P){const g=new THREE.Group();g.position.copy(P);scene.add(g);
  g.add(new THREE.Mesh(new THREE.SphereGeometry(.55,10,8),new THREE.MeshBasicMaterial({color:0x000000})));
  const ring=new THREE.Mesh(new THREE.TorusGeometry(1.3,.12,4,24),new THREE.MeshBasicMaterial({color:0xb050ff}));ring.rotation.x=Math.PI/2.3;g.add(ring);
  const halo=new THREE.Mesh(new THREE.SphereGeometry(2.2,12,8),new THREE.MeshBasicMaterial({color:0x3a0060,transparent:true,opacity:.35,depthWrite:false}));g.add(halo);
  holes.push({P,t:0,dur:3,g,ring,halo,tick:0,caught:new Set(),visual:true});play('hole');}
function beaconVisual(p){const b=new THREE.Mesh(new THREE.SphereGeometry(.5,8,6),new THREE.MeshBasicMaterial({color:0xd8a657}));b.position.copy(p).setY(2);scene.add(b);beams.push({m:b,life:3,rise:true});play('beacon');}

