import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { CyberIcon } from './CyberIcon';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface NeonModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    variant?: 'primary' | 'secondary' | 'accent' | 'danger' | 'warning' | 'success';
    className?: string;
}

export const NeonModal = ({ isOpen, onClose, title, children, variant = 'primary', className }: NeonModalProps) => {

    const variants = {
        primary: {
            border: "border-neon-cyan/30",
            shadow: "shadow-[0_0_50px_rgba(0,243,255,0.2)]",
            header: "bg-gradient-to-r from-neon-cyan/20 to-transparent border-neon-cyan/20",
            text: "text-neon-cyan",
            dot: "bg-neon-cyan shadow-[0_0_10px_rgba(0,243,255,0.8)]"
        },
        secondary: {
            border: "border-neon-magenta/30",
            shadow: "shadow-[0_0_50px_rgba(255,0,255,0.2)]",
            header: "bg-gradient-to-r from-neon-magenta/20 to-transparent border-neon-magenta/20",
            text: "text-neon-magenta",
            dot: "bg-neon-magenta shadow-[0_0_10px_rgba(255,0,255,0.8)]"
        },
        accent: {
            border: "border-electric-purple/30",
            shadow: "shadow-[0_0_50px_rgba(112,0,255,0.2)]",
            header: "bg-gradient-to-r from-electric-purple/20 to-transparent border-electric-purple/20",
            text: "text-electric-purple",
            dot: "bg-electric-purple shadow-[0_0_10px_rgba(112,0,255,0.8)]"
        },
        danger: {
            border: "border-red-500/30",
            shadow: "shadow-[0_0_50px_rgba(239,68,68,0.2)]",
            header: "bg-gradient-to-r from-red-500/20 to-transparent border-red-500/20",
            text: "text-red-500",
            dot: "bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)]"
        },
        warning: {
            border: "border-yellow-500/30",
            shadow: "shadow-[0_0_50px_rgba(234,179,8,0.2)]",
            header: "bg-gradient-to-r from-yellow-500/20 to-transparent border-yellow-500/20",
            text: "text-yellow-500",
            dot: "bg-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.8)]"
        },
        success: {
            border: "border-green-500/30",
            shadow: "shadow-[0_0_50px_rgba(34,197,94,0.2)]",
            header: "bg-gradient-to-r from-green-500/20 to-transparent border-green-500/20",
            text: "text-green-500",
            dot: "bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.8)]"
        }
    };

    const currentVariant = variants[variant];

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-[rgba(0,0,0,0.4)] font-neon p-4"
                >
                    {/* Background Grid Overlay */}
                    <div className="absolute inset-0 bg-[url('/assets/grid.png')] opacity-10 pointer-events-none" />

                    <motion.div
                        initial={{ scale: 0.9, y: 20 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 0.9, y: 20, opacity: 0 }}
                        className={cn(
                            "relative w-full max-w-lg bg-black/60 backdrop-blur-xl border rounded-xl overflow-hidden",
                            currentVariant.border,
                            currentVariant.shadow,
                            className
                        )}
                    >
                        {/* Holographic Header */}
                        <div className={cn(
                            "p-6 border-b flex justify-between items-center",
                            currentVariant.header
                        )}>
                            <div className="flex items-center gap-3">
                                <div className={cn("w-3 h-3 rounded-full animate-pulse", currentVariant.dot)} />
                                <h2 className={cn("text-2xl font-bold tracking-widest uppercase", currentVariant.text)}>
                                    {title}
                                </h2>
                            </div>
                            <motion.button
                                onClick={onClose}
                                whileHover={{
                                    scale: 1.1,
                                    rotate: 90,
                                    transition: { type: "spring", stiffness: 400, damping: 25 }
                                }}
                                whileTap={{
                                    scale: 0.9,
                                    transition: { type: "spring", stiffness: 500, damping: 30 }
                                }}
                                className={cn(
                                    "transition-colors hover:text-white",
                                    currentVariant.text,
                                    "opacity-50 hover:opacity-100"
                                )}
                            >
                                <CyberIcon icon={X} className="w-6 h-6" />
                            </motion.button>
                        </div>

                        <div className="p-8">
                            {children}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
