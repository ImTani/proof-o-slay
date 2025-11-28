/**
 * Icon Usage Guidelines for Hub Components
 * 
 * WHEN TO USE CYBERICON:
 * - Prominent feature icons (scene headers, main actions)
 * - Icons that should have glow effects for emphasis
 * - Large icons (16px+) that benefit from styled treatment
 * - Icons representing game features, currencies, or states
 * 
 * WHEN TO USE LUCIDE ICONS DIRECTLY:
 * - Small utility icons (12px or less)
 * - Directional indicators (arrows, chevrons)
 * - Status indicators (checkmarks, warnings) in compact spaces
 * - Icons inside text or inline elements
 * - Icons where glow would be distracting
 * 
 * EXAMPLES:
 * 
 * CyberIcon Usage:
 * ```tsx
 * // Scene header icon
 * <CyberIcon icon={TrendingUp} glowColor="cyan" className="w-8 h-8" />
 * 
 * // Currency display
 * <CyberIcon icon={Coins} glowColor="yellow" className="w-6 h-6" />
 * 
 * // NFT/Feature icons
 * <CyberIcon icon={CircleDot} glowColor="purple" className="w-12 h-12" />
 * ```
 * 
 * Direct Lucide Usage:
 * ```tsx
 * // Inline validation error
 * <AlertTriangle size={12} className="text-red-500" />
 * 
 * // Navigation arrow
 * <ArrowRight size={16} className="text-cyan-400" />
 * 
 * // Status checkmark
 * <CheckCircle size={14} className="text-green-500" />
 * ```
 * 
 * AUDIT RESULTS (Core Hub Components):
 * - Hub.tsx: Status indicators use direct Lucide (12px) ✓
 * - ConsumablesShop.tsx: Item icons wrapped in CyberIcon ✓
 * - WeaponShop.tsx: Feature icons use direct rendering (3D model icons) ✓
 * - NFTUpgradePanel.tsx: NFT icons wrapped in CyberIcon ✓
 * - StakingScene.tsx: Feature icons (TrendingUp) use direct Lucide (acceptable for inline)
 * - ForgeUI.tsx: Status icons (AlertTriangle, CheckCircle) use direct Lucide ✓
 * 
 * CONCLUSION:
 * Current icon usage patterns are appropriate and intentional.
 * CyberIcon is used for prominent feature icons requiring glow effects.
 * Direct Lucide icons are used for utility, status, and inline icons.
 * No changes required - pattern is well-established.
 */

export const ICON_USAGE_GUIDELINES = {
    useCyberIcon: [
        "Scene header feature icons",
        "Currency displays",
        "NFT/upgrade icons",
        "Large decorative icons (16px+)",
        "Icons requiring glow emphasis"
    ],
    useDirectLucide: [
        "Small utility icons (≤12px)",
        "Navigation arrows/indicators",
        "Inline status icons",
        "Validation feedback icons",
        "Text-embedded icons"
    ]
};
