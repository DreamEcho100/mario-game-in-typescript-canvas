# Topic 02: Collision Maps - FAQ

Frequently asked questions about tile-based collision detection.

---

## General Questions

### Q1: What's the difference between AABB and pixel-perfect collision?

**A**: AABB (Axis-Aligned Bounding Box) uses rectangular collision boxes, while pixel-perfect collision checks actual pixel data.

**AABB:**
- ✅ Fast (simple math operations)
- ✅ Predictable and consistent
- ✅ Works well for tile-based games
- ❌ Less accurate for complex shapes

**Pixel-Perfect:**
- ✅ Most accurate
- ❌ Slow (checks many pixels)
- ❌ Complex to implement
- ❌ Overkill for most 2D platformers

**For Mario games, AABB is the right choice!**

---

### Q2: Why resolve X-axis before Y-axis?

**A**: Resolving X before Y prevents wall-climbing bugs and creates more intuitive movement.

```typescript
// Wrong order (Y first):
entity.y += velocityY;  // Move down
resolveY();              // Push up to floor
entity.x += velocityX;  // Move right INTO wall
resolveX();              // Push left

// Result: Entity ends up inside wall or "climbs" it

// Correct order (X first):
entity.x += velocityX;  // Move right INTO wall
resolveX();              // Push left OUT of wall
entity.y += velocityY;  // Move down
resolveY();              // Push up to floor

// Result: Entity slides along wall and lands on floor naturally
```

**X-first resolution matches player expectations!**

---

### Q3: Why subtract 0.01 from tile range calculation?

**A**: To handle entities positioned exactly on tile boundaries.

```typescript
// Without 0.01:
const entityX = 64;  // Exactly on tile 2/3 boundary
const entityWidth = 32;  // Extends to 96
const endTile = Math.floor((64 + 32) / 32);  // = floor(96/32) = floor(3.0) = 3

// With 0.01:
const endTile = Math.floor((64 + 32 - 0.01) / 32);  // = floor(95.99/32) = floor(2.999) = 2
```

An entity at x=64, width=32 touches tiles 2 and 3, but its right edge at x=96 doesn't overlap into tile 3. The 0.01 prevents checking tile 3.

---

### Q4: How do I prevent tunneling through thin walls?

**A**: Use one of these approaches:

**Option 1: Cap Maximum Velocity**
```typescript
const MAX_VELOCITY = 500;  // pixels per second
entity.velocityY = Math.min(entity.velocityY, MAX_VELOCITY);
```

**Option 2: Swept Collision (Continuous Detection)**
```typescript
function sweepAABB(movingBox, vx, vy, staticBox) {
  // Calculate time of impact
  // Returns collision time (0-1) and normal
  // More complex but handles fast movement
}
```

**Option 3: Sub-stepping**
```typescript
const steps = Math.ceil(Math.abs(velocityY) / tileSize);
for (let i = 0; i < steps; i++) {
  entity.y += velocityY / steps;
  resolveCollision(entity);
  if (collision.collided) break;
}
```

**For most games, capping velocity is sufficient!**

---

## Platform Questions

### Q5: How do one-way platforms work?

**A**: Platforms only collide when the entity is:
1. Moving downward (`velocityY > 0`)
2. Coming from above the platform
3. Within collision threshold (4-8 pixels)
4. Horizontally overlapping the platform

```typescript
// Key checks:
const wasAbove = (entityBottom - velocityY) <= platformTop + 4;
const isNear = entityBottom >= platformTop && entityBottom < platformTop + 8;
const horizontalOverlap = entityLeft < platformRight && entityRight > platformLeft;

if (velocityY > 0 && wasAbove && isNear && horizontalOverlap) {
  // Land on platform
}
```

**The "was above" check is critical** - it uses the entity's position from the previous frame.

---

### Q6: How do I implement drop-through platforms?

**A**: Move the entity below the platform and add a grace period:

```typescript
class Player {
  private dropThroughTimer = 0;

  update(input, deltaTime) {
    // Check drop-through input
    if (input.down && input.jump && this.isOnPlatform()) {
      this.y += 12;  // Move below platform
      this.dropThroughTimer = 0.2;  // 200ms grace period
    }

    // Update timer
    if (this.dropThroughTimer > 0) {
      this.dropThroughTimer -= deltaTime;
    }

    // Skip platform collision during grace period
    if (this.dropThroughTimer <= 0) {
      this.checkPlatformCollision();
    }
  }
}
```

**The timer prevents immediate re-collision with the platform.**

---

## Slope Questions

### Q7: How do slopes work in 2D platformers?

**A**: Slopes are calculated using linear interpolation across the tile:

```typescript
// Left-rising slope (/)
// At left edge (x=0): height = tileSize (bottom)
// At right edge (x=tileSize): height = 0 (top)
height = tileY * tileSize + tileSize * (1 - ratio);

// Right-rising slope (\)
// At left edge (x=0): height = 0 (top)
// At right edge (x=tileSize): height = tileSize (bottom)
height = tileY * tileSize + tileSize * ratio;

// Where ratio = (entityCenterX - tileX) / tileSize
```

The entity's bottom is aligned to this calculated height.

---

### Q8: Why do entities slide on slopes?

**A**: Gravity pushes them down continuously. Solutions:

**Option 1: Disable Gravity on Slopes**
```typescript
if (isOnSlope(entity)) {
  entity.velocityY = 0;  // Don't apply gravity
}
```

**Option 2: Add Slope Friction**
```typescript
if (isOnSlope(entity)) {
  entity.velocityX *= 0.9;  // Friction
  entity.velocityY = 0;
}
```

**Option 3: Snap to Surface**
```typescript
if (isOnSlope(entity) && Math.abs(entity.velocityY) < 50) {
  const height = getSlopeHeight(entity);
  entity.y = height - entity.height;
  entity.velocityY = 0;
}
```

---

## Optimization Questions

### Q9: How many tiles should I check per entity?

**A**: Typically 4-16 tiles depending on entity size:

- Small entity (16x16): ~4 tiles (2x2)
- Mario-sized (16x32): ~6 tiles (2x3)
- Large entity (32x32): ~9 tiles (3x3)
- Boss (64x64): ~16 tiles (4x4)

**Never check all tiles in the map!** Always use AABB to limit checks.

---

### Q10: Should I use spatial partitioning?

**A**: Yes, if you have:
- Large maps (> 100x100 tiles)
- Many entities (> 50)
- Complex collision checks

**Simple Spatial Grid:**
```typescript
class SpatialGrid {
  private cellSize = 128;  // 4 tiles @ 32px
  private cells = new Map<string, Set<Entity>>();

  insert(entity) {
    const cells = this.getCellsForAABB(entity.getCollisionBox());
    for (const cell of cells) {
      this.cells.get(cell).add(entity);
    }
  }

  getNearby(aabb) {
    const cells = this.getCellsForAABB(aabb);
    const entities = new Set();
    for (const cell of cells) {
      for (const entity of this.cells.get(cell)) {
        entities.add(entity);
      }
    }
    return entities;
  }
}
```

**For small maps (< 50x50), spatial partitioning is overkill.**

---

### Q11: Should I cache collision data?

**A**: Yes for static tiles, no for moving entities:

```typescript
class CollisionCache {
  private cache = new Map<string, boolean>();

  isSolid(tileX, tileY) {
    const key = `${tileX},${tileY}`;
    
    if (this.cache.has(key)) {
      return this.cache.get(key);  // Cache hit
    }

    // Calculate and cache
    const solid = this.calculateSolid(tileX, tileY);
    this.cache.set(key, solid);
    return solid;
  }

  invalidate(tileX, tileY) {
    this.cache.delete(`${tileX},${tileY}`);
  }
}
```

**Cache is most useful when tiles don't change frequently.**

---

## Implementation Questions

### Q12: Should collision box be same size as sprite?

**A**: No! Collision boxes should usually be **smaller** than the sprite:

```typescript
class Mario {
  // Sprite size (visual)
  width = 16;
  height = 16;

  // Collision box (smaller)
  collisionOffsetX = 4;
  collisionOffsetY = 2;
  collisionWidth = 8;
  collisionHeight = 14;
}
```

**Benefits:**
- More forgiving gameplay
- Sprite edges can overlap tiles visually
- Better "game feel"
- Matches classic Mario behavior

**Rule of thumb:** Collision box should be 50-75% of sprite size.

---

### Q13: How do I handle corner collisions?

**A**: Separate axis resolution automatically handles corners:

```typescript
// Entity approaching corner diagonally
entity.x += 5;  // Move right
entity.y += 5;  // Move down

// Resolve X-axis first
resolveX(entity);  // Pushes left (away from wall)

// Then resolve Y-axis
resolveY(entity);  // Pushes up (away from floor)

// Result: Entity slides along wall or floor naturally
```

**No special corner detection needed!** The separation on each axis prevents getting stuck.

---

### Q14: Should I use floating point or integer positions?

**A**: Use **floating point** for positions, but be aware of precision:

```typescript
// Floating point (recommended)
entity.x = 100.5;
entity.y = 200.75;
entity.velocityX = 2.5;

// Benefits:
// - Smooth movement at any speed
// - Works with deltaTime
// - No accumulated errors

// Integer-only (not recommended)
entity.x = 100;
entity.y = 200;
entity.velocityX = 2;

// Problems:
// - Jerky movement
// - Limited speed options
// - Accumulates rounding errors
```

**Use Math.floor() only for tile coordinate conversion!**

---

### Q15: How do I detect if entity is grounded?

**A**: Check for solid tiles 1-2 pixels below entity:

```typescript
function isGrounded(entity): boolean {
  const box = entity.getCollisionBox();
  
  const checkBox: AABB = {
    x: box.x,
    y: box.y + box.height,  // Start at bottom of entity
    width: box.width,
    height: 2  // Check 2 pixels below
  };

  return checkSolidCollision(checkBox);
}
```

**Don't use a flag set during collision resolution** - it can become outdated if the ground is removed.

---

## Advanced Questions

### Q16: How do I implement moving platforms?

**A**: Two approaches:

**Option 1: Carry the Player**
```typescript
class MovingPlatform {
  update(deltaTime) {
    const prevX = this.x;
    const prevY = this.y;

    this.x += this.velocityX * deltaTime;
    this.y += this.velocityY * deltaTime;

    // Move entities standing on platform
    for (const entity of this.passengers) {
      entity.x += this.x - prevX;
      entity.y += this.y - prevY;
    }
  }
}
```

**Option 2: Relative Velocity**
```typescript
// When standing on moving platform
if (onMovingPlatform) {
  entity.velocityX += platform.velocityX;
  entity.velocityY += platform.velocityY;
}
```

**Option 1 is more reliable for platformers.**

---

### Q17: How do I implement conveyor belts?

**A**: Apply horizontal force when entity is on conveyor:

```typescript
class ConveyorBelt extends Tile {
  speed = 50;  // pixels per second
  
  applyToEntity(entity) {
    if (entity.isGrounded() && entity.isOnTile(this)) {
      entity.velocityX += this.speed * deltaTime;
    }
  }
}
```

**Conveyors apply force, not absolute velocity** - player can still fight against them.

---

### Q18: How do I handle destructible tiles?

**A**: Remove tile and invalidate collision cache:

```typescript
function destroyTile(tileX, tileY) {
  // Remove tile
  collisionMap.setTile(tileX, tileY, TileType.EMPTY);

  // Invalidate cache
  collisionCache.invalidate(tileX, tileY);

  // Check if any entity was supported by this tile
  for (const entity of entities) {
    if (entity.isGrounded() && entity.isOnTile(tileX, tileY)) {
      entity.startFalling();
    }
  }

  // Spawn particles/effects
  spawnDebris(tileX * tileSize, tileY * tileSize);
}
```

---

### Q19: How do I implement ladders?

**A**: Use climbable tile type and special movement logic:

```typescript
function updateLadder(entity, input) {
  if (isOnClimbable(entity)) {
    // Disable gravity
    entity.velocityY = 0;

    // Manual vertical movement
    if (input.up) {
      entity.velocityY = -CLIMB_SPEED;
    } else if (input.down) {
      entity.velocityY = CLIMB_SPEED;
    }

    // Snap to ladder center
    const ladderCenterX = getLadderCenterX(entity);
    entity.x += (ladderCenterX - entity.x) * 0.1;  // Lerp to center
  }
}
```

---

### Q20: What's the performance cost of collision detection?

**A**: Typical costs for well-optimized system:

- **Basic AABB check**: ~0.001ms
- **Tile range query**: ~0.01ms (4-16 tiles)
- **Collision resolution**: ~0.05ms per entity
- **100 entities**: ~5ms total per frame

**Target: < 16ms** (60 FPS) total game logic including collision.

**Optimization priority:**
1. Limit tile checks (use AABB bounds)
2. Use spatial partitioning for > 100 entities
3. Cache static collision data
4. Profile and optimize hotspots

---

## Best Practices

### ✅ Do:
- Use separate X and Y axis resolution
- Subtract 0.01 from tile range end
- Cap maximum velocities
- Use smaller collision boxes than sprites
- Check velocity direction for platforms
- Add drop-through timers
- Visualize collision boxes in debug mode

### ❌ Don't:
- Resolve Y-axis before X-axis
- Check all tiles in the map
- Use pixel-perfect collision
- Make collision box same as sprite
- Apply gravity when grounded
- Forget to handle edge cases
- Optimize prematurely

---

## Resources

- **Classic Game Postmortems**: Study original Mario/Sonic collision
- **Game Feel** by Steve Swink: Understanding collision "feel"
- **Collision Detection Algorithms**: Swept AABB, SAT, GJK
- **Celeste Source Code**: Excellent modern platformer collision

---

## Next Steps

- Review complete implementation in `a-lesson.md`
- Practice with exercises in `b-exercises.md`
- Check your solutions in `c-solutions.md`
- Use the quick reference in `d-notes.md`
- Debug issues with `i-debugging.md`
