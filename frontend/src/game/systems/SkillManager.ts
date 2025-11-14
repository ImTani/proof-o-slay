import Phaser from 'phaser';
import type { BattleDashComponent } from '../components/BattleDashComponent';
import type { ArcaneNovaComponent } from '../components/ArcaneNovaComponent';
import type { PhantomBarrierComponent } from '../components/PhantomBarrierComponent';
import type { HealthSystem } from './HealthSystem';
import { BattleDashSystem } from './BattleDashSystem';
import { ArcaneNovaSystem } from './ArcaneNovaSystem';
import { PhantomBarrierSystem } from './PhantomBarrierSystem';
import { SKILLS, type SkillType } from '../config/GameConfig';

/**
 * SkillManager - Centralized system for managing all player skills
 * 
 * This manager:
 * - Registers skill components on entities
 * - Routes skill activation to appropriate systems
 * - Provides unified interface for skill queries
 * - Handles skill updates and state management
 * 
 * Benefits:
 * - Single import point for skill functionality
 * - Easy to add new skills without touching scene code
 * - Centralized skill logic routing
 */
export class SkillManager {
    private scene: Phaser.Scene;
    private healthSystem: HealthSystem;

    // Skill systems
    private battleDashSystem: BattleDashSystem;
    private arcaneNovaSystem: ArcaneNovaSystem;
    private phantomBarrierSystem: PhantomBarrierSystem;

    // Registered entities with their skill types
    private entitySkills: Map<Phaser.Physics.Arcade.Sprite, SkillType> = new Map();

    constructor(
        scene: Phaser.Scene,
        healthSystem: HealthSystem,
        showDamageNumber?: (x: number, y: number, damage: number) => void
    ) {
        this.scene = scene;
        this.healthSystem = healthSystem;

        // Initialize all skill systems
        this.battleDashSystem = new BattleDashSystem(scene, showDamageNumber);
        this.arcaneNovaSystem = new ArcaneNovaSystem(scene, showDamageNumber);
        this.phantomBarrierSystem = new PhantomBarrierSystem(scene, healthSystem);
    }

    /**
     * Register an entity's skill with the manager
     * This is called by entity factories to register their skill components
     */
    registerSkill(entity: Phaser.Physics.Arcade.Sprite, skillType: SkillType): void {
        this.entitySkills.set(entity, skillType);
    }

    /**
     * Unregister an entity (cleanup when entity is destroyed)
     */
    unregisterEntity(entity: Phaser.Physics.Arcade.Sprite): void {
        this.entitySkills.delete(entity);
    }

    /**
     * Update all skill states for an entity
     * Call this every frame in the scene's update loop
     */
    update(entity: Phaser.Physics.Arcade.Sprite, currentTime: number): void {
        const skillType = this.entitySkills.get(entity);
        if (!skillType) return;

        switch (skillType) {
            case 'BATTLE_DASH': {
                const skill = entity.getData('battleDash') as BattleDashComponent;
                if (skill) this.battleDashSystem.update(entity, skill, currentTime);
                break;
            }
            case 'ARCANE_NOVA':
                // Arcane Nova has no duration-based effects to update
                break;
            case 'PHANTOM_BARRIER': {
                const skill = entity.getData('phantomBarrier') as PhantomBarrierComponent;
                if (skill) this.phantomBarrierSystem.update(entity, skill, currentTime);
                break;
            }
        }
    }

    /**
     * Attempt to activate entity's skill
     * Returns true if skill was successfully used
     */
    useSkill(
        entity: Phaser.Physics.Arcade.Sprite,
        currentTime: number,
        enemies: Phaser.Physics.Arcade.Group
    ): boolean {
        const skillType = this.entitySkills.get(entity);
        if (!skillType) return false;

        switch (skillType) {
            case 'BATTLE_DASH': {
                const skill = entity.getData('battleDash') as BattleDashComponent;
                if (skill) return this.battleDashSystem.useSkill(entity, skill, currentTime, enemies);
                break;
            }
            case 'ARCANE_NOVA': {
                const skill = entity.getData('arcaneNova') as ArcaneNovaComponent;
                if (skill) return this.arcaneNovaSystem.useSkill(entity, skill, currentTime, enemies);
                break;
            }
            case 'PHANTOM_BARRIER': {
                const skill = entity.getData('phantomBarrier') as PhantomBarrierComponent;
                if (skill) return this.phantomBarrierSystem.useSkill(entity, skill, currentTime);
                break;
            }
        }

        return false;
    }

    /**
     * Handle barrier damage (for Phantom Barrier skill)
     * Returns actual damage to apply after absorption
     */
    handleBarrierDamage(
        entity: Phaser.Physics.Arcade.Sprite,
        incomingDamage: number,
        currentTime: number
    ): number {
        const skillType = this.entitySkills.get(entity);

        if (skillType === 'PHANTOM_BARRIER') {
            const skill = entity.getData('phantomBarrier') as PhantomBarrierComponent;
            if (skill && skill.isActive) {
                return this.phantomBarrierSystem.handleBarrierDamage(entity, skill, incomingDamage, currentTime);
            }
        }

        return incomingDamage;
    }

    /**
     * Get skill cooldown information for UI
     */
    getSkillCooldownInfo(entity: Phaser.Physics.Arcade.Sprite, currentTime: number): {
        cooldownPercent: number;
        isReady: boolean;
        skillName: string;
    } {
        const skillType = this.entitySkills.get(entity);
        if (!skillType) {
            return { cooldownPercent: 1, isReady: true, skillName: 'None' };
        }

        const skillConfig = SKILLS[skillType];
        let lastUsedTime = 0;
        let cooldown = skillConfig.cooldown;

        switch (skillType) {
            case 'BATTLE_DASH': {
                const skill = entity.getData('battleDash') as BattleDashComponent;
                if (skill) {
                    lastUsedTime = skill.lastUsedTime;
                    cooldown = skill.cooldown;
                }
                break;
            }
            case 'ARCANE_NOVA': {
                const skill = entity.getData('arcaneNova') as ArcaneNovaComponent;
                if (skill) {
                    lastUsedTime = skill.lastUsedTime;
                    cooldown = skill.cooldown;
                }
                break;
            }
            case 'PHANTOM_BARRIER': {
                const skill = entity.getData('phantomBarrier') as PhantomBarrierComponent;
                if (skill) {
                    lastUsedTime = skill.lastUsedTime;
                    cooldown = skill.cooldown;
                }
                break;
            }
        }

        const cooldownRemaining = currentTime - lastUsedTime;
        const cooldownPercent = Math.min(1, cooldownRemaining / cooldown);
        const isReady = cooldownPercent >= 1;

        return {
            cooldownPercent,
            isReady,
            skillName: skillConfig.name,
        };
    }

    /**
     * Get the skill type for an entity
     */
    getSkillType(entity: Phaser.Physics.Arcade.Sprite): SkillType | undefined {
        return this.entitySkills.get(entity);
    }
}
