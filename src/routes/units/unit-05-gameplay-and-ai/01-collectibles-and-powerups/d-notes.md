# Topic 01: Collectibles and Power-ups - Quick Reference

---

## Basic Collectible

```typescript
class Coin {
  x: number;
  y: number;
  collected: boolean = false;
  value: number = 10;
  
  checkCollision(player: Player): boolean {
    return AABB(this, player);
  }
}
```

---

## Collision Detection

```typescript
function AABB(a: Entity, b: Entity): boolean {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}
```

---

## Power-up States

```typescript
enum PowerState {
  Small,   // Default
  Big,     // Mushroom
  Fire     // Fire Flower
}
```

**State Transitions:**
```
Small → Mushroom → Big
Big → Fire Flower → Fire
Fire → Damage → Big
Big → Damage → Small
Small → Damage → Death
```

---

## Spawn Animation

```typescript
class PowerUp {
  spawning: boolean = true;
  spawnY: number;
  
  update(dt: number) {
    if (this.spawning) {
      this.y -= 50 * dt;
      if (this.y <= this.spawnY) {
        this.spawning = false;
      }
    }
  }
}
```

---

## Score Popup

```typescript
class ScorePopup {
  age: number = 0;
  lifetime: number = 0.5;
  
  update(dt: number): boolean {
    this.age += dt;
    this.y -= 30 * dt; // Float up
    return this.age < this.lifetime;
  }
  
  render(ctx: CanvasRenderingContext2D) {
    const alpha = 1 - (this.age / this.lifetime);
    ctx.globalAlpha = alpha;
    ctx.fillText(this.text, this.x, this.y);
  }
}
```

---

## Item Block

```typescript
class ItemBlock {
  isEmpty: boolean = false;
  bounceOffset: number = 0;
  itemType: PowerUpType;
  
  hit() {
    if (!this.isEmpty) {
      this.isEmpty = true;
      this.bouncing = true;
      this.spawnItem();
    }
  }
}
```

---

## Combo System

```typescript
class ComboSystem {
  combo: number = 0;
  comboTime: number = 0;
  timeout: number = 3.0;
  
  addCoin(value: number): number {
    this.combo++;
    this.comboTime = this.timeout;
    return value * Math.min(this.combo, 5);
  }
  
  update(dt: number) {
    this.comboTime -= dt;
    if (this.comboTime <= 0) {
      this.combo = 0;
    }
  }
}
```

---

## Particle Effect

```typescript
class Particle {
  vx: number;
  vy: number;
  lifetime: number;
  age: number = 0;
  
  update(dt: number): boolean {
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.age += dt;
    return this.age < this.lifetime;
  }
}

// Create burst
for (let i = 0; i < 8; i++) {
  const angle = (i / 8) * Math.PI * 2;
  particles.push(new Particle(
    x, y,
    Math.cos(angle) * 100,
    Math.sin(angle) * 100
  ));
}
```

---

## Star Power

```typescript
class Player {
  starPower: boolean = false;
  starTime: number = 0;
  
  activateStar() {
    this.starPower = true;
    this.starTime = 10.0; // 10 seconds
  }
  
  update(dt: number) {
    if (this.starPower) {
      this.starTime -= dt;
      if (this.starTime <= 0) {
        this.starPower = false;
      }
    }
  }
}
```

---

## Common Values

| Item | Value | Speed |
|------|-------|-------|
| Bronze Coin | 10 | 0 |
| Silver Coin | 50 | 0 |
| Gold Coin | 100 | 0 |
| Mushroom | - | 50 px/s |
| Fire Flower | - | 0 |
| Star | - | 100 px/s |

| Power State | Height | Abilities |
|-------------|--------|-----------|
| Small | 32px | Basic jump |
| Big | 48px | Break blocks |
| Fire | 48px | Shoot fireballs |

| Effect | Duration |
|--------|----------|
| Star Power | 10 seconds |
| Invincibility (damage) | 2 seconds |
| Combo Timeout | 3 seconds |
| Popup Lifetime | 0.5 seconds |

---

## Item Block Detection

```typescript
// Check if player hits block from below
if (
  player.x < block.x + block.width &&
  player.x + player.width > block.x &&
  player.y + player.height >= block.y &&
  player.y + player.height <= block.y + 5 &&
  player.velocityY > 0
) {
  block.hit();
}
```

---

## Animation Patterns

**Coin Spin:**
```typescript
frameTime += dt;
if (frameTime >= 0.1) {
  currentFrame = (currentFrame + 1) % 4;
  frameTime = 0;
}
```

**Question Mark Blink:**
```typescript
visible = Math.floor(time * 2) % 2 === 0;
```

**Star Rainbow:**
```typescript
const hue = (time * 360) % 360;
ctx.fillStyle = `hsl(${hue}, 100%, 50%)`;
```

---

## Best Practices

✅ **Do:**
- Use object pooling for particles
- Add audio feedback
- Cull off-screen collectibles
- Show clear visual feedback
- Use combo systems for rewards

❌ **Don't:**
- Collect items through walls
- Forget to remove collected items
- Make collectibles too small
- Skip sound effects
- Allow double collection
