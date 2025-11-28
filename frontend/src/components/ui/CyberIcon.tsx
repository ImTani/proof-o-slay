import React from 'react';
import { type LucideProps } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface CyberIconProps extends LucideProps {
    icon: React.ElementType;
    glowColor?: 'cyan' | 'magenta' | 'purple' | 'red' | 'green' | 'yellow' | 'blue' | 'orange' | 'none';
}

const CyberIcon: React.FC<CyberIconProps> = ({
    icon: Icon,
    className,
    glowColor = 'cyan',
    size,
    ...props
}) => {

    const glowStyles = {
        cyan: "drop-shadow-[0_0_5px_rgba(0,243,255,0.8)]",
        magenta: "drop-shadow-[0_0_5px_rgba(255,0,255,0.8)]",
        purple: "drop-shadow-[0_0_5px_rgba(112,0,255,0.8)]",
        red: "drop-shadow-[0_0_5px_rgba(239,68,68,0.8)]",
        green: "drop-shadow-[0_0_5px_rgba(34,197,94,0.8)]",
        yellow: "drop-shadow-[0_0_5px_rgba(234,179,8,0.8)]",
        blue: "drop-shadow-[0_0_5px_rgba(59,130,246,0.8)]",
        orange: "drop-shadow-[0_0_5px_rgba(249,115,22,0.8)]",
        none: ""
    };

    const sizeMap = {
        xs: 12,
        sm: 16,
        md: 24,
        lg: 32,
        xl: 48,
        '2xl': 64
    };

    const iconSize = typeof size === 'string' && size in sizeMap
        ? sizeMap[size as keyof typeof sizeMap]
        : size;

    return (
        <Icon
            className={cn(
                "transition-all duration-300",
                glowStyles[glowColor],
                className
            )}
            size={iconSize}
            {...props}
        />
    );
};

export { CyberIcon };
