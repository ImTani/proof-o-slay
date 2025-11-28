import React from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Utility for merging tailwind classes
function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface GlassPanelProps extends HTMLMotionProps<"div"> {
    children: React.ReactNode;
    className?: string;
    variant?: 'default' | 'thin' | 'heavy' | 'chamfered' | 'rectangular';
    showDecorators?: boolean;
}

export const GlassPanel = React.forwardRef<HTMLDivElement, GlassPanelProps>(
    ({ children, className, variant = 'default', showDecorators = true, ...props }, ref) => {

        // FUI Standards:
        // Border: 1px solid border-white/10
        // Glow: shadow-[inset_0_0_20px_rgba(0,255,255,0.05)]
        // Texture: backdrop-blur-xl bg-black/40
        const baseStyles = "relative overflow-hidden bg-black/40 backdrop-blur-xl border border-white/10 shadow-[inset_0_0_20px_rgba(0,243,255,0.05)] p-6";

        const variants = {
            default: "rounded-sm",
            thin: "bg-black/20 backdrop-blur-md border-white/5",
            heavy: "bg-black/60 backdrop-blur-2xl border-white/20 shadow-[inset_0_0_30px_rgba(0,243,255,0.1)]",
            chamfered: "clip-path-chamfer bg-black/40 backdrop-blur-xl border-none",
            rectangular: "rounded-none",
        };

        // Custom chamfer implementation using clip-path if variant is chamfered
        const isChamfered = variant === 'chamfered';
        const chamferStyle = isChamfered ? { clipPath: 'polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)' } : {};

        return (
            <motion.div
                ref={ref}
                layout
                style={chamferStyle}
                className={cn(baseStyles, variants[variant], className)}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ type: "spring", stiffness: 350, damping: 30 }}
                {...props}
            >
                {/* Tech Decorators */}
                {showDecorators && (
                    <>
                        {/* Top Left Bracket */}
                        <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-white/30 pointer-events-none" />

                        {/* Top Right Bracket */}
                        <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-white/30 pointer-events-none" />

                        {/* Bottom Left Bracket */}
                        <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-white/30 pointer-events-none" />

                        {/* Bottom Right Bracket */}
                        <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-white/30 pointer-events-none" />

                        {/* Optional: Center Tick for 'heavy' variant */}
                        {variant === 'heavy' && (
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4 h-[1px] bg-cyan-500/50 pointer-events-none" />
                        )}
                    </>
                )}

                {children}
            </motion.div>
        );
    }
);

GlassPanel.displayName = 'GlassPanel';
