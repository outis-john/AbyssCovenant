// ============================================================ 设置（Esc 暂停菜单 / 战舰里的“设置”按钮）+ 按键说明（H）
function loadSet(){const d={sens:1,vol:75,music:60,fov:80,pix:3,fps:false,seenHelp:false,voice:85};try{return Object.assign(d,JSON.parse(localStorage.getItem('abyss_settings'))||{});}catch(e){return d;}}
const SET=loadSet();
function saveSet(){try{localStorage.setItem('abyss_settings',JSON.stringify(SET));}catch(e){}}
function applySet(){camera.fov=SET.fov;camera.updateProjectionMatrix();PIX=SET.pix;resize();if(master)master.gain.value=0.75*SET.vol/75;
  perfMon.on=SET.fps;$('perf').style.display=SET.fps?'':'none';}
const SET_ROWS=[['sens','Mouse sensitivity',0.2,3,0.05,v=>v.toFixed(2)+'×'],['vol','Volume',0,100,1,v=>v+'%'],['music','Music volume',0,100,1,v=>v+'%'],['fov','Field of view',60,110,1,v=>v+'°'],['pix','Pixel size (bigger = more retro, smoother)',1,6,1,v=>v+''],['voice','Voice acting (0 = off)',0,100,1,v=>v?v+'%':'Off']];
function openSettings(){const b=$('setRows');
  b.innerHTML=SET_ROWS.map(([k,n,a,z,st])=>`<label class="setrow"><span>${n}</span><input type="range" id="set_${k}" min="${a}" max="${z}" step="${st}" value="${SET[k]}"><b id="setv_${k}"></b></label>`).join('')+
    `<label class="setrow"><span>Show FPS (F3)</span><input type="checkbox" id="set_fps" ${SET.fps?'checked':''}></label>`;
  for(const [k,,,,,f] of SET_ROWS){const el=$('set_'+k);const show=()=>{$('setv_'+k).textContent=f(+el.value);};show();el.oninput=()=>{SET[k]=+el.value;show();applySet();saveSet();};}
  $('set_fps').onchange=e=>{SET.fps=e.target.checked;applySet();saveSet();};
  $('settings').classList.add('show');if(typeof renderKeys==='function')renderKeys();}
$('setClose').onclick=()=>$('settings').classList.remove('show');
$('setBtn').onclick=openSettings;$('pauseSet').onclick=openSettings;
const HELP=[['WASD / Space / Shift','Move / jump / sprint'],['LMB · RMB','Attack · weapon special (charge, field, frenzy, pistol swap)'],['1 2 3 / Wheel','Primary · bolt pistol · melee'],['R','Reload'],['E','Raise shield (Sword & Shield; perfect timing parries / reflects fireballs)'],
  ['X','Execute (when charged): tap for quick execution, hold for full execution (terrifies nearby enemies); chain up to 2 more within 3s for free'],['V · G · Q','Psychic: Choke · Void Rift · Slow Time'],['C','Pyre Beam'],['Y','Squad order: aim at an enemy = focus fire · aim at ground = hold there · aim at sky / your feet = fall in'],['B (campaign)','Call fire support — Titan volcano cannon or orbital lance at the aimed point (rearm at resupply caches)'],['Tab','Dark gift (after a god corrupts you)'],['F','Interact / pick up'],['T','Auspex: see nearby demons through walls (non-psykers)'],['B','Call recovery beacon'],['M','Enlarge minimap'],['H','Show / hide this help'],['Esc','Pause / settings'],['F3','FPS']];
$('helpBody').innerHTML=HELP.map(([k,v])=>`<div class="hk"><b>${k}</b><span>${v}</span></div>`).join('');
function toggleHelp(on){const h=$('help');h.classList.toggle('show',on??!h.classList.contains('show'));}
$('pauseHelp').onclick=()=>toggleHelp(true);
applySet();
