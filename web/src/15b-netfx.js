// ============================================================ 联机特效同步：自己这边已经播放，fxSend 只把画面发给其他人（伤害仍由原来的路径结算）
function fxSend(k,d){if(!isNet())return;const m={t:'fx2',k,d};if(isClient())sendNet(m);else if(isHost())bcast(m);}
function fxPlay(k,d){
  if(k==='slam')slamFx(d.x,d.z);
  else if(k==='boom'){const p=new THREE.Vector3(d.x,d.y,d.z);play('boom');puff(p,8,0x444444,1.2);hitSparks(p,null,10);slamFx(d.x,d.z);}
  else if(k==='warp'){embersBlue(new THREE.Vector3(d.x0,1,d.z0),16);embersBlue(new THREE.Vector3(d.x1,1,d.z1),16);play('zap');slamFx(d.x1,d.z1);}
  else if(k==='line'){for(let i=1;i<8;i++)embersBlue(new THREE.Vector3(d.x+d.fx*i,.3,d.z+d.fz*i),3);play('zap');}
  else if(k==='patch')addFirePatch(d.x,d.z,true);
  else if(k==='plasma'){embersBlue(new THREE.Vector3(d.x,d.y,d.z),14);play('boom');}
  else if(k==='ult'&&typeof ultFx==='function')ultFx(d);
  else if(k==='eflame')flameBurst(new THREE.Vector3(d.x,d.y,d.z),new THREE.Vector3(d.dx,0,d.dz));
  else if(k==='bless')blessFx(d.x,d.z);
  else if(k==='icewarn')iceWarn(d.x,d.z);else if(k==='ice')iceSpikes(d.x,d.z);else if(k==='tport')embersBlue(new THREE.Vector3(d.x,1.5,d.z),20);}
// 队友模型手里拿一把枪（机甲自带武器，不加）
function addRemoteGun(model,cls){if(CLS[cls]&&CLS[cls].eye)return;const g=new THREE.Group();
  for(const [w,h,d,x,y,z,m] of [[.16,.2,.8,0,0,0,gunMat],[.08,.08,.5,0,.04,.6,gunDark],[.1,.24,.12,0,-.18,-.15,gunDark]]){const b=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);b.position.set(x,y,z);g.add(b);}
  g.position.set(-.55,1.25,.45);model.add(g);}
