// ============================================================ 战场强化：双方小队战术 + 战场氛围
// AI：敌人按空降/刷出的批次编成小队（交替掩护推进、重伤后撤、民兵士气崩溃、扔手雷逼玩家出掩体）；队友交战时各自找掩体射击位、
//     互相拉开距离、不挡玩家火线、蹲在掩体后换弹、看到敌人扎堆就扔手雷、分散火力；近战冲锋走之字形。
// 氛围：远处双方曳光弹对射与防空火、随机炮击（声音按距离延迟）、战机/炮艇低空掠过并扫射、烟柱、持续的战场背景声、子弹擦身压制、近爆耳鸣。
const WAR={sq:0,sqMap:new Map(),nades:[],nadeT:-99,allyNadeT:0,nadeBark:-99,still:{x:0,z:0,t:0},tr:[],trT:0,boomT:3,flyT:14,fly:[],sched:[],smokeLG:null,smoke:[],sup:0,whiz:new WeakSet(),bed:null,crT:0,tgtT:0,clT:0};
// ---------------- 小队编组
const _osW=openSpawn;openSpawn=function(...a){const out=_osW(...a);const id=++WAR.sq;for(const e of out){e.squad=id;e.sqN=out.length;}return out;};
const _csW=campSpawn;campSpawn=function(...a){const out=_csW(...a);const id=++WAR.sq;for(const e of out){e.squad=id;e.sqN=out.length;}return out;};
function rebuildSquads(){WAR.sqMap.clear();for(const e of enemies){if(!e.alive||!e.squad)continue;let L=WAR.sqMap.get(e.squad);if(!L)WAR.sqMap.set(e.squad,L=[]);L.push(e);}}
// ---------------- 手雷（双方共用）
function throwNade(from,to,team,src){const m=new THREE.Mesh(new THREE.SphereGeometry(.13,8,6),lmat(0x2a2e26));m.position.copy(from);scene.add(m);const d=Math.hypot(to.x-from.x,to.z-from.z);
  WAR.nades.push({m,a:from.clone(),b:to.clone().setY(.15),t:0,fly:.7+d/32,h:2.5+d*.12,fuse:.9,team,src,warned:false});if(from.distanceTo(player.pos)<25)play('whoosh');}
function updateNades(dt){for(const N of WAR.nades){N.t+=dt;if(N.t<N.fly){const k=N.t/N.fly;N.m.position.copy(N.a).lerp(N.b,k);N.m.position.y+=Math.sin(k*Math.PI)*N.h;N.m.rotation.x+=dt*12;continue;}
    if(!N.warned){N.warned=true;N.m.position.copy(N.b);ringAt(N.b.x,.1,N.b.z,0xff3020,4.6,4.6,N.fuse,.06);if(actx&&N.b.distanceTo(player.pos)<20)tone('square',1400,1400,.03,.08);
      if(N.team==='chaos'&&N.b.distanceTo(player.pos)<7&&gameTime-WAR.nadeBark>5){WAR.nadeBark=gameTime;const sp=allies.filter(a=>a.alive&&!a.def.generic&&!a.vehicle);if(sp.length)vox(pickOne(sp).id,pickOne(['GRENADE!','Grenade — move!','Frag at your feet!']),true);}}
    if(N.t>=N.fly+N.fuse&&!N.done){N.done=true;scene.remove(N.m);const P=N.b;ringAt(P.x,.3,P.z,0xffa040,.4,5,.4,.25);puff(P.clone().setY(.8),12,0x3a3028,2.4);dust(P.clone(),12);hitSparks(P.clone().setY(.5),new THREE.Vector3(0,1,0),16);
      const pd=P.distanceTo(player.pos);if(pd<40){play('boom');player.shake=Math.max(player.shake,.5*(1-pd/40));}if(pd<7)tinnitus(1-pd/7);
      if(N.team==='chaos'){if(pd<4.8&&state==='playing')hurtPlayer(58*(1-pd/5.2),false,N.src&&N.src.alive?N.src:null);for(const a of allies)if(a.alive&&a.pos.distanceTo(P)<4.8)allyHurt(a,70*(1-a.pos.distanceTo(P)/5.2),N.src);}
      else for(const e of enemies){if(!e.alive)continue;const d=e.g.position.distanceTo(P);if(d>4.8)continue;const dir=e.g.position.clone().sub(P).setY(0);const L=dir.length()||1;dir.divideScalar(L);
        damageEnemy(e,(e.vehicle?120:240)*(1-d/5.2),'body',dir,{_remote:true,explode:true,how:{burst:{p:P.clone(),dir}}});}}}
  WAR.nades=WAR.nades.filter(N=>!N.done);}
// ---------------- 敌人：小队交替掩护、重伤后撤、手雷、民兵士气
const _shW=shooterAI;shooterAI=function(e,T,pp,to,dist,dt,W,band,burst,cool,interval){
  if(e.flee>0){e.flee-=dt;const away=e.g.position.clone().sub(player.pos).setY(0);const L=away.length()||1;away.divideScalar(L);e.g.position.addScaledVector(steer(e,away,dt),e.speed*1.2*dt);walkLegs(e,e.speed,dt);collide(e.g.position,e.r);aimPose(e,0);
    if(e.flee<=0){e.rallied=true;if(e.cov)e.cov.re=0;}return true;}
  if(e.marine&&!e.named&&!e.vehicle&&!e.heavy){
    if(!e.fellBack&&e.hp<e.maxHp*.3&&e.cov){e.fellBack=true;e.cov.re=0;e.cov.ph='none';TAC.claims.delete(e.id);}
    if(e.fellBack)band=[band[0]+7,band[1]+9];
    const mates=WAR.sqMap.get(e.squad);
    if(e.cov&&mates&&mates.length>1){const moving=mates.some(x=>x!==e&&x.cov&&x.cov.ph==='move');
      if(moving){if(e.cov.ph==='hide')e.cov.t=Math.min(e.cov.t,.15);if(e.cov.re<.7)e.cov.re=.7;e.fireCd=Math.min(e.fireCd??1,.45);}}
    e.nadeCd=(e.nadeCd??(5+Math.random()*9))-dt;
    const atP=playerIsTarget(pp),hid=e.cov&&e.cov.ph==='hide';if(e.nadeCd<=0&&dist>8&&dist<24&&gameTime-WAR.nadeT>4.5&&state==='playing'&&(atP?(WAR.still.t>2.5&&(!hasLOS(e,pp)||hid||WAR.still.t>5)):(!hasLOS(e,pp)||hid||Math.random()<.004))){
      e.nadeCd=12+Math.random()*8;WAR.nadeT=gameTime;e.parts.armL.rotation.x=-2.6;const tgt=pp.clone().setY(0).add(V3((Math.random()-.5)*2.4,0,(Math.random()-.5)*2.4));throwNade(e.g.position.clone().setY(2.1*e.g.scale.y),tgt,'chaos',e);return true;}}
  return _shW(e,T,pp,to,dist,dt,W,band,burst,cool,interval);};
function moraleCheck(){for(const [id,L] of WAR.sqMap){const e0=L[0];if(!e0||e0.type!=='militia'||e0.sqBroken)continue;if((e0.sqN||0)>=4&&L.length<=Math.floor(e0.sqN*.4)){for(const e of L){e.sqBroken=true;if(!e.rallied)e.flee=4+Math.random()*2;}
    if(gameTime-(WAR.brkBark||-99)>12){WAR.brkBark=gameTime;const sp=allies.filter(a=>a.alive&&!a.def.generic&&!a.vehicle);if(sp.length)vox(pickOne(sp).id,pickOne(['They’re breaking — run them down!','Militia’s running!','Their nerve is gone!']),true);}}}}
// 近战冲锋走之字形（不再排成一列直线送死）
const _stW=steer;steer=function(e,dir,dt){const d=_stW(e,dir,dt);if((e.type==='we'||e.type==='nl'||e.type==='ec')&&!e.leap&&!e.flee){const pd=e.g.position.distanceTo(player.pos);
    if(pd>6&&pd<40){const a=Math.sin(gameTime*1.7+e.id*1.3)*.55,c=Math.cos(a),s=Math.sin(a);return new THREE.Vector3(d.x*c-d.z*s,0,d.x*s+d.z*c);}}return d;};
// ---------------- 双方都不再挤成一团：同阵营软分离
function softSpacing(dt){const sep=(L,R,k)=>{for(let i=0;i<L.length;i++){const A=L[i].p;for(let j=i+1;j<L.length;j++){const B=L[j].p;const dx=B.x-A.x,dz=B.z-A.z,d2=dx*dx+dz*dz;if(d2>R*R||d2<1e-4)continue;
      const d=Math.sqrt(d2),f=(R-d)/R*k*dt/d;A.x-=dx*f;A.z-=dz*f;B.x+=dx*f;B.z+=dz*f;}}for(const o of L)collide(o.p,o.r);};
  sep(enemies.filter(e=>e.alive&&!e.vehicle&&!e.static&&!e.leap&&!e.heavy&&!e.named).map(e=>({p:e.g.position,r:e.r})),2.6,1.8);
  sep(allies.filter(a=>a.alive&&!a.vehicle&&!a.big&&!a.down&&!(a.swing>0)).map(a=>({p:a.pos,r:a.r})),3,1.6);
  for(const a of allies){if(!a.alive||a.vehicle||a.big)continue;const dx=a.pos.x-player.pos.x,dz=a.pos.z-player.pos.z,d=Math.hypot(dx,dz);if(d<2.2&&d>1e-3){a.pos.x+=dx/d*(2.2-d)*Math.min(1,dt*6);a.pos.z+=dz/d*(2.2-d)*Math.min(1,dt*6);collide(a.pos,a.r);}}}
// ---------------- 队友：交战时找掩体射击位（不挡玩家火线、互相隔开），蹲着换弹
function inFireLine(x,z,E){const P=player.pos,Q=E.g.position,vx=Q.x-P.x,vz=Q.z-P.z,L2=vx*vx+vz*vz;if(L2<1)return false;const t=((x-P.x)*vx+(z-P.z)*vz)/L2;if(t<.05||t>.95)return false;
  return Math.hypot(P.x+vx*t-x,P.z+vz*t-z)<2.2;}
function allySpotFree(a,x,z){if(Math.hypot(player.pos.x-x,player.pos.z-z)<3.4)return false;for(const b of allies){if(b===a||!b.alive)continue;const q=b.tc&&b.tc.p?b.tc.p:b.pos;if(Math.hypot(q.x-x,q.z-z)<3.2)return false;}return true;}
function chooseAllyPos(a,E,anchor,R){const T=E.g.position,cand=[];
  for(const b of colliders){const hw=(b.maxX-b.minX)/2,hd=(b.maxZ-b.minZ)/2;if(hw>9||hd>9||hw+hd<.6)continue;const cx=b.minX+hw,cz=b.minZ+hd;if(Math.abs(cx-anchor.x)>R+5||Math.abs(cz-anchor.z)>R+5)continue;
    let ax=cx-T.x,az=cz-T.z;const L=Math.hypot(ax,az);if(L<8||L>34)continue;ax/=L;az/=L;const ext=Math.abs(ax)*hw+Math.abs(az)*hd,sx=cx+ax*(ext+a.r+.5),sz=cz+az*(ext+a.r+.5);
    if(Math.hypot(sx-anchor.x,sz-anchor.z)>R||!navOK(sx,sz)||inFireLine(sx,sz,E)||!allySpotFree(a,sx,sz))continue;cand.push([Math.hypot(sx-a.pos.x,sz-a.pos.z)+Math.hypot(sx-anchor.x,sz-anchor.z)*.5,sx,sz]);}
  cand.sort((p,q)=>p[0]-q[0]);
  for(const [,sx,sz] of cand.slice(0,6)){const c=new THREE.Vector3(sx,0,sz);if(!concealed(sx,sz,T))continue;const pk=peekSpot(a,c,T);if(pk)return {p:c,pk};}
  // 没有掩体：在锚点附近找一个看得见敌人、不挡火线的开阔射击位
  for(let k=0;k<10;k++){const ang=Math.random()*6.28,r=2.5+Math.random()*(R*.6);const x=anchor.x+Math.cos(ang)*r,z=anchor.z+Math.sin(ang)*r;
    if(navOK(x,z)&&!inFireLine(x,z,E)&&allySpotFree(a,x,z)&&!gridBlocked(x,z,T.x,T.z)){const p=new THREE.Vector3(x,0,z);return {p,pk:p};}}
  return null;}
function allyTacGoal(a,E,anchor,R){if(a.big||a.vehicle||a.role==='melee'||a.role==='psyker')return anchor;const tc=a.tc||(a.tc={});
  if(!tc.p||gameTime>tc.until||tc.E!==E||tc.anchor.distanceTo(anchor)>R*.7){const r=chooseAllyPos(a,E,anchor,R);tc.until=gameTime+5+Math.random()*3;tc.E=E;tc.anchor=anchor.clone();if(r){tc.p=r.p;tc.pk=r.pk;}else{tc.p=null;return anchor;}}
  const wantFire=a.burst>0||(!(a.reloadT>0)&&(a.fireCd??0)<.45);tc.hide=!wantFire&&tc.pk!==tc.p;return (wantFire?tc.pk:tc.p).clone();}
// 近战队友从侧面绕过去，不再一条直线冲
function allyMeleeGoal(a,E){const P=E.g.position,d=P.distanceTo(a.pos);if(d<5)return P.clone();const s=(a.id.length%2?1:-1),dx=P.x-a.pos.x,dz=P.z-a.pos.z;
  return new THREE.Vector3(P.x-dz/d*s*3,0,P.z+dx/d*s*3);}
const _uaW=updateAllies;updateAllies=function(dt){_uaW(dt);
  for(const a of allies){if(!a.alive||a.big||a.vehicle||a.down||!a.J||!a.J.hipL)continue;const tc=a.tc;const hide=tc&&tc.p&&tc.hide&&a.target&&a.target.alive&&a.pos.distanceTo(tc.p)<1;
    a.ck=lerp(a.ck||0,hide?1:0,Math.min(1,dt*6));const k=a.ck;if(k<.02)continue;const J=a.J;
    J.hipL.rotation.x=lerp(J.hipL.rotation.x,-1.25,k);J.kneeL.rotation.x=lerp(J.kneeL.rotation.x,1.55,k);J.hipR.rotation.x=lerp(J.hipR.rotation.x,.25,k);J.kneeR.rotation.x=lerp(J.kneeR.rotation.x,1.45,k);J.torso.position.y-=.44*k;}};
// 分散火力：同一个敌人最多 3 名队友盯着
function spreadAllyFire(){const cnt=new Map();for(const a of allies)if(a.alive&&a.target&&a.target.alive)cnt.set(a.target,(cnt.get(a.target)||0)+1);
  for(const a of allies){if(!a.alive||!a.target||a.big||a.vehicle||(SQUAD&&SQUAD.focus===a.target))continue;if((cnt.get(a.target)||0)<=3)continue;
    let best=null,bd=30;for(const e of enemies){if(!e.alive||e===a.target||(cnt.get(e)||0)>=2)continue;const d=e.g.position.distanceTo(a.pos);if(d<bd&&allyLOS(a,e)){bd=d;best=e;}}
    if(best){cnt.set(a.target,cnt.get(a.target)-1);a.target=best;cnt.set(best,(cnt.get(best)||0)+1);}}}
// 队友看到敌人扎堆就扔手雷
function allyGrenades(){if(gameTime<WAR.allyNadeT)return;WAR.allyNadeT=gameTime+.5;const L=enemies.filter(e=>e.alive&&!e.vehicle&&!e.static&&!e.named);let best=null,bn=2;
  for(const e of L){let n=0;for(const o of L)if(o.g.position.distanceTo(e.g.position)<4.5)n++;if(n>bn){bn=n;best=e;}}if(!best)return;const P=best.g.position;if(P.distanceTo(player.pos)<6)return;
  const th=allies.find(a=>a.alive&&!a.big&&!a.vehicle&&!a.down&&(a.role==='bolter'||a.role==='blade')&&a.pos.distanceTo(P)>8&&a.pos.distanceTo(P)<26&&allyLOS(a,best));if(!th)return;
  WAR.allyNadeT=gameTime+7;throwNade(th.pos.clone().setY(2),P.clone(),'loyal',null);if(!th.def.generic)vox(th.id,pickOne(['Frag out!','Grenade — clustered targets!','Frag, left of the rubble!']));}
// ---------------- 压制：子弹擦身而过（屏幕暗角 + 呼啸声），近爆耳鸣
let supEl=null;try{supEl=document.createElement('div');supEl.id='supFx';if(supEl.style){supEl.style.cssText='position:fixed;inset:0;pointer-events:none;z-index:4;opacity:0;background:radial-gradient(ellipse at center,rgba(0,0,0,0) 45%,rgba(20,8,4,.85) 100%);transition:opacity .08s';document.body.appendChild(supEl);}}catch(err){supEl=null;}
function tinnitus(k){WAR.sup=1;if(actx){tone('sine',3900,3700,.035*k,2.2);noiseHit(200,.25*k,.6);}const f=$('fade');if(f&&f.style&&state==='playing'){f.style.background='#fff6e8';f.style.opacity=.35*k;WAR.flashT=.25;}}
function updateSuppression(dt){const head=player.pos.clone();head.y+=(CLS[cls]&&CLS[cls].eye)||1.6;
  for(const b of ebolts){if(b.team!=='chaos'||WAR.whiz.has(b))continue;if(b.p.distanceTo(head)<2.4){WAR.whiz.add(b);WAR.sup=Math.min(1,WAR.sup+.16);if(actx){noiseHit(2600+Math.random()*900,.07,.1,'bandpass');tone('sine',1100,320,.025,.14);}}}
  WAR.sup=Math.max(0,WAR.sup-dt*.45);if(WAR.sup>.3)player.shake=Math.max(player.shake,(WAR.sup-.3)*.12);if(supEl&&supEl.style)supEl.style.opacity=state==='playing'?(WAR.sup*.6).toFixed(3):'0';
  if(WAR.flashT>0){WAR.flashT-=dt;if(WAR.flashT<=0){const f=$('fade');if(f&&f.style){f.style.opacity=0;f.style.background='';}}}}
const _sbW=shellBlast;shellBlast=function(P,b){_sbW(P,b);const d=P.distanceTo(player.pos);if(d<8)tinnitus(1-d/8);};
// ---------------- 战场氛围（只在开放战场的战役里）
const trGeo=B3(.08,.08,3.2);
function tracer(a,b,col,speed=140){let T=WAR.tr.find(t=>!t.on);if(!T){if(WAR.tr.length>=70)return;T={m:new THREE.Mesh(trGeo,lmat(col,true))};WAR.tr.push(T);}T.m.material=lmat(col,true);
  T.on=true;T.a=a.clone();T.b=b.clone();T.t=0;T.dur=a.distanceTo(b)/speed;T.m.position.copy(a);T.m.lookAt(b);T.m.visible=true;if(!T.m.parent)scene.add(T.m);}
function updateTracers(dt){for(const T of WAR.tr){if(!T.on)continue;T.t+=dt;const k=T.t/T.dur;if(k>=1){T.on=false;T.m.visible=false;continue;}T.m.position.copy(T.a).lerp(T.b,k);}}
function farPt(rmin,rmax){const a=Math.random()*6.28,r=rmin+Math.random()*(rmax-rmin);return V3(player.pos.x+Math.cos(a)*r,0,player.pos.z+Math.sin(a)*r);}
function skirmish(){// 远处一段双方对射：一侧金色爆弹，一侧红色
  const A=farPt(28,70),ang=Math.random()*6.28,len=18+Math.random()*26,B=V3(A.x+Math.cos(ang)*len,0,A.z+Math.sin(ang)*len);const n=2+Math.floor(Math.random()*4);
  for(let i=0;i<n;i++){const ja=V3((Math.random()-.5)*3,1.2+Math.random()*.8,(Math.random()-.5)*3),jb=V3((Math.random()-.5)*3,1.2+Math.random()*.8,(Math.random()-.5)*3);
    WAR.sched.push({t:i*.09,f:()=>tracer(A.clone().add(ja),B.clone().add(jb),0xffc070)});WAR.sched.push({t:.25+i*.11,f:()=>tracer(B.clone().add(jb),A.clone().add(ja),Math.random()<.5?0xff3818:0xff6020)});}
  const d=A.distanceTo(player.pos);if(actx){const v=Math.max(.008,.05*(1-d/90));for(let i=0;i<n;i++)WAR.sched.push({t:i*.09+d/340,f:()=>noiseHit(900+Math.random()*700,v,.06,'bandpass')});}}
function flak(){const A=farPt(70,140);A.y=1;const B=A.clone().add(V3((Math.random()-.5)*60,90+Math.random()*60,(Math.random()-.5)*60));for(let i=0;i<4;i++)WAR.sched.push({t:i*.12,f:()=>tracer(A,B.clone().add(V3(i*2,0,0)),0xffd080,200)});
  WAR.sched.push({t:.9,f:()=>{const m=new THREE.Mesh(new THREE.SphereGeometry(1.4,8,6),lmat(0xffc080,true));m.position.copy(B);scene.add(m);WAR.sched.push({t:.25,f:()=>scene.remove(m)});}});}
function distBoom(P){const d=P.distanceTo(player.pos);ringAt(P.x,.3,P.z,0xffa040,.5,7,.55,.3);puff(P.clone().setY(1.5),14,0x2a2420,5);dust(P.clone(),14);
  const fl=new THREE.Mesh(new THREE.SphereGeometry(2.2,10,8),lmat(0xffb060,true));fl.position.copy(P).setY(1.6);scene.add(fl);WAR.sched.push({t:.18,f:()=>scene.remove(fl)});
  const v=Math.max(0,1-d/130);WAR.sched.push({t:d/340,f:()=>{if(actx){noiseHit(70,.55*v,1.1);noiseHit(400,.18*v,.25,'bandpass');}if(d<50)player.shake=Math.max(player.shake,.35*(1-d/50));}});
  if(scene.fog&&scene.fog.color){WAR.fogFlash=Math.max(WAR.fogFlash||0,.5*v);}}
function buildFighter(col){const g=new THREE.Group(),M=lmat(col),D=lmat(0x1a1a1a);const b=(w,h,d,x,y,z,m=M)=>{const o=new THREE.Mesh(B3(w,h,d),m);o.position.set(x,y,z);g.add(o);return o;};
  b(1.4,1.2,8,0,0,0);b(9,.18,2.6,0,0,-1.2);b(.18,1.8,1.6,0,1,-3.2);b(1,.6,1.4,0,.6,2.6,lmat(0x3a6080,true));for(const x of [-.5,.5])b(.5,.5,.2,x,0,-4.1,lmat(0xff9040,true));for(const x of [-3.2,3.2])b(.2,.2,2,x,-.2,.6,D);return g;}
function flyover(){const loyal=Math.random()<.6;const g=loyal?(act4()&&Math.random()<.5?buildGunship():buildFighter(0xc8c0a8)):buildFighter(0x5a1a14);if(!g.userData.ramp)g.scale.setScalar(1.1);
  const a=Math.random()*6.28,R=230,h=24+Math.random()*16,P0=V3(player.pos.x+Math.cos(a)*R,h,player.pos.z+Math.sin(a)*R),off=(Math.random()-.5)*60,
    P1=V3(player.pos.x-Math.cos(a)*R+Math.sin(a)*off,h+(Math.random()-.5)*8,player.pos.z-Math.sin(a)*R-Math.cos(a)*off);
  g.position.copy(P0);g.lookAt(P1);scene.add(g);WAR.fly.push({g,a:P0,b:P1,t:0,dur:P0.distanceTo(P1)/95,loyal,roar:false,gunT:0});}
function updateFly(dt){for(const F of WAR.fly){F.t+=dt;const k=F.t/F.dur;F.g.position.copy(F.a).lerp(F.b,k);F.g.rotation.z=Math.sin(F.t*1.3)*.25;const d=F.g.position.distanceTo(player.pos);
    if(!F.roar&&d<120){F.roar=true;if(actx){tone('sawtooth',140,55,.05,2.6);noiseHit(500,.22,1.8,'bandpass');}}
    if(d<90&&Math.abs(F.g.position.x)<OPEN.R&&Math.abs(F.g.position.z)<OPEN.R){F.gunT-=dt;if(F.gunT<=0){F.gunT=.06;const fw=F.b.clone().sub(F.a).normalize();const G=F.g.position.clone().addScaledVector(fw,25).setY(0).add(V3((Math.random()-.5)*6,0,(Math.random()-.5)*6));
        if(G.distanceTo(player.pos)>12){tracer(F.g.position,G,F.loyal?0xffd080:0xff4020,220);if(Math.random()<.18)WAR.sched.push({t:.12,f:()=>{dust(G.clone(),5);hitSparks(G.clone().setY(.3),new THREE.Vector3(0,1,0),6);}});}}}
    if(k>=1){scene.remove(F.g);F.done=true;}}WAR.fly=WAR.fly.filter(F=>!F.done);}
function buildSmoke(){WAR.smokeLG=levelGroup;WAR.smoke=[];const mat=new THREE.MeshLambertMaterial({color:0x16120f,transparent:true,opacity:.6,depthWrite:false});
  for(let i=0;i<9;i++){const a=Math.random()*6.28,r=40+Math.random()*55,x=Math.cos(a)*r,z=Math.sin(a)*r,y0=Math.max(0,groundH(x,z));const col={x,z,y0,puffs:[]};
    const fire=new THREE.Mesh(new THREE.ConeGeometry(2.4,5,6),lmat(0xff7020,true));fire.position.set(x,y0+2,z);levelGroup.add(fire);
    for(let k=0;k<7;k++){const s=new THREE.Mesh(new THREE.SphereGeometry(1,8,6),mat);levelGroup.add(s);col.puffs.push({s,ph:k/7});}WAR.smoke.push(col);}}
function updateSmoke(dt){for(const C of WAR.smoke)for(const p of C.puffs){p.ph=(p.ph+dt*.035)%1;const h=p.ph*70,sc=4+p.ph*18;p.s.position.set(C.x+p.ph*14,C.y0+4+h,C.z+p.ph*5);p.s.scale.setScalar(sc);}}
function battleBed(on){if(!actx)return;if(on&&!WAR.bed){const s=actx.createBufferSource();s.buffer=noiseBuf;s.loop=true;const f=actx.createBiquadFilter();f.type='lowpass';f.frequency.value=110;const g=actx.createGain();g.gain.value=.0;
    s.connect(f);f.connect(g);g.connect(master||actx.destination);s.start();WAR.bed={s,g};}
  if(WAR.bed){const tgt=on?.09:0;WAR.bed.g.gain.value+=(tgt-WAR.bed.g.gain.value)*.05;if(!on&&WAR.bed.g.gain.value<.002){try{WAR.bed.s.stop();}catch(err){}WAR.bed=null;}}}
function updateAmbience(dt){const on=CAMP.on&&OPEN.on;battleBed(on&&(state==='playing'||state==='scene'));if(!on)return;
  if(WAR.smokeLG!==levelGroup)buildSmoke();updateSmoke(dt);
  for(const S of WAR.sched)S.t-=dt;const due=WAR.sched.filter(S=>S.t<=0);WAR.sched=WAR.sched.filter(S=>S.t>0);for(const S of due)S.f();
  updateTracers(dt);updateFly(dt);
  WAR.trT-=dt;if(WAR.trT<=0){WAR.trT=.25+Math.random()*.55;skirmish();if(Math.random()<.25)flak();}
  WAR.boomT-=dt;if(WAR.boomT<=0){WAR.boomT=1.6+Math.random()*3.2;const P=farPt(32,75);P.x=clamp(P.x,-OPEN.R-30,OPEN.R+30);P.z=clamp(P.z,-OPEN.R-30,OPEN.R+30);P.y=Math.max(0,groundH(P.x,P.z));distBoom(P);}
  WAR.flyT-=dt;if(WAR.flyT<=0){WAR.flyT=18+Math.random()*22;flyover();if(Math.random()<.4)WAR.sched.push({t:.6,f:flyover});}
  WAR.crT-=dt;if(WAR.crT<=0&&actx){WAR.crT=.05+Math.random()*.3;const v=.006+Math.random()*.02;noiseHit(1200+Math.random()*2400,v,.04,'bandpass');}
  if(WAR.fogFlash>0&&scene.fog&&scene.fog.color){WAR.fogFlash=Math.max(0,WAR.fogFlash-dt*2.5);if(!WAR.fog0)WAR.fog0=scene.fog.color.getHex();scene.fog.color.setHex(WAR.fog0);scene.fog.color.lerp(new THREE.Color(0xffa060),WAR.fogFlash*.35);}
  else if(WAR.fog0&&scene.fog&&scene.fog.color){scene.fog.color.setHex(WAR.fog0);WAR.fog0=null;}}
function clearWar(){for(const T of WAR.tr){T.on=false;if(T.m)T.m.visible=false;}for(const F of WAR.fly)scene.remove(F.g);WAR.fly=[];for(const N of WAR.nades)scene.remove(N.m);WAR.nades=[];WAR.sched=[];WAR.sup=0;WAR.fog0=null;WAR.fogFlash=0;}
// ---------------- 挂进主循环
function updateWarfare(dt){if(state==='playing'){const s=WAR.still;if(Math.hypot(player.pos.x-s.x,player.pos.z-s.z)>2.5){s.x=player.pos.x;s.z=player.pos.z;s.t=0;}else s.t+=dt;
    rebuildSquads();moraleCheck();softSpacing(dt);WAR.tgtT-=dt;if(WAR.tgtT<=0){WAR.tgtT=.5;spreadAllyFire();}allyGrenades();updateNades(dt);updateSuppression(dt);}
  updateAmbience(dt);}
const _ucR=updateCampaign;updateCampaign=function(dt){_ucR(dt);updateWarfare(dt);};
const _usR=updateScene;updateScene=function(dt){_usR(dt);if(CAMP.on){updateAmbience(dt);if(supEl&&supEl.style)supEl.style.opacity='0';}};
const _sclR=startCampaignLevel;startCampaignLevel=function(id){clearWar();_sclR(id);};
const _xcR=exitCampaign;exitCampaign=function(){_xcR.apply(null,arguments);clearWar();battleBed(false);if(WAR.bed){try{WAR.bed.s.stop();}catch(err){}WAR.bed=null;}if(supEl&&supEl.style)supEl.style.opacity='0';};
const _cendR=campEnd;campEnd=function(win){_cendR(win);if(WAR.bed){try{WAR.bed.s.stop();}catch(err){}WAR.bed=null;}if(supEl&&supEl.style)supEl.style.opacity='0';};
// 暂停 / 回战舰时让背景战场声淡出
const _frR=frame;frame=function(t){_frR(t);if(WAR.bed&&!(CAMP.on&&(state==='playing'||state==='scene')))battleBed(false);};
