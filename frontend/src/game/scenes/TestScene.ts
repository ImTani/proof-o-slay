import Phaser from 'phaser';
import { createPlayerEntity } from '../entities/PlayerEntity';
import { EnemyManager } from '../systems/EnemyManager';
import { InputSystem } from '../systems/InputSystem';
import { MovementSystem } from '../systems/MovementSystem';
import { WeaponSystem } from '../systems/WeaponSystem';
import { ProjectileSystem } from '../systems/ProjectileSystem';
import { SkillManager } from '../systems/SkillManager';
import { AISystem } from '../systems/AISystem';
import { HealthSystem } from '../systems/HealthSystem';
import { PowerUpManager } from '../systems/PowerUpSystem';
import type { MovementComponent } from '../components/MovementComponent';
import type { WeaponComponent } from '../components/WeaponComponent';
import type { WeaponSpriteComponent } from '../components/WeaponSpriteComponent';
import type { ProjectileComponent } from '../components/ProjectileComponent';
import type { HealthComponent } from '../components/HealthComponent';
import type { AIComponent } from '../components/AIComponent';
import { WEAPONS, DISPLAY_CONFIG, PLAYER_CONFIG, UI_LAYOUT_CONFIG, CHARACTER_CLASSES, POWERUP_CONFIG } from '../config/GameConfig';
import { createPowerUpEntity } from '../entities/PowerUpEntity';

/**
 * Test Scene - Weapon testing arena with static dummies and weapon pickups
 */
export class TestScene extends Phaser.Scene {
  private player!: Phaser.Physics.Arcade.Sprite;
  private dummies!: Phaser.Physics.Arcade.Group;
  private enemies!: Phaser.Physics.Arcade.Group;
  private weaponPickups!: Phaser.Physics.Arcade.Group;
  private skillPickups!: Phaser.Physics.Arcade.Group;
  private powerUpPickups!: Phaser.Physics.Arcade.Group;
  private bullets!: Phaser.Physics.Arcade.Group;

  // Systems
  private inputSystem!: InputSystem;
  private movementSystem!: MovementSystem;
  private weaponSystem!: WeaponSystem;
  private projectileSystem!: ProjectileSystem;
  private skillManager!: SkillManager;
  private aiSystem!: AISystem;
  private healthSystem!: HealthSystem;
  private powerUpManager!: PowerUpManager;
  private enemyManager!: EnemyManager;

  // UI
  private instructionText!: Phaser.GameObjects.Text;
  private weaponText!: Phaser.GameObjects.Text;
  private currentSkillText!: Phaser.GameObjects.Text;
  private healthText!: Phaser.GameObjects.Text;
  private skillText!: Phaser.GameObjects.Text;
  private healthBarBg!: Phaser.GameObjects.Rectangle;
  private healthBarFill!: Phaser.GameObjects.Rectangle;
  private skillCooldownBg!: Phaser.GameObjects.Rectangle;
  private skillCooldownFill!: Phaser.GameObjects.Rectangle;
  private combatZoneLabel!: Phaser.GameObjects.Text;
  private powerUpIcons: Map<string, { icon: Phaser.GameObjects.Rectangle; timer: Phaser.GameObjects.Text }> = new Map();

  // Spacebar for skills
  private spaceKey!: Phaser.Input.Keyboard.Key;

  // Combat zone tracking
  private readonly COMBAT_ZONE_Y = DISPLAY_CONFIG.HEIGHT + 200; // Below visible area
  private readonly COMBAT_ZONE_HEIGHT = 800;
  private readonly WORLD_HEIGHT = DISPLAY_CONFIG.HEIGHT + 200 + 800 + 100; // Total world height
  private inCombatZone = false;

  constructor() {
    super({ key: 'TestScene' });
  }

  preload(): void {
    this.createPlaceholderGraphics();
  }

  create(): void {
    console.log('🧪 Test Scene Started');

    // Set world bounds to include combat zone
    this.physics.world.setBounds(0, 0, DISPLAY_CONFIG.WIDTH, this.WORLD_HEIGHT);

    // Create background
    this.cameras.main.setBackgroundColor('#2a2a3e');

    // Add grid for visual reference
    this.createGrid();

    // Initialize systems
    this.inputSystem = new InputSystem(this);
    this.movementSystem = new MovementSystem();
    this.weaponSystem = new WeaponSystem();
    this.projectileSystem = new ProjectileSystem();
    this.aiSystem = new AISystem(); // TestScene doesn't have archer enemies
    this.healthSystem = new HealthSystem();
    this.skillManager = new SkillManager(this, this.healthSystem, this.showDamageNumber.bind(this));
    this.powerUpManager = new PowerUpManager(this);

    // Create player
    this.player = createPlayerEntity(
      this,
      DISPLAY_CONFIG.WIDTH / 2,
      DISPLAY_CONFIG.HEIGHT - 200,
      { hasArmor: false, hasBoots: false },
      'WARRIOR',
      this.skillManager
    );

    // Create bullet group
    this.bullets = this.physics.add.group({
      defaultKey: 'bullet',
      maxSize: 100,
    });

    // Create enemy groups
    this.dummies = this.physics.add.group();
    this.enemies = this.physics.add.group();

    // Initialize enemy manager for pooling
    this.enemyManager = new EnemyManager(this, this.enemies);

    // Create dummy enemies
    this.createDummies();

    // Create weapon pickups
    this.createWeaponPickups();

    // Create skill pickups
    this.createSkillPickups();

    // Create power-up pickups
    this.createPowerUpPickups();

    // Draw combat zone indicator
    this.createCombatZone();

    // Setup collisions
    this.setupCollisions();

    // Create UI
    this.createUI();

    // Setup spacebar for skills
    this.spaceKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // Camera follows player with bounds matching world
    this.cameras.main.setBounds(0, 0, DISPLAY_CONFIG.WIDTH, this.WORLD_HEIGHT);
    this.cameras.main.startFollow(this.player, false, 0.1, 0.1);
    this.cameras.main.setZoom(1);
  }

  private createGrid(): void {
    const graphics = this.add.graphics();
    graphics.lineStyle(1, 0x444444, 0.5);

    // Vertical lines
    for (let x = 0; x < DISPLAY_CONFIG.WIDTH; x += 100) {
      graphics.lineBetween(x, 0, x, this.WORLD_HEIGHT);
    }

    // Horizontal lines
    for (let y = 0; y < this.WORLD_HEIGHT; y += 100) {
      graphics.lineBetween(0, y, DISPLAY_CONFIG.WIDTH, y);
    }
  }

  private createDummies(): void {
    // Create a row of dummies at the top
    const dummyY = 200;
    const spacing = 180;
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

  private createCombatZone(): void {
    // Draw combat zone boundaries
    const graphics = this.add.graphics();
    graphics.lineStyle(4, 0xff5555, 1);
    graphics.strokeRect(
      50,
      this.COMBAT_ZONE_Y,
      DISPLAY_CONFIG.WIDTH - 100,
      this.COMBAT_ZONE_HEIGHT
    );

    // Add combat zone label
    this.combatZoneLabel = this.add.text(
      DISPLAY_CONFIG.WIDTH / 2,
      this.COMBAT_ZONE_Y + 50,
      '⚔️ COMBAT ZONE - Test Skills Here! ⚔️\nEnemies spawn when you enter',
      {
        fontSize: '24px',
        color: '#ff5555',
        fontStyle: 'bold',
        stroke: '#000000',
        strokeThickness: 4,
        align: 'center',
      }
    );
    this.combatZoneLabel.setOrigin(0.5);
  }

  private spawnEnemiesInCombatZone(): void {
    // Only spawn if there aren't already enough enemies
    const currentEnemyCount = this.enemies.getLength();
    const maxEnemies = 8;

    if (currentEnemyCount >= maxEnemies) return;

    // Spawn enemies to reach max count
    const toSpawn = maxEnemies - currentEnemyCount;
    for (let i = 0; i < toSpawn; i++) {
      const x = 100 + (Math.random() * (DISPLAY_CONFIG.WIDTH - 200));
      const y = this.COMBAT_ZONE_Y + 100 + (Math.random() * (this.COMBAT_ZONE_HEIGHT - 200));

      this.enemyManager.spawnEnemy('SLIME', x, y, this.time.now);
    }

    console.log(`🔴 Spawned ${toSpawn} enemies in combat zone`);
  }

  private despawnAllEnemies(): void {
    // Destroy all active enemies
    this.enemies.children.entries.forEach((enemy) => {
      if (enemy && enemy.active) {
        enemy.destroy();
      }
    });

    // Clear the group completely
    this.enemies.clear(true, true);
    console.log('✅ Cleared all enemies - left combat zone');
  }

  private createWeaponPickups(): void {
    this.weaponPickups = this.physics.add.group();

    // Weapons arranged vertically on the right side
    const weapons = [
      { key: 'IRON_SWORD', x: DISPLAY_CONFIG.WIDTH - 150, y: 400 },
      { key: 'ARCANE_STAFF', x: DISPLAY_CONFIG.WIDTH - 150, y: 500 },
      { key: 'TWIN_DAGGERS', x: DISPLAY_CONFIG.WIDTH - 150, y: 600 },
      { key: 'HEAVY_CROSSBOW', x: DISPLAY_CONFIG.WIDTH - 150, y: 700 },
      { key: 'FLAMETHROWER', x: DISPLAY_CONFIG.WIDTH - 150, y: 800 },
      { key: 'CELESTIAL_CANNON', x: DISPLAY_CONFIG.WIDTH - 150, y: 900 },
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

  private createSkillPickups(): void {
    this.skillPickups = this.physics.add.group();

    // Skills arranged vertically on the left side
    const skills = [
      { type: 'BATTLE_DASH', name: 'Battle Dash', color: 0xff4444, y: 400 },
      { type: 'ARCANE_NOVA', name: 'Arcane Nova', color: 0xaa44ff, y: 550 },
      { type: 'PHANTOM_BARRIER', name: 'Phantom Barrier', color: 0xffd700, y: 700 },
    ];

    skills.forEach(({ type, name, color, y }) => {
      const pickup = this.skillPickups.create(
        150,
        y,
        'shard'
      ) as Phaser.Physics.Arcade.Sprite;

      pickup.setData('skillType', type);
      pickup.setData('skillName', name);
      pickup.setTint(color);

      // Add skill label
      const label = this.add.text(150, y + 35, name, {
        fontSize: '16px',
        color: '#ffffff',
        fontStyle: 'bold',
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

  private createPowerUpPickups(): void {
    this.powerUpPickups = this.physics.add.group();

    // Power-ups arranged vertically on the right side
    const powerUpTypes = Object.keys(POWERUP_CONFIG) as Array<keyof typeof POWERUP_CONFIG>;

    powerUpTypes.forEach((type, index) => {
      const config = POWERUP_CONFIG[type];
      const y = 200 + index * 120;

      const pickup = createPowerUpEntity(this, DISPLAY_CONFIG.WIDTH - 150, y, type);
      this.powerUpPickups.add(pickup);

      // Add power-up label
      const label = this.add.text(DISPLAY_CONFIG.WIDTH - 150, y + 35, config.name, {
        fontSize: '16px',
        color: '#ffffff',
        fontStyle: 'bold',
        stroke: '#000000',
        strokeThickness: 3,
      });
      label.setOrigin(0.5);
      pickup.setData('label', label);
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

    // Bullets hit moving enemies
    this.physics.add.overlap(
      this.bullets,
      this.enemies,
      (bulletObj, enemyObj) => {
        const bullet = bulletObj as Phaser.Physics.Arcade.Sprite;
        const enemy = enemyObj as Phaser.Physics.Arcade.Sprite;

        const projectile = bullet.getData('projectile') as ProjectileComponent;
        if (!projectile) return;

        const enemyHealth = enemy.getData('health') as HealthComponent;
        if (enemyHealth) {
          enemyHealth.current -= projectile.damage;

          // Show damage number
          this.showDamageNumber(enemy.x, enemy.y, projectile.damage);

          // Flash enemy
          enemy.setTint(0xff6666);
          this.time.delayedCall(100, () => {
            enemy.clearTint();
          });

          // Check if dead
          if (this.healthSystem.isDead(enemyHealth)) {
            enemy.destroy();

            // Only respawn if player is still in combat zone
            this.time.delayedCall(3000, () => {
              if (this.scene.isActive() && this.inCombatZone) {
                // Spawn within combat zone bounds
                const x = 100 + (Math.random() * (DISPLAY_CONFIG.WIDTH - 200));
                const y = this.COMBAT_ZONE_Y + 100 + (Math.random() * (this.COMBAT_ZONE_HEIGHT - 200));
                this.enemyManager.spawnEnemy('SLIME', x, y, this.time.now);
              }
            });
          }
        }

        // Handle piercing
        if (projectile.specialEffect === 'pierce_3' || projectile.specialEffect === 'pierce_all') {
          if (projectile.pierceCount && projectile.pierceCount > 0) {
            projectile.pierceCount--;
            if (projectile.pierceCount <= 0 && projectile.specialEffect === 'pierce_3') {
              this.projectileSystem.destroyProjectile(bullet);
            }
          }
        } else {
          this.projectileSystem.destroyProjectile(bullet);
        }
      },
      undefined,
      this
    );

    // Enemies hit player
    this.physics.add.overlap(
      this.player,
      this.enemies,
      (_, enemyObj) => {
        const enemy = enemyObj as Phaser.Physics.Arcade.Sprite;
        const playerHealth = this.player.getData('health') as HealthComponent;

        const currentTime = Date.now();
        if (playerHealth.isInvincible && currentTime < playerHealth.invincibilityEndTime) {
          return;
        }

        // Check if player has Battle Dash invincibility
        if (this.player.getData('invincible') === true) {
          return;
        }

        let damage = enemy.getData('damage') as number;

        // Apply barrier absorption if active (via SkillManager)
        damage = this.skillManager.handleBarrierDamage(this.player, damage, currentTime);

        // Apply shield power-up absorption
        damage = this.powerUpManager.applyShieldDamage(this.player, damage);

        // Apply damage
        if (damage > 0) {
          this.healthSystem.takeDamage(this.player, playerHealth, damage, this, currentTime);
          this.healthSystem.activateInvincibility(
            this.player,
            playerHealth,
            PLAYER_CONFIG.INVINCIBILITY_DURATION,
            this,
            currentTime
          );

          // Knockback
          const angle = Phaser.Math.Angle.Between(
            enemy.x,
            enemy.y,
            this.player.x,
            this.player.y
          );
          const knockback = PLAYER_CONFIG.KNOCKBACK_FORCE;
          this.player.setVelocity(Math.cos(angle) * knockback, Math.sin(angle) * knockback);
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

    // Player picks up skills - removes old components and adds new ones
    this.physics.add.overlap(
      this.player,
      this.skillPickups,
      (_playerObj, pickupObj) => {
        const pickup = pickupObj as Phaser.Physics.Arcade.Sprite;
        const skillType = pickup.getData('skillType') as 'BATTLE_DASH' | 'ARCANE_NOVA' | 'PHANTOM_BARRIER';
        const skillName = pickup.getData('skillName') as string;

        // Unregister current skill
        this.skillManager.unregisterEntity(this.player);

        // Remove old skill components
        this.player.setData('battleDash', undefined);
        this.player.setData('arcaneNova', undefined);
        this.player.setData('phantomBarrier', undefined);

        // Add new skill component based on type
        switch (skillType) {
          case 'BATTLE_DASH':
            this.player.setData('battleDash', { lastUsedTime: 0, cooldown: 5000, isActive: false, activeUntil: 0 });
            break;
          case 'ARCANE_NOVA':
            this.player.setData('arcaneNova', { lastUsedTime: 0, cooldown: 8000 });
            break;
          case 'PHANTOM_BARRIER':
            this.player.setData('phantomBarrier', { lastUsedTime: 0, cooldown: 12000, isActive: false, activeUntil: 0, damageAbsorbed: 0, maxAbsorb: 100 });
            break;
        }

        // Register new skill
        this.skillManager.registerSkill(this.player, skillType);

        // Update UI
        this.currentSkillText.setText(`Skill: ${skillName}`);
        this.skillText.setText(`${skillName} [SPACE]`);

        // Flash pickup
        const originalTint = pickup.tintTopLeft;
        pickup.setTint(0xffffff);
        this.time.delayedCall(200, () => {
          pickup.setTint(originalTint);
        });

        console.log(`✨ Switched to ${skillName} skill`);
      },
      undefined,
      this
    );

    // Player collects power-up
    this.physics.add.overlap(
      this.player,
      this.powerUpPickups,
      (_, powerUpObj) => {
        const pickup = powerUpObj as Phaser.Physics.Arcade.Sprite;
        const powerUpType = pickup.getData('powerUpType');

        // Activate power-up on player
        this.powerUpManager.activatePowerUp(this.player, powerUpType);

        // Flash pickup
        const originalTint = pickup.tintTopLeft;
        pickup.setTint(0xffffff);
        this.time.delayedCall(200, () => {
          pickup.setTint(originalTint);
        });

        console.log(`✨ Activated ${POWERUP_CONFIG[powerUpType as keyof typeof POWERUP_CONFIG].name} power-up`);
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
      'WEAPON & SKILL TEST ARENA\n' +
      'WASD: Move | Mouse: Aim | Click: Shoot | SPACEBAR: Skill\n' +
      'Left: Skills | Right: Weapons | Top: Dummies | Bottom: Combat Zone\n' +
      'ESC: Return to Menu',
      {
        fontSize: '16px',
        color: '#ffffff',
        backgroundColor: '#000000',
        padding: { x: 10, y: 10 },
      }
    );
    this.instructionText.setScrollFactor(0);
    this.instructionText.setDepth(UI_LAYOUT_CONFIG.DEPTHS.HUD);

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
    this.weaponText.setDepth(UI_LAYOUT_CONFIG.DEPTHS.HUD);

    // Current skill display
    const skillInfo = this.skillManager.getSkillCooldownInfo(this.player, this.time.now);
    this.currentSkillText = this.add.text(20, 180,
      `Skill: ${skillInfo.skillName}`,
      {
        fontSize: '20px',
        color: '#ff44aa',
        backgroundColor: '#000000',
        padding: { x: 10, y: 5 },
      }
    );
    this.currentSkillText.setScrollFactor(0);
    this.currentSkillText.setDepth(UI_LAYOUT_CONFIG.DEPTHS.HUD);

    // Health display
    const playerHealth = this.player.getData('health') as HealthComponent;
    this.healthText = this.add.text(20, 220,
      `HP: ${playerHealth.current}/${playerHealth.max}`,
      {
        fontSize: '20px',
        color: '#4caf50',
        backgroundColor: '#000000',
        padding: { x: 10, y: 5 },
      }
    );
    this.healthText.setScrollFactor(0);
    this.healthText.setDepth(UI_LAYOUT_CONFIG.DEPTHS.HUD);

    // Skill display
    const currentClassName = this.player.getData('className') as string;
    const classConfig = CHARACTER_CLASSES[currentClassName];
    this.skillText = this.add.text(20, 260,
      `Skill: ${classConfig.skillName} [SPACE]`,
      {
        fontSize: '18px',
        color: '#44aaff',
        backgroundColor: '#000000',
        padding: { x: 10, y: 5 },
      }
    );
    this.skillText.setScrollFactor(0);
    this.skillText.setDepth(UI_LAYOUT_CONFIG.DEPTHS.HUD);

    // Health bar above player
    this.healthBarBg = this.add.rectangle(0, 0, UI_LAYOUT_CONFIG.SKILL_BAR.WIDTH, 10, 0x222222);
    this.healthBarFill = this.add.rectangle(0, 0, UI_LAYOUT_CONFIG.SKILL_BAR.WIDTH, 10, 0x4caf50);
    this.healthBarFill.setOrigin(0, 0.5);

    // Skill cooldown bar
    this.skillCooldownBg = this.add.rectangle(0, 0, UI_LAYOUT_CONFIG.SKILL_BAR.WIDTH, 8, 0x333333);
    this.skillCooldownFill = this.add.rectangle(0, 0, UI_LAYOUT_CONFIG.SKILL_BAR.WIDTH, 8, 0x44aaff);
    this.skillCooldownFill.setOrigin(0, 0.5);

    // ESC to return
    this.input.keyboard?.on('keydown-ESC', () => {
      this.scene.start('MenuScene');
    });
  }

  update(time: number): void {
    // Get input
    const pointer = this.input.activePointer;
    const input = this.player.getData('input');
    const playerHealth = this.player.getData('health') as HealthComponent;

    // Update movement with power-up speed boost
    const movement = this.player.getData('movement') as MovementComponent;
    this.inputSystem.update(this.player, input, movement);

    const baseSpeed = movement.speed;
    const speedMultiplier = this.powerUpManager.getSpeedMultiplier(this.player);
    movement.speed = baseSpeed * speedMultiplier;

    this.movementSystem.update(this.player, movement);

    movement.speed = baseSpeed;

    // Update power-ups (remove expired buffs)
    this.powerUpManager.update(this.player);

    // Check if player is in combat zone
    const wasInCombatZone = this.inCombatZone;
    this.inCombatZone = this.player.y >= this.COMBAT_ZONE_Y &&
      this.player.y <= this.COMBAT_ZONE_Y + this.COMBAT_ZONE_HEIGHT;

    // Handle entering/leaving combat zone
    if (this.inCombatZone && !wasInCombatZone) {
      this.spawnEnemiesInCombatZone();
    } else if (!this.inCombatZone && wasInCombatZone) {
      this.despawnAllEnemies();
    }

    // Update skill manager
    this.skillManager.update(this.player, time);

    // Handle skill activation
    if (Phaser.Input.Keyboard.JustDown(this.spaceKey) || this.inputSystem.isSkillPressed()) {
      this.skillManager.useSkill(this.player, time, this.enemies);
    }

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
        const cooldownMultiplier = this.powerUpManager.getCooldownMultiplier(this.player);

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

    // Update AI for moving enemies
    this.enemies.children.entries.forEach((enemyObj) => {
      const enemy = enemyObj as Phaser.Physics.Arcade.Sprite;
      if (!enemy.active) return;

      // Check if enemy is dead from skill damage
      const enemyHealth = enemy.getData('health') as HealthComponent;
      if (enemyHealth && this.healthSystem.isDead(enemyHealth)) {
        enemy.destroy();
        return;
      }

      const ai = enemy.getData('ai') as AIComponent;

      if (ai) {
        const targetPos = new Phaser.Math.Vector2(this.player.x, this.player.y);
        this.aiSystem.update(enemy, ai, targetPos, time);
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

    // Update player health bar
    this.healthBarBg.setPosition(this.player.x, this.player.y - 50);
    this.healthBarFill.setPosition(this.player.x - 50, this.player.y - 50);
    const healthPercent = playerHealth.current / playerHealth.max;
    this.healthBarFill.width = 100 * healthPercent;

    if (healthPercent > 0.5) {
      this.healthBarFill.setFillStyle(0x4caf50);
    } else if (healthPercent > 0.25) {
      this.healthBarFill.setFillStyle(0xff9800);
    } else {
      this.healthBarFill.setFillStyle(0xf44336);
    }

    // Update skill cooldown bar using SkillManager
    this.skillCooldownBg.setPosition(this.player.x, this.player.y - UI_LAYOUT_CONFIG.SKILL_BAR.OFFSET_Y);
    this.skillCooldownFill.setPosition(this.player.x - UI_LAYOUT_CONFIG.SKILL_BAR.WIDTH / 2, this.player.y - UI_LAYOUT_CONFIG.SKILL_BAR.OFFSET_Y);
    const skillInfo = this.skillManager.getSkillCooldownInfo(this.player, time);
    this.skillCooldownFill.width = UI_LAYOUT_CONFIG.SKILL_BAR.WIDTH * skillInfo.cooldownPercent;

    if (skillInfo.isReady) {
      this.skillCooldownFill.setFillStyle(0x44ff44);
    } else {
      this.skillCooldownFill.setFillStyle(0x44aaff);
    }

    // Update health text
    this.healthText.setText(`HP: ${playerHealth.current}/${playerHealth.max}`);

    // Update weapon pickup labels
    this.weaponPickups.children.entries.forEach((pickupObj) => {
      const pickup = pickupObj as Phaser.Physics.Arcade.Sprite;
      const label = pickup.getData('label') as Phaser.GameObjects.Text;
      if (label) {
        label.setPosition(pickup.x, pickup.y + 30);
      }
    });

    // Update skill pickup labels
    this.skillPickups.children.entries.forEach((pickupObj) => {
      const pickup = pickupObj as Phaser.Physics.Arcade.Sprite;
      const label = pickup.getData('label') as Phaser.GameObjects.Text;
      if (label) {
        label.setPosition(pickup.x, pickup.y + 35);
      }
    });

    // Update power-up pickup labels
    this.powerUpPickups.children.entries.forEach((pickupObj) => {
      const pickup = pickupObj as Phaser.Physics.Arcade.Sprite;
      const label = pickup.getData('label') as Phaser.GameObjects.Text;
      if (label) {
        label.setPosition(pickup.x, pickup.y + 35);
      }
    });

    // Update power-up UI
    this.updatePowerUpUI();
  }

  private updatePowerUpUI(): void {
    const activePowerUps = this.powerUpManager.getActivePowerUps(this.player);
    const config = UI_LAYOUT_CONFIG.POWERUP_DISPLAY;

    // Track which power-ups are currently active
    const activePowerUpTypes = new Set(activePowerUps.map(p => p.type));

    // Remove UI elements for expired power-ups
    for (const [type, uiElements] of this.powerUpIcons.entries()) {
      if (!activePowerUpTypes.has(type as any)) {
        uiElements.icon.destroy();
        uiElements.timer.destroy();
        this.powerUpIcons.delete(type);
      }
    }

    // Create or update UI elements for active power-ups
    activePowerUps.forEach((powerUp, index) => {
      const typeString = powerUp.type.toString();
      const powerUpConfig = POWERUP_CONFIG[powerUp.type];

      if (!this.powerUpIcons.has(typeString)) {
        // Create new icon
        const x = config.OFFSET_X + index * config.ICON_SPACING;
        const y = config.OFFSET_Y;

        const icon = this.add.rectangle(x, y, config.ICON_SIZE, config.ICON_SIZE, powerUpConfig.color);
        icon.setScrollFactor(0);
        icon.setDepth(UI_LAYOUT_CONFIG.DEPTHS.HUD);

        const timer = this.add.text(x, y + config.TIMER_OFFSET_Y, '', {
          fontSize: config.TIMER_FONT_SIZE,
          color: '#ffffff',
          fontFamily: 'Arial',
        });
        timer.setOrigin(0.5, 0);
        timer.setScrollFactor(0);
        timer.setDepth(UI_LAYOUT_CONFIG.DEPTHS.HUD);

        this.powerUpIcons.set(typeString, { icon, timer });
      }

      // Update timer text
      const uiElements = this.powerUpIcons.get(typeString)!;
      const secondsRemaining = Math.ceil(powerUp.timeRemaining / 1000);
      uiElements.timer.setText(`${secondsRemaining}s`);

      // Update position (in case index changed)
      const x = config.OFFSET_X + index * config.ICON_SPACING;
      const y = config.OFFSET_Y;
      uiElements.icon.setPosition(x, y);
      uiElements.timer.setPosition(x, y + config.TIMER_OFFSET_Y);
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
