import {
    ConnectButton,
    useCurrentAccount,
    useDisconnectWallet
} from '@mysten/dapp-kit';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * WalletConnect Component - AAA Polish Pass
 * 
 * High-fidelity UI with:
 * - Framer Motion spring physics (stiffness: 300, damping: 30)
 * - Refined glassmorphism with subtle borders and inset shadows
 * - Doubled breathing room for professional spacing
 * - Comprehensive micro-interactions (hover glow, active scale, pulse)
 */

// Motion variants for spring physics
const springConfig = {
    type: "spring" as const,
    stiffness: 300,
    damping: 30
};

const containerVariants = {
    hidden: {
        opacity: 0,
        y: -10
    },
    visible: {
        opacity: 1,
        y: 0,
        transition: springConfig
    },
    exit: {
        opacity: 0,
        x: -20,
        transition: { duration: 0.2 }
    }
};



export function WalletConnect() {
    const currentAccount = useCurrentAccount();
    const { mutate: disconnect } = useDisconnectWallet();

    return (
        <div className="relative z-50 font-mono w-full">
            <AnimatePresence mode="wait">
                {currentAccount ? (
                    <motion.div
                        key="connected"
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        whileHover={{
                            boxShadow: "0 0 25px rgba(0, 243, 255, 0.15)",
                            borderColor: "rgba(0, 243, 255, 0.3)"
                        }}
                        className="w-full bg-cyan-500/8 border border-white/5 rounded-sm px-6 py-4 flex items-center gap-6 group backdrop-blur-sm shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05),0_0_15px_rgba(0,243,255,0.1)] transition-all duration-300"
                    >
                        {/* Wallet Info Section */}
                        <div className="flex-1">
                            <motion.div
                                animate={{
                                    opacity: [0.7, 1, 0.7]
                                }}
                                transition={{
                                    duration: 2,
                                    repeat: Infinity,
                                    ease: "easeInOut"
                                }}
                                className="text-[11px] text-cyan-400 mb-1 uppercase tracking-widest font-bold"
                            >
                                LINKED
                            </motion.div>
                            <div className="text-sm text-white/90 font-mono tracking-wider leading-relaxed">
                                {currentAccount.address.slice(0, 6)}...{currentAccount.address.slice(-4)}
                            </div>
                        </div>

                        {/* Disconnect Button */}
                        <motion.button
                            onClick={() => disconnect()}
                            whileHover={{
                                scale: 1.05,
                                color: "rgba(248, 113, 113, 1)"
                            }}
                            whileTap={{
                                scale: 0.98
                            }}
                            transition={springConfig}
                            className="text-red-400/70 text-[10px] font-bold uppercase tracking-wider border-l border-white/5 pl-6 h-full flex items-center"
                        >
                            [EJECT]
                        </motion.button>
                    </motion.div>
                ) : (
                    <motion.div
                        key="disconnected"
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        whileHover={{
                            scale: 1.01,
                            boxShadow: "0 0 25px rgba(0, 243, 255, 0.2)"
                        }}
                        whileTap={{
                            scale: 0.98
                        }}
                        transition={springConfig}
                        className="w-full"
                    >
                        <ConnectButton
                            className="!w-full !bg-cyan-500/10 !border !border-cyan-500/50 !backdrop-blur-md !text-cyan-400 hover:!bg-cyan-500/20 hover:!border-cyan-400 !font-mono !uppercase !tracking-widest !py-3 !px-6 !rounded-sm !shadow-[0_0_15px_rgba(0,243,255,0.1)] hover:!shadow-[0_0_25px_rgba(0,243,255,0.2)] !transition-all !duration-300"
                            style={{ fontFamily: 'inherit' }}
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
