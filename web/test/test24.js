;(async()=>{let now=1e7;const step=n=>{for(let i=0;i<n;i++){now+=16;frame(now);}};const log=console.log;globalThis.setTimeout=(f)=>0;
// 开放地图：在一栋废墟的另一边放敌人，看它能不能绕过去找到玩家
cls='ward';startCampaignLevel('3-1');endScene(true);for(const e of enemies){e.alive=false;scene.remove(e.g);}CAMP.S=null;for(const a of allies){a.alive=false;scene.remove(a.root);}
player.hp=player.maxHp=99999;log('nav grid',NAV.ok,NAV.w+'x'+NAV.h);
// 找一条被墙挡住的直线：随便挑点对，直到直线不可走但有路径
let A=null,B=null;for(let k=0;k<400&&!A;k++){const a=new THREE.Vector3((Math.random()-.5)*110,0,(Math.random()-.5)*110),b=a.clone().add(new THREE.Vector3((Math.random()-.5)*30,0,(Math.random()-.5)*30));
  if(navFree(navI(a.x),navJ(a.z),1)&&navFree(navI(b.x),navJ(b.z),1)&&!navLine(a.x,a.z,b.x,b.z,1)&&a.distanceTo(b)>14&&navPath(a.x,a.z,b.x,b.z,1)){A=a;B=b;}}
log('found blocked pair',!!A);
let reached=0,tries=0;for(let t=0;t<5;t++){let a=null,b=null;for(let k=0;k<400&&!a;k++){const p=new THREE.Vector3((Math.random()-.5)*110,0,(Math.random()-.5)*110),q=p.clone().add(new THREE.Vector3((Math.random()-.5)*30,0,(Math.random()-.5)*30));
    if(navFree(navI(p.x),navJ(p.z),1)&&navFree(navI(q.x),navJ(q.z),1)&&!navLine(p.x,p.z,q.x,q.z,1)&&p.distanceTo(q)>14&&navPath(p.x,p.z,q.x,q.z,1)){a=p;b=q;}}
  if(!a)continue;tries++;player.pos.copy(b);const e=spawnEnemy('we',a.x,a.z);e.leapCd=999;e.cd=999;let best=1e9;for(let i=0;i<900;i++){step(1);best=Math.min(best,e.g.position.distanceTo(player.pos));if(best<3)break;}if(best<3)reached++;e.alive=false;scene.remove(e.g);}
log('enemies reached player around walls',reached,'/',tries);
// 坦克也能绕
{let a=null,b=null;for(let k=0;k<600&&!a;k++){const p=new THREE.Vector3((Math.random()-.5)*100,0,(Math.random()-.5)*100),q=p.clone().add(new THREE.Vector3((Math.random()-.5)*40,0,(Math.random()-.5)*40));
  if(navFree(navI(p.x),navJ(p.z),2)&&navFree(navI(q.x),navJ(q.z),2)&&!navLine(p.x,p.z,q.x,q.z,2)&&p.distanceTo(q)>30&&navPath(p.x,p.z,q.x,q.z,2)){a=p;b=q;}}
 if(a){player.pos.copy(b);const t=spawnEnemy('tpred',a.x,a.z);t.shellCd=999;t.lasCd=999;const d0=t.g.position.distanceTo(player.pos);step(1500);log('tank closed distance',d0.toFixed(0),'->',t.g.position.distanceTo(player.pos).toFixed(0));}}
log('DONE');})();
