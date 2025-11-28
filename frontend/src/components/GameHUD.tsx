import { motion } from 'framer-motion';
import type { GameStats } from '../game/config';

interface GameHUDProps {
    stats: GameStats;
}

export const GameHUD = ({ stats }: GameHUDProps) => {
    // Calculate percentages
    const healthPercent = Math.max(0, Math.min(100, (stats.health / stats.maxHealth) * 100));
    const xpPercent = Math.max(0, Math.min(100, (stats.experience / stats.maxExperience) * 100));

    return (
        <div className="absolute inset-0 pointer-events-none z-50 font-neon select-none text-cyan-100">
            {/* Top Left: Health & Status */}
            <div className="absolute top-8 left-8 flex flex-col gap-4 w-96">
                {/* Health Module */}
                <div className="relative">
                    <div className="flex justify-between items-end mb-1 px-1">
                        <span className="text-xs font-tech tracking-widest text-cyan-400">VITALITY_STATUS</span>
                        <span className="text-xl font-bold text-white drop-shadow-[0_0_5px_rgba(0,243,255,0.8)]">
                            {Math.ceil(stats.health)}<span className="text-sm text-cyan-600">/{stats.maxHealth}</span>
                        </span>
                    </div>

                    {/* Health Bar Container */}
                    <div className="h-4 bg-black/60 border border-cyan-900/50 skew-x-[-20deg] overflow-hidden relative backdrop-blur-sm">
                        {/* Grid Pattern */}
                        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,243,255,0.1)_1px,transparent_1px)] bg-[size:20px_100%]" />

                        {/* Health Fill */}
                        <motion.div
                            className="h-full bg-gradient-to-r from-cyan-600 via-cyan-400 to-white"
                            initial={{ width: '100%' }}
                            animate={{ width: `${healthPercent}%` }}
                            transition={{ type: 'spring', stiffness: 100, damping: 20 }}
                        />
                    </div>
                </div>

                {/* XP Module */}
                <div className="relative w-3/4">
                    <div className="h-1.5 bg-black/60 border border-purple-900/50 skew-x-[-20deg] overflow-hidden">
                        <motion.div
                            className="h-full bg-gradient-to-r from-purple-600 to-magenta-400"
                            initial={{ width: '0%' }}
                            animate={{ width: `${xpPercent}%` }}
                        />
                    </div>
                    <div className="absolute -right-2 -top-3 text-xs font-tech text-purple-400">
                        LVL.{stats.level.toString().padStart(2, '0')}
                    </div>
                </div>
            </div>

            {/* Top Right: Resources */}
            <div className="absolute top-8 right-8 flex flex-col items-end gap-2">
                <div className="flex items-center gap-4 bg-black/40 backdrop-blur-md border-r-2 border-cyan-500 px-6 py-2 skew-x-[-10deg]">
                    <div className="flex flex-col items-end skew-x-[10deg]">
                        <span className="text-[10px] font-tech text-cyan-500 tracking-widest">DATA_SHARDS</span>
                        <span className="text-2xl font-bold text-white drop-shadow-[0_0_8px_rgba(0,243,255,0.6)]">
                            {Math.floor(stats.shards).toLocaleString('en-US')}
                        </span>
                    </div>
                    <div className="text-2xl skew-x-[10deg] animate-pulse">💎</div>
                </div>

                <div className="flex items-center gap-4 bg-black/40 backdrop-blur-md border-r-2 border-magenta-500 px-6 py-2 skew-x-[-10deg] mt-2">
                    <div className="flex flex-col items-end skew-x-[10deg]">
                        <span className="text-[10px] font-tech text-magenta-500 tracking-widest">HOSTILES_NEUTRALIZED</span>
                        <span className="text-2xl font-bold text-white drop-shadow-[0_0_8px_rgba(255,0,255,0.6)]">
                            {stats.killCount.toLocaleString('en-US')}
                        </span>
                    </div>
                    <div className="text-2xl skew-x-[10deg] text-magenta-400">💀</div>
                </div>
            </div>

            {/* Bottom Center: Skill */}
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center">
                <div className="relative w-24 h-24 flex items-center justify-center">
                    {/* Rotating Rings */}
                    <div className="absolute inset-0 border-2 border-cyan-900/30 rounded-full animate-[spin_10s_linear_infinite]" />
                    <div className="absolute inset-2 border border-cyan-500/20 rounded-full animate-[spin_5s_linear_infinite_reverse]" />

                    {/* Cooldown Progress */}
                    <svg className="absolute inset-0 w-full h-full -rotate-90">
                        <circle
                            cx="48"
                            cy="48"
                            r="40"
                            stroke="currentColor"
                            strokeWidth="4"
                            fill="transparent"
                            className="text-cyan-900/20"
                        />
                        <motion.circle
                            cx="48"
                            cy="48"
                            r="40"
                            stroke="currentColor"
                            strokeWidth="4"
                            fill="transparent"
                            className="text-cyan-400 drop-shadow-[0_0_5px_rgba(0,243,255,0.8)]"
                            strokeDasharray="251.2"
                            strokeDashoffset={251.2 * (1 - stats.skillCooldown)}
                        />
                    </svg>

                    {/* Skill Icon */}
                    <div className="text-3xl z-10 drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">
                        ⚡
                    </div>

                    {/* Key Hint */}
                    <div className="absolute -bottom-6 bg-cyan-900/80 px-2 py-0.5 rounded text-[10px] font-bold border border-cyan-500/50">
                        SPACE
                    </div>
                </div>
                <div className="mt-8 text-cyan-300/60 text-xs font-tech tracking-[0.2em] uppercase">
                    {stats.skillName || 'SYSTEM_IDLE'}
                </div>
            </div>

            {/* Bottom Left: Active Modules */}
            <div className="absolute bottom-8 left-8 flex gap-3">
                {stats.activePowerUps.map((powerUp, index) => (
                    <motion.div
                        key={index}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        className="w-14 h-14 bg-black/60 border border-cyan-500/30 skew-x-[-10deg] flex items-center justify-center relative group"
                    >
                        <div className="absolute inset-0 bg-cyan-400/5 group-hover:bg-cyan-400/10 transition-colors" />
                        <div className="text-2xl skew-x-[10deg] filter drop-shadow-[0_0_5px_rgba(0,243,255,0.5)]">
                            {powerUp === 'shield' && '🛡️'}
                            {powerUp === 'speed' && '👟'}
                            {powerUp === 'magnet' && '🧲'}
                            {powerUp === 'double_shards' && '💎'}
                            {powerUp === 'rapid_fire' && '🔫'}
                        </div>

                        {/* Corner Accents */}
                        <div className="absolute top-0 left-0 w-1 h-1 bg-cyan-500" />
                        <div className="absolute bottom-0 right-0 w-1 h-1 bg-cyan-500" />
                    </motion.div>
                ))}
            </div>
        </div>
    );
};
