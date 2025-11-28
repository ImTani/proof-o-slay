# Phaser Tween System Reference

## What are Tweens?
Tweens are animations that smoothly interpolate values over time. Perfect for:
- UI animations (fade in/out, slide, scale)
- Gameplay effects (recoil, hit flash, floating items)
- Camera effects (shake, zoom)
- Particle-like effects without performance cost

## Basic Tween Example
```typescript
scene.tweens.add({
  targets: sprite,           // What to animate
  x: 400,                    // Property to change
  duration: 1000,            // Time in milliseconds
  ease: 'Power2',            // Easing function
});
```

## Common Tween Properties

### Basic Configuration
```typescript
{
  targets: sprite,           // GameObject(s) to animate (can be array)
  duration: 1000,            // Animation duration in ms
  delay: 0,                  // Delay before starting (ms)
  ease: 'Linear',            // Easing function (see list below)
}
```

### Animation Properties
Any numeric property can be tweened:
- **Position**: `x`, `y`
- **Scale**: `scale`, `scaleX`, `scaleY`
- **Rotation**: `angle` (degrees), `rotation` (radians)
- **Alpha**: `alpha` (0-1 transparency)
- **Tint**: `tint` (color value)

### Looping & Repeating
```typescript
{
  yoyo: true,                // Reverse animation (back and forth)
  repeat: -1,                // -1 = infinite, 0 = once, N = N times
  repeatDelay: 500,          // Delay between repeats (ms)
  hold: 200,                 // Pause at end before yoyo/repeat
}
```

### Callbacks
```typescript
{
  onStart: (tween, targets) => { },
  onUpdate: (tween, targets) => { },
  onYoyo: (tween, targets) => { },
  onRepeat: (tween, targets) => { },
  onComplete: (tween, targets) => { },
}
```

## Easing Functions
Control the "feel" of the animation:

### Common Easings
- `'Linear'` - Constant speed
- `'Quad.easeIn'` - Slow start
- `'Quad.easeOut'` - Slow end
- `'Quad.easeInOut'` - Slow start and end
- `'Sine.easeInOut'` - Smooth wave motion
- `'Bounce.easeOut'` - Bouncy landing
- `'Elastic.easeOut'` - Spring-like overshoot
- `'Back.easeOut'` - Slight overshoot

### Examples in Our Game

#### 1. Floating Shard (Up/Down Motion)
```typescript
scene.tweens.add({
  targets: sprite,
  y: y - 10,                 // Move up 10 pixels
  duration: 500,             // Half second
  yoyo: true,                // Go back down
  repeat: -1,                // Loop forever
  ease: 'Sine.easeInOut',    // Smooth wave motion
});
```

#### 2. Pulsing Shard (Scale)
```typescript
scene.tweens.add({
  targets: sprite,
  scale: 1.7,                // Grow to 1.7x size
  duration: 800,
  yoyo: true,                // Shrink back
  repeat: -1,                // Loop forever
  ease: 'Quad.easeInOut',    // Smooth in and out
});
```

#### 3. Rotating Shard
```typescript
scene.tweens.add({
  targets: sprite,
  angle: 360,                // Full rotation
  duration: 3000,            // 3 seconds per rotation
  repeat: -1,                // Spin forever
  ease: 'Linear',            // Constant speed
});
```

#### 4. Pistol Recoil (Quick Snap)
```typescript
scene.tweens.add({
  targets: pistol,
  scaleX: 0.8,               // Squish to 80%
  scaleY: 0.8,
  duration: 50,              // Very fast (50ms)
  yoyo: true,                // Snap back
  ease: 'Quad.easeOut',      // Sharp return
});
```

## Advanced Features

### Timeline (Sequence of Tweens)
```typescript
const timeline = scene.tweens.createTimeline();

timeline.add({
  targets: sprite,
  x: 100,
  duration: 500,
});

timeline.add({
  targets: sprite,
  y: 200,
  duration: 500,
  offset: '-=250',           // Start 250ms before previous ends (overlap)
});

timeline.play();
```

### Chain Multiple Tweens
```typescript
scene.tweens.add({
  targets: sprite,
  x: 400,
  duration: 1000,
  onComplete: () => {
    // Start next tween after first completes
    scene.tweens.add({
      targets: sprite,
      alpha: 0,
      duration: 500,
    });
  }
});
```

### Tween Multiple Properties
```typescript
scene.tweens.add({
  targets: sprite,
  x: 400,                    // Move right
  y: 300,                    // Move down
  alpha: 0.5,                // Fade out
  angle: 180,                // Rotate
  scale: 2,                  // Double size
  duration: 1000,
});
```

### Tween from Current to Target
```typescript
// Tweens automatically start from current value
sprite.x = 100;
scene.tweens.add({
  targets: sprite,
  x: 400,                    // Goes from 100 to 400
  duration: 1000,
});
```

### Tween Explicit From/To
```typescript
scene.tweens.add({
  targets: sprite,
  x: { from: 0, to: 400 },   // Explicit start/end
  duration: 1000,
});
```

### Random Values
```typescript
scene.tweens.add({
  targets: sprite,
  x: Phaser.Math.Between(0, 800),  // Random position
  duration: 1000,
});
```

## Controlling Tweens

### Store Reference
```typescript
const myTween = scene.tweens.add({ ... });

myTween.pause();
myTween.resume();
myTween.stop();
myTween.restart();
```

### Remove All Tweens from Object
```typescript
scene.tweens.killTweensOf(sprite);
```

## Common Use Cases

### Hit Flash
```typescript
scene.tweens.add({
  targets: sprite,
  alpha: 0.3,
  duration: 50,
  yoyo: true,
  repeat: 2,
});
```

### Death Fade
```typescript
scene.tweens.add({
  targets: sprite,
  alpha: 0,
  scale: 0,
  duration: 500,
  ease: 'Quad.easeIn',
  onComplete: () => sprite.destroy(),
});
```

### Pop-in Effect
```typescript
sprite.setScale(0);
scene.tweens.add({
  targets: sprite,
  scale: 1,
  duration: 300,
  ease: 'Back.easeOut',
});
```

### Camera Shake (Manual)
```typescript
const originalX = camera.scrollX;
const originalY = camera.scrollY;

scene.tweens.add({
  targets: camera,
  scrollX: originalX + Phaser.Math.Between(-5, 5),
  scrollY: originalY + Phaser.Math.Between(-5, 5),
  duration: 50,
  yoyo: true,
  repeat: 5,
});

// Or use built-in:
camera.shake(100, 0.01);
```

## Performance Tips
- Tweens are very efficient (much better than updating in game loop)
- Can animate hundreds of objects simultaneously
- Use `repeat: -1` for infinite loops instead of recreating tweens
- Kill unused tweens: `scene.tweens.killTweensOf(sprite)` before destroying sprites

## Resources
- [Phaser 3 Tween Docs](https://photonstorm.github.io/phaser3-docs/Phaser.Tweens.html)
- [Easing Function Visualizer](https://easings.net/)
- All easings: Linear, Quad, Cubic, Quart, Quint, Sine, Expo, Circ, Back, Bounce, Elastic
