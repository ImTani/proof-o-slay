import React from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';
import { cn } from '../../lib/utils';
import { TechDecorator } from './TechDecorator';

interface HoloPanelProps extends HTMLMotionProps<"div"> {
    children: React.ReactNode;
    variant?: 'default' | 'alert' | 'success';
    showDecorators?: boolean;
    title?: string;
}

export const HoloPanel = React.forwardRef<HTMLDivElement, HoloPanelProps>(
    ({ className, children, variant = 'default', showDecorators = true, title, ...props }, ref) => {

        const variants = {
            default: "border-cyan-500/30 bg-black/30 backdrop-blur-md shadow-[0_0_15px_rgba(0,243,255,0.05)]",
            alert: "border-system-red/50 bg-system-red/10 shadow-[0_0_15px_rgba(255,42,42,0.1)]",
            success: "border-green-500/50 bg-green-500/10 shadow-[0_0_15px_rgba(34,197,94,0.1)]"
        };

        return (
            <motion.div
                ref={ref}
                className={cn(
                    "relative overflow-hidden p-6 transition-all duration-300",
                    "clip-path-chamfer", // We might need to add a utility for this or just use standard borders first
                    variants[variant],
                    className
                )}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                {...props}
            >
                {/* Scanline Overlay */}
                <div className="absolute inset-0 scanlines opacity-30 pointer-events-none" />

                {/* Header / Title Bar */}
                {title && (
                    <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-2">
                        <h3 className="text-lg font-neon tracking-wider text-cyan-400 drop-shadow-holo">
                            {title}
                        </h3>
                        <div className="flex gap-1">
                            <div className="w-2 h-2 bg-cyan-400/50" />
                            <div className="w-2 h-2 bg-cyan-400/30" />
                            <div className="w-2 h-2 bg-cyan-400/10" />
                        </div>
                    </div>
                )}

                {/* Decorators */}
                {showDecorators && (
                    <>
                        <TechDecorator position="top-left" />
                        <TechDecorator position="top-right" />
                        <TechDecorator position="bottom-left" />
                        <TechDecorator position="bottom-right" />
                    </>
                )}

                {/* Content */}
                <div className="relative z-10">
                    {children}
                </div>
            </motion.div>
        );
    }
);

HoloPanel.displayName = "HoloPanel";
