# Proof O' Slay Development Roadmap

**Last Updated:** November 12, 2025 (Gambling System Added)  
**Current Phase:** Phase 1 - Off-Chain Game Development  
**Status:** Implementation in progress

> **📘 Design Reference:** See `GDD.md` for complete game design, system details, and economy balance. This roadmap tracks implementation tasks only.

---

## 🏗️ Architecture: Component-Based ECS

**Philosophy**: Composition over inheritance, inspired by Godot's node system.

### Structure:
- **Components** (`game/components/`) - Pure data structures (Health, Movement, Weapon, AI, etc.)
- **Systems** (`game/systems/`) - Pure logic that operates on components (InputSystem, MovementSystem, etc.)
- **Entities** (`game/entities/`) - Factory functions that compose entities from components
- **Scenes** (`game/scenes/`) - Orchestrators that create entities and run systems

### Adding New Features:
1. **New Component**: Create in `components/`, define interface + factory
2. **New System**: Create in `systems/`, implement `update()` logic
3. **New Entity**: Create in `entities/`, compose from existing components
4. **Wire in Scene**: Add system to scene, call in update loop

Example: Adding a shield component
```typescript
// 1. Component
export interface ShieldComponent { armor: number; }

// 2. System (optional, if needed)
export class ShieldSystem { ... }

// 3. Compose into entity
sprite.setData('shield', { armor: 50 });

// 4. Use in collision system
const shield = entity.getData('shield');
damage -= shield.armor;
```

---

## ✅ Phase 0: Project Setup (COMPLETED)
- [x] Install Node.js and pnpm on Linux system
- [x] Initialize Move package in `contracts/proof_o_slay/`
- [x] Set up frontend with React + TypeScript + Vite + Phaser
- [x] Install Sui SDK (@mysten/sui, @mysten/dapp-kit)
- [x] Create frontend directory structure (components/, game/, lib/)
- [x] Set up backend scaffolding with Express + TypeScript
- [x] Create environment configuration files (.env.example)
- [x] Document MVP scope and honor system decision

---

## 🎮 Phase 1: Off-Chain Game (Phaser) - EXPANDED SCOPE

### 1.1 Core Game Configuration
- [x] Create Phaser game config (`frontend/src/game/config.ts`)
- [x] Set up game initialization with React bridge
- [x] Update to 1920x1080 (16:9 FHD) resolution
- [x] Implement scalable UI system with responsive positioning
- [x] Add keyboard navigation with focus management
- [x] Add gamepad input support
- [x] **NEW:** Configure infinite world bounds (10000×10000)
- [x] **NEW:** Setup camera following with smooth lerp
- [x] **NEW:** Implement seamless background tiling
- [x] **NEW:** Setup dual-camera system (game world + fixed UI)
- [x] **NEW:** Fix camera jitter with roundPixels and optimized lerp

### 1.2 Character Classes (NEW)
- [x] Create Warrior entity factory (120 HP, 100 speed, Iron Sword)
- [x] Create Mage entity factory (80 HP, 90 speed, Arcane Staff)
- [x] Create Rogue entity factory (100 HP, 120 speed, Twin Daggers)
- [x] Implement class selection UI in MenuScene
- [x] Add ClassComponent with base stat modifiers
- [x] Test class stat differences feel distinct

### 1.3 Weapon System (EXPANDED)
- [x] Create magic bolt projectile entity
- [x] Implement click-to-shoot mechanics
- [x] Add fire rate limiting (500ms cooldown)
- [x] Set projectile lifespan (2 seconds)
- [x] Add projectile collision detection
- [x] **NEW:** Implement Iron Sword (melee arc, pierce 3)
- [x] **NEW:** Implement Arcane Staff (homing orbs)
- [x] **NEW:** Implement Twin Daggers (dual-shot with spread)
- [x] **NEW:** Implement Heavy Crossbow (piercing bolt)
- [x] **NEW:** Implement Flamethrower (continuous cone)
- [x] **NEW:** Implement Celestial Cannon (explosive AoE)
- [x] **NEW:** Add weapon data to GameConfig.ts
- [x] **NEW:** Create WeaponSystem.ts for firing logic

### 1.4 Class Skills (NEW)
- [x] Create SkillSystem.ts
- [x] Implement Warrior Dash (200px, invincible 0.5s, damage trail)
- [x] Implement Mage Arcane Nova (150 dmg, 300px radius, knockback)
- [x] Implement Rogue Phantom Barrier (absorb 100 dmg, 6s duration)
- [x] Add skill cooldown UI (icons above health bar)
- [x] Map Spacebar to skill activation
- [x] Add visual effects for each skill
- [x] **REFACTOR:** Implement proper ECS architecture with SkillManager
- [x] **REFACTOR:** Create individual skill components (BattleDash, ArcaneNova, PhantomBarrier)
- [x] **REFACTOR:** Create individual skill systems for each skill type
- [x] **REFACTOR:** Centralize skill parameters in SKILLS config

### 1.5 Enemy System (EXPANDED)
- [x] Create Slime enemy entity
- [x] Implement simple chase AI (move towards player)
- [x] Add enemy health (30 HP)
- [x] Implement enemy damage on collision (10 damage to player)
- [x] Add enemy death animation/effect
- [x] **NEW:** Create Archer enemy (ranged, kiting AI)
- [x] **NEW:** Create Tank enemy (boss, high HP)
- [x] **NEW:** Add ScalingComponent for time-based stats
- [x] **NEW:** Implement enemy stat scaling (+5% HP/min, +4% dmg/min)
- [x] **NEW:** Test scaling feels natural at 10, 20, 30 minutes

### 1.6 Infinite Spawning System (REPLACES Wave System)
- [x] ~~Create wave spawner~~
- [x] ~~Add wave counter UI~~
- [x] ~~Trigger next wave when all enemies dead~~
- [x] **NEW:** Create SpawnSystem.ts for perpetual spawning
- [x] **NEW:** Spawn enemies off-screen (camera edges + 100px)
- [x] **NEW:** Implement spawn rate scaling (+10% per minute)
- [x] **NEW:** Add enemy type weighting (70% Slime, 20% Archer, 10% Tank)
- [x] **NEW:** Spawn boss Tank every 10 minutes
- [x] **NEW:** Implement enemy culling (destroy if >2000px from camera)
- [x] **NEW:** Cap max enemies at 500 for performance

### 1.7 Power-Up Pickups (NEW)
- [x] Create PowerUpComponent interface
- [x] Implement Speed Boost pickup (8% drop, +50% speed, 15s)
- [x] Implement Rapid Fire pickup (6% drop, -50% cooldowns, 12s)
- [x] Implement Shield pickup (5% drop, absorb 150 dmg, 20s)
- [x] Implement Magnet pickup (7% drop, auto-collect 400px, 20s)
- [x] Implement Double Shards pickup (3% drop, 2x shards, 25s)
- [x] Create PowerUpSystem.ts for buff timers
- [x] Add power-up UI (icons with countdowns)
- [x] Add drop logic to enemy death

### 1.8 Collectibles & Economy (EXPANDED)
- [x] Create Glimmering Shard collectible entity
- [x] Implement loot drop on enemy death (100% drop rate)
- [x] Add shard collection on player overlap
- [x] Create shard counter UI
- [x] Add particle effect on shard pickup
- [x] **NEW:** Implement shard scaling (1 shard early, 5+ shards at 20+ min)
- [x] **NEW:** Add boss shard multiplier (Tanks drop 5x)
- [ ] **NEW:** Test earn rate (target 300-400 shards per 15-min run)

### 1.9 Game Loop & UI (MODIFIED)
- [x] Implement game over condition (HP <= 0)
- [x] Create game over screen with shard count
- [x] Add restart functionality
- [x] Emit game-over event to React with shard data
- [x] **NEW:** Add survival timer display
- [x] **NEW:** Show kill count and time survived on game over
- [ ] **NEW:** Add mini-stats (DPS, damage taken, upgrades active)
- [ ] **NEW:** Test full gameplay loop (15-25 min runs feel right)

### 1.10 Performance & Polish (NEW)
- [x] Implement object pooling for bullets
- [x] Implement object pooling for enemies
- [x] Implement object pooling for effects
- [x] Add screen shake on damage/kills
- [x] Add damage numbers floating above enemies
- [x] Add particle effects on power-up pickup
- [ ] Test 60 FPS with 200+ enemies on screen
- [ ] Profile and optimize collision detection

### 1.11 Gambling UI (NEW)
- [x] Add optional stake checkbox on class selection screen
- [x] Show stake amount selector (50, 100, 200 $SLAY)
- [x] Show survival goal selector (10, 15, 20 minutes)
- [x] Display potential payout ("Risk 100 to win 200")
- [x] Add countdown timer in-game when stake is active
- [x] Display "TARGET: 15:00" reminder during gameplay
- [x] Show victory screen with winnings on successful bet
- [x] Add jackpot ticket display in hub ("🎟️ Tickets: 3")
- [x] Create progressive jackpot UI (multiplier display, cash-out prompt)
- [x] Add "Press C to Cash Out" prompt with current value

### 1.12 Code Quality & Architecture (COMPLETED)
- [x] **REFACTOR:** Remove dead code (old SkillSystem.ts, SkillComponent.ts)
- [x] **CONFIG:** Extract weapon effect constants to WEAPON_EFFECTS_CONFIG
- [x] **CONFIG:** Extract UI layout constants to UI_LAYOUT_CONFIG (depths, offsets, spacing)
- [x] **REFACTOR:** Update all scenes to use centralized config constants
- [x] **AUDIT:** Remove ~60+ hardcoded values across GameSceneECS, TestScene
- [x] **BEST PRACTICE:** Establish SkillManager pattern for future systems

### 1.13 Testing & Validation (NEW)
- [ ] **TEST:** Create comprehensive test suite for all systems
- [ ] **TEST:** Test movement system with various inputs
- [ ] **TEST:** Test health system (damage, invincibility)
- [ ] **TEST:** Test weapon system (all weapon types)
- [ ] **TEST:** Test skill system (all 3 class skills)
- [ ] **TEST:** Test scaling system at 10/20/30 minute intervals
- [ ] **TEST:** Test enemy AI (chase, kite behaviors)
- [ ] **TEST:** Integration test for full gameplay loop
- [ ] **MANUAL:** Playtest 15-25 min runs for balance

---

## 🔗 Phase 2: Smart Contracts (Move) - EXPANDED SCOPE

### 2.1 Token System
- [x] Create `SLAY` token struct with `drop` ability
- [x] Implement module initializer with `create_currency`
- [x] Set up TreasuryCap for minting control
- [x] Create shared Treasury object for collecting payments
- [x] Add token metadata (name, symbol, decimals)

### 2.2 Forge System (Honor Version)
- [x] Create `forge_tokens` entry function
- [x] Add shard amount validation (max 10000)
- [x] Implement token minting logic
- [x] Transfer minted coins to sender
- [x] Add error codes for validation failures

### 2.3 Upgradeable NFTs (NEW)
- [x] **NEW:** Create PowerRing struct with level field (1-5)
- [x] **NEW:** Create VitalityAmulet struct with level field
- [x] **NEW:** Create SwiftBoots struct with level field
- [x] **NEW:** Create MysticLens struct with level field
- [x] **NEW:** Create LuckyPendant struct with level field
- [x] **NEW:** Implement buy_* functions for each NFT (Level 1)
- [x] **NEW:** Implement upgrade_* functions for each NFT
- [x] **NEW:** Add exponential bonus calculation helper
- [x] **NEW:** Implement upgrade cost scaling (base × 2^(level-1))
- [x] **NEW:** Add MAX_LEVEL constant (5)

### 2.4 Weapon NFTs (NEW)
- [x] **NEW:** Create WeaponNFT struct (type, damage, fire_rate, special_effect)
- [x] **NEW:** Implement buy_flamethrower function (1500 SLAY)
- [x] **NEW:** Implement buy_celestial_cannon function (10000 SLAY)
- [x] **NEW:** Add weapon query functions

### 2.5 Query Functions (EXPANDED)
- [ ] ~~Add `armor_bonus` view function~~
- [ ] ~~Add `boots_multiplier` view function~~
- [x] **NEW:** Add power_ring_stats function (returns level, bonus)
- [x] **NEW:** Add vitality_amulet_stats function
- [x] **NEW:** Add swift_boots_stats function
- [x] **NEW:** Add mystic_lens_stats function
- [x] **NEW:** Add lucky_pendant_stats function
- [x] **NEW:** Add weapon_stats function
- [x] **NEW:** Add treasury_balance function

### 2.6 Testing (EXPANDED)
- [x] Test forge_tokens (mint 500 tokens)
- [x] Test buy Power Ring Level 1
- [x] Test upgrade Power Ring L1 → L2 → L3 → L4 → L5
- [x] Test exponential bonus calculation
- [x] Test upgrade cost scaling
- [x] Test max level validation (should fail at L6)
- [x] Test insufficient payment errors
- [x] Test all 5 NFT types buy + upgrade
- [x] Test weapon purchases (Flamethrower, Celestial Cannon)
- [x] Run full integration test suite (17 tests passing)

### 2.7 Gambling System (NEW)
- [x] **NEW:** Create StakeRecord struct (player, amount, target, type, multiplier)
- [x] **NEW:** Create JackpotTicket NFT struct (id, earned_by, issued_date)
- [x] **NEW:** Implement stake_for_run function (time-based betting)
- [x] **NEW:** Implement claim_stake_reward function (with honor system)
- [x] **NEW:** Implement forfeit_stake function (on death before goal)
- [x] **NEW:** Implement start_progressive_jackpot function (requires ticket)
- [x] **NEW:** Implement cash_out_jackpot function (claim winnings)
- [x] **NEW:** Implement award_jackpot_ticket function (milestone rewards)
- [x] **NEW:** Add stake validation (50-500 $SLAY limits)
- [x] **NEW:** Add multiplier calculation for progressive jackpot
- [ ] **NEW:** Test time-based bet (stake 100, survive 15 min, win 200)
- [ ] **NEW:** Test progressive jackpot cash-out at different times
- [ ] **NEW:** Test stake forfeiture on early death
- [ ] **NEW:** Test jackpot ticket earning system

### 2.8 Deployment (MODIFIED)
- [x] Build Move package (`one move build`)
- [x] Run all tests (`one move test` - 17 tests passing)
- [ ] Deploy to OneChain testnet (requires `one` CLI on deployment machine)
- [ ] Save Package ID, TreasuryCap ID, Treasury ID
- [ ] Update frontend `.env` with contract addresses
- [ ] Verify deployment on OneChain explorer
- [ ] **NEW:** Test buy/upgrade flow from frontend
- [ ] **NEW:** Verify NFT level progression works correctly
- [ ] **NEW:** Test gambling system (stake, win, forfeit)

---

## 🌐 Phase 3: React UI (Hub) - EXPANDED SCOPE

### 3.1 Wallet Integration
- [ ] Set up Sui wallet provider in App.tsx
- [ ] Create WalletConnect component
- [ ] Add connect/disconnect functionality
- [ ] Display connected wallet address
- [ ] Handle wallet connection errors

### 3.2 Sui Client Setup
- [ ] Create `lib/suiClient.ts` with client configuration
- [ ] Set up RPC endpoint (testnet.onelabs.cc)
- [ ] Create contract interaction utilities
- [ ] Add type definitions for contract objects

### 3.3 Class Selection Screen (NEW)
- [ ] **NEW:** Create ClassSelection.tsx component
- [ ] **NEW:** Display 3 class cards (Warrior, Mage, Rogue)
- [ ] **NEW:** Show class stats and skill descriptions
- [ ] **NEW:** Highlight selected class
- [ ] **NEW:** Pass selected class to game on start

### 3.4 Balance Display (EXPANDED)
- [ ] Query owned SLAY coin objects
- [ ] Sum coin balances for total display
- [ ] Show pending Shards from game state
- [ ] Auto-refresh balances after transactions
- [ ] Add loading states
- [ ] **NEW:** Display owned NFTs count (e.g., "3/5 NFTs owned")
- [ ] **NEW:** Show total player power score

### 3.5 Consumables Shop (NEW)
- [ ] **NEW:** Create ConsumablesShop.tsx component
- [ ] **NEW:** Display available consumables (Elixir, Extra Life, Lucky Charm, etc.)
- [ ] **NEW:** Show Shard costs and effects
- [ ] **NEW:** Implement "Buy with Shards" (off-chain state)
- [ ] **NEW:** Track owned consumables in React state
- [ ] **NEW:** Add "Use before run" checkboxes
- [ ] **NEW:** Deduct shards on purchase
- [ ] **NEW:** Pass active consumables to Phaser on game start

### 3.6 NFT Forge & Upgrade System (EXPANDED)
- [ ] Create ForgeUI.tsx for Shards → $SLAY conversion
- [ ] Show pending shards and forge button
- [ ] Implement forge transaction (PTB)
- [ ] **NEW:** Create NFTUpgradePanel.tsx component
- [ ] **NEW:** Query all 5 NFT types (PowerRing, VitalityAmulet, etc.)
- [ ] **NEW:** Display owned NFTs with current level and stats
- [ ] **NEW:** Show upgrade cost for next level
- [ ] **NEW:** Implement "Buy NFT" button (if not owned)
- [ ] **NEW:** Implement "Upgrade NFT" button (if owned, < L5)
- [ ] **NEW:** Disable upgrade button at max level (L5)
- [ ] **NEW:** Show exponential bonus preview ("L3: +72% → L4: +107%")
- [ ] **NEW:** Handle upgrade transactions with mutable NFT objects

### 3.7 Weapon Shop (NEW)
- [ ] **NEW:** Create WeaponShop.tsx component
- [ ] **NEW:** Display unlockable weapons (Flamethrower, Celestial Cannon)
- [ ] **NEW:** Show weapon stats and special effects
- [ ] **NEW:** Query owned weapon NFTs
- [ ] **NEW:** Implement purchase transactions
- [ ] **NEW:** Show "Owned" badge on purchased weapons

### 3.8 Leaderboard (OPTIONAL)
- [ ] **NEW:** Create Leaderboard.tsx component (optional)
- [ ] **NEW:** Display top 10 survival times
- [ ] **NEW:** Highlight current player's rank
- [ ] **NEW:** Store leaderboard data (off-chain for MVP)

### 3.9 Gambling UI Components (NEW)
- [ ] **NEW:** Create StakingPanel.tsx component
- [ ] **NEW:** Display stake options (50, 100, 200 $SLAY)
- [ ] **NEW:** Display goal options (10, 15, 20 minutes)
- [ ] **NEW:** Show potential payout calculations
- [ ] **NEW:** Implement stake_for_run transaction (PTB)
- [ ] **NEW:** Query active stake records for player
- [ ] **NEW:** Display jackpot tickets owned ("🎟️ Tickets: 3")
- [ ] **NEW:** Create ProgressiveJackpotPanel.tsx component
- [ ] **NEW:** Show jackpot ticket requirement
- [ ] **NEW:** Implement start_progressive_jackpot transaction
- [ ] **NEW:** Add "Ticket Required" tooltip/warning
- [ ] **NEW:** Show jackpot history (recent wins/losses)

---

## 🔌 Phase 4: Integration - EXPANDED SCOPE

### 4.1 Game → React Communication (EXPANDED)
- [ ] Implement callback-based bridge
- [ ] Pass `onGameOver(shards, time, kills)` to Phaser config
- [ ] Update React state with earned shards
- [ ] **NEW:** Update React state with survival time
- [ ] **NEW:** Update React state with kill count
- [ ] Show "Forge Shards" button when game ends
- [ ] Clear pending shards after forge
- [ ] **NEW:** Update leaderboard with new score (if applicable)

### 4.2 React → Game Communication (EXPANDED)
- [ ] Pass selected class to Phaser on game start
- [ ] **NEW:** Query all owned NFTs before game start
- [ ] **NEW:** Calculate total stat bonuses from NFTs
- [ ] **NEW:** Pass NFT bonuses to Phaser config
- [ ] **NEW:** Query owned weapon NFTs
- [ ] **NEW:** Pass unlocked weapons to Phaser
- [ ] **NEW:** Pass active consumables (buffs) to Phaser
- [ ] Apply class base stats on player creation
- [ ] Apply NFT bonuses on player creation
- [ ] Apply consumable buffs on player creation
- [ ] **NEW:** Test full stat calculation (class + NFTs + consumables)

### 4.3 Forge Transaction (UNCHANGED)
- [ ] Create PTB for `forge_tokens` function
- [ ] Pass TreasuryCap object ID
- [ ] Pass shard amount as pure argument
- [ ] Sign and execute transaction
- [ ] Wait for transaction confirmation
- [ ] Update balance display

### 4.4 Purchase Transactions (EXPANDED)
- [ ] Implement `buyPowerRing` function with PTB
- [ ] Implement `buyVitalityAmulet` function with PTB
- [ ] Implement `buySwiftBoots` function with PTB
- [ ] Implement `buyMysticLens` function with PTB
- [ ] Implement `buyLuckyPendant` function with PTB
- [ ] Query and merge SLAY coins
- [ ] Split exact payment amount for each NFT
- [ ] Handle transaction success/failure
- [ ] **NEW:** Implement upgrade functions with mutable NFT references
- [ ] **NEW:** Test upgrade transaction (pass NFT object ID correctly)
- [ ] **NEW:** Implement weapon purchase functions (Flamethrower, Cannon)
- [ ] Invalidate NFT cache after purchase/upgrade

### 4.5 NFT Query & Stats Calculation (NEW)
- [ ] **NEW:** Create getNFTStats utility function
- [ ] **NEW:** Query PowerRing objects and extract level/bonus
- [ ] **NEW:** Query VitalityAmulet objects and extract level/bonus
- [ ] **NEW:** Query SwiftBoots objects and extract level/bonus
- [ ] **NEW:** Query MysticLens objects and extract level/bonus
- [ ] **NEW:** Query LuckyPendant objects and extract level/bonus
- [ ] **NEW:** Calculate total exponential bonuses
- [ ] **NEW:** Pass calculated stats to game config
- [ ] **NEW:** Test stat calculation with various NFT combinations

### 4.6 Error Handling (EXPANDED)
- [ ] Handle wallet not connected
- [ ] Handle user rejection
- [ ] Handle insufficient balance
- [ ] Handle network errors
- [ ] Show user-friendly error messages
- [ ] Add retry functionality
- [ ] **NEW:** Handle "NFT not found" errors
- [ ] **NEW:** Handle "Max level reached" errors
- [ ] **NEW:** Handle stale object version errors

### 4.7 Gambling Integration (NEW)
- [ ] **NEW:** Pass stake info to Phaser on game start (if active)
- [ ] **NEW:** Show stake countdown timer in-game UI
- [ ] **NEW:** Emit onStakeWon callback when goal reached
- [ ] **NEW:** Emit onStakeLost callback on death before goal
- [ ] **NEW:** Implement claim_stake_reward transaction
- [ ] **NEW:** Implement forfeit_stake transaction
- [ ] **NEW:** Handle progressive jackpot mode flag
- [ ] **NEW:** Enable "C" key cash-out in progressive mode
- [ ] **NEW:** Show live multiplier display (1.1x → 2.0x → 3.0x)
- [ ] **NEW:** Implement cash_out_jackpot transaction
- [ ] **NEW:** Award jackpot tickets on milestone achievements
- [ ] **NEW:** Test full stake workflow (bet → play → win/lose → claim)
- [ ] **NEW:** Test progressive jackpot (bet → play → cash out → claim)
- [ ] **NEW:** Verify ticket earning and consumption

---

## 🎨 Phase 5: Polish & Testing

### 5.1 Visual Feedback
- [ ] Add health bar animations
- [ ] Improve damage flash effect
- [ ] Add enemy death particles
- [ ] Create shard glow/bounce animation
- [ ] Add UI transitions and loading states

### 5.2 Audio (Optional)
- [ ] Add shooting sound effect
- [ ] Add hit/damage sound
- [ ] Add enemy death sound
- [ ] Add shard pickup sound
- [ ] Add background music

### 5.3 Full Integration Testing
- [ ] Test complete loop: connect → play → forge → buy → play again
- [ ] Verify upgrades persist and apply correctly
- [ ] Test with multiple runs and wave progression
- [ ] Verify balance calculations are correct
- [ ] Test error scenarios (insufficient funds, etc.)

### 5.4 Demo Preparation
- [ ] Create demo wallet with test tokens
- [ ] Practice 3-minute demo flow
- [ ] Prepare judge acknowledgment about honor system
- [ ] Document technical architecture
- [ ] Create video/screenshots for submission

---

## 🚀 Phase 6: Deployment & Submission

### 6.1 Production Build
- [ ] Build frontend for production (`pnpm build`)
- [ ] Test production build locally
- [ ] Optimize bundle size
- [ ] Set up hosting (Vercel/Netlify)

### 6.2 Documentation
- [ ] Update README with live demo link
- [ ] Add setup instructions for judges
- [ ] Document contract addresses
- [ ] Create architecture diagram
- [ ] Write submission description

### 6.3 Final Testing
- [ ] Test on different browsers
- [ ] Test on mobile (if time permits)
- [ ] Verify all transactions work on testnet
- [ ] Check wallet compatibility
- [ ] Final playthrough for bugs

### 6.4 Submission
- [ ] Deploy to hosting platform
- [ ] Submit contract addresses
- [ ] Submit demo URL
- [ ] Upload video/presentation
- [ ] Submit before deadline

---

## 📈 Post-Hackathon Enhancements

### Future Features (Not MVP)
- [ ] Backend signature verification system
- [ ] Additional enemy types (Archer, Tank, Mage)
- [ ] More upgrades (Triple Shot, Shield, Dash)
- [ ] Procedural room generation
- [ ] Boss fights every 10 waves
- [ ] Leaderboard system
- [ ] Cosmetic NFTs
- [ ] Guild/clan system
- [ ] PvP arena mode

---

## 📊 Progress Tracking

**Current Phase**: Phase 1 - Off-Chain Game Development  
**Next Milestone**: Complete playable Phaser game with all core mechanics  
**Estimated Completion**: Phase 1 should take ~1-2 days of focused work

**Key Dependencies**:
- Phase 2 requires Phase 1 completion (need to know what data to pass)
- Phase 3 requires Phase 2 deployment (need contract addresses)
- Phase 4 requires both Phase 1 and Phase 3 (integration layer)
- Phase 5 can be done in parallel with Phase 4

**Critical Path**: Phase 1 → Phase 2 → Phase 4 (these are blocking)
