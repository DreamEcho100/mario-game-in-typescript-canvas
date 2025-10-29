# Sprite Rendering - Solutions

## Solution 1: Load and Draw Single Sprite ⭐

```typescript
async function loadAndDrawSprite() {
    const sprite = await new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error('Failed to load'));
        img.src = 'mario.png';
    });
    
    ctx.drawImage(sprite, 100, 100);
}
```

## Solution 3: Create Sprite Class ⭐⭐

```typescript
class Sprite {
    constructor(
        public image: HTMLImageElement,
        public frameX: number,
        public frameY: number,
        public frameWidth: number,
        public frameHeight: number
    ) {}
    
    draw(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number): void {
        ctx.drawImage(
            this.image,
            this.frameX, this.frameY, this.frameWidth, this.frameHeight,
            x, y, w, h
        );
    }
}
```

## Solution 4: Horizontal Flip ⭐⭐

```typescript
function drawFlipped(ctx: CanvasRenderingContext2D, sprite: Sprite, x: number, y: number, flip: boolean) {
    ctx.save();
    if (flip) {
        ctx.translate(x + 32, y);
        ctx.scale(-1, 1);
        sprite.draw(ctx, 0, 0, 32, 48);
    } else {
        sprite.draw(ctx, x, y, 32, 48);
    }
    ctx.restore();
}
```

See lesson for complete implementations!
