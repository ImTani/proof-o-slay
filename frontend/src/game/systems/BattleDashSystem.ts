import Phaser from 'phaser';
import type { BattleDashComponent } from '../components/BattleDashComponent';
import type { HealthComponent } from '../components/HealthComponent';
import { SKILLS } from '../config/GameConfig';

/**
 * BattleDashSystem - Handles Battle Dash skill execution (Warrior)
 * Dash 200px forward, invincible 0.5s, 20 damage to enemies passed through
 */
export class BattleDashSystem {
    private scene: Phaser.Scene;
    private showDamageNumber?: (x: number, y: number, damage: number) => void;

    constructor(scene: Phaser.Scene, showDamageNumber?: (x: number, y: number, damage: number) => void) {
        this.scene = scene;
        this.showDamageNumber = showDamageNumber;
    }

    /**
     * Attempt to use Battle Dash
     */
    useSkill(
        player: Phaser.Physics.Arcade.Sprite,
        skill: BattleDashComponent,
        currentTime: number,
        enemies: Phaser.Physics.Arcade.Group
    ): boolean {
        // Check if skill is on cooldown
        if (currentTime - skill.lastUsedTime < skill.cooldown) {
            return false;
        }

        // Mark skill as used
        skill.lastUsedTime = currentTime;
        this.executeDash(player, skill, currentTime, enemies);
        return true;
    }

    /**
     * Update skill state (called every frame)
     */
    update(player: Phaser.Physics.Arcade.Sprite, skill: BattleDashComponent, currentTime: number): void {
        // Check if invincibility has expired
        if (skill.isActive && currentTime >= skill.activeUntil) {
            skill.isActive = false;
            player.setData('invincible', false);
        }
    }

    private executeDash(
        player: Phaser.Physics.Arcade.Sprite,
        skill: BattleDashComponent,
        currentTime: number,
        enemies: Phaser.Physics.Arcade.Group
    ): void {
        const config = SKILLS.BATTLE_DASH;
        const DASH_DISTANCE = config.distance!;
        const INVINCIBILITY_DURATION = config.invincibilityDuration!;
        const TRAIL_DAMAGE = config.damage!;

        // Calculate dash direction
        let dashAngle = 0;
        const velocity = player.body as Phaser.Physics.Arcade.Body;

        if (Math.abs(velocity.velocity.x) > 1 || Math.abs(velocity.velocity.y) > 1) {
            dashAngle = Math.atan2(velocity.velocity.y, velocity.velocity.x);
        } else {
            dashAngle = 0;
        }

        const targetX = player.x + Math.cos(dashAngle) * DASH_DISTANCE;
        const targetY = player.y + Math.sin(dashAngle) * DASH_DISTANCE;

        // Make player invincible
        skill.isActive = true;
        skill.activeUntil = currentTime + INVINCIBILITY_DURATION;
        player.setData('invincible', true);

        // Visual: Blue afterimage trail
        this.createDashTrail(player, targetX, targetY);

        // Tween player to target position
        this.scene.tweens.add({
            targets: player,
            x: targetX,
            y: targetY,
            duration: 200,
            ease: 'Power2',
            onUpdate: () => {
                // Damage enemies touched during dash
                enemies.children.entries.forEach((enemy) => {
                    const enemySprite = enemy as Phaser.Physics.Arcade.Sprite;
                    const distance = Phaser.Math.Distance.Between(
                        player.x,
                        player.y,
                        enemySprite.x,
                        enemySprite.y
                    );

                    // If within dash trail, damage enemy (only once per dash)
                    if (distance < 30 && !enemySprite.getData('hitByDash')) {
                        const enemyHealth = enemySprite.getData('health') as HealthComponent;
                        if (enemyHealth) {
                            enemyHealth.current -= TRAIL_DAMAGE;
                            enemySprite.setData('hitByDash', true);

                            // Show damage number
                            if (this.showDamageNumber) {
                                this.showDamageNumber(enemySprite.x, enemySprite.y, TRAIL_DAMAGE);
                            }

                            // Visual feedback
                            enemySprite.setTint(0xff6666);
                            this.scene.time.delayedCall(100, () => {
                                enemySprite.clearTint();
                            });
                        }
                    }
                });
            },
            onComplete: () => {
                // Clear dash hit flags
                enemies.children.entries.forEach((enemy) => {
                    (enemy as Phaser.Physics.Arcade.Sprite).setData('hitByDash', false);
                });
            },
        });

        console.log('⚔️ Battle Dash activated!');
    }

    private createDashTrail(
        player: Phaser.Physics.Arcade.Sprite,
        targetX: number,
        targetY: number
    ): void {
        const trail = this.scene.add.graphics();
        trail.lineStyle(4, 0x4444ff, 0.6);
        trail.lineBetween(player.x, player.y, targetX, targetY);
        trail.setDepth(player.depth - 1);

        // Fade out trail
        this.scene.tweens.add({
            targets: trail,
            alpha: 0,
            duration: 300,
            onComplete: () => trail.destroy(),
        });
    }
}
