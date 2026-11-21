// ============================================================ Boss 击杀镜头 → 结尾剧情 / 胜利动画 → 战报 → 自动回战舰
const BOSS_FALL={
  mistress:{sub:'The hymn is broken',line:['tavik','The song… it is over. Silence — at last, silence.'],rout:'collapse'},
  malk:{sub:'Fallen',line:null,rout:'flee'}};
function isCampBoss(e){return CAMP.on&&e&&e.named&&(e===CAMP.boss||e===CAMP.malk||e.type==='malk');}
function bossFallScene(e){const P=e.g.position.clone().setY(0),kind=BOSS_FALL[e.type]?e.type:'mistress',B=BOSS_FALL[kind];CAMP.bossFell=true;
  const yaw=Math.atan2(player.pos.x-P.x,player.pos.z-P.z);
  // 镜头不穿墙：从 Boss 胸口往镜头位置打射线，被挡就缩到墙前；房间地图限制在天花板以下
  const at=(a,r,h)=>{if(!OPEN.on){h=Math.min(h,H-1.4);r=Math.min(r,7);}const c=P.clone().add(V3(Math.sin(yaw+a)*r,h,Math.cos(yaw+a)*r)),o=P.clone().setY(1.2),d=c.clone().sub(o),L=d.length();d.divideScalar(L);
    const hit=castRayWalls(o,d,L);return hit?o.addScaledVector(d,Math.max(1.2,hit.distance-.6)):c;};
  const rest=enemies.filter(x=>x.alive&&x!==e);
  runScene([
    // 1. 慢镜头低角度环绕倒下的 Boss，白闪 + 冲击环
    {d:2.6,from:()=>shotAt(at(.9,4.2,.7),P.clone().setY(1)),to:()=>shotAt(at(-.5,5,1.1),P.clone().setY(.8)),
      act(){$('fade').style.background='#fff6e0';$('fade').style.opacity=.85;play('boom');play('boom');player.shake=1;ringAt(P.x,.2,P.z,0xfff0c0,.5,14,1,.35);ringAt(P.x,.2,P.z,0xc02018,.5,9,1.3,.5);
        puff(P.clone().setY(1),30,0x3a3028,4);dust(P.clone(),24);if(actx){tone('sine',110,55,.12,2.4);tone('sawtooth',220,110,.05,1.6);}},
      tick(dt,k){$('fade').style.opacity=Math.max(0,.85-k*3);gameTime+=dt*.25;if(k>.15&&!this.t1){this.t1=1;titleCard(e.named.toUpperCase(),B.sub,2.8);}}},
    // 2. 余部崩溃：合唱团女主死后民兵抱头倒地；马尔克死后叛军溃散
    {d:2.8,from:()=>shotAt(at(-.5,5,1.1),P.clone().setY(.8)),to:()=>shotAt(at(-.9,14,7),P.clone().setY(0)),
      act(){$('fade').style.background='';for(const x of rest){if(!x.alive)continue;const d=x.g.position.distanceTo(P);
          if(B.rout==='collapse'||d<16){const dir=x.g.position.clone().sub(P).setY(0);const L=dir.length()||1;dir.divideScalar(L);damageEnemy(x,99999,'body',dir,{_remote:true,explode:d<16,how:d<16?{burst:{p:P.clone(),dir}}:{}});}
          else{x.alive=false;scene.remove(x.g);}}
        if(B.line&&allies.some(a=>a.id===B.line[0]&&a.alive))vox(B.line[0],B.line[1],true);
        const v=allies.filter(a=>a.alive&&!a.vehicle&&!a.def.generic);if(v.length)later(1.2,()=>bark(v[0],'kill',true));},
      tick(dt){gameTime+=dt;}}],
    ()=>{CAMP.timers=[];CAMP.step=CSTEPS[CAMP.id].length-1;CAMP.S=null;nextCampStep();},{sim:true});}
const _keB=killEnemy;killEnemy=function(e,...r){const was=e.alive;const out=_keB(e,...r);if(was&&!e.alive&&isCampBoss(e)&&!CAMP.bossFell&&state==='playing')bossFallScene(e);return out;};
const _sclB=startCampaignLevel;startCampaignLevel=function(id){CAMP.bossFell=false;_sclB(id);};
// ---------------- 战报：胜利后 12 秒自动回战舰（点任何按钮都会取消倒计时）
let autoHub=null;
function stopAutoHub(){autoHub=null;const b=$('backBtn');if(b&&b.textContent!==undefined)b.textContent='Return to Ship';}
const _cendB=campEnd;campEnd=function(win){_cendB(win);stopAutoHub();if(!win)return;
  const rt=$('resTable');if(rt&&rt.innerHTML!==undefined){const allied=allies.filter(a=>a.alive).length;rt.innerHTML+=`<tr><td>Brothers standing</td><td class="gain">${allied}</td></tr><tr><td>Fire support unused</td><td>${CAMP.fs|0}</td></tr>`;}
  let n=12;const b=$('backBtn');if(!b||b.textContent===undefined)return;b.textContent=`Return to Ship (${n})`;
  const tok=autoHub={},t0=performance.now();const tick=()=>{if(autoHub!==tok)return;if(!$('result').classList.contains('show')){stopAutoHub();return;}const left=Math.max(0,n-Math.floor((performance.now()-t0)/1000));
    b.textContent=`Return to Ship (${left})`;if(left<=0){stopAutoHub();$('result').classList.remove('show');enterHub();return;}requestAnimationFrame(tick);};requestAnimationFrame(tick);
  for(const id of ['campNext','campRetry','campCk']){const x=$(id);if(x&&x.addEventListener)x.addEventListener('click',stopAutoHub,{once:true});}};
