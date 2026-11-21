// ============================================================ 侦测仪（非灵能职业都有）：按 T 开关。独立 3D 模型挂在镜头左下（受场景光照），
// 半透明显示屏用 CanvasTexture 实时画出：周围墙体/掩体轮廓 + 隔墙透视的恶魔小红点 + 扫描扇面
const AUS={on:false,k:0,sweep:0,lit:new Map(),range:30,rig:null,tex:null,cv:null,g:null,led:null,glow:null,redraw:0};
function hasAuspex(){return CLS[cls]&&!CLS[cls].psy;}
function toggleAuspex(){if(!hasAuspex()){announce('Tidecallers have no auspex — use your psychic senses',1.2);return;}AUS.on=!AUS.on;buildAuspexRig();play(AUS.on?'beacon':'equip');}
// 每个职业一款：屏幕尺寸、磷光颜色、外形都不同
const AUS_V={
  ward:    {W:.32,H:.24,pal:'255,150,70',name:'AUSPEX MK.IV',     frame:0x100f0e,trim:0x231a0a,pos:[-.46,-.1,-.72],rot:[-.1,.55,.06]},
  reforged:{W:.38,H:.2, pal:'90,230,220',name:'AUSPEX MK.X GRAV', frame:0x141a22,trim:0x2a3a44,pos:[-.44,-.08,-.72],rot:[-.08,.5,.03]},
  bastion: {W:.26,H:.22,pal:'110,255,120',name:'TACTICA AUSPEX',  frame:0x16140e,trim:0x3a2a08,pos:[-.42,-.13,-.66],rot:[-.35,.55,.1]},
  relic:   {W:.3, H:.26,pal:'255,200,90',name:'RELIQUARY AUSPEX', frame:0x1a120a,trim:0x6a4a10,pos:[-.46,-.1,-.72],rot:[-.1,.55,.06]},
  walker:  {W:.42,H:.26,pal:'255,70,50', name:'SARCOPHAGUS LINK', frame:0x121110,trim:0x2a1810,pos:[-.5,-.15,-.75],rot:[-.45,.42,.04]},
  redeemer:{W:.4, H:.25,pal:'255,170,60',name:'PYRE-SENSE ARRAY', frame:0x10141a,trim:0x3a2410,pos:[-.5,-.15,-.75],rot:[-.45,.42,.04]}};
function buildAuspexRig(){const key=AUS_V[cls]?cls:'ward';if(AUS.rig&&AUS.key===key)return;if(AUS.rig){camera.remove(AUS.rig);AUS.rig=null;}
  const V=AUS_V[key];AUS.key=key;AUS.V=V;const R=new THREE.Group();AUS.rig=R;R.visible=false;camera.add(R);
  const metal=new THREE.MeshLambertMaterial({color:V.frame}),dark=new THREE.MeshLambertMaterial({color:0x070606}),trim=new THREE.MeshLambertMaterial({color:V.trim});
  const box=(w,h,d,m,x,y,z,p=R)=>{const b=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);b.position.set(x,y,z);p.add(b);return b;};
  const cyl=(r,h,m,x,y,z,rx=0,rz=0,p=R,seg=10)=>{const c=new THREE.Mesh(new THREE.CylinderGeometry(r,r,h,seg),m);c.position.set(x,y,z);c.rotation.set(rx,0,rz);p.add(c);return c;};
  const W=V.W,H=V.H;
  const cv=document.createElement('canvas');cv.width=512;cv.height=Math.round(512*H/W);AUS.cv=cv;AUS.g=cv.getContext&&cv.getContext('2d');
  AUS.tex=new THREE.CanvasTexture(cv);if(THREE.SRGBColorSpace)AUS.tex.colorSpace=THREE.SRGBColorSpace;
  const scr=new THREE.Mesh(new THREE.PlaneGeometry(W,H),new THREE.MeshBasicMaterial({map:AUS.tex,transparent:true,opacity:.95,depthWrite:false,toneMapped:false,blending:THREE.AdditiveBlending}));scr.position.z=.006;R.add(scr);
  const glass=new THREE.Mesh(new THREE.PlaneGeometry(W,H),new THREE.MeshStandardMaterial({color:0x99aaaa,metalness:.2,roughness:.08,transparent:true,opacity:.03,depthWrite:false}));glass.position.z=.012;R.add(glass);
  AUS.led=new THREE.Mesh(new THREE.SphereGeometry(.007,8,6),new THREE.MeshBasicMaterial({color:new THREE.Color(`rgb(${V.pal})`)}));
  const bez=(t,b,s,d=.04)=>{box(W+2*s,t,d,metal,0,H/2+t/2-.004,0);box(W+2*s,b,d,metal,0,-H/2-b/2+.004,0);box(s,H,d,metal,-W/2-s/2+.004,0,0);box(s,H,d,metal,W/2+s/2-.004,0,0);box(W-.02,H-.02,.05,dark,0,0,-.03);};
  if(key==='ward'){   // 标准型：铸铁框 + 机械臂连头盔
    bez(.03,.045,.028);box(W*.6,H*.55,.04,metal,0,0,-.07);for(const [x,y] of [[-1,1],[1,1],[-1,-1],[1,-1]])cyl(.009,.012,trim,x*(W/2+.012),y*(H/2+.01),.022,Math.PI/2);
    box(.11,.022,.008,trim,-.06,-H/2-.02,.022);AUS.led.position.set(.1,-H/2-.02,.024);cyl(.012,.02,trim,.13,-H/2-.02,.022,Math.PI/2);
    cyl(.004,.12,dark,W/2-.03,H/2+.08,-.02,0,-.25);for(let i=0;i<5;i++)box(.004,.025,.03,dark,-.08+i*.018,H/2+.035,-.02);
    cyl(.018,.05,trim,-W/2-.03,-.03,-.03,Math.PI/2);const a1=box(.03,.03,.22,metal,-W/2-.07,-.05,-.14);a1.rotation.y=.5;cyl(.022,.05,dark,-W/2-.12,-.07,-.24,Math.PI/2);
    const a2=box(.026,.026,.22,metal,-W/2-.2,-.03,-.34);a2.rotation.y=.9;a2.rotation.x=-.2;cyl(.008,.3,dark,-W/2-.05,-.12,-.18,1.1,.6);cyl(.016,.12,dark,W/2-.03,-H/2-.08,-.03,0,.3);}
  else if(key==='reforged'){   // 新式：宽屏薄壳，两侧导流鳍，悬浮在护臂支架上
    bez(.018,.03,.016,.03);box(W*.9,H*.7,.025,metal,0,0,-.055);
    for(const sx of [-1,1]){const fin=box(.012,H*1.25,.05,trim,sx*(W/2+.03),0,-.01);fin.rotation.z=sx*.18;box(.03,.006,.03,trim,sx*(W/2+.02),H*.3,.02);}
    box(W*.5,.008,.01,trim,0,-H/2-.016,.02);AUS.led.position.set(W/2-.03,-H/2-.016,.024);
    const brace=box(.04,.04,.28,metal,0,-H/2-.06,-.14);brace.rotation.x=.35;cyl(.02,.06,trim,0,-H/2-.03,-.02,0,Math.PI/2);
    for(let i=0;i<3;i++)box(.05,.004,.004,trim,-W/2+.05+i*.02,H/2+.012,.018);}
  else if(key==='bastion'){   // 重甲：嵌在巨型臂铠上的方形小屏，厚边 + 警示条纹
    bez(.05,.05,.05,.06);const arm=box(W+.12,.14,.5,metal,0,-H/2-.1,-.22);box(W+.14,.03,.48,trim,0,-H/2-.025,-.22);
    for(let i=0;i<6;i++){const st=box(.03,.052,.004,i%2?trim:dark,-W/2-.02+i*.05,-H/2-.025,.03);st.rotation.z=.6;}
    for(const [x,y] of [[-1,1],[1,1],[-1,-1],[1,-1]])cyl(.014,.02,trim,x*(W/2+.025),y*(H/2+.025),.032,Math.PI/2,0,R,6);
    AUS.led.position.set(W/2+.025,0,.033);box(.08,.04,.06,metal,-W/2-.08,0,-.03);for(let i=0;i<3;i++)box(.004,.03,.062,dark,-W/2-.11+i*.02,0,-.03);}
  else if(key==='relic'){   // 圣遗：哥特尖拱黄铜框、骷髅徽记、封印蜡和羊皮纸条
    bez(.03,.04,.03);const arch=new THREE.Mesh(new THREE.CylinderGeometry(.001,W/2+.03,.09,3),trim);arch.position.set(0,H/2+.06,0);arch.rotation.y=Math.PI/2;arch.scale.z=.25;R.add(arch);
    const sk=new THREE.Mesh(new THREE.SphereGeometry(.022,8,6),new THREE.MeshLambertMaterial({color:0xd8c8a0}));sk.position.set(0,H/2+.045,.02);R.add(sk);box(.03,.008,.01,dark,0,H/2+.04,.04);
    for(const sx of [-1,1]){cyl(.012,H+.06,trim,sx*(W/2+.02),0,.01,0,0,R,8);const c=new THREE.Mesh(new THREE.SphereGeometry(.014,8,6),trim);c.position.set(sx*(W/2+.02),H/2+.04,.01);R.add(c);}
    const wax=cyl(.025,.01,new THREE.MeshLambertMaterial({color:0x7a0a08}),W/2-.04,-H/2-.03,.03,Math.PI/2);const par=box(.035,.1,.002,new THREE.MeshLambertMaterial({color:0xcab890}),W/2-.04,-H/2-.09,.026);par.rotation.z=.08;
    AUS.led.position.set(-W/2+.03,-H/2-.022,.024);box(.1,.02,.008,trim,-.03,-H/2-.022,.022);}
  else{   // 机甲：嵌在驾驶舱仪表台上的斜置终端，粗线缆和散热栅
    bez(.035,.06,.04,.07);const dash=box(W+.2,.08,.32,metal,0,-H/2-.07,-.12);box(W+.22,.012,.3,trim,0,-H/2-.025,-.12);
    for(const sx of [-1,1]){for(let i=0;i<4;i++)box(.005,H*.8,.06,dark,sx*(W/2+.055+i*.012),0,-.02);cyl(.016,.4,dark,sx*(W/2+.03),-H/2-.04,-.25,1.3,0,R,8);}
    if(key==='redeemer'){for(let i=0;i<7;i++)box(.03,.03,.01,trim,-W/2+.04+i*.055,H/2+.04,.01);}else{const ant=cyl(.006,.16,dark,W/2-.05,H/2+.1,-.02,0,-.2);box(.08,.025,.04,trim,-W/2+.06,H/2+.045,-.01);}
    AUS.led.position.set(W/2-.02,-H/2-.03,.024);}
  R.add(AUS.led);R.rotation.set(...V.rot);R.scale.setScalar(.82);}
function updateAuspex(dt){const live=(state==='playing'||state==='spectate')&&hasAuspex();if(!live&&AUS.on){AUS.on=false;}
  AUS.k=Math.max(0,Math.min(1,AUS.k+(AUS.on?dt*4:-dt*5)));const R=AUS.rig;if(!R)return;
  R.visible=AUS.k>0.01&&(typeof view==='undefined'||view.visible!==false);if(!R.visible)return;
  const e=1-Math.pow(1-AUS.k,3),bob=Math.sin(gameTime*1.7)*.004;
  const PP=AUS.V.pos;R.position.set(PP[0],PP[1]-(1-e)*.45+bob,PP[2]);R.rotation.z=.06+(1-e)*.5;
  AUS.led.visible=Math.sin(gameTime*9)>0;
  AUS.redraw-=dt;if(AUS.redraw>0)return;AUS.redraw=1/30;drawAuspex(1/30);if(AUS.tex)AUS.tex.needsUpdate=true;}
function drawAuspex(dt){const g=AUS.g;if(!g)return;const C=AUS.V.pal,W=AUS.cv.width,H=AUS.cv.height,cx=W/2,cy=H*.62,R=H*.58,sc=R/AUS.range;
  g.globalCompositeOperation='source-over';g.fillStyle='rgb(10,3,2)';g.fillRect(0,0,W,H);
  const cs=Math.cos(player.yaw),sn=Math.sin(player.yaw),px=player.pos.x,pz=player.pos.z;
  const P=(x,z)=>{const dx=x-px,dz=z-pz;return [cx+(dx*cs-dz*sn)*sc,cy+(dx*sn+dz*cs)*sc];};
  // 环境：墙体和掩体轮廓
  g.lineWidth=1.5;g.strokeStyle=`rgba(${C},.8)`;g.fillStyle=`rgba(${C},.18)`;
  for(const c of colliders){const mx=(c.minX+c.maxX)/2,mz=(c.minZ+c.maxZ)/2;if(Math.hypot(mx-px,mz-pz)>AUS.range+12)continue;
    const q=[P(c.minX,c.minZ),P(c.maxX,c.minZ),P(c.maxX,c.maxZ),P(c.minX,c.maxZ)];g.beginPath();g.moveTo(...q[0]);for(let i=1;i<4;i++)g.lineTo(...q[i]);g.closePath();g.fill();g.stroke();}
  // 距离环与十字
  g.strokeStyle=`rgba(${C},.25)`;g.lineWidth=1;for(const r of [10,20,30]){g.beginPath();g.arc(cx,cy,r*sc,0,Math.PI*2);g.stroke();}
  g.beginPath();g.moveTo(cx,0);g.lineTo(cx,H);g.moveTo(0,cy);g.lineTo(W,cy);g.stroke();
  g.strokeStyle=`rgba(${C},.45)`;g.beginPath();g.moveTo(cx,cy);g.lineTo(cx-R*.45,cy-R);g.moveTo(cx,cy);g.lineTo(cx+R*.45,cy-R);g.stroke();
  // 扫描扇面
  AUS.sweep=(AUS.sweep+dt*2.4)%(Math.PI*2);const sw=AUS.sweep-Math.PI/2;const grd=g.createRadialGradient(cx,cy,0,cx,cy,R*1.3);grd.addColorStop(0,`rgba(${C},.35)`);grd.addColorStop(1,`rgba(${C},0)`);
  g.fillStyle=grd;g.beginPath();g.moveTo(cx,cy);g.arc(cx,cy,R*1.3,sw-.5,sw);g.closePath();g.fill();
  // 恶魔（隔墙透视的模糊红点）
  g.save();g.shadowBlur=18;let n=0;
  for(const e of enemies){if(!e.alive)continue;const d=Math.hypot(e.g.position.x-px,e.g.position.z-pz);if(d>AUS.range)continue;n++;const [x,y]=P(e.g.position.x,e.g.position.z);
    const ang=Math.atan2(y-cy,x-cx);const diff=((sw-ang)%(Math.PI*2)+Math.PI*2)%(Math.PI*2);if(diff<.18)AUS.lit.set(e,1);
    const l=Math.max(.3,AUS.lit.get(e)||0);AUS.lit.set(e,l*Math.pow(.35,dt));const j=(Math.random()-.5)*4,s=e.boss?16:e.type==='brute'||e.static?11:8;
    g.shadowColor='rgba(255,30,10,1)';g.fillStyle=`rgba(255,${e.boss?140:60},40,${.6+.4*l})`;g.beginPath();g.arc(x+j,y+j*.7,s,0,Math.PI*2);g.fill();}
  g.shadowColor='#50ff80';g.fillStyle='#60ff90';
  for(const r of net.remotes.values())if(r.inMatch&&!r.dead){const [x,y]=P(r.pos.x,r.pos.z);g.beginPath();g.arc(x,y,5,0,Math.PI*2);g.fill();}
  if(match&&match.pod){const [x,y]=P(match.pod.x,match.pod.z);g.shadowColor='#ffd060';g.fillStyle='#ffd060';g.fillRect(x-5,y-5,10,10);}
  g.restore();g.fillStyle=`rgb(${C})`;g.beginPath();g.moveTo(cx,cy-9);g.lineTo(cx-7,cy+7);g.lineTo(cx+7,cy+7);g.fill();
  // 文字 / 扫描线 / 噪点
  g.font='600 20px Oswald, sans-serif';g.fillStyle=`rgba(${C},.9)`;g.fillText(AUS.V.name,14,28);g.textAlign='right';g.fillStyle=n?'#ff6040':`rgba(${C},.6)`;g.fillText(n?`${n} LIFE SIGNS`:'NO SIGNALS',W-14,28);g.textAlign='left';
  g.fillStyle='rgba(0,0,0,.35)';for(let y=0;y<H;y+=4)g.fillRect(0,y,W,2);
  for(let i=0;i<60;i++){g.fillStyle=`rgba(${C},${Math.random()*.2})`;g.fillRect(Math.random()*W,Math.random()*H,2,2);}
  const v=g.createRadialGradient(cx,H/2,H*.3,cx,H/2,W*.65);v.addColorStop(0,'rgba(0,0,0,0)');v.addColorStop(1,'rgba(0,0,0,.7)');g.fillStyle=v;g.fillRect(0,0,W,H);}
// 模型：头戴侦测仪（人形在头侧，机甲在顶部天线）
function addAuspexGear(model,c){if(!CLS[c]||CLS[c].psy)return;const dark=new THREE.MeshLambertMaterial({color:0x26262c}),lens=new THREE.MeshBasicMaterial({color:0xff4020});
  if(CLS[c].eye){const g=new THREE.Group();g.position.set(-.45,3.25,.1);const p=new THREE.Mesh(new THREE.BoxGeometry(.06,.5,.06),dark);p.position.y=.25;g.add(p);
    const d=new THREE.Mesh(new THREE.CylinderGeometry(.22,.05,.12,8),dark);d.position.y=.52;d.rotation.x=.6;g.add(d);const l=new THREE.Mesh(new THREE.BoxGeometry(.06,.06,.06),lens);l.position.y=.56;g.add(l);model.add(g);return;}
  let head=null;model.traverse(o=>{if(o.isMesh&&o.geometry&&o.geometry.parameters&&Math.abs(o.geometry.parameters.width-.44)<.01&&o.position.y>2)head=o;});if(!head)return;
  const b=new THREE.Mesh(new THREE.BoxGeometry(.1,.16,.26),dark);b.position.set(.27,.04,.02);head.add(b);
  const l=new THREE.Mesh(new THREE.BoxGeometry(.12,.08,.04),lens);l.position.set(.27,.06,.16);head.add(l);
  const a=new THREE.Mesh(new THREE.BoxGeometry(.02,.22,.02),dark);a.position.set(.29,.2,-.06);head.add(a);}
