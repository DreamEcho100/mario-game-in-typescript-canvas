# Tilemap Systems - FAQ

**Unit 04: Level Design & World Systems | Topic 01 | Frequently Asked Questions**

---

## Q1: What tile size should I use for my game?

**Short Answer:** 16×16 pixels is the most common and recommended for platformers.

**Detailed Answer:**

Common tile sizes and their uses:

| Size | Use Case | Examples |
|------|----------|----------|
| **8×8** | Tiny tiles, high detail | Celeste, PICO-8 games |
| **16×16** | Classic platformers | Mario, Sonic, most 2D games |
| **32×32** | Larger characters | Stardew Valley, Terraria |
| **64×64** | Big sprites | Some RPGs, tower defense |

**Factors to consider:**

1. **Character size**: Tiles should be 1/2 to 2× your character size
2. **Screen resolution**: More pixels = can use larger tiles
3. **Art style**: Pixel art typically uses 16×16 or 32×32
4. **Performance**: Larger tiles = fewer tiles to render
5. **Level detail**: Smaller tiles allow more intricate designs

**Mario example:**
- Mario is 16×16 pixels
- Tiles are 16×16 pixels
- Works perfectly!

**Recommendation for beginners:** Start with 16×16. It's versatile, well-supported, and you can find tons of free tilesets at this size.

---

## Q2: Should I use 2D arrays or flat arrays for tilemap data?

**Short Answer:** Use flat arrays (1D) with helper functions for 2D access.

**Detailed Answer:**

**2D Array (Not Recommended):**
```typescript
// ❌ Harder to serialize, more memory
tiles: number[][] = [
  [0, 1, 1, 0],
  [0, 2, 2, 0],
];
```

**Pros:**
- Intuitive `tiles[y][x]` access
- Easy to visualize

**Cons:**
- Harder to serialize to JSON
- More memory overhead (array of arrays)
- Slower access (two lookups)
- Not compatible with most tools

**Flat Array (Recommended):**
```typescript
// ✅ Better performance, easy to serialize
tiles: number[] = [
  0, 1, 1, 0,
  0, 2, 2, 0,
];

// Access with helper function
function getTile(x: number, y: number): number {
  return tiles[y * width + x];
}
```

**Pros:**
- Single memory allocation
- Faster access (one lookup)
- Easy to serialize (`JSON.stringify()`)
- Compatible with Tiled, LDtk, etc.
- Can use Uint16Array for efficiency

**Cons:**
- Requires index calculation
- Less intuitive initially

**Best of both worlds:**
```typescript
class Tilemap {
  tiles: number[]; // Flat array internally

  getTile(x: number, y: number): number {
    return this.tiles[y * this.width + x]; // Helper function
  }
}
```

**Verdict:** Always use flat arrays. Wrap them in a class with helper methods for convenient 2D access.

---

## Q3: How do I handle animated tiles (water, lava, question blocks)?

**Answer:**

**Approach 1: Separate Animation System (Recommended)**

```typescript
class AnimatedTile {
  baseTileId: number;
  frames: number[]; // Tile IDs for each frame
  frameDuration: number;
  currentFrame = 0;
  elapsedTime = 0;

  constructor(baseTileId: number, frames: number[], frameDuration: number) {
    this.baseTileId = baseTileId;
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

// In your level
const animatedTiles = [
  new AnimatedTile(10, [10, 11, 12, 13], 200), // Water
  new AnimatedTile(20, [20, 21, 22, 21], 150), // Question block
];

// In game loop
for (const animTile of animatedTiles) {
  animTile.update(deltaTime);
}

// When rendering, check if tile should be animated
function drawTile(ctx, tileId, x, y) {
  const animTile = animatedTiles.find(a => a.baseTileId === tileId);
  const actualTileId = animTile ? animTile.getCurrentTileId() : tileId;
  // Draw actualTileId
}
```

**Approach 2: Replace Tiles in Tilemap (Simple but Limited)**

```typescript
// In game loop, directly modify tilemap
if (frameCount % 10 === 0) { // Every 10 frames
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const tile = tilemap.getTile(x, y);
      if (tile === 10) tilemap.setTile(x, y, 11); // Water frame 1 → 2
      else if (tile === 11) tilemap.setTile(x, y, 12); // Frame 2 → 3
      // etc.
    }
  }
}
```

**Pros:**
- Very simple
- No extra data structures

**Cons:**
- Modifies tilemap data (hard to save/load)
- Can't have different animation speeds
- Performance cost of scanning entire tilemap

**Recommendation:** Use Approach 1 for flexibility. Use Approach 2 only for quick prototypes.

---

## Q4: Should I use viewport culling? Is it worth the complexity?

**Short Answer:** **YES, ABSOLUTELY!** It's essential and not complex at all.

**Performance Impact:**

| Map Size | Without Culling | With Culling | Speedup |
|----------|----------------|--------------|---------|
| 50×50 (2,500 tiles) | 25ms | 2ms | **12× faster** |
| 100×100 (10,000 tiles) | 100ms | 2ms | **50× faster** |
| 200×20 (4,000 tiles) | 40ms | 3ms | **13× faster** |

**Complexity:** Just 5 lines of code!

```typescript
// Calculate visible range (that's it!)
const startX = Math.floor(cameraX / tileSize);
const startY = Math.floor(cameraY / tileSize);
const endX = Math.ceil((cameraX + viewportWidth) / tileSize);
const endY = Math.ceil((cameraY + viewportHeight) / tileSize);

// Only iterate visible tiles
for (let y = startY; y < endY; y++) {
  for (let x = startX; x < endX; x++) {
    drawTile(x, y);
  }
}
```

**When NOT to use culling:**
- Tilemap fits entirely on screen (e.g., single-screen puzzle games)
- Tilemap is tiny (< 20×20 tiles)

**When to ALWAYS use culling:**
- Any scrolling game
- Maps larger than viewport
- Mobile devices (lower performance)

**Verdict:** Implement viewport culling in every project. It's 5 lines of code for 10-50× performance improvement.

---

## Q5: How do I convert a tilemap from Tiled Map Editor?

**Answer:**

Tiled exports to JSON. The format looks like this:

```json
{
  "width": 10,
  "height": 10,
  "tilewidth": 16,
  "tileheight": 16,
  "layers": [
    {
      "name": "Ground",
      "data": [1, 2, 2, 1, ...]
    }
  ],
  "tilesets": [
    {
      "firstgid": 1,
      "image": "tileset.png",
      "imagewidth": 128,
      "imageheight": 128,
      "tilewidth": 16,
      "tileheight": 16
    }
  ]
}
```

**Loader code:**

```typescript
interface TiledMap {
  width: number;
  height: number;
  tilewidth: number;
  tileheight: number;
  layers: {
    name: string;
    data: number[];
  }[];
  tilesets: {
    firstgid: number;
    image: string;
  }[];
}

async function loadTiledMap(path: string): Promise<LayeredTilemap> {
  const response = await fetch(path);
  const tiled: TiledMap = await response.json();

  const tilemap = new LayeredTilemap(tiled.width, tiled.height, tiled.tilewidth);

  // Load each layer
  for (const layer of tiled.layers) {
    // Adjust tile IDs (Tiled uses 1-based, we use 0-based)
    const adjustedTiles = layer.data.map(id => 
      id > 0 ? id - tiled.tilesets[0].firstgid : 0
    );
    
    tilemap.addLayer(layer.name, adjustedTiles);
  }

  return tilemap;
}
```

**Key differences:**
- Tiled uses 1-based indexing (tile 1 = first tile), we use 0-based
- Tiled's `firstgid` is the starting ID for a tileset
- Subtract `firstgid` from tile IDs to get zero-based indices

**Important:** Tiled also stores flip flags in high bits of tile ID. For flipped tiles:

```typescript
const FLIPPED_HORIZONTALLY_FLAG = 0x80000000;
const FLIPPED_VERTICALLY_FLAG = 0x40000000;
const FLIPPED_DIAGONALLY_FLAG = 0x20000000;

function parseTiledTileId(rawId: number) {
  const flippedH = (rawId & FLIPPED_HORIZONTALLY_FLAG) !== 0;
  const flippedV = (rawId & FLIPPED_VERTICALLY_FLAG) !== 0;
  const flippedD = (rawId & FLIPPED_DIAGONALLY_FLAG) !== 0;
  const tileId = rawId & ~(FLIPPED_HORIZONTALLY_FLAG | FLIPPED_VERTICALLY_FLAG | FLIPPED_DIAGONALLY_FLAG);

  return { tileId, flippedH, flippedV, flippedD };
}
```

---

## Q6: Can I have multiple tilesets in one level?

**Short Answer:** Yes, but it's more complex. Better to combine tilesets into one image.

**Approach 1: Combine Tilesets (Recommended)**

Use a tool like TexturePacker or manual editing to combine multiple tilesets into one large sprite sheet.

```
Before:                After:
tileset1.png (64×64)   combined.png (128×64)
tileset2.png (64×64)   ┌─────────┬─────────┐
                       │ Tileset1│ Tileset2│
                       └─────────┴─────────┘
```

**Pros:**
- Simple: One tileset = one renderer
- Fast: No tileset switching
- Easy: Standard workflow

**Cons:**
- Manual step to combine tilesets
- Can't easily swap themes

**Approach 2: Multiple Renderers**

```typescript
class MultiTilesetRenderer {
  renderers = new Map<number, TileRenderer>();

  addTileset(firstId: number, lastId: number, renderer: TileRenderer): void {
    this.renderers.set(firstId, { lastId, renderer });
  }

  drawTile(ctx: CanvasRenderingContext2D, tileId: number, x: number, y: number): void {
    for (const [firstId, { lastId, renderer }] of this.renderers) {
      if (tileId >= firstId && tileId <= lastId) {
        renderer.drawTile(ctx, tileId - firstId, x, y);
        return;
      }
    }
  }
}

// Usage
const multiRenderer = new MultiTilesetRenderer();
multiRenderer.addTileset(0, 63, new TileRenderer(tileset1, 16));
multiRenderer.addTileset(64, 127, new TileRenderer(tileset2, 16));
```

**Pros:**
- Flexible: Easy to add/remove tilesets
- Dynamic: Can swap themes at runtime

**Cons:**
- Complex: More code to maintain
- Slower: Lookup overhead for each tile

**Recommendation:** Combine tilesets into one image for simplicity. Only use multiple tilesets if you need dynamic tileset swapping (e.g., day/night themes).

---

## Q7: How do I handle tile-based collision detection?

**Short Answer:** Use tile metadata to mark solid tiles, then check tiles overlapping your entity's bounding box.

**Detailed Answer:**

**Step 1: Mark solid tiles**

```typescript
const tileDB = new TileDatabase();
tileDB.registerTile({ id: 0, solid: false }); // Empty
tileDB.registerTile({ id: 1, solid: true });  // Ground
tileDB.registerTile({ id: 2, solid: true });  // Brick
```

**Step 2: Check tiles around entity**

```typescript
function checkCollision(entity: Entity): boolean {
  // Get tiles overlapping entity's bounding box
  const left = entity.x;
  const right = entity.x + entity.width;
  const top = entity.y;
  const bottom = entity.y + entity.height;

  // Convert to tile coordinates
  const startX = Math.floor(left / tileSize);
  const startY = Math.floor(top / tileSize);
  const endX = Math.floor(right / tileSize);
  const endY = Math.floor(bottom / tileSize);

  // Check each tile
  for (let y = startY; y <= endY; y++) {
    for (let x = startX; x <= endX; x++) {
      const tileId = tilemap.getTile(x, y);
      if (tileDB.isSolid(tileId)) {
        return true; // Collision detected
      }
    }
  }

  return false;
}
```

**Step 3: Resolve collision**

```typescript
// Check bottom collision (standing on ground)
const bottom = player.y + player.height;
const bottomTileY = Math.floor(bottom / tileSize);

for (let x = Math.floor(player.x / tileSize); x <= Math.floor((player.x + player.width) / tileSize); x++) {
  const tileId = tilemap.getTile(x, bottomTileY);
  if (tileDB.isSolid(tileId)) {
    // Snap to top of tile
    player.y = bottomTileY * tileSize - player.height;
    player.velocityY = 0;
    player.onGround = true;
  }
}
```

**See Unit 04, Topic 02 (Collision Maps) for complete collision system!**

---

## Q8: Should I pre-render static tilemap layers?

**Short Answer:** Yes, if the layer doesn't change. It's a huge performance boost.

**When to pre-render:**
- ✅ Background layers (sky, far mountains)
- ✅ Terrain that never changes
- ✅ Decoration layers
- ✅ Any static layer

**When NOT to pre-render:**
- ❌ Layers with animated tiles
- ❌ Destructible terrain (e.g., breakable bricks)
- ❌ Dynamic elements

**Implementation:**

```typescript
class PrerenderedLayer {
  canvas: HTMLCanvasElement;

  constructor(tilemap: Tilemap, renderer: TileRenderer) {
    // Create offscreen canvas
    this.canvas = document.createElement('canvas');
    this.canvas.width = tilemap.width * renderer.tileSize;
    this.canvas.height = tilemap.height * renderer.tileSize;

    const ctx = this.canvas.getContext('2d')!;
    ctx.imageSmoothingEnabled = false;

    // Render entire layer once
    renderer.drawTilemap(ctx, tilemap);
  }

  draw(ctx: CanvasRenderingContext2D, cameraX: number, cameraY: number): void {
    // Just draw the pre-rendered canvas (super fast!)
    ctx.drawImage(this.canvas, -cameraX, -cameraY);
  }
}
```

**Performance:**

| Layer Type | Without Pre-render | With Pre-render | Speedup |
|------------|-------------------|-----------------|---------|
| Static background | 15ms | 0.2ms | **75× faster** |
| Static terrain | 20ms | 0.3ms | **66× faster** |

**Memory cost:**
- 800×600 canvas = ~1.9 MB (RGBA)
- 1600×480 canvas = ~3.0 MB

**Recommendation:** Pre-render all static layers. The memory cost is minimal compared to the massive performance gain.

---

## Q9: How do I implement infinite/wrapping backgrounds?

**Answer:**

For infinite horizontal scrolling (like clouds):

```typescript
function drawWrappingLayer(
  ctx: CanvasRenderingContext2D,
  layer: HTMLCanvasElement,
  cameraX: number,
  parallaxFactor: number
): void {
  const layerX = (cameraX * parallaxFactor) % layer.width;

  // Draw two copies to create seamless wrap
  ctx.drawImage(layer, -layerX, 0);
  ctx.drawImage(layer, layer.width - layerX, 0);
}

// Usage
drawWrappingLayer(ctx, cloudLayer, camera.x, 0.3);
```

**Visual explanation:**

```
Screen:     [============]
            ↓
Layer 1:    [      Cloud]
Layer 2:    [Cloud      ]
            └─ Seamlessly loops
```

**For vertical wrapping:**

```typescript
const layerY = (cameraY * parallaxFactor) % layer.height;
ctx.drawImage(layer, 0, -layerY);
ctx.drawImage(layer, 0, layer.height - layerY);
```

**Tip:** Make sure your wrapping layer's edges match perfectly (first column = last column for horizontal wrapping).

---

## Q10: What's the difference between a tilemap and a sprite sheet?

**Answer:**

They're related but serve different purposes:

**Sprite Sheet:**
- Contains individual graphics (tiles, characters, items)
- Source of visual data
- One file with many images
- Example: `tileset.png`

**Tilemap:**
- Defines **which** sprites go **where**
- Layout/arrangement data
- 2D array of IDs
- Example: `[0, 1, 1, 0, 2, 2, 0, ...]`

**Analogy:**

```
Sprite Sheet = Alphabet (A, B, C, D, ...)
Tilemap = Book (uses alphabet to form words)

Tileset = Paint palette (colors)
Tilemap = Painting (uses colors from palette)

Tileset = LEGO pieces (bricks)
Tilemap = LEGO instructions (where to place bricks)
```

**In code:**

```typescript
// Tileset (the graphics)
const tileset = new Image();
tileset.src = 'tileset.png'; // Contains tile images

// Tilemap (the layout)
const tilemap = {
  width: 10,
  height: 10,
  tiles: [0, 1, 1, 0, ...], // References tiles in tileset
};

// Rendering combines both
for (const tileId of tilemap.tiles) {
  drawTileFromTileset(tileId); // Use tileset image + tilemap ID
}
```

---

## Q11: How do I create a level editor in the browser?

**Answer:**

Basic level editor in ~100 lines:

```typescript
class SimpleLevelEditor {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  tilemap: Tilemap;
  currentTileId = 1;
  tileSize = 16;

  constructor(canvas: HTMLCanvasElement, width: number, height: number) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.tilemap = new Tilemap(width, height);

    this.canvas.addEventListener('mousedown', e => this.onMouseDown(e));
    this.canvas.addEventListener('mousemove', e => this.onMouseMove(e));
    window.addEventListener('keydown', e => this.onKeyDown(e));
  }

  onMouseDown(e: MouseEvent): void {
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const tileX = Math.floor(x / this.tileSize);
    const tileY = Math.floor(y / this.tileSize);

    if (e.button === 0) {
      // Left click: place tile
      this.tilemap.setTile(tileX, tileY, this.currentTileId);
    } else if (e.button === 2) {
      // Right click: erase
      this.tilemap.setTile(tileX, tileY, 0);
    }

    this.render();
  }

  onMouseMove(e: MouseEvent): void {
    if (e.buttons === 1) {
      this.onMouseDown(e); // Paint while dragging
    }
  }

  onKeyDown(e: KeyboardEvent): void {
    // Number keys select tiles
    const num = parseInt(e.key);
    if (!isNaN(num) && num >= 0 && num <= 9) {
      this.currentTileId = num;
    }

    // S = save
    if (e.key === 's') {
      this.save();
    }

    // L = load
    if (e.key === 'l') {
      this.load();
    }
  }

  save(): void {
    const data = {
      width: this.tilemap.width,
      height: this.tilemap.height,
      tiles: this.tilemap.tiles,
    };

    const json = JSON.stringify(data, null, 2);
    localStorage.setItem('levelData', json);
    console.log('Level saved!');
  }

  load(): void {
    const json = localStorage.getItem('levelData');
    if (json) {
      const data = JSON.parse(json);
      this.tilemap.tiles = data.tiles;
      this.render();
      console.log('Level loaded!');
    }
  }

  render(): void {
    // Render tilemap
    renderer.drawTilemap(this.ctx, this.tilemap);

    // Show current tile selection
    this.ctx.fillStyle = 'white';
    this.ctx.fillText(`Current Tile: ${this.currentTileId}`, 10, 20);
  }
}

// Usage
const editor = new SimpleLevelEditor(canvas, 50, 30);
```

**Features to add:**
- Tile palette UI
- Undo/redo (store history)
- Multiple layers
- Export to JSON file (not just localStorage)
- Import existing levels
- Grid toggle
- Fill tool (flood fill algorithm)

---

## Q12: How much memory do large tilemaps use?

**Answer:**

**Tilemap data:**

```
Normal array (number[]):
- 8 bytes per number (V8 engine)
- Plus ~72 bytes of object overhead per number
- Total: ~80 bytes per tile

Example: 1000×1000 tilemap = 1,000,000 tiles × 80 bytes = 80 MB! 😱

Uint16Array:
- 2 bytes per number (no object overhead)
- Total: 2 bytes per tile

Example: 1000×1000 tilemap = 1,000,000 tiles × 2 bytes = 2 MB ✅
```

**Recommendation for large maps:**

```typescript
class Tilemap {
  tiles: Uint16Array; // Instead of number[]

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.tiles = new Uint16Array(width * height); // 40× less memory!
  }
}
```

**Uint16Array limits:**
- Max value: 65,535
- Good enough for 65,535 different tile types
- If you need more, use Uint32Array (4 bytes per tile)

**Pre-rendered layers:**

```typescript
// Memory for offscreen canvas
width × height × 4 (RGBA) bytes

Example: 3200×320 canvas = 3200 × 320 × 4 = 4,096,000 bytes = 4 MB
```

**Total memory for large level:**

| Component | Size | Memory |
|-----------|------|--------|
| 1000×1000 tilemap (Uint16Array) | 1M tiles | 2 MB |
| Tileset image (512×512) | 262K pixels | 1 MB |
| Pre-rendered background (3200×320) | 1M pixels | 4 MB |
| **Total** | | **7 MB** |

**Very reasonable for modern devices!**

---

## Q13: Can I use tilemaps for collision detection?

**Short Answer:** Yes! It's actually the standard approach for tile-based games.

**See Unit 04, Topic 02 (Collision Maps) for the complete tutorial**, but here's the basic idea:

```typescript
// Check if entity is colliding with solid tiles
function isSolidAt(worldX: number, worldY: number): boolean {
  const { tileX, tileY } = worldToTile(worldX, worldY, tileSize);
  const tileId = tilemap.getTile(tileX, tileY);
  return tileDB.isSolid(tileId);
}

// Check corners of player's bounding box
const solid =
  isSolidAt(player.left, player.top) ||
  isSolidAt(player.right, player.top) ||
  isSolidAt(player.left, player.bottom) ||
  isSolidAt(player.right, player.bottom);

if (solid) {
  // Handle collision
}
```

**Advantages:**
- Simple and fast
- Grid-aligned (no floating point errors)
- Easy to edit in level editor

**Disadvantages:**
- Limited to rectangular tiles
- Can't handle slopes easily
- Axis-aligned only (no rotation)

For platformers like Mario, tile-based collision is perfect!

---

## Q14: How do I make tiles "pop" when the player hits them from below?

**Answer:**

This is a classic Mario effect! Here's how:

```typescript
class BouncingTile {
  x: number;
  y: number;
  offsetY = 0; // Current vertical offset
  velocityY = 0; // Bounce speed
  bouncing = false;

  hit(): void {
    this.bouncing = true;
    this.velocityY = -5; // Initial upward velocity
  }

  update(deltaTime: number): void {
    if (this.bouncing) {
      // Apply gravity
      this.velocityY += 0.5;
      this.offsetY += this.velocityY;

      // Return to rest position
      if (this.offsetY >= 0) {
        this.offsetY = 0;
        this.velocityY = 0;
        this.bouncing = false;
      }
    }
  }

  render(ctx: CanvasRenderingContext2D): void {
    // Draw tile at offset position
    renderer.drawTile(
      ctx,
      this.tileId,
      this.x * tileSize,
      this.y * tileSize + this.offsetY // Add offset!
    );
  }
}

// When player hits tile from below
if (player.velocityY < 0 && hitTileFromBelow) {
  tile.hit();
  player.velocityY = 0; // Stop player's upward movement
}
```

**Animation sequence:**

```
Frame 1: ▂▂▂ (rest)
Frame 2: ↑   (moving up)
Frame 3: ↑↑  (peak)
Frame 4: ↓   (falling back)
Frame 5: ▂▂▂ (back to rest)
```

**Bonus effects:**
- Spawn coin when hit
- Play sound effect
- Change tile sprite (? → empty block)
- Damage enemies above tile

---

## Q15: What tools can I use to create tilemaps?

**Answer:**

**Tilemap Editors:**

1. **Tiled** (Free, Open Source)
   - URL: https://www.mapeditor.org/
   - Best for: General purpose, most features
   - Export: JSON, TMX, CSV
   - Platforms: Windows, Mac, Linux

2. **LDtk** (Free)
   - URL: https://ldtk.io/
   - Best for: Modern, beautiful UI, great for large levels
   - Export: JSON
   - Platforms: Windows, Mac, Linux

3. **Ogmo Editor** (Free)
   - URL: https://ogmo-editor-3.github.io/
   - Best for: Simple, lightweight
   - Export: JSON
   - Platforms: Windows, Mac, Linux

**Tileset Creators:**

1. **Aseprite** ($19.99)
   - URL: https://www.aseprite.org/
   - Best for: Pixel art, animation
   - Powerful sprite sheet export

2. **Piskel** (Free, Browser)
   - URL: https://www.piskelapp.com/
   - Best for: Quick pixel art, no install

3. **GraphicsGale** (Free)
   - URL: https://graphicsgale.com/
   - Best for: Windows users

**Free Tileset Resources:**

- OpenGameArt.org
- Kenney.nl (huge collection!)
- itch.io (search "tileset")
- Pixel Frog (animated pixel art)

**Recommendation:** Use **Tiled + Aseprite** for professional workflow, or **LDtk + Piskel** for free alternative.

---

**Next Topic:** Unit 04, Topic 02 — Collision Maps! Learn how to implement robust tile-based collision detection for your platformer. 🎮
