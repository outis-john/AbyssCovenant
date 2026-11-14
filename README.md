# 深渊圣约 Abyss Covenant（暂定名）

第一人称合作撤离射击游戏。3 人小队降落到被恶魔侵蚀的巢都，用灵能和枪械杀出血路，找出隐藏的撤离条件，自己造逃生舱离开。

- 引擎：Unreal Engine 5（C++ + 蓝图）
- 联机：房主模式，Steam 连接（开发阶段用测试 App ID 480）
- 设计文档：见 Claude 里的《深渊圣约》游戏设计文档

**网页版（当前主线）在 `web/index.html`**：浏览器直接打开即可玩，不需要安装任何软件。

Unreal 版本的 C++ 代码保留在 `unreal/` 文件夹，暂停开发。

## 代码结构

| 文件夹 | 内容 |
| --- | --- |
| `unreal/Source/AbyssCovenant/Core` | `AbyssGameMode`（只在房主上：抽撤离条件、广播加入、结束对局）和 `AbyssGameState`（同步给所有人：地图种子、撤离条件、回收装置次数） |
| `unreal/Source/AbyssCovenant/Combat` | `AbyssHealthComponent`（血量）、`AbyssWeaponComponent`（联机射击和命中反馈）、`AbyssPlayerActionsComponent`（呼叫回收、发射逃生舱） |
| `unreal/Source/AbyssCovenant/Psychic` | `AbyssPsychicComponent`（符文拼装、灵能值、过载、反噬） |
| `unreal/Source/AbyssCovenant/Extraction` | 撤离条件类型、`AbyssEscapePod`（逃生舱零件和发射） |
| `unreal/Config` | Steam 联机设置 |

## 已完成 / 待完成

- [x] 联机射击：房主判定命中，本地立即后坐力，命中提示只发给开枪的人
- [x] 血量同步、敌人死亡计入撤离条件、全队阵亡结束对局
- [x] 灵能：形态 × 元素 × 修饰，灵能值 + 过载，三级反噬，唤潮者加成
- [x] 撤离：每局随机 1–2 个隐藏条件、逃生舱零件、回收装置 2 次、发射后回大厅
- [x] 中途加入的全图广播
- [ ] Steam 建房 / 找房 / 加入（蓝图，下一步做）
- [ ] 房间模块随机拼接地图（蓝图实现 `BuildMapFromSeed`）
- [ ] 恶魔 AI、部位破坏、处决动画
- [ ] 护盾、召唤、追踪类灵能的表现（蓝图实现 `OnSpellCast`）
- [ ] HUD：血量、灵能、过载、撤离条件
