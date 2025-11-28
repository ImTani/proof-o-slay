import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCurrentAccount, useSignAndExecuteTransaction } from '@mysten/dapp-kit';
import { Transaction } from '@mysten/sui/transactions';
import { CONTRACT_CONFIG, NFT_COSTS, calculateUpgradeCost, calculateExponentialBonus } from '../lib/suiClient';
import { NeonButton } from './ui/NeonButton';
import { CyberIcon } from './ui/CyberIcon';
import { GlassPanel } from './ui/GlassPanel';
import { CircleDot, Heart, Footprints, Eye, Clover, AlertTriangle, CheckCircle } from 'lucide-react';

/**
 * NFTUpgradePanel Component
 * 
 * Displays all 5 upgradeable NFTs (PowerRing, VitalityAmulet, SwiftBoots, MysticLens, LuckyPendant)
 * Shows current level, stats, upgrade costs, and buy/upgrade buttons
 * AAA Polish: Spring physics, scanlines, tech decorators, magnetic micro-interactions
 */

// Spring physics constants for AAA feel (matching ForgeUI + ConsumablesShop)
const SPRING_CONFIG = { type: "spring" as const, stiffness: 300, damping: 30 };
const STIFF_SPRING = { type: "spring" as const, stiffness: 400, damping: 25 };

type NFTType = 'PowerRing' | 'VitalityAmulet' | 'SwiftBoots' | 'MysticLens' | 'LuckyPendant';

interface NFTInfo {
    name: string;
    type: NFTType;
    baseCost: number;
    baseBonus: number;
    bonusType: 'exponential' | 'flat';
    description: string;
    icon: any;
    color: string;
    statLabel: string;
    borderColor: string;
    glow: string;
}

const NFT_INFO: Record<NFTType, NFTInfo> = {
    PowerRing: {
        name: 'Power Ring',
        type: 'PowerRing',
        baseCost: NFT_COSTS.POWER_RING,
        baseBonus: 20,
        bonusType: 'exponential',
        description: '+20% damage per level (exponential)',
        icon: CircleDot,
        color: '#e74c3c',
        statLabel: 'Damage',
        borderColor: 'border-red-500',
        glow: 'red',
    },
    VitalityAmulet: {
        name: 'Vitality Amulet',
        type: 'VitalityAmulet',
        baseCost: NFT_COSTS.VITALITY_AMULET,
        baseBonus: 25,
        bonusType: 'flat',
        description: '+25 HP per level (flat)',
        icon: Heart,
        color: '#e91e63',
        statLabel: 'Health',
        borderColor: 'border-pink-500',
        glow: 'magenta',
    },
    SwiftBoots: {
        name: 'Swift Boots',
        type: 'SwiftBoots',
        baseCost: NFT_COSTS.SWIFT_BOOTS,
        baseBonus: 15,
        bonusType: 'exponential',
        description: '+15% speed per level (exponential)',
        icon: Footprints,
        color: '#3498db',
        statLabel: 'Speed',
        borderColor: 'border-blue-500',
        glow: 'blue',
    },
    MysticLens: {
        name: 'Mystic Lens',
        type: 'MysticLens',
        baseCost: NFT_COSTS.MYSTIC_LENS,
        baseBonus: 20,
        bonusType: 'exponential',
        description: '+20% range per level (exponential)',
        icon: Eye,
        color: '#9b59b6',
        statLabel: 'Range',
        borderColor: 'border-purple-500',
        glow: 'purple',
    },
    LuckyPendant: {
        name: 'Lucky Pendant',
        type: 'LuckyPendant',
        baseCost: NFT_COSTS.LUCKY_PENDANT,
        baseBonus: 10,
        bonusType: 'exponential',
        description: '+10% drop rate per level (exponential)',
        icon: Clover,
        color: '#2ecc71',
        statLabel: 'Luck',
        borderColor: 'border-green-500',
        glow: 'green',
    },
};

interface OwnedNFT {
    objectId: string;
    level: number;
}

export function NFTUpgradePanel() {
    const currentAccount = useCurrentAccount();
    const { mutate: signAndExecute } = useSignAndExecuteTransaction();
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    // Query owned NFTs (simplified for now - would need proper queries per NFT type)
    // For MVP, we'll track ownership in local state or show "coming soon" message
    const ownedNFTs: Record<NFTType, OwnedNFT | null> = {
        PowerRing: null,
        VitalityAmulet: null,
        SwiftBoots: null,
        MysticLens: null,
        LuckyPendant: null,
    };

    const handleBuyNFT = async (nftType: NFTType) => {
        if (!currentAccount || !CONTRACT_CONFIG.PACKAGE_ID) {
            setError('WALLET DISCONNECTED OR CONTRACT OFFLINE');
            return;
        }

        setIsProcessing(true);
        setError(null);
        setSuccess(false);

        try {
            const tx = new Transaction();

            // Map NFT type to contract function
            const functionName = `buy_${nftType.toLowerCase()}`;

            // Split coins for payment
            const [paymentCoin] = tx.splitCoins(tx.gas, [
                tx.pure.u64(NFT_INFO[nftType].baseCost * 1_000_000_000), // Convert to raw amount
            ]);

            // Call buy function
            tx.moveCall({
                target: `${CONTRACT_CONFIG.PACKAGE_ID}::${CONTRACT_CONFIG.MODULE_NAME}::${functionName}`,
                arguments: [
                    paymentCoin,
                    tx.object(CONTRACT_CONFIG.TREASURY_ID),
                ],
            });

            signAndExecute(
                { transaction: tx },
                {
                    onSuccess: () => {
                        setSuccess(true);
                        setIsProcessing(false);
                    },
                    onError: (err) => {
                        setError(err.message);
                        setIsProcessing(false);
                    },
                }
            );
        } catch (err) {
            setError(err instanceof Error ? err.message : 'UNKNOWN ERROR');
            setIsProcessing(false);
        }
    };

    const handleUpgradeNFT = async (nftType: NFTType, nftObjectId: string, currentLevel: number) => {
        if (!currentAccount || !CONTRACT_CONFIG.PACKAGE_ID) {
            setError('WALLET DISCONNECTED OR CONTRACT OFFLINE');
            return;
        }

        setIsProcessing(true);
        setError(null);
        setSuccess(false);

        try {
            const tx = new Transaction();
            const functionName = `upgrade_${nftType.toLowerCase()}`;
            const upgradeCost = calculateUpgradeCost(NFT_INFO[nftType].baseCost, currentLevel);

            // Split coins for payment
            const [paymentCoin] = tx.splitCoins(tx.gas, [
                tx.pure.u64(upgradeCost * 1_000_000_000),
            ]);

            // Call upgrade function with mutable NFT reference
            tx.moveCall({
                target: `${CONTRACT_CONFIG.PACKAGE_ID}::${CONTRACT_CONFIG.MODULE_NAME}::${functionName}`,
                arguments: [
                    tx.object(nftObjectId), // Mutable NFT reference
                    paymentCoin,
                    tx.object(CONTRACT_CONFIG.TREASURY_ID),
                ],
            });

            signAndExecute(
                { transaction: tx },
                {
                    onSuccess: () => {
                        setSuccess(true);
                        setIsProcessing(false);
                    },
                    onError: (err) => {
                        setError(err.message);
                        setIsProcessing(false);
                    },
                }
            );
        } catch (err) {
            setError(err instanceof Error ? err.message : 'UNKNOWN ERROR');
            setIsProcessing(false);
        }
    };

    if (!currentAccount) {
        return (
            <div className="p-10 text-center text-cyan-500/60 font-neon font-mono text-sm tracking-widest">
                AWAITING NEURAL LINK :: CONNECT WALLET TO PROCEED
            </div>
        );
    }

    if (!CONTRACT_CONFIG.PACKAGE_ID) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={SPRING_CONFIG}
                className="p-10 text-center text-yellow-500 font-neon"
            >
                <div className="flex items-center justify-center gap-3">
                    <CyberIcon icon={AlertTriangle} className="w-6 h-6" glowColor="yellow" />
                    <span className="font-mono text-sm tracking-widest uppercase">
                        SYSTEM OFFLINE :: CONTRACT NOT DEPLOYED
                    </span>
                </div>
            </motion.div>
        );
    }

    return (
        <div className="w-full max-w-7xl mx-auto p-8 font-neon">
            {/* Header Section with Tech Labels */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={SPRING_CONFIG}
                className="mb-8"
            >
                {/* Data Header */}
                <div className="flex items-center gap-4 mb-4">
                    <div className="flex-1 h-px bg-gradient-to-r from-purple-500/50 to-transparent" />
                    <span className="text-[10px] font-mono text-purple-500/40 tracking-widest uppercase">
                        CYBERNETICS.LAB
                    </span>
                    <div className="flex-1 h-px bg-gradient-to-l from-purple-500/50 to-transparent" />
                </div>

                <p className="text-cyan-500/60 font-mono text-sm leading-relaxed text-center">
                    Enhance biological capabilities through neural augmentation
                </p>
            </motion.div>

            {/* Status Messages with Spring Physics - AnimatePresence */}
            <AnimatePresence mode='wait'>
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={SPRING_CONFIG}
                        className="bg-red-500/10 border border-red-500/30 text-red-500 p-4 rounded-sm mb-6 text-center text-sm font-mono flex items-center justify-center gap-3 backdrop-blur-sm"
                    >
                        <CyberIcon icon={AlertTriangle} className="w-5 h-5" glowColor="red" />
                        <span className="tracking-wider">SYSTEM ERROR: {error}</span>
                    </motion.div>
                )}
                {success && (
                    <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={SPRING_CONFIG}
                        className="bg-green-500/10 border border-green-500/30 text-green-500 p-4 rounded-sm mb-6 text-center text-sm font-mono flex items-center justify-center gap-3 backdrop-blur-sm"
                    >
                        <CyberIcon icon={CheckCircle} className="w-5 h-5" glowColor="green" />
                        <span className="tracking-wider">AUGMENTATION SEQUENCE COMPLETE</span>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* NFT Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                {(Object.keys(NFT_INFO) as NFTType[]).map((nftType, index) => {
                    const info = NFT_INFO[nftType];
                    const owned = ownedNFTs[nftType];
                    const currentLevel = owned?.level || 0;
                    const isMaxLevel = currentLevel >= 5;
                    const canAfford = true; // TODO: Check actual balance

                    let currentBonus = 0;
                    let nextBonus = 0;

                    if (owned) {
                        if (info.bonusType === 'exponential') {
                            currentBonus = calculateExponentialBonus(info.baseBonus, currentLevel);
                            nextBonus = calculateExponentialBonus(info.baseBonus, currentLevel + 1);
                        } else {
                            currentBonus = info.baseBonus * currentLevel;
                            nextBonus = info.baseBonus * (currentLevel + 1);
                        }
                    }

                    const upgradeCost = owned ? calculateUpgradeCost(info.baseCost, currentLevel) : info.baseCost;

                    return (
                        <NFTCard
                            key={nftType}
                            info={info}
                            owned={owned}
                            currentLevel={currentLevel}
                            isMaxLevel={isMaxLevel}
                            currentBonus={currentBonus}
                            nextBonus={nextBonus}
                            upgradeCost={upgradeCost}
                            canAfford={canAfford}
                            index={index}
                            isProcessing={isProcessing}
                            onBuy={handleBuyNFT}
                            onUpgrade={handleUpgradeNFT}
                        />
                    );
                })}
            </div>

            {/* System Footer */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-[10px] text-white/30 text-center mt-8 font-mono tracking-wider flex items-center justify-center gap-2"
            >
                <motion.div
                    className="w-1 h-1 bg-purple-500 rounded-full"
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                />
                NEURAL INTERFACE ACTIVE :: AUGMENTATION PROTOCOL READY
            </motion.div>
        </div>
    );
}

// NFT Card Component - Extracted for cleaner code
const NFTCard = ({
    info,
    owned,
    currentLevel,
    isMaxLevel,
    currentBonus,
    nextBonus,
    upgradeCost,
    canAfford,
    index,
    isProcessing,
    onBuy,
    onUpgrade
}: {
    info: NFTInfo;
    owned: OwnedNFT | null;
    currentLevel: number;
    isMaxLevel: boolean;
    currentBonus: number;
    nextBonus: number;
    upgradeCost: number;
    canAfford: boolean;
    index: number;
    isProcessing: boolean;
    onBuy: (nftType: NFTType) => void;
    onUpgrade: (nftType: NFTType, objectId: string, level: number) => void;
}) => {
    const colorMap: Record<string, string> = {
        red: 'from-red-500/20 to-transparent',
        magenta: 'from-pink-500/20 to-transparent',
        blue: 'from-blue-500/20 to-transparent',
        purple: 'from-purple-500/20 to-transparent',
        green: 'from-green-500/20 to-transparent',
    };

    const borderColorMap: Record<string, string> = {
        red: 'border-red-500/30 hover:border-red-500/50',
        magenta: 'border-pink-500/30 hover:border-pink-500/50',
        blue: 'border-blue-500/30 hover:border-blue-500/50',
        purple: 'border-purple-500/30 hover:border-purple-500/50',
        green: 'border-green-500/30 hover:border-green-500/50',
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{
                opacity: 1,
                y: 0,
                transition: {
                    ...SPRING_CONFIG,
                    delay: index * 0.06
                }
            }}
            className="group"
        >
            <GlassPanel
                variant="thin"
                showDecorators={true}
                whileHover={!owned ? {
                    y: -4,
                    transition: STIFF_SPRING
                } : undefined}
                className={`h-full flex flex-col relative ${borderColorMap[info.glow] || 'border-white/10'} transition-colors`}
            >
                {/* Scanline Overlay */}
                <div className="absolute inset-0 scanlines opacity-5 pointer-events-none rounded-sm" />

                {/* Background Gradient - Weapon Color */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.05 }}
                    transition={SPRING_CONFIG}
                    className={`absolute inset-0 bg-gradient-to-br ${colorMap[info.glow]} pointer-events-none rounded-sm`}
                />

                {/* Hover Scanline Effect */}
                <motion.div
                    className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 pointer-events-none"
                    animate={{ y: ['-100%', '100%'] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                />

                {/* Icon with Hover Rotation */}
                <motion.div
                    whileHover={{
                        scale: 1.1,
                        rotate: [0, -5, 5, 0],
                        transition: {
                            ...STIFF_SPRING,
                            rotate: { duration: 0.5 }
                        }
                    }}
                    className="flex items-center justify-center mb-4"
                >
                    <CyberIcon icon={info.icon} glowColor={info.glow as any} className="w-16 h-16" />
                </motion.div>

                {/* Name */}
                <motion.h3
                    whileHover={{ x: 2, transition: STIFF_SPRING }}
                    className="text-lg font-bold text-center mb-2 tracking-wide text-white"
                    style={{ textShadow: `0 0 10px ${info.color}40` }}
                >
                    {info.name}
                </motion.h3>

                {/* Description */}
                <p className="text-xs text-cyan-500/60 text-center mb-4 font-mono leading-relaxed h-10">
                    {info.description}
                </p>

                {/* Divider */}
                <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mb-4" />

                {/* Stats or Actions */}
                <div className="mt-auto flex flex-col gap-3">
                    {owned ? (
                        <>
                            {/* Level Display */}
                            <div className="bg-black/40 rounded p-3 border border-white/5">
                                <div className="flex justify-between mb-2 text-xs">
                                    <span className="text-cyan-500/50 uppercase tracking-wider font-mono">Level</span>
                                    <span className="font-bold font-mono text-white">
                                        {currentLevel} / 5
                                    </span>
                                </div>
                                <div className="flex justify-between text-xs">
                                    <span className="text-cyan-500/50 uppercase tracking-wider font-mono">{info.statLabel}</span>
                                    <span className="text-white font-bold font-mono">
                                        +{currentBonus}{info.bonusType === 'exponential' ? '%' : ''}
                                    </span>
                                </div>
                            </div>

                            {/* Upgrade Section */}
                            {!isMaxLevel && (
                                <>
                                    <div className="text-xs text-white/40 text-center font-mono">
                                        Next: <span className="text-white">+{nextBonus}{info.bonusType === 'exponential' ? '%' : ''}</span>
                                    </div>

                                    {/* Cost Display with Animated Glow */}
                                    <div className="flex items-center justify-between px-3">
                                        <span className="text-[10px] text-cyan-500/50 uppercase tracking-wider font-mono">
                                            Cost
                                        </span>
                                        <motion.span
                                            whileHover={{ scale: 1.05, transition: STIFF_SPRING }}
                                            animate={canAfford ? {
                                                textShadow: [
                                                    '0 0 8px rgba(250,204,21,0.3)',
                                                    '0 0 16px rgba(250,204,21,0.6)',
                                                    '0 0 8px rgba(250,204,21,0.3)',
                                                ]
                                            } : {}}
                                            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                                            className={`font-mono font-bold text-sm ${canAfford ? 'text-yellow-400' : 'text-red-400'}`}
                                        >
                                            {upgradeCost.toLocaleString()}
                                            <span className="text-xs text-current/50 ml-1">$SLAY</span>
                                        </motion.span>
                                    </div>

                                    {/* Upgrade Button */}
                                    <motion.div
                                        whileHover={{ scale: 1.02, transition: STIFF_SPRING }}
                                        whileTap={{ scale: 0.98, transition: { ...STIFF_SPRING, stiffness: 500 } }}
                                    >
                                        <NeonButton
                                            onClick={() => onUpgrade(info.type, owned!.objectId, currentLevel)}
                                            disabled={isProcessing || !canAfford}
                                            fullWidth
                                            variant="accent"
                                            className="py-3 text-sm tracking-widest"
                                        >
                                            UPGRADE
                                        </NeonButton>
                                    </motion.div>
                                </>
                            )}

                            {/* Max Level Badge */}
                            {isMaxLevel && (
                                <motion.div
                                    animate={{
                                        boxShadow: [
                                            '0 0 10px rgba(234,179,8,0.2)',
                                            '0 0 20px rgba(234,179,8,0.4)',
                                            '0 0 10px rgba(234,179,8,0.2)',
                                        ]
                                    }}
                                    transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                                    className="bg-yellow-500/20 border border-yellow-500/50 text-yellow-400 p-3 rounded text-center font-bold text-sm tracking-widest uppercase"
                                >
                                    <div className="flex items-center justify-center gap-2">
                                        <motion.span
                                            animate={{ opacity: [0.5, 1, 0.5] }}
                                            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                                            className="w-1.5 h-1.5 bg-yellow-500 rounded-full"
                                        />
                                        MAX LEVEL
                                    </div>
                                </motion.div>
                            )}
                        </>
                    ) : (
                        <>
                            {/* Cost Display with Animated Glow */}
                            <div className="flex items-center justify-between px-3">
                                <span className="text-[10px] text-cyan-500/50 uppercase tracking-wider font-mono">
                                    Cost
                                </span>
                                <motion.span
                                    whileHover={{ scale: 1.05, transition: STIFF_SPRING }}
                                    animate={{
                                        textShadow: [
                                            '0 0 8px rgba(250,204,21,0.3)',
                                            '0 0 16px rgba(250,204,21,0.6)',
                                            '0 0 8px rgba(250,204,21,0.3)',
                                        ]
                                    }}
                                    transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                                    className="font-mono font-bold text-sm text-yellow-400"
                                >
                                    {info.baseCost.toLocaleString()}
                                    <span className="text-xs text-yellow-500/50 ml-1">$SLAY</span>
                                </motion.span>
                            </div>

                            {/* Acquire Button */}
                            <motion.div
                                whileHover={{ scale: 1.02, transition: STIFF_SPRING }}
                                whileTap={{ scale: 0.98, transition: { ...STIFF_SPRING, stiffness: 500 } }}
                            >
                                <NeonButton
                                    onClick={() => onBuy(info.type)}
                                    disabled={isProcessing}
                                    fullWidth
                                    variant="primary"
                                    className="py-3 text-sm tracking-widest"
                                >
                                    ACQUIRE
                                </NeonButton>
                            </motion.div>
                        </>
                    )}
                </div>
            </GlassPanel>
        </motion.div>
    );
};
