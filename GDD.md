# Game Design Document: DungeonForge (Working Title)

## 1. Elevator Pitch

**DungeonForge** is a fast-paced, top-down rogue-lite. Players battle through monster-filled rooms to earn an off-chain currency ("Glimmering Shards"). After each run, they return to their Hub, where they can "forge" their Shards into an on-chain token (`$DUNGEON`). This token is then used to buy permanent, on-chain upgrades (owned objects as NFTs) that make their next run easier, creating an addictive, high-stakes game loop.

## 2. Core Pillars

* **Fast & Responsive:** The core game (Phaser) must feel immediate and satisfying. Controls are tight, combat is fast.
* **Addictive Loop:** The "one more run" feeling is paramount. The loop from (Off-Chain Play) -> (On-Chain Reward) -> (On-Chain Upgrade) -> (Stronger Off-Chain Play) must be compelling.
* **Modular by Design:** The game is built using composition, not inheritance. New enemies, items, and upgrades should be "plug-and-play" by combining components, not by writing new complex classes.
* **True Asset Ownership:** Upgrades are not just database entries; they are on-chain objects in the player's wallet.

---

## 3. MVP Scope (Hackathon Lock-Down)

To meet the hackathon deadline, the following is the absolute minimum.

| Category | Feature | Description |
| :--- | :--- | :--- |
| **Game (Phaser)** | **1. Player Character** | A single sprite with 8-directional movement (WASD) and mouse-look (aiming). |
| | **2. Weapon System** | Player clicks to shoot a single "magic bolt" projectile. |
| | **3. Enemy AI** | 1 enemy type: "Slime." It slowly moves toward the player (simple vector math, not complex pathfinding). |
| | **4. Room System** | A single, static rectangular room (800x600). Enemies spawn in waves. |
| | **5. Game Loop** | Player survives waves until HP hits 0. "Game Over" screen shows Shards collected. |
| | **6. Currency** | 1 off-chain currency: "Glimmering Shards," dropped by enemies. |
| | **7. Visual Feedback** | Health bar above player, damage flash on hit, particle effect on shard pickup. |
| **Backend** | **1. Signature Service** | A simple Node.js server that signs shard amounts to prevent exploit. |
| **UI (React)** | **1. Hub Screen** | Main UI. Shows `Connect Wallet`, `Start Run`, `Forge`, and `Shop` buttons. |
| | **2. Balances** | Displays user's `$DUNGEON` balance (sum of owned coin objects) and their "Glimmering Shards" (off-chain, in React state). |
| | **3. Upgrade Display** | Shows which upgrades are owned (query owned objects from chain). |
| **Blockchain (Sui SDK)** | **1. Wallet Connect** | User connects via Sui Wallet Standard. |
| | **2. Move Package** | A single Move package that handles both token minting AND upgrades as owned objects. |
| | **3. Token** | `$DUNGEON` token (Sui Coin standard), minted via the game module. |
| | **4. Upgrades** | 2 simple upgrades stored as owned objects (NFTs). |

---

## 4. Internal Game Economy (Self-Contained)

The token exists purely to create an on-chain "feel" and progression loop. It has no external value.

| Resource | Earn Rate | Cost | Purpose |
| :--- | :--- | :--- | :--- |
| **Glimmering Shards** | ~50-100 per run (10 waves @ 5-10 shards/wave) | Free (earned in-game) | Off-chain currency, earned by killing enemies |
| **$DUNGEON Token** | 1 Shard = 1 $DUNGEON (1:1 forge rate) | Costs your Shards | On-chain currency, used to buy upgrades |
| **Hero's Armor** | N/A | 300 $DUNGEON | Upgrade: +20 max HP (100 -> 120) |
| **Swift Boots** | N/A | 500 $DUNGEON | Upgrade: +20% movement speed |

**Balancing Goal:** First upgrade (Armor) should take 3-4 runs. Second upgrade (Boots) should take 5-6 runs. This creates a ~1-2 hour demo loop.

---

## 5. Security: The Forge System

**The Problem:** Players collect Shards off-chain. Without verification, they could call `forge_tokens(999999)` directly.

**The Solution:** Backend Signature Verification

1. **Game End:** Phaser emits `{ shards: 250, timestamp: 1234567890, playerAddress: '0x...' }`
2. **React Requests Signature:** React sends this data to your Node.js backend: `POST /api/sign-forge`
3. **Backend Validates & Signs:** 
   - Backend checks if this is a reasonable shard amount (< 500 per run)
   - Backend signs the data using ECDSA secp256k1: `signature = sign(shards, timestamp, playerAddress)`
4. **React Calls Move Function:** React creates a Transaction calling `forge_tokens_with_signature(shards, timestamp, signature)`
5. **Move Module Verifies:** Module uses `sui::ecdsa_k1::secp256k1_verify` to verify the signature came from your backend
6. **Move Module Mints:** If valid, mint $DUNGEON coins to player

**Backup Plan (If No Time for Backend):** For the hackathon demo, you can skip the backend and have the Move module trust the frontend. **Acknowledge this to judges**: "In production, we'd add signature verification, but for the demo, we're focused on the gameplay loop."

---

## 6. The Core Game Loop (Step-by-Step)

1. **React Hub (Sui SDK):** User connects their Sui-compatible wallet.
2. **React Hub (Sui SDK):** The app queries owned objects to check if user owns `Armor` or `Boots` upgrade objects.
3. **React Hub -> Phaser:** User clicks "Start Run." React launches Phaser via:
   ```javascript
   const gameConfig = {
     upgrades: { hasArmor: true, hasBoots: false },
     onGameOver: (shards) => handleGameOver(shards)
   };
   const game = new Phaser.Game(gameConfig);
   ```
4. **Phaser (Game Init):** The main scene reads `gameConfig.upgrades`:
   - If `hasArmor`, set `player.maxHealth = 120` (instead of 100)
   - If `hasBoots`, set `player.speed = 120` (instead of 100)
5. **Phaser (Gameplay):** Player fights slimes, collects Shards (stored in `this.shardCount`).
6. **Phaser (Game Over):** Player HP reaches 0. Phaser calls `gameConfig.onGameOver(this.shardCount)`.
7. **React Hub (UI):** `handleGameOver` updates state: `pendingShards = 250`.
8. **React Hub (Signature):** User clicks "Forge." React sends `{ shards: 250, address, timestamp }` to backend.
9. **Backend:** Returns `{ signature }`.
10. **React Hub (Sui SDK):** React creates a Programmable Transaction Block (PTB) that calls the Move forge function.
11. **Wallet:** Wallet pops up to sign transaction.
12. **React Hub (Sui SDK):** Transaction confirms. User's `$DUNGEON` balance updates (query owned coin objects). They can now buy upgrades.
13. **(Loop)**

---

## 7. Technical Architecture

### Phaser ↔ React Communication Bridge

**Option A: Callback Functions (Recommended)**
```javascript
// In React:
const handleGameOver = (shards) => {
  setPendingShards(shards);
  setGameState('ended');
};

const phaserConfig = {
  // ... standard Phaser config
  callbacks: {
    onGameOver: handleGameOver
  }
};

// In Phaser (GameScene.js):
gameOver() {
  this.game.config.callbacks.onGameOver(this.shardCount);
}
```

**Option B: Window Events (Alternative)**
```javascript
// In Phaser:
window.dispatchEvent(new CustomEvent('game-over', { detail: { shards: 250 }}));

// In React:
useEffect(() => {
  const handler = (e) => setPendingShards(e.detail.shards);
  window.addEventListener('game-over', handler);
  return () => window.removeEventListener('game-over', handler);
}, []);
```

### Move Package Structure

**Single Unified Module: `dungeon_forge.move`**

```move
module dungeon_forge::game;

use sui::coin::{Self, Coin};
use sui::balance::{Self, Balance};

/// The main game token
public struct DUNGEON has drop {}

/// Upgrade: Armor (owned object)
public struct Armor has key, store {
    id: UID,
    owner: address,
    bonus_hp: u64,
}

/// Upgrade: Boots (owned object)
public struct Boots has key, store {
    id: UID,
    owner: address,
    speed_multiplier: u64, // e.g., 120 for 20% boost
}

/// Treasury for collecting spent tokens
public struct Treasury has key {
    id: UID,
    balance: Balance<DUNGEON>,
}

/// One-time witness for initializing the coin
public struct GAME has drop {}

/// Module initializer
fun init(witness: GAME, ctx: &mut TxContext) {
    // Create the currency
    let (treasury_cap, metadata) = coin::create_currency(
        witness,
        6, // decimals
        b"DUNGEON",
        b"Dungeon Token",
        b"Currency for DungeonForge",
        option::none(),
        ctx
    );
    
    transfer::public_freeze_object(metadata);
    
    // Create treasury to hold spent tokens
    let treasury = Treasury {
        id: object::new(ctx),
        balance: balance::zero(),
    };
    transfer::share_object(treasury);
    
    // Transfer treasury_cap to publisher for minting
    transfer::public_transfer(treasury_cap, ctx.sender());
}

/// Forge shards into $DUNGEON tokens (simplified, no signature for MVP)
public entry fun forge_tokens(
    treasury_cap: &mut coin::TreasuryCap<DUNGEON>,
    shards: u64,
    ctx: &mut TxContext
) {
    assert!(shards <= 500, 0); // Reasonable limit
    let coins = coin::mint(treasury_cap, shards, ctx);
    transfer::public_transfer(coins, ctx.sender());
}

/// Buy Armor upgrade
public entry fun buy_armor(
    treasury: &mut Treasury,
    payment: Coin<DUNGEON>,
    ctx: &mut TxContext
) {
    // Check payment amount
    assert!(coin::value(&payment) >= 300, 1);
    
    // Take payment
    let paid = coin::into_balance(payment);
    balance::join(&mut treasury.balance, paid);
    
    // Mint armor NFT
    let armor = Armor {
        id: object::new(ctx),
        owner: ctx.sender(),
        bonus_hp: 20,
    };
    
    transfer::public_transfer(armor, ctx.sender());
}

/// Buy Boots upgrade
public entry fun buy_boots(
    treasury: &mut Treasury,
    payment: Coin<DUNGEON>,
    ctx: &mut TxContext
) {
    // Check payment amount
    assert!(coin::value(&payment) >= 500, 2);
    
    // Take payment
    let paid = coin::into_balance(payment);
    balance::join(&mut treasury.balance, paid);
    
    // Mint boots NFT
    let boots = Boots {
        id: object::new(ctx),
        owner: ctx.sender(),
        speed_multiplier: 120,
    };
    
    transfer::public_transfer(boots, ctx.sender());
}

/// Query functions for frontend
public fun armor_bonus(armor: &Armor): u64 {
    armor.bonus_hp
}

public fun boots_multiplier(boots: &Boots): u64 {
    boots.speed_multiplier
}
```

### React Integration with Sui SDK

```typescript
import { SuiClient } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';
import { useWalletKit } from '@mysten/wallet-kit';

// Initialize client
const client = new SuiClient({ 
    url: 'https://rpc-testnet.onelabs.cc:443' 
});

// Connect wallet
const { currentAccount, signAndExecuteTransaction } = useWalletKit();

// Query user's $DUNGEON balance
async function getDungeonBalance(address: string) {
    const coins = await client.getCoins({
        owner: address,
        coinType: `${PACKAGE_ID}::game::DUNGEON`
    });
    
    return coins.data.reduce((sum, coin) => 
        sum + BigInt(coin.balance), 0n
    );
}

// Check if user owns upgrades
async function getOwnedUpgrades(address: string) {
    const armorObjects = await client.getOwnedObjects({
        owner: address,
        filter: { StructType: `${PACKAGE_ID}::game::Armor` }
    });
    
    const bootsObjects = await client.getOwnedObjects({
        owner: address,
        filter: { StructType: `${PACKAGE_ID}::game::Boots` }
    });
    
    return {
        hasArmor: armorObjects.data.length > 0,
        hasBoots: bootsObjects.data.length > 0
    };
}

// Forge tokens
async function forgeTokens(shards: number) {
    const tx = new Transaction();
    
    tx.moveCall({
        target: `${PACKAGE_ID}::game::forge_tokens`,
        arguments: [
            tx.object(TREASURY_CAP_ID), // TreasuryCap object
            tx.pure(shards, 'u64')
        ]
    });
    
    await signAndExecuteTransaction({
        transaction: tx,
        options: {
            showEffects: true,
            showObjectChanges: true,
        }
    });
}

// Buy armor upgrade
async function buyArmor() {
    const tx = new Transaction();
    
    // Get user's DUNGEON coins
    const coins = await client.getCoins({
        owner: currentAccount.address,
        coinType: `${PACKAGE_ID}::game::DUNGEON`
    });
    
    // Merge coins if needed and split exact amount
    const [paymentCoin] = tx.splitCoins(
        tx.object(coins.data[0].coinObjectId),
        [tx.pure(300, 'u64')]
    );
    
    tx.moveCall({
        target: `${PACKAGE_ID}::game::buy_armor`,
        arguments: [
            tx.object(TREASURY_ID),
            paymentCoin
        ]
    });
    
    await signAndExecuteTransaction({
        transaction: tx,
        options: {
            showEffects: true,
            showObjectChanges: true,
        }
    });
}
```

---

## 8. Entity-Component System (ECS)

### Components (Pure Data Structures)

```javascript
// In Phaser, these are just properties attached to GameObjects
const Components = {
  Position: { x, y, rotation },
  Velocity: { x, y },
  Sprite: { texture, tint, alpha },
  Health: { current, max },
  PhysicsBody: { width, height, speed },
  PlayerControlled: {}, // Tag component
  EnemyAI: { state: 'idle' | 'chasing', speed: 40 },
  Shooter: { fireRate: 500, lastShotTime: 0, damage: 10 },
  Projectile: { damage: 10, lifespan: 2000, firedAt: Date.now() },
  DamageOnCollision: { damage: 10, damageType: 'touch' },
  Collectible: { type: 'shard', value: 1 },
  LootDrop: { dropType: 'shard', dropChance: 1.0 }
};
```

### Entity Compositions (Prefabs)

**Player Entity:**
- Components: `Position`, `Velocity`, `Sprite {texture:'player'}`, `Health {current:100, max:100}`, `PhysicsBody`, `PlayerControlled`, `Shooter`
- Modified by: `hasArmor` upgrade (Health.max = 120), `hasBoots` upgrade (PhysicsBody.speed *= 1.2)

**Slime Entity (Enemy):**
- Components: `Position`, `Velocity`, `Sprite {texture:'slime'}`, `Health {current:30, max:30}`, `PhysicsBody`, `EnemyAI {speed:40}`, `DamageOnCollision {damage:10}`, `LootDrop {dropType:'shard'}`

**Magic Bolt Entity (Projectile):**
- Components: `Position`, `Velocity`, `Sprite {texture:'bolt'}`, `PhysicsBody {width:8, height:8}`, `Projectile {damage:10, lifespan:2000}`

**Shard Entity (Collectible):**
- Components: `Position`, `Sprite {texture:'shard'}`, `Collectible {type:'shard', value:1}`
- Visual: Glowing particle effect + bounce animation

### Systems (Game Logic)

These run in Phaser's `update(time, delta)` loop:

**1. InputSystem** *(Acts on entities with `PlayerControlled`)*
```javascript
update(player) {
  // Movement
  const cursors = this.input.keyboard.createCursorKeys();
  player.velocity.x = (cursors.right.isDown - cursors.left.isDown) * player.speed;
  player.velocity.y = (cursors.down.isDown - cursors.up.isDown) * player.speed;
  
  // Aiming (mouse look)
  const pointer = this.input.activePointer;
  player.rotation = Phaser.Math.Angle.Between(player.x, player.y, pointer.worldX, pointer.worldY);
  
  // Shooting
  if (pointer.isDown && time > player.lastShotTime + player.fireRate) {
    this.createBullet(player.x, player.y, player.rotation);
    player.lastShotTime = time;
  }
}
```

**2. AISystem** *(Acts on entities with `EnemyAI`)*
```javascript
update(enemies, player) {
  enemies.forEach(enemy => {
    // Simple chase behavior (no complex pathfinding)
    const angle = Phaser.Math.Angle.Between(enemy.x, enemy.y, player.x, player.y);
    enemy.velocity.x = Math.cos(angle) * enemy.aiSpeed;
    enemy.velocity.y = Math.sin(angle) * enemy.aiSpeed;
  });
}
```

**3. MovementSystem** *(Acts on entities with `Position + Velocity`)*
- Handled automatically by Phaser's Arcade Physics (`this.physics.add.existing(entity)`)

**4. CollisionSystem** *(Using Phaser's collision detection)*
```javascript
// Setup in create():
this.physics.add.overlap(bullets, enemies, this.bulletHitEnemy, null, this);
this.physics.add.overlap(player, enemies, this.enemyHitPlayer, null, this);
this.physics.add.overlap(player, collectibles, this.collectItem, null, this);

bulletHitEnemy(bullet, enemy) {
  enemy.health -= bullet.damage;
  bullet.destroy();
  if (enemy.health <= 0) this.enemyDied(enemy);
}

enemyHitPlayer(player, enemy) {
  player.health -= enemy.damage;
  player.setTint(0xff0000); // Damage flash
  this.time.delayedCall(100, () => player.clearTint());
  if (player.health <= 0) this.gameOver();
}

collectItem(player, item) {
  if (item.type === 'shard') {
    this.shardCount++;
    this.updateShardUI();
  }
  item.destroy();
}
```

**5. HealthSystem** *(Acts on entities with `Health`)*
```javascript
enemyDied(enemy) {
  // Drop loot
  if (enemy.lootDrop && Math.random() < enemy.lootDrop.chance) {
    this.createCollectible(enemy.x, enemy.y, enemy.lootDrop.type);
  }
  
  // Destroy enemy
  enemy.destroy();
}
```

**6. ProjectileSystem** *(Acts on entities with `Projectile`)*
```javascript
update(projectiles, time) {
  projectiles.forEach(proj => {
    if (time - proj.firedAt > proj.lifespan) {
      proj.destroy();
    }
  });
}
```

**7. RenderSystem** *(Handled by Phaser automatically)*

---

## 9. Wave System

**Simple Wave Spawner:**
```javascript
class GameScene extends Phaser.Scene {
  create() {
    this.currentWave = 0;
    this.enemiesAlive = 0;
    this.startNextWave();
  }
  
  startNextWave() {
    this.currentWave++;
    const enemyCount = 5 + (this.currentWave * 2); // 7, 9, 11, 13...
    
    for (let i = 0; i < enemyCount; i++) {
      // Spawn at random position around room edges
      const edge = Phaser.Math.Between(0, 3); // 0=top, 1=right, 2=bottom, 3=left
      const pos = this.getSpawnPosition(edge);
      this.createSlime(pos.x, pos.y);
      this.enemiesAlive++;
    }
  }
  
  enemyDied(enemy) {
    this.enemiesAlive--;
    // ... loot drop logic
    
    // Start next wave when all enemies dead
    if (this.enemiesAlive === 0) {
      this.time.delayedCall(2000, () => this.startNextWave());
    }
  }
}
```

---

## 10. Failure States & Edge Cases

| Scenario | Handling |
| :--- | :--- |
| **Wallet not connected** | Disable "Start Run" button. Show "Connect Wallet" prompt. |
| **Transaction fails during Forge** | Show error message: "Transaction failed. Your Shards are safe." Keep `pendingShards` state intact so user can retry. |
| **User closes game mid-run** | Shards are lost (not saved). This is acceptable for MVP. |
| **Backend signature server is down** | Fallback: Disable Forge button, show "Service temporarily unavailable." OR use honor system (see Section 5). |
| **Gas costs too high** | For demo: Use testnet with faucet. For production: Batch multiple forges or use sponsored transactions. |
| **User already owns upgrade** | Query owned objects first, disable purchase button if upgrade object exists. Move module would revert anyway. |
| **Insufficient $DUNGEON coins** | Check balance before transaction, show clear error message. |
| **Multiple coin objects** | SDK automatically handles coin merging via `tx.splitCoins()` in PTB. |

---

## 11. Reduced Scope Backup Plan

If you're behind schedule **48 hours before deadline**, cut in this order:

**Phase 1 Cuts (Keep Core Loop):**
- ~~Visual feedback~~ -> Just flash sprite tint, no particles
- ~~Wave system~~ -> Enemies spawn continuously, game ends at timer or HP=0
- ~~Backend signature~~ -> Use honor system, acknowledge to judges

**Phase 2 Cuts (Minimum Viable Demo):**
- ~~Second upgrade (Boots)~~ -> Ship with only Armor upgrade
- ~~EnemyAI~~ -> Enemies move in straight lines or random walks
- ~~React UI polish~~ -> Minimal Tailwind styling

**Nuclear Option (24 hours before deadline):**
- ~~On-chain upgrades~~ -> Store upgrades in localStorage, fake the blockchain calls with mock data for the demo

---

## 12. Future Expansion Examples

### New Enemy: Archer
- **Components:** `Position`, `Velocity`, `Sprite`, `Health`, `PhysicsBody`, `EnemyAI {state:'kiting'}`, `Shooter {bulletPrefab:'arrow'}`, `LootDrop`
- **New Systems Needed:** None. AISystem gets a new behavior: "if player too close, move away; else shoot."
- **Modularity Proof:** Reuses 90% of existing code.

### New Upgrade: Triple Shot
- **On-Chain:** Add new `TripleShot` struct as owned object
- **Move Module:** 
  ```move
  public struct TripleShot has key, store {
      id: UID,
      owner: address,
  }
  
  public entry fun buy_triple_shot(
      treasury: &mut Treasury,
      payment: Coin<DUNGEON>,
      ctx: &mut TxContext
  ) {
      assert!(coin::value(&payment) >= 800, 3);
      let paid = coin::into_balance(payment);
      balance::join(&mut treasury.balance, paid);
      
      let triple_shot = TripleShot {
          id: object::new(ctx),
          owner: ctx.sender(),
      };
      transfer::public_transfer(triple_shot, ctx.sender());
  }
  ```
- **In Game:** Modify `ShootingSystem`: 
  ```javascript
  if (player.hasTripleShot) {
    this.createBullet(x, y, angle - 0.2);
    this.createBullet(x, y, angle);
    this.createBullet(x, y, angle + 0.2);
  }
  ```

### New Class: Warrior
- **Components:** Replace `Shooter` with `MeleeWeapon {damage:15, range:30, cooldown:800}`
- **New System:** `MeleeSystem` creates a damage arc on click
- **Modularity Proof:** Same entity, different components

---

## 13. Technical Stack Summary

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Game Engine** | Phaser 3 | Core gameplay loop, rendering, physics |
| **Frontend UI** | React + Vite | Hub screen, wallet connection, state management |
| **Web3** | @mysten/sui (TypeScript SDK) | Smart contract interactions |
| **Wallet** | Sui Wallet Standard | User authentication & transactions |
| **Blockchain** | OneChain Testnet (Sui-based) | Move modules + owned object storage |
| **Smart Contracts** | Move Language | Game logic, token minting, upgrade NFTs |
| **Backend** | Node.js + Express (Optional) | Signature service for forge verification |
| **Deployment** | Vercel/Netlify (Frontend) + Render (Backend) | Demo hosting |

---

## 14. Development Timeline (5-Day Hackathon)

| Day | Focus | Deliverables |
| :--- | :--- | :--- |
| **Day 1** | Move Basics + Deploy | Study Move syntax, copy tutorial `Sword` module, adapt to `Armor`, deploy to testnet, test minting via CLI. |
| **Day 2** | Phaser Game | Build player, enemy, shooting, health, wave spawner. Playable game loop with placeholder assets. |
| **Day 3** | React + Sui SDK | Wallet connection, query owned objects (upgrades), display balances, basic Hub UI. |
| **Day 4** | Integration | Connect Phaser ↔ React ↔ Blockchain. Forge system working end-to-end. Buy armor via PTB. |
| **Day 5** | Polish & Debug | Visual feedback, UI polish, test full loop multiple times, fix object ownership bugs, practice demo. |

---

## 15. Move Development Notes

### Building and Testing

```bash
# Initialize new Move package
one move new dungeon_forge

# Build the package
one move build

# Run tests
one move test

# Publish to testnet
one client publish --gas-budget 100000000
```

### Key Move Concepts for Team

1. **Everything is an Object:** Tokens, upgrades, even the treasury. Each has a unique `UID`.
2. **Owned vs Shared:** 
   - Upgrades are **owned** by player (transferred to their address)
   - Treasury is **shared** (accessible by all, but controlled by module logic)
3. **No Balances:** Player doesn't have a "balance" number. They own multiple `Coin<DUNGEON>` objects. Sum them for display.
4. **PTBs are Atomic:** All transaction commands in a PTB succeed or fail together.
5. **Object Versioning:** Each object has a version number. Using stale versions causes transaction failure.

### Testing Strategy

```move
#[test]
fun test_forge_and_buy_armor() {
    use sui::test_scenario;
    
    let admin = @0xAD;
    let player = @0xCAFE;
    
    let mut scenario = test_scenario::begin(admin);
    {
        init(GAME {}, scenario.ctx());
    };
    
    // Player forges tokens
    scenario.next_tx(player);
    {
        let mut cap = scenario.take_from_sender<TreasuryCap<DUNGEON>>();
        forge_tokens(&mut cap, 500, scenario.ctx());
        scenario.return_to_sender(cap);
    };
    
    // Player buys armor
    scenario.next_tx(player);
    {
        let payment = scenario.take_from_sender<Coin<DUNGEON>>();
        let mut treasury = scenario.take_shared<Treasury>();
        buy_armor(&mut treasury, payment, scenario.ctx());
        test_scenario::return_shared(treasury);
    };
    
    // Verify player owns armor
    scenario.next_tx(player);
    {
        let armor = scenario.take_from_sender<Armor>();
        assert!(armor_bonus(&armor) == 20, 0);
        scenario.return_to_sender(armor);
    };
    
    scenario.end();
}
```

---

## 16. Blockchain-Specific Edge Cases

| Scenario | Handling |
| :--- | :--- |
| **Player has 0 $DUNGEON coins** | Query returns empty array. Display "0 DUNGEON". Disable upgrade buttons. |
| **Player has multiple small coin objects** | PTB automatically merges via `tx.splitCoins(tx.object(coinId), [amount])`. SDK handles this. |
| **Transaction pending** | Show loading spinner. Poll `client.waitForTransaction(digest)` for confirmation. |
| **RPC node down** | Catch network errors, show "Network unavailable" message, provide retry button. |
| **Testnet reset** | All objects lost. Document testnet address in `.env` for quick redeployment. |
| **Gas estimation fails** | Set conservative fixed gas budget (100M MIST). Monitor actual usage and adjust. |
| **Object locked (equivocation)** | Rare but possible. Wait until end of epoch (~24hrs). For demo, have backup wallet. |

---

## 17. Success Criteria (MVP Complete)

- [ ] User can connect Sui-compatible wallet to testnet
- [ ] User can play Phaser game and see their upgrades applied (read from owned objects)
- [ ] User earns Shards by killing enemies
- [ ] User can Forge Shards into $DUNGEON coins (with optional signature verification)
- [ ] User can buy upgrades with $DUNGEON (via PTB)
- [ ] Upgrades persist as owned objects and affect next run
- [ ] Game loop feels addictive (can play 3+ runs without boredom)
- [ ] Balance display correctly sums all owned $DUNGEON coin objects

## 18. Sui-Specific Best Practices

### Gas Optimization

**Batch Operations in PTBs:**
```typescript
// GOOD: Single PTB with multiple operations
const tx = new Transaction();
const [coin1] = tx.splitCoins(tx.gas, [tx.pure(100)]);
const [coin2] = tx.splitCoins(tx.gas, [tx.pure(200)]);
tx.transferObjects([coin1], tx.pure(address1));
tx.transferObjects([coin2], tx.pure(address2));
// One transaction = one gas payment

// BAD: Multiple separate transactions
await forgeTokens(100); // Gas payment 1
await forgeTokens(200); // Gas payment 2
```

**Coin Management:**
```typescript
// Query all coins and merge if needed
async function preparePayment(amount: bigint) {
    const coins = await client.getCoins({
        owner: currentAccount.address,
        coinType: `${PACKAGE_ID}::game::DUNGEON`
    });
    
    const total = coins.data.reduce((sum, c) => 
        sum + BigInt(c.balance), 0n
    );
    
    if (total < amount) {
        throw new Error('Insufficient balance');
    }
    
    // PTB will handle merging automatically
    return coins.data[0].coinObjectId;
}
```

### Error Handling

```typescript
async function executeBuyArmor() {
    try {
        const tx = new Transaction();
        // ... build transaction
        
        const result = await signAndExecuteTransaction({
            transaction: tx,
            options: {
                showEffects: true,
                showObjectChanges: true,
            }
        });
        
        // Check execution status
        if (result.effects?.status?.status === 'success') {
            // Find created Armor object
            const armorObject = result.objectChanges?.find(
                change => change.type === 'created' && 
                change.objectType.includes('::Armor')
            );
            
            return { success: true, armorId: armorObject?.objectId };
        } else {
            throw new Error(result.effects?.status?.error || 'Transaction failed');
        }
        
    } catch (error) {
        if (error.message.includes('InsufficientGas')) {
            return { success: false, error: 'Not enough gas' };
        } else if (error.message.includes('InsufficientCoinBalance')) {
            return { success: false, error: 'Not enough DUNGEON tokens' };
        } else {
            console.error('Transaction error:', error);
            return { success: false, error: 'Transaction failed' };
        }
    }
}
```

### Object Caching Strategy

```typescript
// Cache owned objects to reduce RPC calls
class UpgradeCache {
    private cache: Map<string, { data: any, timestamp: number }> = new Map();
    private TTL = 10000; // 10 seconds
    
    async getUpgrades(address: string, forceRefresh = false) {
        const cached = this.cache.get(address);
        const now = Date.now();
        
        if (!forceRefresh && cached && (now - cached.timestamp) < this.TTL) {
            return cached.data;
        }
        
        const upgrades = await fetchUpgradesFromChain(address);
        this.cache.set(address, { data: upgrades, timestamp: now });
        return upgrades;
    }
    
    invalidate(address: string) {
        this.cache.delete(address);
    }
}
```

---

## 19. Demo Script (3-Minute Pitch)

**Minute 1: Problem & Hook**
> "Web3 games promise true asset ownership, but onboarding is painful. Gas fees, wallet setup, and complex UIs scare away casual gamers. DungeonForge solves this with a hybrid model: play for free off-chain, claim rewards on-chain."

**Minute 2: Live Demo**
1. Connect wallet (5 seconds)
2. Show empty inventory: "No upgrades yet"
3. Play game: Kill 3-4 slimes, collect shards (20 seconds)
4. Die intentionally: "Collected 50 shards"
5. Click "Forge" → Show wallet signature prompt (10 seconds)
6. Transaction confirms: "$DUNGEON balance: 50"
7. Accumulate more runs quickly: "Now at 320 tokens"
8. Buy Armor: Show PTB in wallet (10 seconds)
9. Transaction confirms: Show Armor object in inventory
10. Start new run: "Watch - my HP is now 120 instead of 100"
11. Survive longer with upgraded character

**Minute 3: Technical Deep Dive**
> "Built on OneChain using Move smart contracts. Upgrades are owned objects—real NFTs, not database entries. The player literally owns that Armor. If we rug-pull, they keep it. That's true asset ownership."

> "Under the hood: Programmable Transaction Blocks let us atomically split coins, call the buy function, and transfer the NFT—all in one transaction. Gas-efficient, secure, and composable with other OneChain dApps."

**Call to Action:**
> "Try it yourself at [demo-url]. We're launching on mainnet next month. Early adopters get exclusive Genesis Sword NFTs."

---

## 20. Post-Hackathon Roadmap

### Week 1-2: Production Hardening
- [ ] Implement backend signature verification
- [ ] Add rate limiting to forge endpoint
- [ ] Deploy to mainnet with real tokenomics
- [ ] Professional art assets (commission or AI-generate)
- [ ] Sound design and music

### Week 3-4: Content Expansion
- [ ] 3 new enemy types (Archer, Tank, Mage)
- [ ] 5 additional upgrades (Shield, Dash, Lifesteal, Crit Chance, AOE)
- [ ] Boss enemy at wave 10
- [ ] Multiple room layouts
- [ ] Procedural dungeon generation (stretch)

### Month 2: Monetization & Growth
- [ ] Seasonal battle pass (off-chain, burns $DUNGEON for rewards)
- [ ] Cosmetic NFTs (skins, pets, weapon visuals)
- [ ] Guild system (shared objects for clan treasury)
- [ ] Leaderboard with weekly prizes
- [ ] Referral program (airdrop tokens to both parties)

### Month 3: Advanced Features
- [ ] PvP arena mode
- [ ] Tournament system with entry fees
- [ ] Sponsored transactions for new users (first 3 runs free)
- [ ] Cross-chain bridge (if needed)
- [ ] Mobile app (React Native wrapper)

---

## 21. Team Roles & Responsibilities

| Role | Responsibilities | Time Allocation |
| :--- | :--- | :--- |
| **Move Developer** | Write smart contracts, test modules, handle deployments | 40% |
| **Frontend Developer** | React UI, Sui SDK integration, wallet connection | 30% |
| **Game Developer** | Phaser logic, ECS implementation, gameplay tuning | 20% |
| **Designer** | UI/UX mockups, sprite assets, animation | 5% |
| **DevOps** | Backend setup, RPC monitoring, deployment | 5% |

**Note:** For a 2-person team, expect role overlap. Prioritize Move + Frontend first, then Phaser.

---

## 22. Common Pitfalls to Avoid

### Move Development

**❌ Trying to transfer objects without `store` ability**
```move
// WRONG: Missing 'store'
public struct Armor has key {
    id: UID,
}

// RIGHT: Needs 'store' to be transferable
public struct Armor has key, store {
    id: UID,
}
```

**❌ Not handling multiple coin objects**
```typescript
// WRONG: Assumes single coin
const coin = coins.data[0];
tx.moveCall({ arguments: [tx.object(coin.coinObjectId)] });

// RIGHT: Let PTB merge coins
const [payment] = tx.splitCoins(
    tx.object(coins.data[0].coinObjectId),
    [tx.pure(300)]
);
```

**❌ Forgetting to return objects in tests**
```move
#[test]
fun test_armor() {
    let armor = scenario.take_from_sender<Armor>();
    // Test logic...
    // WRONG: Object not returned, test fails
}

// RIGHT:
scenario.return_to_sender(armor);
```

### Frontend Integration

**❌ Not handling wallet disconnect**
```typescript
// WRONG: Crashes when wallet disconnects
const balance = await getDungeonBalance(currentAccount.address);

// RIGHT: Guard against null
const balance = currentAccount?.address 
    ? await getDungeonBalance(currentAccount.address)
    : 0n;
```

**❌ Not waiting for transaction confirmation**
```typescript
// WRONG: UI updates before chain confirms
await forgeTokens(shards);
setBalance(balance + shards); // Race condition!

// RIGHT: Wait for effects
const result = await forgeTokens(shards);
await client.waitForTransaction({ digest: result.digest });
const newBalance = await getDungeonBalance(address);
setBalance(newBalance);
```

**❌ Hardcoding package IDs**
```typescript
// WRONG: Breaks on redeployment
const PACKAGE_ID = '0x123...abc';

// RIGHT: Use environment variables
const PACKAGE_ID = import.meta.env.VITE_PACKAGE_ID;
```

### Game Design

**❌ Making upgrades too expensive**
```
// WRONG: Players need 10+ runs to afford first upgrade
Hero's Armor: 1000 $DUNGEON

// RIGHT: ~3-4 runs for first upgrade
Hero's Armor: 300 $DUNGEON
```

**❌ No difficulty curve**
```javascript
// WRONG: Every wave identical
const enemyCount = 10;

// RIGHT: Gradual increase
const enemyCount = 5 + (this.currentWave * 2);
```

---

## 23. Environment Setup

### Required Installations

```bash
# Install Rust (for Move compiler)
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Install Sui CLI
cargo install --locked --git https://github.com/one-chain-labs/onechain.git one_chain --features tracing
mv ~/.cargo/bin/one_chain ~/.cargo/bin/one

# Verify installation
one --version

# Initialize Sui wallet
one client

# Request testnet tokens
one client faucet
# OR via cURL:
curl -X POST 'https://faucet-testnet.onelabs.cc/v1/gas' \
  -H 'Content-Type: application/json' \
  -d '{"FixedAmountRequest": {"recipient": "<YOUR_ADDRESS>"}}'
```

### Project Structure

```
dungeon-forge/
├── contracts/              # Move package
│   ├── Move.toml
│   ├── sources/
│   │   └── game.move
│   └── tests/
│       └── game_tests.move
├── frontend/               # React app
│   ├── src/
│   │   ├── components/
│   │   │   ├── Hub.tsx
│   │   │   ├── Shop.tsx
│   │   │   └── WalletConnect.tsx
│   │   ├── game/          # Phaser game
│   │   │   ├── scenes/
│   │   │   │   ├── GameScene.js
│   │   │   │   └── MenuScene.js
│   │   │   └── config.js
│   │   ├── lib/
│   │   │   ├── suiClient.ts
│   │   │   └── gameContract.ts
│   │   └── App.tsx
│   ├── package.json
│   └── vite.config.ts
├── backend/                # Optional signature service
│   ├── src/
│   │   ├── index.ts
│   │   └── signer.ts
│   └── package.json
├── .env.example
├── .gitignore
└── README.md
```

### Environment Variables

```bash
# .env.example
VITE_SUI_NETWORK=testnet
VITE_PACKAGE_ID=0x...  # Fill after deployment
VITE_TREASURY_CAP_ID=0x...
VITE_TREASURY_ID=0x...
VITE_BACKEND_URL=http://localhost:3001  # Optional

# Backend
BACKEND_PORT=3001
SIGNER_PRIVATE_KEY=0x...  # Don't commit!
ALLOWED_ORIGINS=http://localhost:5173
```

---

## 24. Deployment Checklist

### Pre-Deploy

- [ ] All Move tests passing: `one move test`
- [ ] Frontend builds without errors: `npm run build`
- [ ] Testnet tokens acquired for deployer address
- [ ] Environment variables documented
- [ ] Git repo clean (no sensitive keys committed)

### Smart Contract Deployment

```bash
# Navigate to contracts directory
cd contracts

# Build package
one move build

# Publish to testnet
one client publish --gas-budget 100000000

# Save important IDs from output:
# - Package ID
# - TreasuryCap object ID
# - Treasury shared object ID

# Test a function via CLI
one client call \
  --package <PACKAGE_ID> \
  --module game \
  --function forge_tokens \
  --args <TREASURY_CAP_ID> 100 \
  --gas-budget 10000000
```

### Frontend Deployment

```bash
# Update .env with deployed contract IDs
echo "VITE_PACKAGE_ID=<PACKAGE_ID>" > .env
echo "VITE_TREASURY_CAP_ID=<CAP_ID>" >> .env
echo "VITE_TREASURY_ID=<TREASURY_ID>" >> .env

# Build production bundle
npm run build

# Deploy to Vercel
vercel --prod

# Or Netlify
netlify deploy --prod
```

### Post-Deploy Verification

- [ ] Connect wallet to production site
- [ ] Verify upgrade objects query correctly
- [ ] Execute a forge transaction
- [ ] Purchase an upgrade
- [ ] Play a run with the upgrade active
- [ ] Check object ownership in Sui Explorer

---

## 25. Monitoring & Analytics

### On-Chain Metrics to Track

```typescript
interface GameMetrics {
    // User metrics
    totalPlayers: number;
    dailyActiveUsers: number;
    averageSessionLength: number;
    
    // Economic metrics
    totalDungeonMinted: bigint;
    totalDungeonBurned: bigint;  // Spent on upgrades
    circulatingSupply: bigint;
    
    // Upgrade adoption
    armorsPurchased: number;
    bootsPurchased: number;
    
    // Game metrics
    averageShardsPerRun: number;
    averageRunsToFirstUpgrade: number;
    retentionRate: number;  // % returning after 24hrs
}

// Query via Sui events
async function getMetrics(): Promise<GameMetrics> {
    const events = await client.queryEvents({
        query: { 
            MoveModule: {
                package: PACKAGE_ID,
                module: 'game'
            }
        }
    });
    
    // Process events to extract metrics
    return processEvents(events);
}
```

### Custom Event Emission

```move
// Add to Move module
use sui::event;

public struct ArmorPurchased has copy, drop {
    buyer: address,
    armor_id: ID,
    timestamp_ms: u64,
}

public struct TokensForged has copy, drop {
    player: address,
    amount: u64,
    timestamp_ms: u64,
}

public entry fun buy_armor(...) {
    // ... purchase logic
    
    event::emit(ArmorPurchased {
        buyer: ctx.sender(),
        armor_id: object::id(&armor),
        timestamp_ms: ctx.epoch_timestamp_ms(),
    });
}
```

### Frontend Analytics

```typescript
// Simple event tracking
function trackEvent(event: string, properties?: object) {
    // For hackathon: Console log
    console.log('[Analytics]', event, properties);
    
    // For production: Send to analytics service
    // posthog.capture(event, properties);
    // mixpanel.track(event, properties);
}

// Usage
trackEvent('game_started', { hasArmor, hasBoots });
trackEvent('game_over', { shards, waves, duration });
trackEvent('upgrade_purchased', { upgrade: 'armor', cost: 300 });
```

---

## 26. Security Considerations

### Smart Contract Security

**Move's Built-in Safety:**
- No reentrancy attacks (no cross-contract calls during execution)
- No integer overflow (checked arithmetic by default)
- No null pointers (Option type is explicit)
- Resource safety (objects can't be duplicated or lost)

**Still Need to Guard Against:**

```move
// Input validation
public entry fun forge_tokens(shards: u64, ...) {
    assert!(shards > 0, ERR_ZERO_AMOUNT);
    assert!(shards <= 500, ERR_EXCESSIVE_AMOUNT);
    // ...
}

// Access control
public entry fun buy_armor(payment: Coin<DUNGEON>, ...) {
    assert!(coin::value(&payment) >= 300, ERR_INSUFFICIENT_PAYMENT);
    // Can't check ownership of 'payment' - Move's type system handles it
}

// Prevent double-spending (handled by Move's ownership model)
// Once a coin is used in a transaction, its version increments
// Trying to reuse it fails automatically
```

### Frontend Security

```typescript
// Validate user input
function sanitizeShardAmount(input: string): number {
    const amount = parseInt(input);
    if (isNaN(amount) || amount < 0 || amount > 500) {
        throw new Error('Invalid shard amount');
    }
    return amount;
}

// Prevent transaction spam
const rateLimiter = new Map<string, number>();

async function forgeWithRateLimit(shards: number) {
    const now = Date.now();
    const lastForge = rateLimiter.get(currentAccount.address) || 0;
    
    if (now - lastForge < 5000) {  // 5 second cooldown
        throw new Error('Please wait before forging again');
    }
    
    rateLimiter.set(currentAccount.address, now);
    return await forgeTokens(shards);
}
```

### Backend Security (if implemented)

```typescript
// Rate limiting
import rateLimit from 'express-rate-limit';

const signLimiter = rateLimit({
    windowMs: 60 * 1000,  // 1 minute
    max: 10,  // 10 requests per minute per IP
    message: 'Too many signature requests'
});

app.post('/api/sign-forge', signLimiter, async (req, res) => {
    const { shards, timestamp, playerAddress } = req.body;
    
    // Validate inputs
    if (!shards || !timestamp || !playerAddress) {
        return res.status(400).json({ error: 'Missing parameters' });
    }
    
    if (shards > 500) {
        return res.status(400).json({ error: 'Excessive shard amount' });
    }
    
    // Check timestamp is recent (within 5 minutes)
    const now = Date.now();
    if (Math.abs(now - timestamp) > 300000) {
        return res.status(400).json({ error: 'Stale timestamp' });
    }
    
    // Prevent replay attacks
    const requestId = `${playerAddress}-${timestamp}`;
    if (await redis.get(requestId)) {
        return res.status(400).json({ error: 'Duplicate request' });
    }
    await redis.setex(requestId, 600, '1');  // 10 min TTL
    
    // Sign the data
    const signature = await signMessage(shards, timestamp, playerAddress);
    res.json({ signature });
});
```

---

## 27. Troubleshooting Guide

### Common Move Errors

| Error | Cause | Solution |
|-------|-------|----------|
| `InsufficientCoinBalance` | Not enough tokens to pay | Check balance before transaction |
| `ObjectNotFound` | Object ID doesn't exist | Verify object wasn't consumed in previous tx |
| `InvalidObjectVersion` | Using stale object version | Re-query object before transaction |
| `MoveAbort(code)` | Assert failed in Move | Check error code in module definition |
| `InsufficientGas` | Gas budget too low | Increase gas budget or optimize PTB |

### Common Frontend Errors

| Error | Cause | Solution |
|-------|-------|----------|
| `Wallet not connected` | User didn't connect | Show connection prompt, disable actions |
| `User rejected transaction` | User cancelled in wallet | Show "Transaction cancelled" message |
| `Network request failed` | RPC node down | Retry with exponential backoff |
| `Object already used` | Equivocation/double-spend attempt | Wait for transaction confirmation before next |

### Debugging Tools

```typescript
// Enable verbose transaction logging
const result = await signAndExecuteTransaction({
    transaction: tx,
    options: {
        showEffects: true,
        showObjectChanges: true,
        showEvents: true,
        showInput: true,
        showRawInput: true,
    }
});

console.log('Transaction result:', JSON.stringify(result, null, 2));

// Inspect objects in Sui Explorer
const explorerUrl = `https://explorer.onelabs.cc/object/${objectId}?network=testnet`;
console.log('View in explorer:', explorerUrl);

// Dry run transaction before signing
const dryRunResult = await client.dryRunTransactionBlock({
    transactionBlock: await tx.build({ client })
});

if (dryRunResult.effects.status.status !== 'success') {
    console.error('Dry run failed:', dryRunResult.effects.status.error);
}
```

---

## 28. Success Metrics & KPIs

### Hackathon Judging Criteria

| Criteria | Weight | How We Excel |
|----------|--------|--------------|
| **Technical Innovation** | 30% | Move smart contracts + object-based architecture + PTBs |
| **User Experience** | 25% | Seamless off-chain gameplay, minimal wallet interactions |
| **Completeness** | 20% | Full game loop working, smart contracts deployed |
| **Presentation** | 15% | Live demo, clear explanation of tech stack |
| **Business Viability** | 10% | Token economics, roadmap, retention mechanisms |

### Demo Day Goals

- [ ] Zero crashes during 3-minute demo
- [ ] Complete full gameplay loop in under 2 minutes
- [ ] Show at least one upgrade purchase on-chain
- [ ] Explain technical architecture clearly
- [ ] Have judges test the game themselves

### Post-Launch Targets (Month 1)

- 500+ unique wallet connections
- 10,000+ games played
- 2,000+ upgrades minted
- 30% player retention (return after 24 hours)
- $50k+ in $DUNGEON trading volume (if DEX listed)

---

## 29. Acknowledgments & Resources

### OneChain Documentation
- [Developer Documentation](https://docs.onelabs.cc/DevelopmentDocument)
- [Move Tutorial](https://docs.onelabs.cc/DevelopmentDocument#your-first-dapp)
- [RPC Endpoints](https://rpc-testnet.onelabs.cc:443)

### External Resources
- [Sui Move by Example](https://examples.sui.io/)
- [Phaser 3 Documentation](https://photonstorm.github.io/phaser3-docs/)
- [React + TypeScript Guide](https://react-typescript-cheatsheet.netlify.app/)

### Community Support
- OneChain Discord: [Link if available]
- Sui Move Forum: [Link if available]
- Hackathon Slack channel