import Phaser from 'phaser';
import type { MovementComponent } from '../components/MovementComponent';
import type { SpriteComponent } from '../components/SpriteComponent';

/**
 * MovementSystem - Applies velocity to sprites and updates sprite orientation
 */
export class MovementSystem {
  update(sprite: Phaser.Physics.Arcade.Sprite, movement: MovementComponent): void {
    if (!sprite.body) return;

    // setVelocity is frame-rate independent (Phaser handles delta time)
    sprite.setVelocity(
      movement.velocity.x * movement.speed,
      movement.velocity.y * movement.speed
    );

    // Update sprite orientation (flipX) based on horizontal movement
    const spriteComponent = sprite.getData('sprite') as SpriteComponent | undefined;
    if (spriteComponent) {
      if (movement.velocity.x < 0) {
        sprite.setFlipX(true);
        spriteComponent.flipX = true;
      } else if (movement.velocity.x > 0) {
        sprite.setFlipX(false);
        spriteComponent.flipX = false;
      }
      // If x velocity is 0, keep current facing direction
    } else {
      // Fallback if no SpriteComponent (legacy behavior)
      if (movement.velocity.x < 0) {
        sprite.setFlipX(true);
      } else if (movement.velocity.x > 0) {
        sprite.setFlipX(false);
      }
    }
  }
}
