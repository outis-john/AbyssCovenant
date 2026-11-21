// ============================================================ 侦测仪（非灵能职业都有）：按 T 开关。独立 3D 模型挂在镜头左下（受场景光照），
// 半透明显示屏用 CanvasTexture 实时画出：周围墙体/掩体轮廓 + 隔墙透视的恶魔小红点 + 扫描扇面
const AUS={on:false,k:0,sweep:0,lit:new Map(),range:30,rig:null,tex:null,cv:null,g:null,led:null,glow:null,redraw:0};
function hasAuspex(){return CLS[cls]&&!CLS[cls].psy;}
function toggleAuspex(){if(!hasAuspex()){announce('Tidecallers have no auspex — use your psychic senses',1.2);return;}AUS.on=!AUS.on;buildAuspexRig();play(AUS.on?'beacon':'equip');}
function buildAuspexRig(){if(AUS.rig)return;const R=new THREE.Group();AUS.rig=R;R.visible=false;camera.add(R);
  const metal=new THREE.MeshLambertMaterial({color:0x100f0e}),dark=new THREE.MeshLambertMaterial({color:0x070606}),
    brass=new THREE.MeshLambertMaterial({color:0x231a0a});
  const box=(w,h,d,m,x,y,z,p=R)=>{const b=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);b.position.set(x,y,z);p.add(b);return b;};
  const cyl=(r,h,m,x,y,z,rx=0,rz=0,p=R)=>{const c=new THREE.Mesh(new THREE.CylinderGeometry(r,r,h,10),m);c.position.set(x,y,z);c.rotation.set(rx,0,rz);p.add(c);return c;};
  const W=.32,H=.24;
  // 屏幕：画布贴图，半透明发光
  const cv=document.createElement('canvas');cv.width=512;cv.height=384;AUS.cv=cv;AUS.g=cv.getContext&&cv.getContext('2d');
  AUS.tex=new THREE.CanvasTexture(cv);if(THREE.SRGBColorSpace)AUS.tex.colorSpace=THREE.SRGBColorSpace;
  const scr=new THREE.Mesh(new THREE.PlaneGeometry(W,H),new THREE.MeshBasicMaterial({map:AUS.tex,transparent:true,opacity:.95,depthWrite:false,toneMapped:false,blending:THREE.AdditiveBlending}));scr.position.z=.006;R.add(scr);
  const glass=new THREE.Mesh(new THREE.PlaneGeometry(W,H),new THREE.MeshStandardMaterial({color:0x99aaaa,metalness:.2,roughness:.08,transparent:true,opacity:.03,depthWrite:false}));glass.position.z=.012;R.add(glass);
  // 厚重的铸铁边框 + 背壳 + 铆钉
  box(W+.05,.03,.04,metal,0,H/2+.012,0);box(W+.05,.045,.04,metal,0,-H/2-.02,0);box(.028,H,.04,metal,-W/2-.011,0,0);box(.028,H,.04,metal,W/2+.011,0,0);
  box(W-.02,H-.02,.05,dark,0,0,-.03);box(W*.6,H*.55,.04,metal,0,0,-.07);
  for(const [x,y] of [[-1,1],[1,1],[-1,-1],[1,-1]]){const c=cyl(.009,.012,brass,x*(W/2+.012),y*(H/2+.01),.022,Math.PI/2);}
  // 底部铭牌 + 红色指示灯 + 旋钮
  box(.11,.022,.008,brass,-.06,-H/2-.02,.022);AUS.led=new THREE.Mesh(new THREE.SphereGeometry(.007,8,6),new THREE.MeshBasicMaterial({color:0xff3018}));AUS.led.position.set(.1,-H/2-.02,.024);R.add(AUS.led);
  cyl(.012,.02,brass,.13,-H/2-.02,.022,Math.PI/2);cyl(.012,.02,dark,.06,-H/2-.02,.022,Math.PI/2);
  // 顶部天线与散热栅
  cyl(.004,.12,dark,W/2-.03,H/2+.08,-.02,0,-.25);for(let i=0;i<5;i++)box(.004,.025,.03,dark,-.08+i*.018,H/2+.035,-.02);
  // 连向头盔的机械臂（两节 + 关节 + 线缆）
  const j1=cyl(.018,.05,brass,-W/2-.03,-.03,-.03,Math.PI/2);const a1=box(.03,.03,.22,metal,-W/2-.07,-.05,-.14);a1.rotation.y=.5;
  cyl(.022,.05,dark,-W/2-.12,-.07,-.24,Math.PI/2);const a2=box(.026,.026,.22,metal,-W/2-.2,-.03,-.34);a2.rotation.y=.9;a2.rotation.x=-.2;
  const cab=cyl(.008,.3,dark,-W/2-.05,-.12,-.18,1.1,.6);
  // 握把（右下）
  cyl(.016,.12,dark,W/2-.03,-H/2-.08,-.03,0,.3);
  
  R.rotation.set(-.1,.55,.06);R.scale.setScalar(.82);}
function updateAuspex(dt){const live=(state==='playing'||state==='spectate')&&hasAuspex();if(!live&&AUS.on){AUS.on=false;}
  AUS.k=Math.max(0,Math.min(1,AUS.k+(AUS.on?dt*4:-dt*5)));const R=AUS.rig;if(!R)return;
  R.visible=AUS.k>0.01&&(typeof view==='undefined'||view.visible!==false);if(!R.visible)return;
  const e=1-Math.pow(1-AUS.k,3),bob=Math.sin(gameTime*1.7)*.004;
  R.position.set(-.46,-.1-(1-e)*.45+bob,-.72);R.rotation.z=.06+(1-e)*.5;
  AUS.led.visible=Math.sin(gameTime*9)>0;
  AUS.redraw-=dt;if(AUS.redraw>0)return;AUS.redraw=1/30;drawAuspex(1/30);if(AUS.tex)AUS.tex.needsUpdate=true;}
function drawAuspex(dt){const g=AUS.g;if(!g)return;const W=512,H=384,cx=W/2,cy=H*.62,R=H*.58,sc=R/AUS.range;
  g.globalCompositeOperation='source-over';g.fillStyle='rgb(10,3,2)';g.fillRect(0,0,W,H);
  const cs=Math.cos(player.yaw),sn=Math.sin(player.yaw),px=player.pos.x,pz=player.pos.z;
  const P=(x,z)=>{const dx=x-px,dz=z-pz;return [cx+(dx*cs-dz*sn)*sc,cy+(dx*sn+dz*cs)*sc];};
  // 环境：墙体和掩体轮廓
  g.lineWidth=1.5;g.strokeStyle='rgba(255,150,70,.8)';g.fillStyle='rgba(255,110,40,.22)';
  for(const c of colliders){const mx=(c.minX+c.maxX)/2,mz=(c.minZ+c.maxZ)/2;if(Math.hypot(mx-px,mz-pz)>AUS.range+12)continue;
    const q=[P(c.minX,c.minZ),P(c.maxX,c.minZ),P(c.maxX,c.maxZ),P(c.minX,c.maxZ)];g.beginPath();g.moveTo(...q[0]);for(let i=1;i<4;i++)g.lineTo(...q[i]);g.closePath();g.fill();g.stroke();}
  // 距离环与十字
  g.strokeStyle='rgba(255,140,60,.25)';g.lineWidth=1;for(const r of [10,20,30]){g.beginPath();g.arc(cx,cy,r*sc,0,Math.PI*2);g.stroke();}
  g.beginPath();g.moveTo(cx,0);g.lineTo(cx,H);g.moveTo(0,cy);g.lineTo(W,cy);g.stroke();
  g.strokeStyle='rgba(255,210,140,.4)';g.beginPath();g.moveTo(cx,cy);g.lineTo(cx-R*.45,cy-R);g.moveTo(cx,cy);g.lineTo(cx+R*.45,cy-R);g.stroke();
  // 扫描扇面
  AUS.sweep=(AUS.sweep+dt*2.4)%(Math.PI*2);const sw=AUS.sweep-Math.PI/2;const grd=g.createRadialGradient(cx,cy,0,cx,cy,R*1.3);grd.addColorStop(0,'rgba(255,120,40,.4)');grd.addColorStop(1,'rgba(255,120,40,0)');
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
  g.restore();g.fillStyle='#ffe0b0';g.beginPath();g.moveTo(cx,cy-9);g.lineTo(cx-7,cy+7);g.lineTo(cx+7,cy+7);g.fill();
  // 文字 / 扫描线 / 噪点
  g.font='600 20px Oswald, sans-serif';g.fillStyle='rgba(255,190,120,.85)';g.fillText('AUSPEX MK.IV',14,28);g.textAlign='right';g.fillStyle=n?'#ff6040':'rgba(255,190,120,.6)';g.fillText(n?`${n} LIFE SIGNS`:'NO SIGNALS',W-14,28);g.textAlign='left';
  g.fillStyle='rgba(0,0,0,.35)';for(let y=0;y<H;y+=4)g.fillRect(0,y,W,2);
  for(let i=0;i<60;i++){g.fillStyle=`rgba(255,160,90,${Math.random()*.2})`;g.fillRect(Math.random()*W,Math.random()*H,2,2);}
  const v=g.createRadialGradient(cx,H/2,H*.3,cx,H/2,W*.65);v.addColorStop(0,'rgba(0,0,0,0)');v.addColorStop(1,'rgba(0,0,0,.7)');g.fillStyle=v;g.fillRect(0,0,W,H);}
// 模型：头戴侦测仪（人形在头侧，机甲在顶部天线）
function addAuspexGear(model,c){if(!CLS[c]||CLS[c].psy)return;const dark=new THREE.MeshLambertMaterial({color:0x26262c}),lens=new THREE.MeshBasicMaterial({color:0xff4020});
  if(CLS[c].eye){const g=new THREE.Group();g.position.set(-.45,3.25,.1);const p=new THREE.Mesh(new THREE.BoxGeometry(.06,.5,.06),dark);p.position.y=.25;g.add(p);
    const d=new THREE.Mesh(new THREE.CylinderGeometry(.22,.05,.12,8),dark);d.position.y=.52;d.rotation.x=.6;g.add(d);const l=new THREE.Mesh(new THREE.BoxGeometry(.06,.06,.06),lens);l.position.y=.56;g.add(l);model.add(g);return;}
  let head=null;model.traverse(o=>{if(o.isMesh&&o.geometry&&o.geometry.parameters&&Math.abs(o.geometry.parameters.width-.44)<.01&&o.position.y>2)head=o;});if(!head)return;
  const b=new THREE.Mesh(new THREE.BoxGeometry(.1,.16,.26),dark);b.position.set(.27,.04,.02);head.add(b);
  const l=new THREE.Mesh(new THREE.BoxGeometry(.12,.08,.04),lens);l.position.set(.27,.06,.16);head.add(l);
  const a=new THREE.Mesh(new THREE.BoxGeometry(.02,.22,.02),dark);a.position.set(.29,.2,-.06);head.add(a);}
