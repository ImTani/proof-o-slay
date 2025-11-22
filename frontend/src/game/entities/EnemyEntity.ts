import Phaser from 'phaser';
import { createHealthComponent } from '../components/HealthComponent';
import { createAIComponent } from '../components/AIComponent';
import { createScalingComponent } from '../components/ScalingComponent';
import { ENEMY_CONFIG } from '../config/GameConfig';

/**
 * Enemy Entity Factory - Creates slime enemies with chase AI using object pooling
 */
export const createEnemyEntity = (
  enemyGroup: Phaser.Physics.Arcade.Group,
  x: number,
  y: number,
  spawnTime: number,
  enemyType: keyof typeof ENEMY_CONFIG = 'SLIME'
): Phaser.Physics.Arcade.Sprite => {
  const config = ENEMY_CONFIG[enemyType];

  // Get enemy from pool (reuses inactive enemies)
  let sprite = enemyGroup.get(x, y, 'enemy') as Phaser.Physics.Arcade.Sprite;

  // Fallback: create new enemy if pool exhausted
  if (!sprite) {
    sprite = enemyGroup.create(x, y, 'enemy') as Phaser.Physics.Arcade.Sprite;
  }

  // Ensure enemy is active and visible
  sprite.setActive(true);
  sprite.setVisible(true);

  // Set color tint based on enemy type
  sprite.setTint(config.color);

  // Attach components
  sprite.setData('health', createHealthComponent(config.health));
  sprite.setData('ai', createAIComponent(config.speed));

  // Scaling component for time-based stat increases
  sprite.setData('scaling', createScalingComponent(
    spawnTime,
    config.health,
    config.damage,
    config.speed
  ));

  sprite.setData('entityType', 'enemy');
  sprite.setData('enemyType', enemyType);
  sprite.setData('damage', config.damage);

  return sprite;
};
