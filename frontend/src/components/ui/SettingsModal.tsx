import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HoloPanel } from './HoloPanel';
import { NeonButton } from './NeonButton';
import { X, Eye, EyeOff } from 'lucide-react';
import { CyberIcon } from './CyberIcon';

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
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="w-full max-w-md"
                    >
                        <HoloPanel title="SYSTEM CONFIGURATION" className="bg-black/60 border-cyan-500">
                            <button
                                onClick={onClose}
                                className="absolute top-4 right-4 text-holo-blue hover:text-white transition-colors"
                            >
                                <X size={24} />
                            </button>

                            <div className="space-y-8 py-4">
                                <div className="space-y-4">
                                    <h4 className="text-sm font-mono text-cyan-500/60 uppercase tracking-widest border-b border-white/10 pb-2">
                                        Visual Processing
                                    </h4>

                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <CyberIcon
                                                icon={reducedMotion ? EyeOff : Eye}
                                                glowColor="cyan"
                                                className="w-6 h-6"
                                            />
                                            <div>
                                                <div className="text-white font-bold">Reduced Motion</div>
                                                <div className="text-xs text-white/60">Minimize interface animations</div>
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => setReducedMotion(!reducedMotion)}
                                            className={`
                                                relative w-12 h-6 rounded-full transition-colors duration-300
                                                ${reducedMotion ? 'bg-cyan-400' : 'bg-white/10'}
                                            `}
                                        >
                                            <motion.div
                                                className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-md"
                                                animate={{ x: reducedMotion ? 24 : 0 }}
                                                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                            />
                                        </button>
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-white/10">
                                    <NeonButton variant="primary" fullWidth onClick={onClose}>
                                        APPLY CHANGES
                                    </NeonButton>
                                </div>
                            </div>
                        </HoloPanel>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
