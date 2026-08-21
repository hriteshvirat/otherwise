// ============================================================
// OTHERWISE — Game Scene
// Main gameplay scene: renders levels, manages systems, audio, debug
// ============================================================
import Phaser from 'phaser';
import { SCENES, COLORS, DEPTH, GAME_WIDTH, GAME_HEIGHT } from '../../utils/Constants';
import { hexToString } from '../../utils/MathUtils';
import { PlayerController } from '../systems/physics/PlayerController';
import { BehaviorSystem } from '../systems/behaviors/BehaviorSystem';
import { ConceptManager } from '../systems/concepts/ConceptManager';
import { InteractionSystem } from '../systems/interactions/InteractionSystem';
import { CameraController } from '../systems/camera/CameraController';
import { AudioManager } from '../systems/audio/AudioManager';
import { SaveManager } from '../systems/save/SaveManager';
import { BaseEntity } from '../entities/BaseEntity';
import { ENTITY_DEFS } from '../data/EntityDefinitions';
import { ALL_CONCEPTS, ConceptDefinition } from '../data/ConceptData';
import { LevelDefinition, ALL_LEVELS } from '../levels/LevelData';

export class GameScene extends Phaser.Scene {
  // Systems
  private player!: PlayerController;
  private behaviorSystem!: BehaviorSystem;
  private conceptManager!: ConceptManager;
  private interactionSystem!: InteractionSystem;
  private cameraController!: CameraController;
  public audioManager!: AudioManager;
  public saveManager!: SaveManager;

  // Level
  private currentLevelId = 1;
  private currentLevel!: LevelDefinition;
  private groundGroup!: Phaser.Physics.Arcade.StaticGroup;
  private entities: BaseEntity[] = [];
  private conceptPickups: Phaser.Physics.Arcade.Sprite[] = [];
  private goalSprite!: Phaser.Physics.Arcade.Sprite;

  // UI
  private hudConceptIcon: Phaser.GameObjects.Image | null = null;
  private hudConceptText: Phaser.GameObjects.Text | null = null;
  private conceptSelectorOpen = false;
  private conceptSelectorContainer: Phaser.GameObjects.Container | null = null;

  // Debug
  private debugMode = false;
  private debugTexts: Phaser.GameObjects.Text[] = [];

  // Background
  private bgGraphics!: Phaser.GameObjects.Graphics;
  private bgParticles: { x: number; y: number; vx: number; vy: number; size: number; alpha: number }[] = [];
  private bgParticleGfx: Phaser.GameObjects.Graphics | null = null;

  constructor() {
    super({ key: SCENES.GAME });
  }

  init(data: { level?: number }): void {
    this.currentLevelId = data.level || 1;
  }

  create(): void {
    // Initialize systems
    this.saveManager = new SaveManager();
    this.conceptManager = new ConceptManager();
    this.audioManager = new AudioManager(this);
    this.behaviorSystem = new BehaviorSystem(this);

    // Load saved concepts
    const savedConcepts = this.saveManager.getDiscoveredConcepts();
    for (const cid of savedConcepts) {
      this.conceptManager.discoverConcept(cid);
    }

    // Load level definition
    this.currentLevel = ALL_LEVELS[this.currentLevelId];
    if (!this.currentLevel) {
      this.currentLevel = ALL_LEVELS[1];
      this.currentLevelId = 1;
    }

    // Build the world
    this.drawBackground();
    this.buildLevel();
    this.createPlayer();
    this.setupSystems();
    this.createEntities();
    this.createConceptPickups();
    this.createGoal();
    this.setupCollisions();
    this.createHUD();
    this.setupInput();

    // Show level name
    this.showLevelIntro();

    // Camera
    this.cameraController = new CameraController(this);
    this.cameraController.setTarget(this.player.sprite);
    this.cameraController.setBounds(
      0, 0,
      this.currentLevel.width,
      this.currentLevel.height
    );

    // Fade in
    this.cameras.main.fadeIn(600, 0x1A, 0x14, 0x25);

    // Resume audio on first interaction & start background music
    const startAudio = () => {
      this.audioManager.resume();
      this.audioManager.startMusic();
    };

    this.input.once('pointerdown', startAudio);
    if (this.input.keyboard) {
      this.input.keyboard.once('keydown', startAudio);
    }
  }

  update(time: number, delta: number): void {
    // Update systems
    this.player.update(delta);
    this.behaviorSystem.update(delta);
    this.interactionSystem.update();
    this.cameraController.update(delta);

    // Update entities
    for (const entity of this.entities) {
      entity.update(delta);
    }

    // Update pressure plates
    this.updatePressurePlates();

    // Animate concept pickups
    this.conceptPickups.forEach((pickup, i) => {
      pickup.y += Math.sin(time * 0.003 + i) * 0.3;
      pickup.setScale(0.8 + Math.sin(time * 0.004 + i) * 0.1);
    });

    // Update background particles
    this.updateBgParticles(delta);

    // Update HUD
    this.updateHUD();

    // Debug overlay
    if (this.debugMode) {
      this.updateDebug();
    }
  }

  // ---- PRESSURE PLATES ----
  private updatePressurePlates(): void {
    const plates = this.entities.filter(e => e.definition.type === 'pressure_plate');
    if (plates.length === 0) return;

    for (const plate of plates) {
      let isPressed = false;

      // Check player touching
      const dPlayer = Phaser.Math.Distance.Between(
        this.player.sprite.x, this.player.sprite.y,
        plate.sprite.x, plate.sprite.y
      );
      if (dPlayer < 36) {
        isPressed = true;
      }

      // Check any physical entity touching
      if (!isPressed) {
        for (const other of this.entities) {
          if (other === plate || !other.definition.hasPhysics) continue;
          const d = Phaser.Math.Distance.Between(
            other.sprite.x, other.sprite.y,
            plate.sprite.x, plate.sprite.y
          );
          if (d < 38) {
            isPressed = true;
            break;
          }
        }
      }

      if (isPressed && !plate.isActivated) {
        plate.activate();
        this.audioManager.playSfx('switch');
      } else if (!isPressed && plate.isActivated) {
        plate.deactivate();
      }
    }
  }

  // ---- BACKGROUND ----
  private drawBackground(): void {
    const level = this.currentLevel;
    this.bgGraphics = this.add.graphics().setDepth(DEPTH.BG_FAR).setScrollFactor(0);

    // Sky gradient
    for (let y = 0; y < GAME_HEIGHT; y++) {
      const t = y / GAME_HEIGHT;
      const r = Math.floor(0x2D + (0xE8 - 0x2D) * t);
      const g = Math.floor(0x1B + (0xA8 - 0x1B) * t);
      const b = Math.floor(0x69 + (0x7C - 0x69) * t);
      this.bgGraphics.fillStyle((r << 16) | (g << 8) | b);
      this.bgGraphics.fillRect(0, y, GAME_WIDTH, 1);
    }

    // Distant mountains (parallax far)
    const mtnFar = this.add.graphics().setDepth(DEPTH.BG_FAR + 1).setScrollFactor(0.1);
    mtnFar.fillStyle(COLORS.MOUNTAIN_FAR, 0.4);
    mtnFar.beginPath();
    mtnFar.moveTo(-100, GAME_HEIGHT);
    for (let x = -100; x <= level.width + 100; x += 80) {
      const h = 400 + Math.sin(x * 0.005) * 80 + Math.sin(x * 0.013) * 40;
      mtnFar.lineTo(x, h);
    }
    mtnFar.lineTo(level.width + 100, GAME_HEIGHT);
    mtnFar.closePath();
    mtnFar.fillPath();

    // Mid mountains (parallax mid)
    const mtnMid = this.add.graphics().setDepth(DEPTH.BG_MID).setScrollFactor(0.3);
    mtnMid.fillStyle(COLORS.MOUNTAIN_MID, 0.5);
    mtnMid.beginPath();
    mtnMid.moveTo(-100, GAME_HEIGHT);
    for (let x = -100; x <= level.width + 100; x += 60) {
      const h = 480 + Math.sin(x * 0.008 + 1) * 60 + Math.sin(x * 0.02) * 30;
      mtnMid.lineTo(x, h);
    }
    mtnMid.lineTo(level.width + 100, GAME_HEIGHT);
    mtnMid.closePath();
    mtnMid.fillPath();

    // Clouds
    const clouds = this.add.graphics().setDepth(DEPTH.BG_FAR + 2).setScrollFactor(0.05);
    for (let i = 0; i < 8; i++) {
      const cx = (i * 320 + 80) % GAME_WIDTH;
      const cy = 60 + (i * 35) % 180;
      const size = 40 + (i * 12) % 40;
      clouds.fillStyle(COLORS.CLOUD, 0.25);
      clouds.fillEllipse(cx, cy, size * 2, size * 0.6);
      clouds.fillEllipse(cx - size * 0.3, cy + 5, size * 1.2, size * 0.5);
      clouds.fillEllipse(cx + size * 0.4, cy + 3, size * 1.5, size * 0.4);
    }

    // Foreground silhouette trees
    const trees = this.add.graphics().setDepth(DEPTH.FG_SILHOUETTE).setScrollFactor(0.9);
    this.drawTreeSilhouettes(trees, level.width);

    // Init background particles
    this.bgParticles = [];
    for (let i = 0; i < 16; i++) {
      this.bgParticles.push({
        x: Math.random() * GAME_WIDTH,
        y: Math.random() * GAME_HEIGHT * 0.8,
        vx: (Math.random() - 0.5) * 12,
        vy: -Math.random() * 8 - 2,
        size: Math.random() * 2 + 0.5,
        alpha: Math.random() * 0.25 + 0.05,
      });
    }
  }

  private drawTreeSilhouettes(g: Phaser.GameObjects.Graphics, levelWidth: number): void {
    g.fillStyle(COLORS.TREE_DARK, 0.3);
    this.drawTree(g, -20, 720, 80, 200);
    this.drawTree(g, 50, 720, 60, 160);
    this.drawTree(g, levelWidth - 60, 720, 70, 180);
    this.drawTree(g, levelWidth + 10, 720, 90, 220);
  }

  private drawTree(g: Phaser.GameObjects.Graphics, x: number, groundY: number, width: number, height: number): void {
    g.fillRect(x + width * 0.35, groundY - height * 0.5, width * 0.3, height * 0.5);
    g.fillCircle(x + width * 0.5, groundY - height * 0.6, width * 0.5);
    g.fillCircle(x + width * 0.3, groundY - height * 0.5, width * 0.35);
    g.fillCircle(x + width * 0.7, groundY - height * 0.5, width * 0.4);
    g.fillCircle(x + width * 0.5, groundY - height * 0.75, width * 0.35);
  }

  private updateBgParticles(delta: number): void {
    if (!this.bgParticleGfx) {
      this.bgParticleGfx = this.add.graphics()
        .setDepth(DEPTH.BG_NEAR + 1)
        .setScrollFactor(0);
    }
    this.bgParticleGfx.clear();

    const dt = delta / 1000;
    for (const p of this.bgParticles) {
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      if (p.y < -10) {
        p.y = GAME_HEIGHT + 10;
        p.x = Math.random() * GAME_WIDTH;
      }
      if (p.x < -10) p.x = GAME_WIDTH + 10;
      if (p.x > GAME_WIDTH + 10) p.x = -10;

      this.bgParticleGfx.fillStyle(COLORS.DISCOVERY, p.alpha);
      this.bgParticleGfx.fillCircle(p.x, p.y, p.size);
    }
  }

  // ---- LEVEL BUILDING ----
  private buildLevel(): void {
    const level = this.currentLevel;
    this.groundGroup = this.physics.add.staticGroup();

    for (const plat of level.platforms) {
      const g = this.add.graphics().setDepth(DEPTH.GROUND);

      if (plat.type !== 'invisible') {
        // Ground surface with organic colors
        g.fillStyle(COLORS.GROUND_DARK);
        g.fillRect(plat.x, plat.y, plat.width, plat.height);

        // Top grass layer
        g.fillStyle(COLORS.GROUND);
        g.fillRect(plat.x, plat.y, plat.width, 10);

        // Grass bumpy edge
        for (let bx = plat.x; bx < plat.x + plat.width; bx += 8) {
          const bh = 2 + Math.sin(bx * 0.3) * 2;
          g.fillRect(bx, plat.y - bh, 8, bh + 2);
        }

        // Bottom edge
        g.fillStyle(COLORS.GROUND_EDGE, 0.5);
        g.fillRect(plat.x, plat.y + plat.height - 4, plat.width, 4);
      }

      // Physics static body
      const body = this.groundGroup.create(
        plat.x + plat.width / 2,
        plat.y + plat.height / 2,
        undefined
      ) as Phaser.Physics.Arcade.Sprite;
      body.setVisible(false);
      (body.body as Phaser.Physics.Arcade.StaticBody).setSize(plat.width, plat.height);
      body.refreshBody();
    }
  }

  // ---- PLAYER ----
  private createPlayer(): void {
    const start = this.currentLevel.playerStart;
    this.player = new PlayerController(this, start.x, start.y);
    this.player.sprite.setDepth(DEPTH.PLAYER);

    // Connect player audio events
    this.player.onJump = () => this.audioManager.playSfx('jump');
    this.player.onLand = () => this.audioManager.playSfx('land');
    this.player.onDie = () => this.audioManager.playSfx('death');
  }

  // ---- ENTITIES ----
  private createEntities(): void {
    const level = this.currentLevel;
    this.entities = [];

    for (const placement of level.entities) {
      const def = ENTITY_DEFS[placement.type];
      if (!def) continue;

      const entity = new BaseEntity(this, placement.x, placement.y, def);

      if (placement.id) {
        (entity as any)._placementId = placement.id;
      }

      this.entities.push(entity);
      this.behaviorSystem.addEntity(entity);
      this.interactionSystem.addEntity(entity);
    }

    // Link entities
    for (const placement of level.entities) {
      if (!placement.linkedTo || !placement.id) continue;
      const source = this.entities.find(e => (e as any)._placementId === placement.id);
      const target = this.entities.find(e => (e as any)._placementId === placement.linkedTo);
      if (source && target) {
        source.linkedEntities.push(target);
      }
    }
  }

  // ---- CONCEPT PICKUPS ----
  private createConceptPickups(): void {
    this.conceptPickups = [];
    const level = this.currentLevel;

    for (const pickup of level.conceptPickups) {
      const concept = ALL_CONCEPTS[pickup.conceptId];
      if (!concept) continue;

      // Don't spawn if already discovered
      if (this.conceptManager.isDiscovered(pickup.conceptId)) continue;

      const sprite = this.physics.add.sprite(pickup.x, pickup.y, concept.icon)
        .setDepth(DEPTH.ENTITIES + 10)
        .setScale(1.4);

      (sprite.body as Phaser.Physics.Arcade.Body).setAllowGravity(false);
      (sprite.body as Phaser.Physics.Arcade.Body).setImmovable(true);

      // Soft glow effect
      const glow = this.add.graphics().setDepth(DEPTH.ENTITIES + 9);
      const updateGlow = () => {
        glow.clear();
        const t = this.time.now / 1000;
        const r = 20 + Math.sin(t * 2) * 4;
        glow.fillStyle(concept.visualStyle.glowColor, 0.2);
        glow.fillCircle(sprite.x, sprite.y, r);
      };
      this.events.on('update', updateGlow);

      sprite.setData('conceptId', pickup.conceptId);
      sprite.setData('glow', glow);
      sprite.setData('glowUpdate', updateGlow);

      this.conceptPickups.push(sprite);
    }
  }

  // ---- GOAL ----
  private createGoal(): void {
    const goal = this.currentLevel.goalPosition;

    // Goal visual — glowing beacon portal
    const goalGfx = this.add.graphics().setDepth(DEPTH.ENTITIES + 5);
    const drawGoal = () => {
      goalGfx.clear();
      const t = this.time.now / 1000;

      for (let i = 4; i > 0; i--) {
        const r = 18 + i * 7 + Math.sin(t * 2 + i) * 3;
        goalGfx.fillStyle(COLORS.SUCCESS, 0.05 * (5 - i));
        goalGfx.fillCircle(goal.x, goal.y, r);
      }

      goalGfx.fillStyle(COLORS.SUCCESS, 0.6 + Math.sin(t * 3) * 0.2);
      goalGfx.fillCircle(goal.x, goal.y, 12);

      goalGfx.fillStyle(0xFFFFFF, 0.9);
      goalGfx.fillCircle(goal.x, goal.y, 5);
    };
    this.events.on('update', drawGoal);

    // Goal collision zone
    this.goalSprite = this.physics.add.sprite(goal.x, goal.y, 'particle')
      .setVisible(false)
      .setScale(2);
    (this.goalSprite.body as Phaser.Physics.Arcade.Body).setAllowGravity(false);
    (this.goalSprite.body as Phaser.Physics.Arcade.Body).setImmovable(true);
    (this.goalSprite.body as Phaser.Physics.Arcade.Body).setSize(40, 60);
  }

  // ---- COLLISIONS ----
  private setupCollisions(): void {
    // Player vs ground
    this.physics.add.collider(this.player.sprite, this.groundGroup);

    // Entities vs ground
    for (const entity of this.entities) {
      if (entity.definition.hasPhysics) {
        this.physics.add.collider(entity.sprite, this.groundGroup);
      }
    }

    // Player vs concept pickups
    this.physics.add.overlap(
      this.player.sprite,
      this.conceptPickups,
      (_, pickup) => {
        const sprite = pickup as Phaser.Physics.Arcade.Sprite;
        const conceptId = sprite.getData('conceptId') as string;
        this.collectConcept(conceptId, sprite);
      },
      undefined,
      this
    );

    // Player vs collectibles in level
    const collectibles = this.entities.filter(e => e.definition.type === 'collectible');
    for (const item of collectibles) {
      this.physics.add.overlap(
        this.player.sprite,
        item.sprite,
        () => {
          this.audioManager.playSfx('collect');
          // Burst particles
          const emitter = this.add.particles(item.sprite.x, item.sprite.y, 'glow', {
            speed: { min: 30, max: 80 },
            angle: { min: 0, max: 360 },
            scale: { start: 0.5, end: 0 },
            alpha: { start: 0.8, end: 0 },
            lifespan: 500,
            quantity: 8,
            tint: COLORS.DISCOVERY,
          });
          emitter.explode(8);
          this.time.delayedCall(600, () => emitter.destroy());

          this.interactionSystem.removeEntity(item);
          this.behaviorSystem.removeEntity(item);
          this.entities = this.entities.filter(e => e !== item);
          item.destroy();
        },
        undefined,
        this
      );
    }

    // Player vs goal
    this.physics.add.overlap(
      this.player.sprite,
      this.goalSprite,
      () => this.completeLevel(),
      undefined,
      this
    );

    // Player vs physical entities (for pushing rocks, standing on platforms)
    for (const entity of this.entities) {
      if (entity.definition.hasPhysics && entity.definition.mass < 10) {
        this.physics.add.collider(this.player.sprite, entity.sprite);
      }
    }

    // Entities vs entities (rocks pushing each other)
    for (let i = 0; i < this.entities.length; i++) {
      for (let j = i + 1; j < this.entities.length; j++) {
        if (this.entities[i].definition.hasPhysics && this.entities[j].definition.hasPhysics) {
          this.physics.add.collider(this.entities[i].sprite, this.entities[j].sprite);
        }
      }
    }
  }

  // ---- SYSTEMS SETUP ----
  private setupSystems(): void {
    this.interactionSystem = new InteractionSystem(
      this,
      this.player,
      this.conceptManager,
      this.audioManager,
      this.saveManager
    );
    this.behaviorSystem.setPlayer(this.player.sprite);
    this.behaviorSystem.setGroundGroup(this.groundGroup);
    this.behaviorSystem.setSaveManager(this.saveManager);

    // Concept manager discovery callback
    this.conceptManager.onConceptDiscovered = (concept: ConceptDefinition) => {
      this.saveManager.discoverConcept(concept.id);
      this.showConceptDiscovery(concept);
    };
  }

  // ---- INPUT ----
  private setupInput(): void {
    if (!this.input.keyboard) return;

    // Pause
    this.input.keyboard.on('keydown-ESC', () => {
      this.scene.launch(SCENES.PAUSE, { gameScene: this });
      this.scene.pause();
    });

    // Restart
    this.input.keyboard.on('keydown-R', () => {
      this.audioManager.stopMusic();
      this.scene.restart({ level: this.currentLevelId });
    });

    // Concept selector
    this.input.keyboard.on('keydown-Q', () => this.toggleConceptSelector());
    this.input.keyboard.on('keydown-TAB', (e: KeyboardEvent) => {
      e.preventDefault();
      this.toggleConceptSelector();
    });

    // Quick concept cycle with number keys (1, 2, 3)
    this.input.keyboard.on('keydown-ONE', () => {
      if (this.debugMode) {
        this.switchLevel(1);
      } else {
        this.quickEquipConcept(0);
      }
    });

    this.input.keyboard.on('keydown-TWO', () => {
      if (this.debugMode) {
        this.switchLevel(2);
      } else {
        this.quickEquipConcept(1);
      }
    });

    this.input.keyboard.on('keydown-THREE', () => {
      if (this.debugMode) {
        this.switchLevel(3);
      } else {
        this.quickEquipConcept(2);
      }
    });

    // Debug toggle (backtick `)
    this.input.keyboard.on('keydown-BACKTICK', () => {
      this.debugMode = !this.debugMode;
      if (!this.debugMode) {
        this.clearDebug();
      }
    });

    // Debug cheats (G to grant all concepts, H to toggle hitboxes)
    this.input.keyboard.on('keydown-G', () => {
      if (this.debugMode) {
        this.conceptManager.discoverConcept('fear');
        this.conceptManager.discoverConcept('lonely');
        this.conceptManager.discoverConcept('curious');
        this.saveManager.discoverConcept('fear');
        this.saveManager.discoverConcept('lonely');
        this.saveManager.discoverConcept('curious');
        this.audioManager.playSfx('discovery');
      }
    });
  }

  private switchLevel(levelNum: number): void {
    this.audioManager.stopMusic();
    this.scene.restart({ level: levelNum });
  }

  // ---- CONCEPT COLLECTION ----
  private collectConcept(conceptId: string, sprite: Phaser.Physics.Arcade.Sprite): void {
    const concept = this.conceptManager.discoverConcept(conceptId);
    if (!concept) return;

    // Remove pickup
    const glow = sprite.getData('glow') as Phaser.GameObjects.Graphics;
    const glowUpdate = sprite.getData('glowUpdate') as () => void;
    if (glow) glow.destroy();
    if (glowUpdate) this.events.off('update', glowUpdate);

    // Collection particles
    const emitter = this.add.particles(sprite.x, sprite.y, 'glow', {
      speed: { min: 40, max: 120 },
      angle: { min: 0, max: 360 },
      scale: { start: 0.6, end: 0 },
      alpha: { start: 0.9, end: 0 },
      lifespan: 800,
      quantity: 15,
      tint: concept.visualStyle.glowColor,
    });
    emitter.explode(15);
    this.time.delayedCall(900, () => emitter.destroy());

    sprite.destroy();
    this.conceptPickups = this.conceptPickups.filter(p => p !== sprite);

    this.audioManager.playSfx('discovery');
  }

  // ---- CONCEPT DISCOVERY UI ----
  private showConceptDiscovery(concept: ConceptDefinition): void {
    const overlay = this.add.rectangle(
      GAME_WIDTH / 2, GAME_HEIGHT / 2,
      GAME_WIDTH, GAME_HEIGHT,
      0x000000, 0.5
    ).setScrollFactor(0).setDepth(DEPTH.OVERLAY);

    const panel = this.add.graphics().setScrollFactor(0).setDepth(DEPTH.OVERLAY + 1);
    panel.fillStyle(COLORS.UI_PANEL, 0.95);
    panel.fillRoundedRect(GAME_WIDTH / 2 - 180, GAME_HEIGHT / 2 - 100, 360, 200, 16);
    panel.lineStyle(2, concept.visualStyle.glowColor, 0.6);
    panel.strokeRoundedRect(GAME_WIDTH / 2 - 180, GAME_HEIGHT / 2 - 100, 360, 200, 16);

    const title = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 60, 'CONCEPT DISCOVERED', {
      fontSize: '14px',
      fontFamily: 'Georgia, serif',
      color: hexToString(COLORS.UI_TEXT_DIM),
      letterSpacing: 4,
    }).setOrigin(0.5).setScrollFactor(0).setDepth(DEPTH.OVERLAY + 2);

    const name = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 20, concept.name, {
      fontSize: '36px',
      fontFamily: 'Georgia, serif',
      color: hexToString(concept.visualStyle.glowColor),
      letterSpacing: 6,
    }).setOrigin(0.5).setScrollFactor(0).setDepth(DEPTH.OVERLAY + 2);

    const desc = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 30, concept.description, {
      fontSize: '14px',
      fontFamily: '"Segoe UI", Roboto, sans-serif',
      color: hexToString(COLORS.UI_TEXT),
      wordWrap: { width: 300 },
      align: 'center',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(DEPTH.OVERLAY + 2);

    const hint = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 75, 'Press E near objects to apply', {
      fontSize: '12px',
      fontFamily: '"Segoe UI", Roboto, sans-serif',
      color: hexToString(COLORS.UI_TEXT_DIM),
    }).setOrigin(0.5).setScrollFactor(0).setDepth(DEPTH.OVERLAY + 2);

    const elements = [overlay, panel, title, name, desc, hint];
    elements.forEach(el => {
      el.setAlpha(0);
      this.tweens.add({
        targets: el,
        alpha: el === overlay ? 0.5 : 1,
        duration: 400,
        ease: 'Sine.easeOut',
      });
    });

    this.time.delayedCall(2500, () => {
      elements.forEach(el => {
        this.tweens.add({
          targets: el,
          alpha: 0,
          duration: 300,
          onComplete: () => el.destroy(),
        });
      });
    });
  }

  // ---- LEVEL INTRO ----
  private showLevelIntro(): void {
    const name = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 20, this.currentLevel.name, {
      fontSize: '32px',
      fontFamily: 'Georgia, serif',
      color: hexToString(COLORS.UI_TEXT),
      letterSpacing: 6,
    }).setOrigin(0.5).setScrollFactor(0).setDepth(DEPTH.OVERLAY).setAlpha(0);

    const subtitle = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 20, this.currentLevel.subtitle, {
      fontSize: '14px',
      fontFamily: 'Georgia, serif',
      color: hexToString(COLORS.UI_TEXT_DIM),
    }).setOrigin(0.5).setScrollFactor(0).setDepth(DEPTH.OVERLAY).setAlpha(0);

    this.tweens.add({ targets: [name, subtitle], alpha: 1, duration: 800, ease: 'Sine.easeOut' });

    this.time.delayedCall(2000, () => {
      this.tweens.add({
        targets: [name, subtitle],
        alpha: 0,
        duration: 600,
        onComplete: () => { name.destroy(); subtitle.destroy(); },
      });
    });
  }

  // ---- LEVEL COMPLETION ----
  private completeLevel(): void {
    if ((this as any)._levelComplete) return;
    (this as any)._levelComplete = true;

    this.saveManager.completeLevel(this.currentLevelId);
    this.audioManager.playSfx('puzzle_success');

    // Success particles
    const goal = this.currentLevel.goalPosition;
    const emitter = this.add.particles(goal.x, goal.y, 'glow', {
      speed: { min: 50, max: 200 },
      angle: { min: 0, max: 360 },
      scale: { start: 0.8, end: 0 },
      alpha: { start: 1, end: 0 },
      lifespan: 1000,
      quantity: 20,
      tint: [COLORS.SUCCESS, COLORS.DISCOVERY, 0xFFFFFF],
    });
    emitter.explode(20);

    this.cameraController.flash(400);

    this.time.delayedCall(1500, () => {
      this.audioManager.stopMusic();
      const nextLevel = this.currentLevelId + 1;
      if (ALL_LEVELS[nextLevel]) {
        this.cameras.main.fadeOut(600, 0x1A, 0x14, 0x25);
        this.cameras.main.once('camerafadeoutcomplete', () => {
          this.scene.restart({ level: nextLevel });
        });
      } else {
        this.cameras.main.fadeOut(800, 0x1A, 0x14, 0x25);
        this.cameras.main.once('camerafadeoutcomplete', () => {
          this.scene.start(SCENES.MAIN_MENU);
        });
      }
    });
  }

  // ---- HUD ----
  private createHUD(): void {
    const hudBg = this.add.graphics().setScrollFactor(0).setDepth(DEPTH.UI);
    hudBg.fillStyle(COLORS.UI_PANEL, 0.75);
    hudBg.fillRoundedRect(16, GAME_HEIGHT - 60, 150, 44, 10);
    hudBg.lineStyle(1, COLORS.UI_BORDER, 0.4);
    hudBg.strokeRoundedRect(16, GAME_HEIGHT - 60, 150, 44, 10);

    this.hudConceptIcon = this.add.image(44, GAME_HEIGHT - 38, 'particle')
      .setScrollFactor(0)
      .setDepth(DEPTH.UI + 1)
      .setScale(1.2);

    this.hudConceptText = this.add.text(68, GAME_HEIGHT - 48, 'No Concept', {
      fontSize: '13px',
      fontFamily: '"Segoe UI", Roboto, sans-serif',
      color: hexToString(COLORS.UI_TEXT_DIM),
      fontStyle: 'bold',
    }).setScrollFactor(0).setDepth(DEPTH.UI + 1);

    this.add.text(68, GAME_HEIGHT - 28, '[Q] Select Concept', {
      fontSize: '10px',
      fontFamily: '"Segoe UI", Roboto, sans-serif',
      color: hexToString(COLORS.UI_TEXT_DIM),
    }).setScrollFactor(0).setDepth(DEPTH.UI + 1).setAlpha(0.7);
  }

  private updateHUD(): void {
    const equipped = this.conceptManager.getEquippedConcept();
    if (equipped && this.hudConceptIcon && this.hudConceptText) {
      this.hudConceptIcon.setTexture(equipped.icon);
      this.hudConceptText.setText(equipped.name);
      this.hudConceptText.setColor(hexToString(equipped.visualStyle.glowColor));
    } else if (this.hudConceptText) {
      this.hudConceptText.setText('No Concept');
      this.hudConceptText.setColor(hexToString(COLORS.UI_TEXT_DIM));
    }
  }

  // ---- CONCEPT SELECTOR ----
  private toggleConceptSelector(): void {
    if (this.conceptSelectorOpen) {
      this.closeConceptSelector();
    } else {
      this.openConceptSelector();
    }
  }

  private openConceptSelector(): void {
    const concepts = this.conceptManager.getDiscoveredConcepts();
    if (concepts.length === 0) {
      this.audioManager.playSfx('ui_hover');
      return;
    }

    this.conceptSelectorOpen = true;

    const cx = GAME_WIDTH / 2;
    const cy = GAME_HEIGHT / 2;
    const container = this.add.container(cx, cy)
      .setScrollFactor(0)
      .setDepth(DEPTH.OVERLAY);
    this.conceptSelectorContainer = container;

    const bg = this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.4)
      .setScrollFactor(0);
    container.add(bg);

    const title = this.add.text(0, -110, 'SELECT CONCEPT', {
      fontSize: '16px',
      fontFamily: 'Georgia, serif',
      color: hexToString(COLORS.UI_TEXT_DIM),
      letterSpacing: 4,
    }).setOrigin(0.5);
    container.add(title);

    const radius = 70;
    const equippedId = this.conceptManager.getEquippedId();

    concepts.forEach((concept, i) => {
      const angle = (i / concepts.length) * Math.PI * 2 - Math.PI / 2;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;

      const iconBg = this.add.graphics();
      const isEquipped = concept.id === equippedId;
      iconBg.fillStyle(isEquipped ? concept.visualStyle.glowColor : COLORS.UI_PANEL, isEquipped ? 0.3 : 0.85);
      iconBg.fillCircle(x, y, 32);
      iconBg.lineStyle(2, concept.visualStyle.glowColor, isEquipped ? 1 : 0.4);
      iconBg.strokeCircle(x, y, 32);
      container.add(iconBg);

      const icon = this.add.image(x, y, concept.icon).setScale(1.4);
      container.add(icon);

      const label = this.add.text(x, y + 44, concept.name, {
        fontSize: '12px',
        fontFamily: 'Georgia, serif',
        color: hexToString(isEquipped ? concept.visualStyle.glowColor : COLORS.UI_TEXT),
        letterSpacing: 2,
        fontStyle: 'bold',
      }).setOrigin(0.5);
      container.add(label);

      const numHint = this.add.text(x, y - 42, `[${i + 1}]`, {
        fontSize: '11px',
        fontFamily: '"Segoe UI", Roboto, sans-serif',
        color: hexToString(COLORS.UI_TEXT_DIM),
      }).setOrigin(0.5);
      container.add(numHint);
    });

    const instr = this.add.text(0, 120, 'Press 1-3 to equip · Q to close', {
      fontSize: '12px',
      fontFamily: '"Segoe UI", Roboto, sans-serif',
      color: hexToString(COLORS.UI_TEXT_DIM),
    }).setOrigin(0.5);
    container.add(instr);

    container.setAlpha(0).setScale(0.8);
    this.tweens.add({
      targets: container,
      alpha: 1,
      scaleX: 1,
      scaleY: 1,
      duration: 200,
      ease: 'Back.easeOut',
    });
  }

  private closeConceptSelector(): void {
    this.conceptSelectorOpen = false;
    if (this.conceptSelectorContainer) {
      this.tweens.add({
        targets: this.conceptSelectorContainer,
        alpha: 0,
        scaleX: 0.8,
        scaleY: 0.8,
        duration: 150,
        onComplete: () => {
          this.conceptSelectorContainer?.destroy();
          this.conceptSelectorContainer = null;
        },
      });
    }
  }

  private quickEquipConcept(index: number): void {
    const concepts = this.conceptManager.getDiscoveredConcepts();
    if (index < concepts.length) {
      this.conceptManager.equipConcept(concepts[index].id);
      this.audioManager.playSfx('ui_click');
      if (this.conceptSelectorOpen) {
        this.closeConceptSelector();
      }
    }
  }

  // ---- DEBUG OVERLAY ----
  private updateDebug(): void {
    this.clearDebug();

    const pos = this.player.getPosition();
    this.addDebugText(10, 10, `[DEBUG MODE ACTIVE (Press \` to toggle)]`);
    this.addDebugText(10, 26, `Player: ${pos.x.toFixed(0)}, ${pos.y.toFixed(0)} | State: ${this.player.state}`);
    this.addDebugText(10, 42, `Level: ${this.currentLevelId} (Press 1/2/3 to switch) | Entities: ${this.entities.length}`);
    this.addDebugText(10, 58, `Concepts: ${this.conceptManager.getDiscoveredConcepts().map(c => c.name).join(', ') || 'None'} (Press G to grant all)`);

    let y = 80;
    for (const entity of this.entities) {
      if (entity.appliedConcept) {
        this.addDebugText(10, y,
          `${entity.definition.displayName} [${entity.appliedConcept.name}] → ${entity.currentGoal} ` +
          `(score: ${entity.targetScore.toFixed(2)})`
        );
        y += 16;
      }
    }
  }

  private addDebugText(x: number, y: number, text: string): void {
    const t = this.add.text(x, y, text, {
      fontSize: '11px',
      fontFamily: 'monospace',
      color: '#00FF88',
      backgroundColor: '#000000AA',
      padding: { x: 4, y: 2 },
    }).setScrollFactor(0).setDepth(DEPTH.OVERLAY + 10);
    this.debugTexts.push(t);
  }

  private clearDebug(): void {
    this.debugTexts.forEach(t => t.destroy());
    this.debugTexts = [];
  }

  // ---- CLEANUP ----
  shutdown(): void {
    (this as any)._levelComplete = false;
    this.audioManager.stopMusic();
    this.entities.forEach(e => e.destroy());
    this.entities = [];
    this.behaviorSystem.destroy();
    this.interactionSystem?.destroy();
    this.clearDebug();
  }
}
