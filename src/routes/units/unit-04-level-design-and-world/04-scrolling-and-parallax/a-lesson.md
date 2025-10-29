# Topic 04: Scrolling and Parallax - Lesson

## Introduction

Welcome to **Scrolling and Parallax**! Parallax scrolling creates depth and atmosphere by moving background layers at different speeds. This technique is essential for professional-looking 2D platformers and creates a beautiful sense of depth.

By the end of this lesson, you'll understand:
- Multi-layer backgrounds
- Parallax scrolling mathematics
- Infinite/repeating backgrounds
- Atmospheric effects
- Performance optimization

## Table of Contents

1. [Parallax Basics](#parallax-basics)
2. [Multi-Layer Backgrounds](#multi-layer-backgrounds)
3. [Parallax Mathematics](#parallax-mathematics)
4. [Infinite Scrolling](#infinite-scrolling)
5. [Vertical Parallax](#vertical-parallax)
6. [Atmospheric Layers](#atmospheric-layers)
7. [Performance Optimization](#performance-optimization)
8. [Complete Implementation](#complete-implementation)

---

## Parallax Basics

### What is Parallax?

Parallax is the effect where distant objects appear to move slower than nearby objects:

```
Camera moving right →

Far mountains:     →  (slow)
Mid trees:         →→ (medium)
Near ground:       →→→ (fast)
Player:            →→→→ (1:1 with camera)
```

### Parallax Ratio

The **parallax ratio** determines how fast a layer scrolls relative to the camera:

- `ratio = 0.0`: Layer doesn't move (fixed background)
- `ratio = 0.5`: Layer moves at half camera speed
- `ratio = 1.0`: Layer moves with camera (foreground)
- `ratio > 1.0`: Layer moves faster than camera (uncommon)

---

## Multi-Layer Backgrounds

### Basic Layer System

```typescript
interface ParallaxLayer {
  image: HTMLImageElement;
  x: number;
  y: number;
  parallaxX: number;  // Horizontal parallax ratio
  parallaxY: number;  // Vertical parallax ratio
  scrollSpeed: number; // Auto-scroll speed (optional)
}

class ParallaxBackground {
  private layers: ParallaxLayer[] = [];
  private cameraX: number = 0;
  private cameraY: number = 0;

  addLayer(
    image: HTMLImageElement,
    parallaxX: number,
    parallaxY: number = 0,
    scrollSpeed: number = 0
  ): void {
    this.layers.push({
      image,
      x: 0,
      y: 0,
      parallaxX,
      parallaxY,
      scrollSpeed
    });
  }

  update(cameraX: number, cameraY: number, deltaTime: number): void {
    this.cameraX = cameraX;
    this.cameraY = cameraY;

    // Update each layer
    for (const layer of this.layers) {
      // Calculate parallax offset
      layer.x = -cameraX * layer.parallaxX;
      layer.y = -cameraY * layer.parallaxY;

      // Auto-scroll
      if (layer.scrollSpeed !== 0) {
        layer.x += layer.scrollSpeed * deltaTime;
      }
    }
  }

  render(ctx: CanvasRenderingContext2D, viewportWidth: number, viewportHeight: number): void {
    for (const layer of this.layers) {
      ctx.drawImage(
        layer.image,
        layer.x,
        layer.y,
        viewportWidth,
        viewportHeight
      );
    }
  }
}
```

---

## Parallax Mathematics

### Calculating Layer Position

For a layer with parallax ratio `r`:

```
layerX = -cameraX * r
```

**Example:**
```typescript
// Camera at x = 1000
// Layer with parallax = 0.5

layerX = -1000 * 0.5 = -500

// The layer is offset by -500 pixels
// This makes it appear to move at half speed
```

### Depth-Based Parallax

Calculate parallax ratio from depth:

```typescript
function calculateParallaxRatio(depth: number, maxDepth: number): number {
  // depth: 0 = foreground, maxDepth = far background
  return 1 - (depth / maxDepth);
}

// Example with 5 layers
const layer1Parallax = calculateParallaxRatio(0, 5); // 1.0 (foreground)
const layer2Parallax = calculateParallaxRatio(1, 5); // 0.8
const layer3Parallax = calculateParallaxRatio(2, 5); // 0.6
const layer4Parallax = calculateParallaxRatio(3, 5); // 0.4
const layer5Parallax = calculateParallaxRatio(4, 5); // 0.2 (far back)
```

---

## Infinite Scrolling

### Repeating Backgrounds

Make backgrounds tile infinitely:

```typescript
class RepeatingParallaxLayer {
  private image: HTMLImageElement;
  private parallaxRatio: number;
  private imageWidth: number;
  private imageHeight: number;

  constructor(image: HTMLImageElement, parallaxRatio: number) {
    this.image = image;
    this.parallaxRatio = parallaxRatio;
    this.imageWidth = image.width;
    this.imageHeight = image.height;
  }

  render(
    ctx: CanvasRenderingContext2D,
    cameraX: number,
    cameraY: number,
    viewportWidth: number,
    viewportHeight: number
  ): void {
    // Calculate parallax offset
    const offsetX = -cameraX * this.parallaxRatio;
    const offsetY = -cameraY * this.parallaxRatio;

    // Calculate starting position (wrapped)
    const startX = Math.floor(offsetX / this.imageWidth) * this.imageWidth;
    const startY = Math.floor(offsetY / this.imageHeight) * this.imageHeight;

    // Draw tiles to cover viewport
    for (let x = startX; x < offsetX + viewportWidth; x += this.imageWidth) {
      for (let y = startY; y < offsetY + viewportHeight; y += this.imageHeight) {
        ctx.drawImage(this.image, x, y);
      }
    }
  }
}
```

### Seamless Tiling

Ensure your background images tile seamlessly:

```typescript
// Check if image tiles properly
function isSeamless(image: HTMLImageElement): boolean {
  // Image should be power of 2 for best tiling
  return (
    isPowerOfTwo(image.width) &&
    isPowerOfTwo(image.height)
  );
}

function isPowerOfTwo(n: number): boolean {
  return n > 0 && (n & (n - 1)) === 0;
}
```

---

## Vertical Parallax

### Supporting Y-Axis Parallax

Enable parallax on vertical scrolling:

```typescript
class FullParallaxLayer {
  private image: HTMLImageElement;
  private parallaxX: number;
  private parallaxY: number;

  constructor(
    image: HTMLImageElement,
    parallaxX: number,
    parallaxY: number
  ) {
    this.image = image;
    this.parallaxX = parallaxX;
    this.parallaxY = parallaxY;
  }

  render(
    ctx: CanvasRenderingContext2D,
    cameraX: number,
    cameraY: number,
    viewportWidth: number,
    viewportHeight: number
  ): void {
    const offsetX = -cameraX * this.parallaxX;
    const offsetY = -cameraY * this.parallaxY;

    // Calculate tiling
    const imgW = this.image.width;
    const imgH = this.image.height;

    const startX = Math.floor(offsetX / imgW) * imgW;
    const startY = Math.floor(offsetY / imgH) * imgH;

    const endX = offsetX + viewportWidth + imgW;
    const endY = offsetY + viewportHeight + imgH;

    // Draw tiled background
    for (let y = startY; y < endY; y += imgH) {
      for (let x = startX; x < endX; x += imgW) {
        ctx.drawImage(this.image, x, y);
      }
    }
  }
}
```

---

## Atmospheric Layers

### Clouds and Fog

Add atmospheric effects with auto-scrolling:

```typescript
class AtmosphericLayer {
  private image: HTMLImageElement;
  private x: number = 0;
  private y: number = 0;
  private scrollSpeedX: number;
  private scrollSpeedY: number;
  private parallaxRatio: number;
  private opacity: number;

  constructor(
    image: HTMLImageElement,
    scrollSpeedX: number,
    scrollSpeedY: number,
    parallaxRatio: number,
    opacity: number = 1.0
  ) {
    this.image = image;
    this.scrollSpeedX = scrollSpeedX;
    this.scrollSpeedY = scrollSpeedY;
    this.parallaxRatio = parallaxRatio;
    this.opacity = opacity;
  }

  update(cameraX: number, cameraY: number, deltaTime: number): void {
    // Camera-based parallax
    const parallaxX = -cameraX * this.parallaxRatio;
    const parallaxY = -cameraY * this.parallaxRatio;

    // Auto-scroll
    this.x = parallaxX + this.scrollSpeedX * performance.now() / 1000;
    this.y = parallaxY + this.scrollSpeedY * performance.now() / 1000;

    // Wrap coordinates
    this.x = this.x % this.image.width;
    this.y = this.y % this.image.height;
  }

  render(ctx: CanvasRenderingContext2D, width: number, height: number): void {
    ctx.save();
    ctx.globalAlpha = this.opacity;

    // Draw tiled
    const imgW = this.image.width;
    const imgH = this.image.height;

    for (let y = -imgH; y < height + imgH; y += imgH) {
      for (let x = -imgW; x < width + imgW; x += imgW) {
        ctx.drawImage(this.image, x + this.x, y + this.y);
      }
    }

    ctx.restore();
  }
}
```

### Sky Gradient

Create dynamic sky colors:

```typescript
class SkyGradient {
  private topColor: string;
  private bottomColor: string;

  constructor(topColor: string, bottomColor: string) {
    this.topColor = topColor;
    this.bottomColor = bottomColor;
  }

  render(ctx: CanvasRenderingContext2D, width: number, height: number): void {
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, this.topColor);
    gradient.addColorStop(1, this.bottomColor);

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
  }

  // Change colors over time (day/night cycle)
  setColors(topColor: string, bottomColor: string): void {
    this.topColor = topColor;
    this.bottomColor = bottomColor;
  }
}
```

---

## Performance Optimization

### Layer Culling

Only render visible layers:

```typescript
class OptimizedParallaxLayer {
  private visible: boolean = true;

  shouldRender(cameraX: number, viewportWidth: number): boolean {
    // Check if layer is in viewport
    const layerX = -cameraX * this.parallaxRatio;
    const layerRight = layerX + this.image.width;

    return layerRight > 0 && layerX < viewportWidth;
  }

  render(ctx: CanvasRenderingContext2D, /* ... */): void {
    if (!this.visible) return;
    if (!this.shouldRender(cameraX, viewportWidth)) return;

    // ... render layer
  }
}
```

### Cached Rendering

Pre-render complex layers to off-screen canvas:

```typescript
class CachedParallaxLayer {
  private image: HTMLImageElement;
  private cache: HTMLCanvasElement | null = null;
  private cacheCtx: CanvasRenderingContext2D | null = null;

  constructor(image: HTMLImageElement) {
    this.image = image;
    this.createCache();
  }

  private createCache(): void {
    this.cache = document.createElement('canvas');
    this.cache.width = this.image.width * 2;
    this.cache.height = this.image.height * 2;
    this.cacheCtx = this.cache.getContext('2d')!;

    // Pre-render tiled image
    for (let y = 0; y < 2; y++) {
      for (let x = 0; x < 2; x++) {
        this.cacheCtx.drawImage(
          this.image,
          x * this.image.width,
          y * this.image.height
        );
      }
    }
  }

  render(ctx: CanvasRenderingContext2D, x: number, y: number): void {
    if (!this.cache) return;

    // Use cached image instead of original
    ctx.drawImage(this.cache, x, y);
  }
}
```

### Reduce Draw Calls

Batch similar layers:

```typescript
class BatchedParallaxRenderer {
  private layers: ParallaxLayer[] = [];

  render(ctx: CanvasRenderingContext2D): void {
    // Group layers by parallax ratio
    const groups = new Map<number, ParallaxLayer[]>();

    for (const layer of this.layers) {
      const key = layer.parallaxRatio;
      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key)!.push(layer);
    }

    // Render each group with single transformation
    for (const [ratio, groupLayers] of groups) {
      ctx.save();
      const offset = -this.cameraX * ratio;
      ctx.translate(offset, 0);

      for (const layer of groupLayers) {
        ctx.drawImage(layer.image, 0, 0);
      }

      ctx.restore();
    }
  }
}
```

---

## Complete Implementation

### Full Parallax System

```typescript
class MarioParallaxSystem {
  private layers: Array<{
    canvas: HTMLCanvasElement;
    parallaxX: number;
    parallaxY: number;
    scrollSpeedX: number;
    scrollSpeedY: number;
    offsetX: number;
    offsetY: number;
  }> = [];

  private skyGradient: { top: string; bottom: string };

  constructor() {
    this.skyGradient = {
      top: '#87CEEB',    // Sky blue
      bottom: '#E0F6FF'  // Light blue
    };
  }

  addLayer(
    image: HTMLImageElement,
    parallaxX: number,
    parallaxY: number = 0,
    scrollSpeedX: number = 0,
    scrollSpeedY: number = 0
  ): void {
    // Create off-screen canvas for this layer
    const canvas = document.createElement('canvas');
    canvas.width = image.width;
    canvas.height = image.height;
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(image, 0, 0);

    this.layers.push({
      canvas,
      parallaxX,
      parallaxY,
      scrollSpeedX,
      scrollSpeedY,
      offsetX: 0,
      offsetY: 0
    });
  }

  update(cameraX: number, cameraY: number, deltaTime: number): void {
    const time = performance.now() / 1000;

    for (const layer of this.layers) {
      // Calculate parallax offset
      layer.offsetX = -cameraX * layer.parallaxX;
      layer.offsetY = -cameraY * layer.parallaxY;

      // Add auto-scroll
      layer.offsetX += layer.scrollSpeedX * time;
      layer.offsetY += layer.scrollSpeedY * time;
    }
  }

  render(
    ctx: CanvasRenderingContext2D,
    viewportWidth: number,
    viewportHeight: number
  ): void {
    // Draw sky gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, viewportHeight);
    gradient.addColorStop(0, this.skyGradient.top);
    gradient.addColorStop(1, this.skyGradient.bottom);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, viewportWidth, viewportHeight);

    // Draw each parallax layer
    for (const layer of this.layers) {
      this.renderLayer(ctx, layer, viewportWidth, viewportHeight);
    }
  }

  private renderLayer(
    ctx: CanvasRenderingContext2D,
    layer: any,
    viewportWidth: number,
    viewportHeight: number
  ): void {
    const imgW = layer.canvas.width;
    const imgH = layer.canvas.height;

    // Calculate wrapping
    const x = ((layer.offsetX % imgW) + imgW) % imgW;
    const y = ((layer.offsetY % imgH) + imgH) % imgH;

    // Draw tiled to cover viewport
    for (let dy = -imgH; dy < viewportHeight + imgH; dy += imgH) {
      for (let dx = -imgW; dx < viewportWidth + imgW; dx += imgW) {
        ctx.drawImage(layer.canvas, dx - x, dy - y);
      }
    }
  }

  setSkyColors(top: string, bottom: string): void {
    this.skyGradient.top = top;
    this.skyGradient.bottom = bottom;
  }
}
```

---

## Summary

You've learned:
1. **Parallax basics** - depth through different scroll speeds
2. **Multi-layer backgrounds** - organizing multiple parallax layers
3. **Parallax mathematics** - calculating layer positions
4. **Infinite scrolling** - repeating backgrounds seamlessly
5. **Vertical parallax** - Y-axis depth
6. **Atmospheric layers** - clouds, fog, auto-scrolling
7. **Performance optimization** - culling, caching, batching

Parallax creates beautiful depth and atmosphere in 2D games!

## Next Steps

You've completed all topics in Unit 04! Review the unit-level files and move on to Unit 05: Gameplay & AI!

Practice exercises are in `b-exercises.md`.
