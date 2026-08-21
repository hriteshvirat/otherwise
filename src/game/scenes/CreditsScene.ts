// ============================================================
// OTHERWISE — Credits Scene
// ============================================================
import Phaser from 'phaser';
import { SCENES, COLORS, GAME_WIDTH, GAME_HEIGHT } from '../../utils/Constants';
import { hexToString } from '../../utils/MathUtils';

export class CreditsScene extends Phaser.Scene {
  constructor() {
    super({ key: SCENES.CREDITS });
  }

  create(): void {
    // Dark overlay
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.7);

    // Panel
    const panel = this.add.graphics();
    panel.fillStyle(COLORS.UI_PANEL, 0.95);
    panel.fillRoundedRect(GAME_WIDTH / 2 - 200, 150, 400, 420, 16);
    panel.lineStyle(1, COLORS.UI_BORDER, 0.5);
    panel.strokeRoundedRect(GAME_WIDTH / 2 - 200, 150, 400, 420, 16);

    this.add.text(GAME_WIDTH / 2, 195, 'CREDITS', {
      fontSize: '24px',
      fontFamily: 'Georgia, serif',
      color: hexToString(COLORS.UI_TEXT),
      letterSpacing: 6,
    }).setOrigin(0.5);

    const credits = [
      { role: 'Design & Development', name: 'OTHERWISE Team' },
      { role: 'Built with', name: 'Phaser 3 + TypeScript + Vite' },
      { role: 'Created for', name: 'BTT Web Game Jam, Summer 2026' },
      { role: '', name: '' },
      { role: 'Special Thanks', name: '' },
      { role: '', name: 'The indie game community' },
      { role: '', name: 'Everyone who played and gave feedback' },
    ];

    let y = 260;
    for (const credit of credits) {
      if (credit.role) {
        this.add.text(GAME_WIDTH / 2, y, credit.role, {
          fontSize: '12px',
          fontFamily: '"Segoe UI", Roboto, sans-serif',
          color: hexToString(COLORS.UI_TEXT_DIM),
          letterSpacing: 2,
        }).setOrigin(0.5);
        y += 22;
      }
      if (credit.name) {
        this.add.text(GAME_WIDTH / 2, y, credit.name, {
          fontSize: '16px',
          fontFamily: 'Georgia, serif',
          color: hexToString(COLORS.UI_TEXT),
        }).setOrigin(0.5);
        y += 32;
      } else if (!credit.role) {
        y += 16;
      }
    }

    // Tagline
    this.add.text(GAME_WIDTH / 2, 510, '"There is always another way."', {
      fontSize: '14px',
      fontFamily: 'Georgia, serif',
      color: hexToString(COLORS.UI_ACCENT),
      fontStyle: 'italic',
    }).setOrigin(0.5);

    // Close
    const closeBtn = this.add.text(GAME_WIDTH / 2, 545, '[ CLOSE ]', {
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
