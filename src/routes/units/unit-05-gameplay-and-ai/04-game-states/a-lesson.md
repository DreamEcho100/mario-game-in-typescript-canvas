# Game States and State Management

**Unit 05: Gameplay, AI & Interactions | Topic 04 of 04**

> **Learning Objective:** Master state machines, game flow control, menu systems, transitions, and save/load functionality for complete game structure.

---

## Table of Contents

1. [Introduction](#introduction)
2. [Core Concepts](#core-concepts)
3. [State Machine Architecture](#state-machine-architecture)
4. [Game States](#game-states)
5. [Menu Systems](#menu-systems)
6. [Transitions and Animations](#transitions-and-animations)
7. [Pause Functionality](#pause-functionality)
8. [Save and Load Systems](#save-and-load-systems)
9. [Application to Mario Game](#application-to-mario-game)
10. [Performance Considerations](#performance-considerations)
11. [Summary](#summary)
12. [Next Steps](#next-steps)

---

## Introduction

### What and Why

Game state management is the backbone of any complete game. It controls the flow between different screens and modes:
- **Menus** (main menu, settings, high scores)
- **Gameplay** (playing the level)
- **Paused** (game paused)
- **Game Over** (lost all lives)
- **Level Complete** (finished a level)
- **Loading** (loading assets or levels)

Without proper state management, your game becomes:
- **Chaotic** - Unclear flow between screens
- **Buggy** - States interfere with each other
- **Unmaintainable** - Hard to add new states
- **Unprofessional** - Jarring transitions

### What You'll Learn

By the end of this topic, you will:
- ✅ Implement a state machine pattern
- ✅ Create all major game states
- ✅ Build menu systems with navigation
- ✅ Add smooth state transitions
- ✅ Implement pause/resume functionality
- ✅ Create save/load systems
- ✅ Handle state-specific input
- ✅ Manage state lifecycle

### Prerequisites

Before starting this topic, you should understand:
- Object-oriented TypeScript
- Enum types
- Event handling
- Basic animation

### Time Investment

- **Reading:** 60-75 minutes
- **Exercises:** 4-5 hours
- **Total:** 5-6 hours

---

## Core Concepts

### What is a Game State?

A **game state** is a distinct mode or screen in your game. Each state has:
- Its own update logic
- Its own render logic
- Its own input handling
- Entry and exit behaviors

```
┌─────────────────────────────────────────┐
│         Game State Machine              │
├─────────────────────────────────────────┤
│                                         │
│   ┌──────────┐      ┌──────────────┐   │
│   │  Main    │─────→│   Playing    │   │
│   │  Menu    │      │              │   │
│   └──────────┘      └──────┬───────┘   │
│       ↑                    │           │
│       │                    ↓           │
│   ┌──────────┐      ┌──────────────┐   │
│   │  Game    │←─────│   Paused     │   │
│   │  Over    │      │              │   │
│   └──────────┘      └──────────────┘   │
│                                         │
└─────────────────────────────────────────┘
```

### State Machine Pattern

A state machine is a design pattern that:
1. Allows exactly **one state active** at a time
2. Defines **transitions** between states
3. Handles **enter/exit** for each state
4. Routes **update/render** to active state

**Benefits:**
- **Clear structure** - Easy to understand flow
- **No interference** - States don't overlap
- **Scalable** - Easy to add new states
- **Debuggable** - Always know current state

---

## State Machine Architecture

### Basic State Interface

```typescript
interface GameState {
  // Called when entering this state
  enter(): void;
  
  // Called when leaving this state
  exit(): void;
  
  // Update logic (called every frame)
  update(deltaTime: number): void;
  
  // Render logic (called every frame)
  render(ctx: CanvasRenderingContext2D): void;
  
  // Handle input (optional)
  handleInput?(input: InputState): void;
}
```

### State Machine Implementation

```typescript
class StateMachine {
  private states: Map<string, GameState> = new Map();
  private currentState: GameState | null = null;
  private currentStateName: string = '';

  // Register a state
  addState(name: string, state: GameState): void {
    this.states.set(name, state);
  }

  // Get current state name
  getCurrentState(): string {
    return this.currentStateName;
  }

  // Change to a different state
  setState(name: string): void {
    const newState = this.states.get(name);
    
    if (!newState) {
      console.error(`State "${name}" not found`);
      return;
    }

    // Exit current state
    if (this.currentState) {
      this.currentState.exit();
    }

    // Enter new state
    this.currentState = newState;
    this.currentStateName = name;
    this.currentState.enter();
  }

  // Update current state
  update(deltaTime: number): void {
    if (this.currentState) {
      this.currentState.update(deltaTime);
    }
  }

  // Render current state
  render(ctx: CanvasRenderingContext2D): void {
    if (this.currentState) {
      this.currentState.render(ctx);
    }
  }

  // Handle input for current state
  handleInput(input: InputState): void {
    if (this.currentState && this.currentState.handleInput) {
      this.currentState.handleInput(input);
    }
  }
}
```

### State Enum

Define all possible states:

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
  CREDITS = 'credits',
}
```

---

## Game States

### 1. Loading State

Shows loading progress while assets load.

```typescript
class LoadingState implements GameState {
  private progress: number = 0;
  private totalAssets: number = 0;
  private loadedAssets: number = 0;

  enter(): void {
    this.progress = 0;
    this.loadAssets();
  }

  exit(): void {
    // Cleanup if needed
  }

  private async loadAssets(): Promise<void> {
    const assets = [
      'player.png',
      'enemies.png',
      'tiles.png',
      // ... more assets
    ];

    this.totalAssets = assets.length;

    for (const asset of assets) {
      await this.loadAsset(asset);
      this.loadedAssets++;
      this.progress = this.loadedAssets / this.totalAssets;
    }

    // Transition to main menu when done
    stateMachine.setState(GameStateType.MAIN_MENU);
  }

  private loadAsset(path: string): Promise<void> {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve();
      img.src = path;
    });
  }

  update(deltaTime: number): void {
    // Loading happens asynchronously
  }

  render(ctx: CanvasRenderingContext2D): void {
    // Clear screen
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    // Loading text
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 36px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('LOADING...', ctx.canvas.width / 2, ctx.canvas.height / 2 - 50);

    // Progress bar
    const barWidth = 400;
    const barHeight = 30;
    const x = (ctx.canvas.width - barWidth) / 2;
    const y = ctx.canvas.height / 2;

    // Background
    ctx.fillStyle = '#333333';
    ctx.fillRect(x, y, barWidth, barHeight);

    // Progress
    ctx.fillStyle = '#00ff00';
    ctx.fillRect(x, y, barWidth * this.progress, barHeight);

    // Border
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, barWidth, barHeight);

    // Percentage
    ctx.fillStyle = '#ffffff';
    ctx.font = '20px Arial';
    ctx.fillText(`${Math.floor(this.progress * 100)}%`, ctx.canvas.width / 2, y + 60);
  }
}
```

### 2. Main Menu State

The entry point showing game options.

```typescript
class MainMenuState implements GameState {
  private selectedOption: number = 0;
  private options: string[] = [
    'START GAME',
    'HIGH SCORES',
    'SETTINGS',
    'CREDITS'
  ];

  enter(): void {
    this.selectedOption = 0;
    // Play menu music
    audioManager.playMusic('menu');
  }

  exit(): void {
    // Stop menu music
    audioManager.stopMusic();
  }

  update(deltaTime: number): void {
    // Menu logic (can add animations here)
  }

  render(ctx: CanvasRenderingContext2D): void {
    // Background
    ctx.fillStyle = '#87CEEB'; // Sky blue
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    // Title
    ctx.fillStyle = '#ff0000';
    ctx.font = 'bold 72px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('SUPER MARIO', ctx.canvas.width / 2, 150);

    // Menu options
    ctx.font = '32px Arial';
    this.options.forEach((option, index) => {
      const y = 300 + index * 60;
      
      // Highlight selected
      if (index === this.selectedOption) {
        ctx.fillStyle = '#ffff00';
        ctx.fillText('▶', ctx.canvas.width / 2 - 150, y);
      } else {
        ctx.fillStyle = '#ffffff';
      }

      ctx.fillText(option, ctx.canvas.width / 2, y);
    });

    // Instructions
    ctx.fillStyle = '#ffffff';
    ctx.font = '20px Arial';
    ctx.fillText('↑↓ to select, Enter to confirm', ctx.canvas.width / 2, ctx.canvas.height - 50);
  }

  handleInput(input: InputState): void {
    // Navigate menu
    if (input.justPressed('ArrowUp')) {
      this.selectedOption = Math.max(0, this.selectedOption - 1);
      audioManager.play('menuMove');
    }
    
    if (input.justPressed('ArrowDown')) {
      this.selectedOption = Math.min(this.options.length - 1, this.selectedOption + 1);
      audioManager.play('menuMove');
    }

    // Select option
    if (input.justPressed('Enter')) {
      this.selectOption();
      audioManager.play('menuSelect');
    }
  }

  private selectOption(): void {
    switch (this.selectedOption) {
      case 0: // Start Game
        stateMachine.setState(GameStateType.PLAYING);
        break;
      case 1: // High Scores
        stateMachine.setState(GameStateType.HIGH_SCORES);
        break;
      case 2: // Settings
        stateMachine.setState(GameStateType.SETTINGS);
        break;
      case 3: // Credits
        stateMachine.setState(GameStateType.CREDITS);
        break;
    }
  }
}
```

### 3. Playing State

The main gameplay state.

```typescript
class PlayingState implements GameState {
  private game: Game;
  private level: Level;

  constructor(game: Game) {
    this.game = game;
  }

  enter(): void {
    // Initialize or resume game
    if (!this.level) {
      this.level = new Level('world-1-1');
    }
    
    // Play game music
    audioManager.playMusic('overworld');
    
    // Reset player input
    this.game.input.reset();
  }

  exit(): void {
    // Cleanup (but keep game state for resume)
  }

  update(deltaTime: number): void {
    // Update game
    this.game.update(deltaTime);

    // Check for pause
    if (this.game.input.justPressed('Escape')) {
      stateMachine.setState(GameStateType.PAUSED);
    }

    // Check for level complete
    if (this.level.isComplete()) {
      stateMachine.setState(GameStateType.LEVEL_COMPLETE);
    }

    // Check for game over
    if (this.game.livesManager.getLives() <= 0) {
      stateMachine.setState(GameStateType.GAME_OVER);
    }
  }

  render(ctx: CanvasRenderingContext2D): void {
    // Render game
    this.game.render(ctx);
  }

  handleInput(input: InputState): void {
    // Input handled by game directly
  }
}
```

### 4. Paused State

Game is paused, showing options.

```typescript
class PausedState implements GameState {
  private selectedOption: number = 0;
  private options: string[] = [
    'RESUME',
    'RESTART LEVEL',
    'SETTINGS',
    'QUIT TO MENU'
  ];
  private previousStateSnapshot: ImageData | null = null;

  enter(): void {
    this.selectedOption = 0;
    
    // Pause game music
    audioManager.pauseMusic();
    
    // Play pause sound
    audioManager.play('pause');
    
    // Capture screen for background
    // (implementation depends on how you access canvas)
  }

  exit(): void {
    // Resume music if returning to playing
    if (stateMachine.getCurrentState() === GameStateType.PLAYING) {
      audioManager.resumeMusic();
    }
  }

  update(deltaTime: number): void {
    // Pause menu doesn't update game
  }

  render(ctx: CanvasRenderingContext2D): void {
    // Render dimmed game background
    if (this.previousStateSnapshot) {
      ctx.putImageData(this.previousStateSnapshot, 0, 0);
    }

    // Dim overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    // Pause title
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('PAUSED', ctx.canvas.width / 2, 150);

    // Menu options
    ctx.font = '28px Arial';
    this.options.forEach((option, index) => {
      const y = 250 + index * 50;
      
      if (index === this.selectedOption) {
        ctx.fillStyle = '#ffff00';
        ctx.fillText('▶', ctx.canvas.width / 2 - 120, y);
      } else {
        ctx.fillStyle = '#ffffff';
      }

      ctx.fillText(option, ctx.canvas.width / 2, y);
    });
  }

  handleInput(input: InputState): void {
    // Navigate
    if (input.justPressed('ArrowUp')) {
      this.selectedOption = Math.max(0, this.selectedOption - 1);
    }
    
    if (input.justPressed('ArrowDown')) {
      this.selectedOption = Math.min(this.options.length - 1, this.selectedOption + 1);
    }

    // Quick unpause
    if (input.justPressed('Escape')) {
      stateMachine.setState(GameStateType.PLAYING);
      return;
    }

    // Select option
    if (input.justPressed('Enter')) {
      this.selectOption();
    }
  }

  private selectOption(): void {
    switch (this.selectedOption) {
      case 0: // Resume
        stateMachine.setState(GameStateType.PLAYING);
        break;
      case 1: // Restart
        // Reset level and resume
        game.restartLevel();
        stateMachine.setState(GameStateType.PLAYING);
        break;
      case 2: // Settings
        stateMachine.setState(GameStateType.SETTINGS);
        break;
      case 3: // Quit
        stateMachine.setState(GameStateType.MAIN_MENU);
        break;
    }
  }
}
```

### 5. Level Complete State

Celebration and bonus calculation.

```typescript
class LevelCompleteState implements GameState {
  private animationTime: number = 0;
  private bonusesAwarded: boolean = false;

  enter(): void {
    this.animationTime = 0;
    this.bonusesAwarded = false;
    
    // Play victory music
    audioManager.playMusic('levelComplete');
  }

  exit(): void {
    audioManager.stopMusic();
  }

  update(deltaTime: number): void {
    this.animationTime += deltaTime;

    // Award bonuses after 1 second
    if (this.animationTime > 1000 && !this.bonusesAwarded) {
      this.awardBonuses();
      this.bonusesAwarded = true;
    }

    // Auto-advance after 5 seconds
    if (this.animationTime > 5000) {
      this.nextLevel();
    }
  }

  render(ctx: CanvasRenderingContext2D): void {
    // Background
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    // Title
    ctx.fillStyle = '#ffff00';
    ctx.font = 'bold 64px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('LEVEL COMPLETE!', ctx.canvas.width / 2, 150);

    // Score breakdown
    ctx.fillStyle = '#ffffff';
    ctx.font = '24px Arial';
    const y = 250;

    ctx.fillText(`Time Bonus: ${game.getTimeBonus()}`, ctx.canvas.width / 2, y);
    ctx.fillText(`No Damage Bonus: ${game.getNoDamageBonus()}`, ctx.canvas.width / 2, y + 40);
    ctx.fillText(`All Coins Bonus: ${game.getAllCoinsBonus()}`, ctx.canvas.width / 2, y + 80);
    
    ctx.font = 'bold 32px Arial';
    ctx.fillStyle = '#ffff00';
    ctx.fillText(`Total Score: ${game.scoreManager.getScore()}`, ctx.canvas.width / 2, y + 140);

    // Continue prompt
    if (this.animationTime > 3000) {
      ctx.fillStyle = '#ffffff';
      ctx.font = '20px Arial';
      ctx.fillText('Press Enter to continue', ctx.canvas.width / 2, ctx.canvas.height - 50);
    }
  }

  handleInput(input: InputState): void {
    if (input.justPressed('Enter') && this.animationTime > 1000) {
      this.nextLevel();
    }
  }

  private awardBonuses(): void {
    const timeBonus = game.timer.calculateTimeBonus();
    const noDamageBonus = game.damageTracker.calculateBonus();
    const allCoinsBonus = game.coinTracker.calculateBonus();

    game.scoreManager.addScore(timeBonus);
    game.scoreManager.addScore(noDamageBonus);
    game.scoreManager.addScore(allCoinsBonus);
  }

  private nextLevel(): void {
    game.loadNextLevel();
    stateMachine.setState(GameStateType.PLAYING);
  }
}
```

### 6. Game Over State

Player lost all lives.

```typescript
class GameOverState implements GameState {
  private animationTime: number = 0;
  private continueAvailable: boolean = true;
  private continueUsed: boolean = false;

  enter(): void {
    this.animationTime = 0;
    this.continueUsed = false;
    
    // Play game over music
    audioManager.playMusic('gameOver');
    
    // Check if high score
    if (game.highScoreManager.isHighScore(game.scoreManager.getScore())) {
      // Could transition to high score entry
    }
  }

  exit(): void {
    audioManager.stopMusic();
  }

  update(deltaTime: number): void {
    this.animationTime += deltaTime;

    // Auto return to menu after 10 seconds
    if (this.animationTime > 10000 && !this.continueUsed) {
      stateMachine.setState(GameStateType.MAIN_MENU);
    }
  }

  render(ctx: CanvasRenderingContext2D): void {
    // Background
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    // Game Over text
    ctx.fillStyle = '#ff0000';
    ctx.font = 'bold 72px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('GAME OVER', ctx.canvas.width / 2, 200);

    // Final score
    ctx.fillStyle = '#ffffff';
    ctx.font = '36px Arial';
    ctx.fillText(`Final Score: ${game.scoreManager.getScore()}`, ctx.canvas.width / 2, 300);

    // High score check
    if (game.highScoreManager.isHighScore(game.scoreManager.getScore())) {
      ctx.fillStyle = '#ffff00';
      ctx.font = 'bold 32px Arial';
      ctx.fillText('NEW HIGH SCORE!', ctx.canvas.width / 2, 360);
    }

    // Continue option
    if (this.continueAvailable && !this.continueUsed) {
      ctx.fillStyle = '#00ff00';
      ctx.font = '24px Arial';
      ctx.fillText('Press Enter to Continue', ctx.canvas.width / 2, 450);
      ctx.fillText('(Returns to last checkpoint)', ctx.canvas.width / 2, 480);
    }

    // Return to menu
    ctx.fillStyle = '#888888';
    ctx.font = '20px Arial';
    ctx.fillText('Press Escape for Main Menu', ctx.canvas.width / 2, ctx.canvas.height - 50);
  }

  handleInput(input: InputState): void {
    // Continue
    if (input.justPressed('Enter') && this.continueAvailable && !this.continueUsed) {
      this.continueUsed = true;
      game.continueFromCheckpoint();
      stateMachine.setState(GameStateType.PLAYING);
    }

    // Return to menu
    if (input.justPressed('Escape')) {
      game.reset();
      stateMachine.setState(GameStateType.MAIN_MENU);
    }
  }
}
```

---

## Menu Systems

### Menu Interface

```typescript
interface MenuItem {
  label: string;
  action: () => void;
  enabled?: boolean;
}

class Menu {
  private items: MenuItem[] = [];
  private selectedIndex: number = 0;

  addItem(item: MenuItem): void {
    this.items.push(item);
  }

  selectNext(): void {
    do {
      this.selectedIndex = (this.selectedIndex + 1) % this.items.length;
    } while (this.items[this.selectedIndex].enabled === false);
  }

  selectPrevious(): void {
    do {
      this.selectedIndex = (this.selectedIndex - 1 + this.items.length) % this.items.length;
    } while (this.items[this.selectedIndex].enabled === false);
  }

  selectCurrent(): void {
    const item = this.items[this.selectedIndex];
    if (item.enabled !== false) {
      item.action();
    }
  }

  render(ctx: CanvasRenderingContext2D, x: number, y: number): void {
    ctx.font = '28px Arial';
    
    this.items.forEach((item, index) => {
      const itemY = y + index * 50;
      
      // Highlight selected
      if (index === this.selectedIndex) {
        ctx.fillStyle = '#ffff00';
        ctx.fillText('▶', x - 40, itemY);
      } else {
        ctx.fillStyle = item.enabled === false ? '#666666' : '#ffffff';
      }

      ctx.fillText(item.label, x, itemY);
    });
  }
}
```

---

## Transitions and Animations

### Fade Transition

```typescript
class FadeTransition {
  private duration: number = 500;
  private elapsed: number = 0;
  private fadeOut: boolean = true;
  private onComplete?: () => void;

  start(fadeOut: boolean, onComplete?: () => void): void {
    this.elapsed = 0;
    this.fadeOut = fadeOut;
    this.onComplete = onComplete;
  }

  update(deltaTime: number): boolean {
    this.elapsed += deltaTime;

    if (this.elapsed >= this.duration) {
      if (this.onComplete) {
        this.onComplete();
      }
      return true; // Complete
    }

    return false; // In progress
  }

  render(ctx: CanvasRenderingContext2D): void {
    const progress = this.elapsed / this.duration;
    const alpha = this.fadeOut ? progress : 1 - progress;

    ctx.fillStyle = `rgba(0, 0, 0, ${alpha})`;
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  }
}
```

---

## Pause Functionality

### Pause Manager

```typescript
class PauseManager {
  private paused: boolean = false;
  private pauseStartTime: number = 0;
  private totalPausedTime: number = 0;

  pause(): void {
    if (!this.paused) {
      this.paused = true;
      this.pauseStartTime = Date.now();
      
      // Pause all systems
      audioManager.pauseAll();
      particleSystem.pause();
    }
  }

  resume(): void {
    if (this.paused) {
      this.paused = false;
      
      // Track paused time
      this.totalPausedTime += Date.now() - this.pauseStartTime;
      
      // Resume all systems
      audioManager.resumeAll();
      particleSystem.resume();
    }
  }

  isPaused(): boolean {
    return this.paused;
  }

  getTotalPausedTime(): number {
    return this.totalPausedTime;
  }
}
```

---

## Save and Load Systems

### Save Data Structure

```typescript
interface SaveData {
  version: string;
  timestamp: number;
  player: {
    lives: number;
    score: number;
    powerState: PowerState;
    coins: number;
  };
  progress: {
    currentWorld: number;
    currentLevel: number;
    unlockedLevels: string[];
    checkpoint: {
      x: number;
      y: number;
    };
  };
  stats: {
    totalCoins: number;
    totalEnemies: number;
    totalTime: number;
  };
}
```

### Save Manager

```typescript
class SaveManager {
  private readonly SAVE_KEY = 'marioSaveData';
  private readonly VERSION = '1.0.0';

  save(game: Game): boolean {
    try {
      const saveData: SaveData = {
        version: this.VERSION,
        timestamp: Date.now(),
        player: {
          lives: game.livesManager.getLives(),
          score: game.scoreManager.getScore(),
          powerState: game.player.getPowerState(),
          coins: game.coinManager.getCoins(),
        },
        progress: {
          currentWorld: game.currentWorld,
          currentLevel: game.currentLevel,
          unlockedLevels: game.unlockedLevels,
          checkpoint: game.getCheckpoint(),
        },
        stats: game.getStats(),
      };

      localStorage.setItem(this.SAVE_KEY, JSON.stringify(saveData));
      return true;
    } catch (e) {
      console.error('Failed to save game:', e);
      return false;
    }
  }

  load(): SaveData | null {
    try {
      const data = localStorage.getItem(this.SAVE_KEY);
      if (!data) return null;

      const saveData: SaveData = JSON.parse(data);
      
      // Version check
      if (saveData.version !== this.VERSION) {
        console.warn('Save data version mismatch');
        // Could migrate old saves here
      }

      return saveData;
    } catch (e) {
      console.error('Failed to load game:', e);
      return null;
    }
  }

  hasSave(): boolean {
    return localStorage.getItem(this.SAVE_KEY) !== null;
  }

  deleteSave(): void {
    localStorage.removeItem(this.SAVE_KEY);
  }
}
```

---

## Application to Mario Game

### Complete Game Flow

```typescript
class MarioGame {
  private stateMachine: StateMachine;
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  
  constructor() {
    this.setupCanvas();
    this.setupStateMachine();
    this.start();
  }

  private setupStateMachine(): void {
    this.stateMachine = new StateMachine();

    // Add all states
    this.stateMachine.addState(GameStateType.LOADING, new LoadingState());
    this.stateMachine.addState(GameStateType.MAIN_MENU, new MainMenuState());
    this.stateMachine.addState(GameStateType.PLAYING, new PlayingState(this));
    this.stateMachine.addState(GameStateType.PAUSED, new PausedState());
    this.stateMachine.addState(GameStateType.LEVEL_COMPLETE, new LevelCompleteState());
    this.stateMachine.addState(GameStateType.GAME_OVER, new GameOverState());
    
    // Start with loading
    this.stateMachine.setState(GameStateType.LOADING);
  }

  private start(): void {
    requestAnimationFrame((timestamp) => this.gameLoop(timestamp));
  }

  private gameLoop(timestamp: number): void {
    const deltaTime = timestamp - this.lastTimestamp;
    this.lastTimestamp = timestamp;

    // Update current state
    this.stateMachine.update(deltaTime);

    // Render current state
    this.stateMachine.render(this.ctx);

    // Continue loop
    requestAnimationFrame((ts) => this.gameLoop(ts));
  }
}
```

---

## Performance Considerations

### State Update Optimization

Only update what's necessary:

```typescript
class PlayingState implements GameState {
  update(deltaTime: number): void {
    // Only update game if not transitioning
    if (!this.transitioning) {
      this.game.update(deltaTime);
    }
  }
}

class PausedState implements GameState {
  update(deltaTime: number): void {
    // Don't update game when paused!
    // Only update pause menu animations if any
  }
}
```

### Memory Management

```typescript
class StateMachine {
  // Option 1: Keep all states in memory (fast transitions)
  private states: Map<string, GameState> = new Map();

  // Option 2: Create/destroy states (less memory)
  private stateFactories: Map<string, () => GameState> = new Map();
  
  setState(name: string): void {
    // Destroy old state
    if (this.currentState) {
      this.currentState.exit();
      // Allow garbage collection
      this.currentState = null;
    }

    // Create new state
    const factory = this.stateFactories.get(name);
    this.currentState = factory();
    this.currentState.enter();
  }
}
```

---

## Summary

### What You've Learned

1. **State Machine Pattern**
   - Single active state
   - Clear transitions
   - Enter/exit lifecycle

2. **Game States**
   - Loading
   - Main Menu
   - Playing
   - Paused
   - Level Complete
   - Game Over

3. **Menu Systems**
   - Navigation
   - Selection
   - Rendering

4. **Transitions**
   - Fade effects
   - Smooth state changes

5. **Pause System**
   - Pause/resume
   - Time tracking

6. **Save/Load**
   - Persistent progress
   - localStorage usage

### Key Takeaways

- **One state active** at a time prevents conflicts
- **Clear enter/exit** makes state changes predictable
- **Centralized state machine** simplifies game flow
- **Save systems** require careful data structuring
- **Transitions** improve perceived quality

---

## Next Steps

**Congratulations!** You've completed Unit 05: Gameplay, AI & Interactions!

### What's Next

**Unit 06: Optimization, Polish & Engine Abstractions**
- Performance profiling
- Architecture patterns
- Building reusable engines

### Practice Suggestions

1. Add more menu screens
2. Create level select screen
3. Implement auto-save
4. Add achievements screen
5. Create settings menu with options

---

**You now have a complete game structure with proper state management!** 🎮✨
