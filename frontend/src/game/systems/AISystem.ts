import Phaser from 'phaser';
import type { AIComponent } from '../components/AIComponent';

/**
 * AISystem - Handles enemy AI behavior
 */
export class AISystem {
  update(sprite: Phaser.Physics.Arcade.Sprite, ai: AIComponent, target: Phaser.Math.Vector2): void {
    if (!sprite.body) return;
    
    if (ai.type === 'chase' && target) {
      // Calculate angle to target
      const angle = Phaser.Math.Angle.Between(
        sprite.x,
        sprite.y,
        target.x,
        target.y
      );
      
      // Move towards target
      const body = sprite.body as Phaser.Physics.Arcade.Body;
      body.velocity.x = Math.cos(angle) * ai.speed;
      body.velocity.y = Math.sin(angle) * ai.speed;
    }
  }
}
