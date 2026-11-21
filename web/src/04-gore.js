// ============================================================ 切割断肢：按刀刃扫过的平面把部位切成两半
const matCut=new THREE.MeshBasicMaterial({color:0xa80c0c});
let bleeders=[];   // 断口持续喷血
function worldize(m){const wp=new THREE.Vector3(),wq=new THREE.Quaternion(),ws=new THREE.Vector3();m.getWorldPosition(wp);m.getWorldQuaternion(wq);m.getWorldScale(ws);
  if(m.parent)m.parent.remove(m);m.position.copy(wp);m.quaternion.copy(wq);m.scale.copy(ws);scene.add(m);return m;}
function boxAxes(m){return [new THREE.Vector3(1,0,0),new THREE.Vector3(0,1,0),new THREE.Vector3(0,0,1)].map(a=>a.applyQuaternion(m.quaternion));}
// 平面是否穿过这个盒子（m 需已在世界坐标）
function planeHits(m,P,n){const p=m.geometry.parameters;if(!p||p.width===undefined)return false;const ax=boxAxes(m);const d=m.position.clone().sub(P).dot(n);
  const r=Math.abs(ax[0].dot(n))*p.width*m.scale.x/2+Math.abs(ax[1].dot(n))*p.height*m.scale.y/2+Math.abs(ax[2].dot(n))*p.depth*m.scale.z/2;return Math.abs(d)<r*0.92;}
// 把世界坐标下的盒子 m 沿平面切开，返回 {pos:[...], neg:[...]}；切不到返回 null
function splitBox(m,P,n,capMat=null){
  const p=m.geometry.parameters;if(!p||p.width===undefined)return null;
  const dims=[p.width*m.scale.x,p.height*m.scale.y,p.depth*m.scale.z],ax=boxAxes(m);
  let k=0,best=-1;ax.forEach((a,i)=>{const v=Math.abs(a.dot(n));if(v>best){best=v;k=i;}});
  const half=dims[k]/2,proj=ax[k].dot(n),d=m.position.clone().sub(P).dot(n),t=-d/proj;
  if(Math.abs(t)>=half*0.9)return null;
  const tilt=new THREE.Quaternion().setFromAxisAngle(ax[(k+1)%3],(Math.random()-.5)*0.25);
  const make=(len,off)=>{const dd=dims.slice();dd[k]=len;const g=new THREE.BoxGeometry(...dd);const piece=new THREE.Mesh(g,m.material);
    piece.position.copy(m.position).addScaledVector(ax[k],off);piece.quaternion.copy(m.quaternion).premultiply(tilt);
    const cd=dims.slice();cd[k]=0.03;cd[(k+1)%3]*=0.88;cd[(k+2)%3]*=0.88;const cap=new THREE.Mesh(new THREE.BoxGeometry(...cd),capMat||matCut);
    const cp=[0,0,0];cp[k]=off>t?-len/2+0.02:len/2-0.02;cap.position.set(...cp);piece.add(cap);scene.add(piece);return piece;};
  const a=make(half-t,t+(half-t)/2),b=make(t+half,-half+(t+half)/2);
  scene.remove(m);
  const sa=a.position.clone().sub(P).dot(n)>0;return sa?{pos:[a],neg:[b]}:{pos:[b],neg:[a]};
}
function throwGib(m,v,spin=8){gibs.push({m,v,spin:new THREE.Vector3((Math.random()-.5)*spin,(Math.random()-.5)*spin,(Math.random()-.5)*spin),rest:false});
  capGibs();}
function bleed(m,t=0.8,up=1){bleeders.push({m,t,up});}
function updateBleeders(dt){for(const b of bleeders){b.t-=dt;if(Math.random()<0.8){const p=new THREE.Vector3();b.m.getWorldPosition(p);
  const bm=new THREE.Mesh(bloodGeo,matBlood);bm.position.copy(p);scene.add(bm);bloods.push({m:bm,v:new THREE.Vector3((Math.random()-.5)*2,3+Math.random()*3*b.up,(Math.random()-.5)*2),rest:false});}}
  bleeders=bleeders.filter(b=>b.t>0);capBloods();}
// 按平面把整个敌人切开（致命）
function cutApart(e,P,n,imp=4,extra={}){
  const parts=Object.keys(e.parts).filter(k=>e.parts[k].parent===e.g).map(k=>worldize(e.parts[k]));
  for(const m of parts){
    let pieces=planeHits(m,P,n)?splitBox(m,P,n):null;
    const sideOf=x=>x.position.clone().sub(P).dot(n)>0;
    const list=pieces?[...pieces.pos.map(x=>[x,true]),...pieces.neg.map(x=>[x,false])]:[[m,sideOf(m)]];
    for(const [x,pos] of list){const v=pos?n.clone().multiplyScalar(imp):n.clone().multiplyScalar(-imp*0.4);
      v.y+=pos?2.5+Math.random()*2:1;if(extra.fling&&pos)v.addScaledVector(extra.fling,1);v.x+=(Math.random()-.5);v.z+=(Math.random()-.5);
      throwGib(x,v,pos?10:4);if(pieces)bleed(x,0.9,pos?1:0.6);}
  }
  spawnBlood(P,n,30);
}
// 非致命：刀刃扫过手臂就按切口断开，肩膀上留一截
function netSever(e,k){if(isClient()&&e.remote)sendNet({t:'sever',id:e.id,part:k});}
function severArmsByPlane(e,P,n,dmg){try{severArmsImpl(e,P,n,dmg);}catch(err){console.error('sever failed',err);}}
function severArmsImpl(e,P,n,dmg){
  let cutOne=false;
  for(const k of (Math.random()<.5?['armL','armR']:['armR','armL'])){if(cutOne)break;const arm=e.parts[k];if(arm.parent!==e.g||e.armHp[k]===Infinity)continue;
    e.g.updateMatrixWorld(true);const tmp={geometry:arm.geometry,position:new THREE.Vector3(),quaternion:new THREE.Quaternion(),scale:new THREE.Vector3()};arm.getWorldPosition(tmp.position);arm.getWorldQuaternion(tmp.quaternion);arm.getWorldScale(tmp.scale);
    if(!planeHits(tmp,P,n))continue;cutOne=true;e.armHp[k]-=dmg*3;if(e.armHp[k]>0){spawnBlood(tmp.position,n,6);continue;}
    const w=worldize(arm);const pieces=splitBox(w,P,n);
    if(!pieces){throwGib(w,new THREE.Vector3(n.x*3,4,n.z*3));e.armHp[k]=Infinity;e.arms--;netSever(e,k);continue;}
    const all=[...pieces.pos,...pieces.neg].sort((a,b)=>b.position.y-a.position.y);   // 上半截留在肩上
    const stub=all[0],lower=all[1];e.g.attach(stub);stub.userData.part=k;stub.userData.enemy=e;e.parts[k]=stub;
    throwGib(lower,n.clone().multiplyScalar(4).add(new THREE.Vector3(0,3,0)));bleed(stub,1.2,0.7);spawnBlood(lower.position,n,14);
    e.armHp[k]=Infinity;e.arms--;netSever(e,k);}
}
// 头部炸开：切成四块 + 脖子喷血
function headBurst(e,dir){
  const h=e.parts.head;if(h.parent!==e.g)return;const w=worldize(h);const c=w.position.clone();
  const up=new THREE.Vector3(0,1,0),rt=new THREE.Vector3(Math.cos(player.yaw),0,-Math.sin(player.yaw));
  let pcs=[w];const a=splitBox(w,c,up);if(a)pcs=[...a.pos,...a.neg];
  let out=[];for(const p of pcs){const b=splitBox(p,c,rt);out.push(...(b?[...b.pos,...b.neg]:[p]));}
  for(const p of out){const v=p.position.clone().sub(c).normalize().multiplyScalar(5).addScaledVector(dir,4);v.y+=3;throwGib(p,v,14);}
  spawnBlood(c,dir,40);const neck=new THREE.Object3D();neck.position.set(0,1.75,0);e.g.add(neck);bleed(neck,1.0,1.6);
}
// 熔化成一滩
function meltPuddle(e){
  const p=e.g.position.clone();const m=new THREE.Mesh(new THREE.CylinderGeometry(1.1,1.2,.06,10),new THREE.MeshBasicMaterial({color:0xff7a20}));m.position.set(p.x,.04,p.z);levelGroup.add(m);
  puddles.push({m,t:0});for(let i=0;i<20;i++){const s=new THREE.Mesh(bloodGeo,new THREE.MeshBasicMaterial({color:0xcccccc,transparent:true,opacity:.6}));s.position.set(p.x+(Math.random()-.5),.3,p.z+(Math.random()-.5));scene.add(s);sparks.push({m:s,v:new THREE.Vector3(0,2+Math.random()*2,0),life:1+Math.random()});}
}
let puddles=[];
function updatePuddles(dt){for(const p of puddles){p.t+=dt;const k=Math.min(1,p.t/3);p.m.material.color.setRGB(lerp(1,.3,k),lerp(.48,.02,k),lerp(.12,.02,k));}}

// ============================================================ 枪械效果：爆弹 / 霰弹 / 热熔
let puffs=[],bolts=[],coolMats=[];
function puff(p,n,color=0x555555,size=1){for(let i=0;i<n;i++){const m=new THREE.Mesh(bloodGeo,new THREE.MeshBasicMaterial({color,transparent:true,opacity:.7,depthWrite:false}));
  m.position.copy(p).add(new THREE.Vector3((Math.random()-.5)*.6,(Math.random()-.5)*.6,(Math.random()-.5)*.6));m.scale.setScalar(size*(1+Math.random()));scene.add(m);
  puffs.push({m,v:new THREE.Vector3((Math.random()-.5)*1.5,.8+Math.random(),(Math.random()-.5)*1.5),life:.8+Math.random()*.6,max:1.4});}}
function updatePuffs(dt){if(typeof biomeTick==='function'&&state!=='hub'){biomeTick(dt);updateHazards(dt);}while(puffs.length>CFG.perf.puffs){const o=puffs.shift();scene.remove(o.m);}for(const p of puffs){p.life-=dt;p.m.position.addScaledVector(p.v,dt);p.m.scale.multiplyScalar(1+dt*2.5);p.m.material.opacity=Math.max(0,p.life/p.max*.7);if(p.life<=0)scene.remove(p.m);}puffs=puffs.filter(p=>p.life>0);
  for(const c of coolMats){c.t+=dt;const k=Math.min(1,c.t/4);c.mat.color.setRGB(lerp(1,.25,k),lerp(.55,.04,k),lerp(.15,.02,k));}coolMats=coolMats.filter(c=>c.t<4);}
function embersBlue(p,n){for(let i=0;i<n;i++){const m=new THREE.Mesh(bloodGeo,new THREE.MeshBasicMaterial({color:Math.random()<.5?0x60b0ff:0xe0f4ff}));m.position.copy(p);m.scale.setScalar(.5);scene.add(m);
  sparks.push({m,v:new THREE.Vector3((Math.random()-.5)*6,1+Math.random()*4,(Math.random()-.5)*6),life:.3+Math.random()*.3});}}
function embers(p,n){for(let i=0;i<n;i++){const m=new THREE.Mesh(bloodGeo,new THREE.MeshBasicMaterial({color:Math.random()<.5?0xff7a20:0xffd060}));m.position.copy(p);m.scale.setScalar(.5);scene.add(m);
  sparks.push({m,v:new THREE.Vector3((Math.random()-.5)*4,1+Math.random()*4,(Math.random()-.5)*4),life:.4+Math.random()*.5});}}
function fleshChunks(p,dir,n){for(let i=0;i<n;i++){const s=.12+Math.random()*.14;const m=new THREE.Mesh(new THREE.BoxGeometry(s,s,s),Math.random()<.5?matCut:matBlood);m.position.copy(p);scene.add(m);
  const v=new THREE.Vector3((Math.random()-.5)*7,2+Math.random()*4,(Math.random()-.5)*7);if(dir)v.addScaledVector(dir,4);throwGib(m,v,14);}}
// 把一个部位炸成四块
function shatter(m,center,dir,speed){
  const up=new THREE.Vector3(0,1,0),rt=new THREE.Vector3(Math.cos(player.yaw),0,-Math.sin(player.yaw));
  let pcs=[m];const a=splitBox(m,m.position.clone(),up);if(a)pcs=[...a.pos,...a.neg];
  const out=[];for(const p of pcs){const b=splitBox(p,p.position.clone(),rt);out.push(...(b?[...b.pos,...b.neg]:[p]));}
  for(const p of out){const v=p.position.clone().sub(center).normalize().multiplyScalar(speed*(0.6+Math.random()*.6));if(dir)v.addScaledVector(dir,speed*.5);v.y+=2+Math.random()*3;throwGib(p,v,16);}
}
const attachedParts=e=>Object.keys(e.parts).filter(k=>e.parts[k].parent===e.g).map(k=>worldize(e.parts[k]));
// 爆弹致命：从命中点向外炸开
function burstKill(e,P,dir){
  for(const m of attachedParts(e)){const d=m.position.distanceTo(P);
    if(d<0.75)shatter(m,P,dir,9);else{const v=m.position.clone().sub(P).normalize().multiplyScalar(7/(d+0.6)).addScaledVector(dir,3);v.y+=2.5;throwGib(m,v,10);}}
  spawnBlood(P,dir,35);fleshChunks(P,dir,8);puff(P,6,0x4a3030,1.5);
}
// 霰弹致命 A：半边身体被轰飞
function halfKill(e,dir){
  const up=new THREE.Vector3(0,1,0),side=Math.random()<.5?1:-1;const n=new THREE.Vector3().crossVectors(dir,up).normalize().multiplyScalar(side);
  const P=e.g.position.clone().setY(1.2*e.g.scale.y).addScaledVector(n,(Math.random()-.5)*.2);
  for(const m of attachedParts(e)){const pieces=planeHits(m,P,n)?splitBox(m,P,n):null;
    const list=pieces?[...pieces.pos.map(x=>[x,true]),...pieces.neg.map(x=>[x,false])]:[[m,m.position.clone().sub(P).dot(n)>0]];
    for(const [x,pos] of list){const v=pos?dir.clone().multiplyScalar(13).addScaledVector(n,4).add(new THREE.Vector3(0,3+Math.random()*2,0)):dir.clone().multiplyScalar(1.5).add(new THREE.Vector3(0,1,0));
      throwGib(x,v,pos?14:4);if(pieces)bleed(x,1.0,pos?1:.6);}}
  spawnBlood(P,dir,50);fleshChunks(P,dir,10);
}
// 霰弹致命 B / 热熔致命：躯干中间一段被轰碎（或汽化），上半身飞出去
function holeKill(e,P,dir,mode='chunks'){
  const S=e.g.scale.y,y0=clamp(P.y,0.85*S,1.55*S),top=y0+0.28*S,bot=y0-0.28*S,up=new THREE.Vector3(0,1,0);
  const Pt=new THREE.Vector3(P.x,top,P.z),Pb=new THREE.Vector3(P.x,bot,P.z);
  const capMat=mode==='vapor'?new THREE.MeshBasicMaterial({color:0xffa040}):null;if(capMat)coolMats.push({mat:capMat,t:0});
  const upper=[],middle=[],lower=[];
  for(const m of attachedParts(e)){let segs=[m];if(planeHits(m,Pt,up)){const s=splitBox(m,Pt,up,capMat);if(s)segs=[...s.pos,...s.neg];}
    for(const x of segs){if(x.position.y>top){upper.push(x);continue;}
      if(planeHits(x,Pb,up)){const s=splitBox(x,Pb,up,capMat);if(s){middle.push(...s.pos);lower.push(...s.neg);continue;}}
      (x.position.y<bot?lower:middle).push(x);}}
  for(const x of middle){if(mode==='vapor'){const p=x.position.clone();scene.remove(x);embers(p,8);}else shatter(x,P,dir,10);}
  for(const x of upper){const v=dir.clone().multiplyScalar(mode==='vapor'?2.5:9).add(new THREE.Vector3((Math.random()-.5)*2,3+Math.random()*2,(Math.random()-.5)*2));throwGib(x,v,10);if(mode!=='vapor')bleed(x,0.9,1);}
  for(const x of lower){throwGib(x,dir.clone().multiplyScalar(1).add(new THREE.Vector3(0,.5,0)),3);if(mode!=='vapor')bleed(x,0.9,.8);}
  if(mode==='vapor'){embers(P,24);puff(P,8,0x2a2020,1.4);}else{spawnBlood(P,dir,45);fleshChunks(P,dir,12);}
}
function vaporizeLimb(e,k){const arm=e.parts[k];if(arm.parent!==e.g)return;const w=worldize(arm);const p=w.position.clone();scene.remove(w);embers(p,12);puff(p,3,0x332222,1);e.armHp[k]=Infinity;e.arms--;netSever(e,k);}
// 爆弹：真正飞行的火箭弹，命中后钉进去再爆炸
function spawnBolt(o,d,w,fromMuzzle=false){const m=new THREE.Group();const b=new THREE.Mesh(new THREE.BoxGeometry(.06,.06,.22),new THREE.MeshBasicMaterial({color:0xd8a657}));m.add(b);
  const f=new THREE.Mesh(new THREE.BoxGeometry(.09,.09,.08),new THREE.MeshBasicMaterial({color:0xffb050}));f.position.z=.14;m.add(f);
  if(fromMuzzle)m.position.copy(o);else m.position.copy(o).add(new THREE.Vector3(0,-.12,0)).addScaledVector(d,.5);m.quaternion.setFromUnitVectors(new THREE.Vector3(0,0,-1),d);scene.add(m);
  bolts.push({m,d:d.clone(),speed:75,life:1.6,w});}
function updateBolts(dt){
  for(const b of bolts){b.life-=dt;const len=b.speed*dt;const h=castRay(b.m.position,b.d,len+0.15);
    if(h){boltImpact(b,h);b.dead=true;scene.remove(b.m);continue;}
    b.m.position.addScaledVector(b.d,len);if(Math.random()<.9){const s=new THREE.Mesh(bloodGeo,new THREE.MeshBasicMaterial({color:0xffa040}));s.position.copy(b.m.position);s.scale.setScalar(.5);scene.add(s);sparks.push({m:s,v:new THREE.Vector3(0,.3,0),life:.08});}
    if(b.life<=0){b.dead=true;scene.remove(b.m);}}
  bolts=bolts.filter(b=>!b.dead);
}
function boltImpact(b,h){
  const e=h.object.userData.enemy,P=h.point.clone(),d=b.d;
  if(e&&e.alive){const part=h.object.userData.part==='eye'?'head':h.object.userData.part;
    const k=damageEnemy(e,b.w.dmg*player.gunMul,part,d,{point:P,knock:b.w.knock,limbMul:2.2,how:{burst:{p:P,dir:d}}});hitSparks(P,d,4);play(part==='head'?'head':'hit');showHit(k);}
  setTimeout(()=>{if(state!=='playing')return;play('boltBoom');hitSparks(P,null,8);puff(P,4,0x555555,1);if(e)fleshChunks(P,d,4);
    for(const o of enemies)if(o.alive&&o!==e&&o.g.position.clone().setY(1.2).distanceTo(P)<1.8)damageEnemy(o,10,'body',o.g.position.clone().sub(P).setY(0).normalize(),{stagger:.15,knock:.6});
    if(e&&e.alive&&e.g.position.clone().setY(1.2).distanceTo(P)<1.8)damageEnemy(e,8,'body',null,{stagger:.15,how:{burst:{p:P,dir:d}}});},55);
}
// 霰弹：所有弹丸先算命中，再按每个敌人合计结算
function shotgunBlast(w){
  const per=new Map();let anyHit=false,anyKill=false,head=false;const o=new THREE.Vector3();camera.getWorldPosition(o);
  for(let k=0;k<w.pellets;k++){const {o:oo,d}=aimRay(w.spread);const h=castRay(oo,d);if(!h)continue;const e=h.object.userData.enemy;
    if(!e||!e.alive){spawnSpark(h.point);continue;}const part=h.object.userData.part==='eye'?'head':h.object.userData.part;
    if(!per.has(e))per.set(e,{n:0,head:0,arms:{},p:h.point.clone(),d:d.clone()});const r=per.get(e);r.n++;if(part==='head')r.head++;if(part==='armL'||part==='armR')r.arms[part]=(r.arms[part]||0)+1;hitSparks(h.point,d,2);}
  puff(o.clone().add(new THREE.Vector3(-Math.sin(player.yaw)*1.2,-.2,-Math.cos(player.yaw)*1.2)),4,0x888888,.8);
  for(const [e,r] of per){const dist=e.g.position.distanceTo(player.pos);const dmg=w.dmg*player.gunMul*(r.n+r.head);head=head||r.head>0;anyHit=true;
    const big=r.n>=4&&dist<7;const how=big?(Math.random()<.5?{half:{dir:r.d}}:{hole:{p:r.p,dir:r.d,mode:'chunks'}}):{};
    const k=damageEnemy(e,dmg,'body',r.d,{point:r.p,knock:.25*r.n,stagger:.2+.05*r.n,how});anyKill=anyKill||k;
    if(!k)for(const [a,c] of Object.entries(r.arms))if(c>=2&&e.parts[a].parent===e.g){detach(e,a,r.d);e.armHp[a]=Infinity;e.arms--;spawnBlood(r.p,r.d,20);}
    spawnBlood(r.p,r.d,6+r.n*2);}
  return {anyHit,anyKill,head};
}

// ============================================================ 血与碎块
const bloodGeo=new THREE.BoxGeometry(.12,.12,.12);
function spawnBlood(p,dir,n){for(let i=0;i<n;i++){const m=new THREE.Mesh(bloodGeo,matBlood);m.position.copy(p);scene.add(m);
  const v=new THREE.Vector3((Math.random()-.5)*5,Math.random()*5,(Math.random()-.5)*5);if(dir)v.addScaledVector(dir,4);
  bloods.push({m,v,rest:false});capBloods();}}
function updateDebris(dt){
  for(const b of bloods){if(b.rest)continue;b.v.y-=18*dt;b.m.position.addScaledVector(b.v,dt);if(b.m.position.y<=0.01){b.m.position.y=0.01;b.rest=true;b.m.scale.set(1+Math.random()*2,.15,1+Math.random()*2);}}
  for(const g of gibs){if(g.rest)continue;g.v.y-=18*dt;g.m.position.addScaledVector(g.v,dt);g.m.rotation.x+=g.spin.x*dt;g.m.rotation.y+=g.spin.y*dt;
    if(g.m.position.y<0.15){g.m.position.y=0.15;g.v.y*=-0.3;g.v.x*=0.6;g.v.z*=0.6;g.spin.multiplyScalar(0.5);if(Math.abs(g.v.y)<0.8&&g.v.length()<0.8)g.rest=true;}}
}

