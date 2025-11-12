import Phaser from 'phaser';
import type { MovementComponent } from '../components/MovementComponent';

/**
 * MovementSystem - Applies velocity to sprites
 * 
 * Frame-rate independent: Phaser's Arcade Physics handles delta time internally
 * when applying velocities, so movement speed is consistent regardless of FPS.
 */
export class MovementSystem {
  update(sprite: Phaser.Physics.Arcade.Sprite, movement: MovementComponent): void {
    if (!sprite.body) return;
    
    // setVelocity is frame-rate independent (Phaser handles delta time)
    sprite.setVelocity(
      movement.velocity.x * movement.speed,
      movement.velocity.y * movement.speed
    );
  }
}
