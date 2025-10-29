# Game Loop & Timing - Complete Lesson

**Unit 01: Game Foundations | Topic 02**

> **Learning Objective:** Master the game loop, understand delta time, implement frame-independent movement, and create smooth 60 FPS gameplay.

---

## Table of Contents

1. [Introduction to Game Loops](#introduction)
2. [The Browser Game Loop](#browser-game-loop)
3. [requestAnimationFrame Deep Dive](#requestanimationframe)
4. [Delta Time (Δt)](#delta-time)
5. [Frame-Independent Movement](#frame-independent)
6. [Fixed Timestep](#fixed-timestep)
7. [Performance Monitoring](#performance)
8. [Building a Production Game Loop](#production-loop)
9. [Mario Implementation](#mario-implementation)
10. [Best Practices](#best-practices)

---

<a name="introduction"></a>
## 1. Introduction to Game Loops

### What is a Game Loop?

A game loop is the **heartbeat** of your game. It continuously:
1. **Processes input** (keyboard, mouse)
2. **Updates game state** (physics, AI, animations)
3. **Renders the scene** (draws everything)

**The loop never stops** (until the game ends).

### Visual Representation

```
┌─────────────────────────────────┐
│     GAME LOOP (infinite)        │
└─────────────────────────────────┘
         │
         ↓
    ┌────────────┐
    │  Input     │  Read keyboard/mouse
    └────────────┘
         │
         ↓
    ┌────────────┐
    │  Update    │  Move objects, apply physics
    └────────────┘
         │
         ↓
    ┌────────────┐
    │  Render    │  Draw everything to canvas
    └────────────┘
         │
         │ (wait for next frame)
         │
         └──────────→ (loop back)
```

### Why is Timing Critical?

Different computers run at different speeds:
- **Fast PC:** Might run 200 FPS
- **Old laptop:** Might run 30 FPS
- **Mobile phone:** Might vary 20-60 FPS

**Without proper timing:**
- Objects move at different speeds on different devices
- Physics become unpredictable
- Game feels inconsistent

---

<a name="browser-game-loop"></a>
## 2. The Browser Game Loop

### Old Way: setInterval (❌ Don't Use)

```typescript
// BAD: Fixed interval, not synced with display
setInterval(() => {
    update();
    render();
}, 16.67); // Try for 60 FPS
```

**Problems:**
- Not synced with display refresh rate
- Runs even when tab is hidden (wastes battery)
- Can't skip frames when CPU is busy
- May cause screen tearing

### Modern Way: requestAnimationFrame (✅ Use This)

```typescript
// GOOD: Synced with display, efficient
function gameLoop(currentTime: number) {
    update();
    render();
    
    requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);
```

**Benefits:**
- Syncs with display refresh (usually 60 Hz)
- Pauses when tab is hidden (saves battery)
- Smooth, no screen tearing
- Browser optimizes timing

---

<a name="requestanimationframe"></a>
## 3. requestAnimationFrame Deep Dive

### How It Works

`requestAnimationFrame` asks the browser: "Please call my function before the next repaint."

```typescript
function gameLoop(timestamp: number) {
    // timestamp = milliseconds since page loaded
    console.log(timestamp); // e.g., 1234.567
    
    // Your game logic here
    
    // Request next frame
    requestAnimationFrame(gameLoop);
}

// Start the loop
requestAnimationFrame(gameLoop);
```

### The Timestamp Parameter

```typescript
let lastTime = 0;

function gameLoop(currentTime: number) {
    // currentTime is in milliseconds
    console.log('Current:', currentTime);      // 1234.567
    console.log('Last:', lastTime);            // 1217.890
    console.log('Elapsed:', currentTime - lastTime); // 16.677 ms
    
    lastTime = currentTime;
    requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);
```

### Starting and Stopping

```typescript
class GameLoop {
    private animationId: number | null = null;
    private isRunning = false;
    
    start() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        this.animationId = requestAnimationFrame(this.loop.bind(this));
    }
    
    stop() {
        if (!this.isRunning) return;
        
        this.isRunning = false;
        if (this.animationId !== null) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }
    
    private loop(time: number) {
        if (!this.isRunning) return;
        
        // Game logic here
        this.update();
        this.render();
        
        this.animationId = requestAnimationFrame(this.loop.bind(this));
    }
    
    private update() {
        // Update game state
    }
    
    private render() {
        // Draw to canvas
    }
}

// Usage
const game = new GameLoop();
game.start();

// Later...
game.stop();
```

---

<a name="delta-time"></a>
## 4. Delta Time (Δt)

### The Problem

Without delta time, movement depends on frame rate:

```typescript
// BAD: Frame-dependent movement
function update() {
    player.x += 5; // Moves 5 pixels per frame
}
```

**At 60 FPS:** Moves 300 pixels/second (5 × 60)  
**At 30 FPS:** Moves 150 pixels/second (5 × 30)  
**Different speeds!** ❌

### The Solution: Delta Time

**Delta time (Δt)** = time elapsed since last frame (in seconds)

```typescript
// GOOD: Frame-independent movement
function update(deltaTime: number) {
    const speed = 300; // pixels per second
    player.x += speed * deltaTime;
}
```

**At 60 FPS (Δt ≈ 0.0167s):** Moves 300 × 0.0167 ≈ 5 pixels  
**At 30 FPS (Δt ≈ 0.0333s):** Moves 300 × 0.0333 ≈ 10 pixels  
**Same speed!** ✅ (300 pixels/second regardless of FPS)

### Calculating Delta Time

```typescript
let lastTime = 0;

function gameLoop(currentTime: number) {
    // Calculate delta time in seconds
    const deltaTime = (currentTime - lastTime) / 1000;
    lastTime = currentTime;
    
    // Pass to update
    update(deltaTime);
    render();
    
    requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);
```

### Delta Time Best Practices

```typescript
class Game {
    private lastTime = 0;
    private readonly MAX_DELTA = 0.1; // 100ms max (prevents huge jumps)
    
    private gameLoop(currentTime: number) {
        // Calculate delta
        let deltaTime = (currentTime - this.lastTime) / 1000;
        this.lastTime = currentTime;
        
        // First frame: delta will be huge
        if (deltaTime > this.MAX_DELTA) {
            deltaTime = 1 / 60; // Use 16.67ms instead
        }
        
        // Clamp to prevent spiral of death
        deltaTime = Math.min(deltaTime, this.MAX_DELTA);
        
        this.update(deltaTime);
        this.render();
        
        requestAnimationFrame(this.gameLoop.bind(this));
    }
}
```

---

<a name="frame-independent"></a>
## 5. Frame-Independent Movement

### Converting Frame-Based to Time-Based

**Frame-based (OLD):**
```typescript
// Assumes 60 FPS
player.x += 5;              // 5 pixels per frame
player.velocityY += 0.5;    // Gravity per frame
```

**Time-based (NEW):**
```typescript
// Works at any FPS
const speed = 300;          // 300 pixels per second
player.x += speed * deltaTime;

const gravity = 30;         // 30 pixels per second squared
player.velocityY += gravity * deltaTime;
```

### Movement Example

```typescript
interface Player {
    x: number;
    y: number;
    velocityX: number;
    velocityY: number;
}

const player: Player = {
    x: 100,
    y: 100,
    velocityX: 200,  // pixels per second
    velocityY: 0
};

function updatePlayer(deltaTime: number) {
    // Apply velocity
    player.x += player.velocityX * deltaTime;
    player.y += player.velocityY * deltaTime;
    
    // Apply gravity
    const gravity = 980; // pixels per second squared
    player.velocityY += gravity * deltaTime;
    
    // Ground collision
    if (player.y > 400) {
        player.y = 400;
        player.velocityY = 0;
    }
}
```

### Rotation Example

```typescript
interface RotatingObject {
    angle: number;          // radians
    rotationSpeed: number;  // radians per second
}

const spinner: RotatingObject = {
    angle: 0,
    rotationSpeed: Math.PI * 2  // 360° per second (1 rotation/sec)
};

function updateSpinner(deltaTime: number) {
    spinner.angle += spinner.rotationSpeed * deltaTime;
    
    // Keep angle in 0-2π range
    if (spinner.angle > Math.PI * 2) {
        spinner.angle -= Math.PI * 2;
    }
}
```

### Animation Example

```typescript
class Animator {
    private currentFrame = 0;
    private timer = 0;
    
    constructor(
        private frameCount: number,
        private frameDuration: number  // seconds per frame
    ) {}
    
    update(deltaTime: number) {
        this.timer += deltaTime;
        
        if (this.timer >= this.frameDuration) {
            this.currentFrame = (this.currentFrame + 1) % this.frameCount;
            this.timer -= this.frameDuration;
        }
    }
    
    getCurrentFrame(): number {
        return this.currentFrame;
    }
}

// Usage: 8 frames, 0.1 seconds per frame
const walkAnimation = new Animator(8, 0.1);

function update(deltaTime: number) {
    walkAnimation.update(deltaTime);
    const frame = walkAnimation.getCurrentFrame();
    // Draw frame...
}
```

---

<a name="fixed-timestep"></a>
## 6. Fixed Timestep

### The Problem with Variable Timestep

Pure delta time can cause issues:
- Physics instability
- Non-deterministic behavior
- Hard to debug

### Fixed Timestep Solution

Run update at **fixed intervals** (e.g., 60 times/second), but render at variable rate.

```typescript
class FixedTimestepLoop {
    private lastTime = 0;
    private accumulator = 0;
    private readonly TIMESTEP = 1 / 60; // 60 updates per second
    
    private gameLoop(currentTime: number) {
        const deltaTime = Math.min((currentTime - this.lastTime) / 1000, 0.1);
        this.lastTime = currentTime;
        
        this.accumulator += deltaTime;
        
        // Update at fixed rate
        while (this.accumulator >= this.TIMESTEP) {
            this.update(this.TIMESTEP);
            this.accumulator -= this.TIMESTEP;
        }
        
        // Render at variable rate
        this.render();
        
        requestAnimationFrame(this.gameLoop.bind(this));
    }
    
    private update(dt: number) {
        // Update game at fixed 60 Hz
    }
    
    private render() {
        // Render at display refresh rate
    }
}
```

### Interpolation for Smoothness

```typescript
class InterpolatedLoop {
    private lastTime = 0;
    private accumulator = 0;
    private readonly TIMESTEP = 1 / 60;
    
    private previousState: GameState = { ... };
    private currentState: GameState = { ... };
    
    private gameLoop(currentTime: number) {
        const deltaTime = Math.min((currentTime - this.lastTime) / 1000, 0.1);
        this.lastTime = currentTime;
        
        this.accumulator += deltaTime;
        
        while (this.accumulator >= this.TIMESTEP) {
            this.previousState = { ...this.currentState };
            this.update(this.TIMESTEP);
            this.accumulator -= this.TIMESTEP;
        }
        
        // Interpolate between states
        const alpha = this.accumulator / this.TIMESTEP;
        this.render(alpha);
        
        requestAnimationFrame(this.gameLoop.bind(this));
    }
    
    private render(alpha: number) {
        // Interpolate between previous and current
        const renderX = lerp(
            this.previousState.player.x,
            this.currentState.player.x,
            alpha
        );
        
        // Draw at interpolated position
        ctx.fillRect(renderX, this.currentState.player.y, 32, 32);
    }
}

function lerp(start: number, end: number, t: number): number {
    return start + (end - start) * t;
}
```

### When to Use Fixed Timestep

**Use Fixed Timestep:**
- Physics simulations
- Deterministic gameplay (replays, networking)
- Platformers with precise collision

**Use Variable Timestep (Delta Time):**
- Simple games
- Visual effects
- Non-physics gameplay

---

<a name="performance"></a>
## 7. Performance Monitoring

### FPS Counter

```typescript
class FPSCounter {
    private frames = 0;
    private lastFpsUpdate = 0;
    private fps = 0;
    
    update(currentTime: number) {
        this.frames++;
        
        if (currentTime - this.lastFpsUpdate >= 1000) {
            this.fps = this.frames;
            this.frames = 0;
            this.lastFpsUpdate = currentTime;
        }
    }
    
    getFPS(): number {
        return this.fps;
    }
    
    draw(ctx: CanvasRenderingContext2D) {
        ctx.save();
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(5, 5, 70, 30);
        
        const color = this.fps < 30 ? '#ff0000' : 
                     this.fps < 50 ? '#ffff00' : '#00ff00';
        ctx.fillStyle = color;
        ctx.font = 'bold 18px monospace';
        ctx.fillText(`FPS: ${this.fps}`, 10, 27);
        ctx.restore();
    }
}
```

### Frame Time Graph

```typescript
class FrameTimeGraph {
    private samples: number[] = [];
    private readonly MAX_SAMPLES = 60;
    
    addSample(deltaTime: number) {
        this.samples.push(deltaTime * 1000); // Convert to ms
        
        if (this.samples.length > this.MAX_SAMPLES) {
            this.samples.shift();
        }
    }
    
    draw(ctx: CanvasRenderingContext2D, x: number, y: number) {
        const width = 200;
        const height = 60;
        const targetFrameTime = 16.67; // 60 FPS
        
        // Background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(x, y, width, height);
        
        // Target line (60 FPS)
        ctx.strokeStyle = 'lime';
        ctx.beginPath();
        ctx.moveTo(x, y + height / 2);
        ctx.lineTo(x + width, y + height / 2);
        ctx.stroke();
        
        // Frame time bars
        const barWidth = width / this.MAX_SAMPLES;
        
        this.samples.forEach((frameTime, i) => {
            const barHeight = Math.min((frameTime / targetFrameTime) * (height / 2), height);
            const barX = x + i * barWidth;
            const barY = y + height - barHeight;
            
            // Color based on performance
            ctx.fillStyle = frameTime > targetFrameTime ? 'red' : 'green';
            ctx.fillRect(barX, barY, barWidth - 1, barHeight);
        });
        
        // Labels
        ctx.fillStyle = 'white';
        ctx.font = '10px monospace';
        ctx.fillText('16.67ms (60 FPS)', x + 5, y + 15);
    }
}
```

### Performance Profiler

```typescript
class Profiler {
    private timings = new Map<string, number[]>();
    
    start(name: string) {
        if (!this.timings.has(name)) {
            this.timings.set(name, []);
        }
        
        return performance.now();
    }
    
    end(name: string, startTime: number) {
        const elapsed = performance.now() - startTime;
        this.timings.get(name)!.push(elapsed);
        
        // Keep last 60 samples
        const times = this.timings.get(name)!;
        if (times.length > 60) {
            times.shift();
        }
    }
    
    getAverage(name: string): number {
        const times = this.timings.get(name);
        if (!times || times.length === 0) return 0;
        
        const sum = times.reduce((a, b) => a + b, 0);
        return sum / times.length;
    }
    
    report() {
        console.log('=== Performance Report ===');
        this.timings.forEach((times, name) => {
            const avg = this.getAverage(name);
            const max = Math.max(...times);
            console.log(`${name}: avg=${avg.toFixed(2)}ms, max=${max.toFixed(2)}ms`);
        });
    }
}

// Usage
const profiler = new Profiler();

function gameLoop(deltaTime: number) {
    const t1 = profiler.start('update');
    update(deltaTime);
    profiler.end('update', t1);
    
    const t2 = profiler.start('render');
    render();
    profiler.end('render', t2);
}
```

---

<a name="production-loop"></a>
## 8. Building a Production Game Loop

### Complete Game Loop Class

```typescript
class GameLoop {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private animationId: number | null = null;
    private isRunning = false;
    
    // Timing
    private lastTime = 0;
    private accumulator = 0;
    private readonly TIMESTEP = 1 / 60;
    private readonly MAX_DELTA = 0.25;
    
    // Performance monitoring
    private fpsCounter = new FPSCounter();
    private frameTimeGraph = new FrameTimeGraph();
    private profiler = new Profiler();
    
    // Debug mode
    private debugMode = false;
    
    constructor(canvasId: string) {
        this.canvas = document.getElementById(canvasId) as HTMLCanvasElement;
        this.ctx = this.canvas.getContext('2d')!;
        
        // Toggle debug with 'D' key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'd' || e.key === 'D') {
                this.debugMode = !this.debugMode;
            }
        });
    }
    
    start() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        this.lastTime = performance.now();
        this.loop(this.lastTime);
    }
    
    stop() {
        this.isRunning = false;
        if (this.animationId !== null) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }
    
    private loop(currentTime: number) {
        if (!this.isRunning) return;
        
        // Calculate delta time
        let deltaTime = (currentTime - this.lastTime) / 1000;
        this.lastTime = currentTime;
        
        // Clamp delta to prevent huge jumps
        if (deltaTime > this.MAX_DELTA) {
            deltaTime = this.TIMESTEP;
        }
        
        // Fixed timestep update
        this.accumulator += deltaTime;
        
        const t1 = this.profiler.start('update');
        while (this.accumulator >= this.TIMESTEP) {
            this.update(this.TIMESTEP);
            this.accumulator -= this.TIMESTEP;
        }
        this.profiler.end('update', t1);
        
        // Variable rate render
        const t2 = this.profiler.start('render');
        this.render();
        this.profiler.end('render', t2);
        
        // Debug overlay
        if (this.debugMode) {
            this.renderDebug(currentTime, deltaTime);
        }
        
        // Performance tracking
        this.fpsCounter.update(currentTime);
        this.frameTimeGraph.addSample(deltaTime);
        
        // Continue loop
        this.animationId = requestAnimationFrame(this.loop.bind(this));
    }
    
    private update(dt: number) {
        // Override in subclass
        // Game logic goes here
    }
    
    private render() {
        // Override in subclass
        // Drawing code goes here
    }
    
    private renderDebug(currentTime: number, deltaTime: number) {
        // FPS counter
        this.fpsCounter.draw(this.ctx);
        
        // Frame time graph
        this.frameTimeGraph.draw(this.ctx, 10, 50);
        
        // Additional debug info
        this.ctx.fillStyle = 'white';
        this.ctx.font = '12px monospace';
        this.ctx.fillText(`Frame: ${(deltaTime * 1000).toFixed(2)}ms`, 10, 130);
        this.ctx.fillText(`Update: ${this.profiler.getAverage('update').toFixed(2)}ms`, 10, 145);
        this.ctx.fillText(`Render: ${this.profiler.getAverage('render').toFixed(2)}ms`, 10, 160);
    }
}
```

---

<a name="mario-implementation"></a>
## 9. Mario Implementation

### Mario Game Loop

```typescript
class MarioGame extends GameLoop {
    private player = {
        x: 100,
        y: 300,
        width: 32,
        height: 32,
        velocityX: 0,
        velocityY: 0,
        speed: 300,        // pixels per second
        jumpForce: -600,   // pixels per second
        isGrounded: false
    };
    
    private keys = {
        left: false,
        right: false,
        jump: false
    };
    
    private readonly GRAVITY = 1800; // pixels per second squared
    private readonly GROUND_Y = 400;
    
    constructor(canvasId: string) {
        super(canvasId);
        this.setupInput();
    }
    
    private setupInput() {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft' || e.key === 'a') this.keys.left = true;
            if (e.key === 'ArrowRight' || e.key === 'd') this.keys.right = true;
            if (e.key === ' ' || e.key === 'ArrowUp' || e.key === 'w') this.keys.jump = true;
        });
        
        document.addEventListener('keyup', (e) => {
            if (e.key === 'ArrowLeft' || e.key === 'a') this.keys.left = false;
            if (e.key === 'ArrowRight' || e.key === 'd') this.keys.right = false;
            if (e.key === ' ' || e.key === 'ArrowUp' || e.key === 'w') this.keys.jump = false;
        });
    }
    
    protected update(dt: number) {
        // Horizontal movement
        if (this.keys.left) {
            this.player.velocityX = -this.player.speed;
        } else if (this.keys.right) {
            this.player.velocityX = this.player.speed;
        } else {
            this.player.velocityX = 0;
        }
        
        // Jumping
        if (this.keys.jump && this.player.isGrounded) {
            this.player.velocityY = this.player.jumpForce;
            this.player.isGrounded = false;
        }
        
        // Apply gravity
        this.player.velocityY += this.GRAVITY * dt;
        
        // Apply velocity
        this.player.x += this.player.velocityX * dt;
        this.player.y += this.player.velocityY * dt;
        
        // Ground collision
        if (this.player.y + this.player.height > this.GROUND_Y) {
            this.player.y = this.GROUND_Y - this.player.height;
            this.player.velocityY = 0;
            this.player.isGrounded = true;
        }
        
        // Screen bounds
        if (this.player.x < 0) this.player.x = 0;
        if (this.player.x + this.player.width > this.canvas.width) {
            this.player.x = this.canvas.width - this.player.width;
        }
    }
    
    protected render() {
        // Clear
        this.ctx.fillStyle = '#87CEEB';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Ground
        this.ctx.fillStyle = '#8B4513';
        this.ctx.fillRect(0, this.GROUND_Y, this.canvas.width, this.canvas.height - this.GROUND_Y);
        
        // Player
        this.ctx.fillStyle = 'red';
        this.ctx.fillRect(this.player.x, this.player.y, this.player.width, this.player.height);
        
        // Instructions
        this.ctx.fillStyle = 'black';
        this.ctx.font = '16px Arial';
        this.ctx.fillText('Arrow Keys / WASD to Move, Space to Jump, D for Debug', 10, 20);
    }
}

// Start the game
const game = new MarioGame('gameCanvas');
game.start();
```

---

<a name="best-practices"></a>
## 10. Best Practices

### ✅ Do's

1. **Always use requestAnimationFrame**
   ```typescript
   requestAnimationFrame(gameLoop);
   ```

2. **Always calculate delta time**
   ```typescript
   const deltaTime = (currentTime - lastTime) / 1000;
   ```

3. **Clamp delta time to prevent huge jumps**
   ```typescript
   deltaTime = Math.min(deltaTime, 0.1); // Max 100ms
   ```

4. **Use seconds for delta time**
   ```typescript
   const deltaTime = deltaMs / 1000; // Not deltaMs!
   ```

5. **Multiply movement by delta time**
   ```typescript
   player.x += speed * deltaTime;
   ```

6. **Monitor performance**
   ```typescript
   // Track FPS, frame time, bottlenecks
   ```

### ❌ Don'ts

1. **Don't use setInterval**
   ```typescript
   // BAD
   setInterval(gameLoop, 16.67);
   ```

2. **Don't hardcode movement**
   ```typescript
   // BAD: Frame-dependent
   player.x += 5;
   ```

3. **Don't forget to bind context**
   ```typescript
   // BAD: 'this' will be undefined
   requestAnimationFrame(this.gameLoop);
   
   // GOOD
   requestAnimationFrame(this.gameLoop.bind(this));
   ```

4. **Don't update without delta time**
   ```typescript
   // BAD: Inconsistent on different devices
   function update() { ... }
   
   // GOOD
   function update(deltaTime: number) { ... }
   ```

### Common Patterns

**Pattern 1: Simple Loop**
```typescript
let lastTime = 0;

function gameLoop(time: number) {
    const deltaTime = (time - lastTime) / 1000;
    lastTime = time;
    
    update(deltaTime);
    render();
    
    requestAnimationFrame(gameLoop);
}
```

**Pattern 2: Class-Based Loop**
```typescript
class Game {
    private loop(time: number) {
        // ... game logic ...
        requestAnimationFrame(this.loop.bind(this));
    }
}
```

**Pattern 3: Fixed Timestep**
```typescript
while (accumulator >= TIMESTEP) {
    update(TIMESTEP);
    accumulator -= TIMESTEP;
}
render();
```

---

## Summary

### Key Concepts

1. **Game Loop** — The infinite cycle of update → render
2. **requestAnimationFrame** — Browser API for smooth animation
3. **Delta Time** — Time elapsed since last frame (seconds)
4. **Frame Independence** — Movement works same at any FPS
5. **Fixed Timestep** — Update at constant rate for stability

### Formula Reference

```typescript
// Delta time
deltaTime = (currentTime - lastTime) / 1000

// Frame-independent movement
position += velocity * deltaTime

// Frame-independent rotation
angle += angularVelocity * deltaTime

// Frame-independent acceleration
velocity += acceleration * deltaTime
```

### What You've Learned

- ✅ How game loops work
- ✅ Why requestAnimationFrame is better than setInterval
- ✅ How to calculate and use delta time
- ✅ How to make movement frame-independent
- ✅ When to use fixed vs variable timestep
- ✅ How to monitor performance
- ✅ How to build a production-ready game loop

---

## Looking Ahead: Why Delta Time is CRITICAL

**Delta time is the foundation of ALL physics in Unit 02!** Here's why:

### Unit 02-01: Velocity & Acceleration

```typescript
// You'll write code like this:
velocity.x += acceleration.x * deltaTime;  // ← deltaTime from THIS lesson!
position.x += velocity.x * deltaTime;       // ← deltaTime again!

// Without deltaTime:
// - 60 FPS computer: player moves at normal speed
// - 120 FPS computer: player moves TWICE as fast! ❌
//
// With deltaTime:
// - All computers: player moves at SAME speed ✅
```

### Unit 02-02: Gravity & Jumping

```typescript
// Gravity is constant downward acceleration
velocity.y += GRAVITY * deltaTime;  // ← Falls smoothly on all devices

// Jump force applied instantly
if (jumpPressed) {
    velocity.y = -jumpSpeed;  // Negative = up
}
```

### The Math Connection

Remember this formula from physics class?

```
distance = velocity × time
```

In code, that's:

```typescript
position += velocity * deltaTime;
//  ↑         ↑          ↑
//  dist    velocity    time
```

**This is literally physics!** Delta time (`Δt`) is the **time** variable in physics equations.

### Preview: What You'll Build

By Unit 02-04, you'll have a complete platformer character that:
- Accelerates smoothly when walking ← `velocity += accel * deltaTime`
- Falls with gravity ← `velocity.y += gravity * deltaTime`
- Jumps consistently ← `velocity.y = -jumpSpeed`
- Moves at same speed on ANY device ← **because of deltaTime!**

**Remember:** Every single physics calculation in Unit 02 uses the delta time you learned HERE. Don't skip understanding this!

---

**Next:** Complete the exercises in `b-exercises.md` to practice!

Press 'D' in your games to toggle debug mode! 🎮
