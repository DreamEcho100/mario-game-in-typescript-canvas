# Platformer Physics - Solutions

## Solution 1: Basic Platformer ⭐

```typescript
class Player {
  x = 100;
  y = 100;
  width = 32;
  height = 32;
  velocityX = 0;
  velocityY = 0;
  
  readonly GRAVITY = 980;
  readonly MOVE_SPEED = 250;
  readonly JUMP_FORCE = -450;
  
  isGrounded = false;
  
  get left() { return this.x - this.width / 2; }
  get right() { return this.x + this.width / 2; }
  get top() { return this.y - this.height / 2; }
  get bottom() { return this.y + this.height / 2; }
  
  update(dt: number, input: { left: boolean; right: boolean; jump: boolean }): void {
    const dtSec = dt / 1000;
    
    // Horizontal
    this.velocityX = 0;
    if (input.left) this.velocityX = -this.MOVE_SPEED;
    if (input.right) this.velocityX = this.MOVE_SPEED;
    this.x += this.velocityX * dtSec;
    
    // Gravity
    this.velocityY += this.GRAVITY * dtSec;
    this.y += this.velocityY * dtSec;
    
    // Jump
    if (input.jump && this.isGrounded) {
      this.velocityY = this.JUMP_FORCE;
    }
  }
  
  resolveCollision(platform: Platform): void {
    if (!this.collidesWith(platform)) return;
    
    const overlapTop = this.bottom - platform.top;
    const overlapBottom = platform.bottom - this.top;
    
    if (overlapTop < overlapBottom) {
      this.y = platform.top - this.height / 2;
      this.velocityY = 0;
      this.isGrounded = true;
    } else {
      this.y = platform.bottom + this.height / 2;
      this.velocityY = 0;
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
}

class Platform {
  constructor(
    public x: number,
    public y: number,
    public width: number,
    public height: number
  ) {}
  
  get left() { return this.x - this.width / 2; }
  get right() { return this.x + this.width / 2; }
  get top() { return this.y - this.height / 2; }
  get bottom() { return this.y + this.height / 2; }
}

// Game setup
const player = new Player();
const floor = new Platform(400, 550, 800, 100);

function gameLoop(dt: number): void {
  player.isGrounded = false;
  
  const input = {
    left: keys.has('a'),
    right: keys.has('d'),
    jump: keys.has(' ')
  };
  
  player.update(dt, input);
  player.resolveCollision(floor);
  
  // Draw...
}
```

---

## Solution 3: Add Jump Buffering ⭐⭐

```typescript
class Player {
  jumpBufferTimer = 0;
  readonly JUMP_BUFFER_TIME = 100;
  jumpPressed = false;
  
  update(dt: number): void {
    // ... existing movement code ...
    
    // Jump buffer
    if (this.jumpPressed) {
      this.jumpBufferTimer = this.JUMP_BUFFER_TIME;
    }
    
    if (this.jumpBufferTimer > 0) {
      this.jumpBufferTimer -= dt;
      
      if (this.isGrounded) {
        this.velocityY = this.JUMP_FORCE;
        this.jumpBufferTimer = 0;
      }
    }
    
    this.jumpPressed = false; // Reset each frame
  }
  
  draw(ctx: CanvasRenderingContext2D): void {
    // Player body
    ctx.fillStyle = this.isGrounded ? 'green' : 'blue';
    ctx.fillRect(this.left, this.top, this.width, this.height);
    
    // Buffer indicator
    if (this.jumpBufferTimer > 0) {
      ctx.fillStyle = 'yellow';
      const barWidth = (this.jumpBufferTimer / this.JUMP_BUFFER_TIME) * this.width;
      ctx.fillRect(this.left, this.top - 8, barWidth, 4);
    }
  }
}

// Input handling
window.addEventListener('keydown', (e) => {
  if (e.key === ' ') {
    player.jumpPressed = true;
  }
});
```

---

## Solution 4: Implement Coyote Time ⭐⭐

```typescript
class Player {
  coyoteTimer = 0;
  readonly COYOTE_TIME = 150;
  wasGrounded = false;
  
  update(dt: number): void {
    // Store previous state
    this.wasGrounded = this.isGrounded;
    
    // ... movement code ...
    
    // Coyote time: started falling
    if (this.wasGrounded && !this.isGrounded) {
      this.coyoteTimer = this.COYOTE_TIME;
    }
    
    // Count down coyote timer
    if (this.coyoteTimer > 0 && !this.isGrounded) {
      this.coyoteTimer -= dt;
    }
    
    // Jump with coyote time
    if (this.jumpPressed) {
      if (this.isGrounded || this.coyoteTimer > 0) {
        this.velocityY = this.JUMP_FORCE;
        this.coyoteTimer = 0;
      }
    }
  }
  
  draw(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = this.isGrounded ? 'green' : 'blue';
    ctx.fillRect(this.left, this.top, this.width, this.height);
    
    // Coyote indicator
    if (this.coyoteTimer > 0) {
      ctx.fillStyle = 'orange';
      const barWidth = (this.coyoteTimer / this.COYOTE_TIME) * this.width;
      ctx.fillRect(this.left, this.bottom + 4, barWidth, 4);
    }
  }
}
```

---

## Solution 5: Double Jump ⭐⭐

```typescript
class Player {
  readonly MAX_JUMPS = 2;
  jumpsRemaining = this.MAX_JUMPS;
  
  update(dt: number): void {
    const wasGrounded = this.isGrounded;
    
    // ... movement code ...
    
    // Reset jumps on landing
    if (this.isGrounded && !wasGrounded) {
      this.jumpsRemaining = this.MAX_JUMPS;
    }
    
    // Execute jump
    if (this.jumpPressed && this.jumpsRemaining > 0) {
      this.velocityY = this.JUMP_FORCE;
      this.jumpsRemaining--;
      
      // Second jump stronger visual
      if (this.jumpsRemaining === 0) {
        // Spawn particle effect here
      }
    }
  }
  
  draw(ctx: CanvasRenderingContext2D): void {
    // Color based on jumps remaining
    if (this.jumpsRemaining === 2) ctx.fillStyle = 'green';
    else if (this.jumpsRemaining === 1) ctx.fillStyle = 'yellow';
    else ctx.fillStyle = 'red';
    
    ctx.fillRect(this.left, this.top, this.width, this.height);
    
    // Jump indicators
    for (let i = 0; i < this.jumpsRemaining; i++) {
      ctx.fillStyle = 'white';
      ctx.fillRect(this.left + i * 12, this.top - 10, 8, 6);
    }
  }
}
```

---

## Solution 6: Variable Jump Height ⭐⭐

```typescript
class Player {
  readonly JUMP_RELEASE_MULTIPLIER = 0.4;
  isJumpHeld = false;
  
  update(dt: number): void {
    // ... movement code ...
    
    // Start jump
    if (this.jumpPressed && this.canJump()) {
      this.velocityY = this.JUMP_FORCE;
      this.isJumpHeld = true;
    }
    
    // Release jump early
    if (!keys.has(' ') && this.isJumpHeld && this.velocityY < 0) {
      this.velocityY *= this.JUMP_RELEASE_MULTIPLIER;
      this.isJumpHeld = false;
    }
  }
}
```

---

## Solution 7: Air Control ⭐⭐⭐

```typescript
class Player {
  readonly GROUND_ACCEL = 2000;
  readonly AIR_ACCEL = 1200;
  readonly GROUND_FRICTION = 0.85;
  readonly AIR_FRICTION = 0.95;
  readonly MAX_SPEED = 250;
  
  update(dt: number, horizontalInput: number): void {
    const dtSec = dt / 1000;
    
    // Choose acceleration based on state
    const accel = this.isGrounded ? this.GROUND_ACCEL : this.AIR_ACCEL;
    const friction = this.isGrounded ? this.GROUND_FRICTION : this.AIR_FRICTION;
    
    // Accelerate
    if (horizontalInput !== 0) {
      this.velocityX += accel * horizontalInput * dtSec;
      
      // Clamp to max speed
      if (Math.abs(this.velocityX) > this.MAX_SPEED) {
        this.velocityX = Math.sign(this.velocityX) * this.MAX_SPEED;
      }
    }
    
    // Apply friction
    this.velocityX *= Math.pow(friction, dtSec * 60);
    
    // Move
    this.x += this.velocityX * dtSec;
    
    // ... gravity and collision ...
  }
}
```

---

## Solution 8: Complete Platformer ⭐⭐⭐

See the main lesson file (`a-lesson.md`) for the complete `PlatformerPlayer` class that combines:
- Jump buffering
- Coyote time
- Double jump
- Variable jump height
- Air control
- Smooth acceleration/friction

---

## Solution 9: Add Dash Mechanic ⭐⭐⭐

```typescript
class Player {
  readonly DASH_SPEED = 500;
  readonly DASH_DURATION = 200; // ms
  readonly DASH_COOLDOWN = 1000; // ms
  
  isDashing = false;
  dashTimer = 0;
  dashCooldown = 0;
  dashDirection = 0;
  
  update(dt: number, dashPressed: boolean): void {
    const dtSec = dt / 1000;
    
    // Dash cooldown
    if (this.dashCooldown > 0) {
      this.dashCooldown -= dt;
    }
    
    // Start dash
    if (dashPressed && this.dashCooldown <= 0 && !this.isDashing) {
      this.isDashing = true;
      this.dashTimer = this.DASH_DURATION;
      this.dashCooldown = this.DASH_COOLDOWN;
      this.dashDirection = this.horizontalInput || 1;
    }
    
    // During dash
    if (this.isDashing) {
      this.dashTimer -= dt;
      
      if (this.dashTimer <= 0) {
        this.isDashing = false;
      } else {
        // Override velocity during dash
        this.velocityX = this.dashDirection * this.DASH_SPEED;
        this.velocityY = 0; // Cancel gravity
      }
    } else {
      // Normal movement
      // ... regular update code ...
    }
    
    this.x += this.velocityX * dtSec;
    this.y += this.velocityY * dtSec;
  }
  
  draw(ctx: CanvasRenderingContext2D): void {
    // Dash trail effect
    if (this.isDashing) {
      ctx.fillStyle = 'rgba(255, 255, 0, 0.3)';
      for (let i = 1; i <= 3; i++) {
        ctx.fillRect(
          this.left - this.dashDirection * i * 10,
          this.top,
          this.width,
          this.height
        );
      }
    }
    
    // Player body
    ctx.fillStyle = this.isDashing ? 'yellow' : 'blue';
    ctx.fillRect(this.left, this.top, this.width, this.height);
    
    // Cooldown indicator
    if (this.dashCooldown > 0) {
      ctx.fillStyle = 'orange';
      const barHeight = (this.dashCooldown / this.DASH_COOLDOWN) * this.height;
      ctx.fillRect(this.left - 8, this.top, 4, barHeight);
    }
  }
}
```

---

## Solution 10: Camera Follow ⭐⭐⭐

```typescript
class Camera {
  x = 0;
  y = 0;
  
  readonly FOLLOW_SPEED = 0.1;
  readonly DEAD_ZONE_X = 200;
  readonly DEAD_ZONE_Y = 100;
  
  minX = 0;
  maxX = 2000;
  minY = 0;
  maxY = 1000;
  
  follow(target: Player, dt: number): void {
    // Horizontal following with dead zone
    const dx = target.x - this.x;
    if (Math.abs(dx) > this.DEAD_ZONE_X) {
      const direction = Math.sign(dx);
      this.x += (Math.abs(dx) - this.DEAD_ZONE_X) * direction * this.FOLLOW_SPEED;
    }
    
    // Vertical following with dead zone
    const dy = target.y - this.y;
    if (Math.abs(dy) > this.DEAD_ZONE_Y) {
      const direction = Math.sign(dy);
      this.y += (Math.abs(dy) - this.DEAD_ZONE_Y) * direction * this.FOLLOW_SPEED;
    }
    
    // Clamp to bounds
    this.x = Math.max(this.minX, Math.min(this.maxX, this.x));
    this.y = Math.max(this.minY, Math.min(this.maxY, this.y));
  }
  
  apply(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement): void {
    ctx.save();
    ctx.translate(
      -this.x + canvas.width / 2,
      -this.y + canvas.height / 2
    );
  }
  
  restore(ctx: CanvasRenderingContext2D): void {
    ctx.restore();
  }
}

// Usage
const camera = new Camera();

function gameLoop(dt: number): void {
  player.update(dt, platforms);
  camera.follow(player, dt);
  
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  camera.apply(ctx, canvas);
  
  // Draw world
  for (const platform of platforms) {
    platform.draw(ctx);
  }
  player.draw(ctx);
  
  camera.restore(ctx);
  
  // Draw UI (not affected by camera)
  drawUI(ctx);
}
```

---

## Key Takeaways

1. **Combine all physics**: velocity + gravity + collision
2. **Grace mechanics**: jump buffer + coyote time make controls forgiving
3. **State management**: track grounded, jumping, dashing states
4. **Tune feel**: adjust constants until it feels fun
5. **Visual feedback**: show state through color/effects
