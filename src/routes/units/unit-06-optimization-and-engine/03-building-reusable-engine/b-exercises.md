# Building a Reusable Game Engine - Exercises

**Unit 06: Optimization, Polish & Engine Abstractions | Topic 03 | Practice Challenges**

---

## Exercise 1: Engine Class
Create main Engine class with start() and stop() methods.

**Requirements:** Canvas setup, game loop, lifecycle management

---

## Exercise 2: Scene System
Implement Scene base class with onEnter/onExit lifecycle.

**Requirements:** Abstract Scene, SceneManager, scene switching

---

## Exercise 3: Entity System
Build Entity class with component management.

**Requirements:** addComponent, getComponent, hasComponent, removeComponent

---

## Exercise 4: Asset Manager
Create asynchronous asset loader.

**Requirements:** Load images and audio, progress tracking, error handling

---

## Exercise 5: Input Manager
Build comprehensive input system.

**Requirements:** Keyboard, mouse, touch, isKeyDown/isKeyPressed distinction

---

## Exercise 6: Audio Manager
Implement sound and music management.

**Requirements:** Play/stop sounds, music looping, volume control

---

## Exercise 7: Event System
Create event bus for engine events.

**Requirements:** on/off/emit, type-safe events

---

## Exercise 8: Component Library
Build standard components (Sprite, Physics, Collider).

**Requirements:** 5+ reusable components

---

## Exercise 9: Vector Math Library
Implement Vector2 class with common operations.

**Requirements:** add, subtract, multiply, normalize, distance, dot

---

## Exercise 10: Object Pool
Create generic object pooling system.

**Requirements:** Pool<T> with acquire/release

---

## Exercise 11: Camera System
Add camera with follow and boundaries.

**Requirements:** Camera class, smooth following, world-to-screen conversion

---

## Exercise 12: Tilemap Support
Build tilemap rendering into engine.

**Requirements:** Load tilemaps, render efficiently, collision layers

---

## Exercise 13: Particle System
Add particle emitter to engine.

**Requirements:** Configurable emitter, particle pooling, various effects

---

## Exercise 14: Complete Game Using Engine
Build a full game using only your engine API.

**Requirements:** No direct Canvas access, use engine abstractions

---

## Exercise 15: Package and Publish
Prepare engine for npm publication.

**Requirements:** package.json, README, TypeScript definitions, examples

---

## Challenge Projects

### Challenge A: Plugin System (5-6 hours)
Create extensible plugin architecture where developers can add custom systems without modifying engine core.

### Challenge B: Level Editor (6-8 hours)
Build visual level editor for your engine with drag-drop entities, save/load levels as JSON.

### Challenge C: Multi-Platform Support (4-5 hours)
Extend engine to support both Canvas2D and WebGL rendering backends, switchable at runtime.

---

**You're now a game engine developer!** 🏗️🎮✨
