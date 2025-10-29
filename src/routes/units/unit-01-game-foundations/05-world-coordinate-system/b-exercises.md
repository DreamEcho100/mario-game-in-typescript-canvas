# World Coordinate System - Exercises

**Unit 01: Game Foundations | Topic 05**

> Practice working with cameras, coordinates, and scrolling worlds.

---

## Exercise 1: World vs Screen Coordinates ⭐

**Goal:** Understand the difference between world and screen space.

**Task:**
1. Create a world that's 2000px wide
2. Place a player at world position (1000, 300)
3. Create a camera at world position (800, 0)
4. Draw the player on screen using the camera offset

**Requirements:**
- World dimensions: 2000×600
- Canvas dimensions: 800×600
- Player at world (1000, 300)
- Camera at world (800, 0)
- Calculate and display screen position

**Expected Result:**
- Player appears at screen position (200, 300)
- Console logs both world and screen coordinates

**Starter Code:**

```typescript
const canvas = document.getElementById('game') as HTMLCanvasElement;
const ctx = canvas.getContext('2d')!;
canvas.width = 800;
canvas.height = 600;

const world = {
    width: 2000,
    height: 600
};

const player = {
    x: 1000,  // World position
    y: 300,
    width: 32,
    height: 32
};

const camera = {
    x: 800,   // World position
    y: 0,
    width: canvas.width,
    height: canvas.height
};

function gameLoop() {
    // TODO: Calculate screen position
    // TODO: Draw player at screen position
    // TODO: Display coordinates
    
    requestAnimationFrame(gameLoop);
}

gameLoop();
```

**Hints:**
- Screen X = World X - Camera X
- Screen Y = World Y - Camera Y

---

## Exercise 2: Basic Camera Follow ⭐

**Goal:** Make the camera follow the player.

**Task:**
1. Allow player movement with arrow keys
2. Center camera on player
3. Draw player in center of screen
4. Show world bounds

**Requirements:**
- Player moves with arrow keys (200 px/s)
- Camera centers on player
- World is 3000×600
- Canvas is 800×600

**Expected Result:**
- Player always appears in center of screen
- World scrolls as player moves
- Camera stops at world edges

**Starter Code:**

```typescript
const player = {
    x: 400,
    y: 300,
    width: 32,
    height: 32,
    velocityX: 0,
    velocityY: 0
};

const camera = {
    x: 0,
    y: 0,
    width: 800,
    height: 600
};

function updateCamera() {
    // TODO: Center camera on player
    // TODO: Clamp camera to world bounds
}

function draw() {
    // TODO: Draw world background
    // TODO: Translate canvas
    // TODO: Draw player
}
```

---

## Exercise 3: Smooth Camera Follow ⭐⭐

**Goal:** Implement smooth camera movement with lerp.

**Task:**
1. Make camera smoothly follow player
2. Use linear interpolation
3. Add smoothness slider (0.01 to 1.0)
4. Compare instant vs smooth follow

**Requirements:**
- Lerp formula: `camera.x += (target.x - camera.x) * smoothness`
- Default smoothness: 0.1
- UI slider to adjust smoothness
- Display current smoothness value

**Expected Result:**
- Camera smoothly catches up to player
- Lower smoothness = smoother (slower)
- Higher smoothness = more responsive (faster)

---

## Exercise 4: Camera Deadzone ⭐⭐

**Goal:** Only move camera when player leaves a central zone.

**Task:**
1. Define a deadzone rectangle in center of screen
2. Camera only moves when player exits deadzone
3. Draw visible deadzone outline
4. Player can move freely within deadzone

**Requirements:**
- Deadzone: 300×200 pixels in screen center
- Draw deadzone with dashed outline
- Camera updates only when player outside zone
- Smooth transition when exiting deadzone

**Expected Result:**
- Player moves in center without camera moving
- Camera follows when player reaches edge of deadzone
- Visual feedback of deadzone boundaries

---

## Exercise 5: Camera Bounds ⭐

**Goal:** Prevent camera from showing areas outside the world.

**Task:**
1. Create a world smaller than expected
2. Implement camera clamping
3. Show when camera hits bounds
4. Prevent black bars at edges

**Requirements:**
- World: 1500×600
- Canvas: 800×600
- Camera stops at world edges
- Visual indicator when clamped

**Expected Result:**
- Camera doesn't go past world edges
- Player can reach world boundaries
- No empty space visible beyond world

**Clamping Formula:**
```typescript
camera.x = Math.max(0, Math.min(camera.x, worldWidth - cameraWidth));
camera.y = Math.max(0, Math.min(camera.y, worldHeight - cameraHeight));
```

---

## Exercise 6: Viewport Culling ⭐⭐

**Goal:** Only draw entities that are visible on screen.

**Task:**
1. Create 100 entities spread across a large world
2. Implement on-screen detection
3. Only draw visible entities
4. Display count of visible vs total entities

**Requirements:**
- World: 5000×600
- 100 randomly placed entities
- Cull off-screen entities
- Show "Drawn: X / Total: 100" on screen

**Expected Result:**
- Only 10-20 entities drawn at a time
- Performance improvement with many entities
- Smooth scrolling with no lag

**Culling Check:**
```typescript
function isOnScreen(entity: Entity, camera: Camera): boolean {
    return entity.x + entity.width > camera.x &&
           entity.x < camera.x + camera.width &&
           entity.y + entity.height > camera.y &&
           entity.y < camera.y + camera.height;
}
```

---

## Exercise 7: Canvas Translation ⭐⭐

**Goal:** Use `ctx.translate()` instead of manual coordinate conversion.

**Task:**
1. Draw world using `ctx.translate()`
2. Draw UI without translation
3. Use `ctx.save()` and `ctx.restore()`
4. Compare with manual approach

**Requirements:**
- Translate canvas by camera offset
- Draw world entities in world coordinates
- Draw UI in screen coordinates
- Proper save/restore

**Expected Result:**
- World entities use world coordinates directly
- UI stays fixed on screen
- Cleaner code than manual conversion

**Pattern:**
```typescript
// World layer (translated)
ctx.save();
ctx.translate(-camera.x, -camera.y);
drawWorld(ctx);
ctx.restore();

// UI layer (not translated)
drawUI(ctx);
```

---

## Exercise 8: Camera Look-Ahead ⭐⭐⭐

**Goal:** Position camera ahead of player's movement direction.

**Task:**
1. Detect player's facing direction
2. Offset camera in that direction
3. Smooth transition when changing direction
4. Add look-ahead distance slider

**Requirements:**
- Look-ahead distance: 100-200 pixels
- Smooth lerp for look-ahead
- Player sprite flips based on direction
- Works with both keyboard and velocity

**Expected Result:**
- Camera shows more space in front of player
- Gives player "look ahead" view
- Smooth panning when changing direction

**Formula:**
```typescript
const lookAheadX = player.facingRight ? lookAheadDistance : -lookAheadDistance;
const targetX = player.x + lookAheadX - camera.width / 2;
camera.x += (targetX - camera.x) * smoothness;
```

---

## Exercise 9: Screen to World Conversion ⭐⭐

**Goal:** Convert mouse clicks to world coordinates.

**Task:**
1. Handle mouse clicks on canvas
2. Convert screen position to world position
3. Spawn entity at clicked world position
4. Display both screen and world coordinates

**Requirements:**
- Click to spawn objects
- Show screen coordinates (relative to canvas)
- Show world coordinates (absolute)
- Objects stay in world, not screen

**Expected Result:**
- Click anywhere on screen
- Entity appears at correct world position
- Entity stays in place as camera moves

**Conversion:**
```typescript
const worldX = screenX + camera.x;
const worldY = screenY + camera.y;
```

---

## Exercise 10: Parallax Scrolling ⭐⭐⭐

**Goal:** Create depth with multiple background layers.

**Task:**
1. Create 3 background layers
2. Each layer scrolls at different speed
3. Repeat layers seamlessly
4. Layer order: sky → clouds → hills

**Requirements:**
- Sky: scrollSpeed = 0.0 (fixed)
- Clouds: scrollSpeed = 0.3
- Hills: scrollSpeed = 0.6
- Seamless horizontal tiling

**Expected Result:**
- Illusion of depth
- Far layers move slower
- No visible seams in backgrounds

**Layer Drawing:**
```typescript
class Layer {
    draw(ctx: CanvasRenderingContext2D, camera: Camera) {
        const offsetX = camera.x * this.scrollSpeed;
        const imageWidth = this.image.width;
        
        // Draw tiles to cover screen
        for (let x = -offsetX % imageWidth; x < camera.width; x += imageWidth) {
            ctx.drawImage(this.image, x, 0);
        }
    }
}
```

---

## Exercise 11: Camera Shake ⭐⭐

**Goal:** Add screen shake effect for impacts.

**Task:**
1. Implement camera shake on spacebar press
2. Random offset decreases over time
3. Shake intensity parameter
4. Multiple shake calls stack

**Requirements:**
- Shake on spacebar press
- Random offset in X and Y
- Exponential decay (multiply by 0.9 each frame)
- Stop when amplitude < 0.1

**Expected Result:**
- Screen shakes on input
- Gradually returns to normal
- Multiple shakes combine

**Implementation:**
```typescript
class Camera {
    private shakeAmount = 0;
    
    shake(intensity: number) {
        this.shakeAmount += intensity;
    }
    
    update() {
        if (this.shakeAmount > 0) {
            this.x += (Math.random() - 0.5) * this.shakeAmount;
            this.y += (Math.random() - 0.5) * this.shakeAmount;
            this.shakeAmount *= 0.9;
            if (this.shakeAmount < 0.1) this.shakeAmount = 0;
        }
    }
}
```

---

## Exercise 12: Camera Zoom ⭐⭐⭐

**Goal:** Implement camera zoom in/out.

**Task:**
1. Add zoom level (0.5x to 2x)
2. Scale canvas transformations
3. Mouse wheel controls zoom
4. Adjust camera bounds for zoom

**Requirements:**
- Default zoom: 1.0
- Mouse wheel to zoom in/out
- Scale both position and dimensions
- Update viewport calculations

**Expected Result:**
- Zoom in: see less world, bigger sprites
- Zoom out: see more world, smaller sprites
- Camera bounds adjust with zoom

**Scaling:**
```typescript
ctx.save();
ctx.scale(camera.zoom, camera.zoom);
ctx.translate(-camera.x, -camera.y);
// Draw world
ctx.restore();
```

---

## Exercise 13: Multiple Parallax Layers ⭐⭐⭐

**Goal:** Create a complete parallax system with 5+ layers.

**Task:**
1. Implement 5 parallax layers
2. Each with different scroll speed
3. Add vertical parallax for Y movement
4. Seamless tiling for all layers

**Requirements:**
- Layers: sky, far clouds, mountains, trees, grass
- Scroll speeds: 0.0, 0.2, 0.4, 0.7, 0.9
- Vertical parallax support
- Efficient rendering (only visible tiles)

**Expected Result:**
- Rich depth effect
- Smooth scrolling
- No performance issues
- Works for both X and Y camera movement

---

## Exercise 14: Camera Zones ⭐⭐⭐

**Goal:** Different camera behavior in different areas.

**Task:**
1. Define multiple camera zones
2. Each zone has different constraints
3. Smooth transition between zones
4. Visual debug display of zones

**Requirements:**
- At least 3 different zones:
  - Free scroll zone
  - Horizontally locked zone (vertical only)
  - Fully locked zone (fixed camera)
- Detect which zone player is in
- Apply zone constraints to camera

**Expected Result:**
- Camera behavior changes based on player position
- Smooth transitions between zones
- Visual feedback of current zone

---

## Exercise 15: Mini-Map ⭐⭐⭐

**Goal:** Display a small overview map of the entire world.

**Task:**
1. Draw miniature version of world
2. Show camera viewport on minimap
3. Show player position
4. Click minimap to teleport camera

**Requirements:**
- Minimap in top-right corner (150×100)
- Scale: world → minimap
- Camera viewport outline
- Player dot on minimap
- Click to move camera

**Expected Result:**
- See entire world at a glance
- Know where you are in world
- Quick navigation via minimap
- Camera viewport indicator moves with camera

**Scaling:**
```typescript
const minimapX = (worldX / worldWidth) * minimapWidth;
const minimapY = (worldY / worldHeight) * minimapHeight;
```

---

## Challenge Project 1: Side-Scrolling Level 🏆

**Goal:** Build a complete side-scrolling platformer level.

**Requirements:**

1. **World:**
   - 5000×600 pixels
   - Tile-based ground
   - Platforms at various heights
   - Background with 3 parallax layers

2. **Camera:**
   - Smooth follow with lerp (0.1)
   - Deadzone (200×100)
   - Bounds clamping
   - Camera shake on landing

3. **Player:**
   - Movement (walk, jump)
   - Gravity and collision
   - Stays within world bounds
   - Sprite flips with direction

4. **Optimization:**
   - Viewport culling for entities
   - Only update nearby entities
   - Performance counter (FPS)

5. **UI:**
   - Score display
   - Minimap
   - Debug info (position, camera)

**Bonus:**
- Collectible coins throughout level
- Moving enemies
- Goal at end of level
- Level transition

---

## Challenge Project 2: Vertical Scrolling Game 🏆

**Goal:** Create a vertical scrolling game (like flappy bird or cave flyer).

**Requirements:**

1. **World:**
   - 800×10000 pixels (tall)
   - Vertically scrolling
   - Procedurally placed obstacles

2. **Camera:**
   - Always centered on player horizontally
   - Follows player vertically with offset
   - Smooth follow
   - Scrolls up as player progresses

3. **Player:**
   - Horizontal movement only
   - Camera pulls player up
   - Avoid obstacles
   - Die if hit or fall behind camera

4. **Obstacles:**
   - Generated off-screen (top)
   - Culled when off-screen (bottom)
   - Various types and patterns

5. **Scoring:**
   - Distance traveled
   - High score persistence
   - Difficulty increases over time

**Bonus:**
- Power-ups
- Particle effects
- Progressive difficulty
- Multiple obstacle types

---

## Challenge Project 3: Open World Explorer 🏆

**Goal:** Create an open world that player can freely explore.

**Requirements:**

1. **World:**
   - 3000×2000 pixels (both X and Y)
   - Different biomes (forest, desert, snow)
   - Visual boundaries
   - Points of interest

2. **Camera:**
   - Free movement (all directions)
   - Smooth follow with lerp
   - Zoom with mouse wheel (0.5x - 2x)
   - Camera bounds for entire world

3. **Player:**
   - 8-direction movement
   - Velocity-based (acceleration/friction)
   - Direction-based sprite
   - Footstep particles

4. **World Features:**
   - Trees, rocks, buildings
   - Collision with world objects
   - Interactive elements (doors, chests)
   - Day/night cycle (parallax sky changes)

5. **UI:**
   - Full-featured minimap
   - Compass
   - Coordinates display
   - Objectives tracker

**Bonus:**
- NPCs in different locations
- Quest system
- Save/load position
- Fog of war (reveal as you explore)

---

## Testing Checklist

For each exercise, verify:

- [ ] Camera follows player correctly
- [ ] World bounds enforced
- [ ] No black bars or empty space visible
- [ ] Smooth camera movement (no jitter)
- [ ] UI stays fixed on screen
- [ ] Entities drawn at correct positions
- [ ] Performance acceptable (60 FPS)
- [ ] Mouse/touch input converts to world coords properly
- [ ] Viewport culling working (entities culled off-screen)
- [ ] Parallax layers render correctly

---

## Common Issues

### Camera Jitter
- **Cause:** Rounding errors or conflicting updates
- **Fix:** Update camera once per frame, round coordinates

### Black Bars at Edges
- **Cause:** Camera going past world bounds
- **Fix:** Clamp camera position

### UI Moves with Camera
- **Cause:** Forgot `ctx.restore()` after translation
- **Fix:** Always pair `ctx.save()` with `ctx.restore()`

### Wrong Mouse Position
- **Cause:** Forgot to add camera offset
- **Fix:** `worldX = mouseX + camera.x`

### Poor Performance
- **Cause:** Drawing all entities, not culling
- **Fix:** Check `isOnScreen()` before drawing

---

**Next:** Check solutions in `c-solutions.md`! 🎮