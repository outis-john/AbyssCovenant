// ============================================================ 音效（全部合成）
let hum=null,humGain=null,masterLP=null;
function humEngine(on,fast){if(!humGain)return;humGain.gain.setTargetAtTime(on?(fast?0.16:0.06):0,actx.currentTime,0.05);hum.frequency.setTargetAtTime(fast?95:58,actx.currentTime,0.05);}
let actx=null, noiseBuf=null, master=null, whisperGain=null, whisperFilter=null, saw=null;
// 链锯引擎：单缸二冲程，每转点火一次（基频 = 转速/60）。怠速约 2900 转、偶尔漏火；满油约 12500 转；锯进肉里会被拖到约 8000 转
function initSaw(){
  const sr=actx.sampleRate, sp=actx.createScriptProcessor(1024,0,1);
  saw={rpm:2900,target:2900,load:0,loadT:0,on:0,onT:0,phase:0,burst:0,lp:0,crack:0,hp:0,prev:0};
  sp.onaudioprocess=ev=>{const out=ev.outputBuffer.getChannelData(0),S=saw;
    S.rpm+=(S.target-S.rpm)*(S.target>S.rpm?0.22:0.12);S.load+=(S.loadT-S.load)*0.3;S.on+=(S.onT-S.on)*0.3;
    const idle=S.rpm<4200;
    for(let i=0;i<out.length;i++){
      const f=S.rpm*(1+(Math.random()-.5)*0.01)/60;S.phase+=f/sr;
      if(S.phase>=1){S.phase-=1;if(!(idle&&Math.random()<0.3))S.burst=0.75+Math.random()*0.35;}   // 点火（怠速时约 30% 漏火）
      const n=Math.random()*2-1;
      S.burst*=Math.exp(-f*6/sr);
      const pop=S.burst*(0.35*n+1.0*Math.sin(6.2832*S.phase)+0.5*Math.sin(3.1416*S.phase));                  // 排气爆破
      S.lp+=(n-S.lp)*0.03;                                                          // 机身低频震动
      S.hp=0.9*(S.hp+n-S.prev);S.prev=n;                                            // 链条高频啸叫
      const whine=S.hp*0.022*Math.min(1,Math.max(0,(S.rpm-3000)/9000));
      let grit=0;if(S.load>0.01){if(Math.random()<0.004)S.crack=1;S.crack*=0.996;grit=(n*0.45+S.crack*n)*S.load*(0.6+0.4*Math.sin(6.2832*S.phase));}
      out[i]=(pop*0.8+S.lp*0.5+whine+grit)*S.on;
    }};
  const muff=actx.createBiquadFilter();muff.type='peaking';muff.frequency.value=180;muff.Q.value=0.9;muff.gain.value=10;
  const lp=actx.createBiquadFilter();lp.type='lowpass';lp.frequency.value=1500;lp.Q.value=0.5;
  const g=actx.createGain();g.gain.value=0.5;sp.connect(muff).connect(lp).connect(g).connect(master);
}
function sawEngine(out,mode,rc=0){if(!saw)return;saw.onT=out?1:0;saw.target=mode==='bite'?8000:mode==='rev'?4000+rc*9500:mode==='swing'?12500:2900;saw.loadT=mode==='bite'?1:0;}
function initAudio(){
  if(actx) return;
  actx=new (window.AudioContext||window.webkitAudioContext)();
  master=actx.createGain();master.gain.value=0.75;const comp=actx.createDynamicsCompressor();comp.threshold.value=-14;comp.ratio.value=4;comp.attack.value=0.003;comp.release.value=0.25;masterLP=actx.createBiquadFilter();masterLP.type='lowpass';masterLP.frequency.value=20000;master.connect(masterLP).connect(comp).connect(actx.destination);
  hum=actx.createOscillator();hum.type='sawtooth';hum.frequency.value=58;const humF=actx.createBiquadFilter();humF.type='lowpass';humF.frequency.value=380;humGain=actx.createGain();humGain.gain.value=0;hum.connect(humF).connect(humGain).connect(master);hum.start();
  noiseBuf=actx.createBuffer(1,actx.sampleRate,actx.sampleRate);const d=noiseBuf.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;
  // 过载低语层：持续的带通噪声，过载越高越响
  const n=actx.createBufferSource();n.buffer=noiseBuf;n.loop=true;
  initSaw();
  whisperFilter=actx.createBiquadFilter();whisperFilter.type='bandpass';whisperFilter.Q.value=9;whisperFilter.frequency.value=900;
  whisperGain=actx.createGain();whisperGain.gain.value=0;
  n.connect(whisperFilter).connect(whisperGain).connect(master);n.start();
}
function env(node,t,a,peak,dec){node.gain.setValueAtTime(0.0001,t);node.gain.exponentialRampToValueAtTime(peak,t+a);node.gain.exponentialRampToValueAtTime(0.0001,t+a+dec);}
function noiseHit(freq,peak,dec,type='lowpass'){const t=actx.currentTime;const s=actx.createBufferSource();s.buffer=noiseBuf;const f=actx.createBiquadFilter();f.type=type;f.frequency.setValueAtTime(freq,t);f.frequency.exponentialRampToValueAtTime(Math.max(60,freq*0.25),t+dec);const g=actx.createGain();env(g,t,0.004,peak,dec);s.connect(f).connect(g).connect(master);s.start(t);s.stop(t+dec+0.05);}
function tone(type,f0,f1,peak,dec,delay=0){const t=actx.currentTime+delay;const o=actx.createOscillator();o.type=type;o.frequency.setValueAtTime(f0,t);o.frequency.exponentialRampToValueAtTime(Math.max(20,f1),t+dec);const g=actx.createGain();env(g,t,0.004,peak,dec);o.connect(g).connect(master);o.start(t);o.stop(t+dec+0.05);}
const sfx={
  shot(){noiseHit(2400,0.35,0.16);tone('sine',140,45,0.4,0.12);},
  hit(){tone('square',1500,1400,0.08,0.035);},
  head(){tone('sine',1900,1900,0.12,0.09);tone('sine',2500,2500,0.08,0.12,0.03);},
  kill(){noiseHit(900,0.4,0.25);tone('sine',90,40,0.45,0.25);},
  hurt(){tone('sawtooth',160,60,0.25,0.22);},
  saw(){noiseHit(3000,0.25,0.25,'bandpass');tone('sawtooth',90,140,0.15,0.25);},
  spell(f=500){tone('sine',f,f*3,0.2,0.25);noiseHit(4000,0.08,0.2,'highpass');},
  boom(){noiseHit(700,0.7,0.9);tone('sine',70,30,0.5,0.6);},
  pickup(){tone('sine',660,660,0.15,0.12);tone('sine',990,990,0.12,0.18,0.08);},
  spit(){tone('sawtooth',260,900,0.1,0.25);noiseHit(1500,0.25,0.3,'bandpass');},
  sizzle(){noiseHit(4000,0.3,0.45,'highpass');tone('sine',420,90,0.15,0.35);},
  hiss(){tone('sine',180,720,0.07,0.7);noiseHit(2200,0.08,0.7,'bandpass');},
  growl(){tone('sawtooth',70+Math.random()*30,50,0.12,0.4);},
  beacon(){for(let i=0;i<4;i++)tone('square',i%2?880:440,i%2?880:440,0.08,0.12,i*0.15);},
  heart(){tone('sine',55,40,0.5,0.15);tone('sine',55,40,0.35,0.15,0.18);},
  grind(){noiseHit(2600,0.4,0.32,'bandpass');tone('square',230,150,0.14,0.28);tone('sawtooth',1900,1100,0.07,0.22);noiseHit(500,0.3,0.2);},
  shotgun(){tone('sine',75,22,1.0,0.55);noiseHit(1100,1.0,0.45);noiseHit(6000,0.5,0.07,'highpass');noiseHit(260,0.6,1.3,'bandpass');tone('sine',140,40,0.6,0.2);},
  bolter(){tone('sine',75,32,0.7,0.22);noiseHit(520,0.55,0.28);noiseHit(2800,0.2,0.45,'bandpass');tone('sawtooth',160,420,0.05,0.35);},
  boltBoom(){noiseHit(1300,0.55,0.32);tone('sine',115,38,0.5,0.28);noiseHit(5200,0.22,0.05,'highpass');},
  pistol(){noiseHit(2400,0.4,0.15);tone('sine',160,50,0.45,0.13);},
  melta(){noiseHit(5000,0.4,0.5,'highpass');noiseHit(600,0.6,0.6);tone('sawtooth',90,40,0.3,0.5);},
  zap(){tone('sawtooth',180,520,0.08,0.12);noiseHit(4000,0.12,0.12,'highpass');},
  powerHit(){tone('sawtooth',900,150,0.2,0.18);noiseHit(3500,0.4,0.2,'bandpass');tone('sine',80,40,0.4,0.2);},
  clang(){tone('square',820,760,0.15,0.25);tone('square',1230,1150,0.08,0.3);noiseHit(3000,0.25,0.1,'highpass');},
  fieldOn(){tone('sawtooth',120,900,0.18,0.4);noiseHit(6000,0.25,0.3,'highpass');tone('sine',60,60,0.4,0.6);},
  choir(){for(const [f,d] of [[147,0],[220,0],[277,.02],[330,.04]]){const t=actx.currentTime+d;const o=actx.createOscillator();o.type='sawtooth';o.frequency.value=f;const v=actx.createOscillator();v.frequency.value=5;const vg=actx.createGain();vg.gain.value=3;v.connect(vg).connect(o.frequency);
    const fl=actx.createBiquadFilter();fl.type='lowpass';fl.frequency.value=900;const g=actx.createGain();g.gain.setValueAtTime(0.0001,t);g.gain.exponentialRampToValueAtTime(0.05,t+0.15);g.gain.exponentialRampToValueAtTime(0.0001,t+1.6);
    o.connect(fl).connect(g).connect(master);o.start(t);v.start(t);o.stop(t+1.7);v.stop(t+1.7);}},
  frenzy(){tone('sawtooth',90,240,0.25,0.5);noiseHit(2000,0.3,0.4,'bandpass');},
  parry(){tone('sine',1600,1600,0.3,0.4);tone('sine',2400,2400,0.18,0.5);noiseHit(5000,0.3,0.1,'highpass');},
  charge(){tone('sawtooth',120,600,0.12,1.0);},
  vent(){noiseHit(3000,0.5,1.5,'highpass');tone('sine',200,80,0.2,0.8);},
  lift(){tone('sine',80,300,0.35,0.9);noiseHit(800,0.2,0.9,'bandpass');},
  hole(){tone('sine',200,40,0.5,1.2);noiseHit(400,0.4,2.5,'bandpass');tone('sawtooth',55,30,0.25,3);},
  bt(){tone('sine',600,90,0.4,0.8);noiseHit(2000,0.3,0.6,'bandpass');},
  exStart(){tone('sine',60,30,0.6,0.4);noiseHit(300,0.3,0.4);},
  equip(){tone('square',300,200,0.05,0.06);noiseHit(2500,0.08,0.08,'bandpass');},
  magOut(){tone('square',500,300,0.06,0.05);noiseHit(3000,0.1,0.06,'bandpass');},
  magIn(){tone('square',260,180,0.09,0.06);noiseHit(1800,0.15,0.07,'bandpass');},
  chamber(){tone('square',700,400,0.08,0.04);tone('square',350,250,0.08,0.05,0.08);},
  dry(){tone('square',1200,1100,0.06,0.03);},
  rip(){noiseHit(900,0.5,0.35);noiseHit(3200,0.25,0.25,'bandpass');tone('sawtooth',300,90,0.15,0.3);},
  whoosh(){noiseHit(1800,0.18,0.18,'bandpass');},
  whistle(){tone('sine',260,1500,0.12,2.3);noiseHit(1200,0.15,2.3,'bandpass');},
  backlash(){noiseHit(300,0.8,1.4);tone('sawtooth',40,25,0.5,1.2);},
};
function play(name,...a){if(actx&&sfx[name])sfx[name](...a);}

