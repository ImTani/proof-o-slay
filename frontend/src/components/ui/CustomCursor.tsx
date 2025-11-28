import { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring, AnimatePresence } from 'framer-motion';
import { useCursor } from '../../context/CursorContext';

export const CustomCursor = () => {
    const { variant, setVariant } = useCursor();
    const [isVisible, setIsVisible] = useState(false);
    const [isClicking, setIsClicking] = useState(false);

    // Mouse position motion values
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    // Smooth spring animation for the cursor movement
    // Slightly stiffer for a more responsive "gaming" feel
    const springConfig = { damping: 30, stiffness: 400, mass: 0.5 };
    const cursorX = useSpring(mouseX, springConfig);
    const cursorY = useSpring(mouseY, springConfig);

    useEffect(() => {
        const moveCursor = (e: MouseEvent) => {
            mouseX.set(e.clientX - 16); // Center the 32px cursor
            mouseY.set(e.clientY - 16);
            if (!isVisible) setIsVisible(true);
        };

        const handleMouseDown = () => setIsClicking(true);
        const handleMouseUp = () => setIsClicking(false);

        const handleMouseEnter = () => setIsVisible(true);
        const handleMouseLeave = () => setIsVisible(false);

        // Global hover detection
        const handleMouseOver = (e: MouseEvent) => {
            const target = e.target as HTMLElement;

            // Check if the element or its parents are interactive
            const isInteractive =
                target.matches('button, a, input, textarea, select, [role="button"]') ||
                target.closest('button, a, input, textarea, select, [role="button"]') ||
                window.getComputedStyle(target).cursor === 'pointer';

            if (isInteractive) {
                setVariant('selection');
            } else {
                setVariant('default');
            }
        };

        window.addEventListener('mousemove', moveCursor);
        window.addEventListener('mousedown', handleMouseDown);
        window.addEventListener('mouseup', handleMouseUp);
        document.body.addEventListener('mouseenter', handleMouseEnter);
        document.body.addEventListener('mouseleave', handleMouseLeave);
        document.body.addEventListener('mouseover', handleMouseOver);

        return () => {
            window.removeEventListener('mousemove', moveCursor);
            window.removeEventListener('mousedown', handleMouseDown);
            window.removeEventListener('mouseup', handleMouseUp);
            document.body.removeEventListener('mouseenter', handleMouseEnter);
            document.body.removeEventListener('mouseleave', handleMouseLeave);
            document.body.removeEventListener('mouseover', handleMouseOver);
        };
    }, [mouseX, mouseY, isVisible, setVariant]);

    if (!isVisible) return null;

    return (
        <motion.div
            className="fixed top-0 left-0 pointer-events-none z-[9999] mix-blend-screen"
            style={{
                x: cursorX,
                y: cursorY,
            }}
        >
            <AnimatePresence>
                <svg width="32" height="32" viewBox="0 0 32 32" className="overflow-visible">
                    <defs>
                        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                            <feMerge>
                                <feMergeNode in="coloredBlur" />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>
                    </defs>

                    {/* Crosshair (Default) */}
                    <motion.path
                        d="M16 8 V24 M8 16 H24"
                        stroke="#00f3ff" // Neon Cyan
                        strokeWidth="2"
                        strokeLinecap="round"
                        filter="url(#glow)"
                        initial={false}
                        animate={{
                            opacity: variant === 'default' ? 1 : 0,
                            scale: variant === 'default' ? (isClicking ? 0.8 : 1) : 0.5,
                            rotate: variant === 'default' ? (isClicking ? 90 : 0) : 45
                        }}
                        transition={{ duration: 0.2 }}
                        style={{ transformOrigin: "center" }}
                    />

                    {/* Diamond (Selection) */}
                    <motion.rect
                        x="8" y="8" width="16" height="16"
                        stroke="#ff00ff" // Neon Magenta
                        strokeWidth="2"
                        fill="transparent"
                        filter="url(#glow)"
                        initial={false}
                        animate={{
                            opacity: variant === 'selection' ? 1 : 0,
                            scale: variant === 'selection' ? (isClicking ? 0.9 : 1.2) : 0.5,
                            rotate: variant === 'selection' ? (isClicking ? 90 : 45) : 0
                        }}
                        transition={{ duration: 0.2 }}
                        style={{ transformOrigin: "center" }}
                    />

                    {/* Center Dot (Always visible) */}
                    <motion.circle
                        cx="16" cy="16" r="2"
                        fill="white"
                        animate={{
                            scale: isClicking ? 1.5 : 1
                        }}
                    />
                </svg>
            </AnimatePresence>
        </motion.div>
    );
};
