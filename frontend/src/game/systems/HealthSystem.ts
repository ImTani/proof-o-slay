import Phaser from 'phaser';
import type { HealthComponent } from '../components/HealthComponent';
import { GRAPHICS_CONFIG } from '../config/GameConfig';

/**
 * HealthSystem - Manages health, damage, and invincibility
 */
export class HealthSystem {
  /**
   * Apply damage to an entity
   */
  takeDamage(
    sprite: Phaser.Physics.Arcade.Sprite,
    health: HealthComponent,
    damage: number,
    scene: Phaser.Scene,
    time: number
  ): boolean {
    // Skip if invincible
    if (health.isInvincible && time < health.invincibilityEndTime) {
      return false;
    }
    
    // Apply damage
    health.current -= damage;
    
    // Visual feedback
    sprite.setTint(0xff0000);
    scene.time.delayedCall(GRAPHICS_CONFIG.DAMAGE_FLASH_DURATION, () => {
      if (sprite.active) {
        sprite.clearTint();
      }
    });
    
    return health.current <= 0;
  }
  
  /**
   * Activate invincibility frames
   * Note: Uses Phaser time (scene.time) for visual effects, but sets
   * invincibilityEndTime using system time (Date.now()) for collision checking
   */
  activateInvincibility(
    sprite: Phaser.Physics.Arcade.Sprite,
    health: HealthComponent,
    duration: number,
    scene: Phaser.Scene,
    systemTime: number
  ): void {
    health.isInvincible = true;
    // Use system time (Date.now()) for invincibility end time
    health.invincibilityEndTime = systemTime + duration;
    
    // Flashing effect using Phaser time (for visual feedback only)
    let flashCount = 0;
    const totalFlashes = Math.floor(duration / GRAPHICS_CONFIG.IFRAME_FLASH_INTERVAL);
    
    const flashInterval = scene.time.addEvent({
      delay: GRAPHICS_CONFIG.IFRAME_FLASH_INTERVAL,
      repeat: totalFlashes - 1,
      callback: () => {
        flashCount++;
        if (flashCount % 2 === 0) {
          sprite.setTint(0xff0000);
        } else {
          sprite.clearTint();
        }
      },
    });
    
    // End invincibility using Phaser time (for cleanup only)
    scene.time.delayedCall(duration, () => {
      health.isInvincible = false;
      sprite.clearTint();
      flashInterval.destroy();
    });
  }
  
  /**
   * Check if entity is dead
   */
  isDead(health: HealthComponent): boolean {
    return health.current <= 0;
  }
}
