import Phaser from 'phaser';
import type { WeaponSpriteComponent } from '../components/WeaponSpriteComponent';

/**
 * WeaponSystem - Positions and rotates weapon sprites around entities
 */
export class WeaponSystem {
  /**
   * Update weapon position to orbit around entity and aim toward target
   */
  update(
    entity: Phaser.Physics.Arcade.Sprite,
    weaponSprite: WeaponSpriteComponent,
    targetX: number,
    targetY: number
  ): void {
    // Calculate angle from entity to target (cursor)
    const angle = Phaser.Math.Angle.Between(
      entity.x,
      entity.y,
      targetX,
      targetY
    );
    
    // Position weapon sprite offset from entity center toward cursor
    weaponSprite.sprite.x = entity.x + Math.cos(angle) * weaponSprite.offset;
    weaponSprite.sprite.y = entity.y + Math.sin(angle) * weaponSprite.offset;
    
    // Rotate weapon to aim toward cursor
    weaponSprite.sprite.setRotation(angle);
  }
}
