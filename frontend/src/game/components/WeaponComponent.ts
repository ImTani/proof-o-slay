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
  fireRate: number,
  damage: number,
  bulletSpeed: number
): WeaponComponent => ({
  fireRate,
  lastShotTime: 0,
  damage,
  bulletSpeed,
});
