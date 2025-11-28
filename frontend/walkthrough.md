# UI Component Audit and Refactor

## Objective
Consolidate duplicate UI components into a single, high-quality source of truth (`src/components/ui`) and refactor the application to use them.

## Changes

### 1. Unified Component Library (`src/components/ui`)

*   **`NeonButton.tsx`**:
    *   Added `ghost` variant for text-only/icon-only buttons (used in `Hub.tsx`).
    *   Added `warning` (Yellow) and `success` (Green) variants to support game economy colors.
*   **`NeonCard.tsx`**:
    *   Added `interactive` prop for hover effects.
    *   Added `selected` prop for active states (used in `WeaponShop.tsx`).
    *   Added `warning` and `success` variants.
*   **`NeonModal.tsx`** (New):
    *   Created a reusable modal component to replace ad-hoc implementations.
    *   Supports all color variants (`primary`, `secondary`, `accent`, `danger`, `warning`, `success`).
    *   Includes standard header with title and close button, and backdrop animations.

### 2. Refactored Components

*   **`ForgeUI.tsx`**:
    *   Replaced custom modal implementation with `NeonModal`.
    *   Updated to use `warning` variant for consistency with the "Matter Forge" yellow theme.
*   **`WeaponShop.tsx`**:
    *   Replaced inline card list items with `NeonCard`.
    *   Utilized `interactive` and `selected` props for the weapon selection list.
*   **`ConsumablesShop.tsx`**:
    *   Refactored `ShopCard` to wrap `NeonCard`.
    *   Mapped `isOwned` state to `success` variant.
    *   Mapped affordability to `primary` vs `danger` variants.
*   **`NFTUpgradePanel.tsx`**:
    *   Replaced inline card implementation with `NeonCard`.
    *   Mapped item glow colors (Red, Magenta, Blue, Purple, Green) to corresponding `NeonCard` variants.
*   **`Hub.tsx`**:
    *   Replaced raw HTML `<button>` for "Return to Command" with `NeonButton` (`variant="ghost"`).

## Verification
*   **Visual Consistency**: All UI elements now use the shared "Tron/Neon" design tokens (borders, shadows, glows).
*   **Code Quality**: Reduced code duplication by removing inline styles and ad-hoc component definitions.
*   **Functionality**: Preserved all existing logic (selection, purchase, upgrades) while upgrading the visuals.
