// ============================================================ 数值表（想调手感改这里就行，改完运行 python3 tools/build.py）
// hp 血量 / speed 移速（米每秒）/ dmg 伤害 / reach 攻击距离 / rate 每秒发射数 / magSize 弹匣 / res0 开局备弹 / reload 换弹秒数
// windup 抬手秒数 / slash 挥砍秒数 / cd 冷却秒数
const CFG={
  enemies:{
    imp:   {hp:60, speed:5.2,dmg:12,reach:1.7,scale:1.0,color:0x9a2a22},                 // 小恶魔
    brute: {hp:420,speed:3.0,dmg:30,reach:2.6,scale:1.7,color:0x5a1a3a},                 // 巨魔
    lord:  {hp:2600,speed:3.4,dmg:38,reach:3.4,scale:2.6,color:0x3a0c0c,boss:true},     // Boss：深渊领主
    caster:{hp:90, speed:3.8,dmg:16,reach:1.6,scale:1.0,color:0x3e5a26,ranged:true},     // 瘟火术士
  },
  // Boss：砸地冲击波半径 / 伤害倍率、扇形火球数量、狂暴召唤间隔
  boss:{slamR:5,slamWind:0.9,slamCd:2.6,volley:5,volleyCd:3.8,summonEvery:14,summonN:3},
  spit:{speed:12,castTime:0.7,cooldown:[2.4,4.0],range:24,reflectMul:4},                 // 瘟火球
  guns:{
    bolter: {dmg:24, rate:7,  magSize:24,res0:120,reserveMax:192,reload:1.1,spread:.012},  // 爆弹枪
    shotgun:{dmg:16, rate:1.3,magSize:6, res0:30, reserveMax:48, reload:1.3,spread:.1,pellets:10},  // 霰弹枪
    melta:  {dmg:170,rate:1.6,range:16},                                                    // 热熔枪
  },
  melee:{
    saw:   {dmg:35,windup:.13,slash:.17},   // 链锯剑
    power: {dmg:48,windup:.09,slash:.12},   // 力场分解剑
    ssword:{dmg:42,windup:.14,slash:.17},   // 剑盾
  },
  field:{dur:8,cd:16,mul:1.6},              // 力场剑的分解力场
  psy:{lift:6,hole:10,bt:30},               // 灵能冷却：V 锁喉提摔 / G 黑洞 / Q 子弹时间
  perf:{gibs:320,bloods:650,sparks:500,puffs:250},   // 同屏碎块 / 血迹 / 火花 / 烟雾上限，卡顿就调小
  // 威胁等级：敌人血量 / 伤害倍率、每个房间多刷几只、刷怪潮间隔、带回物资倍率
  threat:[null,{name:'一级 · 侵蚀',hp:1,dmg:1,extra:0,wave:50,loot:1},{name:'二级 · 沦陷',hp:1.35,dmg:1.25,extra:1,wave:40,loot:1.6},{name:'三级 · 深渊',hp:1.8,dmg:1.5,extra:2,wave:32,loot:2.5}],
  // 战舰工坊升级：cost 每级花费的物资，rare 每级花费的圣物
  upgrades:[
    {id:'armor', name:'强化甲片',  desc:'最大生命 +15',             max:3,cost:[4,8,14]},
    {id:'blade', name:'精锻刃',    desc:'近战伤害 +15%',            max:3,cost:[5,10,16]},
    {id:'mag',   name:'扩容弹匣',  desc:'爆弹枪 / 霰弹枪弹匣 +30%，开局备弹 +30%', max:2,cost:[6,12]},
    {id:'melta', name:'热熔聚焦器',desc:'热熔枪伤害 +20%',          max:2,cost:[6,12]},
    {id:'beacon',name:'备用回收装置',desc:'每局回收装置 +1 次',      max:1,cost:[10]},
    {id:'psy',   name:'灵能导管',  desc:'灵能上限 +25，过载上限 +20',max:2,cost:[0,0],rare:[1,2]},
    {id:'exec',  name:'嗜血圣印',  desc:'处决充能速度 +30%',        max:1,cost:[0],rare:[1]},
  ],
  amulet:{hp:25,dmg:1.2},   // 圣物护符：带一件圣物出击，属性提升；阵亡就失去它
  wave:{interval:50,size:4,bruteChance:.12,casterChance:.18},   // 刷怪潮
};
let pendingThreat=1;   // 本局威胁等级（联机时用房主的）
