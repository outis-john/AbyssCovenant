// ============================================================ 配音 2.0：更像真人、有感情
// 1) 自动挑设备上最自然的语音（Edge 的 Natural/Online 神经语音、苹果的 Enhanced/Premium/Siri、Google 语音），每个角色分到不同的声音；
// 2) 音高只在 0.8–1.1 之间微调（以前压到 0.05–0.6 会变成电子嗡嗡声）；
// 3) 按句切分，按标点和情绪调整语速/音高/音量：感叹 = 急促有力，省略号 = 迟疑放慢，问句上扬，全大写 = 吼，悲伤词 = 低沉缓慢；
// 4) 去掉台词底下的管风琴嗡鸣；战斗中的无线电喊话前加一声通讯杂音。
const VO={pool:null,map:{},tried:0};
// 角色气质：p 音高、r 语速、g 性别偏好（f = 女声）、tier 声音优先级（0 = 最好的声音给主角）
const VPROF={kaedric:{p:.96,r:.98,tier:0},corvan:{p:.98,r:.98,tier:0},vesk:{p:.94,r:.96,tier:0},loken:{p:1,r:1,tier:1},ferrus:{p:.86,r:.9,tier:1},kharos:{p:.88,r:.94,tier:1},
  haldrek:{p:.9,r:.95,tier:1},ardan:{p:1.04,r:1.03},vell:{p:1.06,r:1.05},krosk:{p:.88,r:1},lucan:{p:1.05,r:.98},tavik:{p:.9,r:.88},hesk:{p:.8,r:.86},tarvitz:{p:1.02,r:1},
  malk:{p:.94,r:.95},angron:{p:.8,r:.92},fleet:{p:.96,r:.98},ironfleet:{p:.94,r:.98},ostvar:{p:.86,r:1},kavel:{p:.92,r:.95},senn:{p:1.04,r:1.04},vulkan:{p:.84,r:.9},
  corax:{p:1,r:.96},fulgrim:{p:1.1,r:.94},eidolon:{p:1.12,r:1.06},nlsgt:{p:.86,r:.92},ixan:{p:1.06,r:1.05},thraile:{p:.98,r:1},kasdrel:{p:.82,r:.88},curze:{p:.9,r:.82},vox:{p:1,r:1.02}};
const FEMALE=/(zira|susan|hazel|libby|sonia|jenny|aria|samantha|karen|moira|tessa|serena|victoria|fiona|kate|female|emma|ava|michelle|natasha|clara|maisie|mia|ana|catherine|sara|allison|ava|joanna|kendra|salli|amy|olivia|elizabeth|martha|veena|isla|google us english|tessa|nicky|kathy|vicki|victoria|princess)/i;
const MALE=/(guy|ryan|thomas|christopher|eric|roger|steffan|andrew|brian|davis|tony|jason|william|liam|connor|mitchell|ken\b|prabhat|neil|elliot|ethan|noah|david|mark|george|james|richard|sean|daniel|arthur|oliver|alex\b|aaron|gordon|lee\b|tom\b|evan|nathan|jamie|male|oscar|harry|rocco|luke|duncan|ralph|hugh|graham|malcolm|rishi)/i;
function voiceScore(v){let s=0;const n=v.name;if(/natural|neural/i.test(n))s+=12;if(/online/i.test(n))s+=4;if(/enhanced|premium/i.test(n))s+=9;if(/siri/i.test(n))s+=8;if(/google/i.test(n))s+=4;
  if(/en-GB/i.test(v.lang))s+=2;else if(/en-(AU|IE|US|CA|NZ)/i.test(v.lang))s+=1;if(/compact|eloquence|espeak|novelty|whisper|bad news|bahh|bells|boing|bubbles|cellos|jester|organ|superstar|trinoids|wobble|zarvox|albert|fred|junior|ralph|grandpa|grandma|rocko|shelley|flo|reed|sandy/i.test(n))s-=30;return s;}
function voicePool(){if(VO.pool&&VO.pool.all.length)return VO.pool;if(typeof speechSynthesis==='undefined')return null;const vs=speechSynthesis.getVoices().filter(v=>/^en/i.test(v.lang));if(!vs.length)return null;
  const rank=a=>a.slice().sort((x,y)=>voiceScore(y)-voiceScore(x));const sure=rank(vs.filter(v=>MALE.test(v.name)&&!/female/i.test(v.name))),notF=rank(vs.filter(v=>!FEMALE.test(v.name)));
  const male=sure.length?sure:notF.length?notF:rank(vs);VO.pool={all:vs,male,fem:male,unsure:!sure.length};VO.map={};return VO.pool;}
function hashStr(s){let h=7;for(const c of s)h=(h*31+c.charCodeAt(0))>>>0;return h;}
function voiceFor(who){const P=voicePool();if(!P)return null;if(VO.map[who])return VO.map[who];const prof=VPROF[who]||{};const list=prof.g==='f'?P.fem:P.male;
  const good=list.filter(v=>voiceScore(v)>=voiceScore(list[0])-5).slice(0,6);const pickFrom=good.length?good:list;
  let v;if(prof.tier===0)v=pickFrom[0];else if(prof.tier===1)v=pickFrom[Math.min(1,pickFrom.length-1)];else v=pickFrom[hashStr(who)%pickFrom.length];VO.map[who]=v;return v;}
// 情绪：整句的基调
function lineMood(t){if(/\b(no|gone|fallen|dead|forgive|mourn|lost|sorry|silence)\b/i.test(t)&&!/!/.test(t))return 'grief';if(/[A-Z]{4,}/.test(t)||/!{1}/.test(t)&&t.length<60)return 'shout';if(/\?$/.test(t.trim()))return 'ask';if(/…|\.\.\./.test(t))return 'hesitant';return 'calm';}
const MOOD={calm:{r:.92,p:.94,v:.92},shout:{r:.95,p:.96,v:1},grief:{r:.8,p:.9,v:.84},ask:{r:.9,p:.94,v:.9},hesitant:{r:.84,p:.92,v:.86}};
function chunkLine(t){t=t.replace(/’/g,"'").replace(/\s*—\s*/g,' — ').replace(/…/g,'...');const parts=[];let cur='';
  for(let i=0;i<t.length;i++){cur+=t[i];const end3=cur.endsWith('...'),end1=/[!?]$/.test(cur)||(t[i]==='.'&&t[i+1]!=='.'&&!end3&&t[i-1]!=='.'),dash=cur.endsWith(' —');
    if((end3||end1||dash)&&(t[i+1]===undefined||t[i+1]===' ')){parts.push(cur.trim());cur='';}}if(cur.trim())parts.push(cur.trim());
  const out=[];let buf='';for(const p of parts){buf+=(buf?' ':'')+p;if(buf.length>18||/[.!?]$/.test(buf)){out.push(buf);buf='';}}if(buf)out.push(buf);return out;}
function radioClick(){if(!actx)return;noiseHit(2800,.035,.07,'bandpass');tone('square',1650,1500,.012,.05);}
speakLine=function(L){if(!SET.voice||typeof speechSynthesis==='undefined'||typeof SpeechSynthesisUtterance==='undefined')return null;
  try{const who=L.who,prof=VPROF[who]||{p:hashStr(who)%2?1.02:.96,r:1},M=MOOD[lineMood(L.text)],v=voiceFor(who);const chunks=chunkLine(L.text);let last=null;
    if(state==='playing'&&!L.scene)radioClick();
    chunks.forEach((c,i)=>{const u=new SpeechSynthesisUtterance(c.replace(/ — /g,', '));const caps=/[A-Z]{4,}/.test(c),ex=/!$/.test(c),q=/\?$/.test(c),trail=/\.\.\.$/.test(c),endLine=i===chunks.length-1;
      let r=.9*prof.r*M.r*(caps?.96:1)*(trail?.88:1)*(endLine?.94:1),p=.92*prof.p*M.p*(caps?.97:1)*(trail?.96:1);const low=VO.pool&&VO.pool.unsure?.94:1;
      u.rate=clamp(r,.68,.98);u.pitch=clamp(p*low,.72,.98);u.volume=Math.min(1,SET.voice/100*(caps||ex?1:M.v));if(v){u.voice=v;u.lang=v.lang;}else u.lang='en-GB';speechSynthesis.speak(u);last=u;});
    return last;}catch(e){return null;}};
chantDrone=function(){};
if(typeof speechSynthesis!=='undefined'&&speechSynthesis.addEventListener)speechSynthesis.addEventListener('voiceschanged',()=>{VO.pool=null;VO.map={};});
// ---------------- 设置面板：显示正在用的声音、试听、提示怎么装更好的声音
function voiceTest(){if(typeof speechSynthesis==='undefined')return;speechSynthesis.cancel();VO.pool=null;VO.map={};
  speakLine({who:'kaedric',text:'Brothers. The Warmaster has betrayed us... but we are not dead yet. We hold.'});speakLine({who:'tavik',text:'I can feel them dying, Sergeant. Millions of them... like candles going out.'});}
const _osV=openSettings;openSettings=function(){_osV();const b=$('setRows');if(!b||b.innerHTML===undefined)return;const P=voicePool(),best=P&&P.male[0];
  const q=best?voiceScore(best):0;const hint=q>=8?'Natural voice found — sounds great.':'Only basic voices on this device. For lifelike voices use Microsoft Edge (Natural voices), or on iPad/Mac download an Enhanced voice in Settings › Accessibility › Spoken Content › Voices.';
  b.insertAdjacentHTML('beforeend',`<div class="setrow" style="display:block;font-size:12px;line-height:1.4;opacity:.85"><b style="color:#d8a657">Voice:</b> ${best?best.name:'none'} <button id="voiceTest" style="margin-left:8px;padding:2px 10px">Test</button><br>${hint}</div>`);
  const t=$('voiceTest');if(t)t.onclick=voiceTest;};
