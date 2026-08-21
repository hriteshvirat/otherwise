// ============================================================
// OTHERWISE — Concept Data Definitions
// Data-driven concept definitions for all 13 Concepts
// ============================================================
import { COLORS } from '../../utils/Constants';

export interface PerceptionRule {
  targetTags: string[];
  weight: number;
  valence: number; // +1 attractive, -1 repulsive, 0 neutral
  range: number;
}

export interface MovementRule {
  speedMultiplier: number;
  approachMode: 'approach' | 'flee' | 'orbit' | 'shield' | 'mimic' | 'anchor';
  minDistance: number;
  maxDistance: number;
  erraticness: number;
}

export interface VisualStyle {
  tintColor: number;
  glowColor: number;
  particleColor: number;
  auraIntensity: number;
  idleAnimation: 'tremble' | 'pulse' | 'sway' | 'bounce' | 'sleep' | 'mirror' | 'guard';
}

export interface ConceptDefinition {
  id: string;
  name: string;
  description: string;
  journalHint: string;
  icon: string;
  compatibleTags: string[];
  perceptionRules: PerceptionRule[];
  movementRules: MovementRule;
  visualStyle: VisualStyle;
  audioCue: string;
}

// 1. FEAR — avoid perceived threats
export const CONCEPT_FEAR: ConceptDefinition = {
  id: 'fear',
  name: 'FEAR',
  description: 'Things with Fear avoid what they perceive as dangerous.',
  journalHint: 'It makes things want to stay far from danger. What counts as "dangerous" depends on the thing.',
  icon: 'icon_fear',
  compatibleTags: ['movable', 'living', 'companion', 'solid'],
  perceptionRules: [
    { targetTags: ['player'], weight: 3.0, valence: -1, range: 320 },
    { targetTags: ['dangerous'], weight: 5.0, valence: -1, range: 450 },
    { targetTags: ['living'], weight: 1.5, valence: -1, range: 260 },
    { targetTags: ['cover', 'solid'], weight: 2.0, valence: 1, range: 200 },
  ],
  movementRules: {
    speedMultiplier: 1.4,
    approachMode: 'flee',
    minDistance: 160,
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

// 2. LONELY — seek companions
export const CONCEPT_LONELY: ConceptDefinition = {
  id: 'lonely',
  name: 'LONELY',
  description: 'Things with Lonely seek a compatible companion.',
  journalHint: 'It makes things search for something similar to itself. Like calls to like.',
  icon: 'icon_lonely',
  compatibleTags: ['movable', 'living', 'companion', 'solid', 'bridge'],
  perceptionRules: [
    { targetTags: ['companion'], weight: 4.0, valence: 1, range: 500 },
    { targetTags: ['movable'], weight: 2.5, valence: 1, range: 400 },
    { targetTags: ['living'], weight: 3.0, valence: 1, range: 350 },
  ],
  movementRules: {
    speedMultiplier: 0.85,
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

// 3. CURIOUS — investigate novelty
export const CONCEPT_CURIOUS: ConceptDefinition = {
  id: 'curious',
  name: 'CURIOUS',
  description: 'Things with Curious investigate unusual or interesting things.',
  journalHint: 'It makes things chase the unfamiliar. Anything new or moving catches their attention.',
  icon: 'icon_curious',
  compatibleTags: ['movable', 'living', 'companion', 'machine'],
  perceptionRules: [
    { targetTags: ['special', 'collectible'], weight: 4.5, valence: 1, range: 450 },
    { targetTags: ['interactive'], weight: 3.0, valence: 1, range: 350 },
    { targetTags: ['player'], weight: 2.0, valence: 1, range: 300 },
  ],
  movementRules: {
    speedMultiplier: 1.0,
    approachMode: 'approach',
    minDistance: 20,
    maxDistance: 90,
    erraticness: 0.35,
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

// 4. TRUST — follow & cooperate with player
export const CONCEPT_TRUST: ConceptDefinition = {
  id: 'trust',
  name: 'TRUST',
  description: 'Things with Trust feel safe and stay close to their ally.',
  journalHint: 'When trust is given, the target abandons hesitation and stays faithful to your side.',
  icon: 'icon_trust',
  compatibleTags: ['living', 'companion', 'movable'],
  perceptionRules: [
    { targetTags: ['player'], weight: 5.0, valence: 1, range: 600 },
    { targetTags: ['dangerous'], weight: 2.0, valence: -1, range: 250 },
  ],
  movementRules: {
    speedMultiplier: 1.1,
    approachMode: 'approach',
    minDistance: 35,
    maxDistance: 70,
    erraticness: 0.05,
  },
  visualStyle: {
    tintColor: COLORS.TRUST,
    glowColor: COLORS.TRUST_GLOW,
    particleColor: COLORS.TRUST,
    auraIntensity: 0.55,
    idleAnimation: 'sway',
  },
  audioCue: 'concept_applied',
};

// 5. GREEDY — aggressively seek valuables
export const CONCEPT_GREEDY: ConceptDefinition = {
  id: 'greedy',
  name: 'GREEDY',
  description: 'Things with Greedy seek and hoard valuable objects.',
  journalHint: 'A greedy thing wants every shiny treasure in sight and stops at nothing to hoard it.',
  icon: 'icon_greedy',
  compatibleTags: ['movable', 'living', 'machine', 'companion'],
  perceptionRules: [
    { targetTags: ['collectible', 'special', 'valuable'], weight: 6.0, valence: 1, range: 600 },
    { targetTags: ['interactive'], weight: 2.0, valence: 1, range: 300 },
  ],
  movementRules: {
    speedMultiplier: 1.3,
    approachMode: 'approach',
    minDistance: 5,
    maxDistance: 30,
    erraticness: 0.15,
  },
  visualStyle: {
    tintColor: COLORS.GREEDY,
    glowColor: COLORS.GREEDY_GLOW,
    particleColor: COLORS.GREEDY,
    auraIntensity: 0.6,
    idleAnimation: 'pulse',
  },
  audioCue: 'concept_curious',
};

// 6. PROTECTIVE — shield target & intercept danger
export const CONCEPT_PROTECTIVE: ConceptDefinition = {
  id: 'protective',
  name: 'PROTECTIVE',
  description: 'Things with Protective place themselves between danger and their ward.',
  journalHint: 'A protective entity guards its charge fiercely, body-blocking threats.',
  icon: 'icon_protective',
  compatibleTags: ['living', 'solid', 'companion', 'movable'],
  perceptionRules: [
    { targetTags: ['player'], weight: 4.0, valence: 1, range: 500 },
    { targetTags: ['dangerous'], weight: 5.0, valence: 1, range: 400 },
  ],
  movementRules: {
    speedMultiplier: 1.15,
    approachMode: 'shield',
    minDistance: 20,
    maxDistance: 60,
    erraticness: 0.05,
  },
  visualStyle: {
    tintColor: COLORS.PROTECTIVE,
    glowColor: COLORS.PROTECTIVE_GLOW,
    particleColor: COLORS.PROTECTIVE,
    auraIntensity: 0.65,
    idleAnimation: 'guard',
  },
  audioCue: 'concept_lonely',
};

// 7. STUBBORN — resists movement & displacement
export const CONCEPT_STUBBORN: ConceptDefinition = {
  id: 'stubborn',
  name: 'STUBBORN',
  description: 'Things with Stubborn become immovable anchors that refuse to shift.',
  journalHint: 'Like an ancient mountain, a stubborn object roots itself deeply into the earth.',
  icon: 'icon_stubborn',
  compatibleTags: ['solid', 'movable', 'rock', 'platform'],
  perceptionRules: [],
  movementRules: {
    speedMultiplier: 0.0,
    approachMode: 'anchor',
    minDistance: 0,
    maxDistance: 0,
    erraticness: 0.0,
  },
  visualStyle: {
    tintColor: COLORS.STUBBORN,
    glowColor: COLORS.STUBBORN_GLOW,
    particleColor: COLORS.STUBBORN,
    auraIntensity: 0.45,
    idleAnimation: 'pulse',
  },
  audioCue: 'switch',
};

// 8. IMITATE — mirrors movement
export const CONCEPT_IMITATE: ConceptDefinition = {
  id: 'imitate',
  name: 'IMITATE',
  description: 'Things with Imitate reproduce the movement of what they observe.',
  journalHint: 'As you move, so does the imitator — mirroring your steps across gaps and switches.',
  icon: 'icon_imitate',
  compatibleTags: ['living', 'companion', 'machine', 'movable'],
  perceptionRules: [
    { targetTags: ['player'], weight: 5.0, valence: 1, range: 600 },
  ],
  movementRules: {
    speedMultiplier: 1.0,
    approachMode: 'mimic',
    minDistance: 0,
    maxDistance: 999,
    erraticness: 0.0,
  },
  visualStyle: {
    tintColor: COLORS.IMITATE,
    glowColor: COLORS.IMITATE_GLOW,
    particleColor: COLORS.IMITATE,
    auraIntensity: 0.6,
    idleAnimation: 'mirror',
  },
  audioCue: 'discovery',
};

// 9. HUNGRY — hunts for food/bait
export const CONCEPT_HUNGRY: ConceptDefinition = {
  id: 'hungry',
  name: 'HUNGRY',
  description: 'Things with Hungry seek edible or consumable resources.',
  journalHint: 'The primal drive of hunger propels the creature toward any organic bait.',
  icon: 'icon_hungry',
  compatibleTags: ['living', 'creature'],
  perceptionRules: [
    { targetTags: ['food', 'bait', 'collectible'], weight: 6.0, valence: 1, range: 550 },
  ],
  movementRules: {
    speedMultiplier: 1.25,
    approachMode: 'approach',
    minDistance: 5,
    maxDistance: 40,
    erraticness: 0.2,
  },
  visualStyle: {
    tintColor: COLORS.HUNGRY,
    glowColor: COLORS.HUNGRY_GLOW,
    particleColor: COLORS.HUNGRY,
    auraIntensity: 0.55,
    idleAnimation: 'bounce',
  },
  audioCue: 'concept_curious',
};

// 10. SLEEPY — becomes heavy and dormant
export const CONCEPT_SLEEPY: ConceptDefinition = {
  id: 'sleepy',
  name: 'SLEEPY',
  description: 'Things with Sleepy enter a tranquil slumber, becoming solid resting stones.',
  journalHint: 'A sleeping creature curls up and becomes a sturdy stepping stone.',
  icon: 'icon_sleepy',
  compatibleTags: ['living', 'creature', 'movable'],
  perceptionRules: [],
  movementRules: {
    speedMultiplier: 0.0,
    approachMode: 'anchor',
    minDistance: 0,
    maxDistance: 0,
    erraticness: 0.0,
  },
  visualStyle: {
    tintColor: COLORS.SLEEPY,
    glowColor: COLORS.SLEEPY_GLOW,
    particleColor: COLORS.SLEEPY,
    auraIntensity: 0.4,
    idleAnimation: 'sleep',
  },
  audioCue: 'concept_lonely',
};

// 11. JEALOUS — prevents others from getting items
export const CONCEPT_JEALOUS: ConceptDefinition = {
  id: 'jealous',
  name: 'JEALOUS',
  description: 'Things with Jealous rush to block others from reaching valuable objects.',
  journalHint: 'If someone else gets close to the prize, jealousy drives them to intercept.',
  icon: 'icon_jealous',
  compatibleTags: ['living', 'creature', 'companion'],
  perceptionRules: [
    { targetTags: ['collectible', 'special'], weight: 4.0, valence: 1, range: 450 },
    { targetTags: ['player'], weight: 3.0, valence: -1, range: 300 },
  ],
  movementRules: {
    speedMultiplier: 1.2,
    approachMode: 'approach',
    minDistance: 15,
    maxDistance: 60,
    erraticness: 0.25,
  },
  visualStyle: {
    tintColor: COLORS.JEALOUS,
    glowColor: COLORS.JEALOUS_GLOW,
    particleColor: COLORS.JEALOUS,
    auraIntensity: 0.6,
    idleAnimation: 'tremble',
  },
  audioCue: 'concept_fear',
};

// 12. FOLLOW — tracks target faithfully
export const CONCEPT_FOLLOW: ConceptDefinition = {
  id: 'follow',
  name: 'FOLLOW',
  description: 'Things with Follow shadow a target at a comfortable distance.',
  journalHint: 'A natural follower tracks your trajectory smoothly.',
  icon: 'icon_follow',
  compatibleTags: ['living', 'companion', 'machine', 'platform'],
  perceptionRules: [
    { targetTags: ['player'], weight: 5.0, valence: 1, range: 600 },
  ],
  movementRules: {
    speedMultiplier: 1.0,
    approachMode: 'approach',
    minDistance: 40,
    maxDistance: 90,
    erraticness: 0.05,
  },
  visualStyle: {
    tintColor: COLORS.FOLLOW,
    glowColor: COLORS.FOLLOW_GLOW,
    particleColor: COLORS.FOLLOW,
    auraIntensity: 0.5,
    idleAnimation: 'sway',
  },
  audioCue: 'concept_applied',
};

// 13. REPEAT — cycles back and forth
export const CONCEPT_REPEAT: ConceptDefinition = {
  id: 'repeat',
  name: 'REPEAT',
  description: 'Things with Repeat continuously cycle a mechanical movement pattern.',
  journalHint: 'Repeats a rhythmic oscillation back and forth across its domain.',
  icon: 'icon_repeat',
  compatibleTags: ['machine', 'platform', 'movable'],
  perceptionRules: [],
  movementRules: {
    speedMultiplier: 1.0,
    approachMode: 'orbit',
    minDistance: 30,
    maxDistance: 120,
    erraticness: 0.0,
  },
  visualStyle: {
    tintColor: COLORS.REPEAT,
    glowColor: COLORS.REPEAT_GLOW,
    particleColor: COLORS.REPEAT,
    auraIntensity: 0.55,
    idleAnimation: 'sway',
  },
  audioCue: 'switch',
};

// ---- Registry ----
export const ALL_CONCEPTS: Record<string, ConceptDefinition> = {
  fear: CONCEPT_FEAR,
  lonely: CONCEPT_LONELY,
  curious: CONCEPT_CURIOUS,
  trust: CONCEPT_TRUST,
  greedy: CONCEPT_GREEDY,
  protective: CONCEPT_PROTECTIVE,
  stubborn: CONCEPT_STUBBORN,
  imitate: CONCEPT_IMITATE,
  hungry: CONCEPT_HUNGRY,
  sleepy: CONCEPT_SLEEPY,
  jealous: CONCEPT_JEALOUS,
  follow: CONCEPT_FOLLOW,
  repeat: CONCEPT_REPEAT,
};
