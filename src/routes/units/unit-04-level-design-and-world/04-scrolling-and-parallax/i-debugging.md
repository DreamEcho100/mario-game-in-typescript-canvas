# Topic 04: Scrolling and Parallax - Debugging

---

## Bug #1: Gaps Between Tiles

**Symptoms**: Visible seams or gaps when scrolling

**Causes**:
- Floating point rounding errors
- Image not seamless
- Wrong calculation of tile position

**Fix**:
```typescript
// Round positions
const x = Math.floor(offsetX);
ctx.drawImage(image, x, 0);

// Add overlap
for (let x = startX - imgW; x < endX + imgW; x += imgW) {
  ctx.drawImage(image, x, 0);
}
```

---

## Bug #2: Layers Move Wrong Speed

**Symptoms**: Parallax effect too fast/slow or backwards

**Causes**:
- Wrong parallax ratio
- Wrong sign in calculation
- Camera not updating

**Fix**:
```typescript
// Correct formula
const offsetX = -cameraX * parallaxRatio;

// Check ratio (0.0 to 1.0)
console.log('Parallax ratio:', this.parallaxRatio);

// Far layers = small ratio (0.2)
// Near layers = large ratio (0.8)
```

---

## Bug #3: Background Jumps/Stutters

**Symptoms**: Background movement not smooth

**Causes**:
- Not using deltaTime
- Integer-only positions
- Frame rate issues

**Fix**:
```typescript
// Use deltaTime
offsetX += scrollSpeed * deltaTime;

// Use floating point
let offsetX: number = 0;  // Not integer

// Frame-independent
const time = performance.now() / 1000;
offsetX = scrollSpeed * time;
```

---

## Bug #4: Layers in Wrong Order

**Symptoms**: Near objects behind far objects

**Causes**:
- Rendering in wrong order
- Z-index not considered

**Fix**:
```typescript
// Render back-to-front
renderSky();
renderFarMountains();    // 0.2x
renderMidTrees();        // 0.5x
renderNearRocks();       // 0.8x
renderGameWorld();       // 1.0x
renderFog();             // Overlay
```

---

## Bug #5: Fog/Opacity Not Working

**Symptoms**: Fog layer not transparent

**Causes**:
- Forgot `ctx.restore()`
- globalAlpha affects everything

**Fix**:
```typescript
// Always save/restore
ctx.save();
ctx.globalAlpha = 0.5;
ctx.drawImage(fogImage, x, y);
ctx.restore();  // CRITICAL!

// Check alpha is reset
console.log(ctx.globalAlpha);  // Should be 1.0
```

---

## Bug #6: Performance Issues

**Symptoms**: Low FPS with parallax

**Causes**:
- Drawing too many tiles
- No culling
- No caching

**Fix**:
```typescript
// Cull off-screen layers
if (layerX + layerWidth < 0 || layerX > viewportWidth) {
  return;  // Don't render
}

// Cache to off-screen canvas
const cache = document.createElement('canvas');
const cacheCtx = cache.getContext('2d')!;
cacheCtx.drawImage(complexImage, 0, 0);

// Use cache
ctx.drawImage(cache, x, y);
```

---

## Bug #7: Repeating Pattern Visible

**Symptoms**: Can see where image repeats

**Causes**:
- Image not seamless
- Obvious pattern in image

**Fix**:
```typescript
// Use seamless images
// Check edges match in image editor

// Or add variety
const images = [img1, img2, img3];
const randomImg = images[Math.floor(Math.random() * images.length)];
```

---

## Debug Visualization

```typescript
// Show parallax ratios
for (let i = 0; i < layers.length; i++) {
  ctx.fillStyle = 'white';
  ctx.fillText(`Layer ${i}: ${layers[i].parallaxRatio}x`, 10, 20 + i * 20);
}

// Show layer boundaries
ctx.strokeStyle = 'red';
ctx.strokeRect(layerX, layerY, layerWidth, layerHeight);

// Show tile positions
for (let x = startX; x < endX; x += imgW) {
  ctx.fillStyle = 'yellow';
  ctx.fillRect(x, 0, 2, height);
}
```

---

## Performance Profiling

```typescript
// Measure render time
const start = performance.now();
renderParallax();
const duration = performance.now() - start;
console.log(`Parallax render: ${duration.toFixed(2)}ms`);

// Count draw calls
let drawCalls = 0;
const originalDraw = ctx.drawImage;
ctx.drawImage = (...args) => {
  drawCalls++;
  originalDraw.apply(ctx, args);
};
```
