import Phaser from 'phaser';
import type { MovementComponent } from '../components/MovementComponent';

/**
 * MovementSystem - Applies velocity to sprites
 */
export class MovementSystem {
  update(sprite: Phaser.Physics.Arcade.Sprite, movement: MovementComponent): void {
    if (!sprite.body) return;
    
    sprite.setVelocity(
      movement.velocity.x * movement.speed,
      movement.velocity.y * movement.speed
    );
  }
}
