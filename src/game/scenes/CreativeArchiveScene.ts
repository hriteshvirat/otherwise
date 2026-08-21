// ============================================================
// OTHERWISE — Creative Archive Scene
// Displays the Player's Creativity Profile, Archetype, and Achievement Logs
// ============================================================
import Phaser from 'phaser';
import { SCENES, COLORS, GAME_WIDTH, GAME_HEIGHT } from '../../utils/Constants';
import { hexToString } from '../../utils/MathUtils';
import { SaveManager } from '../systems/save/SaveManager';
import { CreativityProfiler } from '../systems/profiler/CreativityProfiler';

export class CreativeArchiveScene extends Phaser.Scene {
  private saveManager!: SaveManager;

  constructor() {
    super({ key: SCENES.CREATIVE_ARCHIVE });
  }

  create(): void {
    this.saveManager = new SaveManager();
    const save = this.saveManager.getData();
    const profile = CreativityProfiler.calculateProfile(save);

    // Dark backdrop
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.75);

    // Archive frame
    const panel = this.add.graphics();
    panel.fillStyle(COLORS.UI_PANEL, 0.95);
    panel.fillRoundedRect(GAME_WIDTH / 2 - 320, 50, 640, 620, 16);
    panel.lineStyle(1, COLORS.UI_BORDER, 0.6);
    panel.strokeRoundedRect(GAME_WIDTH / 2 - 320, 50, 640, 620, 16);

    // Title
    this.add.text(GAME_WIDTH / 2, 85, 'CREATIVE ARCHIVE', {
      fontSize: '22px',
      fontFamily: 'Georgia, serif',
      color: hexToString(COLORS.UI_TEXT),
      letterSpacing: 4,
    }).setOrigin(0.5);

    // Archetype Title Badge
    const badge = this.add.graphics();
    badge.fillStyle(COLORS.UI_BG, 0.8);
    badge.fillRoundedRect(GAME_WIDTH / 2 - 200, 115, 400, 75, 12);
    badge.lineStyle(1.5, COLORS.DISCOVERY, 0.7);
    badge.strokeRoundedRect(GAME_WIDTH / 2 - 200, 115, 400, 75, 12);

    this.add.text(GAME_WIDTH / 2, 138, profile.title, {
      fontSize: '20px',
      fontFamily: 'Georgia, serif',
      color: hexToString(COLORS.DISCOVERY),
      fontStyle: 'bold',
      letterSpacing: 3,
    }).setOrigin(0.5);

    this.add.text(GAME_WIDTH / 2, 165, `"${profile.tagline}"`, {
      fontSize: '12px',
      fontFamily: 'Georgia, serif',
      color: hexToString(COLORS.UI_TEXT_DIM),
      fontStyle: 'italic',
    }).setOrigin(0.5);

    // Description
    this.add.text(GAME_WIDTH / 2, 215, profile.description, {
      fontSize: '13px',
      fontFamily: '"Segoe UI", Roboto, sans-serif',
      color: hexToString(COLORS.UI_TEXT),
      wordWrap: { width: 560 },
      align: 'center',
      lineSpacing: 4,
    }).setOrigin(0.5);

    // 6 Dimensions Bar Graphs
    const dimY = 270;
    const dims = [
      { name: 'Experimentation', val: profile.dimensions.experimentation },
      { name: 'Exploration', val: profile.dimensions.exploration },
      { name: 'Systemic Thinking', val: profile.dimensions.systemicThinking },
      { name: 'Risk Taking', val: profile.dimensions.riskTaking },
      { name: 'Persistence', val: profile.dimensions.persistence },
      { name: 'Novelty', val: profile.dimensions.novelty },
    ];

    dims.forEach((d, i) => {
      const row = Math.floor(i / 2);
      const col = i % 2;
      const x = col === 0 ? GAME_WIDTH / 2 - 270 : GAME_WIDTH / 2 + 20;
      const y = dimY + row * 45;

      this.add.text(x, y, d.name, {
        fontSize: '12px',
        fontFamily: '"Segoe UI", Roboto, sans-serif',
        color: hexToString(COLORS.UI_TEXT_DIM),
      });

      this.add.text(x + 200, y, `${d.val}%`, {
        fontSize: '12px',
        fontFamily: '"Segoe UI", Roboto, sans-serif',
        color: hexToString(COLORS.UI_TEXT),
        fontStyle: 'bold',
      });

      // Track bar
      const barGfx = this.add.graphics();
      barGfx.fillStyle(COLORS.UI_BG, 0.9);
      barGfx.fillRoundedRect(x, y + 18, 220, 8, 4);

      // Fill bar
      barGfx.fillStyle(COLORS.UI_ACCENT, 0.85);
      barGfx.fillRoundedRect(x, y + 18, (d.val / 100) * 220, 8, 4);
    });

    // Milestone stats at bottom
    const statsY = 440;
    const statBox = this.add.graphics();
    statBox.fillStyle(COLORS.UI_BG, 0.6);
    statBox.fillRoundedRect(GAME_WIDTH / 2 - 280, statsY, 560, 130, 10);

    this.add.text(GAME_WIDTH / 2 - 260, statsY + 15, 'JOURNEY MILESTONES', {
      fontSize: '13px',
      fontFamily: 'Georgia, serif',
      color: hexToString(COLORS.UI_ACCENT),
      letterSpacing: 2,
    });

    const milestones = [
      `· Concepts Discovered: ${save.concepts.discovered.length} / 13`,
      `· Levels Completed: ${save.progress.completedLevels.length} / 16`,
      `· Emergent Observations: ${save.discoveries.length}`,
      `· Secret Alcoves Found: ${save.secrets.length} / 3`,
      `· Total Concepts Cast: ${save.creativity.conceptsApplied}`,
      `· Overall Mastery: ${profile.masteryScore}%`,
    ];

    milestones.forEach((m, idx) => {
      const col = idx % 2;
      const row = Math.floor(idx / 2);
      const mx = col === 0 ? GAME_WIDTH / 2 - 250 : GAME_WIDTH / 2 + 20;
      const my = statsY + 42 + row * 26;

      this.add.text(mx, my, m, {
        fontSize: '12px',
        fontFamily: '"Segoe UI", Roboto, sans-serif',
        color: hexToString(COLORS.UI_TEXT),
      });
    });

    // Close button
    const closeBtn = this.add.text(GAME_WIDTH / 2, 620, '[ CLOSE ARCHIVE ]', {
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
}
