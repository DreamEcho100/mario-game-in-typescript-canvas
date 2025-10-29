# Tilemap Systems - Debugging Guide

**Unit 04: Level Design & World Systems | Topic 01 | Common Bugs & Fixes**

---

## Bug #1: Tiles Not Rendering

### Symptom
The canvas is blank or only shows the background color. No tiles appear even though the tilemap data is loaded.

### Root Cause
Usually one of:
1. Tileset image hasn't loaded yet
2. Tile IDs are out of range (accessing invalid tileset regions)
3. All tiles are ID 0 (empty)
4. Rendering happens off-screen

### Diagnosis Steps

```typescript
// 1. Check if tileset is loaded
console.log('Tileset loaded:', tileset.complete, tileset.naturalWidth, tileset.naturalHeight);

// 2. Check tilemap data
console.log('Tilemap size:', tilemap.width, 'x', tilemap.height);
console.log('Tile data:', tilemap.tiles.slice(0, 10)); // First 10 tiles

// 3. Check tile IDs are valid
const maxTileId = Math.max(...tilemap.tiles);
const tilesInTileset = (tileset.width / tileSize) * (tileset.height / tileSize);
console.log('Max tile ID:', maxTileId, 'Tileset capacity:', tilesInTileset);

// 4. Check rendering coordinates
console.log('Rendering at:', cameraX, cameraY);
```

### Solution

```typescript
// Wait for tileset to load before rendering
const tileset = new Image();
tileset.src = 'tileset.png';

tileset.onload = () => {
  console.log('Tileset loaded successfully');
  startGameLoop(); // Only start after loaded
};

tileset.onerror = () => {
  console.error('Failed to load tileset');
};

// In render function, add safety check
function drawTile(ctx: CanvasRenderingContext2D, tileId: number, x: number, y: number): void {
  // Skip empty tiles
  if (tileId <= 0) return;

  // Check if tileset is loaded
  if (!tileset.complete) {
    console.warn('Tileset not loaded yet');
    return;
  }

  // Check if tile ID is valid
  const maxId = (tileset.width / tileSize) * (tileset.height / tileSize);
  if (tileId >= maxId) {
    console.error(`Invalid tile ID: ${tileId} (max: ${maxId})`);
    return;
  }

  // Now safe to render
  const srcX = (tileId % tilesPerRow) * tileSize;
  const srcY = Math.floor(tileId / tilesPerRow) * tileSize;
  ctx.drawImage(tileset, srcX, srcY, tileSize, tileSize, x, y, tileSize, tileSize);
}
```

### Prevention
- Always wait for `image.onload` before rendering
- Validate tile IDs are within valid range
- Use TypeScript for type safety
- Add debug mode that highlights invalid tiles

---

## Bug #2: Wrong Tiles Appearing

### Symptom
Tiles render, but they're the wrong images. For example, a ground tile shows a cloud, or tiles are offset.

### Root Cause
1. Incorrect tile ID → tileset position calculation
2. Tile IDs are 1-based but code expects 0-based (or vice versa)
3. `tilesPerRow` calculation is wrong
4. Tileset has padding/spacing between tiles

### Diagnosis Steps

```typescript
// Visualize tile ID to position mapping
function debugTilePosition(tileId: number): void {
  const srcX = (tileId % tilesPerRow) * tileSize;
  const srcY = Math.floor(tileId / tilesPerRow) * tileSize;
  
  console.log(`Tile ${tileId}:`, {
    srcX,
    srcY,
    col: tileId % tilesPerRow,
    row: Math.floor(tileId / tilesPerRow),
  });
}

// Check every tile
for (let id = 0; id < 10; id++) {
  debugTilePosition(id);
}

// Verify tilesPerRow
console.log('Tileset dimensions:', tileset.width, 'x', tileset.height);
console.log('Tile size:', tileSize);
console.log('Tiles per row:', tilesPerRow);
console.log('Expected:', tileset.width / tileSize);
```

### Solution

```typescript
class TileRenderer {
  tileset: HTMLImageElement;
  tileSize: number;
  tilesPerRow: number;
  tilesPerColumn: number;

  constructor(tileset: HTMLImageElement, tileSize: number) {
    this.tileset = tileset;
    this.tileSize = tileSize;
    
    // Calculate tiles per row/column
    this.tilesPerRow = Math.floor(tileset.width / tileSize);
    this.tilesPerColumn = Math.floor(tileset.height / tileSize);
    
    console.log(`Tileset: ${this.tilesPerRow}×${this.tilesPerColumn} tiles`);
  }

  drawTile(ctx: CanvasRenderingContext2D, tileId: number, x: number, y: number): void {
    if (tileId <= 0) return;

    // Convert 0-based tile ID to grid position
    const col = tileId % this.tilesPerRow;
    const row = Math.floor(tileId / this.tilesPerRow);

    // Calculate pixel position in tileset
    const srcX = col * this.tileSize;
    const srcY = row * this.tileSize;

    // Draw with exact dimensions
    ctx.drawImage(
      this.tileset,
      srcX, srcY, this.tileSize, this.tileSize,
      Math.floor(x), Math.floor(y), this.tileSize, this.tileSize
    );
  }
}

// If using Tiled or other editor, handle firstgid offset
function adjustTileId(rawId: number, firstgid: number): number {
  return rawId > 0 ? rawId - firstgid : 0;
}
```

### If Tileset Has Spacing

```typescript
// Tilesets with spacing (margin + spacing between tiles)
class SpacedTileRenderer extends TileRenderer {
  margin: number;
  spacing: number;

  constructor(tileset: HTMLImageElement, tileSize: number, margin = 0, spacing = 0) {
    super(tileset, tileSize);
    this.margin = margin;
    this.spacing = spacing;
  }

  drawTile(ctx: CanvasRenderingContext2D, tileId: number, x: number, y: number): void {
    if (tileId <= 0) return;

    const col = tileId % this.tilesPerRow;
    const row = Math.floor(tileId / this.tilesPerRow);

    // Account for margin and spacing
    const srcX = this.margin + col * (this.tileSize + this.spacing);
    const srcY = this.margin + row * (this.tileSize + this.spacing);

    ctx.drawImage(
      this.tileset,
      srcX, srcY, this.tileSize, this.tileSize,
      Math.floor(x), Math.floor(y), this.tileSize, this.tileSize
    );
  }
}
```

### Prevention
- Verify tileset dimensions match expected grid
- Use tilesets without spacing (easier to work with)
- Draw tile ID numbers for debugging
- Test rendering each tile individually

---

## Bug #3: Tiles Look Blurry or Scaled Wrong

### Symptom
Pixel art tiles look blurry, smudged, or anti-aliased. Crisp pixels become smooth blobs.

### Root Cause
1. Image smoothing is enabled (browser default)
2. Fractional pixel coordinates
3. CSS scaling differs from canvas size
4. High-DPI display without adjustment

### Solution

```typescript
// 1. Disable image smoothing (essential for pixel art!)
ctx.imageSmoothingEnabled = false;

// 2. Use integer pixel coordinates
function drawTile(ctx: CanvasRenderingContext2D, tileId: number, x: number, y: number): void {
  // Floor coordinates to integers
  const pixelX = Math.floor(x);
  const pixelY = Math.floor(y);
  
  ctx.drawImage(
    tileset,
    srcX, srcY, tileSize, tileSize,
    pixelX, pixelY, tileSize, tileSize
  );
}

// 3. Match canvas size to CSS size
canvas.width = 800;
canvas.height = 600;
canvas.style.width = '800px';
canvas.style.height = '600px';

// 4. Handle high-DPI displays
const dpr = window.devicePixelRatio || 1;
canvas.width = 800 * dpr;
canvas.height = 600 * dpr;
canvas.style.width = '800px';
canvas.style.height = '600px';
ctx.scale(dpr, dpr);
```

### CSS for Pixel Art

```css
canvas {
  image-rendering: -moz-crisp-edges;
  image-rendering: -webkit-crisp-edges;
  image-rendering: pixelated;
  image-rendering: crisp-edges;
}
```

### Prevention
- Always disable image smoothing for pixel art
- Use integer coordinates for tile positions
- Set canvas size in JavaScript, not CSS
- Test on different displays (regular and Retina)

---

## Bug #4: Performance Drops Over Time

### Symptom
Game starts at 60 FPS but gradually slows down to 20-30 FPS after a few minutes.

### Root Cause
1. Memory leak (creating objects every frame)
2. Not using viewport culling (rendering entire map)
3. Garbage collection pauses
4. Canvas not being cleared properly
5. Drawing tiles multiple times

### Diagnosis Steps

```typescript
// 1. Profile frame time
let frameCount = 0;
let totalTime = 0;

function render(ctx: CanvasRenderingContext2D): void {
  const start = performance.now();
  
  // Rendering code...
  
  const elapsed = performance.now() - start;
  totalTime += elapsed;
  frameCount++;
  
  if (frameCount % 60 === 0) {
    console.log(`Avg frame time: ${(totalTime / frameCount).toFixed(2)}ms`);
  }
}

// 2. Count draw calls
let drawCalls = 0;

function drawTile(/* ... */): void {
  drawCalls++;
  // Draw tile...
}

function render(ctx: CanvasRenderingContext2D): void {
  drawCalls = 0;
  // Render tilemap...
  console.log(`Draw calls: ${drawCalls}`);
}

// 3. Check memory usage
console.log(performance.memory?.usedJSHeapSize / 1024 / 1024, 'MB');
```

### Solution

```typescript
// 1. Implement viewport culling (essential!)
function renderWithCulling(
  ctx: CanvasRenderingContext2D,
  tilemap: Tilemap,
  cameraX: number,
  cameraY: number
): void {
  const startX = Math.max(0, Math.floor(cameraX / tileSize));
  const startY = Math.max(0, Math.floor(cameraY / tileSize));
  const endX = Math.min(tilemap.width, Math.ceil((cameraX + canvas.width) / tileSize));
  const endY = Math.min(tilemap.height, Math.ceil((cameraY + canvas.height) / tileSize));

  // Only iterate visible tiles
  for (let y = startY; y < endY; y++) {
    for (let x = startX; x < endX; x++) {
      const tileId = tilemap.getTile(x, y);
      if (tileId > 0) {
        drawTile(ctx, tileId, x * tileSize - cameraX, y * tileSize - cameraY);
      }
    }
  }
}

// 2. Pre-render static layers (huge speedup!)
const offscreenCanvas = document.createElement('canvas');
offscreenCanvas.width = tilemap.width * tileSize;
offscreenCanvas.height = tilemap.height * tileSize;

const offCtx = offscreenCanvas.getContext('2d')!;
offCtx.imageSmoothingEnabled = false;

// Render static layer once
renderStaticLayer(offCtx, tilemap);

// In game loop, just draw the offscreen canvas
ctx.drawImage(offscreenCanvas, -cameraX, -cameraY);

// 3. Avoid creating objects in hot path
// ❌ BAD: Creates garbage every frame
function getTile(x: number, y: number): { id: number } {
  return { id: tiles[y * width + x] }; // New object!
}

// ✅ GOOD: Returns primitive
function getTile(x: number, y: number): number {
  return tiles[y * width + x];
}

// 4. Clear canvas efficiently
ctx.clearRect(0, 0, canvas.width, canvas.height);
// Or just fill with background color
ctx.fillStyle = '#5c94fc';
ctx.fillRect(0, 0, canvas.width, canvas.height);
```

### Performance Checklist

- ✅ Viewport culling implemented?
- ✅ Static layers pre-rendered?
- ✅ Skipping empty tiles (ID 0)?
- ✅ No object creation in render loop?
- ✅ Using Uint16Array for large tilemaps?
- ✅ Image smoothing disabled?

### Prevention
- Profile early and often
- Monitor draw call count
- Use Chrome DevTools Performance tab
- Test with large maps (100×100 tiles+)

---

## Bug #5: Tiles Appear in Wrong Position

### Symptom
Tiles render, but they're offset from where they should be. Everything is shifted by a few pixels or tiles.

### Root Cause
1. Camera offset applied incorrectly
2. Coordinate conversion error
3. Tile size mismatch (rendering vs data)
4. Canvas translation state not reset

### Diagnosis Steps

```typescript
// 1. Visualize tile boundaries
ctx.strokeStyle = 'red';
ctx.lineWidth = 2;
for (let y = 0; y <= tilemap.height; y++) {
  ctx.beginPath();
  ctx.moveTo(0, y * tileSize - cameraY);
  ctx.lineTo(tilemap.width * tileSize, y * tileSize - cameraY);
  ctx.stroke();
}

// 2. Check camera offset
console.log('Camera:', cameraX, cameraY);
console.log('Tile at camera:', worldToTile(cameraX, cameraY, tileSize));

// 3. Draw first tile with coordinates
ctx.fillStyle = 'white';
ctx.font = '12px monospace';
ctx.fillText(`Tile (0,0)`, 5 - cameraX, 15 - cameraY);
```

### Solution

```typescript
// Correct tile rendering with camera
function drawTilemap(
  ctx: CanvasRenderingContext2D,
  tilemap: Tilemap,
  cameraX: number,
  cameraY: number
): void {
  for (let y = 0; y < tilemap.height; y++) {
    for (let x = 0; x < tilemap.width; x++) {
      const tileId = tilemap.getTile(x, y);
      if (tileId > 0) {
        // World position of tile
        const worldX = x * tileSize;
        const worldY = y * tileSize;
        
        // Screen position (subtract camera)
        const screenX = worldX - cameraX;
        const screenY = worldY - cameraY;
        
        drawTile(ctx, tileId, screenX, screenY);
      }
    }
  }
}

// Alternative: Use translate (but remember to reset!)
ctx.save();
ctx.translate(-cameraX, -cameraY);

// Draw tiles at world coordinates
for (let y = 0; y < tilemap.height; y++) {
  for (let x = 0; x < tilemap.width; x++) {
    const tileId = tilemap.getTile(x, y);
    if (tileId > 0) {
      drawTile(ctx, tileId, x * tileSize, y * tileSize);
    }
  }
}

ctx.restore(); // Don't forget to restore!
```

### Common Mistake: Double Camera Offset

```typescript
// ❌ BAD: Camera offset applied twice!
ctx.translate(-cameraX, -cameraY); // Applied here
drawTile(ctx, tileId, x * tileSize - cameraX, y * tileSize - cameraY); // And here!

// ✅ GOOD: Choose one method
// Method 1: Manual subtraction
drawTile(ctx, tileId, x * tileSize - cameraX, y * tileSize - cameraY);

// Method 2: ctx.translate
ctx.save();
ctx.translate(-cameraX, -cameraY);
drawTile(ctx, tileId, x * tileSize, y * tileSize);
ctx.restore();
```

### Prevention
- Use consistent coordinate system
- Always save/restore canvas state
- Visualize tile grid for debugging
- Test with camera at (0,0) first

---

## Bug #6: Tiles Pop In/Out at Screen Edges

### Symptom
As the camera moves, tiles suddenly appear or disappear at the edges of the screen instead of smoothly scrolling in.

### Root Cause
Viewport culling is too aggressive—only rendering exactly visible tiles without a buffer zone.

### Solution

```typescript
// Add a 1-2 tile border to culling range
const TILE_BUFFER = 1; // or 2 for smoother appearance

const startX = Math.max(0, Math.floor(cameraX / tileSize) - TILE_BUFFER);
const startY = Math.max(0, Math.floor(cameraY / tileSize) - TILE_BUFFER);
const endX = Math.min(
  tilemap.width,
  Math.ceil((cameraX + viewportWidth) / tileSize) + TILE_BUFFER
);
const endY = Math.min(
  tilemap.height,
  Math.ceil((cameraY + viewportHeight) / tileSize) + TILE_BUFFER
);
```

### Visual Explanation

```
Without buffer:          With buffer:
┌─────────┐             ╔═══════════╗
│ ████████│ ← Pop!      █ ██████████ █
│ ████████│             █ ██████████ █
│ ████████│             █ ██████████ █
└─────────┘             ╚═══════════╝
  Viewport              Extra tiles rendered
```

### Prevention
- Always add 1-2 tile buffer to culling
- Test by moving camera slowly and watching edges
- Trade-off: Slightly more draw calls for smoother appearance

---

## Bug #7: Tilemap Data Not Loading

### Symptom
`fetch()` call succeeds, but tilemap data is undefined or empty. No errors in console.

### Root Cause
1. Async timing issue (rendering before data loaded)
2. Incorrect JSON structure
3. File path wrong but no error thrown
4. CORS issue (loading from `file://`)

### Solution

```typescript
// Proper async loading pattern
class Game {
  tilemap: Tilemap | null = null;
  loaded = false;

  async init(): Promise<void> {
    try {
      // Load tilemap data
      const response = await fetch('levels/level1.json');
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Validate data
      if (!data.width || !data.height || !data.tiles) {
        throw new Error('Invalid tilemap format');
      }

      if (data.tiles.length !== data.width * data.height) {
        throw new Error(
          `Tilemap size mismatch: expected ${data.width * data.height}, got ${data.tiles.length}`
        );
      }

      // Create tilemap
      this.tilemap = new Tilemap(data.width, data.height);
      this.tilemap.tiles = data.tiles;

      // Load tileset
      const tileset = await this.loadImage(data.tileset);
      this.renderer = new TileRenderer(tileset, data.tileSize);

      this.loaded = true;
      console.log('Game initialized successfully');
    } catch (error) {
      console.error('Failed to initialize game:', error);
      this.showError(error.message);
    }
  }

  loadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
      img.src = src;
    });
  }

  render(ctx: CanvasRenderingContext2D): void {
    if (!this.loaded || !this.tilemap) {
      // Show loading screen
      ctx.fillStyle = 'black';
      ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      ctx.fillStyle = 'white';
      ctx.font = '20px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Loading...', ctx.canvas.width / 2, ctx.canvas.height / 2);
      return;
    }

    // Render tilemap
    this.renderer.drawTilemap(ctx, this.tilemap);
  }
}

// Usage
const game = new Game();
await game.init(); // Wait for initialization
requestAnimationFrame(gameLoop);
```

### CORS Issue Solution

If loading from `file://` protocol:

```bash
# Use a local server instead
npx http-server . -p 8080
# Or
python -m http.server 8080
# Or
php -S localhost:8080
```

### Prevention
- Always validate JSON structure
- Use try/catch for async operations
- Test loading with network tab open
- Use a local server, not file://

---

## General Debugging Tips

### Enable Debug Mode

```typescript
class TilemapRenderer {
  debug = false;

  render(ctx: CanvasRenderingContext2D, tilemap: Tilemap): void {
    // Normal rendering...

    if (this.debug) {
      this.renderDebugInfo(ctx, tilemap);
    }
  }

  renderDebugInfo(ctx: CanvasRenderingContext2D, tilemap: Tilemap): void {
    // Draw grid
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    // ... draw grid lines

    // Draw tile IDs
    ctx.fillStyle = 'white';
    ctx.font = '10px monospace';
    // ... draw tile numbers

    // Draw stats
    ctx.textAlign = 'left';
    ctx.fillText(`Tiles drawn: ${this.tilesDrawn}`, 10, 20);
    ctx.fillText(`Total tiles: ${tilemap.width * tilemap.height}`, 10, 40);
  }
}

// Toggle with keyboard
window.addEventListener('keydown', e => {
  if (e.key === 'd') renderer.debug = !renderer.debug;
});
```

### Log Performance Metrics

```typescript
class PerformanceMonitor {
  samples: number[] = [];
  maxSamples = 60;

  recordFrame(ms: number): void {
    this.samples.push(ms);
    if (this.samples.length > this.maxSamples) {
      this.samples.shift();
    }
  }

  getAverage(): number {
    return this.samples.reduce((a, b) => a + b, 0) / this.samples.length;
  }

  getMax(): number {
    return Math.max(...this.samples);
  }

  render(ctx: CanvasRenderingContext2D): void {
    const avg = this.getAverage();
    const max = this.getMax();
    const fps = Math.round(1000 / avg);

    ctx.fillStyle = avg > 16.67 ? 'red' : 'lime';
    ctx.fillText(`FPS: ${fps} (${avg.toFixed(1)}ms avg, ${max.toFixed(1)}ms max)`, 10, 60);
  }
}
```

### Test with Extreme Cases

```typescript
// 1. Empty tilemap (all zeros)
const emptyMap = new Tilemap(100, 100);
// Should render quickly with no tiles

// 2. Full tilemap (all non-zero)
const fullMap = new Tilemap(100, 100);
fullMap.tiles.fill(1);
// Tests worst-case performance

// 3. Huge tilemap
const hugeMap = new Tilemap(1000, 1000);
// Tests memory and culling

// 4. Invalid tile IDs
tilemap.setTile(5, 5, 9999); // Out of range
// Should handle gracefully

// 5. Negative coordinates
const tile = tilemap.getTile(-1, -1);
// Should return -1 or throw
```

---

## Quick Checklist

When tiles aren't working:

- [ ] Is the tileset image loaded? (`tileset.complete`)
- [ ] Are tile IDs in valid range? (0 to tileCount - 1)
- [ ] Is image smoothing disabled? (`ctx.imageSmoothingEnabled = false`)
- [ ] Is viewport culling implemented?
- [ ] Are coordinates integers? (`Math.floor(x)`)
- [ ] Is camera offset applied correctly?
- [ ] Is tilemap data validated?
- [ ] Are draw calls counted? (Should be ~viewport size, not total tiles)
- [ ] Is debug mode available? (Toggle with key press)
- [ ] Are performance metrics logged?

---

**Remember**: Most tilemap bugs are caused by coordinate conversion errors or async timing issues. Always visualize your data (draw grids, tile IDs, boundaries) to see what's actually happening!
