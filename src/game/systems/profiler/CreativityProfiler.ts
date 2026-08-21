// ============================================================
// OTHERWISE — Creativity Profiler
// Calculates player's emergent creative archetype from gameplay stats (7 Archetypes)
// ============================================================
import { SaveData } from '../save/SaveManager';

export interface PlayerProfile {
  title: string;
  tagline: string;
  description: string;
  dimensions: {
    experimentation: number; // 0 - 100
    exploration: number;
    systemicThinking: number;
    riskTaking: number;
    persistence: number;
    novelty: number;
  };
  masteryScore: number;
}

export class CreativityProfiler {
  public static calculateProfile(save: SaveData): PlayerProfile {
    const stats = save.creativity;
    const completedCount = save.progress.completedLevels.length;
    const conceptsCount = save.concepts.discovered.length;
    const discoveriesCount = save.discoveries.length;
    const secretsCount = save.secrets.length;

    // Dimension scoring (normalized 0-100)
    const experimentation = Math.min(100, Math.round((stats.conceptsApplied * 3 + stats.uniqueCombinations.length * 15)));
    const exploration = Math.min(100, Math.round((secretsCount * 25 + discoveriesCount * 6)));
    const systemicThinking = Math.min(100, Math.round((completedCount * 6 + conceptsCount * 4)));
    const riskTaking = Math.min(100, Math.round(Math.min(stats.jumps / 10, 50) + stats.deaths * 4));
    const persistence = Math.min(100, Math.round((stats.deaths * 8 + completedCount * 4)));
    const novelty = Math.min(100, Math.round((stats.uniqueCombinations.length * 20 + discoveriesCount * 5)));

    const masteryScore = Math.round(
      (experimentation + exploration + systemicThinking + riskTaking + persistence + novelty) / 6
    );

    // 7 Distinct Archetypes
    let title = 'THE EXPERIMENTER';
    let tagline = 'A curious mind seeking what lies beyond the rules.';
    let description = 'You treat the world as an open laboratory, freely assigning intentions to uncover hidden pathways.';

    if (experimentation >= 60 && systemicThinking >= 60) {
      title = 'THE ENGINEER';
      tagline = 'A master of systems, forging cause and effect.';
      description = 'You see the interconnected machinery of intention and methodically arrange the pieces to build elegant solutions.';
    } else if (exploration >= 60 && secretsCount >= 1) {
      title = 'THE EXPLORER';
      tagline = 'Drawn toward the uncharted corners of the world.';
      description = 'No chasm is too deep and no alcove too obscure. You seek the world’s quietest secrets.';
    } else if (riskTaking >= 60 && novelty >= 50) {
      title = 'THE CHAOTIC';
      tagline = 'Embracing the unpredictable storm of reality.';
      description = 'You thrive in beautiful entropy, casting desires into the world to watch how unexpectedly reality reshapes itself.';
    } else if (riskTaking >= 50 && stats.uniqueCombinations.length >= 2) {
      title = 'THE RULE BREAKER';
      tagline = 'Refusing to solve things the expected way.';
      description = 'You find the loopholes in reality and bend the world’s desires until an entirely new path appears.';
    } else if (discoveriesCount >= 8 && save.memory.trustedCreatures.length >= 1) {
      title = 'THE EMPATH';
      tagline = 'Understanding what the world truly wants.';
      description = 'You listen to the quiet longings of stones, beasts, and doors, bringing harmony where there was once discord.';
    } else if (persistence >= 60) {
      title = 'THE OBSERVER';
      tagline = 'Patient, deliberate, and resolute.';
      description = 'Every failure is simply another lesson in how the world responds to intention.';
    }

    return {
      title,
      tagline,
      description,
      dimensions: {
        experimentation,
        exploration,
        systemicThinking,
        riskTaking,
        persistence,
        novelty,
      },
      masteryScore,
    };
  }
}
