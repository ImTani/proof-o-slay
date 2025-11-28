import { useState } from 'react';
import { motion } from 'framer-motion';
import { NeonButton } from './ui/NeonButton';
import { NeonCard } from './ui/NeonCard';
import { CyberIcon } from './ui/CyberIcon';
import { Sword, Zap, Target } from 'lucide-react';

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
        <div className="w-full h-full flex flex-col items-center justify-center p-10 bg-transparent relative overflow-hidden font-neon">
            {/* Background Grid */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(0,243,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(0,243,255,0.05)_1px,transparent_1px)] bg-[size:40px_40px] opacity-20" />

            <motion.div
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="z-10 text-center mb-16"
            >
                <h1 className="text-5xl md:text-7xl font-bold text-white mb-4 tracking-widest drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">
                    SELECT OPERATIVE
                </h1>
                <p className="text-cyan-500/60 font-tech tracking-[0.5em] text-sm uppercase">
                    Initialize Combat Protocol
                </p>
            </motion.div>

            <div className="flex gap-8 mb-16 flex-wrap justify-center z-10">
                {(Object.keys(CLASS_DATA) as ClassName[]).map((className, index) => {
                    const classInfo = CLASS_DATA[className];
                    const isSelected = selectedClass === className;
                    const isHovered = hoveredClass === className;

                    return (
                        <motion.div
                            key={className}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 + index * 0.1 }}
                            onClick={() => setSelectedClass(className)}
                            onMouseEnter={() => setHoveredClass(className)}
                            onMouseLeave={() => setHoveredClass(null)}
                            className={`
                                relative w-72 h-[450px] cursor-pointer transition-all duration-300 group
                                ${isSelected ? 'scale-105' : 'hover:scale-102'}
                            `}
                        >
                            <NeonCard
                                className={`h-full flex flex-col items-center relative z-10 transition-all duration-300 ${isSelected ? 'border-opacity-100' : 'border-opacity-50 hover:border-opacity-80'}`}
                                variant={classInfo.color === '#00f3ff' ? 'primary' : classInfo.color === '#ef4444' ? 'danger' : 'accent'}
                            >
                                <div className="text-xs font-tech tracking-widest opacity-50 mb-8 w-full text-right">
                                    {classInfo.code}
                                </div>

                                {/* Icon / Avatar */}
                                <div className="relative mb-8 group-hover:scale-110 transition-transform duration-500 flex justify-center items-center w-20 h-20 mx-auto">
                                    <div className="absolute inset-0 bg-current blur-2xl opacity-20 rounded-full" style={{ color: classInfo.color }} />
                                    <div className="text-6xl relative z-10 drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">
                                        <CyberIcon icon={classInfo.icon} className="w-16 h-16" glowColor={classInfo.color === '#00f3ff' ? 'cyan' : classInfo.color === '#ef4444' ? 'red' : 'purple'} />
                                    </div>
                                </div>

                                <h2
                                    className="text-2xl font-bold mb-2 uppercase tracking-wider transition-colors"
                                    style={{ color: isSelected || isHovered ? classInfo.color : '#fff' }}
                                >
                                    {classInfo.name}
                                </h2>

                                <div className="h-px w-12 bg-white/20 mb-6" />

                                <p className="text-sm text-gray-400 text-center font-tech leading-relaxed h-16 flex items-center justify-center">
                                    {classInfo.description}
                                </p>

                                {/* Stats Grid */}
                                <div className="w-full space-y-3 mt-6 bg-white/5 p-4 rounded border border-white/5">
                                    <StatBar label="VIT" value={classInfo.health} max={150} color={classInfo.color} />
                                    <StatBar label="PWR" value={classInfo.damage} max={150} color={classInfo.color} />
                                    <StatBar label="SPD" value={classInfo.speed} max={150} color={classInfo.color} />
                                </div>
                            </NeonCard>
                        </motion.div>
                    );
                })}
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: selectedClass ? 1 : 0, y: selectedClass ? 0 : 20 }}
                className="z-20"
            >
                <NeonButton
                    onClick={() => selectedClass && onSelect(selectedClass)}
                    disabled={!selectedClass}
                    size="lg"
                    className="px-16 py-4 text-xl tracking-widest"
                >
                    DEPLOY UNIT
                </NeonButton>
            </motion.div>
        </div>
    );
}

function StatBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
    const percent = (value / max) * 100;
    return (
        <div className="flex items-center gap-3 text-[10px] font-tech">
            <span className="w-6 text-gray-500">{label}</span>
            <div className="flex-1 h-1.5 bg-black/50 overflow-hidden">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percent}%` }}
                    className="h-full"
                    style={{ backgroundColor: color, boxShadow: `0 0 5px ${color}` }}
                />
            </div>
            <span className="w-6 text-right text-gray-500">{value}</span>
        </div>
    );
}
