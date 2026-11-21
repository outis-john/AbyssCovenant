// ============================================================ 大型开放战场（战役用）：没有天花板的外星地表——废墟城市、弹坑、倒塌尖塔、残骸、远处的城市天际线与地平线上的大战
// 物理地面仍是 y=0（可玩区 ±R 内只有极小起伏），R 外的地形抬升成山丘；废墟墙体进 colliders / wallMeshes，所以射线、掩体、绕障碍全都照常
const OPEN={on:false,next:null,R:70,fires:[],war:null,theme:null};
function oRand(a,b){return a+rng()*(b-a);}
const texAsh=pixelTex((g,s)=>{noisy(g,s,[64,56,50],26);g.fillStyle='rgba(20,14,12,.55)';for(let i=0;i<5;i++){let x=Math.floor(Math.random()*s),y=Math.floor(Math.random()*s);for(let k=0;k<7;k++){g.fillRect(x,y,1,1);x=(x+(Math.random()<.5?1:-1)+s)%s;y=(y+1)%s;}}});
function openBox(x,z,w,d,y0,y1,mat=matBrick,rotY=0,col=true){const geo=scaleBoxUV(new THREE.BoxGeometry(w,y1-y0,d),w,y1-y0,d);const m=new THREE.Mesh(geo,mat);m.position.set(x,(y0+y1)/2,z);m.rotation.y=rotY;levelGroup.add(m);
  if(col){wallMeshes.push(m);if(y0<1.8){const c=Math.abs(Math.cos(rotY)),s=Math.abs(Math.sin(rotY));const hw=(w*c+d*s)/2,hd=(w*s+d*c)/2;colliders.push({minX:x-hw,maxX:x+hw,minZ:z-hd,maxZ:z+hd});}}return m;}
// 一段残破的哥特墙：分段、高低不齐、带扶壁与尖拱窗洞
function ruinWall(x0,z0,x1,z1,h,gaps=[]){const L=Math.hypot(x1-x0,z1-z0),n=Math.max(1,Math.round(L/2.6)),ang=Math.atan2(z1-z0,x1-x0);
  for(let i=0;i<n;i++){const t0=i/n,t1=(i+1)/n,tm=(t0+t1)/2;if(gaps.some(g=>Math.abs(g-tm)<.09))continue;if(rng()<.12)continue;
    const x=x0+(x1-x0)*tm,z=z0+(z1-z0)*tm,seg=L/n,hh=h*(rng()<.35?oRand(.25,.6):oRand(.75,1));
    openBox(x,z,seg+.05,.8,0,hh,matBrick,-ang);
    if(hh>3.5&&rng()<.6){const w=openBox(x,z,1.1,.84,1.4,Math.min(hh-.6,3.4),matDark,-ang,false);w.position.y=(1.4+Math.min(hh-.6,3.4))/2;}
    if(i%2===0&&rng()<.7){const nx=-Math.sin(ang),nz=Math.cos(ang);openBox(x+nx*.7,z+nz*.7,.7,.7,0,hh*.7,matBrick,-ang);}}}
function ruinBuilding(cx,cz,w,d,h){const r=rng()*Math.PI*.5;const pts=[[-w/2,-d/2],[w/2,-d/2],[w/2,d/2],[-w/2,d/2]].map(([x,z])=>[cx+x*Math.cos(r)-z*Math.sin(r),cz+x*Math.sin(r)+z*Math.cos(r)]);
  for(let k=0;k<4;k++){const [a,b]=[pts[k],pts[(k+1)%4]];ruinWall(a[0],a[1],b[0],b[1],h,[rng()<.7?oRand(.3,.7):-1]);}
  for(let i=0;i<5;i++)rubble(cx+oRand(-w/3,w/3),cz+oRand(-d/3,d/3),oRand(.6,1.4));}
function rubble(x,z,s){for(let i=0;i<4;i++){const k=s*oRand(.3,.8);const m=new THREE.Mesh(scaleBoxUV(new THREE.BoxGeometry(k,k*.5,k*.8),k,k*.5,k*.8),rng()<.7?matBrick:matDark);m.position.set(x+oRand(-1,1)*s,k*.22,z+oRand(-1,1)*s);m.rotation.set(oRand(-.3,.3),rng()*3,oRand(-.3,.3));levelGroup.add(m);}}
function crater(x,z,r){const dec=new THREE.Mesh(new THREE.CircleGeometry(r,20),new THREE.MeshLambertMaterial({color:0x1a1512}));dec.rotation.x=-Math.PI/2;dec.position.set(x,.02,z);levelGroup.add(dec);
  const rim=new THREE.Mesh(new THREE.TorusGeometry(r,r*.18,4,20),new THREE.MeshLambertMaterial({map:texAsh,color:0x7a6a5a}));rim.rotation.x=Math.PI/2;rim.scale.z=.35;rim.position.set(x,.05,z);levelGroup.add(rim);}
function fallenSpire(x,z,len,ang){const g=new THREE.Group();g.position.set(x,1.1,z);g.rotation.y=ang;levelGroup.add(g);const body=new THREE.Mesh(new THREE.CylinderGeometry(1.1,1.4,len,8),matBrick);body.rotation.z=Math.PI/2;body.rotation.x=.08;g.add(body);
  const tip=new THREE.Mesh(new THREE.ConeGeometry(1.1,4,8),matDark);tip.rotation.z=-Math.PI/2;tip.position.x=len/2+2;g.add(tip);wallMeshes.push(body);
  for(let t=-len/2;t<len/2;t+=2.4){const px=x+Math.cos(ang)*t,pz=z-Math.sin(ang)*t;colliders.push({minX:px-1.2,maxX:px+1.2,minZ:pz-1.2,maxZ:pz+1.2});}}
function statue(x,z){openBox(x,z,2.2,2.2,0,1.6,matDark);const st=new THREE.MeshLambertMaterial({color:0x8a8276});const B=(w,h,d,px,py,pz)=>{const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),st);m.position.set(x+px,py,z+pz);levelGroup.add(m);return m;};
  B(.8,1.4,.5,0,2.4,0);B(.5,.5,.5,0,3.4,0);B(.3,1.2,.3,-.6,2.6,0).rotation.z=.4;const w=B(2.6,.15,.5,0,3.9,-.2);w.rotation.z=.15;B(.12,2.2,.12,.55,3,0);}
function wreck(x,z,ang){const g=new THREE.Group();g.position.set(x,0,z);g.rotation.set(oRand(-.08,.08),ang,oRand(-.12,.12));levelGroup.add(g);const hull=new THREE.MeshLambertMaterial({map:texMetal,color:0x3a3c34}),dk=new THREE.MeshLambertMaterial({color:0x151515});
  const A=(w,h,d,px,py,pz,m=hull)=>{const b=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);b.position.set(px,py,pz);g.add(b);return b;};
  A(3.2,1.6,5.6,0,1.25,0);A(2.6,.8,3.4,0,2.4,-.3);A(.7,.7,5.8,-1.75,.6,0,dk);A(.7,.7,5.8,1.75,.6,0,dk);A(1,.4,1,0,2.95,.6,dk);A(2.8,.12,1.4,0,.95,3.05,dk).rotation.x=-.8;
  wallMeshes.push(g.children[0]);const c=Math.abs(Math.cos(ang)),s=Math.abs(Math.sin(ang));colliders.push({minX:x-(2.1*c+2.9*s),maxX:x+(2.1*c+2.9*s),minZ:z-(2.1*s+2.9*c),maxZ:z+(2.1*s+2.9*c)});
  addFire(x+oRand(-1,1),2.8,z+oRand(-1,1),1.2);}
function sandbags(x,z,len,ang){for(let i=0;i<Math.round(len/1.1);i++){const t=(i-(len/1.1-1)/2)*1.1;const px=x+Math.cos(ang)*t,pz=z-Math.sin(ang)*t;for(let k=0;k<2;k++){const m=new THREE.Mesh(new THREE.BoxGeometry(1,.38,.6),new THREE.MeshLambertMaterial({color:0x5a5040}));m.position.set(px,.2+k*.38,pz);m.rotation.y=ang+(k?.1:0);levelGroup.add(m);}}
  const c=Math.abs(Math.cos(ang)),s=Math.abs(Math.sin(ang));const hw=(len*c+.6*s)/2,hd=(len*s+.6*c)/2;colliders.push({minX:x-hw,maxX:x+hw,minZ:z-hd,maxZ:z+hd});
  const hit=new THREE.Mesh(new THREE.BoxGeometry(len,.76,.6),matDark);hit.visible=false;hit.position.set(x,.38,z);hit.rotation.y=ang;levelGroup.add(hit);wallMeshes.push(hit);}
function addFire(x,y,z,s=1){const m=new THREE.Mesh(new THREE.ConeGeometry(.35*s,1.1*s,6),new THREE.MeshBasicMaterial({color:0xff7020,transparent:true,opacity:.85}));m.position.set(x,y+.5*s,z);levelGroup.add(m);
  OPEN.fires.push({m,x,y,z,s,ph:Math.random()*6});candles.push(new THREE.Vector3(x,y+.6,z));}
// 远景：天空穹顶、城市天际线（有的正在燃烧）
function skyDome(top,hor){const geo=new THREE.SphereGeometry(420,24,14);const col=[];const p=geo.attributes.position;const a=new THREE.Color(top),b=new THREE.Color(hor);
  for(let i=0;i<p.count;i++){const k=Math.max(0,p.getY(i)/420);const c=b.clone().lerp(a,Math.pow(k,.55));col.push(c.r,c.g,c.b);}geo.setAttribute('color',new THREE.Float32BufferAttribute(col,3));
  const m=new THREE.Mesh(geo,new THREE.MeshBasicMaterial({vertexColors:true,side:THREE.BackSide,fog:false,depthWrite:false}));levelGroup.add(m);return m;}
function skyline(R0,R1,n,mat,glow){for(let i=0;i<n;i++){const a=rng()*Math.PI*2,r=oRand(R0,R1),x=Math.cos(a)*r,z=Math.sin(a)*r,h=oRand(25,85),w=oRand(8,22);
  const t=new THREE.Mesh(new THREE.BoxGeometry(w,h,w),mat);t.position.set(x,h/2-2,z);t.rotation.y=rng()*3;levelGroup.add(t);
  if(rng()<.7){const sp=new THREE.Mesh(new THREE.ConeGeometry(w*.45,h*.5,6),mat);sp.position.set(x,h-2+h*.25,z);levelGroup.add(sp);}
  if(glow&&rng()<.45){for(let k=0;k<4;k++){const wv=new THREE.Mesh(new THREE.PlaneGeometry(1.6,3),new THREE.MeshBasicMaterial({color:0xff6a20,side:THREE.DoubleSide,fog:false}));wv.position.set(x+(rng()-.5)*w*.6,oRand(6,h*.8),z);wv.lookAt(0,wv.position.y,0);wv.position.addScaledVector(new THREE.Vector3(-x,0,-z).normalize(),w*.52);levelGroup.add(wv);}}}}
// 地平线上的大战：成队的小剪影来回推进、曳光对射、炮击闪光、远处空降舱
function warLayer(){const geo=new THREE.BoxGeometry(.9,2.4,.7);const W={groups:[],tracers:[],flash:0,pods:[]};
  for(let k=0;k<8;k++){const side=k%2,a=rng()*Math.PI*2,r=oRand(95,150),n=26;const im=new THREE.InstancedMesh(geo,new THREE.MeshBasicMaterial({color:side?0x2a3a34:0x2a2228}),n);
    const base=new THREE.Vector3(Math.cos(a)*r,1.2,Math.sin(a)*r),dir=new THREE.Vector3(-Math.sin(a),0,Math.cos(a));const offs=[];for(let i=0;i<n;i++)offs.push(new THREE.Vector3(oRand(-12,12),0,oRand(-4,4)));
    levelGroup.add(im);W.groups.push({im,base,dir,offs,t:rng()*10,n,foe:k^1});}
  return W;}
function updateWarLayer(dt){const W=OPEN.war;if(!W)return;const M=new THREE.Matrix4();
  for(const g of W.groups){g.t+=dt*.15;const sh=Math.sin(g.t)*10;for(let i=0;i<g.n;i++){const o=g.offs[i];M.makeTranslation(g.base.x+g.dir.x*(o.x+sh)+o.z*g.dir.z,1.2+Math.abs(Math.sin(g.t*6+i))*.15,g.base.z+g.dir.z*(o.x+sh)-o.z*g.dir.x);g.im.setMatrixAt(i,M);}g.im.instanceMatrix.needsUpdate=true;
    if(Math.random()<dt*6){const o=W.groups[g.foe%W.groups.length];const a=g.base.clone().add(g.offs[Math.floor(Math.random()*g.n)]),b=o.base.clone().add(o.offs[Math.floor(Math.random()*o.n)]);a.y=b.y=1.6;
      const m=new THREE.Mesh(new THREE.BoxGeometry(.25,.25,3),new THREE.MeshBasicMaterial({color:Math.random()<.5?0xffa040:0xff3020,fog:false}));m.position.copy(a);m.lookAt(b);levelGroup.add(m);W.tracers.push({m,a,b,t:0,d:a.distanceTo(b)/90});}}
  for(const t of W.tracers){t.t+=dt;const k=t.t/t.d;t.m.position.lerpVectors?t.m.position.lerpVectors(t.a,t.b,Math.min(1,k)):t.m.position.copy(t.a).lerp(t.b,Math.min(1,k));if(k>=1){levelGroup.remove(t.m);t.dead=true;}}W.tracers=W.tracers.filter(t=>!t.dead);
  W.flash-=dt;if(W.flash<=0){W.flash=oRandF(1.5,4);const a=Math.random()*Math.PI*2,r=110+Math.random()*80;const p=new THREE.Vector3(Math.cos(a)*r,2,Math.sin(a)*r);
    const f=new THREE.Mesh(new THREE.SphereGeometry(6,10,8),new THREE.MeshBasicMaterial({color:0xffb060,transparent:true,opacity:.9,fog:false}));f.position.copy(p);scene.add(f);beams.push({m:f,life:.35,grow:true});
    for(let i=0;i<3;i++)puff(p.clone().add(new THREE.Vector3((Math.random()-.5)*8,4+i*4,(Math.random()-.5)*8)),2,0x2a2420,6);
    setTimeoutSafe(()=>{if(state==='playing'||state==='scene'){if(actx)noiseHit(90,.18,1.4);}},r*3);}
  if(Math.random()<dt*.25){const a=Math.random()*Math.PI*2,r=60+Math.random()*90;const P=new THREE.Vector3(Math.cos(a)*r,0,Math.sin(a)*r);const m=new THREE.Mesh(new THREE.SphereGeometry(.8,6,4),new THREE.MeshBasicMaterial({color:0xffa040,fog:false}));
    m.position.set(P.x+20,90,P.z);levelGroup.add(m);W.pods.push({m,a:m.position.clone(),b:P,t:0});}
  for(const p of W.pods){p.t+=dt;const k=Math.min(1,p.t/1.6);p.m.position.copy(p.a).lerp(p.b,k);if(Math.random()<.5)puff(p.m.position.clone(),1,0xff8030,2.5);if(k>=1){levelGroup.remove(p.m);p.dead=true;puff(p.b.clone().setY(2),6,0x3a3028,4);}}W.pods=W.pods.filter(p=>!p.dead);}
function oRandF(a,b){return a+Math.random()*(b-a);}
function setTimeoutSafe(f,ms){try{setTimeout(f,ms);}catch(e){}}
function updateOpenField(dt){if(!OPEN.on)return;for(const f of OPEN.fires){f.ph+=dt*9;f.m.scale.set(1+Math.sin(f.ph)*.12,1+Math.sin(f.ph*1.7)*.25,1+Math.cos(f.ph)*.12);if(Math.random()<dt*2.5)puff(new THREE.Vector3(f.x,f.y+1.4*f.s,f.z),1,0x2a2422,1.6*f.s);}
  updateWarLayer(dt);}
// ---------------- 生成：伊斯塔万三号 · 唱诗之城外围
function buildOpenField(theme){if(levelGroup)scene.remove(levelGroup);levelGroup=new THREE.Group();scene.add(levelGroup);
  colliders=[];wallMeshes=[];candles=[];roomTypes={};conn=new Set();OPEN.fires=[];OPEN.on=true;OPEN.theme=theme;const R=OPEN.R;
  for(let i=0;i<G;i++)for(let j=0;j<G;j++){if(i<G-1)conn.add(key(i,j,i+1,j));if(j<G-1)conn.add(key(i,j,i,j+1));}
  // 地形：可玩区几乎平整，外圈抬升成山丘
  const S=560,N=140,geo=new THREE.PlaneGeometry(S,S,N,N);geo.rotateX(-Math.PI/2);const p=geo.attributes.position,col=[];const c0=new THREE.Color(0x8a7c6c),c1=new THREE.Color(0x544a42),c2=new THREE.Color(0x9a8266);
  for(let i=0;i<p.count;i++){const x=p.getX(i),z=p.getZ(i),d=Math.max(Math.abs(x),Math.abs(z));const n=Math.sin(x*.07)*Math.cos(z*.06)+Math.sin(x*.023+z*.031)*1.6;
    let y=d<R+3?n*.03:Math.pow((d-R-3)/55,1.5)*32+n*4;p.setY(i,y);const c=c0.clone().lerp(c1,Math.min(1,Math.max(0,(n+1.5)/3))).lerp(c2,Math.min(1,Math.max(0,(y-8)/30)));col.push(c.r,c.g,c.b);}
  geo.setAttribute('color',new THREE.Float32BufferAttribute(col,3));geo.attributes.uv.array.forEach((v,i,a)=>a[i]=v*S/4);geo.computeVertexNormals();
  const ground=new THREE.Mesh(geo,new THREE.MeshLambertMaterial({map:texAsh,vertexColors:true}));levelGroup.add(ground);
  // 边界：看不见的墙 + 外圈碎石堆
  for(const [x,z,w,d] of [[0,-R-1,2*R+4,2],[0,R+1,2*R+4,2],[-R-1,0,2,2*R+4],[R+1,0,2,2*R+4]])colliders.push({minX:x-w/2,maxX:x+w/2,minZ:z-d/2,maxZ:z+d/2});
  for(let i=0;i<40;i++){const a=rng()*Math.PI*2;const r=R+oRand(1,6);rubble(Math.cos(a)*r,Math.sin(a)*r,oRand(1.2,2.6));}
  // 天空、光照、远景
  skyDome(0x1a1012,0x9a5a2c);const sun=new THREE.DirectionalLight(0xffc890,2.1);sun.position.set(-60,80,-40);levelGroup.add(sun);levelGroup.add(new THREE.AmbientLight(0x8a6a58,.9));
  skyline(150,260,38,new THREE.MeshLambertMaterial({color:0x1a1614}),true);
  // 战场布景
  OPEN.keep=[];const free=(x,z,r)=>OPEN.keep.every(k=>Math.hypot(k[0]-x,k[1]-z)>k[2]+r);
  OPEN.keep.push([0,58,12],[0,-50,18],[0,0,10]);
  for(let i=0;i<16;i++){const x=oRand(-R+12,R-12),z=oRand(-R+12,R-12),w=oRand(9,20),d=oRand(8,15);if(!free(x,z,Math.max(w,d)/2+2))continue;OPEN.keep.push([x,z,Math.max(w,d)/2]);ruinBuilding(x,z,w,d,oRand(5,10));}
  for(let i=0;i<18;i++){const x=oRand(-R+5,R-5),z=oRand(-R+5,R-5),r=oRand(2.5,6);if(free(x,z,r))crater(x,z,r);}
  for(let i=0;i<3;i++){const x=oRand(-R+15,R-15),z=oRand(-R+15,R-15);if(free(x,z,10)){OPEN.keep.push([x,z,9]);fallenSpire(x,z,oRand(12,18),rng()*Math.PI);}}
  for(let i=0;i<5;i++){const x=oRand(-R+8,R-8),z=oRand(-R+8,R-8);if(free(x,z,3)){OPEN.keep.push([x,z,3]);statue(x,z);}}
  for(let i=0;i<5;i++){const x=oRand(-R+8,R-8),z=oRand(-R+8,R-8);if(free(x,z,4)){OPEN.keep.push([x,z,4]);wreck(x,z,rng()*Math.PI);}}
  for(let i=0;i<9;i++){const x=oRand(-R+6,R-6),z=oRand(-R+6,R-6);if(free(x,z,3))sandbags(x,z,oRand(3,6),rng()*Math.PI);}
  for(let i=0;i<10;i++){const x=oRand(-R+4,R-4),z=oRand(-R+4,R-4);if(free(x,z,1))addFire(x,.1,z,oRand(.8,1.6));}
  OPEN.war=warLayer();podCell=[G-1,G-1];
  applyBiome();scene.fog.density=.0075;scene.fog.color.setHex(0x6a4228);scene.background.setHex(0x5a3420);}
// 地标：唱诗之城的 Sirenhold 大教堂（关卡脚本按需调用）
function sirenhold(cx,cz,w=26,d=20,h=13){ruinWall(cx-w/2,cz+d/2,cx-3,cz+d/2,h);ruinWall(cx+3,cz+d/2,cx+w/2,cz+d/2,h);ruinWall(cx-w/2,cz-d/2,cx+w/2,cz-d/2,h);ruinWall(cx-w/2,cz-d/2,cx-w/2,cz+d/2,h,[.5]);ruinWall(cx+w/2,cz-d/2,cx+w/2,cz+d/2,h,[.5]);
  for(const s of [-1,1]){openBox(cx+s*4.2,cz+d/2,2.4,2.4,0,h+7,matBrick);const sp=new THREE.Mesh(new THREE.ConeGeometry(1.8,7,6),matDark);sp.position.set(cx+s*4.2,h+10.5,cz+d/2);levelGroup.add(sp);}
  for(let i=0;i<4;i++){openBox(cx-6+i*4,cz-2,1,1,0,h*.8,matBrick);}const alt=openBox(cx,cz-d/2+2.5,5,2,0,1.4,matDark);
  addFire(cx-3,1.4,cz-d/2+2.5,.8);addFire(cx+3,1.4,cz-d/2+2.5,.8);}
// 地堡入口：半埋在地下的混凝土门楼
function bunkerGate(cx,cz){openBox(cx-5,cz,2,6,0,4.5,matDark);openBox(cx+5,cz,2,6,0,4.5,matDark);openBox(cx,cz-2.5,12,1,3.5,5,matDark,0,false);
  const g=new THREE.Mesh(new THREE.BoxGeometry(8,3.4,.4),new THREE.MeshBasicMaterial({color:0x0a0806}));g.position.set(cx,1.7,cz-2.8);levelGroup.add(g);
  const lt=new THREE.Mesh(new THREE.BoxGeometry(8,.2,.2),new THREE.MeshBasicMaterial({color:0xffc040}));lt.position.set(cx,3.6,cz-2.4);levelGroup.add(lt);}
// 宫殿废墟：中间一圈残墙 + 沙包防线
function palaceRing(cx,cz){const r=13;for(let k=0;k<8;k++){const a0=k/8*Math.PI*2,a1=(k+1)/8*Math.PI*2;if(k%2===1)continue;ruinWall(cx+Math.cos(a0)*r,cz+Math.sin(a0)*r,cx+Math.cos(a1)*r,cz+Math.sin(a1)*r,oRand(5,9));}
  for(let k=0;k<8;k++){const a=(k+.5)/8*Math.PI*2;sandbags(cx+Math.cos(a)*7,cz+Math.sin(a)*7,4,-a+Math.PI/2);}
  for(const [x,z] of [[-4,-4],[4,4],[-4,4],[4,-4]])openBox(cx+x,cz+z,1.4,1.4,0,6,matBrick);addFire(cx,.1,cz,1);}
