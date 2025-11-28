import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCurrentAccount, useSuiClientQuery } from '@mysten/dapp-kit';
import { CONTRACT_CONFIG } from '../lib/suiClient';
import { ForgeUI } from './ForgeUI';
import { ConsumablesShop } from './ConsumablesShop';
import { WeaponShop } from './WeaponShop';
import { StakingScene } from './StakingScene';
import { JackpotScene } from './JackpotScene';
import { NFTUpgradePanel } from './NFTUpgradePanel';
import { NeonButton } from './ui/NeonButton';
import { GlassPanel } from './ui/GlassPanel';
import { CyberIcon } from './ui/CyberIcon';
import { Hammer, Package, Crosshair, Cpu, TrendingUp, Ticket, ArrowLeft } from 'lucide-react';

interface HubProps {
    shards: number;
    onStartRun: () => void;
    onForgeComplete: () => void;
}

type HubView = 'main' | 'forge' | 'consumables' | 'weapons' | 'staking' | 'jackpot' | 'nfts';

export const Hub = ({ shards, onStartRun, onForgeComplete }: HubProps) => {
    const [view, setView] = useState<HubView>('main');

    const menuItems = [
        { id: 'forge', label: 'MATTER FORGE', icon: Hammer, color: 'text-yellow-400', glow: 'yellow', desc: 'Convert Shards to $SLAY' },
        { id: 'consumables', label: 'SUPPLY DEPOT', icon: Package, color: 'text-cyan-400', glow: 'cyan', desc: 'Purchase Consumables' },
        { id: 'weapons', label: 'ARMORY', icon: Crosshair, color: 'text-red-400', glow: 'red', desc: 'Unlock New Weapons' },
        { id: 'nfts', label: 'CYBERNETICS', icon: Cpu, color: 'text-purple-400', glow: 'purple', desc: 'Upgrade Stats (NFTs)' },
        { id: 'staking', label: 'RISK ASSESSMENT', icon: TrendingUp, color: 'text-green-400', glow: 'green', desc: 'Stake $SLAY for Runs' },
        { id: 'jackpot', label: 'JACKPOT RUN', icon: Ticket, color: 'text-pink-400', glow: 'magenta', desc: 'Progressive Multiplier' },
    ];

    return (
        <div className="w-full h-screen bg-transparent text-white font-neon flex flex-col overflow-hidden relative z-10">

            {/* Header / HUD Top */}
            <motion.header
                initial={{ opacity: 0, y: -30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 30, delay: 0.1 }}
                className="flex-none p-8 flex items-start gap-8 z-20"
            >
                <div className="flex-1">
                    <h1 className="text-5xl font-black tracking-[0.2em] text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-white to-cyan-400 animate-pulse drop-shadow-glow-cyan">
                        COMMAND CENTER
                    </h1>
                    <div className="text-xs text-cyan-500/60 font-mono mt-2 flex gap-4 uppercase tracking-widest">
                        <span>UNIT STATUS: ONLINE</span>
                        <span>SECURE CONNECTION</span>
                    </div>
                </div>
                <div className="flex-none flex gap-4">
                    <div>
                        <div className="text-xs text-cyan-500/60 uppercase tracking-widest mb-2">Shards</div>
                        <GlassPanel className="px-6 py-2 border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.15)]" variant="thin">
                            <div className="text-3xl font-mono font-bold text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.5)]">
                                {shards.toLocaleString()} <span className="text-sm text-yellow-500/50">SHARDS</span>
                            </div>
                        </GlassPanel>
                    </div>
                    <HubBalanceDisplay />
                </div>
            </motion.header>

            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto custom-scrollbar px-8 pb-24 relative flex flex-col">
                <AnimatePresence mode='wait'>
                    {view === 'main' ? (
                        <motion.div
                            key="main-menu"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto pt-8 my-auto"
                        >
                            {menuItems.map((item, index) => (
                                <motion.div
                                    key={item.id}
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{
                                        opacity: 1,
                                        y: 0,
                                        transition: {
                                            type: "spring",
                                            stiffness: 300,
                                            damping: 30,
                                            delay: index * 0.05
                                        }
                                    }}
                                >
                                    <GlassPanel
                                        onClick={() => setView(item.id as HubView)}
                                        className="cursor-pointer group p-0 min-h-[240px] border-white/5 hover:border-cyan-500/40 shadow-[0_0_15px_rgba(0,0,0,0.3)] hover:shadow-[0_0_30px_rgba(6,182,212,0.15)] transition-shadow"
                                        whileHover={{
                                            scale: 1.02,
                                            transition: { type: "spring", stiffness: 400, damping: 25 }
                                        }}
                                        whileTap={{
                                            scale: 0.98,
                                            transition: { type: "spring", stiffness: 500, damping: 30 }
                                        }}
                                    >
                                        {/* Card Header - System Label */}
                                        <div className="w-full flex justify-between items-center border-b border-white/5 px-4 py-2 bg-white/[0.02]">
                                            <span className="text-[9px] font-mono text-cyan-500/40 tracking-widest uppercase">
                                                SYS.MODULE.{item.id.toUpperCase()}
                                            </span>
                                            <div className="flex gap-1.5">
                                                <motion.div
                                                    className="w-1 h-1 bg-green-500/50 rounded-full"
                                                    animate={{ opacity: [0.3, 1, 0.3] }}
                                                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                                                />
                                                <div className="w-1 h-1 bg-cyan-500/30 rounded-full" />
                                                <div className="w-1 h-1 bg-cyan-500/20 rounded-full" />
                                            </div>
                                        </div>

                                        {/* Card Body */}
                                        <div className="p-6 flex flex-col gap-6 relative overflow-hidden h-full">
                                            {/* Hover Glimmer Effect */}
                                            <motion.div
                                                initial={{ opacity: 0 }}
                                                whileHover={{ opacity: 1 }}
                                                transition={{ duration: 0.4 }}
                                                className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent pointer-events-none"
                                            />

                                            {/* Scanline Overlay */}
                                            <div className="absolute inset-0 scanlines opacity-5 pointer-events-none" />

                                            <div className="flex items-center justify-between relative z-10">
                                                <motion.div
                                                    className={`text-4xl ${item.color} drop-shadow-holo`}
                                                    whileHover={{
                                                        scale: 1.15,
                                                        transition: { type: "spring", stiffness: 400, damping: 20 }
                                                    }}
                                                >
                                                    <CyberIcon icon={item.icon} glowColor={item.glow as any} className="w-12 h-12" />
                                                </motion.div>
                                                <motion.div
                                                    initial={{ opacity: 0, x: -5 }}
                                                    whileHover={{ opacity: 1, x: 0 }}
                                                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                                                    className="text-cyan-500 font-mono text-xs tracking-widest"
                                                >
                                                    [ACCESS]
                                                </motion.div>
                                            </div>

                                            <div className="relative z-10 flex flex-col gap-2">
                                                <motion.h3
                                                    className="text-xl font-bold tracking-widest uppercase text-white/90 group-hover:text-cyan-100"
                                                    whileHover={{ x: 2 }}
                                                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                                >
                                                    {item.label}
                                                </motion.h3>
                                                <p className="text-sm text-cyan-500/60 font-mono group-hover:text-cyan-400/80 transition-colors leading-relaxed">
                                                    {item.desc}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Card Footer - Status */}
                                        <div className="w-full px-4 py-2 border-t border-white/5 bg-white/[0.02] opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                            <span className="text-[9px] text-green-500/50 font-mono tracking-wider uppercase flex items-center gap-2">
                                                <span className="w-1 h-1 bg-green-500 rounded-full animate-pulse" />
                                                READY
                                            </span>
                                        </div>
                                    </GlassPanel>
                                </motion.div>
                            ))}
                        </motion.div>
                    ) : (
                        <motion.div
                            key="sub-view"
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -50 }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            className="h-full relative max-w-7xl mx-auto w-full"
                        >
                            {/* Unified Window Panel - Matching MainMenu Aesthetic */}
                            <GlassPanel
                                variant="heavy"
                                className="w-full flex flex-col gap-0 p-0 overflow-hidden border-white/5 shadow-2xl shadow-black/50 !bg-black/30"
                            >
                                {/* Window Header with Close Button */}
                                <div className="w-full flex justify-between items-center border-b border-white/5 px-6 py-4 bg-white/[0.02]">
                                    <div className="flex-1">
                                        <span className="text-[10px] font-mono text-cyan-500/60 tracking-widest uppercase">
                                            NAV.PATH :: {
                                                view === 'forge' ? 'MATTER FORGE' :
                                                    view === 'consumables' ? 'SUPPLY DEPOT' :
                                                        view === 'weapons' ? 'ARMORY' :
                                                            view === 'nfts' ? 'CYBERNETICS' :
                                                                view === 'staking' ? 'RISK ASSESSMENT' :
                                                                    view === 'jackpot' ? 'JACKPOT RUN' : ''
                                            }
                                        </span>
                                        <div className="flex items-center gap-2 mt-2">
                                            <span className="font-mono tracking-widest uppercase text-cyan-500/60 text-sm">
                                                COMMAND CENTER
                                            </span>
                                            <span className="text-cyan-500/30">/</span>
                                            <motion.span
                                                initial={{ opacity: 0, x: -5 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                                className="font-mono tracking-widest uppercase text-cyan-400 font-bold text-lg drop-shadow-[0_0_8px_rgba(6,182,212,0.6)]"
                                            >
                                                {
                                                    view === 'forge' ? 'MATTER FORGE' :
                                                        view === 'consumables' ? 'SUPPLY DEPOT' :
                                                            view === 'weapons' ? 'ARMORY' :
                                                                view === 'nfts' ? 'CYBERNETICS' :
                                                                    view === 'staking' ? 'RISK ASSESSMENT' :
                                                                        view === 'jackpot' ? 'JACKPOT RUN' : ''
                                                }
                                            </motion.span>
                                        </div>
                                    </div>

                                    {/* Close Button with Status Dots */}
                                    <div className="flex items-center gap-4">
                                        <div className="flex gap-1.5">
                                            <motion.div
                                                className="w-1 h-1 bg-green-500 rounded-full"
                                                animate={{ opacity: [0.3, 1, 0.3] }}
                                                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                                            />
                                            <div className="w-1 h-1 bg-cyan-500 rounded-full" />
                                            <div className="w-1 h-1 bg-cyan-500/30 rounded-full" />
                                        </div>

                                        <motion.button
                                            onClick={() => setView('main')}
                                            whileHover={{
                                                scale: 1.1,
                                                rotate: 90,
                                                transition: { type: "spring", stiffness: 400, damping: 25 }
                                            }}
                                            whileTap={{
                                                scale: 0.9,
                                                transition: { type: "spring", stiffness: 500, damping: 30 }
                                            }}
                                            className="text-cyan-500/50 hover:text-white transition-colors"
                                        >
                                            <CyberIcon icon={ArrowLeft} className="w-6 h-6" glowColor="cyan" />
                                        </motion.button>
                                    </div>
                                </div>

                                {/* Content Area */}
                                <div className="flex-1">
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ type: "spring", stiffness: 300, damping: 30, delay: 0.1 }}
                                    >
                                        {view === 'forge' && (
                                            <ForgeUI
                                                pendingShards={shards}
                                                onForgeComplete={onForgeComplete}
                                            />
                                        )}
                                        {view === 'consumables' && (
                                            <ConsumablesShop
                                                shards={shards}
                                                onPurchase={(id, cost) => console.log('Buy', id, cost)}
                                                ownedItems={[]}
                                            />
                                        )}
                                        {view === 'weapons' && (
                                            <WeaponShop
                                                ownedWeapons={[]}
                                                onPurchaseSuccess={() => { }}
                                            />
                                        )}
                                        {view === 'nfts' && <NFTUpgradePanel />}
                                        {view === 'staking' && (
                                            <StakingScene
                                                balance={shards}
                                                onStakeConfirmed={(amt: number, time: number) => {
                                                    console.log('Stake Confirmed:', amt, time);
                                                    // TODO: Connect to backend/contract
                                                    setView('main');
                                                }}
                                                onBack={() => setView('main')}
                                            />
                                        )}
                                        {view === 'jackpot' && (
                                            <JackpotScene
                                                tickets={1} // TODO: Fetch real ticket count
                                                onStartJackpot={() => {
                                                    console.log('Jackpot Run Started');
                                                    onStartRun();
                                                }}
                                                onBack={() => setView('main')}
                                            />
                                        )}
                                    </motion.div>
                                </div>

                                {/* Status Bar Footer */}
                                <div className="w-full border-t border-white/5 bg-white/[0.02] px-6 py-3 flex items-center justify-between">
                                    <div className="flex items-center gap-6 text-[9px] font-mono text-cyan-500/40 uppercase tracking-widest">
                                        <span className="flex items-center gap-2">
                                            <motion.div
                                                className="w-1 h-1 bg-green-500 rounded-full"
                                                animate={{ opacity: [0.3, 1, 0.3] }}
                                                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                                            />
                                            System: Online
                                        </span>
                                        <span>Protocol: Active</span>
                                        <span>Latency: 8ms</span>
                                    </div>
                                    <div className="text-[9px] text-white/20 font-mono tracking-wider">
                                        SECURE SESSION :: NEURAL LINK STABLE
                                    </div>
                                </div>
                            </GlassPanel>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>

            {/* Footer / Deploy Button - Hidden in Jackpot Mode */}
            <AnimatePresence>
                {view !== 'jackpot' && (
                    <motion.footer
                        initial={{ y: 50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 50, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 200, damping: 20 }}
                        className="flex-none p-6 bg-gradient-to-t from-black via-black/80 to-transparent flex justify-center z-20"
                    >
                        <motion.div
                            whileHover={{
                                scale: 1.05,
                                transition: { type: "spring", stiffness: 400, damping: 25 }
                            }}
                            whileTap={{
                                scale: 0.95,
                                transition: { type: "spring", stiffness: 500, damping: 30 }
                            }}
                        >
                            <NeonButton
                                onClick={onStartRun}
                                size="lg"
                                className="px-24 py-6 text-2xl tracking-[0.2em] border-cyan-500 shadow-[0_0_30px_rgba(0,243,255,0.2)] hover:shadow-[0_0_50px_rgba(0,243,255,0.4)] transition-shadow"
                            >
                                INITIATE RUN
                            </NeonButton>
                        </motion.div>
                    </motion.footer>
                )}
            </AnimatePresence>
        </div>
    );
};

// Helper component to display $SLAY balance in Hub header style
function HubBalanceDisplay() {
    const currentAccount = useCurrentAccount();
    const { data: coins, isLoading } = useSuiClientQuery(
        'getCoins',
        {
            owner: currentAccount?.address || '',
            coinType: CONTRACT_CONFIG.SLAY_TYPE,
        },
        {
            enabled: !!currentAccount && !!CONTRACT_CONFIG.PACKAGE_ID,
            refetchInterval: 5000,
        }
    );

    const totalBalance = coins?.data.reduce((acc, coin) => {
        return acc + BigInt(coin.balance);
    }, BigInt(0)) || BigInt(0);

    const formattedBalance = Number(totalBalance) / 1_000_000_000;

    return (
        <div>
            <div className="text-xs text-cyan-500/60 uppercase tracking-widest mb-2">$SLAY Balance</div>
            <GlassPanel className="px-6 py-2 border-green-500/30 shadow-[0_0_15px_rgba(74,222,128,0.15)]" variant="thin">
                <div className="text-3xl font-mono font-bold text-green-400 drop-shadow-[0_0_10px_rgba(74,222,128,0.5)]">
                    {isLoading ? (
                        <span className="text-sm text-green-500/50">LOADING...</span>
                    ) : (
                        <>
                            {formattedBalance.toFixed(2)} <span className="text-sm text-green-500/50">$SLAY</span>
                        </>
                    )}
                </div>
            </GlassPanel>
        </div>
    );
}
