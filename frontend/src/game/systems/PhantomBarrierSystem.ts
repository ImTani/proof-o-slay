import Phaser from 'phaser';
import type { PhantomBarrierComponent } from '../components/PhantomBarrierComponent';
import type { HealthComponent } from '../components/HealthComponent';
import type { HealthSystem } from './HealthSystem';
import { PLAYER_CONFIG, SKILLS } from '../config/GameConfig';

/**
 * PhantomBarrierSystem - Handles Phantom Barrier skill execution (Rogue)
 * Absorbs next 100 damage, lasts 6 seconds or until broken
 */
export class PhantomBarrierSystem {
    private scene: Phaser.Scene;
    private healthSystem: HealthSystem;

    constructor(scene: Phaser.Scene, healthSystem: HealthSystem) {
        this.scene = scene;
        this.healthSystem = healthSystem;
    }

    /**
     * Attempt to use Phantom Barrier
     */
    useSkill(
        player: Phaser.Physics.Arcade.Sprite,
        skill: PhantomBarrierComponent,
        currentTime: number
    ): boolean {
        // Check if skill is on cooldown
        if (currentTime - skill.lastUsedTime < skill.cooldown) {
            return false;
        }

        // Mark skill as used
        skill.lastUsedTime = currentTime;
        this.activateBarrier(player, skill, currentTime);
        return true;
    }

    /**
     * Update skill state (called every frame)
     */
    update(player: Phaser.Physics.Arcade.Sprite, skill: PhantomBarrierComponent, currentTime: number): void {
        // Check if barrier duration has expired
        if (skill.isActive && currentTime >= skill.activeUntil) {
            this.deactivateBarrier(player, skill);
        }
    }

    /**
     * Handle damage when barrier is active
     * Returns actual damage to apply (0 if fully absorbed)
     */
    handleBarrierDamage(
        player: Phaser.Physics.Arcade.Sprite,
        skill: PhantomBarrierComponent,
        incomingDamage: number,
        currentTime: number
    ): number {
        if (!skill.isActive) {
            return incomingDamage;
        }

        const playerHealth = player.getData('health') as HealthComponent;

        // Check if player has active iframes
        if (playerHealth.isInvincible && currentTime < playerHealth.invincibilityEndTime) {
            return 0; // Skip damage if still invincible
        }

        const remainingAbsorb = skill.maxAbsorb - skill.damageAbsorbed;

        if (incomingDamage <= remainingAbsorb) {
            // Fully absorb damage
            skill.damageAbsorbed += incomingDamage;
            console.log(`🛡️ Barrier absorbed ${incomingDamage} damage (${remainingAbsorb - incomingDamage} remaining)`);

            // Activate iframes after absorbing hit
            this.healthSystem.activateInvincibility(
                player,
                playerHealth,
                PLAYER_CONFIG.INVINCIBILITY_DURATION,
                this.scene,
                currentTime
            );

            return 0;
        } else {
            // Barrier breaks, apply overflow damage
            const overflow = incomingDamage - remainingAbsorb;
            skill.damageAbsorbed = skill.maxAbsorb;
            this.deactivateBarrier(player, skill);
            console.log(`💥 Barrier broken! ${overflow} damage dealt`);

            // Overflow damage will trigger iframes in normal damage handler
            return overflow;
        }
    }

    private activateBarrier(
        player: Phaser.Physics.Arcade.Sprite,
        skill: PhantomBarrierComponent,
        currentTime: number
    ): void {
        const config = SKILLS.PHANTOM_BARRIER;
        const DURATION = config.duration!;

        // Activate barrier
        skill.isActive = true;
        skill.activeUntil = currentTime + DURATION;
        skill.damageAbsorbed = 0;
        player.setData('hasBarrier', true);

        // Visual: Golden shield bubble
        this.createBarrierEffect(player);

        console.log('🛡️ Phantom Barrier activated!');
    }

    private deactivateBarrier(player: Phaser.Physics.Arcade.Sprite, skill: PhantomBarrierComponent): void {
        skill.isActive = false;
        player.setData('hasBarrier', false);

        // Destroy barrier sprite if it exists
        const barrierSprite = player.getData('barrierSprite');
        if (barrierSprite) {
            barrierSprite.destroy();
            player.setData('barrierSprite', null);
        }
    }

    private createBarrierEffect(player: Phaser.Physics.Arcade.Sprite): void {
        const barrier = this.scene.add.circle(player.x, player.y, 40, 0xffd700, 0.3);
        barrier.setStrokeStyle(2, 0xffd700, 1);
        barrier.setDepth(player.depth - 1);
        player.setData('barrierSprite', barrier);

        // Pulse animation
        this.scene.tweens.add({
            targets: barrier,
            scaleX: 1.1,
            scaleY: 1.1,
            alpha: 0.5,
            duration: 500,
            yoyo: true,
            repeat: -1,
        });

        // Update barrier position to follow player
        const updateBarrier = () => {
            if (barrier.active && player.active) {
                barrier.setPosition(player.x, player.y);
            }
        };

        this.scene.events.on('update', updateBarrier);

        // Clean up event listener when barrier is destroyed
        barrier.once('destroy', () => {
            this.scene.events.off('update', updateBarrier);
        });
    }
}
