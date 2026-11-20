import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

// ============================================================ 工具
const $ = id => document.getElementById(id);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;
function mulberry32(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}

// ============================================================ 渲染
const PIX = 3;               // 像素放大倍数：复古画面
const canvas = $('game');
const renderer = new THREE.WebGLRenderer({canvas, antialias:false, powerPreference:'high-performance'});
renderer.setPixelRatio(1);
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x070303);
scene.fog = new THREE.FogExp2(0x0b0504, 0.05);
const camera = new THREE.PerspectiveCamera(80, 1, 0.05, 200);
scene.add(camera);
function resize(){
  renderer.setSize(Math.max(1,Math.floor(innerWidth/PIX)), Math.max(1,Math.floor(innerHeight/PIX)), false);
  camera.aspect = innerWidth/innerHeight; camera.updateProjectionMatrix();
  if(window.__hubCam){__hubCam.aspect=camera.aspect;__hubCam.updateProjectionMatrix();}
}
addEventListener('resize', resize); resize();

scene.add(new THREE.HemisphereLight(0x5a3a40, 0x100404, 0.9));
const playerLight = new THREE.PointLight(0xffd2a0, 18, 18, 2);
camera.add(playerLight);
const muzzleLight = new THREE.PointLight(0xffb060, 0, 10, 2);
camera.add(muzzleLight); muzzleLight.position.set(0.3,-0.2,-1.2);
const CANDLE_LIGHTS = 6;
const candleLights = [];
for (let i=0;i<CANDLE_LIGHTS;i++){const l=new THREE.PointLight(0xff7a30,22,14,2);scene.add(l);candleLights.push(l);}

// ============================================================ 像素贴图（程序生成）
function pixelTex(draw, size=16){
  const c=document.createElement('canvas');c.width=c.height=size;const g=c.getContext('2d');draw(g,size);
  const t=new THREE.CanvasTexture(c);t.magFilter=t.minFilter=THREE.NearestFilter;t.wrapS=t.wrapT=THREE.RepeatWrapping;t.colorSpace=THREE.SRGBColorSpace;return t;
}
const noisy=(g,s,base,v)=>{for(let x=0;x<s;x++)for(let y=0;y<s;y++){const k=(Math.random()-.5)*v;g.fillStyle=`rgb(${clamp(base[0]+k,0,255)},${clamp(base[1]+k,0,255)},${clamp(base[2]+k,0,255)})`;g.fillRect(x,y,1,1);}};
const texBrick=pixelTex((g,s)=>{noisy(g,s,[70,58,54],22);g.fillStyle='#1c1412';for(let r=0;r<4;r++){g.fillRect(0,r*4,s,1);const o=r%2?0:4;for(let x=o;x<s;x+=8)g.fillRect(x,r*4,1,4);}});
const texFloor=pixelTex((g,s)=>{noisy(g,s,[48,40,38],18);g.fillStyle='#160f0d';g.fillRect(0,0,s,1);g.fillRect(0,0,1,s);g.fillRect(8,0,1,s);g.fillRect(0,8,s,1);});
const texCeil=pixelTex((g,s)=>{noisy(g,s,[28,20,20],12);g.fillStyle='#3a2a20';for(let i=0;i<s;i+=4)g.fillRect(i,0,1,s);});
const texFlesh=pixelTex((g,s)=>{noisy(g,s,[120,30,28],40);g.fillStyle='#3a0806';for(let i=0;i<10;i++)g.fillRect(Math.random()*s|0,Math.random()*s|0,2,1);});
const texMetal=pixelTex((g,s)=>{noisy(g,s,[80,74,66],16);g.fillStyle='#b8952e';g.fillRect(0,0,s,2);g.fillRect(0,s-2,s,2);});
const texBone=pixelTex((g,s)=>{noisy(g,s,[200,186,150],24);});
function scaleBoxUV(geo,w,h,d,s=2.5){const uv=geo.attributes.uv;const dm=[[d,h],[d,h],[w,d],[w,d],[w,h],[w,h]];for(let f=0;f<6;f++)for(let k=0;k<4;k++){const i=f*4+k;uv.setXY(i,uv.getX(i)*dm[f][0]/s,uv.getY(i)*dm[f][1]/s);}uv.needsUpdate=true;return geo;}
const matBrick=new THREE.MeshLambertMaterial({map:texBrick});
const matMetal=new THREE.MeshLambertMaterial({map:texMetal});
const matBone=new THREE.MeshLambertMaterial({map:texBone});
const matCandle=new THREE.MeshBasicMaterial({color:0xffc070});
const matDark=new THREE.MeshLambertMaterial({color:0x1a1210});
const matBlood=new THREE.MeshBasicMaterial({color:0x5a0000});

