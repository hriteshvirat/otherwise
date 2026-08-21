// ============================================================
// OTHERWISE — Player Controller
// Separated input → state → physics pipeline
// Polished movement with coyote time, jump buffering, variable jump
// ============================================================
import Phaser from 'phaser';
import { PLAYER } from '../../../utils/Constants';
import { clamp, approach } from '../../../utils/MathUtils';

export type PlayerState = 'grounded' | 'moving' | 'airborne' | 'falling' | 'dead' | 'interacting';

export class PlayerController {
  // References
  private scene: Phaser.Scene;
  public sprite: Phaser.Physics.Arcade.Sprite;
  private body!: Phaser.Physics.Arcade.Body;

  // Cached input keys
  private cursors?: Phaser.Types.Input.Keyboard.CursorKeys;
  private keyA?: Phaser.Input.Keyboard.Key;
  private keyD?: Phaser.Input.Keyboard.Key;
  private keyW?: Phaser.Input.Keyboard.Key;
  private keyE?: Phaser.Input.Keyboard.Key;
  private keySpace?: Phaser.Input.Keyboard.Key;

  // Input state (raw)
  private inputLeft = false;
  private inputRight = false;
  private inputJump = false;
  private inputJumpJustPressed = false;
  private inputInteract = false;

  // Movement state
  public state: PlayerState = 'airborne';
  public facingRight = true;
  private velocityX = 0;

  // Jump state
  private isGrounded = false;
  private wasGrounded = false;
  private coyoteTimer = 0;
  private jumpBufferTimer = 0;
  private isJumping = false;
  private jumpHoldTimer = 0;
  private hasReleasedJump = true;

  // Animation
  private squashScale = 1;
  private stretchScale = 1;
  private eyeOffsetX = 0;
  private blinkTimer = 0;
  private isBlinking = false;

  // Callbacks
  public nearbyInteractable: Phaser.Physics.Arcade.Sprite | null = null;
  public onInteract: (() => void) | null = null;
  public onJump: (() => void) | null = null;
  public onLand: (() => void) | null = null;
  public onDie: (() => void) | null = null;

  // Death/respawn
  public spawnX = 0;
  public spawnY = 0;
  public isDead = false;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    this.scene = scene;
    this.spawnX = x;
    this.spawnY = y;

    // Create sprite
    this.sprite = scene.physics.add.sprite(x, y, 'player');
    this.sprite.setOrigin(0.5, 0.5);
    this.body = this.sprite.body as Phaser.Physics.Arcade.Body;

    // Physics body setup
    this.body.setSize(28, 32);
    this.body.setOffset(18, 20);
    this.body.setMaxVelocityY(PLAYER.MAX_FALL_SPEED);
    this.body.setBounce(0, 0);
    this.body.setFriction(0, 0);
    this.body.setCollideWorldBounds(false);

    // Cache input keys
    if (scene.input && scene.input.keyboard) {
      this.cursors = scene.input.keyboard.createCursorKeys();
      this.keyA = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
      this.keyD = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
      this.keyW = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
      this.keyE = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
      this.keySpace = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    }

    // Eye look direction
    this.blinkTimer = 2000 + Math.random() * 3000;
  }

  private previousVelocityY = 0;

  /** Call every frame with delta in ms */
  update(delta: number): void {
    if (this.isDead) return;

    const dt = delta / 1000;

    this.readInput();
    this.updateGroundState(delta);
    this.updateMovement(dt);
    this.updateJump(delta);
    this.updateAnimation(delta);
    this.updateState();
    this.checkDeathZone();
  }

  // ---- INPUT ----
  private readInput(): void {
    if (!this.cursors) return;

    const leftDown = this.cursors.left.isDown || (this.keyA ? this.keyA.isDown : false);
    const rightDown = this.cursors.right.isDown || (this.keyD ? this.keyD.isDown : false);
    const upJustPressed = Phaser.Input.Keyboard.JustDown(this.cursors.up) ||
      (this.keyW ? Phaser.Input.Keyboard.JustDown(this.keyW) : false) ||
      (this.keySpace ? Phaser.Input.Keyboard.JustDown(this.keySpace) : false);
    const upDown = this.cursors.up.isDown ||
      (this.keyW ? this.keyW.isDown : false) ||
      (this.keySpace ? this.keySpace.isDown : false);
    const interactPressed = this.keyE ? Phaser.Input.Keyboard.JustDown(this.keyE) : false;

    this.inputLeft = leftDown;
    this.inputRight = rightDown;
    this.inputJumpJustPressed = upJustPressed;
    this.inputJump = upDown;
    this.inputInteract = interactPressed;

    // Handle interaction
    if (this.inputInteract && this.onInteract) {
      this.onInteract();
    }
  }

  // ---- GROUND STATE ----
  private updateGroundState(delta: number): void {
    const isNowGrounded = this.body.blocked.down || this.body.touching.down;

    if (isNowGrounded) {
      this.coyoteTimer = PLAYER.COYOTE_TIME;
      if (!this.isGrounded && this.previousVelocityY > 60) {
        this.onLandHandler();
      }
      this.isGrounded = true;
    } else {
      this.isGrounded = false;
      this.coyoteTimer -= delta;
      if (this.coyoteTimer < 0) this.coyoteTimer = 0;
    }

    this.previousVelocityY = this.body.velocity.y;
  }

  private onLandHandler(): void {
    // Squash on landing
    this.squashScale = 0.85;
    this.stretchScale = 1.15;
    this.isJumping = false;

    // Emit landing particles
    this.emitLandingDust();

    if (this.onLand) {
      this.onLand();
    }
  }

  private emitLandingDust(): void {
    const emitter = this.scene.add.particles(
      this.sprite.x,
      this.sprite.y + 16,
      'particle',
      {
        speed: { min: 20, max: 60 },
        angle: { min: -150, max: -30 },
        scale: { start: 0.4, end: 0 },
        alpha: { start: 0.5, end: 0 },
        lifespan: 400,
        quantity: 6,
        tint: 0xC4B090,
        gravityY: 100,
      }
    );
    emitter.explode(6);
    this.scene.time.delayedCall(500, () => emitter.destroy());
  }

  // ---- MOVEMENT ----
  private updateMovement(dt: number): void {
    if (this.state === 'interacting') return;

    let targetVX = 0;

    if (this.inputLeft) {
      targetVX = -PLAYER.MOVE_SPEED;
      this.facingRight = false;
    }
    if (this.inputRight) {
      targetVX = PLAYER.MOVE_SPEED;
      this.facingRight = true;
    }

    // Choose acceleration based on ground/air
    const accel = this.isGrounded ? PLAYER.ACCELERATION : PLAYER.AIR_ACCELERATION;
    const decel = this.isGrounded ? PLAYER.DECELERATION : PLAYER.AIR_DECELERATION;

    // Apply acceleration/deceleration
    if (targetVX !== 0) {
      this.velocityX = approach(this.velocityX, targetVX, accel, dt);
    } else {
      this.velocityX = approach(this.velocityX, 0, decel, dt);
    }

    this.body.setVelocityX(this.velocityX);

    // Eye look direction
    if (targetVX !== 0) {
      this.eyeOffsetX = this.facingRight ? 2 : -2;
    }
  }

  // ---- JUMP ----
  private updateJump(delta: number): void {
    if (this.state === 'interacting') return;

    // Jump buffer
    if (this.inputJumpJustPressed) {
      this.jumpBufferTimer = PLAYER.JUMP_BUFFER;
      this.hasReleasedJump = false;
    }
    this.jumpBufferTimer -= delta;
    if (this.jumpBufferTimer < 0) this.jumpBufferTimer = 0;

    // Track jump release for variable height
    if (!this.inputJump) {
      this.hasReleasedJump = true;
    }

    // Can we jump?
    const canJump = this.coyoteTimer > 0 && this.jumpBufferTimer > 0 && this.hasReleasedJump;

    if (canJump || (this.inputJumpJustPressed && this.coyoteTimer > 0)) {
      this.executeJump();
    }

    // Variable jump height - hold to go higher
    if (this.isJumping && this.inputJump && this.jumpHoldTimer > 0) {
      this.jumpHoldTimer -= delta;
      this.body.setVelocityY(this.body.velocity.y + PLAYER.JUMP_HOLD_FORCE);
    }

    // Cut jump short when releasing
    if (this.isJumping && this.hasReleasedJump && this.body.velocity.y < 0) {
      this.body.setVelocityY(this.body.velocity.y * 0.65);
      this.isJumping = false;
    }
  }

  private executeJump(): void {
    this.body.setVelocityY(PLAYER.JUMP_VELOCITY);
    this.isJumping = true;
    this.jumpHoldTimer = PLAYER.JUMP_HOLD_DURATION;
    this.coyoteTimer = 0;
    this.jumpBufferTimer = 0;
    this.hasReleasedJump = false;

    // Stretch animation on jump
    this.squashScale = 1.2;
    this.stretchScale = 0.85;

    if (this.onJump) {
      this.onJump();
    }
  }

  // ---- ANIMATION ----
  private updateAnimation(delta: number): void {
    // Squash/stretch recovery
    this.squashScale = approach(this.squashScale, 1, 6, delta / 1000);
    this.stretchScale = approach(this.stretchScale, 1, 6, delta / 1000);

    // Apply scale
    const flipX = this.facingRight ? 1 : -1;
    this.sprite.setScale(this.stretchScale * flipX, this.squashScale);

    // Blink timer
    this.blinkTimer -= delta;
    if (this.blinkTimer <= 0) {
      if (this.isBlinking) {
        this.isBlinking = false;
        this.blinkTimer = 2000 + Math.random() * 4000;
      } else {
        this.isBlinking = true;
        this.blinkTimer = 100 + Math.random() * 50;
      }
    }
  }

  // ---- STATE ----
  private updateState(): void {
    if (this.isDead) {
      this.state = 'dead';
      return;
    }

    if (this.isGrounded) {
      if (Math.abs(this.velocityX) > 10) {
        this.state = 'moving';
      } else {
        this.state = 'grounded';
      }
    } else {
      if (this.body.velocity.y > 0) {
        this.state = 'falling';
      } else {
        this.state = 'airborne';
      }
    }
  }

  // ---- DEATH ----
  public deathY = 1200;
  public setDeathY(y: number): void {
    this.deathY = y;
  }

  private checkDeathZone(): void {
    if (this.sprite.y > this.deathY) {
      this.die();
    }
  }

  public die(): void {
    if (this.isDead) return;
    this.isDead = true;
    this.state = 'dead';

    // Death particles
    const emitter = this.scene.add.particles(
      this.sprite.x,
      this.sprite.y,
      'particle',
      {
        speed: { min: 50, max: 150 },
        angle: { min: 0, max: 360 },
        scale: { start: 0.6, end: 0 },
        alpha: { start: 0.8, end: 0 },
        lifespan: 600,
        quantity: 12,
        tint: [0xF5E6CC, 0xFFFFFF],
        gravityY: 200,
      }
    );
    emitter.explode(12);
    this.scene.time.delayedCall(700, () => emitter.destroy());

    this.sprite.setVisible(false);
    this.body.setVelocity(0, 0);
    this.body.setEnable(false);

    if (this.onDie) {
      this.onDie();
    }

    // Respawn after delay
    this.scene.time.delayedCall(800, () => this.respawn());
  }

  private respawn(): void {
    this.isDead = false;
    this.sprite.setPosition(this.spawnX, this.spawnY);
    this.sprite.setVisible(true);
    this.body.setEnable(true);
    this.body.setVelocity(0, 0);
    this.velocityX = 0;
    this.state = 'airborne';

    // Respawn flash
    this.scene.tweens.add({
      targets: this.sprite,
      alpha: { from: 0, to: 1 },
      duration: 300,
      ease: 'Sine.easeOut',
    });
  }

  /** Set spawn point */
  public setSpawn(x: number, y: number): void {
    this.spawnX = x;
    this.spawnY = y;
  }

  /** Get current position */
  public getPosition(): { x: number; y: number } {
    return { x: this.sprite.x, y: this.sprite.y };
  }

  public destroy(): void {
    this.sprite.destroy();
  }
}
