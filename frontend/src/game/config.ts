import Phaser from 'phaser';
import { MenuScene } from './scenes/MenuScene';
import { GameScene } from './scenes/GameSceneECS';
import { DISPLAY_CONFIG, CHARACTER_CLASSES } from './config/GameConfig';

export interface GameCallbacks {
  onGameOver: (shards: number) => void;
}

export interface GameUpgrades {
  hasArmor: boolean;
  hasBoots: boolean;
}

export interface GameConfig {
  upgrades: GameUpgrades;
  callbacks: GameCallbacks;
  selectedClass?: keyof typeof CHARACTER_CLASSES; // Selected character class
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
    scene: [MenuScene, GameScene], // MenuScene is first (starts automatically)
    // Store our custom config in the game registry
    callbacks: {
      preBoot: (game: Phaser.Game) => {
        game.registry.set('gameConfig', gameConfig);
      },
    },
  };
};
