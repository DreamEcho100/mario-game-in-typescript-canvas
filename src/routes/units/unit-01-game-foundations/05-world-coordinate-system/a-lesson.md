# World Coordinate System

**Unit 01: Game Foundations | Topic 05**

> Understanding screen space vs world space, camera systems, and viewport transformations.

---

## Introduction

In your first few canvas games, you probably drew everything relative to the canvas itself:

```typescript
// Player at canvas position (100, 100)
ctx.fillRect(100, 100, 32, 32);

// Coin at canvas position (300, 200)
ctx.fillRect(300, 200, 16, 16);
```

This works fine for small, single-screen games. But what happens when your world is larger than the screen? What if your Mario level is 10,000 pixels wide, but your canvas is only 800 pixels wide?

You need a **world coordinate system**.

---

## Screen Space vs World Space

### Screen Space (Canvas Coordinates)

**Screen space** is the coordinate system of your canvas. The origin `(0, 0)` is the top-left corner of the canvas, and coordinates are measured in pixels from there.

```
Canvas (800x600):
┌─────────────────────────┐ (800, 0)
│ (0,0)                   │
│                         │
│        Screen           │
│        Space            │
│                         │
│                         │
└─────────────────────────┘
(0, 600)         (800, 600)
```

**Properties:**
- Fixed size (canvas width × height)
- Always visible
- `(0, 0)` at top-left
- `(canvasWidth, canvasHeight)` at bottom-right

### World Space (Game Coordinates)

**World space** is the coordinate system of your game world. It can be much larger than the screen, and the camera determines which part is visible.

```
World (10000x600):
┌──────────────────────────────────────────────┐
│ (0,0)                                        │
│                                              │
│   ┌──────┐                                  │
│   │Screen│ ← Camera shows                   │
│   │ View │   this portion                   │
│   └──────┘                                  │
│                                              │
└──────────────────────────────────────────────┘
(0, 600)                          (10000, 600)
```

**Properties:**
- Can be any size
- Most of it is off-screen
- Entities have world positions
- Camera determines what's visible

---

## The Camera

The **camera** is the viewport that shows a portion of the world on screen.

### Camera Properties

```typescript
class Camera {
    x: number;      // Camera position in world space
    y: number;
    width: number;  // Viewport size (usually canvas size)
    height: number;
}
```

### Converting World to Screen

To draw an entity at world position `(worldX, worldY)` on screen:

```typescript
const screenX = worldX - camera.x;
const screenY = worldY - camera.y;

ctx.fillRect(screenX, screenY, 32, 32);
```

**Example:**

```typescript
// Entity at world position (1000, 200)
const player = {x: 1000, y: 200};

// Camera at world position (800, 0)
const camera = {x: 800, y: 0};

// Screen position:
const screenX = 1000 - 800; // 200
const screenY = 200 - 0;    // 200

// Player appears at screen (200, 200)
ctx.fillRect(200, 200, 32, 32);
```

### Camera Bounds

The camera should stay within the world:

```typescript
class Camera {
    x = 0;
    y = 0;
    width = 800;
    height = 600;
    worldWidth = 10000;
    worldHeight = 600;
    
    update() {
        // Clamp camera to world bounds
        this.x = Math.max(0, Math.min(this.x, this.worldWidth - this.width));
        this.y = Math.max(0, Math.min(this.y, this.worldHeight - this.height));
    }
}
```

---

## Camera Follow

The most common camera behavior is to follow the player.

### Basic Follow

```typescript
class Camera {
    x = 0;
    y = 0;
    width = 800;
    height = 600;
    
    follow(target: {x: number, y: number}) {
        // Center camera on target
        this.x = target.x - this.width / 2;
        this.y = target.y - this.height / 2;
    }
}

// Usage
gameLoop() {
    camera.follow(player);
    camera.update(); // Apply bounds
    
    // Draw world
    entities.forEach(entity => {
        const screenX = entity.x - camera.x;
        const screenY = entity.y - camera.y;
        ctx.fillRect(screenX, screenY, entity.width, entity.height);
    });
}
```

### Smooth Follow (Lerp)

Instant camera movement can be jarring. Use **linear interpolation** for smoothness:

```typescript
class Camera {
    x = 0;
    y = 0;
    
    follow(target: {x: number, y: number}, smoothness: number) {
        // Target position
        const targetX = target.x - this.width / 2;
        const targetY = target.y - this.height / 2;
        
        // Lerp toward target
        this.x += (targetX - this.x) * smoothness;
        this.y += (targetY - this.y) * smoothness;
    }
}

// Usage
camera.follow(player, 0.1); // 10% of the way each frame
```

**Smoothness values:**
- `1.0` = instant (no smoothing)
- `0.1` = smooth
- `0.05` = very smooth
- `0.01` = extremely smooth (might feel laggy)

### Deadzone Follow

Only move camera when player leaves a central "deadzone":

```typescript
class Camera {
    x = 0;
    y = 0;
    width = 800;
    height = 600;
    private readonly DEADZONE_WIDTH = 200;
    private readonly DEADZONE_HEIGHT = 100;
    
    follow(target: {x: number, y: number}) {
        // Calculate player position relative to camera
        const relativeX = target.x - this.x;
        const relativeY = target.y - this.y;
        
        // Deadzone boundaries
        const deadzoneLeft = this.width / 2 - this.DEADZONE_WIDTH / 2;
        const deadzoneRight = this.width / 2 + this.DEADZONE_WIDTH / 2;
        const deadzoneTop = this.height / 2 - this.DEADZONE_HEIGHT / 2;
        const deadzoneBottom = this.height / 2 + this.DEADZONE_HEIGHT / 2;
        
        // Move camera if player outside deadzone
        if (relativeX < deadzoneLeft) {
            this.x = target.x - deadzoneLeft;
        } else if (relativeX > deadzoneRight) {
            this.x = target.x - deadzoneRight;
        }
        
        if (relativeY < deadzoneTop) {
            this.y = target.y - deadzoneTop;
        } else if (relativeY > deadzoneBottom) {
            this.y = target.y - deadzoneBottom;
        }
    }
}
```

**Visualization:**

```
Screen:
┌────────────────────────┐
│                        │
│     ┌─────────┐        │
│     │Deadzone │        │
│     │   ⬤     │        │ ← Player in deadzone,
│     │         │        │   camera doesn't move
│     └─────────┘        │
│                        │
└────────────────────────┘
```

### Look-Ahead

Camera moves ahead of the player in the direction they're facing:

```typescript
class Camera {
    follow(target: {x: number, y: number, facingRight: boolean}) {
        const lookAheadDistance = 100;
        const lookAheadX = target.facingRight ? lookAheadDistance : -lookAheadDistance;
        
        const targetX = target.x + lookAheadX - this.width / 2;
        this.x += (targetX - this.x) * 0.1;
    }
}
```

---

## Viewport Culling

**Culling** means skipping entities that are off-screen. This improves performance.

### Basic Culling

```typescript
function isOnScreen(entity: Entity, camera: Camera): boolean {
    return entity.x + entity.width > camera.x &&
           entity.x < camera.x + camera.width &&
           entity.y + entity.height > camera.y &&
           entity.y < camera.y + camera.height;
}

// Usage
entities.forEach(entity => {
    if (isOnScreen(entity, camera)) {
        const screenX = entity.x - camera.x;
        const screenY = entity.y - camera.y;
        ctx.fillRect(screenX, screenY, entity.width, entity.height);
    }
});
```

### Margin Culling

Add a margin to keep entities slightly off-screen rendered (smooth entry):

```typescript
function isOnScreen(entity: Entity, camera: Camera, margin = 50): boolean {
    return entity.x + entity.width > camera.x - margin &&
           entity.x < camera.x + camera.width + margin &&
           entity.y + entity.height > camera.y - margin &&
           entity.y < camera.y + camera.height + margin;
}
```

---

## Canvas Translation

Instead of calculating screen coordinates for every entity, you can translate the entire canvas:

### Using ctx.translate()

```typescript
class Game {
    draw(ctx: CanvasRenderingContext2D, camera: Camera) {
        ctx.save();
        
        // Translate canvas so world origin is at screen origin
        ctx.translate(-camera.x, -camera.y);
        
        // Draw everything in world coordinates
        entities.forEach(entity => {
            ctx.fillRect(entity.x, entity.y, entity.width, entity.height);
        });
        
        ctx.restore();
    }
}
```

**Benefits:**
- Simpler code (no screen coordinate calculations)
- Draw everything in world coordinates
- Easier to reason about

**Caution:**
- UI elements need separate drawing (restore translation first)
- Debug info needs screen coordinates

### Layers

Draw world and UI in separate layers:

```typescript
draw(ctx: CanvasRenderingContext2D, camera: Camera) {
    // Layer 1: World (translated)
    ctx.save();
    ctx.translate(-camera.x, -camera.y);
    
    this.drawWorld(ctx);
    
    ctx.restore();
    
    // Layer 2: UI (not translated)
    this.drawUI(ctx);
}

private drawWorld(ctx: CanvasRenderingContext2D) {
    // Draw in world coordinates
    this.background.draw(ctx);
    this.entities.forEach(e => e.draw(ctx));
}

private drawUI(ctx: CanvasRenderingContext2D) {
    // Draw in screen coordinates
    ctx.fillStyle = 'white';
    ctx.font = '20px Arial';
    ctx.fillText(`Score: ${this.score}`, 20, 30);
}
```

---

## Parallax Scrolling

**Parallax** creates depth by moving background layers at different speeds than the foreground.

### Basic Parallax

```typescript
class Layer {
    image: HTMLImageElement;
    scrollSpeed: number; // 0.0 to 1.0
    
    constructor(image: HTMLImageElement, scrollSpeed: number) {
        this.image = image;
        this.scrollSpeed = scrollSpeed;
    }
    
    draw(ctx: CanvasRenderingContext2D, camera: Camera) {
        const offsetX = camera.x * this.scrollSpeed;
        const offsetY = camera.y * this.scrollSpeed;
        
        ctx.drawImage(this.image, -offsetX, -offsetY);
    }
}

// Setup
const layers = [
    new Layer(skyImage, 0.1),      // Far back (slow)
    new Layer(cloudsImage, 0.3),   // Middle
    new Layer(hillsImage, 0.6),    // Closer
    new Layer(treesImage, 0.9)     // Close (fast)
];

// Draw
layers.forEach(layer => layer.draw(ctx, camera));
```

**Speed guide:**
- `0.0` = doesn't move (fixed background)
- `0.5` = moves half as fast as camera
- `1.0` = moves with camera (foreground)

### Repeating Parallax

For seamless scrolling, repeat the background:

```typescript
class Layer {
    draw(ctx: CanvasRenderingContext2D, camera: Camera) {
        const offsetX = camera.x * this.scrollSpeed;
        const imageWidth = this.image.width;
        
        // Calculate how many times to draw
        const startTile = Math.floor(offsetX / imageWidth);
        const endTile = Math.ceil((offsetX + camera.width) / imageWidth);
        
        for (let i = startTile; i <= endTile; i++) {
            const x = i * imageWidth - offsetX;
            ctx.drawImage(this.image, x, 0);
        }
    }
}
```

---

## Camera Shake

Add juice to your game with camera shake on impacts:

```typescript
class Camera {
    x = 0;
    y = 0;
    private shakeAmount = 0;
    private shakeDecay = 0.9;
    
    shake(intensity: number) {
        this.shakeAmount = intensity;
    }
    
    update() {
        if (this.shakeAmount > 0) {
            // Random offset
            this.x += (Math.random() - 0.5) * this.shakeAmount;
            this.y += (Math.random() - 0.5) * this.shakeAmount;
            
            // Decay
            this.shakeAmount *= this.shakeDecay;
            
            if (this.shakeAmount < 0.1) {
                this.shakeAmount = 0;
            }
        }
    }
}

// Usage
if (playerHitByEnemy) {
    camera.shake(10); // Shake with intensity 10
}
```

---

## Camera Zones

Different areas can have different camera behaviors:

```typescript
interface CameraZone {
    x: number;
    y: number;
    width: number;
    height: number;
    lockX?: boolean;  // Don't scroll horizontally
    lockY?: boolean;  // Don't scroll vertically
    minX?: number;    // Bounds
    maxX?: number;
    minY?: number;
    maxY?: number;
}

class Camera {
    private currentZone: CameraZone | null = null;
    
    checkZones(zones: CameraZone[], player: {x: number, y: number}) {
        for (const zone of zones) {
            if (this.isInZone(player, zone)) {
                this.currentZone = zone;
                break;
            }
        }
    }
    
    follow(target: {x: number, y: number}) {
        if (!this.currentZone) {
            // Normal follow
            this.x = target.x - this.width / 2;
            return;
        }
        
        // Apply zone constraints
        if (!this.currentZone.lockX) {
            this.x = target.x - this.width / 2;
        }
        
        if (!this.currentZone.lockY) {
            this.y = target.y - this.height / 2;
        }
        
        // Apply zone bounds
        if (this.currentZone.minX !== undefined) {
            this.x = Math.max(this.x, this.currentZone.minX);
        }
        if (this.currentZone.maxX !== undefined) {
            this.x = Math.min(this.x, this.currentZone.maxX);
        }
    }
    
    private isInZone(point: {x: number, y: number}, zone: CameraZone): boolean {
        return point.x >= zone.x &&
               point.x < zone.x + zone.width &&
               point.y >= zone.y &&
               point.y < zone.y + zone.height;
    }
}
```

---

## Complete Example: Mario World System

```typescript
class Camera {
    x = 0;
    y = 0;
    width = 800;
    height = 600;
    worldWidth = 10000;
    worldHeight = 600;
    
    private shakeAmount = 0;
    
    follow(target: {x: number, y: number}, deltaTime: number) {
        // Smooth follow
        const targetX = target.x - this.width / 2;
        const targetY = target.y - this.height / 2;
        
        const smoothness = 1 - Math.pow(0.001, deltaTime);
        this.x += (targetX - this.x) * smoothness;
        this.y += (targetY - this.y) * smoothness;
        
        // Apply shake
        if (this.shakeAmount > 0) {
            this.x += (Math.random() - 0.5) * this.shakeAmount;
            this.y += (Math.random() - 0.5) * this.shakeAmount;
            this.shakeAmount *= 0.9;
            
            if (this.shakeAmount < 0.1) {
                this.shakeAmount = 0;
            }
        }
        
        // Clamp to world bounds
        this.x = Math.max(0, Math.min(this.x, this.worldWidth - this.width));
        this.y = Math.max(0, Math.min(this.y, this.worldHeight - this.height));
    }
    
    shake(intensity: number) {
        this.shakeAmount = intensity;
    }
    
    worldToScreen(worldX: number, worldY: number): {x: number, y: number} {
        return {
            x: worldX - this.x,
            y: worldY - this.y
        };
    }
    
    screenToWorld(screenX: number, screenY: number): {x: number, y: number} {
        return {
            x: screenX + this.x,
            y: screenY + this.y
        };
    }
    
    isOnScreen(x: number, y: number, width: number, height: number, margin = 50): boolean {
        return x + width > this.x - margin &&
               x < this.x + this.width + margin &&
               y + height > this.y - margin &&
               y < this.y + this.height + margin;
    }
}

class Layer {
    image: HTMLImageElement;
    scrollSpeed: number;
    
    constructor(image: HTMLImageElement, scrollSpeed: number) {
        this.image = image;
        this.scrollSpeed = scrollSpeed;
    }
    
    draw(ctx: CanvasRenderingContext2D, camera: Camera) {
        const offsetX = camera.x * this.scrollSpeed;
        const imageWidth = this.image.width;
        
        const startTile = Math.floor(offsetX / imageWidth);
        const endTile = Math.ceil((offsetX + camera.width) / imageWidth);
        
        for (let i = startTile; i <= endTile; i++) {
            const x = i * imageWidth - offsetX;
            ctx.drawImage(this.image, x, 0);
        }
    }
}

class Game {
    private camera: Camera;
    private layers: Layer[];
    private entities: Entity[];
    
    constructor(canvas: HTMLCanvasElement) {
        this.camera = new Camera();
        this.camera.width = canvas.width;
        this.camera.height = canvas.height;
        
        this.layers = [
            new Layer(skyImage, 0.0),    // Fixed
            new Layer(cloudsImage, 0.2), // Slow
            new Layer(hillsImage, 0.5),  // Medium
            new Layer(treesImage, 0.8)   // Fast
        ];
        
        this.entities = [];
    }
    
    update(deltaTime: number) {
        // Update entities
        this.entities.forEach(e => e.update(deltaTime));
        
        // Camera follows player
        const player = this.entities.find(e => e.type === 'player');
        if (player) {
            this.camera.follow(player, deltaTime);
        }
    }
    
    draw(ctx: CanvasRenderingContext2D) {
        // Clear
        ctx.fillStyle = '#5c94fc';
        ctx.fillRect(0, 0, this.camera.width, this.camera.height);
        
        // Parallax layers
        this.layers.forEach(layer => layer.draw(ctx, this.camera));
        
        // World entities (translated)
        ctx.save();
        ctx.translate(-this.camera.x, -this.camera.y);
        
        this.entities.forEach(entity => {
            // Cull off-screen entities
            if (this.camera.isOnScreen(entity.x, entity.y, entity.width, entity.height)) {
                entity.draw(ctx);
            }
        });
        
        ctx.restore();
        
        // UI (not translated)
        this.drawUI(ctx);
    }
    
    private drawUI(ctx: CanvasRenderingContext2D) {
        ctx.fillStyle = 'white';
        ctx.font = '20px Arial';
        ctx.fillText(`Score: ${this.score}`, 20, 30);
        ctx.fillText(`Coins: ${this.coins}`, 20, 55);
    }
}
```

---

## Best Practices

### ✅ Do

```typescript
// Use world coordinates for entities
entity.x = 1000; // World position
entity.y = 200;

// Use camera for rendering
const screenX = entity.x - camera.x;
const screenY = entity.y - camera.y;

// Or use ctx.translate()
ctx.save();
ctx.translate(-camera.x, -camera.y);
// Draw in world coordinates
ctx.restore();

// Cull off-screen entities
if (camera.isOnScreen(entity)) {
    entity.draw(ctx);
}

// Smooth camera movement
camera.x += (targetX - camera.x) * 0.1;

// Clamp camera to world
camera.x = Math.max(0, Math.min(camera.x, worldWidth - camera.width));
```

### ❌ Don't

```typescript
// Don't mix screen and world coordinates
entity.screenX = 100; // ❌ Confusing

// Don't forget to cull
entities.forEach(e => e.draw(ctx)); // ❌ Draws all entities

// Don't forget to clamp camera
// (Camera can go outside world) ❌

// Don't use instant camera movement
camera.x = player.x; // ❌ Jarring

// Don't forget to restore canvas state
ctx.translate(-camera.x, -camera.y);
// ... draw world
// Missing ctx.restore() ❌
```

---

## Common Pitfalls

### 1. Forgetting Camera Translation

```typescript
// ❌ Wrong
draw(ctx: CanvasRenderingContext2D) {
    this.entities.forEach(entity => {
        ctx.fillRect(entity.x, entity.y, 32, 32); // World coords!
    });
}

// ✅ Fixed
draw(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.translate(-this.camera.x, -this.camera.y);
    
    this.entities.forEach(entity => {
        ctx.fillRect(entity.x, entity.y, 32, 32);
    });
    
    ctx.restore();
}
```

### 2. UI Affected by Camera

```typescript
// ❌ Wrong
draw(ctx: CanvasRenderingContext2D) {
    ctx.translate(-camera.x, -camera.y);
    
    // World
    entities.forEach(e => e.draw(ctx));
    
    // UI also translated! ❌
    ctx.fillText('Score: 100', 20, 30);
}

// ✅ Fixed
draw(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.translate(-camera.x, -camera.y);
    entities.forEach(e => e.draw(ctx));
    ctx.restore();
    
    // UI not translated ✅
    ctx.fillText('Score: 100', 20, 30);
}
```

### 3. Camera Going Outside World

```typescript
// ❌ Wrong
camera.x = player.x - camera.width / 2;
// Camera can show beyond world edges!

// ✅ Fixed
camera.x = player.x - camera.width / 2;
camera.x = Math.max(0, Math.min(camera.x, worldWidth - camera.width));
```

### 4. Not Culling

```typescript
// ❌ Slow
entities.forEach(entity => {
    entity.update(deltaTime);  // Updates all
    entity.draw(ctx);          // Draws all
});

// ✅ Fast
entities.forEach(entity => {
    // Update entities near camera
    if (camera.isNear(entity, 200)) {
        entity.update(deltaTime);
    }
    
    // Draw only visible entities
    if (camera.isOnScreen(entity)) {
        entity.draw(ctx);
    }
});
```

---

## Formulas Quick Reference

### World to Screen

```typescript
screenX = worldX - camera.x
screenY = worldY - camera.y
```

### Screen to World

```typescript
worldX = screenX + camera.x
worldY = screenY + camera.y
```

### Lerp (Smooth Movement)

```typescript
current += (target - current) * smoothness
// smoothness: 0.0 (no movement) to 1.0 (instant)
```

### On-Screen Check

```typescript
isVisible =
    entityX + entityWidth > cameraX &&
    entityX < cameraX + cameraWidth &&
    entityY + entityHeight > cameraY &&
    entityY < cameraY + cameraHeight
```

### Camera Bounds

```typescript
camera.x = Math.max(0, Math.min(camera.x, worldWidth - cameraWidth))
camera.y = Math.max(0, Math.min(camera.y, worldHeight - cameraHeight))
```

### Parallax Offset

```typescript
layerOffset = camera.position * layer.scrollSpeed
// scrollSpeed: 0.0 (fixed) to 1.0 (foreground)
```

---

## Next Steps

Now that you understand coordinates and camera:
1. Build a side-scrolling level
2. Implement smooth camera follow
3. Add parallax backgrounds
4. Experiment with camera zones
5. Try different follow modes (deadzone, look-ahead)

---

**Next:** Practice with exercises! 🎮