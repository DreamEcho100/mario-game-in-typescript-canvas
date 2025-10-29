# Unit 01: Glossary

**Game Foundations**

> Definitions of key terms, concepts, and patterns used in game development.

---

## A

**Acceleration**
The rate of change of velocity. In games, often used for gravity or speeding up/slowing down movement smoothly.

**AABB (Axis-Aligned Bounding Box)**
A rectangular collision box aligned with the coordinate axes (not rotated). Simple and fast for collision detection.

**Alpha**
The transparency value of a color (0 = fully transparent, 1 = fully opaque). In Canvas: `rgba(255, 0, 0, 0.5)`.

**Animation Frame**
One image in a sequence of images that create animation. Multiple frames shown quickly create the illusion of movement.

**Anti-aliasing**
Smoothing jagged edges of graphics. Canvas applies this automatically, but can be disabled for pixel art.

**Arc**
A curved line segment, part of a circle. Drawn with `ctx.arc()` in Canvas.

---

## B

**Bézier Curve**
A smooth curve defined by control points. Canvas supports quadratic and cubic Bézier curves.

**Blitting**
Fast pixel copying from one image/canvas to another. Common in older game engines, less relevant in modern Canvas.

**Bounds**
The limits of an area. World bounds define the playable area; camera bounds prevent the camera from going beyond the world.

**Buffer**
Temporary storage for data. Input buffer stores recent key presses; double buffer prevents screen tearing.

---

## C

**Cache**
Storing computed results for reuse. Caching rendered images improves performance.

**Canvas**
An HTML5 element (`<canvas>`) that provides a drawing surface. Used for 2D games via the 2D rendering context.

**Clamp**
Restricting a value to a range. `Math.max(min, Math.min(value, max))` clamps value between min and max.

**Collision Detection**
Determining when two game objects intersect or touch. Essential for game physics and interaction.

**Component**
In Entity Component System (ECS), a component is data attached to an entity (e.g., Position, Velocity, Sprite).

**Context (Rendering Context)**
The 2D drawing API for Canvas, obtained via `canvas.getContext('2d')`. Provides methods like `fillRect()`, `drawImage()`, etc.

**Coordinate System**
The system defining positions. Canvas uses (0,0) at top-left, x increases right, y increases down.

**Coyote Time**
Grace period after leaving a platform where the player can still jump. Named after Wile E. Coyote running off cliffs.

**Culling (Viewport Culling)**
Not rendering objects outside the camera view. Improves performance significantly in large worlds.

---

## D

**Deadzone**
A region around the player where the camera doesn't move. Reduces motion sickness and jitter in camera follow.

**Delta Time**
Time elapsed since the last frame. Used to make movement frame-rate independent: `position += velocity * deltaTime`.

**Draw Call**
A command to render something on screen. Minimizing draw calls improves performance.

---

## E

**Easing**
Smoothing motion with acceleration/deceleration. Common easing functions: linear, ease-in, ease-out, ease-in-out.

**Entity**
A game object (player, enemy, collectible, etc.). Contains data and behavior.

**Enum**
A set of named constants. TypeScript enums are useful for states: `enum State { Idle, Walking, Jumping }`.

**Event Listener**
Function called when an event occurs (e.g., keydown, click). Used for input handling.

---

## F

**FPS (Frames Per Second)**
How many times per second the screen updates. 60 FPS is standard for smooth gameplay.

**FSM (Finite State Machine)**
A system with a limited set of states and rules for transitioning between them. Used for game logic and AI.

**Frame**
One complete screen update. In a game loop, each iteration is one frame.

**Frame-Rate Independence**
Making game logic work consistently regardless of FPS. Achieved using delta time.

---

## G

**Game Loop**
The core loop that updates game state and renders every frame. Typically uses `requestAnimationFrame`.

**Gradient**
A smooth color transition. Canvas supports linear and radial gradients.

**Graphics Context**
See *Context (Rendering Context)*.

---

## H

**Hitbox**
The area used for collision detection. Often smaller than the sprite for better gameplay feel.

**HUD (Heads-Up Display)**
UI elements showing game info (health, score, etc.) overlaid on the game screen.

---

## I

**Input Buffer**
Storing recent inputs so late key presses still register. Improves responsiveness, especially for jump inputs.

**Interpolation (Lerp)**
Smoothly transitioning between two values. `lerp(a, b, t) = a + (b - a) * t` where t is 0-1.

---

## J

**Jitter**
Unwanted shaking or stuttering in animation. Often caused by rounding errors or inconsistent frame timing.

**JSON (JavaScript Object Notation)**
Text format for data. Used for level files, save data, configuration.

---

## K

**Keyframe**
Specific point in an animation timeline. Game animations often use sprite keyframes.

**Kinematic**
Movement without physics simulation. Player movement is usually kinematic (direct control), unlike physics-based objects.

---

## L

**Layer**
Separate rendering level. Games typically have background, world, and UI layers.

**Lerp (Linear Interpolation)**
See *Interpolation*.

**Look-Ahead**
Camera technique showing more space ahead of the player's movement direction.

---

## M

**Matrix**
Mathematical structure for transformations. Canvas uses transformation matrices internally for rotate, scale, translate.

**Minimap**
Small overview map showing the game world and player position.

---

## N

**Normalize**
Converting a vector to length 1 while keeping its direction. Used for consistent speed in any direction.

---

## O

**Object Pooling**
Reusing objects instead of creating/destroying them. Improves performance by reducing garbage collection.

**Offset**
Distance from a reference point. Camera offset determines what part of the world is visible.

---

## P

**Parallax Scrolling**
Background layers moving at different speeds to create depth illusion. Distant layers move slower.

**Path**
Series of connected lines and curves. Canvas paths are drawn with `beginPath()`, `moveTo()`, `lineTo()`, etc.

**Pixel-Perfect**
Graphics aligned exactly to pixels without sub-pixel positioning. Important for crisp pixel art.

**Polling**
Checking input state continuously (every frame) instead of waiting for events.

**Projection**
Converting 3D coordinates to 2D screen space. In 2D games, converting world coordinates to screen coordinates.

---

## Q

**Quadtree**
Spatial partitioning structure dividing space into four quadrants recursively. Used for efficient collision detection in large worlds.

---

## R

**RAF (requestAnimationFrame)**
Browser API for smooth animation. Calls your function before the next repaint, synced with display refresh.

**Raycast**
Tracing a line to detect collisions. Used for line-of-sight checks, shooting mechanics.

**Render**
Drawing graphics to the screen.

**Resolution**
Canvas size in pixels. Higher resolution = more detail but worse performance.

---

## S

**Screen Space**
Coordinate system relative to the screen/canvas. Origin at top-left of canvas.

**Smoothing**
Applying interpolation to reduce jitter. Used for camera follow, movement transitions.

**Spatial Partitioning**
Dividing game world into regions for efficient collision detection. Examples: grid, quadtree.

**Sprite**
2D image representing a game object. Can be a single image or part of a sprite sheet.

**Sprite Sheet**
Single image containing multiple sprites or animation frames. More efficient than separate images.

**State**
Current condition of an object or system. Player states: idle, walking, jumping. Game states: menu, playing, paused.

**State Machine**
See *FSM (Finite State Machine)*.

**State Pattern**
Design pattern where each state is an object with enter/update/exit methods. Alternative to enum-based FSM.

---

## T

**Texture**
Image applied to a surface. In 2D games, synonymous with sprite or image.

**Tick**
One iteration of the game loop. Often used interchangeably with frame.

**Tiled Map**
Level composed of a grid of square tiles. Efficient for platform games and RPGs.

**Timestamp**
Time value used for timing calculations. `performance.now()` returns high-resolution timestamps.

**Transform**
Operation changing position, rotation, or scale. Canvas transforms: translate, rotate, scale.

**Transition**
Change from one state to another. Can be immediate or animated.

---

## U

**Update**
Processing game logic for one frame. Separate from rendering.

**UI (User Interface)**
Elements for player interaction: menus, buttons, HUD.

---

## V

**Vector**
Mathematical object with magnitude and direction. In 2D: {x, y}. Used for position, velocity, forces.

**Velocity**
Speed with direction. How fast and which way an object moves.

**Viewport**
Visible portion of the game world. Camera controls the viewport.

**VSync (Vertical Sync)**
Syncing rendering with display refresh to prevent tearing. `requestAnimationFrame` handles this automatically.

---

## W

**World Space**
Coordinate system relative to the game world. Origin at world's (0,0), independent of camera position.

---

## X

**X-axis**
Horizontal axis. In Canvas, x increases to the right.

---

## Y

**Y-axis**
Vertical axis. In Canvas, y increases downward (opposite of mathematical convention).

---

## Z

**Z-index**
Drawing order. Objects with higher z-index drawn on top. In 2D Canvas, controlled by draw order.

**Zoom**
Scale factor for viewing the world. Zoom > 1 makes things larger, < 1 makes them smaller.

---

## Canvas API Terms

**arc()**
Draws circular arc or circle.

**beginPath()**
Starts a new path for drawing shapes.

**clearRect()**
Erases pixels in a rectangle.

**clip()**
Restricts drawing to a defined region.

**closePath()**
Closes current path by connecting back to start.

**drawImage()**
Draws an image, canvas, or video frame.

**fill()**
Fills current path with current fill style.

**fillRect()**
Draws filled rectangle.

**fillStyle**
Color, gradient, or pattern for filled shapes.

**fillText()**
Draws filled text.

**font**
Text font (family, size, weight, style).

**globalAlpha**
Transparency for all drawing operations (0-1).

**globalCompositeOperation**
How new drawings combine with existing pixels.

**lineTo()**
Adds line to current path.

**lineWidth**
Thickness of strokes.

**moveTo()**
Moves path starting point without drawing.

**restore()**
Restores previously saved canvas state.

**rotate()**
Rotates future drawings around origin.

**save()**
Saves current canvas state (transforms, styles).

**scale()**
Scales future drawings.

**stroke()**
Draws outline of current path.

**strokeRect()**
Draws rectangle outline.

**strokeStyle**
Color, gradient, or pattern for strokes.

**strokeText()**
Draws text outline.

**textAlign**
Horizontal text alignment (left, center, right).

**textBaseline**
Vertical text alignment (top, middle, bottom).

**translate()**
Moves origin to new position.

---

## Game Design Patterns

**Component Pattern**
Dividing functionality into reusable components. Part of ECS architecture.

**Game Loop Pattern**
Continuous cycle: process input → update → render → repeat.

**Object Pool Pattern**
Reusing objects instead of creating/destroying. Reduces garbage collection.

**Observer Pattern**
Objects subscribe to events and get notified of changes. Useful for achievements, UI updates.

**Singleton Pattern**
Ensuring only one instance of a class exists. Used for game managers, input handlers.

**State Pattern**
Encapsulating states as objects with their own behavior. Alternative to switch statements.

**Strategy Pattern**
Encapsulating algorithms to swap them at runtime. Used for AI behaviors, input schemes.

---

## TypeScript Terms

**Interface**
Defines shape of an object. Used for type checking.

**Type**
Custom type definition. Similar to interface but more flexible.

**Enum**
Named constants grouped together.

**Generic**
Type that works with multiple types. Example: `Array<T>`.

**Class**
Blueprint for creating objects with properties and methods.

**Constructor**
Special method called when creating new class instance.

**Public/Private/Protected**
Access modifiers controlling visibility of class members.

**Readonly**
Property that cannot be changed after initialization.

**Optional (?)**
Property or parameter that may be undefined.

**Union Type (|)**
Value that can be one of several types. Example: `string | number`.

---

## Performance Terms

**Bottleneck**
The slowest part limiting overall performance.

**Draw Call**
Command to GPU to render something. Fewer is better.

**Frame Drop**
When FPS drops below target (60). Causes stuttering.

**Garbage Collection (GC)**
Automatic memory cleanup. Can cause frame drops if too frequent.

**Memory Leak**
Memory not released after use. Causes performance degradation over time.

**Profiling**
Measuring performance to find bottlenecks. Use browser DevTools.

**Render Time**
Time spent drawing each frame. Should be < 16ms for 60 FPS.

**Update Time**
Time spent on game logic each frame. Should be < 16ms for 60 FPS.

---

## Math Terms

**Absolute Value**
Distance from zero, always positive. `Math.abs(-5) = 5`.

**Angle**
Rotation measured in degrees (0-360) or radians (0-2π).

**Cosine/Sine**
Trigonometric functions for circular motion and rotation.

**Distance**
Length between two points. `Math.sqrt((x2-x1)**2 + (y2-y1)**2)`.

**Magnitude**
Length of a vector. `Math.sqrt(x*x + y*y)`.

**Radian**
Unit of angle. 2π radians = 360 degrees. `radians = degrees * Math.PI / 180`.

**Slope**
Rate of change. Rise over run. `(y2 - y1) / (x2 - x1)`.

---

## Common Abbreviations

- **2D** - Two-Dimensional
- **API** - Application Programming Interface
- **ctx** - Context (rendering context variable)
- **dt** - Delta Time
- **ECS** - Entity Component System
- **FPS** - Frames Per Second
- **FSM** - Finite State Machine
- **GC** - Garbage Collection
- **HUD** - Heads-Up Display
- **lerp** - Linear Interpolation
- **OOP** - Object-Oriented Programming
- **RAF** - requestAnimationFrame
- **RGB/RGBA** - Red Green Blue (Alpha)
- **UI** - User Interface
- **Vec2** - 2D Vector

---

## Common Variable Names

```typescript
// Time
dt, deltaTime        // Time since last frame
now, timestamp       // Current time
lastTime            // Previous frame time
elapsed             // Total time elapsed

// Position & Movement
x, y                // Position coordinates
vx, vy              // Velocity
dx, dy              // Delta (change in) position
speed               // Magnitude of velocity
angle, rotation     // Rotation angle

// Size
w, h                // Width, height
width, height       // Width, height (full names)
radius, r           // Circle radius

// Canvas
canvas              // Canvas element
ctx                 // 2D rendering context

// Game Loop
frame               // Frame counter
fps                 // Frames per second
running             // Is game running?
paused              // Is game paused?

// Input
keys                // Keyboard state object
mouse               // Mouse state object
pressed             // Key/button currently pressed

// Camera
camera              // Camera object
camX, camY          // Camera position
viewport            // Visible area

// Entities
player              // Player entity
entities            // Array of game objects
enemies             // Array of enemies
```

---

## Quick Reference: Common Patterns

### Game Loop
```typescript
function gameLoop(timestamp: number) {
    const deltaTime = (timestamp - lastTime) / 1000;
    lastTime = timestamp;
    
    update(deltaTime);
    render();
    
    requestAnimationFrame(gameLoop);
}
```

### Input State
```typescript
const keys: {[key: string]: boolean} = {};

window.addEventListener('keydown', (e) => {
    keys[e.code] = true;
});

window.addEventListener('keyup', (e) => {
    keys[e.code] = false;
});
```

### State Machine
```typescript
enum State { Idle, Walking, Jumping }

let currentState = State.Idle;

function updateState() {
    switch (currentState) {
        case State.Idle:
            if (keys['Space']) currentState = State.Jumping;
            if (keys['KeyD']) currentState = State.Walking;
            break;
        // ... other states
    }
}
```

### Camera Follow
```typescript
camera.x = player.x - camera.width / 2;
camera.x = Math.max(0, Math.min(camera.x, worldWidth - camera.width));
```

### World to Screen
```typescript
const screenX = worldX - camera.x;
const screenY = worldY - camera.y;
```

---

**You're now equipped with the vocabulary to navigate game development discussions!** 🎮

Refer back to this glossary whenever you encounter unfamiliar terms.