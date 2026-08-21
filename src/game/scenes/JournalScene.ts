// ============================================================
// OTHERWISE — Journal Scene
// Concept journal with discoveries
// ============================================================
import Phaser from 'phaser';
import { SCENES, COLORS, GAME_WIDTH, GAME_HEIGHT } from '../../utils/Constants';
import { hexToString } from '../../utils/MathUtils';
import { ALL_CONCEPTS, ConceptDefinition } from '../data/ConceptData';
import { SaveManager } from '../systems/save/SaveManager';

export class JournalScene extends Phaser.Scene {
  private saveManager!: SaveManager;

  constructor() {
    super({ key: SCENES.JOURNAL });
  }

  create(): void {
    this.saveManager = new SaveManager();

    // Dark overlay
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.7);

    // Panel (book-like)
    const panel = this.add.graphics();
    panel.fillStyle(COLORS.UI_PANEL, 0.95);
    panel.fillRoundedRect(GAME_WIDTH / 2 - 280, 80, 560, 560, 16);
    panel.lineStyle(1, COLORS.UI_BORDER, 0.5);
    panel.strokeRoundedRect(GAME_WIDTH / 2 - 280, 80, 560, 560, 16);

    // Spine line
    panel.lineStyle(2, COLORS.UI_BORDER, 0.3);
    panel.lineBetween(GAME_WIDTH / 2, 100, GAME_WIDTH / 2, 620);

    // Title
    this.add.text(GAME_WIDTH / 2, 115, 'CONCEPT JOURNAL', {
      fontSize: '20px',
      fontFamily: 'Georgia, serif',
      color: hexToString(COLORS.UI_TEXT),
      letterSpacing: 4,
    }).setOrigin(0.5);

    this.add.text(GAME_WIDTH / 2, 140, 'What I have learned about the world', {
      fontSize: '12px',
      fontFamily: 'Georgia, serif',
      color: hexToString(COLORS.UI_TEXT_DIM),
      fontStyle: 'italic',
    }).setOrigin(0.5);

    // Discovered concepts
    const discovered = this.saveManager.getDiscoveredConcepts();
    const discoveries = this.saveManager.getDiscoveries();

    if (discovered.length === 0) {
      this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'No concepts discovered yet.\n\nExplore the world to learn.', {
        fontSize: '14px',
        fontFamily: 'Georgia, serif',
        color: hexToString(COLORS.UI_TEXT_DIM),
        align: 'center',
      }).setOrigin(0.5);
    } else {
      let y = 180;
      discovered.forEach((conceptId, i) => {
        const concept = ALL_CONCEPTS[conceptId];
        if (!concept) return;

        const x = i % 2 === 0 ? GAME_WIDTH / 2 - 240 : GAME_WIDTH / 2 + 20;
        if (i > 0 && i % 2 === 0) y += 180;

        this.drawConceptEntry(concept, x, y, discoveries);
      });
    }

    // Undiscovered hints
    const undiscovered = Object.keys(ALL_CONCEPTS).filter(id => !discovered.includes(id));
    if (undiscovered.length > 0) {
      const hintY = 540;
      this.add.text(GAME_WIDTH / 2, hintY, `${undiscovered.length} concept${undiscovered.length > 1 ? 's' : ''} yet to discover...`, {
        fontSize: '12px',
        fontFamily: 'Georgia, serif',
        color: hexToString(COLORS.UI_TEXT_DIM),
        fontStyle: 'italic',
      }).setOrigin(0.5);
    }

    // Close button
    const closeBtn = this.add.text(GAME_WIDTH / 2, 610, '[ CLOSE ]', {
      fontSize: '14px',
      fontFamily: 'Georgia, serif',
      color: hexToString(COLORS.UI_ACCENT),
      letterSpacing: 3,
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    closeBtn.on('pointerover', () => closeBtn.setColor(hexToString(COLORS.UI_TEXT)));
    closeBtn.on('pointerout', () => closeBtn.setColor(hexToString(COLORS.UI_ACCENT)));
    closeBtn.on('pointerdown', () => this.scene.stop());

    if (this.input.keyboard) {
      this.input.keyboard.on('keydown-ESC', () => this.scene.stop());
    }
  }

  private drawConceptEntry(concept: ConceptDefinition, x: number, y: number, discoveries: string[]): void {
    // Icon
    this.add.image(x + 16, y + 16, concept.icon).setScale(1.2);

    // Name
    this.add.text(x + 36, y + 4, concept.name, {
      fontSize: '18px',
      fontFamily: 'Georgia, serif',
      color: hexToString(concept.visualStyle.glowColor),
      letterSpacing: 3,
    });

    // Separator
    const sep = this.add.graphics();
    sep.lineStyle(1, concept.visualStyle.glowColor, 0.3);
    sep.lineBetween(x, y + 32, x + 230, y + 32);

    // Description
    this.add.text(x, y + 40, `"${concept.journalHint}"`, {
      fontSize: '11px',
      fontFamily: 'Georgia, serif',
      color: hexToString(COLORS.UI_TEXT),
      wordWrap: { width: 230 },
      fontStyle: 'italic',
      lineSpacing: 4,
    });

    // Observed behaviors
    this.add.text(x, y + 100, 'Observed:', {
      fontSize: '10px',
      fontFamily: '"Segoe UI", Roboto, sans-serif',
      color: hexToString(COLORS.UI_TEXT_DIM),
      letterSpacing: 1,
    });

    const observations = this.getObservations(concept.id, discoveries);
    let obsY = y + 116;
    observations.forEach(obs => {
      this.add.text(x + 8, obsY, `· ${obs}`, {
        fontSize: '10px',
        fontFamily: '"Segoe UI", Roboto, sans-serif',
        color: obs === '???' ? hexToString(COLORS.UI_TEXT_DIM) : hexToString(COLORS.UI_TEXT),
      });
      obsY += 14;
    });
  }

  private getObservations(conceptId: string, discoveries: string[]): string[] {
    const obs: string[] = [];

    switch (conceptId) {
      case 'fear':
        obs.push(discoveries.includes('fear_rock') ? 'Rocks flee from danger' : '???');
        obs.push(discoveries.includes('fear_creature') ? 'Creatures hide from threats' : '???');
        obs.push(discoveries.includes('fear_player') ? 'Some things fear me' : '???');
        break;
      case 'lonely':
        obs.push(discoveries.includes('lonely_rock') ? 'Rocks seek other rocks' : '???');
        obs.push(discoveries.includes('lonely_bridge') ? 'Bridges seek companions' : '???');
        obs.push(discoveries.includes('lonely_creature') ? 'Creatures seek friends' : '???');
        break;
      case 'curious':
        obs.push(discoveries.includes('curious_creature') ? 'Creatures chase interesting things' : '???');
        obs.push(discoveries.includes('curious_rock') ? 'Rocks investigate movement' : '???');
        obs.push(discoveries.includes('curious_player') ? 'Some things follow me' : '???');
        break;
      default:
        obs.push('???');
    }

    return obs;
  }
}
