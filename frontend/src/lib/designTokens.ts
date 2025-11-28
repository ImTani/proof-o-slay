/**
 * Design System Tokens
 * Single source of truth for all visual constants across Hub scenes
 * 
 * Usage:
 * import { SPRING_CONFIG, COLORS, SPACING, TYPOGRAPHY, EFFECTS } from '@/lib/designTokens';
 */

// ============================================================================
// ANIMATION
// ============================================================================

/**
 * Default spring physics for smooth, mechanical feel
 * Use for: Most transitions, entrances, exits
 */
export const SPRING_CONFIG = {
    type: "spring" as const,
    stiffness: 300,
    damping: 30
};

/**
 * Stiff spring physics for snappy, responsive feel
 * Use for: Hover states, active states, quick micro-interactions
 */
export const STIFF_SPRING = {
    type: "spring" as const,
    stiffness: 400,
    damping: 25
};

/**
 * Delay between staggered list item animations
 */
export const STAGGER_DELAY = 0.06;

/**
 * Standard animation durations (in seconds)
 */
export const DURATIONS = {
    fast: 0.2,
    normal: 0.3,
    slow: 0.5,
    pulse: 2,
    scanline: 1.5
};

// ============================================================================
// COLORS (Tailwind Class Names)
// ============================================================================

export const COLORS = {
    /**
     * System colors - Primary interactive elements and UI chrome
     */
    system: {
        primary: 'cyan-400',           // Main interactive elements, highlights
        primaryMuted: 'cyan-500/60',   // Secondary text, descriptions
        primarySubtle: 'cyan-500/30',  // Subtle borders, inactive states

        border: {
            subtle: 'white/10',          // Dividers, panel separators
            normal: 'white/20',          // Standard borders
            emphasized: 'cyan-500/40'    // Active borders, focus states
        }
    },

    /**
     * Currency colors - Game economy tokens
     */
    currency: {
        slay: {
            base: 'yellow-400',
            glow: 'yellow-500',
            muted: 'yellow-500/50'
        },
        shards: {
            base: 'blue-400',
            glow: 'blue-500',
            muted: 'blue-500/50'
        }
    },

    /**
     * State colors - Status indicators and feedback
     */
    states: {
        success: {
            base: 'green-400',
            muted: 'green-500/50',
            bg: 'green-500/10',
            border: 'green-500/30'
        },
        warning: {
            base: 'yellow-500',
            muted: 'yellow-500/80',
            bg: 'yellow-500/10',
            border: 'yellow-500/20'
        },
        danger: {
            base: 'red-500',
            muted: 'red-500/80',
            bg: 'red-500/10',
            border: 'red-500/30'
        },
        info: {
            base: 'blue-400',
            muted: 'blue-500/60'
        }
    },

    /**
     * Special feature colors
     */
    special: {
        purple: 'purple-400',  // NFTs, Cybernetics
        pink: 'pink-400',      // Jackpot accents
        magenta: 'pink-500'    // Alternative accent
    }
};

// ============================================================================
// SPACING (Tailwind Class Names)
// ============================================================================

export const SPACING = {
    /**
     * Container padding - Top-level scene wrapper
     */
    scene: 'p-8',

    /**
     * Gap between major sections
     */
    section: 'gap-8',

    /**
     * Gap between cards in grids
     */
    card: 'gap-6',

    /**
     * Gap between items in lists
     */
    item: 'gap-4',

    /**
     * Tight spacing for related elements
     */
    compact: 'gap-3',

    /**
     * Inline elements (icons + text, badges, etc.)
     */
    inline: 'gap-2'
};

// ============================================================================
// TYPOGRAPHY (Tailwind Class Combinations)
// ============================================================================

export const TYPOGRAPHY = {
    /**
     * Heading styles
     */
    heading: {
        hero: 'text-5xl font-black tracking-[0.2em]',
        large: 'text-4xl font-bold tracking-wider',
        medium: 'text-2xl font-bold tracking-wider',
        small: 'text-xl font-bold tracking-wide'
    },

    /**
     * Body text styles
     */
    body: {
        normal: 'text-sm leading-relaxed',
        small: 'text-xs leading-relaxed'
    },

    /**
     * Tech/system text styles
     */
    tech: {
        label: 'text-[10px] font-mono uppercase tracking-widest',
        decorator: 'text-[9px] font-mono uppercase tracking-widest',
        monospace: 'font-mono tabular-nums'
    }
};

// ============================================================================
// EFFECTS (Raw values for style objects and classes)
// ============================================================================

export const EFFECTS = {
    /**
     * Glow/shadow sizes (for drop-shadow)
     */
    glow: {
        normal: '0 0 10px',
        emphasized: '0 0 20px',
        strong: '0 0 30px'
    },

    /**
     * Shadow colors
     */
    shadow: {
        normal: 'rgba(0,0,0,0.3)',
        strong: 'rgba(0,0,0,0.5)'
    },

    /**
     * Blur amounts
     */
    blur: {
        subtle: '12px',
        normal: '24px',
        heavy: '48px'
    },

    /**
     * Opacity levels (numeric values for animations/styles)
     */
    opacity: {
        glow: {
            normal: 0.5,
            emphasized: 0.6
        },
        border: {
            subtle: 0.1,
            normal: 0.2,
            emphasized: 0.4
        },
        scanline: {
            static: 0.05,
            animated: 0.1
        }
    }
};

/**
 * Border opacity standardization (Tailwind opacity suffixes)
 * 
 * Use these consistent opacity levels for all borders:
 * - subtle: Very light separators, panel dividers
 * - normal: Standard borders, card outlines  
 * - emphasized: Active borders, focus states, hover emphasis
 * 
 * Usage: `border-white/${BORDER_OPACITY.normal}` or `border-cyan-500/${BORDER_OPACITY.emphasized}`
 */
export const BORDER_OPACITY = {
    subtle: '10',      // /10 - Very light separators
    normal: '20',      // /20 - Standard borders
    emphasized: '40'   // /40 - Active/focused borders
};

// ============================================================================
// COMPONENT VARIANTS
// ============================================================================

/**
 * Badge color variants
 */
export const BADGE_VARIANTS = {
    owned: {
        bg: COLORS.states.success.bg,
        text: COLORS.states.success.base,
        border: COLORS.states.success.border
    },
    locked: {
        bg: COLORS.states.danger.bg,
        text: COLORS.states.danger.base,
        border: COLORS.states.danger.border
    },
    available: {
        bg: COLORS.system.border.subtle,
        text: COLORS.system.primary,
        border: COLORS.system.primarySubtle
    },
    selected: {
        bg: 'cyan-500/20',
        text: COLORS.system.primary,
        border: 'cyan-500/50'
    }
};

/**
 * Hover state presets (for motion.div whileHover)
 * 
 * HOVER PHILOSOPHY:
 * - Cards: Lift upward (y: -4) to suggest "picking up" from surface
 * - Buttons: Scale slightly (1.02) for subtle emphasis without displacement
 * - Icons: Wiggle/rotate for playful, responsive feedback
 * - Text elements: Slide right for directional affordance
 * 
 * CONSISTENCY RULE:
 * All shop items, NFT cards, duration cards, etc. should use cardLift
 * All buttons (NeonButton, action buttons) should use buttonScale
 * This creates a unified interaction language across the Hub
 */
export const HOVER_STATES = {
    /**
     * Cards lift up slightly
     */
    cardLift: {
        y: -4,
        transition: STIFF_SPRING
    },

    /**
     * Buttons scale slightly
     */
    buttonScale: {
        scale: 1.02,
        transition: STIFF_SPRING
    },

    /**
     * Icons wiggle/rotate
     */
    iconWiggle: {
        scale: 1.1,
        rotate: [0, -5, 5, 0],
        transition: {
            ...STIFF_SPRING,
            rotate: { duration: 0.4 }
        }
    },

    /**
     * Slide right on hover
     */
    slideRight: {
        x: 3,
        transition: STIFF_SPRING
    }
};

/**
 * Active state presets (for motion.div whileTap)
 */
export const ACTIVE_STATES = {
    /**
     * Micro scale down on click
     */
    microScale: {
        scale: 0.98,
        transition: STIFF_SPRING
    }
};

// ============================================================================
// TECH DECORATOR GUIDELINES
// ============================================================================

/**
 * Tech Decorator Format Guidelines
 * 
 * ACCEPTABLE PATTERNS:
 * 
 * 1. Dot Separator (Standard):
 *    "SYSTEM.MODULE.NAME"
 *    Examples: "COMMAND.CENTER", "INPUT.RAW", "ARMORY.INDEX"
 * 
 * 2. Double Colon (Emphasized):
 *    "PROTOCOL :: EVENT.PARAMS"
 *    Examples: "INPUT.CONFIG :: STAKE.PARAMETERS", "VOID.PROTOCOL :: EVENT.PARAMS"
 * 
 * USAGE GUIDELINES:
 * - Most scenes use dot separator (.) for consistency
 * - Special/high-stakes scenes (StakingScene, JackpotScene) use (::) for visual emphasis
 * - Both formats are acceptable; variation adds scene personality
 */
export const TECH_DECORATOR_EXAMPLES = {
    standard: [
        "COMMAND.CENTER",
        "INPUT.RAW",
        "OUTPUT.PROCESSED",
        "SHOP.INVENTORY",
        "ARMORY.INDEX"
    ],
    emphasized: [
        "INPUT.CONFIG :: STAKE.PARAMETERS",
        "VOID.PROTOCOL :: EVENT.PARAMS",
        "OUTPUT.PROJECTION :: RISK.CALC"
    ]
};
