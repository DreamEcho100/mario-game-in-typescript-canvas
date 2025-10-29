# Scoring and Lives System - FAQ

**Unit 05: Gameplay, AI & Interactions | Topic 03 | Frequently Asked Questions**

---

## Q1: Should I use a global score variable or a ScoreManager class?

**Answer:** Definitely use a `ScoreManager` class.

**Why:**
- **Encapsulation:** Keeps score logic contained and organized
- **Testability:** Easy to unit test isolated functionality
- **Extensibility:** Simple to add features (listeners, validation, etc.)
- **Reusability:** Can create multiple instances for multiplayer

**Example:**
```typescript
// ❌ Bad: Global variable
let score = 0;
function addScore(points) {
  score += points;
}

// ✅ Good: Manager class
class ScoreManager {
  private score: number = 0;
  
  addScore(points: number): void {
    this.score += points;
    this.notifyListeners();
  }
}
```

**When globals are OK:**
- Very simple prototype/demo
- Single-file experiments
- Learning exercises

---

## Q2: How do I determine point values for different actions?

**Answer:** Balance based on:
1. **Risk level** - Higher risk = higher reward
2. **Difficulty** - Harder actions = more points
3. **Frequency** - Rare items = more points
4. **Progression** - Later levels have higher values

**Example Point Scale:**
```typescript
// Common actions (low risk, frequent)
COIN = 100
BLOCK_BREAK = 50

// Medium actions (some risk, less frequent)
ENEMY_STOMP = 200
BLOCK_SECRET = 500

// High actions (dangerous, rare)
BOSS_DEFEAT = 10000
PERFECT_LEVEL = 50000

// Bonuses (skill-based)
COMBO_2x = 2x multiplier
COMBO_5x = 5x multiplier
NO_DAMAGE = 10000
```

**Testing approach:**
1. Start with rough estimates
2. Playtest extensively
3. Adjust based on player behavior
4. Ensure high scores feel earned

---

## Q3: Should score persist between game sessions?

**Answer:** Keep **current score** session-only, but save **high scores**.

**Why:**
- **Current score** resets for fair comparison
- **High scores** provide long-term goals
- **Session score** creates complete play arcs

**Implementation:**
```typescript
class Game {
  private scoreManager: ScoreManager;
  private highScoreManager: HighScoreManager;
  
  startNewGame(): void {
    // Reset current score
    this.scoreManager.reset();
    
    // But keep high scores
    // (already loaded from localStorage)
  }
  
  onGameOver(): void {
    const finalScore = this.scoreManager.getScore();
    
    // Check if it's a high score
    if (this.highScoreManager.isHighScore(finalScore)) {
      this.highScoreManager.addScore(finalScore, level, time);
    }
  }
}
```

---

## Q4: How long should combo timers last?

**Answer:** 1.5-2.5 seconds is ideal for most platformers.

**Reasoning:**
```
Too short (< 1s):   Frustrating, feels impossible
Sweet spot (1.5-2.5s): Challenging but achievable
Too long (> 3s):    Too easy, no skill required
```

**Context matters:**
- **Fast-paced games:** Shorter (1-1.5s)
- **Platformers:** Medium (1.5-2.5s)
- **Slower games:** Longer (2-3s)

**Example:**
```typescript
class ComboManager {
  // Adjust based on game feel
  private comboTimeout: number = 2000; // 2 seconds
  
  // Option: Make it dynamic
  private getTimeout(): number {
    if (this.gameSpeed === 'fast') return 1500;
    if (this.gameSpeed === 'slow') return 2500;
    return 2000;
  }
}
```

**Playtest tip:** Watch players fail combos. If they say "that's unfair!", it's too short.

---

## Q5: Should combos reset when the player takes damage?

**Answer:** **Yes**, absolutely.

**Why:**
- **Punishment for mistakes** - Damage should have consequences
- **Encourages careful play** - Risk/reward balance
- **Feels fair** - Players understand the mechanic
- **Creates tension** - "Don't get hit to keep combo!"

**Implementation:**
```typescript
class Player {
  takeDamage(): void {
    // Reset combo on damage
    this.comboManager.reset();
    
    // Show combo lost notification
    this.showComboLostNotification();
    
    // Handle damage (power down, invincibility, etc.)
    // ...
  }
}
```

**Exceptions:**
- Star power / invincibility might maintain combo
- "Mercy" mechanic for beginners mode
- Shield/armor that doesn't reset combo

---

## Q6: How do I prevent score display from flickering?

**Answer:** Cache the formatted text and only update when the score changes.

**Problem:**
```typescript
// ❌ Bad: Formats every frame (60 FPS = 60 formats/sec)
render(ctx: CanvasRenderingContext2D): void {
  const text = `SCORE: ${this.score.toString().padStart(6, '0')}`;
  ctx.fillText(text, 20, 30);
}
```

**Solution:**
```typescript
// ✅ Good: Cache formatted text
class ScoreUI {
  private lastScore: number = -1;
  private cachedText: string = 'SCORE: 000000';
  
  render(ctx: CanvasRenderingContext2D): void {
    const currentScore = this.scoreManager.getScore();
    
    // Only regenerate if changed
    if (currentScore !== this.lastScore) {
      this.cachedText = `SCORE: ${currentScore.toString().padStart(6, '0')}`;
      this.lastScore = currentScore;
    }
    
    ctx.fillText(this.cachedText, 20, 30);
  }
}
```

**Result:** ~60 string operations per frame → ~1 operation per score change!

---

## Q7: Should I award 1-UPs from coins or score?

**Answer:** **Both**, but with different mechanics.

**From Score (Automatic):**
```typescript
// Every 100,000 points
class ScoreManager {
  addScore(points: number): void {
    this.score += points;
    
    if (this.score >= this.nextOneUpScore) {
      this.livesManager.addLife();
      this.nextOneUpScore += 100000;
    }
  }
}
```

**From Coins (Manual):**
```typescript
// Every 100 coins collected
class CoinManager {
  collectCoin(): void {
    this.coins++;
    
    if (this.coins >= 100) {
      this.livesManager.addLife();
      this.coins = 0; // Reset counter
    }
  }
}
```

**Why both:**
- **Score** rewards overall skill
- **Coins** rewards exploration
- **Variety** keeps gameplay interesting
- **Player choice** in strategies

---

## Q8: How many lives should the player start with?

**Answer:** **3 lives** is the classic standard, but adjust for difficulty.

**Guidelines:**
```
Easy game / casual:     5 lives
Medium difficulty:      3 lives
Hard game / hardcore:   1 life
Roguelike:             1 life (permadeath)
```

**Mario games:** Always start with 3

**Consider:**
- **Target audience** - Kids need more lives
- **Checkpoint frequency** - More checkpoints = fewer lives needed
- **Game length** - Longer games need more lives
- **Difficulty curve** - Harder games need more initial lives

**Implementation:**
```typescript
enum Difficulty {
  EASY = 5,
  NORMAL = 3,
  HARD = 1
}

class Game {
  startNewGame(difficulty: Difficulty): void {
    this.livesManager.reset(difficulty);
  }
}
```

---

## Q9: Should score popups stack or overlap?

**Answer:** Let them **overlap freely** for simplicity and visual excitement.

**Overlap (Recommended):**
```typescript
// Simple, works well
createPopup(x: number, y: number, points: number): void {
  this.popups.push(new ScorePopup(x, y, points));
}
```

**Pros:**
- Simple implementation
- Exciting visual feedback
- Shows combo activity

**Cons:**
- Can be visually cluttered
- Hard to read individual values

**Stack (Alternative):**
```typescript
// Prevents overlap
createPopup(x: number, y: number, points: number): void {
  // Check for nearby popups
  const offset = this.getNearbyPopupCount(x, y) * 20;
  this.popups.push(new ScorePopup(x, y - offset, points));
}
```

**Pros:**
- Cleaner display
- Easier to read

**Cons:**
- More complex code
- Less exciting visually

**Recommendation:** Start with overlap. Add stacking only if players complain.

---

## Q10: How do I handle scores exceeding 999,999?

**Answer:** Use 7+ digit display or switch to abbreviated format.

**Option 1: Expand Display**
```typescript
formatScore(score: number): string {
  // Dynamic padding
  const digits = Math.max(6, score.toString().length);
  return score.toString().padStart(digits, '0');
}
// 1234567 → "1234567"
```

**Option 2: Abbreviated**
```typescript
formatScore(score: number): string {
  if (score >= 1000000) {
    return `${(score / 1000000).toFixed(1)}M`;
  }
  if (score >= 1000) {
    return `${(score / 1000).toFixed(1)}K`;
  }
  return score.toString().padStart(6, '0');
}
// 1234567 → "1.2M"
```

**Mario approach:** Caps at 9,999,999 (7 digits)

---

## Q11: Should I show time remaining or time elapsed?

**Answer:** Show **time remaining** for urgency, **elapsed** for speedruns.

**Time Remaining (Tense):**
```typescript
class LevelTimer {
  render(ctx: CanvasRenderingContext2D): void {
    const seconds = Math.ceil(this.getTimeRemaining() / 1000);
    ctx.fillText(`TIME: ${seconds}`, x, y);
    
    // Warning at 10 seconds
    if (seconds <= 10) {
      ctx.fillStyle = '#ff0000';
    }
  }
}
```

**Best for:**
- Levels with time limits
- Creating urgency
- Traditional platformers (Mario)

**Time Elapsed (Calm):**
```typescript
class Speedrun {
  render(ctx: CanvasRenderingContext2D): void {
    const elapsed = Date.now() - this.startTime;
    const minutes = Math.floor(elapsed / 60000);
    const seconds = Math.floor((elapsed % 60000) / 1000);
    const ms = Math.floor((elapsed % 1000) / 10);
    
    ctx.fillText(`${minutes}:${seconds}.${ms}`, x, y);
  }
}
```

**Best for:**
- Speedrun modes
- Endless runners
- No time pressure

---

## Q12: How do I balance time bonuses?

**Answer:** Award points proportional to remaining time, but cap the maximum.

**Formula:**
```typescript
calculateTimeBonus(): number {
  const secondsRemaining = this.getTimeRemaining() / 1000;
  const pointsPerSecond = 50;
  return Math.floor(secondsRemaining * pointsPerSecond);
}
```

**Guidelines:**
- **Fast clear (80%+ time):** Significant bonus
- **Medium clear (50-80%):** Moderate bonus
- **Slow clear (<50%):** Small bonus
- **Overtime:** No bonus (or penalty)

**Example:**
```
5:00 time limit
4:00 remaining: 240 seconds × 50 = 12,000 bonus ⭐⭐⭐
2:30 remaining: 150 seconds × 50 = 7,500 bonus ⭐⭐
0:30 remaining: 30 seconds × 50 = 1,500 bonus ⭐
```

**Balance tip:** Time bonus should be meaningful but not overshadow other scoring.

---

## Q13: Should damage reduce score?

**Answer:** Usually **no** - it's discouraging. Lose combo instead.

**Don't penalize score directly:**
```typescript
// ❌ Bad: Feels punishing
takeDamage(): void {
  this.scoreManager.subtractScore(1000); // Frustrating!
}
```

**Better penalties:**
```typescript
// ✅ Good: Indirect penalties
takeDamage(): void {
  // 1. Lose combo (missed multipliers)
  this.comboManager.reset();
  
  // 2. Lose no-damage bonus
  this.damageTracker.recordDamage();
  
  // 3. Power down (can't defeat enemies as easily)
  this.powerDown();
}
```

**Why:**
- **Feels fair** - Damage is punishment enough
- **Encouraging** - Score only goes up
- **Motivating** - Players want to improve, not recover

**Exception:** Competitive/arcade games might use score penalties for ranking.

---

## Q14: How do I implement grade/rank systems (S, A, B, C)?

**Answer:** Define score thresholds per level and calculate at completion.

**Implementation:**
```typescript
enum Rank {
  S = 'S',  // Perfect
  A = 'A',  // Excellent
  B = 'B',  // Good
  C = 'C',  // Clear
  D = 'D'   // Poor
}

interface RankThresholds {
  S: number;
  A: number;
  B: number;
  C: number;
}

class LevelRanking {
  private thresholds: RankThresholds = {
    S: 50000,  // 50k+ (no damage, all coins, good time)
    A: 30000,  // 30k+ (few mistakes)
    B: 15000,  // 15k+ (average play)
    C: 5000    // 5k+ (just finished)
  };
  
  calculateRank(score: number): Rank {
    if (score >= this.thresholds.S) return Rank.S;
    if (score >= this.thresholds.A) return Rank.A;
    if (score >= this.thresholds.B) return Rank.B;
    if (score >= this.thresholds.C) return Rank.C;
    return Rank.D;
  }
  
  // Factor in multiple criteria
  calculateDetailedRank(
    score: number,
    time: number,
    damage: boolean,
    coins: number,
    totalCoins: number
  ): Rank {
    let points = 0;
    
    // Score (0-40 points)
    points += Math.min(40, score / 1000);
    
    // Time (0-30 points)
    const timeScore = (time / timeLimit) * 30;
    points += timeScore;
    
    // No damage (30 points)
    if (!damage) points += 30;
    
    // All coins (10 points)
    if (coins === totalCoins) points += 10;
    
    // Total out of 110
    if (points >= 100) return Rank.S;
    if (points >= 80) return Rank.A;
    if (points >= 60) return Rank.B;
    if (points >= 40) return Rank.C;
    return Rank.D;
  }
}
```

**Display:**
```typescript
class RankScreen {
  render(ctx: CanvasRenderingContext2D): void {
    const rank = this.calculateRank(this.score);
    
    // Large rank letter
    ctx.font = 'bold 120px Arial';
    const colors = {
      S: '#FFD700',  // Gold
      A: '#00FF00',  // Green
      B: '#0000FF',  // Blue
      C: '#FFA500',  // Orange
      D: '#FF0000'   // Red
    };
    ctx.fillStyle = colors[rank];
    ctx.fillText(rank, centerX, centerY);
  }
}
```

---

## Q15: Should I use an event bus or direct calls for scoring?

**Answer:** Use **event bus** for decoupling and flexibility.

**Direct Calls (Simple):**
```typescript
class Coin {
  collect(): void {
    this.scoreManager.addScore(100); // Direct dependency
  }
}
```

**Event Bus (Better):**
```typescript
class Coin {
  collect(): void {
    eventBus.emit('coinCollected', this); // Decoupled
  }
}

class Game {
  setupEvents(): void {
    eventBus.on('coinCollected', (coin: Coin) => {
      this.scoreManager.addScore(100);
      this.comboManager.addCombo();
      this.popupManager.createPopup(coin.x, coin.y, 100);
    });
  }
}
```

**Benefits:**
- **Decoupling** - Coin doesn't know about scoring
- **Flexibility** - Easy to add/remove handlers
- **Testing** - Can test components in isolation
- **Maintainability** - Clear separation of concerns

**Simple event bus:**
```typescript
class EventBus {
  private events: Map<string, Function[]> = new Map();
  
  on(event: string, callback: Function): void {
    if (!this.events.has(event)) {
      this.events.set(event, []);
    }
    this.events.get(event)!.push(callback);
  }
  
  emit(event: string, ...args: any[]): void {
    const callbacks = this.events.get(event);
    if (callbacks) {
      callbacks.forEach(cb => cb(...args));
    }
  }
}

const eventBus = new EventBus();
```

---

## Summary of Best Practices

1. **Use a ScoreManager class** for organization
2. **Balance point values** through playtesting
3. **Save high scores** but reset current score
4. **Keep combo timers** around 1.5-2.5 seconds
5. **Reset combos** on damage
6. **Cache formatted text** to prevent flickering
7. **Award 1-UPs** from both score and coins
8. **Start with 3 lives** for normal difficulty
9. **Let popups overlap** for simplicity
10. **Use time remaining** for urgency
11. **Don't penalize score** directly for damage
12. **Use event bus** for scoring triggers

---

**Congratulations!** You now have all the knowledge to build a complete, engaging scoring and lives system! 🎮✨
