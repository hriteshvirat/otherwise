// ============================================================
// OTHERWISE — Level Data
// Data-driven level definitions with refined layout & puzzle design
// ============================================================

export interface LevelEntityPlacement {
  type: string;       // Key from ENTITY_DEFS
  x: number;
  y: number;
  id?: string;        // Optional unique ID for linking
  linkedTo?: string;   // ID of entity this one is linked to
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
  width: number;
  height: number;
  playerStart: { x: number; y: number };
  goalPosition: { x: number; y: number };
  platforms: LevelPlatform[];
  entities: LevelEntityPlacement[];
  conceptPickups: ConceptPickup[];
  /** Atmospheric hints */
  ambience: 'meadow' | 'cave' | 'ruins';
}

// ============================================================
// LEVEL 1 — DISCOVERY
// Teach movement, jumping, interaction, first concept (FEAR)
// ============================================================
export const LEVEL_1: LevelDefinition = {
  id: 1,
  name: 'Discovery',
  subtitle: 'Every journey begins with a single thought.',
  width: 2500,
  height: 900,
  playerStart: { x: 120, y: 640 },
  goalPosition: { x: 2250, y: 660 },
  platforms: [
    // Main starting ground
    { x: 0, y: 720, width: 600, height: 180 },
    // Gap (teaches jumping): x 600 to 700
    // Mid ground after first jump
    { x: 700, y: 720, width: 480, height: 180 },
    // Gap 2: x 1180 to 1280
    // Pre-obstacle ground
    { x: 1280, y: 720, width: 440, height: 180 },
    // Step platform
    { x: 1400, y: 620, width: 140, height: 24 },
    // Narrow passage ceiling barrier (prevents jumping over the rock)
    { x: 1680, y: 460, width: 160, height: 180 },
    // Passage floor
    { x: 1680, y: 720, width: 160, height: 180 },
    // Post-obstacle ground to goal
    { x: 1840, y: 720, width: 660, height: 180 },
  ],
  entities: [
    // Blocking rock — player applies FEAR to scare it away through the passage
    { type: 'rock', x: 1720, y: 690, id: 'blocking_rock' },
    // Decorative/interactive rocks for practice
    { type: 'rock', x: 320, y: 695, id: 'deco_rock1' },
    // Collectible orb
    { type: 'collectible', x: 2050, y: 680 },
  ],
  conceptPickups: [
    // FEAR concept discovered after the first jump
    { conceptId: 'fear', x: 880, y: 660 },
  ],
  ambience: 'meadow',
};

// ============================================================
// LEVEL 2 — LONELY BRIDGE
// Broken bridge, use LONELY on rocks to make them seek companions
// ============================================================
export const LEVEL_2: LevelDefinition = {
  id: 2,
  name: 'Lonely Bridge',
  subtitle: 'Sometimes the loneliest things just need each other.',
  width: 2800,
  height: 900,
  playerStart: { x: 120, y: 640 },
  goalPosition: { x: 2550, y: 660 },
  platforms: [
    // Starting area
    { x: 0, y: 720, width: 800, height: 180 },
    // Upper platform with concept pickup
    { x: 320, y: 550, width: 180, height: 24 },
    // Chasm stepping stones / bottom
    { x: 880, y: 780, width: 100, height: 120 },
    { x: 1060, y: 780, width: 100, height: 120 },
    { x: 1240, y: 780, width: 100, height: 120 },
    // Destination ground
    { x: 1400, y: 720, width: 500, height: 180 },
    // Door barrier platform
    { x: 1900, y: 720, width: 300, height: 180 },
    // Final ground
    { x: 2200, y: 720, width: 600, height: 180 },
  ],
  entities: [
    // Scattered rocks — apply LONELY so they aggregate and form bridge steps
    { type: 'rock', x: 250, y: 690, id: 'rock_a' },
    { type: 'rock', x: 500, y: 690, id: 'rock_b' },
    { type: 'rock', x: 720, y: 690, id: 'rock_c' },
    // Bridge segments placed across the chasm
    { type: 'bridge', x: 930, y: 710, id: 'bridge_1' },
    { type: 'bridge', x: 1110, y: 710, id: 'bridge_2' },
    { type: 'bridge', x: 1290, y: 710, id: 'bridge_3' },
    // Pressure plate on the right side
    { type: 'pressure_plate', x: 1600, y: 710, id: 'plate_1', linkedTo: 'gate_door' },
    // Door guarding final stretch
    { type: 'door', x: 1880, y: 680, id: 'gate_door' },
    // Collectible
    { type: 'collectible', x: 2350, y: 680 },
  ],
  conceptPickups: [
    // LONELY concept on the elevated platform
    { conceptId: 'lonely', x: 410, y: 500 },
  ],
  ambience: 'meadow',
};

// ============================================================
// LEVEL 3 — THE CURIOUS BEAST
// Creature blocks path, use CURIOUS to lure it away with interesting object
// ============================================================
export const LEVEL_3: LevelDefinition = {
  id: 3,
  name: 'The Curious Beast',
  subtitle: 'Curiosity moves even the most stubborn hearts.',
  width: 3000,
  height: 900,
  playerStart: { x: 120, y: 640 },
  goalPosition: { x: 2800, y: 660 },
  platforms: [
    // Starting area
    { x: 0, y: 720, width: 600, height: 180 },
    // Concept perch
    { x: 180, y: 540, width: 140, height: 24 },
    // Platform steps
    { x: 650, y: 640, width: 140, height: 24 },
    { x: 850, y: 560, width: 140, height: 24 },
    // Middle area
    { x: 1040, y: 720, width: 700, height: 180 },
    // Overhead wall above creature (blocks jumping over directly)
    { x: 1740, y: 420, width: 220, height: 220 },
    // Ground under beast
    { x: 1740, y: 720, width: 220, height: 180 },
    // Alternate upper route platforms
    { x: 1680, y: 380, width: 120, height: 20 },
    { x: 1880, y: 320, width: 120, height: 20 },
    { x: 2080, y: 380, width: 120, height: 20 },
    // Area after creature
    { x: 1960, y: 720, width: 440, height: 180 },
    // Final stretch to goal
    { x: 2400, y: 720, width: 600, height: 180 },
  ],
  entities: [
    // The curious beast — blocks the passage
    { type: 'creature', x: 1840, y: 690, id: 'beast' },
    // Lure objects — attract the curious beast
    { type: 'collectible', x: 1220, y: 685, id: 'lure1' },
    { type: 'collectible', x: 1480, y: 685, id: 'lure2' },
    // Movable rocks
    { type: 'rock', x: 1100, y: 690, id: 'rock_1' },
    { type: 'rock', x: 1580, y: 690, id: 'rock_2' },
    // Button that triggers alternate path
    { type: 'button', x: 1080, y: 706, id: 'btn_1', linkedTo: 'door_3' },
    // Door on lower route
    { type: 'door', x: 2300, y: 680, id: 'door_3' },
    // Final collectible
    { type: 'collectible', x: 2600, y: 680 },
  ],
  conceptPickups: [
    // CURIOUS concept
    { conceptId: 'curious', x: 250, y: 490 },
  ],
  ambience: 'meadow',
};

// ---- Level Registry ----
export const ALL_LEVELS: Record<number, LevelDefinition> = {
  1: LEVEL_1,
  2: LEVEL_2,
  3: LEVEL_3,
};
