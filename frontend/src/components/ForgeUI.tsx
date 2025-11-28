import { useState } from 'react';
import { useCurrentAccount, useSignAndExecuteTransaction } from '@mysten/dapp-kit';
import { Transaction } from '@mysten/sui/transactions';
import { CONTRACT_CONFIG, toRawSlayAmount } from '../lib/suiClient';
import { motion, AnimatePresence } from 'framer-motion';
import { NeonButton } from './ui/NeonButton';
import { CyberIcon } from './ui/CyberIcon';
import { GlassPanel } from './ui/GlassPanel';
import { AlertTriangle, CheckCircle, Zap } from 'lucide-react';

interface ForgeUIProps {
    pendingShards: number;
    onForgeComplete: () => void;
}

// Spring physics constants for AAA feel
const SPRING_CONFIG = { type: "spring" as const, stiffness: 300, damping: 30 };
const STIFF_SPRING = { type: "spring" as const, stiffness: 400, damping: 25 };

export function ForgeUI({ pendingShards, onForgeComplete }: ForgeUIProps) {
    const currentAccount = useCurrentAccount();
    const { mutate: signAndExecute } = useSignAndExecuteTransaction();
    const [isForging, setIsForging] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handleForge = async () => {
        if (!currentAccount) {
            setError('WALLET DISCONNECTED');
            return;
        }

        if (pendingShards <= 0) {
            setError('INSUFFICIENT SHARDS');
            return;
        }

        if (!CONTRACT_CONFIG.PACKAGE_ID || !CONTRACT_CONFIG.TREASURY_CAP_ID) {
            setError('SYSTEM OFFLINE (CONTRACT NOT DEPLOYED)');
            return;
        }

        setIsForging(true);
        setError(null);
        setSuccess(false);

        try {
            const tx = new Transaction();
            tx.setGasBudget(100000000);
            const rawAmount = toRawSlayAmount(pendingShards);

            tx.moveCall({
                target: `${CONTRACT_CONFIG.PACKAGE_ID}::${CONTRACT_CONFIG.MODULE_NAME}::forge_tokens`,
                arguments: [
                    tx.object(CONTRACT_CONFIG.TREASURY_CAP_ID),
                    tx.pure.u64(rawAmount),
                ],
            });

            signAndExecute(
                { transaction: tx },
                {
                    onSuccess: () => {
                        setSuccess(true);
                        setIsForging(false);
                        setTimeout(() => {
                            onForgeComplete();
                        }, 2000);
                    },
                    onError: (err) => {
                        console.error('Forge failed:', err);
                        setError('TRANSACTION FAILED');
                        setIsForging(false);
                    },
                }
            );
        } catch (err) {
            console.error('Error:', err);
            setError('INTERNAL ERROR');
            setIsForging(false);
        }
    };

    return (
        <div className="w-full max-w-3xl mx-auto p-8">
            {/* Conversion Visual - AAA Polish */}
            <div className="flex items-center justify-center gap-6 mb-10">
                {/* Input: Shards */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ ...SPRING_CONFIG, delay: 0.1 }}
                    className="flex-1 max-w-[180px]"
                >
                    <GlassPanel
                        variant="thin"
                        className="p-4 border-blue-500/20 hover:border-blue-500/40 transition-colors relative group"
                        whileHover={{
                            scale: 1.02,
                            boxShadow: "0 0 25px rgba(96, 165, 250, 0.15)",
                            transition: STIFF_SPRING
                        }}
                    >
                        <div className="absolute inset-0 scanlines opacity-5 pointer-events-none rounded-sm" />
                        <div className="text-[9px] font-mono text-blue-500/40 tracking-widest uppercase mb-3">
                            INPUT.RAW
                        </div>
                        <div className="text-center">
                            <motion.div
                                className="text-4xl font-mono font-bold text-blue-400 drop-shadow-[0_0_12px_rgba(96,165,250,0.6)] group-hover:drop-shadow-[0_0_18px_rgba(96,165,250,0.8)] transition-all"
                                whileHover={{ scale: 1.05, transition: STIFF_SPRING }}
                            >
                                {pendingShards.toLocaleString()}
                            </motion.div>
                            <div className="text-xs text-blue-500/50 mt-2 tracking-widest">SHARDS</div>
                        </div>
                    </GlassPanel>
                </motion.div>

                {/* Energy Flow Line */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ ...SPRING_CONFIG, delay: 0.2 }}
                    className="flex-shrink-0 w-24 h-12 relative"
                >
                    <div className="absolute top-1/2 -translate-y-1/2 w-full h-[2px] bg-gradient-to-r from-blue-500/30 via-yellow-500/60 to-yellow-500/30 rounded-full" />
                    <motion.div
                        animate={{
                            x: [-20, 100],
                            opacity: [0, 1, 1, 0],
                            scale: [0.5, 1, 1, 0.5]
                        }}
                        transition={{
                            duration: 1.8,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                        className="absolute top-1/2 -translate-y-1/2 w-6 h-6"
                    >
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                            className="w-full h-full"
                        >
                            <CyberIcon icon={Zap} className="w-6 h-6 text-yellow-400" glowColor="yellow" />
                        </motion.div>
                    </motion.div>
                    {[0, 1, 2].map((i) => (
                        <motion.div
                            key={i}
                            animate={{
                                x: [-10, 110],
                                opacity: [0, 0.6, 0],
                            }}
                            transition={{
                                duration: 2,
                                repeat: Infinity,
                                delay: i * 0.4,
                                ease: "linear"
                            }}
                            className="absolute top-1/2 -translate-y-1/2 w-1 h-1 bg-white rounded-full blur-[1px]"
                        />
                    ))}
                </motion.div>

                {/* Output: $SLAY */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ ...SPRING_CONFIG, delay: 0.15 }}
                    className="flex-1 max-w-[180px]"
                >
                    <GlassPanel
                        variant="thin"
                        className="p-4 border-yellow-500/20 hover:border-yellow-500/40 transition-colors relative group"
                        whileHover={{
                            scale: 1.02,
                            boxShadow: "0 0 25px rgba(250, 204, 21, 0.15)",
                            transition: STIFF_SPRING
                        }}
                    >
                        <div className="absolute inset-0 scanlines opacity-5 pointer-events-none rounded-sm" />
                        <div className="text-[9px] font-mono text-yellow-500/40 tracking-widest uppercase mb-3">
                            OUTPUT.REFINED
                        </div>
                        <div className="text-center">
                            <motion.div
                                className="text-4xl font-mono font-bold text-yellow-400 drop-shadow-[0_0_12px_rgba(250,204,21,0.6)] group-hover:drop-shadow-[0_0_18px_rgba(250,204,21,0.8)] transition-all"
                                whileHover={{ scale: 1.05, transition: STIFF_SPRING }}
                            >
                                {pendingShards.toLocaleString()}
                            </motion.div>
                            <div className="text-xs text-yellow-500/50 mt-2 tracking-widest">$SLAY</div>
                        </div>
                    </GlassPanel>
                </motion.div>
            </div>

            {/* Status Messages with Spring Physics */}
            <AnimatePresence mode='wait'>
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={SPRING_CONFIG}
                        className="bg-red-500/10 border border-red-500/30 text-red-500 p-4 rounded-sm mb-6 text-center text-sm font-mono flex items-center justify-center gap-3 backdrop-blur-sm"
                    >
                        <CyberIcon icon={AlertTriangle} className="w-5 h-5" glowColor="red" />
                        <span className="tracking-wider">{error}</span>
                    </motion.div>
                )}
                {success && (
                    <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={SPRING_CONFIG}
                        className="bg-green-500/10 border border-green-500/30 text-green-500 p-4 rounded-sm mb-6 text-center text-sm font-mono flex items-center justify-center gap-3 backdrop-blur-sm"
                    >
                        <CyberIcon icon={CheckCircle} className="w-5 h-5" glowColor="green" />
                        <span className="tracking-wider">FORGE SEQUENCE COMPLETE</span>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Action Button with Active Micro-Scale */}
            <motion.div
                whileHover={{ scale: 1.02, transition: STIFF_SPRING }}
                whileTap={{ scale: 0.98, transition: { type: "spring", stiffness: 500, damping: 30 } }}
            >
                <NeonButton
                    onClick={handleForge}
                    disabled={isForging || success || pendingShards <= 0}
                    fullWidth
                    size="lg"
                    variant={success ? 'primary' : 'warning'}
                    className="py-5 text-xl tracking-[0.2em] font-bold"
                >
                    {isForging ? 'PROCESSING...' : success ? 'COMPLETED' : 'INITIATE FORGE'}
                </NeonButton>
            </motion.div>

            {/* System Footer */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-[10px] text-white/30 text-center mt-6 font-mono tracking-wider flex items-center justify-center gap-2"
            >
                <motion.div
                    className="w-1 h-1 bg-green-500 rounded-full"
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                />
                SECURE CONNECTION :: HONOR PROTOCOL ACTIVE
            </motion.div>
        </div>
    );
}
