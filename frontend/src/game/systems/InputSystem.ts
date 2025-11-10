import Phaser from 'phaser';
import type { InputComponent } from '../components/InputComponent';
import type { MovementComponent } from '../components/MovementComponent';

/**
 * InputSystem - Processes keyboard input and updates movement velocity
 */
export class InputSystem {
  update(
    sprite: Phaser.Physics.Arcade.Sprite,
    input: InputComponent,
    movement: MovementComponent,
    pointer: Phaser.Input.Pointer
  ): void {
    // Reset velocity
    movement.velocity.set(0, 0);
    
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
    
    // Normalize diagonal movement
    if (movement.velocity.length() > 0) {
      movement.velocity.normalize();
    }
    
    // Mouse aiming
    const angle = Phaser.Math.Angle.Between(
      sprite.x,
      sprite.y,
      pointer.worldX,
      pointer.worldY
    );
    sprite.setRotation(angle);
  }
}
