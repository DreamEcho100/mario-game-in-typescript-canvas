# Platformer Physics - Quick Notes

## Complete Player Template

```typescript
class PlatformerPlayer {
  // Position
  x: number; y: number;
  width = 32; height = 48;
  
  // Velocity
  velocityX = 0; velocityY = 0;
  
  // Constants
  readonly GRAVITY = 1400;
  readonly MAX_FALL_SPEED = 500;
  readonly GROUND_ACCEL = 2000;
  readonly GROUND_FRICTION = 0.85;
  readonly AIR_ACCEL = 1200;
  readonly AIR_FRICTION = 0.95;
  readonly MAX_RUN_SPEED = 250;
  readonly JUMP_FORCE = -450;
  readonly JUMP_RELEASE_MULTIPLIER = 0.4;
  readonly MAX_JUMPS = 2;
  readonly JUMP_BUFFER_TIME = 100;
  readonly COYOTE_TIME = 150;
  
  // State
  isGrounded = false;
  jumpsRemaining = this.MAX_JUMPS;
  jumpBufferTimer = 0;
  coyoteTimer = 0;
  isJumpHeld = false;
  
  // Input (set by input handler)
  horizontalInput = 0;
  jumpPressed = false;
}
```

---

## Update Order (Critical!)

```typescript
1. Store previous state (wasGrounded)
2. Update horizontal movement
3. Apply gravity
4. Move player (position += velocity * dt)
5. Reset isGrounded = false
6. Check collisions, resolve, set isGrounded
7. Handle jump mechanics (buffer, coyote, execute)
8. Reset input flags (jumpPressed = false)
```

---

## Jump Buffering Pattern

```typescript
if (this.jumpPressed) {
  this.jumpBufferTimer = this.JUMP_BUFFER_TIME;
}

if (this.jumpBufferTimer > 0) {
  this.jumpBufferTimer -= dt;
  
  if (this.isGrounded && this.jumpsRemaining > 0) {
    this.velocityY = this.JUMP_FORCE;
    this.jumpsRemaining--;
    this.jumpBufferTimer = 0;
  }
}
```

---

## Coyote Time Pattern

```typescript
// Walking off ledge
if (wasGrounded && !this.isGrounded) {
  this.coyoteTimer = this.COYOTE_TIME;
}

// Count down
if (this.coyoteTimer > 0) {
  this.coyoteTimer -= dt;
}

// Can jump with coyote
if (this.jumpPressed) {
  const canCoyoteJump = this.coyoteTimer > 0;
  if (this.isGrounded || canCoyoteJump) {
    this.jump();
    this.coyoteTimer = 0;
  }
}
```

---

## Variable Jump Height

```typescript
// Start jump
if (this.jumpPressed && this.canJump()) {
  this.velocityY = this.JUMP_FORCE;
  this.isJumpHeld = true;
}

// Release early = shorter jump
if (!jumpKeyDown && this.isJumpHeld && this.velocityY < 0) {
  this.velocityY *= this.JUMP_RELEASE_MULTIPLIER;
  this.isJumpHeld = false;
}
```

---

## Smooth Acceleration

```typescript
const targetSpeed = input * this.MAX_RUN_SPEED;
const accel = this.isGrounded ? this.GROUND_ACCEL : this.AIR_ACCEL;

if (input !== 0) {
  this.velocityX += accel * input * (dt / 1000);
  
  // Clamp to max
  if (Math.abs(this.velocityX) > this.MAX_RUN_SPEED) {
    this.velocityX = Math.sign(this.velocityX) * this.MAX_RUN_SPEED;
  }
}

// Friction
const friction = this.isGrounded ? this.GROUND_FRICTION : this.AIR_FRICTION;
this.velocityX *= Math.pow(friction, (dt / 1000) * 60);
```

---

## Collision Resolution

```typescript
resolveCollision(platform: Platform): void {
  if (!this.collidesWith(platform)) return;
  
  const overlapLeft = this.right - platform.left;
  const overlapRight = platform.right - this.left;
  const overlapTop = this.bottom - platform.top;
  const overlapBottom = platform.bottom - this.top;
  
  const minX = Math.min(overlapLeft, overlapRight);
  const minY = Math.min(overlapTop, overlapBottom);
  
  if (minX < minY) {
    // Horizontal
    if (overlapLeft < overlapRight) {
      this.x = platform.left - this.width / 2;
    } else {
      this.x = platform.right + this.width / 2;
    }
    this.velocityX = 0;
  } else {
    // Vertical
    if (overlapTop < overlapBottom) {
      this.y = platform.top - this.height / 2;
      this.velocityY = 0;
      this.isGrounded = true;
    } else {
      this.y = platform.bottom + this.height / 2;
      this.velocityY = 0;
    }
  }
}
```

---

## Common Tuning Presets

### Tight & Responsive (Mario)
```typescript
GROUND_ACCEL = 3000
GROUND_FRICTION = 0.75
JUMP_FORCE = -500
COYOTE_TIME = 120
```

### Floaty & Smooth (Celeste)
```typescript
GROUND_ACCEL = 1500
AIR_FRICTION = 0.98
JUMP_FORCE = -400
JUMP_RELEASE_MULTIPLIER = 0.5
```

### Heavy & Momentum (Sonic)
```typescript
GROUND_ACCEL = 1000
GROUND_FRICTION = 0.95
MAX_RUN_SPEED = 400
```

---

## Input Handling

```typescript
const keys = new Set<string>();

window.addEventListener('keydown', (e) => {
  keys.add(e.key);
  if (e.key === ' ') player.jumpPressed = true;
});

window.addEventListener('keyup', (e) => {
  keys.delete(e.key);
});

// In game loop
player.horizontalInput = 0;
if (keys.has('a')) player.horizontalInput = -1;
if (keys.has('d')) player.horizontalInput = 1;

player.update(dt, platforms);

// Reset jump press after update
player.jumpPressed = false;
```

---

## Debug Display

```typescript
ctx.fillStyle = 'black';
ctx.font = '14px monospace';
ctx.fillText(`Velocity: (${player.velocityX.toFixed(1)}, ${player.velocityY.toFixed(1)})`, 10, 20);
ctx.fillText(`Grounded: ${player.isGrounded}`, 10, 40);
ctx.fillText(`Jumps: ${player.jumpsRemaining}/${player.MAX_JUMPS}`, 10, 60);
ctx.fillText(`Coyote: ${Math.max(0, player.coyoteTimer).toFixed(0)}ms`, 10, 80);
ctx.fillText(`Buffer: ${Math.max(0, player.jumpBufferTimer).toFixed(0)}ms`, 10, 100);
```
