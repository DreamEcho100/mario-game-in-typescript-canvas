# State Management - Complete Lesson

**Unit 01: Game Foundations | Topic 04**

> **Learning Objective:** Master state machines, game states, and entity states to build organized, maintainable games.

---

## Table of Contents

1. [Introduction to State](#introduction)
2. [Game States](#game-states)
3. [Finite State Machines (FSM)](#fsm)
4. [Entity States](#entity-states)
5. [State Transitions](#transitions)
6. [Hierarchical State Machines](#hierarchical)
7. [State Stack](#state-stack)
8. [Mario Implementation](#mario)
9. [Best Practices](#best-practices)

---

<a name="introduction"></a>
## 1. Introduction to State

### What is State?

**State** = The current condition or mode of an object.

**Examples:**
- **Game:** Menu, Playing, Paused, GameOver
- **Player:** Idle, Walking, Jumping, Attacking
- **Enemy:** Patrolling, Chasing, Attacking, Fleeing

### Why State Management Matters

**Without states:**
```typescript
// ❌ Spaghetti code
function updatePlayer() {
    if (jumping && attacking && moving && ...) {
        // What should happen???
    }
}
```

**With states:**
```typescript
// ✅ Clear and maintainable
switch (player.state) {
    case 'idle': updateIdle(); break;
    case 'walking': updateWalking(); break;
    case 'jumping': updateJumping(); break;
}
```

---

<a name="game-states"></a>
## 2. Game States

### Basic Game State Manager

```typescript
enum GameState {
    MainMenu,
    Playing,
    Paused,
    GameOver
}

class Game {
    private state: GameState = GameState.MainMenu;
    
    update(deltaTime: number) {
        switch (this.state) {
            case GameState.MainMenu:
                this.updateMainMenu();
                break;
            case GameState.Playing:
                this.updatePlaying(deltaTime);
                break;
            case GameState.Paused:
                this.updatePaused();
                break;
            case GameState.GameOver:
                this.updateGameOver();
                break;
        }
    }
    
    render(ctx: CanvasRenderingContext2D) {
        switch (this.state) {
            case GameState.MainMenu:
                this.renderMainMenu(ctx);
                break;
            case GameState.Playing:
                this.renderPlaying(ctx);
                break;
            case GameState.Paused:
                this.renderPaused(ctx);
                break;
            case GameState.GameOver:
                this.renderGameOver(ctx);
                break;
        }
    }
    
    setState(newState: GameState) {
        this.state = newState;
    }
}
```

### State with Enter/Exit

```typescript
class Game {
    private state: GameState = GameState.MainMenu;
    
    setState(newState: GameState) {
        // Exit current state
        this.exitState(this.state);
        
        // Change state
        this.state = newState;
        
        // Enter new state
        this.enterState(newState);
    }
    
    private enterState(state: GameState) {
        switch (state) {
            case GameState.Playing:
                this.resetLevel();
                this.startTimer();
                break;
            case GameState.Paused:
                this.saveGameState();
                break;
        }
    }
    
    private exitState(state: GameState) {
        switch (state) {
            case GameState.Playing:
                this.stopTimer();
                break;
        }
    }
}
```

---

<a name="fsm"></a>
## 3. Finite State Machines (FSM)

### What is a FSM?

**Definition:** A model with:
- Finite number of states
- One active state at a time
- Transitions between states based on conditions

### Visual Example

```
    [Idle] ──press right──> [Walking]
      ↑                         |
      |                    press jump
      |                         |
      └────────land─────── [Jumping]
```

### Basic FSM Implementation

```typescript
interface State {
    name: string;
    onEnter?: () => void;
    onExit?: () => void;
    update: (deltaTime: number) => void;
}

class StateMachine {
    private currentState: State | null = null;
    private states: Map<string, State> = new Map();
    
    addState(state: State) {
        this.states.set(state.name, state);
    }
    
    setState(stateName: string) {
        const newState = this.states.get(stateName);
        if (!newState) {
            console.error(`State '${stateName}' not found`);
            return;
        }
        
        // Exit current state
        if (this.currentState?.onExit) {
            this.currentState.onExit();
        }
        
        // Change state
        this.currentState = newState;
        
        // Enter new state
        if (this.currentState.onEnter) {
            this.currentState.onEnter();
        }
    }
    
    update(deltaTime: number) {
        if (this.currentState) {
            this.currentState.update(deltaTime);
        }
    }
    
    getCurrentState(): string {
        return this.currentState?.name || 'none';
    }
}
```

---

<a name="entity-states"></a>
## 4. Entity States

### Player State Machine

```typescript
enum PlayerState {
    Idle,
    Walking,
    Running,
    Jumping,
    Falling,
    Landing,
    Attacking,
    Hurt,
    Dead
}

class Player {
    state: PlayerState = PlayerState.Idle;
    x = 100;
    y = 400;
    velocityX = 0;
    velocityY = 0;
    isGrounded = false;
    
    update(deltaTime: number, input: InputManager) {
        // State transitions
        this.updateStateTransitions(input);
        
        // State-specific behavior
        this.updateCurrentState(deltaTime, input);
        
        // Physics (applies to most states)
        this.applyPhysics(deltaTime);
    }
    
    private updateStateTransitions(input: InputManager) {
        switch (this.state) {
            case PlayerState.Idle:
                if (!this.isGrounded) {
                    this.state = PlayerState.Falling;
                } else if (input.isPressed('jump')) {
                    this.state = PlayerState.Jumping;
                } else if (input.isDown('left') || input.isDown('right')) {
                    this.state = PlayerState.Walking;
                }
                break;
                
            case PlayerState.Walking:
                if (!this.isGrounded) {
                    this.state = PlayerState.Falling;
                } else if (input.isPressed('jump')) {
                    this.state = PlayerState.Jumping;
                } else if (!input.isDown('left') && !input.isDown('right')) {
                    this.state = PlayerState.Idle;
                } else if (input.isDown('shift')) {
                    this.state = PlayerState.Running;
                }
                break;
                
            case PlayerState.Jumping:
                if (this.velocityY > 0) {
                    this.state = PlayerState.Falling;
                }
                break;
                
            case PlayerState.Falling:
                if (this.isGrounded) {
                    this.state = PlayerState.Landing;
                }
                break;
                
            case PlayerState.Landing:
                // Short landing animation, then transition
                setTimeout(() => {
                    this.state = PlayerState.Idle;
                }, 100);
                break;
        }
    }
    
    private updateCurrentState(deltaTime: number, input: InputManager) {
        switch (this.state) {
            case PlayerState.Idle:
                this.velocityX = 0;
                break;
                
            case PlayerState.Walking:
                this.updateWalking(deltaTime, input);
                break;
                
            case PlayerState.Running:
                this.updateRunning(deltaTime, input);
                break;
                
            case PlayerState.Jumping:
                this.updateJumping(deltaTime, input);
                break;
                
            case PlayerState.Falling:
                this.updateFalling(deltaTime, input);
                break;
        }
    }
    
    private updateWalking(deltaTime: number, input: InputManager) {
        const WALK_SPEED = 200;
        
        if (input.isDown('right')) {
            this.velocityX = WALK_SPEED;
        } else if (input.isDown('left')) {
            this.velocityX = -WALK_SPEED;
        }
    }
    
    private updateRunning(deltaTime: number, input: InputManager) {
        const RUN_SPEED = 350;
        
        if (input.isDown('right')) {
            this.velocityX = RUN_SPEED;
        } else if (input.isDown('left')) {
            this.velocityX = -RUN_SPEED;
        }
    }
    
    private updateJumping(deltaTime: number, input: InputManager) {
        // Air control
        if (input.isDown('right')) {
            this.velocityX = 200;
        } else if (input.isDown('left')) {
            this.velocityX = -200;
        }
    }
    
    private updateFalling(deltaTime: number, input: InputManager) {
        // Air control
        if (input.isDown('right')) {
            this.velocityX = 200;
        } else if (input.isDown('left')) {
            this.velocityX = -200;
        }
    }
}
```

---

<a name="transitions"></a>
## 5. State Transitions

### Transition Table

```typescript
type TransitionCondition = () => boolean;

interface Transition {
    from: string;
    to: string;
    condition: TransitionCondition;
}

class StateMachine {
    private transitions: Transition[] = [];
    
    addTransition(from: string, to: string, condition: TransitionCondition) {
        this.transitions.push({from, to, condition});
    }
    
    update(deltaTime: number) {
        // Check transitions
        for (const transition of this.transitions) {
            if (this.currentState?.name === transition.from && transition.condition()) {
                this.setState(transition.to);
                break; // Only one transition per frame
            }
        }
        
        // Update current state
        if (this.currentState) {
            this.currentState.update(deltaTime);
        }
    }
}

// Usage
const player = new StateMachine();

player.addTransition('idle', 'walking', () => 
    input.isDown('left') || input.isDown('right')
);

player.addTransition('walking', 'idle', () => 
    !input.isDown('left') && !input.isDown('right')
);

player.addTransition('idle', 'jumping', () => 
    input.isPressed('jump') && player.isGrounded
);
```

### Guarded Transitions

```typescript
class Player {
    canJump(): boolean {
        return this.isGrounded && this.stamina > 0;
    }
    
    canAttack(): boolean {
        return !this.isAttacking && this.weapon !== null;
    }
}

// Transitions with guards
player.addTransition('idle', 'jumping', () => 
    input.isPressed('jump') && player.canJump()
);

player.addTransition('idle', 'attacking', () => 
    input.isPressed('attack') && player.canAttack()
);
```

---

<a name="hierarchical"></a>
## 6. Hierarchical State Machines

### Nested States

```typescript
// Top level: Player state
// Sub level: Movement type

class Player {
    mainState: 'grounded' | 'airborne' = 'grounded';
    subState: 'idle' | 'walking' | 'running' | 'jumping' | 'falling' = 'idle';
    
    update(deltaTime: number, input: InputManager) {
        // Main state determines which substates are available
        if (this.mainState === 'grounded') {
            this.updateGroundedState(input);
        } else {
            this.updateAirborneState(input);
        }
    }
    
    private updateGroundedState(input: InputManager) {
        // Can only be idle/walking/running when grounded
        if (input.isPressed('jump')) {
            this.mainState = 'airborne';
            this.subState = 'jumping';
        } else if (input.isDown('left') || input.isDown('right')) {
            this.subState = input.isDown('shift') ? 'running' : 'walking';
        } else {
            this.subState = 'idle';
        }
    }
    
    private updateAirborneState(input: InputManager) {
        // Can only be jumping/falling when airborne
        if (this.velocityY > 0) {
            this.subState = 'falling';
        } else {
            this.subState = 'jumping';
        }
        
        if (this.isGrounded) {
            this.mainState = 'grounded';
            this.subState = 'idle';
        }
    }
}
```

### Visual Hierarchy

```
Player
├── Grounded
│   ├── Idle
│   ├── Walking
│   └── Running
└── Airborne
    ├── Jumping
    └── Falling
```

---

<a name="state-stack"></a>
## 7. State Stack

### Pushdown Automaton

**Use case:** Pausing the game without losing game state.

```typescript
class StateStack {
    private stack: State[] = [];
    
    push(state: State) {
        // Pause current state
        if (this.stack.length > 0) {
            const current = this.stack[this.stack.length - 1];
            if (current.onPause) current.onPause();
        }
        
        // Add new state
        this.stack.push(state);
        if (state.onEnter) state.onEnter();
    }
    
    pop() {
        // Exit top state
        const top = this.stack.pop();
        if (top?.onExit) top.onExit();
        
        // Resume previous state
        if (this.stack.length > 0) {
            const current = this.stack[this.stack.length - 1];
            if (current.onResume) current.onResume();
        }
    }
    
    update(deltaTime: number) {
        // Only update top state
        if (this.stack.length > 0) {
            const top = this.stack[this.stack.length - 1];
            top.update(deltaTime);
        }
    }
    
    render(ctx: CanvasRenderingContext2D) {
        // Render all states (bottom to top)
        this.stack.forEach(state => {
            state.render(ctx);
        });
    }
}

// Usage
const stateStack = new StateStack();

// Start game
stateStack.push(menuState);

// Start playing
stateStack.pop(); // Remove menu
stateStack.push(playingState);

// Pause
stateStack.push(pauseState); // Playing still in stack!

// Unpause
stateStack.pop(); // Resume playing
```

---

<a name="mario"></a>
## 8. Mario Implementation

### Complete Mario State Machine

```typescript
enum MarioState {
    Idle,
    Walking,
    Running,
    Jumping,
    Falling,
    Skidding,
    Ducking,
    Dead
}

class Mario {
    state: MarioState = MarioState.Idle;
    x = 100;
    y = 400;
    velocityX = 0;
    velocityY = 0;
    isGrounded = false;
    facing: 'left' | 'right' = 'right';
    
    private readonly WALK_SPEED = 150;
    private readonly RUN_SPEED = 250;
    private readonly SKID_SPEED = 50;
    private readonly JUMP_FORCE = -500;
    
    private jumpTime = 0;
    private isJumping = false;
    
    update(deltaTime: number, input: InputManager) {
        const prevState = this.state;
        
        // State machine
        this.updateTransitions(input);
        
        // State changed - trigger enter/exit
        if (prevState !== this.state) {
            this.exitState(prevState);
            this.enterState(this.state);
        }
        
        // Execute state behavior
        this.executeState(deltaTime, input);
        
        // Physics
        this.velocityY += 980 * deltaTime; // Gravity
        this.x += this.velocityX * deltaTime;
        this.y += this.velocityY * deltaTime;
        
        // Ground collision
        if (this.y > 400) {
            this.y = 400;
            this.velocityY = 0;
            this.isGrounded = true;
        } else {
            this.isGrounded = false;
        }
    }
    
    private updateTransitions(input: InputManager) {
        const left = input.isDown('ArrowLeft') || input.isDown('a');
        const right = input.isDown('ArrowRight') || input.isDown('d');
        const run = input.isDown('Shift') || input.isDown('x');
        const jump = input.isPressed(' ') || input.isPressed('w');
        const down = input.isDown('ArrowDown') || input.isDown('s');
        
        switch (this.state) {
            case MarioState.Idle:
                if (!this.isGrounded) {
                    this.state = MarioState.Falling;
                } else if (jump) {
                    this.state = MarioState.Jumping;
                } else if (down) {
                    this.state = MarioState.Ducking;
                } else if (left || right) {
                    this.state = run ? MarioState.Running : MarioState.Walking;
                }
                break;
                
            case MarioState.Walking:
                if (!this.isGrounded) {
                    this.state = MarioState.Falling;
                } else if (jump) {
                    this.state = MarioState.Jumping;
                } else if (!left && !right) {
                    this.state = MarioState.Idle;
                } else if (run) {
                    this.state = MarioState.Running;
                } else if (this.isSkidding(left, right)) {
                    this.state = MarioState.Skidding;
                }
                break;
                
            case MarioState.Running:
                if (!this.isGrounded) {
                    this.state = MarioState.Falling;
                } else if (jump) {
                    this.state = MarioState.Jumping;
                } else if (!left && !right) {
                    this.state = MarioState.Idle;
                } else if (!run) {
                    this.state = MarioState.Walking;
                } else if (this.isSkidding(left, right)) {
                    this.state = MarioState.Skidding;
                }
                break;
                
            case MarioState.Skidding:
                if (Math.abs(this.velocityX) < this.SKID_SPEED) {
                    this.state = MarioState.Idle;
                }
                break;
                
            case MarioState.Jumping:
                if (this.velocityY > 0) {
                    this.state = MarioState.Falling;
                }
                break;
                
            case MarioState.Falling:
                if (this.isGrounded) {
                    this.state = MarioState.Idle;
                }
                break;
                
            case MarioState.Ducking:
                if (!down) {
                    this.state = MarioState.Idle;
                }
                break;
        }
    }
    
    private isSkidding(left: boolean, right: boolean): boolean {
        // Skid if moving fast and pressing opposite direction
        return (this.velocityX > this.WALK_SPEED && left) ||
               (this.velocityX < -this.WALK_SPEED && right);
    }
    
    private enterState(state: MarioState) {
        switch (state) {
            case MarioState.Jumping:
                this.velocityY = this.JUMP_FORCE;
                this.isJumping = true;
                this.jumpTime = 0;
                break;
                
            case MarioState.Skidding:
                // Play skid sound
                break;
        }
    }
    
    private exitState(state: MarioState) {
        switch (state) {
            case MarioState.Jumping:
                this.isJumping = false;
                break;
        }
    }
    
    private executeState(deltaTime: number, input: InputManager) {
        const left = input.isDown('ArrowLeft') || input.isDown('a');
        const right = input.isDown('ArrowRight') || input.isDown('d');
        const jumpHeld = input.isDown(' ') || input.isDown('w');
        
        switch (this.state) {
            case MarioState.Idle:
                this.velocityX = 0;
                break;
                
            case MarioState.Walking:
                if (right) {
                    this.velocityX = this.WALK_SPEED;
                    this.facing = 'right';
                } else if (left) {
                    this.velocityX = -this.WALK_SPEED;
                    this.facing = 'left';
                }
                break;
                
            case MarioState.Running:
                if (right) {
                    this.velocityX = this.RUN_SPEED;
                    this.facing = 'right';
                } else if (left) {
                    this.velocityX = -this.RUN_SPEED;
                    this.facing = 'left';
                }
                break;
                
            case MarioState.Jumping:
                // Variable height jump
                this.jumpTime += deltaTime;
                if (jumpHeld && this.jumpTime < 0.3 && this.velocityY < 0) {
                    this.velocityY += -200 * deltaTime;
                }
                
                // Air control
                if (right) this.velocityX = this.WALK_SPEED;
                else if (left) this.velocityX = -this.WALK_SPEED;
                break;
                
            case MarioState.Falling:
                // Air control
                if (right) this.velocityX = this.WALK_SPEED;
                else if (left) this.velocityX = -this.WALK_SPEED;
                break;
                
            case MarioState.Skidding:
                // Decelerate
                const decel = 800 * deltaTime;
                if (this.velocityX > 0) {
                    this.velocityX = Math.max(0, this.velocityX - decel);
                } else {
                    this.velocityX = Math.min(0, this.velocityX + decel);
                }
                break;
                
            case MarioState.Ducking:
                this.velocityX = 0;
                break;
        }
    }
    
    draw(ctx: CanvasRenderingContext2D) {
        // Draw based on state
        ctx.save();
        
        // Flip if facing left
        if (this.facing === 'left') {
            ctx.scale(-1, 1);
            ctx.translate(-this.x * 2, 0);
        }
        
        ctx.fillStyle = 'red';
        
        switch (this.state) {
            case MarioState.Idle:
                ctx.fillRect(this.x - 20, this.y - 40, 40, 40);
                break;
                
            case MarioState.Walking:
            case MarioState.Running:
                ctx.fillRect(this.x - 20, this.y - 40, 40, 40);
                // Add walking animation
                break;
                
            case MarioState.Jumping:
            case MarioState.Falling:
                ctx.fillRect(this.x - 20, this.y - 40, 40, 40);
                // Arms up
                break;
                
            case MarioState.Ducking:
                ctx.fillRect(this.x - 20, this.y - 20, 40, 20);
                break;
                
            case MarioState.Skidding:
                ctx.fillRect(this.x - 20, this.y - 40, 40, 40);
                // Leaning back
                break;
        }
        
        ctx.restore();
        
        // Debug: Show state
        ctx.fillStyle = 'white';
        ctx.font = '12px monospace';
        ctx.fillText(MarioState[this.state], this.x - 30, this.y - 50);
    }
}
```

---

<a name="best-practices"></a>
## 9. Best Practices

### ✅ Do's

1. **Use enums for states**
   ```typescript
   enum PlayerState { Idle, Walking, Jumping }
   ```

2. **Separate transitions from behavior**
   ```typescript
   updateTransitions(); // Changes state
   executeState();      // Executes current state
   ```

3. **Add enter/exit callbacks**
   ```typescript
   enterState(state) { /* Initialize */ }
   exitState(state) { /* Clean up */ }
   ```

4. **Keep states simple**
   ```typescript
   // Each state does ONE thing well
   ```

5. **Use state stack for overlays**
   ```typescript
   stateStack.push(pauseState); // Doesn't destroy playing state
   ```

### ❌ Don'ts

1. **Don't mix state logic with rendering**
   ```typescript
   // ❌ Bad
   updateIdle() {
       ctx.fillRect(...); // Rendering in update!
   }
   
   // ✅ Good
   updateIdle() { /* Logic only */ }
   renderIdle(ctx) { /* Rendering */ }
   ```

2. **Don't use booleans for states**
   ```typescript
   // ❌ Bad: Combinatorial explosion
   if (isJumping && isAttacking && !isDead && ...) {}
   
   // ✅ Good: Clear state
   if (state === PlayerState.JumpAttacking) {}
   ```

3. **Don't forget to handle all transitions**
   ```typescript
   // Make sure every state can exit
   ```

4. **Don't update previous state**
   ```typescript
   setState(newState) {
       this.exitState(this.currentState); // Exit old!
       this.currentState = newState;
       this.enterState(newState);
   }
   ```

---

## Summary

### Key Concepts

- **Finite State Machine:** One active state at a time
- **Transitions:** Conditions that change state
- **Enter/Exit:** Callbacks when state changes
- **State Stack:** Multiple states (pause over game)
- **Hierarchical:** Nested states for complex behavior

### State Machine Pattern

```typescript
class Entity {
    state: State;
    
    update(deltaTime: number) {
        // 1. Check transitions
        this.updateTransitions();
        
        // 2. Execute current state
        this.executeState(deltaTime);
    }
}
```

### When to Use States

| Scenario | Solution |
|----------|----------|
| Menu → Game → GameOver | Game state machine |
| Player: Idle/Walk/Jump | Entity state machine |
| Enemy: Patrol/Chase/Attack | Entity state machine |
| Pause menu overlay | State stack |
| Complex animations | State machine |

---

**Next:** Practice in `b-exercises.md`! 🎮