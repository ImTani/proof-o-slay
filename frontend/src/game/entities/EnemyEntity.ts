import Phaser from 'phaser';
import { createHealthComponent } from '../components/HealthComponent';
import { createAIComponent } from '../components/AIComponent';
import { ENEMY_CONFIG } from '../config/GameConfig';

/**
 * Enemy Entity Factory - Creates slime enemies with chase AI
 */
export const createEnemyEntity = (
  scene: Phaser.Scene,
  x: number,
  y: number,
  enemyType: keyof typeof ENEMY_CONFIG = 'SLIME'
): Phaser.Physics.Arcade.Sprite => {
  const config = ENEMY_CONFIG[enemyType];
  const sprite = scene.physics.add.sprite(x, y, 'enemy');
  
  // Attach components
  sprite.setData('health', createHealthComponent(config.health));
  sprite.setData('ai', createAIComponent(config.speed));
  sprite.setData('entityType', 'enemy');
  sprite.setData('enemyType', enemyType);
  sprite.setData('damage', config.damage);
  
  return sprite;
};
