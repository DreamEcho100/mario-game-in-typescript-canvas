# Performance Profiling and Optimization

**Unit 06: Optimization, Polish & Engine Abstractions | Topic 01 of 03**

> **Learning Objective:** Master performance analysis, profiling tools, and optimization techniques to build smooth 60 FPS games.

---

## Table of Contents

1. [Introduction](#introduction)
2. [Understanding Performance](#understanding-performance)
3. [Browser Profiling Tools](#browser-profiling-tools)
4. [Performance Metrics](#performance-metrics)
5. [Common Performance Issues](#common-performance-issues)
6. [Optimization Techniques](#optimization-techniques)
7. [Memory Management](#memory-management)
8. [Advanced Profiling](#advanced-profiling)
9. [Performance Budget](#performance-budget)
10. [Application to Mario Game](#application-to-mario-game)
11. [Summary](#summary)

---

## Introduction

### What is Performance Profiling?

Performance profiling is the systematic analysis of your game's execution to identify bottlenecks, measure frame times, and optimize resource usage.

**Why It Matters:**
- 60 FPS = 16.67ms per frame budget
- Dropped frames = choppy gameplay
- Poor performance = bad player experience
- Memory leaks = crashes over time

### What You'll Learn

- How to use Chrome DevTools for profiling
- Identifying performance bottlenecks
- Frame rate analysis and optimization
- Memory leak detection and prevention
- CPU and GPU optimization techniques
- Creating a performance budget

### Prerequisites

- Completed Units 01-05
- Working Mario game implementation
- Basic understanding of browser DevTools
- Familiarity with JavaScript execution

### Time Investment

**Estimated Time:** 3-4 hours
- Profiling Tools: 1 hour
- Optimization Techniques: 1.5 hours
- Memory Management: 1 hour
- Practice: 30 minutes

---

## Understanding Performance

### The 60 FPS Target

```
60 FPS = 60 frames per second
      = 16.67 milliseconds per frame

Frame Budget Breakdown:
┌──────────────────────────────┐
│ JavaScript Logic    : 8ms    │
│ Layout/Paint        : 5ms    │
│ Compositor          : 3ms    │
│ Buffer              : 0.67ms │
└──────────────────────────────┘
Total: 16.67ms
```

**If any frame takes longer than 16.67ms:**
- Frame is dropped
- Animation stutters
- Input feels laggy
- Player experience suffers

### Performance Pillars

**1. CPU Performance:**
- JavaScript execution time
- Game logic calculations
- Collision detection
- AI computations

**2. GPU Performance:**
- Drawing operations
- Fill rate (pixels drawn)
- Texture uploads
- Composite layers

**3. Memory Performance:**
- Heap allocation
- Garbage collection pauses
- Memory leaks
- Cache efficiency

---

## Browser Profiling Tools

### Chrome DevTools Performance Tab

**Opening DevTools:**
```
Windows/Linux: F12 or Ctrl + Shift + I
Mac: Cmd + Option + I
```

**Performance Panel:**
1. Click "Performance" tab
2. Click record button (or Ctrl+E)
3. Interact with your game
4. Stop recording
5. Analyze the timeline

**What You See:**

```
Timeline View:
═══════════════════════════════════════════════
FPS    ▁▃▅█▅▃▁▁▃▅█▅▃▁ (green = good, red = bad)
───────────────────────────────────────────────
Main   ████████░░░░██████████░░░ (CPU activity)
───────────────────────────────────────────────
Raster ░░██░░░░░░░░░░██░░░░░░░░ (GPU activity)
───────────────────────────────────────────────
GPU    ░░██░░░░░░░░░░██░░░░░░░░ (GPU memory)
═══════════════════════════════════════════════
```

### Key Metrics to Watch

**1. Frame Rate (FPS):**
- Green bars = 60 FPS
- Yellow bars = 30-60 FPS
- Red bars = < 30 FPS

**2. Main Thread Activity:**
- Long tasks = frame drops
- Frequent GC = memory issues
- Idle time = optimization opportunity

**3. Function Call Tree:**
- Which functions take the most time
- Call stack depth
- Self time vs total time

### Recording a Profile

```typescript
// In your game code, mark performance points
class Game {
  update(deltaTime: number): void {
    performance.mark('update-start');
    
    this.player.update(deltaTime);
    this.enemies.forEach(e => e.update(deltaTime));
    this.physics.update(deltaTime);
    
    performance.mark('update-end');
    performance.measure('update', 'update-start', 'update-end');
  }
  
  render(): void {
    performance.mark('render-start');
    
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.renderBackground();
    this.renderEntities();
    this.renderUI();
    
    performance.mark('render-end');
    performance.measure('render', 'render-start', 'render-end');
  }
}
```

**Viewing Marks in DevTools:**
```typescript
// Get all measurements
const measures = performance.getEntriesByType('measure');
measures.forEach(measure => {
  console.log(`${measure.name}: ${measure.duration.toFixed(2)}ms`);
});
```

---

## Performance Metrics

### Frame Time Analysis

```typescript
class PerformanceMonitor {
  private frameTimes: number[] = [];
  private lastFrameTime: number = 0;
  private readonly MAX_SAMPLES = 60;
  
  constructor() {}
  
  recordFrame(currentTime: number): void {
    if (this.lastFrameTime > 0) {
      const frameTime = currentTime - this.lastFrameTime;
      this.frameTimes.push(frameTime);
      
      if (this.frameTimes.length > this.MAX_SAMPLES) {
        this.frameTimes.shift();
      }
    }
    this.lastFrameTime = currentTime;
  }
  
  getAverageFPS(): number {
    if (this.frameTimes.length === 0) return 0;
    const avgFrameTime = this.frameTimes.reduce((a, b) => a + b) / this.frameTimes.length;
    return 1000 / avgFrameTime;
  }
  
  getMinFPS(): number {
    if (this.frameTimes.length === 0) return 0;
    const maxFrameTime = Math.max(...this.frameTimes);
    return 1000 / maxFrameTime;
  }
  
  getMaxFPS(): number {
    if (this.frameTimes.length === 0) return 0;
    const minFrameTime = Math.min(...this.frameTimes);
    return 1000 / minFrameTime;
  }
  
  getFrameTimePercentile(percentile: number): number {
    if (this.frameTimes.length === 0) return 0;
    const sorted = [...this.frameTimes].sort((a, b) => a - b);
    const index = Math.floor(sorted.length * percentile);
    return sorted[index];
  }
}
```

### Using the Monitor

```typescript
const perfMonitor = new PerformanceMonitor();

function gameLoop(currentTime: number): void {
  perfMonitor.recordFrame(currentTime);
  
  // Every 60 frames, log stats
  if (frameCount % 60 === 0) {
    console.log(`Average FPS: ${perfMonitor.getAverageFPS().toFixed(1)}`);
    console.log(`Min FPS: ${perfMonitor.getMinFPS().toFixed(1)}`);
    console.log(`95th percentile: ${perfMonitor.getFrameTimePercentile(0.95).toFixed(2)}ms`);
  }
  
  // Game logic here...
  
  requestAnimationFrame(gameLoop);
}
```

### Memory Profiling

```typescript
class MemoryMonitor {
  private readonly WARN_THRESHOLD = 50 * 1024 * 1024; // 50 MB
  private readonly CRITICAL_THRESHOLD = 100 * 1024 * 1024; // 100 MB
  
  checkMemory(): void {
    if (performance.memory) {
      const used = performance.memory.usedJSHeapSize;
      const total = performance.memory.totalJSHeapSize;
      const limit = performance.memory.jsHeapSizeLimit;
      
      console.log(`Memory: ${(used / 1024 / 1024).toFixed(2)} MB used`);
      console.log(`Total: ${(total / 1024 / 1024).toFixed(2)} MB`);
      console.log(`Limit: ${(limit / 1024 / 1024).toFixed(2)} MB`);
      
      if (used > this.CRITICAL_THRESHOLD) {
        console.error('CRITICAL: Memory usage too high!');
      } else if (used > this.WARN_THRESHOLD) {
        console.warn('WARNING: High memory usage');
      }
    }
  }
}
```

---

## Common Performance Issues

### Issue 1: Excessive Object Creation

**Problem:**
```typescript
// ❌ Bad: Creates new objects every frame
class Game {
  render(): void {
    this.entities.forEach(entity => {
      const position = { x: entity.x, y: entity.y }; // New object!
      const size = { width: entity.width, height: entity.height }; // New object!
      this.ctx.drawImage(entity.image, position.x, position.y, size.width, size.height);
    });
  }
}
```

**Solution:**
```typescript
// ✅ Good: Reuse or inline values
class Game {
  render(): void {
    this.entities.forEach(entity => {
      this.ctx.drawImage(
        entity.image,
        entity.x,
        entity.y,
        entity.width,
        entity.height
      );
    });
  }
}
```

### Issue 2: Inefficient Collision Detection

**Problem:**
```typescript
// ❌ Bad: O(n²) every frame
checkCollisions(): void {
  for (let i = 0; i < this.entities.length; i++) {
    for (let j = 0; j < this.entities.length; j++) {
      if (i !== j && this.collides(this.entities[i], this.entities[j])) {
        this.handleCollision(this.entities[i], this.entities[j]);
      }
    }
  }
}
```

**Solution:**
```typescript
// ✅ Good: Spatial partitioning with grid
class SpatialGrid {
  private grid: Map<string, Entity[]> = new Map();
  private cellSize: number = 64;
  
  clear(): void {
    this.grid.clear();
  }
  
  insert(entity: Entity): void {
    const cellX = Math.floor(entity.x / this.cellSize);
    const cellY = Math.floor(entity.y / this.cellSize);
    const key = `${cellX},${cellY}`;
    
    if (!this.grid.has(key)) {
      this.grid.set(key, []);
    }
    this.grid.get(key)!.push(entity);
  }
  
  getNearby(entity: Entity): Entity[] {
    const nearby: Entity[] = [];
    const cellX = Math.floor(entity.x / this.cellSize);
    const cellY = Math.floor(entity.y / this.cellSize);
    
    // Check 3x3 grid around entity
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        const key = `${cellX + dx},${cellY + dy}`;
        if (this.grid.has(key)) {
          nearby.push(...this.grid.get(key)!);
        }
      }
    }
    
    return nearby;
  }
}

// Usage
class Game {
  private spatialGrid = new SpatialGrid();
  
  checkCollisions(): void {
    this.spatialGrid.clear();
    
    // Insert all entities into grid
    this.entities.forEach(entity => this.spatialGrid.insert(entity));
    
    // Check only nearby entities
    this.entities.forEach(entity => {
      const nearby = this.spatialGrid.getNearby(entity);
      nearby.forEach(other => {
        if (entity !== other && this.collides(entity, other)) {
          this.handleCollision(entity, other);
        }
      });
    });
  }
}
```

### Issue 3: Unnecessary Rendering

**Problem:**
```typescript
// ❌ Bad: Drawing everything even if off-screen
render(): void {
  this.entities.forEach(entity => {
    this.ctx.drawImage(entity.image, entity.x, entity.y);
  });
}
```

**Solution:**
```typescript
// ✅ Good: Frustum culling
class Camera {
  x: number = 0;
  y: number = 0;
  width: number = 800;
  height: number = 600;
  
  isVisible(entity: Entity): boolean {
    return !(
      entity.x + entity.width < this.x ||
      entity.x > this.x + this.width ||
      entity.y + entity.height < this.y ||
      entity.y > this.y + this.height
    );
  }
}

class Game {
  render(): void {
    this.entities.forEach(entity => {
      if (this.camera.isVisible(entity)) {
        this.ctx.drawImage(entity.image, entity.x - this.camera.x, entity.y - this.camera.y);
      }
    });
  }
}
```

### Issue 4: Redundant State Changes

**Problem:**
```typescript
// ❌ Bad: Setting state every frame
render(): void {
  this.entities.forEach(entity => {
    this.ctx.fillStyle = entity.color; // State change every entity!
    this.ctx.fillRect(entity.x, entity.y, entity.width, entity.height);
  });
}
```

**Solution:**
```typescript
// ✅ Good: Batch by state
render(): void {
  // Sort entities by color
  const byColor = new Map<string, Entity[]>();
  this.entities.forEach(entity => {
    if (!byColor.has(entity.color)) {
      byColor.set(entity.color, []);
    }
    byColor.get(entity.color)!.push(entity);
  });
  
  // Render batches
  byColor.forEach((entities, color) => {
    this.ctx.fillStyle = color; // Set once per color
    entities.forEach(entity => {
      this.ctx.fillRect(entity.x, entity.y, entity.width, entity.height);
    });
  });
}
```

---

## Optimization Techniques

### 1. Object Pooling

**Problem:** Creating/destroying objects causes GC pauses.

**Solution:** Reuse objects from a pool.

```typescript
class ParticlePool {
  private pool: Particle[] = [];
  private active: Particle[] = [];
  
  constructor(size: number) {
    for (let i = 0; i < size; i++) {
      this.pool.push(new Particle());
    }
  }
  
  acquire(): Particle | null {
    if (this.pool.length > 0) {
      const particle = this.pool.pop()!;
      this.active.push(particle);
      return particle;
    }
    return null;
  }
  
  release(particle: Particle): void {
    const index = this.active.indexOf(particle);
    if (index !== -1) {
      this.active.splice(index, 1);
      particle.reset();
      this.pool.push(particle);
    }
  }
  
  update(deltaTime: number): void {
    for (let i = this.active.length - 1; i >= 0; i--) {
      const particle = this.active[i];
      particle.update(deltaTime);
      
      if (particle.isDead()) {
        this.release(particle);
      }
    }
  }
  
  render(ctx: CanvasRenderingContext2D): void {
    this.active.forEach(particle => particle.render(ctx));
  }
}
```

### 2. Dirty Rectangle Optimization

**Concept:** Only redraw changed areas.

```typescript
class DirtyRectManager {
  private dirtyRects: Rectangle[] = [];
  
  markDirty(x: number, y: number, width: number, height: number): void {
    this.dirtyRects.push({ x, y, width, height });
  }
  
  render(ctx: CanvasRenderingContext2D, renderFn: (rect: Rectangle) => void): void {
    if (this.dirtyRects.length === 0) {
      return; // Nothing to redraw
    }
    
    // Merge overlapping rectangles
    const merged = this.mergeRects(this.dirtyRects);
    
    // Clear and render only dirty areas
    merged.forEach(rect => {
      ctx.save();
      ctx.beginPath();
      ctx.rect(rect.x, rect.y, rect.width, rect.height);
      ctx.clip();
      
      renderFn(rect);
      
      ctx.restore();
    });
    
    this.dirtyRects = [];
  }
  
  private mergeRects(rects: Rectangle[]): Rectangle[] {
    // Simple implementation: return all rects
    // Advanced: actually merge overlapping rects
    return rects;
  }
}
```

### 3. Request Animation Frame Throttling

**For non-critical updates:**

```typescript
class ThrottledSystem {
  private lastUpdate: number = 0;
  private updateInterval: number = 100; // ms
  
  shouldUpdate(currentTime: number): boolean {
    if (currentTime - this.lastUpdate >= this.updateInterval) {
      this.lastUpdate = currentTime;
      return true;
    }
    return false;
  }
}

// Usage
class Game {
  private particleSystem = new ThrottledSystem();
  
  update(currentTime: number, deltaTime: number): void {
    // Always update critical systems
    this.player.update(deltaTime);
    this.physics.update(deltaTime);
    
    // Update particles less frequently
    if (this.particleSystem.shouldUpdate(currentTime)) {
      this.particles.forEach(p => p.update(deltaTime));
    }
  }
}
```

### 4. Layer Caching

**Pre-render static content:**

```typescript
class LayerCache {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private dirty: boolean = true;
  
  constructor(width: number, height: number) {
    this.canvas = document.createElement('canvas');
    this.canvas.width = width;
    this.canvas.height = height;
    this.ctx = this.canvas.getContext('2d')!;
  }
  
  markDirty(): void {
    this.dirty = true;
  }
  
  render(renderFn: (ctx: CanvasRenderingContext2D) => void): HTMLCanvasElement {
    if (this.dirty) {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      renderFn(this.ctx);
      this.dirty = false;
    }
    return this.canvas;
  }
}

// Usage
class Game {
  private backgroundCache = new LayerCache(800, 600);
  
  render(): void {
    // Render cached background
    const bgCanvas = this.backgroundCache.render((ctx) => {
      this.renderSky(ctx);
      this.renderClouds(ctx);
      this.renderMountains(ctx);
    });
    this.ctx.drawImage(bgCanvas, 0, 0);
    
    // Render dynamic content
    this.renderEntities();
    this.renderUI();
  }
}
```

---

## Memory Management

### Detecting Memory Leaks

**Common Causes:**
1. Event listeners not removed
2. Intervals not cleared
3. References not released
4. Growing arrays never cleaned

**Leak Example:**

```typescript
// ❌ Memory leak: event listener never removed
class Player {
  constructor() {
    window.addEventListener('keydown', (e) => {
      this.handleInput(e);
    });
  }
  
  handleInput(e: KeyboardEvent): void {
    // Handle input
  }
}

// Every time a new Player is created, a new listener is added!
```

**Fix:**

```typescript
// ✅ Clean up properly
class Player {
  private boundHandleInput: (e: KeyboardEvent) => void;
  
  constructor() {
    this.boundHandleInput = this.handleInput.bind(this);
    window.addEventListener('keydown', this.boundHandleInput);
  }
  
  destroy(): void {
    window.removeEventListener('keydown', this.boundHandleInput);
  }
  
  handleInput(e: KeyboardEvent): void {
    // Handle input
  }
}
```

### Heap Snapshot Analysis

**Using Chrome DevTools:**

1. Open DevTools → Memory tab
2. Take a heap snapshot
3. Play game for 1 minute
4. Take another snapshot
5. Compare snapshots
6. Look for growing arrays/objects

**What to Look For:**
- Detached DOM nodes
- Growing object counts
- Large array allocations
- Retained event listeners

### Garbage Collection Optimization

```typescript
// Minimize GC pressure
class OptimizedGame {
  // ✅ Reuse objects
  private tempVector = { x: 0, y: 0 };
  
  update(deltaTime: number): void {
    this.entities.forEach(entity => {
      // ❌ Bad: Creates new object
      // const velocity = { x: entity.vx, y: entity.vy };
      
      // ✅ Good: Reuse temp object
      this.tempVector.x = entity.vx;
      this.tempVector.y = entity.vy;
      this.applyVelocity(entity, this.tempVector);
    });
  }
  
  applyVelocity(entity: Entity, velocity: { x: number; y: number }): void {
    entity.x += velocity.x;
    entity.y += velocity.y;
  }
}
```

---

## Advanced Profiling

### Custom Performance Marks

```typescript
class PerformanceProfiler {
  private marks: Map<string, number> = new Map();
  private measures: Map<string, number[]> = new Map();
  
  start(label: string): void {
    this.marks.set(label, performance.now());
  }
  
  end(label: string): void {
    const startTime = this.marks.get(label);
    if (startTime !== undefined) {
      const duration = performance.now() - startTime;
      
      if (!this.measures.has(label)) {
        this.measures.set(label, []);
      }
      this.measures.get(label)!.push(duration);
      
      this.marks.delete(label);
    }
  }
  
  getAverage(label: string): number {
    const measurements = this.measures.get(label);
    if (!measurements || measurements.length === 0) return 0;
    
    const sum = measurements.reduce((a, b) => a + b, 0);
    return sum / measurements.length;
  }
  
  report(): void {
    console.log('=== Performance Report ===');
    this.measures.forEach((measurements, label) => {
      const avg = this.getAverage(label);
      const max = Math.max(...measurements);
      console.log(`${label}: avg=${avg.toFixed(2)}ms, max=${max.toFixed(2)}ms`);
    });
  }
  
  reset(): void {
    this.marks.clear();
    this.measures.clear();
  }
}

// Usage
const profiler = new PerformanceProfiler();

function gameLoop(): void {
  profiler.start('update');
  game.update(deltaTime);
  profiler.end('update');
  
  profiler.start('render');
  game.render();
  profiler.end('render');
  
  profiler.start('collision');
  game.checkCollisions();
  profiler.end('collision');
  
  requestAnimationFrame(gameLoop);
}

// Every 5 seconds, print report
setInterval(() => {
  profiler.report();
  profiler.reset();
}, 5000);
```

---

## Performance Budget

### Setting Targets

```typescript
interface PerformanceBudget {
  targetFPS: number;
  maxFrameTime: number;
  maxUpdateTime: number;
  maxRenderTime: number;
  maxMemory: number;
  maxEntities: number;
  maxParticles: number;
}

const PERFORMANCE_BUDGET: PerformanceBudget = {
  targetFPS: 60,
  maxFrameTime: 16.67, // ms
  maxUpdateTime: 8, // ms
  maxRenderTime: 8, // ms
  maxMemory: 100 * 1024 * 1024, // 100 MB
  maxEntities: 500,
  maxParticles: 1000
};

class BudgetMonitor {
  private budget: PerformanceBudget;
  
  constructor(budget: PerformanceBudget) {
    this.budget = budget;
  }
  
  checkBudget(stats: {
    fps: number;
    frameTime: number;
    updateTime: number;
    renderTime: number;
    memory: number;
    entityCount: number;
    particleCount: number;
  }): string[] {
    const violations: string[] = [];
    
    if (stats.fps < this.budget.targetFPS) {
      violations.push(`FPS below target: ${stats.fps.toFixed(1)} < ${this.budget.targetFPS}`);
    }
    
    if (stats.frameTime > this.budget.maxFrameTime) {
      violations.push(`Frame time exceeded: ${stats.frameTime.toFixed(2)}ms > ${this.budget.maxFrameTime}ms`);
    }
    
    if (stats.updateTime > this.budget.maxUpdateTime) {
      violations.push(`Update time exceeded: ${stats.updateTime.toFixed(2)}ms > ${this.budget.maxUpdateTime}ms`);
    }
    
    if (stats.renderTime > this.budget.maxRenderTime) {
      violations.push(`Render time exceeded: ${stats.renderTime.toFixed(2)}ms > ${this.budget.maxRenderTime}ms`);
    }
    
    if (stats.memory > this.budget.maxMemory) {
      violations.push(`Memory exceeded: ${(stats.memory / 1024 / 1024).toFixed(2)}MB > ${(this.budget.maxMemory / 1024 / 1024).toFixed(2)}MB`);
    }
    
    if (stats.entityCount > this.budget.maxEntities) {
      violations.push(`Entity count exceeded: ${stats.entityCount} > ${this.budget.maxEntities}`);
    }
    
    if (stats.particleCount > this.budget.maxParticles) {
      violations.push(`Particle count exceeded: ${stats.particleCount} > ${this.budget.maxParticles}`);
    }
    
    return violations;
  }
}
```

---

## Application to Mario Game

### Complete Optimized Game Loop

```typescript
class OptimizedMarioGame {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  
  private player: Player;
  private enemies: Entity[] = [];
  private coins: Entity[] = [];
  
  private spatialGrid = new SpatialGrid(64);
  private particlePool = new ParticlePool(200);
  private backgroundCache = new LayerCache(800, 600);
  
  private perfMonitor = new PerformanceMonitor();
  private profiler = new PerformanceProfiler();
  private budgetMonitor = new BudgetMonitor(PERFORMANCE_BUDGET);
  
  private lastTime: number = 0;
  
  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    
    this.player = new Player(100, 400);
    this.setupEntities();
  }
  
  private setupEntities(): void {
    // Create enemies
    for (let i = 0; i < 10; i++) {
      this.enemies.push(new Enemy(200 + i * 100, 400));
    }
    
    // Create coins
    for (let i = 0; i < 50; i++) {
      this.coins.push(new Coin(150 + i * 50, 350));
    }
  }
  
  update(currentTime: number): void {
    this.profiler.start('total-update');
    
    const deltaTime = currentTime - this.lastTime;
    this.lastTime = currentTime;
    
    // Update player
    this.profiler.start('player-update');
    this.player.update(deltaTime);
    this.profiler.end('player-update');
    
    // Update enemies
    this.profiler.start('enemy-update');
    this.enemies.forEach(enemy => enemy.update(deltaTime));
    this.profiler.end('enemy-update');
    
    // Check collisions with spatial partitioning
    this.profiler.start('collision-detection');
    this.checkCollisionsOptimized();
    this.profiler.end('collision-detection');
    
    // Update particles (throttled)
    this.profiler.start('particle-update');
    this.particlePool.update(deltaTime);
    this.profiler.end('particle-update');
    
    this.profiler.end('total-update');
  }
  
  private checkCollisionsOptimized(): void {
    this.spatialGrid.clear();
    
    // Insert entities
    this.spatialGrid.insert(this.player);
    this.enemies.forEach(e => this.spatialGrid.insert(e));
    this.coins.forEach(c => this.spatialGrid.insert(c));
    
    // Check player vs enemies
    const nearPlayer = this.spatialGrid.getNearby(this.player);
    nearPlayer.forEach(entity => {
      if (entity instanceof Enemy && this.collides(this.player, entity)) {
        this.handlePlayerEnemyCollision(entity);
      } else if (entity instanceof Coin && this.collides(this.player, entity)) {
        this.handlePlayerCoinCollision(entity);
      }
    });
  }
  
  private collides(a: Entity, b: Entity): boolean {
    return !(
      a.x + a.width < b.x ||
      a.x > b.x + b.width ||
      a.y + a.height < b.y ||
      a.y > b.y + b.height
    );
  }
  
  private handlePlayerEnemyCollision(enemy: Enemy): void {
    if (this.player.velocityY > 0 && this.player.y < enemy.y) {
      // Bounce
      this.player.velocityY = -10;
      enemy.die();
      this.createParticles(enemy.x, enemy.y);
    } else {
      // Damage
      this.player.takeDamage();
    }
  }
  
  private handlePlayerCoinCollision(coin: Coin): void {
    coin.collect();
    this.coins = this.coins.filter(c => c !== coin);
    this.createParticles(coin.x, coin.y);
  }
  
  private createParticles(x: number, y: number): void {
    for (let i = 0; i < 10; i++) {
      const particle = this.particlePool.acquire();
      if (particle) {
        particle.init(x, y);
      }
    }
  }
  
  render(): void {
    this.profiler.start('total-render');
    
    // Clear
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Render cached background
    this.profiler.start('background');
    const bgCanvas = this.backgroundCache.render((ctx) => {
      this.renderBackground(ctx);
    });
    this.ctx.drawImage(bgCanvas, 0, 0);
    this.profiler.end('background');
    
    // Render entities (with frustum culling)
    this.profiler.start('entities');
    this.renderEntities();
    this.profiler.end('entities');
    
    // Render particles
    this.profiler.start('particles');
    this.particlePool.render(this.ctx);
    this.profiler.end('particles');
    
    // Render UI
    this.profiler.start('ui');
    this.renderUI();
    this.profiler.end('ui');
    
    this.profiler.end('total-render');
  }
  
  private renderBackground(ctx: CanvasRenderingContext2D): void {
    // Sky
    const gradient = ctx.createLinearGradient(0, 0, 0, this.canvas.height);
    gradient.addColorStop(0, '#87CEEB');
    gradient.addColorStop(1, '#E0F6FF');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Ground
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(0, 500, this.canvas.width, 100);
  }
  
  private renderEntities(): void {
    // Batch render by type for state efficiency
    this.player.render(this.ctx);
    
    // Render all enemies together
    this.enemies.forEach(enemy => enemy.render(this.ctx));
    
    // Render all coins together
    this.coins.forEach(coin => coin.render(this.ctx));
  }
  
  private renderUI(): void {
    // FPS counter
    this.ctx.fillStyle = '#000';
    this.ctx.font = '16px Arial';
    this.ctx.fillText(`FPS: ${this.perfMonitor.getAverageFPS().toFixed(1)}`, 10, 20);
    
    // Performance stats
    const avgUpdate = this.profiler.getAverage('total-update');
    const avgRender = this.profiler.getAverage('total-render');
    this.ctx.fillText(`Update: ${avgUpdate.toFixed(2)}ms`, 10, 40);
    this.ctx.fillText(`Render: ${avgRender.toFixed(2)}ms`, 10, 60);
    
    // Entity counts
    this.ctx.fillText(`Entities: ${this.enemies.length + this.coins.length}`, 10, 80);
    this.ctx.fillText(`Particles: ${this.particlePool.getActiveCount()}`, 10, 100);
  }
  
  gameLoop = (currentTime: number): void => {
    this.perfMonitor.recordFrame(currentTime);
    
    this.update(currentTime);
    this.render();
    
    // Check performance budget every second
    if (Math.floor(currentTime / 1000) !== Math.floor(this.lastTime / 1000)) {
      const violations = this.budgetMonitor.checkBudget({
        fps: this.perfMonitor.getAverageFPS(),
        frameTime: this.profiler.getAverage('total-update') + this.profiler.getAverage('total-render'),
        updateTime: this.profiler.getAverage('total-update'),
        renderTime: this.profiler.getAverage('total-render'),
        memory: performance.memory?.usedJSHeapSize || 0,
        entityCount: this.enemies.length + this.coins.length,
        particleCount: this.particlePool.getActiveCount()
      });
      
      if (violations.length > 0) {
        console.warn('Performance budget violations:');
        violations.forEach(v => console.warn(`- ${v}`));
      }
    }
    
    requestAnimationFrame(this.gameLoop);
  };
  
  start(): void {
    this.lastTime = performance.now();
    requestAnimationFrame(this.gameLoop);
  }
}

// Start the optimized game
const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
const game = new OptimizedMarioGame(canvas);
game.start();
```

---

## Summary

### What You've Learned

1. **Performance Profiling:**
   - Chrome DevTools usage
   - Frame time analysis
   - Memory profiling
   - Performance marks

2. **Common Issues:**
   - Object creation overhead
   - Inefficient collision detection
   - Unnecessary rendering
   - State change costs

3. **Optimization Techniques:**
   - Object pooling
   - Spatial partitioning
   - Frustum culling
   - Layer caching
   - Dirty rectangles

4. **Memory Management:**
   - Leak detection
   - GC optimization
   - Heap analysis
   - Resource cleanup

5. **Performance Budget:**
   - Setting targets
   - Monitoring violations
   - Continuous measurement

### Key Takeaways

- **Measure first, optimize second**
- **60 FPS = 16.67ms budget**
- **Object pooling prevents GC pauses**
- **Spatial partitioning beats O(n²)**
- **Cache static content**
- **Profile continuously**

### Performance Checklist

- [ ] Frame rate consistently 60 FPS
- [ ] No GC pauses > 10ms
- [ ] Memory usage stable
- [ ] Collision detection < 2ms
- [ ] Rendering < 8ms
- [ ] Update logic < 8ms
- [ ] No memory leaks
- [ ] Performance budget met

---

## Next Steps

**Next Topic:** Architecture Patterns
- Learn design patterns for game engines
- Implement component systems
- Build reusable abstractions
- Create clean architecture

**Continue practicing:**
- Profile your game
- Identify bottlenecks
- Apply optimizations
- Measure improvements

---

**You now have the tools to build smooth, optimized games!** 🚀✨
