# Game Loop & Timing - Quick Reference

**Unit 01: Game Foundations | Topic 02**

> **Quick Lookup:** Essential formulas, patterns, and code snippets for game timing.

---

## Core Formulas

### Delta Time
```typescript
// Calculate delta time in seconds
const deltaTime = (currentTime - lastTime) / 1000;
lastTime = currentTime;

// Clamp to prevent huge jumps
const deltaTime = Math.min((currentTime - lastTime) / 1000, 0.1);
```

### Frame-Independent Movement
```typescript
// Position
position += velocity * deltaTime;

// Velocity  
velocity += acceleration * deltaTime;

// Rotation
angle += angularVelocity * deltaTime;
```

### FPS Calculation
```typescript
fps = 1000 / deltaTimeMs;
// or
fps = 1 / deltaTimeSec;
```

---

## Essential Patterns

### Basic Game Loop
```typescript
let lastTime = 0;

function gameLoop(currentTime: number) {
    const deltaTime = (currentTime - lastTime) / 1000;
    lastTime = currentTime;
    
    update(deltaTime);
    render();
    
    requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);
```

### Class-Based Loop
```typescript
class Game {
    private lastTime = 0;
    private animationId: number | null = null;
    
    start() {
        this.lastTime = performance.now();
        this.loop();
    }
    
    private loop = () => {
        const now = performance.now();
        const dt = (now - this.lastTime) / 1000;
        this.lastTime = now;
        
        this.update(dt);
        this.render();
        
        this.animationId = requestAnimationFrame(this.loop);
    }
    
    stop() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
    }
}
```

### Fixed Timestep
```typescript
private accumulator = 0;
private readonly TIMESTEP = 1 / 60;

private loop(currentTime: number) {
    const deltaTime = (currentTime - this.lastTime) / 1000;
    this.lastTime = currentTime;
    
    this.accumulator += deltaTime;
    
    while (this.accumulator >= this.TIMESTEP) {
        this.update(this.TIMESTEP);
        this.accumulator -= this.TIMESTEP;
    }
    
    this.render();
    requestAnimationFrame(this.loop.bind(this));
}
```

---

## Code Snippets

### FPS Counter
```typescript
class FPSCounter {
    private frames = 0;
    private lastUpdate = 0;
    private fps = 0;
    
    update(time: number) {
        this.frames++;
        if (time - this.lastUpdate >= 1000) {
            this.fps = this.frames;
            this.frames = 0;
            this.lastUpdate = time;
        }
    }
    
    get value() { return this.fps; }
}
```

### Animation Timer
```typescript
class Timer {
    private elapsed = 0;
    
    constructor(private duration: number) {}
    
    update(dt: number): number {
        this.elapsed += dt;
        return Math.min(this.elapsed / this.duration, 1);
    }
    
    reset() { this.elapsed = 0; }
    isDone() { return this.elapsed >= this.duration; }
}

// Usage
const timer = new Timer(2.0); // 2 seconds
let progress = timer.update(deltaTime); // 0 to 1
```

### Pause System
```typescript
class Game {
    private isPaused = false;
    
    togglePause() {
        this.isPaused = !this.isPaused;
        if (this.isPaused) {
            // Reset lastTime to prevent delta spike
            this.lastTime = performance.now();
        }
    }
    
    private loop(time: number) {
        const dt = (time - this.lastTime) / 1000;
        this.lastTime = time;
        
        if (!this.isPaused) {
            this.update(dt);
        }
        
        this.render();
        requestAnimationFrame(this.loop.bind(this));
    }
}
```

### Time Scale
```typescript
class Game {
    timeScale = 1.0; // 0.5 = half speed, 2.0 = double speed
    
    private loop(time: number) {
        let dt = (time - this.lastTime) / 1000;
        this.lastTime = time;
        
        // Apply time scale
        dt *= this.timeScale;
        
        this.update(dt);
        this.render();
        requestAnimationFrame(this.loop.bind(this));
    }
}
```

---

## Physics with Delta Time

### Gravity
```typescript
const GRAVITY = 980; // pixels per second squared

function update(dt: number) {
    player.velocityY += GRAVITY * dt;
    player.y += player.velocityY * dt;
}
```

### Friction/Drag
```typescript
const FRICTION = 0.9; // 0 = no friction, 1 = infinite friction

function update(dt: number) {
    // Apply friction
    player.velocityX *= Math.pow(FRICTION, dt * 60);
    player.x += player.velocityX * dt;
}
```

### Acceleration
```typescript
const ACCEL = 500; // pixels per second squared

function update(dt: number) {
    if (keys.right) {
        player.velocityX += ACCEL * dt;
    }
    player.velocityX = clamp(player.velocityX, -MAX_SPEED, MAX_SPEED);
    player.x += player.velocityX * dt;
}
```

---

## Animation with Delta Time

### Frame-Based Animation
```typescript
class SpriteAnimator {
    private currentFrame = 0;
    private timer = 0;
    
    constructor(
        private frameCount: number,
        private frameDuration: number // seconds per frame
    ) {}
    
    update(dt: number) {
        this.timer += dt;
        
        while (this.timer >= this.frameDuration) {
            this.currentFrame = (this.currentFrame + 1) % this.frameCount;
            this.timer -= this.frameDuration;
        }
    }
    
    getFrame() { return this.currentFrame; }
}

// Usage: 8 frames, 0.1 seconds each
const anim = new SpriteAnimator(8, 0.1);
anim.update(deltaTime);
```

### Smooth Value Interpolation
```typescript
function lerp(start: number, end: number, t: number): number {
    return start + (end - start) * t;
}

function smoothDamp(
    current: number,
    target: number,
    speed: number,
    dt: number
): number {
    return lerp(current, target, 1 - Math.exp(-speed * dt));
}

// Usage: Smooth camera follow
camera.x = smoothDamp(camera.x, player.x, 5, deltaTime);
```

---

## Performance Monitoring

### Simple Profiler
```typescript
class Profiler {
    private start: number = 0;
    
    begin() {
        this.start = performance.now();
    }
    
    end(label: string) {
        const elapsed = performance.now() - this.start;
        console.log(`${label}: ${elapsed.toFixed(2)}ms`);
    }
}

// Usage
const profiler = new Profiler();

profiler.begin();
update(deltaTime);
profiler.end('Update');

profiler.begin();
render();
profiler.end('Render');
```

### Frame Time Graph
```typescript
const frameTimes: number[] = [];
const MAX_SAMPLES = 60;

function recordFrameTime(dt: number) {
    frameTimes.push(dt * 1000);
    if (frameTimes.length > MAX_SAMPLES) {
        frameTimes.shift();
    }
}

function drawGraph(ctx: CanvasRenderingContext2D, x: number, y: number) {
    const width = 200;
    const height = 60;
    const barWidth = width / MAX_SAMPLES;
    
    frameTimes.forEach((ms, i) => {
        const h = Math.min((ms / 16.67) * height, height);
        ctx.fillStyle = ms > 16.67 ? 'red' : 'green';
        ctx.fillRect(x + i * barWidth, y + height - h, barWidth - 1, h);
    });
}
```

---

## Common Values

### Target Frame Times
```typescript
const TARGET_60_FPS = 16.67;  // milliseconds
const TARGET_30_FPS = 33.33;
const TARGET_120_FPS = 8.33;
```

### Typical Speeds (Mario-style)
```typescript
const PLAYER_SPEED = 300;      // px/s horizontal
const JUMP_FORCE = -600;       // px/s vertical
const GRAVITY = 1800;          // px/s² downward
const MAX_FALL_SPEED = 800;    // px/s terminal velocity
```

### Time Constants
```typescript
const SECOND = 1.0;
const HALF_SECOND = 0.5;
const FRAME_60HZ = 1 / 60;     // 0.01667
const MILLISECOND = 0.001;
```

---

## Debugging Helpers

### Visual Delta Time
```typescript
function drawDeltaTime(ctx: CanvasRenderingContext2D, dt: number) {
    const ms = dt * 1000;
    const color = ms > 33 ? 'red' : ms > 16.67 ? 'yellow' : 'lime';
    
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(10, 10, 150, 30);
    
    ctx.fillStyle = color;
    ctx.font = '16px monospace';
    ctx.fillText(`${ms.toFixed(2)}ms`, 20, 30);
}
```

### Log Frame Spikes
```typescript
const SPIKE_THRESHOLD = 33; // ms

function detectSpikes(dt: number) {
    const ms = dt * 1000;
    if (ms > SPIKE_THRESHOLD) {
        console.warn(`Frame spike: ${ms.toFixed(2)}ms`);
    }
}
```

---

## Best Practices Checklist

- [ ] Use `requestAnimationFrame`, not `setInterval`
- [ ] Calculate delta time in **seconds**, not milliseconds
- [ ] Clamp delta time to prevent huge jumps (`Math.min(dt, 0.1)`)
- [ ] Multiply all movement/physics by delta time
- [ ] Use named constants for speeds (`const SPEED = 300`)
- [ ] Reset `lastTime` when resuming from pause
- [ ] Consider fixed timestep for physics
- [ ] Monitor FPS in debug mode
- [ ] Test with CPU throttling
- [ ] Profile update vs render time

---

## Quick Conversions

### Time Units
```typescript
// Milliseconds to seconds
const seconds = milliseconds / 1000;

// Seconds to milliseconds  
const milliseconds = seconds * 1000;

// FPS to frame time (ms)
const frameTime = 1000 / fps;

// Frame time to FPS
const fps = 1000 / frameTime;
```

### Speed Units
```typescript
// Pixels per frame to pixels per second (assume 60 FPS)
const pxPerSec = pxPerFrame * 60;

// Pixels per second to pixels per frame
const pxPerFrame = pxPerSec / 60;
```

### Angle Units
```typescript
// Degrees to radians
const radians = degrees * Math.PI / 180;

// Radians to degrees
const degrees = radians * 180 / Math.PI;

// Degrees per second to radians per second
const radPerSec = degPerSec * Math.PI / 180;
```

---

## Common Mistakes

❌ **Using milliseconds for delta time:**
```typescript
// WRONG
x += speed * deltaMs; // deltaMs = 16.67
```

✅ **Use seconds:**
```typescript
// RIGHT
x += speed * deltaSec; // deltaSec = 0.01667
```

❌ **Not clamping delta:**
```typescript
// WRONG: Can cause huge jumps
const dt = (now - last) / 1000;
```

✅ **Always clamp:**
```typescript
// RIGHT
const dt = Math.min((now - last) / 1000, 0.1);
```

❌ **Hardcoded speeds:**
```typescript
// WRONG: Magic numbers
x += 5 * deltaTime;
```

✅ **Named constants:**
```typescript
// RIGHT
const SPEED = 300;
x += SPEED * deltaTime;
```

---

## Complete Mini-Example

```typescript
// Complete game loop with best practices
class MiniGame {
    private lastTime = 0;
    private isPaused = false;
    
    private player = {
        x: 100,
        y: 100,
        vx: 200, // px/s
        vy: 0
    };
    
    private readonly GRAVITY = 980;
    
    start() {
        this.lastTime = performance.now();
        this.loop();
    }
    
    private loop = () => {
        const now = performance.now();
        const dt = Math.min((now - this.lastTime) / 1000, 0.1);
        this.lastTime = now;
        
        if (!this.isPaused) {
            this.update(dt);
        }
        
        this.render();
        requestAnimationFrame(this.loop);
    }
    
    private update(dt: number) {
        this.player.vy += this.GRAVITY * dt;
        this.player.x += this.player.vx * dt;
        this.player.y += this.player.vy * dt;
    }
    
    private render() {
        // ... drawing code ...
    }
}
```

---

**Keep this open while coding!** 📌

Press Ctrl+F to quickly find what you need.
