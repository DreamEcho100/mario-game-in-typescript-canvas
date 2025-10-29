# Velocity and Acceleration - Exercises

## Instructions
- Complete exercises in order (they build on each other)
- Test your code in a browser
- Difficulty: ⭐ = Easy, ⭐⭐ = Medium, ⭐⭐⭐ = Hard
- Estimated time: 2-3 hours total

---

## Exercise 1: Basic Velocity Movement ⭐

**Goal**: Create a ball that moves across the screen with constant velocity.

**Requirements**:
- Create a canvas (800x600)
- Draw a circle at position (100, 300)
- Give it velocity of (100, 0) pixels per second
- Move it using frame-rate independent physics
- When it reaches the right edge, reset to the left

**Starter Code**:
```typescript
const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
const ctx = canvas.getContext('2d')!;
canvas.width = 800;
canvas.height = 600;

class Ball {
  x: number = 100;
  y: number = 300;
  velocityX: number = 100; // pixels per second
  velocityY: number = 0;
  radius: number = 20;
  
  update(deltaTime: number): void {
    // TODO: Apply velocity to position
    // TODO: Wrap around when reaching right edge
  }
  
  draw(ctx: CanvasRenderingContext2D): void {
    // TODO: Draw the ball
  }
}

// TODO: Create game loop
```

**Expected Result**: Ball moves smoothly from left to right, wraps around.

---

## Exercise 2: Bouncing Ball ⭐

**Goal**: Make a ball bounce off all four walls.

**Requirements**:
- Start with Exercise 1 code
- Add vertical velocity (50 pixels per second)
- When ball hits a wall, reverse the appropriate velocity component
- Ball should bounce forever

**Hints**:
```typescript
// Bounce off walls:
if (x + radius > canvas.width || x - radius < 0) {
  velocityX *= -1; // Reverse horizontal direction
}
// Add similar logic for top/bottom
```

**Expected Result**: Ball bounces endlessly around the canvas.

---

## Exercise 3: Acceleration from Input ⭐⭐

**Goal**: Control a square using arrow keys with acceleration.

**Requirements**:
- Create a 32x32 square in the center
- Pressing arrow keys adds acceleration (not instant velocity)
- Max speed: 300 pixels per second
- Acceleration rate: 800 pixels per second²
- No friction (keeps drifting)

**Starter Code**:
```typescript
class Player {
  x: number = 400;
  y: number = 300;
  velocityX: number = 0;
  velocityY: number = 0;
  accelerationX: number = 0;
  accelerationY: number = 0;
  
  maxSpeed: number = 300;
  accelerationRate: number = 800;
  
  handleInput(keys: Set<string>): void {
    // TODO: Set acceleration based on arrow keys
  }
  
  update(deltaTime: number): void {
    // TODO: Apply acceleration to velocity
    // TODO: Limit velocity to maxSpeed
    // TODO: Apply velocity to position
  }
}
```

**Expected Result**: Spaceship-like controls with momentum.

---

## Exercise 4: Friction and Deceleration ⭐⭐

**Goal**: Add friction to Exercise 3 so the player stops when input is released.

**Requirements**:
- Start with Exercise 3 code
- Add friction coefficient: 0.85
- When no input, player should gradually slow down
- Use frame-rate independent friction: `Math.pow(friction, dt * 60)`
- Stop velocity when it's very small (< 0.1)

**Expected Result**: Player accelerates smoothly and decelerates smoothly when keys are released.

---

## Exercise 5: Normalized Diagonal Movement ⭐⭐

**Goal**: Fix the diagonal speed bug.

**Requirements**:
- Create a player with WASD controls
- Speed: 200 pixels per second
- Moving diagonally should be the same speed as moving in one direction
- Use vector normalization

**Hints**:
```typescript
// Get input direction
let inputX = 0, inputY = 0;
if (keys.has('a')) inputX -= 1;
if (keys.has('d')) inputX += 1;
// ... etc

// Normalize
const magnitude = Math.sqrt(inputX * inputX + inputY * inputY);
if (magnitude > 0) {
  inputX /= magnitude;
  inputY /= magnitude;
}

// Apply speed
velocityX = inputX * speed;
velocityY = inputY * speed;
```

**Expected Result**: Moving diagonally is the same speed as moving horizontally or vertically.

---

## Exercise 6: Smooth Acceleration with Lerp ⭐⭐

**Goal**: Implement smooth camera-like movement.

**Requirements**:
- Create a circle that follows the mouse
- Don't teleport to mouse position
- Use linear interpolation (lerp) to smoothly move toward target
- Lerp factor: 0.1 (10% toward target each frame)

**Formula**:
```typescript
// Lerp: linear interpolation
// current = current + (target - current) * lerpFactor
x = x + (targetX - x) * lerpFactor * (deltaTime * 60);
```

**Expected Result**: Circle smoothly follows mouse cursor with a delay.

---

## Exercise 7: Terminal Velocity Test ⭐⭐

**Goal**: Demonstrate why terminal velocity is important.

**Requirements**:
- Create a ball with constant downward acceleration (gravity)
- Acceleration: 500 pixels per second²
- WITHOUT terminal velocity: ball speed increases forever
- WITH terminal velocity (300 px/s): ball reaches max speed and stays there
- Draw speed text on screen
- Press 'T' to toggle terminal velocity on/off

**Expected Result**: See the difference between unlimited acceleration and terminal velocity.

---

## Exercise 8: Vector Class Implementation ⭐⭐⭐

**Goal**: Create a complete Vector2D class and use it.

**Requirements**:
- Implement Vector2D class with these methods:
  - `add(other: Vector2D): Vector2D`
  - `subtract(other: Vector2D): Vector2D`
  - `multiply(scalar: number): Vector2D`
  - `magnitude(): number`
  - `normalize(): Vector2D`
  - `limit(max: number): Vector2D`
- Create a player that uses Vector2D for position, velocity, acceleration
- Show that code is cleaner with vectors

**Example Usage**:
```typescript
const pos = new Vector2D(100, 200);
const vel = new Vector2D(50, -30);
const newPos = pos.add(vel.multiply(deltaTime));
```

**Expected Result**: Cleaner, more maintainable code using vectors.

---

## Exercise 9: Mouse Follow with Max Speed ⭐⭐⭐

**Goal**: Create an entity that accelerates toward the mouse but respects max speed.

**Requirements**:
- Calculate direction from entity to mouse
- Apply acceleration in that direction
- Use terminal velocity to limit max speed
- Add friction so it orbits when close
- Acceleration: 600 px/s²
- Max speed: 250 px/s
- Friction: 0.95

**Hints**:
```typescript
// Direction to target
const dx = targetX - x;
const dy = targetY - y;
const magnitude = Math.sqrt(dx * dx + dy * dy);

// Normalized direction
const dirX = dx / magnitude;
const dirY = dy / magnitude;

// Apply acceleration in that direction
accelerationX = dirX * accelerationRate;
accelerationY = dirY * accelerationRate;
```

**Expected Result**: Entity smoothly follows mouse, orbits when close.

---

## Exercise 10: Orbit Motion ⭐⭐⭐

**Goal**: Create circular orbit using angular velocity.

**Requirements**:
- Create a ball that orbits around the center
- Use polar coordinates (angle, radius)
- Angular velocity: 2 radians per second
- Convert polar to Cartesian for drawing:
  - `x = centerX + cos(angle) * radius`
  - `y = centerY + sin(angle) * radius`
- Press UP/DOWN to change orbit radius
- Press LEFT/RIGHT to change orbit speed

**Expected Result**: Ball orbits smoothly, speed/radius adjustable.

---

## Exercise 11: Momentum and Mass ⭐⭐⭐

**Goal**: Simulate different masses with same force.

**Requirements**:
- Create 3 circles: small, medium, large
- Same force (acceleration) applied to all
- Larger mass = slower acceleration
- Formula: `acceleration = force / mass`
- Click to apply impulse force toward mouse
- Show that heavy objects accelerate slower

**Expected Result**: Visually understand mass affects acceleration.

---

## Exercise 12: Drag Force (Air Resistance) ⭐⭐⭐

**Goal**: Implement velocity-dependent drag.

**Requirements**:
- Create a projectile launched upward
- Apply drag force opposite to velocity
- Drag formula: `drag = -velocity * dragCoefficient * speed`
- Compare with/without drag (press 'D' to toggle)
- Drag coefficient: 0.001

**Expected Result**: With drag, projectile slows down faster and has curved arc.

---

## Exercise 13: Steering Behavior - Seek ⭐⭐⭐

**Goal**: Implement seek steering behavior.

**Requirements**:
- Entity seeks toward a target position
- Calculate desired velocity (direction to target * maxSpeed)
- Steering force = desired velocity - current velocity
- Limit steering force magnitude
- Max speed: 200 px/s
- Max steering force: 500 px/s²

**Code Structure**:
```typescript
// Calculate desired velocity
const desired = targetPos.subtract(position).normalize().multiply(maxSpeed);

// Calculate steering force
const steering = desired.subtract(velocity);
steering = steering.limit(maxForce);

// Apply steering as acceleration
acceleration = steering;
```

**Expected Result**: Entity smoothly navigates toward target with realistic steering.

---

## Exercise 14: Flocking - Separation ⭐⭐⭐

**Goal**: Make multiple entities avoid each other.

**Requirements**:
- Create 10 moving circles
- Each circle should avoid others within 50 pixels
- Separation force pushes away from nearby entities
- Combine separation with random wandering
- Each entity has slight random color

**Hints**:
```typescript
// For each nearby entity:
const diff = this.position.subtract(other.position);
const distance = diff.magnitude();
if (distance < separationRadius && distance > 0) {
  // Push away with force inversely proportional to distance
  const force = diff.normalize().multiply(1 / distance);
  separation = separation.add(force);
}
```

**Expected Result**: Entities naturally space themselves out.

---

## Exercise 15: Complete Movement System ⭐⭐⭐

**Goal**: Combine everything into a polished player controller.

**Requirements**:
- WASD movement with smooth acceleration
- Normalized diagonal movement
- Frame-rate independent friction
- Terminal velocity
- Boundary collision (bounce off walls)
- Visual velocity indicator (arrow)
- Speed display
- Particle trail effect
- Adjustable parameters (press 1-5 for presets):
  - 1: Normal (friction 0.85, accel 800)
  - 2: Ice (friction 0.98, accel 400)
  - 3: Mud (friction 0.5, accel 1200)
  - 4: Space (friction 1.0, accel 300)
  - 5: Responsive (friction 0.7, accel 1500)

**Expected Result**: Professional-feeling player movement with visual feedback.

---

## Bonus Challenges

### Challenge 1: Car Physics
- Implement front-wheel drive car
- Forward/backward acceleration
- Steering only works when moving
- Drifting at high speeds

### Challenge 2: Rope Simulation
- Create a rope made of connected points
- Each point has velocity and acceleration
- Apply constraints to keep distance between points
- Drag one end with the mouse

### Challenge 3: Boid Flocking
- Implement full boids algorithm:
  - Separation (avoid crowding)
  - Alignment (move in same direction as neighbors)
  - Cohesion (stay close to group)
- Create emergent flocking behavior

---

## Testing Checklist

For each exercise, verify:

- [ ] Runs without errors in console
- [ ] Frame-rate independent (test at different frame rates)
- [ ] Visually smooth movement
- [ ] Correct physics behavior
- [ ] Good performance (60 FPS)
- [ ] Code is readable and commented

---

## Common Issues

### Issue 1: Movement too fast/slow
**Problem**: Not converting deltaTime correctly
**Solution**: Use `deltaTime / 1000` to convert milliseconds to seconds

### Issue 2: Jittery movement
**Problem**: Not using deltaTime or bad friction formula
**Solution**: Always multiply by deltaTime, use `Math.pow()` for friction

### Issue 3: Diagonal too fast
**Problem**: Not normalizing input vector
**Solution**: Normalize input before applying speed

### Issue 4: Objects accelerate forever
**Problem**: No terminal velocity or friction
**Solution**: Use `velocity.limit(maxSpeed)` and apply friction

### Issue 5: Friction doesn't work at different frame rates
**Problem**: Using `velocity *= friction` directly
**Solution**: Use `velocity *= Math.pow(friction, dt * 60)`

---

## Next Steps

After completing these exercises:
1. Review solutions (c-solutions.md)
2. Read quick notes (d-notes.md)
3. Move on to gravity and jumping!
4. Experiment with different values
5. Create your own physics-based mini-game
