import Phaser from 'phaser';
import { createHealthComponent } from '../components/HealthComponent';
import { createMovementComponent } from '../components/MovementComponent';
import { createWeaponComponent } from '../components/WeaponComponent';
import { createInputComponent } from '../components/InputComponent';
import { createWeaponSpriteComponent } from '../components/WeaponSpriteComponent';
import { calculatePlayerStats, CHARACTER_CLASSES } from '../config/GameConfig';

export interface PlayerUpgrades {
  hasArmor: boolean;
  hasBoots: boolean;
}

/**
 * Player Entity Factory - Composes player from components
 */
export const createPlayerEntity = (
  scene: Phaser.Scene,
  x: number,
  y: number,
  upgrades: PlayerUpgrades,
  className: keyof typeof CHARACTER_CLASSES = 'WARRIOR'
): Phaser.Physics.Arcade.Sprite => {
  const sprite = scene.physics.add.sprite(x, y, 'player');
  sprite.setCollideWorldBounds(true);
  
  // Calculate stats based on class and upgrades
  const stats = calculatePlayerStats(className, upgrades.hasArmor, upgrades.hasBoots);
  
  // Create weapon sprite (pistol) that orbits the player
  const weaponSprite = scene.add.sprite(x, y, 'pistol');
  weaponSprite.setOrigin(0.5, 0.5);
  
  // Attach components
  sprite.setData('health', createHealthComponent(stats.maxHealth));
  sprite.setData('movement', createMovementComponent(stats.speed));
  sprite.setData('weapon', createWeaponComponent(
    stats.weapon.fireRate,
    stats.weapon.damage,
    stats.weapon.bulletSpeed
  ));
  sprite.setData('input', createInputComponent(scene));
  sprite.setData('weaponSprite', createWeaponSpriteComponent(weaponSprite, stats.weapon.weaponOffset));
  sprite.setData('entityType', 'player');
  sprite.setData('className', className);
  sprite.setData('weaponConfig', stats.weapon);
  
  console.log(`🎮 ${CHARACTER_CLASSES[className].name} created with HP: ${stats.maxHealth}, Speed: ${stats.speed}, Weapon: ${stats.weapon.name}`);
  
  return sprite;
};
