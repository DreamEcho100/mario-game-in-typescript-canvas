# Topic 04: Scrolling and Parallax - Quick Reference

---

## Parallax Formula

```typescript
layerX = -cameraX * parallaxRatio
```

**Common Ratios:**
- `0.0`: Fixed background (no movement)
- `0.2`: Far mountains
- `0.5`: Mid-range
- `0.8`: Near foreground
- `1.0`: Moves with camera

---

## Basic Parallax Layer

```typescript
class ParallaxLayer {
  render(ctx, cameraX) {
    const offsetX = -cameraX * this.parallaxRatio;
    ctx.drawImage(this.image, offsetX, 0);
  }
}
```

---

## Repeating Background

```typescript
const offsetX = -cameraX * parallaxRatio;
const imgWidth = image.width;
const startX = Math.floor(offsetX / imgWidth) * imgWidth;

for (let x = startX; x < offsetX + viewportWidth; x += imgWidth) {
  ctx.drawImage(image, x, 0);
}
```

---

## Auto-Scrolling

```typescript
// Update
offsetX += scrollSpeed * deltaTime;

// Or use time
offsetX = scrollSpeed * performance.now() / 1000;

// Wrap
offsetX = offsetX % imageWidth;
```

---

## Sky Gradient

```typescript
const gradient = ctx.createLinearGradient(0, 0, 0, height);
gradient.addColorStop(0, topColor);
gradient.addColorStop(1, bottomColor);
ctx.fillStyle = gradient;
ctx.fillRect(0, 0, width, height);
```

---

## Opacity/Fog

```typescript
ctx.save();
ctx.globalAlpha = 0.5;  // 50% transparent
ctx.drawImage(fogImage, x, y);
ctx.restore();
```

---

## Vertical Parallax

```typescript
const offsetX = -cameraX * parallaxX;
const offsetY = -cameraY * parallaxY;

// Tile in both directions
for (let y = startY; y < endY; y += imgH) {
  for (let x = startX; x < endX; x += imgW) {
    ctx.drawImage(image, x, y);
  }
}
```

---

## Render Order

```
1. Sky gradient
2. Far parallax (0.2x)
3. Mid parallax (0.5x)
4. Near parallax (0.8x)
5. Game world (1.0x)
6. Fog/clouds (overlay)
7. UI (no parallax)
```

---

## Common Values

**Parallax Ratios:**
- Sky: 0.0 (fixed)
- Distant mountains: 0.1-0.3
- Far trees: 0.4-0.6
- Near objects: 0.7-0.9
- Foreground: 1.0

**Auto-Scroll Speeds:**
- Slow clouds: 10-20 px/s
- Medium clouds: 30-50 px/s
- Fast clouds: 60-100 px/s

**Opacity:**
- Subtle fog: 0.2-0.3
- Medium fog: 0.4-0.6
- Heavy fog: 0.7-0.9

---

## Performance Tips

✅ **Do:**
- Pre-render to off-screen canvas
- Cache repeated patterns
- Use power-of-2 image sizes
- Cull off-screen layers
- Batch similar layers

❌ **Don't:**
- Draw full images if partially visible
- Recalculate every frame
- Use non-repeating images for tiling
- Forget to set globalAlpha back
- Draw layers in wrong order
