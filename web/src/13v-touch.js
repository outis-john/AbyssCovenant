// ============================================================ 触屏操作（iPad / 平板）：左手虚拟摇杆移动，右手拖动看方向，右侧按键区开火/近战/技能
// 只在触屏设备（或网址带 #touch）启用；按键全部转成键盘/鼠标事件，和手柄走同一条路，所以联机、改键都照常工作。
const TOUCH={on:false,joy:null,look:null,fireId:null,ui:null,sprint:false,keys:{},fs:false};
TOUCH.on=(typeof location!=='undefined'&&/touch/.test(location.hash))||(typeof navigator!=='undefined'&&(navigator.maxTouchPoints||0)>0&&typeof matchMedia==='function'&&matchMedia('(pointer:coarse)').matches);
function tKey(code,down){if(!!TOUCH.keys[code]===down)return;TOUCH.keys[code]=down;padKey(code,down);}
function tMouse(btn,down){dispatchEvent(new MouseEvent(down?'mousedown':'mouseup',{button:btn}));}
const T_BTNS=[
  // id, 文字, 位置(right,bottom,size), 按下, 松开, 显示条件
  ['fire','FIRE',[118,96,104],()=>tMouse(0,true),()=>tMouse(0,false)],
  ['alt','ALT',[28,190,58],()=>tMouse(2,true),()=>tMouse(2,false)],
  ['jump','JUMP',[28,30,64],()=>tKey('Space',true),()=>tKey('Space',false)],
  ['reload','RELOAD',[28,110,58],()=>tKey('KeyR',true),()=>tKey('KeyR',false)],
  ['melee','MELEE',[240,40,62],()=>{if(state==='playing')switchWeapon(2);},null],
  ['swap','SWAP',[240,120,58],()=>{if(state==='playing')switchWeapon(cur===0?1:0);},null],
  ['exec','EXECUTE',[236,200,62],()=>tKey('KeyX',true),()=>tKey('KeyX',false)],
  ['use','USE',[128,228,56],()=>tKey('KeyF',true),()=>tKey('KeyF',false)],
  ['block','BLOCK',[316,40,54],()=>tKey('KeyE',true),()=>tKey('KeyE',false),()=>WEAPONS[cur]&&WEAPONS[cur].block],
  ['abil','ABILITY',[316,120,56],()=>tKey('KeyZ',true),()=>tKey('KeyZ',false),()=>!(CLS[cls]&&CLS[cls].psy)&&cls!=='tide'],
  ['psyV','CHOKE',[316,120,50],()=>tKey('KeyV',true),()=>tKey('KeyV',false),()=>cls==='tide'],
  ['psyG','RIFT',[316,184,50],()=>tKey('KeyG',true),()=>tKey('KeyG',false),()=>cls==='tide'],
  ['psyQ','SLOW',[380,150,50],()=>tKey('KeyQ',true),()=>tKey('KeyQ',false),()=>cls==='tide'],
  ['psyC','PYRE',[380,86,50],()=>tKey('KeyC',true),()=>tKey('KeyC',false),()=>cls==='tide'],
  ['god','GIFT',[316,250,50],()=>tKey('Tab',true),()=>tKey('Tab',false),()=>!!player.godSkill],
  ['order','ORDER',[28,270,50],()=>tKey('KeyY',true),()=>tKey('KeyY',false),()=>CAMP.on],
  ['strike','STRIKE',[90,300,50],()=>tKey('KeyB',true),()=>tKey('KeyB',false),()=>CAMP.on],
  ['scan','AUSPEX',[90,300,50],()=>tKey('KeyT',true),()=>tKey('KeyT',false),()=>!CAMP.on&&cls!=='tide']];
function buildTouchUI(){if(TOUCH.ui||!TOUCH.on)return;let ui;try{ui=document.createElement('div');}catch(err){return;}if(!ui||!ui.style)return;ui.id='touchUI';
  ui.innerHTML='<div id="tJoy"><div id="tKnob"></div></div><div id="tTop"><button id="tPause">❚❚</button><button id="tMap">MAP</button><button id="tFull">⛶</button></div><div id="tRot">Rotate to landscape</div>'+
    T_BTNS.map(([id,label,[r,b,s]])=>`<div class="tb" id="tb_${id}" style="right:${r}px;bottom:${b}px;width:${s}px;height:${s}px;line-height:${s}px;font-size:${s>90?15:11}px">${label}</div>`).join('');
  document.body.appendChild(ui);TOUCH.ui=ui;document.body.classList.add('touch');
  for(const [id,,,down,up] of T_BTNS){const el=$('tb_'+id);if(!el)continue;
    el.addEventListener('touchstart',e=>{e.preventDefault();e.stopPropagation();el.classList.add('on');for(const t of e.changedTouches){if(id==='fire'&&TOUCH.fireId===null){TOUCH.fireId=t.identifier;TOUCH.fireX=t.clientX;TOUCH.fireY=t.clientY;}}if(down)down();},{passive:false});
    const end=e=>{e.preventDefault();el.classList.remove('on');for(const t of e.changedTouches)if(t.identifier===TOUCH.fireId)TOUCH.fireId=null;if(up)up();};el.addEventListener('touchend',end,{passive:false});el.addEventListener('touchcancel',end,{passive:false});}
  $('tPause').onclick=()=>{if(state==='playing'){state='paused';$('pause').classList.add('show');}else if(state==='paused')resumeGame();};
  $('tMap').onclick=()=>$('mapWrap').classList.toggle('big');$('tFull').onclick=goFull;
  // 左半屏：摇杆（手指按下的位置就是摇杆中心）；右半屏：拖动转视角
  ui.addEventListener('touchstart',e=>{if(e.target.closest&&e.target.closest('.tb,#tTop'))return;e.preventDefault();if(!TOUCH.fs)goFull();
    for(const t of e.changedTouches){if(t.clientX<innerWidth*.42&&!TOUCH.joy){TOUCH.joy={id:t.identifier,x:t.clientX,y:t.clientY,dx:0,dy:0};const j=$('tJoy');j.style.display='block';j.style.left=t.clientX+'px';j.style.top=t.clientY+'px';}
      else if(!TOUCH.look)TOUCH.look={id:t.identifier,x:t.clientX,y:t.clientY};}},{passive:false});
  ui.addEventListener('touchmove',e=>{e.preventDefault();for(const t of e.changedTouches){
      if(TOUCH.joy&&t.identifier===TOUCH.joy.id){let dx=t.clientX-TOUCH.joy.x,dy=t.clientY-TOUCH.joy.y;const L=Math.hypot(dx,dy),R=60;if(L>R){dx*=R/L;dy*=R/L;}TOUCH.joy.dx=dx/R;TOUCH.joy.dy=dy/R;const k=$('tKnob');k.style.transform=`translate(${dx}px,${dy}px)`;}
      else if((TOUCH.look&&t.identifier===TOUCH.look.id)||t.identifier===TOUCH.fireId){const o=t.identifier===TOUCH.fireId?{x:TOUCH.fireX,y:TOUCH.fireY}:TOUCH.look;const dx=t.clientX-o.x,dy=t.clientY-o.y;o.x=t.clientX;o.y=t.clientY;
        if(t.identifier===TOUCH.fireId){TOUCH.fireX=t.clientX;TOUCH.fireY=t.clientY;}if(state==='playing'){const k=.0055*SET.sens*(camera.fov<40?.35:1);player.yaw-=dx*k;player.pitch=clamp(player.pitch-dy*k,-1.5,1.5);}}}},{passive:false});
  const endT=e=>{for(const t of e.changedTouches){if(TOUCH.joy&&t.identifier===TOUCH.joy.id){TOUCH.joy=null;$('tJoy').style.display='none';$('tKnob').style.transform='';}if(TOUCH.look&&t.identifier===TOUCH.look.id)TOUCH.look=null;}};
  ui.addEventListener('touchend',endT);ui.addEventListener('touchcancel',endT);
  // 战斗外（菜单、过场）点屏幕：过场可以点击跳过
  ui.addEventListener('click',()=>{if(state==='scene')endScene(true);else if(state==='cutscene'&&typeof endCutscene==='function')endCutscene();});}
function goFull(){TOUCH.fs=true;const d=document.documentElement;try{(d.requestFullscreen||d.webkitRequestFullscreen||(()=>{})).call(d);}catch(err){}}
function touchTick(){if(!TOUCH.on)return;if(!TOUCH.ui)buildTouchUI();const ui=TOUCH.ui;if(!ui||!ui.style)return;
  const show=(state==='playing'||state==='scene')&&!document.body.classList.contains('inhub');ui.style.display=show?'block':'none';ui.classList.toggle('scene',state==='scene');
  const rot=$('tRot');if(rot&&rot.style)rot.style.display=innerHeight>innerWidth?'flex':'none';
  if(state!=='playing'){if(TOUCH.joy){TOUCH.joy=null;const j=$('tJoy');if(j)j.style.display='none';}for(const k of ['KeyW','KeyA','KeyS','KeyD','ShiftLeft'])tKey(k,false);return;}
  pad.active=true;// 不需要鼠标锁定也能开火
  const J=TOUCH.joy;const x=J?J.dx:0,y=J?J.dy:0;tKey('KeyW',y<-.3);tKey('KeyS',y>.3);tKey('KeyA',x<-.3);tKey('KeyD',x>.3);tKey('ShiftLeft',Math.hypot(x,y)>.92);
  for(const [id,,,,,cond] of T_BTNS){const el=$('tb_'+id);if(el&&el.style)el.style.display=!cond||cond()?'block':'none';}
  const ex=$('tb_exec');if(ex&&ex.classList)ex.classList.toggle('ready',player.exCharge>=100);}
const _frV=frame;frame=function(t){_frV(t);touchTick();};
// 触屏设备：按键说明换成触屏操作说明（点一下关闭），出发按钮文案
if(TOUCH.on){try{const h=$('help');if(h&&h.innerHTML!==undefined){h.innerHTML='<div style="font:600 16px Oswald,sans-serif;letter-spacing:2px;color:#f0d890;margin-bottom:8px">TOUCH CONTROLS <span style="font-size:11px;opacity:.7">(tap to close)</span></div>'+
  [['Left thumb','Drag anywhere on the left side — move (push to the edge to sprint)'],['Right thumb','Drag on the right side — look around'],['FIRE','Hold to fire / attack. Drag while holding to aim'],
   ['ALT','Weapon special (charge, field, frenzy)'],['MELEE · SWAP','Switch to melee · swap primary / pistol'],['EXECUTE','Tap for a quick execution, hold for a full one'],['USE','Interact, revive brothers, man guns'],
   ['ABILITY','Class ability (Tidecaller: Choke · Rift · Slow · Pyre)'],['ORDER · STRIKE','Campaign: squad order at what you aim · call fire support'],['❚❚ · MAP · ⛶','Pause · tactical map · fullscreen']]
   .map(([k,v])=>`<div style="display:flex;gap:12px;margin:3px 0"><b style="min-width:120px;color:#e8d9a0">${k}</b><span>${v}</span></div>`).join('');h.addEventListener('click',()=>toggleHelp(false));}
  const r=$('readyBtn');if(r)r.textContent='Tap to deploy';}catch(err){}}
