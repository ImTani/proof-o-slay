import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { NeonButton } from './ui/NeonButton';
import { NeonCard } from './ui/NeonCard';
import { CyberIcon } from './ui/CyberIcon';
import { Sparkles, Hammer, RefreshCw, Home } from 'lucide-react';

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

export const GameOverScreen = ({ stats, onRestart, onForge, onMainMenu }: GameOverScreenProps) => {
    const [showActions, setShowActions] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setShowActions(true), 2000);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm overflow-hidden font-neon">
            {/* CRT Scanline Effect */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-10 bg-[size:100%_2px,3px_100%] pointer-events-none" />

            {/* Background Glitch Elements */}
            <div className="absolute inset-0 overflow-hidden opacity-20 pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-500/30 rounded-full blur-[100px] animate-pulse" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/30 rounded-full blur-[100px] animate-pulse delay-700" />
            </div>

            <motion.div
                initial={{ scale: 2, opacity: 0, filter: "blur(20px)" }}
                animate={{ scale: 1, opacity: 1, filter: "blur(0px)" }}
                transition={{ duration: 0.5, type: "spring", bounce: 0.5 }}
                className="relative z-20 mb-12 text-center"
            >
                <h1 className="text-8xl md:text-9xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-red-500 to-red-900 tracking-tighter drop-shadow-[0_0_30px_rgba(255,0,0,0.8)] animate-pulse">
                    SYNC LOST
                </h1>
                <div className="text-red-500/60 font-tech tracking-[1em] text-xl mt-4 uppercase">
                    Signal Terminated
                </div>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 z-20 mb-16 w-full max-w-4xl px-8">
                <StatCard
                    label="SURVIVAL TIME"
                    value={stats.timeSurvived}
                    delay={0.5}
                    color="text-cyan-400"
                    borderColor="border-cyan-500/30"
                />
                <StatCard
                    label="THREATS NEUTRALIZED"
                    value={stats.enemiesKilled.toString()}
                    delay={0.8}
                    color="text-red-400"
                    borderColor="border-red-500/30"
                />
                <StatCard
                    label="SHARDS SECURED"
                    value={stats.shardsCollected.toString()}
                    delay={1.1}
                    color="text-yellow-400"
                    borderColor="border-yellow-500/30"
                    icon={Sparkles}
                    iconColor="text-yellow-400"
                />
            </div>

            <AnimatePresence>
                {showActions && (
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col md:flex-row gap-6 z-20"
                    >
                        <NeonButton onClick={onForge} variant="accent" size="lg">
                            <CyberIcon icon={Hammer} className="mr-2 w-5 h-5" />
                            FORGE SHARDS
                        </NeonButton>
                        <NeonButton onClick={onRestart} variant="primary" size="lg">
                            <CyberIcon icon={RefreshCw} className="mr-2 w-5 h-5" />
                            RE-INITIALIZE
                        </NeonButton>
                        <NeonButton onClick={onMainMenu} variant="secondary" size="lg">
                            <CyberIcon icon={Home} className="mr-2 w-5 h-5" />
                            RETURN TO HUB
                        </NeonButton>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const StatCard = ({ label, value, delay, color, icon: Icon, iconColor }: any) => (
    <NeonCard
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay, type: "spring" }}
        className={`group hover:bg-white/5 transition-colors`}
        variant={color.includes('cyan') ? 'primary' : color.includes('red') ? 'danger' : 'secondary'}
    >
        <div className={`absolute top-0 left-0 w-1 h-full ${color.replace('text', 'bg')}`} />
        <div className="text-xs text-gray-400 font-tech tracking-widest mb-2">{label}</div>
        <div className={`text-4xl font-bold font-mono ${color} drop-shadow-lg flex items-center gap-2`}>
            {Icon && <CyberIcon icon={Icon} className={`w-8 h-8 ${iconColor}`} />}
            {value}
        </div>
        {/* Scanline hover effect */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/5 to-transparent translate-y-[-100%] group-hover:translate-y-[100%] transition-transform duration-1000" />
    </NeonCard>
);
