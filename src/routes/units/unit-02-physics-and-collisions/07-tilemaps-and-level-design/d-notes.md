# Tilemaps & Level Design - Quick Notes

## Basic Tilemap Structure

```typescript
class Tilemap {
  data: number[][];
  tileSize = 32;
  
  constructor(data: number[][]) {
    this.data = data;
  }
  
  getTile(col: number, row: number): number {
    if (row < 0 || row >= this.data.length || 
        col < 0 || col >= this.data[0].length) {
      return -1;
    }
    return this.data[row][col];
  }
}
```

---

## World ↔ Grid Conversion

```typescript
// World to Grid
const col = Math.floor(worldX / tileSize);
const row = Math.floor(worldY / tileSize);

// Grid to World
const worldX = col * tileSize;
const worldY = row * tileSize;
```

---

## Player Grid Bounds

```typescript
const leftTile = Math.floor(player.left / tileSize);
const rightTile = Math.floor(player.right / tileSize);
const topTile = Math.floor(player.top / tileSize);
const bottomTile = Math.floor(player.bottom / tileSize);

// Only check these tiles!
for (let row = topTile; row <= bottomTile; row++) {
  for (let col = leftTile; col <= rightTile; col++) {
    // Check collision
  }
}
```

---

## Tilemap Collision (X-Axis)

```typescript
resolveTilemapCollisionX(tilemap: Tilemap): void {
  const leftTile = Math.floor(this.left / tilemap.tileSize);
  const rightTile = Math.floor(this.right / tilemap.tileSize);
  const topTile = Math.floor(this.top / tilemap.tileSize);
  const bottomTile = Math.floor(this.bottom / tilemap.tileSize);
  
  for (let row = topTile; row <= bottomTile; row++) {
    for (let col = leftTile; col <= rightTile; col++) {
      if (tilemap.getTile(col, row) === 1) {
        const tileLeft = col * tilemap.tileSize;
        const tileRight = (col + 1) * tilemap.tileSize;
        
        const overlapLeft = this.right - tileLeft;
        const overlapRight = tileRight - this.left;
        
        if (overlapLeft < overlapRight) {
          this.x = tileLeft - this.width / 2;
        } else {
          this.x = tileRight + this.width / 2;
        }
        this.velocityX = 0;
      }
    }
  }
}
```

---

## Tilemap Collision (Y-Axis)

```typescript
resolveTilemapCollisionY(tilemap: Tilemap): void {
  const leftTile = Math.floor(this.left / tilemap.tileSize);
  const rightTile = Math.floor(this.right / tilemap.tileSize);
  const topTile = Math.floor(this.top / tilemap.tileSize);
  const bottomTile = Math.floor(this.bottom / tilemap.tileSize);
  
  for (let row = topTile; row <= bottomTile; row++) {
    for (let col = leftTile; col <= rightTile; col++) {
      if (tilemap.getTile(col, row) === 1) {
        const tileTop = row * tilemap.tileSize;
        const tileBottom = (row + 1) * tilemap.tileSize;
        
        const overlapTop = this.bottom - tileTop;
        const overlapBottom = tileBottom - this.top;
        
        if (overlapTop < overlapBottom) {
          this.y = tileTop - this.height / 2;
          this.velocityY = 0;
          this.isGrounded = true;
        } else {
          this.y = tileBottom + this.height / 2;
          this.velocityY = 0;
        }
      }
    }
  }
}
```

---

## Camera Follow

```typescript
class Camera {
  x = 0;
  y = 0;
  
  follow(
    target: Player,
    canvasW: number,
    canvasH: number,
    levelW: number,
    levelH: number
  ): void {
    this.x = target.x - canvasW / 2;
    this.y = target.y - canvasH / 2;
    
    this.x = Math.max(0, Math.min(this.x, levelW - canvasW));
    this.y = Math.max(0, Math.min(this.y, levelH - canvasH));
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

## Tile Types

```typescript
const TILE_TYPES = {
  EMPTY: 0,
  SOLID: 1,
  ONE_WAY: 2,
  DAMAGING: 3,
  BOUNCY: 4,
  COIN: 5,
};
```

---

## Level Data Template

```typescript
const level = [
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,1,1,1,0,0,1],
  [1,0,0,0,1,1,1,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
];
```

---

## Update Order

```typescript
1. Move player horizontally
2. Resolve X collision with tilemap
3. Apply gravity
4. Move player vertically
5. Resolve Y collision with tilemap (sets isGrounded)
6. Check special tile effects (coins, damage, etc.)
```

---

## Quick Tips

- **Player size**: Make slightly smaller than tile (28 instead of 32)
- **Only check nearby**: Use player bounds to limit tile checks
- **Separate axes**: Always resolve X and Y collision separately
- **Camera bounds**: Clamp camera to prevent showing outside level
- **Visual clarity**: Use distinct colors for different tile types
