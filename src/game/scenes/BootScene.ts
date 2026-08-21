// ============================================================
// OTHERWISE — Boot Scene
// Minimal bootstrap: load only what's needed for the preload screen
// ============================================================
import Phaser from 'phaser';
import { SCENES, COLORS } from '../../utils/Constants';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: SCENES.BOOT });
  }

  create(): void {
    // Generate procedural textures used throughout the game
    this.generateTextures();
    this.scene.start(SCENES.PRELOAD);
  }

  private generateTextures(): void {
    this.generatePlayerTexture();
    this.generateParticleTexture();
    this.generateConceptIcons();
    this.generateEntityTextures();
    this.generateUITextures();
  }

  // -- Player character: round creature with eyes and backpack --
  private generatePlayerTexture(): void {
    const size = 64;
    const g = this.add.graphics();

    // Body - soft warm cream circle
    g.fillStyle(COLORS.PLAYER_BODY);
    g.fillCircle(size / 2, size / 2 + 2, 18);

    // Slight body highlight
    g.fillStyle(0xFFF5E6, 0.3);
    g.fillCircle(size / 2 - 4, size / 2 - 4, 10);

    // Backpack (right side)
    g.fillStyle(COLORS.PLAYER_BACKPACK);
    g.fillRoundedRect(size / 2 + 10, size / 2 - 6, 10, 14, 3);
    g.fillStyle(0xA07848);
    g.fillRect(size / 2 + 12, size / 2 - 2, 6, 2);

    // Eyes
    // Left eye white
    g.fillStyle(COLORS.PLAYER_EYE_WHITE);
    g.fillCircle(size / 2 - 7, size / 2 - 2, 6);
    // Right eye white
    g.fillCircle(size / 2 + 5, size / 2 - 2, 6);
    // Left pupil
    g.fillStyle(COLORS.PLAYER_EYE);
    g.fillCircle(size / 2 - 5, size / 2 - 1, 3);
    // Right pupil
    g.fillCircle(size / 2 + 7, size / 2 - 1, 3);
    // Eye shine
    g.fillStyle(0xFFFFFF, 0.8);
    g.fillCircle(size / 2 - 4, size / 2 - 3, 1.5);
    g.fillCircle(size / 2 + 8, size / 2 - 3, 1.5);

    // Small feet bumps
    g.fillStyle(COLORS.PLAYER_BODY);
    g.fillCircle(size / 2 - 8, size / 2 + 18, 4);
    g.fillCircle(size / 2 + 4, size / 2 + 18, 4);

    g.generateTexture('player', size, size);
    g.destroy();
  }

  // -- Generic soft particle --
  private generateParticleTexture(): void {
    const size = 16;
    const g = this.add.graphics();
    g.fillStyle(0xFFFFFF);
    g.fillCircle(size / 2, size / 2, size / 2);
    g.generateTexture('particle', size, size);
    g.destroy();

    // Soft glow particle
    const gs = this.add.graphics();
    for (let i = 8; i > 0; i--) {
      gs.fillStyle(0xFFFFFF, (1 - i / 8) * 0.3);
      gs.fillCircle(16, 16, i * 2);
    }
    gs.generateTexture('glow', 32, 32);
    gs.destroy();
  }

  // -- Concept icons (FEAR / LONELY / CURIOUS) --
  private generateConceptIcons(): void {
    // FEAR icon - jagged bolt/eye shape
    const gf = this.add.graphics();
    gf.fillStyle(COLORS.FEAR);
    // Diamond/eye shape suggesting alertness
    gf.fillTriangle(16, 2, 4, 16, 16, 12);
    gf.fillTriangle(16, 2, 28, 16, 16, 12);
    gf.fillTriangle(16, 30, 4, 16, 16, 20);
    gf.fillTriangle(16, 30, 28, 16, 16, 20);
    gf.fillStyle(COLORS.FEAR_GLOW);
    gf.fillCircle(16, 16, 4);
    gf.generateTexture('icon_fear', 32, 32);
    gf.destroy();

    // LONELY icon - two circles reaching toward each other
    const gl = this.add.graphics();
    gl.fillStyle(COLORS.LONELY);
    gl.fillCircle(10, 16, 7);
    gl.fillCircle(22, 16, 5);
    gl.lineStyle(2, COLORS.LONELY_GLOW, 0.6);
    gl.lineBetween(15, 16, 19, 16);
    gl.generateTexture('icon_lonely', 32, 32);
    gl.destroy();

    // CURIOUS icon - spiral/question mark shape
    const gc = this.add.graphics();
    gc.fillStyle(COLORS.CURIOUS);
    gc.lineStyle(3, COLORS.CURIOUS, 1);
    gc.beginPath();
    gc.arc(16, 14, 8, -Math.PI, Math.PI * 0.5, false);
    gc.strokePath();
    gc.fillCircle(16, 14, 3);
    gc.fillCircle(16, 27, 3);
    gc.generateTexture('icon_curious', 32, 32);
    gc.destroy();
  }

  // -- Entity textures --
  private generateEntityTextures(): void {
    // Rock - organic irregular shape
    const gr = this.add.graphics();
    gr.fillStyle(COLORS.STONE);
    gr.beginPath();
    gr.moveTo(8, 36);
    gr.lineTo(4, 24);
    gr.lineTo(8, 10);
    gr.lineTo(18, 4);
    gr.lineTo(32, 6);
    gr.lineTo(40, 14);
    gr.lineTo(42, 28);
    gr.lineTo(36, 38);
    gr.closePath();
    gr.fillPath();
    gr.fillStyle(COLORS.STONE_DARK);
    gr.beginPath();
    gr.moveTo(8, 36);
    gr.lineTo(4, 24);
    gr.lineTo(12, 26);
    gr.lineTo(14, 36);
    gr.closePath();
    gr.fillPath();
    // Highlight
    gr.fillStyle(0xA0A098, 0.5);
    gr.fillCircle(22, 14, 6);
    gr.generateTexture('rock', 48, 42);
    gr.destroy();

    // Door - wooden plank door
    const gd = this.add.graphics();
    gd.fillStyle(COLORS.WOOD);
    gd.fillRoundedRect(4, 0, 40, 72, 4);
    gd.fillStyle(0x7A5B2D);
    gd.fillRect(8, 4, 14, 30);
    gd.fillRect(26, 4, 14, 30);
    gd.fillRect(8, 38, 14, 30);
    gd.fillRect(26, 38, 14, 30);
    gd.fillStyle(COLORS.LONELY_GLOW);
    gd.fillCircle(36, 40, 3);
    gd.generateTexture('door', 48, 72);
    gd.destroy();

    // Platform - mossy stone platform
    const gp = this.add.graphics();
    gp.fillStyle(COLORS.STONE);
    gp.fillRoundedRect(0, 8, 96, 24, 4);
    gp.fillStyle(COLORS.GROUND);
    gp.fillRoundedRect(2, 6, 92, 8, 3);
    gp.generateTexture('platform_block', 96, 32);
    gp.destroy();

    // Creature - small bug-like creature with antennae
    const gcc = this.add.graphics();
    gcc.fillStyle(0x6B8B4A);
    gcc.fillCircle(20, 22, 12);
    gcc.fillStyle(0x7BA058);
    gcc.fillCircle(20, 18, 8);
    // Eyes
    gcc.fillStyle(0xFFFFFF);
    gcc.fillCircle(16, 17, 4);
    gcc.fillCircle(24, 17, 4);
    gcc.fillStyle(0x2D2D3D);
    gcc.fillCircle(17, 17, 2);
    gcc.fillCircle(25, 17, 2);
    // Antennae
    gcc.lineStyle(2, 0x6B8B4A);
    gcc.lineBetween(14, 12, 8, 4);
    gcc.lineBetween(26, 12, 32, 4);
    gcc.fillStyle(0x88AA66);
    gcc.fillCircle(8, 4, 3);
    gcc.fillCircle(32, 4, 3);
    // Legs
    gcc.lineStyle(1.5, 0x5A7A3A);
    gcc.lineBetween(12, 28, 6, 36);
    gcc.lineBetween(20, 30, 20, 38);
    gcc.lineBetween(28, 28, 34, 36);
    gcc.generateTexture('creature', 40, 40);
    gcc.destroy();

    // Pressure plate
    const gpp = this.add.graphics();
    gpp.fillStyle(COLORS.STONE);
    gpp.fillRoundedRect(0, 12, 64, 8, 2);
    gpp.fillStyle(COLORS.STONE_DARK);
    gpp.fillRoundedRect(4, 16, 56, 4, 1);
    gpp.generateTexture('pressure_plate', 64, 24);
    gpp.destroy();

    // Button
    const gb = this.add.graphics();
    gb.fillStyle(COLORS.STONE);
    gb.fillRoundedRect(4, 12, 24, 20, 3);
    gb.fillStyle(0xCC6644);
    gb.fillCircle(16, 18, 6);
    gb.generateTexture('button_obj', 32, 32);
    gb.destroy();

    // Bridge segment
    const gbs = this.add.graphics();
    gbs.fillStyle(COLORS.WOOD);
    gbs.fillRect(0, 0, 48, 12);
    gbs.fillStyle(0x7A5B2D);
    gbs.fillRect(0, 10, 48, 2);
    gbs.lineStyle(1, 0x6B4B1D);
    for (let i = 0; i < 4; i++) {
      gbs.lineBetween(6 + i * 12, 0, 6 + i * 12, 12);
    }
    gbs.generateTexture('bridge', 48, 12);
    gbs.destroy();

    // Collectible - glowing orb
    const gco = this.add.graphics();
    for (let i = 6; i > 0; i--) {
      gco.fillStyle(COLORS.DISCOVERY, (1 - i / 6) * 0.4);
      gco.fillCircle(12, 12, i * 2);
    }
    gco.fillStyle(COLORS.DISCOVERY);
    gco.fillCircle(12, 12, 4);
    gco.fillStyle(0xFFFFFF, 0.8);
    gco.fillCircle(10, 10, 2);
    gco.generateTexture('collectible', 24, 24);
    gco.destroy();

    // Interaction prompt (E key indicator)
    const gi = this.add.graphics();
    gi.fillStyle(0x000000, 0.6);
    gi.fillRoundedRect(0, 0, 28, 28, 6);
    gi.lineStyle(2, COLORS.UI_ACCENT);
    gi.strokeRoundedRect(0, 0, 28, 28, 6);
    gi.generateTexture('interact_prompt_bg', 28, 28);
    gi.destroy();
  }

  // -- UI textures --
  private generateUITextures(): void {
    // Panel background
    const gp = this.add.graphics();
    gp.fillStyle(COLORS.UI_PANEL, 0.95);
    gp.fillRoundedRect(0, 0, 32, 32, 8);
    gp.lineStyle(1, COLORS.UI_BORDER, 0.5);
    gp.strokeRoundedRect(0, 0, 32, 32, 8);
    gp.generateTexture('ui_panel', 32, 32);
    gp.destroy();

    // Button
    const gb = this.add.graphics();
    gb.fillStyle(COLORS.UI_PANEL, 0.9);
    gb.fillRoundedRect(0, 0, 200, 48, 12);
    gb.lineStyle(1.5, COLORS.UI_ACCENT, 0.4);
    gb.strokeRoundedRect(0, 0, 200, 48, 12);
    gb.generateTexture('ui_button', 200, 48);
    gb.destroy();

    // Button hover
    const gbh = this.add.graphics();
    gbh.fillStyle(COLORS.UI_HOVER, 0.95);
    gbh.fillRoundedRect(0, 0, 200, 48, 12);
    gbh.lineStyle(2, COLORS.UI_ACCENT, 0.8);
    gbh.strokeRoundedRect(0, 0, 200, 48, 12);
    gbh.generateTexture('ui_button_hover', 200, 48);
    gbh.destroy();
  }
}
