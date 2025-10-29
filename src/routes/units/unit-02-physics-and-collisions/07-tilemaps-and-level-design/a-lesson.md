# Lesson: Tilemaps & Level Design

## Building on Unit 01-05: Applying World Coordinates to Tiles

**Important:** This lesson builds directly on **Unit 01-05: World Coordinate System**. If you haven't completed that lesson, go back now!

### Quick Recap from Unit 01-05

You already learned about:
- ✅ **World Space** vs **Screen Space**  
- ✅ **Camera systems** (what part of world is visible)
- ✅ **Coordinate conversion** (`screenX = worldX - camera.x`)
- ✅ **Culling** (only draw visible entities)

```typescript
// You already know this from Unit 01-05:
class Camera {
    x: number;  // Camera position in world
    y: number;
    
    worldToScreen(worldX: number, worldY: number) {
        return {
            screenX: worldX - this.x,
            screenY: worldY - this.y
        };
    }
}
```

### What's NEW in This Lesson

Instead of treating every platform as an individual entity, we organize the world into a **GRID**:

**Before (Unit 01-05):**
```typescript
const platforms = [
    { x: 0, y: 568, width: 800, height: 32 },
    { x: 200, y: 400, width: 128, height: 32 },
    { x: 500, y: 300, width: 128, height: 32 },
    // ... hundreds more? 😰
];
```

**After (This Lesson - Tilemaps):**
```typescript
const level = [
    [1, 1, 1, 1, 1, 1, 1, 1],  // Row of wall tiles
    [1, 0, 0, 0, 0, 0, 0, 1],  // 0 = empty, 1 = solid
    [1, 0, 0, 2, 2, 0, 0, 1],  // 2 = platform
    [1, 1, 1, 1, 1, 1, 1, 1],
];
// Much cleaner! 😊
```

### Why Tilemaps?

**Memory Efficiency:**
- 100 platforms = 100 objects with x, y, width, height
- 100 tiles = 100 numbers in an array (4× smaller!)

**Collision Optimization:**
- Old way: Check player vs ALL platforms (`O(n)`)
- Tilemap way: Check player vs nearby tiles only (`O(1)`)

**Level Editing:**
- Old way: Manually position every platform in code
- Tilemap way: Edit a 2D array or use [Tiled Editor](https://www.mapeditor.org/)

**The Big Idea:**
Tilemaps are just **applying Unit 01-05's camera system to a grid-based world**. Same camera formulas, same culling logic — just organized differently!

---

## Introduction

Tilemaps are the foundation of level design in platformers. Instead of manually placing hundreds of platforms, we define levels using a **grid-based system** where each cell contains a tile type.

**Benefits**:
- Easy level editing (just edit numbers in array)
- Memory efficient (reuse same tile images)
- Collision detection optimized (only check nearby tiles)
- Standard format (can use tools like Tiled)

---

## What is a Tilemap?

A tilemap is a 2D grid where each cell represents a tile in your level:

```typescript
const level = [
  [1, 1, 1, 1, 1, 1, 1, 1],  // Row 0: All walls
  [1, 0, 0, 0, 0, 0, 0, 1],  // Row 1: Empty space
  [1, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 2, 2, 0, 0, 1],  // Row 3: Platform
  [1, 0, 0, 0, 0, 0, 0, 1],
  [1, 1, 1, 1, 1, 1, 1, 1],  // Bottom wall
];

// 0 = Empty
// 1 = Solid block
// 2 = Platform (one-way)
```

Each number represents a different tile type, and we render/check collision based on these values.

---

## Basic Tilemap Implementation

### 1. Tilemap Class

```typescript
class Tilemap {
  data: number[][];
  tileSize: number;
  width: number;
  height: number;
  
  constructor(data: number[][], tileSize: number = 32) {
    this.data = data;
    this.tileSize = tileSize;
    this.height = data.length;
    this.width = data[0]?.length || 0;
  }
  
  // Get tile at grid position
  getTile(col: number, row: number): number {
    if (row < 0 || row >= this.height || col < 0 || col >= this.width) {
      return -1; // Out of bounds
    }
    return this.data[row][col];
  }
  
  // Convert world position to grid position
  worldToGrid(x: number, y: number): { col: number; row: number } {
    return {
      col: Math.floor(x / this.tileSize),
      row: Math.floor(y / this.tileSize)
    };
  }
  
  // Convert grid position to world position (top-left corner)
  gridToWorld(col: number, row: number): { x: number; y: number } {
    return {
      x: col * this.tileSize,
      y: row * this.tileSize
    };
  }
  
  // Check if tile is solid
  isSolid(col: number, row: number): boolean {
    const tile = this.getTile(col, row);
    return tile === 1; // 1 = solid wall
  }
  
  draw(ctx: CanvasRenderingContext2D): void {
    for (let row = 0; row < this.height; row++) {
      for (let col = 0; col < this.width; col++) {
        const tile = this.data[row][col];
        const worldPos = this.gridToWorld(col, row);
        
        // Draw based on tile type
        if (tile === 1) {
          // Solid block
          ctx.fillStyle = '#795548';
          ctx.fillRect(worldPos.x, worldPos.y, this.tileSize, this.tileSize);
          
          // Border
          ctx.strokeStyle = '#5D4037';
          ctx.lineWidth = 2;
          ctx.strokeRect(worldPos.x, worldPos.y, this.tileSize, this.tileSize);
        } else if (tile === 2) {
          // Platform (one-way)
          ctx.fillStyle = '#FFA726';
          ctx.fillRect(worldPos.x, worldPos.y, this.tileSize, 8);
        }
      }
    }
  }
}
```

---

## Tilemap Collision Detection

Instead of checking collision against every tile, we only check tiles **near the player**:

```typescript
class Player {
  x: number;
  y: number;
  width = 28;  // Slightly smaller than tile for smoother collision
  height = 28;
  velocityX = 0;
  velocityY = 0;
  
  readonly GRAVITY = 1400;
  readonly MOVE_SPEED = 200;
  readonly JUMP_FORCE = -450;
  
  isGrounded = false;
  
  get left() { return this.x - this.width / 2; }
  get right() { return this.x + this.width / 2; }
  get top() { return this.y - this.height / 2; }
  get bottom() { return this.y + this.height / 2; }
  
  update(dt: number, tilemap: Tilemap, input: { left: boolean; right: boolean; jump: boolean }): void {
    const dtSec = dt / 1000;
    
    // Horizontal movement
    this.velocityX = 0;
    if (input.left) this.velocityX = -this.MOVE_SPEED;
    if (input.right) this.velocityX = this.MOVE_SPEED;
    
    this.x += this.velocityX * dtSec;
    this.resolveTilemapCollisionX(tilemap);
    
    // Gravity
    this.velocityY += this.GRAVITY * dtSec;
    this.y += this.velocityY * dtSec;
    
    this.isGrounded = false;
    this.resolveTilemapCollisionY(tilemap);
    
    // Jump
    if (input.jump && this.isGrounded) {
      this.velocityY = this.JUMP_FORCE;
    }
  }
  
  resolveTilemapCollisionX(tilemap: Tilemap): void {
    // Get player's grid bounds
    const leftTile = Math.floor(this.left / tilemap.tileSize);
    const rightTile = Math.floor(this.right / tilemap.tileSize);
    const topTile = Math.floor(this.top / tilemap.tileSize);
    const bottomTile = Math.floor(this.bottom / tilemap.tileSize);
    
    // Check tiles player overlaps
    for (let row = topTile; row <= bottomTile; row++) {
      for (let col = leftTile; col <= rightTile; col++) {
        if (tilemap.isSolid(col, row)) {
          const tileWorld = tilemap.gridToWorld(col, row);
          const tileLeft = tileWorld.x;
          const tileRight = tileWorld.x + tilemap.tileSize;
          
          // Calculate overlap
          const overlapLeft = this.right - tileLeft;
          const overlapRight = tileRight - this.left;
          
          // Push out on smallest overlap
          if (overlapLeft < overlapRight) {
            this.x = tileLeft - this.width / 2;
          } else {
            this.x = tileRight + this.width / 2;
          }
          this.velocityX = 0;
        }
      }
    }
  }
  
  resolveTilemapCollisionY(tilemap: Tilemap): void {
    const leftTile = Math.floor(this.left / tilemap.tileSize);
    const rightTile = Math.floor(this.right / tilemap.tileSize);
    const topTile = Math.floor(this.top / tilemap.tileSize);
    const bottomTile = Math.floor(this.bottom / tilemap.tileSize);
    
    for (let row = topTile; row <= bottomTile; row++) {
      for (let col = leftTile; col <= rightTile; col++) {
        if (tilemap.isSolid(col, row)) {
          const tileWorld = tilemap.gridToWorld(col, row);
          const tileTop = tileWorld.y;
          const tileBottom = tileWorld.y + tilemap.tileSize;
          
          const overlapTop = this.bottom - tileTop;
          const overlapBottom = tileBottom - this.top;
          
          if (overlapTop < overlapBottom) {
            // Landing on top
            this.y = tileTop - this.height / 2;
            this.velocityY = 0;
            this.isGrounded = true;
          } else {
            // Hitting head
            this.y = tileBottom + this.height / 2;
            this.velocityY = 0;
          }
        }
      }
    }
  }
  
  draw(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = this.isGrounded ? '#4CAF50' : '#2196F3';
    ctx.fillRect(this.left, this.top, this.width, this.height);
    
    // Eyes
    ctx.fillStyle = 'white';
    ctx.fillRect(this.x - 8, this.y - 6, 6, 6);
    ctx.fillRect(this.x + 2, this.y - 6, 6, 6);
    
    ctx.fillStyle = 'black';
    ctx.fillRect(this.x - 6, this.y - 4, 3, 3);
    ctx.fillRect(this.x + 4, this.y - 4, 3, 3);
  }
}
```

---

## Complete Tilemap Game Example

```typescript
const canvas = document.getElementById('game') as HTMLCanvasElement;
const ctx = canvas.getContext('2d')!;

canvas.width = 800;
canvas.height = 600;

// Level design
const levelData = [
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1],
  [1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
];

const tilemap = new Tilemap(levelData, 32);
const player = new Player(64, 64);

// Input
const keys = new Set<string>();
window.addEventListener('keydown', (e) => keys.add(e.key));
window.addEventListener('keyup', (e) => keys.delete(e.key));

// Camera
class Camera {
  x = 0;
  y = 0;
  
  follow(target: Player, canvasWidth: number, canvasHeight: number, levelWidth: number, levelHeight: number): void {
    // Center on player
    this.x = target.x - canvasWidth / 2;
    this.y = target.y - canvasHeight / 2;
    
    // Clamp to level bounds
    this.x = Math.max(0, Math.min(this.x, levelWidth - canvasWidth));
    this.y = Math.max(0, Math.min(this.y, levelHeight - canvasHeight));
  }
  
  apply(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    ctx.translate(-this.x, -this.y);
  }
  
  restore(ctx: CanvasRenderingContext2D): void {
    ctx.restore();
  }
}

const camera = new Camera();

// Game loop
let lastTime = performance.now();

function gameLoop(currentTime: number): void {
  const dt = currentTime - lastTime;
  lastTime = currentTime;
  
  // Input
  const input = {
    left: keys.has('a') || keys.has('ArrowLeft'),
    right: keys.has('d') || keys.has('ArrowRight'),
    jump: keys.has(' ') || keys.has('w') || keys.has('ArrowUp')
  };
  
  // Update
  player.update(dt, tilemap, input);
  
  const levelWidth = tilemap.width * tilemap.tileSize;
  const levelHeight = tilemap.height * tilemap.tileSize;
  camera.follow(player, canvas.width, canvas.height, levelWidth, levelHeight);
  
  // Draw
  ctx.fillStyle = '#87CEEB'; // Sky blue
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  camera.apply(ctx);
  
  tilemap.draw(ctx);
  player.draw(ctx);
  
  camera.restore(ctx);
  
  // UI
  ctx.fillStyle = 'black';
  ctx.font = '16px monospace';
  ctx.fillText(`Position: (${Math.floor(player.x)}, ${Math.floor(player.y)})`, 10, 20);
  ctx.fillText(`Grounded: ${player.isGrounded}`, 10, 40);
  
  requestAnimationFrame(gameLoop);
}

gameLoop(performance.now());
```

---

## Advanced Features

### 1. **Tile Properties**

Instead of just numbers, use objects with properties:

```typescript
interface TileType {
  id: number;
  solid: boolean;
  oneWay: boolean;
  damaging: boolean;
  color: string;
}

const TILE_TYPES: Record<number, TileType> = {
  0: { id: 0, solid: false, oneWay: false, damaging: false, color: 'transparent' },
  1: { id: 1, solid: true, oneWay: false, damaging: false, color: '#795548' },
  2: { id: 2, solid: false, oneWay: true, damaging: false, color: '#FFA726' },
  3: { id: 3, solid: false, oneWay: false, damaging: true, color: '#F44336' },
};
```

### 2. **Tile Sprites**

Load sprite sheet and draw tile images:

```typescript
class Tilemap {
  spriteSheet: HTMLImageElement;
  
  drawWithSprites(ctx: CanvasRenderingContext2D): void {
    for (let row = 0; row < this.height; row++) {
      for (let col = 0; col < this.width; col++) {
        const tile = this.data[row][col];
        if (tile === 0) continue;
        
        const worldPos = this.gridToWorld(col, row);
        
        // Calculate sprite position in sheet (16x16 tiles in sheet)
        const sheetCol = tile % 16;
        const sheetRow = Math.floor(tile / 16);
        
        ctx.drawImage(
          this.spriteSheet,
          sheetCol * 16, sheetRow * 16, 16, 16,  // Source
          worldPos.x, worldPos.y, this.tileSize, this.tileSize  // Dest
        );
      }
    }
  }
}
```

### 3. **Multiple Layers**

Separate background, collision, and foreground:

```typescript
class LayeredTilemap {
  backgroundLayer: number[][];
  collisionLayer: number[][];
  foregroundLayer: number[][];
  
  draw(ctx: CanvasRenderingContext2D): void {
    this.drawLayer(ctx, this.backgroundLayer, 0.5); // Parallax
    this.drawLayer(ctx, this.collisionLayer, 1.0);
    this.drawLayer(ctx, this.foregroundLayer, 1.0);
  }
}
```

### 4. **Procedural Generation**

Generate levels programmatically:

```typescript
function generateLevel(width: number, height: number): number[][] {
  const level: number[][] = [];
  
  for (let row = 0; row < height; row++) {
    level[row] = [];
    for (let col = 0; col < width; col++) {
      // Walls on edges
      if (row === 0 || row === height - 1 || col === 0 || col === width - 1) {
        level[row][col] = 1;
      }
      // Random platforms
      else if (Math.random() < 0.1 && row > 3) {
        level[row][col] = 1;
      }
      // Empty
      else {
        level[row][col] = 0;
      }
    }
  }
  
  return level;
}
```

---

## Level Design Tips

### 1. **Start Simple**
- Clear starting area
- Introduce mechanics gradually
- First jump should be easy

### 2. **Difficulty Curve**
```
Easy → Medium → Hard → Checkpoint → Easy → Medium → Hard
```

### 3. **Visual Clarity**
- Use different colors for different tile types
- Make solid walls obvious
- Use contrast (dark walls, light background)

### 4. **Testing**
- Can player reach all areas?
- Are jumps possible?
- Any soft-locks (stuck spots)?

---

## Common Pitfalls

### ❌ **Wrong: Checking every tile**
```typescript
for (let row = 0; row < tilemap.height; row++) {
  for (let col = 0; col < tilemap.width; col++) {
    // Slow! Checking 1000s of tiles
  }
}
```

### ✅ **Right: Only check nearby tiles**
```typescript
const leftTile = Math.floor(player.left / tileSize);
const rightTile = Math.floor(player.right / tileSize);
// Only check tiles player overlaps
```

---

### ❌ **Wrong: Player size = tile size**
```typescript
width = 32; // Same as tile, gets stuck in corners
```

### ✅ **Right: Slightly smaller**
```typescript
width = 28; // Smoother collision
```

---

## Key Formulas

### World to Grid
```
col = floor(worldX / tileSize)
row = floor(worldY / tileSize)
```

### Grid to World
```
worldX = col * tileSize
worldY = row * tileSize
```

### Player Grid Bounds
```
leftTile = floor(player.left / tileSize)
rightTile = floor(player.right / tileSize)
topTile = floor(player.top / tileSize)
bottomTile = floor(player.bottom / tileSize)
```

---

## Integration with Tiled Map Editor

[Tiled](https://www.mapeditor.org/) is a popular tilemap editor. Export as JSON:

```typescript
interface TiledMap {
  width: number;
  height: number;
  layers: {
    name: string;
    data: number[];
  }[];
}

function loadTiledMap(json: TiledMap): Tilemap {
  const collisionLayer = json.layers.find(l => l.name === 'collision');
  
  // Convert flat array to 2D
  const data: number[][] = [];
  for (let row = 0; row < json.height; row++) {
    data[row] = collisionLayer.data.slice(
      row * json.width,
      (row + 1) * json.width
    );
  }
  
  return new Tilemap(data, 32);
}
```

---

## Summary

Tilemaps provide:
- ✅ **Efficient** level storage (2D array of numbers)
- ✅ **Fast** collision detection (only check nearby tiles)
- ✅ **Easy** level editing (change numbers, instant results)
- ✅ **Scalable** (can build huge levels)
- ✅ **Tool support** (Tiled, LDtk, etc.)

**Key concepts**:
1. Grid-based level design
2. World ↔ Grid coordinate conversion
3. Optimized collision (only check player's tiles)
4. Camera following for large levels
5. Separation of X/Y collision resolution

**Next steps**: Add collectibles, enemies, animated tiles, slopes!
