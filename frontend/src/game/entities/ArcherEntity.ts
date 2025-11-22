import Phaser from 'phaser';
import { createHealthComponent } from '../components/HealthComponent';
import { createAIComponent } from '../components/AIComponent';
import { createScalingComponent } from '../components/ScalingComponent';
import { ENEMY_CONFIG } from '../config/GameConfig';

/**
 * Archer Entity Factory - Creates ranged enemies with kiting AI using object pooling
 * Archers maintain distance and fire projectiles
 */
export const createArcherEntity = (
    enemyGroup: Phaser.Physics.Arcade.Group,
    x: number,
    y: number,
    spawnTime: number
): Phaser.Physics.Arcade.Sprite => {
    const config = ENEMY_CONFIG.ARCHER;

    // Get enemy from pool (reuses inactive enemies)
    let sprite = enemyGroup.get(x, y, 'enemy') as Phaser.Physics.Arcade.Sprite;

    // Fallback: create new enemy if pool exhausted
    if (!sprite) {
        sprite = enemyGroup.create(x, y, 'enemy') as Phaser.Physics.Arcade.Sprite;
    }

    // Ensure enemy is active and visible
    sprite.setActive(true);
    sprite.setVisible(true);

    // Set color tint to distinguish from other enemies
    sprite.setTint(config.color);

    // Attach components
    sprite.setData('health', createHealthComponent(config.health));

    // Kiting AI with ranged attack
    const ai = createAIComponent(config.speed, 'kite');
    ai.keepDistance = config.keepDistance;
    ai.canAttack = true;
    ai.projectileSpeed = config.projectileSpeed;
    ai.fireRate = config.fireRate;
    ai.lastFireTime = 0;
    sprite.setData('ai', ai);

    // Scaling component for time-based stat increases
    sprite.setData('scaling', createScalingComponent(
        spawnTime,
        config.health,
        config.damage,
        config.speed
    ));

    sprite.setData('entityType', 'enemy');
    sprite.setData('enemyType', 'ARCHER');
    sprite.setData('damage', config.damage);

    return sprite;
};
