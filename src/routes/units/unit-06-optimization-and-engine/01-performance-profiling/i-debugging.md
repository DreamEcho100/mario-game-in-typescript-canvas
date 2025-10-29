# Performance Profiling - Debugging Guide

**Unit 06: Optimization, Polish & Engine Abstractions | Topic 01 | Common Issues**

---

## Bug #1: FPS Counter Shows NaN

### Symptom
FPS displays as "NaN" instead of a number.

### Root Cause
Division by zero or empty frame times array.

### Solution
```typescript
// ✅ Check for empty array
getAverageFPS(): number {
  if (this.frameTimes.length === 0) return 0;
  const avg = this.frameTimes.reduce((a,b) => a+b) / this.frameTimes.length;
  return 1000 / avg;
}
```

---

## Bug #2: Memory Keeps Growing

### Symptom
Memory usage increases steadily over time.

### Root Cause
Objects created but never released (memory leak).

### Solution
```typescript
// ✅ Always release objects
if (particle.isDead()) {
  this.particlePool.release(particle);
}

// ✅ Remove event listeners
destroy(): void {
  window.removeEventListener('keydown', this.handler);
}
```

---

## Bug #3: Profiler Slows Down Game

### Symptom
Performance worse with profiler enabled.

### Root Cause
Too many performance marks or measurements.

### Solution
```typescript
// ✅ Use conditional profiling
const PROFILE = false; // Set to true only when needed

if (PROFILE) {
  performance.mark('start');
}
// code
if (PROFILE) {
  performance.mark('end');
}
```

---

## Bug #4: Spatial Grid Returns Duplicates

### Symptom
Same entity returned multiple times from getNearby().

### Root Cause
Entity spans multiple cells.

### Solution
```typescript
// ✅ Use Set to deduplicate
getNearby(entity: Entity): Entity[] {
  const nearby = new Set<Entity>();
  // ... add to set instead of array
  return Array.from(nearby);
}
```

---

## Bug #5: Object Pool Exhausted

### Symptom
acquire() returns null, no objects available.

### Root Cause
Objects not being released back to pool.

### Solution
```typescript
// ✅ Always release in update
particles.forEach((p, i) => {
  if (p.isDead()) {
    this.pool.release(p);
    particles.splice(i, 1);
  }
});
```

---

## Bug #6: Cached Layer Never Updates

### Symptom
Background doesn't change when it should.

### Root Cause
Forgot to mark layer as dirty.

### Solution
```typescript
// ✅ Mark dirty when changing
updateBackground(): void {
  this.timeOfDay = 'night';
  this.backgroundCache.markDirty(); // Important!
}
```

---

## Bug #7: Batch Rendering Broken

### Symptom
Entities render with wrong colors.

### Root Cause
State not reset between batches.

### Solution
```typescript
// ✅ Save/restore state
byColor.forEach((entities, color) => {
  ctx.save();
  ctx.fillStyle = color;
  entities.forEach(e => ctx.fillRect(e.x, e.y, e.width, e.height));
  ctx.restore();
});
```

---

## Bug #8: Frustum Culling Too Aggressive

### Symptom
Entities disappear before fully off-screen.

### Root Cause
No margin for partially visible entities.

### Solution
```typescript
// ✅ Add margin
const MARGIN = 50;
isVisible(entity: Entity): boolean {
  return !(
    entity.x + entity.width < camera.x - MARGIN ||
    entity.x > camera.x + camera.width + MARGIN ||
    // ... same for y
  );
}
```

---

## Bug #9: Performance Measures Missing

### Symptom
getEntriesByType('measure') returns empty array.

### Root Cause
Marks not defined before measure.

### Solution
```typescript
// ✅ Always mark before measure
performance.mark('start');
// code
performance.mark('end');
performance.measure('duration', 'start', 'end'); // Both must exist
```

---

## Bug #10: GC Pauses Still Happening

### Symptom
Frame drops despite object pooling.

### Root Cause
Creating temporary objects elsewhere.

### Solution
```typescript
// ❌ Bad: Creates objects
const velocity = { x: vx, y: vy };

// ✅ Good: Reuse temp object
this.tempVelocity.x = vx;
this.tempVelocity.y = vy;
```

---

**Debug systematically and measure improvements!** 🐛
