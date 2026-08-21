// ============================================================
// OTHERWISE — Complete Level Data (16 Main Levels + 3 Secret Challenges)
// Across 4 Unique Regions
// ============================================================

export interface LevelEntityPlacement {
  type: string;
  x: number;
  y: number;
  id?: string;
  linkedTo?: string;
  properties?: Record<string, unknown>;
}

export interface LevelPlatform {
  x: number;
  y: number;
  width: number;
  height: number;
  type?: 'ground' | 'wall' | 'ceiling' | 'invisible';
}

export interface ConceptPickup {
  conceptId: string;
  x: number;
  y: number;
}

export interface LevelDefinition {
  id: number;
  name: string;
  subtitle: string;
  region: 'meadow' | 'woods' | 'ruins' | 'mountains';
  isSecret?: boolean;
  width: number;
  height: number;
  playerStart: { x: number; y: number };
  goalPosition: { x: number; y: number };
  platforms: LevelPlatform[];
  entities: LevelEntityPlacement[];
  conceptPickups: ConceptPickup[];
  loreSnippet?: string;
}

// ============================================================
// REGION 1: THE FORGOTTEN MEADOW (Levels 1-4 + Secret 1)
// ============================================================

export const LEVEL_1: LevelDefinition = {
  id: 1,
  name: 'Discovery',
  subtitle: 'Every journey begins with a single thought.',
  region: 'meadow',
  width: 2500,
  height: 900,
  playerStart: { x: 120, y: 640 },
  goalPosition: { x: 2250, y: 660 },
  platforms: [
    { x: 0, y: 720, width: 600, height: 180 },
    { x: 700, y: 720, width: 480, height: 180 },
    { x: 1280, y: 720, width: 440, height: 180 },
    { x: 1400, y: 620, width: 140, height: 24 },
    { x: 1680, y: 460, width: 160, height: 180 },
    { x: 1680, y: 720, width: 160, height: 180 },
    { x: 1840, y: 720, width: 660, height: 180 },
  ],
  entities: [
    { type: 'rock', x: 1720, y: 690, id: 'blocking_rock' },
    { type: 'rock', x: 320, y: 695, id: 'deco_rock1' },
    { type: 'collectible', x: 2050, y: 680 },
  ],
  conceptPickups: [
    { conceptId: 'fear', x: 880, y: 660 },
  ],
  loreSnippet: 'The meadow remembers the first intention.',
};

export const LEVEL_2: LevelDefinition = {
  id: 2,
  name: 'Lonely Bridge',
  subtitle: 'Sometimes the loneliest things just need each other.',
  region: 'meadow',
  width: 2800,
  height: 900,
  playerStart: { x: 120, y: 640 },
  goalPosition: { x: 2550, y: 660 },
  platforms: [
    { x: 0, y: 720, width: 800, height: 180 },
    { x: 320, y: 550, width: 180, height: 24 },
    { x: 880, y: 780, width: 100, height: 120 },
    { x: 1060, y: 780, width: 100, height: 120 },
    { x: 1240, y: 780, width: 100, height: 120 },
    { x: 1400, y: 720, width: 500, height: 180 },
    { x: 1900, y: 720, width: 300, height: 180 },
    { x: 2200, y: 720, width: 600, height: 180 },
  ],
  entities: [
    { type: 'rock', x: 250, y: 690, id: 'rock_a' },
    { type: 'rock', x: 500, y: 690, id: 'rock_b' },
    { type: 'rock', x: 720, y: 690, id: 'rock_c' },
    { type: 'bridge', x: 930, y: 710, id: 'bridge_1' },
    { type: 'bridge', x: 1110, y: 710, id: 'bridge_2' },
    { type: 'bridge', x: 1290, y: 710, id: 'bridge_3' },
    { type: 'pressure_plate', x: 1600, y: 710, id: 'plate_1', linkedTo: 'gate_door' },
    { type: 'door', x: 1880, y: 680, id: 'gate_door' },
    { type: 'collectible', x: 2350, y: 680 },
  ],
  conceptPickups: [
    { conceptId: 'lonely', x: 410, y: 500 },
  ],
  loreSnippet: 'Alone, a stone is an obstacle. Together, a road.',
};

export const LEVEL_3: LevelDefinition = {
  id: 3,
  name: 'The Curious Beast',
  subtitle: 'Curiosity moves even the most stubborn hearts.',
  region: 'meadow',
  width: 3000,
  height: 900,
  playerStart: { x: 120, y: 640 },
  goalPosition: { x: 2800, y: 660 },
  platforms: [
    { x: 0, y: 720, width: 600, height: 180 },
    { x: 180, y: 540, width: 140, height: 24 },
    { x: 650, y: 640, width: 140, height: 24 },
    { x: 850, y: 560, width: 140, height: 24 },
    { x: 1040, y: 720, width: 700, height: 180 },
    { x: 1740, y: 420, width: 220, height: 220 },
    { x: 1740, y: 720, width: 220, height: 180 },
    { x: 1680, y: 380, width: 120, height: 20 },
    { x: 1880, y: 320, width: 120, height: 20 },
    { x: 2080, y: 380, width: 120, height: 20 },
    { x: 1960, y: 720, width: 440, height: 180 },
    { x: 2400, y: 720, width: 600, height: 180 },
  ],
  entities: [
    { type: 'creature', x: 1840, y: 690, id: 'beast' },
    { type: 'collectible', x: 1220, y: 685, id: 'lure1' },
    { type: 'collectible', x: 1480, y: 685, id: 'lure2' },
    { type: 'rock', x: 1100, y: 690, id: 'rock_1' },
    { type: 'button', x: 1080, y: 706, id: 'btn_1', linkedTo: 'door_3' },
    { type: 'door', x: 2300, y: 680, id: 'door_3' },
    { type: 'collectible', x: 2600, y: 680 },
  ],
  conceptPickups: [
    { conceptId: 'curious', x: 250, y: 490 },
  ],
  loreSnippet: 'It watches the world, waiting for something wondrous.',
};

export const LEVEL_4: LevelDefinition = {
  id: 4,
  name: 'The Cowardly Door',
  subtitle: 'A frightened barrier steps aside.',
  region: 'meadow',
  width: 2800,
  height: 900,
  playerStart: { x: 120, y: 640 },
  goalPosition: { x: 2600, y: 660 },
  platforms: [
    { x: 0, y: 720, width: 800, height: 180 },
    { x: 900, y: 720, width: 600, height: 180 },
    { x: 1550, y: 450, width: 180, height: 200 },
    { x: 1550, y: 720, width: 180, height: 180 },
    { x: 1730, y: 720, width: 1100, height: 180 },
  ],
  entities: [
    { type: 'door', x: 1600, y: 680, id: 'coward_door' },
    { type: 'rock', x: 1100, y: 690, id: 'threat_rock' },
    { type: 'collectible', x: 2100, y: 680 },
  ],
  conceptPickups: [],
  loreSnippet: 'Even walls yield when they believe they are in peril.',
};

// ============================================================
// REGION 2: THE HOLLOW WOODS (Levels 5-8 + Secret 2)
// ============================================================

export const LEVEL_5: LevelDefinition = {
  id: 5,
  name: 'Into the Gloom',
  subtitle: 'Trust bridges the darkest shadows.',
  region: 'woods',
  width: 3000,
  height: 900,
  playerStart: { x: 120, y: 640 },
  goalPosition: { x: 2800, y: 660 },
  platforms: [
    { x: 0, y: 720, width: 700, height: 180 },
    { x: 250, y: 540, width: 150, height: 24 },
    { x: 850, y: 720, width: 500, height: 180 },
    { x: 1500, y: 720, width: 500, height: 180 },
    { x: 2150, y: 720, width: 850, height: 180 },
  ],
  entities: [
    { type: 'creature', x: 500, y: 690, id: 'wood_creature' },
    { type: 'pressure_plate', x: 1100, y: 710, id: 'plate_5', linkedTo: 'gate_5' },
    { type: 'door', x: 2100, y: 680, id: 'gate_5' },
    { type: 'collectible', x: 2500, y: 680 },
  ],
  conceptPickups: [
    { conceptId: 'trust', x: 320, y: 490 },
  ],
  loreSnippet: 'In the quiet gloom, two wanderers find kinship.',
};

export const LEVEL_6: LevelDefinition = {
  id: 6,
  name: 'The Hungry Maw',
  subtitle: 'A sweet aroma guides the way.',
  region: 'woods',
  width: 3200,
  height: 900,
  playerStart: { x: 120, y: 640 },
  goalPosition: { x: 3000, y: 660 },
  platforms: [
    { x: 0, y: 720, width: 800, height: 180 },
    { x: 300, y: 550, width: 140, height: 24 },
    { x: 950, y: 720, width: 900, height: 180 },
    { x: 1950, y: 480, width: 160, height: 180 },
    { x: 1950, y: 720, width: 160, height: 180 },
    { x: 2110, y: 720, width: 1100, height: 180 },
  ],
  entities: [
    { type: 'creature', x: 2000, y: 690, id: 'hungry_beast' },
    { type: 'food', x: 1200, y: 690, id: 'sweet_berry' },
    { type: 'collectible', x: 2700, y: 680 },
  ],
  conceptPickups: [
    { conceptId: 'hungry', x: 370, y: 500 },
  ],
  loreSnippet: 'The appetite of the woods is eternal and predictable.',
};

export const LEVEL_7: LevelDefinition = {
  id: 7,
  name: 'The Loyal Guardian',
  subtitle: 'Stand between the storm and the flame.',
  region: 'woods',
  width: 3200,
  height: 900,
  playerStart: { x: 120, y: 640 },
  goalPosition: { x: 3000, y: 660 },
  platforms: [
    { x: 0, y: 720, width: 900, height: 180 },
    { x: 400, y: 530, width: 160, height: 24 },
    { x: 1050, y: 720, width: 900, height: 180 },
    { x: 2100, y: 720, width: 1100, height: 180 },
  ],
  entities: [
    { type: 'rock', x: 600, y: 690, id: 'guardian_rock' },
    { type: 'creature', x: 1300, y: 690, id: 'forest_friend' },
    { type: 'pressure_plate', x: 1600, y: 710, id: 'plate_7', linkedTo: 'door_7' },
    { type: 'door', x: 2050, y: 680, id: 'door_7' },
    { type: 'collectible', x: 2600, y: 680 },
  ],
  conceptPickups: [
    { conceptId: 'protective', x: 480, y: 480 },
  ],
  loreSnippet: 'To protect is to claim another as your own heart.',
};

export const LEVEL_8: LevelDefinition = {
  id: 8,
  name: 'The Shadowed Grove',
  subtitle: 'Harmonize the forest’s varied desires.',
  region: 'woods',
  width: 3400,
  height: 900,
  playerStart: { x: 120, y: 640 },
  goalPosition: { x: 3200, y: 660 },
  platforms: [
    { x: 0, y: 720, width: 800, height: 180 },
    { x: 950, y: 720, width: 1000, height: 180 },
    { x: 2100, y: 720, width: 1300, height: 180 },
  ],
  entities: [
    { type: 'creature', x: 600, y: 690, id: 'grove_creature1' },
    { type: 'creature', x: 1200, y: 690, id: 'grove_creature2' },
    { type: 'food', x: 1500, y: 690, id: 'grove_berry' },
    { type: 'pressure_plate', x: 1750, y: 710, id: 'plate_8', linkedTo: 'door_8' },
    { type: 'door', x: 2050, y: 680, id: 'door_8' },
    { type: 'collectible', x: 2800, y: 680 },
  ],
  conceptPickups: [],
  loreSnippet: 'The trees whisper secrets of interconnected wills.',
};

// ============================================================
// REGION 3: THE CLOCKWORK RUINS (Levels 9-12 + Secret 3)
// ============================================================

export const LEVEL_9: LevelDefinition = {
  id: 9,
  name: 'Iron & Cog',
  subtitle: 'Gears turn when given golden desire.',
  region: 'ruins',
  width: 3200,
  height: 900,
  playerStart: { x: 120, y: 640 },
  goalPosition: { x: 3000, y: 660 },
  platforms: [
    { x: 0, y: 720, width: 800, height: 180 },
    { x: 200, y: 540, width: 140, height: 24 },
    { x: 950, y: 720, width: 800, height: 180 },
    { x: 1900, y: 720, width: 1300, height: 180 },
  ],
  entities: [
    { type: 'machine', x: 500, y: 690, id: 'automaton_1' },
    { type: 'collectible', x: 1400, y: 680, id: 'shiny_gear' },
    { type: 'pressure_plate', x: 1550, y: 710, id: 'plate_9', linkedTo: 'door_9' },
    { type: 'door', x: 1850, y: 680, id: 'door_9' },
    { type: 'collectible', x: 2600, y: 680 },
  ],
  conceptPickups: [
    { conceptId: 'greedy', x: 270, y: 490 },
  ],
  loreSnippet: 'Cold iron stirs with warm acquisitive greed.',
};

export const LEVEL_10: LevelDefinition = {
  id: 10,
  name: 'The Stubborn Anchor',
  subtitle: 'Refusal is a formidable foundation.',
  region: 'ruins',
  width: 3200,
  height: 900,
  playerStart: { x: 120, y: 640 },
  goalPosition: { x: 3000, y: 660 },
  platforms: [
    { x: 0, y: 720, width: 700, height: 180 },
    { x: 250, y: 530, width: 150, height: 24 },
    { x: 850, y: 720, width: 900, height: 180 },
    { x: 1900, y: 720, width: 1300, height: 180 },
  ],
  entities: [
    { type: 'rock', x: 600, y: 690, id: 'anchor_rock' },
    { type: 'platform', x: 1200, y: 620, id: 'shifty_plat' },
    { type: 'pressure_plate', x: 1500, y: 710, id: 'plate_10', linkedTo: 'door_10' },
    { type: 'door', x: 1850, y: 680, id: 'door_10' },
    { type: 'collectible', x: 2500, y: 680 },
  ],
  conceptPickups: [
    { conceptId: 'stubborn', x: 320, y: 480 },
  ],
  loreSnippet: 'What will not move becomes an unshakable truth.',
};

export const LEVEL_11: LevelDefinition = {
  id: 11,
  name: 'The Pendulum',
  subtitle: 'A cadence that never ceases.',
  region: 'ruins',
  width: 3400,
  height: 900,
  playerStart: { x: 120, y: 640 },
  goalPosition: { x: 3200, y: 660 },
  platforms: [
    { x: 0, y: 720, width: 700, height: 180 },
    { x: 280, y: 540, width: 140, height: 24 },
    { x: 800, y: 780, width: 120, height: 120 },
    { x: 1400, y: 780, width: 120, height: 120 },
    { x: 2000, y: 720, width: 1400, height: 180 },
  ],
  entities: [
    { type: 'platform', x: 1100, y: 650, id: 'pendulum_plat1' },
    { type: 'platform', x: 1700, y: 650, id: 'pendulum_plat2' },
    { type: 'collectible', x: 2700, y: 680 },
  ],
  conceptPickups: [
    { conceptId: 'repeat', x: 350, y: 490 },
  ],
  loreSnippet: 'Time itself is a concept repeated without end.',
};

export const LEVEL_12: LevelDefinition = {
  id: 12,
  name: 'The Mirrored Hall',
  subtitle: 'A twin soul to solve the twin lock.',
  region: 'ruins',
  width: 3400,
  height: 900,
  playerStart: { x: 120, y: 640 },
  goalPosition: { x: 3200, y: 660 },
  platforms: [
    { x: 0, y: 720, width: 800, height: 180 },
    { x: 250, y: 530, width: 140, height: 24 },
    { x: 950, y: 720, width: 1000, height: 180 },
    { x: 2100, y: 720, width: 1300, height: 180 },
  ],
  entities: [
    { type: 'machine', x: 600, y: 690, id: 'mirror_automaton' },
    { type: 'pressure_plate', x: 1400, y: 710, id: 'plate_12a', linkedTo: 'door_12' },
    { type: 'pressure_plate', x: 1700, y: 710, id: 'plate_12b', linkedTo: 'door_12' },
    { type: 'door', x: 2050, y: 680, id: 'door_12' },
    { type: 'collectible', x: 2800, y: 680 },
  ],
  conceptPickups: [
    { conceptId: 'imitate', x: 320, y: 480 },
  ],
  loreSnippet: 'In the mirror of brass, your motion becomes shared purpose.',
};

// ============================================================
// REGION 4: THE DREAMING MOUNTAINS (Levels 13-16)
// ============================================================

export const LEVEL_13: LevelDefinition = {
  id: 13,
  name: 'Floating Crags',
  subtitle: 'The sky beckons to those who guide.',
  region: 'mountains',
  width: 3400,
  height: 900,
  playerStart: { x: 120, y: 640 },
  goalPosition: { x: 3200, y: 660 },
  platforms: [
    { x: 0, y: 720, width: 700, height: 180 },
    { x: 220, y: 530, width: 140, height: 24 },
    { x: 850, y: 680, width: 140, height: 24 },
    { x: 1250, y: 600, width: 140, height: 24 },
    { x: 1650, y: 520, width: 140, height: 24 },
    { x: 2050, y: 720, width: 1350, height: 180 },
  ],
  entities: [
    { type: 'platform', x: 1050, y: 640, id: 'sky_plat' },
    { type: 'creature', x: 500, y: 690, id: 'mountain_spirit' },
    { type: 'collectible', x: 2700, y: 680 },
  ],
  conceptPickups: [
    { conceptId: 'follow', x: 290, y: 480 },
  ],
  loreSnippet: 'Above the clouds, gravity is merely a gentle suggestion.',
};

export const LEVEL_14: LevelDefinition = {
  id: 14,
  name: 'The Slumbering Colossus',
  subtitle: 'Rest turns restless beasts into pillars.',
  region: 'mountains',
  width: 3400,
  height: 900,
  playerStart: { x: 120, y: 640 },
  goalPosition: { x: 3200, y: 660 },
  platforms: [
    { x: 0, y: 720, width: 800, height: 180 },
    { x: 300, y: 540, width: 140, height: 24 },
    { x: 950, y: 780, width: 400, height: 120 },
    { x: 1500, y: 720, width: 1900, height: 180 },
  ],
  entities: [
    { type: 'creature', x: 1100, y: 740, id: 'sleepy_beast' },
    { type: 'collectible', x: 2600, y: 680 },
  ],
  conceptPickups: [
    { conceptId: 'sleepy', x: 370, y: 490 },
  ],
  loreSnippet: 'In dreamless sleep, the colossus cradles the road.',
};

export const LEVEL_15: LevelDefinition = {
  id: 15,
  name: 'The Jealous Garden',
  subtitle: 'A rivalry across blooming heights.',
  region: 'mountains',
  width: 3600,
  height: 900,
  playerStart: { x: 120, y: 640 },
  goalPosition: { x: 3400, y: 660 },
  platforms: [
    { x: 0, y: 720, width: 800, height: 180 },
    { x: 250, y: 530, width: 140, height: 24 },
    { x: 950, y: 720, width: 1000, height: 180 },
    { x: 2100, y: 720, width: 1500, height: 180 },
  ],
  entities: [
    { type: 'creature', x: 600, y: 690, id: 'rival_a' },
    { type: 'creature', x: 1300, y: 690, id: 'rival_b' },
    { type: 'collectible', x: 1600, y: 680, id: 'prize_orb' },
    { type: 'pressure_plate', x: 1800, y: 710, id: 'plate_15', linkedTo: 'door_15' },
    { type: 'door', x: 2050, y: 680, id: 'door_15' },
    { type: 'collectible', x: 3000, y: 680 },
  ],
  conceptPickups: [
    { conceptId: 'jealous', x: 320, y: 480 },
  ],
  loreSnippet: 'Jealousy fuels the dash toward glory.',
};

export const LEVEL_16: LevelDefinition = {
  id: 16,
  name: 'The Grand Awakening',
  subtitle: 'The world remembers all that it may become.',
  region: 'mountains',
  width: 3800,
  height: 900,
  playerStart: { x: 120, y: 640 },
  goalPosition: { x: 3600, y: 660 },
  platforms: [
    { x: 0, y: 720, width: 800, height: 180 },
    { x: 950, y: 720, width: 900, height: 180 },
    { x: 2000, y: 720, width: 900, height: 180 },
    { x: 3050, y: 720, width: 750, height: 180 },
  ],
  entities: [
    { type: 'creature', x: 600, y: 690, id: 'final_creature' },
    { type: 'machine', x: 1300, y: 690, id: 'final_machine' },
    { type: 'rock', x: 1500, y: 690, id: 'final_rock' },
    { type: 'pressure_plate', x: 2400, y: 710, id: 'plate_16', linkedTo: 'door_16' },
    { type: 'door', x: 2950, y: 680, id: 'door_16' },
    { type: 'collectible', x: 3400, y: 680 },
  ],
  conceptPickups: [],
  loreSnippet: 'You have given the world its soul again. There is always another way.',
};

// ============================================================
// SECRET CHALLENGE LEVELS (S1, S2, S3)
// ============================================================

export const LEVEL_17: LevelDefinition = {
  id: 17,
  name: 'The Echo Chamber',
  subtitle: 'Secret Challenge 1 · The Meadow Sanctuary',
  region: 'meadow',
  isSecret: true,
  width: 2600,
  height: 900,
  playerStart: { x: 120, y: 640 },
  goalPosition: { x: 2400, y: 660 },
  platforms: [
    { x: 0, y: 720, width: 700, height: 180 },
    { x: 850, y: 720, width: 800, height: 180 },
    { x: 1800, y: 720, width: 800, height: 180 },
  ],
  entities: [
    { type: 'rock', x: 500, y: 690, id: 'secret_rock1' },
    { type: 'rock', x: 1100, y: 690, id: 'secret_rock2' },
    { type: 'collectible', x: 2100, y: 680 },
  ],
  conceptPickups: [],
  loreSnippet: 'A forgotten alcove echoing ancient melodies.',
};

export const LEVEL_18: LevelDefinition = {
  id: 18,
  name: 'The Moonlit Grove',
  subtitle: 'Secret Challenge 2 · Deep Woods Hollow',
  region: 'woods',
  isSecret: true,
  width: 2800,
  height: 900,
  playerStart: { x: 120, y: 640 },
  goalPosition: { x: 2600, y: 660 },
  platforms: [
    { x: 0, y: 720, width: 800, height: 180 },
    { x: 950, y: 720, width: 800, height: 180 },
    { x: 1900, y: 720, width: 900, height: 180 },
  ],
  entities: [
    { type: 'creature', x: 600, y: 690, id: 'moon_beast' },
    { type: 'food', x: 1200, y: 690, id: 'moon_berry' },
    { type: 'collectible', x: 2300, y: 680 },
  ],
  conceptPickups: [],
  loreSnippet: 'Moonlight bathes those who look beyond the obvious.',
};

export const LEVEL_19: LevelDefinition = {
  id: 19,
  name: 'The Gearvault',
  subtitle: 'Secret Challenge 3 · The Clockwork Heart',
  region: 'ruins',
  isSecret: true,
  width: 2800,
  height: 900,
  playerStart: { x: 120, y: 640 },
  goalPosition: { x: 2600, y: 660 },
  platforms: [
    { x: 0, y: 720, width: 800, height: 180 },
    { x: 950, y: 720, width: 800, height: 180 },
    { x: 1900, y: 720, width: 900, height: 180 },
  ],
  entities: [
    { type: 'machine', x: 600, y: 690, id: 'vault_automaton' },
    { type: 'platform', x: 1200, y: 630, id: 'vault_plat' },
    { type: 'collectible', x: 2300, y: 680 },
  ],
  conceptPickups: [],
  loreSnippet: 'The heart of machinery beats to the cadence of intent.',
};

// ---- Registry ----
export const ALL_LEVELS: Record<number, LevelDefinition> = {
  1: LEVEL_1,
  2: LEVEL_2,
  3: LEVEL_3,
  4: LEVEL_4,
  5: LEVEL_5,
  6: LEVEL_6,
  7: LEVEL_7,
  8: LEVEL_8,
  9: LEVEL_9,
  10: LEVEL_10,
  11: LEVEL_11,
  12: LEVEL_12,
  13: LEVEL_13,
  14: LEVEL_14,
  15: LEVEL_15,
  16: LEVEL_16,
  17: LEVEL_17,
  18: LEVEL_18,
  19: LEVEL_19,
};
