import Phaser from 'phaser';
import type { ArcaneNovaComponent } from '../components/ArcaneNovaComponent';
import type { HealthComponent } from '../components/HealthComponent';
import { SKILLS } from '../config/GameConfig';

/**
 * ArcaneNovaSystem - Handles Arcane Nova skill execution (Mage)
 * 150 damage to all enemies in 300px radius, knockback
 */
export class ArcaneNovaSystem {
    private scene: Phaser.Scene;
    private showDamageNumber?: (x: number, y: number, damage: number) => void;

    constructor(scene: Phaser.Scene, showDamageNumber?: (x: number, y: number, damage: number) => void) {
        this.scene = scene;
        this.showDamageNumber = showDamageNumber;
    }

    /**
     * Attempt to use Arcane Nova
     */
    useSkill(
        player: Phaser.Physics.Arcade.Sprite,
        skill: ArcaneNovaComponent,
        currentTime: number,
        enemies: Phaser.Physics.Arcade.Group
    ): boolean {
        // Check if skill is on cooldown
        if (currentTime - skill.lastUsedTime < skill.cooldown) {
            return false;
        }

        // Mark skill as used
        skill.lastUsedTime = currentTime;
        this.executeNova(player, currentTime, enemies);
        return true;
    }

    private executeNova(
        player: Phaser.Physics.Arcade.Sprite,
        _currentTime: number,
        enemies: Phaser.Physics.Arcade.Group
    ): void {
        const config = SKILLS.ARCANE_NOVA;
        const DAMAGE = config.damage!;
        const RADIUS = config.radius!;
        const KNOCKBACK_FORCE = config.knockbackForce!;

        // Visual: Purple explosion
        this.createNovaExplosion(player, RADIUS);

        // Damage and knockback all enemies in radius
        let enemiesHit = 0;
        enemies.children.entries.forEach((enemy) => {
            const enemySprite = enemy as Phaser.Physics.Arcade.Sprite;
            const distance = Phaser.Math.Distance.Between(
                player.x,
                player.y,
                enemySprite.x,
                enemySprite.y
            );

            if (distance <= RADIUS) {
                // Apply damage
                const enemyHealth = enemySprite.getData('health') as HealthComponent;
                if (enemyHealth) {
                    enemyHealth.current -= DAMAGE;
                    enemiesHit++;

                    // Show damage number
                    if (this.showDamageNumber) {
                        this.showDamageNumber(enemySprite.x, enemySprite.y, DAMAGE);
                    }

                    // Apply knockback
                    const angle = Math.atan2(
                        enemySprite.y - player.y,
                        enemySprite.x - player.x
                    );
                    const body = enemySprite.body as Phaser.Physics.Arcade.Body;
                    body.velocity.x = Math.cos(angle) * KNOCKBACK_FORCE;
                    body.velocity.y = Math.sin(angle) * KNOCKBACK_FORCE;

                    // Visual feedback
                    enemySprite.setTint(0xaa00ff);
                    this.scene.time.delayedCall(200, () => {
                        enemySprite.clearTint();
                    });
                }
            }
        });

        console.log(`🔮 Arcane Nova hit ${enemiesHit} enemies!`);
    }

    private createNovaExplosion(player: Phaser.Physics.Arcade.Sprite, radius: number): void {
        const circle = this.scene.add.circle(player.x, player.y, 0, 0xaa00ff, 0.6);
        circle.setDepth(player.depth - 1);

        // Expand and fade
        this.scene.tweens.add({
            targets: circle,
            radius: radius,
            alpha: 0,
            duration: 400,
            ease: 'Power2',
            onComplete: () => circle.destroy(),
        });
    }
}
