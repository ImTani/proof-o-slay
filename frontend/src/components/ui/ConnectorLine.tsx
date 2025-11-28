import React from 'react';
import { motion } from 'framer-motion';

interface ConnectorLineProps {
    startX?: number | string;
    startY?: number | string;
    endX?: number | string;
    endY?: number | string;
    color?: string;
    className?: string;
    direction?: 'horizontal' | 'vertical';
    length?: number | string;
}

export const ConnectorLine: React.FC<ConnectorLineProps> = ({
    color = "currentColor",
    className = "",
    direction = 'vertical',
    length = "100%"
}) => {
    const isVertical = direction === 'vertical';

    return (
        <div className={`absolute pointer-events-none overflow-visible ${className}`}
            style={{
                width: isVertical ? '1px' : length,
                height: isVertical ? length : '1px'
            }}>
            <svg
                width="100%"
                height="100%"
                className="overflow-visible"
            >
                <motion.line
                    x1={0}
                    y1={0}
                    x2={isVertical ? 0 : "100%"}
                    y2={isVertical ? "100%" : 0}
                    stroke={color}
                    strokeWidth="1"
                    strokeDasharray="4 4"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 0.5 }}
                    transition={{ duration: 1, ease: "easeInOut" }}
                />

                {/* End dots */}
                <motion.circle
                    cx={0}
                    cy={0}
                    r={2}
                    fill={color}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.8 }}
                />
                <motion.circle
                    cx={isVertical ? 0 : "100%"}
                    cy={isVertical ? "100%" : 0}
                    r={2}
                    fill={color}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.8 }}
                />
            </svg>
        </div>
    );
};
