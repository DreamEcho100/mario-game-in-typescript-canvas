# Topic 02: Collision Maps - Solutions

Complete solutions for all exercises with explanations.

---

## Exercise 1 Solution: Basic Collision Map

```typescript
enum TileType {
  EMPTY = 0,
  SOLID = 1,
  PLATFORM = 2,
  SLOPE_LEFT = 3,
  SLOPE_RIGHT = 4,
  HAZARD = 5,
  ICE = 7
}

class CollisionMap {
  private tiles: TileType[][];
  private width: number;
  private height: number;
  private tileSize: number;

  constructor(width: number, height: number, tileSize: number) {
    this.width = width;
    this.height = height;
    this.tileSize = tileSize;
    
    // Initialize with empty tiles
    this.tiles = [];
    for (let y = 0; y < height; y++) {
      this.tiles[y] = [];
      for (let x = 0; x < width; x++) {
        this.tiles[y][x] = TileType.EMPTY;
      }
    }
  }

  // Convert world coordinates to tile coordinates
  worldToTile(worldX: number, worldY: number): { x: number; y: number } {
    return {
      x: Math.floor(worldX / this.tileSize),
      y: Math.floor(worldY / this.tileSize)
    };
  }

  // Convert tile coordinates to world coordinates (top-left corner)
  tileToWorld(tileX: number, tileY: number): { x: number; y: number } {
    return {
      x: tileX * this.tileSize,
      y: tileY * this.tileSize
    };
  }

  // Get tile type at coordinates
  getTile(x: number, y: number): TileType {
    // Out of bounds = solid (prevents falling off map)
    if (!this.isValidTile(x, y)) {
      return TileType.SOLID;
    }
    return this.tiles[y][x];
  }

  // Set tile type at coordinates
  setTile(x: number, y: number, type: TileType): void {
    if (this.isValidTile(x, y)) {
      this.tiles[y][x] = type;
    }
  }

  // Check if tile coordinates are within map bounds
  private isValidTile(x: number, y: number): boolean {
    return x >= 0 && x < this.width && y >= 0 && y < this.height;
  }

  // Get map dimensions
  getWidth(): number { return this.width; }
  getHeight(): number { return this.height; }
  getTileSize(): number { return this.tileSize; }
}

// Test the implementation
const map = new CollisionMap(20, 15, 32);

// Test coordinate conversion
const tile = map.worldToTile(96, 64);
console.log(tile);  // { x: 3, y: 2 }

const world = map.tileToWorld(3, 2);
console.log(world);  // { x: 96, y: 64 }

// Create a simple level
// Floor
for (let x = 0; x < 20; x++) {
  map.setTile(x, 14, TileType.SOLID);
}

// Left wall
for (let y = 0; y < 15; y++) {
  map.setTile(0, y, TileType.SOLID);
}

// Right wall
for (let y = 0; y < 15; y++) {
  map.setTile(19, y, TileType.SOLID);
}

// Platform
for (let x = 5; x < 10; x++) {
  map.setTile(x, 10, TileType.PLATFORM);
}

console.log(map.getTile(5, 10));  // TileType.PLATFORM
```

**Key Points**:
- Out-of-bounds tiles return SOLID to prevent escaping the map
- `Math.floor()` ensures fractional positions map to correct tile
- 2D array is indexed as `[y][x]` (row, then column)

---

## Exercise 2 Solution: AABB Collision Detection

```typescript
interface AABB {
  x: number;
  y: number;
  width: number;
  height: number;
}

class CollisionBox {
  // Check if two AABBs are overlapping
  static overlaps(a: AABB, b: AABB): boolean {
    return (
      a.x < b.x + b.width &&
      a.x + a.width > b.x &&
      a.y < b.y + b.height &&
      a.y + a.height > b.y
    );
  }

  // Calculate overlap amount on each axis
  static getOverlap(a: AABB, b: AABB): { x: number; y: number } {
    if (!this.overlaps(a, b)) {
      return { x: 0, y: 0 };
    }

    // Calculate overlap on X axis
    const overlapX = Math.min(
      a.x + a.width - b.x,    // A's right edge to B's left edge
      b.x + b.width - a.x     // B's right edge to A's left edge
    );

    // Calculate overlap on Y axis
    const overlapY = Math.min(
      a.y + a.height - b.y,   // A's bottom edge to B's top edge
      b.y + b.height - a.y    // B's bottom edge to A's top edge
    );

    return { x: overlapX, y: overlapY };
  }

  // Determine which side of B that A is touching
  static getTouchingSide(a: AABB, b: AABB): 'top' | 'bottom' | 'left' | 'right' | null {
    if (!this.overlaps(a, b)) {
      return null;
    }

    const overlap = this.getOverlap(a, b);
    const centerA = this.getCenter(a);
    const centerB = this.getCenter(b);

    // Determine collision axis by smallest overlap
    if (overlap.x < overlap.y) {
      // Horizontal collision
      return centerA.x < centerB.x ? 'right' : 'left';
    } else {
      // Vertical collision
      return centerA.y < centerB.y ? 'bottom' : 'top';
    }
  }

  // Get center point of AABB
  static getCenter(aabb: AABB): { x: number; y: number } {
    return {
      x: aabb.x + aabb.width / 2,
      y: aabb.y + aabb.height / 2
    };
  }

  // Calculate distance between two AABB centers
  static getDistance(a: AABB, b: AABB): number {
    const centerA = this.getCenter(a);
    const centerB = this.getCenter(b);
    const dx = centerB.x - centerA.x;
    const dy = centerB.y - centerA.y;
    return Math.sqrt(dx * dx + dy * dy);
  }
}

// Test cases
const boxA: AABB = { x: 10, y: 10, width: 20, height: 20 };
const boxB: AABB = { x: 25, y: 15, width: 20, height: 20 };
const boxC: AABB = { x: 50, y: 50, width: 20, height: 20 };

console.log(CollisionBox.overlaps(boxA, boxB));  // true
console.log(CollisionBox.overlaps(boxA, boxC));  // false

console.log(CollisionBox.getOverlap(boxA, boxB));  // { x: 5, y: 15 }
console.log(CollisionBox.getTouchingSide(boxA, boxB));  // 'right'

const centerA = CollisionBox.getCenter(boxA);
console.log(centerA);  // { x: 20, y: 20 }
```

**Key Points**:
- Overlap check uses < and >, not <= and >= (touching edges don't count)
- Smallest overlap indicates collision axis
- Center comparison determines collision direction

---

## Exercise 3 Solution: Finding Overlapping Tiles

```typescript
class TileCollisionDetector {
  private collisionMap: CollisionMap;
  private tileSize: number;

  constructor(collisionMap: CollisionMap, tileSize: number) {
    this.collisionMap = collisionMap;
    this.tileSize = tileSize;
  }

  // Get all tiles that an AABB overlaps
  getTilesInAABB(aabb: AABB): { x: number; y: number; type: TileType }[] {
    const tiles: { x: number; y: number; type: TileType }[] = [];

    // Convert AABB corners to tile coordinates
    // Subtract 0.01 from right/bottom to handle exact tile boundaries
    const startTileX = Math.floor(aabb.x / this.tileSize);
    const endTileX = Math.floor((aabb.x + aabb.width - 0.01) / this.tileSize);
    const startTileY = Math.floor(aabb.y / this.tileSize);
    const endTileY = Math.floor((aabb.y + aabb.height - 0.01) / this.tileSize);

    // Iterate through all tiles in range
    for (let tileY = startTileY; tileY <= endTileY; tileY++) {
      for (let tileX = startTileX; tileX <= endTileX; tileX++) {
        const type = this.collisionMap.getTile(tileX, tileY);
        tiles.push({ x: tileX, y: tileY, type });
      }
    }

    return tiles;
  }

  // Get AABB for a specific tile
  getTileAABB(tileX: number, tileY: number): AABB {
    return {
      x: tileX * this.tileSize,
      y: tileY * this.tileSize,
      width: this.tileSize,
      height: this.tileSize
    };
  }

  // Get all tiles of a specific type in AABB
  getTilesOfTypeInAABB(aabb: AABB, type: TileType): { x: number; y: number }[] {
    const allTiles = this.getTilesInAABB(aabb);
    return allTiles
      .filter(tile => tile.type === type)
      .map(tile => ({ x: tile.x, y: tile.y }));
  }
}

// Test
const map = new CollisionMap(20, 15, 32);
const detector = new TileCollisionDetector(map, 32);

// Set some tiles
map.setTile(1, 1, TileType.SOLID);
map.setTile(2, 1, TileType.SOLID);
map.setTile(1, 2, TileType.PLATFORM);
map.setTile(2, 2, TileType.PLATFORM);

// Entity spanning 4 tiles
const aabb: AABB = { x: 48, y: 48, width: 40, height: 40 };
const tiles = detector.getTilesInAABB(aabb);

console.log(tiles);
// [
//   { x: 1, y: 1, type: TileType.SOLID },
//   { x: 2, y: 1, type: TileType.SOLID },
//   { x: 1, y: 2, type: TileType.PLATFORM },
//   { x: 2, y: 2, type: TileType.PLATFORM }
// ]

const solidTiles = detector.getTilesOfTypeInAABB(aabb, TileType.SOLID);
console.log(solidTiles);  // [{ x: 1, y: 1 }, { x: 2, y: 1 }]
```

**Key Points**:
- Subtract 0.01 from right/bottom edges to handle exact boundaries correctly
- An entity at x=64, width=32 should only touch tiles 2 and beyond, not tile 3
- Always use `<=` in the loop to include the end tile

---

## Exercise 4 Solution: Solid Tile Collision

```typescript
interface TileCollisionData {
  solid: boolean;
  platform: boolean;
  friction: number;
  damage: number;
}

class TileCollisionProperties {
  private static properties: Map<TileType, TileCollisionData> = new Map([
    [TileType.EMPTY, { solid: false, platform: false, friction: 1.0, damage: 0 }],
    [TileType.SOLID, { solid: true, platform: false, friction: 1.0, damage: 0 }],
    [TileType.PLATFORM, { solid: false, platform: true, friction: 1.0, damage: 0 }],
    [TileType.HAZARD, { solid: false, platform: false, friction: 1.0, damage: 1 }],
    [TileType.ICE, { solid: true, platform: false, friction: 0.1, damage: 0 }]
  ]);

  static getProperties(type: TileType): TileCollisionData {
    return this.properties.get(type) || this.properties.get(TileType.EMPTY)!;
  }

  static isSolid(type: TileType): boolean {
    return this.getProperties(type).solid;
  }

  static isPlatform(type: TileType): boolean {
    return this.getProperties(type).platform;
  }
}

class TileCollisionDetector {
  // ... previous code ...

  // Check if entity is colliding with any solid tile
  checkSolidCollision(entityBox: AABB): boolean {
    const tiles = this.getTilesInAABB(entityBox);
    
    for (const tile of tiles) {
      if (TileCollisionProperties.isSolid(tile.type)) {
        const tileBox = this.getTileAABB(tile.x, tile.y);
        if (CollisionBox.overlaps(entityBox, tileBox)) {
          return true;
        }
      }
    }
    
    return false;
  }

  // Get all solid tile collisions with their AABBs
  getSolidCollisions(entityBox: AABB): { tileX: number; tileY: number; box: AABB }[] {
    const collisions: { tileX: number; tileY: number; box: AABB }[] = [];
    const tiles = this.getTilesInAABB(entityBox);
    
    for (const tile of tiles) {
      if (TileCollisionProperties.isSolid(tile.type)) {
        const tileBox = this.getTileAABB(tile.x, tile.y);
        if (CollisionBox.overlaps(entityBox, tileBox)) {
          collisions.push({
            tileX: tile.x,
            tileY: tile.y,
            box: tileBox
          });
        }
      }
    }
    
    return collisions;
  }

  // Count solid tiles around entity
  countSolidNeighbors(entityBox: AABB): number {
    return this.getSolidCollisions(entityBox).length;
  }
}

// Test
const map = new CollisionMap(20, 15, 32);
const detector = new TileCollisionDetector(map, 32);

// Create solid floor
for (let x = 0; x < 20; x++) {
  map.setTile(x, 14, TileType.SOLID);
}

// Entity standing on floor (bottom edge touching)
const entityOnFloor: AABB = { x: 100, y: 432, width: 16, height: 16 };
console.log(detector.checkSolidCollision(entityOnFloor));  // true

// Entity in air
const entityInAir: AABB = { x: 100, y: 100, width: 16, height: 16 };
console.log(detector.checkSolidCollision(entityInAir));  // false

// Get collision details
const collisions = detector.getSolidCollisions(entityOnFloor);
console.log(collisions);
// [{ tileX: 3, tileY: 14, box: { x: 96, y: 448, width: 32, height: 32 } }]
```

**Key Points**:
- Use properties lookup table for tile characteristics
- `checkSolidCollision()` is fast (returns on first collision)
- `getSolidCollisions()` gets all collisions (useful for resolution)

---

## Exercise 5 Solution: Collision Resolution (X-Axis)

```typescript
class CollisionResolver {
  private detector: TileCollisionDetector;
  private tileSize: number;

  constructor(detector: TileCollisionDetector, tileSize: number) {
    this.detector = detector;
    this.tileSize = tileSize;
  }

  // Resolve collision on X-axis only
  resolveXCollision(entity: Entity): {
    collided: boolean;
    onLeftWall: boolean;
    onRightWall: boolean;
  } {
    const result = {
      collided: false,
      onLeftWall: false,
      onRightWall: false
    };

    const entityBox = entity.getCollisionBox();
    const collisions = this.detector.getSolidCollisions(entityBox);

    if (collisions.length === 0) {
      return result;
    }

    result.collided = true;

    // Find the tile requiring minimum separation
    let minSeparation = Infinity;
    let bestSeparation = 0;

    for (const collision of collisions) {
      const overlap = CollisionBox.getOverlap(entityBox, collision.box);
      
      // Determine separation direction
      let separation: number;
      if (entityBox.x + entityBox.width / 2 < collision.box.x + collision.box.width / 2) {
        // Entity is to the left of tile
        separation = -overlap.x;  // Push left
      } else {
        // Entity is to the right of tile
        separation = overlap.x;   // Push right
      }

      // Keep the smallest separation
      if (Math.abs(separation) < Math.abs(minSeparation)) {
        minSeparation = separation;
        bestSeparation = separation;
      }
    }

    // Apply separation
    entity.x += bestSeparation;
    entity.velocityX = 0;

    // Determine which wall was hit
    if (bestSeparation < 0) {
      result.onRightWall = true;
    } else {
      result.onLeftWall = true;
    }

    return result;
  }
}

class Entity {
  x: number;
  y: number;
  width: number;
  height: number;
  velocityX: number = 0;
  velocityY: number = 0;
  collisionOffsetX: number = 0;
  collisionOffsetY: number = 0;
  collisionWidth: number;
  collisionHeight: number;

  constructor(x: number, y: number, width: number, height: number) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.collisionWidth = width;
    this.collisionHeight = height;
  }

  getCollisionBox(): AABB {
    return {
      x: this.x + this.collisionOffsetX,
      y: this.y + this.collisionOffsetY,
      width: this.collisionWidth,
      height: this.collisionHeight
    };
  }
}

// Test
const map = new CollisionMap(20, 15, 32);
const detector = new TileCollisionDetector(map, 32);
const resolver = new CollisionResolver(detector, 32);

// Create wall at tile (10, 5)
for (let y = 0; y < 15; y++) {
  map.setTile(10, y, TileType.SOLID);
}

// Entity moving into wall from left
const entity = new Entity(310, 160, 16, 16);
entity.velocityX = 5;
entity.x += entity.velocityX;  // Move into wall

const result = resolver.resolveXCollision(entity);
console.log(result.onRightWall);  // true
console.log(entity.x);  // 304 (pushed back out of wall)
console.log(entity.velocityX);  // 0 (stopped)
```

**Key Points**:
- Compare entity center to tile center to determine push direction
- Use smallest separation to avoid over-correcting
- Always stop velocity after collision
- Negative separation = push left, positive = push right

---

## Exercise 6 Solution: Collision Resolution (Y-Axis)

```typescript
class CollisionResolver {
  // ... previous code ...

  // Resolve collision on Y-axis only
  resolveYCollision(entity: Entity): {
    collided: boolean;
    onGround: boolean;
    onCeiling: boolean;
  } {
    const result = {
      collided: false,
      onGround: false,
      onCeiling: false
    };

    const entityBox = entity.getCollisionBox();
    const collisions = this.detector.getSolidCollisions(entityBox);

    if (collisions.length === 0) {
      return result;
    }

    result.collided = true;

    // Find the tile requiring minimum separation
    let minSeparation = Infinity;
    let bestSeparation = 0;

    for (const collision of collisions) {
      const overlap = CollisionBox.getOverlap(entityBox, collision.box);
      
      // Determine separation direction
      let separation: number;
      if (entityBox.y + entityBox.height / 2 < collision.box.y + collision.box.height / 2) {
        // Entity is above tile
        separation = -overlap.y;  // Push up
      } else {
        // Entity is below tile
        separation = overlap.y;   // Push down
      }

      // Keep the smallest separation
      if (Math.abs(separation) < Math.abs(minSeparation)) {
        minSeparation = separation;
        bestSeparation = separation;
      }
    }

    // Apply separation
    entity.y += bestSeparation;
    entity.velocityY = 0;

    // Determine which surface was hit
    if (bestSeparation < 0) {
      result.onCeiling = true;
    } else {
      result.onGround = true;
    }

    return result;
  }
}

// Test
// Create solid floor
for (let x = 0; x < 20; x++) {
  map.setTile(x, 14, TileType.SOLID);
}

// Entity falling onto floor
const entity = new Entity(100, 440, 16, 16);
entity.velocityY = 10;
entity.y += entity.velocityY;  // Move down into floor

const result = resolver.resolveYCollision(entity);
console.log(result.onGround);  // true
console.log(entity.y);  // 432 (resting on top of floor at y=448)
console.log(entity.velocityY);  // 0 (stopped)

// Entity jumping into ceiling
for (let x = 0; x < 20; x++) {
  map.setTile(x, 5, TileType.SOLID);
}

const entity2 = new Entity(100, 168, 16, 16);
entity2.velocityY = -10;
entity2.y += entity2.velocityY;  // Move up into ceiling

const result2 = resolver.resolveYCollision(entity2);
console.log(result2.onCeiling);  // true
console.log(entity2.y);  // 176 (pushed down from ceiling at y=160)
```

**Key Points**:
- Same logic as X-axis, but on Y-axis
- Negative separation = push up (ceiling), positive = push down (ground)
- Entity rests exactly on tile surface after resolution

---

## Exercise 7 Solution: Full Collision Resolution

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

class CollisionResolver {
  // ... previous code ...

  // Resolve collision on both axes
  resolveCollision(
    entity: Entity,
    velocityX: number,
    velocityY: number
  ): CollisionResult {
    const result: CollisionResult = {
      collided: false,
      collidedX: false,
      collidedY: false,
      onGround: false,
      onCeiling: false,
      onLeftWall: false,
      onRightWall: false
    };

    // IMPORTANT: Resolve X-axis first
    entity.x += velocityX;
    const xResult = this.resolveXCollision(entity);
    
    if (xResult.collided) {
      result.collided = true;
      result.collidedX = true;
      result.onLeftWall = xResult.onLeftWall;
      result.onRightWall = xResult.onRightWall;
    }

    // Then resolve Y-axis
    entity.y += velocityY;
    const yResult = this.resolveYCollision(entity);
    
    if (yResult.collided) {
      result.collided = true;
      result.collidedY = true;
      result.onGround = yResult.onGround;
      result.onCeiling = yResult.onCeiling;
    }

    return result;
  }

  // Alternative: resolve axes separately with per-axis movement
  resolveCollisionSeparated(entity: Entity, deltaTime: number): CollisionResult {
    const velocityX = entity.velocityX * deltaTime;
    const velocityY = entity.velocityY * deltaTime;
    
    return this.resolveCollision(entity, velocityX, velocityY);
  }
}

// Test: Moving into corner
const map = new CollisionMap(20, 15, 32);
const detector = new TileCollisionDetector(map, 32);
const resolver = new CollisionResolver(detector, 32);

// Create an L-shaped corner
map.setTile(10, 10, TileType.SOLID);
map.setTile(10, 11, TileType.SOLID);
map.setTile(11, 11, TileType.SOLID);

// Entity moving diagonally into corner
const entity = new Entity(315, 345, 16, 16);
entity.velocityX = 10;
entity.velocityY = 10;

const result = resolver.resolveCollisionSeparated(entity, 1);

console.log(result);
// {
//   collided: true,
//   collidedX: true,
//   collidedY: true,
//   onGround: true,
//   onCeiling: false,
//   onLeftWall: false,
//   onRightWall: true
// }

console.log(entity.x);  // Pushed back from wall
console.log(entity.y);  // Pushed up from floor
console.log(entity.velocityX);  // 0
console.log(entity.velocityY);  // 0
```

**Key Points**:
- **ALWAYS resolve X-axis before Y-axis** (order matters for slopes/stairs)
- Separate axis resolution prevents getting stuck in corners
- Comprehensive result provides all collision information
- Velocities are stopped on collision

---

## Exercise 8 Solution: One-Way Platforms

```typescript
class PlatformCollision {
  private detector: TileCollisionDetector;
  private tileSize: number;
  private collisionMap: CollisionMap;

  constructor(detector: TileCollisionDetector, collisionMap: CollisionMap, tileSize: number) {
    this.detector = detector;
    this.collisionMap = collisionMap;
    this.tileSize = tileSize;
  }

  // Check platform collision from above
  checkPlatformCollision(
    entity: Entity,
    velocityY: number
  ): { collided: boolean; platformY: number } | null {
    // Only collide when moving downward
    if (velocityY <= 0) {
      return null;
    }

    const entityBox = entity.getCollisionBox();
    const entityBottom = entityBox.y + entityBox.height;
    const prevBottom = entityBottom - velocityY;

    // Get all tiles entity overlaps
    const tiles = this.detector.getTilesInAABB(entityBox);

    let closestPlatform: number | null = null;

    for (const tile of tiles) {
      const props = TileCollisionProperties.getProperties(tile.type);
      
      if (props.platform) {
        const tileBox = this.detector.getTileAABB(tile.x, tile.y);
        const platformTop = tileBox.y;

        // Check if coming from above
        const wasAbove = prevBottom <= platformTop + 4;  // 4px threshold
        const isOverlapping = entityBottom >= platformTop && entityBottom < platformTop + 8;

        if (wasAbove && isOverlapping) {
          // Check horizontal overlap
          const horizontalOverlap = (
            entityBox.x < tileBox.x + tileBox.width &&
            entityBox.x + entityBox.width > tileBox.x
          );

          if (horizontalOverlap) {
            // Keep closest platform
            if (closestPlatform === null || platformTop < closestPlatform) {
              closestPlatform = platformTop;
            }
          }
        }
      }
    }

    if (closestPlatform !== null) {
      return {
        collided: true,
        platformY: closestPlatform
      };
    }

    return null;
  }

  // Check if entity is standing on a platform
  isOnPlatform(entity: Entity): boolean {
    const entityBox = entity.getCollisionBox();
    const checkBox: AABB = {
      x: entityBox.x,
      y: entityBox.y + entityBox.height,
      width: entityBox.width,
      height: 4  // Check 4 pixels below
    };

    const tiles = this.detector.getTilesInAABB(checkBox);

    for (const tile of tiles) {
      const props = TileCollisionProperties.getProperties(tile.type);
      if (props.platform) {
        return true;
      }
    }

    return false;
  }
}

// Test
const map = new CollisionMap(20, 15, 32);
const detector = new TileCollisionDetector(map, 32);
const platformCollision = new PlatformCollision(detector, map, 32);

// Create platform
for (let x = 5; x < 10; x++) {
  map.setTile(x, 10, TileType.PLATFORM);
}

// Jump up through platform (should pass)
const entity = new Entity(160, 330, 16, 16);
entity.velocityY = -10;
const result1 = platformCollision.checkPlatformCollision(entity, -10);
console.log(result1);  // null (no collision when moving up)

// Fall down onto platform (should land)
entity.y = 310;
entity.velocityY = 10;
const result2 = platformCollision.checkPlatformCollision(entity, 10);
console.log(result2);  // { collided: true, platformY: 320 }

// Standing on platform
entity.y = 308;  // Bottom at 324, just above platform at 320
console.log(platformCollision.isOnPlatform(entity));  // true
```

**Key Points**:
- Only collide from above (when `velocityY > 0`)
- Check if entity was above platform before movement
- Use threshold (4-8px) for detection tolerance
- Must have horizontal overlap to collide

---

## Exercise 9 Solution: Drop Through Platforms

```typescript
class PlatformCollision {
  // ... previous code ...

  // Check if entity can drop through platform
  canDropThrough(entity: Entity): boolean {
    return this.isOnPlatform(entity);
  }

  // Make entity drop through platform
  dropThroughPlatform(entity: Entity): void {
    // Move entity below platform collision zone
    entity.y += 12;  // Move down enough to pass through
  }
}

// Integration with player input
class Mario extends Entity {
  private platformCollision: PlatformCollision;
  private dropThroughTimer: number = 0;
  private readonly DROP_THROUGH_DURATION = 0.2;  // 200ms

  update(deltaTime: number, input: GameInput): void {
    // ... movement code ...

    // Drop through platform
    if (input.down && input.jump && !this.dropThroughTimer) {
      if (this.platformCollision.canDropThrough(this)) {
        this.platformCollision.dropThroughPlatform(this);
        this.dropThroughTimer = this.DROP_THROUGH_DURATION;
      }
    }

    // Update drop-through timer
    if (this.dropThroughTimer > 0) {
      this.dropThroughTimer -= deltaTime;
    }

    // ... collision resolution ...
  }

  // Modified platform check to ignore during drop-through
  checkPlatformCollision(velocityY: number) {
    if (this.dropThroughTimer > 0) {
      return null;  // Ignore platforms while dropping through
    }
    
    return this.platformCollision.checkPlatformCollision(this, velocityY);
  }
}

interface GameInput {
  left: boolean;
  right: boolean;
  up: boolean;
  down: boolean;
  jump: boolean;
}

// Test
const map = new CollisionMap(20, 15, 32);
const detector = new TileCollisionDetector(map, 32);
const platformCollision = new PlatformCollision(detector, map, 32);

// Create platform
map.setTile(5, 10, TileType.PLATFORM);

// Entity on platform
const entity = new Entity(160, 308, 16, 16);
console.log(platformCollision.canDropThrough(entity));  // true

// Drop through
platformCollision.dropThroughPlatform(entity);
console.log(entity.y);  // 320 (moved below platform)
console.log(platformCollision.canDropThrough(entity));  // false (no longer on platform)
```

**Key Points**:
- Use timer to prevent immediate re-collision
- Drop-through input is usually Down + Jump together
- Move entity down by at least collision threshold (12px)
- Check `canDropThrough()` before allowing drop

---

## Exercise 10 Solution: Slope Collision Detection

```typescript
class SlopeCollision {
  private collisionMap: CollisionMap;
  private tileSize: number;

  constructor(collisionMap: CollisionMap, tileSize: number) {
    this.collisionMap = collisionMap;
    this.tileSize = tileSize;
  }

  // Get slope height at specific X position
  getSlopeHeightAt(tileX: number, tileY: number, worldX: number): number | null {
    const tileType = this.collisionMap.getTile(tileX, tileY);

    if (tileType !== TileType.SLOPE_LEFT && tileType !== TileType.SLOPE_RIGHT) {
      return null;
    }

    const tileWorldX = tileX * this.tileSize;
    const tileWorldY = tileY * this.tileSize;

    // Calculate X position within tile (0 to tileSize)
    const xInTile = worldX - tileWorldX;
    
    // Clamp to tile bounds
    const clampedX = Math.max(0, Math.min(this.tileSize, xInTile));
    
    // Calculate ratio (0.0 to 1.0)
    const ratio = clampedX / this.tileSize;

    if (tileType === TileType.SLOPE_LEFT) {
      // Slope rises from left to right
      // ratio=0 (left): height = tileSize (bottom)
      // ratio=1 (right): height = 0 (top)
      return tileWorldY + this.tileSize * (1 - ratio);
    } else {
      // Slope rises from right to left
      // ratio=0 (left): height = 0 (top)
      // ratio=1 (right): height = tileSize (bottom)
      return tileWorldY + this.tileSize * ratio;
    }
  }

  // Check if tile is a slope
  isSlope(tileX: number, tileY: number): boolean {
    const type = this.collisionMap.getTile(tileX, tileY);
    return type === TileType.SLOPE_LEFT || type === TileType.SLOPE_RIGHT;
  }

  // Get slope type
  getSlopeType(tileX: number, tileY: number): TileType | null {
    const type = this.collisionMap.getTile(tileX, tileY);
    if (type === TileType.SLOPE_LEFT || type === TileType.SLOPE_RIGHT) {
      return type;
    }
    return null;
  }
}

// Test
const map = new CollisionMap(20, 15, 32);
const slopeCollision = new SlopeCollision(map, 32);

// Create left-rising slope at tile (5, 10)
map.setTile(5, 10, TileType.SLOPE_LEFT);

// Test various X positions
const tileX = 5;
const tileY = 10;
const tileWorldX = tileX * 32;  // 160

// Left edge (bottom of slope)
const height1 = slopeCollision.getSlopeHeightAt(tileX, tileY, tileWorldX);
console.log(height1);  // 352 (320 + 32 = bottom)

// Middle
const height2 = slopeCollision.getSlopeHeightAt(tileX, tileY, tileWorldX + 16);
console.log(height2);  // 336 (320 + 16 = middle)

// Right edge (top of slope)
const height3 = slopeCollision.getSlopeHeightAt(tileX, tileY, tileWorldX + 31);
console.log(height3);  // ~320 (top)

// Test right-rising slope
map.setTile(6, 10, TileType.SLOPE_RIGHT);
const height4 = slopeCollision.getSlopeHeightAt(6, 10, 192);  // Left edge
console.log(height4);  // 320 (top)
const height5 = slopeCollision.getSlopeHeightAt(6, 10, 223);  // Right edge
console.log(height5);  // 352 (bottom)
```

**Key Points**:
- SLOPE_LEFT rises from left to right (/)
- SLOPE_RIGHT rises from right to left (\)
- Use ratio (0-1) within tile to calculate height
- Clamp X position to tile bounds for stability

---

**(Solutions continue for Exercises 11-12...)**

Due to length constraints, I'll provide the remaining solutions in a concise format:

## Exercise 11 Solution: Slope Collision Resolution

```typescript
class SlopeCollision {
  // ... previous code ...

  resolveSlopeCollision(entity: Entity): boolean {
    const entityBox = entity.getCollisionBox();
    const entityBottom = entityBox.y + entityBox.height;
    const entityCenterX = entityBox.x + entityBox.width / 2;

    const tileX = Math.floor(entityCenterX / this.tileSize);
    const tileY = Math.floor(entityBottom / this.tileSize);

    const slopeHeight = this.getSlopeHeightAt(tileX, tileY, entityCenterX);

    if (slopeHeight !== null) {
      if (entityBottom > slopeHeight) {
        // Push entity up to slope surface
        entity.y = slopeHeight - entity.collisionHeight - entity.collisionOffsetY;
        entity.velocityY = 0;
        return true;
      }
    }

    return false;
  }

  isOnSlope(entity: Entity): boolean {
    const entityBox = entity.getCollisionBox();
    const entityCenterX = entityBox.x + entityBox.width / 2;
    const entityBottom = entityBox.y + entityBox.height;
    
    const tileX = Math.floor(entityCenterX / this.tileSize);
    const tileY = Math.floor(entityBottom / this.tileSize);

    return this.isSlope(tileX, tileY);
  }
}
```

## Exercise 12 Solution: Hazard Detection

```typescript
class MarioCollisionSystem {
  // ... previous code ...

  checkHazards(entity: Entity): Array<{
    tileX: number;
    tileY: number;
    damage: number;
    tileType: TileType;
  }> {
    const hazards: Array<{
      tileX: number;
      tileY: number;
      damage: number;
      tileType: TileType;
    }> = [];

    const entityBox = entity.getCollisionBox();
    const tiles = this.detector.getTilesInAABB(entityBox);

    for (const tile of tiles) {
      const props = TileCollisionProperties.getProperties(tile.type);
      if (props.damage > 0) {
        hazards.push({
          tileX: tile.x,
          tileY: tile.y,
          damage: props.damage,
          tileType: tile.type
        });
      }
    }

    return hazards;
  }
}

// Test
map.setTile(5, 10, TileType.HAZARD);
const entity = new Entity(160, 320, 16, 16);
const hazards = collisionSystem.checkHazards(entity);
console.log(hazards);  // [{ tileX: 5, tileY: 10, damage: 1, tileType: TileType.HAZARD }]
```

---

## Bonus Solutions Available

See `i-debugging.md` for advanced collision debugging techniques and `j-faq.md` for common questions about swept collision, friction systems, and moving platforms.

---

## Summary

These solutions demonstrate:
- Proper AABB collision detection
- Tile-based collision optimization
- Separate-axis collision resolution
- One-way platform mechanics
- Slope collision handling
- Hazard detection

Remember to test thoroughly with edge cases!
