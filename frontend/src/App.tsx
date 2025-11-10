import { useState } from 'react';
import './App.css';
import { PhaserGame } from './components/PhaserGame';

function App() {
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'ended'>('menu');
  const [pendingShards, setPendingShards] = useState(0);
  
  // For now, no upgrades (will integrate blockchain later)
  const upgrades = {
    hasArmor: false,
    hasBoots: false,
  };

  const handleGameOver = (shards: number) => {
    console.log('App received game over:', shards);
    setPendingShards(shards);
    setGameState('ended');
  };

  const startGame = () => {
    setPendingShards(0);
    setGameState('playing');
  };

  const backToMenu = () => {
    setGameState('menu');
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
      color: '#ffffff',
      padding: '2rem',
    }}>
      <header style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h1 style={{ 
          fontSize: '3rem', 
          margin: '0',
          background: 'linear-gradient(45deg, #4287f5, #4caf50)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}>
          🎮 DungeonForge
        </h1>
        <p style={{ fontSize: '1.2rem', color: '#aaa' }}>
          Survive the waves. Collect the shards. Forge your legend.
        </p>
      </header>

      {gameState === 'menu' && (
        <div style={{
          textAlign: 'center',
          maxWidth: '600px',
          margin: '0 auto',
        }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.1)',
            padding: '2rem',
            borderRadius: '12px',
            marginBottom: '2rem',
          }}>
            <h2>How to Play</h2>
            <ul style={{ textAlign: 'left', lineHeight: '1.8' }}>
              <li><strong>WASD</strong> - Move your character</li>
              <li><strong>Mouse</strong> - Aim</li>
              <li><strong>Click</strong> - Shoot</li>
              <li>Kill enemies to collect <span style={{ color: '#4caf50' }}>Glimmering Shards</span></li>
              <li>Survive as many waves as you can!</li>
            </ul>
          </div>
          
          <button
            onClick={startGame}
            style={{
              fontSize: '1.5rem',
              padding: '1rem 3rem',
              background: 'linear-gradient(45deg, #4287f5, #4caf50)',
              border: 'none',
              borderRadius: '8px',
              color: 'white',
              cursor: 'pointer',
              fontWeight: 'bold',
              transition: 'transform 0.2s',
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            Start Game
          </button>
        </div>
      )}

      {gameState === 'playing' && (
        <div style={{ textAlign: 'center' }}>
          <PhaserGame 
            upgrades={upgrades}
            onGameOver={handleGameOver}
          />
          <p style={{ marginTop: '1rem', color: '#aaa' }}>
            Upgrades: {upgrades.hasArmor ? '🛡️ Armor ' : ''}{upgrades.hasBoots ? '👢 Boots' : ''}
            {!upgrades.hasArmor && !upgrades.hasBoots && 'None (yet!)'}
          </p>
        </div>
      )}

      {gameState === 'ended' && (
        <div style={{
          textAlign: 'center',
          maxWidth: '600px',
          margin: '0 auto',
        }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.1)',
            padding: '3rem',
            borderRadius: '12px',
            marginBottom: '2rem',
          }}>
            <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Game Over!</h2>
            <p style={{ fontSize: '1.8rem', color: '#4caf50', marginBottom: '2rem' }}>
              💎 Collected {pendingShards} Shards
            </p>
            
            <div style={{
              background: 'rgba(76, 175, 80, 0.2)',
              padding: '1.5rem',
              borderRadius: '8px',
              marginBottom: '2rem',
            }}>
              <p style={{ fontSize: '1.1rem' }}>
                In the full version, you'll be able to:
              </p>
              <ul style={{ textAlign: 'left', lineHeight: '1.8' }}>
                <li>Forge these Shards into <strong>$DUNGEON</strong> tokens</li>
                <li>Buy on-chain upgrades (Armor, Boots, etc.)</li>
                <li>Power up for your next run!</li>
              </ul>
            </div>
          </div>
          
          <button
            onClick={startGame}
            style={{
              fontSize: '1.3rem',
              padding: '0.8rem 2rem',
              background: 'linear-gradient(45deg, #4287f5, #4caf50)',
              border: 'none',
              borderRadius: '8px',
              color: 'white',
              cursor: 'pointer',
              fontWeight: 'bold',
              marginRight: '1rem',
            }}
          >
            Play Again
          </button>
          
          <button
            onClick={backToMenu}
            style={{
              fontSize: '1.3rem',
              padding: '0.8rem 2rem',
              background: 'rgba(255, 255, 255, 0.1)',
              border: '2px solid #4287f5',
              borderRadius: '8px',
              color: 'white',
              cursor: 'pointer',
              fontWeight: 'bold',
            }}
          >
            Back to Menu
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
