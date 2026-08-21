// ============================================================
// OTHERWISE — Concept Data Definitions
// Data-driven concept definitions: FEAR, LONELY, CURIOUS
// ============================================================
import { COLORS } from '../../utils/Constants';

// ---- Types ----
export interface PerceptionRule {
  /** What tags to look for in the environment */
  targetTags: string[];
  /** How important this perception is (higher = more important) */
  weight: number;
  /** Whether this target is attractive (+1) or repulsive (-1) */
  valence: number;
  /** Maximum perception range for this target type */
  range: number;
}

export interface MovementRule {
  /** Base movement speed multiplier */
  speedMultiplier: number;
  /** Whether to flee (negative) or approach (positive) scored targets */
  approachMode: 'approach' | 'flee' | 'orbit';
  /** Minimum distance to maintain from target */
  minDistance: number;
  /** Maximum distance to maintain from target */
  maxDistance: number;
  /** How erratically the entity moves (0 = straight line, 1 = very erratic) */
  erraticness: number;
}

export interface VisualStyle {
  /** Tint color when concept is active */
  tintColor: number;
  /** Glow color for aura */
  glowColor: number;
  /** Particle color */
  particleColor: number;
  /** Aura intensity (0-1) */
  auraIntensity: number;
  /** Idle animation style */
  idleAnimation: 'tremble' | 'pulse' | 'sway' | 'bounce';
}

export interface ConceptDefinition {
  id: string;
  name: string;
  description: string;
  journalHint: string;
  icon: string;           // Texture key
  compatibleTags: string[];
  perceptionRules: PerceptionRule[];
  movementRules: MovementRule;
  visualStyle: VisualStyle;
  audioCue: string;
}

// ---- Concept Definitions ----

export const CONCEPT_FEAR: ConceptDefinition = {
  id: 'fear',
  name: 'FEAR',
  description: 'Things with Fear avoid what they perceive as dangerous.',
  journalHint: 'It makes things want to stay far from danger. What counts as "dangerous" depends on the thing.',
  icon: 'icon_fear',
  compatibleTags: ['movable', 'living', 'companion', 'solid'],
  perceptionRules: [
    { targetTags: ['player'], weight: 3.0, valence: -1, range: 300 },
    { targetTags: ['dangerous'], weight: 5.0, valence: -1, range: 400 },
    { targetTags: ['living'], weight: 1.5, valence: -1, range: 250 },
    { targetTags: ['cover', 'solid'], weight: 2.0, valence: 1, range: 200 },
  ],
  movementRules: {
    speedMultiplier: 1.4,
    approachMode: 'flee',
    minDistance: 150,
    maxDistance: 999,
    erraticness: 0.3,
  },
  visualStyle: {
    tintColor: COLORS.FEAR,
    glowColor: COLORS.FEAR_GLOW,
    particleColor: COLORS.FEAR,
    auraIntensity: 0.6,
    idleAnimation: 'tremble',
  },
  audioCue: 'concept_fear',
};

export const CONCEPT_LONELY: ConceptDefinition = {
  id: 'lonely',
  name: 'LONELY',
  description: 'Things with Lonely seek a compatible companion.',
  journalHint: 'It makes things search for something similar to itself. Like calls to like.',
  icon: 'icon_lonely',
  compatibleTags: ['movable', 'living', 'companion', 'solid'],
  perceptionRules: [
    { targetTags: ['companion'], weight: 4.0, valence: 1, range: 500 },
    { targetTags: ['movable'], weight: 2.5, valence: 1, range: 400 },
    { targetTags: ['living'], weight: 3.0, valence: 1, range: 350 },
  ],
  movementRules: {
    speedMultiplier: 0.8,
    approachMode: 'approach',
    minDistance: 10,
    maxDistance: 50,
    erraticness: 0.1,
  },
  visualStyle: {
    tintColor: COLORS.LONELY,
    glowColor: COLORS.LONELY_GLOW,
    particleColor: COLORS.LONELY,
    auraIntensity: 0.5,
    idleAnimation: 'pulse',
  },
  audioCue: 'concept_lonely',
};

export const CONCEPT_CURIOUS: ConceptDefinition = {
  id: 'curious',
  name: 'CURIOUS',
  description: 'Things with Curious investigate unusual or interesting things.',
  journalHint: 'It makes things chase the unfamiliar. Anything new or moving catches their attention.',
  icon: 'icon_curious',
  compatibleTags: ['movable', 'living', 'companion'],
  perceptionRules: [
    { targetTags: ['special'], weight: 4.0, valence: 1, range: 400 },
    { targetTags: ['interactive'], weight: 3.0, valence: 1, range: 350 },
    { targetTags: ['collectible'], weight: 5.0, valence: 1, range: 500 },
    { targetTags: ['player'], weight: 2.0, valence: 1, range: 300 },
  ],
  movementRules: {
    speedMultiplier: 1.0,
    approachMode: 'approach',
    minDistance: 20,
    maxDistance: 80,
    erraticness: 0.4,
  },
  visualStyle: {
    tintColor: COLORS.CURIOUS,
    glowColor: COLORS.CURIOUS_GLOW,
    particleColor: COLORS.CURIOUS,
    auraIntensity: 0.5,
    idleAnimation: 'bounce',
  },
  audioCue: 'concept_curious',
};

// ---- Registry ----
export const ALL_CONCEPTS: Record<string, ConceptDefinition> = {
  fear: CONCEPT_FEAR,
  lonely: CONCEPT_LONELY,
  curious: CONCEPT_CURIOUS,
};
