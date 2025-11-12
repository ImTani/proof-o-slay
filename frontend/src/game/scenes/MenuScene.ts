/**
 * MenuScene - Main menu with instructions and start button
 * Handles keyboard/gamepad navigation
 */

import Phaser from 'phaser';
import { DISPLAY_CONFIG } from '../config/GameConfig';
import { FocusManager } from '../systems/FocusManager';
import { createButton } from '../entities/ButtonEntity';

export class MenuScene extends Phaser.Scene {
  private focusManager!: FocusManager;

  constructor() {
    super({ key: 'MenuScene' });
  }

  create() {
    const { WIDTH, HEIGHT } = DISPLAY_CONFIG;
    const centerX = WIDTH / 2;
    const centerY = HEIGHT / 2;

    // Initialize focus manager
    this.focusManager = new FocusManager(this);

    // Background
    this.add.rectangle(0, 0, WIDTH, HEIGHT, 0x1a1a2e).setOrigin(0, 0);

    // Title
    const title = this.add.text(centerX, centerY - 250, '🎮 Proof O\' Slay', {
      fontSize: '72px',
      color: '#4287f5',
      fontFamily: 'Arial',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 6,
    });
    title.setOrigin(0.5);

    // Subtitle
    const subtitle = this.add.text(
      centerX,
      centerY - 170,
      'Survive the waves. Collect the shards. Forge your legend.',
      {
        fontSize: '28px',
        color: '#aaaaaa',
        fontFamily: 'Arial',
      }
    );
    subtitle.setOrigin(0.5);

    // Instructions container background
    const instructionsBg = this.add.rectangle(
      centerX,
      centerY - 30,
      1000,
      280,
      0x2a2a3e,
      0.8
    );
    instructionsBg.setOrigin(0.5);

    // Controls section (left)
    const controlsTitle = this.add.text(centerX - 220, centerY - 100, '🎮 Controls', {
      fontSize: '24px',
      color: '#4287f5',
      fontFamily: 'Arial',
      fontStyle: 'bold',
    });
    controlsTitle.setOrigin(0.5);

    const controlsText = [
      'WASD / Arrows - Move',
      'Mouse - Aim',
      'Click / RT - Shoot',
      'Gamepad - Full support',
    ];

    controlsText.forEach((text, index) => {
      this.add.text(centerX - 220, centerY - 60 + index * 35, text, {
        fontSize: '18px',
        color: '#ffffff',
        fontFamily: 'Arial',
      }).setOrigin(0.5);
    });

    // Objective section (right)
    const objectiveTitle = this.add.text(centerX + 220, centerY - 100, '🎯 Objective', {
      fontSize: '24px',
      color: '#4caf50',
      fontFamily: 'Arial',
      fontStyle: 'bold',
    });
    objectiveTitle.setOrigin(0.5);

    const objectiveText = [
      'Kill enemies for Shards',
      'Survive the waves!',
      'Enemies get stronger',
      'Beat your high score',
    ];

    objectiveText.forEach((text, index) => {
      this.add.text(centerX + 220, centerY - 60 + index * 35, text, {
        fontSize: '18px',
        color: '#ffffff',
        fontFamily: 'Arial',
      }).setOrigin(0.5);
    });

    // Start button - using button factory
    const startButton = createButton(
      this,
      centerX,
      centerY + 180,
      'START GAME',
      () => this.startGame(),
      {
        style: 'primary',
        fontSize: '36px',
        icon: '▶',
        focusIndex: 0,
      }
    );

    // Register with focus manager (auto-focus enabled by default)
    this.focusManager.register(startButton.text);

    // Hint text
    const hintText = this.add.text(
      centerX,
      HEIGHT - 50,
      'Press ENTER or click START to begin',
      {
        fontSize: '18px',
        color: '#666666',
        fontFamily: 'Arial',
      }
    );
    hintText.setOrigin(0.5);

    // Pulsing animation for hint
    this.tweens.add({
      targets: hintText,
      alpha: 0.3,
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  update(time: number) {
    // Update focus manager for keyboard/gamepad navigation
    this.focusManager.update(time);
  }

  private startGame() {
    // Transition to game scene
    this.scene.start('GameScene');
  }
}
