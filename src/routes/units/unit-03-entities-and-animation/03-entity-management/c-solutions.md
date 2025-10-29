# Entity Management - Solutions

**Unit 03: Entities, Animations & Sprites | Topic 03 of 03**

> Complete, working solutions for key entity management exercises.

---

## Solution 1: Base Entity Class

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
    
    // Helper methods
    getBounds(): Rectangle {
        return {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height,
        };
    }
    
    intersects(other: Entity): boolean {
        return (
            this.x < other.x + other.width &&
            this.x + this.width > other.x &&
            this.y < other.y + other.height &&
            this.y + this.height > other.y
        );
    }
}

interface Rectangle {
    x: number;
    y: number;
    width: number;
    height: number;
}

interface Camera {
    x: number;
    y: number;
    width: number;
    height: number;
}
```

---

## Solution 2: Coin Entity

```typescript
class Coin extends Entity {
    private time = 0;
    private baseY: number;
    private bobHeight = 5;
    private bobSpeed = 3;
    
    constructor(x: number, y: number) {
        super(x, y, 16, 16);
        this.baseY = y;
    }
    
    update(dt: number): void {
        // Animate bobbing
        this.time += dt / 1000;
        this.y = this.baseY + Math.sin(this.time * this.bobSpeed) * this.bobHeight;
    }
    
    draw(ctx: CanvasRenderingContext2D, camera: Camera): void {
        const screenX = this.x - camera.x;
        const screenY = this.y - camera.y;
        
        // Draw coin as yellow circle
        ctx.fillStyle = '#FFD700'; // Gold
        ctx.beginPath();
        ctx.arc(
            screenX + this.width / 2,
            screenY + this.height / 2,
            this.width / 2,
            0,
            Math.PI * 2
        );
        ctx.fill();
        
        // Draw shine
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.beginPath();
        ctx.arc(
            screenX + this.width / 2 - 3,
            screenY + this.height / 2 - 3,
            3,
            0,
            Math.PI * 2
        );
        ctx.fill();
    }
    
    reset(x: number, y: number): void {
        this.x = x;
        this.y = y;
        this.baseY = y;
        this.time = 0;
        this.alive = true;
    }
}
```

---

## Solution 3: Entity Manager

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
        // Process pending additions/removals
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
            entity.draw(ctx, camera);
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
    
    count(): number {
        return this.entities.length;
    }
}

// Usage
const entityManager = new EntityManager();

// Add entities
entityManager.add(new Coin(100, 200));
entityManager.add(new Enemy(300, 400));

// Game loop
function gameLoop(dt: number): void {
    entityManager.update(dt);
    entityManager.draw(ctx, camera);
}
```

---

## Solution 5: Object Pool

```typescript
class ObjectPool<T> {
    private pool: T[] = [];
    private factory: () => T;
    private reset: (obj: T) => void;
    private created = 0;
    
    constructor(factory: () => T, reset: (obj: T) => void, initialSize = 10) {
        this.factory = factory;
        this.reset = reset;
        
        // Pre-allocate objects
        for (let i = 0; i < initialSize; i++) {
            this.pool.push(factory());
            this.created++;
        }
    }
    
    acquire(): T {
        if (this.pool.length > 0) {
            return this.pool.pop()!;
        } else {
            // Pool exhausted, create new
            console.warn('Pool exhausted, creating new object');
            this.created++;
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
    
    totalCreated(): number {
        return this.created;
    }
}

// Bullet class
class Bullet extends Entity {
    velocityX = 0;
    velocityY = 0;
    lifetime = 2000; // 2 seconds
    age = 0;
    
    constructor(x: number, y: number) {
        super(x, y, 4, 4);
    }
    
    reset(x: number, y: number, vx: number, vy: number): void {
        this.x = x;
        this.y = y;
        this.velocityX = vx;
        this.velocityY = vy;
        this.age = 0;
        this.alive = true;
    }
    
    update(dt: number): void {
        this.x += this.velocityX * (dt / 1000);
        this.y += this.velocityY * (dt / 1000);
        
        this.age += dt;
        if (this.age >= this.lifetime) {
            this.destroy();
        }
    }
    
    draw(ctx: CanvasRenderingContext2D, camera: Camera): void {
        const screenX = this.x - camera.x;
        const screenY = this.y - camera.y;
        
        ctx.fillStyle = 'yellow';
        ctx.fillRect(screenX, screenY, this.width, this.height);
    }
}

// Create pool
const bulletPool = new ObjectPool<Bullet>(
    () => new Bullet(0, 0),
    (bullet) => bullet.reset(0, 0, 0, 0),
    50 // Pre-create 50 bullets
);

// Shooting
function shoot(x: number, y: number, vx: number, vy: number): void {
    const bullet = bulletPool.acquire();
    bullet.reset(x, y, vx, vy);
    entityManager.add(bullet);
}

// When bullet dies
function onBulletDeath(bullet: Bullet): void {
    entityManager.remove(bullet);
    bulletPool.release(bullet); // Return to pool
}

// Monitor pool
function drawPoolStats(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = 'white';
    ctx.font = '14px monospace';
    ctx.fillText(`Pool: ${bulletPool.size()} available`, 10, 20);
    ctx.fillText(`Total created: ${bulletPool.totalCreated()}`, 10, 40);
}
```

---

## Solution 6: Entity Factory

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
    
    createMany(dataArray: EntityData[]): Entity[] {
        return dataArray.map(data => this.create(data));
    }
}

// Setup factory
const factory = new EntityFactory();

factory.register('coin', (data) => new Coin(data.x, data.y));
factory.register('enemy', (data) => new Enemy(data.x, data.y));
factory.register('platform', (data) => {
    const width = data.properties?.width ?? 100;
    const height = data.properties?.height ?? 20;
    return new Platform(data.x, data.y, width, height);
});
factory.register('player', (data) => new Player(data.x, data.y));

// Load level
const levelData: EntityData[] = [
    { type: 'player', x: 50, y: 400 },
    { type: 'coin', x: 200, y: 300 },
    { type: 'coin', x: 250, y: 300 },
    { type: 'enemy', x: 400, y: 400 },
    { 
        type: 'platform', 
        x: 100, 
        y: 450, 
        properties: { width: 200, height: 20 } 
    },
];

function loadLevel(data: EntityData[]): void {
    entityManager.clear();
    
    const entities = factory.createMany(data);
    entities.forEach(e => entityManager.add(e));
}

loadLevel(levelData);
```

---

## Solution 7: Offscreen Culling

```typescript
class EntityManager {
    private entities: Entity[] = [];
    
    draw(ctx: CanvasRenderingContext2D, camera: Camera): void {
        let culled = 0;
        let drawn = 0;
        
        for (const entity of this.entities) {
            if (this.isOnScreen(entity, camera)) {
                entity.draw(ctx, camera);
                drawn++;
            } else {
                culled++;
            }
        }
        
        // Debug info
        if (DEBUG) {
            ctx.fillStyle = 'white';
            ctx.font = '14px monospace';
            ctx.fillText(`Drawn: ${drawn} | Culled: ${culled}`, 10, 20);
        }
    }
    
    private isOnScreen(entity: Entity, camera: Camera): boolean {
        // Add margin to load slightly offscreen entities
        const margin = 50;
        
        return (
            entity.x + entity.width >= camera.x - margin &&
            entity.x <= camera.x + camera.width + margin &&
            entity.y + entity.height >= camera.y - margin &&
            entity.y <= camera.y + camera.height + margin
        );
    }
}
```

---

## Solution 8: Spatial Grid

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
                cellEntities.forEach(e => {
                    if (e !== entity) {
                        nearby.add(e);
                    }
                });
            }
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
    
    // Debug visualization
    drawDebug(ctx: CanvasRenderingContext2D, camera: Camera): void {
        ctx.strokeStyle = 'rgba(255, 0, 0, 0.3)';
        ctx.lineWidth = 1;
        
        // Draw grid lines
        const startX = Math.floor(camera.x / this.cellSize) * this.cellSize;
        const startY = Math.floor(camera.y / this.cellSize) * this.cellSize;
        
        for (let x = startX; x < camera.x + camera.width; x += this.cellSize) {
            ctx.beginPath();
            ctx.moveTo(x - camera.x, 0);
            ctx.lineTo(x - camera.x, camera.height);
            ctx.stroke();
        }
        
        for (let y = startY; y < camera.y + camera.height; y += this.cellSize) {
            ctx.beginPath();
            ctx.moveTo(0, y - camera.y);
            ctx.lineTo(camera.width, y - camera.y);
            ctx.stroke();
        }
    }
}

// Usage
const spatialGrid = new SpatialGrid(64);

function update(dt: number): void {
    // Rebuild grid each frame
    spatialGrid.clear();
    entityManager.getAll().forEach(e => spatialGrid.insert(e));
    
    // Check collisions using spatial grid
    const player = entityManager.getByType(Player)[0];
    if (player) {
        const nearby = spatialGrid.getNearby(player);
        nearby.forEach(entity => {
            if (player.intersects(entity)) {
                handleCollision(player, entity);
            }
        });
    }
}

// Performance comparison
console.log('Without spatial grid: O(n²) =', entities.length ** 2, 'checks');
console.log('With spatial grid: O(n) ≈', entities.length * 9, 'checks');
// Example: 100 entities
// Without: 10,000 checks
// With: ~900 checks (11x faster!)
```

---

## Solution 9: Component System

```typescript
interface Component {
    update(dt: number): void;
}

class Entity {
    x = 0;
    y = 0;
    width = 32;
    height = 32;
    
    components: Component[] = [];
    
    addComponent(component: Component): void {
        this.components.push(component);
    }
    
    getComponent<T extends Component>(type: new (...args: any[]) => T): T | undefined {
        return this.components.find(c => c instanceof type) as T | undefined;
    }
    
    removeComponent<T extends Component>(type: new (...args: any[]) => T): void {
        this.components = this.components.filter(c => !(c instanceof type));
    }
    
    update(dt: number): void {
        this.components.forEach(c => c.update(dt));
    }
}

// Physics Component
class PhysicsComponent implements Component {
    velocityX = 0;
    velocityY = 0;
    gravity = 800;
    
    constructor(private entity: Entity) {}
    
    update(dt: number): void {
        const seconds = dt / 1000;
        
        this.velocityY += this.gravity * seconds;
        this.entity.x += this.velocityX * seconds;
        this.entity.y += this.velocityY * seconds;
    }
}

// Health Component
class HealthComponent implements Component {
    health: number;
    maxHealth: number;
    
    constructor(private entity: Entity, maxHealth = 100) {
        this.maxHealth = maxHealth;
        this.health = maxHealth;
    }
    
    takeDamage(amount: number): void {
        this.health -= amount;
        if (this.health <= 0) {
            this.health = 0;
            this.entity.destroy();
        }
    }
    
    heal(amount: number): void {
        this.health = Math.min(this.health + amount, this.maxHealth);
    }
    
    update(dt: number): void {
        // Could add health regen here
    }
}

// Animation Component
class AnimationComponent implements Component {
    animation: AnimationStateMachine;
    
    constructor(private entity: Entity, animation: AnimationStateMachine) {
        this.animation = animation;
    }
    
    update(dt: number): void {
        this.animation.update(dt);
    }
    
    draw(ctx: CanvasRenderingContext2D, camera: Camera): void {
        const screenX = this.entity.x - camera.x;
        const screenY = this.entity.y - camera.y;
        this.animation.draw(ctx, screenX, screenY, 32, 48);
    }
}

// Usage
const enemy = new Entity();
enemy.x = 100;
enemy.y = 400;

enemy.addComponent(new PhysicsComponent(enemy));
enemy.addComponent(new HealthComponent(enemy, 50));
enemy.addComponent(new AnimationComponent(enemy, enemyAnimations));

// Later: damage enemy
const health = enemy.getComponent(HealthComponent);
health?.takeDamage(10);

// Check if dead
if (health?.health === 0) {
    console.log('Enemy died!');
}
```

---

## Performance Testing

```typescript
// Test entity manager performance
console.time('EntityManager update (1000 entities)');
for (let i = 0; i < 1000; i++) {
    entityManager.add(new Coin(Math.random() * 1000, Math.random() * 600));
}
entityManager.update(16);
console.timeEnd('EntityManager update (1000 entities)');

// Test object pool performance
console.time('Object pool (1000 bullets)');
for (let i = 0; i < 1000; i++) {
    const bullet = bulletPool.acquire();
    bullet.reset(0, 0, 100, 0);
    bulletPool.release(bullet);
}
console.timeEnd('Object pool (1000 bullets)');

// Test spatial grid performance
console.time('Spatial grid collision (100 entities)');
spatialGrid.clear();
entities.forEach(e => spatialGrid.insert(e));
entities.forEach(e => {
    const nearby = spatialGrid.getNearby(e);
});
console.timeEnd('Spatial grid collision (100 entities)');
```

---

**Next:** Quick reference in `d-notes.md`!
