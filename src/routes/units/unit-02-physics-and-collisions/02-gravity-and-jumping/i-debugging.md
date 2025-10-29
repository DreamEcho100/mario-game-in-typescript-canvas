# Gravity and Jumping - Debugging Guide

## Bug 1: Infinite Falling Speed

**Symptoms**:
- Player falls faster and faster indefinitely
- Eventually falls through ground
- Collision detection fails

**Diagnosis**:
```typescript
// Missing terminal velocity
velocityY += GRAVITY * dt; // Speed increases forever
```

**Solution**:
```typescript
velocityY += GRAVITY * dt;
if (velocityY > MAX_FALL_SPEED) {
  velocityY = MAX_FALL_SPEED;
}
```

---

## Bug 2: Can't Jump

**Symptoms**:
- Jump key does nothing
- No error messages

**Common Causes**:

### Cause A: Not checking grounded state
```typescript
// ❌ BAD
jump(): void {
  velocityY = JUMP_FORCE; // Always allows jump
}

// ✅ GOOD
jump(): void {
  if (isGrounded) {
    velocityY = JUMP_FORCE;
  }
}
```

### Cause B: isGrounded never set to true
```typescript
// Check ground collision
if (y >= GROUND_Y) {
  y = GROUND_Y;
  velocityY = 0;
  isGrounded = true; // Don't forget this!
}
```

### Cause C: Input not connected
```typescript
// Make sure this is called
window.addEventListener('keydown', (e) => {
  if (e.key === ' ') {
    player.jump(); // Is this being called?
  }
});
```

---

## Bug 3: Stuck Vibrating on Ground

**Symptoms**:
- Player bounces rapidly on ground
- Y position oscillates
- Looks jittery

**Diagnosis**:
```typescript
// Not stopping velocity on ground
if (y >= GROUND_Y) {
  y = GROUND_Y;
  // ❌ Missing: velocityY = 0
}
```

**Solution**:
```typescript
if (y >= GROUND_Y) {
  y = GROUND_Y;
  velocityY = 0; // Stop falling
  isGrounded = true;
}
```

---

## Bug 4: Falls Through Ground

**Symptoms**:
- Player sometimes passes through ground
- Happens at high speeds

**Diagnosis**:
```typescript
// Checking collision BEFORE moving
if (y >= GROUND_Y) { /* ... */ }
y += velocityY * dt; // Moves AFTER check
```

**Solution**:
```typescript
// Move FIRST, then check collision
y += velocityY * dt;

if (y >= GROUND_Y) {
  y = GROUND_Y; // Correct position
  velocityY = 0;
  isGrounded = true;
}
```

---

## Bug 5: Variable Jump Doesn't Work

**Symptoms**:
- Jump height always the same
- Releasing button has no effect

**Diagnosis**:
```typescript
// Not tracking jump state
releaseJump(): void {
  velocityY *= 0.5; // Affects all upward movement!
}
```

**Solution**:
```typescript
class Player {
  isJumping = false;
  
  jump(): void {
    if (isGrounded) {
      velocityY = JUMP_FORCE;
      isJumping = true; // Start tracking
    }
  }
  
  releaseJump(): void {
    // Only cut velocity if actively jumping AND moving up
    if (isJumping && velocityY < 0) {
      velocityY *= JUMP_RELEASE_MULTIPLIER;
      isJumping = false;
    }
  }
}
```

---

## Bug 6: Jump Buffer Not Working

**Symptoms**:
- Jump still doesn't register when pressed early
- Buffer timer decreases but jump doesn't execute

**Diagnosis**:
```typescript
// Buffer set but never checked
if (y >= GROUND_Y) {
  y = GROUND_Y;
  velocityY = 0;
  isGrounded = true;
  // ❌ Not checking jumpBufferTime
}
```

**Solution**:
```typescript
if (y >= GROUND_Y) {
  y = GROUND_Y;
  velocityY = 0;
  isGrounded = true;
  
  // Execute buffered jump
  if (jumpBufferTime > 0) {
    velocityY = JUMP_FORCE;
    jumpBufferTime = 0;
    isJumping = true;
  }
}
```

---

## Bug 7: Coyote Time Issues

**Symptoms**:
- Can jump in mid-air indefinitely
- Coyote time doesn't expire

**Diagnosis**:
```typescript
// Not decreasing coyote time in air
if (isGrounded) {
  coyoteTime = COYOTE_DURATION;
}
// ❌ Not handling air case
```

**Solution**:
```typescript
if (isGrounded) {
  coyoteTime = COYOTE_DURATION;
} else if (wasGrounded && !isGrounded) {
  // Just left ground
  coyoteTime = COYOTE_DURATION;
} else {
  // In air, decrease timer
  coyoteTime -= dt;
}

wasGrounded = isGrounded;
```

---

## Bug 8: Double Jump Doesn't Reset

**Symptoms**:
- Can only double jump once ever
- Jumps don't reset on landing

**Diagnosis**:
```typescript
// Not resetting jumps on ground
if (y >= GROUND_Y) {
  y = GROUND_Y;
  velocityY = 0;
  isGrounded = true;
  // ❌ Missing: jumpsRemaining = MAX_JUMPS
}
```

**Solution**:
```typescript
if (y >= GROUND_Y) {
  y = GROUND_Y;
  velocityY = 0;
  isGrounded = true;
  jumpsRemaining = MAX_JUMPS; // Reset jumps
}
```

---

## Bug 9: Air Control Too Strong/Weak

**Symptoms**:
- Can't control player in air
- Or too much control (unrealistic)

**Diagnosis**:
```typescript
// Using same acceleration for air and ground
const acceleration = ACCELERATION; // No difference
```

**Solution**:
```typescript
// Different physics for air vs ground
const acceleration = isGrounded ? 
  GROUND_ACCELERATION : AIR_ACCELERATION;

const friction = isGrounded ? 
  FRICTION_GROUND : FRICTION_AIR;

velocityX += horizontalInput * acceleration * dt;
velocityX *= Math.pow(friction, dt * 60);
```

**Tuning Guide**:
```typescript
// More air control
AIR_ACCELERATION = 800; // Higher
FRICTION_AIR = 0.9;     // Lower

// Less air control (more realistic)
AIR_ACCELERATION = 400; // Lower
FRICTION_AIR = 0.98;    // Higher
```

---

## Bug 10: Gravity Feels Wrong

**Symptoms**:
- Jump too floaty or too snappy
- Doesn't feel good to play

**Common Issues**:

### Issue A: Gravity too low
```typescript
GRAVITY = 300; // ❌ Too floaty
GRAVITY = 980; // ✅ Better
```

### Issue B: Jump force wrong
```typescript
// If falls too fast, increase jump force
JUMP_FORCE = -300; // Too weak
JUMP_FORCE = -500; // Better

// If floats too long, decrease jump force
JUMP_FORCE = -700; // Too strong
JUMP_FORCE = -450; // Better
```

### Issue C: Not frame-rate independent
```typescript
// ❌ BAD
velocityY += GRAVITY;

// ✅ GOOD
velocityY += GRAVITY * (deltaTime / 1000);
```

**Tuning Process**:
```typescript
// Start with these and adjust
GRAVITY = 980;
JUMP_FORCE = -450;
MAX_FALL_SPEED = 600;

// If jump feels floaty:
GRAVITY = 1200; // Increase
JUMP_FORCE = -500; // Increase

// If jump feels too quick:
GRAVITY = 800; // Decrease
JUMP_FORCE = -400; // Decrease
```

---

## Debugging Tools

### 1. Visual Velocity Indicator
```typescript
draw(ctx: CanvasRenderingContext2D): void {
  // Player
  ctx.fillRect(x - 16, y - 16, 32, 32);
  
  // Velocity arrow
  ctx.strokeStyle = velocityY < 0 ? 'green' : 'red';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x, y + velocityY * 0.1);
  ctx.stroke();
}
```

### 2. State Display
```typescript
ctx.fillStyle = 'black';
ctx.font = '14px monospace';
let debugY = 30;
ctx.fillText(`Grounded: ${isGrounded}`, 10, debugY); debugY += 20;
ctx.fillText(`Velocity Y: ${velocityY.toFixed(1)}`, 10, debugY); debugY += 20;
ctx.fillText(`Position Y: ${y.toFixed(1)}`, 10, debugY); debugY += 20;
ctx.fillText(`Jumps Left: ${jumpsRemaining}`, 10, debugY); debugY += 20;
ctx.fillText(`Coyote: ${coyoteTime.toFixed(2)}s`, 10, debugY); debugY += 20;
ctx.fillText(`Buffer: ${jumpBufferTime.toFixed(2)}s`, 10, debugY);
```

### 3. Ground Line
```typescript
// Draw ground line
ctx.strokeStyle = 'red';
ctx.lineWidth = 2;
ctx.beginPath();
ctx.moveTo(0, GROUND_Y);
ctx.lineTo(canvas.width, GROUND_Y);
ctx.stroke();
```

### 4. Jump Arc Visualization
```typescript
// Show predicted jump arc
if (isGrounded) {
  ctx.strokeStyle = 'rgba(0,255,0,0.3)';
  let testY = y;
  let testVelY = JUMP_FORCE;
  
  for (let i = 0; i < 100; i++) {
    testVelY += GRAVITY * 0.016; // Assume 60 FPS
    testY += testVelY * 0.016;
    
    if (i % 5 === 0) {
      ctx.fillRect(x - 2, testY - 2, 4, 4);
    }
    
    if (testY >= GROUND_Y) break;
  }
}
```

---

## Testing Checklist

- [ ] Can jump when on ground
- [ ] Cannot jump when in air (unless double jump)
- [ ] Variable jump height works (short press = short jump)
- [ ] Jump buffer works (press before landing)
- [ ] Coyote time works (can jump after leaving ground)
- [ ] Double jump works and resets on ground
- [ ] Doesn't fall through ground at any speed
- [ ] Terminal velocity limits fall speed
- [ ] Air control feels different from ground
- [ ] No jittering on ground
- [ ] Frame-rate independent (test at 30/60/120 FPS)

---

## Performance Issues

### Issue: Low FPS When Jumping

**Diagnosis**:
```typescript
// Creating new objects every frame
update(dt: number): void {
  const velocity = new Vector2D(velocityX, velocityY); // ❌
}
```

**Solution**:
```typescript
// Reuse existing properties
update(dt: number): void {
  this.velocityY += this.GRAVITY * dt; // ✅
}
```

---

## Common Mistakes Summary

| Mistake | Result | Fix |
|---------|--------|-----|
| No terminal velocity | Falls through ground | Add max speed cap |
| Forget velocityY = 0 | Vibrates on ground | Reset velocity on landing |
| Wrong update order | Falls through ground | Move → check collision |
| No isJumping flag | Variable jump broken | Track jump state |
| Forget to reset jumps | Double jump stops working | Reset on ground |
| Same air/ground physics | Unrealistic feel | Different acceleration/friction |
| Not using deltaTime | Frame-rate dependent | Multiply by dt |
