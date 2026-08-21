// ============================================================
// OTHERWISE — Preload Scene
// Show a pretty loading screen while assets initialize
// ============================================================
import Phaser from 'phaser';
import { SCENES, COLORS, GAME_WIDTH, GAME_HEIGHT } from '../../utils/Constants';

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super({ key: SCENES.PRELOAD });
  }

  create(): void {
    // Atmospheric gradient background
    const bg = this.add.graphics();
    for (let y = 0; y < GAME_HEIGHT; y++) {
      const t = y / GAME_HEIGHT;
      const r = Math.floor(0x2D + (0xE8 - 0x2D) * t);
      const g = Math.floor(0x1B + (0xA8 - 0x1B) * t);
      const b = Math.floor(0x69 + (0x7C - 0x69) * t);
      bg.fillStyle((r << 16) | (g << 8) | b);
      bg.fillRect(0, y, GAME_WIDTH, 1);
    }

    // Title
    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 40, 'OTHERWISE', {
      fontSize: '32px',
      fontFamily: 'Georgia, serif',
      color: '#F5E6D3',
      letterSpacing: 8,
    }).setOrigin(0.5);

    // Loading text
    const loadText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 20, 'preparing the world...', {
      fontSize: '16px',
      fontFamily: 'Georgia, serif',
      color: '#8B7B6B',
    }).setOrigin(0.5);

    // Fade the text in and out
    this.tweens.add({
      targets: loadText,
      alpha: { from: 0.4, to: 1 },
      duration: 800,
      yoyo: true,
      repeat: -1,
    });

    // Transition to main menu after a brief moment
    this.time.delayedCall(1200, () => {
      this.cameras.main.fadeOut(600, 0x1A, 0x14, 0x25);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start(SCENES.MAIN_MENU);
      });
    });
  }
}
