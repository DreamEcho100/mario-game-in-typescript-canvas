# Debugging Camera & Coordinate Systems

**Unit 01: Game Foundations | Topic 05**

> 10 realistic camera bugs and how to fix them.

---

## Bug #1: Camera Shows Black Bars at Edges

### 🐛 Symptoms

```
- Black bars appear at right/bottom of screen when camera reaches world edge
- Background doesn't fill screen when player is near world boundaries
- Empty space visible at edges of the game world
```

### 🔍 Diagnosis

Add camera position display:

```typescript
ctx.fillStyle = 'white';
ctx.fillText(`Camera: (${camera.x.toFixed(0)}, ${camera.y.toFixed(0)})`, 10, 20);
ctx.fillText(`World: ${camera.worldWidth} x ${camera.worldHeight}`, 10, 40);
ctx.fillText(`Viewport: ${camera.width} x ${camera.height}`, 10, 60);
```

Check if camera goes beyond world bounds:
- Camera.x + camera.width > worldWidth
- Camera.y + camera.height > worldHeight

### 🔧 Common Causes

**Cause 1: Forgot to clamp camera**

```typescript
// ❌ WRONG - Camera can go anywhere
class Camera {
    follow(player: Player) {
        this.x = player.x - this.width / 2;
        this.y = player.y - this.height / 2;
        // No clamping!
    }
}

// ✅ CORRECT - Clamp to world bounds
class Camera {
    follow(player: Player) {
        this.x = player.x - this.width / 2;
        this.y = player.y - this.height / 2;
        
        // Clamp to world
        this.x = Math.max(0, Math.min(this.x, this.worldWidth - this.width));
        this.y = Math.max(0, Math.min(this.y, this.worldHeight - this.height));
    }
}
```

**Cause 2: World smaller than camera**

```typescript
// ❌ WRONG - World is smaller than viewport
const worldWidth = 600;
const cameraWidth = 800; // Bigger than world!

// ✅ CORRECT - Detect and handle
class Camera {
    clamp() {
        if (this.worldWidth <= this.width) {
            this.x = 0; // Center or fix at 0
        } else {
            this.x = Math.max(0, Math.min(this.x, this.worldWidth - this.width));
        }
        
        if (this.worldHeight <= this.height) {
            this.y = 0;
        } else {
            this.y = Math.max(0, Math.min(this.y, this.worldHeight - this.height));
        }
    }
}
```

**Cause 3: Background not repeating**

```typescript
// ❌ WRONG - Single background image
ctx.drawImage(backgroundImage, -camera.x, -camera.y);
// Only draws once, black bars at edges

// ✅ CORRECT - Tile background
function drawBackground(ctx: CanvasRenderingContext2D, camera: Camera) {
    const tileWidth = backgroundImage.width;
    const tileHeight = backgroundImage.height;
    
    const startX = Math.floor(camera.x / tileWidth);
    const endX = Math.ceil((camera.x + camera.width) / tileWidth);
    const startY = Math.floor(camera.y / tileHeight);
    const endY = Math.ceil((camera.y + camera.height) / tileHeight);
    
    for (let y = startY; y <= endY; y++) {
        for (let x = startX; x <= endX; x++) {
            const drawX = x * tileWidth - camera.x;
            const drawY = y * tileHeight - camera.y;
            ctx.drawImage(backgroundImage, drawX, drawY);
        }
    }
}
```

**Cause 4: Camera max calculation wrong**

```typescript
// ❌ WRONG - Off by one
const maxCameraX = this.worldWidth - this.width - 1;
// Creates 1px gap

// ✅ CORRECT - Exact calculation
const maxCameraX = this.worldWidth - this.width;
```

### ✅ Complete Solution

```typescript
class Camera {
    x = 0;
    y = 0;
    width: number;
    height: number;
    worldWidth: number;
    worldHeight: number;
    
    constructor(width: number, height: number, worldWidth: number, worldHeight: number) {
        this.width = width;
        this.height = height;
        this.worldWidth = worldWidth;
        this.worldHeight = worldHeight;
    }
    
    follow(player: {x: number, y: number}) {
        this.x = player.x - this.width / 2;
        this.y = player.y - this.height / 2;
        this.clamp();
    }
    
    clamp() {
        // Handle world smaller than viewport
        if (this.worldWidth <= this.width) {
            this.x = 0;
        } else {
            this.x = Math.max(0, Math.min(this.x, this.worldWidth - this.width));
        }
        
        if (this.worldHeight <= this.height) {
            this.y = 0;
        } else {
            this.y = Math.max(0, Math.min(this.y, this.worldHeight - this.height));
        }
    }
}
```

### 🛡️ Prevention

- ✅ Always clamp camera after updating position
- ✅ Check if world is smaller than viewport
- ✅ Use tiled backgrounds, not single images
- ✅ Test with player at world edges
- ✅ Draw world bounds for debugging

---

## Bug #2: Player Position Wrong After Camera Moves

### 🐛 Symptoms

```
- Player appears to jump around screen
- Player position changes when camera moves but player is still
- Mouse clicks don't work on entities
- Collision detection breaks
```

### 🔍 Diagnosis

Log both coordinate systems:

```typescript
console.log('World position:', player.x, player.y);
console.log('Screen position:', player.x - camera.x, player.y - camera.y);
console.log('Camera position:', camera.x, camera.y);
```

Draw position indicators:

```typescript
// World position (should stay fixed in world)
ctx.save();
ctx.translate(-camera.x, -camera.y);
ctx.fillStyle = 'red';
ctx.fillRect(player.x - 5, player.y - 5, 10, 10);
ctx.restore();

// Screen position (should follow on screen)
ctx.fillStyle = 'blue';
const screenX = player.x - camera.x;
const screenY = player.y - camera.y;
ctx.fillRect(screenX - 5, screenY - 5, 10, 10);
```

### 🔧 Common Causes

**Cause 1: Mixing world and screen coordinates**

```typescript
// ❌ WRONG - Drawing in world coords without translation
function draw(ctx: CanvasRenderingContext2D, camera: Camera) {
    entities.forEach(entity => {
        // Using world coords directly!
        ctx.fillRect(entity.x, entity.y, entity.width, entity.height);
    });
}

// ✅ CORRECT - Convert to screen coords OR use translation
function draw(ctx: CanvasRenderingContext2D, camera: Camera) {
    // Option 1: Manual conversion
    entities.forEach(entity => {
        const screenX = entity.x - camera.x;
        const screenY = entity.y - camera.y;
        ctx.fillRect(screenX, screenY, entity.width, entity.height);
    });
    
    // Option 2: Translation (recommended)
    ctx.save();
    ctx.translate(-camera.x, -camera.y);
    entities.forEach(entity => {
        ctx.fillRect(entity.x, entity.y, entity.width, entity.height);
    });
    ctx.restore();
}
```

**Cause 2: Updating entity position with screen coords**

```typescript
// ❌ WRONG - Using screen coords for position update
canvas.addEventListener('click', (e) => {
    // These are screen coords!
    player.x = e.offsetX;
    player.y = e.offsetY;
    // Player jumps around when camera moves
});

// ✅ CORRECT - Convert to world coords
canvas.addEventListener('click', (e) => {
    // Convert screen to world
    player.x = e.offsetX + camera.x;
    player.y = e.offsetY + camera.y;
});
```

**Cause 3: Camera offset in wrong direction**

```typescript
// ❌ WRONG - Adding camera offset
const screenX = entity.x + camera.x; // BACKWARDS!

// ✅ CORRECT - Subtracting camera offset
const screenX = entity.x - camera.x;
const screenY = entity.y - camera.y;
```

**Cause 4: Storing screen coords instead of world coords**

```typescript
// ❌ WRONG - Entity stores screen position
class Entity {
    screenX = 100; // BAD! Position changes when camera moves
    screenY = 100;
}

// ✅ CORRECT - Entity stores world position
class Entity {
    x = 500; // World position
    y = 300;
    
    draw(ctx: CanvasRenderingContext2D, camera: Camera) {
        const screenX = this.x - camera.x;
        const screenY = this.y - camera.y;
        ctx.fillRect(screenX, screenY, this.width, this.height);
    }
}
```

### ✅ Complete Solution

```typescript
class Entity {
    // World coordinates (never change unless entity moves)
    x: number;
    y: number;
    width: number;
    height: number;
    
    constructor(x: number, y: number, width: number, height: number) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }
    
    // Update uses world coords
    update(deltaTime: number) {
        this.x += this.velocityX * deltaTime;
        this.y += this.velocityY * deltaTime;
    }
    
    // Draw converts to screen coords
    draw(ctx: CanvasRenderingContext2D, camera: Camera) {
        const screenX = this.x - camera.x;
        const screenY = this.y - camera.y;
        ctx.fillRect(screenX, screenY, this.width, this.height);
    }
}

// Input handling converts to world
canvas.addEventListener('click', (e) => {
    const worldX = e.offsetX + camera.x;
    const worldY = e.offsetY + camera.y;
    
    entities.forEach(entity => {
        if (worldX >= entity.x && worldX < entity.x + entity.width &&
            worldY >= entity.y && worldY < entity.y + entity.height) {
            entity.onClick();
        }
    });
});
```

### 🛡️ Prevention

- ✅ Store ALL entity positions in world coordinates
- ✅ Convert to screen coords only for drawing
- ✅ Convert screen input to world coords immediately
- ✅ Use ctx.translate() to avoid manual conversion
- ✅ Draw debug indicators in both coordinate systems

---

## Bug #3: Mouse Clicks Hit Wrong Position

### 🐛 Symptoms

```
- Clicks appear offset from where user clicked
- Clicks work in top-left but not bottom-right
- UI buttons don't respond to clicks
- Click position drifts as player moves
```

### 🔍 Diagnosis

Draw click indicator:

```typescript
canvas.addEventListener('click', (e) => {
    const screenX = e.offsetX;
    const screenY = e.offsetY;
    const worldX = screenX + camera.x;
    const worldY = screenY + camera.y;
    
    console.log('Screen:', screenX, screenY);
    console.log('World:', worldX, worldY);
    
    // Draw markers
    ctx.fillStyle = 'red';
    ctx.fillRect(screenX - 5, screenY - 5, 10, 10); // Screen position
    
    ctx.save();
    ctx.translate(-camera.x, -camera.y);
    ctx.fillStyle = 'blue';
    ctx.fillRect(worldX - 5, worldY - 5, 10, 10); // World position
    ctx.restore();
});
```

### 🔧 Common Causes

**Cause 1: Using wrong mouse properties**

```typescript
// ❌ WRONG - clientX/Y includes page scroll and canvas position
canvas.addEventListener('click', (e) => {
    const x = e.clientX; // Wrong!
    const y = e.clientY;
});

// ✅ CORRECT - offsetX/Y relative to canvas
canvas.addEventListener('click', (e) => {
    const x = e.offsetX; // Correct!
    const y = e.offsetY;
});
```

**Cause 2: Forgot to convert to world coords**

```typescript
// ❌ WRONG - Using screen coords for world collision
canvas.addEventListener('click', (e) => {
    const x = e.offsetX; // Screen coords!
    const y = e.offsetY;
    
    entities.forEach(entity => {
        // Comparing screen to world - doesn't work!
        if (x >= entity.x && x < entity.x + entity.width) {
            entity.onClick();
        }
    });
});

// ✅ CORRECT - Convert to world coords
canvas.addEventListener('click', (e) => {
    const worldX = e.offsetX + camera.x;
    const worldY = e.offsetY + camera.y;
    
    entities.forEach(entity => {
        if (worldX >= entity.x && worldX < entity.x + entity.width &&
            worldY >= entity.y && worldY < entity.y + entity.height) {
            entity.onClick();
        }
    });
});
```

**Cause 3: Canvas CSS size doesn't match canvas size**

```typescript
// ❌ WRONG - CSS size differs from canvas size
// HTML: <canvas width="400" height="300" style="width: 800px; height: 600px">
// Mouse coords are scaled wrong!

// ✅ CORRECT - Match CSS size to canvas size
canvas.width = 800;
canvas.height = 600;
// CSS: canvas { width: 800px; height: 600px; }

// OR scale mouse coordinates
canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    const x = e.offsetX * scaleX;
    const y = e.offsetY * scaleY;
});
```

**Cause 4: UI uses world coords instead of screen**

```typescript
// ❌ WRONG - UI button in world coordinates
class Button {
    x = 100; // World position
    y = 100;
    
    isClicked(mouseX: number, mouseY: number) {
        // Button moves with camera!
        return mouseX >= this.x && mouseX < this.x + this.width &&
               mouseY >= this.y && mouseY < this.y + this.height;
    }
}

// ✅ CORRECT - UI button in screen coordinates
class Button {
    screenX = 100; // Screen position (fixed on screen)
    screenY = 100;
    
    isClicked(screenMouseX: number, screenMouseY: number) {
        // Always works, independent of camera
        return screenMouseX >= this.screenX && 
               screenMouseX < this.screenX + this.width &&
               screenMouseY >= this.screenY && 
               screenMouseY < this.screenY + this.height;
    }
    
    draw(ctx: CanvasRenderingContext2D) {
        // Draw after restoring (not translated)
        ctx.fillRect(this.screenX, this.screenY, this.width, this.height);
    }
}
```

### ✅ Complete Solution

```typescript
class InputManager {
    private camera: Camera;
    private canvas: HTMLCanvasElement;
    
    constructor(canvas: HTMLCanvasElement, camera: Camera) {
        this.canvas = canvas;
        this.camera = camera;
        
        canvas.addEventListener('click', (e) => this.handleClick(e));
    }
    
    private handleClick(e: MouseEvent) {
        const screenPos = this.getScreenPosition(e);
        const worldPos = this.screenToWorld(screenPos);
        
        // Check UI elements (screen coords)
        for (const button of this.uiButtons) {
            if (button.isClicked(screenPos.x, screenPos.y)) {
                button.onClick();
                return; // Don't check world entities
            }
        }
        
        // Check world entities (world coords)
        for (const entity of this.worldEntities) {
            if (entity.containsPoint(worldPos.x, worldPos.y)) {
                entity.onClick();
                return;
            }
        }
    }
    
    private getScreenPosition(e: MouseEvent): {x: number, y: number} {
        // Handle canvas scaling
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;
        
        return {
            x: e.offsetX * scaleX,
            y: e.offsetY * scaleY
        };
    }
    
    private screenToWorld(screenPos: {x: number, y: number}): {x: number, y: number} {
        return {
            x: screenPos.x + this.camera.x,
            y: screenPos.y + this.camera.y
        };
    }
}
```

### 🛡️ Prevention

- ✅ Use `offsetX/offsetY` for mouse position
- ✅ Always convert screen to world for world entities
- ✅ Keep UI in screen coordinates
- ✅ Match canvas size to CSS size
- ✅ Handle canvas scaling if needed
- ✅ Draw debug markers at click position

---

## Bug #4: Camera Jitters and Stutters

### 🐛 Symptoms

```
- Camera shakes or vibrates
- Player appears to stutter on screen
- Camera position oscillates
- Movement looks choppy
```

### 🔍 Diagnosis

Log camera movement:

```typescript
let lastCameraX = camera.x;

function update() {
    camera.follow(player);
    
    const deltaCamera = camera.x - lastCameraX;
    console.log('Camera delta:', deltaCamera);
    
    if (Math.abs(deltaCamera) > 1) {
        console.warn('Large camera jump!');
    }
    
    lastCameraX = camera.x;
}
```

### 🔧 Common Causes

**Cause 1: Rounding causes pixel jitter**

```typescript
// ❌ WRONG - Sub-pixel positions cause jitter
class Camera {
    follow(player: {x: number, y: number}) {
        this.x = player.x - this.width / 2;
        // x might be 123.456, causes jitter
    }
}

// ✅ CORRECT - Round to pixels
class Camera {
    follow(player: {x: number, y: number}) {
        this.x = Math.round(player.x - this.width / 2);
        this.y = Math.round(player.y - this.height / 2);
        this.clamp();
    }
}
```

**Cause 2: Camera updated in wrong order**

```typescript
// ❌ WRONG - Camera updated before player moves
function update(deltaTime: number) {
    camera.follow(player); // Uses old position
    player.update(deltaTime); // Player moves
    // Camera is one frame behind!
}

// ✅ CORRECT - Update camera after player
function update(deltaTime: number) {
    player.update(deltaTime); // Player moves
    camera.follow(player); // Camera follows new position
}
```

**Cause 3: Multiple camera updates per frame**

```typescript
// ❌ WRONG - Camera updated multiple times
function update(deltaTime: number) {
    player.update(deltaTime);
    camera.follow(player);
    
    // Some other code...
    camera.centerOn(player); // Updated again!
    // Camera jumps
}

// ✅ CORRECT - Update camera once per frame
function update(deltaTime: number) {
    player.update(deltaTime);
    camera.follow(player); // Only once!
}
```

**Cause 4: Clamping oscillation**

```typescript
// ❌ WRONG - Clamping interferes with smooth follow
class Camera {
    follow(player: {x: number, y: number}) {
        const targetX = player.x - this.width / 2;
        this.x += (targetX - this.x) * 0.1;
        
        // Clamp can cause oscillation at edges
        this.x = Math.max(0, Math.min(this.x, this.maxX));
        
        // Camera bounces against edge
    }
}

// ✅ CORRECT - Clamp target before lerp
class Camera {
    follow(player: {x: number, y: number}) {
        let targetX = player.x - this.width / 2;
        
        // Clamp target first
        targetX = Math.max(0, Math.min(targetX, this.maxX));
        
        // Then lerp toward clamped target
        this.x += (targetX - this.x) * 0.1;
    }
}
```

**Cause 5: Camera shake not decaying**

```typescript
// ❌ WRONG - Shake continues forever
class Camera {
    private shakeX = 0;
    private shakeY = 0;
    
    shake(amount: number) {
        this.shakeX = (Math.random() - 0.5) * amount;
        this.shakeY = (Math.random() - 0.5) * amount;
        // Never resets!
    }
}

// ✅ CORRECT - Shake decays over time
class Camera {
    private shakeAmount = 0;
    private shakeDecay = 0.9;
    
    shake(amount: number) {
        this.shakeAmount += amount;
    }
    
    update() {
        if (this.shakeAmount > 0) {
            this.shakeAmount *= this.shakeDecay;
            
            if (this.shakeAmount < 0.1) {
                this.shakeAmount = 0;
            }
        }
    }
    
    getOffset() {
        return {
            x: (Math.random() - 0.5) * this.shakeAmount,
            y: (Math.random() - 0.5) * this.shakeAmount
        };
    }
}
```

### ✅ Complete Solution

```typescript
class SmoothCamera {
    x = 0;
    y = 0;
    width: number;
    height: number;
    worldWidth: number;
    worldHeight: number;
    smoothness = 0.1;
    
    private shakeAmount = 0;
    private shakeDecay = 0.9;
    
    follow(player: {x: number, y: number}) {
        // Calculate target (clamped)
        let targetX = player.x - this.width / 2;
        let targetY = player.y - this.height / 2;
        
        targetX = Math.max(0, Math.min(targetX, this.worldWidth - this.width));
        targetY = Math.max(0, Math.min(targetY, this.worldHeight - this.height));
        
        // Lerp toward target
        this.x += (targetX - this.x) * this.smoothness;
        this.y += (targetY - this.y) * this.smoothness;
        
        // Round to pixels
        this.x = Math.round(this.x);
        this.y = Math.round(this.y);
    }
    
    shake(intensity: number) {
        this.shakeAmount += intensity;
    }
    
    update() {
        // Decay shake
        if (this.shakeAmount > 0) {
            this.shakeAmount *= this.shakeDecay;
            if (this.shakeAmount < 0.1) {
                this.shakeAmount = 0;
            }
        }
    }
    
    getOffset() {
        // Apply shake
        const shakeX = (Math.random() - 0.5) * this.shakeAmount;
        const shakeY = (Math.random() - 0.5) * this.shakeAmount;
        
        return {
            x: Math.round(this.x + shakeX),
            y: Math.round(this.y + shakeY)
        };
    }
}

// Usage
function update(deltaTime: number) {
    // 1. Update entities
    player.update(deltaTime);
    
    // 2. Update camera once
    camera.follow(player);
    camera.update();
}

function draw(ctx: CanvasRenderingContext2D) {
    const offset = camera.getOffset();
    
    ctx.save();
    ctx.translate(-offset.x, -offset.y);
    // Draw world
    ctx.restore();
}
```

### 🛡️ Prevention

- ✅ Round camera position to pixels
- ✅ Update camera after entities
- ✅ Only update camera once per frame
- ✅ Clamp target before lerping
- ✅ Decay shake properly
- ✅ Use consistent deltaTime

---

## Bug #5: UI Moves with Camera

### 🐛 Symptoms

```
- Health bar scrolls off screen
- Menu buttons move with player
- Score text follows camera
- UI appears in wrong position
```

### 🔍 Diagnosis

Draw UI bounds:

```typescript
// Draw what should be fixed on screen
ctx.strokeStyle = 'red';
ctx.strokeRect(10, 10, 200, 50); // Should stay at (10, 10)

// Draw with camera translation
ctx.save();
ctx.translate(-camera.x, -camera.y);
// If UI appears here, it will move!
ctx.restore();
```

### 🔧 Common Causes

**Cause 1: Drawing UI inside translated context**

```typescript
// ❌ WRONG - UI drawn with world translation
function draw(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.translate(-camera.x, -camera.y);
    
    // Draw world
    drawWorld(ctx);
    
    // Draw UI - WRONG! It will move with camera
    drawUI(ctx);
    
    ctx.restore();
}

// ✅ CORRECT - Draw UI after restore
function draw(ctx: CanvasRenderingContext2D) {
    // World layer
    ctx.save();
    ctx.translate(-camera.x, -camera.y);
    drawWorld(ctx);
    ctx.restore();
    
    // UI layer (not translated)
    drawUI(ctx);
}
```

**Cause 2: Forgot ctx.restore()**

```typescript
// ❌ WRONG - Never restored
function draw(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.translate(-camera.x, -camera.y);
    drawWorld(ctx);
    // Forgot ctx.restore()!
    
    drawUI(ctx); // Still translated!
}

// ✅ CORRECT - Always restore
function draw(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.translate(-camera.x, -camera.y);
    drawWorld(ctx);
    ctx.restore(); // Restore!
    
    drawUI(ctx); // Not translated
}
```

**Cause 3: UI uses world coordinates**

```typescript
// ❌ WRONG - UI at world position
class HealthBar {
    draw(ctx: CanvasRenderingContext2D, player: Player) {
        // Draws at player's world position!
        ctx.fillRect(player.x, player.y - 20, 50, 5);
    }
}

// ✅ CORRECT - UI at screen position
class HealthBar {
    draw(ctx: CanvasRenderingContext2D) {
        // Fixed screen position
        ctx.fillRect(10, 10, 50, 5);
    }
}

// OR draw above player (world space)
class FloatingHealthBar {
    draw(ctx: CanvasRenderingContext2D, player: Player, camera: Camera) {
        // Draw BEFORE restore (in world space)
        ctx.save();
        ctx.translate(-camera.x, -camera.y);
        ctx.fillRect(player.x, player.y - 20, 50, 5);
        ctx.restore();
    }
}
```

**Cause 4: Multiple saves without restores**

```typescript
// ❌ WRONG - Unbalanced save/restore
function draw(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.translate(-camera.x, -camera.y);
    
    ctx.save(); // Another save!
    drawPlayer(ctx);
    // Forgot restore!
    
    ctx.restore(); // Only restores inner save
    // Still translated!
    
    drawUI(ctx); // Moves with camera
}

// ✅ CORRECT - Balanced save/restore
function draw(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.translate(-camera.x, -camera.y);
    
    ctx.save();
    drawPlayer(ctx);
    ctx.restore(); // Restore inner
    
    ctx.restore(); // Restore outer
    
    drawUI(ctx); // Not translated
}
```

### ✅ Complete Solution

```typescript
class Game {
    draw(ctx: CanvasRenderingContext2D) {
        // Clear
        ctx.fillStyle = '#5c94fc';
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Background layer (parallax, not translated)
        this.drawBackgrounds(ctx);
        
        // World layer (translated)
        ctx.save();
        ctx.translate(-this.camera.x, -this.camera.y);
        
        // Draw world entities
        this.entities.forEach(entity => {
            if (this.camera.isOnScreen(entity.x, entity.y, entity.width, entity.height)) {
                entity.draw(ctx);
            }
        });
        
        this.player.draw(ctx);
        
        // World UI (health bars above enemies)
        this.entities.forEach(entity => {
            entity.drawHealthBar(ctx);
        });
        
        ctx.restore(); // End world layer
        
        // Screen UI layer (not translated)
        this.drawUI(ctx);
        
        // Debug layer (always on top)
        if (this.debug) {
            this.drawDebug(ctx);
        }
    }
    
    private drawUI(ctx: CanvasRenderingContext2D) {
        // Score
        ctx.fillStyle = 'white';
        ctx.font = '24px Arial';
        ctx.fillText(`Score: ${this.score}`, 20, 40);
        
        // Health bar
        ctx.fillStyle = 'red';
        ctx.fillRect(20, 60, 200, 20);
        ctx.fillStyle = 'green';
        ctx.fillRect(20, 60, this.player.health * 2, 20);
        
        // Buttons
        this.buttons.forEach(button => button.draw(ctx));
    }
}
```

### 🛡️ Prevention

- ✅ Draw UI after `ctx.restore()`
- ✅ Always balance `save()` and `restore()`
- ✅ Use screen coordinates for UI
- ✅ Structure: backgrounds → world → UI → debug
- ✅ Test by moving camera and checking UI

---

## Bug #6: Parallax Doesn't Repeat Seamlessly

### 🐛 Symptoms

```
- Gaps appear between parallax tiles
- Background shows seams or lines
- Parallax jumps when scrolling
- Black bars appear in background
```

### 🔍 Diagnosis

Log tile positions:

```typescript
console.log('Offset:', camera.x * layer.scrollSpeed);
console.log('Image width:', layer.image.width);
console.log('Start tile:', Math.floor(offset / imageWidth));
console.log('End tile:', Math.ceil((offset + camera.width) / imageWidth));
```

Draw tile boundaries:

```typescript
ctx.strokeStyle = 'red';
for (let i = startTile; i <= endTile; i++) {
    const x = i * imageWidth - offsetX;
    ctx.strokeRect(x, 0, imageWidth, imageHeight);
}
```

### 🔧 Common Causes

**Cause 1: Wrong tile calculation**

```typescript
// ❌ WRONG - Not enough tiles drawn
const numTiles = Math.floor(camera.width / imageWidth);
// Missing tiles at edges

// ✅ CORRECT - Draw extra tiles
const startTile = Math.floor(offsetX / imageWidth);
const endTile = Math.ceil((offsetX + camera.width) / imageWidth);
```

**Cause 2: Image not seamless**

```typescript
// ❌ WRONG - Image has visible edge
// Image design problem, not code problem

// ✅ CORRECT - Use seamless images OR overlap tiles
function drawParallax(ctx: CanvasRenderingContext2D, layer: ParallaxLayer, camera: Camera) {
    const offset = camera.x * layer.scrollSpeed;
    const imageWidth = layer.image.width;
    
    const startTile = Math.floor(offset / imageWidth);
    const endTile = Math.ceil((offset + camera.width) / imageWidth) + 1; // Extra tile
    
    for (let i = startTile; i <= endTile; i++) {
        const x = i * imageWidth - offset;
        ctx.drawImage(layer.image, x, 0);
    }
}
```

**Cause 3: Rounding errors create gaps**

```typescript
// ❌ WRONG - Sub-pixel positions create gaps
const x = i * imageWidth - offsetX;
ctx.drawImage(image, x, 0);
// x might be 100.5, creates 1px gap

// ✅ CORRECT - Round positions
const x = Math.floor(i * imageWidth - offsetX);
ctx.drawImage(image, x, 0);
```

**Cause 4: Wrong offset calculation**

```typescript
// ❌ WRONG - Using camera position directly
const offset = camera.x;
// Parallax moves at same speed as camera!

// ✅ CORRECT - Multiply by scroll speed
const offset = camera.x * layer.scrollSpeed;
// 0.0 = fixed, 0.5 = half speed, 1.0 = full speed
```

### ✅ Complete Solution

```typescript
class ParallaxLayer {
    image: HTMLImageElement;
    scrollSpeed: number;
    y: number;
    
    constructor(image: HTMLImageElement, scrollSpeed: number, y = 0) {
        this.image = image;
        this.scrollSpeed = scrollSpeed;
        this.y = y;
    }
    
    draw(ctx: CanvasRenderingContext2D, camera: Camera) {
        const offset = camera.x * this.scrollSpeed;
        const imageWidth = this.image.width;
        const imageHeight = this.image.height;
        
        // Calculate visible tiles (with extra for safety)
        const startTile = Math.floor(offset / imageWidth) - 1;
        const endTile = Math.ceil((offset + camera.width) / imageWidth) + 1;
        
        // Draw tiles
        for (let i = startTile; i <= endTile; i++) {
            const x = Math.floor(i * imageWidth - offset);
            ctx.drawImage(this.image, x, this.y, imageWidth, imageHeight);
        }
    }
}

// Usage
const layers = [
    new ParallaxLayer(skyImage, 0.0, 0),      // Fixed background
    new ParallaxLayer(cloudsImage, 0.2, 50),  // Slow
    new ParallaxLayer(mountainsImage, 0.5, 200), // Medium
    new ParallaxLayer(treesImage, 0.8, 400)   // Fast
];

function draw(ctx: CanvasRenderingContext2D) {
    // Draw layers back to front
    layers.forEach(layer => layer.draw(ctx, camera));
    
    // Then draw world
    ctx.save();
    ctx.translate(-camera.x, -camera.y);
    // ...
    ctx.restore();
}
```

### 🛡️ Prevention

- ✅ Use seamless tileable images
- ✅ Draw extra tiles at edges
- ✅ Round positions to prevent gaps
- ✅ Multiply offset by scroll speed
- ✅ Draw layers back to front
- ✅ Test by scrolling through entire world

---

## Bug #7: Viewport Culling Not Working

### 🐛 Symptoms

```
- All entities drawn even when off-screen
- Performance issues with large worlds
- Entities pop in at wrong positions
- Culling doesn't match visible area
```

### 🔍 Diagnosis

Count visible entities:

```typescript
let visibleCount = 0;
let totalCount = 0;

entities.forEach(entity => {
    totalCount++;
    if (camera.isOnScreen(entity.x, entity.y, entity.width, entity.height)) {
        visibleCount++;
        entity.draw(ctx);
    }
});

console.log(`Visible: ${visibleCount} / ${totalCount}`);
```

Draw culling bounds:

```typescript
ctx.strokeStyle = 'yellow';
ctx.lineWidth = 2;
ctx.strokeRect(-camera.x, -camera.y, camera.width, camera.height);
```

### 🔧 Common Causes

**Cause 1: Wrong overlap check**

```typescript
// ❌ WRONG - Checks if entity is entirely on screen
isOnScreen(entity) {
    return entity.x >= camera.x &&
           entity.x <= camera.x + camera.width &&
           entity.y >= camera.y &&
           entity.y <= camera.y + camera.height;
    // Only checks top-left corner!
}

// ✅ CORRECT - Checks if entity overlaps viewport
isOnScreen(entity) {
    return entity.x + entity.width > camera.x &&
           entity.x < camera.x + camera.width &&
           entity.y + entity.height > camera.y &&
           entity.y < camera.y + camera.height;
}
```

**Cause 2: No margin for smooth entry**

```typescript
// ❌ WRONG - Entities pop in suddenly
if (camera.isOnScreen(entity.x, entity.y, entity.width, entity.height)) {
    entity.draw(ctx);
}
// Entity appears instantly at edge

// ✅ CORRECT - Use margin for smooth entry
const margin = 50;
if (camera.isOnScreen(entity.x, entity.y, entity.width, entity.height, margin)) {
    entity.draw(ctx);
}
// Entity fades in from off-screen
```

**Cause 3: Culling in world coordinates**

```typescript
// ❌ WRONG - Comparing screen and world coords
function isOnScreen(screenX, screenY) {
    return screenX >= 0 && screenX < camera.width; // WRONG!
}
// screenX is already converted, no camera offset needed

// ✅ CORRECT - Separate screen and world culling
function isOnScreenWorld(worldX, worldY, width, height) {
    return worldX + width > camera.x &&
           worldX < camera.x + camera.width &&
           worldY + height > camera.y &&
           worldY < camera.y + camera.height;
}

function isOnScreenScreen(screenX, screenY, width, height) {
    return screenX + width > 0 &&
           screenX < canvas.width &&
           screenY + height > 0 &&
           screenY < canvas.height;
}
```

**Cause 4: Culling after expensive operations**

```typescript
// ❌ WRONG - Update before culling
entities.forEach(entity => {
    entity.update(deltaTime); // Expensive!
    
    if (camera.isOnScreen(entity.x, entity.y, entity.width, entity.height)) {
        entity.draw(ctx);
    }
    // Updated entities that aren't visible
});

// ✅ CORRECT - Cull before update
entities.forEach(entity => {
    const margin = 200; // Update slightly off-screen entities
    
    if (camera.isOnScreen(entity.x, entity.y, entity.width, entity.height, margin)) {
        entity.update(deltaTime);
        entity.draw(ctx);
    }
});
```

### ✅ Complete Solution

```typescript
class Camera {
    isOnScreen(x: number, y: number, width: number, height: number, margin = 0): boolean {
        return x + width > this.x - margin &&
               x < this.x + this.width + margin &&
               y + height > this.y - margin &&
               y < this.y + this.height + margin;
    }
}

class Game {
    update(deltaTime: number) {
        const updateMargin = 200; // Update entities slightly off-screen
        
        this.entities.forEach(entity => {
            if (this.camera.isOnScreen(
                entity.x, entity.y, 
                entity.width, entity.height, 
                updateMargin
            )) {
                entity.update(deltaTime);
            }
        });
    }
    
    draw(ctx: CanvasRenderingContext2D) {
        const drawMargin = 50; // Draw entities entering viewport
        
        let visibleCount = 0;
        
        ctx.save();
        ctx.translate(-this.camera.x, -this.camera.y);
        
        this.entities.forEach(entity => {
            if (this.camera.isOnScreen(
                entity.x, entity.y,
                entity.width, entity.height,
                drawMargin
            )) {
                entity.draw(ctx);
                visibleCount++;
            }
        });
        
        ctx.restore();
        
        // Debug info
        ctx.fillStyle = 'white';
        ctx.fillText(`Visible: ${visibleCount} / ${this.entities.length}`, 10, 20);
    }
}
```

### 🛡️ Prevention

- ✅ Use proper overlap check (not just top-left)
- ✅ Add margin for smooth entry
- ✅ Cull before expensive operations
- ✅ Use larger margin for updates than draws
- ✅ Display visible count for debugging
- ✅ Test with 1000+ entities

---

## Bug #8: Camera Stuck at World Edge

### 🐛 Symptoms

```
- Camera won't follow player at edges
- Player can move off-screen
- Camera stops before reaching edge
- Jumpy behavior near boundaries
```

### 🔍 Diagnosis

Log camera limits:

```typescript
console.log('Camera X:', camera.x);
console.log('Max X:', camera.worldWidth - camera.width);
console.log('Player X:', player.x);
console.log('Can move right:', camera.x < camera.worldWidth - camera.width);
```

### 🔧 Common Causes

**Cause 1: Max calculation includes camera position**

```typescript
// ❌ WRONG - Using camera.x in max calculation
const maxX = this.worldWidth - this.width - this.x;
// Creates circular dependency!

// ✅ CORRECT - Max is fixed value
const maxX = this.worldWidth - this.width;
this.x = Math.max(0, Math.min(this.x, maxX));
```

**Cause 2: World width set wrong**

```typescript
// ❌ WRONG - World width is camera width
const worldWidth = 800; // Same as camera!
// Camera can't move at all

// ✅ CORRECT - World is larger than camera
const worldWidth = 3000; // Much larger than camera (800)
const maxCameraX = worldWidth - 800; // = 2200
```

**Cause 3: Player can move beyond world**

```typescript
// ❌ WRONG - Player not clamped
player.x += velocityX * deltaTime;
// Player can go beyond world edge

// Camera reaches edge but player keeps going

// ✅ CORRECT - Clamp player to world
player.x += velocityX * deltaTime;
player.x = Math.max(0, Math.min(player.x, worldWidth - player.width));
```

**Cause 4: Camera centered on player even at edge**

```typescript
// ❌ WRONG - Always centers on player
camera.x = player.x - camera.width / 2;
// At edge, this goes beyond world

// ✅ CORRECT - Clamp after centering
camera.x = player.x - camera.width / 2;
camera.x = Math.max(0, Math.min(camera.x, worldWidth - camera.width));
```

### ✅ Complete Solution

```typescript
class Game {
    private worldWidth = 5000;
    private worldHeight = 600;
    
    constructor() {
        this.camera = new Camera();
        this.camera.width = 800;
        this.camera.height = 600;
        this.camera.worldWidth = this.worldWidth;
        this.camera.worldHeight = this.worldHeight;
    }
    
    update(deltaTime: number) {
        // Update player
        this.player.update(deltaTime);
        
        // Clamp player to world
        this.player.x = Math.max(
            0,
            Math.min(this.player.x, this.worldWidth - this.player.width)
        );
        this.player.y = Math.max(
            0,
            Math.min(this.player.y, this.worldHeight - this.player.height)
        );
        
        // Update camera
        this.camera.follow(this.player);
    }
}

class Camera {
    clamp() {
        const maxX = this.worldWidth - this.width;
        const maxY = this.worldHeight - this.height;
        
        this.x = Math.max(0, Math.min(this.x, maxX));
        this.y = Math.max(0, Math.min(this.y, maxY));
    }
}
```

### 🛡️ Prevention

- ✅ Calculate max camera position correctly
- ✅ Ensure world is larger than camera
- ✅ Clamp player to world bounds
- ✅ Clamp camera after following player
- ✅ Test by running to each edge

---

## Bug #9: Camera Zoom Breaks Everything

### 🐛 Symptoms

```
- Entities appear wrong size after zoom
- Mouse clicks offset
- Collision detection broken
- Culling doesn't work
```

### 🔍 Diagnosis

Log zoom state:

```typescript
console.log('Zoom:', camera.zoom);
console.log('Camera size:', camera.width, camera.height);
console.log('World visible:', camera.width / camera.zoom, camera.height / camera.zoom);
```

### 🔧 Common Causes

**Cause 1: Forgot to scale coordinates**

```typescript
// ❌ WRONG - No zoom applied to coordinates
const screenX = worldX - camera.x;
// Doesn't account for zoom!

// ✅ CORRECT - Scale by zoom
const screenX = (worldX - camera.x) * camera.zoom;
const screenY = (worldY - camera.y) * camera.zoom;
```

**Cause 2: Using ctx.scale() incorrectly**

```typescript
// ❌ WRONG - Scale affects everything including UI
ctx.scale(camera.zoom, camera.zoom);
ctx.translate(-camera.x, -camera.y);
// Draw world
// Draw UI - WRONG! UI is scaled too

// ✅ CORRECT - Scale only world
ctx.save();
ctx.scale(camera.zoom, camera.zoom);
ctx.translate(-camera.x, -camera.y);
// Draw world
ctx.restore();
// Draw UI (not scaled)
```

**Cause 3: Viewport size not adjusted**

```typescript
// ❌ WRONG - Viewport size doesn't account for zoom
isOnScreen(worldX, worldY) {
    return worldX > camera.x && worldX < camera.x + camera.width;
    // camera.width is screen size, not world size!
}

// ✅ CORRECT - Adjust viewport for zoom
isOnScreen(worldX, worldY) {
    const viewportWidth = camera.width / camera.zoom;
    const viewportHeight = camera.height / camera.zoom;
    
    return worldX > camera.x && 
           worldX < camera.x + viewportWidth &&
           worldY > camera.y &&
           worldY < camera.y + viewportHeight;
}
```

**Cause 4: Mouse input not scaled**

```typescript
// ❌ WRONG - Mouse not adjusted for zoom
const worldX = mouseX + camera.x;
// Doesn't account for zoom

// ✅ CORRECT - Scale mouse by zoom
const worldX = mouseX / camera.zoom + camera.x;
const worldY = mouseY / camera.zoom + camera.y;
```

### ✅ Complete Solution

```typescript
class Camera {
    x = 0;
    y = 0;
    width: number;
    height: number;
    zoom = 1.0;
    
    worldToScreen(worldX: number, worldY: number) {
        return {
            x: (worldX - this.x) * this.zoom,
            y: (worldY - this.y) * this.zoom
        };
    }
    
    screenToWorld(screenX: number, screenY: number) {
        return {
            x: screenX / this.zoom + this.x,
            y: screenY / this.zoom + this.y
        };
    }
    
    getViewportSize() {
        return {
            width: this.width / this.zoom,
            height: this.height / this.zoom
        };
    }
    
    isOnScreen(worldX: number, worldY: number, width: number, height: number) {
        const viewport = this.getViewportSize();
        
        return worldX + width > this.x &&
               worldX < this.x + viewport.width &&
               worldY + height > this.y &&
               worldY < this.y + viewport.height;
    }
}

// Drawing with zoom
function draw(ctx: CanvasRenderingContext2D, camera: Camera) {
    // World layer (zoomed)
    ctx.save();
    ctx.scale(camera.zoom, camera.zoom);
    ctx.translate(-camera.x, -camera.y);
    
    entities.forEach(entity => {
        if (camera.isOnScreen(entity.x, entity.y, entity.width, entity.height)) {
            entity.draw(ctx);
        }
    });
    
    ctx.restore();
    
    // UI layer (not zoomed)
    drawUI(ctx);
}

// Input with zoom
canvas.addEventListener('click', (e) => {
    const worldPos = camera.screenToWorld(e.offsetX, e.offsetY);
    console.log('Clicked world position:', worldPos);
});
```

### 🛡️ Prevention

- ✅ Scale coordinates by zoom
- ✅ Adjust viewport size for zoom
- ✅ Scale mouse input by zoom
- ✅ Use ctx.scale() only for world layer
- ✅ Test at multiple zoom levels

---

## Bug #10: Performance Issues with Large World

### 🐛 Symptoms

```
- Game runs slowly with many entities
- Frame rate drops
- Stuttering when scrolling
- Memory usage high
```

### 🔍 Diagnosis

Profile draw calls:

```typescript
const start = performance.now();

let drawCount = 0;
entities.forEach(entity => {
    entity.draw(ctx);
    drawCount++;
});

const end = performance.now();
console.log(`Drew ${drawCount} entities in ${(end - start).toFixed(2)}ms`);
```

### 🔧 Common Causes

**Cause 1: No culling**

```typescript
// ❌ WRONG - Drawing everything
entities.forEach(entity => {
    entity.draw(ctx);
});
// Draws 10,000 entities even if only 20 visible!

// ✅ CORRECT - Cull off-screen
entities.forEach(entity => {
    if (camera.isOnScreen(entity.x, entity.y, entity.width, entity.height)) {
        entity.draw(ctx);
    }
});
// Only draws ~20 entities
```

**Cause 2: Linear search for nearby entities**

```typescript
// ❌ WRONG - O(n²) collision check
entities.forEach(a => {
    entities.forEach(b => {
        if (a !== b && a.collidesWith(b)) {
            // Handle collision
        }
    });
});
// 10,000 entities = 100,000,000 checks!

// ✅ CORRECT - Spatial partitioning
class SpatialGrid {
    private cellSize = 100;
    private grid = new Map<string, Entity[]>();
    
    insert(entity: Entity) {
        const cells = this.getCells(entity);
        cells.forEach(key => {
            if (!this.grid.has(key)) {
                this.grid.set(key, []);
            }
            this.grid.get(key)!.push(entity);
        });
    }
    
    getNearby(entity: Entity): Entity[] {
        const nearby: Entity[] = [];
        const cells = this.getCells(entity);
        
        cells.forEach(key => {
            if (this.grid.has(key)) {
                nearby.push(...this.grid.get(key)!);
            }
        });
        
        return nearby;
    }
    
    private getCells(entity: Entity): string[] {
        const minX = Math.floor(entity.x / this.cellSize);
        const maxX = Math.floor((entity.x + entity.width) / this.cellSize);
        const minY = Math.floor(entity.y / this.cellSize);
        const maxY = Math.floor((entity.y + entity.height) / this.cellSize);
        
        const cells: string[] = [];
        for (let y = minY; y <= maxY; y++) {
            for (let x = minX; x <= maxX; x++) {
                cells.push(`${x},${y}`);
            }
        }
        return cells;
    }
}
```

**Cause 3: Creating objects every frame**

```typescript
// ❌ WRONG - Creating objects in hot path
function draw(ctx: CanvasRenderingContext2D) {
    entities.forEach(entity => {
        const screenPos = {x: entity.x - camera.x, y: entity.y - camera.y}; // NEW OBJECT!
        ctx.fillRect(screenPos.x, screenPos.y, entity.width, entity.height);
    });
}

// ✅ CORRECT - Reuse or inline
function draw(ctx: CanvasRenderingContext2D) {
    entities.forEach(entity => {
        // Inline calculation, no object
        ctx.fillRect(
            entity.x - camera.x,
            entity.y - camera.y,
            entity.width,
            entity.height
        );
    });
}
```

**Cause 4: Expensive operations every frame**

```typescript
// ❌ WRONG - Sorting every frame
function draw(ctx: CanvasRenderingContext2D) {
    // Sort by Y for depth
    entities.sort((a, b) => a.y - b.y); // Expensive!
    entities.forEach(entity => entity.draw(ctx));
}

// ✅ CORRECT - Only sort when needed
class Game {
    private needsSort = false;
    
    addEntity(entity: Entity) {
        this.entities.push(entity);
        this.needsSort = true; // Mark dirty
    }
    
    draw(ctx: CanvasRenderingContext2D) {
        if (this.needsSort) {
            this.entities.sort((a, b) => a.y - b.y);
            this.needsSort = false;
        }
        
        this.entities.forEach(entity => entity.draw(ctx));
    }
}
```

### ✅ Complete Solution

```typescript
class OptimizedGame {
    private entities: Entity[] = [];
    private spatialGrid: SpatialGrid;
    private camera: Camera;
    
    constructor() {
        this.spatialGrid = new SpatialGrid(100); // 100px cells
    }
    
    update(deltaTime: number) {
        // Rebuild spatial grid
        this.spatialGrid.clear();
        this.entities.forEach(entity => this.spatialGrid.insert(entity));
        
        // Only update visible entities
        const viewport = this.camera.getViewportBounds();
        const visibleEntities = this.spatialGrid.getInBounds(viewport);
        
        visibleEntities.forEach(entity => {
            entity.update(deltaTime);
            
            // Check collisions with nearby entities only
            const nearby = this.spatialGrid.getNearby(entity);
            nearby.forEach(other => {
                if (entity !== other && entity.collidesWith(other)) {
                    entity.handleCollision(other);
                }
            });
        });
    }
    
    draw(ctx: CanvasRenderingContext2D) {
        // Get visible entities
        const viewport = this.camera.getViewportBounds();
        const visibleEntities = this.spatialGrid.getInBounds(viewport);
        
        ctx.save();
        ctx.translate(-this.camera.x, -this.camera.y);
        
        // Draw only visible
        visibleEntities.forEach(entity => {
            entity.draw(ctx);
        });
        
        ctx.restore();
        
        // Debug info
        ctx.fillStyle = 'white';
        ctx.fillText(
            `Entities: ${visibleEntities.length} / ${this.entities.length}`,
            10, 20
        );
    }
}
```

### 🛡️ Prevention

- ✅ Use viewport culling
- ✅ Implement spatial partitioning for >100 entities
- ✅ Avoid creating objects in hot paths
- ✅ Cache expensive calculations
- ✅ Only sort when needed
- ✅ Profile with many entities (1000+)

---

## Debug Tools

### Coordinate System Visualizer

```typescript
function drawDebugInfo(ctx: CanvasRenderingContext2D, camera: Camera, player: Player) {
    ctx.save();
    
    // Camera bounds (in world space)
    ctx.translate(-camera.x, -camera.y);
    ctx.strokeStyle = 'yellow';
    ctx.lineWidth = 2;
    ctx.strokeRect(camera.x, camera.y, camera.width, camera.height);
    
    // World bounds
    ctx.strokeStyle = 'red';
    ctx.lineWidth = 4;
    ctx.strokeRect(0, 0, camera.worldWidth, camera.worldHeight);
    
    // Grid lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    for (let x = 0; x < camera.worldWidth; x += 100) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, camera.worldHeight);
        ctx.stroke();
    }
    for (let y = 0; y < camera.worldHeight; y += 100) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(camera.worldWidth, y);
        ctx.stroke();
    }
    
    ctx.restore();
    
    // Info text
    ctx.fillStyle = 'white';
    ctx.font = '14px monospace';
    ctx.fillText(`Camera: (${camera.x.toFixed(0)}, ${camera.y.toFixed(0)})`, 10, 20);
    ctx.fillText(`Player World: (${player.x.toFixed(0)}, ${player.y.toFixed(0)})`, 10, 40);
    
    const screenPos = camera.worldToScreen(player.x, player.y);
    ctx.fillText(`Player Screen: (${screenPos.x.toFixed(0)}, ${screenPos.y.toFixed(0)})`, 10, 60);
}
```

---

**Next:** Common questions in `j-faq.md`! 🎮