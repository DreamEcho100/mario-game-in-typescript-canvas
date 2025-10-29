# Canvas Rendering Basics - FAQ

**Unit 01: Game Foundations | Topic 01 | Frequently Asked Questions**

> **Purpose:** Quick answers to the most common questions about Canvas rendering, from beginners to intermediate developers.

---

## Getting Started

### Q1: What's the difference between Canvas and SVG?

**Short Answer:** Canvas is raster (pixels), SVG is vector (shapes).

**Detailed Answer:**

| Canvas | SVG |
|--------|-----|
| Pixel-based (bitmap) | Shape-based (vector) |
| Immediate mode | Retained mode |
| No DOM elements | Each shape is a DOM element |
| Better for games/animations | Better for diagrams/icons |
| Fixed resolution | Scales infinitely |
| Lower memory for complex scenes | Higher memory with many elements |

**For game development, use Canvas because:**
- Much faster for real-time rendering (60 FPS)
- Better for pixel manipulation
- Lower memory overhead with many objects
- Easier to implement game-specific effects

---

### Q2: Why do I need TypeScript? Can't I just use JavaScript?

**Short Answer:** You can, but TypeScript prevents bugs and improves productivity.

**Benefits for Game Development:**

```typescript
// TypeScript catches errors at compile time
interface Player {
    x: number;
    y: number;
    velocityX: number;
}

const player: Player = {
    x: 100,
    y: 200,
    veloctyX: 0  // ❌ Error: Did you mean 'velocityX'?
};

// JavaScript wouldn't catch this until runtime
const player = {
    x: 100,
    y: 200,
    veloctyX: 0  // ✓ No error, but your game is broken!
};
```

**Real-world example:**

```typescript
// TypeScript prevents these common mistakes:

// 1. Passing wrong types
function drawSprite(x: number, y: number) { ... }
drawSprite("100", "200");  // ❌ Error: Expected number

// 2. Calling nonexistent methods
ctx.drawImage(img, 0, 0);  // ✓
ctx.drawImag(img, 0, 0);   // ❌ Error: Did you mean 'drawImage'?

// 3. Accessing undefined properties
player.position.x;  // ❌ Error: Property 'position' doesn't exist
```

**Bottom line:** TypeScript catches bugs before they reach the browser. For a large game project, this is invaluable.

---

### Q3: What canvas size should I use?

**Short Answer:** Depends on your game and target devices.

**Common Approaches:**

**1. Fixed Size (Classic Games)**
```typescript
// Good for pixel art platformers
canvas.width = 800;
canvas.height = 600;
```

**2. Full Screen**
```typescript
// Good for mobile or immersive games
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});
```

**3. Maintain Aspect Ratio**
```typescript
// Best for most games (scales to fit)
const GAME_WIDTH = 800;
const GAME_HEIGHT = 600;
const ASPECT_RATIO = GAME_WIDTH / GAME_HEIGHT;

function resizeCanvas() {
    const windowRatio = window.innerWidth / window.innerHeight;
    
    if (windowRatio > ASPECT_RATIO) {
        // Window is wider
        canvas.height = window.innerHeight;
        canvas.width = canvas.height * ASPECT_RATIO;
    } else {
        // Window is taller
        canvas.width = window.innerWidth;
        canvas.height = canvas.width / ASPECT_RATIO;
    }
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();
```

**For Mario-style platformer:** Use 800×600 or 1280×720 for development, then scale to fit.

---

### Q4: Should I use `clearRect()` or `fillRect()` to clear the canvas?

**Short Answer:** Usually `clearRect()`, but `fillRect()` for backgrounds.

**Comparison:**

```typescript
// clearRect() - Makes pixels transparent
ctx.clearRect(0, 0, canvas.width, canvas.height);
// Result: Transparent canvas (shows webpage background)

// fillRect() - Fills with solid color
ctx.fillStyle = '#87CEEB';  // Sky blue
ctx.fillRect(0, 0, canvas.width, canvas.height);
// Result: Blue background
```

**Best practice for games:**

```typescript
function render() {
    // Option 1: Clear + draw background
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBackground();
    
    // Option 2: Just fill with background color (faster)
    ctx.fillStyle = '#87CEEB';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Rest of drawing
    drawLevel();
    drawPlayer();
}
```

**Performance note:** `fillRect()` is slightly faster than `clearRect()` + `fillRect()` if you always have a solid background.

---

## Drawing & Rendering

### Q5: Why does my canvas look blurry on high-DPI displays (Retina)?

**Short Answer:** Canvas CSS size doesn't match pixel size.

**The Problem:**

```html
<canvas id="game" width="800" height="600" style="width: 400px;"></canvas>
```

This creates 800×600 pixels stretched to 400×200 CSS pixels → blurry on high-DPI.

**The Solution:**

```typescript
function setupHiDPICanvas(canvas: HTMLCanvasElement) {
    // Get device pixel ratio
    const dpr = window.devicePixelRatio || 1;
    
    // Desired CSS size
    const cssWidth = 800;
    const cssHeight = 600;
    
    // Set canvas pixel size (accounting for DPI)
    canvas.width = cssWidth * dpr;
    canvas.height = cssHeight * dpr;
    
    // Set CSS size
    canvas.style.width = cssWidth + 'px';
    canvas.style.height = cssHeight + 'px';
    
    // Scale context to match
    const ctx = canvas.getContext('2d')!;
    ctx.scale(dpr, dpr);
    
    // Now draw as if canvas is 800×600
    ctx.fillRect(0, 0, 100, 100);  // Will be crisp!
}
```

**For pixel art games:** You might want to keep it "blurry" for authentic retro look, or scale up with `imageSmoothingEnabled = false`.

---

### Q6: What's the difference between `fillRect()` and `strokeRect()`?

**Short Answer:** `fillRect()` is solid, `strokeRect()` is outline.

**Visual:**

```typescript
// Filled rectangle (solid)
ctx.fillStyle = 'blue';
ctx.fillRect(50, 50, 100, 100);
// Result: ████████ (solid blue square)

// Stroked rectangle (outline only)
ctx.strokeStyle = 'red';
ctx.lineWidth = 3;
ctx.strokeRect(200, 50, 100, 100);
// Result: ▯ (red outline)

// Both (filled with outline)
ctx.fillStyle = 'blue';
ctx.fillRect(350, 50, 100, 100);
ctx.strokeStyle = 'black';
ctx.lineWidth = 2;
ctx.strokeRect(350, 50, 100, 100);
// Result: ████████ with black border
```

**For Mario blocks:**

```typescript
function drawBlock(x: number, y: number, size: number) {
    // Fill
    ctx.fillStyle = '#C84C0C';
    ctx.fillRect(x, y, size, size);
    
    // Outline
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, size, size);
}
```

---

### Q7: How do I draw a circle?

**Short Answer:** Use `arc()` with full angle.

**Complete Example:**

```typescript
function drawCircle(x: number, y: number, radius: number, color: string) {
    ctx.beginPath();  // Important!
    ctx.arc(
        x, y,           // Center position
        radius,         // Radius
        0,              // Start angle (0 radians)
        Math.PI * 2     // End angle (360 degrees)
    );
    ctx.fillStyle = color;
    ctx.fill();
}

// Usage
drawCircle(100, 100, 50, 'red');
```

**Common Mistakes:**

```typescript
// ❌ WRONG: Forgot beginPath
ctx.arc(100, 100, 50, 0, Math.PI * 2);
ctx.fill();
ctx.arc(200, 100, 50, 0, Math.PI * 2);  // Connects to previous circle!
ctx.fill();

// ✅ RIGHT: beginPath for each circle
ctx.beginPath();
ctx.arc(100, 100, 50, 0, Math.PI * 2);
ctx.fill();

ctx.beginPath();  // Fresh start!
ctx.arc(200, 100, 50, 0, Math.PI * 2);
ctx.fill();
```

**For coin in Mario:**

```typescript
function drawCoin(x: number, y: number) {
    // Outer circle (gold)
    ctx.beginPath();
    ctx.arc(x, y, 12, 0, Math.PI * 2);
    ctx.fillStyle = '#FFD700';
    ctx.fill();
    
    // Inner circle (shine)
    ctx.beginPath();
    ctx.arc(x - 3, y - 3, 4, 0, Math.PI * 2);
    ctx.fillStyle = '#FFEC8B';
    ctx.fill();
}
```

---

### Q8: How can I rotate an image without rotating the whole canvas?

**Short Answer:** Use `save()`, `restore()`, and `translate()`.

**The Pattern:**

```typescript
function drawRotatedImage(
    img: HTMLImageElement,
    x: number,
    y: number,
    angle: number  // In radians
) {
    ctx.save();                    // Save current state
    
    ctx.translate(x, y);           // Move origin to image center
    ctx.rotate(angle);             // Rotate around new origin
    
    // Draw image centered on origin
    ctx.drawImage(
        img,
        -img.width / 2,            // Offset to center
        -img.height / 2
    );
    
    ctx.restore();                 // Restore original state
}

// Usage
const angle = Date.now() * 0.001;  // Rotating over time
drawRotatedImage(playerImg, 200, 200, angle);

// Canvas is back to normal after restore
ctx.fillRect(0, 0, 50, 50);  // Draws normally (not rotated)
```

**Why This Works:**

```
1. save()
   ├─ Saves current transform
   
2. translate(x, y)
   ├─ Moves origin to (x, y)
   
3. rotate(angle)
   ├─ Rotates around new origin
   
4. drawImage(-w/2, -h/2)
   ├─ Image centered on origin
   
5. restore()
   └─ Back to saved state (no rotation)
```

---

### Q9: What's the difference between `fill()` and `stroke()`?

**Short Answer:** `fill()` fills interior, `stroke()` draws outline.

**Example:**

```typescript
// Create a path (triangle)
ctx.beginPath();
ctx.moveTo(100, 50);
ctx.lineTo(150, 150);
ctx.lineTo(50, 150);
ctx.closePath();

// Fill only
ctx.fillStyle = 'blue';
ctx.fill();
// Result: ▲ solid blue triangle

// Stroke only
ctx.strokeStyle = 'red';
ctx.lineWidth = 3;
ctx.stroke();
// Result: △ red outline

// Both
ctx.fillStyle = 'blue';
ctx.fill();
ctx.strokeStyle = 'black';
ctx.stroke();
// Result: ▲ with black border
```

**For shapes, you can use shortcuts:**

```typescript
// fillRect() = fill a rectangle immediately
ctx.fillStyle = 'blue';
ctx.fillRect(0, 0, 100, 100);

// strokeRect() = stroke a rectangle immediately
ctx.strokeStyle = 'red';
ctx.strokeRect(0, 0, 100, 100);

// But for custom paths, use fill() and stroke()
ctx.beginPath();
ctx.arc(50, 50, 40, 0, Math.PI * 2);
ctx.fillStyle = 'green';
ctx.fill();
ctx.strokeStyle = 'black';
ctx.stroke();
```

---

## Performance

### Q10: How many objects can I draw before performance suffers?

**Short Answer:** Thousands, if you're smart about it.

**Rough Guidelines (60 FPS):**

- **Simple shapes (rects/circles):** 10,000+
- **Images (drawImage):** 1,000-5,000
- **Complex paths:** 500-1,000
- **Text rendering:** 100-500

**But it depends on:**
1. Object size (bigger = more pixels to fill)
2. Overdraw (drawing on top of same pixels)
3. Transformations (rotation/scaling is slower)
4. Image smoothing enabled/disabled
5. Device performance

**Optimization Strategies:**

```typescript
// 1. Don't draw off-screen objects
function isVisible(obj: GameObject): boolean {
    return obj.x + obj.width > 0 &&
           obj.x < canvas.width &&
           obj.y + obj.height > 0 &&
           obj.y < canvas.height;
}

entities.filter(isVisible).forEach(e => e.draw());

// 2. Batch draw calls
// Bad: Draw each tile individually
tiles.forEach(tile => {
    ctx.fillStyle = tile.color;
    ctx.fillRect(tile.x, tile.y, TILE_SIZE, TILE_SIZE);
});

// Good: Group by color
const tilesByColor = groupBy(tiles, t => t.color);
for (const [color, tiles] of tilesByColor) {
    ctx.fillStyle = color;
    tiles.forEach(tile => {
        ctx.fillRect(tile.x, tile.y, TILE_SIZE, TILE_SIZE);
    });
}

// 3. Use sprite sheets (single image, multiple draws)
// Much faster than loading individual images

// 4. Cache complex drawings to off-screen canvas
const cache = document.createElement('canvas');
const cacheCtx = cache.getContext('2d')!;
// Draw complex scene once
drawComplexBackground(cacheCtx);
// Then just copy it each frame
ctx.drawImage(cache, 0, 0);
```

---

### Q11: Should I use `requestAnimationFrame` or `setInterval`?

**Short Answer:** **Always use `requestAnimationFrame`**.

**Why?**

| requestAnimationFrame | setInterval |
|----------------------|-------------|
| Syncs with display refresh (60 FPS) | Fixed interval (may not match display) |
| Pauses when tab inactive (saves battery) | Runs even when tab hidden |
| Better performance | Can cause jank |
| Variable delta time (smooth) | Fixed delta (can skip frames) |

**Correct Pattern:**

```typescript
let lastTime = 0;

function gameLoop(currentTime: number) {
    // Calculate delta time
    const deltaTime = (currentTime - lastTime) / 1000;
    lastTime = currentTime;
    
    // Update game
    update(deltaTime);
    render();
    
    // Loop
    requestAnimationFrame(gameLoop);
}

// Start
requestAnimationFrame(gameLoop);
```

**Why delta time matters:**

```typescript
// WRONG: Assumes 60 FPS
function update() {
    player.x += player.velocityX;  // Moves 16.67ms worth
    // But what if frame takes 33ms? Movement is half speed!
}

// RIGHT: Frame-independent
function update(deltaTime: number) {
    player.x += player.velocityX * deltaTime;
    // Moves correct distance regardless of frame time
}
```

---

### Q12: How do I measure FPS?

**Short Answer:** Count frames per second.

**Complete Implementation:**

```typescript
class FPSCounter {
    private frames = 0;
    private lastTime = 0;
    private fps = 0;
    
    update(currentTime: number) {
        this.frames++;
        
        if (currentTime - this.lastTime >= 1000) {
            // One second passed
            this.fps = this.frames;
            this.frames = 0;
            this.lastTime = currentTime;
        }
    }
    
    getFPS(): number {
        return this.fps;
    }
    
    draw(ctx: CanvasRenderingContext2D) {
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, 60, 25);
        
        ctx.fillStyle = this.fps < 30 ? 'red' : 
                        this.fps < 50 ? 'yellow' : 'lime';
        ctx.font = '16px monospace';
        ctx.textBaseline = 'top';
        ctx.fillText(`FPS: ${this.fps}`, 5, 5);
    }
}

// Usage
const fpsCounter = new FPSCounter();

function gameLoop(time: number) {
    fpsCounter.update(time);
    
    // ... update and render ...
    
    fpsCounter.draw(ctx);  // Show FPS
    
    requestAnimationFrame(gameLoop);
}
```

---

## Images & Sprites

### Q13: What image formats should I use?

**Short Answer:**
- **PNG** for sprites with transparency
- **JPEG** for backgrounds/photos
- **WebP** for modern browsers (smaller files)

**Detailed Comparison:**

| Format | Transparency | File Size | Best For |
|--------|--------------|-----------|----------|
| PNG | ✓ Yes | Large | Sprites, UI, pixel art |
| JPEG | ✗ No | Small | Backgrounds, photos |
| WebP | ✓ Yes | Smallest | Everything (if supported) |
| GIF | ✓ Yes (binary) | Medium | Don't use (use PNG) |

**For Mario-style game:**

```typescript
// Player sprite (needs transparency)
const player = new Image();
player.src = 'assets/mario.png';  // PNG

// Background (no transparency needed)
const bg = new Image();
bg.src = 'assets/hills.jpg';  // JPEG

// Modern approach (with fallback)
const coin = new Image();
coin.src = 'assets/coin.webp';  // Try WebP first
coin.onerror = () => {
    coin.src = 'assets/coin.png';  // Fallback to PNG
};
```

---

### Q14: How do I create a sprite sheet?

**Short Answer:** Arrange sprites in a grid, draw portions.

**Example Sprite Sheet:**

```
┌─────────────────────────────┐
│ [idle] [walk1] [walk2] [jump] │  Frame size: 32×32
│ [duck] [slide] [die]  [...]  │  8 frames per row
└─────────────────────────────┘
Sheet size: 256×64 (8×2 frames)
```

**Drawing from sprite sheet:**

```typescript
function drawSprite(
    sheet: HTMLImageElement,
    frameX: number,      // Frame column (0, 1, 2...)
    frameY: number,      // Frame row (0, 1, 2...)
    frameWidth: number,  // Width of one frame
    frameHeight: number, // Height of one frame
    x: number,          // Draw position X
    y: number           // Draw position Y
) {
    ctx.drawImage(
        sheet,
        frameX * frameWidth,      // Source X
        frameY * frameHeight,     // Source Y
        frameWidth,               // Source width
        frameHeight,              // Source height
        x,                        // Dest X
        y,                        // Dest Y
        frameWidth,               // Dest width
        frameHeight               // Dest height
    );
}

// Usage
drawSprite(marioSheet, 0, 0, 32, 32, 100, 100);  // Idle
drawSprite(marioSheet, 1, 0, 32, 32, 100, 100);  // Walk frame 1
drawSprite(marioSheet, 2, 0, 32, 32, 100, 100);  // Walk frame 2
```

**Animation:**

```typescript
class Animator {
    private frame = 0;
    private timer = 0;
    
    constructor(
        private sheet: HTMLImageElement,
        private frameCount: number,
        private frameTime: number  // Seconds per frame
    ) {}
    
    update(deltaTime: number) {
        this.timer += deltaTime;
        
        if (this.timer >= this.frameTime) {
            this.frame = (this.frame + 1) % this.frameCount;
            this.timer = 0;
        }
    }
    
    draw(x: number, y: number) {
        drawSprite(this.sheet, this.frame, 0, 32, 32, x, y);
    }
}

// Usage
const walkAnimation = new Animator(marioSheet, 3, 0.1);  // 3 frames, 0.1s each

function gameLoop(deltaTime: number) {
    walkAnimation.update(deltaTime);
    walkAnimation.draw(player.x, player.y);
}
```

---

### Q15: Why is `drawImage` slow? How can I optimize it?

**Short Answer:** Minimize transformations and use sprite atlases.

**Common Causes of Slow `drawImage`:**

1. **Image smoothing on large images**
2. **Rotation/scaling every frame**
3. **Drawing many individual image files**
4. **Not caching transformed images**

**Optimization Techniques:**

```typescript
// 1. Disable smoothing for pixel art
ctx.imageSmoothingEnabled = false;

// 2. Pre-render rotated versions
const rotatedCache = new Map<number, HTMLCanvasElement>();

function getRotatedSprite(angle: number): HTMLCanvasElement {
    const key = Math.round(angle * 10);  // Cache every 0.1 radians
    
    if (!rotatedCache.has(key)) {
        const cache = document.createElement('canvas');
        const cacheCtx = cache.getContext('2d')!;
        
        cache.width = sprite.width;
        cache.height = sprite.height;
        
        cacheCtx.save();
        cacheCtx.translate(cache.width / 2, cache.height / 2);
        cacheCtx.rotate(angle);
        cacheCtx.drawImage(sprite, -sprite.width / 2, -sprite.height / 2);
        cacheCtx.restore();
        
        rotatedCache.set(key, cache);
    }
    
    return rotatedCache.get(key)!;
}

// 3. Use sprite atlas (single image)
// Load once, draw many times (faster than multiple images)

// 4. Batch draws without transform changes
sprites.forEach(s => {
    ctx.drawImage(s.img, s.x, s.y);  // No rotation
});
```

---

## Best Practices

### Q16: Should I use classes or functions for game objects?

**Short Answer:** Classes for entities, functions for utilities.

**Classes for Game Objects:**

```typescript
// Good for entities with state and behavior
class Player {
    x: number = 0;
    y: number = 0;
    velocityX: number = 0;
    velocityY: number = 0;
    
    update(deltaTime: number) {
        this.x += this.velocityX * deltaTime;
        this.y += this.velocityY * deltaTime;
    }
    
    draw(ctx: CanvasRenderingContext2D) {
        ctx.fillStyle = 'red';
        ctx.fillRect(this.x, this.y, 32, 32);
    }
    
    jump() {
        this.velocityY = -500;
    }
}
```

**Functions for Utilities:**

```typescript
// Good for stateless operations
function drawRect(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    color: string
) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, width, height);
}

function clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
}
```

**Hybrid Approach (Best):**

```typescript
// Classes for complex entities
class Enemy { ... }
class Player { ... }

// Functions for simple operations
function drawHealthBar(ctx, x, y, health, maxHealth) { ... }
function checkCollision(a, b) { ... }

// Composition over inheritance
class Player {
    private position = new Vector2(0, 0);
    private physics = new PhysicsComponent();
    private animator = new Animator();
    
    update(deltaTime: number) {
        this.physics.update(deltaTime);
        this.animator.update(deltaTime);
    }
}
```

---

### Q17: How should I organize my TypeScript files?

**Short Answer:** Separate by feature/responsibility.

**Good Structure:**

```
src/
├── main.ts                 # Entry point, game loop
├── engine/
│   ├── Canvas.ts          # Canvas setup utilities
│   ├── Input.ts           # Keyboard/mouse handling
│   ├── GameLoop.ts        # RAF loop, delta time
│   └── AssetLoader.ts     # Image loading
├── entities/
│   ├── Player.ts          # Player class
│   ├── Enemy.ts           # Enemy class
│   └── Coin.ts            # Collectible class
├── systems/
│   ├── PhysicsSystem.ts   # Gravity, velocity
│   ├── CollisionSystem.ts # Collision detection
│   └── RenderSystem.ts    # Drawing logic
├── utils/
│   ├── Vector2.ts         # 2D vector math
│   ├── AABB.ts            # Bounding box
│   └── math.ts            # Helper functions
└── types/
    └── index.ts           # TypeScript interfaces
```

**Example Files:**

```typescript
// types/index.ts
export interface GameObject {
    x: number;
    y: number;
    width: number;
    height: number;
    update(deltaTime: number): void;
    draw(ctx: CanvasRenderingContext2D): void;
}

export interface Vec2 {
    x: number;
    y: number;
}

// entities/Player.ts
import { GameObject, Vec2 } from '../types';

export class Player implements GameObject {
    // ...
}

// main.ts
import { Player } from './entities/Player';
import { setupCanvas } from './engine/Canvas';
import { GameLoop } from './engine/GameLoop';

const ctx = setupCanvas();
const player = new Player();
const loop = new GameLoop(ctx);

loop.start();
```

---

### Q18: What's the best way to handle multiple canvases?

**Short Answer:** Use layers for different update rates.

**Common Use Cases:**

1. **Static background** (updated rarely)
2. **Game world** (updated 60 FPS)
3. **UI layer** (updated when UI changes)

**Implementation:**

```html
<div id="game-container">
    <canvas id="bg-layer"></canvas>     <!-- Background -->
    <canvas id="game-layer"></canvas>   <!-- Game -->
    <canvas id="ui-layer"></canvas>     <!-- UI -->
</div>
```

```css
#game-container {
    position: relative;
    width: 800px;
    height: 600px;
}

#game-container canvas {
    position: absolute;
    top: 0;
    left: 0;
}
```

```typescript
const bgCanvas = document.getElementById('bg-layer') as HTMLCanvasElement;
const gameCanvas = document.getElementById('game-layer') as HTMLCanvasElement;
const uiCanvas = document.getElementById('ui-layer') as HTMLCanvasElement;

const bgCtx = bgCanvas.getContext('2d')!;
const gameCtx = gameCanvas.getContext('2d')!;
const uiCtx = uiCanvas.getContext('2d')!;

// Draw background once
drawBackground(bgCtx);

// Game loop only updates game layer
function gameLoop() {
    gameCtx.clearRect(0, 0, gameCanvas.width, gameCanvas.height);
    drawGame(gameCtx);
    
    requestAnimationFrame(gameLoop);
}

// Update UI only when needed
function updateScore(score: number) {
    uiCtx.clearRect(0, 0, uiCanvas.width, uiCanvas.height);
    uiCtx.fillText(`Score: ${score}`, 10, 30);
}
```

**Performance benefit:** Huge! Background drawn once instead of 60× per second.

---

### Q19: How do I make my canvas responsive?

**Short Answer:** Listen to resize, maintain aspect ratio.

**Complete Solution:**

```typescript
class ResponsiveCanvas {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private gameWidth = 800;
    private gameHeight = 600;
    private scale = 1;
    
    constructor(canvasId: string) {
        this.canvas = document.getElementById(canvasId) as HTMLCanvasElement;
        this.ctx = this.canvas.getContext('2d')!;
        
        window.addEventListener('resize', () => this.resize());
        this.resize();
    }
    
    private resize() {
        const aspectRatio = this.gameWidth / this.gameHeight;
        const windowRatio = window.innerWidth / window.innerHeight;
        
        if (windowRatio > aspectRatio) {
            // Window wider than game
            this.canvas.height = window.innerHeight;
            this.canvas.width = this.canvas.height * aspectRatio;
        } else {
            // Window taller than game
            this.canvas.width = window.innerWidth;
            this.canvas.height = this.canvas.width / aspectRatio;
        }
        
        // Calculate scale for mouse input
        this.scale = this.canvas.width / this.gameWidth;
        
        // Scale context to match
        this.ctx.setTransform(this.scale, 0, 0, this.scale, 0, 0);
    }
    
    // Convert mouse coords to game coords
    screenToGame(screenX: number, screenY: number) {
        const rect = this.canvas.getBoundingClientRect();
        return {
            x: (screenX - rect.left) / this.scale,
            y: (screenY - rect.top) / this.scale
        };
    }
}

// Usage
const canvas = new ResponsiveCanvas('game');

// Draw in game coordinates (always 800×600)
ctx.fillRect(0, 0, 100, 100);  // Same size regardless of window size
```

---

### Q20: Where can I learn more?

**Official Documentation:**
- [MDN Canvas Tutorial](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial) — Comprehensive guide
- [HTML5 Canvas Deep Dive](https://joshondesign.com/p/books/canvasdeepdive/title.html) — Free book
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html) — Learn TypeScript

**Game Development Resources:**
- [Game Programming Patterns](https://gameprogrammingpatterns.com/) — Free book on architecture
- [Coding Math](https://www.youtube.com/user/codingmath) — YouTube series on game math
- [Phaser](https://phaser.io/) — Study source code of production game engine

**Practice Projects:**
- Pong (movement, collision)
- Snake (grid, game loop)
- Flappy Bird (jumping, scrolling)
- Breakout (ball physics, brick collision)
- Platformer (this curriculum!)

**Communities:**
- [r/gamedev](https://reddit.com/r/gamedev) — Reddit community
- [HTML5 Game Devs](https://www.html5gamedevs.com/) — Forum
- [Game Dev Stack Exchange](https://gamedev.stackexchange.com/) — Q&A site

---

## Quick Reference

### Most Common Mistakes

1. ❌ Forgetting `beginPath()` before drawing paths
2. ❌ Drawing images before `onload`
3. ❌ Not using `save()` / `restore()` with transformations
4. ❌ Using `setInterval` instead of `requestAnimationFrame`
5. ❌ Hardcoding movement instead of using delta time
6. ❌ Not clearing canvas between frames
7. ❌ Setting image smoothing for pixel art
8. ❌ Drawing off-screen objects

### Must-Know Patterns

```typescript
// 1. Image loading
const img = new Image();
img.onload = () => { /* use image */ };
img.src = 'path.png';

// 2. Game loop
function loop(time) {
    const dt = (time - lastTime) / 1000;
    update(dt);
    render();
    requestAnimationFrame(loop);
}

// 3. Rotation
ctx.save();
ctx.translate(x, y);
ctx.rotate(angle);
drawSprite();
ctx.restore();

// 4. Collision detection
const collides = (a.x < b.x + b.w && a.x + a.w > b.x &&
                  a.y < b.y + b.h && a.y + a.h > b.y);
```

---

**You're ready to build!** 🎮

These are the questions we see most often. If yours wasn't answered, check the lesson (`a-lesson.md`), debugging guide (`i-debugging.md`), or ask in community forums!

**Next:** Move to Topic 02 (Game Loop & Timing) or practice exercises in `b-exercises.md`.
