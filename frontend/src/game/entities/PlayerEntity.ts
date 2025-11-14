import Phaser from 'phaser';
import { createHealthComponent } from '../components/HealthComponent';
import { createMovementComponent } from '../components/MovementComponent';
import { createWeaponComponent } from '../components/WeaponComponent';
import { createInputComponent } from '../components/InputComponent';
import { createWeaponSpriteComponent } from '../components/WeaponSpriteComponent';
import { createClassComponent, type ClassType } from '../components/ClassComponent';
import { createBattleDashComponent } from '../components/BattleDashComponent';
import { createArcaneNovaComponent } from '../components/ArcaneNovaComponent';
import { createPhantomBarrierComponent } from '../components/PhantomBarrierComponent';
import { calculatePlayerStats, CHARACTER_CLASSES, type SkillType } from '../config/GameConfig';
import type { SkillManager } from '../systems/SkillManager';

export interface PlayerUpgrades {
  hasArmor: boolean;
  hasBoots: boolean;
}

/**
 * Attach skill component based on class and register with SkillManager
 */
function attachSkillComponent(
  sprite: Phaser.Physics.Arcade.Sprite,
  className: keyof typeof CHARACTER_CLASSES,
  skillManager?: SkillManager
): void {
  let skillType: SkillType | undefined;

  switch (className) {
    case 'WARRIOR':
      sprite.setData('battleDash', createBattleDashComponent());
      skillType = 'BATTLE_DASH';
      break;
    case 'MAGE':
      sprite.setData('arcaneNova', createArcaneNovaComponent());
      skillType = 'ARCANE_NOVA';
      break;
    case 'ROGUE':
      sprite.setData('phantomBarrier', createPhantomBarrierComponent());
      skillType = 'PHANTOM_BARRIER';
      break;
  }

  // Register with skill manager if provided
  if (skillManager && skillType) {
    skillManager.registerSkill(sprite, skillType);
  }
}

/**
 * Player Entity Factory - Composes player from components
 */
export const createPlayerEntity = (
  scene: Phaser.Scene,
  x: number,
  y: number,
  upgrades: PlayerUpgrades,
  className: keyof typeof CHARACTER_CLASSES = 'WARRIOR',
  skillManager?: SkillManager
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
    CHARACTER_CLASSES[className].startingWeapon, // weaponKey
    stats.weapon.type,
    stats.weapon.fireRate,
    stats.weapon.damage * stats.damageMultiplier, // Apply class damage multiplier
    stats.weapon.bulletSpeed,
    stats.weapon.bulletLifespan,
    stats.weapon.range,
    stats.weapon.weaponOffset,
    stats.weapon.specialEffect,
    stats.weapon.pierceCount,
    stats.weapon.homingStrength,
    stats.weapon.spreadAngle,
    stats.weapon.coneAngle,
    stats.weapon.explosionRadius
  ));
  sprite.setData('input', createInputComponent(scene));
  sprite.setData('weaponSprite', createWeaponSpriteComponent(weaponSprite, stats.weapon.weaponOffset));
  sprite.setData('class', createClassComponent(className as ClassType, stats.skillCooldown));

  // Attach appropriate skill component based on class and register with manager
  attachSkillComponent(sprite, className, skillManager);

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
  upgrades: PlayerUpgrades,
  skillManager?: SkillManager
): Phaser.Physics.Arcade.Sprite => {
  return createPlayerEntity(scene, x, y, upgrades, 'WARRIOR', skillManager);
};

/**
 * Mage Entity Factory - Glass cannon (80 HP, 90 speed, 1.3x damage)
 */
export const createMageEntity = (
  scene: Phaser.Scene,
  x: number,
  y: number,
  upgrades: PlayerUpgrades,
  skillManager?: SkillManager
): Phaser.Physics.Arcade.Sprite => {
  return createPlayerEntity(scene, x, y, upgrades, 'MAGE', skillManager);
};

/**
 * Rogue Entity Factory - High mobility (100 HP, 120 speed, 1.1x damage)
 */
export const createRogueEntity = (
  scene: Phaser.Scene,
  x: number,
  y: number,
  upgrades: PlayerUpgrades,
  skillManager?: SkillManager
): Phaser.Physics.Arcade.Sprite => {
  return createPlayerEntity(scene, x, y, upgrades, 'ROGUE', skillManager);
};
