import { SKILLS } from '../config/GameConfig';

/**
 * Arcane Nova Component - Mage skill
 * AOE explosion that damages and knocks back enemies
 */
export interface ArcaneNovaComponent {
    lastUsedTime: number;
    cooldown: number;
}

export const createArcaneNovaComponent = (): ArcaneNovaComponent => ({
    lastUsedTime: 0,
    cooldown: SKILLS.ARCANE_NOVA.cooldown,
});

export const isArcaneNovaReady = (skill: ArcaneNovaComponent, currentTime: number): boolean => {
    return currentTime - skill.lastUsedTime >= skill.cooldown;
};

export const getArcaneNovaCooldownRemaining = (skill: ArcaneNovaComponent, currentTime: number): number => {
    const elapsed = currentTime - skill.lastUsedTime;
    return Math.max(0, skill.cooldown - elapsed);
};
