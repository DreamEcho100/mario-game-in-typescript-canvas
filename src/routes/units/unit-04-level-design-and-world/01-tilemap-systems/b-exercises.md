# Tilemap Systems - Exercises

**Unit 04: Level Design & World Systems | Topic 01 | Practice Challenges**

---

## Exercise 1: Basic Tilemap Rendering

### Objective
Create a simple tilemap renderer that displays a 10×10 grid of tiles using a tileset image.

### Requirements
- Create a `Tilemap` class that stores a 2D array of tile IDs
- Create a `TileRenderer` class that draws tiles from a tileset
- Render a 10×10 tilemap with at least 3 different tile types
- Use a tile size of 32×32 pixels

### Hints
- Start with a hardcoded tilemap array
- Calculate source rectangle position from tile ID
- Use `ctx.drawImage()` with 9 parameters

### Bonus
- Add a grid overlay to visualize tile boundaries
- Display tile IDs as text on each tile

---

## Exercise 2: Load Tilemap from JSON

### Objective
Load tilemap data from an external JSON file.

### Requirements
- Create a JSON file with tilemap data (width, height, tiles array)
- Implement an async `loadFromJSON()` method
- Parse the JSON and populate your tilemap
- Render the loaded tilemap

### Hints
- Use `fetch()` and `.json()` to load the file
- Handle loading errors gracefully
- Wait for tileset image to load before rendering

### JSON Format Example
```json
{
  "width": 10,
  "height": 10,
  "tileSize": 16,
  "tiles": [0, 1, 1, 0, ...]
}
```

### Bonus
- Add support for loading multiple levels
- Include tileset path in JSON
- Validate JSON data before loading

---

## Exercise 3: Coordinate Conversion

### Objective
Implement functions to convert between world pixel coordinates and tile coordinates.

### Requirements
- Create `worldToTile()` function
- Create `tileToWorld()` function
- Create `tileToWorldCenter()` function
- Test with various coordinates

### Test Cases
```typescript
// Tile size = 16
worldToTile(245, 78, 16) // → {tileX: 15, tileY: 4}
tileToWorld(10, 5, 16)    // → {worldX: 160, worldY: 80}
tileToWorldCenter(5, 3, 16) // → {worldX: 88, worldY: 56}
```

### Hints
- Use `Math.floor()` for world to tile conversion
- Multiply by tile size for tile to world conversion
- Add half tile size for center calculation

### Bonus
- Add bounds checking
- Handle negative coordinates correctly
- Create inverse functions to verify correctness

---

## Exercise 4: Viewport Culling

### Objective
Implement viewport culling to only render visible tiles.

### Requirements
- Calculate visible tile range from camera position
- Only render tiles within the viewport
- Support camera movement with arrow keys
- Display performance metrics (tiles drawn vs total tiles)

### Hints
- Calculate start/end tile indices from camera position
- Clamp indices to tilemap bounds
- Count rendered tiles for comparison

### Performance Target
```
Without culling: 400 tiles drawn
With culling: 63 tiles drawn (16× reduction)
```

### Bonus
- Add a 1-tile border to prevent pop-in
- Visualize the culling area
- Benchmark rendering time

---

## Exercise 5: Multi-Layer Tilemap

### Objective
Create a tilemap system that supports multiple layers (background, terrain, foreground).

### Requirements
- Create a `LayeredTilemap` class
- Support at least 3 layers
- Render layers in correct order
- Allow showing/hiding individual layers

### Layer Examples
- **Background**: Sky, distant mountains
- **Terrain**: Ground, platforms, walls
- **Foreground**: Trees, decorations in front of player

### Hints
- Store layers as an array of tile arrays
- Iterate through layers in order when rendering
- Skip empty tiles (ID 0) for transparency

### Bonus
- Add layer opacity control
- Support parallax factors per layer
- Create a layer toggle UI

---

## Exercise 6: Tile Metadata System

### Objective
Create a tile metadata system that stores properties like solid, damage, friction.

### Requirements
- Create a `TileMetadata` interface
- Create a `TileDatabase` class to store metadata
- Register at least 5 different tile types
- Implement helper methods (`isSolid()`, `getDamage()`, etc.)

### Tile Types to Implement
- Empty (not solid)
- Ground (solid, friction 0.8)
- Ice (solid, friction 0.95)
- Spikes (not solid, damage 1)
- Water (not solid, friction 0.5)

### Hints
- Use a `Map<number, TileMetadata>` for storage
- Provide default values for missing properties
- Return safe defaults for unknown tile IDs

### Bonus
- Add animated tile support
- Include tile names and descriptions
- Create a tile inspector tool

---

## Exercise 7: Animated Tiles

### Objective
Implement animated tiles (e.g., water, lava, question blocks).

### Requirements
- Create an `AnimatedTile` class
- Support frame sequences and durations
- Update animations in game loop
- Render the correct frame

### Example: Animated Water
```typescript
// Water tiles: IDs 10, 11, 12, 13
const water = new AnimatedTile(10, [10, 11, 12, 13], 200);
```

### Hints
- Track elapsed time since last frame change
- Loop back to first frame after last frame
- Store animated tiles separately from tilemap

### Bonus
- Support different animation modes (loop, once, pingpong)
- Allow per-tile animation speed control
- Pause/resume animations

---

## Exercise 8: Tilemap Editor (Simple)

### Objective
Create a basic level editor that allows placing tiles with mouse clicks.

### Requirements
- Display current selected tile
- Place tiles on mouse click
- Save tilemap to JSON
- Load saved tilemap

### Controls
- **Left Click**: Place current tile
- **Right Click**: Erase tile (set to 0)
- **Number Keys**: Select tile (1-9)
- **S Key**: Save to JSON
- **L Key**: Load from JSON

### Hints
- Convert mouse position to tile coordinates
- Update tilemap array on click
- Use `JSON.stringify()` and `localStorage` for saving

### Bonus
- Add undo/redo functionality
- Support tile palette UI
- Implement fill tool (flood fill)

---

## Exercise 9: Chunk-Based Rendering

### Objective
Implement a chunked tilemap system for very large levels.

### Requirements
- Divide tilemap into 16×16 tile chunks
- Pre-render each chunk to an offscreen canvas
- Only render visible chunks
- Support at least 100×100 tile levels

### Hints
- Calculate which chunks are visible
- Pre-render chunks once, reuse many times
- Use `Map<string, Chunk>` for storage

### Performance Target
```
100×100 level (10,000 tiles):
- Without chunks: ~50ms per frame (20 FPS)
- With chunks: ~2ms per frame (500 FPS)
```

### Bonus
- Lazy load chunks as player approaches
- Unload distant chunks to save memory
- Display chunk boundaries for debugging

---

## Exercise 10: Tiled Editor Integration

### Objective
Load and render maps created in the Tiled Map Editor.

### Requirements
- Load a Tiled JSON export
- Parse layer data correctly
- Render the map with proper tile IDs
- Handle tileset `firstgid` offset

### Tiled Format Notes
```typescript
interface TiledLayer {
  data: number[];  // Flat array of tile IDs
  width: number;
  height: number;
}

interface TiledTileset {
  firstgid: number;  // First tile ID in this tileset
  // Tile IDs need to be adjusted: tileId - firstgid
}
```

### Hints
- Tiled uses 1-based indexing (1 = first tile)
- Subtract `firstgid` to get zero-based index
- Handle flipped tiles (high bits store flip flags)

### Bonus
- Support object layers (spawn points, items)
- Parse tile properties from Tiled
- Handle multiple tilesets per map

---

## Exercise 11: Collision Tile Queries

### Objective
Implement efficient tile collision queries for a moving character.

### Requirements
- Create `getTilesInRect()` method
- Check all tiles overlapping a bounding box
- Use this for character-tilemap collision
- Return array of solid tiles

### Hints
- Convert rect to tile coordinates
- Iterate through tiles in range
- Check if each tile is solid

### Example Usage
```typescript
const rect = { x: 100, y: 50, width: 32, height: 32 };
const solidTiles = tilemap.getTilesInRect(rect);

if (solidTiles.length > 0) {
  // Character is colliding with solid tiles
}
```

### Bonus
- Optimize to only check tile corners
- Return tile world positions along with IDs
- Support different collision shapes (circle, line)

---

## Exercise 12: Parallax Background Layers

### Objective
Create background layers that move at different speeds to create depth.

### Requirements
- Add at least 3 parallax layers
- Each layer has a different parallax factor
- Layers move correctly with camera
- Far layers move slower than near layers

### Parallax Factors
- **Far mountains**: 0.2× camera speed
- **Mid clouds**: 0.5× camera speed
- **Near terrain**: 1.0× camera speed

### Hints
- Multiply camera position by parallax factor
- Render layers back to front
- Use repeating/wrapping for infinite backgrounds

### Bonus
- Add vertical parallax
- Support different layer opacities
- Create a day/night cycle effect

---

## Challenge Projects

### Challenge A: Procedural Tilemap Generator (2-3 hours)

Create a system that generates random tilemaps algorithmically.

**Requirements:**
- Generate ground with hills (Perlin noise or random walk)
- Place platforms at different heights
- Add decorative elements (bushes, clouds)
- Ensure playability (no impossible jumps)

**Algorithm Ideas:**
```typescript
// Simple height map approach
for (let x = 0; x < width; x++) {
  const height = Math.floor(10 + 3 * Math.sin(x / 10));
  for (let y = height; y < mapHeight; y++) {
    setTile(x, y, GROUND_TILE);
  }
}
```

---

### Challenge B: Mini Mario Level (3-4 hours)

Build a complete playable Mario level using your tilemap system.

**Requirements:**
- At least 50×15 tiles (800 tiles minimum)
- Multiple layers (background, terrain, foreground)
- Animated tiles (question blocks, water)
- Proper collision metadata
- Camera following
- Spawn point and goal

**Features to Include:**
- Ground and platforms
- Pipes
- Bricks and question blocks
- Pits and hazards
- Decorative elements
- Hidden areas

---

### Challenge C: Tilemap Exporter/Importer (2 hours)

Create a tool to convert between different tilemap formats.

**Supported Formats:**
- JSON (your format)
- CSV
- Tiled JSON
- Binary (custom format)

**Features:**
- Load from one format
- Convert data structure
- Export to different format
- Preserve tile properties and layers

**Example Usage:**
```typescript
const converter = new TilemapConverter();
const tiled = await converter.loadTiled('level.json');
const myFormat = converter.tiledToMyFormat(tiled);
await converter.saveJSON('level-converted.json', myFormat);
```

---

## Self-Assessment

After completing these exercises, you should be able to:

- [ ] Render tilemaps efficiently with viewport culling
- [ ] Load tilemap data from JSON files
- [ ] Convert between world and tile coordinates
- [ ] Implement multi-layer tilemaps
- [ ] Store and query tile metadata
- [ ] Create animated tiles
- [ ] Build a simple level editor
- [ ] Optimize rendering with chunking
- [ ] Integrate with professional tools (Tiled)
- [ ] Implement tile-based collision queries
- [ ] Create parallax scrolling backgrounds
- [ ] Generate procedural tilemaps

---

## Tips for Success

1. **Start Simple**: Begin with Exercise 1 and build up complexity gradually.

2. **Test Incrementally**: Render tiles before adding culling, layers, or animation.

3. **Visualize Data**: Draw debug info (tile IDs, boundaries, culled regions).

4. **Profile Performance**: Measure FPS before and after optimizations.

5. **Use Real Assets**: Download free Mario or platformer tilesets to make it fun!

6. **Refer to Solutions**: Check `c-solutions.md` if you get stuck, but try first!

---

**Next:** Check your implementations against the solutions in `c-solutions.md`, then read the quick reference in `d-notes.md` for handy code snippets.
