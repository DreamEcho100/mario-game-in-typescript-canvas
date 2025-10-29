# Architecture Patterns - Exercises

**Unit 06: Optimization, Polish & Engine Abstractions | Topic 02 | Practice Challenges**

---

## Exercise 1: Entity Component System Basics
Build a simple ECS with entities, components, and one system.

**Requirements:** EntityManager, TransformComponent, MovementSystem

---

## Exercise 2: Event Bus Implementation
Create an event bus with on(), off(), and emit() methods.

**Requirements:** Subscribe/unsubscribe, multiple listeners, pass data

---

## Exercise 3: Observer Pattern
Implement score system that notifies multiple observers.

**Requirements:** 3+ observers react to score changes

---

## Exercise 4: Command Pattern
Create undoable move commands for a player.

**Requirements:** MoveCommand with execute() and undo()

---

## Exercise 5: Factory Pattern
Build entity factory that creates players, enemies, coins.

**Requirements:** Factory creates 3+ entity types with components

---

## Exercise 6: Component Composition
Create entity with 4+ components, all working together.

**Requirements:** Transform, Velocity, Sprite, Collider components

---

## Exercise 7: Service Locator
Implement global service registry.

**Requirements:** Register/retrieve services, type-safe

---

## Exercise 8: Scene Graph
Build parent-child hierarchy with inherited transforms.

**Requirements:** 3-level hierarchy, world position calculation

---

## Exercise 9: Multiple Systems
Create 3 systems that operate on same entities.

**Requirements:** Input, Physics, Render systems

---

## Exercise 10: ECS Collision System
Implement collision detection as a system.

**Requirements:** Query entities with Collider components

---

## Exercise 11: Event-Driven Gameplay
Wire up gameplay events (coin collected, enemy defeated).

**Requirements:** 5+ event types, proper decoupling

---

## Exercise 12: Dependency Injection
Refactor to use constructor injection instead of globals.

**Requirements:** Pass dependencies explicitly

---

## Exercise 13: Component Pool
Pool components to reduce allocations.

**Requirements:** Component pool with acquire/release

---

## Exercise 14: System Priority
Order systems by priority (input → physics → render).

**Requirements:** Configurable system order

---

## Exercise 15: Complete Refactor
Refactor your Mario game using all patterns learned.

**Requirements:** ECS, events, services, factory, scene graph

---

## Challenge Projects

### Challenge A: Advanced ECS (4-5 hours)
Build production-ready ECS with queries, filters, and reactive systems.

### Challenge B: Plugin System (3-4 hours)
Create extensible plugin architecture for adding features without modifying core.

### Challenge C: Data-Driven Design (4-5 hours)
Load entity definitions from JSON, configure systems externally.

---

**Master professional game architecture!** 🏗️
