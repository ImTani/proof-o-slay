import Phaser from 'phaser';

/**
 * AI Component - Enemy behavior controller
 */
export interface AIComponent {
  type: 'chase' | 'kite' | 'idle';
  speed: number;
  target?: Phaser.Math.Vector2;
  // Kiting AI properties
  keepDistance?: number; // Distance to maintain from target (for kiting)
  // Ranged attack properties
  canAttack?: boolean; // Whether this enemy can attack at range
  projectileSpeed?: number;
  fireRate?: number; // ms between attacks
  lastFireTime?: number; // Phaser.Time.now of last attack
}

export const createAIComponent = (
  speed: number = 40,
  type: 'chase' | 'kite' | 'idle' = 'chase'
): AIComponent => ({
  type,
  speed,
  target: undefined,
});
