# Velocity and Acceleration - Debugging Guide

## Bug 1: Diagonal Movement Too Fast

**Symptoms**:
- Player moves ~41% faster diagonally than horizontally/vertically
- Inconsistent speed in different directions

**Diagnosis**:
```typescript
// Check if this is happening:
if (keys.has('w')) velocityY = -speed;
if (keys.has('d')) velocityX = speed;
// When both pressed: magnitude = √(speed² + speed²) = speed * 1.414
```

**Solution**:
```typescript
// Normalize input vector first
let inputX = 0, inputY = 0;
if (keys.has('a')) inputX -= 1;
if (keys.has('d')) inputX += 1;
if (keys.has('w')) inputY -= 1;
if (keys.has('s')) inputY += 1;

const magnitude = Math.sqrt(inputX * inputX + inputY * inputY);
if (magnitude > 0) {
  inputX /= magnitude;
  inputY /= magnitude;
}

velocityX = inputX * speed;
velocityY = inputY * speed;
```

---

## Bug 2: Movement Speed Depends on Frame Rate

**Symptoms**:
- Player moves faster on high-FPS monitors
- Slower on low-end devices
- Physics feels inconsistent

**Diagnosis**:
```typescript
// Check if you're doing this:
position.x += velocity.x; // ❌ No deltaTime!
```

**Solution**:
```typescript
// Always use deltaTime
const dt = deltaTime / 1000; // Convert ms to seconds
position.x += velocity.x * dt;
position.y += velocity.y * dt;
```

**Test**:
```typescript
// Add FPS counter to verify consistency
const fps = Math.round(1000 / deltaTime);
console.log(`FPS: ${fps}`);
```

---

## Bug 3: Objects Accelerate Forever

**Symptoms**:
- Speed keeps increasing with no limit
- Objects become impossibly fast
- May cause collision detection to fail

**Diagnosis**:
```typescript
// Check if missing terminal velocity:
velocity += acceleration * dt; // Speed can grow infinitely
```

**Solution**:
```typescript
// Apply terminal velocity
velocity += acceleration * dt;

const speed = Math.sqrt(velocity.x ** 2 + velocity.y ** 2);
if (speed > maxSpeed) {
  velocity.x = (velocity.x / speed) * maxSpeed;
  velocity.y = (velocity.y / speed) * maxSpeed;
}
```

---

## Bug 4: Friction Doesn't Work Consistently

**Symptoms**:
- Friction feels different at different frame rates
- Objects stop at 60 FPS but keep moving at 30 FPS

**Diagnosis**:
```typescript
// Check if you're doing this:
velocity.x *= 0.9; // ❌ Frame-rate dependent
```

**Solution**:
```typescript
// Use exponential decay
const frictionFactor = Math.pow(0.9, deltaTime / 1000 * 60);
velocity.x *= frictionFactor;
velocity.y *= frictionFactor;
```

**Explanation**:
- At 60 FPS (dt ≈ 16.67ms): `0.9^1 = 0.9`
- At 30 FPS (dt ≈ 33.33ms): `0.9^2 = 0.81`
- Same effect over the same real-world time!

---

## Bug 5: Player Never Fully Stops

**Symptoms**:
- Velocity never reaches exactly zero
- Player slowly drifts
- Jittery when "stopped"

**Diagnosis**:
```typescript
// Velocity becomes very small but never zero:
// velocity.x = 0.0000001
```

**Solution**:
```typescript
// Stop if velocity is very small
if (Math.abs(velocity.x) < 0.1) velocity.x = 0;
if (Math.abs(velocity.y) < 0.1) velocity.y = 0;
```

---

## Bug 6: Bouncing Ball Gets Stuck in Wall

**Symptoms**:
- Ball bounces multiple times rapidly
- Ball passes through wall
- Ball gets stuck vibrating

**Diagnosis**:
```typescript
// Check if you're only reversing velocity:
if (x + radius > width) {
  velocityX *= -1; // ❌ Ball still outside boundary!
}
```

**Solution**:
```typescript
// Adjust position AND reverse velocity
if (x + radius > width) {
  x = width - radius; // Move ball back inside
  velocityX *= -1;     // Then reverse
}
```

---

## Bug 7: Velocity Doesn't Match Input

**Symptoms**:
- Player feels sluggish or unresponsive
- Acceleration takes too long

**Diagnosis**:
```typescript
// Check update order
velocity += acceleration * dt;  // Good
friction();                     // Good
position += velocity * dt;      // Good
handleInput();                  // ❌ Too late!
```

**Solution**:
```typescript
// Correct order:
function gameLoop(currentTime) {
  const deltaTime = currentTime - lastTime;
  lastTime = currentTime;
  
  handleInput();           // 1. Get input first
  updatePhysics(deltaTime); // 2. Then update physics
  render();                 // 3. Finally render
  
  requestAnimationFrame(gameLoop);
}
```

---

## Bug 8: Lerp Movement Stutters

**Symptoms**:
- Following movement is jittery
- Speed varies inconsistently

**Diagnosis**:
```typescript
// Check if lerp is frame-rate dependent:
x += (targetX - x) * 0.1; // ❌ Speed varies with FPS
```

**Solution**:
```typescript
// Make lerp frame-rate independent
const smoothing = 0.1 * (deltaTime / 1000 * 60);
x += (targetX - x) * smoothing;
```

---

## Bug 9: Acceleration Feels Wrong

**Symptoms**:
- Movement doesn't feel natural
- Hard to control precisely

**Common Issues**:

### Issue A: Acceleration too high
```typescript
accelerationRate = 5000; // ❌ Too high, feels twitchy
accelerationRate = 800;  // ✅ Better
```

### Issue B: Friction too high
```typescript
friction = 0.5;  // ❌ Stops too quickly
friction = 0.85; // ✅ Natural feel
```

### Issue C: Max speed too low
```typescript
maxSpeed = 50;  // ❌ Feels sluggish
maxSpeed = 250; // ✅ Responsive
```

**Tuning Guide**:
```typescript
// Start with these values and adjust:
maxSpeed = 250;
accelerationRate = 800;
friction = 0.85;

// For faster response:
accelerationRate = 1200;
friction = 0.7;

// For ice physics:
accelerationRate = 400;
friction = 0.95;
```

---

## Bug 10: Velocity Vector Math Wrong

**Symptoms**:
- Objects move in unexpected directions
- Speed calculations are incorrect

**Common Mistakes**:

### Mistake A: Not using vectors properly
```typescript
// ❌ BAD
const speed = velocity.x + velocity.y; // Wrong!

// ✅ GOOD
const speed = Math.sqrt(velocity.x ** 2 + velocity.y ** 2);
```

### Mistake B: Dividing by zero
```typescript
// ❌ BAD
const normalized = { x: x / magnitude, y: y / magnitude };
// If magnitude is 0, you get NaN!

// ✅ GOOD
if (magnitude === 0) return { x: 0, y: 0 };
return { x: x / magnitude, y: y / magnitude };
```

### Mistake C: Mutating instead of returning new vectors
```typescript
// ❌ BAD (mutates original)
add(other: Vector2D): void {
  this.x += other.x;
  this.y += other.y;
}

// ✅ GOOD (returns new vector)
add(other: Vector2D): Vector2D {
  return new Vector2D(this.x + other.x, this.y + other.y);
}
```

---

## Debugging Tools

### 1. Visual Velocity Indicator
```typescript
draw(ctx: CanvasRenderingContext2D): void {
  // Draw entity
  ctx.fillRect(x - 16, y - 16, 32, 32);
  
  // Draw velocity vector
  ctx.strokeStyle = 'red';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + velocity.x * 0.1, y + velocity.y * 0.1);
  ctx.stroke();
}
```

### 2. Speed Display
```typescript
const speed = Math.sqrt(velocity.x ** 2 + velocity.y ** 2);
ctx.fillText(`Speed: ${speed.toFixed(1)} px/s`, 10, 30);
ctx.fillText(`Max: ${maxSpeed} px/s`, 10, 50);
```

### 3. Delta Time Monitor
```typescript
const fps = Math.round(1000 / deltaTime);
ctx.fillText(`FPS: ${fps}`, 10, 70);
ctx.fillText(`DT: ${deltaTime.toFixed(2)}ms`, 10, 90);
```

### 4. Acceleration Indicator
```typescript
ctx.strokeStyle = 'yellow';
ctx.beginPath();
ctx.moveTo(x, y);
ctx.lineTo(x + acceleration.x * 0.05, y + acceleration.y * 0.05);
ctx.stroke();
```

### 5. Console Logging
```typescript
if (Math.random() < 0.01) { // Log occasionally
  console.log({
    position: { x, y },
    velocity: { x: velocity.x, y: velocity.y },
    speed: Math.sqrt(velocity.x ** 2 + velocity.y ** 2),
    acceleration: { x: acceleration.x, y: acceleration.y }
  });
}
```

---

## Testing Checklist

Test your physics implementation:

- [ ] Movement speed is consistent at different frame rates
- [ ] Diagonal movement is same speed as cardinal directions
- [ ] Objects stop smoothly when input is released
- [ ] Speed never exceeds max speed
- [ ] Bouncing works correctly without getting stuck
- [ ] No jittering when standing still
- [ ] Acceleration feels responsive
- [ ] Friction feels natural
- [ ] No NaN values in calculations
- [ ] Performance is good (60 FPS maintained)

---

## Performance Issues

### Issue: Low FPS

**Symptoms**:
- Frame rate below 60 FPS
- Stuttering movement

**Diagnosis**:
```typescript
// Measure update time
const start = performance.now();
update(deltaTime);
const updateTime = performance.now() - start;
console.log(`Update took ${updateTime}ms`);
```

**Common Causes**:
1. Creating new objects every frame
2. Complex calculations every frame
3. Too many entities

**Solutions**:
```typescript
// ❌ BAD: Creating new vector every frame
update(dt: number): void {
  const vel = new Vector2D(velocity.x, velocity.y);
  // ...
}

// ✅ GOOD: Reuse existing vectors
update(dt: number): void {
  this.velocity.x += this.acceleration.x * dt;
  this.velocity.y += this.acceleration.y * dt;
}
```

---

## Quick Fixes Reference

| Problem | Quick Fix |
|---------|-----------|
| Diagonal too fast | Normalize input vector |
| Frame-rate dependent | Multiply by deltaTime |
| Accelerates forever | Apply terminal velocity |
| Friction inconsistent | Use `Math.pow()` |
| Never stops | Check if velocity < threshold |
| Stuck in wall | Adjust position + reverse velocity |
| Unresponsive | Check update order |
| Lerp stutters | Make frame-rate independent |
| Wrong direction | Check vector math |
| NaN values | Check for divide by zero |

---

## When to Ask for Help

If you've tried all the above and still have issues:

1. Check browser console for errors
2. Add visual debugging (velocity arrows)
3. Log values to console
4. Test with fixed deltaTime (simulate different FPS)
5. Simplify code to isolate the problem
6. Ask on forums with a minimal reproduction case
