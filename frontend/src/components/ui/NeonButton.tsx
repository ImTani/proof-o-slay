import React from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useCursor } from '../../context/CursorContext';

// Utility for merging tailwind classes
function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

/**
 * NeonButton Component
 * Cyberpunk-styled button with tech corners, neon glow effects, and scanlines
 * 
 * VARIANT SEMANTICS:
 * - `primary`: Default CTAs and main actions (cyan) - Use for standard interactions like "Purchase", "Confirm", "Continue"
 * - `secondary`: Supporting actions (white) - Use for alternative actions like "Cancel", "Back"
 * - `accent`: Special event CTAs (purple) - Use sparingly for unique features like JackpotScene "Enter Event"
 * - `success`: Positive confirmations and commitment actions (green) - Use for high-stakes positive actions like "Stake", "Upgrade"
 * - `warning`: Caution actions requiring attention (yellow) - Use when action needs extra consideration like "Unstake"
 * - `danger`: Destructive or irreversible actions (red) - Use for actions that cannot be undone
 * - `ghost`: Subtle actions without strong border (transparent) - Use for tertiary actions
 * 
 * USAGE GUIDELINES:
 * - Default to `primary` for most CTAs throughout the Hub
 * - Use `success` for staking, upgrading, purchasing (positive commitment)
 * - Use `accent` only for special events or differentiated experiences
 * - Use `warning` when user should pause before acting
 * - Avoid mixing too many variant colors on the same screen
 * 
 * EXAMPLES:
 * - ConsumablesShop: `variant="primary"` for "Purchase" button
 * - StakingScene: `variant="success"` for "Initiate Stake" (high-stakes action)
 * - JackpotScene: `variant="accent"` for "Enter Jackpot Run" (special event)
 * - ForgeUI: Dynamic variant based on state (success when converting, warning when insufficient)
 */
interface NeonButtonProps extends Omit<HTMLMotionProps<"button">, "children"> {
    children: React.ReactNode;
    variant?: 'primary' | 'secondary' | 'accent' | 'danger' | 'warning' | 'success' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    fullWidth?: boolean;
}

const NeonButton = React.forwardRef<HTMLButtonElement, NeonButtonProps>(
    ({ className, children, variant = 'primary', size = 'md', fullWidth = false, ...props }, ref) => {
        const { setVariant } = useCursor();

        const variants = {
            primary: "text-cyan-400 border-cyan-400/50 hover:bg-cyan-400/10 hover:border-cyan-400",
            secondary: "text-white border-white/50 hover:bg-white/10 hover:border-white",
            accent: "text-purple-500 border-purple-500/50 hover:bg-purple-500/10 hover:border-purple-500",
            danger: "text-system-red border-system-red/50 hover:bg-system-red/10 hover:border-system-red",
            warning: "text-yellow-500 border-yellow-500/50 hover:bg-yellow-500/10 hover:border-yellow-500",
            success: "text-green-500 border-green-500/50 hover:bg-green-500/10 hover:border-green-500",
            ghost: "border-transparent text-white/60 hover:text-white hover:bg-white/5"
        };

        const sizes = {
            sm: "px-4 py-1 text-sm",
            md: "px-8 py-3 text-base",
            lg: "px-10 py-4 text-lg"
        };

        return (
            <motion.button
                ref={ref}
                className={cn(
                    "relative group overflow-hidden border bg-transparent font-neon uppercase tracking-widest transition-all duration-300 focus:outline-none select-none",
                    "disabled:opacity-50 disabled:cursor-not-allowed",
                    // Chamfered corners via clip-path (simulated with pseudo-elements or just CSS if supported, using simple border for now but adding tech markers)
                    variants[variant],
                    sizes[size],
                    fullWidth ? "w-full" : "",
                    className
                )}
                onMouseEnter={() => setVariant('selection')}
                onMouseLeave={() => setVariant('default')}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                {...props}
            >
                {/* Tech Markers (Corners) */}
                <span className="absolute top-0 left-0 w-2 h-2 border-t border-l border-current opacity-50 group-hover:opacity-100 transition-opacity" />
                <span className="absolute top-0 right-0 w-2 h-2 border-t border-r border-current opacity-50 group-hover:opacity-100 transition-opacity" />
                <span className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-current opacity-50 group-hover:opacity-100 transition-opacity" />
                <span className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-current opacity-50 group-hover:opacity-100 transition-opacity" />

                {/* Target Lock Reticle (Hover) */}
                <span className="absolute inset-0 border border-current opacity-0 scale-110 group-hover:opacity-30 group-hover:scale-100 transition-all duration-300 pointer-events-none" />

                <span className="relative z-10 flex items-center justify-center gap-2 drop-shadow-holo">
                    {children}
                </span>

                {/* Scanline effect overlay */}
                <div className="absolute inset-0 scanlines opacity-10 pointer-events-none" />
            </motion.button>
        );
    }
);

NeonButton.displayName = "NeonButton";

export { NeonButton };
