# Architecture Patterns - FAQ

**Unit 06: Optimization, Polish & Engine Abstractions | Topic 02 | Frequently Asked Questions**

---

## Q1: Should I always use ECS?

**Answer:** **For complex games, yes.** For simple games, maybe not.

**Use ECS when:**
- Many entity types
- Complex interactions
- Need flexibility
- Building an engine

**Skip ECS when:**
- Simple game (< 5 entity types)
- Tight deadline
- Small scope

---

## Q2: How many systems is too many?

**Answer:** **10-20 is typical.** More than 30 needs organization.

Common systems:
- Input, Physics, Movement, Collision
- Animation, Render, Audio, Particles
- AI, Damage, Health, Score

---

## Q3: Should components have logic?

**Answer:** **No, keep components as pure data.**

```typescript
// ❌ Bad
class VelocityComponent {
  apply(transform: Transform) { /* logic */ }
}

// ✅ Good
class VelocityComponent {
  vx: number;
  vy: number;
}
```

---

## Q4: Events vs direct calls?

**Answer:** **Events for decoupling,** direct calls for performance.

Use events for:
- Cross-system communication
- UI updates
- Game state changes

Use direct calls for:
- Hot path code (per-frame)
- Simple parent-child calls

---

## Q5: How do I debug ECS?

**Answer:** **Log entity component lists.**

```typescript
function debugEntity(id: number) {
  const comps = em.getAllComponents(id);
  console.log(`Entity ${id}:`, comps.map(c => c.constructor.name));
}
```

---

## Q6: Service Locator vs Dependency Injection?

**Answer:** **Both have merits.** Service Locator is simpler, DI is more testable.

**Service Locator:**
- Simpler code
- Global access
- Hard to test

**Dependency Injection:**
- More verbose
- Explicit dependencies
- Easy to test

---

## Q7: Should I build ECS from scratch?

**Answer:** **Yes for learning,** use library for production.

Learning: Build your own
Production: Use libraries like bitECS, ecsy

---

## Q8: How do systems communicate?

**Answer:** **Through shared components or events.**

```typescript
// Shared components
class DamageSystem {
  update() {
    // Reads Health component
    // Writes to Health component
  }
}

// Events
collisionSystem.emit('collision', entity1, entity2);
damageSystem.on('collision', (e1, e2) => { /* handle */ });
```

---

## Q9: Can entities have multiple components of same type?

**Answer:** **Usually no.** One component type per entity is standard.

Exception: Tag components (mark entity as "player", "enemy", etc.)

---

## Q10: How do I handle entity parent-child?

**Answer:** **Scene graph or ParentComponent.**

```typescript
class ParentComponent {
  parentId: number | null;
  children: number[] = [];
}
```

---

**You now understand professional game architecture!** 🏗️✨
