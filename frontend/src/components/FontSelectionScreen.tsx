import { useState } from 'react';
import { motion } from 'framer-motion';

export type FontOption = 'font-neon' | 'font-cyber' | 'font-tech' | 'font-retro';

interface FontSelectionScreenProps {
    onSelect: (font: FontOption) => void;
}

const fonts: { id: FontOption; name: string; description: string }[] = [
    { id: 'font-neon', name: 'Orbitron', description: 'Sci-Fi Display' },
    { id: 'font-cyber', name: 'Exo 2', description: 'Geometric Cyber' },
    { id: 'font-tech', name: 'Rajdhani', description: 'Tech HUD' },
    { id: 'font-retro', name: 'Press Start 2P', description: 'Legacy Arcade' },
];

export const FontSelectionScreen = ({ onSelect }: FontSelectionScreenProps) => {
    const [hovered, setHovered] = useState<FontOption | null>(null);

    return (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0a0a12] text-white overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-cyan-900/20 via-[#0a0a12] to-[#0a0a12]" />
            <div className="absolute inset-0 bg-[linear-gradient(rgba(0,243,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,243,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] [transform:perspective(1000px)_rotateX(60deg)_translateY(-100px)_scale(3)] opacity-50" />

            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="z-10 text-center mb-16"
            >
                <h1 className="text-5xl md:text-7xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-b from-cyan-300 to-cyan-600 drop-shadow-[0_0_15px_rgba(0,243,255,0.5)] font-neon tracking-wider">
                    SYSTEM INITIALIZATION
                </h1>
                <p className="text-cyan-400/60 text-lg font-tech tracking-[0.5em] uppercase">Select Interface Protocol</p>
            </motion.div>

            <div className="z-10 grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl w-full px-8">
                {fonts.map((font) => (
                    <motion.button
                        key={font.id}
                        onClick={() => onSelect(font.id)}
                        onMouseEnter={() => setHovered(font.id)}
                        onMouseLeave={() => setHovered(null)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={`relative p-8 border border-white/10 bg-black/40 backdrop-blur-sm rounded-none text-left transition-all duration-300 group overflow-hidden
                            ${hovered === font.id ? 'border-cyan-500 shadow-[0_0_30px_rgba(0,243,255,0.2)]' : 'hover:border-cyan-500/50'}
                        `}
                    >
                        {/* Corner Markers */}
                        <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-cyan-500 transition-all duration-300 group-hover:w-4 group-hover:h-4" />
                        <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-cyan-500 transition-all duration-300 group-hover:w-4 group-hover:h-4" />
                        <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-cyan-500 transition-all duration-300 group-hover:w-4 group-hover:h-4" />
                        <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-cyan-500 transition-all duration-300 group-hover:w-4 group-hover:h-4" />

                        <div className={`text-4xl mb-3 ${font.id} text-white group-hover:text-cyan-300 transition-colors`}>
                            {font.name}
                        </div>
                        <div className="text-sm text-cyan-500/60 font-tech uppercase tracking-widest mb-6">
                            // {font.description}
                        </div>

                        {/* Preview Text */}
                        <div className={`text-xl text-gray-400 ${font.id} opacity-50 group-hover:opacity-100 transition-opacity`}>
                            THE QUICK BROWN FOX JUMPS OVER THE LAZY DOG. 0123456789
                        </div>

                        {/* Scanline Effect */}
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/5 to-transparent translate-y-[-100%] group-hover:translate-y-[100%] transition-transform duration-1000 pointer-events-none" />
                    </motion.button>
                ))}
            </div>
        </div>
    );
};
