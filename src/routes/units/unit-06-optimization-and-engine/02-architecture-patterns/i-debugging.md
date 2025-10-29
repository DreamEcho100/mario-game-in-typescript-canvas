# Architecture Patterns - Debugging

**Unit 06: Optimization, Polish & Engine Abstractions | Topic 02 | Common Issues**

---

## Bug #1: Component Not Found

### Symptom
getComponent() returns undefined.

### Solution
```typescript
// ✅ Check component exists
const comp = em.getComponent(id, 'Transform');
if (!comp) return; // Guard clause
```

---

## Bug #2: Event Handlers Not Firing

### Symptom
emit() called but nothing happens.

### Solution
```typescript
// ✅ Verify subscription
eventBus.on('event', handler);
eventBus.emit('event'); // Must match exactly
```

---

## Bug #3: Circular Dependencies

### Symptom
Services reference each other causing errors.

### Solution
```typescript
// ✅ Use dependency injection
class System {
  constructor(private otherSystem: OtherSystem) {}
}
```

---

## Bug #4: Memory Leak with Events

### Symptom
Event handlers never removed.

### Solution
```typescript
// ✅ Remove on cleanup
eventBus.off('event', this.handler);
```

---

## Bug #5: System Order Matters

### Symptom
Rendering before movement applied.

### Solution
```typescript
// ✅ Correct order
systems.push(new InputSystem());
systems.push(new PhysicsSystem());
systems.push(new RenderSystem()); // Last!
```

---

**Debug architecture issues methodically!** 🐛
