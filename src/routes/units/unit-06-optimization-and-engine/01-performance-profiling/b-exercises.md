# Performance Profiling - Exercises

**Unit 06: Optimization, Polish & Engine Abstractions | Topic 01 | Practice Challenges**

---

## Exercise 1: FPS Counter

### Objective
Create a reliable FPS counter that displays average, min, and max FPS.

### Requirements
- Track last 60 frame times
- Display average FPS
- Display min/max FPS
- Update every second

### Hints
- Use performance.now() for timing
- Store frame times in array
- Calculate FPS from frame time

### Bonus
- Add color coding (green > 50 FPS, yellow 30-50, red < 30)
- Display 99th percentile frame time

---

## Exercise 2: Performance Mark System

### Objective
Implement custom performance marks for game systems.

### Requirements
- Mark start/end of update
- Mark start/end of render
- Mark collision detection
- Display average times

### Hints
- Use Map to store marks
- performance.now() for timestamps
- Calculate durations

### Bonus
- Add nested marks (update → player update → physics)
- Export to JSON for analysis

---

## Exercise 3: Memory Monitor

### Objective
Create a memory usage monitor with warnings.

### Requirements
- Display current memory usage
- Warn at 50MB
- Critical alert at 100MB
- Track memory over time

### Hints
- Use performance.memory
- usedJSHeapSize property
- Convert to MB for display

### Bonus
- Graph memory usage over time
- Detect memory leaks (steadily increasing)

---

## Exercise 4: Object Pool Implementation

### Objective
Create a generic object pool for particles.

### Requirements
- Pre-allocate 100 particles
- acquire() and release() methods
- Track active vs inactive
- No new allocations during gameplay

### Hints
- Use two arrays (pool and active)
- Move objects between arrays
- Reset object state on release

### Bonus
- Auto-grow pool if needed
- Statistics (peak usage, allocation count)

---

## Exercise 5: Spatial Grid

### Objective
Implement spatial partitioning for collision detection.

### Requirements
- 64x64 pixel cells
- insert() and getNearby() methods
- Only check nearby entities
- Measure performance improvement

### Hints
- Use Map with "x,y" keys
- Floor divide by cell size
- Check 3x3 grid around entity

### Bonus
- Handle entities larger than cell size
- Dynamic cell size based on entity density

---

## Exercise 6: Frustum Culling

### Objective
Only render entities visible to camera.

### Requirements
- Camera with x, y, width, height
- isVisible() method
- Skip rendering off-screen entities
- Display culled count

### Hints
- Check AABB overlap
- Camera bounds vs entity bounds
- Return early if not visible

### Bonus
- Add margin for partially visible entities
- Separate culling for different layers

---

## Exercise 7: Layer Caching

### Objective
Cache static background to avoid redrawing every frame.

### Requirements
- Separate canvas for background
- Render once, reuse
- markDirty() to force re-render
- Measure performance gain

### Hints
- document.createElement('canvas')
- drawImage() to copy cached canvas
- Boolean flag for dirty state

### Bonus
- Multiple cached layers (background, midground, foreground)
- Partial cache invalidation

---

## Exercise 8: Batch Rendering

### Objective
Group draw calls by state to reduce context switches.

### Requirements
- Sort entities by texture/color
- Set state once per batch
- Render all entities with same state
- Measure time saved

### Hints
- Map entities by fillStyle
- Loop through map entries
- Set style once per group

### Bonus
- Batch by multiple states (fillStyle, font, lineWidth)
- Auto-detect optimal batch size

---

## Exercise 9: Profile Collision Detection

### Objective
Measure collision detection time and optimize.

### Requirements
- Time naive O(n²) approach
- Time spatial grid approach
- Compare and display results
- Achieve 10× speedup

### Hints
- performance.mark() before/after
- Test with 100+ entities
- Log both times

### Bonus
- Try different cell sizes
- Graph performance vs entity count

---

## Exercise 10: Memory Leak Detector

### Objective
Find and fix a memory leak in provided code.

### Requirements
- Identify growing arrays
- Find unreleased listeners
- Fix the leaks
- Verify with heap snapshot

### Hints
- Look for addEventListener without remove
- Check for push() without cleanup
- Use Chrome DevTools Memory tab

### Bonus
- Create automated leak detection
- Add assertions for max array size

---

## Exercise 11: Dirty Rectangle System

### Objective
Only redraw changed areas of the screen.

### Requirements
- Track dirty rectangles
- Clear only dirty areas
- Render only affected entities
- Measure performance gain

### Hints
- Array of rectangles
- ctx.clip() to limit drawing
- Merge overlapping rects

### Bonus
- Automatic dirty rect calculation
- Optimize merge algorithm

---

## Exercise 12: Performance Budget System

### Objective
Define and enforce performance budgets.

### Requirements
- Set target FPS (60)
- Set max update time (8ms)
- Set max render time (8ms)
- Warn on violations

### Hints
- Store target values
- Compare actual vs target
- console.warn() on exceed

### Bonus
- Automatic quality reduction when over budget
- Detailed violation reports

---

## Exercise 13: Throttled Updates

### Objective
Update non-critical systems less frequently.

### Requirements
- Particles update every 100ms
- Background parallax every 200ms
- UI every 500ms
- Game logic every frame

### Hints
- Track lastUpdate timestamp
- Check currentTime - lastUpdate
- Update only if >= interval

### Bonus
- Configurable intervals
- Priority system (critical, normal, low)

---

## Exercise 14: Complete Performance Dashboard

### Objective
Create comprehensive performance overlay.

### Requirements
- FPS (average, min, max)
- Frame time graph
- Memory usage
- Entity count
- Draw call count
- System timings

### Hints
- Combine all previous exercises
- Organize in columns
- Toggle visibility with key

### Bonus
- Export to CSV
- Historical data (last 5 minutes)
- Performance score (0-100)

---

## Exercise 15: Profile Your Mario Game

### Objective
Profile your complete Mario game and optimize bottlenecks.

### Requirements
- Identify slowest system
- Apply at least 3 optimizations
- Achieve 60 FPS consistently
- Document improvements

### Hints
- Use Chrome DevTools Performance tab
- Focus on worst-case scenarios
- Test with many entities

### Bonus
- Before/after comparison video
- Write optimization guide for your game

---

## Challenge Projects

### Challenge A: Advanced Profiler (3-4 hours)

Build a production-ready profiler with:
- Hierarchical timing (nested marks)
- Statistical analysis (mean, median, std dev)
- Flame graph visualization
- Export to Chrome trace format

### Challenge B: Adaptive Quality System (2-3 hours)

Create automatic quality adjustment:
- Monitor FPS continuously
- Reduce particle count if < 50 FPS
- Reduce entity count if < 40 FPS
- Disable shadows if < 30 FPS
- Restore quality when performance improves

### Challenge C: Performance Testing Suite (4-5 hours)

Build automated performance tests:
- Spawn 100/500/1000 entities
- Measure FPS for each scenario
- Test collision detection scalability
- Generate performance report
- CI/CD integration ready

---

## Self-Assessment

After completing these exercises, you should be able to:

- [ ] Measure frame rate accurately
- [ ] Profile with Chrome DevTools
- [ ] Identify performance bottlenecks
- [ ] Implement object pooling
- [ ] Use spatial partitioning
- [ ] Apply frustum culling
- [ ] Cache static content
- [ ] Batch render calls
- [ ] Detect memory leaks
- [ ] Enforce performance budgets
- [ ] Optimize collision detection
- [ ] Create performance dashboards

---

**Ready to build lightning-fast games!** ⚡🎮
