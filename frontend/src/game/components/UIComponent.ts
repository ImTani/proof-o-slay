/**
 * UIComponent - Tracks focus state and navigation properties for UI elements
 * 
 * This component marks game objects as focusable for keyboard/gamepad navigation
 */

export interface UIComponent {
  focusable: true;
  focused: boolean;
  focusIndex: number; // Order in focus chain (0 = first)
  onFocus?: () => void; // Called when element receives focus
  onBlur?: () => void; // Called when element loses focus
  onActivate?: () => void; // Called when element is activated (Enter/A button)
  
  // Navigation hints (optional - for complex layouts)
  focusUp?: number; // Index of element to focus when pressing up
  focusDown?: number; // Index of element to focus when pressing down
  focusLeft?: number; // Index of element to focus when pressing left
  focusRight?: number; // Index of element to focus when pressing right
}

/**
 * Factory function to create a UI component
 */
export const createUIComponent = (
  focusIndex: number,
  onActivate?: () => void,
  onFocus?: () => void,
  onBlur?: () => void
): UIComponent => {
  return {
    focusable: true,
    focused: false,
    focusIndex,
    onFocus,
    onBlur,
    onActivate,
  };
};

/**
 * Helper to check if a game object has a UI component
 */
export const hasUIComponent = (obj: any): obj is { getData: (key: 'ui') => UIComponent } => {
  const ui = obj.getData?.('ui');
  return ui && ui.focusable === true;
};
