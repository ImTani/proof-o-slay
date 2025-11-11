import Phaser from 'phaser';
import type { ProjectileComponent } from '../components/ProjectileComponent';

/**
 * ProjectileSystem - Manages projectile lifetime
 */
export class ProjectileSystem {
  update(
    sprite: Phaser.Physics.Arcade.Sprite,
    projectile: ProjectileComponent,
    currentTime: number
  ): void {
    const age = currentTime - projectile.spawnTime;
    
    if (age >= projectile.lifespan) {
      this.destroyProjectile(sprite);
    }
  }
  
  destroyProjectile(sprite: Phaser.Physics.Arcade.Sprite): void {
    // Use killAndHide to properly return sprite to pool for reuse
    sprite.body?.reset(0, 0);
    sprite.setActive(false);
    sprite.setVisible(false);
  }
}
