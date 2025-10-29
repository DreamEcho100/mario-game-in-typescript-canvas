# Scoring and Lives System - Quick Reference

**Unit 05: Gameplay, AI & Interactions | Topic 03 | Cheat Sheet**

---

## Basic Score Manager Pattern

```typescript
class ScoreManager {
  private score: number = 0;
  
  addScore(points: number): void {
    this.score += points;
  }
  
  getScore(): number {
    return this.score;
  }
  
  reset(): void {
    this.score = 0;
  }
}
```

---

## Lives Manager Pattern

```typescript
class LivesManager {
  private lives: number = 3;
  private maxLives: number = 99;
  
  addLife(): void {
    this.lives = Math.min(this.lives + 1, this.maxLives);
  }
  
  loseLife(): void {
    this.lives--;
    if (this.lives <= 0) this.triggerGameOver();
  }
  
  getLives(): number {
    return this.lives;
  }
}
```

---

## Combo System Pattern

```typescript
class ComboManager {
  private combo: number = 0;
  private timer: number = 0;
  private timeout: number = 2000; // 2 seconds
  
  addCombo(): void {
    this.combo++;
    this.timer = this.timeout;
  }
  
  getMultiplier(): number {
    if (this.combo < 2) return 1;
    if (this.combo < 5) return 2;
    if (this.combo < 10) return 3;
    if (this.combo < 20) return 4;
    return 5; // Max multiplier
  }
  
  update(deltaTime: number): void {
    if (this.combo > 0) {
      this.timer -= deltaTime;
      if (this.timer <= 0) this.combo = 0;
    }
  }
}
```

---

## Score Popup Pattern

```typescript
class ScorePopup {
  x: number;
  y: number;
  text: string;
  lifetime: number = 1000;
  age: number = 0;
  velocityY: number = -50;
  
  update(deltaTime: number): void {
    this.age += deltaTime;
    this.y += this.velocityY * (deltaTime / 1000);
  }
  
  render(ctx: CanvasRenderingContext2D): void {
    const opacity = 1 - (this.age / this.lifetime);
    ctx.globalAlpha = opacity;
    ctx.fillText(this.text, this.x, this.y);
  }
  
  isExpired(): boolean {
    return this.age >= this.lifetime;
  }
}
```

---

## High Score Persistence

```typescript
// Save to localStorage
localStorage.setItem('highScore', score.toString());

// Load from localStorage
const saved = localStorage.getItem('highScore');
const highScore = saved ? parseInt(saved, 10) : 0;

// Save high score table
interface HighScoreEntry {
  score: number;
  date: string;
  level: string;
}

const saveHighScores = (scores: HighScoreEntry[]) => {
  localStorage.setItem('highScores', JSON.stringify(scores));
};

const loadHighScores = (): HighScoreEntry[] => {
  const data = localStorage.getItem('highScores');
  return data ? JSON.parse(data) : [];
};
```

---

## Score Display UI

```typescript
class ScoreUI {
  render(ctx: CanvasRenderingContext2D): void {
    // Score
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(`SCORE: ${this.formatScore(score)}`, 20, 30);
    
    // High Score
    ctx.textAlign = 'right';
    ctx.fillText(`HI: ${this.formatScore(highScore)}`, width - 20, 30);
  }
  
  formatScore(score: number): string {
    return score.toString().padStart(6, '0'); // "000000"
  }
}
```

---

## Lives Display UI

```typescript
class LivesUI {
  render(ctx: CanvasRenderingContext2D): void {
    // Label
    ctx.fillStyle = '#ffffff';
    ctx.font = '20px Arial';
    ctx.fillText('×', 20, 60);
    ctx.fillText(lives.toString(), 45, 60);
    
    // Mario head icons (up to 3)
    for (let i = 0; i < Math.min(lives, 3); i++) {
      ctx.fillStyle = '#ff0000';
      ctx.beginPath();
      ctx.arc(90 + i * 25, 54, 10, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}
```

---

## Combo Display UI

```typescript
class ComboUI {
  render(ctx: CanvasRenderingContext2D): void {
    if (combo <= 1) return; // Don't show if no combo
    
    // Background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(centerX - 80, 10, 160, 40);
    
    // Text
    ctx.fillStyle = '#ffff00';
    ctx.font = 'bold 20px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`COMBO: ${combo}  ×${multiplier}`, centerX, 35);
  }
}
```

---

## Score Event Types

```typescript
enum ScoreEvent {
  // Collectibles
  COIN_BRONZE = 100,
  COIN_SILVER = 200,
  COIN_GOLD = 500,
  
  // Enemies
  GOOMBA = 100,
  KOOPA_GREEN = 200,
  KOOPA_RED = 400,
  HAMMER_BRO = 1000,
  BOSS = 10000,
  
  // Blocks
  BLOCK_BREAK = 50,
  BLOCK_HIT = 10,
  SECRET_BLOCK = 500,
  
  // Power-ups
  MUSHROOM = 1000,
  FIRE_FLOWER = 1000,
  STAR = 1000,
  
  // Bonuses
  TIME_BONUS = 50,        // Per second
  NO_DAMAGE_BONUS = 10000,
  ALL_COINS_BONUS = 5000,
}
```

---

## 1-UP System

```typescript
class OneUpManager {
  private nextMilestone: number = 100000;
  private interval: number = 100000;
  
  checkScore(score: number): void {
    if (score >= this.nextMilestone) {
      this.livesManager.addLife();
      this.nextMilestone += this.interval;
      this.show1UpNotification();
    }
  }
}

// Also award 1-UP for:
// - 100 coins collected
// - Finding secret 1-UP mushroom
```

---

## Time Bonus Calculation

```typescript
class LevelTimer {
  private startTime: number;
  private timeLimit: number = 300000; // 5 minutes
  
  start(): void {
    this.startTime = Date.now();
  }
  
  getTimeRemaining(): number {
    const elapsed = Date.now() - this.startTime;
    return Math.max(0, this.timeLimit - elapsed);
  }
  
  calculateTimeBonus(): number {
    const seconds = Math.floor(this.getTimeRemaining() / 1000);
    return seconds * 50; // 50 points per second
  }
}
```

---

## Damage Tracking

```typescript
class DamageTracker {
  private damaged: boolean = false;
  
  recordDamage(): void {
    this.damaged = true;
  }
  
  hasNoDamage(): boolean {
    return !this.damaged;
  }
  
  reset(): void {
    this.damaged = false;
  }
  
  calculateBonus(): number {
    return this.hasNoDamage() ? 10000 : 0;
  }
}
```

---

## Collection Tracking

```typescript
class CoinTracker {
  private total: number = 0;
  private collected: number = 0;
  
  setTotal(count: number): void {
    this.total = count;
  }
  
  collect(): void {
    this.collected++;
  }
  
  hasAllCoins(): boolean {
    return this.collected >= this.total;
  }
  
  getProgress(): string {
    return `${this.collected}/${this.total}`;
  }
  
  calculateBonus(): number {
    return this.hasAllCoins() ? 5000 : 0;
  }
}
```

---

## Object Pooling for Popups

```typescript
class PopupPool {
  private active: ScorePopup[] = [];
  private pool: ScorePopup[] = [];
  
  create(x: number, y: number, points: number): void {
    // Get from pool or create new
    let popup = this.pool.pop();
    if (!popup) {
      popup = new ScorePopup(x, y, points);
    } else {
      popup.reset(x, y, points);
    }
    this.active.push(popup);
  }
  
  update(deltaTime: number): void {
    for (let i = this.active.length - 1; i >= 0; i--) {
      const popup = this.active[i];
      popup.update(deltaTime);
      
      if (popup.isExpired()) {
        // Return to pool
        this.active.splice(i, 1);
        this.pool.push(popup);
      }
    }
  }
}
```

---

## Common Values Table

| Item | Points | Comboable |
|------|--------|-----------|
| Bronze Coin | 100 | Yes |
| Silver Coin | 200 | Yes |
| Gold Coin | 500 | Yes |
| Goomba Stomp | 100 | Yes |
| Koopa Stomp | 200 | Yes |
| Hammer Bro | 1000 | Yes |
| Boss Defeated | 10000 | No |
| Block Break | 50 | Yes |
| Block Hit | 10 | No |
| Mushroom | 1000 | No |
| Fire Flower | 1000 | No |
| Star | 1000 | No |
| Secret Found | 5000 | No |
| No Damage | 10000 | No |
| All Coins | 5000 | No |
| Time Bonus | 50/sec | No |

---

## Combo Multiplier Tiers

| Combo Count | Multiplier |
|-------------|------------|
| 1 | 1× |
| 2-4 | 2× |
| 5-9 | 3× |
| 10-19 | 4× |
| 20+ | 5× (max) |

---

## Score Formatting

```typescript
// Zero-padded (Mario style)
const formatScore = (score: number): string => {
  return score.toString().padStart(6, '0');
};
// 1234 → "001234"

// With commas
const formatScoreCommas = (score: number): string => {
  return score.toLocaleString();
};
// 1234567 → "1,234,567"

// Abbreviated
const formatScoreAbbrev = (score: number): string => {
  if (score >= 1000000) return `${(score / 1000000).toFixed(1)}M`;
  if (score >= 1000) return `${(score / 1000).toFixed(1)}K`;
  return score.toString();
};
// 1234567 → "1.2M"
```

---

## Level Complete Bonus Flow

```typescript
class LevelCompleteScreen {
  calculateTotalBonus(): number {
    let total = 0;
    
    // Base level clear bonus
    total += 1000;
    
    // Time bonus (50 per second remaining)
    const timeBonus = this.timer.calculateTimeBonus();
    total += timeBonus;
    
    // No damage bonus
    if (this.damageTracker.hasNoDamage()) {
      total += 10000;
    }
    
    // All coins bonus
    if (this.coinTracker.hasAllCoins()) {
      total += 5000;
    }
    
    return total;
  }
  
  animateBonusAward(totalBonus: number): void {
    // Award in increments for satisfying feedback
    const increment = 50;
    let awarded = 0;
    
    const interval = setInterval(() => {
      const amount = Math.min(increment, totalBonus - awarded);
      this.scoreManager.addScore(amount);
      awarded += amount;
      
      if (awarded >= totalBonus) {
        clearInterval(interval);
      }
    }, 50);
  }
}
```

---

## Event Integration Pattern

```typescript
class Game {
  setupEvents(): void {
    // Coin collected
    eventBus.on('coinCollected', (coin: Coin) => {
      this.coinTracker.collect();
      this.scoreManager.addScoreWithCombo(
        coin.x, coin.y, 100, true
      );
    });
    
    // Enemy defeated
    eventBus.on('enemyDefeated', (enemy: Enemy) => {
      const points = this.getEnemyPoints(enemy);
      this.scoreManager.addScoreWithCombo(
        enemy.x, enemy.y, points, true
      );
    });
    
    // Player damaged
    eventBus.on('playerDamaged', () => {
      this.damageTracker.recordDamage();
      this.comboManager.reset();
    });
    
    // Level complete
    eventBus.on('levelComplete', () => {
      this.showLevelCompleteScreen();
    });
  }
}
```

---

## Performance Tips

### ✅ DO:
- Cache formatted text strings
- Update UI only when values change
- Use object pooling for popups
- Debounce localStorage saves
- Use requestAnimationFrame for animations

### ❌ DON'T:
- Format strings every frame
- Create new objects for each popup
- Save to localStorage on every score change
- Use setInterval for game logic
- Recalculate unchanged values

---

## Debugging Checklist

- [ ] Score never goes negative
- [ ] High score saves correctly
- [ ] Lives cap at 99
- [ ] Combo resets after timeout
- [ ] Popups clean up properly
- [ ] LocalStorage errors handled
- [ ] UI updates when values change
- [ ] Multipliers calculate correctly
- [ ] 1-UP awards at correct milestones
- [ ] Bonus calculations are accurate

---

## Quick Troubleshooting

**Score shows NaN:**
- Check for undefined values in calculations
- Ensure all inputs are numbers
- Use parseInt() when loading from storage

**Popups don't disappear:**
- Check isExpired() logic
- Ensure update() is called
- Verify array filtering

**High score won't save:**
- Check localStorage quota
- Verify JSON.stringify works
- Use try-catch blocks
- Check browser privacy settings

**Combo never resets:**
- Ensure update() is called
- Check timer decrements properly
- Verify timeout value is reasonable

---

## Common Code Snippets

### Observer Pattern
```typescript
private listeners: Function[] = [];

onChange(callback: Function): void {
  this.listeners.push(callback);
}

private notify(): void {
  this.listeners.forEach(cb => cb(this.score));
}
```

### Safe LocalStorage
```typescript
const saveData = (key: string, value: any): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('Save failed:', e);
  }
};

const loadData = (key: string, fallback: any): any => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : fallback;
  } catch (e) {
    console.error('Load failed:', e);
    return fallback;
  }
};
```

### Animated Counter
```typescript
class AnimatedCounter {
  current: number = 0;
  target: number = 0;
  speed: number = 50; // Points per frame
  
  setTarget(value: number): void {
    this.target = value;
  }
  
  update(): void {
    if (this.current < this.target) {
      this.current = Math.min(
        this.current + this.speed,
        this.target
      );
    }
  }
  
  getValue(): number {
    return Math.floor(this.current);
  }
}
```

---

**Keep this reference handy while implementing your scoring system!** 🎮✨
