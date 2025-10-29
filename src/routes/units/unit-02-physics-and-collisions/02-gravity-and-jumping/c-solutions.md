# Gravity and Jumping - Exercise Solutions

## Solution 1: Basic Gravity ⭐

```typescript
class Ball {
  x = 400;
  y = 100;
  velocityY = 0;
  radius = 20;
  
  readonly GRAVITY = 980;
  readonly GROUND_Y = 500;
  
  update(deltaTime: number): void {
    const dt = deltaTime / 1000;
    
    // Apply gravity to velocity
    this.velocityY += this.GRAVITY * dt;
    
    // Apply velocity to position
    this.y += this.velocityY * dt;
    
    // Ground collision
    if (this.y >= this.GROUND_Y) {
      this.y = this.GROUND_Y;
      this.velocityY = 0;
    }
  }
  
  draw(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = 'blue';
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
  }
}
```

---

## Solution 2: Simple Jump ⭐

```typescript
class Ball {
  x = 400;
  y = 100;
  velocityY = 0;
  
  readonly GRAVITY = 980;
  readonly JUMP_FORCE = -450;
  readonly GROUND_Y = 500;
  
  isGrounded = false;
  
  update(deltaTime: number): void {
    const dt = deltaTime / 1000;
    
    this.velocityY += this.GRAVITY * dt;
    this.y += this.velocityY * dt;
    
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

// Input handling
window.addEventListener('keydown', (e) => {
  if (e.key === ' ') {
    ball.jump();
  }
});
```

---

## Solution 3: Variable Jump Height ⭐⭐

```typescript
class Player {
  x = 400;
  y = 100;
  velocityY = 0;
  
  readonly GRAVITY = 980;
  readonly JUMP_FORCE = -500;
  readonly JUMP_RELEASE_MULTIPLIER = 0.5;
  readonly GROUND_Y = 500;
  
  isGrounded = false;
  isJumping = false;
  
  update(deltaTime: number): void {
    const dt = deltaTime / 1000;
    
    this.velocityY += this.GRAVITY * dt;
    this.y += this.velocityY * dt;
    
    if (this.y >= this.GROUND_Y) {
      this.y = this.GROUND_Y;
      this.velocityY = 0;
      this.isGrounded = true;
      this.isJumping = false;
    } else {
      this.isGrounded = false;
    }
  }
  
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

let wasSpacePressed = false;
const keys = new Set<string>();

window.addEventListener('keydown', (e) => keys.add(e.key));
window.addEventListener('keyup', (e) => keys.delete(e.key));

function update(): void {
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

## Solution 4: Terminal Velocity ⭐⭐

```typescript
class Player {
  readonly GRAVITY = 980;
  readonly MAX_FALL_SPEED = 600;
  
  update(deltaTime: number): void {
    const dt = deltaTime / 1000;
    
    // Apply gravity
    this.velocityY += this.GRAVITY * dt;
    
    // Apply terminal velocity
    if (this.velocityY > this.MAX_FALL_SPEED) {
      this.velocityY = this.MAX_FALL_SPEED;
    }
    
    this.y += this.velocityY * dt;
    
    if (this.y >= this.GROUND_Y) {
      this.y = this.GROUND_Y;
      this.velocityY = 0;
      this.isGrounded = true;
    } else {
      this.isGrounded = false;
    }
  }
  
  draw(ctx: CanvasRenderingContext2D): void {
    // Player
    const atMaxSpeed = this.velocityY >= this.MAX_FALL_SPEED;
    ctx.fillStyle = atMaxSpeed ? 'red' : 'blue';
    ctx.fillRect(this.x - 16, this.y - 16, 32, 32);
    
    // Speed display
    ctx.fillStyle = 'black';
    ctx.font = '16px monospace';
    ctx.fillText(`Speed: ${this.velocityY.toFixed(0)} px/s`, 10, 30);
    ctx.fillText(`Max: ${this.MAX_FALL_SPEED} px/s`, 10, 50);
  }
}
```

---

## Solution 5: Jump Buffer ⭐⭐

```typescript
class Player {
  jumpBufferTime = 0;
  readonly JUMP_BUFFER_DURATION = 0.1; // 100ms
  
  update(deltaTime: number): void {
    const dt = deltaTime / 1000;
    
    // Decrease buffer timer
    if (this.jumpBufferTime > 0) {
      this.jumpBufferTime -= dt;
    }
    
    // Apply gravity
    this.velocityY += this.GRAVITY * dt;
    this.y += this.velocityY * dt;
    
    // Ground collision
    if (this.y >= this.GROUND_Y) {
      this.y = this.GROUND_Y;
      this.velocityY = 0;
      this.isGrounded = true;
      
      // Execute buffered jump
      if (this.jumpBufferTime > 0) {
        this.velocityY = this.JUMP_FORCE;
        this.jumpBufferTime = 0;
        this.isJumping = true;
      }
    } else {
      this.isGrounded = false;
    }
  }
  
  requestJump(): void {
    if (this.isGrounded) {
      this.jump();
    } else {
      // Buffer the jump
      this.jumpBufferTime = this.JUMP_BUFFER_DURATION;
    }
  }
  
  draw(ctx: CanvasRenderingContext2D): void {
    // ... player drawing
    
    // Buffer indicator
    if (this.jumpBufferTime > 0) {
      ctx.fillStyle = 'yellow';
      ctx.fillRect(this.x - 20, this.y - 40, 40, 5);
      const bufferPercent = this.jumpBufferTime / this.JUMP_BUFFER_DURATION;
      ctx.fillStyle = 'orange';
      ctx.fillRect(this.x - 20, this.y - 40, 40 * bufferPercent, 5);
    }
  }
}
```

---

## Solution 6: Coyote Time ⭐⭐

```typescript
class Player {
  coyoteTime = 0;
  readonly COYOTE_DURATION = 0.15; // 150ms
  wasGrounded = false;
  
  update(deltaTime: number): void {
    const dt = deltaTime / 1000;
    
    // Update coyote time
    if (this.isGrounded) {
      this.coyoteTime = this.COYOTE_DURATION;
    } else if (this.wasGrounded && !this.isGrounded) {
      this.coyoteTime = this.COYOTE_DURATION;
    } else {
      this.coyoteTime -= dt;
    }
    
    this.wasGrounded = this.isGrounded;
    
    // Apply gravity
    this.velocityY += this.GRAVITY * dt;
    this.y += this.velocityY * dt;
    
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
    if (this.isGrounded || this.coyoteTime > 0) {
      this.velocityY = this.JUMP_FORCE;
      this.isJumping = true;
      this.coyoteTime = 0;
    }
  }
}
```

---

## Solution 7: Double Jump ⭐⭐

```typescript
class Player {
  jumpsRemaining = 2;
  readonly MAX_JUMPS = 2;
  
  update(deltaTime: number): void {
    const dt = deltaTime / 1000;
    
    this.velocityY += this.GRAVITY * dt;
    this.y += this.velocityY * dt;
    
    if (this.y >= this.GROUND_Y) {
      this.y = this.GROUND_Y;
      this.velocityY = 0;
      this.isGrounded = true;
      this.jumpsRemaining = this.MAX_JUMPS;
    } else {
      this.isGrounded = false;
    }
  }
  
  jump(): void {
    if (this.jumpsRemaining > 0) {
      // First jump = full power, second = 90%
      const jumpPower = this.jumpsRemaining === this.MAX_JUMPS ? 
        this.JUMP_FORCE : this.JUMP_FORCE * 0.9;
      
      this.velocityY = jumpPower;
      this.jumpsRemaining--;
      this.isJumping = true;
    }
  }
  
  draw(ctx: CanvasRenderingContext2D): void {
    // Player
    ctx.fillRect(this.x - 16, this.y - 16, 32, 32);
    
    // Jump indicators
    for (let i = 0; i < this.MAX_JUMPS; i++) {
      ctx.fillStyle = i < this.jumpsRemaining ? 'green' : 'gray';
      ctx.beginPath();
      ctx.arc(this.x - 10 + i * 20, this.y - 30, 5, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}
```

---

## Solution 8: Air Control ⭐⭐⭐

```typescript
class Player {
  x = 400;
  y = 100;
  velocityX = 0;
  velocityY = 0;
  
  readonly GROUND_ACCELERATION = 1200;
  readonly AIR_ACCELERATION = 600;
  readonly MAX_SPEED_X = 250;
  readonly FRICTION_GROUND = 0.8;
  readonly FRICTION_AIR = 0.95;
  
  horizontalInput = 0;
  
  update(deltaTime: number): void {
    const dt = deltaTime / 1000;
    
    // Choose physics based on grounded state
    const accel = this.isGrounded ? 
      this.GROUND_ACCELERATION : this.AIR_ACCELERATION;
    const friction = this.isGrounded ? 
      this.FRICTION_GROUND : this.FRICTION_AIR;
    
    // Horizontal movement
    this.velocityX += this.horizontalInput * accel * dt;
    this.velocityX = Math.max(-this.MAX_SPEED_X, 
      Math.min(this.MAX_SPEED_X, this.velocityX));
    this.velocityX *= Math.pow(friction, dt * 60);
    
    if (Math.abs(this.velocityX) < 0.1) this.velocityX = 0;
    
    // Vertical movement
    this.velocityY += this.GRAVITY * dt;
    
    // Apply velocities
    this.x += this.velocityX * dt;
    this.y += this.velocityY * dt;
    
    // Ground collision
    if (this.y >= this.GROUND_Y) {
      this.y = this.GROUND_Y;
      this.velocityY = 0;
      this.isGrounded = true;
    } else {
      this.isGrounded = false;
    }
  }
  
  handleInput(keys: Set<string>): void {
    this.horizontalInput = 0;
    if (keys.has('a') || keys.has('ArrowLeft')) this.horizontalInput -= 1;
    if (keys.has('d') || keys.has('ArrowRight')) this.horizontalInput += 1;
  }
}
```

---

## Key Takeaways

### Update Order
```typescript
1. Update timers (buffer, coyote)
2. Handle input
3. Apply acceleration (horizontal)
4. Apply friction
5. Apply gravity (vertical)
6. Apply velocities to position
7. Check collisions
8. Execute buffered actions
```

### Jump State Management
```typescript
- isGrounded: Currently on ground
- isJumping: Currently in jump (for variable height)
- wasGrounded: Previous frame grounded state (for coyote)
- jumpsRemaining: Jumps available
- jumpBufferTime: Time left to execute buffered jump
- coyoteTime: Time left to jump after leaving ground
```

### Physics Values
```typescript
GRAVITY: 800-1200 (higher = faster falling)
JUMP_FORCE: -400 to -500 (more negative = higher jump)
JUMP_RELEASE_MULTIPLIER: 0.4-0.6 (lower = shorter minimum jump)
MAX_FALL_SPEED: 500-700 (prevents infinite acceleration)
```
