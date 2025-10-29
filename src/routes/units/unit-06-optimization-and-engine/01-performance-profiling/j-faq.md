# Performance Profiling - FAQ

**Unit 06: Optimization, Polish & Engine Abstractions | Topic 01 | Frequently Asked Questions**

---

## Q1: What FPS should I target?

**Answer:** **60 FPS** for smooth gameplay on desktop, **30 FPS** minimum for mobile.

**Why 60 FPS:**
- Standard display refresh rate
- 16.67ms per frame budget
- Feels smooth to players
- Matches requestAnimationFrame

**When 30 FPS is acceptable:**
- Mobile devices with limited power
- Complex games with heavy graphics
- Strategy games where smoothness less critical

---

## Q2: How do I know what's causing slowdown?

**Answer:** Use **Chrome DevTools Performance tab**.

**Steps:**
1. Press F12 → Performance tab
2. Click Record
3. Play game for 5 seconds
4. Stop recording
5. Look for long tasks (red bars)
6. Click on longest task to see call stack

**What to look for:**
- Functions taking > 5ms
- Frequent garbage collection
- Long paint operations

---

## Q3: Is object pooling always worth it?

**Answer:** **Yes for particles/bullets**, **maybe for other objects**.

**When pooling helps:**
- Objects created/destroyed frequently (>10/second)
- Objects are uniform (same class)
- GC pauses are noticeable

**When not worth it:**
- Objects rarely created
- Complex initialization
- Memory constrained (pool uses memory)

---

## Q4: How big should spatial grid cells be?

**Answer:** **Average entity size** is a good starting point.

**Guidelines:**
- Too small: Overhead of many cells
- Too large: Too many entities per cell
- Typical: 32-128 pixels
- Test with your entity sizes

**Example:**
- Entities 32×32: Use 64×64 cells
- Entities 16×16: Use 32×32 cells

---

## Q5: Should I cache everything?

**Answer:** **No, only static or rarely-changing content**.

**Good candidates for caching:**
- Background images
- UI elements that don't change
- Tile maps
- Particle effects (pre-rendered)

**Don't cache:**
- Player character
- Moving entities
- Animated content
- Anything that changes every frame

---

## Q6: How do I detect memory leaks?

**Answer:** Use **Chrome DevTools Memory tab** with heap snapshots.

**Steps:**
1. Take heap snapshot
2. Play game for 2 minutes
3. Take another snapshot
4. Compare snapshots
5. Look for growing arrays/objects

**Common leaks:**
- Event listeners not removed
- setInterval not cleared
- Growing arrays never emptied
- References not released

---

## Q7: What's causing garbage collection pauses?

**Answer:** **Creating temporary objects** every frame.

**Common causes:**
```typescript
// ❌ Creates new object every frame
const position = { x: entity.x, y: entity.y };

// ❌ Array methods create new arrays
const filtered = entities.filter(e => e.alive);

// ❌ Spread operator
const newArray = [...oldArray, newItem];
```

**Solutions:**
- Reuse objects
- Modify arrays in place
- Use object pools

---

## Q8: How many entities can I have at 60 FPS?

**Answer:** **Depends on complexity**, typically **500-2000** simple entities.

**Factors:**
- Entity complexity (physics, AI)
- Collision detection method
- Rendering cost
- Target device

**Benchmarks:**
- No collision: 5000+ entities
- Naive collision: 100-200 entities
- Spatial grid: 1000-2000 entities
- Simple render: 3000+ entities

---

## Q9: Should I optimize before or after building features?

**Answer:** **Build first, optimize later** (but measure early).

**Workflow:**
1. Build feature
2. Test if performance acceptable
3. If slow, profile to find bottleneck
4. Optimize specific bottleneck
5. Measure improvement

**Don't:**
- Prematurely optimize
- Guess what's slow
- Optimize without measuring

---

## Q10: What's the biggest performance win?

**Answer:** **Spatial partitioning for collision detection**.

**Typical improvements:**
- Naive O(n²): 200 entities at 30 FPS
- Spatial grid: 2000 entities at 60 FPS
- **10-50× speedup**

**Other big wins:**
- Object pooling: 3-5× faster
- Frustum culling: 2-3× faster
- Layer caching: 2-10× faster

---

## Q11: How do I profile on mobile?

**Answer:** Use **Chrome Remote Debugging**.

**Steps:**
1. Connect phone via USB
2. Enable USB debugging on phone
3. Chrome → chrome://inspect
4. Select your device
5. Use DevTools as normal

**Or use:**
- Safari Web Inspector (iOS)
- In-game performance overlay
- performance.now() timing

---

## Q12: What causes jank (stuttering)?

**Answer:** **Frame times exceeding 16.67ms**.

**Common causes:**
1. GC pauses (object creation)
2. Long collision detection
3. Heavy rendering
4. Synchronous asset loading
5. Complex physics

**Solutions:**
- Profile to identify cause
- Optimize specific bottleneck
- Spread work across frames

---

## Q13: Should I use Web Workers?

**Answer:** **Maybe for heavy computation**, not for game loop.

**Good uses:**
- Pathfinding
- Level generation
- AI decision making
- Asset processing

**Don't use for:**
- Game loop (can't access DOM/Canvas)
- Real-time physics
- Rendering
- Input handling

---

## Q14: How do I enforce performance budget?

**Answer:** **Automated testing and monitoring**.

```typescript
class BudgetMonitor {
  check(fps: number, frameTime: number): void {
    if (fps < 60) {
      console.error('FPS below target!');
    }
    if (frameTime > 16.67) {
      console.error('Frame time exceeded!');
    }
  }
}
```

**In CI/CD:**
- Run automated performance tests
- Fail build if FPS < threshold
- Track performance over time

---

## Q15: What if I can't reach 60 FPS?

**Answer:** **Reduce quality or target 30 FPS consistently**.

**Quality reduction options:**
- Fewer particles
- Simpler physics
- Lower resolution
- Fewer entities
- Disable shadows/effects

**Or:**
- Target consistent 30 FPS
- Better than variable 40-50 FPS
- Still playable for most games

---

## Summary of Best Practices

1. **Profile before optimizing**
2. **Target 60 FPS (16.67ms budget)**
3. **Use spatial partitioning for collision**
4. **Pool frequently-created objects**
5. **Cull off-screen entities**
6. **Cache static content**
7. **Batch render calls**
8. **Avoid object creation in loops**
9. **Monitor memory usage**
10. **Measure improvements**

---

**You now have the knowledge to build performant games!** ⚡🎮✨

**Next Topic:** Architecture Patterns - Learn design patterns for scalable game engines!
