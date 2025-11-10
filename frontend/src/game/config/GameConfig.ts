/**
 * Game Configuration - Centralized constants for balancing
 * All game values should be pulled from here, not hardcoded
 */

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
  bulletOffset: number; // distance from player center
}

export const WEAPONS: Record<string, WeaponConfig> = {
  BASIC_GUN: {
    name: 'Basic Gun',
    fireRate: 500,
    damage: 10,
    bulletSpeed: 400,
    bulletLifespan: 2000,
    bulletOffset: 20, // Spawn bullets 20px in front of player
  },
  // Future weapons can be added here
  SHOTGUN: {
    name: 'Shotgun',
    fireRate: 800,
    damage: 8,
    bulletSpeed: 350,
    bulletLifespan: 1500,
    bulletOffset: 20,
  },
  RAPID_FIRE: {
    name: 'Rapid Fire',
    fireRate: 200,
    damage: 5,
    bulletSpeed: 450,
    bulletLifespan: 2000,
    bulletOffset: 20,
  },
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
    startingWeapon: 'BASIC_GUN',
    healthModifier: 1.0,
    speedModifier: 1.0,
    description: 'Balanced fighter with steady aim',
  },
  // Future classes can be added here
  TANK: {
    name: 'Tank',
    startingWeapon: 'SHOTGUN',
    healthModifier: 1.5,
    speedModifier: 0.8,
    description: 'High HP, slow movement, powerful close-range weapon',
  },
  SCOUT: {
    name: 'Scout',
    startingWeapon: 'RAPID_FIRE',
    healthModifier: 0.8,
    speedModifier: 1.3,
    description: 'Low HP, fast movement, rapid fire',
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
  // Future enemy types
  TANK: {
    name: 'Tank Slime',
    health: 100,
    speed: 20,
    damage: 20,
    color: 0x9c27b0, // Purple
  },
  FAST: {
    name: 'Fast Slime',
    health: 15,
    speed: 80,
    damage: 5,
    color: 0xff9800, // Orange
  },
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
    cost: 300, // DUNGEON tokens
  },
  BOOTS: {
    name: 'Swift Boots',
    speedMultiplier: 1.2, // +20% speed
    cost: 500, // DUNGEON tokens
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
} as const;

// ===== WORLD =====
export const WORLD_CONFIG = {
  WIDTH: 800,
  HEIGHT: 600,
  BACKGROUND_COLOR: '#1a1a2e',
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
  },
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
