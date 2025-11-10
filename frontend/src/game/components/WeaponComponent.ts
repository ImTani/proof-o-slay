/**
 * Weapon Component - Manages shooting and fire rate
 */
export interface WeaponComponent {
  fireRate: number;
  lastShotTime: number;
  damage: number;
  bulletSpeed: number;
}

export const createWeaponComponent = (
  fireRate: number = 500,
  damage: number = 10,
  bulletSpeed: number = 400
): WeaponComponent => ({
  fireRate,
  lastShotTime: 0,
  damage,
  bulletSpeed,
});
