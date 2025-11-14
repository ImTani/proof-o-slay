import { SKILLS } from '../config/GameConfig';

/**
 * Battle Dash Component - Warrior skill
 * Dash forward, invincible during dash, damage enemies passed through
 */
export interface BattleDashComponent {
    lastUsedTime: number;
    cooldown: number;
    isActive: boolean;
    activeUntil: number;
}

export const createBattleDashComponent = (): BattleDashComponent => ({
    lastUsedTime: 0,
    cooldown: SKILLS.BATTLE_DASH.cooldown,
    isActive: false,
    activeUntil: 0,
});

export const isBattleDashReady = (skill: BattleDashComponent, currentTime: number): boolean => {
    return currentTime - skill.lastUsedTime >= skill.cooldown;
};

export const getBattleDashCooldownRemaining = (skill: BattleDashComponent, currentTime: number): number => {
    const elapsed = currentTime - skill.lastUsedTime;
    return Math.max(0, skill.cooldown - elapsed);
};
