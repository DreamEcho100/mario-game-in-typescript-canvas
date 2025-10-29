# Tilemaps & Level Design - Solutions

## Solution 1: Basic Tilemap ⭐

```typescript
class Tilemap {
  data: number[][];
  tileSize: number;
  
  constructor(data: number[][], tileSize: number = 32) {
    this.data = data;
    this.tileSize = tileSize;
  }
  
  draw(ctx: CanvasRenderingContext2D): void {
    for (let row = 0; row < this.data.length; row++) {
      for (let col = 0; col < this.data[row].length; col++) {
        const tile = this.data[row][col];
        
        const x = col * this.tileSize;
        const y = row * this.tileSize;
        
        if (tile === 1) {
          ctx.fillStyle = '#795548';
          ctx.fillRect(x, y, this.tileSize, this.tileSize);
          
          ctx.strokeStyle = '#5D4037';
          ctx.lineWidth = 2;
          ctx.strokeRect(x, y, this.tileSize, this.tileSize);
        }
      }
    }
  }
}

// Level data
const levelData = [
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
];

const tilemap = new Tilemap(levelData, 32);

function draw(): void {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  tilemap.draw(ctx);
  requestAnimationFrame(draw);
}
```

---

## Solution 3: Tilemap Collision Detection ⭐⭐

```typescript
class Player {
  x: number;
  y: number;
  width = 28;
  height = 28;
  velocityX = 0;
  velocityY = 0;
  
  readonly MOVE_SPEED = 200;
  
  get left() { return this.x - this.width / 2; }
  get right() { return this.x + this.width / 2; }
  get top() { return this.y - this.height / 2; }
  get bottom() { return this.y + this.height / 2; }
  
  update(dt: number, tilemap: Tilemap, input: any): void {
    const dtSec = dt / 1000;
    
    // Horizontal movement
    this.velocityX = 0;
    if (input.left) this.velocityX = -this.MOVE_SPEED;
    if (input.right) this.velocityX = this.MOVE_SPEED;
    
    this.x += this.velocityX * dtSec;
    this.resolveTilemapCollisionX(tilemap);
    
    // Vertical movement
    this.velocityY = 0;
    if (input.up) this.velocityY = -this.MOVE_SPEED;
    if (input.down) this.velocityY = this.MOVE_SPEED;
    
    this.y += this.velocityY * dtSec;
    this.resolveTilemapCollisionY(tilemap);
  }
  
  resolveTilemapCollisionX(tilemap: Tilemap): void {
    const leftTile = Math.floor(this.left / tilemap.tileSize);
    const rightTile = Math.floor(this.right / tilemap.tileSize);
    const topTile = Math.floor(this.top / tilemap.tileSize);
    const bottomTile = Math.floor(this.bottom / tilemap.tileSize);
    
    for (let row = topTile; row <= bottomTile; row++) {
      for (let col = leftTile; col <= rightTile; col++) {
        const tile = tilemap.getTile(col, row);
        
        if (tile === 1) { // Solid
          const tileLeft = col * tilemap.tileSize;
          const tileRight = (col + 1) * tilemap.tileSize;
          
          const overlapLeft = this.right - tileLeft;
          const overlapRight = tileRight - this.left;
          
          if (overlapLeft < overlapRight) {
            this.x = tileLeft - this.width / 2;
          } else {
            this.x = tileRight + this.width / 2;
          }
        }
      }
    }
  }
  
  resolveTilemapCollisionY(tilemap: Tilemap): void {
    const leftTile = Math.floor(this.left / tilemap.tileSize);
    const rightTile = Math.floor(this.right / tilemap.tileSize);
    const topTile = Math.floor(this.top / tilemap.tileSize);
    const bottomTile = Math.floor(this.bottom / tilemap.tileSize);
    
    for (let row = topTile; row <= bottomTile; row++) {
      for (let col = leftTile; col <= rightTile; col++) {
        const tile = tilemap.getTile(col, row);
        
        if (tile === 1) {
          const tileTop = row * tilemap.tileSize;
          const tileBottom = (row + 1) * tilemap.tileSize;
          
          const overlapTop = this.bottom - tileTop;
          const overlapBottom = tileBottom - this.top;
          
          if (overlapTop < overlapBottom) {
            this.y = tileTop - this.height / 2;
          } else {
            this.y = tileBottom + this.height / 2;
          }
        }
      }
    }
  }
}

class Tilemap {
  getTile(col: number, row: number): number {
    if (row < 0 || row >= this.data.length || col < 0 || col >= this.data[0].length) {
      return -1;
    }
    return this.data[row][col];
  }
}
```

---

## Solution 4: Gravity in Tilemap ⭐⭐

```typescript
class Player {
  readonly GRAVITY = 1400;
  readonly JUMP_FORCE = -450;
  isGrounded = false;
  
  update(dt: number, tilemap: Tilemap, input: any): void {
    const dtSec = dt / 1000;
    
    // Horizontal
    this.velocityX = 0;
    if (input.left) this.velocityX = -this.MOVE_SPEED;
    if (input.right) this.velocityX = this.MOVE_SPEED;
    this.x += this.velocityX * dtSec;
    this.resolveTilemapCollisionX(tilemap);
    
    // Gravity
    this.velocityY += this.GRAVITY * dtSec;
    this.y += this.velocityY * dtSec;
    
    this.isGrounded = false;
    this.resolveTilemapCollisionY(tilemap);
    
    // Jump
    if (input.jump && this.isGrounded) {
      this.velocityY = this.JUMP_FORCE;
    }
  }
  
  resolveTilemapCollisionY(tilemap: Tilemap): void {
    // ... existing code ...
    
    if (tile === 1) {
      const tileTop = row * tilemap.tileSize;
      const tileBottom = (row + 1) * tilemap.tileSize;
      
      const overlapTop = this.bottom - tileTop;
      const overlapBottom = tileBottom - this.top;
      
      if (overlapTop < overlapBottom) {
        this.y = tileTop - this.height / 2;
        this.velocityY = 0;
        this.isGrounded = true;  // Set grounded!
      } else {
        this.y = tileBottom + this.height / 2;
        this.velocityY = 0;
      }
    }
  }
}
```

---

## Solution 6: Camera Following ⭐⭐

```typescript
class Camera {
  x = 0;
  y = 0;
  
  follow(
    target: Player, 
    canvasWidth: number, 
    canvasHeight: number, 
    levelWidth: number, 
    levelHeight: number
  ): void {
    // Center on player
    this.x = target.x - canvasWidth / 2;
    this.y = target.y - canvasHeight / 2;
    
    // Clamp to level bounds
    this.x = Math.max(0, Math.min(this.x, levelWidth - canvasWidth));
    this.y = Math.max(0, Math.min(this.y, levelHeight - canvasHeight));
  }
  
  apply(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    ctx.translate(-this.x, -this.y);
  }
  
  restore(ctx: CanvasRenderingContext2D): void {
    ctx.restore();
  }
}

// Usage
const camera = new Camera();

function gameLoop(dt: number): void {
  player.update(dt, tilemap, input);
  
  const levelWidth = tilemap.data[0].length * tilemap.tileSize;
  const levelHeight = tilemap.data.length * tilemap.tileSize;
  camera.follow(player, canvas.width, canvas.height, levelWidth, levelHeight);
  
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  camera.apply(ctx);
  tilemap.draw(ctx);
  player.draw(ctx);
  camera.restore(ctx);
}
```

---

## Solution 7: Different Tile Types ⭐⭐⭐

```typescript
const TILE_TYPES = {
  EMPTY: 0,
  SOLID: 1,
  ONE_WAY: 2,
  DAMAGING: 3,
  BOUNCY: 4,
};

class Tilemap {
  draw(ctx: CanvasRenderingContext2D): void {
    for (let row = 0; row < this.data.length; row++) {
      for (let col = 0; col < this.data[row].length; col++) {
        const tile = this.data[row][col];
        const x = col * this.tileSize;
        const y = row * this.tileSize;
        
        switch (tile) {
          case TILE_TYPES.SOLID:
            ctx.fillStyle = '#795548';
            ctx.fillRect(x, y, this.tileSize, this.tileSize);
            break;
          case TILE_TYPES.ONE_WAY:
            ctx.fillStyle = '#FFA726';
            ctx.fillRect(x, y, this.tileSize, 8);
            break;
          case TILE_TYPES.DAMAGING:
            ctx.fillStyle = '#F44336';
            ctx.fillRect(x, y, this.tileSize, this.tileSize);
            // Spikes
            for (let i = 0; i < 4; i++) {
              ctx.fillStyle = '#C62828';
              ctx.beginPath();
              ctx.moveTo(x + i * 8, y + this.tileSize);
              ctx.lineTo(x + i * 8 + 4, y + this.tileSize - 8);
              ctx.lineTo(x + i * 8 + 8, y + this.tileSize);
              ctx.fill();
            }
            break;
          case TILE_TYPES.BOUNCY:
            ctx.fillStyle = '#4CAF50';
            ctx.fillRect(x, y, this.tileSize, this.tileSize);
            break;
        }
      }
    }
  }
}

class Player {
  health = 3;
  
  resolveTilemapCollisionY(tilemap: Tilemap): void {
    // ... existing code ...
    
    const tile = tilemap.getTile(col, row);
    
    if (tile === TILE_TYPES.SOLID) {
      // Normal collision
    } else if (tile === TILE_TYPES.ONE_WAY) {
      // Only collide from top
      if (this.velocityY >= 0 && this.bottom - this.velocityY * dtSec <= tileTop + 5) {
        this.y = tileTop - this.height / 2;
        this.velocityY = 0;
        this.isGrounded = true;
      }
    } else if (tile === TILE_TYPES.DAMAGING) {
      this.takeDamage();
    } else if (tile === TILE_TYPES.BOUNCY) {
      if (overlapTop < overlapBottom) {
        this.y = tileTop - this.height / 2;
        this.velocityY = -600; // Bounce!
      }
    }
  }
  
  takeDamage(): void {
    this.health--;
    if (this.health <= 0) {
      this.respawn();
    }
  }
}
```

---

## Solution 8: Collectibles in Tilemap ⭐⭐⭐

```typescript
const TILE_TYPES = {
  // ... existing ...
  COIN: 5,
};

class Game {
  coinsCollected = 0;
  totalCoins = 0;
  
  constructor() {
    this.countCoins();
  }
  
  countCoins(): void {
    for (let row = 0; row < this.tilemap.data.length; row++) {
      for (let col = 0; col < this.tilemap.data[row].length; col++) {
        if (this.tilemap.data[row][col] === TILE_TYPES.COIN) {
          this.totalCoins++;
        }
      }
    }
  }
  
  update(dt: number): void {
    player.update(dt, this.tilemap, input);
    this.checkCoinCollection();
    
    if (this.coinsCollected === this.totalCoins) {
      this.win();
    }
  }
  
  checkCoinCollection(): void {
    const leftTile = Math.floor(player.left / this.tilemap.tileSize);
    const rightTile = Math.floor(player.right / this.tilemap.tileSize);
    const topTile = Math.floor(player.top / this.tilemap.tileSize);
    const bottomTile = Math.floor(player.bottom / this.tilemap.tileSize);
    
    for (let row = topTile; row <= bottomTile; row++) {
      for (let col = leftTile; col <= rightTile; col++) {
        if (this.tilemap.getTile(col, row) === TILE_TYPES.COIN) {
          this.tilemap.data[row][col] = TILE_TYPES.EMPTY;
          this.coinsCollected++;
        }
      }
    }
  }
}

// Draw coin
if (tile === TILE_TYPES.COIN) {
  ctx.fillStyle = '#FFD700';
  ctx.beginPath();
  ctx.arc(
    x + this.tileSize / 2, 
    y + this.tileSize / 2, 
    this.tileSize / 3, 
    0, Math.PI * 2
  );
  ctx.fill();
}
```

---

## Solution 9: Level Editor ⭐⭐⭐

```typescript
let selectedTile = 1;
let isEditorMode = true;

canvas.addEventListener('click', (e) => {
  if (!isEditorMode) return;
  
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left + camera.x;
  const y = e.clientY - rect.top + camera.y;
  
  const col = Math.floor(x / tilemap.tileSize);
  const row = Math.floor(y / tilemap.tileSize);
  
  if (row >= 0 && row < tilemap.data.length && col >= 0 && col < tilemap.data[0].length) {
    tilemap.data[row][col] = selectedTile;
  }
});

window.addEventListener('keydown', (e) => {
  if (e.key >= '0' && e.key <= '9') {
    selectedTile = parseInt(e.key);
  }
  
  if (e.key === 's' && e.ctrlKey) {
    e.preventDefault();
    saveLevel();
  }
  
  if (e.key === 'l' && e.ctrlKey) {
    e.preventDefault();
    loadLevel();
  }
});

function saveLevel(): void {
  const json = JSON.stringify(tilemap.data);
  localStorage.setItem('level', json);
  console.log('Level saved!');
}

function loadLevel(): void {
  const json = localStorage.getItem('level');
  if (json) {
    tilemap.data = JSON.parse(json);
    console.log('Level loaded!');
  }
}
```

---

## Key Takeaways

1. **World ↔ Grid**: Always convert between coordinate systems
2. **Only check nearby tiles**: Optimize collision detection
3. **Separate X/Y**: Resolve collisions on each axis separately
4. **Tile properties**: Use different behaviors for different tiles
5. **Camera**: Essential for levels larger than screen
