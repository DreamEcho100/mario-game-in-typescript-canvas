# Collision Detection - AABB

## Learning Objectives
By the end of this lesson, you will be able to:
- Understand AABB (Axis-Aligned Bounding Box) collision detection
- Implement rectangle-rectangle collision
- Implement circle-circle collision
- Implement circle-rectangle collision
- Detect collision sides (top, bottom, left, right)
- Create efficient collision systems with spatial partitioning

## Prerequisites
- Completed Topics 01-02 (Velocity, Gravity, Jumping)
- Understanding of coordinate systems
- Basic geometry knowledge

---

## What is Collision Detection?

**Collision detection** determines if two game objects are overlapping or touching.

### Types of Collision Detection

1. **AABB** (Axis-Aligned Bounding Box) - Rectangles aligned to axes
2. **Circle** - Distance-based detection
3. **SAT** (Separating Axis Theorem) - Rotated shapes
4. **Pixel-perfect** - Exact shape matching (expensive)

This lesson focuses on **AABB** and **Circle** collision (fastest and most common).

---

## AABB Collision Detection

**AABB** = Axis-Aligned Bounding Box (rectangle that doesn't rotate)

### Rectangle Structure

```typescript
interface Rectangle {
  x: number;      // Center X
  y: number;      // Center Y
  width: number;  // Full width
  height: number; // Full height
}
```

### Basic AABB Collision Test

Two rectangles collide if they overlap on BOTH X and Y axes:

```typescript
function checkAABB(a: Rectangle, b: Rectangle): boolean {
  return (
    a.x - a.width / 2 < b.x + b.width / 2 &&
    a.x + a.width / 2 > b.x - b.width / 2 &&
    a.y - a.height / 2 < b.y + b.height / 2 &&
    a.y + a.height / 2 > b.y - b.height / 2
  );
}
```

### Explanation

```
For collision to occur:
- A's left edge < B's right edge
- A's right edge > B's left edge
- A's top edge < B's bottom edge
- A's bottom edge > B's top edge
```

### Visual Example

```
    A overlaps B on X axis:     A overlaps B on Y axis:
    
    [----A----]                      A
        [----B----]                  |
    ✓ Overlapping                    |
                                     B
                                     |
                                    ✓ Overlapping

    Collision = X overlap AND Y overlap
```

---

## Implementation

### Basic Collision Class

```typescript
class CollisionBox {
  x: number;
  y: number;
  width: number;
  height: number;
  
  constructor(x: number, y: number, width: number, height: number) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }
  
  get left(): number { return this.x - this.width / 2; }
  get right(): number { return this.x + this.width / 2; }
  get top(): number { return this.y - this.height / 2; }
  get bottom(): number { return this.y + this.height / 2; }
  
  collidesWith(other: CollisionBox): boolean {
    return (
      this.left < other.right &&
      this.right > other.left &&
      this.top < other.bottom &&
      this.bottom > other.top
    );
  }
  
  draw(ctx: CanvasRenderingContext2D, color: string = 'red'): void {
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.strokeRect(this.left, this.top, this.width, this.height);
  }
}
```

---

## Detecting Collision Side

To respond correctly (push player up from platform), we need to know WHICH side collided:

```typescript
enum CollisionSide {
  None,
  Top,
  Bottom,
  Left,
  Right
}

function getCollisionSide(
  player: CollisionBox,
  platform: CollisionBox,
  velocityX: number,
  velocityY: number
): CollisionSide {
  if (!player.collidesWith(platform)) {
    return CollisionSide.None;
  }
  
  // Calculate overlap on each axis
  const overlapLeft = player.right - platform.left;
  const overlapRight = platform.right - player.left;
  const overlapTop = player.bottom - platform.top;
  const overlapBottom = platform.bottom - player.top;
  
  // Find minimum overlap
  const minOverlapX = Math.min(overlapLeft, overlapRight);
  const minOverlapY = Math.min(overlapTop, overlapBottom);
  
  // Collision is on axis with smallest overlap
  if (minOverlapX < minOverlapY) {
    // Horizontal collision
    return velocityX > 0 ? CollisionSide.Right : CollisionSide.Left;
  } else {
    // Vertical collision
    return velocityY > 0 ? CollisionSide.Bottom : CollisionSide.Top;
  }
}
```

---

## Circle Collision Detection

Circles collide if distance between centers is less than sum of radii:

```typescript
interface Circle {
  x: number;
  y: number;
  radius: number;
}

function checkCircleCollision(a: Circle, b: Circle): boolean {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  const minDistance = a.radius + b.radius;
  
  return distance < minDistance;
}
```

### Optimized (Avoid Square Root)

```typescript
function checkCircleCollisionFast(a: Circle, b: Circle): boolean {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  const distanceSquared = dx * dx + dy * dy;
  const minDistance = a.radius + b.radius;
  const minDistanceSquared = minDistance * minDistance;
  
  return distanceSquared < minDistanceSquared;
}
```

**Why?** Square root is expensive. Comparing squared values gives same result but faster!

---

## Circle-Rectangle Collision

Most complex of the three:

```typescript
function checkCircleRectCollision(
  circle: Circle,
  rect: Rectangle
): boolean {
  // Find closest point on rectangle to circle center
  const closestX = Math.max(
    rect.left,
    Math.min(circle.x, rect.right)
  );
  const closestY = Math.max(
    rect.top,
    Math.min(circle.y, rect.bottom)
  );
  
  // Calculate distance from circle center to closest point
  const dx = circle.x - closestX;
  const dy = circle.y - closestY;
  const distanceSquared = dx * dx + dy * dy;
  
  // Collision if distance < radius
  return distanceSquared < (circle.radius * circle.radius);
}
```

---

## Complete Example: Platformer Collision

```typescript
class GameObject {
  x: number;
  y: number;
  width: number;
  height: number;
  velocityX = 0;
  velocityY = 0;
  
  constructor(x: number, y: number, width: number, height: number) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }
  
  get left(): number { return this.x - this.width / 2; }
  get right(): number { return this.x + this.width / 2; }
  get top(): number { return this.y - this.height / 2; }
  get bottom(): number { return this.y + this.height / 2; }
  
  collidesWith(other: GameObject): boolean {
    return (
      this.left < other.right &&
      this.right > other.left &&
      this.top < other.bottom &&
      this.bottom > other.top
    );
  }
}

class Player extends GameObject {
  readonly GRAVITY = 980;
  readonly JUMP_FORCE = -450;
  readonly MOVE_SPEED = 250;
  
  isGrounded = false;
  horizontalInput = 0;
  
  update(deltaTime: number): void {
    const dt = deltaTime / 1000;
    
    // Horizontal movement
    this.velocityX = this.horizontalInput * this.MOVE_SPEED;
    
    // Gravity
    this.velocityY += this.GRAVITY * dt;
    
    // Apply velocity
    this.x += this.velocityX * dt;
    this.y += this.velocityY * dt;
  }
  
  resolveCollision(platform: GameObject): void {
    if (!this.collidesWith(platform)) return;
    
    // Calculate overlaps
    const overlapLeft = this.right - platform.left;
    const overlapRight = platform.right - this.left;
    const overlapTop = this.bottom - platform.top;
    const overlapBottom = platform.bottom - this.top;
    
    // Find minimum overlap
    const minOverlapX = Math.min(overlapLeft, overlapRight);
    const minOverlapY = Math.min(overlapTop, overlapBottom);
    
    // Push out on axis with smallest overlap
    if (minOverlapX < minOverlapY) {
      // Horizontal collision
      if (overlapLeft < overlapRight) {
        this.x = platform.left - this.width / 2; // Push left
      } else {
        this.x = platform.right + this.width / 2; // Push right
      }
      this.velocityX = 0;
    } else {
      // Vertical collision
      if (overlapTop < overlapBottom) {
        this.y = platform.top - this.height / 2; // Push up
        this.velocityY = 0;
        this.isGrounded = true;
      } else {
        this.y = platform.bottom + this.height / 2; // Push down
        this.velocityY = 0;
      }
    }
  }
  
  jump(): void {
    if (this.isGrounded) {
      this.velocityY = this.JUMP_FORCE;
      this.isGrounded = false;
    }
  }
  
  draw(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = this.isGrounded ? 'blue' : 'lightblue';
    ctx.fillRect(this.left, this.top, this.width, this.height);
  }
}

class Platform extends GameObject {
  draw(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(this.left, this.top, this.width, this.height);
  }
}

// Setup
const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
const ctx = canvas.getContext('2d')!;
canvas.width = 800;
canvas.height = 600;

const player = new Player(100, 100, 32, 32);
const platforms: Platform[] = [
  new Platform(400, 500, 800, 50),  // Ground
  new Platform(200, 400, 150, 20),  // Platform 1
  new Platform(500, 300, 150, 20),  // Platform 2
  new Platform(300, 200, 150, 20),  // Platform 3
];

const keys = new Set<string>();
window.addEventListener('keydown', (e) => keys.add(e.key));
window.addEventListener('keyup', (e) => keys.delete(e.key));

let lastTime = 0;
function gameLoop(currentTime: number): void {
  const deltaTime = currentTime - lastTime;
  lastTime = currentTime;
  
  // Input
  player.horizontalInput = 0;
  if (keys.has('a') || keys.has('ArrowLeft')) player.horizontalInput = -1;
  if (keys.has('d') || keys.has('ArrowRight')) player.horizontalInput = 1;
  if (keys.has(' ')) player.jump();
  
  // Update
  player.isGrounded = false; // Reset grounded state
  player.update(deltaTime);
  
  // Collision detection and resolution
  for (const platform of platforms) {
    player.resolveCollision(platform);
  }
  
  // Draw
  ctx.fillStyle = '#87CEEB';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  for (const platform of platforms) {
    platform.draw(ctx);
  }
  player.draw(ctx);
  
  // Debug info
  ctx.fillStyle = 'black';
  ctx.font = '14px monospace';
  ctx.fillText(`Grounded: ${player.isGrounded}`, 10, 30);
  ctx.fillText(`Position: (${player.x.toFixed(0)}, ${player.y.toFixed(0)})`, 10, 50);
  
  requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);
```

---

## Spatial Partitioning (Optimization)

For many objects, checking every pair is slow: O(n²)

### Grid-Based Partitioning

```typescript
class SpatialGrid {
  cellSize: number;
  grid: Map<string, GameObject[]>;
  
  constructor(cellSize: number = 100) {
    this.cellSize = cellSize;
    this.grid = new Map();
  }
  
  getCellKey(x: number, y: number): string {
    const cellX = Math.floor(x / this.cellSize);
    const cellY = Math.floor(y / this.cellSize);
    return `${cellX},${cellY}`;
  }
  
  clear(): void {
    this.grid.clear();
  }
  
  insert(obj: GameObject): void {
    // Insert into all cells the object overlaps
    const minCellX = Math.floor(obj.left / this.cellSize);
    const maxCellX = Math.floor(obj.right / this.cellSize);
    const minCellY = Math.floor(obj.top / this.cellSize);
    const maxCellY = Math.floor(obj.bottom / this.cellSize);
    
    for (let cx = minCellX; cx <= maxCellX; cx++) {
      for (let cy = minCellY; cy <= maxCellY; cy++) {
        const key = `${cx},${cy}`;
        if (!this.grid.has(key)) {
          this.grid.set(key, []);
        }
        this.grid.get(key)!.push(obj);
      }
    }
  }
  
  getNearby(obj: GameObject): GameObject[] {
    const nearby = new Set<GameObject>();
    
    const minCellX = Math.floor(obj.left / this.cellSize);
    const maxCellX = Math.floor(obj.right / this.cellSize);
    const minCellY = Math.floor(obj.top / this.cellSize);
    const maxCellY = Math.floor(obj.bottom / this.cellSize);
    
    for (let cx = minCellX; cx <= maxCellX; cx++) {
      for (let cy = minCellY; cy <= maxCellY; cy++) {
        const key = `${cx},${cy}`;
        const cell = this.grid.get(key);
        if (cell) {
          cell.forEach(other => {
            if (other !== obj) nearby.add(other);
          });
        }
      }
    }
    
    return Array.from(nearby);
  }
}

// Usage
const spatialGrid = new SpatialGrid(100);

function update(): void {
  // Clear and rebuild grid
  spatialGrid.clear();
  for (const obj of allObjects) {
    spatialGrid.insert(obj);
  }
  
  // Check collisions only with nearby objects
  for (const player of players) {
    const nearby = spatialGrid.getNearby(player);
    for (const obj of nearby) {
      if (player.collidesWith(obj)) {
        player.resolveCollision(obj);
      }
    }
  }
}
```

---

## Broad Phase vs Narrow Phase

### Broad Phase
- Quick, rough check
- "Could these objects possibly collide?"
- Uses spatial partitioning or bounding boxes

### Narrow Phase
- Precise check
- "Are these objects actually colliding?"
- Uses AABB, circle, or pixel-perfect detection

```typescript
// Broad phase: Check distance
const dx = a.x - b.x;
const dy = a.y - b.y;
const maxDistance = (a.width + b.width) / 2;

if (dx * dx + dy * dy < maxDistance * maxDistance) {
  // Narrow phase: Precise AABB check
  if (a.collidesWith(b)) {
    resolveCollision(a, b);
  }
}
```

---

## Key Formulas

### AABB Collision
```typescript
collision = (
  a.left < b.right &&
  a.right > b.left &&
  a.top < b.bottom &&
  a.bottom > b.top
)
```

### Circle Collision
```typescript
distance = √((x₁ - x₂)² + (y₁ - y₂)²)
collision = distance < (radius₁ + radius₂)
```

### Circle-Rectangle
```typescript
closestX = clamp(circle.x, rect.left, rect.right)
closestY = clamp(circle.y, rect.top, rect.bottom)
distance = √((circle.x - closestX)² + (circle.y - closestY)²)
collision = distance < radius
```

---

## Common Pitfalls

### 1. Wrong Coordinate System
```typescript
// ❌ Using top-left corner as position
x, y = top-left corner

// ✅ Using center as position
x, y = center
left = x - width/2
right = x + width/2
```

### 2. Checking Collision After Moving
```typescript
// ❌ Move first, collision misses
move();
checkCollision();

// ✅ Check and resolve immediately
move();
resolveCollision(); // Pushes back
```

### 3. Not Resetting Grounded State
```typescript
// ❌ isGrounded stays true in air
// (never reset)

// ✅ Reset each frame
isGrounded = false;
for (platform of platforms) {
  if (collidingWithTop(platform)) {
    isGrounded = true;
  }
}
```

---

## Summary

1. **AABB**: Fast rectangle collision (most common)
2. **Circle**: Distance-based collision (smooth, no corners)
3. **Circle-Rectangle**: Hybrid approach
4. **Collision Side**: Determine which edge hit
5. **Spatial Partitioning**: Optimize for many objects
6. **Broad/Narrow Phase**: Two-stage detection

**Next**: Collision Response (Platformer Physics)!
