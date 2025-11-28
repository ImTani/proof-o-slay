/**
 * PowerUpComponent - Tracks active power-up buffs on the player
 * Pure data structure following ECS pattern
 */

export type PowerUpType = 'speed_boost' | 'rapid_fire' | 'shield' | 'magnet' | 'double_shards';

export interface ActivePowerUp {
  type: PowerUpType;
  endTime: number; // Phaser time (scene.time.now) when buff expires
  value: number; // Effect value (speed multiplier, damage absorption, etc.)
}

export interface PowerUpComponent {
  activePowerUps: ActivePowerUp[]; // Array of currently active buffs
}

/**
 * Factory function to create a PowerUpComponent
 */
export const createPowerUpComponent = (): PowerUpComponent => ({
  activePowerUps: [],
});

/**
 * Helper to check if a specific power-up type is active
 */
export const hasPowerUp = (component: PowerUpComponent, type: PowerUpType): boolean => {
  const now = Date.now();
  return component.activePowerUps.some(
    (powerUp) => powerUp.type === type && powerUp.endTime > now
  );
};

/**
 * Helper to get active power-up of specific type
 */
export const getPowerUp = (component: PowerUpComponent, type: PowerUpType): ActivePowerUp | undefined => {
  const now = Date.now();
  return component.activePowerUps.find(
    (powerUp) => powerUp.type === type && powerUp.endTime > now
  );
};
