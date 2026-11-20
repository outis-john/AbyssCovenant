#!/bin/sh
# 用法：在 web/test 目录下运行 sh run-tests.sh
cd "$(dirname "$0")"
python3 - <<'PY'
import re
s=open('../index.html',encoding='utf-8').read()
js=re.search(r'<script type="module">(.*?)</script>',s,re.S).group(1)
js=js.replace("import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';","import * as R from './three-stub.mjs';const THREE=new Proxy(R,{get(t,k){return k in t?t[k]:R.U;}});")
pre="""import {U} from './three-stub.mjs';
globalThis.innerWidth=1280;globalThis.innerHeight=720;globalThis.addEventListener=()=>{};globalThis.requestAnimationFrame=()=>0;
globalThis.document={getElementById:()=>U,querySelectorAll:()=>[],createElement:()=>U,addEventListener(){},exitPointerLock(){},body:U,pointerLockElement:U};
globalThis.localStorage={getItem:()=>null,setItem(){}};globalThis.window=globalThis;
"""
for t in ["test.js","test2.js","test3.js","test4.js"]:
    open('run_'+t.replace('.js','.mjs'),'w').write(pre+js+open(t).read())
PY
node run_test.mjs && node run_test2.mjs && node run_test3.mjs && node run_test4.mjs
