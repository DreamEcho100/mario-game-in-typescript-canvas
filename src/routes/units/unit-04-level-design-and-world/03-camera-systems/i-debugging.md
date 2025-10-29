# Topic 03: Camera Systems - Debugging

---

## Bug #1: Camera Jitters

**Symptoms**: Camera vibrates or stutters

**Causes**:
- Not rounding camera position
- Frame-rate dependent lerp
- Conflicting camera systems

**Fix**:
```typescript
// Round camera position
ctx.translate(-Math.round(camera.x), -Math.round(camera.y));

// Use frame-independent lerp
const lerp = 1 - Math.pow(1 - smoothness, deltaTime * 60);
```

---

## Bug #2: Player Hits Edge

**Symptoms**: Player reaches screen edge before camera moves

**Causes**:
- Deadzone too large
- Camera not following smoothly
- Bounds too restrictive

**Fix**:
```typescript
// Reduce deadzone
deadzoneWidth = 100;  // Was 200

// Increase smoothness
smoothness = 0.15;  // Was 0.05
```

---

## Bug #3: UI Shakes with Camera

**Symptoms**: HUD/UI elements shake with camera

**Causes**:
- UI drawn before `restore()`
- Shake applied to all rendering

**Fix**:
```typescript
camera.apply(ctx);
drawWorld();
camera.restore(ctx);

// UI drawn after restore
drawHUD();
```

---

## Bug #4: Look-Ahead Too Fast

**Symptoms**: Camera whips around when changing direction

**Causes**:
- Look-ahead speed too high
- No smoothing on look-ahead

**Fix**:
```typescript
// Smooth look-ahead
lookAheadSpeed = 0.05;  // Was 0.2

// Add deadband for velocity
if (Math.abs(velocityX) > 50) {
  targetLookAhead = Math.sign(velocityX) * distance;
}
```

---

## Bug #5: Camera Shows Outside Level

**Symptoms**: Black bars or void visible at edges

**Causes**:
- Bounds not set correctly
- Level smaller than viewport

**Fix**:
```typescript
// Set correct bounds
maxX = Math.max(0, worldWidth - camera.width);
maxY = Math.max(0, worldHeight - camera.height);

// Clamp properly
camera.x = Math.max(minX, Math.min(camera.x, maxX));
```

---

## Debug Visualization

```typescript
// Draw camera bounds
ctx.strokeStyle = 'red';
ctx.strokeRect(camera.x, camera.y, camera.width, camera.height);

// Draw deadzone
ctx.strokeStyle = 'yellow';
const dzX = camera.x + (camera.width - dzWidth) / 2;
const dzY = camera.y + (camera.height - dzHeight) / 2;
ctx.strokeRect(dzX, dzY, dzWidth, dzHeight);

// Draw look-ahead
ctx.fillStyle = 'cyan';
ctx.fillRect(playerX + lookAheadX - 5, playerY, 10, 10);
```
