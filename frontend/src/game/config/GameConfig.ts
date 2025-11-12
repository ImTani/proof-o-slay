/**
 * Game Configuration - Centralized constants for balancing
 * All game values should be pulled from here, not hardcoded
 */

import Phaser from 'phaser';

// ===== PLAYER =====
export const PLAYER_CONFIG = {
  BASE_HEALTH: 100,
  BASE_SPEED: 100,
  INVINCIBILITY_DURATION: 1000, // ms
  KNOCKBACK_FORCE: 200,
} as const;

// ===== WEAPONS =====
export interface WeaponConfig {
  name: string;
  fireRate: number; // ms between shots
  damage: number;
  bulletSpeed: number;
  bulletLifespan: number; // ms
  weaponOffset: number; // distance from player center to weapon sprite
}

export const WEAPONS: Record<string, WeaponConfig> = {
  PISTOL: {
    name: 'Pistol',
    fireRate: 500,
    damage: 10,
    bulletSpeed: 400,
    bulletLifespan: 2000,
    weaponOffset: 25, // Weapon orbits 25px from player center
  },
  // Future weapons can be added here
} as const;

// ===== CLASSES =====
export interface CharacterClass {
  name: string;
  startingWeapon: keyof typeof WEAPONS;
  healthModifier: number; // Multiplier (1.0 = 100 HP, 1.2 = 120 HP)
  speedModifier: number; // Multiplier (1.0 = 100 speed, 1.2 = 120 speed)
  description: string;
}

export const CHARACTER_CLASSES: Record<string, CharacterClass> = {
  WARRIOR: {
    name: 'Warrior',
    startingWeapon: 'PISTOL',
    healthModifier: 1.0,
    speedModifier: 1.0,
    description: 'Balanced fighter with steady aim',
  },
  // Future classes can be added here
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
  
  let maxHealth = PLAYER_CONFIG.BASE_HEALTH * classData.healthModifier;
  if (hasArmor) {
    maxHealth += UPGRADE_CONFIG.ARMOR.healthBonus;
  }
  
  let speed = PLAYER_CONFIG.BASE_SPEED * classData.speedModifier;
  if (hasBoots) {
    speed *= UPGRADE_CONFIG.BOOTS.speedMultiplier;
  }
  
  return {
    maxHealth: Math.round(maxHealth),
    speed: Math.round(speed),
    weapon: WEAPONS[classData.startingWeapon],
  };
};
