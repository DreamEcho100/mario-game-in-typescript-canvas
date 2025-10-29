# World Coordinate System - Solutions

**Unit 01: Game Foundations | Topic 05**

> Complete solutions with explanations.

---

## Exercise 1: World vs Screen Coordinates ⭐

### Solution

```typescript
const canvas = document.getElementById('game') as HTMLCanvasElement;
const ctx = canvas.getContext('2d')!;
canvas.width = 800;
canvas.height = 600;

const world = {
    width: 2000,
    height: 600
};

const player = {
    x: 1000,  // World position
    y: 300,
    width: 32,
    height: 32
};

const camera = {
    x: 800,   // World position
    y: 0,
    width: canvas.width,
    height: canvas.height
};

function gameLoop() {
    // Clear canvas
    ctx.fillStyle = '#87CEEB';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Calculate screen position from world position
    const screenX = player.x - camera.x;
    const screenY = player.y - camera.y;
    
    // Draw player at screen position
    ctx.fillStyle = 'red';
    ctx.fillRect(screenX, screenY, player.width, player.height);
    
    // Display coordinates
    ctx.fillStyle = 'black';
    ctx.font = '14px monospace';
    ctx.fillText(`World: (${player.x}, ${player.y})`, 10, 20);
    ctx.fillText(`Screen: (${screenX}, ${screenY})`, 10, 40);
    ctx.fillText(`Camera: (${camera.x}, ${camera.y})`, 10, 60);
    
    // Log to console
    console.log(`Player world: (${player.x}, ${player.y})`);
    console.log(`Player screen: (${screenX}, ${screenY})`);
    
    requestAnimationFrame(gameLoop);
}

gameLoop();
```

### Explanation

**Key Formula:**
```
Screen Position = World Position - Camera Position
screenX = worldX - cameraX
screenY = worldY - cameraY
```

**With our values:**
```
screenX = 1000 - 800 = 200
screenY = 300 - 0 = 300
```

So the player at world position (1000, 300) appears at screen position (200, 300).

**Why this works:**
- The camera is at world position (800, 0)
- The camera shows world X from 800 to 1600 (800 + 800 canvas width)
- Player at world X = 1000 is 200 pixels into the camera's view
- Therefore appears at screen X = 200

### Alternative Approach: Canvas Translation

```typescript
function gameLoop() {
    ctx.fillStyle = '#87CEEB';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Translate canvas
    ctx.save();
    ctx.translate(-camera.x, -camera.y);
    
    // Draw player in world coordinates
    ctx.fillStyle = 'red';
    ctx.fillRect(player.x, player.y, player.width, player.height);
    
    ctx.restore();
    
    // UI in screen coordinates
    ctx.fillStyle = 'black';
    ctx.font = '14px monospace';
    ctx.fillText(`World: (${player.x}, ${player.y})`, 10, 20);
    
    requestAnimationFrame(gameLoop);
}
```

### Common Mistakes

❌ **Forgetting to subtract camera position:**
```typescript
ctx.fillRect(player.x, player.y, 32, 32); // Wrong! Uses world coords directly
```

❌ **Adding instead of subtracting:**
```typescript
const screenX = player.x + camera.x; // Wrong direction!
```

❌ **Mixing world and screen coordinates:**
```typescript
ctx.fillRect(player.x, screenY, 32, 32); // Inconsistent!
```

### Key Takeaways

- **World space:** Absolute positions in the game world
- **Screen space:** Positions relative to the canvas
- **Conversion:** Screen = World - Camera
- **Entities store world positions, not screen positions**

---

## Exercise 2: Basic Camera Follow ⭐

### Solution

```typescript
const canvas = document.getElementById('game') as HTMLCanvasElement;
const ctx = canvas.getContext('2d')!;
canvas.width = 800;
canvas.height = 600;

const world = {
    width: 3000,
    height: 600
};

const player = {
    x: 400,
    y: 300,
    width: 32,
    height: 32,
    speed: 200
};

const camera = {
    x: 0,
    y: 0,
    width: canvas.width,
    height: canvas.height
};

// Input
const keys = new Set<string>();
window.addEventListener('keydown', (e) => keys.add(e.key));
window.addEventListener('keyup', (e) => keys.delete(e.key));

let lastTime = 0;

function gameLoop(time: number) {
    const deltaTime = (time - lastTime) / 1000;
    lastTime = time;
    
    // Update player
    if (keys.has('ArrowRight')) player.x += player.speed * deltaTime;
    if (keys.has('ArrowLeft')) player.x -= player.speed * deltaTime;
    if (keys.has('ArrowDown')) player.y += player.speed * deltaTime;
    if (keys.has('ArrowUp')) player.y -= player.speed * deltaTime;
    
    // Keep player in world
    player.x = Math.max(0, Math.min(player.x, world.width - player.width));
    player.y = Math.max(0, Math.min(player.y, world.height - player.height));
    
    // Update camera to center on player
    camera.x = player.x - camera.width / 2;
    camera.y = player.y - camera.height / 2;
    
    // Clamp camera to world bounds
    camera.x = Math.max(0, Math.min(camera.x, world.width - camera.width));
    camera.y = Math.max(0, Math.min(camera.y, world.height - camera.height));
    
    // Draw
    draw();
    
    requestAnimationFrame(gameLoop);
}

function draw() {
    // Clear
    ctx.fillStyle = '#5c94fc';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw world bounds (translated)
    ctx.save();
    ctx.translate(-camera.x, -camera.y);
    
    // World background
    ctx.fillStyle = '#8BC34A';
    ctx.fillRect(0, 0, world.width, world.height);
    
    // Grid to show scrolling
    ctx.strokeStyle = 'rgba(0,0,0,0.1)';
    for (let x = 0; x < world.width; x += 100) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, world.height);
        ctx.stroke();
    }
    
    // Player
    ctx.fillStyle = 'red';
    ctx.fillRect(player.x, player.y, player.width, player.height);
    
    ctx.restore();
    
    // UI
    ctx.fillStyle = 'white';
    ctx.font = '14px monospace';
    ctx.fillText(`Player: (${player.x.toFixed(0)}, ${player.y.toFixed(0)})`, 10, 20);
    ctx.fillText(`Camera: (${camera.x.toFixed(0)}, ${camera.y.toFixed(0)})`, 10, 40);
}

gameLoop(0);
```

### Explanation

**Camera Centering:**
```typescript
camera.x = player.x - camera.width / 2;
camera.y = player.y - camera.height / 2;
```

This positions the camera so the player is in the center of the view.

**Example:**
- Player at world X = 1000
- Camera width = 800
- Camera X = 1000 - 400 = 600
- Camera shows world X from 600 to 1400
- Player at 1000 is in the middle

**Camera Clamping:**
```typescript
camera.x = Math.max(0, Math.min(camera.x, world.width - camera.width));
```

This prevents the camera from showing space beyond the world:
- `Math.max(0, ...)` prevents negative camera position (showing left of world)
- `Math.min(..., world.width - camera.width)` prevents showing right of world

**When does clamping activate?**
- At world start: player near x=0, camera would go negative
- At world end: player near x=3000, camera would show past world

### Performance Notes

- **Drawing grid every frame is expensive for large worlds**
- Better: Pre-render grid to an offscreen canvas
- Or: Only draw grid lines visible on screen

### Alternative: Separate Update Functions

```typescript
function updatePlayer(deltaTime: number) {
    if (keys.has('ArrowRight')) player.x += player.speed * deltaTime;
    if (keys.has('ArrowLeft')) player.x -= player.speed * deltaTime;
    player.x = Math.max(0, Math.min(player.x, world.width - player.width));
}

function updateCamera() {
    camera.x = player.x - camera.width / 2;
    camera.x = Math.max(0, Math.min(camera.x, world.width - camera.width));
}

function gameLoop(time: number) {
    const deltaTime = (time - lastTime) / 1000;
    lastTime = time;
    
    updatePlayer(deltaTime);
    updateCamera();
    draw();
    
    requestAnimationFrame(gameLoop);
}
```

### Common Mistakes

❌ **Forgetting to clamp camera:**
```typescript
camera.x = player.x - camera.width / 2;
// Camera can show past world edges!
```

❌ **Clamping player instead of camera:**
```typescript
player.x = Math.max(camera.width/2, Math.min(player.x, world.width - camera.width/2));
// Player can't reach edges!
```

❌ **Not using deltaTime:**
```typescript
player.x += 200; // Frame-rate dependent!
```

### Key Takeaways

- **Center formula:** `camera.pos = player.pos - camera.size / 2`
- **Always clamp camera to world bounds**
- **Use deltaTime for frame-rate independent movement**
- **Camera follows player, not the other way around**

---

## Exercise 3: Smooth Camera Follow ⭐⭐

### Solution

```typescript
const canvas = document.getElementById('game') as HTMLCanvasElement;
const ctx = canvas.getContext('2d')!;
canvas.width = 800;
canvas.height = 600;

const world = { width: 3000, height: 600 };
const player = { x: 400, y: 300, width: 32, height: 32, speed: 300 };
const camera = { x: 0, y: 0, width: 800, height: 600, smoothness: 0.1 };

// Input
const keys = new Set<string>();
window.addEventListener('keydown', (e) => keys.add(e.key));
window.addEventListener('keyup', (e) => keys.delete(e.key));

// Smoothness slider
const slider = document.createElement('input');
slider.type = 'range';
slider.min = '0.01';
slider.max = '1';
slider.step = '0.01';
slider.value = '0.1';
slider.style.position = 'absolute';
slider.style.top = '10px';
slider.style.left = '10px';
document.body.appendChild(slider);

const label = document.createElement('div');
label.style.position = 'absolute';
label.style.top = '35px';
label.style.left = '10px';
label.style.color = 'white';
label.textContent = 'Smoothness: 0.1';
document.body.appendChild(label);

slider.addEventListener('input', () => {
    camera.smoothness = parseFloat(slider.value);
    label.textContent = `Smoothness: ${camera.smoothness.toFixed(2)}`;
});

let lastTime = 0;

function gameLoop(time: number) {
    const deltaTime = (time - lastTime) / 1000;
    lastTime = time;
    
    // Update player
    if (keys.has('ArrowRight')) player.x += player.speed * deltaTime;
    if (keys.has('ArrowLeft')) player.x -= player.speed * deltaTime;
    player.x = Math.max(0, Math.min(player.x, world.width - player.width));
    
    // Smooth camera follow with lerp
    const targetX = player.x - camera.width / 2;
    const targetY = player.y - camera.height / 2;
    
    // Linear interpolation
    camera.x += (targetX - camera.x) * camera.smoothness;
    camera.y += (targetY - camera.y) * camera.smoothness;
    
    // Clamp camera
    camera.x = Math.max(0, Math.min(camera.x, world.width - camera.width));
    camera.y = Math.max(0, Math.min(camera.y, world.height - camera.height));
    
    draw();
    requestAnimationFrame(gameLoop);
}

function draw() {
    ctx.fillStyle = '#5c94fc';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.save();
    ctx.translate(-camera.x, -camera.y);
    
    // World
    ctx.fillStyle = '#8BC34A';
    ctx.fillRect(0, 0, world.width, world.height);
    
    // Grid
    ctx.strokeStyle = 'rgba(0,0,0,0.1)';
    for (let x = 0; x < world.width; x += 100) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, world.height);
        ctx.stroke();
    }
    
    // Target position (where camera wants to be)
    const targetX = player.x - camera.width / 2;
    ctx.strokeStyle = 'rgba(255,255,0,0.5)';
    ctx.strokeRect(targetX, 0, camera.width, camera.height);
    
    // Player
    ctx.fillStyle = 'red';
    ctx.fillRect(player.x, player.y, player.width, player.height);
    
    ctx.restore();
    
    // UI
    ctx.fillStyle = 'white';
    ctx.font = '14px monospace';
    ctx.fillText(`Smoothness: ${camera.smoothness.toFixed(2)}`, 10, 70);
    ctx.fillText(`Distance to target: ${Math.abs(targetX - camera.x).toFixed(1)}px`, 10, 90);
}

gameLoop(0);
```

### Explanation

**Linear Interpolation (Lerp) Formula:**
```typescript
current += (target - current) * smoothness;
```

**How it works:**
- `target - current` = distance to target
- Multiply by smoothness (0.0 to 1.0)
- Move a fraction of the distance each frame

**Example with smoothness = 0.1:**
```
Frame 1: camera.x = 0, target = 1000
  → camera.x += (1000 - 0) * 0.1 = 100
  → camera.x = 100

Frame 2: camera.x = 100, target = 1000
  → camera.x += (1000 - 100) * 0.1 = 90
  → camera.x = 190

Frame 3: camera.x = 190, target = 1000
  → camera.x += (1000 - 190) * 0.1 = 81
  → camera.x = 271

// Gradually approaches 1000
```

**Smoothness values:**
- `1.0`: Instant (no smoothing)
- `0.5`: Moves half the distance each frame
- `0.1`: Moves 10% of the distance each frame (smooth)
- `0.01`: Moves 1% of the distance each frame (very smooth, might feel laggy)

**Frame-rate independence:**

The formula shown is frame-rate dependent. For frame-rate independent smoothing:

```typescript
const smoothness = 1 - Math.pow(0.001, deltaTime);
camera.x += (targetX - camera.x) * smoothness;
```

This ensures the same smoothing feel regardless of FPS.

### Alternative: Fixed Speed

Instead of lerp, move toward target at fixed speed:

```typescript
const targetX = player.x - camera.width / 2;
const dx = targetX - camera.x;
const distance = Math.abs(dx);

if (distance > 0.1) {
    const direction = Math.sign(dx);
    const moveAmount = Math.min(200 * deltaTime, distance);
    camera.x += direction * moveAmount;
}
```

This gives constant camera speed rather than easing.

### Performance Notes

- Lerp is very cheap (just multiplication and addition)
- No performance concerns even with many cameras

### Common Mistakes

❌ **Smoothness too low (feels laggy):**
```typescript
camera.smoothness = 0.001; // Too smooth, camera lags behind
```

❌ **Not frame-rate independent:**
```typescript
camera.x += (targetX - camera.x) * 0.1; // FPS-dependent
```

❌ **Applying smoothness to clamped value:**
```typescript
camera.x = Math.max(0, Math.min(camera.x, worldWidth - cameraWidth));
camera.x += (targetX - camera.x) * smoothness; // Wrong order!
```

### Key Takeaways

- **Lerp formula:** `current += (target - current) * smoothness`
- **Lower smoothness = smoother but slower**
- **Higher smoothness = more responsive**
- **Apply smoothness before clamping**
- **Sweet spot: 0.05 to 0.15**

---

## Exercise 4: Camera Deadzone ⭐⭐

### Solution

```typescript
const canvas = document.getElementById('game') as HTMLCanvasElement;
const ctx = canvas.getContext('2d')!;
canvas.width = 800;
canvas.height = 600;

const world = { width: 3000, height: 600 };
const player = { x: 1500, y: 300, width: 32, height: 32, speed: 200 };
const camera = {
    x: 1100,
    y: 0,
    width: 800,
    height: 600,
    deadzoneWidth: 300,
    deadzoneHeight: 200
};

const keys = new Set<string>();
window.addEventListener('keydown', (e) => keys.add(e.key));
window.addEventListener('keyup', (e) => keys.delete(e.key));

let lastTime = 0;

function gameLoop(time: number) {
    const deltaTime = (time - lastTime) / 1000;
    lastTime = time;
    
    // Update player
    if (keys.has('ArrowRight')) player.x += player.speed * deltaTime;
    if (keys.has('ArrowLeft')) player.x -= player.speed * deltaTime;
    if (keys.has('ArrowDown')) player.y += player.speed * deltaTime;
    if (keys.has('ArrowUp')) player.y -= player.speed * deltaTime;
    
    player.x = Math.max(0, Math.min(player.x, world.width - player.width));
    player.y = Math.max(0, Math.min(player.y, world.height - player.height));
    
    // Update camera with deadzone
    updateCameraDeadzone();
    
    // Clamp camera
    camera.x = Math.max(0, Math.min(camera.x, world.width - camera.width));
    camera.y = Math.max(0, Math.min(camera.y, world.height - camera.height));
    
    draw();
    requestAnimationFrame(gameLoop);
}

function updateCameraDeadzone() {
    // Calculate player position relative to camera
    const relativeX = player.x - camera.x;
    const relativeY = player.y - camera.y;
    
    // Calculate deadzone boundaries (in screen space)
    const deadzoneLeft = camera.width / 2 - camera.deadzoneWidth / 2;
    const deadzoneRight = camera.width / 2 + camera.deadzoneWidth / 2;
    const deadzoneTop = camera.height / 2 - camera.deadzoneHeight / 2;
    const deadzoneBottom = camera.height / 2 + camera.deadzoneHeight / 2;
    
    // Move camera if player outside deadzone
    if (relativeX < deadzoneLeft) {
        camera.x = player.x - deadzoneLeft;
    } else if (relativeX > deadzoneRight) {
        camera.x = player.x - deadzoneRight;
    }
    
    if (relativeY < deadzoneTop) {
        camera.y = player.y - deadzoneTop;
    } else if (relativeY > deadzoneBottom) {
        camera.y = player.y - deadzoneBottom;
    }
}

function draw() {
    ctx.fillStyle = '#5c94fc';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.save();
    ctx.translate(-camera.x, -camera.y);
    
    // World
    ctx.fillStyle = '#8BC34A';
    ctx.fillRect(0, 0, world.width, world.height);
    
    // Player
    ctx.fillStyle = 'red';
    ctx.fillRect(player.x, player.y, player.width, player.height);
    
    ctx.restore();
    
    // Deadzone outline (screen space)
    const deadzoneX = camera.width / 2 - camera.deadzoneWidth / 2;
    const deadzoneY = camera.height / 2 - camera.deadzoneHeight / 2;
    
    ctx.strokeStyle = 'rgba(255, 255, 0, 0.5)';
    ctx.lineWidth = 2;
    ctx.setLineDash([10, 5]);
    ctx.strokeRect(deadzoneX, deadzoneY, camera.deadzoneWidth, camera.deadzoneHeight);
    ctx.setLineDash([]);
    
    // UI
    ctx.fillStyle = 'white';
    ctx.font = '14px monospace';
    ctx.fillText(`Player: (${player.x.toFixed(0)}, ${player.y.toFixed(0)})`, 10, 20);
    ctx.fillText(`Camera: (${camera.x.toFixed(0)}, ${camera.y.toFixed(0)})`, 10, 40);
    
    // Check if player in deadzone
    const relativeX = player.x - camera.x;
    const relativeY = player.y - camera.y;
    const inDeadzoneX = relativeX >= deadzoneX && relativeX <= deadzoneX + camera.deadzoneWidth;
    const inDeadzoneY = relativeY >= deadzoneY && relativeY <= deadzoneY + camera.deadzoneHeight;
    const inDeadzone = inDeadzoneX && inDeadzoneY;
    
    ctx.fillText(`In deadzone: ${inDeadzone}`, 10, 60);
}

gameLoop(0);
```

### Explanation

**Deadzone Concept:**

The deadzone is a rectangular area in the center of the screen. The camera only moves when the player exits this area.

```
Screen:
┌──────────────────────────┐
│                          │
│      ┌─────────┐         │
│      │Deadzone │         │
│      │    ⬤    │         │ ← Player in deadzone
│      └─────────┘         │   Camera doesn't move
│                          │
└──────────────────────────┘
```

**Deadzone Boundaries (Screen Space):**
```typescript
const deadzoneLeft = camera.width / 2 - camera.deadzoneWidth / 2;
const deadzoneRight = camera.width / 2 + camera.deadzoneWidth / 2;
const deadzoneTop = camera.height / 2 - camera.deadzoneHeight / 2;
const deadzoneBottom = camera.height / 2 + camera.deadzoneHeight / 2;
```

For camera width 800 and deadzone width 300:
- Left edge: 400 - 150 = 250
- Right edge: 400 + 150 = 550
- Deadzone spans screen X from 250 to 550

**Player Position Relative to Camera:**
```typescript
const relativeX = player.x - camera.x;
```

This gives the player's position in screen space (0 to camera.width).

**Camera Update Logic:**
```typescript
if (relativeX < deadzoneLeft) {
    camera.x = player.x - deadzoneLeft;
}
```

When player's screen X is less than the deadzone left edge:
- Move camera so player is AT the left edge of deadzone
- This pushes the player back into the deadzone

**Example:**
```
Player world X: 200
Camera X: 100
Relative X: 200 - 100 = 100
Deadzone left: 250

100 < 250, so move camera:
camera.x = 200 - 250 = -50
(Then clamped to 0)
```

### Alternative: Smooth Deadzone Exit

Instead of instant camera movement when exiting deadzone, add smoothing:

```typescript
function updateCameraDeadzone() {
    const relativeX = player.x - camera.x;
    const deadzoneLeft = camera.width / 2 - camera.deadzoneWidth / 2;
    const deadzoneRight = camera.width / 2 + camera.deadzoneWidth / 2;
    
    let targetX = camera.x;
    
    if (relativeX < deadzoneLeft) {
        targetX = player.x - deadzoneLeft;
    } else if (relativeX > deadzoneRight) {
        targetX = player.x - deadzoneRight;
    }
    
    // Smooth transition
    camera.x += (targetX - camera.x) * 0.1;
}
```

### Performance Notes

- Deadzone calculations are very cheap
- No performance concerns

### Common Mistakes

❌ **Using world coordinates for deadzone:**
```typescript
if (player.x < deadzoneLeft) // ❌ Comparing world to screen!
```

❌ **Deadzone not centered:**
```typescript
const deadzoneLeft = 0; // ❌ Deadzone at edge, not center
```

❌ **Forgetting player size:**
```typescript
if (relativeX < deadzoneLeft) // ❌ Should use player.x + player.width/2
```

### Key Takeaways

- **Deadzone in screen space, not world space**
- **Calculate relative position first**
- **Only move camera when player exits deadzone**
- **Smooth camera movement optional but feels better**
- **Common deadzone sizes: 200-400 pixels**

---

## Exercise 5: Camera Bounds ⭐

### Solution

```typescript
const canvas = document.getElementById('game') as HTMLCanvasElement;
const ctx = canvas.getContext('2d')!;
canvas.width = 800;
canvas.height = 600;

// World smaller than expected
const world = { width: 1500, height: 600 };
const player = { x: 750, y: 300, width: 32, height: 32, speed: 200 };
const camera = { x: 0, y: 0, width: 800, height: 600 };

const keys = new Set<string>();
window.addEventListener('keydown', (e) => keys.add(e.key));
window.addEventListener('keyup', (e) => keys.delete(e.key));

let lastTime = 0;

function gameLoop(time: number) {
    const deltaTime = (time - lastTime) / 1000;
    lastTime = time;
    
    // Update player
    if (keys.has('ArrowRight')) player.x += player.speed * deltaTime;
    if (keys.has('ArrowLeft')) player.x -= player.speed * deltaTime;
    player.x = Math.max(0, Math.min(player.x, world.width - player.width));
    
    // Center camera on player
    camera.x = player.x - camera.width / 2;
    
    // Clamp camera to world bounds
    const minCameraX = 0;
    const maxCameraX = world.width - camera.width;
    const prevCameraX = camera.x;
    camera.x = Math.max(minCameraX, Math.min(camera.x, maxCameraX));
    
    // Check if camera is clamped
    const isClamped = camera.x !== prevCameraX;
    
    draw(isClamped);
    requestAnimationFrame(gameLoop);
}

function draw(isClamped: boolean) {
    ctx.fillStyle = '#5c94fc';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.save();
    ctx.translate(-camera.x, -camera.y);
    
    // World
    ctx.fillStyle = '#8BC34A';
    ctx.fillRect(0, 0, world.width, world.height);
    
    // World bounds
    ctx.strokeStyle = 'red';
    ctx.lineWidth = 4;
    ctx.strokeRect(0, 0, world.width, world.height);
    
    // Player
    ctx.fillStyle = 'blue';
    ctx.fillRect(player.x, player.y, player.width, player.height);
    
    ctx.restore();
    
    // UI
    ctx.fillStyle = 'white';
    ctx.font = '14px monospace';
    ctx.fillText(`World: ${world.width}×${world.height}`, 10, 20);
    ctx.fillText(`Canvas: ${canvas.width}×${canvas.height}`, 10, 40);
    ctx.fillText(`Camera: (${camera.x.toFixed(0)}, ${camera.y})`, 10, 60);
    ctx.fillText(`Player: (${player.x.toFixed(0)}, ${player.y})`, 10, 80);
    
    // Clamped indicator
    if (isClamped) {
        ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = 'white';
        ctx.font = 'bold 20px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('CAMERA CLAMPED', canvas.width / 2, canvas.height / 2);
        ctx.textAlign = 'left';
    }
    
    // Show clamp boundaries
    ctx.fillStyle = 'yellow';
    ctx.font = '12px monospace';
    ctx.fillText(`Min camera X: 0`, 10, 120);
    ctx.fillText(`Max camera X: ${world.width - camera.width}`, 10, 140);
    ctx.fillText(`Current camera X: ${camera.x.toFixed(0)}`, 10, 160);
}

gameLoop(0);
```

### Explanation

**Why Camera Bounds Matter:**

Without clamping:
```
World: 1500px wide
Canvas: 800px wide
Player at X = 100:
  camera.x = 100 - 400 = -300  ← NEGATIVE!
  Shows 300px of empty space to the left
```

**Clamping Formula:**
```typescript
camera.x = Math.max(minX, Math.min(camera.x, maxX));
```

This is equivalent to:
```typescript
if (camera.x < minX) camera.x = minX;
if (camera.x > maxX) camera.x = maxX;
```

**Calculating Max Camera Position:**
```typescript
const maxCameraX = world.width - camera.width;
// = 1500 - 800 = 700
```

When camera.x = 700:
- Camera shows world X from 700 to 1500 (exactly the right edge)
- Any higher would show past the world

**When Does Clamping Activate?**

Left clamp (camera.x = 0):
- Player near left edge of world
- Player X < 400 (half screen width)

Right clamp (camera.x = 700):
- Player near right edge of world
- Player X > 1100 (world.width - 400)

**Visual Indicator:**

The red overlay shows when camera is clamped, helping you understand when bounds are active.

### Alternative: Elastic Bounds

Instead of hard clamping, add elastic "pull" at boundaries:

```typescript
function updateCamera() {
    camera.x = player.x - camera.width / 2;
    
    // Elastic bounds
    if (camera.x < 0) {
        camera.x *= 0.5; // Pull back
    } else if (camera.x > world.width - camera.width) {
        const excess = camera.x - (world.width - camera.width);
        camera.x = (world.width - camera.width) + excess * 0.5;
    }
}
```

This allows slight overshoot that bounces back.

### Performance Notes

- Clamping with Math.max/min is very fast
- No performance concerns

### Common Mistakes

❌ **Wrong max calculation:**
```typescript
const maxCameraX = world.width; // ❌ Too far!
// Should be: world.width - camera.width
```

❌ **Clamping player instead of camera:**
```typescript
player.x = Math.max(0, Math.min(player.x, world.width - camera.width));
// ❌ Player can't reach edges!
```

❌ **Not clamping Y:**
```typescript
camera.x = Math.max(0, Math.min(camera.x, world.width - camera.width));
// But forgot camera.y! ❌
```

### Key Takeaways

- **Always clamp camera to world bounds**
- **Max camera position = world size - camera size**
- **Clamp after all other camera updates**
- **Clamping prevents black bars/empty space**
- **Works for both X and Y axes**

---

## Exercise 6: Viewport Culling ⭐⭐

### Solution

```typescript
const canvas = document.getElementById('game') as HTMLCanvasElement;
const ctx = canvas.getContext('2d')!;
canvas.width = 800;
canvas.height = 600;

const world = { width: 5000, height: 600 };

interface Entity {
    x: number;
    y: number;
    width: number;
    height: number;
    color: string;
}

const player: Entity = {
    x: 400,
    y: 300,
    width: 32,
    height: 32,
    color: 'red',
    speed: 300
} as any;

const camera = { x: 0, y: 0, width: 800, height: 600 };

// Create 100 entities
const entities: Entity[] = [];
for (let i = 0; i < 100; i++) {
    entities.push({
        x: Math.random() * world.width,
        y: Math.random() * world.height,
        width: 20 + Math.random() * 40,
        height: 20 + Math.random() * 40,
        color: `hsl(${Math.random() * 360}, 70%, 50%)`
    });
}

const keys = new Set<string>();
window.addEventListener('keydown', (e) => keys.add(e.key));
window.addEventListener('keyup', (e) => keys.delete(e.key));

function isOnScreen(entity: Entity, camera: any, margin = 0): boolean {
    return entity.x + entity.width > camera.x - margin &&
           entity.x < camera.x + camera.width + margin &&
           entity.y + entity.height > camera.y - margin &&
           entity.y < camera.y + camera.height + margin;
}

let lastTime = 0;

function gameLoop(time: number) {
    const deltaTime = (time - lastTime) / 1000;
    lastTime = time;
    
    // Update player
    if (keys.has('ArrowRight')) player.x += (player as any).speed * deltaTime;
    if (keys.has('ArrowLeft')) player.x -= (player as any).speed * deltaTime;
    player.x = Math.max(0, Math.min(player.x, world.width - player.width));
    
    // Update camera
    camera.x = player.x - camera.width / 2;
    camera.x = Math.max(0, Math.min(camera.x, world.width - camera.width));
    
    draw();
    requestAnimationFrame(gameLoop);
}

function draw() {
    ctx.fillStyle = '#5c94fc';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Count visible entities
    let visibleCount = 0;
    let drawnCount = 0;
    
    ctx.save();
    ctx.translate(-camera.x, -camera.y);
    
    // World background
    ctx.fillStyle = '#8BC34A';
    ctx.fillRect(0, 0, world.width, world.height);
    
    // Draw only visible entities
    entities.forEach(entity => {
        if (isOnScreen(entity, camera)) {
            visibleCount++;
            
            // Draw entity
            ctx.fillStyle = entity.color;
            ctx.fillRect(entity.x, entity.y, entity.width, entity.height);
            drawnCount++;
        }
    });
    
    // Player always drawn
    ctx.fillStyle = player.color;
    ctx.fillRect(player.x, player.y, player.width, player.height);
    
    ctx.restore();
    
    // UI
    ctx.fillStyle = 'white';
    ctx.font = '16px monospace';
    ctx.fillText(`Drawn: ${drawnCount} / Total: ${entities.length}`, 10, 25);
    ctx.fillText(`Visible: ${visibleCount}`, 10, 50);
    ctx.fillText(`Camera X: ${camera.x.toFixed(0)}`, 10, 75);
    
    // Performance info
    ctx.fillText(`Performance gain: ${((1 - drawnCount / entities.length) * 100).toFixed(0)}%`, 10, 100);
}

gameLoop(0);
```

### Explanation

**Culling Check:**
```typescript
function isOnScreen(entity: Entity, camera: Camera): boolean {
    return entity.x + entity.width > camera.x &&
           entity.x < camera.x + camera.width &&
           entity.y + entity.height > camera.y &&
           entity.y < camera.y + camera.height;
}
```

**How it works:**

Check if entity overlaps with camera viewport:
1. `entity.x + entity.width > camera.x`: Entity's right edge is past camera's left edge
2. `entity.x < camera.x + camera.width`: Entity's left edge is before camera's right edge
3. Same logic for Y axis

**Visualization:**
```
Camera viewport:
┌────────────────┐
│                │
│   ┌──┐         │  ← Entity visible (overlaps)
│   └──┘         │
│                │
└────────────────┘
     ┌──┐           ← Entity not visible (outside)
     └──┘
```

**Margin for Smooth Entry:**

Add margin to keep entities slightly off-screen rendered:

```typescript
function isOnScreen(entity: Entity, camera: Camera, margin = 50): boolean {
    return entity.x + entity.width > camera.x - margin &&
           entity.x < camera.x + camera.width + margin &&
           entity.y + entity.height > camera.y - margin &&
           entity.y < camera.y + camera.height + margin;
}
```

This prevents entities from "popping" in at the screen edge.

**Performance Impact:**

Without culling:
- Drawing 100 entities every frame
- Many off-screen (wasted rendering)

With culling:
- Drawing only 10-20 entities
- 80% fewer draw calls
- Much better performance

### Alternative: Spatial Partitioning

For very large numbers of entities (1000+), use a grid:

```typescript
class SpatialGrid {
    private grid: Map<string, Entity[]> = new Map();
    private cellSize = 100;
    
    add(entity: Entity) {
        const cellX = Math.floor(entity.x / this.cellSize);
        const cellY = Math.floor(entity.y / this.cellSize);
        const key = `${cellX},${cellY}`;
        
        if (!this.grid.has(key)) {
            this.grid.set(key, []);
        }
        this.grid.get(key)!.push(entity);
    }
    
    getNearby(camera: Camera): Entity[] {
        const startCellX = Math.floor(camera.x / this.cellSize);
        const endCellX = Math.floor((camera.x + camera.width) / this.cellSize);
        const startCellY = Math.floor(camera.y / this.cellSize);
        const endCellY = Math.floor((camera.y + camera.height) / this.cellSize);
        
        const nearby: Entity[] = [];
        for (let x = startCellX; x <= endCellX; x++) {
            for (let y = startCellY; y <= endCellY; y++) {
                const key = `${x},${y}`;
                if (this.grid.has(key)) {
                    nearby.push(...this.grid.get(key)!);
                }
            }
        }
        return nearby;
    }
}
```

### Performance Notes

- Culling check is very cheap (4 comparisons)
- Saves expensive drawing operations
- Essential for games with many entities
- Always use culling for entities beyond ~100

### Common Mistakes

❌ **Checking only X or Y:**
```typescript
return entity.x > camera.x; // ❌ Incomplete check
```

❌ **Forgetting entity size:**
```typescript
return entity.x > camera.x && entity.x < camera.x + camera.width;
// ❌ Should check entity.x + entity.width
```

❌ **Culling player:**
```typescript
if (isOnScreen(player, camera)) {
    player.update(); // ❌ Player might not update!
}
```

### Key Takeaways

- **Always cull off-screen entities**
- **Check overlap between entity bounds and camera bounds**
- **Add margin for smooth entry/exit**
- **Massive performance improvement for large worlds**
- **Culling check is cheap, drawing is expensive**

---

*Due to length, I'll continue with remaining exercises in the next response...*

### Key Formulas Summary

**World to Screen:**
```typescript
screenX = worldX - camera.x
screenY = worldY - camera.y
```

**Screen to World:**
```typescript
worldX = screenX + camera.x
worldY = screenY + camera.y
```

**Camera Center on Player:**
```typescript
camera.x = player.x - camera.width / 2
camera.y = player.y - camera.height / 2
```

**Camera Clamp:**
```typescript
camera.x = Math.max(0, Math.min(camera.x, worldWidth - cameraWidth))
camera.y = Math.max(0, Math.min(camera.y, worldHeight - cameraHeight))
```

**Smooth Follow (Lerp):**
```typescript
camera.x += (targetX - camera.x) * smoothness
```

**On-Screen Check:**
```typescript
isVisible = 
    entityX + entityWidth > cameraX &&
    entityX < cameraX + cameraWidth &&
    entityY + entityHeight > cameraY &&
    entityY < cameraY + cameraHeight
```

---

**Next:** Quick reference in `d-notes.md`! 🎮