// ============================================================ 任务引导 2.0：战术地图、地面路径箭头、“怎么做”提示、敌人方位标记、可选目标标记
// ---------------- 每一步的做法提示（显示在目标面板和 NEW OBJECTIVE 横幅下面）
const HINTS={
  '3-1':['Clear the militia around the landing site. More waves land until the area is safe.','Destroy the three vox-pylons marked in red. Melta, plasma and grenades work best.',
    'Man the heavy bolter on the barricade (F) and stop the counter-attack — tanks included.','Ride the Predator: LMB fires the pintle bolter. Press F to dismount when it stops.',
    'Kill the five Warsingers (red markers). Their scream warps your vision — close in fast.','Reach the gold beacon and hold F to force the undercroft gate.',
    'Push through the crypts toward the beacon. The Choir-Mistress waits in the deepest chamber.'],
  '3-2':['RUN. The virus wall rolls in from the north — reach the bunker gate before it catches you.','Follow the beacon room by room to the deep vault before the virus fills the tunnels.',
    'Survive the Sons of Horus kill-teams dropping into the ash.','Fight through to Captain Tarvitz and break the Emperor’s Children around him.','Make for the Precentor’s Palace beacon.'],
  '3-3':['Hold the palace ring against the first assault.','Destroy the traitor Predators — melta, plasma, heavy bolter or fire support (B).',
    'Hold F on each artillery battery to plant a melta charge, then get clear.','Get back to the palace before the final assault.','Hold the palace. Keep Ancient Hesk alive as long as you can.',
    'Defeat Oren Malk. Step out of the red circles — ground slam and grenades.'],
  '4-1':['Hold the landing zone. Death Guard shrug off bolts — aim for joints or close to melee.','Reach the trench line (gold beacon) and clear it. A Dreadnought guards the line.',
    'Man the heavy bolter (F) and break the World Eater charge.','Ride the Land Raider: LMB fires the pintle bolter. Press F to dismount at the firebase.',
    'Destroy both heavy weapon nests (red) and the Justaerin Terminators.'],
  '4-2':['Clear the last World Eaters while the second wave lands behind you.','Walk to the second wave’s landing zone and greet your cousins.',
    'Survive the crossfire. Keep moving — the Iron Warriors shell anyone standing still.','Break out east to the Raven Guard beacon.','Hold the ravine. Alpha Legion infiltrators will appear behind you.'],
  '4-3':['Keep the traitors off the landing pad until the gunship lifts off.','Defend the second gunship. Night Lords will drop from the sky.',
    'Defeat Lord Commander Eidolon. Dodge the hammer slam (red ring); break line of sight when he screams.']};
function curHint(){if(!CAMP.on)return'';if(CAMP.S&&CAMP.S.lull)return'Walk to the supply cache to rearm. Your squad is regrouping.';const H=HINTS[CAMP.id];return H&&H[CAMP.step]||'';}
const _cohG=campObjHtml;campObjHtml=function(){let h=_cohG();const t=curHint();if(t)h=h.replace(/(<div class="ocur">[\s\S]*?<\/div>)/,`$1<div class="ohint">${t}</div>`);
  if(!CAMP.wp&&GD.host)h+=`<div class="ohost">▲ Hostiles ${GD.host.n} · ${Math.round(GD.host.d)} m</div>`;return h;};
const _obG=objBanner;objBanner=function(text){_obG(text);const b=$('objBanner');const t=curHint();if(b&&b.innerHTML!==undefined&&t&&!/^OPTIONAL/.test(text))b.innerHTML+=`<em>${t}</em>`;};
// ---------------- 状态
const GD={path:null,pathT:0,host:null,hostT:0,crumbs:[],mapT:0,mk:{}};
// 没有航点时：标出最近的一群敌人
function hostileCluster(){let best=null,bs=-1;const L=enemies.filter(e=>e.alive&&(e.campaign||e.named));if(!L.length)return null;
  for(const e of L){let n=0;const c=V3(0,0,0);for(const o of L)if(o.g.position.distanceTo(e.g.position)<14){n++;c.add(o.g.position);}c.divideScalar(n).setY(0);const sc=n*3-c.distanceTo(player.pos)*.08;if(sc>bs){bs=sc;best={p:c,n:L.length,d:c.distanceTo(player.pos)};}}return best;}
// 屏幕上的方位标记（敌人 = 红、可选 = 青）
function mkEl(id,col){let w=GD.mk[id];if(w)return w;try{w=document.createElement('div');w.className='wpx';if(w.style)w.style.setProperty('--c',col);document.body.appendChild(w);}catch(err){w=null;}GD.mk[id]=w;return w;}
function placeMark(id,P,name,col){const w=mkEl(id,col);if(!w||!w.style||!new THREE.Vector3().project)return;if(!P||state!=='playing'){w.style.display='none';return;}
  const p=P.clone().setY(2.2);const d=P.distanceTo(player.pos);p.project(camera);let x=p.x,y=p.y;const behind=p.z>1;if(behind){x=-x;y=-1;}const off=behind||Math.abs(x)>.92||Math.abs(y)>.88;if(off){const m=Math.max(Math.abs(x)/.92,Math.abs(y)/.86);x/=m;y/=m;}
  w.style.display='';w.style.left=((x+1)/2*innerWidth)+'px';w.style.top=((1-y)/2*innerHeight)+'px';w.classList.toggle('off',off);
  w.innerHTML=`<i style="${off?`transform:rotate(${Math.atan2(-y,x)*180/Math.PI+90}deg)`:''}"></i><b>${name}</b><span>${Math.round(d)} m</span>`;}
// ---------------- 地面路径箭头：沿导航路径的金色箭头，一路流动指向航点
const crumbGeo=new THREE.ConeGeometry(.42,1.1,3);
function updateCrumbs(dt){const show=CAMP.on&&state==='playing'&&CAMP.wp&&GD.path&&player.pos.distanceTo(CAMP.wp)>7;
  if(!GD.crumbs.length){for(let i=0;i<14;i++){const m=new THREE.Mesh(crumbGeo,new THREE.MeshBasicMaterial({color:0xf0d890,transparent:true,opacity:.6,depthWrite:false}));m.visible=false;scene.add(m);GD.crumbs.push(m);}}
  if(!show){for(const m of GD.crumbs)m.visible=false;return;}
  // 沿路径每 3.2 米放一个，最远 45 米
  const pts=[player.pos.clone().setY(0),...GD.path];let seg=0,acc=0,need=2.5,placed=0;const flow=(gameTime*1.6)%1;
  for(let i=0;i<pts.length-1&&placed<GD.crumbs.length;i++){const a=pts[i],b=pts[i+1],L=a.distanceTo(b);if(L<1e-3)continue;
    while(need<=acc+L&&placed<GD.crumbs.length){const t=(need-acc)/L,P=a.clone().lerp(b,t);const m=GD.crumbs[placed];m.visible=true;m.position.set(P.x,.12,P.z);
      m.rotation.set(-Math.PI/2,Math.atan2(-(b.x-a.x),-(b.z-a.z)),0,'YXZ');
      const ph=((placed/GD.crumbs.length)-flow+1)%1;m.material.opacity=(.25+.55*Math.pow(1-ph,3))*Math.min(1,(45-need)/10);m.scale.setScalar(.8+.3*(1-ph));placed++;need+=3.2;if(need>45)break;}
    acc+=L;if(need>45)break;}
  for(let k=placed;k<GD.crumbs.length;k++)GD.crumbs[k].visible=false;}
// ---------------- 战术地图（开放战场）：小地图以玩家为中心半径 42 米，按 M 放大看全图
function drawTacMap(){const cv=$('minimap');if(!cv||!cv.getContext)return;const g=cv.getContext('2d');if(!g||!g.fillRect)return;const wrap=$('mapWrap'),big=wrap&&wrap.classList&&wrap.classList.contains('big');const S=big?400:180;
  if(cv.width!==S){cv.width=S;cv.height=S;}const R=big?OPEN.R+8:42,cx=big?0:player.pos.x,cz=big?0:player.pos.z,k=S/(2*R);const X=x=>(x-cx)*k+S/2,Z=z=>(z-cz)*k+S/2;
  const inb=(x,z,m=0)=>Math.abs(x-cx)<R+m&&Math.abs(z-cz)<R+m;
  g.fillStyle='rgba(10,12,10,.86)';g.fillRect(0,0,S,S);g.strokeStyle='rgba(140,170,140,.08)';g.lineWidth=1;for(let v=-80;v<=80;v+=10){g.beginPath();g.moveTo(X(v),0);g.lineTo(X(v),S);g.stroke();g.beginPath();g.moveTo(0,Z(v));g.lineTo(S,Z(v));g.stroke();}
  g.strokeStyle='rgba(220,90,60,.45)';g.lineWidth=1.5;g.strokeRect(X(-OPEN.R),Z(-OPEN.R),OPEN.R*2*k,OPEN.R*2*k);
  g.fillStyle='rgba(170,165,150,.5)';for(const b of colliders){if(b.barrel)continue;const w=b.maxX-b.minX,d=b.maxZ-b.minZ;if(w>40||d>40)continue;if(!inb((b.minX+b.maxX)/2,(b.minZ+b.maxZ)/2,6))continue;g.fillRect(X(b.minX),Z(b.minZ),Math.max(1,w*k),Math.max(1,d*k));}
  g.fillStyle='#d8702a';for(const B of (typeof BAR!=='undefined'?BAR.list:[]))if(!B.dead&&inb(B.x,B.z))g.fillRect(X(B.x)-1.5,Z(B.z)-1.5,3,3);
  // 去航点的路径
  if(CAMP.wp&&GD.path){g.strokeStyle='rgba(240,216,144,.75)';g.setLineDash&&g.setLineDash([4,4]);g.lineWidth=2;g.beginPath();g.moveTo(X(player.pos.x),Z(player.pos.z));for(const p of GD.path)g.lineTo(X(p.x),Z(p.z));g.stroke();g.setLineDash&&g.setLineDash([]);}
  const dia=(x,z,r,col,label)=>{let px=X(x),pz=Z(z);const outside=px<6||px>S-6||pz<6||pz>S-6;px=clamp(px,6,S-6);pz=clamp(pz,6,S-6);g.fillStyle=col;g.beginPath();g.moveTo(px,pz-r);g.lineTo(px+r,pz);g.lineTo(px,pz+r);g.lineTo(px-r,pz);g.closePath();g.fill();
    if(label&&(big||!outside)){g.font=`600 ${big?12:9}px Oswald,sans-serif`;g.fillStyle=col;g.textAlign='center';g.fillText(label,px,pz-r-3);}};
  // 敌人（侦测仪读数）、队友、目标
  for(const e of enemies){if(!e.alive)continue;const P=e.g.position;if(!inb(P.x,P.z))continue;const imp=e.named||e.vehicle||e.heavy||e.static||e.type==='pylon';g.fillStyle=e.named?'#ff3020':e.campaign?'#e04030':'#c86050';
    if(imp){g.fillRect(X(P.x)-3,Z(P.z)-3,6,6);}else{g.beginPath();g.arc(X(P.x),Z(P.z),2.2,0,7);g.fill();}}
  for(const a of allies){if(!a.alive)continue;g.fillStyle=a.down?'#ffc040':'#60ff90';if(a.vehicle||a.big)g.fillRect(X(a.pos.x)-3,Z(a.pos.z)-3,6,6);else{g.beginPath();g.arc(X(a.pos.x),Z(a.pos.z),2.2,0,7);g.fill();}}
  for(const T of OPEN.titans||[]){if(!T.g)continue;const P=T.g.position;if(inb(P.x,P.z,20))dia(P.x,P.z,5,T.side==='loyal'?'#60ff90':'#ff3020',big?'TITAN':'');}
  if(EV.cur)dia(EV.cur.P.x,EV.cur.P.z,5,'#7fd8ff',big?'OPTIONAL':'');
  if(!CAMP.wp&&GD.host)dia(GD.host.p.x,GD.host.p.z,5,'#ff5030',big?'HOSTILES':'');
  if(CAMP.wp)dia(CAMP.wp.x,CAMP.wp.z,6,'#f0d890',CAMP.wpName||'');
  // 玩家箭头
  const px=X(player.pos.x),pz=Z(player.pos.z),fx=-Math.sin(player.yaw),fz=-Math.cos(player.yaw);g.fillStyle='#ffffff';g.beginPath();g.moveTo(px+fx*7,pz+fz*7);g.lineTo(px-fz*4-fx*4,pz+fx*4-fz*4);g.lineTo(px+fz*4-fx*4,pz-fx*4-fz*4);g.closePath();g.fill();
  g.fillStyle='rgba(240,216,144,.85)';g.font='600 11px Oswald,sans-serif';g.textAlign='center';g.fillText('N',S/2,12);}
function setLegend(open){const l=$('mapLegend');if(!l||l.innerHTML===undefined)return;const want=open?'open':'rooms';if(GD.leg===want)return;GD.leg=want;
  if(open)l.innerHTML='<span style="color:#f0d890">◆</span> Objective <span style="color:#7fd8ff">◆</span> Optional <span style="color:#60ff90">●</span> Squad <span style="color:#e04030">●</span> Hostile · M map';else GD.leg0&&(l.innerHTML=GD.leg0);}
// ---------------- 每帧
function updateGuide2(dt){if(!CAMP.on)return;
  GD.pathT-=dt;if(GD.pathT<=0){GD.pathT=.5;GD.path=CAMP.wp&&NAV.ok?navPath(player.pos.x,player.pos.z,CAMP.wp.x,CAMP.wp.z,1):null;}
  GD.hostT-=dt;if(GD.hostT<=0){GD.hostT=.4;GD.host=!CAMP.wp&&!(CAMP.S&&CAMP.S.lull)?hostileCluster():null;}
  updateCrumbs(dt);
  placeMark('host',GD.host&&!CAMP.wp&&GD.host.d>12?GD.host.p:null,'HOSTILES','#ff5a3a');placeMark('opt',EV.cur?EV.cur.P:null,'OPTIONAL','#7fd8ff');
  GD.mapT-=dt;if(GD.mapT<=0){GD.mapT=.1;if(GD.leg0===undefined){const l=$('mapLegend');GD.leg0=l&&l.innerHTML;}setLegend(OPEN.on);if(OPEN.on)drawTacMap();else{try{match.explored.add(cellOf(player.pos).join(','));drawMinimap();}catch(err){}}}}
const _ucG=updateCampaign;updateCampaign=function(dt){_ucG(dt);updateGuide2(dt);};
const _usG=updateScene;updateScene=function(dt){_usG(dt);for(const m of GD.crumbs)m.visible=false;for(const k in GD.mk){const w=GD.mk[k];if(w&&w.style)w.style.display='none';}};
const _xcG=exitCampaign;exitCampaign=function(){_xcG.apply(null,arguments);for(const m of GD.crumbs)m.visible=false;for(const k in GD.mk){const w=GD.mk[k];if(w&&w.style)w.style.display='none';}setLegend(false);};
const _ceG=campEnd;campEnd=function(win){_ceG(win);for(const m of GD.crumbs)m.visible=false;for(const k in GD.mk){const w=GD.mk[k];if(w&&w.style)w.style.display='none';}};
const _dmG=drawMinimap;drawMinimap=function(){if(CAMP.on&&OPEN.on){drawTacMap();return;}return _dmG();};
