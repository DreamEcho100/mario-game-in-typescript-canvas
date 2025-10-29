# Collision Detection AABB - Debugging Guide

## Bug 1: Collision Not Detected

**Symptoms**: Objects pass through each other

**Diagnosis**:
```typescript
// Wrong coordinate system
x, y = top-left corner // ❌

// Should be:
x, y = center
left = x - width/2
right = x + width/2
```

**Solution**: Use center-based coordinates with getters

---

## Bug 2: Player Stuck in Platform

**Symptoms**: Player teleports or vibrates inside platform

**Diagnosis**: Not pushing player out far enough

**Solution**:
```typescript
// Push completely out
this.y = platform.top - this.height / 2;
```

---

## Bug 3: Wrong Collision Side

**Symptoms**: Player pushed in wrong direction

**Diagnosis**: Not checking minimum overlap

**Solution**: Resolve on axis with smallest overlap

---

## Bug 4: Can't Jump Off Platform

**Symptoms**: isGrounded never set

**Solution**:
```typescript
player.isGrounded = false; // Reset every frame
for (const platform of platforms) {
  if (onTopOf(platform)) {
    player.isGrounded = true;
  }
}
```

---

## Bug 5: Falls Through Fast

**Symptoms**: High speed causes tunneling

**Solution**:
- Lower max fall speed
- Use swept collision
- Smaller time steps

---

## Debugging Tools

### Visual Collision Boxes
```typescript
// Draw hitboxes
ctx.strokeStyle = 'red';
ctx.strokeRect(obj.left, obj.top, obj.width, obj.height);
```

### Collision Info Display
```typescript
ctx.fillText(`Colliding: ${isColliding}`, 10, 30);
ctx.fillText(`Overlap X: ${overlapX}`, 10, 50);
ctx.fillText(`Overlap Y: ${overlapY}`, 10, 70);
```
