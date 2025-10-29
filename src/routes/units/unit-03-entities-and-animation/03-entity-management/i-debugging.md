# Entity Management - Common Bugs

**Unit 03: Entities, Animations & Sprites | Topic 03 of 03**

> Fix these common entity management issues!

---

## Bug 1: Modifying Array During Iteration 🐛

### Symptom
Game crashes or entities disappear/duplicate randomly.

### Common Causes

**❌ Adding During Loop**
```typescript
// BAD: Modifies array while iterating
for (const entity of entities) {
    if (entity.shouldSpawn) {
        entities.push(new Child()); // CRASH!
    }
}
```

**❌ Removing During Loop**
```typescript
// BAD: Skips entities after removal
for (let i = 0; i < entities.length; i++) {
    if (entities[i].isDead()) {
        entities.splice(i, 1); // Skips next entity!
    }
}
```

**✅ Defer Modifications**
```typescript
// GOOD: Collect changes, apply after
const toAdd: Entity[] = [];
const toRemove: Entity[] = [];

for (const entity of entities) {
    if (entity.shouldSpawn) toAdd.push(new Child());
    if (entity.isDead()) toRemove.push(entity);
}

entities.push(...toAdd);
entities = entities.filter(e => !toRemove.includes(e));
```

### Fix Steps
1. Create `entitiesToAdd` and `entitiesToRemove` arrays
2. Collect modifications during loop
3. Apply changes after loop completes

---

## Bug 2: Object Pool Exhausted 🐛

### Symptom
Console warning: "Pool exhausted, creating new object"
Performance degrades over time.

### Common Causes

**❌ Not Releasing Objects**
```typescript
// BAD: Never returns to pool
function shoot(): void {
    const bullet = bulletPool.acquire();
    entities.add(bullet);
    // Never released!
}
```

**✅ Release When Done**
```typescript
// GOOD: Return to pool when dead
class Bullet extends Entity {
    update(dt: number): void {
        // ...
        if (this.hitSomething || this.offScreen) {
            this.destroy();
        }
    }
}

// In entity manager
update(dt: number): void {
    this.entities.forEach(e => {
        e.update(dt);
        if (!e.isAlive() && e instanceof Bullet) {
            bulletPool.release(e); // Return to pool
        }
    });
}
```

**❌ Pool Too Small**
```typescript
// BAD: Only 5 bullets pre-allocated
const bulletPool = new ObjectPool(factory, reset, 5);
// Player shoots 10 bullets/sec → exhausts quickly!
```

**✅ Size Pool Appropriately**
```typescript
// GOOD: Size based on expected usage
const bulletsPerSecond = 10;
const bulletLifetime = 2; // seconds
const poolSize = bulletsPerSecond * bulletLifetime * 1.5; // 30 bullets
const bulletPool = new ObjectPool(factory, reset, poolSize);
```

### Fix Steps
1. Always `release()` pooled objects when destroyed
2. Size pool to handle peak usage
3. Monitor pool size during gameplay

---

## Bug 3: Memory Leak from Unreleased Entities 🐛

### Symptom
Entity count keeps growing even when entities die.
Performance slowly degrades.

### Common Causes

**❌ Forgetting to Remove**
```typescript
// BAD: Dead entity stays in array
class Enemy extends Entity {
    takeDamage(amount: number): void {
        this.health -= amount;
        if (this.health <= 0) {
            this.alive = false;
            // Still in entityManager.entities[]!
        }
    }
}
```

**✅ Auto-Remove Dead Entities**
```typescript
// GOOD: Manager removes dead entities
class EntityManager {
    update(dt: number): void {
        this.entities.forEach(e => {
            e.update(dt);
            if (!e.isAlive()) {
                this.remove(e); // Auto-cleanup
            }
        });
        this.processPending();
    }
}
```

### Fix Steps
1. Check `isAlive()` in manager's update
2. Auto-remove dead entities
3. Use browser dev tools to monitor memory usage

---

## Bug 4: Spatial Grid Not Cleared 🐛

### Symptom
Collision detection detects ghosts of old entities.
Entities collide with nothing visible.

### Common Causes

**❌ Reusing Old Grid**
```typescript
// BAD: Grid contains old positions
function update(dt: number): void {
    entities.forEach(e => e.update(dt));
    
    // Grid still has old positions!
    entities.forEach(e => {
        spatialGrid.getNearby(e); // Wrong results!
    });
}
```

**✅ Rebuild Grid Each Frame**
```typescript
// GOOD: Clear and rebuild
function update(dt: number): void {
    entities.forEach(e => e.update(dt));
    
    // Rebuild with current positions
    spatialGrid.clear();
    entities.forEach(e => spatialGrid.insert(e));
    
    // Now collision detection works
    entities.forEach(e => {
        spatialGrid.getNearby(e).forEach(other => {
            checkCollision(e, other);
        });
    });
}
```

### Fix Steps
1. Call `spatialGrid.clear()` at start of update
2. Re-insert all entities after they've moved
3. Then do collision detection

---

## Bug 5: Entity Factory Type Mismatch 🐛

### Symptom
Error: "Unknown entity type: X"
Entities fail to spawn.

### Common Causes

**❌ Typo in Type Name**
```typescript
// Level data
{ type: 'goomba', x: 100, y: 400 }

// Factory registration
factory.register('goombah', (data) => new Goomba(data.x, data.y));
//                 ^^^^^^^ Typo!
```

**✅ Use Constants**
```typescript
// GOOD: Define type constants
enum EntityType {
    Goomba = 'goomba',
    Coin = 'coin',
    Platform = 'platform',
}

factory.register(EntityType.Goomba, (data) => new Goomba(data.x, data.y));
factory.register(EntityType.Coin, (data) => new Coin(data.x, data.y));

// In level data
{ type: EntityType.Goomba, x: 100, y: 400 }
```

### Fix Steps
1. Use TypeScript enums for type names
2. Add error handling in factory
3. Log all registered types for debugging

---

## Bug 6: Component Order Matters 🐛

### Symptom
Physics doesn't work correctly.
Animation position lags behind entity.

### Common Causes

**❌ Wrong Update Order**
```typescript
// BAD: Animation reads position before physics updates it
class Entity {
    update(dt: number): void {
        this.components.forEach(c => c.update(dt));
        // AnimationComponent updates BEFORE PhysicsComponent!
    }
}
```

**✅ Control Component Order**
```typescript
// GOOD: Physics first, then animation
class Entity {
    private physicsComponents: Component[] = [];
    private renderComponents: Component[] = [];
    
    addPhysicsComponent(component: Component): void {
        this.physicsComponents.push(component);
    }
    
    addRenderComponent(component: Component): void {
        this.renderComponents.push(component);
    }
    
    update(dt: number): void {
        // Physics first
        this.physicsComponents.forEach(c => c.update(dt));
        // Then rendering
        this.renderComponents.forEach(c => c.update(dt));
    }
}
```

### Fix Steps
1. Separate components by type (physics, rendering, AI)
2. Update in correct order
3. Or add priority system to components

---

## Bug 7: Culling Active Entities 🐛

### Symptom
Enemies stop moving when offscreen.
Projectiles disappear unexpectedly.

### Common Causes

**❌ Culling Update Too**
```typescript
// BAD: Don't update offscreen entities
function update(dt: number): void {
    entities.forEach(e => {
        if (isOnScreen(e, camera)) {
            e.update(dt); // Enemies freeze offscreen!
        }
    });
}
```

**✅ Only Cull Drawing**
```typescript
// GOOD: Update all, draw only visible
function update(dt: number): void {
    entities.forEach(e => e.update(dt)); // All entities
}

function draw(ctx: CanvasRenderingContext2D, camera: Camera): void {
    entities.forEach(e => {
        if (isOnScreen(e, camera)) {
            e.draw(ctx, camera); // Only visible
        }
    });
}
```

### Fix Steps
1. Always update all entities
2. Only cull during draw phase
3. Or add "important" flag to update critical offscreen entities

---

## Debugging Tools

### Entity Count Monitor
```typescript
function drawEntityStats(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = 'white';
    ctx.font = '14px monospace';
    ctx.fillText(`Entities: ${entityManager.count()}`, 10, 20);
    ctx.fillText(`Pending add: ${entityManager.pendingAddCount()}`, 10, 40);
    ctx.fillText(`Pending remove: ${entityManager.pendingRemoveCount()}`, 10, 60);
}
```

### Pool Statistics
```typescript
class ObjectPool<T> {
    getStats(): { available: number; created: number; inUse: number } {
        return {
            available: this.pool.length,
            created: this.totalCreated,
            inUse: this.totalCreated - this.pool.length,
        };
    }
}

// Display
const stats = bulletPool.getStats();
console.log(`Bullets: ${stats.inUse} in use, ${stats.available} available`);
```

### Spatial Grid Visualization
```typescript
function drawSpatialGrid(ctx: CanvasRenderingContext2D, grid: SpatialGrid, camera: Camera): void {
    ctx.strokeStyle = 'rgba(255, 0, 0, 0.3)';
    ctx.lineWidth = 1;
    
    const cellSize = 64;
    for (let x = 0; x < camera.width; x += cellSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, camera.height);
        ctx.stroke();
    }
    for (let y = 0; y < camera.height; y += cellSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(camera.width, y);
        ctx.stroke();
    }
}
```

---

## Testing Checklist

- [ ] No crashes when spawning entities during update
- [ ] Dead entities are removed from manager
- [ ] Object pool releases objects properly
- [ ] Spatial grid cleared each frame
- [ ] Factory handles unknown types gracefully
- [ ] Component update order is correct
- [ ] Offscreen entities still update
- [ ] Memory doesn't grow over time

---

**Next:** FAQ in `j-faq.md`!
