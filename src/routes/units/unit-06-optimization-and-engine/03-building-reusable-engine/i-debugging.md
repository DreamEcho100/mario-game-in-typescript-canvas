# Building a Reusable Game Engine - Debugging

**Unit 06: Optimization, Polish & Engine Abstractions | Topic 03 | Common Issues**

---

## Bug #1: Engine Won't Start

### Symptom
start() called but nothing renders.

### Solution
```typescript
// ✅ Ensure scene is set
engine.addScene('game', new GameScene(engine));
engine.setScene('game'); // Must set active scene!
engine.start();
```

---

## Bug #2: Assets Not Loading

### Symptom
getAsset() throws error.

### Solution
```typescript
// ✅ Await asset loading
await engine.loadAssets({ ... });
// Then start engine
engine.start();
```

---

## Bug #3: Components Not Updating

### Symptom
Component update() never called.

### Solution
```typescript
// ✅ Ensure entity is active
entity.active = true;
scene.addEntity(entity);
```

---

## Bug #4: Scene Transition Broken

### Symptom
setScene() doesn't switch scenes.

### Solution
```typescript
// ✅ Call onExit/onEnter
setScene(name: string): void {
  if (this.current) this.current.onExit();
  this.current = this.scenes.get(name);
  if (this.current) this.current.onEnter();
}
```

---

## Bug #5: Type Definitions Missing

### Symptom
TypeScript errors when using engine.

### Solution
```typescript
// ✅ Enable declaration in tsconfig.json
{
  "compilerOptions": {
    "declaration": true,
    "outDir": "./dist"
  }
}
```

---

**Debug your engine systematically!** 🐛
