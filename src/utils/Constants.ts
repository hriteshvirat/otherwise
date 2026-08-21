// ============================================================
// OTHERWISE — Game Constants
// Central place for all tuning values, design tokens, and regions
// ============================================================

// -- Display --
export const GAME_WIDTH = 1280;
export const GAME_HEIGHT = 720;
export const TILE_SIZE = 48;

// -- Player Physics (tuned for responsive feel) --
export const PLAYER = {
  RADIUS: 18,
  MOVE_SPEED: 280,
  ACCELERATION: 1800,
  DECELERATION: 2400,
  AIR_ACCELERATION: 900,
  AIR_DECELERATION: 600,
  JUMP_VELOCITY: -420,
  JUMP_HOLD_FORCE: -60,
  JUMP_HOLD_DURATION: 150,    // ms
  COYOTE_TIME: 100,           // ms
  JUMP_BUFFER: 150,           // ms
  MAX_FALL_SPEED: 600,
  GRAVITY: 1200,
  BOUNCE: 0.05,
  FRICTION: 0.1,
} as const;

// -- Camera --
export const CAMERA = {
  LERP: 0.08,
  LOOK_AHEAD: 80,
  DEAD_ZONE_WIDTH: 60,
  DEAD_ZONE_HEIGHT: 40,
  VERTICAL_OFFSET: -40,
} as const;

// -- Behavior AI --
export const BEHAVIOR = {
  PERCEPTION_RADIUS: 450,
  UPDATE_INTERVAL: 180,       // ms between AI ticks
  MOVE_SPEED: 90,
  MAX_TARGETS: 12,
  SCORE_DECAY: 0.95,
} as const;

// -- Regions --
export const REGIONS = {
  MEADOW: 'meadow',
  WOODS: 'woods',
  RUINS: 'ruins',
  MOUNTAINS: 'mountains',
} as const;

// -- Color Palette --
export const COLORS = {
  // Environment (Region 1 - Meadow)
  SKY_TOP: 0x2D1B69,
  SKY_BOTTOM: 0xE8A87C,
  GROUND: 0x5C7A3D,
  GROUND_DARK: 0x3D5229,
  GROUND_EDGE: 0x4A6630,
  STONE: 0x8B8B83,
  STONE_DARK: 0x6B6B63,
  WOOD: 0x8B6B3D,

  // Environment (Region 2 - Hollow Woods)
  WOODS_SKY_TOP: 0x0F1B29,
  WOODS_SKY_BOTTOM: 0x1A3832,
  WOODS_GROUND: 0x24422E,
  WOODS_GROUND_DARK: 0x14281A,
  WOODS_GLOW: 0x38D68B,

  // Environment (Region 3 - Clockwork Ruins)
  RUINS_SKY_TOP: 0x24181A,
  RUINS_SKY_BOTTOM: 0x5C3A21,
  RUINS_GROUND: 0x544738,
  RUINS_GROUND_DARK: 0x33281E,
  RUINS_BRASS: 0xD49842,
  RUINS_COPPER: 0xB85C38,

  // Environment (Region 4 - Dreaming Mountains)
  MOUNTAINS_SKY_TOP: 0x120E30,
  MOUNTAINS_SKY_BOTTOM: 0x6A3478,
  MOUNTAINS_GROUND: 0x443E6B,
  MOUNTAINS_GROUND_DARK: 0x282348,
  MOUNTAINS_AURORA: 0x6AE8D8,

  // Atmosphere
  FOG: 0xD4C5A9,
  MOUNTAIN_FAR: 0x6B5B8D,
  MOUNTAIN_MID: 0x5A4D7A,
  CLOUD: 0xF5E6D3,
  TREE_DARK: 0x2D4A2D,
  TREE_LIGHT: 0x4A7A4A,

  // Player
  PLAYER_BODY: 0xF5E6CC,
  PLAYER_EYE: 0x2D2D3D,
  PLAYER_EYE_WHITE: 0xFFFFFF,
  PLAYER_BACKPACK: 0xC4956A,

  // All 13 Concepts
  FEAR: 0x7B2D8B,
  FEAR_GLOW: 0xAA44CC,
  LONELY: 0xE8A848,
  LONELY_GLOW: 0xFFCC66,
  CURIOUS: 0x2D8B8B,
  CURIOUS_GLOW: 0x44CCCC,
  TRUST: 0x3B82F6,
  TRUST_GLOW: 0x60A5FA,
  GREEDY: 0xEAB308,
  GREEDY_GLOW: 0xFACC15,
  PROTECTIVE: 0x10B981,
  PROTECTIVE_GLOW: 0x34D399,
  STUBBORN: 0x64748B,
  STUBBORN_GLOW: 0x94A3B8,
  IMITATE: 0xEC4899,
  IMITATE_GLOW: 0xF472B6,
  HUNGRY: 0xF97316,
  HUNGRY_GLOW: 0xFB923C,
  SLEEPY: 0x6366F1,
  SLEEPY_GLOW: 0x818CF8,
  JEALOUS: 0x84CC16,
  JEALOUS_GLOW: 0xA3E635,
  FOLLOW: 0x06B6D4,
  FOLLOW_GLOW: 0x22D3EE,
  REPEAT: 0x8B5CF6,
  REPEAT_GLOW: 0xA78BFA,

  // UI
  UI_BG: 0x1A1425,
  UI_BG_ALPHA: 0.92,
  UI_PANEL: 0x2D2440,
  UI_ACCENT: 0xE8A87C,
  UI_TEXT: 0xF5E6D3,
  UI_TEXT_DIM: 0x8B7B6B,
  UI_HOVER: 0x3D3450,
  UI_BORDER: 0x4A3D5A,

  // Effects
  SUCCESS: 0x88CC44,
  DANGER: 0xCC4444,
  DISCOVERY: 0xFFDD66,
} as const;

// -- Fonts --
export const FONTS = {
  TITLE: 'Georgia, "Times New Roman", serif',
  BODY: '"Segoe UI", Roboto, sans-serif',
  UI: '"Segoe UI", Roboto, sans-serif',
} as const;

// -- Z-Depths --
export const DEPTH = {
  BG_FAR: 0,
  BG_MID: 10,
  BG_NEAR: 20,
  GROUND: 100,
  ENTITIES: 200,
  PLAYER: 300,
  PARTICLES: 400,
  FG_SILHOUETTE: 500,
  UI: 900,
  OVERLAY: 1000,
} as const;

// -- Scenes --
export const SCENES = {
  BOOT: 'BootScene',
  PRELOAD: 'PreloadScene',
  MAIN_MENU: 'MainMenuScene',
  WORLD_MAP: 'WorldMapScene',
  GAME: 'GameScene',
  PAUSE: 'PauseScene',
  SETTINGS: 'SettingsScene',
  CREDITS: 'CreditsScene',
  JOURNAL: 'JournalScene',
  CREATIVE_ARCHIVE: 'CreativeArchiveScene',
} as const;
