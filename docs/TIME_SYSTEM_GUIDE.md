# Time System Guidelines

## ⚠️ Critical: Two Different Time Systems

Our game uses **two different time measurements**. Mixing them causes bugs!

### 1. Phaser Time (`scene.time.now`)
- **What**: Milliseconds since the scene started
- **Range**: Starts at 0, counts up (e.g., 5000 = 5 seconds into scene)
- **Use for**: 
  - Projectile lifespans
  - Weapon fire rates
  - Wave timers
  - Any game mechanic that resets when scene restarts

### 2. System Time (`Date.now()`)
- **What**: Unix timestamp (milliseconds since Jan 1, 1970)
- **Range**: Very large number (e.g., 1731283200000)
- **Use for**:
  - Invincibility frames (persists across scene changes)
  - External timestamps
  - Real-world time comparisons

## ✅ Current Implementation

### Projectile System (Uses Phaser Time)
```typescript
// Creating bullet in GameScene
const projectileComp = {
  damage: weapon.damage,
  spawnTime: time, // ✅ Phaser time from update(time)
  lifespan: 2000,
};

// Checking lifetime in ProjectileSystem
update(sprite, projectile, currentTime) {
  const age = currentTime - projectile.spawnTime; // ✅ Both Phaser time
  if (age >= projectile.lifespan) {
    this.destroyProjectile(sprite);
  }
}

// Calling from GameScene
this.projectileSystem.update(sprite, projectile, this.time.now); // ✅ Phaser time
```

### Health System (Uses System Time)
```typescript
// Taking damage in collision handler
const currentTime = Date.now(); // ✅ System time

// Check invincibility
if (playerHealth.isInvincible && currentTime < playerHealth.invincibilityEndTime) {
  return; // Still invincible
}

// Activate invincibility
this.healthSystem.activateInvincibility(
  this.player,
  playerHealth,
  PLAYER_CONFIG.INVINCIBILITY_DURATION,
  this,
  currentTime // ✅ System time
);

// In HealthSystem
activateInvincibility(sprite, health, duration, scene, time) {
  health.invincibilityEndTime = time + duration; // ✅ System time
}
```

### Weapon Fire Rate (Uses Phaser Time)
```typescript
// In GameScene.update(time)
const playerWeapon = this.player.getData('weapon') as WeaponComponent;
if (pointer.isDown) {
  const timeSinceLastShot = time - playerWeapon.lastShotTime; // ✅ Both Phaser time
  if (timeSinceLastShot > playerWeapon.fireRate) {
    this.shootBullet(this.player, playerWeapon, time);
  }
}

// In shootBullet
weapon.lastShotTime = time; // ✅ Phaser time
```

## ❌ Common Mistakes

### Mixing Time Systems
```typescript
// ❌ WRONG: Mixing Date.now() with Phaser time
const projectileComp = {
  spawnTime: Date.now(), // System time
  lifespan: 2000,
};

// Later...
const age = this.time.now - projectile.spawnTime; // Phaser - System = WRONG!
```

### Using Wrong Time in Callbacks
```typescript
// ❌ WRONG: Collision callbacks don't have Phaser time
this.physics.add.overlap(player, enemies, (_, enemy) => {
  // this.time is not available in collision callback
  this.healthSystem.takeDamage(player, health, damage, this, this.time.now); // ERROR!
});

// ✅ CORRECT: Use Date.now() for collision callbacks
this.physics.add.overlap(player, enemies, (_, enemy) => {
  const currentTime = Date.now();
  this.healthSystem.takeDamage(player, health, damage, this, currentTime);
});
```

## 🎯 Decision Guide

### Use Phaser Time (`scene.time.now`) When:
- ✅ Measuring duration within a scene
- ✅ Projectile lifespans
- ✅ Weapon cooldowns
- ✅ Animation timers
- ✅ Wave progression
- ✅ Scene-specific mechanics

### Use System Time (`Date.now()`) When:
- ✅ In collision callbacks (no access to scene.time)
- ✅ Invincibility frames (needs to work across scenes)
- ✅ Saving timestamps to storage
- ✅ Real-world time comparisons
- ✅ Cross-scene state that shouldn't reset

## 🔧 Refactoring Checklist

When adding new time-based features:

1. **Identify the scope**: Does it reset when scene restarts?
   - Yes → Use Phaser time
   - No → Use System time

2. **Check access**: Is it in a callback without scene context?
   - Yes → Use `Date.now()`
   - No → Use `scene.time.now`

3. **Verify consistency**: All comparisons use the same time system?
   - `spawnTime` from Phaser → compare with Phaser
   - `endTime` from Date → compare with Date

4. **Test edge cases**:
   - Scene restart (Phaser time resets to 0)
   - Long gameplay sessions (Phaser time keeps growing)
   - System time changes (should be rare)

## 🐛 Debugging Time Issues

If you see weird behavior:

1. **Add logging**:
```typescript
console.log('Spawn:', projectile.spawnTime, 'Current:', currentTime, 'Age:', age);
```

2. **Check magnitude**:
   - Phaser time: 0-100000 range for typical gameplay
   - System time: 1731283200000+ range (13 digits)
   - If they're very different, you're mixing systems!

3. **Verify components**:
```typescript
// Should all be consistent
weapon.lastShotTime     // Phaser time
projectile.spawnTime    // Phaser time
health.invincibilityEndTime // System time
```

## 📝 Code Review Checklist

When reviewing time-related code:

- [ ] Does it use `Date.now()` or `scene.time.now`?
- [ ] Are all comparisons using the same system?
- [ ] Is the time passed correctly through function calls?
- [ ] Does it handle scene restarts correctly?
- [ ] Are there console logs for debugging?
- [ ] Is the time scale documented in comments?
