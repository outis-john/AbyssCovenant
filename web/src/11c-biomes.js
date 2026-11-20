// ============================================================ 地图主题：炼油厂 / 哥特教堂 / 蓝冰洞（贴图 + 结构道具）
const noisyT=(g,s,c,v)=>noisy(g,s,c,v);
const BTEX={
  hive:{
    wall:pixelTex((g,s)=>{noisyT(g,s,[122,114,102],14);g.fillStyle='#2a2624';g.fillRect(0,0,s,1);g.fillRect(0,s/2,s,1);g.fillRect(0,0,1,s);g.fillRect(s/2,0,1,s);
      g.fillStyle='#b0a898';for(const [x,y] of [[2,2],[s/2-3,2],[s/2+2,2],[s-3,2],[2,s/2+2],[s-3,s/2+2],[s/2-3,s-3],[s/2+2,s-3]])g.fillRect(x,y,1,1);
      g.fillStyle='rgba(120,60,20,.55)';for(let i=0;i<4;i++){const x=Math.random()*s|0;g.fillRect(x,0,1,4+Math.random()*s|0);}},32),
    floor:pixelTex((g,s)=>{noisyT(g,s,[40,38,36],8);g.fillStyle='#6a645c';for(let i=0;i<s;i+=4){g.fillRect(i,0,1,s);g.fillRect(0,i,s,1);}},16),
    ceil:pixelTex((g,s)=>{noisyT(g,s,[24,22,22],8);g.fillStyle='#3a342e';g.fillRect(0,6,s,3);},16)},
  sanctum:{
    wall:pixelTex((g,s)=>{noisyT(g,s,[158,152,142],16);g.fillStyle='#4a4640';for(let r=0;r<4;r++){g.fillRect(0,r*8,s,1);const o=r%2?0:8;for(let x=o;x<s;x+=16)g.fillRect(x,r*8,1,8);}},32),
    floor:pixelTex((g,s)=>{for(let x=0;x<2;x++)for(let y=0;y<2;y++){const w=(x+y)%2;for(let i=0;i<8;i++)for(let j=0;j<8;j++){const k=(Math.random()-.5)*18;const b=w?210:40;g.fillStyle=`rgb(${b+k},${b+k-4},${b+k-8})`;g.fillRect(x*8+i,y*8+j,1,1);}}
      g.fillStyle='rgba(120,110,100,.5)';g.fillRect(3,0,1,5);},16),
    ceil:pixelTex((g,s)=>{noisyT(g,s,[42,40,48],8);g.fillStyle='#6a6470';g.fillRect(0,0,s,1);g.fillRect(0,0,1,s);},16)},
  frost:{
    wall:pixelTex((g,s)=>{noisyT(g,s,[120,176,220],26);g.fillStyle='rgba(225,245,255,.8)';for(let i=0;i<5;i++){let x=Math.random()*s,y=Math.random()*s;for(let k=0;k<10;k++){g.fillRect(x|0,y|0,1,1);x+=Math.random()*2-.5;y+=Math.random()*2-1;}}
      g.fillStyle='rgba(30,70,120,.35)';for(let i=0;i<4;i++)g.fillRect(Math.random()*s|0,Math.random()*s|0,4,3);},32),
    floor:pixelTex((g,s)=>{noisyT(g,s,[196,222,240],10);g.fillStyle='rgba(140,180,210,.6)';for(let i=0;i<6;i++)g.fillRect(Math.random()*s|0,Math.random()*s|0,3,1);},16),
    ceil:pixelTex((g,s)=>{noisyT(g,s,[50,90,130],18);},16)}};
const hazardTex=pixelTex((g,s)=>{for(let x=0;x<s;x++)for(let y=0;y<s;y++){g.fillStyle=((x+y)>>2)%2?'#d8a020':'#1a1612';g.fillRect(x,y,1,1);}},16);
const BM={steel:new THREE.MeshLambertMaterial({map:texMetal,color:0xb0aca0}),rust:new THREE.MeshLambertMaterial({color:0x9a5a2a}),pipe:new THREE.MeshLambertMaterial({color:0x7a8a78,emissive:0x0a0c0a}),
  tank:new THREE.MeshLambertMaterial({map:texMetal,color:0xc8c0a0}),rail:new THREE.MeshLambertMaterial({color:0xd8a020,emissive:0x201400}),
  red:new THREE.MeshLambertMaterial({color:0xd03020,emissive:0x200400}),sodium:new THREE.MeshBasicMaterial({color:0xffb050}),hazard:new THREE.MeshLambertMaterial({map:hazardTex}),
  stone:new THREE.MeshLambertMaterial({map:BTEX.sanctum.wall,color:0xd0c8bc}),gold:new THREE.MeshLambertMaterial({color:0xc8a040,emissive:0x302000}),banner:new THREE.MeshLambertMaterial({color:0x7a1612,side:2}),
  glass:[0xc02020,0x2040c0,0xd0a020,0x208040].map(c=>new THREE.MeshBasicMaterial({color:c})),beam:new THREE.MeshBasicMaterial({color:0xffe0a0,transparent:true,opacity:.07,depthWrite:false}),
  flame:new THREE.MeshBasicMaterial({color:0xffc060}),ice:new THREE.MeshLambertMaterial({color:0xa8d8ff,emissive:0x16304a}),iceDeep:new THREE.MeshLambertMaterial({color:0x4a8ac8,emissive:0x0a2040}),
  glow:new THREE.MeshBasicMaterial({color:0x60e0ff}),snow:new THREE.MeshLambertMaterial({color:0xe8f4ff})};
const G_={box:new THREE.BoxGeometry(1,1,1),cyl:new THREE.CylinderGeometry(1,1,1,10),cone:new THREE.ConeGeometry(1,1,6),tor:new THREE.TorusGeometry(1,.18,5,12)};
for(const k in G_){G_[k].userData=G_[k].userData||{};G_[k].userData.shared=true;}
function P(geo,mat,x,y,z,sx,sy,sz,rx=0,ry=0,rz=0){const m=new THREE.Mesh(geo,mat);m.position.set(x,y,z);m.scale.set(sx,sy,sz);m.rotation.set(rx,ry,rz);levelGroup.add(m);return m;}
function solid(x,z,hx,hz){colliders.push({minX:x-hx,maxX:x+hx,minZ:z-hz,maxZ:z+hz});}
// 每个房间的四面墙：面的位置、朝向、中间有没有门
function wallSides(i,j){const cx=i*C,cz=j*C,F=HALF-.5;return [
  {ax:'z',x:cx+F,z:cz,n:[-1,0],door:i<G-1&&connected(i,j,i+1,j)},{ax:'z',x:cx-F,z:cz,n:[1,0],door:i>0&&connected(i-1,j,i,j)},
  {ax:'x',x:cx,z:cz+F,n:[0,-1],door:j<G-1&&connected(i,j,i,j+1)},{ax:'x',x:cx,z:cz-F,n:[0,1],door:j>0&&connected(i,j-1,i,j)}];}
// 沿墙的位置 t∈[-1,1]，避开门洞
const along=(w,t,off=0)=>w.ax==='z'?[w.x+w.n[0]*off,w.z+t*(HALF-1)]:[w.x+t*(HALF-1),w.z+w.n[1]*off];
const inDoor=(w,t)=>w.door&&Math.abs(t*(HALF-1))<2.6;
const wallRot=w=>w.ax==='z'?Math.PI/2:0;
let steamVents=[];
function biomeProps(){const B=curBiome;steamVents=[];const tx=BTEX[B];
  matBrick.map=tx.wall;matBrick.needsUpdate=true;
  levelGroup.traverse(o=>{if(!o.isMesh||!o.material)return;if(o.material.map===texFloor||Object.values(BTEX).some(t=>t.floor===o.material.map)){o.material.map=tx.floor;o.material.needsUpdate=true;}
    else if(o.material.map===texCeil||Object.values(BTEX).some(t=>t.ceil===o.material.map)){o.material.map=tx.ceil;o.material.needsUpdate=true;}});
  for(let i=0;i<G;i++)for(let j=0;j<G;j++){const cx=i*C,cz=j*C;const sides=wallSides(i,j);
    if(B==='hive')refinery(i,j,cx,cz,sides);else if(B==='sanctum')cathedral(i,j,cx,cz,sides);else iceCave(i,j,cx,cz,sides);}}
// ---------- 炼油厂：储油罐、管道、阀门、检修走道、钠灯、蒸汽、警示条纹
function refinery(i,j,cx,cz,sides){
  for(const w of sides){const r=wallRot(w);const nx=w.n[0],nz=w.n[1];
    for(const [h,rad] of [[4.7,.22],[5.3,.16],[6.1,.28]])if(rng()<.75){const [x,z]=along(w,0,.35+rad);P(G_.cyl,BM.pipe,x,h,z,rad,C-1,rad,w.ax==='x'?0:Math.PI/2,0,w.ax==='x'?Math.PI/2:0);
      if(rng()<.5){const t=rng()*1.6-.8;const [vx,vz]=along(w,t,.35+rad*2+.05);P(G_.tor,BM.red,vx,h,vz,.28,.28,.28,0,r);}}
    for(const t of [-.75,.75])if(rng()<.5&&!inDoor(w,t)){const [x,z]=along(w,t,.3);P(G_.cyl,BM.pipe,x,2.3,z,.14,4.6,.14);P(G_.box,BM.steel,x,1.2,z,.4,.3,.4);}
    if(rng()<.6){const t=rng()<.5?-.55:.55;const [x,z]=along(w,t,.12);P(G_.box,BM.sodium,x,3.6,z,w.ax==='z'?.2:1,.35,w.ax==='z'?1:.2);P(G_.box,BM.steel,x,3.85,z,w.ax==='z'?.3:.9,.1,w.ax==='z'?.9:.3);candles.push(new THREE.Vector3(x+nx*1.2,3.4,z+nz*1.2));}
    if(w.door){const [x,z]=along(w,0,1.2);P(new THREE.PlaneGeometry(4,1.2),BM.hazard,x,.03,z,1,1,1,-Math.PI/2,0,w.ax==='z'?Math.PI/2:0);}}
  if(i+j===0)return;
  if(rng()<.6){const w=sides[Math.floor(rng()*4)];const t=rng()<.5?-.6:.6;if(!inDoor(w,t)){const [x,z]=along(w,t,1.8);
    P(G_.cyl,BM.tank,x,3,z,1.4,6,1.4);P(G_.cyl,BM.rust,x,6.05,z,1.45,.12,1.45);for(const y of [1.2,4.8])P(G_.cyl,BM.pipe,x,y,z,1.46,.1,1.46);P(G_.cyl,BM.hazard,x,3,z,1.42,.5,1.42);
    P(G_.box,BM.hazard,x,.6,z,2.9,.25,2.9);solid(x,z,1.45,1.45);}}
  if(rng()<.45){const w=sides[Math.floor(rng()*4)];const [x,z]=along(w,0,1.1);const L=C-2;   // 检修走道
    P(G_.box,BM.steel,x,3.3,z,w.ax==='z'?1.6:L,.12,w.ax==='z'?L:1.6);const [rx,rz]=along(w,0,1.85);P(G_.box,BM.rail,rx,4.1,rz,w.ax==='z'?.07:L,.07,w.ax==='z'?L:.07);
    for(let t=-.9;t<=.91;t+=.3){const [px,pz]=along(w,t,1.85);P(G_.box,BM.rail,px,3.7,pz,.06,.8,.06);const [sx,sz]=along(w,t,1.1);P(G_.box,BM.pipe,sx,1.6,sz,.08,3.2,.08);}}
  if(rng()<.55){const x=cx+(rng()-.5)*8,z=cz+(rng()-.5)*8;P(G_.box,BM.steel,x,.06,z,1.1,.12,1.1);steamVents.push({x,z,t:rng()*3});}}
// ---------- 哥特教堂：尖拱彩窗 + 光柱、壁柱、拱顶肋、吊灯、挂旗、祭坛
function cathedral(i,j,cx,cz,sides){
  for(const w of sides){const r=wallRot(w);const nx=w.n[0],nz=w.n[1];
    for(const t of [-1,-.5,0,.5,1]){if(inDoor(w,t))continue;const [x,z]=along(w,t,.25);P(G_.box,BM.stone,x,H/2,z,w.ax==='z'?.5:.8,H,w.ax==='z'?.8:.5);P(G_.box,BM.stone,x,.35,z,w.ax==='z'?.8:1.1,.7,w.ax==='z'?1.1:.8);
      P(G_.box,BM.gold,x,H-.9,z,w.ax==='z'?.6:1,.25,w.ax==='z'?1:.6);}
    for(const t of [-.75,.75]){if(inDoor(w,t))continue;const [x,z]=along(w,t,.06);
      P(G_.box,matDark,x,4,z,w.ax==='z'?.1:2,3.4,w.ax==='z'?2:.1);
      for(let a=0;a<2;a++)for(let b=0;b<3;b++){const [gx,gz]=along(w,t+(a-.5)*.09,.12);P(G_.box,BM.glass[(a+b+i+j)%4],gx,3.0+b*.95,gz,w.ax==='z'?.04:.8,.85,w.ax==='z'?.8:.04);}
      for(const s of [-1,1]){const [ax,az]=along(w,t+s*.045,.1);P(G_.box,matDark,ax,6.0,az,w.ax==='z'?.12:1.25,.18,w.ax==='z'?1.25:.12,w.ax==='x'?0:s*.9,0,w.ax==='x'?-s*.9:0);}
      const [bx,bz]=along(w,t,2.6);P(G_.box,BM.beam,bx,2.2,bz,w.ax==='z'?4.5:1.8,6,w.ax==='z'?1.8:4.5,w.ax==='x'?-nz*.55:0,0,w.ax==='z'?nx*.55:0);}
    if(rng()<.5&&!w.door){const [x,z]=along(w,0,.15);P(new THREE.PlaneGeometry(1.4,3.4),BM.banner,x,3.6,z,1,1,1,0,r+(nx<0||nz<0?Math.PI:0));P(G_.box,BM.gold,x,5.35,z,w.ax==='z'?.1:1.7,.1,w.ax==='z'?1.7:.1);}}
  for(const d of [1,-1])P(G_.box,BM.stone,cx,H-.15,cz,C*1.4*0.7,.25,.35,0,d*Math.PI/4);   // 拱顶交叉肋
  P(G_.box,BM.stone,cx,H-.12,cz,C-1,.2,.3);P(G_.box,BM.stone,cx,H-.12,cz,.3,.2,C-1);
  if(rng()<.6&&i+j>0){P(G_.box,BM.pipe,cx,6.2,cz,.03,1.6,.03);P(G_.tor,BM.gold,cx,5.4,cz,1.1,1.1,1.1,Math.PI/2);for(let k=0;k<8;k++){const a=k/8*6.28;P(G_.box,BM.flame,cx+Math.cos(a)*1.1,5.62,cz+Math.sin(a)*1.1,.07,.14,.07);}
    candles.push(new THREE.Vector3(cx,5.2,cz));}
  if(i+j>0)for(let r=0;r<3;r++)if(rng()<.65){const z=cz-4+r*3.2;for(const s of [-1,1]){P(G_.box,matDark,cx+s*2.8,.45,z,3.4,.12,.7);P(G_.box,matDark,cx+s*2.8,.9,z+.3,3.4,.8,.1);solid(cx+s*2.8,z,1.7,.38);}}
  if(rng()<.35&&i+j>0){const w=sides.find(s=>!s.door)||sides[0];const [x,z]=along(w,0,1.8);P(G_.box,BM.stone,x,.25,z,3.4,.5,3.4);P(G_.box,BM.stone,x,.95,z,2.2,.9,1.2,0,wallRot(w));
    P(G_.box,BM.gold,x,2.4,z,w.ax==='z'?.1:1.6,2.2,w.ax==='z'?1.6:.1);for(const s of [-.7,.7]){const [cx2,cz2]=along(w,s*.1,1.8);P(G_.box,BM.flame,cx2,1.55,cz2,.08,.3,.08);}candles.push(new THREE.Vector3(x,1.6,z));solid(x,z,1.7,1.7);}}
// ---------- 蓝冰洞：沿墙不规则冰块、冰锥、发光冰晶、积雪
function iceCave(i,j,cx,cz,sides){
  for(const w of sides){for(let k=0;k<7;k++){const t=-1+k/3+(rng()-.5)*.2;if(inDoor(w,t))continue;const s=1+rng()*1.8,h=1.5+rng()*4.5,off=rng()*.7;const [x,z]=along(w,t,off);
      P(G_.box,rng()<.3?BM.iceDeep:BM.ice,x,h/2-.2,z,s,h,s,(rng()-.5)*.5,rng()*3,(rng()-.5)*.5);if(off+s*.5>.6)solid(...along(w,t,off*.5),s*.35,s*.35);}
    if(rng()<.6){const t=(rng()-.5)*1.6;if(!inDoor(w,t)){const [x,z]=along(w,t,1.2);P(G_.box,BM.snow,x,.15,z,2.4,.3,1.6,0,rng()*3);}}
    if(rng()<.55){const t=(rng()<.5?-1:1)*(.4+rng()*.4);if(!inDoor(w,t)){const [x,z]=along(w,t,.9);for(let c=0;c<4;c++)P(G_.cone,BM.glow,x+(rng()-.5)*.8,.4+rng()*.3,z+(rng()-.5)*.8,.12+rng()*.1,.8+rng()*.9,.12+rng()*.1,(rng()-.5)*.6,0,(rng()-.5)*.6);
      candles.push(new THREE.Vector3(x,1,z));}}}
  for(let k=0;k<9;k++){const x=cx+(rng()-.5)*(C-2),z=cz+(rng()-.5)*(C-2),L=.8+rng()*2.6,r=.15+rng()*.35;P(G_.cone,rng()<.5?BM.ice:BM.iceDeep,x,H-L/2,z,r,L,r,Math.PI);}
  for(let k=0;k<3;k++)if(rng()<.4){const x=cx+(rng()-.5)*13,z=cz+(rng()-.5)*13,h=1+rng()*2.5;if(Math.abs(x-cx)<5.5&&Math.abs(z-cz)<5.5)continue;P(G_.cone,BM.ice,x,h/2,z,.5,h,.5);solid(x,z,.45,.45);}}
// 炼油厂的蒸汽
function biomeTick(dt){for(const v of steamVents){v.t-=dt;if(v.t<=0){v.t=0.15;if(Math.hypot(v.x-player.pos.x,v.z-player.pos.z)<26)puff(new THREE.Vector3(v.x,.3,v.z),1,0xb8b8b8,1.1);}}}
