import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

export const DynamicBackground = () => {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (containerRef.current) {
                const { clientX, clientY } = e;
                containerRef.current.style.setProperty('--mouse-x', `${clientX}px`);
                containerRef.current.style.setProperty('--mouse-y', `${clientY}px`);
            }
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    return (
        <div
            ref={containerRef}
            className="fixed inset-0 z-[-1] bg-void overflow-hidden"
            style={{
                '--mouse-x': '50%',
                '--mouse-y': '50%',
            } as React.CSSProperties}
        >
            {/* Base Dark Grid - Always visible but faint */}
            <div
                className="absolute inset-0 opacity-[0.1]"
                style={{
                    backgroundImage: `
                        linear-gradient(to right, var(--color-cyan-500) 1px, transparent 1px),
                        linear-gradient(to bottom, var(--color-cyan-500) 1px, transparent 1px)
                    `,
                    backgroundSize: '50px 50px',
                    transform: 'scale(1.5)',
                }}
            />

            {/* Active Grid - Revealed by cursor */}
            <div
                className="absolute inset-0 opacity-40"
                style={{
                    backgroundImage: `
                        linear-gradient(to right, var(--color-cyan-500) 1px, transparent 1px),
                        linear-gradient(to bottom, var(--color-cyan-500) 1px, transparent 1px)
                    `,
                    backgroundSize: '50px 50px',
                    transform: 'scale(1.5)',
                    maskImage: 'radial-gradient(circle 400px at var(--mouse-x) var(--mouse-y), black, transparent)',
                    WebkitMaskImage: 'radial-gradient(circle 400px at var(--mouse-x) var(--mouse-y), black, transparent)',
                }}
            />

            {/* Cursor Glow */}
            <div
                className="absolute inset-0 pointer-events-none mix-blend-screen"
                style={{
                    background: 'radial-gradient(circle 600px at var(--mouse-x) var(--mouse-y), rgba(0, 243, 255, 0.1), transparent 70%)'
                }}
            />

            {/* Subtle Scanline / Noise Texture */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] brightness-150 contrast-150" />

            {/* Floating Data Streams */}
            <motion.div
                className="absolute inset-0 opacity-20 pointer-events-none"
                animate={{
                    backgroundPosition: ['0px 0px', '0px 100px'],
                }}
                transition={{
                    duration: 20,
                    repeat: Infinity,
                    ease: "linear"
                }}
                style={{
                    backgroundImage: 'linear-gradient(0deg, transparent 24%, rgba(0, 243, 255, .1) 25%, rgba(0, 243, 255, .1) 26%, transparent 27%, transparent 74%, rgba(0, 243, 255, .1) 75%, rgba(0, 243, 255, .1) 76%, transparent 77%, transparent)',
                    backgroundSize: '50px 50px'
                }}
            />
        </div>
    );
};
