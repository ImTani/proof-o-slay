import Phaser from 'phaser';
import { POWERUP_CONFIG, type PowerUpType } from '../config/GameConfig';

/**
 * PowerUp Entity Factory - Creates power-up pickups
 * Used when enemies drop buffs
 */
export const createPowerUpEntity = (
  scene: Phaser.Scene,
  x: number,
  y: number,
  powerUpType: PowerUpType
): Phaser.Physics.Arcade.Sprite => {
  const config = POWERUP_CONFIG[powerUpType];

  // Create colored rectangle as placeholder graphic
  const graphics = scene.add.graphics();
  graphics.fillStyle(config.color, 1);
  graphics.fillRoundedRect(0, 0, 24, 24, 4);
  graphics.generateTexture(`powerup_${powerUpType}`, 24, 24);
  graphics.destroy();

  // Create sprite
  const sprite = scene.physics.add.sprite(x, y, `powerup_${powerUpType}`);
  sprite.setScale(1);

  // Store power-up type
  sprite.setData('powerUpType', powerUpType);
  sprite.setData('entityType', 'powerup');

  // Floating animation (up and down)
  scene.tweens.add({
    targets: sprite,
    y: y - 8,
    duration: 800,
    yoyo: true,
    repeat: -1,
    ease: 'Sine.easeInOut',
  });

  // Pulse animation (scale)
  scene.tweens.add({
    targets: sprite,
    scale: 1.2,
    duration: 600,
    yoyo: true,
    repeat: -1,
    ease: 'Quad.easeInOut',
  });

  // Auto-despawn after 30 seconds if not collected
  scene.time.delayedCall(30000, () => {
    if (sprite && sprite.active) {
      sprite.destroy();
    }
  });

  return sprite;
};

/**
 * Helper function to determine which power-up drops based on drop rates
 * Returns null if no power-up should drop
 */
export const rollPowerUpDrop = (): PowerUpType | null => {
  const roll = Math.random();
  let cumulativeChance = 0;

  // Iterate through all power-up types
  const types = Object.keys(POWERUP_CONFIG) as PowerUpType[];
  for (const type of types) {
    cumulativeChance += POWERUP_CONFIG[type].dropChance;
    if (roll < cumulativeChance) {
      return type;
    }
  }

  return null; // No power-up dropped
};
