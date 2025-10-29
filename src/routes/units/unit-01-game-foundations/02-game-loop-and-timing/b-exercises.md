# Game Loop & Timing - Exercises

**Unit 01: Game Foundations | Topic 02**

> **Practice Goal:** Master timing, delta time, and frame-independent movement through hands-on exercises.

---

## Instructions

1. Create a new HTML file with canvas and TypeScript setup
2. Complete exercises in order (difficulty increases)
3. Test at different frame rates (throttle CPU in DevTools)
4. Verify movement is consistent regardless of FPS
5. Check solutions in `c-solutions.md` when stuck

---

## Core Exercises

### Exercise 1: Basic Game Loop ⭐

**Objective:** Create your first game loop with requestAnimationFrame.

**Requirements:**
- Create a canvas (800×600)
- Draw a red square at (100, 100)
- Use requestAnimationFrame to redraw every frame
- Log frame count to console every second

**Hints:**
- Use a counter variable for frames
- Compare timestamps to detect one second
- Clear canvas before each draw

**Bonus:**
- Add a start/stop button
- Display frame count on canvas

---

### Exercise 2: Delta Time Calculator ⭐

**Objective:** Calculate and display delta time.

**Requirements:**
- Create a game loop
- Calculate delta time in milliseconds
- Display delta time on canvas
- Display current FPS

**Hints:**
- Delta = (currentTime - lastTime)
- FPS = 1000 / deltaMs
- Update display every frame

**Bonus:**
- Show average delta over last 60 frames
- Color code: green (<16.67ms), yellow (16-33ms), red (>33ms)

---

### Exercise 3: Moving Square (Frame-Dependent) ⭐

**Objective:** See the problem with frame-dependent movement.

**Requirements:**
- Create a blue square
- Move it right by 5 pixels per frame
- When it reaches right edge, teleport to left
- Add FPS counter

**Hints:**
- x += 5 every frame
- if (x > canvas.width) x = 0

**Test:**
- Normal speed: should move at consistent rate
- Throttle CPU to 30 FPS: notice it moves slower!
- This demonstrates the problem we're solving

---

### Exercise 4: Moving Square (Frame-Independent) ⭐⭐

**Objective:** Fix Exercise 3 using delta time.

**Requirements:**
- Same as Exercise 3, but use delta time
- Square should move at 300 pixels/second
- Should look same speed at 60 FPS and 30 FPS

**Hints:**
- Calculate delta time in seconds
- x += speed * deltaTime
- speed = 300 (pixels per second)

**Test:**
- Throttle CPU: movement should look identical!

---

### Exercise 5: Bouncing Ball ⭐⭐

**Objective:** Create smooth physics with delta time.

**Requirements:**
- Ball falls with gravity (980 px/s²)
- Bounces off ground
- Bounces off walls
- Energy loss on each bounce (velocityY *= -0.8)

**Hints:**
```typescript
velocityY += gravity * deltaTime
y += velocityY * deltaTime
```

**Bonus:**
- Multiple balls
- Clicking spawns new ball

---

### Exercise 6: FPS Counter Component ⭐⭐

**Objective:** Build a reusable FPS counter class.

**Requirements:**
- FPSCounter class with update() and draw() methods
- Updates once per second
- Shows current FPS
- Color coded (green: >50, yellow: 30-50, red: <30)
- Semi-transparent background

**Hints:**
- Track frames in a counter
- Reset counter every 1000ms
- Use ctx.fillStyle with rgba

**Bonus:**
- Show min/max/average FPS
- Graph last 60 frames

---

### Exercise 7: Rotating Sprite ⭐⭐

**Objective:** Implement smooth rotation with delta time.

**Requirements:**
- Load an image (or draw a triangle)
- Rotate at 90 degrees per second
- Should rotate smoothly at any FPS

**Hints:**
```typescript
const degreesPerSecond = 90
const radiansPerSecond = degreesPerSecond * Math.PI / 180
angle += radiansPerSecond * deltaTime
```

**Bonus:**
- Multiple sprites rotating at different speeds
- Change rotation speed with arrow keys

---

### Exercise 8: Circular Motion ⭐⭐

**Objective:** Create smooth circular movement.

**Requirements:**
- Object moves in a circle
- 2π radians (360°) per 3 seconds
- Radius = 100 pixels
- Center of canvas

**Hints:**
```typescript
angle += (Math.PI * 2 / 3) * deltaTime
x = centerX + Math.cos(angle) * radius
y = centerY + Math.sin(angle) * radius
```

**Bonus:**
- Multiple objects in orbit
- Varying radiuses and speeds

---

### Exercise 9: Animation Timer ⭐⭐⭐

**Objective:** Build a timer class for animations.

**Requirements:**
- Timer class with duration
- Counts from 0 to 1 over duration
- Calls callback when complete
- Can loop or stop

**Hints:**
```typescript
class Timer {
    private elapsed = 0
    constructor(private duration: number) {}
    
    update(deltaTime: number) {
        this.elapsed += deltaTime
        return this.elapsed / this.duration
    }
}
```

**Bonus:**
- Easing functions (ease-in, ease-out)
- Pause/resume functionality

---

### Exercise 10: Sprite Animator ⭐⭐⭐

**Objective:** Animate sprite sheet with frame timing.

**Requirements:**
- Create 4-frame animation
- Each frame displays for 0.15 seconds
- Loops continuously
- Uses delta time

**Hints:**
```typescript
timer += deltaTime
if (timer >= frameDuration) {
    currentFrame = (currentFrame + 1) % frameCount
    timer -= frameDuration
}
```

**Bonus:**
- Different animations (walk, jump, idle)
- Switch animations with keys

---

### Exercise 11: Fixed Timestep ⭐⭐⭐

**Objective:** Implement fixed timestep update loop.

**Requirements:**
- Update at exactly 60 Hz (1/60 second steps)
- Render at display refresh rate
- Ball with physics should behave identically at any FPS

**Hints:**
```typescript
accumulator += deltaTime
while (accumulator >= TIMESTEP) {
    update(TIMESTEP)
    accumulator -= TIMESTEP
}
render()
```

**Bonus:**
- Interpolation between states for smooth rendering

---

### Exercise 12: Performance Monitor ⭐⭐⭐

**Objective:** Track update and render times separately.

**Requirements:**
- Measure update() time
- Measure render() time
- Display both in ms
- Display total frame time

**Hints:**
```typescript
const t1 = performance.now()
update(deltaTime)
const updateTime = performance.now() - t1
```

**Bonus:**
- Graph frame times
- Highlight when >16.67ms (missed 60 FPS)

---

### Exercise 13: Pause System ⭐⭐

**Objective:** Add pause/resume functionality.

**Requirements:**
- Press P to pause
- Press P to resume
- Show "PAUSED" text when paused
- Delta time shouldn't accumulate while paused

**Hints:**
```typescript
if (!isPaused) {
    update(deltaTime)
}
render() // Always render
```

**Bonus:**
- Pause menu with options
- Slow motion mode (deltaTime * 0.5)

---

### Exercise 14: Time Scale ⭐⭐⭐

**Objective:** Control game speed with time scale.

**Requirements:**
- Slider to adjust time scale (0.1× to 2×)
- All movement scales with time scale
- Display current time scale

**Hints:**
```typescript
const scaledDelta = deltaTime * timeScale
update(scaledDelta)
```

**Bonus:**
- Keyboard shortcuts (1-5 keys for presets)
- Smooth time scale transitions

---

### Exercise 15: Frame Time Graph ⭐⭐⭐

**Objective:** Visualize frame times as a graph.

**Requirements:**
- Graph showing last 60 frames
- Each bar represents one frame
- Height = frame time (ms)
- Green bar if <16.67ms, red if over
- 60 FPS target line

**Hints:**
- Store frame times in array
- Shift array when > 60 samples
- Draw bars from left to right

**Bonus:**
- Show average, min, max
- Multiple graphs (update, render, total)

---

## Challenge Projects

### Challenge 1: Complete Performance Dashboard 🏆

Create a comprehensive performance overlay:
- FPS counter (current, average, min, max)
- Frame time graph (60 samples)
- Update/render time breakdown
- Memory usage (if available)
- Entity count
- Toggle with debug key

**Advanced:**
- Export performance report to JSON
- Warning when FPS drops below 50

---

### Challenge 2: Physics Playground 🏆

Build interactive physics demo:
- Spawn objects with mouse click
- Objects fall with gravity
- Bounce off walls and each other
- All using delta time for consistency
- Display object count and FPS

**Advanced:**
- Adjust gravity with slider
- Different object types (heavy, bouncy, sticky)
- Particle effects on collision

---

### Challenge 3: Animation System 🏆

Build complete animation system:
- Multiple animations (idle, walk, run, jump)
- Smooth transitions between animations
- Frame-based timing with delta time
- Blend animations
- Control with keyboard

**Advanced:**
- Animation priority system
- Additive animations (e.g., breathe while idle)
- Export/import animation data

---

## Testing Checklist

For each exercise, verify:

- [ ] Runs smoothly at 60 FPS
- [ ] Still works correctly when throttled to 30 FPS
- [ ] No console errors
- [ ] Clean code with types
- [ ] Comments explaining logic
- [ ] Delta time used correctly (in seconds)
- [ ] No magic numbers (use named constants)

---

## Performance Testing

Test your exercises under different conditions:

**Normal:**
- No throttling, should run at 60 FPS

**Slow CPU:**
- Chrome DevTools → Performance → CPU throttling 4×
- Should still maintain correct speed (lower FPS okay)

**Background Tab:**
- Switch to another tab
- Come back, should resume correctly

**Long Tab:**
- Leave tab open for 5+ minutes
- Should still work (no timer overflow)

---

## Common Mistakes to Avoid

1. **Using milliseconds instead of seconds:**
   ```typescript
   // WRONG
   x += speed * deltaMs  // deltaMs = 16.67
   
   // RIGHT
   x += speed * deltaSec  // deltaSec = 0.01667
   ```

2. **Not clamping delta time:**
   ```typescript
   // WRONG
   const delta = (now - last) / 1000
   
   // RIGHT
   const delta = Math.min((now - last) / 1000, 0.1)
   ```

3. **Accumulating time while paused:**
   ```typescript
   // WRONG
   deltaTime = (now - last) / 1000
   if (!paused) update(deltaTime)
   
   // RIGHT
   if (!paused) {
       deltaTime = (now - last) / 1000
       update(deltaTime)
   }
   last = now
   ```

---

## Tips for Success

1. **Start Simple:** Get basic loop working first
2. **Test Frequently:** Throttle CPU often
3. **Use Console:** Log values to understand delta time
4. **Compare:** Run frame-dependent vs frame-independent side by side
5. **Measure:** Use performance.now() to profile bottlenecks
6. **Visualize:** Graph makes patterns obvious

---

## What You'll Learn

After completing these exercises:
- ✅ Understand game loop architecture
- ✅ Calculate delta time correctly
- ✅ Build frame-independent movement
- ✅ Implement smooth physics
- ✅ Monitor performance effectively
- ✅ Handle pause/resume
- ✅ Debug timing issues

---

**Ready to start?** Begin with Exercise 1 and work your way up!

Check `c-solutions.md` for complete solutions and explanations. 🚀
