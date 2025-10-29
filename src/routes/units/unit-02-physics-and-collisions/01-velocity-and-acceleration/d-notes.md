# Velocity and Acceleration - Quick Notes

## Core Formulas

### Position Update
```typescript
position += velocity * deltaTime
```

### Velocity Update
```typescript
velocity += acceleration * deltaTime
```

### Frame-Rate Independent Friction
```typescript
velocity *= Math.pow(frictionCoefficient, deltaTime * 60)
```

### Terminal Velocity
```typescript
if (velocity.magnitude() > maxSpeed) {
  velocity = velocity.normalize() * maxSpeed
}
```

---

## Vector2D Class (Copy-Paste Ready)

```typescript
class Vector2D {
  constructor(public x: number = 0, public y: number = 0) {}
  
  add(v: Vector2D): Vector2D {
    return new Vector2D(this.x + v.x, this.y + v.y);
  }
  
  subtract(v: Vector2D): Vector2D {
    return new Vector2D(this.x - v.x, this.y - v.y);
  }
  
  multiply(scalar: number): Vector2D {
    return new Vector2D(this.x * scalar, this.y * scalar);
  }
  
  magnitude(): number {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }
  
  normalize(): Vector2D {
    const mag = this.magnitude();
    return mag === 0 ? new Vector2D(0, 0) : 
      new Vector2D(this.x / mag, this.y / mag);
  }
  
  limit(max: number): Vector2D {
    const mag = this.magnitude();
    return mag > max ? this.normalize().multiply(max) : 
      new Vector2D(this.x, this.y);
  }
}
```

---

## Basic Player with Velocity

```typescript
class Player {
  position = new Vector2D(400, 300);
  velocity = new Vector2D(0, 0);
  speed = 200;
  
  handleInput(keys: Set<string>): void {
    let inputX = 0, inputY = 0;
    if (keys.has('a')) inputX -= 1;
    if (keys.has('d')) inputX += 1;
    if (keys.has('w')) inputY -= 1;
    if (keys.has('s')) inputY += 1;
    
    // Normalize and apply speed
    const input = new Vector2D(inputX, inputY).normalize();
    this.velocity = input.multiply(this.speed);
  }
  
  update(dt: number): void {
    const displacement = this.velocity.multiply(dt / 1000);
    this.position = this.position.add(displacement);
  }
}
```

---

## Player with Acceleration

```typescript
class Player {
  position = new Vector2D(400, 300);
  velocity = new Vector2D(0, 0);
  acceleration = new Vector2D(0, 0);
  
  maxSpeed = 300;
  accelerationRate = 800;
  
  handleInput(keys: Set<string>): void {
    let inputX = 0, inputY = 0;
    if (keys.has('a')) inputX -= 1;
    if (keys.has('d')) inputX += 1;
    if (keys.has('w')) inputY -= 1;
    if (keys.has('s')) inputY += 1;
    
    const input = new Vector2D(inputX, inputY).normalize();
    this.acceleration = input.multiply(this.accelerationRate);
  }
  
  update(dt: number): void {
    const deltaTime = dt / 1000;
    
    // Apply acceleration to velocity
    const deltaVel = this.acceleration.multiply(deltaTime);
    this.velocity = this.velocity.add(deltaVel);
    
    // Limit to max speed
    this.velocity = this.velocity.limit(this.maxSpeed);
    
    // Apply velocity to position
    const displacement = this.velocity.multiply(deltaTime);
    this.position = this.position.add(displacement);
  }
}
```

---

## Player with Friction

```typescript
class Player {
  position = new Vector2D(400, 300);
  velocity = new Vector2D(0, 0);
  acceleration = new Vector2D(0, 0);
  
  maxSpeed = 300;
  accelerationRate = 1000;
  friction = 0.85;
  
  handleInput(keys: Set<string>): void {
    let inputX = 0, inputY = 0;
    if (keys.has('a')) inputX -= 1;
    if (keys.has('d')) inputX += 1;
    if (keys.has('w')) inputY -= 1;
    if (keys.has('s')) inputY += 1;
    
    const input = new Vector2D(inputX, inputY).normalize();
    this.acceleration = input.multiply(this.accelerationRate);
  }
  
  update(dt: number): void {
    const deltaTime = dt / 1000;
    
    // Apply acceleration
    const deltaVel = this.acceleration.multiply(deltaTime);
    this.velocity = this.velocity.add(deltaVel);
    
    // Apply friction (frame-rate independent)
    const frictionFactor = Math.pow(this.friction, deltaTime * 60);
    this.velocity = this.velocity.multiply(frictionFactor);
    
    // Stop if very slow
    if (Math.abs(this.velocity.x) < 0.1) this.velocity.x = 0;
    if (Math.abs(this.velocity.y) < 0.1) this.velocity.y = 0;
    
    // Limit to max speed
    this.velocity = this.velocity.limit(this.maxSpeed);
    
    // Apply velocity
    const displacement = this.velocity.multiply(deltaTime);
    this.position = this.position.add(displacement);
  }
}
```

---

## Smooth Following (Lerp)

```typescript
class Follower {
  x = 400;
  y = 300;
  targetX = 400;
  targetY = 300;
  lerpFactor = 0.1; // 0 = no movement, 1 = instant
  
  setTarget(x: number, y: number): void {
    this.targetX = x;
    this.targetY = y;
  }
  
  update(dt: number): void {
    const smoothing = this.lerpFactor * (dt / 1000 * 60);
    this.x += (this.targetX - this.x) * smoothing;
    this.y += (this.targetY - this.y) * smoothing;
  }
}
```

---

## Seek Steering Behavior

```typescript
function seek(
  position: Vector2D,
  velocity: Vector2D,
  target: Vector2D,
  maxSpeed: number,
  maxForce: number,
  dt: number
): Vector2D {
  // Calculate desired velocity
  const desired = target.subtract(position)
    .normalize()
    .multiply(maxSpeed);
  
  // Calculate steering force
  const steering = desired.subtract(velocity).limit(maxForce);
  
  // Apply steering as acceleration
  const newVelocity = velocity.add(steering.multiply(dt));
  return newVelocity.limit(maxSpeed);
}
```

---

## Bouncing Off Walls

```typescript
// Horizontal walls
if (x - radius < 0) {
  x = radius;
  velocityX *= -1;
}
if (x + radius > width) {
  x = width - radius;
  velocityX *= -1;
}

// Vertical walls
if (y - radius < 0) {
  y = radius;
  velocityY *= -1;
}
if (y + radius > height) {
  y = height - radius;
  velocityY *= -1;
}
```

---

## Common Presets

### Normal Movement
```typescript
maxSpeed = 300;
accelerationRate = 800;
friction = 0.85;
```

### Ice Physics
```typescript
maxSpeed = 350;
accelerationRate = 400;
friction = 0.98; // Very slippery
```

### Responsive Controls
```typescript
maxSpeed = 250;
accelerationRate = 1500;
friction = 0.7; // Quick stop
```

### Space (No Friction)
```typescript
maxSpeed = 400;
accelerationRate = 300;
friction = 1.0; // No friction
```

### Mud/Water
```typescript
maxSpeed = 150;
accelerationRate = 1200;
friction = 0.5; // Heavy friction
```

---

## Delta Time Conversion

```typescript
// If deltaTime is in milliseconds:
const dt = deltaTime / 1000; // Convert to seconds

// If deltaTime is in seconds:
const dt = deltaTime; // Already in seconds
```

---

## Quick Checklist

✅ Using `deltaTime` in all movement calculations  
✅ Normalizing diagonal input  
✅ Applying terminal velocity  
✅ Using `Math.pow()` for friction  
✅ Stopping very small velocities  
✅ Update order: acceleration → velocity → position  
✅ Drawing velocity vectors for debugging  

---

## Common Values

| Property | Typical Range | Example |
|----------|--------------|---------|
| maxSpeed | 150-400 px/s | 250 |
| accelerationRate | 500-1500 px/s² | 800 |
| friction | 0.7-0.95 | 0.85 |
| lerpFactor | 0.05-0.2 | 0.1 |
| stopThreshold | 0.01-1.0 | 0.1 |

---

## Math Reference

### Vector Magnitude
```typescript
magnitude = Math.sqrt(x * x + y * y)
```

### Normalize Vector
```typescript
normalizedX = x / magnitude
normalizedY = y / magnitude
```

### Distance Between Points
```typescript
distance = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2)
```

### Angle From Vector
```typescript
angle = Math.atan2(y, x) // in radians
```

### Vector From Angle
```typescript
x = Math.cos(angle) * magnitude
y = Math.sin(angle) * magnitude
```
