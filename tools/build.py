# 构建：把 web/src/ 里的文件合成单文件游戏
#   web/index.html        —— 主版本（Three.js 从 jsdelivr 加载）
#   docs/index.html       —— GitHub Pages 副本
#   docs/abyss-offline.html —— 离线版（Three.js 内嵌，国内不用联网），只有加 --offline 才生成
# 用法：python3 tools/build.py [--offline]      （只改 web/src/ 里的文件，不要手改生成物）
import re, os, glob, sys
root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
P = lambda *a: os.path.join(root, *a)
shell = open(P('web/src/shell.html'), encoding='utf-8').read()
parts = [open(f, encoding='utf-8').read() for f in sorted(glob.glob(P('web/src/*.js')))]
game = shell.replace('/*@GAME@*/\n', ''.join(parts), 1)
for out in ['web/index.html', 'docs/index.html']:
    open(P(out), 'w', encoding='utf-8').write(game)
off=[a for a in sys.argv if a.startswith('--offline')]
if not off:
    print('built', len(game) // 1024, 'KB (no offline)'); sys.exit(0)
three = open(P('web/vendor/three.module.js'), encoding='utf-8').read()
m = re.search(r'^export \{(.*?)\};?\s*$', three, re.S | re.M)
names = []
for part in m.group(1).split(','):
    part = part.strip()
    if not part: continue
    if ' as ' in part:
        a, b = [x.strip() for x in part.split(' as ')]; names.append(f'{b}:{a}')
    else: names.append(part)
inline = 'const THREE=(()=>{\n' + three[:m.start()] + three[m.end():] + '\nreturn {' + ','.join(names) + '};})();'
imp = "import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';"
assert game.count(imp) == 1
out=off[0].split('=',1)[1] if '=' in off[0] else P('docs/abyss-offline.html')   # --offline=/tmp/x.html 只给截图用
open(out, 'w', encoding='utf-8').write(game.replace(imp, inline))
print('built', len(game) // 1024, 'KB')
