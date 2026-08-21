// ============================================================
// OTHERWISE — Base Entity
// Foundation for all world objects with concept support & interactive states
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

  // Concept state
  public appliedConcept: ConceptDefinition | null = null;
  public conceptJustApplied = false;

  // Behavior state (set by BehaviorSystem)
  public currentTarget: BaseEntity | Phaser.Physics.Arcade.Sprite | null = null;
  public currentGoal: string = 'idle';
  public targetScore = 0;

  // Visual state
  private auraGraphics: Phaser.GameObjects.Graphics | null = null;
  private conceptIcon: Phaser.GameObjects.Image | null = null;
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

    // Setup physics based on definition
    if (definition.hasPhysics) {
      this.body.setCollideWorldBounds(false);
      this.body.setBounce(0.1, 0.05);
      if (definition.mass >= 10) {
        this.body.setImmovable(true);
      }
    } else {
      this.body.setImmovable(true);
      this.body.setAllowGravity(false);
    }
  }

  /** Apply a concept to this entity */
  applyConcept(concept: ConceptDefinition): boolean {
    // Check compatibility
    const compatible = concept.compatibleTags.some(tag => this.tags.includes(tag));
    if (!compatible) return false;

    this.appliedConcept = concept;
    this.conceptJustApplied = true;

    // Visual feedback
    this.showConceptApplication(concept);

    return true;
  }

  /** Remove concept from this entity */
  removeConcept(): void {
    this.appliedConcept = null;
    this.currentTarget = null;
    this.currentGoal = 'idle';

    if (this.auraGraphics) {
      this.auraGraphics.destroy();
      this.auraGraphics = null;
    }
    if (this.conceptIcon) {
      this.conceptIcon.destroy();
      this.conceptIcon = null;
    }
    this.sprite.clearTint();
  }

  /** Update per frame */
  update(delta: number): void {
    this.animTimer += delta;

    if (this.appliedConcept) {
      this.updateConceptVisuals(delta);
    }

    // Creature idle walking animation
    if (this.definition.type === 'creature') {
      const moving = this.body && Math.abs(this.body.velocity.x) > 5;
      if (moving) {
        this.sprite.setRotation(Math.sin(this.animTimer * 0.015) * 0.15);
      }
    }

    // Collectible floating animation
    if (this.definition.type === 'collectible') {
      this.sprite.y = this.initialY + Math.sin(this.animTimer * 0.004) * 4;
    }
  }

  /** Show concept application effect */
  private showConceptApplication(concept: ConceptDefinition): void {
    // Burst particles
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
        quantity: 10,
        tint: concept.visualStyle.particleColor,
      }
    );
    emitter.explode(10);
    this.scene.time.delayedCall(700, () => emitter.destroy());

    // Flash tint
    this.sprite.setTint(concept.visualStyle.glowColor);
    this.scene.time.delayedCall(300, () => {
      this.sprite.setTint(concept.visualStyle.tintColor);
    });

    // Create persistent aura
    if (this.auraGraphics) this.auraGraphics.destroy();
    this.auraGraphics = this.scene.add.graphics();
    this.auraGraphics.setDepth(DEPTH.ENTITIES - 1);

    // Create concept icon floating above
    if (this.conceptIcon) this.conceptIcon.destroy();
    this.conceptIcon = this.scene.add.image(
      this.sprite.x,
      this.sprite.y - 30,
      concept.icon
    ).setDepth(DEPTH.ENTITIES + 1).setScale(0.6).setAlpha(0.7);

    // Scale pop
    this.scene.tweens.add({
      targets: this.sprite,
      scaleX: 1.3,
      scaleY: 0.7,
      duration: 100,
      yoyo: true,
      ease: 'Sine.easeOut',
    });
  }

  /** Update concept-specific visuals per frame */
  private updateConceptVisuals(delta: number): void {
    if (!this.appliedConcept || !this.auraGraphics) return;

    const style = this.appliedConcept.visualStyle;
    const t = this.animTimer / 1000;

    // Update aura position with sprite
    this.auraGraphics.clear();
    const pulseRadius = 24 + Math.sin(t * 3) * 4;
    const alpha = style.auraIntensity * (0.15 + 0.1 * Math.sin(t * 2));
    this.auraGraphics.fillStyle(style.glowColor, alpha);
    this.auraGraphics.fillCircle(this.sprite.x, this.sprite.y, pulseRadius);

    // Update concept icon position
    if (this.conceptIcon) {
      this.conceptIcon.setPosition(
        this.sprite.x,
        this.sprite.y - 30 + Math.sin(t * 2) * 3
      );
    }

    // Idle animations based on concept (visual-only without breaking physics position)
    switch (style.idleAnimation) {
      case 'tremble':
        this.sprite.setRotation(Math.sin(t * 20) * 0.03);
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
    }
  }

  /** Check if this entity has a specific tag */
  hasTag(tag: string): boolean {
    return this.tags.includes(tag);
  }

  /** Check if compatible with a concept */
  isCompatibleWith(concept: ConceptDefinition): boolean {
    return concept.compatibleTags.some(tag => this.tags.includes(tag));
  }

  /** Get distance to another entity */
  distanceTo(other: BaseEntity | Phaser.Physics.Arcade.Sprite): number {
    const ox = other instanceof BaseEntity ? other.sprite.x : other.x;
    const oy = other instanceof BaseEntity ? other.sprite.y : other.y;
    return Phaser.Math.Distance.Between(this.sprite.x, this.sprite.y, ox, oy);
  }

  /** Activate this entity (e.g. door opens, plate depresses, button toggles) */
  activate(): void {
    if (this.isActivated) return;
    this.isActivated = true;

    // Specific entity activation logic
    if (this.definition.type === 'door') {
      // Door slides up and opens path
      this.scene.tweens.add({
        targets: this.sprite,
        y: this.initialY - 80,
        alpha: 0.4,
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

    // Notify linked entities
    this.linkedEntities.forEach(linked => linked.activate());
  }

  /** Deactivate this entity */
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

    // Notify linked entities
    this.linkedEntities.forEach(linked => linked.deactivate());
  }

  /** Toggle activation state */
  toggle(): void {
    if (this.isActivated) {
      this.deactivate();
    } else {
      this.activate();
    }
  }

  /** Clean up */
  destroy(): void {
    if (this.auraGraphics) this.auraGraphics.destroy();
    if (this.conceptIcon) this.conceptIcon.destroy();
    this.sprite.destroy();
  }
}
