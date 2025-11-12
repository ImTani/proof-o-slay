/**
 * Game Configuration - Centralized constants for balancing
 * All game values should be pulled from here, not hardcoded
 */

import Phaser from 'phaser';

// ===== PLAYER =====
export const PLAYER_CONFIG = {
  BASE_HEALTH: 100,
  BASE_SPEED: 100,
  INVINCIBILITY_DURATION: 300, // ms
  KNOCKBACK_FORCE: 200,
} as const;

// ===== WEAPONS =====
export type WeaponType = 'melee_arc' | 'homing' | 'dual_shot' | 'piercing' | 'cone_dot' | 'explosive';
export type SpecialEffect = 'pierce_3' | 'homing' | 'spread' | 'pierce_all' | 'cone_aoe' | 'explosive_aoe';

export interface WeaponConfig {
  name: string;
  type: WeaponType;
  fireRate: number; // ms between shots
  damage: number;
  bulletSpeed: number;
  bulletLifespan: number; // ms
  weaponOffset: number; // distance from player center to weapon sprite
  range: number; // effective range in pixels
  specialEffect?: SpecialEffect;
  // Special effect parameters
  pierceCount?: number; // for pierce weapons
  homingStrength?: number; // for homing weapons (0-1)
  spreadAngle?: number; // for dual-shot (in radians)
  coneAngle?: number; // for cone weapons (in radians)
  explosionRadius?: number; // for explosive weapons
}

export const WEAPONS: Record<string, WeaponConfig> = {
  // Class Starter Weapons
  IRON_SWORD: {
    name: 'Iron Sword',
    type: 'melee_arc',
    fireRate: 500, // 0.5s cooldown
    damage: 15,
    bulletSpeed: 0, // Melee weapon (no projectile travel)
    bulletLifespan: 200, // Arc visual lasts 200ms
    weaponOffset: 25,
    range: 50, // 50px melee range
    specialEffect: 'pierce_3',
    pierceCount: 3,
  },
  ARCANE_STAFF: {
    name: 'Arcane Staff',
    type: 'homing',
    fireRate: 600, // 0.6s cooldown
    damage: 12,
    bulletSpeed: 250, // Slower than normal (homing compensates)
    bulletLifespan: 3000, // 3 seconds to find target
    weaponOffset: 25,
    range: 300, // Auto-targets in 300px radius
    specialEffect: 'homing',
    homingStrength: 0.5, // Moderate homing (0-1 scale)
  },
  TWIN_DAGGERS: {
    name: 'Twin Daggers',
    type: 'dual_shot',
    fireRate: 300, // 0.3s cooldown (rapid fire)
    damage: 8, // Lower damage per hit, but fires 2
    bulletSpeed: 450, // Fast projectiles
    bulletLifespan: 1500,
    weaponOffset: 25,
    range: 200,
    specialEffect: 'spread',
    spreadAngle: Math.PI / 12, // 15 degree spread
  },
  
  // Unlockable Weapons
  HEAVY_CROSSBOW: {
    name: 'Heavy Crossbow',
    type: 'piercing',
    fireRate: 1200, // 1.2s cooldown (slow but powerful)
    damage: 30,
    bulletSpeed: 500,
    bulletLifespan: 2500,
    weaponOffset: 30,
    range: 400,
    specialEffect: 'pierce_all',
    pierceCount: 999, // Infinite pierce
  },
  FLAMETHROWER: {
    name: 'Flamethrower',
    type: 'cone_dot',
    fireRate: 100, // 0.1s cooldown (continuous stream)
    damage: 5, // Per tick (DPS = 50)
    bulletSpeed: 200, // Flames move slowly
    bulletLifespan: 800, // Short-lived particles
    weaponOffset: 30,
    range: 150, // Cone extends 150px
    specialEffect: 'cone_aoe',
    coneAngle: Math.PI / 4, // 45 degree cone
  },
  CELESTIAL_CANNON: {
    name: 'Celestial Cannon',
    type: 'explosive',
    fireRate: 2000, // 2.0s cooldown (slow but devastating)
    damage: 100, // Direct hit damage
    bulletSpeed: 600,
    bulletLifespan: 3000,
    weaponOffset: 35,
    range: 600,
    specialEffect: 'explosive_aoe',
    explosionRadius: 200, // 200px explosion radius
  },
  
  // Legacy weapon for testing (can be removed later)
  PISTOL: {
    name: 'Pistol',
    type: 'dual_shot',
    fireRate: 500,
    damage: 10,
    bulletSpeed: 400,
    bulletLifespan: 2000,
    weaponOffset: 25,
    range: 300,
  },
} as const;

// ===== CLASSES =====
export interface CharacterClass {
  name: string;
  startingWeapon: keyof typeof WEAPONS;
  baseHealth: number; // Base HP
  baseSpeed: number; // Base movement speed
  damageMultiplier: number; // Damage multiplier (1.0 = base, 1.3 = +30%)
  skillCooldown: number; // ms between skill uses
  description: string;
  skillName: string;
  skillDescription: string;
}

export const CHARACTER_CLASSES: Record<string, CharacterClass> = {
  WARRIOR: {
    name: 'Warrior',
    startingWeapon: 'IRON_SWORD',
    baseHealth: 120,
    baseSpeed: 100,
    damageMultiplier: 1.0,
    skillCooldown: 5000, // 5 seconds
    description: 'Balanced bruiser with high survivability',
    skillName: 'Battle Dash',
    skillDescription: 'Dash forward, invincible 0.5s, damage enemies',
  },
  MAGE: {
    name: 'Mage',
    startingWeapon: 'ARCANE_STAFF',
    baseHealth: 80,
    baseSpeed: 90,
    damageMultiplier: 1.3,
    skillCooldown: 8000, // 8 seconds
    description: 'Glass cannon with highest damage output',
    skillName: 'Arcane Nova',
    skillDescription: '150 damage to all enemies in radius, knockback',
  },
  ROGUE: {
    name: 'Rogue',
    startingWeapon: 'TWIN_DAGGERS',
    baseHealth: 100,
    baseSpeed: 120,
    damageMultiplier: 1.1,
    skillCooldown: 10000, // 10 seconds
    description: 'High mobility assassin with evasion',
    skillName: 'Phantom Barrier',
    skillDescription: 'Absorb next 100 damage, lasts 6 seconds',
  },
} as const;

// ===== ENEMIES =====
export const ENEMY_CONFIG = {
  SLIME: {
    name: 'Slime',
    health: 30,
    speed: 40,
    damage: 10,
    color: 0xf44336, // Red
  },
  // Future enemy types can be added here
} as const;

// ===== WAVE SYSTEM =====
export const WAVE_CONFIG = {
  BASE_ENEMY_COUNT: 5,
  ENEMIES_PER_WAVE: 2, // +2 enemies each wave
  DELAY_BETWEEN_WAVES: 2000, // ms
  SPAWN_EDGE_MARGIN: 50, // pixels from edge
} as const;

// ===== COLLECTIBLES =====
export const COLLECTIBLE_CONFIG = {
  SHARD: {
    value: 1,
    dropChance: 1.0, // 100% drop rate
    floatDistance: 10, // pixels
    floatDuration: 500, // ms
  },
} as const;

// ===== UPGRADES =====
export const UPGRADE_CONFIG = {
  ARMOR: {
    name: "Hero's Armor",
    healthBonus: 20, // +20 HP
    cost: 300, // SLAY tokens
  },
  BOOTS: {
    name: 'Swift Boots',
    speedMultiplier: 1.2, // +20% speed
    cost: 500, // SLAY tokens
  },
} as const;

// ===== UI =====
export const UI_CONFIG = {
  HEALTH_BAR: {
    width: 40,
    height: 6,
    offsetY: -30, // Above player
    backgroundColor: 0x222222,
    healthyColor: 0x4caf50, // Green
    warningColor: 0xffeb3b, // Yellow
    criticalColor: 0xf44336, // Red
    warningThreshold: 0.6,
    criticalThreshold: 0.3,
  },
  TEXT: {
    fontSize: '18px',
    fontFamily: 'Arial',
    healthColor: '#ffffff',
    shardColor: '#4caf50',
    waveColor: '#ffeb3b',
  },
  GAME_OVER: {
    title: {
      fontSize: '64px',
      color: '#ff0000',
      fontFamily: 'Arial',
      stroke: '#000000',
      strokeThickness: 6,
      offsetY: -50, // Offset from center
    },
    shardsDisplay: {
      fontSize: '32px',
      color: '#4caf50',
      fontFamily: 'Arial',
      stroke: '#000000',
      strokeThickness: 4,
      offsetY: 30, // Offset from center
    },
  },
} as const;

// ===== DISPLAY =====
export const DISPLAY_CONFIG = {
  WIDTH: 1920,
  HEIGHT: 1080,
  ASPECT_RATIO: 16 / 9,
  BACKGROUND_COLOR: '#1a1a2e',
  SCALE_MODE: Phaser.Scale.FIT, // Fit to container maintaining aspect ratio
  SCALE_CENTER: true, // Center the game canvas
} as const;

// ===== WORLD ===== (Infinite scrolling world)
export const WORLD_CONFIG = {
  WIDTH: 10000, // Infinite world bounds
  HEIGHT: 10000,
  BACKGROUND_COLOR: '#1a1a2e',
  TILE_SIZE: 64, // Size of background tiles for seamless tiling
} as const;

// ===== CAMERA =====
export const CAMERA_CONFIG = {
  LERP_X: 0.2, // Smooth follow lerp factor (0-1) - higher = tighter follow
  LERP_Y: 0.2,
  ZOOM: 1.0, // Default zoom level
  DEADZONE_WIDTH: 0.1, // Small deadzone to reduce jitter (fraction of screen)
  DEADZONE_HEIGHT: 0.1,
  ROUND_PIXELS: true, // Prevent sub-pixel jitter
} as const;

// ===== INPUT =====
export const INPUT_CONFIG = {
  GAMEPAD: {
    DEADZONE: 0.15, // Analog stick deadzone (0-1)
    AIM_SENSITIVITY: 1.0, // Aiming sensitivity multiplier
    MIN_AIM_DISTANCE: 50, // Minimum distance from player to show aim direction
  },
  KEYBOARD: {
    FOCUS_VISUAL_SCALE: 1.1, // Scale multiplier for focused UI elements
    FOCUS_TINT: 0xffff00, // Yellow tint for focused elements
    REPEAT_DELAY: 200, // ms before key repeat starts
    REPEAT_RATE: 50, // ms between repeats
  },
} as const;

// ===== GRAPHICS =====
export const GRAPHICS_CONFIG = {
  PLAYER: {
    width: 32,
    height: 32,
    color: 0x4287f5, // Blue
  },
  BULLET: {
    radius: 4,
    color: 0xffeb3b, // Yellow
  },
  ENEMY: {
    radius: 16,
    // Color defined per enemy type
  },
  SHARD: {
    size: 16,
    color: 0x4caf50, // Green
    scale: 1.5,
    floatOffset: 10,        // Vertical offset for float animation (pixels)
    floatDuration: 500,     // Float animation duration (ms)
    pulseScale: 1.7,        // Max scale during pulse animation
    pulseDuration: 800,     // Pulse animation duration (ms)
    rotateDuration: 3000,   // Rotation animation duration (ms)
  },
  DAMAGE_FLASH_DURATION: 100,    // Duration of red tint when taking damage (ms)
  IFRAME_FLASH_INTERVAL: 100,    // Interval between flashes during invincibility (ms)
} as const;

// ===== HELPER FUNCTIONS =====

/**
 * Calculate player stats based on class and upgrades
 */
export const calculatePlayerStats = (
  className: keyof typeof CHARACTER_CLASSES,
  hasArmor: boolean,
  hasBoots: boolean
) => {
  const classData = CHARACTER_CLASSES[className];
  
  let maxHealth = classData.baseHealth;
  if (hasArmor) {
    maxHealth += UPGRADE_CONFIG.ARMOR.healthBonus;
  }
  
  let speed = classData.baseSpeed;
  if (hasBoots) {
    speed *= UPGRADE_CONFIG.BOOTS.speedMultiplier;
  }
  
  return {
    maxHealth: Math.round(maxHealth),
    speed: Math.round(speed),
    damageMultiplier: classData.damageMultiplier,
    weapon: WEAPONS[classData.startingWeapon],
    skillCooldown: classData.skillCooldown,
  };
};
