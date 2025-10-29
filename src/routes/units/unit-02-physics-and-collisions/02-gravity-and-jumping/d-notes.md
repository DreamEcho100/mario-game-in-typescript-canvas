# Gravity and Jumping - Quick Notes

## Core Formulas

### Gravity
```typescript
velocityY += GRAVITY * deltaTime
```

### Jump
```typescript
velocityY = JUMP_FORCE // Negative = upward
```

### Variable Jump
```typescript
if (jumpReleased && velocityY < 0) {
  velocityY *= JUMP_RELEASE_MULTIPLIER
}
```

### Terminal Velocity
```typescript
if (velocityY > MAX_FALL_SPEED) {
  velocityY = MAX_FALL_SPEED
}
```

---

## Basic Platformer Player (Copy-Paste)

```typescript
class Player {
  x = 400;
  y = 300;
  velocityX = 0;
  velocityY = 0;
  
  readonly GRAVITY = 980;
  readonly JUMP_FORCE = -450;
  readonly MAX_FALL_SPEED = 600;
  readonly GROUND_Y = 500;
  
  isGrounded = false;
  
  update(dt: number): void {
    // Gravity
    this.velocityY += this.GRAVITY * (dt / 1000);
    if (this.velocityY > this.MAX_FALL_SPEED) {
      this.velocityY = this.MAX_FALL_SPEED;
    }
    
    // Apply velocity
    this.y += this.velocityY * (dt / 1000);
    
    // Ground collision
    if (this.y >= this.GROUND_Y) {
      this.y = this.GROUND_Y;
      this.velocityY = 0;
      this.isGrounded = true;
    } else {
      this.isGrounded = false;
    }
  }
  
  jump(): void {
    if (this.isGrounded) {
      this.velocityY = this.JUMP_FORCE;
    }
  }
}
```

---

## Variable Jump Height

```typescript
class Player {
  isJumping = false;
  readonly JUMP_RELEASE_MULTIPLIER = 0.5;
  
  jump(): void {
    if (this.isGrounded) {
      this.velocityY = this.JUMP_FORCE;
      this.isJumping = true;
    }
  }
  
  releaseJump(): void {
    if (this.isJumping && this.velocityY < 0) {
      this.velocityY *= this.JUMP_RELEASE_MULTIPLIER;
      this.isJumping = false;
    }
  }
}

// Input handling
let wasSpacePressed = false;
function handleInput(keys: Set<string>): void {
  const isSpacePressed = keys.has(' ');
  
  if (isSpacePressed && !wasSpacePressed) {
    player.jump();
  }
  if (!isSpacePressed && wasSpacePressed) {
    player.releaseJump();
  }
  
  wasSpacePressed = isSpacePressed;
}
```

---

## Jump Buffer

```typescript
class Player {
  jumpBufferTime = 0;
  readonly JUMP_BUFFER_DURATION = 0.1;
  
  update(dt: number): void {
    if (this.jumpBufferTime > 0) {
      this.jumpBufferTime -= dt;
    }
    
    // ... gravity and movement ...
    
    if (this.y >= this.GROUND_Y) {
      this.y = this.GROUND_Y;
      this.velocityY = 0;
      this.isGrounded = true;
      
      // Execute buffered jump
      if (this.jumpBufferTime > 0) {
        this.velocityY = this.JUMP_FORCE;
        this.jumpBufferTime = 0;
      }
    }
  }
  
  requestJump(): void {
    if (this.isGrounded) {
      this.jump();
    } else {
      this.jumpBufferTime = this.JUMP_BUFFER_DURATION;
    }
  }
}
```

---

## Coyote Time

```typescript
class Player {
  coyoteTime = 0;
  readonly COYOTE_DURATION = 0.15;
  wasGrounded = false;
  
  update(dt: number): void {
    // Update coyote time
    if (this.isGrounded) {
      this.coyoteTime = this.COYOTE_DURATION;
    } else if (this.wasGrounded && !this.isGrounded) {
      this.coyoteTime = this.COYOTE_DURATION;
    } else {
      this.coyoteTime -= dt;
    }
    
    this.wasGrounded = this.isGrounded;
    
    // ... rest of update ...
  }
  
  jump(): void {
    if (this.isGrounded || this.coyoteTime > 0) {
      this.velocityY = this.JUMP_FORCE;
      this.coyoteTime = 0;
    }
  }
}
```

---

## Double Jump

```typescript
class Player {
  jumpsRemaining = 2;
  readonly MAX_JUMPS = 2;
  
  update(dt: number): void {
    // ... gravity ...
    
    if (this.y >= this.GROUND_Y) {
      this.y = this.GROUND_Y;
      this.velocityY = 0;
      this.isGrounded = true;
      this.jumpsRemaining = this.MAX_JUMPS;
    }
  }
  
  jump(): void {
    if (this.jumpsRemaining > 0) {
      this.velocityY = this.JUMP_FORCE;
      this.jumpsRemaining--;
    }
  }
}
```

---

## Air Control

```typescript
class Player {
  readonly GROUND_ACCELERATION = 1200;
  readonly AIR_ACCELERATION = 600;
  readonly FRICTION_GROUND = 0.8;
  readonly FRICTION_AIR = 0.95;
  
  update(dt: number): void {
    const accel = this.isGrounded ? 
      this.GROUND_ACCELERATION : this.AIR_ACCELERATION;
    const friction = this.isGrounded ? 
      this.FRICTION_GROUND : this.FRICTION_AIR;
    
    this.velocityX += this.horizontalInput * accel * dt;
    this.velocityX *= Math.pow(friction, dt * 60);
    
    // ... gravity ...
  }
}
```

---

## Common Values

| Property | Typical Range | Recommended |
|----------|--------------|-------------|
| GRAVITY | 800-1200 | 980 |
| JUMP_FORCE | -400 to -500 | -450 |
| JUMP_RELEASE_MULTIPLIER | 0.4-0.6 | 0.5 |
| MAX_FALL_SPEED | 500-700 | 600 |
| JUMP_BUFFER_DURATION | 0.08-0.15 | 0.1 |
| COYOTE_DURATION | 0.1-0.2 | 0.15 |
| GROUND_ACCELERATION | 1000-1500 | 1200 |
| AIR_ACCELERATION | 400-800 | 600 |

---

## Presets

### Floaty (Mario-like)
```typescript
GRAVITY = 800
JUMP_FORCE = -400
MAX_FALL_SPEED = 500
```

### Snappy (Celeste-like)
```typescript
GRAVITY = 1200
JUMP_FORCE = -500
MAX_FALL_SPEED = 700
```

### Heavy (Realistic)
```typescript
GRAVITY = 1500
JUMP_FORCE = -600
MAX_FALL_SPEED = 800
```

---

## Update Order Checklist

```typescript
function update(deltaTime: number): void {
  const dt = deltaTime / 1000;
  
  // 1. Timers
  if (jumpBufferTime > 0) jumpBufferTime -= dt;
  updateCoyoteTime(dt);
  
  // 2. Input
  handleInput();
  
  // 3. Horizontal physics
  velocityX += horizontalInput * acceleration * dt;
  velocityX *= Math.pow(friction, dt * 60);
  
  // 4. Gravity
  velocityY += GRAVITY * dt;
  if (velocityY > MAX_FALL_SPEED) velocityY = MAX_FALL_SPEED;
  
  // 5. Apply velocities
  x += velocityX * dt;
  y += velocityY * dt;
  
  // 6. Collisions
  checkGroundCollision();
  
  // 7. Execute buffered actions
  if (isGrounded && jumpBufferTime > 0) jump();
}
```

---

## Quick Debug Display

```typescript
draw(ctx: CanvasRenderingContext2D): void {
  // Player
  ctx.fillRect(x - 16, y - 16, 32, 32);
  
  // Debug info
  ctx.fillStyle = 'black';
  ctx.font = '14px monospace';
  ctx.fillText(`Grounded: ${isGrounded}`, 10, 30);
  ctx.fillText(`Vel Y: ${velocityY.toFixed(0)}`, 10, 50);
  ctx.fillText(`Jumps: ${jumpsRemaining}`, 10, 70);
  ctx.fillText(`Coyote: ${coyoteTime.toFixed(2)}`, 10, 90);
  ctx.fillText(`Buffer: ${jumpBufferTime.toFixed(2)}`, 10, 110);
}
```
