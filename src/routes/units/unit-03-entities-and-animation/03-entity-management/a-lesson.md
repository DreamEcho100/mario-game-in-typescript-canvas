# Entity Management

**Unit 03: Entities, Animations & Sprites | Topic 03 of 03**

> **Learning Objective:** Build scalable systems to manage hundreds of game entities with optimal performance.

---

## Building on Previous Topics

### From Topic 01: Sprite Rendering
```typescript
// Topic 01: Drew one sprite
mario.draw(ctx, camera);
```

### From Topic 02: Animation Systems
```typescript
// Topic 02: Animated one character
mario.update(dt);
mario.draw(ctx, camera);
```

### Topic 03 (NOW): Managing Many Entities
```typescript
// Topic 03: Manage hundreds of entities!
entities.forEach(entity => {
    entity.update(dt);
    entity.draw(ctx, camera);
});

// Add/remove dynamically
entities.add(new Coin(x, y));
entities.remove(deadEnemy);
```

**The challenge:** Keep performance high with many objects!

---

## Table of Contents

1. [What is an Entity?](#what-is-an-entity)
2. [Entity Lifecycle](#entity-lifecycle)
3. [Entity Manager](#entity-manager)
4. [Object Pooling](#object-pooling)
5. [Factory Pattern](#factory-pattern)
6. [Spatial Partitioning](#spatial-partitioning)
7. [Component System](#component-system)
8. [Mario Implementation](#mario-implementation)

---

## What is an Entity?

**Entity** = Any game object that exists in the world.

### Examples
- **Player:** Mario, Luigi
- **Enemies:** Goomba, Koopa
- **Items:** Coins, power-ups
- **Environment:** Moving platforms, pipes
- **Effects:** Particle explosions, score popups

### Common Interface

```typescript
interface Entity {
    x: number;
    y: number;
    width: number;
    height: number;
    
    update(dt: number): void;
    draw(ctx: CanvasRenderingContext2D, camera: Camera): void;
    
    // Lifecycle
    isAlive(): boolean;
    destroy(): void;
}
```

### Base Entity Class

```typescript
abstract class Entity {
    x: number;
    y: number;
    width: number;
    height: number;
    
    private alive = true;
    
    constructor(x: number, y: number, width: number, height: number) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }
    
    abstract update(dt: number): void;
    abstract draw(ctx: CanvasRenderingContext2D, camera: Camera): void;
    
    isAlive(): boolean {
        return this.alive;
    }
    
    destroy(): void {
        this.alive = false;
    }
    
    // Collision helpers
    getBounds(): Rectangle {
        return {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height,
        };
    }
    
    intersects(other: Entity): boolean {
        return rectanglesIntersect(this.getBounds(), other.getBounds());
    }
}
```

---

## Entity Lifecycle

### Lifecycle Phases

```
1. SPAWN      → Entity created
2. INIT       → Setup animations, physics
3. ACTIVE     → Update/draw every frame
4. DYING      → Death animation playing
5. DEAD       → Marked for removal
6. REMOVED    → Cleaned up from memory
```

### Lifecycle Management

```typescript
enum EntityState {
    Active = 'active',
    Dying = 'dying',
    Dead = 'dead',
}

abstract class Entity {
    protected state = EntityState.Active;
    
    isAlive(): boolean {
        return this.state !== EntityState.Dead;
    }
    
    startDeath(): void {
        if (this.state === EntityState.Active) {
            this.state = EntityState.Dying;
            this.onDeath(); // Play death animation
        }
    }
    
    protected onDeath(): void {
        // Override in subclass
    }
    
    protected finishDeath(): void {
        this.state = EntityState.Dead;
    }
}

class Enemy extends Entity {
    protected onDeath(): void {
        // Play death animation
        this.animation.setState('death');
    }
    
    update(dt: number): void {
        if (this.state === EntityState.Dying) {
            this.animation.update(dt);
            if (this.animation.isFinished()) {
                this.finishDeath();
            }
            return;
        }
        
        // Normal update logic...
    }
}
```

---

## Entity Manager

### Managing Multiple Entities

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
        // Process additions/removals
        this.processPending();
        
        // Update all entities
        for (const entity of this.entities) {
            entity.update(dt);
            
            // Auto-remove dead entities
            if (!entity.isAlive()) {
                this.remove(entity);
            }
        }
    }
    
    draw(ctx: CanvasRenderingContext2D, camera: Camera): void {
        for (const entity of this.entities) {
            if (this.isOnScreen(entity, camera)) {
                entity.draw(ctx, camera);
            }
        }
    }
    
    private processPending(): void {
        // Add new entities
        if (this.entitiesToAdd.length > 0) {
            this.entities.push(...this.entitiesToAdd);
            this.entitiesToAdd = [];
        }
        
        // Remove dead entities
        if (this.entitiesToRemove.length > 0) {
            this.entities = this.entities.filter(
                e => !this.entitiesToRemove.includes(e)
            );
            this.entitiesToRemove = [];
        }
    }
    
    private isOnScreen(entity: Entity, camera: Camera): boolean {
        return (
            entity.x + entity.width >= camera.x &&
            entity.x <= camera.x + camera.width &&
            entity.y + entity.height >= camera.y &&
            entity.y <= camera.y + camera.height
        );
    }
    
    getAll(): Entity[] {
        return this.entities;
    }
    
    getByType<T extends Entity>(type: new (...args: any[]) => T): T[] {
        return this.entities.filter(e => e instanceof type) as T[];
    }
    
    clear(): void {
        this.entities = [];
        this.entitiesToAdd = [];
        this.entitiesToRemove = [];
    }
}
```

### Why Defer Add/Remove?

**❌ Bad: Modify array during iteration**
```typescript
for (const entity of entities) {
    if (entity.shouldSpawnChild) {
        entities.push(new Child()); // Modifies array!
    }
}
```

**✅ Good: Defer modifications**
```typescript
for (const entity of entities) {
    if (entity.shouldSpawnChild) {
        entitiesToAdd.push(new Child()); // Safe!
    }
}
// Process after loop
entities.push(...entitiesToAdd);
```

---

## Object Pooling

### Why Pool Objects?

Creating/destroying objects is expensive. **Reuse them!**

```typescript
// ❌ BAD: Creates new object every shot
function shoot(): void {
    const bullet = new Bullet(x, y); // GC pressure!
    entities.add(bullet);
}

// ✅ GOOD: Reuse from pool
function shoot(): void {
    const bullet = bulletPool.acquire(); // Reuse existing!
    bullet.reset(x, y);
    entities.add(bullet);
}
```

### Object Pool Implementation

```typescript
class ObjectPool<T> {
    private pool: T[] = [];
    private factory: () => T;
    private reset: (obj: T) => void;
    
    constructor(factory: () => T, reset: (obj: T) => void, initialSize = 10) {
        this.factory = factory;
        this.reset = reset;
        
        // Pre-allocate objects
        for (let i = 0; i < initialSize; i++) {
            this.pool.push(factory());
        }
    }
    
    acquire(): T {
        if (this.pool.length > 0) {
            return this.pool.pop()!;
        } else {
            // Pool empty, create new
            console.warn('Pool exhausted, creating new object');
            return this.factory();
        }
    }
    
    release(obj: T): void {
        this.reset(obj);
        this.pool.push(obj);
    }
    
    size(): number {
        return this.pool.length;
    }
}

// Usage
class Bullet extends Entity {
    velocityX = 0;
    velocityY = 0;
    
    reset(x: number, y: number, vx: number, vy: number): void {
        this.x = x;
        this.y = y;
        this.velocityX = vx;
        this.velocityY = vy;
        this.state = EntityState.Active;
    }
}

const bulletPool = new ObjectPool<Bullet>(
    () => new Bullet(0, 0, 0, 0),
    (bullet) => bullet.reset(0, 0, 0, 0),
    50 // Pre-create 50 bullets
);

// Shoot
function shoot(): void {
    const bullet = bulletPool.acquire();
    bullet.reset(player.x, player.y, 400, 0);
    entities.add(bullet);
}

// When bullet dies
function onBulletDeath(bullet: Bullet): void {
    entities.remove(bullet);
    bulletPool.release(bullet); // Return to pool
}
```

---

## Factory Pattern

### Creating Entities from Data

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
        if (!creator) {
            throw new Error(`Unknown entity type: ${data.type}`);
        }
        return creator(data);
    }
}

// Setup factory
const factory = new EntityFactory();

factory.register('goomba', (data) => new Goomba(data.x, data.y));
factory.register('coin', (data) => new Coin(data.x, data.y));
factory.register('pipe', (data) => new Pipe(data.x, data.y, data.properties?.height ?? 64));

// Load level from data
const levelData: EntityData[] = [
    { type: 'goomba', x: 100, y: 400 },
    { type: 'coin', x: 200, y: 300 },
    { type: 'pipe', x: 300, y: 384, properties: { height: 96 } },
];

levelData.forEach(data => {
    const entity = factory.create(data);
    entities.add(entity);
});
```

---

## Spatial Partitioning

### Problem: Checking Every Entity is Slow

```typescript
// ❌ BAD: O(n²) collision checks
for (const a of entities) {
    for (const b of entities) {
        if (a !== b && a.intersects(b)) {
            handleCollision(a, b);
        }
    }
}
// 100 entities = 10,000 checks!
```

### Solution: Grid-Based Spatial Hash

```typescript
class SpatialGrid {
    private cellSize: number;
    private grid = new Map<string, Entity[]>();
    
    constructor(cellSize = 64) {
        this.cellSize = cellSize;
    }
    
    clear(): void {
        this.grid.clear();
    }
    
    insert(entity: Entity): void {
        const cells = this.getCells(entity);
        cells.forEach(key => {
            if (!this.grid.has(key)) {
                this.grid.set(key, []);
            }
            this.grid.get(key)!.push(entity);
        });
    }
    
    getNearby(entity: Entity): Entity[] {
        const cells = this.getCells(entity);
        const nearby = new Set<Entity>();
        
        cells.forEach(key => {
            const cellEntities = this.grid.get(key);
            if (cellEntities) {
                cellEntities.forEach(e => nearby.add(e));
            }
        });
        
        nearby.delete(entity); // Remove self
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

// Usage
const spatialGrid = new SpatialGrid(64);

function update(dt: number): void {
    // Rebuild grid each frame
    spatialGrid.clear();
    entities.forEach(e => spatialGrid.insert(e));
    
    // Check only nearby entities
    entities.forEach(entity => {
        const nearby = spatialGrid.getNearby(entity);
        nearby.forEach(other => {
            if (entity.intersects(other)) {
                handleCollision(entity, other);
            }
        });
    });
}
```

---

## Component System

### Composition Over Inheritance

```typescript
// ❌ BAD: Deep inheritance
class Entity { }
class MovableEntity extends Entity { }
class AnimatedMovableEntity extends MovableEntity { }
class DamageableAnimatedMovableEntity extends AnimatedMovableEntity { }

// ✅ GOOD: Components
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

// Components
class PhysicsComponent implements Component {
    velocityX = 0;
    velocityY = 0;
    
    constructor(private entity: Entity) {}
    
    update(dt: number): void {
        this.entity.x += this.velocityX * (dt / 1000);
        this.entity.y += this.velocityY * (dt / 1000);
    }
}

class AnimationComponent implements Component {
    animation: AnimationStateMachine;
    
    constructor(private entity: Entity, animation: AnimationStateMachine) {
        this.animation = animation;
    }
    
    update(dt: number): void {
        this.animation.update(dt);
    }
    
    draw(ctx: CanvasRenderingContext2D, camera: Camera): void {
        this.animation.draw(ctx, this.entity.x - camera.x, this.entity.y - camera.y, 32, 48);
    }
}

class HealthComponent implements Component {
    health = 100;
    maxHealth = 100;
    
    constructor(private entity: Entity) {}
    
    takeDamage(amount: number): void {
        this.health -= amount;
        if (this.health <= 0) {
            this.entity.destroy();
        }
    }
    
    update(dt: number): void {
        // Health regen, etc.
    }
}

// Usage
const enemy = new Entity(100, 400, 32, 32);
enemy.addComponent(new PhysicsComponent(enemy));
enemy.addComponent(new AnimationComponent(enemy, enemyAnim));
enemy.addComponent(new HealthComponent(enemy));

// Later
const health = enemy.getComponent(HealthComponent);
health?.takeDamage(10);
```

---

## Mario Implementation

### Complete Entity System

```typescript
class Game {
    private entityManager = new EntityManager();
    private spatialGrid = new SpatialGrid(64);
    private entityFactory = new EntityFactory();
    
    // Object pools
    private coinPool = new ObjectPool<Coin>(
        () => new Coin(0, 0),
        (coin) => coin.reset(0, 0),
        20
    );
    
    constructor() {
        this.setupFactory();
    }
    
    private setupFactory(): void {
        this.entityFactory.register('mario', (data) => new Mario(data.x, data.y));
        this.entityFactory.register('goomba', (data) => new Goomba(data.x, data.y));
        this.entityFactory.register('koopa', (data) => new Koopa(data.x, data.y));
        this.entityFactory.register('coin', (data) => {
            const coin = this.coinPool.acquire();
            coin.reset(data.x, data.y);
            return coin;
        });
    }
    
    loadLevel(levelData: EntityData[]): void {
        this.entityManager.clear();
        
        levelData.forEach(data => {
            const entity = this.entityFactory.create(data);
            this.entityManager.add(entity);
        });
    }
    
    update(dt: number): void {
        // Update all entities
        this.entityManager.update(dt);
        
        // Rebuild spatial grid
        this.spatialGrid.clear();
        this.entityManager.getAll().forEach(e => this.spatialGrid.insert(e));
        
        // Check collisions
        this.checkCollisions();
    }
    
    private checkCollisions(): void {
        const player = this.entityManager.getByType(Mario)[0];
        if (!player) return;
        
        const nearby = this.spatialGrid.getNearby(player);
        nearby.forEach(entity => {
            if (player.intersects(entity)) {
                this.handleCollision(player, entity);
            }
        });
    }
    
    private handleCollision(player: Mario, entity: Entity): void {
        if (entity instanceof Enemy) {
            if (player.velocityY > 0) {
                // Player jumped on enemy
                entity.startDeath();
                player.bounce();
            } else {
                // Player hit enemy
                player.takeDamage();
            }
        } else if (entity instanceof Coin) {
            entity.destroy();
            this.coinPool.release(entity as Coin);
            this.addScore(100);
        }
    }
    
    draw(ctx: CanvasRenderingContext2D, camera: Camera): void {
        this.entityManager.draw(ctx, camera);
    }
}
```

---

## Summary

### What You've Learned

✅ **Entity Pattern** - Common interface for all game objects
✅ **Entity Lifecycle** - Spawn, active, dying, dead states
✅ **Entity Manager** - Centralized update/draw system
✅ **Object Pooling** - Reuse objects for performance
✅ **Factory Pattern** - Create entities from data
✅ **Spatial Partitioning** - Fast collision detection
✅ **Component System** - Flexible entity composition

### Key Takeaways

1. **Defer adds/removes** - Don't modify array during iteration
2. **Pool frequently created objects** (bullets, particles)
3. **Cull offscreen entities** - Only update/draw visible ones
4. **Use spatial grids** for collision detection (O(n) instead of O(n²))
5. **Components > Inheritance** for flexibility

---

## Looking Ahead to Unit 04

You can now manage hundreds of entities! **Next: Advanced techniques:**

```typescript
// Unit 03 (NOW): Basic entity management
entities.forEach(e => e.update(dt));

// Unit 04 (NEXT): Advanced systems
- Quadtrees for complex levels
- Event system for communication
- State machines for AI
- Behavior trees
```

**Preview:** Quadtrees, event buses, AI systems

**Next:** Complete exercises in `b-exercises.md`!
