import Phaser from 'phaser';
import { createCollectibleComponent } from '../components/CollectibleComponent';
import { GRAPHICS_CONFIG } from '../config/GameConfig';

/**
 * Shard Entity Factory - Creates collectible shards
 */
export const createShardEntity = (
  scene: Phaser.Scene,
  x: number,
  y: number,
  value: number = 1
): Phaser.Physics.Arcade.Sprite => {
  const sprite = scene.physics.add.sprite(x, y, 'shard');
  sprite.setScale(GRAPHICS_CONFIG.SHARD.scale);

  // Attach components with dynamic value
  sprite.setData('collectible', createCollectibleComponent('shard', value));
  sprite.setData('entityType', 'shard');

  // Floating animation (up and down)
  scene.tweens.add({
    targets: sprite,
    y: y - GRAPHICS_CONFIG.SHARD.floatOffset,
    duration: GRAPHICS_CONFIG.SHARD.floatDuration,
    yoyo: true,
    repeat: -1,
    ease: 'Sine.easeInOut',
  });

  // Pulse animation (scale)
  scene.tweens.add({
    targets: sprite,
    scale: GRAPHICS_CONFIG.SHARD.pulseScale,
    duration: GRAPHICS_CONFIG.SHARD.pulseDuration,
    yoyo: true,
    repeat: -1,
    ease: 'Quad.easeInOut',
  });

  // Rotation animation
  scene.tweens.add({
    targets: sprite,
    angle: 360,
    duration: GRAPHICS_CONFIG.SHARD.rotateDuration,
    repeat: -1,
    ease: 'Linear',
  });

  return sprite;
};
