// ============================================================
// OTHERWISE — Interaction System
// Handles player→entity interactions (concept application, buttons, etc.)
// ============================================================
import Phaser from 'phaser';
import { BaseEntity } from '../../entities/BaseEntity';
import { ConceptManager } from '../concepts/ConceptManager';
import { PlayerController } from '../physics/PlayerController';
import { AudioManager } from '../audio/AudioManager';
import { SaveManager } from '../save/SaveManager';
import { COLORS, DEPTH } from '../../../utils/Constants';
import { dist, hexToString } from '../../../utils/MathUtils';

const INTERACT_RANGE = 65;

export class InteractionSystem {
  private scene: Phaser.Scene;
  private player: PlayerController;
  private conceptManager: ConceptManager;
  private audioManager: AudioManager;
  private saveManager: SaveManager;
  private entities: BaseEntity[] = [];

  // UI elements
  private promptBg: Phaser.GameObjects.Image | null = null;
  private promptText: Phaser.GameObjects.Text | null = null;
  private currentTarget: BaseEntity | null = null;

  constructor(
    scene: Phaser.Scene,
    player: PlayerController,
    conceptManager: ConceptManager,
    audioManager: AudioManager,
    saveManager: SaveManager
  ) {
    this.scene = scene;
    this.player = player;
    this.conceptManager = conceptManager;
    this.audioManager = audioManager;
    this.saveManager = saveManager;

    // Create interaction prompt UI
    this.promptBg = scene.add.image(0, 0, 'interact_prompt_bg')
      .setDepth(DEPTH.UI)
      .setVisible(false)
      .setScale(1.2);

    this.promptText = scene.add.text(0, 0, 'E', {
      fontSize: '14px',
      fontFamily: 'Georgia, serif',
      color: hexToString(COLORS.UI_ACCENT),
      fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(DEPTH.UI + 1).setVisible(false);

    // Set up player interact callback
    this.player.onInteract = () => this.tryInteract();
  }

  /** Register an entity */
  addEntity(entity: BaseEntity): void {
    this.entities.push(entity);
  }

  /** Remove an entity */
  removeEntity(entity: BaseEntity): void {
    this.entities = this.entities.filter(e => e !== entity);
  }

  /** Update per frame — find nearest interactable */
  update(): void {
    const pos = this.player.getPosition();
    let nearest: BaseEntity | null = null;
    let nearestDist = INTERACT_RANGE;

    for (const entity of this.entities) {
      if (!entity.definition.isInteractable) continue;

      const d = dist(pos.x, pos.y, entity.sprite.x, entity.sprite.y);
      if (d < nearestDist) {
        nearestDist = d;
        nearest = entity;
      }
    }

    this.currentTarget = nearest;

    // Show/hide prompt
    if (nearest && this.promptBg && this.promptText) {
      this.promptBg.setPosition(nearest.sprite.x, nearest.sprite.y - 40);
      this.promptText.setPosition(nearest.sprite.x, nearest.sprite.y - 40);
      this.promptBg.setVisible(true);
      this.promptText.setVisible(true);

      // Pulse the prompt
      const pulse = 0.9 + Math.sin(this.scene.time.now * 0.005) * 0.1;
      this.promptBg.setScale(pulse * 1.2);
    } else {
      if (this.promptBg) this.promptBg.setVisible(false);
      if (this.promptText) this.promptText.setVisible(false);
    }
  }

  /** Try to interact with nearest entity */
  private tryInteract(): void {
    if (!this.currentTarget) return;

    // Direct button toggle
    if (this.currentTarget.definition.type === 'button') {
      this.currentTarget.toggle();
      this.audioManager.playSfx('switch');
      this.showHint(this.currentTarget.isActivated ? 'Activated' : 'Deactivated');
      return;
    }

    const equipped = this.conceptManager.getEquippedConcept();
    if (!equipped) {
      // No concept equipped — show hint
      this.showHint('No concept equipped (Press Q to select)');
      this.audioManager.playSfx('ui_hover');
      return;
    }

    // Try to apply concept
    const success = this.currentTarget.applyConcept(equipped);
    if (success) {
      this.showConceptAppliedFeedback(this.currentTarget, equipped.name);
      this.audioManager.playSfx('concept_applied');
      this.audioManager.playSfx(equipped.audioCue);

      // Record Journal Discovery
      const discoveryKey = `${equipped.id}_${this.currentTarget.definition.type}`;
      this.saveManager.addDiscovery(discoveryKey);
    } else {
      this.showHint('Not compatible with this object');
      this.audioManager.playSfx('ui_hover');
    }
  }

  /** Show a brief hint text */
  private showHint(text: string): void {
    const hint = this.scene.add.text(
      this.player.sprite.x,
      this.player.sprite.y - 50,
      text,
      {
        fontSize: '13px',
        fontFamily: 'Georgia, serif',
        color: hexToString(COLORS.UI_TEXT_DIM),
        backgroundColor: '#1A1425AA',
        padding: { x: 6, y: 3 },
      }
    ).setOrigin(0.5).setDepth(DEPTH.UI);

    this.scene.tweens.add({
      targets: hint,
      y: hint.y - 20,
      alpha: 0,
      duration: 1200,
      onComplete: () => hint.destroy(),
    });
  }

  /** Show feedback when concept is applied */
  private showConceptAppliedFeedback(entity: BaseEntity, conceptName: string): void {
    const text = this.scene.add.text(
      entity.sprite.x,
      entity.sprite.y - 45,
      conceptName,
      {
        fontSize: '16px',
        fontFamily: 'Georgia, serif',
        color: hexToString(COLORS.DISCOVERY),
        fontStyle: 'bold',
        backgroundColor: '#1A1425DD',
        padding: { x: 8, y: 4 },
      }
    ).setOrigin(0.5).setDepth(DEPTH.UI);

    this.scene.tweens.add({
      targets: text,
      y: text.y - 35,
      alpha: 0,
      duration: 1400,
      ease: 'Sine.easeOut',
      onComplete: () => text.destroy(),
    });
  }

  /** Clean up */
  destroy(): void {
    if (this.promptBg) this.promptBg.destroy();
    if (this.promptText) this.promptText.destroy();
    this.entities = [];
  }
}
