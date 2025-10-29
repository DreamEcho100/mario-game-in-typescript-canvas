# Topic 02: Collision Maps - Debugging Guide

Common collision bugs, their symptoms, causes, and fixes.

---

## Bug #1: Entity Falls Through Floor

### Symptoms
- Entity passes through solid tiles
- Inconsistent collision detection
- Falls through floor at high speeds

### Causes
1. **Velocity too high** - Entity moves multiple tiles in one frame
2. **Wrong collision order** - Y-axis resolved before X-axis
3. **Floating point errors** - Rounding issues in position calculations

### Debugging
```typescript
// Add logging
console.log('Entity Y:', entity.y);
console.log('Velocity Y:', entity.velocityY);
console.log('Colliding tiles:', tiles);

// Visualize collision box
ctx.strokeStyle = 'red';
ctx.strokeRect(box.x, box.y, box.width, box.height);
```

### Solutions
```typescript
// Solution 1: Cap maximum velocity
const MAX_VELOCITY = 500;  // pixels per second
entity.velocityY = Math.min(entity.velocityY, MAX_VELOCITY);

// Solution 2: Use swept collision for fast objects
const collision = sweepAABB(entityBox, velocityX, velocityY, tileBox);

// Solution 3: Substep physics for very fast objects
const substeps = Math.ceil(Math.abs(velocityY) / tileSize);
for (let i = 0; i < substeps; i++) {
  entity.y += velocityY / substeps;
  resolveCollision(entity);
}
```

---

## Bug #2: Entity Stuck in Wall

### Symptoms
- Entity can't move after collision
- Entity jitters in place
- Entity embedded in solid tile

### Causes
1. **Insufficient separation** - Not pushed far enough out of tile
2. **Collision loop** - Resolving collision causes new collision
3. **Rounding errors** - Position not properly rounded after separation

### Debugging
```typescript
// Check overlap amount
const overlap = getOverlap(entityBox, tileBox);
console.log('Overlap:', overlap);

// Check separation
const separation = calculateSeparation(entityBox, tileBox);
console.log('Separation:', separation);

// Verify position after resolution
console.log('Entity pos before:', entity.x, entity.y);
resolveCollision(entity);
console.log('Entity pos after:', entity.x, entity.y);
```

### Solutions
```typescript
// Solution 1: Add small epsilon to separation
const EPSILON = 0.01;
entity.x += separation + EPSILON * Math.sign(separation);

// Solution 2: Check for stuck condition
if (Math.abs(separation) < 0.1) {
  // Very small separation, force entity out
  entity.x += Math.sign(separation);
}

// Solution 3: Don't re-check same tiles
const resolvedTiles = new Set<string>();

function resolve(entity) {
  const tiles = getTilesInAABB(entity.getCollisionBox());
  
  for (const tile of tiles) {
    const key = `${tile.x},${tile.y}`;
    if (resolvedTiles.has(key)) continue;
    
    // Resolve...
    resolvedTiles.add(key);
  }
}
```

---

## Bug #3: Can't Jump Through Platforms

### Symptoms
- Entity collides with platform from below
- Can't jump up through one-way platforms
- Platform blocks from all sides

### Causes
1. **Missing velocity check** - Not checking if moving downward
2. **Wrong threshold** - "Was above" check is too strict
3. **Missing previous position** - Can't determine approach direction

### Debugging
```typescript
// Log platform collision details
console.log('Velocity Y:', velocityY);
console.log('Was above:', wasAbove);
console.log('Entity bottom:', entityBottom);
console.log('Platform top:', platformTop);
console.log('Horizontal overlap:', horizontalOverlap);
```

### Solutions
```typescript
// Solution 1: Only check when moving down
if (velocityY <= 0) {
  return null;  // No collision when moving up/stationary
}

// Solution 2: Calculate previous position
const prevBottom = entityBottom - velocityY;
const wasAbove = prevBottom <= platformTop + 4;  // 4px threshold

// Solution 3: Add grace period
if (wasAbove && entityBottom >= platformTop && entityBottom < platformTop + 8) {
  // Land on platform
}
```

---

## Bug #4: Sliding on Slopes

### Symptoms
- Entity slides down slopes when stationary
- Slope collision feels "slippery"
- Entity doesn't stay on slope surface

### Causes
1. **Gravity applied after slope resolution** - Constantly pushes entity down
2. **Wrong slope height calculation** - Entity not aligned to slope
3. **Missing friction** - No counterforce to gravity on slopes

### Debugging
```typescript
// Visualize slope height
const slopeHeight = getSlopeHeightAt(tileX, tileY, entityCenterX);
ctx.fillStyle = 'yellow';
ctx.fillRect(entityCenterX - 2, slopeHeight - 2, 4, 4);

// Log slope collision
console.log('On slope:', isOnSlope);
console.log('Slope height:', slopeHeight);
console.log('Entity bottom:', entityBottom);
```

### Solutions
```typescript
// Solution 1: Check slope before applying gravity
if (isOnSlope(entity)) {
  // Reduce or remove gravity
  entity.velocityY = Math.min(entity.velocityY, 0);
}

// Solution 2: Apply slope friction
if (isOnSlope(entity)) {
  const SLOPE_FRICTION = 0.9;
  entity.velocityX *= SLOPE_FRICTION;
  entity.velocityY = 0;
}

// Solution 3: Snap to slope surface
if (isOnSlope(entity) && Math.abs(entity.velocityY) < 50) {
  const slopeHeight = getSlopeHeightAt(tileX, tileY, entityCenterX);
  entity.y = slopeHeight - entity.collisionHeight;
  entity.velocityY = 0;
}
```

---

## Bug #5: Wrong Collision Direction

### Symptoms
- Entity reports wrong collision side (e.g., "onGround" when hitting wall)
- Collision response feels wrong
- Entity bounces in unexpected directions

### Causes
1. **Wrong axis determination** - Comparing wrong overlap values
2. **Center calculation error** - Using wrong entity point
3. **Axis resolution order** - Y resolved before X

### Debugging
```typescript
// Visualize collision normals
const side = getTouchingSide(entityBox, tileBox);
console.log('Collision side:', side);

// Draw collision direction
ctx.strokeStyle = 'blue';
ctx.beginPath();
ctx.moveTo(entityCenterX, entityCenterY);
ctx.lineTo(entityCenterX + normalX * 20, entityCenterY + normalY * 20);
ctx.stroke();
```

### Solutions
```typescript
// Solution 1: Use smallest overlap
const overlap = getOverlap(entityBox, tileBox);

if (overlap.x < overlap.y) {
  // X-axis collision (left/right wall)
  side = (entityCenter.x < tileCenter.x) ? 'right' : 'left';
} else {
  // Y-axis collision (floor/ceiling)
  side = (entityCenter.y < tileCenter.y) ? 'bottom' : 'top';
}

// Solution 2: Compare centers correctly
const entityCenter = {
  x: entityBox.x + entityBox.width / 2,
  y: entityBox.y + entityBox.height / 2
};

const tileCenter = {
  x: tileBox.x + tileBox.width / 2,
  y: tileBox.y + tileBox.height / 2
};

// Solution 3: Always resolve X before Y
entity.x += velocityX;
const xResult = resolveXCollision(entity);

entity.y += velocityY;
const yResult = resolveYCollision(entity);
```

---

## Bug #6: Tile Boundary Issues

### Symptoms
- Entity collides with empty tiles
- Collision happens one tile off
- Entity can walk on air near tile edges

### Causes
1. **Rounding errors** - Wrong tile calculated for fractional positions
2. **Inclusive end range** - Checking one too many tiles
3. **Edge case at exact tile boundary** - Position exactly on tile edge

### Debugging
```typescript
// Log tile coordinates
console.log('Entity X:', entityX);
console.log('Tile X:', Math.floor(entityX / tileSize));
console.log('Tiles in range:', startTileX, 'to', endTileX);

// Visualize checked tiles
for (let x = startTileX; x <= endTileX; x++) {
  for (let y = startTileY; y <= endTileY; y++) {
    ctx.strokeStyle = 'cyan';
    ctx.strokeRect(x * tileSize, y * tileSize, tileSize, tileSize);
  }
}
```

### Solutions
```typescript
// Solution 1: Subtract epsilon from right/bottom edges
const startX = Math.floor(aabb.x / tileSize);
const endX = Math.floor((aabb.x + aabb.width - 0.01) / tileSize);
const startY = Math.floor(aabb.y / tileSize);
const endY = Math.floor((aabb.y + aabb.height - 0.01) / tileSize);

// Solution 2: Clamp to valid range
const endX = Math.min(
  Math.floor((aabb.x + aabb.width - 0.01) / tileSize),
  mapWidth - 1
);

// Solution 3: Handle exact boundaries explicitly
if ((aabb.x + aabb.width) % tileSize === 0) {
  endX--;  // Don't include next tile
}
```

---

## Bug #7: Jittery Movement on Ground

### Symptoms
- Entity vibrates/jitters when standing still
- Y position fluctuates by small amounts
- Entity not smoothly resting on ground

### Causes
1. **Gravity constantly applied** - Pushing into ground every frame
2. **Imprecise ground detection** - Alternating between grounded/airborne
3. **Floating point accumulation** - Small errors add up

### Debugging
```typescript
// Log position changes
let prevY = entity.y;
console.log('Y change:', entity.y - prevY);
console.log('Grounded:', isGrounded);
console.log('Velocity Y:', entity.velocityY);
```

### Solutions
```typescript
// Solution 1: Don't apply gravity when grounded
if (!isGrounded(entity)) {
  entity.velocityY += GRAVITY * deltaTime;
}

// Solution 2: Add grounded threshold
function isGrounded(entity): boolean {
  const checkBox = {
    x: entity.x,
    y: entity.y + entity.height,
    width: entity.width,
    height: 3  // Check 3 pixels below
  };
  return checkSolid(checkBox);
}

// Solution 3: Round position when on ground
if (isGrounded(entity) && Math.abs(entity.velocityY) < 1) {
  entity.velocityY = 0;
  entity.y = Math.round(entity.y);
}
```

---

## Bug #8: Can't Drop Through Platforms

### Symptoms
- Drop-through input doesn't work
- Entity collides with platform immediately after dropping
- Platforms act like solid tiles

### Causes
1. **Missing drop-through timer** - Re-colliding same frame
2. **Wrong input combination** - Not checking Down + Jump together
3. **No platform check bypass** - Not skipping platform collision

### Debugging
```typescript
// Log drop-through state
console.log('Can drop:', canDropThrough(entity));
console.log('Drop timer:', dropThroughTimer);
console.log('Input down:', input.down);
console.log('Input jump:', input.jump);
```

### Solutions
```typescript
// Solution 1: Add drop-through timer
let dropThroughTimer = 0;

if (input.down && input.jump && canDropThrough(entity)) {
  entity.y += 12;  // Move below platform
  dropThroughTimer = 0.2;  // 200ms grace period
}

// Update timer
if (dropThroughTimer > 0) {
  dropThroughTimer -= deltaTime;
}

// Solution 2: Skip platform check during drop
function checkPlatform(entity, velocityY) {
  if (dropThroughTimer > 0) {
    return null;  // Ignore platforms
  }
  
  // ... normal platform check
}

// Solution 3: Require both keys pressed same frame
const dropInput = input.down && input.jump && !prevInput.jump;
```

---

## Debugging Tools

### Visual Collision Debugger
```typescript
class CollisionDebugger {
  drawEntityBox(ctx: CanvasRenderingContext2D, entity: Entity): void {
    const box = entity.getCollisionBox();
    
    // Draw entity sprite area
    ctx.strokeStyle = 'blue';
    ctx.strokeRect(entity.x, entity.y, entity.width, entity.height);
    
    // Draw collision box
    ctx.strokeStyle = 'lime';
    ctx.lineWidth = 2;
    ctx.strokeRect(box.x, box.y, box.width, box.height);
    
    // Draw center point
    const center = CollisionBox.getCenter(box);
    ctx.fillStyle = 'red';
    ctx.fillRect(center.x - 2, center.y - 2, 4, 4);
  }

  drawCollisionTiles(ctx: CanvasRenderingContext2D, tiles: any[]): void {
    for (const tile of tiles) {
      const x = tile.x * this.tileSize;
      const y = tile.y * this.tileSize;
      
      if (TileCollisionProperties.isSolid(tile.type)) {
        ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';
      } else if (TileCollisionProperties.isPlatform(tile.type)) {
        ctx.fillStyle = 'rgba(0, 255, 0, 0.3)';
      } else {
        continue;
      }
      
      ctx.fillRect(x, y, this.tileSize, this.tileSize);
    }
  }

  drawCollisionInfo(ctx: CanvasRenderingContext2D, result: CollisionResult): void {
    ctx.fillStyle = 'white';
    ctx.font = '12px monospace';
    
    let y = 10;
    const info = [
      `Collided: ${result.collided}`,
      `Ground: ${result.onGround}`,
      `Ceiling: ${result.onCeiling}`,
      `Left Wall: ${result.onLeftWall}`,
      `Right Wall: ${result.onRightWall}`
    ];
    
    for (const line of info) {
      ctx.fillText(line, 10, y);
      y += 15;
    }
  }
}
```

### Collision Test Suite
```typescript
class CollisionTests {
  static runTests(): void {
    console.log('Running collision tests...');
    
    this.testAABBOverlap();
    this.testTileConversion();
    this.testGroundCollision();
    this.testPlatformCollision();
    this.testSlopeCollision();
    
    console.log('All tests passed!');
  }

  static testAABBOverlap(): void {
    const a = { x: 0, y: 0, width: 10, height: 10 };
    const b = { x: 5, y: 5, width: 10, height: 10 };
    const c = { x: 20, y: 20, width: 10, height: 10 };
    
    console.assert(CollisionBox.overlaps(a, b), 'Overlapping boxes');
    console.assert(!CollisionBox.overlaps(a, c), 'Non-overlapping boxes');
  }

  static testTileConversion(): void {
    const map = new CollisionMap(20, 15, 32);
    
    const tile = map.worldToTile(96, 64);
    console.assert(tile.x === 3 && tile.y === 2, 'World to tile');
    
    const world = map.tileToWorld(3, 2);
    console.assert(world.x === 96 && world.y === 64, 'Tile to world');
  }

  // More tests...
}
```

---

## Performance Profiling

```typescript
class CollisionProfiler {
  private times: Map<string, number> = new Map();

  start(label: string): void {
    this.times.set(label, performance.now());
  }

  end(label: string): void {
    const start = this.times.get(label);
    if (start) {
      const duration = performance.now() - start;
      console.log(`${label}: ${duration.toFixed(2)}ms`);
    }
  }

  profile(entity: Entity): void {
    this.start('getTiles');
    const tiles = detector.getTilesInAABB(entity.getCollisionBox());
    this.end('getTiles');

    this.start('checkSolid');
    const solid = detector.checkSolidCollision(entity.getCollisionBox());
    this.end('checkSolid');

    this.start('resolve');
    resolver.resolveCollision(entity, vx, vy);
    this.end('resolve');
  }
}
```

---

## Common Fixes Checklist

- [ ] Capped maximum velocity
- [ ] Resolved X-axis before Y-axis
- [ ] Subtracted 0.01 from tile range end
- [ ] Added epsilon to collision separation
- [ ] Checked velocity direction for platforms
- [ ] Added drop-through timer
- [ ] Disabled gravity when grounded
- [ ] Used entity center for comparisons
- [ ] Handled exact tile boundaries
- [ ] Rounded positions when stationary

---

## Next Steps

Check `j-faq.md` for frequently asked questions about collision detection and optimization techniques.
