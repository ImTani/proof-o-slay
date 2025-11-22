import Phaser from 'phaser';
import { EFFECTS_CONFIG } from '../config/GameConfig';

/**
 * EffectManager - Manages pooled visual effects for performance
 * Handles floating damage numbers, particle effects, and visual feedback
 */
export class EffectManager {
    private scene: Phaser.Scene;
    private damageNumberPool: Phaser.GameObjects.Text[] = [];

    constructor(scene: Phaser.Scene) {
        this.scene = scene;
    }

    /**
     * Show floating damage number above an enemy
     */
    showDamageNumber(x: number, y: number, damage: number): void {
        const config = EFFECTS_CONFIG.DAMAGE_NUMBER;

        // Get text from pool or create new one
        let text = this.damageNumberPool.pop();

        if (!text) {
            text = this.scene.add.text(x, y, '', {
                fontSize: config.FONT_SIZE,
                color: config.COLOR,
                fontStyle: 'bold',
                stroke: config.STROKE_COLOR,
                strokeThickness: config.STROKE_THICKNESS,
            });
        }

        // Set position and content
        text.setPosition(x, y);
        text.setText(`-${Math.round(damage)}`);
        text.setActive(true);
        text.setVisible(true);
        text.setAlpha(1);
        text.setOrigin(0.5);

        // Animate upward and fade
        this.scene.tweens.add({
            targets: text,
            y: y - config.FLOAT_DISTANCE,
            alpha: 0,
            duration: config.DURATION,
            ease: 'Power2',
            onComplete: () => {
                text.setActive(false);
                text.setVisible(false);
                this.damageNumberPool.push(text);
            },
        });
    }

    /**
     * Create particle burst for shard pickup
     */
    shardPickupBurst(x: number, y: number): void {
        const config = EFFECTS_CONFIG.PARTICLES.SHARD_PICKUP;
        this.createParticleBurst(x, y, config.COLOR, config.COUNT, config.RADIUS, config.SPEED_MIN, config.SPEED_MAX, config.DURATION);
    }

    /**
     * Create particle burst for power-up pickup
     */
    powerUpPickupBurst(x: number, y: number, color: number): void {
        const config = EFFECTS_CONFIG.PARTICLES.POWERUP_PICKUP;
        this.createParticleBurst(x, y, color, config.COUNT, config.RADIUS, config.SPEED_MIN, config.SPEED_MAX, config.DURATION);
    }

    /**
     * Create particle burst for enemy death
     */
    enemyDeathBurst(x: number, y: number, color: number): void {
        const config = EFFECTS_CONFIG.PARTICLES.ENEMY_DEATH;
        this.createParticleBurst(x, y, color, config.COUNT, config.RADIUS, config.SPEED_MIN, config.SPEED_MAX, config.DURATION);
    }

    /**
     * Create large explosion particle effect
     */
    explosionBurst(x: number, y: number, color?: number): void {
        const config = EFFECTS_CONFIG.PARTICLES.EXPLOSION;
        const explosionColor = color ?? config.COLOR;
        this.createParticleBurst(x, y, explosionColor, config.COUNT, config.RADIUS, config.SPEED_MIN, config.SPEED_MAX, config.DURATION);
    }

    /**
     * Generic particle burst effect (private helper)
     */
    private createParticleBurst(
        x: number,
        y: number,
        color: number,
        count: number,
        radius: number,
        speedMin: number,
        speedMax: number,
        duration: number
    ): void {
        for (let i = 0; i < count; i++) {
            const particle = this.scene.add.circle(x, y, radius, color);

            const angle = (Math.PI * 2 * i) / count;
            const speed = Phaser.Math.Between(speedMin, speedMax);
            const velocityX = Math.cos(angle) * speed;
            const velocityY = Math.sin(angle) * speed;

            this.scene.tweens.add({
                targets: particle,
                x: x + velocityX,
                y: y + velocityY,
                alpha: 0,
                scale: 0,
                duration: duration,
                ease: 'Power2',
                onComplete: () => {
                    particle.destroy();
                },
            });
        }
    }

    /**
     * Camera shake for player hit
     */
    playerHitShake(): void {
        const config = EFFECTS_CONFIG.CAMERA_SHAKE.PLAYER_HIT;
        this.scene.cameras.main.shake(config.DURATION, config.INTENSITY);
    }

    /**
     * Camera shake for enemy kill
     */
    enemyKillShake(): void {
        const config = EFFECTS_CONFIG.CAMERA_SHAKE.ENEMY_KILL;
        this.scene.cameras.main.shake(config.DURATION, config.INTENSITY);
    }

    /**
     * Camera shake for explosion
     */
    explosionShake(): void {
        const config = EFFECTS_CONFIG.CAMERA_SHAKE.EXPLOSION;
        this.scene.cameras.main.shake(config.DURATION, config.INTENSITY);
    }

    /**
     * Cleanup all pooled effects
     */
    cleanup(): void {
        this.damageNumberPool.forEach(text => text.destroy());
        this.damageNumberPool = [];
    }
}
