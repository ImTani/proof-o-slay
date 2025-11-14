import { SKILLS } from '../config/GameConfig';

/**
 * Phantom Barrier Component - Rogue skill
 * Absorbs damage for a duration or until broken
 */
export interface PhantomBarrierComponent {
    lastUsedTime: number;
    cooldown: number;
    isActive: boolean;
    activeUntil: number;
    damageAbsorbed: number;
    maxAbsorb: number;
}

export const createPhantomBarrierComponent = (): PhantomBarrierComponent => ({
    lastUsedTime: 0,
    cooldown: SKILLS.PHANTOM_BARRIER.cooldown,
    isActive: false,
    activeUntil: 0,
    damageAbsorbed: 0,
    maxAbsorb: SKILLS.PHANTOM_BARRIER.absorb!,
});

export const isPhantomBarrierReady = (skill: PhantomBarrierComponent, currentTime: number): boolean => {
    return currentTime - skill.lastUsedTime >= skill.cooldown;
};

export const getPhantomBarrierCooldownRemaining = (skill: PhantomBarrierComponent, currentTime: number): number => {
    const elapsed = currentTime - skill.lastUsedTime;
    return Math.max(0, skill.cooldown - elapsed);
};
