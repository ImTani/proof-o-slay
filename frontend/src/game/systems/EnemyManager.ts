import Phaser from 'phaser';
import { createEnemyEntity } from '../entities/EnemyEntity';
import { createArcherEntity } from '../entities/ArcherEntity';
import { createTankEntity } from '../entities/TankEntity';
import { ENEMY_CONFIG } from '../config/GameConfig';

/**
 * EnemyManager - Routes enemy spawning to specific enemy factories
 * Manages object pooling for all enemy types
 * 
 * Pattern: Centralized enemy creation with routing to specialized entity factories
 */
export class EnemyManager {
    private enemyGroup: Phaser.Physics.Arcade.Group;

    constructor(_scene: Phaser.Scene, enemyGroup: Phaser.Physics.Arcade.Group) {
        this.enemyGroup = enemyGroup;
    }

    /**
     * Spawn an enemy of the specified type using object pooling
     */
    spawnEnemy(
        enemyType: keyof typeof ENEMY_CONFIG,
        x: number,
        y: number,
        spawnTime: number
    ): Phaser.Physics.Arcade.Sprite {
        // Route to appropriate entity factory
        // Note: Factories handle object pooling internally (get or create)
        switch (enemyType) {
            case 'SLIME':
                return createEnemyEntity(this.enemyGroup, x, y, spawnTime, 'SLIME');
            case 'ARCHER':
                return createArcherEntity(this.enemyGroup, x, y, spawnTime);
            case 'TANK':
                return createTankEntity(this.enemyGroup, x, y, spawnTime);
            default:
                console.warn(`Unknown enemy type: ${enemyType}, defaulting to SLIME`);
                return createEnemyEntity(this.enemyGroup, x, y, spawnTime, 'SLIME');
        }
    }

    /**
     * Update all active enemies (if needed for special behaviors)
     */
    update(time: number): void {
        // Individual enemy systems can handle special update logic if needed
        // Most enemy behavior is handled by AISystem
        void time;
    }

    /**
     * Clean up and return an enemy to the pool
     */
    despawnEnemy(sprite: Phaser.Physics.Arcade.Sprite): void {
        sprite.setActive(false);
        sprite.setVisible(false);

        // Clear all component data
        sprite.setData('health', null);
        sprite.setData('ai', null);
        sprite.setData('scaling', null);
        sprite.setData('entityType', null);
        sprite.setData('enemyType', null);
        sprite.setData('damage', null);
    }

    /**
     * Get count of active enemies
     */
    getActiveCount(): number {
        return this.enemyGroup.getChildren().filter(child => child.active).length;
    }

    /**
     * Get the enemy group (for collisions, etc.)
     */
    getGroup(): Phaser.Physics.Arcade.Group {
        return this.enemyGroup;
    }
}
