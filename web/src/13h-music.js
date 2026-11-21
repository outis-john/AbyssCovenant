// ============================================================ 动态配乐（全部合成）：区域氛围底音一直在，附近恶魔多了就叠上鼓点和低音
const MUS={on:false,bus:null,amb:null,cmb:null,nodes:[],biome:null,int:0,next:0,step:0,timer:null};
const MUS_KEYS={hub:[41.2,[1,1.5,2]],hive:[55,[1,1.19,1.5]],sanctum:[73.4,[1,1.26,1.5,2]],frost:[82.4,[1,1.5,2.24]]};   // 根音 + 和弦倍数
function musicInit(){if(!actx||MUS.bus)return;MUS.bus=actx.createGain();MUS.bus.gain.value=SET.music/100*0.5;MUS.bus.connect(master);
  MUS.amb=actx.createGain();MUS.amb.gain.value=0;MUS.amb.connect(MUS.bus);MUS.cmb=actx.createGain();MUS.cmb.gain.value=0;MUS.cmb.connect(MUS.bus);
}
function musicBiome(b){if(!actx)return;musicInit();if(MUS.biome===b)return;MUS.biome=b;const t=actx.currentTime;
  for(const n of MUS.nodes){try{n.g.gain.setTargetAtTime(0,t,.8);setTimeout(()=>{try{n.o.stop();}catch(e){}},3000);}catch(e){}}MUS.nodes=[];
  const [root,ch]=MUS_KEYS[b]||MUS_KEYS.hub;const lp=actx.createBiquadFilter();lp.type='lowpass';lp.frequency.value=b==='frost'?1400:b==='sanctum'?900:420;lp.Q.value=4;lp.connect(MUS.amb);
  ch.forEach((m,i)=>{for(const det of [-4,4]){const o=actx.createOscillator();o.type=b==='sanctum'?'triangle':'sawtooth';o.frequency.value=root*m;o.detune.value=det+i*2;
    const lfo=actx.createOscillator();lfo.frequency.value=.05+i*.03;const lg=actx.createGain();lg.gain.value=.02;lfo.connect(lg);
    const g=actx.createGain();g.gain.value=0;g.gain.setTargetAtTime(.05/ch.length,t,2);lg.connect(g.gain);o.connect(g).connect(lp);o.start();lfo.start();MUS.nodes.push({o,g},{o:lfo,g:lg});}});
  if(b==='frost'||b==='hive'){const s=actx.createBufferSource();s.buffer=noiseBuf;s.loop=true;const f=actx.createBiquadFilter();f.type='bandpass';f.frequency.value=b==='frost'?700:200;f.Q.value=.7;
    const g=actx.createGain();g.gain.value=0;g.gain.setTargetAtTime(b==='frost'?.05:.03,t,2);s.connect(f).connect(g).connect(MUS.amb);s.start();MUS.nodes.push({o:s,g});}
  MUS.amb.gain.setTargetAtTime(1,t,1.5);}
// 战斗强度：附近活着的恶魔数量
function musicIntensity(dt){if(!MUS.bus)return;let n=0;if(state==='playing'||state==='spectate')for(const e of enemies)if(e.alive&&!e.static&&e.g.position.distanceTo(player.pos)<16)n+=e.boss?6:e.type==='brute'?2:1;
  const want=Math.min(1,n/6);MUS.int+=(want-MUS.int)*Math.min(1,dt*(want>MUS.int?2:0.35));MUS.cmb.gain.setTargetAtTime(MUS.int,actx.currentTime,.3);MUS.bus.gain.setTargetAtTime(SET.music/100*0.5,actx.currentTime,.2);musicSchedule();}
function musicSchedule(){if(!actx||!MUS.bus||MUS.int<0.05)return;const spb=60/(96+MUS.int*28)/2;   // 八分音符
  if(MUS.next<actx.currentTime)MUS.next=actx.currentTime+.05;const [root]=MUS_KEYS[MUS.biome]||MUS_KEYS.hub;
  while(MUS.next<actx.currentTime+.15){const t=MUS.next,s=MUS.step%16;
    if(s%4===0)mKick(t);if(s===4||s===12)mSnare(t);if(MUS.int>.5&&s%2===1)mHat(t);
    mBass(t,root*([1,1,1.19,1][Math.floor(s/4)]),spb);if(MUS.biome==='sanctum'&&s===0)mChoir(t,root*4);
    MUS.next+=spb;MUS.step++;}}
function mOsc(type,f0,f1,t,dur,vol){const o=actx.createOscillator(),g=actx.createGain();o.type=type;o.frequency.setValueAtTime(f0,t);o.frequency.exponentialRampToValueAtTime(Math.max(20,f1),t+dur);
  g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(.0001,t+dur);o.connect(g).connect(MUS.cmb);o.start(t);o.stop(t+dur+.02);}
function mNoise(t,dur,vol,freq,type){const s=actx.createBufferSource();s.buffer=noiseBuf;const f=actx.createBiquadFilter();f.type=type;f.frequency.value=freq;const g=actx.createGain();
  g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(.0001,t+dur);s.connect(f).connect(g).connect(MUS.cmb);s.start(t);s.stop(t+dur+.02);}
const mKick=t=>mOsc('sine',120,40,t,.35,.55),mSnare=t=>{mNoise(t,.18,.25,1800,'bandpass');mOsc('triangle',220,160,t,.1,.15);},mHat=t=>mNoise(t,.05,.08,7000,'highpass');
const mBass=(t,f,d)=>mOsc('sawtooth',f,f,t,d*.9,.09),mChoir=(t,f)=>{for(const m of [1,1.26,1.5])mOsc('triangle',f*m,f*m,t,1.6,.03);};
