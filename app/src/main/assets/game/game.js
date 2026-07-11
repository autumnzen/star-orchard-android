(() => {
  "use strict";

  const canvas = document.getElementById("game");
  const ctx = canvas.getContext("2d", { alpha: false });
  const stageFrame = document.querySelector(".stage-frame");
  const overlay = document.getElementById("overlay");
  const overlayText = document.getElementById("overlayText");
  const questTitle = document.getElementById("questTitle");
  const chapterText = document.getElementById("chapterText");
  const levelBadge = document.getElementById("levelBadge");
  const chapterProgress = document.getElementById("chapterProgress");
  const levelText = document.getElementById("levelText");
  const livesText = document.getElementById("livesText");
  const coinsText = document.getElementById("coinsText");
  const scoreText = document.getElementById("scoreText");
  const timeText = document.getElementById("timeText");
  const startBtn = document.getElementById("startBtn");
  const restartBtn = document.getElementById("restartBtn");
  const pauseBtn = document.getElementById("pauseBtn");
  const soundBtn = document.getElementById("soundBtn");
  const saveBtn = document.getElementById("saveBtn");
  const loadBtn = document.getElementById("loadBtn");
  const quickPauseBtn = document.getElementById("quickPauseBtn");
  const quickRestartBtn = document.getElementById("quickRestartBtn");
  const quickSaveBtn = document.getElementById("quickSaveBtn");
  const quickLoadBtn = document.getElementById("quickLoadBtn");
  const cueFeed = document.getElementById("cueFeed");
  const heroNameInput = document.getElementById("heroNameInput");
  const languageSelect = document.getElementById("languageSelect");
  const lightSelect = document.getElementById("lightSelect");
  const systemBtn = document.getElementById("systemBtn");
  const systemModal = document.getElementById("systemModal");
  const systemCloseBtn = document.getElementById("systemCloseBtn");
  const systemLanguageSelect = document.getElementById("systemLanguageSelect");
  const systemLightSelect = document.getElementById("systemLightSelect");
  const weatherSelect = document.getElementById("weatherSelect");
  const levelSelect = document.getElementById("levelSelect");
  const levelLockText = document.getElementById("levelLockText");

  const TILE = 32;
  const W = canvas.width;
  const H = canvas.height;
  const GROUND_Y = 448;
  const GRAVITY = 1850;
  const PLAYER_W = 25;
  const PLAYER_H = 30;
  const SAVE_UNLOCK_LEVEL = 6;
  const SAVE_UNLOCK_INDEX = SAVE_UNLOCK_LEVEL - 1;
  const SAVE_UNLOCK_CLEARED = SAVE_UNLOCK_LEVEL - 1;
  const LEVEL_SELECT_UNLOCK_LEVEL = 10;
  const LEVEL_SELECT_UNLOCK_INDEX = LEVEL_SELECT_UNLOCK_LEVEL - 1;
  const LEVEL_SELECT_UNLOCK_CLEARED = LEVEL_SELECT_UNLOCK_LEVEL - 1;
  const SETTINGS_KEY = "starOrchard.settings.v3";
  const SAVE_KEY = "starOrchard.save.v3";
  const RUN_SEED = Math.floor(Math.random() * 1000000);
  const SPRING_DURATION = 13;
  const RAGE_DURATION = 10;
  const MS_PER_DAY = 86400000;
  const SYNODIC_MONTH_DAYS = 29.530588853;
  const KNOWN_NEW_MOON_UTC = Date.UTC(2000, 0, 6, 18, 14);
  const UNIX_EPOCH_JULIAN_DAY = 2440587.5;
  const J2000_JULIAN_DAY = 2451545.0;
  // Velocity uses sqrt(2) so the actual jump height is about doubled.
  const SPRING_JUMP_MULTIPLIER = Math.SQRT2;
  const SPRING_ENEMY_SPEED_MULTIPLIER = 1.2;
  const EFFECT_EXPIRE_EPSILON = 1 / 120;
  const CONTROL_TUNING = Object.freeze({
    walkSpeed: 190,
    dashSpeed: 268,
    groundAccel: 1680,
    airAccel: 950,
    groundFriction: 1450,
    airFriction: 250,
    jumpPower: 610,
    jumpBuffer: 0.12,
    coyoteTime: 0.09,
    shortHopCutoff: 160
  });
  const DIFFICULTY_TIERS = Object.freeze([
    { name: "simple", start: 1, end: 3, coefficient: 1.0, gaps: 2, gapWidth: 2, platforms: 7, enemies: 4, hazards: 3, moving: 0 },
    { name: "rising", start: 4, end: 6, coefficient: 1.32, gaps: 3, gapWidth: 2, platforms: 9, enemies: 6, hazards: 4, moving: 1 },
    { name: "hard", start: 7, end: 9, coefficient: 1.72, gaps: 4, gapWidth: 3, platforms: 11, enemies: 8, hazards: 6, moving: 1 },
    { name: "veryHard", start: 10, end: 12, coefficient: 2.18, gaps: 5, gapWidth: 3, platforms: 13, enemies: 10, hazards: 8, moving: 2 },
    { name: "superHard", start: 13, end: 16, coefficient: 2.72, gaps: 6, gapWidth: 4, platforms: 15, enemies: 12, hazards: 10, moving: 3 },
    { name: "extreme", start: 17, end: 21, coefficient: 3.35, gaps: 7, gapWidth: 5, platforms: 17, enemies: 15, hazards: 13, moving: 4 }
  ]);
  const keys = new Set();
  const pressed = new Set();
  const touchPointers = new Map();

  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
  const overlap = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
  const randFor = (seed) => {
    let x = Math.sin(seed * 999) * 10000;
    return () => {
      x = Math.sin(x) * 10000;
      return x - Math.floor(x);
    };
  };

  const i18n = {
    zh: {
      hudLevel: "关卡",
      hudLives: "生命",
      hudCoins: "金币",
      hudScore: "分数",
      hudTime: "时间",
      missionEyebrow: "任务",
      routeLabel: "果园路线",
      stageCount: "21 关",
      startBtn: "开始 / 继续",
      restartBtn: "重开",
      pauseBtn: "暂停",
      resumeBtn: "继续",
      soundOn: "音效 开",
      soundOff: "音效 关",
      saveBtn: "保存",
      loadBtn: "读取",
      heroLabel: "英雄任务",
      languageLabel: "语言",
      lightLabel: "亮度",
      lightAuto: "自然光照节律",
      lightDay: "白天",
      lightNight: "夜晚",
      moveHint: "移动",
      jumpHint: "跳跃",
      dashHint: "冲刺",
      pauseHint: "暂停",
      ready: "收集金币，避开尖刺，踩掉敌人，触碰旗帜通关。",
      start: "点 J / Enter 开始冒险",
      paused: "已暂停，按 P 或继续按钮返回。",
      checkpoint: "检查点已激活。",
      saveLocked: "本地存档将在第 5 关通关后启用。",
      saved: "进度已保存。",
      loaded: "存档已读取。",
      noSave: "还没有可读取的存档。",
      coin: "+100 金币",
      stomp: "踩踏成功，+250 分。",
      power: "星果护盾已提升。",
      hurt: "护盾抵消伤害。",
      lifeLost: "生命 -1，从最近检查点复活。",
      levelClear: "通关。按 Enter 进入下一关。",
      complete: "21 关全部完成。",
      gameOver: "游戏结束，按 Enter 重开。",
      saveUnlocked: "本地存档已解锁。",
      mysteryCoin: "神秘宝箱：金币雨，+500。",
      mysteryShield: "神秘宝箱：护盾提升。",
      mysteryTime: "神秘宝箱：时间 +20 秒。",
      mysteryLife: "神秘宝箱：额外生命。",
      mysteryTrap: "神秘宝箱陷阱：时间减少。",
      mysteryEnemy: "神秘宝箱放出巡游怪物。",
      mysterySpring: "神秘宝箱：强力弹簧 13 秒。",
      mysteryRage: "神秘宝箱：大力愤怒药水 10 秒。",
      spring: "强力弹簧！跳跃翻倍，怪物同步加速。",
      rage: "大力愤怒！撞碎障碍和怪物。",
      springStatus: "弹簧",
      rageStatus: "愤怒",
      rageEnemy: "愤怒撞飞怪物，+300。",
      rageObstacle: "愤怒击碎障碍，+150。"
    },
    en: {
      hudLevel: "Level",
      hudLives: "Lives",
      hudCoins: "Coins",
      hudScore: "Score",
      hudTime: "Time",
      missionEyebrow: "Mission",
      routeLabel: "Orchard Route",
      stageCount: "21 Stages",
      startBtn: "Start / Continue",
      restartBtn: "Restart",
      pauseBtn: "Pause",
      resumeBtn: "Resume",
      soundOn: "Sound On",
      soundOff: "Sound Off",
      saveBtn: "Save",
      loadBtn: "Load",
      heroLabel: "Hero quest",
      languageLabel: "Language",
      lightLabel: "Brightness",
      lightAuto: "Natural cycle",
      lightDay: "Day",
      lightNight: "Night",
      moveHint: "Move",
      jumpHint: "Jump",
      dashHint: "Dash",
      pauseHint: "Pause",
      ready: "Collect coins, avoid thorns, stomp enemies, and touch the flag.",
      start: "Tap J / Press Enter",
      paused: "Paused. Press P or Resume.",
      checkpoint: "Checkpoint activated.",
      saveLocked: "Local save unlocks after clearing Level 5.",
      saved: "Progress saved.",
      loaded: "Save loaded.",
      noSave: "No save data found.",
      coin: "+100 coin",
      stomp: "Stomped enemy, +250.",
      power: "Starfruit shield upgraded.",
      hurt: "Shield absorbed the hit.",
      lifeLost: "Life -1. Respawning at checkpoint.",
      levelClear: "Level clear. Press Enter for the next level.",
      complete: "All 21 levels cleared.",
      gameOver: "Game over. Press Enter to restart.",
      saveUnlocked: "Local save unlocked.",
      mysteryCoin: "Mystery box: coin burst, +500.",
      mysteryShield: "Mystery box: shield boosted.",
      mysteryTime: "Mystery box: +20 seconds.",
      mysteryLife: "Mystery box: extra life.",
      mysteryTrap: "Mystery box trap: time drain.",
      mysteryEnemy: "Mystery box released a prowler.",
      mysterySpring: "Mystery box: power spring for 13 seconds.",
      mysteryRage: "Mystery box: rage potion for 10 seconds.",
      spring: "Power spring! Jump doubled, monsters speed up too.",
      rage: "Rage potion! Smash obstacles and monsters.",
      springStatus: "Spring",
      rageStatus: "Rage",
      rageEnemy: "Rage smashed a monster, +300.",
      rageObstacle: "Rage broke an obstacle, +150."
    },
    fr: {
      hudLevel: "Niveau",
      hudLives: "Vies",
      hudCoins: "Pieces",
      hudScore: "Score",
      hudTime: "Temps",
      missionEyebrow: "Mission",
      routeLabel: "Route du verger",
      stageCount: "21 niveaux",
      startBtn: "Demarrer / Continuer",
      restartBtn: "Recommencer",
      pauseBtn: "Pause",
      resumeBtn: "Continuer",
      soundOn: "Son active",
      soundOff: "Son coupe",
      saveBtn: "Sauver",
      loadBtn: "Charger",
      heroLabel: "Quete",
      languageLabel: "Langue",
      lightLabel: "Luminosite",
      lightAuto: "Cycle naturel",
      lightDay: "Jour",
      lightNight: "Nuit",
      moveHint: "Bouger",
      jumpHint: "Sauter",
      dashHint: "Sprinter",
      pauseHint: "Pause",
      ready: "Prenez les pieces, evitez les epines, sautez sur les ennemis.",
      start: "Appuyez sur Entree",
      paused: "Pause. Appuyez sur P.",
      checkpoint: "Point de controle active.",
      saveLocked: "Sauvegarde locale apres le niveau 5.",
      saved: "Progression sauvegardee.",
      loaded: "Sauvegarde chargee.",
      noSave: "Aucune sauvegarde.",
      coin: "+100 piece",
      stomp: "Ennemi battu, +250.",
      power: "Bouclier ameliore.",
      hurt: "Bouclier utilise.",
      lifeLost: "Vie -1. Retour au point de controle.",
      levelClear: "Niveau termine. Entree pour continuer.",
      complete: "Les 21 niveaux sont termines.",
      gameOver: "Partie terminee. Entree pour recommencer.",
      saveUnlocked: "Sauvegarde locale debloquee.",
      mysteryCoin: "Coffre mystere : pluie de pieces, +500.",
      mysteryShield: "Coffre mystere : bouclier renforce.",
      mysteryTime: "Coffre mystere : +20 secondes.",
      mysteryLife: "Coffre mystere : vie bonus.",
      mysteryTrap: "Piege du coffre : temps reduit.",
      mysteryEnemy: "Le coffre libere un rodeur.",
      mysterySpring: "Coffre mystere : ressort puissant 13 secondes.",
      mysteryRage: "Coffre mystere : potion de rage 10 secondes.",
      spring: "Ressort puissant ! Saut double, monstres acceleres.",
      rage: "Potion de rage ! Brisez obstacles et monstres.",
      springStatus: "Ressort",
      rageStatus: "Rage",
      rageEnemy: "Rage : monstre brise, +300.",
      rageObstacle: "Rage : obstacle brise, +150."
    },
    es: {
      hudLevel: "Nivel",
      hudLives: "Vidas",
      hudCoins: "Monedas",
      hudScore: "Puntos",
      hudTime: "Tiempo",
      missionEyebrow: "Mision",
      routeLabel: "Ruta del huerto",
      stageCount: "21 niveles",
      startBtn: "Iniciar / Seguir",
      restartBtn: "Reiniciar",
      pauseBtn: "Pausa",
      resumeBtn: "Seguir",
      soundOn: "Sonido si",
      soundOff: "Sonido no",
      saveBtn: "Guardar",
      loadBtn: "Cargar",
      heroLabel: "Mision",
      languageLabel: "Idioma",
      lightLabel: "Brillo",
      lightAuto: "Ciclo natural",
      lightDay: "Dia",
      lightNight: "Noche",
      moveHint: "Mover",
      jumpHint: "Saltar",
      dashHint: "Correr",
      pauseHint: "Pausa",
      ready: "Recoge monedas, evita espinas y toca la bandera.",
      start: "Pulsa Enter para empezar",
      paused: "Pausa. Pulsa P.",
      checkpoint: "Punto de control activado.",
      saveLocked: "Guardado local despues del nivel 5.",
      saved: "Progreso guardado.",
      loaded: "Partida cargada.",
      noSave: "No hay partida guardada.",
      coin: "+100 moneda",
      stomp: "Enemigo pisado, +250.",
      power: "Escudo mejorado.",
      hurt: "El escudo absorbio el golpe.",
      lifeLost: "Vida -1. Regresas al control.",
      levelClear: "Nivel superado. Enter para seguir.",
      complete: "21 niveles completados.",
      gameOver: "Fin del juego. Enter para reiniciar.",
      saveUnlocked: "Guardado local desbloqueado.",
      mysteryCoin: "Cofre misterioso: lluvia de monedas, +500.",
      mysteryShield: "Cofre misterioso: escudo mejorado.",
      mysteryTime: "Cofre misterioso: +20 segundos.",
      mysteryLife: "Cofre misterioso: vida extra.",
      mysteryTrap: "Trampa del cofre: tiempo reducido.",
      mysteryEnemy: "El cofre libero un merodeador.",
      mysterySpring: "Cofre misterioso: resorte potente 13 segundos.",
      mysteryRage: "Cofre misterioso: pocion de furia 10 segundos.",
      spring: "Resorte potente! Salto doble y monstruos mas rapidos.",
      rage: "Pocion de furia! Rompe obstaculos y monstruos.",
      springStatus: "Resorte",
      rageStatus: "Furia",
      rageEnemy: "Furia destruyo un monstruo, +300.",
      rageObstacle: "Furia rompio un obstaculo, +150."
    },
    ru: {
      hudLevel: "Уровень",
      hudLives: "Жизни",
      hudCoins: "Монеты",
      hudScore: "Очки",
      hudTime: "Время",
      missionEyebrow: "Миссия",
      routeLabel: "Путь сада",
      stageCount: "21 уровень",
      startBtn: "Старт / Продолжить",
      restartBtn: "Заново",
      pauseBtn: "Пауза",
      resumeBtn: "Далее",
      soundOn: "Звук вкл",
      soundOff: "Звук выкл",
      saveBtn: "Сохранить",
      loadBtn: "Загрузить",
      heroLabel: "Квест",
      languageLabel: "Язык",
      lightLabel: "Свет",
      lightAuto: "Суточный цикл",
      lightDay: "День",
      lightNight: "Ночь",
      moveHint: "Ход",
      jumpHint: "Прыжок",
      dashHint: "Рывок",
      pauseHint: "Пауза",
      ready: "Собирайте монеты, избегайте шипов и финишируйте у флага.",
      start: "Нажмите Enter",
      paused: "Пауза. Нажмите P.",
      checkpoint: "Контрольная точка.",
      saveLocked: "Сохранение после 5 уровня.",
      saved: "Прогресс сохранен.",
      loaded: "Сохранение загружено.",
      noSave: "Нет сохранения.",
      coin: "+100 монет",
      stomp: "Враг повержен, +250.",
      power: "Щит усилен.",
      hurt: "Щит принял удар.",
      lifeLost: "Жизнь -1. Возврат к точке.",
      levelClear: "Уровень пройден. Enter далее.",
      complete: "Все 21 уровня пройдены.",
      gameOver: "Игра окончена. Enter заново.",
      saveUnlocked: "Сохранение открыто.",
      mysteryCoin: "Таинственный сундук: дождь монет, +500.",
      mysteryShield: "Таинственный сундук: щит усилен.",
      mysteryTime: "Таинственный сундук: +20 секунд.",
      mysteryLife: "Таинственный сундук: доп. жизнь.",
      mysteryTrap: "Ловушка сундука: меньше времени.",
      mysteryEnemy: "Сундук выпустил врага.",
      mysterySpring: "Таинственный сундук: мощная пружина на 13 секунд.",
      mysteryRage: "Таинственный сундук: зелье ярости на 10 секунд.",
      spring: "Мощная пружина! Прыжок вдвое выше, монстры быстрее.",
      rage: "Зелье ярости! Ломайте преграды и монстров.",
      springStatus: "Пружина",
      rageStatus: "Ярость",
      rageEnemy: "Ярость разбила монстра, +300.",
      rageObstacle: "Ярость разбила преграду, +150."
    },
    ar: {
      hudLevel: "المستوى",
      hudLives: "الحياة",
      hudCoins: "العملات",
      hudScore: "النقاط",
      hudTime: "الوقت",
      missionEyebrow: "المهمة",
      routeLabel: "طريق البستان",
      stageCount: "21 مرحلة",
      startBtn: "ابدأ / تابع",
      restartBtn: "إعادة",
      pauseBtn: "إيقاف",
      resumeBtn: "متابعة",
      soundOn: "الصوت يعمل",
      soundOff: "الصوت مغلق",
      saveBtn: "حفظ",
      loadBtn: "تحميل",
      heroLabel: "مهمة البطل",
      languageLabel: "اللغة",
      lightLabel: "الإضاءة",
      lightAuto: "دورة طبيعية",
      lightDay: "نهار",
      lightNight: "ليل",
      moveHint: "تحرك",
      jumpHint: "اقفز",
      dashHint: "اندفاع",
      pauseHint: "إيقاف",
      ready: "اجمع العملات وتجنب الأشواك والمس العلم.",
      start: "اضغط Enter للبدء",
      paused: "متوقف. اضغط P.",
      checkpoint: "تم تفعيل نقطة حفظ.",
      saveLocked: "الحفظ المحلي بعد المستوى الخامس.",
      saved: "تم حفظ التقدم.",
      loaded: "تم تحميل الحفظ.",
      noSave: "لا يوجد حفظ.",
      coin: "+100 عملة",
      stomp: "هزمت عدوا، +250.",
      power: "تمت ترقية الدرع.",
      hurt: "الدرع امتص الضربة.",
      lifeLost: "خسرت حياة. عودة إلى نقطة الحفظ.",
      levelClear: "اكتمل المستوى. Enter للمتابعة.",
      complete: "اكتملت 21 مرحلة.",
      gameOver: "انتهت اللعبة. Enter للإعادة.",
      saveUnlocked: "تم فتح الحفظ المحلي.",
      mysteryCoin: "صندوق غامض: مطر عملات، +500.",
      mysteryShield: "صندوق غامض: تقوية الدرع.",
      mysteryTime: "صندوق غامض: +20 ثانية.",
      mysteryLife: "صندوق غامض: حياة اضافية.",
      mysteryTrap: "فخ الصندوق: نقص الوقت.",
      mysteryEnemy: "الصندوق اطلق عدوا.",
      mysterySpring: "صندوق غامض: نابض قوي 13 ثانية.",
      mysteryRage: "صندوق غامض: جرعة غضب 10 ثوان.",
      spring: "نابض قوي! القفز مضاعف والوحوش اسرع.",
      rage: "جرعة غضب! اكسر العوائق والوحوش.",
      springStatus: "نابض",
      rageStatus: "غضب",
      rageEnemy: "الغضب حطم وحشا، +300.",
      rageObstacle: "الغضب كسر عائقا، +150."
    }
  };

  Object.assign(i18n, {
    zh: {
      ...i18n.en,
      hudLevel: "关卡", hudLives: "生命", hudCoins: "金币", hudScore: "分数", hudTime: "时间",
      systemBtn: "系统设置", systemTitle: "系统设置", startGameBtn: "开始游戏",
      startBtn: "开始 / 继续", restartBtn: "重开", pauseBtn: "暂停", resumeBtn: "继续", soundOn: "音效 开", soundOff: "音效 关", saveBtn: "保存", loadBtn: "读取",
      heroLabel: "英雄任务", languageLabel: "语言", lightLabel: "光照", lightAuto: "自然节律", lightDawn: "清晨", lightDay: "白昼", lightDusk: "傍晚", lightNight: "夜晚",
      weatherLabel: "天气", weatherAuto: "自然节律", weatherSunny: "晴天", weatherCloudy: "多云", weatherRain: "雨天", weatherStorm: "雷电",
      levelSelectLabel: "关卡", levelLocked: "通过前十关后开启选关。", levelUnlocked: "已开启选关。", selectLevelPrefix: "关卡",
      touchLeft: "左", touchRight: "右", touchDash: "冲刺", touchJump: "跳跃",
      moveHint: "移动", jumpHint: "跳跃", dashHint: "冲刺", pauseHint: "暂停",
      ready: "收集金币，避开尖刺，踩掉怪物，触碰旗帜通关。", start: "开始游戏", paused: "已暂停，点击继续。", checkpoint: "检查点已激活。",
      saveLocked: "本地存档将在第 5 关后启用。", saved: "进度已保存。", loaded: "存档已读取。", noSave: "还没有可读取的存档。",
      coin: "+100 金币", stomp: "踩踏成功，+250。", power: "星果护盾已提升。", hurt: "护盾抵消伤害。", lifeLost: "生命 -1，从最近检查点复活。",
      levelClear: "通关，点击继续下一关。", complete: "21 关全部完成。", gameOver: "游戏结束，点击重新开始。", saveUnlocked: "本地存档已解锁。",
      mysteryCoin: "神秘宝箱：金币雨，+500。", mysteryShield: "神秘宝箱：护盾提升。", mysteryTime: "神秘宝箱：时间 +20 秒。", mysteryLife: "神秘宝箱：额外生命。",
      mysteryTrap: "神秘宝箱陷阱：时间减少。", mysteryEnemy: "神秘宝箱放出巡游怪物。", mysterySpring: "神秘宝箱：强力弹簧 13 秒。", mysteryRage: "神秘宝箱：大力愤怒药水 10 秒。",
      spring: "强力弹簧！跳跃翻倍，怪物同步加速。", rage: "大力愤怒！撞碎障碍和怪物。", springStatus: "弹簧", rageStatus: "愤怒",
      rageEnemy: "愤怒撞飞怪物，+300。", rageObstacle: "愤怒击碎障碍，+150。"
    },
    zhHK: {
      ...i18n.en,
      hudLevel: "關卡", hudLives: "生命", hudCoins: "金幣", hudScore: "分數", hudTime: "時間",
      systemBtn: "系統設定", systemTitle: "系統設定", startGameBtn: "開始遊戲",
      startBtn: "開始 / 繼續", restartBtn: "重開", pauseBtn: "暫停", resumeBtn: "繼續", soundOn: "音效 開", soundOff: "音效 關", saveBtn: "儲存", loadBtn: "讀取",
      heroLabel: "英雄任務", languageLabel: "語言", lightLabel: "光照", lightAuto: "自然節律", lightDawn: "清晨", lightDay: "白晝", lightDusk: "黃昏", lightNight: "夜晚",
      weatherLabel: "天氣", weatherAuto: "自然節律", weatherSunny: "晴天", weatherCloudy: "多雲", weatherRain: "雨天", weatherStorm: "雷電",
      levelSelectLabel: "關卡", levelLocked: "通過前十關後開啟選關。", levelUnlocked: "已開啟選關。", selectLevelPrefix: "關卡",
      touchLeft: "左", touchRight: "右", touchDash: "衝刺", touchJump: "跳躍",
      moveHint: "移動", jumpHint: "跳躍", dashHint: "衝刺", pauseHint: "暫停",
      ready: "收集金幣，避開尖刺，踩掉怪物，觸碰旗幟通關。", start: "開始遊戲", paused: "已暫停，點擊繼續。", levelClear: "通關，點擊繼續下一關。", complete: "21 關全部完成。", gameOver: "遊戲結束，點擊重新開始。"
    },
    en: {
      ...i18n.en,
      systemBtn: "Settings", systemTitle: "System Settings", startGameBtn: "Start Game",
      lightDawn: "Dawn", lightDusk: "Dusk", weatherLabel: "Weather", weatherAuto: "Natural rhythm", weatherSunny: "Sunny", weatherCloudy: "Cloudy", weatherRain: "Rain", weatherStorm: "Thunder",
      levelSelectLabel: "Level", levelLocked: "Level select unlocks after clearing the first 10 stages.", levelUnlocked: "Level select unlocked.", selectLevelPrefix: "Level",
      touchLeft: "Left", touchRight: "Right", touchDash: "Dash", touchJump: "Jump", start: "Start Game", levelClear: "Level clear. Tap to continue.", gameOver: "Game over. Tap to restart."
    },
    fr: {
      ...i18n.fr,
      systemBtn: "Réglages", systemTitle: "Réglages système", startGameBtn: "Commencer", lightDawn: "Aube", lightDusk: "Crépuscule",
      weatherLabel: "Météo", weatherAuto: "Rythme naturel", weatherSunny: "Soleil", weatherCloudy: "Nuageux", weatherRain: "Pluie", weatherStorm: "Orage",
      levelSelectLabel: "Niveau", levelLocked: "Sélection après les 10 premiers niveaux.", levelUnlocked: "Sélection débloquée.", selectLevelPrefix: "Niveau",
      touchLeft: "Gauche", touchRight: "Droite", touchDash: "Sprint", touchJump: "Saut", start: "Commencer"
    },
    es: {
      ...i18n.es,
      systemBtn: "Ajustes", systemTitle: "Ajustes del sistema", startGameBtn: "Iniciar", lightDawn: "Amanecer", lightDusk: "Atardecer",
      weatherLabel: "Clima", weatherAuto: "Ritmo natural", weatherSunny: "Soleado", weatherCloudy: "Nublado", weatherRain: "Lluvia", weatherStorm: "Tormenta",
      levelSelectLabel: "Nivel", levelLocked: "La selección se abre tras 10 niveles.", levelUnlocked: "Selección desbloqueada.", selectLevelPrefix: "Nivel",
      touchLeft: "Izq.", touchRight: "Der.", touchDash: "Correr", touchJump: "Saltar", start: "Iniciar"
    },
    ru: {
      ...i18n.en,
      hudLevel: "Уровень", hudLives: "Жизни", hudCoins: "Монеты", hudScore: "Счёт", hudTime: "Время",
      systemBtn: "Настройки", systemTitle: "Системные настройки", startGameBtn: "Начать", languageLabel: "Язык", lightLabel: "Свет", lightAuto: "Естественный ритм", lightDawn: "Рассвет", lightDay: "День", lightDusk: "Закат", lightNight: "Ночь",
      weatherLabel: "Погода", weatherAuto: "Естественный ритм", weatherSunny: "Ясно", weatherCloudy: "Облачно", weatherRain: "Дождь", weatherStorm: "Гроза",
      levelSelectLabel: "Уровень", levelLocked: "Выбор уровней после первых 10.", levelUnlocked: "Выбор уровней открыт.", selectLevelPrefix: "Уровень",
      touchLeft: "Влево", touchRight: "Вправо", touchDash: "Рывок", touchJump: "Прыжок", start: "Начать"
    },
    ar: {
      ...i18n.en,
      hudLevel: "المستوى", hudLives: "الحياة", hudCoins: "العملات", hudScore: "النقاط", hudTime: "الوقت",
      systemBtn: "الإعدادات", systemTitle: "إعدادات النظام", startGameBtn: "ابدأ", languageLabel: "اللغة", lightLabel: "الإضاءة", lightAuto: "إيقاع طبيعي", lightDawn: "الفجر", lightDay: "نهار", lightDusk: "الغروب", lightNight: "ليل",
      weatherLabel: "الطقس", weatherAuto: "إيقاع طبيعي", weatherSunny: "مشمس", weatherCloudy: "غائم", weatherRain: "مطر", weatherStorm: "رعد",
      levelSelectLabel: "المستوى", levelLocked: "اختيار المستوى يفتح بعد أول 10 مراحل.", levelUnlocked: "تم فتح اختيار المستوى.", selectLevelPrefix: "المستوى",
      touchLeft: "يسار", touchRight: "يمين", touchDash: "اندفاع", touchJump: "قفز", start: "ابدأ"
    },
    ja: {
      ...i18n.en,
      hudLevel: "ステージ", hudLives: "ライフ", hudCoins: "コイン", hudScore: "スコア", hudTime: "時間",
      systemBtn: "設定", systemTitle: "システム設定", startGameBtn: "ゲーム開始", startBtn: "開始 / 続き", restartBtn: "リスタート", pauseBtn: "一時停止", resumeBtn: "再開", soundOn: "音 ON", soundOff: "音 OFF", saveBtn: "保存", loadBtn: "読込",
      languageLabel: "言語", lightLabel: "光", lightAuto: "自然リズム", lightDawn: "朝", lightDay: "昼", lightDusk: "夕方", lightNight: "夜",
      weatherLabel: "天気", weatherAuto: "自然リズム", weatherSunny: "晴れ", weatherCloudy: "曇り", weatherRain: "雨", weatherStorm: "雷",
      levelSelectLabel: "ステージ", levelLocked: "最初の10ステージクリア後に選択できます。", levelUnlocked: "ステージ選択が開きました。", selectLevelPrefix: "ステージ",
      touchLeft: "左", touchRight: "右", touchDash: "ダッシュ", touchJump: "ジャンプ", ready: "コインを集め、トゲを避け、旗に触れよう。", start: "ゲーム開始", levelClear: "クリア。タップで次へ。", gameOver: "ゲームオーバー。タップで再開。"
    },
    de: {
      ...i18n.en,
      hudLevel: "Level", hudLives: "Leben", hudCoins: "Münzen", hudScore: "Punkte", hudTime: "Zeit",
      systemBtn: "Einstellungen", systemTitle: "Systemeinstellungen", startGameBtn: "Spiel starten", startBtn: "Start / Weiter", restartBtn: "Neustart", pauseBtn: "Pause", resumeBtn: "Weiter", soundOn: "Ton an", soundOff: "Ton aus", saveBtn: "Speichern", loadBtn: "Laden",
      languageLabel: "Sprache", lightLabel: "Licht", lightAuto: "Natürlicher Rhythmus", lightDawn: "Morgen", lightDay: "Tag", lightDusk: "Abend", lightNight: "Nacht",
      weatherLabel: "Wetter", weatherAuto: "Natürlicher Rhythmus", weatherSunny: "Sonnig", weatherCloudy: "Bewölkt", weatherRain: "Regen", weatherStorm: "Gewitter",
      levelSelectLabel: "Level", levelLocked: "Levelauswahl nach den ersten 10 Stufen.", levelUnlocked: "Levelauswahl freigeschaltet.", selectLevelPrefix: "Level",
      touchLeft: "Links", touchRight: "Rechts", touchDash: "Sprint", touchJump: "Sprung", ready: "Sammle Münzen, meide Dornen und erreiche die Flagge.", start: "Spiel starten", levelClear: "Level geschafft. Tippen zum Weitergehen.", gameOver: "Spiel vorbei. Tippen zum Neustart."
    }
  });

  Object.assign(i18n.zh, {
    systemBtn: "系统设置",
    systemTitle: "系统设置",
    startGameBtn: "开始游戏",
    touchLeft: "左",
    touchRight: "右",
    touchDash: "冲",
    touchJump: "跳",
    touchSymbolDash: "冲",
    touchSymbolJump: "跳",
    gameOver: "游戏结束，点击重新开始"
  });

  if (i18n.zhHK) Object.assign(i18n.zhHK, {
    systemBtn: "系統設定",
    systemTitle: "系統設定",
    startGameBtn: "開始遊戲",
    touchLeft: "左",
    touchRight: "右",
    touchDash: "衝",
    touchJump: "跳",
    touchSymbolDash: "衝",
    touchSymbolJump: "跳",
    gameOver: "遊戲結束，點擊重新開始"
  });

  Object.assign(i18n.en, {
    systemBtn: "Settings",
    systemTitle: "System Settings",
    startGameBtn: "Start Game",
    lightAuto: "Natural Rhythm",
    weatherAuto: "Natural Rhythm",
    levelSelectLabel: "Level Select",
    levelLocked: "Level Select Unlocks After Clearing The First 10 Stages.",
    levelUnlocked: "Level Select Unlocked.",
    touchDash: "Dash",
    touchJump: "Jump",
    touchSymbolDash: "D",
    touchSymbolJump: "J",
    levelClear: "Level Clear. Tap To Continue.",
    gameOver: "Game Over. Tap To Restart"
  });

  if (i18n.de) Object.assign(i18n.de, {
    systemTitle: "Systemeinstellungen",
    startGameBtn: "Spiel Starten",
    touchSymbolDash: "S",
    touchSymbolJump: "J"
  });

  Object.assign(i18n.zh, {
    lightLabel: "照度",
    quickPauseBtn: "停",
    quickResumeBtn: "继",
    quickRestartBtn: "新开",
    quickSaveBtn: "存",
    quickLoadBtn: "读",
    saveBtn: "存档",
    loadBtn: "读档",
    levelLocked: "通过前十关后开启选关",
    levelUnlocked: "已开启选关",
    coin: "+100 金币",
    stomp: "踩掉怪物，+250",
    power: "星果护盾提升",
    checkpoint: "检查点已激活",
    saveLocked: "第 5 关后开启存档",
    saved: "进度已存档",
    loaded: "存档已读取",
    noSave: "还没有可读取的存档",
    saveUnlocked: "存档与读档已解锁",
    mysteryCoin: "神秘宝箱：金币雨，+500",
    mysteryShield: "神秘宝箱：护盾提升",
    mysteryTime: "神秘宝箱：时间 +20 秒",
    mysteryLife: "神秘宝箱：额外生命",
    mysteryTrap: "宝箱陷阱：时间减少",
    mysteryEnemy: "宝箱放出巡游怪物",
    mysterySpring: "神秘宝箱：强力弹簧 13 秒",
    mysteryRage: "神秘宝箱：大力愤怒药水 10 秒",
    spring: "强力弹簧！跳跃提升，怪物同步加速",
    rage: "愤怒药水！撞碎障碍和怪物",
    rageEnemy: "愤怒撞飞怪物，+300",
    rageObstacle: "愤怒击碎障碍，+150",
    gameOver: "游戏结束，点击重新开始",
    levelClear: "通关，点击继续下一关"
  });

  if (i18n.zhHK) Object.assign(i18n.zhHK, {
    lightLabel: "照度",
    quickPauseBtn: "停",
    quickResumeBtn: "續",
    quickRestartBtn: "新開",
    quickSaveBtn: "存",
    quickLoadBtn: "讀",
    saveBtn: "存檔",
    loadBtn: "讀檔",
    levelLocked: "通過前十關後開啟選關",
    levelUnlocked: "已開啟選關",
    coin: "+100 金幣",
    stomp: "踩掉怪物，+250",
    power: "星果護盾提升",
    checkpoint: "檢查點已啟動",
    saveLocked: "第 5 關後開啟存檔",
    saved: "進度已存檔",
    loaded: "存檔已讀取",
    noSave: "尚無可讀取存檔",
    saveUnlocked: "存檔與讀檔已解鎖",
    mysteryCoin: "神秘寶箱：金幣雨，+500",
    mysteryShield: "神秘寶箱：護盾提升",
    mysteryTime: "神秘寶箱：時間 +20 秒",
    mysteryLife: "神秘寶箱：額外生命",
    mysteryTrap: "寶箱陷阱：時間減少",
    mysteryEnemy: "寶箱放出巡遊怪物",
    mysterySpring: "神秘寶箱：強力彈簧 13 秒",
    mysteryRage: "神秘寶箱：大力憤怒藥水 10 秒",
    spring: "強力彈簧！跳躍提升，怪物同步加速",
    rage: "憤怒藥水！撞碎障礙和怪物",
    rageEnemy: "憤怒撞飛怪物，+300",
    rageObstacle: "憤怒擊碎障礙，+150",
    gameOver: "遊戲結束，點擊重新開始",
    levelClear: "通關，點擊繼續下一關"
  });

  Object.assign(i18n.en, {
    lightLabel: "Illumination",
    quickPauseBtn: "P",
    quickResumeBtn: "▶",
    quickRestartBtn: "R",
    quickSaveBtn: "S",
    quickLoadBtn: "L",
    touchSymbolDash: "D",
    touchSymbolJump: "J",
    levelLocked: "Unlocks After 10",
    levelUnlocked: "Level Select On",
    mysterySpring: "Mystery Box: Power Spring, 13s",
    spring: "Power Spring! Higher Jump, Faster Monsters",
    levelClear: "Level Clear, Tap To Continue",
    gameOver: "Game Over, Tap To Restart"
  });

  Object.assign(i18n.fr, {
    quickPauseBtn: "P",
    quickResumeBtn: "▶",
    quickRestartBtn: "R",
    quickSaveBtn: "S",
    quickLoadBtn: "C",
    lightLabel: "Lumiere",
    touchSymbolDash: "S",
    touchSymbolJump: "J",
    levelLocked: "Apres 10 Niveaux",
    levelUnlocked: "Selection Active",
    mysterySpring: "Coffre Mystere : Ressort, 13 s",
    spring: "Ressort Puissant ! Saut Haut, Ennemis Rapides"
  });

  Object.assign(i18n.es, {
    quickPauseBtn: "P",
    quickResumeBtn: "▶",
    quickRestartBtn: "R",
    quickSaveBtn: "G",
    quickLoadBtn: "C",
    lightLabel: "Iluminacion",
    touchSymbolDash: "C",
    touchSymbolJump: "S",
    levelLocked: "Tras 10 Niveles",
    levelUnlocked: "Seleccion Activa",
    mysterySpring: "Cofre Misterioso: Resorte, 13 s",
    spring: "Resorte Potente! Salto Alto, Enemigos Rapidos"
  });

  Object.assign(i18n.ru, {
    quickPauseBtn: "П",
    quickResumeBtn: "▶",
    quickRestartBtn: "Н",
    quickSaveBtn: "С",
    quickLoadBtn: "З",
    lightLabel: "Свет",
    touchSymbolDash: "Р",
    touchSymbolJump: "П",
    levelLocked: "После 10",
    levelUnlocked: "Выбор Открыт",
    mysterySpring: "Сундук: пружина на 13 с",
    spring: "Пружина! Прыжок выше, враги быстрее"
  });

  Object.assign(i18n.ar, {
    quickPauseBtn: "و",
    quickResumeBtn: "▶",
    quickRestartBtn: "ج",
    quickSaveBtn: "ح",
    quickLoadBtn: "ق",
    lightLabel: "الإضاءة",
    touchSymbolDash: "د",
    touchSymbolJump: "ق",
    levelLocked: "بعد 10 مراحل",
    levelUnlocked: "اختيار مفتوح",
    mysterySpring: "صندوق غامض: نابض 13ث",
    spring: "نابض قوي! قفز أعلى ووحوش أسرع"
  });

  Object.assign(i18n.ja, {
    quickPauseBtn: "止",
    quickResumeBtn: "再",
    quickRestartBtn: "新",
    quickSaveBtn: "保",
    quickLoadBtn: "読",
    lightLabel: "照度",
    touchSymbolDash: "走",
    touchSymbolJump: "跳",
    levelLocked: "10面後に開放",
    levelUnlocked: "選択可能",
    mysterySpring: "宝箱：強力バネ 13秒",
    spring: "強力バネ！ジャンプ強化、敵も加速"
  });

  Object.assign(i18n.de, {
    quickPauseBtn: "P",
    quickResumeBtn: "▶",
    quickRestartBtn: "N",
    quickSaveBtn: "S",
    quickLoadBtn: "L",
    touchSymbolDash: "S",
    touchSymbolJump: "J",
    lightLabel: "Licht",
    levelLocked: "Nach 10 Leveln",
    levelUnlocked: "Levelwahl Aktiv",
    mysterySpring: "Mystery Box: Feder, 13 s",
    spring: "Kraftfeder! Hoeherer Sprung, Schnellere Monster"
  });

  Object.assign(i18n.zh, {
    quickRestartBtn: "新",
    coin: "+100 金币",
    stomp: "踏敌 +250",
    power: "星果护盾提升",
    checkpoint: "检查点已激活",
    saveLocked: "第 5 关后开启存档",
    saved: "进度已存档",
    loaded: "存档已读取",
    noSave: "还没有可读取的存档",
    saveUnlocked: "存档与读档已解锁",
    mysteryCoin: "神秘宝箱：金币雨 +500",
    mysteryShield: "神秘宝箱：护盾提升",
    mysteryTime: "神秘宝箱：时间 +20 秒",
    mysteryLife: "神秘宝箱：额外生命",
    mysteryTrap: "宝箱陷阱：时间减少",
    mysteryEnemy: "宝箱放出巡游怪物",
    mysterySpring: "神秘宝箱：强力弹簧 13 秒",
    mysteryRage: "神秘宝箱：大力愤怒药水 10 秒",
    spring: "强力弹簧！跳跃提升，怪物同步加速",
    rage: "愤怒药水！撞碎障碍和怪物",
    springStatus: "弹簧",
    rageStatus: "愤怒",
    rageEnemy: "愤怒撞飞怪物 +300",
    rageObstacle: "愤怒击碎障碍 +150",
    lifeMinus: "生命 -1"
  });

  Object.assign(i18n.zhHK, {
    quickRestartBtn: "新",
    coin: "+100 金",
    stomp: "踏怪 +250",
    power: "星果护盾已增",
    checkpoint: "驿点已启",
    saveLocked: "过第五关后启存牍",
    saved: "行程已存",
    loaded: "存牍已读",
    noSave: "尚无可读存牍",
    saveUnlocked: "存牍读牍已启",
    mysteryCoin: "宝匣：金币雨 +500",
    mysteryShield: "宝匣：护盾增益",
    mysteryTime: "宝匣：添时二十息",
    mysteryLife: "宝匣：添命一枚",
    mysteryTrap: "宝匣机关：时辰削减",
    mysteryEnemy: "宝匣释出游怪",
    mysterySpring: "宝匣：强弩弹簧十三息",
    mysteryRage: "宝匣：怒力药水十息",
    spring: "强簧已得！跃力提升，怪物亦疾",
    rage: "怒药已得！可破障灭怪",
    springStatus: "强簧",
    rageStatus: "怒力",
    rageEnemy: "怒力破怪 +300",
    rageObstacle: "怒力破障 +150",
    lifeMinus: "命 -1"
  });

  Object.assign(i18n.en, {
    coin: "+100 Coin",
    stomp: "Enemy Stomped, +250",
    power: "Starfruit Shield Upgraded",
    checkpoint: "Checkpoint Activated",
    saveLocked: "Save Unlocks After Level 5",
    saved: "Progress Saved",
    loaded: "Save Loaded",
    noSave: "No Save Data Found",
    saveUnlocked: "Save And Load Unlocked",
    mysteryCoin: "Mystery Box: Coin Burst, +500",
    mysteryShield: "Mystery Box: Shield Boosted",
    mysteryTime: "Mystery Box: +20 Seconds",
    mysteryLife: "Mystery Box: Extra Life",
    mysteryTrap: "Mystery Box Trap: Time Drain",
    mysteryEnemy: "Mystery Box Released A Prowler",
    mysterySpring: "Mystery Box: Power Spring, 13s",
    mysteryRage: "Mystery Box: Rage Potion, 10s",
    spring: "Power Spring! Higher Jump, Faster Monsters",
    rage: "Rage Potion! Smash Obstacles And Monsters",
    springStatus: "Spring",
    rageStatus: "Rage",
    rageEnemy: "Rage Smashed A Monster, +300",
    rageObstacle: "Rage Broke An Obstacle, +150",
    lifeMinus: "Life -1"
  });

  Object.assign(i18n.fr, {
    coin: "+100 Pièce",
    stomp: "Ennemi Écrasé, +250",
    power: "Bouclier Starfruit Amélioré",
    checkpoint: "Point De Contrôle Activé",
    saveLocked: "Sauvegarde Après Le Niveau 5",
    saved: "Progression Sauvegardée",
    loaded: "Sauvegarde Chargée",
    noSave: "Aucune Sauvegarde",
    saveUnlocked: "Sauvegarde Et Chargement Débloqués",
    mysteryCoin: "Coffre Mystère : Pluie De Pièces, +500",
    mysteryShield: "Coffre Mystère : Bouclier Renforcé",
    mysteryTime: "Coffre Mystère : +20 Secondes",
    mysteryLife: "Coffre Mystère : Vie Bonus",
    mysteryTrap: "Piège Du Coffre : Temps Réduit",
    mysteryEnemy: "Le Coffre Libère Un Rôdeur",
    mysterySpring: "Coffre Mystère : Ressort Puissant, 13 s",
    mysteryRage: "Coffre Mystère : Potion De Rage, 10 s",
    spring: "Ressort Puissant ! Saut Plus Haut, Monstres Accélérés",
    rage: "Potion De Rage ! Brisez Obstacles Et Monstres",
    springStatus: "Ressort",
    rageStatus: "Furie",
    rageEnemy: "Rage : Monstre Brisé, +300",
    rageObstacle: "Rage : Obstacle Brisé, +150",
    lifeMinus: "Vie -1"
  });

  Object.assign(i18n.es, {
    coin: "+100 Moneda",
    stomp: "Enemigo Pisado, +250",
    power: "Escudo Starfruit Mejorado",
    checkpoint: "Punto De Control Activado",
    saveLocked: "Guardado Tras Nivel 5",
    saved: "Progreso Guardado",
    loaded: "Partida Cargada",
    noSave: "No Hay Partida Guardada",
    saveUnlocked: "Guardar Y Cargar Desbloqueados",
    mysteryCoin: "Cofre Misterioso: Lluvia De Monedas, +500",
    mysteryShield: "Cofre Misterioso: Escudo Mejorado",
    mysteryTime: "Cofre Misterioso: +20 Segundos",
    mysteryLife: "Cofre Misterioso: Vida Extra",
    mysteryTrap: "Trampa Del Cofre: Tiempo Reducido",
    mysteryEnemy: "El Cofre Liberó Un Merodeador",
    mysterySpring: "Cofre Misterioso: Resorte Potente, 13 s",
    mysteryRage: "Cofre Misterioso: Poción De Furia, 10 s",
    spring: "¡Resorte Potente! Salto Más Alto, Monstruos Más Rápidos",
    rage: "¡Poción De Furia! Rompe Obstáculos Y Monstruos",
    springStatus: "Resorte",
    rageStatus: "Furia",
    rageEnemy: "Furia Destruyó Un Monstruo, +300",
    rageObstacle: "Furia Rompió Un Obstáculo, +150",
    lifeMinus: "Vida -1"
  });

  Object.assign(i18n.ru, {
    coin: "+100 Монет",
    stomp: "Враг Раздавлен, +250",
    power: "Щит Starfruit Усилен",
    checkpoint: "Контрольная Точка Активирована",
    saveLocked: "Сохранение После Уровня 5",
    saved: "Прогресс Сохранён",
    loaded: "Сохранение Загружено",
    noSave: "Сохранение Не Найдено",
    saveUnlocked: "Сохранение И Загрузка Открыты",
    mysteryCoin: "Таинственный Сундук: Дождь Монет, +500",
    mysteryShield: "Таинственный Сундук: Щит Усилен",
    mysteryTime: "Таинственный Сундук: +20 Секунд",
    mysteryLife: "Таинственный Сундук: Дополнительная Жизнь",
    mysteryTrap: "Ловушка Сундука: Время Сокращено",
    mysteryEnemy: "Сундук Выпустил Бродягу",
    mysterySpring: "Таинственный Сундук: Сильная Пружина, 13 с",
    mysteryRage: "Таинственный Сундук: Зелье Ярости, 10 с",
    spring: "Сильная Пружина! Прыжок Выше, Монстры Быстрее",
    rage: "Зелье Ярости! Ломайте Преграды И Монстров",
    springStatus: "Пружина",
    rageStatus: "Ярость",
    rageEnemy: "Ярость Разбила Монстра, +300",
    rageObstacle: "Ярость Разбила Преграду, +150",
    lifeMinus: "Жизнь -1"
  });

  Object.assign(i18n.ar, {
    coin: "+100 عملة",
    stomp: "هزمت عدوا، +250",
    power: "تم تعزيز درع Starfruit",
    checkpoint: "تم تفعيل نقطة الحفظ",
    saveLocked: "الحفظ يفتح بعد المستوى 5",
    saved: "تم حفظ التقدم",
    loaded: "تم تحميل الحفظ",
    noSave: "لا يوجد حفظ",
    saveUnlocked: "تم فتح الحفظ والتحميل",
    mysteryCoin: "صندوق غامض: مطر عملات، +500",
    mysteryShield: "صندوق غامض: تعزيز الدرع",
    mysteryTime: "صندوق غامض: +20 ثانية",
    mysteryLife: "صندوق غامض: حياة إضافية",
    mysteryTrap: "فخ الصندوق: نقص الوقت",
    mysteryEnemy: "الصندوق أطلق متجولا",
    mysterySpring: "صندوق غامض: نابض قوي، 13ث",
    mysteryRage: "صندوق غامض: جرعة غضب، 10ث",
    spring: "نابض قوي! قفز أعلى ووحوش أسرع",
    rage: "جرعة غضب! حطم العوائق والوحوش",
    springStatus: "نابض",
    rageStatus: "غضب",
    rageEnemy: "الغضب حطم وحشا، +300",
    rageObstacle: "الغضب كسر عائقا، +150",
    lifeMinus: "حياة -1"
  });

  Object.assign(i18n.ja, {
    coin: "+100 コイン",
    stomp: "敵を踏破、+250",
    power: "スターフルーツの盾が強化",
    checkpoint: "チェックポイント起動",
    saveLocked: "セーブはレベル5後に解放",
    saved: "進行を保存",
    loaded: "セーブを読み込み",
    noSave: "セーブがありません",
    saveUnlocked: "セーブとロード解放",
    mysteryCoin: "宝箱：コインの雨、+500",
    mysteryShield: "宝箱：盾を強化",
    mysteryTime: "宝箱：時間 +20 秒",
    mysteryLife: "宝箱：ライフ追加",
    mysteryTrap: "宝箱の罠：時間減少",
    mysteryEnemy: "宝箱から敵が出現",
    mysterySpring: "宝箱：強力バネ 13 秒",
    mysteryRage: "宝箱：怒りの薬 10 秒",
    spring: "強力バネ！ジャンプ強化、敵も加速",
    rage: "怒りの薬！障害物と敵を破壊",
    springStatus: "バネ",
    rageStatus: "怒り",
    rageEnemy: "怒りで敵を撃破、+300",
    rageObstacle: "怒りで障害物を破壊、+150",
    lifeMinus: "ライフ -1"
  });

  Object.assign(i18n.de, {
    coin: "+100 Münzen",
    stomp: "Feind Zertrampelt, +250",
    power: "Starfruit-Schild Verstärkt",
    checkpoint: "Kontrollpunkt Aktiviert",
    saveLocked: "Speichern Ab Level 5",
    saved: "Fortschritt Gespeichert",
    loaded: "Spielstand Geladen",
    noSave: "Kein Spielstand Gefunden",
    saveUnlocked: "Speichern Und Laden Freigeschaltet",
    mysteryCoin: "Mystery Box: Münzregen, +500",
    mysteryShield: "Mystery Box: Schild Verstärkt",
    mysteryTime: "Mystery Box: +20 Sekunden",
    mysteryLife: "Mystery Box: Extraleben",
    mysteryTrap: "Mystery-Box-Falle: Zeitverlust",
    mysteryEnemy: "Mystery Box Setzt Einen Streuner Frei",
    mysterySpring: "Mystery Box: Kraftfeder, 13 s",
    mysteryRage: "Mystery Box: Wuttrank, 10 s",
    spring: "Kraftfeder! Höherer Sprung, Schnellere Monster",
    rage: "Wuttrank! Zerschlage Hindernisse Und Monster",
    springStatus: "Feder",
    rageStatus: "Wut",
    rageEnemy: "Wut Zerschlug Ein Monster, +300",
    rageObstacle: "Wut Zerbrach Ein Hindernis, +150",
    lifeMinus: "Leben -1"
  });

  Object.assign(i18n.zh, {
    ready: "收集金币，避开尖刺，踏过怪物，触旗通关",
    start: "开始游戏",
    paused: "已暂停，点击继续",
    levelClear: "通关，点击继续下一关",
    complete: "21 关全部完成",
    gameOver: "游戏结束，点击重新开始",
    hurt: "护盾抵消伤害",
    lifeLost: "生命 -1，从检查点复活"
  });

  Object.assign(i18n.zhHK, {
    ready: "集金避刺，踏怪触旗以通关",
    start: "启程",
    paused: "已暂停，点按继续",
    levelClear: "关卡已过，点按续行",
    complete: "二十一关俱成",
    gameOver: "游戏终了，点按再启",
    hurt: "护盾抵伤",
    lifeLost: "命 -1，自驿点复归"
  });

  Object.assign(i18n.en, {
    ready: "Collect Coins, Avoid Thorns, Stomp Enemies, And Touch The Flag",
    start: "Start Game",
    paused: "Paused. Tap To Resume",
    levelClear: "Level Clear, Tap To Continue",
    complete: "All 21 Levels Cleared",
    gameOver: "Game Over, Tap To Restart",
    hurt: "Shield Absorbed The Hit",
    lifeLost: "Life -1. Respawning At Checkpoint"
  });

  Object.assign(i18n.fr, {
    ready: "Ramassez Les Pièces, Évitez Les Épines Et Touchez Le Drapeau",
    start: "Commencer",
    paused: "Pause. Touchez Pour Reprendre",
    levelClear: "Niveau Terminé, Touchez Pour Continuer",
    complete: "Les 21 Niveaux Sont Terminés",
    gameOver: "Partie Terminée, Touchez Pour Recommencer",
    hurt: "Le Bouclier A Absorbé Le Choc",
    lifeLost: "Vie -1. Retour Au Point De Contrôle"
  });

  Object.assign(i18n.es, {
    ready: "Recoge Monedas, Evita Espinas Y Toca La Bandera",
    start: "Iniciar Juego",
    paused: "Pausa. Toca Para Seguir",
    levelClear: "Nivel Superado, Toca Para Continuar",
    complete: "Los 21 Niveles Completados",
    gameOver: "Fin Del Juego, Toca Para Reiniciar",
    hurt: "El Escudo Absorbió El Golpe",
    lifeLost: "Vida -1. Vuelves Al Punto De Control"
  });

  Object.assign(i18n.ru, {
    ready: "Собирайте Монеты, Избегайте Шипов И Коснитесь Флага",
    start: "Начать Игру",
    paused: "Пауза. Нажмите, Чтобы Продолжить",
    levelClear: "Уровень Пройден, Нажмите Для Продолжения",
    complete: "Все 21 Уровни Пройдены",
    gameOver: "Игра Окончена, Нажмите Для Перезапуска",
    hurt: "Щит Поглотил Удар",
    lifeLost: "Жизнь -1. Возврат К Точке"
  });

  Object.assign(i18n.ar, {
    ready: "اجمع العملات وتجنب الأشواك والمس العلم",
    start: "ابدأ اللعبة",
    paused: "متوقف. اضغط للمتابعة",
    levelClear: "اكتمل المستوى، اضغط للمتابعة",
    complete: "اكتملت 21 مرحلة",
    gameOver: "انتهت اللعبة، اضغط للإعادة",
    hurt: "الدرع امتص الضربة",
    lifeLost: "حياة -1. عودة إلى نقطة الحفظ"
  });

  Object.assign(i18n.ja, {
    ready: "コインを集め、トゲを避け、旗に触れてクリア",
    start: "ゲーム開始",
    paused: "一時停止。タップで再開",
    levelClear: "クリア。タップで次へ",
    complete: "全 21 レベルクリア",
    gameOver: "ゲーム終了。タップで再開",
    hurt: "盾がダメージを吸収",
    lifeLost: "ライフ -1。チェックポイントへ復帰"
  });

  Object.assign(i18n.de, {
    ready: "Sammle Münzen, Meide Dornen Und Berühre Die Flagge",
    start: "Spiel Starten",
    paused: "Pause. Tippen Zum Fortsetzen",
    levelClear: "Level Geschafft, Tippen Zum Weitergehen",
    complete: "Alle 21 Level Geschafft",
    gameOver: "Spiel Vorbei, Tippen Zum Neustart",
    hurt: "Schild Hat Den Treffer Abgefangen",
    lifeLost: "Leben -1. Zurück Zum Kontrollpunkt"
  });

  Object.assign(i18n.zh, {
    levelLocked: "第 10 关起开启选关",
    levelUnlocked: "选关已开启",
    saveLocked: "第 6 关起开启存档",
    saveUnlocked: "存档与读档已解锁"
  });

  Object.assign(i18n.zhHK, {
    levelLocked: "第十关起启选关",
    levelUnlocked: "选关已启",
    saveLocked: "第六关起启存牍",
    saveUnlocked: "存牍读牍已启"
  });

  Object.assign(i18n.en, {
    levelLocked: "Unlocks From Level 10",
    levelUnlocked: "Level Select Unlocked",
    saveLocked: "Save And Load Unlock From Level 6",
    saveUnlocked: "Save And Load Unlocked"
  });

  Object.assign(i18n.fr, {
    levelLocked: "Débloqué À Partir Du Niveau 10",
    levelUnlocked: "Sélection Débloquée",
    saveLocked: "Sauvegarde Et Chargement Dès Le Niveau 6",
    saveUnlocked: "Sauvegarde Et Chargement Débloqués"
  });

  Object.assign(i18n.es, {
    levelLocked: "Se Abre Desde El Nivel 10",
    levelUnlocked: "Selección Desbloqueada",
    saveLocked: "Guardar Y Cargar Desde El Nivel 6",
    saveUnlocked: "Guardar Y Cargar Desbloqueados"
  });

  Object.assign(i18n.ru, {
    levelLocked: "Доступно С Уровня 10",
    levelUnlocked: "Выбор Уровня Открыт",
    saveLocked: "Сохранение И Загрузка С Уровня 6",
    saveUnlocked: "Сохранение И Загрузка Открыты"
  });

  Object.assign(i18n.ar, {
    levelLocked: "يفتح من المستوى 10",
    levelUnlocked: "تم فتح اختيار المستوى",
    saveLocked: "الحفظ والتحميل من المستوى 6",
    saveUnlocked: "تم فتح الحفظ والتحميل"
  });

  Object.assign(i18n.ja, {
    levelLocked: "レベル 10 から解放",
    levelUnlocked: "ステージ選択解放",
    saveLocked: "セーブとロードはレベル 6 から",
    saveUnlocked: "セーブとロード解放"
  });

  Object.assign(i18n.de, {
    levelLocked: "Ab Level 10 Freigeschaltet",
    levelUnlocked: "Levelauswahl Freigeschaltet",
    saveLocked: "Speichern Und Laden Ab Level 6",
    saveUnlocked: "Speichern Und Laden Freigeschaltet"
  });

  const PICKUP_MESSAGE_KEYS = [
    "coin", "stomp", "power", "checkpoint", "saveLocked", "saved", "loaded", "noSave", "saveUnlocked",
    "mysteryCoin", "mysteryShield", "mysteryTime", "mysteryLife", "mysteryTrap", "mysteryEnemy",
    "mysterySpring", "mysteryRage", "spring", "rage", "springStatus", "rageStatus", "rageEnemy", "rageObstacle",
    "lifeMinus"
  ];
  const SUPPORTED_LANGUAGES = ["zh", "zhHK", "en", "fr", "es", "ru", "ar", "ja", "de"];
  const GAME_STATE_MESSAGE_KEYS = [
    "ready", "start", "paused", "levelClear", "complete", "gameOver", "hurt", "lifeLost",
    "moveHint", "jumpHint", "dashHint", "pauseHint", "touchLeft", "touchRight", "touchDash", "touchJump",
    "touchSymbolDash", "touchSymbolJump", "quickPauseBtn", "quickResumeBtn", "quickRestartBtn", "quickSaveBtn", "quickLoadBtn"
  ];
  const DISTINCT_TRANSLATION_KEYS = new Set([
    ...PICKUP_MESSAGE_KEYS,
    "ready", "start", "paused", "levelClear", "complete", "gameOver", "hurt", "lifeLost"
  ]);

  const settings = loadJson(SETTINGS_KEY, {
    heroName: "Star Orchard",
    language: "zh",
    lightMode: "auto",
    weatherMode: "auto",
    maxCleared: 0,
    muted: false
  });

  const state = {
    mode: "title",
    levelIndex: 0,
    lives: 3,
    coins: 0,
    score: 0,
    time: 0,
    cameraX: 0,
    shake: 0,
    saveUnlocked: false,
    solids: [],
    coinsInWorld: [],
    enemies: [],
    hazards: [],
    breakables: [],
    platforms: [],
    powerups: [],
    mysteryBoxes: [],
    checkpoints: [],
    particles: [],
    floaters: [],
    goal: null,
    mapWidth: 0,
    player: null,
    palette: null,
    light: 1,
    flash: 0
  };

  const audio = { ctx: null, master: null, muted: Boolean(settings.muted), unlocked: false };

  const boxRewards = ["coinBurst", "shield", "time", "life", "trap", "enemy", "spring", "rage"];
  let boxRewardBag = [];

  const palettes = [
    { skyTop: "#7ed3ff", sky: "#8ed8f4", skyBottom: "#f5d58b", far: "#acd765", hill: "#56a05a", ground: "#6a4b2b", dirt: "#8b6235", brick: "#b85f3b", accent: "#54d3b8" },
    { skyTop: "#9bdcf8", sky: "#98d3f5", skyBottom: "#f7c97b", far: "#c5cc70", hill: "#69a55a", ground: "#78603f", dirt: "#9c7948", brick: "#a96e44", accent: "#3c86d9" },
    { skyTop: "#7aaacb", sky: "#6f9cc8", skyBottom: "#c99b6a", far: "#9ab870", hill: "#3f7d68", ground: "#54483d", dirt: "#735f4b", brick: "#6f6a61", accent: "#f0c241" },
    { skyTop: "#384b86", sky: "#2f5b7f", skyBottom: "#63508c", far: "#667b8c", hill: "#386d73", ground: "#4e3f36", dirt: "#67533f", brick: "#586b79", accent: "#95e6ff" }
  ];

  const chapters = [
    "Gate of Seedlight",
    "Canopy Causeway",
    "Moss Market",
    "Cloudmill Ridge",
    "Glassroot Caves",
    "Moonlit Aqueduct",
    "The Star Orchard Crown"
  ];

  const localizedChapters = {
    zh: ["种光之门", "树冠栈道", "苔藓集市", "云磨山脊", "玻璃根洞穴", "月光水渠", "星果园王冠"],
    en: chapters,
    fr: ["Porte de graine-lumiere", "Chaussee des cimes", "Marche de mousse", "Crete du moulin-nuage", "Grottes de racines de verre", "Aqueduc au clair de lune", "Couronne du verger etoile"],
    es: ["Puerta de semilla luminosa", "Calzada del dosel", "Mercado de musgo", "Cresta del molino nube", "Cuevas de raiz de cristal", "Acueducto lunar", "Corona del huerto estelar"],
    ru: ["Врата семенного света", "Тропа крон", "Моховой рынок", "Облачная гряда", "Пещеры стеклокорня", "Лунный акведук", "Корона звездного сада"],
    ar: ["بوابة ضوء البذور", "طريق المظلة", "سوق الطحلب", "حافة طاحونة السحاب", "كهوف الجذر الزجاجي", "قناة ضوء القمر", "تاج البستان النجمي"]
  };

  const levels = Array.from({ length: 21 }, (_, i) => buildLevel(i));

  Object.assign(localizedChapters, {
    zh: ["种光之门", "树冠栈道", "苔藓集市", "云磨山脊", "玻璃根洞", "月光水渠", "星果园王冠"],
    zhHK: ["種光之門", "樹冠棧道", "苔蘚市集", "雲磨山脊", "玻璃根洞", "月光水渠", "星果園王冠"],
    ja: ["種光の門", "樹冠の道", "苔の市場", "雲車の尾根", "硝子根の洞窟", "月光の水路", "星果園の冠"],
    de: ["Tor des Samenlichts", "Kronenpfad", "Moosmarkt", "Wolkenmühlen-Kamm", "Glaswurzelhöhlen", "Mondlicht-Aquädukt", "Krone des Sternobstgartens"],
    ru: ["Врата семенного света", "Путь крон", "Моховой рынок", "Облачный хребет", "Пещеры стеклокорня", "Лунный акведук", "Корона звёздного сада"],
    ar: ["بوابة ضوء البذور", "طريق الظلال", "سوق الطحلب", "حافة طاحونة السحاب", "كهوف الجذر الزجاجي", "قناة ضوء القمر", "تاج البستان النجمي"]
  });

  function t(key) {
    return (i18n[settings.language] || i18n.en)[key] || i18n.en[key] || key;
  }

  function requiredI18nKeys() {
    const domKeys = Array.from(document.querySelectorAll("[data-i18n]"), (node) => node.getAttribute("data-i18n"));
    return Array.from(new Set([...domKeys, ...GAME_STATE_MESSAGE_KEYS, ...PICKUP_MESSAGE_KEYS]));
  }

  function auditLanguageSystem() {
    const missing = [];
    const blank = [];
    const inherited = [];
    const chapterIssues = [];
    const selectIssues = [];
    const requiredKeys = requiredI18nKeys();
    for (const language of SUPPORTED_LANGUAGES) {
      if (!i18n[language]) {
        missing.push(`${language}.*`);
        continue;
      }
      for (const key of requiredKeys) {
        const value = i18n[language][key];
        if (value === undefined || value === null) {
          missing.push(`${language}.${key}`);
          continue;
        }
        if (String(value).trim() === "") blank.push(`${language}.${key}`);
        if (language !== "en" && DISTINCT_TRANSLATION_KEYS.has(key) && value === i18n.en[key]) inherited.push(`${language}.${key}`);
      }
      if (!localizedChapters[language] || localizedChapters[language].length !== chapters.length) chapterIssues.push(language);
    }
    [systemLanguageSelect, languageSelect].forEach((select) => {
      if (!select) return;
      const values = new Set(Array.from(select.options, (option) => option.value));
      for (const language of SUPPORTED_LANGUAGES) {
        if (!values.has(language)) selectIssues.push(`${select.id}.${language}`);
      }
    });
    if (missing.length || blank.length || inherited.length || chapterIssues.length || selectIssues.length) {
      console.warn("Star Orchard language checkpoints", { missing, blank, inherited, chapterIssues, selectIssues });
      return false;
    }
    return true;
  }

  function auditProgressionCheckpoints() {
    const issues = [];
    if (SAVE_UNLOCK_LEVEL !== 6 || SAVE_UNLOCK_INDEX !== 5 || SAVE_UNLOCK_CLEARED !== 5) issues.push("saveUnlockRule");
    if (LEVEL_SELECT_UNLOCK_LEVEL !== 10 || LEVEL_SELECT_UNLOCK_INDEX !== 9 || LEVEL_SELECT_UNLOCK_CLEARED !== 9) issues.push("levelSelectUnlockRule");
    for (const language of SUPPORTED_LANGUAGES) {
      const levelMessage = i18n[language]?.levelLocked || "";
      const saveMessage = i18n[language]?.saveLocked || "";
      if (!/(10|十)/.test(levelMessage)) issues.push(`${language}.levelSelectUnlockNumber`);
      if (!/(6|六)/.test(saveMessage)) issues.push(`${language}.saveUnlockNumber`);
      if (/Level 6|Niveau 6|Nivel 6|Уровня 6|المستوى 6|レベル 6|第 6|第六/.test(levelMessage)) issues.push(`${language}.levelSelectMessage`);
      if (/Level 10|Niveau 10|Nivel 10|Уровня 10|المستوى 10|レベル 10|第 10|第十/.test(saveMessage)) issues.push(`${language}.saveMessage`);
    }
    if (issues.length) {
      console.warn("Star Orchard progression checkpoints", issues);
      return false;
    }
    return true;
  }

  function auditInputCheckpoints() {
    const requiredTouchButtons = ["touchLeft", "touchRight", "touchDash", "touchJump"];
    const missing = requiredTouchButtons.filter((id) => !document.getElementById(id));
    if (missing.length) {
      console.warn("Star Orchard input checkpoints", { missing });
      return false;
    }
    return true;
  }

  function auditEffectCheckpoints() {
    const checks = [
      ["green", effectProgressColor(2 / 3) === "#45d66f"],
      ["yellowFloor", effectProgressColor(1 / 5) === "#ffd447"],
      ["yellowMid", effectProgressColor(0.4) === "#ffd447"],
      ["red", effectProgressColor(0.19) === "#ff5e4f"],
      ["springRatio", effectProgressRatio(SPRING_DURATION * 2 / 3, SPRING_DURATION) >= 2 / 3 - 0.0001],
      ["rageRatio", effectProgressRatio(RAGE_DURATION / 5, RAGE_DURATION) >= 1 / 5 - 0.0001]
    ];
    const failed = checks.filter(([, pass]) => !pass).map(([name]) => name);
    if (failed.length) {
      console.warn("Star Orchard effect checkpoints", failed);
      return false;
    }
    return true;
  }

  function auditControlCheckpoints() {
    const springJump = CONTROL_TUNING.jumpPower * SPRING_JUMP_MULTIPLIER;
    const dashRatio = CONTROL_TUNING.dashSpeed / CONTROL_TUNING.walkSpeed;
    const checks = [
      ["walkSpeed", CONTROL_TUNING.walkSpeed >= 170 && CONTROL_TUNING.walkSpeed <= 210],
      ["dashSpeed", CONTROL_TUNING.dashSpeed > CONTROL_TUNING.walkSpeed && dashRatio >= 1.28 && dashRatio <= 1.5],
      ["groundAccel", CONTROL_TUNING.groundAccel > CONTROL_TUNING.airAccel],
      ["friction", CONTROL_TUNING.groundFriction > CONTROL_TUNING.airFriction],
      ["jumpPower", CONTROL_TUNING.jumpPower >= 580 && CONTROL_TUNING.jumpPower <= 650],
      ["springJumpBalance", springJump >= 800 && springJump <= 890],
      ["jumpBuffer", CONTROL_TUNING.jumpBuffer >= 0.08 && CONTROL_TUNING.jumpBuffer <= 0.16],
      ["coyoteTime", CONTROL_TUNING.coyoteTime >= 0.07 && CONTROL_TUNING.coyoteTime <= 0.13],
      ["shortHop", CONTROL_TUNING.shortHopCutoff >= 130 && CONTROL_TUNING.shortHopCutoff <= 190]
    ];
    const failed = checks.filter(([, pass]) => !pass).map(([name]) => name);
    if (failed.length) {
      console.warn("Star Orchard control checkpoints", { failed, tuning: CONTROL_TUNING, dashRatio, springJump });
      return false;
    }
    return true;
  }

  function auditLevelCheckpoints() {
    const issues = [];
    const tierNames = new Set();
    let previousDifficulty = 0;
    levels.forEach((level, index) => {
      const tier = difficultyTierFor(level.levelNo);
      tierNames.add(level.difficultyTier);
      if (level.difficultyTier !== tier.name) issues.push(`${level.levelNo}.tier`);
      if (level.difficulty < previousDifficulty - 0.01) issues.push(`${level.levelNo}.difficultyDrop`);
      previousDifficulty = Math.max(previousDifficulty, level.difficulty);
      if (level.checkpoints.length < 2) issues.push(`${level.levelNo}.checkpoints`);
      if (!level.goal || level.goal.x <= level.spawn.x) issues.push(`${level.levelNo}.goal`);
      if (level.width < W * 1.4) issues.push(`${level.levelNo}.width`);
      if (level.enemies.length + level.hazards.length < Math.max(6, tier.enemies + tier.hazards - 3)) issues.push(`${level.levelNo}.pressure`);
      if (level.solids.length < level.width / TILE) issues.push(`${level.levelNo}.solids`);
    });
    for (const tier of DIFFICULTY_TIERS) {
      if (!tierNames.has(tier.name)) issues.push(`missingTier.${tier.name}`);
    }
    if (issues.length) {
      console.warn("Star Orchard level checkpoints", issues);
      return false;
    }
    return true;
  }

  function auditLayoutCheckpoints() {
    const ids = ["touchLeft", "touchRight", "touchDash", "touchJump", "systemBtn", "quickRestartBtn", "quickPauseBtn"];
    const missing = ids.filter((id) => !document.getElementById(id));
    const hud = document.querySelector(".hud-strip");
    const touch = document.querySelector(".touch-controls");
    const stage = document.querySelector(".stage-frame");
    if (missing.length || !hud || !touch || !stage) {
      console.warn("Star Orchard layout checkpoints", { missing, hud: Boolean(hud), touch: Boolean(touch), stage: Boolean(stage) });
      return false;
    }
    const rect = (selectorOrId) => {
      const node = selectorOrId.startsWith(".") ? document.querySelector(selectorOrId) : document.getElementById(selectorOrId);
      return node ? node.getBoundingClientRect() : null;
    };
    const gapBetween = (leftRect, rightRect) => rightRect.left - leftRect.right;
    const stageRect = stage.getBoundingClientRect();
    const hudRect = hud.getBoundingClientRect();
    const touchRect = touch.getBoundingClientRect();
    if (stageRect.width <= 0 || stageRect.height <= 0) return true;
    const leftRect = rect("touchLeft");
    const rightRect = rect("touchRight");
    const dashRect = rect("touchDash");
    const jumpRect = rect("touchJump");
    const systemRect = rect("systemBtn");
    const quickRect = rect("quickRestartBtn");
    const firstStat = document.querySelector(".stat-card");
    const statRect = firstStat ? firstStat.getBoundingClientRect() : null;
    const levelOptions = document.getElementById("levelSelectOptions");
    const layoutIssues = [];
    if (hudRect.width > stageRect.width * 0.78) layoutIssues.push("hudTooWide");
    if (hudRect.bottom + 8 > touchRect.top) layoutIssues.push("hudTouchOverlap");
    if (touchRect.top < stageRect.top + stageRect.height * 0.56) layoutIssues.push("touchTooHigh");
    if (leftRect && rightRect && gapBetween(leftRect, rightRect) < 6) layoutIssues.push("moveButtonGap");
    if (dashRect && jumpRect && gapBetween(dashRect, jumpRect) < 6) layoutIssues.push("actionButtonGap");
    const compactHud = window.matchMedia?.("(pointer: coarse), (max-width: 760px)")?.matches;
    if (compactHud && statRect && systemRect && Math.abs(systemRect.height - statRect.height) > 3) layoutIssues.push("systemHudHeight");
    if (compactHud && statRect && quickRect && Math.abs(quickRect.height - statRect.height) > 3) layoutIssues.push("quickHudHeight");
    if (levelOptions) {
      const columns = getComputedStyle(levelOptions).gridTemplateColumns.split(" ").filter(Boolean).length;
      if (columns !== 2) layoutIssues.push("levelOptionColumns");
    }
    if (layoutIssues.length) {
      console.warn("Star Orchard layout checkpoints", layoutIssues);
      return false;
    }
    return true;
  }

  function auditButtonCheckpoints() {
    const buttonKeys = [
      "startGameBtn", "startBtn", "restartBtn", "pauseBtn", "resumeBtn", "soundOn", "soundOff",
      "saveBtn", "loadBtn", "quickPauseBtn", "quickResumeBtn", "quickRestartBtn", "quickSaveBtn",
      "quickLoadBtn", "systemTitle", "touchLeft", "touchRight", "touchDash", "touchJump"
    ];
    const missing = [];
    const blank = [];
    for (const language of SUPPORTED_LANGUAGES) {
      for (const key of buttonKeys) {
        const value = i18n[language]?.[key];
        if (value === undefined || value === null) missing.push(`${language}.${key}`);
        else if (String(value).trim() === "") blank.push(`${language}.${key}`);
      }
    }
    if (missing.length || blank.length) {
      console.warn("Star Orchard button language checkpoints", { missing, blank });
      return false;
    }
    return true;
  }

  function runSystemCheckpoints() {
    const results = [
      ["moonPhase", moonPhaseCheckpointsPass()],
      ["language", auditLanguageSystem()],
      ["progression", auditProgressionCheckpoints()],
      ["input", auditInputCheckpoints()],
      ["effects", auditEffectCheckpoints()],
      ["controls", auditControlCheckpoints()],
      ["levels", auditLevelCheckpoints()],
      ["layout", auditLayoutCheckpoints()],
      ["buttons", auditButtonCheckpoints()]
    ];
    const failed = results.filter(([, pass]) => !pass).map(([name]) => name);
    if (failed.length) console.warn("Star Orchard system checkpoints failed", failed);
    return failed.length === 0;
  }

  const systemLanguageNames = {
    zh: "中文",
    zhHK: "中文古体",
    en: "English",
    fr: "Français",
    es: "Español",
    ru: "Русский",
    ar: "العربية",
    ja: "日本語",
    de: "Deutsch"
  };

  function syncLanguageOptionNames() {
    [systemLanguageSelect, languageSelect].forEach((select) => {
      if (!select) return;
      const existing = new Set(Array.from(select.options, (option) => option.value));
      for (const language of SUPPORTED_LANGUAGES) {
        if (existing.has(language)) continue;
        const option = document.createElement("option");
        option.value = language;
        select.appendChild(option);
      }
      Array.from(select.options).forEach((option) => {
        if (systemLanguageNames[option.value]) option.textContent = systemLanguageNames[option.value];
      });
    });
  }

  function renderSystemOptionBlocks() {
    [systemLanguageSelect, systemLightSelect, weatherSelect, levelSelect].forEach(renderSystemOptionBlock);
  }

  function renderSystemOptionBlock(select) {
    if (!select || !select.parentElement) return;
    select.classList.add("native-system-select");
    const blockId = `${select.id}Options`;
    let block = document.getElementById(blockId);
    if (!block) {
      block = document.createElement("div");
      block.id = blockId;
      block.className = "system-option-block";
      block.setAttribute("role", "listbox");
      block.dataset.systemOptions = select.id;
      select.insertAdjacentElement("afterend", block);
    }
    block.innerHTML = "";
    block.setAttribute("aria-disabled", select.disabled ? "true" : "false");
    Array.from(select.options).forEach((option) => {
      const item = document.createElement("button");
      item.type = "button";
      item.className = "system-option";
      item.textContent = option.textContent;
      item.dataset.optionValue = option.value;
      item.setAttribute("role", "option");
      item.setAttribute("aria-selected", option.value === select.value ? "true" : "false");
      item.dir = option.value === "ar" ? "rtl" : "ltr";
      item.disabled = select.disabled || option.disabled;
      if (option.value === select.value) item.classList.add("is-selected");
      item.addEventListener("click", () => {
        if (item.disabled) return;
        select.value = option.value;
        select.dispatchEvent(new Event("change", { bubbles: true }));
      });
      block.appendChild(item);
    });
  }

  function pickBoxReward(rng, levelNo) {
    const pool = levelNo < 3 ? boxRewards.filter((reward) => !["trap", "enemy"].includes(reward)) : boxRewards;
    if (boxRewardBag.length === 0 || boxRewardBag.some((reward) => !pool.includes(reward))) {
      boxRewardBag = [...pool];
      for (let i = boxRewardBag.length - 1; i > 0; i--) {
        const j = Math.floor(rng() * (i + 1));
        [boxRewardBag[i], boxRewardBag[j]] = [boxRewardBag[j], boxRewardBag[i]];
      }
    }
    return boxRewardBag.pop();
  }

  function pickTreasureKind(rng, index) {
    const rageChance = clamp(0.18 + index * 0.012, 0.18, 0.38);
    return rng() < rageChance ? "rage" : "shield";
  }

  function effectTime(value) {
    return value > EFFECT_EXPIRE_EPSILON ? value : 0;
  }

  function effectProgressRatio(time, duration) {
    return duration > 0 ? clamp(effectTime(time) / duration, 0, 1) : 0;
  }

  function effectProgressColor(ratio) {
    if (ratio >= 2 / 3) return "#45d66f";
    if (ratio >= 1 / 5) return "#ffd447";
    return "#ff5e4f";
  }

  function hasSpring(player = state.player) {
    return Boolean(player && effectTime(player.springTimer || 0) > 0);
  }

  function hasRage(player = state.player) {
    return Boolean(player && effectTime(player.rageTimer || 0) > 0);
  }

  function activeSpringTime() {
    return state.player ? effectTime(state.player.springTimer || 0) : 0;
  }

  function activeEnemySpeedScale() {
    return activeSpringTime() > 0 ? SPRING_ENEMY_SPEED_MULTIPLIER : 1;
  }

  function tickPlayerEffects(player, dt) {
    if (player.springTimer > 0) player.springTimer = effectTime(player.springTimer - dt);
    if (player.rageTimer > 0) player.rageTimer = effectTime(player.rageTimer - dt);
  }

  function chapterNameFor(levelIndex) {
    const names = localizedChapters[settings.language] || localizedChapters.en;
    return names[Math.floor(levelIndex / 3)] || chapters[Math.floor(levelIndex / 3)];
  }

  function loadJson(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? { ...fallback, ...JSON.parse(raw) } : { ...fallback };
    } catch {
      return { ...fallback };
    }
  }

  function saveSettings() {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  }

  function difficultyTierFor(levelNo) {
    return DIFFICULTY_TIERS.find((tier) => levelNo >= tier.start && levelNo <= tier.end) || DIFFICULTY_TIERS[DIFFICULTY_TIERS.length - 1];
  }

  function levelCycleVariant(levelNo) {
    const cycle = Math.floor((levelNo - 1) / 3);
    const rng = randFor(RUN_SEED + cycle * 997 + 91);
    const signedStep = () => Math.floor(rng() * 3) - 1;
    return {
      cycle,
      gapShift: signedStep(),
      platformShift: signedStep(),
      enemyShift: signedStep(),
      hazardShift: signedStep(),
      coinShift: Math.floor(rng() * 3),
      bridgeBias: rng()
    };
  }

  function buildLevel(index) {
    const levelNo = index + 1;
    const world = Math.floor(index / 3) + 1;
    const stage = (index % 3) + 1;
    const tier = difficultyTierFor(levelNo);
    const variant = levelCycleVariant(levelNo);
    const rng = randFor(levelNo);
    const treasureRng = randFor(RUN_SEED + levelNo * 313 + 17);
    const stageLift = stage - 1;
    const widthTiles = 154 + index * 6 + Math.floor(index / 3) * 5 + Math.floor((variant.bridgeBias - 0.5) * 6);
    const width = widthTiles * TILE;
    const difficulty = tier.coefficient + (levelNo - tier.start) * 0.12 + stageLift * 0.04;
    const gapCount = clamp(tier.gaps + variant.gapShift, 2, 8);
    const gapWidth = clamp(tier.gapWidth + (stage === 3 && levelNo >= 12 ? 1 : 0), 2, 5);
    const gaps = [];
    const spacing = Math.floor((widthTiles - 36) / gapCount);

    for (let i = 0; i < gapCount; i++) {
      const start = 24 + i * spacing + Math.floor(rng() * Math.max(5, spacing - 10));
      gaps.push({ start, end: Math.min(widthTiles - 16, start + gapWidth + (i % 2 && index > 10 ? 1 : 0)) });
    }

    const solids = [];
    const addSolid = (tx, ty, type = "G") => solids.push({ x: tx * TILE, y: ty * TILE, w: TILE, h: TILE, tx, ty, type });
    const inGap = (tx) => gaps.some((g) => tx >= g.start && tx <= g.end);

    for (let tx = 0; tx < widthTiles; tx++) {
      if (inGap(tx)) continue;
      addSolid(tx, 14, "G");
      addSolid(tx, 15, "G");
    }

    for (const gap of gaps) {
      const bridgeY = index > 6 && rng() > 0.38 + variant.bridgeBias * 0.18 ? 11 : 12;
      const bridgeW = clamp(gapWidth - 1, 2, 4);
      for (let tx = gap.start + 1; tx < gap.start + 1 + bridgeW; tx++) addSolid(tx, bridgeY, "B");
    }

    const platforms = [];
    const coins = [];
    const hazards = [];
    const enemies = [];
    const breakables = [];
    const powerups = [];
    const mysteryBoxes = [];
    const maxBoxes = 2 + Math.floor(index / 7) + (treasureRng() > 0.45 ? 1 : 0);
    const checkpoints = [
      { x: Math.floor(width * 0.36), y: GROUND_Y - 74, w: 20, h: 74, active: false },
      { x: Math.floor(width * 0.68), y: GROUND_Y - 74, w: 20, h: 74, active: false }
    ];
    const addMysteryBox = (tx, ty, salt = 0) => {
      if (mysteryBoxes.length >= maxBoxes || tx < 8 || tx > widthTiles - 12 || inGap(tx)) return;
      if (solids.some((s) => s.tx === tx && s.ty === ty)) return;
      mysteryBoxes.push({
        x: tx * TILE,
        y: ty * TILE,
        w: TILE,
        h: TILE,
        type: "M",
        opened: false,
        bump: 0,
        reward: pickBoxReward(treasureRng, levelNo)
      });
    };
    const addBreakable = (tx, salt = 0) => {
      if (tx < 10 || tx > widthTiles - 12 || inGap(tx)) return;
      if (breakables.some((b) => Math.abs(b.tx - tx) < 4)) return;
      breakables.push({ x: tx * TILE + 2, y: GROUND_Y - 30, w: 28, h: 30, tx, type: "X", active: true, variant: (levelNo + salt) % 3 });
    };

    const platformCount = clamp(tier.platforms + variant.platformShift + stageLift, 7, 20);
    for (let i = 0; i < platformCount; i++) {
      const tx = 12 + i * Math.floor((widthTiles - 28) / platformCount) + Math.floor(rng() * 5);
      const ty = [10, 11, 12][(i + index) % 3];
      const len = 3 + ((i + index) % 3);
      for (let j = 0; j < len; j++) addSolid(tx + j, ty, "B");
      coins.push({ x: (tx + 1.1) * TILE, y: (ty - 1) * TILE + 6, w: 14, h: 18, taken: false, t: rng() * 10 });
      if ((i + index) % 3 === 1) addMysteryBox(tx + Math.floor(len / 2), ty - 2, i * 2);
      if (treasureRng() < 0.36 + Math.min(0.18, index * 0.01)) {
        const treasureTx = tx + Math.floor(treasureRng() * len);
        powerups.push({
          x: treasureTx * TILE + 8,
          y: (ty - 1) * TILE + 6,
          w: 18,
          h: 18,
          vx: treasureRng() > 0.5 ? 58 : -58,
          vy: -80 - treasureRng() * 36,
          active: true,
          kind: pickTreasureKind(treasureRng, index)
        });
      }
    }

    const movingCount = clamp(tier.moving + (stage === 3 && levelNo > 10 ? 1 : 0), 0, 4);
    for (let i = 0; i < movingCount; i++) {
      const x = (34 + i * Math.floor(widthTiles / (movingCount + 1))) * TILE;
      const y = (index > 12 && i % 2 ? 300 : 352) - (i % 2) * 34;
      platforms.push({ x, y, w: TILE * 3, h: 12, vx: 58 + index * 2, startX: x - TILE * 2, endX: x + TILE * 4 });
    }

    const coinRuns = 14 + index + variant.coinShift;
    for (let i = 0; i < coinRuns; i++) {
      const x = (10 + i * Math.floor((widthTiles - 24) / coinRuns)) * TILE + 9;
      const y = (i % 3 === 0 ? 342 : 392) - (index > 14 && i % 4 === 0 ? 36 : 0);
      coins.push({ x, y, w: 14, h: 18, taken: false, t: rng() * 10 });
    }

    for (let i = 0; i < 2 + Math.floor(index / 8); i++) {
      const tx = 18 + i * Math.floor((widthTiles - 36) / 3) + Math.floor(rng() * 8);
      addMysteryBox(tx, 10 + (i % 2), i + 17);
    }

    const enemyCount = clamp(tier.enemies + variant.enemyShift + Math.floor(stageLift / 2), 4, 18);
    for (let i = 0; i < enemyCount; i++) {
      let tx = 18 + i * Math.floor((widthTiles - 32) / enemyCount);
      while (inGap(tx) && tx < widthTiles - 18) tx += 1;
      enemies.push({ x: tx * TILE + 2, y: GROUND_Y - 27, w: 28, h: 27, vx: i % 2 ? 58 : -58, vy: 0, alive: true, grounded: false });
    }

    const hazardCount = clamp(tier.hazards + variant.hazardShift + (stage === 3 ? 1 : 0), 3, 16);
    for (let i = 0; i < hazardCount; i++) {
      let tx = 28 + i * Math.floor((widthTiles - 44) / hazardCount);
      while (inGap(tx) && tx < widthTiles - 16) tx += 1;
      hazards.push({ x: tx * TILE + 4, y: GROUND_Y - 22, w: 24, h: 22, active: true });
    }

    if (index === 8) {
      const checkpointTx = Math.floor(checkpoints[0].x / TILE);
      const checkpointGap = gaps.find((gap) => checkpointTx >= gap.start && checkpointTx <= gap.end);
      if (checkpointGap) {
        checkpoints[0].x = (checkpointGap.start - 4) * TILE + 6;
        for (let i = solids.length - 1; i >= 0; i--) {
          const solid = solids[i];
          if (solid.tx >= checkpointGap.start && solid.tx <= checkpointGap.end && solid.ty >= 11 && solid.ty <= 12) solids.splice(i, 1);
        }
        const addTuningBlock = (tx, ty) => {
          if (!solids.some((s) => s.tx === tx && s.ty === ty)) addSolid(tx, ty, "B");
        };
        addTuningBlock(checkpointGap.start, 13);
        addTuningBlock(checkpointGap.start + 1, 12);
        addTuningBlock(checkpointGap.start + 2, 11);
        for (const hazard of hazards) {
          const tx = Math.floor(hazard.x / TILE);
          if (tx > checkpointGap.end && tx <= checkpointGap.end + 2) hazard.x = (checkpointGap.end + 5) * TILE + 4;
        }
      }
    }

    const breakableCount = index < 2 ? 1 : 2 + Math.floor(index / 6);
    for (let i = 0; i < breakableCount; i++) {
      const tx = 34 + i * Math.floor((widthTiles - 62) / Math.max(1, breakableCount)) + Math.floor(treasureRng() * 10);
      addBreakable(tx, i);
    }

    const goal = { x: width - TILE * 6, y: GROUND_Y - TILE * 4, w: 24, h: TILE * 4 };
    return {
      name: `${world}-${stage}`,
      levelNo,
      chapter: chapters[world - 1],
      width,
      spawn: { x: 96, y: GROUND_Y - PLAYER_H },
      time: Math.max(170, 340 - index * 6),
      difficulty,
      difficultyTier: tier.name,
      cycle: variant.cycle,
      solids,
      coins,
      enemies,
      hazards,
      breakables,
      platforms,
      powerups,
      mysteryBoxes,
      checkpoints,
      goal,
      palette: palettes[Math.floor(index / 5) % palettes.length]
    };
  }

  function makePlayer(x, y) {
    return {
      x,
      y,
      w: PLAYER_W,
      h: PLAYER_H,
      vx: 0,
      vy: 0,
      dir: 1,
      grounded: false,
      coyote: 0,
      jumpBuffer: 0,
      invincible: 0,
      power: 0,
      springTimer: 0,
      rageTimer: 0,
      checkpoint: { x, y },
      dead: false
    };
  }

  function cloneEntity(e) {
    return { ...e };
  }

  function loadLevel(index, keepStats = true, spawnOverride = null) {
    const level = levels[index];
    state.levelIndex = index;
    state.time = level.time;
    state.cameraX = 0;
    state.shake = 0;
    state.solids = level.solids.map(cloneEntity);
    state.coinsInWorld = level.coins.map(cloneEntity);
    state.enemies = level.enemies.map(cloneEntity);
    state.hazards = level.hazards.map(cloneEntity);
    state.breakables = level.breakables.map(cloneEntity);
    state.platforms = level.platforms.map(cloneEntity);
    state.powerups = level.powerups.map(cloneEntity);
    state.mysteryBoxes = level.mysteryBoxes.map(cloneEntity);
    state.checkpoints = level.checkpoints.map(cloneEntity);
    state.goal = cloneEntity(level.goal);
    state.mapWidth = level.width;
    state.palette = level.palette;
    state.particles = [];
    state.floaters = [];
    state.flash = 0;
    if (!keepStats) {
      state.lives = 3;
      state.coins = 0;
      state.score = 0;
      state.saveUnlocked = false;
    }
    const spawn = spawnOverride || level.spawn;
    state.player = makePlayer(spawn.x, spawn.y);
    resetInput();
    updateHud();
    updateSaveButtons();
    updateChapter();
    setOverlay(state.mode === "title" ? t("start") : "");
  }

  function ensureAudio() {
    if (audio.muted) return false;
    if (!audio.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return false;
      audio.ctx = new AudioContext();
      audio.master = audio.ctx.createGain();
      audio.master.gain.value = 0.14;
      audio.master.connect(audio.ctx.destination);
    }
    if (audio.ctx.state === "suspended") audio.ctx.resume();
    audio.unlocked = true;
    return true;
  }

  function tone(freq, duration = 0.1, type = "square", gain = 0.25, delay = 0) {
    if (!ensureAudio()) return;
    const now = audio.ctx.currentTime + delay;
    const osc = audio.ctx.createOscillator();
    const amp = audio.ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    amp.gain.setValueAtTime(0.0001, now);
    amp.gain.exponentialRampToValueAtTime(gain, now + 0.012);
    amp.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    osc.connect(amp);
    amp.connect(audio.master);
    osc.start(now);
    osc.stop(now + duration + 0.02);
  }

  function noise(duration = 0.12, gain = 0.12, delay = 0, filterFreq = 1200) {
    if (!ensureAudio()) return;
    const now = audio.ctx.currentTime + delay;
    const buffer = audio.ctx.createBuffer(1, Math.floor(audio.ctx.sampleRate * duration), audio.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    const source = audio.ctx.createBufferSource();
    const filter = audio.ctx.createBiquadFilter();
    const amp = audio.ctx.createGain();
    filter.type = "bandpass";
    filter.frequency.value = filterFreq;
    filter.Q.value = 0.9;
    amp.gain.setValueAtTime(gain, now);
    amp.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    source.buffer = buffer;
    source.connect(filter);
    filter.connect(amp);
    amp.connect(audio.master);
    source.start(now);
    source.stop(now + duration);
  }

  function motif(notes, step = 0.055, type = "square", gain = 0.2) {
    notes.forEach((f, i) => tone(f, 0.08 + i * 0.006, type, gain, i * step));
  }

  function playSound(name) {
    if (audio.muted) return;
    const patterns = {
      start: () => motif([392, 523, 659, 784], 0.052, "triangle", 0.2),
      jump: () => tone(330, 0.13, "square", 0.2),
      coin: () => motif([988, 1318, 1568], 0.038, "sine", 0.18),
      stomp: () => {
        tone(170, 0.08, "sawtooth", 0.22);
        tone(92, 0.12, "square", 0.18, 0.045);
      },
      hurt: () => {
        noise(0.18, 0.12, 0, 520);
        motif([220, 146, 110], 0.06, "sawtooth", 0.16);
      },
      checkpoint: () => motif([392, 523, 784, 1046], 0.058, "triangle", 0.18),
      clear: () => motif([523, 659, 784, 1046, 1318], 0.07, "triangle", 0.2),
      button: () => tone(700, 0.055, "triangle", 0.12),
      mystery: () => motif([659, 880, 1174, 880], 0.044, "triangle", 0.2),
      trap: () => {
        noise(0.12, 0.08, 0, 340);
        motif([196, 164, 130], 0.05, "sawtooth", 0.16);
      },
      enemyDrop: () => {
        tone(262, 0.09, "square", 0.16);
        noise(0.09, 0.08, 0.05, 620);
      },
      life: () => motif([523, 659, 784, 988, 1318], 0.052, "triangle", 0.2),
      time: () => motif([440, 554, 659], 0.046, "sine", 0.16),
      shield: () => motif([330, 494, 659, 988], 0.05, "triangle", 0.18)
    };
    (patterns[name] || patterns.button)();
  }

  function renderOverlayText(text) {
    overlayText.textContent = "";
    const parts = String(text).split(/([,，.!。!！?？:：;；])/u).filter(Boolean);
    parts.forEach((part) => {
      const node = document.createElement("span");
      if (/^[,，.!。!！?？:：;；]$/u.test(part)) {
        node.className = "overlay-punct";
        node.textContent = "✦";
        node.setAttribute("aria-label", part);
      } else {
        node.className = "overlay-word";
        node.textContent = part;
      }
      overlayText.appendChild(node);
    });
  }

  function setOverlay(text) {
    if (!text) {
      overlay.classList.add("hidden");
      stageFrame.classList.add("is-playing");
      return;
    }
    overlay.classList.remove("hidden");
    stageFrame.classList.remove("is-playing");
    renderOverlayText(text);
  }

  function announce(text, x = null, y = null, color = "#fff4a8", sound = null) {
    cueFeed.textContent = text;
    cueFeed.classList.remove("pop");
    cueFeed.offsetWidth;
    cueFeed.classList.add("pop");
    if (x !== null && y !== null) addFloater(x, y, text, color);
    if (sound) playSound(sound);
  }

  function addParticle(x, y, color, count = 8) {
    for (let i = 0; i < count; i++) {
      state.particles.push({
        x,
        y,
        vx: (Math.random() * 2 - 1) * 180,
        vy: -Math.random() * 260,
        life: 0.35 + Math.random() * 0.35,
        color,
        size: 2 + Math.random() * 4
      });
    }
  }

  function addFloater(x, y, text, color) {
    state.floaters.push({ x, y, text, color, life: 1.05, vy: -42, wobble: Math.random() * 6.28 });
  }

  function hitPoint(entity, yOffset = -10) {
    return {
      x: entity.x + entity.w / 2,
      y: entity.y + yOffset
    };
  }

  function grantSpring(x, y, messageKey = "spring") {
    const p = state.player;
    p.springTimer = SPRING_DURATION;
    p.invincible = Math.max(p.invincible, 0.9);
    state.score += 450;
    addParticle(x, y, "#8fd7ff", 22);
    announce(t(messageKey), x, y - 18, "#8fd7ff", "time");
    updateHud();
  }

  function grantRage(x, y, messageKey = "rage") {
    const p = state.player;
    p.rageTimer = RAGE_DURATION;
    p.invincible = Math.max(p.invincible, 0.5);
    state.score += 400;
    addParticle(x, y, "#ff8067", 24);
    announce(t(messageKey), x, y - 18, "#ffb26f", "shield");
    updateHud();
  }

  function smashEnemy(enemy) {
    if (!enemy.alive) return;
    enemy.alive = false;
    state.score += 300;
    state.shake = Math.max(state.shake, 0.12);
    addParticle(enemy.x + enemy.w / 2, enemy.y + enemy.h / 2, "#ff8067", 18);
    announce(t("rageEnemy"), enemy.x + enemy.w / 2, enemy.y - 8, "#ffb26f", "stomp");
    updateHud();
  }

  function smashObstacle(obstacle) {
    if (!obstacle.active) return;
    obstacle.active = false;
    state.score += 150;
    state.shake = Math.max(state.shake, 0.1);
    addParticle(obstacle.x + obstacle.w / 2, obstacle.y + obstacle.h / 2, "#c89b63", 16);
    announce(t("rageObstacle"), obstacle.x + obstacle.w / 2, obstacle.y - 10, "#ffd447", "trap");
    updateHud();
  }

  function activateMysteryBox(box) {
    if (box.opened) return;
    const p = state.player;
    box.opened = true;
    box.bump = 0.18;
    state.score += 50;
    addParticle(box.x + TILE / 2, box.y + 6, "#ffd447", 12);
    playSound("mystery");

    if (box.reward === "coinBurst") {
      state.coins += 5;
      state.score += 500;
      addParticle(box.x + TILE / 2, box.y - 4, "#ffd84d", 22);
      announce(t("mysteryCoin"), box.x + TILE / 2, box.y - 18, "#ffd447", "coin");
    } else if (box.reward === "shield") {
      p.power = Math.min(2, p.power + 1);
      p.invincible = Math.max(p.invincible, 1.1);
      state.score += 350;
      addParticle(box.x + TILE / 2, box.y - 4, "#6ee7c8", 18);
      announce(t("mysteryShield"), box.x + TILE / 2, box.y - 18, "#6ee7c8", "shield");
    } else if (box.reward === "time") {
      state.time += 20;
      state.score += 200;
      addParticle(box.x + TILE / 2, box.y - 4, "#8fd7ff", 16);
      announce(t("mysteryTime"), box.x + TILE / 2, box.y - 18, "#8fd7ff", "time");
    } else if (box.reward === "life") {
      state.lives = Math.min(9, state.lives + 1);
      state.score += 800;
      addParticle(box.x + TILE / 2, box.y - 4, "#fff4a8", 24);
      announce(t("mysteryLife"), box.x + TILE / 2, box.y - 18, "#fff4a8", "life");
    } else if (box.reward === "trap") {
      state.time = Math.max(10, state.time - 18);
      state.shake = 0.22;
      p.invincible = Math.max(p.invincible, 0.7);
      p.vx = -p.dir * 240;
      p.vy = Math.max(p.vy, 180);
      addParticle(box.x + TILE / 2, box.y + TILE / 2, "#e85e4f", 18);
      announce(t("mysteryTrap"), box.x + TILE / 2, box.y - 18, "#ff8b6e", "trap");
    } else if (box.reward === "enemy") {
      state.enemies.push({
        x: box.x + 2,
        y: box.y - 27,
        w: 28,
        h: 27,
        vx: p.x < box.x ? 76 : -76,
        vy: -150,
        alive: true,
        grounded: false
      });
      addParticle(box.x + TILE / 2, box.y - 4, "#a9683c", 14);
      announce(t("mysteryEnemy"), box.x + TILE / 2, box.y - 18, "#ffb26f", "enemyDrop");
    } else if (box.reward === "spring") {
      grantSpring(box.x + TILE / 2, box.y - 4, "mysterySpring");
    } else if (box.reward === "rage") {
      grantRage(box.x + TILE / 2, box.y - 4, "mysteryRage");
    }
    updateHud();
  }

  function updateHud() {
    levelText.textContent = `${levels[state.levelIndex].levelNo}/21 (${levels[state.levelIndex].name})`;
    livesText.textContent = String(state.lives);
    coinsText.textContent = String(state.coins);
    scoreText.textContent = String(state.score);
    timeText.textContent = String(Math.max(0, Math.ceil(state.time)));
  }

  function updateChapter() {
    const level = levels[state.levelIndex];
    questTitle.textContent = settings.heroName || "Star Orchard";
    chapterText.textContent = chapterNameFor(state.levelIndex);
    levelBadge.textContent = `${t("hudLevel")} ${level.levelNo}/21`;
    chapterProgress.style.width = `${((level.levelNo - 1) / (levels.length - 1)) * 100}%`;
  }

  function applyLanguage() {
    document.documentElement.lang = settings.language === "zh" ? "zh-CN" : settings.language === "zhHK" ? "zh-HK" : settings.language;
    document.documentElement.dir = settings.language === "ar" ? "rtl" : "ltr";
    document.querySelectorAll("[data-i18n]").forEach((node) => {
      const key = node.getAttribute("data-i18n");
      node.textContent = t(key);
    });
    if (systemBtn) systemBtn.setAttribute("aria-label", t("systemTitle"));
    if (quickRestartBtn) {
      quickRestartBtn.title = t("restartBtn");
      quickRestartBtn.setAttribute("aria-label", t("restartBtn"));
    }
    soundBtn.textContent = audio.muted ? t("soundOff") : t("soundOn");
    updatePauseButtons();
    cueFeed.textContent = t("ready");
    updateChapter();
    updateSaveButtons();
    updateTouchLabels();
    syncSystemControls();
    if (state.mode === "title") setOverlay(t("start"));
    else if (state.mode === "paused") setOverlay(t("paused"));
    else if (state.mode === "levelclear") setOverlay(t("levelClear"));
    else if (state.mode === "complete") setOverlay(t("complete"));
    else if (state.mode === "gameover") setOverlay(t("gameOver"));
    else if (state.mode === "playing") setOverlay("");
  }

  function updatePauseButtons() {
    const paused = state.mode === "paused";
    const label = paused ? t("resumeBtn") : t("pauseBtn");
    if (pauseBtn) pauseBtn.textContent = label;
    if (quickPauseBtn) {
      quickPauseBtn.textContent = paused ? t("quickResumeBtn") : t("quickPauseBtn");
      quickPauseBtn.title = label;
      quickPauseBtn.setAttribute("aria-label", label);
      quickPauseBtn.classList.toggle("is-active", paused);
    }
  }

  function canUseSaveLoad() {
    return Boolean(state.saveUnlocked || state.levelIndex >= SAVE_UNLOCK_INDEX);
  }

  function canUseLevelSelect() {
    const maxCleared = Number(settings.maxCleared) || 0;
    return maxCleared >= LEVEL_SELECT_UNLOCK_CLEARED || state.levelIndex >= LEVEL_SELECT_UNLOCK_INDEX;
  }

  function updateSaveButtons() {
    const unlocked = canUseSaveLoad();
    saveBtn.disabled = !unlocked;
    saveBtn.title = unlocked ? "" : t("saveLocked");
    [
      [quickSaveBtn, t("saveBtn")],
      [quickLoadBtn, t("loadBtn")]
    ].forEach(([button, label]) => {
      if (!button) return;
      button.disabled = !unlocked;
      button.classList.toggle("is-hidden", !unlocked);
      button.title = unlocked ? label : t("saveLocked");
      button.setAttribute("aria-label", label);
    });
  }

  function markLevelCleared(levelNo) {
    settings.maxCleared = Math.max(Number(settings.maxCleared) || 0, levelNo);
    saveSettings();
    updateLevelSelect();
  }

  function updateTouchLabels() {
    const labels = {
      left: t("touchLeft"),
      right: t("touchRight"),
      dash: t("touchDash"),
      jump: t("touchJump")
    };
    const symbols = {
      left: "\u2039",
      right: "\u203a",
      dash: t("touchSymbolDash") || labels.dash,
      jump: t("touchSymbolJump") || labels.jump
    };
    const ensureButton = (id, labelKey) => {
      const button = document.getElementById(id);
      if (!button) return;
      let symbolNode = button.querySelector(".touch-symbol");
      if (!symbolNode) {
        button.textContent = "";
        symbolNode = document.createElement("span");
        symbolNode.className = "touch-symbol";
        button.appendChild(symbolNode);
      }
      let hintNode = button.querySelector(".touch-hint");
      if (!hintNode) {
        hintNode = document.createElement("span");
        hintNode.className = "touch-hint";
        hintNode.setAttribute("data-touch-label", labelKey);
        button.appendChild(hintNode);
      }
      symbolNode.textContent = symbols[labelKey];
      hintNode.textContent = labels[labelKey];
      button.setAttribute("aria-label", labels[labelKey]);
    };
    ensureButton("touchLeft", "left");
    ensureButton("touchRight", "right");
    ensureButton("touchDash", "dash");
    ensureButton("touchJump", "jump");
  }

  let touchHintTimer = null;
  function showTouchHints() {
    stageFrame.classList.add("show-touch-hints");
    clearTimeout(touchHintTimer);
    touchHintTimer = setTimeout(() => stageFrame.classList.remove("show-touch-hints"), 7000);
  }

  function triggerStartFx() {
    stageFrame.classList.remove("start-burst");
    stageFrame.offsetWidth;
    stageFrame.classList.add("start-burst");
    setTimeout(() => stageFrame.classList.remove("start-burst"), 950);
  }

  function updateLevelSelect() {
    if (!levelSelect) return;
    const maxCleared = Number(settings.maxCleared) || 0;
    const unlocked = canUseLevelSelect();
    const maxLevel = unlocked ? Math.min(levels.length, Math.max(maxCleared + 1, state.levelIndex + 1)) : 1;
    levelSelect.innerHTML = "";
    for (let i = 0; i < maxLevel; i++) {
      const option = document.createElement("option");
      option.value = String(i);
      option.textContent = `${t("selectLevelPrefix")} ${i + 1}/21 (${levels[i].name})`;
      levelSelect.appendChild(option);
    }
    levelSelect.value = String(Math.min(state.levelIndex, maxLevel - 1));
    levelSelect.disabled = !unlocked;
    if (levelLockText) {
      levelLockText.textContent = unlocked ? t("levelUnlocked") : t("levelLocked");
    }
    renderSystemOptionBlock(levelSelect);
  }

  function syncSystemControls() {
    syncLanguageOptionNames();
    if (systemLanguageSelect) systemLanguageSelect.value = settings.language;
    if (systemLightSelect) systemLightSelect.value = settings.lightMode;
    if (weatherSelect) weatherSelect.value = settings.weatherMode || "auto";
    if (languageSelect) languageSelect.value = settings.language;
    if (lightSelect) lightSelect.value = ["auto", "day", "night"].includes(settings.lightMode) ? settings.lightMode : "auto";
    updateLevelSelect();
    renderSystemOptionBlocks();
    updateTouchLabels();
  }

  function setLevelFromSelect(index) {
    if (!canUseLevelSelect()) return;
    state.mode = "playing";
    state.levelIndex = clamp(index, 0, levels.length - 1);
    loadLevel(state.levelIndex, true);
    setOverlay("");
    closeSystemSettings();
    announce(t("ready"), state.player.x, state.player.y - 24, "#fff4a8", "start");
  }

  function openSystemSettings() {
    if (!systemModal) return;
    syncSystemControls();
    systemModal.classList.remove("hidden");
    resetInput();
  }

  function closeSystemSettings() {
    if (!systemModal) return;
    systemModal.classList.add("hidden");
    resetInput();
  }

  function saveGame(auto = false) {
    if (!canUseSaveLoad()) {
      announce(t("saveLocked"));
      return false;
    }
    state.saveUnlocked = true;
    updateSaveButtons();
    const payload = {
      levelIndex: state.levelIndex,
      lives: state.lives,
      coins: state.coins,
      score: state.score,
      saveUnlocked: true,
      maxCleared: Number(settings.maxCleared) || 0,
      settings,
      savedAt: new Date().toISOString()
    };
    localStorage.setItem(SAVE_KEY, JSON.stringify(payload));
    if (!auto) announce(t("saved"), state.player.x, state.player.y - 28, "#8fe8d8", "checkpoint");
    return true;
  }

  function loadGame() {
    const data = loadJson(SAVE_KEY, null);
    if (!data || typeof data.levelIndex !== "number") {
      announce(t("noSave"));
      return;
    }
    Object.assign(settings, data.settings || {});
    settings.language = i18n[settings.language] ? settings.language : "en";
    settings.lightMode = ["auto", "dawn", "day", "dusk", "night"].includes(settings.lightMode) ? settings.lightMode : "auto";
    settings.weatherMode = ["auto", "sunny", "cloudy", "rain", "storm"].includes(settings.weatherMode) ? settings.weatherMode : "auto";
    settings.maxCleared = Math.max(Number(settings.maxCleared) || 0, Number(data.maxCleared) || 0);
    settings.heroName = settings.heroName || "Star Orchard";
    languageSelect.value = settings.language;
    lightSelect.value = ["auto", "day", "night"].includes(settings.lightMode) ? settings.lightMode : "auto";
    heroNameInput.value = settings.heroName;
    audio.muted = Boolean(settings.muted);
    state.lives = clamp(Number(data.lives) || 3, 1, 9);
    state.coins = Number(data.coins) || 0;
    state.score = Number(data.score) || 0;
    state.saveUnlocked = true;
    state.mode = "playing";
    updatePauseButtons();
    loadLevel(clamp(data.levelIndex, 0, levels.length - 1), true);
    applyLanguage();
    announce(t("loaded"), state.player.x, state.player.y - 28, "#8fe8d8", "checkpoint");
  }

  function resetInput() {
    keys.clear();
    pressed.clear();
    touchPointers.clear();
    document.querySelectorAll(".touch-btn.is-down").forEach((button) => button.classList.remove("is-down"));
  }

  function isMenuControl(target) {
    if (!target) return false;
    const tag = target.tagName ? target.tagName.toLowerCase() : "";
    return target.isContentEditable || ["input", "textarea", "select", "button"].includes(tag);
  }

  function currentRunStartIndex() {
    return clamp(state.levelIndex, 0, levels.length - 1);
  }

  function startGame() {
    ensureAudio();
    if (state.mode === "title" || state.mode === "gameover" || state.mode === "complete") {
      const previousMode = state.mode;
      triggerStartFx();
      state.mode = "playing";
      updatePauseButtons();
      loadLevel(currentRunStartIndex(), previousMode === "title");
      setOverlay("");
      showTouchHints();
      announce(t("ready"), state.player.x, state.player.y - 24, "#fff4a8", "start");
    } else if (state.mode === "paused") {
      state.mode = "playing";
      updatePauseButtons();
      setOverlay("");
    } else if (state.mode === "levelclear") {
      triggerStartFx();
      nextLevel();
    }
  }

  function restartGame() {
    triggerStartFx();
    state.mode = "playing";
    updatePauseButtons();
    state.lives = 3;
    state.coins = 0;
    state.score = 0;
    state.saveUnlocked = false;
    loadLevel(currentRunStartIndex(), false);
    setOverlay("");
    showTouchHints();
    announce(t("ready"), state.player.x, state.player.y - 24, "#fff4a8", "start");
  }

  function togglePause() {
    if (state.mode === "playing") {
      state.mode = "paused";
      updatePauseButtons();
      setOverlay(t("paused"));
      playSound("button");
    } else if (state.mode === "paused") {
      state.mode = "playing";
      updatePauseButtons();
      setOverlay("");
      playSound("button");
    }
  }

  function nextLevel() {
    markLevelCleared(levels[state.levelIndex].levelNo);
    if (state.levelIndex + 1 >= SAVE_UNLOCK_CLEARED && !state.saveUnlocked) {
      state.saveUnlocked = true;
      updateSaveButtons();
      announce(t("saveUnlocked"), state.player.x, state.player.y - 32, "#8fe8d8", "checkpoint");
    }
    if (state.levelIndex >= levels.length - 1) {
      state.mode = "complete";
      setOverlay(t("complete"));
      saveGame(true);
      return;
    }
    state.levelIndex += 1;
    state.lives = Math.min(9, state.lives + 1);
    state.mode = "playing";
    updatePauseButtons();
    loadLevel(state.levelIndex, true);
    updateSaveButtons();
    setOverlay("");
    showTouchHints();
    if (state.saveUnlocked) saveGame(true);
    announce(t("ready"), state.player.x, state.player.y - 24, "#fff4a8", "start");
  }

  function solidHits(rect) {
    const hits = state.solids.filter((s) => overlap(rect, s));
    for (const box of state.mysteryBoxes) {
      if (overlap(rect, box)) hits.push(box);
    }
    for (const block of state.breakables) {
      if (block.active && overlap(rect, block)) hits.push(block);
    }
    return hits;
  }

  function resolveAxis(entity, axis) {
    for (const s of solidHits(entity)) {
      if (s.type === "X" && entity === state.player && hasRage(entity)) {
        smashObstacle(s);
        continue;
      }
      if (axis === "x") {
        if (entity.vx > 0) entity.x = s.x - entity.w;
        if (entity.vx < 0) entity.x = s.x + s.w;
        entity.vx = 0;
      } else {
        if (entity.vy > 0) {
          entity.y = s.y - entity.h;
          entity.grounded = true;
          entity.vy = 0;
        }
        if (entity.vy < 0) {
          entity.y = s.y + s.h;
          entity.vy = 0;
          if (entity === state.player && s.type === "M") activateMysteryBox(s);
        }
      }
    }
  }

  function moveAndCollide(entity, dt) {
    entity.grounded = false;
    entity.x += entity.vx * dt;
    resolveAxis(entity, "x");
    entity.y += entity.vy * dt;
    resolveAxis(entity, "y");
  }

  function hasFloorAhead(entity) {
    const dir = Math.sign(entity.vx) || entity.dir || 1;
    const probe = {
      x: entity.x + entity.w / 2 + dir * (entity.w / 2 + 8),
      y: entity.y + entity.h + 3,
      w: 6,
      h: 8
    };
    return state.solids.some((s) => overlap(probe, s)) || state.platforms.some((p) => overlap(probe, p));
  }

  function updatePlayer(dt) {
    const p = state.player;
    if (p.dead) {
      p.vy += GRAVITY * dt;
      p.y += p.vy * dt;
      return;
    }
    tickPlayerEffects(p, dt);

    const left = keys.has("ArrowLeft") || keys.has("KeyA");
    const right = keys.has("ArrowRight") || keys.has("KeyD");
    const jumpNow = pressed.has("Space") || pressed.has("ArrowUp") || pressed.has("KeyW");
    const dash = keys.has("ShiftLeft") || keys.has("ShiftRight");
    const maxSpeed = dash ? CONTROL_TUNING.dashSpeed : CONTROL_TUNING.walkSpeed;
    const accel = p.grounded ? CONTROL_TUNING.groundAccel : CONTROL_TUNING.airAccel;
    const friction = p.grounded ? CONTROL_TUNING.groundFriction : CONTROL_TUNING.airFriction;
    const springActive = hasSpring(p);
    const jumpPower = CONTROL_TUNING.jumpPower * (springActive ? SPRING_JUMP_MULTIPLIER : 1);

    if (jumpNow) p.jumpBuffer = CONTROL_TUNING.jumpBuffer;
    p.jumpBuffer = Math.max(0, p.jumpBuffer - dt);
    p.coyote = p.grounded ? CONTROL_TUNING.coyoteTime : Math.max(0, p.coyote - dt);

    if (left) {
      p.vx -= accel * dt;
      p.dir = -1;
    }
    if (right) {
      p.vx += accel * dt;
      p.dir = 1;
    }
    if (!left && !right) {
      const f = friction * dt;
      p.vx = Math.abs(p.vx) <= f ? 0 : p.vx - Math.sign(p.vx) * f;
    }
    p.vx = clamp(p.vx, -maxSpeed, maxSpeed);

    if (p.jumpBuffer > 0 && p.coyote > 0) {
      p.vy = -jumpPower;
      p.jumpBuffer = 0;
      p.coyote = 0;
      addParticle(p.x + p.w / 2, p.y + p.h, "#e8f0ff", 5);
      if (audio.unlocked) playSound("jump");
    }
    if (!keys.has("Space") && !keys.has("ArrowUp") && !keys.has("KeyW") && p.vy < -CONTROL_TUNING.shortHopCutoff * (springActive ? SPRING_JUMP_MULTIPLIER : 1)) p.vy += GRAVITY * 1.7 * dt;
    p.vy += GRAVITY * dt;
    moveAndCollide(p, dt);

    for (const platform of state.platforms) {
      const prevBottom = p.y + p.h - p.vy * dt;
      if (p.vy >= 0 && p.x + p.w > platform.x && p.x < platform.x + platform.w && prevBottom <= platform.y && p.y + p.h >= platform.y && p.y + p.h <= platform.y + 18) {
        p.y = platform.y - p.h;
        p.vy = 0;
        p.grounded = true;
        p.x += platform.vx * dt;
      }
    }

    p.x = clamp(p.x, 0, state.mapWidth - p.w);
    state.cameraX = clamp(p.x - W * 0.38, 0, Math.max(0, state.mapWidth - W));
    if (p.invincible > 0) p.invincible -= dt;
    if (p.y > H + 260) loseLife();

    for (const coin of state.coinsInWorld) {
      if (!coin.taken && overlap(p, coin)) {
        coin.taken = true;
        state.coins += 1;
        state.score += 100;
        addParticle(coin.x, coin.y, "#ffd84d", 8);
        announce(t("coin"), coin.x, coin.y - 14, "#ffd447", "coin");
        updateHud();
      }
    }

    for (const hazard of state.hazards) {
      if (!hazard.active || !overlap(p, hazard)) continue;
      if (hasRage(p)) {
        smashObstacle(hazard);
      } else if (p.invincible <= 0) {
        damagePlayer(hitPoint(hazard, -12));
      }
    }

    for (const power of state.powerups) {
      if (power.active && overlap(p, power)) {
        power.active = false;
        if (power.kind === "rage") {
          grantRage(power.x, power.y, "rage");
        } else {
          p.power = Math.min(2, p.power + 1);
          p.invincible = 1.1;
          state.score += 350;
          addParticle(power.x, power.y, "#6ee7c8", 14);
          announce(t("power"), power.x, power.y - 16, "#6ee7c8", "shield");
          updateHud();
        }
      }
    }

    for (const enemy of state.enemies) {
      if (!enemy.alive || !overlap(p, enemy)) continue;
      const stomp = p.vy > 0 && p.y + p.h - enemy.y < 18;
      if (hasRage(p)) {
        smashEnemy(enemy);
        p.vx = p.dir * 170;
      } else if (stomp) {
        enemy.alive = false;
        p.vy = -370;
        state.score += 250;
        addParticle(enemy.x + enemy.w / 2, enemy.y + 8, "#f0c241", 10);
        announce(t("stomp"), enemy.x + enemy.w / 2, enemy.y - 8, "#ffd447", "stomp");
        updateHud();
      } else if (p.invincible <= 0) {
        damagePlayer(hitPoint(enemy, -10));
      }
    }

    for (const checkpoint of state.checkpoints) {
      if (!checkpoint.active && overlap(p, checkpoint)) {
        checkpoint.active = true;
        p.checkpoint = { x: checkpoint.x, y: checkpoint.y + checkpoint.h - PLAYER_H };
        addParticle(checkpoint.x, checkpoint.y + 10, "#6ec6b7", 12);
        announce(t("checkpoint"), checkpoint.x, checkpoint.y - 12, "#6ee7c8", "checkpoint");
        if (state.saveUnlocked) saveGame(true);
      }
    }

    if (state.goal && overlap(p, state.goal)) {
      state.mode = "levelclear";
      state.score += Math.max(0, Math.ceil(state.time)) * 5;
      setOverlay(t("levelClear"));
      announce(t("levelClear"), p.x, p.y - 36, "#ffd447", "clear");
      updateHud();
    }
  }

  function damagePlayer(sourcePoint = null) {
    const p = state.player;
    if (p.invincible > 0) return;
    if (p.power > 0) {
      p.power -= 1;
      p.invincible = 1.35;
      p.vx = -p.dir * 210;
      p.vy = -260;
      state.shake = 0.18;
      addParticle(p.x + p.w / 2, p.y + p.h / 2, "#e85e4f", 12);
      announce(t("hurt"), p.x + p.w / 2, p.y - 20, "#ff8b6e", "hurt");
      return;
    }
    loseLife(sourcePoint);
  }

  function loseLife(sourcePoint = null) {
    const p = state.player;
    if (p.dead) return;
    state.lives -= 1;
    state.shake = 0.24;
    playSound("hurt");
    updateHud();
    if (sourcePoint) {
      announce(t("lifeMinus"), sourcePoint.x, sourcePoint.y, "#ff735f");
    }
    if (state.lives <= 0) {
      state.mode = "gameover";
      state.shake = 0;
      setOverlay(t("gameOver"));
      updateSaveButtons();
      return;
    }
    const checkpoint = p.checkpoint || levels[state.levelIndex].spawn;
    if (!sourcePoint) announce(t("lifeLost"));
    state.player = makePlayer(checkpoint.x, checkpoint.y);
    state.player.invincible = 1.3;
    state.cameraX = clamp(state.player.x - W * 0.38, 0, Math.max(0, state.mapWidth - W));
    updateSaveButtons();
  }

  function updateEnemy(enemy, dt) {
    if (!enemy.alive) return;
    const speedScale = activeEnemySpeedScale();
    enemy.vy += GRAVITY * dt;
    if (enemy.grounded && !hasFloorAhead(enemy)) enemy.vx *= -1;
    const beforeVx = enemy.vx;
    enemy.grounded = false;
    enemy.x += enemy.vx * speedScale * dt;
    resolveAxis(enemy, "x");
    if (enemy.vx === 0 && beforeVx !== 0) enemy.vx = -beforeVx;
    enemy.y += enemy.vy * dt;
    resolveAxis(enemy, "y");
    if (enemy.grounded && !hasFloorAhead(enemy)) enemy.vx *= -1;
    enemy.x = clamp(enemy.x, 0, state.mapWidth - enemy.w);
  }

  function updatePower(power, dt) {
    if (!power.active) return;
    power.vy += GRAVITY * dt;
    power.x += power.vx * dt;
    const oldVx = power.vx;
    resolveAxis(power, "x");
    if (power.vx === 0 && oldVx !== 0) power.vx = -oldVx;
    power.y += power.vy * dt;
    resolveAxis(power, "y");
    if (power.y > H + 180) power.active = false;
  }

  function updateMysteryBoxes(dt) {
    for (const box of state.mysteryBoxes) {
      if (box.bump > 0) box.bump = Math.max(0, box.bump - dt);
    }
  }

  function updatePlatforms(dt) {
    for (const platform of state.platforms) {
      platform.x += platform.vx * dt;
      if (platform.x < platform.startX || platform.x > platform.endX) {
        platform.x = clamp(platform.x, platform.startX, platform.endX);
        platform.vx *= -1;
      }
    }
  }

  function updateParticles(dt) {
    for (const p of state.particles) {
      p.life -= dt;
      p.vy += 650 * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
    }
    state.particles = state.particles.filter((p) => p.life > 0);
  }

  function updateFloaters(dt) {
    for (const f of state.floaters) {
      f.life -= dt;
      f.y += f.vy * dt;
      f.x += Math.sin(f.wobble + f.life * 8) * 8 * dt;
    }
    state.floaters = state.floaters.filter((f) => f.life > 0);
  }

  function naturalPhase() {
    const now = new Date();
    const hour = now.getHours() + now.getMinutes() / 60;
    if (hour >= 5 && hour < 8) return "dawn";
    if (hour >= 8 && hour < 17) return "day";
    if (hour >= 17 && hour < 20) return "dusk";
    return "night";
  }

  function normalizeUnit(value) {
    return ((value % 1) + 1) % 1;
  }

  function normalizeDegrees(degrees) {
    return ((degrees % 360) + 360) % 360;
  }

  function degToRad(degrees) {
    return degrees * Math.PI / 180;
  }

  function julianDay(date = new Date()) {
    return date.getTime() / MS_PER_DAY + UNIX_EPOCH_JULIAN_DAY;
  }

  function lunarOrbitTerms(date = new Date()) {
    const t = (julianDay(date) - J2000_JULIAN_DAY) / 36525;
    const t2 = t * t;
    const t3 = t2 * t;
    return {
      sunAnomaly: normalizeDegrees(357.5291092 + 35999.0502909 * t - 0.0001536 * t2 + t3 / 24490000),
      moonAnomaly: normalizeDegrees(134.9633964 + 477198.8675055 * t + 0.0087414 * t2 + t3 / 69699 - t2 * t2 / 14712000),
      elongation: normalizeDegrees(297.8501921 + 445267.1114034 * t - 0.0018819 * t2 + t3 / 545868 - t2 * t2 / 113065000)
    };
  }

  function lunarPhaseCorrection(date = new Date()) {
    const terms = lunarOrbitTerms(date);
    const d = degToRad(terms.elongation);
    const m = degToRad(terms.sunAnomaly);
    const mp = degToRad(terms.moonAnomaly);
    const correctionDegrees =
      1.274 * Math.sin(2 * d - mp) +
      0.658 * Math.sin(2 * d) +
      0.214 * Math.sin(2 * mp) -
      0.186 * Math.sin(m) -
      0.110 * Math.sin(d);
    return correctionDegrees / 360;
  }

  function lunarPhaseData(now = new Date()) {
    const elapsedDays = (now.getTime() - KNOWN_NEW_MOON_UTC) / MS_PER_DAY;
    const meanPhase = normalizeUnit(elapsedDays / SYNODIC_MONTH_DAYS);
    const referenceCorrection = lunarPhaseCorrection(new Date(KNOWN_NEW_MOON_UTC));
    const phase = normalizeUnit(meanPhase + lunarPhaseCorrection(now) - referenceCorrection);
    return {
      phase,
      ageDays: phase * SYNODIC_MONTH_DAYS,
      illumination: (1 - Math.cos(phase * Math.PI * 2)) / 2
    };
  }

  function lunarPhase(now = new Date()) {
    return lunarPhaseData(now).phase;
  }

  function moonIlluminationGeometry(phaseOrData, radius) {
    const phaseData = typeof phaseOrData === "number" ? lunarPhaseData(new Date(KNOWN_NEW_MOON_UTC + normalizeUnit(phaseOrData) * SYNODIC_MONTH_DAYS * MS_PER_DAY)) : phaseOrData;
    const normalized = normalizeUnit(phaseData.phase);
    const illumination = phaseData.illumination ?? (1 - Math.cos(normalized * Math.PI * 2)) / 2;
    return {
      illumination,
      litOffset: (normalized - 0.5) * radius * 4
    };
  }

  function moonPhaseCheckpointsPass() {
    const newMoon = lunarPhaseData(new Date(KNOWN_NEW_MOON_UTC));
    const firstQuarter = moonIlluminationGeometry({ phase: 0.25, illumination: 0.5 }, 28);
    const fullMoon = moonIlluminationGeometry({ phase: 0.5, illumination: 1 }, 28);
    const lastQuarter = moonIlluminationGeometry({ phase: 0.75, illumination: 0.5 }, 28);
    return (newMoon.phase < 0.015 || newMoon.phase > 0.985) &&
      firstQuarter.litOffset < 0 &&
      fullMoon.illumination > 0.99 &&
      lastQuarter.litOffset > 0;
  }

  function currentPhase() {
    return settings.lightMode === "auto" ? naturalPhase() : settings.lightMode;
  }

  function currentWeather() {
    if (settings.weatherMode && settings.weatherMode !== "auto") return settings.weatherMode;
    const day = Math.floor(Date.now() / 86400000);
    return ["sunny", "cloudy", "rain", "sunny", "storm", "cloudy"][(day + state.levelIndex) % 6];
  }

  function lightFactor() {
    const phase = currentPhase();
    if (phase === "day") return 1;
    if (phase === "dawn") return 0.84;
    if (phase === "dusk") return 0.76;
    if (phase === "night") return 0.58;
    const hour = new Date().getHours() + new Date().getMinutes() / 60;
    const dayCurve = Math.cos(((hour - 13) / 24) * Math.PI * 2);
    return clamp(0.55 + Math.max(0, dayCurve) * 0.45, 0.55, 1);
  }

  function update(dt) {
    state.light = lightFactor();
    if (state.mode !== "playing") {
      updateParticles(dt);
      updateFloaters(dt);
      return;
    }
    state.time -= dt;
    if (state.time <= 0) loseLife();
    updatePlatforms(dt);
    updatePlayer(dt);
    for (const enemy of state.enemies) updateEnemy(enemy, dt);
    for (const power of state.powerups) updatePower(power, dt);
    updateMysteryBoxes(dt);
    updateParticles(dt);
    updateFloaters(dt);
    state.shake = Math.max(0, state.shake - dt);
    updateHud();
  }

  function drawBackground() {
    const p = state.palette;
    const cx = state.cameraX;
    const phase = currentPhase();
    const weather = currentWeather();
    const sky = ctx.createLinearGradient(0, 0, 0, H);
    const skyTop = phase === "night" ? "#26345f" : phase === "dawn" ? "#ffb78f" : phase === "dusk" ? "#d68b84" : weather === "storm" ? "#52697e" : p.skyTop;
    const skyMid = phase === "night" ? "#355378" : phase === "dawn" ? "#93c8dc" : phase === "dusk" ? "#7ea9c5" : weather === "rain" ? "#7ea3bb" : weather === "cloudy" ? "#a5c6d9" : p.sky;
    const skyBottom = phase === "night" ? "#6b6d91" : phase === "dawn" ? "#f7d19a" : phase === "dusk" ? "#f0b479" : p.skyBottom;
    sky.addColorStop(0, skyTop);
    sky.addColorStop(0.62, skyMid);
    sky.addColorStop(1, skyBottom);
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, W, H);

    if (phase === "dawn" || phase === "dusk") {
      const glow = ctx.createLinearGradient(0, 20, 0, H * 0.72);
      glow.addColorStop(0, phase === "dawn" ? "rgba(255, 221, 154, 0.34)" : "rgba(255, 160, 116, 0.28)");
      glow.addColorStop(1, "rgba(255, 255, 255, 0)");
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, W, H);
    }

    drawCelestial(cx, phase, weather);

    const cloudCount = weather === "sunny" ? 6 : weather === "cloudy" ? 12 : 10;
    ctx.fillStyle = weather === "storm" ? "rgba(82, 94, 108, 0.82)" : weather === "rain" ? "rgba(220,232,238,0.62)" : "rgba(255,255,255,0.78)";
    for (let i = 0; i < cloudCount; i++) cloud(((i * 260 - cx * 0.18) % (W + 260)) - 120, 48 + (i % 4) * 28, 0.88 + (i % 3) * 0.24);
    if (weather === "sunny" && phase === "day") drawBirds(cx);
    if (weather === "rain" || weather === "storm") drawRain(cx, weather === "storm");
    if (weather === "storm" && Math.floor(performance.now() / 1400) % 5 === 0) drawLightning();

    ctx.fillStyle = p.far;
    for (let i = 0; i < 12; i++) hill(i * 260 - (cx * 0.34) % 260 - 100, H - 130, 140, 120);
    ctx.fillStyle = p.hill;
    for (let i = 0; i < 12; i++) hill(i * 330 - (cx * 0.55) % 330 - 120, H - 82, 190, 150);
  }

  function drawCelestial(cx, phase, weather) {
    if (phase === "night") {
      if (weather === "sunny" || weather === "cloudy") drawStars(cx, weather);
      if (weather !== "storm") drawMoon(cx, weather);
      return;
    }
    drawSun(cx, phase);
  }

  function drawSun(cx, phase) {
    const sunX = W - 132 - (cx * 0.04) % 80;
    const y = phase === "dawn" ? 92 : phase === "dusk" ? 86 : 78;
    const r = phase === "day" ? 38 : 34;
    ctx.save();
    ctx.fillStyle = phase === "dusk" ? "rgba(255, 218, 153, 0.62)" : "rgba(255, 244, 180, 0.72)";
    ctx.beginPath();
    ctx.arc(sunX, y, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function drawMoon(cx, weather) {
    const phase = lunarPhaseData();
    const moonX = W - 136 - (cx * 0.035) % 70;
    const moonY = 74;
    const r = 28;
    const visibility = weather === "cloudy" ? 0.52 : weather === "rain" ? 0.2 : 0.82;
    const moon = moonIlluminationGeometry(phase, r);
    ctx.save();
    ctx.globalAlpha = visibility;
    ctx.fillStyle = "rgba(82, 91, 123, 0.42)";
    ctx.beginPath();
    ctx.arc(moonX, moonY, r, 0, Math.PI * 2);
    ctx.fill();
    if (moon.illumination > 0.035) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(moonX, moonY, r, 0, Math.PI * 2);
      ctx.clip();
      ctx.fillStyle = "rgba(246, 239, 205, 0.9)";
      ctx.beginPath();
      ctx.arc(moonX + moon.litOffset, moonY, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    ctx.strokeStyle = "rgba(255, 252, 219, 0.22)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(moonX, moonY, r, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  function drawStars(cx, weather) {
    const alpha = weather === "cloudy" ? 0.26 : 0.62;
    const twinkle = 0.82 + Math.sin(performance.now() * 0.002) * 0.18;
    ctx.save();
    ctx.fillStyle = `rgba(255, 247, 194, ${alpha * twinkle})`;
    for (let i = 0; i < 44; i++) {
      const x = ((i * 83 + Math.sin(i * 17) * 28 - cx * 0.05) % (W + 90)) - 45;
      const y = 24 + ((i * 47 + Math.cos(i * 9) * 18) % 138);
      const s = i % 7 === 0 ? 2.1 : 1.25;
      ctx.beginPath();
      ctx.arc(x, y, s, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  function drawBirds(cx) {
    ctx.save();
    ctx.strokeStyle = "rgba(56, 48, 42, 0.44)";
    ctx.lineWidth = 2;
    for (let i = 0; i < 5; i++) {
      const x = ((i * 148 + performance.now() * 0.018 - cx * 0.1) % (W + 80)) - 40;
      const y = 82 + (i % 3) * 24;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.quadraticCurveTo(x + 8, y - 7, x + 16, y);
      ctx.quadraticCurveTo(x + 24, y - 7, x + 32, y);
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawRain(cx, heavy = false) {
    ctx.save();
    ctx.strokeStyle = heavy ? "rgba(214, 236, 255, 0.54)" : "rgba(235, 248, 255, 0.42)";
    ctx.lineWidth = heavy ? 2 : 1;
    const count = heavy ? 80 : 48;
    const drift = (performance.now() * 0.24 + cx * 0.15) % 60;
    for (let i = 0; i < count; i++) {
      const x = (i * 43 + drift) % (W + 80) - 40;
      const y = (i * 79 + performance.now() * 0.32) % (H + 60) - 30;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x - 12, y + (heavy ? 28 : 22));
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawLightning() {
    ctx.save();
    ctx.strokeStyle = "rgba(255, 246, 178, 0.68)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(W * 0.72, 18);
    ctx.lineTo(W * 0.68, 86);
    ctx.lineTo(W * 0.72, 86);
    ctx.lineTo(W * 0.66, 158);
    ctx.stroke();
    ctx.fillStyle = "rgba(255,255,255,0.08)";
    ctx.fillRect(0, 0, W, H);
    ctx.restore();
  }

  function cloud(x, y, s) {
    ctx.beginPath();
    ctx.arc(x, y + 15 * s, 18 * s, 0, Math.PI * 2);
    ctx.arc(x + 22 * s, y, 22 * s, 0, Math.PI * 2);
    ctx.arc(x + 48 * s, y + 15 * s, 18 * s, 0, Math.PI * 2);
    ctx.rect(x, y + 13 * s, 50 * s, 20 * s);
    ctx.fill();
  }

  function hill(x, y, w, h) {
    ctx.beginPath();
    ctx.moveTo(x, y + h);
    ctx.quadraticCurveTo(x + w * 0.5, y - h * 0.2, x + w, y + h);
    ctx.closePath();
    ctx.fill();
  }

  function withCamera(draw) {
    ctx.save();
    const jitter = state.shake > 0 && state.mode !== "gameover" ? Math.sin(performance.now() * 0.08) * state.shake * 14 : 0;
    ctx.translate(Math.round(-state.cameraX + jitter), Math.round(jitter * 0.4));
    draw();
    ctx.restore();
  }

  function drawTile(t) {
    const p = state.palette;
    if (t.type === "G") {
      ctx.fillStyle = p.dirt;
      ctx.fillRect(t.x, t.y, TILE, TILE);
      ctx.fillStyle = p.ground;
      ctx.fillRect(t.x, t.y, TILE, 9);
      ctx.fillStyle = "rgba(255,255,255,0.18)";
      ctx.fillRect(t.x, t.y, TILE, 2);
      ctx.fillStyle = "rgba(34, 18, 8, 0.16)";
      ctx.fillRect(t.x, t.y + TILE - 4, TILE, 4);
    } else {
      ctx.fillStyle = p.brick;
      ctx.fillRect(t.x, t.y, TILE, TILE);
      ctx.strokeStyle = "rgba(0,0,0,0.25)";
      ctx.lineWidth = 2;
      ctx.strokeRect(t.x + 1, t.y + 1, TILE - 2, TILE - 2);
      ctx.beginPath();
      ctx.moveTo(t.x, t.y + 16);
      ctx.lineTo(t.x + TILE, t.y + 16);
      ctx.moveTo(t.x + 16, t.y);
      ctx.lineTo(t.x + 16, t.y + 16);
      ctx.stroke();
    }
  }

  function drawCoin(c) {
    if (c.taken) return;
    c.t += 0.08;
    const w = 8 + Math.abs(Math.sin(c.t)) * 8;
    ctx.fillStyle = "#ffd84d";
    ctx.beginPath();
    ctx.ellipse(c.x + 7, c.y + 9, w / 2, 10, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#fff4a5";
    ctx.fillRect(c.x + 6, c.y + 4, 2, 10);
  }

  function drawEnemy(e) {
    if (!e.alive) return;
    ctx.fillStyle = activeEnemySpeedScale() > 1 ? "#8e332b" : "#70412b";
    ctx.fillRect(e.x + 2, e.y + 7, e.w - 4, e.h - 7);
    ctx.fillStyle = activeEnemySpeedScale() > 1 ? "#d45a3d" : "#a9683c";
    ctx.fillRect(e.x, e.y + 13, e.w, 10);
    ctx.fillStyle = "#111";
    ctx.fillRect(e.x + 7, e.y + 11, 4, 4);
    ctx.fillRect(e.x + 18, e.y + 11, 4, 4);
    ctx.fillStyle = "#2b1a12";
    ctx.fillRect(e.x + 3, e.y + e.h - 3, 8, 5);
    ctx.fillRect(e.x + 17, e.y + e.h - 3, 8, 5);
  }

  function drawPower(power) {
    if (!power.active) return;
    if (power.kind === "rage") {
      ctx.fillStyle = "#5e2a77";
      ctx.fillRect(power.x + 5, power.y + 4, 8, 3);
      ctx.fillStyle = "#ff8067";
      ctx.fillRect(power.x + 4, power.y + 7, 10, 10);
      ctx.fillStyle = "#ffd447";
      ctx.fillRect(power.x + 6, power.y + 9, 6, 2);
      return;
    }
    ctx.fillStyle = "#6ee7c8";
    ctx.beginPath();
    ctx.moveTo(power.x + 9, power.y);
    for (let i = 1; i < 10; i++) {
      const a = -Math.PI / 2 + i * Math.PI / 5;
      const r = i % 2 ? 5 : 10;
      ctx.lineTo(power.x + 9 + Math.cos(a) * r, power.y + 9 + Math.sin(a) * r);
    }
    ctx.closePath();
    ctx.fill();
  }

  function drawBreakable(block) {
    if (!block.active) return;
    ctx.fillStyle = block.variant === 1 ? "#8c7858" : "#9b6b42";
    ctx.fillRect(block.x, block.y, block.w, block.h);
    ctx.strokeStyle = "rgba(40, 24, 12, 0.45)";
    ctx.lineWidth = 2;
    ctx.strokeRect(block.x + 1, block.y + 1, block.w - 2, block.h - 2);
    ctx.beginPath();
    ctx.moveTo(block.x + 4, block.y + 6);
    ctx.lineTo(block.x + block.w - 5, block.y + block.h - 6);
    ctx.moveTo(block.x + block.w - 5, block.y + 6);
    ctx.lineTo(block.x + 4, block.y + block.h - 6);
    ctx.stroke();
  }

  function drawMysteryBox(box) {
    const y = box.y - Math.sin((box.bump / 0.18) * Math.PI) * 6;
    const fill = box.opened ? "#8c7858" : "#ffd447";
    const edge = box.opened ? "#5d4d39" : "#a85f17";
    ctx.fillStyle = edge;
    ctx.fillRect(box.x, y, box.w, box.h);
    ctx.fillStyle = fill;
    ctx.fillRect(box.x + 3, y + 3, box.w - 6, box.h - 6);
    ctx.fillStyle = box.opened ? "rgba(255,255,255,0.14)" : "#fff8b8";
    ctx.fillRect(box.x + 5, y + 5, box.w - 10, 5);
    ctx.fillStyle = box.opened ? "#5d4d39" : "#35223a";
    ctx.font = "900 22px system-ui";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(box.opened ? "*" : "?", box.x + box.w / 2, y + box.h / 2 + 1);
    ctx.fillStyle = "rgba(0,0,0,0.25)";
    ctx.fillRect(box.x + 4, y + box.h - 5, box.w - 8, 3);
  }

  function drawPlayer() {
    const p = state.player;
    if (p.invincible > 0 && Math.floor(performance.now() / 80) % 2 === 0) return;
    const springActive = hasSpring(p);
    const rageActive = hasRage(p);
    const body = rageActive ? "#d94a36" : p.power > 0 ? "#2c9f88" : "#df4d3d";
    const trim = springActive ? "#8fd7ff" : p.power > 1 || rageActive ? "#f0c241" : "#224a79";
    ctx.save();
    ctx.translate(p.x + p.w / 2, p.y + p.h / 2);
    ctx.scale(p.dir, 1);
    ctx.translate(-p.w / 2, -p.h / 2);
    ctx.fillStyle = "#f1c28b";
    ctx.fillRect(6, 0, 14, 10);
    ctx.fillStyle = body;
    ctx.fillRect(4, 2, 18, 5);
    ctx.fillRect(3, 8, 19, 14);
    ctx.fillStyle = trim;
    ctx.fillRect(5, 18, 8, 11);
    ctx.fillRect(14, 18, 8, 11);
    ctx.fillStyle = "#fff6cf";
    ctx.fillRect(8, 10, 4, 5);
    ctx.fillRect(16, 10, 4, 5);
    ctx.fillStyle = "#39281f";
    ctx.fillRect(13, 4, 3, 3);
    ctx.fillRect(17, 25, 8, 5);
    ctx.fillRect(1, 25, 8, 5);
    ctx.fillStyle = "#f0c241";
    ctx.fillRect(3, 5, 20, 4);
    if (springActive) {
      ctx.fillStyle = "#8fd7ff";
      ctx.fillRect(2, 28, 21, 3);
    }
    ctx.restore();
  }

  function drawGoal() {
    const g = state.goal;
    ctx.fillStyle = "#f5f2e7";
    ctx.fillRect(g.x + 10, g.y, 6, g.h);
    const flag = ctx.createLinearGradient(g.x + 15, g.y + 10, g.x + 54, g.y + 42);
    flag.addColorStop(0, "#ff8067");
    flag.addColorStop(1, "#c93f35");
    ctx.fillStyle = flag;
    ctx.beginPath();
    ctx.moveTo(g.x + 15, g.y + 10);
    ctx.lineTo(g.x + 54, g.y + 25);
    ctx.lineTo(g.x + 15, g.y + 42);
    ctx.closePath();
    ctx.fill();
  }

  function drawCheckpoint(c) {
    ctx.fillStyle = c.active ? "#6ee7c8" : "#ded7c2";
    ctx.fillRect(c.x + 8, c.y, 5, c.h);
    ctx.fillStyle = c.active ? "#54d3b8" : "#9aa4b8";
    ctx.fillRect(c.x + 13, c.y + 8, 24, 16);
  }

  function drawStatusEffects() {
    const p = state.player;
    if (!p) return;
    const effects = [];
    if (hasSpring(p)) effects.push({ label: t("springStatus"), time: activeSpringTime(), duration: SPRING_DURATION });
    if (hasRage(p)) effects.push({ label: t("rageStatus"), time: effectTime(p.rageTimer), duration: RAGE_DURATION });
    if (!effects.length) return;
    ctx.save();
    ctx.font = "900 14px system-ui";
    ctx.textBaseline = "middle";
    let x = 16;
    for (const effect of effects) {
      const text = `${effect.label} ${Math.ceil(effect.time)}s`;
      const w = ctx.measureText(text).width + 22;
      const ratio = effectProgressRatio(effect.time, effect.duration);
      const barColor = effectProgressColor(ratio);
      ctx.fillStyle = "rgba(18, 24, 39, 0.78)";
      ctx.fillRect(x, 52, w, 26);
      ctx.fillStyle = "rgba(255, 255, 255, 0.18)";
      ctx.fillRect(x + 8, 73, w - 16, 4);
      ctx.fillStyle = barColor;
      ctx.fillRect(x + 8, 73, Math.max(3, (w - 16) * ratio), 4);
      ctx.fillStyle = "#fffaf0";
      ctx.fillText(text, x + 13, 65);
      x += w + 8;
    }
    ctx.restore();
  }

  function drawLightOverlay() {
    if (state.light >= 0.98) return;
    const darkness = clamp(1 - state.light, 0, 0.52);
    ctx.fillStyle = `rgba(8, 12, 31, ${darkness})`;
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = `rgba(118, 156, 255, ${darkness * 0.22})`;
    ctx.fillRect(0, 0, W, H);
  }

  function render() {
    drawBackground();
    withCamera(() => {
      const viewMin = state.cameraX - TILE * 2;
      const viewMax = state.cameraX + W + TILE * 2;
      for (const t0 of state.solids) if (t0.x > viewMin && t0.x < viewMax) drawTile(t0);
      for (const box of state.mysteryBoxes) if (box.x > viewMin && box.x < viewMax) drawMysteryBox(box);
      for (const block of state.breakables) if (block.x > viewMin && block.x < viewMax) drawBreakable(block);
      for (const c of state.coinsInWorld) if (c.x > viewMin && c.x < viewMax) drawCoin(c);
      ctx.fillStyle = "#ded7c2";
      for (const p of state.platforms) {
        ctx.fillRect(p.x, p.y, p.w, p.h);
        ctx.fillStyle = "#8c7858";
        ctx.fillRect(p.x + 4, p.y + 3, p.w - 8, 3);
        ctx.fillStyle = "#ded7c2";
      }
      ctx.fillStyle = "#db4d3d";
      for (const h of state.hazards) {
        if (!h.active) continue;
        ctx.beginPath();
        ctx.moveTo(h.x, h.y + h.h);
        ctx.lineTo(h.x + h.w / 2, h.y);
        ctx.lineTo(h.x + h.w, h.y + h.h);
        ctx.closePath();
        ctx.fill();
      }
      for (const cp of state.checkpoints) drawCheckpoint(cp);
      for (const power of state.powerups) drawPower(power);
      for (const e of state.enemies) drawEnemy(e);
      drawGoal();
      drawPlayer();
      for (const particle of state.particles) {
        ctx.globalAlpha = clamp(particle.life * 2.5, 0, 1);
        ctx.fillStyle = particle.color;
        ctx.fillRect(particle.x, particle.y, particle.size, particle.size);
      }
      ctx.globalAlpha = 1;
      for (const f of state.floaters) {
        ctx.globalAlpha = clamp(f.life, 0, 1);
        ctx.font = "900 15px system-ui";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        const metrics = ctx.measureText(f.text);
        ctx.fillStyle = "rgba(35, 29, 47, 0.72)";
        ctx.fillRect(f.x - metrics.width / 2 - 8, f.y - 13, metrics.width + 16, 25);
        ctx.fillStyle = f.color;
        ctx.fillText(f.text, f.x, f.y);
      }
      ctx.globalAlpha = 1;
    });
    drawStatusEffects();
    drawLightOverlay();
  }

  let last = performance.now();
  let accumulator = 0;
  const FIXED_DT = 1 / 120;
  function frame(now) {
    const elapsed = Math.min(0.08, (now - last) / 1000);
    last = now;
    accumulator += elapsed;
    let steps = 0;
    while (accumulator >= FIXED_DT && steps < 8) {
      update(FIXED_DT);
      accumulator -= FIXED_DT;
      steps += 1;
    }
    if (steps === 8) accumulator = 0;
    render();
    pressed.clear();
    requestAnimationFrame(frame);
  }

  function bindEvents() {
    const bindTouchButton = (id, code) => {
      const button = document.getElementById(id);
      if (!button) return;
      const release = (event) => {
        event.preventDefault();
        if (touchPointers.get(event.pointerId) !== code) return;
        touchPointers.delete(event.pointerId);
        keys.delete(code);
        button.classList.remove("is-down");
      };
      button.addEventListener("pointerdown", (event) => {
        event.preventDefault();
        ensureAudio();
        touchPointers.set(event.pointerId, code);
        pressed.add(code);
        keys.add(code);
        button.classList.add("is-down");
        try {
          button.setPointerCapture(event.pointerId);
        } catch (_) {
          // Some WebViews drop capture during rapid multi-touch; held-state tracking still protects input.
        }
        if (state.mode !== "playing") startGame();
      });
      button.addEventListener("pointerup", release);
      button.addEventListener("pointercancel", release);
      button.addEventListener("lostpointercapture", (event) => {
        if (touchPointers.get(event.pointerId) !== code) return;
        touchPointers.delete(event.pointerId);
        keys.delete(code);
        button.classList.remove("is-down");
      });
      button.addEventListener("contextmenu", (event) => event.preventDefault());
    };

    bindTouchButton("touchLeft", "ArrowLeft");
    bindTouchButton("touchRight", "ArrowRight");
    bindTouchButton("touchDash", "ShiftLeft");
    bindTouchButton("touchJump", "Space");

    window.addEventListener("keydown", (event) => {
      if (isMenuControl(event.target)) {
        resetInput();
        return;
      }
      const code = event.code;
      if (["ArrowLeft", "ArrowRight", "ArrowUp", "Space"].includes(code)) event.preventDefault();
      if (["Enter", "Space", "ArrowUp", "KeyW"].includes(code)) ensureAudio();
      if (!keys.has(code)) pressed.add(code);
      keys.add(code);
      if (["Enter", "Space", "ArrowUp", "KeyW"].includes(code)) startGame();
      if (code === "KeyP") togglePause();
    });
    window.addEventListener("keyup", (event) => keys.delete(event.code));
    [heroNameInput, languageSelect, lightSelect, startBtn, restartBtn, pauseBtn, soundBtn, saveBtn, loadBtn, quickPauseBtn, quickRestartBtn, quickSaveBtn, quickLoadBtn, systemBtn, systemCloseBtn, systemLanguageSelect, systemLightSelect, weatherSelect, levelSelect].forEach((control) => {
      if (!control) return;
      control.addEventListener("focus", resetInput);
      control.addEventListener("blur", resetInput);
    });
    startBtn.addEventListener("click", startGame);
    const activateStart = (event) => {
      event.preventDefault();
      event.stopPropagation();
      startGame();
    };
    overlayText.addEventListener("pointerup", activateStart);
    overlayText.addEventListener("click", activateStart);
    overlay.addEventListener("pointerup", activateStart);
    restartBtn.addEventListener("click", restartGame);
    pauseBtn.addEventListener("click", togglePause);
    saveBtn.addEventListener("click", () => saveGame(false));
    loadBtn.addEventListener("click", loadGame);
    if (quickPauseBtn) quickPauseBtn.addEventListener("click", togglePause);
    if (quickRestartBtn) quickRestartBtn.addEventListener("click", restartGame);
    if (quickSaveBtn) quickSaveBtn.addEventListener("click", () => saveGame(false));
    if (quickLoadBtn) quickLoadBtn.addEventListener("click", loadGame);
    if (systemBtn) systemBtn.addEventListener("click", openSystemSettings);
    if (systemCloseBtn) systemCloseBtn.addEventListener("click", closeSystemSettings);
    if (systemModal) {
      systemModal.addEventListener("pointerdown", (event) => {
        if (event.target === systemModal) closeSystemSettings();
      });
    }
    if (systemLanguageSelect) {
      systemLanguageSelect.addEventListener("change", () => {
        settings.language = systemLanguageSelect.value;
        saveSettings();
        applyLanguage();
      });
    }
    if (systemLightSelect) {
      systemLightSelect.addEventListener("change", () => {
        settings.lightMode = systemLightSelect.value;
        saveSettings();
        syncSystemControls();
      });
    }
    if (weatherSelect) {
      weatherSelect.addEventListener("change", () => {
        settings.weatherMode = weatherSelect.value;
        saveSettings();
        syncSystemControls();
      });
    }
    if (levelSelect) {
      levelSelect.addEventListener("change", () => setLevelFromSelect(Number(levelSelect.value) || 0));
    }
    soundBtn.addEventListener("click", () => {
      audio.muted = !audio.muted;
      settings.muted = audio.muted;
      saveSettings();
      soundBtn.textContent = audio.muted ? t("soundOff") : t("soundOn");
      soundBtn.setAttribute("aria-pressed", String(!audio.muted));
      if (!audio.muted) {
        ensureAudio();
        playSound("button");
      }
    });
    heroNameInput.addEventListener("input", () => {
      settings.heroName = heroNameInput.value.trim() || "Star Orchard";
      saveSettings();
      updateChapter();
    });
    languageSelect.addEventListener("change", () => {
      settings.language = languageSelect.value;
      saveSettings();
      applyLanguage();
    });
    lightSelect.addEventListener("change", () => {
      settings.lightMode = lightSelect.value;
      saveSettings();
      syncSystemControls();
    });
  }

  function boot() {
    settings.language = i18n[settings.language] ? settings.language : "zh";
    settings.lightMode = ["auto", "dawn", "day", "dusk", "night"].includes(settings.lightMode) ? settings.lightMode : "auto";
    settings.weatherMode = ["auto", "sunny", "cloudy", "rain", "storm"].includes(settings.weatherMode) ? settings.weatherMode : "auto";
    settings.maxCleared = Number(settings.maxCleared) || 0;
    syncLanguageOptionNames();
    heroNameInput.value = settings.heroName;
    languageSelect.value = settings.language;
    lightSelect.value = ["auto", "day", "night"].includes(settings.lightMode) ? settings.lightMode : "auto";
    audio.muted = Boolean(settings.muted);
    state.saveUnlocked = false;
    runSystemCheckpoints();
    bindEvents();
    loadLevel(0, true);
    applyLanguage();
    syncSystemControls();
    setOverlay(t("start"));
    showTouchHints();
    requestAnimationFrame(frame);
  }

  boot();
})();
