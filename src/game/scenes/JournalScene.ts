// ============================================================
// OTHERWISE — Journal Scene
// Storybook Concept Journal displaying all discovered concepts & observations
// ============================================================
import Phaser from 'phaser';
import { SCENES, COLORS, GAME_WIDTH, GAME_HEIGHT } from '../../utils/Constants';
import { hexToString } from '../../utils/MathUtils';
import { ALL_CONCEPTS, ConceptDefinition } from '../data/ConceptData';
import { SaveManager } from '../systems/save/SaveManager';

export class JournalScene extends Phaser.Scene {
  private saveManager!: SaveManager;
  private currentPage = 0;
  private entriesPerPage = 2;

  constructor() {
    super({ key: SCENES.JOURNAL });
  }

  create(): void {
    this.saveManager = new SaveManager();
    this.currentPage = 0;
    this.drawJournal();
  }

  private drawJournal(): void {
    this.children.removeAll();

    // Dark overlay
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.7);

    // Book panel
    const panel = this.add.graphics();
    panel.fillStyle(COLORS.UI_PANEL, 0.95);
    panel.fillRoundedRect(GAME_WIDTH / 2 - 300, 70, 600, 580, 16);
    panel.lineStyle(1, COLORS.UI_BORDER, 0.5);
    panel.strokeRoundedRect(GAME_WIDTH / 2 - 300, 70, 600, 580, 16);

    // Spine line
    panel.lineStyle(2, COLORS.UI_BORDER, 0.3);
    panel.lineBetween(GAME_WIDTH / 2, 90, GAME_WIDTH / 2, 600);

    // Title
    this.add.text(GAME_WIDTH / 2, 105, 'CONCEPT JOURNAL', {
      fontSize: '20px',
      fontFamily: 'Georgia, serif',
      color: hexToString(COLORS.UI_TEXT),
      letterSpacing: 4,
    }).setOrigin(0.5);

    this.add.text(GAME_WIDTH / 2, 130, 'Observations on the Nature of Intent', {
      fontSize: '12px',
      fontFamily: 'Georgia, serif',
      color: hexToString(COLORS.UI_TEXT_DIM),
      fontStyle: 'italic',
    }).setOrigin(0.5);

    const discovered = this.saveManager.getDiscoveredConcepts();
    const discoveries = this.saveManager.getDiscoveries();

    if (discovered.length === 0) {
      this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'No concepts discovered yet.\n\nExplore the world to learn what things want.', {
        fontSize: '14px',
        fontFamily: 'Georgia, serif',
        color: hexToString(COLORS.UI_TEXT_DIM),
        align: 'center',
      }).setOrigin(0.5);
    } else {
      const startIdx = this.currentPage * this.entriesPerPage;
      const pageEntries = discovered.slice(startIdx, startIdx + this.entriesPerPage);

      pageEntries.forEach((conceptId, i) => {
        const concept = ALL_CONCEPTS[conceptId];
        if (!concept) return;

        const x = i === 0 ? GAME_WIDTH / 2 - 270 : GAME_WIDTH / 2 + 30;
        const y = 175;
        this.drawConceptEntry(concept, x, y, discoveries);
      });

      // Pagination controls
      const maxPages = Math.ceil(discovered.length / this.entriesPerPage);
      if (maxPages > 1) {
        this.add.text(GAME_WIDTH / 2, 575, `Page ${this.currentPage + 1} of ${maxPages}`, {
          fontSize: '12px',
          fontFamily: '"Segoe UI", Roboto, sans-serif',
          color: hexToString(COLORS.UI_TEXT_DIM),
        }).setOrigin(0.5);

        if (this.currentPage > 0) {
          const prevBtn = this.add.text(GAME_WIDTH / 2 - 80, 575, '◀ PREV', {
            fontSize: '12px',
            fontFamily: 'Georgia, serif',
            color: hexToString(COLORS.UI_ACCENT),
          }).setOrigin(0.5).setInteractive({ useHandCursor: true });
          prevBtn.on('pointerdown', () => {
            this.currentPage--;
            this.drawJournal();
          });
        }

        if (this.currentPage < maxPages - 1) {
          const nextBtn = this.add.text(GAME_WIDTH / 2 + 80, 575, 'NEXT ▶', {
            fontSize: '12px',
            fontFamily: 'Georgia, serif',
            color: hexToString(COLORS.UI_ACCENT),
          }).setOrigin(0.5).setInteractive({ useHandCursor: true });
          nextBtn.on('pointerdown', () => {
            this.currentPage++;
            this.drawJournal();
          });
        }
      }
    }

    // Close button
    const closeBtn = this.add.text(GAME_WIDTH / 2, 615, '[ CLOSE JOURNAL ]', {
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
    this.add.image(x + 16, y + 16, concept.icon).setScale(1.3);

    this.add.text(x + 38, y + 4, concept.name, {
      fontSize: '18px',
      fontFamily: 'Georgia, serif',
      color: hexToString(concept.visualStyle.glowColor),
      letterSpacing: 3,
      fontStyle: 'bold',
    });

    const sep = this.add.graphics();
    sep.lineStyle(1, concept.visualStyle.glowColor, 0.3);
    sep.lineBetween(x, y + 36, x + 240, y + 36);

    this.add.text(x, y + 48, `"${concept.journalHint}"`, {
      fontSize: '11px',
      fontFamily: 'Georgia, serif',
      color: hexToString(COLORS.UI_TEXT),
      wordWrap: { width: 240 },
      fontStyle: 'italic',
      lineSpacing: 4,
    });

    this.add.text(x, y + 140, 'Observed Behaviors:', {
      fontSize: '11px',
      fontFamily: '"Segoe UI", Roboto, sans-serif',
      color: hexToString(COLORS.UI_TEXT_DIM),
      letterSpacing: 1,
    });

    const observations = this.getObservations(concept.id, discoveries);
    let obsY = y + 162;
    observations.forEach(obs => {
      this.add.text(x + 8, obsY, `· ${obs}`, {
        fontSize: '10px',
        fontFamily: '"Segoe UI", Roboto, sans-serif',
        color: obs === '???' ? hexToString(COLORS.UI_TEXT_DIM) : hexToString(COLORS.UI_TEXT),
        wordWrap: { width: 230 },
      });
      obsY += 20;
    });
  }

  private getObservations(conceptId: string, discoveries: string[]): string[] {
    const obs: string[] = [];

    switch (conceptId) {
      case 'fear':
        obs.push(discoveries.includes('fear_rock') ? 'Rocks flee from threat vectors' : '???');
        obs.push(discoveries.includes('fear_door') ? 'Doors flee and open passages' : '???');
        obs.push(discoveries.includes('fear_player') ? 'Entities perceive me as danger' : '???');
        break;
      case 'lonely':
        obs.push(discoveries.includes('lonely_rock') ? 'Rocks aggregate into steps' : '???');
        obs.push(discoveries.includes('lonely_bridge') ? 'Bridges seek companions' : '???');
        obs.push(discoveries.includes('lonely_creature') ? 'Creatures seek friends' : '???');
        break;
      case 'curious':
        obs.push(discoveries.includes('curious_creature') ? 'Creatures investigate novelty' : '???');
        obs.push(discoveries.includes('curious_rock') ? 'Rocks roll toward movement' : '???');
        obs.push(discoveries.includes('curious_player') ? 'Beasts shadow my trail' : '???');
        break;
      case 'trust':
        obs.push(discoveries.includes('trust_creature') ? 'Creatures walk faithfully beside me' : '???');
        obs.push(discoveries.includes('trust_player') ? 'Stands beside me across hazards' : '???');
        break;
      case 'greedy':
        obs.push(discoveries.includes('greedy_machine') ? 'Automatons eagerly hoard shiny gears' : '???');
        obs.push(discoveries.includes('greedy_creature') ? 'Creatures chase golden orbs' : '???');
        break;
      case 'protective':
        obs.push(discoveries.includes('protective_rock') ? 'Rocks shield allies from peril' : '???');
        obs.push(discoveries.includes('protective_creature') ? 'Creatures body-block threats' : '???');
        break;
      case 'stubborn':
        obs.push(discoveries.includes('stubborn_rock') ? 'Stones refuse all displacement' : '???');
        obs.push(discoveries.includes('stubborn_platform') ? 'Platforms lock firmly into place' : '???');
        break;
      case 'imitate':
        obs.push(discoveries.includes('imitate_machine') ? 'Automatons mirror my movements' : '???');
        obs.push(discoveries.includes('imitate_creature') ? 'Creatures mirror velocity' : '???');
        break;
      case 'hungry':
        obs.push(discoveries.includes('hungry_creature') ? 'Beasts hunt sweet berries' : '???');
        break;
      case 'sleepy':
        obs.push(discoveries.includes('sleepy_creature') ? 'Slumbering beasts act as solid stepping blocks' : '???');
        break;
      case 'jealous':
        obs.push(discoveries.includes('jealous_creature') ? 'Rivals sprint to contest prizes' : '???');
        break;
      case 'follow':
        obs.push(discoveries.includes('follow_platform') ? 'Floating platforms track player' : '???');
        break;
      case 'repeat':
        obs.push(discoveries.includes('repeat_platform') ? 'Mechanical platforms oscillate as ferries' : '???');
        break;
      default:
        obs.push('???');
    }

    return obs;
  }
}
