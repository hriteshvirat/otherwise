// ============================================================
// OTHERWISE — Behavior System
// Multi-Concept perceive → evaluate → score → select → execute pipeline
// Supports all 13 Concepts with multi-concept combinations and synergies
// ============================================================
import Phaser from 'phaser';
import { BaseEntity } from '../../entities/BaseEntity';
import { ConceptDefinition } from '../../data/ConceptData';
import { SaveManager } from '../save/SaveManager';
import { BEHAVIOR } from '../../../utils/Constants';
import { dist, clamp } from '../../../utils/MathUtils';

interface ScoredTarget {
  entity: BaseEntity | Phaser.Physics.Arcade.Sprite;
  score: number;
  distance: number;
  tags: string[];
  valence: number;
}

export class BehaviorSystem {
  private scene: Phaser.Scene;
  private entities: BaseEntity[] = [];
  private playerSprite: Phaser.Physics.Arcade.Sprite | null = null;
  private updateTimer = 0;
  private groundGroup: Phaser.Physics.Arcade.StaticGroup | null = null;
  private saveManager: SaveManager | null = null;

  constructor(scene: Phaser.Scene, saveManager?: SaveManager) {
    this.scene = scene;
    this.saveManager = saveManager || null;
  }

  setSaveManager(sm: SaveManager): void {
    this.saveManager = sm;
  }

  setPlayer(sprite: Phaser.Physics.Arcade.Sprite): void {
    this.playerSprite = sprite;
  }

  setGroundGroup(group: Phaser.Physics.Arcade.StaticGroup): void {
    this.groundGroup = group;
  }

  addEntity(entity: BaseEntity): void {
    this.entities.push(entity);
  }

  removeEntity(entity: BaseEntity): void {
    this.entities = this.entities.filter(e => e !== entity);
  }

  update(delta: number): void {
    this.updateTimer += delta;

    if (this.updateTimer < BEHAVIOR.UPDATE_INTERVAL) return;
    this.updateTimer = 0;

    for (const entity of this.entities) {
      if (entity.appliedConcepts.length === 0) continue;
      this.processEntity(entity);
    }
  }

  /** Process entity through multi-concept pipeline */
  private processEntity(entity: BaseEntity): void {
    const primaryConcept = entity.appliedConcepts[0];
    const secondaryConcept = entity.appliedConcepts.length > 1 ? entity.appliedConcepts[1] : null;

    // 1. PERCEIVE
    const perceived = this.perceive(entity, primaryConcept, secondaryConcept);

    // 2. EVALUATE & SCORE (Combines rules from all active concepts)
    const scored = this.evaluate(entity, primaryConcept, secondaryConcept, perceived);

    // 3. SELECT GOAL
    const selected = this.selectGoal(scored);

    // 4. EXECUTE
    if (selected) {
      entity.currentTarget = selected.entity;
      entity.targetScore = selected.score;
      entity.currentGoal = selected.valence > 0 ? 'approach' : 'flee';
      this.execute(entity, primaryConcept, secondaryConcept, selected);

      // Track discoveries in SaveManager
      if (this.saveManager) {
        if (selected.tags.includes('player')) {
          if (primaryConcept.id === 'fear' || secondaryConcept?.id === 'fear') this.saveManager.addDiscovery('fear_player');
          if (primaryConcept.id === 'curious' || secondaryConcept?.id === 'curious') this.saveManager.addDiscovery('curious_player');
          if (primaryConcept.id === 'trust' || secondaryConcept?.id === 'trust') this.saveManager.addDiscovery('trust_player');
        }
      }
    } else {
      entity.currentTarget = null;
      entity.currentGoal = 'idle';
      this.executeIdle(entity, primaryConcept);
    }
  }

  // ---- PERCEIVE ----
  private perceive(
    entity: BaseEntity,
    primary: ConceptDefinition,
    secondary: ConceptDefinition | null
  ): ScoredTarget[] {
    const targets: ScoredTarget[] = [];

    for (const other of this.entities) {
      if (other === entity) continue;
      const d = entity.distanceTo(other);
      if (d > BEHAVIOR.PERCEPTION_RADIUS) continue;

      targets.push({
        entity: other,
        score: 0,
        distance: d,
        tags: other.tags,
        valence: 0,
      });
    }

    if (this.playerSprite) {
      const d = dist(
        entity.sprite.x, entity.sprite.y,
        this.playerSprite.x, this.playerSprite.y
      );
      if (d < BEHAVIOR.PERCEPTION_RADIUS) {
        targets.push({
          entity: this.playerSprite,
          score: 0,
          distance: d,
          tags: ['player', 'living'],
          valence: 0,
        });
      }
    }

    return targets;
  }

  // ---- EVALUATE ----
  private evaluate(
    entity: BaseEntity,
    primary: ConceptDefinition,
    secondary: ConceptDefinition | null,
    targets: ScoredTarget[]
  ): ScoredTarget[] {
    const rules = [...primary.perceptionRules];
    if (secondary) {
      rules.push(...secondary.perceptionRules.map(r => ({ ...r, weight: r.weight * 0.75 })));
    }

    for (const target of targets) {
      let totalScore = 0;
      let totalValence = 0;

      for (const rule of rules) {
        const matches = rule.targetTags.some(tag => target.tags.includes(tag));
        if (!matches) continue;
        if (target.distance > rule.range) continue;

        const distanceFactor = 1 - clamp(target.distance / rule.range, 0, 1);
        const ruleScore = rule.weight * distanceFactor;
        totalScore += ruleScore;
        totalValence += rule.valence * ruleScore;
      }

      // Contextual multipliers
      if (target.entity instanceof BaseEntity) {
        const other = target.entity as BaseEntity;
        // Lonely bonus
        if ((primary.id === 'lonely' || secondary?.id === 'lonely') && other.definition.type === entity.definition.type) {
          totalScore *= 1.4;
        }
        // Curious novelty bonus for moving objects
        if ((primary.id === 'curious' || secondary?.id === 'curious') && other.body) {
          if (Math.abs(other.body.velocity.x) > 5 || Math.abs(other.body.velocity.y) > 5) {
            totalScore *= 2.0;
          }
        }
        // Greedy bonus for valuable collectibles
        if ((primary.id === 'greedy' || secondary?.id === 'greedy') && other.hasTag('valuable')) {
          totalScore *= 2.5;
        }
      }

      target.score = totalScore;
      target.valence = totalValence > 0 ? 1 : totalValence < 0 ? -1 : 0;
    }

    return targets;
  }

  // ---- SELECT ----
  private selectGoal(targets: ScoredTarget[]): ScoredTarget | null {
    if (targets.length === 0) return null;
    targets.sort((a, b) => b.score - a.score);
    const meaningful = targets.filter(t => t.score > 0.1);
    return meaningful.length > 0 ? meaningful[0] : null;
  }

  // ---- EXECUTE ----
  private execute(
    entity: BaseEntity,
    primary: ConceptDefinition,
    secondary: ConceptDefinition | null,
    target: ScoredTarget
  ): void {
    const body = entity.body;
    if (!body || body.immovable) return;

    const targetX = target.entity instanceof BaseEntity
      ? target.entity.sprite.x
      : (target.entity as Phaser.Physics.Arcade.Sprite).x;
    const targetY = target.entity instanceof BaseEntity
      ? target.entity.sprite.y
      : (target.entity as Phaser.Physics.Arcade.Sprite).y;

    const dx = targetX - entity.sprite.x;
    const dy = targetY - entity.sprite.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    if (distance < 1) return;

    const speed = BEHAVIOR.MOVE_SPEED * primary.movementRules.speedMultiplier;
    const nx = dx / distance;
    const rules = primary.movementRules;
    const erratic = (Math.random() - 0.5) * rules.erraticness * speed;

    // Movement mode branching
    switch (rules.approachMode) {
      case 'approach': {
        if (distance > rules.minDistance) {
          body.setVelocityX(nx * speed + erratic);
        } else {
          body.setVelocityX(body.velocity.x * 0.85);
        }
        break;
      }
      case 'flee': {
        if (distance < rules.minDistance) {
          body.setVelocityX(-nx * speed * 1.5 + erratic);
        } else if (distance < rules.maxDistance) {
          body.setVelocityX(-nx * speed * 0.85 + erratic);
        } else {
          body.setVelocityX(body.velocity.x * 0.9);
        }
        break;
      }
      case 'shield': {
        // Position between player and danger
        if (this.playerSprite) {
          const midX = (this.playerSprite.x + targetX) / 2;
          const shieldDx = midX - entity.sprite.x;
          if (Math.abs(shieldDx) > 10) {
            body.setVelocityX(Math.sign(shieldDx) * speed);
          } else {
            body.setVelocityX(0);
          }
        }
        break;
      }
      case 'mimic': {
        // Mirror target's movement
        if (this.playerSprite && this.playerSprite.body) {
          const playerVX = (this.playerSprite.body as Phaser.Physics.Arcade.Body).velocity.x;
          body.setVelocityX(playerVX * 0.95);
        }
        break;
      }
      case 'anchor': {
        body.setVelocityX(0);
        break;
      }
      case 'orbit': {
        const perpX = -dy / distance;
        body.setVelocityX(perpX * speed);
        break;
      }
    }

    // Small obstacle hop if blocked on ground
    const isGrounded = body.blocked.down || body.touching.down;
    const isSideBlocked = body.blocked.left || body.blocked.right || body.touching.left || body.touching.right;
    if (isGrounded && isSideBlocked && Math.abs(body.velocity.x) > 10) {
      body.setVelocityY(-210);
    }
  }

  private executeIdle(entity: BaseEntity, primary: ConceptDefinition): void {
    const body = entity.body;
    if (!body || body.immovable) return;

    if (primary.id === 'repeat') {
      // Periodic pendulum oscillation for repeat concept
      const t = this.scene.time.now / 1000;
      body.setVelocityX(Math.sin(t * 2) * BEHAVIOR.MOVE_SPEED);
    } else {
      body.setVelocityX(body.velocity.x * 0.92);
    }
  }

  getEntities(): BaseEntity[] {
    return this.entities;
  }

  findByTag(tag: string): BaseEntity[] {
    return this.entities.filter(e => e.hasTag(tag));
  }

  findNearest(x: number, y: number, tag?: string): BaseEntity | null {
    let nearest: BaseEntity | null = null;
    let nearestDist = Infinity;

    for (const entity of this.entities) {
      if (tag && !entity.hasTag(tag)) continue;
      const d = dist(x, y, entity.sprite.x, entity.sprite.y);
      if (d < nearestDist) {
        nearestDist = d;
        nearest = entity;
      }
    }

    return nearest;
  }

  destroy(): void {
    this.entities = [];
    this.playerSprite = null;
  }
}
