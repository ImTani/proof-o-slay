import Phaser from 'phaser';
import { SPAWN_CONFIG, SCALING_CONFIG } from '../config/GameConfig';
import { createEnemyEntity } from '../entities/EnemyEntity';
import { createArcherEntity } from '../entities/ArcherEntity';
import { createTankEntity } from '../entities/TankEntity';

/**
 * SpawnSystem - Perpetual enemy spawning system
 * 
 * Replaces the wave-based spawning with infinite spawning that:
 * - Spawns enemies off-screen at camera edges
 * - Increases spawn rate +10% per minute
 * - Spawns boss Tanks every 10 minutes
 * - Culls enemies >2000px from camera
 * - Caps max enemies at 500
 */
export class SpawnSystem {
    private scene: Phaser.Scene;
    private gameStartTime: number;
    private lastSpawnTime: number;
    private lastBossTime: number;
    private enemyGroup: Phaser.Physics.Arcade.Group;

    constructor(scene: Phaser.Scene, enemyGroup: Phaser.Physics.Arcade.Group) {
        this.scene = scene;
        this.enemyGroup = enemyGroup;
        this.gameStartTime = scene.time.now;
        this.lastSpawnTime = scene.time.now;
        this.lastBossTime = scene.time.now;
    }

    /**
     * Update spawning logic - called every frame
     */
    update(currentTime: number): number {
        // Calculate elapsed time in minutes
        const minutesElapsed = (currentTime - this.gameStartTime) / 60000;

        // Check boss spawn (every 10 minutes)
        if (currentTime - this.lastBossTime >= SPAWN_CONFIG.BOSS_INTERVAL) {
            this.spawnBoss(currentTime);
            this.lastBossTime = currentTime;
        }

        // Calculate spawn interval with scaling
        const spawnInterval = this.getScaledSpawnInterval(minutesElapsed);

        // Check if it's time to spawn a regular enemy
        if (
            currentTime - this.lastSpawnTime >= spawnInterval &&
            this.enemyGroup.getChildren().length < SPAWN_CONFIG.MAX_ENEMIES
        ) {
            this.spawnEnemy(currentTime);
            this.lastSpawnTime = currentTime;
        }

        // Cull distant enemies
        this.cullDistantEnemies();

        return this.enemyGroup.getChildren().length;
    }

    /**
     * Calculate spawn interval with +10% rate per minute
     */
    private getScaledSpawnInterval(minutesElapsed: number): number {
        // Spawn rate increases by 10% per minute
        // Interval = Base / (1 + 0.10 * minutes)
        const rateMultiplier = 1 + SCALING_CONFIG.SPAWN_RATE_PER_MINUTE * minutesElapsed;
        return SPAWN_CONFIG.BASE_SPAWN_INTERVAL / rateMultiplier;
    }

    /**
     * Spawn a regular enemy with weighted type selection
     */
    private spawnEnemy(spawnTime: number): void {
        const pos = this.getOffScreenSpawnPosition();
        const enemyType = this.selectEnemyType();

        let enemy: Phaser.Physics.Arcade.Sprite;

        switch (enemyType) {
            case 'ARCHER':
                enemy = createArcherEntity(this.scene, pos.x, pos.y, spawnTime);
                break;
            case 'TANK':
                enemy = createTankEntity(this.scene, pos.x, pos.y, spawnTime);
                break;
            case 'SLIME':
            default:
                enemy = createEnemyEntity(this.scene, pos.x, pos.y, spawnTime, 'SLIME');
                break;
        }

        this.enemyGroup.add(enemy);
    }

    /**
     * Spawn a boss Tank enemy
     */
    private spawnBoss(spawnTime: number): void {
        const pos = this.getOffScreenSpawnPosition();
        const boss = createTankEntity(this.scene, pos.x, pos.y, spawnTime);
        this.enemyGroup.add(boss);
        console.log(`👹 BOSS TANK spawned at ${Math.floor((spawnTime - this.gameStartTime) / 60000)} minutes!`);
    }

    /**
     * Select enemy type based on weighted probabilities
     * 70% Slime, 20% Archer, 10% Tank
     */
    private selectEnemyType(): 'SLIME' | 'ARCHER' | 'TANK' {
        const roll = Math.random();
        const weights = SPAWN_CONFIG.ENEMY_WEIGHTS;

        if (roll < weights.SLIME) {
            return 'SLIME';
        } else if (roll < weights.SLIME + weights.ARCHER) {
            return 'ARCHER';
        } else {
            return 'TANK';
        }
    }

    /**
     * Get spawn position off-screen at camera edges + margin
     */
    private getOffScreenSpawnPosition(): { x: number; y: number } {
        const camera = this.scene.cameras.main;
        const margin = SPAWN_CONFIG.SPAWN_MARGIN;

        // Get camera bounds
        const camLeft = camera.worldView.x - margin;
        const camRight = camera.worldView.x + camera.width + margin;
        const camTop = camera.worldView.y - margin;
        const camBottom = camera.worldView.y + camera.height + margin;

        // Choose random edge (0=top, 1=right, 2=bottom, 3=left)
        const edge = Phaser.Math.Between(0, 3);

        switch (edge) {
            case 0: // Top
                return {
                    x: Phaser.Math.Between(camLeft, camRight),
                    y: camTop,
                };
            case 1: // Right
                return {
                    x: camRight,
                    y: Phaser.Math.Between(camTop, camBottom),
                };
            case 2: // Bottom
                return {
                    x: Phaser.Math.Between(camLeft, camRight),
                    y: camBottom,
                };
            case 3: // Left
            default:
                return {
                    x: camLeft,
                    y: Phaser.Math.Between(camTop, camBottom),
                };
        }
    }

    /**
     * Destroy enemies that are too far from camera
     */
    private cullDistantEnemies(): void {
        const camera = this.scene.cameras.main;
        const camCenterX = camera.worldView.x + camera.width / 2;
        const camCenterY = camera.worldView.y + camera.height / 2;
        const cullDistance = SPAWN_CONFIG.CULL_DISTANCE;

        this.enemyGroup.getChildren().forEach((enemy) => {
            const sprite = enemy as Phaser.Physics.Arcade.Sprite;
            const distance = Phaser.Math.Distance.Between(
                sprite.x,
                sprite.y,
                camCenterX,
                camCenterY
            );

            if (distance > cullDistance) {
                sprite.destroy();
            }
        });
    }

    /**
     * Reset spawning timers (for game restart)
     */
    reset(): void {
        this.gameStartTime = this.scene.time.now;
        this.lastSpawnTime = this.scene.time.now;
        this.lastBossTime = this.scene.time.now;
    }
}
