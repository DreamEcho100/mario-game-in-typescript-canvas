# Topic 01: Collectibles and Power-ups - FAQ

---

## Q1: Should collectibles respawn?

**A**: Depends on game design:

**Don't respawn (Mario-style):**
- Creates sense of progress
- Encourages exploration
- Makes level completion meaningful
- Good for linear levels

**Do respawn:**
- Good for endless/arcade games
- Allows farming/grinding
- Good for procedural levels
- Reduces frustration

**Hybrid approach:**
```typescript
class Coin {
  respawnable: boolean;
  respawnTime: number = 30; // 30 seconds
  timeSinceCollected: number = 0;
  
  update(deltaTime: number) {
    if (this.collected && this.respawnable) {
      this.timeSinceCollected += deltaTime;
      if (this.timeSinceCollected >= this.respawnTime) {
        this.collected = false;
        this.timeSinceCollected = 0;
      }
    }
  }
}
```

---

## Q2: How do I make power-ups feel good?

**A**: Use the "juice" principles:

**Visual feedback:**
- Spawn animation (pop out of block)
- Collection particle effects
- Screen shake (optional)
- Color flash on player

**Audio feedback:**
- Unique sound for each power-up
- Musical sting for major upgrades
- Jingle for star power

**Timing:**
- Brief pause (2-3 frames) on collection
- Smooth transformation animation
- Telegraph power with glow/pulse

```typescript
class PowerUpCollection {
  static collect(player: Player, powerUp: PowerUp): void {
    // Pause game briefly
    game.freeze(0.1);
    
    // Particle burst
    particles.burst(powerUp.x, powerUp.y, 20);
    
    // Sound
    audio.play('powerup');
    
    // Transform player
    player.transformTo(powerUp.type);
    
    // Score popup
    scorePopup.show('+1000', powerUp.x, powerUp.y);
  }
}
```

---

## Q3: Should power-ups move or stay static?

**A**: Different designs for different purposes:

**Static (Fire Flower):**
- Easier to collect
- Can be placed precisely
- Good for guaranteed rewards
- Use for important upgrades

**Moving (Mushroom):**
- More challenging
- Creates urgency
- Can fall into pits (risk/reward)
- More dynamic gameplay

**In Mario:** Mushrooms move, Fire Flowers stay static!

```typescript
class Mushroom {
  update(deltaTime: number) {
    // Moves horizontally
    this.x += this.speed * deltaTime;
    // Affected by gravity
    this.velocityY += gravity * deltaTime;
  }
}

class FireFlower {
  update(deltaTime: number) {
    // Stays in place, just animates
    this.animationTime += deltaTime;
  }
}
```

---

## Q4: How do I handle item blocks?

**A**: Question mark blocks need careful design:

**Hit detection:**
```typescript
isHitFromBelow(player: Player): boolean {
  return (
    player.x < this.x + this.width &&
    player.x + player.width > this.x &&
    player.y + player.height >= this.y &&
    player.y + player.height <= this.y + 5 &&
    player.velocityY > 0 // Moving upward
  );
}
```

**Item selection:**
```typescript
class ItemBlock {
  determineItem(player: Player): PowerUpType {
    if (player.powerState === PowerState.Small) {
      return PowerUpType.Mushroom;
    } else {
      return PowerUpType.FireFlower;
    }
  }
}
```

**Empty state:**
```typescript
hit() {
  if (this.isEmpty) {
    audio.play('bump'); // Different sound
    return;
  }
  
  this.isEmpty = true;
  audio.play('powerup_appears');
  this.spawnItem();
  this.sprite = emptyBlockSprite;
}
```

---

## Q5: How do combo systems work?

**A**: Track collection timing and reward speed:

```typescript
class ComboSystem {
  combo: number = 0;
  comboTime: number = 0;
  timeout: number = 3.0; // 3 seconds to maintain combo
  
  addCoin(value: number): number {
    this.combo++;
    this.comboTime = this.timeout;
    
    // Exponential or capped multiplier
    const multiplier = Math.min(this.combo, 5);
    
    return value * multiplier;
  }
  
  update(deltaTime: number): void {
    if (this.combo > 0) {
      this.comboTime -= deltaTime;
      
      // Warning when about to expire
      if (this.comboTime < 1.0 && this.comboTime > 0.9) {
        audio.play('combo_warning');
      }
      
      if (this.comboTime <= 0) {
        this.combo = 0;
      }
    }
  }
}
```

---

## Q6: Should I use object pooling for collectibles?

**A**: Yes for frequently created/destroyed objects:

**Pool particles:**
```typescript
class ParticlePool {
  private pool: Particle[] = [];
  private active: Particle[] = [];
  
  get(): Particle {
    if (this.pool.length > 0) {
      const particle = this.pool.pop()!;
      this.active.push(particle);
      return particle;
    }
    return new Particle();
  }
  
  release(particle: Particle): void {
    const index = this.active.indexOf(particle);
    if (index >= 0) {
      this.active.splice(index, 1);
      this.pool.push(particle);
    }
  }
}
```

**Don't pool collectibles** (usually few in number, rarely created/destroyed during gameplay)

---

## Q7: How do I make a 1-UP mushroom?

**A**: Same as regular mushroom, but gives extra life:

```typescript
class OneUpMushroom extends Mushroom {
  collect(player: Player): void {
    player.lives++;
    audio.play('1up');
    
    // Special visual
    scorePopup.show('1UP', this.x, this.y);
    
    this.collected = true;
  }
  
  render(ctx: CanvasRenderingContext2D): void {
    // Green instead of red
    ctx.fillStyle = '#00FF00';
    ctx.fillRect(this.x, this.y, this.width, 20);
    
    // White spots
    ctx.fillStyle = 'white';
    ctx.fillRect(this.x + 8, this.y + 5, 6, 6);
    ctx.fillRect(this.x + 18, this.y + 5, 6, 6);
    
    // Stem
    ctx.fillStyle = '#FFEECC';
    ctx.fillRect(this.x + 10, this.y + 20, 12, 12);
  }
}
```

---

## Q8: How do I prevent collecting items through walls?

**A**: Add raycasting or wall check:

```typescript
canCollect(player: Player, tilemap: Tilemap): boolean {
  // First check AABB
  if (!this.collidesWith(player)) return false;
  
  // Check if there's a wall between centers
  const centerX1 = player.x + player.width / 2;
  const centerY1 = player.y + player.height / 2;
  const centerX2 = this.x + this.width / 2;
  const centerY2 = this.y + this.height / 2;
  
  return !tilemap.hasWallBetween(
    centerX1, centerY1,
    centerX2, centerY2
  );
}
```

---

## Q9: Should damage reset power-ups completely?

**A**: Classic Mario style: step down one level

```typescript
takeDamage(): void {
  if (this.invincible) return;
  
  if (this.powerState === PowerState.Fire) {
    // Fire → Big
    this.powerState = PowerState.Big;
    this.becomeInvincible(2.0);
    audio.play('pipe'); // Downgrade sound
  } else if (this.powerState === PowerState.Big) {
    // Big → Small
    this.powerState = PowerState.Small;
    this.height = 32;
    this.becomeInvincible(2.0);
    audio.play('pipe');
  } else {
    // Small → Death
    this.die();
  }
}
```

**Alternative:** One-hit death (harder, more retro)

---

## Q10: How long should star power last?

**A**: Classic timing:

- **Mario:** ~10 seconds
- **Sonic:** ~20 seconds
- **Modern games:** 8-15 seconds

```typescript
class StarPower {
  duration: number = 10.0;
  warningTime: number = 3.0; // Flash warning
  
  update(deltaTime: number): void {
    this.timer -= deltaTime;
    
    // Warning when almost done
    if (this.timer < this.warningTime) {
      player.flashSpeed = 5; // Flash faster
    }
    
    if (this.timer <= 0) {
      this.deactivate();
    }
  }
}
```

---

## Q11: How do I make coins attractive?

**A**: Visual tricks to draw attention:

**Shine animation:**
```typescript
render(ctx: CanvasRenderingContext2D): void {
  // Pulsing glow
  const pulse = Math.sin(this.time * 5) * 0.3 + 0.7;
  
  ctx.save();
  ctx.shadowBlur = 20;
  ctx.shadowColor = `rgba(255, 215, 0, ${pulse})`;
  
  // Draw coin
  ctx.fillStyle = 'gold';
  ctx.beginPath();
  ctx.arc(this.x + 16, this.y + 16, 16, 0, Math.PI * 2);
  ctx.fill();
  
  ctx.restore();
}
```

**Bobbing motion:**
```typescript
update(deltaTime: number): void {
  this.bobTime += deltaTime;
  this.renderY = this.y + Math.sin(this.bobTime * 3) * 5;
}
```

---

## Q12: Should power-ups have a time limit after spawning?

**A**: Optional but adds urgency:

```typescript
class PowerUp {
  lifetime: number = 10.0; // 10 seconds after spawning
  age: number = 0;
  
  update(deltaTime: number): void {
    this.age += deltaTime;
    
    // Flash when about to disappear
    if (this.age > this.lifetime - 2.0) {
      this.visible = Math.floor(this.age * 10) % 2 === 0;
    }
    
    // Remove if expired
    if (this.age >= this.lifetime) {
      this.remove();
    }
  }
}
```

**In Mario:** Power-ups don't expire (player-friendly)

---

## Q13: How do I make a "secret" collectible?

**A**: Hidden until conditions are met:

```typescript
class SecretCoin extends Coin {
  revealed: boolean = false;
  opacity: number = 0;
  
  update(deltaTime: number, player: Player): void {
    // Reveal when player is close
    const distance = this.distanceTo(player);
    if (distance < 50) {
      this.revealed = true;
    }
    
    // Fade in
    if (this.revealed && this.opacity < 1) {
      this.opacity += deltaTime * 2;
    }
    
    super.update(deltaTime, player);
  }
  
  render(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    ctx.globalAlpha = this.opacity;
    super.render(ctx);
    ctx.restore();
  }
}
```

---

## Q14: How many different coin types should I have?

**A**: 2-3 types is usually enough:

**Recommended:**
- **Common:** Bronze (10 pts) - everywhere
- **Uncommon:** Silver (50 pts) - harder to reach
- **Rare:** Gold (100 pts) - very hidden/challenging

**Optional:**
- **Red coins:** Special challenge (8 red coins = 1 star/1up)
- **Blue coins:** Time-limited bonus coins

Too many types confuses players!

---

## Q15: Should I save collected items between deaths?

**A**: Depends on difficulty:

**Don't persist (Mario-style):**
- Level resets completely
- All coins/items respawn
- Encourages mastery
- Traditional difficulty

**Do persist:**
- Less frustrating
- Good for exploration games
- Modern design
- Metroidvania style

**Hybrid:**
```typescript
class LevelState {
  // Persist power-ups
  playerPowerState: PowerState;
  
  // Don't persist collectibles
  coinsCollected: number = 0;
  
  onDeath(): void {
    // Keep power state between attempts
    this.savePlayerPower();
    
    // Reset coins
    this.coinsCollected = 0;
    this.respawnAllCoins();
  }
}
```

---

## Best Practices

✅ **Do:**
- Add juice (particles, sound, screen shake)
- Make collectibles highly visible
- Provide immediate feedback
- Use power-ups strategically
- Reward exploration
- Test risk/reward balance

❌ **Don't:**
- Make collectibles too small
- Skip audio feedback
- Allow collection through walls
- Make power-ups expire too fast
- Forget invincibility frames
- Overcomplicate combo systems
