// ============================================================ 状态
const G=5, C=20, H=7, HALF=C/2;
let state='hub', seed=0, rng=Math.random, cls='tide';
let colliders=[], wallMeshes=[], candles=[], levelGroup=null;
let enemies=[], gibs=[], bloods=[], projectiles=[], beams=[], wisps=[], interactables=[];
let conn=new Set(), podCell=[0,0], cellDist=null, distTimer=0;
const keys={};
const player={pos:new THREE.Vector3(),vy:0,yaw:0,pitch:0,hp:100,maxHp:100,stamina:100,stDelay:0,onGround:true,
  mana:100,maxMana:100,ovl:0,maxOvl:100,slots:3,ignoreChance:0,gunMul:1,dmgTaken:1,shield:0,warp:0,
  fireCd:0,meleeCd:0,recoil:0,shake:0,carried:{thruster:0,fuel:0,hull:0},loot:0,safeLoot:0,rare:false,beacons:2};
let spells=[];
let match=null;   // 撤离条件、逃生舱等
let hitstop=0, announceT=0, gameTime=0, waveTimer=0, heartT=0, interactTarget=null, channel=null;

// ============================================================ 关卡生成（种子 → 房间网格）
const key=(a,b,c,d)=>(a<c||(a===c&&b<d))?`${a},${b}|${c},${d}`:`${c},${d}|${a},${b}`;
const connected=(a,b,c,d)=>conn.has(key(a,b,c,d));
const cellOf=p=>[clamp(Math.round(p.x/C),0,G-1),clamp(Math.round(p.z/C),0,G-1)];
function addBox(x,z,sx,sz,y0,y1,mat=matBrick,collide=true){
  const geo=scaleBoxUV(new THREE.BoxGeometry(sx,y1-y0,sz),sx,y1-y0,sz);
  const m=new THREE.Mesh(geo,mat);m.position.set(x,(y0+y1)/2,z);levelGroup.add(m);wallMeshes.push(m);
  if(collide&&y0<2)colliders.push({minX:x-sx/2,maxX:x+sx/2,minZ:z-sz/2,maxZ:z+sz/2});
  return m;
}
function wallAlongZ(x,z1,z2,door){ // 固定 x 的墙
  if(!door){addBox(x,(z1+z2)/2,1,z2-z1,0,H);return;}
  const m=(z1+z2)/2;addBox(x,(z1+m-2)/2,1,(m-2)-z1,0,H);addBox(x,(m+2+z2)/2,1,z2-(m+2),0,H);addBox(x,m,1,4,4.2,H,matBrick,false);
}
function wallAlongX(z,x1,x2,door){
  if(!door){addBox((x1+x2)/2,z,x2-x1,1,0,H);return;}
  const m=(x1+x2)/2;addBox((x1+m-2)/2,z,(m-2)-x1,1,0,H);addBox((m+2+x2)/2,z,x2-(m+2),1,0,H);addBox(m,z,4,1,4.2,H,matBrick,false);
}
function buildLevel(){
  if(levelGroup)scene.remove(levelGroup);
  levelGroup=new THREE.Group();scene.add(levelGroup);
  colliders=[];wallMeshes=[];candles=[];conn=new Set();roomTypes={};
  // 随机生成树 + 几条回路
  const vis=new Set(['0,0']);const stack=[[0,0]];
  while(stack.length){const [i,j]=stack[stack.length-1];const nb=[[1,0],[-1,0],[0,1],[0,-1]].map(([a,b])=>[i+a,j+b]).filter(([a,b])=>a>=0&&b>=0&&a<G&&b<G&&!vis.has(a+','+b));
    if(!nb.length){stack.pop();continue;}const [a,b]=nb[Math.floor(rng()*nb.length)];conn.add(key(i,j,a,b));vis.add(a+','+b);stack.push([a,b]);}
  for(let k=0;k<4;k++){const i=Math.floor(rng()*(G-1)),j=Math.floor(rng()*G);if(rng()<.5)conn.add(key(i,j,i+1,j));else conn.add(key(j,i,j,i+1));}
  // 地板、天花板
  const size=G*C, mid=(G-1)*C/2;
  const fg=new THREE.PlaneGeometry(size,size);fg.attributes.uv.array.forEach((v,i,a)=>a[i]=v*size/3);
  const fl=new THREE.Mesh(fg,new THREE.MeshLambertMaterial({map:texFloor}));fl.rotation.x=-Math.PI/2;fl.position.set(mid,0,mid);levelGroup.add(fl);
  const cg=new THREE.PlaneGeometry(C,C);cg.attributes.uv.array.forEach((v,i,a)=>a[i]=v*C/3);const cm=new THREE.MeshLambertMaterial({map:texCeil});
  for(let i=0;i<G;i++)for(let j=0;j<G;j++){if(i===0&&j===0)continue;const cl=new THREE.Mesh(cg,cm);cl.rotation.x=Math.PI/2;cl.position.set(i*C,H,j*C);levelGroup.add(cl);}
  for(const [x,z,w,d] of [[-7,0,6,C],[7,0,6,C],[0,-7,8,6],[0,7,8,6]]){const cl=new THREE.Mesh(new THREE.PlaneGeometry(w,d),cm);cl.rotation.x=Math.PI/2;cl.position.set(x,H,z);levelGroup.add(cl);}
  for(let i=0;i<G;i++)for(let j=0;j<G;j++){
    const cx=i*C, cz=j*C;
    wallAlongZ(cx+HALF,cz-HALF,cz+HALF,i<G-1&&connected(i,j,i+1,j));
    if(i===0)wallAlongZ(cx-HALF,cz-HALF,cz+HALF,false);
    wallAlongX(cz+HALF,cx-HALF,cx+HALF,j<G-1&&connected(i,j,i,j+1));
    if(j===0)wallAlongX(cz-HALF,cx-HALF,cx+HALF,false);
    // 房间类型：标准（柱子）/ 掩体 / 迷宫 / 大厅 / Boss 竞技场
    const rt=roomType(i,j);roomTypes[i+','+j]=rt;if(rt!=='std')roomLayout(rt,cx,cz);
    if(rt==='std'&&rng()<0.85)for(const [sx,sz] of [[-1,-1],[1,-1],[-1,1],[1,1]]){
      const px=cx+sx*5.5,pz=cz+sz*5.5;addBox(px,pz,1.4,1.4,0,H);addBox(px,pz,2,2,0,0.6,matDark);
      if(rng()<0.6){candles.push(new THREE.Vector3(px+sx*-1.3,0.6,pz));const c=new THREE.Mesh(new THREE.BoxGeometry(.12,.35,.12),matCandle);c.position.set(px+sx*-1.3,0.18,pz);levelGroup.add(c);}
    }
    if(rng()<0.5){const b=new THREE.Mesh(new THREE.BoxGeometry(.6,.25,.4),matBone);b.position.set(cx+(rng()-.5)*12,.12,cz+(rng()-.5)*12);b.rotation.y=rng()*3;levelGroup.add(b);}
    // 墙上的圣像 / 管道
    if(rng()<0.5){const m=new THREE.Mesh(new THREE.BoxGeometry(.3,H,.3),matMetal);m.position.set(cx-HALF+0.7,H/2,cz+(rng()-.5)*14);levelGroup.add(m);}
    if(!candles.some(c=>Math.abs(c.x-cx)<HALF&&Math.abs(c.z-cz)<HALF)){candles.push(new THREE.Vector3(cx,0.6,cz));const c=new THREE.Mesh(new THREE.BoxGeometry(.5,.3,.5),matCandle);c.position.set(cx,.15,cz);levelGroup.add(c);}
  }
  // 单元格之间的距离（找最远的房间放逃生舱）
  const d=bfs(0,0);let best=[0,0],bd=-1;for(let i=0;i<G;i++)for(let j=0;j<G;j++)if(d[i][j]>bd){bd=d[i][j];best=[i,j];}
  podCell=best;
  biomeProps();applyBiome();
}
function bfs(si,sj){const d=[...Array(G)].map(()=>Array(G).fill(1e9));d[si][sj]=0;const q=[[si,sj]];
  while(q.length){const [i,j]=q.shift();for(const [a,b] of [[1,0],[-1,0],[0,1],[0,-1]]){const ni=i+a,nj=j+b;if(ni<0||nj<0||ni>=G||nj>=G||!connected(i,j,ni,nj))continue;if(d[ni][nj]>d[i][j]+1){d[ni][nj]=d[i][j]+1;q.push([ni,nj]);}}}return d;}
function collide(p,r){
  for(const b of colliders){const cx=clamp(p.x,b.minX,b.maxX),cz=clamp(p.z,b.minZ,b.maxZ);const dx=p.x-cx,dz=p.z-cz,d2=dx*dx+dz*dz;
    if(d2<r*r){if(d2>1e-8){const d=Math.sqrt(d2);p.x+=dx/d*(r-d);p.z+=dz/d*(r-d);}
      else{const l=p.x-b.minX,ri=b.maxX-p.x,t=p.z-b.minZ,bo=b.maxZ-p.z,m=Math.min(l,ri,t,bo);if(m===l)p.x=b.minX-r;else if(m===ri)p.x=b.maxX+r;else if(m===t)p.z=b.minZ-r;else p.z=b.maxZ+r;}}}
}

