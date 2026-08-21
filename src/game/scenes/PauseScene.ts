// ============================================================
// OTHERWISE — Pause Scene
// Comprehensive In-Game Menu (Resume, Restart, World Map, Journal, Archive, Settings, Menu)
// ============================================================
import Phaser from 'phaser';
import { SCENES, COLORS, GAME_WIDTH, GAME_HEIGHT } from '../../utils/Constants';
import { hexToString } from '../../utils/MathUtils';

export class PauseScene extends Phaser.Scene {
  constructor() {
    super({ key: SCENES.PAUSE });
  }

  create(): void {
    // Dark overlay
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.65)
      .setDepth(0);

    // Panel
    const panel = this.add.graphics().setDepth(1);
    panel.fillStyle(COLORS.UI_PANEL, 0.95);
    panel.fillRoundedRect(GAME_WIDTH / 2 - 170, 90, 340, 540, 16);
    panel.lineStyle(1, COLORS.UI_BORDER, 0.5);
    panel.strokeRoundedRect(GAME_WIDTH / 2 - 170, 90, 340, 540, 16);

    // Title
    this.add.text(GAME_WIDTH / 2, 130, 'PAUSED', {
      fontSize: '26px',
      fontFamily: 'Georgia, serif',
      color: hexToString(COLORS.UI_TEXT),
      letterSpacing: 6,
    }).setOrigin(0.5).setDepth(2);

    // Buttons
    const buttons = [
      { label: 'RESUME', action: () => this.resumeGame() },
      { label: 'RESTART LEVEL', action: () => this.restartLevel() },
      { label: 'WORLD MAP', action: () => this.toWorldMap() },
      { label: 'CONCEPT JOURNAL', action: () => this.openJournal() },
      { label: 'CREATIVE ARCHIVE', action: () => this.openArchive() },
      { label: 'SETTINGS', action: () => this.openSettings() },
      { label: 'MAIN MENU', action: () => this.toMainMenu() },
    ];

    let selectedIndex = 0;
    const btnObjects: { bg: Phaser.GameObjects.Image; text: Phaser.GameObjects.Text }[] = [];

    buttons.forEach((btn, i) => {
      const y = 195 + i * 54;
      const bg = this.add.image(GAME_WIDTH / 2, y, 'ui_button')
        .setDepth(2)
        .setInteractive({ useHandCursor: true });
      const text = this.add.text(GAME_WIDTH / 2, y, btn.label, {
        fontSize: '14px',
        fontFamily: 'Georgia, serif',
        color: hexToString(COLORS.UI_TEXT),
        letterSpacing: 2,
      }).setOrigin(0.5).setDepth(3);

      bg.on('pointerover', () => {
        selectedIndex = i;
        updateSelection();
      });
      bg.on('pointerdown', () => btn.action());

      btnObjects.push({ bg, text });
    });

    const updateSelection = () => {
      btnObjects.forEach((b, i) => {
        if (i === selectedIndex) {
          b.bg.setTexture('ui_button_hover');
          b.text.setColor(hexToString(COLORS.UI_ACCENT));
        } else {
          b.bg.setTexture('ui_button');
          b.text.setColor(hexToString(COLORS.UI_TEXT));
        }
      });
    };

    updateSelection();

    // Keyboard controls
    if (this.input.keyboard) {
      this.input.keyboard.on('keydown-ESC', () => this.resumeGame());
      this.input.keyboard.on('keydown-UP', () => {
        selectedIndex = (selectedIndex - 1 + buttons.length) % buttons.length;
        updateSelection();
      });
      this.input.keyboard.on('keydown-DOWN', () => {
        selectedIndex = (selectedIndex + 1) % buttons.length;
        updateSelection();
      });
      this.input.keyboard.on('keydown-ENTER', () => buttons[selectedIndex].action());
    }
  }

  private resumeGame(): void {
    this.scene.resume(SCENES.GAME);
    this.scene.stop();
  }

  private restartLevel(): void {
    this.scene.stop();
    const gameScene = this.scene.get(SCENES.GAME);
    if (gameScene) {
      (gameScene as any).audioManager?.stopMusic();
      gameScene.scene.restart();
    }
  }

  private toWorldMap(): void {
    const gameScene = this.scene.get(SCENES.GAME);
    if (gameScene) {
      (gameScene as any).audioManager?.stopMusic();
    }
    this.scene.stop(SCENES.GAME);
    this.scene.start(SCENES.WORLD_MAP);
  }

  private openJournal(): void {
    this.scene.launch(SCENES.JOURNAL);
  }

  private openArchive(): void {
    this.scene.launch(SCENES.CREATIVE_ARCHIVE);
  }

  private openSettings(): void {
    this.scene.launch(SCENES.SETTINGS);
  }

  private toMainMenu(): void {
    const gameScene = this.scene.get(SCENES.GAME);
    if (gameScene) {
      (gameScene as any).audioManager?.stopMusic();
    }
    this.scene.stop(SCENES.GAME);
    this.scene.start(SCENES.MAIN_MENU);
  }
}
