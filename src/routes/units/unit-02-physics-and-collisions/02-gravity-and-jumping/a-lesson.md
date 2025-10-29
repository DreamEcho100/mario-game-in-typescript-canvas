# Gravity and Jumping

## Building on Topic 01: Adding Vertical Motion

In **Topic 01**, you learned about velocity and acceleration in general. Now we apply them **vertically**!

### Quick Recap: Acceleration Changes Velocity

```typescript
// Topic 01: General acceleration
velocity += acceleration * deltaTime;

// Topic 02 (NOW): Gravity IS acceleration!
velocity.y += GRAVITY * deltaTime; // Downward acceleration (constant!)
```

**Key Insight:** Gravity is just **constant downward acceleration**. That's it!

### The Difference: Horizontal vs Vertical

**Horizontal (Topic 01):**
- Acceleration controlled by player input
- Friction slows you down
- No constant force

**Vertical (Topic 02):**
- Acceleration is ALWAYS pulling down (gravity)
- Only stops when hitting ground
- Constant force (GRAVITY)

```typescript
// Horizontal: Player controls acceleration
if (keys.has('ArrowRight')) {
    velocity.x += acceleration * deltaTime; // Optional!
}

// Vertical: Gravity ALWAYS accelerates down
velocity.y += GRAVITY * deltaTime; // Always happens! (unless on ground)
```

Ready to make your character fall and jump? Let's go! ⬇️⬆️

---

## Learning Objectives
By the end of this lesson, you will be able to:
- Implement realistic gravity simulation
- Create responsive jump mechanics
- Handle variable jump heights (short press vs long press)
- Implement double jumps and jump buffering
- Add coyote time for forgiving platformer controls
- Create wall jumps and air control

## Prerequisites
- Completed Topic 01 (Velocity and Acceleration)
- Understanding of vectors and delta time
- Knowledge of basic physics (acceleration, velocity, position)

---

## What is Gravity?

**Gravity** is a constant downward acceleration that pulls objects toward the ground.

### Real-World Physics
- Earth's gravity: 9.8 m/s² (meters per second squared)
- This means every second, falling speed increases by 9.8 m/s

### Game Physics
- Games use arbitrary gravity values
- Typical range: 500-1500 pixels per second²
- Adjust based on what "feels good"

---

## Implementing Basic Gravity

### Step 1: Add Gravity Constant

```typescript
class Player {
  position = new Vector2D(400, 300);
  velocity = new Vector2D(0, 0);
  
  readonly GRAVITY = 980; // pixels per second²
  readonly GROUND_Y = 500;
  
  update(deltaTime: number): void {
    const dt = deltaTime / 1000;
    
    // Apply gravity to vertical velocity
    this.velocity.y += this.GRAVITY * dt;
    
    // Apply velocity to position
    this.position.y += this.velocity.y * dt;
    
    // Simple ground collision
    if (this.position.y >= this.GROUND_Y) {
      this.position.y = this.GROUND_Y;
      this.velocity.y = 0;
    }
  }
}
```

**Key Points**:
- Gravity only affects Y velocity (downward)
- Gravity is always applied (except when on ground)
- Ground collision stops downward movement

---

## Implementing Jump

### Basic Jump

```typescript
class Player {
  position = new Vector2D(400, 300);
  velocity = new Vector2D(0, 0);
  
  readonly GRAVITY = 980;
  readonly JUMP_FORCE = -400; // Negative = upward
  readonly GROUND_Y = 500;
  
  isGrounded = false;
  
  update(deltaTime: number): void {
    const dt = deltaTime / 1000;
    
    // Apply gravity (always)
    this.velocity.y += this.GRAVITY * dt;
    
    // Apply velocity
    this.position.y += this.velocity.y * dt;
    
    // Ground collision
    if (this.position.y >= this.GROUND_Y) {
      this.position.y = this.GROUND_Y;
      this.velocity.y = 0;
      this.isGrounded = true;
    } else {
      this.isGrounded = false;
    }
  }
  
  jump(): void {
    if (this.isGrounded) {
      this.velocity.y = this.JUMP_FORCE;
      this.isGrounded = false;
    }
  }
}

// In input handling:
if (keys.has(' ') && player.isGrounded) {
  player.jump();
}
```

---

## Variable Jump Height

**Problem**: Fixed jump height feels restrictive.

**Solution**: Allow shorter jumps by releasing jump button early.

### Implementation

```typescript
class Player {
  position = new Vector2D(400, 300);
  velocity = new Vector2D(0, 0);
  
  readonly GRAVITY = 980;
  readonly JUMP_FORCE = -500;
  readonly JUMP_RELEASE_MULTIPLIER = 0.5; // Cuts jump short
  readonly GROUND_Y = 500;
  
  isGrounded = false;
  isJumping = false;
  
  update(deltaTime: number): void {
    const dt = deltaTime / 1000;
    
    // Apply gravity
    this.velocity.y += this.GRAVITY * dt;
    
    // Apply velocity
    this.position.y += this.velocity.y * dt;
    
    // Ground collision
    if (this.position.y >= this.GROUND_Y) {
      this.position.y = this.GROUND_Y;
      this.velocity.y = 0;
      this.isGrounded = true;
      this.isJumping = false;
    } else {
      this.isGrounded = false;
    }
  }
  
  jump(): void {
    if (this.isGrounded) {
      this.velocity.y = this.JUMP_FORCE;
      this.isGrounded = false;
      this.isJumping = true;
    }
  }
  
  releaseJump(): void {
    // If moving upward and jump button released, cut velocity
    if (this.isJumping && this.velocity.y < 0) {
      this.velocity.y *= this.JUMP_RELEASE_MULTIPLIER;
      this.isJumping = false;
    }
  }
}

// Input handling
let wasSpacePressed = false;

function handleInput(keys: Set<string>): void {
  const isSpacePressed = keys.has(' ');
  
  // Jump on press
  if (isSpacePressed && !wasSpacePressed) {
    player.jump();
  }
  
  // Release jump on release
  if (!isSpacePressed && wasSpacePressed) {
    player.releaseJump();
  }
  
  wasSpacePressed = isSpacePressed;
}
```

**How It Works**:
- Pressing space: Full jump force applied
- Releasing space while moving up: Velocity cut in half
- Result: Variable jump heights based on button hold time

---

## Terminal Velocity (Falling)

Prevent infinite falling speed:

```typescript
class Player {
  readonly GRAVITY = 980;
  readonly MAX_FALL_SPEED = 600; // Terminal velocity
  
  update(deltaTime: number): void {
    const dt = deltaTime / 1000;
    
    // Apply gravity
    this.velocity.y += this.GRAVITY * dt;
    
    // Limit fall speed
    if (this.velocity.y > this.MAX_FALL_SPEED) {
      this.velocity.y = this.MAX_FALL_SPEED;
    }
    
    // Apply velocity
    this.position.y += this.velocity.y * dt;
    
    // ... rest of update
  }
}
```

---

## Jump Buffering

**Problem**: Pressing jump slightly before landing doesn't register.

**Solution**: Buffer jump input for a short time.

```typescript
class Player {
  // ... previous properties ...
  
  jumpBufferTime = 0;
  readonly JUMP_BUFFER_DURATION = 0.1; // 100ms buffer
  
  update(deltaTime: number): void {
    const dt = deltaTime / 1000;
    
    // Decrease jump buffer
    if (this.jumpBufferTime > 0) {
      this.jumpBufferTime -= dt;
    }
    
    // Apply gravity
    this.velocity.y += this.GRAVITY * dt;
    this.position.y += this.velocity.y * dt;
    
    // Ground collision
    if (this.position.y >= this.GROUND_Y) {
      this.position.y = this.GROUND_Y;
      this.velocity.y = 0;
      
      // Execute buffered jump
      if (this.jumpBufferTime > 0) {
        this.velocity.y = this.JUMP_FORCE;
        this.jumpBufferTime = 0;
        this.isJumping = true;
      } else {
        this.isGrounded = true;
        this.isJumping = false;
      }
    } else {
      this.isGrounded = false;
    }
  }
  
  requestJump(): void {
    if (this.isGrounded) {
      // Jump immediately if grounded
      this.jump();
    } else {
      // Buffer jump if in air
      this.jumpBufferTime = this.JUMP_BUFFER_DURATION;
    }
  }
}
```

**Benefits**:
- More forgiving controls
- Players can press jump "early"
- Feels more responsive

---

## Coyote Time

**Problem**: Running off a ledge prevents jumping.

**Solution**: Allow jumping for a short time after leaving ground.

```typescript
class Player {
  // ... previous properties ...
  
  coyoteTime = 0;
  readonly COYOTE_DURATION = 0.15; // 150ms grace period
  
  wasGrounded = false;
  
  update(deltaTime: number): void {
    const dt = deltaTime / 1000;
    
    // Update coyote time
    if (this.isGrounded) {
      this.coyoteTime = this.COYOTE_DURATION;
    } else if (this.wasGrounded && !this.isGrounded) {
      // Just left ground, start coyote time
      this.coyoteTime = this.COYOTE_DURATION;
    } else {
      // In air, decrease coyote time
      this.coyoteTime -= dt;
    }
    
    this.wasGrounded = this.isGrounded;
    
    // Apply gravity
    this.velocity.y += this.GRAVITY * dt;
    this.position.y += this.velocity.y * dt;
    
    // Ground collision
    if (this.position.y >= this.GROUND_Y) {
      this.position.y = this.GROUND_Y;
      this.velocity.y = 0;
      this.isGrounded = true;
    } else {
      this.isGrounded = false;
    }
  }
  
  jump(): void {
    // Can jump if grounded OR during coyote time
    if (this.isGrounded || this.coyoteTime > 0) {
      this.velocity.y = this.JUMP_FORCE;
      this.isJumping = true;
      this.coyoteTime = 0; // Reset coyote time
    }
  }
}
```

**Why "Coyote Time"?**
- Named after Wile E. Coyote running off cliffs
- Classic platformer technique
- Used in Super Meat Boy, Celeste, etc.

---

## Double Jump

Allow jumping once more while in air:

```typescript
class Player {
  // ... previous properties ...
  
  jumpsRemaining = 0;
  readonly MAX_JUMPS = 2; // 1 ground jump + 1 air jump
  
  update(deltaTime: number): void {
    const dt = deltaTime / 1000;
    
    // Apply gravity
    this.velocity.y += this.GRAVITY * dt;
    this.position.y += this.velocity.y * dt;
    
    // Ground collision
    if (this.position.y >= this.GROUND_Y) {
      this.position.y = this.GROUND_Y;
      this.velocity.y = 0;
      this.isGrounded = true;
      this.jumpsRemaining = this.MAX_JUMPS; // Reset jumps
    } else {
      this.isGrounded = false;
    }
  }
  
  jump(): void {
    if (this.jumpsRemaining > 0) {
      this.velocity.y = this.JUMP_FORCE;
      this.jumpsRemaining--;
      this.isJumping = true;
      
      // Optional: Make double jump slightly different
      if (this.jumpsRemaining === 0) {
        // This is the double jump
        this.velocity.y *= 0.9; // Slightly weaker
      }
    }
  }
}
```

---

## Air Control

Allow player to move horizontally while in air:

```typescript
class Player {
  // ... previous properties ...
  
  readonly GROUND_ACCELERATION = 1000;
  readonly AIR_ACCELERATION = 600; // Less control in air
  readonly MAX_SPEED_X = 300;
  readonly FRICTION_GROUND = 0.8;
  readonly FRICTION_AIR = 0.95; // Less friction in air
  
  update(deltaTime: number): void {
    const dt = deltaTime / 1000;
    
    // Choose acceleration based on ground state
    const acceleration = this.isGrounded ? 
      this.GROUND_ACCELERATION : this.AIR_ACCELERATION;
    
    // Apply horizontal acceleration
    this.velocity.x += this.horizontalInput * acceleration * dt;
    
    // Limit horizontal speed
    this.velocity.x = Math.max(
      -this.MAX_SPEED_X,
      Math.min(this.MAX_SPEED_X, this.velocity.x)
    );
    
    // Apply friction
    const friction = this.isGrounded ? 
      this.FRICTION_GROUND : this.FRICTION_AIR;
    this.velocity.x *= Math.pow(friction, dt * 60);
    
    // Apply gravity
    this.velocity.y += this.GRAVITY * dt;
    
    // Apply velocity
    this.position.x += this.velocity.x * dt;
    this.position.y += this.velocity.y * dt;
    
    // Ground collision
    if (this.position.y >= this.GROUND_Y) {
      this.position.y = this.GROUND_Y;
      this.velocity.y = 0;
      this.isGrounded = true;
    } else {
      this.isGrounded = false;
    }
  }
}
```

**Why Less Air Control?**
- More realistic
- Prevents "floating" feeling
- Adds challenge
- Requires planning jumps

---

## Complete Example: Platformer Player

```typescript
class Vector2D {
  constructor(public x: number = 0, public y: number = 0) {}
  
  add(v: Vector2D): Vector2D {
    return new Vector2D(this.x + v.x, this.y + v.y);
  }
  
  multiply(scalar: number): Vector2D {
    return new Vector2D(this.x * scalar, this.y * scalar);
  }
}

class Player {
  position: Vector2D;
  velocity: Vector2D;
  
  // Physics constants
  readonly GRAVITY = 980;
  readonly JUMP_FORCE = -450;
  readonly JUMP_RELEASE_MULTIPLIER = 0.5;
  readonly MAX_FALL_SPEED = 600;
  
  // Movement
  readonly GROUND_ACCELERATION = 1200;
  readonly AIR_ACCELERATION = 600;
  readonly MAX_SPEED_X = 250;
  readonly FRICTION_GROUND = 0.8;
  readonly FRICTION_AIR = 0.95;
  
  // Jump mechanics
  readonly MAX_JUMPS = 2;
  readonly JUMP_BUFFER_DURATION = 0.1;
  readonly COYOTE_DURATION = 0.15;
  
  // State
  isGrounded = false;
  isJumping = false;
  wasGrounded = false;
  jumpsRemaining = 2;
  jumpBufferTime = 0;
  coyoteTime = 0;
  
  horizontalInput = 0;
  
  readonly GROUND_Y = 500;
  readonly SIZE = 32;
  
  constructor(x: number, y: number) {
    this.position = new Vector2D(x, y);
    this.velocity = new Vector2D(0, 0);
  }
  
  handleInput(keys: Set<string>, keysPressed: Set<string>): void {
    // Horizontal input
    this.horizontalInput = 0;
    if (keys.has('a') || keys.has('ArrowLeft')) this.horizontalInput -= 1;
    if (keys.has('d') || keys.has('ArrowRight')) this.horizontalInput += 1;
    
    // Jump on press
    if (keysPressed.has(' ') || keysPressed.has('w') || keysPressed.has('ArrowUp')) {
      this.requestJump();
    }
    
    // Release jump
    if (!keys.has(' ') && !keys.has('w') && !keys.has('ArrowUp')) {
      this.releaseJump();
    }
  }
  
  requestJump(): void {
    // Can jump if grounded, have jumps, or within coyote time
    if (this.isGrounded || this.jumpsRemaining > 0 || this.coyoteTime > 0) {
      this.jump();
    } else {
      // Buffer the jump
      this.jumpBufferTime = this.JUMP_BUFFER_DURATION;
    }
  }
  
  jump(): void {
    if (this.isGrounded || this.coyoteTime > 0) {
      // Ground jump
      this.velocity.y = this.JUMP_FORCE;
      this.jumpsRemaining = this.MAX_JUMPS - 1;
      this.isJumping = true;
      this.coyoteTime = 0;
    } else if (this.jumpsRemaining > 0) {
      // Air jump (double jump)
      this.velocity.y = this.JUMP_FORCE * 0.9;
      this.jumpsRemaining--;
      this.isJumping = true;
    }
  }
  
  releaseJump(): void {
    if (this.isJumping && this.velocity.y < 0) {
      this.velocity.y *= this.JUMP_RELEASE_MULTIPLIER;
      this.isJumping = false;
    }
  }
  
  update(deltaTime: number): void {
    const dt = deltaTime / 1000;
    
    // Update timers
    if (this.jumpBufferTime > 0) this.jumpBufferTime -= dt;
    
    // Update coyote time
    if (this.isGrounded) {
      this.coyoteTime = this.COYOTE_DURATION;
    } else if (this.wasGrounded) {
      this.coyoteTime = this.COYOTE_DURATION;
    } else {
      this.coyoteTime -= dt;
    }
    
    // Horizontal movement
    const acceleration = this.isGrounded ? 
      this.GROUND_ACCELERATION : this.AIR_ACCELERATION;
    
    this.velocity.x += this.horizontalInput * acceleration * dt;
    this.velocity.x = Math.max(
      -this.MAX_SPEED_X,
      Math.min(this.MAX_SPEED_X, this.velocity.x)
    );
    
    const friction = this.isGrounded ? 
      this.FRICTION_GROUND : this.FRICTION_AIR;
    this.velocity.x *= Math.pow(friction, dt * 60);
    
    if (Math.abs(this.velocity.x) < 0.1) this.velocity.x = 0;
    
    // Vertical movement (gravity)
    this.velocity.y += this.GRAVITY * dt;
    if (this.velocity.y > this.MAX_FALL_SPEED) {
      this.velocity.y = this.MAX_FALL_SPEED;
    }
    
    // Apply velocity
    this.position.x += this.velocity.x * dt;
    this.position.y += this.velocity.y * dt;
    
    // Store previous grounded state
    this.wasGrounded = this.isGrounded;
    
    // Ground collision
    if (this.position.y >= this.GROUND_Y) {
      this.position.y = this.GROUND_Y;
      this.velocity.y = 0;
      this.isGrounded = true;
      this.jumpsRemaining = this.MAX_JUMPS;
      this.isJumping = false;
      
      // Execute buffered jump
      if (this.jumpBufferTime > 0) {
        this.jump();
        this.jumpBufferTime = 0;
      }
    } else {
      this.isGrounded = false;
    }
    
    // Keep in horizontal bounds
    this.position.x = Math.max(
      this.SIZE / 2,
      Math.min(800 - this.SIZE / 2, this.position.x)
    );
  }
  
  draw(ctx: CanvasRenderingContext2D): void {
    // Draw player
    ctx.fillStyle = this.isGrounded ? 'blue' : 'lightblue';
    ctx.fillRect(
      this.position.x - this.SIZE / 2,
      this.position.y - this.SIZE / 2,
      this.SIZE,
      this.SIZE
    );
    
    // Draw velocity indicator
    ctx.strokeStyle = 'red';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(this.position.x, this.position.y);
    ctx.lineTo(
      this.position.x + this.velocity.x * 0.1,
      this.position.y + this.velocity.y * 0.1
    );
    ctx.stroke();
    
    // Draw debug info
    ctx.fillStyle = 'black';
    ctx.font = '14px monospace';
    ctx.fillText(`Jumps: ${this.jumpsRemaining}`, 10, 30);
    ctx.fillText(`Grounded: ${this.isGrounded}`, 10, 50);
    ctx.fillText(`Coyote: ${this.coyoteTime.toFixed(2)}s`, 10, 70);
    ctx.fillText(`Buffer: ${this.jumpBufferTime.toFixed(2)}s`, 10, 90);
    ctx.fillText(`Vel Y: ${this.velocity.y.toFixed(0)}`, 10, 110);
  }
}

// Setup
const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
const ctx = canvas.getContext('2d')!;
canvas.width = 800;
canvas.height = 600;

const keys = new Set<string>();
const keysPressed = new Set<string>();

window.addEventListener('keydown', (e) => {
  if (!keys.has(e.key)) {
    keysPressed.add(e.key);
  }
  keys.add(e.key);
});

window.addEventListener('keyup', (e) => {
  keys.delete(e.key);
});

const player = new Player(400, 200);

let lastTime = 0;
function gameLoop(currentTime: number): void {
  const deltaTime = currentTime - lastTime;
  lastTime = currentTime;
  
  // Update
  player.handleInput(keys, keysPressed);
  player.update(deltaTime);
  keysPressed.clear();
  
  // Draw
  ctx.fillStyle = '#87CEEB';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Draw ground
  ctx.fillStyle = '#8B4513';
  ctx.fillRect(0, 500, canvas.width, canvas.height - 500);
  
  player.draw(ctx);
  
  // Instructions
  ctx.fillStyle = 'black';
  ctx.font = '14px monospace';
  ctx.fillText('A/D or Arrow Keys: Move', 10, canvas.height - 40);
  ctx.fillText('Space/W/Up: Jump', 10, canvas.height - 20);
  
  requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);
```

---

## Key Formulas

### Gravity Application
```typescript
velocityY += GRAVITY * deltaTime
```

### Jump Force
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

## Summary

1. **Gravity** = constant downward acceleration
2. **Jump** = instant upward velocity
3. **Variable jump** = cut velocity when button released
4. **Jump buffering** = remember jump input for short time
5. **Coyote time** = grace period after leaving ground
6. **Double jump** = track remaining jumps
7. **Air control** = different acceleration/friction in air

**Next**: Collision detection (AABB)!
