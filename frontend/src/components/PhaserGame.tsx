import { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import { createGameConfig, type GameCallbacks, type GameUpgrades } from '../game/config';

interface PhaserGameProps {
  upgrades: GameUpgrades;
  onGameOver: (shards: number) => void;
}

export const PhaserGame: React.FC<PhaserGameProps> = ({ upgrades, onGameOver }) => {
  const gameRef = useRef<Phaser.Game | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Callbacks to pass to Phaser
    const callbacks: GameCallbacks = {
      onGameOver: (shards: number) => {
        console.log('Game Over callback received:', shards);
        onGameOver(shards);
      },
    };

    // Create game config
    const config = createGameConfig({
      upgrades,
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
  }, [upgrades, onGameOver]);

  return (
    <div
      id="game-container"
      ref={containerRef}
      style={{
        width: '100%',
        height: '100%',
        maxWidth: '100vw',
        maxHeight: '100vh',
        aspectRatio: '16 / 9',
        margin: 0,
        padding: 0,
        overflow: 'hidden',
        position: 'relative',
      }}
    />
  );
};
