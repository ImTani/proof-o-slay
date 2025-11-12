/**
 * ClassComponent - Stores character class type and skill cooldown
 */

export type ClassType = 'WARRIOR' | 'MAGE' | 'ROGUE';

export interface ClassComponent {
  type: ClassType;
  skillCooldown: number; // ms between skill uses
  lastSkillTime: number; // timestamp of last skill use
}

export function createClassComponent(
  type: ClassType,
  skillCooldown: number
): ClassComponent {
  return {
    type,
    skillCooldown,
    lastSkillTime: 0,
  };
}
