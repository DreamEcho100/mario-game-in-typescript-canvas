# Game Loop & Timing - Debugging Guide

**Unit 01: Game Foundations | Topic 02**

> **Debug Like a Pro:** Common timing bugs, how to spot them, and how to fix them.

---

## Bug #1: Objects Move at Different Speeds on Different Computers

### Symptom
- Game runs fine on your computer
- Friend's computer: everything moves slower or faster
- Inconsistent gameplay experience

### Root Cause
**Not using delta time** — movement is frame-dependent.

### Diagnosis
```typescript
// Check if you're doing this:
player.x += 5; // BAD: 5 pixels per frame
```

### Solution
```typescript
// Use delta time:
const SPEED = 300; // pixels per second
player.x += SPEED * deltaTime;
```

### Prevention
- Always multiply movement by `deltaTime`
- Use seconds, not milliseconds
- Test with CPU throttling in Chrome DevTools

---

## Bug #2: Huge Jump After Tab Switch

### Symptom
- Switch to another tab for 30 seconds
- Come back: player teleports or objects jump position
- Physics go crazy

### Root Cause
**Delta time accumulates while tab is inactive.**

When you return, `(currentTime - lastTime)` is huge (30,000ms!).

### Diagnosis
```typescript
console.log('Delta time:', deltaTime);
// After tab switch: 30.5 seconds! 😱
```

### Solution
```typescript
// Clamp delta time
const MAX_DELTA = 0.1; // 100ms maximum
let deltaTime = (currentTime - lastTime) / 1000;

if (deltaTime > MAX_DELTA) {
    deltaTime = MAX_DELTA;
}

lastTime = currentTime;
```

### Alternative: Reset on Tab Focus
```typescript
document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
        // Tab became visible again
        lastTime = performance.now();
    }
});
```

---

## Bug #3: Game Runs Too Fast or Too Slow

### Symptom
- Everything moves at wrong speed
- Consistent but not the speed you wanted

### Root Cause
**Using milliseconds instead of seconds for delta time.**

### Diagnosis
```typescript
// Check your delta calculation:
const deltaTime = currentTime - lastTime; // This is in MILLISECONDS

player.x += 300 * deltaTime; // 300 * 16.67 = 5000 pixels per frame! 🚀
```

### Solution
```typescript
// Divide by 1000 to get seconds
const deltaTime = (currentTime - lastTime) / 1000;

player.x += 300 * deltaTime; // 300 * 0.01667 = 5 pixels ✅
```

### Quick Test
```typescript
console.log('Delta time:', deltaTime);
// Should be around 0.0167 (seconds), not 16.67 (milliseconds)
```

---

## Bug #4: Animation Speeds Up/Slows Down Randomly

### Symptom
- Animation frame rate fluctuates
- Not smooth or consistent

### Root Cause
**Not subtracting frame duration from timer properly.**

### Diagnosis
```typescript
// BAD: Resetting timer to 0
timer += deltaTime;
if (timer >= frameDuration) {
    currentFrame++;
    timer = 0; // Loses fractional time!
}
```

### Solution
```typescript
// GOOD: Subtract frame duration
timer += deltaTime;
if (timer >= frameDuration) {
    currentFrame++;
    timer -= frameDuration; // Keeps remainder
}
```

### Why It Matters
```
Frame 1: timer = 0.011, duration = 0.01 → advance, timer = 0.001
Frame 2: timer = 0.018, duration = 0.01 → advance, timer = 0.008
// Smooth!

vs

Frame 1: timer = 0.011, duration = 0.01 → advance, timer = 0
Frame 2: timer = 0.017, duration = 0.01 → advance, timer = 0
// Loses 0.001 + 0.007 = accumulated drift
```

---

## Bug #5: Objects Jitter or Vibrate

### Symptom
- Objects shake slightly
- Position oscillates back and forth
- Especially visible on moving objects

### Root Cause
**Floating point precision issues or collision correction fighting with movement.**

### Diagnosis
```typescript
// Check for rapid position changes
let lastX = player.x;

function update(dt: number) {
    // ... movement ...
    
    const dx = player.x - lastX;
    if (Math.abs(dx) > 100) {
        console.warn('Huge position change:', dx);
    }
    lastX = player.x;
}
```

### Solution 1: Collision Correction
```typescript
// BAD: Overlap causes fighting
if (player.y > ground) {
    player.y = ground;
    player.vy = 0;
}
player.y += player.vy * dt; // Moves below ground again!

// GOOD: Correct before applying velocity
if (player.y + player.vy * dt > ground) {
    player.y = ground;
    player.vy = 0;
} else {
    player.y += player.vy * dt;
}
```

### Solution 2: Damping
```typescript
// Add small damping to stabilize
const DAMPING = 0.99;
player.vx *= Math.pow(DAMPING, dt * 60);
```

---

## Bug #6: FPS Counter Shows 0 or Wrong Values

### Symptom
- FPS display shows 0
- Or shows obviously wrong values (500 FPS, -20 FPS)

### Root Cause
**Logic error in FPS calculation or update timing.**

### Diagnosis
```typescript
// Check your FPS counter logic
console.log('Frames:', frames);
console.log('Time since last update:', currentTime - lastUpdate);
```

### Solution
```typescript
class FPSCounter {
    private frames = 0;
    private lastUpdate = 0;
    private fps = 0;
    
    update(currentTime: number) {
        this.frames++;
        
        const elapsed = currentTime - this.lastUpdate;
        
        if (elapsed >= 1000) { // At least 1 second
            this.fps = Math.round(this.frames * 1000 / elapsed);
            this.frames = 0;
            this.lastUpdate = currentTime;
        }
    }
    
    getFPS(): number {
        return this.fps;
    }
}
```

### Common Mistakes
```typescript
// WRONG: Using deltaTime instead of elapsed
if (deltaTime >= 1000) { ... } // deltaTime is ~16ms!

// WRONG: Not initializing lastUpdate
private lastUpdate = 0; // First check will be huge

// WRONG: Integer division
this.fps = this.frames / elapsed; // Result might be 0!
```

---

## Bug #7: Game Loop Doesn't Start

### Symptom
- Blank canvas
- No animation
- No errors in console

### Root Cause
**Forgot to actually start the loop.**

### Diagnosis
```typescript
// Check if you have this:
function gameLoop(time: number) {
    // ... update and render ...
    requestAnimationFrame(gameLoop);
}

// But forgot this:
requestAnimationFrame(gameLoop); // ⬅️ Missing!
```

### Solution
```typescript
// Always kick off the loop
function gameLoop(time: number) {
    update();
    render();
    requestAnimationFrame(gameLoop);
}

// Start it!
requestAnimationFrame(gameLoop);
```

### Class-Based Pattern
```typescript
class Game {
    start() {
        this.lastTime = performance.now();
        this.loop(); // ⬅️ Don't forget!
    }
    
    private loop = () => {
        // ...
        requestAnimationFrame(this.loop);
    }
}

const game = new Game();
game.start(); // ⬅️ Must call this!
```

---

## Bug #8: "this is undefined" in Game Loop

### Symptom
```
TypeError: Cannot read property 'update' of undefined
```

### Root Cause
**Lost `this` context in requestAnimationFrame callback.**

### Diagnosis
```typescript
class Game {
    private loop(time: number) {
        console.log(this); // undefined!
        this.update(); // ❌ Error
    }
    
    start() {
        requestAnimationFrame(this.loop); // ⬅️ Problem here
    }
}
```

### Solution 1: Arrow Function
```typescript
class Game {
    private loop = (time: number) => { // ⬅️ Arrow function
        this.update(); // ✅ Works!
        requestAnimationFrame(this.loop);
    }
}
```

### Solution 2: Bind
```typescript
class Game {
    private loop(time: number) {
        this.update();
        requestAnimationFrame(this.loop.bind(this)); // ⬅️ Bind
    }
    
    start() {
        requestAnimationFrame(this.loop.bind(this)); // ⬅️ Bind here too
    }
}
```

---

## Bug #9: Fixed Timestep Causes Stuttering

### Symptom
- Using fixed timestep
- Rendering looks choppy even at 60 FPS
- Objects don't move smoothly

### Root Cause
**Not interpolating between physics states.**

### Diagnosis
```typescript
// Check if you're doing this:
while (accumulator >= TIMESTEP) {
    update(TIMESTEP);
    accumulator -= TIMESTEP;
}
render(); // ⬅️ Rendering discrete positions
```

### Solution: Interpolation
```typescript
private previousState = { x: 0, y: 0 };
private currentState = { x: 0, y: 0 };

while (accumulator >= TIMESTEP) {
    this.previousState = { ...this.currentState };
    update(TIMESTEP);
    accumulator -= TIMESTEP;
}

// Interpolate for smooth rendering
const alpha = accumulator / TIMESTEP;
const renderX = lerp(previousState.x, currentState.x, alpha);

function lerp(a: number, b: number, t: number) {
    return a + (b - a) * t;
}
```

---

## Bug #10: Memory Leak - Game Slows Down Over Time

### Symptom
- Starts at 60 FPS
- After 5 minutes: drops to 30 FPS
- Keeps getting worse

### Root Cause
**Creating objects in game loop without cleanup.**

### Diagnosis
```typescript
// Check for this pattern:
function update(dt: number) {
    const particle = new Particle(); // ⬅️ New object every frame!
    particles.push(particle);
}

// Chrome DevTools → Performance → Memory
// Watch heap size grow over time
```

### Solution 1: Object Pooling
```typescript
class ObjectPool<T> {
    private pool: T[] = [];
    
    constructor(private factory: () => T, size: number = 10) {
        for (let i = 0; i < size; i++) {
            this.pool.push(factory());
        }
    }
    
    get(): T {
        return this.pool.pop() || this.factory();
    }
    
    release(obj: T) {
        this.pool.push(obj);
    }
}

const particlePool = new ObjectPool(() => new Particle(), 100);

function spawn() {
    const particle = particlePool.get(); // ⬅️ Reuse!
    particle.reset();
    particles.push(particle);
}

function remove(particle: Particle) {
    particlePool.release(particle); // ⬅️ Return to pool
}
```

### Solution 2: Remove Dead Objects
```typescript
function update(dt: number) {
    // Remove dead particles
    particles = particles.filter(p => p.isAlive);
    
    particles.forEach(p => p.update(dt));
}
```

---

## Debugging Tools

### Visual Delta Time Monitor
```typescript
const deltaHistory: number[] = [];

function recordDelta(dt: number) {
    deltaHistory.push(dt);
    if (deltaHistory.length > 60) deltaHistory.shift();
}

function drawDeltaGraph(ctx: CanvasRenderingContext2D) {
    const x = 10, y = 10, w = 200, h = 60;
    
    ctx.fillStyle = 'rgba(0,0,0,0.7)';
    ctx.fillRect(x, y, w, h);
    
    deltaHistory.forEach((dt, i) => {
        const ms = dt * 1000;
        const barH = Math.min((ms / 33) * h, h);
        const barX = x + (i / 60) * w;
        
        ctx.fillStyle = ms > 16.67 ? 'red' : 'green';
        ctx.fillRect(barX, y + h - barH, w / 60, barH);
    });
}
```

### Performance Profiler
```typescript
const timings: Record<string, number[]> = {};

function profile(name: string, fn: () => void) {
    const start = performance.now();
    fn();
    const elapsed = performance.now() - start;
    
    if (!timings[name]) timings[name] = [];
    timings[name].push(elapsed);
    if (timings[name].length > 60) timings[name].shift();
}

// Usage
profile('update', () => update(deltaTime));
profile('render', () => render());

// Report
function reportPerformance() {
    Object.entries(timings).forEach(([name, times]) => {
        const avg = times.reduce((a, b) => a + b) / times.length;
        console.log(`${name}: ${avg.toFixed(2)}ms avg`);
    });
}
```

---

## Testing Checklist

- [ ] Test at 60 FPS (normal)
- [ ] Test at 30 FPS (CPU throttling 4×)
- [ ] Test at 15 FPS (CPU throttling 8×)
- [ ] Switch tabs for 30s, come back
- [ ] Minimize window, restore
- [ ] Run for 10+ minutes
- [ ] Check memory doesn't grow
- [ ] Verify speeds are consistent
- [ ] Test pause/resume
- [ ] Check FPS counter accuracy

---

## Prevention Strategies

1. **Always use delta time in seconds**
2. **Always clamp delta time**
3. **Always use arrow functions or .bind(this)**
4. **Test with CPU throttling**
5. **Monitor memory in DevTools**
6. **Use object pools for frequent allocations**
7. **Profile early and often**
8. **Log suspicious values**

---

**Debug mode is your friend!** Press 'D' to toggle. 🔧
