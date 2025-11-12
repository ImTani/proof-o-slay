import type { SpecialEffect } from '../config/GameConfig';

/**
 * Projectile Component - Marks entity as a projectile with lifespan
 */
export interface ProjectileComponent {
  damage: number;
  spawnTime: number;
  lifespan: number;
  specialEffect?: SpecialEffect;
  pierceCount?: number; // Remaining pierces (decrements on hit)
  homingStrength?: number; // How strongly it homes (0-1)
  explosionRadius?: number; // For explosive projectiles
  hasHit?: boolean; // For tracking if projectile already hit (non-piercing)
}

export const createProjectileComponent = (
  damage: number = 10,
  lifespan: number = 2000,
  spawnTime: number = 0, // Should be passed from scene (Phaser time, not Date.now)
  specialEffect?: SpecialEffect,
  pierceCount?: number,
  homingStrength?: number,
  explosionRadius?: number
): ProjectileComponent => ({
  damage,
  spawnTime,
  lifespan,
  specialEffect,
  pierceCount,
  homingStrength,
  explosionRadius,
  hasHit: false,
});
