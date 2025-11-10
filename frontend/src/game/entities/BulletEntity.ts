import Phaser from 'phaser';
import { createProjectileComponent } from '../components/ProjectileComponent';

/**
 * Bullet Entity Factory - Creates projectiles
 */
export const createBulletEntity = (
  scene: Phaser.Scene,
  x: number,
  y: number,
  angle: number,
  damage: number = 10,
  speed: number = 400,
  spawnOffset: number = 20 // Distance from spawn point (player center)
): Phaser.Physics.Arcade.Sprite => {
  // Calculate spawn position offset from player
  const offsetX = Math.cos(angle) * spawnOffset;
  const offsetY = Math.sin(angle) * spawnOffset;
  
  const sprite = scene.physics.add.sprite(x + offsetX, y + offsetY, 'bullet');
  
  // Set velocity based on angle
  if (sprite.body) {
    const body = sprite.body as Phaser.Physics.Arcade.Body;
    body.velocity.x = Math.cos(angle) * speed;
    body.velocity.y = Math.sin(angle) * speed;
  }
  
  // Attach components
  sprite.setData('projectile', createProjectileComponent(damage, 2000));
  sprite.setData('entityType', 'bullet');
  
  return sprite;
};
