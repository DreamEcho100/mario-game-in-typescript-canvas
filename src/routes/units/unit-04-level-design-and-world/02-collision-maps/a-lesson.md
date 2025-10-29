# Topic 02: Collision Maps - Lesson

## Introduction

Welcome to **Collision Maps**! In this lesson, we'll learn how to implement tile-based collision detection in our Mario game. Collision maps are a core concept in 2D platformers - they allow us to efficiently determine which tiles are solid, which are platforms, and how our character should respond to them.

By the end of this lesson, you'll be able to:
- Understand collision tile types and properties
- Implement AABB (Axis-Aligned Bounding Box) vs tile collision
- Handle collision response and resolution
- Work with one-way platforms and slopes
- Optimize collision detection with spatial partitioning

## Table of Contents

1. [Collision Tile Types](#collision-tile-types)
2. [Collision Detection Basics](#collision-detection-basics)
3. [AABB vs Tile Grid](#aabb-vs-tile-grid)
4. [Collision Response](#collision-response)
5. [Platform Types](#platform-types)
6. [Slope Collision](#slope-collision)
7. [Optimization Techniques](#optimization-techniques)
8. [Complete Implementation](#complete-implementation)

---

## Collision Tile Types

### Understanding Tile Properties

In a collision map, each tile has properties that define how entities interact with it:

```typescript
enum TileType {
  EMPTY = 0,        // No collision
  SOLID = 1,        // Blocks from all sides
  PLATFORM = 2,     // One-way platform (top only)
  SLOPE_LEFT = 3,   // Slope rising left to right
  SLOPE_RIGHT = 4,  // Slope rising right to left
  HAZARD = 5,       // Damages player (spikes, lava)
  LADDER = 6,       // Climbable
  ICE = 7,          // Low friction
  BOUNCE = 8        // Bouncy surface
}

interface TileCollisionData {
  type: TileType;
  solid: boolean;      // Is this tile solid?
  platform: boolean;   // Is this a one-way platform?
  friction: number;    // Surface friction (0-1)
  bounciness: number;  // How much bounce (0-1)
  damage: number;      // Damage dealt to player
  climbable: boolean;  // Can player climb this?
}
```

### Collision Map Structure

A collision map is typically a 2D array that parallels your visual tilemap:

```typescript
class CollisionMap {
  private tiles: TileType[][];
  private tileSize: number;
  private width: number;
  private height: number;

  constructor(width: number, height: number, tileSize: number) {
    this.width = width;
    this.height = height;
    this.tileSize = tileSize;
    
    // Initialize empty collision map
    this.tiles = [];
    for (let y = 0; y < height; y++) {
      this.tiles[y] = [];
      for (let x = 0; x < width; x++) {
        this.tiles[y][x] = TileType.EMPTY;
      }
    }
  }

  // Set a tile's collision type
  setTile(x: number, y: number, type: TileType): void {
    if (this.isValidTile(x, y)) {
      this.tiles[y][x] = type;
    }
  }

  // Get a tile's collision type
  getTile(x: number, y: number): TileType {
    if (!this.isValidTile(x, y)) {
      return TileType.SOLID; // Treat out-of-bounds as solid
    }
    return this.tiles[y][x];
  }

  // Check if tile coordinates are valid
  private isValidTile(x: number, y: number): boolean {
    return x >= 0 && x < this.width && y >= 0 && y < this.height;
  }

  // Convert world position to tile coordinates
  worldToTile(worldX: number, worldY: number): { x: number; y: number } {
    return {
      x: Math.floor(worldX / this.tileSize),
      y: Math.floor(worldY / this.tileSize)
    };
  }

  // Convert tile coordinates to world position
  tileToWorld(tileX: number, tileY: number): { x: number; y: number } {
    return {
      x: tileX * this.tileSize,
      y: tileY * this.tileSize
    };
  }
}
```

### Tile Collision Properties

Create a lookup table for tile properties:

```typescript
class TileCollisionProperties {
  private static properties: Map<TileType, TileCollisionData> = new Map([
    [TileType.EMPTY, {
      type: TileType.EMPTY,
      solid: false,
      platform: false,
      friction: 1.0,
      bounciness: 0.0,
      damage: 0,
      climbable: false
    }],
    [TileType.SOLID, {
      type: TileType.SOLID,
      solid: true,
      platform: false,
      friction: 1.0,
      bounciness: 0.0,
      damage: 0,
      climbable: false
    }],
    [TileType.PLATFORM, {
      type: TileType.PLATFORM,
      solid: false,
      platform: true,
      friction: 1.0,
      bounciness: 0.0,
      damage: 0,
      climbable: false
    }],
    [TileType.ICE, {
      type: TileType.ICE,
      solid: true,
      platform: false,
      friction: 0.1,  // Very slippery!
      bounciness: 0.0,
      damage: 0,
      climbable: false
    }],
    [TileType.BOUNCE, {
      type: TileType.BOUNCE,
      solid: true,
      platform: false,
      friction: 1.0,
      bounciness: 1.5,  // Super bouncy!
      damage: 0,
      climbable: false
    }],
    [TileType.HAZARD, {
      type: TileType.HAZARD,
      solid: false,
      platform: false,
      friction: 1.0,
      bounciness: 0.0,
      damage: 1,  // Damages player
      climbable: false
    }],
    [TileType.LADDER, {
      type: TileType.LADDER,
      solid: false,
      platform: false,
      friction: 1.0,
      bounciness: 0.0,
      damage: 0,
      climbable: true
    }]
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

  static isHazard(type: TileType): boolean {
    return this.getProperties(type).damage > 0;
  }

  static isClimbable(type: TileType): boolean {
    return this.getProperties(type).climbable;
  }
}
```

---

## Collision Detection Basics

### AABB (Axis-Aligned Bounding Box)

Most 2D games use AABB collision detection. Each entity has a rectangular bounding box:

```typescript
interface AABB {
  x: number;      // Left edge
  y: number;      // Top edge
  width: number;
  height: number;
}

class CollisionBox {
  // Check if two AABBs overlap
  static overlaps(a: AABB, b: AABB): boolean {
    return (
      a.x < b.x + b.width &&
      a.x + a.width > b.x &&
      a.y < b.y + b.height &&
      a.y + a.height > b.y
    );
  }

  // Get the overlap amount between two AABBs
  static getOverlap(a: AABB, b: AABB): { x: number; y: number } {
    const overlapX = Math.min(
      a.x + a.width - b.x,
      b.x + b.width - a.x
    );
    
    const overlapY = Math.min(
      a.y + a.height - b.y,
      b.y + b.height - a.y
    );

    return { x: overlapX, y: overlapY };
  }

  // Get the center point of an AABB
  static getCenter(aabb: AABB): { x: number; y: number } {
    return {
      x: aabb.x + aabb.width / 2,
      y: aabb.y + aabb.height / 2
    };
  }

  // Check which side of B that A is touching
  static getTouchingSide(a: AABB, b: AABB): 'top' | 'bottom' | 'left' | 'right' | null {
    if (!this.overlaps(a, b)) return null;

    const overlap = this.getOverlap(a, b);
    
    // Determine which axis has the smallest overlap
    if (overlap.x < overlap.y) {
      // Horizontal collision
      return a.x + a.width / 2 < b.x + b.width / 2 ? 'right' : 'left';
    } else {
      // Vertical collision
      return a.y + a.height / 2 < b.y + b.height / 2 ? 'bottom' : 'top';
    }
  }
}
```

### Entity Collision Box

Define a collision box for your player/entities:

```typescript
class Entity {
  x: number;
  y: number;
  width: number;
  height: number;
  velocityX: number = 0;
  velocityY: number = 0;

  // Offset for the collision box (useful for sprites with transparent areas)
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

  // Get the entity's collision box
  getCollisionBox(): AABB {
    return {
      x: this.x + this.collisionOffsetX,
      y: this.y + this.collisionOffsetY,
      width: this.collisionWidth,
      height: this.collisionHeight
    };
  }

  // Get collision box at a specific position
  getCollisionBoxAt(x: number, y: number): AABB {
    return {
      x: x + this.collisionOffsetX,
      y: y + this.collisionOffsetY,
      width: this.collisionWidth,
      height: this.collisionHeight
    };
  }
}
```

---

## AABB vs Tile Grid

### Finding Tiles to Check

Instead of checking every tile, only check tiles that the entity overlaps:

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

    // Convert AABB bounds to tile coordinates
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

  // Get tile AABB
  getTileAABB(tileX: number, tileY: number): AABB {
    return {
      x: tileX * this.tileSize,
      y: tileY * this.tileSize,
      width: this.tileSize,
      height: this.tileSize
    };
  }

  // Check if entity collides with any solid tiles
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

  // Get all solid tiles that entity collides with
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
}
```

---

## Collision Response

### Separation and Resolution

When a collision is detected, we need to push the entity out of the tile:

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
  private detector: TileCollisionDetector;
  private tileSize: number;

  constructor(detector: TileCollisionDetector, tileSize: number) {
    this.detector = detector;
    this.tileSize = tileSize;
  }

  // Resolve collision by moving entity out of tiles
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

    // Calculate new position
    const newX = entity.x + velocityX;
    const newY = entity.y + velocityY;

    // Move X axis first
    entity.x = newX;
    const xCollision = this.resolveAxisCollision(entity, 'x');
    if (xCollision.collided) {
      result.collided = true;
      result.collidedX = true;
      result.onLeftWall = xCollision.onLeftWall;
      result.onRightWall = xCollision.onRightWall;
      entity.velocityX = 0; // Stop horizontal movement
    }

    // Move Y axis second
    entity.y = newY;
    const yCollision = this.resolveAxisCollision(entity, 'y');
    if (yCollision.collided) {
      result.collided = true;
      result.collidedY = true;
      result.onGround = yCollision.onGround;
      result.onCeiling = yCollision.onCeiling;
      entity.velocityY = 0; // Stop vertical movement
    }

    return result;
  }

  // Resolve collision on a single axis
  private resolveAxisCollision(
    entity: Entity,
    axis: 'x' | 'y'
  ): {
    collided: boolean;
    onGround: boolean;
    onCeiling: boolean;
    onLeftWall: boolean;
    onRightWall: boolean;
  } {
    const result = {
      collided: false,
      onGround: false,
      onCeiling: false,
      onLeftWall: false,
      onRightWall: false
    };

    const entityBox = entity.getCollisionBox();
    const collisions = this.detector.getSolidCollisions(entityBox);

    if (collisions.length === 0) {
      return result;
    }

    result.collided = true;

    // Find the collision with the smallest separation
    let minSeparation = Infinity;
    let separationX = 0;
    let separationY = 0;

    for (const collision of collisions) {
      const overlap = CollisionBox.getOverlap(entityBox, collision.box);
      
      if (axis === 'x') {
        // Resolve horizontally
        const separation = entityBox.x < collision.box.x ? -overlap.x : overlap.x;
        if (Math.abs(separation) < Math.abs(minSeparation)) {
          minSeparation = separation;
          separationX = separation;
          separationY = 0;
        }
      } else {
        // Resolve vertically
        const separation = entityBox.y < collision.box.y ? -overlap.y : overlap.y;
        if (Math.abs(separation) < Math.abs(minSeparation)) {
          minSeparation = separation;
          separationX = 0;
          separationY = separation;
        }
      }
    }

    // Apply separation
    entity.x += separationX;
    entity.y += separationY;

    // Determine which side was hit
    if (separationX < 0) result.onRightWall = true;
    if (separationX > 0) result.onLeftWall = true;
    if (separationY < 0) result.onCeiling = true;
    if (separationY > 0) result.onGround = true;

    return result;
  }
}
```

### Swept AABB Collision

For fast-moving objects, use swept collision to prevent tunneling:

```typescript
class SweptCollision {
  // Calculate the time of collision between moving AABB and static AABB
  static sweepAABB(
    movingBox: AABB,
    velocityX: number,
    velocityY: number,
    staticBox: AABB
  ): { time: number; normalX: number; normalY: number } | null {
    // Expand the static box by the moving box's size
    const expandedBox: AABB = {
      x: staticBox.x - movingBox.width / 2,
      y: staticBox.y - movingBox.height / 2,
      width: staticBox.width + movingBox.width,
      height: staticBox.height + movingBox.height
    };

    // Treat moving box as a point at its center
    const centerX = movingBox.x + movingBox.width / 2;
    const centerY = movingBox.y + movingBox.height / 2;

    // Calculate entry and exit times for each axis
    let xEntry: number, xExit: number;
    let yEntry: number, yExit: number;

    if (velocityX > 0) {
      xEntry = expandedBox.x - centerX;
      xExit = expandedBox.x + expandedBox.width - centerX;
    } else {
      xEntry = expandedBox.x + expandedBox.width - centerX;
      xExit = expandedBox.x - centerX;
    }

    if (velocityY > 0) {
      yEntry = expandedBox.y - centerY;
      yExit = expandedBox.y + expandedBox.height - centerY;
    } else {
      yEntry = expandedBox.y + expandedBox.height - centerY;
      yExit = expandedBox.y - centerY;
    }

    // Avoid division by zero
    if (velocityX === 0) {
      xEntry = -Infinity;
      xExit = Infinity;
    } else {
      xEntry /= velocityX;
      xExit /= velocityX;
    }

    if (velocityY === 0) {
      yEntry = -Infinity;
      yExit = Infinity;
    } else {
      yEntry /= velocityY;
      yExit /= velocityY;
    }

    // Find the earliest and latest times of collision
    const entryTime = Math.max(xEntry, yEntry);
    const exitTime = Math.min(xExit, yExit);

    // No collision if:
    // - Entry time is after exit time
    // - Both entry times are negative
    // - Entry time is greater than 1 (beyond this frame)
    if (entryTime > exitTime || (xEntry < 0 && yEntry < 0) || entryTime > 1) {
      return null;
    }

    // Calculate collision normal
    let normalX = 0;
    let normalY = 0;

    if (xEntry > yEntry) {
      normalX = velocityX > 0 ? -1 : 1;
      normalY = 0;
    } else {
      normalX = 0;
      normalY = velocityY > 0 ? -1 : 1;
    }

    return {
      time: entryTime,
      normalX,
      normalY
    };
  }
}
```

---

## Platform Types

### One-Way Platforms

Platforms that can only be collided with from the top:

```typescript
class PlatformCollision {
  private detector: TileCollisionDetector;
  private tileSize: number;

  constructor(detector: TileCollisionDetector, tileSize: number) {
    this.detector = detector;
    this.tileSize = tileSize;
  }

  // Check if entity is colliding with a platform from above
  checkPlatformCollision(
    entity: Entity,
    velocityY: number
  ): { collided: boolean; platformY: number } | null {
    // Only check if moving downward
    if (velocityY <= 0) return null;

    const entityBox = entity.getCollisionBox();
    const tiles = this.detector.getTilesInAABB(entityBox);

    let closestPlatform: { y: number } | null = null;

    for (const tile of tiles) {
      const props = TileCollisionProperties.getProperties(tile.type);
      
      if (props.platform) {
        const tileBox = this.detector.getTileAABB(tile.x, tile.y);
        
        // Check if entity's bottom is near platform's top
        const entityBottom = entityBox.y + entityBox.height;
        const platformTop = tileBox.y;
        
        // Must be coming from above
        const wasAbove = entityBottom - velocityY <= platformTop;
        const isOverlapping = entityBottom > platformTop && 
                             entityBottom < platformTop + 8; // 8px threshold
        
        if (wasAbove && isOverlapping) {
          // Check horizontal overlap
          const horizontalOverlap = !(
            entityBox.x + entityBox.width <= tileBox.x ||
            entityBox.x >= tileBox.x + tileBox.width
          );
          
          if (horizontalOverlap) {
            if (!closestPlatform || platformTop < closestPlatform.y) {
              closestPlatform = { y: platformTop };
            }
          }
        }
      }
    }

    if (closestPlatform) {
      return {
        collided: true,
        platformY: closestPlatform.y
      };
    }

    return null;
  }

  // Check if player wants to drop through platform
  dropThroughPlatform(entity: Entity): void {
    // Move entity down slightly to pass through platform
    entity.y += 8;
  }
}
```

---

## Slope Collision

### Basic Slope Collision

Handle slopes for smooth transitions:

```typescript
class SlopeCollision {
  private collisionMap: CollisionMap;
  private tileSize: number;

  constructor(collisionMap: CollisionMap, tileSize: number) {
    this.collisionMap = collisionMap;
    this.tileSize = tileSize;
  }

  // Get the height of a slope at a specific X position
  getSlopeHeightAt(tileX: number, tileY: number, worldX: number): number | null {
    const tileType = this.collisionMap.getTile(tileX, tileY);
    
    if (tileType !== TileType.SLOPE_LEFT && tileType !== TileType.SLOPE_RIGHT) {
      return null;
    }

    // Calculate position within tile (0 to 1)
    const tileWorldX = tileX * this.tileSize;
    const xInTile = worldX - tileWorldX;
    const ratio = xInTile / this.tileSize;

    const tileWorldY = tileY * this.tileSize;

    if (tileType === TileType.SLOPE_LEFT) {
      // Slope rises from left to right
      // At x=0, height=tileSize (bottom)
      // At x=tileSize, height=0 (top)
      return tileWorldY + this.tileSize - (ratio * this.tileSize);
    } else {
      // Slope rises from right to left
      // At x=0, height=0 (top)
      // At x=tileSize, height=tileSize (bottom)
      return tileWorldY + (ratio * this.tileSize);
    }
  }

  // Check and resolve slope collision
  resolveSlopeCollision(entity: Entity): boolean {
    const entityBox = entity.getCollisionBox();
    const entityBottom = entityBox.y + entityBox.height;
    const entityCenterX = entityBox.x + entityBox.width / 2;

    // Get tile at entity's center bottom
    const tileX = Math.floor(entityCenterX / this.tileSize);
    const tileY = Math.floor(entityBottom / this.tileSize);

    const slopeHeight = this.getSlopeHeightAt(tileX, tileY, entityCenterX);

    if (slopeHeight !== null) {
      // If entity is below slope surface, push up
      if (entityBottom > slopeHeight) {
        entity.y = slopeHeight - entityBox.height + entity.collisionOffsetY;
        entity.velocityY = 0;
        return true;
      }
    }

    return false;
  }

  // Check if entity is on a slope
  isOnSlope(entity: Entity): boolean {
    const entityBox = entity.getCollisionBox();
    const entityBottom = entityBox.y + entityBox.height;
    const entityCenterX = entityBox.x + entityBox.width / 2;

    const tileX = Math.floor(entityCenterX / this.tileSize);
    const tileY = Math.floor(entityBottom / this.tileSize);

    const tileType = this.collisionMap.getTile(tileX, tileY);
    return tileType === TileType.SLOPE_LEFT || tileType === TileType.SLOPE_RIGHT;
  }
}
```

---

## Optimization Techniques

### Spatial Partitioning

For large maps, use spatial partitioning to reduce collision checks:

```typescript
class SpatialGrid {
  private cellSize: number;
  private cells: Map<string, Set<Entity>>;

  constructor(cellSize: number) {
    this.cellSize = cellSize;
    this.cells = new Map();
  }

  // Get cell key for a position
  private getCellKey(x: number, y: number): string {
    const cellX = Math.floor(x / this.cellSize);
    const cellY = Math.floor(y / this.cellSize);
    return `${cellX},${cellY}`;
  }

  // Get all cell keys that an AABB overlaps
  private getCellKeysForAABB(aabb: AABB): string[] {
    const keys: string[] = [];
    const startX = Math.floor(aabb.x / this.cellSize);
    const endX = Math.floor((aabb.x + aabb.width) / this.cellSize);
    const startY = Math.floor(aabb.y / this.cellSize);
    const endY = Math.floor((aabb.y + aabb.height) / this.cellSize);

    for (let y = startY; y <= endY; y++) {
      for (let x = startX; x <= endX; x++) {
        keys.push(`${x},${y}`);
      }
    }

    return keys;
  }

  // Add entity to grid
  addEntity(entity: Entity): void {
    const box = entity.getCollisionBox();
    const keys = this.getCellKeysForAABB(box);

    for (const key of keys) {
      if (!this.cells.has(key)) {
        this.cells.set(key, new Set());
      }
      this.cells.get(key)!.add(entity);
    }
  }

  // Remove entity from grid
  removeEntity(entity: Entity): void {
    const box = entity.getCollisionBox();
    const keys = this.getCellKeysForAABB(box);

    for (const key of keys) {
      this.cells.get(key)?.delete(entity);
    }
  }

  // Update entity position in grid
  updateEntity(entity: Entity): void {
    this.removeEntity(entity);
    this.addEntity(entity);
  }

  // Get nearby entities
  getNearbyEntities(aabb: AABB): Set<Entity> {
    const nearby = new Set<Entity>();
    const keys = this.getCellKeysForAABB(aabb);

    for (const key of keys) {
      const entities = this.cells.get(key);
      if (entities) {
        entities.forEach(e => nearby.add(e));
      }
    }

    return nearby;
  }

  // Clear all entities
  clear(): void {
    this.cells.clear();
  }
}
```

### Collision Caching

Cache collision results for static tiles:

```typescript
class CollisionCache {
  private cache: Map<string, boolean> = new Map();
  private maxSize: number = 10000;

  // Generate cache key
  private getCacheKey(tileX: number, tileY: number, type: string): string {
    return `${tileX},${tileY},${type}`;
  }

  // Check cache
  get(tileX: number, tileY: number, type: string): boolean | undefined {
    return this.cache.get(this.getCacheKey(tileX, tileY, type));
  }

  // Store in cache
  set(tileX: number, tileY: number, type: string, value: boolean): void {
    if (this.cache.size >= this.maxSize) {
      // Remove oldest entry
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    this.cache.set(this.getCacheKey(tileX, tileY, type), value);
  }

  // Clear cache
  clear(): void {
    this.cache.clear();
  }

  // Invalidate specific tile
  invalidate(tileX: number, tileY: number): void {
    const keysToDelete: string[] = [];
    for (const key of this.cache.keys()) {
      if (key.startsWith(`${tileX},${tileY},`)) {
        keysToDelete.push(key);
      }
    }
    keysToDelete.forEach(key => this.cache.delete(key));
  }
}
```

---

## Complete Implementation

### Full Collision System

Here's a complete collision system for Mario:

```typescript
class MarioCollisionSystem {
  private collisionMap: CollisionMap;
  private detector: TileCollisionDetector;
  private resolver: CollisionResolver;
  private platformCollision: PlatformCollision;
  private slopeCollision: SlopeCollision;
  private spatialGrid: SpatialGrid;
  private tileSize: number;

  constructor(collisionMap: CollisionMap, tileSize: number) {
    this.collisionMap = collisionMap;
    this.tileSize = tileSize;
    this.detector = new TileCollisionDetector(collisionMap, tileSize);
    this.resolver = new CollisionResolver(this.detector, tileSize);
    this.platformCollision = new PlatformCollision(this.detector, tileSize);
    this.slopeCollision = new SlopeCollision(collisionMap, tileSize);
    this.spatialGrid = new SpatialGrid(tileSize * 4); // 4 tiles per cell
  }

  // Update entity physics and collision
  update(entity: Entity, deltaTime: number): CollisionResult {
    // Apply velocity
    const velocityX = entity.velocityX * deltaTime;
    const velocityY = entity.velocityY * deltaTime;

    // Check platform collision first (one-way)
    const platformResult = this.platformCollision.checkPlatformCollision(
      entity,
      velocityY
    );

    if (platformResult && platformResult.collided) {
      entity.y = platformResult.platformY - entity.collisionHeight - entity.collisionOffsetY;
      entity.velocityY = 0;
      return {
        collided: true,
        collidedX: false,
        collidedY: true,
        onGround: true,
        onCeiling: false,
        onLeftWall: false,
        onRightWall: false
      };
    }

    // Resolve solid tile collision
    const solidResult = this.resolver.resolveCollision(entity, velocityX, velocityY);

    // Check slope collision if on ground
    if (solidResult.onGround || this.slopeCollision.isOnSlope(entity)) {
      const onSlope = this.slopeCollision.resolveSlopeCollision(entity);
      if (onSlope) {
        solidResult.onGround = true;
      }
    }

    // Check hazards
    this.checkHazards(entity);

    return solidResult;
  }

  // Check for hazardous tiles
  private checkHazards(entity: Entity): void {
    const entityBox = entity.getCollisionBox();
    const tiles = this.detector.getTilesInAABB(entityBox);

    for (const tile of tiles) {
      const props = TileCollisionProperties.getProperties(tile.type);
      if (props.damage > 0) {
        // Handle damage (implement in your game logic)
        console.log(`Entity took ${props.damage} damage!`);
      }
    }
  }

  // Check if entity can drop through platform
  canDropThrough(entity: Entity): boolean {
    const entityBox = entity.getCollisionBox();
    const tiles = this.detector.getTilesInAABB(entityBox);

    for (const tile of tiles) {
      const props = TileCollisionProperties.getProperties(tile.type);
      if (props.platform) {
        return true;
      }
    }

    return false;
  }

  // Handle dropping through platform
  dropThrough(entity: Entity): void {
    this.platformCollision.dropThroughPlatform(entity);
  }

  // Get surface friction at entity position
  getSurfaceFriction(entity: Entity): number {
    const entityBox = entity.getCollisionBox();
    const bottomY = entityBox.y + entityBox.height + 1;
    const centerX = entityBox.x + entityBox.width / 2;

    const tileX = Math.floor(centerX / this.tileSize);
    const tileY = Math.floor(bottomY / this.tileSize);

    const tileType = this.collisionMap.getTile(tileX, tileY);
    const props = TileCollisionProperties.getProperties(tileType);

    return props.friction;
  }

  // Check if entity is on climbable tile
  isOnClimbable(entity: Entity): boolean {
    const entityBox = entity.getCollisionBox();
    const tiles = this.detector.getTilesInAABB(entityBox);

    for (const tile of tiles) {
      const props = TileCollisionProperties.getProperties(tile.type);
      if (props.climbable) {
        return true;
      }
    }

    return false;
  }
}
```

### Mario Player with Collision

Integrate collision into Mario's player class:

```typescript
class Mario extends Entity {
  private collisionSystem: MarioCollisionSystem;
  private grounded: boolean = false;
  private jumping: boolean = false;
  
  // Physics constants
  private readonly GRAVITY = 980;
  private readonly JUMP_FORCE = -400;
  private readonly MOVE_SPEED = 150;
  private readonly MAX_FALL_SPEED = 500;

  constructor(
    x: number,
    y: number,
    collisionSystem: MarioCollisionSystem
  ) {
    super(x, y, 16, 16);
    this.collisionSystem = collisionSystem;
    
    // Set collision box smaller than sprite (8px margins)
    this.collisionOffsetX = 4;
    this.collisionOffsetY = 4;
    this.collisionWidth = 8;
    this.collisionHeight = 12;
  }

  update(deltaTime: number, input: GameInput): void {
    // Horizontal movement
    if (input.left) {
      this.velocityX = -this.MOVE_SPEED;
    } else if (input.right) {
      this.velocityX = this.MOVE_SPEED;
    } else {
      // Apply friction
      const friction = this.collisionSystem.getSurfaceFriction(this);
      this.velocityX *= friction;
      if (Math.abs(this.velocityX) < 1) this.velocityX = 0;
    }

    // Jump
    if (input.jump && this.grounded && !this.jumping) {
      this.velocityY = this.JUMP_FORCE;
      this.jumping = true;
      this.grounded = false;
    }

    // Drop through platform
    if (input.down && input.jump && this.collisionSystem.canDropThrough(this)) {
      this.collisionSystem.dropThrough(this);
    }

    // Apply gravity
    if (!this.grounded) {
      this.velocityY += this.GRAVITY * deltaTime;
      this.velocityY = Math.min(this.velocityY, this.MAX_FALL_SPEED);
    }

    // Update collision and physics
    const collision = this.collisionSystem.update(this, deltaTime);
    
    // Update grounded state
    this.grounded = collision.onGround;
    if (this.grounded) {
      this.jumping = false;
    }

    // Variable jump height (release jump button early)
    if (!input.jump && this.velocityY < 0) {
      this.velocityY *= 0.5;
    }
  }

  render(ctx: CanvasRenderingContext2D): void {
    // Draw Mario sprite
    ctx.fillStyle = 'red';
    ctx.fillRect(this.x, this.y, this.width, this.height);

    // Draw collision box (debug)
    const box = this.getCollisionBox();
    ctx.strokeStyle = 'lime';
    ctx.strokeRect(box.x, box.y, box.width, box.height);
  }
}

interface GameInput {
  left: boolean;
  right: boolean;
  jump: boolean;
  down: boolean;
}
```

---

## Summary

In this lesson, we learned:

1. **Collision Tile Types** - Different tile properties (solid, platform, slope, hazard)
2. **AABB Collision** - Basic axis-aligned bounding box collision detection
3. **Tile Grid Collision** - Efficiently checking only relevant tiles
4. **Collision Response** - Separating entities from tiles and resolving overlaps
5. **Platform Collision** - One-way platforms that can be jumped through
6. **Slope Collision** - Smooth transitions on angled surfaces
7. **Optimization** - Spatial partitioning and caching for performance

Collision detection is fundamental to platformers. Take your time to understand:
- How AABB works
- Why we separate X and Y axis collision
- How to determine which side of a tile was hit
- The difference between solid tiles and one-way platforms

## Next Steps

In the next topic, we'll implement **Camera Systems** to follow Mario around the level!

Practice exercises are in the `b-exercises.md` file.
