// ============================================================
// OTHERWISE — World Map Scene
// Interactive storybook map across 4 regions with level select
// ============================================================
import Phaser from 'phaser';
import { SCENES, COLORS, GAME_WIDTH, GAME_HEIGHT } from '../../utils/Constants';
import { hexToString } from '../../utils/MathUtils';
import { SaveManager } from '../systems/save/SaveManager';
import { ALL_LEVELS } from '../levels/LevelData';

interface RegionInfo {
  id: string;
  name: string;
  subtitle: string;
  levels: number[];
  secretLevel?: number;
  x: number;
  y: number;
  color: number;
}

export class WorldMapScene extends Phaser.Scene {
  private saveManager!: SaveManager;

  private regions: RegionInfo[] = [
    {
      id: 'meadow',
      name: 'The Forgotten Meadow',
      subtitle: 'Where intentions first awoke',
      levels: [1, 2, 3, 4],
      secretLevel: 17,
      x: 220,
      y: 360,
      color: COLORS.GROUND,
    },
    {
      id: 'woods',
      name: 'The Hollow Woods',
      subtitle: 'Shadows, trust, and hunger',
      levels: [5, 6, 7, 8],
      secretLevel: 18,
      x: 500,
      y: 360,
      color: COLORS.WOODS_GLOW,
    },
    {
      id: 'ruins',
      name: 'The Clockwork Ruins',
      subtitle: 'Mechanical rhythm & greed',
      levels: [9, 10, 11, 12],
      secretLevel: 19,
      x: 780,
      y: 360,
      color: COLORS.RUINS_BRASS,
    },
    {
      id: 'mountains',
      name: 'The Dreaming Mountains',
      subtitle: 'Floating crags & mastery',
      levels: [13, 14, 15, 16],
      x: 1060,
      y: 360,
      color: COLORS.MOUNTAINS_AURORA,
    },
  ];

  constructor() {
    super({ key: SCENES.WORLD_MAP });
  }

  create(): void {
    this.saveManager = new SaveManager();
    const save = this.saveManager.getData();

    // Background gradient
    const bg = this.add.graphics();
    for (let y = 0; y < GAME_HEIGHT; y++) {
      const t = y / GAME_HEIGHT;
      const r = Math.floor(0x16 + (0x24 - 0x16) * t);
      const g = Math.floor(0x10 + (0x1C - 0x10) * t);
      const b = Math.floor(0x22 + (0x36 - 0x22) * t);
      bg.fillStyle((r << 16) | (g << 8) | b);
      bg.fillRect(0, y, GAME_WIDTH, 1);
    }

    // Title
    this.add.text(GAME_WIDTH / 2, 60, 'WORLD MAP', {
      fontSize: '28px',
      fontFamily: 'Georgia, serif',
      color: hexToString(COLORS.UI_TEXT),
      letterSpacing: 6,
    }).setOrigin(0.5);

    this.add.text(GAME_WIDTH / 2, 95, 'Select a destination to continue your journey', {
      fontSize: '13px',
      fontFamily: 'Georgia, serif',
      color: hexToString(COLORS.UI_TEXT_DIM),
      fontStyle: 'italic',
    }).setOrigin(0.5);

    // Connecting path line between regions
    const pathGfx = this.add.graphics();
    pathGfx.lineStyle(2, COLORS.UI_BORDER, 0.4);
    for (let i = 0; i < this.regions.length - 1; i++) {
      pathGfx.lineBetween(this.regions[i].x, this.regions[i].y, this.regions[i + 1].x, this.regions[i + 1].y);
    }

    // Draw Region Cards
    const unlockedRegions = save.memory.unlockedRegions;

    this.regions.forEach((region) => {
      const isUnlocked = unlockedRegions.includes(region.id);
      this.drawRegionCard(region, isUnlocked, save.progress.completedLevels);
    });

    // Close button / Back to Menu
    const backBtn = this.add.text(GAME_WIDTH / 2, 660, '[ RETURN TO MENU ]', {
      fontSize: '14px',
      fontFamily: 'Georgia, serif',
      color: hexToString(COLORS.UI_ACCENT),
      letterSpacing: 3,
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    backBtn.on('pointerover', () => backBtn.setColor(hexToString(COLORS.UI_TEXT)));
    backBtn.on('pointerout', () => backBtn.setColor(hexToString(COLORS.UI_ACCENT)));
    backBtn.on('pointerdown', () => this.scene.start(SCENES.MAIN_MENU));

    if (this.input.keyboard) {
      this.input.keyboard.on('keydown-ESC', () => this.scene.start(SCENES.MAIN_MENU));
    }
  }

  private drawRegionCard(region: RegionInfo, isUnlocked: boolean, completedLevels: number[]): void {
    const cardW = 240;
    const cardH = 460;
    const x = region.x - cardW / 2;
    const y = region.y - cardH / 2 + 30;

    const card = this.add.graphics();
    card.fillStyle(COLORS.UI_PANEL, isUnlocked ? 0.95 : 0.45);
    card.fillRoundedRect(x, y, cardW, cardH, 14);
    card.lineStyle(1.5, isUnlocked ? region.color : COLORS.UI_BORDER, isUnlocked ? 0.6 : 0.25);
    card.strokeRoundedRect(x, y, cardW, cardH, 14);

    // Region Header
    this.add.text(region.x, y + 25, region.name, {
      fontSize: '14px',
      fontFamily: 'Georgia, serif',
      color: hexToString(isUnlocked ? region.color : COLORS.UI_TEXT_DIM),
      fontStyle: 'bold',
      letterSpacing: 1,
      wordWrap: { width: cardW - 20 },
      align: 'center',
    }).setOrigin(0.5);

    this.add.text(region.x, y + 55, isUnlocked ? region.subtitle : 'Locked', {
      fontSize: '11px',
      fontFamily: 'Georgia, serif',
      color: hexToString(COLORS.UI_TEXT_DIM),
      fontStyle: 'italic',
      align: 'center',
      wordWrap: { width: cardW - 20 },
    }).setOrigin(0.5);

    if (!isUnlocked) {
      this.add.text(region.x, y + cardH / 2, '🔒 Complete previous\nregion to unlock', {
        fontSize: '12px',
        fontFamily: '"Segoe UI", Roboto, sans-serif',
        color: hexToString(COLORS.UI_TEXT_DIM),
        align: 'center',
      }).setOrigin(0.5);
      return;
    }

    // Level nodes
    region.levels.forEach((lvlId, idx) => {
      const lvlDef = ALL_LEVELS[lvlId];
      if (!lvlDef) return;

      const nodeY = y + 105 + idx * 75;
      const isCompleted = completedLevels.includes(lvlId);

      const nodeBtn = this.add.graphics().setInteractive(
        new Phaser.Geom.Rectangle(x + 12, nodeY - 10, cardW - 24, 60),
        Phaser.Geom.Rectangle.Contains
      );

      const drawNode = (hover: boolean) => {
        nodeBtn.clear();
        nodeBtn.fillStyle(hover ? COLORS.UI_HOVER : COLORS.UI_BG, 0.85);
        nodeBtn.fillRoundedRect(x + 12, nodeY - 10, cardW - 24, 60, 8);
        nodeBtn.lineStyle(1, isCompleted ? COLORS.SUCCESS : COLORS.UI_BORDER, hover ? 0.9 : 0.4);
        nodeBtn.strokeRoundedRect(x + 12, nodeY - 10, cardW - 24, 60, 8);
      };
      drawNode(false);

      nodeBtn.on('pointerover', () => drawNode(true));
      nodeBtn.on('pointerout', () => drawNode(false));
      nodeBtn.on('pointerdown', () => this.launchLevel(lvlId));

      // Level text
      this.add.text(x + 24, nodeY, `Level ${lvlId}: ${lvlDef.name}`, {
        fontSize: '12px',
        fontFamily: 'Georgia, serif',
        color: hexToString(isCompleted ? COLORS.SUCCESS : COLORS.UI_TEXT),
        fontStyle: 'bold',
      });

      this.add.text(x + 24, nodeY + 18, isCompleted ? '★ Completed' : 'Unsolved', {
        fontSize: '10px',
        fontFamily: '"Segoe UI", Roboto, sans-serif',
        color: hexToString(isCompleted ? COLORS.SUCCESS : COLORS.UI_TEXT_DIM),
      });
    });

    // Secret Challenge Node if available
    if (region.secretLevel) {
      const secretId = region.secretLevel;
      const secretDef = ALL_LEVELS[secretId];
      if (secretDef) {
        const secY = y + cardH - 45;
        const isSecretDone = completedLevels.includes(secretId);

        const secBtn = this.add.text(region.x, secY, isSecretDone ? '★ Secret Solved' : '✨ Secret Challenge', {
          fontSize: '11px',
          fontFamily: 'Georgia, serif',
          color: hexToString(COLORS.DISCOVERY),
          fontStyle: 'italic',
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        secBtn.on('pointerover', () => secBtn.setColor(hexToString(COLORS.UI_TEXT)));
        secBtn.on('pointerout', () => secBtn.setColor(hexToString(COLORS.DISCOVERY)));
        secBtn.on('pointerdown', () => this.launchLevel(secretId));
      }
    }
  }

  private launchLevel(levelId: number): void {
    this.cameras.main.fadeOut(500, 0x1A, 0x14, 0x25);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start(SCENES.GAME, { level: levelId });
    });
  }
}
