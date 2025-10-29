# Collision Detection AABB - Quick Notes

## AABB Collision (Copy-Paste Ready)

```typescript
class GameObject {
  x: number; y: number;
  width: number; height: number;
  
  get left() { return this.x - this.width / 2; }
  get right() { return this.x + this.width / 2; }
  get top() { return this.y - this.height / 2; }
  get bottom() { return this.y + this.height / 2; }
  
  collidesWith(other: GameObject): boolean {
    return (
      this.left < other.right &&
      this.right > other.left &&
      this.top < other.bottom &&
      this.bottom > other.top
    );
  }
}
```

---

## Full Collision Resolution

```typescript
resolveCollision(platform: GameObject): void {
  if (!this.collidesWith(platform)) return;
  
  const overlapLeft = this.right - platform.left;
  const overlapRight = platform.right - this.left;
  const overlapTop = this.bottom - platform.top;
  const overlapBottom = platform.bottom - this.top;
  
  const minX = Math.min(overlapLeft, overlapRight);
  const minY = Math.min(overlapTop, overlapBottom);
  
  if (minX < minY) {
    // Horizontal
    if (overlapLeft < overlapRight) {
      this.x = platform.left - this.width / 2;
    } else {
      this.x = platform.right + this.width / 2;
    }
    this.velocityX = 0;
  } else {
    // Vertical
    if (overlapTop < overlapBottom) {
      this.y = platform.top - this.height / 2;
      this.velocityY = 0;
    } else {
      this.y = platform.bottom + this.height / 2;
      this.velocityY = 0;
    }
  }
}
```

---

## Circle Collision

```typescript
class Circle {
  x: number; y: number; radius: number;
  
  collidesWith(other: Circle): boolean {
    const dx = this.x - other.x;
    const dy = this.y - other.y;
    const distSq = dx * dx + dy * dy;
    const minDist = this.radius + other.radius;
    return distSq < minDist * minDist;
  }
}
```

---

## Circle-Rectangle Collision

```typescript
function circleRectCollision(
  cx: number, cy: number, radius: number,
  rx: number, ry: number, rw: number, rh: number
): boolean {
  const closestX = Math.max(
    rx - rw/2,
    Math.min(cx, rx + rw/2)
  );
  const closestY = Math.max(
    ry - rh/2,
    Math.min(cy, ry + rh/2)
  );
  
  const dx = cx - closestX;
  const dy = cy - closestY;
  
  return (dx * dx + dy * dy) < (radius * radius);
}
```

---

## One-Way Platform

```typescript
class OneWayPlatform {
  resolveCollision(player: Player): void {
    // Only collide if above and falling
    if (player.bottom <= this.top + 5 && player.velocityY >= 0) {
      if (player.collidesWith(this)) {
        player.y = this.top - player.height / 2;
        player.velocityY = 0;
        player.isGrounded = true;
      }
    }
  }
}
```

---

## Spatial Grid (Optimization)

```typescript
class SpatialGrid {
  cellSize = 100;
  grid = new Map<string, GameObject[]>();
  
  clear() { this.grid.clear(); }
  
  insert(obj: GameObject) {
    const key = this.getCellKey(obj.x, obj.y);
    if (!this.grid.has(key)) this.grid.set(key, []);
    this.grid.get(key)!.push(obj);
  }
  
  getCellKey(x: number, y: number): string {
    return `${Math.floor(x/this.cellSize)},${Math.floor(y/this.cellSize)}`;
  }
  
  getNearby(obj: GameObject): GameObject[] {
    const key = this.getCellKey(obj.x, obj.y);
    return this.grid.get(key) || [];
  }
}
```

---

## Quick Formulas

### AABB Test
```
collision = (
  a.left < b.right &&
  a.right > b.left &&
  a.top < b.bottom &&
  a.bottom > b.top
)
```

### Circle Test
```
distance² = (x₁-x₂)² + (y₁-y₂)²
collision = distance² < (r₁+r₂)²
```

### Minimum Overlap
```
minX = min(
  playerRight - platformLeft,
  platformRight - playerLeft
)
minY = min(
  playerBottom - platformTop,
  platformBottom - playerTop
)

if (minX < minY) → horizontal collision
else → vertical collision
```

---

## Common Patterns

### Check All Platforms
```typescript
for (const platform of platforms) {
  player.resolveCollision(platform);
}
```

### Reset Grounded State
```typescript
player.isGrounded = false;
for (const platform of platforms) {
  if (playerOnTop(platform)) {
    player.isGrounded = true;
  }
}
```

### Update Order
```typescript
1. Move player
2. Check collisions
3. Resolve collisions (push back)
4. Update grounded state
```
