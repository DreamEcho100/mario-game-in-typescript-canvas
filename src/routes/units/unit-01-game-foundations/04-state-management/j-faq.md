# State Management - Frequently Asked Questions

**Unit 01: Game Foundations | Topic 04**

> Everything you wanted to know about game state management.

---

## Q1: What is state management and why do games need it?

**Short Answer:** State management is organizing how your game entities behave differently in different situations. Without it, code becomes a mess of flags and conditionals.

**Detailed Explanation:**

State management is the practice of explicitly defining and controlling the different "modes" or "conditions" your game entities can be in.

Consider a player character:
- **Idle:** Standing still
- **Walking:** Moving slowly
- **Running:** Moving fast
- **Jumping:** In the air, going up
- **Falling:** In the air, going down
- **Attacking:** Swinging weapon
- **Hurt:** Taking damage
- **Dead:** Game over

Without state management:

```typescript
// ❌ Nightmare code
class Player {
    isIdle = false;
    isWalking = false;
    isRunning = false;
    isJumping = false;
    isFalling = false;
    isAttacking = false;
    isHurt = false;
    isDead = false;
    
    update() {
        if (!isIdle && !isWalking && !isRunning && !isJumping && !isFalling && !isAttacking && !isHurt && !isDead) {
            // What state are we in?!
        }
        
        if (isJumping && isAttacking && isHurt) {
            // Multiple states active?!
        }
    }
}
```

With state management:

```typescript
// ✅ Clean code
enum PlayerState {
    Idle, Walking, Running, Jumping, Falling, Attacking, Hurt, Dead
}

class Player {
    state = PlayerState.Idle;
    
    update() {
        switch (this.state) {
            case PlayerState.Idle:
                // Clear idle behavior
                break;
            case PlayerState.Walking:
                // Clear walking behavior
                break;
            // ...
        }
    }
}
```

**Benefits:**
1. **Clarity:** Always know exactly what state entity is in
2. **Simplicity:** Only one state active at a time
3. **Maintainability:** Easy to add new states
4. **Debuggability:** Can log/display current state
5. **Predictability:** States transition in defined ways

---

## Q2: What's the difference between State Pattern and Finite State Machine (FSM)?

**Short Answer:** State Pattern uses objects/classes for each state. FSM uses enums/strings with switch statements. Both achieve the same goal differently.

**Comparison:**

### Finite State Machine (FSM)

```typescript
enum State { Idle, Walking, Jumping }

class Player {
    state = State.Idle;
    
    update() {
        // Transitions
        switch (this.state) {
            case State.Idle:
                if (input.isDown('right')) this.state = State.Walking;
                break;
        }
        
        // Behavior
        switch (this.state) {
            case State.Idle:
                this.velocityX = 0;
                break;
            case State.Walking:
                this.velocityX = 200;
                break;
        }
    }
}
```

**Pros:**
- Simple to understand
- Easy to implement
- Fast (no object creation)
- Good for simple cases

**Cons:**
- All logic in one class (can get large)
- Hard to share state behavior
- Switch statements everywhere

### State Pattern

```typescript
interface State {
    update(player: Player): void;
}

class IdleState implements State {
    update(player: Player) {
        if (input.isDown('right')) {
            player.setState(new WalkingState());
        }
        player.velocityX = 0;
    }
}

class WalkingState implements State {
    update(player: Player) {
        if (!input.isDown('right')) {
            player.setState(new IdleState());
        }
        player.velocityX = 200;
    }
}

class Player {
    private state: State = new IdleState();
    
    setState(state: State) {
        this.state = state;
    }
    
    update() {
        this.state.update(this);
    }
}
```

**Pros:**
- Each state is a separate class (organized)
- Easy to share/reuse states
- Follows Open/Closed Principle
- Good for complex states

**Cons:**
- More files/classes to manage
- Object creation overhead
- More complex for simple cases

### When to Use Each

**Use FSM when:**
- Simple entities with few states (< 10)
- States have minimal behavior
- Performance is critical
- You're prototyping quickly

**Use State Pattern when:**
- Complex entities with many states
- States have lots of behavior
- You need to share states between entities
- Working with a team (better organization)

**Hybrid Approach (Best of Both):**

```typescript
interface State {
    name: string;
    onEnter?: () => void;
    onExit?: () => void;
    update: (deltaTime: number) => void;
}

class Player {
    private states = new Map<string, State>();
    private current: State | null = null;
    
    addState(state: State) {
        this.states.set(state.name, state);
    }
    
    setState(name: string) {
        const newState = this.states.get(name);
        if (!newState) return;
        
        if (this.current?.onExit) this.current.onExit();
        this.current = newState;
        if (this.current.onEnter) this.current.onEnter();
    }
    
    update(deltaTime: number) {
        if (this.current) this.current.update(deltaTime);
    }
}

// Usage: Object-based but not full classes
player.addState({
    name: 'idle',
    onEnter: () => console.log('Now idle'),
    update: (dt) => {
        if (input.isDown('right')) player.setState('walking');
    }
});
```

---

## Q3: How do I prevent my state machine from getting too complex?

**Short Answer:** Use hierarchical states, guard conditions, and separate concerns. Don't put all logic in state updates.

**Strategies:**

### 1. Hierarchical States

Instead of flat states:

```typescript
// ❌ Flat (too many combinations)
enum State {
    IdleNormal,
    IdleCrouching,
    WalkingNormal,
    WalkingCrouching,
    RunningNormal,
    RunningCrouching,
    JumpingNormal,
    JumpingCrouching,
    // 16 combinations for 2 dimensions!
}
```

Use hierarchy:

```typescript
// ✅ Hierarchical
enum MovementState { Idle, Walking, Running, Jumping }
enum PostureState { Normal, Crouching }

class Player {
    movement = MovementState.Idle;
    posture = PostureState.Normal;
    
    // 4 + 2 = 6 states instead of 8!
}
```

### 2. Separate Concerns

Don't handle everything in state:

```typescript
// ❌ State does too much
class Player {
    update() {
        switch (this.state) {
            case State.Walking:
                this.velocityX = 200; // Movement
                this.playAnimation('walk'); // Animation
                this.playSound('footstep'); // Sound
                this.spawnDust(); // Particles
                this.updateCamera(); // Camera
                break;
        }
    }
}

// ✅ State focuses on behavior, systems handle concerns
class Player {
    update() {
        // State determines behavior
        switch (this.state) {
            case State.Walking:
                this.velocityX = 200;
                break;
        }
        
        // Systems react to state
        this.animationSystem.update(this.state);
        this.audioSystem.update(this.state);
        this.particleSystem.update(this.state);
    }
}
```

### 3. Use Guards

Avoid complex conditionals in transitions:

```typescript
// ❌ Complex conditions
if (input.isPressed('jump') && 
    this.isGrounded && 
    this.stamina > 10 && 
    !this.isStunned && 
    this.state !== State.Attacking) {
    this.state = State.Jumping;
}

// ✅ Guard method
canJump(): boolean {
    return this.isGrounded && 
           this.stamina > 10 && 
           !this.isStunned && 
           this.state !== State.Attacking;
}

if (input.isPressed('jump') && this.canJump()) {
    this.state = State.Jumping;
}
```

### 4. Limit State Count

If you have > 15 states, reconsider:

```typescript
// ❌ Too many specific states
enum State {
    IdleLeft, IdleRight, IdleUp, IdleDown,
    WalkingLeft, WalkingRight, WalkingUp, WalkingDown,
    RunningLeft, RunningRight, RunningUp, RunningDown,
    // 20+ states!
}

// ✅ State + data
enum State { Idle, Walking, Running }

class Player {
    state = State.Idle;
    direction = { x: 0, y: 0 }; // Separate data
}
```

### 5. Extract to Components

```typescript
// ✅ Component-based
class Player {
    state = State.Idle;
    health: HealthComponent;
    movement: MovementComponent;
    combat: CombatComponent;
    
    update() {
        // Each component manages own complexity
        this.health.update(this.state);
        this.movement.update(this.state);
        this.combat.update(this.state);
    }
}
```

---

## Q4: How do I handle state timers (e.g., attack lasts 0.5s)?

**Short Answer:** Track time in current state, reset on state change, check duration in transitions.

**Implementation:**

```typescript
class Player {
    state = PlayerState.Idle;
    private stateTime = 0; // Time in current state
    
    update(deltaTime: number) {
        // Increment timer
        this.stateTime += deltaTime;
        
        this.updateTransitions();
        this.updateBehavior(deltaTime);
    }
    
    private updateTransitions() {
        switch (this.state) {
            case PlayerState.Attacking:
                // Exit after duration
                if (this.stateTime > 0.5) {
                    this.state = PlayerState.Idle;
                }
                break;
                
            case PlayerState.Invincible:
                // Timed invincibility
                if (this.stateTime > 2.0) {
                    this.state = PlayerState.Idle;
                }
                break;
        }
    }
    
    private setState(newState: PlayerState) {
        if (newState === this.state) return;
        
        this.state = newState;
        this.stateTime = 0; // Reset timer
    }
}
```

**Multiple Timers:**

```typescript
class Player {
    state = PlayerState.Idle;
    private stateTime = 0;
    private subTime = 0; // For sub-events within state
    
    update(deltaTime: number) {
        this.stateTime += deltaTime;
        this.subTime += deltaTime;
        
        this.updateTransitions();
    }
    
    private updateTransitions() {
        switch (this.state) {
            case PlayerState.Attacking:
                // Hit at 0.2s
                if (this.subTime > 0.2 && !this.hitLanded) {
                    this.dealDamage();
                    this.hitLanded = true;
                }
                
                // End at 0.5s
                if (this.stateTime > 0.5) {
                    this.setState(PlayerState.Idle);
                }
                break;
        }
    }
    
    private setState(newState: PlayerState) {
        this.state = newState;
        this.stateTime = 0;
        this.subTime = 0;
        this.hitLanded = false;
    }
}
```

**Animation-Based Timing:**

```typescript
class Player {
    update() {
        switch (this.state) {
            case PlayerState.Attacking:
                // Wait for animation to finish
                if (this.animation.isFinished()) {
                    this.state = PlayerState.Idle;
                }
                break;
        }
    }
}
```

---

## Q5: Should state transitions happen in the state itself or in the state machine?

**Short Answer:** Either works. Transitions in states = State Pattern. Transitions in machine = FSM. Choose based on complexity.

**Option 1: Transitions in State Machine (FSM)**

```typescript
class Player {
    state = State.Idle;
    
    updateTransitions() {
        // All transitions in one place
        switch (this.state) {
            case State.Idle:
                if (input.isDown('right')) this.state = State.Walking;
                if (input.isPressed('jump')) this.state = State.Jumping;
                break;
                
            case State.Walking:
                if (!input.isDown('right')) this.state = State.Idle;
                if (input.isPressed('jump')) this.state = State.Jumping;
                break;
        }
    }
}
```

**Pros:**
- See all transitions at once
- Easy to visualize flow
- Simple to debug

**Cons:**
- State machine class gets large
- Hard to reuse states

**Option 2: Transitions in States (State Pattern)**

```typescript
interface State {
    update(player: Player): void;
}

class IdleState implements State {
    update(player: Player) {
        // State decides own transitions
        if (input.isDown('right')) {
            player.setState(new WalkingState());
        } else if (input.isPressed('jump')) {
            player.setState(new JumpingState());
        }
        
        // Idle behavior
        player.velocityX = 0;
    }
}

class WalkingState implements State {
    update(player: Player) {
        if (!input.isDown('right')) {
            player.setState(new IdleState());
        } else if (input.isPressed('jump')) {
            player.setState(new JumpingState());
        }
        
        player.velocityX = 200;
    }
}
```

**Pros:**
- States are self-contained
- Easy to reuse states
- Scales better

**Cons:**
- Transitions spread across files
- Harder to see big picture

**Option 3: Transition Table (Data-Driven)**

```typescript
class StateMachine {
    private transitions: Array<{
        from: State,
        to: State,
        condition: () => boolean
    }> = [];
    
    addTransition(from: State, to: State, condition: () => boolean) {
        this.transitions.push({from, to, condition});
    }
    
    update() {
        // Check all transitions
        for (const t of this.transitions) {
            if (this.state === t.from && t.condition()) {
                this.setState(t.to);
                break;
            }
        }
        
        // Update current state
        this.current?.update();
    }
}

// Setup
fsm.addTransition(State.Idle, State.Walking, () => input.isDown('right'));
fsm.addTransition(State.Walking, State.Idle, () => !input.isDown('right'));
fsm.addTransition(State.Idle, State.Jumping, () => input.isPressed('jump'));
```

**Pros:**
- Transitions as data (can load from file)
- Clear separation
- Easy to modify

**Cons:**
- More setup code
- Harder to debug

**Recommendation:**
- **Simple game:** FSM (transitions in machine)
- **Complex game:** State Pattern (transitions in states)
- **Data-driven game:** Transition table

---

## Q6: How do I handle player input in different states?

**Short Answer:** Check state before acting on input, or let each state handle its own input.

**Approach 1: State Filters Input**

```typescript
update(deltaTime: number, input: InputManager) {
    // Input handling based on state
    switch (this.state) {
        case PlayerState.Idle:
        case PlayerState.Walking:
            // Can move
            if (input.isDown('right')) {
                this.velocityX = 200;
                this.state = PlayerState.Walking;
            }
            // Can jump
            if (input.isPressed('jump') && this.isGrounded) {
                this.state = PlayerState.Jumping;
                this.velocityY = -600;
            }
            break;
            
        case PlayerState.Attacking:
            // Can't move while attacking
            // Can't jump
            break;
            
        case PlayerState.Hurt:
            // Can't do anything
            break;
    }
}
```

**Approach 2: States Handle Own Input**

```typescript
interface State {
    handleInput(input: InputManager, player: Player): void;
    update(deltaTime: number, player: Player): void;
}

class IdleState implements State {
    handleInput(input: InputManager, player: Player) {
        if (input.isDown('right')) {
            player.velocityX = 200;
            player.setState(new WalkingState());
        }
        if (input.isPressed('jump')) {
            player.setState(new JumpingState());
        }
    }
    
    update(deltaTime: number, player: Player) {
        player.velocityX = 0;
    }
}

class AttackingState implements State {
    handleInput(input: InputManager, player: Player) {
        // Ignore all input
    }
    
    update(deltaTime: number, player: Player) {
        // Attack animation
    }
}

class Player {
    update(deltaTime: number, input: InputManager) {
        this.state.handleInput(input, this);
        this.state.update(deltaTime, this);
    }
}
```

**Approach 3: Input Buffer**

```typescript
class Player {
    private inputBuffer: Array<{action: string, time: number}> = [];
    
    bufferInput(action: string) {
        this.inputBuffer.push({action, time: Date.now()});
    }
    
    update() {
        // Process buffered inputs based on state
        if (this.state === PlayerState.Idle) {
            const jumpInput = this.inputBuffer.find(i => i.action === 'jump');
            if (jumpInput && Date.now() - jumpInput.time < 100) {
                this.state = PlayerState.Jumping;
                this.inputBuffer = this.inputBuffer.filter(i => i !== jumpInput);
            }
        }
        
        // Clear old inputs
        this.inputBuffer = this.inputBuffer.filter(i => Date.now() - i.time < 100);
    }
}

// Buffer inputs
if (input.isPressed('jump')) {
    player.bufferInput('jump');
}
```

---

## Q7: How do I debug state machine issues?

**Short Answer:** Log state changes, visualize current state, track state history, use assertions.

**1. State Change Logging:**

```typescript
private setState(newState: PlayerState) {
    if (newState === this.state) return;
    
    console.log(`[${Date.now()}] ${PlayerState[this.state]} → ${PlayerState[newState]}`);
    this.state = newState;
}

// Output:
// [1234567] Idle → Walking
// [1234789] Walking → Jumping
// [1234890] Jumping → Falling
```

**2. Visual Debug Display:**

```typescript
draw(ctx: CanvasRenderingContext2D) {
    // Draw player
    ctx.fillStyle = 'blue';
    ctx.fillRect(this.x, this.y, 32, 32);
    
    // Draw debug info
    ctx.fillStyle = 'white';
    ctx.font = '12px monospace';
    ctx.fillText(`State: ${PlayerState[this.state]}`, this.x - 20, this.y - 10);
    ctx.fillText(`Time: ${this.stateTime.toFixed(2)}s`, this.x - 20, this.y - 25);
}
```

**3. State History:**

```typescript
class Player {
    state = PlayerState.Idle;
    private history: Array<{state: PlayerState, timestamp: number}> = [];
    
    setState(newState: PlayerState) {
        if (newState === this.state) return;
        
        this.history.push({
            state: this.state,
            timestamp: Date.now()
        });
        
        // Keep last 10
        if (this.history.length > 10) {
            this.history.shift();
        }
        
        this.state = newState;
    }
    
    printHistory() {
        console.log('State history:');
        this.history.forEach((entry, i) => {
            const duration = i < this.history.length - 1
                ? this.history[i + 1].timestamp - entry.timestamp
                : Date.now() - entry.timestamp;
            console.log(`  ${PlayerState[entry.state]} (${duration}ms)`);
        });
    }
}
```

**4. Assertions:**

```typescript
updateTransitions() {
    const oldState = this.state;
    
    switch (this.state) {
        case PlayerState.Jumping:
            if (this.isGrounded) {
                this.state = PlayerState.Idle;
            }
            break;
    }
    
    // Ensure state is valid
    if (!(this.state in PlayerState)) {
        throw new Error(`Invalid state: ${this.state}`);
    }
    
    // Log unexpected changes
    if (oldState !== this.state) {
        console.warn(`Unexpected transition: ${PlayerState[oldState]} → ${PlayerState[this.state]}`);
    }
}
```

**5. State Machine Visualizer:**

```typescript
class StateMachineDebugger {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    
    constructor() {
        this.canvas = document.createElement('canvas');
        this.canvas.width = 300;
        this.canvas.height = 200;
        this.canvas.style.position = 'fixed';
        this.canvas.style.top = '10px';
        this.canvas.style.right = '10px';
        this.canvas.style.border = '2px solid white';
        document.body.appendChild(this.canvas);
        
        this.ctx = this.canvas.getContext('2d')!;
    }
    
    draw(entity: Entity) {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        this.ctx.fillRect(0, 0, 300, 200);
        
        this.ctx.fillStyle = 'white';
        this.ctx.font = '16px monospace';
        this.ctx.fillText(`State: ${PlayerState[entity.state]}`, 10, 30);
        this.ctx.fillText(`Time: ${entity.stateTime.toFixed(2)}s`, 10, 50);
        
        // Draw state diagram
        // ...
    }
}
```

---

## Q8: Can a state call another state's behavior?

**Short Answer:** Yes, but be careful. Composition is better than calling other states directly.

**❌ Don't: Call Other State Directly**

```typescript
class WalkingState implements State {
    update(player: Player) {
        player.velocityX = 200;
        
        // Don't do this!
        if (player.health < 20) {
            new HurtState().update(player);
        }
    }
}
```

**✅ Do: Transition to Other State**

```typescript
class WalkingState implements State {
    update(player: Player) {
        player.velocityX = 200;
        
        if (player.health < 20) {
            player.setState(new HurtState());
        }
    }
}
```

**✅ Do: Share Common Behavior**

```typescript
// Shared behavior
class MovementBehavior {
    static applyMovement(player: Player, speed: number) {
        if (input.isDown('right')) player.velocityX = speed;
        if (input.isDown('left')) player.velocityX = -speed;
    }
}

class WalkingState implements State {
    update(player: Player) {
        MovementBehavior.applyMovement(player, 200);
    }
}

class RunningState implements State {
    update(player: Player) {
        MovementBehavior.applyMovement(player, 400); // Same logic, different speed
    }
}
```

**✅ Do: Use Hierarchical States**

```typescript
abstract class GroundedState implements State {
    // Common behavior for all grounded states
    update(player: Player) {
        // Gravity
        player.velocityY = 0;
        
        // Jump
        if (input.isPressed('jump')) {
            player.setState(new JumpingState());
        }
        
        // Let subclass handle specific behavior
        this.updateMovement(player);
    }
    
    abstract updateMovement(player: Player): void;
}

class IdleState extends GroundedState {
    updateMovement(player: Player) {
        player.velocityX = 0;
    }
}

class WalkingState extends GroundedState {
    updateMovement(player: Player) {
        player.velocityX = 200;
    }
}
```

---

## Q9: How do I save and load game state?

**Short Answer:** Serialize state to JSON, save to localStorage, deserialize on load.

**Implementation:**

```typescript
interface SaveData {
    playerState: string;
    playerPosition: {x: number, y: number};
    playerHealth: number;
    currentLevel: number;
    timestamp: number;
}

class Game {
    save(): string {
        const data: SaveData = {
            playerState: PlayerState[this.player.state],
            playerPosition: {
                x: this.player.x,
                y: this.player.y
            },
            playerHealth: this.player.health,
            currentLevel: this.currentLevel,
            timestamp: Date.now()
        };
        
        const json = JSON.stringify(data);
        localStorage.setItem('savegame', json);
        return json;
    }
    
    load(): boolean {
        const json = localStorage.getItem('savegame');
        if (!json) return false;
        
        try {
            const data = JSON.parse(json) as SaveData;
            
            // Restore player state
            this.player.state = PlayerState[data.playerState as keyof typeof PlayerState];
            this.player.x = data.playerPosition.x;
            this.player.y = data.playerPosition.y;
            this.player.health = data.playerHealth;
            
            // Restore level
            this.currentLevel = data.currentLevel;
            this.loadLevel(this.currentLevel);
            
            return true;
        } catch (error) {
            console.error('Failed to load save:', error);
            return false;
        }
    }
}

// Usage
game.save(); // Save

// Later
if (game.load()) {
    console.log('Game loaded!');
} else {
    console.log('No save file found');
}
```

**Advanced: Entity Serialization**

```typescript
interface EntityData {
    type: string;
    state: string;
    x: number;
    y: number;
    // ... other properties
}

class Entity {
    serialize(): EntityData {
        return {
            type: this.constructor.name,
            state: State[this.state],
            x: this.x,
            y: this.y
        };
    }
    
    deserialize(data: EntityData) {
        this.state = State[data.state as keyof typeof State];
        this.x = data.x;
        this.y = data.y;
    }
}

class Game {
    save(): string {
        const data = {
            player: this.player.serialize(),
            enemies: this.enemies.map(e => e.serialize()),
            items: this.items.map(i => i.serialize())
        };
        
        return JSON.stringify(data);
    }
    
    load(json: string) {
        const data = JSON.parse(json);
        
        this.player.deserialize(data.player);
        
        this.enemies = data.enemies.map((e: EntityData) => {
            const enemy = new Enemy();
            enemy.deserialize(e);
            return enemy;
        });
        
        // ...
    }
}
```

---

## Q10: How do I test state machines?

**Short Answer:** Test transitions, test state behavior, test guards, use mocks for input.

**Unit Tests:**

```typescript
describe('PlayerStateMachine', () => {
    let player: Player;
    let mockInput: InputManager;
    
    beforeEach(() => {
        player = new Player();
        mockInput = new MockInputManager();
    });
    
    test('transitions from Idle to Walking when right pressed', () => {
        player.state = PlayerState.Idle;
        mockInput.setKey('right', true);
        
        player.update(0.016, mockInput);
        
        expect(player.state).toBe(PlayerState.Walking);
    });
    
    test('transitions from Walking to Idle when right released', () => {
        player.state = PlayerState.Walking;
        mockInput.setKey('right', false);
        
        player.update(0.016, mockInput);
        
        expect(player.state).toBe(PlayerState.Idle);
    });
    
    test('cannot jump when not grounded', () => {
        player.state = PlayerState.Falling;
        player.isGrounded = false;
        mockInput.setKeyPressed('jump', true);
        
        player.update(0.016, mockInput);
        
        expect(player.state).toBe(PlayerState.Falling); // Stays falling
    });
    
    test('attack lasts correct duration', () => {
        player.state = PlayerState.Attacking;
        
        // Update for 0.4s (not enough)
        for (let i = 0; i < 24; i++) {
            player.update(1/60, mockInput);
        }
        expect(player.state).toBe(PlayerState.Attacking);
        
        // Update for another 0.2s (total 0.6s, should exit)
        for (let i = 0; i < 12; i++) {
            player.update(1/60, mockInput);
        }
        expect(player.state).toBe(PlayerState.Idle);
    });
});
```

**Integration Tests:**

```typescript
describe('Player Gameplay', () => {
    test('complete jump sequence', () => {
        const player = new Player();
        const input = new MockInputManager();
        
        // Start idle
        expect(player.state).toBe(PlayerState.Idle);
        
        // Jump
        input.setKeyPressed('jump', true);
        player.update(0.016, input);
        expect(player.state).toBe(PlayerState.Jumping);
        expect(player.velocityY).toBeLessThan(0);
        
        // Rising
        player.update(0.1, input);
        expect(player.velocityY).toBeLessThan(0);
        
        // Peak, transition to falling
        player.update(0.5, input);
        expect(player.state).toBe(PlayerState.Falling);
        expect(player.velocityY).toBeGreaterThan(0);
        
        // Land
        player.y = 400;
        player.isGrounded = true;
        player.update(0.016, input);
        expect(player.state).toBe(PlayerState.Idle);
    });
});
```

**Mock Input:**

```typescript
class MockInputManager {
    private keys = new Set<string>();
    private pressed = new Set<string>();
    
    setKey(key: string, down: boolean) {
        if (down) {
            this.keys.add(key);
        } else {
            this.keys.delete(key);
        }
    }
    
    setKeyPressed(key: string, pressed: boolean) {
        if (pressed) {
            this.pressed.add(key);
        } else {
            this.pressed.delete(key);
        }
    }
    
    isDown(key: string): boolean {
        return this.keys.has(key);
    }
    
    isPressed(key: string): boolean {
        return this.pressed.has(key);
    }
    
    reset() {
        this.keys.clear();
        this.pressed.clear();
    }
}
```

---

## Q11: What's the difference between a state and a mode?

**Short Answer:** Same concept, different names. "State" is more formal (FSM theory), "mode" is more casual (game design).

**In Practice:**

```typescript
// State (technical term)
enum PlayerState {
    Idle,
    Walking,
    Jumping
}

// Mode (same thing, different name)
enum GameMode {
    MainMenu,
    Playing,
    Paused
}

// Use whatever makes sense
```

**Terminology by Domain:**

- **Game Entities:** Usually "state" (PlayerState, EnemyState)
- **Game Flow:** Often "mode" (GameMode, MenuMode)
- **UI:** Often "screen" or "view" (MenuScreen, PlayScreen)
- **AI:** Often "state" (PatrolState, ChaseState)

All are state machines under the hood.

---

## Q12: Should every entity have a state machine?

**Short Answer:** No, only entities with multiple distinct behaviors. Simple entities can use flags or simple logic.

**When You Need a State Machine:**

```typescript
// ✅ Needs states (multiple distinct behaviors)
class Player {
    // Idle, Walking, Running, Jumping, Attacking, Hurt, Dead
    state = PlayerState.Idle;
}

class Enemy {
    // Patrolling, Chasing, Attacking, Fleeing, Dead
    state = EnemyState.Patrolling;
}

class Boss {
    // Phase1, Phase2, Phase3, Vulnerable, Enraged, Dead
    state = BossState.Phase1;
}
```

**When You Don't Need One:**

```typescript
// ❌ Doesn't need states (simple behavior)
class Coin {
    collected = false; // Simple flag is fine
    
    update() {
        if (this.collected) return;
        
        if (collidesWith(player)) {
            this.collected = true;
            player.coins++;
        }
    }
}

class Bullet {
    // Just moves, no states needed
    update(deltaTime: number) {
        this.x += this.velocityX * deltaTime;
        
        if (this.x > 800) {
            this.destroy();
        }
    }
}
```

**Rule of Thumb:**
- **2 behaviors:** Use flag (e.g., `active`, `dead`)
- **3-5 behaviors:** Consider states
- **6+ behaviors:** Definitely use states

---

## Q13: How do I handle state priorities (e.g., Hurt interrupts everything)?

**Short Answer:** Check high-priority states first, use early returns, or define priority levels.

**Approach 1: Priority Order**

```typescript
updateTransitions() {
    // Highest priority first
    if (this.health <= 0) {
        this.state = PlayerState.Dead;
        return; // Nothing else matters
    }
    
    if (this.tookDamage) {
        this.state = PlayerState.Hurt;
        return;
    }
    
    // Lower priority
    switch (this.state) {
        case PlayerState.Idle:
            if (input.isPressed('attack')) {
                this.state = PlayerState.Attacking;
                return;
            }
            if (input.isDown('right')) {
                this.state = PlayerState.Walking;
            }
            break;
    }
}
```

**Approach 2: Interruptible Flag**

```typescript
interface StateConfig {
    name: PlayerState;
    interruptible: boolean;
}

const STATE_CONFIGS: Record<PlayerState, StateConfig> = {
    [PlayerState.Idle]: { name: PlayerState.Idle, interruptible: true },
    [PlayerState.Walking]: { name: PlayerState.Walking, interruptible: true },
    [PlayerState.Attacking]: { name: PlayerState.Attacking, interruptible: false },
    [PlayerState.Hurt]: { name: PlayerState.Hurt, interruptible: false }
};

setState(newState: PlayerState) {
    const currentConfig = STATE_CONFIGS[this.state];
    
    if (!currentConfig.interruptible && newState !== PlayerState.Hurt) {
        console.log('Cannot interrupt', PlayerState[this.state]);
        return;
    }
    
    this.state = newState;
}
```

**Approach 3: Priority Levels**

```typescript
const STATE_PRIORITY: Record<PlayerState, number> = {
    [PlayerState.Dead]: 100,
    [PlayerState.Hurt]: 90,
    [PlayerState.Attacking]: 50,
    [PlayerState.Walking]: 10,
    [PlayerState.Idle]: 0
};

setState(newState: PlayerState) {
    const currentPriority = STATE_PRIORITY[this.state];
    const newPriority = STATE_PRIORITY[newState];
    
    if (newPriority < currentPriority) {
        console.log('Cannot interrupt with lower priority state');
        return;
    }
    
    this.state = newState;
}
```

---

## Q14: How do I implement state-based animation?

**Short Answer:** Map states to animations, change animation on state entry, sync animation duration with state duration.

**Implementation:**

```typescript
const STATE_ANIMATIONS: Record<PlayerState, string> = {
    [PlayerState.Idle]: 'idle',
    [PlayerState.Walking]: 'walk',
    [PlayerState.Running]: 'run',
    [PlayerState.Jumping]: 'jump',
    [PlayerState.Falling]: 'fall',
    [PlayerState.Attacking]: 'attack',
    [PlayerState.Hurt]: 'hurt',
    [PlayerState.Dead]: 'death'
};

class Player {
    state = PlayerState.Idle;
    private prevState = PlayerState.Idle;
    private animation: AnimationController;
    
    update(deltaTime: number) {
        this.updateTransitions();
        
        // Detect state change
        if (this.state !== this.prevState) {
            this.enterState(this.state);
            this.prevState = this.state;
        }
        
        this.updateBehavior(deltaTime);
        this.animation.update(deltaTime);
    }
    
    private enterState(state: PlayerState) {
        // Set animation based on state
        const animName = STATE_ANIMATIONS[state];
        
        // Determine if animation should loop
        const shouldLoop = state === PlayerState.Idle ||
                          state === PlayerState.Walking ||
                          state === PlayerState.Running;
        
        this.animation.play(animName, shouldLoop);
    }
    
    private updateTransitions() {
        switch (this.state) {
            case PlayerState.Attacking:
                // Wait for animation
                if (this.animation.isFinished()) {
                    this.state = PlayerState.Idle;
                }
                break;
                
            case PlayerState.Hurt:
                if (this.animation.isFinished()) {
                    this.state = PlayerState.Idle;
                }
                break;
        }
    }
}
```

**Animation Controller:**

```typescript
class AnimationController {
    currentName = 'idle';
    currentFrame = 0;
    private frameTime = 0;
    private readonly FRAME_DURATION = 0.1;
    private loop = true;
    
    play(name: string, loop = true) {
        if (name === this.currentName) return;
        
        this.currentName = name;
        this.currentFrame = 0;
        this.frameTime = 0;
        this.loop = loop;
    }
    
    update(deltaTime: number) {
        this.frameTime += deltaTime;
        
        if (this.frameTime >= this.FRAME_DURATION) {
            this.frameTime = 0;
            this.currentFrame++;
            
            const frameCount = this.getFrameCount(this.currentName);
            if (this.currentFrame >= frameCount) {
                if (this.loop) {
                    this.currentFrame = 0;
                } else {
                    this.currentFrame = frameCount - 1;
                }
            }
        }
    }
    
    isFinished(): boolean {
        const frameCount = this.getFrameCount(this.currentName);
        return !this.loop && this.currentFrame === frameCount - 1;
    }
    
    private getFrameCount(name: string): number {
        const frames: Record<string, number> = {
            idle: 4,
            walk: 8,
            jump: 4,
            attack: 6,
            hurt: 3,
            death: 10
        };
        return frames[name] || 1;
    }
}
```

---

## Q15: Can I have multiple state machines on one entity?

**Short Answer:** Yes! Use separate state machines for different concerns (movement, combat, animation, etc.).

**Example:**

```typescript
enum MovementState { Idle, Walking, Running, Jumping, Falling }
enum CombatState { Neutral, Attacking, Blocking, Stunned }
enum AnimationState { Idle, Walk, Run, Jump, Attack, Block, Hurt }

class Player {
    // Multiple independent state machines
    movementState = MovementState.Idle;
    combatState = CombatState.Neutral;
    animationState = AnimationState.Idle;
    
    update(deltaTime: number) {
        // Update each independently
        this.updateMovement(deltaTime);
        this.updateCombat(deltaTime);
        this.updateAnimation(deltaTime);
    }
    
    private updateMovement(deltaTime: number) {
        switch (this.movementState) {
            case MovementState.Idle:
                if (input.isDown('right')) {
                    this.movementState = MovementState.Walking;
                }
                break;
            // ...
        }
    }
    
    private updateCombat(deltaTime: number) {
        switch (this.combatState) {
            case CombatState.Neutral:
                if (input.isPressed('attack')) {
                    this.combatState = CombatState.Attacking;
                }
                break;
            // ...
        }
    }
    
    private updateAnimation(deltaTime: number) {
        // Animation state derived from movement + combat
        if (this.combatState === CombatState.Attacking) {
            this.animationState = AnimationState.Attack;
        } else if (this.movementState === MovementState.Walking) {
            this.animationState = AnimationState.Walk;
        } else {
            this.animationState = AnimationState.Idle;
        }
    }
}
```

**Benefits:**
- Separation of concerns
- Easier to reason about
- Can have "walking + attacking" (multiple states)

**Caution:**
- Need to handle combinations carefully
- More complex than single state machine

---

## Q16: How do I implement state-based enemy AI?

**Short Answer:** Use states for different behaviors (patrol, chase, attack, flee), transition based on distance/health/timers.

**Basic Enemy AI:**

```typescript
enum EnemyState {
    Patrolling,
    Chasing,
    Attacking,
    Fleeing,
    Dead
}

class Enemy {
    state = EnemyState.Patrolling;
    x = 0;
    y = 0;
    health = 100;
    private patrolDirection = 1;
    private attackCooldown = 0;
    
    update(deltaTime: number, player: Player) {
        this.updateTransitions(player);
        this.updateBehavior(deltaTime, player);
    }
    
    private updateTransitions(player: Player) {
        const dist = distance(this, player);
        
        // Dead
        if (this.health <= 0) {
            this.state = EnemyState.Dead;
            return;
        }
        
        // Fleeing (low health)
        if (this.health < 30 && this.state !== EnemyState.Fleeing) {
            this.state = EnemyState.Fleeing;
            return;
        }
        
        // Attacking (very close)
        if (dist < 50 && this.attackCooldown <= 0) {
            this.state = EnemyState.Attacking;
            this.attackCooldown = 2.0; // 2 second cooldown
            return;
        }
        
        // Chasing (medium distance)
        if (dist < 300 && dist > 50) {
            this.state = EnemyState.Chasing;
            return;
        }
        
        // Patrolling (far away or after attack)
        if (dist > 400 || this.state === EnemyState.Attacking) {
            this.state = EnemyState.Patrolling;
        }
    }
    
    private updateBehavior(deltaTime: number, player: Player) {
        this.attackCooldown -= deltaTime;
        
        switch (this.state) {
            case EnemyState.Patrolling:
                // Move back and forth
                this.x += this.patrolDirection * 50 * deltaTime;
                if (this.x < 100 || this.x > 700) {
                    this.patrolDirection *= -1;
                }
                break;
                
            case EnemyState.Chasing:
                // Move toward player
                const dx = player.x - this.x;
                const dir = Math.sign(dx);
                this.x += dir * 150 * deltaTime;
                break;
                
            case EnemyState.Attacking:
                // Stop and attack
                if (this.attackCooldown <= 0) {
                    player.takeDamage(10);
                }
                break;
                
            case EnemyState.Fleeing:
                // Run away from player
                const fx = player.x - this.x;
                const fdir = -Math.sign(fx);
                this.x += fdir * 200 * deltaTime;
                break;
                
            case EnemyState.Dead:
                // Do nothing
                break;
        }
    }
}
```

---

## Q17: What's the best way to visualize my state machine during development?

**Short Answer:** Draw states as boxes, transitions as arrows, display current state on-screen.

**In-Game Debug Display:**

```typescript
class StateMachineDebugger {
    static draw(ctx: CanvasRenderingContext2D, entity: any) {
        ctx.save();
        
        // Background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(10, 10, 200, 100);
        
        // Title
        ctx.fillStyle = 'white';
        ctx.font = 'bold 16px monospace';
        ctx.fillText('State Machine', 20, 30);
        
        // Current state
        ctx.font = '14px monospace';
        ctx.fillStyle = 'lime';
        ctx.fillText(`State: ${entity.state}`, 20, 55);
        
        // Time in state
        if (entity.stateTime !== undefined) {
            ctx.fillStyle = 'white';
            ctx.fillText(`Time: ${entity.stateTime.toFixed(2)}s`, 20, 75);
        }
        
        // History
        if (entity.history && entity.history.length > 0) {
            const prev = entity.history[entity.history.length - 1];
            ctx.fillStyle = 'gray';
            ctx.fillText(`Prev: ${prev}`, 20, 95);
        }
        
        ctx.restore();
    }
}

// Usage
draw(ctx: CanvasRenderingContext2D) {
    // Draw game
    // ...
    
    // Draw debug
    if (DEBUG_MODE) {
        StateMachineDebugger.draw(ctx, this.player);
    }
}
```

**External Diagram Tool:**

```typescript
class StateMachineExporter {
    static toMermaid(states: string[], transitions: Array<{from: string, to: string, label: string}>): string {
        let mermaid = 'stateDiagram-v2\n';
        
        transitions.forEach(t => {
            mermaid += `    ${t.from} --> ${t.to}: ${t.label}\n`;
        });
        
        return mermaid;
    }
}

// Generate diagram code
const diagram = StateMachineExporter.toMermaid(
    ['Idle', 'Walking', 'Jumping'],
    [
        {from: 'Idle', to: 'Walking', label: 'move'},
        {from: 'Walking', to: 'Idle', label: 'stop'},
        {from: 'Idle', to: 'Jumping', label: 'jump'}
    ]
);

console.log(diagram);
// Paste into https://mermaid.live/
```

---

## Q18: How do I handle state persistence across level transitions?

**Short Answer:** Save state before transition, restore after loading new level.

**Implementation:**

```typescript
class Game {
    private savedPlayerState: any = null;
    
    changeLevel(newLevel: number) {
        // Save player state
        this.savedPlayerState = {
            state: this.player.state,
            health: this.player.health,
            powerups: [...this.player.powerups]
        };
        
        // Load new level
        this.currentLevel = newLevel;
        this.loadLevel(newLevel);
        
        // Restore player state
        if (this.savedPlayerState) {
            this.player.state = this.savedPlayerState.state;
            this.player.health = this.savedPlayerState.health;
            this.player.powerups = this.savedPlayerState.powerups;
            
            // Reset position
            this.player.x = this.levelStartX;
            this.player.y = this.levelStartY;
        }
    }
}
```

---

## Q19: Should I use strings or enums for states?

**Short Answer:** Use enums for type safety and performance. Use strings for flexibility and debugging.

**Enums (Recommended):**

```typescript
// ✅ Type-safe, fast, autocomplete
enum PlayerState {
    Idle,
    Walking,
    Jumping
}

let state: PlayerState = PlayerState.Idle;
state = PlayerState.Walking; // ✅ OK
state = 'running'; // ❌ Compile error
```

**Strings:**

```typescript
// ✅ Flexible, easy to debug
type PlayerState = 'idle' | 'walking' | 'jumping';

let state: PlayerState = 'idle';
state = 'walking'; // ✅ OK
state = 'running'; // ❌ Compile error (with type)
console.log(state); // Readable
```

**Recommendation:**
- **TypeScript:** Use enums
- **JavaScript:** Use string constants
- **Need serialization:** Use strings or convert enums

---

## Q20: Where can I learn more about state machines?

**Short Answer:** Read game dev blogs, study open-source games, check out AI programming books.

**Resources:**

### Articles
- Game Programming Patterns: State pattern
- AI Game Dev: Finite State Machines
- Gamasutra: Behavior Trees vs FSMs

### Books
- *Game Programming Patterns* by Robert Nystrom
- *Artificial Intelligence for Games* by Ian Millington
- *Programming Game AI by Example* by Mat Buckland

### Open Source
- Study Phaser.js game examples
- Look at Unity state machine tutorials
- Check out Godot engine state machine examples

### Practice
- Implement Pac-Man ghosts (4 different AI states)
- Create a fighting game character (10+ states)
- Build a platformer with full Mario moveset

---

**Next Topic:** World Coordinates! 🗺️