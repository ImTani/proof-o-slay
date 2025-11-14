import Phaser from 'phaser';
import type { AIComponent } from '../components/AIComponent';

/**
 * AISystem - Handles enemy AI behavior
 * Supports chase (melee) and kite (ranged) behaviors
 */
export class AISystem {
  update(sprite: Phaser.Physics.Arcade.Sprite, ai: AIComponent, target: Phaser.Math.Vector2): void {
    if (!sprite.body) return;

    const body = sprite.body as Phaser.Physics.Arcade.Body;

    if (ai.type === 'chase' && target) {
      // Simple chase AI - move directly toward target
      const angle = Phaser.Math.Angle.Between(
        sprite.x,
        sprite.y,
        target.x,
        target.y
      );

      body.velocity.x = Math.cos(angle) * ai.speed;
      body.velocity.y = Math.sin(angle) * ai.speed;
    }
    else if (ai.type === 'kite' && target && ai.keepDistance) {
      // Kiting AI - maintain distance from target
      const distance = Phaser.Math.Distance.Between(
        sprite.x,
        sprite.y,
        target.x,
        target.y
      );

      const angle = Phaser.Math.Angle.Between(
        sprite.x,
        sprite.y,
        target.x,
        target.y
      );

      if (distance < ai.keepDistance) {
        // Too close - move away from target
        body.velocity.x = -Math.cos(angle) * ai.speed;
        body.velocity.y = -Math.sin(angle) * ai.speed;
      } else if (distance > ai.keepDistance * 1.5) {
        // Too far - move toward target
        body.velocity.x = Math.cos(angle) * ai.speed * 0.5;
        body.velocity.y = Math.sin(angle) * ai.speed * 0.5;
      } else {
        // In range - strafe (move perpendicular)
        const strafeAngle = angle + Math.PI / 2;
        body.velocity.x = Math.cos(strafeAngle) * ai.speed * 0.7;
        body.velocity.y = Math.sin(strafeAngle) * ai.speed * 0.7;
      }
    }
  }
}
