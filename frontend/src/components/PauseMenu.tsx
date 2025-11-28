import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, MotionConfig } from 'framer-motion';
import { NeonButton } from './ui/NeonButton';
import { CyberIcon } from './ui/CyberIcon';
import { GlassPanel } from './ui/GlassPanel';
import { ScanlineEffect } from './ui/ScanlineEffect';
import { SettingsModal } from './ui/SettingsModal';
import { Play, Settings, LogOut } from 'lucide-react';
import {
    SPRING_CONFIG,
    STIFF_SPRING,
    COLORS,
    SPACING,
    TYPOGRAPHY,
    HOVER_STATES,
    ACTIVE_STATES,
    STAGGER_DELAY
} from '../lib/designTokens';

interface PauseMenuProps {
    isOpen: boolean;
    onResume: () => void;
    onQuit: () => void;
}

const PauseMenu: React.FC<PauseMenuProps> = ({ isOpen, onResume, onQuit }) => {
    const [showSettings, setShowSettings] = useState(false);

    // Persist reduced motion preference
    const [reducedMotion, setReducedMotion] = useState(() => {
        return localStorage.getItem('reducedMotion') === 'true';
    });

    useEffect(() => {
        localStorage.setItem('reducedMotion', String(reducedMotion));
    }, [reducedMotion]);

    return (
        <MotionConfig reducedMotion={reducedMotion ? "always" : "never"}>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={SPRING_CONFIG}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xl"
                    >
                        {/* Grid texture overlay for consistency */}
                        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,243,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,243,255,0.02)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none" />

                        {/* CRT Switch-on Effect Line */}
                        <motion.div
                            initial={{ scaleX: 0, opacity: 1 }}
                            animate={{ scaleX: 1, opacity: 0 }}
                            transition={{ duration: 0.3, ease: "easeOut" }}
                            className="absolute inset-x-0 h-[2px] bg-white top-1/2 -translate-y-1/2 z-50 pointer-events-none"
                        />

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
                                    SYSTEM.HALT :: EXECUTION.PAUSED
                                </motion.div>

                                {/* Pause Title */}
                                <motion.h2
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ ...SPRING_CONFIG, delay: 0.15 }}
                                    className={`mb-8 text-4xl font-neon text-center text-white tracking-[0.3em] uppercase`}
                                    style={{
                                        textShadow: '0 0 10px rgba(0, 243, 255, 0.5), 0 0 20px rgba(0, 243, 255, 0.3)'
                                    }}
                                >
                                    Paused
                                </motion.h2>

                                {/* Menu Buttons with staggered entrance */}
                                <motion.div
                                    className={`flex flex-col ${SPACING.section}`}
                                    initial="hidden"
                                    animate="visible"
                                    variants={{
                                        visible: {
                                            transition: {
                                                staggerChildren: STAGGER_DELAY,
                                                delayChildren: 0.2
                                            }
                                        }
                                    }}
                                >
                                    <motion.div
                                        variants={{
                                            hidden: { opacity: 0, y: 10 },
                                            visible: { opacity: 1, y: 0, transition: SPRING_CONFIG }
                                        }}
                                    >
                                        <motion.div
                                            whileHover={HOVER_STATES.buttonScale}
                                            whileTap={ACTIVE_STATES.microScale}
                                        >
                                            <NeonButton onClick={onResume} fullWidth size="lg">
                                                <CyberIcon icon={Play} className="w-5 h-5 mr-2" />
                                                Resume
                                            </NeonButton>
                                        </motion.div>
                                    </motion.div>

                                    <motion.div
                                        variants={{
                                            hidden: { opacity: 0, y: 10 },
                                            visible: { opacity: 1, y: 0, transition: SPRING_CONFIG }
                                        }}
                                    >
                                        <motion.div
                                            whileHover={HOVER_STATES.buttonScale}
                                            whileTap={ACTIVE_STATES.microScale}
                                        >
                                            <NeonButton onClick={() => setShowSettings(true)} variant="accent" fullWidth size="lg">
                                                <CyberIcon icon={Settings} glowColor="purple" className="w-5 h-5 mr-2" />
                                                Settings
                                            </NeonButton>
                                        </motion.div>
                                    </motion.div>

                                    <motion.div
                                        variants={{
                                            hidden: { opacity: 0, y: 10 },
                                            visible: { opacity: 1, y: 0, transition: SPRING_CONFIG }
                                        }}
                                    >
                                        <motion.div
                                            whileHover={HOVER_STATES.buttonScale}
                                            whileTap={ACTIVE_STATES.microScale}
                                        >
                                            <NeonButton onClick={onQuit} variant="danger" fullWidth size="lg">
                                                <CyberIcon icon={LogOut} glowColor="magenta" className="w-5 h-5 mr-2" />
                                                Quit Run
                                            </NeonButton>
                                        </motion.div>
                                    </motion.div>
                                </motion.div>

                                {/* System Footer */}
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.4 }}
                                    className={`${TYPOGRAPHY.tech.label} text-white/30 text-center flex items-center justify-center ${SPACING.inline} mt-6 pt-6 border-t border-${COLORS.system.border.subtle}`}
                                >
                                    <motion.div
                                        className={`w-1 h-1 bg-${COLORS.system.primary} rounded-full`}
                                        animate={{ opacity: [0.3, 1, 0.3] }}
                                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                                    />
                                    PAUSE.MENU :: AWAITING.INPUT
                                </motion.div>
                            </GlassPanel>
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
        </MotionConfig>
    );
};

export { PauseMenu };
