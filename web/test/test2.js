;(async()=>{let now=0;const step=n=>{for(let i=0;i<n;i++){now+=16;frame(now);}};
prepareMatch();state='playing';enemies.forEach(e=>{e.alive=false;scene.remove(e.g);});enemies=[];player.pos.set(0,0,0);player.yaw=0;player.pitch=0;
for(const m of ['saw','power','ssword'])for(const sw of [0,1,2,3]){loadout.melee=m;applyLoadout();cur=2;MS.phase='none';MS.combo=sw;player.meleeCd=0;
  const f=fwdFlat();const e=spawnEnemy('imp',f.x*2.2,f.z*2.2);e.hp=e.maxHp=9999;const g0=gibs.length;
  try{melee();step(50);}catch(err){console.log('ERR',err.stack.split('\n')[0]);}
  const stubs=['armL','armR'].filter(k=>e.armHp[k]===Infinity).length;
  console.log(m.padEnd(7),'swing',MS.combo%2?'A':'B','arms cut',stubs,'gibs +',gibs.length-g0,'hp lost',9999-Math.round(e.hp));
  e.alive=false;scene.remove(e.g);enemies=[];}
})();
