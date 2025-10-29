# Topic 02: Collision Maps - Quick Reference

Quick reference cheat sheet for tile-based collision detection.

---

## Core Concepts

### AABB Structure
```typescript
interface AABB {
  x: number;        // Left edge
  y: number;        // Top edge
  width: number;    // Width in pixels
  height: number;   // Height in pixels
}
```

### Tile Types
```typescript
enum TileType {
  EMPTY = 0,        // No collision
  SOLID = 1,        // Blocks all sides
  PLATFORM = 2,     // One-way (top only)
  SLOPE_LEFT = 3,   // Rises left→right
  SLOPE_RIGHT = 4,  // Rises right→left
  HAZARD = 5,       // Damages player
  ICE = 7           // Low friction
}
```

---

## Coordinate Conversion

### World ↔ Tile
```typescript
// World to tile
const tileX = Math.floor(worldX / tileSize);
const tileY = Math.floor(worldY / tileSize);

// Tile to world
const worldX = tileX * tileSize;
const worldY = tileY * tileSize;
```

### Get Tiles in AABB
```typescript
const startX = Math.floor(aabb.x / tileSize);
const endX = Math.floor((aabb.x + aabb.width - 0.01) / tileSize);
const startY = Math.floor(aabb.y / tileSize);
const endY = Math.floor((aabb.y + aabb.height - 0.01) / tileSize);
```
**Note**: Subtract 0.01 from right/bottom edges!

---

## AABB Collision

### Overlap Check
```typescript
function overlaps(a: AABB, b: AABB): boolean {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}
```

### Get Overlap Amount
```typescript
const overlapX = Math.min(
  a.x + a.width - b.x,
  b.x + b.width - a.x
);

const overlapY = Math.min(
  a.y + a.height - b.y,
  b.y + b.height - a.y
);
```

### Determine Collision Side
```typescript
// Smallest overlap = collision axis
if (overlapX < overlapY) {
  // Horizontal collision
  side = (centerA.x < centerB.x) ? 'right' : 'left';
} else {
  // Vertical collision
  side = (centerA.y < centerB.y) ? 'bottom' : 'top';
}
```

---

## Collision Resolution

### Separate Axes (CRITICAL!)
```typescript
// ALWAYS resolve X before Y
entity.x += velocityX;
resolveXCollision(entity);

entity.y += velocityY;
resolveYCollision(entity);
```

### Calculate Separation
```typescript
// X-axis
const separation = (entityCenterX < tileCenterX) 
  ? -overlapX  // Push left
  : overlapX;  // Push right

entity.x += separation;
entity.velocityX = 0;

// Y-axis
const separation = (entityCenterY < tileCenterY) 
  ? -overlapY  // Push up
  : overlapY;  // Push down

entity.y += separation;
entity.velocityY = 0;
```

---

## Platform Collision

### One-Way Platform Check
```typescript
// Only collide from above
if (velocityY <= 0) return null;

// Was entity above platform?
const wasAbove = (entityBottom - velocityY) <= platformTop + 4;

// Is entity overlapping now?
const overlapping = entityBottom >= platformTop && 
                   entityBottom < platformTop + 8;

// Check horizontal overlap
const horizontalOverlap = (
  entityLeft < platformRight &&
  entityRight > platformLeft
);

if (wasAbove && overlapping && horizontalOverlap) {
  // Land on platform
}
```

### Drop Through
```typescript
if (input.down && input.jump && onPlatform) {
  entity.y += 12;  // Move below platform
  dropThroughTimer = 0.2;  // Ignore platforms for 200ms
}
```

---

## Slope Collision

### Calculate Slope Height
```typescript
// Get X position within tile
const xInTile = worldX - (tileX * tileSize);
const ratio = xInTile / tileSize;

if (type === SLOPE_LEFT) {
  // Rises left→right: /
  height = tileY * tileSize + tileSize * (1 - ratio);
} else {
  // Rises right→left: \
  height = tileY * tileSize + tileSize * ratio;
}
```

### Resolve Slope
```typescript
const entityBottom = entityY + entityHeight;
const entityCenterX = entityX + entityWidth / 2;

const slopeHeight = getSlopeHeightAt(tileX, tileY, entityCenterX);

if (entityBottom > slopeHeight) {
  entity.y = slopeHeight - entityHeight;
  entity.velocityY = 0;
}
```

---

## Common Patterns

### Check Solid Collision
```typescript
function checkSolid(entityBox: AABB): boolean {
  const tiles = getTilesInAABB(entityBox);
  
  for (const tile of tiles) {
    if (isSolid(tile.type)) {
      const tileBox = getTileAABB(tile.x, tile.y);
      if (overlaps(entityBox, tileBox)) {
        return true;
      }
    }
  }
  
  return false;
}
```

### Get Surface Friction
```typescript
function getFriction(entity: Entity): number {
  const centerX = entity.x + entity.width / 2;
  const bottomY = entity.y + entity.height + 1;
  
  const tileX = Math.floor(centerX / tileSize);
  const tileY = Math.floor(bottomY / tileSize);
  
  const type = getTile(tileX, tileY);
  return getTileProperties(type).friction;
}
```

### Check Grounded
```typescript
function isGrounded(entity: Entity): boolean {
  // Check 1 pixel below entity
  const checkBox = {
    x: entity.x,
    y: entity.y + entity.height,
    width: entity.width,
    height: 2
  };
  
  return checkSolid(checkBox);
}
```

---

## Optimization Tips

### Spatial Partitioning
- Divide map into large cells (4-8 tiles)
- Only check entities in nearby cells
- Update entity cell on movement

### Collision Caching
- Cache static tile collision results
- Invalidate cache when tiles change
- Limit cache size (10,000 entries max)

### Early Exit
```typescript
// Stop at first collision
function anyCollision(box: AABB): boolean {
  for (const tile of tiles) {
    if (collides(box, tile)) {
      return true;  // Early exit
    }
  }
  return false;
}
```

### Broadphase Check
```typescript
// Quick rejection test
if (entity.x > maxX || entity.x < minX ||
    entity.y > maxY || entity.y < minY) {
  return;  // Outside active area
}
```

---

## Common Gotchas

### ❌ Wrong Tile Boundary
```typescript
// Wrong: Includes tile 3 when at x=96
const endX = Math.floor((aabb.x + aabb.width) / tileSize);

// Correct: Excludes tile 3
const endX = Math.floor((aabb.x + aabb.width - 0.01) / tileSize);
```

### ❌ Wrong Axis Order
```typescript
// Wrong: Y first can cause wall-climbing
resolveY();
resolveX();

// Correct: X first prevents wall-climbing
resolveX();
resolveY();
```

### ❌ Platform From Below
```typescript
// Wrong: Collides from below
if (entityBottom > platformTop) {
  land();
}

// Correct: Only from above
if (velocityY > 0 && wasAbove && overlapping) {
  land();
}
```

### ❌ Floating Point Precision
```typescript
// Wrong: Can cause jitter
entity.y = tileY * tileSize - entity.height;

// Correct: Account for collision offset
entity.y = tileY * tileSize - entity.collisionHeight - entity.collisionOffsetY;
```

---

## Collision Result Pattern

```typescript
interface CollisionResult {
  collided: boolean;
  collidedX: boolean;
  collidedY: boolean;
  onGround: boolean;
  onCeiling: boolean;
  onLeftWall: boolean;
  onRightWall: boolean;
}

// Usage
const result = resolveCollision(entity, vx, vy);

if (result.onGround) {
  entity.canJump = true;
  entity.velocityY = 0;
}

if (result.onLeftWall || result.onRightWall) {
  entity.velocityX = 0;
}
```

---

## Tile Properties Lookup

```typescript
const properties = new Map([
  [TileType.SOLID, {
    solid: true,
    friction: 1.0,
    damage: 0
  }],
  [TileType.ICE, {
    solid: true,
    friction: 0.1,  // Very slippery
    damage: 0
  }],
  [TileType.HAZARD, {
    solid: false,
    friction: 1.0,
    damage: 1       // Damages player
  }]
]);

const props = properties.get(tileType);
```

---

## Entity Collision Box

```typescript
class Entity {
  // Visual sprite
  x: number;
  y: number;
  width: number;
  height: number;
  
  // Collision box (usually smaller)
  collisionOffsetX: number = 4;
  collisionOffsetY: number = 4;
  collisionWidth: number = 8;
  collisionHeight: number = 12;
  
  getCollisionBox(): AABB {
    return {
      x: this.x + this.collisionOffsetX,
      y: this.y + this.collisionOffsetY,
      width: this.collisionWidth,
      height: this.collisionHeight
    };
  }
}
```

---

## Performance Targets

- **Large Map**: < 1ms per frame for collision checks
- **Entity Count**: Support 100+ entities efficiently
- **Tile Checks**: < 20 tiles checked per entity
- **Cache Hit Rate**: > 80% for static collisions

---

## Debug Visualization

```typescript
// Draw collision boxes
ctx.strokeStyle = 'lime';
ctx.strokeRect(box.x, box.y, box.width, box.height);

// Draw collision tiles
for (const tile of collisionTiles) {
  ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';
  ctx.fillRect(tile.x * 32, tile.y * 32, 32, 32);
}

// Draw contact points
ctx.fillStyle = 'yellow';
ctx.fillRect(contactX - 2, contactY - 2, 4, 4);
```

---

## Quick Reference Table

| Check | Formula | Note |
|-------|---------|------|
| Overlapping | `a.x < b.right && a.right > b.x` | Both axes |
| World→Tile | `Math.floor(pos / tileSize)` | Truncate |
| Tile→World | `tile * tileSize` | Top-left |
| Center | `pos + size / 2` | Middle |
| Overlap | `Math.min(a.right - b.left, b.right - a.left)` | Smallest |

---

## Next Steps

- Review complete implementation in `a-lesson.md`
- Practice with exercises in `b-exercises.md`
- Check solutions in `c-solutions.md`
- Debug issues using `i-debugging.md`
- Read FAQs in `j-faq.md`
