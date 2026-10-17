import type { BiomeName } from '../world/TerrainGenerator';

// 避免與 BlockRegistry 產生 ES Module 循環依賴 (Circular Dependency)，在此定義常數索引
const BlockId = {
  Air: 0,
  Grass: 1,
  Dirt: 2,
  Stone: 3,
  Cobblestone: 4,
  Sand: 5,
  Water: 6,
  OakLog: 7,
  OakLeaves: 8,
  OakPlanks: 9,
  SnowGrass: 10,
  Snow: 11,
  Glass: 12,
  Bricks: 13,
  CoalOre: 14,
  IronOre: 15,
  GoldOre: 16,
  DiamondOre: 17,
  CraftingTable: 18,
  Bookshelf: 19,
  Glowstone: 20,
  TNT: 21,
  Cactus: 22,
  BirchLog: 23,
  Bedrock: 24,
  OakDoor: 25,
  OakDoorTop: 26,
  OakDoorOpen: 27,
  OakDoorTopOpen: 28,
  Stick: 101,
  Coal: 102,
  IronIngot: 103,
  Diamond: 104,
  Gunpowder: 105,
  WoodenPickaxe: 110,
  StonePickaxe: 111,
  IronPickaxe: 112,
  DiamondPickaxe: 113,
  WoodenAxe: 114,
  IronAxe: 115,
  IronSword: 116,
  DiamondSword: 117,
  CookedPork: 120,
  Apple: 121,
  StoneAxe: 122,
  DiamondAxe: 123,
  WoodenShovel: 124,
  StoneShovel: 125,
  IronShovel: 126,
  DiamondShovel: 127,
  WoodenSword: 128,
  StoneSword: 129,
} as const;

export type Locale = 'zh-TW' | 'zh-CN' | 'en' | 'ja' | 'ko';

export const LOCALE_STORAGE_KEY = 'gminecraft_lang_v1';

export const LOCALE_OPTIONS: Array<{ code: Locale; label: string }> = [
  { code: 'zh-TW', label: '🌐 繁體中文' },
  { code: 'zh-CN', label: '🌐 简体中文' },
  { code: 'en', label: '🌐 English' },
  { code: 'ja', label: '🌐 日本語' },
  { code: 'ko', label: '🌐 한국어' },
];

export type TranslationKey =
  | 'pageTitle'
  | 'modeCreative'
  | 'modeSurvival'
  | 'flyingSuffix'
  | 'hintMove'
  | 'hintJump'
  | 'hintLeftClick'
  | 'hintRightClick'
  | 'hintInventory'
  | 'hintMode'
  | 'hintFly'
  | 'hintDayNight'
  | 'hintDebug'
  | 'dbgTimeLabel'
  | 'dbgXyzLabel'
  | 'dbgChunkLabel'
  | 'dbgBiomeLabel'
  | 'dbgTargetLabel'
  | 'dbgEntitiesLabel'
  | 'dbgModifiedLabel'
  | 'dbgNone'
  | 'btnSave'
  | 'btnSaveTitle'
  | 'btnExport'
  | 'btnExportTitle'
  | 'btnImport'
  | 'btnImportTitle'
  | 'btnReset'
  | 'btnResetTitle'
  | 'miningDefault'
  | 'emptyHand'
  | 'invTitle'
  | 'tabCatalog'
  | 'tabCrafting'
  | 'tabBag'
  | 'catalogDesc'
  | 'craftingDesc'
  | 'bagDesc'
  | 'footerTip'
  | 'emptyBagSlot'
  | 'ingredientsPrefix'
  | 'tagBlock'
  | 'tagHardness'
  | 'tagTool'
  | 'tagDamage'
  | 'tagEfficiency'
  | 'tagFood'
  | 'tagMaterial'
  | 'attrBedrock'
  | 'attrTNT'
  | 'attrDoor'
  | 'attrStone'
  | 'attrWood'
  | 'attrGlass'
  | 'attrSand'
  | 'attrGrass'
  | 'toolPickaxe'
  | 'toolAxe'
  | 'toolShovel'
  | 'toolAny'
  | 'timeNoon'
  | 'timeSunset'
  | 'timeNight'
  | 'toastDay'
  | 'toastNight'
  | 'toastGiveTnt'
  | 'toastCraftFail'
  | 'toastCraftSuccess'
  | 'toastEquipSlot'
  | 'toastSurvivalCatalogHint'
  | 'toastCreativeMode'
  | 'toastSurvivalMode'
  | 'toastNoFlyInSurvival'
  | 'toastFlyOn'
  | 'toastFlyOff'
  | 'toastDeathDrown'
  | 'toastDeathNormal'
  | 'toastDrowning'
  | 'toastDoorOpen'
  | 'toastDoorClose'
  | 'toastDoorPlaced'
  | 'toastDoorNeedSpace'
  | 'toastTntIgnited'
  | 'toastFullHealth'
  | 'toastAteFood'
  | 'toastMobBurned'
  | 'toastMobDefeated'
  | 'toastNewWorld'
  | 'toastWorldSaved'
  | 'toastWorldExported'
  | 'toastWorldImported'
  | 'toastImportFailed'
  | 'startSubtitle'
  | 'featBiomes'
  | 'featLighting'
  | 'featTnt'
  | 'featMobs'
  | 'featCrafting'
  | 'btnResumeGame'
  | 'btnToggleModeMenu'
  | 'btnToggleTimeMenu'
  | 'btnSpawnTntMenu'
  | 'ctrlMove'
  | 'ctrlFly'
  | 'ctrlBreak'
  | 'ctrlPlace'
  | 'ctrlInventory'
  | 'ctrlModeTime';

const UI_STRINGS: Record<Locale, Record<TranslationKey, string>> = {
  'zh-TW': {
    pageTitle: 'GMinecraft — 3D 體素沙盒世界',
    modeCreative: '🛠️ 創造模式 (Creative)',
    modeSurvival: '⚔️ 生存模式 (Survival)',
    flyingSuffix: ' · 🕊️ 飛行中',
    hintMove: '<kbd>WASD</kbd> 移動 (<kbd>Ctrl</kbd> 衝刺/飛行加速)',
    hintJump: '<kbd>Space</kbd> 跳躍 / 水中上浮 / 雙擊飛行',
    hintLeftClick: '<kbd>左鍵</kbd> 破壞方塊(創造一擊破/生存依屬性) / 攻擊',
    hintRightClick: '<kbd>右鍵</kbd> 放置 / 開關門 / 點燃TNT / 進食',
    hintInventory: '<kbd>E</kbd> 背包與合成',
    hintMode: '<kbd>M</kbd> 切換創造/生存',
    hintFly: '<kbd>F</kbd> 飛行開關',
    hintDayNight: '<kbd>T</kbd> 切換日夜(天亮殭屍自燃)',
    hintDebug: '<kbd>F3</kbd> 除錯資訊',
    dbgTimeLabel: '時間',
    dbgXyzLabel: '座標 XYZ',
    dbgChunkLabel: '區塊 Chunk',
    dbgBiomeLabel: '生態系',
    dbgTargetLabel: '目標方塊',
    dbgEntitiesLabel: '實體數量',
    dbgModifiedLabel: '已修改方塊',
    dbgNone: '無',
    btnSave: '💾 存檔',
    btnSaveTitle: '儲存世界進度',
    btnExport: '📤 匯出',
    btnExportTitle: '匯出世界 JSON',
    btnImport: '📥 匯入',
    btnImportTitle: '匯入世界 JSON',
    btnReset: '🔄 新世界',
    btnResetTitle: '重新生成新世界',
    miningDefault: '挖掘中...',
    emptyHand: '空手 (Hand)',
    invTitle: '🎒 背包與工作台合成',
    tabCatalog: '📦 創造物品庫',
    tabCrafting: '⚒️ 生存合成配方',
    tabBag: '🎒 背包儲物格',
    catalogDesc: '點擊任一方塊或工具，即可直接裝備至下方目前選中的快捷欄格位（或按數字鍵 1~9 指派）：',
    craftingDesc: '收集原木、石頭、礦物與沙子後，點擊可合成的配方即可製作工具、武器、光源與 TNT：',
    bagDesc: '點擊背包內的物品可與當前選中的快捷欄格位交換位置：',
    footerTip: '提示：按 <kbd>1</kbd>~<kbd>9</kbd> 可快速切換底部快捷欄目標格位',
    emptyBagSlot: '空儲物格',
    ingredientsPrefix: '材料：',
    tagBlock: '方塊',
    tagHardness: '耐久 {sec}s',
    tagTool: '工具',
    tagDamage: '傷害 {dmg}',
    tagEfficiency: '效率 {mult}x',
    tagFood: '食物',
    tagMaterial: '材料',
    attrBedrock: '基岩·不可破壞',
    attrTNT: '火藥方塊·易拆',
    attrDoor: '木製門扉·韌',
    attrStone: '岩質礦石',
    attrWood: '木質結構',
    attrGlass: '結晶玻璃',
    attrSand: '鬆散沙雪',
    attrGrass: '自然草土',
    toolPickaxe: '適用：十字鎬',
    toolAxe: '適用：斧頭',
    toolShovel: '適用：鏟子',
    toolAny: '適用：任意工具',
    timeNoon: '☀️ 正午',
    timeSunset: '🌅 黃昏/黎明',
    timeNight: '🌙 深夜',
    toastDay: '☀️ 已切換為晴朗白天',
    toastNight: '🌙 已切換為星光夜晚',
    toastGiveTnt: '🧨 已獲得 16 個 TNT 炸藥！',
    toastCraftFail: '⚠️ 材料不足！請先挖掘收集所需資源',
    toastCraftSuccess: '⚒️ 成功合成：{name} ×{count}',
    toastEquipSlot: '📦 已將「{name}」放入快捷欄第 {slot} 格',
    toastSurvivalCatalogHint: '💡 生存模式下請透過「生存合成配方」或挖掘方塊取得物品（按 M 可切換創造模式）',
    toastCreativeMode: '🛠️ 已切換為「創造模式」：無限方塊、方塊一擊即破、支援自由飛行',
    toastSurvivalMode: '⚔️ 已切換為「生存模式」：方塊具材質耐久屬性、資源收集與生命值挑戰',
    toastNoFlyInSurvival: '💡 生存模式無法飛行（按 M 切換至創造模式即可飛行）',
    toastFlyOn: '🕊️ 已開啟自由飛行 (Space 上升 / Shift 下降 / 按住 Ctrl 加速飛行)',
    toastFlyOff: '🚶 已關閉飛行模式',
    toastDeathDrown: '💀 你在水面下待太久溺水身亡！已於出生點復活',
    toastDeathNormal: '💀 你已重傷復活於出生點！',
    toastDrowning: '🫧 氧氣耗盡！頭在水面下待太久正在溺水！',
    toastDoorOpen: '🚪 已打開橡木門（可自由通行）',
    toastDoorClose: '🚪 已關上橡木門',
    toastDoorPlaced: '🚪 已放置橡木門（對門按右鍵即可開門/關門）',
    toastDoorNeedSpace: '⚠️ 門需要上下 2 格高度空間才能放置！',
    toastTntIgnited: '🧨 TNT 已點燃！快退後！',
    toastFullHealth: '❤️ 生命值與飽食度已滿！',
    toastAteFood: '🍖 食用了 {name}，回復生命與體力！',
    toastMobBurned: '☀️ {name} 在白天陽光下燃燒殆盡！掉落了戰利品',
    toastMobDefeated: '⚔️ 擊敗了 {name}！掉落了戰利品',
    toastNewWorld: '🌍 已生成全新世界！(種子碼：{seed})',
    toastWorldSaved: '💾 世界已儲存！(包含 {count} 處方塊變更)',
    toastWorldExported: '📤 已匯出世界 JSON 檔案！',
    toastWorldImported: '📥 成功匯入世界！(種子碼：{seed})',
    toastImportFailed: '⚠️ 匯入失敗：檔案格式不正確',
    startSubtitle: 'Web 3D 體素沙盒世界 · 創造與生存雙模式',
    featBiomes: '🌲 多生態無縫區塊',
    featLighting: '🌓 動態日夜與環境光 AO',
    featTnt: '🧨 可引爆 TNT 炸藥',
    featMobs: '🐷 方塊動物與夜晚怪物',
    featCrafting: '⚒️ 挖掘掉落與合成系統',
    btnResumeGame: '▶️ 點擊進入遊戲 (鎖定游標)',
    btnToggleModeMenu: '切換模式：創造 / 生存',
    btnToggleTimeMenu: '切換時間：白天 / 夜晚',
    btnSpawnTntMenu: '給予 TNT ×16',
    ctrlMove: '<b>移動 / 衝刺加速</b>：W A S D / 空白鍵跳躍 / 按住 <kbd>Ctrl</kbd> 衝刺與飛行加速',
    ctrlFly: '<b>自由飛行</b>：按 <kbd>F</kbd> 或雙擊空白鍵 (Space 上升 / Shift 下降 / Ctrl 加速)',
    ctrlBreak: '<b>破壞 / 攻擊</b>：滑鼠左鍵 (創造模式一擊破 / 生存模式依材質與工具挖掘)',
    ctrlPlace: '<b>放置 / 互動</b>：滑鼠右鍵 (開關門 / 對 TNT 按右鍵點燃，左鍵安全拆除)',
    ctrlInventory: '<b>背包與合成</b>：按 <kbd>E</kbd> 開啟物品庫與合成表（含木/石/鐵/鑽石全套工具）',
    ctrlModeTime: '<b>模式 / 日夜</b>：按 <kbd>M</kbd> 切換創造或生存 / 按 <kbd>T</kbd> 切換日夜',
  },
  'zh-CN': {
    pageTitle: 'GMinecraft — 3D 体素沙盒世界',
    modeCreative: '🛠️ 创造模式 (Creative)',
    modeSurvival: '⚔️ 生存模式 (Survival)',
    flyingSuffix: ' · 🕊️ 飞行中',
    hintMove: '<kbd>WASD</kbd> 移动 (<kbd>Ctrl</kbd> 冲刺/飞行加速)',
    hintJump: '<kbd>Space</kbd> 跳跃 / 水中上浮 / 双击飞行',
    hintLeftClick: '<kbd>左键</kbd> 破坏方块(创造一击破/生存依属性) / 攻击',
    hintRightClick: '<kbd>右键</kbd> 放置 / 开关门 / 点燃TNT / 进食',
    hintInventory: '<kbd>E</kbd> 背包与合成',
    hintMode: '<kbd>M</kbd> 切换创造/生存',
    hintFly: '<kbd>F</kbd> 飞行开关',
    hintDayNight: '<kbd>T</kbd> 切换日夜(天亮僵尸自燃)',
    hintDebug: '<kbd>F3</kbd> 调试信息',
    dbgTimeLabel: '时间',
    dbgXyzLabel: '坐标 XYZ',
    dbgChunkLabel: '区块 Chunk',
    dbgBiomeLabel: '生态系',
    dbgTargetLabel: '目标方块',
    dbgEntitiesLabel: '实体数量',
    dbgModifiedLabel: '已修改方块',
    dbgNone: '无',
    btnSave: '💾 存档',
    btnSaveTitle: '保存世界进度',
    btnExport: '📤 导出',
    btnExportTitle: '导出世界 JSON',
    btnImport: '📥 导入',
    btnImportTitle: '导入世界 JSON',
    btnReset: '🔄 新世界',
    btnResetTitle: '重新生成新世界',
    miningDefault: '挖掘中...',
    emptyHand: '空手 (Hand)',
    invTitle: '🎒 背包与工作台合成',
    tabCatalog: '📦 创造物品库',
    tabCrafting: '⚒️ 生存合成配方',
    tabBag: '🎒 背包储物格',
    catalogDesc: '点击任一方块或工具，即可直接装备至下方当前选中的快捷栏格位（或按数字键 1~9 指派）：',
    craftingDesc: '收集原木、石头、矿物与沙子后，点击可合成的配方即可制作工具、武器、光源与 TNT：',
    bagDesc: '点击背包内的物品可与当前选中的快捷栏格位交换位置：',
    footerTip: '提示：按 <kbd>1</kbd>~<kbd>9</kbd> 可快速切换底部快捷栏目标格位',
    emptyBagSlot: '空储物格',
    ingredientsPrefix: '材料：',
    tagBlock: '方块',
    tagHardness: '耐久 {sec}s',
    tagTool: '工具',
    tagDamage: '伤害 {dmg}',
    tagEfficiency: '效率 {mult}x',
    tagFood: '食物',
    tagMaterial: '材料',
    attrBedrock: '基岩·不可破坏',
    attrTNT: '火药方块·易拆',
    attrDoor: '木制门扉·韧',
    attrStone: '岩质矿石',
    attrWood: '木质结构',
    attrGlass: '结晶玻璃',
    attrSand: '松散沙雪',
    attrGrass: '自然草土',
    toolPickaxe: '适用：镐子',
    toolAxe: '适用：斧头',
    toolShovel: '适用：锹',
    toolAny: '适用：任意工具',
    timeNoon: '☀️ 正午',
    timeSunset: '🌅 黄昏/黎明',
    timeNight: '🌙 深夜',
    toastDay: '☀️ 已切换为晴朗白天',
    toastNight: '🌙 已切换为星光夜晚',
    toastGiveTnt: '🧨 已获得 16 个 TNT 炸药！',
    toastCraftFail: '⚠️ 材料不足！请先挖掘收集所需资源',
    toastCraftSuccess: '⚒️ 成功合成：{name} ×{count}',
    toastEquipSlot: '📦 已将「{name}」放入快捷栏第 {slot} 格',
    toastSurvivalCatalogHint: '💡 生存模式下请通过「生存合成配方」或挖掘方块获取物品（按 M 可切换创造模式）',
    toastCreativeMode: '🛠️ 已切换为「创造模式」：无限方块、方块一击即破、支持自由飞行',
    toastSurvivalMode: '⚔️ 已切换为「生存模式」：方块具材质耐久属性、资源收集与生命值挑战',
    toastNoFlyInSurvival: '💡 生存模式无法飞行（按 M 切换至创造模式即可飞行）',
    toastFlyOn: '🕊️ 已开启自由飞行 (Space 上升 / Shift 下降 / 按住 Ctrl 加速飞行)',
    toastFlyOff: '🚶 已关闭飞行模式',
    toastDeathDrown: '💀 你在水面下待太久溺水身亡！已于出生点复活',
    toastDeathNormal: '💀 你已重伤复活于出生点！',
    toastDrowning: '🫧 氧气耗尽！头在水面下待太久正在溺水！',
    toastDoorOpen: '🚪 已打开橡木门（可自由通行）',
    toastDoorClose: '🚪 已关上橡木门',
    toastDoorPlaced: '🚪 已放置橡木门（对门按右键即可开门/关门）',
    toastDoorNeedSpace: '⚠️ 门需要上下 2 格高度空间才能放置！',
    toastTntIgnited: '🧨 TNT 已点燃！快退后！',
    toastFullHealth: '❤️ 生命值与饱食度已满！',
    toastAteFood: '🍖 食用了 {name}，回复生命与体力！',
    toastMobBurned: '☀️ {name} 在白天阳光下燃烧殆尽！掉落了战利品',
    toastMobDefeated: '⚔️ 击败了 {name}！掉落了战利品',
    toastNewWorld: '🌍 已生成全新世界！(种子码：{seed})',
    toastWorldSaved: '💾 世界已保存！(包含 {count} 处方块变更)',
    toastWorldExported: '📤 已导出世界 JSON 文件！',
    toastWorldImported: '📥 成功导入世界！(种子码：{seed})',
    toastImportFailed: '⚠️ 导入失败：文件格式不正确',
    startSubtitle: 'Web 3D 体素沙盒世界 · 创造与生存双模式',
    featBiomes: '🌲 多生态无缝区块',
    featLighting: '🌓 动态日夜与环境光 AO',
    featTnt: '🧨 可引爆 TNT 炸药',
    featMobs: '🐷 方块动物与夜晚怪物',
    featCrafting: '⚒️ 挖掘掉落与合成系统',
    btnResumeGame: '▶️ 点击进入游戏 (锁定光标)',
    btnToggleModeMenu: '切换模式：创造 / 生存',
    btnToggleTimeMenu: '切换时间：白天 / 夜晚',
    btnSpawnTntMenu: '给予 TNT ×16',
    ctrlMove: '<b>移动 / 冲刺加速</b>：W A S D / 空格键跳跃 / 按住 <kbd>Ctrl</kbd> 冲刺与飞行加速',
    ctrlFly: '<b>自由飞行</b>：按 <kbd>F</kbd> 或双击空格键 (Space 上升 / Shift 下降 / Ctrl 加速)',
    ctrlBreak: '<b>破坏 / 攻击</b>：鼠标左键 (创造模式一击破 / 生存模式依材质与工具挖掘)',
    ctrlPlace: '<b>放置 / 互动</b>：鼠标右键 (开关门 / 对 TNT 按右键点燃，左键安全拆除)',
    ctrlInventory: '<b>背包与合成</b>：按 <kbd>E</kbd> 开启物品库与合成表（含木/石/铁/钻石全套工具）',
    ctrlModeTime: '<b>模式 / 日夜</b>：按 <kbd>M</kbd> 切换创造或生存 / 按 <kbd>T</kbd> 切换日夜',
  },
  en: {
    pageTitle: 'GMinecraft — 3D Voxel Sandbox World',
    modeCreative: '🛠️ Creative Mode',
    modeSurvival: '⚔️ Survival Mode',
    flyingSuffix: ' · 🕊️ Flying',
    hintMove: '<kbd>WASD</kbd> Move (<kbd>Ctrl</kbd> Sprint/Boost)',
    hintJump: '<kbd>Space</kbd> Jump / Swim / Double-tap Fly',
    hintLeftClick: '<kbd>L-Click</kbd> Mine Block / Attack',
    hintRightClick: '<kbd>R-Click</kbd> Place / Door / Ignite TNT / Eat',
    hintInventory: '<kbd>E</kbd> Inventory & Craft',
    hintMode: '<kbd>M</kbd> Creative / Survival',
    hintFly: '<kbd>F</kbd> Toggle Fly',
    hintDayNight: '<kbd>T</kbd> Day / Night',
    hintDebug: '<kbd>F3</kbd> Debug Info',
    dbgTimeLabel: 'Time',
    dbgXyzLabel: 'Pos XYZ',
    dbgChunkLabel: 'Chunk',
    dbgBiomeLabel: 'Biome',
    dbgTargetLabel: 'Target',
    dbgEntitiesLabel: 'Entities',
    dbgModifiedLabel: 'Modified Blocks',
    dbgNone: 'None',
    btnSave: '💾 Save',
    btnSaveTitle: 'Save World Progress',
    btnExport: '📤 Export',
    btnExportTitle: 'Export World JSON',
    btnImport: '📥 Import',
    btnImportTitle: 'Import World JSON',
    btnReset: '🔄 New World',
    btnResetTitle: 'Generate New World',
    miningDefault: 'Mining...',
    emptyHand: 'Empty Hand',
    invTitle: '🎒 Inventory & Crafting',
    tabCatalog: '📦 Creative Catalog',
    tabCrafting: '⚒️ Survival Crafting',
    tabBag: '🎒 Backpack Slots',
    catalogDesc: 'Click any block or tool to equip it into your selected hotbar slot (or press 1~9):',
    craftingDesc: 'Gather logs, stone, ores, and sand, then click a recipe to craft tools, weapons, lights, and TNT:',
    bagDesc: 'Click any item in your backpack to swap it with the currently selected hotbar slot:',
    footerTip: 'Tip: Press <kbd>1</kbd>~<kbd>9</kbd> to quickly select your active hotbar slot',
    emptyBagSlot: 'Empty Slot',
    ingredientsPrefix: 'Needs: ',
    tagBlock: 'Block',
    tagHardness: 'Hardness {sec}s',
    tagTool: 'Tool',
    tagDamage: 'DMG {dmg}',
    tagEfficiency: 'Speed {mult}x',
    tagFood: 'Food',
    tagMaterial: 'Material',
    attrBedrock: 'Bedrock · Unbreakable',
    attrTNT: 'Explosive · Fragile',
    attrDoor: 'Wooden Door · Sturdy',
    attrStone: 'Rock & Ore',
    attrWood: 'Timber Wood',
    attrGlass: 'Crystal Glass',
    attrSand: 'Loose Sand/Snow',
    attrGrass: 'Soil & Turf',
    toolPickaxe: 'Best: Pickaxe',
    toolAxe: 'Best: Axe',
    toolShovel: 'Best: Shovel',
    toolAny: 'Best: Any Tool',
    timeNoon: '☀️ Noon',
    timeSunset: '🌅 Dusk/Dawn',
    timeNight: '🌙 Midnight',
    toastDay: '☀️ Switched to Sunny Day',
    toastNight: '🌙 Switched to Starry Night',
    toastGiveTnt: '🧨 Received 16× TNT!',
    toastCraftFail: '⚠️ Not enough materials! Mine resources first',
    toastCraftSuccess: '⚒️ Crafted: {name} ×{count}',
    toastEquipSlot: '📦 Equipped "{name}" to Hotbar Slot #{slot}',
    toastSurvivalCatalogHint: '💡 In Survival Mode, craft items or mine blocks (Press M for Creative Mode)',
    toastCreativeMode: '🛠️ Switched to Creative Mode: Infinite blocks, instant break & free flight',
    toastSurvivalMode: '⚔️ Switched to Survival Mode: Block hardness, resource gathering & health',
    toastNoFlyInSurvival: '💡 Cannot fly in Survival Mode (Press M to switch to Creative Mode)',
    toastFlyOn: '🕊️ Free Flight ON (Space Up / Shift Down / Hold Ctrl to Boost)',
    toastFlyOff: '🚶 Free Flight OFF',
    toastDeathDrown: '💀 You drowned underwater! Respawned at spawn point',
    toastDeathNormal: '💀 You died and respawned at the spawn point!',
    toastDrowning: '🫧 Out of oxygen! You are drowning underwater!',
    toastDoorOpen: '🚪 Opened Oak Door',
    toastDoorClose: '🚪 Closed Oak Door',
    toastDoorPlaced: '🚪 Placed Oak Door (Right-click to open/close)',
    toastDoorNeedSpace: '⚠️ Door requires 2 blocks of vertical space!',
    toastTntIgnited: '🧨 TNT Ignited! Stand back!',
    toastFullHealth: '❤️ Health and Hunger are already full!',
    toastAteFood: '🍖 Ate {name}, restored health & hunger!',
    toastMobBurned: '☀️ {name} burned up in daylight and dropped loot!',
    toastMobDefeated: '⚔️ Defeated {name} and got loot!',
    toastNewWorld: '🌍 Generated new world! (Seed: {seed})',
    toastWorldSaved: '💾 World saved! ({count} modified blocks)',
    toastWorldExported: '📤 Exported world JSON file!',
    toastWorldImported: '📥 Imported world! (Seed: {seed})',
    toastImportFailed: '⚠️ Import failed: Invalid file format',
    startSubtitle: 'Web 3D Voxel Sandbox · Creative & Survival Modes',
    featBiomes: '🌲 Multi-Biome Chunks',
    featLighting: '🌓 Dynamic Day/Night & AO',
    featTnt: '🧨 Explosive TNT',
    featMobs: '🐷 Passive & Hostile Mobs',
    featCrafting: '⚒️ Mining Drops & Crafting',
    btnResumeGame: '▶️ Click to Enter Game (Lock Cursor)',
    btnToggleModeMenu: 'Mode: Creative / Survival',
    btnToggleTimeMenu: 'Time: Day / Night',
    btnSpawnTntMenu: 'Give TNT ×16',
    ctrlMove: '<b>Move / Sprint</b>: W A S D / Space to Jump / Hold <kbd>Ctrl</kbd> to Sprint or Boost Fly',
    ctrlFly: '<b>Free Flight</b>: Press <kbd>F</kbd> or Double-tap Space (Space Up / Shift Down / Ctrl Boost)',
    ctrlBreak: '<b>Mine / Attack</b>: Left Click (Instant in Creative / Tool-based in Survival)',
    ctrlPlace: '<b>Place / Interact</b>: Right Click (Open Doors / Ignite TNT, Left Click to defuse)',
    ctrlInventory: '<b>Inventory & Craft</b>: Press <kbd>E</kbd> for Catalog & Recipes (Wood/Stone/Iron/Diamond tools)',
    ctrlModeTime: '<b>Mode / Time</b>: Press <kbd>M</kbd> for Creative/Survival / Press <kbd>T</kbd> for Day/Night',
  },
  ja: {
    pageTitle: 'GMinecraft — 3D ボクセルサンドボックス',
    modeCreative: '🛠️ クリエイティブ (Creative)',
    modeSurvival: '⚔️ サバイバル (Survival)',
    flyingSuffix: ' · 🕊️ 飛行中',
    hintMove: '<kbd>WASD</kbd> 移動 (<kbd>Ctrl</kbd> ダッシュ/加速)',
    hintJump: '<kbd>Space</kbd> ジャンプ / 浮上 / 2回押し飛行',
    hintLeftClick: '<kbd>左クリック</kbd> 破壊 / 攻撃',
    hintRightClick: '<kbd>右クリック</kbd> 設置 / ドア開閉 / TNT着火 / 食事',
    hintInventory: '<kbd>E</kbd> バッグ＆クラフト',
    hintMode: '<kbd>M</kbd> モード切替',
    hintFly: '<kbd>F</kbd> 飛行切替',
    hintDayNight: '<kbd>T</kbd> 昼夜切替',
    hintDebug: '<kbd>F3</kbd> デバッグ情報',
    dbgTimeLabel: '時間',
    dbgXyzLabel: '座標 XYZ',
    dbgChunkLabel: 'チャンク',
    dbgBiomeLabel: 'バイオーム',
    dbgTargetLabel: '対象ブロック',
    dbgEntitiesLabel: 'エンティティ数',
    dbgModifiedLabel: '変更ブロック数',
    dbgNone: 'なし',
    btnSave: '💾 保存',
    btnSaveTitle: 'ワールドを保存',
    btnExport: '📤 書き出し',
    btnExportTitle: 'ワールド JSON を出力',
    btnImport: '📥 読み込み',
    btnImportTitle: 'ワールド JSON を読込',
    btnReset: '🔄 新規ワールド',
    btnResetTitle: '新しいワールドを生成',
    miningDefault: '採掘中...',
    emptyHand: '素手 (Hand)',
    invTitle: '🎒 インベントリ＆作業台クラフト',
    tabCatalog: '📦 アイテム一覧',
    tabCrafting: '⚒️ サバイバル合成',
    tabBag: '🎒 バッグ収納',
    catalogDesc: 'ブロックやツールをクリックすると、選択中のホットバースロットに装備されます（1〜9キーで切替）：',
    craftingDesc: '原木・石・鉱石・砂を集めて、レシピをクリックするとツール・武器・照明・TNTを作成できます：',
    bagDesc: 'バッグ内のアイテムをクリックすると、選択中のホットバースロットと入れ替えます：',
    footerTip: 'ヒント：<kbd>1</kbd>〜<kbd>9</kbd> キーで下部のホットバースロットを素早く切り替えられます',
    emptyBagSlot: '空きスロット',
    ingredientsPrefix: '必要素材：',
    tagBlock: 'ブロック',
    tagHardness: '耐久 {sec}秒',
    tagTool: 'ツール',
    tagDamage: '攻撃力 {dmg}',
    tagEfficiency: '効率 {mult}x',
    tagFood: '食料',
    tagMaterial: '素材',
    attrBedrock: '岩盤・破壊不可',
    attrTNT: '火薬ブロック・易壊',
    attrDoor: '木製ドア・強靭',
    attrStone: '岩石・鉱石',
    attrWood: '木造構造',
    attrGlass: '結晶ガラス',
    attrSand: '砂・雪',
    attrGrass: '草土',
    toolPickaxe: '適性：ツルハシ',
    toolAxe: '適性：斧',
    toolShovel: '適性：シャベル',
    toolAny: '適性：任意',
    timeNoon: '☀️ 正午',
    timeSunset: '🌅 夕暮れ/夜明け',
    timeNight: '🌙 深夜',
    toastDay: '☀️ 晴れた昼間に切り替えました',
    toastNight: '🌙 星空の夜に切り替えました',
    toastGiveTnt: '🧨 TNT を 16個 入手しました！',
    toastCraftFail: '⚠️ 素材が足りません！先に採掘して集めてください',
    toastCraftSuccess: '⚒️ クラフト成功：{name} ×{count}',
    toastEquipSlot: '📦 「{name}」をホットバー #{slot} にセットしました',
    toastSurvivalCatalogHint: '💡 サバイバルではクラフトまたは採掘で入手してください（Mキーでクリエイティブ切替）',
    toastCreativeMode: '🛠️ クリエイティブモード：無限ブロック・一撃破壊・自由飛行が可能',
    toastSurvivalMode: '⚔️ サバイバルモード：ブロック耐久度・資源収集・体力チャレンジ',
    toastNoFlyInSurvival: '💡 サバイバルモードでは飛行できません（Mキーでクリエイティブに切替）',
    toastFlyOn: '🕊️ 自由飛行 ON (Space 上昇 / Shift 下降 / Ctrl 高速飛行)',
    toastFlyOff: '🚶 自由飛行 OFF',
    toastDeathDrown: '💀 水中で息が切れて溺れました！スポーン地点で復活しました',
    toastDeathNormal: '💀 力尽きました！スポーン地点で復活しました',
    toastDrowning: '🫧 酸素切れ！水中で溺れています！',
    toastDoorOpen: '🚪 オークのドアを開けました',
    toastDoorClose: '🚪 オークのドアを閉めました',
    toastDoorPlaced: '🚪 オークのドアを設置しました（右クリックで開閉）',
    toastDoorNeedSpace: '⚠️ ドアの設置には縦2マスの空間が必要です！',
    toastTntIgnited: '🧨 TNT に着火しました！離れてください！',
    toastFullHealth: '❤️ 体力と満腹度はすでに満タンです！',
    toastAteFood: '🍖 {name} を食べて体力と満腹度を回復しました！',
    toastMobBurned: '☀️ {name} が日光で燃え尽き、ドロップ品を落としました！',
    toastMobDefeated: '⚔️ {name} を倒してドロップ品を入手しました！',
    toastNewWorld: '🌍 新しいワールドを生成しました！(シード値：{seed})',
    toastWorldSaved: '💾 ワールドを保存しました！(変更ブロック：{count} 箇所)',
    toastWorldExported: '📤 ワールド JSON ファイルを書き出しました！',
    toastWorldImported: '📥 ワールドを読み込みました！(シード値：{seed})',
    toastImportFailed: '⚠️ 読み込み失敗：ファイル形式が正しくありません',
    startSubtitle: 'Web 3D ボクセルサンドボックス · クリエイティブ＆サバイバル',
    featBiomes: '🌲 多彩なバイオーム生成',
    featLighting: '🌓 昼夜サイクル＆環境光 AO',
    featTnt: '🧨 起爆可能な TNT',
    featMobs: '🐷 動物＆夜のモンスター',
    featCrafting: '⚒️ 採掘ドロップ＆クラフト',
    btnResumeGame: '▶️ クリックしてゲーム開始 (カーソル固定)',
    btnToggleModeMenu: 'モード切替：クリエイティブ / サバイバル',
    btnToggleTimeMenu: '時間切替：昼 / 夜',
    btnSpawnTntMenu: 'TNT ×16 を入手',
    ctrlMove: '<b>移動 / ダッシュ</b>：W A S D / Space ジャンプ / <kbd>Ctrl</kbd> 長押しでダッシュ・加速',
    ctrlFly: '<b>自由飛行</b>：<kbd>F</kbd> または Space 2回押し (Space 上昇 / Shift 下降 / Ctrl 加速)',
    ctrlBreak: '<b>破壊 / 攻撃</b>：左クリック (クリエイティブは一撃 / サバイバルは道具と材質に応じる)',
    ctrlPlace: '<b>設置 / 操作</b>：右クリック (ドア開閉 / TNT着火、左クリックで安全回収)',
    ctrlInventory: '<b>バッグ＆クラフト</b>：<kbd>E</kbd> でアイテム一覧と合成表を開く（木/石/鉄/ダイヤ装備）',
    ctrlModeTime: '<b>モード / 昼夜</b>：<kbd>M</kbd> でモード切替 / <kbd>T</kbd> で昼夜切替',
  },
  ko: {
    pageTitle: 'GMinecraft — 3D 복셀 샌드박스 월드',
    modeCreative: '🛠️ 크리에이티브 모드 (Creative)',
    modeSurvival: '⚔️ 서바이벌 모드 (Survival)',
    flyingSuffix: ' · 🕊️ 비행 중',
    hintMove: '<kbd>WASD</kbd> 이동 (<kbd>Ctrl</kbd> 달리기/가속)',
    hintJump: '<kbd>Space</kbd> 점프 / 수영 / 두 번 눌러 비행',
    hintLeftClick: '<kbd>좌클릭</kbd> 블록 파괴 / 공격',
    hintRightClick: '<kbd>우클릭</kbd> 배치 / 문 개폐 / TNT 점화 / 식사',
    hintInventory: '<kbd>E</kbd> 가방 및 제작',
    hintMode: '<kbd>M</kbd> 모드 전환',
    hintFly: '<kbd>F</kbd> 비행 전환',
    hintDayNight: '<kbd>T</kbd> 낮/밤 전환',
    hintDebug: '<kbd>F3</kbd> 디버그 정보',
    dbgTimeLabel: '시간',
    dbgXyzLabel: '좌표 XYZ',
    dbgChunkLabel: '청크',
    dbgBiomeLabel: '바이옴',
    dbgTargetLabel: '대상 블록',
    dbgEntitiesLabel: '엔티티 수',
    dbgModifiedLabel: '수정된 블록',
    dbgNone: '없음',
    btnSave: '💾 저장',
    btnSaveTitle: '월드 진행 상황 저장',
    btnExport: '📤 내보내기',
    btnExportTitle: '월드 JSON 내보내기',
    btnImport: '📥 불러오기',
    btnImportTitle: '월드 JSON 불러오기',
    btnReset: '🔄 새 월드',
    btnResetTitle: '새로운 월드 생성',
    miningDefault: '채굴 중...',
    emptyHand: '맨손 (Hand)',
    invTitle: '🎒 인벤토리 및 작업대 제작',
    tabCatalog: '📦 크리에이티브 카탈로그',
    tabCrafting: '⚒️ 서바이벌 제작법',
    tabBag: '🎒 가방 보관함',
    catalogDesc: '블록이나 도구를 클릭하면 아래 선택된 핫바 슬롯에 바로 장착됩니다 (숫자키 1~9로 지정):',
    craftingDesc: '원목, 돌, 광석, 모래를 모아 레시피를 클릭하면 도구, 무기, 조명, TNT를 제작할 수 있습니다:',
    bagDesc: '가방 안의 아이템을 클릭하면 현재 선택된 핫바 슬롯과 위치를 바꿉니다:',
    footerTip: '팁: 숫자키 <kbd>1</kbd>~<kbd>9</kbd>를 눌러 하단 핫바 슬롯을 빠르게 전환하세요',
    emptyBagSlot: '빈 슬롯',
    ingredientsPrefix: '재료: ',
    tagBlock: '블록',
    tagHardness: '내구 {sec}초',
    tagTool: '도구',
    tagDamage: '공격력 {dmg}',
    tagEfficiency: '효율 {mult}x',
    tagFood: '음식',
    tagMaterial: '재료',
    attrBedrock: '기반암·파괴 불가',
    attrTNT: '화약 블록·해체 쉬움',
    attrDoor: '나무 문·견고함',
    attrStone: '암석·광석',
    attrWood: '목재 구조',
    attrGlass: '결정 유리',
    attrSand: '모래·눈',
    attrGrass: '자연 잔디·흙',
    toolPickaxe: '권장: 곡괭이',
    toolAxe: '권장: 도끼',
    toolShovel: '권장: 삽',
    toolAny: '권장: 모든 도구',
    timeNoon: '☀️ 정오',
    timeSunset: '🌅 황혼/새벽',
    timeNight: '🌙 심야',
    toastDay: '☀️ 맑은 낮으로 전환되었습니다',
    toastNight: '🌙 별빛 밤으로 전환되었습니다',
    toastGiveTnt: '🧨 TNT 16개를 획득했습니다!',
    toastCraftFail: '⚠️ 재료가 부족합니다! 먼저 자원을 채굴하세요',
    toastCraftSuccess: '⚒️ 제작 성공: {name} ×{count}',
    toastEquipSlot: '📦 "{name}" 아이템을 핫바 {slot}번 슬롯에 장착했습니다',
    toastSurvivalCatalogHint: '💡 서바이벌 모드에서는 제작법이나 채굴로 아이템을 획득하세요 (M키로 모드 전환)',
    toastCreativeMode: '🛠️ 크리에이티브 모드: 무한 블록, 즉시 파괴, 자유 비행 지원',
    toastSurvivalMode: '⚔️ 서바이벌 모드: 블록 내구도, 자원 수집 및 체력 도전',
    toastNoFlyInSurvival: '💡 서바이벌 모드에서는 비행할 수 없습니다 (M키로 크리에이티브 전환)',
    toastFlyOn: '🕊️ 자유 비행 켜짐 (Space 상승 / Shift 하강 / Ctrl 가속 비행)',
    toastFlyOff: '🚶 자유 비행 꺼짐',
    toastDeathDrown: '💀 물속에 너무 오래 있어 익사했습니다! 스폰 지점에서 부활합니다',
    toastDeathNormal: '💀 쓰러져 스폰 지점에서 부활했습니다!',
    toastDrowning: '🫧 산소 고갈! 물속에서 익사하고 있습니다!',
    toastDoorOpen: '🚪 참나무 문을 열었습니다',
    toastDoorClose: '🚪 참나무 문을 닫았습니다',
    toastDoorPlaced: '🚪 참나무 문을 설치했습니다 (우클릭으로 개폐)',
    toastDoorNeedSpace: '⚠️ 문을 설치하려면 위아래 2칸의 공간이 필요합니다!',
    toastTntIgnited: '🧨 TNT가 점화되었습니다! 뒤로 물러서세요!',
    toastFullHealth: '❤️ 체력과 포만감이 이미 가득 찼습니다!',
    toastAteFood: '🍖 {name} 섭취! 체력과 포만감을 회복했습니다!',
    toastMobBurned: '☀️ {name} 몬스터가 햇빛에 불타 전리품을 떨어뜨렸습니다!',
    toastMobDefeated: '⚔️ {name} 처치 완료! 전리품을 획득했습니다',
    toastNewWorld: '🌍 새로운 월드를 생성했습니다! (시드: {seed})',
    toastWorldSaved: '💾 월드가 저장되었습니다! (블록 변경 {count}곳)',
    toastWorldExported: '📤 월드 JSON 파일을 내보냈습니다!',
    toastWorldImported: '📥 월드를 성공적으로 불러왔습니다! (시드: {seed})',
    toastImportFailed: '⚠️ 불러오기 실패: 올바르지 않은 파일 형식입니다',
    startSubtitle: 'Web 3D 복셀 샌드박스 · 크리에이티브 & 서바이벌 모드',
    featBiomes: '🌲 다중 바이옴 심리스 청크',
    featLighting: '🌓 낮/밤 사이클 & AO 조명',
    featTnt: '🧨 폭발하는 TNT 다이너마이트',
    featMobs: '🐷 동물 & 밤의 몬스터 AI',
    featCrafting: '⚒️ 채굴 드롭 & 제작 시스템',
    btnResumeGame: '▶️ 클릭하여 게임 시작 (커서 잠금)',
    btnToggleModeMenu: '모드 전환: 크리에이티브 / 서바이벌',
    btnToggleTimeMenu: '시간 전환: 낮 / 밤',
    btnSpawnTntMenu: 'TNT ×16 지급',
    ctrlMove: '<b>이동 / 질주</b>: W A S D / Space 점프 / <kbd>Ctrl</kbd> 누른 채로 질주 및 비행 가속',
    ctrlFly: '<b>자유 비행</b>: <kbd>F</kbd> 또는 Space 두 번 누르기 (Space 상승 / Shift 하강 / Ctrl 가속)',
    ctrlBreak: '<b>파괴 / 공격</b>: 좌클릭 (크리에이티브 즉시 파괴 / 서바이벌 재질 및 도구별 채굴)',
    ctrlPlace: '<b>배치 / 상호작용</b>: 우클릭 (문 개폐 / TNT 우클릭 점화, 좌클릭 안전 해체)',
    ctrlInventory: '<b>가방 및 제작</b>: <kbd>E</kbd> 키로 카탈로그 및 제작표 열기 (나무/돌/철/다이아 도구)',
    ctrlModeTime: '<b>모드 / 낮밤</b>: <kbd>M</kbd> 모드 전환 / <kbd>T</kbd> 낮/밤 전환',
  },
};

const ITEM_NAMES: Record<Locale, Record<number, string>> = {
  'zh-TW': {
    [BlockId.Air]: '空氣',
    [BlockId.Grass]: '草地方塊',
    [BlockId.Dirt]: '泥土',
    [BlockId.Stone]: '石頭',
    [BlockId.Cobblestone]: '鵝卵石',
    [BlockId.Sand]: '沙子',
    [BlockId.Water]: '水方塊',
    [BlockId.OakLog]: '橡木原木',
    [BlockId.OakLeaves]: '橡木樹葉',
    [BlockId.OakPlanks]: '橡木木板',
    [BlockId.SnowGrass]: '覆雪草地',
    [BlockId.Snow]: '雪塊',
    [BlockId.Glass]: '透明玻璃',
    [BlockId.Bricks]: '紅磚塊',
    [BlockId.CoalOre]: '煤礦石',
    [BlockId.IronOre]: '鐵礦石 (掉落鐵錠)',
    [BlockId.GoldOre]: '金礦石',
    [BlockId.DiamondOre]: '鑽石礦石',
    [BlockId.CraftingTable]: '工作台',
    [BlockId.Bookshelf]: '書櫃',
    [BlockId.Glowstone]: '發光螢光石',
    [BlockId.TNT]: '🧨 TNT 炸藥 (右鍵點燃 / 左鍵拆除)',
    [BlockId.Cactus]: '仙人掌',
    [BlockId.BirchLog]: '樺木原木',
    [BlockId.Bedrock]: '基岩',
    [BlockId.OakDoor]: '🚪 橡木門 (右鍵開關)',
    [BlockId.OakDoorTop]: '🚪 橡木門 (右鍵開關)',
    [BlockId.OakDoorOpen]: '🚪 橡木門 [開啟中]',
    [BlockId.OakDoorTopOpen]: '🚪 橡木門 [開啟中]',
    [BlockId.Stick]: '木棒',
    [BlockId.Coal]: '煤炭',
    [BlockId.IronIngot]: '鐵錠',
    [BlockId.Diamond]: '鑽石',
    [BlockId.Gunpowder]: '火藥',
    [BlockId.WoodenPickaxe]: '木鎬 (挖礦 ×2.2)',
    [BlockId.StonePickaxe]: '石鎬 (挖礦 ×3.5)',
    [BlockId.IronPickaxe]: '鐵鎬 (挖礦 ×5.5)',
    [BlockId.DiamondPickaxe]: '鑽石鎬 (挖礦 ×9.0)',
    [BlockId.WoodenAxe]: '木斧 (伐木 ×2.4)',
    [BlockId.StoneAxe]: '石斧 (伐木 ×3.8)',
    [BlockId.IronAxe]: '鐵斧 (伐木 ×6.0)',
    [BlockId.DiamondAxe]: '鑽石斧 (伐木 ×9.0)',
    [BlockId.WoodenShovel]: '木鏟 (掘土 ×2.4)',
    [BlockId.StoneShovel]: '石鏟 (掘土 ×3.8)',
    [BlockId.IronShovel]: '鐵鏟 (掘土 ×6.0)',
    [BlockId.DiamondShovel]: '鑽石鏟 (掘土 ×9.0)',
    [BlockId.WoodenSword]: '木劍 (攻擊 5)',
    [BlockId.StoneSword]: '石劍 (攻擊 6)',
    [BlockId.IronSword]: '鐵劍 (攻擊 8)',
    [BlockId.DiamondSword]: '鑽石劍 (攻擊 11)',
    [BlockId.CookedPork]: '香烤豬排 (右鍵回復 4❤️)',
    [BlockId.Apple]: '紅蘋果 (右鍵回復 2❤️)',
  },
  'zh-CN': {
    [BlockId.Air]: '空气',
    [BlockId.Grass]: '草地方块',
    [BlockId.Dirt]: '泥土',
    [BlockId.Stone]: '石头',
    [BlockId.Cobblestone]: '圆石',
    [BlockId.Sand]: '沙子',
    [BlockId.Water]: '水方块',
    [BlockId.OakLog]: '橡木原木',
    [BlockId.OakLeaves]: '橡木树叶',
    [BlockId.OakPlanks]: '橡木木板',
    [BlockId.SnowGrass]: '覆雪草地',
    [BlockId.Snow]: '雪块',
    [BlockId.Glass]: '透明玻璃',
    [BlockId.Bricks]: '红砖块',
    [BlockId.CoalOre]: '煤矿石',
    [BlockId.IronOre]: '铁矿石 (掉落铁锭)',
    [BlockId.GoldOre]: '金矿石',
    [BlockId.DiamondOre]: '钻石矿石',
    [BlockId.CraftingTable]: '工作台',
    [BlockId.Bookshelf]: '书架',
    [BlockId.Glowstone]: '发光萤石',
    [BlockId.TNT]: '🧨 TNT 炸药 (右键点燃 / 左键拆除)',
    [BlockId.Cactus]: '仙人掌',
    [BlockId.BirchLog]: '白桦原木',
    [BlockId.Bedrock]: '基岩',
    [BlockId.OakDoor]: '🚪 橡木门 (右键开关)',
    [BlockId.OakDoorTop]: '🚪 橡木门 (右键开关)',
    [BlockId.OakDoorOpen]: '🚪 橡木门 [开启中]',
    [BlockId.OakDoorTopOpen]: '🚪 橡木门 [开启中]',
    [BlockId.Stick]: '木棍',
    [BlockId.Coal]: '煤炭',
    [BlockId.IronIngot]: '铁锭',
    [BlockId.Diamond]: '钻石',
    [BlockId.Gunpowder]: '火药',
    [BlockId.WoodenPickaxe]: '木镐 (挖矿 ×2.2)',
    [BlockId.StonePickaxe]: '石镐 (挖矿 ×3.5)',
    [BlockId.IronPickaxe]: '铁镐 (挖矿 ×5.5)',
    [BlockId.DiamondPickaxe]: '钻石镐 (挖矿 ×9.0)',
    [BlockId.WoodenAxe]: '木斧 (伐木 ×2.4)',
    [BlockId.StoneAxe]: '石斧 (伐木 ×3.8)',
    [BlockId.IronAxe]: '铁斧 (伐木 ×6.0)',
    [BlockId.DiamondAxe]: '钻石斧 (伐木 ×9.0)',
    [BlockId.WoodenShovel]: '木锹 (掘土 ×2.4)',
    [BlockId.StoneShovel]: '石锹 (掘土 ×3.8)',
    [BlockId.IronShovel]: '铁锹 (掘土 ×6.0)',
    [BlockId.DiamondShovel]: '钻石锹 (掘土 ×9.0)',
    [BlockId.WoodenSword]: '木剑 (攻击 5)',
    [BlockId.StoneSword]: '石剑 (攻击 6)',
    [BlockId.IronSword]: '铁剑 (攻击 8)',
    [BlockId.DiamondSword]: '钻石剑 (攻击 11)',
    [BlockId.CookedPork]: '熟猪排 (右键回复 4❤️)',
    [BlockId.Apple]: '红苹果 (右键回复 2❤️)',
  },
  en: {
    [BlockId.Air]: 'Air',
    [BlockId.Grass]: 'Grass Block',
    [BlockId.Dirt]: 'Dirt',
    [BlockId.Stone]: 'Stone',
    [BlockId.Cobblestone]: 'Cobblestone',
    [BlockId.Sand]: 'Sand',
    [BlockId.Water]: 'Water',
    [BlockId.OakLog]: 'Oak Log',
    [BlockId.OakLeaves]: 'Oak Leaves',
    [BlockId.OakPlanks]: 'Oak Planks',
    [BlockId.SnowGrass]: 'Snowy Grass',
    [BlockId.Snow]: 'Snow Block',
    [BlockId.Glass]: 'Glass',
    [BlockId.Bricks]: 'Bricks',
    [BlockId.CoalOre]: 'Coal Ore',
    [BlockId.IronOre]: 'Iron Ore (Drops Ingot)',
    [BlockId.GoldOre]: 'Gold Ore',
    [BlockId.DiamondOre]: 'Diamond Ore',
    [BlockId.CraftingTable]: 'Crafting Table',
    [BlockId.Bookshelf]: 'Bookshelf',
    [BlockId.Glowstone]: 'Glowstone',
    [BlockId.TNT]: '🧨 TNT (R-Click Ignite / L-Click Break)',
    [BlockId.Cactus]: 'Cactus',
    [BlockId.BirchLog]: 'Birch Log',
    [BlockId.Bedrock]: 'Bedrock',
    [BlockId.OakDoor]: '🚪 Oak Door (R-Click Toggle)',
    [BlockId.OakDoorTop]: '🚪 Oak Door (R-Click Toggle)',
    [BlockId.OakDoorOpen]: '🚪 Oak Door [Open]',
    [BlockId.OakDoorTopOpen]: '🚪 Oak Door [Open]',
    [BlockId.Stick]: 'Stick',
    [BlockId.Coal]: 'Coal',
    [BlockId.IronIngot]: 'Iron Ingot',
    [BlockId.Diamond]: 'Diamond',
    [BlockId.Gunpowder]: 'Gunpowder',
    [BlockId.WoodenPickaxe]: 'Wooden Pickaxe (Mine ×2.2)',
    [BlockId.StonePickaxe]: 'Stone Pickaxe (Mine ×3.5)',
    [BlockId.IronPickaxe]: 'Iron Pickaxe (Mine ×5.5)',
    [BlockId.DiamondPickaxe]: 'Diamond Pickaxe (Mine ×9.0)',
    [BlockId.WoodenAxe]: 'Wooden Axe (Chop ×2.4)',
    [BlockId.StoneAxe]: 'Stone Axe (Chop ×3.8)',
    [BlockId.IronAxe]: 'Iron Axe (Chop ×6.0)',
    [BlockId.DiamondAxe]: 'Diamond Axe (Chop ×9.0)',
    [BlockId.WoodenShovel]: 'Wooden Shovel (Dig ×2.4)',
    [BlockId.StoneShovel]: 'Stone Shovel (Dig ×3.8)',
    [BlockId.IronShovel]: 'Iron Shovel (Dig ×6.0)',
    [BlockId.DiamondShovel]: 'Diamond Shovel (Dig ×9.0)',
    [BlockId.WoodenSword]: 'Wooden Sword (ATK 5)',
    [BlockId.StoneSword]: 'Stone Sword (ATK 6)',
    [BlockId.IronSword]: 'Iron Sword (ATK 8)',
    [BlockId.DiamondSword]: 'Diamond Sword (ATK 11)',
    [BlockId.CookedPork]: 'Cooked Porkchop (R-Click +4❤️)',
    [BlockId.Apple]: 'Red Apple (R-Click +2❤️)',
  },
  ja: {
    [BlockId.Air]: '空気',
    [BlockId.Grass]: '草ブロック',
    [BlockId.Dirt]: '土',
    [BlockId.Stone]: '石',
    [BlockId.Cobblestone]: '丸石',
    [BlockId.Sand]: '砂',
    [BlockId.Water]: '水ブロック',
    [BlockId.OakLog]: 'オークの原木',
    [BlockId.OakLeaves]: 'オークの葉',
    [BlockId.OakPlanks]: 'オークの板材',
    [BlockId.SnowGrass]: '雪付きの草ブロック',
    [BlockId.Snow]: '雪ブロック',
    [BlockId.Glass]: 'ガラス',
    [BlockId.Bricks]: 'レンガ',
    [BlockId.CoalOre]: '石炭鉱石',
    [BlockId.IronOre]: '鉄鉱石 (鉄インゴット)',
    [BlockId.GoldOre]: '金鉱石',
    [BlockId.DiamondOre]: 'ダイヤモンド鉱石',
    [BlockId.CraftingTable]: '作業台',
    [BlockId.Bookshelf]: '本棚',
    [BlockId.Glowstone]: 'グロウストーン',
    [BlockId.TNT]: '🧨 TNT (右クリック着火 / 左クリック回収)',
    [BlockId.Cactus]: 'サボテン',
    [BlockId.BirchLog]: 'シラカバの原木',
    [BlockId.Bedrock]: '岩盤',
    [BlockId.OakDoor]: '🚪 オークのドア (右クリック開閉)',
    [BlockId.OakDoorTop]: '🚪 オークのドア (右クリック開閉)',
    [BlockId.OakDoorOpen]: '🚪 オークのドア [開]',
    [BlockId.OakDoorTopOpen]: '🚪 オークのドア [開]',
    [BlockId.Stick]: '棒',
    [BlockId.Coal]: '石炭',
    [BlockId.IronIngot]: '鉄インゴット',
    [BlockId.Diamond]: 'ダイヤモンド',
    [BlockId.Gunpowder]: '火薬',
    [BlockId.WoodenPickaxe]: '木のツルハシ (採掘 ×2.2)',
    [BlockId.StonePickaxe]: '石のツルハシ (採掘 ×3.5)',
    [BlockId.IronPickaxe]: '鉄のツルハシ (採掘 ×5.5)',
    [BlockId.DiamondPickaxe]: 'ダイヤのツルハシ (採掘 ×9.0)',
    [BlockId.WoodenAxe]: '木の斧 (伐採 ×2.4)',
    [BlockId.StoneAxe]: '石の斧 (伐採 ×3.8)',
    [BlockId.IronAxe]: '鉄の斧 (伐採 ×6.0)',
    [BlockId.DiamondAxe]: 'ダイヤの斧 (伐採 ×9.0)',
    [BlockId.WoodenShovel]: '木のシャベル (掘削 ×2.4)',
    [BlockId.StoneShovel]: '石のシャベル (掘削 ×3.8)',
    [BlockId.IronShovel]: '鉄のシャベル (掘削 ×6.0)',
    [BlockId.DiamondShovel]: 'ダイヤのシャベル (掘削 ×9.0)',
    [BlockId.WoodenSword]: '木の剣 (攻撃 5)',
    [BlockId.StoneSword]: '石の剣 (攻撃 6)',
    [BlockId.IronSword]: '鉄の剣 (攻撃 8)',
    [BlockId.DiamondSword]: 'ダイヤの剣 (攻撃 11)',
    [BlockId.CookedPork]: '焼き豚 (右クリック +4❤️)',
    [BlockId.Apple]: 'リンゴ (右クリック +2❤️)',
  },
  ko: {
    [BlockId.Air]: '공기',
    [BlockId.Grass]: '잔디 블록',
    [BlockId.Dirt]: '흙',
    [BlockId.Stone]: '돌',
    [BlockId.Cobblestone]: '조약돌',
    [BlockId.Sand]: '모래',
    [BlockId.Water]: '물 블록',
    [BlockId.OakLog]: '참나무 원목',
    [BlockId.OakLeaves]: '참나무 잎',
    [BlockId.OakPlanks]: '참나무 판자',
    [BlockId.SnowGrass]: '눈 덮인 잔디',
    [BlockId.Snow]: '눈 블록',
    [BlockId.Glass]: '유리',
    [BlockId.Bricks]: '벽돌 블록',
    [BlockId.CoalOre]: '석탄 광석',
    [BlockId.IronOre]: '철광석 (철 주괴 드롭)',
    [BlockId.GoldOre]: '금광석',
    [BlockId.DiamondOre]: '다이아몬드 광석',
    [BlockId.CraftingTable]: '작업대',
    [BlockId.Bookshelf]: '책장',
    [BlockId.Glowstone]: '발광석',
    [BlockId.TNT]: '🧨 TNT (우클릭 점화 / 좌클릭 해체)',
    [BlockId.Cactus]: '선인장',
    [BlockId.BirchLog]: '자작나무 원목',
    [BlockId.Bedrock]: '기반암',
    [BlockId.OakDoor]: '🚪 참나무 문 (우클릭 개폐)',
    [BlockId.OakDoorTop]: '🚪 참나무 문 (우클릭 개폐)',
    [BlockId.OakDoorOpen]: '🚪 참나무 문 [열림]',
    [BlockId.OakDoorTopOpen]: '🚪 참나무 문 [열림]',
    [BlockId.Stick]: '막대기',
    [BlockId.Coal]: '석탄',
    [BlockId.IronIngot]: '철 주괴',
    [BlockId.Diamond]: '다이아몬드',
    [BlockId.Gunpowder]: '화약',
    [BlockId.WoodenPickaxe]: '나무 곡괭이 (채굴 ×2.2)',
    [BlockId.StonePickaxe]: '돌 곡괭이 (채굴 ×3.5)',
    [BlockId.IronPickaxe]: '철 곡괭이 (채굴 ×5.5)',
    [BlockId.DiamondPickaxe]: '다이아몬드 곡괭이 (채굴 ×9.0)',
    [BlockId.WoodenAxe]: '나무 도끼 (벌목 ×2.4)',
    [BlockId.StoneAxe]: '돌 도끼 (벌목 ×3.8)',
    [BlockId.IronAxe]: '철 도끼 (벌목 ×6.0)',
    [BlockId.DiamondAxe]: '다이아몬드 도끼 (벌목 ×9.0)',
    [BlockId.WoodenShovel]: '나무 삽 (굴착 ×2.4)',
    [BlockId.StoneShovel]: '돌 삽 (굴착 ×3.8)',
    [BlockId.IronShovel]: '철 삽 (굴착 ×6.0)',
    [BlockId.DiamondShovel]: '다이아몬드 삽 (굴착 ×9.0)',
    [BlockId.WoodenSword]: '나무 검 (공격 5)',
    [BlockId.StoneSword]: '돌 검 (공격 6)',
    [BlockId.IronSword]: '철 검 (공격 8)',
    [BlockId.DiamondSword]: '다이아몬드 검 (공격 11)',
    [BlockId.CookedPork]: '구운 돼지고기 (우클릭 +4❤️)',
    [BlockId.Apple]: '사과 (우클릭 +2❤️)',
  },
};

const RECIPE_DESCS: Record<Locale, Record<string, string>> = {
  'zh-TW': {
    oak_planks: '將橡木原木分解為 4 塊建築木板',
    birch_planks: '將樺木原木分解為 4 塊建築木板',
    sticks: '製作工具握柄所需的木棒',
    crafting_table: '經典裝飾與合成工作台',
    wooden_sword: '木製防身短劍，基礎近戰武器',
    wooden_pickaxe: '初階採礦工具，加速挖掘石頭與煤礦',
    wooden_axe: '初階伐木斧，加速砍伐樹木與木製品',
    wooden_shovel: '初階木鏟，加速挖掘泥土、草地、沙子與雪塊',
    stone_sword: '厚重石劍，提升對怪物的近戰傷害',
    stone_pickaxe: '堅固的石製十字鎬，大幅提升挖礦速度',
    stone_axe: '石製伐木斧，快速砍樹與破壞木門木板',
    stone_shovel: '耐用石鏟，快速整地挖掘沙土與覆雪',
    iron_sword: '鋒利鐵劍，對付夜晚殭屍與史萊姆的主力武器',
    iron_pickaxe: '高效率鐵鎬，輕鬆開採深層礦脈',
    iron_axe: '鋒利的鐵斧，極速砍樹並具高攻擊力',
    iron_shovel: '高效率鐵鏟，瞬間鏟除泥土與沙丘',
    diamond_sword: '傳說級鑽石寶劍，最高近戰傷害',
    diamond_pickaxe: '頂級神兵十字鎬，極速破壞任何岩石礦脈',
    diamond_axe: '頂級鑽石戰斧，砍樹與破門速度最快',
    diamond_shovel: '頂級鑽石寶鏟，極速挖掘一切草土沙雪',
    oak_door: '雙層高度的木門，放置後按滑鼠右鍵即可自由開門與關門',
    glass_block: '用煤炭燒製沙子成為清澈透明玻璃',
    glowstone_block: '合成會在夜晚發光的螢光石燈',
    bricks_block: '利用泥土與石頭燒製堅固紅磚塊',
    bookshelf_block: '精緻的木質書櫃裝飾方塊',
    tnt_block: '高爆性 TNT 炸藥！放置後按右鍵點燃引爆',
  },
  'zh-CN': {
    oak_planks: '将橡木原木分解为 4 块建筑木板',
    birch_planks: '将白桦原木分解为 4 块建筑木板',
    sticks: '制作工具握柄所需的木棍',
    crafting_table: '经典装饰与合成工作台',
    wooden_sword: '木制防身短剑，基础近战武器',
    wooden_pickaxe: '初阶采矿工具，加速挖掘石头与煤矿',
    wooden_axe: '初阶伐木斧，加速砍伐树木与木制品',
    wooden_shovel: '初阶木锹，加速挖掘泥土、草地、沙子与雪块',
    stone_sword: '厚重石剑，提升对怪物的近战伤害',
    stone_pickaxe: '坚固的石制镐子，大幅提升挖矿速度',
    stone_axe: '石制伐木斧，快速砍树与破坏木门木板',
    stone_shovel: '耐用石锹，快速整地挖掘沙土与覆雪',
    iron_sword: '锋利铁剑，对付夜晚僵尸与史莱姆的主力武器',
    iron_pickaxe: '高效率铁镐，轻松开采深层矿脉',
    iron_axe: '锋利的铁斧，极速砍树并具高攻击力',
    iron_shovel: '高效率铁锹，瞬间铲除泥土与沙丘',
    diamond_sword: '传说级钻石宝剑，最高近战伤害',
    diamond_pickaxe: '顶级神兵十字镐，极速破坏任何岩石矿脉',
    diamond_axe: '顶级钻石战斧，砍树与破门速度最快',
    diamond_shovel: '顶级钻石宝锹，极速挖掘一切草土沙雪',
    oak_door: '双层高度的木门，放置后按鼠标右键即可自由开门与关门',
    glass_block: '用煤炭烧制沙子成为清澈透明玻璃',
    glowstone_block: '合成会在夜晚发光的萤石灯',
    bricks_block: '利用泥土与石头烧制坚固红砖块',
    bookshelf_block: '精致的木质书架装饰方块',
    tnt_block: '高爆性 TNT 炸药！放置后按右键点燃引爆',
  },
  en: {
    oak_planks: 'Split an Oak Log into 4 building planks',
    birch_planks: 'Split a Birch Log into 4 building planks',
    sticks: 'Craft wooden sticks for tool handles',
    crafting_table: 'Classic decorative & crafting station',
    wooden_sword: 'Basic melee sword for self-defense',
    wooden_pickaxe: 'Starter pickaxe to mine stone & coal faster',
    wooden_axe: 'Starter axe to chop logs and wood blocks faster',
    wooden_shovel: 'Starter shovel for dirt, grass, sand, and snow',
    stone_sword: 'Heavy stone blade with higher melee damage',
    stone_pickaxe: 'Sturdy stone pickaxe with faster mining speed',
    stone_axe: 'Stone axe to quickly fell trees & wooden doors',
    stone_shovel: 'Durable stone shovel for fast terraforming',
    iron_sword: 'Sharp iron sword to fight night zombies & slimes',
    iron_pickaxe: 'High-efficiency iron pickaxe for deep ore veins',
    iron_axe: 'Sharp iron axe with fast chopping & high attack',
    iron_shovel: 'High-speed iron shovel for sand and soil',
    diamond_sword: 'Legendary diamond sword with maximum melee damage',
    diamond_pickaxe: 'Top-tier diamond pickaxe that shreds any rock or ore',
    diamond_axe: 'Top-tier diamond battleaxe for instant wood chopping',
    diamond_shovel: 'Top-tier diamond shovel for instant digging',
    oak_door: '2-block tall door; right-click after placing to open/close',
    glass_block: 'Smelt sand with coal into clear glass blocks',
    glowstone_block: 'Craft luminous Glowstone lamps that light up the night',
    bricks_block: 'Fire dirt and cobblestone into sturdy red bricks',
    bookshelf_block: 'Decorative wooden bookshelf block',
    tnt_block: 'High-explosive TNT! Right-click after placing to ignite',
  },
  ja: {
    oak_planks: 'オークの原木から建築用の板材を4個作成',
    birch_planks: 'シラカバの原木から建築用の板材を4個作成',
    sticks: 'ツールの柄に必要な木の棒を作成',
    crafting_table: '定番の作業台ブロック',
    wooden_sword: '基本的な近接武器となる木の剣',
    wooden_pickaxe: '石や石炭を素早く掘れる初級ツルハシ',
    wooden_axe: '原木や木材を素早く伐採できる初級の斧',
    wooden_shovel: '土・草・砂・雪を素早く掘れる木のシャベル',
    stone_sword: 'モンスターへのダメージが上がる石の剣',
    stone_pickaxe: '採掘速度が大きく向上する頑丈な石のツルハシ',
    stone_axe: '木やドアを素早く壊せる石の斧',
    stone_shovel: '整地に便利な耐久性の高い石のシャベル',
    iron_sword: '夜のゾンビやスライム戦で活躍する鋭い鉄の剣',
    iron_pickaxe: '深層の鉱脈も楽に掘れる高効率な鉄のツルハシ',
    iron_axe: '伐採速度と攻撃力に優れた鉄の斧',
    iron_shovel: '土や砂を一瞬で掘れる鉄のシャベル',
    diamond_sword: '最高の近接攻撃力を誇る伝説のダイヤの剣',
    diamond_pickaxe: 'あらゆる岩石・鉱石を超高速で砕く最高峰ツルハシ',
    diamond_axe: '最速で木を切り倒せる最高峰ダイヤの斧',
    diamond_shovel: '土・草・砂・雪を超高速で掘削するダイヤのシャベル',
    oak_door: '高さ2マスの木製ドア。設置後に右クリックで開閉可能',
    glass_block: '石炭と砂から透明なガラスを4個作成',
    glowstone_block: '夜を明るく照らす発光グロウストーンを合成',
    bricks_block: '土と丸石から頑丈なレンガブロックを作成',
    bookshelf_block: 'おしゃれな木製本棚の装飾ブロック',
    tnt_block: '高威力TNT爆薬！設置後に右クリックで着火・起爆',
  },
  ko: {
    oak_planks: '참나무 원목을 건축용 판자 4개로 분해합니다',
    birch_planks: '자작나무 원목을 건축용 판자 4개로 분해합니다',
    sticks: '도구 손잡이에 필요한 나무 막대기를 제작합니다',
    crafting_table: '클래식 장식 및 제작 작업대 블록',
    wooden_sword: '기초 근접 무기인 호신용 나무 검',
    wooden_pickaxe: '돌과 석탄 채굴 속도를 높여주는 초급 곡괭이',
    wooden_axe: '나무와 목재를 빠르게 베는 초급 도끼',
    wooden_shovel: '흙, 잔디, 모래, 눈을 빠르게 파는 나무 삽',
    stone_sword: '몬스터에게 더 높은 피해를 주는 묵직한 돌 검',
    stone_pickaxe: '채굴 속도를 크게 높여주는 견고한 돌 곡괭이',
    stone_axe: '나무와 나무 문을 빠르게 부수는 돌 도끼',
    stone_shovel: '빠른 평탄화 작업에 적합한 내구성 좋은 돌 삽',
    iron_sword: '밤의 좀비와 슬라임을 상대하는 주력 철 검',
    iron_pickaxe: '깊은 광맥도 쉽게 채굴하는 고효율 철 곡괭이',
    iron_axe: '빠른 벌목과 높은 공격력을 겸비한 철 도끼',
    iron_shovel: '흙과 모래언덕을 순식간에 파내는 철 삽',
    diamond_sword: '최고의 근접 공격력을 자랑하는 전설급 다이아몬드 검',
    diamond_pickaxe: '모든 암석과 광맥을 초고속으로 파괴하는 최고급 곡괭이',
    diamond_axe: '벌목과 문 파괴 속도가 가장 빠른 다이아몬드 도끼',
    diamond_shovel: '모든 흙, 잔디, 모래, 눈을 초고속으로 파는 다이아몬드 삽',
    oak_door: '2칸 높이의 나무 문. 설치 후 우클릭으로 자유롭게 개폐',
    glass_block: '석탄으로 모래를 구워 투명한 유리 블록 제작',
    glowstone_block: '밤을 환하게 밝히는 발광석 조명 블록 제작',
    bricks_block: '흙과 조약돌을 구워 견고한 붉은 벽돌 블록 제작',
    bookshelf_block: '정교한 나무 책장 장식 블록',
    tnt_block: '고폭발성 TNT! 설치 후 우클릭하면 점화 및 폭발합니다',
  },
};

const BIOME_NAMES: Record<Locale, Record<BiomeName, string>> = {
  'zh-TW': {
    翠綠平原: '翠綠平原',
    橡木森林: '橡木森林',
    黃金沙漠: '黃金沙漠',
    冰封雪原: '冰封雪原',
    高山岩峰: '高山岩峰',
  },
  'zh-CN': {
    翠綠平原: '翠绿平原',
    橡木森林: '橡木森林',
    黃金沙漠: '黄金沙漠',
    冰封雪原: '冰封雪原',
    高山岩峰: '高山岩峰',
  },
  en: {
    翠綠平原: 'Emerald Plains',
    橡木森林: 'Oak Forest',
    黃金沙漠: 'Golden Desert',
    冰封雪原: 'Frozen Tundra',
    高山岩峰: 'Alpine Peaks',
  },
  ja: {
    翠綠平原: '緑の平原',
    橡木森林: 'オークの森',
    黃金沙漠: '黄金の砂漠',
    冰封雪原: '氷雪ツンドラ',
    高山岩峰: '高山ピーク',
  },
  ko: {
    翠綠平原: '푸른 평원',
    橡木森林: '참나무 숲',
    黃金沙漠: '황금 사막',
    冰封雪原: '얼어붙은 설원',
    高山岩峰: '고산 암봉',
  },
};

const MOB_NAMES: Record<Locale, Record<'pig' | 'sheep' | 'zombie' | 'slime', string>> = {
  'zh-TW': {
    pig: '方塊小豬',
    sheep: '方塊綿羊',
    zombie: '夜晚殭屍',
    slime: '彈跳史萊姆',
  },
  'zh-CN': {
    pig: '方块小猪',
    sheep: '方块绵羊',
    zombie: '夜晚僵尸',
    slime: '弹跳史莱姆',
  },
  en: {
    pig: 'Blocky Pig',
    sheep: 'Blocky Sheep',
    zombie: 'Night Zombie',
    slime: 'Bouncy Slime',
  },
  ja: {
    pig: 'ボクセルブタ',
    sheep: 'ボクセルヒツジ',
    zombie: '夜ゾンビ',
    slime: 'バウンススライム',
  },
  ko: {
    pig: '블록 아기돼지',
    sheep: '블록 양',
    zombie: '밤의 좀비',
    slime: '통통 슬라임',
  },
};

function detectDefaultLocale(): Locale {
  try {
    const saved = localStorage.getItem(LOCALE_STORAGE_KEY) as Locale | null;
    if (saved && UI_STRINGS[saved]) {
      return saved;
    }
  } catch {
    // ignore storage errors
  }

  const nav = (navigator.language || 'zh-TW').toLowerCase();
  if (nav.startsWith('zh-cn') || nav.startsWith('zh-sg') || nav.includes('hans')) {
    return 'zh-CN';
  }
  if (nav.startsWith('zh')) {
    return 'zh-TW';
  }
  if (nav.startsWith('ja')) {
    return 'ja';
  }
  if (nav.startsWith('ko')) {
    return 'ko';
  }
  if (nav.startsWith('en')) {
    return 'en';
  }
  return 'zh-TW';
}

let currentLocale: Locale = detectDefaultLocale();
const listeners: Array<(locale: Locale) => void> = [];

export function getLocale(): Locale {
  return currentLocale;
}

export function setLocale(locale: Locale): void {
  if (!UI_STRINGS[locale]) return;
  currentLocale = locale;
  try {
    localStorage.setItem(LOCALE_STORAGE_KEY, locale);
  } catch {
    // ignore storage errors
  }
  document.documentElement.lang = locale === 'zh-TW' ? 'zh-Hant' : locale === 'zh-CN' ? 'zh-Hans' : locale;
  applyStaticDOMTranslations();
  syncLanguageSelectors();
  for (const cb of listeners) {
    cb(currentLocale);
  }
}

export function onLocaleChange(cb: (locale: Locale) => void): void {
  listeners.push(cb);
}

export function t(key: TranslationKey, params?: Record<string, string | number>): string {
  let str = UI_STRINGS[currentLocale]?.[key] ?? UI_STRINGS['zh-TW'][key] ?? key;
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      str = str.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
    }
  }
  return str;
}

export function getItemName(id: number): string {
  return ITEM_NAMES[currentLocale]?.[id] ?? ITEM_NAMES['zh-TW'][id] ?? '';
}

export function getRecipeDesc(recipeId: string, fallback: string): string {
  return RECIPE_DESCS[currentLocale]?.[recipeId] ?? fallback;
}

export function getBiomeLabel(biome: BiomeName): string {
  return BIOME_NAMES[currentLocale]?.[biome] ?? biome;
}

export function getMobName(type: 'pig' | 'sheep' | 'zombie' | 'slime'): string {
  return MOB_NAMES[currentLocale]?.[type] ?? MOB_NAMES['zh-TW'][type];
}

export function syncLanguageSelectors(): void {
  const selectors = document.querySelectorAll<HTMLSelectElement>('.lang-select');
  selectors.forEach((sel) => {
    if (sel.value !== currentLocale) {
      sel.value = currentLocale;
    }
  });
}

export function applyStaticDOMTranslations(): void {
  document.title = t('pageTitle');

  // Elements with data-i18n (textContent)
  document.querySelectorAll<HTMLElement>('[data-i18n]').forEach((el) => {
    const key = el.dataset.i18n as TranslationKey;
    if (key) {
      el.textContent = t(key);
    }
  });

  // Elements with data-i18n-html (innerHTML, e.g. containing <kbd> or <b>)
  document.querySelectorAll<HTMLElement>('[data-i18n-html]').forEach((el) => {
    const key = el.dataset.i18nHtml as TranslationKey;
    if (key) {
      el.innerHTML = t(key);
    }
  });

  // Elements with data-i18n-title (title tooltip)
  document.querySelectorAll<HTMLElement>('[data-i18n-title]').forEach((el) => {
    const key = el.dataset.i18nTitle as TranslationKey;
    if (key) {
      el.title = t(key);
    }
  });
}
