import Phaser from 'phaser';
import type { GameConfig } from '../config';

// Game Configuration
import { 
  DISPLAY_CONFIG,
  WORLD_CONFIG, 
  CAMERA_CONFIG,
  WAVE_CONFIG, 
  PLAYER_CONFIG,
  UI_CONFIG
} from '../config/GameConfig';

// Systems
import { InputSystem } from '../systems/InputSystem';
import { MovementSystem } from '../systems/MovementSystem';
import { AISystem } from '../systems/AISystem';
import { HealthSystem } from '../systems/HealthSystem';
import { ProjectileSystem } from '../systems/ProjectileSystem';
import { WeaponSystem } from '../systems/WeaponSystem';
import { FocusManager } from '../systems/FocusManager';
import { GameManager } from '../systems/GameManager';

// Entities
import { createPlayerEntity, type PlayerUpgrades } from '../entities/PlayerEntity';
import { createEnemyEntity } from '../entities/EnemyEntity';
import { createBulletEntity } from '../entities/BulletEntity';
import { createShardEntity } from '../entities/ShardEntity';
import { createButton, type ButtonEntity } from '../entities/ButtonEntity';

// Components
import type { HealthComponent } from '../components/HealthComponent';
import type { MovementComponent } from '../components/MovementComponent';
import type { WeaponComponent } from '../components/WeaponComponent';
import type { InputComponent } from '../components/InputComponent';
import type { AIComponent } from '../components/AIComponent';
import type { ProjectileComponent } from '../components/ProjectileComponent';
import type { CollectibleComponent } from '../components/CollectibleComponent';
import type { WeaponSpriteComponent } from '../components/WeaponSpriteComponent';

export class GameScene extends Phaser.Scene {
  // Systems
  private inputSystem!: InputSystem;
  private movementSystem!: MovementSystem;
  private aiSystem!: AISystem;
  private healthSystem!: HealthSystem;
  private projectileSystem!: ProjectileSystem;
  private weaponSystem!: WeaponSystem;
  private focusManager!: FocusManager;
  
  // Cameras
  private uiCamera!: Phaser.Cameras.Scene2D.Camera;
  
  // Entity groups
  private player!: Phaser.Physics.Arcade.Sprite;
  private bullets!: Phaser.Physics.Arcade.Group;
  private enemies!: Phaser.Physics.Arcade.Group;
  private shards!: Phaser.Physics.Arcade.Group;
  
  // Game state
  private shardCount = 0;
  private currentWave = 0;
  private enemiesAlive = 0;
  private gameManager: GameManager;
  
  // Pause menu UI
  private pauseOverlay!: Phaser.GameObjects.Rectangle | null;
  private pauseTitle!: Phaser.GameObjects.Text | null;
  private pauseResumeButton!: ButtonEntity | null;
  private pauseMenuButton!: ButtonEntity | null;
  private escKey!: Phaser.Input.Keyboard.Key;
  
  // UI
  private healthBarBg!: Phaser.GameObjects.Rectangle;
  private healthBarFill!: Phaser.GameObjects.Rectangle;
  private healthText!: Phaser.GameObjects.Text;
  private shardText!: Phaser.GameObjects.Text;
  private waveText!: Phaser.GameObjects.Text;
  
  private gameConfig!: GameConfig;
  
  constructor() {
    super({ key: 'GameScene' });
    this.gameManager = GameManager.getInstance();
  }
  
  init() {
    // Get custom config from registry
    this.gameConfig = this.registry.get('gameConfig');
    
    // Initialize systems
    this.inputSystem = new InputSystem(this);
    this.movementSystem = new MovementSystem();
    this.aiSystem = new AISystem();
    this.healthSystem = new HealthSystem();
    this.projectileSystem = new ProjectileSystem();
    this.weaponSystem = new WeaponSystem();
    this.focusManager = new FocusManager(this);
  }
  
  preload() {
    this.createPlaceholderGraphics();
  }
  
  create() {
    // Set up infinite world bounds
    this.physics.world.setBounds(0, 0, WORLD_CONFIG.WIDTH, WORLD_CONFIG.HEIGHT);
    
    // Create seamless tiling background
    this.createTilingBackground();
    
    // Set up cameras
    // Main camera follows player (will zoom/move with game world)
    this.cameras.main.setBounds(0, 0, WORLD_CONFIG.WIDTH, WORLD_CONFIG.HEIGHT);
    this.cameras.main.setZoom(CAMERA_CONFIG.ZOOM);
    this.cameras.main.roundPixels = CAMERA_CONFIG.ROUND_PIXELS;
    
    // UI camera stays fixed (no zoom, no movement)
    this.uiCamera = this.cameras.add(0, 0, DISPLAY_CONFIG.WIDTH, DISPLAY_CONFIG.HEIGHT);
    this.uiCamera.setScroll(0, 0);
    this.uiCamera.setZoom(1); // Always 1:1 zoom
    this.uiCamera.roundPixels = true;
    
    // Create player entity at world center
    const upgrades: PlayerUpgrades = {
      hasArmor: this.gameConfig.upgrades.hasArmor,
      hasBoots: this.gameConfig.upgrades.hasBoots,
    };
    this.player = createPlayerEntity(
      this,
      WORLD_CONFIG.WIDTH / 2,
      WORLD_CONFIG.HEIGHT / 2,
      upgrades
    );
    
    // Set player collision with world bounds
    this.player.setCollideWorldBounds(true);
    
    // Make main camera follow player with smooth lerp
    this.cameras.main.startFollow(this.player, CAMERA_CONFIG.ROUND_PIXELS, CAMERA_CONFIG.LERP_X, CAMERA_CONFIG.LERP_Y);
    
    // Set up deadzone to reduce jitter during diagonal movement
    if (CAMERA_CONFIG.DEADZONE_WIDTH > 0 || CAMERA_CONFIG.DEADZONE_HEIGHT > 0) {
      const deadzoneWidth = DISPLAY_CONFIG.WIDTH * CAMERA_CONFIG.DEADZONE_WIDTH;
      const deadzoneHeight = DISPLAY_CONFIG.HEIGHT * CAMERA_CONFIG.DEADZONE_HEIGHT;
      this.cameras.main.setDeadzone(deadzoneWidth, deadzoneHeight);
    }
    
    // Create entity groups
    this.bullets = this.physics.add.group({
      defaultKey: 'bullet',
      maxSize: -1, // Unlimited pool size
      runChildUpdate: false,
    });
    
    this.enemies = this.physics.add.group();
    this.shards = this.physics.add.group();
    
    // Set up collisions
    this.setupCollisions();
    
    // Create UI
    this.createUI();
    
    // Set up ESC key for pause menu
    this.escKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
    this.escKey.on('down', () => {
      this.togglePause();
    });
    
    // Initialize pause menu UI elements (hidden by default)
    this.pauseOverlay = null;
    this.pauseTitle = null;
    this.pauseResumeButton = null;
    this.pauseMenuButton = null;
    
    // Start first wave
    this.startNextWave();
  }
  
  update(time: number, delta: number) {
    // Note: delta (ms since last frame) available for future use if needed
    // Currently using Phaser physics (frame-rate independent) and timestamp-based cooldowns
    
    // Handle pause menu focus navigation
    if (this.gameManager.isPaused()) {
      this.focusManager.update(time);
      return;
    }
    
    const playerHealth = this.player.getData('health') as HealthComponent;
    
    // Skip update if dead
    if (this.healthSystem.isDead(playerHealth)) {
      // Still update focus manager for game over screen
      this.focusManager.update(time);
      return;
    }
    
    // Update player input and movement
    const playerInput = this.player.getData('input') as InputComponent;
    const playerMovement = this.player.getData('movement') as MovementComponent;
    const pointer = this.input.activePointer;
    
    this.inputSystem.update(this.player, playerInput, playerMovement);
    this.movementSystem.update(this.player, playerMovement);
    
    // Update weapon position and rotation
    const weaponSpriteComp = this.player.getData('weaponSprite') as WeaponSpriteComponent;
    
    // Get aim direction from gamepad or mouse
    const aimDir = this.inputSystem.getAimDirection(this.player, pointer);
    if (aimDir) {
      const targetX = this.player.x + aimDir.x * 100; // Project aim 100 pixels out
      const targetY = this.player.y + aimDir.y * 100;
      this.weaponSystem.update(this.player, weaponSpriteComp, targetX, targetY);
    }
    
    // Handle shooting (gamepad or mouse)
    const playerWeapon = this.player.getData('weapon') as WeaponComponent;
    if (this.inputSystem.isFirePressed(pointer)) {
      const timeSinceLastShot = time - playerWeapon.lastShotTime;
      if (timeSinceLastShot > playerWeapon.fireRate) {
        this.shootBullet(this.player, playerWeapon, time);
      }
    }
    
    // Update enemies
    this.updateEnemies();
    
    // Update projectiles
    this.updateProjectiles();
    
    // Update UI
    this.updateHealthBar();
  }
  
  private setupCollisions(): void {
    // Bullet hits enemy
    this.physics.add.overlap(
      this.bullets,
      this.enemies,
      (bullet, enemy) => {
        const bulletSprite = bullet as Phaser.Physics.Arcade.Sprite;
        const enemySprite = enemy as Phaser.Physics.Arcade.Sprite;
        
        // Destroy bullet
        this.projectileSystem.destroyProjectile(bulletSprite);
        
        // Damage enemy
        const enemyHealth = enemySprite.getData('health') as HealthComponent;
        const projectile = bulletSprite.getData('projectile') as ProjectileComponent;
        const isDead = this.healthSystem.takeDamage(
          enemySprite,
          enemyHealth,
          projectile.damage,
          this,
          Date.now()
        );
        
        if (isDead) {
          this.onEnemyDeath(enemySprite);
        }
      },
      undefined,
      this
    );
    
    // Enemy hits player
    this.physics.add.overlap(
      this.player,
      this.enemies,
      (_, enemy) => {
        const enemySprite = enemy as Phaser.Physics.Arcade.Sprite;
        const playerHealth = this.player.getData('health') as HealthComponent;
        
        // Check if player is invincible (use Date.now for consistency)
        const currentTime = Date.now();
        if (playerHealth.isInvincible && currentTime < playerHealth.invincibilityEndTime) {
          return; // Skip damage if still invincible
        }
        
        const damage = enemySprite.getData('damage') as number;
        
        // Apply damage
        const isDead = this.healthSystem.takeDamage(
          this.player,
          playerHealth,
          damage,
          this,
          currentTime
        );
        
        // Always activate iframes after taking damage (regardless of death)
        this.healthSystem.activateInvincibility(
          this.player,
          playerHealth,
          PLAYER_CONFIG.INVINCIBILITY_DURATION,
          this,
          currentTime
        );
        
        // Knockback
        const angle = Phaser.Math.Angle.Between(
          enemySprite.x,
          enemySprite.y,
          this.player.x,
          this.player.y
        );
        const knockback = PLAYER_CONFIG.KNOCKBACK_FORCE;
        this.player.setVelocity(Math.cos(angle) * knockback, Math.sin(angle) * knockback);
        
        // Check game over
        if (isDead) {
          this.gameOver();
        }
      },
      undefined,
      this
    );
    
    // Player collects shard
    this.physics.add.overlap(
      this.player,
      this.shards,
      (_, shard) => {
        const shardSprite = shard as Phaser.Physics.Arcade.Sprite;
        const collectible = shardSprite.getData('collectible') as CollectibleComponent;
        
        this.shardCount += collectible.value;
        this.shardText.setText(`Shards: ${this.shardCount}`);
        
        // Visual feedback
        this.tweens.add({
          targets: shardSprite,
          scale: 2,
          alpha: 0,
          duration: 300,
          onComplete: () => shardSprite.destroy(),
        });
      },
      undefined,
      this
    );
  }
  
  private shootBullet(
    player: Phaser.Physics.Arcade.Sprite,
    weapon: WeaponComponent,
    time: number
  ): void {
    // Get pistol sprite position and rotation
    const weaponSpriteComp = player.getData('weaponSprite') as WeaponSpriteComponent;
    const pistol = weaponSpriteComp.sprite;
    
    // Calculate bullet spawn position at the tip of the pistol
    const spawnOffset = 8; // Spawn bullets 8px from pistol center (at the tip)
    const spawnX = pistol.x + Math.cos(pistol.rotation) * spawnOffset;
    const spawnY = pistol.y + Math.sin(pistol.rotation) * spawnOffset;
    
    // Create bullet using entity factory (handles pooling)
    const bullet = createBulletEntity(
      this.bullets,
      spawnX,
      spawnY,
      pistol.rotation,
      weapon.damage,
      weapon.bulletSpeed,
      time
    );
    
    if (!bullet) {
      return;
    }
    
    weapon.lastShotTime = time;
    
    // Pistol recoil animation
    const originalScale = pistol.scale;
    this.tweens.add({
      targets: pistol,
      scaleX: originalScale * 0.8,
      scaleY: originalScale * 0.8,
      duration: 50,
      yoyo: true,
      ease: 'Quad.easeOut',
    });
  }
  
  private updateEnemies(): void {
    const playerPos = new Phaser.Math.Vector2(this.player.x, this.player.y);
    
    this.enemies.children.entries.forEach((enemy) => {
      const sprite = enemy as Phaser.Physics.Arcade.Sprite;
      if (!sprite.active || !sprite.body) return;
      
      const ai = sprite.getData('ai') as AIComponent;
      this.aiSystem.update(sprite, ai, playerPos);
    });
  }
  
  private updateProjectiles(): void {
    const currentTime = this.time.now;
    this.bullets.children.entries.forEach((bullet) => {
      const sprite = bullet as Phaser.Physics.Arcade.Sprite;
      if (!sprite.active) return;
      
      const projectile = sprite.getData('projectile') as ProjectileComponent;
      this.projectileSystem.update(sprite, projectile, currentTime);
    });
  }
  
  private startNextWave(): void {
    this.currentWave++;
    this.waveText.setText(`Wave: ${this.currentWave}`);
    
    const enemyCount = WAVE_CONFIG.BASE_ENEMY_COUNT + (this.currentWave * WAVE_CONFIG.ENEMIES_PER_WAVE);
    
    for (let i = 0; i < enemyCount; i++) {
      const edge = Phaser.Math.Between(0, 3);
      const pos = this.getSpawnPosition(edge);
      const enemy = createEnemyEntity(this, pos.x, pos.y);
      this.enemies.add(enemy);
      this.enemiesAlive++;
    }
    
    console.log(`🌊 Wave ${this.currentWave}: ${enemyCount} enemies`);
  }
  
  private getSpawnPosition(edge: number): { x: number; y: number } {
    const margin = WAVE_CONFIG.SPAWN_EDGE_MARGIN;
    const maxX = WORLD_CONFIG.WIDTH - margin;
    const maxY = WORLD_CONFIG.HEIGHT - margin;
    
    switch (edge) {
      case 0: // Top
        return { x: Phaser.Math.Between(margin, maxX), y: margin };
      case 1: // Right
        return { x: maxX, y: Phaser.Math.Between(margin, maxY) };
      case 2: // Bottom
        return { x: Phaser.Math.Between(margin, maxX), y: maxY };
      case 3: // Left
      default:
        return { x: margin, y: Phaser.Math.Between(margin, maxY) };
    }
  }
  
  private onEnemyDeath(enemy: Phaser.Physics.Arcade.Sprite): void {
    // Drop shard
    const shard = createShardEntity(this, enemy.x, enemy.y);
    this.shards.add(shard);
    
    // Remove enemy
    enemy.destroy();
    this.enemiesAlive--;
    
    // Check wave completion
    if (this.enemiesAlive === 0) {
      this.time.delayedCall(WAVE_CONFIG.DELAY_BETWEEN_WAVES, () => {
        this.startNextWave();
      });
    }
  }
  
  private createUI(): void {
    // Health bar above player (follows player in game world - uses main camera)
    const hpBar = UI_CONFIG.HEALTH_BAR;
    this.healthBarBg = this.add.rectangle(0, 0, hpBar.width, hpBar.height, hpBar.backgroundColor);
    this.healthBarFill = this.add.rectangle(0, 0, hpBar.width, hpBar.height, hpBar.healthyColor);
    this.healthBarFill.setOrigin(0, 0.5);
    
    // Make health bars ignore UI camera (only visible on main camera)
    this.healthBarBg.setScrollFactor(1);
    this.healthBarFill.setScrollFactor(1);
    this.uiCamera.ignore([this.healthBarBg, this.healthBarFill]);
    
    // UI text - using fixed padding from edges for scalability
    const padding = 20;
    const lineHeight = 35;
    const playerHealth = this.player.getData('health') as HealthComponent;
    const textStyle = UI_CONFIG.TEXT;
    
    this.healthText = this.add.text(
      padding,
      padding,
      `HP: ${playerHealth.current}/${playerHealth.max}`,
      { fontSize: textStyle.fontSize, color: textStyle.healthColor, fontFamily: textStyle.fontFamily }
    );
    
    this.shardText = this.add.text(padding, padding + lineHeight, `Shards: ${this.shardCount}`, {
      fontSize: textStyle.fontSize,
      color: textStyle.shardColor,
      fontFamily: textStyle.fontFamily,
    });
    
    this.waveText = this.add.text(padding, padding + lineHeight * 2, `Wave: ${this.currentWave}`, {
      fontSize: textStyle.fontSize,
      color: textStyle.waveColor,
      fontFamily: textStyle.fontFamily,
    });
    
    // Make text UI elements ignore main camera (only visible on UI camera)
    this.cameras.main.ignore([this.healthText, this.shardText, this.waveText]);
    
    // Set depth to ensure UI text is on top
    this.healthText.setDepth(1000);
    this.shardText.setDepth(1000);
    this.waveText.setDepth(1000);
  }
  
  private updateHealthBar(): void {
    const health = this.player.getData('health') as HealthComponent;
    const hpBar = UI_CONFIG.HEALTH_BAR;
    
    // Position
    const offsetY = this.player.y + hpBar.offsetY;
    this.healthBarBg.setPosition(this.player.x, offsetY);
    this.healthBarFill.setPosition(this.player.x - hpBar.width / 2, offsetY);
    
    // Width
    const healthPercent = health.current / health.max;
    this.healthBarFill.width = hpBar.width * healthPercent;
    
    // Color
    if (healthPercent > hpBar.warningThreshold) {
      this.healthBarFill.setFillStyle(hpBar.healthyColor);
    } else if (healthPercent > hpBar.criticalThreshold) {
      this.healthBarFill.setFillStyle(hpBar.warningColor);
    } else {
      this.healthBarFill.setFillStyle(hpBar.criticalColor);
    }
    
    this.healthText.setText(`HP: ${health.current}/${health.max}`);
  }
  
  private gameOver(): void {
    console.log(`💀 Game Over! Collected ${this.shardCount} shards`);
    
    // Destroy weapon sprite
    const weaponSpriteComp = this.player.getData('weaponSprite') as WeaponSpriteComponent;
    if (weaponSpriteComp && weaponSpriteComp.sprite) {
      weaponSpriteComp.sprite.destroy();
    }
    
    this.physics.pause();
    
    // Use DISPLAY_CONFIG for centered positioning
    const centerX = DISPLAY_CONFIG.WIDTH / 2;
    const centerY = DISPLAY_CONFIG.HEIGHT / 2;
    const gameOverConfig = UI_CONFIG.GAME_OVER;
    
    const gameOverText = this.add.text(
      centerX,
      centerY + gameOverConfig.title.offsetY,
      'GAME OVER',
      {
        fontSize: gameOverConfig.title.fontSize,
        color: gameOverConfig.title.color,
        fontFamily: gameOverConfig.title.fontFamily,
        stroke: gameOverConfig.title.stroke,
        strokeThickness: gameOverConfig.title.strokeThickness,
      }
    );
    gameOverText.setOrigin(0.5);
    gameOverText.setDepth(2000);
    
    const shardsText = this.add.text(
      centerX,
      centerY + gameOverConfig.shardsDisplay.offsetY,
      `Collected ${this.shardCount} Shards`,
      {
        fontSize: gameOverConfig.shardsDisplay.fontSize,
        color: gameOverConfig.shardsDisplay.color,
        fontFamily: gameOverConfig.shardsDisplay.fontFamily,
        stroke: gameOverConfig.shardsDisplay.stroke,
        strokeThickness: gameOverConfig.shardsDisplay.strokeThickness,
      }
    );
    shardsText.setOrigin(0.5);
    shardsText.setDepth(2000);
    
    // Make game over UI elements ignore main camera (only visible on UI camera)
    this.cameras.main.ignore([gameOverText, shardsText]);
    
    // Play Again button - using button factory
    const playAgainButton = createButton(
      this,
      centerX - 150,
      centerY + 120,
      'PLAY AGAIN',
      () => this.scene.restart(),
      {
        style: 'primary',
        fontSize: '28px',
        icon: '▶',
        focusIndex: 0,
        depth: 2000,
      }
    );
    
    // Menu button - using button factory
    const menuButton = createButton(
      this,
      centerX + 150,
      centerY + 120,
      'MENU',
      () => this.scene.start('MenuScene'),
      {
        style: 'secondary',
        fontSize: '28px',
        icon: '⬅',
        focusIndex: 1,
        depth: 2000,
      }
    );
    
    // Clear focus manager and register game over buttons
    this.focusManager.clear();
    this.focusManager.register(playAgainButton.text);
    this.focusManager.register(menuButton.text);
    
    // Hint text
    const hintText = this.add.text(
      centerX,
      centerY + 200,
      'Use Arrow Keys / Tab / D-pad to navigate',
      {
        fontSize: '18px',
        color: '#666666',
        fontFamily: 'Arial',
      }
    );
    hintText.setOrigin(0.5);
    hintText.setDepth(2000);
    
    // Make buttons and hint ignore main camera (only visible on UI camera)
    this.cameras.main.ignore([
      playAgainButton.highlight, 
      playAgainButton.text, 
      menuButton.highlight, 
      menuButton.text, 
      hintText
    ]);
  }
  
  private togglePause(): void {
    if (this.gameManager.isPaused()) {
      this.resumeGame();
    } else {
      this.pauseGame();
    }
  }
  
  private pauseGame(): void {
    // Don't allow pause if game over
    const playerHealth = this.player.getData('health') as HealthComponent;
    if (this.healthSystem.isDead(playerHealth)) {
      return;
    }
    
    this.gameManager.pause();
    this.physics.pause();
    
    this.showPauseMenu();
  }
  
  private resumeGame(): void {
    this.gameManager.resume();
    this.physics.resume();
    
    this.hidePauseMenu();
  }
  
  private showPauseMenu(): void {
    const centerX = DISPLAY_CONFIG.WIDTH / 2;
    const centerY = DISPLAY_CONFIG.HEIGHT / 2;
    
    // Semi-transparent overlay
    this.pauseOverlay = this.add.rectangle(
      centerX,
      centerY,
      DISPLAY_CONFIG.WIDTH,
      DISPLAY_CONFIG.HEIGHT,
      0x000000,
      0.7
    );
    this.pauseOverlay.setDepth(1500);
    
    // Title
    this.pauseTitle = this.add.text(
      centerX,
      centerY - 100,
      'PAUSED',
      {
        fontSize: '64px',
        color: '#ffffff',
        fontFamily: 'Arial',
        fontStyle: 'bold',
      }
    );
    this.pauseTitle.setOrigin(0.5);
    this.pauseTitle.setDepth(1600);
    
    // Resume button - using button factory
    this.pauseResumeButton = createButton(
      this,
      centerX,
      centerY + 20,
      'RESUME',
      () => this.resumeGame(),
      {
        style: 'success',
        icon: '▶',
        focusIndex: 0,
        depth: 1600,
      }
    );
    
    // Menu button - using button factory
    this.pauseMenuButton = createButton(
      this,
      centerX,
      centerY + 100,
      'MAIN MENU',
      () => {
        this.hidePauseMenu();
        this.scene.start('MenuScene');
      },
      {
        style: 'secondary',
        icon: '⬅',
        focusIndex: 1,
        depth: 1600,
      }
    );
    
    // Make pause menu ignore main camera (only visible on UI camera)
    this.cameras.main.ignore([
      this.pauseOverlay, 
      this.pauseTitle,
      this.pauseResumeButton.highlight,
      this.pauseResumeButton.text,
      this.pauseMenuButton.highlight,
      this.pauseMenuButton.text
    ]);
    
    // Register with focus manager (auto-focus will handle first focus)
    this.focusManager.clear();
    this.focusManager.register(this.pauseResumeButton.text);
    this.focusManager.register(this.pauseMenuButton.text);
  }
  
  private hidePauseMenu(): void {
    // Destroy all pause menu UI elements
    if (this.pauseOverlay) {
      this.pauseOverlay.destroy();
      this.pauseOverlay = null;
    }
    if (this.pauseTitle) {
      this.pauseTitle.destroy();
      this.pauseTitle = null;
    }
    if (this.pauseResumeButton) {
      this.pauseResumeButton.destroy();
      this.pauseResumeButton = null;
    }
    if (this.pauseMenuButton) {
      this.pauseMenuButton.destroy();
      this.pauseMenuButton = null;
    }
    
    // Clear focus manager (will be re-registered if game over screen shows)
    this.focusManager.clear();
  }
  
  private createTilingBackground(): void {
    // Create a simple grid pattern texture for the background
    const tileSize = WORLD_CONFIG.TILE_SIZE;
    const graphics = this.add.graphics();
    
    // Fill with base color
    graphics.fillStyle(parseInt(WORLD_CONFIG.BACKGROUND_COLOR.replace('#', '0x')), 1);
    graphics.fillRect(0, 0, tileSize, tileSize);
    
    // Add grid lines for visual reference
    graphics.lineStyle(1, 0x2a2a3e, 0.3);
    graphics.strokeRect(0, 0, tileSize, tileSize);
    
    // Generate texture from graphics
    graphics.generateTexture('backgroundTile', tileSize, tileSize);
    graphics.destroy();
    
    // Create tiling sprite that covers the entire world
    const tilingBg = this.add.tileSprite(
      0,
      0,
      WORLD_CONFIG.WIDTH,
      WORLD_CONFIG.HEIGHT,
      'backgroundTile'
    );
    tilingBg.setOrigin(0, 0);
    tilingBg.setDepth(-1); // Behind everything else
  }
  
  private createPlaceholderGraphics(): void {
    // Player
    const playerGraphics = this.make.graphics({ x: 0, y: 0 });
    playerGraphics.fillStyle(0x4287f5, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();
    
    // Pistol (small rectangle representing the gun)
    const pistolGraphics = this.make.graphics({ x: 0, y: 0 });
    pistolGraphics.fillStyle(0x666666, 1); // Dark gray
    pistolGraphics.fillRect(0, 0, 16, 8); // Rectangular pistol shape
    pistolGraphics.generateTexture('pistol', 16, 8);
    pistolGraphics.destroy();
    
    // Bullet
    const bulletGraphics = this.make.graphics({ x: 0, y: 0 });
    bulletGraphics.fillStyle(0xffeb3b, 1);
    bulletGraphics.fillCircle(4, 4, 4);
    bulletGraphics.generateTexture('bullet', 8, 8);
    bulletGraphics.destroy();
    
    // Enemy
    const enemyGraphics = this.make.graphics({ x: 0, y: 0 });
    enemyGraphics.fillStyle(0xf44336, 1);
    enemyGraphics.fillCircle(16, 16, 16);
    enemyGraphics.generateTexture('enemy', 32, 32);
    enemyGraphics.destroy();
    
    // Shard
    const shardGraphics = this.make.graphics({ x: 0, y: 0 });
    shardGraphics.fillStyle(0x4caf50, 1);
    shardGraphics.fillTriangle(8, 0, 16, 8, 8, 16);
    shardGraphics.fillTriangle(8, 0, 0, 8, 8, 16);
    shardGraphics.generateTexture('shard', 16, 16);
    shardGraphics.destroy();
  }
}
