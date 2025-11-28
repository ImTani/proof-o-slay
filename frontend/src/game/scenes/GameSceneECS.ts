import Phaser from 'phaser';
import type { GameConfig } from '../config';

// Game Configuration
import {
  DISPLAY_CONFIG,
  WORLD_CONFIG,
  CAMERA_CONFIG,
  PLAYER_CONFIG,
  UI_LAYOUT_CONFIG,
  CHARACTER_CLASSES,
  ENEMY_CONFIG,
  COLLECTIBLE_CONFIG,
  getJackpotMultiplier,
} from '../config/GameConfig';

// Systems
import { InputSystem } from '../systems/InputSystem';
import { MovementSystem } from '../systems/MovementSystem';
import { AISystem } from '../systems/AISystem';
import { HealthSystem } from '../systems/HealthSystem';
import { ProjectileSystem } from '../systems/ProjectileSystem';
import { WeaponSystem } from '../systems/WeaponSystem';
import { SkillManager } from '../systems/SkillManager';
import { FocusManager } from '../systems/FocusManager';
import { GameManager } from '../systems/GameManager';
import { SpawnSystem } from '../systems/SpawnSystem';
import { PowerUpManager } from '../systems/PowerUpSystem';
import { EnemyManager } from '../systems/EnemyManager';
import { EffectManager } from '../systems/EffectManager';

// Entities
import { createPlayerEntity, type PlayerUpgrades } from '../entities/PlayerEntity';
import { createShardEntity } from '../entities/ShardEntity';
import { createPowerUpEntity, rollPowerUpDrop } from '../entities/PowerUpEntity';

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
  private skillManager!: SkillManager;
  private focusManager!: FocusManager;
  private spawnSystem!: SpawnSystem;
  private powerUpManager!: PowerUpManager;
  private enemyManager!: EnemyManager;
  private effectManager!: EffectManager;

  // Entity groups
  private player!: Phaser.Physics.Arcade.Sprite;
  private bullets!: Phaser.Physics.Arcade.Group; // Player bullets
  private enemyBullets!: Phaser.Physics.Arcade.Group; // Enemy bullets (archer)
  private enemies!: Phaser.Physics.Arcade.Group;
  private shards!: Phaser.Physics.Arcade.Group;
  private powerUps!: Phaser.Physics.Arcade.Group;

  // Game state
  private shardCount = 0;
  private killCount = 0; // Track total enemy kills
  private gameManager: GameManager;

  // Gambling state
  private gamblingActive = false;
  private goalMinutes = 0;
  private isJackpotMode = false;
  private gameStartTime = 0;
  private cKey!: Phaser.Input.Keyboard.Key;

  // Input keys
  private escKey!: Phaser.Input.Keyboard.Key;
  private spaceKey!: Phaser.Input.Keyboard.Key;

  private gameConfig!: GameConfig;

  constructor() {
    super({ key: 'GameScene' });
    this.gameManager = GameManager.getInstance();
  }

  public setGameConfig(config: { selectedClass: string; callbacks: any }) {
    this.gameConfig = {
      ...this.gameConfig,
      selectedClass: config.selectedClass as any,
      callbacks: config.callbacks,
      upgrades: this.gameConfig?.upgrades || { hasArmor: false, hasBoots: false }
    };
  }

  init() {
    // Get custom config from registry
    const registryConfig = this.registry.get('gameConfig');

    if (registryConfig) {
      this.gameConfig = {
        ...this.gameConfig,
        ...registryConfig
      };
    }

    // Initialize gambling state
    if (this.gameConfig.gambling?.isActive) {
      this.gamblingActive = true;
      this.goalMinutes = this.gameConfig.gambling.goalMinutes;
      this.isJackpotMode = this.gameConfig.gambling.isJackpotMode;
      this.gameStartTime = 0; // Will be set in create()
    }

    // Initialize systems (AISystem initialized after enemyBullets group created)
    this.inputSystem = new InputSystem(this);
    this.movementSystem = new MovementSystem();
    this.healthSystem = new HealthSystem();
    this.projectileSystem = new ProjectileSystem();
    this.weaponSystem = new WeaponSystem();
    this.skillManager = new SkillManager(this, this.healthSystem);
    this.focusManager = new FocusManager(this);
    this.powerUpManager = new PowerUpManager(this);
    this.effectManager = new EffectManager(this);
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

    // Create player entity at world center
    const upgrades: PlayerUpgrades = {
      hasArmor: this.gameConfig.upgrades?.hasArmor ?? false,
      hasBoots: this.gameConfig.upgrades?.hasBoots ?? false,
    };

    // Get selected class from game config
    const selectedClass = this.gameConfig.selectedClass;

    this.player = createPlayerEntity(
      this,
      WORLD_CONFIG.WIDTH / 2,
      WORLD_CONFIG.HEIGHT / 2,
      upgrades,
      selectedClass,
      this.skillManager
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

    this.enemyBullets = this.physics.add.group({
      defaultKey: 'bullet',
      maxSize: -1, // Unlimited pool size
      runChildUpdate: false,
    });

    this.enemies = this.physics.add.group();
    this.shards = this.physics.add.group();
    this.powerUps = this.physics.add.group();

    // Initialize AISystem with enemy bullets group
    this.aiSystem = new AISystem(this.enemyBullets);

    // Initialize enemy manager for pooling and routing
    this.enemyManager = new EnemyManager(this, this.enemies);

    // Initialize spawn system for infinite enemy spawning
    this.spawnSystem = new SpawnSystem(this, this.enemyManager);

    // Set up collisions
    this.setupCollisions();

    // Set up ESC key for pause menu
    this.escKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
    this.escKey.on('down', () => {
      this.togglePause();
    });

    // Set up SPACE key for skills
    this.spaceKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // Set up C key for jackpot cash-out
    this.cKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.C);

    // Spawn system will start automatically in update loop
  }

  update(time: number, delta: number) {
    // Note: delta (ms since last frame) available for future use if needed
    void delta; // Just to get rid of the `unused variable` warning.
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
    // Add trails
    if (this.player && this.player.active) {
      this.effectManager.createTrail(this.player, 0x00f3ff);
    }

    this.bullets.getChildren().forEach((bullet: any) => {
      if (bullet.active) {
        this.effectManager.createTrail(bullet, 0xffff00);
      }
    });

    const playerInput = this.player.getData('input') as InputComponent;
    const playerMovement = this.player.getData('movement') as MovementComponent;
    const pointer = this.input.activePointer;

    this.inputSystem.update(this.player, playerInput, playerMovement);

    // Apply speed boost power-up to movement
    const baseSpeed = playerMovement.speed;
    const speedMultiplier = this.powerUpManager.getSpeedMultiplier(this.player);
    playerMovement.speed = baseSpeed * speedMultiplier;

    this.movementSystem.update(this.player, playerMovement);

    // Restore base speed for next frame (power-up will reapply if still active)
    playerMovement.speed = baseSpeed;

    // Update power-ups
    this.powerUpManager.update(this.player, this.time.now);

    // Update skill state via SkillManager
    this.skillManager.update(this.player, time);

    // Update spawn system (spawns enemies, culls distant ones)
    this.spawnSystem.update(time);

    // Initialize game start time on first update frame (after scene fully loaded)
    if (this.gameStartTime === 0) {
      this.gameStartTime = time;
    }

    // Update survival timer (always shown)
    const survivalSeconds = Math.floor((time - this.gameStartTime) / 1000);
    const minutes = Math.floor(survivalSeconds / 60);

    // Update gambling-specific UI and check for victory/cash-out
    if (this.gamblingActive) {
      if (this.isJackpotMode) {
        // Jackpot mode - show current multiplier
        const jackpotData = getJackpotMultiplier(survivalSeconds);
        void jackpotData; // Suppress unused warning for now

        // Check for cash-out (C key)
        if (Phaser.Input.Keyboard.JustDown(this.cKey)) {
          // TODO: Handle victory (emit event to React)
          this.gameOver(); // For now, just end game
          return;
        }
      } else {
        // Regular bet - check if goal reached
        if (minutes >= this.goalMinutes) {
          // TODO: Handle victory (emit event to React)
          this.gameOver(); // For now, just end game
          return;
        }
      }
    }

    // Handle skill activation (Spacebar or gamepad)
    if (Phaser.Input.Keyboard.JustDown(this.spaceKey) || this.inputSystem.isSkillPressed()) {
      this.skillManager.useSkill(this.player, time, this.enemies);
    }

    // Update weapon position and rotation
    const weaponSpriteComp = this.player.getData('weaponSprite') as WeaponSpriteComponent;
    const playerWeapon = this.player.getData('weapon') as WeaponComponent;
    const damageMultiplier = this.player.getData('damageMultiplier') as number || 1.0;

    // Get aim direction from gamepad or mouse
    const aimDir = this.inputSystem.getAimDirection(this.player, pointer);
    if (aimDir) {
      const targetX = this.player.x + aimDir.x * UI_LAYOUT_CONFIG.WEAPON_AIM_DISTANCE;
      const targetY = this.player.y + aimDir.y * UI_LAYOUT_CONFIG.WEAPON_AIM_DISTANCE;
      this.weaponSystem.updatePosition(this.player, weaponSpriteComp, targetX, targetY);

      // Handle shooting (gamepad or mouse)
      if (this.inputSystem.isFirePressed(pointer)) {
        // Get cooldown multiplier from power-ups
        const cooldownMultiplier = this.powerUpManager.getCooldownMultiplier(this.player);

        // Fire from weapon sprite position, not player center
        this.weaponSystem.tryFire(
          playerWeapon,
          this.bullets,
          weaponSpriteComp.sprite.x,
          weaponSpriteComp.sprite.y,
          targetX,
          targetY,
          time,
          damageMultiplier,
          cooldownMultiplier
        );
      }
    } else {
      // No aim input - weapon defaults to facing right
      const defaultTargetX = this.player.x + UI_LAYOUT_CONFIG.WEAPON_AIM_DISTANCE;
      const defaultTargetY = this.player.y;
      this.weaponSystem.updatePosition(this.player, weaponSpriteComp, defaultTargetX, defaultTargetY);
    }

    // Update enemies
    this.updateEnemies();

    // Update projectiles
    this.updateProjectiles();

    // Update magnet power-up (auto-collect nearby shards)
    this.updateMagnet();

    // Emit stats to React HUD (once per frame)
    this.emitStats();
  }

  private emitStats(): void {
    if (!this.player) return;

    const playerHealth = this.player.getData('health') as HealthComponent;
    const playerClass = this.player.getData('className') as string;
    const classConfig = CHARACTER_CLASSES[playerClass];

    // Get active powerups
    const activePowerUps = this.powerUpManager.getActivePowerUps(this.player, this.time.now).map(p => p.type);

    const stats = {
      health: playerHealth.current,
      maxHealth: playerHealth.max,
      shards: this.shardCount,
      killCount: this.killCount,
      level: 1, // Placeholder for now
      experience: 0, // Placeholder
      maxExperience: 100, // Placeholder
      skillName: classConfig.skillName,
      skillCooldown: this.skillManager.getSkillCooldownInfo(this.player, this.time.now).cooldownPercent,
      activePowerUps: activePowerUps,
    };

    if (this.gameConfig.callbacks.onStatsUpdate) {
      this.gameConfig.callbacks.onStatsUpdate(stats);
    }
  }

  private setupCollisions(): void {
    // Bullet hits enemy
    this.physics.add.overlap(
      this.bullets,
      this.enemies,
      (bullet, enemy) => {
        const bulletSprite = bullet as Phaser.Physics.Arcade.Sprite;
        const enemySprite = enemy as Phaser.Physics.Arcade.Sprite;
        const projectile = bulletSprite.getData('projectile') as ProjectileComponent;

        // Check if this is a piercing projectile
        if (projectile.pierceCount !== undefined && projectile.pierceCount > 0) {
          // Decrement pierce count
          projectile.pierceCount--;

          // Destroy if no pierces left
          if (projectile.pierceCount <= 0) {
            this.projectileSystem.destroyProjectile(bulletSprite);
          }
        } else if (projectile.specialEffect !== 'pierce_all') {
          // Non-piercing projectiles are destroyed on hit
          this.projectileSystem.destroyProjectile(bulletSprite);
        }
        // pierce_all projectiles never get destroyed

        // Damage enemy
        const enemyHealth = enemySprite.getData('health') as HealthComponent;
        const isDead = this.healthSystem.takeDamage(
          enemySprite,
          enemyHealth,
          projectile.damage,
          this,
          Date.now()
        );

        // Show damage number
        this.effectManager.showDamageNumber(enemySprite.x, enemySprite.y, projectile.damage);

        if (isDead) {
          // Camera shake and particles on kill
          this.effectManager.enemyKillShake();
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

        // Check if player has Battle Dash invincibility active
        if (this.player.getData('invincible') === true) {
          return; // Skip damage during dash
        }

        let damage = enemySprite.getData('damage') as number;

        // Apply barrier absorption if active (handled by SkillManager)
        damage = this.skillManager.handleBarrierDamage(this.player, damage, currentTime);

        // Apply shield power-up absorption
        damage = this.powerUpManager.applyShieldDamage(this.player, damage);

        // Apply damage (if any remains after barrier and shield)
        if (damage > 0) {
          const isDead = this.healthSystem.takeDamage(
            this.player,
            playerHealth,
            damage,
            this,
            currentTime
          );

          // Camera shake on player damage
          this.effectManager.playerHitShake();

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
        }
      },
      undefined,
      this
    );

    // Enemy bullets hit player
    this.physics.add.overlap(
      this.player,
      this.enemyBullets,
      (_, bullet) => {
        const bulletSprite = bullet as Phaser.Physics.Arcade.Sprite;
        const playerHealth = this.player.getData('health') as HealthComponent;
        const projectile = bulletSprite.getData('projectile') as ProjectileComponent;

        // Check if player is invincible
        const currentTime = Date.now();
        if (playerHealth.isInvincible && currentTime < playerHealth.invincibilityEndTime) {
          return; // Skip damage if invincible
        }

        // Check if player has Battle Dash invincibility active
        if (this.player.getData('invincible') === true) {
          return; // Skip damage during dash
        }

        let damage = projectile.damage;

        // Apply barrier absorption if active
        damage = this.skillManager.handleBarrierDamage(this.player, damage, currentTime);

        // Apply shield power-up absorption
        damage = this.powerUpManager.applyShieldDamage(this.player, damage);

        // Apply damage (if any remains after barrier and shield)
        if (damage > 0) {
          const isDead = this.healthSystem.takeDamage(
            this.player,
            playerHealth,
            damage,
            this,
            currentTime
          );

          // Activate iframes
          this.healthSystem.activateInvincibility(
            this.player,
            playerHealth,
            PLAYER_CONFIG.INVINCIBILITY_DURATION,
            this,
            currentTime
          );

          // Destroy bullet
          this.projectileSystem.destroyProjectile(bulletSprite);

          if (isDead) {
            this.gameOver();
          }
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

        // Apply double shard multiplier if active
        const shardMultiplier = this.powerUpManager.getShardMultiplier(this.player);

        // Use collectible.value with fallback to 1 if invalid
        const baseValue = (collectible && typeof collectible.value === 'number' && !isNaN(collectible.value))
          ? collectible.value
          : 1;
        const shardValue = Math.max(0, Math.ceil(baseValue * shardMultiplier));

        this.shardCount += shardValue;

        // Destroy shard immediately to prevent multiple collision callbacks
        shardSprite.destroy();

        // Particle burst effect
        this.effectManager.shardPickupBurst(shardSprite.x, shardSprite.y);
      },
      undefined,
      this
    );

    // Player collects power-up
    this.physics.add.overlap(
      this.player,
      this.powerUps,
      (_, powerUp) => {
        const powerUpSprite = powerUp as Phaser.Physics.Arcade.Sprite;
        const powerUpType = powerUpSprite.getData('powerUpType');

        // Activate power-up
        this.powerUpManager.activatePowerUp(this.player, powerUpType, this.time.now);

        // Particle burst effect - color based on power-up type
        const particleColor = powerUpSprite.tintTopLeft;
        this.effectManager.powerUpPickupBurst(powerUpSprite.x, powerUpSprite.y, particleColor);

        // Visual feedback
        this.tweens.add({
          targets: powerUpSprite,
          scale: 2,
          alpha: 0,
          duration: 300,
          onComplete: () => powerUpSprite.destroy(),
        });
      },
      undefined,
      this
    );

    // Initialize AISystem with enemy bullets group
    this.aiSystem = new AISystem(this.enemyBullets);

    // Add Bloom Post-Processing (Neon Glow)
    // Add Bloom Post-Processing (Neon Glow)
    if (this.cameras.main.postFX) {
      this.cameras.main.postFX.addBloom(0xffffff, 0.5, 0.5, 1.5, 1.1);
    }

    // Set game start time (use Phaser time, not Date.now())
    this.gameStartTime = this.time.now;
  }



  private updateEnemies(): void {
    const playerPos = new Phaser.Math.Vector2(this.player.x, this.player.y);
    const currentTime = this.time.now;

    this.enemies.children.entries.forEach((enemy) => {
      const sprite = enemy as Phaser.Physics.Arcade.Sprite;
      if (!sprite.active || !sprite.body) return;

      const ai = sprite.getData('ai') as AIComponent;

      if (ai) {
        // AISystem directly sets body.velocity, so we don't need MovementSystem for enemies
        // MovementSystem would overwrite the AI's velocity with movement.velocity (which is 0,0)
        this.aiSystem.update(sprite, ai, playerPos, currentTime);
      }
    });
  }

  private updateProjectiles(): void {
    const currentTime = this.time.now;

    this.bullets.children.entries.forEach((bullet) => {
      const sprite = bullet as Phaser.Physics.Arcade.Sprite;
      if (!sprite.active) return;

      const projectile = sprite.getData('projectile') as ProjectileComponent;
      this.projectileSystem.update(sprite, projectile, currentTime, this.enemies);
    });

    this.enemyBullets.children.entries.forEach((bullet) => {
      const sprite = bullet as Phaser.Physics.Arcade.Sprite;
      if (!sprite.active) return;

      const projectile = sprite.getData('projectile') as ProjectileComponent;
      this.projectileSystem.update(sprite, projectile, currentTime);
    });
  }

  private updateMagnet(): void {
    const magnetRadius = this.powerUpManager.getMagnetRadius(this.player);
    if (magnetRadius <= 0) return; // No magnet active

    // Pull shards towards player if within magnet radius
    this.shards.children.entries.forEach((shard) => {
      const shardSprite = shard as Phaser.Physics.Arcade.Sprite;
      if (!shardSprite.active) return;

      const distance = Phaser.Math.Distance.Between(
        this.player.x,
        this.player.y,
        shardSprite.x,
        shardSprite.y
      );

      if (distance < magnetRadius) {
        // Pull shard towards player
        const angle = Phaser.Math.Angle.Between(
          shardSprite.x,
          shardSprite.y,
          this.player.x,
          this.player.y
        );
        const pullSpeed = 400; // pixels per second
        shardSprite.setVelocity(
          Math.cos(angle) * pullSpeed,
          Math.sin(angle) * pullSpeed
        );
      } else {
        // Reset velocity if outside magnet range
        shardSprite.setVelocity(0, 0);
      }
    });
  }

  private onEnemyDeath(enemy: Phaser.Physics.Arcade.Sprite): void {
    // Increment kill count
    this.killCount++;

    // Particle burst on death (color matches enemy)
    const enemyColor = enemy.tintTopLeft;
    this.effectManager.enemyDeathBurst(enemy.x, enemy.y, enemyColor);

    // Calculate shard value based on survival time and enemy type
    const enemyType = enemy.getData('enemyType') as string;
    const enemyConfig = ENEMY_CONFIG[enemyType.toUpperCase() as keyof typeof ENEMY_CONFIG];
    const dropMultiplier = enemyConfig?.dropMultiplier || 1;

    // Calculate time-based scaling
    const survivalMinutes = this.gameStartTime > 0
      ? (this.time.now - this.gameStartTime) / 60000
      : 0;
    const shardScaling = 1 + (COLLECTIBLE_CONFIG.SCALING.shardScalingRate * survivalMinutes);
    const shardValue = Math.ceil(COLLECTIBLE_CONFIG.SHARD.baseValue * shardScaling * dropMultiplier);

    // Drop shard with calculated value
    const shard = createShardEntity(this, enemy.x, enemy.y, shardValue);
    this.shards.add(shard);

    // Roll for power-up drop
    const powerUpType = rollPowerUpDrop();
    if (powerUpType) {
      const powerUp = createPowerUpEntity(this, enemy.x, enemy.y, powerUpType);
      this.powerUps.add(powerUp);
    }

    // Remove enemy (spawn system handles enemy count)
    enemy.destroy();
  }

  private gameOver(): void {
    console.log(`💀 Game Over! Collected ${this.shardCount} shards`);
    this.physics.pause();
    if (this.gameConfig.callbacks.onGameOver) {
      // Calculate survival time
      const survivalSeconds = this.gameStartTime > 0
        ? Math.floor((this.time.now - this.gameStartTime) / 1000)
        : 0;

      const minutes = Math.floor(survivalSeconds / 60);
      const seconds = survivalSeconds % 60;
      const timeFormatted = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

      this.gameConfig.callbacks.onGameOver(
        this.shardCount,
        timeFormatted,
        this.killCount
      );
    }
  }

  private togglePause(): void {
    if (this.gameManager.isPaused()) {
      this.resumeGame();
    } else {
      this.pauseGame();
    }
  }

  private pauseGame(): void {
    const playerHealth = this.player.getData('health') as HealthComponent;
    if (this.healthSystem.isDead(playerHealth)) {
      return;
    }

    this.gameManager.pause();
    this.physics.pause();
  }

  private resumeGame(): void {
    this.gameManager.resume();
    this.physics.resume();
  }

  private createTilingBackground(): void {
    // Create a neon grid pattern
    const tileSize = WORLD_CONFIG.TILE_SIZE;
    const graphics = this.add.graphics();

    // Fill with base color (Deep Dark Blue/Black)
    graphics.fillStyle(0x020205, 1);
    graphics.fillRect(0, 0, tileSize, tileSize);

    // Add neon grid lines
    // Primary grid (Cyan)
    graphics.lineStyle(1, 0x00f3ff, 0.1);
    graphics.strokeRect(0, 0, tileSize, tileSize);

    // Crosshair center
    graphics.lineStyle(1, 0x00f3ff, 0.05);
    graphics.beginPath();
    graphics.moveTo(tileSize / 2 - 4, tileSize / 2);
    graphics.lineTo(tileSize / 2 + 4, tileSize / 2);
    graphics.moveTo(tileSize / 2, tileSize / 2 - 4);
    graphics.lineTo(tileSize / 2, tileSize / 2 + 4);
    graphics.strokePath();

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
    tilingBg.setDepth(-100); // Behind everything else
  }

  private createPlaceholderGraphics(): void {
    // Player - Neon Cyan Triangle
    const playerGraphics = this.make.graphics({ x: 0, y: 0 });
    playerGraphics.lineStyle(2, 0x00f3ff, 1);
    playerGraphics.fillStyle(0x00f3ff, 0.2);

    // Draw triangle
    const pSize = 32;
    playerGraphics.beginPath();
    playerGraphics.moveTo(pSize, pSize / 2); // Tip
    playerGraphics.lineTo(0, 0);
    playerGraphics.lineTo(0, pSize);
    playerGraphics.closePath();
    playerGraphics.strokePath();
    playerGraphics.fillPath();

    // Add glow center
    playerGraphics.fillStyle(0xffffff, 0.8);
    playerGraphics.fillCircle(pSize / 3, pSize / 2, 4);

    playerGraphics.generateTexture('player', pSize, pSize);
    playerGraphics.destroy();

    // Pistol - Not needed for visual style, but keeping texture for logic
    const pistolGraphics = this.make.graphics({ x: 0, y: 0 });
    pistolGraphics.fillStyle(0x00f3ff, 0); // Invisible
    pistolGraphics.fillRect(0, 0, 16, 8);
    pistolGraphics.generateTexture('pistol', 16, 8);
    pistolGraphics.destroy();

    // Bullet - Bright Yellow/White Streak
    const bulletGraphics = this.make.graphics({ x: 0, y: 0 });
    bulletGraphics.fillStyle(0xffffff, 1);
    bulletGraphics.fillCircle(4, 4, 2); // Core
    bulletGraphics.lineStyle(2, 0xffff00, 0.8);
    bulletGraphics.strokeCircle(4, 4, 4); // Glow
    bulletGraphics.generateTexture('bullet', 8, 8);
    bulletGraphics.destroy();

    // Enemy - Neon Magenta Diamond
    const enemyGraphics = this.make.graphics({ x: 0, y: 0 });
    const eSize = 32;
    enemyGraphics.lineStyle(2, 0xff00ff, 1);
    enemyGraphics.fillStyle(0xff00ff, 0.2);

    // Diamond shape
    enemyGraphics.beginPath();
    enemyGraphics.moveTo(eSize / 2, 0);
    enemyGraphics.lineTo(eSize, eSize / 2);
    enemyGraphics.lineTo(eSize / 2, eSize);
    enemyGraphics.lineTo(0, eSize / 2);
    enemyGraphics.closePath();
    enemyGraphics.strokePath();
    enemyGraphics.fillPath();

    // Pulse core
    enemyGraphics.fillStyle(0xff00ff, 0.8);
    enemyGraphics.fillCircle(eSize / 2, eSize / 2, 6);

    enemyGraphics.generateTexture('enemy', eSize, eSize);
    enemyGraphics.destroy();

    // Shard - Crystalline Cyan
    const shardGraphics = this.make.graphics({ x: 0, y: 0 });
    shardGraphics.lineStyle(1, 0x00f3ff, 1);
    shardGraphics.fillStyle(0x00f3ff, 0.4);
    shardGraphics.beginPath();
    shardGraphics.moveTo(8, 0);
    shardGraphics.lineTo(16, 8);
    shardGraphics.lineTo(8, 16);
    shardGraphics.lineTo(0, 8);
    shardGraphics.closePath();
    shardGraphics.strokePath();
    shardGraphics.fillPath();
    shardGraphics.generateTexture('shard', 16, 16);
    shardGraphics.destroy();
  }
}
