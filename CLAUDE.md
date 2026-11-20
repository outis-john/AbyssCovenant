# 深渊圣约 Abyss Covenant — 交接说明（给 Claude）

## 用户
- 用户用拼音写中文，回复用简体中文。UofT 工程系学生，编程基础入门水平。
- 用户希望由 Claude 独立迭代开发；**不要修改用户电脑的系统配置、不要动用户的文件、注意节省 token**。
- 每完成一项就发布 artifact 页面 + 推送 GitHub，并用简短中文汇报。
- 世界观原创（借鉴战锤 40K 的氛围，但不使用其名字、种族、原文）。

## 项目现状
- 主线是**网页版**：`web/index.html`（单文件，Three.js 0.160 从 jsdelivr 加载，复古像素风）。
- `unreal/` 是早期的 UE5 C++ 版本，已暂停。
- `docs/` 是 GitHub Pages 发布副本（`sh sync-pages.sh` 从 web/ 复制）。网址：https://outis-john.github.io/AbyssCovenant/
- Claude artifact 页面：https://claude.ai/artifact/8zLjRyCQCoxMRzT6Vh8yKL （slug 40b18688-37a6-466b-89bf-0f8d60b6645f）。artifact 里**不能联机**（禁止 WebRTC），联机只能用 Pages 版。

## 已实现的系统（都在 web/index.html）
- 局外：战舰整备甲板场景、职业（唤潮者 / 铸甲卫士）、配装（主武器：爆弹枪 / 霰弹枪 / 热熔枪；副武器爆弹手枪；近战：力场分解剑 / 链锯剑 / 剑盾）、战舰仓库（localStorage）。
- 流程：单人行动 / 创建房间 / 加入房间 → 空降舱过场 → 对局 → 阵亡（联机时观战）→ 结算 → 返回战舰。
- 地图：种子生成 5x5 房间网格、小地图（M）。撤离：隐藏条件 + 数据板线索、逃生舱零件、终端 / 仪式 / 能源核心、回收装置（B）。物资全队共享（match.*）。
- 战斗：爆弹火箭弹（钉入后爆炸）、霰弹（轰洞 / 轰飞半身）、热熔（右键蓄力、过热条、烧穿）；近战四段连招 + 输入缓冲；链锯右键蓄力狂热；力场剑右键分解力场（祷言字幕）；剑盾右键切剑/手枪、E 格挡防反。
- 断肢：按刀路平面切割盒子部位（splitBox / cutApart / severArmsByPlane / holeKill / halfKill / burstKill / headBurst / meltPuddle）。
- 处决（X，需充能）：7 种动作随手持武器变化，期间无敌，回复等量生命。
- 灵能：V 锁喉提摔、G 黑洞、Q 子弹时间（攻击吸血）、C 符文技能（Tab 拼装）；过载反噬。
- 音效全部 WebAudio 合成；链锯引擎按二冲程点火模拟（ScriptProcessor）。
- 联机：PeerJS（unpkg）房间码，房主权威；队友本地判定命中，把 dmg / sever / stun / interact / cast / beacon 发给房主；房主 12Hz 快照；kill 事件带死法参数各端重现。

## 测试（改代码后必须跑）
- `web/test/`：`three-stub.mjs` 是最小 Three.js 替身（真实向量 / 四元数 / 场景树 / 射线），其余为空对象。
- 运行：`sh web/test/run-tests.sh`（test.js 近战/处决/灵能、test2 断臂、test3 连招/切换/剑盾、test4 三把枪、test5 力场剑、mp_test 两份游戏 + 假网络联机）。
- 注意：替身里所有材质是同一个空对象，材质比较/透明度读取在测试中不可信。setTimeout 在 test4 中被改为同步执行。
- 内置浏览器没有登录 claude.ai，无法直接看 artifact 画面；视觉效果需要用户反馈。

## 已知坑
- 不要 `clone()` 带 `userData.enemy` 的网格（循环引用会让 Three.js 的 JSON 复制抛错）。
- 网络序列化依赖 `Vector3.isVector3`；deser 也兼容 {x,y,z}。
- 推送时 GitHub 会提示 "repository moved"，可忽略。
