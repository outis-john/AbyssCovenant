// ============================================================ 撤离、拾取物
const COND_INFO={
  kill:{name:'Slay demons',target:25},elite:{name:'Slay an elite demon',target:1},hack:{name:'Hack the Golden Age terminal',target:1},
  ritual:{name:'Hold the ritual circle',target:1},cores:{name:'Collect power cores',target:3},
  defend:{name:'Hold the beacon for 45s',target:1},nest:{name:'Destroy demon nests',target:3},carry:{name:'Return the reliquary to the pod',target:1}};
const PART_NAME={thruster:'Thruster',fuel:'Fuel Tank',hull:'Hull Part'};
const PART_NEED={thruster:2,fuel:3,hull:1};
function addProgress(type,n){const c=match.conds.find(c=>c.type===type);if(c&&c.prog<c.target){c.prog=Math.min(c.target,c.prog+n);if(c.prog>=c.target&&c.revealed)announce('Extraction condition complete: '+COND_INFO[type].name,2.5);}}
function randomCell(exclude=[]){for(let k=0;k<50;k++){const c=[Math.floor(rng()*G),Math.floor(rng()*G)];if(!exclude.some(e=>e[0]===c[0]&&e[1]===c[1]))return c;}return [1,1];}
function cellPos(c,jit=6){return [c[0]*C+(rng()-.5)*jit*2,c[1]*C+(rng()-.5)*jit*2];}
function netDrop(type,x,z){spawnPickup(type,x,z);if(isHost())bcast({t:'drop',type,x,z});}
function spawnPickup(type,x,z,extra={}){
  const look={ammo:[0x9aa060,'ammo'],clue:[0x60ffb0,'box'],thruster:[0xff9a40,'cyl'],fuel:[0x40c0ff,'cyl'],hull:[0xc0c0c0,'box'],core:[0xffe060,'oct'],relic:[0xd8a657,'oct'],rare:[0xd040ff,'oct'],defend:[0x60c0ff,'term'],reliquary:[0xd8a657,'cyl'],terminal:[0x60ffb0,'term'],ritual:[0xb02020,'ring'],pod:[0xd8a657,'pod']}[type];
  let m;
  if(look[1]==='cyl')m=new THREE.Mesh(new THREE.CylinderGeometry(.25,.25,.6,6),new THREE.MeshLambertMaterial({color:look[0],emissive:look[0],emissiveIntensity:.4}));
  else if(look[1]==='ammo'){m=new THREE.Group();const b=new THREE.Mesh(new THREE.BoxGeometry(.55,.3,.35),new THREE.MeshLambertMaterial({color:0x4a5a2a}));m.add(b);const st=new THREE.Mesh(new THREE.BoxGeometry(.56,.06,.36),new THREE.MeshBasicMaterial({color:0xd8a657}));st.position.y=.1;m.add(st);}
  else if(look[1]==='oct')m=new THREE.Mesh(new THREE.OctahedronGeometry(.28),new THREE.MeshBasicMaterial({color:look[0]}));
  else if(look[1]==='term'){m=new THREE.Group();const b=new THREE.Mesh(new THREE.BoxGeometry(1.2,1.8,.6),matMetal);b.position.y=.9;m.add(b);const s=new THREE.Mesh(new THREE.BoxGeometry(.9,.6,.05),new THREE.MeshBasicMaterial({color:look[0]}));s.position.set(0,1.3,.31);m.add(s);}
  else if(look[1]==='ring'){m=new THREE.Mesh(new THREE.RingGeometry(2.6,3,24),new THREE.MeshBasicMaterial({color:look[0],side:THREE.DoubleSide}));m.rotation.x=-Math.PI/2;}
  else if(look[1]==='pod'){m=new THREE.Group();const b=new THREE.Mesh(new THREE.CylinderGeometry(1.2,1.6,3.2,8),matMetal);b.position.y=1.6;m.add(b);const n=new THREE.Mesh(new THREE.ConeGeometry(1.2,1.4,8),matMetal);n.position.y=3.9;m.add(n);m.userData.parts=[];}
  else m=new THREE.Mesh(new THREE.BoxGeometry(.5,.08,.35),new THREE.MeshBasicMaterial({color:look[0]}));
  m.position.set(x,look[1]==='ring'?0.03:(['term','pod'].includes(look[1])?0:0.8),z);scene.add(m);
  const it={type,m,x,z,used:false,idx:interactables.length,...extra};interactables.push(it);
  if(type==='reliquary'){m.scale.set(2.2,1.6,2.2);}
  if(type==='terminal'||type==='pod'||type==='defend'){colliders.push({minX:x-.8,maxX:x+.8,minZ:z-.8,maxZ:z+.8});}
  return it;
}
function setupMatch(){
  for(const it of interactables)scene.remove(it.m);interactables=[];
  const pool=['kill','elite','hack','ritual','cores','defend','nest','carry'];for(let i=pool.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[pool[i],pool[j]]=[pool[j],pool[i]];}
  const n=rng()<0.5?1:2;
  match={threat:pendingThreat,conds:pool.slice(0,n).map(type=>({type,prog:0,target:COND_INFO[type].target,revealed:false})),parts:{thruster:0,fuel:0,hull:0},carried:{thruster:0,fuel:0,hull:0},loot:0,safeLoot:0,rare:false,beacons:2,kills:0,elites:0,explored:new Set(['0,0']),launching:-1,hack:-1,ritual:-1};
  const used=[[0,0],podCell];
  const [px,pz]=[podCell[0]*C,podCell[1]*C];match.pod=spawnPickup('pod',px,pz+2.5);
  for(let k=0;k<n+1;k++){const c=randomCell(used);used.push(c);spawnPickup('clue',...cellPos(c));}
  for(const [t,need] of Object.entries(PART_NEED))for(let k=0;k<need;k++){const c=randomCell([[0,0]]);spawnPickup(t,...cellPos(c));}
  for(let k=0;k<6;k++)spawnPickup('relic',...cellPos(randomCell([[0,0]])));
  for(let k=0;k<7;k++)spawnPickup('ammo',...cellPos(randomCell([])));
  spawnPickup('rare',...cellPos(randomCell([[0,0],podCell])));
  const types=match.conds.map(c=>c.type);
  if(types.includes('hack')){const c=randomCell(used);used.push(c);spawnPickup('terminal',c[0]*C-3,c[1]*C);}
  if(types.includes('ritual')){const c=randomCell(used);used.push(c);spawnPickup('ritual',c[0]*C,c[1]*C);}
  missionSetup(types,used);
  if(types.includes('cores'))for(let k=0;k<3;k++)spawnPickup('core',...cellPos(randomCell([[0,0]])));
  // 初始恶魔（只有房主 / 单人生成，队友从快照里拿）
  if(!isClient())for(let i=0;i<G;i++)for(let j=0;j<G;j++){if(i+j<=1)continue;const k=1+Math.floor(rng()*2)+curThreat().extra*(Math.random()<0.6?1:0);for(let q=0;q<k;q++)spawnEnemy(i+j>=2?pickEnemy(true):'imp',...cellPos([i,j],5));}
  if(!isClient())spawnEnemy('lord',...cellPos([G-1,G-1],3));   // Boss 守在离空降点最远的房间
  if(!isClient())for(let q=0;q<2;q++)spawnEnemy('brute',...cellPos(randomCell([[0,0],[1,0],[0,1]]),4),true);
}
function nearestInteractable(){let best=null,bd=2.6;for(const it of interactables){if(it.used||it.type==='ritual'||it.type==='ammo')continue;const d=Math.hypot(it.x-player.pos.x,it.z-player.pos.z)-((it.type==='pod'||it.type==='terminal')?1.2:0);if(d<bd){bd=d;best=it;}}return best;}
function promptFor(it){
  if(!it)return'';{const mp=missionPrompt(it);if(mp)return mp;}
  if(it.type==='clue')return'[F] Read data-slate (clue)';
  if(PART_NAME[it.type])return'[F] Pick up '+PART_NAME[it.type];
  if(it.type==='core')return'[F] Pick up power core';
  if(it.type==='relic')return'[F] Pick up relic';
  if(it.type==='rare')return'[F] Pick up psy-relic (rare, can’t be sent by beacon)';
  if(it.type==='terminal')return match.hack>=0?'Hacking... stay near the terminal':'[F] Start hacking the terminal';
  if(it.type==='pod'){const c=match.carried;if(c.thruster+c.fuel+c.hull>0)return'[F] Install parts';if(!podReady())return'Escape pod: '+podStatus();return match.launching>=0?'Launch countdown — defend the pod!':'[F] Launch the escape pod';}
  return'';
}
const podAssembled=()=>Object.keys(PART_NEED).every(k=>match.parts[k]>=PART_NEED[k]);
const condsDone=()=>match.conds.every(c=>c.prog>=c.target);
const podReady=()=>podAssembled()&&condsDone();
function podStatus(){if(!podAssembled())return'Missing parts';if(!condsDone())return'Extraction conditions incomplete';return'Ready';}
function interact(it=interactTarget,by=null){
  if(!it)return;if(isClient()){sendNet({t:'interact',idx:it.idx});return;}
  if(missionInteract(it,by))return;
  if(it.type==='clue'){it.used=true;scene.remove(it.m);play('pickup');const c=match.conds.find(c=>!c.revealed);
    if(c){c.revealed=true;annTeam('Clue: the extraction condition is “'+COND_INFO[c.type].name+'”',3.5);}else annTeam('The data-slate only holds the pod’s coordinates',2.5);return;}
  if(PART_NAME[it.type]){it.used=true;scene.remove(it.m);match.carried[it.type]++;play('pickup');annTeam('Picked up  '+PART_NAME[it.type]+', — bring it back to the pod to install',2);return;}
  if(it.type==='core'){it.used=true;scene.remove(it.m);play('pickup');addProgress('cores',1);annTeam('Power core '+(match.conds.find(c=>c.type==='cores')?.prog??'')+'/3',2);return;}
  if(it.type==='relic'){it.used=true;scene.remove(it.m);play('pickup');match.loot++;return;}
  if(it.type==='rare'){it.used=true;scene.remove(it.m);play('pickup');match.rare=true;annTeam('You took the psy-relic. It whispers...',3);if(!by)player.ovl+=20;return;}
  if(it.type==='terminal'&&match.hack<0){match.hack=0;annTeam('Hacking started — the demons are stirring!',2.5);spawnWave(5,true);return;}
  if(it.type==='pod'){const c=match.carried;
    if(c.thruster+c.fuel+c.hull>0){for(const k of Object.keys(c)){match.parts[k]=Math.min(PART_NEED[k],match.parts[k]+c[k]);c[k]=0;}play('pickup');annTeam('Parts installed: '+podPartsText(),2.5);updatePodLook();return;}
    if(podReady()&&match.launching<0){match.launching=7;annTeam('Escape pod ignition! Hold for 7 seconds!',3);spawnWave(7,true);}}
}
function podPartsText(){return Object.keys(PART_NEED).map(k=>PART_NAME[k]+' '+match.parts[k]+'/'+PART_NEED[k]).join('  ');}
function updatePodLook(){const p=match.pod.m;const add=(geo,y,col)=>{const m=new THREE.Mesh(geo,new THREE.MeshLambertMaterial({color:col,emissive:col,emissiveIntensity:.3}));m.position.y=y;p.add(m);};
  p.children.slice(2).forEach(c=>p.remove(c));
  for(let k=0;k<match.parts.thruster;k++){const m=new THREE.Mesh(new THREE.CylinderGeometry(.35,.5,1,6),matMetal);m.position.set(k?1.3:-1.3,.5,0);p.add(m);}
  for(let k=0;k<match.parts.fuel;k++)add(new THREE.CylinderGeometry(.25,.25,.8,6),1+k*.9,0x40c0ff);
  if(match.parts.hull)add(new THREE.TorusGeometry(1.5,.12,4,12),2.4,0xc0c0c0);
}
function callBeacon(pos=null){
  if(isClient()){sendNet({t:'beacon'});return;}const at=pos||player.pos;
  if(match.beacons<=0){annTeam('No recovery beacons left',1.5);return;}
  if(match.loot<=0){annTeam('Nothing on you to send back',1.5);return;}
  match.beacons--;match.safeLoot+=match.loot;const n=match.loot;match.loot=0;play('beacon');
  annTeam('Beacon launched: '+n+' loot sent to the ship. The signal drew demons!',3);spawnWave(6,false);
  const b=new THREE.Mesh(new THREE.SphereGeometry(.5,8,6),new THREE.MeshBasicMaterial({color:0xd8a657}));b.position.copy(at).setY(2);scene.add(b);beams.push({m:b,life:3,rise:true});if(isHost())bcast({t:'fx',k:'beacon',p:at.clone()});
}
function spawnWave(n,near){
  const [pi,pj]=cellOf(player.pos);const d=bfs(pi,pj);
  const cand=[];for(let i=0;i<G;i++)for(let j=0;j<G;j++)if(d[i][j]>=1&&d[i][j]<=(near?1:2))cand.push([i,j]);
  if(!cand.length)cand.push([pi,pj]);
  for(let k=0;k<n;k++){const c=cand[Math.floor(Math.random()*cand.length)];{spawnEnemy(pickEnemy(false),...cellPos(c,5),false);}}
  play('growl');
}

