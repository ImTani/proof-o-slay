import { motion, AnimatePresence, MotionConfig } from 'framer-motion';
import { useState, useEffect } from 'react';
import { NeonButton } from './ui/NeonButton';
import { GlassPanel } from './ui/GlassPanel';
import { CyberIcon } from './ui/CyberIcon';
import { ScanlineEffect } from './ui/ScanlineEffect';
import { DynamicBackground } from './ui/DynamicBackground';
import { Sparkles, RefreshCw, ArrowLeft, Clock, Target, type LucideIcon } from 'lucide-react';
import { SPRING_CONFIG, STIFF_SPRING, STAGGER_DELAY, HOVER_STATES, ACTIVE_STATES, TYPOGRAPHY, SPACING, COLORS } from '../lib/designTokens';

interface GameOverScreenProps {
    stats: {
        timeSurvived: string;
        enemiesKilled: number;
        shardsCollected: number;
    };
    onRestart: () => void;
    onForge: () => void;
    onMainMenu: () => void;
}

interface StatDisplayProps {
    label: string;
    value: string;
    icon: LucideIcon;
    color: string;
    glowColor: string;
    delay: number;
}

export const GameOverScreen = ({ stats, onRestart, onForge }: GameOverScreenProps) => {
    const [showActions, setShowActions] = useState(false);
    const [showBackground, setShowBackground] = useState(false);

    // Persist reduced motion preference
    const [reducedMotion, setReducedMotion] = useState(() => {
        return localStorage.getItem('reducedMotion') === 'true';
    });

    useEffect(() => {
        localStorage.setItem('reducedMotion', String(reducedMotion));
    }, [reducedMotion]);

    useEffect(() => {
        // Animation sequence: background appears first
        const bgTimer = setTimeout(() => setShowBackground(true), 300);
        // Then actions appear
        const actionsTimer = setTimeout(() => setShowActions(true), 1500);
        return () => {
            clearTimeout(bgTimer);
            clearTimeout(actionsTimer);
        };
    }, []);


    return (
        <MotionConfig reducedMotion={reducedMotion ? "always" : "never"}>
            <AnimatePresence>
                {/* Dynamic Background - Fades in first */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: showBackground ? 1 : 0 }}
                    exit={{ opacity: 0 }}
                    transition={SPRING_CONFIG}
                    className="fixed inset-0 z-40"
                >
                    <DynamicBackground />
                </motion.div>

                {/* Backdrop Overlay - Appears after background */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ ...SPRING_CONFIG, delay: 0.3 }}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm font-neon"
                >
                    {/* Grid texture overlay for additional depth */}
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(0,243,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,243,255,0.02)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none" />

                    {/* CRT Switch-on Effect Line - Happens after backdrop */}
                    <motion.div
                        initial={{ scaleX: 0, opacity: 1 }}
                        animate={{ scaleX: 1, opacity: 0 }}
                        transition={{ ...STIFF_SPRING, delay: 0.5 }}
                        className="absolute inset-x-0 h-[2px] bg-white top-1/2 -translate-y-1/2 z-50 pointer-events-none"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        transition={SPRING_CONFIG}
                        className="w-full max-w-3xl relative z-10"
                    >
                        <GlassPanel
                            variant="heavy"
                            className="relative p-0 overflow-hidden border-white/10 shadow-2xl shadow-black/50 !bg-black/30"
                        >
                            {/* Scanline Effect */}
                            <ScanlineEffect type="static" opacity={0.03} />

                            {/* Header with Status Dots - MainMenu Style */}
                            <div className="w-full flex justify-between items-center border-b border-white/10 px-6 py-4 bg-white/[0.02]">
                                <span className={`${TYPOGRAPHY.tech.decorator} text-cyan-500/60`}>
                                    SYS.STATUS :: CONNECTION_LOST
                                </span>
                                <div className="flex gap-1.5">
                                    <motion.div
                                        className="w-1 h-1 bg-red-500 rounded-full"
                                        animate={{ opacity: [0.3, 1, 0.3] }}
                                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                                    />
                                    <div className="w-1 h-1 bg-cyan-500/50 rounded-full" />
                                    <div className="w-1 h-1 bg-cyan-500/30 rounded-full" />
                                </div>
                            </div>

                            {/* Content Container with Gap-Based Layout */}
                            <div className="flex flex-col gap-8 p-8">
                                {/* Sync Lost Title - Consistent Typography */}
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ ...SPRING_CONFIG, delay: 0.15 }}
                                    className="text-center"
                                >
                                    <h2 className="text-4xl font-bold tracking-[0.3em] uppercase text-cyan-400/90 drop-shadow-[0_0_20px_rgba(6,182,212,0.4)]">
                                        SYNC LOST
                                    </h2>
                                    <p className="text-cyan-500/50 text-sm font-mono mt-2 tracking-wide">
                                        Connection terminated • Session data recovered
                                    </p>
                                </motion.div>

                                {/* Stats Display Section */}
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ ...SPRING_CONFIG, delay: 0.3 }}
                                    className="flex flex-col gap-5"
                                >
                                    {/* Stats Label with Tech Decorator */}
                                    <div className={`${TYPOGRAPHY.tech.decorator} text-${COLORS.system.primarySubtle} flex items-center ${SPACING.inline}`}>
                                        <motion.span
                                            className={`w-1 h-1 bg-${COLORS.system.primary} rounded-full`}
                                            animate={{ opacity: [0.3, 1, 0.3] }}
                                            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                                        />
                                        OUTPUT.DATA :: MISSION.STATISTICS
                                    </div>

                                    {/* Stats Grid - Horizontal Cards */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <StatDisplay
                                            label="Survival Time"
                                            value={stats.timeSurvived}
                                            icon={Clock}
                                            color="text-cyan-400"
                                            glowColor="rgba(34, 211, 238, 0.5)"
                                            delay={0.35}
                                        />
                                        <StatDisplay
                                            label="Enemies Killed"
                                            value={stats.enemiesKilled.toString()}
                                            icon={Target}
                                            color="text-red-400"
                                            glowColor="rgba(248, 113, 113, 0.5)"
                                            delay={0.40}
                                        />
                                        <StatDisplay
                                            label="Shards Collected"
                                            value={stats.shardsCollected.toString()}
                                            icon={Sparkles}
                                            color="text-yellow-400"
                                            glowColor="rgba(250, 204, 21, 0.5)"
                                            delay={0.45}
                                        />
                                    </div>
                                </motion.div>

                                {/* Divider */}
                                <motion.div
                                    initial={{ scaleX: 0 }}
                                    animate={{ scaleX: 1 }}
                                    transition={{ ...SPRING_CONFIG, delay: 0.5 }}
                                    className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"
                                />

                                {/* Action Buttons with staggered entrance */}
                                <AnimatePresence>
                                    {showActions && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            transition={SPRING_CONFIG}
                                            className="flex gap-4"
                                        >
                                            <motion.div
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ ...SPRING_CONFIG, delay: 0 }}
                                                className="flex-1"
                                            >
                                                <motion.div
                                                    whileHover={HOVER_STATES.buttonScale}
                                                    whileTap={ACTIVE_STATES.microScale}
                                                >
                                                    <NeonButton onClick={onRestart} variant="primary" fullWidth>
                                                        <CyberIcon icon={RefreshCw} className="w-5 h-5 mr-2" />
                                                        Re-Initialize Run
                                                    </NeonButton>
                                                </motion.div>
                                            </motion.div>

                                            <motion.div
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ ...SPRING_CONFIG, delay: STAGGER_DELAY }}
                                                className="flex-1"
                                            >
                                                <motion.div
                                                    whileHover={HOVER_STATES.buttonScale}
                                                    whileTap={ACTIVE_STATES.microScale}
                                                >
                                                    <NeonButton onClick={onForge} variant="secondary" fullWidth>
                                                        <CyberIcon icon={ArrowLeft} className="w-5 h-5 mr-2" />
                                                        Return to Hub
                                                    </NeonButton>
                                                </motion.div>
                                            </motion.div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* Footer - MainMenu Style */}
                            <div className="w-full border-t border-white/10 bg-white/[0.02] px-6 py-3 flex items-center justify-between">
                                <div className={`${TYPOGRAPHY.tech.label} text-cyan-500/40 flex items-center ${SPACING.inline}`}>
                                    <motion.div
                                        className="w-1 h-1 bg-red-500 rounded-full"
                                        animate={{ opacity: [0.3, 1, 0.3] }}
                                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                                    />
                                    SYNC.LOST :: AWAITING.COMMAND
                                </div>
                                <div className="text-[9px] text-white/20 font-mono tracking-wider">
                                    SESSION TERMINATED
                                </div>
                            </div>
                        </GlassPanel>
                    </motion.div>
                </motion.div>
            </AnimatePresence>
        </MotionConfig>
    );
};

// Enhanced stat display component with HORIZONTAL layout
const StatDisplay = ({ label, value, icon: Icon, color, glowColor, delay }: StatDisplayProps) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...SPRING_CONFIG, delay }}
            whileHover={{
                scale: 1.02,
                y: -2,
                transition: STIFF_SPRING
            }}
            className="group cursor-default"
        >
            <div className="relative bg-black/40 backdrop-blur-md border border-white/10 rounded-sm overflow-hidden p-4 hover:border-cyan-500/30 transition-colors">
                {/* Background grid texture */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(0,243,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,243,255,0.02)_1px,transparent_1px)] bg-[size:20px_20px]" />

                {/* Scanline on Hover */}
                <ScanlineEffect type="animated" color="cyan-500" opacity={0.05} duration={2} />

                {/* Horizontal Layout: Icon | Value | Label */}
                <div className="relative z-10 flex items-center gap-4">
                    {/* Icon */}
                    <motion.div
                        whileHover={{
                            scale: 1.15,
                            rotate: [0, -5, 5, 0],
                            transition: {
                                scale: STIFF_SPRING,
                                rotate: { duration: 0.4 }
                            }
                        }}
                        className="relative flex-shrink-0"
                    >
                        <CyberIcon icon={Icon} className={`w-8 h-8 ${color}`} />

                        {/* Glow Effect on Hover */}
                        <motion.div
                            className="absolute inset-0 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                            style={{
                                backgroundColor: glowColor
                            }}
                        />
                    </motion.div>

                    {/* Value and Label - Vertical Stack */}
                    <div className="flex flex-col gap-1 flex-1 min-w-0">
                        {/* Value with Enhanced Text Shadow */}
                        <motion.div
                            className={`text-2xl font-bold font-mono ${color} tabular-nums`}
                            style={{
                                textShadow: `0 0 10px ${glowColor}, 0 0 20px ${glowColor}`
                            }}
                            animate={{
                                textShadow: [
                                    `0 0 10px ${glowColor}`,
                                    `0 0 20px ${glowColor}`,
                                    `0 0 10px ${glowColor}`
                                ]
                            }}
                            transition={{
                                duration: 2.5,
                                repeat: Infinity,
                                ease: "easeInOut"
                            }}
                        >
                            {value}
                        </motion.div>

                        {/* Label */}
                        <div className={`${TYPOGRAPHY.tech.label} text-white/40 uppercase tracking-wider`}>
                            {label}
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};
