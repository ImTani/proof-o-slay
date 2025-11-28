import { useEffect, useRef, useState } from 'react';
import Phaser from 'phaser';
import { createGameConfig, type GameCallbacks, type GameStats } from '../game/config';
import { GameHUD } from './GameHUD';

interface PhaserGameProps {
  upgrades: {
    hasArmor: boolean;
    hasBoots: boolean;
  };
  selectedClass: 'WARRIOR' | 'MAGE' | 'ROGUE';
  onGameOver: (shards: number) => void;
}

export const PhaserGame = ({ upgrades, selectedClass, onGameOver }: PhaserGameProps) => {
  const gameRef = useRef<Phaser.Game | null>(null);
  const [gameStats, setGameStats] = useState<GameStats>({
    health: 100,
    maxHealth: 100,
    shards: 0,
    killCount: 0,
    level: 1,
    experience: 0,
    maxExperience: 100,
    skillName: '',
    skillCooldown: 0,
    activePowerUps: [],
  });

  useEffect(() => {
    // Cleanup existing game instance if any
    if (gameRef.current) {
      gameRef.current.destroy(true);
      gameRef.current = null;
    }

    // Callbacks to pass to Phaser
    const callbacks: GameCallbacks = {
      onGameOver: (shards) => {
        // Small delay to let the death animation play
        setTimeout(() => {
          onGameOver(shards);
        }, 2000);
      },
      onStatsUpdate: (stats) => {
        setGameStats(stats);
      }
    };

    // Create game config
    const config = createGameConfig({
      upgrades,
      selectedClass,
      callbacks,
    });

    // Initialize Phaser game
    gameRef.current = new Phaser.Game(config);

    // Cleanup on unmount
    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, [upgrades, selectedClass, onGameOver]);

  return (
    <div className="relative w-full h-full">
      <div id="game-container" className="w-full h-full" />
      <GameHUD stats={gameStats} />
    </div>
  );
};
