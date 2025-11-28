import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { NeonButton } from './ui/NeonButton';
import { CyberIcon } from './ui/CyberIcon';
import { Clock, TrendingUp, AlertTriangle, ArrowRight } from 'lucide-react';

interface StakingSceneProps {
    balance: number;
    onStakeConfirmed: (amount: number, duration: number) => void;
    onBack: () => void;
}

// Spring physics constants for AAA feel (matching ForgeUI & ConsumablesShop)
const SPRING_CONFIG = { type: "spring" as const, stiffness: 300, damping: 30 };
const STIFF_SPRING = { type: "spring" as const, stiffness: 400, damping: 25 };

// Extracted hover configs for consistency
const SUBTLE_HOVER = {
    scale: 1.015,
    borderColor: 'rgba(74, 222, 128, 0.4)',
    transition: STIFF_SPRING
};

const STAT_ROW_HOVER = {
    x: 3,
    backgroundColor: 'rgba(74, 222, 128, 0.05)',
    borderLeft: '2px solid rgba(74, 222, 128, 0.5)',
    paddingLeft: '12px',
    transition: STIFF_SPRING
};

export const StakingScene: React.FC<StakingSceneProps> = ({ balance, onStakeConfirmed }) => {
    const [stakeAmount, setStakeAmount] = useState<number>(100);
    const [selectedDuration, setSelectedDuration] = useState<number>(15);

    const durations = [
        { minutes: 10, multiplier: 1.5, label: 'SAFE', color: 'blue', tier: 'TIER.1', badge: 'LOW RISK' },
        { minutes: 15, multiplier: 2.0, label: 'NORMAL', color: 'yellow', tier: 'TIER.2', badge: 'RECOMMENDED' },
        { minutes: 20, multiplier: 3.0, label: 'RISKY', color: 'red', tier: 'TIER.3', badge: 'HIGH REWARD' },
    ];

    const currentMultiplier = durations.find(d => d.minutes === selectedDuration)?.multiplier || 0;
    const potentialPayout = Math.floor(stakeAmount * currentMultiplier);

    const handleStakeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = parseInt(e.target.value);
        if (!isNaN(val)) {
            setStakeAmount(Math.min(Math.max(val, 0), 10000)); // Cap at 10k for safety
        }
    };

    return (
        <div className="w-full h-full p-8 relative overflow-y-auto custom-scrollbar">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={SPRING_CONFIG}
                className="w-full flex flex-col gap-5 h-full"
            >
                {/* Header Description - Cyan for consistency */}
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={SPRING_CONFIG}
                >
                    <p className="text-cyan-500/60 font-mono text-sm leading-relaxed max-w-3xl">
                        Stake $SLAY tokens on your survival capability. High risk, high reward. The longer you survive, the greater your multiplier.
                    </p>
                </motion.div>

                {/* Main Grid Layout - 2:1 Ratio */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
                    {/* Left Column: Configuration - Takes 2/3 */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ ...SPRING_CONFIG, delay: 0.2 }}
                        className="relative lg:col-span-2"
                    >

                        <div className="flex flex-col gap-6 h-full">
                            {/* Tech Decorator */}
                            <div className="text-[9px] font-mono text-cyan-500/30 tracking-widest uppercase flex items-center gap-2">
                                <span className="w-1 h-1 bg-cyan-500 rounded-full animate-pulse" />
                                INPUT.CONFIG :: STAKE.PARAMETERS
                            </div>
                            {/* Amount Input with Pulsing Glow */}
                            <div className="flex flex-col gap-3">
                                <label className="text-sm text-cyan-500/60 uppercase tracking-wider font-mono">Stake Amount</label>
                                <motion.div
                                    className="relative"
                                    whileHover={SUBTLE_HOVER}
                                >
                                    <motion.input
                                        type="number"
                                        value={stakeAmount}
                                        onChange={handleStakeChange}
                                        animate={{
                                            boxShadow: [
                                                '0 0 10px rgba(6,182,212,0.2)',
                                                '0 0 20px rgba(6,182,212,0.4)',
                                                '0 0 10px rgba(6,182,212,0.2)',
                                            ]
                                        }}
                                        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                                        className="w-full bg-black/10 border border-cyan-500/30 rounded-sm p-4 text-2xl font-mono text-white focus:border-cyan-400 focus:outline-none focus:shadow-[0_0_25px_rgba(6,182,212,0.5)] focus:scale-[1.015] transition-all"
                                    />
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-cyan-500/50 font-bold font-mono">
                                        $SLAY
                                    </div>
                                </motion.div>

                                {/* Quick Preset Buttons */}
                                <div className="flex gap-2">
                                    {[50, 100, 200, 500].map((amt, idx) => (
                                        <motion.button
                                            key={amt}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ ...SPRING_CONFIG, delay: 0.25 + idx * 0.05 }}
                                            whileHover={{
                                                scale: 1.05,
                                                borderColor: 'rgba(6, 182, 212, 0.5)',
                                                backgroundColor: 'rgba(6, 182, 212, 0.15)',
                                                transition: STIFF_SPRING
                                            }}
                                            whileTap={{ scale: 0.95, transition: STIFF_SPRING }}
                                            onClick={() => setStakeAmount(amt)}
                                            className="flex-1 px-3 py-1.5 text-xs border border-cyan-500/20 rounded-sm text-cyan-400 transition-colors font-mono"
                                        >
                                            {amt}
                                        </motion.button>
                                    ))}
                                </div>
                            </div>

                            {/* Duration Selection with Status Badges */}
                            <div className="flex flex-col gap-3 flex-1">
                                <label className="text-sm text-cyan-500/60 uppercase tracking-wider font-mono">Survival Target</label>
                                <div className="grid grid-cols-3 gap-3 pb-3">
                                    {durations.map((d, idx) => (
                                        <motion.button
                                            key={d.minutes}
                                            initial={{ opacity: 0, y: 15, rotate: -2 }}
                                            animate={{ opacity: 1, y: 0, rotate: 0 }}
                                            transition={{ ...SPRING_CONFIG, delay: 0.35 + idx * 0.06 }}
                                            whileHover={{
                                                y: -6,
                                                scale: 1.03,
                                                transition: STIFF_SPRING
                                            }}
                                            whileTap={{ scale: 0.97, transition: STIFF_SPRING }}
                                            onClick={() => setSelectedDuration(d.minutes)}
                                            className={`
                                                    relative border rounded overflow-hidden group
                                                    ${selectedDuration === d.minutes
                                                    ? 'border-green-400 bg-green-500/10 shadow-[0_0_20px_rgba(74,222,128,0.3)]'
                                                    : 'border-white/10 hover:border-green-500/40 bg-black/20'}
                                                    transition-all duration-300
                                                `}
                                        >
                                            {/* Selection Glow */}
                                            {selectedDuration === d.minutes && (
                                                <motion.div
                                                    layoutId="duration-selection"
                                                    className="absolute inset-0 bg-green-500/5"
                                                    transition={STIFF_SPRING}
                                                />
                                            )}

                                            {/* Scanline on Hover */}
                                            <motion.div
                                                className="absolute inset-0 bg-gradient-to-b from-transparent via-green-500/20 to-transparent opacity-0 group-hover:opacity-100 pointer-events-none"
                                                animate={{ y: ['-100%', '100%'] }}
                                                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                                            />

                                            {/* Flex Column Layout - No Absolute Positioning */}
                                            <div className="relative z-10 flex flex-col h-full">
                                                {/* Top Badge Row */}
                                                <div className="flex justify-end p-2">
                                                    {selectedDuration === d.minutes ? (
                                                        <motion.div
                                                            initial={{ scale: 0 }}
                                                            animate={{ scale: 1 }}
                                                            transition={STIFF_SPRING}
                                                            className="px-2 py-1 bg-cyan-500/20 text-cyan-400 text-[10px] font-bold uppercase tracking-wider border border-cyan-500/30 rounded"
                                                        >
                                                            <div className="flex items-center gap-1.5">
                                                                <span className="w-1 h-1 bg-green-500 rounded-full animate-pulse" />
                                                                SELECTED
                                                            </div>
                                                        </motion.div>
                                                    ) : (
                                                        <motion.div
                                                            initial={{ scale: 0 }}
                                                            animate={{ scale: 1 }}
                                                            transition={{ ...STIFF_SPRING, delay: 0.3 + idx * 0.06 }}
                                                            className={`
                                                                    px-2 py-1 text-[10px] font-bold uppercase tracking-wider border rounded
                                                                    ${d.badge === 'LOW RISK'
                                                                    ? 'bg-cyan-500/5 text-cyan-400/70 border-cyan-500/20'
                                                                    : d.badge === 'RECOMMENDED'
                                                                        ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
                                                                        : 'bg-cyan-500/5 text-cyan-400/70 border-cyan-500/20'
                                                                }
                                                                `}
                                                        >
                                                            <div className="flex items-center gap-1.5">
                                                                <span
                                                                    className={`w-1 h-1 rounded-full ${d.badge === 'RECOMMENDED' ? 'bg-cyan-500 animate-pulse' : 'bg-cyan-500/50'}`}
                                                                />
                                                                {d.badge}
                                                            </div>
                                                        </motion.div>
                                                    )}
                                                </div>

                                                {/* Main Content - Cyberpunk Aesthetic with Breathing Room */}
                                                <div className="flex-1 p-6 flex flex-col gap-5">
                                                    {/* Primary Value - MULTIPLIER with Neon Glow */}
                                                    <div className="flex flex-col gap-2">
                                                        <div className="text-3xl font-black font-mono text-green-400 tabular-nums tracking-widest drop-shadow-[0_0_12px_rgba(74,222,128,0.5)]">
                                                            {d.multiplier}x
                                                        </div>
                                                        <div className="text-[10px] text-cyan-500/40 font-mono tracking-widest uppercase">
                                                            PAYOUT.MULTIPLIER
                                                        </div>
                                                    </div>

                                                    {/* Divider with Neon Accent */}
                                                    <div className="h-px bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent" />

                                                    {/* Secondary Info - Duration Compact */}
                                                    <div className="flex items-baseline justify-between gap-2">
                                                        <div className="flex items-baseline gap-1.5">
                                                            <span className="text-2xl font-bold font-mono text-white tracking-wider">{d.minutes}</span>
                                                            <span className="text-[10px] text-white/40 uppercase font-mono tracking-widest">MIN</span>
                                                        </div>
                                                        <span className="text-[9px] text-cyan-500/40 font-mono tracking-widest uppercase">DURATION</span>
                                                    </div>
                                                </div>

                                                {/* Tech Footer - Transparent */}
                                                <div className="px-3 py-2 bg-black/20 border-t border-cyan-500/20">
                                                    <span className="text-[10px] font-mono text-cyan-400/60 tracking-widest uppercase flex items-center gap-2">
                                                        <span className="w-1 h-1 bg-cyan-500/40 rounded-full" />
                                                        {d.tier}
                                                    </span>
                                                </div>
                                            </div>
                                        </motion.button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Right Column: Projection - Takes 1/3 */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ ...SPRING_CONFIG, delay: 0.25 }}
                        className="relative flex flex-col justify-between lg:col-span-1"
                    >

                        <div>
                            {/* Tech Decorator */}
                            <div className="text-[9px] font-mono text-cyan-500/30 tracking-widest uppercase mb-6 flex items-center gap-2">
                                <span className="w-1 h-1 bg-cyan-500 rounded-full animate-pulse" />
                                OUTPUT.PROJECTION :: RISK.CALC
                            </div>

                            <div className="flex flex-col gap-4 font-mono">
                                <div className="flex justify-between text-sm">
                                    <span className="text-cyan-500/60">Initial Stake:</span>
                                    <span className="text-white">{stakeAmount} $SLAY</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-cyan-500/60">Multiplier:</span>
                                    <span className="text-green-400 drop-shadow-[0_0_8px_rgba(74,222,128,0.4)]">{currentMultiplier}x</span>
                                </div>
                                <motion.div
                                    initial={{ opacity: 0, scaleX: 0 }}
                                    animate={{ opacity: 1, scaleX: 1 }}
                                    transition={{ ...SPRING_CONFIG, delay: 0.6 }}
                                    className="h-px bg-green-500/30 my-2 origin-left"
                                />
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ ...SPRING_CONFIG, delay: 0.65 }}
                                    className="flex justify-between items-end"
                                >
                                    <span className="text-cyan-500/60 text-sm">Potential Payout:</span>
                                    <span className="text-3xl font-bold text-green-400 tabular-nums drop-shadow-[0_0_15px_rgba(74,222,128,0.5)]">
                                        {potentialPayout}
                                    </span>
                                </motion.div>
                            </div>
                        </div>

                        <div className="flex flex-col gap-4 mt-8">
                            {/* Warning Box */}
                            <motion.div
                                key={`warning-${stakeAmount}-${selectedDuration}`}
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                transition={{ ...SPRING_CONFIG, delay: 0.7 }}
                                whileHover={{
                                    scale: 1.02,
                                    borderColor: 'rgba(234, 179, 8, 0.4)',
                                    boxShadow: '0 0 20px rgba(234, 179, 8, 0.15)',
                                    transition: STIFF_SPRING
                                }}
                                className="flex items-start gap-3 text-yellow-500/80 bg-yellow-500/10 p-4 rounded-sm border border-yellow-500/20 relative overflow-hidden cursor-default"
                            >
                                {/* Pulse Background */}
                                <motion.div
                                    animate={{ opacity: [0.3, 0.6, 0.3] }}
                                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                                    className="absolute inset-0 bg-yellow-500/5"
                                />
                                <AlertTriangle size={16} className="mt-0.5 shrink-0 relative z-10" />
                                <p className="relative z-10 text-sm font-mono leading-relaxed">
                                    WARNING: If you die before {selectedDuration} minutes, your entire stake of {stakeAmount} $SLAY will be lost forever.
                                </p>
                            </motion.div>

                            {/* Confirm Button */}
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ ...SPRING_CONFIG, delay: 0.75 }}
                                whileHover={{ scale: 1.02, transition: STIFF_SPRING }}
                                whileTap={{ scale: 0.96, transition: { type: "spring", stiffness: 500, damping: 30 } }}
                            >
                                <NeonButton
                                    variant="success"
                                    size="lg"
                                    className="w-full justify-center text-lg tracking-widest"
                                    onClick={() => onStakeConfirmed(stakeAmount, selectedDuration)}
                                    disabled={stakeAmount > balance || stakeAmount <= 0}
                                >
                                    CONFIRM STAKE
                                </NeonButton>
                            </motion.div>
                        </div>
                    </motion.div>
                </div>

                {/* System Footer */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="text-[10px] text-white/30 text-center font-mono tracking-wider flex items-center justify-center gap-2"
                >
                    <motion.div
                        className="w-1 h-1 bg-green-500 rounded-full"
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    />
                    SECURE CONNECTION :: RISK PROTOCOL ACTIVE
                </motion.div>
            </motion.div >
        </div >
    );
};
