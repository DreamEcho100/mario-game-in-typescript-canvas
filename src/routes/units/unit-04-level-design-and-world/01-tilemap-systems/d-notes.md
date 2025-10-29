# Tilemap Systems - Quick Reference

**Unit 04: Level Design & World Systems | Topic 01 | Cheat Sheet**

---

## Core Concepts

### What is a Tilemap?

A **tilemap** is a 2D grid where each cell contains a **tile ID** that refers to an image in a **tileset**.

```
Benefits:
✓ Memory efficient (store IDs, not pixels)
✓ Easy editing (change array values)
✓ Consistent visuals (reuse tiles)
✓ Collision-friendly (grid-based)
```

---

## Data Structures

### Flat Array (Recommended)

```typescript
interface Tilemap {
  width: number;
  height: number;
  tiles: number[]; // or Uint16Array for large maps
}

// Access: index = y * width + x
const tileId = tiles[y * width + x];
```

### Tilemap Class

```typescript
class Tilemap {
  width: number;
  height: number;
  tiles: number[];

  getTile(x: number, y: number): number {
    if (x < 0 || x >= this.width || y < 0 || y >= this.height) return -1;
    return this.tiles[y * this.width + x];
  }

  setTile(x: number, y: number, tileId: number): void {
    if (x < 0 || x >= this.width || y < 0 || y >= this.height) return;
    this.tiles[y * this.width + x] = tileId;
  }
}
```

---

## Rendering

### Basic Tile Rendering

```typescript
class TileRenderer {
  drawTile(ctx: CanvasRenderingContext2D, tileId: number, x: number, y: number): void {
    if (tileId <= 0) return;

    const srcX = (tileId % this.tilesPerRow) * this.tileSize;
    const srcY = Math.floor(tileId / this.tilesPerRow) * this.tileSize;

    ctx.drawImage(
      this.tileset,
      srcX, srcY, this.tileSize, this.tileSize,
      x, y, this.tileSize, this.tileSize
    );
  }
}
```

### Viewport Culling (Essential!)

```typescript
drawTilemapCulled(
  ctx: CanvasRenderingContext2D,
  tilemap: Tilemap,
  cameraX: number,
  cameraY: number,
  viewportWidth: number,
  viewportHeight: number
): void {
  const startX = Math.max(0, Math.floor(cameraX / this.tileSize) - 1);
  const startY = Math.max(0, Math.floor(cameraY / this.tileSize) - 1);
  const endX = Math.min(tilemap.width, Math.ceil((cameraX + viewportWidth) / this.tileSize) + 1);
  const endY = Math.min(tilemap.height, Math.ceil((cameraY + viewportHeight) / this.tileSize) + 1);

  for (let y = startY; y < endY; y++) {
    for (let x = startX; x < endX; x++) {
      const tileId = tilemap.getTile(x, y);
      if (tileId > 0) {
        this.drawTile(ctx, tileId, x * this.tileSize - cameraX, y * this.tileSize - cameraY);
      }
    }
  }
}
```

### Pre-rendered Offscreen Canvas

```typescript
// Render once
const offscreen = document.createElement('canvas');
offscreen.width = tilemap.width * tileSize;
offscreen.height = tilemap.height * tileSize;
const offCtx = offscreen.getContext('2d')!;
renderTilemap(offCtx, tilemap);

// Draw every frame (super fast!)
ctx.drawImage(offscreen, -cameraX, -cameraY);
```

---

## Coordinate Conversion

### World ↔ Tile

```typescript
// World pixel → Tile coordinate
function worldToTile(worldX: number, worldY: number, tileSize: number) {
  return {
    tileX: Math.floor(worldX / tileSize),
    tileY: Math.floor(worldY / tileSize),
  };
}

// Tile coordinate → World pixel (top-left)
function tileToWorld(tileX: number, tileY: number, tileSize: number) {
  return {
    worldX: tileX * tileSize,
    worldY: tileY * tileSize,
  };
}

// Tile coordinate → World pixel (center)
function tileToWorldCenter(tileX: number, tileY: number, tileSize: number) {
  return {
    worldX: tileX * tileSize + tileSize / 2,
    worldY: tileY * tileSize + tileSize / 2,
  };
}
```

### Tiles in Rectangle

```typescript
// Get all tiles overlapping a rectangle
function getTilesInRect(x: number, y: number, width: number, height: number, tileSize: number) {
  const startX = Math.floor(x / tileSize);
  const startY = Math.floor(y / tileSize);
  const endX = Math.floor((x + width - 1) / tileSize);
  const endY = Math.floor((y + height - 1) / tileSize);

  const tiles: { tileX: number; tileY: number }[] = [];
  for (let ty = startY; ty <= endY; ty++) {
    for (let tx = startX; tx <= endX; tx++) {
      tiles.push({ tileX: tx, tileY: ty });
    }
  }
  return tiles;
}
```

---

## Loading

### From JSON

```typescript
interface TilemapData {
  width: number;
  height: number;
  tileSize: number;
  tiles: number[];
  tileset?: string;
}

async function loadTilemap(path: string): Promise<TilemapData> {
  const response = await fetch(path);
  return await response.json();
}

// Usage
const data = await loadTilemap('levels/1-1.json');
const tilemap = new Tilemap(data.width, data.height);
tilemap.tiles = data.tiles;
```

### JSON Format

```json
{
  "width": 10,
  "height": 10,
  "tileSize": 16,
  "tileset": "tileset.png",
  "tiles": [
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 3, 0, 0, 0, 0, 0,
    1, 1, 1, 1, 1, 1, 1, 1, 1, 1
  ]
}
```

---

## Multi-Layer Tilemaps

### Layer Structure

```typescript
interface TilemapLayer {
  name: string;
  tiles: number[];
  visible: boolean;
  opacity: number;
  parallaxX?: number;
  parallaxY?: number;
}

class LayeredTilemap {
  width: number;
  height: number;
  layers: TilemapLayer[] = [];

  addLayer(name: string, tiles: number[]): void {
    this.layers.push({ name, tiles, visible: true, opacity: 1.0 });
  }

  getTile(layerName: string, x: number, y: number): number {
    const layer = this.layers.find(l => l.name === layerName);
    if (!layer) return -1;
    return layer.tiles[y * this.width + x];
  }
}
```

### Rendering Layers

```typescript
for (const layer of tilemap.layers) {
  if (!layer.visible) continue;

  ctx.globalAlpha = layer.opacity;
  const layerCameraX = cameraX * (layer.parallaxX ?? 1.0);
  const layerCameraY = cameraY * (layer.parallaxY ?? 1.0);

  drawLayer(ctx, layer, layerCameraX, layerCameraY);
}
ctx.globalAlpha = 1.0;
```

---

## Tile Metadata

### Tile Database

```typescript
enum TileType {
  Empty = 0,
  Solid = 1,
  Platform = 2,
  Hazard = 3,
}

interface TileMetadata {
  id: number;
  type: TileType;
  solid: boolean;
  friction?: number;
  damage?: number;
}

class TileDatabase {
  tiles = new Map<number, TileMetadata>();

  registerTile(meta: TileMetadata): void {
    this.tiles.set(meta.id, meta);
  }

  isSolid(tileId: number): boolean {
    return this.tiles.get(tileId)?.solid ?? false;
  }

  getFriction(tileId: number): number {
    return this.tiles.get(tileId)?.friction ?? 0.8;
  }
}
```

### Common Tile Properties

```typescript
tileDB.registerTile({ id: 0, type: TileType.Empty, solid: false });
tileDB.registerTile({ id: 1, type: TileType.Solid, solid: true, friction: 0.8 });
tileDB.registerTile({ id: 2, type: TileType.Platform, solid: true, friction: 0.7 });
tileDB.registerTile({ id: 3, type: TileType.Hazard, solid: false, damage: 1 });
```

---

## Animated Tiles

### Animation Class

```typescript
class AnimatedTile {
  frames: number[];
  frameDuration: number;
  currentFrame = 0;
  elapsedTime = 0;

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

// Usage
const waterTile = new AnimatedTile([10, 11, 12, 13], 200);

// In game loop
waterTile.update(deltaTime);
const tileId = waterTile.getCurrentTileId();
```

---

## Performance Tips

### Culling Stats

| Technique | 200×20 Map | Speedup |
|-----------|------------|---------|
| No culling | 40ms | 1× |
| Viewport culling | 3.75ms | 10× |
| Pre-rendered | 0.5ms | 80× |
| Chunked | 2ms | 20× |

### Optimization Checklist

- ✅ **Always use viewport culling** (10-100× speedup)
- ✅ **Pre-render static layers** (offscreen canvas)
- ✅ **Skip empty tiles** (tile ID 0)
- ✅ **Use integer coordinates** (no fractional pixels)
- ✅ **Disable image smoothing** for pixel art
- ✅ **Use Uint16Array** for large maps (40× less memory)
- ✅ **Batch similar tiles** (advanced)
- ✅ **Add 1-tile border** to culling (prevent pop-in)

### Common Performance Mistakes

```typescript
// ❌ BAD: Render all tiles
for (let y = 0; y < height; y++) {
  for (let x = 0; x < width; x++) {
    drawTile(x, y);
  }
}

// ✅ GOOD: Render only visible
const startX = Math.floor(cameraX / tileSize);
const endX = Math.ceil((cameraX + viewportWidth) / tileSize);
for (let x = startX; x < endX; x++) {
  drawTile(x, y);
}

// ❌ BAD: Create new canvas every frame
const canvas = document.createElement('canvas');

// ✅ GOOD: Reuse offscreen canvas
const offscreen = document.createElement('canvas'); // Once
ctx.drawImage(offscreen, 0, 0); // Every frame
```

---

## Common Patterns

### Check if Player is on Ground

```typescript
const playerBottom = player.y + player.height;
const { tileX, tileY } = worldToTile(player.x, playerBottom, tileSize);
const tileBelow = tilemap.getTile(tileX, tileY);

if (tileDB.isSolid(tileBelow)) {
  player.onGround = true;
}
```

### Get Tile at World Position

```typescript
function getTileAt(worldX: number, worldY: number): number {
  const { tileX, tileY } = worldToTile(worldX, worldY, tileSize);
  return tilemap.getTile(tileX, tileY);
}

const tile = getTileAt(player.x, player.y);
if (tileDB.isSolid(tile)) {
  // Handle collision
}
```

### Iterate Tiles Around Entity

```typescript
const padding = 1; // Check 1 tile beyond entity
const minX = Math.floor((entity.x - padding * tileSize) / tileSize);
const minY = Math.floor((entity.y - padding * tileSize) / tileSize);
const maxX = Math.ceil((entity.x + entity.width + padding * tileSize) / tileSize);
const maxY = Math.ceil((entity.y + entity.height + padding * tileSize) / tileSize);

for (let y = minY; y < maxY; y++) {
  for (let x = minX; x < maxX; x++) {
    const tileId = tilemap.getTile(x, y);
    // Check collision with this tile
  }
}
```

---

## Debugging Tips

### Visualize Tile Grid

```typescript
ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
ctx.lineWidth = 1;

for (let y = 0; y <= height; y++) {
  ctx.beginPath();
  ctx.moveTo(0, y * tileSize);
  ctx.lineTo(width * tileSize, y * tileSize);
  ctx.stroke();
}

for (let x = 0; x <= width; x++) {
  ctx.beginPath();
  ctx.moveTo(x * tileSize, 0);
  ctx.lineTo(x * tileSize, height * tileSize);
  ctx.stroke();
}
```

### Display Tile IDs

```typescript
ctx.font = '10px monospace';
ctx.fillStyle = 'white';
ctx.textAlign = 'center';

for (let y = 0; y < height; y++) {
  for (let x = 0; x < width; x++) {
    const tileId = tilemap.getTile(x, y);
    if (tileId > 0) {
      ctx.fillText(
        tileId.toString(),
        x * tileSize + tileSize / 2,
        y * tileSize + tileSize / 2
      );
    }
  }
}
```

### Highlight Solid Tiles

```typescript
for (let y = 0; y < height; y++) {
  for (let x = 0; x < width; x++) {
    const tileId = tilemap.getTile(x, y);
    if (tileDB.isSolid(tileId)) {
      ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';
      ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
    }
  }
}
```

### Draw Culling Bounds

```typescript
ctx.strokeStyle = 'lime';
ctx.lineWidth = 2;
ctx.strokeRect(
  startX * tileSize - cameraX,
  startY * tileSize - cameraY,
  (endX - startX) * tileSize,
  (endY - startY) * tileSize
);
```

---

## Common Values

### Tile Sizes

| Game | Tile Size | Notes |
|------|-----------|-------|
| Super Mario Bros | 16×16 | NES classic |
| Sonic | 16×16 | Genesis |
| Celeste | 8×8 | Modern indie |
| Stardew Valley | 16×16 | Farming sim |
| Terraria | 16×16 | Sandbox |

### Map Sizes

| Type | Size (tiles) | Size (pixels @ 16px) |
|------|--------------|---------------------|
| Small room | 20×15 | 320×240 |
| Single screen | 40×30 | 640×480 |
| Mario level | 200×20 | 3200×320 |
| Large world | 1000×100 | 16000×1600 |

### Memory Usage

```
Tilemap storage (flat array):
- Normal array: ~80 bytes/tile
- Uint16Array: 2 bytes/tile (40× smaller!)

Example: 200×20 tilemap = 4,000 tiles
- Normal: ~320 KB
- Uint16: ~8 KB

Tileset image (16×16 tiles, 128×128 px):
- PNG: ~5-10 KB (compressed)
- Memory: ~64 KB (uncompressed RGBA)
```

---

## Quick Start Template

```typescript
// Complete minimal tilemap system
class Game {
  tilemap: Tilemap;
  renderer: TileRenderer;
  camera = { x: 0, y: 0 };

  async init() {
    // Load data
    const data = await loadTilemap('level.json');
    this.tilemap = new Tilemap(data.width, data.height);
    this.tilemap.tiles = data.tiles;

    // Load tileset
    const tileset = await loadImage(data.tileset);
    this.renderer = new TileRenderer(tileset, data.tileSize);
  }

  update(deltaTime: number) {
    // Update camera, entities, etc.
  }

  render(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = '#5c94fc';
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    this.renderer.drawTilemapCulled(
      ctx,
      this.tilemap,
      this.camera.x,
      this.camera.y,
      ctx.canvas.width,
      ctx.canvas.height
    );
  }
}

const game = new Game();
await game.init();
gameLoop();
```

---

## Formulas

### Index Conversion

```typescript
// 2D → 1D
index = y * width + x

// 1D → 2D
x = index % width
y = Math.floor(index / width)
```

### Tile ID → Tileset Position

```typescript
// Given tile ID and tileset dimensions
const col = tileId % tilesPerRow;
const row = Math.floor(tileId / tilesPerRow);
const srcX = col * tileSize;
const srcY = row * tileSize;
```

### Viewport Culling Range

```typescript
startX = Math.floor(cameraX / tileSize) - border
startY = Math.floor(cameraY / tileSize) - border
endX = Math.ceil((cameraX + viewportWidth) / tileSize) + border
endY = Math.ceil((cameraY + viewportHeight) / tileSize) + border
```

---

## Next Steps

- ✅ Master viewport culling (essential!)
- ✅ Implement multi-layer tilemaps
- ✅ Add tile metadata for collision
- ✅ Create animated tiles
- ⏭️ **Next Topic**: Collision Maps (tile-based collision detection)

---

**Quick Tip**: Always implement viewport culling first! It's the single most important optimization for tilemaps, giving you 10-100× performance improvement with minimal code.
