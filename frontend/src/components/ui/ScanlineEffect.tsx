import React from 'react';
import { motion } from 'framer-motion';

export type ScanlineType = 'animated' | 'static';

interface ScanlineEffectProps {
    /**
     * Type of scanline effect
     * - animated: Moving gradient scanline
     * - static: CSS-based static scanlines
     */
    type?: ScanlineType;

    /**
     * Color of the scanline (for animated type)
     */
    color?: string;

    /**
     * Opacity (0-1)
     */
    opacity?: number;

    /**
     * Duration of animation in seconds (for animated type)
     */
    duration?: number;
}

/**
 * Standardized scanline effect component
 * Provides consistent cyberpunk/tron aesthetic across Hub scenes
 */
export const ScanlineEffect: React.FC<ScanlineEffectProps> = ({
    type = 'animated',
    color = 'cyan-500',
    opacity = 0.1,
    duration = 1.5
}) => {
    if (type === 'static') {
        // CSS-based static scanlines
        return (
            <div
                className="absolute inset-0 scanlines pointer-events-none rounded-sm"
                style={{ opacity: opacity }}
            />
        );
    }

    // Animated gradient scanline
    return (
        <motion.div
            className={`absolute inset-0 bg-gradient-to-b from-transparent via-${color}/20 to-transparent pointer-events-none`}
            style={{ opacity: 0 }}
            animate={{
                y: ['-100%', '100%'],
                opacity: [0, opacity, 0]
            }}
            transition={{
                duration: duration,
                repeat: Infinity,
                ease: "linear"
            }}
        />
    );
};
