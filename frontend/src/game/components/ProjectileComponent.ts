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
  lifespan: number = 2000
): ProjectileComponent => ({
  damage,
  spawnTime: Date.now(),
  lifespan,
});
