import Phaser from 'phaser';
import type { GameConfig } from '../config';

export class GameScene extends Phaser.Scene {
  private player!: Phaser.Physics.Arcade.Sprite;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: {
    w: Phaser.Input.Keyboard.Key;
    a: Phaser.Input.Keyboard.Key;
    s: Phaser.Input.Keyboard.Key;
    d: Phaser.Input.Keyboard.Key;
  };
  
  private bullets!: Phaser.Physics.Arcade.Group;
  private enemies!: Phaser.Physics.Arcade.Group;
  private shards!: Phaser.Physics.Arcade.Group;
  
  private playerHealth = 100;
  private playerMaxHealth = 100;
  private playerSpeed = 100;
  private fireRate = 500;
  private lastShotTime = 0;
  
  private isInvincible = false;
  private invincibilityDuration = 1000; // 1 second of iframes
  
  private shardCount = 0;
  private currentWave = 0;
  private enemiesAlive = 0;
  
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
    
    // Apply upgrades
    if (this.gameConfig.upgrades.hasArmor) {
      this.playerMaxHealth = 120;
      this.playerHealth = 120;
      console.log('🛡️ Armor equipped! Max HP: 120');
    }
    
    if (this.gameConfig.upgrades.hasBoots) {
      this.playerSpeed = 120; // 20% speed boost
      console.log('👢 Boots equipped! Speed: 120');
    }
  }
  
  preload() {
    // For MVP, we'll use simple shapes instead of images
    // Create placeholder graphics
    this.createPlaceholderGraphics();
  }
  
  create() {
    // Create player
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);
    
    // Create groups
    this.bullets = this.physics.add.group({
      defaultKey: 'bullet',
      maxSize: 50,
    });
    
    this.enemies = this.physics.add.group();
    this.shards = this.physics.add.group();
    
    // Set up input
    this.cursors = this.input.keyboard!.createCursorKeys();
    this.wasd = {
      w: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      a: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      s: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      d: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.D),
    };
    
    // Set up collisions
    this.physics.add.overlap(
      this.bullets,
      this.enemies,
      this.bulletHitEnemy as Phaser.Types.Physics.Arcade.ArcadePhysicsCallback,
      undefined,
      this
    );
    
    this.physics.add.overlap(
      this.player,
      this.enemies,
      this.enemyHitPlayer as Phaser.Types.Physics.Arcade.ArcadePhysicsCallback,
      undefined,
      this
    );
    
    this.physics.add.overlap(
      this.player,
      this.shards,
      this.collectShard as Phaser.Types.Physics.Arcade.ArcadePhysicsCallback,
      undefined,
      this
    );
    
    // Create UI
    this.createUI();
    
    // Start first wave
    this.startNextWave();
  }
  
  update(time: number) {
    if (this.playerHealth <= 0) {
      return; // Game over
    }
    
    // Player movement (WASD)
    const velocity = new Phaser.Math.Vector2(0, 0);
    
    if (this.wasd.a.isDown || this.cursors.left.isDown) {
      velocity.x = -1;
    } else if (this.wasd.d.isDown || this.cursors.right.isDown) {
      velocity.x = 1;
    }
    
    if (this.wasd.w.isDown || this.cursors.up.isDown) {
      velocity.y = -1;
    } else if (this.wasd.s.isDown || this.cursors.down.isDown) {
      velocity.y = 1;
    }
    
    // Normalize diagonal movement
    velocity.normalize();
    this.player.setVelocity(velocity.x * this.playerSpeed, velocity.y * this.playerSpeed);
    
    // Mouse aiming
    const pointer = this.input.activePointer;
    const angle = Phaser.Math.Angle.Between(
      this.player.x,
      this.player.y,
      pointer.worldX,
      pointer.worldY
    );
    this.player.setRotation(angle);
    
    // Shooting
    if (pointer.isDown && time > this.lastShotTime + this.fireRate) {
      this.shoot(angle);
      this.lastShotTime = time;
    }
    
    // Update enemy AI
    this.updateEnemyAI();
    
    // Update health bar
    this.updateHealthBar();
  }
  
  private createPlaceholderGraphics() {
    // Create simple colored rectangles as placeholders
    
    // Player (blue square)
    const playerGraphics = this.make.graphics({ x: 0, y: 0 });
    playerGraphics.fillStyle(0x4287f5, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();
    
    // Bullet (yellow circle)
    const bulletGraphics = this.make.graphics({ x: 0, y: 0 });
    bulletGraphics.fillStyle(0xffeb3b, 1);
    bulletGraphics.fillCircle(4, 4, 4);
    bulletGraphics.generateTexture('bullet', 8, 8);
    bulletGraphics.destroy();
    
    // Enemy (red blob)
    const enemyGraphics = this.make.graphics({ x: 0, y: 0 });
    enemyGraphics.fillStyle(0xf44336, 1);
    enemyGraphics.fillCircle(16, 16, 16);
    enemyGraphics.generateTexture('enemy', 32, 32);
    enemyGraphics.destroy();
    
    // Shard (green diamond)
    const shardGraphics = this.make.graphics({ x: 0, y: 0 });
    shardGraphics.fillStyle(0x4caf50, 1);
    shardGraphics.fillTriangle(8, 0, 16, 8, 8, 16);
    shardGraphics.fillTriangle(8, 0, 0, 8, 8, 16);
    shardGraphics.generateTexture('shard', 16, 16);
    shardGraphics.destroy();
  }
  
  private createUI() {
    // Health bar above player (will follow player)
    this.healthBarBg = this.add.rectangle(0, 0, 40, 6, 0x222222);
    this.healthBarFill = this.add.rectangle(0, 0, 40, 6, 0x4caf50);
    this.healthBarFill.setOrigin(0, 0.5);
    
    // UI Text
    this.healthText = this.add.text(10, 10, `HP: ${this.playerHealth}/${this.playerMaxHealth}`, {
      fontSize: '18px',
      color: '#ffffff',
      fontFamily: 'Arial',
    });
    
    this.shardText = this.add.text(10, 35, `Shards: ${this.shardCount}`, {
      fontSize: '18px',
      color: '#4caf50',
      fontFamily: 'Arial',
    });
    
    this.waveText = this.add.text(10, 60, `Wave: ${this.currentWave}`, {
      fontSize: '18px',
      color: '#ffeb3b',
      fontFamily: 'Arial',
    });
    
    // Make UI fixed to camera
    this.healthText.setScrollFactor(0);
    this.shardText.setScrollFactor(0);
    this.waveText.setScrollFactor(0);
  }
  
  private updateHealthBar() {
    // Position health bar above player
    this.healthBarBg.setPosition(this.player.x, this.player.y - 30);
    this.healthBarFill.setPosition(this.player.x - 20, this.player.y - 30);
    
    // Update health bar fill
    const healthPercent = this.playerHealth / this.playerMaxHealth;
    this.healthBarFill.width = 40 * healthPercent;
    
    // Change color based on health
    if (healthPercent > 0.6) {
      this.healthBarFill.setFillStyle(0x4caf50); // Green
    } else if (healthPercent > 0.3) {
      this.healthBarFill.setFillStyle(0xffeb3b); // Yellow
    } else {
      this.healthBarFill.setFillStyle(0xf44336); // Red
    }
    
    // Update text
    this.healthText.setText(`HP: ${this.playerHealth}/${this.playerMaxHealth}`);
  }
  
  private shoot(angle: number) {
    const bullet = this.bullets.get(this.player.x, this.player.y, 'bullet');
    
    if (bullet) {
      bullet.setActive(true);
      bullet.setVisible(true);
      
      // Set bullet velocity
      const bulletSpeed = 400;
      bullet.body.velocity.x = Math.cos(angle) * bulletSpeed;
      bullet.body.velocity.y = Math.sin(angle) * bulletSpeed;
      
      // Destroy bullet after 2 seconds
      this.time.delayedCall(2000, () => {
        if (bullet.active) {
          bullet.setActive(false);
          bullet.setVisible(false);
        }
      });
    }
  }
  
  private startNextWave() {
    this.currentWave++;
    this.waveText.setText(`Wave: ${this.currentWave}`);
    
    const enemyCount = 5 + this.currentWave * 2;
    
    for (let i = 0; i < enemyCount; i++) {
      // Spawn enemies around the edges
      const edge = Phaser.Math.Between(0, 3);
      let x = 0;
      let y = 0;
      
      switch (edge) {
        case 0: // Top
          x = Phaser.Math.Between(50, 750);
          y = 50;
          break;
        case 1: // Right
          x = 750;
          y = Phaser.Math.Between(50, 550);
          break;
        case 2: // Bottom
          x = Phaser.Math.Between(50, 750);
          y = 550;
          break;
        case 3: // Left
          x = 50;
          y = Phaser.Math.Between(50, 550);
          break;
      }
      
      this.createEnemy(x, y);
    }
    
    console.log(`🌊 Wave ${this.currentWave} started! ${enemyCount} enemies`);
  }
  
  private createEnemy(x: number, y: number) {
    const enemy = this.enemies.create(x, y, 'enemy');
    enemy.setData('health', 30);
    enemy.setData('speed', 40);
    this.enemiesAlive++;
  }
  
  private updateEnemyAI() {
    this.enemies.children.entries.forEach((enemy) => {
      const sprite = enemy as Phaser.Physics.Arcade.Sprite;
      if (!sprite.active || !sprite.body) return;
      
      const speed = sprite.getData('speed') || 40;
      
      // Simple chase AI
      const angle = Phaser.Math.Angle.Between(
        sprite.x,
        sprite.y,
        this.player.x,
        this.player.y
      );
      
      const body = sprite.body as Phaser.Physics.Arcade.Body;
      body.velocity.x = Math.cos(angle) * speed;
      body.velocity.y = Math.sin(angle) * speed;
    });
  }
  
  private bulletHitEnemy(
    bullet: Phaser.Types.Physics.Arcade.GameObjectWithBody,
    enemy: Phaser.Types.Physics.Arcade.GameObjectWithBody
  ) {
    const bulletSprite = bullet as Phaser.Physics.Arcade.Sprite;
    const enemySprite = enemy as Phaser.Physics.Arcade.Sprite;
    
    // Remove bullet completely (not just hide it)
    bulletSprite.setActive(false);
    bulletSprite.setVisible(false);
    if (bulletSprite.body) {
      bulletSprite.body.enable = false; // Disable physics body
    }
    
    // Damage enemy
    const health = enemySprite.getData('health') - 10;
    enemySprite.setData('health', health);
    
    // Flash enemy red
    enemySprite.setTint(0xff0000);
    this.time.delayedCall(100, () => {
      if (enemySprite.active) {
        enemySprite.clearTint();
      }
    });
    
    // Destroy enemy if dead
    if (health <= 0) {
      this.enemyDied(enemySprite);
    }
  }
  
  private enemyDied(enemy: Phaser.Physics.Arcade.Sprite) {
    // Drop shard
    this.createShard(enemy.x, enemy.y);
    
    // Remove enemy
    enemy.destroy();
    this.enemiesAlive--;
    
    // Check if wave is complete
    if (this.enemiesAlive === 0) {
      this.time.delayedCall(2000, () => {
        this.startNextWave();
      });
    }
  }
  
  private createShard(x: number, y: number) {
    const shard = this.shards.create(x, y, 'shard');
    shard.setScale(1.5);
    
    // Add floating animation
    this.tweens.add({
      targets: shard,
      y: y - 10,
      duration: 500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }
  
  private collectShard(
    player: Phaser.Types.Physics.Arcade.GameObjectWithBody,
    shard: Phaser.Types.Physics.Arcade.GameObjectWithBody
  ) {
    const shardSprite = shard as Phaser.Physics.Arcade.Sprite;
    
    this.shardCount++;
    this.shardText.setText(`Shards: ${this.shardCount}`);
    
    // Visual feedback
    this.tweens.add({
      targets: shardSprite,
      scale: 2,
      alpha: 0,
      duration: 300,
      onComplete: () => {
        shardSprite.destroy();
      },
    });
  }
  
  private enemyHitPlayer(
    _player: Phaser.Types.Physics.Arcade.GameObjectWithBody,
    enemy: Phaser.Types.Physics.Arcade.GameObjectWithBody
  ) {
    // Skip damage if player is invincible
    if (this.isInvincible) {
      return;
    }
    
    // Damage player
    this.playerHealth -= 10;
    
    // Activate invincibility frames
    this.isInvincible = true;
    
    // Flash player red multiple times during iframes
    let flashCount = 0;
    const flashInterval = this.time.addEvent({
      delay: 100,
      repeat: 9, // Flash 10 times over 1 second
      callback: () => {
        flashCount++;
        if (flashCount % 2 === 0) {
          this.player.setTint(0xff0000);
        } else {
          this.player.clearTint();
        }
      },
    });
    
    // End invincibility after duration
    this.time.delayedCall(this.invincibilityDuration, () => {
      this.isInvincible = false;
      this.player.clearTint();
      flashInterval.destroy();
    });
    
    // Knockback
    const angle = Phaser.Math.Angle.Between(
      enemy.body.x,
      enemy.body.y,
      _player.body.x,
      _player.body.y
    );
    this.player.setVelocity(
      Math.cos(angle) * 200,
      Math.sin(angle) * 200
    );
    
    // Check game over
    if (this.playerHealth <= 0) {
      this.gameOver();
    }
  }
  
  private gameOver() {
    console.log(`💀 Game Over! Collected ${this.shardCount} shards`);
    
    // Stop the game
    this.physics.pause();
    
    // Display game over text
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
}
