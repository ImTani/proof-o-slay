import { useState } from 'react';
import './App.css';
import { PhaserGame } from './components/PhaserGame';

function App() {
  // For now, no upgrades (will integrate blockchain later)
  const [upgrades] = useState({
    hasArmor: false,
    hasBoots: false,
  });

  const handleGameOver = (shards: number) => {
    console.log('Game Over! Collected shards:', shards);
    // In the future, this will trigger blockchain forge UI
    // For now, Phaser handles everything internally
  };

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
      margin: 0,
      padding: 0,
      overflow: 'hidden',
    }}>
      <PhaserGame 
        upgrades={upgrades}
        onGameOver={handleGameOver}
      />
    </div>
  );
}

export default App;
