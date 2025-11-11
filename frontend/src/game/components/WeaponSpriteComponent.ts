/**
 * WeaponSpriteComponent - Holds reference to the weapon sprite
 * The weapon orbits around the player and aims toward the cursor
 */
export interface WeaponSpriteComponent {
  sprite: Phaser.GameObjects.Sprite;
  offset: number; // Distance from player center
}

export function createWeaponSpriteComponent(
  sprite: Phaser.GameObjects.Sprite,
  offset: number
): WeaponSpriteComponent {
  return {
    sprite,
    offset,
  };
}
