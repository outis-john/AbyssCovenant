// ============================================================ 按键自定义 + 手柄
// 改键：把玩家按的键翻译成默认键再交给原来的处理函数（捕获阶段拦截，重新派发）
const ACTIONS=[['KeyW','Forward'],['KeyS','Back'],['KeyA','Left'],['KeyD','Right'],['Space','Jump'],['ShiftLeft','Sprint'],['KeyR','Reload'],['KeyF','Interact'],['KeyX','Execute'],['KeyZ','Class ability'],['KeyT','Auspex'],
  ['KeyE','Block'],['KeyB','Beacon'],['KeyM','Map'],['KeyV','Choke'],['KeyG','Void Rift'],['KeyQ','Slow Time'],['KeyC','Rune skill'],['KeyH','Help']];
let REMAP={},BLOCK=new Set();
function rebuildRemap(){REMAP={};BLOCK=new Set();const b=SET.keys||{};const used=new Set(Object.values(b));
  for(const [def] of ACTIONS){const k=b[def];if(k&&k!==def){REMAP[k]=def;if(!used.has(def)||Object.keys(b).every(d=>b[d]!==def))BLOCK.add(def);}}
  for(const k in REMAP)BLOCK.delete(k);}
rebuildRemap();
let rebinding=null;
for(const type of ['keydown','keyup'])addEventListener(type,e=>{
  if(rebinding&&type==='keydown'){e.preventDefault();e.stopImmediatePropagation();if(e.code!=='Escape'){SET.keys=SET.keys||{};SET.keys[rebinding]=e.code;saveSet();rebuildRemap();}rebinding=null;renderKeys();return;}
  if(e.isTrusted===false&&e._re)return;const d=REMAP[e.code];
  if(d){e.stopImmediatePropagation();e.preventDefault?.();const n=new KeyboardEvent(type,{code:d,repeat:e.repeat});n._re=true;dispatchEvent(n);return;}
  if(BLOCK.has(e.code)&&e.isTrusted!==false)e.stopImmediatePropagation();},true);
const keyName=c=>c.replace(/^Key/,'').replace(/^Digit/,'').replace('ShiftLeft','Left Shift').replace('Space','Space');
function renderKeys(){const el=$('keyRows');if(!el)return;const b=SET.keys||{};
  el.innerHTML=ACTIONS.map(([d,n])=>`<label class="setrow"><span>${n}</span><button class="kb" data-act="${d}">${rebinding===d?'Press any key...':keyName(b[d]||d)}</button><b></b></label>`).join('')+'<button id="keyReset">Reset to defaults</button>';
  el.querySelectorAll('[data-act]').forEach(x=>x.onclick=()=>{rebinding=x.dataset.act;renderKeys();});$('keyReset').onclick=()=>{SET.keys={};saveSet();rebuildRemap();renderKeys();};}
// ---------- 手柄（标准布局）：左摇杆移动、右摇杆视角、RT 开火、LT 右键功能、A 跳、X 换弹、B 处决、Y 切武器、LB 职业技能、RB 近战、十字键 互动/回收/锁喉/黑洞、Start 暂停
const pad={active:false,prev:[],keysSet:{}};
const PAD_KEYS={0:'Space',2:'KeyR',1:'KeyX',4:'KeyZ',8:'KeyM',10:'ShiftLeft',12:'KeyF',13:'KeyB',14:'KeyV',15:'KeyG',11:'KeyE'};
function padKey(code,down){const ev=new KeyboardEvent(down?'keydown':'keyup',{code});ev._re=true;dispatchEvent(ev);}
function updatePad(dt){const gp=navigator.getGamepads?navigator.getGamepads()[0]:null;if(!gp)return;
  const b=i=>gp.buttons[i]&&gp.buttons[i].pressed,dz=v=>Math.abs(v)<.22?0:v;
  if(!pad.active&&gp.buttons.some(x=>x.pressed)){pad.active=true;announce('Gamepad connected',1.2);}if(!pad.active)return;
  const lx=dz(gp.axes[0]),ly=dz(gp.axes[1]),rx=dz(gp.axes[2]),ry=dz(gp.axes[3]);
  for(const [k,on] of [['KeyW',ly<-.3],['KeyS',ly>.3],['KeyA',lx<-.3],['KeyD',lx>.3]]){if(on!==!!pad.keysSet[k]){pad.keysSet[k]=on;keys[k]=on;}}
  if(state==='playing'){player.yaw-=rx*2.6*dt*SET.sens;player.pitch=clamp(player.pitch-ry*1.9*dt*SET.sens,-1.5,1.5);}
  for(let i=0;i<gp.buttons.length;i++){const now=b(i),was=!!pad.prev[i];if(now===was)continue;pad.prev[i]=now;
    if(PAD_KEYS[i])padKey(PAD_KEYS[i],now);
    else if(i===7){dispatchEvent(new MouseEvent(now?'mousedown':'mouseup',{button:0}));}
    else if(i===6){dispatchEvent(new MouseEvent(now?'mousedown':'mouseup',{button:2}));}
    else if(i===3&&now&&state==='playing')switchWeapon(cur===0?2:0);
    else if(i===5&&now&&state==='playing')switchWeapon(2);
    else if(i===9&&now){if(state==='playing'){state='paused';$('pause').classList.add('show');}else if(state==='paused')resumeGame();}}}
