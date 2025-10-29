# Sprite Rendering - Quick Notes

## Load Image

```typescript
const img = await new Promise<HTMLImageElement>((resolve) => {
    const i = new Image();
    i.onload = () => resolve(i);
    i.src = 'sprite.png';
});
```

## Draw Image (9 params)

```typescript
ctx.drawImage(
    image,
    sx, sy, sw, sh,  // Source (from sheet)
    dx, dy, dw, dh   // Destination (on canvas)
);
```

## Sprite Class

```typescript
class Sprite {
    constructor(img, fx, fy, fw, fh) { ... }
    draw(ctx, x, y, w, h) {
        ctx.drawImage(this.img, this.fx, this.fy, this.fw, this.fh, x, y, w, h);
    }
}
```

## Flip Sprite

```typescript
ctx.save();
ctx.translate(x + w, y);
ctx.scale(-1, 1);
sprite.draw(ctx, 0, 0, w, h);
ctx.restore();
```

## Pixel Perfect

```typescript
ctx.imageSmoothingEnabled = false;
```

## Common Values

```
Mario sprite: 32x48px
Tile size: 32x32px
Enemy size: 32x32px
```
