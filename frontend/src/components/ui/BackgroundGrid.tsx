import { motion } from 'framer-motion';

export const BackgroundGrid = () => {
    return (
        <div className="fixed inset-0 z-[-1] overflow-hidden bg-void">
            {/* Retro-wave Sun (Optional, keeping it subtle for now) */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-neon-magenta/20 to-transparent rounded-full blur-[100px] opacity-30" />

            {/* Moving Grid */}
            <div className="absolute inset-0 perspective-[500px]">
                <div className="absolute inset-0 transform-style-3d rotate-x-[60deg] scale-y-[2] origin-top">
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(0,243,255,0.3)_1px,transparent_1px),linear-gradient(90deg,rgba(0,243,255,0.3)_1px,transparent_1px)] bg-[size:40px_40px] animate-grid-scroll shadow-[0_0_20px_rgba(0,243,255,0.2)]" />
                </div>
            </div>

            {/* Vignette */}
            <div className="absolute inset-0 bg-radial-gradient-to-t from-transparent via-void/50 to-void pointer-events-none" />

            {/* Floating Particles (Simulated with simple divs for performance) */}
            <div className="absolute inset-0 opacity-30">
                {[...Array(20)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute w-1 h-1 bg-neon-cyan rounded-full"
                        initial={{
                            x: Math.random() * window.innerWidth,
                            y: Math.random() * window.innerHeight,
                            opacity: Math.random(),
                        }}
                        animate={{
                            y: [null, Math.random() * -100],
                            opacity: [null, 0],
                        }}
                        transition={{
                            duration: Math.random() * 5 + 5,
                            repeat: Infinity,
                            ease: "linear",
                        }}
                    />
                ))}
            </div>
        </div>
    );
};
