# Canvas Rendering Basics - Debugging Guide

**Unit 01: Game Foundations | Topic 01 | Common Bugs & Fixes**

> **Purpose:** Learn to identify and fix the 10 most common Canvas rendering bugs, with symptoms, causes, solutions, and prevention strategies.

---

## How to Use This Guide

1. **Identify the symptom** — Match what you're seeing
2. **Understand the cause** — Learn why it happens
3. **Apply the solution** — Fix it step-by-step
4. **Prevent future occurrences** — Adopt best practices

---

## Bug #1: Canvas is Blank (Nothing Renders)

### Symptom
- Canvas appears but shows nothing
- No error messages in console
- Code looks correct

### Root Cause
**Multiple possible causes:**
1. Script runs before canvas element exists
2. Context retrieval failed
3. Drawing outside canvas bounds
4. Wrong canvas ID

### Diagnosis Steps

```typescript
// Add debug logging
console.log('Canvas element:', canvas);
console.log('Context:', ctx);
console.log('Canvas size:', canvas.width, canvas.height);

// Check if canvas exists
if (!canvas) {
    console.error('Canvas element not found!');
}

// Check if context exists
if (!ctx) {
    console.error('Failed to get 2D context!');
}
```

### Solution

**Fix 1: Load Script After Canvas**

```html
<!-- WRONG -->
<head>
    <script src="game.js"></script>
</head>
<body>
    <canvas id="gameCanvas"></canvas>
</body>

<!-- RIGHT -->
<body>
    <canvas id="gameCanvas"></canvas>
    <script src="game.js"></script>
</body>

<!-- OR use defer -->
<head>
    <script src="game.js" defer></script>
</head>
```

**Fix 2: Check Canvas Size**

```typescript
// Canvas might be 0×0
console.log(canvas.width, canvas.height);

// Set size explicitly
canvas.width = 800;
canvas.height = 600;
```

**Fix 3: Verify Drawing Position**

```typescript
// Drawing off-screen?
ctx.fillRect(10, 10, 50, 50);  // Visible
// vs
ctx.fillRect(1000, 1000, 50, 50);  // Off-screen!
```

### Prevention

```typescript
// Defensive coding
function initCanvas() {
    const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
    
    if (!canvas) {
        throw new Error('Canvas element not found');
    }
    
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
        throw new Error('2D context not supported');
    }
    
    // Set size
    canvas.width = 800;
    canvas.height = 600;
    
    console.log('Canvas initialized:', canvas.width, 'x', canvas.height);
    
    return { canvas, ctx };
}

const { canvas, ctx } = initCanvas();
```

---

## Bug #2: Images Don't Appear

### Symptom
- Code runs without errors
- Other shapes render fine
- Images simply don't show up

### Root Cause
**Drawing image before it's loaded.**

Images load asynchronously. If you draw them immediately after setting `img.src`, they won't be loaded yet.

### Diagnosis Steps

```typescript
const img = new Image();
console.log('Before load:', img.complete);  // false
img.src = 'player.png';
console.log('After src set:', img.complete);  // still false!

img.onload = () => {
    console.log('After onload:', img.complete);  // true
    ctx.drawImage(img, 0, 0);
};
```

### Solution

**Always use `onload` callback:**

```typescript
// WRONG
const img = new Image();
img.src = 'player.png';
ctx.drawImage(img, 100, 100);  // Image not loaded yet!

// RIGHT
const img = new Image();
img.onload = () => {
    ctx.drawImage(img, 100, 100);  // Now it works!
};
img.src = 'player.png';

// EVEN BETTER: Check if already loaded
img.onload = () => {
    ctx.drawImage(img, 100, 100);
};
img.src = 'player.png';
if (img.complete) {
    img.onload!(null as any);  // Call immediately if cached
}
```

### Prevention

**Use an image loader class:**

```typescript
class ImageLoader {
    private images = new Map<string, HTMLImageElement>();
    
    async load(name: string, src: string): Promise<void> {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                this.images.set(name, img);
                resolve();
            };
            img.onerror = () => reject(new Error(`Failed to load ${src}`));
            img.src = src;
        });
    }
    
    get(name: string): HTMLImageElement {
        const img = this.images.get(name);
        if (!img) throw new Error(`Image ${name} not loaded`);
        return img;
    }
}

// Usage
const loader = new ImageLoader();
await loader.load('player', 'assets/player.png');
const playerImg = loader.get('player');
ctx.drawImage(playerImg, 100, 100);
```

---

## Bug #3: Pixel Art Looks Blurry

### Symptom
- Pixel art sprites appear fuzzy/blurry
- Especially when scaled up
- Colors seem to blend together

### Root Cause
**Image smoothing is enabled by default.**

Canvas anti-aliases images when scaling, which blurs sharp pixel edges.

### Diagnosis Steps

```typescript
console.log('Image smoothing:', ctx.imageSmoothingEnabled);  // true
```

### Solution

```typescript
// Disable image smoothing BEFORE drawing
ctx.imageSmoothingEnabled = false;

// Now draw pixel art
ctx.drawImage(pixelArtSprite, 0, 0, 32, 32, 100, 100, 128, 128);
```

**Visual comparison:**

```
With smoothing:          Without smoothing:
┌─────────┐             ┌─────────┐
│ ░▒▓█▓▒░ │             │ ░░▓▓▓▓░░ │  ← Sharp pixels
│ ░▒▓█▓▒░ │  Blurry     │ ░░▓▓▓▓░░ │
└─────────┘             └─────────┘
```

### Prevention

```typescript
// Set once at initialization
function initCanvas() {
    // ... canvas setup ...
    
    // For pixel art games, always disable
    ctx.imageSmoothingEnabled = false;
    
    return ctx;
}
```

---

## Bug #4: Colors Look Wrong

### Symptom
- Colors don't match what you specified
- Unexpected opacity/transparency
- Colors appear darker or lighter than expected

### Root Cause
**Multiple possibilities:**
1. Invalid color syntax
2. Previous `globalAlpha` setting
3. Composite mode affecting colors
4. RGB values out of range

### Diagnosis Steps

```typescript
// Check current state
console.log('fillStyle:', ctx.fillStyle);
console.log('globalAlpha:', ctx.globalAlpha);
console.log('globalCompositeOperation:', ctx.globalCompositeOperation);
```

### Solution

**Fix 1: Validate Color Syntax**

```typescript
// WRONG
ctx.fillStyle = '#GGG000';  // Invalid hex
ctx.fillStyle = 'rgb(300, 0, 0)';  // RGB > 255
ctx.fillStyle = 'rgba(255, 0, 0, 2)';  // Alpha > 1

// RIGHT
ctx.fillStyle = '#FF0000';
ctx.fillStyle = 'rgb(255, 0, 0)';
ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
```

**Fix 2: Reset Global Alpha**

```typescript
// After using transparency
ctx.globalAlpha = 0.5;
ctx.fillRect(0, 0, 100, 100);

// MUST reset or all future draws will be transparent!
ctx.globalAlpha = 1.0;
```

**Fix 3: Reset Composite Mode**

```typescript
ctx.globalCompositeOperation = 'multiply';  // Changes colors
ctx.fillRect(0, 0, 100, 100);

// Reset to default
ctx.globalCompositeOperation = 'source-over';
```

### Prevention

```typescript
// Utility function for safe color setting
function setColor(ctx: CanvasRenderingContext2D, color: string) {
    // Reset alpha and composite mode
    ctx.globalAlpha = 1.0;
    ctx.globalCompositeOperation = 'source-over';
    
    // Set color
    ctx.fillStyle = color;
    ctx.strokeStyle = color;
}
```

---

## Bug #5: Shapes Disappear When Rotated

### Symptom
- Shapes render fine normally
- After applying rotation, they disappear
- No error messages

### Root Cause
**Forgetting to translate before rotating.**

Rotation happens around the origin (0, 0). If your shape is at (200, 200), rotating will spin it in a large arc around (0, 0), likely off-screen.

### Diagnosis Steps

```typescript
// Visualize rotation center
ctx.fillStyle = 'red';
ctx.fillRect(0, 0, 5, 5);  // Mark origin

ctx.rotate(Math.PI / 4);
ctx.fillStyle = 'blue';
ctx.fillRect(200, 200, 50, 50);  // Where did it go?
```

### Solution

**Always translate before rotating:**

```typescript
// WRONG: Rotate then draw at position
ctx.rotate(Math.PI / 4);
ctx.fillRect(200, 200, 50, 50);  // Rotates around (0,0)!

// RIGHT: Translate, rotate, draw at origin
ctx.save();
ctx.translate(200, 200);  // Move origin to object center
ctx.rotate(Math.PI / 4);
ctx.fillRect(-25, -25, 50, 50);  // Draw centered on new origin
ctx.restore();
```

**Visual explanation:**

```
Wrong (rotate without translate):
Origin (0,0)
  •
  
  
         shape at (200,200)
            rotates in huge arc
              around (0,0) → off screen!

Right (translate then rotate):
            New origin at (200,200)
                  •
                rotates
              in place!
```

### Prevention

```typescript
// Reusable rotation function
function drawRotated(
    drawFn: () => void,
    x: number,
    y: number,
    rotation: number
) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);
    drawFn();
    ctx.restore();
}

// Usage
drawRotated(() => {
    ctx.fillRect(-25, -25, 50, 50);
}, 200, 200, Math.PI / 4);
```

---

## Bug #6: Performance Degrades Over Time

### Symptom
- Game starts at 60 FPS
- Gradually slows down to 20-30 FPS
- Memory usage increases

### Root Cause
**Memory leaks or accumulating operations:**
1. Creating new objects in game loop
2. Event listeners not removed
3. Transformations accumulating
4. No garbage collection opportunities

### Diagnosis Steps

```typescript
// Monitor memory
console.log('Memory:', (performance as any).memory?.usedJSHeapSize);

// Check FPS
let frameCount = 0;
let lastFPSUpdate = 0;

function updateFPS(time: number) {
    frameCount++;
    if (time - lastFPSUpdate > 1000) {
        console.log('FPS:', frameCount);
        frameCount = 0;
        lastFPSUpdate = time;
    }
}
```

### Solution

**Fix 1: Avoid Creating Objects in Loop**

```typescript
// WRONG: Creates new object every frame
function gameLoop() {
    const particle = { x: 100, y: 100 };  // Memory leak!
    particles.push(particle);
}

// RIGHT: Reuse objects (object pooling)
const particlePool: Particle[] = [];

function getParticle(): Particle {
    return particlePool.pop() || new Particle();
}

function releaseParticle(p: Particle) {
    p.reset();
    particlePool.push(p);
}
```

**Fix 2: Remove Event Listeners**

```typescript
// WRONG: Listener added every frame
function gameLoop() {
    canvas.addEventListener('click', handleClick);  // Leaks!
}

// RIGHT: Add once
canvas.addEventListener('click', handleClick);

function gameLoop() {
    // Just use the existing listener
}
```

**Fix 3: Reset Transformations**

```typescript
// WRONG: Transformations accumulate
function gameLoop() {
    ctx.rotate(0.01);  // Keeps rotating faster!
    draw();
}

// RIGHT: Save/restore
function gameLoop() {
    ctx.save();
    ctx.rotate(angle);
    draw();
    ctx.restore();
}
```

### Prevention

```typescript
// Use object pools
class ObjectPool<T> {
    private pool: T[] = [];
    
    constructor(private factory: () => T, initialSize = 10) {
        for (let i = 0; i < initialSize; i++) {
            this.pool.push(factory());
        }
    }
    
    get(): T {
        return this.pool.pop() || this.factory();
    }
    
    release(obj: T) {
        this.pool.push(obj);
    }
}

const particles = new ObjectPool(() => new Particle(), 100);
```

---

## Bug #7: Text Appears Cut Off or Misaligned

### Symptom
- Text is partially off-screen
- Text alignment seems wrong
- Text baseline looks incorrect

### Root Cause
**Misunderstanding text positioning:**
- Text X/Y is not top-left corner
- Default baseline is 'alphabetic'
- textAlign affects horizontal position

### Diagnosis Steps

```typescript
// Visualize text position
ctx.fillStyle = 'red';
ctx.fillRect(x - 2, y - 2, 4, 4);  // Mark (x, y)

ctx.fillStyle = 'black';
ctx.fillText('Hello', x, y);  // Where does it appear?
```

### Solution

```typescript
// Understand text positioning
ctx.textBaseline = 'top';     // Y is top of text
ctx.textBaseline = 'middle';  // Y is vertical center
ctx.textBaseline = 'bottom';  // Y is bottom

ctx.textAlign = 'left';    // X is left edge
ctx.textAlign = 'center';  // X is horizontal center
ctx.textAlign = 'right';   // X is right edge

// For top-left positioning:
ctx.textBaseline = 'top';
ctx.textAlign = 'left';
ctx.fillText('Score: 0', 20, 20);

// For centered:
ctx.textBaseline = 'middle';
ctx.textAlign = 'center';
ctx.fillText('Game Over', canvas.width / 2, canvas.height / 2);
```

**Visual guide:**

```
textAlign='left':     textAlign='center':   textAlign='right':
    X                       X                        X
    │                       │                        │
    Hello                 Hello                  Hello
    
textBaseline='top':    textBaseline='middle':  textBaseline='bottom':
────────── Y           Hello ── Y                 Hello
  Hello                                       ────────── Y
```

### Prevention

```typescript
// Helper function with explicit alignment
function drawText(
    text: string,
    x: number,
    y: number,
    align: 'left' | 'center' | 'right' = 'left',
    baseline: 'top' | 'middle' | 'bottom' = 'top'
) {
    ctx.textAlign = align;
    ctx.textBaseline = baseline;
    ctx.fillText(text, x, y);
}
```

---

## Bug #8: Circles Have Gaps or Are Incomplete

### Symptom
- Circles don't close properly
- Strange lines appear in circles
- Multiple circles share paths

### Root Cause
**Forgetting `beginPath()` before each shape.**

Canvas paths accumulate unless you explicitly start a new path.

### Diagnosis Steps

```typescript
// Without beginPath
ctx.arc(100, 100, 50, 0, Math.PI * 2);
ctx.fillStyle = 'red';
ctx.fill();

ctx.arc(200, 100, 50, 0, Math.PI * 2);  // Connects to previous!
ctx.fillStyle = 'blue';
ctx.fill();
```

### Solution

```typescript
// WRONG: Paths connect
function drawCircle(x: number, y: number, r: number, color: string) {
    ctx.arc(x, y, r, 0, Math.PI * 2);  // Missing beginPath!
    ctx.fillStyle = color;
    ctx.fill();
}

// RIGHT: Each circle is independent
function drawCircle(x: number, y: number, r: number, color: string) {
    ctx.beginPath();  // Start fresh!
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
}
```

### Prevention

```typescript
// Always beginPath before path operations
function drawShape() {
    ctx.beginPath();  // Always!
    
    // Path commands
    ctx.moveTo(...);
    ctx.lineTo(...);
    ctx.arc(...);
    
    // Fill or stroke
    ctx.fill();
    // or
    ctx.stroke();
}
```

---

## Bug #9: Gradient Doesn't Show or Looks Wrong

### Symptom
- Gradient appears as solid color
- Gradient is in wrong direction
- Gradient repeats strangely

### Root Cause
**Incorrect gradient coordinates or color stops.**

### Diagnosis Steps

```typescript
const gradient = ctx.createLinearGradient(0, 0, 100, 0);
console.log('Gradient:', gradient);
// If this is null, something went wrong

// Check color stops
gradient.addColorStop(0, 'red');
gradient.addColorStop(1, 'blue');
```

### Solution

**Fix 1: Gradient Direction**

```typescript
// Horizontal gradient (left to right)
const gradient = ctx.createLinearGradient(
    0, 0,               // Start: left
    canvas.width, 0     // End: right
);

// Vertical gradient (top to bottom)
const gradient = ctx.createLinearGradient(
    0, 0,               // Start: top
    0, canvas.height    // End: bottom
);

// Diagonal
const gradient = ctx.createLinearGradient(
    0, 0,               // Top-left
    canvas.width, canvas.height  // Bottom-right
);
```

**Fix 2: Color Stops Must Be 0-1**

```typescript
// WRONG
gradient.addColorStop(0, 'red');
gradient.addColorStop(100, 'blue');  // Should be 0-1!

// RIGHT
gradient.addColorStop(0, 'red');    // 0% (start)
gradient.addColorStop(0.5, 'green'); // 50% (middle)
gradient.addColorStop(1, 'blue');   // 100% (end)
```

### Prevention

```typescript
// Gradient factory function
function createVerticalGradient(colors: string[]): CanvasGradient {
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    
    colors.forEach((color, index) => {
        const stop = index / (colors.length - 1);
        gradient.addColorStop(stop, color);
    });
    
    return gradient;
}

// Usage
ctx.fillStyle = createVerticalGradient(['#191970', '#87CEEB']);
ctx.fillRect(0, 0, canvas.width, canvas.height);
```

---

## Bug #10: Drawing Order Is Wrong

### Symptom
- Objects appear behind things they should be in front of
- UI elements hidden by game objects
- Z-order seems random

### Root Cause
**Canvas uses painter's algorithm:** whatever you draw last appears on top.

There's no automatic Z-sorting.

### Diagnosis Steps

```typescript
// What gets drawn last?
ctx.fillStyle = 'blue';
ctx.fillRect(50, 50, 100, 100);  // First (back)

ctx.fillStyle = 'red';
ctx.fillRect(75, 75, 100, 100);  // Second (front)

// Red appears on top of blue
```

### Solution

**Organize drawing in layers:**

```typescript
function render() {
    // Layer 1: Background
    drawBackground();
    
    // Layer 2: Distant objects (parallax background)
    drawClouds();
    drawMountains();
    
    // Layer 3: Level tiles
    drawTiles();
    
    // Layer 4: Collectibles
    drawCoins();
    
    // Layer 5: Enemies
    drawEnemies();
    
    // Layer 6: Player (always on top of enemies)
    drawPlayer();
    
    // Layer 7: Effects (particles)
    drawParticles();
    
    // Layer 8: UI (always on top)
    drawUI();
}
```

**For entities with dynamic Z:**

```typescript
// Sort by Y position (farther back = drawn first)
entities.sort((a, b) => a.y - b.y);

entities.forEach(entity => {
    entity.draw(ctx);
});
```

### Prevention

```typescript
// Render system with explicit layers
class RenderSystem {
    private layers = new Map<number, (() => void)[]>();
    
    addToLayer(layer: number, drawFn: () => void) {
        if (!this.layers.has(layer)) {
            this.layers.set(layer, []);
        }
        this.layers.get(layer)!.push(drawFn);
    }
    
    render() {
        // Sort layers
        const sortedLayers = Array.from(this.layers.keys()).sort((a, b) => a - b);
        
        // Draw each layer in order
        sortedLayers.forEach(layer => {
            this.layers.get(layer)!.forEach(fn => fn());
        });
        
        // Clear for next frame
        this.layers.clear();
    }
}

// Usage
const renderer = new RenderSystem();
renderer.addToLayer(0, drawBackground);
renderer.addToLayer(10, drawPlayer);
renderer.addToLayer(20, drawUI);
renderer.render();
```

---

## General Debugging Tips

### Use Browser DevTools

```typescript
// Pause execution
debugger;  // Stops at this line

// Conditional breakpoint in DevTools:
// Click line number, right-click, "Add conditional breakpoint"
// Condition: x > 100 && y < 50
```

### Console Logging Best Practices

```typescript
// Color-coded console messages
console.log('%c Player position', 'color: green', player.x, player.y);
console.warn('Low FPS detected:', fps);
console.error('Failed to load image:', imgSrc);

// Group related logs
console.group('Frame info');
console.log('FPS:', fps);
console.log('Delta:', deltaTime);
console.log('Entities:', entities.length);
console.groupEnd();
```

### Visual Debugging

```typescript
// Draw debug overlay
let debugMode = false;

document.addEventListener('keydown', (e) => {
    if (e.key === 'd') debugMode = !debugMode;
});

function renderDebug() {
    if (!debugMode) return;
    
    // Draw hitboxes
    entities.forEach(e => {
        ctx.strokeStyle = 'lime';
        ctx.strokeRect(e.x, e.y, e.width, e.height);
    });
    
    // Draw FPS
    ctx.fillStyle = 'white';
    ctx.fillText(`FPS: ${fps}`, 10, 20);
}
```

---

## Summary

### Top Debugging Strategies

1. **Read error messages** — Console errors tell you exactly what's wrong
2. **Use console.log liberally** — Verify your assumptions
3. **Visual debugging** — Draw hitboxes, origins, and debug text
4. **Isolate the problem** — Comment out code until it works
5. **Check browser DevTools** — Use debugger and breakpoints
6. **Read documentation** — MDN is your friend
7. **Search error messages** — Someone else probably had the same issue

### Prevention Checklist

- [ ] Always use `beginPath()` before drawing paths
- [ ] Always wait for `img.onload` before drawing images
- [ ] Always use `save()` and `restore()` with transformations
- [ ] Set `imageSmoothingEnabled = false` for pixel art
- [ ] Draw in consistent layer order
- [ ] Validate color values
- [ ] Reset global state (alpha, composite mode)
- [ ] Use TypeScript for type safety
- [ ] Test on multiple browsers
- [ ] Profile performance early

---

**You've learned to debug like a pro!** 🐛➡️✨

Most bugs can be avoided with good coding practices. The rest can be fixed with systematic debugging. Keep this guide handy!

**Next:** Read `j-faq.md` for answers to common questions.
