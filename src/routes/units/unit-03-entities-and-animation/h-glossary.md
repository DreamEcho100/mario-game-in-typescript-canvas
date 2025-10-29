# Unit 03: Entities, Animations & Sprites - Glossary

> Definitions of key terms used in sprite rendering, animation, and entity management.

---

## A

**Animation**
The illusion of motion created by rapidly displaying a sequence of images (frames).

**Animation Event**
A callback triggered when an animation reaches a specific frame, used for sound effects or game logic.

**Animation State Machine**
A system that manages multiple animations and transitions between them based on game state.

**Asset**
Any resource used in a game (sprites, sounds, fonts, etc.).

**Atlas (Sprite Atlas)**
A single image containing multiple sprites with JSON metadata describing their positions and sizes.

---

## B

**Bobbing**
A subtle up-and-down animation, typically using a sine wave, to make idle objects feel alive.

**Bounds**
The rectangular area occupied by an entity, defined by x, y, width, and height.

**Bounding Box**
See **Bounds**.

---

## C

**Canvas Context**
The 2D rendering context (`CanvasRenderingContext2D`) used to draw on an HTML5 canvas element.

**Cell (Spatial Grid)**
A rectangular region in a spatial partitioning system, typically 64x64 pixels.

**Component**
A modular piece of behavior attached to an entity (e.g., PhysicsComponent, HealthComponent).

**Component System**
An architectural pattern where entities are composed of components rather than using inheritance.

**Composition**
Building complex behavior by combining simple components rather than inheritance hierarchies.

**Culling (Offscreen)**
Skipping the rendering of entities that are outside the visible camera area to improve performance.

**Cycle (Animation)**
A complete sequence of animation frames that repeats, such as a walk cycle.

---

## D

**Delta Time (dt)**
The time elapsed since the last frame, used to make animations frame-rate independent. Typically in milliseconds.

**Destroy**
To mark an entity as dead so it can be removed from the game.

**Draw Order**
The sequence in which entities are rendered, determining which appears on top (see **Z-Index**).

---

## E

**Entity**
Any game object that exists in the world (player, enemy, coin, platform, etc.).

**Entity Manager**
A system that stores, updates, and renders all entities in a game.

**ECS (Entity Component System)**
An architectural pattern where entities are IDs, components are data, and systems process entities with specific components.

---

## F

**Factory Pattern**
A design pattern for creating objects from data, allowing easy level loading and entity creation.

**Flip (Horizontal/Vertical)**
Mirroring a sprite along an axis, commonly used to change facing direction without extra sprite frames.

**FPS (Frames Per Second)**
The number of times the game updates and renders per second (60 FPS = 16.67ms per frame).

**Frame (Animation)**
A single image in an animation sequence.

**Frame Duration**
The time each animation frame is displayed before advancing to the next (e.g., 0.1 seconds = 100ms).

---

## G

**Garbage Collection (GC)**
Automatic memory management that removes unused objects. Frequent GC can cause performance issues.

**Grid (Spatial)**
See **Spatial Grid**.

---

## H

**Hash (Spatial)**
See **Spatial Grid**.

---

## I

**Image (HTMLImageElement)**
A JavaScript object representing a loaded image file.

**Inheritance**
Creating new classes based on existing ones (Enemy extends Entity).

**Interpolation**
Smoothing between two values over time, used for animations and transitions.

---

## J

**JSON (JavaScript Object Notation)**
A text format for storing structured data, commonly used for level files and sprite atlases.

**Juice**
Polish and visual/audio feedback that makes a game feel satisfying to play.

---

## K

**Keyframe**
An important frame in an animation sequence, typically the start or peak of an action.

---

## L

**Layer**
A rendering level, where entities on higher layers are drawn on top of lower layers.

**Lifecycle**
The stages an entity goes through: spawn → active → dying → dead → removed.

**Loop (Animation Mode)**
An animation that repeats indefinitely by returning to the first frame after the last.

---

## M

**Manager**
A system that handles a collection of related objects (EntityManager, AnimationManager).

**Metadata**
Additional information about assets, such as sprite positions in a texture atlas.

---

## O

**Object Pool**
A performance optimization that reuses objects instead of creating and destroying them repeatedly.

**Once (Animation Mode)**
An animation that plays through once and stops on the last frame.

**Optimization**
Techniques to improve performance (pooling, culling, spatial partitioning).

---

## P

**Particle**
A small, short-lived visual effect (spark, smoke, dust).

**Ping-Pong (Animation Mode)**
An animation that plays forward then backward repeatedly.

**Pixel Art**
A digital art style using deliberately low resolution and limited colors.

**Pool**
See **Object Pool**.

**Pooling**
See **Object Pool**.

---

## Q

**Quadtree**
A hierarchical spatial partitioning structure that divides space into four quadrants recursively.

---

## R

**Rasterization**
The process of converting vector graphics into pixels.

**Reference**
A pointer to an object in memory, allowing multiple parts of code to access the same object.

**Reset (Animation)**
Returning an animation to its first frame and initial state.

---

## S

**Sine Wave**
A mathematical curve used for smooth oscillating motion (bobbing, floating).

**Spatial Grid**
A performance optimization that divides the game world into cells for fast collision detection.

**Spatial Hash**
See **Spatial Grid**.

**Spatial Partitioning**
Dividing game space into regions to quickly find nearby objects.

**Sprite**
A 2D image or animation used as a graphical element in a game.

**Sprite Sheet (Texture Atlas)**
A single image containing multiple sprites arranged in a grid.

**State (Entity)**
The current condition of an entity (active, dying, dead).

**State (Animation)**
The current animation being played (idle, walk, run, jump).

**State Machine**
A system that manages states and transitions between them.

**System (ECS)**
Logic that processes entities with specific components.

---

## T

**Texture**
An image used in rendering, synonymous with sprite in 2D games.

**Tilemap**
A grid-based level layout where each cell references a tile sprite.

**Transform**
Geometric operations applied to rendering (translate, rotate, scale).

**Transition (Animation)**
Smoothly changing from one animation to another, often with blending.

---

## U

**Update**
The game loop phase where entity logic and physics are calculated.

**Update Rate**
How often the game updates per second, ideally matching the display refresh rate (60 Hz).

---

## V

**Velocity**
The speed and direction of an entity's movement (velocityX, velocityY).

---

## W

**Walk Cycle**
A looping animation of a character walking, typically 4-8 frames.

---

## Z

**Z-Index (Depth)**
A value determining render order, where higher values are drawn on top of lower values.

---

## Common Acronyms

| Acronym | Full Term | Meaning |
|---------|-----------|---------|
| **AABB** | Axis-Aligned Bounding Box | Rectangle collision shape |
| **DRY** | Don't Repeat Yourself | Avoid code duplication |
| **ECS** | Entity Component System | Game architecture pattern |
| **FPS** | Frames Per Second | Update rate |
| **GC** | Garbage Collection | Memory management |
| **JSON** | JavaScript Object Notation | Data format |
| **OOP** | Object-Oriented Programming | Programming paradigm |
| **RAF** | requestAnimationFrame | Browser API for smooth animation |
| **SOLID** | Design Principles | Software design principles |

---

## Common Variable Names

```typescript
// Time
dt         // Delta time (milliseconds since last frame)
time       // Accumulated time
elapsed    // Time elapsed since start

// Position & Movement
x, y       // Position coordinates
vx, vy     // Velocity (velocityX, velocityY)
width, height  // Dimensions
dx, dy     // Delta position (change in position)

// Animation
frame      // Current frame index
frameTime  // Time in current frame
frameDuration  // How long each frame lasts

// Canvas
ctx        // Canvas rendering context
canvas     // Canvas element
img        // Image element

// Camera
camera.x   // Camera position
screenX    // Position on screen after camera offset

// Collections
entities   // Array of entities
pool       // Object pool
grid       // Spatial grid
```

---

## Mathematical Terms

**Modulo (%)**
Remainder after division, used for looping: `(frame + 1) % frameCount`

**Sine (Math.sin)**
Trigonometric function that oscillates between -1 and 1, used for smooth bobbing.

**Delta (Δ)**
The Greek letter representing change or difference (delta time = change in time).

**O(n), O(n²)**
Big O notation describing algorithm complexity:
- O(n) = linear time (scales with input)
- O(n²) = quadratic time (scales with input squared)
- O(1) = constant time (doesn't scale)

---

## Design Patterns Used

**Factory Pattern**
Creates objects without specifying exact class.
```typescript
factory.create({ type: 'enemy', x: 100, y: 200 });
```

**Object Pool Pattern**
Reuses objects to avoid allocation overhead.
```typescript
const obj = pool.acquire();
pool.release(obj);
```

**State Pattern**
Encapsulates state-specific behavior.
```typescript
animState.setState('walk');
```

**Component Pattern**
Composes objects from independent components.
```typescript
entity.addComponent(new PhysicsComponent());
```

**Observer Pattern**
Objects notify subscribers of changes (events).
```typescript
eventBus.emit('enemy:died', enemy);
```

---

## Canvas API Methods

```typescript
// Drawing
ctx.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh)  // 9-param draw
ctx.fillRect(x, y, width, height)                    // Draw rectangle
ctx.clearRect(x, y, width, height)                   // Clear area

// Transforms
ctx.save()                      // Save state
ctx.restore()                   // Restore state
ctx.translate(x, y)            // Move origin
ctx.scale(sx, sy)              // Scale (use -1 to flip)
ctx.rotate(angle)              // Rotate (radians)

// Styling
ctx.fillStyle = 'red'          // Fill color
ctx.strokeStyle = 'blue'       // Stroke color
ctx.globalAlpha = 0.5          // Transparency (0-1)

// Image Rendering
ctx.imageSmoothingEnabled = false  // Crisp pixel art
```

---

## Performance Metrics

**Target Performance (60 FPS):**
- Frame budget: 16.67ms
- Update: < 5ms
- Draw: < 10ms
- Browser overhead: ~1-2ms

**Entity Counts:**
- No optimization: ~50 entities
- With culling: ~200 entities
- With spatial grid: ~500 entities
- With pooling + grid: 1000+ entities

---

## Typical Values

```typescript
// Frame durations (seconds)
IDLE_SPEED = 0.2      // Slow, relaxed
WALK_SPEED = 0.1      // Moderate
RUN_SPEED = 0.05      // Fast

// Sprite sizes (pixels)
TILE_SIZE = 16        // Classic NES
CHAR_WIDTH = 32       // Character width
CHAR_HEIGHT = 48      // Character height (taller than wide)

// Physics
GRAVITY = 800         // pixels/sec²
JUMP_SPEED = -400     // pixels/sec (negative = up)
WALK_SPEED = 100      // pixels/sec
RUN_SPEED = 200       // pixels/sec

// Grid
CELL_SIZE = 64        // Spatial grid cell size

// Pool sizes
BULLET_POOL = 50      // Pre-allocate 50 bullets
PARTICLE_POOL = 200   // Pre-allocate 200 particles
```

---

**Use this glossary as a quick reference while studying!**

Return to [Unit 03 Overview](README.md) or continue to [Unit 04](../unit-04/).
