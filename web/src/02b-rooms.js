// ============================================================ 房间类型（用 rng，房主和队友一样）
let roomTypes={};
function roomType(i,j){if(i===0&&j===0)return 'std';if(i===G-1&&j===G-1)return 'arena';const r=rng();return r<.3?'std':r<.55?'cover':r<.78?'maze':'hall';}
// 障碍只放在四个象限（|dx|,|dz| > 2.8），门到中心的十字通道保持畅通
function roomLayout(rt,cx,cz){const Q=[[-1,-1],[1,-1],[-1,1],[1,1]];
  if(rt==='cover'){for(const [sx,sz] of Q){const n=1+Math.floor(rng()*2);for(let k=0;k<n;k++){const x=cx+sx*(4+rng()*3.5),z=cz+sz*(4+rng()*3.5),w=1.2+rng()*1.8,d=.7+rng()*.6;
      if(rng()<.5)addBox(x,z,w,d,0,1.1,matMetal);else addBox(x,z,d,w,0,1.1,matDark);}}   // 半人高掩体：能挡子弹，站着能越过射击
  }else if(rt==='maze'){for(const [sx,sz] of Q){if(rng()<.25)continue;const L=3.5+rng()*2;
      addBox(cx+sx*(3.2+L/2),cz+sz*3.6,L,.8,0,H);addBox(cx+sx*3.6,cz+sz*(3.2+L/2+.4),.8,L-.8,0,H);}   // L 形墙
  }else if(rt==='hall'){for(let k=0;k<8;k++){const a=k/8*Math.PI*2+Math.PI/8,x=cx+Math.cos(a)*7.2,z=cz+Math.sin(a)*7.2;addBox(x,z,.9,.9,0,2.2,matDark);
      candles.push(new THREE.Vector3(x,2.4,z));const c=new THREE.Mesh(new THREE.BoxGeometry(.3,.3,.3),matCandle);c.position.set(x,2.35,z);levelGroup.add(c);}
    const ring=new THREE.Mesh(new THREE.RingGeometry(3.2,3.6,24),new THREE.MeshBasicMaterial({color:0x8a2a1a,side:2}));ring.rotation.x=-Math.PI/2;ring.position.set(cx,.03,cz);levelGroup.add(ring);
    const ring2=new THREE.Mesh(new THREE.RingGeometry(1.4,1.6,6),new THREE.MeshBasicMaterial({color:0xc8a040,side:2}));ring2.rotation.x=-Math.PI/2;ring2.position.set(cx,.03,cz);levelGroup.add(ring2);
  }else if(rt==='arena'){for(let k=0;k<12;k++){const a=k/12*Math.PI*2,x=cx+Math.cos(a)*8.3,z=cz+Math.sin(a)*8.3;if(Math.abs(Math.cos(a))>.97||Math.abs(Math.sin(a))>.97)continue;
      addBox(x,z,1.1,1.1,0,H);const f=new THREE.Mesh(new THREE.BoxGeometry(.5,.4,.5),matCandle);f.position.set(x,3.2,z);levelGroup.add(f);candles.push(new THREE.Vector3(x,3,z));}
    const ring=new THREE.Mesh(new THREE.RingGeometry(5.5,6,32),new THREE.MeshBasicMaterial({color:0x6a0a0a,side:2}));ring.rotation.x=-Math.PI/2;ring.position.set(cx,.03,cz);levelGroup.add(ring);}}
