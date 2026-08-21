// ============================================================
// OTHERWISE — Game Constants
// Central place for all tuning values and design tokens
// ============================================================

// -- Display --
export const GAME_WIDTH = 1280;
export const GAME_HEIGHT = 720;
export const TILE_SIZE = 48;

// -- Player Physics (tuned for feel, not realism) --
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
  PERCEPTION_RADIUS: 400,
  UPDATE_INTERVAL: 200,       // ms between AI ticks
  MOVE_SPEED: 80,
  MAX_TARGETS: 10,
  SCORE_DECAY: 0.95,
} as const;

// -- Color Palette --
export const COLORS = {
  // Environment
  SKY_TOP: 0x2D1B69,
  SKY_BOTTOM: 0xE8A87C,
  GROUND: 0x5C7A3D,
  GROUND_DARK: 0x3D5229,
  GROUND_EDGE: 0x4A6630,
  STONE: 0x8B8B83,
  STONE_DARK: 0x6B6B63,
  WOOD: 0x8B6B3D,

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

  // Concepts
  FEAR: 0x7B2D8B,
  FEAR_GLOW: 0xAA44CC,
  LONELY: 0xE8A848,
  LONELY_GLOW: 0xFFCC66,
  CURIOUS: 0x2D8B8B,
  CURIOUS_GLOW: 0x44CCCC,

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
  GAME: 'GameScene',
  PAUSE: 'PauseScene',
  SETTINGS: 'SettingsScene',
  CREDITS: 'CreditsScene',
  JOURNAL: 'JournalScene',
} as const;
