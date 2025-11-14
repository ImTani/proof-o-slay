import Phaser from 'phaser';
import { createHealthComponent } from '../components/HealthComponent';
import { createAIComponent } from '../components/AIComponent';
import { createScalingComponent } from '../components/ScalingComponent';
import { ENEMY_CONFIG } from '../config/GameConfig';

/**
 * Tank Entity Factory - Creates mini-boss enemies with high HP
 * Tanks are slow but devastating and hard to knock back
 */
export const createTankEntity = (
    scene: Phaser.Scene,
    x: number,
    y: number,
    spawnTime: number
): Phaser.Physics.Arcade.Sprite => {
    const config = ENEMY_CONFIG.TANK;
    const sprite = scene.physics.add.sprite(x, y, 'enemy');

    // Make tank larger to show it's a boss
    sprite.setScale(2.0);

    // Set color tint to distinguish from other enemies
    sprite.setTint(config.color);

    // Attach components
    sprite.setData('health', createHealthComponent(config.health));
    sprite.setData('ai', createAIComponent(config.speed, 'chase'));

    // Scaling component for time-based stat increases
    sprite.setData('scaling', createScalingComponent(
        spawnTime,
        config.health,
        config.damage,
        config.speed
    ));

    sprite.setData('entityType', 'enemy');
    sprite.setData('enemyType', 'TANK');
    sprite.setData('damage', config.damage);
    sprite.setData('knockbackResistance', config.knockbackResistance);
    sprite.setData('isBoss', true); // Mark as boss for special drops

    return sprite;
};
