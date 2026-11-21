// ============================================================ 导航网格 + A* 寻路（敌人、队友、坦克共用）
// 地图建好后把所有碰撞盒栅格化（1.5 米一格），再算“离障碍物有几格”的净空图；步兵要求净空 ≥1，坦克 ≥2。
// 新增的碰撞盒（空降舱、残骸、地标）会增量标记，净空图每 0.5 秒最多重算一次。
const NAV={ok:false,cs:1.5,x0:0,z0:0,w:0,h:0,blk:null,clr:null,nCol:0,dirty:false,t:0,budget:0};
function navBuild(){let x0,z0,x1,z1;if(OPEN.on){x0=z0=-OPEN.R-3;x1=z1=OPEN.R+3;}else{x0=z0=-HALF-1;x1=z1=(G-1)*C+HALF+1;}
  const cs=NAV.cs;Object.assign(NAV,{x0,z0,w:Math.ceil((x1-x0)/cs),h:Math.ceil((z1-z0)/cs),nCol:0,dirty:true,t:0,ok:true});NAV.blk=new Uint8Array(NAV.w*NAV.h);NAV.clr=new Uint8Array(NAV.w*NAV.h);navMark();navClearance();}
function navMark(){const {cs,x0,z0,w,h}=NAV;for(let k=NAV.nCol;k<colliders.length;k++){const b=colliders[k];const i0=Math.max(0,Math.floor((b.minX-.3-x0)/cs)),i1=Math.min(w-1,Math.floor((b.maxX+.3-x0)/cs)),j0=Math.max(0,Math.floor((b.minZ-.3-z0)/cs)),j1=Math.min(h-1,Math.floor((b.maxZ+.3-z0)/cs));
    for(let j=j0;j<=j1;j++)for(let i=i0;i<=i1;i++)NAV.blk[j*w+i]=1;}NAV.nCol=colliders.length;}
function navClearance(){const {w,h,blk,clr}=NAV;const q=new Int32Array(w*h);let qh=0,qt=0;
  for(let j=0;j<h;j++)for(let i=0;i<w;i++){const k=j*w+i;if(blk[k]||i===0||j===0||i===w-1||j===h-1){clr[k]=0;q[qt++]=k;}else clr[k]=255;}
  while(qh<qt){const k=q[qh++],i=k%w,j=(k/w)|0,c=clr[k]+1;if(c>4)continue;for(const [a,b] of [[1,0],[-1,0],[0,1],[0,-1]]){const ni=i+a,nj=j+b;if(ni<0||nj<0||ni>=w||nj>=h)continue;const n=nj*w+ni;if(clr[n]>c){clr[n]=c;q[qt++]=n;}}}NAV.dirty=false;}
function navUpdate(dt){if(!NAV.ok)return;if(colliders.length<NAV.nCol){navBuild();return;}if(colliders.length>NAV.nCol){navMark();NAV.dirty=true;}NAV.t-=dt;if(NAV.dirty&&NAV.t<=0){navClearance();NAV.t=.5;}NAV.budget=5;}
const navI=x=>Math.floor((x-NAV.x0)/NAV.cs),navJ=z=>Math.floor((z-NAV.z0)/NAV.cs);
function navFree(i,j,need){return i>=0&&j>=0&&i<NAV.w&&j<NAV.h&&NAV.clr[j*NAV.w+i]>=need;}
// 直线能不能走（按半格采样）
function navLine(ax,az,bx,bz,need){const L=Math.hypot(bx-ax,bz-az),n=Math.max(1,Math.ceil(L/(NAV.cs*.5)));for(let s=1;s<=n;s++){const t=s/n;if(!navFree(navI(ax+(bx-ax)*t),navJ(az+(bz-az)*t),need))return false;}return true;}
function navSnap(i,j,need){if(navFree(i,j,need))return [i,j];for(let r=1;r<7;r++)for(let a=-r;a<=r;a++)for(const [x,y] of [[i+a,j-r],[i+a,j+r],[i-r,j+a],[i+r,j+a]])if(navFree(x,y,need))return [x,y];return null;}
// A*（8 方向，八方向距离启发；最多展开 6000 个格子）
function navPath(ax,az,bx,bz,need){const w=NAV.w;const s=navSnap(navI(ax),navJ(az),need),g=navSnap(navI(bx),navJ(bz),need);if(!s||!g)return null;
  const S=s[1]*w+s[0],Gk=g[1]*w+g[0];if(S===Gk)return [new THREE.Vector3(bx,0,bz)];
  const gs=new Map([[S,0]]),from=new Map(),open=[[0,S]],closed=new Set();const hh=k=>{const dx=Math.abs(k%w-g[0]),dz=Math.abs(((k/w)|0)-g[1]);return Math.max(dx,dz)+.414*Math.min(dx,dz);};
  const push=(f,k)=>{open.push([f,k]);let c=open.length-1;while(c>0){const p=(c-1)>>1;if(open[p][0]<=open[c][0])break;[open[p],open[c]]=[open[c],open[p]];c=p;}};
  const pop=()=>{const top=open[0],last=open.pop();if(open.length){open[0]=last;let c=0;for(;;){const l=c*2+1,r=l+1;let m=c;if(l<open.length&&open[l][0]<open[m][0])m=l;if(r<open.length&&open[r][0]<open[m][0])m=r;if(m===c)break;[open[m],open[c]]=[open[c],open[m]];c=m;}}return top;};
  let n=0;while(open.length&&n++<6000){const [,k]=pop();if(k===Gk)break;if(closed.has(k))continue;closed.add(k);const i=k%w,j=(k/w)|0,gk=gs.get(k);
    for(const [a,b,c] of [[1,0,1],[-1,0,1],[0,1,1],[0,-1,1],[1,1,1.414],[1,-1,1.414],[-1,1,1.414],[-1,-1,1.414]]){const ni=i+a,nj=j+b;if(!navFree(ni,nj,need))continue;if(a&&b&&(!navFree(i+a,j,need)||!navFree(i,j+b,need)))continue;
      const nk=nj*w+ni,ng=gk+c+(NAV.clr[nk]<need+1?.6:0);if(ng<(gs.get(nk)??1e9)){gs.set(nk,ng);from.set(nk,k);push(ng+hh(nk),nk);}}}
  if(!from.has(Gk))return null;const pts=[];let k=Gk;while(k!==S){pts.push(new THREE.Vector3(NAV.x0+(k%w+.5)*NAV.cs,0,NAV.z0+(((k/w)|0)+.5)*NAV.cs));k=from.get(k);}pts.reverse();pts[pts.length-1]=new THREE.Vector3(bx,0,bz);return pts;}
// 给一个单位（敌人/队友/坦克）返回下一个要走向的点；能直线走就直走，否则沿缓存的路径走，并尽量跳过可以直达的拐点
function navWaypoint(o,pos,goal,need=1){if(!NAV.ok)return null;
  if(navLine(pos.x,pos.z,goal.x,goal.z,need)){o.nav=null;return {p:goal,direct:true};}
  let N=o.nav;const age=N?gameTime-N.at:99;
  if((!N||age>2.5||(age>.7&&Math.hypot(N.gx-goal.x,N.gz-goal.z)>3)||(o.stuckNav>1.2))&&NAV.budget>0){NAV.budget--;o.stuckNav=0;const path=navPath(pos.x,pos.z,goal.x,goal.z,need);N=o.nav=path?{path,i:0,at:gameTime,gx:goal.x,gz:goal.z,chk:0}:{path:null,at:gameTime,gx:goal.x,gz:goal.z};}
  if(!N||!N.path)return null;const P=N.path;
  while(N.i<P.length-1&&Math.hypot(P[N.i].x-pos.x,P[N.i].z-pos.z)<1.1)N.i++;
  if(gameTime-N.chk>.25){N.chk=gameTime;for(let k=Math.min(N.i+4,P.length-1);k>N.i;k--)if(navLine(pos.x,pos.z,P[k].x,P[k].z,need)){N.i=k;break;}}
  return {p:P[N.i],direct:false};}
