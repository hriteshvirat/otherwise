// ============================================================
// OTHERWISE — Settings Scene
// Volume, accessibility, display settings, and progress reset
// ============================================================
import Phaser from 'phaser';
import { SCENES, COLORS, GAME_WIDTH, GAME_HEIGHT } from '../../utils/Constants';
import { hexToString, clamp } from '../../utils/MathUtils';
import { SaveManager } from '../systems/save/SaveManager';

export class SettingsScene extends Phaser.Scene {
  private saveManager!: SaveManager;

  constructor() {
    super({ key: SCENES.SETTINGS });
  }

  create(): void {
    this.saveManager = new SaveManager();
    const settings = this.saveManager.getSettings();

    // Dark overlay
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.7);

    // Panel
    const panel = this.add.graphics();
    panel.fillStyle(COLORS.UI_PANEL, 0.95);
    panel.fillRoundedRect(GAME_WIDTH / 2 - 210, 70, 420, 580, 16);
    panel.lineStyle(1, COLORS.UI_BORDER, 0.5);
    panel.strokeRoundedRect(GAME_WIDTH / 2 - 210, 70, 420, 580, 16);

    // Title
    this.add.text(GAME_WIDTH / 2, 105, 'SETTINGS', {
      fontSize: '24px',
      fontFamily: 'Georgia, serif',
      color: hexToString(COLORS.UI_TEXT),
      letterSpacing: 6,
    }).setOrigin(0.5);

    let y = 150;

    // Volume sliders
    this.createSlider('Master Volume', y, settings.masterVolume, (v) => {
      this.saveManager.updateSettings({ masterVolume: v });
    });
    y += 65;

    this.createSlider('Music Volume', y, settings.musicVolume, (v) => {
      this.saveManager.updateSettings({ musicVolume: v });
    });
    y += 65;

    this.createSlider('SFX Volume', y, settings.sfxVolume, (v) => {
      this.saveManager.updateSettings({ sfxVolume: v });
    });
    y += 70;

    // Accessibility Toggles
    this.createToggle('Screen Shake', y, settings.screenShake, (v) => {
      this.saveManager.updateSettings({ screenShake: v });
    });
    y += 45;

    this.createToggle('Reduced Motion', y, settings.reducedMotion, (v) => {
      this.saveManager.updateSettings({ reducedMotion: v });
    });
    y += 45;

    this.createToggle('Fullscreen', y, settings.fullscreen, (v) => {
      this.saveManager.updateSettings({ fullscreen: v });
      if (v) {
        this.scale.startFullscreen();
      } else {
        this.scale.stopFullscreen();
      }
    });
    y += 55;

    // Reset Progress Button
    const resetBtn = this.add.text(GAME_WIDTH / 2, y, '[ RESET ALL PROGRESS ]', {
      fontSize: '12px',
      fontFamily: 'Georgia, serif',
      color: '#FF6666',
      letterSpacing: 2,
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    resetBtn.on('pointerdown', () => this.confirmReset());

    // Close button
    const closeBtn = this.add.text(GAME_WIDTH / 2, 615, '[ CLOSE ]', {
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

  private confirmReset(): void {
    const dialogBg = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, 360, 160, 0x1A1425, 0.98);
    const border = this.add.graphics();
    border.lineStyle(2, 0xFF4444, 0.8);
    border.strokeRoundedRect(GAME_WIDTH / 2 - 180, GAME_HEIGHT / 2 - 80, 360, 160, 12);

    const txt = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 35, 'Are you sure you want to\nerase all progress & concepts?', {
      fontSize: '13px',
      fontFamily: 'Georgia, serif',
      color: hexToString(COLORS.UI_TEXT),
      align: 'center',
    }).setOrigin(0.5);

    const yesBtn = this.add.text(GAME_WIDTH / 2 - 60, GAME_HEIGHT / 2 + 30, 'YES, ERASE', {
      fontSize: '12px',
      fontFamily: 'Georgia, serif',
      color: '#FF4444',
      fontStyle: 'bold',
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    const noBtn = this.add.text(GAME_WIDTH / 2 + 60, GAME_HEIGHT / 2 + 30, 'CANCEL', {
      fontSize: '12px',
      fontFamily: 'Georgia, serif',
      color: hexToString(COLORS.UI_TEXT),
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    yesBtn.on('pointerdown', () => {
      this.saveManager.resetAll();
      dialogBg.destroy();
      border.destroy();
      txt.destroy();
      yesBtn.destroy();
      noBtn.destroy();
      this.scene.stop();
      this.scene.start(SCENES.MAIN_MENU);
    });

    noBtn.on('pointerdown', () => {
      dialogBg.destroy();
      border.destroy();
      txt.destroy();
      yesBtn.destroy();
      noBtn.destroy();
    });
  }

  private createSlider(
    label: string, y: number, value: number,
    onChange: (v: number) => void
  ): void {
    const cx = GAME_WIDTH / 2;

    this.add.text(cx - 160, y, label, {
      fontSize: '13px',
      fontFamily: '"Segoe UI", Roboto, sans-serif',
      color: hexToString(COLORS.UI_TEXT),
    });

    const sliderBg = this.add.graphics();
    const sliderX = cx - 160;
    const sliderW = 220;
    const sliderY = y + 26;

    sliderBg.fillStyle(COLORS.UI_BG, 0.8);
    sliderBg.fillRoundedRect(sliderX, sliderY, sliderW, 8, 4);

    const fill = this.add.graphics();
    const knob = this.add.circle(sliderX + value * sliderW, sliderY + 4, 9, COLORS.UI_ACCENT)
      .setInteractive({ useHandCursor: true, draggable: true });

    const valueText = this.add.text(cx + 80, y + 20, `${Math.round(value * 100)}%`, {
      fontSize: '12px',
      fontFamily: '"Segoe UI", Roboto, sans-serif',
      color: hexToString(COLORS.UI_TEXT_DIM),
    });

    const updateFill = (v: number) => {
      fill.clear();
      fill.fillStyle(COLORS.UI_ACCENT, 0.85);
      fill.fillRoundedRect(sliderX, sliderY, v * sliderW, 8, 4);
      knob.setPosition(sliderX + v * sliderW, sliderY + 4);
      valueText.setText(`${Math.round(v * 100)}%`);
    };
    updateFill(value);

    const hitArea = this.add.rectangle(sliderX + sliderW / 2, sliderY + 4, sliderW, 24, 0x000000, 0)
      .setInteractive({ useHandCursor: true });

    hitArea.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      const v = clamp((pointer.x - sliderX) / sliderW, 0, 1);
      updateFill(v);
      onChange(v);
    });

    knob.on('drag', (pointer: Phaser.Input.Pointer) => {
      const v = clamp((pointer.x - sliderX) / sliderW, 0, 1);
      updateFill(v);
      onChange(v);
    });
  }

  private createToggle(
    label: string, y: number, value: boolean,
    onChange: (v: boolean) => void
  ): void {
    const cx = GAME_WIDTH / 2;
    let currentValue = value;

    this.add.text(cx - 160, y, label, {
      fontSize: '13px',
      fontFamily: '"Segoe UI", Roboto, sans-serif',
      color: hexToString(COLORS.UI_TEXT),
    });

    const toggleBg = this.add.graphics();
    const toggleX = cx + 70;

    const drawToggle = () => {
      toggleBg.clear();
      toggleBg.fillStyle(currentValue ? COLORS.SUCCESS : COLORS.UI_BG, 0.85);
      toggleBg.fillRoundedRect(toggleX, y, 40, 20, 10);
      toggleBg.fillStyle(0xFFFFFF, 0.95);
      toggleBg.fillCircle(toggleX + (currentValue ? 30 : 10), y + 10, 7);
    };
    drawToggle();

    const hitArea = this.add.rectangle(toggleX + 20, y + 10, 40, 20, 0x000000, 0)
      .setInteractive({ useHandCursor: true });

    hitArea.on('pointerdown', () => {
      currentValue = !currentValue;
      drawToggle();
      onChange(currentValue);
    });
  }
}
