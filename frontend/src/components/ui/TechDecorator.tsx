import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

interface TechDecoratorProps {
    className?: string;
    position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
    type?: 'corner-bracket' | 'crosshair' | 'dots';
}

export const TechDecorator: React.FC<TechDecoratorProps> = ({
    className,
    position,
    type = 'corner-bracket'
}) => {

    const positionClasses = {
        'top-left': 'top-0 left-0',
        'top-right': 'top-0 right-0 rotate-90',
        'bottom-left': 'bottom-0 left-0 -rotate-90',
        'bottom-right': 'bottom-0 right-0 rotate-180',
    };

    return (
        <div className={cn("absolute pointer-events-none z-20", positionClasses[position], className)}>
            {type === 'corner-bracket' && (
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <motion.path
                        d="M2 20V2H20"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: 1, opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="text-cyan-500/60"
                    />
                    <motion.rect
                        x="0" y="0" width="4" height="4"
                        fill="currentColor"
                        className="text-white"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.3 }}
                    />
                </svg>
            )}

            {type === 'crosshair' && (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <motion.path d="M12 4V8" stroke="currentColor" strokeWidth="1" className="text-holo-blue/40" />
                    <motion.path d="M12 16V20" stroke="currentColor" strokeWidth="1" className="text-holo-blue/40" />
                    <motion.path d="M4 12H8" stroke="currentColor" strokeWidth="1" className="text-holo-blue/40" />
                    <motion.path d="M16 12H20" stroke="currentColor" strokeWidth="1" className="text-holo-blue/40" />
                    <motion.circle cx="12" cy="12" r="2" fill="currentColor" className="text-holo-white/80" />
                </svg>
            )}

            {type === 'dots' && (
                <div className="flex gap-1">
                    {[0, 1, 2].map((i) => (
                        <motion.div
                            key={i}
                            className="w-1 h-1 bg-holo-blue/50 rounded-full"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: [0.2, 1, 0.2] }}
                            transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};
