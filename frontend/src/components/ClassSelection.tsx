import { useState } from 'react';
import { motion } from 'framer-motion';
import { NeonButton } from './ui/NeonButton';
import { CyberIcon } from './ui/CyberIcon';
import { ScanlineEffect } from './ui/ScanlineEffect';
import { Sword, Zap, Target } from 'lucide-react';
import { SPRING_CONFIG, STIFF_SPRING, HOVER_STATES, ACTIVE_STATES, COLORS, SPACING, TYPOGRAPHY, STAGGER_DELAY } from '../lib/designTokens';

type ClassName = 'WARRIOR' | 'MAGE' | 'ROGUE';

interface ClassInfo {
    name: string;
    health: number;
    speed: number;
    damage: number;
    skillName: string;
    skillDescription: string;
    description: string;
    color: string;
    icon: any;
    code: string;
}

const CLASS_DATA: Record<ClassName, ClassInfo> = {
    WARRIOR: {
        name: 'Vanguard',
        health: 120,
        speed: 100,
        damage: 100,
        skillName: 'Kinetic Dash',
        skillDescription: 'Phase shift forward, neutralizing damage for 0.5s',
        description: 'Heavy assault unit with reinforced plating.',
        color: '#ef4444', // Red
        icon: Sword,
        code: 'UNIT-01',
    },
    MAGE: {
        name: 'Cyber-Mage',
        health: 80,
        speed: 90,
        damage: 130,
        skillName: 'EMP Nova',
        skillDescription: 'Discharge 150 energy damage in radius',
        description: 'High-output energy manipulator.',
        color: '#a855f7', // Purple
        icon: Zap,
        code: 'UNIT-02',
    },
    ROGUE: {
        name: 'Ghost',
        health: 100,
        speed: 120,
        damage: 110,
        skillName: 'Stealth Field',
        skillDescription: 'Absorb next 100 damage, active for 6s',
        description: 'Stealth operative with high mobility.',
        color: '#00f3ff', // Cyan
        icon: Target,
        code: 'UNIT-03',
    },
};

interface ClassSelectionProps {
    onSelect: (className: ClassName) => void;
}

export function ClassSelection({ onSelect }: ClassSelectionProps) {
    const [selectedClass, setSelectedClass] = useState<ClassName | null>(null);
    const [hoveredClass, setHoveredClass] = useState<ClassName | null>(null);

    return (
        <div className={`w-full h-full flex flex-col items-center justify-center ${SPACING.scene} bg-transparent relative overflow-hidden font-neon`}>
            {/* Background Grid */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(0,243,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(0,243,255,0.05)_1px,transparent_1px)] bg-[size:40px_40px] opacity-20" />

            {/* Tech Decorator Above Title */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={SPRING_CONFIG}
                className={`${TYPOGRAPHY.tech.decorator} text-cyan-500/30 z-10 flex items-center ${SPACING.inline} mb-4`}
            >
                <motion.span
                    className="w-1 h-1 bg-cyan-400 rounded-full"
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                />
                OPERATIVE.SELECTION :: DEPLOYMENT.CONFIG
            </motion.div>

            {/* Title Section */}
            <motion.div
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={SPRING_CONFIG}
                className="z-10 text-center mb-12"
            >
                <h1 className={`${TYPOGRAPHY.heading.hero} text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]`}>
                    SELECT OPERATIVE
                </h1>
                <p className={`text-${COLORS.system.primaryMuted} font-mono ${TYPOGRAPHY.tech.label} mt-3`}>
                    Initialize Combat Protocol
                </p>
            </motion.div>

            {/* Class Cards Grid */}
            <div className={`flex ${SPACING.card} mb-12 flex-wrap justify-center z-10`}>
                {(Object.keys(CLASS_DATA) as ClassName[]).map((className, index) => {
                    const classInfo = CLASS_DATA[className];
                    const isSelected = selectedClass === className;
                    const isHovered = hoveredClass === className;

                    return (
                        <motion.div
                            key={className}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ ...SPRING_CONFIG, delay: 0.2 + index * STAGGER_DELAY }}
                            whileHover={!isSelected ? {
                                y: -6,
                                scale: 1.02,
                                transition: STIFF_SPRING
                            } : {
                                scale: 1.05,
                                transition: STIFF_SPRING
                            }}
                            whileTap={ACTIVE_STATES.microScale}
                            onClick={() => setSelectedClass(className)}
                            onMouseEnter={() => setHoveredClass(className)}
                            onMouseLeave={() => setHoveredClass(null)}
                            className="relative w-72 h-[480px] cursor-pointer group"
                        >
                            {/* Card Container with Direct Border Styling */}
                            <motion.div
                                className={`
                                    h-full flex flex-col items-center relative bg-black/40 backdrop-blur-md border rounded-sm overflow-hidden
                                    ${isSelected
                                        ? classInfo.color === '#00f3ff'
                                            ? 'border-cyan-400 shadow-[0_0_25px_rgba(6,182,212,0.4)]'
                                            : classInfo.color === '#ef4444'
                                                ? 'border-red-400 shadow-[0_0_25px_rgba(239,68,68,0.4)]'
                                                : 'border-purple-400 shadow-[0_0_25px_rgba(168,85,247,0.4)]'
                                        : 'border-white/10 hover:border-cyan-500/50'
                                    }
                                    transition-all duration-300
                                `}
                            >
                                {/* Background Grid Pattern */}
                                <div className="absolute inset-0 bg-[linear-gradient(rgba(0,243,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,243,255,0.02)_1px,transparent_1px)] bg-[size:20px_20px]" />

                                {/* Scanline Effect on Hover */}
                                <ScanlineEffect type="animated" color="cyan-500" opacity={0.15} duration={1.5} />

                                {/* Selection Glow Overlay */}
                                {isSelected && (
                                    <motion.div
                                        layoutId="class-selection"
                                        className="absolute inset-0 bg-cyan-500/5 pointer-events-none"
                                        transition={STIFF_SPRING}
                                    />
                                )}

                                {/* Card Content Container with Padding */}
                                <div className="relative z-10 w-full flex flex-col flex-1 p-4">
                                    {/* Top Row: Unit Code + Selected Badge */}
                                    <div className="w-full flex items-start justify-between mb-4">
                                        <div className={`${TYPOGRAPHY.tech.label} text-${COLORS.system.primarySubtle}`}>
                                            {classInfo.code}
                                        </div>

                                        {/* SELECTED Badge */}
                                        {isSelected && (
                                            <motion.div
                                                initial={{ scale: 0, rotate: -10 }}
                                                animate={{ scale: 1, rotate: 0 }}
                                                transition={STIFF_SPRING}
                                                className={`px-2 py-1 bg-${COLORS.system.primary}/20 text-${COLORS.system.primary} ${TYPOGRAPHY.tech.label} border border-${COLORS.system.primary}/40 rounded`}
                                            >
                                                <div className={`flex items-center ${SPACING.inline}`}>
                                                    <motion.span
                                                        className={`w-1 h-1 bg-${COLORS.system.primary} rounded-full`}
                                                        animate={{ opacity: [0.3, 1, 0.3] }}
                                                        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                                                    />
                                                    SELECTED
                                                </div>
                                            </motion.div>
                                        )}
                                    </div>

                                    {/* Icon / Avatar */}
                                    <motion.div
                                        initial={{ scale: 0.8, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        transition={{ ...SPRING_CONFIG, delay: 0.3 + index * STAGGER_DELAY }}
                                        whileHover={HOVER_STATES.iconWiggle}
                                        className="relative my-4 flex justify-center items-center w-20 h-20 mx-auto"
                                    >
                                        <div className="absolute inset-0 bg-current blur-2xl opacity-20 rounded-full" style={{ color: classInfo.color }} />
                                        <div className="relative z-10 drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">
                                            <CyberIcon icon={classInfo.icon} className="w-16 h-16" glowColor={classInfo.color === '#00f3ff' ? 'cyan' : classInfo.color === '#ef4444' ? 'red' : 'purple'} />
                                        </div>
                                    </motion.div>

                                    {/* Class Name */}
                                    <motion.h2
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ ...SPRING_CONFIG, delay: 0.4 + index * STAGGER_DELAY }}
                                        whileHover={HOVER_STATES.slideRight}
                                        className={`${TYPOGRAPHY.heading.medium} uppercase text-center`}
                                        style={{ color: isSelected || isHovered ? classInfo.color : '#fff' }}
                                    >
                                        {classInfo.name}
                                    </motion.h2>

                                    {/* Divider */}
                                    <motion.div
                                        initial={{ scaleX: 0 }}
                                        animate={{ scaleX: 1 }}
                                        transition={{ ...SPRING_CONFIG, delay: 0.45 + index * STAGGER_DELAY }}
                                        className={`h-px w-12 bg-gradient-to-r from-transparent via-white/30 to-transparent my-3 mx-auto`}
                                    />

                                    {/* Description */}
                                    <p className={`${TYPOGRAPHY.body.small} text-${COLORS.system.primaryMuted} text-center font-mono leading-relaxed h-12 flex items-center justify-center mb-4`}>
                                        {classInfo.description}
                                    </p>

                                    {/* Stats Grid */}
                                    <div className={`w-full flex flex-col ${SPACING.compact} bg-white/5 p-4 rounded border border-white/10`}>
                                        <StatBar label="VIT" value={classInfo.health} max={150} color={classInfo.color} delay={0.5 + index * STAGGER_DELAY} />
                                        <StatBar label="PWR" value={classInfo.damage} max={150} color={classInfo.color} delay={0.55 + index * STAGGER_DELAY} />
                                        <StatBar label="SPD" value={classInfo.speed} max={150} color={classInfo.color} delay={0.6 + index * STAGGER_DELAY} />
                                    </div>
                                </div>

                                {/* Tech Footer */}
                                <div className="relative z-10 w-full mt-auto px-4 py-3 bg-black/20 border-t border-white/10">
                                    <span className={`${TYPOGRAPHY.tech.label} text-${COLORS.system.primarySubtle} flex items-center ${SPACING.inline}`}>
                                        <span className="w-1 h-1 bg-cyan-500/40 rounded-full" />
                                        COMBAT.CLASS :: {className}
                                    </span>
                                </div>
                            </motion.div>
                        </motion.div>
                    );
                })}
            </div>

            {/* Confirm Button */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: selectedClass ? 1 : 0, y: selectedClass ? 0 : 20 }}
                transition={SPRING_CONFIG}
                whileHover={selectedClass ? HOVER_STATES.buttonScale : undefined}
                whileTap={selectedClass ? ACTIVE_STATES.microScale : undefined}
                className="z-20"
            >
                <NeonButton
                    onClick={() => selectedClass && onSelect(selectedClass)}
                    disabled={!selectedClass}
                    size="lg"
                    className={`px-16 py-4 ${TYPOGRAPHY.heading.small}`}
                >
                    DEPLOY UNIT
                </NeonButton>
            </motion.div>

            {/* System Footer */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9 }}
                className={`${TYPOGRAPHY.tech.label} text-white/30 text-center flex items-center justify-center ${SPACING.inline} mt-8 z-10`}
            >
                <motion.div
                    className={`w-1 h-1 bg-${COLORS.system.primary} rounded-full`}
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                />
                SECURE CONNECTION :: DEPLOYMENT PROTOCOL ACTIVE
            </motion.div>
        </div>
    );
}

function StatBar({ label, value, max, color, delay }: { label: string; value: number; max: number; color: string; delay: number }) {
    const percent = (value / max) * 100;
    return (
        <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ ...SPRING_CONFIG, delay }}
            className={`flex items-center ${SPACING.compact} ${TYPOGRAPHY.tech.label}`}
        >
            <span className={`w-8 text-${COLORS.system.primaryMuted}`}>{label}</span>
            <div className="flex-1 h-1.5 bg-black/50 overflow-hidden rounded-full">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percent}%` }}
                    transition={{ ...SPRING_CONFIG, delay: delay + 0.1 }}
                    className="h-full"
                    style={{ backgroundColor: color, boxShadow: `0 0 8px ${color}` }}
                />
            </div>
            <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: delay + 0.2 }}
                className={`w-8 text-right text-${COLORS.system.primaryMuted}`}
            >
                {value}
            </motion.span>
        </motion.div>
    );
}
