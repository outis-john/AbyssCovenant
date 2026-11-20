// ============================================================ 局外：战舰整备甲板
const hubScene=new THREE.Scene(), hubCam=new THREE.PerspectiveCamera(48,innerWidth/innerHeight,0.1,300);
window.__hubCam=hubCam;
const hub={char:null,rot:0.5,drag:false,lastX:0,runes:[],orb:null,t:0};
const texDeck=pixelTex((g,s)=>{noisy(g,s,[58,60,66],14);g.fillStyle='#1a1c22';g.fillRect(0,0,s,1);g.fillRect(0,0,1,s);g.fillStyle='#8a7a40';g.fillRect(2,2,1,1);g.fillRect(s-3,s-3,1,1);});
const texStars=pixelTex((g,s)=>{g.fillStyle='#03040c';g.fillRect(0,0,s,s);for(let i=0;i<60;i++){g.fillStyle=Math.random()<.2?'#9ab0ff':'#ffffff';g.fillRect(Math.random()*s|0,Math.random()*s|0,1,1);}
  g.fillStyle='#3a1a4a';g.beginPath();g.arc(s*0.8,s*0.9,s*0.35,0,7);g.fill();g.fillStyle='#5a2a6a';g.beginPath();g.arc(s*0.78,s*0.88,s*0.3,0,7);g.fill();},64);
const texBanner=pixelTex((g,s)=>{g.fillStyle='#6a1410';g.fillRect(0,0,s,s);g.fillStyle='#d8a657';g.fillRect(0,0,s,2);g.fillRect(0,s-2,s,2);
  g.beginPath();g.arc(s/2,s*0.42,s*0.16,0,7);g.fill();g.fillRect(s*0.15,s*0.4,s*0.7,2);g.fillRect(s/2-1,s*0.55,2,s*0.3);g.fillStyle='#6a1410';g.fillRect(s/2-3,s*0.38,2,2);g.fillRect(s/2+1,s*0.38,2,2);},32);
function buildHub(){
  const S=hubScene;S.background=new THREE.Color(0x04050a);S.fog=new THREE.Fog(0x04050a,16,42);
  S.add(new THREE.HemisphereLight(0x50608a,0x140808,0.7));
  const key=new THREE.SpotLight(0xffe2b8,160,30,0.42,0.6,2);key.position.set(2.5,9,6);key.target.position.set(0,1,0);S.add(key,key.target);
  hub.rim=new THREE.PointLight(0x9a40ff,28,12,2);hub.rim.position.set(-2.5,3,-2);S.add(hub.rim);
  const warm=new THREE.PointLight(0xff7a30,30,18,2);warm.position.set(6,2.5,-3);S.add(warm);
  const warm2=new THREE.PointLight(0xff7a30,20,14,2);warm2.position.set(-7,2.5,-1);S.add(warm2);
  const fg=new THREE.PlaneGeometry(70,70);fg.attributes.uv.array.forEach((v,i,a)=>a[i]=v*28);
  const fl=new THREE.Mesh(fg,new THREE.MeshLambertMaterial({map:texDeck}));fl.rotation.x=-Math.PI/2;S.add(fl);
  const ped=new THREE.Mesh(new THREE.CylinderGeometry(1.6,1.9,0.4,12),matMetal);ped.position.y=0.2;S.add(ped);
  hub.ring=new THREE.Mesh(new THREE.TorusGeometry(1.72,0.05,4,28),new THREE.MeshBasicMaterial({color:0xd8a657}));hub.ring.rotation.x=Math.PI/2;hub.ring.position.y=0.42;S.add(hub.ring);
  const winMat=new THREE.MeshBasicMaterial({map:texStars});
  for(let i=-3;i<=3;i++){const x=i*5;
    const w=new THREE.Mesh(scaleBoxUV(new THREE.BoxGeometry(5,16,1),5,16,1),matBrick);w.position.set(x,8,-13);S.add(w);
    const win=new THREE.Mesh(new THREE.PlaneGeometry(2.6,7),winMat);win.position.set(x,6.5,-12.45);S.add(win);
    const arch=new THREE.Mesh(new THREE.CircleGeometry(1.3,12,0,Math.PI),winMat);arch.position.set(x,10,-12.45);S.add(arch);
    const pil=new THREE.Mesh(new THREE.BoxGeometry(1,16,1.4),matMetal);pil.position.set(x+2.5,8,-12.2);S.add(pil);
    if(i%2===0){const b=new THREE.Mesh(new THREE.PlaneGeometry(1.4,4.5),new THREE.MeshLambertMaterial({map:texBanner,side:THREE.DoubleSide}));b.position.set(x+2.5,10,-11.4);S.add(b);}
    for(const z of [-6,4]){const c=new THREE.Mesh(new THREE.BoxGeometry(.12,.35,.12),matCandle);c.position.set(x+2.5,.18,z<0?-11.2:-11.2);S.add(c);}
  }
  // 空降舱、货箱、线缆
  const pod=new THREE.Group();const pb=new THREE.Mesh(new THREE.CylinderGeometry(1.1,1.5,3.2,8),matMetal);pb.position.y=1.6;pod.add(pb);
  const pn=new THREE.Mesh(new THREE.ConeGeometry(1.1,1.3,8),matMetal);pn.position.y=3.85;pod.add(pn);
  const door=new THREE.Mesh(new THREE.PlaneGeometry(1,1.8),new THREE.MeshBasicMaterial({color:0xff8a40}));door.position.set(0,1.3,1.32);pod.add(door);
  pod.position.set(-6,0,-6);pod.rotation.y=0.5;S.add(pod);
  for(const [x,z,s] of [[5,-5,1.2],[6.3,-5.4,.9],[5.6,-6.6,1],[-4,-8.5,1.3]]){const c=new THREE.Mesh(scaleBoxUV(new THREE.BoxGeometry(s,s,s),s,s,s,1),matMetal);c.position.set(x,s/2,z);c.rotation.y=x;S.add(c);}
  for(let i=0;i<5;i++){const c=new THREE.Mesh(new THREE.CylinderGeometry(.07,.07,30,4),matDark);c.rotation.z=Math.PI/2;c.position.set(0,13+i*.25,-10+i*.6);S.add(c);}
  hubCam.position.set(0,2.1,5.6);hubCam.lookAt(0,1.35,0);
}
function buildCharacter(c){
  if(typeof EXTRA_MODELS!=='undefined'&&EXTRA_MODELS[c])return EXTRA_MODELS[c]();
  const g=new THREE.Group();const add=(geo,mat,x,y,z,parent=g)=>{const m=new THREE.Mesh(geo,mat);m.position.set(x,y,z);parent.add(m);return m;};
  const gold=new THREE.MeshLambertMaterial({color:0xb8952e,emissive:0x2a1a00});
  hub.runes=[];hub.orb=null;
  if(c==='ward'){
    const armor=new THREE.MeshLambertMaterial({map:texMetal,color:0x41557e});
    const dark=new THREE.MeshLambertMaterial({color:0x1c1f28});
    const red=new THREE.MeshLambertMaterial({color:0x7a1612});
    for(const sx of [-1,1]){add(new THREE.BoxGeometry(.36,.95,.42),armor,sx*.26,.55,0);add(new THREE.BoxGeometry(.42,.22,.55),dark,sx*.26,.11,.05);add(new THREE.BoxGeometry(.38,.2,.1),gold,sx*.26,.62,.22);}
    add(new THREE.BoxGeometry(.9,.25,.55),dark,0,1.08,0);
    add(new THREE.BoxGeometry(1.0,.85,.62),armor,0,1.6,0);
    add(new THREE.BoxGeometry(.45,.32,.08),gold,0,1.75,.32);
    add(new THREE.PlaneGeometry(.4,.9),red,0,.75,.3);
    add(new THREE.BoxGeometry(.85,.75,.4),dark,0,1.7,-.5);
    for(const sx of [-1,1]){add(new THREE.CylinderGeometry(.1,.14,.35,6),dark,sx*.22,2.2,-.55);}
    for(const sx of [-1,1]){
      const pa=add(new THREE.SphereGeometry(.4,8,6,0,Math.PI*2,0,Math.PI/2),armor,sx*.72,1.88,0);pa.scale.set(1,.8,1.1);
      add(new THREE.TorusGeometry(.4,.03,4,12),gold,sx*.72,1.88,0).rotation.x=Math.PI/2;
      add(new THREE.BoxGeometry(.28,.8,.3),armor,sx*.72,1.38,.05);add(new THREE.BoxGeometry(.3,.25,.32),dark,sx*.72,.92,.12);
    }
    const head=add(new THREE.BoxGeometry(.44,.46,.46),armor,0,2.28,.02);
    add(new THREE.BoxGeometry(.34,.07,.02),new THREE.MeshBasicMaterial({color:0xff3020}),0,.04,.235,head);
    add(new THREE.BoxGeometry(.08,.2,.5),gold,0,.25,0,head);
    const gun=new THREE.Group();gun.position.set(.38,1.2,.55);gun.rotation.set(-.2,-.5,.15);g.add(gun);
    add(new THREE.BoxGeometry(.16,.22,1.0),dark,0,0,0,gun);add(new THREE.BoxGeometry(.1,.1,.4),armor,0,.04,.65,gun);add(new THREE.BoxGeometry(.1,.28,.14),dark,0,-.2,-.05,gun);add(new THREE.BoxGeometry(.18,.05,.6),gold,0,.13,0,gun);
  } else {
    const robe=new THREE.MeshLambertMaterial({map:texFlesh,color:0x3a3046});
    const cloth=new THREE.MeshLambertMaterial({color:0x2a2232});
    const bone=new THREE.MeshLambertMaterial({color:0x8a8070});
    add(new THREE.ConeGeometry(.72,1.7,8),robe,0,.85,0);
    add(new THREE.CylinderGeometry(.3,.42,.7,8),cloth,0,1.95,0);
    add(new THREE.CylinderGeometry(.62,.5,.18,8),robe,0,2.22,0);
    add(new THREE.BoxGeometry(.5,.08,.06),gold,0,1.7,.4);
    for(const sx of [-1,1]){const a=add(new THREE.CylinderGeometry(.11,.15,.85,6),cloth,sx*.48,1.75,.05);a.rotation.z=sx*.25;}
    const hood=add(new THREE.SphereGeometry(.31,8,6),cloth,0,2.55,0);hood.scale.set(1,1.15,1.05);
    add(new THREE.PlaneGeometry(.32,.3),new THREE.MeshBasicMaterial({color:0x000000}),0,-.02,.29,hood);
    const eyeM=new THREE.MeshBasicMaterial({color:0xc070ff});
    add(new THREE.BoxGeometry(.06,.035,.01),eyeM,-.07,0,.3,hood);add(new THREE.BoxGeometry(.06,.035,.01),eyeM,.07,0,.3,hood);
    for(let i=0;i<3;i++){const t=add(new THREE.CylinderGeometry(.03,.03,.9,4),bone,-.15+i*.15,2.1,-.32);t.rotation.x=.5;}
    const staff=new THREE.Group();staff.position.set(.65,0,.25);g.add(staff);
    add(new THREE.CylinderGeometry(.04,.05,2.6,6),bone,0,1.3,0,staff);
    add(new THREE.BoxGeometry(.5,.05,.05),gold,0,2.45,0,staff);
    add(new THREE.TorusGeometry(.17,.025,4,10),gold,0,2.75,0,staff);
    hub.orb=add(new THREE.OctahedronGeometry(.13),new THREE.MeshBasicMaterial({color:0xd060ff}),0,2.75,0,staff);
    for(let i=0;i<6;i++){const r=new THREE.Mesh(new THREE.OctahedronGeometry(.07),new THREE.MeshBasicMaterial({color:i%2?0xa040ff:0x60ffb0}));g.add(r);hub.runes.push(r);}
  }
  g.position.y=0.42;return g;
}
const CLS_INFO={
  tide:{name:'唤潮者',desc:'帝国认可的灵能者。深渊在他耳边低语，他用符文把这股力量拧成武器。灵能用得越狠越强，也越危险。',stats:[['生命',100,150],['灵能槽',4,5],['过载上限',130,130],['枪械伤害',1,1.3],['减伤',0,.2]],
    perks:'灵能核心 4 槽 · 过载上限 +30% · 25% 概率免疫反噬'},
  ward:{name:'铸甲卫士',desc:'被基因改造的帝国精英，身披动力甲。枪械伤害更高、更耐打，但灵能天赋有限。',stats:[['生命',150,150],['灵能槽',3,5],['过载上限',100,130],['枪械伤害',1.3,1.3],['减伤',.2,.2]],
    perks:'灵能核心 3 槽 · 枪械伤害 +30% · 受到伤害 -20%'}};
function selectClass(c){
  cls=c;document.querySelectorAll('.card').forEach(el=>el.classList.toggle('sel',el.dataset.cls===c));
  if(hub.char)hubScene.remove(hub.char);hub.char=buildCharacter(c);if(typeof CLS!=='undefined'&&CLS[c]&&CLS[c].eye)hub.char.scale.multiplyScalar(.55);hubScene.add(hub.char);
  if(typeof CLS!=='undefined'){fixLoadoutForClass();try{localStorage.setItem('abyss_loadout',JSON.stringify(loadout));}catch(e){}applyLoadout();renderLoadout();}
  const I=CLS_INFO[c];
  $('clsInfo').innerHTML=`<h3>${I.name}</h3>${I.desc}<div style="margin:10px 0 4px">`+I.stats.map(([n,v,m])=>`<div class="stat"><span>${n}</span><i><b style="width:${Math.max(4,v/m*100)}%"></b></i></div>`).join('')+`</div><div class="small">${I.perks}</div>`;
  play('pickup');
}
function updateHub(dt){
  hub.t+=dt;if(!hub.drag)hub.rot+=dt*0.25;
  if(hub.char){hub.char.rotation.y=hub.rot;hub.char.scale.y=1+Math.sin(hub.t*1.6)*0.008;
    hub.runes.forEach((r,i)=>{const a=hub.t*0.9+i*Math.PI/3;r.position.set(Math.cos(a)*1.0,1.6+Math.sin(hub.t*2+i)*0.25,Math.sin(a)*1.0);r.rotation.y+=dt*2;});
    if(hub.orb)hub.orb.rotation.y+=dt*2;}
  hub.ring.material.color.setHSL(0.11,0.6,0.45+Math.sin(hub.t*2)*0.1);
  hub.rim.intensity=24+Math.sin(hub.t*3)*6;
  hubCam.position.x=Math.sin(hub.t*0.2)*0.25;hubCam.lookAt(0,1.35,0);
}
canvas.addEventListener('pointerdown',e=>{if(state==='hub'){hub.drag=true;hub.lastX=e.clientX;}});
addEventListener('pointerup',()=>hub.drag=false);
addEventListener('pointermove',e=>{if(hub.drag&&state==='hub'){hub.rot+=(e.clientX-hub.lastX)*0.01;hub.lastX=e.clientX;}});
document.querySelectorAll('.card').forEach(el=>el.onclick=()=>{initAudio();selectClass(el.dataset.cls);});

// 战舰仓库（保存在这个浏览器里）
function loadVault(){try{return JSON.parse(localStorage.getItem('abyss_vault'))||{loot:0,rare:0,runs:0,extracted:0};}catch(e){return{loot:0,rare:0,runs:0,extracted:0};}}
function saveVault(v){try{localStorage.setItem('abyss_vault',JSON.stringify(v));}catch(e){}}
function showVault(){const v=loadVault();$('vaultInfo').innerHTML=`<span>物资<b>${v.loot}</b></span><span>圣物<b style="color:#d070ff">${v.rare}</b></span><span title="出击 / 成功撤离">战绩<b>${v.extracted}/${v.runs}</b></span>`;}
function renderLoadout(){
  const mk=(el,list,key)=>{$(el).innerHTML=Object.values(list).filter(w=>{const a=typeof CLS!=='undefined'&&CLS[cls]&&CLS[cls][key==='primary'?'guns':'melee'];return !a||a.includes(w.id);}).map(w=>`<div class="opt ${loadout[key]===w.id?'sel':''}" data-k="${key}" data-id="${w.id}">${w.name}</div>`).join('');};
  mk('loPrimary',RANGED,'primary');mk('loMelee',MELEE,'melee');
  $('loDesc').innerHTML=`<b>${RANGED[loadout.primary].name}</b>：${RANGED[loadout.primary].desc}<br><b>${MELEE[loadout.melee].name}</b>：${MELEE[loadout.melee].desc}`;
  document.querySelectorAll('.opt').forEach(o=>o.onclick=()=>{initAudio();loadout[o.dataset.k]=o.dataset.id;try{localStorage.setItem('abyss_loadout',JSON.stringify(loadout));}catch(e){}play('equip');renderLoadout();});
}
function enterHub(){
  state='hub';document.body.classList.add('inhub');document.exitPointerLock?.();
  $('hub').classList.add('show');$('matching').classList.remove('show');$('result').classList.remove('show');$('ready').classList.remove('show');$('pause').classList.remove('show');
  $('hurt').style.opacity=0;$('warp').style.opacity=0;canvas.style.filter='';setProgress(-1);$('announce').style.opacity=0;
  if(actx){whisperGain.gain.value=0;}sawEngine(false,'idle');humEngine(false,false);swordOut=0;swing=0;MS.phase='none';ex.active=false;player.blocking=false;
  showVault();selectClass(cls);renderLoadout();renderShop();if(isNet())showLobby();
}

// ============================================================ 匹配
let mmTimers=[];
function startMatchmaking(){
  initAudio();actx.resume?.();
  state='matching';$('hub').classList.remove('show');$('matching').classList.add('show');
  $('slot0').textContent='你 · '+CLS_INFO[cls].name;
  for(const i of [1,2]){$('slot'+i).textContent='寻找中…';$('slot'+i).className='slot wait';}
  $('mmText').textContent='正在寻找队友……';$('mmCancel').style.display='';
  mmTimers=[
    setTimeout(()=>{for(const i of [1,2]){$('slot'+i).textContent='无人响应';$('slot'+i).className='slot';}$('mmText').textContent='未找到可用队友——以单人身份空降';},3200),
    setTimeout(()=>{$('mmCancel').style.display='none';$('mmText').textContent='空降舱发射中……';play('beacon');},5000),
    setTimeout(()=>{prepareMatch();$('matching').classList.remove('show');$('hub').classList.remove('show');startCutscene();},6600),
  ];
}
$('mmCancel').onclick=()=>{mmTimers.forEach(clearTimeout);enterHub();};
$('goBtn').onclick=()=>{if(isNet())leaveRoom();startMatchmaking();};
$('hostBtn').onclick=()=>{initAudio();hostRoom();};
$('joinBtn').onclick=()=>{initAudio();joinRoom($('joinCode').value);};
$('lobbyLeave').onclick=leaveRoom;

