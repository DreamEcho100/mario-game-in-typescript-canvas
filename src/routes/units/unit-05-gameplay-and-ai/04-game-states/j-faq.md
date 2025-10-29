# Game States and State Management - FAQ

**Unit 05: Gameplay, AI & Interactions | Topic 04 | Frequently Asked Questions**

---

## Q1: Should I use one big state machine or multiple smaller ones?

**Answer:** Use **one centralized state machine** for main game flow.

**Why:**
- Clear single source of truth
- Easier debugging
- Simple state transitions
- No conflicting states

**Exception:** You can use sub-state machines within states for complex UI.

---

## Q2: Where should I create state machine instance?

**Answer:** In your main **Game class**, accessible globally.

```typescript
class Game {
  private stateMachine: StateMachine;
  
  constructor() {
    this.stateMachine = new StateMachine();
    this.setupStates();
  }
}
```

---

## Q3: Should states be classes or objects?

**Answer:** **Classes** for complex states, **objects** for simple ones.

**Classes (Better):**
```typescript
class MenuState implements GameState {
  // Full lifecycle, methods, properties
}
```

**Objects (Simple cases only):**
```typescript
const simpleState: GameState = {
  enter: () => {},
  exit: () => {},
  update: () => {},
  render: () => {}
};
```

---

## Q4: How do I pass data between states?

**Answer:** Use a shared game context or pass via transition.

**Option 1: Shared Context**
```typescript
class PlayingState {
  constructor(private game: Game) {}
  
  exit(): void {
    this.game.levelScore = this.score;
  }
}

class LevelCompleteState {
  enter(): void {
    this.score = this.game.levelScore;
  }
}
```

**Option 2: Pass Data**
```typescript
setState(name: string, data?: any): void {
  this.currentState?.exit();
  this.currentState = this.states.get(name)!;
  this.currentState.enter(data);
}
```

---

## Q5: Should I destroy states or keep them in memory?

**Answer:** **Keep in memory** for typical games.

**Why:**
- Faster transitions
- Maintains state
- Small memory footprint

**Destroy only if:**
- Very memory-constrained
- States are huge (100s of MB)
- Mobile devices

---

## Q6: How do I handle async operations in states?

**Answer:** Use promises/async-await in enter() or update().

```typescript
class LoadingState {
  async enter(): Promise<void> {
    await this.loadAssets();
    stateMachine.setState('menu');
  }
  
  private async loadAssets(): Promise<void> {
    // Load images, sounds, etc.
  }
}
```

---

## Q7: Can states have sub-states?

**Answer:** Yes, use nested state machines.

```typescript
class PlayingState {
  private subStates: StateMachine;
  
  enter(): void {
    this.subStates = new StateMachine();
    this.subStates.addState('exploring', new ExploringSubState());
    this.subStates.addState('combat', new CombatSubState());
  }
}
```

---

## Q8: How do I prevent state transition loops?

**Answer:** Track previous state and validate transitions.

```typescript
class StateMachine {
  private previousState: string = '';
  
  setState(name: string): void {
    if (name === this.currentStateName) {
      console.warn('Already in this state');
      return;
    }
    this.previousState = this.currentStateName;
    // ... transition
  }
}
```

---

## Q9: Should save/load be a separate state?

**Answer:** **No**, use background operations or loading state.

```typescript
// ✅ Good: Save in background
saveGame(): void {
  try {
    const data = this.createSaveData();
    localStorage.setItem('save', JSON.stringify(data));
    this.showNotification('Game Saved!');
  } catch (e) {
    this.showNotification('Save Failed!');
  }
}

// ❌ Bad: Dedicated save state
// Too disruptive to player experience
```

---

## Q10: How many states is too many?

**Answer:** **8-12 main states** is typical. More requires organization.

**Typical game states:**
1. Loading
2. Main Menu
3. Level Select
4. Playing
5. Paused
6. Level Complete
7. Game Over
8. High Scores
9. Settings
10. Credits

**If you have 20+:** Consider grouping or sub-state machines.

---

## Q11: Should I use string names or enums for states?

**Answer:** **Enums** for type safety.

```typescript
// ✅ Good: Type-safe
enum States {
  MENU = 'menu',
  PLAYING = 'playing'
}
stateMachine.setState(States.MENU);

// ❌ Bad: Typos possible
stateMachine.setState('manu'); // Oops!
```

---

## Q12: How do I debug state transitions?

**Answer:** Log all transitions and use visual debugger.

```typescript
setState(name: string): void {
  console.log(`State: ${this.currentStateName} → ${name}`);
  
  // ... transition logic
}

// Or visual debugger
render(ctx: CanvasRenderingContext2D): void {
  // Top corner
  ctx.fillText(`State: ${stateMachine.getCurrentState()}`, 10, 20);
}
```

---

## Q13: Can I skip states in a transition?

**Answer:** Yes, but ensure proper cleanup.

```typescript
// Direct transition is fine
stateMachine.setState('gameOver'); // From any state

// Just ensure exit() handles cleanup properly
exit(): void {
  // Stop sounds, save progress, etc.
}
```

---

## Q14: How do I handle multiple end conditions?

**Answer:** Check conditions in playing state update.

```typescript
class PlayingState {
  update(deltaTime: number): void {
    this.game.update(deltaTime);
    
    // Multiple exit conditions
    if (this.game.player.dead) {
      stateMachine.setState('gameOver');
    } else if (this.game.level.complete) {
      stateMachine.setState('levelComplete');
    } else if (this.game.input.pause) {
      stateMachine.setState('paused');
    }
  }
}
```

---

## Q15: Should states have access to each other?

**Answer:** **No**, states should be independent. Use state machine or shared context.

```typescript
// ❌ Bad: States coupled
class MenuState {
  goToGame(): void {
    playingState.start(); // Direct dependency
  }
}

// ✅ Good: Use state machine
class MenuState {
  goToGame(): void {
    stateMachine.setState('playing');
  }
}
```

---

## Summary of Best Practices

1. **One centralized state machine** for main flow
2. **Use enums** for state names
3. **Keep states in memory** unless memory-constrained
4. **Always call exit()** before enter()
5. **States are independent** - use shared context for data
6. **Log transitions** for debugging
7. **Validate transitions** to prevent errors
8. **8-12 main states** is typical
9. **Sub-state machines** for complex UI
10. **Background save/load** instead of dedicated states

---

**Congratulations! You've completed Unit 05!** 🎮✨

**Next Up: Unit 06 - Optimization, Polish & Engine Abstractions**
