# 深渊圣约 Abyss Covenant — 交接说明（给 Claude）

## 用户
- 用户用拼音写中文，回复用简体中文。UofT 工程系学生，编程基础入门水平。
- 用户希望由 Claude 独立迭代开发；**不要修改用户电脑的系统配置、不要动用户的文件、注意节省 token**。
- 每完成一项就发布 artifact 页面 + 推送 GitHub，并用简短中文汇报。
- 世界观原创（借鉴战锤 40K 的氛围，但不使用其名字、种族、原文）。

## 项目现状
- 主线是**网页版**。**源码在 `web/src/`，只改这里**；`python3 tools/build.py` 按文件名顺序拼接成 `web/index.html`、`docs/index.html`、`docs/abyss-offline.html`（这三个是生成物，别手改，但要提交）。所有 js 在同一个 module 作用域里，顺序即原顺序。
- 文件地图（先 grep 定位再只读需要的文件，省 token）：
  `shell.html` HTML+CSS+界面 DOM · `00-config` **数值表 CFG** · `00-core` 工具/渲染/贴图 · `01-audio` 合成音效 · `02-level` 状态变量/关卡生成/碰撞 · `03-enemies` 敌人模型/受伤/死亡 · `04-gore` 切割断肢/爆弹/血 · `05-weapons` 枪模型/RANGED/MELEE/开火 · `05b-guns` 新枪 · `06-melee` 近战连招 · `06b-heavy` 重击/新近战模型 · `07-execution` 处决 · `07b-execution2` 新武器处决/快速处决 · `08-psychic` 灵能/符文 · `09-extraction` 撤离/拾取/刷怪潮 · `10-player` 玩家 · `11-enemy-ai` 敌人 AI/瘟火术士/Boss · `11b-enemies2` 新敌人/区域配色刷怪 · `11c-biomes` 地图主题贴图和道具 · `11d-missions` 新任务 · `11e-biome-enemies` 区域敌人/Boss 变体/地面危险 · `02b-rooms` 房间类型 · `12-match-hud` 对局流程/HUD · `13-hub` 战舰/职业/仓库/配装 · `13b-settings` 设置/按键说明 · `13c-workshop` 升级/威胁/护符 · `13d-training` 训练场 · `13e-classes` 职业/Z 技能/机甲模型 · `13f-cockpit` 机甲驾驶舱视角 · `14-cutscene` 空降 · `15-net` 联机 · `15b-netfx` 联机特效同步 fxSend/fxPlay · `16-flow-loop` 开局结束/输入/主循环
- `unreal/` 是早期的 UE5 C++ 版本，已暂停。
- `docs/` 是 GitHub Pages 发布副本（`sh sync-pages.sh` 从 web/ 复制）。网址：https://outis-john.github.io/AbyssCovenant/
- Claude artifact 页面：https://claude.ai/artifact/8zLjRyCQCoxMRzT6Vh8yKL （slug 40b18688-37a6-466b-89bf-0f8d60b6645f）。artifact 里**不能联机**（禁止 WebRTC），联机只能用 Pages 版。

## 已实现的系统（都在 web/index.html）
- 局外：战舰整备甲板场景、7 职业（`13e-classes` 的 CLS：唤潮者 tide、铸甲卫士 ward、新铸卫士 reforged、壁垒重甲 bastion、圣遗壁垒 relic、长眠机神 walker、救赎机神 redeemer；只有唤潮者能用灵能，其余按 Z 用职业技能 ZAB；各职业有可用武器白名单、视线高度 eye、碰撞半径 r）、配装（主武器 7 把：爆弹枪 / 霰弹枪 / 热熔枪 / 等离子枪 / 重型爆弹机枪 / 火焰喷射器 / 穿甲狙击枪（`05b-guns`）；副武器爆弹手枪；近战 6 把：链锯剑 / 力场剑 / 剑盾 / 雷殛锤 / 破甲巨拳 / 链锯战斧；短按左键轻连招 COMBOS，按住左键蓄力重击 HEAVY（`06b-heavy`））、战舰仓库（localStorage）。
- 局外成长（`13c-workshop`）：战舰工坊用物资 / 圣物买升级（CFG.upgrades，存在 vault.up）；威胁等级 1–3（CFG.threat，联机用房主的，随 start 消息发 th）；圣物护符（带 1 件圣物出击加属性，阵亡失去）。设置 / 按键说明在 `13b-settings`（localStorage abyss_settings）。训练场（战舰“训练场”按钮，TSTEPS 七步教学，靶子不动不伤人，不计入仓库）。
- 流程：单人行动 / 创建房间 / 加入房间 → 空降舱过场 → 对局 → 阵亡（联机时观战）→ 结算 → 返回战舰。
- 地图：种子生成 5x5 房间网格、小地图（M）；房间类型 `02b-rooms`（std / cover 半高掩体 / maze L 形墙 / hall / arena(Boss 房)）；静态网格按材质合并（mergeProps，墙合并后仍在 wallMeshes 里做射线）。撤离：隐藏条件（kill/elite/hack/ritual/cores + `11d-missions` 的 defend 坚守信标 45 秒 / nest 3 个巢穴（敌人类型 nest，static）/ carry 圣物棺（match.carrier，扛着变慢禁主武器，阵亡掉落））+ 数据板线索、逃生舱零件、终端 / 仪式 / 能源核心、回收装置（B）。物资全队共享（match.*）。
- 战斗：爆弹火箭弹（钉入后爆炸）、霰弹（轰洞 / 轰飞半身）、热熔（右键蓄力、过热条、烧穿）；近战四段连招 + 输入缓冲；链锯右键蓄力狂热；力场剑右键分解力场（祷言字幕）；剑盾右键切剑/手枪、E 格挡防反。
- 断肢：按刀路平面切割盒子部位（splitBox / cutApart / severArmsByPlane / holeKill / halfKill / burstKill / headBurst / meltPuddle）。
- 处决（X，需充能）：点按 = 快速处决（0.45 秒，回复一半），按住 0.3 秒 = 完整处决（按武器播动画，回复全部，震慑 7 米内敌人）；处决后 3 秒内可免充能连环处决 2 次（exChain）。14 种武器都有专属动作（新 7 种在 `07b-execution2`，机甲用驾驶舱巨拳/机炮）；镜头按体型拉开、看胸口、FOV +12、电影黑边 #exBars。
- 敌人：小恶魔 imp、巨魔 brute、瘟火术士 caster（保持距离吐可躲避的瘟火球；砍掉右臂就不能施法；完美格挡把火球弹回去并追踪术士）。Boss 深渊领主 lord（`bossAI`：砸地冲击波 → 二阶段扇形火球 → 三阶段狂暴召唤；免疫锁喉/黑洞/处决；守在 (4,4) 房间，死亡掉圣物+物资；CFG.boss；砸地特效用 `fx` 事件）。敌人 AI：steer 绕障碍、tacticTarget（猎犬包抄 / 小恶魔围圈 / 骨盾掩护术士）。新敌人（`11b-enemies2`：腐爆者 bloater 靠近/死亡爆炸连锁、裂隙猎犬 hound 扑跳、骨盾恶魔 bulwark 正面盾只吃 10% 伤害，重击/爆炸 ×3 破盾，快照 arms 位 4 = 盾已碎；ENEMY_BUILD / ENEMY_AI 钩子）。地图区域 CFG.biomes（巢都炼油厂 hive / 地下圣堂 sanctum（哥特教堂）/ 蓝冰洞窟 frost：`11c-biomes` 每区一套贴图 BTEX + 结构道具 refinery()/cathedral()/iceCave()，沿墙用 wallSides/along 放置并避开门洞；炼油厂蒸汽 biomeTick；刷怪权重 pickEnemy；随机时按 seed 选，联机随 start 发 bi）。区域专属（`11e-biome-enemies`）：炼油厂 tanker 油罐恶魔（喷火、背后 ×3、死后火海）、教堂 priest 堕落祭司（回血+blessT 减伤）、冰洞 frostling（减速 slowT，房主发 slow 消息）；Boss 按区域变体 e.variant（熔炉巨像火球留火海 / 大主教瞬移到背后+召唤术士 / 冰霜巨兽冰锥预警+减速）；伤害玩家的地面危险 hazards（房主判定）。快照里类型用 `ETYPES` 下标；火球 `spits` 由房主判定伤害，`spit` 事件让队友端播放画面。
- 灵能：V 锁喉提摔、G 黑洞、Q 子弹时间（攻击吸血）、C 符文技能（Tab 拼装）；过载反噬。
- 音效全部 WebAudio 合成；链锯引擎按二冲程点火模拟（ScriptProcessor）。
- 联机：默认走**中继**（`RelayPeer`，自写的最小 MQTT-over-WebSocket 客户端，公共服务器 broker.emqx.io，备用 hivemq；接口模仿 PeerJS，房间码最后一位奇偶表示用哪台服务器），这样国内朋友也能连；网址加 `#p2p` 才用旧的 PeerJS 直连。房主权威；队友本地判定命中，把 dmg / sever / stun / interact / cast / beacon 发给房主；房主 12Hz 快照；kill 事件带死法参数各端重现。

## 测试（改代码后必须跑）
- `web/test/`：`three-stub.mjs` 是最小 Three.js 替身（真实向量 / 四元数 / 场景树 / 射线），其余为空对象。
- 运行：`sh web/test/run-tests.sh`（会先自动 build）（test.js 近战/处决/灵能、test2 断臂、test3 连招/切换/剑盾、test4 三把枪、test5 力场剑、test6 瘟火术士、test7 升级/威胁/护符、test8 Boss、test9 训练场、test10 轻重攻击、test11 新枪、test12 职业、test13 新敌人/区域、test14 绕障碍、test15 处决、test16 敌人配合、test17 新任务、test18 区域敌人/Boss 变体、mp_test 两份游戏 + 假 PeerJS、mp_relay_test 同流程 + 假 MQTT 服务器）。
- 注意：替身里所有材质是同一个空对象，材质比较/透明度读取在测试中不可信。setTimeout 在 test4 中被改为同步执行。
- 内置浏览器没有登录 claude.ai，无法直接看 artifact 画面。**沙盒里可以截图自查**：`python3 tools/build.py --offline=/tmp/game.html`，在 `</script>` 前注入 `window.__ev=c=>eval(c);`，用 playwright + /usr/bin/google-chrome（--use-gl=swiftshader）打开并调用游戏函数（如 startTraining()）后截图。

- 试玩问卷：`Docs/试玩反馈问卷.md`。
- 离线单文件版 `docs/abyss-offline.html`：**用户要的时候才生成和发送**（`python3 tools/build.py --offline`），build.py 把 `web/vendor/three.module.js`（r160）内嵌进去，发给国内朋友用。

## 已知坑
- 不要 `clone()` 带 `userData.enemy` 的网格（循环引用会让 Three.js 的 JSON 复制抛错）。
- 网络序列化依赖 `Vector3.isVector3`；deser 也兼容 {x,y,z}。
- 推送时 GitHub 会提示 "repository moved"，可忽略。
