# Architecture Patterns - Quick Reference

**Unit 06: Optimization, Polish & Engine Abstractions | Topic 02 | Cheat Sheet**

---

## ECS Pattern

```typescript
// Entity = ID
const entity = entityManager.createEntity();

// Components = Data
entityManager.addComponent(new TransformComponent(entity, x, y));
entityManager.addComponent(new VelocityComponent(entity, vx, vy));

// Systems = Logic
class MovementSystem {
  update(deltaTime: number, em: EntityManager): void {
    const transforms = em.getComponents<Transform>('Transform');
    transforms.forEach(t => {
      const v = em.getComponent<Velocity>(t.entityId, 'Velocity');
      if (v) {
        t.x += v.vx * deltaTime;
        t.y += v.vy * deltaTime;
      }
    });
  }
}
```

---

## Observer Pattern

```typescript
class EventBus {
  private events = new Map<string, Function[]>();
  
  on(event: string, handler: Function): void {
    if (!this.events.has(event)) this.events.set(event, []);
    this.events.get(event)!.push(handler);
  }
  
  emit(event: string, ...args: any[]): void {
    this.events.get(event)?.forEach(h => h(...args));
  }
}

// Usage
eventBus.on('coinCollected', (value) => score += value);
eventBus.emit('coinCollected', 10);
```

---

## Command Pattern

```typescript
interface Command {
  execute(): void;
  undo(): void;
}

class MoveCommand implements Command {
  execute() { entity.x += dx; }
  undo() { entity.x -= dx; }
}
```

---

## Factory Pattern

```typescript
class EntityFactory {
  create(type: string, x: number, y: number): Entity {
    const entity = new Entity();
    switch(type) {
      case 'player': return this.createPlayer(entity, x, y);
      case 'enemy': return this.createEnemy(entity, x, y);
    }
    return entity;
  }
}
```

---

## Service Locator

```typescript
class ServiceLocator {
  private static services = new Map<string, any>();
  
  static provide(name: string, service: any) {
    this.services.set(name, service);
  }
  
  static get<T>(name: string): T {
    return this.services.get(name) as T;
  }
}

// Register
ServiceLocator.provide('audio', audioManager);

// Access anywhere
const audio = ServiceLocator.get<AudioManager>('audio');
```

---

## SOLID Principles

**S**ingle Responsibility - One reason to change
**O**pen/Closed - Open for extension, closed for modification
**L**iskov Substitution - Subtypes are substitutable
**I**nterface Segregation - Many specific interfaces > one general
**D**ependency Inversion - Depend on abstractions

---

## Composition Over Inheritance

```typescript
// ❌ Inheritance
class FlyingEnemy extends MovingEnemy extends Enemy {}

// ✅ Composition
class Entity {
  components: Component[] = [];
  addComponent(c: Component) { this.components.push(c); }
}
```

---

**Design for flexibility and maintainability!** 🏗️
