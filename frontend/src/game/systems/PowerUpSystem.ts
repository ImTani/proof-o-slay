import Phaser from 'phaser';
import type { PowerUpComponent } from '../components/PowerUpComponent';
import type { PowerUpType } from '../config/GameConfig';
import { POWERUP_CONFIG } from '../config/GameConfig';

/**
 * PowerUpManager - Centralized system for managing all power-up buffs
 * 
 * This manager:
 * - Activates power-up buffs on entities
 * - Tracks active power-up durations
 * - Provides queries for power-up effects
 * - Applies power-up effects to entity stats
 * 
 * Benefits:
 * - Single import point for power-up functionality
 * - Centralized buff logic
 * - Easy integration with other systems
 */
export class PowerUpManager {
  private scene: Phaser.Scene;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  /**
   * Activate a power-up buff on an entity
   */
  activatePowerUp(
    entity: Phaser.Physics.Arcade.Sprite,
    type: PowerUpType
  ): void {
    const powerUpComp = entity.getData('powerUp') as PowerUpComponent;
    if (!powerUpComp) return;

    const config = POWERUP_CONFIG[type];
    const now = Date.now();
    const endTime = now + config.duration;

    // Check if this power-up type is already active
    const existingIndex = powerUpComp.activePowerUps.findIndex(p => p.type === type);

    if (existingIndex !== -1) {
      // Refresh duration if already active
      powerUpComp.activePowerUps[existingIndex].endTime = endTime;
      powerUpComp.activePowerUps[existingIndex].value = this.getEffectValue(type);
    } else {
      // Add new power-up
      powerUpComp.activePowerUps.push({
        type,
        endTime,
        value: this.getEffectValue(type),
      });
    }

    // Visual feedback
    this.showPickupEffect(entity, type);
  }

  /**
   * Update all active power-ups for an entity - remove expired buffs
   * Call this every frame in the scene's update loop
   */
  update(entity: Phaser.Physics.Arcade.Sprite): void {
    const powerUpComp = entity.getData('powerUp') as PowerUpComponent;
    if (!powerUpComp) return;

    const now = Date.now();

    // Filter out expired power-ups
    powerUpComp.activePowerUps = powerUpComp.activePowerUps.filter(
      powerUp => powerUp.endTime > now
    );
  }

  /**
   * Get the speed multiplier from active power-ups
   * Apply this to MovementComponent speed
   */
  getSpeedMultiplier(entity: Phaser.Physics.Arcade.Sprite): number {
    const powerUpComp = entity.getData('powerUp') as PowerUpComponent;
    if (!powerUpComp) return 1;

    const speedBoost = powerUpComp.activePowerUps.find(p => p.type === 'speed_boost');
    return speedBoost ? POWERUP_CONFIG.speed_boost.speedMultiplier! : 1;
  }

  /**
   * Get the cooldown multiplier from active power-ups
   * Apply this to WeaponComponent fire rate
   */
  getCooldownMultiplier(entity: Phaser.Physics.Arcade.Sprite): number {
    const powerUpComp = entity.getData('powerUp') as PowerUpComponent;
    if (!powerUpComp) return 1;

    const rapidFire = powerUpComp.activePowerUps.find(p => p.type === 'rapid_fire');
    return rapidFire ? POWERUP_CONFIG.rapid_fire.cooldownMultiplier! : 1;
  }

  /**
   * Get remaining shield absorption amount
   */
  getShieldAmount(entity: Phaser.Physics.Arcade.Sprite): number {
    const powerUpComp = entity.getData('powerUp') as PowerUpComponent;
    if (!powerUpComp) return 0;

    const shield = powerUpComp.activePowerUps.find(p => p.type === 'shield');
    return shield ? shield.value : 0;
  }

  /**
   * Reduce shield value when absorbing damage
   * Returns remaining damage after shield absorption
   */
  applyShieldDamage(entity: Phaser.Physics.Arcade.Sprite, damage: number): number {
    const powerUpComp = entity.getData('powerUp') as PowerUpComponent;
    if (!powerUpComp) return damage;

    const shieldIndex = powerUpComp.activePowerUps.findIndex(p => p.type === 'shield');
    if (shieldIndex === -1) return damage;

    const shield = powerUpComp.activePowerUps[shieldIndex];
    shield.value -= damage;

    if (shield.value <= 0) {
      // Shield broke - remove it and return overflow damage
      const overflow = Math.abs(shield.value);
      powerUpComp.activePowerUps.splice(shieldIndex, 1);
      return overflow;
    }

    // Shield absorbed all damage
    return 0;
  }

  /**
   * Get magnet radius for auto-collecting items
   */
  getMagnetRadius(entity: Phaser.Physics.Arcade.Sprite): number {
    const powerUpComp = entity.getData('powerUp') as PowerUpComponent;
    if (!powerUpComp) return 0;

    const magnet = powerUpComp.activePowerUps.find(p => p.type === 'magnet');
    return magnet ? POWERUP_CONFIG.magnet.magnetRadius! : 0;
  }

  /**
   * Get shard multiplier for collectible drops
   */
  getShardMultiplier(entity: Phaser.Physics.Arcade.Sprite): number {
    const powerUpComp = entity.getData('powerUp') as PowerUpComponent;
    if (!powerUpComp) return 1;

    const doubleShards = powerUpComp.activePowerUps.find(p => p.type === 'double_shards');
    return doubleShards ? POWERUP_CONFIG.double_shards.shardMultiplier! : 1;
  }

  /**
   * Get all active power-ups for UI display
   */
  getActivePowerUps(entity: Phaser.Physics.Arcade.Sprite): Array<{ type: PowerUpType, timeRemaining: number }> {
    const powerUpComp = entity.getData('powerUp') as PowerUpComponent;
    if (!powerUpComp) return [];

    const now = Date.now();
    return powerUpComp.activePowerUps.map(p => ({
      type: p.type,
      timeRemaining: Math.max(0, p.endTime - now),
    }));
  }

  /**
   * Get the effect value for a power-up type
   */
  private getEffectValue(type: PowerUpType): number {
    const config = POWERUP_CONFIG[type];
    switch (type) {
      case 'speed_boost':
        return config.speedMultiplier!;
      case 'rapid_fire':
        return config.cooldownMultiplier!;
      case 'shield':
        return config.shieldAmount!;
      case 'magnet':
        return config.magnetRadius!;
      case 'double_shards':
        return config.shardMultiplier!;
      default:
        return 1;
    }
  }

  /**
   * Show visual effect when picking up a power-up
   */
  private showPickupEffect(
    entity: Phaser.Physics.Arcade.Sprite,
    type: PowerUpType
  ): void {
    const config = POWERUP_CONFIG[type];

    // Create a temporary circle graphic for the effect
    const circle = this.scene.add.circle(entity.x, entity.y, 32, config.color, 0.6);

    // Expand and fade out
    this.scene.tweens.add({
      targets: circle,
      scale: 3,
      alpha: 0,
      duration: 500,
      ease: 'Cubic.easeOut',
      onComplete: () => circle.destroy(),
    });
  }
}
