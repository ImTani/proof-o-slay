import Phaser from 'phaser';
import { createHealthComponent } from '../components/HealthComponent';
import { createMovementComponent } from '../components/MovementComponent';
import { createWeaponComponent } from '../components/WeaponComponent';
import { createInputComponent } from '../components/InputComponent';
import { createWeaponSpriteComponent } from '../components/WeaponSpriteComponent';
import { createClassComponent, type ClassType } from '../components/ClassComponent';
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
    stats.weapon.damage * stats.damageMultiplier, // Apply class damage multiplier
    stats.weapon.bulletSpeed
  ));
  sprite.setData('input', createInputComponent(scene));
  sprite.setData('weaponSprite', createWeaponSpriteComponent(weaponSprite, stats.weapon.weaponOffset));
  sprite.setData('class', createClassComponent(className as ClassType, stats.skillCooldown));
  sprite.setData('entityType', 'player');
  sprite.setData('className', className);
  sprite.setData('weaponConfig', stats.weapon);
  sprite.setData('damageMultiplier', stats.damageMultiplier);
  
  console.log(`🎮 ${CHARACTER_CLASSES[className].name} created with HP: ${stats.maxHealth}, Speed: ${stats.speed}, Damage: ${stats.damageMultiplier}x, Weapon: ${stats.weapon.name}`);
  
  return sprite;
};

/**
 * Warrior Entity Factory - Balanced bruiser (120 HP, 100 speed, 1.0x damage)
 */
export const createWarriorEntity = (
  scene: Phaser.Scene,
  x: number,
  y: number,
  upgrades: PlayerUpgrades
): Phaser.Physics.Arcade.Sprite => {
  return createPlayerEntity(scene, x, y, upgrades, 'WARRIOR');
};

/**
 * Mage Entity Factory - Glass cannon (80 HP, 90 speed, 1.3x damage)
 */
export const createMageEntity = (
  scene: Phaser.Scene,
  x: number,
  y: number,
  upgrades: PlayerUpgrades
): Phaser.Physics.Arcade.Sprite => {
  return createPlayerEntity(scene, x, y, upgrades, 'MAGE');
};

/**
 * Rogue Entity Factory - High mobility (100 HP, 120 speed, 1.1x damage)
 */
export const createRogueEntity = (
  scene: Phaser.Scene,
  x: number,
  y: number,
  upgrades: PlayerUpgrades
): Phaser.Physics.Arcade.Sprite => {
  return createPlayerEntity(scene, x, y, upgrades, 'ROGUE');
};
