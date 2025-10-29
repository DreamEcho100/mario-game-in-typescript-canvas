# Topic 02: Collision Maps - Exercises

## Instructions

These exercises will help you practice implementing collision detection and response systems. Work through them progressively, as each builds on previous concepts.

---

## Exercise 1: Basic Collision Map

**Objective**: Create a simple collision map and implement tile coordinate conversion.

**Tasks**:
1. Create a `CollisionMap` class with a 2D array of tile types
2. Implement `worldToTile()` and `tileToWorld()` conversion methods
3. Implement `getTile()` and `setTile()` methods
4. Create a test map with solid and empty tiles

**Requirements**:
- Map should be 20x15 tiles
- Tile size should be 32 pixels
- Handle out-of-bounds coordinates gracefully

**Test Cases**:
```typescript
// Test coordinate conversion
const map = new CollisionMap(20, 15, 32);
const tile = map.worldToTile(96, 64);  // Should return {x: 3, y: 2}
const world = map.tileToWorld(3, 2);   // Should return {x: 96, y: 64}

// Test setting/getting tiles
map.setTile(5, 5, TileType.SOLID);
console.log(map.getTile(5, 5));  // Should output TileType.SOLID
```

---

## Exercise 2: AABB Collision Detection

**Objective**: Implement axis-aligned bounding box collision detection.

**Tasks**:
1. Create an `AABB` interface with x, y, width, height
2. Implement `overlaps()` function to check if two AABBs intersect
3. Implement `getOverlap()` to calculate overlap amount
4. Implement `getTouchingSide()` to determine collision direction

**Requirements**:
- Handle edge cases (non-overlapping boxes)
- Calculate minimum separation distance
- Return accurate collision normals

**Test Cases**:
```typescript
const boxA = { x: 10, y: 10, width: 20, height: 20 };
const boxB = { x: 25, y: 15, width: 20, height: 20 };

console.log(CollisionBox.overlaps(boxA, boxB));  // true
console.log(CollisionBox.getOverlap(boxA, boxB)); // {x: 5, y: 15}
console.log(CollisionBox.getTouchingSide(boxA, boxB)); // 'right'
```

---

## Exercise 3: Finding Overlapping Tiles

**Objective**: Implement a function to find all tiles that an AABB overlaps.

**Tasks**:
1. Create a `TileCollisionDetector` class
2. Implement `getTilesInAABB()` to find overlapping tiles
3. Optimize to avoid checking unnecessary tiles
4. Handle entities that span multiple tiles

**Requirements**:
- Only check tiles within AABB bounds
- Return tile coordinates and types
- Handle fractional tile positions correctly

**Test Cases**:
```typescript
const detector = new TileCollisionDetector(collisionMap, 32);
const aabb = { x: 48, y: 48, width: 40, height: 40 };
const tiles = detector.getTilesInAABB(aabb);

// Should return tiles at (1,1), (2,1), (1,2), (2,2)
console.log(tiles);
```

---

## Exercise 4: Solid Tile Collision

**Objective**: Detect collisions between an entity and solid tiles.

**Tasks**:
1. Implement `checkSolidCollision()` to detect any solid tile collision
2. Implement `getSolidCollisions()` to get all solid tiles colliding with entity
3. Create helper function `getTileAABB()` to get tile bounding box
4. Test with various entity positions

**Requirements**:
- Check only solid tiles (ignore empty/platform tiles)
- Return tile coordinates and AABBs
- Optimize by checking only nearby tiles

**Test Cases**:
```typescript
// Create a map with solid floor
for (let x = 0; x < 20; x++) {
  map.setTile(x, 14, TileType.SOLID);
}

// Entity standing on floor
const entity = new Entity(100, 416, 16, 16);
console.log(detector.checkSolidCollision(entity.getCollisionBox())); // true

// Entity in air
entity.y = 100;
console.log(detector.checkSolidCollision(entity.getCollisionBox())); // false
```

---

## Exercise 5: Collision Resolution (X-Axis)

**Objective**: Resolve horizontal collisions by separating entity from tiles.

**Tasks**:
1. Create a `CollisionResolver` class
2. Implement collision resolution for X-axis only
3. Calculate minimum separation distance
4. Update entity position to resolve collision

**Requirements**:
- Move entity out of solid tiles
- Find the smallest separation needed
- Detect left vs right wall collision

**Test Cases**:
```typescript
// Create solid wall
for (let y = 0; y < 15; y++) {
  map.setTile(10, y, TileType.SOLID);
}

// Move entity into wall from left
const entity = new Entity(310, 100, 16, 16);
entity.velocityX = 5;

const result = resolver.resolveAxisCollision(entity, 'x');
console.log(result.onRightWall);  // true
console.log(entity.x);  // Should be pushed back to 304 (before wall)
```

---

## Exercise 6: Collision Resolution (Y-Axis)

**Objective**: Resolve vertical collisions by separating entity from tiles.

**Tasks**:
1. Implement collision resolution for Y-axis
2. Detect ground vs ceiling collision
3. Stop entity's vertical velocity on collision
4. Handle falling onto solid blocks

**Requirements**:
- Separate entity from solid tiles vertically
- Determine if collision is from above or below
- Set appropriate collision flags (onGround, onCeiling)

**Test Cases**:
```typescript
// Create solid floor
for (let x = 0; x < 20; x++) {
  map.setTile(x, 14, TileType.SOLID);
}

// Drop entity onto floor
const entity = new Entity(100, 440, 16, 16);
entity.velocityY = 10;

const result = resolver.resolveAxisCollision(entity, 'y');
console.log(result.onGround);  // true
console.log(entity.y);  // Should be 432 (resting on floor)
console.log(entity.velocityY);  // Should be 0
```

---

## Exercise 7: Full Collision Resolution

**Objective**: Combine X and Y axis collision resolution into a complete system.

**Tasks**:
1. Implement `resolveCollision()` that handles both axes
2. Resolve X-axis first, then Y-axis
3. Return comprehensive collision result
4. Stop velocity when collision occurs

**Requirements**:
- Process X and Y separately (order matters!)
- Return all collision flags in result
- Handle corner collisions correctly

**Test Cases**:
```typescript
// Create a corner
map.setTile(10, 10, TileType.SOLID);

// Move entity into corner diagonally
const entity = new Entity(315, 315, 16, 16);
const result = resolver.resolveCollision(entity, 5, 5);

console.log(result.collidedX);  // true
console.log(result.collidedY);  // true
console.log(entity.velocityX);  // 0
console.log(entity.velocityY);  // 0
```

---

## Exercise 8: One-Way Platforms

**Objective**: Implement one-way platforms that can be jumped through from below.

**Tasks**:
1. Create a `PlatformCollision` class
2. Implement `checkPlatformCollision()` for top-only collision
3. Check if entity is coming from above platform
4. Allow passing through from below and sides

**Requirements**:
- Only collide when moving downward
- Check if entity was above platform in previous frame
- Verify horizontal overlap with platform
- Find closest platform if multiple overlap

**Test Cases**:
```typescript
// Create platform
map.setTile(5, 10, TileType.PLATFORM);

// Jump up through platform (should pass through)
const entity = new Entity(160, 330, 16, 16);
entity.velocityY = -10;
const result = platformCollision.checkPlatformCollision(entity, -10);
console.log(result);  // null (no collision when moving up)

// Fall down onto platform (should land on it)
entity.y = 310;
entity.velocityY = 10;
const result2 = platformCollision.checkPlatformCollision(entity, 10);
console.log(result2.collided);  // true
console.log(result2.platformY);  // 320 (top of platform)
```

---

## Exercise 9: Drop Through Platforms

**Objective**: Allow player to drop through platforms by pressing down.

**Tasks**:
1. Implement `canDropThrough()` to check if entity is on platform
2. Implement `dropThroughPlatform()` to move entity below platform
3. Add input handling for drop-through action
4. Temporarily disable platform collision

**Requirements**:
- Check if any platform tiles are below entity
- Move entity down past platform
- Prevent immediate re-collision with platform

**Test Cases**:
```typescript
// Create platform
map.setTile(5, 10, TileType.PLATFORM);

// Entity standing on platform
const entity = new Entity(160, 308, 16, 16);
console.log(platformCollision.canDropThrough(entity));  // true

// Drop through
platformCollision.dropThroughPlatform(entity);
console.log(entity.y);  // Should be > 320 (below platform)
```

---

## Exercise 10: Slope Collision Detection

**Objective**: Implement collision detection for 45-degree slopes.

**Tasks**:
1. Create a `SlopeCollision` class
2. Implement `getSlopeHeightAt()` to calculate slope height at X position
3. Support left-rising and right-rising slopes
4. Handle entity position on slopes

**Requirements**:
- Calculate height based on X position within tile
- Support both slope directions
- Return world coordinates for slope height

**Test Cases**:
```typescript
// Create left-rising slope (rises from left to right)
map.setTile(5, 10, TileType.SLOPE_LEFT);

// Get height at various X positions
const slopeCollision = new SlopeCollision(map, 32);
const height1 = slopeCollision.getSlopeHeightAt(5, 10, 160);  // Left edge
const height2 = slopeCollision.getSlopeHeightAt(5, 10, 176);  // Middle
const height3 = slopeCollision.getSlopeHeightAt(5, 10, 191);  // Right edge

console.log(height1);  // 352 (bottom)
console.log(height2);  // 336 (middle)
console.log(height3);  // 320 (top)
```

---

## Exercise 11: Slope Collision Resolution

**Objective**: Resolve entity collision with slopes to keep entity on surface.

**Tasks**:
1. Implement `resolveSlopeCollision()` to adjust entity height
2. Check if entity is below slope surface
3. Push entity up to slope surface
4. Stop vertical velocity

**Requirements**:
- Use entity's center X position
- Calculate correct slope height
- Only adjust if entity is intersecting slope
- Set entity exactly on slope surface

**Test Cases**:
```typescript
// Create slope
map.setTile(5, 10, TileType.SLOPE_LEFT);

// Entity intersecting slope
const entity = new Entity(168, 340, 16, 16);
const resolved = slopeCollision.resolveSlopeCollision(entity);

console.log(resolved);  // true
console.log(entity.y);  // Adjusted to be on slope surface
console.log(entity.velocityY);  // 0
```

---

## Exercise 12: Hazard Detection

**Objective**: Detect when entity touches hazardous tiles (spikes, lava).

**Tasks**:
1. Add hazard tile type to collision map
2. Implement `checkHazards()` to detect hazard collision
3. Return damage amount
4. Support multiple hazard types

**Requirements**:
- Check for tiles with damage property > 0
- Don't require precise collision (touching is enough)
- Return information about hazard type

**Test Cases**:
```typescript
// Create hazard
map.setTile(5, 10, TileType.HAZARD);

// Entity touching hazard
const entity = new Entity(160, 320, 16, 16);
const hazards = collisionSystem.checkHazards(entity);

console.log(hazards.length);  // 1
console.log(hazards[0].damage);  // 1
console.log(hazards[0].tileType);  // TileType.HAZARD
```

---

## Bonus Exercises

### Bonus 1: Swept AABB Collision

Implement swept collision detection for fast-moving objects to prevent tunneling through thin walls.

### Bonus 2: Friction System

Implement surface friction that affects entity movement. Ice tiles should be slippery, normal tiles should have standard friction.

### Bonus 3: Conveyor Belts

Add conveyor belt tiles that move entities horizontally when standing on them.

### Bonus 4: Moving Platforms

Implement moving platforms that entities can ride. Platforms should carry entities with them.

### Bonus 5: Collision Layers

Add support for multiple collision layers, allowing entities to pass through certain layers but collide with others.

---

## Testing Your Implementation

Create a test scene with:
- Solid ground and walls
- Floating platforms
- Slopes
- Hazards
- Ice blocks

Test that Mario can:
- Walk on solid ground
- Jump and land correctly
- Hit his head on ceilings
- Collide with walls
- Jump up through platforms
- Drop through platforms
- Walk smoothly up slopes
- Take damage from hazards
- Slide on ice

---

## Next Steps

Once you've completed these exercises, check your solutions against `c-solutions.md` and review the quick reference in `d-notes.md`.
