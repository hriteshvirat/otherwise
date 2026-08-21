// ============================================================
// OTHERWISE — Camera Controller
// Smooth follow with look-ahead, level bounds, cinematic framing
// ============================================================
import Phaser from 'phaser';
import { CAMERA, GAME_WIDTH, GAME_HEIGHT } from '../../../utils/Constants';
import { lerp, clamp } from '../../../utils/MathUtils';

export class CameraController {
  private scene: Phaser.Scene;
  private camera: Phaser.Cameras.Scene2D.Camera;
  private target: Phaser.GameObjects.Sprite | null = null;

  // Smooth follow state
  private desiredX = 0;
  private desiredY = 0;
  private currentLookAhead = 0;

  // Level bounds
  private boundsLeft = 0;
  private boundsRight = 3000;
  private boundsTop = 0;
  private boundsBottom = 1200;

  // Cinematic
  private cinematicTarget: { x: number; y: number } | null = null;
  private cinematicDuration = 0;
  private cinematicTimer = 0;
  private cinematicCallback: (() => void) | null = null;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.camera = scene.cameras.main;
  }

  /** Set the target to follow */
  setTarget(sprite: Phaser.GameObjects.Sprite): void {
    this.target = sprite;
    this.desiredX = sprite.x;
    this.desiredY = sprite.y;
  }

  /** Set level bounds */
  setBounds(left: number, top: number, right: number, bottom: number): void {
    this.boundsLeft = left;
    this.boundsTop = top;
    this.boundsRight = right;
    this.boundsBottom = bottom;
    this.camera.setBounds(left, top, right - left, bottom - top);
  }

  /** Update per frame */
  update(delta: number): void {
    if (this.cinematicTarget) {
      this.updateCinematic(delta);
      return;
    }

    if (!this.target) return;

    // Look-ahead based on movement direction
    const body = this.target.body as Phaser.Physics.Arcade.Body;
    let targetLookAhead = 0;
    if (body) {
      if (body.velocity.x > 30) targetLookAhead = CAMERA.LOOK_AHEAD;
      else if (body.velocity.x < -30) targetLookAhead = -CAMERA.LOOK_AHEAD;
    }
    this.currentLookAhead = lerp(this.currentLookAhead, targetLookAhead, 0.05);

    // Desired position with look-ahead and vertical offset
    this.desiredX = this.target.x + this.currentLookAhead;
    this.desiredY = this.target.y + CAMERA.VERTICAL_OFFSET;

    // Smooth follow with dead zone
    const dx = this.desiredX - this.camera.scrollX - GAME_WIDTH / 2;
    const dy = this.desiredY - this.camera.scrollY - GAME_HEIGHT / 2;

    if (Math.abs(dx) > CAMERA.DEAD_ZONE_WIDTH) {
      this.camera.scrollX = lerp(
        this.camera.scrollX,
        this.desiredX - GAME_WIDTH / 2,
        CAMERA.LERP
      );
    }

    if (Math.abs(dy) > CAMERA.DEAD_ZONE_HEIGHT) {
      this.camera.scrollY = lerp(
        this.camera.scrollY,
        this.desiredY - GAME_HEIGHT / 2,
        CAMERA.LERP
      );
    }
  }

  /** Pan camera to a point for a cinematic reveal */
  panTo(x: number, y: number, duration: number, callback?: () => void): void {
    this.cinematicTarget = { x, y };
    this.cinematicDuration = duration;
    this.cinematicTimer = 0;
    this.cinematicCallback = callback || null;
  }

  private updateCinematic(delta: number): void {
    if (!this.cinematicTarget) return;

    this.cinematicTimer += delta;
    const t = clamp(this.cinematicTimer / this.cinematicDuration, 0, 1);

    // Ease in-out
    const eased = t < 0.5
      ? 2 * t * t
      : 1 - Math.pow(-2 * t + 2, 2) / 2;

    this.camera.scrollX = lerp(
      this.camera.scrollX,
      this.cinematicTarget.x - GAME_WIDTH / 2,
      eased * 0.1
    );
    this.camera.scrollY = lerp(
      this.camera.scrollY,
      this.cinematicTarget.y - GAME_HEIGHT / 2,
      eased * 0.1
    );

    if (this.cinematicTimer >= this.cinematicDuration) {
      this.cinematicTarget = null;
      if (this.cinematicCallback) {
        this.cinematicCallback();
      }
    }
  }

  /** Shake the camera (respects reduced motion setting) */
  shake(duration: number = 200, intensity: number = 0.005): void {
    // Check reduced motion setting
    const settings = localStorage.getItem('otherwise_settings');
    if (settings) {
      const parsed = JSON.parse(settings);
      if (parsed.reducedMotion) return;
    }
    this.camera.shake(duration, intensity);
  }

  /** Flash the camera */
  flash(duration: number = 200, r: number = 255, g: number = 255, b: number = 255): void {
    this.camera.flash(duration, r, g, b, false, undefined, this);
  }
}
