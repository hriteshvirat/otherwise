// ============================================================
// OTHERWISE — Base Entity
// Supports Multi-Concept assignment (up to 2), visual cues, and state changes
// ============================================================
import Phaser from 'phaser';
import { EntityDefinition } from '../data/EntityDefinitions';
import { ConceptDefinition } from '../data/ConceptData';
import { DEPTH } from '../../utils/Constants';

export class BaseEntity {
  public scene: Phaser.Scene;
  public sprite: Phaser.Physics.Arcade.Sprite;
  public body: Phaser.Physics.Arcade.Body;
  public definition: EntityDefinition;
  public tags: string[];

  // Multi-Concept State (up to 2 concepts)
  public appliedConcepts: ConceptDefinition[] = [];
  public get appliedConcept(): ConceptDefinition | null {
    return this.appliedConcepts.length > 0 ? this.appliedConcepts[0] : null;
  }
  public get secondaryConcept(): ConceptDefinition | null {
    return this.appliedConcepts.length > 1 ? this.appliedConcepts[1] : null;
  }

  // Behavior state
  public currentTarget: BaseEntity | Phaser.Physics.Arcade.Sprite | null = null;
  public currentGoal: string = 'idle';
  public targetScore = 0;

  // Visual state
  private auraGraphics: Phaser.GameObjects.Graphics | null = null;
  private conceptIcons: Phaser.GameObjects.Image[] = [];
  private animTimer = 0;
  public initialX = 0;
  public initialY = 0;

  // Interactive & State
  public isActivated = false;
  public linkedEntities: BaseEntity[] = [];
  public onActivate: ((entity: BaseEntity) => void) | null = null;
  public onDeactivate: ((entity: BaseEntity) => void) | null = null;

  // Unique ID
  public readonly entityId: string;
  private static nextId = 0;

  constructor(scene: Phaser.Scene, x: number, y: number, definition: EntityDefinition) {
    this.entityId = `entity_${BaseEntity.nextId++}`;
    this.scene = scene;
    this.definition = definition;
    this.tags = [...definition.tags];
    this.initialX = x;
    this.initialY = y;

    // Create sprite
    this.sprite = scene.physics.add.sprite(x, y, definition.textureKey);
    this.sprite.setOrigin(0.5, 0.5);
    this.sprite.setDepth(DEPTH.ENTITIES);
    this.sprite.setData('entity', this);

    this.body = this.sprite.body as Phaser.Physics.Arcade.Body;

    // Setup physics
    if (definition.hasPhysics) {
      this.body.setCollideWorldBounds(false);
      this.body.setBounce(0, 0);
      this.body.setDrag(1200, 0);
      this.body.setDamping(false);
      if (definition.mass >= 10) {
        this.body.setImmovable(true);
      }
    } else {
      this.body.setImmovable(true);
      this.body.setAllowGravity(false);
    }
  }

  /** Apply a concept to this entity (supports up to 2 concepts) */
  applyConcept(concept: ConceptDefinition): boolean {
    const compatible = concept.compatibleTags.some(tag => this.tags.includes(tag));
    if (!compatible) return false;

    // If already has this concept, return true
    if (this.appliedConcepts.some(c => c.id === concept.id)) return true;

    // Add concept (shift out oldest if more than 2)
    if (this.appliedConcepts.length >= 2) {
      this.appliedConcepts.shift();
    }
    this.appliedConcepts.push(concept);

    // Apply special state adjustments
    if (concept.id === 'stubborn' || concept.id === 'sleepy') {
      this.body.setImmovable(true);
      this.body.setVelocity(0, 0);
    } else if (this.definition.mass < 10) {
      this.body.setImmovable(false);
    }

    // Visual feedback
    this.showConceptApplication(concept);
    return true;
  }

  /** Clear all concepts */
  removeConcept(): void {
    this.appliedConcepts = [];
    this.currentTarget = null;
    this.currentGoal = 'idle';

    if (this.auraGraphics) {
      this.auraGraphics.destroy();
      this.auraGraphics = null;
    }
    this.conceptIcons.forEach(icon => icon.destroy());
    this.conceptIcons = [];
    this.sprite.clearTint();

    if (this.definition.mass < 10 && this.definition.hasPhysics) {
      this.body.setImmovable(false);
      this.body.setVelocity(0, 0);
    }
  }

  /** Update per frame */
  update(delta: number): void {
    this.animTimer += delta;

    if (this.appliedConcepts.length > 0) {
      this.updateConceptVisuals(delta);
    }

    // Creature walking animation
    if (this.definition.type === 'creature') {
      const moving = this.body && Math.abs(this.body.velocity.x) > 5;
      if (moving) {
        this.sprite.setRotation(Math.sin(this.animTimer * 0.015) * 0.15);
      }
    }

    // Machine gear bobbing
    if (this.definition.type === 'machine') {
      this.sprite.setRotation(this.animTimer * 0.002);
    }

    // Collectibles & Food floating
    if (this.definition.type === 'collectible' || this.definition.type === 'food') {
      this.sprite.y = this.initialY + Math.sin(this.animTimer * 0.004) * 4;
    }
  }

  /** Show concept application particle effect */
  private showConceptApplication(concept: ConceptDefinition): void {
    const emitter = this.scene.add.particles(
      this.sprite.x,
      this.sprite.y,
      'glow',
      {
        speed: { min: 30, max: 100 },
        angle: { min: 0, max: 360 },
        scale: { start: 0.5, end: 0 },
        alpha: { start: 0.8, end: 0 },
        lifespan: 600,
        quantity: 12,
        tint: concept.visualStyle.particleColor,
      }
    );
    emitter.explode(12);
    this.scene.time.delayedCall(700, () => emitter.destroy());

    this.sprite.setTint(concept.visualStyle.glowColor);
    this.scene.time.delayedCall(300, () => {
      this.sprite.setTint(concept.visualStyle.tintColor);
    });

    if (this.auraGraphics) this.auraGraphics.destroy();
    this.auraGraphics = this.scene.add.graphics();
    this.auraGraphics.setDepth(DEPTH.ENTITIES - 1);

    // Recreate concept icons floating above
    this.conceptIcons.forEach(icon => icon.destroy());
    this.conceptIcons = [];

    this.appliedConcepts.forEach((c, idx) => {
      const offset = (idx - (this.appliedConcepts.length - 1) / 2) * 22;
      const icon = this.scene.add.image(
        this.sprite.x + offset,
        this.sprite.y - 30,
        c.icon
      ).setDepth(DEPTH.ENTITIES + 1).setScale(0.65).setAlpha(0.85);
      this.conceptIcons.push(icon);
    });

    this.scene.tweens.add({
      targets: this.sprite,
      scaleX: 1.25,
      scaleY: 0.75,
      duration: 120,
      yoyo: true,
      ease: 'Sine.easeOut',
    });
  }

  /** Update concept-specific visuals */
  private updateConceptVisuals(delta: number): void {
    if (this.appliedConcepts.length === 0 || !this.auraGraphics) return;

    const primary = this.appliedConcepts[0];
    const t = this.animTimer / 1000;

    this.auraGraphics.clear();
    const pulseRadius = 24 + Math.sin(t * 3) * 4;
    const alpha = primary.visualStyle.auraIntensity * (0.15 + 0.1 * Math.sin(t * 2));
    this.auraGraphics.fillStyle(primary.visualStyle.glowColor, alpha);
    this.auraGraphics.fillCircle(this.sprite.x, this.sprite.y, pulseRadius);

    if (this.secondaryConcept) {
      this.auraGraphics.fillStyle(this.secondaryConcept.visualStyle.glowColor, alpha * 0.7);
      this.auraGraphics.fillCircle(this.sprite.x, this.sprite.y, pulseRadius * 0.7);
    }

    // Update floating icons
    this.conceptIcons.forEach((icon, idx) => {
      const offset = (idx - (this.appliedConcepts.length - 1) / 2) * 22;
      icon.setPosition(
        this.sprite.x + offset,
        this.sprite.y - 32 + Math.sin(t * 2.5 + idx) * 3
      );
    });

    // Idle animations based on concept
    switch (primary.visualStyle.idleAnimation) {
      case 'tremble':
        this.sprite.setRotation(Math.sin(t * 22) * 0.04);
        break;
      case 'pulse':
        const scale = 1 + Math.sin(t * 2) * 0.05;
        this.sprite.setScale(scale);
        break;
      case 'bounce':
        const bounceT = Math.abs(Math.sin(t * 3));
        this.sprite.setScale(1 - bounceT * 0.06, 1 + bounceT * 0.06);
        break;
      case 'sway':
        this.sprite.setRotation(Math.sin(t * 1.5) * 0.1);
        break;
      case 'sleep':
        this.sprite.setScale(1.05, 0.9);
        break;
      case 'guard':
        this.sprite.setScale(1.1, 1.1);
        break;
      case 'mirror':
        this.sprite.setScale(Math.sign(this.sprite.scaleX || 1), 1);
        break;
    }
  }

  /** Check tag compatibility */
  hasTag(tag: string): boolean {
    return this.tags.includes(tag);
  }

  isCompatibleWith(concept: ConceptDefinition): boolean {
    return concept.compatibleTags.some(tag => this.tags.includes(tag));
  }

  distanceTo(other: BaseEntity | Phaser.Physics.Arcade.Sprite): number {
    const ox = other instanceof BaseEntity ? other.sprite.x : other.x;
    const oy = other instanceof BaseEntity ? other.sprite.y : other.y;
    return Phaser.Math.Distance.Between(this.sprite.x, this.sprite.y, ox, oy);
  }

  /** Activate entity mechanisms */
  activate(): void {
    if (this.isActivated) return;
    this.isActivated = true;

    if (this.definition.type === 'door') {
      this.scene.tweens.add({
        targets: this.sprite,
        y: this.initialY - 80,
        alpha: 0.35,
        duration: 500,
        ease: 'Cubic.easeOut',
      });
      this.body.checkCollision.none = true;
    } else if (this.definition.type === 'pressure_plate') {
      this.sprite.setTint(0x88CC44);
      this.sprite.setScale(1, 0.7);
    } else if (this.definition.type === 'button') {
      this.sprite.setTint(0x88CC44);
      this.sprite.setScale(0.9, 0.9);
    }

    if (this.onActivate) {
      this.onActivate(this);
    }

    this.linkedEntities.forEach(linked => linked.activate());
  }

  /** Deactivate entity */
  deactivate(): void {
    if (!this.isActivated) return;
    this.isActivated = false;

    if (this.definition.type === 'door') {
      this.scene.tweens.add({
        targets: this.sprite,
        y: this.initialY,
        alpha: 1.0,
        duration: 400,
        ease: 'Cubic.easeIn',
      });
      this.body.checkCollision.none = false;
    } else if (this.definition.type === 'pressure_plate') {
      this.sprite.clearTint();
      this.sprite.setScale(1, 1);
    } else if (this.definition.type === 'button') {
      this.sprite.clearTint();
      this.sprite.setScale(1, 1);
    }

    if (this.onDeactivate) {
      this.onDeactivate(this);
    }

    this.linkedEntities.forEach(linked => linked.deactivate());
  }

  toggle(): void {
    if (this.isActivated) this.deactivate();
    else this.activate();
  }

  destroy(): void {
    if (this.auraGraphics) this.auraGraphics.destroy();
    this.conceptIcons.forEach(icon => icon.destroy());
    this.conceptIcons = [];
    this.sprite.destroy();
  }
}
