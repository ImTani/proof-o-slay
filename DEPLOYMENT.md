# Proof O' Slay - Deployment Information

**Deployment Date:** November 25, 2025  
**Network:** OneChain Testnet  
**Transaction Digest:** `Hz5fzcKWaeW8F1kyuoyksgGEwPsAXpMnXzKRT8oxR2dw`

---

## 📦 Contract Addresses

### Package ID
```
0xfde1b33a2ef97c34cd2daadefd92eadd54eea36891493b5a6321e12901cd1f57
```

### TreasuryCap (Minting Authority)
```
0xc7077b0fbeb030e9d1176dacd7c0ba1b6779351b9813a1c7a69c84aaefb39556
```
**Type:** `TreasuryCap<PROOF_O_SLAY>`  
**Owner:** Your wallet address

### Treasury (Shared Object - Collects Payments)
```
0xba462631607ffa4bc18ccf8dc411e19d035ac0e19904f594337ab9fd68055a80
```
**Type:** `Treasury`  
**Status:** Shared object (anyone can interact)

### Coin Metadata
```
0x8c9fce027938721383b8949b613644006a0d222a2c72675b8435b65c073a9875
```
**Type:** `CoinMetadata<PROOF_O_SLAY>`  
**Status:** Immutable

### Upgrade Cap
```
0x56ab0b40031e420a06785660fc5e3092126583fe78e2421694641093aea133bb
```
**Type:** `UpgradeCap`  
**Owner:** Your wallet address

---

## 🔗 Module Functions

### Token System
- `forge_tokens(treasury_cap, shards, ctx)` - Convert shards to $SLAY
- `treasury_balance(treasury)` - View treasury balance

### NFT System (5 Upgradeable NFTs)
**Purchase (Level 1):**
- `buy_power_ring(treasury, payment, ctx)` - 300 $SLAY
- `buy_vitality_amulet(treasury, payment, ctx)` - 400 $SLAY
- `buy_swift_boots(treasury, payment, ctx)` - 500 $SLAY
- `buy_mystic_lens(treasury, payment, ctx)` - 600 $SLAY
- `buy_lucky_pendant(treasury, payment, ctx)` - 800 $SLAY

**Upgrade:**
- `upgrade_power_ring(ring, treasury, payment, ctx)` - Cost doubles per level
- `upgrade_vitality_amulet(amulet, treasury, payment, ctx)`
- `upgrade_swift_boots(boots, treasury, payment, ctx)`
- `upgrade_mystic_lens(lens, treasury, payment, ctx)`
- `upgrade_lucky_pendant(pendant, treasury, payment, ctx)`

**Query Stats:**
- `power_ring_stats(ring)` - Returns (level, damage_multiplier)
- `vitality_amulet_stats(amulet)` - Returns (level, hp_bonus)
- `swift_boots_stats(boots)` - Returns (level, speed_multiplier)
- `mystic_lens_stats(lens)` - Returns (level, range_multiplier)
- `lucky_pendant_stats(pendant)` - Returns (level, drop_multiplier)

### Weapon NFTs
- `buy_flamethrower(treasury, payment, ctx)` - 1500 $SLAY
- `buy_celestial_cannon(treasury, payment, ctx)` - 10000 $SLAY
- `weapon_stats(weapon)` - Returns (type, damage, fire_rate, special_effect)

### Gambling System
**Time-Based Betting:**
- `stake_for_run(treasury, payment, target_minutes, ctx)` - Stake 50-500 $SLAY
  - `target_minutes`: 10 (1.5x), 15 (2.0x), or 20 (3.0x)
- `claim_stake_reward(stake_record, survival_minutes, treasury_cap, ctx)`
- `forfeit_stake(stake_record, ctx)`

**Progressive Jackpot:**
- `award_jackpot_ticket(recipient, ctx)` - Award ticket to player
- `start_progressive_jackpot(treasury, payment, ticket, ctx)` - Start jackpot run
- `cash_out_jackpot(stake_record, survival_minutes, treasury_cap, ctx)` - Cash out at 1.1x + 0.1x per minute

---

## 🎮 Frontend Integration

Update `frontend/.env`:

```env
VITE_PACKAGE_ID=0x0418717e68648ca25d5ede2d49897ec91e4687d67da69a1c048f7d7479e325f6
VITE_TREASURY_CAP_ID=0x55dc52d3220b4d3fb5b73f50f3ecf004e9c6bb639b18576037e02135c206505e
VITE_TREASURY_ID=0xdd10000e44d7130133edf05eb2607de0d96a2100d910c2cbc7bc603f7d0184e3
VITE_COIN_METADATA_ID=0x8c9fce027938721383b8949b613644006a0d222a2c72675b8435b65c073a9875
```

---

## 📊 Deployment Stats

- **Gas Used:** 52,689,880 MIST (~0.0526 OCT)
- **Storage Cost:** 52,668,000 MIST
- **Computation Cost:** 1,000,000 MIST
- **Epoch:** 131

---

## 🔍 Explorer Links

View on OneChain Explorer:
- Package: `https://explorer.onechain.network/object/0x0418717e68648ca25d5ede2d49897ec91e4687d67da69a1c048f7d7479e325f6`
- Transaction: `https://explorer.onechain.network/txblock/Hz5fzcKWaeW8F1kyuoyksgGEwPsAXpMnXzKRT8oxR2dw`

---

## ✅ Phase 2 Complete!

All smart contract features deployed and ready for frontend integration:
- ✅ $SLAY token with forge system
- ✅ 5 upgradeable NFTs (Level 1-5)
- ✅ 2 weapon NFTs (Flamethrower, Celestial Cannon)
- ✅ Time-based betting system
- ✅ Progressive jackpot system
- ✅ All query functions
- ✅ 17 passing tests

**Next:** Phase 3 - React UI integration
