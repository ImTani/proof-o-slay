import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassPanel } from './GlassPanel';
import { NeonButton } from './NeonButton';
import { X, Eye, EyeOff } from 'lucide-react';
import { CyberIcon } from './CyberIcon';
import { ScanlineEffect } from './ScanlineEffect';
import {
    SPRING_CONFIG,
    STIFF_SPRING,
    COLORS,
    SPACING,
    TYPOGRAPHY,
    HOVER_STATES,
    ACTIVE_STATES,
    STAGGER_DELAY
} from '../../lib/designTokens';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    reducedMotion: boolean;
    setReducedMotion: (value: boolean) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
    isOpen,
    onClose,
    reducedMotion,
    setReducedMotion
}) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xl"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={SPRING_CONFIG}
                >
                    {/* Grid texture overlay for consistency */}
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(0,243,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,243,255,0.02)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none" />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        transition={SPRING_CONFIG}
                        className="w-full max-w-md relative z-10"
                    >
                        <GlassPanel className="relative" showDecorators={true}>
                            {/* Scanline Effect */}
                            <ScanlineEffect type="static" opacity={0.03} />

                            {/* Tech Decorator Header */}
                            <motion.div
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ ...SPRING_CONFIG, delay: 0.1 }}
                                className={`${TYPOGRAPHY.tech.decorator} text-${COLORS.system.primarySubtle} mb-6 flex items-center ${SPACING.inline}`}
                            >
                                <motion.span
                                    className={`w-1 h-1 bg-${COLORS.system.primary} rounded-full`}
                                    animate={{ opacity: [0.3, 1, 0.3] }}
                                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                                />
                                SYSTEM.CONFIG :: USER.PREFERENCES
                            </motion.div>

                            {/* Close Button */}
                            <motion.button
                                onClick={onClose}
                                className={`absolute top-4 right-4 text-${COLORS.system.primary} p-2 border border-${COLORS.system.border.subtle} rounded-sm bg-black/20`}
                                whileHover={{
                                    scale: 1.1,
                                    borderColor: 'rgba(6, 182, 212, 0.4)',
                                    backgroundColor: 'rgba(6, 182, 212, 0.1)',
                                    transition: STIFF_SPRING
                                }}
                                whileTap={ACTIVE_STATES.microScale}
                                initial={{ opacity: 0, rotate: -90 }}
                                animate={{ opacity: 1, rotate: 0 }}
                                transition={{ ...SPRING_CONFIG, delay: 0.2 }}
                            >
                                <X size={20} />
                            </motion.button>

                            {/* Content with explicit gaps */}
                            <div className={`flex flex-col ${SPACING.section} py-4`}>
                                {/* Visual Processing Section */}
                                <motion.div
                                    className={`flex flex-col ${SPACING.item}`}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ ...SPRING_CONFIG, delay: 0.15 }}
                                >
                                    {/* Section Header */}
                                    <h4 className={`${TYPOGRAPHY.body.small} font-mono text-${COLORS.system.primaryMuted} uppercase tracking-widest border-b border-${COLORS.system.border.subtle} pb-2`}>
                                        Visual Processing
                                    </h4>

                                    {/* Reduced Motion Setting Row */}
                                    <motion.div
                                        className={`flex items-center justify-between ${SPACING.item} pt-2`}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ ...SPRING_CONFIG, delay: 0.2 }}
                                    >
                                        {/* Icon + Label */}
                                        <motion.div
                                            className={`flex items-center ${SPACING.compact}`}
                                            whileHover={{
                                                x: 2,
                                                transition: STIFF_SPRING
                                            }}
                                        >
                                            <motion.div
                                                whileHover={{
                                                    scale: 1.15,
                                                    rotate: [0, -5, 5, 0],
                                                    transition: {
                                                        ...STIFF_SPRING,
                                                        rotate: { duration: 0.4 }
                                                    }
                                                }}
                                            >
                                                <CyberIcon
                                                    icon={reducedMotion ? EyeOff : Eye}
                                                    glowColor="cyan"
                                                    className="w-6 h-6"
                                                />
                                            </motion.div>
                                            <div className="flex flex-col gap-1">
                                                <div className={`text-white font-bold ${TYPOGRAPHY.body.normal}`}>
                                                    Reduced Motion
                                                </div>
                                                <div className={`${TYPOGRAPHY.body.small} text-white/60`}>
                                                    Minimize interface animations
                                                </div>
                                            </div>
                                        </motion.div>

                                        {/* Toggle Switch */}
                                        <motion.button
                                            onClick={() => setReducedMotion(!reducedMotion)}
                                            className={`
                                                relative w-12 h-6 rounded-full border
                                                ${reducedMotion
                                                    ? `bg-${COLORS.system.primary} border-${COLORS.system.primary}`
                                                    : `bg-white/10 border-${COLORS.system.border.normal}`
                                                }
                                            `}
                                            whileHover={{
                                                scale: 1.05,
                                                borderColor: 'rgba(6, 182, 212, 0.5)',
                                                boxShadow: '0 0 15px rgba(6, 182, 212, 0.3)',
                                                transition: STIFF_SPRING
                                            }}
                                            whileTap={ACTIVE_STATES.microScale}
                                        >
                                            {/* Hover Scanline */}
                                            <ScanlineEffect type="animated" color="cyan-500" opacity={0.2} duration={1.5} />

                                            {/* Toggle Knob */}
                                            <motion.div
                                                className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-md"
                                                animate={{
                                                    x: reducedMotion ? 24 : 0,
                                                    boxShadow: reducedMotion
                                                        ? '0 0 10px rgba(6, 182, 212, 0.5)'
                                                        : '0 2px 4px rgba(0, 0, 0, 0.2)'
                                                }}
                                                transition={STIFF_SPRING}
                                            />
                                        </motion.button>
                                    </motion.div>
                                </motion.div>

                                {/* Action Button Section */}
                                <motion.div
                                    className={`pt-4 border-t border-${COLORS.system.border.subtle}`}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ ...SPRING_CONFIG, delay: 0.25 }}
                                >
                                    <motion.div
                                        whileHover={HOVER_STATES.buttonScale}
                                        whileTap={ACTIVE_STATES.microScale}
                                    >
                                        <NeonButton
                                            variant="primary"
                                            fullWidth
                                            onClick={onClose}
                                            className="tracking-widest"
                                        >
                                            APPLY CHANGES
                                        </NeonButton>
                                    </motion.div>
                                </motion.div>
                            </div>

                            {/* System Footer */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.3 }}
                                className={`${TYPOGRAPHY.tech.label} text-white/30 text-center flex items-center justify-center ${SPACING.inline} mt-4`}
                            >
                                <motion.div
                                    className={`w-1 h-1 bg-${COLORS.system.primary} rounded-full`}
                                    animate={{ opacity: [0.3, 1, 0.3] }}
                                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                                />
                                SETTINGS.OVERRIDE :: CONFIG.ACTIVE
                            </motion.div>
                        </GlassPanel>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
