# Entity Management - FAQ

**Unit 03: Entities, Animations & Sprites | Topic 03 of 03**

> Answers to common entity management questions

---

## Q1: Should I use classes or composition for entities?

**Both have merit, but composition is more flexible for larger games.**

**Classes (Inheritance):**
```typescript
// Simple, good for small games
class Entity { }
class Enemy extends Entity { }
class FlyingEnemy extends Enemy { }
```

**Pros:**
- Easy to understand
- Good for small games
- TypeScript type safety

**Cons:**
- Rigid hierarchy
- Hard to share behavior (flying, swimming)
- Diamond problem

**Composition (Components):**
```typescript
// Flexible, good for complex games
class Entity {
    components: Component[] = [];
    addComponent(c: Component): void { }
}

const enemy = new Entity();
enemy.addComponent(new PhysicsComponent());
enemy.addComponent(new AIComponent());
enemy.addComponent(new HealthComponent());
```

**Pros:**
- Mix and match behaviors
- Easy to add new features
- Reusable components

**Cons:**
- More complex setup
- Slightly slower (iteration overhead)

**Recommendation:** 
- Small game (< 10 entity types): Use classes
- Large game (10+ types): Use components

---

## Q2: When should I use object pooling?

**Pool entities that are frequently created/destroyed.**

**Good candidates:**
- ✅ **Bullets** - Created constantly
- ✅ **Particles** - Hundreds per second
- ✅ **Projectiles** - Frequent spawning
- ✅ **Temporary effects** - Short-lived

**Bad candidates:**
- ❌ **Player** - Created once
- ❌ **Level geometry** - Static
- ❌ **Bosses** - Rare

**Rule of thumb:** Pool if creating 10+ per second.

---

## Q3: How do I handle entity-to-entity communication?

**Three approaches:**

### 1. Direct Reference
```typescript
class Player extends Entity {
    nearbyEnemies: Enemy[] = [];
    
    update(dt: number): void {
        this.nearbyEnemies.forEach(enemy => {
            if (this.intersects(enemy)) {
                enemy.takeDamage(10);
            }
        });
    }
}
```

**Pros:** Simple, fast
**Cons:** Tight coupling

### 2. Event System
```typescript
class EventBus {
    private listeners = new Map<string, Function[]>();
    
    emit(event: string, data: any): void {
        this.listeners.get(event)?.forEach(fn => fn(data));
    }
    
    on(event: string, callback: Function): void {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event)!.push(callback);
    }
}

// Usage
eventBus.emit('player:hit', { player, damage: 10 });
eventBus.on('player:hit', (data) => {
    console.log('Player took damage!');
});
```

**Pros:** Decoupled, flexible
**Cons:** Harder to debug

### 3. Manager Mediates
```typescript
class CollisionManager {
    checkCollisions(entities: Entity[]): void {
        // Manager handles all entity interactions
        const player = entities.find(e => e instanceof Player);
        const enemies = entities.filter(e => e instanceof Enemy);
        
        enemies.forEach(enemy => {
            if (player.intersects(enemy)) {
                this.handlePlayerEnemyCollision(player, enemy);
            }
        });
    }
}
```

**Pros:** Central logic, easy to modify
**Cons:** Manager can become large

**Recommendation:** Use manager for collisions, events for game-wide notifications.

---

## Q4: How many entities can I have before performance drops?

**Depends on what entities do:**

**Simple entities (just position):** 10,000+
**Animated entities:** 500-1,000
**Physics entities:** 100-500
**AI entities:** 50-200

**Optimization techniques:**
- **Culling:** Only update/draw visible entities (2-5x speedup)
- **Spatial grid:** Fast collision detection (10x+ speedup)
- **Object pooling:** Reduce GC pressure (2x speedup)
- **Level of detail:** Simplify distant entities

**Test your specific game!** Use browser performance tools:
```typescript
console.time('Entity update');
entityManager.update(dt);
console.timeEnd('Entity update');
// Should be < 5ms at 60 FPS
```

---

## Q5: Should entities update themselves or use a system?

**Both patterns work:**

### Entity Updates Itself
```typescript
class Enemy extends Entity {
    update(dt: number): void {
        this.applyGravity(dt);
        this.checkCollisions();
        this.updateAI(dt);
        this.updateAnimation(dt);
    }
}
```

**Pros:** Self-contained, easy to understand
**Cons:** Hard to optimize (each entity does own collision)

### System Updates Entities
```typescript
class PhysicsSystem {
    update(entities: Entity[], dt: number): void {
        // Update all physics at once
        entities.forEach(e => {
            e.velocityY += GRAVITY * dt;
            e.y += e.velocityY * dt;
        });
    }
}
```

**Pros:** Can optimize batch operations, cache-friendly
**Cons:** More complex architecture

**Recommendation:** Entity self-update for small games, systems for 500+ entities.

---

## Q6: How do I save/load entity state?

**Serialize to JSON:**

```typescript
class Entity {
    toJSON(): any {
        return {
            type: this.constructor.name,
            x: this.x,
            y: this.y,
            // Add other state...
        };
    }
    
    static fromJSON(data: any): Entity {
        const entity = new this(data.x, data.y);
        // Restore state...
        return entity;
    }
}

// Save
const saveData = entityManager.getAll().map(e => e.toJSON());
localStorage.setItem('entities', JSON.stringify(saveData));

// Load
const saveData = JSON.parse(localStorage.getItem('entities')!);
saveData.forEach(data => {
    const entity = factory.create(data);
    entityManager.add(entity);
});
```

---

## Q7: What's the difference between destroy() and remove()?

**Two-step process:**

```typescript
// Step 1: Mark as dead (entity decides)
entity.destroy();
entity.isAlive(); // false

// Step 2: Remove from manager (manager decides)
entityManager.remove(entity);
```

**Why separate?**
- Entity can play death animation before removal
- Entity can notify others of death
- Manager can clean up resources

```typescript
class Enemy extends Entity {
    destroy(): void {
        super.destroy();
        this.playDeathAnimation();
        eventBus.emit('enemy:died', this);
        dropLoot(this.x, this.y);
    }
}

// Manager auto-removes after death animation
class EntityManager {
    update(dt: number): void {
        this.entities.forEach(e => {
            e.update(dt);
            if (!e.isAlive() && e.deathAnimFinished()) {
                this.remove(e);
            }
        });
    }
}
```

---

## Q8: How do I handle entity dependencies?

**Example:** Projectile needs to know who shot it.

```typescript
class Projectile extends Entity {
    owner: Entity;
    
    constructor(x: number, y: number, owner: Entity) {
        super(x, y, 8, 8);
        this.owner = owner;
    }
    
    onHit(target: Entity): void {
        if (target === this.owner) return; // Don't hit self
        target.takeDamage(this.damage);
    }
}

// Usage
const bullet = new Projectile(player.x, player.y, player);
```

**Be careful with references!**
- Owner entity might be destroyed
- Check `if (this.owner && this.owner.isAlive())`

---

## Q9: Should I use a single EntityManager or multiple?

**Multiple managers for different layers:**

```typescript
class Game {
    backgroundManager = new EntityManager(); // Clouds, parallax
    terrainManager = new EntityManager();    // Platforms, walls
    entityManager = new EntityManager();      // Players, enemies
    effectManager = new EntityManager();      // Particles, explosions
    uiManager = new EntityManager();          // Health bars, text
    
    update(dt: number): void {
        this.backgroundManager.update(dt);
        this.terrainManager.update(dt);
        this.entityManager.update(dt);
        this.effectManager.update(dt);
    }
    
    draw(ctx: CanvasRenderingContext2D, camera: Camera): void {
        this.backgroundManager.draw(ctx, camera);
        this.terrainManager.draw(ctx, camera);
        this.entityManager.draw(ctx, camera);
        this.effectManager.draw(ctx, camera);
        this.uiManager.draw(ctx, camera); // No camera offset
    }
}
```

**Benefits:**
- Control draw order (layers)
- Different update rates (background slower)
- Separate collision detection (player vs terrain, player vs entities)

---

## Q10: How do I debug entity count growing?

**Add entity tracking:**

```typescript
class EntityManager {
    private entityCounts = new Map<string, number>();
    
    add(entity: Entity): void {
        this.entitiesToAdd.push(entity);
        
        // Track by type
        const type = entity.constructor.name;
        this.entityCounts.set(type, (this.entityCounts.get(type) || 0) + 1);
    }
    
    remove(entity: Entity): void {
        this.entitiesToRemove.push(entity);
        
        const type = entity.constructor.name;
        this.entityCounts.set(type, (this.entityCounts.get(type) || 0) - 1);
    }
    
    printStats(): void {
        console.log('Entity counts:');
        this.entityCounts.forEach((count, type) => {
            console.log(`  ${type}: ${count}`);
        });
    }
}

// Call every few seconds
setInterval(() => entityManager.printStats(), 5000);
```

**Look for counts that keep growing!**

---

## Q11: Can I search entities by position?

**Yes! Use spatial queries:**

```typescript
class EntityManager {
    getInRadius(x: number, y: number, radius: number): Entity[] {
        return this.entities.filter(e => {
            const dx = e.x - x;
            const dy = e.y - y;
            return Math.sqrt(dx * dx + dy * dy) <= radius;
        });
    }
    
    getInRectangle(x: number, y: number, w: number, h: number): Entity[] {
        return this.entities.filter(e =>
            e.x + e.width >= x &&
            e.x <= x + w &&
            e.y + e.height >= y &&
            e.y <= y + h
        );
    }
}

// Usage: Find all enemies near player
const nearby = entityManager.getInRadius(player.x, player.y, 100);
const enemies = nearby.filter(e => e instanceof Enemy);
```

---

## Q12: How do I handle entity z-ordering (depth)?

**Add z-index property:**

```typescript
class Entity {
    zIndex = 0; // Higher = drawn on top
}

class EntityManager {
    draw(ctx: CanvasRenderingContext2D, camera: Camera): void {
        // Sort by z-index before drawing
        const sorted = [...this.entities].sort((a, b) => a.zIndex - b.zIndex);
        sorted.forEach(e => e.draw(ctx, camera));
    }
}

// Usage
background.zIndex = 0;
player.zIndex = 10;
tree.zIndex = 20; // Tree in front of player
```

**Performance tip:** Only sort when z-index changes, not every frame!

---

## Quick Reference

| Pattern | When to Use |
|---------|-------------|
| **Inheritance** | < 10 entity types |
| **Components** | 10+ types, shared behaviors |
| **Object Pooling** | 10+ creates/sec |
| **Spatial Grid** | 50+ entities with collision |
| **Event System** | Decoupled communication |
| **Multiple Managers** | Different layers/update rates |

---

**Congratulations!** You've completed Unit 03: Entities, Animations & Sprites!

**Next Unit:** Advanced Game Systems (`unit-04/`)
