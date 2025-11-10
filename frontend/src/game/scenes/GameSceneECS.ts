import Phaser from 'phaser';
import type { GameConfig } from '../config';

// Game Configuration
import { 
  WORLD_CONFIG, 
  WAVE_CONFIG, 
  PLAYER_CONFIG,
  UI_CONFIG,
  type WeaponConfig 
} from '../config/GameConfig';

// Systems
import { InputSystem } from '../systems/InputSystem';
import { MovementSystem } from '../systems/MovementSystem';
import { AISystem } from '../systems/AISystem';
import { HealthSystem } from '../systems/HealthSystem';
import { ProjectileSystem } from '../systems/ProjectileSystem';

// Entities
import { createPlayerEntity, type PlayerUpgrades } from '../entities/PlayerEntity';
import { createEnemyEntity } from '../entities/EnemyEntity';
import { createBulletEntity } from '../entities/BulletEntity';
import { createShardEntity } from '../entities/ShardEntity';

// Components
import type { HealthComponent } from '../components/HealthComponent';
import type { MovementComponent } from '../components/MovementComponent';
import type { WeaponComponent } from '../components/WeaponComponent';
import type { InputComponent } from '../components/InputComponent';
import type { AIComponent } from '../components/AIComponent';
import type { ProjectileComponent } from '../components/ProjectileComponent';
import type { CollectibleComponent } from '../components/CollectibleComponent';

export class GameScene extends Phaser.Scene {
  // Systems
  private inputSystem!: InputSystem;
  private movementSystem!: MovementSystem;
  private aiSystem!: AISystem;
  private healthSystem!: HealthSystem;
  private projectileSystem!: ProjectileSystem;
  
  // Entity groups
  private player!: Phaser.Physics.Arcade.Sprite;
  private bullets!: Phaser.Physics.Arcade.Group;
  private enemies!: Phaser.Physics.Arcade.Group;
  private shards!: Phaser.Physics.Arcade.Group;
  
  // Game state
  private shardCount = 0;
  private currentWave = 0;
  private enemiesAlive = 0;
  
  // UI
  private healthBarBg!: Phaser.GameObjects.Rectangle;
  private healthBarFill!: Phaser.GameObjects.Rectangle;
  private healthText!: Phaser.GameObjects.Text;
  private shardText!: Phaser.GameObjects.Text;
  private waveText!: Phaser.GameObjects.Text;
  
  private gameConfig!: GameConfig;
  
  constructor() {
    super({ key: 'GameScene' });
  }
  
  init() {
    // Get custom config from registry
    this.gameConfig = this.registry.get('gameConfig');
    
    // Initialize systems
    this.inputSystem = new InputSystem();
    this.movementSystem = new MovementSystem();
    this.aiSystem = new AISystem();
    this.healthSystem = new HealthSystem();
    this.projectileSystem = new ProjectileSystem();
  }
  
  preload() {
    this.createPlaceholderGraphics();
  }
  
  create() {
    // Create player entity
    const upgrades: PlayerUpgrades = {
      hasArmor: this.gameConfig.upgrades.hasArmor,
      hasBoots: this.gameConfig.upgrades.hasBoots,
    };
    this.player = createPlayerEntity(this, 400, 300, upgrades);
    
    // Create entity groups
    this.bullets = this.physics.add.group({
      defaultKey: 'bullet',
      maxSize: 50,
    });
    
    this.enemies = this.physics.add.group();
    this.shards = this.physics.add.group();
    
    // Set up collisions
    this.setupCollisions();
    
    // Create UI
    this.createUI();
    
    // Start first wave
    this.startNextWave();
  }
  
  update(time: number) {
    const playerHealth = this.player.getData('health') as HealthComponent;
    
    // Skip update if dead
    if (this.healthSystem.isDead(playerHealth)) {
      return;
    }
    
    // Update player input and movement
    const playerInput = this.player.getData('input') as InputComponent;
    const playerMovement = this.player.getData('movement') as MovementComponent;
    const pointer = this.input.activePointer;
    
    this.inputSystem.update(this.player, playerInput, playerMovement, pointer);
    this.movementSystem.update(this.player, playerMovement);
    
    // Handle shooting
    const playerWeapon = this.player.getData('weapon') as WeaponComponent;
    if (pointer.isDown && time > playerWeapon.lastShotTime + playerWeapon.fireRate) {
      this.shootBullet(this.player, playerWeapon, time);
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
        
        const damage = enemySprite.getData('damage') as number;
        const time = Date.now();
        
        const tookDamage = this.healthSystem.takeDamage(
          this.player,
          playerHealth,
          damage,
          this,
          time
        );
        
        if (tookDamage) {
          // Activate iframes
          this.healthSystem.activateInvincibility(
            this.player,
            playerHealth,
            PLAYER_CONFIG.INVINCIBILITY_DURATION,
            this,
            time
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
          if (this.healthSystem.isDead(playerHealth)) {
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
    const angle = player.rotation;
    const weaponConfig = player.getData('weaponConfig') as WeaponConfig;
    
    const bullet = createBulletEntity(
      this,
      player.x,
      player.y,
      angle,
      weapon.damage,
      weapon.bulletSpeed,
      weaponConfig.bulletOffset
    );
    
    this.bullets.add(bullet);
    weapon.lastShotTime = time;
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
    this.bullets.children.entries.forEach((bullet) => {
      const sprite = bullet as Phaser.Physics.Arcade.Sprite;
      if (!sprite.active) return;
      
      const projectile = sprite.getData('projectile') as ProjectileComponent;
      this.projectileSystem.update(sprite, projectile);
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
    // Health bar above player
    const hpBar = UI_CONFIG.HEALTH_BAR;
    this.healthBarBg = this.add.rectangle(0, 0, hpBar.width, hpBar.height, hpBar.backgroundColor);
    this.healthBarFill = this.add.rectangle(0, 0, hpBar.width, hpBar.height, hpBar.healthyColor);
    this.healthBarFill.setOrigin(0, 0.5);
    
    // UI text
    const playerHealth = this.player.getData('health') as HealthComponent;
    const textStyle = UI_CONFIG.TEXT;
    
    this.healthText = this.add.text(
      10,
      10,
      `HP: ${playerHealth.current}/${playerHealth.max}`,
      { fontSize: textStyle.fontSize, color: textStyle.healthColor, fontFamily: textStyle.fontFamily }
    );
    
    this.shardText = this.add.text(10, 35, `Shards: ${this.shardCount}`, {
      fontSize: textStyle.fontSize,
      color: textStyle.shardColor,
      fontFamily: textStyle.fontFamily,
    });
    
    this.waveText = this.add.text(10, 60, `Wave: ${this.currentWave}`, {
      fontSize: textStyle.fontSize,
      color: textStyle.waveColor,
      fontFamily: textStyle.fontFamily,
    });
    
    this.healthText.setScrollFactor(0);
    this.shardText.setScrollFactor(0);
    this.waveText.setScrollFactor(0);
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
    
    this.physics.pause();
    
    const gameOverText = this.add.text(400, 250, 'GAME OVER', {
      fontSize: '64px',
      color: '#ff0000',
      fontFamily: 'Arial',
      stroke: '#000000',
      strokeThickness: 6,
    });
    gameOverText.setOrigin(0.5);
    
    const shardsText = this.add.text(400, 330, `Collected ${this.shardCount} Shards`, {
      fontSize: '32px',
      color: '#4caf50',
      fontFamily: 'Arial',
      stroke: '#000000',
      strokeThickness: 4,
    });
    shardsText.setOrigin(0.5);
    
    // Call React callback
    if (this.gameConfig.callbacks.onGameOver) {
      this.time.delayedCall(1000, () => {
        this.gameConfig.callbacks.onGameOver(this.shardCount);
      });
    }
  }
  
  private createPlaceholderGraphics(): void {
    // Player
    const playerGraphics = this.make.graphics({ x: 0, y: 0 });
    playerGraphics.fillStyle(0x4287f5, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();
    
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
