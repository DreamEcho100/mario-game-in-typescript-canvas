# Topic 01: Collectibles and Power-ups - Debugging

---

## Bug #1: Items Collected Through Walls

**Symptoms**: Player collects items even when separated by solid blocks

**Causes**:
- No wall collision check before collection
- Collision box too large
- Raycast not implemented

**Fix**:
```typescript
checkCollision(player: Player, tilemap: Tilemap): boolean {
  // First check AABB
  if (!this.AABBCollision(player)) return false;
  
  // Then check if there's a wall between
  const hasWall = tilemap.raycast(
    player.x + player.width/2,
    player.y + player.height/2,
    this.x + this.width/2,
    this.y + this.height/2
  );
  
  return !hasWall;
}
```

---

## Bug #2: Double Collection

**Symptoms**: Same item collected multiple times, giving points repeatedly

**Causes**:
- Not checking `collected` flag before processing
- Race condition in update loop

**Fix**:
```typescript
collect(player: Player): void {
  // Guard clause
  if (this.collected) return;
  
  this.collected = true;
  score.add(this.value);
  audio.play('coin');
}

// In update:
update(player: Player): void {
  if (this.collected) return; // Skip if already collected
  
  if (this.checkCollision(player)) {
    this.collect(player);
  }
}
```

---

## Bug #3: Power-up Falls Through Floor

**Symptoms**: Mushroom or star falls through platforms

**Causes**:
- No tile collision for power-ups
- Only checking ground, not platforms

**Fix**:
```typescript
update(deltaTime: number, tilemap: Tilemap): void {
  // Apply gravity
  this.velocityY += 500 * deltaTime;
  this.y += this.velocityY * deltaTime;
  
  // Check tile collision
  const tiles = tilemap.getTilesAround(this.x, this.y);
  for (const tile of tiles) {
    if (tile.solid && this.collidesWith(tile)) {
      this.y = tile.y - this.height;
      this.velocityY = 0;
      break;
    }
  }
}
```

---

## Bug #4: Item Block Spawns Multiple Items

**Symptoms**: Hitting block multiple times spawns multiple power-ups

**Causes**:
- Not checking `isEmpty` flag
- Hit detection triggers every frame

**Fix**:
```typescript
class ItemBlock {
  isEmpty: boolean = false;
  hitCooldown: number = 0;
  
  checkHit(player: Player): void {
    if (this.isEmpty) return; // Guard
    if (this.hitCooldown > 0) return; // Cooldown
    
    if (this.isHitFromBelow(player)) {
      this.isEmpty = true;
      this.hitCooldown = 0.5; // Half second cooldown
      this.spawnItem();
    }
  }
  
  update(deltaTime: number): void {
    if (this.hitCooldown > 0) {
      this.hitCooldown -= deltaTime;
    }
  }
}
```

---

## Bug #5: Power-up Doesn't Change Player State

**Symptoms**: Collecting mushroom doesn't make player big

**Causes**:
- Not calling player's power-up method
- Wrong state transition logic
- Player state not rendering correctly

**Fix**:
```typescript
// In Mushroom class:
collect(player: Player): void {
  if (player.powerState === PowerState.Small) {
    player.powerUp(PowerState.Big);
    this.collected = true;
  }
}

// In Player class:
powerUp(newState: PowerState): void {
  console.log(`Power up: ${this.powerState} → ${newState}`);
  
  if (newState === PowerState.Big && this.powerState === PowerState.Small) {
    this.powerState = PowerState.Big;
    this.height = 48;
    this.y -= 16; // Adjust position
  }
}
```

---

## Bug #6: Combo Resets Too Quickly

**Symptoms**: Combo counter resets even when collecting coins rapidly

**Causes**:
- Timeout too short
- Not resetting timer on each coin
- Update order issue

**Fix**:
```typescript
class ComboSystem {
  combo: number = 0;
  comboTime: number = 0;
  comboTimeout: number = 3.0;
  
  addCoin(value: number): number {
    this.combo++;
    this.comboTime = this.comboTimeout; // Reset timer
    
    const multiplier = Math.min(this.combo, 5);
    console.log(`Combo: ${this.combo}, Multiplier: x${multiplier}`);
    return value * multiplier;
  }
  
  update(deltaTime: number): void {
    if (this.combo > 0) {
      this.comboTime -= deltaTime;
      if (this.comboTime <= 0) {
        console.log('Combo reset');
        this.combo = 0;
      }
    }
  }
}
```

---

## Bug #7: Score Popup Doesn't Appear

**Symptoms**: No "+10" text when collecting coins

**Causes**:
- Popup created but not rendered
- Popup removed too quickly
- Wrong layer order

**Fix**:
```typescript
class CoinManager {
  coins: Coin[] = [];
  popups: ScorePopup[] = [];
  
  update(deltaTime: number): void {
    // Update coins
    for (const coin of this.coins) {
      if (!coin.collected && coin.checkCollision(player)) {
        coin.collected = true;
        
        // Create popup
        this.popups.push(
          new ScorePopup(coin.x + 16, coin.y, coin.value)
        );
      }
    }
    
    // Update popups
    this.popups = this.popups.filter(p => p.update(deltaTime));
  }
  
  render(ctx: CanvasRenderingContext2D): void {
    // Render coins first
    for (const coin of this.coins) {
      if (!coin.collected) coin.render(ctx);
    }
    
    // Render popups on top
    for (const popup of this.popups) {
      popup.render(ctx);
    }
  }
}
```

---

## Bug #8: Star Power Doesn't Work

**Symptoms**: Collecting star doesn't make player invincible

**Causes**:
- Star flag not set
- Collision detection for enemies not checking star
- Visual effect not rendering

**Fix**:
```typescript
// In Player:
activateStar(): void {
  console.log('Star activated!');
  this.starPower = true;
  this.starTime = 10.0;
  this.speed *= 1.5; // Speed boost
}

update(deltaTime: number): void {
  if (this.starPower) {
    this.starTime -= deltaTime;
    if (this.starTime <= 0) {
      console.log('Star expired');
      this.starPower = false;
      this.speed /= 1.5;
    }
  }
}

// In enemy collision:
if (player.starPower) {
  enemy.defeat();
} else {
  player.takeDamage();
}
```

---

## Bug #9: Particles Don't Show

**Symptoms**: No sparkle effect when collecting items

**Causes**:
- Particles created but not updated
- Particles removed immediately
- Wrong render order

**Fix**:
```typescript
class ParticleSystem {
  particles: Particle[] = [];
  
  createBurst(x: number, y: number, count: number = 8): void {
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const speed = 100;
      this.particles.push(new Particle(
        x, y,
        Math.cos(angle) * speed,
        Math.sin(angle) * speed,
        'yellow',
        0.5 // lifetime
      ));
    }
    console.log(`Created ${count} particles`);
  }
  
  update(deltaTime: number): void {
    // Update and filter
    this.particles = this.particles.filter(p => {
      const alive = p.update(deltaTime);
      if (!alive) console.log('Particle died');
      return alive;
    });
  }
  
  render(ctx: CanvasRenderingContext2D): void {
    console.log(`Rendering ${this.particles.length} particles`);
    for (const p of this.particles) {
      p.render(ctx);
    }
  }
}
```

---

## Bug #10: Item Block Bounces Forever

**Symptoms**: Question mark block keeps bouncing after being hit

**Causes**:
- Bounce flag not reset
- No maximum bounce height
- Oscillation in physics

**Fix**:
```typescript
class ItemBlock {
  bounceOffset: number = 0;
  bounceSpeed: number = 0;
  bouncing: boolean = false;
  maxBounce: number = 10;
  
  hit(): void {
    if (!this.isEmpty) {
      this.bouncing = true;
      this.bounceSpeed = 200;
    }
  }
  
  update(deltaTime: number): void {
    if (this.bouncing) {
      this.bounceOffset += this.bounceSpeed * deltaTime;
      
      if (this.bounceOffset >= this.maxBounce) {
        this.bounceOffset = this.maxBounce;
        this.bounceSpeed = -200; // Start going back
      }
    } else if (this.bounceOffset > 0) {
      this.bounceOffset -= 200 * deltaTime;
      
      if (this.bounceOffset <= 0) {
        this.bounceOffset = 0;
        this.bouncing = false;
      }
    }
  }
}
```

---

## Debug Visualization

```typescript
// Show collision boxes
ctx.strokeStyle = 'lime';
ctx.strokeRect(coin.x, coin.y, coin.width, coin.height);

// Show combo timer
ctx.fillStyle = 'white';
ctx.fillText(`Combo: ${combo.combo} (${combo.comboTime.toFixed(1)}s)`, 10, 30);

// Show power state
ctx.fillText(`Power: ${PowerState[player.powerState]}`, 10, 50);

// Show star time
if (player.starPower) {
  ctx.fillText(`Star: ${player.starTime.toFixed(1)}s`, 10, 70);
}

// Show particle count
ctx.fillText(`Particles: ${particles.length}`, 10, 90);
```
