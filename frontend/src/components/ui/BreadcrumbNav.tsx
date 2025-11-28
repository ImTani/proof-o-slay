import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import { cn } from '../../lib/utils';

interface BreadcrumbNavProps {
    path: string[];
    className?: string;
}

export const BreadcrumbNav: React.FC<BreadcrumbNavProps> = ({ path, className }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className={cn(
                "relative px-6 py-4 border-b border-cyan-500/20 bg-black/20 backdrop-blur-sm",
                className
            )}
        >
            {/* Tech Decorators - Matching Hub cards */}
            <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-cyan-500/40 pointer-events-none" />
            <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-cyan-500/40 pointer-events-none" />

            {/* System Label */}
            <div className="text-[9px] font-mono text-cyan-500/40 tracking-widest uppercase mb-2">
                NAV.PATH
            </div>

            {/* Breadcrumb Path */}
            <div className="flex items-center gap-2">
                {path.map((segment, index) => (
                    <React.Fragment key={index}>
                        <motion.span
                            initial={{ opacity: 0, x: -5 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05, type: "spring", stiffness: 300, damping: 30 }}
                            className={cn(
                                "font-mono tracking-widest uppercase",
                                index === path.length - 1
                                    ? "text-cyan-400 font-bold text-lg drop-shadow-[0_0_8px_rgba(6,182,212,0.6)]"
                                    : "text-cyan-500/60 text-sm"
                            )}
                        >
                            {segment}
                        </motion.span>
                        {index < path.length - 1 && (
                            <ChevronRight className="w-3 h-3 text-cyan-500/30" />
                        )}
                    </React.Fragment>
                ))}
            </div>

            {/* Status Indicator */}
            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                <motion.div
                    className="w-1.5 h-1.5 bg-green-500 rounded-full"
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                />
                <span className="text-[9px] text-green-500/50 font-mono tracking-wider uppercase">
                    ACTIVE
                </span>
            </div>

            {/* Scanline overlay */}
            <div className="absolute inset-0 scanlines opacity-5 pointer-events-none" />
        </motion.div>
    );
};
