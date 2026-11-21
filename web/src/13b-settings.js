// ============================================================ 设置（Esc 暂停菜单 / 战舰里的“设置”按钮）+ 按键说明（H）
function loadSet(){const d={sens:1,vol:75,fov:80,pix:3,fps:false,seenHelp:false};try{return Object.assign(d,JSON.parse(localStorage.getItem('abyss_settings'))||{});}catch(e){return d;}}
const SET=loadSet();
function saveSet(){try{localStorage.setItem('abyss_settings',JSON.stringify(SET));}catch(e){}}
function applySet(){camera.fov=SET.fov;camera.updateProjectionMatrix();PIX=SET.pix;resize();if(master)master.gain.value=0.75*SET.vol/75;
  perfMon.on=SET.fps;$('perf').style.display=SET.fps?'':'none';}
const SET_ROWS=[['sens','鼠标灵敏度',0.2,3,0.05,v=>v.toFixed(2)+'×'],['vol','音量',0,100,1,v=>v+'%'],['fov','视野 FOV',60,110,1,v=>v+'°'],['pix','像素大小（越大越复古、越流畅）',1,6,1,v=>v+'']];
function openSettings(){const b=$('setRows');
  b.innerHTML=SET_ROWS.map(([k,n,a,z,st])=>`<label class="setrow"><span>${n}</span><input type="range" id="set_${k}" min="${a}" max="${z}" step="${st}" value="${SET[k]}"><b id="setv_${k}"></b></label>`).join('')+
    `<label class="setrow"><span>显示帧率（F3）</span><input type="checkbox" id="set_fps" ${SET.fps?'checked':''}></label>`;
  for(const [k,,,,,f] of SET_ROWS){const el=$('set_'+k);const show=()=>{$('setv_'+k).textContent=f(+el.value);};show();el.oninput=()=>{SET[k]=+el.value;show();applySet();saveSet();};}
  $('set_fps').onchange=e=>{SET.fps=e.target.checked;applySet();saveSet();};
  $('settings').classList.add('show');}
$('setClose').onclick=()=>$('settings').classList.remove('show');
$('setBtn').onclick=openSettings;$('pauseSet').onclick=openSettings;
const HELP=[['WASD / 空格 / Shift','移动 / 跳 / 冲刺'],['左键 · 右键','攻击 · 武器特殊功能（蓄力、力场、狂热、切手枪）'],['1 2 3 / 滚轮','主武器 · 爆弹手枪 · 近战'],['R','换弹'],['E','举盾格挡（剑盾，时机准可防反 / 弹反火球）'],
  ['X','处决（充能满时）：点按快速处决，按住完整处决（震慑周围敌人）；处决后 3 秒内可免充能连环处决 2 次'],['V · G · Q','灵能：锁喉提摔 · 黑洞 · 子弹时间'],['C · Tab','符文技能 · 拼装符文'],['F','互动 / 拾取'],['B','呼叫回收装置'],['M','放大小地图'],['H','显示 / 隐藏本说明'],['Esc','暂停 / 设置'],['F3','帧率']];
$('helpBody').innerHTML=HELP.map(([k,v])=>`<div class="hk"><b>${k}</b><span>${v}</span></div>`).join('');
function toggleHelp(on){const h=$('help');h.classList.toggle('show',on??!h.classList.contains('show'));}
$('pauseHelp').onclick=()=>toggleHelp(true);
applySet();
