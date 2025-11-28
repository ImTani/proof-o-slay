import { useState, useRef, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCurrentAccount, useSignAndExecuteTransaction } from '@mysten/dapp-kit';
import { Transaction } from '@mysten/sui/transactions';
import { CONTRACT_CONFIG } from '../lib/suiClient';
import { NeonButton } from './ui/NeonButton';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

// Spring physics constants for AAA feel (matching ForgeUI & ConsumablesShop)
const SPRING_CONFIG = { type: "spring" as const, stiffness: 300, damping: 30 };
const STIFF_SPRING = { type: "spring" as const, stiffness: 400, damping: 25 };

interface WeaponItem {
    id: string;
    name: string;
    description: string;
    cost: number;
    damage: number;
    fireRate: number;
    range: number;
    special: string;
    model: string; // '3d model type'
    color: string;
    glow: string;
}

const WEAPONS: WeaponItem[] = [
    {
        id: 'flamethrower',
        name: 'Hellfire Projector',
        description: 'Continuous cone of superheated plasma. Melts armor.',
        cost: 1500,
        damage: 8,
        fireRate: 9,
        range: 4,
        special: 'Continuous DoT',
        model: 'flame',
        color: 'from-orange-500 to-red-600',
        glow: '#ff6b35'
    },
    {
        id: 'celestial_cannon',
        name: 'Star-Eater Cannon',
        description: 'Experimental anti-matter ordnance. Massive AoE.',
        cost: 10000,
        damage: 10,
        fireRate: 2,
        range: 10,
        special: 'Explosive AoE',
        model: 'star',
        color: 'from-purple-500 to-indigo-600',
        glow: '#a855f7'
    },
];

interface WeaponShopProps {
    ownedWeapons: string[];
    onPurchaseSuccess: () => void;
}

export const WeaponShop = ({ ownedWeapons, onPurchaseSuccess }: WeaponShopProps) => {
    const [selectedWeapon, setSelectedWeapon] = useState<WeaponItem>(WEAPONS[0]);
    const currentAccount = useCurrentAccount();
    const { mutate: signAndExecute } = useSignAndExecuteTransaction();
    const [isProcessing, setIsProcessing] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Simulate loading weapon data
    useState(() => {
        const timer = setTimeout(() => setIsLoading(false), 1000);
        return () => clearTimeout(timer);
    });

    const handlePurchase = async () => {
        if (!currentAccount || !CONTRACT_CONFIG.PACKAGE_ID) return;

        setIsProcessing(true);
        try {
            const tx = new Transaction();
            const functionName = `buy_${selectedWeapon.id}`;

            const [paymentCoin] = tx.splitCoins(tx.gas, [
                tx.pure.u64(selectedWeapon.cost * 1_000_000_000),
            ]);

            tx.moveCall({
                target: `${CONTRACT_CONFIG.PACKAGE_ID}::${CONTRACT_CONFIG.MODULE_NAME}::${functionName}`,
                arguments: [paymentCoin, tx.object(CONTRACT_CONFIG.TREASURY_ID)],
            });

            signAndExecute({ transaction: tx }, {
                onSuccess: () => {
                    setIsProcessing(false);
                    onPurchaseSuccess();
                },
                onError: () => setIsProcessing(false)
            });
        } catch (e) {
            setIsProcessing(false);
        }
    };

    const isOwned = ownedWeapons.includes(selectedWeapon.id);

    return (
        <div className="w-full h-full font-neon flex flex-col lg:flex-row relative">

            {/* SECTION 1: Weapon List - Left Sidebar */}
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ ...SPRING_CONFIG, delay: 0.1 }}
                className="w-full lg:w-1/4 relative border-r border-white/10 flex flex-col"
            >

                {/* Data Header */}
                <div className="p-4 pb-3 border-b border-white/10">
                    <div className="flex items-center gap-3">
                        <div className="flex-1 h-px bg-gradient-to-r from-cyan-500/50 to-transparent" />
                        <span className="text-[10px] font-mono text-cyan-500/40 tracking-widest uppercase">
                            ARMORY.INDEX
                        </span>
                        <div className="flex-1 h-px bg-gradient-to-l from-cyan-500/50 to-transparent" />
                    </div>
                </div>

                {/* Weapon Inventory */}
                <div className="flex-1 flex flex-col gap-3 p-4 relative overflow-y-auto">
                    {WEAPONS.map((weapon, index) => (
                        <WeaponListItem
                            key={weapon.id}
                            weapon={weapon}
                            index={index}
                            isSelected={selectedWeapon.id === weapon.id}
                            isOwned={ownedWeapons.includes(weapon.id)}
                            onClick={() => setSelectedWeapon(weapon)}
                        />
                    ))}
                </div>
            </motion.div>

            {/* RIGHT SIDE: Display + Stats in vertical layout */}
            <div className="flex-1 flex flex-col relative">
                {/* SECTION 2: Hologram/CRT Display - 3D Preview */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ ...SPRING_CONFIG, delay: 0.15 }}
                    className="relative border-b border-white/10"
                >

                    {/* 3D Preview Area with Screen Effect */}
                    <div className="relative p-8 h-[400px] overflow-hidden">
                        {/* Background Gradient - Weapon Color */}
                        <motion.div
                            key={`bg-${selectedWeapon.id}`}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 0.06 }}
                            transition={SPRING_CONFIG}
                            className={`absolute inset-0 bg-gradient-to-br ${selectedWeapon.color} pointer-events-none`}
                        />

                        {/* Scanlines Over Hologram - CRT Screen Effect */}
                        <div className="absolute inset-0 scanlines opacity-20 pointer-events-none z-10" />

                        {isLoading ? (
                            <div className="w-full h-full flex items-center justify-center">
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                    className="w-12 h-12 border-2 border-cyan-500 border-t-transparent rounded-full"
                                />
                            </div>
                        ) : (
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={selectedWeapon.id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={SPRING_CONFIG}
                                    className="w-full h-full"
                                >
                                    <Suspense fallback={
                                        <div className="w-full h-full flex items-center justify-center">
                                            <motion.div
                                                animate={{ rotate: 360 }}
                                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                                className="w-12 h-12 border-2 border-cyan-500 border-t-transparent rounded-full"
                                            />
                                        </div>
                                    }>
                                        <Canvas camera={{ position: [0, 0, 2.5], fov: 50 }}>
                                            <ambientLight intensity={0.5} />
                                            <pointLight position={[10, 10, 10]} intensity={1} />
                                            <WeaponModel3D
                                                type={selectedWeapon.model}
                                                color={selectedWeapon.glow}
                                            />
                                            <OrbitControls
                                                enableZoom={true}
                                                minDistance={2}
                                                maxDistance={5}
                                                enablePan={false}
                                                autoRotate
                                                autoRotateSpeed={2}
                                                minPolarAngle={Math.PI / 4}
                                                maxPolarAngle={Math.PI - Math.PI / 4}
                                            />
                                        </Canvas>
                                    </Suspense>
                                </motion.div>
                            </AnimatePresence>
                        )}

                        {/* Tech Corner Labels */}
                        <div className="absolute top-4 left-4 text-[9px] font-mono text-cyan-500/30 tracking-widest z-10">
                            HOLOGRAM.RENDER
                        </div>
                        <div className="absolute top-4 right-4 text-[9px] font-mono text-cyan-500/30 tracking-widest z-10">
                            INTERACT.ENABLED
                        </div>

                        {/* CRT Overlay Effects */}
                        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,243,255,0.03)_1px,transparent_1px)] bg-[length:100%_4px] pointer-events-none z-10" />
                    </div>
                </motion.div>

                {/* SECTION 3: Stats & Purchase */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ ...SPRING_CONFIG, delay: 0.2 }}
                    className="relative p-8 flex flex-col gap-6 flex-1"
                >
                    {/* Header: Name + Price */}
                    <div className="flex justify-between items-start gap-6">
                        <motion.div
                            key={`title-${selectedWeapon.id}`}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={SPRING_CONFIG}
                            className="flex-1"
                        >
                            <h1 className="text-4xl font-bold text-white mb-3 tracking-wide">
                                {selectedWeapon.name}
                            </h1>
                            <p className="text-white/60 text-sm leading-relaxed max-w-lg">
                                {selectedWeapon.description}
                            </p>
                        </motion.div>

                        {/* Cost Display with Pulse */}
                        <motion.div
                            key={`cost-${selectedWeapon.id}`}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={STIFF_SPRING}
                            className="text-right"
                        >
                            <div className="text-[10px] font-mono text-yellow-500/40 tracking-widest uppercase mb-2">
                                ACQUISITION.COST
                            </div>
                            <motion.div
                                animate={!isOwned ? {
                                    textShadow: [
                                        '0 0 10px rgba(250,204,21,0.3)',
                                        '0 0 20px rgba(250,204,21,0.6)',
                                        '0 0 10px rgba(250,204,21,0.3)',
                                    ]
                                } : {}}
                                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                                className="text-3xl font-mono font-bold text-yellow-400"
                            >
                                {selectedWeapon.cost.toLocaleString()}
                                <span className="text-sm text-yellow-500/60 ml-2">$SLAY</span>
                            </motion.div>
                        </motion.div>
                    </div>

                    {/* Divider */}
                    <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

                    {/* Stats Grid */}
                    <div className="grid grid-cols-3 gap-6">
                        <StatBar
                            label="DAMAGE"
                            value={selectedWeapon.damage}
                            color="cyan"
                            delay={0.1}
                        />
                        <StatBar
                            label="FIRE RATE"
                            value={selectedWeapon.fireRate}
                            color="cyan"
                            delay={0.15}
                        />
                        <StatBar
                            label="RANGE"
                            value={selectedWeapon.range}
                            color="cyan"
                            delay={0.2}
                        />
                    </div>

                    {/* Divider */}
                    <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

                    {/* Purchase Button */}
                    <motion.div
                        whileHover={{ scale: 1.02, transition: STIFF_SPRING }}
                        whileTap={{ scale: 0.98, transition: { type: "spring", stiffness: 500, damping: 30 } }}
                    >
                        <NeonButton
                            onClick={handlePurchase}
                            disabled={isOwned || isProcessing || !currentAccount}
                            fullWidth
                            size="lg"
                            variant={isOwned ? 'success' : 'primary'}
                            className="py-5 text-lg tracking-[0.2em] font-bold"
                        >
                            {isOwned ? '✓ WEAPON ACQUIRED' : isProcessing ? 'PROCESSING...' : 'PURCHASE WEAPON'}
                        </NeonButton>
                    </motion.div>
                </motion.div>
            </div>
        </div>
    );
};

// 3D Weapon Models
const WeaponModel3D = ({ type, color }: { type: string; color: string }) => {
    const meshRef = useRef<THREE.Group>(null);

    // Slow idle rotation
    useFrame((_, delta) => {
        if (meshRef.current) {
            meshRef.current.rotation.y += delta * 0.15;
        }
    });

    return (
        <group ref={meshRef} rotation={[0, 0, Math.PI / 2]} scale={0.7}>
            {type === 'flame' && <FlamethrowerModel color={color} />}
            {type === 'star' && <StarCannonModel color={color} />}
        </group>
    );
};

// Hellfire Projector - Cone/Nozzle Design
const FlamethrowerModel = ({ color }: { color: string }) => {
    return (
        <group>
            {/* Main Body - Cylindrical Tank */}
            <mesh position={[0, 0, 0]}>
                <cylinderGeometry args={[0.3, 0.3, 2, 16]} />
                <meshStandardMaterial
                    color={color}
                    wireframe={true}
                    emissive={color}
                    emissiveIntensity={0.5}
                />
            </mesh>

            {/* Nozzle - Cone */}
            <mesh position={[0, 0, 1.3]} rotation={[Math.PI / 2, 0, 0]}>
                <coneGeometry args={[0.4, 0.8, 12]} />
                <meshStandardMaterial
                    color={color}
                    wireframe={true}
                    emissive={color}
                    emissiveIntensity={0.6}
                />
            </mesh>

            {/* Fuel Lines - Thin Cylinders */}
            <mesh position={[-0.35, 0.5, 0]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.05, 0.05, 0.8, 8]} />
                <meshStandardMaterial
                    color={color}
                    wireframe={true}
                    emissive={color}
                    emissiveIntensity={0.4}
                />
            </mesh>
            <mesh position={[-0.35, -0.5, 0]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.05, 0.05, 0.8, 8]} />
                <meshStandardMaterial
                    color={color}
                    wireframe={true}
                    emissive={color}
                    emissiveIntensity={0.4}
                />
            </mesh>

            {/* Grip */}
            <mesh position={[0, -0.6, 0]} rotation={[0, 0, Math.PI / 4]}>
                <boxGeometry args={[0.15, 0.6, 0.15]} />
                <meshStandardMaterial
                    color={color}
                    wireframe={true}
                    emissive={color}
                    emissiveIntensity={0.3}
                />
            </mesh>
        </group>
    );
};

// Star-Eater Cannon - Complex Orbital Design
const StarCannonModel = ({ color }: { color: string }) => {
    return (
        <group>
            {/* Core Sphere */}
            <mesh position={[0, 0, 0]}>
                <icosahedronGeometry args={[0.5, 1]} />
                <meshStandardMaterial
                    color={color}
                    wireframe={true}
                    emissive={color}
                    emissiveIntensity={0.8}
                />
            </mesh>

            {/* Barrel - Long Cylinder */}
            <mesh position={[0, 0, 1.5]} rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[0.15, 0.25, 2, 12]} />
                <meshStandardMaterial
                    color={color}
                    wireframe={true}
                    emissive={color}
                    emissiveIntensity={0.5}
                />
            </mesh>

            {/* Orbital Rings */}
            <mesh position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
                <torusGeometry args={[0.8, 0.05, 8, 24]} />
                <meshStandardMaterial
                    color={color}
                    wireframe={true}
                    emissive={color}
                    emissiveIntensity={0.6}
                />
            </mesh>
            <mesh position={[0, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
                <torusGeometry args={[0.8, 0.05, 8, 24]} />
                <meshStandardMaterial
                    color={color}
                    wireframe={true}
                    emissive={color}
                    emissiveIntensity={0.6}
                />
            </mesh>

            {/* Energy Spheres Around Core */}
            {[0, 1, 2, 3].map((i) => {
                const angle = (i / 4) * Math.PI * 2;
                return (
                    <mesh
                        key={i}
                        position={[
                            Math.cos(angle) * 0.9,
                            Math.sin(angle) * 0.9,
                            0
                        ]}
                    >
                        <sphereGeometry args={[0.1, 8, 8]} />
                        <meshStandardMaterial
                            color={color}
                            wireframe={true}
                            emissive={color}
                            emissiveIntensity={0.7}
                        />
                    </mesh>
                );
            })}

            {/* Rear Stabilizers */}
            <mesh position={[0, 0.4, -0.8]}>
                <boxGeometry args={[0.1, 0.6, 0.1]} />
                <meshStandardMaterial
                    color={color}
                    wireframe={true}
                    emissive={color}
                    emissiveIntensity={0.4}
                />
            </mesh>
            <mesh position={[0, -0.4, -0.8]}>
                <boxGeometry args={[0.1, 0.6, 0.1]} />
                <meshStandardMaterial
                    color={color}
                    wireframe={true}
                    emissive={color}
                    emissiveIntensity={0.4}
                />
            </mesh>
        </group>
    );
};

// Weapon List Item Component
const WeaponListItem = ({
    weapon,
    index,
    isSelected,
    isOwned,
    onClick
}: {
    weapon: WeaponItem;
    index: number;
    isSelected: boolean;
    isOwned: boolean;
    onClick: () => void;
}) => {
    return (
        <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ ...SPRING_CONFIG, delay: index * 0.08 }}
        >
            <motion.button
                onClick={onClick}
                whileHover={{
                    x: 4,
                    transition: STIFF_SPRING
                }}
                whileTap={{ scale: 0.98, transition: STIFF_SPRING }}
                className={`
                    w-full p-3 rounded border text-left relative overflow-hidden group
                    ${isSelected
                        ? 'bg-cyan-500/15 border-cyan-500/50 text-white'
                        : 'bg-white/5 border-white/10 text-white/60 hover:border-cyan-500/30'
                    }
                    transition-colors
                `}
            >
                {/* Selection Highlight */}
                {isSelected && (
                    <motion.div
                        layoutId="weapon-selection"
                        className="absolute inset-0 bg-cyan-500/10 rounded"
                        transition={STIFF_SPRING}
                    />
                )}

                {/* Content */}
                <div className="relative z-10 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        {/* Selection Indicator */}
                        <motion.div
                            animate={isSelected ? {
                                scale: [1, 1.2, 1],
                                opacity: [0.5, 1, 0.5]
                            } : {}}
                            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                            className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-cyan-500' : 'bg-white/20'
                                }`}
                        />

                        {/* Weapon Name */}
                        <span className={`text-sm font-bold tracking-wide ${isSelected ? 'text-white' : 'text-current'
                            }`}>
                            {weapon.name}
                        </span>
                    </div>

                    {/* Owned Badge */}
                    {isOwned && (
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={STIFF_SPRING}
                            className="px-2 py-0.5 bg-green-500/20 border border-green-500/30 rounded text-[9px] text-green-400 font-bold uppercase tracking-wider"
                        >
                            ✓
                        </motion.div>
                    )}
                </div>

                {/* Hover Scanline */}
                <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-500/10 to-transparent opacity-0 group-hover:opacity-100 pointer-events-none"
                    animate={{ x: ['-100%', '100%'] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                />
            </motion.button>
        </motion.div>
    );
};

// Enhanced StatBar Component with Hover & Spring Physics
const StatBar = ({
    label,
    value,
    color = "cyan",
    delay = 0
}: {
    label: string;
    value: number;
    color?: string;
    delay?: number;
}) => {
    const colorMap = {
        cyan: 'bg-cyan-500 shadow-[0_0_12px_rgba(6,182,212,0.6)]',
        orange: 'bg-orange-500 shadow-[0_0_12px_rgba(249,115,22,0.6)]',
        purple: 'bg-purple-500 shadow-[0_0_12px_rgba(168,85,247,0.6)]',
    } as const;

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...SPRING_CONFIG, delay }}
            className="group"
        >
            <div className="flex items-center justify-between mb-2">
                <div className="text-[10px] text-white/40 tracking-widest uppercase font-mono">
                    {label}
                </div>
                <motion.div
                    className="text-xs font-mono font-bold text-cyan-400 tabular-nums"
                    whileHover={{ scale: 1.1, transition: STIFF_SPRING }}
                >
                    {value}
                </motion.div>
            </div>

            {/* Bar Container */}
            <div className="h-2 bg-white/10 rounded-full overflow-hidden relative">
                {/* Animated Fill */}
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${value * 10}%` }}
                    transition={SPRING_CONFIG}
                    className={`h-full ${colorMap[color as keyof typeof colorMap] || colorMap.cyan} group-hover:brightness-125`}
                />

                {/* Glow Pulse on Hover */}
                <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100"
                    animate={{ x: ['-100%', '100%'] }}
                    transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
                />
            </div>
        </motion.div>
    );
};
