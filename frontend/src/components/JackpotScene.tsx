import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { NeonButton } from './ui/NeonButton';
import { GlassPanel } from './ui/GlassPanel';
import { CyberIcon } from './ui/CyberIcon';
import { Ticket, Zap, Trophy, Skull, ArrowRight, AlertTriangle } from 'lucide-react';

interface JackpotSceneProps {
    tickets: number;
    onStartJackpot: () => void;
    onBack: () => void;
}

// Spring physics constants for AAA feel (matching StakingScene & ConsumablesShop)
const SPRING_CONFIG = { type: "spring" as const, stiffness: 300, damping: 30 };
const STIFF_SPRING = { type: "spring" as const, stiffness: 400, damping: 25 };

// TypeScript interfaces for sub-components
interface StatBoxProps {
    label: string;
    value: string;
    subtext: string;
    delay: number;
    highlight?: boolean;
}

interface RuleItemProps {
    icon: React.ElementType;
    text: string;
    color: string;
    delay: number;
}

export const JackpotScene: React.FC<JackpotSceneProps> = ({ tickets, onStartJackpot }) => {
    const hasTicket = tickets > 0;

    return (
        <div className="w-full h-full p-8 relative overflow-hidden flex flex-col">
            {/* Void Background Layer */}
            <VoidBackground />

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={SPRING_CONFIG}
                className="relative z-10 w-full h-full flex flex-col gap-6"
            >
                {/* Header Description - Matching StakingScene pattern */}
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={SPRING_CONFIG}
                >
                    <p className="text-cyan-500/60 font-mono text-sm leading-relaxed max-w-3xl">
                        <span className="text-cyan-400 font-bold">WARNING:</span> You are entering a high-entropy zone.
                        Standard safety protocols are disabled. Survival is not guaranteed.
                    </p>
                </motion.div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-0">
                    {/* Left Panel: The Hook - 2/3 Width */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ ...SPRING_CONFIG, delay: 0.15 }}
                        className="lg:col-span-8 relative flex flex-col"
                    >
                        {/* Tech Decorator */}
                        <div className="text-[9px] font-mono text-cyan-500/30 tracking-widest uppercase flex items-center gap-2 mb-2">
                            <span className="w-1 h-1 bg-cyan-500 rounded-full animate-pulse" />
                            VOID.PROTOCOL :: EVENT.PARAMS
                        </div>

                        <GlassPanel variant="heavy" className="flex-1 relative overflow-hidden border-cyan-500/20">
                            {/* Background Grid Pattern */}
                            <div className="absolute inset-0 bg-[linear-gradient(rgba(6,182,212,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.03)_1px,transparent_1px)] bg-[size:40px_40px]" />

                            {/* Scanline Effect on Hover */}
                            <motion.div
                                className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/10 to-transparent opacity-0 group-hover:opacity-100 pointer-events-none"
                                animate={{ y: ['-100%', '100%'] }}
                                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                            />

                            <div className="relative z-10 p-8 flex flex-col gap-8 h-full justify-center">
                                {/* Glitch Title */}
                                <div className="flex items-center gap-6">
                                    <motion.div
                                        className="relative"
                                        whileHover={{ scale: 1.1, rotate: [0, -5, 5, 0], transition: STIFF_SPRING }}
                                    >
                                        <motion.div
                                            className="absolute inset-0 bg-cyan-500/20 blur-xl rounded-full"
                                            animate={{ opacity: [0.3, 0.6, 0.3] }}
                                            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                                        />
                                        <CyberIcon icon={Trophy} glowColor="cyan" size="xl" className="relative z-10" />
                                    </motion.div>
                                    <div>
                                        <GlitchText text="JACKPOT RUN" className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-white to-cyan-400 tracking-widest" />
                                        <p className="text-cyan-500/50 font-mono text-sm tracking-[0.3em] uppercase mt-2">
                                            Infinite Progressive Multiplier
                                        </p>
                                    </div>
                                </div>

                                {/* Stats Row */}
                                <div className="grid grid-cols-2 gap-6">
                                    <StatBox
                                        label="STARTING MULTIPLIER"
                                        value="1.1x"
                                        subtext="BASE"
                                        delay={0.2}
                                    />
                                    <StatBox
                                        label="GROWTH RATE"
                                        value="+0.1x"
                                        subtext="PER MINUTE"
                                        delay={0.25}
                                        highlight
                                    />
                                </div>

                                {/* Rules List */}
                                <div className="space-y-4 font-mono text-sm mt-4">
                                    <RuleItem
                                        icon={Zap}
                                        text="Cash out at ANY time by pressing 'C'"
                                        color="text-yellow-400"
                                        delay={0.3}
                                    />
                                    <RuleItem
                                        icon={Skull}
                                        text="Death results in TOTAL LOSS of Stake + Ticket"
                                        color="text-red-500"
                                        delay={0.35}
                                    />
                                </div>
                            </div>
                        </GlassPanel>
                    </motion.div>

                    {/* Right Panel: Action - 1/3 Width */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ ...SPRING_CONFIG, delay: 0.2 }}
                        className="lg:col-span-4 relative flex flex-col"
                    >
                        {/* Tech Decorator */}
                        <div className="text-[9px] font-mono text-cyan-500/30 tracking-widest uppercase flex items-center gap-2 mb-2">
                            <span className="w-1 h-1 bg-cyan-500 rounded-full animate-pulse" />
                            ACCESS.CONTROL
                        </div>

                        <div className="flex-1 flex flex-col gap-4">
                            {/* Ticket Status - Compact */}
                            <GlassPanel variant="thin" className="relative overflow-hidden border-cyan-500/20 group">
                                {/* Scanline on Hover */}
                                <motion.div
                                    className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/10 to-transparent opacity-0 group-hover:opacity-100 pointer-events-none"
                                    animate={{ y: ['-100%', '100%'] }}
                                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                />

                                <div className="relative z-10 p-6 flex flex-col items-center justify-center gap-2">
                                    <div className="text-[10px] text-cyan-500/40 uppercase tracking-widest font-mono">
                                        Required Entry Fee
                                    </div>
                                    <motion.div
                                        className="flex items-center gap-3"
                                        animate={hasTicket ? {
                                            textShadow: [
                                                '0 0 10px rgba(6,182,212,0.3)',
                                                '0 0 20px rgba(6,182,212,0.6)',
                                                '0 0 10px rgba(6,182,212,0.3)',
                                            ]
                                        } : {}}
                                        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                                    >
                                        <motion.div
                                            whileHover={{ scale: 1.1, rotate: [0, -10, 10, 0], transition: STIFF_SPRING }}
                                        >
                                            <Ticket size={24} className={hasTicket ? 'text-cyan-400' : 'text-white/20'} />
                                        </motion.div>
                                        <span className={`text-4xl font-bold font-mono ${hasTicket ? 'text-white drop-shadow-[0_0_10px_rgba(6,182,212,0.5)]' : 'text-white/20'}`}>
                                            1 <span className="text-sm text-cyan-500/40 ml-1">TICKET</span>
                                        </span>
                                    </motion.div>
                                    <div className="h-px w-full bg-white/5 my-2" />
                                    <div className="flex justify-between w-full text-[10px] font-mono">
                                        <span className="text-cyan-500/40">YOUR BALANCE:</span>
                                        <motion.span
                                            className={hasTicket ? 'text-cyan-400' : 'text-red-500'}
                                            animate={hasTicket ? { scale: [1, 1.05, 1] } : {}}
                                            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                                        >
                                            {tickets}
                                        </motion.span>
                                    </div>
                                </div>
                            </GlassPanel>

                            {/* Main Action Button - Fills remaining space */}
                            <motion.div
                                className="flex-1 relative group"
                                whileHover={hasTicket ? { scale: 1.02, transition: STIFF_SPRING } : undefined}
                                whileTap={hasTicket ? { scale: 0.98, transition: { type: "spring", stiffness: 500, damping: 30 } } : undefined}
                            >
                                {/* Outer Glow */}
                                <motion.div
                                    className="absolute inset-0 blur-xl"
                                    animate={hasTicket ? {
                                        backgroundColor: [
                                            'rgba(6,182,212,0.05)',
                                            'rgba(6,182,212,0.15)',
                                            'rgba(6,182,212,0.05)',
                                        ]
                                    } : {}}
                                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                                />

                                <NeonButton
                                    variant="accent"
                                    size="lg"
                                    className="w-full h-full text-2xl tracking-[0.2em] relative overflow-hidden !border-cyan-500/50 hover:!border-cyan-400"
                                    onClick={onStartJackpot}
                                    disabled={!hasTicket}
                                >
                                    <div className="relative z-10 flex flex-col items-center gap-2">
                                        <motion.span
                                            className="font-black"
                                            animate={hasTicket ? {
                                                textShadow: [
                                                    '0 0 10px rgba(6,182,212,0.6)',
                                                    '0 0 20px rgba(6,182,212,0.9)',
                                                    '0 0 10px rgba(6,182,212,0.6)',
                                                ]
                                            } : {}}
                                            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                                        >
                                            ENTER THE VOID
                                        </motion.span>
                                        <span className="text-[10px] font-mono text-cyan-300/60 tracking-widest uppercase">
                                            INITIATE SEQUENCE
                                        </span>
                                    </div>

                                    {/* Button Glitch Effect */}
                                    <motion.div
                                        className="absolute inset-0 bg-cyan-400/20 mix-blend-overlay pointer-events-none"
                                        animate={{ opacity: [0, 0.3, 0] }}
                                        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                                    />

                                    {/* Scanline Effect */}
                                    <motion.div
                                        className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/20 to-transparent opacity-0 group-hover:opacity-100 pointer-events-none"
                                        animate={{ y: ['-100%', '100%'] }}
                                        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                                    />
                                </NeonButton>
                            </motion.div>

                            {/* Warning Message */}
                            {!hasTicket && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    transition={SPRING_CONFIG}
                                    className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-sm relative overflow-hidden"
                                >
                                    {/* Pulse Background */}
                                    <motion.div
                                        animate={{ opacity: [0.3, 0.6, 0.3] }}
                                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                                        className="absolute inset-0 bg-red-500/5"
                                    />
                                    <AlertTriangle size={14} className="text-red-500 relative z-10" />
                                    <span className="text-[10px] text-red-400 font-mono uppercase tracking-wider relative z-10">
                                        Insufficient Tickets
                                    </span>
                                </motion.div>
                            )}
                        </div>
                    </motion.div>
                </div>

                {/* System Footer - Matching StakingScene */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="text-[10px] text-white/30 text-center font-mono tracking-wider flex items-center justify-center gap-2"
                >
                    <motion.div
                        className="w-1 h-1 bg-red-500 rounded-full"
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    />
                    VOID CONNECTION :: EXTREME RISK PROTOCOL ACTIVE
                </motion.div>
            </motion.div>
        </div>
    );
};

// --- Sub-Components ---

const VoidBackground = () => {
    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {/* Deep Void Gradient */}
            <div className="absolute inset-0 bg-gradient-to-b from-black via-[#050a10] to-[#0a1520]" />

            {/* Morphing Fog/Glow - Faster, more responsive */}
            <motion.div
                animate={{
                    opacity: [0.3, 0.5, 0.3],
                    scale: [1, 1.08, 1],
                }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-[-20%] left-[-20%] w-[140%] h-[140%] bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.08)_0%,transparent_60%)] blur-3xl"
            />

            {/* Digital Rain / Particles */}
            <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'20\' height=\'20\' viewBox=\'0 0 20 20\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%2306b6d4\' fill-opacity=\'0.2\' fill-rule=\'evenodd\'%3E%3Ccircle cx=\'3\' cy=\'3\' r=\'1\'/%3E%3Ccircle cx=\'13\' cy=\'13\' r=\'1\'/%3E%3C/g%3E%3C/svg%3E")' }} />
        </div>
    );
};

const GlitchText = ({ text, className }: { text: string; className?: string }) => {
    return (
        <motion.div
            className={`relative ${className}`}
            whileHover={{ scale: 1.03, transition: STIFF_SPRING }}
        >
            <span className="relative z-10">{text}</span>
            <motion.span
                className="absolute top-0 left-0 -z-10 text-cyan-600 opacity-70"
                animate={{ x: [-2, 2, -1, 0], opacity: [0.5, 0.8, 0.5] }}
                transition={{ duration: 0.2, repeat: Infinity, repeatDelay: 3 }}
            >
                {text}
            </motion.span>
            <motion.span
                className="absolute top-0 left-0 -z-10 text-red-500 opacity-70"
                animate={{ x: [2, -2, 1, 0], opacity: [0.5, 0.8, 0.5] }}
                transition={{ duration: 0.2, repeat: Infinity, repeatDelay: 4 }}
            >
                {text}
            </motion.span>
        </motion.div>
    );
};

const StatBox = ({ label, value, subtext, delay, highlight = false }: StatBoxProps) => (
    <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...SPRING_CONFIG, delay }}
        whileHover={{
            scale: 1.03,
            borderColor: highlight ? 'rgba(6,182,212,0.6)' : 'rgba(255,255,255,0.2)',
            backgroundColor: 'rgba(6,182,212,0.15)',
            transition: STIFF_SPRING
        }}
        className={`p-6 rounded-sm border group cursor-default relative overflow-hidden ${highlight
                ? 'bg-cyan-500/10 border-cyan-500/40'
                : 'bg-white/5 border-white/10'
            }`}
    >
        {/* Scanline on Hover */}
        <motion.div
            className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/20 to-transparent opacity-0 group-hover:opacity-100 pointer-events-none"
            animate={{ y: ['-100%', '100%'] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
        />

        <div className="relative z-10">
            <div className="text-[10px] text-cyan-500/60 uppercase tracking-widest mb-2 font-mono">{label}</div>
            <motion.div
                className={`text-4xl font-black font-mono ${highlight
                        ? 'text-cyan-400'
                        : 'text-white'
                    }`}
                animate={highlight ? {
                    textShadow: [
                        '0 0 10px rgba(6,182,212,0.3)',
                        '0 0 20px rgba(6,182,212,0.6)',
                        '0 0 10px rgba(6,182,212,0.3)',
                    ]
                } : {}}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            >
                {value}
            </motion.div>
            <div className="text-[9px] text-white/30 uppercase tracking-widest mt-1 font-mono group-hover:text-cyan-500/50 transition-colors">
                {subtext}
            </div>
        </div>
    </motion.div>
);

const RuleItem = ({ icon: Icon, text, color, delay }: RuleItemProps) => (
    <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ ...SPRING_CONFIG, delay }}
        whileHover={{
            x: 3,
            backgroundColor: 'rgba(255,255,255,0.08)',
            borderColor: 'rgba(255,255,255,0.1)',
            transition: STIFF_SPRING
        }}
        className="flex items-center gap-4 p-3 rounded-sm border border-transparent cursor-default group"
    >
        <motion.div
            className={`p-2 rounded bg-white/5 ${color}`}
            whileHover={{ scale: 1.1, rotate: [0, -5, 5, 0], transition: STIFF_SPRING }}
        >
            <Icon size={16} />
        </motion.div>
        <span className="text-white/80 tracking-wide group-hover:text-white/90 transition-colors">{text}</span>
    </motion.div>
);
