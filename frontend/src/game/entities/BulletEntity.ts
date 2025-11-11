import Phaser from 'phaser';
import { createProjectileComponent } from '../components/ProjectileComponent';

/**
 * Bullet Entity Factory - Creates projectiles from a pool
 * Uses group.get() for efficient object pooling
 */
export const createBulletEntity = (
  bulletGroup: Phaser.Physics.Arcade.Group,
  x: number,
  y: number,
  angle: number,
  damage: number,
  speed: number,
  spawnTime: number // Phaser time, not Date.now()
): Phaser.Physics.Arcade.Sprite | null => {
  // Get bullet from pool (reuses inactive bullets)
  let bullet = bulletGroup.get(x, y, 'bullet') as Phaser.Physics.Arcade.Sprite;
  
  // Fallback: create new bullet if pool exhausted
  if (!bullet) {
    bullet = bulletGroup.create(x, y, 'bullet') as Phaser.Physics.Arcade.Sprite;
  }
  
  if (!bullet) {
    return null;
  }
  
  // Ensure bullet is active and visible
  bullet.setActive(true);
  bullet.setVisible(true);
  
  // Set velocity based on angle
  if (bullet.body) {
    const body = bullet.body as Phaser.Physics.Arcade.Body;
    body.enable = true;
    body.velocity.x = Math.cos(angle) * speed;
    body.velocity.y = Math.sin(angle) * speed;
  }
  
  // Attach components
  bullet.setData('projectile', createProjectileComponent(damage, 2000, spawnTime));
  bullet.setData('entityType', 'bullet');
  
  return bullet;
};
