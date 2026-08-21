// ============================================================
// OTHERWISE — Save Manager
// Versioned localStorage persistence with Creative Archive & World Memory
// ============================================================

const SAVE_KEY = 'otherwise_save_v2';
const SAVE_VERSION = 2;

export interface CreativityStats {
  conceptsApplied: number;
  uniqueCombinations: string[];
  jumps: number;
  deaths: number;
  secretsFound: number;
  unorthodoxSolutions: number;
}

export interface WorldMemory {
  trustedCreatures: string[];
  unlockedRegions: string[];
  unlockedLore: string[];
}

export interface SaveData {
  version: number;
  progress: {
    currentLevel: number;
    completedLevels: number[];
  };
  concepts: {
    discovered: string[];
    equipped: string | null;
  };
  discoveries: string[];
  creativity: CreativityStats;
  memory: WorldMemory;
  settings: {
    masterVolume: number;
    musicVolume: number;
    sfxVolume: number;
    muted: boolean;
    reducedMotion: boolean;
    screenShake: boolean;
    fullscreen: boolean;
  };
  secrets: string[];
  timestamp: number;
}

function defaultSave(): SaveData {
  return {
    version: SAVE_VERSION,
    progress: {
      currentLevel: 1,
      completedLevels: [],
    },
    concepts: {
      discovered: [],
      equipped: null,
    },
    discoveries: [],
    creativity: {
      conceptsApplied: 0,
      uniqueCombinations: [],
      jumps: 0,
      deaths: 0,
      secretsFound: 0,
      unorthodoxSolutions: 0,
    },
    memory: {
      trustedCreatures: [],
      unlockedRegions: ['meadow'],
      unlockedLore: [],
    },
    settings: {
      masterVolume: 0.7,
      musicVolume: 0.5,
      sfxVolume: 0.8,
      muted: false,
      reducedMotion: false,
      screenShake: true,
      fullscreen: false,
    },
    secrets: [],
    timestamp: Date.now(),
  };
}

export class SaveManager {
  private data: SaveData;

  constructor() {
    this.data = this.load();
  }

  private load(): SaveData {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) {
        // Check v1 migration
        const v1Raw = localStorage.getItem('otherwise_save');
        if (v1Raw) {
          const v1 = JSON.parse(v1Raw);
          const migrated = defaultSave();
          migrated.progress = v1.progress || migrated.progress;
          migrated.concepts = v1.concepts || migrated.concepts;
          migrated.discoveries = v1.discoveries || migrated.discoveries;
          migrated.settings = v1.settings || migrated.settings;
          return migrated;
        }
        return defaultSave();
      }

      const parsed = JSON.parse(raw) as SaveData;
      if (parsed.version !== SAVE_VERSION) {
        return defaultSave();
      }
      return { ...defaultSave(), ...parsed };
    } catch {
      return defaultSave();
    }
  }

  save(): void {
    try {
      this.data.timestamp = Date.now();
      localStorage.setItem(SAVE_KEY, JSON.stringify(this.data));
    } catch (e) {
      console.warn('SaveManager: failed to persist to localStorage', e);
    }
  }

  getData(): SaveData {
    return this.data;
  }

  // ---- Progress ----
  setCurrentLevel(level: number): void {
    this.data.progress.currentLevel = level;
    this.save();
  }

  completeLevel(level: number): void {
    if (!this.data.progress.completedLevels.includes(level)) {
      this.data.progress.completedLevels.push(level);
    }
    this.data.progress.currentLevel = Math.min(level + 1, 16);

    // Auto unlock regions
    if (level >= 4 && !this.data.memory.unlockedRegions.includes('woods')) {
      this.data.memory.unlockedRegions.push('woods');
    }
    if (level >= 8 && !this.data.memory.unlockedRegions.includes('ruins')) {
      this.data.memory.unlockedRegions.push('ruins');
    }
    if (level >= 12 && !this.data.memory.unlockedRegions.includes('mountains')) {
      this.data.memory.unlockedRegions.push('mountains');
    }

    this.save();
  }

  isLevelCompleted(level: number): boolean {
    return this.data.progress.completedLevels.includes(level);
  }

  getCurrentLevel(): number {
    return this.data.progress.currentLevel;
  }

  getCompletedLevels(): number[] {
    return this.data.progress.completedLevels;
  }

  // ---- Concepts ----
  discoverConcept(conceptId: string): void {
    if (!this.data.concepts.discovered.includes(conceptId)) {
      this.data.concepts.discovered.push(conceptId);
      this.save();
    }
  }

  setEquippedConcept(conceptId: string | null): void {
    this.data.concepts.equipped = conceptId;
    this.save();
  }

  getDiscoveredConcepts(): string[] {
    return this.data.concepts.discovered;
  }

  // ---- Discoveries & Journal ----
  addDiscovery(discoveryId: string): void {
    if (!this.data.discoveries.includes(discoveryId)) {
      this.data.discoveries.push(discoveryId);
      this.data.creativity.conceptsApplied++;
      this.save();
    }
  }

  hasDiscovery(discoveryId: string): boolean {
    return this.data.discoveries.includes(discoveryId);
  }

  getDiscoveries(): string[] {
    return this.data.discoveries;
  }

  // ---- Creativity Profile Stats ----
  recordJump(): void {
    this.data.creativity.jumps++;
  }

  recordDeath(): void {
    this.data.creativity.deaths++;
    this.save();
  }

  recordCombination(combo: string): void {
    if (!this.data.creativity.uniqueCombinations.includes(combo)) {
      this.data.creativity.uniqueCombinations.push(combo);
      this.save();
    }
  }

  recordSecret(secretId: string): void {
    if (!this.data.secrets.includes(secretId)) {
      this.data.secrets.push(secretId);
      this.data.creativity.secretsFound++;
      this.save();
    }
  }

  getCreativityStats(): CreativityStats {
    return { ...this.data.creativity };
  }

  // ---- World Memory ----
  addTrustedCreature(creatureId: string): void {
    if (!this.data.memory.trustedCreatures.includes(creatureId)) {
      this.data.memory.trustedCreatures.push(creatureId);
      this.save();
    }
  }

  getUnlockedRegions(): string[] {
    return this.data.memory.unlockedRegions;
  }

  // ---- Settings ----
  getSettings(): SaveData['settings'] {
    return { ...this.data.settings };
  }

  updateSettings(partial: Partial<SaveData['settings']>): void {
    Object.assign(this.data.settings, partial);
    this.save();
  }

  // ---- Reset ----
  resetAll(): void {
    this.data = defaultSave();
    this.save();
  }
}
