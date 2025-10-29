# Architecture Patterns and Design

**Unit 06: Optimization, Polish & Engine Abstractions | Topic 02 of 03**

> **Learning Objective:** Master game engine design patterns and architecture principles for building scalable, maintainable game systems.

---

## Table of Contents

1. [Introduction](#introduction)
2. [Core Design Principles](#core-design-principles)
3. [Entity Component System (ECS)](#entity-component-system)
4. [Game Loop Architectures](#game-loop-architectures)
5. [State Pattern](#state-pattern)
6. [Observer Pattern](#observer-pattern)
7. [Object Pool Pattern](#object-pool-pattern)
8. [Command Pattern](#command-pattern)
9. [Factory Pattern](#factory-pattern)
10. [Service Locator Pattern](#service-locator-pattern)
11. [Scene Graph](#scene-graph)
12. [Application to Mario Game](#application-to-mario-game)
13. [Summary](#summary)

---

## Introduction

### What are Architecture Patterns?

Design patterns are proven solutions to common software design problems. In game development, they help us build:
- Scalable systems
- Maintainable code
- Reusable components
- Testable logic

### What You'll Learn

- Entity Component System (ECS) architecture
- Common game design patterns
- Decoupling strategies
- Component-based design
- Event systems
- Scene management

### Prerequisites

- Completed Units 01-05
- Understanding of TypeScript classes
- Familiarity with interfaces
- Basic object-oriented programming

### Time Investment

**Estimated Time:** 4-5 hours
- Design Principles: 45 minutes
- ECS Architecture: 1.5 hours
- Design Patterns: 2 hours
- Implementation: 1 hour

---

## Core Design Principles

### SOLID Principles

#### 1. Single Responsibility Principle (SRP)

**Each class should have one reason to change.**

```typescript
// ❌ Bad: Multiple responsibilities
class Player {
  x: number;
  y: number;
  
  update(deltaTime: number): void {
    // Movement logic
    this.x += this.velocityX * deltaTime;
    
    // Rendering logic
    ctx.drawImage(this.image, this.x, this.y);
    
    // Input handling
    if (keys['ArrowLeft']) this.velocityX = -5;
    
    // Sound effects
    if (this.jumping) audioManager.play('jump');
  }
}

// ✅ Good: Separated responsibilities
class Player {
  x: number;
  y: number;
  
  update(deltaTime: number): void {
    // Only movement logic
    this.x += this.velocityX * deltaTime;
    this.y += this.velocityY * deltaTime;
  }
}

class PlayerRenderer {
  render(player: Player, ctx: CanvasRenderingContext2D): void {
    ctx.drawImage(player.image, player.x, player.y);
  }
}

class PlayerController {
  handleInput(player: Player, input: InputState): void {
    if (input.left) player.velocityX = -5;
    if (input.right) player.velocityX = 5;
  }
}
```

#### 2. Open/Closed Principle

**Open for extension, closed for modification.**

```typescript
// ✅ Extensible enemy system
interface Enemy {
  update(deltaTime: number): void;
  render(ctx: CanvasRenderingContext2D): void;
}

class Goomba implements Enemy {
  update(deltaTime: number): void {
    // Goomba-specific behavior
  }
  
  render(ctx: CanvasRenderingContext2D): void {
    // Goomba rendering
  }
}

class Koopa implements Enemy {
  update(deltaTime: number): void {
    // Koopa-specific behavior
  }
  
  render(ctx: CanvasRenderingContext2D): void {
    // Koopa rendering
  }
}

// Adding new enemy doesn't modify existing code
class Piranha implements Enemy {
  update(deltaTime: number): void {
    // Piranha-specific behavior
  }
  
  render(ctx: CanvasRenderingContext2D): void {
    // Piranha rendering
  }
}
```

#### 3. Dependency Inversion Principle

**Depend on abstractions, not concrete implementations.**

```typescript
// ❌ Bad: Tight coupling
class Game {
  private audioManager: WebAudioManager; // Concrete class
  
  constructor() {
    this.audioManager = new WebAudioManager();
  }
}

// ✅ Good: Depend on interface
interface AudioManager {
  play(sound: string): void;
  stop(sound: string): void;
  setVolume(volume: number): void;
}

class Game {
  constructor(private audioManager: AudioManager) {} // Interface
}

// Can swap implementations
class WebAudioManager implements AudioManager {
  play(sound: string): void { /* Web Audio API */ }
  stop(sound: string): void { /* ... */ }
  setVolume(volume: number): void { /* ... */ }
}

class HowlerAudioManager implements AudioManager {
  play(sound: string): void { /* Howler.js */ }
  stop(sound: string): void { /* ... */ }
  setVolume(volume: number): void { /* ... */ }
}
```

### Composition Over Inheritance

**Prefer composing objects over inheritance.**

```typescript
// ❌ Bad: Deep inheritance hierarchy
class Entity {}
class MovingEntity extends Entity {}
class JumpingEntity extends MovingEntity {}
class ShootingJumpingEntity extends JumpingEntity {} // Getting messy!

// ✅ Good: Component composition
interface Component {
  update(deltaTime: number): void;
}

class MovementComponent implements Component {
  update(deltaTime: number): void {
    // Movement logic
  }
}

class JumpComponent implements Component {
  update(deltaTime: number): void {
    // Jump logic
  }
}

class ShootComponent implements Component {
  update(deltaTime: number): void {
    // Shoot logic
  }
}

class Entity {
  private components: Component[] = [];
  
  addComponent(component: Component): void {
    this.components.push(component);
  }
  
  update(deltaTime: number): void {
    this.components.forEach(c => c.update(deltaTime));
  }
}

// Flexible composition
const player = new Entity();
player.addComponent(new MovementComponent());
player.addComponent(new JumpComponent());
player.addComponent(new ShootComponent());

const goomba = new Entity();
goomba.addComponent(new MovementComponent()); // Only moves, doesn't jump or shoot
```

---

## Entity Component System (ECS)

### ECS Architecture

**Three core concepts:**

1. **Entities** - Containers with unique IDs
2. **Components** - Data only, no logic
3. **Systems** - Logic only, operates on components

```
Entity (ID: 123)
├─ TransformComponent { x: 100, y: 200 }
├─ VelocityComponent { vx: 5, vy: 0 }
├─ SpriteComponent { image: mario.png }
└─ ColliderComponent { width: 32, height: 32 }

MovementSystem → Reads Transform + Velocity → Updates position
RenderSystem → Reads Transform + Sprite → Draws to screen
CollisionSystem → Reads Transform + Collider → Detects overlaps
```

### Implementation

#### Components (Data Only)

```typescript
interface Component {
  entityId: number;
}

class TransformComponent implements Component {
  constructor(
    public entityId: number,
    public x: number = 0,
    public y: number = 0
  ) {}
}

class VelocityComponent implements Component {
  constructor(
    public entityId: number,
    public vx: number = 0,
    public vy: number = 0
  ) {}
}

class SpriteComponent implements Component {
  constructor(
    public entityId: number,
    public image: HTMLImageElement,
    public width: number = 32,
    public height: number = 32
  ) {}
}

class ColliderComponent implements Component {
  constructor(
    public entityId: number,
    public width: number,
    public height: number
  ) {}
}
```

#### Entity Manager

```typescript
class EntityManager {
  private nextEntityId: number = 1;
  private components: Map<string, Map<number, Component>> = new Map();
  
  createEntity(): number {
    return this.nextEntityId++;
  }
  
  addComponent<T extends Component>(component: T): void {
    const componentType = component.constructor.name;
    
    if (!this.components.has(componentType)) {
      this.components.set(componentType, new Map());
    }
    
    this.components.get(componentType)!.set(component.entityId, component);
  }
  
  getComponent<T extends Component>(entityId: number, componentType: string): T | undefined {
    return this.components.get(componentType)?.get(entityId) as T;
  }
  
  getComponents<T extends Component>(componentType: string): T[] {
    const componentMap = this.components.get(componentType);
    return componentMap ? Array.from(componentMap.values()) as T[] : [];
  }
  
  removeEntity(entityId: number): void {
    this.components.forEach(componentMap => {
      componentMap.delete(entityId);
    });
  }
}
```

#### Systems (Logic Only)

```typescript
interface System {
  update(deltaTime: number, entityManager: EntityManager): void;
}

class MovementSystem implements System {
  update(deltaTime: number, entityManager: EntityManager): void {
    const transforms = entityManager.getComponents<TransformComponent>('TransformComponent');
    
    transforms.forEach(transform => {
      const velocity = entityManager.getComponent<VelocityComponent>(
        transform.entityId,
        'VelocityComponent'
      );
      
      if (velocity) {
        transform.x += velocity.vx * deltaTime / 16.67;
        transform.y += velocity.vy * deltaTime / 16.67;
      }
    });
  }
}

class RenderSystem implements System {
  constructor(private ctx: CanvasRenderingContext2D) {}
  
  update(deltaTime: number, entityManager: EntityManager): void {
    const transforms = entityManager.getComponents<TransformComponent>('TransformComponent');
    
    transforms.forEach(transform => {
      const sprite = entityManager.getComponent<SpriteComponent>(
        transform.entityId,
        'SpriteComponent'
      );
      
      if (sprite) {
        this.ctx.drawImage(
          sprite.image,
          transform.x,
          transform.y,
          sprite.width,
          sprite.height
        );
      }
    });
  }
}

class CollisionSystem implements System {
  update(deltaTime: number, entityManager: EntityManager): void {
    const transforms = entityManager.getComponents<TransformComponent>('TransformComponent');
    
    for (let i = 0; i < transforms.length; i++) {
      const t1 = transforms[i];
      const c1 = entityManager.getComponent<ColliderComponent>(t1.entityId, 'ColliderComponent');
      
      if (!c1) continue;
      
      for (let j = i + 1; j < transforms.length; j++) {
        const t2 = transforms[j];
        const c2 = entityManager.getComponent<ColliderComponent>(t2.entityId, 'ColliderComponent');
        
        if (!c2) continue;
        
        if (this.checkCollision(t1, c1, t2, c2)) {
          this.handleCollision(t1.entityId, t2.entityId);
        }
      }
    }
  }
  
  private checkCollision(
    t1: TransformComponent,
    c1: ColliderComponent,
    t2: TransformComponent,
    c2: ColliderComponent
  ): boolean {
    return !(
      t1.x + c1.width < t2.x ||
      t1.x > t2.x + c2.width ||
      t1.y + c1.height < t2.y ||
      t1.y > t2.y + c2.height
    );
  }
  
  private handleCollision(entity1: number, entity2: number): void {
    console.log(`Collision between ${entity1} and ${entity2}`);
  }
}
```

#### Game Loop with ECS

```typescript
class ECSGame {
  private entityManager: EntityManager;
  private systems: System[] = [];
  
  constructor(canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext('2d')!;
    
    this.entityManager = new EntityManager();
    
    // Register systems
    this.systems.push(new MovementSystem());
    this.systems.push(new CollisionSystem());
    this.systems.push(new RenderSystem(ctx));
    
    this.setupEntities();
  }
  
  private setupEntities(): void {
    // Create player entity
    const player = this.entityManager.createEntity();
    this.entityManager.addComponent(new TransformComponent(player, 100, 400));
    this.entityManager.addComponent(new VelocityComponent(player, 0, 0));
    this.entityManager.addComponent(new SpriteComponent(player, playerImage, 32, 32));
    this.entityManager.addComponent(new ColliderComponent(player, 32, 32));
    
    // Create enemy entity
    const enemy = this.entityManager.createEntity();
    this.entityManager.addComponent(new TransformComponent(enemy, 300, 400));
    this.entityManager.addComponent(new VelocityComponent(enemy, -2, 0));
    this.entityManager.addComponent(new SpriteComponent(enemy, enemyImage, 32, 32));
    this.entityManager.addComponent(new ColliderComponent(enemy, 32, 32));
  }
  
  update(deltaTime: number): void {
    this.systems.forEach(system => {
      system.update(deltaTime, this.entityManager);
    });
  }
}
```

---

## Observer Pattern

**Decouple event producers from consumers.**

```typescript
type EventHandler = (...args: any[]) => void;

class EventBus {
  private events: Map<string, EventHandler[]> = new Map();
  
  on(event: string, handler: EventHandler): void {
    if (!this.events.has(event)) {
      this.events.set(event, []);
    }
    this.events.get(event)!.push(handler);
  }
  
  off(event: string, handler: EventHandler): void {
    const handlers = this.events.get(event);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index !== -1) {
        handlers.splice(index, 1);
      }
    }
  }
  
  emit(event: string, ...args: any[]): void {
    const handlers = this.events.get(event);
    if (handlers) {
      handlers.forEach(handler => handler(...args));
    }
  }
}

// Usage
const eventBus = new EventBus();

// Subscribe to events
eventBus.on('playerDied', () => {
  console.log('Game Over!');
  audioManager.play('gameOver');
});

eventBus.on('coinCollected', (value: number) => {
  scoreManager.add(value);
  audioManager.play('coin');
});

eventBus.on('enemyDefeated', (enemyType: string) => {
  scoreManager.add(100);
  particleSystem.emit(enemy.x, enemy.y);
});

// Emit events
eventBus.emit('coinCollected', 10);
eventBus.emit('playerDied');
eventBus.emit('enemyDefeated', 'goomba');
```

---

## Command Pattern

**Encapsulate actions as objects.**

```typescript
interface Command {
  execute(): void;
  undo(): void;
}

class MoveCommand implements Command {
  private previousX: number;
  private previousY: number;
  
  constructor(
    private entity: Entity,
    private dx: number,
    private dy: number
  ) {
    this.previousX = entity.x;
    this.previousY = entity.y;
  }
  
  execute(): void {
    this.entity.x += this.dx;
    this.entity.y += this.dy;
  }
  
  undo(): void {
    this.entity.x = this.previousX;
    this.entity.y = this.previousY;
  }
}

class JumpCommand implements Command {
  private wasOnGround: boolean;
  
  constructor(private player: Player) {
    this.wasOnGround = player.onGround;
  }
  
  execute(): void {
    if (this.player.onGround) {
      this.player.velocityY = -15;
      this.player.onGround = false;
    }
  }
  
  undo(): void {
    if (this.wasOnGround) {
      this.player.velocityY = 0;
      this.player.onGround = true;
    }
  }
}

class CommandQueue {
  private commands: Command[] = [];
  private history: Command[] = [];
  
  addCommand(command: Command): void {
    this.commands.push(command);
  }
  
  execute(): void {
    while (this.commands.length > 0) {
      const command = this.commands.shift()!;
      command.execute();
      this.history.push(command);
    }
  }
  
  undo(): void {
    if (this.history.length > 0) {
      const command = this.history.pop()!;
      command.undo();
    }
  }
}
```

---

## Factory Pattern

**Centralize object creation.**

```typescript
enum EntityType {
  PLAYER,
  GOOMBA,
  KOOPA,
  COIN
}

class EntityFactory {
  constructor(private entityManager: EntityManager) {}
  
  create(type: EntityType, x: number, y: number): number {
    const entity = this.entityManager.createEntity();
    
    this.entityManager.addComponent(new TransformComponent(entity, x, y));
    
    switch (type) {
      case EntityType.PLAYER:
        return this.createPlayer(entity);
      case EntityType.GOOMBA:
        return this.createGoomba(entity);
      case EntityType.KOOPA:
        return this.createKoopa(entity);
      case EntityType.COIN:
        return this.createCoin(entity);
    }
    
    return entity;
  }
  
  private createPlayer(entity: number): number {
    this.entityManager.addComponent(new VelocityComponent(entity, 0, 0));
    this.entityManager.addComponent(new SpriteComponent(entity, playerImage, 32, 32));
    this.entityManager.addComponent(new ColliderComponent(entity, 32, 32));
    this.entityManager.addComponent(new PlayerComponent(entity));
    return entity;
  }
  
  private createGoomba(entity: number): number {
    this.entityManager.addComponent(new VelocityComponent(entity, -1, 0));
    this.entityManager.addComponent(new SpriteComponent(entity, goombaImage, 32, 32));
    this.entityManager.addComponent(new ColliderComponent(entity, 32, 32));
    this.entityManager.addComponent(new EnemyComponent(entity, 'goomba'));
    return entity;
  }
  
  private createKoopa(entity: number): number {
    this.entityManager.addComponent(new VelocityComponent(entity, -2, 0));
    this.entityManager.addComponent(new SpriteComponent(entity, koopaImage, 32, 48));
    this.entityManager.addComponent(new ColliderComponent(entity, 32, 48));
    this.entityManager.addComponent(new EnemyComponent(entity, 'koopa'));
    return entity;
  }
  
  private createCoin(entity: number): number {
    this.entityManager.addComponent(new SpriteComponent(entity, coinImage, 16, 16));
    this.entityManager.addComponent(new ColliderComponent(entity, 16, 16));
    this.entityManager.addComponent(new CollectibleComponent(entity, 10));
    return entity;
  }
}

// Usage
const factory = new EntityFactory(entityManager);
const player = factory.create(EntityType.PLAYER, 100, 400);
const enemy1 = factory.create(EntityType.GOOMBA, 300, 400);
const enemy2 = factory.create(EntityType.KOOPA, 500, 400);
const coin = factory.create(EntityType.COIN, 200, 350);
```

---

## Service Locator Pattern

**Global access to services without tight coupling.**

```typescript
class ServiceLocator {
  private static services: Map<string, any> = new Map();
  
  static provide<T>(name: string, service: T): void {
    this.services.set(name, service);
  }
  
  static get<T>(name: string): T {
    const service = this.services.get(name);
    if (!service) {
      throw new Error(`Service not found: ${name}`);
    }
    return service as T;
  }
  
  static has(name: string): boolean {
    return this.services.has(name);
  }
}

// Register services
ServiceLocator.provide('audioManager', new AudioManager());
ServiceLocator.provide('assetManager', new AssetManager());
ServiceLocator.provide('inputManager', new InputManager());
ServiceLocator.provide('eventBus', new EventBus());

// Access anywhere
class Player {
  jump(): void {
    const audio = ServiceLocator.get<AudioManager>('audioManager');
    audio.play('jump');
    
    const events = ServiceLocator.get<EventBus>('eventBus');
    events.emit('playerJumped');
  }
}
```

---

## Scene Graph

**Hierarchical organization of game objects.**

```typescript
class SceneNode {
  children: SceneNode[] = [];
  
  constructor(
    public x: number = 0,
    public y: number = 0,
    public rotation: number = 0,
    public scaleX: number = 1,
    public scaleY: number = 1,
    public parent: SceneNode | null = null
  ) {}
  
  addChild(child: SceneNode): void {
    child.parent = this;
    this.children.push(child);
  }
  
  removeChild(child: SceneNode): void {
    const index = this.children.indexOf(child);
    if (index !== -1) {
      this.children.splice(index, 1);
      child.parent = null;
    }
  }
  
  getWorldPosition(): { x: number; y: number } {
    if (!this.parent) {
      return { x: this.x, y: this.y };
    }
    
    const parentPos = this.parent.getWorldPosition();
    return {
      x: parentPos.x + this.x,
      y: parentPos.y + this.y
    };
  }
  
  update(deltaTime: number): void {
    // Update this node
    this.onUpdate(deltaTime);
    
    // Update children
    this.children.forEach(child => child.update(deltaTime));
  }
  
  render(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);
    ctx.scale(this.scaleX, this.scaleY);
    
    this.onRender(ctx);
    
    this.children.forEach(child => child.render(ctx));
    
    ctx.restore();
  }
  
  protected onUpdate(deltaTime: number): void {
    // Override in subclass
  }
  
  protected onRender(ctx: CanvasRenderingContext2D): void {
    // Override in subclass
  }
}

// Usage
const root = new SceneNode();

const player = new PlayerNode(100, 400);
root.addChild(player);

const weapon = new WeaponNode(20, -10); // Offset from player
player.addChild(weapon);

const particles = new ParticleEmitterNode(0, 0); // Relative to weapon
weapon.addChild(particles);

// Updating player updates entire hierarchy
root.update(deltaTime);
root.render(ctx);
```

---

## Application to Mario Game

### Complete Architected Mario Game

```typescript
// Main game class using all patterns
class MarioGame {
  private entityManager: EntityManager;
  private systems: System[] = [];
  private eventBus: EventBus;
  private factory: EntityFactory;
  private sceneGraph: SceneNode;
  
  constructor(canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext('2d')!;
    
    // Initialize ECS
    this.entityManager = new EntityManager();
    this.factory = new EntityFactory(this.entityManager);
    
    // Initialize event system
    this.eventBus = new EventBus();
    this.setupEventHandlers();
    
    // Initialize services
    ServiceLocator.provide('eventBus', this.eventBus);
    ServiceLocator.provide('entityManager', this.entityManager);
    ServiceLocator.provide('audioManager', new AudioManager());
    
    // Initialize systems
    this.systems.push(new InputSystem());
    this.systems.push(new PhysicsSystem());
    this.systems.push(new MovementSystem());
    this.systems.push(new CollisionSystem());
    this.systems.push(new AnimationSystem());
    this.systems.push(new RenderSystem(ctx));
    
    // Initialize scene graph
    this.sceneGraph = new SceneNode();
    
    this.setupLevel();
  }
  
  private setupEventHandlers(): void {
    this.eventBus.on('coinCollected', (value: number) => {
      const audio = ServiceLocator.get<AudioManager>('audioManager');
      audio.play('coin');
      
      // Add score
      const player = this.getPlayerEntity();
      const score = this.entityManager.getComponent<ScoreComponent>(player, 'ScoreComponent');
      if (score) {
        score.value += value;
      }
    });
    
    this.eventBus.on('enemyDefeated', (entityId: number) => {
      const audio = ServiceLocator.get<AudioManager>('audioManager');
      audio.play('stomp');
      
      // Remove enemy
      this.entityManager.removeEntity(entityId);
      
      // Add score
      const player = this.getPlayerEntity();
      const score = this.entityManager.getComponent<ScoreComponent>(player, 'ScoreComponent');
      if (score) {
        score.value += 100;
      }
    });
    
    this.eventBus.on('playerDied', () => {
      const audio = ServiceLocator.get<AudioManager>('audioManager');
      audio.play('death');
      
      // Handle game over
      setTimeout(() => {
        this.restart();
      }, 2000);
    });
  }
  
  private setupLevel(): void {
    // Create player
    const player = this.factory.create(EntityType.PLAYER, 100, 400);
    this.entityManager.addComponent(new ScoreComponent(player, 0));
    this.entityManager.addComponent(new LivesComponent(player, 3));
    
    // Create enemies
    for (let i = 0; i < 5; i++) {
      this.factory.create(EntityType.GOOMBA, 300 + i * 200, 400);
    }
    
    // Create coins
    for (let i = 0; i < 10; i++) {
      this.factory.create(EntityType.COIN, 150 + i * 50, 350);
    }
    
    // Create platforms
    for (let i = 0; i < 20; i++) {
      const platform = this.entityManager.createEntity();
      this.entityManager.addComponent(new TransformComponent(platform, i * 64, 500));
      this.entityManager.addComponent(new SpriteComponent(platform, platformImage, 64, 64));
      this.entityManager.addComponent(new ColliderComponent(platform, 64, 64));
      this.entityManager.addComponent(new PlatformComponent(platform));
    }
  }
  
  private getPlayerEntity(): number {
    const players = this.entityManager.getComponents<PlayerComponent>('PlayerComponent');
    return players.length > 0 ? players[0].entityId : -1;
  }
  
  update(deltaTime: number): void {
    // Update all systems
    this.systems.forEach(system => {
      system.update(deltaTime, this.entityManager);
    });
    
    // Update scene graph
    this.sceneGraph.update(deltaTime);
  }
  
  render(ctx: CanvasRenderingContext2D): void {
    // Clear screen
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    
    // Render scene graph
    this.sceneGraph.render(ctx);
  }
  
  restart(): void {
    // Clear entities
    this.entityManager = new EntityManager();
    this.factory = new EntityFactory(this.entityManager);
    
    // Recreate level
    this.setupLevel();
  }
  
  gameLoop = (currentTime: number): void => {
    const deltaTime = currentTime - this.lastTime;
    this.lastTime = currentTime;
    
    this.update(deltaTime);
    this.render(this.ctx);
    
    requestAnimationFrame(this.gameLoop);
  };
  
  start(): void {
    this.lastTime = performance.now();
    requestAnimationFrame(this.gameLoop);
  }
}
```

---

## Summary

### What You've Learned

1. **Design Principles:**
   - SOLID principles
   - Composition over inheritance
   - Separation of concerns
   - Dependency inversion

2. **ECS Architecture:**
   - Entities are IDs
   - Components are data
   - Systems are logic
   - Decoupled and flexible

3. **Design Patterns:**
   - Observer (event bus)
   - Command (undo/redo)
   - Factory (object creation)
   - Service Locator (global services)
   - Object Pool (performance)

4. **Scene Graph:**
   - Hierarchical organization
   - Parent-child relationships
   - Transform inheritance

### Key Takeaways

- **Separate concerns** - One responsibility per class
- **Compose, don't inherit** - Flexible component systems
- **Decouple with events** - Observer pattern
- **Centralize creation** - Factory pattern
- **Global services** - Service locator
- **ECS for scalability** - Data-oriented design

---

## Next Steps

**Next Topic:** Building a Reusable Engine
- Package your architecture
- Create engine abstractions
- Build reusable systems
- Export engine library

**Continue practicing:**
- Refactor existing code
- Apply design patterns
- Build component systems
- Create event-driven architecture

---

**You now understand professional game architecture!** 🏗️✨
