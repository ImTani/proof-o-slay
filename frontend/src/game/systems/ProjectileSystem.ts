import Phaser from 'phaser';
import type { ProjectileComponent } from '../components/ProjectileComponent';

/**
 * ProjectileSystem - Manages projectile lifetime
 */
export class ProjectileSystem {
  update(sprite: Phaser.Physics.Arcade.Sprite, projectile: ProjectileComponent): void {
    const currentTime = Date.now();
    const age = currentTime - projectile.spawnTime;
    
    if (age >= projectile.lifespan) {
      this.destroyProjectile(sprite);
    }
  }
  
  destroyProjectile(sprite: Phaser.Physics.Arcade.Sprite): void {
    sprite.setActive(false);
    sprite.setVisible(false);
    if (sprite.body) {
      (sprite.body as Phaser.Physics.Arcade.Body).enable = false;
    }
  }
}
