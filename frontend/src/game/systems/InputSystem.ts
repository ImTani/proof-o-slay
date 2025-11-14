import Phaser from 'phaser';
import type { InputComponent } from '../components/InputComponent';
import type { MovementComponent } from '../components/MovementComponent';
import { INPUT_CONFIG } from '../config/GameConfig';

/**
 * InputSystem - Processes keyboard and gamepad input and updates movement velocity
 */
export class InputSystem {
  private gamepad?: Phaser.Input.Gamepad.Gamepad;
  private scene: Phaser.Scene;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  update(
    sprite: Phaser.Physics.Arcade.Sprite,
    input: InputComponent,
    movement: MovementComponent
  ): void {
    // Get active gamepad if available
    if (this.scene.input.gamepad && this.scene.input.gamepad.total > 0) {
      this.gamepad = this.scene.input.gamepad.getPad(0);
    }

    // Reset velocity
    movement.velocity.set(0, 0);

    // === KEYBOARD INPUT ===
    // WASD / Arrow keys
    if (input.wasd.a.isDown || input.cursors.left.isDown) {
      movement.velocity.x = -1;
    } else if (input.wasd.d.isDown || input.cursors.right.isDown) {
      movement.velocity.x = 1;
    }

    if (input.wasd.w.isDown || input.cursors.up.isDown) {
      movement.velocity.y = -1;
    } else if (input.wasd.s.isDown || input.cursors.down.isDown) {
      movement.velocity.y = 1;
    }

    // === GAMEPAD INPUT ===
    // Left analog stick for movement (overrides keyboard if active)
    if (this.gamepad) {
      const leftStick = this.gamepad.leftStick;

      // Apply deadzone
      if (Math.abs(leftStick.x) > INPUT_CONFIG.GAMEPAD.DEADZONE ||
        Math.abs(leftStick.y) > INPUT_CONFIG.GAMEPAD.DEADZONE) {
        movement.velocity.x = leftStick.x;
        movement.velocity.y = leftStick.y;
      }
    }

    // Normalize diagonal movement
    if (movement.velocity.length() > 0) {
      movement.velocity.normalize();

      // Rotate player sprite to face movement direction
      const angle = Math.atan2(movement.velocity.y, movement.velocity.x);
      sprite.setRotation(angle);
    }
    // If not moving, keep current rotation
  }

  /**
   * Get aiming direction from mouse or right analog stick
   * Returns null if no valid aim input
   */
  getAimDirection(sprite: Phaser.Physics.Arcade.Sprite, pointer: Phaser.Input.Pointer): Phaser.Math.Vector2 | null {
    // === GAMEPAD AIMING (Right Stick) ===
    if (this.gamepad) {
      const rightStick = this.gamepad.rightStick;

      // Check if right stick is being used
      if (Math.abs(rightStick.x) > INPUT_CONFIG.GAMEPAD.DEADZONE ||
        Math.abs(rightStick.y) > INPUT_CONFIG.GAMEPAD.DEADZONE) {
        const aimDir = new Phaser.Math.Vector2(rightStick.x, rightStick.y);
        aimDir.normalize();
        return aimDir;
      }
    }

    // === MOUSE AIMING (Fallback) ===
    // Get world position of pointer
    const worldPoint = this.scene.cameras.main.getWorldPoint(pointer.x, pointer.y);
    const aimDir = new Phaser.Math.Vector2(
      worldPoint.x - sprite.x,
      worldPoint.y - sprite.y
    );

    // Only aim if mouse is far enough from player
    if (aimDir.length() > INPUT_CONFIG.GAMEPAD.MIN_AIM_DISTANCE) {
      aimDir.normalize();
      return aimDir;
    }

    return null;
  }

  /**
   * Check if fire button is pressed (mouse click or gamepad button)
   */
  isFirePressed(pointer: Phaser.Input.Pointer): boolean {
    // Mouse button
    if (pointer.isDown) {
      return true;
    }

    // Gamepad right trigger (button 7 on most gamepads) or right bumper (button 5)
    if (this.gamepad) {
      return this.gamepad.buttons[7]?.pressed || this.gamepad.buttons[5]?.pressed || false;
    }

    return false;
  }

  /**
   * Check if skill button is pressed (Spacebar or gamepad button)
   */
  isSkillPressed(): boolean {
    // Gamepad A button (button 0) or Y button (button 3)
    if (this.gamepad) {
      return this.gamepad.buttons[0]?.pressed || this.gamepad.buttons[3]?.pressed || false;
    }

    // Spacebar is handled separately in GameScene due to FocusManager conflict
    return false;
  }

  /**
   * Check if gamepad is connected
   */
  hasGamepad(): boolean {
    return this.gamepad !== undefined && this.gamepad.connected;
  }
}

