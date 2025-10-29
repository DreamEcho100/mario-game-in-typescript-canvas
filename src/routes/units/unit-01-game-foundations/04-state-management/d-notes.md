# State Management - Quick Reference

**Unit 01: Game Foundations | Topic 04**

> Copy-paste ready state patterns.

---

## Basic State Machine

```typescript
enum State {
    Idle,
    Walking,
    Jumping,
    Falling
}

class Entity {
    state: State = State.Idle;
    
    update(deltaTime: number) {
        // 1. Check transitions
        this.updateTransitions();
        
        // 2. Execute current state
        this.updateBehavior(deltaTime);
    }
    
    private updateTransitions() {
        switch (this.state) {
            case State.Idle:
                if (condition) this.state = State.Walking;
                break;
            // ... other transitions
        }
    }
    
    private updateBehavior(deltaTime: number) {
        switch (this.state) {
            case State.Idle:
                // Idle behavior
                break;
            case State.Walking:
                // Walking behavior
                break;
        }
    }
}
```

---

## State Machine with Enter/Exit

```typescript
class Entity {
    state: State = State.Idle;
    private prevState: State = State.Idle;
    
    update(deltaTime: number) {
        this.updateTransitions();
        
        // Detect state change
        if (this.state !== this.prevState) {
            this.exitState(this.prevState);
            this.enterState(this.state);
            this.prevState = this.state;
        }
        
        this.updateBehavior(deltaTime);
    }
    
    private enterState(state: State) {
        switch (state) {
            case State.Jumping:
                this.velocityY = -600; // Initialize
                break;
        }
    }
    
    private exitState(state: State) {
        switch (state) {
            case State.Attacking:
                this.weapon.sheathe(); // Clean up
                break;
        }
    }
}
```

---

## Object-Based State Machine

```typescript
interface State {
    name: string;
    onEnter?: () => void;
    onExit?: () => void;
    update: (deltaTime: number) => void;
}

class StateMachine {
    private current: State | null = null;
    private states = new Map<string, State>();
    
    add(state: State) {
        this.states.set(state.name, state);
    }
    
    set(stateName: string) {
        const newState = this.states.get(stateName);
        if (!newState) return;
        
        if (this.current?.onExit) {
            this.current.onExit();
        }
        
        this.current = newState;
        
        if (this.current.onEnter) {
            this.current.onEnter();
        }
    }
    
    update(deltaTime: number) {
        if (this.current) {
            this.current.update(deltaTime);
        }
    }
}

// Usage
const fsm = new StateMachine();

fsm.add({
    name: 'idle',
    onEnter: () => console.log('Enter idle'),
    update: (dt) => {
        if (input.isDown('right')) {
            fsm.set('walking');
        }
    }
});

fsm.add({
    name: 'walking',
    update: (dt) => {
        player.x += 200 * dt;
    }
});

fsm.set('idle');
```

---

## Transition Table

```typescript
type Condition = () => boolean;

interface Transition {
    from: string;
    to: string;
    condition: Condition;
}

class StateMachine {
    private transitions: Transition[] = [];
    
    addTransition(from: string, to: string, condition: Condition) {
        this.transitions.push({from, to, condition});
    }
    
    update(deltaTime: number) {
        // Check transitions
        for (const t of this.transitions) {
            if (this.current?.name === t.from && t.condition()) {
                this.set(t.to);
                break;
            }
        }
        
        // Update state
        if (this.current) {
            this.current.update(deltaTime);
        }
    }
}

// Usage
fsm.addTransition('idle', 'walking', () => input.isDown('right'));
fsm.addTransition('walking', 'idle', () => !input.isDown('right'));
fsm.addTransition('idle', 'jumping', () => input.isPressed('jump') && player.isGrounded);
```

---

## State Stack

```typescript
class StateStack {
    private stack: State[] = [];
    
    push(state: State) {
        if (this.stack.length > 0) {
            const top = this.stack[this.stack.length - 1];
            if (top.onPause) top.onPause();
        }
        
        this.stack.push(state);
        if (state.onEnter) state.onEnter();
    }
    
    pop() {
        const top = this.stack.pop();
        if (top?.onExit) top.onExit();
        
        if (this.stack.length > 0) {
            const current = this.stack[this.stack.length - 1];
            if (current.onResume) current.onResume();
        }
    }
    
    update(deltaTime: number) {
        if (this.stack.length > 0) {
            const top = this.stack[this.stack.length - 1];
            top.update(deltaTime);
        }
    }
    
    render(ctx: CanvasRenderingContext2D) {
        // Render all (overlay effect)
        this.stack.forEach(state => state.render(ctx));
    }
}
```

---

## Common State Patterns

### Player States

```typescript
enum PlayerState {
    Idle,
    Walking,
    Running,
    Jumping,
    Falling,
    Attacking,
    Hurt,
    Dead
}

// Transitions
Idle → Walking (move input)
Walking → Idle (no input)
Walking → Running (hold shift)
Idle/Walking → Jumping (jump + grounded)
Jumping → Falling (velocityY > 0)
Falling → Idle (grounded)
Any → Hurt (take damage)
Hurt → Idle (after delay)
Hurt → Dead (health = 0)
```

### Enemy AI States

```typescript
enum EnemyState {
    Idle,
    Patrolling,
    Chasing,
    Attacking,
    Fleeing,
    Dead
}

// Distance-based transitions
const dist = distance(enemy, player);

if (dist < 50) state = Attacking;
else if (dist < 200) state = Chasing;
else if (dist > 300) state = Patrolling;

// Health-based
if (health < 20) state = Fleeing;
if (health = 0) state = Dead;
```

### Game States

```typescript
enum GameState {
    MainMenu,
    Playing,
    Paused,
    GameOver,
    LevelComplete
}

// Typical flow
MainMenu → Playing (start game)
Playing → Paused (press P)
Paused → Playing (press P)
Playing → GameOver (player dies)
Playing → LevelComplete (win condition)
LevelComplete → Playing (next level)
GameOver/LevelComplete → MainMenu (restart)
```

---

## State Timers

```typescript
class Entity {
    state: State;
    private stateTime = 0;
    
    update(deltaTime: number) {
        this.stateTime += deltaTime;
        
        switch (this.state) {
            case State.Attacking:
                if (this.stateTime > 0.5) {
                    this.state = State.Idle;
                }
                break;
                
            case State.Invincible:
                if (this.stateTime > 3.0) {
                    this.state = State.Idle;
                }
                break;
        }
    }
    
    private enterState(state: State) {
        this.stateTime = 0; // Reset timer
    }
}
```

---

## Hierarchical States

```typescript
class Player {
    mainState: 'grounded' | 'airborne';
    subState: 'idle' | 'walking' | 'running' | 'jumping' | 'falling';
    
    update() {
        if (this.mainState === 'grounded') {
            // Can only be idle/walking/running
            if (jump) {
                this.mainState = 'airborne';
                this.subState = 'jumping';
            }
        } else {
            // Can only be jumping/falling
            if (grounded) {
                this.mainState = 'grounded';
                this.subState = 'idle';
            }
        }
    }
}
```

---

## Guard Conditions

```typescript
class Player {
    // Guards
    canJump(): boolean {
        return this.isGrounded && this.stamina > 10;
    }
    
    canAttack(): boolean {
        return !this.isAttacking && this.weapon !== null;
    }
    
    canRun(): boolean {
        return this.state !== State.Ducking && this.stamina > 0;
    }
    
    // Guarded transitions
    update() {
        if (input.isPressed('jump') && this.canJump()) {
            this.state = State.Jumping;
        }
        
        if (input.isPressed('attack') && this.canAttack()) {
            this.state = State.Attacking;
        }
    }
}
```

---

## State History

```typescript
class Entity {
    state: State;
    private history: State[] = [];
    private readonly HISTORY_SIZE = 5;
    
    setState(newState: State) {
        this.history.push(this.state);
        
        // Keep last N states
        if (this.history.length > this.HISTORY_SIZE) {
            this.history.shift();
        }
        
        this.state = newState;
    }
    
    wasInState(state: State): boolean {
        return this.history.includes(state);
    }
    
    getPreviousState(): State | undefined {
        return this.history[this.history.length - 1];
    }
    
    checkCombo(sequence: State[]): boolean {
        if (this.history.length < sequence.length) {
            return false;
        }
        
        const recent = this.history.slice(-sequence.length);
        return recent.every((s, i) => s === sequence[i]);
    }
}
```

---

## Mini-Example: Complete Player

```typescript
enum PlayerState {
    Idle,
    Walking,
    Jumping,
    Falling
}

class Player {
    state = PlayerState.Idle;
    x = 400;
    y = 400;
    velocityX = 0;
    velocityY = 0;
    isGrounded = false;
    
    update(deltaTime: number, input: InputManager) {
        // Transitions
        switch (this.state) {
            case PlayerState.Idle:
                if (!this.isGrounded) this.state = PlayerState.Falling;
                else if (input.isPressed('jump')) {
                    this.state = PlayerState.Jumping;
                    this.velocityY = -600;
                } else if (input.isDown('left') || input.isDown('right')) {
                    this.state = PlayerState.Walking;
                }
                break;
                
            case PlayerState.Walking:
                if (!this.isGrounded) this.state = PlayerState.Falling;
                else if (input.isPressed('jump')) {
                    this.state = PlayerState.Jumping;
                    this.velocityY = -600;
                } else if (!input.isDown('left') && !input.isDown('right')) {
                    this.state = PlayerState.Idle;
                }
                break;
                
            case PlayerState.Jumping:
                if (this.velocityY > 0) this.state = PlayerState.Falling;
                break;
                
            case PlayerState.Falling:
                if (this.isGrounded) this.state = PlayerState.Idle;
                break;
        }
        
        // Behavior
        switch (this.state) {
            case PlayerState.Idle:
                this.velocityX = 0;
                break;
                
            case PlayerState.Walking:
                if (input.isDown('right')) this.velocityX = 200;
                else if (input.isDown('left')) this.velocityX = -200;
                break;
                
            case PlayerState.Jumping:
            case PlayerState.Falling:
                if (input.isDown('right')) this.velocityX = 140;
                else if (input.isDown('left')) this.velocityX = -140;
                break;
        }
        
        // Physics
        this.velocityY += 980 * deltaTime;
        this.x += this.velocityX * deltaTime;
        this.y += this.velocityY * deltaTime;
        
        if (this.y > 400) {
            this.y = 400;
            this.velocityY = 0;
            this.isGrounded = true;
        } else {
            this.isGrounded = false;
        }
    }
}
```

---

## Common Transitions

### Input-Based

```typescript
// Move
if (input.isDown('right')) state = Walking;

// Jump
if (input.isPressed('jump') && isGrounded) state = Jumping;

// Attack
if (input.isPressed('attack')) state = Attacking;
```

### Physics-Based

```typescript
// Falling
if (velocityY > 0) state = Falling;

// Grounded
if (isGrounded) state = Idle;

// Moving fast
if (Math.abs(velocityX) > 200) state = Running;
```

### Timer-Based

```typescript
// Timeout
if (stateTime > DURATION) state = NextState;

// Animation complete
if (animationFinished) state = Idle;
```

### Health-Based

```typescript
// Dead
if (health <= 0) state = Dead;

// Hurt
if (tookDamage) state = Hurt;

// Low health behavior
if (health < maxHealth * 0.2) state = Fleeing;
```

### Distance-Based

```typescript
// Enemy aggro
const dist = distance(this, player);
if (dist < AGGRO_RANGE) state = Chasing;
if (dist < ATTACK_RANGE) state = Attacking;
if (dist > ESCAPE_RANGE) state = Patrolling;
```

---

## Debug Helpers

### State Visualizer

```typescript
function drawStateDebug(ctx: CanvasRenderingContext2D, entity: Entity) {
    ctx.fillStyle = 'white';
    ctx.font = '14px monospace';
    ctx.fillText(`State: ${State[entity.state]}`, entity.x - 30, entity.y - 50);
    
    if (entity.stateTime !== undefined) {
        ctx.fillText(`Time: ${entity.stateTime.toFixed(2)}s`, entity.x - 30, entity.y - 35);
    }
}
```

### Transition Logger

```typescript
class Entity {
    setState(newState: State) {
        if (newState !== this.state) {
            console.log(`[${Date.now()}] ${State[this.state]} → ${State[newState]}`);
            this.state = newState;
        }
    }
}
```

---

## Best Practices

### ✅ Do

```typescript
// Use enums
enum State { Idle, Walking }

// Separate transitions from behavior
updateTransitions() { /* change state */ }
updateBehavior() { /* execute state */ }

// Use enter/exit
enterState(state) { /* initialize */ }
exitState(state) { /* cleanup */ }

// Guard conditions
if (input && canJump()) { ... }
```

### ❌ Don't

```typescript
// Don't use booleans for states
if (isJumping && isAttacking && ...) // ❌

// Don't mix update/render
updateIdle() { ctx.fillRect(...); } // ❌

// Don't forget to handle all states
switch (state) {
    case Idle: ...; break;
    // Missing other cases! ❌
}

// Don't update wrong state
if (state !== current) {
    exitState(state); // ❌ Wrong state!
}
```

---

## Cheat Sheet

| Pattern | When to Use |
|---------|-------------|
| Enum-based | Simple states, type safety |
| Object-based | Complex states, runtime |
| State stack | Overlays, pause menus |
| Hierarchical | Nested behavior |
| Transition table | Data-driven FSM |
| Guards | Conditional transitions |
| Timers | Time-limited states |
| History | Combos, undo |

---

**Next:** Debug issues in `i-debugging.md`! 🎮