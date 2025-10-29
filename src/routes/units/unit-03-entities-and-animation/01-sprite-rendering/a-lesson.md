# Sprite Rendering

**Unit 03: Entities, Animations & Sprites | Topic 01 of 03**

> **Learning Objective:** Master sprite rendering with sprite sheets, sprite atlases, and efficient drawing techniques to bring your game to life with pixel art characters.

---

## Building on Previous Units

Before we dive into sprites, let's connect to what you know:

### From Unit 01-01: Canvas Rendering
You learned `drawImage()` for rendering images:
```typescript
ctx.drawImage(image, x, y, width, height);
```

**Now:** You'll use `drawImage()` with **9 parameters** to extract sprites from sprite sheets!

### From Unit 02-01: Velocity & Movement
Your entities have position and velocity:
```typescript
entity.x += entity.velocityX * deltaTime;
```

**Now:** Those entities will be drawn as sprites instead of colored rectangles!

### The Transformation
**Before (Unit 01-02):**
```typescript
// Drew colored rectangle
ctx.fillStyle = 'red';
ctx.fillRect(player.x, player.y, 32, 48);
```

**After (This Lesson):**
```typescript
// Draw actual sprite!
ctx.drawImage(
    spriteSheet,
    frameX, frameY, frameWidth, frameHeight, // Source on sprite sheet
    player.x, player.y, 32, 48                // Destination on canvas
);
```

**Ready to make your game look professional? Let's go!** 🎨

---

## Table of Contents

1. [What are Sprites?](#what-are-sprites)
2. [Loading Sprite Sheets](#loading-sprite-sheets)
3. [Drawing Single Sprites](#drawing-single-sprites)
4. [Sprite Sheet Extraction](#sprite-sheet-extraction)
5. [Sprite Atlas Systems](#sprite-atlas-systems)
6. [Flipping and Transformations](#flipping-and-transformations)
7. [Performance Optimization](#performance-optimization)
8. [Application to Mario](#application-to-mario)
9. [Summary](#summary)

---

## What are Sprites?

**Sprites** are 2D images or animations representing game objects (characters, items, enemies).

### Types of Sprite Assets

**1. Individual Sprite Files**
```
player-idle.png
player-walk-1.png
player-walk-2.png
player-jump.png
```
- Each frame is separate file
- Easy to manage
- Slow to load (many HTTP requests)
- ❌ Not recommended for web games

**2. Sprite Sheets**
```
[player-spritesheet.png]
+-----+-----+-----+-----+
| idle| walk| walk| jump|
|  1  |  1  |  2  |     |
+-----+-----+-----+-----+
```
- All frames in one image
- Fast to load (one HTTP request)
- Memory efficient
- ✅ Industry standard

**3. Sprite Atlas (with JSON)**
```json
{
    "player-idle": { "x": 0, "y": 0, "w": 32, "h": 48 },
    "player-walk-1": { "x": 32, "y": 0, "w": 32, "h": 48 }
}
```
- Sprite sheet + metadata file
- Supports variable sizes
- Used by professional tools (Texture Packer)
- ✅ Best for complex games

---

## Loading Sprite Sheets

### Basic Image Loading

```typescript
class SpriteLoader {
    static async load(src: string): Promise<HTMLImageElement> {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = () => reject(new Error(`Failed to load: ${src}`));
            img.src = src;
        });
    }
}

// Usage
const marioSheet = await SpriteLoader.load('assets/mario-sheet.png');
```

### Preloading Multiple Sprites

```typescript
class AssetManager {
    private images = new Map<string, HTMLImageElement>();
    
    async loadAll(assets: { name: string; src: string }[]): Promise<void> {
        const promises = assets.map(async (asset) => {
            const img = await SpriteLoader.load(asset.src);
            this.images.set(asset.name, img);
        });
        
        await Promise.all(promises);
    }
    
    get(name: string): HTMLImageElement | undefined {
        return this.images.get(name);
    }
}

// Usage
const assets = new AssetManager();
await assets.loadAll([
    { name: 'mario', src: 'assets/mario.png' },
    { name: 'enemies', src: 'assets/enemies.png' },
    { name: 'tiles', src: 'assets/tiles.png' }
]);
```

---

## Drawing Single Sprites

### Simple Sprite Drawing

```typescript
const sprite = await SpriteLoader.load('mario-idle.png');

function render() {
    // Draw sprite at position (100, 200)
    ctx.drawImage(sprite, 100, 200);
}
```

### Sprite with Scaling

```typescript
// Draw sprite scaled to 32x48 pixels
ctx.drawImage(
    sprite,
    x, y,        // Position
    32, 48       // Size
);
```

### Disable Image Smoothing (Pixel Art)

```typescript
// CRITICAL for pixel art games!
ctx.imageSmoothingEnabled = false;

// Draw sprite - will stay crisp and pixelated
ctx.drawImage(sprite, x, y, 64, 96); // 2x scale
```

---

## Sprite Sheet Extraction

### The 9-Parameter drawImage()

```typescript
ctx.drawImage(
    image,
    sourceX, sourceY, sourceWidth, sourceHeight,     // Where to cut from sheet
    destX, destY, destWidth, destHeight               // Where to draw on canvas
);
```

### Example: Extracting from Sprite Sheet

```
Sprite Sheet (128x48):
+-------+-------+-------+-------+
| Frame | Frame | Frame | Frame |
|   0   |   1   |   2   |   3   |
| 32x48 | 32x48 | 32x48 | 32x48 |
+-------+-------+-------+-------+
```

```typescript
const spriteSheet = await SpriteLoader.load('mario-walk.png');

// Draw frame 2
ctx.drawImage(
    spriteSheet,
    64, 0, 32, 48,    // Extract from (64, 0), size 32x48
    playerX, playerY, 32, 48  // Draw at player position
);
```

### Sprite Class

```typescript
class Sprite {
    constructor(
        public image: HTMLImageElement,
        public frameX: number,
        public frameY: number,
        public frameWidth: number,
        public frameHeight: number
    ) {}
    
    draw(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number): void {
        ctx.drawImage(
            this.image,
            this.frameX, this.frameY, this.frameWidth, this.frameHeight,
            x, y, width, height
        );
    }
}

// Usage
const marioIdle = new Sprite(spriteSheet, 0, 0, 32, 48);
marioIdle.draw(ctx, player.x, player.y, 32, 48);
```

---

## Sprite Atlas Systems

### JSON Sprite Atlas Format

```json
{
    "frames": {
        "mario-idle": {
            "frame": { "x": 0, "y": 0, "w": 32, "h": 48 },
            "sourceSize": { "w": 32, "h": 48 }
        },
        "mario-walk-1": {
            "frame": { "x": 32, "y": 0, "w": 32, "h": 48 },
            "sourceSize": { "w": 32, "h": 48 }
        }
    }
}
```

### Atlas Loader

```typescript
interface AtlasFrame {
    x: number;
    y: number;
    w: number;
    h: number;
}

interface Atlas {
    frames: { [key: string]: { frame: AtlasFrame } };
}

class SpriteAtlas {
    constructor(
        private image: HTMLImageElement,
        private atlas: Atlas
    ) {}
    
    static async load(imageSrc: string, jsonSrc: string): Promise<SpriteAtlas> {
        const [image, response] = await Promise.all([
            SpriteLoader.load(imageSrc),
            fetch(jsonSrc)
        ]);
        
        const atlas: Atlas = await response.json();
        return new SpriteAtlas(image, atlas);
    }
    
    getSprite(name: string): Sprite | null {
        const frameData = this.atlas.frames[name];
        if (!frameData) return null;
        
        const { x, y, w, h } = frameData.frame;
        return new Sprite(this.image, x, y, w, h);
    }
}

// Usage
const marioAtlas = await SpriteAtlas.load('mario.png', 'mario.json');
const idleSprite = marioAtlas.getSprite('mario-idle');
idleSprite?.draw(ctx, player.x, player.y, 32, 48);
```

---

## Flipping and Transformations

### Horizontal Flip (Facing Direction)

```typescript
function drawSpriteFlipped(
    ctx: CanvasRenderingContext2D,
    sprite: Sprite,
    x: number,
    y: number,
    width: number,
    height: number,
    flipH: boolean
): void {
    ctx.save();
    
    if (flipH) {
        ctx.translate(x + width, y);
        ctx.scale(-1, 1);
        sprite.draw(ctx, 0, 0, width, height);
    } else {
        sprite.draw(ctx, x, y, width, height);
    }
    
    ctx.restore();
}

// Usage
drawSpriteFlipped(ctx, marioWalk, player.x, player.y, 32, 48, player.facingLeft);
```

### Rotation

```typescript
function drawSpriteRotated(
    ctx: CanvasRenderingContext2D,
    sprite: Sprite,
    x: number,
    y: number,
    width: number,
    height: number,
    angle: number // radians
): void {
    ctx.save();
    
    // Move to center of sprite
    ctx.translate(x + width / 2, y + height / 2);
    ctx.rotate(angle);
    
    // Draw from center
    sprite.draw(ctx, -width / 2, -height / 2, width, height);
    
    ctx.restore();
}
```

---

## Performance Optimization

### 1. Disable Image Smoothing Once

```typescript
// Do this ONCE at startup
ctx.imageSmoothingEnabled = false;
```

### 2. Cache Sprite Objects

```typescript
// ❌ BAD: Creates new Sprite every frame
function render() {
    const sprite = new Sprite(sheet, 0, 0, 32, 48);
    sprite.draw(ctx, x, y, 32, 48);
}

// ✅ GOOD: Reuse sprite object
const sprite = new Sprite(sheet, 0, 0, 32, 48);
function render() {
    sprite.draw(ctx, x, y, 32, 48);
}
```

### 3. Batch Draws by Texture

```typescript
// ✅ GOOD: Draw all sprites from same sheet together
function render() {
    // All mario sprites
    drawMario();
    drawMarioPowerups();
    
    // All enemy sprites (different sheet)
    drawGoombas();
    drawKoopas();
}
```

### 4. Offscreen Culling

```typescript
function shouldDraw(entity: Entity, camera: Camera): boolean {
    return entity.x + entity.width > camera.x &&
           entity.x < camera.x + camera.width &&
           entity.y + entity.height > camera.y &&
           entity.y < camera.y + camera.height;
}

// Only draw visible entities
entities.forEach(entity => {
    if (shouldDraw(entity, camera)) {
        entity.sprite.draw(ctx, entity.x - camera.x, entity.y - camera.y, 32, 48);
    }
});
```

---

## Application to Mario

### Complete Mario Sprite System

```typescript
class MarioSprites {
    private atlas: SpriteAtlas;
    private sprites: Map<string, Sprite> = new Map();
    
    async load(): Promise<void> {
        this.atlas = await SpriteAtlas.load(
            'assets/mario-sheet.png',
            'assets/mario-sheet.json'
        );
        
        // Cache commonly used sprites
        this.sprites.set('idle', this.atlas.getSprite('mario-idle')!);
        this.sprites.set('walk-1', this.atlas.getSprite('mario-walk-1')!);
        this.sprites.set('walk-2', this.atlas.getSprite('mario-walk-2')!);
        this.sprites.set('walk-3', this.atlas.getSprite('mario-walk-3')!);
        this.sprites.set('jump', this.atlas.getSprite('mario-jump')!);
    }
    
    get(name: string): Sprite | undefined {
        return this.sprites.get(name);
    }
}

class Mario {
    x = 100;
    y = 400;
    facingRight = true;
    currentSprite = 'idle';
    
    constructor(private sprites: MarioSprites) {}
    
    draw(ctx: CanvasRenderingContext2D, camera: Camera): void {
        const sprite = this.sprites.get(this.currentSprite);
        if (!sprite) return;
        
        const screenX = this.x - camera.x;
        const screenY = this.y - camera.y;
        
        drawSpriteFlipped(
            ctx, sprite,
            screenX, screenY, 32, 48,
            !this.facingRight
        );
    }
}
```

---

## Summary

### What You've Learned

✅ **Sprite Fundamentals**
- Individual files vs sprite sheets vs atlases
- When to use each format

✅ **Loading Sprites**
- Async image loading with Promises
- Asset manager for multiple sprites

✅ **Drawing Sprites**
- Simple drawImage() with 3 parameters
- Sprite sheet extraction with 9 parameters
- Sprite and SpriteAtlas classes

✅ **Transformations**
- Horizontal flipping for facing direction
- Rotation for spinning objects

✅ **Performance**
- Disable image smoothing for pixel art
- Cache sprite objects
- Batch draws by texture
- Offscreen culling

✅ **Mario Implementation**
- Complete sprite system
- Atlas-based loading
- Camera-aware rendering

### Key Takeaways

1. **Use sprite sheets** for web games (faster loading)
2. **Disable image smoothing** for pixel art
3. **Cache sprite objects** - don't create every frame
4. **9-parameter drawImage()** extracts from sprite sheets
5. **Flip with scale(-1, 1)** for facing direction
6. **Cull offscreen sprites** for performance

---

## Looking Ahead to Topic 02

You can now draw sprites! **Next, you'll animate them:**

```typescript
// Topic 01 (NOW): Static sprite
sprite.draw(ctx, x, y, 32, 48);

// Topic 02 (NEXT): Animated sprite!
animation.update(deltaTime);  // Changes current frame
animation.draw(ctx, x, y, 32, 48);  // Draws correct frame
```

**Preview:**
- Frame-based animation
- Animation state machines
- Blending between animations
- Animation events

---

## Further Reading

- [MDN: Drawing images](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Using_images)
- [Texture Packer](https://www.codeandweb.com/texturepacker) - Professional sprite atlas tool
- [Aseprite](https://www.aseprite.org/) - Pixel art editor with export to sprite sheets
- [Piskel](https://www.piskelapp.com/) - Free online pixel art tool

**Next:** Complete exercises in `b-exercises.md`!
