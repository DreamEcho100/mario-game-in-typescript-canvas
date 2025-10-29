# Game States and State Management - Quick Reference

**Unit 05: Gameplay, AI & Interactions | Topic 04 | Cheat Sheet**

---

## State Machine Pattern

```typescript
interface GameState {
  enter(): void;
  exit(): void;
  update(deltaTime: number): void;
  render(ctx: CanvasRenderingContext2D): void;
}

class StateMachine {
  private states: Map<string, GameState> = new Map();
  private currentState: GameState | null = null;
  
  addState(name: string, state: GameState): void {
    this.states.set(name, state);
  }
  
  setState(name: string): void {
    if (this.currentState) this.currentState.exit();
    this.currentState = this.states.get(name)!;
    this.currentState.enter();
  }
  
  update(deltaTime: number): void {
    this.currentState?.update(deltaTime);
  }
  
  render(ctx: CanvasRenderingContext2D): void {
    this.currentState?.render(ctx);
  }
}
```

---

## Common State Types

```typescript
enum GameStateType {
  LOADING = 'loading',
  MAIN_MENU = 'mainMenu',
  PLAYING = 'playing',
  PAUSED = 'paused',
  LEVEL_COMPLETE = 'levelComplete',
  GAME_OVER = 'gameOver',
  HIGH_SCORES = 'highScores',
  SETTINGS = 'settings',
}
```

---

## Menu Navigation Pattern

```typescript
class MenuState implements GameState {
  private selectedIndex: number = 0;
  private options: string[] = ['START', 'OPTIONS', 'QUIT'];
  
  handleInput(input: InputState): void {
    if (input.justPressed('ArrowUp')) {
      this.selectedIndex = (this.selectedIndex - 1 + this.options.length) % this.options.length;
    }
    if (input.justPressed('ArrowDown')) {
      this.selectedIndex = (this.selectedIndex + 1) % this.options.length;
    }
    if (input.justPressed('Enter')) {
      this.selectCurrent();
    }
  }
  
  render(ctx: CanvasRenderingContext2D): void {
    this.options.forEach((option, i) => {
      ctx.fillStyle = i === this.selectedIndex ? '#ffff00' : '#ffffff';
      ctx.fillText(option, x, y + i * 50);
    });
  }
}
```

---

## Pause Pattern

```typescript
class PausedState implements GameState {
  enter(): void {
    audioManager.pauseAll();
  }
  
  exit(): void {
    audioManager.resumeAll();
  }
  
  render(ctx: CanvasRenderingContext2D): void {
    // Dim background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // "PAUSED" text
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 48px Arial';
    ctx.fillText('PAUSED', centerX, centerY);
  }
}
```

---

## Fade Transition

```typescript
class FadeTransition {
  private progress: number = 0;
  private duration: number = 500;
  
  update(deltaTime: number): boolean {
    this.progress += deltaTime / this.duration;
    return this.progress >= 1; // Complete
  }
  
  render(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = `rgba(0, 0, 0, ${this.progress})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
}
```

---

## Save/Load System

```typescript
interface SaveData {
  lives: number;
  score: number;
  level: string;
  checkpoint: { x: number; y: number };
  timestamp: number;
}

class SaveManager {
  private readonly KEY = 'gameSave';
  
  save(data: SaveData): void {
    try {
      localStorage.setItem(this.KEY, JSON.stringify(data));
    } catch (e) {
      console.error('Save failed:', e);
    }
  }
  
  load(): SaveData | null {
    try {
      const data = localStorage.getItem(this.KEY);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      console.error('Load failed:', e);
      return null;
    }
  }
  
  hasSave(): boolean {
    return localStorage.getItem(this.KEY) !== null;
  }
}
```

---

## State Lifecycle

```
1. setState() called
   ↓
2. currentState.exit()
   ↓
3. Switch to new state
   ↓
4. newState.enter()
   ↓
5. Game loop calls:
   - update()
   - render()
```

---

## Common State Transitions

```
Loading → Main Menu → Playing ⇄ Paused
                         ↓
                    Level Complete → Next Level
                         ↓
                    Game Over → Main Menu
```

---

## Tips

- Always call exit() before enter()
- Clear input between states
- Pause audio in pause state
- Save at checkpoints
- Test all transition paths

---

**Keep this reference handy while implementing state management!** 🎮✨
