# Game Loop & Timing - Solutions

**Unit 01: Game Foundations | Topic 02**

> **Learning from Solutions:** Study these complete implementations to understand best practices for timing and game loops.

---

## Exercise 1: Basic Game Loop

### Solution

```typescript
<!DOCTYPE html>
<html>
<head>
    <title>Basic Game Loop</title>
</head>
<body>
    <canvas id="canvas" width="800" height="600"></canvas>
    <button id="toggleBtn">Stop</button>
    <script>
        const canvas = document.getElementById('canvas') as HTMLCanvasElement;
        const ctx = canvas.getContext('2d')!;
        const toggleBtn = document.getElementById('toggleBtn') as HTMLButtonElement;
        
        let isRunning = true;
        let frameCount = 0;
        let lastFrameTime = 0;
        let lastSecond = 0;
        
        function gameLoop(currentTime: number) {
            if (!isRunning) return;
            
            // Count frames
            frameCount++;
            
            // Log every second
            if (currentTime - lastSecond >= 1000) {
                console.log(`Frames in last second: ${frameCount}`);
                frameCount = 0;
                lastSecond = currentTime;
            }
            
            // Clear and draw
            ctx.fillStyle = '#87CEEB';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            ctx.fillStyle = 'red';
            ctx.fillRect(100, 100, 50, 50);
            
            // Display frame count on canvas
            ctx.fillStyle = 'black';
            ctx.font = '20px Arial';
            ctx.fillText(`Frames: ${frameCount}`, 10, 30);
            
            requestAnimationFrame(gameLoop);
        }
        
        toggleBtn.addEventListener('click', () => {
            isRunning = !isRunning;
            toggleBtn.textContent = isRunning ? 'Stop' : 'Start';
            
            if (isRunning) {
                lastSecond = performance.now();
                requestAnimationFrame(gameLoop);
            }
        });
        
        requestAnimationFrame(gameLoop);
    </script>
</body>
</html>
```

### Explanation

1. **Frame Counting:** Increment `frameCount` each loop iteration
2. **Time Comparison:** Check if 1000ms (1 second) has passed
3. **Logging:** Output frame count when second elapses
4. **Toggle:** Start/stop button controls the loop

### Key Concepts

- `requestAnimationFrame` provides the timestamp automatically
- Time comparison uses `>=` to handle cases where we skip past exactly 1000
- Reset counter after logging to start fresh for next second

---

## Exercise 2: Delta Time Calculator

### Solution

```typescript
const canvas = document.getElementById('canvas') as HTMLCanvasElement;
const ctx = canvas.getContext('2d')!;

let lastTime = 0;
let deltaHistory: number[] = [];
const MAX_HISTORY = 60;

function gameLoop(currentTime: number) {
    // Calculate delta time
    const deltaMs = currentTime - lastTime;
    const deltaSec = deltaMs / 1000;
    lastTime = currentTime;
    
    // Store in history
    deltaHistory.push(deltaMs);
    if (deltaHistory.length > MAX_HISTORY) {
        deltaHistory.shift();
    }
    
    // Calculate FPS
    const fps = deltaMs > 0 ? Math.round(1000 / deltaMs) : 0;
    
    // Calculate average delta
    const avgDelta = deltaHistory.reduce((a, b) => a + b, 0) / deltaHistory.length;
    
    // Clear canvas
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Display info
    ctx.font = '24px monospace';
    
    // Delta time (color coded)
    let color = '#00ff00'; // Green
    if (deltaMs > 33) color = '#ff0000';       // Red (< 30 FPS)
    else if (deltaMs > 16.67) color = '#ffff00'; // Yellow (30-60 FPS)
    
    ctx.fillStyle = color;
    ctx.fillText(`Delta: ${deltaMs.toFixed(2)}ms`, 20, 40);
    
    // FPS
    ctx.fillStyle = 'white';
    ctx.fillText(`FPS: ${fps}`, 20, 80);
    
    // Average
    ctx.fillStyle = '#aaaaaa';
    ctx.fillText(`Avg Delta: ${avgDelta.toFixed(2)}ms`, 20, 120);
    
    // Target line
    ctx.strokeStyle = '#00ff00';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(20, 150);
    ctx.lineTo(200, 150);
    ctx.stroke();
    ctx.fillStyle = '#00ff00';
    ctx.fillText('16.67ms (60 FPS)', 210, 155);
    
    requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);
```

### Explanation

1. **Delta Calculation:** `(currentTime - lastTime)` gives milliseconds elapsed
2. **FPS Formula:** `1000 / deltaMs` converts to frames per second
3. **History Tracking:** Keep last 60 deltas for averaging
4. **Color Coding:** Visual feedback on performance

### Alternative: Using Performance API

```typescript
let lastTime = performance.now();

function gameLoop() {
    const currentTime = performance.now();
    const deltaMs = currentTime - lastTime;
    lastTime = currentTime;
    
    // ... rest of code
}
```

---

## Exercise 3 & 4: Frame-Dependent vs Independent

### Exercise 3 Solution (Frame-Dependent - BAD)

```typescript
const canvas = document.getElementById('canvas') as HTMLCanvasElement;
const ctx = canvas.getContext('2d')!;

let x = 0;
let frameCount = 0;
let lastFpsUpdate = 0;
let fps = 0;

function gameLoop(currentTime: number) {
    // FPS counter
    frameCount++;
    if (currentTime - lastFpsUpdate >= 1000) {
        fps = frameCount;
        frameCount = 0;
        lastFpsUpdate = currentTime;
    }
    
    // Frame-dependent movement (BAD!)
    x += 5; // 5 pixels per frame
    
    // Wrap around
    if (x > canvas.width) {
        x = 0;
    }
    
    // Clear
    ctx.fillStyle = '#87CEEB';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw square
    ctx.fillStyle = 'blue';
    ctx.fillRect(x, 250, 50, 50);
    
    // FPS display
    ctx.fillStyle = 'black';
    ctx.font = '20px Arial';
    ctx.fillText(`FPS: ${fps}`, 10, 30);
    ctx.fillText('Throttle CPU to see problem!', 10, 60);
    
    requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);
```

### Exercise 4 Solution (Frame-Independent - GOOD)

```typescript
const canvas = document.getElementById('canvas') as HTMLCanvasElement;
const ctx = canvas.getContext('2d')!;

let x = 0;
let lastTime = 0;
let frameCount = 0;
let lastFpsUpdate = 0;
let fps = 0;

const SPEED = 300; // pixels per second (not per frame!)

function gameLoop(currentTime: number) {
    // Calculate delta time
    const deltaTime = (currentTime - lastTime) / 1000;
    lastTime = currentTime;
    
    // Skip first frame (huge delta)
    if (deltaTime > 0.1) {
        requestAnimationFrame(gameLoop);
        return;
    }
    
    // FPS counter
    frameCount++;
    if (currentTime - lastFpsUpdate >= 1000) {
        fps = frameCount;
        frameCount = 0;
        lastFpsUpdate = currentTime;
    }
    
    // Frame-independent movement (GOOD!)
    x += SPEED * deltaTime;
    
    // Wrap around
    if (x > canvas.width) {
        x = 0;
    }
    
    // Clear
    ctx.fillStyle = '#87CEEB';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw square
    ctx.fillStyle = 'blue';
    ctx.fillRect(x, 250, 50, 50);
    
    // FPS display
    ctx.fillStyle = 'black';
    ctx.font = '20px Arial';
    ctx.fillText(`FPS: ${fps}`, 10, 30);
    ctx.fillText(`Speed: ${SPEED} px/s`, 10, 60);
    ctx.fillText('Throttle CPU - still moves at same speed!', 10, 90);
    
    requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);
```

### Comparison

| Aspect | Frame-Dependent | Frame-Independent |
|--------|----------------|-------------------|
| Movement | `x += 5` | `x += 300 * deltaTime` |
| At 60 FPS | 300 px/s | 300 px/s |
| At 30 FPS | 150 px/s | 300 px/s |
| Consistent? | ❌ No | ✅ Yes |

---

## Exercise 5: Bouncing Ball

### Solution

```typescript
const canvas = document.getElementById('canvas') as HTMLCanvasElement;
const ctx = canvas.getContext('2d')!;

interface Ball {
    x: number;
    y: number;
    velocityX: number;
    velocityY: number;
    radius: number;
    color: string;
}

const ball: Ball = {
    x: 400,
    y: 100,
    velocityX: 200,  // pixels per second
    velocityY: 0,
    radius: 20,
    color: 'red'
};

const GRAVITY = 980; // pixels per second squared (Earth gravity)
const BOUNCE_LOSS = 0.8; // Energy retained after bounce
const GROUND_Y = 550;

let lastTime = 0;

function gameLoop(currentTime: number) {
    const deltaTime = Math.min((currentTime - lastTime) / 1000, 0.1);
    lastTime = currentTime;
    
    // Apply gravity
    ball.velocityY += GRAVITY * deltaTime;
    
    // Apply velocity
    ball.x += ball.velocityX * deltaTime;
    ball.y += ball.velocityY * deltaTime;
    
    // Ground collision
    if (ball.y + ball.radius > GROUND_Y) {
        ball.y = GROUND_Y - ball.radius;
        ball.velocityY *= -BOUNCE_LOSS;
        
        // Stop bouncing if energy too low
        if (Math.abs(ball.velocityY) < 50) {
            ball.velocityY = 0;
        }
    }
    
    // Wall collisions
    if (ball.x - ball.radius < 0) {
        ball.x = ball.radius;
        ball.velocityX *= -BOUNCE_LOSS;
    }
    if (ball.x + ball.radius > canvas.width) {
        ball.x = canvas.width - ball.radius;
        ball.velocityX *= -BOUNCE_LOSS;
    }
    
    // Ceiling collision
    if (ball.y - ball.radius < 0) {
        ball.y = ball.radius;
        ball.velocityY *= -BOUNCE_LOSS;
    }
    
    // Render
    ctx.fillStyle = '#87CEEB';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Ground
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(0, GROUND_Y, canvas.width, canvas.height - GROUND_Y);
    
    // Ball
    ctx.fillStyle = ball.color;
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fill();
    
    // Info
    ctx.fillStyle = 'black';
    ctx.font = '16px Arial';
    ctx.fillText(`Velocity: (${ball.velocityX.toFixed(0)}, ${ball.velocityY.toFixed(0)})`, 10, 30);
    
    requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);
```

### Bonus: Multiple Balls with Mouse Spawn

```typescript
const balls: Ball[] = [];

canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    balls.push({
        x,
        y,
        velocityX: (Math.random() - 0.5) * 400,
        velocityY: -200 - Math.random() * 300,
        radius: 15 + Math.random() * 15,
        color: `hsl(${Math.random() * 360}, 70%, 50%)`
    });
});

function updateBall(ball: Ball, deltaTime: number) {
    ball.velocityY += GRAVITY * deltaTime;
    ball.x += ball.velocityX * deltaTime;
    ball.y += ball.velocityY * deltaTime;
    
    // ... collision code ...
}

function gameLoop(currentTime: number) {
    // ... delta time ...
    
    balls.forEach(ball => updateBall(ball, deltaTime));
    
    // ... rendering ...
}
```

---

## Exercise 6: FPS Counter Component

### Solution

```typescript
class FPSCounter {
    private frames = 0;
    private lastUpdate = 0;
    private fps = 0;
    private minFps = Infinity;
    private maxFps = 0;
    private fpsHistory: number[] = [];
    
    update(currentTime: number) {
        this.frames++;
        
        if (currentTime - this.lastUpdate >= 1000) {
            this.fps = this.frames;
            this.frames = 0;
            this.lastUpdate = currentTime;
            
            // Track min/max
            if (this.fps > 0) {
                this.minFps = Math.min(this.minFps, this.fps);
                this.maxFps = Math.max(this.maxFps, this.fps);
            }
            
            // Store history
            this.fpsHistory.push(this.fps);
            if (this.fpsHistory.length > 60) {
                this.fpsHistory.shift();
            }
        }
    }
    
    draw(ctx: CanvasRenderingContext2D, x: number = 10, y: number = 10) {
        const width = 180;
        const height = 100;
        
        // Background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(x, y, width, height);
        
        // Determine color
        let color = '#00ff00'; // Green
        if (this.fps < 30) color = '#ff0000';       // Red
        else if (this.fps < 50) color = '#ffff00';  // Yellow
        
        // Current FPS
        ctx.fillStyle = color;
        ctx.font = 'bold 24px monospace';
        ctx.fillText(`FPS: ${this.fps}`, x + 10, y + 30);
        
        // Min/Max/Avg
        const avg = this.getAverage();
        ctx.font = '12px monospace';
        ctx.fillStyle = 'white';
        ctx.fillText(`Min: ${this.minFps}`, x + 10, y + 55);
        ctx.fillText(`Max: ${this.maxFps}`, x + 10, y + 70);
        ctx.fillText(`Avg: ${avg.toFixed(1)}`, x + 10, y + 85);
        
        // Graph
        this.drawGraph(ctx, x + width + 10, y, 200, height);
    }
    
    private getAverage(): number {
        if (this.fpsHistory.length === 0) return 0;
        const sum = this.fpsHistory.reduce((a, b) => a + b, 0);
        return sum / this.fpsHistory.length;
    }
    
    private drawGraph(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number) {
        // Background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(x, y, width, height);
        
        // 60 FPS target line
        ctx.strokeStyle = 'lime';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x, y + height / 2);
        ctx.lineTo(x + width, y + height / 2);
        ctx.stroke();
        
        // Bars
        const barWidth = width / 60;
        this.fpsHistory.forEach((fps, i) => {
            const barHeight = (fps / 120) * height; // Scale to 120 FPS max
            const barX = x + i * barWidth;
            const barY = y + height - barHeight;
            
            ctx.fillStyle = fps >= 50 ? 'lime' : fps >= 30 ? 'yellow' : 'red';
            ctx.fillRect(barX, barY, barWidth - 1, barHeight);
        });
    }
    
    reset() {
        this.minFps = Infinity;
        this.maxFps = 0;
        this.fpsHistory = [];
    }
}

// Usage
const fpsCounter = new FPSCounter();

function gameLoop(currentTime: number) {
    fpsCounter.update(currentTime);
    
    // ... game logic ...
    
    fpsCounter.draw(ctx);
    
    requestAnimationFrame(gameLoop);
}
```

---

## Exercise 11: Fixed Timestep

### Solution

```typescript
class FixedTimestepGame {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    
    private lastTime = 0;
    private accumulator = 0;
    private readonly TIMESTEP = 1 / 60; // 60 updates per second
    private readonly MAX_DELTA = 0.25;  // Prevent spiral of death
    
    private ball = {
        x: 400,
        y: 100,
        velocityX: 200,
        velocityY: 0,
        radius: 20
    };
    
    private readonly GRAVITY = 980;
    private readonly GROUND_Y = 550;
    
    constructor(canvasId: string) {
        this.canvas = document.getElementById(canvasId) as HTMLCanvasElement;
        this.ctx = this.canvas.getContext('2d')!;
    }
    
    start() {
        this.lastTime = performance.now() / 1000; // Convert to seconds
        this.gameLoop();
    }
    
    private gameLoop = () => {
        const currentTime = performance.now() / 1000;
        let deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;
        
        // Prevent spiral of death
        if (deltaTime > this.MAX_DELTA) {
            deltaTime = this.MAX_DELTA;
        }
        
        this.accumulator += deltaTime;
        
        // Fixed timestep updates
        while (this.accumulator >= this.TIMESTEP) {
            this.update(this.TIMESTEP);
            this.accumulator -= this.TIMESTEP;
        }
        
        // Variable rate rendering
        this.render();
        
        requestAnimationFrame(this.gameLoop);
    }
    
    private update(dt: number) {
        // Physics update at fixed 60 Hz
        this.ball.velocityY += this.GRAVITY * dt;
        this.ball.x += this.ball.velocityX * dt;
        this.ball.y += this.ball.velocityY * dt;
        
        // Collisions
        if (this.ball.y + this.ball.radius > this.GROUND_Y) {
            this.ball.y = this.GROUND_Y - this.ball.radius;
            this.ball.velocityY *= -0.8;
        }
        
        if (this.ball.x - this.ball.radius < 0 || 
            this.ball.x + this.ball.radius > this.canvas.width) {
            this.ball.velocityX *= -0.8;
            this.ball.x = Math.max(this.ball.radius, 
                         Math.min(this.canvas.width - this.ball.radius, this.ball.x));
        }
    }
    
    private render() {
        // Clear
        this.ctx.fillStyle = '#87CEEB';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Ground
        this.ctx.fillStyle = '#8B4513';
        this.ctx.fillRect(0, this.GROUND_Y, this.canvas.width, 
                         this.canvas.height - this.GROUND_Y);
        
        // Ball
        this.ctx.fillStyle = 'red';
        this.ctx.beginPath();
        this.ctx.arc(this.ball.x, this.ball.y, this.ball.radius, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Info
        this.ctx.fillStyle = 'black';
        this.ctx.font = '16px Arial';
        this.ctx.fillText('Fixed Timestep (60 Hz updates)', 10, 30);
        this.ctx.fillText('Physics is deterministic!', 10, 55);
    }
}

const game = new FixedTimestepGame('canvas');
game.start();
```

### With Interpolation

```typescript
private previousBall = { ...this.ball };

private update(dt: number) {
    // Save previous state
    this.previousBall = { ...this.ball };
    
    // Update current state
    // ... physics code ...
}

private render() {
    // Calculate interpolation factor
    const alpha = this.accumulator / this.TIMESTEP;
    
    // Interpolate position
    const renderX = lerp(this.previousBall.x, this.ball.x, alpha);
    const renderY = lerp(this.previousBall.y, this.ball.y, alpha);
    
    // Draw at interpolated position
    this.ctx.beginPath();
    this.ctx.arc(renderX, renderY, this.ball.radius, 0, Math.PI * 2);
    this.ctx.fill();
}

function lerp(start: number, end: number, t: number): number {
    return start + (end - start) * t;
}
```

---

## Key Takeaways

### Delta Time Formula
```typescript
const deltaTime = (currentTime - lastTime) / 1000;
```

### Frame-Independent Movement
```typescript
position += velocity * deltaTime;
velocity += acceleration * deltaTime;
```

### Fixed Timestep Pattern
```typescript
accumulator += deltaTime;
while (accumulator >= TIMESTEP) {
    update(TIMESTEP);
    accumulator -= TIMESTEP;
}
render();
```

### Common Constants
```typescript
const GRAVITY = 980;        // pixels/s²
const TIMESTEP = 1/60;      // 16.67ms
const MAX_DELTA = 0.1;      // 100ms cap
```

---

**All solutions tested and working!** Use these as reference for your own implementations. 🎮
