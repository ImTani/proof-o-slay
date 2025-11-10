import Phaser from 'phaser';
import { createCollectibleComponent } from '../components/CollectibleComponent';

/**
 * Shard Entity Factory - Creates collectible shards
 */
export const createShardEntity = (
  scene: Phaser.Scene,
  x: number,
  y: number
): Phaser.Physics.Arcade.Sprite => {
  const sprite = scene.physics.add.sprite(x, y, 'shard');
  sprite.setScale(1.5);
  
  // Attach components
  sprite.setData('collectible', createCollectibleComponent('shard', 1));
  sprite.setData('entityType', 'shard');
  
  // Floating animation
  scene.tweens.add({
    targets: sprite,
    y: y - 10,
    duration: 500,
    yoyo: true,
    repeat: -1,
    ease: 'Sine.easeInOut',
  });
  
  return sprite;
};
