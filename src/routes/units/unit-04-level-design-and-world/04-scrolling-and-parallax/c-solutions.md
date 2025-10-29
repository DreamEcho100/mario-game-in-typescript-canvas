# Topic 04: Scrolling and Parallax - Solutions

Complete solutions for all parallax exercises.

---

## Exercise 1 Solution: Basic Parallax Layer

```typescript
class ParallaxLayer {
  private image: HTMLImageElement;
  private parallaxRatio: number;

  constructor(image: HTMLImageElement, parallaxRatio: number) {
    this.image = image;
    this.parallaxRatio = parallaxRatio;
  }

  render(ctx: CanvasRenderingContext2D, cameraX: number): void {
    const offsetX = -cameraX * this.parallaxRatio;
    ctx.drawImage(this.image, offsetX, 0);
  }
}

// Usage
const bgImage = new Image();
bgImage.src = 'mountains.png';
const layer = new ParallaxLayer(bgImage, 0.5);

// In game loop
layer.render(ctx, camera.x);
```

---

## Exercise 2 Solution: Multi-Layer Parallax

```typescript
class MultiLayerParallax {
  private layers: Array<{
    image: HTMLImageElement;
    ratio: number;
  }> = [];

  addLayer(image: HTMLImageElement, ratio: number): void {
    this.layers.push({ image, ratio });
  }

  render(ctx: CanvasRenderingContext2D, cameraX: number): void {
    // Render from back to front
    for (const layer of this.layers) {
      const offsetX = -cameraX * layer.ratio;
      ctx.drawImage(layer.image, offsetX, 0);
    }
  }
}

// Setup
const parallax = new MultiLayerParallax();
parallax.addLayer(farMountains, 0.2);
parallax.addLayer(midTrees, 0.5);
parallax.addLayer(nearRocks, 0.8);
```

---

## Exercise 3 Solution: Repeating Background

```typescript
class RepeatingParallaxLayer {
  private image: HTMLImageElement;
  private parallaxRatio: number;

  render(
    ctx: CanvasRenderingContext2D,
    cameraX: number,
    viewportWidth: number
  ): void {
    const offsetX = -cameraX * this.parallaxRatio;
    const imgWidth = this.image.width;

    // Calculate start position
    const startX = Math.floor(offsetX / imgWidth) * imgWidth;

    // Draw tiles
    for (let x = startX; x < offsetX + viewportWidth; x += imgWidth) {
      ctx.drawImage(this.image, x, 0);
    }
  }
}
```

---

## Exercise 4 Solution: Vertical Parallax

```typescript
class FullParallaxLayer {
  private image: HTMLImageElement;
  private parallaxX: number;
  private parallaxY: number;

  render(
    ctx: CanvasRenderingContext2D,
    cameraX: number,
    cameraY: number,
    viewportWidth: number,
    viewportHeight: number
  ): void {
    const offsetX = -cameraX * this.parallaxX;
    const offsetY = -cameraY * this.parallaxY;

    const imgW = this.image.width;
    const imgH = this.image.height;

    const startX = Math.floor(offsetX / imgW) * imgW;
    const startY = Math.floor(offsetY / imgH) * imgH;

    for (let y = startY; y < offsetY + viewportHeight + imgH; y += imgH) {
      for (let x = startX; x < offsetX + viewportWidth + imgW; x += imgW) {
        ctx.drawImage(this.image, x, y);
      }
    }
  }
}
```

---

## Exercise 5 Solution: Auto-Scrolling Clouds

```typescript
class CloudLayer {
  private image: HTMLImageElement;
  private scrollSpeed: number = 20;
  private offsetX: number = 0;

  update(deltaTime: number): void {
    this.offsetX += this.scrollSpeed * deltaTime;
    this.offsetX %= this.image.width;
  }

  render(ctx: CanvasRenderingContext2D, width: number): void {
    const imgW = this.image.width;
    const x = -this.offsetX;

    for (let dx = x; dx < width + imgW; dx += imgW) {
      ctx.drawImage(this.image, dx, 0);
    }
  }
}
```

---

## Exercise 6 Solution: Sky Gradient

```typescript
class SkyGradient {
  private topColor: string = '#87CEEB';
  private bottomColor: string = '#E0F6FF';

  render(ctx: CanvasRenderingContext2D, width: number, height: number): void {
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, this.topColor);
    gradient.addColorStop(1, this.bottomColor);

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
  }

  setColors(top: string, bottom: string): void {
    this.topColor = top;
    this.bottomColor = bottom;
  }
}
```

---

## Exercise 7 Solution: Atmospheric Fog

```typescript
class FogLayer {
  private image: HTMLImageElement;
  private opacity: number = 0.5;
  private scrollSpeed: number = 10;
  private offsetX: number = 0;

  update(deltaTime: number): void {
    this.offsetX += this.scrollSpeed * deltaTime;
    this.offsetX %= this.image.width;
  }

  render(ctx: CanvasRenderingContext2D, width: number, height: number): void {
    ctx.save();
    ctx.globalAlpha = this.opacity;

    const imgW = this.image.width;
    const x = -this.offsetX;

    for (let dx = x; dx < width + imgW; dx += imgW) {
      ctx.drawImage(this.image, dx, 0, width, height);
    }

    ctx.restore();
  }
}
```

---

## Exercise 8 Solution: Complete Mario Parallax

See `a-lesson.md` for the complete `MarioParallaxSystem` implementation with all features.

---

## Exercise 9 Solution: Performance Optimization

```typescript
class OptimizedParallaxLayer {
  private image: HTMLImageElement;
  private cache: HTMLCanvasElement;

  constructor(image: HTMLImageElement) {
    this.image = image;
    this.cache = this.createCache();
  }

  private createCache(): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    canvas.width = this.image.width * 2;
    canvas.height = this.image.height;
    const ctx = canvas.getContext('2d')!;

    // Pre-render 2 copies for seamless tiling
    ctx.drawImage(this.image, 0, 0);
    ctx.drawImage(this.image, this.image.width, 0);

    return canvas;
  }

  render(ctx: CanvasRenderingContext2D, offsetX: number): void {
    ctx.drawImage(this.cache, offsetX, 0);
  }
}
```

---

## Exercise 10 Solution: Day/Night Cycle

```typescript
class DayNightCycle {
  private time: number = 0;
  private cycleLength: number = 60; // 60 seconds per cycle

  update(deltaTime: number): void {
    this.time += deltaTime;
    if (this.time >= this.cycleLength) {
      this.time = 0;
    }
  }

  getSkyColors(): { top: string; bottom: string } {
    const t = this.time / this.cycleLength;

    if (t < 0.25) {
      // Dawn
      return { top: '#FF6B6B', bottom: '#FFD93D' };
    } else if (t < 0.5) {
      // Day
      return { top: '#87CEEB', bottom: '#E0F6FF' };
    } else if (t < 0.75) {
      // Dusk
      return { top: '#FF8C42', bottom: '#FFA07A' };
    } else {
      // Night
      return { top: '#0F2027', bottom: '#203A43' };
    }
  }
}
```

---

## Performance Tips

- Pre-render to off-screen canvas
- Cache tiled layers
- Use requestAnimationFrame
- Cull off-screen layers
- Batch similar draw calls
- Use power-of-2 image sizes
