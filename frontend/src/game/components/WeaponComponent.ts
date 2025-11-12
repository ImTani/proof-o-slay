import type { WeaponType, SpecialEffect } from '../config/GameConfig';

/**
 * Weapon Component - Manages shooting and fire rate
 */
export interface WeaponComponent {
  weaponKey: string; // Key to lookup weapon in WEAPONS config
  type: WeaponType;
  fireRate: number;
  lastShotTime: number;
  damage: number;
  bulletSpeed: number;
  bulletLifespan: number;
  range: number;
  weaponOffset: number; // Distance from entity center to weapon sprite
  specialEffect?: SpecialEffect;
  // Special effect parameters
  pierceCount?: number;
  homingStrength?: number;
  spreadAngle?: number;
  coneAngle?: number;
  explosionRadius?: number;
}

export const createWeaponComponent = (
  weaponKey: string,
  type: WeaponType,
  fireRate: number,
  damage: number,
  bulletSpeed: number,
  bulletLifespan: number,
  range: number,
  weaponOffset: number,
  specialEffect?: SpecialEffect,
  pierceCount?: number,
  homingStrength?: number,
  spreadAngle?: number,
  coneAngle?: number,
  explosionRadius?: number
): WeaponComponent => ({
  weaponKey,
  type,
  fireRate,
  lastShotTime: 0,
  damage,
  bulletSpeed,
  bulletLifespan,
  range,
  weaponOffset,
  specialEffect,
  pierceCount,
  homingStrength,
  spreadAngle,
  coneAngle,
  explosionRadius,
});
