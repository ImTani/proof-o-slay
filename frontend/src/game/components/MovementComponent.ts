import Phaser from 'phaser';

/**
 * Movement Component - Handles velocity and speed
 */
export interface MovementComponent {
  speed: number;
  velocity: Phaser.Math.Vector2;
}

export const createMovementComponent = (speed: number): MovementComponent => ({
  speed,
  velocity: new Phaser.Math.Vector2(0, 0),
});
