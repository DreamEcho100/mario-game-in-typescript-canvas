# World Coordinate System - Quick Reference

**Unit 01: Game Foundations | Topic 05**

> Copy-paste ready camera and coordinate patterns.

---

## Basic Camera Class

```typescript
class Camera {
    x = 0;
    y = 0;
    width = 800;
    height = 600;
    worldWidth = 3000;
    worldHeight = 600;
    
    // Center on target
    centerOn(target: {x: number, y: number}) {
        this.x = target.x - this.width / 2;
        this.y = target.y - this.height / 2;
        this.clamp();
    }
    
    // Clamp to world
    clamp() {
        this.x = Math.max(0, Math.min(this.x, this.worldWidth - this.width));
        this.y = Math.max(0, Math.min(this.y, this.worldHeight - this.height));
    }
    
    // Coordinate conversion
    worldToScreen(worldX: number, worldY: number) {
        return {
            x: worldX - this.x,
            y: worldY - this.y
        };
    }
    
    screenToWorld(screenX: number, screenY: number) {
        return {
            x: screenX + this.x,
            y: screenY + this.y
        };
    }
    
    // Culling
    isOnScreen(x: number, y: number, width: number, height: number, margin = 0) {
        return x + width > this.x - margin &&
               x < this.x + this.width + margin &&
               y + height > this.y - margin &&
               y < this.y + this.height + margin;
    }
}
```

---

## Smooth Camera Follow

```typescript
class SmoothCamera extends Camera {
    smoothness = 0.1;
    
    follow(target: {x: number, y: number}) {
        // Target position
        const targetX = target.x - this.width / 2;
        const targetY = target.y - this.height / 2;
        
        // Lerp toward target
        this.x += (targetX - this.x) * this.smoothness;
        this.y += (targetY - this.y) * this.smoothness;
        
        this.clamp();
    }
}

// Usage
const camera = new SmoothCamera();
camera.smoothness = 0.1; // 0.01 = very smooth, 1.0 = instant

gameLoop() {
    camera.follow(player);
    draw();
}
```

---

## Deadzone Camera

```typescript
class DeadzoneCamera extends Camera {
    deadzoneWidth = 200;
    deadzoneHeight = 100;
    
    follow(target: {x: number, y: number}) {
        const relativeX = target.x - this.x;
        const relativeY = target.y - this.y;
        
        const deadzoneLeft = this.width / 2 - this.deadzoneWidth / 2;
        const deadzoneRight = this.width / 2 + this.deadzoneWidth / 2;
        const deadzoneTop = this.height / 2 - this.deadzoneHeight / 2;
        const deadzoneBottom = this.height / 2 + this.deadzoneHeight / 2;
        
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
        
        this.clamp();
    }
}
```

---

## Look-Ahead Camera

```typescript
class LookAheadCamera extends Camera {
    lookAheadDistance = 150;
    smoothness = 0.1;
    
    follow(target: {x: number, y: number, facingRight: boolean}) {
        const lookAheadX = target.facingRight ? 
            this.lookAheadDistance : 
            -this.lookAheadDistance;
        
        const targetX = target.x + lookAheadX - this.width / 2;
        const targetY = target.y - this.height / 2;
        
        this.x += (targetX - this.x) * this.smoothness;
        this.y += (targetY - this.y) * this.smoothness;
        
        this.clamp();
    }
}
```

---

## Camera Shake

```typescript
class ShakeyCamera extends Camera {
    private shakeAmount = 0;
    private shakeDecay = 0.9;
    
    shake(intensity: number) {
        this.shakeAmount += intensity;
    }
    
    update() {
        if (this.shakeAmount > 0) {
            // Add random offset
            const offsetX = (Math.random() - 0.5) * this.shakeAmount;
            const offsetY = (Math.random() - 0.5) * this.shakeAmount;
            
            this.x += offsetX;
            this.y += offsetY;
            
            // Decay
            this.shakeAmount *= this.shakeDecay;
            
            if (this.shakeAmount < 0.1) {
                this.shakeAmount = 0;
            }
        }
    }
}

// Usage
if (playerHit) {
    camera.shake(10);
}
```

---

## Drawing with Camera

### Option 1: Manual Coordinates

```typescript
function draw(ctx: CanvasRenderingContext2D, camera: Camera) {
    entities.forEach(entity => {
        if (camera.isOnScreen(entity.x, entity.y, entity.width, entity.height)) {
            const screenX = entity.x - camera.x;
            const screenY = entity.y - camera.y;
            ctx.fillRect(screenX, screenY, entity.width, entity.height);
        }
    });
}
```

### Option 2: Canvas Translation (Recommended)

```typescript
function draw(ctx: CanvasRenderingContext2D, camera: Camera) {
    // World layer
    ctx.save();
    ctx.translate(-camera.x, -camera.y);
    
    entities.forEach(entity => {
        if (camera.isOnScreen(entity.x, entity.y, entity.width, entity.height)) {
            ctx.fillRect(entity.x, entity.y, entity.width, entity.height);
        }
    });
    
    ctx.restore();
    
    // UI layer (not translated)
    ctx.fillStyle = 'white';
    ctx.fillText('Score: 100', 20, 30);
}
```

---

## Parallax Scrolling

```typescript
class ParallaxLayer {
    image: HTMLImageElement;
    scrollSpeed: number;
    
    constructor(image: HTMLImageElement, scrollSpeed: number) {
        this.image = image;
        this.scrollSpeed = scrollSpeed;
    }
    
    draw(ctx: CanvasRenderingContext2D, camera: Camera) {
        const offsetX = camera.x * this.scrollSpeed;
        const imageWidth = this.image.width;
        
        // Calculate tiles needed
        const startTile = Math.floor(offsetX / imageWidth);
        const endTile = Math.ceil((offsetX + camera.width) / imageWidth);
        
        // Draw tiles
        for (let i = startTile; i <= endTile; i++) {
            const x = i * imageWidth - offsetX;
            ctx.drawImage(this.image, x, 0);
        }
    }
}

// Setup
const layers = [
    new ParallaxLayer(skyImage, 0.0),    // Fixed
    new ParallaxLayer(cloudsImage, 0.2), // Slow
    new ParallaxLayer(hillsImage, 0.5),  // Medium
    new ParallaxLayer(treesImage, 0.8)   // Fast
];

// Draw
layers.forEach(layer => layer.draw(ctx, camera));
```

---

## Camera Zones

```typescript
interface CameraZone {
    x: number;
    y: number;
    width: number;
    height: number;
    lockX?: boolean;
    lockY?: boolean;
}

class ZonedCamera extends Camera {
    private zones: CameraZone[] = [];
    private currentZone: CameraZone | null = null;
    
    addZone(zone: CameraZone) {
        this.zones.push(zone);
    }
    
    follow(target: {x: number, y: number}) {
        // Find current zone
        for (const zone of this.zones) {
            if (this.isInZone(target, zone)) {
                this.currentZone = zone;
                break;
            }
        }
        
        if (!this.currentZone) {
            // Normal follow
            this.x = target.x - this.width / 2;
            this.y = target.y - this.height / 2;
        } else {
            // Apply zone constraints
            if (!this.currentZone.lockX) {
                this.x = target.x - this.width / 2;
            }
            if (!this.currentZone.lockY) {
                this.y = target.y - this.height / 2;
            }
        }
        
        this.clamp();
    }
    
    private isInZone(point: {x: number, y: number}, zone: CameraZone) {
        return point.x >= zone.x &&
               point.x < zone.x + zone.width &&
               point.y >= zone.y &&
               point.y < zone.y + zone.height;
    }
}

// Usage
camera.addZone({x: 0, y: 0, width: 1000, height: 600, lockY: true});
camera.addZone({x: 1000, y: 0, width: 500, height: 600, lockX: true, lockY: true});
```

---

## Minimap

```typescript
class Minimap {
    x = 10;
    y = 10;
    width = 150;
    height = 100;
    
    draw(ctx: CanvasRenderingContext2D, camera: Camera, world: {width: number, height: number}, player: {x: number, y: number}) {
        // Background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        ctx.strokeStyle = 'white';
        ctx.strokeRect(this.x, this.y, this.width, this.height);
        
        // Camera viewport
        const viewportX = this.x + (camera.x / world.width) * this.width;
        const viewportY = this.y + (camera.y / world.height) * this.height;
        const viewportW = (camera.width / world.width) * this.width;
        const viewportH = (camera.height / world.height) * this.height;
        
        ctx.strokeStyle = 'yellow';
        ctx.lineWidth = 2;
        ctx.strokeRect(viewportX, viewportY, viewportW, viewportH);
        
        // Player position
        const playerX = this.x + (player.x / world.width) * this.width;
        const playerY = this.y + (player.y / world.height) * this.height;
        
        ctx.fillStyle = 'red';
        ctx.beginPath();
        ctx.arc(playerX, playerY, 3, 0, Math.PI * 2);
        ctx.fill();
    }
    
    screenToWorld(screenX: number, screenY: number, world: {width: number, height: number}): {x: number, y: number} | null {
        // Check if click is on minimap
        if (screenX < this.x || screenX > this.x + this.width ||
            screenY < this.y || screenY > this.y + this.height) {
            return null;
        }
        
        // Convert to world coordinates
        const relativeX = (screenX - this.x) / this.width;
        const relativeY = (screenY - this.y) / this.height;
        
        return {
            x: relativeX * world.width,
            y: relativeY * world.height
        };
    }
}
```

---

## Complete Game Example

```typescript
class Game {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private camera: Camera;
    private player: Player;
    private entities: Entity[] = [];
    private layers: ParallaxLayer[] = [];
    
    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d')!;
        
        this.camera = new Camera();
        this.camera.width = canvas.width;
        this.camera.height = canvas.height;
        this.camera.worldWidth = 5000;
        this.camera.worldHeight = 600;
        
        this.player = new Player(400, 300);
        
        // Setup parallax
        this.layers = [
            new ParallaxLayer(skyImage, 0.0),
            new ParallaxLayer(cloudsImage, 0.3),
            new ParallaxLayer(hillsImage, 0.6)
        ];
    }
    
    update(deltaTime: number) {
        // Update player
        this.player.update(deltaTime);
        
        // Update camera
        this.camera.centerOn(this.player);
        
        // Update only nearby entities
        this.entities.forEach(entity => {
            if (this.camera.isOnScreen(entity.x, entity.y, entity.width, entity.height, 200)) {
                entity.update(deltaTime);
            }
        });
    }
    
    draw() {
        // Clear
        this.ctx.fillStyle = '#5c94fc';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Parallax backgrounds
        this.layers.forEach(layer => layer.draw(this.ctx, this.camera));
        
        // World (translated)
        this.ctx.save();
        this.ctx.translate(-this.camera.x, -this.camera.y);
        
        // Draw only visible entities
        this.entities.forEach(entity => {
            if (this.camera.isOnScreen(entity.x, entity.y, entity.width, entity.height)) {
                entity.draw(this.ctx);
            }
        });
        
        this.player.draw(this.ctx);
        
        this.ctx.restore();
        
        // UI (not translated)
        this.drawUI();
    }
    
    private drawUI() {
        this.ctx.fillStyle = 'white';
        this.ctx.font = '16px Arial';
        this.ctx.fillText(`Score: ${this.player.score}`, 20, 30);
        this.ctx.fillText(`Position: (${this.player.x.toFixed(0)}, ${this.player.y.toFixed(0)})`, 20, 55);
    }
}
```

---

## Common Formulas

### World ↔ Screen Conversion

```typescript
// World to Screen
screenX = worldX - camera.x
screenY = worldY - camera.y

// Screen to World
worldX = screenX + camera.x
worldY = screenY + camera.y
```

### Camera Centering

```typescript
camera.x = target.x - camera.width / 2
camera.y = target.y - camera.height / 2
```

### Camera Bounds

```typescript
camera.x = Math.max(0, Math.min(camera.x, worldWidth - cameraWidth))
camera.y = Math.max(0, Math.min(camera.y, worldHeight - cameraHeight))
```

### Smooth Follow (Lerp)

```typescript
camera.x += (targetX - camera.x) * smoothness
// smoothness: 0.01 (very smooth) to 1.0 (instant)
```

### Viewport Culling

```typescript
isVisible =
    entityX + entityWidth > cameraX &&
    entityX < cameraX + cameraWidth &&
    entityY + entityHeight > cameraY &&
    entityY < cameraY + cameraHeight
```

### Parallax Offset

```typescript
layerOffsetX = camera.x * layer.scrollSpeed
// scrollSpeed: 0.0 (fixed) to 1.0 (foreground)
```

### Minimap Scale

```typescript
minimapX = (worldX / worldWidth) * minimapWidth
minimapY = (worldY / worldHeight) * minimapHeight

// Reverse
worldX = (minimapX / minimapWidth) * worldWidth
worldY = (minimapY / minimapHeight) * worldHeight
```

---

## Quick Patterns

### Follow Player

```typescript
camera.x = player.x - camera.width / 2;
camera.x = Math.max(0, Math.min(camera.x, worldWidth - camera.width));
```

### Smooth Follow

```typescript
const targetX = player.x - camera.width / 2;
camera.x += (targetX - camera.x) * 0.1;
camera.x = Math.max(0, Math.min(camera.x, worldWidth - camera.width));
```

### Draw with Translation

```typescript
ctx.save();
ctx.translate(-camera.x, -camera.y);
// Draw world
ctx.restore();
// Draw UI
```

### Cull Off-Screen

```typescript
if (camera.isOnScreen(entity.x, entity.y, entity.width, entity.height)) {
    entity.draw(ctx);
}
```

### Mouse to World

```typescript
const worldX = mouseX + camera.x;
const worldY = mouseY + camera.y;
```

---

## Common Values

```typescript
// Camera smoothness
0.05 - 0.15  // Sweet spot
0.01         // Very smooth
1.0          // Instant

// Deadzone size
200-400px    // Comfortable range
300×200      // Common size

// Look-ahead distance
100-200px    // Good range

// Culling margin
50-100px     // Smooth entry

// Parallax scroll speeds
0.0          // Fixed (sky)
0.2-0.3      // Far (clouds)
0.5-0.6      // Medium (hills)
0.8-0.9      // Close (trees)
1.0          // Foreground

// Shake intensity
5-10         // Light shake
20-30        // Medium shake
50+          // Strong shake

// Shake decay
0.85-0.95    // Good range
```

---

**Next:** Debug camera issues in `i-debugging.md`! 🎮