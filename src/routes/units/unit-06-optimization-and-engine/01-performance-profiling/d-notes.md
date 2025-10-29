# Performance Profiling - Quick Reference

**Unit 06: Optimization, Polish & Engine Abstractions | Topic 01 | Cheat Sheet**

---

## Performance Budget

```
60 FPS = 16.67ms per frame

Typical Budget:
- JavaScript:  8ms
- Layout:      5ms
- Composite:   3ms
- Buffer:      0.67ms
```

---

## FPS Counter

```typescript
class FPSCounter {
  private frameTimes: number[] = [];
  private lastTime: number = 0;
  
  update(currentTime: number): void {
    if (this.lastTime > 0) {
      this.frameTimes.push(currentTime - this.lastTime);
      if (this.frameTimes.length > 60) this.frameTimes.shift();
    }
    this.lastTime = currentTime;
  }
  
  getFPS(): number {
    const avg = this.frameTimes.reduce((a,b) => a+b) / this.frameTimes.length;
    return 1000 / avg;
  }
}
```

---

## Performance Marks

```typescript
// Start timing
performance.mark('update-start');

// Your code here

// End timing
performance.mark('update-end');
performance.measure('update', 'update-start', 'update-end');

// Get measurement
const measures = performance.getEntriesByType('measure');
console.log(measures[0].duration); // milliseconds
```

---

## Object Pool Pattern

```typescript
class ObjectPool<T> {
  private pool: T[] = [];
  private active: T[] = [];
  private factory: () => T;
  
  constructor(factory: () => T, size: number) {
    this.factory = factory;
    for (let i = 0; i < size; i++) {
      this.pool.push(factory());
    }
  }
  
  acquire(): T | null {
    if (this.pool.length > 0) {
      const obj = this.pool.pop()!;
      this.active.push(obj);
      return obj;
    }
    return null;
  }
  
  release(obj: T): void {
    const index = this.active.indexOf(obj);
    if (index !== -1) {
      this.active.splice(index, 1);
      this.pool.push(obj);
    }
  }
}
```

---

## Spatial Grid

```typescript
class SpatialGrid {
  private grid: Map<string, Entity[]> = new Map();
  private cellSize: number = 64;
  
  insert(entity: Entity): void {
    const x = Math.floor(entity.x / this.cellSize);
    const y = Math.floor(entity.y / this.cellSize);
    const key = `${x},${y}`;
    if (!this.grid.has(key)) this.grid.set(key, []);
    this.grid.get(key)!.push(entity);
  }
  
  getNearby(entity: Entity): Entity[] {
    const nearby: Entity[] = [];
    const cx = Math.floor(entity.x / this.cellSize);
    const cy = Math.floor(entity.y / this.cellSize);
    
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        const key = `${cx+dx},${cy+dy}`;
        if (this.grid.has(key)) {
          nearby.push(...this.grid.get(key)!);
        }
      }
    }
    return nearby;
  }
}
```

---

## Frustum Culling

```typescript
isVisible(entity: Entity, camera: Camera): boolean {
  return !(
    entity.x + entity.width < camera.x ||
    entity.x > camera.x + camera.width ||
    entity.y + entity.height < camera.y ||
    entity.y > camera.y + camera.height
  );
}

// Only render visible
entities.forEach(e => {
  if (isVisible(e, camera)) {
    e.render(ctx);
  }
});
```

---

## Layer Caching

```typescript
class CachedLayer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private dirty: boolean = true;
  
  constructor(width: number, height: number) {
    this.canvas = document.createElement('canvas');
    this.canvas.width = width;
    this.canvas.height = height;
    this.ctx = this.canvas.getContext('2d')!;
  }
  
  render(renderFn: (ctx: CanvasRenderingContext2D) => void): HTMLCanvasElement {
    if (this.dirty) {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      renderFn(this.ctx);
      this.dirty = false;
    }
    return this.canvas;
  }
  
  markDirty(): void { this.dirty = true; }
}
```

---

## Batch Rendering

```typescript
// Sort by state
const byColor = new Map<string, Entity[]>();
entities.forEach(e => {
  if (!byColor.has(e.color)) byColor.set(e.color, []);
  byColor.get(e.color)!.push(e);
});

// Render batches
byColor.forEach((entities, color) => {
  ctx.fillStyle = color; // Set once
  entities.forEach(e => {
    ctx.fillRect(e.x, e.y, e.width, e.height);
  });
});
```

---

## Memory Monitoring

```typescript
function checkMemory(): void {
  if (performance.memory) {
    const used = performance.memory.usedJSHeapSize;
    const limit = performance.memory.jsHeapSizeLimit;
    console.log(`Memory: ${(used/1024/1024).toFixed(2)}MB / ${(limit/1024/1024).toFixed(2)}MB`);
  }
}
```

---

## Common Optimizations

| Problem | Solution | Speedup |
|---------|----------|---------|
| O(n²) collision | Spatial grid | 10-50× |
| Object creation | Object pooling | 3-5× |
| Off-screen render | Frustum culling | 2-3× |
| Static content | Layer caching | 2-10× |
| State changes | Batch rendering | 1.5-2× |

---

## Performance Checklist

- [ ] FPS consistently 60
- [ ] No GC pauses > 10ms
- [ ] Collision < 2ms
- [ ] Render < 8ms
- [ ] Update < 8ms
- [ ] Memory stable
- [ ] No leaks

---

**Profile, measure, optimize!** 🚀
