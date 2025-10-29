# Topic 01: Collectibles and Power-ups - Solutions

Complete solutions for all collectible and power-up exercises.

---

## Exercise 1 Solution: Basic Coin Collectible

```typescript
class Coin {
  x: number;
  y: number;
  width: number = 32;
  height: number = 32;
  collected: boolean = false;
  value: number = 10;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  checkCollision(player: Player): boolean {
    return (
      this.x < player.x + player.width &&
      this.x + this.width > player.x &&
      this.y < player.y + player.height &&
      this.y + this.height > player.y
    );
  }

  update(player: Player, score: Score): void {
    if (!this.collected && this.checkCollision(player)) {
      this.collected = true;
      score.add(this.value);
    }
  }

  render(ctx: CanvasRenderingContext2D): void {
    if (!this.collected) {
      ctx.fillStyle = 'gold';
      ctx.beginPath();
      ctx.arc(this.x + 16, this.y + 16, 16, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}
```

---

## Exercise 2 Solution: Animated Coin

```typescript
class AnimatedCoin {
  x: number;
  y: number;
  width: number = 32;
  height: number = 32;
  collected: boolean = false;
  value: number = 10;
  
  // Animation
  private frames: HTMLImageElement[] = [];
  private currentFrame: number = 0;
  private frameTime: number = 0;
  private frameDuration: number = 0.1; // 10 FPS

  constructor(x: number, y: number, frames: HTMLImageElement[]) {
    this.x = x;
    this.y = y;
    this.frames = frames;
  }

  update(deltaTime: number, player: Player, score: Score): void {
    if (!this.collected) {
      // Animate
      this.frameTime += deltaTime;
      if (this.frameTime >= this.frameDuration) {
        this.frameTime = 0;
        this.currentFrame = (this.currentFrame + 1) % this.frames.length;
      }

      // Check collection
      if (this.checkCollision(player)) {
        this.collected = true;
        score.add(this.value);
      }
    }
  }

  render(ctx: CanvasRenderingContext2D): void {
    if (!this.collected) {
      ctx.drawImage(this.frames[this.currentFrame], this.x, this.y);
    }
  }
}
```

---

## Exercise 3 Solution: Coin Collection Feedback

```typescript
class ScorePopup {
  x: number;
  y: number;
  text: string;
  lifetime: number = 0.5;
  age: number = 0;

  constructor(x: number, y: number, value: number) {
    this.x = x;
    this.y = y - 20; // Start above coin
    this.text = `+${value}`;
  }

  update(deltaTime: number): boolean {
    this.age += deltaTime;
    this.y -= 30 * deltaTime; // Float up
    return this.age < this.lifetime;
  }

  render(ctx: CanvasRenderingContext2D): void {
    const alpha = 1 - (this.age / this.lifetime);
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = 'yellow';
    ctx.font = 'bold 20px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(this.text, this.x, this.y);
    ctx.restore();
  }
}

class CoinWithFeedback extends AnimatedCoin {
  private particles: Particle[] = [];
  private popup: ScorePopup | null = null;

  collect(player: Player, score: Score, audio: AudioManager): void {
    this.collected = true;
    score.add(this.value);
    audio.play('coin');
    
    // Create popup
    this.popup = new ScorePopup(this.x + 16, this.y, this.value);
    
    // Create particles
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      this.particles.push(
        new Particle(
          this.x + 16,
          this.y + 16,
          Math.cos(angle) * 100,
          Math.sin(angle) * 100,
          'yellow',
          0.5
        )
      );
    }
  }

  update(deltaTime: number, player: Player, score: Score, audio: AudioManager): void {
    if (!this.collected) {
      super.update(deltaTime, player, score);
      
      if (this.checkCollision(player)) {
        this.collect(player, score, audio);
      }
    } else {
      // Update popup
      if (this.popup && !this.popup.update(deltaTime)) {
        this.popup = null;
      }
      
      // Update particles
      this.particles = this.particles.filter(p => p.update(deltaTime));
    }
  }

  render(ctx: CanvasRenderingContext2D): void {
    super.render(ctx);
    
    if (this.collected) {
      this.particles.forEach(p => p.render(ctx));
      if (this.popup) this.popup.render(ctx);
    }
  }
}
```

---

## Exercise 4 Solution: Multiple Coin Types

```typescript
enum CoinType {
  Bronze = 10,
  Silver = 50,
  Gold = 100
}

class TypedCoin extends AnimatedCoin {
  type: CoinType;
  
  constructor(x: number, y: number, type: CoinType, frames: HTMLImageElement[]) {
    super(x, y, frames);
    this.type = type;
    this.value = type;
  }

  getColor(): string {
    switch (this.type) {
      case CoinType.Bronze: return '#CD7F32';
      case CoinType.Silver: return '#C0C0C0';
      case CoinType.Gold: return '#FFD700';
    }
  }

  render(ctx: CanvasRenderingContext2D): void {
    if (!this.collected) {
      ctx.fillStyle = this.getColor();
      ctx.beginPath();
      ctx.arc(this.x + 16, this.y + 16, 16, 0, Math.PI * 2);
      ctx.fill();
      
      // Outer ring
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  }
}
```

---

## Exercise 5 Solution: Mushroom Power-up

```typescript
enum PowerUpType {
  Mushroom,
  FireFlower,
  Star
}

class Mushroom {
  x: number;
  y: number;
  width: number = 32;
  height: number = 32;
  velocityX: number = 50;
  velocityY: number = 0;
  collected: boolean = false;
  spawning: boolean = true;
  spawnY: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
    this.spawnY = y - 32; // Target Y when done spawning
  }

  update(deltaTime: number, player: Player): void {
    if (this.collected) return;

    // Spawn animation
    if (this.spawning) {
      this.y -= 50 * deltaTime;
      if (this.y <= this.spawnY) {
        this.y = this.spawnY;
        this.spawning = false;
      }
      return;
    }

    // Move horizontally
    this.x += this.velocityX * deltaTime;

    // Gravity
    this.velocityY += 500 * deltaTime;
    this.y += this.velocityY * deltaTime;

    // Ground collision (simplified)
    if (this.y > 550) {
      this.y = 550;
      this.velocityY = 0;
    }

    // Check collection
    if (this.checkCollision(player)) {
      if (player.powerState === PowerState.Small) {
        player.powerUp(PowerState.Big);
        this.collected = true;
      }
    }
  }

  checkCollision(player: Player): boolean {
    return (
      this.x < player.x + player.width &&
      this.x + this.width > player.x &&
      this.y < player.y + player.height &&
      this.y + this.height > player.y
    );
  }

  render(ctx: CanvasRenderingContext2D): void {
    if (!this.collected) {
      // Mushroom cap
      ctx.fillStyle = '#FF4444';
      ctx.fillRect(this.x, this.y, this.width, 20);
      
      // Mushroom spots
      ctx.fillStyle = 'white';
      ctx.fillRect(this.x + 8, this.y + 5, 6, 6);
      ctx.fillRect(this.x + 18, this.y + 5, 6, 6);
      
      // Mushroom stem
      ctx.fillStyle = '#FFEECC';
      ctx.fillRect(this.x + 10, this.y + 20, 12, 12);
    }
  }
}
```

---

## Exercise 6 Solution: Fire Flower

```typescript
class FireFlower {
  x: number;
  y: number;
  width: number = 32;
  height: number = 32;
  collected: boolean = false;
  spawning: boolean = true;
  spawnY: number;
  animTime: number = 0;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
    this.spawnY = y - 32;
  }

  update(deltaTime: number, player: Player): void {
    if (this.collected) return;

    this.animTime += deltaTime;

    // Spawn animation
    if (this.spawning) {
      this.y -= 50 * deltaTime;
      if (this.y <= this.spawnY) {
        this.y = this.spawnY;
        this.spawning = false;
      }
      return;
    }

    // Check collection
    if (this.checkCollision(player)) {
      if (player.powerState === PowerState.Big || 
          player.powerState === PowerState.Small) {
        player.powerUp(PowerState.Fire);
        this.collected = true;
      }
    }
  }

  checkCollision(player: Player): boolean {
    return (
      this.x < player.x + player.width &&
      this.x + this.width > player.x &&
      this.y < player.y + player.height &&
      this.y + this.height > player.y
    );
  }

  render(ctx: CanvasRenderingContext2D): void {
    if (!this.collected) {
      // Animate colors
      const hue = (this.animTime * 360) % 360;
      ctx.fillStyle = `hsl(${hue}, 100%, 50%)`;
      
      // Flower petals (4 circles around center)
      const centerX = this.x + 16;
      const centerY = this.y + 16;
      
      for (let i = 0; i < 4; i++) {
        const angle = (i / 4) * Math.PI * 2;
        const px = centerX + Math.cos(angle) * 8;
        const py = centerY + Math.sin(angle) * 8;
        ctx.beginPath();
        ctx.arc(px, py, 8, 0, Math.PI * 2);
        ctx.fill();
      }
      
      // Center
      ctx.fillStyle = 'yellow';
      ctx.beginPath();
      ctx.arc(centerX, centerY, 6, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}
```

---

## Exercise 7 Solution: Item Block

```typescript
class ItemBlock {
  x: number;
  y: number;
  width: number = 32;
  height: number = 32;
  isEmpty: boolean = false;
  bounceOffset: number = 0;
  bouncing: boolean = false;
  itemType: PowerUpType;

  constructor(x: number, y: number, itemType: PowerUpType) {
    this.x = x;
    this.y = y;
    this.itemType = itemType;
  }

  hit(player: Player, items: any[], audio: AudioManager): void {
    if (this.isEmpty) return;

    this.isEmpty = true;
    this.bouncing = true;
    audio.play('bump');

    // Spawn item
    let item: Mushroom | FireFlower;
    if (this.itemType === PowerUpType.Mushroom) {
      item = new Mushroom(this.x, this.y);
    } else {
      item = new FireFlower(this.x, this.y);
    }
    items.push(item);
  }

  update(deltaTime: number, player: Player): void {
    // Bounce animation
    if (this.bouncing) {
      this.bounceOffset += 200 * deltaTime;
      if (this.bounceOffset >= 10) {
        this.bounceOffset = 10;
      }
    } else if (this.bounceOffset > 0) {
      this.bounceOffset -= 200 * deltaTime;
      if (this.bounceOffset < 0) {
        this.bounceOffset = 0;
      }
    }

    if (this.bounceOffset >= 10) {
      this.bouncing = false;
    }

    // Check if player hits from below
    if (!this.isEmpty && 
        player.x < this.x + this.width &&
        player.x + player.width > this.x &&
        player.y + player.height >= this.y &&
        player.y + player.height <= this.y + 5 &&
        player.velocityY > 0) {
      this.hit(player, [], null!);
    }
  }

  render(ctx: CanvasRenderingContext2D): void {
    const renderY = this.y - this.bounceOffset;

    if (this.isEmpty) {
      // Empty block (brown)
      ctx.fillStyle = '#8B4513';
      ctx.fillRect(this.x, renderY, this.width, this.height);
    } else {
      // Question mark block (yellow)
      ctx.fillStyle = '#FFD700';
      ctx.fillRect(this.x, renderY, this.width, this.height);
      
      // Question mark
      ctx.fillStyle = 'white';
      ctx.font = 'bold 24px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('?', this.x + 16, renderY + 16);
    }
  }
}
```

---

## Exercise 8 Solution: Power-up State Machine

```typescript
enum PowerState {
  Small,
  Big,
  Fire
}

class Player {
  x: number = 100;
  y: number = 100;
  width: number = 32;
  height: number = 32;
  powerState: PowerState = PowerState.Small;
  invincible: boolean = false;
  invincibleTime: number = 0;

  powerUp(newState: PowerState): void {
    if (newState === PowerState.Big && this.powerState === PowerState.Small) {
      // Grow animation
      this.powerState = PowerState.Big;
      this.height = 48;
      this.y -= 16;
    } else if (newState === PowerState.Fire && this.powerState === PowerState.Big) {
      // Gain fire ability
      this.powerState = PowerState.Fire;
    } else if (newState === PowerState.Fire && this.powerState === PowerState.Small) {
      // Skip to big first
      this.powerUp(PowerState.Big);
    }
  }

  takeDamage(): void {
    if (this.invincible) return;

    if (this.powerState === PowerState.Fire) {
      this.powerState = PowerState.Big;
      this.becomeInvincible();
    } else if (this.powerState === PowerState.Big) {
      this.powerState = PowerState.Small;
      this.height = 32;
      this.y += 16;
      this.becomeInvincible();
    } else {
      // Die
      this.die();
    }
  }

  becomeInvincible(): void {
    this.invincible = true;
    this.invincibleTime = 2.0; // 2 seconds
  }

  update(deltaTime: number): void {
    // Update invincibility
    if (this.invincible) {
      this.invincibleTime -= deltaTime;
      if (this.invincibleTime <= 0) {
        this.invincible = false;
      }
    }
  }

  render(ctx: CanvasRenderingContext2D): void {
    // Flicker when invincible
    if (this.invincible && Math.floor(this.invincibleTime * 10) % 2 === 0) {
      return;
    }

    // Different colors for each state
    switch (this.powerState) {
      case PowerState.Small:
        ctx.fillStyle = 'red';
        break;
      case PowerState.Big:
        ctx.fillStyle = 'blue';
        break;
      case PowerState.Fire:
        ctx.fillStyle = 'white';
        break;
    }

    ctx.fillRect(this.x, this.y, this.width, this.height);
  }

  die(): void {
    // Handle death
    console.log('Player died!');
  }
}
```

---

## Exercise 9 Solution: Star Invincibility

```typescript
class Star {
  x: number;
  y: number;
  width: number = 32;
  height: number = 32;
  velocityX: number = 100;
  velocityY: number = -200;
  collected: boolean = false;
  spawning: boolean = true;
  spawnY: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
    this.spawnY = y - 32;
  }

  update(deltaTime: number, player: Player): void {
    if (this.collected) return;

    // Spawn animation
    if (this.spawning) {
      this.y -= 50 * deltaTime;
      if (this.y <= this.spawnY) {
        this.y = this.spawnY;
        this.spawning = false;
      }
      return;
    }

    // Move
    this.x += this.velocityX * deltaTime;
    this.velocityY += 500 * deltaTime; // Gravity
    this.y += this.velocityY * deltaTime;

    // Bounce
    if (this.y > 550) {
      this.y = 550;
      this.velocityY = -200;
    }

    // Check collection
    if (this.checkCollision(player)) {
      player.activateStar();
      this.collected = true;
    }
  }

  checkCollision(player: Player): boolean {
    return (
      this.x < player.x + player.width &&
      this.x + this.width > player.x &&
      this.y < player.y + player.height &&
      this.y + this.height > player.y
    );
  }

  render(ctx: CanvasRenderingContext2D): void {
    if (!this.collected) {
      ctx.save();
      ctx.translate(this.x + 16, this.y + 16);
      
      // Draw star shape
      ctx.fillStyle = 'yellow';
      ctx.beginPath();
      for (let i = 0; i < 5; i++) {
        const angle = (i / 5) * Math.PI * 2 - Math.PI / 2;
        const x = Math.cos(angle) * 16;
        const y = Math.sin(angle) * 16;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
        
        const innerAngle = angle + Math.PI / 5;
        const ix = Math.cos(innerAngle) * 8;
        const iy = Math.sin(innerAngle) * 8;
        ctx.lineTo(ix, iy);
      }
      ctx.closePath();
      ctx.fill();
      
      ctx.restore();
    }
  }
}

// Add to Player class:
class PlayerWithStar extends Player {
  starPower: boolean = false;
  starTime: number = 0;
  starDuration: number = 10.0;

  activateStar(): void {
    this.starPower = true;
    this.starTime = this.starDuration;
  }

  update(deltaTime: number): void {
    super.update(deltaTime);

    if (this.starPower) {
      this.starTime -= deltaTime;
      if (this.starTime <= 0) {
        this.starPower = false;
      }
    }
  }

  render(ctx: CanvasRenderingContext2D): void {
    if (this.starPower) {
      // Rainbow effect
      const hue = (Date.now() * 0.5) % 360;
      ctx.fillStyle = `hsl(${hue}, 100%, 50%)`;
    } else {
      // Normal colors
      super.render(ctx);
      return;
    }

    ctx.fillRect(this.x, this.y, this.width, this.height);
  }
}
```

---

## Exercise 10 Solution: Combo System

```typescript
class ComboSystem {
  combo: number = 0;
  comboTime: number = 0;
  comboTimeout: number = 3.0;
  maxCombo: number = 5;

  addCoin(value: number): number {
    this.combo++;
    this.comboTime = this.comboTimeout;
    
    const multiplier = Math.min(this.combo, this.maxCombo);
    return value * multiplier;
  }

  update(deltaTime: number): void {
    if (this.combo > 0) {
      this.comboTime -= deltaTime;
      if (this.comboTime <= 0) {
        this.combo = 0;
      }
    }
  }

  render(ctx: CanvasRenderingContext2D): void {
    if (this.combo > 1) {
      ctx.fillStyle = 'yellow';
      ctx.font = 'bold 30px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(`x${Math.min(this.combo, this.maxCombo)} COMBO!`, 400, 50);
      
      // Timer bar
      const barWidth = 200;
      const barFill = (this.comboTime / this.comboTimeout) * barWidth;
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.fillRect(300, 60, barWidth, 10);
      ctx.fillStyle = 'yellow';
      ctx.fillRect(300, 60, barFill, 10);
    }
  }
}

// Usage with coins:
class CoinWithCombo extends AnimatedCoin {
  collect(player: Player, score: Score, combo: ComboSystem): void {
    const points = combo.addCoin(this.value);
    score.add(points);
    this.collected = true;
  }
}
```

---

## Performance Tips

- Use object pooling for particles and popups
- Cull collectibles outside camera view
- Batch render similar collectibles
- Cache particle systems
- Limit active particle count
