import React, { useEffect, useState } from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface FUITextProps {
    children: string;
    className?: string;
    as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span' | 'div';
    delay?: number;
}

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|;:,.<>?";

export const FUIText: React.FC<FUITextProps> = ({
    children,
    className,
    as: Component = 'p',
    delay = 0
}) => {
    const [displayText, setDisplayText] = useState('');
    const [isDecoded, setIsDecoded] = useState(false);

    useEffect(() => {
        let iteration = 0;
        let interval: ReturnType<typeof setInterval>;

        const startDecoding = () => {
            interval = setInterval(() => {
                setDisplayText(_prev =>
                    children
                        .split("")
                        .map((_letter, index) => {
                            if (index < iteration) {
                                return children[index];
                            }
                            return CHARS[Math.floor(Math.random() * CHARS.length)];
                        })
                        .join("")
                );

                if (iteration >= children.length) {
                    clearInterval(interval);
                    setIsDecoded(true);
                }

                iteration += 1 / 2; // Speed of decoding
            }, 30);
        };

        const timeout = setTimeout(startDecoding, delay);

        return () => {
            clearTimeout(timeout);
            if (interval) clearInterval(interval);
        };
    }, [children, delay]);

    return (
        <Component
            className={cn(
                "font-mono uppercase tracking-widest transition-colors duration-300",
                isDecoded ? "text-cyan-400" : "text-cyan-400/50",
                className
            )}
        >
            {displayText}
        </Component>
    );
};
