import Phaser from 'phaser';
import { GameScene } from './scenes/GameSceneECS';
import { TestScene } from './scenes/TestScene';
import { DISPLAY_CONFIG, CHARACTER_CLASSES } from './config/GameConfig';

export interface GameStats {
  health: number;
  maxHealth: number;
  shards: number;
  killCount: number;
  level: number;
  experience: number;
  maxExperience: number;
  skillName: string;
  skillCooldown: number; // 0-1 percentage
  activePowerUps: string[];
}

export interface GameCallbacks {
  onGameOver: (shards: number, timeSurvived: string, enemiesKilled: number) => void;
  onStatsUpdate: (stats: GameStats) => void;
}

export interface GameUpgrades {
  hasArmor: boolean;
  hasBoots: boolean;
}

export interface GamblingState {
  isActive: boolean;
  stakeAmount: number;
  goalMinutes: number;
  goalMultiplier: number;
  isJackpotMode: boolean;
  jackpotTicketsAvailable: number;
}

export interface GameConfig {
  upgrades?: GameUpgrades;
  selectedClass: keyof typeof CHARACTER_CLASSES; // Selected character class (required)
  callbacks: GameCallbacks;
  gambling?: GamblingState; // Gambling state (optional)
}

export const createGameConfig = (gameConfig: GameConfig): Phaser.Types.Core.GameConfig => {
  return {
    type: Phaser.AUTO,
    parent: 'game-container',
    width: DISPLAY_CONFIG.WIDTH,
    height: DISPLAY_CONFIG.HEIGHT,
    backgroundColor: DISPLAY_CONFIG.BACKGROUND_COLOR,
    scale: {
      mode: DISPLAY_CONFIG.SCALE_MODE,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    physics: {
      default: 'arcade',
      arcade: {
        gravity: { x: 0, y: 0 },
        debug: false,
        fps: 60, // Fixed physics timestep (frame-rate independent)
      },
    },
    fps: {
      target: 60, // Target FPS (physics will interpolate if rendering is slower)
      forceSetTimeOut: false, // Use requestAnimationFrame for smooth rendering
    },
    input: {
      gamepad: true, // Enable gamepad support
    },
    scene: [GameScene, TestScene], // GameScene is first (starts automatically)
    // Store our custom config in the game registry
    callbacks: {
      preBoot: (game: Phaser.Game) => {
        game.registry.set('gameConfig', gameConfig);
      },
    },
  };
};
