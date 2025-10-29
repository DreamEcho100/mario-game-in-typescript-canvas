# Scoring and Lives System

**Unit 05: Gameplay, AI & Interactions | Topic 03 of 04**

> **Learning Objective:** Master score tracking, life systems, combo mechanics, and UI display for complete gameplay feedback.

---

## Table of Contents

1. [Introduction](#introduction)
2. [Core Concepts](#core-concepts)
3. [Score System Architecture](#score-system-architecture)
4. [Lives System](#lives-system)
5. [Combo System](#combo-system)
6. [High Score Persistence](#high-score-persistence)
7. [UI Display](#ui-display)
8. [Advanced Scoring Mechanics](#advanced-scoring-mechanics)
9. [Application to Mario Game](#application-to-mario-game)
10. [Performance Considerations](#performance-considerations)
11. [Summary](#summary)
12. [Next Steps](#next-steps)

---

## Introduction

### What and Why

Scoring and lives systems are fundamental to creating engaging gameplay. They provide:
- **Player motivation** through measurable progress
- **Risk/reward balance** through lives management
- **Replayability** through high scores and improvement
- **Feedback** on player skill and performance

In Mario games, scoring comes from:
- Collecting coins (10-50 points each)
- Defeating enemies (100-1000 points)
- Breaking blocks (10 points)
- Collecting power-ups (1000 points)
- Time bonuses (depends on remaining time)
- Combo multipliers (consecutive actions)

### What You'll Learn

By the end of this topic, you will:
- ✅ Implement a flexible scoring system
- ✅ Create a lives management system
- ✅ Build combo mechanics with multipliers
- ✅ Display scores and lives in UI
- ✅ Persist high scores using localStorage
- ✅ Handle score animations and popups
- ✅ Create time-based scoring bonuses
- ✅ Implement 1-UP mechanics

### Prerequisites

Before starting this topic, you should understand:
- Object-oriented TypeScript
- Event systems and callbacks
- Basic game state management
- UI rendering basics

### Time Investment

- **Reading:** 60 minutes
- **Exercises:** 3-4 hours
- **Total:** 4-5 hours

---

## Core Concepts

### Score System Components

A complete scoring system needs:

```
┌─────────────────────────────────────┐
│       Score System Architecture     │
├─────────────────────────────────────┤
│                                     │
│  ┌─────────────┐  ┌──────────────┐ │
│  │   Score     │  │    Lives     │ │
│  │   Manager   │  │   Manager    │ │
│  └──────┬──────┘  └──────┬───────┘ │
│         │                │         │
│         ├────────────────┤         │
│         │                │         │
│  ┌──────▼──────┐  ┌──────▼───────┐ │
│  │   Combo     │  │   UI         │ │
│  │   System    │  │   Display    │ │
│  └─────────────┘  └──────────────┘ │
│                                     │
│  ┌─────────────────────────────┐   │
│  │    High Score Storage       │   │
│  │    (localStorage)           │   │
│  └─────────────────────────────┘   │
└─────────────────────────────────────┘
```

### Scoring Principles

**1. Immediate Feedback**
- Show points immediately when earned
- Use visual effects (popups, animations)
- Play sound effects

**2. Clear Value Communication**
- Players should understand what actions give points
- Different actions have clear point values
- Combos and multipliers are visually distinct

**3. Progressive Rewards**
- Higher risk = higher reward
- Skill-based bonuses (combos, no-damage)
- Time-based incentives

**4. 1-UP System**
- Extra lives earned through score milestones
- Encourages score optimization
- Typically every 100,000 or 1,000,000 points

---

## Score System Architecture

### Basic Score Manager

```typescript
class ScoreManager {
  private score: number = 0;
  private highScore: number = 0;
  private listeners: ((score: number) => void)[] = [];

  constructor() {
    this.loadHighScore();
  }

  // Add points to the score
  addScore(points: number): void {
    this.score += points;
    
    // Check for new high score
    if (this.score > this.highScore) {
      this.highScore = this.score;
      this.saveHighScore();
    }

    // Notify listeners
    this.notifyListeners();
  }

  // Get current score
  getScore(): number {
    return this.score;
  }

  // Get high score
  getHighScore(): number {
    return this.highScore;
  }

  // Reset score (new game)
  reset(): void {
    this.score = 0;
    this.notifyListeners();
  }

  // Subscribe to score changes
  onChange(callback: (score: number) => void): void {
    this.listeners.push(callback);
  }

  // Notify all listeners
  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.score));
  }

  // Load high score from storage
  private loadHighScore(): void {
    const saved = localStorage.getItem('highScore');
    if (saved) {
      this.highScore = parseInt(saved, 10);
    }
  }

  // Save high score to storage
  private saveHighScore(): void {
    localStorage.setItem('highScore', this.highScore.toString());
  }
}
```

### Score Events

Create specific event types for different scoring actions:

```typescript
enum ScoreEvent {
  COIN_COLLECTED = 100,
  ENEMY_STOMPED = 200,
  ENEMY_SHELL_HIT = 500,
  BLOCK_BROKEN = 50,
  POWERUP_COLLECTED = 1000,
  SECRET_FOUND = 5000,
  TIME_BONUS = 10, // Per second remaining
  NO_DAMAGE_BONUS = 10000,
}

class ScoreManager {
  // ... previous code ...

  // Add score with event type
  addScoreEvent(event: ScoreEvent, multiplier: number = 1): void {
    const points = event * multiplier;
    this.addScore(points);
    
    // Trigger score popup at player position
    this.createScorePopup(points);
  }

  private createScorePopup(points: number): void {
    // Implementation in UI section
  }
}
```

### Score Value Tables

Define clear point values for all actions:

```typescript
interface ScoreValues {
  // Collectibles
  coinBronze: number;
  coinSilver: number;
  coinGold: number;
  
  // Enemies
  goomba: number;
  koopaGreen: number;
  koopaRed: number;
  hammerBro: number;
  bossDefeated: number;
  
  // Blocks
  blockBreak: number;
  blockHit: number;
  secretBlock: number;
  
  // Power-ups
  mushroom: number;
  fireFlower: number;
  star: number;
  oneUp: number;
  
  // Bonuses
  timeBonus: number;      // Per second
  noDamageBonus: number;
  allCoinsBonus: number;
  speedrunBonus: number;
}

const SCORE_VALUES: ScoreValues = {
  coinBronze: 100,
  coinSilver: 200,
  coinGold: 500,
  
  goomba: 100,
  koopaGreen: 200,
  koopaRed: 400,
  hammerBro: 1000,
  bossDefeated: 10000,
  
  blockBreak: 50,
  blockHit: 10,
  secretBlock: 500,
  
  mushroom: 1000,
  fireFlower: 1000,
  star: 1000,
  oneUp: 0, // No score, just adds life
  
  timeBonus: 50,
  noDamageBonus: 10000,
  allCoinsBonus: 5000,
  speedrunBonus: 20000,
};
```

---

## Lives System

### Lives Manager

```typescript
class LivesManager {
  private lives: number;
  private maxLives: number = 99; // Mario cap
  private listeners: ((lives: number) => void)[] = [];

  constructor(startingLives: number = 3) {
    this.lives = startingLives;
  }

  // Add a life
  addLife(): void {
    if (this.lives < this.maxLives) {
      this.lives++;
      this.notifyListeners();
      
      // Play 1-UP sound
      this.play1UpSound();
    }
  }

  // Remove a life
  loseLife(): void {
    this.lives--;
    this.notifyListeners();
    
    if (this.lives <= 0) {
      this.triggerGameOver();
    }
  }

  // Get current lives
  getLives(): number {
    return this.lives;
  }

  // Check if player has lives remaining
  hasLivesRemaining(): boolean {
    return this.lives > 0;
  }

  // Reset lives
  reset(startingLives: number = 3): void {
    this.lives = startingLives;
    this.notifyListeners();
  }

  // Subscribe to life changes
  onChange(callback: (lives: number) => void): void {
    this.listeners.push(callback);
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.lives));
  }

  private play1UpSound(): void {
    // Play 1-UP jingle
  }

  private triggerGameOver(): void {
    // Trigger game over state
  }
}
```

### Score-Based 1-UP System

Award extra lives at score milestones:

```typescript
class ScoreManager {
  private livesManager: LivesManager;
  private nextOneUpScore: number = 100000;
  private oneUpInterval: number = 100000;

  constructor(livesManager: LivesManager) {
    this.livesManager = livesManager;
  }

  addScore(points: number): void {
    this.score += points;

    // Check for 1-UP milestone
    if (this.score >= this.nextOneUpScore) {
      this.livesManager.addLife();
      this.nextOneUpScore += this.oneUpInterval;
    }

    // ... rest of addScore logic
  }
}
```

### Damage and Death Handling

```typescript
class Player {
  private livesManager: LivesManager;
  private scoreManager: ScoreManager;
  private powerState: PowerState = PowerState.SMALL;
  private invincible: boolean = false;
  private invincibilityTimer: number = 0;

  takeDamage(): void {
    // Don't take damage if invincible or star power
    if (this.invincible) return;

    // Handle power-down
    if (this.powerState === PowerState.FIRE) {
      this.powerState = PowerState.BIG;
      this.startInvincibility(2000); // 2 seconds
    } else if (this.powerState === PowerState.BIG) {
      this.powerState = PowerState.SMALL;
      this.startInvincibility(2000);
    } else {
      // Small Mario dies
      this.die();
    }
  }

  private die(): void {
    // Lose a life
    this.livesManager.loseLife();

    // Death animation
    this.playDeathAnimation();

    // Reset player position after animation
    setTimeout(() => {
      if (this.livesManager.hasLivesRemaining()) {
        this.respawn();
      }
    }, 2000);
  }

  private respawn(): void {
    // Reset to checkpoint or level start
    this.x = this.checkpointX;
    this.y = this.checkpointY;
    this.powerState = PowerState.SMALL;
    this.startInvincibility(3000); // 3 seconds after respawn
  }

  private startInvincibility(duration: number): void {
    this.invincible = true;
    this.invincibilityTimer = duration;
  }

  update(deltaTime: number): void {
    // Update invincibility
    if (this.invincible) {
      this.invincibilityTimer -= deltaTime;
      if (this.invincibilityTimer <= 0) {
        this.invincible = false;
      }
    }

    // ... rest of update logic
  }

  render(ctx: CanvasRenderingContext2D): void {
    // Flicker during invincibility
    if (this.invincible && Math.floor(Date.now() / 100) % 2 === 0) {
      return; // Skip rendering every other frame
    }

    // ... normal rendering
  }
}
```

---

## Combo System

### Combo Manager

```typescript
class ComboManager {
  private combo: number = 0;
  private comboTimer: number = 0;
  private comboTimeout: number = 2000; // 2 seconds
  private maxCombo: number = 0;
  private listeners: ((combo: number) => void)[] = [];

  // Add to combo
  addCombo(): void {
    this.combo++;
    this.comboTimer = this.comboTimeout;
    
    // Track max combo
    if (this.combo > this.maxCombo) {
      this.maxCombo = this.combo;
    }

    this.notifyListeners();
  }

  // Get current combo
  getCombo(): number {
    return this.combo;
  }

  // Get combo multiplier
  getMultiplier(): number {
    if (this.combo < 2) return 1;
    if (this.combo < 5) return 2;
    if (this.combo < 10) return 3;
    if (this.combo < 20) return 4;
    return 5; // Max 5x multiplier
  }

  // Reset combo
  reset(): void {
    if (this.combo > 0) {
      this.combo = 0;
      this.notifyListeners();
    }
  }

  // Update combo timer
  update(deltaTime: number): void {
    if (this.combo > 0) {
      this.comboTimer -= deltaTime;
      
      if (this.comboTimer <= 0) {
        this.reset();
      }
    }
  }

  // Subscribe to combo changes
  onChange(callback: (combo: number) => void): void {
    this.listeners.push(callback);
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.combo));
  }

  // Get max combo achieved
  getMaxCombo(): number {
    return this.maxCombo;
  }
}
```

### Integrating Combo with Score

```typescript
class ScoreManager {
  private comboManager: ComboManager;

  constructor(comboManager: ComboManager) {
    this.comboManager = comboManager;
  }

  // Add score with combo multiplier
  addScoreWithCombo(points: number, comboable: boolean = true): void {
    let finalPoints = points;

    if (comboable) {
      // Add to combo
      this.comboManager.addCombo();
      
      // Apply multiplier
      const multiplier = this.comboManager.getMultiplier();
      finalPoints = points * multiplier;
    }

    this.addScore(finalPoints);
    
    // Show multiplier in popup
    this.createScorePopup(finalPoints, this.comboManager.getMultiplier());
  }
}
```

### Combo Triggers

Define what actions can build combos:

```typescript
class Game {
  private scoreManager: ScoreManager;
  private comboManager: ComboManager;

  // Enemy defeated
  onEnemyDefeated(enemy: Enemy): void {
    const points = this.getEnemyPoints(enemy);
    
    // Stomping enemies builds combo
    this.scoreManager.addScoreWithCombo(points, true);
  }

  // Coin collected
  onCoinCollected(coin: Coin): void {
    const points = 100;
    
    // Collecting coins quickly builds combo
    this.scoreManager.addScoreWithCombo(points, true);
  }

  // Block broken
  onBlockBroken(block: Block): void {
    const points = 50;
    
    // Breaking blocks builds combo
    this.scoreManager.addScoreWithCombo(points, true);
  }

  // Power-up collected (doesn't combo)
  onPowerUpCollected(powerup: PowerUp): void {
    const points = 1000;
    
    // Power-ups don't build combo
    this.scoreManager.addScoreWithCombo(points, false);
  }
}
```

---

## High Score Persistence

### LocalStorage Implementation

```typescript
interface HighScoreEntry {
  score: number;
  date: string;
  level: string;
  time: number;
}

class HighScoreManager {
  private highScores: HighScoreEntry[] = [];
  private maxEntries: number = 10;
  private storageKey: string = 'marioHighScores';

  constructor() {
    this.load();
  }

  // Add a new score
  addScore(score: number, level: string, time: number): boolean {
    const entry: HighScoreEntry = {
      score,
      date: new Date().toISOString(),
      level,
      time
    };

    // Add to list
    this.highScores.push(entry);

    // Sort by score (descending)
    this.highScores.sort((a, b) => b.score - a.score);

    // Keep only top entries
    this.highScores = this.highScores.slice(0, this.maxEntries);

    // Save to storage
    this.save();

    // Return true if it made the list
    return this.highScores.includes(entry);
  }

  // Get all high scores
  getHighScores(): HighScoreEntry[] {
    return [...this.highScores];
  }

  // Get top score
  getTopScore(): number {
    return this.highScores.length > 0 ? this.highScores[0].score : 0;
  }

  // Check if score qualifies
  isHighScore(score: number): boolean {
    if (this.highScores.length < this.maxEntries) return true;
    return score > this.highScores[this.highScores.length - 1].score;
  }

  // Clear all high scores
  clear(): void {
    this.highScores = [];
    this.save();
  }

  // Save to localStorage
  private save(): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.highScores));
    } catch (e) {
      console.error('Failed to save high scores:', e);
    }
  }

  // Load from localStorage
  private load(): void {
    try {
      const data = localStorage.getItem(this.storageKey);
      if (data) {
        this.highScores = JSON.parse(data);
      }
    } catch (e) {
      console.error('Failed to load high scores:', e);
      this.highScores = [];
    }
  }
}
```

### High Score Display Screen

```typescript
class HighScoreScreen {
  private highScoreManager: HighScoreManager;

  render(ctx: CanvasRenderingContext2D): void {
    const scores = this.highScoreManager.getHighScores();

    // Title
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('HIGH SCORES', ctx.canvas.width / 2, 80);

    // Header
    ctx.font = '20px Arial';
    ctx.fillText('RANK   SCORE      LEVEL     TIME     DATE', 
                 ctx.canvas.width / 2, 140);

    // Scores
    ctx.font = '24px monospace';
    scores.forEach((entry, index) => {
      const y = 180 + index * 40;
      const rank = (index + 1).toString().padStart(2, ' ');
      const score = entry.score.toString().padStart(8, ' ');
      const time = this.formatTime(entry.time);
      const date = new Date(entry.date).toLocaleDateString();

      const text = `${rank}    ${score}    ${entry.level}    ${time}    ${date}`;
      
      // Highlight top 3
      if (index < 3) {
        ctx.fillStyle = ['#FFD700', '#C0C0C0', '#CD7F32'][index];
      } else {
        ctx.fillStyle = '#ffffff';
      }

      ctx.fillText(text, ctx.canvas.width / 2, y);
    });
  }

  private formatTime(ms: number): string {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
}
```

---

## UI Display

### Score Display

```typescript
class ScoreUI {
  private scoreManager: ScoreManager;
  private livesManager: LivesManager;
  private comboManager: ComboManager;

  render(ctx: CanvasRenderingContext2D): void {
    // Save context
    ctx.save();

    // Score
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(`SCORE: ${this.formatScore(this.scoreManager.getScore())}`, 20, 30);

    // High score
    ctx.fillStyle = '#ffff00';
    ctx.textAlign = 'right';
    ctx.fillText(`HI-SCORE: ${this.formatScore(this.scoreManager.getHighScore())}`, 
                 ctx.canvas.width - 20, 30);

    // Lives (Mario heads)
    this.renderLives(ctx);

    // Combo (if active)
    if (this.comboManager.getCombo() > 1) {
      this.renderCombo(ctx);
    }

    // Restore context
    ctx.restore();
  }

  private formatScore(score: number): string {
    // Pad with zeros (000000)
    return score.toString().padStart(6, '0');
  }

  private renderLives(ctx: CanvasRenderingContext2D): void {
    const lives = this.livesManager.getLives();
    const x = 20;
    const y = 60;

    // "LIVES:" label
    ctx.fillStyle = '#ffffff';
    ctx.font = '20px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('×', x, y);

    // Number of lives
    ctx.fillText(lives.toString(), x + 30, y);

    // Mario head icon (simplified)
    ctx.fillStyle = '#ff0000';
    ctx.beginPath();
    ctx.arc(x + 60, y - 6, 10, 0, Math.PI * 2);
    ctx.fill();
  }

  private renderCombo(ctx: CanvasRenderingContext2D): void {
    const combo = this.comboManager.getCombo();
    const multiplier = this.comboManager.getMultiplier();

    // Position at top center
    const x = ctx.canvas.width / 2;
    const y = 30;

    // Background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(x - 80, y - 25, 160, 40);

    // Border
    ctx.strokeStyle = '#ffff00';
    ctx.lineWidth = 2;
    ctx.strokeRect(x - 80, y - 25, 160, 40);

    // Text
    ctx.fillStyle = '#ffff00';
    ctx.font = 'bold 20px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`COMBO: ${combo}  ×${multiplier}`, x, y);
  }
}
```

### Score Popup

Animated popups that appear when points are earned:

```typescript
class ScorePopup {
  x: number;
  y: number;
  text: string;
  lifetime: number = 1000; // 1 second
  age: number = 0;
  velocityY: number = -50; // Float upward

  constructor(x: number, y: number, points: number, multiplier: number = 1) {
    this.x = x;
    this.y = y;
    
    // Format text
    if (multiplier > 1) {
      this.text = `${points} ×${multiplier}`;
    } else {
      this.text = points.toString();
    }
  }

  update(deltaTime: number): void {
    this.age += deltaTime;
    this.y += this.velocityY * (deltaTime / 1000);
  }

  isExpired(): boolean {
    return this.age >= this.lifetime;
  }

  render(ctx: CanvasRenderingContext2D): void {
    // Calculate opacity (fade out)
    const opacity = 1 - (this.age / this.lifetime);

    // Draw text
    ctx.save();
    ctx.globalAlpha = opacity;
    ctx.fillStyle = '#ffff00';
    ctx.font = 'bold 20px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(this.text, this.x, this.y);
    ctx.restore();
  }
}

class ScorePopupManager {
  private popups: ScorePopup[] = [];

  createPopup(x: number, y: number, points: number, multiplier: number = 1): void {
    this.popups.push(new ScorePopup(x, y, points, multiplier));
  }

  update(deltaTime: number): void {
    // Update all popups
    this.popups.forEach(popup => popup.update(deltaTime));

    // Remove expired popups
    this.popups = this.popups.filter(popup => !popup.isExpired());
  }

  render(ctx: CanvasRenderingContext2D): void {
    this.popups.forEach(popup => popup.render(ctx));
  }
}
```

---

## Advanced Scoring Mechanics

### Time Bonus

Award bonus points for completing levels quickly:

```typescript
class LevelTimer {
  private startTime: number = 0;
  private timeLimit: number = 300000; // 5 minutes in ms
  private timeRemaining: number;

  start(): void {
    this.startTime = Date.now();
    this.timeRemaining = this.timeLimit;
  }

  update(): void {
    const elapsed = Date.now() - this.startTime;
    this.timeRemaining = Math.max(0, this.timeLimit - elapsed);
  }

  getTimeRemaining(): number {
    return this.timeRemaining;
  }

  getTimeRemainingSeconds(): number {
    return Math.floor(this.timeRemaining / 1000);
  }

  hasTimeRemaining(): boolean {
    return this.timeRemaining > 0;
  }

  // Calculate time bonus
  calculateTimeBonus(): number {
    const secondsRemaining = this.getTimeRemainingSeconds();
    return secondsRemaining * 50; // 50 points per second
  }
}

class LevelCompleteScreen {
  private scoreManager: ScoreManager;
  private timer: LevelTimer;

  show(): void {
    // Calculate time bonus
    const timeBonus = this.timer.calculateTimeBonus();
    
    // Award bonus over time (animated counting)
    this.animateTimeBonus(timeBonus);
  }

  private animateTimeBonus(totalBonus: number): void {
    const increment = 50;
    let awarded = 0;

    const interval = setInterval(() => {
      const amount = Math.min(increment, totalBonus - awarded);
      this.scoreManager.addScore(amount);
      awarded += amount;

      if (awarded >= totalBonus) {
        clearInterval(interval);
      }
    }, 50); // Award every 50ms
  }
}
```

### No-Damage Bonus

```typescript
class DamageTracker {
  private damageTaken: boolean = false;

  reset(): void {
    this.damageTaken = false;
  }

  recordDamage(): void {
    this.damageTaken = true;
  }

  hasNoDamage(): boolean {
    return !this.damageTaken;
  }

  calculateBonus(): number {
    return this.hasNoDamage() ? 10000 : 0;
  }
}
```

### All Coins Bonus

```typescript
class CoinTracker {
  private totalCoins: number = 0;
  private collectedCoins: number = 0;

  setTotalCoins(count: number): void {
    this.totalCoins = count;
  }

  collectCoin(): void {
    this.collectedCoins++;
  }

  hasAllCoins(): boolean {
    return this.collectedCoins >= this.totalCoins;
  }

  calculateBonus(): number {
    return this.hasAllCoins() ? 5000 : 0;
  }

  getProgress(): string {
    return `${this.collectedCoins}/${this.totalCoins}`;
  }
}
```

---

## Application to Mario Game

### Complete Integration Example

```typescript
class MarioGame {
  private scoreManager: ScoreManager;
  private livesManager: LivesManager;
  private comboManager: ComboManager;
  private highScoreManager: HighScoreManager;
  private scoreUI: ScoreUI;
  private popupManager: ScorePopupManager;
  private timer: LevelTimer;
  private damageTracker: DamageTracker;
  private coinTracker: CoinTracker;

  constructor() {
    // Initialize managers
    this.livesManager = new LivesManager(3);
    this.comboManager = new ComboManager();
    this.highScoreManager = new HighScoreManager();
    this.scoreManager = new ScoreManager(this.livesManager, this.comboManager);
    
    // Initialize UI
    this.scoreUI = new ScoreUI(this.scoreManager, this.livesManager, this.comboManager);
    this.popupManager = new ScorePopupManager();
    
    // Initialize trackers
    this.timer = new LevelTimer();
    this.damageTracker = new DamageTracker();
    this.coinTracker = new CoinTracker();

    // Set up event listeners
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    // Coin collected
    eventBus.on('coinCollected', (coin: Coin) => {
      this.coinTracker.collectCoin();
      this.scoreManager.addScoreWithCombo(100, true);
      this.popupManager.createPopup(coin.x, coin.y, 100, this.comboManager.getMultiplier());
    });

    // Enemy defeated
    eventBus.on('enemyDefeated', (enemy: Enemy) => {
      const points = this.getEnemyPoints(enemy);
      this.scoreManager.addScoreWithCombo(points, true);
      this.popupManager.createPopup(enemy.x, enemy.y, points, this.comboManager.getMultiplier());
    });

    // Player damaged
    eventBus.on('playerDamaged', () => {
      this.damageTracker.recordDamage();
      this.comboManager.reset();
    });

    // Level complete
    eventBus.on('levelComplete', () => {
      this.onLevelComplete();
    });

    // Game over
    eventBus.on('gameOver', () => {
      this.onGameOver();
    });
  }

  private getEnemyPoints(enemy: Enemy): number {
    switch (enemy.type) {
      case 'goomba': return 100;
      case 'koopa': return 200;
      case 'hammerBro': return 1000;
      default: return 100;
    }
  }

  private onLevelComplete(): void {
    // Calculate bonuses
    const timeBonus = this.timer.calculateTimeBonus();
    const noDamageBonus = this.damageTracker.calculateBonus();
    const allCoinsBonus = this.coinTracker.calculateBonus();

    // Award bonuses
    this.scoreManager.addScore(timeBonus);
    this.scoreManager.addScore(noDamageBonus);
    this.scoreManager.addScore(allCoinsBonus);

    // Show level complete screen
    this.showLevelCompleteScreen();
  }

  private onGameOver(): void {
    const finalScore = this.scoreManager.getScore();
    
    // Check if high score
    if (this.highScoreManager.isHighScore(finalScore)) {
      this.highScoreManager.addScore(
        finalScore,
        this.currentLevel,
        this.timer.getTimeRemaining()
      );
      
      // Show high score entry screen
      this.showHighScoreScreen();
    } else {
      // Show game over screen
      this.showGameOverScreen();
    }
  }

  update(deltaTime: number): void {
    // Update combo timer
    this.comboManager.update(deltaTime);

    // Update level timer
    this.timer.update();

    // Update score popups
    this.popupManager.update(deltaTime);

    // Check for time up
    if (!this.timer.hasTimeRemaining()) {
      this.onTimeUp();
    }
  }

  render(ctx: CanvasRenderingContext2D): void {
    // Render game...

    // Render UI on top
    this.scoreUI.render(ctx);
    this.popupManager.render(ctx);
  }
}
```

### Example: Defeating Multiple Enemies

```typescript
// Player stomps 5 goombas in a row
// Combo: 1, Multiplier: 1x, Score: 100
// Combo: 2, Multiplier: 2x, Score: 200
// Combo: 3, Multiplier: 2x, Score: 200
// Combo: 4, Multiplier: 2x, Score: 200
// Combo: 5, Multiplier: 3x, Score: 300
// Total: 1000 points (vs 500 without combo!)
```

---

## Performance Considerations

### Efficient Score Updates

**❌ Bad: Update UI every frame**
```typescript
render(ctx: CanvasRenderingContext2D): void {
  // Recalculates and redraws every frame
  ctx.fillText(`SCORE: ${this.scoreManager.getScore()}`, 20, 30);
}
```

**✅ Good: Only update when score changes**
```typescript
class ScoreUI {
  private cachedScoreText: string = '';
  private lastScore: number = 0;

  render(ctx: CanvasRenderingContext2D): void {
    const currentScore = this.scoreManager.getScore();
    
    // Only regenerate text if score changed
    if (currentScore !== this.lastScore) {
      this.cachedScoreText = `SCORE: ${this.formatScore(currentScore)}`;
      this.lastScore = currentScore;
    }

    ctx.fillText(this.cachedScoreText, 20, 30);
  }
}
```

### Object Pooling for Popups

```typescript
class ScorePopupManager {
  private activePopups: ScorePopup[] = [];
  private pool: ScorePopup[] = [];
  private maxPoolSize: number = 50;

  createPopup(x: number, y: number, points: number, multiplier: number = 1): void {
    // Try to get from pool
    let popup = this.pool.pop();
    
    if (popup) {
      // Reuse existing popup
      popup.reset(x, y, points, multiplier);
    } else {
      // Create new popup
      popup = new ScorePopup(x, y, points, multiplier);
    }

    this.activePopups.push(popup);
  }

  update(deltaTime: number): void {
    for (let i = this.activePopups.length - 1; i >= 0; i--) {
      const popup = this.activePopups[i];
      popup.update(deltaTime);

      if (popup.isExpired()) {
        // Return to pool
        this.activePopups.splice(i, 1);
        if (this.pool.length < this.maxPoolSize) {
          this.pool.push(popup);
        }
      }
    }
  }
}
```

### LocalStorage Best Practices

```typescript
class HighScoreManager {
  private saveQueued: boolean = false;

  private save(): void {
    // Debounce saves (don't save on every score change)
    if (this.saveQueued) return;

    this.saveQueued = true;

    // Save after a short delay
    setTimeout(() => {
      try {
        localStorage.setItem(this.storageKey, JSON.stringify(this.highScores));
      } catch (e) {
        console.error('Failed to save high scores:', e);
      }
      this.saveQueued = false;
    }, 1000);
  }
}
```

---

## Summary

### What You've Learned

In this topic, you've mastered:

1. **Score System Architecture**
   - Score manager with event listeners
   - Score value tables
   - Score events and categories

2. **Lives System**
   - Lives manager
   - Damage handling
   - Respawn mechanics
   - 1-UP system

3. **Combo System**
   - Combo tracking
   - Multiplier calculation
   - Timer-based combo reset
   - Integration with scoring

4. **High Score Persistence**
   - LocalStorage integration
   - High score tables
   - Data validation

5. **UI Display**
   - Score display
   - Lives display
   - Combo display
   - Animated score popups

6. **Advanced Mechanics**
   - Time bonuses
   - No-damage bonuses
   - Collection bonuses
   - Level completion scoring

### Key Takeaways

- **Immediate feedback** is essential for engaging scoring
- **Combo systems** reward skill and create exciting moments
- **Visual feedback** (popups, animations) enhances the experience
- **High scores** provide long-term goals and replayability
- **Lives system** balances difficulty and progression
- **Performance** matters - use caching and object pooling

### Common Patterns

```typescript
// Observer pattern for score changes
scoreManager.onChange((score) => {
  updateUI(score);
});

// Event-driven scoring
eventBus.on('coinCollected', () => {
  scoreManager.addScore(100);
});

// Combo with timeout
if (actionHappened) {
  combo++;
  resetComboTimer();
}
```

---

## Next Steps

### What's Coming Next

In **Topic 04: Game States**, you'll learn:
- State machine architecture
- Menu systems
- Pause functionality
- Level transitions
- Save/load systems

### Practice Suggestions

1. Add more score events (secrets, collectibles)
2. Create visual effects for high combos
3. Implement leaderboards with names
4. Add achievements system
5. Create score attack mode

### Additional Resources

- Study Mario games' scoring systems
- Research combo mechanics in fighting games
- Learn about progression systems
- Explore achievement design

---

**Congratulations!** You now have a complete scoring and lives system. Players can track their progress, compete for high scores, and experience satisfying feedback for their actions! 🎮✨
