// ============================================================ 唤潮者的火射线 → 焚灭火柱：按 C 引导 1.6 秒的粗火柱，跟随准星，穿透并点燃路上所有敌人，烧出火痕，结束时终点爆炸
const PB={on:false,t:0,dur:1.6,mul:1,tick:0,grp:null,core:null,outer:null,sp:[],end:null};
function startPyreBeam(mul){if(PB.on)return;PB.on=true;PB.t=0;PB.mul=mul;PB.tick=0;player.channelT=PB.dur;
  const g=new THREE.Group();scene.add(g);PB.grp=g;
  PB.core=new THREE.Mesh(new THREE.CylinderGeometry(.14,.04,1,8,1,true),new THREE.MeshBasicMaterial({color:0xfff4c0,transparent:true,opacity:.95,depthWrite:false}));
  PB.outer=new THREE.Mesh(new THREE.CylinderGeometry(.45,.08,1,10,1,true),new THREE.MeshBasicMaterial({color:0xff6a10,transparent:true,opacity:.45,depthWrite:false,side:2}));
  PB.glow=new THREE.Mesh(new THREE.CylinderGeometry(.8,.12,1,10,1,true),new THREE.MeshBasicMaterial({color:0xff3000,transparent:true,opacity:.15,depthWrite:false,side:2}));
  g.add(PB.core,PB.outer,PB.glow);PB.sp=[];for(let i=0;i<18;i++){const m=new THREE.Mesh(new THREE.BoxGeometry(.1,.1,.1),new THREE.MeshBasicMaterial({color:i%2?0xffd060:0xff7020}));g.add(m);PB.sp.push(m);}
  play('melta');play('spell',300);loopSound('flame',true);announce('焚灭火柱',.8);}
function updatePyreBeam(dt){if(!PB.on)return;PB.t+=dt;const k=Math.min(1,PB.t/.25),fade=PB.t>PB.dur-.2?(PB.dur-PB.t)/.2:1;
  const {o,d}=aimRay(0);const a=o.clone().add(new THREE.Vector3(0,-.22,0)).addScaledVector(new THREE.Vector3(Math.cos(player.yaw),0,-Math.sin(player.yaw)),.12).addScaledVector(d,.5);
  const h=castRay(o,d,40);const wall=castRayWalls(o,d,40);const b=wall?wall.point:o.clone().addScaledVector(d,40);PB.end=b;
  const L=a.distanceTo(b),mid=a.clone().lerp(b,.5);PB.grp.position.copy(mid);PB.grp.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),b.clone().sub(a).normalize());
  const w=(.6+.4*k)*fade*(1+Math.sin(PB.t*40)*.08);for(const m of [PB.core,PB.outer,PB.glow])m.scale.set(w,L,w);
  PB.sp.forEach((m,i)=>{const ang=PB.t*14+i*.7,y=((i/PB.sp.length+PB.t*1.8)%1-.5)*L;m.position.set(Math.cos(ang)*.45*w,y,Math.sin(ang)*.45*w);});
  player.shake=Math.max(player.shake,.12);loopSound('flame',true);player.flameT=.15;
  PB.tick-=dt;if(PB.tick<=0){PB.tick=.1;let kill=false,any=false;
    for(const e of enemies){if(!e.alive)continue;const c=e.g.position.clone().setY(1.2*e.g.scale.y);const t=c.clone().sub(a).dot(d);if(t<0||t>L)continue;
      const off=c.distanceTo(a.clone().addScaledVector(d,t));if(off>.9+e.r)continue;kill=damageEnemy(e,11*PB.mul,'body',d,{stagger:.15,knock:.2,how:{melt:true},_noShield:true})||kill;if(!isClient())e.burn=Math.max(e.burn,3);any=true;}
    if(any)showHit(kill);if(wall&&Math.random()<.7){const p=wall.point;addFirePatch(p.x-d.x*.6,p.z-d.z*.6);}
    embers(b.clone(),3);fxSend('pbeam',{ax:a.x,ay:a.y,az:a.z,bx:b.x,by:b.y,bz:b.z});}
  if(PB.t>=PB.dur){PB.on=false;scene.remove(PB.grp);loopSound('flame',false);const P=b.clone();play('boom');play('melta');
    const d2={k:'pyre',x:P.x,z:P.z};ultFx(d2);fxSend('ult',d2);
    for(const e of enemies){if(!e.alive)continue;const dd=e.g.position.distanceTo(P.clone().setY(0));if(dd<3+e.r)damageEnemy(e,40*PB.mul,'body',e.g.position.clone().sub(P).setY(0).normalize(),{knock:1.5,stagger:.5,how:{melt:true}});}}}
function castRayWalls(o,d,far){ray.set(o,d);ray.far=far;const h=ray.intersectObjects(wallMeshes,false);return h[0]||null;}
// 队友那边：画一道短暂的火柱
function pbeamFx(d){const a=new THREE.Vector3(d.ax,d.ay,d.az),b=new THREE.Vector3(d.bx,d.by,d.bz);const L=a.distanceTo(b);
  const m=new THREE.Mesh(new THREE.CylinderGeometry(.35,.25,L,8,1,true),new THREE.MeshBasicMaterial({color:0xff7020,transparent:true,opacity:.6,depthWrite:false,side:2}));
  m.position.copy(a).lerp(b,.5);m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),b.clone().sub(a).normalize());ufxAdd(m,.12,{op:.6});}
