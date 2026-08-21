// ============================================================
// OTHERWISE — Camera Controller
// Smooth follow with deadzone, level bounds, and cinematic framing
// ============================================================
import Phaser from 'phaser';
import { CAMERA, GAME_WIDTH, GAME_HEIGHT } from '../../../utils/Constants';
import { clamp, lerp } from '../../../utils/MathUtils';

export class CameraController {
  private scene: Phaser.Scene;
  private camera: Phaser.Cameras.Scene2D.Camera;
  private target: Phaser.GameObjects.Sprite | null = null;

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
    this.camera.startFollow(
      sprite,
      true,
      CAMERA.LERP,
      CAMERA.LERP,
      0,
      CAMERA.VERTICAL_OFFSET
    );
    this.camera.setDeadzone(CAMERA.DEAD_ZONE_WIDTH * 2, CAMERA.DEAD_ZONE_HEIGHT * 2);
  }

  /** Set level bounds */
  setBounds(left: number, top: number, right: number, bottom: number): void {
    this.boundsLeft = left;
    this.boundsTop = top;
    this.boundsRight = right;
    this.boundsBottom = bottom;
    const width = Math.max(GAME_WIDTH, right - left);
    const height = Math.max(GAME_HEIGHT, bottom - top);
    this.camera.setBounds(left, top, width, height);
  }

  /** Update per frame */
  update(delta: number): void {
    if (this.cinematicTarget) {
      this.updateCinematic(delta);
    }
  }

  /** Pan camera to a point for a cinematic reveal */
  panTo(x: number, y: number, duration: number, callback?: () => void): void {
    this.camera.stopFollow();
    this.cinematicTarget = { x, y };
    this.cinematicDuration = duration;
    this.cinematicTimer = 0;
    this.cinematicCallback = callback || null;
  }

  private updateCinematic(delta: number): void {
    if (!this.cinematicTarget) return;

    this.cinematicTimer += delta;
    const t = clamp(this.cinematicTimer / this.cinematicDuration, 0, 1);

    // Ease in-out cubic
    const eased = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

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
      if (this.target) {
        this.camera.startFollow(
          this.target,
          true,
          CAMERA.LERP,
          CAMERA.LERP,
          0,
          CAMERA.VERTICAL_OFFSET
        );
      }
      if (this.cinematicCallback) {
        this.cinematicCallback();
      }
    }
  }

  /** Shake the camera (respects reduced motion setting) */
  shake(duration: number = 200, intensity: number = 0.005): void {
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
