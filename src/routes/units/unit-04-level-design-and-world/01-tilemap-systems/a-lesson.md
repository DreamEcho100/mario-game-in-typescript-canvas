# Tilemap Systems

**Unit 04: Level Design & World Systems | Topic 01 of 04**

> **Learning Objective:** Master the fundamentals of tile-based level design, including tile rendering, tilemap data structures, tileset management, and optimized rendering techniques for creating large, scrollable game worlds.

---

## Table of Contents

1. [Introduction](#introduction)
2. [What Are Tilemaps?](#what-are-tilemaps)
3. [Tilemap Data Structures](#tilemap-data-structures)
4. [Loading and Parsing Tilemap Data](#loading-and-parsing-tilemap-data)
5. [Rendering Tiles Efficiently](#rendering-tiles-efficiently)
6. [Tilesets and Sprite Sheets](#tilesets-and-sprite-sheets)
7. [Tile Coordinates vs World Coordinates](#tile-coordinates-vs-world-coordinates)
8. [Viewport Culling](#viewport-culling)
9. [Multi-Layer Tilemaps](#multi-layer-tilemaps)
10. [Tile Properties and Metadata](#tile-properties-and-metadata)
11. [Application to Mario Game](#application-to-mario-game)
12. [Performance Considerations](#performance-considerations)
13. [Summary](#summary)
14. [Next Steps](#next-steps)

---

## Introduction

### What and Why

Tilemaps are the foundation of 2D level design in games like Super Mario Bros, Zelda, and countless other classics. Instead of drawing every pixel of a level by hand, you create a **grid of reusable tiles** that snap together to form your game world.

**Why use tilemaps?**

- **Memory efficient**: Store levels as small 2D arrays instead of large images
- **Easy editing**: Change levels by swapping array values
- **Consistent style**: Reuse the same tile graphics throughout
- **Collision-friendly**: Grid-based structure simplifies collision detection
- **Scalable**: Create massive worlds without massive file sizes

**Real-world example:**

Super Mario Bros (NES) used a 16×16 pixel tile system. The entire first level (World 1-1) was stored in just **400 bytes** of tilemap data, while the tileset image was only **8 KB**. Without tilemaps, storing the level as a full image would have required **120 KB**—15× larger!

### What You'll Learn

By the end of this lesson, you'll be able to:

- ✅ Understand tilemap data structures (arrays, objects, JSON)
- ✅ Load tilemap data from external files
- ✅ Render tiles efficiently using tilesets
- ✅ Convert between tile coordinates and world coordinates
- ✅ Implement viewport culling to render only visible tiles
- ✅ Create multi-layer tilemaps (background, foreground, etc.)
- ✅ Add metadata to tiles (solid, hazard, animated, etc.)
- ✅ Build a complete tilemap system for your Mario game

### Prerequisites

Before starting this lesson, you should understand:

- **Canvas rendering** (Unit 01, Topic 01) — Drawing images and shapes
- **Sprite rendering** (Unit 03, Topic 01) — Loading and rendering sprites
- **World coordinates** (Unit 01, Topic 05) — Coordinate system management
- **Basic arrays** — 2D array access and iteration

### Time Investment

- **Reading**: 60-90 minutes
- **Exercises**: 2-3 hours
- **Total**: 3-4 hours

---

## What Are Tilemaps?

### The Concept

A **tilemap** is a 2D grid where each cell contains a **tile ID** that refers to a specific image in a **tileset**.

**Visual representation:**

```
Tilemap (logical):          Tileset (visual):
┌───┬───┬───┬───┐           ┌───┬───┬───┐
│ 0 │ 1 │ 1 │ 0 │           │ 0 │ 1 │ 2 │
├───┼───┼───┼───┤           ├───┼───┼───┤
│ 0 │ 2 │ 2 │ 0 │           │ 3 │ 4 │ 5 │
├───┼───┼───┼───┤           └───┴───┴───┘
│ 3 │ 3 │ 3 │ 3 │           0 = Sky
└───┴───┴───┴───┘           1 = Cloud
                             2 = Coin
Rendered result:             3 = Ground
┌─────────────┐             4 = Brick
│ ☁ ☁ ☁ ☁    │             5 = ?-Block
│    ● ●     │
│▓▓▓▓▓▓▓▓▓▓▓▓│
└─────────────┘
```

**Key insight:** The tilemap stores **what** goes where (IDs), and the tileset stores **how** it looks (images).

### Anatomy of a Tile System

A complete tile system consists of:

1. **Tileset Image**: A sprite sheet containing all tile graphics
2. **Tile Size**: The width/height of each tile (e.g., 16×16, 32×32)
3. **Tilemap Data**: A 2D array of tile IDs
4. **Tile Renderer**: Code that draws tiles at the correct positions
5. **Tile Metadata** (optional): Properties like solid, animated, etc.

### Example: Super Mario Bros

```typescript
// Mario's tileset
const TILE_SIZE = 16;

// Tile IDs
const TILES = {
  EMPTY: 0,
  GROUND: 1,
  BRICK: 2,
  QUESTION_BLOCK: 3,
  PIPE_TOP_LEFT: 4,
  PIPE_TOP_RIGHT: 5,
  // ... etc
};

// Level data (small section of World 1-1)
const level = [
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 3, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 2, 2, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 4, 5, 0],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
];
```

This 7×10 grid (70 tiles) defines a small section with:
- Ground at the bottom (tile ID 1)
- Some bricks (tile ID 2)
- A question block (tile ID 3)
- A pipe (tiles 4 and 5)

---

## Tilemap Data Structures

### Option 1: 2D Array (Simple)

The most straightforward representation:

```typescript
type Tilemap = number[][];

const tilemap: Tilemap = [
  [0, 0, 1, 0],
  [0, 2, 2, 0],
  [3, 3, 3, 3],
];

// Access: tilemap[row][col]
const tileId = tilemap[2][1]; // 3 (ground tile)
```

**Pros:**
- Simple and intuitive
- Easy to visualize
- Direct array indexing

**Cons:**
- No metadata storage
- Fixed grid size
- No layer support

### Option 2: 1D Array (Flat)

Store tiles in a single array with calculated indexing:

```typescript
interface TilemapFlat {
  width: number;
  height: number;
  tiles: number[];
}

const tilemap: TilemapFlat = {
  width: 4,
  height: 3,
  tiles: [
    0, 0, 1, 0,
    0, 2, 2, 0,
    3, 3, 3, 3,
  ],
};

// Convert 2D coordinates to 1D index
function getTile(x: number, y: number): number {
  return tilemap.tiles[y * tilemap.width + x];
}

const tileId = getTile(1, 2); // 3
```

**Pros:**
- More memory efficient
- Easier to serialize (JSON, binary)
- Standard format for many tools (Tiled, LDtk)

**Cons:**
- Requires coordinate conversion
- Less intuitive to edit manually

### Option 3: Object-Based (Rich)

Store additional metadata with each tile:

```typescript
interface Tile {
  id: number;
  solid: boolean;
  animated?: boolean;
  frameCount?: number;
}

type TilemapRich = Tile[][];

const tilemap: TilemapRich = [
  [
    { id: 0, solid: false },
    { id: 1, solid: false },
  ],
  [
    { id: 3, solid: true },
    { id: 3, solid: true },
  ],
];
```

**Pros:**
- Rich tile properties
- Flexible and extensible
- Self-documenting

**Cons:**
- Larger memory footprint
- More complex serialization
- Slower access (object lookups)

### Recommendation

**Use 1D arrays for storage**, and provide helper functions for 2D access:

```typescript
class Tilemap {
  width: number;
  height: number;
  tiles: number[];

  constructor(width: number, height: number, tiles: number[]) {
    this.width = width;
    this.height = height;
    this.tiles = tiles;
  }

  getTile(x: number, y: number): number {
    if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
      return -1; // Out of bounds
    }
    return this.tiles[y * this.width + x];
  }

  setTile(x: number, y: number, tileId: number): void {
    if (x < 0 || x >= this.width || y < 0 || y >= this.height) return;
    this.tiles[y * this.width + x] = tileId;
  }
}
```

---

## Loading and Parsing Tilemap Data

### Format 1: JSON (Recommended)

Store tilemap data as JSON files:

**level1.json:**
```json
{
  "width": 10,
  "height": 7,
  "tileSize": 16,
  "tileset": "assets/tileset.png",
  "layers": [
    {
      "name": "background",
      "tiles": [
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 3, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 2, 2, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 4, 5, 0,
        1, 1, 1, 1, 1, 1, 1, 1, 1, 1
      ]
    }
  ]
}
```

**Loading code:**

```typescript
interface TilemapData {
  width: number;
  height: number;
  tileSize: number;
  tileset: string;
  layers: {
    name: string;
    tiles: number[];
  }[];
}

class TilemapLoader {
  static async loadFromJSON(path: string): Promise<TilemapData> {
    const response = await fetch(path);
    const data: TilemapData = await response.json();
    return data;
  }
}

// Usage
const levelData = await TilemapLoader.loadFromJSON('levels/level1.json');
```

### Format 2: CSV (Simple)

For quick prototyping:

**level1.csv:**
```
0,0,0,0,0,0,0,0,0,0
0,0,0,0,3,0,0,0,0,0
0,0,0,0,0,0,0,0,0,0
0,0,2,2,0,0,0,0,0,0
0,0,0,0,0,0,0,0,0,0
0,0,0,0,0,0,0,4,5,0
1,1,1,1,1,1,1,1,1,1
```

**Loading code:**

```typescript
class TilemapLoader {
  static async loadFromCSV(path: string): Promise<number[][]> {
    const response = await fetch(path);
    const text = await response.text();
    
    return text
      .trim()
      .split('\n')
      .map(row => row.split(',').map(Number));
  }
}

// Usage
const tiles = await TilemapLoader.loadFromCSV('levels/level1.csv');
```

### Format 3: Tiled Editor Format

[Tiled](https://www.mapeditor.org/) is a popular tilemap editor that exports to JSON:

```typescript
interface TiledMap {
  width: number;
  height: number;
  tilewidth: number;
  tileheight: number;
  layers: {
    data: number[];
    width: number;
    height: number;
    name: string;
    type: string;
  }[];
  tilesets: {
    firstgid: number;
    image: string;
    imagewidth: number;
    imageheight: number;
    tilewidth: number;
    tileheight: number;
  }[];
}

class TiledLoader {
  static async loadTiledMap(path: string): Promise<TiledMap> {
    const response = await fetch(path);
    return await response.json();
  }
}
```

---

## Rendering Tiles Efficiently

### Basic Tile Rendering

```typescript
class TileRenderer {
  tileset: HTMLImageElement;
  tileSize: number;
  tilesPerRow: number;

  constructor(tileset: HTMLImageElement, tileSize: number) {
    this.tileset = tileset;
    this.tileSize = tileSize;
    this.tilesPerRow = tileset.width / tileSize;
  }

  /**
   * Draw a single tile
   */
  drawTile(
    ctx: CanvasRenderingContext2D,
    tileId: number,
    x: number,
    y: number
  ): void {
    if (tileId <= 0) return; // 0 = empty tile

    // Calculate source position in tileset
    const srcX = (tileId % this.tilesPerRow) * this.tileSize;
    const srcY = Math.floor(tileId / this.tilesPerRow) * this.tileSize;

    // Draw tile
    ctx.drawImage(
      this.tileset,
      srcX, srcY, this.tileSize, this.tileSize,  // Source
      x, y, this.tileSize, this.tileSize         // Destination
    );
  }

  /**
   * Draw entire tilemap
   */
  drawTilemap(
    ctx: CanvasRenderingContext2D,
    tilemap: Tilemap
  ): void {
    for (let y = 0; y < tilemap.height; y++) {
      for (let x = 0; x < tilemap.width; x++) {
        const tileId = tilemap.getTile(x, y);
        this.drawTile(ctx, tileId, x * this.tileSize, y * this.tileSize);
      }
    }
  }
}
```

### Optimized Rendering with Offscreen Canvas

For static tilemaps, pre-render to an offscreen canvas:

```typescript
class OptimizedTileRenderer extends TileRenderer {
  offscreenCanvas: HTMLCanvasElement | null = null;

  /**
   * Pre-render the entire tilemap to an offscreen canvas
   */
  prerenderTilemap(tilemap: Tilemap): void {
    const width = tilemap.width * this.tileSize;
    const height = tilemap.height * this.tileSize;

    this.offscreenCanvas = document.createElement('canvas');
    this.offscreenCanvas.width = width;
    this.offscreenCanvas.height = height;

    const ctx = this.offscreenCanvas.getContext('2d')!;

    // Render all tiles once
    for (let y = 0; y < tilemap.height; y++) {
      for (let x = 0; x < tilemap.width; x++) {
        const tileId = tilemap.getTile(x, y);
        this.drawTile(ctx, tileId, x * this.tileSize, y * this.tileSize);
      }
    }
  }

  /**
   * Draw the pre-rendered tilemap
   */
  drawPrerendered(ctx: CanvasRenderingContext2D, cameraX = 0, cameraY = 0): void {
    if (!this.offscreenCanvas) return;
    ctx.drawImage(this.offscreenCanvas, -cameraX, -cameraY);
  }
}

// Performance: ~60 FPS → ~1000+ FPS for static tilemaps!
```

---

## Tilesets and Sprite Sheets

### Tileset Layout

A tileset is a sprite sheet organized in a grid:

```
Tileset.png (128×128, 16×16 tiles):
┌────┬────┬────┬────┬────┬────┬────┬────┐
│ 0  │ 1  │ 2  │ 3  │ 4  │ 5  │ 6  │ 7  │
├────┼────┼────┼────┼────┼────┼────┼────┤
│ 8  │ 9  │ 10 │ 11 │ 12 │ 13 │ 14 │ 15 │
├────┼────┼────┼────┼────┼────┼────┼────┤
│ 16 │ 17 │ 18 │ 19 │ 20 │ 21 │ 22 │ 23 │
└────┴────┴────┴────┴────┴────┴────┴────┘
```

**Tile ID → Pixel coordinates:**

```typescript
function getTileSourceRect(
  tileId: number,
  tileSize: number,
  tilesPerRow: number
): { x: number; y: number; width: number; height: number } {
  const col = tileId % tilesPerRow;
  const row = Math.floor(tileId / tilesPerRow);

  return {
    x: col * tileSize,
    y: row * tileSize,
    width: tileSize,
    height: tileSize,
  };
}
```

### Loading Tilesets

```typescript
class Tileset {
  image: HTMLImageElement;
  tileSize: number;
  tilesPerRow: number;
  tilesPerColumn: number;
  loaded = false;

  constructor(imagePath: string, tileSize: number) {
    this.tileSize = tileSize;
    this.image = new Image();
    this.image.src = imagePath;

    this.image.onload = () => {
      this.tilesPerRow = this.image.width / tileSize;
      this.tilesPerColumn = this.image.height / tileSize;
      this.loaded = true;
    };
  }

  getTileCount(): number {
    return this.tilesPerRow * this.tilesPerColumn;
  }

  isValidTileId(tileId: number): boolean {
    return tileId >= 0 && tileId < this.getTileCount();
  }
}
```

### Multiple Tilesets

Some games use multiple tilesets for different themes:

```typescript
class TilesetManager {
  tilesets: Map<string, Tileset> = new Map();

  async loadTileset(name: string, path: string, tileSize: number): Promise<void> {
    const tileset = new Tileset(path, tileSize);
    this.tilesets.set(name, tileset);

    // Wait for load
    await new Promise<void>(resolve => {
      tileset.image.onload = () => resolve();
    });
  }

  getTileset(name: string): Tileset | undefined {
    return this.tilesets.get(name);
  }
}

// Usage
const manager = new TilesetManager();
await manager.loadTileset('overworld', 'assets/overworld.png', 16);
await manager.loadTileset('underground', 'assets/underground.png', 16);
await manager.loadTileset('castle', 'assets/castle.png', 16);
```

---

## Tile Coordinates vs World Coordinates

### Conversion Functions

```typescript
/**
 * Convert world pixel coordinates to tile coordinates
 */
function worldToTile(worldX: number, worldY: number, tileSize: number) {
  return {
    tileX: Math.floor(worldX / tileSize),
    tileY: Math.floor(worldY / tileSize),
  };
}

/**
 * Convert tile coordinates to world pixel coordinates (top-left)
 */
function tileToWorld(tileX: number, tileY: number, tileSize: number) {
  return {
    worldX: tileX * tileSize,
    worldY: tileY * tileSize,
  };
}

/**
 * Convert tile coordinates to world center coordinates
 */
function tileToWorldCenter(tileX: number, tileY: number, tileSize: number) {
  return {
    worldX: tileX * tileSize + tileSize / 2,
    worldY: tileY * tileSize + tileSize / 2,
  };
}
```

**Example usage:**

```typescript
// Player at pixel position (245, 78)
const playerPos = { x: 245, y: 78 };
const tileSize = 16;

// What tile is the player on?
const { tileX, tileY } = worldToTile(playerPos.x, playerPos.y, tileSize);
console.log(`Player is on tile (${tileX}, ${tileY})`); // (15, 4)

// What's the world position of tile (10, 5)?
const { worldX, worldY } = tileToWorld(10, 5, tileSize);
console.log(`Tile (10, 5) is at pixel (${worldX}, ${worldY})`); // (160, 80)
```

### Utility Class

```typescript
class TileCoordinates {
  static worldToTile(
    worldX: number,
    worldY: number,
    tileSize: number
  ): { tileX: number; tileY: number } {
    return {
      tileX: Math.floor(worldX / tileSize),
      tileY: Math.floor(worldY / tileSize),
    };
  }

  static tileToWorld(
    tileX: number,
    tileY: number,
    tileSize: number
  ): { worldX: number; worldY: number } {
    return {
      worldX: tileX * tileSize,
      worldY: tileY * tileSize,
    };
  }

  static alignToGrid(worldX: number, worldY: number, tileSize: number) {
    return {
      worldX: Math.floor(worldX / tileSize) * tileSize,
      worldY: Math.floor(worldY / tileSize) * tileSize,
    };
  }
}
```

---

## Viewport Culling

### Why Culling Matters

Drawing every tile in a large level wastes performance. **Viewport culling** means only drawing tiles visible on screen.

**Example:**
- Level size: 200×20 tiles = 4,000 tiles
- Screen size: 25×15 tiles = 375 tiles
- **Without culling:** Draw 4,000 tiles (90% off-screen!)
- **With culling:** Draw only 375 visible tiles (~10× faster)

### Basic Culling

```typescript
class CulledTileRenderer extends TileRenderer {
  drawTilemapCulled(
    ctx: CanvasRenderingContext2D,
    tilemap: Tilemap,
    cameraX: number,
    cameraY: number,
    viewportWidth: number,
    viewportHeight: number
  ): void {
    // Calculate visible tile range
    const startTileX = Math.floor(cameraX / this.tileSize);
    const startTileY = Math.floor(cameraY / this.tileSize);
    const endTileX = Math.ceil((cameraX + viewportWidth) / this.tileSize);
    const endTileY = Math.ceil((cameraY + viewportHeight) / this.tileSize);

    // Clamp to tilemap bounds
    const minX = Math.max(0, startTileX);
    const minY = Math.max(0, startTileY);
    const maxX = Math.min(tilemap.width, endTileX);
    const maxY = Math.min(tilemap.height, endTileY);

    // Draw only visible tiles
    for (let y = minY; y < maxY; y++) {
      for (let x = minX; x < maxX; x++) {
        const tileId = tilemap.getTile(x, y);
        const worldX = x * this.tileSize - cameraX;
        const worldY = y * this.tileSize - cameraY;
        this.drawTile(ctx, tileId, worldX, worldY);
      }
    }
  }
}
```

**Performance:**

```
Without culling: 4,000 tiles × 0.01ms = 40ms (25 FPS)
With culling:      375 tiles × 0.01ms = 3.75ms (266 FPS)
```

### Advanced: Chunk-Based Culling

For extremely large levels, divide into chunks:

```typescript
interface Chunk {
  x: number;
  y: number;
  tiles: number[];
  canvas: HTMLCanvasElement | null;
}

class ChunkedTilemap {
  chunkSize = 16; // 16×16 tiles per chunk
  tileSize: number;
  chunks: Map<string, Chunk> = new Map();

  getChunkKey(chunkX: number, chunkY: number): string {
    return `${chunkX},${chunkY}`;
  }

  getChunk(chunkX: number, chunkY: number): Chunk | undefined {
    return this.chunks.get(this.getChunkKey(chunkX, chunkY));
  }

  worldToChunk(worldX: number, worldY: number) {
    const chunkWorldSize = this.chunkSize * this.tileSize;
    return {
      chunkX: Math.floor(worldX / chunkWorldSize),
      chunkY: Math.floor(worldY / chunkWorldSize),
    };
  }

  // Pre-render each chunk to its own canvas
  prerenderChunk(chunk: Chunk, tileset: HTMLImageElement): void {
    const size = this.chunkSize * this.tileSize;
    chunk.canvas = document.createElement('canvas');
    chunk.canvas.width = size;
    chunk.canvas.height = size;

    const ctx = chunk.canvas.getContext('2d')!;
    // ... render tiles to chunk canvas
  }
}
```

---

## Multi-Layer Tilemaps

### Why Layers?

Layers allow you to separate visual elements:

1. **Background layer**: Sky, clouds, far mountains
2. **Terrain layer**: Ground, platforms, walls
3. **Decoration layer**: Bushes, flowers, torches
4. **Foreground layer**: Trees in front of player

**Rendering order:** Background → Terrain → Player → Foreground

### Implementation

```typescript
interface TilemapLayer {
  name: string;
  tiles: number[];
  visible: boolean;
  opacity: number;
  parallaxX?: number; // For parallax scrolling
  parallaxY?: number;
}

class LayeredTilemap {
  width: number;
  height: number;
  tileSize: number;
  layers: TilemapLayer[] = [];

  constructor(width: number, height: number, tileSize: number) {
    this.width = width;
    this.height = height;
    this.tileSize = tileSize;
  }

  addLayer(name: string, tiles: number[]): void {
    this.layers.push({
      name,
      tiles,
      visible: true,
      opacity: 1.0,
    });
  }

  getLayer(name: string): TilemapLayer | undefined {
    return this.layers.find(layer => layer.name === name);
  }

  getTile(layerName: string, x: number, y: number): number {
    const layer = this.getLayer(layerName);
    if (!layer) return -1;

    const index = y * this.width + x;
    return layer.tiles[index] ?? -1;
  }
}
```

### Rendering Layers

```typescript
class LayeredTileRenderer extends TileRenderer {
  drawLayeredTilemap(
    ctx: CanvasRenderingContext2D,
    tilemap: LayeredTilemap,
    cameraX: number,
    cameraY: number,
    viewportWidth: number,
    viewportHeight: number
  ): void {
    for (const layer of tilemap.layers) {
      if (!layer.visible) continue;

      // Apply layer opacity
      const prevAlpha = ctx.globalAlpha;
      ctx.globalAlpha = layer.opacity;

      // Apply parallax offset
      const parallaxX = layer.parallaxX ?? 1.0;
      const parallaxY = layer.parallaxY ?? 1.0;
      const layerCameraX = cameraX * parallaxX;
      const layerCameraY = cameraY * parallaxY;

      // Calculate visible tile range
      const startX = Math.floor(layerCameraX / tilemap.tileSize);
      const startY = Math.floor(layerCameraY / tilemap.tileSize);
      const endX = Math.ceil((layerCameraX + viewportWidth) / tilemap.tileSize);
      const endY = Math.ceil((layerCameraY + viewportHeight) / tilemap.tileSize);

      // Draw visible tiles
      for (let y = Math.max(0, startY); y < Math.min(tilemap.height, endY); y++) {
        for (let x = Math.max(0, startX); x < Math.min(tilemap.width, endX); x++) {
          const index = y * tilemap.width + x;
          const tileId = layer.tiles[index];

          if (tileId > 0) {
            const screenX = x * tilemap.tileSize - layerCameraX;
            const screenY = y * tilemap.tileSize - layerCameraY;
            this.drawTile(ctx, tileId, screenX, screenY);
          }
        }
      }

      // Restore alpha
      ctx.globalAlpha = prevAlpha;
    }
  }
}
```

---

## Tile Properties and Metadata

### Defining Tile Properties

```typescript
enum TileType {
  Empty = 0,
  Solid = 1,
  Platform = 2, // One-way platform
  Hazard = 3,   // Spikes, lava
  Ladder = 4,
  Water = 5,
}

interface TileMetadata {
  id: number;
  type: TileType;
  solid: boolean;
  friction?: number;
  damage?: number;
  animated?: boolean;
  frameCount?: number;
  frameDuration?: number;
}

class TileDatabase {
  tiles: Map<number, TileMetadata> = new Map();

  registerTile(metadata: TileMetadata): void {
    this.tiles.set(metadata.id, metadata);
  }

  getTileMetadata(tileId: number): TileMetadata | undefined {
    return this.tiles.get(tileId);
  }

  isSolid(tileId: number): boolean {
    return this.tiles.get(tileId)?.solid ?? false;
  }
}
```

### Example: Mario Tile Database

```typescript
const tileDB = new TileDatabase();

// Register tiles
tileDB.registerTile({ id: 0, type: TileType.Empty, solid: false });
tileDB.registerTile({ id: 1, type: TileType.Solid, solid: true }); // Ground
tileDB.registerTile({ id: 2, type: TileType.Solid, solid: true }); // Brick
tileDB.registerTile({ 
  id: 3, 
  type: TileType.Solid, 
  solid: true,
  animated: true,
  frameCount: 4,
  frameDuration: 150, // ms
}); // Question block
tileDB.registerTile({ 
  id: 4, 
  type: TileType.Hazard, 
  solid: false,
  damage: 1,
}); // Spikes

// Usage in collision detection
function checkTileCollision(tileId: number): boolean {
  return tileDB.isSolid(tileId);
}
```

### Animated Tiles

```typescript
class AnimatedTile {
  id: number;
  frames: number[]; // Tile IDs for each frame
  frameDuration: number;
  currentFrame = 0;
  elapsedTime = 0;

  constructor(id: number, frames: number[], frameDuration: number) {
    this.id = id;
    this.frames = frames;
    this.frameDuration = frameDuration;
  }

  update(deltaTime: number): void {
    this.elapsedTime += deltaTime;

    if (this.elapsedTime >= this.frameDuration) {
      this.elapsedTime = 0;
      this.currentFrame = (this.currentFrame + 1) % this.frames.length;
    }
  }

  getCurrentTileId(): number {
    return this.frames[this.currentFrame];
  }
}

// Example: Animated water tiles
const waterTile = new AnimatedTile(
  10, // Base ID
  [10, 11, 12, 13], // Frame tile IDs
  200 // 200ms per frame
);

// In game loop
waterTile.update(deltaTime);
const tileIdToRender = waterTile.getCurrentTileId();
```

---

## Application to Mario Game

### Complete Mario Tilemap System

```typescript
// Mario tile IDs
enum MarioTiles {
  EMPTY = 0,
  GROUND = 1,
  BRICK = 2,
  QUESTION_BLOCK = 3,
  USED_BLOCK = 4,
  PIPE_TOP_LEFT = 5,
  PIPE_TOP_RIGHT = 6,
  PIPE_BODY_LEFT = 7,
  PIPE_BODY_RIGHT = 8,
  CLOUD_LEFT = 9,
  CLOUD_MIDDLE = 10,
  CLOUD_RIGHT = 11,
}

class MarioLevel {
  tilemap: LayeredTilemap;
  tileDB: TileDatabase;
  renderer: LayeredTileRenderer;
  animatedTiles: AnimatedTile[] = [];

  constructor(width: number, height: number) {
    this.tilemap = new LayeredTilemap(width, height, 16);
    this.tileDB = new TileDatabase();
    this.renderer = new LayeredTileRenderer(/* tileset */, 16);

    this.initializeTileDatabase();
  }

  private initializeTileDatabase(): void {
    this.tileDB.registerTile({
      id: MarioTiles.EMPTY,
      type: TileType.Empty,
      solid: false,
    });

    this.tileDB.registerTile({
      id: MarioTiles.GROUND,
      type: TileType.Solid,
      solid: true,
      friction: 0.8,
    });

    this.tileDB.registerTile({
      id: MarioTiles.BRICK,
      type: TileType.Solid,
      solid: true,
    });

    // Animated question block
    this.tileDB.registerTile({
      id: MarioTiles.QUESTION_BLOCK,
      type: TileType.Solid,
      solid: true,
      animated: true,
      frameCount: 4,
      frameDuration: 150,
    });
  }

  async loadFromJSON(path: string): Promise<void> {
    const data = await fetch(path).then(r => r.json());
    
    // Load each layer
    for (const layerData of data.layers) {
      this.tilemap.addLayer(layerData.name, layerData.tiles);
    }

    // Setup animated tiles
    const questionBlock = new AnimatedTile(
      MarioTiles.QUESTION_BLOCK,
      [3, 14, 15, 14], // Frame sequence
      150
    );
    this.animatedTiles.push(questionBlock);
  }

  update(deltaTime: number): void {
    // Update animated tiles
    for (const animTile of this.animatedTiles) {
      animTile.update(deltaTime);
    }
  }

  render(
    ctx: CanvasRenderingContext2D,
    cameraX: number,
    cameraY: number,
    viewportWidth: number,
    viewportHeight: number
  ): void {
    this.renderer.drawLayeredTilemap(
      ctx,
      this.tilemap,
      cameraX,
      cameraY,
      viewportWidth,
      viewportHeight
    );
  }

  /**
   * Check if a tile at given world position is solid
   */
  isSolidAt(worldX: number, worldY: number): boolean {
    const { tileX, tileY } = worldToTile(worldX, worldY, 16);
    const tileId = this.tilemap.getTile('terrain', tileX, tileY);
    return this.tileDB.isSolid(tileId);
  }

  /**
   * Get tile at world position
   */
  getTileAt(worldX: number, worldY: number, layerName = 'terrain'): number {
    const { tileX, tileY } = worldToTile(worldX, worldY, 16);
    return this.tilemap.getTile(layerName, tileX, tileY);
  }
}
```

### Usage in Game

```typescript
class MarioGame {
  level: MarioLevel;
  camera: Camera;
  player: Player;

  async init(): Promise<void> {
    // Load level
    this.level = new MarioLevel(200, 20); // 200×20 tiles
    await this.level.loadFromJSON('levels/1-1.json');

    // Initialize player
    this.player = new Player(32, 100);

    // Initialize camera
    this.camera = new Camera(0, 0, 800, 600);
  }

  update(deltaTime: number): void {
    // Update level (animated tiles)
    this.level.update(deltaTime);

    // Update player
    this.player.update(deltaTime);

    // Check tile collisions
    this.checkPlayerTileCollisions();

    // Update camera
    this.camera.follow(this.player.x, this.player.y);
  }

  render(ctx: CanvasRenderingContext2D): void {
    // Clear screen
    ctx.fillStyle = '#5c94fc';
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    // Render level
    this.level.render(
      ctx,
      this.camera.x,
      this.camera.y,
      ctx.canvas.width,
      ctx.canvas.height
    );

    // Render player
    this.player.render(ctx, this.camera.x, this.camera.y);
  }

  private checkPlayerTileCollisions(): void {
    // Check tiles around player's bounding box
    const left = this.player.x;
    const right = this.player.x + this.player.width;
    const top = this.player.y;
    const bottom = this.player.y + this.player.height;

    // Check bottom collision (standing on ground)
    if (this.level.isSolidAt(left, bottom) || this.level.isSolidAt(right, bottom)) {
      // Player is on ground
      this.player.onGround = true;
      this.player.velocityY = 0;
      
      // Snap to tile grid
      const { tileY } = worldToTile(bottom, 0, 16);
      this.player.y = tileY * 16 - this.player.height;
    }

    // Check top collision (hit ceiling)
    if (this.level.isSolidAt(left, top) || this.level.isSolidAt(right, top)) {
      this.player.velocityY = Math.max(0, this.player.velocityY);
    }

    // Check side collisions...
  }
}
```

---

## Performance Considerations

### Benchmark: Rendering Strategies

| Strategy | 200×20 Level | 1000×20 Level | Notes |
|----------|--------------|---------------|-------|
| **Naive (all tiles)** | 40ms (25 FPS) | 200ms (5 FPS) | Draw every tile |
| **Viewport culling** | 3.75ms (266 FPS) | 3.75ms (266 FPS) | Draw visible only |
| **Pre-rendered canvas** | 0.5ms (2000 FPS) | 0.5ms (2000 FPS) | Static levels |
| **Chunked + culling** | 2ms (500 FPS) | 2ms (500 FPS) | Dynamic levels |

### Optimization Techniques

#### 1. Use Viewport Culling (Always)

```typescript
// Calculate visible range ONCE per frame
const startX = Math.floor(cameraX / tileSize);
const startY = Math.floor(cameraY / tileSize);
const endX = Math.ceil((cameraX + viewportWidth) / tileSize) + 1; // +1 for safety
const endY = Math.ceil((cameraY + viewportHeight) / tileSize) + 1;

// Only iterate visible tiles
for (let y = startY; y < endY; y++) {
  for (let x = startX; x < endX; x++) {
    // Draw tile
  }
}
```

**Result:** 10-100× speedup depending on level size.

#### 2. Pre-render Static Layers

```typescript
// Create offscreen canvas ONCE
const offscreen = document.createElement('canvas');
offscreen.width = levelWidth * tileSize;
offscreen.height = levelHeight * tileSize;

// Render static layer ONCE
const offCtx = offscreen.getContext('2d')!;
renderTilemap(offCtx, staticLayer);

// In game loop, just draw the offscreen canvas
ctx.drawImage(offscreen, -cameraX, -cameraY);
```

**Result:** ~100× speedup for static layers.

#### 3. Batch Draw Calls

Instead of calling `drawImage()` for every tile, batch similar tiles:

```typescript
// Group tiles by texture region
const batches = new Map<number, { x: number; y: number }[]>();

for (let y = startY; y < endY; y++) {
  for (let x = startX; x < endX; x++) {
    const tileId = getTile(x, y);
    if (!batches.has(tileId)) batches.set(tileId, []);
    batches.get(tileId)!.push({ x, y });
  }
}

// Draw all instances of each tile together
for (const [tileId, positions] of batches) {
  for (const pos of positions) {
    drawTile(tileId, pos.x, pos.y);
  }
}
```

**Note:** This is an advanced technique with diminishing returns in Canvas. More useful for WebGL.

#### 4. Use Integer Coordinates

```typescript
// Slow (floating point)
ctx.drawImage(tileset, srcX, srcY, 16, 16, x * 16.5, y * 16.5, 16, 16);

// Fast (integers)
ctx.drawImage(tileset, srcX, srcY, 16, 16, Math.floor(x * 16), Math.floor(y * 16), 16, 16);
```

**Result:** ~20% speedup.

#### 5. Disable Image Smoothing for Pixel Art

```typescript
ctx.imageSmoothingEnabled = false;
```

**Result:** ~10-15% speedup + sharper pixel art.

### Memory Optimization

#### Use Typed Arrays for Large Tilemaps

```typescript
// Normal array: ~80 bytes per tile (V8 engine)
const tiles: number[] = new Array(200 * 20); // ~320 KB

// Typed array: 2 bytes per tile
const tiles: Uint16Array = new Uint16Array(200 * 20); // ~8 KB

// 40× less memory!
```

**When to use:**
- Levels larger than 100×100 tiles
- Mobile devices with limited memory
- When loading many levels at once

---

## Summary

### What You've Learned

In this lesson, you've mastered:

- ✅ **Tilemap fundamentals**: Grid-based level design with reusable tiles
- ✅ **Data structures**: 2D arrays, flat arrays, and JSON formats
- ✅ **Loading**: From JSON, CSV, and Tiled editor
- ✅ **Rendering**: Basic rendering, optimized rendering, pre-rendering
- ✅ **Tilesets**: Loading, organizing, and using sprite sheets
- ✅ **Coordinate conversion**: World ↔ tile coordinates
- ✅ **Viewport culling**: Rendering only visible tiles (10× speedup)
- ✅ **Multi-layer tilemaps**: Separating background, terrain, foreground
- ✅ **Tile metadata**: Solid, hazard, friction, animated tiles
- ✅ **Complete Mario system**: A production-ready tilemap implementation

### Key Takeaways

1. **Tilemaps are memory-efficient**: Store levels as small arrays instead of large images.

2. **Viewport culling is essential**: Only render visible tiles for 10-100× speedup.

3. **Layers add depth**: Separate background, terrain, and foreground for visual richness.

4. **Metadata enables gameplay**: Store collision info, damage, friction in tile data.

5. **Coordinate conversion is crucial**: Master world ↔ tile coordinate transformations.

6. **Pre-rendering is powerful**: For static levels, pre-render to offscreen canvas.

7. **Use the right data structure**: Flat arrays (Uint16Array) for large levels.

### Tilemap Best Practices

```typescript
// ✓ DO: Use viewport culling
const startX = Math.floor(cameraX / tileSize);
const endX = Math.ceil((cameraX + viewportWidth) / tileSize);

// ✓ DO: Pre-render static layers
const offscreen = prerenderStaticLayer(tilemap);

// ✓ DO: Use tile metadata
if (tileDB.isSolid(tileId)) { /* collision */ }

// ✓ DO: Clamp tile coordinates
const x = Math.max(0, Math.min(width - 1, tileX));

// ✗ DON'T: Render all tiles
for (let y = 0; y < height; y++) { /* BAD */ }

// ✗ DON'T: Use floating point for tile IDs
const tileId = 3.5; // BAD - tiles are integers

// ✗ DON'T: Hardcode tile properties
if (tileId === 1) solid = true; // BAD - use metadata
```

---

## Next Steps

### Immediate Practice

Complete the exercises in `b-exercises.md`:

1. Load and render a simple tilemap
2. Implement viewport culling
3. Create a multi-layer tilemap
4. Add tile metadata
5. Build a Mario level loader

### Next Topic: Collision Maps

In **Unit 04, Topic 02**, you'll learn:

- Separate collision geometry from visual tiles
- Implement tile-based collision detection
- Handle slopes and one-way platforms
- Optimize collision checks with spatial partitioning
- Build a complete collision system for Mario

### Project: Build a Level Editor

Challenge yourself:

```typescript
// Create a simple level editor
class LevelEditor {
  currentTileId = 1;
  
  onMouseClick(x: number, y: number): void {
    const { tileX, tileY } = worldToTile(x, y, tileSize);
    tilemap.setTile(tileX, tileY, this.currentTileId);
  }
  
  save(): string {
    return JSON.stringify(tilemap);
  }
  
  load(json: string): void {
    const data = JSON.parse(json);
    // Load tilemap
  }
}
```

### Further Reading

- [Tiled Map Editor Documentation](https://doc.mapeditor.org/)
- [LDtk Level Designer](https://ldtk.io/)
- [Super Mario Bros Level Design Analysis](https://www.gamedeveloper.com/design/super-mario-bros-level-1-1-a-masterclass-in-game-design)
- Unit 04, Topic 02: Collision Maps (next lesson)

---

**Congratulations!** You now understand the foundation of 2D level design. Tilemaps power countless classic games, and you've just learned how to build them from scratch. Keep practicing, and you'll be creating sprawling Mario worlds in no time! 🎮🍄

