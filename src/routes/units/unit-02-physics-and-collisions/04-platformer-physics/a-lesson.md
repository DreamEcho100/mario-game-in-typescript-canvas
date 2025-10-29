# Lesson: Platformer Physics Integration

## Introduction

This lesson brings together everything from Unit 02:
- ✅ Velocity & Acceleration (Topic 01)
- ✅ Gravity & Jumping (Topic 02)  
- ✅ Collision Detection (Topic 03)

We'll build a complete, production-ready platformer physics system that feels smooth, responsive, and fun to play.

---

## What Makes Good Platformer Physics?

### 1. **Responsive Controls**
- Instant direction change
- Variable jump height
- Air control

### 2. **Forgiving Mechanics**
- Jump buffering (press jump before landing)
- Coyote time (grace period after walking off ledge)
- Corner correction (slip around corners)

### 3. **Smooth Movement**
- Acceleration/deceleration
- Friction on ground
- Air resistance

### 4. **Predictable Collisions**
- No getting stuck
- Consistent bounce behavior
- Clear collision feedback

---

## Complete Platformer Player Class

```typescript
class PlatformerPlayer {
  // Position
  x: number;
  y: number;
  width = 32;
  height = 48;
  
  // Velocity
  velocityX = 0;
  velocityY = 0;
  
  // Physics constants
  readonly GRAVITY = 1400;
  readonly MAX_FALL_SPEED = 500;
  
  readonly GROUND_ACCEL = 2000;
  readonly GROUND_FRICTION = 0.85;
  readonly AIR_ACCEL = 1200;
  readonly AIR_FRICTION = 0.95;
  readonly MAX_RUN_SPEED = 250;
  
  // Jump
  readonly JUMP_FORCE = -450;
  readonly JUMP_RELEASE_MULTIPLIER = 0.4;
  readonly MAX_JUMPS = 2;
  
  // Grace periods
  readonly JUMP_BUFFER_TIME = 100; // ms
  readonly COYOTE_TIME = 150; // ms
  
  // State
  isGrounded = false;
  jumpsRemaining = this.MAX_JUMPS;
  jumpBufferTimer = 0;
  coyoteTimer = 0;
  isJumpHeld = false;
  
  // Input
  horizontalInput = 0;
  jumpPressed = false;
  
  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }
  
  // Collision helpers
  get left() { return this.x - this.width / 2; }
  get right() { return this.x + this.width / 2; }
  get top() { return this.y - this.height / 2; }
  get bottom() { return this.y + this.height / 2; }
  
  update(dt: number, platforms: Platform[]): void {
    const dtSec = dt / 1000;
    
    // Store previous grounded state
    const wasGrounded = this.isGrounded;
    
    // === HORIZONTAL MOVEMENT ===
    const targetSpeed = this.horizontalInput * this.MAX_RUN_SPEED;
    const accel = this.isGrounded ? this.GROUND_ACCEL : this.AIR_ACCEL;
    
    // Accelerate towards target speed
    if (this.horizontalInput !== 0) {
      this.velocityX += accel * this.horizontalInput * dtSec;
      
      // Clamp to max speed
      if (Math.abs(this.velocityX) > this.MAX_RUN_SPEED) {
        this.velocityX = Math.sign(this.velocityX) * this.MAX_RUN_SPEED;
      }
    }
    
    // Apply friction
    const friction = this.isGrounded ? this.GROUND_FRICTION : this.AIR_FRICTION;
    this.velocityX *= Math.pow(friction, dtSec * 60);
    
    // Stop if very slow
    if (Math.abs(this.velocityX) < 0.5) {
      this.velocityX = 0;
    }
    
    // Move horizontally
    this.x += this.velocityX * dtSec;
    
    // === GRAVITY ===
    this.velocityY += this.GRAVITY * dtSec;
    
    // Terminal velocity
    if (this.velocityY > this.MAX_FALL_SPEED) {
      this.velocityY = this.MAX_FALL_SPEED;
    }
    
    // Move vertically
    this.y += this.velocityY * dtSec;
    
    // === COLLISION DETECTION ===
    this.isGrounded = false;
    
    for (const platform of platforms) {
      this.resolveCollision(platform);
    }
    
    // === JUMPING ===
    
    // Reset jumps when landing
    if (this.isGrounded && !wasGrounded) {
      this.jumpsRemaining = this.MAX_JUMPS;
      this.coyoteTimer = this.COYOTE_TIME;
    }
    
    // Coyote time: grace period after walking off ledge
    if (!this.isGrounded && wasGrounded) {
      this.coyoteTimer = this.COYOTE_TIME;
    } else if (this.coyoteTimer > 0) {
      this.coyoteTimer -= dt;
    }
    
    // Jump buffer: remember jump press
    if (this.jumpPressed) {
      this.jumpBufferTimer = this.JUMP_BUFFER_TIME;
    }
    if (this.jumpBufferTimer > 0) {
      this.jumpBufferTimer -= dt;
    }
    
    // Execute jump
    if (this.jumpBufferTimer > 0) {
      const canCoyoteJump = this.coyoteTimer > 0 && this.jumpsRemaining === this.MAX_JUMPS;
      const canMultiJump = this.jumpsRemaining > 0;
      
      if (canCoyoteJump || canMultiJump) {
        this.velocityY = this.JUMP_FORCE;
        this.jumpsRemaining--;
        this.jumpBufferTimer = 0;
        this.coyoteTimer = 0;
        this.isJumpHeld = true;
      }
    }
    
    // Variable jump height (release early = shorter jump)
    if (!this.jumpPressed && this.isJumpHeld && this.velocityY < 0) {
      this.velocityY *= this.JUMP_RELEASE_MULTIPLIER;
      this.isJumpHeld = false;
    }
    
    // Reset jump press (must be done by input handler each frame)
    this.jumpPressed = false;
  }
  
  resolveCollision(platform: Platform): void {
    if (!this.collidesWith(platform)) return;
    
    // Calculate overlaps
    const overlapLeft = this.right - platform.left;
    const overlapRight = platform.right - this.left;
    const overlapTop = this.bottom - platform.top;
    const overlapBottom = platform.bottom - this.top;
    
    const minX = Math.min(overlapLeft, overlapRight);
    const minY = Math.min(overlapTop, overlapBottom);
    
    // Resolve on smallest overlap axis
    if (minX < minY) {
      // Horizontal collision
      if (overlapLeft < overlapRight) {
        this.x = platform.left - this.width / 2;
      } else {
        this.x = platform.right + this.width / 2;
      }
      this.velocityX = 0;
    } else {
      // Vertical collision
      if (overlapTop < overlapBottom) {
        // Landing on top
        this.y = platform.top - this.height / 2;
        this.velocityY = 0;
        this.isGrounded = true;
      } else {
        // Hitting head
        this.y = platform.bottom + this.height / 2;
        this.velocityY = 0;
      }
    }
  }
  
  collidesWith(platform: Platform): boolean {
    return (
      this.left < platform.right &&
      this.right > platform.left &&
      this.top < platform.bottom &&
      this.bottom > platform.top
    );
  }
  
  draw(ctx: CanvasRenderingContext2D): void {
    // Body
    ctx.fillStyle = this.isGrounded ? '#4CAF50' : '#2196F3';
    ctx.fillRect(this.left, this.top, this.width, this.height);
    
    // Direction indicator
    ctx.fillStyle = 'white';
    const indicatorX = this.x + (this.velocityX > 0 ? 8 : -8);
    ctx.fillRect(indicatorX - 4, this.y - 4, 8, 8);
    
    // Debug info
    if (this.coyoteTimer > 0) {
      ctx.fillStyle = 'orange';
      ctx.fillRect(this.left, this.top - 5, 
        (this.coyoteTimer / this.COYOTE_TIME) * this.width, 3);
    }
  }
}
```

---

## Platform Class

```typescript
class Platform {
  x: number;
  y: number;
  width: number;
  height: number;
  
  constructor(x: number, y: number, width: number, height: number) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }
  
  get left() { return this.x - this.width / 2; }
  get right() { return this.x + this.width / 2; }
  get top() { return this.y - this.height / 2; }
  get bottom() { return this.y + this.height / 2; }
  
  draw(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = '#795548';
    ctx.fillRect(this.left, this.top, this.width, this.height);
    
    // Top highlight
    ctx.fillStyle = '#A1887F';
    ctx.fillRect(this.left, this.top, this.width, 4);
  }
}
```

---

## Complete Game Setup

```typescript
const canvas = document.getElementById('game') as HTMLCanvasElement;
const ctx = canvas.getContext('2d')!;

canvas.width = 800;
canvas.height = 600;

// Create player
const player = new PlatformerPlayer(100, 100);

// Create platforms
const platforms: Platform[] = [
  new Platform(400, 550, 800, 100),  // Floor
  new Platform(200, 450, 150, 20),   // Left platform
  new Platform(600, 400, 150, 20),   // Right platform
  new Platform(400, 300, 100, 20),   // Middle high
  new Platform(100, 250, 120, 20),   // Top left
  new Platform(700, 200, 120, 20),   // Top right
];

// Input handling
const keys = new Set<string>();

window.addEventListener('keydown', (e) => {
  keys.add(e.key);
  
  if (e.key === ' ' || e.key === 'w' || e.key === 'ArrowUp') {
    player.jumpPressed = true;
    e.preventDefault();
  }
});

window.addEventListener('keyup', (e) => {
  keys.delete(e.key);
});

// Game loop
let lastTime = performance.now();

function gameLoop(currentTime: number): void {
  const dt = currentTime - lastTime;
  lastTime = currentTime;
  
  // Update input
  player.horizontalInput = 0;
  if (keys.has('a') || keys.has('ArrowLeft')) player.horizontalInput = -1;
  if (keys.has('d') || keys.has('ArrowRight')) player.horizontalInput = 1;
  
  // Update
  player.update(dt, platforms);
  
  // Draw
  ctx.fillStyle = '#87CEEB';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Draw platforms
  for (const platform of platforms) {
    platform.draw(ctx);
  }
  
  // Draw player
  player.draw(ctx);
  
  // Debug info
  ctx.fillStyle = 'black';
  ctx.font = '14px monospace';
  ctx.fillText(`Velocity: (${player.velocityX.toFixed(1)}, ${player.velocityY.toFixed(1)})`, 10, 20);
  ctx.fillText(`Grounded: ${player.isGrounded}`, 10, 40);
  ctx.fillText(`Jumps: ${player.jumpsRemaining}/${player.MAX_JUMPS}`, 10, 60);
  ctx.fillText(`Coyote: ${player.coyoteTimer.toFixed(0)}ms`, 10, 80);
  
  requestAnimationFrame(gameLoop);
}

gameLoop(performance.now());
```

---

## Advanced Features

### 1. **Corner Correction**

Helps player slip around corners instead of getting stuck:

```typescript
cornerCorrection(platform: Platform): void {
  const CORNER_DISTANCE = 8; // pixels
  
  // Check if close to corner
  const nearLeftEdge = Math.abs(this.right - platform.left) < CORNER_DISTANCE;
  const nearRightEdge = Math.abs(this.left - platform.right) < CORNER_DISTANCE;
  
  if (nearLeftEdge && this.velocityX > 0) {
    // Push up slightly
    this.y -= 2;
  } else if (nearRightEdge && this.velocityX < 0) {
    this.y -= 2;
  }
}
```

### 2. **Slope Support**

```typescript
class SlopePlatform extends Platform {
  slope: number; // -1 to 1
  
  getHeightAt(x: number): number {
    const relativeX = (x - this.left) / this.width;
    return this.top + relativeX * this.slope * this.height;
  }
  
  resolvePlayerCollision(player: PlatformerPlayer): void {
    const playerGroundY = this.getHeightAt(player.x);
    
    if (player.bottom > playerGroundY && player.velocityY >= 0) {
      player.y = playerGroundY - player.height / 2;
      player.velocityY = 0;
      player.isGrounded = true;
    }
  }
}
```

### 3. **Camera Follow**

```typescript
class Camera {
  x = 0;
  y = 0;
  
  readonly FOLLOW_SPEED = 0.1;
  readonly DEAD_ZONE_X = 200;
  readonly DEAD_ZONE_Y = 100;
  
  follow(target: PlatformerPlayer, dt: number): void {
    // Horizontal
    const dx = target.x - this.x;
    if (Math.abs(dx) > this.DEAD_ZONE_X) {
      this.x += (dx - Math.sign(dx) * this.DEAD_ZONE_X) * this.FOLLOW_SPEED;
    }
    
    // Vertical
    const dy = target.y - this.y;
    if (Math.abs(dy) > this.DEAD_ZONE_Y) {
      this.y += (dy - Math.sign(dy) * this.DEAD_ZONE_Y) * this.FOLLOW_SPEED;
    }
  }
  
  apply(ctx: CanvasRenderingContext2D): void {
    ctx.translate(-this.x + canvas.width / 2, -this.y + canvas.height / 2);
  }
}
```

---

## Performance Optimization

### Spatial Partitioning

For games with 100+ platforms:

```typescript
class SpatialGrid {
  cellSize = 100;
  grid = new Map<string, Platform[]>();
  
  clear(): void {
    this.grid.clear();
  }
  
  insert(platform: Platform): void {
    const cells = this.getCellsForObject(platform);
    for (const key of cells) {
      if (!this.grid.has(key)) {
        this.grid.set(key, []);
      }
      this.grid.get(key)!.push(platform);
    }
  }
  
  getCellsForObject(obj: Platform): string[] {
    const cells: string[] = [];
    
    const minX = Math.floor(obj.left / this.cellSize);
    const maxX = Math.floor(obj.right / this.cellSize);
    const minY = Math.floor(obj.top / this.cellSize);
    const maxY = Math.floor(obj.bottom / this.cellSize);
    
    for (let x = minX; x <= maxX; x++) {
      for (let y = minY; y <= maxY; y++) {
        cells.push(`${x},${y}`);
      }
    }
    
    return cells;
  }
  
  getNearby(player: PlatformerPlayer): Platform[] {
    const cells = this.getCellsForObject(player as any);
    const nearby = new Set<Platform>();
    
    for (const key of cells) {
      const cellPlatforms = this.grid.get(key);
      if (cellPlatforms) {
        for (const platform of cellPlatforms) {
          nearby.add(platform);
        }
      }
    }
    
    return Array.from(nearby);
  }
}

// Usage
const grid = new SpatialGrid();

// Rebuild grid each frame (or when platforms move)
grid.clear();
for (const platform of platforms) {
  grid.insert(platform);
}

// Only check nearby platforms
const nearbyPlatforms = grid.getNearby(player);
for (const platform of nearbyPlatforms) {
  player.resolveCollision(platform);
}
```

---

## Tuning Guide

### Tight & Responsive (Mario-like)
```typescript
GROUND_ACCEL = 3000;
GROUND_FRICTION = 0.75;
JUMP_FORCE = -500;
COYOTE_TIME = 120;
```

### Floaty & Smooth (Celeste-like)
```typescript
GROUND_ACCEL = 1500;
AIR_FRICTION = 0.98;
JUMP_FORCE = -400;
JUMP_RELEASE_MULTIPLIER = 0.5;
COYOTE_TIME = 200;
```

### Heavy & Momentum (Sonic-like)
```typescript
GROUND_ACCEL = 1000;
GROUND_FRICTION = 0.95;
MAX_RUN_SPEED = 400;
AIR_FRICTION = 0.99;
```

---

## Common Pitfalls

### ❌ **Wrong: Instant velocity**
```typescript
if (input) this.velocityX = 250; // Too jerky
```

### ✅ **Right: Gradual acceleration**
```typescript
if (input) this.velocityX += ACCEL * dt;
```

---

### ❌ **Wrong: Checking jump every frame**
```typescript
if (keys.has(' ')) this.jump(); // Multi-jump bug
```

### ✅ **Right: Edge detection**
```typescript
if (justPressed(' ')) this.jumpPressed = true;
```

---

### ❌ **Wrong: Direct friction**
```typescript
this.velocityX *= 0.9; // Frame-rate dependent
```

### ✅ **Right: Time-based friction**
```typescript
this.velocityX *= Math.pow(0.9, dt * 60);
```

---

## Key Formulas

### Collision Side Detection
```
minOverlapX = min(playerRight - platformLeft, platformRight - playerLeft)
minOverlapY = min(playerBottom - platformTop, platformBottom - playerTop)

if (minOverlapX < minOverlapY) → Horizontal collision
else → Vertical collision
```

### Jump Buffering
```
if (jumpPressed) {
  jumpBufferTimer = JUMP_BUFFER_TIME;
}

if (jumpBufferTimer > 0 && canJump) {
  executeJump();
  jumpBufferTimer = 0;
}
```

### Coyote Time
```
if (wasGrounded && !isGrounded) {
  coyoteTimer = COYOTE_TIME;
}

if (coyoteTimer > 0 && jumpPressed) {
  canJump = true;
}
```

---

## Complete Feature Checklist

- ✅ Smooth acceleration/deceleration
- ✅ Frame-rate independent physics
- ✅ Gravity with terminal velocity
- ✅ Variable jump height
- ✅ Jump buffering
- ✅ Coyote time
- ✅ Multi-jump (double jump)
- ✅ AABB collision detection
- ✅ Collision side detection
- ✅ Proper collision resolution
- ✅ Air vs ground control
- ✅ Visual feedback
- ✅ Debug display

---

## Next Steps

1. **Add wall jump** (Topic 02 exercises)
2. **Add dash mechanic** (Topic 01 exercises)
3. **Implement slopes** (Advanced feature above)
4. **Add moving platforms** (Topic 03 exercises)
5. **Create camera system** (Advanced feature above)
6. **Add enemy collision**
7. **Implement collectibles**
8. **Add particle effects**

---

## Summary

You now have a complete, production-ready platformer physics system that combines:
- **Responsive movement** with acceleration and friction
- **Smooth jumping** with variable height and grace mechanics
- **Solid collisions** with proper detection and resolution
- **Performance optimization** with spatial partitioning

This foundation can be extended with advanced mechanics like wall jumping, dashing, swimming, climbing, and more!

**Practice**: Build a complete level with different platform layouts and tune the feel until it's fun to play! 🎮
