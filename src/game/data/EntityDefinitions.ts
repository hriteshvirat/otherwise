// ============================================================
// OTHERWISE — Entity Definitions
// Data-driven entity type registry with semantic tags
// ============================================================

export interface EntityDefinition {
  type: string;
  tags: string[];
  /** Whether this entity has physics (can move) */
  hasPhysics: boolean;
  /** Whether player can directly interact with E key */
  isInteractable: boolean;
  /** Mass for physics interactions (higher = harder to push) */
  mass: number;
  /** Default texture key */
  textureKey: string;
  /** Display name */
  displayName: string;
}

export const ENTITY_DEFS: Record<string, EntityDefinition> = {
  rock: {
    type: 'rock',
    tags: ['rock', 'movable', 'solid', 'companion', 'cover'],
    hasPhysics: true,
    isInteractable: true,
    mass: 2,
    textureKey: 'rock',
    displayName: 'Rock',
  },
  door: {
    type: 'door',
    tags: ['door', 'barrier', 'interactive'],
    hasPhysics: true,
    isInteractable: true,
    mass: 10,
    textureKey: 'door',
    displayName: 'Door',
  },
  platform: {
    type: 'platform',
    tags: ['platform', 'movable', 'solid'],
    hasPhysics: true,
    isInteractable: true,
    mass: 5,
    textureKey: 'platform_block',
    displayName: 'Platform',
  },
  creature: {
    type: 'creature',
    tags: ['creature', 'living', 'companion', 'movable'],
    hasPhysics: true,
    isInteractable: true,
    mass: 1,
    textureKey: 'creature',
    displayName: 'Creature',
  },
  machine: {
    type: 'machine',
    tags: ['machine', 'movable', 'solid', 'interactive', 'companion'],
    hasPhysics: true,
    isInteractable: true,
    mass: 4,
    textureKey: 'machine',
    displayName: 'Automaton',
  },
  food: {
    type: 'food',
    tags: ['food', 'bait', 'movable', 'collectible', 'valuable'],
    hasPhysics: true,
    isInteractable: true,
    mass: 0.5,
    textureKey: 'food',
    displayName: 'Sweet Berry',
  },
  pressure_plate: {
    type: 'pressure_plate',
    tags: ['plate', 'interactive', 'trigger'],
    hasPhysics: false,
    isInteractable: false,
    mass: 999,
    textureKey: 'pressure_plate',
    displayName: 'Pressure Plate',
  },
  button: {
    type: 'button',
    tags: ['button', 'interactive', 'trigger'],
    hasPhysics: false,
    isInteractable: true,
    mass: 999,
    textureKey: 'button_obj',
    displayName: 'Button',
  },
  bridge: {
    type: 'bridge',
    tags: ['bridge', 'barrier', 'movable', 'companion'],
    hasPhysics: true,
    isInteractable: true,
    mass: 3,
    textureKey: 'bridge',
    displayName: 'Bridge',
  },
  collectible: {
    type: 'collectible',
    tags: ['collectible', 'special', 'valuable'],
    hasPhysics: false,
    isInteractable: true,
    mass: 0,
    textureKey: 'collectible',
    displayName: 'Glowing Orb',
  },
};
