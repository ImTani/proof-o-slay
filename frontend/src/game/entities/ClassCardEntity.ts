/**
 * ClassCardEntity - Factory for creating interactive class selection cards
 * Integrates with FocusManager for keyboard/gamepad navigation
 */

import Phaser from 'phaser';
import { CHARACTER_CLASSES } from '../config/GameConfig';
import { createUIComponent } from '../components/UIComponent';

export interface ClassCardEntity {
  container: Phaser.GameObjects.Container;
  background: Phaser.GameObjects.Rectangle;
  highlight: Phaser.GameObjects.Rectangle;
  className: keyof typeof CHARACTER_CLASSES;
  isSelected: boolean;
}

interface ClassCardConfig {
  focusIndex?: number;
  width?: number;
  height?: number;
  depth?: number;
}

const CLASS_ICONS: Record<keyof typeof CHARACTER_CLASSES, string> = { 
  WARRIOR: '⚔️', 
  MAGE: '🔮', 
  ROGUE: '🗡️' 
};

/**
 * Creates an interactive class selection card with stats and skill info
 * 
 * @param scene - The Phaser scene
 * @param x - X position
 * @param y - Y position
 * @param className - The class type (WARRIOR, MAGE, ROGUE)
 * @param onSelect - Callback when card is selected
 * @param config - Optional configuration
 * @returns ClassCardEntity with container and interaction properties
 */
export function createClassCard(
  scene: Phaser.Scene,
  x: number,
  y: number,
  className: keyof typeof CHARACTER_CLASSES,
  onSelect: (className: keyof typeof CHARACTER_CLASSES) => void,
  config: ClassCardConfig = {}
): ClassCardEntity {
  const classData = CHARACTER_CLASSES[className];
  const cardWidth = config.width || 380;
  const cardHeight = config.height || 500;
  const depth = config.depth ?? 100;
  
  // Main container
  const container = scene.add.container(x, y);
  container.setDepth(depth);

  // Card background
  const background = scene.add.rectangle(0, 0, cardWidth, cardHeight, 0x2a2a3e, 0.9);
  background.setStrokeStyle(4, 0x444455);
  container.add(background);

  // Highlight rectangle (for focus - yellow border)
  const highlight = scene.add.rectangle(
    0,
    0,
    cardWidth + 20,
    cardHeight + 20,
    0xffff00,
    0 // Transparent fill
  );
  highlight.setStrokeStyle(6, 0xffff00, 1); // Yellow stroke for focus
  highlight.setVisible(false);
  highlight.setDepth(depth + 1); // Above the container
  scene.add.existing(highlight);

  // Position highlight to match container
  highlight.setPosition(x, y);

  // Class icon (top)
  const icon = scene.add.text(0, -180, CLASS_ICONS[className], {
    fontSize: '96px',
  });
  icon.setOrigin(0.5);
  container.add(icon);

  // Class name
  const nameText = scene.add.text(0, -90, classData.name, {
    fontSize: '36px',
    color: '#ffffff',
    fontFamily: 'Arial',
    fontStyle: 'bold',
  });
  nameText.setOrigin(0.5);
  container.add(nameText);

  // Stats section
  const statsY = -20;
  const lineHeight = 35;
  
  const stats = [
    `HP: ${classData.baseHealth}`,
    `Speed: ${classData.baseSpeed}`,
    `Damage: ${classData.damageMultiplier}x`,
  ];

  stats.forEach((stat, index) => {
    const statText = scene.add.text(0, statsY + index * lineHeight, stat, {
      fontSize: '22px',
      color: '#aaaaaa',
      fontFamily: 'Arial',
    });
    statText.setOrigin(0.5);
    container.add(statText);
  });

  // Skill section
  const skillY = 110;
  const skillTitle = scene.add.text(0, skillY, `Skill: ${classData.skillName}`, {
    fontSize: '20px',
    color: '#4caf50',
    fontFamily: 'Arial',
    fontStyle: 'bold',
  });
  skillTitle.setOrigin(0.5);
  container.add(skillTitle);

  const skillDesc = scene.add.text(0, skillY + 30, classData.skillDescription, {
    fontSize: '16px',
    color: '#888888',
    fontFamily: 'Arial',
    align: 'center',
    wordWrap: { width: cardWidth - 40 },
  });
  skillDesc.setOrigin(0.5);
  container.add(skillDesc);

  const cooldownText = scene.add.text(0, skillY + 90, `Cooldown: ${classData.skillCooldown / 1000}s`, {
    fontSize: '16px',
    color: '#ffeb3b',
    fontFamily: 'Arial',
  });
  cooldownText.setOrigin(0.5);
  container.add(cooldownText);

  // Description
  const descText = scene.add.text(0, 210, classData.description, {
    fontSize: '18px',
    color: '#cccccc',
    fontFamily: 'Arial',
    align: 'center',
    wordWrap: { width: cardWidth - 40 },
  });
  descText.setOrigin(0.5);
  container.add(descText);

  // Make background interactive
  background.setInteractive({ useHandCursor: true });

  // Click handler
  background.on('pointerdown', () => {
    onSelect(className);
  });

  // Hover effects
  background.on('pointerover', () => {
    background.setFillStyle(0x3a3a4e, 0.9);
    scene.tweens.add({
      targets: container,
      scaleX: 1.02,
      scaleY: 1.02,
      duration: 150,
      ease: 'Sine.easeOut',
    });
  });

  background.on('pointerout', () => {
    const entity = background.getData('classCard') as ClassCardEntity;
    if (!entity?.isSelected) {
      background.setFillStyle(0x2a2a3e, 0.9);
      scene.tweens.add({
        targets: container,
        scaleX: 1.0,
        scaleY: 1.0,
        duration: 150,
        ease: 'Sine.easeOut',
      });
    }
  });

  // Add UIComponent for focus management
  const focusIdx = config.focusIndex ?? 0;
  const uiComponent = createUIComponent(
    focusIdx,
    () => onSelect(className), // onActivate
    () => { // onFocus - always show highlight when focused
      highlight.setVisible(true);
      highlight.setAlpha(1);
      scene.tweens.add({
        targets: highlight,
        alpha: 1,
        duration: 200,
      });
    },
    () => { // onBlur - always hide highlight when blurred
      highlight.setVisible(false);
      highlight.setAlpha(0);
    }
  );

  background.setData('ui', uiComponent);

  // Create entity object
  const entity: ClassCardEntity = {
    container,
    background,
    highlight,
    className,
    isSelected: false,
  };

  // Store reference to entity on background for callbacks
  background.setData('classCard', entity);

  return entity;
}

/**
 * Updates the visual state of a class card based on selection
 * 
 * @param entity - The class card entity to update
 * @param isSelected - Whether this card should be selected
 * @param scene - The Phaser scene for creating tweens
 */
export function updateClassCardSelection(
  entity: ClassCardEntity,
  isSelected: boolean,
  scene: Phaser.Scene
): void {
  entity.isSelected = isSelected;

  if (isSelected) {
    // Selected state - green border to differentiate from yellow focus
    entity.background.setStrokeStyle(6, 0x4caf50); // Green for selection
    entity.background.setFillStyle(0x2a3a2e, 1.0); // Slightly greenish tint
    
    scene.tweens.add({
      targets: entity.container,
      scaleX: 1.05,
      scaleY: 1.05,
      duration: 200,
      ease: 'Back.easeOut',
    });
  } else {
    // Deselected state
    entity.background.setStrokeStyle(4, 0x444455);
    entity.background.setFillStyle(0x2a2a3e, 0.9);
    
    scene.tweens.add({
      targets: entity.container,
      scaleX: 1.0,
      scaleY: 1.0,
      duration: 200,
      ease: 'Sine.easeOut',
    });
  }
  
  // Focus system handles highlight visibility independently
  // Selection only affects background appearance
}
