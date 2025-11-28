import { motion } from 'framer-motion';
import { GlassPanel } from './ui/GlassPanel';
import { NeonButton } from './ui/NeonButton';
import { CyberIcon } from './ui/CyberIcon';
import { FlaskConical, Heart, Clover, Zap, Key } from 'lucide-react';

interface ConsumableItem {
    id: string;
    name: string;
    description: string;
    cost: number;
    icon: any;
    color: string;
    glow: string;
}

const CONSUMABLES: ConsumableItem[] = [
    { id: 'damage_elixir', name: 'Rage Serum', description: '+50% Damage Output', cost: 100, icon: FlaskConical, color: 'text-red-400', glow: 'red' },
    { id: 'extra_life', name: 'Lazarus Chip', description: 'Revive once at 50% HP', cost: 200, icon: Heart, color: 'text-pink-400', glow: 'magenta' },
    { id: 'lucky_charm', name: 'RNG Tuner', description: '+50% Shard Drop Rate', cost: 150, icon: Clover, color: 'text-green-400', glow: 'green' },
    { id: 'speed_potion', name: 'Velocity Injector', description: '+30% Movement Speed', cost: 80, icon: Zap, color: 'text-yellow-400', glow: 'yellow' },
    { id: 'starting_gold', name: 'Cache Key', description: '+500 Starting XP', cost: 50, icon: Key, color: 'text-blue-400', glow: 'blue' },
];

// Spring physics constants for AAA feel (matching ForgeUI)
const SPRING_CONFIG = { type: "spring" as const, stiffness: 300, damping: 30 };
const STIFF_SPRING = { type: "spring" as const, stiffness: 400, damping: 25 };

interface ConsumablesShopProps {
    shards: number;
    onPurchase: (itemId: string, cost: number) => void;
    ownedItems: string[];
}

export const ConsumablesShop = ({ shards, onPurchase, ownedItems }: ConsumablesShopProps) => {
    return (
        <div className="w-full font-neon p-8">
            {/* Shop Header - Simple Description */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={SPRING_CONFIG}
                className="mb-8"
            >
                <p className="text-cyan-500/60 font-mono text-sm leading-relaxed max-w-3xl">
                    Equip tactical enhancements to gain permanent advantages. Purchase consumables using shards collected during runs.
                </p>
            </motion.div>

            {/* Shop Inventory Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {CONSUMABLES.map((item, index) => (
                    <ShopCard
                        key={item.id}
                        item={item}
                        index={index}
                        canAfford={shards >= item.cost}
                        isOwned={ownedItems.includes(item.id)}
                        onBuy={() => onPurchase(item.id, item.cost)}
                    />
                ))}
            </div>
        </div>
    );
};

const ShopCard = ({
    item,
    index,
    canAfford,
    isOwned,
    onBuy
}: {
    item: ConsumableItem;
    index: number;
    canAfford: boolean;
    isOwned: boolean;
    onBuy: () => void;
}) => {
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
            {/* Shop Item Card - Cleaner Inventory Style */}
            <motion.div
                whileHover={!isOwned ? {
                    y: -4,
                    transition: STIFF_SPRING
                } : undefined}
                className={`
                    relative bg-black/40 backdrop-blur-md border rounded-sm overflow-hidden
                    ${isOwned
                        ? 'border-green-500/30 bg-green-500/5'
                        : canAfford
                            ? 'border-white/10 hover:border-cyan-500/40'
                            : 'border-red-500/20 bg-red-500/5'
                    }
                    transition-colors duration-300
                `}
            >
                {/* Background Effects */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(0,243,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,243,255,0.02)_1px,transparent_1px)] bg-[size:20px_20px]" />

                {/* Scanline on Hover */}
                <motion.div
                    className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 pointer-events-none"
                    animate={{ y: ['-100%', '100%'] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                />

                {/* Card Content */}
                <div className="relative z-10 p-6 flex flex-col gap-4">
                    {/* Top Row: Icon + Status Badge */}
                    <div className="flex items-start justify-between gap-4">
                        {/* Icon */}
                        <motion.div
                            whileHover={{
                                scale: 1.1,
                                rotate: [0, -3, 3, 0],
                                transition: {
                                    ...STIFF_SPRING,
                                    rotate: { duration: 0.4 }
                                }
                            }}
                            className={`p-3 bg-white/5 rounded border border-white/10 ${item.color}`}
                        >
                            <CyberIcon icon={item.icon} glowColor={item.glow as any} className="w-8 h-8" />
                        </motion.div>

                        {/* Status Badge */}
                        {isOwned ? (
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1, transition: STIFF_SPRING }}
                                className="px-2 py-1 bg-green-500/20 text-green-400 text-[10px] font-bold uppercase tracking-wider border border-green-500/30 rounded"
                            >
                                <div className="flex items-center gap-1.5">
                                    <span className="w-1 h-1 bg-green-500 rounded-full animate-pulse" />
                                    OWNED
                                </div>
                            </motion.div>
                        ) : !canAfford ? (
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1, transition: STIFF_SPRING }}
                                className="px-2 py-1 bg-red-500/20 text-red-400 text-[10px] font-bold uppercase tracking-wider border border-red-500/30 rounded"
                            >
                                <div className="flex items-center gap-1.5">
                                    <span className="w-1 h-1 bg-red-500 rounded-full" />
                                    LOCKED
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                animate={{
                                    opacity: [0.6, 1, 0.6]
                                }}
                                transition={{
                                    duration: 2,
                                    repeat: Infinity,
                                    ease: "easeInOut"
                                }}
                                className="px-2 py-1 bg-cyan-500/10 text-cyan-400 text-[10px] font-bold uppercase tracking-wider border border-cyan-500/30 rounded"
                            >
                                <div className="flex items-center gap-1.5">
                                    <span className="w-1 h-1 bg-cyan-500 rounded-full animate-pulse" />
                                    AVAILABLE
                                </div>
                            </motion.div>
                        )}
                    </div>

                    {/* Item Info */}
                    <div className="flex flex-col gap-2">
                        <motion.h3
                            whileHover={{ x: 2, transition: STIFF_SPRING }}
                            className="text-lg font-bold text-white tracking-wide"
                        >
                            {item.name}
                        </motion.h3>
                        <p className="text-cyan-500/60 text-sm leading-relaxed">
                            {item.description}
                        </p>
                    </div>

                    {/* Divider */}
                    <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

                    {/* Cost Display */}
                    <div className="flex items-center justify-between">
                        <span className="text-xs text-cyan-500/50 uppercase tracking-wider font-mono">
                            Cost
                        </span>
                        <motion.span
                            whileHover={{ scale: 1.05, transition: STIFF_SPRING }}
                            animate={canAfford && !isOwned ? {
                                textShadow: [
                                    '0 0 8px rgba(34,211,238,0.3)',
                                    '0 0 16px rgba(34,211,238,0.6)',
                                    '0 0 8px rgba(34,211,238,0.3)',
                                ]
                            } : {}}
                            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                            className={`font-mono font-bold text-base ${canAfford ? 'text-cyan-300' : 'text-red-400'
                                }`}
                        >
                            {item.cost.toLocaleString()}
                            <span className="text-xs text-current/50 ml-1">SHARDS</span>
                        </motion.span>
                    </div>

                    {/* Action Button or Status */}
                    {isOwned ? (
                        <div className="w-full px-4 py-3 bg-green-500/10 border border-green-500/30 rounded text-center">
                            <span className="text-green-400 text-sm font-bold uppercase tracking-widest">
                                ✓ EQUIPPED
                            </span>
                        </div>
                    ) : canAfford ? (
                        <motion.div
                            whileHover={{ scale: 1.02, transition: STIFF_SPRING }}
                            whileTap={{ scale: 0.98, transition: { ...STIFF_SPRING, stiffness: 500 } }}
                        >
                            <NeonButton
                                onClick={onBuy}
                                fullWidth
                                variant="primary"
                                className="py-3 text-sm tracking-widest"
                            >
                                PURCHASE
                            </NeonButton>
                        </motion.div>
                    ) : (
                        <div className="w-full px-4 py-3 bg-red-500/10 border border-red-500/30 rounded text-center">
                            <span className="text-red-400/80 text-xs font-mono uppercase tracking-wider">
                                Insufficient Shards
                            </span>
                        </div>
                    )}
                </div>

                {/* Item ID Footer */}
                <div className="relative z-10 px-4 py-2 bg-black/30 border-t border-white/5">
                    <span className="text-[9px] font-mono text-cyan-500/30 tracking-widest uppercase">
                        ID: {item.id.toUpperCase()}
                    </span>
                </div>
            </motion.div>
        </motion.div>
    );
};
