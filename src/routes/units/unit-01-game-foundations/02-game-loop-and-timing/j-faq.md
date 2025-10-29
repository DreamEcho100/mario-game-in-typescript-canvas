# Game Loop & Timing - FAQ

**Unit 01: Game Foundations | Topic 02**

> **Common Questions:** Everything you wanted to know about game loops and timing.

---

## Q1: Why use `requestAnimationFrame` instead of `setInterval`?

**Short Answer:** `requestAnimationFrame` is designed for animation and performs better.

**Detailed Comparison:**

| Feature | requestAnimationFrame | setInterval |
|---------|----------------------|-------------|
| Sync with display | ✅ Yes (60 Hz typically) | ❌ No |
| Pauses when hidden | ✅ Yes (saves battery) | ❌ No |
| Smooth animation | ✅ Optimized | ❌ Can stutter |
| Performance | ✅ Better | ❌ Worse |
| Browser support | ✅ All modern browsers | ✅ Universal |

**Example:**
```typescript
// BAD: setInterval
setInterval(() => {
    update();
    render();
}, 16.67); // Try for 60 FPS, but...
// - Not synced with display refresh
// - Runs even when tab hidden
// - Can cause screen tearing

// GOOD: requestAnimationFrame
function gameLoop(time: number) {
    update();
    render();
    requestAnimationFrame(gameLoop);
}
requestAnimationFrame(gameLoop);
// - Synced perfectly with display
// - Pauses when tab hidden
// - Smooth, no tearing
```

---

## Q2: What exactly is delta time?

**Short Answer:** The time elapsed since the last frame, usually in seconds.

**Long Answer:**

Delta time (Δt) represents how much time passed between the current frame and the previous frame.

```typescript
Frame 1: currentTime = 1000ms
Frame 2: currentTime = 1016.67ms
Delta time = 1016.67 - 1000 = 16.67ms = 0.01667 seconds
```

**Why it matters:**
```typescript
// Without delta time:
player.x += 5; // Moves 5 pixels per frame
// At 60 FPS: 300 pixels/second
// At 30 FPS: 150 pixels/second ❌ Different speeds!

// With delta time:
player.x += 300 * deltaTime; // 300 pixels per second
// At 60 FPS: 300 * 0.0167 ≈ 5 pixels/frame
// At 30 FPS: 300 * 0.0333 ≈ 10 pixels/frame
// ✅ Always 300 pixels/second regardless of FPS!
```

---

## Q3: Should I use milliseconds or seconds for delta time?

**Short Answer:** **Always use seconds.**

**Why:**

Most physics formulas use seconds:
- Velocity: meters per **second**
- Acceleration: meters per **second²**
- Angular velocity: radians per **second**

```typescript
// BAD: Milliseconds
const deltaTime = currentTime - lastTime; // 16.67
player.x += 300 * deltaTime; // 300 * 16.67 = 5001 pixels! 🚀

// GOOD: Seconds
const deltaTime = (currentTime - lastTime) / 1000; // 0.01667
player.x += 300 * deltaTime; // 300 * 0.01667 = 5 pixels ✅
```

**Exception:** When displaying to user, show milliseconds:
```typescript
const deltaSec = deltaTime; // Use for calculations
const deltaMs = deltaTime * 1000; // Show to user
console.log(`Frame time: ${deltaMs.toFixed(2)}ms`);
```

---

## Q4: Why do I need to clamp delta time?

**Short Answer:** To prevent huge jumps when game pauses or lags.

**The Problem:**

```typescript
// User switches tabs for 30 seconds
// Come back: deltaTime = 30 seconds!

player.y += player.velocityY * 30; // 😱
// Player teleports thousands of pixels
// Physics go crazy
// Game breaks
```

**The Solution:**

```typescript
const MAX_DELTA = 0.1; // 100ms = 10 FPS minimum
let deltaTime = (currentTime - lastTime) / 1000;

if (deltaTime > MAX_DELTA) {
    deltaTime = MAX_DELTA;
}

// Now player won't teleport, just slow down temporarily
```

**What value to use:**
- `0.1` (100ms) = Allow down to 10 FPS
- `0.05` (50ms) = Allow down to 20 FPS  
- `0.033` (33ms) = Allow down to 30 FPS

---

## Q5: What's the difference between fixed and variable timestep?

**Short Answer:** Fixed timestep updates at constant rate; variable uses delta time.

**Variable Timestep (Delta Time):**
```typescript
function loop(time: number) {
    const deltaTime = (time - lastTime) / 1000;
    lastTime = time;
    
    update(deltaTime); // Different dt each frame
    render();
    
    requestAnimationFrame(loop);
}
```

**Fixed Timestep:**
```typescript
const TIMESTEP = 1 / 60; // Always 16.67ms
let accumulator = 0;

function loop(time: number) {
    const deltaTime = (time - lastTime) / 1000;
    lastTime = time;
    
    accumulator += deltaTime;
    
    while (accumulator >= TIMESTEP) {
        update(TIMESTEP); // Always same dt
        accumulator -= TIMESTEP;
    }
    
    render();
    requestAnimationFrame(loop);
}
```

**When to use:**

| Use Variable (Delta Time) | Use Fixed Timestep |
|---------------------------|-------------------|
| Simple games | Physics simulations |
| Visual effects | Precise platformers |
| Particle systems | Networking/replays |
| UI animations | Deterministic gameplay |

---

## Q6: How do I convert from "per frame" to "per second"?

**Short Answer:** Multiply by 60 (assuming 60 FPS).

**Example:**

```typescript
// Old code (frame-dependent):
player.x += 5; // 5 pixels per frame

// Convert to time-based:
// At 60 FPS: 5 * 60 = 300 pixels per second
const SPEED = 300;
player.x += SPEED * deltaTime;
```

**Common Conversions:**

| Per Frame (60 FPS) | Per Second | Notes |
|-------------------|------------|-------|
| 5 pixels | 300 px/s | Typical player speed |
| -10 velocity | -600 px/s | Jump force |
| 0.5 accel | 30 px/s² | Gravity |
| 0.01 radians | 0.6 rad/s | Slow rotation |
| 1 frame | 1/60 = 0.0167s | Animation frame |

---

## Q7: What FPS should I target?

**Short Answer:** 60 FPS is the standard for smooth gameplay.

**Frame Rate Guide:**

| FPS | Frame Time | Feel | Use Case |
|-----|------------|------|----------|
| 60 | 16.67ms | Smooth | Most games |
| 30 | 33.33ms | Acceptable | Story games, mobile |
| 120+ | <8.33ms | Very smooth | Competitive games |
| <30 | >33ms | Choppy | Unplayable |

**Target:**
```typescript
const TARGET_FPS = 60;
const TARGET_FRAME_TIME = 1000 / TARGET_FPS; // 16.67ms

if (frameTime > TARGET_FRAME_TIME) {
    console.warn('Performance issue!');
}
```

**For Mario-style platformer:** 60 FPS is ideal for responsive controls.

---

## Q8: How do I make my game run at exactly 60 FPS?

**Short Answer:** You can't force 60 FPS, but you can make it frame-independent.

**Reality Check:**

`requestAnimationFrame` runs at the display's refresh rate:
- Most monitors: 60 Hz (60 FPS)
- Gaming monitors: 120 Hz or 144 Hz
- Some laptops: 48 Hz or 90 Hz

**You can't control FPS**, but you can:

1. **Make it frame-independent:**
```typescript
// Works at any FPS
player.x += SPEED * deltaTime;
```

2. **Optimize to maintain 60 FPS:**
```typescript
// Profile bottlenecks
const start = performance.now();
update(deltaTime);
const updateTime = performance.now() - start;

if (updateTime > 10) { // 10ms is too slow
    console.warn('Update is slow!');
}
```

3. **Use fixed timestep for consistent physics:**
```typescript
// Physics always runs at 60 Hz internally
const TIMESTEP = 1 / 60;
while (accumulator >= TIMESTEP) {
    update(TIMESTEP);
    accumulator -= TIMESTEP;
}
```

---

## Q9: How do I pause my game?

**Short Answer:** Stop updating, but keep rendering.

**Simple Pause:**
```typescript
let isPaused = false;

document.addEventListener('keydown', (e) => {
    if (e.key === 'p') {
        isPaused = !isPaused;
        // Reset time to avoid delta spike
        if (!isPaused) {
            lastTime = performance.now();
        }
    }
});

function gameLoop(time: number) {
    const deltaTime = (time - lastTime) / 1000;
    lastTime = time;
    
    if (!isPaused) {
        update(deltaTime);
    }
    
    render(); // Always render (show pause menu)
    
    if (isPaused) {
        drawPauseMenu();
    }
    
    requestAnimationFrame(gameLoop);
}
```

**Important:** Reset `lastTime` when unpausing to prevent huge delta!

---

## Q10: Can I slow down or speed up time?

**Short Answer:** Yes, multiply delta time by a time scale.

**Implementation:**
```typescript
let timeScale = 1.0; // 1.0 = normal speed

function gameLoop(time: number) {
    let deltaTime = (time - lastTime) / 1000;
    lastTime = time;
    
    // Apply time scale
    deltaTime *= timeScale;
    
    update(deltaTime);
    render();
    
    requestAnimationFrame(gameLoop);
}

// Slow motion
timeScale = 0.5; // Half speed

// Fast forward
timeScale = 2.0; // Double speed

// Pause
timeScale = 0.0; // Frozen
```

**Use cases:**
- Slow motion effects (bullet time)
- Fast forward (simulation games)
- Debug (slow down to see what's happening)

---

## Q11: Why is my FPS counter showing weird values?

**Common Issues:**

**Issue 1: Dividing by zero**
```typescript
// BAD
const fps = 1000 / deltaTime; // What if deltaTime is 0?

// GOOD
const fps = deltaTime > 0 ? 1000 / deltaTime : 0;
```

**Issue 2: Not waiting for full second**
```typescript
// BAD: Updates too frequently
if (time - lastUpdate >= 100) { // 0.1 seconds
    fps = frames;
    // ...
}

// GOOD: Wait for full second
if (time - lastUpdate >= 1000) {
    fps = frames;
    // ...
}
```

**Issue 3: Integer division**
```typescript
// BAD (JavaScript actually okay, but good to know)
const fps = frames / elapsed; // Might round

// GOOD: Force floating point
const fps = Math.round(frames * 1000 / elapsed);
```

---

## Q12: What's interpolation and do I need it?

**Short Answer:** Interpolation smooths rendering between fixed timestep updates.

**The Problem:**

With fixed timestep, physics runs at 60 Hz, but rendering might be at 144 Hz:

```typescript
// Physics updates (60 Hz)
Update: x=100, x=105, x=110...

// Rendering (144 Hz) sees same position multiple times
Render: x=100, x=100, x=100, x=105, x=105, x=105...
// Looks choppy!
```

**The Solution: Interpolation**

```typescript
let previousX = 100;
let currentX = 100;
let accumulator = 0;
const TIMESTEP = 1/60;

function loop(time: number) {
    const dt = (time - lastTime) / 1000;
    lastTime = time;
    
    accumulator += dt;
    
    while (accumulator >= TIMESTEP) {
        previousX = currentX;
        // Update physics...
        currentX += velocity * TIMESTEP;
        accumulator -= TIMESTEP;
    }
    
    // Interpolate for rendering
    const alpha = accumulator / TIMESTEP;
    const renderX = lerp(previousX, currentX, alpha);
    
    draw(renderX); // Smooth!
}

function lerp(a: number, b: number, t: number): number {
    return a + (b - a) * t;
}
```

**Do you need it?**
- Simple games with variable timestep: **No**
- Fixed timestep with high refresh rates: **Yes**

---

## Q13: How do I measure performance?

**Method 1: FPS Counter**
```typescript
let fps = 0;
// Update every second
// Lower FPS = slower performance
```

**Method 2: Frame Time**
```typescript
const frameTime = deltaTime * 1000; // milliseconds
// Target: <16.67ms for 60 FPS
```

**Method 3: Profiling**
```typescript
const t1 = performance.now();
update(deltaTime);
const updateTime = performance.now() - t1;

const t2 = performance.now();
render();
const renderTime = performance.now() - t2;

console.log(`Update: ${updateTime.toFixed(2)}ms`);
console.log(`Render: ${renderTime.toFixed(2)}ms`);
```

**Method 4: Chrome DevTools**
- Performance tab → Record
- See flame chart of function calls
- Identify bottlenecks

---

## Q14: What's the "spiral of death"?

**Definition:** When updates take so long that delta time keeps growing, causing slower updates, causing even bigger deltas...

```typescript
Frame 1: dt=0.016s, update takes 0.020s
Frame 2: dt=0.020s (falling behind), update takes 0.025s
Frame 3: dt=0.025s (even more behind), update takes 0.030s
Frame 4: dt=0.030s...
// Game becomes unplayable!
```

**Prevention:**

```typescript
// 1. Clamp delta time
const MAX_DELTA = 0.1;
deltaTime = Math.min(deltaTime, MAX_DELTA);

// 2. Fixed timestep with iteration limit
const MAX_UPDATES = 5;
let updates = 0;

while (accumulator >= TIMESTEP && updates < MAX_UPDATES) {
    update(TIMESTEP);
    accumulator -= TIMESTEP;
    updates++;
}

if (updates >= MAX_UPDATES) {
    accumulator = 0; // Give up, skip updates
    console.warn('Spiral of death detected!');
}
```

---

## Q15: How do I synchronize animations with game time?

**Short Answer:** Use delta time for animation timers.

**Example:**

```typescript
class Animation {
    private currentFrame = 0;
    private timer = 0;
    
    constructor(
        private frameCount: number,
        private frameDuration: number // seconds per frame
    ) {}
    
    update(deltaTime: number) {
        this.timer += deltaTime;
        
        if (this.timer >= this.frameDuration) {
            this.currentFrame = (this.currentFrame + 1) % this.frameCount;
            this.timer -= this.frameDuration; // Keep remainder!
        }
    }
}

// 8 frames, 0.1 seconds each = 0.8 seconds total
const walkAnim = new Animation(8, 0.1);

function gameLoop(time: number) {
    const dt = (time - lastTime) / 1000;
    lastTime = time;
    
    walkAnim.update(dt); // Synced with game time
    
    drawFrame(walkAnim.currentFrame);
}
```

---

## Q16: How do I handle slowdown gracefully?

**Options:**

**Option 1: Slow Motion (Keep running)**
```typescript
// Game slows down, but stays playable
update(deltaTime); // Naturally slows if deltaTime is large
```

**Option 2: Skip Frames (Maintain speed)**
```typescript
// Game maintains speed, but looks choppy
const MAX_DELTA = 0.033; // 30 FPS minimum
deltaTime = Math.min(deltaTime, MAX_DELTA);
update(deltaTime);
```

**Option 3: Reduce Quality**
```typescript
if (fps < 50) {
    // Disable particles
    // Reduce enemy count
    // Lower draw distance
    console.log('Performance mode activated');
}
```

---

## Q17: What's a good structure for a game loop class?

**Best Practice:**

```typescript
class GameLoop {
    private lastTime = 0;
    private accumulator = 0;
    private readonly TIMESTEP = 1 / 60;
    private isRunning = false;
    
    start() {
        if (this.isRunning) return;
        this.isRunning = true;
        this.lastTime = performance.now();
        this.loop();
    }
    
    stop() {
        this.isRunning = false;
    }
    
    private loop = () => {
        if (!this.isRunning) return;
        
        const now = performance.now();
        let dt = Math.min((now - this.lastTime) / 1000, 0.1);
        this.lastTime = now;
        
        this.accumulator += dt;
        
        while (this.accumulator >= this.TIMESTEP) {
            this.update(this.TIMESTEP);
            this.accumulator -= this.TIMESTEP;
        }
        
        this.render();
        
        requestAnimationFrame(this.loop);
    }
    
    protected update(dt: number) {
        // Override in subclass
    }
    
    protected render() {
        // Override in subclass
    }
}
```

---

## Q18: How do timers work with delta time?

**Pattern:**

```typescript
class Timer {
    private elapsed = 0;
    
    constructor(private duration: number) {}
    
    update(deltaTime: number): boolean {
        this.elapsed += deltaTime;
        return this.elapsed >= this.duration;
    }
    
    reset() {
        this.elapsed = 0;
    }
    
    getProgress(): number {
        return Math.min(this.elapsed / this.duration, 1);
    }
}

// Usage
const timer = new Timer(2.0); // 2 second timer

function update(deltaTime: number) {
    if (timer.update(deltaTime)) {
        console.log('Timer finished!');
        timer.reset();
    }
    
    const progress = timer.getProgress(); // 0 to 1
    drawProgressBar(progress);
}
```

---

## Q19: Should I cap my frame rate?

**Short Answer:** Usually no, let it run freely.

**Why not cap:**
- `requestAnimationFrame` already syncs to display
- Higher FPS = smoother on high refresh displays
- Browser handles pacing automatically

**When to cap:**
```typescript
// Only if you have a specific reason:
const TARGET_FPS = 60;
const FRAME_TIME = 1000 / TARGET_FPS;
let lastFrameTime = 0;

function loop(time: number) {
    if (time - lastFrameTime < FRAME_TIME) {
        requestAnimationFrame(loop);
        return; // Skip this frame
    }
    lastFrameTime = time;
    
    // ... update and render ...
}
```

**Better:** Use fixed timestep for physics, uncapped rendering.

---

## Q20: Where can I learn more?

**Articles:**
- [Fix Your Timestep!](https://gafferongames.com/post/fix_your_timestep/) - Classic article
- [Game Programming Patterns: Game Loop](http://gameprogrammingpatterns.com/game-loop.html)
- [MDN: requestAnimationFrame](https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame)

**Videos:**
- "Delta Time" by Sebastian Lague
- "Game Loop Architecture" by The Cherno

**Books:**
- *Game Programming Patterns* by Robert Nystrom
- *Real-Time Rendering* for deep dive

**Practice:**
- Build pong with delta time
- Create particle system
- Make smooth camera follow

---

**You're ready to master timing!** ⏱️🎮

For hands-on practice, complete the exercises in `b-exercises.md`.