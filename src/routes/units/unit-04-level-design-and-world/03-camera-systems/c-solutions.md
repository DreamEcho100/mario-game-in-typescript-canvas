# Topic 03: Camera Systems - Solutions

Complete solutions for all camera exercises.

---

## Exercise 1 Solution: Simple Following Camera

```typescript
class SimpleCamera {
  x: number = 0;
  y: number = 0;
  width: number;
  height: number;

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
  }

  follow(target: { x: number; y: number; width: number; height: number }): void {
    this.x = target.x + target.width / 2 - this.width / 2;
    this.y = target.y + target.height / 2 - this.height / 2;
  }

  apply(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    ctx.translate(-this.x, -this.y);
  }

  restore(ctx: CanvasRenderingContext2D): void {
    ctx.restore();
  }
}
```

---

## Exercise 2 Solution: Bounded Camera

```typescript
class BoundedCamera extends SimpleCamera {
  minX: number = 0;
  minY: number = 0;
  maxX: number;
  maxY: number;

  constructor(width: number, height: number, worldWidth: number, worldHeight: number) {
    super(width, height);
    this.maxX = Math.max(0, worldWidth - width);
    this.maxY = Math.max(0, worldHeight - height);
  }

  follow(target: { x: number; y: number; width: number; height: number }): void {
    super.follow(target);
    this.x = Math.max(this.minX, Math.min(this.x, this.maxX));
    this.y = Math.max(this.minY, Math.min(this.y, this.maxY));
  }
}
```

---

## Exercise 3 Solution: Smooth Camera

```typescript
class SmoothCamera extends BoundedCamera {
  private targetX: number = 0;
  private targetY: number = 0;
  private smoothness: number = 0.1;

  update(target: any, deltaTime: number): void {
    this.targetX = target.x + target.width / 2 - this.width / 2;
    this.targetY = target.y + target.height / 2 - this.height / 2;

    this.targetX = Math.max(this.minX, Math.min(this.targetX, this.maxX));
    this.targetY = Math.max(this.minY, Math.min(this.targetY, this.maxY));

    const lerpFactor = 1 - Math.pow(1 - this.smoothness, deltaTime * 60);
    this.x += (this.targetX - this.x) * lerpFactor;
    this.y += (this.targetY - this.y) * lerpFactor;
  }

  snap(target: any): void {
    this.targetX = target.x + target.width / 2 - this.width / 2;
    this.targetY = target.y + target.height / 2 - this.height / 2;
    this.x = Math.max(this.minX, Math.min(this.targetX, this.maxX));
    this.y = Math.max(this.minY, Math.min(this.targetY, this.maxY));
  }
}
```

---

## More Solutions

See `a-lesson.md` for complete implementations of:
- Deadzone Camera
- Look-Ahead Camera
- Camera Shake
- Complete Mario Camera System

---

## Performance Tips

- Round camera position: `Math.round(this.x)`
- Use visibility culling: Only draw visible entities
- Cache world-to-screen conversions
- Profile with 100+ entities
