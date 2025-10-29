# Platformer Physics - Debugging Guide

## Bug 1: Jump Doesn't Work

**Symptoms**: Spacebar does nothing

**Diagnosis**:
- `isGrounded` never set to `true`
- Jump force too weak
- Input not captured

**Solution**:
```typescript
// Must reset isGrounded each frame
player.isGrounded = false;
for (const platform of platforms) {
  player.resolveCollision(platform);
  // isGrounded set inside resolveCollision
}
```

---

## Bug 2: Infinite Jumps

**Symptoms**: Can jump repeatedly in air

**Diagnosis**: Not checking `isGrounded` or `jumpsRemaining`

**Solution**:
```typescript
if (this.jumpPressed && this.jumpsRemaining > 0) {
  this.jump();
}
```

---

## Bug 3: Multi-Jump on Single Press

**Symptoms**: One key press = multiple jumps

**Diagnosis**: Not resetting `jumpPressed`

**Solution**:
```typescript
// At END of update
this.jumpPressed = false;
```

---

## Bug 4: Acceleration Too Slow

**Symptoms**: Takes forever to reach max speed

**Solution**: Increase `GROUND_ACCEL` constant

---

## Bug 5: Friction Frame-Rate Dependent

**Symptoms**: Different feel at different FPS

**Solution**:
```typescript
// Wrong
this.velocityX *= 0.9;

// Right
this.velocityX *= Math.pow(0.9, dt * 60);
```

---

## Bug 6: Coyote Time Not Working

**Diagnosis**: Timer not set when leaving ground

**Solution**:
```typescript
const wasGrounded = this.isGrounded;
// ... update ...
if (wasGrounded && !this.isGrounded) {
  this.coyoteTimer = this.COYOTE_TIME;
}
```

---

## Bug 7: Jump Buffer Ignored

**Diagnosis**: Timer counts down but jump never executes

**Solution**: Check buffer AFTER collision resolution

---

## Bug 8: Variable Jump Too Weak

**Diagnosis**: Release multiplier too strong

**Solution**: Increase from 0.3 to 0.5

---

## Bug 9: Stuck in Platform

**Symptoms**: Player vibrates inside platform

**Solution**: Push player completely out:
```typescript
this.y = platform.top - this.height / 2;
```

---

## Bug 10: Fast Fall Through Platform

**Symptoms**: High velocity causes tunneling

**Solutions**:
- Add `MAX_FALL_SPEED` cap
- Use swept collision
- Smaller time steps
