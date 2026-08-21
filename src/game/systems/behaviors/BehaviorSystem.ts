// ============================================================
// OTHERWISE — Behavior System
// Generic perceive → evaluate → score → select → execute pipeline
// Concepts drive behavior through data, never through if/else per level
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
  valence: number; // +1 approach, -1 flee
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

  /** Set SaveManager for discovery tracking */
  setSaveManager(sm: SaveManager): void {
    this.saveManager = sm;
  }

  /** Register the player sprite so entities can perceive it */
  setPlayer(sprite: Phaser.Physics.Arcade.Sprite): void {
    this.playerSprite = sprite;
  }

  /** Set ground group for collision */
  setGroundGroup(group: Phaser.Physics.Arcade.StaticGroup): void {
    this.groundGroup = group;
  }

  /** Add an entity to the behavior system */
  addEntity(entity: BaseEntity): void {
    this.entities.push(entity);
  }

  /** Remove an entity from the behavior system */
  removeEntity(entity: BaseEntity): void {
    this.entities = this.entities.filter(e => e !== entity);
  }

  /** Update all entities with concepts — called every frame */
  update(delta: number): void {
    this.updateTimer += delta;

    // AI ticks happen at fixed intervals
    if (this.updateTimer < BEHAVIOR.UPDATE_INTERVAL) return;
    this.updateTimer = 0;

    for (const entity of this.entities) {
      if (!entity.appliedConcept) continue;
      this.processEntity(entity);
    }
  }

  /** Process one entity through the full behavior pipeline */
  private processEntity(entity: BaseEntity): void {
    const concept = entity.appliedConcept!;

    // 1. PERCEIVE — gather nearby entities/targets
    const perceived = this.perceive(entity, concept);

    // 2. EVALUATE & SCORE — score each target based on concept rules
    const scored = this.evaluate(entity, concept, perceived);

    // 3. SELECT — pick the best target
    const selected = this.selectGoal(scored, concept);

    // 4. EXECUTE — move toward/away from target
    if (selected) {
      entity.currentTarget = selected.entity;
      entity.targetScore = selected.score;
      entity.currentGoal = selected.valence > 0 ? 'approach' : 'flee';
      this.execute(entity, concept, selected);

      // Track emergent discoveries
      if (this.saveManager) {
        if (selected.tags.includes('player')) {
          if (concept.id === 'fear') this.saveManager.addDiscovery('fear_player');
          if (concept.id === 'curious') this.saveManager.addDiscovery('curious_player');
        }
      }
    } else {
      entity.currentTarget = null;
      entity.currentGoal = 'idle';
      this.executeIdle(entity);
    }
  }

  // ---- PERCEIVE ----
  private perceive(entity: BaseEntity, concept: ConceptDefinition): ScoredTarget[] {
    const targets: ScoredTarget[] = [];

    // Check all other entities
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

    // Check player
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
    concept: ConceptDefinition,
    targets: ScoredTarget[]
  ): ScoredTarget[] {
    for (const target of targets) {
      let totalScore = 0;
      let totalValence = 0;

      for (const rule of concept.perceptionRules) {
        const matches = rule.targetTags.some(tag => target.tags.includes(tag));
        if (!matches) continue;
        if (target.distance > rule.range) continue;

        const distanceFactor = 1 - clamp(target.distance / rule.range, 0, 1);
        const ruleScore = rule.weight * distanceFactor;
        totalScore += ruleScore;
        totalValence += rule.valence * ruleScore;
      }

      // Bonus: prefer entities that already have the same concept (for LONELY)
      if (target.entity instanceof BaseEntity) {
        const other = target.entity as BaseEntity;
        if (other.appliedConcept && other.appliedConcept.id === concept.id) {
          totalScore *= 1.5;
        }
        // Bonus for matching entity types (LONELY rocks prefer other rocks)
        if (other.definition.type === entity.definition.type) {
          totalScore *= 1.3;
        }
      }

      // Novelty bonus for CURIOUS: recently moved entities are more interesting
      if (concept.id === 'curious' && target.entity instanceof BaseEntity) {
        const other = target.entity as BaseEntity;
        const body = other.body;
        if (body && (Math.abs(body.velocity.x) > 5 || Math.abs(body.velocity.y) > 5)) {
          totalScore *= 2.0;
        }
      }

      target.score = totalScore;
      target.valence = totalValence > 0 ? 1 : totalValence < 0 ? -1 : 0;
    }

    return targets;
  }

  // ---- SELECT ----
  private selectGoal(targets: ScoredTarget[], concept: ConceptDefinition): ScoredTarget | null {
    if (targets.length === 0) return null;

    targets.sort((a, b) => b.score - a.score);
    const meaningful = targets.filter(t => t.score > 0.1);
    if (meaningful.length === 0) return null;

    return meaningful[0];
  }

  // ---- EXECUTE ----
  private execute(entity: BaseEntity, concept: ConceptDefinition, target: ScoredTarget): void {
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

    const speed = BEHAVIOR.MOVE_SPEED * concept.movementRules.speedMultiplier;
    const nx = dx / distance;
    const rules = concept.movementRules;
    const erratic = (Math.random() - 0.5) * rules.erraticness * speed;

    switch (rules.approachMode) {
      case 'approach': {
        if (distance > rules.minDistance) {
          body.setVelocityX(nx * speed + erratic);
        } else {
          body.setVelocityX(body.velocity.x * 0.9);
        }
        break;
      }
      case 'flee': {
        if (distance < rules.minDistance) {
          body.setVelocityX(-nx * speed * 1.5 + erratic);
        } else if (distance < rules.maxDistance) {
          body.setVelocityX(-nx * speed * 0.8 + erratic);
        } else {
          body.setVelocityX(body.velocity.x * 0.95);
        }
        break;
      }
      case 'orbit': {
        const perpX = -dy / distance;
        const approachFactor = distance > rules.maxDistance ? 0.5 : distance < rules.minDistance ? -0.5 : 0;
        body.setVelocityX((perpX + nx * approachFactor) * speed + erratic);
        break;
      }
    }

    // Little hop if obstacle is encountered while grounded
    const isGrounded = body.blocked.down || body.touching.down;
    const isSideBlocked = body.blocked.left || body.blocked.right || body.touching.left || body.touching.right;
    if (isGrounded && isSideBlocked && Math.abs(body.velocity.x) > 10) {
      body.setVelocityY(-200);
    }
  }

  /** Idle behavior when no target found */
  private executeIdle(entity: BaseEntity): void {
    const body = entity.body;
    if (!body || body.immovable) return;
    body.setVelocityX(body.velocity.x * 0.95);
  }

  /** Get all entities */
  getEntities(): BaseEntity[] {
    return this.entities;
  }

  /** Find entities by tag */
  findByTag(tag: string): BaseEntity[] {
    return this.entities.filter(e => e.hasTag(tag));
  }

  /** Find nearest entity with tag */
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

  /** Clean up */
  destroy(): void {
    this.entities = [];
    this.playerSprite = null;
  }
}
