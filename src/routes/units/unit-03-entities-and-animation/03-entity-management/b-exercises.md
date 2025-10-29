# Entity Management - Exercises

**Unit 03: Entities, Animations & Sprites | Topic 03 of 03**

> Practice building scalable entity systems!

---

## Exercise 1: Base Entity Class ⭐

Create a base `Entity` class with common properties.

### Requirements
- Properties: `x`, `y`, `width`, `height`
- Abstract methods: `update(dt)`, `draw(ctx, camera)`
- `isAlive()` returns boolean
- `destroy()` marks entity as dead

### Template
```typescript
abstract class Entity {
    x: number;
    y: number;
    width: number;
    height: number;
    
    private alive = true;
    
    constructor(x: number, y: number, width: number, height: number) {
        // TODO
    }
    
    abstract update(dt: number): void;
    abstract draw(ctx: CanvasRenderingContext2D, camera: Camera): void;
    
    isAlive(): boolean {
        // TODO
    }
    
    destroy(): void {
        // TODO
    }
}
```

---

## Exercise 2: Concrete Entity - Coin ⭐⭐

Implement a `Coin` entity that:
- Extends `Entity`
- Bounces up and down (sine wave)
- Draws a yellow circle
- Destroys when collected

### Template
```typescript
class Coin extends Entity {
    private time = 0;
    private baseY: number;
    
    constructor(x: number, y: number) {
        super(x, y, 16, 16);
        this.baseY = y;
    }
    
    update(dt: number): void {
        // TODO: Animate with sine wave
        this.time += dt / 1000;
        this.y = this.baseY + Math.sin(this.time * 3) * 5;
    }
    
    draw(ctx: CanvasRenderingContext2D, camera: Camera): void {
        // TODO: Draw yellow circle
    }
}
```

---

## Exercise 3: Entity Manager ⭐⭐

Build an `EntityManager` to manage multiple entities.

### Requirements
- Store array of entities
- `add(entity)` adds entity
- `remove(entity)` removes entity
- `update(dt)` updates all
- `draw(ctx, camera)` draws all
- Auto-remove dead entities

### Template
```typescript
class EntityManager {
    private entities: Entity[] = [];
    private entitiesToAdd: Entity[] = [];
    private entitiesToRemove: Entity[] = [];
    
    add(entity: Entity): void {
        // TODO: Add to pending list
    }
    
    remove(entity: Entity): void {
        // TODO: Add to removal list
    }
    
    update(dt: number): void {
        // TODO: Process pending, update all, remove dead
    }
    
    draw(ctx: CanvasRenderingContext2D, camera: Camera): void {
        // TODO: Draw all entities
    }
    
    private processPending(): void {
        // TODO: Add new and remove old entities
    }
}
```

---

## Exercise 4: Deferred Add/Remove ⭐⭐

Modify EntityManager to defer add/remove until after update loop.

### Why?
```typescript
// ❌ BAD: Crash! Modified during iteration
for (const entity of entities) {
    if (entity.shouldSpawn) {
        entities.push(new Entity()); // ERROR!
    }
}

// ✅ GOOD: Defer modifications
for (const entity of entities) {
    if (entity.shouldSpawn) {
        entitiesToAdd.push(new Entity()); // Safe!
    }
}
entities.push(...entitiesToAdd);
```

### Requirements
- Collect additions in `entitiesToAdd`
- Collect removals in `entitiesToRemove`
- Process at end of `update()`

---

## Exercise 5: Object Pool ⭐⭐⭐

Create an `ObjectPool` for bullets.

### Requirements
- Pre-allocate objects
- `acquire()` gets object from pool
- `release(obj)` returns object to pool
- Create new if pool empty

### Template
```typescript
class ObjectPool<T> {
    private pool: T[] = [];
    private factory: () => T;
    private reset: (obj: T) => void;
    
    constructor(factory: () => T, reset: (obj: T) => void, initialSize = 10) {
        // TODO: Pre-create objects
    }
    
    acquire(): T {
        // TODO: Return from pool or create new
    }
    
    release(obj: T): void {
        // TODO: Reset and return to pool
    }
}

// Usage
const bulletPool = new ObjectPool<Bullet>(
    () => new Bullet(0, 0),
    (b) => b.reset(0, 0),
    50
);
```

---

## Exercise 6: Entity Factory ⭐⭐⭐

Build a factory that creates entities from data.

### Requirements
- Register entity types with creator functions
- `create(data)` creates entity from type string
- Throw error for unknown types

### Example Data
```typescript
const levelData = [
    { type: 'coin', x: 100, y: 200 },
    { type: 'enemy', x: 300, y: 400 },
    { type: 'platform', x: 200, y: 450, width: 100 },
];
```

### Template
```typescript
interface EntityData {
    type: string;
    x: number;
    y: number;
    properties?: Record<string, any>;
}

class EntityFactory {
    private creators = new Map<string, (data: EntityData) => Entity>();
    
    register(type: string, creator: (data: EntityData) => Entity): void {
        // TODO
    }
    
    create(data: EntityData): Entity {
        // TODO: Find creator and call it
    }
}
```

---

## Exercise 7: Offscreen Culling ⭐⭐

Only draw entities visible on screen.

### Requirements
- Check if entity bounds intersect camera bounds
- Skip `draw()` if offscreen
- Still `update()` important entities (player, enemies near player)

### Template
```typescript
class EntityManager {
    draw(ctx: CanvasRenderingContext2D, camera: Camera): void {
        for (const entity of this.entities) {
            if (this.isOnScreen(entity, camera)) {
                entity.draw(ctx, camera);
            }
        }
    }
    
    private isOnScreen(entity: Entity, camera: Camera): boolean {
        // TODO: Check bounds intersection
        return (
            entity.x + entity.width >= camera.x &&
            entity.x <= camera.x + camera.width &&
            entity.y + entity.height >= camera.y &&
            entity.y <= camera.y + camera.height
        );
    }
}
```

---

## Exercise 8: Spatial Grid ⭐⭐⭐⭐

Implement a spatial grid for fast collision detection.

### Requirements
- Divide world into cells (e.g., 64x64)
- `insert(entity)` adds to grid
- `getNearby(entity)` returns entities in nearby cells
- `clear()` resets grid each frame

### Template
```typescript
class SpatialGrid {
    private cellSize: number;
    private grid = new Map<string, Entity[]>();
    
    constructor(cellSize = 64) {
        this.cellSize = cellSize;
    }
    
    clear(): void {
        // TODO
    }
    
    insert(entity: Entity): void {
        // TODO: Add to all cells it overlaps
        const cells = this.getCells(entity);
        cells.forEach(key => {
            // Add to cell
        });
    }
    
    getNearby(entity: Entity): Entity[] {
        // TODO: Get entities from nearby cells
    }
    
    private getCells(entity: Entity): string[] {
        // TODO: Calculate grid cells entity overlaps
        // Return keys like "0,0", "1,0", etc.
    }
}
```

### Hint
```typescript
// Cell key from world position
const cellX = Math.floor(entity.x / cellSize);
const cellY = Math.floor(entity.y / cellSize);
const key = `${cellX},${cellY}`;
```

---

## Exercise 9: Component System ⭐⭐⭐⭐

Build a component-based entity system.

### Requirements
- Entity has array of components
- `addComponent(component)` adds component
- `getComponent<T>(type)` finds component by type
- Each component has `update(dt)`

### Template
```typescript
interface Component {
    update(dt: number): void;
}

class Entity {
    components: Component[] = [];
    
    addComponent(component: Component): void {
        // TODO
    }
    
    getComponent<T extends Component>(type: new (...args: any[]) => T): T | undefined {
        // TODO: Find component of given type
    }
    
    update(dt: number): void {
        // TODO: Update all components
    }
}

// Example components
class PhysicsComponent implements Component {
    velocityX = 0;
    velocityY = 0;
    
    constructor(private entity: Entity) {}
    
    update(dt: number): void {
        this.entity.x += this.velocityX * (dt / 1000);
        this.entity.y += this.velocityY * (dt / 1000);
    }
}

class HealthComponent implements Component {
    health = 100;
    
    constructor(private entity: Entity) {}
    
    takeDamage(amount: number): void {
        this.health -= amount;
        if (this.health <= 0) {
            this.entity.destroy();
        }
    }
    
    update(dt: number): void {}
}
```

---

## Exercise 10: Entity Lifecycle States ⭐⭐⭐

Add lifecycle states to entities.

### Requirements
- States: `Active`, `Dying`, `Dead`
- `startDeath()` begins death animation
- `finishDeath()` marks as dead
- Don't update dead entities

### Template
```typescript
enum EntityState {
    Active = 'active',
    Dying = 'dying',
    Dead = 'dead',
}

class Enemy extends Entity {
    private state = EntityState.Active;
    
    startDeath(): void {
        if (this.state === EntityState.Active) {
            this.state = EntityState.Dying;
            // TODO: Start death animation
        }
    }
    
    protected finishDeath(): void {
        this.state = EntityState.Dead;
    }
    
    update(dt: number): void {
        if (this.state === EntityState.Dying) {
            // TODO: Update death animation
            if (deathAnimFinished) {
                this.finishDeath();
            }
            return;
        }
        
        // Normal update...
    }
}
```

---

## Challenge Exercise 11: Quadtree ⭐⭐⭐⭐⭐

Implement a quadtree for hierarchical spatial partitioning.

### Requirements
- Divide space into 4 quadrants recursively
- Max entities per node before split
- `insert(entity)` adds to tree
- `query(bounds)` returns nearby entities

### Hint Structure
```
        ┌─────────┐
        │    1    │ 2 │
        ├─────────┤
        │ 3  │ 4  │
        └─────────┘
```

---

## Challenge Exercise 12: Entity Tags ⭐⭐⭐

Add tag system for filtering entities.

### Requirements
- Entity can have multiple tags: `['enemy', 'flying']`
- `addTag(tag)` adds tag
- `hasTag(tag)` checks tag
- EntityManager can filter by tag

### Usage
```typescript
const enemy = new Enemy(100, 200);
enemy.addTag('enemy');
enemy.addTag('flying');

// Get all flying enemies
const flying = entityManager.getByTag('flying');
```

---

## Solutions

Complete solutions available in **`c-solutions.md`**!

Entity management is crucial for performance with many game objects.

---

## Testing Checklist

- [ ] Base Entity class works
- [ ] Concrete entities (Coin, Enemy) work
- [ ] EntityManager adds/removes entities
- [ ] Deferred add/remove prevents crashes
- [ ] Object pool reuses objects
- [ ] Factory creates from data
- [ ] Offscreen culling improves performance
- [ ] Spatial grid speeds up collisions
- [ ] Component system is flexible
- [ ] Lifecycle states work correctly

**Next:** Check your work in `c-solutions.md`!
