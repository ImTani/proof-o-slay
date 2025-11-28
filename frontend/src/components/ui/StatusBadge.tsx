import React from 'react';
import { motion } from 'framer-motion';
import { STIFF_SPRING, BADGE_VARIANTS } from '../../lib/designTokens';

export type BadgeVariant = 'owned' | 'locked' | 'available' | 'selected' | 'maxLevel';

interface StatusBadgeProps {
    variant: BadgeVariant;
    label?: string;
    animate?: boolean;
    pulse?: boolean;
}

/**
 * Standardized status badge component
 * Used across Hub scenes for consistent badge appearance
 */
export const StatusBadge: React.FC<StatusBadgeProps> = ({
    variant,
    label,
    animate = true,
    pulse = false
}) => {
    // Default labels for each variant
    const defaultLabels: Record<BadgeVariant, string> = {
        owned: 'OWNED',
        locked: 'LOCKED',
        available: 'AVAILABLE',
        selected: 'SELECTED',
        maxLevel: 'MAX LEVEL'
    };

    const displayLabel = label || defaultLabels[variant];

    // Get colors from design tokens
    const getVariantStyles = () => {
        if (variant === 'maxLevel') {
            return {
                bg: 'bg-yellow-500/20',
                text: 'text-yellow-400',
                border: 'border-yellow-500/50',
                dotColor: 'bg-yellow-500'
            };
        }

        const variantConfig = BADGE_VARIANTS[variant as keyof typeof BADGE_VARIANTS];
        if (!variantConfig) return {
            ...BADGE_VARIANTS.available,
            dotColor: 'bg-cyan-500'
        };

        return {
            bg: `bg-${variantConfig.bg}`,
            text: `text-${variantConfig.text}`,
            border: `border-${variantConfig.border}`,
            dotColor: variant === 'owned' ? 'bg-green-500' :
                variant === 'locked' ? 'bg-red-500' :
                    'bg-cyan-500'
        };
    };

    const styles = getVariantStyles();

    const badgeContent = (
        <div className="flex items-center gap-1.5">
            <span
                className={`w-1 h-1 ${styles.dotColor} rounded-full ${pulse ? 'animate-pulse' : ''}`}
            />
            {displayLabel}
        </div>
    );

    if (!animate) {
        return (
            <div className={`px-2 py-1 ${styles.bg} ${styles.text} text-[10px] font-bold uppercase tracking-wider border ${styles.border} rounded`}>
                {badgeContent}
            </div>
        );
    }

    // Special animation for maxLevel variant
    if (variant === 'maxLevel') {
        return (
            <motion.div
                animate={{
                    boxShadow: [
                        '0 0 10px rgba(234,179,8,0.2)',
                        '0 0 20px rgba(234,179,8,0.4)',
                        '0 0 10px rgba(234,179,8,0.2)',
                    ]
                }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                className={`px-2 py-1 ${styles.bg} ${styles.text} text-[10px] font-bold uppercase tracking-wider border ${styles.border} rounded`}
            >
                {badgeContent}
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={STIFF_SPRING}
            className={`px-2 py-1 ${styles.bg} ${styles.text} text-[10px] font-bold uppercase tracking-wider border ${styles.border} rounded`}
        >
            {badgeContent}
        </motion.div>
    );
};
