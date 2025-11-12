import Phaser from 'phaser';
import { createPlayerEntity } from '../entities/PlayerEntity';
import { InputSystem } from '../systems/InputSystem';
import { MovementSystem } from '../systems/MovementSystem';
import { WeaponSystem } from '../systems/WeaponSystem';
import { ProjectileSystem } from '../systems/ProjectileSystem';
import type { MovementComponent } from '../components/MovementComponent';
import type { WeaponComponent } from '../components/WeaponComponent';
import type { WeaponSpriteComponent } from '../components/WeaponSpriteComponent';
import type { ProjectileComponent } from '../components/ProjectileComponent';
import { WEAPONS, DISPLAY_CONFIG } from '../config/GameConfig';

/**
 * Test Scene - Weapon testing arena with static dummies and weapon pickups
 */
export class TestScene extends Phaser.Scene {
  private player!: Phaser.Physics.Arcade.Sprite;
  private dummies!: Phaser.Physics.Arcade.Group;
  private weaponPickups!: Phaser.Physics.Arcade.Group;
  private bullets!: Phaser.Physics.Arcade.Group;
  
  // Systems
  private inputSystem!: InputSystem;
  private movementSystem!: MovementSystem;
  private weaponSystem!: WeaponSystem;
  private projectileSystem!: ProjectileSystem;
  
  // UI
  private instructionText!: Phaser.GameObjects.Text;
  private weaponText!: Phaser.GameObjects.Text;

  constructor() {
    super({ key: 'TestScene' });
  }

  preload(): void {
    this.createPlaceholderGraphics();
  }

  create(): void {
    console.log('🧪 Test Scene Started');

    // Create background
    this.cameras.main.setBackgroundColor('#2a2a3e');
    
    // Add grid for visual reference
    this.createGrid();
    
    // Initialize systems
    this.inputSystem = new InputSystem(this);
    this.movementSystem = new MovementSystem();
    this.weaponSystem = new WeaponSystem();
    this.projectileSystem = new ProjectileSystem();
    
    // Create player
    this.player = createPlayerEntity(
      this,
      DISPLAY_CONFIG.WIDTH / 2,
      DISPLAY_CONFIG.HEIGHT - 200,
      { hasArmor: false, hasBoots: false },
      'WARRIOR'
    );
    
    // Create bullet group
    this.bullets = this.physics.add.group({
      defaultKey: 'bullet',
      maxSize: 100,
    });
    
    // Create dummy enemies
    this.createDummies();
    
    // Create weapon pickups
    this.createWeaponPickups();
    
    // Setup collisions
    this.setupCollisions();
    
    // Create UI
    this.createUI();
    
    // Camera follows player
    this.cameras.main.startFollow(this.player, false, 0.1, 0.1);
    this.cameras.main.setZoom(1);
  }

  private createGrid(): void {
    const graphics = this.add.graphics();
    graphics.lineStyle(1, 0x444444, 0.5);
    
    // Vertical lines
    for (let x = 0; x < DISPLAY_CONFIG.WIDTH; x += 100) {
      graphics.lineBetween(x, 0, x, DISPLAY_CONFIG.HEIGHT);
    }
    
    // Horizontal lines
    for (let y = 0; y < DISPLAY_CONFIG.HEIGHT; y += 100) {
      graphics.lineBetween(0, y, DISPLAY_CONFIG.WIDTH, y);
    }
  }

  private createDummies(): void {
    this.dummies = this.physics.add.group();
    
    // Create a row of dummies
    const dummyY = 300;
    const spacing = 200;
    const startX = DISPLAY_CONFIG.WIDTH / 2 - (spacing * 2);
    
    for (let i = 0; i < 5; i++) {
      const dummy = this.dummies.create(
        startX + (i * spacing),
        dummyY,
        'enemy'
      ) as Phaser.Physics.Arcade.Sprite;
      
      dummy.setTint(0x888888); // Gray tint for dummies
      if (dummy.body) {
        dummy.body.immovable = true;
      }
      dummy.setData('entityType', 'dummy');
      dummy.setData('health', { current: 1000, max: 1000 });
      
      // Add health bar
      const healthBarBg = this.add.rectangle(
        dummy.x,
        dummy.y - 40,
        60,
        8,
        0x222222
      );
      const healthBar = this.add.rectangle(
        dummy.x - 30,
        dummy.y - 40,
        60,
        8,
        0x4caf50
      );
      healthBar.setOrigin(0, 0.5);
      
      dummy.setData('healthBarBg', healthBarBg);
      dummy.setData('healthBar', healthBar);
    }
  }

  private createWeaponPickups(): void {
    this.weaponPickups = this.physics.add.group();
    
    const weapons = [
      { key: 'IRON_SWORD', x: 200, y: 600 },
      { key: 'ARCANE_STAFF', x: 400, y: 600 },
      { key: 'TWIN_DAGGERS', x: 600, y: 600 },
      { key: 'HEAVY_CROSSBOW', x: 800, y: 600 },
      { key: 'FLAMETHROWER', x: 1000, y: 600 },
      { key: 'CELESTIAL_CANNON', x: 1200, y: 600 },
    ];
    
    weapons.forEach(({ key, x, y }) => {
      const pickup = this.weaponPickups.create(
        x,
        y,
        'shard'
      ) as Phaser.Physics.Arcade.Sprite;
      
      pickup.setData('weaponKey', key);
      pickup.setData('weaponName', WEAPONS[key].name);
      pickup.setTint(0xffeb3b); // Yellow for weapons
      
      // Add weapon label
      const label = this.add.text(x, y + 30, WEAPONS[key].name, {
        fontSize: '14px',
        color: '#ffeb3b',
        stroke: '#000000',
        strokeThickness: 3,
      });
      label.setOrigin(0.5);
      pickup.setData('label', label);
      
      // Float animation
      this.tweens.add({
        targets: pickup,
        y: y - 10,
        duration: 1000,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });
    });
  }

  private setupCollisions(): void {
    // Bullets hit dummies
    this.physics.add.overlap(
      this.bullets,
      this.dummies,
      (bulletObj, dummyObj) => {
        const bullet = bulletObj as Phaser.Physics.Arcade.Sprite;
        const dummy = dummyObj as Phaser.Physics.Arcade.Sprite;
        
        const projectile = bullet.getData('projectile') as ProjectileComponent;
        if (!projectile) return;
        
        // Show damage number
        this.showDamageNumber(dummy.x, dummy.y, projectile.damage);
        
        // Flash dummy
        dummy.setTint(0xff0000);
        this.time.delayedCall(100, () => {
          dummy.setTint(0x888888);
        });
        
        // Handle piercing
        if (projectile.specialEffect === 'pierce_3' || projectile.specialEffect === 'pierce_all') {
          if (projectile.pierceCount && projectile.pierceCount > 0) {
            projectile.pierceCount--;
            if (projectile.pierceCount <= 0 && projectile.specialEffect === 'pierce_3') {
              this.projectileSystem.destroyProjectile(bullet);
            }
          }
        } else {
          // Non-piercing projectile
          this.projectileSystem.destroyProjectile(bullet);
        }
      },
      undefined,
      this
    );
    
    // Player picks up weapons
    this.physics.add.overlap(
      this.player,
      this.weaponPickups,
      (_playerObj, pickupObj) => {
        const pickup = pickupObj as Phaser.Physics.Arcade.Sprite;
        const weaponKey = pickup.getData('weaponKey') as string;
        const weaponConfig = WEAPONS[weaponKey];
        
        if (!weaponConfig) return;
        
        // Update player's weapon
        const weapon = this.player.getData('weapon') as WeaponComponent;
        weapon.weaponKey = weaponKey;
        weapon.type = weaponConfig.type;
        weapon.fireRate = weaponConfig.fireRate;
        weapon.damage = weaponConfig.damage;
        weapon.bulletSpeed = weaponConfig.bulletSpeed;
        weapon.bulletLifespan = weaponConfig.bulletLifespan;
        weapon.range = weaponConfig.range;
        weapon.weaponOffset = weaponConfig.weaponOffset;
        weapon.specialEffect = weaponConfig.specialEffect;
        weapon.pierceCount = weaponConfig.pierceCount;
        weapon.homingStrength = weaponConfig.homingStrength;
        weapon.spreadAngle = weaponConfig.spreadAngle;
        weapon.coneAngle = weaponConfig.coneAngle;
        weapon.explosionRadius = weaponConfig.explosionRadius;
        
        // Update UI
        this.weaponText.setText(`Weapon: ${weaponConfig.name}`);
        
        // Flash pickup
        pickup.setTint(0x00ff00);
        this.time.delayedCall(200, () => {
          pickup.setTint(0xffeb3b);
        });
        
        console.log(`🔧 Switched to ${weaponConfig.name}`);
      },
      undefined,
      this
    );
  }

  private showDamageNumber(x: number, y: number, damage: number): void {
    const text = this.add.text(x, y - 20, damage.toString(), {
      fontSize: '24px',
      color: '#ff5555',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 4,
    });
    text.setOrigin(0.5);
    
    this.tweens.add({
      targets: text,
      y: y - 80,
      alpha: 0,
      duration: 1000,
      ease: 'Cubic.easeOut',
      onComplete: () => {
        text.destroy();
      },
    });
  }

  private createUI(): void {
    // Instructions
    this.instructionText = this.add.text(20, 20, 
      'WEAPON TEST ARENA\n' +
      'WASD: Move | Mouse: Aim | Click: Shoot\n' +
      'Walk over yellow orbs to change weapons\n' +
      'ESC: Return to Menu',
      {
        fontSize: '16px',
        color: '#ffffff',
        backgroundColor: '#000000',
        padding: { x: 10, y: 10 },
      }
    );
    this.instructionText.setScrollFactor(0);
    this.instructionText.setDepth(1000);
    
    // Current weapon display
    const currentWeapon = this.player.getData('weapon') as WeaponComponent;
    this.weaponText = this.add.text(20, 140, 
      `Weapon: ${WEAPONS[currentWeapon.weaponKey]?.name || 'Unknown'}`,
      {
        fontSize: '20px',
        color: '#ffeb3b',
        backgroundColor: '#000000',
        padding: { x: 10, y: 5 },
      }
    );
    this.weaponText.setScrollFactor(0);
    this.weaponText.setDepth(1000);
    
    // ESC to return
    this.input.keyboard?.on('keydown-ESC', () => {
      this.scene.start('MenuScene');
    });
  }

  update(time: number): void {
    // Get input
    const pointer = this.input.activePointer;
    const input = this.player.getData('input');
    
    // Update movement
    const movement = this.player.getData('movement') as MovementComponent;
    this.inputSystem.update(this.player, input, movement);
    this.movementSystem.update(this.player, movement);
    
    // Update weapon position and shooting
    const weaponSpriteComp = this.player.getData('weaponSprite') as WeaponSpriteComponent;
    const playerWeapon = this.player.getData('weapon') as WeaponComponent;
    const damageMultiplier = this.player.getData('damageMultiplier') as number || 1.0;
    
    const aimDir = this.inputSystem.getAimDirection(this.player, pointer);
    if (aimDir) {
      const targetX = this.player.x + aimDir.x * 100;
      const targetY = this.player.y + aimDir.y * 100;
      this.weaponSystem.updatePosition(this.player, weaponSpriteComp, targetX, targetY);
      
      if (this.inputSystem.isFirePressed(pointer)) {
        this.weaponSystem.tryFire(
          playerWeapon,
          this.bullets,
          weaponSpriteComp.sprite.x,
          weaponSpriteComp.sprite.y,
          targetX,
          targetY,
          time,
          damageMultiplier
        );
      }
    } else {
      const defaultTargetX = this.player.x + 100;
      const defaultTargetY = this.player.y;
      this.weaponSystem.updatePosition(this.player, weaponSpriteComp, defaultTargetX, defaultTargetY);
    }
    
    // Update projectiles
    this.bullets.children.entries.forEach((bulletObj) => {
      const bullet = bulletObj as Phaser.Physics.Arcade.Sprite;
      if (!bullet.active) return;
      
      const projectile = bullet.getData('projectile') as ProjectileComponent;
      if (projectile) {
        this.projectileSystem.update(bullet, projectile, time, this.dummies);
      }
    });
    
    // Update dummy health bars
    this.dummies.children.entries.forEach((dummyObj) => {
      const dummy = dummyObj as Phaser.Physics.Arcade.Sprite;
      const healthBarBg = dummy.getData('healthBarBg') as Phaser.GameObjects.Rectangle;
      const healthBar = dummy.getData('healthBar') as Phaser.GameObjects.Rectangle;
      
      if (healthBarBg && healthBar) {
        healthBarBg.setPosition(dummy.x, dummy.y - 40);
        healthBar.setPosition(dummy.x - 30, dummy.y - 40);
      }
    });
    
    // Update weapon pickup labels
    this.weaponPickups.children.entries.forEach((pickupObj) => {
      const pickup = pickupObj as Phaser.Physics.Arcade.Sprite;
      const label = pickup.getData('label') as Phaser.GameObjects.Text;
      if (label) {
        label.setPosition(pickup.x, pickup.y + 30);
      }
    });
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
