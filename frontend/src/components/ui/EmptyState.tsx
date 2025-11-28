import React from 'react';
import { motion } from 'framer-motion';
import { CyberIcon } from './CyberIcon';
import { SPRING_CONFIG } from '../../lib/designTokens';

interface EmptyStateProps {
    icon: React.ComponentType<{ size?: number }>;
    message: string;
    submessage?: string;
    glowColor?: 'cyan' | 'red' | 'yellow' | 'green' | 'purple' | 'blue' | 'magenta';
}

/**
 * Empty State Component
 * 
 * Consistent pattern for "no items" or "disconnected" states across Hub scenes
 * 
 * Usage Examples:
 * - NFTUpgradePanel: "AWAITING NEURAL LINK"
 * - ConsumablesShop: "NO CONSUMABLES AVAILABLE"
 * - WeaponShop: "ARMORY ACCESS LOCKED"
 */
export const EmptyState: React.FC<EmptyStateProps> = ({
    icon,
    message,
    submessage,
    glowColor = 'cyan'
}) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={SPRING_CONFIG}
            className="flex flex-col items-center justify-center p-12 text-center"
        >
            <CyberIcon
                icon={icon}
                glowColor={glowColor}
                className="w-16 h-16 mb-4 opacity-40"
            />
            <p className="text-cyan-500/60 font-mono text-sm tracking-wider uppercase">
                {message}
            </p>
            {submessage && (
                <p className="text-white/40 text-xs mt-2">
                    {submessage}
                </p>
            )}
        </motion.div>
    );
};
