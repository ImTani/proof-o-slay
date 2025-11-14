/**
 * ScalingComponent - Stores spawn time for time-based stat scaling
 * Enemies get stronger the longer the player survives
 */
export interface ScalingComponent {
    spawnTime: number; // Phaser.Time.now when enemy spawned
    baseHealth: number; // Original max health (for scaling calculations)
    baseDamage: number; // Original damage (for scaling calculations)
    baseSpeed: number; // Original speed (for scaling calculations)
}

export const createScalingComponent = (
    spawnTime: number,
    baseHealth: number,
    baseDamage: number,
    baseSpeed: number
): ScalingComponent => ({
    spawnTime,
    baseHealth,
    baseDamage,
    baseSpeed,
});
