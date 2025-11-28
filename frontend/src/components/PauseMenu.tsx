import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { NeonButton } from './ui/NeonButton';
import { CyberIcon } from './ui/CyberIcon';
import { Play, Settings, LogOut } from 'lucide-react';

interface PauseMenuProps {
    isOpen: boolean;
    onResume: () => void;
    onSettings: () => void;
    onQuit: () => void;
}

const PauseMenu: React.FC<PauseMenuProps> = ({ isOpen, onResume, onSettings, onQuit }) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-void/80 backdrop-blur-md"
                >
                    {/* CRT Switch-on Effect Line */}
                    <motion.div
                        initial={{ scaleX: 0, opacity: 1 }}
                        animate={{ scaleX: 1, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                        className="absolute inset-x-0 h-[2px] bg-white top-1/2 -translate-y-1/2 z-50 pointer-events-none"
                    />

                    <motion.div
                        initial={{ scaleY: 0, opacity: 0 }}
                        animate={{ scaleY: 1, opacity: 1 }}
                        exit={{ scaleY: 0, opacity: 0 }}
                        transition={{ delay: 0.1, duration: 0.3, type: "spring", damping: 25, stiffness: 300 }}
                        className="relative w-full max-w-md p-8 border border-neon-cyan bg-void/90 box-shadow-neon rounded-lg"
                    >
                        <h2 className="mb-8 text-4xl font-neon text-center text-white text-shadow-neon uppercase tracking-widest">
                            Paused
                        </h2>

                        <div className="flex flex-col gap-4">
                            <NeonButton onClick={onResume} fullWidth size="lg">
                                <CyberIcon icon={Play} className="w-5 h-5 mr-2" />
                                Resume
                            </NeonButton>

                            <NeonButton onClick={onSettings} variant="accent" fullWidth size="lg">
                                <CyberIcon icon={Settings} glowColor="purple" className="w-5 h-5 mr-2" />
                                Settings
                            </NeonButton>

                            <NeonButton onClick={onQuit} variant="danger" fullWidth size="lg">
                                <CyberIcon icon={LogOut} glowColor="magenta" className="w-5 h-5 mr-2" />
                                Quit Run
                            </NeonButton>
                        </div>

                        {/* Decorative Corner Accents */}
                        <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-neon-cyan" />
                        <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-neon-cyan" />
                        <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-neon-cyan" />
                        <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-neon-cyan" />
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export { PauseMenu };
