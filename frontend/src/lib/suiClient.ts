import { SuiClient } from '@mysten/sui/client';

/**
 * Sui Client Configuration for OneChain testnet
 * 
 * This client is used for querying blockchain state and submitting transactions.
 * Configure the network endpoint based on environment.
 */

// OneChain testnet RPC endpoint from environment variables
const ONECHAIN_TESTNET_URL = import.meta.env.VITE_SUI_RPC_URL || 'https://rpc-testnet.onelabs.cc:443';

// Create and export Sui client instance
export const suiClient = new SuiClient({
    url: ONECHAIN_TESTNET_URL
});

/**
 * Contract Addresses
 * These should be set after deployment and ideally loaded from .env
 * TODO: Update these after deploying to testnet
 */
export const CONTRACT_CONFIG = {
    // Package ID of the deployed proof_o_slay module
    PACKAGE_ID: import.meta.env.VITE_PACKAGE_ID || '',

    // TreasuryCap object ID (for minting SLAY tokens)
    TREASURY_CAP_ID: import.meta.env.VITE_TREASURY_CAP_ID || '',

    // Shared Treasury object ID (for collecting payments)
    TREASURY_ID: import.meta.env.VITE_TREASURY_ID || '',

    // Module name
    MODULE_NAME: 'proof_o_slay',

    // SLAY token type
    get SLAY_TYPE() {
        return `${this.PACKAGE_ID}::${this.MODULE_NAME}::PROOF_O_SLAY`;
    }
};

/**
 * NFT Base Costs (matching Move contract constants)
 */
export const NFT_COSTS = {
    POWER_RING: 300,
    VITALITY_AMULET: 400,
    SWIFT_BOOTS: 500,
    MYSTIC_LENS: 600,
    LUCKY_PENDANT: 800,
    FLAMETHROWER: 1500,
    CELESTIAL_CANNON: 10000,
};

/**
 * Gambling System Constants
 */
export const GAMBLING_CONFIG = {
    MIN_STAKE: 50,
    MAX_STAKE: 500,
    TARGET_OPTIONS: [10, 15, 20], // minutes
    BET_TYPE_TIME_BASED: 0,
    BET_TYPE_PROGRESSIVE_JACKPOT: 1,
};

/**
 * Calculate upgrade cost for NFTs
 * Formula: base_cost × 2^(level-1)
 */
export function calculateUpgradeCost(baseCost: number, currentLevel: number): number {
    const multiplier = Math.pow(2, currentLevel);
    return baseCost * multiplier;
}

/**
 * Calculate exponential bonus (e.g., +20% per level)
 * Returns multiplier as a percentage increase
 */
export function calculateExponentialBonus(basePercent: number, level: number): number {
    // basePercent is like 20 for +20%
    // Returns total percentage increase
    const multiplier = Math.pow(1 + basePercent / 100, level);
    return Math.round((multiplier - 1) * 100);
}

/**
 * Format SLAY token amount (9 decimals)
 */
export function formatSlayAmount(amount: bigint | number): string {
    const value = typeof amount === 'bigint' ? Number(amount) : amount;
    return (value / 1_000_000_000).toFixed(2);
}

/**
 * Convert SLAY display amount to raw amount (multiply by 10^9)
 */
export function toRawSlayAmount(displayAmount: number): bigint {
    return BigInt(Math.floor(displayAmount * 1_000_000_000));
}
