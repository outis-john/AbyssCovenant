// ============================================================ 数值表（想调手感改这里就行，改完运行 python3 tools/build.py）
// hp 血量 / speed 移速（米每秒）/ dmg 伤害 / reach 攻击距离 / rate 每秒发射数 / magSize 弹匣 / res0 开局备弹 / reload 换弹秒数
// windup 抬手秒数 / slash 挥砍秒数 / cd 冷却秒数
const CFG={
  enemies:{
    imp:   {hp:60, speed:5.2,dmg:12,reach:1.7,scale:1.0,color:0x9a2a22},                 // 小恶魔
    brute: {hp:420,speed:3.0,dmg:30,reach:2.6,scale:1.7,color:0x5a1a3a},                 // 巨魔
    lord:  {hp:2600,speed:3.4,dmg:38,reach:3.4,scale:2.6,color:0x3a0c0c,boss:true},     // Boss：深渊领主
    bloater:{hp:70, speed:3.2,dmg:34,reach:2.2,scale:1.05,color:0x6a7a2a},              // 腐爆者：靠近自爆，死亡也爆炸
    hound: {hp:38, speed:8.5,dmg:10,reach:1.5,scale:.85,color:0x3a1a4a},                // 裂隙猎犬：飞快，会扑跳
    bulwark:{hp:200,speed:2.7,dmg:22,reach:1.9,scale:1.25,color:0x7a6a5a,shield:320},  // 骨盾恶魔：正面骨盾挡枪（重击 / 爆炸破盾）
    nest:  {hp:320,speed:0,  dmg:0, reach:0,  scale:1.0,color:0x6a1a2a,static:true},       // 恶魔巢穴（任务目标，会孵小恶魔）
    tanker:{hp:170,speed:2.6,dmg:6, reach:1.8,scale:1.25,color:0x5a3a22},               // 炼油厂：油罐恶魔（近距离喷火，背后中弹 ×3，死时爆成火海）
    priest:{hp:120,speed:3.2,dmg:10,reach:1.6,scale:1.05,color:0x3a2040,ranged:false},  // 教堂：堕落祭司（给周围恶魔回血加护）
    frostling:{hp:85,speed:4.6,dmg:11,reach:1.6,scale:.95,color:0x6a9ac8},              // 冰洞：冰晶恶魔（打中会减速，死时碎成冰渣）
    dblood: {hp:90, speed:7.5,dmg:16,reach:1.7,scale:1.05,color:0xb01010},              // 邪神仆从：血怒（扑杀猎手）
    ddecay: {hp:240,speed:2.4,dmg:22,reach:2.0,scale:1.35,color:0x6a7a20},              // 邪神仆从：腐朽（臃肿瘟兽）
    dexcess:{hp:60, speed:8.5,dmg:12,reach:1.6,scale:.95,color:0xd050a0},               // 邪神仆从：欲焰（迅捷舞者）
    dchange:{hp:80, speed:3.6,dmg:14,reach:1.6,scale:1.0,color:0x3070e0,ranged:true},   // 邪神仆从：万变（施法者）
    caster:{hp:90, speed:3.8,dmg:16,reach:1.6,scale:1.0,color:0x3e5a26,ranged:true},     // 瘟火术士
  },
  // Boss：砸地冲击波半径 / 伤害倍率、扇形火球数量、狂暴召唤间隔
  boss:{slamR:5,slamWind:0.9,slamCd:2.6,volley:5,volleyCd:3.8,summonEvery:14,summonN:3},
  spit:{speed:12,castTime:0.7,cooldown:[2.4,4.0],range:24,reflectMul:4},                 // 瘟火球
  guns:{
    bolter: {dmg:24, rate:7,  magSize:24,res0:120,reserveMax:192,reload:1.1,spread:.012},  // 爆弹枪
    shotgun:{dmg:16, rate:1.3,magSize:6, res0:30, reserveMax:48, reload:1.3,spread:.1,pellets:10},  // 霰弹枪
    melta:  {dmg:170,rate:1.6,range:16},                                                    // 热熔枪
    plasma: {dmg:46, rate:3,  splash:2.2},                                                  // 等离子枪（右键过充 ×3）
    hbolter:{dmg:20, rate:13, magSize:120,res0:240,reserveMax:480,reload:2.6},              // 重型爆弹机枪（转速 0→1）
    flamer: {dmg:9,  rate:12, magSize:100,res0:200,reserveMax:300,range:7},                 // 火焰喷射器（每次喷射对锥形内所有敌人）
    needle: {dmg:150,rate:1.1,magSize:5,res0:20,reserveMax:30,reload:1.8},                  // 穿甲狙击枪（穿透 3 个）
  },
  melee:{
    saw:   {dmg:35,windup:.13,slash:.17},   // 链锯剑
    power: {dmg:48,windup:.09,slash:.12},   // 力场分解剑
    ssword:{dmg:42,windup:.14,slash:.17},   // 剑盾
    hammer:{dmg:72,windup:.24,slash:.2},    // 雷殛锤
    fist:  {dmg:50,windup:.1, slash:.11},   // 破甲巨拳
    axe:   {dmg:54,windup:.16,slash:.16},   // 链锯战斧
  },
  // 深渊侵蚀：过载偏高 / 反噬 / 被灵能攻击打中会涨；满了被拖入深渊彼岸 hell 秒，活下来获得邪神赐福
  taint:{ovlRate:22,backlash:30,psyHit:8,hell:20,wave:5,waveN:3},
  heavyHold:0.28,   // 按住左键多少秒算重击
  field:{dur:8,cd:16,mul:1.6},              // 力场剑的分解力场
  psy:{lift:6,hole:10,bt:30},               // 灵能冷却：V 锁喉提摔 / G 黑洞 / Q 子弹时间
  perf:{gibs:320,bloods:650,sparks:500,puffs:250},   // 同屏碎块 / 血迹 / 火花 / 烟雾上限，卡顿就调小
  // 地图区域：tint 颜色、雾、灯光、各种敌人的出现权重
  biomes:{
    hive:   {name:'Hive Refinery',wall:0xffffff,floor:0xffffff,ceil:0xffffff,fog:0x1a120c,fogD:.038,bg:0x0e0906,hemi:[0x9a8a78,0x2a1c10],lamp:0xffa040,dark:0x1a1210,spawn:{imp:6,caster:2,bloater:2,hound:1,bulwark:1,tanker:2}},
    sanctum:{name:'Undercroft Sanctum',wall:0xffffff,floor:0xffffff,ceil:0xffffff,fog:0x2a1c10,fogD:.034,bg:0x1a1008,hemi:[0xb09070,0x302010],lamp:0xffd070,dark:0x1a1210,spawn:{imp:4,caster:4,bloater:1,hound:1,bulwark:3,priest:2}},
    frost:  {name:'Blue Ice Caverns',wall:0xffffff,floor:0xffffff,ceil:0xffffff,fog:0x8aa4bc,fogD:.06, bg:0x5a7088,hemi:[0x9ab0c8,0x203040],lamp:0x70b0ff,dark:0x5a7a9a,spawn:{imp:4,caster:1,bloater:1,hound:5,bulwark:2,frostling:3}}},
  // 威胁等级：敌人血量 / 伤害倍率、每个房间多刷几只、刷怪潮间隔、带回物资倍率
  threat:[null,{name:'I · Corruption',hp:1,dmg:1,extra:0,wave:50,loot:1},{name:'II · Fallen',hp:1.35,dmg:1.25,extra:1,wave:40,loot:1.6},{name:'III · Abyss',hp:1.8,dmg:1.5,extra:2,wave:32,loot:2.5}],
  // 战舰工坊升级：cost 每级花费的物资，rare 每级花费的圣物
  upgrades:[
    {id:'armor', name:'Reinforced Plating',  desc:'Max HP +15',             max:3,cost:[4,8,14]},
    {id:'blade', name:'Forged Edge',    desc:'Melee damage +15%',            max:3,cost:[5,10,16]},
    {id:'mag',   name:'Extended Mags',  desc:'Bolter / shotgun magazine +30%, starting ammo +30%', max:2,cost:[6,12]},
    {id:'melta', name:'Melta Focuser',desc:'Melta damage +20%',          max:2,cost:[6,12]},
    {id:'beacon',name:'Spare Recovery Beacon',desc:'+1 recovery beacon per run',      max:1,cost:[10]},
    {id:'psy',   name:'Psy Conduit',  desc:'Psy max +25, overload max +20',max:2,cost:[0,0],rare:[1,2]},
    {id:'exec',  name:'Bloodlust Seal',  desc:'Execution charge rate +30%',        max:1,cost:[0],rare:[1]},
  ],
  // 职业解锁价格（唤潮者、铸甲卫士免费）；武器熟练度：击杀数达到门槛，伤害每级 +5%
  unlockAll:true,   // 测试阶段：所有职业直接可用（改成 false 就恢复解锁价格）
  unlock:{reforged:{loot:15},bastion:{loot:25},relic:{loot:20,rare:2},walker:{rare:3},redeemer:{loot:30,rare:4}},
  mastery:[25,75,150],
  amulet:{hp:25,dmg:1.2},   // 圣物护符：带一件圣物出击，属性提升；阵亡就失去它
  wave:{interval:50,size:4,bruteChance:.12,casterChance:.18},   // 刷怪潮
};
let pendingThreat=1;   // 本局威胁等级（联机时用房主的）
