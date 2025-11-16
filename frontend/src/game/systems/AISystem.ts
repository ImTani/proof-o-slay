import Phaser from 'phaser';
import type { AIComponent } from '../components/AIComponent';
import { createBulletEntity } from '../entities/BulletEntity';
import { ENEMY_CONFIG } from '../config/GameConfig';

/**
 * AISystem - Handles enemy AI behavior
 * Supports chase (melee) and kite (ranged) behaviors
 * Also handles archer ranged attacks
 */
export class AISystem {
  private enemyBullets?: Phaser.Physics.Arcade.Group;

  constructor(enemyBullets?: Phaser.Physics.Arcade.Group) {
    this.enemyBullets = enemyBullets;
  }

  update(sprite: Phaser.Physics.Arcade.Sprite, ai: AIComponent, target: Phaser.Math.Vector2, currentTime: number): void {
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

      // Fire projectiles if able
      if (ai.canAttack && ai.fireRate && ai.projectileSpeed) {
        const timeSinceLastFire = currentTime - (ai.lastFireTime || 0);
        if (timeSinceLastFire >= ai.fireRate) {
          this.fireProjectile(sprite, ai, target, currentTime);
        }
      }
    }
  }

  /**
   * Fire an enemy projectile toward the target
   */
  private fireProjectile(
    sprite: Phaser.Physics.Arcade.Sprite,
    ai: AIComponent,
    target: Phaser.Math.Vector2,
    currentTime: number
  ): void {
    if (!this.enemyBullets || !ai.projectileSpeed) return;

    // Get enemy damage
    const damage = sprite.getData('damage') as number || 15;

    // Calculate angle to target
    const angle = Phaser.Math.Angle.Between(sprite.x, sprite.y, target.x, target.y);

    // Create projectile using bullet group
    const bullet = createBulletEntity(
      this.enemyBullets,
      sprite.x,
      sprite.y,
      angle,
      damage,
      ai.projectileSpeed,
      ENEMY_CONFIG.ARCHER.projectileLifespan,
      currentTime
    );

    if (bullet) {
      // Set red tint for enemy projectiles
      bullet.setTint(ENEMY_CONFIG.ARCHER.projectileTint);
      // Mark as enemy projectile
      bullet.setData('owner', 'enemy');
    }

    // Update last fire time
    ai.lastFireTime = currentTime;
  }
}