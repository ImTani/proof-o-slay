import Phaser from 'phaser';
import { GameScene } from './scenes/GameSceneECS';

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
}

export const createGameConfig = (gameConfig: GameConfig): Phaser.Types.Core.GameConfig => {
  return {
    type: Phaser.AUTO,
    parent: 'game-container',
    width: 800,
    height: 600,
    backgroundColor: '#1a1a2e',
    physics: {
      default: 'arcade',
      arcade: {
        gravity: { x: 0, y: 0 },
        debug: false,
      },
    },
    scene: [GameScene],
    // Store our custom config in the game registry
    callbacks: {
      preBoot: (game: Phaser.Game) => {
        game.registry.set('gameConfig', gameConfig);
      },
    },
  };
};
