/// Proof O' Slay: A play-to-earn dungeon crawler on OneChain
/// Players earn Glimmering Shards in-game and forge them into SLAY tokens
/// SLAY tokens can be used to purchase permanent upgrades (Armor, Boots)
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

    // ======= Constants =======
    
    /// Maximum shards that can be forged at once (prevents abuse)
    const MAX_SHARDS: u64 = 500;
    
    /// Cost to purchase Armor upgrade (in SLAY tokens)
    const ARMOR_COST: u64 = 300;
    
    /// Cost to purchase Boots upgrade (in SLAY tokens)
    const BOOTS_COST: u64 = 500;
    
    /// Health points bonus from Armor
    const ARMOR_BONUS: u64 = 20;
    
    /// Speed multiplier from Boots (120% = 1.2x)
    const BOOTS_MULTIPLIER: u64 = 120;

    // ======= Structs =======
    
    /// One-time witness for creating the SLAY currency
    public struct SLAY_FORGE has drop {}
    
    /// Shared treasury that collects payments from upgrades
    public struct Treasury has key {
        id: UID,
        balance: Balance<SLAY_FORGE>
    }
    
    /// Armor NFT - provides +20 HP
    public struct Armor has key, store {
        id: UID,
        bonus: u64
    }
    
    /// Boots NFT - provides 20% speed boost
    public struct Boots has key, store {
        id: UID,
        multiplier: u64
    }

    // ======= Module Initializer =======
    
    /// Initialize the SLAY token and create the Treasury
    /// Called once when the module is published
    fun init(witness: SLAY_FORGE, ctx: &mut TxContext) {
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

    // ======= Forge System (Honor System) =======
    
    /// Forge Glimmering Shards into SLAY tokens
    /// @param treasury_cap: Minting capability (owned by deployer)
    /// @param shards: Number of shards to forge (1:1 ratio)
    /// @param ctx: Transaction context
    /// 
    /// Honor system: Frontend sends shard count, no backend verification
    /// Production version would verify signature from backend
    public entry fun forge_tokens(
        treasury_cap: &mut TreasuryCap<SLAY_FORGE>,
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

    // ======= Upgrade System =======
    
    /// Purchase Armor upgrade (+20 HP)
    /// @param treasury: Shared treasury to receive payment
    /// @param payment: SLAY coins for payment
    /// @param ctx: Transaction context
    public entry fun buy_armor(
        treasury: &mut Treasury,
        mut payment: Coin<SLAY_FORGE>,
        ctx: &mut TxContext
    ) {
        // Validate payment amount
        assert!(coin::value(&payment) >= ARMOR_COST, EInsufficientPayment);
        
        // Split exact payment if overpaid
        let paid = if (coin::value(&payment) > ARMOR_COST) {
            let paid_coin = coin::split(&mut payment, ARMOR_COST, ctx);
            transfer::public_transfer(payment, tx_context::sender(ctx)); // Return change
            paid_coin
        } else {
            payment
        };
        
        // Deposit payment to treasury
        balance::join(&mut treasury.balance, coin::into_balance(paid));
        
        // Create and transfer Armor NFT
        let armor = Armor {
            id: object::new(ctx),
            bonus: ARMOR_BONUS
        };
        transfer::public_transfer(armor, tx_context::sender(ctx));
    }
    
    /// Purchase Boots upgrade (+20% speed)
    /// @param treasury: Shared treasury to receive payment
    /// @param payment: SLAY coins for payment
    /// @param ctx: Transaction context
    public entry fun buy_boots(
        treasury: &mut Treasury,
        mut payment: Coin<SLAY_FORGE>,
        ctx: &mut TxContext
    ) {
        // Validate payment amount
        assert!(coin::value(&payment) >= BOOTS_COST, EInsufficientPayment);
        
        // Split exact payment if overpaid
        let paid = if (coin::value(&payment) > BOOTS_COST) {
            let paid_coin = coin::split(&mut payment, BOOTS_COST, ctx);
            transfer::public_transfer(payment, tx_context::sender(ctx)); // Return change
            paid_coin
        } else {
            payment
        };
        
        // Deposit payment to treasury
        balance::join(&mut treasury.balance, coin::into_balance(paid));
        
        // Create and transfer Boots NFT
        let boots = Boots {
            id: object::new(ctx),
            multiplier: BOOTS_MULTIPLIER
        };
        transfer::public_transfer(boots, tx_context::sender(ctx));
    }

    // ======= Query Functions =======
    
    /// Get the HP bonus from Armor
    public fun armor_bonus(_armor: &Armor): u64 {
        ARMOR_BONUS
    }
    
    /// Get the speed multiplier from Boots (as percentage)
    public fun boots_multiplier(_boots: &Boots): u64 {
        BOOTS_MULTIPLIER
    }
    
    /// Get treasury balance (admin view)
    public fun treasury_balance(treasury: &Treasury): u64 {
        balance::value(&treasury.balance)
    }

    // ======= Test-Only Functions =======
    
    #[test_only]
    public fun init_for_testing(ctx: &mut TxContext) {
        init(SLAY_FORGE {}, ctx);
    }
}


