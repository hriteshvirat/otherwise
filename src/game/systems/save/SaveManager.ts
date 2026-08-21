// ============================================================
// OTHERWISE — Save Manager
// Versioned localStorage persistence
// ============================================================

const SAVE_KEY = 'otherwise_save';
const SAVE_VERSION = 1;

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
  discoveries: string[]; // Journal observation IDs
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

  /** Load save from localStorage, or create default */
  private load(): SaveData {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return defaultSave();

      const parsed = JSON.parse(raw) as SaveData;

      // Version migration
      if (parsed.version !== SAVE_VERSION) {
        // For now, just use defaults for any version mismatch
        // In Phase 2+, implement actual migrations
        return defaultSave();
      }

      return parsed;
    } catch {
      return defaultSave();
    }
  }

  /** Save current state to localStorage */
  save(): void {
    this.data.timestamp = Date.now();
    localStorage.setItem(SAVE_KEY, JSON.stringify(this.data));
  }

  /** Get save data */
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
    this.data.progress.currentLevel = level + 1;
    this.save();
  }

  isLevelCompleted(level: number): boolean {
    return this.data.progress.completedLevels.includes(level);
  }

  getCurrentLevel(): number {
    return this.data.progress.currentLevel;
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

  // ---- Discoveries (Journal) ----
  addDiscovery(discoveryId: string): void {
    if (!this.data.discoveries.includes(discoveryId)) {
      this.data.discoveries.push(discoveryId);
      this.save();
    }
  }

  hasDiscovery(discoveryId: string): boolean {
    return this.data.discoveries.includes(discoveryId);
  }

  getDiscoveries(): string[] {
    return this.data.discoveries;
  }

  // ---- Settings ----
  getSettings(): SaveData['settings'] {
    return { ...this.data.settings };
  }

  updateSettings(partial: Partial<SaveData['settings']>): void {
    Object.assign(this.data.settings, partial);
    this.save();
  }

  // ---- Secrets ----
  addSecret(secretId: string): void {
    if (!this.data.secrets.includes(secretId)) {
      this.data.secrets.push(secretId);
      this.save();
    }
  }

  // ---- Reset ----
  resetAll(): void {
    this.data = defaultSave();
    this.save();
  }

  resetProgress(): void {
    this.data.progress = defaultSave().progress;
    this.data.concepts = defaultSave().concepts;
    this.data.discoveries = [];
    this.save();
  }
}
