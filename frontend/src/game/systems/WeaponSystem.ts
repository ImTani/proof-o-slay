import Phaser from 'phaser';
import type { WeaponSpriteComponent } from '../components/WeaponSpriteComponent';
import type { WeaponComponent } from '../components/WeaponComponent';
import { createBulletEntity } from '../entities/BulletEntity';
import { WEAPON_EFFECTS_CONFIG } from '../config/GameConfig';

/**
 * WeaponSystem - Handles weapon positioning, aiming, and firing
 */
export class WeaponSystem {
  /**
   * Update weapon position to orbit around entity and aim toward target
   */
  updatePosition(
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

  /**
   * Fire weapon if cooldown has elapsed
   * Returns true if weapon was fired
   */
  tryFire(
    weapon: WeaponComponent,
    bulletGroup: Phaser.Physics.Arcade.Group,
    x: number,
    y: number,
    targetX: number,
    targetY: number,
    currentTime: number,
    damageMultiplier: number = 1.0,
    cooldownMultiplier: number = 1.0
  ): boolean {
    // Check fire rate cooldown (apply cooldown multiplier)
    const effectiveFireRate = weapon.fireRate * cooldownMultiplier;
    if (currentTime - weapon.lastShotTime < effectiveFireRate) {
      return false;
    }

    // Update last shot time
    weapon.lastShotTime = currentTime;

    // Calculate angle to target
    const angle = Phaser.Math.Angle.Between(x, y, targetX, targetY);
    const finalDamage = Math.round(weapon.damage * damageMultiplier);

    // Fire based on weapon type
    switch (weapon.type) {
      case 'melee_arc':
        this.fireMeleeArc(bulletGroup, x, y, angle, finalDamage, weapon, currentTime);
        break;
      case 'homing':
        this.fireHoming(bulletGroup, x, y, angle, finalDamage, weapon, currentTime);
        break;
      case 'dual_shot':
        this.fireDualShot(bulletGroup, x, y, angle, finalDamage, weapon, currentTime);
        break;
      case 'piercing':
        this.firePiercing(bulletGroup, x, y, angle, finalDamage, weapon, currentTime);
        break;
      case 'cone_dot':
        this.fireCone(bulletGroup, x, y, angle, finalDamage, weapon, currentTime);
        break;
      case 'explosive':
        this.fireExplosive(bulletGroup, x, y, angle, finalDamage, weapon, currentTime);
        break;
      default:
        // Fallback: simple projectile
        this.fireSimple(bulletGroup, x, y, angle, finalDamage, weapon, currentTime);
    }

    return true;
  }

  /**
   * Fire a melee arc (Iron Sword)
   * Creates a short-lived arc hitbox in front of player
   */
  private fireMeleeArc(
    bulletGroup: Phaser.Physics.Arcade.Group,
    x: number,
    y: number,
    angle: number,
    damage: number,
    weapon: WeaponComponent,
    currentTime: number
  ): void {
    // Create 3 projectiles in a small arc for melee effect
    const arcSpread = Math.PI / 6; // 30 degrees total spread
    const angles = [angle - arcSpread / 2, angle, angle + arcSpread / 2];

    angles.forEach((a) => {
      const offsetX = Math.cos(a) * weapon.weaponOffset;
      const offsetY = Math.sin(a) * weapon.weaponOffset;

      createBulletEntity(
        bulletGroup,
        x + offsetX,
        y + offsetY,
        a,
        damage,
        weapon.bulletSpeed || 300, // Short-range fast travel
        weapon.bulletLifespan,
        currentTime,
        weapon.specialEffect,
        weapon.pierceCount,
        weapon.homingStrength,
        weapon.explosionRadius
      );
    });
  }

  /**
   * Fire homing projectiles (Arcane Staff)
   */
  private fireHoming(
    bulletGroup: Phaser.Physics.Arcade.Group,
    x: number,
    y: number,
    angle: number,
    damage: number,
    weapon: WeaponComponent,
    currentTime: number
  ): void {
    createBulletEntity(
      bulletGroup,
      x,
      y,
      angle,
      damage,
      weapon.bulletSpeed,
      weapon.bulletLifespan,
      currentTime,
      weapon.specialEffect,
      weapon.pierceCount,
      weapon.homingStrength,
      weapon.explosionRadius
    );
  }

  /**
   * Fire dual projectiles with spread (Twin Daggers)
   */
  private fireDualShot(
    bulletGroup: Phaser.Physics.Arcade.Group,
    x: number,
    y: number,
    angle: number,
    damage: number,
    weapon: WeaponComponent,
    currentTime: number
  ): void {
    const spread = weapon.spreadAngle || Math.PI / 12;
    const angles = [angle - spread / 2, angle + spread / 2];

    angles.forEach((a) => {
      createBulletEntity(
        bulletGroup,
        x,
        y,
        a,
        damage,
        weapon.bulletSpeed,
        weapon.bulletLifespan,
        currentTime,
        weapon.specialEffect,
        weapon.pierceCount,
        weapon.homingStrength,
        weapon.explosionRadius
      );
    });
  }

  /**
   * Fire piercing projectile (Heavy Crossbow)
   */
  private firePiercing(
    bulletGroup: Phaser.Physics.Arcade.Group,
    x: number,
    y: number,
    angle: number,
    damage: number,
    weapon: WeaponComponent,
    currentTime: number
  ): void {
    createBulletEntity(
      bulletGroup,
      x,
      y,
      angle,
      damage,
      weapon.bulletSpeed,
      weapon.bulletLifespan,
      currentTime,
      weapon.specialEffect,
      weapon.pierceCount,
      weapon.homingStrength,
      weapon.explosionRadius
    );
  }

  /**
   * Fire cone of projectiles (Flamethrower)
   */
  private fireCone(
    bulletGroup: Phaser.Physics.Arcade.Group,
    x: number,
    y: number,
    angle: number,
    damage: number,
    weapon: WeaponComponent,
    currentTime: number
  ): void {
    // Fire 5 projectiles in a cone
    const coneAngle = weapon.coneAngle || Math.PI / 4;
    const projectileCount = WEAPON_EFFECTS_CONFIG.CONE_PROJECTILE_COUNT;
    const angleStep = coneAngle / (projectileCount - 1);
    const startAngle = angle - coneAngle / 2;

    for (let i = 0; i < projectileCount; i++) {
      const bulletAngle = startAngle + angleStep * i;
      createBulletEntity(
        bulletGroup,
        x,
        y,
        bulletAngle,
        damage,
        weapon.bulletSpeed,
        weapon.bulletLifespan,
        currentTime,
        weapon.specialEffect,
        weapon.pierceCount,
        weapon.homingStrength,
        weapon.explosionRadius
      );
    }
  }

  /**
   * Fire explosive projectile (Celestial Cannon)
   */
  private fireExplosive(
    bulletGroup: Phaser.Physics.Arcade.Group,
    x: number,
    y: number,
    angle: number,
    damage: number,
    weapon: WeaponComponent,
    currentTime: number
  ): void {
    createBulletEntity(
      bulletGroup,
      x,
      y,
      angle,
      damage,
      weapon.bulletSpeed,
      weapon.bulletLifespan,
      currentTime,
      weapon.specialEffect,
      weapon.pierceCount,
      weapon.homingStrength,
      weapon.explosionRadius
    );
  }

  /**
   * Fire simple projectile (fallback/pistol)
   */
  private fireSimple(
    bulletGroup: Phaser.Physics.Arcade.Group,
    x: number,
    y: number,
    angle: number,
    damage: number,
    weapon: WeaponComponent,
    currentTime: number
  ): void {
    createBulletEntity(
      bulletGroup,
      x,
      y,
      angle,
      damage,
      weapon.bulletSpeed,
      weapon.bulletLifespan,
      currentTime
    );
  }
}
