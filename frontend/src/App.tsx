import { useEffect, useState } from 'react';
import { GameScene } from './game/scenes/GameSceneECS';
import { GameHUD } from './components/GameHUD';
import { MainMenu } from './components/MainMenu';
import { ClassSelection } from './components/ClassSelection';
import { Hub } from './components/Hub';
import { GameOverScreen } from './components/GameOverScreen';
import { DynamicBackground } from './components/ui/DynamicBackground';
import { CustomCursor } from './components/ui/CustomCursor';
import { PauseMenu } from './components/PauseMenu';
import { CursorProvider } from './context/CursorContext';
import type { GameStats } from './game/config';
import Phaser from 'phaser';

type GameState = 'menu' | 'hub' | 'class-select' | 'playing' | 'game-over';

function App() {
  const [gameState, setGameState] = useState<GameState>('menu');
  const [isPaused, setIsPaused] = useState(false);
  const [gameInstance, setGameInstance] = useState<Phaser.Game | null>(null);
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
    activePowerUps: []
  });

  const [lastRunStats, setLastRunStats] = useState({
    timeSurvived: '00:00',
    enemiesKilled: 0,
    shardsCollected: 0
  });

  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  // Initialize shards from localStorage or default to 0
  const [totalShards, setTotalShards] = useState(() => {
    const saved = localStorage.getItem('proof_o_slay_shards');
    return saved ? parseInt(saved, 10) : 0;
  });

  // Persist shards to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('proof_o_slay_shards', totalShards.toString());
  }, [totalShards]);

  // Default to 'font-cyber' (Exo 2)
  useEffect(() => {
    document.body.className = 'font-cyber';
  }, []);

  // Handle Pause Key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && gameState === 'playing') {
        setIsPaused(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState]);

  // Pause/Resume Phaser Game
  useEffect(() => {
    if (gameInstance) {
      if (isPaused) {
        gameInstance.scene.pause('GameScene');
      } else {
        gameInstance.scene.resume('GameScene');
      }
    }
  }, [isPaused, gameInstance]);

  // Initialize game when state changes to 'playing'
  useEffect(() => {
    if (gameState === 'playing' && selectedClass && !gameInstance) {
      const config: Phaser.Types.Core.GameConfig = {
        type: Phaser.AUTO,
        parent: 'phaser-game',
        width: window.innerWidth,
        height: window.innerHeight,
        // @ts-ignore - resolution is valid in Phaser 3 but missing in some type defs
        resolution: window.devicePixelRatio,
        roundPixels: false, // Ensure smooth vector rendering
        physics: {
          default: 'arcade',
          arcade: {
            gravity: { x: 0, y: 0 },
            debug: false,
          },
        },
        scene: [GameScene],
        backgroundColor: 'transparent', // Make Phaser transparent for background grid
        transparent: true,
        callbacks: {
          preBoot: (game) => {
            // Initialize registry with config before scene starts
            game.registry.set('gameConfig', {
              selectedClass: selectedClass,
              callbacks: {
                onStatsUpdate: (stats: GameStats) => setGameStats(stats),
                onGameOver: (shards: number, timeSurvived: string, enemiesKilled: number) => {
                  console.log('Game Over:', { shards, timeSurvived, enemiesKilled });

                  setLastRunStats({
                    timeSurvived,
                    enemiesKilled,
                    shardsCollected: shards
                  });

                  setTotalShards(prev => prev + shards);
                  setGameState('game-over');
                  setGameInstance(null);
                  setIsPaused(false);
                }
              },
              upgrades: { hasArmor: false, hasBoots: false } // Default upgrades
            });
          },
          postBoot: () => {
            // Keep postBoot for any other initialization if needed
          }
        }
      };

      const game = new Phaser.Game(config);
      setGameInstance(game);
    }

    // Cleanup function
    return () => {
      if (gameState !== 'playing' && gameInstance) {
        gameInstance.destroy(true);
        setGameInstance(null);
      }
    };
  }, [gameState, selectedClass, gameInstance, gameStats.killCount]);

  const startGame = (className: string) => {
    setSelectedClass(className);
    setGameState('playing');
    setIsPaused(false);
  };

  const handleQuitRun = () => {
    setIsPaused(false);
    setGameState('menu');
    if (gameInstance) {
      gameInstance.destroy(true);
      setGameInstance(null);
    }
  };

  return (
    <CursorProvider>
      <div className="relative z-0 w-full h-screen overflow-hidden text-white font-cyber">
        {/* Global Background Grid */}
        <DynamicBackground />
        <CustomCursor />

        {gameState === 'menu' && (
          <MainMenu onStart={() => setGameState('hub')} />
        )}

        {gameState === 'hub' && (
          <Hub
            shards={totalShards}
            onStartRun={() => setGameState('class-select')}
            onForgeComplete={() => setTotalShards(0)} // Reset shards after forge (mock)
            onSpendShards={(amount) => setTotalShards(prev => Math.max(0, prev - amount))}
          />
        )}

        {gameState === 'class-select' && (
          <ClassSelection onSelect={(className) => {
            startGame(className);
          }} />
        )}

        {gameState === 'playing' && (
          <>
            <div id="phaser-game" className="absolute inset-0" />
            <GameHUD stats={gameStats} />

            <PauseMenu
              isOpen={isPaused}
              onResume={() => setIsPaused(false)}
              onQuit={handleQuitRun}
            />
          </>
        )}

        {gameState === 'game-over' && (
          <GameOverScreen
            stats={lastRunStats}
            onRestart={() => setGameState('class-select')}
            onForge={() => setGameState('hub')} // Go to hub to forge
            onMainMenu={() => setGameState('menu')}
          />
        )}
      </div>
    </CursorProvider>
  );
}

export default App;
