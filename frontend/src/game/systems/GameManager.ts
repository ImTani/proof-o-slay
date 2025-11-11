/**
 * GameManager - Global singleton for managing game state across scenes
 * 
 * This singleton provides a centralized place to track global game state
 * such as pause status, game-over status, and other cross-scene state.
 * 
 * Usage:
 *   const gameManager = GameManager.getInstance();
 *   gameManager.pause();
 *   if (gameManager.isPaused()) { ... }
 */

import Phaser from 'phaser';

export class GameManager {
  private static instance: GameManager | null = null;
  
  // Global game state
  private _isPaused: boolean = false;
  private _isGameOver: boolean = false;
  
  // Scene references (optional, for advanced functionality)
  private currentScene: Phaser.Scene | null = null;
  
  /**
   * Private constructor to enforce singleton pattern
   */
  private constructor() {
    // Private constructor
  }
  
  /**
   * Get the singleton instance
   */
  static getInstance(): GameManager {
    if (!GameManager.instance) {
      GameManager.instance = new GameManager();
    }
    return GameManager.instance;
  }
  
  /**
   * Reset the singleton (useful for testing or fresh game starts)
   */
  static reset(): void {
    GameManager.instance = null;
  }
  
  /**
   * Set the current active scene
   */
  setCurrentScene(scene: Phaser.Scene): void {
    this.currentScene = scene;
  }
  
  /**
   * Get the current active scene
   */
  getCurrentScene(): Phaser.Scene | null {
    return this.currentScene;
  }
  
  // ==================== PAUSE STATE ====================
  
  /**
   * Check if the game is paused
   */
  isPaused(): boolean {
    return this._isPaused;
  }
  
  /**
   * Pause the game
   */
  pause(): void {
    this._isPaused = true;
  }
  
  /**
   * Resume the game
   */
  resume(): void {
    this._isPaused = false;
  }
  
  /**
   * Toggle pause state
   */
  togglePause(): void {
    this._isPaused = !this._isPaused;
  }
  
  // ==================== GAME OVER STATE ====================
  
  /**
   * Check if the game is over
   */
  isGameOver(): boolean {
    return this._isGameOver;
  }
  
  /**
   * Set game over state
   */
  setGameOver(isGameOver: boolean): void {
    this._isGameOver = isGameOver;
  }
  
  // ==================== RESET ====================
  
  /**
   * Reset all game state (call when starting a new game)
   */
  resetGameState(): void {
    this._isPaused = false;
    this._isGameOver = false;
  }
}
