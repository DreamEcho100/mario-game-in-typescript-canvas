# Canvas Rendering Basics - Quick Reference

**Unit 01: Game Foundations | Topic 01 | Cheat Sheet**

> **Purpose:** Fast lookup for Canvas API methods, formulas, patterns, and common values.

---

## 📐 Canvas Setup

### Creating Canvas

```typescript
// HTML
<canvas id="gameCanvas" width="800" height="600"></canvas>

// TypeScript
const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
const ctx = canvas.getContext('2d')!;

// With options
const ctx = canvas.getContext('2d', {
    alpha: false,              // Opaque background
    desynchronized: true,      // Lower latency
    willReadFrequently: false  // Optimize for writing
});
```

### Canvas Dimensions

```typescript
// Set internal resolution
canvas.width = 800;
canvas.height = 600;

// Set CSS display size
canvas.style.width = '800px';
canvas.style.height = '600px';

// For pixel-perfect, match both
```

---

## 🎨 Drawing Shapes

### Rectangles

```typescript
// Filled rectangle
ctx.fillStyle = 'red';
ctx.fillRect(x, y, width, height);

// Stroked rectangle (outline)
ctx.strokeStyle = 'blue';
ctx.lineWidth = 2;
ctx.strokeRect(x, y, width, height);

// Clear rectangle (erase)
ctx.clearRect(x, y, width, height);

// Clear entire canvas
ctx.clearRect(0, 0, canvas.width, canvas.height);
```

### Circles

```typescript
ctx.beginPath();
ctx.arc(x, y, radius, 0, Math.PI * 2);
ctx.fillStyle = 'yellow';
ctx.fill();

// Or just stroke (outline)
ctx.strokeStyle = 'black';
ctx.lineWidth = 2;
ctx.stroke();
```

**Angles in Radians:**
```
0°   = 0
45°  = Math.PI / 4
90°  = Math.PI / 2
180° = Math.PI
270° = 3 * Math.PI / 2
360° = Math.PI * 2

Full circle: 0 to Math.PI * 2
```

### Lines

```typescript
ctx.beginPath();
ctx.moveTo(x1, y1);  // Start point
ctx.lineTo(x2, y2);  // End point
ctx.strokeStyle = 'black';
ctx.lineWidth = 2;
ctx.stroke();
```

### Complex Paths

```typescript
ctx.beginPath();
ctx.moveTo(100, 50);   // Start
ctx.lineTo(150, 100);  // Line to
ctx.lineTo(50, 100);   // Line to
ctx.closePath();       // Close path
ctx.fillStyle = 'green';
ctx.fill();
```

---

## 🌈 Colors

### Color Formats

```typescript
// Named colors
ctx.fillStyle = 'red';
ctx.fillStyle = 'cornflowerblue';

// Hex
ctx.fillStyle = '#FF0000';      // Red
ctx.fillStyle = '#00FF00';      // Green
ctx.fillStyle = '#0000FF';      // Blue

// RGB
ctx.fillStyle = 'rgb(255, 0, 0)';

// RGBA (with transparency)
ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';  // 50% transparent

// HSL
ctx.fillStyle = 'hsl(0, 100%, 50%)';     // Red
ctx.fillStyle = 'hsl(120, 100%, 50%)';   // Green
ctx.fillStyle = 'hsl(240, 100%, 50%)';   // Blue

// HSLA
ctx.fillStyle = 'hsla(0, 100%, 50%, 0.5)';
```

### Common Colors (Hex)

```typescript
const COLORS = {
    // Primary
    RED: '#FF0000',
    GREEN: '#00FF00',
    BLUE: '#0000FF',
    
    // Secondary
    YELLOW: '#FFFF00',
    CYAN: '#00FFFF',
    MAGENTA: '#FF00FF',
    
    // Neutrals
    WHITE: '#FFFFFF',
    BLACK: '#000000',
    GRAY: '#808080',
    
    // Mario-specific
    SKY_BLUE: '#87CEEB',
    GROUND_BROWN: '#8B4513',
    BRICK_ORANGE: '#CD853F',
    COIN_GOLD: '#FFD700',
    GRASS_GREEN: '#228B22',
    
    // UI
    TRANSPARENT: 'rgba(0,0,0,0)',
    SEMI_BLACK: 'rgba(0,0,0,0.5)',
    SEMI_WHITE: 'rgba(255,255,255,0.5)'
};
```

### Gradients

```typescript
// Linear gradient (vertical)
const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
gradient.addColorStop(0, '#191970');    // Top
gradient.addColorStop(1, '#87CEEB');    // Bottom
ctx.fillStyle = gradient;
ctx.fillRect(0, 0, canvas.width, canvas.height);

// Linear gradient (horizontal)
const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);

// Radial gradient
const gradient = ctx.createRadialGradient(
    200, 200, 10,    // Inner circle
    200, 200, 100    // Outer circle
);
gradient.addColorStop(0, 'white');
gradient.addColorStop(1, 'blue');
```

---

## 🖼️ Images

### Loading and Drawing

```typescript
// Load image
const img = new Image();
img.src = 'player.png';
img.onload = () => {
    // Draw when loaded
    ctx.drawImage(img, x, y);
};

// Draw with size
ctx.drawImage(img, x, y, width, height);

// Draw from sprite sheet
ctx.drawImage(
    img,
    sx, sy, sw, sh,      // Source rectangle
    dx, dy, dw, dh       // Destination rectangle
);
```

### Sprite Sheet Frame Extraction

```typescript
// Extract frame N from horizontal sprite sheet
const frameWidth = 32;
const frameHeight = 32;
const frameIndex = 3;

ctx.drawImage(
    spriteSheet,
    frameIndex * frameWidth, 0,  // Source X, Y
    frameWidth, frameHeight,     // Source W, H
    x, y,                        // Dest X, Y
    frameWidth, frameHeight      // Dest W, H
);
```

### Image Smoothing

```typescript
// Pixel-perfect (no anti-aliasing)
ctx.imageSmoothingEnabled = false;

// Smooth scaling (default)
ctx.imageSmoothingEnabled = true;
```

---

## 📝 Text

### Basic Text

```typescript
ctx.font = '24px Arial';
ctx.fillStyle = 'white';
ctx.fillText('Score: 0', x, y);

// Outlined text
ctx.strokeStyle = 'black';
ctx.lineWidth = 2;
ctx.strokeText('Score: 0', x, y);
```

### Font Syntax

```typescript
ctx.font = '[style] [weight] [size] [family]';

// Examples
ctx.font = '24px Arial';
ctx.font = 'bold 32px Courier';
ctx.font = 'italic 20px Georgia';
ctx.font = 'bold italic 28px "Times New Roman"';
```

### Text Alignment

```typescript
// Horizontal
ctx.textAlign = 'left';    // Default
ctx.textAlign = 'center';  // Center on X
ctx.textAlign = 'right';   // Right-align on X

// Vertical
ctx.textBaseline = 'top';        // Y is top of text
ctx.textBaseline = 'middle';     // Y is vertical center
ctx.textBaseline = 'bottom';     // Y is bottom
ctx.textBaseline = 'alphabetic'; // Default baseline
```

### Measuring Text

```typescript
const metrics = ctx.measureText('Hello');
const width = metrics.width;  // Width in pixels
```

---

## 🔄 Transformations

### Transform Stack

```typescript
ctx.save();      // Save current state
// Apply transformations
// Draw stuff
ctx.restore();   // Restore previous state
```

### Translate

```typescript
ctx.translate(dx, dy);  // Move origin

// Example: Draw at center
ctx.translate(canvas.width / 2, canvas.height / 2);
ctx.fillRect(-25, -25, 50, 50);  // Centered square
```

### Rotate

```typescript
ctx.rotate(angle);  // Angle in radians

// Example: Rotate 45 degrees
ctx.save();
ctx.translate(x, y);
ctx.rotate(Math.PI / 4);
ctx.fillRect(-25, -25, 50, 50);
ctx.restore();
```

### Scale

```typescript
ctx.scale(sx, sy);  // Scale factors

// Example: Mirror horizontally
ctx.scale(-1, 1);

// Example: Double size
ctx.scale(2, 2);
```

### Transform Order

```
Always apply in this order:
1. Translate (move to position)
2. Rotate (rotate around that position)
3. Scale (scale from that position)
4. Draw (relative to origin)
```

---

## 🎯 Common Calculations

### Centering

```typescript
// Center rectangle
const x = (canvas.width - width) / 2;
const y = (canvas.height - height) / 2;

// Center circle
const x = canvas.width / 2;
const y = canvas.height / 2;
```

### Distance Between Points

```typescript
const dx = x2 - x1;
const dy = y2 - y1;
const distance = Math.sqrt(dx * dx + dy * dy);
```

### Angle Between Points

```typescript
const dx = x2 - x1;
const dy = y2 - y1;
const angle = Math.atan2(dy, dx);
```

### Random Values

```typescript
// Random integer between min and max (inclusive)
const random = Math.floor(Math.random() * (max - min + 1)) + min;

// Random float between min and max
const random = Math.random() * (max - min) + min;

// Random color
const hue = Math.floor(Math.random() * 360);
const color = `hsl(${hue}, 70%, 60%)`;
```

### Clamping

```typescript
// Clamp value between min and max
const clamped = Math.max(min, Math.min(max, value));

// Example: Keep player in bounds
player.x = Math.max(0, Math.min(canvas.width - player.width, player.x));
```

---

## ⚡ Performance Tips

### Fast Operations

```typescript
// ✅ Fastest: Filled rectangles
ctx.fillRect(x, y, w, h);

// ✅ Fast: Drawing images
ctx.drawImage(img, x, y);

// ✅ Fast: Solid colors
ctx.fillStyle = '#FF0000';

// ⚠️ Moderate: Circles/arcs
ctx.arc(x, y, r, 0, Math.PI * 2);

// ⚠️ Moderate: Gradients
const gradient = ctx.createLinearGradient(...);

// ❌ Slow: Shadows
ctx.shadowBlur = 10;

// ❌ Slow: Reading pixels
ctx.getImageData(0, 0, width, height);
```

### Optimization Techniques

```typescript
// ✅ Batch drawing (set style once)
ctx.fillStyle = 'red';
for (let i = 0; i < 100; i++) {
    ctx.fillRect(i * 10, 0, 8, 8);
}

// ❌ Don't set style every draw
for (let i = 0; i < 100; i++) {
    ctx.fillStyle = 'red';  // Slow!
    ctx.fillRect(i * 10, 0, 8, 8);
}

// ✅ Use integers for positions
ctx.fillRect(Math.round(x), Math.round(y), w, h);

// ❌ Avoid subpixel rendering
ctx.fillRect(100.7, 200.3, 50, 50);  // Triggers anti-aliasing

// ✅ Cache static content
const bgCanvas = document.createElement('canvas');
// Draw complex background once
// Then just copy:
ctx.drawImage(bgCanvas, 0, 0);
```

---

## 📊 Common Values

### Canvas Sizes

```typescript
// Common resolutions
const SIZES = {
    MOBILE_PORTRAIT: { w: 360, h: 640 },
    MOBILE_LANDSCAPE: { w: 640, h: 360 },
    TABLET: { w: 768, h: 1024 },
    HD: { w: 1280, h: 720 },
    FULL_HD: { w: 1920, h: 1080 },
    
    // Retro game style
    NES: { w: 256, h: 240 },
    SNES: { w: 512, h: 448 },
    
    // Common aspect ratios
    SQUARE: { w: 600, h: 600 },
    WIDESCREEN: { w: 800, h: 450 }
};
```

### Typical Measurements

```typescript
const MEASUREMENTS = {
    // Player
    PLAYER_WIDTH: 32,
    PLAYER_HEIGHT: 48,
    
    // Tiles
    TILE_SIZE: 32,
    TILE_SIZE_SMALL: 16,
    TILE_SIZE_LARGE: 64,
    
    // UI
    UI_PADDING: 20,
    BUTTON_HEIGHT: 40,
    TEXT_SIZE: 24,
    TITLE_SIZE: 48,
    
    // Timing (60 FPS)
    TARGET_FPS: 60,
    FRAME_TIME: 16.67,  // ms
    
    // Grid
    GRID_SIZE: 50,
    GRID_COLOR: '#ddd'
};
```

---

## 🐛 Quick Debugging

### Visual Debug Helpers

```typescript
// Draw hitbox
function drawHitbox(x: number, y: number, w: number, h: number) {
    ctx.strokeStyle = 'lime';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, w, h);
}

// Draw point
function drawPoint(x: number, y: number, color = 'red', size = 5) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
}

// Draw grid
function drawGrid(cellSize: number, color = '#ddd') {
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    ctx.beginPath();
    
    for (let x = 0; x <= canvas.width; x += cellSize) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
    }
    for (let y = 0; y <= canvas.height; y += cellSize) {
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
    }
    
    ctx.stroke();
}

// Display text overlay
function debugText(text: string, x = 10, y = 30) {
    ctx.fillStyle = 'rgba(0,0,0,0.7)';
    ctx.fillRect(x - 5, y - 20, ctx.measureText(text).width + 10, 25);
    ctx.fillStyle = 'lime';
    ctx.font = '16px monospace';
    ctx.fillText(text, x, y);
}
```

### Performance Measurement

```typescript
// Measure draw time
const start = performance.now();
// ... drawing code ...
const end = performance.now();
console.log(`Draw time: ${(end - start).toFixed(2)}ms`);

// FPS counter
let fps = 0;
let lastTime = 0;

function updateFPS(currentTime: number) {
    fps = Math.round(1000 / (currentTime - lastTime));
    lastTime = currentTime;
    debugText(`FPS: ${fps}`, 10, 30);
}
```

---

## 📋 Code Snippets

### Canvas Setup Boilerplate

```typescript
const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
const ctx = canvas.getContext('2d', { alpha: false })!;

canvas.width = 800;
canvas.height = 600;

// Disable image smoothing for pixel art
ctx.imageSmoothingEnabled = false;

// Start game loop
function gameLoop() {
    // Clear
    ctx.fillStyle = '#87CEEB';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Update & draw
    update();
    render();
    
    requestAnimationFrame(gameLoop);
}

gameLoop();
```

### Reusable Drawing Functions

```typescript
// Draw centered text
function drawCenteredText(text: string, y: number, font = '24px Arial') {
    ctx.font = font;
    ctx.textAlign = 'center';
    ctx.fillText(text, canvas.width / 2, y);
}

// Draw button
function drawButton(x: number, y: number, w: number, h: number, text: string) {
    // Background
    ctx.fillStyle = '#4CAF50';
    ctx.fillRect(x, y, w, h);
    
    // Border
    ctx.strokeStyle = '#2E7D32';
    ctx.lineWidth = 3;
    ctx.strokeRect(x, y, w, h);
    
    // Text
    ctx.fillStyle = 'white';
    ctx.font = 'bold 20px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, x + w / 2, y + h / 2);
}

// Draw progress bar
function drawProgressBar(x: number, y: number, w: number, h: number, progress: number) {
    // Background
    ctx.fillStyle = '#333';
    ctx.fillRect(x, y, w, h);
    
    // Progress
    ctx.fillStyle = '#4CAF50';
    ctx.fillRect(x, y, w * progress, h);
    
    // Border
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, w, h);
}
```

---

## 🎮 Mario-Specific Snippets

### Sky and Ground

```typescript
function drawBackground() {
    // Sky gradient
    const skyGradient = ctx.createLinearGradient(0, 0, 0, 400);
    skyGradient.addColorStop(0, '#87CEEB');
    skyGradient.addColorStop(1, '#E0F6FF');
    ctx.fillStyle = skyGradient;
    ctx.fillRect(0, 0, canvas.width, 400);
    
    // Ground
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(0, 400, canvas.width, 200);
}
```

### Block/Brick

```typescript
function drawBlock(x: number, y: number, color = '#CD853F') {
    const size = 32;
    
    // Main block
    ctx.fillStyle = color;
    ctx.fillRect(x, y, size, size);
    
    // Highlight (top-left)
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.fillRect(x, y, size, 4);
    ctx.fillRect(x, y, 4, size);
    
    // Shadow (bottom-right)
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillRect(x, y + size - 4, size, 4);
    ctx.fillRect(x + size - 4, y, 4, size);
}
```

### Coin

```typescript
function drawCoin(x: number, y: number, radius = 12) {
    // Outer circle
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fillStyle = '#FFD700';
    ctx.fill();
    
    // Border
    ctx.strokeStyle = '#B8860B';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Shine
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.beginPath();
    ctx.arc(x - 3, y - 3, radius / 3, 0, Math.PI * 2);
    ctx.fill();
}
```

---

## 🔍 Visual Reference

### Coordinate System

```
(0,0) ────────────────> X+
  │
  │
  │
  │
  │
  ▼
  Y+

Origin is TOP-LEFT
X increases RIGHT
Y increases DOWN
```

### Rectangle Positioning

```
(x, y) ← Top-left corner
  ┌─────────┐
  │         │
  │  width  │ height
  │         │
  └─────────┘
      (x+w, y+h) ← Bottom-right
```

### Circle Positioning

```
      (x, y) ← Center
        • 
      ╱ │ ╲
     ╱  │r ╲
    •───┼───•
     ╲  │  ╱
      ╲ │ ╱
        •
```

### Rotation Angles

```
        90° (π/2)
           │
           │
180° (π) ──┼── 0° (0)
           │
           │
       270° (3π/2)
```

---

## 💾 Save This Cheat Sheet

Print this page or keep it open in a tab for quick reference while coding!

**Most Common Operations:**
1. `ctx.fillRect(x, y, w, h)` — Draw filled rectangle
2. `ctx.drawImage(img, x, y)` — Draw image
3. `ctx.fillText(text, x, y)` — Draw text
4. `ctx.beginPath()` — Start new path
5. `ctx.arc(x, y, r, 0, Math.PI*2)` — Draw circle

**Most Common Mistakes:**
1. Forgetting `ctx.fill()` or `ctx.stroke()` after paths
2. Not waiting for `img.onload` before drawing images
3. Mixing up (x, y) with (width, height)
4. Using degrees instead of radians for rotation
5. Not calling `beginPath()` before each shape

---

**Quick Reference Complete!** 📚

Keep this handy while working through exercises and building your game!
