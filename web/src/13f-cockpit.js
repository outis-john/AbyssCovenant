// ============================================================ 机甲驾驶舱视角：两侧是自己的巨臂武器，屏幕边缘是舱框；走路有沉重的踏步震动
var CK=null;
function buildCockpit(){const mk=(w,h,d,m,x,y,z,par)=>{const b=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);b.position.set(x,y,z);par.add(b);return b;};
  const armor=new THREE.MeshLambertMaterial({map:texMetal,color:0x9a9488}),dark=new THREE.MeshLambertMaterial({color:0x2e2e34}),trim=new THREE.MeshLambertMaterial({color:0x8a6a2a});
  const glowB=new THREE.MeshBasicMaterial({color:0x60c8ff}),glowO=new THREE.MeshBasicMaterial({color:0xffa040});
  // 右臂武器：外壳固定，枪管按主武器换
  const gun=new THREE.Group();view.add(gun);gun.visible=false;const gi=new THREE.Group();gi.position.set(.34,-.22,-.42);gi.scale.setScalar(1.05);gun.add(gi);
  mk(.36,.34,.7,armor,0,0,.15,gi);mk(.38,.05,.72,trim,0,.18,.15,gi);mk(.3,.3,.3,dark,0,-.05,.55,gi);
  const barrels={};
  {const g=new THREE.Group();g.position.set(0,0,-.45);gi.add(g);for(let i=0;i<6;i++){const a=i/6*Math.PI*2;mk(.05,.05,.7,dark,Math.cos(a)*.08,Math.sin(a)*.08,0,g);}mk(.22,.22,.05,trim,0,0,-.2,g);barrels.spin=g;}
  {const g=new THREE.Group();g.position.set(0,0,-.45);gi.add(g);const c=new THREE.Mesh(new THREE.CylinderGeometry(.11,.13,.75,8),dark);c.rotation.x=Math.PI/2;g.add(c);
   for(let i=0;i<3;i++){const r=new THREE.Mesh(new THREE.TorusGeometry(.15,.025,4,10),glowB);r.position.z=.15-i*.2;g.add(r);}barrels.cannon=g;}
  {const g=new THREE.Group();g.position.set(0,0,-.4);gi.add(g);const c=new THREE.Mesh(new THREE.CylinderGeometry(.06,.09,.6,8),dark);c.rotation.x=Math.PI/2;g.add(c);
   mk(.05,.06,.05,glowO,0,-.08,-.3,g);barrels.flame=g;}
  const flash=mk(.3,.3,.05,new THREE.MeshBasicMaterial({color:0xffd080}),0,0,-.86,gi);flash.visible=false;
  RANGED_MODELS.push(gun);
  // 巨拳（近战）：当作 sword 使用，套用拳的动作
  const fist=new THREE.Group();view.add(fist);fist.visible=false;const fi=new THREE.Group();fi.scale.setScalar(1.1);fi.position.set(.12,-.12,-.2);fist.add(fi);
  mk(.36,.36,.5,armor,0,0,-.1,fi);mk(.38,.05,.52,trim,0,.19,-.1,fi);for(let i=0;i<3;i++){const r=new THREE.Mesh(new THREE.TorusGeometry(.2,.025,4,10),glowB);r.position.z=-.05-i*.1;fi.add(r);}
  for(let i=0;i<4;i++)mk(.08,.1,.2,armor,-.13+i*.087,.06,-.45,fi);mk(.1,.1,.18,armor,.2,-.04,-.35,fi);
  MELEE_GROUP.ckfist=fist;
  CK={gun,flash,barrels,fist};}
function isMech(){return !!(CLS[cls]&&CLS[cls].eye);}
// 在 applyLoadout 之后调用：机甲换成驾驶舱武器模型
function cockpitApply(){if(!CK||!WEAPONS[0])return;const mech=isMech();document.body.classList.toggle('cockpit',mech);document.body.dataset.mech=mech?cls:'';
  if(!mech)return;const P=WEAPONS[0];P.model=CK.gun;P.flash=CK.flash;
  CK.barrels.spin.visible=!!P.spin;CK.barrels.flame.visible=!!P.flame;CK.barrels.cannon.visible=!P.spin&&!P.flame;sword=CK.fist;}
function updateCockpit(dt){if(!CK||!isMech())return;CK.barrels.spin.rotation.z+=dt*(player.spin||0)*40;
  const moving=keys.KeyW||keys.KeyA||keys.KeyS||keys.KeyD;player.stepT=(player.stepT||0)-dt;
  if(moving&&player.stepT<=0&&state==='playing'){player.stepT=0.62;player.shake=Math.max(player.shake,0.16);play('growl');if(actx)tone('sine',55,28,0.5,0.25);}}
buildCockpit();
