/**
 * MenuScene - Class selection menu with character cards
 * Handles keyboard/gamepad navigation
 */

import Phaser from 'phaser';
import { DISPLAY_CONFIG, CHARACTER_CLASSES, GAMBLING_CONFIG, calculatePayout, UI_STYLE, MENU_LAYOUT } from '../config/GameConfig';
import { FocusManager } from '../systems/FocusManager';
import { createButton } from '../entities/ButtonEntity';
import { createClassCard, updateClassCardSelection, type ClassCardEntity } from '../entities/ClassCardEntity';

export class MenuScene extends Phaser.Scene {
  private focusManager!: FocusManager;
  private selectedClass: keyof typeof CHARACTER_CLASSES = 'WARRIOR';
  private classCards: Map<keyof typeof CHARACTER_CLASSES, ClassCardEntity> = new Map();

  // Gambling state
  private gamblingEnabled = false;
  private selectedStakeIndex = 0; // Index into GAMBLING_CONFIG.STAKE_AMOUNTS
  private selectedGoalIndex = 0; // Index into GAMBLING_CONFIG.SURVIVAL_GOALS
  private jackpotMode = false;
  private jackpotTicketsAvailable = 0; // Will be set from React in Phase 3

  // Gambling UI elements
  private stakeCheckbox!: Phaser.GameObjects.Rectangle;
  private stakeCheckboxCheck!: Phaser.GameObjects.Text;
  private stakeButtons: Phaser.GameObjects.Rectangle[] = [];
  private stakeTexts: Phaser.GameObjects.Text[] = [];
  private goalButtons: Phaser.GameObjects.Rectangle[] = [];
  private goalTexts: Phaser.GameObjects.Text[] = [];
  private payoutText!: Phaser.GameObjects.Text;
  private jackpotToggle!: Phaser.GameObjects.Rectangle;
  private jackpotToggleCheck!: Phaser.GameObjects.Text;
  private jackpotTicketDisplay!: Phaser.GameObjects.Text;

  constructor() {
    super({ key: 'MenuScene' });
  }

  create() {
    const { WIDTH, HEIGHT } = DISPLAY_CONFIG;
    const centerX = WIDTH / 2;
    const centerY = HEIGHT / 2;

    // Initialize focus manager
    this.focusManager = new FocusManager(this);

    // Dark background with gradient effect
    const bgRect1 = this.add.rectangle(0, 0, WIDTH, HEIGHT, UI_STYLE.COLORS.DARK_BG).setOrigin(0, 0);
    const bgRect2 = this.add.rectangle(0, 0, WIDTH, HEIGHT / 2, UI_STYLE.COLORS.PANEL_BG, 0.3).setOrigin(0, 0);
    void bgRect1;
    void bgRect2;

    // Game title with icon
    const titleY = MENU_LAYOUT.TITLE.Y_OFFSET;
    const titleIcon = this.add.text(centerX, titleY - 20, '⚔️', {
      fontSize: MENU_LAYOUT.TITLE.ICON_SIZE,
    });
    titleIcon.setOrigin(0.5);

    const title = this.add.text(centerX, titleY + 60, 'PROOF O\' SLAY', {
      fontSize: MENU_LAYOUT.TITLE.TEXT_SIZE,
      color: '#4287f5',
      fontFamily: 'Arial',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 8,
    });
    title.setOrigin(0.5);

    const subtitle = this.add.text(centerX, titleY + 120, 'Choose Your Class', {
      fontSize: '28px',
      color: '#aaaaaa',
      fontFamily: 'Arial',
      fontStyle: 'italic',
    });
    subtitle.setOrigin(0.5);

    // Create class cards using entity factory - centered with proper spacing
    const cardY = centerY + MENU_LAYOUT.CLASS_CARDS.Y_OFFSET;
    const cardSpacing = MENU_LAYOUT.CLASS_CARDS.CARD_SPACING;

    const warriorCard = createClassCard(this, centerX - cardSpacing, cardY, 'WARRIOR',
      (className) => this.selectClass(className),
      { focusIndex: 1 }
    );
    this.classCards.set('WARRIOR', warriorCard);
    this.focusManager.register(warriorCard.background);

    const mageCard = createClassCard(this, centerX, cardY, 'MAGE',
      (className) => this.selectClass(className),
      { focusIndex: 2 }
    );
    this.classCards.set('MAGE', mageCard);
    this.focusManager.register(mageCard.background);

    const rogueCard = createClassCard(this, centerX + cardSpacing, cardY, 'ROGUE',
      (className) => this.selectClass(className),
      { focusIndex: 3 }
    );
    this.classCards.set('ROGUE', rogueCard);
    this.focusManager.register(rogueCard.background);

    // Start button - positioned at bottom
    const startButton = createButton(
      this,
      centerX,
      HEIGHT + MENU_LAYOUT.BUTTONS.START_Y,
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

    // Test Weapons button
    const testButton = createButton(
      this,
      centerX,
      HEIGHT + MENU_LAYOUT.BUTTONS.TEST_Y,
      'TEST WEAPONS',
      () => this.scene.start('TestScene'),
      {
        style: 'warning',
        fontSize: '24px',
        icon: '🔧',
        focusIndex: 4,
      }
    );
    this.focusManager.register(testButton.text);

    // Hint text
    const hintText = this.add.text(
      centerX,
      HEIGHT + MENU_LAYOUT.BUTTONS.HINT_Y,
      'Click a class card to select • Arrow keys to navigate • ENTER to start',
      {
        fontSize: '16px',
        color: '#666666',
        fontFamily: 'Arial',
      }
    );
    hintText.setOrigin(0.5);

    // ===== GAMBLING UI PANEL =====
    this.createGamblingUI(centerX, centerY);

    // Initial selection
    this.selectClass('WARRIOR');
  }

  private createGamblingUI(centerX: number, centerY: number) {
    const panelWidth = MENU_LAYOUT.GAMBLING_PANEL.WIDTH;
    const panelHeight = MENU_LAYOUT.GAMBLING_PANEL.HEIGHT;
    const panelX = centerX + MENU_LAYOUT.GAMBLING_PANEL.X_OFFSET;
    const panelY = centerY + MENU_LAYOUT.GAMBLING_PANEL.Y_OFFSET;

    // Panel background with border
    const panelBg = this.add.rectangle(panelX, panelY, panelWidth, panelHeight, UI_STYLE.COLORS.PANEL_BG, UI_STYLE.PANELS.OPACITY);
    panelBg.setStrokeStyle(UI_STYLE.PANELS.BORDER_WIDTH, UI_STYLE.COLORS.PANEL_BORDER);

    // Decorative header bar
    const headerBar = this.add.rectangle(panelX, panelY - panelHeight / 2 + 30, panelWidth, 60, UI_STYLE.COLORS.SECONDARY, 0.3);
    void headerBar;

    // Panel title
    this.add.text(panelX, panelY - panelHeight / 2 + 30, '🎲 Optional Gambling', {
      fontSize: '28px',
      color: '#f6ad55',
      fontFamily: 'Arial',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    // Enable/Disable checkbox
    const checkboxY = panelY - panelHeight / 2 + 90;
    this.stakeCheckbox = this.add.rectangle(panelX - 120, checkboxY, 28, 28, UI_STYLE.COLORS.PANEL_BORDER);
    this.stakeCheckbox.setStrokeStyle(2, 0xffffff);
    this.stakeCheckbox.setInteractive({ useHandCursor: true });
    this.stakeCheckboxCheck = this.add.text(panelX - 120, checkboxY, '', {
      fontSize: '20px',
      color: '#ffffff',
    }).setOrigin(0.5);

    this.add.text(panelX - 85, checkboxY, 'Enable Betting', {
      fontSize: '20px',
      color: '#ffffff',
      fontFamily: 'Arial',
    }).setOrigin(0, 0.5);

    this.stakeCheckbox.on('pointerdown', () => {
      this.gamblingEnabled = !this.gamblingEnabled;
      this.updateGamblingUI();
    });

    // Section divider
    const divider1Y = panelY - panelHeight / 2 + 130;
    this.add.rectangle(panelX, divider1Y, panelWidth - 40, 2, UI_STYLE.COLORS.PANEL_BORDER, 0.5);

    // Stake amount selector
    this.add.text(panelX, panelY - panelHeight / 2 + 160, 'Stake Amount:', {
      fontSize: '20px',
      color: '#cbd5e0',
      fontFamily: 'Arial',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    GAMBLING_CONFIG.STAKE_AMOUNTS.forEach((amount, index) => {
      const btnY = panelY - panelHeight / 2 + 205 + index * 50;
      const btn = this.add.rectangle(panelX, btnY, 140, 40, GAMBLING_CONFIG.COLORS.STAKE_BG);
      btn.setStrokeStyle(2, UI_STYLE.COLORS.PANEL_BORDER);
      btn.setInteractive({ useHandCursor: true });
      const txt = this.add.text(panelX, btnY, `${amount} $SLAY`, {
        fontSize: '18px',
        color: '#ffffff',
        fontFamily: 'Arial',
        fontStyle: 'bold',
      }).setOrigin(0.5);

      btn.on('pointerdown', () => {
        if (this.gamblingEnabled) {
          this.selectedStakeIndex = index;
          this.updateGamblingUI();
        }
      });

      this.stakeButtons.push(btn);
      this.stakeTexts.push(txt);
    });

    // Section divider
    const divider2Y = panelY - panelHeight / 2 + 375;
    this.add.rectangle(panelX, divider2Y, panelWidth - 40, 2, UI_STYLE.COLORS.PANEL_BORDER, 0.5);

    // Survival goal selector
    this.add.text(panelX, panelY - panelHeight / 2 + 405, 'Survival Goal:', {
      fontSize: '20px',
      color: '#cbd5e0',
      fontFamily: 'Arial',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    GAMBLING_CONFIG.SURVIVAL_GOALS.forEach((goal, index) => {
      const btnY = panelY - panelHeight / 2 + 450 + index * 50;
      const btn = this.add.rectangle(panelX, btnY, 140, 40, GAMBLING_CONFIG.COLORS.GOAL_BG);
      btn.setStrokeStyle(2, UI_STYLE.COLORS.PANEL_BORDER);
      btn.setInteractive({ useHandCursor: true });
      const txt = this.add.text(panelX, btnY, goal.label, {
        fontSize: '18px',
        color: '#ffffff',
        fontFamily: 'Arial',
        fontStyle: 'bold',
      }).setOrigin(0.5);

      btn.on('pointerdown', () => {
        if (this.gamblingEnabled) {
          this.selectedGoalIndex = index;
          this.updateGamblingUI();
        }
      });

      this.goalButtons.push(btn);
      this.goalTexts.push(txt);
    });

    // Bottom section - payout and jackpot
    const bottomY = panelY + panelHeight / 2 - 150;

    // Payout preview
    this.payoutText = this.add.text(panelX, bottomY, '', {
      fontSize: '20px',
      color: '#f6ad55',
      fontFamily: 'Arial',
      fontStyle: 'bold',
      align: 'center',
    }).setOrigin(0.5);

    // Jackpot section
    const jackpotY = bottomY + 70;

    // Jackpot ticket display
    this.jackpotTicketDisplay = this.add.text(panelX, jackpotY - 25, `🎟️ Tickets: ${this.jackpotTicketsAvailable}`, {
      fontSize: '16px',
      color: '#9f7aea',
      fontFamily: 'Arial',
    }).setOrigin(0.5);

    // Note: jackpotTicketDisplay will be updated by React in Phase 3
    void this.jackpotTicketDisplay; // Suppress unused warning

    // Progressive jackpot toggle
    this.jackpotToggle = this.add.rectangle(panelX - 120, jackpotY + 10, 28, 28, UI_STYLE.COLORS.PANEL_BORDER);
    this.jackpotToggle.setStrokeStyle(2, 0x9f7aea);
    this.jackpotToggle.setInteractive({ useHandCursor: true });
    this.jackpotToggleCheck = this.add.text(panelX - 120, jackpotY + 10, '', {
      fontSize: '20px',
      color: '#9f7aea',
    }).setOrigin(0.5);

    this.add.text(panelX - 85, jackpotY + 10, 'Jackpot Mode', {
      fontSize: '18px',
      color: '#9f7aea',
      fontFamily: 'Arial',
    }).setOrigin(0, 0.5);

    this.jackpotToggle.on('pointerdown', () => {
      if (this.gamblingEnabled && this.jackpotTicketsAvailable > 0) {
        this.jackpotMode = !this.jackpotMode;
        this.updateGamblingUI();
      }
    });

    // Initial UI state
    this.updateGamblingUI();
  }

  private updateGamblingUI() {
    // Update checkbox
    this.stakeCheckboxCheck.setText(this.gamblingEnabled ? '✓' : '');

    // Update stake buttons
    this.stakeButtons.forEach((btn, index) => {
      const isSelected = this.gamblingEnabled && index === this.selectedStakeIndex;
      btn.setFillStyle(isSelected ? GAMBLING_CONFIG.COLORS.STAKE_SELECTED : GAMBLING_CONFIG.COLORS.STAKE_BG);
      btn.setAlpha(this.gamblingEnabled ? 1.0 : 0.4);
    });

    this.stakeTexts.forEach((txt) => {
      txt.setAlpha(this.gamblingEnabled ? 1.0 : 0.4);
    });

    // Update goal buttons
    this.goalButtons.forEach((btn, index) => {
      const isSelected = this.gamblingEnabled && index === this.selectedGoalIndex;
      btn.setFillStyle(isSelected ? GAMBLING_CONFIG.COLORS.GOAL_SELECTED : GAMBLING_CONFIG.COLORS.GOAL_BG);
      btn.setAlpha(this.gamblingEnabled ? 1.0 : 0.4);
    });

    this.goalTexts.forEach((txt) => {
      txt.setAlpha(this.gamblingEnabled ? 1.0 : 0.4);
    });

    // Update payout text
    if (this.gamblingEnabled && !this.jackpotMode) {
      const stake = GAMBLING_CONFIG.STAKE_AMOUNTS[this.selectedStakeIndex];
      const payout = calculatePayout(stake, this.selectedGoalIndex);
      this.payoutText.setText(`Risk ${stake} $SLAY\nto win ${payout} $SLAY`);
      this.payoutText.setVisible(true);
    } else if (this.jackpotMode) {
      this.payoutText.setText('Progressive Jackpot\nMultiplier increases\nover time');
      this.payoutText.setVisible(true);
    } else {
      this.payoutText.setVisible(false);
    }

    // Update jackpot toggle
    this.jackpotToggleCheck.setText(this.jackpotMode ? '✓' : '');
    this.jackpotToggle.setAlpha(this.gamblingEnabled && this.jackpotTicketsAvailable > 0 ? 1.0 : 0.4);
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

    // Add gambling state if enabled
    if (this.gamblingEnabled) {
      const stake = GAMBLING_CONFIG.STAKE_AMOUNTS[this.selectedStakeIndex];
      const goal = GAMBLING_CONFIG.SURVIVAL_GOALS[this.selectedGoalIndex];
      gameConfig.gambling = {
        isActive: true,
        stakeAmount: stake,
        goalMinutes: goal.minutes,
        goalMultiplier: goal.multiplier,
        isJackpotMode: this.jackpotMode,
        jackpotTicketsAvailable: this.jackpotTicketsAvailable,
      };
      console.log(`💰 Gambling enabled: ${stake} $SLAY for ${goal.minutes} min (${goal.multiplier}x)`);
      if (this.jackpotMode) {
        console.log('🎰 JACKPOT MODE ACTIVE');
      }
    } else {
      gameConfig.gambling = {
        isActive: false,
        stakeAmount: 0,
        goalMinutes: 0,
        goalMultiplier: 0,
        isJackpotMode: false,
        jackpotTicketsAvailable: 0,
      };
    }

    this.registry.set('gameConfig', gameConfig);

    // Transition to game scene
    this.scene.start('GameScene');
  }
}
