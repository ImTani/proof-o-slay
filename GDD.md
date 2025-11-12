# 🎮 Proof O' Slay - Game Design Document

**Last Updated:** November 12, 2025 (Gambling System Added)  
**Status:** Scope finalized, ready for implementation  
**Genre:** Vampire Survivors-style Auto-Shooter with Blockchain Progression

---

## 📋 Table of Contents
1. [Elevator Pitch](#elevator-pitch)
2. [Core Pillars](#core-pillars)
3. [Scope Evolution](#scope-evolution)
4. [Core Systems](#core-systems)
5. [Game Economy](#game-economy)
6. [Gambling System](#gambling-system)
7. [Progression & Scaling](#progression--scaling)
8. [Technical Architecture](#technical-architecture)
9. [Security Model](#security-model)
10. [Success Criteria](#success-criteria)
11. [Demo Strategy](#demo-strategy)

---

## 1. Elevator Pitch {#elevator-pitch}

**Proof O' Slay** is a fast-paced, top-down **Vampire Survivors-style auto-shooter** with exponential power scaling and blockchain-backed progression. Players battle through infinite enemy hordes in an endless scrolling world, earning "Glimmering Shards" that forge into `$SLAY` tokens. 

Choose from **3 unique character classes** (Warrior, Mage, Rogue), each with distinct skills and playstyles. Unlock **6 weapons** ranging from starter gear to endgame legendaries. Purchase and upgrade **5 types of NFTs** that provide exponential stat boosts, creating a godlike power fantasy. The game scales dynamically—the stronger you get, the tougher the enemies become—ensuring runs inevitably end in glorious defeat after 15-25 minutes.

**Core Loop:** Play (off-chain) → Earn Shards → Forge Tokens → Buy/Upgrade NFTs (on-chain) → Play Stronger

---

## 2. Core Pillars {#core-pillars}

### 🎯 Fast & Chaotic Gameplay
Vampire Survivors-inspired combat with screen-filling enemies and immediate, satisfying feedback. Tight WASD controls, instant projectile response, and explosive power escalation.

### 💪 Exponential Power Fantasy
Go from carefully kiting 5 slimes to obliterating 200 enemies simultaneously. Each upgrade provides meaningful, visible power increases. Late-game runs feel like you're controlling a force of nature.

### 🔁 Addictive Loop
The "one more run" feeling is paramount. Short 15-25 minute sessions with clear progression markers. Every run makes you stronger, every death teaches you something new.

### 🧩 Component-Based Architecture
Built on ECS principles (Entity-Component-System). New content is data-driven—add enemies, weapons, or classes by updating config files, not rewriting code. Godot-style composition over inheritance.

### 🔗 True Asset Ownership
Upgrades are **upgradeable NFTs** in your wallet, not database entries. Your Power Ring Level 5 is a tradeable blockchain asset. Progression persists across devices and can be transferred or sold.

### ⚔️ Class Identity
Three distinct classes with unique base stats, starting weapons, and cooldown-based active skills. Warrior (bruiser mobility), Mage (glass cannon AoE), Rogue (evasion defense). Class choice fundamentally changes playstyle.

### ♾️ Infinite Progression
No arbitrary "final level." Enemies scale infinitely with time survived. The question isn't "can I win?" but "how long can I survive?"

---

## 3. Scope Evolution {#scope-evolution}

## 3. Scope Evolution {#scope-evolution}

### Original MVP (Minimal Concept)
- ❌ 1 player character, 1 enemy type
- ❌ 2 simple upgrades (Armor, Boots)
- ❌ Wave-based gameplay in static room
- ❌ Basic survive-until-dead loop

### Expanded MVP (Current Target)
- ✅ **3 character classes** with unique skills and playstyles
- ✅ **6 weapons** (3 class starters, 2 unlockables, 1 endgame bragging rights)
- ✅ **5 upgradeable NFTs** (Level 1-5 each, exponential bonuses)
- ✅ **5 power-up pickups** (temporary 10-25s buffs)
- ✅ **3 enemy types** with infinite time-based scaling
- ✅ **Infinite scrolling world** (seamless camera follow)
- ✅ **Off-chain consumables** (Shard-based pre-run buffs)
- ✅ **Exponential power scaling** (8-10x power at max build)

**Rationale:** The minimal version lacked replayability and depth. By expanding to class variety, meaningful progression, and dynamic scaling, we create the addictive "one more run" loop that makes Vampire Survivors-style games successful.

---

## 4. Core Systems {#core-systems}

### 4.1 Character Classes

Players choose a class before each run. Classes have different base stats, starting weapons, and unique active skills (Spacebar).

#### 🗡️ Warrior (Balanced Bruiser)
| Stat | Value | Description |
|------|-------|-------------|
| **HP** | 120 | Highest survivability |
| **Speed** | 100 | Standard movement |
| **Damage** | 1.0x | Baseline multiplier |
| **Weapon** | Iron Sword | Melee arc, 3-pierce |

**Skill: Battle Dash**
- **Cooldown:** 5 seconds
- **Effect:** Dash 200px forward, invincible 0.5s, 20 damage to enemies passed through
- **Use Case:** Gap closer, dodge, escape crowds
- **Visual:** Blue afterimage trail

---

#### 🔮 Mage (Glass Cannon)
| Stat | Value | Description |
|------|-------|-------------|
| **HP** | 80 | Lowest survivability |
| **Speed** | 90 | Slightly slower |
| **Damage** | 1.3x | Highest damage output |
| **Weapon** | Arcane Staff | Homing orbs |

**Skill: Arcane Nova**
- **Cooldown:** 8 seconds
- **Effect:** 150 damage to all enemies in 300px radius, knockback
- **Use Case:** Clear dense packs, emergency breathing room
- **Visual:** Purple energy explosion with shockwave

---

#### 🗡️ Rogue (High Mobility Assassin)
| Stat | Value | Description |
|------|-------|-------------|
| **HP** | 100 | Balanced survivability |
| **Speed** | 120 | Fastest movement |
| **Damage** | 1.1x | Slightly above baseline |
| **Weapon** | Twin Daggers | Dual-shot rapid fire |

**Skill: Phantom Barrier**
- **Cooldown:** 10 seconds
- **Effect:** Absorb next 100 damage, lasts 6 seconds or until broken
- **Use Case:** Tank damage spikes, survive boss attacks
- **Visual:** Translucent golden shield bubble

---

### 4.2 Weapon System

Six total weapons, each with distinct mechanics and acquisition methods.

| Weapon | Type | Acquire | Damage | Cooldown | Range | Special |
|--------|------|---------|--------|----------|-------|---------|
| **Iron Sword** | Melee Arc | Warrior starter | 15 | 0.5s | 50px | Pierce 3 enemies |
| **Arcane Staff** | Homing | Mage starter | 12 | 0.6s | 300px | Auto-targets nearest |
| **Twin Daggers** | Dual-Shot | Rogue starter | 8×2 | 0.3s | 200px | Spread pattern |
| **Heavy Crossbow** | Piercing | 10% Tank drop | 30 | 1.2s | 400px | Pierce all enemies |
| **Flamethrower** | Cone DoT | 1500 $SLAY | 5/tick | 0.1s | 150px | Continuous cone AoE |
| **Celestial Cannon** | Explosive | 10000 $SLAY | 100 | 2.0s | 600px | 200px explosion radius |

**Weapon Progression:**
- **Early Game (0-5 min):** Class starter weapon, single-target focused
- **Mid Game (5-15 min):** Unlock Crossbow from Tank drops, wider coverage
- **Late Game (15+ min):** Purchase Flamethrower for screen control
- **Endgame (20+ runs):** Celestial Cannon as ultimate bragging rights weapon

---

### 4.3 Enemy Types & AI

Three enemy types with distinct behaviors that scale infinitely with time survived.

#### 🟢 Slime (Basic Chaser)
| Stat | Base Value | Behavior |
|------|------------|----------|
| **HP** | 30 | Direct chase AI |
| **Speed** | 40 | Slow melee |
| **Damage** | 10 | Contact damage |
| **Loot** | 1 shard | 8% power-up drop |

**AI:** Simple pathfinding toward player. No special attacks.

---

#### 🏹 Archer (Ranged Kiter)
| Stat | Base Value | Behavior |
|------|------------|----------|
| **HP** | 20 | Kite & shoot |
| **Speed** | 30 | Maintains 200px distance |
| **Damage** | 15 | Projectile attack |
| **Loot** | 1 shard | 6% power-up drop |

**AI:** Moves away from player when closer than 200px. Fires arrow every 2 seconds. Prioritizes staying at range.

---

#### 🛡️ Tank (Mini-Boss)
| Stat | Base Value | Behavior |
|------|------------|----------|
| **HP** | 200 | Slow chase |
| **Speed** | 25 | Unstoppable advance |
| **Damage** | 25 | Heavy contact damage |
| **Loot** | 5 shards | 30% power-up, 10% Crossbow |

**AI:** Direct chase with high knockback resistance. Spawns every 10 minutes as a boss encounter.

---

### 4.4 Time-Based Scaling System

Enemies scale dynamically based on time survived to match player power growth.

**Scaling Formulas:**
```
Enemy HP = Base HP × (1 + 0.05 × minutes_survived)
Enemy Damage = Base Damage × (1 + 0.04 × minutes_survived)
Enemy Speed = Base Speed × (1 + 0.02 × minutes_survived)
Spawn Rate = Base Rate × (1 + 0.1 × minutes_survived)
```

**Example Progression:**

| Time | Slime HP | Slime Damage | Spawn Rate | Feel |
|------|----------|--------------|------------|------|
| **0 min** | 30 (100%) | 10 (100%) | 1/sec | Tense, careful dodging |
| **10 min** | 45 (150%) | 14 (140%) | 2/sec | Building confidence |
| **20 min** | 60 (200%) | 18 (180%) | 3/sec | Screen-filling chaos |
| **30 min** | 75 (250%) | 22 (220%) | 4/sec | Inevitable death approaches |

**Death Timer:** Most runs end between 15-25 minutes as enemy scaling eventually outpaces player power, ensuring no run lasts forever.

---

### 4.5 Power-Up Pickups (Temporary Buffs)

Five temporary buffs that drop from enemy kills, creating exciting power spikes during runs.

| Power-Up | Drop Rate | Duration | Effect | Visual |
|----------|-----------|----------|--------|--------|
| **⚡ Speed Boost** | 8% | 15s | +50% movement speed | Yellow glow, trailing particles |
| **🔥 Rapid Fire** | 6% | 12s | -50% weapon cooldowns | Red weapon glow |
| **🛡️ Shield** | 5% | 20s | Absorb 150 damage | Blue bubble, cracks when hit |
| **🧲 Magnet** | 7% | 20s | Auto-collect shards 400px | Green sparkles |
| **💎 Double Shards** | 3% | 25s | 2x shard drops | Golden aura |

**Stacking Rules:**
- Same type: Duration refreshes (no stacking)
- Different types: Can have multiple active simultaneously
- UI: Icons with countdown timers above health bar

---

### 4.6 Upgradeable NFTs (On-Chain Progression)

Five NFT types, each upgradeable from Level 1 to Level 5. Bonuses stack exponentially.

| NFT | Base Cost | L2 | L3 | L4 | L5 | Effect | Bonus Formula |
|-----|-----------|-----|-----|-----|-----|--------|---------------|
| **💍 Power Ring** | 300 | 600 | 1200 | 2400 | 4800 | +20% damage/level | Exponential |
| **❤️ Vitality Amulet** | 400 | 800 | 1600 | 3200 | 6400 | +25 HP/level | Flat |
| **👢 Swift Boots** | 500 | 1000 | 2000 | 4000 | 8000 | +15% speed/level | Exponential |
| **🔍 Mystic Lens** | 600 | 1200 | 2400 | 4800 | 9600 | +20% range/level | Exponential |
| **🍀 Lucky Pendant** | 800 | 1600 | 3200 | 6400 | 12800 | +10% drops/level | Exponential |

**Exponential Stacking Formula:**  
```
Total Bonus = (1 + base_bonus)^level - 1
```

**Example: Power Ring Progression**
- Level 1: (1.2)^1 - 1 = **+20.0% damage**
- Level 2: (1.2)^2 - 1 = **+44.0% damage**
- Level 3: (1.2)^3 - 1 = **+72.8% damage**
- Level 4: (1.2)^4 - 1 = **+107.4% damage**
- Level 5: (1.2)^5 - 1 = **+148.8% damage**

**Max Power Build (All Level 5):**
- Damage: Base × 2.488 = **+148.8%**
- HP: Base + 125 = **+125 HP**
- Speed: Base × 2.011 = **+101.1%**
- Range: Base × 2.488 = **+148.8%**
- Drop Rate: Base × 1.610 = **+61.0%**

**Effective Power Multiplier:** ~8-10x base power at full build

---

### 4.7 Consumables (Off-Chain, Shard-Based)

Pre-run buffs purchased with Shards (off-chain currency). Applied for entire run duration.

| Consumable | Cost (Shards) | Effect | Duration |
|------------|---------------|--------|----------|
| **🔥 Damage Elixir** | 100 | +50% damage | Entire run |
| **❤️ Extra Life** | 200 | Revive once at 50% HP | One-time per run |
| **🍀 Lucky Charm** | 150 | +50% shard drops | Entire run |
| **⚡ Speed Potion** | 80 | +30% movement speed | Entire run |
| **💰 Starting Gold** | 50 | +500 bonus starting XP | Run start |

**Purchase Flow:**
1. Player spends Shards in React Hub shop
2. Consumable added to off-chain inventory (React state)
3. Player checks consumable before run
4. Buff applied to Phaser game on initialization
5. Consumable consumed after run ends

---

### 4.8 Infinite World System

**Camera:**
- Follows player with smooth lerp (0.1, 0.1)
- World bounds: 10000 × 10000 units (effectively infinite)
- Background: Seamlessly tiling texture

**Enemy Spawning:**
- Spawn off-screen (camera edges + 100px margin)
- Random edge selection (top/right/bottom/left)
- Perpetual spawning (no wave system)
- Spawn rate increases +10% per minute

**Performance:**
- Max 500 enemies alive simultaneously
- Cull enemies >2000px from camera
- Object pooling for bullets and enemies
- Destroy projectiles after 5 seconds

---

## 5. Game Economy {#game-economy}

### 5.1 Currency Flow

```
Kill Enemies → Earn Shards (off-chain)
                    ↓
        ┌───────────┴───────────┐
        ↓                       ↓
Spend on Consumables    Forge into $SLAY (on-chain)
   (temporary buffs)             ↓
                        Buy/Upgrade NFTs
                              ↓
                     Apply Permanent Bonuses
                              ↓
                        Play Stronger
```

**Two Currencies:**

| Currency | Type | Earn Method | Spend On | Conversion |
|----------|------|-------------|----------|------------|
| **Glimmering Shards** | Off-chain | Kill enemies (1-5 per kill) | Consumables, Forge | 1 Shard = 1 $SLAY |
| **$SLAY Token** | On-chain | Forge Shards | NFT buy/upgrade, Weapons | Can't convert back |

### 5.2 Shard Earn Rate

**Base Earn Rate:**
- Early game (0-5 min): ~1 shard per enemy kill
- Mid game (5-15 min): ~2-3 shards per enemy
- Late game (15+ min): ~5+ shards per enemy
- Boss kills (Tanks): 5x multiplier

**Run Length Projections:**
- Beginner (5-10 min): **100-200 shards**
- Average (10-18 min): **250-400 shards**
- Expert (18-25 min): **400-600 shards**

**Modifiers:**
- Lucky Pendant NFT: +10-61% drops (based on level)
- Lucky Charm Consumable: +50% for one run
- Double Shards Power-Up: 2x for 25 seconds

---

## 6. Gambling System {#gambling-system}

### 6.1 Time-Based Betting (Core System)

Players can optionally stake $SLAY tokens before a run, betting on their survival time. This is **completely optional** and never forced.

#### How It Works:
1. Before starting a run, player can choose to stake $SLAY
2. Select a survival time goal: 10, 15, or 20 minutes
3. If they survive the target time, they win a multiplied payout
4. If they die before the target, they lose their stake

#### Betting Tiers:

| Goal | Minimum Stake | Multiplier | Example Payout |
|------|---------------|------------|----------------|
| **Survive 10 min** | 50 $SLAY | 1.5x | 50 → 75 $SLAY |
| **Survive 15 min** | 100 $SLAY | 2.0x | 100 → 200 $SLAY |
| **Survive 20 min** | 200 $SLAY | 3.0x | 200 → 600 $SLAY |

**Risk/Reward Balance:**
- Low stakes for casual players (50-100 $SLAY)
- Achievable targets based on player progression
- 10-minute goal is accessible even for beginners
- 20-minute goal is challenging but rewarding

**UI Integration:**
- Optional checkbox on class selection screen: "Stake for this run?"
- Shows potential payout: "Risk 100 $SLAY to win 200 $SLAY (15 min)"
- Clear countdown timer during gameplay
- Victory screen shows winnings prominently

---

### 6.2 Progressive Jackpot (Special Event)

An advanced gambling mode that must be **earned** by players, not freely accessible.

#### Unlock Conditions:
Players earn **Jackpot Tickets** by:
- Completing 10 successful time-based bets (1 ticket)
- Surviving 25+ minutes in a single run (1 ticket)
- Achieving 3 consecutive runs of 15+ minutes (2 tickets)
- Daily login bonus (1 ticket per week)

**Ticket UI:** Show owned tickets in hub (e.g., "🎟️ Jackpot Tickets: 3")

#### How Progressive Jackpot Works:
1. Spend 1 Jackpot Ticket + stake amount (50-500 $SLAY)
2. Multiplier starts at 1.1x and increases by 0.1x every minute survived
3. Player can press **"C" key** at any time to cash out current winnings
4. If they die before cashing out, they lose everything

#### Example Run:
```
Start: Stake 100 $SLAY + 1 Ticket
5 min:  Current value: 150 $SLAY (1.5x) - Press C to claim, or keep going?
10 min: Current value: 200 $SLAY (2.0x) - Tension rising...
15 min: Current value: 250 $SLAY (2.5x) - Do I cash out or push to 3x?
*Dies at 16 min* - Lose everything!

OR

*Presses C at 12 min* - Walk away with 220 $SLAY (2.2x)
```

#### Gameplay Dynamics:
- **Tension:** Every second you survive increases reward, but death is inevitable
- **Decision Making:** "Do I cash out now or push my luck?"
- **High Stakes:** Losing a ticket + stake hurts, but potential rewards are massive
- **Skill Expression:** Experienced players can confidently push to 20-25 minutes

#### Balance Considerations:
- **Limited Access:** Tickets prevent jackpot spam, maintain special event feel
- **Progressive Risk:** Early cash-out is safe, late push is thrilling
- **Economy Safety:** Max ~3x multiplier even at 30 min (1.1 + 0.1 × 20 = 3.1x)
- **Psychological Hook:** Creates memorable "I almost got 500 $SLAY!" moments

---

### 6.3 Smart Contract Implementation

#### Staking Record Struct:
```move
public struct StakeRecord has key, store {
    id: UID,
    player: address,
    stake_amount: u64,
    bet_type: u8, // 0 = Time-based, 1 = Progressive Jackpot
    target_minutes: u8, // For time-based bets
    multiplier: u64, // Fixed for time-based, dynamic for jackpot
    start_time: u64,
    is_active: bool
}
```

#### Entry Functions:
```move
// Time-based betting
public entry fun stake_for_run(
    payment: Coin<SLAY>,
    target_minutes: u8, // 10, 15, or 20
    ctx: &mut TxContext
)

public entry fun claim_stake_reward(
    stake_record: &mut StakeRecord,
    survival_time_minutes: u64,
    treasury_cap: &mut TreasuryCap<SLAY>,
    ctx: &mut TxContext
)

public entry fun forfeit_stake(
    stake_record: StakeRecord,
    treasury: &mut Treasury,
    ctx: &mut TxContext
)

// Progressive Jackpot (requires ticket)
public entry fun start_progressive_jackpot(
    payment: Coin<SLAY>,
    ticket: JackpotTicket, // Burn ticket on use
    ctx: &mut TxContext
)

public entry fun cash_out_jackpot(
    stake_record: &mut StakeRecord,
    survival_time_minutes: u64,
    treasury_cap: &mut TreasuryCap<SLAY>,
    ctx: &mut TxContext
)
```

#### Jackpot Ticket NFT:
```move
public struct JackpotTicket has key, store {
    id: UID,
    earned_by: address,
    issued_date: u64
}

// Earned automatically via game logic (frontend awards after milestones)
public entry fun award_jackpot_ticket(
    recipient: address,
    ctx: &mut TxContext
)
```

---

### 6.4 Honor System & Security

**MVP Approach (Honor System):**
- Frontend reports survival time to contract via `claim_stake_reward`
- Contract trusts the reported time (same as forge system)
- Max stake limits prevent massive exploits (500 $SLAY max)

**Production Security:**
- Backend signature required: `claim_stake_reward_with_signature(stake_record, survival_time, timestamp, signature)`
- ECDSA verification ensures legitimate survival time
- Same backend service as forge system

**Risk Mitigation:**
- Stake limits: 50-500 $SLAY range (prevents whale exploits)
- Jackpot tickets are limited resource (can't spam jackpot mode)
- Failed stakes go to treasury (community benefit)
- Contract emits events for analytics/fraud detection

---

## 7. Progression & Scaling {#progression--scaling}

### 7.1 Player Progression Timeline

| Milestone | Shards Needed | Runs @ 300/run | Time @ 15min/run |
|-----------|---------------|----------------|------------------|
| **First NFT** (Power Ring L1) | 300 | 1 run | 15 minutes |
| **Second NFT** (Vitality L1) | 400 | 1.3 runs | 20 minutes |
| **Full L1 Set** (5 NFTs) | 2,600 | 8.7 runs | **2.2 hours** |
| **Power Ring → L5** | 9,300 total | 31 runs | 7.8 hours |
| **All NFTs → L3** | ~24,000 | 80 runs | **20 hours** |
| **All NFTs → L5** | ~80,600 | 270 runs | **67.5 hours** |
| **Celestial Cannon** | 10,000 | 33 runs | 8.3 hours |

**Target Player Journey:**
- **Session 1 (1-2 hours):** Get first 2-3 Level 1 NFTs, immediate power spike
- **Week 1 (5-10 hours):** Complete Level 1 set, upgrade favorites to L2-L3
- **Month 1 (20-40 hours):** Push high-level NFTs (L4-L5), unlock Flamethrower
- **Long-term (50+ hours):** Max everything, grind for Celestial Cannon

### 7.2 Power Curve Visualization

**Early Game (No NFTs):**
- Base damage: 10
- Base HP: 80-120 (class dependent)
- Kill 1-2 enemies per second
- Survive ~5-10 minutes

**Mid Game (L1-L2 NFTs):**
- Damage: 14-18 (+40-80%)
- HP: 105-170 (+25-50 HP)
- Kill 5-10 enemies per second
- Survive ~10-15 minutes

**Late Game (L3-L4 NFTs):**
- Damage: 20-30 (+100-200%)
- HP: 155-220 (+75-100 HP)
- Kill 15-30 enemies per second
- Survive ~15-20 minutes

**Endgame (All L5 NFTs):**
- Damage: 35-45 (+250-350%)
- HP: 205-245 (+125 HP)
- Kill 50+ enemies per second
- Survive ~20-25 minutes (death inevitable)

---

## 8. Technical Architecture {#technical-architecture}

### 8.1 Component-Based ECS Structure

**Philosophy:** Composition over inheritance, inspired by Godot's node system.

```
frontend/src/game/
├── config/
│   └── GameConfig.ts          # All data (weapons, classes, enemies, NFTs)
│
├── components/                # Pure data structures
│   ├── HealthComponent.ts     # { current, max }
│   ├── MovementComponent.ts   # { speed, velocity }
│   ├── WeaponComponent.ts     # { type, fireRate, damage }
│   ├── AIComponent.ts         # { behavior, targetPosition }
│   ├── ClassComponent.ts      # { type, skillCooldown }
│   ├── PowerUpComponent.ts    # { type, duration, effect }
│   └── ScalingComponent.ts    # { spawnTime, baseStats }
│
├── systems/                   # Pure logic operating on components
│   ├── InputSystem.ts         # WASD + mouse + spacebar
│   ├── MovementSystem.ts      # Apply velocity to position
│   ├── AISystem.ts            # Chase, kite, shoot behaviors
│   ├── WeaponSystem.ts        # Weapon firing logic
│   ├── SkillSystem.ts         # Class ability execution
│   ├── PowerUpSystem.ts       # Buff timer management
│   ├── ProjectileSystem.ts    # Bullet movement & collision
│   ├── HealthSystem.ts        # Damage application
│   ├── SpawnSystem.ts         # Perpetual enemy spawning
│   └── ScalingSystem.ts       # Time-based stat scaling
│
├── entities/                  # Factory functions (composition)
│   ├── PlayerEntity.ts        # createPlayer(class, nftBonuses, consumables)
│   ├── WarriorEntity.ts       # Warrior-specific setup
│   ├── MageEntity.ts          # Mage-specific setup
│   ├── RogueEntity.ts         # Rogue-specific setup
│   ├── SlimeEntity.ts         # createSlime(spawnTime)
│   ├── ArcherEntity.ts        # createArcher(spawnTime)
│   ├── TankEntity.ts          # createTank(spawnTime)
│   ├── BulletEntity.ts        # Weapon projectile factories
│   ├── ShardEntity.ts         # createShard(position)
│   └── PowerUpEntity.ts       # createPowerUp(type, position)
│
└── scenes/
    ├── MenuScene.ts           # Class selection
    └── GameSceneECS.ts        # Main game loop (system orchestration)
```

**Adding New Content Example:**

```typescript
// 1. Add weapon to GameConfig.ts
WEAPONS.LASER_RIFLE = {
  name: 'Laser Rifle',
  fireRate: 100,
  damage: 3,
  bulletSpeed: 800,
  specialEffect: 'pierce_infinite'
}

// 2. Create entity factory (if needed)
export function createLaserBullet(scene, x, y, angle) {
  const bullet = scene.bullets.get(x, y, 'laser');
  bullet.setData('projectile', { damage: 3, pierce: Infinity });
  bullet.setRotation(angle);
  scene.physics.velocityFromRotation(angle, 800, bullet.body.velocity);
  return bullet;
}

// 3. Wire into WeaponSystem (reads config automatically)
```

**NO code changes needed** for new enemies, classes, or power-ups—just update config files.

### 8.2 React ↔ Phaser Bridge

**Communication Flow:**

```typescript
// React → Phaser (game start)
const gameConfig = {
  classType: 'Warrior',
  nftBonuses: {
    damage: 1.728,  // Power Ring L3
    hp: 50,         // Vitality Amulet L2
    speed: 1.322,   // Swift Boots L2
    range: 1.2,     // Mystic Lens L1
    dropRate: 1.21  // Lucky Pendant L2
  },
  consumables: {
    damageBoost: 1.5,   // Damage Elixir
    extraLife: true,    // Extra Life
    luckyCharm: 1.5     // Lucky Charm
  },
  unlockedWeapons: ['Flamethrower'],
  callbacks: {
    onGameOver: (stats) => handleGameOver(stats)
  }
};

// Phaser → React (game end)
this.game.config.callbacks.onGameOver({
  shards: 350,
  timeAlive: 18.5, // minutes   
  enemiesKilled: 1247
});
```

### 8.3 Blockchain Architecture

**Smart Contract Structure:**

```
contracts/proof_o_slay/sources/
└── proof_o_slay.move
    ├── SLAY token (Coin<SLAY>)
    ├── Treasury (shared object for payments)
    │
    ├── Upgradeable NFTs (owned objects)
    │   ├── PowerRing { id, level }
    │   ├── VitalityAmulet { id, level }
    │   ├── SwiftBoots { id, level }
    │   ├── MysticLens { id, level }
    │   └── LuckyPendant { id, level }
    │
    ├── Weapon NFTs
    │   └── WeaponNFT { id, type, stats }
    │
    ├── Functions
    │   ├── forge_tokens(amount)        # Mint $SLAY from Shards
    │   ├── buy_* (5 NFT types)         # Purchase Level 1 NFT
    │   ├── upgrade_* (5 NFT types)     # Upgrade NFT level
    │   ├── buy_weapon(type)            # Purchase weapon NFT
    │   └── query_* (stats functions)   # Read NFT stats
```

**Frontend Integration:**

```typescript
// Query owned NFTs
const nfts = await suiClient.getOwnedObjects({
  owner: address,
  filter: { StructType: `${PACKAGE_ID}::game::PowerRing` }
});

// Calculate total bonuses
const powerRingLevel = nfts.data[0]?.content.fields.level || 0;
const damageBonus = Math.pow(1.2, powerRingLevel) - 1;

// Apply to game config before starting run
gameConfig.nftBonuses.damage = 1 + damageBonus;
```

---

## 9. Security Model {#security-model}

### 9.1 Honor System (MVP)

**Current Approach:** For the hackathon MVP, we are implementing an **honor system** without backend signature verification.

**What This Means:**
- The Move module's `forge_tokens` function accepts shard amounts without cryptographic proof
- Players could theoretically call the function directly from their wallet with any amount
- The `MAX_SHARDS_PER_RUN` check (500-1000) is enforced in the Move module as a basic sanity check
- The token has no external value, limiting exploit incentive

**Why Honor System:**
- **Time Constraint:** Hackathon deadline prioritizes demonstrating core gameplay loop over anti-cheat
- **Focus:** We want to showcase blockchain integration and game mechanics, not security infrastructure
- **Scope:** Backend signature service is scaffolded but not connected
- **Risk Mitigation:** Token is internal-only (no DEX listing during demo)

**Judges Acknowledgment:**
> "In production, we would implement backend signature verification using ECDSA secp256k1 to prevent shard inflation exploits. The forge system would require a backend-signed message proving the player legitimately earned those shards. For this demo, we're focused on showcasing the gameplay loop and on-chain upgrade mechanics."

### 9.2 Production Security Plan

When implementing full security post-hackathon:

**Backend Signature Service:**
1. Receives `{ shards, timestamp, playerAddress }` from frontend after game over
2. Validates shard amount is reasonable (≤500 based on run duration)
3. Checks timestamp is recent (within 5 minutes)
4. Prevents replay attacks (Redis cache of used signatures with TTL)
5. Signs data with ECDSA secp256k1 private key
6. Returns signature to frontend

**Move Module Update:**
- Add `forge_tokens_with_signature(shards, timestamp, signature)` function
- Verify signature using `sui::ecdsa_k1::secp256k1_verify`
- Check timestamp validity (not too old)
- Mint tokens only if signature is valid

**Additional Security Measures:**
- Rate limiting on backend (10 requests/minute per IP)
- Server-side anti-cheat heuristics (sudden shard spikes, impossible run durations)
- On-chain analytics (flag accounts with abnormal forge patterns)
- Admin dashboard for manual review of suspicious activity

---

## 10. Success Criteria {#success-criteria}

### 10.1 MVP Complete Checklist

#### Core Gameplay
- [ ] 3 classes playable with distinct feels (Warrior, Mage, Rogue)
- [ ] 6 weapons functional (3 starters, 2 unlockables, 1 endgame)
- [ ] 3 enemy types spawn and scale correctly (Slime, Archer, Tank)
- [ ] Class skills work on cooldown (Dash, Nova, Barrier)
- [ ] Infinite world with smooth scrolling camera
- [ ] Runs last 10-25 minutes before inevitable death
- [ ] Shard earning scales appropriately (200-600 per run)
- [ ] Power-ups drop and apply temporary buffs
- [ ] Visual feedback (health bar, skill cooldowns, power-up timers)

#### Meta-Progression
- [ ] Forge system converts Shards → $SLAY
- [ ] 5 NFT types purchasable and upgradeable (L1-L5)
- [ ] NFT upgrades apply exponentially in-game
- [ ] Flamethrower and Celestial Cannon purchasable
- [ ] Consumables shop works (Shard-based pre-run buffs)
- [ ] Full loop tested 10+ times without crashes

#### Feel & Balance
- [ ] Classes feel meaningfully different (not just stat tweaks)
- [ ] Skills are satisfying and impactful to use
- [ ] Power-ups create exciting decision moments
- [ ] Early game is tense, late game is chaotic power fantasy
- [ ] NFT upgrades feel rewarding (+50-150% power jumps)
- [ ] Enemies scale to match player power (death inevitable ~20-25 min)
- [ ] First NFT achievable in 1-2 runs (~30 minutes playtime)

#### Technical
- [ ] No crashes after 30 minutes of continuous play
- [ ] Smooth 60 FPS with 200+ enemies on screen
- [ ] Object pooling prevents memory leaks
- [ ] Wallet transactions succeed consistently
- [ ] NFT queries complete in <2 seconds
- [ ] Game state syncs correctly with blockchain

### 10.2 Demo Day Success

**3-Minute Demo Flow:**

1. **Hook (30 seconds)**
   - "Blockchain games are slow and clunky. Proof O' Slay is different—Vampire Survivors gameplay with on-chain progression."
   - Show hub screen with wallet connected

2. **Gameplay (60 seconds)**
   - Select Mage class
   - Play 30 seconds—show chaos, skills, power-ups
   - Die intentionally at ~1 minute mark
   - Show 250 shards earned

3. **Blockchain Integration (60 seconds)**
   - Forge 250 Shards → 250 $SLAY (show wallet transaction)
   - Purchase Power Ring Level 1 (300 $SLAY)
   - Start new run, demonstrate +20% damage increase immediately

4. **Technical Deep Dive (30 seconds)**
   - "5 upgradeable NFTs, each with 5 levels, exponential scaling"
   - "Power Ring Level 5 gives +149% damage—that's the power fantasy"
   - "Vampire Survivors gameplay, but your build lives in your wallet forever"

**Fallback Plan:**
- Pre-recorded gameplay video if live demo fails
- Testnet deployed contracts with visible transactions in explorer
- Screenshots of key moments (class selection, forge, upgrade, buffed gameplay)

---

## 11. Demo Strategy {#demo-strategy}

### 11.1 Pitch Structure

**Minute 1: Problem & Solution**
> "Blockchain games promise asset ownership, but they're slow turn-based experiences with clunky UX. Players want fast-paced action, not waiting for transactions between every move.
> 
> Proof O' Slay solves this: **fast off-chain gameplay** (Vampire Survivors-style auto-shooter) with **meaningful on-chain progression** (upgradeable NFTs). Play for 15 minutes, earn Shards, forge them into tokens, buy NFTs that make you permanently stronger."

**Minute 2: Live Demo**
1. Show class selection (3 distinct classes)
2. Play 30 seconds—chaos, skill usage, power-ups
3. Die, show 300 Shards earned
4. Forge Shards → $SLAY (wallet transaction)
5. Buy Power Ring Level 1
6. Start new run—show immediate +20% damage buff

**Minute 3: Technical Innovation**
> "Under the hood:
> - **Move smart contracts** with upgradeable NFTs (level 1-5 progression)
> - **Exponential scaling**: Power Ring goes from +20% at L1 to +149% at L5
> - **Component-based ECS**: Add new weapons/classes by updating config files
> - **Honor system for MVP**, but production would use backend signature verification
> 
> We're not just putting a game on-chain for the sake of it—we're proving that blockchain and fast gameplay can coexist."

**Call to Action:**
> "Try the demo yourself at [URL]. We're launching on mainnet next month, and early testers will receive Genesis Class NFTs. Questions?"

### 11.2 Common Judge Questions

**Q: "Why not just use a traditional database?"**
> A: "Two reasons: (1) True ownership—players can trade their Level 5 Power Ring to other players. (2) Composability—future games could recognize these NFTs and grant bonuses. Our NFTs aren't just stats, they're portable assets."

**Q: "How do you prevent cheating without backend verification?"**
> A: "For the MVP, we accept the honor system since the token has no external value. Post-hackathon, we'd add ECDSA signature verification where the backend signs `{ shards, timestamp }` and Move verifies it. We have this architecture designed but de-scoped for time."

**Q: "What's the business model?"**
> A: "Three paths: (1) Cosmetic NFTs (skins, effects), (2) Secondary market royalties (5% on NFT trades), (3) Tournament entry fees (prize pools in $SLAY). The core game stays free-to-play with no pay-to-win."

**Q: "How does this compare to Axie Infinity or Gods Unchained?"**
> A: "Those are turn-based strategy games where blockchain slows down gameplay. We separate concerns: fast arcade action off-chain, persistence on-chain. Players get Vampire Survivors-quality combat with the ownership benefits of Web3."

**Q: "What if OneLabs.cc goes down?"**
> A: "Smart contracts are deployed on-chain—they're censorship-resistant and always accessible. The game client is open-source and can be hosted anywhere. Even if our servers disappear, players still own their NFTs and can run the game locally."

---

## 12. Post-MVP Roadmap {#post-mvp-roadmap}

### Phase 5: Content Expansion (Months 2-3)
- [ ] Add 3 more character classes (Necromancer, Paladin, Ranger)
- [ ] Add 5 more weapons (Laser Rifle, Lightning Rod, etc.)
- [ ] Add 2 more enemy types (Mage, Demon)
- [ ] Procedural SLAY rooms (Binding of Isaac style)
- [ ] Boss encounters every 5 minutes (unique mechanics)
- [ ] Pet system (NFT companions that assist in combat)

### Phase 6: Social Features (Month 3-4)
- [ ] Global leaderboard (longest survival time)
- [ ] Daily challenges with exclusive rewards
- [ ] Guild system (shared treasury, cooperative upgrades)
- [ ] Spectator mode (watch top players' runs)
- [ ] Replay system (share your best runs)

### Phase 7: Economy & Monetization (Month 4-6)
- [ ] Cosmetic NFTs (character skins, weapon skins, visual effects)
- [ ] Secondary marketplace (in-game trading with 5% royalty)
- [ ] Seasonal battle pass (cosmetic rewards)
- [ ] Tournament mode (entry fee, prize pool distribution)
- [ ] DEX listing for $SLAY (if community desires)

### Phase 8: Advanced Features (Month 6+)
- [ ] Weapon combo system (merge 2 weapons for hybrid attacks)
- [ ] Prestige system (reset progress for permanent account-wide bonuses)
- [ ] PvP arena mode (1v1 or battle royale)
- [ ] Mobile port (React Native + touch controls)
- [ ] Cross-chain bridges (expand to other L1s)

---

## 13. Appendix: Data-Driven Modularity {#appendix}

### Adding New Weapons (Example)

**1. Add to GameConfig.ts:**
```typescript
WEAPONS.LASER_RIFLE = {
  name: 'Laser Rifle',
  fireRate: 100, // ms between shots
  damage: 3,
  bulletSpeed: 800,
  bulletLifespan: 1500,
  specialEffect: 'pierce_infinite', // pierces all enemies
  acquireMethod: 'purchase',
  cost: 5000 // $SLAY
}
```

**2. Create projectile entity (if needed):**
- Add to `BulletEntity.ts` factory
- Visual: Different sprite/color
- Behavior: Handled by specialEffect flag

**3. Wire into WeaponSystem:**
- System reads config automatically
- No code changes needed if using existing special effects

**Result:** New weapon available in-game by updating one config file.

### Adding New Enemies (Example)

**1. Add to GameConfig.ts:**
```typescript
ENEMY_CONFIG.NECROMANCER = {
  name: 'Necromancer',
  health: 50,
  speed: 35,
  damage: 20,
  behavior: 'summon_minions', // new behavior type
  color: 0x8b008b,
  shardDrop: 2,
  powerUpChance: 0.05
}
```

**2. Implement new behavior in AISystem.ts:**
```typescript
case 'summon_minions':
  if (Math.random() < 0.01) { // 1% chance per frame
    spawnSlime(enemy.x + 50, enemy.y);
  }
  // Also implement basic chase
  moveTowards(enemy, player);
  break;
```

**3. Create entity factory:**
- `NecromancerEntity.ts` with component composition

**Result:** New enemy type with unique mechanics.

### Adding New NFT Types (Example)

**Move Contract:**
```move
public struct VampireCloak has key, store {
    id: UID,
    level: u8,
    lifesteal_percent: u64, // 5% per level
}

public entry fun buy_vampire_cloak(/* ... */) { /* ... */ }
public entry fun upgrade_vampire_cloak(/* ... */) { /* ... */ }
```

**Frontend Query:**
```typescript
const cloaks = await client.getOwnedObjects({
    owner: address,
    filter: { StructType: `${PACKAGE_ID}::game::VampireCloak` }
});

if (cloaks.data.length > 0) {
    const level = cloaks.data[0].content.fields.level;
    const lifesteal = 0.05 * level;
    gameConfig.nftBonuses.lifesteal = lifesteal;
}
```

**Result:** New upgrade path without changing core game systems.

---

## 14. Final Notes

**Development Timeline:** 3-4 weeks for full MVP (all phases 1-4)

**Team Requirements:**
- 1 Move developer (smart contracts)
- 1 Full-stack developer (React + Phaser + integration)
- 1 Game designer (balancing, UX feedback)

**Critical Dependencies:**
- OneChain testnet RPC stability
- Sui SDK compatibility (ensure using latest versions)
- Wallet extension support (Sui Wallet, Suiet, Ethos)

**Risk Mitigation:**
- Keep smart contracts simple (MVP: 5 NFTs, 1 token, forge function)
- Test integration early (Week 1: Deploy contracts, query from frontend)
- Have fallback demo (pre-recorded video if live breaks)
- Prioritize gameplay feel over feature count

**Key Success Factor:** Players should forget they're using blockchain. The game should feel like a polished indie game, with blockchain as an invisible enhancement layer.

---

**End of Game Design Document**  
**Version:** 2.0 (Consolidated)  
**Last Updated:** November 12, 2025  
**Status:** Ready for Implementation
