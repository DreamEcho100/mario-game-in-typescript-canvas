# Topic 03: Camera Systems - FAQ

---

## Q1: Why does my camera jitter?

**A**: Not rounding the camera position causes sub-pixel rendering.

```typescript
// Wrong
ctx.translate(-camera.x, -camera.y);

// Correct
ctx.translate(-Math.round(camera.x), -Math.round(camera.y));
```

---

## Q2: What's the best smoothness value?

**A**: Depends on game feel:
- **0.15-0.2**: Responsive (Mario, Celeste)
- **0.08-0.12**: Balanced
- **0.05-0.07**: Cinematic (Limbo)

Test with your game!

---

## Q3: Should I use deadzone or always-center?

**A**: **Deadzone for horizontal platformers** (Mario, Sonic)
**Always-center for vertical levels** (tower climbing)

Deadzone gives player more freedom and reduces motion sickness.

---

## Q4: How big should the deadzone be?

**A**: 
- **Horizontal**: 100-150px (12-18% of screen width)
- **Vertical**: 80-120px (13-20% of screen height)
- **Wider deadzone** = more freedom, but player can get closer to edges
- **Smaller deadzone** = tighter camera, more reactive

---

## Q5: When should I use look-ahead?

**A**: Use look-ahead when:
- Player moves quickly
- Need to see ahead for obstacles
- Horizontal scrolling levels

Don't use for:
- Slow, exploration-focused games
- Levels with frequent direction changes
- Puzzle platformers

---

## Q6: How do I handle camera shake?

**A**: Shake for impacts, not constant:
```typescript
// Heavy landing
if (landingVelocity > 400) {
  camera.shake(10, 0.3);
}

// Enemy defeated
camera.shake(5, 0.2);

// Explosion
camera.shake(15, 0.5);
```

---

## Q7: Should camera follow Y-axis?

**A**: 
- **Yes** for: Vertical levels, climbing, exploration
- **No** for: Pure horizontal platformers (original Mario)
- **Limited** for: Modern platformers (small deadzone, slower following)

---

## Q8: How do I transition between camera zones?

**A**: 
```typescript
function enterZone(newBounds) {
  camera.setBounds(newBounds.minX, newBounds.minY, 
                   newBounds.maxX, newBounds.maxY);
  camera.snap(player);  // Instant snap, or
  camera.smoothness = 0.3;  // Faster transition
}
```

---

## Q9: How do I lock camera for boss fights?

**A**:
```typescript
class Camera {
  locked: boolean = false;

  update(player) {
    if (this.locked) return;  // Don't move camera
    // ... normal update
  }

  lock() { this.locked = true; }
  unlock() { this.locked = false; }
}
```

---

## Q10: What causes motion sickness?

**A**: Avoid:
- Very fast camera movement
- Constant shaking
- Rapid changes in direction
- High smoothness values (< 0.05)

Use:
- Moderate smoothness (0.1-0.15)
- Deadzones
- Rounded positions
- Limited Y-axis following

---

## Best Practices

✅ **Do:**
- Round camera positions
- Use deadzones
- Frame-independent lerp
- Clamp to level bounds
- Profile with many entities

❌ **Don't:**
- Shake constantly
- Follow too closely
- Ignore level bounds
- Use integer-only positions
- Apply camera to UI
