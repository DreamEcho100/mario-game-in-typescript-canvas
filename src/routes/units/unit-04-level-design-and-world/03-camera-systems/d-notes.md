# Topic 03: Camera Systems - Quick Reference

---

## Basic Camera

```typescript
class Camera {
  x: number;
  y: number;
  width: number;
  height: number;

  apply(ctx) {
    ctx.save();
    ctx.translate(-this.x, -this.y);
  }

  restore(ctx) {
    ctx.restore();
  }
}
```

---

## Camera Following

```typescript
// Center on target
camera.x = target.x + target.width / 2 - camera.width / 2;
camera.y = target.y + target.height / 2 - camera.height / 2;

// Clamp to bounds
camera.x = Math.max(minX, Math.min(camera.x, maxX));
camera.y = Math.max(minY, Math.min(camera.y, maxY));
```

---

## Smooth Following (Lerp)

```typescript
// Calculate target position
targetX = player.x + player.width / 2 - camera.width / 2;

// Lerp towards target
camera.x += (targetX - camera.x) * smoothness;

// Frame-independent lerp
const lerpFactor = 1 - Math.pow(1 - smoothness, deltaTime * 60);
camera.x += (targetX - camera.x) * lerpFactor;
```

---

## Deadzone

```typescript
const deadzoneLeft = camera.x + (camera.width - deadzoneWidth) / 2;
const deadzoneRight = deadzoneLeft + deadzoneWidth;

if (playerCenter < deadzoneLeft) {
  targetX = playerCenter - (camera.width - deadzoneWidth) / 2;
} else if (playerCenter > deadzoneRight) {
  targetX = playerCenter - (camera.width + deadzoneWidth) / 2;
}
```

---

## Look-Ahead

```typescript
const targetLookAhead = Math.sign(velocityX) * lookAheadDistance;
lookAheadX += (targetLookAhead - lookAheadX) * lookAheadSpeed;

const adjustedTarget = {
  x: player.x + lookAheadX,
  y: player.y,
  width: player.width,
  height: player.height
};
```

---

## Camera Shake

```typescript
if (shakeDuration > 0) {
  shakeDuration -= deltaTime;
  const angle = Math.random() * Math.PI * 2;
  shakeX = Math.cos(angle) * shakeIntensity;
  shakeY = Math.sin(angle) * shakeIntensity;
  shakeIntensity *= 0.9;
}

ctx.translate(-(camera.x + shakeX), -(camera.y + shakeY));
```

---

## Visibility Check

```typescript
isVisible(x, y, width, height) {
  return (
    x + width > camera.x &&
    x < camera.x + camera.width &&
    y + height > camera.y &&
    y < camera.y + camera.height
  );
}
```

---

## Common Values

- **Smoothness**: 0.1 (responsive), 0.05 (smooth), 0.2 (snappy)
- **Deadzone**: 100x80px (horizontal focus), 80x120px (vertical)
- **Look-ahead**: 80-120px
- **Shake intensity**: 5-15px
- **Shake duration**: 0.2-0.5s
