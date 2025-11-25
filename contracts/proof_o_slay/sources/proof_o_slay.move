/// Proof O' Slay: A play-to-earn dungeon crawler on OneChain
/// Players earn Glimmering Shards in-game and forge them into SLAY tokens
/// SLAY tokens can be used to purchase and upgrade 5 permanent NFT upgrades
module proof_o_slay::proof_o_slay {
    use one::coin::{Self, Coin, TreasuryCap};
    use one::balance::{Self, Balance};
    use one::tx_context::{Self, TxContext};
    use one::transfer;
    use one::object::{Self, UID};
    use std::option;

    // ======= Error Codes =======
    
    /// Shard amount exceeds maximum allowed (500)
    const EInvalidShardAmount: u64 = 0;
    
    /// Insufficient payment for upgrade
    const EInsufficientPayment: u64 = 1;
    
    /// NFT already at maximum level
    const EMaxLevelReached: u64 = 2;
    
    /// Invalid stake amount
    const EInvalidStakeAmount: u64 = 3;
    
    /// Invalid target minutes
    const EInvalidTargetMinutes: u64 = 4;
    
    /// Stake record not active
    const EStakeNotActive: u64 = 5;
    
    /// Not authorized
    const ENotAuthorized: u64 = 6;
    
    /// Target not reached
    const ETargetNotReached: u64 = 7;

    // ======= Constants =======
    
    /// Maximum shards that can be forged at once (prevents abuse)
    const MAX_SHARDS: u64 = 10000;
    
    /// Maximum level for all NFTs
    const MAX_LEVEL: u64 = 5;
    
    // NFT Base Costs (Level 1)
    const POWER_RING_BASE_COST: u64 = 300;
    const VITALITY_AMULET_BASE_COST: u64 = 400;
    const SWIFT_BOOTS_BASE_COST: u64 = 500;
    const MYSTIC_LENS_BASE_COST: u64 = 600;
    const LUCKY_PENDANT_BASE_COST: u64 = 800;
    
    // Weapon NFT Costs
    const FLAMETHROWER_COST: u64 = 1500;
    const CELESTIAL_CANNON_COST: u64 = 10000;
    
    // Weapon Type Constants
    const WEAPON_TYPE_FLAMETHROWER: u8 = 0;
    const WEAPON_TYPE_CELESTIAL_CANNON: u8 = 1;
    
    // Gambling System Constants
    const MIN_STAKE: u64 = 50;
    const MAX_STAKE: u64 = 500;
    
    // Bet Type Constants
    const BET_TYPE_TIME_BASED: u8 = 0;
    const BET_TYPE_PROGRESSIVE_JACKPOT: u8 = 1;
    
    // Valid target minutes
    const TARGET_10_MIN: u8 = 10;
    const TARGET_15_MIN: u8 = 15;
    const TARGET_20_MIN: u8 = 20;

    // ======= Structs =======
    
    /// One-time witness for creating the SLAY currency
    public struct PROOF_O_SLAY has drop {}
    
    /// Shared treasury that collects payments from upgrades
    public struct Treasury has key {
        id: UID,
        balance: Balance<PROOF_O_SLAY>
    }
    
    /// Power Ring NFT - provides +20% damage per level (exponential)
    public struct PowerRing has key, store {
        id: UID,
        level: u64
    }
    
    /// Vitality Amulet NFT - provides +25 HP per level (flat)
    public struct VitalityAmulet has key, store {
        id: UID,
        level: u64
    }
    
    /// Swift Boots NFT - provides +15% speed per level (exponential)
    public struct SwiftBoots has key, store {
        id: UID,
        level: u64
    }
    
    /// Mystic Lens NFT - provides +20% range per level (exponential)
    public struct MysticLens has key, store {
        id: UID,
        level: u64
    }
    
    /// Lucky Pendant NFT - provides +10% drop rate per level (exponential)
    public struct LuckyPendant has key, store {
        id: UID,
        level: u64
    }
    
    /// Weapon NFT - unlockable weapons with special effects
    /// Type 0 = Flamethrower, Type 1 = Celestial Cannon
    public struct WeaponNFT has key, store {
        id: UID,
        weapon_type: u8,
        damage: u64,
        fire_rate: u64,
        special_effect: vector<u8>
    }
    
    /// Stake Record - tracks active gambling bets
    public struct StakeRecord has key, store {
        id: UID,
        player: address,
        stake_amount: u64,
        bet_type: u8, // 0 = Time-based, 1 = Progressive Jackpot
        target_minutes: u8, // For time-based bets
        multiplier: u64, // Fixed for time-based (stored as basis points, e.g., 150 = 1.5x)
        is_active: bool
    }
    
    /// Jackpot Ticket - earned through achievements, enables progressive jackpot
    public struct JackpotTicket has key, store {
        id: UID,
        earned_by: address,
        issued_date: u64
    }

    // ======= Module Initializer =======
    
    /// Initialize the SLAY token and create the Treasury
    /// Called once when the module is published
    fun init(witness: PROOF_O_SLAY, ctx: &mut TxContext) {
        // Create the SLAY currency with metadata
        let (treasury_cap, metadata) = coin::create_currency(
            witness,
            9, // decimals
            b"SLAY", // symbol
            b"Proof O' Slay Token", // name
            b"Earned by forging Glimmering Shards from dungeon runs", // description
            option::none(), // icon URL
            ctx
        );
        
        // Freeze the metadata (immutable)
        transfer::public_freeze_object(metadata);
        
        // Transfer TreasuryCap to deployer for minting control
        transfer::public_transfer(treasury_cap, tx_context::sender(ctx));
        
        // Create shared Treasury for collecting upgrade payments
        let treasury = Treasury {
            id: object::new(ctx),
            balance: balance::zero()
        };
        transfer::share_object(treasury);
    }

    // ======= Helper Functions =======
    
    /// Calculate upgrade cost: base_cost × 2^(level-1)
    fun calculate_upgrade_cost(base_cost: u64, current_level: u64): u64 {
        let multiplier = pow(2, current_level);
        base_cost * multiplier
    }
    
    /// Power function (x^y) for cost calculation
    fun pow(base: u64, exp: u64): u64 {
        if (exp == 0) {
            1
        } else {
            let mut result = 1;
            let mut i = 0;
            while (i < exp) {
                result = result * base;
                i = i + 1;
            };
            result
        }
    }
    
    /// Calculate exponential bonus: (1 + base_bonus)^level
    /// Returns bonus as percentage (e.g., 120 = 1.2x = +20%)
    /// For Power Ring L1: (1.2)^1 = 1.2 = 120 (stored as integer percent)
    public fun calculate_exponential_bonus(base_percent: u64, level: u64): u64 {
        // Base percent is like 120 for +20% (1.2x multiplier)
        // We need to calculate (base/100)^level and return as percentage
        // Simplified integer math: multiply repeatedly and divide
        let mut result = 100; // Start at 100% (1.0x)
        let mut i = 0;
        while (i < level) {
            result = (result * base_percent) / 100;
            i = i + 1;
        };
        result
    }

    // ======= Forge System (Honor System) =======
    
    /// Forge Glimmering Shards into SLAY tokens
    /// @param treasury_cap: Minting capability (owned by deployer)
    /// @param shards: Number of shards to forge (1:1 ratio)
    /// @param ctx: Transaction context
    /// 
    /// Honor system: Frontend sends shard count, no backend verification
    /// Production version would verify signature from backend
    public entry fun forge_tokens(
        treasury_cap: &mut TreasuryCap<PROOF_O_SLAY>,
        shards: u64,
        ctx: &mut TxContext
    ) {
        // Validate shard amount
        assert!(shards > 0 && shards <= MAX_SHARDS, EInvalidShardAmount);
        
        // Mint SLAY tokens (1 shard = 1 SLAY)
        let minted = coin::mint(treasury_cap, shards, ctx);
        
        // Transfer tokens to sender
        transfer::public_transfer(minted, tx_context::sender(ctx));
    }

    // ======= Power Ring (Damage +20% per level, exponential) =======
    
    /// Purchase Power Ring Level 1 (300 SLAY)
    public entry fun buy_power_ring(
        treasury: &mut Treasury,
        mut payment: Coin<PROOF_O_SLAY>,
        ctx: &mut TxContext
    ) {
        assert!(coin::value(&payment) >= POWER_RING_BASE_COST, EInsufficientPayment);
        
        let paid = if (coin::value(&payment) > POWER_RING_BASE_COST) {
            let paid_coin = coin::split(&mut payment, POWER_RING_BASE_COST, ctx);
            transfer::public_transfer(payment, tx_context::sender(ctx));
            paid_coin
        } else {
            payment
        };
        
        balance::join(&mut treasury.balance, coin::into_balance(paid));
        
        let ring = PowerRing {
            id: object::new(ctx),
            level: 1
        };
        transfer::public_transfer(ring, tx_context::sender(ctx));
    }
    
    /// Upgrade Power Ring to next level (max 5)
    public entry fun upgrade_power_ring(
        ring: &mut PowerRing,
        treasury: &mut Treasury,
        mut payment: Coin<PROOF_O_SLAY>,
        ctx: &mut TxContext
    ) {
        assert!(ring.level < MAX_LEVEL, EMaxLevelReached);
        
        let cost = calculate_upgrade_cost(POWER_RING_BASE_COST, ring.level);
        assert!(coin::value(&payment) >= cost, EInsufficientPayment);
        
        let paid = if (coin::value(&payment) > cost) {
            let paid_coin = coin::split(&mut payment, cost, ctx);
            transfer::public_transfer(payment, tx_context::sender(ctx));
            paid_coin
        } else {
            payment
        };
        
        balance::join(&mut treasury.balance, coin::into_balance(paid));
        ring.level = ring.level + 1;
    }

    // ======= Vitality Amulet (HP +25 per level, flat) =======
    
    /// Purchase Vitality Amulet Level 1 (400 SLAY)
    public entry fun buy_vitality_amulet(
        treasury: &mut Treasury,
        mut payment: Coin<PROOF_O_SLAY>,
        ctx: &mut TxContext
    ) {
        assert!(coin::value(&payment) >= VITALITY_AMULET_BASE_COST, EInsufficientPayment);
        
        let paid = if (coin::value(&payment) > VITALITY_AMULET_BASE_COST) {
            let paid_coin = coin::split(&mut payment, VITALITY_AMULET_BASE_COST, ctx);
            transfer::public_transfer(payment, tx_context::sender(ctx));
            paid_coin
        } else {
            payment
        };
        
        balance::join(&mut treasury.balance, coin::into_balance(paid));
        
        let amulet = VitalityAmulet {
            id: object::new(ctx),
            level: 1
        };
        transfer::public_transfer(amulet, tx_context::sender(ctx));
    }
    
    /// Upgrade Vitality Amulet to next level (max 5)
    public entry fun upgrade_vitality_amulet(
        amulet: &mut VitalityAmulet,
        treasury: &mut Treasury,
        mut payment: Coin<PROOF_O_SLAY>,
        ctx: &mut TxContext
    ) {
        assert!(amulet.level < MAX_LEVEL, EMaxLevelReached);
        
        let cost = calculate_upgrade_cost(VITALITY_AMULET_BASE_COST, amulet.level);
        assert!(coin::value(&payment) >= cost, EInsufficientPayment);
        
        let paid = if (coin::value(&payment) > cost) {
            let paid_coin = coin::split(&mut payment, cost, ctx);
            transfer::public_transfer(payment, tx_context::sender(ctx));
            paid_coin
        } else {
            payment
        };
        
        balance::join(&mut treasury.balance, coin::into_balance(paid));
        amulet.level = amulet.level + 1;
    }

    // ======= Swift Boots (Speed +15% per level, exponential) =======
    
    /// Purchase Swift Boots Level 1 (500 SLAY)
    public entry fun buy_swift_boots(
        treasury: &mut Treasury,
        mut payment: Coin<PROOF_O_SLAY>,
        ctx: &mut TxContext
    ) {
        assert!(coin::value(&payment) >= SWIFT_BOOTS_BASE_COST, EInsufficientPayment);
        
        let paid = if (coin::value(&payment) > SWIFT_BOOTS_BASE_COST) {
            let paid_coin = coin::split(&mut payment, SWIFT_BOOTS_BASE_COST, ctx);
            transfer::public_transfer(payment, tx_context::sender(ctx));
            paid_coin
        } else {
            payment
        };
        
        balance::join(&mut treasury.balance, coin::into_balance(paid));
        
        let boots = SwiftBoots {
            id: object::new(ctx),
            level: 1
        };
        transfer::public_transfer(boots, tx_context::sender(ctx));
    }
    
    /// Upgrade Swift Boots to next level (max 5)
    public entry fun upgrade_swift_boots(
        boots: &mut SwiftBoots,
        treasury: &mut Treasury,
        mut payment: Coin<PROOF_O_SLAY>,
        ctx: &mut TxContext
    ) {
        assert!(boots.level < MAX_LEVEL, EMaxLevelReached);
        
        let cost = calculate_upgrade_cost(SWIFT_BOOTS_BASE_COST, boots.level);
        assert!(coin::value(&payment) >= cost, EInsufficientPayment);
        
        let paid = if (coin::value(&payment) > cost) {
            let paid_coin = coin::split(&mut payment, cost, ctx);
            transfer::public_transfer(payment, tx_context::sender(ctx));
            paid_coin
        } else {
            payment
        };
        
        balance::join(&mut treasury.balance, coin::into_balance(paid));
        boots.level = boots.level + 1;
    }

    // ======= Mystic Lens (Range +20% per level, exponential) =======
    
    /// Purchase Mystic Lens Level 1 (600 SLAY)
    public entry fun buy_mystic_lens(
        treasury: &mut Treasury,
        mut payment: Coin<PROOF_O_SLAY>,
        ctx: &mut TxContext
    ) {
        assert!(coin::value(&payment) >= MYSTIC_LENS_BASE_COST, EInsufficientPayment);
        
        let paid = if (coin::value(&payment) > MYSTIC_LENS_BASE_COST) {
            let paid_coin = coin::split(&mut payment, MYSTIC_LENS_BASE_COST, ctx);
            transfer::public_transfer(payment, tx_context::sender(ctx));
            paid_coin
        } else {
            payment
        };
        
        balance::join(&mut treasury.balance, coin::into_balance(paid));
        
        let lens = MysticLens {
            id: object::new(ctx),
            level: 1
        };
        transfer::public_transfer(lens, tx_context::sender(ctx));
    }
    
    /// Upgrade Mystic Lens to next level (max 5)
    public entry fun upgrade_mystic_lens(
        lens: &mut MysticLens,
        treasury: &mut Treasury,
        mut payment: Coin<PROOF_O_SLAY>,
        ctx: &mut TxContext
    ) {
        assert!(lens.level < MAX_LEVEL, EMaxLevelReached);
        
        let cost = calculate_upgrade_cost(MYSTIC_LENS_BASE_COST, lens.level);
        assert!(coin::value(&payment) >= cost, EInsufficientPayment);
        
        let paid = if (coin::value(&payment) > cost) {
            let paid_coin = coin::split(&mut payment, cost, ctx);
            transfer::public_transfer(payment, tx_context::sender(ctx));
            paid_coin
        } else {
            payment
        };
        
        balance::join(&mut treasury.balance, coin::into_balance(paid));
        lens.level = lens.level + 1;
    }

    // ======= Lucky Pendant (Drop Rate +10% per level, exponential) =======
    
    /// Purchase Lucky Pendant Level 1 (800 SLAY)
    public entry fun buy_lucky_pendant(
        treasury: &mut Treasury,
        mut payment: Coin<PROOF_O_SLAY>,
        ctx: &mut TxContext
    ) {
        assert!(coin::value(&payment) >= LUCKY_PENDANT_BASE_COST, EInsufficientPayment);
        
        let paid = if (coin::value(&payment) > LUCKY_PENDANT_BASE_COST) {
            let paid_coin = coin::split(&mut payment, LUCKY_PENDANT_BASE_COST, ctx);
            transfer::public_transfer(payment, tx_context::sender(ctx));
            paid_coin
        } else {
            payment
        };
        
        balance::join(&mut treasury.balance, coin::into_balance(paid));
        
        let pendant = LuckyPendant {
            id: object::new(ctx),
            level: 1
        };
        transfer::public_transfer(pendant, tx_context::sender(ctx));
    }
    
    /// Upgrade Lucky Pendant to next level (max 5)
    public entry fun upgrade_lucky_pendant(
        pendant: &mut LuckyPendant,
        treasury: &mut Treasury,
        mut payment: Coin<PROOF_O_SLAY>,
        ctx: &mut TxContext
    ) {
        assert!(pendant.level < MAX_LEVEL, EMaxLevelReached);
        
        let cost = calculate_upgrade_cost(LUCKY_PENDANT_BASE_COST, pendant.level);
        assert!(coin::value(&payment) >= cost, EInsufficientPayment);
        
        let paid = if (coin::value(&payment) > cost) {
            let paid_coin = coin::split(&mut payment, cost, ctx);
            transfer::public_transfer(payment, tx_context::sender(ctx));
            paid_coin
        } else {
            payment
        };
        
        balance::join(&mut treasury.balance, coin::into_balance(paid));
        pendant.level = pendant.level + 1;
    }
    
    // ======= Weapon NFT Functions =======
    
    /// Buy Flamethrower weapon (1500 SLAY)
    /// Stats: 15 damage/tick, 100ms fire rate, continuous cone
    public entry fun buy_flamethrower(
        treasury: &mut Treasury,
        mut payment: Coin<PROOF_O_SLAY>,
        ctx: &mut TxContext
    ) {
        let cost = FLAMETHROWER_COST;
        assert!(coin::value(&payment) >= cost, EInsufficientPayment);
        
        let paid = if (coin::value(&payment) > cost) {
            let paid_coin = coin::split(&mut payment, cost, ctx);
            transfer::public_transfer(payment, tx_context::sender(ctx));
            paid_coin
        } else {
            payment
        };
        
        balance::join(&mut treasury.balance, coin::into_balance(paid));
        
        let weapon = WeaponNFT {
            id: object::new(ctx),
            weapon_type: WEAPON_TYPE_FLAMETHROWER,
            damage: 15,
            fire_rate: 100,
            special_effect: b"continuous_cone"
        };
        
        transfer::public_transfer(weapon, tx_context::sender(ctx));
    }
    
    /// Buy Celestial Cannon weapon (10000 SLAY)
    /// Stats: 500 damage, 3000ms fire rate, explosive AoE (300px radius)
    public entry fun buy_celestial_cannon(
        treasury: &mut Treasury,
        mut payment: Coin<PROOF_O_SLAY>,
        ctx: &mut TxContext
    ) {
        let cost = CELESTIAL_CANNON_COST;
        assert!(coin::value(&payment) >= cost, EInsufficientPayment);
        
        let paid = if (coin::value(&payment) > cost) {
            let paid_coin = coin::split(&mut payment, cost, ctx);
            transfer::public_transfer(payment, tx_context::sender(ctx));
            paid_coin
        } else {
            payment
        };
        
        balance::join(&mut treasury.balance, coin::into_balance(paid));
        
        let weapon = WeaponNFT {
            id: object::new(ctx),
            weapon_type: WEAPON_TYPE_CELESTIAL_CANNON,
            damage: 500,
            fire_rate: 3000,
            special_effect: b"explosive_aoe_300"
        };
        
        transfer::public_transfer(weapon, tx_context::sender(ctx));
    }
    
    // ======= Gambling System =======
    
    /// Stake tokens for a time-based bet (honor system)
    /// Valid targets: 10, 15, or 20 minutes
    /// Multipliers: 10min=1.5x, 15min=2.0x, 20min=3.0x
    public entry fun stake_for_run(
        treasury: &mut Treasury,
        payment: Coin<PROOF_O_SLAY>,
        target_minutes: u8,
        ctx: &mut TxContext
    ) {
        let stake_amount = coin::value(&payment);
        
        // Validate stake amount (50-500 SLAY)
        assert!(stake_amount >= MIN_STAKE && stake_amount <= MAX_STAKE, EInvalidStakeAmount);
        
        // Validate target minutes
        assert!(
            target_minutes == TARGET_10_MIN || 
            target_minutes == TARGET_15_MIN || 
            target_minutes == TARGET_20_MIN,
            EInvalidTargetMinutes
        );
        
        // Determine multiplier (stored as basis points: 150 = 1.5x)
        let multiplier = if (target_minutes == TARGET_10_MIN) {
            150 // 1.5x
        } else if (target_minutes == TARGET_15_MIN) {
            200 // 2.0x
        } else {
            300 // 3.0x
        };
        
        // Deposit stake into treasury (will mint back on win)
        balance::join(&mut treasury.balance, coin::into_balance(payment));
        
        // Create stake record
        let stake_record = StakeRecord {
            id: object::new(ctx),
            player: tx_context::sender(ctx),
            stake_amount,
            bet_type: BET_TYPE_TIME_BASED,
            target_minutes,
            multiplier,
            is_active: true
        };
        
        transfer::public_transfer(stake_record, tx_context::sender(ctx));
    }
    
    /// Claim reward for successful time-based bet (honor system)
    /// Player must have survived >= target_minutes
    public entry fun claim_stake_reward(
        stake_record: &mut StakeRecord,
        survival_minutes: u64,
        treasury_cap: &mut TreasuryCap<PROOF_O_SLAY>,
        ctx: &mut TxContext
    ) {
        // Verify ownership
        assert!(stake_record.player == tx_context::sender(ctx), ENotAuthorized);
        
        // Verify stake is active
        assert!(stake_record.is_active, EStakeNotActive);
        
        // Verify target reached
        assert!(survival_minutes >= (stake_record.target_minutes as u64), ETargetNotReached);
        
        // Calculate payout: stake_amount * multiplier / 100
        let payout = (stake_record.stake_amount * stake_record.multiplier) / 100;
        
        // Mint reward tokens
        let reward = coin::mint(treasury_cap, payout, ctx);
        
        // Mark stake as inactive
        stake_record.is_active = false;
        
        // Transfer reward to player
        transfer::public_transfer(reward, tx_context::sender(ctx));
    }
    
    /// Forfeit stake on death before target (honor system)
    /// Destroys the stake record, tokens already burned
    public entry fun forfeit_stake(
        stake_record: StakeRecord,
        ctx: &mut TxContext
    ) {
        // Verify ownership
        assert!(stake_record.player == tx_context::sender(ctx), ENotAuthorized);
        
        // Destroy the record
        let StakeRecord { id, player: _, stake_amount: _, bet_type: _, target_minutes: _, multiplier: _, is_active: _ } = stake_record;
        object::delete(id);
    }
    
    /// Start progressive jackpot (requires ticket + stake)
    /// Multiplier starts at 1.1x and increases 0.1x per minute
    public entry fun start_progressive_jackpot(
        treasury: &mut Treasury,
        payment: Coin<PROOF_O_SLAY>,
        ticket: JackpotTicket,
        ctx: &mut TxContext
    ) {
        let stake_amount = coin::value(&payment);
        
        // Validate stake amount
        assert!(stake_amount >= MIN_STAKE && stake_amount <= MAX_STAKE, EInvalidStakeAmount);
        
        // Burn the ticket
        let JackpotTicket { id, earned_by: _, issued_date: _ } = ticket;
        object::delete(id);
        
        // Deposit stake into treasury
        balance::join(&mut treasury.balance, coin::into_balance(payment));
        
        // Create stake record with initial 1.1x multiplier (110 basis points)
        let stake_record = StakeRecord {
            id: object::new(ctx),
            player: tx_context::sender(ctx),
            stake_amount,
            bet_type: BET_TYPE_PROGRESSIVE_JACKPOT,
            target_minutes: 0, // Not used for progressive
            multiplier: 110, // Start at 1.1x
            is_active: true
        };
        
        transfer::public_transfer(stake_record, tx_context::sender(ctx));
    }
    
    /// Cash out progressive jackpot at current multiplier
    /// Multiplier = 1.1x + (0.1x * minutes_survived)
    public entry fun cash_out_jackpot(
        stake_record: &mut StakeRecord,
        survival_minutes: u64,
        treasury_cap: &mut TreasuryCap<PROOF_O_SLAY>,
        ctx: &mut TxContext
    ) {
        // Verify ownership
        assert!(stake_record.player == tx_context::sender(ctx), ENotAuthorized);
        
        // Verify stake is active
        assert!(stake_record.is_active, EStakeNotActive);
        
        // Verify it's a progressive jackpot
        assert!(stake_record.bet_type == BET_TYPE_PROGRESSIVE_JACKPOT, ENotAuthorized);
        
        // Calculate dynamic multiplier: 110 + (10 * minutes) = basis points
        // Example: 5 min = 110 + 50 = 160 (1.6x)
        let dynamic_multiplier = 110 + (10 * survival_minutes);
        
        // Calculate payout
        let payout = (stake_record.stake_amount * dynamic_multiplier) / 100;
        
        // Mint reward tokens
        let reward = coin::mint(treasury_cap, payout, ctx);
        
        // Mark stake as inactive
        stake_record.is_active = false;
        
        // Transfer reward to player
        transfer::public_transfer(reward, tx_context::sender(ctx));
    }
    
    /// Award jackpot ticket to player (called by authorized address)
    /// In MVP, frontend can call this after milestones (honor system)
    public entry fun award_jackpot_ticket(
        recipient: address,
        ctx: &mut TxContext
    ) {
        let ticket = JackpotTicket {
            id: object::new(ctx),
            earned_by: recipient,
            issued_date: 0 // Can use timestamp in production
        };
        
        transfer::public_transfer(ticket, recipient);
    }

    // ======= Query Functions =======
    
    /// Get Power Ring stats (level and damage multiplier as percentage)
    /// Returns (level, multiplier) e.g., (3, 172) = Level 3, 172% damage (1.72x)
    public fun power_ring_stats(ring: &PowerRing): (u64, u64) {
        let multiplier = calculate_exponential_bonus(120, ring.level); // 120% = 1.2x per level
        (ring.level, multiplier)
    }
    
    /// Get Vitality Amulet stats (level and HP bonus)
    /// Returns (level, hp_bonus) e.g., (2, 50) = Level 2, +50 HP
    public fun vitality_amulet_stats(amulet: &VitalityAmulet): (u64, u64) {
        let hp_bonus = amulet.level * 25; // Flat +25 HP per level
        (amulet.level, hp_bonus)
    }
    
    /// Get Swift Boots stats (level and speed multiplier as percentage)
    /// Returns (level, multiplier) e.g., (2, 132) = Level 2, 132% speed (1.32x)
    public fun swift_boots_stats(boots: &SwiftBoots): (u64, u64) {
        let multiplier = calculate_exponential_bonus(115, boots.level); // 115% = 1.15x per level
        (boots.level, multiplier)
    }
    
    /// Get Mystic Lens stats (level and range multiplier as percentage)
    /// Returns (level, multiplier) e.g., (1, 120) = Level 1, 120% range (1.2x)
    public fun mystic_lens_stats(lens: &MysticLens): (u64, u64) {
        let multiplier = calculate_exponential_bonus(120, lens.level); // 120% = 1.2x per level
        (lens.level, multiplier)
    }
    
    /// Get Lucky Pendant stats (level and drop rate multiplier as percentage)
    /// Returns (level, multiplier) e.g., (2, 121) = Level 2, 121% drops (1.21x)
    public fun lucky_pendant_stats(pendant: &LuckyPendant): (u64, u64) {
        let multiplier = calculate_exponential_bonus(110, pendant.level); // 110% = 1.1x per level
        (pendant.level, multiplier)
    }
    
    /// Get Weapon NFT stats
    /// Returns (weapon_type, damage, fire_rate, special_effect)
    public fun weapon_stats(weapon: &WeaponNFT): (u8, u64, u64, vector<u8>) {
        (weapon.weapon_type, weapon.damage, weapon.fire_rate, weapon.special_effect)
    }
    
    /// Get treasury balance (admin view)
    public fun treasury_balance(treasury: &Treasury): u64 {
        balance::value(&treasury.balance)
    }

    // ======= Test-Only Functions =======
    
    #[test_only]
    public fun init_for_testing(ctx: &mut TxContext) {
        init(PROOF_O_SLAY {}, ctx);
    }
}


