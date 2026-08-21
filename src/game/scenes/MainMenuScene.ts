// ============================================================
// OTHERWISE — Main Menu Scene
// Atmospheric title screen with World Map and Creative Archive navigation
// ============================================================
import Phaser from 'phaser';
import { SCENES, COLORS, GAME_WIDTH, GAME_HEIGHT, DEPTH } from '../../utils/Constants';
import { hexToString } from '../../utils/MathUtils';
import { AudioManager } from '../systems/audio/AudioManager';
import { SaveManager } from '../systems/save/SaveManager';

interface MenuButton {
  bg: Phaser.GameObjects.Image;
  text: Phaser.GameObjects.Text;
  index: number;
}

export class MainMenuScene extends Phaser.Scene {
  private buttons: MenuButton[] = [];
  private selectedIndex = 0;
  private particles!: { x: number; y: number; vx: number; vy: number; size: number; alpha: number; life: number }[];
  private audioManager!: AudioManager;
  private saveManager!: SaveManager;

  constructor() {
    super({ key: SCENES.MAIN_MENU });
  }

  create(): void {
    this.cameras.main.fadeIn(800, 0x1A, 0x14, 0x25);
    this.particles = [];
    this.buttons = [];
    this.selectedIndex = 0;
    this.audioManager = new AudioManager(this);
    this.saveManager = new SaveManager();

    this.drawBackground();
    this.drawTitle();
    this.createButtons();
    this.createParticles();
    this.setupInput();
  }

  private drawBackground(): void {
    const bg = this.add.graphics();

    for (let y = 0; y < GAME_HEIGHT; y++) {
      const t = y / GAME_HEIGHT;
      const r = Math.floor(0x1A + (0x3D - 0x1A) * t * 0.6);
      const g = Math.floor(0x14 + (0x2D - 0x14) * t * 0.6);
      const b = Math.floor(0x25 + (0x50 - 0x25) * t * 0.6);
      bg.fillStyle((r << 16) | (g << 8) | b);
      bg.fillRect(0, y, GAME_WIDTH, 1);
    }
    bg.setDepth(DEPTH.BG_FAR);

    // Distant mountain silhouette
    const mountains = this.add.graphics();
    mountains.fillStyle(COLORS.MOUNTAIN_FAR, 0.3);
    mountains.beginPath();
    mountains.moveTo(0, GAME_HEIGHT);
    mountains.lineTo(0, 520);
    mountains.lineTo(100, 440);
    mountains.lineTo(200, 480);
    mountains.lineTo(350, 380);
    mountains.lineTo(500, 430);
    mountains.lineTo(640, 360);
    mountains.lineTo(800, 410);
    mountains.lineTo(950, 370);
    mountains.lineTo(1100, 420);
    mountains.lineTo(1200, 460);
    mountains.lineTo(GAME_WIDTH, 490);
    mountains.lineTo(GAME_WIDTH, GAME_HEIGHT);
    mountains.closePath();
    mountains.fillPath();
    mountains.setDepth(DEPTH.BG_MID);

    // Closer hills
    const hills = this.add.graphics();
    hills.fillStyle(COLORS.MOUNTAIN_MID, 0.4);
    hills.beginPath();
    hills.moveTo(0, GAME_HEIGHT);
    hills.lineTo(0, 560);
    hills.lineTo(150, 510);
    hills.lineTo(300, 540);
    hills.lineTo(450, 490);
    hills.lineTo(640, 520);
    hills.lineTo(800, 480);
    hills.lineTo(1000, 510);
    hills.lineTo(GAME_WIDTH, 530);
    hills.lineTo(GAME_WIDTH, GAME_HEIGHT);
    hills.closePath();
    hills.fillPath();
    hills.setDepth(DEPTH.BG_MID + 1);

    // Ground line
    const ground = this.add.graphics();
    ground.fillStyle(COLORS.GROUND_DARK, 0.6);
    ground.beginPath();
    ground.moveTo(0, GAME_HEIGHT);
    ground.lineTo(0, 620);
    ground.lineTo(200, 610);
    ground.lineTo(400, 625);
    ground.lineTo(640, 615);
    ground.lineTo(900, 620);
    ground.lineTo(GAME_WIDTH, 610);
    ground.lineTo(GAME_WIDTH, GAME_HEIGHT);
    ground.closePath();
    ground.fillPath();
    ground.setDepth(DEPTH.GROUND);
  }

  private drawTitle(): void {
    const title = this.add.text(GAME_WIDTH / 2, 170, 'OTHERWISE', {
      fontSize: '64px',
      fontFamily: 'Georgia, "Times New Roman", serif',
      color: hexToString(COLORS.UI_TEXT),
      letterSpacing: 16,
    }).setOrigin(0.5).setDepth(DEPTH.UI);

    title.setAlpha(0);
    this.tweens.add({
      targets: title,
      alpha: 1,
      y: 160,
      duration: 1500,
      ease: 'Cubic.easeOut',
    });

    const tagline = this.add.text(GAME_WIDTH / 2, 225, 'There is always another way.', {
      fontSize: '15px',
      fontFamily: 'Georgia, "Times New Roman", serif',
      color: hexToString(COLORS.UI_TEXT_DIM),
      letterSpacing: 5,
    }).setOrigin(0.5).setDepth(DEPTH.UI);

    tagline.setAlpha(0);
    this.tweens.add({
      targets: tagline,
      alpha: 0.85,
      duration: 1800,
      delay: 400,
      ease: 'Sine.easeOut',
    });

    const line = this.add.graphics();
    line.lineStyle(1, COLORS.UI_ACCENT, 0.4);
    line.lineBetween(GAME_WIDTH / 2 - 140, 255, GAME_WIDTH / 2 + 140, 255);
    line.setDepth(DEPTH.UI);
    line.setAlpha(0);
    this.tweens.add({
      targets: line,
      alpha: 1,
      duration: 1200,
      delay: 700,
    });
  }

  private createButtons(): void {
    const labels = ['PLAY', 'WORLD MAP', 'CREATIVE ARCHIVE', 'JOURNAL', 'SETTINGS', 'CREDITS'];
    const actions = [
      () => this.startGame(),
      () => this.scene.start(SCENES.WORLD_MAP),
      () => this.scene.launch(SCENES.CREATIVE_ARCHIVE),
      () => this.scene.launch(SCENES.JOURNAL),
      () => this.scene.launch(SCENES.SETTINGS),
      () => this.scene.launch(SCENES.CREDITS),
    ];
    const startY = 310;
    const spacing = 52;

    labels.forEach((label, i) => {
      const y = startY + i * spacing;

      const bg = this.add.image(GAME_WIDTH / 2, y, 'ui_button')
        .setOrigin(0.5)
        .setDepth(DEPTH.UI)
        .setInteractive({ useHandCursor: true })
        .setAlpha(0);

      const text = this.add.text(GAME_WIDTH / 2, y, label, {
        fontSize: '15px',
        fontFamily: 'Georgia, "Times New Roman", serif',
        color: hexToString(COLORS.UI_TEXT),
        letterSpacing: 3,
      }).setOrigin(0.5).setDepth(DEPTH.UI + 1).setAlpha(0);

      this.tweens.add({
        targets: [bg, text],
        alpha: 1,
        duration: 500,
        delay: 800 + i * 100,
        ease: 'Sine.easeOut',
      });

      bg.on('pointerover', () => {
        this.selectedIndex = i;
        this.updateButtonSelection();
      });

      bg.on('pointerout', () => {
        bg.setTexture('ui_button');
        text.setColor(hexToString(COLORS.UI_TEXT));
      });

      bg.on('pointerdown', () => {
        actions[i]();
      });

      this.buttons.push({ bg, text, index: i });
    });

    this.time.delayedCall(1100, () => {
      this.updateButtonSelection(false);
    });
  }

  private updateButtonSelection(playSound: boolean = true): void {
    if (playSound && this.audioManager) {
      this.audioManager.playSfx('ui_hover');
    }
    this.buttons.forEach((btn) => {
      if (btn.index === this.selectedIndex) {
        btn.bg.setTexture('ui_button_hover');
        btn.text.setColor(hexToString(COLORS.UI_ACCENT));
        this.tweens.add({
          targets: [btn.bg, btn.text],
          scaleX: 1.05,
          scaleY: 1.05,
          duration: 120,
          ease: 'Back.easeOut',
        });
      } else {
        btn.bg.setTexture('ui_button');
        btn.text.setColor(hexToString(COLORS.UI_TEXT));
        this.tweens.add({
          targets: [btn.bg, btn.text],
          scaleX: 1,
          scaleY: 1,
          duration: 120,
        });
      }
    });
  }

  private createParticles(): void {
    for (let i = 0; i < 30; i++) {
      this.particles.push({
        x: Math.random() * GAME_WIDTH,
        y: Math.random() * GAME_HEIGHT,
        vx: (Math.random() - 0.5) * 20,
        vy: -Math.random() * 15 - 5,
        size: Math.random() * 3 + 1,
        alpha: Math.random() * 0.3 + 0.1,
        life: Math.random() * 1000,
      });
    }

    const particleGfx = this.add.graphics().setDepth(DEPTH.PARTICLES);

    this.events.on('update', (_time: number, delta: number) => {
      particleGfx.clear();
      const dt = delta / 1000;

      this.particles.forEach(p => {
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.life += delta;

        if (p.y < -10) {
          p.y = GAME_HEIGHT + 10;
          p.x = Math.random() * GAME_WIDTH;
        }
        if (p.x < -10) p.x = GAME_WIDTH + 10;
        if (p.x > GAME_WIDTH + 10) p.x = -10;

        const flicker = 0.5 + 0.5 * Math.sin(p.life * 0.003);
        particleGfx.fillStyle(COLORS.DISCOVERY, p.alpha * flicker);
        particleGfx.fillCircle(p.x, p.y, p.size);
      });
    });
  }

  private setupInput(): void {
    if (!this.input.keyboard) return;

    this.input.keyboard.on('keydown-UP', () => {
      this.selectedIndex = (this.selectedIndex - 1 + this.buttons.length) % this.buttons.length;
      this.updateButtonSelection();
    });

    this.input.keyboard.on('keydown-DOWN', () => {
      this.selectedIndex = (this.selectedIndex + 1) % this.buttons.length;
      this.updateButtonSelection();
    });

    this.input.keyboard.on('keydown-W', () => {
      this.selectedIndex = (this.selectedIndex - 1 + this.buttons.length) % this.buttons.length;
      this.updateButtonSelection();
    });

    this.input.keyboard.on('keydown-S', () => {
      this.selectedIndex = (this.selectedIndex + 1) % this.buttons.length;
      this.updateButtonSelection();
    });

    this.input.keyboard.on('keydown-ENTER', () => {
      this.activateSelectedButton();
    });

    this.input.keyboard.on('keydown-SPACE', () => {
      this.activateSelectedButton();
    });
  }

  private activateSelectedButton(): void {
    if (this.audioManager) {
      this.audioManager.playSfx('ui_click');
    }
    switch (this.selectedIndex) {
      case 0: this.startGame(); break;
      case 1: this.scene.start(SCENES.WORLD_MAP); break;
      case 2: this.scene.launch(SCENES.CREATIVE_ARCHIVE); break;
      case 3: this.scene.launch(SCENES.JOURNAL); break;
      case 4: this.scene.launch(SCENES.SETTINGS); break;
      case 5: this.scene.launch(SCENES.CREDITS); break;
    }
  }

  private startGame(): void {
    const curLevel = this.saveManager.getCurrentLevel();
    this.cameras.main.fadeOut(600, 0x1A, 0x14, 0x25);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start(SCENES.GAME, { level: curLevel || 1 });
    });
  }
}
