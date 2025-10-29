# Velocity and Acceleration

## Building on Unit 01: The Foundation You Already Have

Before diving into velocity, let's connect to what you learned in Unit 01:

### From Unit 01-02: Delta Time (⚠️ CRITICAL!)

Remember **delta time** from the game loop lesson? It's the **heart** of all physics!

```typescript
// You learned this in Unit 01-02:
function gameLoop(currentTime) {
    const deltaTime = (currentTime - lastTime) / 1000; // Convert ms to seconds
    lastTime = currentTime;
    
    update(deltaTime); // ← Pass to update function!
    // ...
}
```

**Why it matters NOW:** 
- Velocity = "distance per **second**"
- Without delta time, movement is frame-dependent ❌
- With delta time, movement is smooth on all devices ✅

**If you skipped Unit 01-02, go back now!** Everything in Unit 02 depends on understanding delta time.

### From Unit 01-03: Input Handling

You learned to detect keyboard input. Now you'll use it to **change velocity**:

```typescript
// Unit 01-03: You learned to detect keys
const keys = new Set<string>();
document.addEventListener('keydown', (e) => keys.add(e.key));

// Unit 02-01: Now you'll use input to change velocity (NEW!)
if (keys.has('ArrowRight')) {
    velocity.x += acceleration * deltaTime;
}
```

### From Unit 01-05: World Coordinates

Entities have positions in world space. **Velocity changes those positions:**

```typescript
// Position (from Unit 01-05)
const entity = { x: 100, y: 200 };

// Velocity (what you'll learn NOW)
const velocity = { x: 50, y: 0 }; // 50 pixels/second right

// Update position using velocity:
entity.x += velocity.x * deltaTime; // Position changes smoothly!
```

**The Big Picture:**
- Unit 01 = Static foundations (render, timing, input, coordinates)
- Unit 02 = Dynamic motion (velocity, gravity, collision)
- Together = **Working platformer game!**

Ready? Let's make things move! 🚀

---

## Learning Objectives
By the end of this lesson, you will be able to:
- Understand velocity as a vector (speed + direction)
- Apply acceleration to change velocity over time
- Implement frame-rate independent physics
- Use vectors for 2D game movement
- Create smooth, natural-feeling movement
- Apply friction and damping to movement
- Implement terminal velocity (speed limits)

## Prerequisites
- Completed Unit 01 (Game Foundations)
- Understanding of game loops and delta time
- Basic knowledge of coordinate systems
- Familiarity with JavaScript/TypeScript classes

---

## What is Velocity?

**Velocity** is the rate of change of position. In simpler terms, it's how fast and in what direction something is moving.

### Velocity = Speed + Direction

```
Speed: 5 units per second (scalar - just a number)
Velocity: 5 units per second to the RIGHT (vector - has direction)
```

### Why Vectors?

In 2D games, we need to track movement in both X and Y directions:

```typescript
interface Vector2D {
  x: number;  // Horizontal component
  y: number;  // Vertical component
}

// Example velocities:
const velocityRight = { x: 5, y: 0 };      // Moving right
const velocityDown = { x: 0, y: 5 };       // Moving down
const velocityDiagonal = { x: 3, y: 4 };   // Moving diagonally
```

---

## Implementing Basic Velocity

### Step 1: Create a Vector2D Class

```typescript
class Vector2D {
  constructor(public x: number = 0, public y: number = 0) {}

  // Add two vectors
  add(other: Vector2D): Vector2D {
    return new Vector2D(this.x + other.x, this.y + other.y);
  }

  // Subtract two vectors
  subtract(other: Vector2D): Vector2D {
    return new Vector2D(this.x - other.x, this.y - other.y);
  }

  // Multiply by a scalar
  multiply(scalar: number): Vector2D {
    return new Vector2D(this.x * scalar, this.y * scalar);
  }

  // Get the magnitude (length) of the vector
  magnitude(): number {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  // Normalize the vector (make it length 1)
  normalize(): Vector2D {
    const mag = this.magnitude();
    if (mag === 0) return new Vector2D(0, 0);
    return new Vector2D(this.x / mag, this.y / mag);
  }

  // Limit the magnitude
  limit(max: number): Vector2D {
    const mag = this.magnitude();
    if (mag > max) {
      return this.normalize().multiply(max);
    }
    return new Vector2D(this.x, this.y);
  }

  // Clone the vector
  clone(): Vector2D {
    return new Vector2D(this.x, this.y);
  }
}
```

### Step 2: Apply Velocity to Position

```typescript
class Player {
  position: Vector2D;
  velocity: Vector2D;
  
  constructor(x: number, y: number) {
    this.position = new Vector2D(x, y);
    this.velocity = new Vector2D(0, 0);
  }
  
  update(deltaTime: number): void {
    // Convert deltaTime from milliseconds to seconds
    const dt = deltaTime / 1000;
    
    // Apply velocity to position
    // position = position + (velocity * deltaTime)
    const displacement = this.velocity.multiply(dt);
    this.position = this.position.add(displacement);
  }
  
  draw(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = 'blue';
    ctx.fillRect(this.position.x - 16, this.position.y - 16, 32, 32);
  }
}
```

### Step 3: Set Velocity from Input

```typescript
class Player {
  // ... previous code ...
  
  handleInput(keys: Set<string>): void {
    const speed = 200; // pixels per second
    
    this.velocity.x = 0;
    this.velocity.y = 0;
    
    if (keys.has('ArrowLeft') || keys.has('a')) {
      this.velocity.x = -speed;
    }
    if (keys.has('ArrowRight') || keys.has('d')) {
      this.velocity.x = speed;
    }
    if (keys.has('ArrowUp') || keys.has('w')) {
      this.velocity.y = -speed;
    }
    if (keys.has('ArrowDown') || keys.has('s')) {
      this.velocity.y = speed;
    }
  }
}
```

### Complete Example: Basic Movement

```typescript
// Game state
const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
const ctx = canvas.getContext('2d')!;
canvas.width = 800;
canvas.height = 600;

const keys = new Set<string>();
const player = new Player(400, 300);

// Input handling
window.addEventListener('keydown', (e) => keys.add(e.key));
window.addEventListener('keyup', (e) => keys.delete(e.key));

// Game loop
let lastTime = 0;
function gameLoop(currentTime: number): void {
  const deltaTime = currentTime - lastTime;
  lastTime = currentTime;
  
  // Update
  player.handleInput(keys);
  player.update(deltaTime);
  
  // Draw
  ctx.fillStyle = 'lightblue';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  player.draw(ctx);
  
  requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);
```

---

## What is Acceleration?

**Acceleration** is the rate of change of velocity. It's how quickly velocity changes over time.

### Key Concepts:

1. **Positive acceleration** = speeding up
2. **Negative acceleration (deceleration)** = slowing down
3. **Zero acceleration** = constant velocity

```
If velocity = 0 and acceleration = 10:
  After 1 second: velocity = 10
  After 2 seconds: velocity = 20
  After 3 seconds: velocity = 30
```

### Acceleration in Code

```typescript
class Player {
  position: Vector2D;
  velocity: Vector2D;
  acceleration: Vector2D;
  
  constructor(x: number, y: number) {
    this.position = new Vector2D(x, y);
    this.velocity = new Vector2D(0, 0);
    this.acceleration = new Vector2D(0, 0);
  }
  
  update(deltaTime: number): void {
    const dt = deltaTime / 1000;
    
    // Apply acceleration to velocity
    // velocity = velocity + (acceleration * deltaTime)
    const deltaVelocity = this.acceleration.multiply(dt);
    this.velocity = this.velocity.add(deltaVelocity);
    
    // Apply velocity to position
    const displacement = this.velocity.multiply(dt);
    this.position = this.position.add(displacement);
  }
}
```

---

## Smooth Acceleration from Input

Instead of instant velocity changes, use acceleration for smoother movement:

```typescript
class Player {
  position: Vector2D;
  velocity: Vector2D;
  acceleration: Vector2D;
  
  maxSpeed: number = 300;        // Maximum velocity
  accelerationRate: number = 800; // How fast to speed up
  
  constructor(x: number, y: number) {
    this.position = new Vector2D(x, y);
    this.velocity = new Vector2D(0, 0);
    this.acceleration = new Vector2D(0, 0);
  }
  
  handleInput(keys: Set<string>): void {
    // Reset acceleration
    this.acceleration.x = 0;
    this.acceleration.y = 0;
    
    // Apply acceleration based on input
    if (keys.has('ArrowLeft') || keys.has('a')) {
      this.acceleration.x = -this.accelerationRate;
    }
    if (keys.has('ArrowRight') || keys.has('d')) {
      this.acceleration.x = this.accelerationRate;
    }
    if (keys.has('ArrowUp') || keys.has('w')) {
      this.acceleration.y = -this.accelerationRate;
    }
    if (keys.has('ArrowDown') || keys.has('s')) {
      this.acceleration.y = this.accelerationRate;
    }
  }
  
  update(deltaTime: number): void {
    const dt = deltaTime / 1000;
    
    // Apply acceleration to velocity
    const deltaVelocity = this.acceleration.multiply(dt);
    this.velocity = this.velocity.add(deltaVelocity);
    
    // Limit velocity to max speed
    this.velocity = this.velocity.limit(this.maxSpeed);
    
    // Apply velocity to position
    const displacement = this.velocity.multiply(dt);
    this.position = this.position.add(displacement);
  }
  
  draw(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = 'green';
    ctx.fillRect(this.position.x - 16, this.position.y - 16, 32, 32);
    
    // Draw velocity vector for debugging
    ctx.strokeStyle = 'red';
    ctx.beginPath();
    ctx.moveTo(this.position.x, this.position.y);
    ctx.lineTo(
      this.position.x + this.velocity.x * 0.1,
      this.position.y + this.velocity.y * 0.1
    );
    ctx.stroke();
  }
}
```

---

## Friction and Damping

Without friction, objects in motion stay in motion (Newton's First Law). In games, we usually want things to slow down naturally.

### Implementing Friction

Friction gradually reduces velocity over time:

```typescript
class Player {
  // ... previous properties ...
  friction: number = 0.9; // 0 = instant stop, 1 = no friction
  
  update(deltaTime: number): void {
    const dt = deltaTime / 1000;
    
    // Apply acceleration to velocity
    const deltaVelocity = this.acceleration.multiply(dt);
    this.velocity = this.velocity.add(deltaVelocity);
    
    // Apply friction (frame-rate independent)
    // Using exponential decay: velocity *= friction^deltaTime
    const frictionFactor = Math.pow(this.friction, dt * 60);
    this.velocity = this.velocity.multiply(frictionFactor);
    
    // Stop completely if velocity is very small
    if (Math.abs(this.velocity.x) < 0.01) this.velocity.x = 0;
    if (Math.abs(this.velocity.y) < 0.01) this.velocity.y = 0;
    
    // Apply velocity to position
    const displacement = this.velocity.multiply(dt);
    this.position = this.position.add(displacement);
  }
}
```

### Why `Math.pow(friction, dt * 60)`?

This makes friction frame-rate independent:

```
At 60 FPS (dt ≈ 0.0167 seconds):
  friction^(0.0167 * 60) = friction^1 = friction

At 30 FPS (dt ≈ 0.0333 seconds):
  friction^(0.0333 * 60) = friction^2

The effect is the same over 1 second regardless of frame rate!
```

---

## Terminal Velocity

**Terminal velocity** is the maximum speed an object can reach. This is important for:

1. **Preventing unrealistic speeds**
2. **Game balance** (fair gameplay)
3. **Collision detection** (fast objects can tunnel through walls)

### Implementation

```typescript
class Player {
  // ... previous properties ...
  maxSpeed: number = 300;
  
  update(deltaTime: number): void {
    const dt = deltaTime / 1000;
    
    // Apply acceleration to velocity
    const deltaVelocity = this.acceleration.multiply(dt);
    this.velocity = this.velocity.add(deltaVelocity);
    
    // Limit to terminal velocity
    this.velocity = this.velocity.limit(this.maxSpeed);
    
    // Apply friction
    const frictionFactor = Math.pow(this.friction, dt * 60);
    this.velocity = this.velocity.multiply(frictionFactor);
    
    // Apply velocity to position
    const displacement = this.velocity.multiply(dt);
    this.position = this.position.add(displacement);
  }
}
```

---

## Diagonal Movement Problem

⚠️ **Common Bug**: Moving diagonally is faster than moving in a single direction!

```typescript
// Moving right:
velocity.x = 200;  // magnitude = 200

// Moving diagonally:
velocity.x = 200;
velocity.y = 200;
// magnitude = √(200² + 200²) = 283 (41% faster!)
```

### Solution: Normalize Input

```typescript
class Player {
  handleInput(keys: Set<string>): void {
    // Get input direction
    let inputX = 0;
    let inputY = 0;
    
    if (keys.has('ArrowLeft') || keys.has('a')) inputX -= 1;
    if (keys.has('ArrowRight') || keys.has('d')) inputX += 1;
    if (keys.has('ArrowUp') || keys.has('w')) inputY -= 1;
    if (keys.has('ArrowDown') || keys.has('s')) inputY += 1;
    
    // Create input vector and normalize
    const inputVector = new Vector2D(inputX, inputY);
    const normalizedInput = inputVector.normalize();
    
    // Apply acceleration in normalized direction
    this.acceleration = normalizedInput.multiply(this.accelerationRate);
  }
}
```

---

## Complete Example: Smooth Player Controller

```typescript
class Vector2D {
  constructor(public x: number = 0, public y: number = 0) {}
  
  add(other: Vector2D): Vector2D {
    return new Vector2D(this.x + other.x, this.y + other.y);
  }
  
  multiply(scalar: number): Vector2D {
    return new Vector2D(this.x * scalar, this.y * scalar);
  }
  
  magnitude(): number {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }
  
  normalize(): Vector2D {
    const mag = this.magnitude();
    if (mag === 0) return new Vector2D(0, 0);
    return new Vector2D(this.x / mag, this.y / mag);
  }
  
  limit(max: number): Vector2D {
    const mag = this.magnitude();
    if (mag > max) {
      return this.normalize().multiply(max);
    }
    return new Vector2D(this.x, this.y);
  }
}

class Player {
  position: Vector2D;
  velocity: Vector2D;
  acceleration: Vector2D;
  
  maxSpeed: number = 300;
  accelerationRate: number = 1000;
  friction: number = 0.85;
  
  constructor(x: number, y: number) {
    this.position = new Vector2D(x, y);
    this.velocity = new Vector2D(0, 0);
    this.acceleration = new Vector2D(0, 0);
  }
  
  handleInput(keys: Set<string>): void {
    // Get input direction
    let inputX = 0;
    let inputY = 0;
    
    if (keys.has('ArrowLeft') || keys.has('a')) inputX -= 1;
    if (keys.has('ArrowRight') || keys.has('d')) inputX += 1;
    if (keys.has('ArrowUp') || keys.has('w')) inputY -= 1;
    if (keys.has('ArrowDown') || keys.has('s')) inputY += 1;
    
    // Normalize input to prevent faster diagonal movement
    const inputVector = new Vector2D(inputX, inputY);
    const normalizedInput = inputVector.normalize();
    
    // Apply acceleration
    this.acceleration = normalizedInput.multiply(this.accelerationRate);
  }
  
  update(deltaTime: number): void {
    const dt = deltaTime / 1000;
    
    // Apply acceleration to velocity
    const deltaVelocity = this.acceleration.multiply(dt);
    this.velocity = this.velocity.add(deltaVelocity);
    
    // Limit to terminal velocity
    this.velocity = this.velocity.limit(this.maxSpeed);
    
    // Apply friction (frame-rate independent)
    const frictionFactor = Math.pow(this.friction, dt * 60);
    this.velocity = this.velocity.multiply(frictionFactor);
    
    // Stop if very slow
    if (Math.abs(this.velocity.x) < 0.1) this.velocity.x = 0;
    if (Math.abs(this.velocity.y) < 0.1) this.velocity.y = 0;
    
    // Apply velocity to position
    const displacement = this.velocity.multiply(dt);
    this.position = this.position.add(displacement);
    
    // Keep in bounds
    this.position.x = Math.max(20, Math.min(780, this.position.x));
    this.position.y = Math.max(20, Math.min(580, this.position.y));
  }
  
  draw(ctx: CanvasRenderingContext2D): void {
    // Draw player
    ctx.fillStyle = 'blue';
    ctx.fillRect(this.position.x - 16, this.position.y - 16, 32, 32);
    
    // Draw velocity vector
    ctx.strokeStyle = 'red';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(this.position.x, this.position.y);
    ctx.lineTo(
      this.position.x + this.velocity.x * 0.1,
      this.position.y + this.velocity.y * 0.1
    );
    ctx.stroke();
    
    // Draw speed text
    const speed = this.velocity.magnitude().toFixed(0);
    ctx.fillStyle = 'black';
    ctx.font = '16px monospace';
    ctx.fillText(`Speed: ${speed}`, 10, 30);
  }
}

// Setup
const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
const ctx = canvas.getContext('2d')!;
canvas.width = 800;
canvas.height = 600;

const keys = new Set<string>();
const player = new Player(400, 300);

window.addEventListener('keydown', (e) => keys.add(e.key));
window.addEventListener('keyup', (e) => keys.delete(e.key));

// Game loop
let lastTime = 0;
function gameLoop(currentTime: number): void {
  const deltaTime = currentTime - lastTime;
  lastTime = currentTime;
  
  // Update
  player.handleInput(keys);
  player.update(deltaTime);
  
  // Draw
  ctx.fillStyle = '#87CEEB';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Draw grid
  ctx.strokeStyle = 'rgba(255,255,255,0.2)';
  ctx.lineWidth = 1;
  for (let x = 0; x < canvas.width; x += 50) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }
  for (let y = 0; y < canvas.height; y += 50) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }
  
  player.draw(ctx);
  
  requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);
```

---

## Key Formulas

### Position Update
```
position = position + (velocity * deltaTime)
```

### Velocity Update
```
velocity = velocity + (acceleration * deltaTime)
```

### Friction (Frame-Rate Independent)
```
velocity *= Math.pow(frictionCoefficient, deltaTime * 60)
```

### Terminal Velocity
```
if (velocity.magnitude() > maxSpeed) {
  velocity = velocity.normalize() * maxSpeed
}
```

### Vector Normalization
```
normalized = vector / vector.magnitude()
magnitude = √(x² + y²)
```

---

## Best Practices

### 1. Always Use Delta Time
```typescript
// ❌ BAD: Frame-rate dependent
position.x += velocity.x;

// ✅ GOOD: Frame-rate independent
position.x += velocity.x * (deltaTime / 1000);
```

### 2. Normalize Input Vectors
```typescript
// ❌ BAD: Diagonal is faster
if (keys.has('w')) velocity.y = -speed;
if (keys.has('d')) velocity.x = speed;

// ✅ GOOD: Consistent speed in all directions
const input = new Vector2D(inputX, inputY).normalize();
acceleration = input.multiply(accelerationRate);
```

### 3. Apply Terminal Velocity
```typescript
// ✅ Always limit maximum speed
velocity = velocity.limit(maxSpeed);
```

### 4. Use Exponential Friction
```typescript
// ❌ BAD: Frame-rate dependent
velocity.x *= 0.9;

// ✅ GOOD: Frame-rate independent
const frictionFactor = Math.pow(0.9, deltaTime * 60);
velocity.x *= frictionFactor;
```

### 5. Stop Small Velocities
```typescript
// Prevent floating-point drift
if (Math.abs(velocity.x) < 0.1) velocity.x = 0;
if (Math.abs(velocity.y) < 0.1) velocity.y = 0;
```

---

## Common Use Cases

### 1. Top-Down Movement (Zelda-style)
```typescript
// Smooth acceleration with friction
accelerationRate = 800;
friction = 0.85;
maxSpeed = 200;
```

### 2. Space Ship (No Friction)
```typescript
// Keep drifting in space
accelerationRate = 300;
friction = 1.0; // No friction!
maxSpeed = 400;
```

### 3. Ice Skating
```typescript
// Very slippery
accelerationRate = 500;
friction = 0.98; // Almost no friction
maxSpeed = 350;
```

### 4. Tank Controls
```typescript
// Only forward/backward, rotation separate
if (keys.has('w')) velocity.x = speed;
if (keys.has('s')) velocity.x = -speed;
// Rotation handled separately
```

---

## Summary

1. **Velocity** = speed + direction (use vectors!)
2. **Acceleration** = rate of change of velocity
3. **Always use deltaTime** for frame-rate independence
4. **Normalize input** to fix diagonal speed bug
5. **Apply friction** for natural deceleration
6. **Limit velocity** with terminal velocity
7. **Use Vector2D class** for clean, reusable code

### Next Steps
- Practice with the exercises
- Experiment with different friction values
- Try different acceleration rates
- Add boundaries and collision
- Prepare for gravity (next lesson!)

---

## Additional Resources

- [Vector Math for Game Developers](https://www.mathsisfun.com/algebra/vectors.html)
- [Frame Rate Independent Code](https://gafferongames.com/post/fix_your_timestep/)
- [Physics for Game Developers](https://www.oreilly.com/library/view/physics-for-game/9781449361037/)
