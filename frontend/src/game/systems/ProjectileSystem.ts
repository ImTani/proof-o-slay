import Phaser from 'phaser';
import type { ProjectileComponent } from '../components/ProjectileComponent';

/**
 * ProjectileSystem - Manages projectile lifetime and behavior (homing, etc.)
 */
export class ProjectileSystem {
  update(
    sprite: Phaser.Physics.Arcade.Sprite,
    projectile: ProjectileComponent,
    currentTime: number,
    enemies?: Phaser.Physics.Arcade.Group
  ): void {
    const age = currentTime - projectile.spawnTime;
    
    if (age >= projectile.lifespan) {
      this.destroyProjectile(sprite);
      return;
    }
    
    // Handle homing behavior
    if (projectile.specialEffect === 'homing' && projectile.homingStrength && enemies) {
      this.applyHoming(sprite, projectile, enemies);
    }
  }
  
  /**
   * Apply homing behavior - gradually turn toward nearest enemy
   */
  private applyHoming(
    sprite: Phaser.Physics.Arcade.Sprite,
    projectile: ProjectileComponent,
    enemies: Phaser.Physics.Arcade.Group
  ): void {
    if (!sprite.body) return;
    
    // Find nearest enemy
    let nearestEnemy: Phaser.Physics.Arcade.Sprite | null = null;
    let nearestDistance = Infinity;
    
    const enemyList = enemies.children.entries as Phaser.Physics.Arcade.Sprite[];
    for (const enemySprite of enemyList) {
      if (!enemySprite.active) continue;
      
      const distance = Phaser.Math.Distance.Between(
        sprite.x,
        sprite.y,
        enemySprite.x,
        enemySprite.y
      );
      
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestEnemy = enemySprite;
      }
    }
    
    if (!nearestEnemy) return;
    
    // Calculate angle to target
    const targetAngle = Phaser.Math.Angle.Between(
      sprite.x,
      sprite.y,
      nearestEnemy.x,
      nearestEnemy.y
    );
    
    // Get current velocity angle
    const body = sprite.body as Phaser.Physics.Arcade.Body;
    const currentAngle = Math.atan2(body.velocity.y, body.velocity.x);
    const speed = Math.sqrt(body.velocity.x ** 2 + body.velocity.y ** 2);
    
    // Lerp toward target angle based on homing strength
    const newAngle = Phaser.Math.Angle.RotateTo(
      currentAngle,
      targetAngle,
      projectile.homingStrength || 0.05
    );
    
    // Apply new velocity
    body.velocity.x = Math.cos(newAngle) * speed;
    body.velocity.y = Math.sin(newAngle) * speed;
  }
  
  destroyProjectile(sprite: Phaser.Physics.Arcade.Sprite): void {
    // Use killAndHide to properly return sprite to pool for reuse
    sprite.body?.reset(0, 0);
    sprite.setActive(false);
    sprite.setVisible(false);
  }
}
