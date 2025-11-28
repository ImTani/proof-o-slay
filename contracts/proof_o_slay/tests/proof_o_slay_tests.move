#[test_only]
module proof_o_slay::proof_o_slay_tests {
    use one::test_scenario::{Self as ts, Scenario};
    use one::coin::{Self, TreasuryCap, Coin};
    use one::test_utils;
    use proof_o_slay::proof_o_slay::{
        Self, 
        PROOF_O_SLAY, 
        Treasury, 
        PowerRing, 
        VitalityAmulet, 
        SwiftBoots, 
        MysticLens, 
        LuckyPendant,
        WeaponNFT
    };

    // Test addresses
    const ADMIN: address = @0xAD;
    const PLAYER1: address = @0xA1;
    const PLAYER2: address = @0xA2;

    // ======= Helper Functions =======
    
    /// Initialize the module and return scenario
    fun setup_test(): Scenario {
        let mut scenario = ts::begin(ADMIN);
        {
            proof_o_slay::init_for_testing(ts::ctx(&mut scenario));
        };
        scenario
    }
    
    /// Get TreasuryCap for admin
    fun take_treasury_cap(scenario: &mut Scenario): TreasuryCap<PROOF_O_SLAY> {
        ts::take_from_sender<TreasuryCap<PROOF_O_SLAY>>(scenario)
    }
    
    /// Return TreasuryCap
    fun return_treasury_cap(scenario: &mut Scenario, cap: TreasuryCap<PROOF_O_SLAY>) {
        ts::return_to_sender(scenario, cap);
    }
    
    /// Mint tokens for a player (simulates forging)
    fun mint_tokens_for_player(scenario: &mut Scenario, player: address, amount: u64) {
        ts::next_tx(scenario, ADMIN);
        {
            let mut treasury = ts::take_shared<Treasury>(scenario);
            ts::next_tx(scenario, player);
            proof_o_slay::forge_tokens(&mut treasury, amount, ts::ctx(scenario));
            ts::next_tx(scenario, ADMIN);
            ts::return_shared(treasury);
        };
    }

    // ======= Test Cases =======
    
    #[test]
    /// Test successful module initialization
    fun test_init() {
        let mut scenario = setup_test();
        
        // Admin should receive TreasuryCap
        ts::next_tx(&mut scenario, ADMIN);
        {
            assert!(ts::has_most_recent_for_sender<TreasuryCap<PROOF_O_SLAY>>(&scenario), 0);
        };
        
        // Treasury should be shared and have initial supply
        ts::next_tx(&mut scenario, ADMIN);
        {
            let treasury = ts::take_shared<Treasury>(&scenario);
            // 1,000,000 * 10^9 = 1000000000000000
            assert!(proof_o_slay::treasury_balance(&treasury) == 1000000000000000, 1);
            ts::return_shared(treasury);
        };
        
        ts::end(scenario);
    }
    
    #[test]
    /// Test forging tokens with valid shard amount
    fun test_forge_tokens_success() {
        let mut scenario = setup_test();
        
        // Player forges 100 shards
        ts::next_tx(&mut scenario, ADMIN);
        {
            let mut treasury = ts::take_shared<Treasury>(&scenario);
            proof_o_slay::forge_tokens(&mut treasury, 100, ts::ctx(&mut scenario));
            ts::return_shared(treasury);
        };
        
        // Verify player received 100 SLAY tokens
        ts::next_tx(&mut scenario, ADMIN);
        {
            let coin = ts::take_from_sender<Coin<PROOF_O_SLAY>>(&scenario);
            assert!(coin::value(&coin) == 100, 0);
            ts::return_to_sender(&scenario, coin);
        };
        
        ts::end(scenario);
    }
    
    #[test]
    /// Test forging maximum allowed shards (500)
    fun test_forge_tokens_max() {
        let mut scenario = setup_test();
        
        ts::next_tx(&mut scenario, ADMIN);
        {
            let mut treasury = ts::take_shared<Treasury>(&scenario);
            proof_o_slay::forge_tokens(&mut treasury, 500, ts::ctx(&mut scenario));
            ts::return_shared(treasury);
        };
        
        ts::next_tx(&mut scenario, ADMIN);
        {
            let coin = ts::take_from_sender<Coin<PROOF_O_SLAY>>(&scenario);
            assert!(coin::value(&coin) == 500, 0);
            ts::return_to_sender(&scenario, coin);
        };
        
        ts::end(scenario);
    }
    
    #[test]
    #[expected_failure]
    /// Test forging fails with zero shards
    fun test_forge_tokens_zero() {
        let mut scenario = setup_test();
        
        ts::next_tx(&mut scenario, ADMIN);
        {
            let mut treasury = ts::take_shared<Treasury>(&scenario);
            proof_o_slay::forge_tokens(&mut treasury, 0, ts::ctx(&mut scenario));
            ts::return_shared(treasury);
        };
        
        ts::end(scenario);
    }
    
    #[test]
    #[expected_failure]
    /// Test forging fails with too many shards
    fun test_forge_tokens_exceed_max() {
        let mut scenario = setup_test();
        
        ts::next_tx(&mut scenario, ADMIN);
        {
            let mut treasury = ts::take_shared<Treasury>(&scenario);
            proof_o_slay::forge_tokens(&mut treasury, 10001, ts::ctx(&mut scenario));
            ts::return_shared(treasury);
        };
        
        ts::end(scenario);
    }
    
    // ======= Power Ring Tests =======
    
    #[test]
    /// Test buying Power Ring Level 1
    fun test_buy_power_ring() {
        let mut scenario = setup_test();
        
        // Mint 300 SLAY
        ts::next_tx(&mut scenario, ADMIN);
        {
            let mut treasury = ts::take_shared<Treasury>(&scenario);
            proof_o_slay::forge_tokens(&mut treasury, 300, ts::ctx(&mut scenario));
            ts::return_shared(treasury);
        };
        
        // Buy Power Ring
        ts::next_tx(&mut scenario, ADMIN);
        {
            let payment = ts::take_from_sender<Coin<PROOF_O_SLAY>>(&scenario);
            let mut treasury = ts::take_shared<Treasury>(&scenario);
            
            proof_o_slay::buy_power_ring(&mut treasury, payment, ts::ctx(&mut scenario));
            
            assert!(proof_o_slay::treasury_balance(&treasury) == 1000000000000000, 0);
            ts::return_shared(treasury);
        };
        
        // Verify Power Ring received and stats
        ts::next_tx(&mut scenario, ADMIN);
        {
            let ring = ts::take_from_sender<PowerRing>(&scenario);
            let (level, multiplier) = proof_o_slay::power_ring_stats(&ring);
            assert!(level == 1, 1);
            assert!(multiplier == 120, 2); // 1.2x = 120%
            ts::return_to_sender(&scenario, ring);
        };
        
        ts::end(scenario);
    }
    
    #[test]
    /// Test upgrading Power Ring L1 → L5
    fun test_upgrade_power_ring_full() {
        let mut scenario = setup_test();
        
        // Buy Power Ring L1 (300)
        ts::next_tx(&mut scenario, ADMIN);
        {
            let mut treasury = ts::take_shared<Treasury>(&scenario);
            proof_o_slay::forge_tokens(&mut treasury, 300, ts::ctx(&mut scenario));
            ts::return_shared(treasury);
        };
        
        ts::next_tx(&mut scenario, ADMIN);
        {
            let payment = ts::take_from_sender<Coin<PROOF_O_SLAY>>(&scenario);
            let mut treasury = ts::take_shared<Treasury>(&scenario);
            proof_o_slay::buy_power_ring(&mut treasury, payment, ts::ctx(&mut scenario));
            ts::return_shared(treasury);
        };
        
        // Upgrade L1 → L2 (cost: 800)
        ts::next_tx(&mut scenario, ADMIN);
        {
            let mut treasury = ts::take_shared<Treasury>(&scenario);
            proof_o_slay::forge_tokens(&mut treasury, 800, ts::ctx(&mut scenario));
            ts::return_shared(treasury);
        };
        
        ts::next_tx(&mut scenario, ADMIN);
        {
            let mut ring = ts::take_from_sender<PowerRing>(&scenario);
            let payment = ts::take_from_sender<Coin<PROOF_O_SLAY>>(&scenario);
            let mut treasury = ts::take_shared<Treasury>(&scenario);
            
            proof_o_slay::upgrade_power_ring(&mut ring, &mut treasury, payment, ts::ctx(&mut scenario));
            
            let (level, multiplier) = proof_o_slay::power_ring_stats(&ring);
            assert!(level == 2, 0);
            assert!(multiplier == 144, 1); // (1.2)^2 = 1.44 = 144%
            
            ts::return_to_sender(&scenario, ring);
            ts::return_shared(treasury);
        };
        
        // Upgrade L2 → L3 (cost: 1200)
        ts::next_tx(&mut scenario, ADMIN);
        {
            let mut treasury = ts::take_shared<Treasury>(&scenario);
            proof_o_slay::forge_tokens(&mut treasury, 1200, ts::ctx(&mut scenario));
            ts::return_shared(treasury);
        };
        
        ts::next_tx(&mut scenario, ADMIN);
        {
            let mut ring = ts::take_from_sender<PowerRing>(&scenario);
            let payment = ts::take_from_sender<Coin<PROOF_O_SLAY>>(&scenario);
            let mut treasury = ts::take_shared<Treasury>(&scenario);
            
            proof_o_slay::upgrade_power_ring(&mut ring, &mut treasury, payment, ts::ctx(&mut scenario));
            
            let (level, multiplier) = proof_o_slay::power_ring_stats(&ring);
            assert!(level == 3, 0);
            assert!(multiplier == 172, 1); // (1.2)^3 = 1.728 = 172%
            
            ts::return_to_sender(&scenario, ring);
            ts::return_shared(treasury);
        };
        
        ts::end(scenario);
    }
    
    #[test]
    #[expected_failure(abort_code = 2)] // EMaxLevelReached
    /// Test upgrading past max level fails
    fun test_upgrade_power_ring_max_level() {
        let mut scenario = setup_test();
        
        // Buy Power Ring L1
        ts::next_tx(&mut scenario, ADMIN);
        {
            let mut treasury = ts::take_shared<Treasury>(&scenario);
            proof_o_slay::forge_tokens(&mut treasury, 300, ts::ctx(&mut scenario));
            ts::return_shared(treasury);
        };
        
        ts::next_tx(&mut scenario, ADMIN);
        {
            let payment = ts::take_from_sender<Coin<PROOF_O_SLAY>>(&scenario);
            let mut treasury = ts::take_shared<Treasury>(&scenario);
            proof_o_slay::buy_power_ring(&mut treasury, payment, ts::ctx(&mut scenario));
            ts::return_shared(treasury);
        };
        
        // Upgrade L1 → L2
        ts::next_tx(&mut scenario, ADMIN);
        {
            let mut treasury = ts::take_shared<Treasury>(&scenario);
            proof_o_slay::forge_tokens(&mut treasury, 600, ts::ctx(&mut scenario));
            ts::return_shared(treasury);
        };
        
        ts::next_tx(&mut scenario, ADMIN);
        {
            let mut ring = ts::take_from_sender<PowerRing>(&scenario);
            let payment = ts::take_from_sender<Coin<PROOF_O_SLAY>>(&scenario);
            let mut treasury = ts::take_shared<Treasury>(&scenario);
            proof_o_slay::upgrade_power_ring(&mut ring, &mut treasury, payment, ts::ctx(&mut scenario));
            ts::return_to_sender(&scenario, ring);
            ts::return_shared(treasury);
        };
        
        // Upgrade L2 → L3
        ts::next_tx(&mut scenario, ADMIN);
        {
            let mut treasury = ts::take_shared<Treasury>(&scenario);
            proof_o_slay::forge_tokens(&mut treasury, 1200, ts::ctx(&mut scenario));
            ts::return_shared(treasury);
        };
        
        ts::next_tx(&mut scenario, ADMIN);
        {
            let mut ring = ts::take_from_sender<PowerRing>(&scenario);
            let payment = ts::take_from_sender<Coin<PROOF_O_SLAY>>(&scenario);
            let mut treasury = ts::take_shared<Treasury>(&scenario);
            proof_o_slay::upgrade_power_ring(&mut ring, &mut treasury, payment, ts::ctx(&mut scenario));
            ts::return_to_sender(&scenario, ring);
            ts::return_shared(treasury);
        };
        
        // Upgrade L3 → L4
        ts::next_tx(&mut scenario, ADMIN);
        {
            let mut treasury = ts::take_shared<Treasury>(&scenario);
            proof_o_slay::forge_tokens(&mut treasury, 2400, ts::ctx(&mut scenario));
            ts::return_shared(treasury);
        };
        
        ts::next_tx(&mut scenario, ADMIN);
        {
            let mut ring = ts::take_from_sender<PowerRing>(&scenario);
            let payment = ts::take_from_sender<Coin<PROOF_O_SLAY>>(&scenario);
            let mut treasury = ts::take_shared<Treasury>(&scenario);
            proof_o_slay::upgrade_power_ring(&mut ring, &mut treasury, payment, ts::ctx(&mut scenario));
            ts::return_to_sender(&scenario, ring);
            ts::return_shared(treasury);
        };
        
        // Upgrade L4 → L5
        ts::next_tx(&mut scenario, ADMIN);
        {
            let mut treasury = ts::take_shared<Treasury>(&scenario);
            proof_o_slay::forge_tokens(&mut treasury, 4800, ts::ctx(&mut scenario));
            ts::return_shared(treasury);
        };
        
        ts::next_tx(&mut scenario, ADMIN);
        {
            let mut ring = ts::take_from_sender<PowerRing>(&scenario);
            let payment = ts::take_from_sender<Coin<PROOF_O_SLAY>>(&scenario);
            let mut treasury = ts::take_shared<Treasury>(&scenario);
            proof_o_slay::upgrade_power_ring(&mut ring, &mut treasury, payment, ts::ctx(&mut scenario));
            ts::return_to_sender(&scenario, ring);
            ts::return_shared(treasury);
        };
        
        // Try to upgrade L5 → L6 (should fail with EMaxLevelReached)
        ts::next_tx(&mut scenario, ADMIN);
        {
            let mut treasury = ts::take_shared<Treasury>(&scenario);
            proof_o_slay::forge_tokens(&mut treasury, 9999, ts::ctx(&mut scenario));
            ts::return_shared(treasury);
        };
        
        ts::next_tx(&mut scenario, ADMIN);
        {
            let mut ring = ts::take_from_sender<PowerRing>(&scenario);
            let payment = ts::take_from_sender<Coin<PROOF_O_SLAY>>(&scenario);
            let mut treasury = ts::take_shared<Treasury>(&scenario);
            proof_o_slay::upgrade_power_ring(&mut ring, &mut treasury, payment, ts::ctx(&mut scenario));
            ts::return_to_sender(&scenario, ring);
            ts::return_shared(treasury);
        };
        
        ts::end(scenario);
    }
    
    // ======= Vitality Amulet Tests =======
    
    #[test]
    /// Test buying and checking Vitality Amulet stats
    fun test_buy_vitality_amulet() {
        let mut scenario = setup_test();
        
        ts::next_tx(&mut scenario, ADMIN);
        {
            let mut treasury = ts::take_shared<Treasury>(&scenario);
            proof_o_slay::forge_tokens(&mut treasury, 400, ts::ctx(&mut scenario));
            ts::return_shared(treasury);
        };
        
        ts::next_tx(&mut scenario, ADMIN);
        {
            let payment = ts::take_from_sender<Coin<PROOF_O_SLAY>>(&scenario);
            let mut treasury = ts::take_shared<Treasury>(&scenario);
            
            proof_o_slay::buy_vitality_amulet(&mut treasury, payment, ts::ctx(&mut scenario));
            ts::return_shared(treasury);
        };
        
        ts::next_tx(&mut scenario, ADMIN);
        {
            let amulet = ts::take_from_sender<VitalityAmulet>(&scenario);
            let (level, hp_bonus) = proof_o_slay::vitality_amulet_stats(&amulet);
            assert!(level == 1, 0);
            assert!(hp_bonus == 25, 1); // Flat +25 HP per level
            ts::return_to_sender(&scenario, amulet);
        };
        
        ts::end(scenario);
    }
    
    #[test]
    /// Test Vitality Amulet flat scaling
    fun test_vitality_amulet_flat_scaling() {
        let mut scenario = setup_test();
        
        // Buy L1
        ts::next_tx(&mut scenario, ADMIN);
        {
            let mut treasury = ts::take_shared<Treasury>(&scenario);
            proof_o_slay::forge_tokens(&mut treasury, 400, ts::ctx(&mut scenario));
            ts::return_shared(treasury);
        };
        
        ts::next_tx(&mut scenario, ADMIN);
        {
            let payment = ts::take_from_sender<Coin<PROOF_O_SLAY>>(&scenario);
            let mut treasury = ts::take_shared<Treasury>(&scenario);
            proof_o_slay::buy_vitality_amulet(&mut treasury, payment, ts::ctx(&mut scenario));
            ts::return_shared(treasury);
        };
        
        // Try to upgrade beyond L5 (should fail)
        ts::next_tx(&mut scenario, ADMIN);
        {
            let mut treasury = ts::take_shared<Treasury>(&scenario);
            proof_o_slay::forge_tokens(&mut treasury, 9999, ts::ctx(&mut scenario));
            ts::return_shared(treasury);
        };
        
        ts::next_tx(&mut scenario, ADMIN);
        {
            let mut amulet = ts::take_from_sender<VitalityAmulet>(&scenario);
            let payment = ts::take_from_sender<Coin<PROOF_O_SLAY>>(&scenario);
            let mut treasury = ts::take_shared<Treasury>(&scenario);
            
            proof_o_slay::upgrade_vitality_amulet(&mut amulet, &mut treasury, payment, ts::ctx(&mut scenario));
            
            let (level, hp_bonus) = proof_o_slay::vitality_amulet_stats(&amulet);
            assert!(level == 2, 0);
            assert!(hp_bonus == 50, 1); // Flat: 2 × 25 = 50
            
            ts::return_to_sender(&scenario, amulet);
            ts::return_shared(treasury);
        };
        
        ts::end(scenario);
    }
    
    // ======= Swift Boots Tests =======
    
    #[test]
    /// Test buying Swift Boots
    fun test_buy_swift_boots() {
        let mut scenario = setup_test();
        
        ts::next_tx(&mut scenario, ADMIN);
        {
            let mut treasury = ts::take_shared<Treasury>(&scenario);
            proof_o_slay::forge_tokens(&mut treasury, 500, ts::ctx(&mut scenario));
            ts::return_shared(treasury);
        };
        
        ts::next_tx(&mut scenario, ADMIN);
        {
            let payment = ts::take_from_sender<Coin<PROOF_O_SLAY>>(&scenario);
            let mut treasury = ts::take_shared<Treasury>(&scenario);
            
            proof_o_slay::buy_swift_boots(&mut treasury, payment, ts::ctx(&mut scenario));
            ts::return_shared(treasury);
        };
        
        ts::next_tx(&mut scenario, ADMIN);
        {
            let boots = ts::take_from_sender<SwiftBoots>(&scenario);
            let (level, multiplier) = proof_o_slay::swift_boots_stats(&boots);
            assert!(level == 1, 0);
            assert!(multiplier == 115, 1); // 1.15x = 115%
            ts::return_to_sender(&scenario, boots);
        };
        
        ts::end(scenario);
    }
    
    // ======= Mystic Lens Tests =======
    
    #[test]
    /// Test buying Mystic Lens
    fun test_buy_mystic_lens() {
        let mut scenario = setup_test();
        
        ts::next_tx(&mut scenario, ADMIN);
        {
            let mut treasury = ts::take_shared<Treasury>(&scenario);
            proof_o_slay::forge_tokens(&mut treasury, 600, ts::ctx(&mut scenario));
            ts::return_shared(treasury);
        };
        
        ts::next_tx(&mut scenario, ADMIN);
        {
            let payment = ts::take_from_sender<Coin<PROOF_O_SLAY>>(&scenario);
            let mut treasury = ts::take_shared<Treasury>(&scenario);
            
            proof_o_slay::buy_mystic_lens(&mut treasury, payment, ts::ctx(&mut scenario));
            ts::return_shared(treasury);
        };
        
        ts::next_tx(&mut scenario, ADMIN);
        {
            let lens = ts::take_from_sender<MysticLens>(&scenario);
            let (level, multiplier) = proof_o_slay::mystic_lens_stats(&lens);
            assert!(level == 1, 0);
            assert!(multiplier == 120, 1); // 1.2x = 120%
            ts::return_to_sender(&scenario, lens);
        };
        
        ts::end(scenario);
    }
    
    // ======= Lucky Pendant Tests =======
    
    #[test]
    /// Test buying Lucky Pendant
    fun test_buy_lucky_pendant() {
        let mut scenario = setup_test();
        
        ts::next_tx(&mut scenario, ADMIN);
        {
            let mut treasury = ts::take_shared<Treasury>(&scenario);
            proof_o_slay::forge_tokens(&mut treasury, 800, ts::ctx(&mut scenario));
            ts::return_shared(treasury);
        };
        
        ts::next_tx(&mut scenario, ADMIN);
        {
            let payment = ts::take_from_sender<Coin<PROOF_O_SLAY>>(&scenario);
            let mut treasury = ts::take_shared<Treasury>(&scenario);
            
            proof_o_slay::buy_lucky_pendant(&mut treasury, payment, ts::ctx(&mut scenario));
            ts::return_shared(treasury);
        };
        
        ts::next_tx(&mut scenario, ADMIN);
        {
            let pendant = ts::take_from_sender<LuckyPendant>(&scenario);
            let (level, multiplier) = proof_o_slay::lucky_pendant_stats(&pendant);
            assert!(level == 1, 0);
            assert!(multiplier == 110, 1); // 1.1x = 110%
            ts::return_to_sender(&scenario, pendant);
        };
        
        ts::end(scenario);
    }
    
    // ======= Integration Tests =======
    
    #[test]
    /// Test complete progression: buy all 5 NFTs
    fun test_buy_all_nfts() {
        let mut scenario = setup_test();
        
        // Buy Power Ring (300)
        ts::next_tx(&mut scenario, ADMIN);
        {
            let mut treasury = ts::take_shared<Treasury>(&scenario);
            proof_o_slay::forge_tokens(&mut treasury, 300, ts::ctx(&mut scenario));
            ts::return_shared(treasury);
        };
        
        ts::next_tx(&mut scenario, ADMIN);
        {
            let payment = ts::take_from_sender<Coin<PROOF_O_SLAY>>(&scenario);
            let mut treasury = ts::take_shared<Treasury>(&scenario);
            proof_o_slay::buy_power_ring(&mut treasury, payment, ts::ctx(&mut scenario));
            ts::return_shared(treasury);
        };
        
        // Buy Vitality Amulet (400)
        ts::next_tx(&mut scenario, ADMIN);
        {
            let mut treasury = ts::take_shared<Treasury>(&scenario);
            proof_o_slay::forge_tokens(&mut treasury, 400, ts::ctx(&mut scenario));
            ts::return_shared(treasury);
        };
        
        ts::next_tx(&mut scenario, ADMIN);
        {
            let payment = ts::take_from_sender<Coin<PROOF_O_SLAY>>(&scenario);
            let mut treasury = ts::take_shared<Treasury>(&scenario);
            proof_o_slay::buy_vitality_amulet(&mut treasury, payment, ts::ctx(&mut scenario));
            ts::return_shared(treasury);
        };
        
        // Buy Swift Boots (500)
        ts::next_tx(&mut scenario, ADMIN);
        {
            let mut treasury = ts::take_shared<Treasury>(&scenario);
            proof_o_slay::forge_tokens(&mut treasury, 500, ts::ctx(&mut scenario));
            ts::return_shared(treasury);
        };
        
        ts::next_tx(&mut scenario, ADMIN);
        {
            let payment = ts::take_from_sender<Coin<PROOF_O_SLAY>>(&scenario);
            let mut treasury = ts::take_shared<Treasury>(&scenario);
            proof_o_slay::buy_swift_boots(&mut treasury, payment, ts::ctx(&mut scenario));
            ts::return_shared(treasury);
        };
        
        // Buy Mystic Lens (600)
        ts::next_tx(&mut scenario, ADMIN);
        {
            let mut treasury = ts::take_shared<Treasury>(&scenario);
            proof_o_slay::forge_tokens(&mut treasury, 600, ts::ctx(&mut scenario));
            ts::return_shared(treasury);
        };
        
        ts::next_tx(&mut scenario, ADMIN);
        {
            let payment = ts::take_from_sender<Coin<PROOF_O_SLAY>>(&scenario);
            let mut treasury = ts::take_shared<Treasury>(&scenario);
            proof_o_slay::buy_mystic_lens(&mut treasury, payment, ts::ctx(&mut scenario));
            ts::return_shared(treasury);
        };
        
        // Buy Lucky Pendant (800)
        ts::next_tx(&mut scenario, ADMIN);
        {
            let mut treasury = ts::take_shared<Treasury>(&scenario);
            proof_o_slay::forge_tokens(&mut treasury, 800, ts::ctx(&mut scenario));
            ts::return_shared(treasury);
        };
        
        ts::next_tx(&mut scenario, ADMIN);
        {
            let payment = ts::take_from_sender<Coin<PROOF_O_SLAY>>(&scenario);
            let mut treasury = ts::take_shared<Treasury>(&scenario);
            proof_o_slay::buy_lucky_pendant(&mut treasury, payment, ts::ctx(&mut scenario));
            ts::return_shared(treasury);
        };
        
        // Verify all NFTs
        ts::next_tx(&mut scenario, ADMIN);
        {
            let ring = ts::take_from_sender<PowerRing>(&scenario);
            let amulet = ts::take_from_sender<VitalityAmulet>(&scenario);
            let boots = ts::take_from_sender<SwiftBoots>(&scenario);
            let lens = ts::take_from_sender<MysticLens>(&scenario);
            let pendant = ts::take_from_sender<LuckyPendant>(&scenario);
            
            let (ring_level, _) = proof_o_slay::power_ring_stats(&ring);
            let (amulet_level, _) = proof_o_slay::vitality_amulet_stats(&amulet);
            let (boots_level, _) = proof_o_slay::swift_boots_stats(&boots);
            let (lens_level, _) = proof_o_slay::mystic_lens_stats(&lens);
            let (pendant_level, _) = proof_o_slay::lucky_pendant_stats(&pendant);
            
            assert!(ring_level == 1, 0);
            assert!(amulet_level == 1, 1);
            assert!(boots_level == 1, 2);
            assert!(lens_level == 1, 3);
            assert!(pendant_level == 1, 4);
            
            ts::return_to_sender(&scenario, ring);
            ts::return_to_sender(&scenario, amulet);
            ts::return_to_sender(&scenario, boots);
            ts::return_to_sender(&scenario, lens);
            ts::return_to_sender(&scenario, pendant);
        };
        
        ts::end(scenario);
    }
    
    // ======= Weapon NFT Tests =======
    
    #[test]
    fun test_buy_flamethrower() {
        let mut scenario = setup_test();
        
        // Mint 2000 SLAY for PLAYER1 (cost is 1500)
        mint_tokens_for_player(&mut scenario, PLAYER1, 2000);
        
        // Buy Flamethrower
        ts::next_tx(&mut scenario, PLAYER1);
        {
            let mut treasury = ts::take_shared<Treasury>(&scenario);
            let payment = ts::take_from_sender<Coin<PROOF_O_SLAY>>(&scenario);
            
            proof_o_slay::buy_flamethrower(&mut treasury, payment, ts::ctx(&mut scenario));
            
            ts::return_shared(treasury);
        };
        
        // Verify weapon was created with correct stats
        ts::next_tx(&mut scenario, PLAYER1);
        {
            let weapon = ts::take_from_sender<WeaponNFT>(&scenario);
            let (weapon_type, damage, fire_rate, special_effect) = proof_o_slay::weapon_stats(&weapon);
            
            assert!(weapon_type == 0, 0); // WEAPON_TYPE_FLAMETHROWER
            assert!(damage == 15, 1);
            assert!(fire_rate == 100, 2);
            assert!(special_effect == b"continuous_cone", 3);
            
            ts::return_to_sender(&scenario, weapon);
        };
        
        ts::end(scenario);
    }
    
    #[test]
    fun test_buy_celestial_cannon() {
        let mut scenario = setup_test();
        
        // Mint tokens in two batches (10000 + 1000 = 11000 SLAY)
        mint_tokens_for_player(&mut scenario, PLAYER1, 10000);
        mint_tokens_for_player(&mut scenario, PLAYER1, 1000);
        
        // Merge coins before purchase
        ts::next_tx(&mut scenario, PLAYER1);
        {
            let mut coin1 = ts::take_from_sender<Coin<PROOF_O_SLAY>>(&scenario);
            let coin2 = ts::take_from_sender<Coin<PROOF_O_SLAY>>(&scenario);
            coin::join(&mut coin1, coin2);
            ts::return_to_sender(&scenario, coin1);
        };
        
        // Buy Celestial Cannon
        ts::next_tx(&mut scenario, PLAYER1);
        {
            let mut treasury = ts::take_shared<Treasury>(&scenario);
            let payment = ts::take_from_sender<Coin<PROOF_O_SLAY>>(&scenario);
            
            proof_o_slay::buy_celestial_cannon(&mut treasury, payment, ts::ctx(&mut scenario));
            
            ts::return_shared(treasury);
        };
        
        // Verify weapon was created with correct stats
        ts::next_tx(&mut scenario, PLAYER1);
        {
            let weapon = ts::take_from_sender<WeaponNFT>(&scenario);
            let (weapon_type, damage, fire_rate, special_effect) = proof_o_slay::weapon_stats(&weapon);
            
            assert!(weapon_type == 1, 0); // WEAPON_TYPE_CELESTIAL_CANNON
            assert!(damage == 500, 1);
            assert!(fire_rate == 3000, 2);
            assert!(special_effect == b"explosive_aoe_300", 3);
            
            ts::return_to_sender(&scenario, weapon);
        };
        
        ts::end(scenario);
    }
    
    #[test]
    #[expected_failure(abort_code = 1)] // EInsufficientPayment
    fun test_buy_flamethrower_insufficient_payment() {
        let mut scenario = setup_test();
        
        // Mint only 1000 SLAY (not enough for 1500 cost)
        mint_tokens_for_player(&mut scenario, PLAYER1, 1000);
        
        ts::next_tx(&mut scenario, PLAYER1);
        {
            let mut treasury = ts::take_shared<Treasury>(&scenario);
            let payment = ts::take_from_sender<Coin<PROOF_O_SLAY>>(&scenario);
            
            proof_o_slay::buy_flamethrower(&mut treasury, payment, ts::ctx(&mut scenario));
            
            ts::return_shared(treasury);
        };
        
        ts::end(scenario);
    }
}

