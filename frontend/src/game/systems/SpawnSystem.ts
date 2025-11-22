import Phaser from 'phaser';
import { SPAWN_CONFIG, SCALING_CONFIG } from '../config/GameConfig';
import { EnemyManager } from './EnemyManager';

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
    private enemyManager: EnemyManager;

    constructor(scene: Phaser.Scene, enemyManager: EnemyManager) {
        this.scene = scene;
        this.enemyManager = enemyManager;
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
            this.enemyManager.getActiveCount() < SPAWN_CONFIG.MAX_ENEMIES
        ) {
            this.spawnEnemy(currentTime);
            this.lastSpawnTime = currentTime;
        }

        // Cull distant enemies
        this.cullDistantEnemies();

        return this.enemyManager.getActiveCount();
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

        this.enemyManager.spawnEnemy(enemyType, pos.x, pos.y, spawnTime);
    }

    /**
     * Spawn a boss Tank enemy
     */
    private spawnBoss(spawnTime: number): void {
        const pos = this.getOffScreenSpawnPosition();
        this.enemyManager.spawnEnemy('TANK', pos.x, pos.y, spawnTime);
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
     * Cull enemies that are too far from camera (>2000px)
     */
    private cullDistantEnemies(): void {
        const camera = this.scene.cameras.main;
        const cullDistance = SPAWN_CONFIG.CULL_DISTANCE;
        const enemyGroup = this.enemyManager.getGroup();

        enemyGroup.getChildren().forEach((child) => {
            const enemy = child as Phaser.Physics.Arcade.Sprite;
            if (!enemy.active) return;

            const distance = Phaser.Math.Distance.Between(
                enemy.x,
                enemy.y,
                camera.worldView.centerX,
                camera.worldView.centerY
            );

            if (distance > cullDistance) {
                this.enemyManager.despawnEnemy(enemy);
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
