/**
 * MenuScene - Class selection menu with character cards
 * Handles keyboard/gamepad navigation
 */

import Phaser from 'phaser';
import { DISPLAY_CONFIG, CHARACTER_CLASSES } from '../config/GameConfig';
import { FocusManager } from '../systems/FocusManager';
import { createButton } from '../entities/ButtonEntity';
import { createClassCard, updateClassCardSelection, type ClassCardEntity } from '../entities/ClassCardEntity';

export class MenuScene extends Phaser.Scene {
  private focusManager!: FocusManager;
  private selectedClass: keyof typeof CHARACTER_CLASSES = 'WARRIOR';
  private classCards: Map<keyof typeof CHARACTER_CLASSES, ClassCardEntity> = new Map();

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
    const title = this.add.text(centerX, 100, '⚔️ Choose Your Class', {
      fontSize: '64px',
      color: '#4287f5',
      fontFamily: 'Arial',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 6,
    });
    title.setOrigin(0.5);

    // Create class cards using entity factory
    const warriorCard = createClassCard(this, centerX - 500, centerY, 'WARRIOR', 
      (className) => this.selectClass(className), 
      { focusIndex: 1 }
    );
    this.classCards.set('WARRIOR', warriorCard);
    this.focusManager.register(warriorCard.background);

    const mageCard = createClassCard(this, centerX, centerY, 'MAGE', 
      (className) => this.selectClass(className), 
      { focusIndex: 2 }
    );
    this.classCards.set('MAGE', mageCard);
    this.focusManager.register(mageCard.background);

    const rogueCard = createClassCard(this, centerX + 500, centerY, 'ROGUE', 
      (className) => this.selectClass(className), 
      { focusIndex: 3 }
    );
    this.classCards.set('ROGUE', rogueCard);
    this.focusManager.register(rogueCard.background);

    // Start button - using button factory
    const startButton = createButton(
      this,
      centerX,
      HEIGHT - 150,
      'START GAME',
      () => this.startGame(),
      {
        style: 'success',
        fontSize: '36px',
        icon: '▶',
        focusIndex: 0,
      }
    );

    // Register with focus manager
    this.focusManager.register(startButton.text);

    // Hint text
    const hintText = this.add.text(
      centerX,
      HEIGHT - 80,
      'Click a class card to select • Press ENTER to start',
      {
        fontSize: '18px',
        color: '#666666',
        fontFamily: 'Arial',
      }
    );
    hintText.setOrigin(0.5);

    // Initial selection
    this.selectClass('WARRIOR');
  }

  private selectClass(className: keyof typeof CHARACTER_CLASSES) {
    // Update all cards using the updateClassCardSelection helper
    this.classCards.forEach((card, key) => {
      updateClassCardSelection(card, key === className, this);
    });

    this.selectedClass = className;
    console.log(`✅ Selected class: ${CHARACTER_CLASSES[className].name}`);
  }

  update(time: number) {
    // Update focus manager for keyboard/gamepad navigation
    this.focusManager.update(time);
  }

  private startGame() {
    console.log(`🎮 Starting game as ${CHARACTER_CLASSES[this.selectedClass].name}`);
    
    // Get game config from registry and update selected class
    const gameConfig = this.registry.get('gameConfig');
    gameConfig.selectedClass = this.selectedClass;
    this.registry.set('gameConfig', gameConfig);
    
    // Transition to game scene
    this.scene.start('GameScene');
  }
}
