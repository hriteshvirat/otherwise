// ============================================================
// OTHERWISE — Settings Scene
// Volume, accessibility, display settings
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
    panel.fillRoundedRect(GAME_WIDTH / 2 - 200, 100, 400, 520, 16);
    panel.lineStyle(1, COLORS.UI_BORDER, 0.5);
    panel.strokeRoundedRect(GAME_WIDTH / 2 - 200, 100, 400, 520, 16);

    // Title
    this.add.text(GAME_WIDTH / 2, 140, 'SETTINGS', {
      fontSize: '24px',
      fontFamily: 'Georgia, serif',
      color: hexToString(COLORS.UI_TEXT),
      letterSpacing: 6,
    }).setOrigin(0.5);

    let y = 200;

    // Volume sliders
    this.createSlider('Master Volume', y, settings.masterVolume, (v) => {
      this.saveManager.updateSettings({ masterVolume: v });
    });
    y += 70;

    this.createSlider('Music Volume', y, settings.musicVolume, (v) => {
      this.saveManager.updateSettings({ musicVolume: v });
    });
    y += 70;

    this.createSlider('SFX Volume', y, settings.sfxVolume, (v) => {
      this.saveManager.updateSettings({ sfxVolume: v });
    });
    y += 80;

    // Toggles
    this.createToggle('Screen Shake', y, settings.screenShake, (v) => {
      this.saveManager.updateSettings({ screenShake: v });
    });
    y += 50;

    this.createToggle('Reduced Motion', y, settings.reducedMotion, (v) => {
      this.saveManager.updateSettings({ reducedMotion: v });
    });
    y += 50;

    this.createToggle('Fullscreen', y, settings.fullscreen, (v) => {
      this.saveManager.updateSettings({ fullscreen: v });
      if (v) {
        this.scale.startFullscreen();
      } else {
        this.scale.stopFullscreen();
      }
    });

    // Close button
    const closeBtn = this.add.text(GAME_WIDTH / 2, 580, '[ CLOSE ]', {
      fontSize: '16px',
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

  private createSlider(
    label: string, y: number, value: number,
    onChange: (v: number) => void
  ): void {
    const cx = GAME_WIDTH / 2;

    this.add.text(cx - 150, y, label, {
      fontSize: '14px',
      fontFamily: '"Segoe UI", Roboto, sans-serif',
      color: hexToString(COLORS.UI_TEXT),
    });

    const sliderBg = this.add.graphics();
    const sliderX = cx - 150;
    const sliderW = 200;
    const sliderY = y + 30;

    sliderBg.fillStyle(COLORS.UI_BG, 0.8);
    sliderBg.fillRoundedRect(sliderX, sliderY, sliderW, 8, 4);

    const fill = this.add.graphics();
    const knob = this.add.circle(sliderX + value * sliderW, sliderY + 4, 10, COLORS.UI_ACCENT)
      .setInteractive({ useHandCursor: true, draggable: true });

    const valueText = this.add.text(cx + 80, y + 22, `${Math.round(value * 100)}%`, {
      fontSize: '13px',
      fontFamily: '"Segoe UI", Roboto, sans-serif',
      color: hexToString(COLORS.UI_TEXT_DIM),
    });

    const updateFill = (v: number) => {
      fill.clear();
      fill.fillStyle(COLORS.UI_ACCENT, 0.8);
      fill.fillRoundedRect(sliderX, sliderY, v * sliderW, 8, 4);
      knob.setPosition(sliderX + v * sliderW, sliderY + 4);
      valueText.setText(`${Math.round(v * 100)}%`);
    };
    updateFill(value);

    // Make the track clickable
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

    this.add.text(cx - 150, y, label, {
      fontSize: '14px',
      fontFamily: '"Segoe UI", Roboto, sans-serif',
      color: hexToString(COLORS.UI_TEXT),
    });

    const toggleBg = this.add.graphics();
    const toggleX = cx + 60;

    const drawToggle = () => {
      toggleBg.clear();
      toggleBg.fillStyle(currentValue ? COLORS.SUCCESS : COLORS.UI_BG, 0.8);
      toggleBg.fillRoundedRect(toggleX, y, 44, 22, 11);
      toggleBg.fillStyle(0xFFFFFF, 0.9);
      toggleBg.fillCircle(toggleX + (currentValue ? 32 : 12), y + 11, 8);
    };
    drawToggle();

    const hitArea = this.add.rectangle(toggleX + 22, y + 11, 44, 22, 0x000000, 0)
      .setInteractive({ useHandCursor: true });

    hitArea.on('pointerdown', () => {
      currentValue = !currentValue;
      drawToggle();
      onChange(currentValue);
    });
  }
}
