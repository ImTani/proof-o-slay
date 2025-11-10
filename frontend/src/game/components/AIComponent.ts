import Phaser from 'phaser';

/**
 * AI Component - Simple chase behavior towards a target
 */
export interface AIComponent {
  type: 'chase' | 'idle';
  speed: number;
  target?: Phaser.Math.Vector2;
}

export const createAIComponent = (speed: number = 40): AIComponent => ({
  type: 'chase',
  speed,
  target: undefined,
});
