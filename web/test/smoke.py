# 截图冒烟测试：真实浏览器（无界面 Chrome）里打开游戏，逐个区域 / 职业进训练场截图，检查报错和黑屏
# 用法：python3 web/test/smoke.py      截图在 /tmp/smoke/
import asyncio, os, subprocess, sys
from playwright.async_api import async_playwright
from PIL import Image, ImageStat
ROOT=os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
subprocess.run([sys.executable,os.path.join(ROOT,'tools/build.py'),'--offline=/tmp/smoke.html'],check=True,stdout=subprocess.DEVNULL)
s=open('/tmp/smoke.html',encoding='utf-8').read();i=s.rindex('</script>');open('/tmp/smoke.html','w',encoding='utf-8').write(s[:i]+"\nwindow.__ev=c=>eval(c);\n"+s[i:])
os.makedirs('/tmp/smoke',exist_ok=True)
CASES=[('hive','ward','bolter','saw'),('sanctum','relic','plasma','hammer'),('frost','walker','hbolter','fist'),('hive','redeemer','flamer','fist'),('frost','tide','needle','power')]
async def main():
    bad=[]
    async with async_playwright() as p:
        b=await p.chromium.launch(executable_path='/usr/bin/google-chrome',args=['--use-gl=swiftshader','--enable-unsafe-swiftshader','--no-sandbox'])
        pg=await b.new_page(viewport={'width':960,'height':540});errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
        await pg.goto('file:///tmp/smoke.html');await pg.wait_for_timeout(1500)
        await pg.screenshot(path='/tmp/smoke/hub.png')
        for bi,cl,g,m in CASES:
            await pg.evaluate(f"__ev(\"saveVault({{loot:999,rare:99,runs:0,extracted:0,unlocked:Object.keys(CFG.unlock)}});cls='{cl}';loadout.primary='{g}';loadout.melee='{m}';loadout.biome='{bi}';startTraining();\")")
            await pg.wait_for_timeout(1200);f=f'/tmp/smoke/{bi}_{cl}.png';await pg.screenshot(path=f)
            st=ImageStat.Stat(Image.open(f).convert('L'));mean,std=st.mean[0],st.stddev[0]
            ok=mean>12 and std>8;print(f'{bi:8} {cl:9} 亮度 {mean:5.1f} 对比 {std:5.1f}',''if ok else '<-- 可能黑屏');bad+=[] if ok else [f]
        await b.close()
    print('页面报错：',errs or '无');ok=not errs and not bad;print('冒烟测试','通过' if ok else '失败');sys.exit(0 if ok else 1)
asyncio.run(main())
