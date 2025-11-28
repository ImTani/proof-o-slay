import Phaser from 'phaser';
import { EFFECTS_CONFIG } from '../config/GameConfig';

/**
 * EffectManager - Manages visual effects using Phaser Particle Emitters
 */
export class EffectManager {
    private scene: Phaser.Scene;
    private damageNumberPool: Phaser.GameObjects.Text[] = [];

    // Particle Emitters
    private explosionEmitter!: Phaser.GameObjects.Particles.ParticleEmitter;
    private shardEmitter!: Phaser.GameObjects.Particles.ParticleEmitter;
    private hitEmitter!: Phaser.GameObjects.Particles.ParticleEmitter;
    private trailEmitter!: Phaser.GameObjects.Particles.ParticleEmitter;

    constructor(scene: Phaser.Scene) {
        this.scene = scene;
        this.createParticleTextures();
        this.createEmitters();
    }

    private createParticleTextures(): void {
        if (!this.scene.textures.exists('particle_glow')) {
            const graphics = this.scene.make.graphics({ x: 0, y: 0 });
            graphics.fillStyle(0xffffff, 1);
            graphics.fillCircle(4, 4, 4);
            graphics.generateTexture('particle_glow', 8, 8);
            graphics.destroy();
        }
    }

    private createEmitters(): void {
        // Generic Explosion Emitter
        this.explosionEmitter = this.scene.add.particles(0, 0, 'particle_glow', {
            lifespan: { min: 200, max: 500 },
            speed: { min: 100, max: 300 },
            scale: { start: 1, end: 0 },
            alpha: { start: 1, end: 0 },
            blendMode: 'ADD',
            emitting: false
        });

        // Shard Pickup Emitter
        this.shardEmitter = this.scene.add.particles(0, 0, 'particle_glow', {
            lifespan: 400,
            speed: { min: 50, max: 150 },
            scale: { start: 0.5, end: 0 },
            blendMode: 'ADD',
            emitting: false
        });

        // Hit Impact Emitter
        this.hitEmitter = this.scene.add.particles(0, 0, 'particle_glow', {
            lifespan: 200,
            speed: { min: 50, max: 150 },
            scale: { start: 0.8, end: 0 },
            blendMode: 'ADD',
            emitting: false
        });

        // Trail Emitter (for projectiles/player)
        this.trailEmitter = this.scene.add.particles(0, 0, 'particle_glow', {
            lifespan: 100,
            scale: { start: 0.5, end: 0 },
            alpha: { start: 0.5, end: 0 },
            blendMode: 'ADD',
            emitting: false
        });
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
            text.setDepth(100); // Ensure above everything
        }

        // Set position and content
        text.setPosition(x, y);
        text.setText(`-${Math.round(damage)}`);
        text.setActive(true);
        text.setVisible(true);
        text.setAlpha(1);
        text.setOrigin(0.5);
        text.setScale(1);

        // Animate upward and fade
        this.scene.tweens.add({
            targets: text,
            y: y - config.FLOAT_DISTANCE,
            alpha: 0,
            scale: 1.5, // Pop effect
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
        this.shardEmitter.setPosition(x, y);
        this.shardEmitter.setParticleTint(0x00f3ff); // Cyan
        this.shardEmitter.explode(10);
    }

    /**
     * Create particle burst for power-up pickup
     */
    powerUpPickupBurst(x: number, y: number, color: number): void {
        this.shardEmitter.setPosition(x, y);
        this.shardEmitter.setParticleTint(color);
        this.shardEmitter.explode(20);
    }

    /**
     * Create particle burst for enemy death
     */
    enemyDeathBurst(x: number, y: number, color: number): void {
        this.explosionEmitter.setPosition(x, y);
        this.explosionEmitter.setParticleTint(color);
        this.explosionEmitter.explode(15);
    }

    /**
     * Create large explosion particle effect
     */
    explosionBurst(x: number, y: number, color: number = 0xffaa00): void {
        this.explosionEmitter.setPosition(x, y);
        this.explosionEmitter.setParticleTint(color);
        this.explosionEmitter.explode(30);
        this.explosionShake();
    }

    /**
     * Create a trail effect for an entity
     */
    createTrail(entity: Phaser.GameObjects.GameObject, color: number = 0xffffff): void {
        // In Phaser 3.60+, we can follow directly or emit at position
        // For simplicity, we'll just emit at position in update loop if needed
        // Or we can attach an emitter to the entity
        // For now, let's just expose a method to emit a puff
        this.trailEmitter.setPosition((entity as any).x, (entity as any).y);
        this.trailEmitter.setParticleTint(color);
        this.trailEmitter.emitParticle(1);
    }

    /**
     * Camera shake for player hit
     */
    playerHitShake(): void {
        const config = EFFECTS_CONFIG.CAMERA_SHAKE.PLAYER_HIT;
        this.scene.cameras.main.shake(config.DURATION, config.INTENSITY);
        this.hitEmitter.setPosition(this.scene.cameras.main.scrollX + this.scene.scale.width / 2, this.scene.cameras.main.scrollY + this.scene.scale.height / 2);
        this.hitEmitter.setParticleTint(0xff0000);
        this.hitEmitter.explode(20);
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
        // Emitters are game objects, scene cleanup handles them usually, but good to be safe
        if (this.explosionEmitter) this.explosionEmitter.destroy();
        if (this.shardEmitter) this.shardEmitter.destroy();
        if (this.hitEmitter) this.hitEmitter.destroy();
        if (this.trailEmitter) this.trailEmitter.destroy();
    }
}
