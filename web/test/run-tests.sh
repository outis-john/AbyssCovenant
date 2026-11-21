#!/bin/sh
# 用法：在 web/test 目录下运行 sh run-tests.sh
cd "$(dirname "$0")"
python3 ../../tools/build.py >/dev/null || exit 1
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
for t in ["test.js","test2.js","test3.js","test4.js","test5.js","test6.js","test7.js","test8.js","test9.js","test10.js","test11.js","test12.js","test13.js","test14.js","test15.js","test16.js","test17.js","test18.js","test19.js","test20.js","test21.js","test22.js","test23.js","test24.js","test25.js","test26.js","test27.js","test28.js"]:
    open('run_'+t.replace('.js','.mjs'),'w').write(pre+js+'\nCLS.tide.noPrimary=false;\n'+open(t).read())
for f in ['game_a.mjs','game_b.mjs']:
    open(f,'w').write(pre+js+"\nCLS.tide.noPrimary=false;\nexport const ev=(code)=>eval(code);\n")
PY
node run_test.mjs && node run_test2.mjs && node run_test3.mjs && node run_test4.mjs && node run_test5.mjs && node run_test6.mjs && node run_test7.mjs && node run_test8.mjs && node run_test9.mjs && node run_test10.mjs && node run_test11.mjs && node run_test12.mjs && node run_test13.mjs && node run_test14.mjs && node run_test15.mjs && node run_test16.mjs && node run_test17.mjs && node run_test18.mjs && node run_test19.mjs && node run_test20.mjs && node run_test21.mjs && node run_test22.mjs && node run_test23.mjs && node run_test24.mjs && node run_test25.mjs && node run_test26.mjs && node run_test27.mjs && node run_test28.mjs && node mp_test.mjs && node mp_relay_test.mjs
