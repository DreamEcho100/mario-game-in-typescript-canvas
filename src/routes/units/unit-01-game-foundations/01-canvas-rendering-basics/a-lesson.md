# Canvas Rendering Basics

**Unit 01: Game Foundations | Topic 01 of 05**

> **Learning Objective:** Master the HTML5 Canvas API to render shapes, images, and text. Understand the 2D rendering context, coordinate systems, and basic drawing operations that form the foundation of your Mario-like platformer.

---

## Table of Contents

1. [Introduction](#introduction)
2. [The Canvas Element](#the-canvas-element)
3. [The 2D Rendering Context](#the-2d-rendering-context)
4. [Drawing Basic Shapes](#drawing-basic-shapes)
5. [Colors and Styles](#colors-and-styles)
6. [Transformations](#transformations)
7. [Images and Sprites](#images-and-sprites)
8. [Text Rendering](#text-rendering)
9. [Clearing and Compositing](#clearing-and-compositing)
10. [Performance Considerations](#performance-considerations)
11. [Application to Mario Game](#application-to-mario-game)
12. [Summary](#summary)
13. [Next Steps](#next-steps)

---

## Introduction

### What is Canvas?

The HTML5 Canvas is a powerful, low-level drawing surface that allows you to render graphics dynamically using JavaScript. Think of it as a blank digital canvas where you can paint pixels, shapes, images, and text programmatically.

**Why Canvas for Games?**

1. **Performance**: Direct pixel manipulation, hardware-accelerated
2. **Control**: Low-level access to every pixel
3. **Flexibility**: Draw anything you can imagine
4. **Web-native**: No plugins required, works in all modern browsers
5. **2D-optimized**: Perfect for platformers like Mario

### What You'll Learn

By the end of this lesson, you'll be able to:

- Set up and configure a Canvas element
- Draw shapes (rectangles, circles, lines, paths)
- Apply colors, gradients, and patterns
- Transform the drawing context (translate, rotate, scale)
- Load and render images (for sprites later)
- Render text for UI and debugging
- Understand performance implications of drawing operations

### Prerequisites

- Basic HTML and JavaScript knowledge
- Understanding of coordinates (x, y positions)
- Familiarity with CSS styling (helpful but not required)

### Time Investment

- Reading: 1.5 hours
- Practice: 2 hours
- Total: ~3.5 hours

---

## The Canvas Element

### Creating a Canvas

A canvas is created using the `<canvas>` HTML element:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Mario Game</title>
</head>
<body>
    <canvas id="gameCanvas" width="800" height="600"></canvas>
    <script src="game.js"></script>
</body>
</html>
```

**Key Points:**
- The `<canvas>` tag creates the drawing surface
- `width` and `height` attributes set the internal resolution
- `id` allows us to reference it from JavaScript
- Place `<script>` after `<canvas>` to ensure the element exists

### Canvas vs CSS Dimensions

Understanding the difference between canvas resolution and CSS size is crucial:

```html
<canvas 
    id="game" 
    width="800" 
    height="600" 
    style="width: 400px; height: 300px;">
</canvas>
```

**What's happening here?**

- `width="800"` and `height="600"` set the **internal resolution** (800×600 pixels)
- `style="width: 400px; height: 300px"` sets the **display size** (400×300 CSS pixels)
- The 800×600 image is *scaled* to fit 400×300, potentially causing blur

**Visual Representation:**

```
Internal Canvas (800×600):
┌────────────────────────────────┐
│                                │
│  [Pixel-perfect graphics]      │
│                                │
│                                │
│                                │
└────────────────────────────────┘

CSS Display (400×300):
┌──────────────┐
│  [Scaled]    │  ← Image is shrunk, possibly blurry
│              │
└──────────────┘
```

**Best Practice for Games:**

Match internal resolution to CSS size for pixel-perfect graphics:

```javascript
const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
canvas.width = 800;
canvas.height = 600;
canvas.style.width = '800px';
canvas.style.height = '600px';
```

### Getting Canvas Reference in TypeScript

```typescript
// Method 1: Type assertion
const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;

// Method 2: Type check
const element = document.getElementById('gameCanvas');
if (element instanceof HTMLCanvasElement) {
    const canvas = element;
    // Use canvas here
}

// Method 3: Non-null assertion (use carefully!)
const canvas = document.getElementById('gameCanvas')!;
```

**Why TypeScript?**
- Catches errors at compile time
- Provides autocomplete for Canvas API
- Makes refactoring safer
- Documents types for other developers

### Dynamic Canvas Creation

Sometimes you want to create the canvas programmatically:

```typescript
function createGameCanvas(width: number, height: number): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    canvas.id = 'gameCanvas';
    
    // Style it
    canvas.style.border = '2px solid #333';
    canvas.style.display = 'block';
    canvas.style.margin = '0 auto';
    
    // Add to page
    document.body.appendChild(canvas);
    
    return canvas;
}

const canvas = createGameCanvas(800, 600);
```

**When to use this:**
- Building a reusable game engine
- Need multiple canvases (minimap, inventory, etc.)
- Want full control over canvas creation

### Canvas Accessibility

Canvas content is not accessible by default. Add fallback content:

```html
<canvas id="gameCanvas" width="800" height="600">
    <p>Your browser does not support HTML5 Canvas.</p>
    <p>Please upgrade to a modern browser to play this game.</p>
</canvas>
```

For screen readers, add ARIA attributes:

```html
<canvas 
    id="gameCanvas" 
    width="800" 
    height="600"
    role="img"
    aria-label="Mario-like platformer game">
</canvas>
```

---

## The 2D Rendering Context

### What is the Rendering Context?

The canvas element itself doesn't draw anything. You need a **rendering context** — an object that provides drawing methods.

```typescript
const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
const ctx = canvas.getContext('2d');

if (!ctx) {
    throw new Error('Unable to get 2D context');
}

// Now you can draw!
ctx.fillStyle = 'red';
ctx.fillRect(10, 10, 50, 50);
```

### Context Types

Canvas supports multiple context types:

| Context | Purpose | Use Case |
|---------|---------|----------|
| `'2d'` | 2D graphics | Platformers, top-down games |
| `'webgl'` | 3D graphics (OpenGL ES) | 3D games, complex effects |
| `'webgl2'` | Advanced 3D | Modern 3D games |
| `'bitmaprenderer'` | ImageBitmap rendering | Specialized use cases |

**For this curriculum, we use `'2d'`** — perfect for Mario-like games!

### Context Configuration

You can pass options when getting the context:

```typescript
const ctx = canvas.getContext('2d', {
    alpha: false,              // Opaque background (slight performance boost)
    desynchronized: true,      // Lower latency (experimental)
    willReadFrequently: false  // Optimize for writing, not reading
});
```

**Options Explained:**

- **alpha**: Set to `false` if you don't need transparency. Saves memory.
- **desynchronized**: Allows rendering to happen out of sync with display refresh. Can reduce input lag.
- **willReadFrequently**: Set to `true` if you'll call `getImageData()` often (e.g., for pixel-perfect collision). Slower for drawing.

**For most games:**
```typescript
const ctx = canvas.getContext('2d', { alpha: false });
```

### Coordinate System

Canvas uses a **top-left origin** coordinate system:

```
(0,0) ────────────────> X+
  │
  │
  │
  │
  │
  ▼
  Y+
```

**Key Concepts:**

- Origin (0, 0) is the **top-left corner**
- X increases to the **right**
- Y increases **downward** (opposite of math class!)
- Units are **pixels**

**Example Positions:**

```
Canvas (800×600):

(0, 0)                    (800, 0)
  ┌───────────────────────┐
  │                       │
  │                       │
  │      (400, 300)       │  ← Center
  │                       │
  │                       │
  └───────────────────────┘
(0, 600)                (800, 600)
```

**Why Y-down?**
This matches how screens render (top to bottom), making it natural for UI and games.

---

## Drawing Basic Shapes

### Rectangles

Rectangles are the simplest and fastest shapes to draw.

#### Filled Rectangles

```typescript
ctx.fillStyle = 'blue';
ctx.fillRect(x, y, width, height);
```

**Parameters:**
- `x`: Left edge position
- `y`: Top edge position
- `width`: Rectangle width
- `height`: Rectangle height

**Example:**

```typescript
// Draw a blue square at (100, 100) with size 50×50
ctx.fillStyle = 'blue';
ctx.fillRect(100, 100, 50, 50);
```

**Visual Result:**

```
        100px
         ↓
    ┌────┬────┐
    │    │    │
100px    50px →
    │    │    │
    └────┴────┘
      50px
```

#### Stroked Rectangles

```typescript
ctx.strokeStyle = 'green';
ctx.lineWidth = 3;
ctx.strokeRect(x, y, width, height);
```

This draws an **outline** instead of a filled shape.

**Example:**

```typescript
ctx.strokeStyle = 'red';
ctx.lineWidth = 2;
ctx.strokeRect(200, 100, 100, 80);
```

#### Clear Rectangles

```typescript
ctx.clearRect(x, y, width, height);
```

This **erases** pixels in a rectangular area (makes them transparent).

**Use Case: Clearing the Screen**

```typescript
function clearScreen() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}
```

### Paths

Paths are sequences of points connected by lines or curves. They're more flexible than rectangles.

#### Basic Path Drawing

```typescript
ctx.beginPath();          // Start a new path
ctx.moveTo(x1, y1);       // Move to starting point (no line drawn)
ctx.lineTo(x2, y2);       // Draw line to this point
ctx.lineTo(x3, y3);       // Draw another line
ctx.closePath();          // Connect back to start (optional)
ctx.stroke();             // Draw the path outline
// OR
ctx.fill();               // Fill the path
```

**Example: Triangle**

```typescript
ctx.beginPath();
ctx.moveTo(100, 50);      // Top point
ctx.lineTo(50, 150);      // Bottom-left
ctx.lineTo(150, 150);     // Bottom-right
ctx.closePath();          // Back to top
ctx.fillStyle = 'purple';
ctx.fill();
```

**Visual:**

```
    (100, 50)
       /\
      /  \
     /    \
    /______\
(50,150) (150,150)
```

### Circles and Arcs

Circles are drawn using the `arc()` method:

```typescript
ctx.arc(x, y, radius, startAngle, endAngle, counterclockwise);
```

**Parameters:**
- `x`, `y`: Center of circle
- `radius`: Circle radius
- `startAngle`: Starting angle in **radians**
- `endAngle`: Ending angle in **radians**
- `counterclockwise`: Optional, default `false`

**Remember: Angles are in radians!**
- Full circle: 0 to `2 * Math.PI`
- Half circle: 0 to `Math.PI`
- Quarter circle: 0 to `Math.PI / 2`

**Example: Full Circle**

```typescript
ctx.beginPath();
ctx.arc(200, 200, 50, 0, Math.PI * 2);
ctx.fillStyle = 'orange';
ctx.fill();
```

**Example: Pac-Man Shape**

```typescript
ctx.beginPath();
ctx.arc(300, 200, 50, 0.2 * Math.PI, 1.8 * Math.PI);
ctx.lineTo(300, 200);  // Line to center
ctx.closePath();
ctx.fillStyle = 'yellow';
ctx.fill();
```

**Visual:**

```
   0° (right)
      │
270°──┼──90°
      │
    180°

Pac-Man uses:
  Start: 0.2π (36°)
  End: 1.8π (324°)
```

### Lines

Drawing individual lines:

```typescript
ctx.beginPath();
ctx.moveTo(x1, y1);
ctx.lineTo(x2, y2);
ctx.strokeStyle = 'black';
ctx.lineWidth = 2;
ctx.stroke();
```

**Line Cap Styles:**

```typescript
ctx.lineCap = 'butt';    // Default: flat ends
ctx.lineCap = 'round';   // Rounded ends
ctx.lineCap = 'square';  // Square ends (extends beyond endpoint)
```

**Line Join Styles:**

```typescript
ctx.lineJoin = 'miter';  // Pointed corners (default)
ctx.lineJoin = 'round';  // Rounded corners
ctx.lineJoin = 'bevel';  // Flat corners
```

**Example: Drawing a Grid**

```typescript
function drawGrid(width: number, height: number, cellSize: number) {
    ctx.strokeStyle = '#ddd';
    ctx.lineWidth = 1;
    
    // Vertical lines
    for (let x = 0; x <= width; x += cellSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
    }
    
    // Horizontal lines
    for (let y = 0; y <= height; y += cellSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
    }
}

drawGrid(800, 600, 50);  // 50px grid cells
```

---

## Colors and Styles

### Color Formats

Canvas supports multiple color formats:

```typescript
// Named colors
ctx.fillStyle = 'red';
ctx.fillStyle = 'cornflowerblue';

// Hex colors
ctx.fillStyle = '#FF0000';      // Red
ctx.fillStyle = '#00FF00';      // Green
ctx.fillStyle = '#0000FF';      // Blue

// RGB
ctx.fillStyle = 'rgb(255, 0, 0)';           // Red
ctx.fillStyle = 'rgb(100, 200, 50)';        // Custom green

// RGBA (with alpha transparency)
ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';     // 50% transparent red
ctx.fillStyle = 'rgba(0, 0, 255, 0.2)';     // 20% opaque blue

// HSL (Hue, Saturation, Lightness)
ctx.fillStyle = 'hsl(0, 100%, 50%)';        // Red
ctx.fillStyle = 'hsl(120, 100%, 50%)';      // Green
ctx.fillStyle = 'hsl(240, 100%, 50%)';      // Blue

// HSLA (with alpha)
ctx.fillStyle = 'hsla(0, 100%, 50%, 0.5)';  // Semi-transparent red
```

**Recommendation:** Use hex for static colors, RGBA for transparency, HSL for programmatic color manipulation.

### Gradients

Gradients create smooth color transitions.

#### Linear Gradients

```typescript
const gradient = ctx.createLinearGradient(x0, y0, x1, y1);
gradient.addColorStop(0, 'blue');      // Start color
gradient.addColorStop(0.5, 'green');   // Middle color
gradient.addColorStop(1, 'red');       // End color

ctx.fillStyle = gradient;
ctx.fillRect(0, 0, 200, 200);
```

**Parameters:**
- `(x0, y0)`: Starting point of gradient
- `(x1, y1)`: Ending point of gradient
- Color stops: Position (0 to 1) and color

**Example: Vertical Gradient (Sky)**

```typescript
const skyGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
skyGradient.addColorStop(0, '#87CEEB');    // Sky blue at top
skyGradient.addColorStop(1, '#ffffff');    // White at bottom

ctx.fillStyle = skyGradient;
ctx.fillRect(0, 0, canvas.width, canvas.height);
```

**Example: Horizontal Gradient**

```typescript
const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
gradient.addColorStop(0, 'red');
gradient.addColorStop(1, 'blue');

ctx.fillStyle = gradient;
ctx.fillRect(0, 0, canvas.width, canvas.height);
```

#### Radial Gradients

```typescript
const gradient = ctx.createRadialGradient(x0, y0, r0, x1, y1, r1);
gradient.addColorStop(0, 'yellow');
gradient.addColorStop(1, 'red');

ctx.fillStyle = gradient;
ctx.fillRect(0, 0, 400, 400);
```

**Parameters:**
- `(x0, y0, r0)`: Inner circle (center and radius)
- `(x1, y1, r1)`: Outer circle (center and radius)

**Example: Radial Glow Effect**

```typescript
const gradient = ctx.createRadialGradient(200, 200, 10, 200, 200, 100);
gradient.addColorStop(0, 'white');          // Bright center
gradient.addColorStop(0.5, 'yellow');       // Middle glow
gradient.addColorStop(1, 'rgba(255,0,0,0)'); // Fade to transparent

ctx.fillStyle = gradient;
ctx.fillRect(0, 0, 400, 400);
```

### Patterns

Patterns repeat an image or another canvas:

```typescript
const img = new Image();
img.src = 'tile.png';
img.onload = () => {
    const pattern = ctx.createPattern(img, 'repeat');
    if (pattern) {
        ctx.fillStyle = pattern;
        ctx.fillRect(0, 0, 400, 400);
    }
};
```

**Repeat Options:**
- `'repeat'`: Tile in both directions (default)
- `'repeat-x'`: Tile horizontally only
- `'repeat-y'`: Tile vertically only
- `'no-repeat'`: Show once, no tiling

**Use Case: Tile Backgrounds**

```typescript
function createTilePattern(tileSize: number): CanvasPattern | null {
    // Create an offscreen canvas for the tile
    const tileCanvas = document.createElement('canvas');
    tileCanvas.width = tileSize;
    tileCanvas.height = tileSize;
    const tileCtx = tileCanvas.getContext('2d')!;
    
    // Draw tile pattern
    tileCtx.fillStyle = '#8B4513';
    tileCtx.fillRect(0, 0, tileSize, tileSize);
    tileCtx.strokeStyle = '#654321';
    tileCtx.strokeRect(0, 0, tileSize, tileSize);
    
    // Create pattern from tile
    return ctx.createPattern(tileCanvas, 'repeat');
}

const pattern = createTilePattern(32);
if (pattern) {
    ctx.fillStyle = pattern;
    ctx.fillRect(0, 400, 800, 200);  // Ground layer
}
```

### Shadows

Add shadows to any drawn element:

```typescript
ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';  // Shadow color
ctx.shadowBlur = 10;                     // Blur amount
ctx.shadowOffsetX = 5;                   // Horizontal offset
ctx.shadowOffsetY = 5;                   // Vertical offset

ctx.fillStyle = 'red';
ctx.fillRect(100, 100, 100, 100);

// Reset shadow to avoid affecting other draws
ctx.shadowColor = 'transparent';
ctx.shadowBlur = 0;
ctx.shadowOffsetX = 0;
ctx.shadowOffsetY = 0;
```

**Performance Warning:** Shadows are expensive! Use sparingly, mainly for UI elements, not game objects.

---

## Transformations

Transformations modify the coordinate system before drawing.

### Translate (Move Origin)

```typescript
ctx.translate(dx, dy);
```

Moves the origin (0, 0) to a new position.

**Example:**

```typescript
// Draw at (0, 0) - actually draws at (100, 100)
ctx.translate(100, 100);
ctx.fillRect(0, 0, 50, 50);
```

**Why Use Translate?**
- Easier to center objects
- Simplifies rotation around a point
- Useful for camera systems (covered in Unit 04)

### Rotate

```typescript
ctx.rotate(angle);  // Angle in radians
```

Rotates the coordinate system around the origin.

**Example: Rotating a Square**

```typescript
ctx.save();  // Save current state

ctx.translate(200, 200);           // Move origin to rotation center
ctx.rotate(Math.PI / 4);           // Rotate 45 degrees
ctx.fillStyle = 'blue';
ctx.fillRect(-25, -25, 50, 50);    // Draw centered on origin

ctx.restore();  // Restore original state
```

**Why `-25, -25`?**
To center the square on the rotation point, we offset by half the size.

**Visual:**

```
Before rotation:
       origin (200, 200)
          ┌───┐
          │   │
          └───┘

After 45° rotation:
       origin (200, 200)
          ╱─╲
         ╱   ╲
         ╲   ╱
          ╲─╱
```

### Scale

```typescript
ctx.scale(sx, sy);
```

Scales the coordinate system.

**Example: Double Size**

```typescript
ctx.scale(2, 2);
ctx.fillRect(50, 50, 50, 50);  // Actually draws 100×100 at (100, 100)
```

**Example: Flip Horizontally**

```typescript
ctx.save();
ctx.translate(canvas.width, 0);  // Move to right edge
ctx.scale(-1, 1);                // Flip X-axis
// Now drawing happens mirrored
ctx.restore();
```

### Combining Transformations

```typescript
ctx.save();
ctx.translate(400, 300);    // Center of canvas
ctx.rotate(angle);          // Rotate
ctx.scale(2, 2);            // Scale up
ctx.fillRect(-25, -25, 50, 50);  // Draw centered, rotated, and scaled
ctx.restore();
```

**Order Matters!**

```typescript
// Method A: Translate then rotate
ctx.translate(200, 200);
ctx.rotate(Math.PI / 4);
ctx.fillRect(0, 0, 50, 50);

// Method B: Rotate then translate (DIFFERENT RESULT!)
ctx.rotate(Math.PI / 4);
ctx.translate(200, 200);
ctx.fillRect(0, 0, 50, 50);
```

**General Rule:** Apply transformations in this order:
1. **Translate** to position
2. **Rotate** around that position
3. **Scale** if needed
4. **Draw** relative to origin

### Save and Restore

Always use `save()` and `restore()` to avoid transformation accumulation:

```typescript
ctx.save();       // Push current state onto stack
// Apply transformations
// Draw stuff
ctx.restore();    // Pop state from stack
```

**Why This Matters:**

```typescript
// BAD: Transformations accumulate
ctx.rotate(0.1);
ctx.fillRect(100, 100, 50, 50);
ctx.rotate(0.1);  // Now rotated 0.2 radians total!
ctx.fillRect(200, 100, 50, 50);

// GOOD: Each object has independent transform
ctx.save();
ctx.rotate(0.1);
ctx.fillRect(100, 100, 50, 50);
ctx.restore();

ctx.save();
ctx.rotate(0.1);
ctx.fillRect(200, 100, 50, 50);
ctx.restore();
```

---

## Images and Sprites

### Loading Images

```typescript
const img = new Image();
img.src = 'player.png';

img.onload = () => {
    console.log('Image loaded successfully!');
    // Now it's safe to draw
    ctx.drawImage(img, 0, 0);
};

img.onerror = () => {
    console.error('Failed to load image');
};
```

**Critical: Wait for Image Load**

Images load asynchronously. Drawing before `onload` results in nothing rendered.

### Drawing Images

**Basic Draw:**

```typescript
ctx.drawImage(img, x, y);
```

**With Size:**

```typescript
ctx.drawImage(img, x, y, width, height);
```

**From Sprite Sheet (Source Rectangle):**

```typescript
ctx.drawImage(
    img,
    sx, sy, sw, sh,      // Source: x, y, width, height in sprite sheet
    dx, dy, dw, dh       // Destination: x, y, width, height on canvas
);
```

**Example: Drawing a Character from Sprite Sheet**

```typescript
// Sprite sheet has 8 frames in a row, each 32×32 pixels
const frameWidth = 32;
const frameHeight = 32;
const frameIndex = 3;  // 4th frame (0-indexed)

ctx.drawImage(
    spriteSheet,
    frameIndex * frameWidth, 0,     // Source: x=96, y=0
    frameWidth, frameHeight,        // Source size: 32×32
    100, 100,                       // Draw at (100, 100)
    64, 64                          // Scale to 64×64
);
```

**Visual:**

```
Sprite Sheet (256×32):
┌────┬────┬────┬────┬────┬────┬────┬────┐
│ 0  │ 1  │ 2  │ 3  │ 4  │ 5  │ 6  │ 7  │  ← Frame indices
└────┴────┴────┴────┴────┴────┴────┴────┘
 32px each frame

Extract frame 3:
       frameIndex × frameWidth
              ↓
              ┌────┐
              │ 3  │  ← This frame
              └────┘
```

### Image Preloading Pattern

For games, preload all images before starting:

```typescript
class ImageLoader {
    private images: Map<string, HTMLImageElement> = new Map();
    private loadedCount = 0;
    private totalCount = 0;
    
    async load(name: string, src: string): Promise<void> {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                this.images.set(name, img);
                this.loadedCount++;
                resolve();
            };
            img.onerror = () => reject(new Error(`Failed to load ${src}`));
            img.src = src;
            this.totalCount++;
        });
    }
    
    async loadAll(sources: { name: string; src: string }[]): Promise<void> {
        await Promise.all(sources.map(s => this.load(s.name, s.src)));
    }
    
    get(name: string): HTMLImageElement | undefined {
        return this.images.get(name);
    }
    
    getProgress(): number {
        return this.totalCount === 0 ? 1 : this.loadedCount / this.totalCount;
    }
}

// Usage
const loader = new ImageLoader();
await loader.loadAll([
    { name: 'player', src: 'assets/player.png' },
    { name: 'enemy', src: 'assets/enemy.png' },
    { name: 'tiles', src: 'assets/tiles.png' }
]);

const playerImg = loader.get('player')!;
ctx.drawImage(playerImg, 100, 100);
```

### Image Smoothing

Control whether images are smoothed (anti-aliased) when scaled:

```typescript
ctx.imageSmoothingEnabled = false;  // Pixel-perfect (retro games)
ctx.imageSmoothingEnabled = true;   // Smooth scaling (default)
```

**For Pixel Art Games:** Always set to `false` for crisp pixels!

```typescript
// Disable smoothing for crisp pixel art
ctx.imageSmoothingEnabled = false;
ctx.drawImage(pixelArtSprite, 0, 0, 32, 32, 100, 100, 128, 128);
```

---

## Text Rendering

### Basic Text Drawing

```typescript
ctx.font = '24px Arial';
ctx.fillStyle = 'black';
ctx.fillText('Hello, World!', 100, 100);
```

**Font Syntax:**

```typescript
ctx.font = '[style] [weight] [size] [family]';

// Examples:
ctx.font = '24px Arial';
ctx.font = 'bold 32px Courier';
ctx.font = 'italic 20px Georgia';
ctx.font = 'bold italic 28px "Times New Roman"';
```

### Text Alignment

```typescript
ctx.textAlign = 'left';     // Default
ctx.textAlign = 'center';   // Center on x coordinate
ctx.textAlign = 'right';    // Right-align on x coordinate
ctx.textAlign = 'start';    // Like left (RTL aware)
ctx.textAlign = 'end';      // Like right (RTL aware)
```

**Example: Centering Text**

```typescript
ctx.textAlign = 'center';
ctx.font = '48px Arial';
ctx.fillText('Game Over', canvas.width / 2, canvas.height / 2);
```

### Text Baseline

```typescript
ctx.textBaseline = 'top';        // y is top of text
ctx.textBaseline = 'middle';     // y is vertical center
ctx.textBaseline = 'bottom';     // y is bottom of text
ctx.textBaseline = 'alphabetic'; // Default, baseline
```

**Visual:**

```
      ← top
    ──────────
      ← hanging
    Ag ← middle
    ──────────
      ← alphabetic (baseline)
    ──────────
      ← bottom
```

### Outlined Text

```typescript
ctx.strokeStyle = 'black';
ctx.lineWidth = 3;
ctx.strokeText('Outlined!', 100, 100);

ctx.fillStyle = 'white';
ctx.fillText('Outlined!', 100, 100);  // Same position
```

This creates text with an outline — common in games for readability.

### Measuring Text

```typescript
const metrics = ctx.measureText('Score: 12345');
console.log(metrics.width);  // Width in pixels
```

**Use Case: Dynamic UI Positioning**

```typescript
function drawCenteredText(text: string, y: number) {
    const metrics = ctx.measureText(text);
    const x = (canvas.width - metrics.width) / 2;
    ctx.fillText(text, x, y);
}

drawCenteredText('Level 1-1', 50);
```

### Custom Fonts

Load web fonts before drawing:

```typescript
// In HTML head
<link href="https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap" rel="stylesheet">

// In CSS
<style>
@font-face {
    font-family: 'PressStart2P';
    src: url('fonts/PressStart2P.ttf') format('truetype');
}
</style>

// In JavaScript
await document.fonts.ready;  // Wait for fonts to load
ctx.font = '16px "Press Start 2P"';
ctx.fillText('Retro Text!', 100, 100);
```

---

## Clearing and Compositing

### Clearing the Canvas

**Method 1: clearRect (Fastest)**

```typescript
ctx.clearRect(0, 0, canvas.width, canvas.height);
```

**Method 2: Overdraw with Background Color**

```typescript
ctx.fillStyle = '#87CEEB';  // Sky blue
ctx.fillRect(0, 0, canvas.width, canvas.height);
```

**Method 3: Canvas Width Reset (Clears All State)**

```typescript
canvas.width = canvas.width;  // Resets everything
```

⚠️ **Warning:** Method 3 also resets all context state (styles, transforms, etc.).

### Global Alpha

Control transparency of all drawing operations:

```typescript
ctx.globalAlpha = 0.5;  // 50% transparent
ctx.fillRect(100, 100, 200, 200);

ctx.globalAlpha = 1.0;  // Back to opaque
```

### Composite Operations

Control how new drawings blend with existing content:

```typescript
ctx.globalCompositeOperation = 'source-over';  // Default
```

**Common Operations:**

| Operation | Effect |
|-----------|--------|
| `source-over` | New content drawn over existing (default) |
| `source-in` | New content only where it overlaps existing |
| `source-out` | New content only where it doesn't overlap |
| `source-atop` | New content behind existing, only where existing exists |
| `destination-over` | New content behind existing |
| `destination-in` | Keep existing only where new content overlaps |
| `destination-out` | Erase existing where new content overlaps |
| `lighter` | Add color values (brightening effect) |
| `multiply` | Multiply color values (darkening effect) |
| `screen` | Invert, multiply, invert again (lightening) |

**Example: Spotlight Effect**

```typescript
// Draw game content
ctx.fillStyle = 'green';
ctx.fillRect(0, 0, 800, 600);

// Create spotlight
ctx.globalCompositeOperation = 'destination-in';
const gradient = ctx.createRadialGradient(400, 300, 0, 400, 300, 200);
gradient.addColorStop(0, 'rgba(255,255,255,1)');
gradient.addColorStop(1, 'rgba(255,255,255,0)');
ctx.fillStyle = gradient;
ctx.fillRect(0, 0, 800, 600);

// Reset
ctx.globalCompositeOperation = 'source-over';
```

---

## Performance Considerations

### What's Fast, What's Slow

**Fast Operations:**
- `fillRect()` — Fastest shape
- `drawImage()` — Very fast
- Solid colors
- Simple transforms

**Slow Operations:**
- `arc()` — Creating circles
- Complex paths with many points
- Shadows
- Gradients (moderate)
- Reading pixels (`getImageData()`)

### Optimization Techniques

#### 1. Batch Drawing

```typescript
// BAD: Setting style for each rectangle
for (let i = 0; i < 100; i++) {
    ctx.fillStyle = 'red';
    ctx.fillRect(i * 10, 0, 8, 8);
}

// GOOD: Set style once
ctx.fillStyle = 'red';
for (let i = 0; i < 100; i++) {
    ctx.fillRect(i * 10, 0, 8, 8);
}
```

**Performance Gain:** ~50% faster

#### 2. Use Integers for Positions

```typescript
// SLOW: Subpixel rendering
ctx.fillRect(100.7, 200.3, 50, 50);

// FAST: Integer positions
ctx.fillRect(Math.round(100.7), Math.round(200.3), 50, 50);
```

Subpixel positions trigger anti-aliasing, which is slower.

#### 3. Minimize State Changes

```typescript
// BAD: Frequent style changes
ctx.fillStyle = 'red';
ctx.fillRect(0, 0, 10, 10);
ctx.fillStyle = 'blue';
ctx.fillRect(20, 0, 10, 10);
ctx.fillStyle = 'red';
ctx.fillRect(40, 0, 10, 10);

// GOOD: Group by style
ctx.fillStyle = 'red';
ctx.fillRect(0, 0, 10, 10);
ctx.fillRect(40, 0, 10, 10);
ctx.fillStyle = 'blue';
ctx.fillRect(20, 0, 10, 10);
```

#### 4. Offscreen Canvases for Static Content

```typescript
// Create offscreen canvas for background
const bgCanvas = document.createElement('canvas');
bgCanvas.width = 800;
bgCanvas.height = 600;
const bgCtx = bgCanvas.getContext('2d')!;

// Draw complex background once
bgCtx.fillStyle = '#87CEEB';
bgCtx.fillRect(0, 0, 800, 600);
// ... more complex drawing ...

// In game loop, just copy the cached background
ctx.drawImage(bgCanvas, 0, 0);
```

**Performance Gain:** Massive! Complex backgrounds are pre-rendered.

#### 5. Limit Canvas Size

Larger canvases are slower to clear and draw on.

```typescript
// SLOW: Huge canvas
canvas.width = 3840;
canvas.height = 2160;

// FAST: Reasonable size, scale with CSS if needed
canvas.width = 800;
canvas.height = 600;
canvas.style.width = '1600px';   // Scale with CSS
canvas.style.height = '1200px';
```

### Measuring Performance

```typescript
function measureDrawTime(drawFunction: () => void): number {
    const start = performance.now();
    drawFunction();
    const end = performance.now();
    return end - start;
}

const time = measureDrawTime(() => {
    for (let i = 0; i < 1000; i++) {
        ctx.fillRect(Math.random() * 800, Math.random() * 600, 10, 10);
    }
});

console.log(`Drew 1000 rectangles in ${time.toFixed(2)}ms`);
```

**Target:** Each frame should take < 16ms (for 60 FPS).

---

## Application to Mario Game

### Drawing a Simple Mario-like Scene

Let's apply everything we've learned to create a basic Mario-like scene:

```typescript
const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
const ctx = canvas.getContext('2d', { alpha: false })!;

canvas.width = 800;
canvas.height = 600;

function drawScene() {
    // Sky gradient
    const skyGradient = ctx.createLinearGradient(0, 0, 0, 400);
    skyGradient.addColorStop(0, '#87CEEB');  // Sky blue
    skyGradient.addColorStop(1, '#E0F6FF');  // Light blue
    ctx.fillStyle = skyGradient;
    ctx.fillRect(0, 0, 800, 400);
    
    // Ground
    ctx.fillStyle = '#8B4513';  // Brown
    ctx.fillRect(0, 400, 800, 200);
    
    // Ground texture (simple grid)
    ctx.strokeStyle = '#654321';
    ctx.lineWidth = 1;
    for (let x = 0; x < 800; x += 32) {
        for (let y = 400; y < 600; y += 32) {
            ctx.strokeRect(x, y, 32, 32);
        }
    }
    
    // Sun
    ctx.fillStyle = 'yellow';
    ctx.beginPath();
    ctx.arc(700, 80, 40, 0, Math.PI * 2);
    ctx.fill();
    
    // Cloud
    drawCloud(150, 100);
    drawCloud(500, 80);
    
    // Platform (brick block)
    ctx.fillStyle = '#CD853F';
    ctx.fillRect(300, 250, 64, 32);
    ctx.strokeStyle = '#8B4513';
    ctx.lineWidth = 2;
    ctx.strokeRect(300, 250, 64, 32);
    
    // Player (simple red square for now)
    ctx.fillStyle = 'red';
    ctx.fillRect(100, 350, 32, 48);  // 32×48 player
    
    // Coin
    ctx.fillStyle = 'gold';
    ctx.beginPath();
    ctx.arc(350, 200, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#B8860B';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // UI: Score
    ctx.fillStyle = 'white';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('Score: 0', 20, 40);
}

function drawCloud(x: number, y: number) {
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(x, y, 20, 0, Math.PI * 2);
    ctx.arc(x + 20, y, 25, 0, Math.PI * 2);
    ctx.arc(x + 40, y, 20, 0, Math.PI * 2);
    ctx.fill();
}

drawScene();
```

**What This Creates:**
- Blue sky gradient
- Brown ground with grid pattern
- Yellow sun
- Two white clouds
- Brick platform
- Red player character
- Gold coin
- Score display

This is your first game scene! In the next topics, we'll make it interactive.

---

## Summary

### What You've Learned

✅ **Canvas Basics**
- Creating and configuring the canvas element
- Getting the 2D rendering context
- Understanding the coordinate system

✅ **Drawing Shapes**
- Rectangles (filled, stroked, cleared)
- Paths (lines, triangles, custom shapes)
- Circles and arcs

✅ **Styling**
- Colors (named, hex, RGB, HSL)
- Gradients (linear, radial)
- Patterns
- Shadows

✅ **Transformations**
- Translate, rotate, scale
- Save and restore state
- Combining transformations

✅ **Images**
- Loading images asynchronously
- Drawing images at different positions and sizes
- Extracting frames from sprite sheets
- Image smoothing control

✅ **Text**
- Drawing text
- Styling fonts
- Alignment and baseline
- Measuring text width

✅ **Performance**
- Fast vs slow operations
- Optimization techniques
- Offscreen canvases
- Performance measurement

✅ **Mario Application**
- Created a basic game scene
- Drew sky, ground, platforms, player, and UI

### Key Takeaways

1. **Canvas is a Drawing Surface**: You draw on it using the 2D rendering context.

2. **Coordinate System**: (0, 0) is top-left, X+ right, Y+ down.

3. **State Machine**: Canvas context maintains state (colors, transforms, etc.). Use `save()` and `restore()`.

4. **Async Image Loading**: Always wait for `onload` before drawing images.

5. **Performance Matters**: Batch operations, minimize state changes, use integers.

6. **Transformations Stack**: Save before transform, restore after.

---

## Next Steps

### Immediate Practice

1. Complete the exercises in `b-exercises.md`
2. Experiment with the code examples
3. Try modifying colors, sizes, and positions
4. Create your own simple scene

### Next Lesson

**Unit 01, Topic 02: Game Loop and Timing**

You've learned to draw static scenes. Next, we'll make things move by implementing a game loop — the heartbeat of every game.

**Preview:**
- What is a game loop?
- `requestAnimationFrame()`
- Delta time and frame independence
- Fixed timestep vs variable timestep
- FPS counting and display

### Challenge

Before moving on, try to build this scene without looking at the code:

**Requirements:**
- Blue sky
- Brown ground (bottom 1/3 of canvas)
- Yellow sun (top-right)
- White cloud
- Red player character (32×48 pixels)
- Green platform (128×32 pixels, centered)
- Score text ("Score: 0" at top-left)

**Bonus:**
- Add a gradient sky
- Draw multiple platforms
- Add coins
- Create a grid pattern on the ground

---

## Looking Ahead to Unit 02: Physics & Movement

Everything you've learned about rendering will come to life when we add physics in Unit 02!

**What You'll Use This For:**

🎯 **Particle Systems** (Unit 02, Topic 06)
- You'll draw hundreds of small particles for effects
- Dust clouds when landing, sparkles when collecting coins
- All using `fillRect()` and `arc()` you just learned!

```typescript
// Preview of what's coming:
particles.forEach(p => {
    ctx.fillStyle = p.color;
    ctx.fillRect(p.x, p.y, 4, 4); // Tiny particle
});
```

🎯 **Debug Visualization** (Unit 02, Topics 03-04)
- You'll draw collision boxes to debug physics
- Use `strokeRect()` to see hitboxes
- Visualize velocity vectors with lines

```typescript
// You'll draw collision boxes like this:
ctx.strokeStyle = 'lime';
ctx.lineWidth = 2;
ctx.strokeRect(player.x, player.y, player.width, player.height);
```

🎯 **Sprite-Based Characters** (Unit 03)
- Everything you learned about `drawImage()` prepares you for animated sprites
- You'll draw character frames that move based on velocity

**The Big Picture:**
Right now, you can draw a **static Mario standing on a platform**. By the end of Unit 02, you'll have a **Mario that moves, jumps, and collides with platforms** — and you'll see him smoothly animated using these same canvas drawing techniques!

---

## Further Reading

**MDN Canvas Tutorial:**
https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial

**Canvas Performance Tips:**
https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Optimizing_canvas

**HTML5 Canvas Handbook:**
https://www.html5canvastutorials.com/

---

**You've completed Topic 01!** 🎉

You can now render shapes, images, and text on the canvas — the foundation of all 2D game graphics. The next topic will bring your drawings to life with animation and interactivity.

**Time to practice:** Head to `b-exercises.md` and put your new skills to the test!
