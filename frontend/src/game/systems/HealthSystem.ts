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
   */
  activateInvincibility(
    sprite: Phaser.Physics.Arcade.Sprite,
    health: HealthComponent,
    duration: number,
    scene: Phaser.Scene,
    time: number
  ): void {
    health.isInvincible = true;
    health.invincibilityEndTime = time + duration;
    
    // Flashing effect
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
    
    // End invincibility
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
