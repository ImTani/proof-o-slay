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

// ===== SKILLS =====
export type SkillType = 'BATTLE_DASH' | 'ARCANE_NOVA' | 'PHANTOM_BARRIER';

export interface SkillConfig {
  name: string;
  type: SkillType;
  cooldown: number; // ms
  description: string;
  // Skill-specific parameters
  damage?: number;
  radius?: number;
  distance?: number;
  duration?: number;
  absorb?: number;
  knockbackForce?: number;
  invincibilityDuration?: number;
}

export const SKILLS: Record<SkillType, SkillConfig> = {
  BATTLE_DASH: {
    name: 'Battle Dash',
    type: 'BATTLE_DASH',
    cooldown: 5000, // 5 seconds
    description: 'Dash forward, invincible during dash, damage enemies',
    damage: 20,
    distance: 200, // pixels
    invincibilityDuration: 500, // 0.5s
  },
  ARCANE_NOVA: {
    name: 'Arcane Nova',
    type: 'ARCANE_NOVA',
    cooldown: 8000, // 8 seconds
    description: 'AOE explosion that damages and knocks back enemies',
    damage: 150,
    radius: 300, // pixels
    knockbackForce: 300,
  },
  PHANTOM_BARRIER: {
    name: 'Phantom Barrier',
    type: 'PHANTOM_BARRIER',
    cooldown: 12000, // 12 seconds (increased from 10 for balance)
    description: 'Absorbs damage for a duration or until broken',
    absorb: 100,
    duration: 6000, // 6 seconds
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
    dropMultiplier: 1, // 1x shards
    powerUpDropChance: 0.08, // 8%
  },
  ARCHER: {
    name: 'Archer',
    health: 20,
    speed: 30,
    damage: 15,
    color: 0x4caf50, // Green
    dropMultiplier: 1, // 1x shards
    powerUpDropChance: 0.06, // 6%
    projectileSpeed: 200,
    projectileLifespan: 5000, // 5 seconds
    projectileTint: 0xff4444, // Red tint for enemy bullets
    fireRate: 2000, // 2 seconds between shots
    keepDistance: 200, // Maintains 200px from player
  },
  TANK: {
    name: 'Tank',
    health: 200,
    speed: 25,
    damage: 25,
    color: 0x9c27b0, // Purple
    dropMultiplier: 5, // 5x shards (boss)
    powerUpDropChance: 0.30, // 30%
    crossbowDropChance: 0.10, // 10% chance to drop Heavy Crossbow
    knockbackResistance: 0.8, // Takes 20% of normal knockback
  },
} as const;

// ===== SCALING =====
export const SCALING_CONFIG = {
  HP_PER_MINUTE: 0.05, // +5% HP per minute
  DAMAGE_PER_MINUTE: 0.04, // +4% damage per minute
  SPEED_PER_MINUTE: 0.02, // +2% speed per minute
  SPAWN_RATE_PER_MINUTE: 0.10, // +10% spawn rate per minute
} as const;

// ===== INFINITE SPAWN SYSTEM =====
export const SPAWN_CONFIG = {
  BASE_SPAWN_INTERVAL: 1500, // ms between spawns (base rate)
  SPAWN_MARGIN: 100, // pixels outside camera view
  CULL_DISTANCE: 2000, // pixels from camera to cull enemies
  MAX_ENEMIES: 500, // maximum enemies alive at once
  BOSS_INTERVAL: 600000, // 10 minutes in milliseconds
  ENEMY_WEIGHTS: {
    SLIME: 0.70, // 70%
    ARCHER: 0.20, // 20%
    TANK: 0.10, // 10%
  },
} as const;

// ===== WAVE SYSTEM (DEPRECATED - Use SPAWN_CONFIG) =====
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

// ===== POWER-UPS =====
export type PowerUpType = 'speed_boost' | 'rapid_fire' | 'shield' | 'magnet' | 'double_shards';

export interface PowerUpConfig {
  name: string;
  dropChance: number; // Probability (0-1)
  duration: number; // ms the buff lasts
  color: number; // Hex color for visual
  description: string;
  // Effect-specific values
  speedMultiplier?: number;
  cooldownMultiplier?: number;
  shieldAmount?: number;
  magnetRadius?: number;
  shardMultiplier?: number;
}

export const POWERUP_CONFIG: Record<PowerUpType, PowerUpConfig> = {
  speed_boost: {
    name: 'Speed Boost',
    dropChance: 0.08, // 8%
    duration: 15000, // 15 seconds
    color: 0x00ffff, // Cyan
    description: '+50% movement speed',
    speedMultiplier: 1.5, // +50% speed
  },
  rapid_fire: {
    name: 'Rapid Fire',
    dropChance: 0.06, // 6%
    duration: 12000, // 12 seconds
    color: 0xff9800, // Orange
    description: '-50% weapon cooldowns',
    cooldownMultiplier: 0.5, // Half cooldown time
  },
  shield: {
    name: 'Shield',
    dropChance: 0.05, // 5%
    duration: 20000, // 20 seconds
    color: 0x2196f3, // Blue
    description: 'Absorb next 150 damage',
    shieldAmount: 150, // Damage absorption
  },
  magnet: {
    name: 'Magnet',
    dropChance: 0.07, // 7%
    duration: 20000, // 20 seconds
    color: 0xe91e63, // Pink
    description: 'Auto-collect shards in 400px radius',
    magnetRadius: 400, // Auto-collect distance
  },
  double_shards: {
    name: 'Double Shards',
    dropChance: 0.03, // 3%
    duration: 25000, // 25 seconds
    color: 0xffd700, // Gold
    description: '2x shard drops',
    shardMultiplier: 2, // 2x shards
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

// ===== UI LAYOUT =====
export const UI_LAYOUT_CONFIG = {
  WEAPON_AIM_DISTANCE: 100, // Distance to project aim indicator from player (pixels)
  SKILL_BAR: {
    WIDTH: 100, // Width of skill cooldown bar
    OFFSET_Y: 65, // Distance above player
    TEXT_OFFSET_Y: 10, // Distance of text above bar
  },
  POWERUP_DISPLAY: {
    ICON_SIZE: 24, // Size of power-up icons
    ICON_SPACING: 30, // Spacing between icons
    OFFSET_X: 150, // Horizontal offset from left edge (screen space)
    OFFSET_Y: 20, // Vertical offset from top edge (screen space)
    TIMER_FONT_SIZE: '14px',
    TIMER_OFFSET_Y: 20, // Offset of timer text below icon
  },
  DEPTHS: {
    GAMEPLAY: 0, // Game world objects
    HUD: 1000, // HUD elements (health, shards, etc)
    PAUSE_OVERLAY: 1500, // Pause menu overlay
    PAUSE_UI: 1600, // Pause menu buttons
    GAME_OVER: 2000, // Game over screen
  },
  GAME_OVER: {
    BUTTON_OFFSET_X: 150, // Horizontal spacing between buttons
    BUTTON_OFFSET_Y: 120, // Vertical offset of buttons from center
    HINT_OFFSET_Y: 200, // Vertical offset of hint text
  },
  PAUSE_MENU: {
    TITLE_OFFSET_Y: -100, // Vertical offset of title from center
    BUTTON_OFFSET_Y: 20, // Vertical offset of first button from center
    BUTTON_SPACING: 80, // Vertical spacing between buttons
  },
  PADDING: 20, // General UI padding
  LINE_HEIGHT: 35, // Line height for multi-line text
  FLASH_DURATION: 300, // Duration for UI flash effects (ms)
} as const;

// ===== WEAPON SPECIAL EFFECTS =====
export const WEAPON_EFFECTS_CONFIG = {
  CONE_PROJECTILE_COUNT: 5, // Number of projectiles in cone weapons
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
