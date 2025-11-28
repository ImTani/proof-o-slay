import React from 'react';
import { type HTMLMotionProps } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';


function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface NeonCardProps extends HTMLMotionProps<"div"> {
    children: React.ReactNode;
    variant?: 'primary' | 'secondary' | 'accent' | 'danger' | 'warning' | 'success';
    interactive?: boolean;
    selected?: boolean;
}

import { GlassPanel } from './GlassPanel';

// ... imports

export const NeonCard = React.forwardRef<HTMLDivElement, NeonCardProps>(
    ({ className, children, variant = 'primary', interactive = false, selected = false, ...props }, ref) => {

        // Map NeonCard variants to GlassPanel styles or just use GlassPanel and add specific border colors
        const borderColors = {
            primary: "border-cyan-400/30",
            secondary: "border-white/30",
            accent: "border-purple-500/30",
            danger: "border-system-red/30",
            warning: "border-yellow-500/30",
            success: "border-green-500/30"
        };

        const selectedBorderColors = {
            primary: "border-cyan-400 shadow-[0_0_30px_rgba(0,243,255,0.2)]",
            secondary: "border-white shadow-[0_0_30px_rgba(255,255,255,0.2)]",
            accent: "border-purple-500 shadow-[0_0_30px_rgba(112,0,255,0.2)]",
            danger: "border-system-red shadow-[0_0_30px_rgba(255,42,42,0.2)]",
            warning: "border-yellow-500 shadow-[0_0_30px_rgba(234,179,8,0.2)]",
            success: "border-green-500 shadow-[0_0_30px_rgba(34,197,94,0.2)]"
        };

        return (
            <GlassPanel
                ref={ref}
                variant="default" // Use default GlassPanel base
                className={cn(
                    "transition-all duration-300",
                    selected ? selectedBorderColors[variant] : borderColors[variant],
                    interactive && !selected && "cursor-pointer hover:border-white/60 hover:bg-white/5",
                    className
                )}
                {...props}
            >
                {/* Content */}
                <div className="relative z-10">
                    {children}
                </div>
            </GlassPanel>
        );
    }
);

NeonCard.displayName = "NeonCard";
