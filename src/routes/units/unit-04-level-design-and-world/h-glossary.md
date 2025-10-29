# Unit 04: Level Design & World Systems - Glossary

---

## A

**AABB (Axis-Aligned Bounding Box)**
A rectangular collision box aligned with X and Y axes. Used for simple collision detection.
```typescript
interface AABB {
  x: number;
  y: number;
  width: number;
  height: number;
}
```

**Animated Tile**
A tile that changes its appearance over time using multiple frames.

**Atmospheric Layer**
A parallax layer representing sky elements (clouds, fog) that adds depth.

---

## B

**Bounding Box**
A rectangular area surrounding an object used for collision detection.

**Bounds**
Limits that constrain camera movement to keep it within the level.

---

## C

**Camera**
The viewport that determines what portion of the game world is visible.

**Camera Shake**
An effect that oscillates the camera position to simulate impact or explosion.

**Collision Map**
A simplified representation of the tilemap used for collision detection.

**Culling**
Skipping rendering of objects outside the visible area to improve performance.

---

## D

**Deadzone**
A rectangular area around the camera center where player movement doesn't affect the camera.

**Delta Time (dt)**
The time elapsed between frames, used for frame-independent movement.

---

## E

**Easing**
Smoothing movement transitions using interpolation functions.

---

## F

**Foreground Layer**
The layer rendered in front of the player, creating depth perception.

**Frame-Independent**
Movement that uses deltaTime to maintain consistent speed regardless of FPS.

---

## G

**Grid**
The 2D array structure organizing tiles in rows and columns.

**Grid Coordinates**
Integer coordinates representing tile positions (column, row).

---

## H

**Hazard Tile**
A tile that damages or kills the player on contact (spikes, lava, etc.).

---

## I

**Infinite Scrolling**
Repeating background pattern that appears endless.

**Interpolation (Lerp)**
Smoothly transitioning between two values over time.
```typescript
lerp(start, end, t) = start + (end - start) * t
```

---

## L

**Layer**
A separate rendering pass for different visual elements (background, world, foreground).

**Look-Ahead**
Camera technique that shifts the view in the direction of player movement.

---

## M

**Minkowski Difference**
Mathematical method for collision detection using shape subtraction.

---

## O

**One-Way Platform**
A platform the player can jump through from below but land on from above.

**Overlap**
When two collision boxes intersect, indicating a collision.

---

## P

**Parallax Scrolling**
Visual effect where background layers move at different speeds to create depth illusion.

**Parallax Ratio**
Multiplier determining how fast a layer moves relative to the camera (0.0 to 1.0).

**Pixel-Perfect Collision**
Collision detection at the individual pixel level (rarely needed).

---

## R

**Repeating Background**
Image that tiles horizontally/vertically to create an infinite appearance.

**Resolution**
The size of the game canvas in pixels (width × height).

---

## S

**Seamless Tile**
An image whose edges match, allowing it to tile without visible seams.

**Slope**
Diagonal terrain that requires special collision handling.

**Smooth Camera**
Camera that follows the player using interpolation for smooth movement.

**Spatial Hash**
Data structure for optimizing collision detection with many objects.

---

## T

**Tile**
The basic unit of a tilemap, representing a small square area.

**Tilemap**
A grid-based level representation using tiles.

**Tileset**
A collection of tile images, typically in a single image file.

**Tile Coordinates**
Integer coordinates (col, row) in the tilemap grid.

**Trigger Tile**
A tile that activates an event when the player touches it.

---

## V

**Viewport**
The visible area of the game world shown on screen.

**Viewport Coordinates**
Pixel coordinates relative to the camera's view (0,0 at top-left of screen).

---

## W

**World Coordinates**
Pixel coordinates in the full game world (independent of camera).

**World Space**
The coordinate system of the entire game world.

---

## Z

**Z-Index**
Layer ordering depth (higher values render on top).

---

## Mathematical Formulas

**Parallax Offset:**
```
offsetX = -cameraX * parallaxRatio
```

**Grid to World:**
```
worldX = col * tileWidth
worldY = row * tileHeight
```

**World to Grid:**
```
col = Math.floor(worldX / tileWidth)
row = Math.floor(worldY / tileHeight)
```

**AABB Collision:**
```
overlap = !(
  a.right < b.left ||
  a.left > b.right ||
  a.bottom < b.top ||
  a.top > b.bottom
)
```

**Linear Interpolation:**
```
result = start + (end - start) * t
```

**Camera Smooth Follow:**
```
camera.x += (target.x - camera.x) * smoothness * dt
```

---

## Common Patterns

**Tile Array Access:**
```typescript
const tile = tiles[row * width + col];
// or
const tile = tiles[row][col];
```

**Drawing Order:**
```
1. Sky/Background
2. Far parallax layers
3. Mid parallax layers
4. Tilemap background layer
5. Tilemap world layer
6. Entities (player, enemies)
7. Tilemap foreground layer
8. Effects (particles)
9. UI
```

**Collision Response:**
```typescript
if (collision.bottom) {
  player.y = tile.y - player.height;
  player.velocityY = 0;
  player.onGround = true;
}
```

---

## Coordinate Systems

**Screen Space:** (0,0) at top-left of canvas
**World Space:** (0,0) at top-left of level
**Grid Space:** (0,0) at first tile

**Conversions:**
```typescript
// World → Screen
screenX = worldX - camera.x;
screenY = worldY - camera.y;

// Screen → World
worldX = screenX + camera.x;
worldY = screenY + camera.y;

// World → Grid
col = Math.floor(worldX / tileWidth);
row = Math.floor(worldY / tileHeight);

// Grid → World
worldX = col * tileWidth;
worldY = row * tileHeight;
```

---

## Performance Terms

**Draw Call**
A single canvas rendering operation (drawImage, fillRect, etc.).

**Frame Budget**
Target time per frame (16.67ms for 60 FPS).

**Batching**
Combining multiple draw operations to reduce overhead.

**Caching**
Pre-rendering complex graphics to off-screen canvas.

---

## Design Terms

**Telegraphing**
Visual cues that warn the player of upcoming hazards.

**Readability**
How easily players can distinguish gameplay elements.

**Flow**
The natural path players follow through a level.

**Gating**
Using obstacles to control player progression.

---

## TypeScript/Canvas Specific

**Context (ctx)**
The 2D rendering context of an HTML5 canvas.

**requestAnimationFrame**
Browser API for smooth 60 FPS animation.

**Image**
HTMLImageElement object holding sprite/tile graphics.

**Transform**
Canvas transformations (translate, rotate, scale).

---

## Abbreviations

- **AABB**: Axis-Aligned Bounding Box
- **FPS**: Frames Per Second
- **dt**: Delta Time
- **ctx**: Canvas Context
- **px**: Pixels
- **lerp**: Linear Interpolation
- **SAT**: Separating Axis Theorem
- **GUI**: Graphical User Interface
- **UI**: User Interface
- **NPC**: Non-Player Character

---

## Related Units

See glossaries in:
- Unit 01: Core Game Loop
- Unit 02: Entity Systems
- Unit 03: Input & Controls
- Unit 05: Enemy AI
