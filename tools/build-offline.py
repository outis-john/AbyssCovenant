# 生成离线单文件版：把 Three.js 直接塞进 HTML，不需要联网（国内也能打开单人模式）
# 用法：python3 tools/build-offline.py   →  输出 docs/abyss-offline.html
import re, os
root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
game = open(os.path.join(root, 'web/index.html'), encoding='utf-8').read()
three = open(os.path.join(root, 'web/vendor/three.module.js'), encoding='utf-8').read()
m = re.search(r'^export \{(.*?)\};?\s*$', three, re.S | re.M)
names = []
for part in m.group(1).split(','):
    part = part.strip()
    if not part: continue
    if ' as ' in part:
        a, b = [x.strip() for x in part.split(' as ')]; names.append(f'{b}:{a}')
    else: names.append(part)
body = three[:m.start()] + three[m.end():]
inline = 'const THREE=(()=>{\n' + body + '\nreturn {' + ','.join(names) + '};})();'
imp = "import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';"
assert game.count(imp) == 1
out = game.replace(imp, inline)
open(os.path.join(root, 'docs/abyss-offline.html'), 'w', encoding='utf-8').write(out)
print('ok', len(out) // 1024, 'KB')
