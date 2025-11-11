/**
 * Projectile Component - Marks entity as a projectile with lifespan
 */
export interface ProjectileComponent {
  damage: number;
  spawnTime: number;
  lifespan: number;
}

export const createProjectileComponent = (
  damage: number = 10,
  lifespan: number = 2000,
  spawnTime: number = 0 // Should be passed from scene (Phaser time, not Date.now)
): ProjectileComponent => ({
  damage,
  spawnTime,
  lifespan,
});
