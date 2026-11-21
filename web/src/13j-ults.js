// ============================================================ 职业大招表现：横幅 + 屏幕闪光 + 专属特效（队友也能看到）+ HUD 冷却环 + 详细说明
const ULT_INFO={
  surge:{color:'#b060ff',hex:0xb060ff,sub:'Abyssal power erupts from within',long:'Clears all overload and heals 15, then unleashes a purple shockwave: pushes back enemies within 7m, deals 40 damage and stuns for 1s. Use it when you’re about to overload.'},
  stim:{color:'#ff3030',hex:0xff3030,sub:'Heart racing, pain gone',long:'Inject combat stims: +30% move speed and +25% damage for 6s, heal 20 instantly. Great for diving into a crowd or chasing a fleeing caster.'},
  grenade:{color:'#ffa040',hex:0xffa040,sub:'Throw a shock grenade',long:'Throws a shock grenade that explodes on contact or after 1.1s: 120 damage and a 1.2s stun within 3.5m. Breaks up bone shields and imp swarms.'},
  warp:{color:'#80c8ff',hex:0x80c8ff,sub:'Tear reality, strike the line',long:'Teleport up to 10m along your aim (blocked by walls); the landing shockwave deals 90 damage and stuns for 1.5s within 4m. Leaves an afterimage behind.'},
  aegis:{color:'#ffd060',hex:0xffd060,sub:'Holy light shields the squad',long:'Raises a golden aegis dome for 6s: you and allies within 8m take half damage. Best when holding beacons or ritual circles.'},
  stomp:{color:'#ffb050',hex:0xffb050,sub:'The iron giant charges',long:'The walker charges at full speed for 0.6s, smashing everything in its path (140 damage, 1s stun), then slams the ground to stun everything nearby.'},
  pyre:{color:'#ff6020',hex:0xff6020,sub:'Purge everything with fire',long:'Unleashes a firestorm: everything within 6m takes 80 damage and catches fire, leaving a ring of burning ground that scorches anything that walks in.'}};
for(const k in ULT_INFO)ZAB[k].long=ULT_INFO[k].long;
let ufx=[];
function ufxAdd(m,life,o={}){scene.add(m);ufx.push({m,t:0,life,...o});return m;}
function updateUfx(dt){for(const f of ufx){f.t+=dt;const k=f.t/f.life;if(f.grow)f.m.scale.setScalar(f.s0+(f.grow-f.s0)*Math.min(1,k*(f.fast||1)));if(f.m.material&&f.fade!==false)f.m.material.opacity=(f.op??.8)*Math.max(0,1-k);
    if(f.spin)f.m.rotation.z+=dt*f.spin;if(f.follow){f.m.position.x=player.pos.x;f.m.position.z=player.pos.z;}if(f.t>=f.life){scene.remove(f.m);f.dead=true;}}ufx=ufx.filter(f=>!f.dead);}
const tmat=(c,op=.8)=>new THREE.MeshBasicMaterial({color:c,transparent:true,opacity:op,depthWrite:false,side:2});
function ringAt(x,y,z,c,from,to,life,th=.12){const m=new THREE.Mesh(new THREE.TorusGeometry(1,th,4,32),tmat(c));m.rotation.x=Math.PI/2;m.position.set(x,y,z);m.scale.setScalar(from);return ufxAdd(m,life,{grow:to,s0:from,fast:1.6});}
function bolt(a,b,c){const pts=[];const n=7;for(let i=0;i<=n;i++){const p=a.clone().lerp(b,i/n);if(i&&i<n)p.add(new THREE.Vector3((Math.random()-.5)*.8,(Math.random()-.5)*.8,(Math.random()-.5)*.8));pts.push(p);}
  for(let i=0;i<n;i++){const L=pts[i].distanceTo(pts[i+1]);const m=new THREE.Mesh(new THREE.BoxGeometry(.06,.06,L),tmat(c,1));m.position.copy(pts[i]).lerp(pts[i+1],.5);m.lookAt(pts[i+1]);ufxAdd(m,.35);}}
// 画面：横幅 + 闪光 + 持续色调
function ultBanner(name,info){const b=$('ultBanner');b.innerHTML=`<div class="un" style="color:${info.color}">${name}</div><div class="us">${info.sub}</div>`;b.classList.remove('go');void b.offsetWidth;b.classList.add('go');
  const f=$('ultFlash');f.style.transition='none';f.style.background=`radial-gradient(ellipse at center,transparent 30%,${info.color} 130%)`;f.style.opacity=.85;requestAnimationFrame(()=>{f.style.transition='opacity .8s';f.style.opacity=0;});}
// 特效本体：本地施放和队友收到 fx 时都调用
function ultFx(d){const {k,x,z}=d;const y=1,P=new THREE.Vector3(x||0,y,z||0),I=ULT_INFO[k];if(!I&&!['cloud','decoys','confuse'].includes(k))return;
  if(k==='surge'){ringAt(x,.3,z,0xb060ff,.5,8,.7,.18);ringAt(x,1.4,z,0xe0a0ff,.3,6,.55,.08);embersBlue(P,30);const s=new THREE.Mesh(new THREE.SphereGeometry(1,16,10),tmat(0x8030ff,.5));s.position.copy(P);ufxAdd(s,.5,{grow:5,s0:.5,op:.5});play('choir');play('backlash');}
  else if(k==='stim'){for(let i=0;i<14;i++)hitSparks(P,null,1);ringAt(x,.2,z,0xff3030,.3,2.5,.4);play('frenzy');}
  else if(k==='grenade'){const s=new THREE.Mesh(new THREE.SphereGeometry(1,12,8),tmat(0xffc060,.9));s.position.copy(P);ufxAdd(s,.35,{grow:3.5,s0:.3,op:.9});ringAt(x,.2,z,0xffa040,.5,5,.5,.15);
    for(let i=0;i<10;i++)puff(P.clone().add(new THREE.Vector3(0,i*.3,0)),1,0x3a3a3a,1.6);play('boom');play('boom');}
  else if(k==='warp'){const a=new THREE.Vector3(d.x0,1,d.z0),b=new THREE.Vector3(x,1,z);for(let i=0;i<3;i++)bolt(a.clone().setY(.6+i*.5),b.clone().setY(.6+i*.5),0x9fd8ff);
    const g=new THREE.Mesh(new THREE.BoxGeometry(.8,2,.5),tmat(0x80c8ff,.45));g.position.set(d.x0,1,d.z0);ufxAdd(g,1.2,{op:.45});   // 残影
    ringAt(x,.15,z,0x80c8ff,.3,4.5,.5,.2);const s=new THREE.Mesh(new THREE.SphereGeometry(1,12,8),tmat(0xffffff,.8));s.position.copy(b);ufxAdd(s,.25,{grow:3,s0:.4});play('zap');play('boom');}
  else if(k==='aegis'){const dome=new THREE.Mesh(new THREE.SphereGeometry(7,20,10,0,Math.PI*2,0,Math.PI/2),tmat(0xffd060,.18));dome.position.set(x,0,z);ufxAdd(dome,6,{op:.18});
    const wire=new THREE.Mesh(new THREE.SphereGeometry(7.05,14,7,0,Math.PI*2,0,Math.PI/2),new THREE.MeshBasicMaterial({color:0xffe090,wireframe:true,transparent:true,opacity:.35}));wire.position.set(x,0,z);ufxAdd(wire,6,{op:.35});
    const rune=new THREE.Mesh(new THREE.RingGeometry(6.4,7,6),tmat(0xffd060,.6));rune.rotation.x=-Math.PI/2;rune.position.set(x,.05,z);ufxAdd(rune,6,{spin:.6,op:.6});
    ringAt(x,.2,z,0xffd060,.5,7,.6);play('choir');play('parry');}
  else if(k==='stomp'){ringAt(x,.2,z,0xffb050,.5,4,.45,.2);dust(P.clone().setY(.2),8);play('boom');}
  else if(k==='cloud')addCloud(x,z);
  else if(k==='decoys'){if(!isHost())spawnDecoys(d.list);}
  else if(k==='confuse')confuseFx(x,z);
  else if(k==='pyre'){ringAt(x,.4,z,0xff6020,.5,6.5,.6,.35);ringAt(x,1.2,z,0xffc060,.3,5,.5,.15);const s=new THREE.Mesh(new THREE.SphereGeometry(1,12,8),tmat(0xff8030,.6));s.position.copy(P);ufxAdd(s,.4,{grow:6,s0:.5,op:.6});play('melta');play('boom');}}
// 本地施放（classAbility 里调用）
function ultCast(k,extra={}){const Z=ZAB[k],I=ULT_INFO[k];ultBanner(Z.name,I);player.punch=.08;player.shake=Math.max(player.shake,.35);
  const d={k,x:+player.pos.x.toFixed(2),z:+player.pos.z.toFixed(2),...extra};if(k!=='grenade')ultFx(d);fxSend('ult',d);
  if(k==='surge'){for(const e of enemies){if(!e.alive||e.static)continue;const dd=e.g.position.distanceTo(player.pos);if(dd>7+e.r)continue;const dir=e.g.position.clone().sub(player.pos).setY(0).normalize();
    damageEnemy(e,40,'body',dir,{knock:3,stagger:.8,point:contactPoint(e)});if(e.alive)stunE2(e,1);}}
  if(k==='pyre'){for(let i=0;i<10;i++){const a=i/10*6.28;addFirePatch(player.pos.x+Math.cos(a)*4.2,player.pos.z+Math.sin(a)*4.2);}}
  if(k==='stim')player.stimFx=6;}
// 兴奋剂持续效果：红色心跳脉冲 + 心跳声
function updateUltOverlays(dt){const t=$('ultTint');if(player.stimT>0){const p=(Math.sin(gameTime*10)+1)/2;t.style.opacity=.25+p*.25;t.style.background='radial-gradient(ellipse at center,transparent 45%,rgba(255,30,30,.9) 120%)';
    player.hbT=(player.hbT||0)-dt;if(player.hbT<=0){player.hbT=.6;play('heart');}}
  else if(player.auraT>0){t.style.opacity=.25;t.style.background='radial-gradient(ellipse at center,transparent 55%,rgba(255,210,96,.8) 130%)';}
  else if(player.dash>0){t.style.opacity=.5;t.style.background='repeating-conic-gradient(from 0deg at 50% 50%,rgba(255,220,180,.25) 0 2deg,transparent 2deg 12deg)';}
  else t.style.opacity=0;
  updateUfx(dt);
  const c=CLS[cls];if(!c)return;const Z=ZAB[c.z],I=ULT_INFO[c.z],r=player.zcd>0?player.zcd/Z.cd:0;
  $('zab').innerHTML=`<div class="zi" style="--c:${I.color};--p:${(1-r)*360}deg"><b>Z</b></div><div><div class="zn" style="color:${I.color}">${Z.name}${player.zcd>0?` <span>${Math.ceil(player.zcd)}s</span>`:' <span class="rd">Ready</span>'}</div><div class="zd">${Z.desc}</div></div>`;}
function ultPanel(c){const z=CLS[c]&&CLS[c].z;if(!z)return'';const Z=ZAB[z],I=ULT_INFO[z];
  return `<div class="ultbox" style="border-color:${I.color}"><b style="color:${I.color}">Class Ultimate ·  ${Z.name}</b> <span class="dim">Z · cooldown ${Z.cd} s</span><br>${I.long}</div>`;}
