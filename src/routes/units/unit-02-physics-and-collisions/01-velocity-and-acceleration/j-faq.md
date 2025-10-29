# Velocity and Acceleration - FAQ

## Basic Concepts

### Q1: What's the difference between velocity and speed?
**A**: Speed is a scalar (just a number), velocity is a vector (speed + direction).
- Speed: "60 mph"
- Velocity: "60 mph north" or `{x: 50, y: -30}` pixels per second

### Q2: Why use vectors instead of separate x/y variables?
**A**: Vectors make code cleaner and more maintainable:
```typescript
// Without vectors (messy)
posX += velX * dt;
posY += velY * dt;
const speed = Math.sqrt(velX*velX + velY*velY);

// With vectors (clean)
position = position.add(velocity.multiply(dt));
const speed = velocity.magnitude();
```

### Q3: What is acceleration exactly?
**A**: Acceleration is how quickly velocity changes. Think of a car:
- Press gas pedal → positive acceleration → speed increases
- Press brake → negative acceleration → speed decreases
- Cruise control → zero acceleration → constant speed

---

## Delta Time

### Q4: Why do I need to multiply by deltaTime?
**A**: Without deltaTime, movement depends on frame rate:
- 60 FPS: object moves 60 units per second
- 30 FPS: object moves 30 units per second (half as fast!)

With deltaTime, movement is consistent regardless of FPS.

### Q5: How do I convert deltaTime correctly?
**A**: `requestAnimationFrame` gives time in milliseconds:
```typescript
const deltaTime = currentTime - lastTime; // milliseconds
const dt = deltaTime / 1000; // convert to seconds

// Now use dt in physics:
velocity += acceleration * dt;
position += velocity * dt;
```

### Q6: Should I use seconds or milliseconds?
**A**: **Seconds** for physics calculations. It's more intuitive:
- "200 pixels per second" is clearer than "0.2 pixels per millisecond"
- Physics formulas use seconds
- Easier to tune values

---

## Normalization

### Q7: What does "normalize" mean?
**A**: Make a vector length 1 while keeping its direction:
```typescript
// Before: {x: 3, y: 4} has length 5
// After: {x: 0.6, y: 0.8} has length 1

const mag = Math.sqrt(x*x + y*y);
normalizedX = x / mag;
normalizedY = y / mag;
```

### Q8: Why normalize input vectors?
**A**: To fix the diagonal speed bug:
```typescript
// Without normalization:
if (pressW && pressD) {
  velocity = {x: 200, y: -200}; // length = 283 (too fast!)
}

// With normalization:
const input = {x: 1, y: -1}; // length = 1.414
const normalized = normalize(input); // length = 1
velocity = normalized * 200; // length = 200 (correct!)
```

### Q9: When should I NOT normalize?
**A**: Don't normalize when you want actual distance/magnitude:
- Calculating distance to target
- Force based on separation
- Any time the magnitude matters

---

## Friction

### Q10: How does friction work in games?
**A**: Friction gradually reduces velocity over time. Common approaches:

**Linear friction** (frame-rate dependent, don't use):
```typescript
velocity.x -= friction * dt; // ❌ BAD
```

**Exponential friction** (frame-rate independent, use this):
```typescript
velocity.x *= Math.pow(friction, dt * 60); // ✅ GOOD
```

### Q11: What friction value should I use?
**A**: Typical range: 0.7 to 0.95
- **0.7**: Quick stop (responsive controls)
- **0.85**: Normal (most games)
- **0.95**: Slippery (ice, space)
- **1.0**: No friction (space, top-down shooters)

Start with 0.85 and adjust to taste.

### Q12: Why use `Math.pow(friction, dt * 60)`?
**A**: To make friction frame-rate independent:

At 60 FPS:
```
friction^(0.0167 * 60) = friction^1 = friction
```

At 30 FPS:
```
friction^(0.0333 * 60) = friction^2
```

The effect over 1 real second is the same!

---

## Terminal Velocity

### Q13: What is terminal velocity?
**A**: The maximum speed an object can reach. In real physics, it's caused by air resistance. In games, we set it manually to:
- Prevent unrealistic speeds
- Ensure collision detection works
- Balance gameplay

### Q14: How do I implement terminal velocity?
**A**: Limit velocity magnitude after applying acceleration:
```typescript
// Apply acceleration
velocity += acceleration * dt;

// Limit to max speed
const speed = velocity.magnitude();
if (speed > maxSpeed) {
  velocity = velocity.normalize() * maxSpeed;
}
```

### Q15: Should terminal velocity be applied before or after friction?
**A**: **After acceleration, before friction**:
```typescript
// Correct order:
velocity += acceleration * dt;  // 1. Apply acceleration
velocity = velocity.limit(maxSpeed); // 2. Limit speed
velocity *= frictionFactor;          // 3. Apply friction
position += velocity * dt;           // 4. Apply velocity
```

---

## Implementation

### Q16: What's the correct update order?
**A**: Follow this sequence:
```typescript
function update(deltaTime: number): void {
  const dt = deltaTime / 1000;
  
  // 1. Handle input (set acceleration)
  handleInput();
  
  // 2. Apply acceleration to velocity
  velocity += acceleration * dt;
  
  // 3. Limit velocity (terminal velocity)
  velocity = velocity.limit(maxSpeed);
  
  // 4. Apply friction
  velocity *= Math.pow(friction, dt * 60);
  
  // 5. Stop if very slow
  if (Math.abs(velocity.x) < 0.1) velocity.x = 0;
  if (Math.abs(velocity.y) < 0.1) velocity.y = 0;
  
  // 6. Apply velocity to position
  position += velocity * dt;
  
  // 7. Handle collisions/boundaries
  checkCollisions();
}
```

### Q17: Should I use classes or plain objects for vectors?
**A**: **Classes** are cleaner:
```typescript
// With class:
const result = posA.add(posB.multiply(2));

// Without class:
const result = {
  x: posA.x + posB.x * 2,
  y: posA.y + posB.y * 2
};
```

Classes also prevent bugs (method typos are caught, property typos aren't).

### Q18: How do I make acceleration feel good?
**A**: Tune these parameters:

```typescript
// Responsive (FPS games):
maxSpeed = 250;
accelerationRate = 1500;
friction = 0.7;

// Normal (platformers):
maxSpeed = 300;
accelerationRate = 800;
friction = 0.85;

// Slippery (ice levels):
maxSpeed = 350;
accelerationRate = 400;
friction = 0.95;

// Space (no friction):
maxSpeed = 400;
accelerationRate = 300;
friction = 1.0;
```

---

## Common Issues

### Q19: Why does my player never stop moving?
**A**: Velocity becomes very small but never reaches exactly 0. Fix:
```typescript
if (Math.abs(velocity.x) < 0.1) velocity.x = 0;
if (Math.abs(velocity.y) < 0.1) velocity.y = 0;
```

### Q20: Why does diagonal movement feel faster?
**A**: Not normalizing input. Fix:
```typescript
const input = getInput(); // e.g., {x: 1, y: 1}
const normalized = input.normalize(); // {x: 0.707, y: 0.707}
acceleration = normalized * accelerationRate;
```

---

## Advanced Topics

### Q21: What's the difference between velocity and momentum?
**A**:
- **Velocity**: How fast and in what direction
- **Momentum**: Velocity × mass

In physics: `momentum = mass × velocity`

For games, if all objects have mass = 1, velocity = momentum.

### Q22: How do I implement drag (air resistance)?
**A**: Apply force opposite to velocity:
```typescript
// Drag force is proportional to velocity squared
const dragCoefficient = 0.001;
const dragForce = velocity.multiply(
  -dragCoefficient * velocity.magnitude()
);
acceleration += dragForce;
```

### Q23: Can I have different acceleration for different directions?
**A**: Yes! Useful for platformers:
```typescript
// Faster horizontal acceleration, slower vertical
if (inputX !== 0) {
  acceleration.x = inputX * 1000; // Fast
}
if (inputY !== 0) {
  acceleration.y = inputY * 500; // Slow
}
```

### Q24: How do I implement steering behaviors?
**A**: Calculate desired velocity, then steer toward it:
```typescript
// Seek behavior
const desired = target.subtract(position)
  .normalize()
  .multiply(maxSpeed);

const steering = desired.subtract(velocity)
  .limit(maxForce);

acceleration = steering;
```

### Q25: What's the difference between lerp and acceleration?
**A**:
- **Lerp**: Move X% toward target each frame (smooth following)
- **Acceleration**: Apply force, build up speed (realistic physics)

```typescript
// Lerp (camera following):
x += (targetX - x) * 0.1;

// Acceleration (player movement):
velocity += acceleration * dt;
x += velocity * dt;
```

---

## Performance

### Q26: Is it expensive to use Vector2D classes?
**A**: Slightly, but the benefits outweigh the cost:
- **Pros**: Cleaner code, fewer bugs, easier to maintain
- **Cons**: Small performance hit (creating objects)

For most games, it's not noticeable. If you have 1000+ entities, consider:
- Object pooling
- Reusing vector instances
- Using plain numbers for critical code

### Q27: Should I update physics every frame?
**A**: Yes, for smooth movement. But you can optimize:
```typescript
// If entity is far away or not visible:
if (!isOnScreen(entity) || distanceToPlayer > 1000) {
  // Update less frequently or not at all
  continue;
}
entity.update(deltaTime);
```

---

## Debugging

### Q28: How do I visualize velocity?
**A**: Draw an arrow from entity position:
```typescript
ctx.strokeStyle = 'red';
ctx.beginPath();
ctx.moveTo(x, y);
ctx.lineTo(
  x + velocity.x * 0.1,
  y + velocity.y * 0.1
);
ctx.stroke();
```

### Q29: How do I test if movement is frame-rate independent?
**A**: Force different frame rates:
```typescript
// Test at different FPS
const targetFPS = 30; // or 60, 120
const targetFrameTime = 1000 / targetFPS;

function gameLoop(currentTime: number): void {
  const deltaTime = Math.min(
    currentTime - lastTime,
    targetFrameTime
  );
  // ... rest of game loop
}
```

Movement should feel the same at all frame rates.

### Q30: Why do I get NaN values?
**A**: Common causes:
```typescript
// Divide by zero:
const normalized = { x: x / magnitude, y: y / magnitude };
// If magnitude = 0, you get NaN!

// Fix:
if (magnitude === 0) return { x: 0, y: 0 };

// Square root of negative number:
const magnitude = Math.sqrt(x * x + y * y); // Always positive

// Undefined values:
velocity.x += undefined * dt; // NaN!
```

---

## Best Practices

### Q31: Should I cap velocity per axis or total magnitude?
**A**: **Total magnitude** for realistic movement:
```typescript
// ❌ BAD: Cap per axis
velocity.x = Math.min(velocity.x, maxSpeed);
velocity.y = Math.min(velocity.y, maxSpeed);
// Diagonal can still be √2 * maxSpeed

// ✅ GOOD: Cap total magnitude
velocity = velocity.limit(maxSpeed);
```

### Q32: When should I reset velocity?
**A**:
- **Collision with solid object**: Set to 0
- **Landing on ground**: Set vertical to 0, keep horizontal
- **Teleport**: Set to 0
- **Death**: Set to 0
- **Normal movement**: Let friction handle it

### Q33: How do I handle very fast objects?
**A**: Multiple options:
1. **Limit max speed** (terminal velocity)
2. **Use smaller timesteps** (sub-stepping)
3. **Continuous collision detection** (sweep tests)
4. **Increase collision frequency** (check multiple times per frame)

---

## Next Steps

After mastering velocity and acceleration:
1. **Move to gravity and jumping** (vertical-specific physics)
2. **Learn collision detection** (AABB, circle, SAT)
3. **Implement platformer physics** (putting it all together)
4. **Explore steering behaviors** (AI movement)
5. **Study force-based systems** (springs, magnets)

---

## Additional Resources

- [Vector Math Tutorial](https://www.mathsisfun.com/algebra/vectors.html)
- [Game Physics Series](https://gafferongames.com/post/integration_basics/)
- [Frame-Rate Independence](https://gafferongames.com/post/fix_your_timestep/)
- [Steering Behaviors](https://www.red3d.com/cwr/steer/)
