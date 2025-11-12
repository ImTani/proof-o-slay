#[test_only]
module proof_o_slay::proof_o_slay_tests {
    use one::test_scenario::{Self as ts, Scenario};
    use one::coin::{Self, TreasuryCap, Coin};
    use one::test_utils;
    use proof_o_slay::proof_o_slay::{Self, PROOF_O_SLAY, Treasury, Armor, Boots};

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
        
        // Treasury should be shared
        ts::next_tx(&mut scenario, ADMIN);
        {
            let treasury = ts::take_shared<Treasury>(&scenario);
            assert!(proof_o_slay::treasury_balance(&treasury) == 0, 1);
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
            let mut cap = take_treasury_cap(&mut scenario);
            proof_o_slay::forge_tokens(&mut cap, 100, ts::ctx(&mut scenario));
            return_treasury_cap(&mut scenario, cap);
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
            let mut cap = take_treasury_cap(&mut scenario);
            proof_o_slay::forge_tokens(&mut cap, 500, ts::ctx(&mut scenario));
            return_treasury_cap(&mut scenario, cap);
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
            let mut cap = take_treasury_cap(&mut scenario);
            proof_o_slay::forge_tokens(&mut cap, 0, ts::ctx(&mut scenario));
            return_treasury_cap(&mut scenario, cap);
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
            let mut cap = take_treasury_cap(&mut scenario);
            proof_o_slay::forge_tokens(&mut cap, 501, ts::ctx(&mut scenario));
            return_treasury_cap(&mut scenario, cap);
        };
        
        ts::end(scenario);
    }
    
    #[test]
    /// Test buying Armor with exact payment
    fun test_buy_armor_exact() {
        let mut scenario = setup_test();
        
        // Mint 300 SLAY for player
        ts::next_tx(&mut scenario, ADMIN);
        {
            let mut cap = take_treasury_cap(&mut scenario);
            proof_o_slay::forge_tokens(&mut cap, 300, ts::ctx(&mut scenario));
            return_treasury_cap(&mut scenario, cap);
        };
        
        // Player buys Armor
        ts::next_tx(&mut scenario, ADMIN);
        {
            let payment = ts::take_from_sender<Coin<PROOF_O_SLAY>>(&scenario);
            let mut treasury = ts::take_shared<Treasury>(&scenario);
            
            proof_o_slay::buy_armor(&mut treasury, payment, ts::ctx(&mut scenario));
            
            // Treasury should have 300 tokens
            assert!(proof_o_slay::treasury_balance(&treasury) == 300, 0);
            ts::return_shared(treasury);
        };
        
        // Player should receive Armor NFT
        ts::next_tx(&mut scenario, ADMIN);
        {
            let armor = ts::take_from_sender<Armor>(&scenario);
            assert!(proof_o_slay::armor_bonus(&armor) == 20, 1);
            ts::return_to_sender(&scenario, armor);
        };
        
        ts::end(scenario);
    }
    
    #[test]
    /// Test buying Armor with overpayment (should return change)
    fun test_buy_armor_overpay() {
        let mut scenario = setup_test();
        
        // Mint 400 SLAY for player
        ts::next_tx(&mut scenario, ADMIN);
        {
            let mut cap = take_treasury_cap(&mut scenario);
            proof_o_slay::forge_tokens(&mut cap, 400, ts::ctx(&mut scenario));
            return_treasury_cap(&mut scenario, cap);
        };
        
        // Player buys Armor with 400 tokens
        ts::next_tx(&mut scenario, ADMIN);
        {
            let payment = ts::take_from_sender<Coin<PROOF_O_SLAY>>(&scenario);
            let mut treasury = ts::take_shared<Treasury>(&scenario);
            
            proof_o_slay::buy_armor(&mut treasury, payment, ts::ctx(&mut scenario));
            
            // Treasury should have exactly 300 tokens
            assert!(proof_o_slay::treasury_balance(&treasury) == 300, 0);
            ts::return_shared(treasury);
        };
        
        // Player should receive change (100 tokens) and Armor
        ts::next_tx(&mut scenario, ADMIN);
        {
            let change = ts::take_from_sender<Coin<PROOF_O_SLAY>>(&scenario);
            assert!(coin::value(&change) == 100, 1);
            ts::return_to_sender(&scenario, change);
            
            let armor = ts::take_from_sender<Armor>(&scenario);
            assert!(proof_o_slay::armor_bonus(&armor) == 20, 2);
            ts::return_to_sender(&scenario, armor);
        };
        
        ts::end(scenario);
    }
    
    #[test]
    #[expected_failure]
    /// Test buying Armor fails with insufficient payment
    fun test_buy_armor_insufficient() {
        let mut scenario = setup_test();
        
        // Mint only 299 SLAY
        ts::next_tx(&mut scenario, ADMIN);
        {
            let mut cap = take_treasury_cap(&mut scenario);
            proof_o_slay::forge_tokens(&mut cap, 299, ts::ctx(&mut scenario));
            return_treasury_cap(&mut scenario, cap);
        };
        
        // Try to buy Armor (should fail)
        ts::next_tx(&mut scenario, ADMIN);
        {
            let payment = ts::take_from_sender<Coin<PROOF_O_SLAY>>(&scenario);
            let mut treasury = ts::take_shared<Treasury>(&scenario);
            
            proof_o_slay::buy_armor(&mut treasury, payment, ts::ctx(&mut scenario));
            
            ts::return_shared(treasury);
        };
        
        ts::end(scenario);
    }
    
    #[test]
    /// Test buying Boots with exact payment
    fun test_buy_boots_exact() {
        let mut scenario = setup_test();
        
        // Mint 500 SLAY for player
        ts::next_tx(&mut scenario, ADMIN);
        {
            let mut cap = take_treasury_cap(&mut scenario);
            proof_o_slay::forge_tokens(&mut cap, 500, ts::ctx(&mut scenario));
            return_treasury_cap(&mut scenario, cap);
        };
        
        // Player buys Boots
        ts::next_tx(&mut scenario, ADMIN);
        {
            let payment = ts::take_from_sender<Coin<PROOF_O_SLAY>>(&scenario);
            let mut treasury = ts::take_shared<Treasury>(&scenario);
            
            proof_o_slay::buy_boots(&mut treasury, payment, ts::ctx(&mut scenario));
            
            // Treasury should have 500 tokens
            assert!(proof_o_slay::treasury_balance(&treasury) == 500, 0);
            ts::return_shared(treasury);
        };
        
        // Player should receive Boots NFT
        ts::next_tx(&mut scenario, ADMIN);
        {
            let boots = ts::take_from_sender<Boots>(&scenario);
            assert!(proof_o_slay::boots_multiplier(&boots) == 120, 1);
            ts::return_to_sender(&scenario, boots);
        };
        
        ts::end(scenario);
    }
    
    #[test]
    #[expected_failure]
    /// Test buying Boots fails with insufficient payment
    fun test_buy_boots_insufficient() {
        let mut scenario = setup_test();
        
        // Mint only 499 SLAY
        ts::next_tx(&mut scenario, ADMIN);
        {
            let mut cap = take_treasury_cap(&mut scenario);
            proof_o_slay::forge_tokens(&mut cap, 499, ts::ctx(&mut scenario));
            return_treasury_cap(&mut scenario, cap);
        };
        
        // Try to buy Boots (should fail)
        ts::next_tx(&mut scenario, ADMIN);
        {
            let payment = ts::take_from_sender<Coin<PROOF_O_SLAY>>(&scenario);
            let mut treasury = ts::take_shared<Treasury>(&scenario);
            
            proof_o_slay::buy_boots(&mut treasury, payment, ts::ctx(&mut scenario));
            
            ts::return_shared(treasury);
        };
        
        ts::end(scenario);
    }
    
    #[test]
    /// Test complete gameplay flow: forge → buy armor → buy boots
    fun test_complete_flow() {
        let mut scenario = setup_test();
        
        // Forge 500 shards
        ts::next_tx(&mut scenario, PLAYER1);
        {
            let mut cap = ts::take_from_address<TreasuryCap<PROOF_O_SLAY>>(&scenario, ADMIN);
            proof_o_slay::forge_tokens(&mut cap, 500, ts::ctx(&mut scenario));
            ts::return_to_address(ADMIN, cap);
        };
        
        // Buy Armor (300 SLAY)
        ts::next_tx(&mut scenario, PLAYER1);
        {
            let payment = ts::take_from_sender<Coin<PROOF_O_SLAY>>(&scenario);
            let mut treasury = ts::take_shared<Treasury>(&scenario);
            
            proof_o_slay::buy_armor(&mut treasury, payment, ts::ctx(&mut scenario));
            ts::return_shared(treasury);
        };
        
        // Verify Armor received
        ts::next_tx(&mut scenario, PLAYER1);
        {
            assert!(ts::has_most_recent_for_sender<Armor>(&scenario), 0);
        };
        
        // Forge 500 more shards for Boots
        ts::next_tx(&mut scenario, PLAYER1);
        {
            let mut cap = ts::take_from_address<TreasuryCap<PROOF_O_SLAY>>(&scenario, ADMIN);
            proof_o_slay::forge_tokens(&mut cap, 500, ts::ctx(&mut scenario));
            ts::return_to_address(ADMIN, cap);
        };
        
        // Buy Boots (500 SLAY)
        ts::next_tx(&mut scenario, PLAYER1);
        {
            let payment = ts::take_from_sender<Coin<PROOF_O_SLAY>>(&scenario);
            let mut treasury = ts::take_shared<Treasury>(&scenario);
            
            proof_o_slay::buy_boots(&mut treasury, payment, ts::ctx(&mut scenario));
            
            // Treasury should now have 800 total (300 + 500)
            assert!(proof_o_slay::treasury_balance(&treasury) == 800, 1);
            ts::return_shared(treasury);
        };
        
        // Verify Boots received
        ts::next_tx(&mut scenario, PLAYER1);
        {
            assert!(ts::has_most_recent_for_sender<Boots>(&scenario), 2);
        };
        
        ts::end(scenario);
    }
}

