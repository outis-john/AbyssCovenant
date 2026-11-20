// ============================================================ 数值表（想调手感改这里就行，改完运行 python3 tools/build.py）
// hp 血量 / speed 移速（米每秒）/ dmg 伤害 / reach 攻击距离 / rate 每秒发射数 / magSize 弹匣 / res0 开局备弹 / reload 换弹秒数
// windup 抬手秒数 / slash 挥砍秒数 / cd 冷却秒数
const CFG={
  enemies:{
    imp:   {hp:60, speed:5.2,dmg:12,reach:1.7,scale:1.0,color:0x9a2a22},                 // 小恶魔
    brute: {hp:420,speed:3.0,dmg:30,reach:2.6,scale:1.7,color:0x5a1a3a},                 // 巨魔
    caster:{hp:90, speed:3.8,dmg:16,reach:1.6,scale:1.0,color:0x3e5a26,ranged:true},     // 瘟火术士
  },
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
  wave:{interval:50,size:4,bruteChance:.12,casterChance:.18},   // 刷怪潮
};
