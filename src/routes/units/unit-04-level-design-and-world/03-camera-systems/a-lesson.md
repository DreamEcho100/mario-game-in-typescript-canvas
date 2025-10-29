# Topic 03: Camera Systems - Lesson

## Introduction

Welcome to **Camera Systems**! A good camera is essential for any 2D platformer - it keeps the player in view, reveals upcoming obstacles, and creates a smooth, comfortable viewing experience. In this lesson, we'll build a professional camera system for our Mario game.

By the end of this lesson, you'll understand:
- Camera positioning and following
- Camera bounds and constraints
- Smooth camera movement (lerping)
- Deadzone-based cameras
- Look-ahead cameras
- Camera shake effects

## Table of Contents

1. [Basic Camera Concepts](#basic-camera-concepts)
2. [Simple Following Camera](#simple-following-camera)
3. [Camera Bounds](#camera-bounds)
4. [Smooth Camera (Lerp)](#smooth-camera-lerp)
5. [Deadzone Camera](#deadzone-camera)
6. [Look-Ahead Camera](#look-ahead-camera)
7. [Camera Shake](#camera-shake)
8. [Complete Implementation](#complete-implementation)

---

## Basic Camera Concepts

### What is a Camera?

A camera defines what portion of the game world is visible on screen:

```
World Space (2000x600):
┌────────────────────────────────────┐
│                                    │
│    ┌──────────┐                   │
│    │ Camera   │ ← Viewport        │
│    │ (800x600)│                   │
│    └──────────┘                   │
│                                    │
└────────────────────────────────────┘

Screen Space (800x600):
┌──────────┐
│          │ ← What player sees
│   Mario  │
│          │
└──────────┘
```

### Camera Components

```typescript
interface Camera {
  x: number;           // Camera position X (world space)
  y: number;           // Camera position Y (world space)
  width: number;       // Viewport width
  height: number;      // Viewport height
}
```

### World to Screen Conversion

```typescript
// Convert world position to screen position
function worldToScreen(worldX: number, worldY: number, camera: Camera) {
  return {
    screenX: worldX - camera.x,
    screenY: worldY - camera.y
  };
}

// Convert screen position to world position
function screenToWorld(screenX: number, screenY: number, camera: Camera) {
  return {
    worldX: screenX + camera.x,
    worldY: screenY + camera.y
  };
}
```

---

## Simple Following Camera

### Basic Implementation

The simplest camera centers on the player:

```typescript
class SimpleCamera {
  x: number = 0;
  y: number = 0;
  width: number;
  height: number;

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
  }

  // Follow the target
  follow(target: { x: number; y: number; width: number; height: number }): void {
    // Center camera on target
    this.x = target.x + target.width / 2 - this.width / 2;
    this.y = target.y + target.height / 2 - this.height / 2;
  }

  // Apply camera transformation to canvas
  apply(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    ctx.translate(-this.x, -this.y);
  }

  // Restore canvas transformation
  restore(ctx: CanvasRenderingContext2D): void {
    ctx.restore();
  }
}

// Usage
const camera = new SimpleCamera(800, 600);

function gameLoop() {
  camera.follow(player);
  
  camera.apply(ctx);
  
  // Draw world
  drawLevel();
  drawPlayer();
  
  camera.restore(ctx);
  
  // Draw UI (not affected by camera)
  drawHUD();
}
```

**Problem**: This camera is too rigid and snappy!

---

## Camera Bounds

### Constraining the Camera

Prevent the camera from showing areas outside the level:

```typescript
class BoundedCamera extends SimpleCamera {
  minX: number = 0;
  minY: number = 0;
  maxX: number;
  maxY: number;

  constructor(
    width: number,
    height: number,
    worldWidth: number,
    worldHeight: number
  ) {
    super(width, height);
    
    // Calculate maximum camera position
    this.maxX = Math.max(0, worldWidth - width);
    this.maxY = Math.max(0, worldHeight - height);
  }

  follow(target: { x: number; y: number; width: number; height: number }): void {
    // Center on target
    this.x = target.x + target.width / 2 - this.width / 2;
    this.y = target.y + target.height / 2 - this.height / 2;

    // Clamp to bounds
    this.x = Math.max(this.minX, Math.min(this.x, this.maxX));
    this.y = Math.max(this.minY, Math.min(this.y, this.maxY));
  }

  // Set custom bounds (for different areas)
  setBounds(minX: number, minY: number, maxX: number, maxY: number): void {
    this.minX = minX;
    this.minY = minY;
    this.maxX = maxX;
    this.maxY = maxY;
  }

  // Check if position is visible
  isVisible(x: number, y: number, width: number, height: number): boolean {
    return (
      x + width > this.x &&
      x < this.x + this.width &&
      y + height > this.y &&
      y < this.y + this.height
    );
  }
}
```

---

## Smooth Camera (Lerp)

### Linear Interpolation

Make the camera smoothly follow the player instead of snapping instantly:

```typescript
class SmoothCamera extends BoundedCamera {
  private targetX: number = 0;
  private targetY: number = 0;
  private smoothness: number = 0.1;  // 0 = instant, 1 = no movement

  constructor(
    width: number,
    height: number,
    worldWidth: number,
    worldHeight: number,
    smoothness: number = 0.1
  ) {
    super(width, height, worldWidth, worldHeight);
    this.smoothness = smoothness;
  }

  follow(target: { x: number; y: number; width: number; height: number }): void {
    // Calculate target position
    this.targetX = target.x + target.width / 2 - this.width / 2;
    this.targetY = target.y + target.height / 2 - this.height / 2;

    // Clamp target to bounds
    this.targetX = Math.max(this.minX, Math.min(this.targetX, this.maxX));
    this.targetY = Math.max(this.minY, Math.min(this.targetY, this.maxY));

    // Lerp towards target
    this.x += (this.targetX - this.x) * this.smoothness;
    this.y += (this.targetY - this.y) * this.smoothness;
  }

  // Update with delta time for frame-independent smoothing
  update(
    target: { x: number; y: number; width: number; height: number },
    deltaTime: number
  ): void {
    // Frame-independent lerp
    const lerpFactor = 1 - Math.pow(1 - this.smoothness, deltaTime * 60);
    
    this.targetX = target.x + target.width / 2 - this.width / 2;
    this.targetY = target.y + target.height / 2 - this.height / 2;

    this.targetX = Math.max(this.minX, Math.min(this.targetX, this.maxX));
    this.targetY = Math.max(this.minY, Math.min(this.targetY, this.maxY));

    this.x += (this.targetX - this.x) * lerpFactor;
    this.y += (this.targetY - this.y) * lerpFactor;
  }

  // Set smoothness (0-1)
  setSmoothness(smoothness: number): void {
    this.smoothness = Math.max(0, Math.min(1, smoothness));
  }

  // Snap to target immediately (for level transitions)
  snap(target: { x: number; y: number; width: number; height: number }): void {
    this.targetX = target.x + target.width / 2 - this.width / 2;
    this.targetY = target.y + target.height / 2 - this.height / 2;

    this.x = Math.max(this.minX, Math.min(this.targetX, this.maxX));
    this.y = Math.max(this.minY, Math.min(this.targetY, this.maxY));
  }
}
```

**Lerp formula**: `current += (target - current) * speed`

---

## Deadzone Camera

### Deadzone Concept

The camera only moves when the player leaves a "deadzone" in the center:

```
┌────────────────────┐
│                    │
│   ┌──────────┐    │
│   │ Deadzone │    │ ← Player can move freely here
│   │    👾    │    │
│   └──────────┘    │
│                    │
└────────────────────┘
     Camera View
```

### Implementation

```typescript
class DeadzoneCamera extends BoundedCamera {
  private deadzoneX: number;
  private deadzoneY: number;
  private deadzoneWidth: number;
  private deadzoneHeight: number;
  private smoothness: number = 0.1;

  constructor(
    width: number,
    height: number,
    worldWidth: number,
    worldHeight: number,
    deadzoneWidth: number = 100,
    deadzoneHeight: number = 100
  ) {
    super(width, height, worldWidth, worldHeight);
    
    this.deadzoneWidth = deadzoneWidth;
    this.deadzoneHeight = deadzoneHeight;
    
    // Center deadzone in viewport
    this.deadzoneX = (width - deadzoneWidth) / 2;
    this.deadzoneY = (height - deadzoneHeight) / 2;
  }

  follow(target: { x: number; y: number; width: number; height: number }): void {
    // Calculate target position in screen space
    const targetScreenX = target.x + target.width / 2 - this.x;
    const targetScreenY = target.y + target.height / 2 - this.y;

    // Calculate deadzone bounds
    const deadzoneLeft = this.deadzoneX;
    const deadzoneRight = this.deadzoneX + this.deadzoneWidth;
    const deadzoneTop = this.deadzoneY;
    const deadzoneBottom = this.deadzoneY + this.deadzoneHeight;

    let targetX = this.x;
    let targetY = this.y;

    // Check if target is outside deadzone horizontally
    if (targetScreenX < deadzoneLeft) {
      targetX = target.x + target.width / 2 - deadzoneLeft;
    } else if (targetScreenX > deadzoneRight) {
      targetX = target.x + target.width / 2 - deadzoneRight;
    }

    // Check if target is outside deadzone vertically
    if (targetScreenY < deadzoneTop) {
      targetY = target.y + target.height / 2 - deadzoneTop;
    } else if (targetScreenY > deadzoneBottom) {
      targetY = target.y + target.height / 2 - deadzoneBottom;
    }

    // Clamp to bounds
    targetX = Math.max(this.minX, Math.min(targetX, this.maxX));
    targetY = Math.max(this.minY, Math.min(targetY, this.maxY));

    // Smooth follow
    this.x += (targetX - this.x) * this.smoothness;
    this.y += (targetY - this.y) * this.smoothness;
  }

  // Debug: Draw deadzone
  drawDebug(ctx: CanvasRenderingContext2D): void {
    ctx.strokeStyle = 'yellow';
    ctx.lineWidth = 2;
    ctx.strokeRect(
      this.deadzoneX,
      this.deadzoneY,
      this.deadzoneWidth,
      this.deadzoneHeight
    );
  }
}
```

---

## Look-Ahead Camera

### Anticipating Movement

The camera looks ahead in the direction the player is moving:

```typescript
class LookAheadCamera extends DeadzoneCamera {
  private lookAheadX: number = 0;
  private lookAheadY: number = 0;
  private lookAheadDistance: number = 100;
  private lookAheadSpeed: number = 0.05;

  constructor(
    width: number,
    height: number,
    worldWidth: number,
    worldHeight: number,
    lookAheadDistance: number = 100
  ) {
    super(width, height, worldWidth, worldHeight);
    this.lookAheadDistance = lookAheadDistance;
  }

  followWithVelocity(
    target: { x: number; y: number; width: number; height: number },
    velocityX: number,
    velocityY: number
  ): void {
    // Calculate look-ahead based on velocity direction
    const targetLookAheadX = Math.sign(velocityX) * this.lookAheadDistance;
    const targetLookAheadY = Math.sign(velocityY) * this.lookAheadDistance * 0.5;

    // Smooth look-ahead
    this.lookAheadX += (targetLookAheadX - this.lookAheadX) * this.lookAheadSpeed;
    this.lookAheadY += (targetLookAheadY - this.lookAheadY) * this.lookAheadSpeed;

    // Create adjusted target with look-ahead offset
    const adjustedTarget = {
      x: target.x + this.lookAheadX,
      y: target.y + this.lookAheadY,
      width: target.width,
      height: target.height
    };

    // Follow the adjusted target
    super.follow(adjustedTarget);
  }

  // Reset look-ahead (when player changes direction)
  resetLookAhead(): void {
    this.lookAheadX = 0;
    this.lookAheadY = 0;
  }

  // Set look-ahead distance
  setLookAheadDistance(distance: number): void {
    this.lookAheadDistance = distance;
  }
}
```

---

## Camera Shake

### Adding Impact

Camera shake adds impact to explosions, hits, and landings:

```typescript
class ShakeCamera extends LookAheadCamera {
  private shakeX: number = 0;
  private shakeY: number = 0;
  private shakeIntensity: number = 0;
  private shakeDuration: number = 0;
  private shakeFrequency: number = 30;  // Shakes per second

  shake(intensity: number, duration: number): void {
    this.shakeIntensity = intensity;
    this.shakeDuration = duration;
  }

  update(
    target: { x: number; y: number; width: number; height: number },
    velocityX: number,
    velocityY: number,
    deltaTime: number
  ): void {
    // Update shake
    if (this.shakeDuration > 0) {
      this.shakeDuration -= deltaTime;

      // Random shake offset
      const angle = Math.random() * Math.PI * 2;
      this.shakeX = Math.cos(angle) * this.shakeIntensity;
      this.shakeY = Math.sin(angle) * this.shakeIntensity;

      // Decrease intensity over time
      this.shakeIntensity *= 0.9;
    } else {
      this.shakeX = 0;
      this.shakeY = 0;
      this.shakeIntensity = 0;
    }

    // Normal camera update
    this.followWithVelocity(target, velocityX, velocityY);
  }

  apply(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    ctx.translate(-(this.x + this.shakeX), -(this.y + this.shakeY));
  }
}
```

---

## Complete Implementation

### Full Mario Camera System

```typescript
class MarioCamera {
  x: number = 0;
  y: number = 0;
  width: number;
  height: number;

  // Bounds
  private minX: number = 0;
  private minY: number = 0;
  private maxX: number;
  private maxY: number;

  // Smoothing
  private smoothness: number = 0.1;
  private targetX: number = 0;
  private targetY: number = 0;

  // Deadzone
  private deadzoneWidth: number = 100;
  private deadzoneHeight: number = 80;

  // Look-ahead
  private lookAheadX: number = 0;
  private lookAheadDistance: number = 80;
  private lookAheadSpeed: number = 0.05;

  // Shake
  private shakeX: number = 0;
  private shakeY: number = 0;
  private shakeIntensity: number = 0;
  private shakeDuration: number = 0;

  constructor(
    width: number,
    height: number,
    worldWidth: number,
    worldHeight: number
  ) {
    this.width = width;
    this.height = height;
    this.maxX = Math.max(0, worldWidth - width);
    this.maxY = Math.max(0, worldHeight - height);
  }

  update(
    player: { x: number; y: number; width: number; height: number },
    velocityX: number,
    deltaTime: number
  ): void {
    // Update look-ahead
    const targetLookAhead = Math.sign(velocityX) * this.lookAheadDistance;
    this.lookAheadX += (targetLookAhead - this.lookAheadX) * this.lookAheadSpeed;

    // Calculate target center with look-ahead
    const playerCenterX = player.x + player.width / 2 + this.lookAheadX;
    const playerCenterY = player.y + player.height / 2;

    // Deadzone check
    const deadzoneLeft = this.x + (this.width - this.deadzoneWidth) / 2;
    const deadzoneRight = deadzoneLeft + this.deadzoneWidth;
    const deadzoneTop = this.y + (this.height - this.deadzoneHeight) / 2;
    const deadzoneBottom = deadzoneTop + this.deadzoneHeight;

    // Calculate target camera position
    this.targetX = this.x;
    this.targetY = this.y;

    if (playerCenterX < deadzoneLeft) {
      this.targetX = playerCenterX - (this.width - this.deadzoneWidth) / 2;
    } else if (playerCenterX > deadzoneRight) {
      this.targetX = playerCenterX - (this.width + this.deadzoneWidth) / 2;
    }

    if (playerCenterY < deadzoneTop) {
      this.targetY = playerCenterY - (this.height - this.deadzoneHeight) / 2;
    } else if (playerCenterY > deadzoneBottom) {
      this.targetY = playerCenterY - (this.height + this.deadzoneHeight) / 2;
    }

    // Clamp to bounds
    this.targetX = Math.max(this.minX, Math.min(this.targetX, this.maxX));
    this.targetY = Math.max(this.minY, Math.min(this.targetY, this.maxY));

    // Smooth follow
    const lerpFactor = 1 - Math.pow(1 - this.smoothness, deltaTime * 60);
    this.x += (this.targetX - this.x) * lerpFactor;
    this.y += (this.targetY - this.y) * lerpFactor;

    // Update shake
    if (this.shakeDuration > 0) {
      this.shakeDuration -= deltaTime;
      const angle = Math.random() * Math.PI * 2;
      this.shakeX = Math.cos(angle) * this.shakeIntensity;
      this.shakeY = Math.sin(angle) * this.shakeIntensity;
      this.shakeIntensity *= 0.9;
    } else {
      this.shakeX = 0;
      this.shakeY = 0;
    }
  }

  apply(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    ctx.translate(
      -Math.round(this.x + this.shakeX),
      -Math.round(this.y + this.shakeY)
    );
  }

  restore(ctx: CanvasRenderingContext2D): void {
    ctx.restore();
  }

  shake(intensity: number, duration: number): void {
    this.shakeIntensity = Math.max(this.shakeIntensity, intensity);
    this.shakeDuration = Math.max(this.shakeDuration, duration);
  }

  snap(player: { x: number; y: number; width: number; height: number }): void {
    this.x = player.x + player.width / 2 - this.width / 2;
    this.y = player.y + player.height / 2 - this.height / 2;
    this.x = Math.max(this.minX, Math.min(this.x, this.maxX));
    this.y = Math.max(this.minY, Math.min(this.y, this.maxY));
    this.targetX = this.x;
    this.targetY = this.y;
  }

  isVisible(x: number, y: number, width: number, height: number): boolean {
    return (
      x + width > this.x &&
      x < this.x + this.width &&
      y + height > this.y &&
      y < this.y + this.height
    );
  }
}
```

---

## Summary

You've learned:
1. **Basic camera concepts** - viewport and transformations
2. **Simple following** - center on player
3. **Camera bounds** - constrain to level
4. **Smooth camera** - lerp for smooth movement
5. **Deadzone camera** - comfortable player movement
6. **Look-ahead camera** - anticipate player direction
7. **Camera shake** - add impact to actions

A good camera is invisible to the player - they should never think about it!

## Next Steps

Next, we'll implement **Scrolling and Parallax** for depth and atmosphere!

Practice exercises are in `b-exercises.md`.
