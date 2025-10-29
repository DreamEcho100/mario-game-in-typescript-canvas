# Scoring and Lives System - Debugging Guide

**Unit 05: Gameplay, AI & Interactions | Topic 03 | Common Issues & Solutions**

---

## Bug #1: Score Shows NaN

### Symptom
The score display shows "NaN" instead of a number.

### Root Cause
Attempting arithmetic operations on undefined or non-numeric values, often from localStorage or uninitialized variables.

### Diagnosis Steps
1. Check console for type errors
2. Log score value before display: `console.log(typeof score, score)`
3. Check localStorage data: `console.log(localStorage.getItem('highScore'))`
4. Verify all score additions use numbers

### Solution

**Before (Wrong):**
```typescript
class ScoreManager {
  private score: number;
  
  constructor() {
    // score is undefined!
    const saved = localStorage.getItem('highScore');
    this.highScore = saved; // String, not number!
  }
  
  addScore(points): void {
    this.score += points; // undefined + number = NaN
  }
}
```

**After (Fixed):**
```typescript
class ScoreManager {
  private score: number = 0; // Initialize!
  
  constructor() {
    const saved = localStorage.getItem('highScore');
    this.highScore = saved ? parseInt(saved, 10) : 0; // Parse!
  }
  
  addScore(points: number): void {
    // Validate input
    if (typeof points !== 'number' || isNaN(points)) {
      console.warn('Invalid score:', points);
      return;
    }
    this.score += points;
  }
}
```

### Prevention
- Always initialize numeric properties
- Use TypeScript types
- Parse localStorage data
- Validate inputs
- Use `isNaN()` checks

---

## Bug #2: Score Popups Never Disappear

### Symptom
Score popups remain on screen indefinitely, cluttering the display and causing performance issues.

### Root Cause
Expired popups are not being removed from the array, or the `isExpired()` check is broken.

### Diagnosis Steps
1. Log popup count: `console.log('Active popups:', popups.length)`
2. Check if update() is being called
3. Verify isExpired() logic
4. Check array filtering

### Solution

**Before (Wrong):**
```typescript
class ScorePopupManager {
  private popups: ScorePopup[] = [];
  
  update(deltaTime: number): void {
    // Updates but never removes!
    this.popups.forEach(popup => {
      popup.update(deltaTime);
    });
  }
}

class ScorePopup {
  isExpired(): boolean {
    // Bug: comparison backwards
    return this.lifetime >= this.age;
  }
}
```

**After (Fixed):**
```typescript
class ScorePopupManager {
  private popups: ScorePopup[] = [];
  
  update(deltaTime: number): void {
    // Update all
    this.popups.forEach(popup => popup.update(deltaTime));
    
    // Remove expired
    this.popups = this.popups.filter(popup => !popup.isExpired());
  }
}

class ScorePopup {
  isExpired(): boolean {
    // Correct: age exceeds lifetime
    return this.age >= this.lifetime;
  }
}
```

### Prevention
- Always clean up expired objects
- Test expiration logic
- Log array lengths during development
- Use performance monitoring

---

## Bug #3: Combo Resets Instantly

### Symptom
Combo counter resets to 0 immediately after incrementing, never building up.

### Root Cause
Combo timer not being reset when actions happen, or timer decrements too fast.

### Diagnosis Steps
1. Log combo and timer values
2. Check if timer resets on action
3. Verify deltaTime units (ms vs seconds)
4. Check timeout duration

### Solution

**Before (Wrong):**
```typescript
class ComboManager {
  private combo: number = 0;
  private timer: number = 0;
  private timeout: number = 2; // Too short! (2ms instead of 2000ms)
  
  addCombo(): void {
    this.combo++;
    // Forgot to reset timer!
  }
  
  update(deltaTime: number): void {
    this.timer -= deltaTime; // No check if combo active
    if (this.timer <= 0) {
      this.combo = 0;
    }
  }
}
```

**After (Fixed):**
```typescript
class ComboManager {
  private combo: number = 0;
  private timer: number = 0;
  private timeout: number = 2000; // 2 seconds in milliseconds
  
  addCombo(): void {
    this.combo++;
    this.timer = this.timeout; // Reset timer!
  }
  
  update(deltaTime: number): void {
    // Only decrement if combo is active
    if (this.combo > 0) {
      this.timer -= deltaTime;
      
      if (this.timer <= 0) {
        this.combo = 0;
      }
    }
  }
}
```

### Prevention
- Use consistent time units (milliseconds)
- Reset timer on each action
- Only decrement when needed
- Test with different frame rates

---

## Bug #4: Lives Go Negative

### Symptom
Lives counter shows negative numbers like -1, -2, etc.

### Root Cause
No minimum bound check when losing lives, or respawn logic missing.

### Diagnosis Steps
1. Log lives value on damage
2. Check for bound checking
3. Verify game over triggers
4. Test multiple deaths

### Solution

**Before (Wrong):**
```typescript
class LivesManager {
  loseLife(): void {
    this.lives--; // Can go negative!
    // No game over check
  }
}
```

**After (Fixed):**
```typescript
class LivesManager {
  loseLife(): void {
    this.lives--;
    
    // Trigger game over at 0
    if (this.lives <= 0) {
      this.lives = 0; // Clamp to 0
      this.triggerGameOver();
    }
  }
  
  private triggerGameOver(): void {
    // Emit game over event
    eventBus.emit('gameOver');
  }
}
```

### Prevention
- Always check bounds
- Clamp values to valid ranges
- Trigger appropriate game states
- Test edge cases (0 lives)

---

## Bug #5: High Score Won't Save

### Symptom
High score resets to 0 every time the game restarts.

### Root Cause
localStorage quota exceeded, privacy settings blocking storage, or JSON serialization errors.

### Diagnosis Steps
1. Check browser console for storage errors
2. Test localStorage manually: `localStorage.setItem('test', '123')`
3. Check available quota
4. Verify JSON.stringify works
5. Test in incognito mode

### Solution

**Before (Wrong):**
```typescript
class HighScoreManager {
  save(): void {
    // No error handling
    localStorage.setItem('scores', this.scores);
  }
  
  load(): void {
    // No fallback
    this.scores = localStorage.getItem('scores');
  }
}
```

**After (Fixed):**
```typescript
class HighScoreManager {
  save(): void {
    try {
      const data = JSON.stringify(this.scores);
      localStorage.setItem('marioHighScores', data);
    } catch (e) {
      console.error('Failed to save high scores:', e);
      // Could fallback to cookies or show warning
      this.showStorageError();
    }
  }
  
  load(): void {
    try {
      const data = localStorage.getItem('marioHighScores');
      if (data) {
        this.scores = JSON.parse(data);
      } else {
        this.scores = []; // Default
      }
    } catch (e) {
      console.error('Failed to load high scores:', e);
      this.scores = []; // Fallback to empty
    }
  }
  
  private showStorageError(): void {
    // Inform user storage failed
    notificationManager.show(
      'Unable to save high scores. Check browser settings.',
      'error'
    );
  }
}
```

### Prevention
- Always use try-catch with localStorage
- Stringify/parse JSON properly
- Provide fallback values
- Test in private browsing
- Handle quota exceeded errors

---

## Bug #6: Score UI Doesn't Update

### Symptom
Score changes in the manager but doesn't update on screen.

### Root Cause
UI not subscribed to score changes, or render not being called.

### Diagnosis Steps
1. Log score changes
2. Check if render() is called each frame
3. Verify score manager is same instance
4. Check for cached text issues

### Solution

**Before (Wrong):**
```typescript
class Game {
  constructor() {
    this.scoreManager = new ScoreManager();
    this.scoreUI = new ScoreUI(new ScoreManager()); // Different instance!
  }
  
  update(): void {
    // ... game logic
    // Not calling scoreUI.render()
  }
}
```

**After (Fixed):**
```typescript
class Game {
  constructor() {
    this.scoreManager = new ScoreManager();
    this.scoreUI = new ScoreUI(this.scoreManager); // Same instance
  }
  
  update(deltaTime: number): void {
    // ... game logic
  }
  
  render(ctx: CanvasRenderingContext2D): void {
    // ... game rendering
    
    // Always render UI
    this.scoreUI.render(ctx);
  }
}

// Or use observer pattern
class ScoreManager {
  private listeners: Function[] = [];
  
  addScore(points: number): void {
    this.score += points;
    this.notifyListeners();
  }
  
  onChange(callback: Function): void {
    this.listeners.push(callback);
  }
  
  private notifyListeners(): void {
    this.listeners.forEach(cb => cb(this.score));
  }
}
```

### Prevention
- Use same manager instance everywhere
- Call render() in game loop
- Use observer pattern for updates
- Test UI updates with console logs

---

## Bug #7: 1-UP Awards Multiple Times

### Symptom
Player gets multiple lives for passing a single score milestone.

### Root Cause
Milestone not being updated after awarding 1-UP, causing repeated awards.

### Diagnosis Steps
1. Log milestone values
2. Check if milestone updates
3. Test score increments
4. Verify award logic

### Solution

**Before (Wrong):**
```typescript
class OneUpManager {
  private milestone: number = 100000;
  
  checkScore(score: number): void {
    if (score >= this.milestone) {
      this.livesManager.addLife();
      // Forgot to update milestone!
    }
  }
}
```

**After (Fixed):**
```typescript
class OneUpManager {
  private nextMilestone: number = 100000;
  private interval: number = 100000;
  
  checkScore(score: number): void {
    // Check if milestone reached
    while (score >= this.nextMilestone) {
      this.livesManager.addLife();
      this.show1UpNotification();
      this.nextMilestone += this.interval; // Update milestone
    }
  }
}
```

### Prevention
- Update milestone after award
- Use `while` for multiple milestones
- Test with large score jumps
- Log milestone changes

---

## Bug #8: Combo Multiplier Wrong

### Symptom
Combo multiplier doesn't match expected tiers (2x at 2 combo, 3x at 5, etc).

### Root Cause
Off-by-one errors in multiplier calculation logic.

### Diagnosis Steps
1. Log combo count and multiplier
2. Test each tier boundary
3. Check comparison operators
4. Verify tier thresholds

### Solution

**Before (Wrong):**
```typescript
getMultiplier(): number {
  if (this.combo <= 1) return 1;  // Should be <
  if (this.combo <= 4) return 2;  // Wrong boundary
  if (this.combo <= 9) return 3;
  if (this.combo <= 19) return 4;
  return 5;
}
// combo=2 returns 2x ✓
// combo=5 returns 2x ✗ (should be 3x)
```

**After (Fixed):**
```typescript
getMultiplier(): number {
  if (this.combo < 2) return 1;   // 0-1: 1x
  if (this.combo < 5) return 2;   // 2-4: 2x
  if (this.combo < 10) return 3;  // 5-9: 3x
  if (this.combo < 20) return 4;  // 10-19: 4x
  return 5;                       // 20+: 5x
}
```

### Prevention
- Test boundary values
- Use < not <=
- Document tier ranges
- Create unit tests

---

## Bug #9: Score Formatting Breaks

### Symptom
Score displays incorrectly: "001,234" or "NaN" or "12.34".

### Root Cause
Mixing formatting methods, or using wrong string methods.

### Diagnosis Steps
1. Log raw score value
2. Check formatting function
3. Test with various score values
4. Verify string methods

### Solution

**Before (Wrong):**
```typescript
formatScore(score: number): string {
  // Mixing methods causes issues
  return score.toLocaleString().padStart(6, '0');
  // Result: "1,234" → "01,234" (wrong)
}
```

**After (Fixed):**
```typescript
formatScore(score: number): string {
  // Choose one method:
  
  // Option 1: Zero-padded (Mario style)
  return score.toString().padStart(6, '0');
  // 1234 → "001234"
  
  // Option 2: With commas
  return score.toLocaleString();
  // 1234 → "1,234"
  
  // Don't mix them!
}
```

### Prevention
- Choose one formatting style
- Test with various values
- Document format expectations
- Create helper functions

---

## Bug #10: Performance Drops with Popups

### Symptom
Frame rate drops when many score popups are on screen.

### Root Cause
Creating too many popup objects without cleanup, or inefficient rendering.

### Diagnosis Steps
1. Count active popups
2. Profile with browser DevTools
3. Check array sizes
4. Monitor object creation

### Solution

**Before (Wrong):**
```typescript
class ScorePopupManager {
  createPopup(x: number, y: number, points: number): void {
    // Always creates new object
    this.popups.push(new ScorePopup(x, y, points));
  }
  
  render(ctx: CanvasRenderingContext2D): void {
    // Renders all, even expired
    this.popups.forEach(popup => {
      popup.render(ctx);
    });
  }
}
```

**After (Fixed):**
```typescript
class ScorePopupManager {
  private active: ScorePopup[] = [];
  private pool: ScorePopup[] = [];
  private maxPool: number = 50;
  
  createPopup(x: number, y: number, points: number): void {
    // Reuse from pool
    let popup = this.pool.pop();
    if (popup) {
      popup.reset(x, y, points);
    } else {
      popup = new ScorePopup(x, y, points);
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
        if (this.pool.length < this.maxPool) {
          this.pool.push(popup);
        }
      }
    }
  }
  
  render(ctx: CanvasRenderingContext2D): void {
    // Only render active
    this.active.forEach(popup => popup.render(ctx));
  }
}
```

### Prevention
- Use object pooling
- Remove expired objects
- Limit maximum active objects
- Profile regularly

---

## General Debugging Tips

### Use Console Logging
```typescript
class ScoreManager {
  addScore(points: number): void {
    console.log(`Adding ${points} points. Total: ${this.score} → ${this.score + points}`);
    this.score += points;
  }
}
```

### Visual Debugging
```typescript
class ComboUI {
  renderDebug(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = '#ff0000';
    ctx.font = '12px monospace';
    ctx.fillText(`Combo: ${combo}`, 10, 100);
    ctx.fillText(`Timer: ${timer}ms`, 10, 115);
    ctx.fillText(`Multiplier: ${multiplier}x`, 10, 130);
  }
}
```

### Unit Testing
```typescript
describe('ScoreManager', () => {
  it('should add score correctly', () => {
    const manager = new ScoreManager();
    manager.addScore(100);
    expect(manager.getScore()).toBe(100);
  });
  
  it('should not allow negative scores', () => {
    const manager = new ScoreManager();
    manager.subtractScore(100);
    expect(manager.getScore()).toBe(0);
  });
});
```

### Assertions
```typescript
addScore(points: number): void {
  console.assert(
    typeof points === 'number' && !isNaN(points),
    'Score must be a valid number',
    points
  );
  this.score += points;
}
```

---

## Prevention Checklist

Before deploying your scoring system:

- [ ] Initialize all numeric properties
- [ ] Validate all inputs
- [ ] Handle localStorage errors
- [ ] Test with extreme values (0, 999999)
- [ ] Clean up expired objects
- [ ] Use object pooling for performance
- [ ] Check for off-by-one errors
- [ ] Test all tier boundaries
- [ ] Log important state changes
- [ ] Profile performance regularly

---

**Next:** Review `j-faq.md` for common questions and design decisions!
