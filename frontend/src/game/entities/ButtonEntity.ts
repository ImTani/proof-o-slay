/**
 * ButtonEntity - Factory for creating standardized, focusable buttons
 * 
 * This factory creates buttons with:
 * - Automatic UIComponent integration for focus management
 * - Built-in highlight rectangles
 * - Consistent visual states (normal, hover, focused, disabled)
 * - Mouse and keyboard/gamepad interaction
 * - Configurable styling
 * 
 * Usage:
 *   const button = createButton(scene, x, y, 'PLAY', () => scene.start('GameScene'));
 *   const styledButton = createButton(scene, x, y, 'DANGER', callback, { style: 'danger' });
 */

import Phaser from 'phaser';
import { createUIComponent } from '../components/UIComponent';

/**
 * Button style presets
 */
export type ButtonStyle = 'primary' | 'secondary' | 'success' | 'danger' | 'warning';

/**
 * Button configuration options
 */
export interface ButtonConfig {
  /** Visual style preset (default: 'primary') */
  style?: ButtonStyle;
  
  /** Font size (default: '32px') */
  fontSize?: string;
  
  /** Custom text color (overrides style preset) */
  textColor?: string;
  
  /** Custom background color (overrides style preset) */
  backgroundColor?: string;
  
  /** Custom hover background color */
  hoverColor?: string;
  
  /** Custom focus background color */
  focusColor?: string;
  
  /** Padding for text (default: { x: 40, y: 20 }) */
  padding?: { x: number; y: number };
  
  /** Focus index for navigation order (default: auto-assigned) */
  focusIndex?: number;
  
  /** Depth/z-index (default: 2000) */
  depth?: number;
  
  /** Enable/disable scroll following camera (default: false = fixed to camera) */
  scrollFactor?: number;
  
  /** Icon or emoji prefix (e.g., '▶', '⬅', '🎮') */
  icon?: string;
  
  /** Scale on hover (default: 1.05) */
  hoverScale?: number;
  
  /** Scale on focus (default: 1.1) */
  focusScale?: number;
}

/**
 * Style preset definitions
 */
const STYLE_PRESETS: Record<ButtonStyle, { bg: string; hover: string; focus: string }> = {
  primary: {
    bg: '#4287f5',      // Blue
    hover: '#5a9aff',
    focus: '#4caf50',   // Green when focused
  },
  secondary: {
    bg: '#333333',      // Dark gray
    hover: '#555555',
    focus: '#666666',
  },
  success: {
    bg: '#4caf50',      // Green
    hover: '#66bb6a',
    focus: '#81c784',
  },
  danger: {
    bg: '#f44336',      // Red
    hover: '#e57373',
    focus: '#ef5350',
  },
  warning: {
    bg: '#ff9800',      // Orange
    hover: '#ffa726',
    focus: '#ffb74d',
  },
};

/**
 * Button entity data structure
 */
export interface ButtonEntity {
  /** The button text object */
  text: Phaser.GameObjects.Text;
  
  /** The highlight rectangle */
  highlight: Phaser.GameObjects.Rectangle;
  
  /** Cleanup function to destroy both objects */
  destroy: () => void;
}

/**
 * Create a standardized button with focus management
 * 
 * @param scene - The scene to create the button in
 * @param x - X position
 * @param y - Y position
 * @param label - Button text
 * @param onClick - Callback when button is activated
 * @param config - Optional configuration
 * @returns ButtonEntity with text and highlight references
 */
export function createButton(
  scene: Phaser.Scene,
  x: number,
  y: number,
  label: string,
  onClick: () => void,
  config: ButtonConfig = {}
): ButtonEntity {
  // Apply defaults
  const style = config.style || 'primary';
  const preset = STYLE_PRESETS[style];
  const fontSize = config.fontSize || '32px';
  const padding = config.padding || { x: 40, y: 20 };
  const depth = config.depth ?? 2000;
  const scrollFactor = config.scrollFactor ?? 0;
  const hoverScale = config.hoverScale ?? 1.05;
  const focusScale = config.focusScale ?? 1.1;
  
  // Resolve colors
  const backgroundColor = config.backgroundColor || preset.bg;
  const hoverColor = config.hoverColor || preset.hover;
  const focusColor = config.focusColor || preset.focus;
  const textColor = config.textColor || '#ffffff';
  
  // Add icon if provided
  const displayText = config.icon ? `${config.icon} ${label}` : label;
  
  // Create button text
  const button = scene.add.text(x, y, displayText, {
    fontSize,
    color: textColor,
    fontFamily: 'Arial',
    fontStyle: 'bold',
    backgroundColor,
    padding,
  });
  button.setOrigin(0.5);
  button.setScrollFactor(scrollFactor);
  button.setDepth(depth);
  button.setInteractive({ useHandCursor: true });
  
  // Create highlight rectangle
  const highlight = scene.add.rectangle(
    x,
    y,
    button.width + 20,
    button.height + 20,
    0xffff00,
    0
  );
  highlight.setStrokeStyle(4, 0xffff00, 1);
  highlight.setOrigin(0.5);
  highlight.setScrollFactor(scrollFactor);
  highlight.setDepth(depth - 1);
  highlight.setVisible(false);
  
  // Add UIComponent for focus management
  button.setData(
    'ui',
    createUIComponent(
      config.focusIndex ?? 0,
      onClick, // onActivate
      () => {
        // onFocus
        button.setBackgroundColor(focusColor);
        button.setScale(focusScale);
        highlight.setVisible(true);
        highlight.setScale(focusScale);
      },
      () => {
        // onBlur
        button.setBackgroundColor(backgroundColor);
        button.setScale(1.0);
        highlight.setVisible(false);
        highlight.setScale(1.0);
      }
    )
  );
  
  // Mouse click handler
  button.on('pointerdown', onClick);
  
  // Hover effects
  button.on('pointerover', () => {
    const ui = button.getData('ui');
    if (!ui.focused) {
      button.setBackgroundColor(hoverColor);
      button.setScale(hoverScale);
    }
  });
  
  button.on('pointerout', () => {
    const ui = button.getData('ui');
    if (!ui.focused) {
      button.setBackgroundColor(backgroundColor);
      button.setScale(1.0);
    }
  });
  
  // Return entity with cleanup function
  return {
    text: button,
    highlight,
    destroy: () => {
      button.destroy();
      highlight.destroy();
    },
  };
}
