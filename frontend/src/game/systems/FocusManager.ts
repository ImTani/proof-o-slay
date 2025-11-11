/**
 * FocusManager - Handles keyboard and gamepad navigation for UI elements
 * 
 * This system manages focus state for UI elements, allowing users to navigate
 * using keyboard (arrow keys, tab, enter) or gamepad (D-pad, A button)
 */

import Phaser from 'phaser';
import type { UIComponent } from '../components/UIComponent';
import { hasUIComponent } from '../components/UIComponent';
import { INPUT_CONFIG } from '../config/GameConfig';

export class FocusManager {
  private scene: Phaser.Scene;
  private focusableElements: Phaser.GameObjects.GameObject[] = [];
  private currentFocusIndex: number = 0;
  
  // Input references
  private cursors?: Phaser.Types.Input.Keyboard.CursorKeys;
  private tabKey?: Phaser.Input.Keyboard.Key;
  private enterKey?: Phaser.Input.Keyboard.Key;
  private spaceKey?: Phaser.Input.Keyboard.Key;
  private gamepad?: Phaser.Input.Gamepad.Gamepad;
  
  // Input timing for preventing rapid repeat
  private lastNavigationTime: number = 0;
  private navigationCooldown: number = 200; // ms between navigation inputs

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    
    // Setup keyboard input
    if (scene.input.keyboard) {
      this.cursors = scene.input.keyboard.createCursorKeys();
      this.tabKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.TAB);
      this.enterKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
      this.spaceKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    }
  }

  /**
   * Register a game object as focusable
   * 
   * @param gameObject - The game object to register
   * @param autoFocus - If true, automatically focus this element if no other element is focused
   */
  register(gameObject: Phaser.GameObjects.GameObject, autoFocus: boolean = true): void {
    if (hasUIComponent(gameObject)) {
      this.focusableElements.push(gameObject);
      this.sortFocusableElements();
      
      // Auto-focus the first element if no element is currently focused
      if (autoFocus && !this.hasAnyFocus()) {
        this.focusFirst();
      }
    }
  }

  /**
   * Unregister a focusable element (e.g., when destroyed)
   */
  unregister(gameObject: Phaser.GameObjects.GameObject): void {
    const index = this.focusableElements.indexOf(gameObject);
    if (index > -1) {
      this.focusableElements.splice(index, 1);
      
      // Adjust current focus if needed
      if (this.currentFocusIndex >= this.focusableElements.length) {
        this.currentFocusIndex = Math.max(0, this.focusableElements.length - 1);
      }
    }
  }

  /**
   * Clear all focusable elements
   */
  clear(): void {
    this.focusableElements = [];
    this.currentFocusIndex = 0;
  }

  /**
   * Check if any element currently has focus
   */
  hasAnyFocus(): boolean {
    if (this.focusableElements.length === 0) return false;
    
    const currentElement = this.focusableElements[this.currentFocusIndex];
    if (!currentElement) return false;
    
    const ui = (currentElement as any).getData('ui');
    return ui && ui.focused;
  }

  /**
   * Sort elements by their focusIndex property
   */
  private sortFocusableElements(): void {
    this.focusableElements.sort((a, b) => {
      const aUI = (a as any).getData('ui') as UIComponent;
      const bUI = (b as any).getData('ui') as UIComponent;
      return aUI.focusIndex - bUI.focusIndex;
    });
  }

  /**
   * Focus a specific element by index
   */
  focusElement(index: number): void {
    if (this.focusableElements.length === 0) return;
    
    // Clamp index to valid range
    index = Phaser.Math.Clamp(index, 0, this.focusableElements.length - 1);
    
    // Blur current element
    const currentElement = this.focusableElements[this.currentFocusIndex];
    if (currentElement) {
      const currentUI = (currentElement as any).getData('ui') as UIComponent;
      currentUI.focused = false;
      currentUI.onBlur?.();
      this.applyFocusVisuals(currentElement as any, false);
    }
    
    // Focus new element
    this.currentFocusIndex = index;
    const newElement = this.focusableElements[this.currentFocusIndex];
    if (newElement) {
      const newUI = (newElement as any).getData('ui') as UIComponent;
      newUI.focused = true;
      newUI.onFocus?.();
      this.applyFocusVisuals(newElement as any, true);
    }
  }

  /**
   * Focus the first element
   */
  focusFirst(): void {
    this.focusElement(0);
  }

  /**
   * Move focus to next element
   */
  focusNext(): void {
    if (this.focusableElements.length === 0) return;
    const nextIndex = (this.currentFocusIndex + 1) % this.focusableElements.length;
    this.focusElement(nextIndex);
  }

  /**
   * Move focus to previous element
   */
  focusPrevious(): void {
    if (this.focusableElements.length === 0) return;
    const prevIndex = (this.currentFocusIndex - 1 + this.focusableElements.length) % this.focusableElements.length;
    this.focusElement(prevIndex);
  }

  /**
   * Activate the currently focused element
   */
  activateFocused(): void {
    if (this.focusableElements.length === 0) return;
    
    const element = this.focusableElements[this.currentFocusIndex];
    if (element) {
      const ui = (element as any).getData('ui') as UIComponent;
      ui.onActivate?.();
    }
  }

  /**
   * Apply visual feedback for focus state
   */
  private applyFocusVisuals(gameObject: any, focused: boolean): void {
    // Don't apply default visuals if the object has custom onFocus/onBlur callbacks
    // The callbacks will handle the visuals
    const ui = gameObject.getData('ui') as UIComponent;
    if (ui && (ui.onFocus || ui.onBlur)) {
      // Custom callbacks will handle visuals
      return;
    }
    
    // Default visual feedback for objects without custom handlers
    // Scale effect
    if (gameObject.setScale) {
      const scale = focused ? INPUT_CONFIG.KEYBOARD.FOCUS_VISUAL_SCALE : 1.0;
      this.scene.tweens.add({
        targets: gameObject,
        scaleX: scale,
        scaleY: scale,
        duration: 150,
        ease: 'Sine.easeOut',
      });
    }
    
    // Tint effect (for sprites)
    if (gameObject.setTint && !gameObject.style) {
      if (focused) {
        gameObject.setTint(INPUT_CONFIG.KEYBOARD.FOCUS_TINT);
      } else {
        gameObject.clearTint();
      }
    }
    
    // Text color effect (for text without backgroundColor)
    if (gameObject.setColor && gameObject.style && !gameObject.style.backgroundColor) {
      if (focused) {
        const originalColor = gameObject.style?.color || '#ffffff';
        gameObject.setData('originalColor', originalColor);
        gameObject.setColor('#ffff00'); // Yellow for focus
      } else {
        const originalColor = gameObject.getData('originalColor') || '#ffffff';
        gameObject.setColor(originalColor);
      }
    }
  }

  /**
   * Update method - call this in scene's update loop
   */
  update(time: number): void {
    if (this.focusableElements.length === 0) return;
    
    // Check for cooldown
    if (time - this.lastNavigationTime < this.navigationCooldown) {
      return;
    }
    
    // Get active gamepad
    if (this.scene.input.gamepad && this.scene.input.gamepad.total > 0) {
      this.gamepad = this.scene.input.gamepad.getPad(0);
    }
    
    // Check for navigation input
    let navigated = false;
    
    // Keyboard navigation
    if (this.cursors) {
      if (Phaser.Input.Keyboard.JustDown(this.cursors.down)) {
        this.focusNext();
        navigated = true;
      } else if (Phaser.Input.Keyboard.JustDown(this.cursors.up)) {
        this.focusPrevious();
        navigated = true;
      } else if (Phaser.Input.Keyboard.JustDown(this.cursors.left)) {
        this.focusPrevious();
        navigated = true;
      } else if (Phaser.Input.Keyboard.JustDown(this.cursors.right)) {
        this.focusNext();
        navigated = true;
      } else if (this.tabKey && Phaser.Input.Keyboard.JustDown(this.tabKey)) {
        if (this.scene.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT).isDown) {
          this.focusPrevious();
        } else {
          this.focusNext();
        }
        navigated = true;
      }
      
      // Activation
      if (this.enterKey && Phaser.Input.Keyboard.JustDown(this.enterKey)) {
        this.activateFocused();
      }
      if (this.spaceKey && Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
        this.activateFocused();
      }
    }
    
    // Gamepad navigation
    if (this.gamepad) {
      // D-pad navigation (vertical and horizontal)
      if (this.gamepad.down) {
        this.focusNext();
        navigated = true;
      } else if (this.gamepad.up) {
        this.focusPrevious();
        navigated = true;
      } else if (this.gamepad.left) {
        this.focusPrevious();
        navigated = true;
      } else if (this.gamepad.right) {
        this.focusNext();
        navigated = true;
      }
      
      // Left stick navigation (both vertical and horizontal)
      const leftStick = this.gamepad.leftStick;
      if (leftStick.y > 0.5 || leftStick.x > 0.5) {
        this.focusNext();
        navigated = true;
      } else if (leftStick.y < -0.5 || leftStick.x < -0.5) {
        this.focusPrevious();
        navigated = true;
      }
      
      // Activation (A button = button 0 on most gamepads)
      if (this.gamepad.buttons[0]?.pressed) {
        this.activateFocused();
      }
    }
    
    // Update navigation time if we navigated
    if (navigated) {
      this.lastNavigationTime = time;
    }
  }

  /**
   * Get the currently focused element
   */
  getFocusedElement(): Phaser.GameObjects.GameObject | null {
    return this.focusableElements[this.currentFocusIndex] || null;
  }

  /**
   * Get the number of focusable elements
   */
  getElementCount(): number {
    return this.focusableElements.length;
  }
}
