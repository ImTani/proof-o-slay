import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, MotionConfig, type Variants } from 'framer-motion';
import { NeonButton } from './ui/NeonButton';
import { GlassPanel } from './ui/GlassPanel';
import { WalletConnect } from './WalletConnect';
import { SettingsModal } from './ui/SettingsModal';
import { DynamicBackground } from './ui/DynamicBackground';
import { useCurrentAccount } from '@mysten/dapp-kit';

interface MainMenuProps {
    onStart: () => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({ onStart }) => {
    const currentAccount = useCurrentAccount();
    const [isBooting, setIsBooting] = useState(true);
    const [showSettings, setShowSettings] = useState(false);

    // Persist reduced motion preference
    const [reducedMotion, setReducedMotion] = useState(() => {
        return localStorage.getItem('reducedMotion') === 'true';
    });

    useEffect(() => {
        localStorage.setItem('reducedMotion', String(reducedMotion));
    }, [reducedMotion]);

    // Simulate boot sequence
    useEffect(() => {
        const timer = setTimeout(() => setIsBooting(false), 2500);
        return () => clearTimeout(timer);
    }, []);



    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2
            }
        }
    };

    const itemVariants: Variants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                type: "spring",
                stiffness: 300,
                damping: 30
            }
        }
    };

    return (
        <MotionConfig reducedMotion={reducedMotion ? "always" : "never"}>
            <div className="fixed inset-0 z-10 w-full h-full overflow-hidden flex items-center justify-center bg-transparent">

                {/* Background Elements */}
                <DynamicBackground />

                <AnimatePresence mode="wait">
                    {isBooting ? (
                        <motion.div
                            key="boot"
                            initial={{ opacity: 1 }}
                            exit={{ opacity: 0, scale: 1.05, filter: "blur(10px)" }}
                            transition={{ duration: 0.8, ease: "easeInOut" }}
                            className="flex flex-col items-center justify-center gap-6"
                        >
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                                className="w-20 h-20 border-2 border-t-cyan-500 border-r-transparent border-b-magenta-500 border-l-transparent rounded-full shadow-[0_0_30px_rgba(0,243,255,0.2)]"
                            />
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: [0, 1, 0] }}
                                transition={{ duration: 2, repeat: Infinity }}
                                className="font-mono text-cyan-500 text-xs tracking-[0.3em]"
                            >
                                SYSTEM_BOOT_SEQUENCE_INIT...
                            </motion.div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="menu"
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                            className="relative z-20 w-full max-w-4xl p-8 flex flex-col items-center gap-16"
                        >
                            {/* Neon Title */}
                            {/* Glitch Neon Title */}
                            <div className="relative group flex flex-col items-center mb-8">
                                <div className="flex items-center justify-center select-none">
                                    {/* PROOF - Pattern 1: Occasional deep flicker */}
                                    {"PROOF".split("").map((char, i) => (
                                        <motion.span
                                            key={`p-${i}`}
                                            initial={{ opacity: 1 }}
                                            animate={{
                                                opacity: [1, 1, 0.2, 1, 1, 1, 0.2, 1],
                                                filter: [
                                                    "drop-shadow(0 0 5px #bc13fe) drop-shadow(0 0 10px #bc13fe)",
                                                    "drop-shadow(0 0 5px #bc13fe) drop-shadow(0 0 10px #bc13fe)",
                                                    "drop-shadow(0 0 0px #bc13fe)",
                                                    "drop-shadow(0 0 5px #bc13fe) drop-shadow(0 0 10px #bc13fe)",
                                                    "drop-shadow(0 0 5px #bc13fe) drop-shadow(0 0 10px #bc13fe)",
                                                    "drop-shadow(0 0 5px #bc13fe) drop-shadow(0 0 10px #bc13fe)",
                                                    "drop-shadow(0 0 0px #bc13fe)",
                                                    "drop-shadow(0 0 5px #bc13fe) drop-shadow(0 0 10px #bc13fe)",
                                                ]
                                            }}
                                            transition={{
                                                duration: 4,
                                                repeat: Infinity,
                                                times: [0, 0.9, 0.92, 0.94, 0.96, 0.98, 0.99, 1],
                                                ease: "linear", // Stiff, digital feel
                                                delay: i * 0.05
                                            }}
                                            className="font-neon font-bold text-6xl md:text-9xl tracking-widest text-transparent"
                                            style={{ WebkitTextStroke: "2px #bc13fe" }}
                                        >
                                            {char}
                                        </motion.span>
                                    ))}

                                    {/* Spacer */}
                                    <span className="w-4 md:w-8" />

                                    {/* O' - Pattern 2: Rapid strobe */}
                                    {"O'".split("").map((char, i) => (
                                        <motion.span
                                            key={`o-${i}`}
                                            initial={{ opacity: 1 }}
                                            animate={{
                                                opacity: [1, 0, 1, 0, 1, 0, 1],
                                                filter: [
                                                    "drop-shadow(0 0 5px #bc13fe) drop-shadow(0 0 10px #bc13fe)",
                                                    "none",
                                                    "drop-shadow(0 0 5px #bc13fe) drop-shadow(0 0 10px #bc13fe)",
                                                    "none",
                                                    "drop-shadow(0 0 5px #bc13fe) drop-shadow(0 0 10px #bc13fe)",
                                                    "none",
                                                    "drop-shadow(0 0 5px #bc13fe) drop-shadow(0 0 10px #bc13fe)",
                                                ]
                                            }}
                                            transition={{
                                                duration: 2.5,
                                                repeat: Infinity,
                                                times: [0, 0.05, 0.1, 0.15, 0.2, 0.25, 1],
                                                ease: "linear",
                                                delay: 1 // Offset from first group
                                            }}
                                            className="font-neon font-bold text-6xl md:text-9xl tracking-widest text-transparent"
                                            style={{ WebkitTextStroke: "2px #bc13fe" }}
                                        >
                                            {char}
                                        </motion.span>
                                    ))}

                                    {/* Spacer */}
                                    <span className="w-4 md:w-8" />

                                    {/* SLAY - Pattern 3: The "Broken" one (dim + flicker) */}
                                    {"SLAY".split("").map((char, i) => (
                                        <motion.span
                                            key={`s-${i}`}
                                            initial={{ opacity: 1 }}
                                            animate={{
                                                opacity: [1, 0.3, 1, 0.3, 0.3, 1, 0.3, 1],
                                                filter: [
                                                    "drop-shadow(0 0 5px #bc13fe) drop-shadow(0 0 10px #bc13fe)",
                                                    "drop-shadow(0 0 2px #bc13fe)", // Dim glow
                                                    "drop-shadow(0 0 5px #bc13fe) drop-shadow(0 0 10px #bc13fe)",
                                                    "drop-shadow(0 0 2px #bc13fe)",
                                                    "drop-shadow(0 0 2px #bc13fe)",
                                                    "drop-shadow(0 0 5px #bc13fe) drop-shadow(0 0 10px #bc13fe)",
                                                    "drop-shadow(0 0 2px #bc13fe)",
                                                    "drop-shadow(0 0 5px #bc13fe) drop-shadow(0 0 10px #bc13fe)",
                                                ]
                                            }}
                                            transition={{
                                                duration: 5,
                                                repeat: Infinity,
                                                times: [0, 0.1, 0.15, 0.2, 0.6, 0.65, 0.7, 1],
                                                ease: "linear",
                                                delay: 2 + (i * 0.1)
                                            }}
                                            className="font-neon font-bold text-6xl md:text-9xl tracking-widest text-transparent"
                                            style={{ WebkitTextStroke: "2px #bc13fe" }}
                                        >
                                            {char}
                                        </motion.span>
                                    ))}
                                </div>

                                {/* Decorative Sub-elements */}
                                <div className="flex items-center gap-4 mt-2">
                                    <motion.div
                                        animate={{ opacity: [0.5, 1, 0.5], width: ["3rem", "4rem", "3rem"] }}
                                        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                                        className="h-[1px] bg-[#bc13fe]/50 shadow-[0_0_5px_#bc13fe]"
                                    />
                                    <span className="text-xs font-mono text-white/80 tracking-[0.5em] uppercase">
                                        Tactical Roguelite Protocol
                                    </span>
                                    <motion.div
                                        animate={{ opacity: [0.5, 1, 0.5], width: ["3rem", "4rem", "3rem"] }}
                                        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                                        className="h-[1px] bg-[#bc13fe]/50 shadow-[0_0_5px_#bc13fe]"
                                    />
                                </div>
                            </div>

                            {/* Login / Auth Module */}
                            <motion.div variants={itemVariants} className="w-full max-w-md">
                                <GlassPanel
                                    variant="heavy"
                                    className="w-full flex flex-col gap-0 items-center p-0 overflow-hidden border-white/5 shadow-2xl shadow-black/50 !bg-black/30"
                                >
                                    {/* Header */}
                                    <div className="w-full flex justify-between items-center border-b border-white/5 p-4 bg-white/2">
                                        <span className="text-[10px] font-mono text-cyan-500/60 tracking-widest">SYS.AUTH.PROTOCOL_V9</span>
                                        <div className="flex gap-1.5">
                                            <div className="w-1 h-1 bg-system-red animate-pulse rounded-full" />
                                            <div className="w-1 h-1 bg-cyan-500 rounded-full" />
                                            <div className="w-1 h-1 bg-cyan-500/30 rounded-full" />
                                        </div>
                                    </div>

                                    <div className="p-8 w-full flex flex-col gap-8">
                                        <div className="text-center space-y-3">
                                            <h2 className="text-lg font-cyber text-white tracking-[0.2em] drop-shadow-md">IDENTITY VERIFICATION</h2>
                                            <p className="text-xs text-cyan-500/50 font-mono tracking-wide">Connect neural link to proceed</p>
                                        </div>

                                        <div className="w-full flex justify-center">
                                            <WalletConnect />
                                        </div>

                                        <AnimatePresence mode="popLayout">
                                            {currentAccount ? (
                                                <motion.div
                                                    layout
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: -10 }}
                                                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                                                    className="w-full space-y-4"
                                                >
                                                    <NeonButton
                                                        variant="primary"
                                                        fullWidth
                                                        onClick={onStart}
                                                        className="animate-pulse-slow shadow-[0_0_20px_rgba(0,243,255,0.15)]"
                                                    >
                                                        INITIALIZE SYSTEM
                                                    </NeonButton>
                                                </motion.div>
                                            ) : (
                                                <motion.div
                                                    layout
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    exit={{ opacity: 0 }}
                                                    className="w-full p-4 border border-dashed border-white/10 rounded-sm text-center"
                                                >
                                                    <span className="text-[10px] text-white/30 font-mono tracking-widest animate-pulse">WAITING FOR CONNECTION...</span>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>

                                    <div className="w-full p-2 border-t border-white/5 bg-white/2">
                                        <NeonButton
                                            variant="ghost"
                                            size="sm"
                                            fullWidth
                                            onClick={() => setShowSettings(true)}
                                            className="text-[10px] opacity-50 hover:opacity-100 tracking-[0.2em] h-8"
                                        >
                                            SYSTEM CONFIGURATION
                                        </NeonButton>
                                    </div>
                                </GlassPanel>
                            </motion.div>

                            {/* Footer Status */}
                            <motion.div
                                variants={itemVariants}
                                className="flex gap-12 text-[10px] font-mono text-cyan-500/30 uppercase tracking-[0.2em]"
                            >
                                <span className="flex items-center gap-2">
                                    <span className="w-1 h-1 bg-green-500/50 rounded-full animate-pulse" />
                                    Server: ONLINE
                                </span>
                                <span>Latency: 12ms</span>
                                <span>Ver: 0.9.5-ALPHA</span>
                            </motion.div>

                        </motion.div>
                    )}
                </AnimatePresence>

                <SettingsModal
                    isOpen={showSettings}
                    onClose={() => setShowSettings(false)}
                    reducedMotion={reducedMotion}
                    setReducedMotion={setReducedMotion}
                />
            </div>
        </MotionConfig>
    );
};

