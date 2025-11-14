import Phaser from 'phaser';
import type { ScalingComponent } from '../components/ScalingComponent';
import type { HealthComponent } from '../components/HealthComponent';
import type { AIComponent } from '../components/AIComponent';
import { SCALING_CONFIG } from '../config/GameConfig';

/**
 * ScalingSystem - Applies time-based stat scaling to enemies
 * Enemies get progressively stronger the longer the player survives
 */
export class ScalingSystem {
    /**
     * Apply scaling modifiers to enemy stats based on time survived
     * Call this once when enemy spawns to set scaled stats
     */
    applyScaling(
        sprite: Phaser.Physics.Arcade.Sprite,
        scaling: ScalingComponent,
        currentTime: number
    ): void {
        // Calculate minutes survived since game start
        const minutesSurvived = (currentTime - scaling.spawnTime) / 60000;

        // Calculate scaling multipliers
        const hpMultiplier = 1 + (SCALING_CONFIG.HP_PER_MINUTE * minutesSurvived);
        const damageMultiplier = 1 + (SCALING_CONFIG.DAMAGE_PER_MINUTE * minutesSurvived);
        const speedMultiplier = 1 + (SCALING_CONFIG.SPEED_PER_MINUTE * minutesSurvived);

        // Apply health scaling
        const health = sprite.getData('health') as HealthComponent;
        if (health) {
            const scaledMaxHealth = Math.floor(scaling.baseHealth * hpMultiplier);
            health.max = scaledMaxHealth;
            health.current = scaledMaxHealth;
        }

        // Apply damage scaling
        const scaledDamage = Math.floor(scaling.baseDamage * damageMultiplier);
        sprite.setData('damage', scaledDamage);

        // Apply speed scaling
        const ai = sprite.getData('ai') as AIComponent;
        if (ai) {
            ai.speed = scaling.baseSpeed * speedMultiplier;
        }
    }

    /**
     * Get the current scaling multiplier for display purposes
     */
    getScalingMultiplier(spawnTime: number, currentTime: number): number {
        const minutesSurvived = (currentTime - spawnTime) / 60000;
        return 1 + (SCALING_CONFIG.HP_PER_MINUTE * minutesSurvived);
    }
}
