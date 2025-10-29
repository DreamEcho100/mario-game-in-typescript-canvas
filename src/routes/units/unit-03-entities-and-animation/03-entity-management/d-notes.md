# Entity Management - Quick Notes

**Unit 03: Entities, Animations & Sprites | Topic 03 of 03**

> Quick reference for entity systems

---

## Base Entity Pattern

```typescript
abstract class Entity {
    x: number;
    y: number;
    width: number;
    height: number;
    private alive = true;
    
    abstract update(dt: number): void;
    abstract draw(ctx: CanvasRenderingContext2D, camera: Camera): void;
    
    isAlive(): boolean { return this.alive; }
    destroy(): void { this.alive = false; }
}
```

---

## Entity Manager

```typescript
class EntityManager {
    private entities: Entity[] = [];
    private entitiesToAdd: Entity[] = [];
    private entitiesToRemove: Entity[] = [];
    
    add(entity: Entity): void {
        this.entitiesToAdd.push(entity);
    }
    
    remove(entity: Entity): void {
        this.entitiesToRemove.push(entity);
    }
    
    update(dt: number): void {
        this.processPending();
        this.entities.forEach(e => {
            e.update(dt);
            if (!e.isAlive()) this.remove(e);
        });
    }
    
    draw(ctx: CanvasRenderingContext2D, camera: Camera): void {
        this.entities.forEach(e => e.draw(ctx, camera));
    }
    
    private processPending(): void {
        if (this.entitiesToAdd.length > 0) {
            this.entities.push(...this.entitiesToAdd);
            this.entitiesToAdd = [];
        }
        if (this.entitiesToRemove.length > 0) {
            this.entities = this.entities.filter(
                e => !this.entitiesToRemove.includes(e)
            );
            this.entitiesToRemove = [];
        }
    }
}
```

---

## Object Pool

```typescript
class ObjectPool<T> {
    private pool: T[] = [];
    
    constructor(
        private factory: () => T,
        private reset: (obj: T) => void,
        initialSize = 10
    ) {
        for (let i = 0; i < initialSize; i++) {
            this.pool.push(factory());
        }
    }
    
    acquire(): T {
        return this.pool.pop() || this.factory();
    }
    
    release(obj: T): void {
        this.reset(obj);
        this.pool.push(obj);
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

## Entity Factory

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
        this.creators.set(type, creator);
    }
    
    create(data: EntityData): Entity {
        const creator = this.creators.get(data.type);
        if (!creator) throw new Error(`Unknown type: ${data.type}`);
        return creator(data);
    }
}
```

---

## Offscreen Culling

```typescript
function isOnScreen(entity: Entity, camera: Camera): boolean {
    return (
        entity.x + entity.width >= camera.x &&
        entity.x <= camera.x + camera.width &&
        entity.y + entity.height >= camera.y &&
        entity.y <= camera.y + camera.height
    );
}

// Only draw visible entities
entities.forEach(e => {
    if (isOnScreen(e, camera)) {
        e.draw(ctx, camera);
    }
});
```

---

## Spatial Grid

```typescript
class SpatialGrid {
    private cellSize = 64;
    private grid = new Map<string, Entity[]>();
    
    clear(): void {
        this.grid.clear();
    }
    
    insert(entity: Entity): void {
        this.getCells(entity).forEach(key => {
            if (!this.grid.has(key)) this.grid.set(key, []);
            this.grid.get(key)!.push(entity);
        });
    }
    
    getNearby(entity: Entity): Entity[] {
        const nearby = new Set<Entity>();
        this.getCells(entity).forEach(key => {
            this.grid.get(key)?.forEach(e => {
                if (e !== entity) nearby.add(e);
            });
        });
        return Array.from(nearby);
    }
    
    private getCells(entity: Entity): string[] {
        const minX = Math.floor(entity.x / this.cellSize);
        const maxX = Math.floor((entity.x + entity.width) / this.cellSize);
        const minY = Math.floor(entity.y / this.cellSize);
        const maxY = Math.floor((entity.y + entity.height) / this.cellSize);
        
        const cells: string[] = [];
        for (let x = minX; x <= maxX; x++) {
            for (let y = minY; y <= maxY; y++) {
                cells.push(`${x},${y}`);
            }
        }
        return cells;
    }
}
```

---

## Component System

```typescript
interface Component {
    update(dt: number): void;
}

class Entity {
    components: Component[] = [];
    
    addComponent(component: Component): void {
        this.components.push(component);
    }
    
    getComponent<T extends Component>(type: new (...args: any[]) => T): T | undefined {
        return this.components.find(c => c instanceof type) as T;
    }
    
    update(dt: number): void {
        this.components.forEach(c => c.update(dt));
    }
}

// Example component
class PhysicsComponent implements Component {
    velocityX = 0;
    velocityY = 0;
    
    constructor(private entity: Entity) {}
    
    update(dt: number): void {
        this.entity.x += this.velocityX * (dt / 1000);
        this.entity.y += this.velocityY * (dt / 1000);
    }
}
```

---

## Entity Lifecycle States

```typescript
enum EntityState {
    Active = 'active',
    Dying = 'dying',
    Dead = 'dead',
}

class Entity {
    protected state = EntityState.Active;
    
    isAlive(): boolean {
        return this.state !== EntityState.Dead;
    }
    
    startDeath(): void {
        if (this.state === EntityState.Active) {
            this.state = EntityState.Dying;
            this.onDeath();
        }
    }
    
    protected onDeath(): void {
        // Override in subclass
    }
    
    protected finishDeath(): void {
        this.state = EntityState.Dead;
    }
}
```

---

## Get Entities by Type

```typescript
class EntityManager {
    getByType<T extends Entity>(type: new (...args: any[]) => T): T[] {
        return this.entities.filter(e => e instanceof type) as T[];
    }
}

// Usage
const enemies = entityManager.getByType(Enemy);
const coins = entityManager.getByType(Coin);
```

---

## Deferred Add/Remove Pattern

```typescript
// ❌ BAD: Modify during iteration
for (const entity of entities) {
    entities.push(new Entity()); // Crash!
}

// ✅ GOOD: Defer modifications
for (const entity of entities) {
    entitiesToAdd.push(new Entity()); // Safe
}
entities.push(...entitiesToAdd);
```

---

## Performance Patterns

### Object Pooling
```typescript
// ❌ BAD: Create/destroy frequently
bullets.push(new Bullet(x, y));

// ✅ GOOD: Reuse from pool
const bullet = bulletPool.acquire();
bullet.reset(x, y);
```

### Spatial Partitioning
```typescript
// ❌ BAD: O(n²) collision checks
for (const a of entities) {
    for (const b of entities) {
        if (a.intersects(b)) { /* ... */ }
    }
}

// ✅ GOOD: O(n) with spatial grid
spatialGrid.clear();
entities.forEach(e => spatialGrid.insert(e));
entities.forEach(e => {
    spatialGrid.getNearby(e).forEach(other => {
        if (e.intersects(other)) { /* ... */ }
    });
});
```

---

## Common Entity Types

```typescript
// Player
class Player extends Entity {
    velocityX = 0;
    velocityY = 0;
    onGround = false;
}

// Enemy
class Enemy extends Entity {
    health = 10;
    damage = 5;
    patrolSpeed = 50;
}

// Collectible
class Coin extends Entity {
    value = 100;
    collected = false;
}

// Platform
class Platform extends Entity {
    solid = true;
}
```

---

## Collision Detection

```typescript
// AABB collision
function intersects(a: Entity, b: Entity): boolean {
    return (
        a.x < b.x + b.width &&
        a.x + a.width > b.x &&
        a.y < b.y + b.height &&
        a.y + a.height > b.y
    );
}

// Check collision
if (player.intersects(enemy)) {
    handleCollision(player, enemy);
}
```

---

## Typical Entity Counts

| Game Type | Entity Count |
|-----------|--------------|
| Platformer | 50-200 |
| Bullet Hell | 500-2000 |
| Strategy | 100-500 |
| Open World | 1000+ (with culling) |

**Tip:** Use object pooling for 500+ entities

---

## Quick Checklist

- [ ] Use base Entity class for common interface
- [ ] EntityManager handles add/remove/update/draw
- [ ] Defer add/remove during iteration
- [ ] Pool frequently created entities (bullets, particles)
- [ ] Cull offscreen entities when drawing
- [ ] Use spatial grid for collision detection
- [ ] Components for flexible behavior
- [ ] Lifecycle states (active, dying, dead)

---

**Next:** Debugging in `i-debugging.md`!
