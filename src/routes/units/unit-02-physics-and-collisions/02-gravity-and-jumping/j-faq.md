# Gravity and Jumping - FAQ

## Basic Concepts

### Q1: Why does gravity only affect Y velocity?
**A**: In 2D platformers, gravity is typically only downward (vertical). In space games or top-down games, you might not have gravity at all, or it could pull in any direction.

### Q2: What's the difference between gravity and weight?
**A**:
- **Gravity**: Constant acceleration (pixels per second²)
- **Weight**: Force = mass × gravity
- Most games ignore mass and just use gravity directly

### Q3: Why use negative values for jumping?
**A**: In canvas, Y increases downward:
- Positive Y = down
- Negative Y = up
- Jump force is negative to go upward

---

## Implementation

### Q4: What's a good gravity value?
**A**: Typical range: 800-1200 px/s²
```typescript
// Floaty (Mario-like)
GRAVITY = 800;

// Normal
GRAVITY = 980;

// Snappy (Celeste-like)
GRAVITY = 1200;
```

Test and adjust based on feel!

### Q5: How do I calculate jump force for a specific height?
**A**: Use physics formula:
```
v² = 2 * a * d

Where:
v = initial velocity (jump force)
a = acceleration (gravity)
d = desired height

Example for 150 pixel jump with 980 gravity:
v = √(2 * 980 * 150)
v = √294000
v ≈ 542 pixels per second
```

```typescript
const desiredHeight = 150;
const GRAVITY = 980;
const JUMP_FORCE = -Math.sqrt(2 * GRAVITY * desiredHeight);
// JUMP_FORCE ≈ -542
```

### Q6: Why do I need terminal velocity?
**A**: Without it:
1. Objects accelerate infinitely
2. Collision detection fails (tunneling)
3. Looks unrealistic
4. Makes physics calculations unstable

```typescript
// Real physics has terminal velocity from air resistance
// Games set it manually for balance
MAX_FALL_SPEED = 600;
```

---

## Variable Jump Height

### Q7: How does variable jump height work?
**A**: Two techniques:

**Method 1: Cut velocity on release**
```typescript
if (jumpButtonReleased && velocityY < 0) {
  velocityY *= 0.5; // Cut velocity in half
}
```

**Method 2: Reduced gravity while holding**
```typescript
if (jumpButtonHeld && velocityY < 0) {
  velocityY += GRAVITY * 0.5 * dt; // Half gravity
} else {
  velocityY += GRAVITY * dt; // Full gravity
}
```

Most games use Method 1 (simpler and feels better).

### Q8: What's a good jump release multiplier?
**A**: Typical range: 0.4-0.6
```typescript
JUMP_RELEASE_MULTIPLIER = 0.5; // Good default

// 0.4 = very short minimum jump
// 0.5 = balanced
// 0.6 = longer minimum jump
```

### Q9: Should I always use variable jump height?
**A**: **Usually yes** for platformers:
- ✅ Platformers: Variable jump (Mario, Celeste)
- ✅ Metroidvanias: Variable jump (Hollow Knight)
- ❌ Arcade games: Fixed jump (Pac-Man)
- ❌ Fighting games: Fixed jump (Street Fighter)

---

## Jump Mechanics

### Q10: What is jump buffering?
**A**: Remembering jump input for a short time:
```typescript
// Player presses jump 100ms before landing
jumpBufferTime = 0.1;

// When landing:
if (jumpBufferTime > 0) {
  jump(); // Execute buffered jump
}
```

Makes controls feel more responsive!

### Q11: What is coyote time?
**A**: Grace period to jump after leaving ground:
```typescript
// Player walks off ledge
// For next 150ms, can still jump
coyoteTime = 0.15;

if (coyoteTime > 0) {
  canJump = true; // Even though in air
}
```

Named after Wile E. Coyote running off cliffs!

### Q12: Are jump buffer and coyote time necessary?
**A**: Not strictly necessary, but **highly recommended**:
- Makes controls feel better
- More forgiving
- Industry standard in good platformers
- Small code addition for big UX improvement

### Q13: What are good values for buffer/coyote time?
**A**:
```typescript
JUMP_BUFFER_DURATION = 0.1;  // 100ms (range: 80-150ms)
COYOTE_DURATION = 0.15;       // 150ms (range: 100-200ms)
```

Too short: Not noticeable
Too long: Feels weird/buggy

---

## Double Jump

### Q14: How do I implement double jump?
**A**: Track remaining jumps:
```typescript
jumpsRemaining = MAX_JUMPS; // Reset on ground

jump(): void {
  if (jumpsRemaining > 0) {
    velocityY = JUMP_FORCE;
    jumpsRemaining--;
  }
}
```

### Q15: Should the second jump be weaker?
**A**: Personal preference:
```typescript
// Same power (easier, more forgiving)
velocityY = JUMP_FORCE;

// Weaker second jump (more realistic)
const power = jumpsRemaining === MAX_JUMPS ? 1.0 : 0.9;
velocityY = JUMP_FORCE * power;
```

Most games use same power for simplicity.

### Q16: Can I have triple jump or more?
**A**: Yes! Just increase MAX_JUMPS:
```typescript
MAX_JUMPS = 3; // Triple jump
MAX_JUMPS = 999; // Infinite jumps (creative mode)
```

Common in action games (Devil May Cry, etc.).

---

## Air Control

### Q17: What is air control?
**A**: Ability to move horizontally while in air:
```typescript
// Different acceleration for air vs ground
const accel = isGrounded ? 
  GROUND_ACCELERATION : // Full control
  AIR_ACCELERATION;      // Reduced control

// Different friction
const friction = isGrounded ?
  FRICTION_GROUND : // Stops quickly
  FRICTION_AIR;      // Maintains momentum
```

### Q18: How much air control should I allow?
**A**: Depends on game style:

**High air control** (most platformers):
```typescript
AIR_ACCELERATION = GROUND_ACCELERATION * 0.7; // 70%
FRICTION_AIR = 0.95;
```

**Low air control** (realistic):
```typescript
AIR_ACCELERATION = GROUND_ACCELERATION * 0.3; // 30%
FRICTION_AIR = 0.98;
```

**No air control** (old arcade games):
```typescript
AIR_ACCELERATION = 0;
```

### Q19: Why do some games have limited air control?
**A**: Design choice:
- **Pros**: More realistic, requires planning jumps, higher skill ceiling
- **Cons**: Can feel restrictive, less forgiving

Modern platformers tend toward high air control for better feel.

---

## Physics Tuning

### Q20: How do I make jumping feel good?
**A**: Iterate on these values:

```typescript
// Start here:
GRAVITY = 980;
JUMP_FORCE = -450;
JUMP_RELEASE_MULTIPLIER = 0.5;
MAX_FALL_SPEED = 600;

// Too floaty?
GRAVITY = 1200;        // Increase
JUMP_FORCE = -500;     // Increase (jump higher to compensate)

// Too harsh?
GRAVITY = 800;         // Decrease
JUMP_FORCE = -400;     // Decrease

// Can't control?
AIR_ACCELERATION = 800; // Increase
FRICTION_AIR = 0.9;    // Decrease

// Minimum jump too high?
JUMP_RELEASE_MULTIPLIER = 0.4; // Decrease
```

### Q21: How do I make different jump types?
**A**:

```typescript
// Normal jump
normalJump(): void {
  velocityY = -450;
}

// High jump (hold up)
highJump(): void {
  velocityY = -600;
}

// Long jump (run + jump)
longJump(): void {
  velocityY = -400;
  velocityX *= 1.5; // Extra horizontal speed
}

// Wall jump
wallJump(): void {
  velocityY = -400;
  velocityX = isOnLeftWall ? 300 : -300; // Push away
}
```

### Q22: Why does my jump height vary?
**A**: Common causes:
1. Frame rate differences (not using deltaTime)
2. Gravity applied before collision check
3. Rounding errors with small deltaTime values

Fix:
```typescript
// Always use deltaTime
velocityY += GRAVITY * (deltaTime / 1000);

// Check collision AFTER applying velocity
y += velocityY * dt;
if (y >= GROUND_Y) { /* stop */ }
```

---

## Advanced Topics

### Q23: How do I implement wall jump?
**A**:
```typescript
class Player {
  isOnLeftWall = false;
  isOnRightWall = false;
  
  wallJump(): void {
    if (isOnLeftWall) {
      velocityY = WALL_JUMP_FORCE_Y;
      velocityX = WALL_JUMP_FORCE_X; // Push right
      isOnLeftWall = false;
    } else if (isOnRightWall) {
      velocityY = WALL_JUMP_FORCE_Y;
      velocityX = -WALL_JUMP_FORCE_X; // Push left
      isOnRightWall = false;
    }
  }
  
  // Typical values:
  WALL_JUMP_FORCE_Y = -400;
  WALL_JUMP_FORCE_X = 300;
}
```

### Q24: How do I implement wall slide?
**A**:
```typescript
update(dt: number): void {
  // Apply gravity
  velocityY += GRAVITY * dt;
  
  // Reduce fall speed on walls
  if ((isOnLeftWall || isOnRightWall) && velocityY > 0) {
    velocityY = Math.min(velocityY, WALL_SLIDE_SPEED);
  }
  
  // Apply velocity
  y += velocityY * dt;
}

// Typical value:
WALL_SLIDE_SPEED = 100; // Much slower than normal fall
```

### Q25: How do I implement dash?
**A**:
```typescript
class Player {
  isDashing = false;
  dashTime = 0;
  dashCooldown = 0;
  
  readonly DASH_SPEED = 800;
  readonly DASH_DURATION = 0.15; // 150ms
  readonly DASH_COOLDOWN = 1.0;  // 1 second
  
  dash(direction: number): void {
    if (dashCooldown <= 0 && !isDashing) {
      isDashing = true;
      dashTime = DASH_DURATION;
      dashCooldown = DASH_COOLDOWN;
      velocityX = direction * DASH_SPEED;
      velocityY = 0; // Cancel gravity during dash
    }
  }
  
  update(dt: number): void {
    // Update timers
    if (dashTime > 0) dashTime -= dt;
    if (dashCooldown > 0) dashCooldown -= dt;
    
    if (isDashing) {
      if (dashTime <= 0) {
        isDashing = false;
        velocityX *= 0.5; // Reduce speed after dash
      }
      // No gravity during dash
    } else {
      // Normal gravity
      velocityY += GRAVITY * dt;
    }
    
    // Apply velocity
    x += velocityX * dt;
    y += velocityY * dt;
  }
}
```

---

## Debugging

### Q26: How do I debug jump issues?
**A**: Add visual feedback:
```typescript
draw(ctx: CanvasRenderingContext2D): void {
  // Player color based on state
  if (isDashing) ctx.fillStyle = 'yellow';
  else if (!isGrounded) ctx.fillStyle = 'lightblue';
  else ctx.fillStyle = 'blue';
  
  ctx.fillRect(x - 16, y - 16, 32, 32);
  
  // Debug text
  ctx.fillStyle = 'black';
  ctx.font = '14px monospace';
  ctx.fillText(`Ground: ${isGrounded}`, 10, 30);
  ctx.fillText(`Vel Y: ${velocityY.toFixed(0)}`, 10, 50);
  ctx.fillText(`Jumps: ${jumpsRemaining}`, 10, 70);
  ctx.fillText(`Coyote: ${coyoteTime.toFixed(2)}`, 10, 90);
}
```

### Q27: Why can't I reproduce a bug?
**A**: Timing-dependent bugs:
- Works at 60 FPS, breaks at 30 FPS
- Works with keyboard, breaks with gamepad (different timing)
- Race conditions with multiple systems

Solution: Test at different frame rates:
```typescript
// Force lower FPS for testing
const targetFPS = 30;
const frameTime = 1000 / targetFPS;
if (deltaTime < frameTime) return; // Skip frame
```

---

## Best Practices

### Q28: Should I use real physics values?
**A**: **No!** Use what feels good:
- Real gravity: 9.8 m/s² (feels floaty in games)
- Game gravity: 800-1200 px/s² (feels responsive)

Games prioritize feel over realism.

### Q29: How do I handle slopes?
**A**: That's collision response! See next topic. Basic approach:
```typescript
// Detect slope
if (onSlope) {
  // Align to slope angle
  const slopeAngle = getSlopeAngle();
  // Adjust velocity/position based on slope
}
```

### Q30: Should I limit how fast the player can fall?
**A**: **Yes, always!** Terminal velocity is essential:
- Prevents tunneling through platforms
- Makes collision detection reliable
- Looks more realistic
- Easier to balance game

```typescript
if (velocityY > MAX_FALL_SPEED) {
  velocityY = MAX_FALL_SPEED;
}
```

---

## Next Steps

- Complete the exercises
- Experiment with different values
- Try implementing wall jump
- Move on to collision detection!
