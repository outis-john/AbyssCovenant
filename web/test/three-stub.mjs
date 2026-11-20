// 测试用的最小 Three.js：数学类和场景树是真实实现，其余一律用万能空对象代替
const U=new Proxy(function(){},{get(t,k){if(k===Symbol.toPrimitive)return()=>0;if(k==='then')return undefined;if(k===Symbol.iterator)return function*(){};if(k==='length')return 0;return U;},apply(){return U},construct(){return U},set(){return true}});
export class Vector3{constructor(x=0,y=0,z=0){this.x=x;this.y=y;this.z=z;}
 set(x,y,z){this.x=x;this.y=y;this.z=z;return this}setScalar(s){this.x=this.y=this.z=s;return this}setY(y){this.y=y;return this}
 copy(v){this.x=v.x;this.y=v.y;this.z=v.z;return this}clone(){return new Vector3(this.x,this.y,this.z)}
 add(v){this.x+=v.x;this.y+=v.y;this.z+=v.z;return this}sub(v){this.x-=v.x;this.y-=v.y;this.z-=v.z;return this}
 addScalar(s){this.x+=s;this.y+=s;this.z+=s;return this}
 addScaledVector(v,s){this.x+=v.x*s;this.y+=v.y*s;this.z+=v.z*s;return this}multiplyScalar(s){this.x*=s;this.y*=s;this.z*=s;return this}
 multiply(v){this.x*=v.x;this.y*=v.y;this.z*=v.z;return this}divide(v){this.x/=v.x;this.y/=v.y;this.z/=v.z;return this}
 divideScalar(s){return this.multiplyScalar(1/s)}negate(){return this.multiplyScalar(-1)}
 length(){return Math.hypot(this.x,this.y,this.z)}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}
 normalize(){const l=this.length()||1;return this.divideScalar(l)}dot(v){return this.x*v.x+this.y*v.y+this.z*v.z}
 crossVectors(a,b){const x=a.y*b.z-a.z*b.y,y=a.z*b.x-a.x*b.z,z=a.x*b.y-a.y*b.x;return this.set(x,y,z)}
 distanceTo(v){return Math.sqrt(this.distanceToSquared(v))}distanceToSquared(v){const dx=this.x-v.x,dy=this.y-v.y,dz=this.z-v.z;return dx*dx+dy*dy+dz*dz}
 lerp(v,t){this.x+=(v.x-this.x)*t;this.y+=(v.y-this.y)*t;this.z+=(v.z-this.z)*t;return this}
 applyQuaternion(q){const{x,y,z}=this,{x:qx,y:qy,z:qz,w:qw}=q;const ix=qw*x+qy*z-qz*y,iy=qw*y+qz*x-qx*z,iz=qw*z+qx*y-qy*x,iw=-qx*x-qy*y-qz*z;
  this.x=ix*qw+iw*-qx+iy*-qz-iz*-qy;this.y=iy*qw+iw*-qy+iz*-qx-ix*-qz;this.z=iz*qw+iw*-qz+ix*-qy-iy*-qx;return this}
 applyAxisAngle(a,ang){return this.applyQuaternion(new Quaternion().setFromAxisAngle(a,ang))}
 getX(){return 0}}
export class Quaternion{constructor(x=0,y=0,z=0,w=1){this.x=x;this.y=y;this.z=z;this.w=w;}
 set(x,y,z,w){this.x=x;this.y=y;this.z=z;this.w=w;return this}copy(q){return this.set(q.x,q.y,q.z,q.w)}clone(){return new Quaternion(this.x,this.y,this.z,this.w)}
 multiplyQuaternions(a,b){const qax=a.x,qay=a.y,qaz=a.z,qaw=a.w,qbx=b.x,qby=b.y,qbz=b.z,qbw=b.w;
  return this.set(qax*qbw+qaw*qbx+qay*qbz-qaz*qby,qay*qbw+qaw*qby+qaz*qbx-qax*qbz,qaz*qbw+qaw*qbz+qax*qby-qay*qbx,qaw*qbw-qax*qbx-qay*qby-qaz*qbz)}
 multiply(q){return this.multiplyQuaternions(this,q)}premultiply(q){return this.multiplyQuaternions(q,this)}
 invert(){return this.set(-this.x,-this.y,-this.z,this.w)}
 setFromAxisAngle(a,ang){const s=Math.sin(ang/2);return this.set(a.x*s,a.y*s,a.z*s,Math.cos(ang/2))}
 setFromUnitVectors(a,b){const c=new Vector3().crossVectors(a,b);const w=1+a.dot(b);return this.set(c.x,c.y,c.z,w).normalize()}
 normalize(){const l=Math.hypot(this.x,this.y,this.z,this.w)||1;return this.set(this.x/l,this.y/l,this.z/l,this.w/l)}
 setFromEuler(e){const c1=Math.cos(e._x/2),c2=Math.cos(e._y/2),c3=Math.cos(e._z/2),s1=Math.sin(e._x/2),s2=Math.sin(e._y/2),s3=Math.sin(e._z/2);
  if(e._order==='YXZ')return this.set(s1*c2*c3+c1*s2*s3,c1*s2*c3-s1*c2*s3,c1*c2*s3-s1*s2*c3,c1*c2*c3+s1*s2*s3);
  return this.set(s1*c2*c3+c1*s2*s3,c1*s2*c3-s1*c2*s3,c1*c2*s3+s1*s2*c3,c1*c2*c3-s1*s2*s3)}}
export class Euler{constructor(o){this._x=0;this._y=0;this._z=0;this._order='XYZ';this.o=o;}
 get x(){return this._x}set x(v){this._x=v;this.u()}get y(){return this._y}set y(v){this._y=v;this.u()}get z(){return this._z}set z(v){this._z=v;this.u()}
 get order(){return this._order}set order(v){this._order=v;this.u()}
 set(x,y,z,o){this._x=x;this._y=y;this._z=z;if(o)this._order=o;this.u();return this}u(){if(this.o)this.o.quaternion.setFromEuler(this)}}
let ID=0;
export class Object3D{constructor(){this.id=ID++;this.position=new Vector3();this.quaternion=new Quaternion();this.scale=new Vector3(1,1,1);this.rotation=new Euler(this);this.children=[];this.parent=null;this.userData={};this.visible=true;}
 add(...os){for(const o of os){if(o&&o instanceof Object3D){if(o.parent)o.parent.remove(o);o.parent=this;}this.children.push(o);}return this}
 remove(o){const i=this.children.indexOf(o);if(i>=0){this.children.splice(i,1);if(o instanceof Object3D)o.parent=null;}return this}
 _w(){if(!this.parent)return{p:this.position.clone(),q:this.quaternion.clone(),s:this.scale.clone()};const P=this.parent._w();
  return{p:this.position.clone().multiply(P.s).applyQuaternion(P.q).add(P.p),q:P.q.clone().multiply(this.quaternion),s:P.s.clone().multiply(this.scale)}}
 getWorldPosition(v){return v.copy(this._w().p)}getWorldQuaternion(q){return q.copy(this._w().q)}getWorldScale(v){return v.copy(this._w().s)}
 getWorldDirection(v){return v.set(0,0,1).applyQuaternion(this._w().q)}
 updateMatrixWorld(){}updateWorldMatrix(){}
 attach(o){const W=o._w(),T=this._w();this.add(o);o.position.copy(W.p.sub(T.p).applyQuaternion(T.q.clone().invert()).divide(T.s));o.quaternion.copy(T.q.clone().invert().multiply(W.q));o.scale.copy(W.s.divide(T.s));return this}
 lookAt(){}clone(){const c=new this.constructor(this.geometry,this.material);c.position.copy(this.position);c.quaternion.copy(this.quaternion);c.scale.copy(this.scale);
  c.userData=JSON.parse(JSON.stringify(this.userData));for(const ch of this.children)if(ch instanceof Object3D)c.add(ch.clone());return c}}
export class Group extends Object3D{}
export class Scene extends Object3D{constructor(){super();this.background=U;this.fog=U;}}
export class Mesh extends Object3D{constructor(g,m){super();this.geometry=g||U;this.material=m||U;}}
export class PerspectiveCamera extends Object3D{constructor(f,a){super();this.fov=f;this.aspect=a;}updateProjectionMatrix(){}}
export class BoxGeometry{constructor(width=1,height=1,depth=1){this.parameters={width,height,depth};this.attributes={uv:{getX:()=>0,getY:()=>0,setXY(){},needsUpdate:true}};}translate(){return this}}
export const NearestFilter=1,RepeatWrapping=1,SRGBColorSpace=1,DoubleSide=2;
const real={Vector3,Quaternion,Euler,Object3D,Group,Scene,Mesh,PerspectiveCamera,BoxGeometry,NearestFilter,RepeatWrapping,SRGBColorSpace,DoubleSide};
export default real;
export {U};
