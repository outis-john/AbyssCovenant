// ============================================================ 侦测仪（非灵能职业都有）：按 T 开关；画面左侧弹出倾斜的全息屏，隔墙用模糊移动的小红点显示附近恶魔
const AUS={on:false,sweep:0,lit:new Map(),range:32};
function hasAuspex(){return CLS[cls]&&!CLS[cls].psy;}
function toggleAuspex(){if(!hasAuspex()){announce('Tidecallers have no auspex — use your psychic senses',1.2);return;}AUS.on=!AUS.on;$('auspex').classList.toggle('show',AUS.on);play(AUS.on?'beacon':'equip');}
function updateAuspex(dt){if(!AUS.on)return;if(state!=='playing'&&state!=='spectate'){return;}const cv=$('ausCv');if(!cv||!cv.getContext)return;const g=cv.getContext('2d');if(!g)return;
  const W=cv.width,H=cv.height,cx=W/2,cy=H*.6,R=Math.min(W*.48,H*.58),sc=R/AUS.range;
  g.fillStyle='rgba(18,6,4,.55)';g.fillRect(0,0,W,H);
  g.strokeStyle='rgba(255,140,60,.35)';g.lineWidth=1;for(const r of [10,20,30]){g.beginPath();g.arc(cx,cy,r*sc,0,Math.PI*2);g.stroke();}
  g.beginPath();g.moveTo(cx,cy-R);g.lineTo(cx,cy+R);g.moveTo(cx-R,cy);g.lineTo(cx+R,cy);g.stroke();
  // 扫描扇形
  AUS.sweep=(AUS.sweep+dt*2.4)%(Math.PI*2);const sw=AUS.sweep-Math.PI/2;const grd=g.createRadialGradient(cx,cy,0,cx,cy,R);grd.addColorStop(0,'rgba(255,120,40,.35)');grd.addColorStop(1,'rgba(255,120,40,0)');
  g.fillStyle=grd;g.beginPath();g.moveTo(cx,cy);g.arc(cx,cy,R,sw-.5,sw);g.closePath();g.fill();
  // 视野朝向
  g.strokeStyle='rgba(255,200,120,.5)';g.beginPath();g.moveTo(cx,cy);g.lineTo(cx-R*.35,cy-R);g.moveTo(cx,cy);g.lineTo(cx+R*.35,cy-R);g.stroke();
  const cs=Math.cos(player.yaw),sn=Math.sin(player.yaw);
  const plot=(x,z)=>{const dx=x-player.pos.x,dz=z-player.pos.z;const rx=dx*cs-dz*sn,rz=dx*sn+dz*cs;return [cx+rx*sc,cy+rz*sc,Math.hypot(dx,dz)];};
  g.save();g.shadowBlur=10;
  for(const e of enemies){if(!e.alive)continue;const [x,y,d]=plot(e.g.position.x,e.g.position.z);if(d>AUS.range)continue;
    const ang=Math.atan2(y-cy,x-cx);let diff=((sw-ang)%(Math.PI*2)+Math.PI*2)%(Math.PI*2);if(diff<.15)AUS.lit.set(e,1);
    const l=Math.max(.25,(AUS.lit.get(e)||0));AUS.lit.set(e,l*Math.pow(.35,dt));
    const j=(Math.random()-.5)*2.4,size=e.boss?7:e.type==='brute'||e.static?5:3.2;   // 模糊抖动的小红点
    g.shadowColor='rgba(255,40,20,1)';g.fillStyle=`rgba(255,${e.boss?120:50},40,${.35+.65*l})`;g.beginPath();g.arc(x+j,y+j*.7,size,0,Math.PI*2);g.fill();}
  g.shadowColor='rgba(80,255,120,1)';g.fillStyle='#60ff90';
  for(const r of net.remotes.values())if(r.inMatch&&!r.dead){const [x,y,d]=plot(r.pos.x,r.pos.z);if(d<=AUS.range){g.beginPath();g.arc(x,y,3,0,Math.PI*2);g.fill();}}
  if(match&&match.pod){const [x,y,d]=plot(match.pod.x,match.pod.z);if(d<=AUS.range){g.shadowColor='#ffd060';g.fillStyle='#ffd060';g.fillRect(x-3,y-3,6,6);}}
  g.restore();g.fillStyle='#ffe0b0';g.beginPath();g.moveTo(cx,cy-5);g.lineTo(cx-4,cy+4);g.lineTo(cx+4,cy+4);g.fill();
  // 噪点与扫描线
  for(let i=0;i<40;i++){g.fillStyle=`rgba(255,160,90,${Math.random()*.15})`;g.fillRect(Math.random()*W,Math.random()*H,1,1);}
  const n=enemies.filter(e=>e.alive&&e.g.position.distanceTo(player.pos)<AUS.range).length;$('ausN').textContent=n?`${n} life signs`:'No signals';}
// 模型：头戴侦测仪（人形在头侧，机甲在顶部天线）
function addAuspexGear(model,c){if(!CLS[c]||CLS[c].psy)return;const dark=new THREE.MeshLambertMaterial({color:0x26262c}),lens=new THREE.MeshBasicMaterial({color:0xff4020});
  if(CLS[c].eye){const g=new THREE.Group();g.position.set(-.45,3.25,.1);const p=new THREE.Mesh(new THREE.BoxGeometry(.06,.5,.06),dark);p.position.y=.25;g.add(p);
    const d=new THREE.Mesh(new THREE.CylinderGeometry(.22,.05,.12,8),dark);d.position.y=.52;d.rotation.x=.6;g.add(d);const l=new THREE.Mesh(new THREE.BoxGeometry(.06,.06,.06),lens);l.position.y=.56;g.add(l);model.add(g);return;}
  let head=null;model.traverse(o=>{if(o.isMesh&&o.geometry&&o.geometry.parameters&&Math.abs(o.geometry.parameters.width-.44)<.01&&o.position.y>2)head=o;});if(!head)return;
  const b=new THREE.Mesh(new THREE.BoxGeometry(.1,.16,.26),dark);b.position.set(.27,.04,.02);head.add(b);
  const l=new THREE.Mesh(new THREE.BoxGeometry(.12,.08,.04),lens);l.position.set(.27,.06,.16);head.add(l);
  const a=new THREE.Mesh(new THREE.BoxGeometry(.02,.22,.02),dark);a.position.set(.29,.2,-.06);head.add(a);}
