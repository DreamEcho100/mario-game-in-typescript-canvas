# State Management - Debugging Common Issues

**Unit 01: Game Foundations | Topic 04**

> Real bugs you'll encounter and how to fix them.

---

## Bug #1: State Transitions Don't Work

### 🐛 Symptoms

```typescript
// Player never changes from Idle to Walking
player.update(deltaTime);
// State stays Idle even when pressing arrow keys
```

### 🔍 Diagnosis

**Check 1:** Are transitions being called?

```typescript
updateTransitions() {
    console.log('Checking transitions, current:', this.state);
    
    if (this.state === PlayerState.Idle) {
        if (input.isDown('right')) {
            console.log('Should transition to Walking');
            this.state = PlayerState.Walking;
        }
    }
}
```

**Check 2:** Is update called?

```typescript
gameLoop() {
    player.update(deltaTime);
    console.log('Player state:', PlayerState[player.state]);
}
```

**Check 3:** Are conditions met?

```typescript
// Add temporary logging
if (input.isDown('right')) {
    console.log('Right key is pressed');
}
```

### 🔧 Common Causes

#### Cause 1: Forgot to call updateTransitions()

```typescript
// ❌ Bug
update(deltaTime: number) {
    // Only updates behavior, never checks transitions
    this.updateBehavior(deltaTime);
}

// ✅ Fixed
update(deltaTime: number) {
    this.updateTransitions();
    this.updateBehavior(deltaTime);
}
```

#### Cause 2: Wrong comparison operator

```typescript
// ❌ Bug (assignment instead of comparison)
if (this.state = PlayerState.Idle) {
    // Always true, also changes state!
}

// ✅ Fixed
if (this.state === PlayerState.Idle) {
    // Proper comparison
}
```

#### Cause 3: State value mismatch

```typescript
// ❌ Bug
enum PlayerState { Idle = 0, Walking = 1 }
// But checking with:
if (this.state === 'Idle') // String comparison!

// ✅ Fixed
if (this.state === PlayerState.Idle) // Enum value
```

#### Cause 4: Input not working

```typescript
// ❌ Bug
if (input.isDown('ArrowRight')) // Wrong key name

// ✅ Fixed
if (input.isDown('right') || input.isDown('ArrowRight'))
// Support both
```

### ✅ Complete Solution

```typescript
class Player {
    state = PlayerState.Idle;
    
    update(deltaTime: number, input: InputManager) {
        // 1. Always check transitions first
        this.updateTransitions(input);
        
        // 2. Then update behavior
        this.updateBehavior(deltaTime);
    }
    
    private updateTransitions(input: InputManager) {
        // Use === for comparisons
        if (this.state === PlayerState.Idle) {
            // Check conditions properly
            if (input.isDown('right') || input.isDown('ArrowRight')) {
                this.state = PlayerState.Walking;
                console.log('Transitioned to Walking');
            }
        }
    }
    
    private updateBehavior(deltaTime: number) {
        switch (this.state) {
            case PlayerState.Idle:
                this.velocityX = 0;
                break;
            case PlayerState.Walking:
                this.velocityX = 200;
                break;
        }
    }
}
```

### 🛡️ Prevention

```typescript
// Add validation
private setState(newState: PlayerState) {
    if (newState === this.state) return; // No-op
    
    console.log(`State change: ${PlayerState[this.state]} → ${PlayerState[newState]}`);
    this.state = newState;
}

// Use in transitions
if (input.isDown('right')) {
    this.setState(PlayerState.Walking);
}
```

---

## Bug #2: State Gets Stuck

### 🐛 Symptoms

```typescript
// Player stuck in Jumping state
// Never returns to Idle/Walking even after landing
```

### 🔍 Diagnosis

```typescript
update() {
    console.log('State:', PlayerState[this.state]);
    console.log('Grounded:', this.isGrounded);
    console.log('VelocityY:', this.velocityY);
    
    // Check if exit condition ever becomes true
}
```

### 🔧 Common Causes

#### Cause 1: Missing return transition

```typescript
// ❌ Bug
case PlayerState.Jumping:
    if (this.velocityY > 0) {
        this.state = PlayerState.Falling;
    }
    // No transition back to Idle!
    break;

// ✅ Fixed
case PlayerState.Jumping:
    if (this.velocityY > 0) {
        this.state = PlayerState.Falling;
    }
    break;
    
case PlayerState.Falling:
    if (this.isGrounded) {
        this.state = PlayerState.Idle; // Return path
    }
    break;
```

#### Cause 2: Impossible condition

```typescript
// ❌ Bug
case PlayerState.Attacking:
    // attackTime never set, so never exits
    if (this.attackTime > 0.5) {
        this.state = PlayerState.Idle;
    }
    break;

// ✅ Fixed
case PlayerState.Attacking:
    this.attackTime += deltaTime; // Increment timer
    if (this.attackTime > 0.5) {
        this.state = PlayerState.Idle;
    }
    break;

private enterState(state: PlayerState) {
    if (state === PlayerState.Attacking) {
        this.attackTime = 0; // Initialize
    }
}
```

#### Cause 3: Circular dependency

```typescript
// ❌ Bug
case PlayerState.A:
    if (condition) this.state = PlayerState.B;
    break;
    
case PlayerState.B:
    if (!condition) this.state = PlayerState.A;
    break;
// If condition never changes, stuck in A

// ✅ Fixed
case PlayerState.A:
    if (timer > 1.0) this.state = PlayerState.B;
    break;
    
case PlayerState.B:
    if (timer > 2.0) this.state = PlayerState.Idle;
    break;
```

### ✅ Complete Solution

```typescript
class Player {
    state = PlayerState.Idle;
    private stateTime = 0;
    
    update(deltaTime: number) {
        this.stateTime += deltaTime;
        this.updateTransitions();
        this.updateBehavior(deltaTime);
    }
    
    private updateTransitions() {
        switch (this.state) {
            case PlayerState.Jumping:
                // Ensure Jumping → Falling transition
                if (this.velocityY > 0) {
                    this.setState(PlayerState.Falling);
                }
                break;
                
            case PlayerState.Falling:
                // Ensure Falling → Idle transition
                if (this.isGrounded) {
                    this.setState(PlayerState.Idle);
                }
                break;
                
            case PlayerState.Attacking:
                // Time-based exit with guaranteed trigger
                if (this.stateTime > 0.5) {
                    this.setState(PlayerState.Idle);
                }
                break;
        }
    }
    
    private setState(newState: PlayerState) {
        if (newState === this.state) return;
        
        this.state = newState;
        this.stateTime = 0; // Reset timer for new state
    }
}
```

### 🛡️ Prevention

```typescript
// Add timeout safety net
private readonly STATE_TIMEOUT = 5.0; // 5 seconds max

private updateTransitions() {
    // Emergency exit for stuck states
    if (this.stateTime > this.STATE_TIMEOUT) {
        console.warn(`State timeout: ${PlayerState[this.state]}`);
        this.setState(PlayerState.Idle);
        return;
    }
    
    // Normal transitions...
}
```

---

## Bug #3: Multiple States Active Simultaneously

### 🐛 Symptoms

```typescript
// Player is both Jumping AND Attacking
// Causes weird behavior and animations
```

### 🔍 Diagnosis

```typescript
// Add assertion
update() {
    const activeStates = [
        this.isJumping,
        this.isAttacking,
        this.isWalking
    ].filter(Boolean).length;
    
    if (activeStates > 1) {
        console.error('Multiple states active!', {
            jumping: this.isJumping,
            attacking: this.isAttacking,
            walking: this.isWalking
        });
    }
}
```

### 🔧 Common Causes

#### Cause 1: Using booleans instead of enum

```typescript
// ❌ Bug (booleans can all be true)
class Player {
    isIdle = true;
    isWalking = false;
    isJumping = false;
    
    update() {
        if (input.isDown('right')) {
            this.isWalking = true; // Forgot to set isIdle = false!
        }
    }
}

// ✅ Fixed (enum ensures single state)
class Player {
    state = PlayerState.Idle;
    
    update() {
        if (input.isDown('right')) {
            this.state = PlayerState.Walking; // Replaces old state
        }
    }
}
```

#### Cause 2: Nested state checks

```typescript
// ❌ Bug
updateTransitions() {
    if (input.isPressed('jump')) {
        this.state = PlayerState.Jumping;
    }
    
    if (input.isPressed('attack')) {
        this.state = PlayerState.Attacking; // Can both trigger!
    }
}

// ✅ Fixed
updateTransitions() {
    if (input.isPressed('jump')) {
        this.state = PlayerState.Jumping;
        return; // Early exit
    }
    
    if (input.isPressed('attack')) {
        this.state = PlayerState.Attacking;
        return;
    }
}
```

#### Cause 3: State not cleared

```typescript
// ❌ Bug
class Enemy {
    state = EnemyState.Idle;
    isAlerted = false;
    
    update() {
        if (playerNear) {
            this.isAlerted = true;
            this.state = EnemyState.Chasing;
        }
        
        // isAlerted stays true even if state changes!
    }
}

// ✅ Fixed
class Enemy {
    state = EnemyState.Idle;
    
    update() {
        // Derive from state, don't store separately
        const isAlerted = this.state === EnemyState.Chasing;
    }
}
```

### ✅ Complete Solution

```typescript
enum PlayerState {
    Idle,
    Walking,
    Jumping,
    Attacking
}

class Player {
    // Single source of truth
    state = PlayerState.Idle;
    
    update(deltaTime: number, input: InputManager) {
        // Priority-based transitions
        this.updateTransitions(input);
        this.updateBehavior(deltaTime);
    }
    
    private updateTransitions(input: InputManager) {
        // Higher priority first, with early returns
        
        // Attacking has priority
        if (input.isPressed('attack') && this.canAttack()) {
            this.state = PlayerState.Attacking;
            return;
        }
        
        // Then jumping
        if (input.isPressed('jump') && this.canJump()) {
            this.state = PlayerState.Jumping;
            return;
        }
        
        // Then movement
        if (input.isDown('right')) {
            this.state = PlayerState.Walking;
            return;
        }
        
        // Default to idle
        this.state = PlayerState.Idle;
    }
    
    // Query methods instead of flags
    get isGroundedState(): boolean {
        return this.state === PlayerState.Idle || 
               this.state === PlayerState.Walking;
    }
}
```

### 🛡️ Prevention

```typescript
// Use TypeScript enum (can't have multiple values)
enum State { A, B, C }
let state: State = State.A;

// If you need substates, use hierarchy
class Player {
    mainState: 'grounded' | 'airborne';
    subState: 'idle' | 'walking' | 'jumping' | 'falling';
    
    // Validate combination
    validateState() {
        if (this.mainState === 'grounded') {
            if (!['idle', 'walking'].includes(this.subState)) {
                throw new Error('Invalid grounded substate');
            }
        }
    }
}
```

---

## Bug #4: State Animations Out of Sync

### 🐛 Symptoms

```typescript
// Player state is Idle but animation shows Running
// Animation finishes but state hasn't changed yet
```

### 🔍 Diagnosis

```typescript
draw(ctx: CanvasRenderingContext2D) {
    console.log('State:', PlayerState[this.state]);
    console.log('Current animation:', this.animation.name);
    console.log('Animation frame:', this.animation.currentFrame);
}
```

### 🔧 Common Causes

#### Cause 1: Animation not updated with state

```typescript
// ❌ Bug
private enterState(state: PlayerState) {
    this.state = state;
    // Forgot to change animation!
}

// ✅ Fixed
private enterState(state: PlayerState) {
    this.state = state;
    
    // Set animation based on state
    switch (state) {
        case PlayerState.Idle:
            this.animation.play('idle');
            break;
        case PlayerState.Walking:
            this.animation.play('walk');
            break;
        case PlayerState.Jumping:
            this.animation.play('jump');
            break;
    }
}
```

#### Cause 2: State changes before animation completes

```typescript
// ❌ Bug
update() {
    if (this.state === PlayerState.Attacking) {
        if (this.stateTime > 0.5) {
            this.state = PlayerState.Idle; // Animation might still be playing!
        }
    }
}

// ✅ Fixed
update() {
    if (this.state === PlayerState.Attacking) {
        // Wait for animation
        if (this.animation.isFinished()) {
            this.state = PlayerState.Idle;
        }
    }
}
```

#### Cause 3: Animation set in wrong place

```typescript
// ❌ Bug
updateBehavior() {
    switch (this.state) {
        case PlayerState.Walking:
            this.animation.play('walk'); // Called every frame!
            break;
    }
}

// ✅ Fixed
enterState(state: PlayerState) {
    switch (state) {
        case PlayerState.Walking:
            this.animation.play('walk'); // Called once on enter
            break;
    }
}

updateBehavior() {
    // Just update, don't set
    this.animation.update(deltaTime);
}
```

### ✅ Complete Solution

```typescript
class Player {
    state = PlayerState.Idle;
    private prevState = PlayerState.Idle;
    private animation: AnimationController;
    
    update(deltaTime: number) {
        this.updateTransitions();
        
        // Detect state change
        if (this.state !== this.prevState) {
            this.exitState(this.prevState);
            this.enterState(this.state);
            this.prevState = this.state;
        }
        
        this.updateBehavior(deltaTime);
        this.animation.update(deltaTime);
    }
    
    private enterState(state: PlayerState) {
        // Set animation on state entry
        switch (state) {
            case PlayerState.Idle:
                this.animation.play('idle', true); // Loop
                break;
            case PlayerState.Walking:
                this.animation.play('walk', true);
                break;
            case PlayerState.Jumping:
                this.animation.play('jump', false); // Don't loop
                break;
            case PlayerState.Attacking:
                this.animation.play('attack', false);
                break;
        }
    }
    
    private updateTransitions() {
        switch (this.state) {
            case PlayerState.Attacking:
                // Wait for animation to complete
                if (this.animation.isFinished()) {
                    this.state = PlayerState.Idle;
                }
                break;
        }
    }
}
```

### 🛡️ Prevention

```typescript
// Bind animations to states
const STATE_ANIMATIONS = {
    [PlayerState.Idle]: 'idle',
    [PlayerState.Walking]: 'walk',
    [PlayerState.Running]: 'run',
    [PlayerState.Jumping]: 'jump',
    [PlayerState.Falling]: 'fall',
    [PlayerState.Attacking]: 'attack'
};

private enterState(state: PlayerState) {
    const animName = STATE_ANIMATIONS[state];
    if (animName) {
        this.animation.play(animName);
    }
}
```

---

## Bug #5: Transition Guards Not Working

### 🐛 Symptoms

```typescript
// Player can jump even when not grounded
// Enemy attacks when out of range
```

### 🔍 Diagnosis

```typescript
// Log guard checks
canJump() {
    const result = this.isGrounded && this.stamina > 0;
    console.log('canJump:', result, {
        grounded: this.isGrounded,
        stamina: this.stamina
    });
    return result;
}
```

### 🔧 Common Causes

#### Cause 1: Guard not called

```typescript
// ❌ Bug
if (input.isPressed('jump')) {
    this.state = PlayerState.Jumping; // No guard!
}

// ✅ Fixed
if (input.isPressed('jump') && this.canJump()) {
    this.state = PlayerState.Jumping;
}
```

#### Cause 2: Guard logic wrong

```typescript
// ❌ Bug
canJump(): boolean {
    return this.isGrounded || this.hasDoubleJump; // OR instead of AND
}

// ✅ Fixed
canJump(): boolean {
    return this.isGrounded || (this.hasDoubleJump && !this.usedDoubleJump);
}
```

#### Cause 3: State checked after guard

```typescript
// ❌ Bug
canAttack(): boolean {
    return this.weapon !== null;
}

update() {
    if (this.canAttack()) {
        this.state = PlayerState.Attacking;
    }
    // But what if already attacking?
}

// ✅ Fixed
canAttack(): boolean {
    return this.weapon !== null && 
           this.state !== PlayerState.Attacking;
}
```

### ✅ Complete Solution

```typescript
class Player {
    state = PlayerState.Idle;
    isGrounded = false;
    stamina = 100;
    health = 100;
    
    // Guards with clear conditions
    canJump(): boolean {
        return (
            this.isGrounded &&
            this.stamina >= 10 &&
            this.state !== PlayerState.Jumping
        );
    }
    
    canAttack(): boolean {
        return (
            this.state !== PlayerState.Attacking &&
            this.state !== PlayerState.Hurt &&
            this.stamina >= 5
        );
    }
    
    canRun(): boolean {
        return (
            this.isGrounded &&
            this.stamina > 0 &&
            this.state === PlayerState.Walking
        );
    }
    
    // Always use guards
    private updateTransitions(input: InputManager) {
        // Check guards first
        if (input.isPressed('jump') && this.canJump()) {
            this.state = PlayerState.Jumping;
            this.stamina -= 10;
            return;
        }
        
        if (input.isPressed('attack') && this.canAttack()) {
            this.state = PlayerState.Attacking;
            this.stamina -= 5;
            return;
        }
        
        if (input.isDown('shift') && this.canRun()) {
            this.state = PlayerState.Running;
            return;
        }
    }
}
```

### 🛡️ Prevention

```typescript
// Centralized transition system with guards
interface Transition {
    from: PlayerState;
    to: PlayerState;
    condition: () => boolean;
    guard?: () => boolean;
}

class StateMachine {
    private transitions: Transition[] = [];
    
    addTransition(
        from: PlayerState,
        to: PlayerState,
        condition: () => boolean,
        guard?: () => boolean
    ) {
        this.transitions.push({from, to, condition, guard});
    }
    
    update() {
        for (const t of this.transitions) {
            if (this.state === t.from && t.condition()) {
                // Check guard if present
                if (!t.guard || t.guard()) {
                    this.setState(t.to);
                    break;
                }
            }
        }
    }
}

// Usage
fsm.addTransition(
    PlayerState.Idle,
    PlayerState.Jumping,
    () => input.isPressed('jump'),
    () => player.canJump() // Guard
);
```

---

## Bug #6: State History Causing Memory Leak

### 🐛 Symptoms

```typescript
// Game slows down over time
// Memory usage constantly increasing
// History array has thousands of entries
```

### 🔍 Diagnosis

```typescript
// Monitor history size
update() {
    console.log('History size:', this.stateHistory.length);
    console.log('Memory usage:', performance.memory?.usedJSHeapSize);
}
```

### 🔧 Common Causes

#### Cause 1: Unbounded history

```typescript
// ❌ Bug
class Entity {
    private history: State[] = [];
    
    setState(state: State) {
        this.history.push(this.state);
        this.state = state;
        // history grows forever!
    }
}

// ✅ Fixed
class Entity {
    private history: State[] = [];
    private readonly MAX_HISTORY = 50;
    
    setState(state: State) {
        this.history.push(this.state);
        
        // Limit size
        if (this.history.length > this.MAX_HISTORY) {
            this.history.shift(); // Remove oldest
        }
        
        this.state = state;
    }
}
```

#### Cause 2: Storing entire objects

```typescript
// ❌ Bug
class Entity {
    private history: EntitySnapshot[] = [];
    
    setState(state: State) {
        // Stores full entity copy!
        this.history.push({
            state: this.state,
            position: {...this.position},
            velocity: {...this.velocity},
            // ... all properties
        });
    }
}

// ✅ Fixed
class Entity {
    private history: State[] = [];
    
    setState(state: State) {
        // Store only state enum (small)
        this.history.push(this.state);
    }
}
```

#### Cause 3: Never clearing history

```typescript
// ❌ Bug
class Game {
    onPlayerDeath() {
        this.player = new Player();
        // Old player's history still in memory!
    }
}

// ✅ Fixed
class Player {
    dispose() {
        this.history = []; // Clear explicitly
    }
}

class Game {
    onPlayerDeath() {
        this.player.dispose();
        this.player = new Player();
    }
}
```

### ✅ Complete Solution

```typescript
class Entity {
    state = PlayerState.Idle;
    private history: State[] = [];
    
    // Configurable limit
    private readonly MAX_HISTORY = 30;
    
    setState(state: State) {
        if (state === this.state) return;
        
        // Add current state to history
        this.history.push(this.state);
        
        // Enforce limit
        while (this.history.length > this.MAX_HISTORY) {
            this.history.shift();
        }
        
        this.state = state;
    }
    
    // Query methods
    getPreviousState(): State | undefined {
        return this.history[this.history.length - 1];
    }
    
    wasInState(state: State, lookback: number = 5): boolean {
        const recent = this.history.slice(-lookback);
        return recent.includes(state);
    }
    
    // Cleanup
    dispose() {
        this.history = [];
    }
}
```

### 🛡️ Prevention

```typescript
// Use circular buffer for fixed memory
class CircularBuffer<T> {
    private buffer: T[];
    private index = 0;
    
    constructor(private capacity: number) {
        this.buffer = new Array(capacity);
    }
    
    push(item: T) {
        this.buffer[this.index] = item;
        this.index = (this.index + 1) % this.capacity;
    }
    
    get(offset: number): T {
        const i = (this.index - offset - 1 + this.capacity) % this.capacity;
        return this.buffer[i];
    }
}

class Entity {
    private history = new CircularBuffer<State>(30);
    
    setState(state: State) {
        this.history.push(this.state);
        this.state = state;
    }
}
```

---

## Bug #7: Hierarchical States Broken

### 🐛 Symptoms

```typescript
// Substate behaves like it's not connected to parent
// Parent state changes but child doesn't update
```

### 🔍 Diagnosis

```typescript
update() {
    console.log('Parent:', this.parentState);
    console.log('Child:', this.childState);
    console.log('Valid combo?', this.isValidCombo());
}

isValidCombo(): boolean {
    // Check if child is valid for parent
    if (this.parentState === 'grounded') {
        return ['idle', 'walking', 'running'].includes(this.childState);
    }
    return true;
}
```

### 🔧 Common Causes

#### Cause 1: Invalid substate combination

```typescript
// ❌ Bug
update() {
    // Changed parent but not child
    this.parentState = 'airborne';
    // childState is still 'walking' (invalid for airborne!)
}

// ✅ Fixed
setParentState(newParent: string) {
    this.parentState = newParent;
    
    // Reset child to valid default
    if (newParent === 'grounded') {
        this.childState = 'idle';
    } else if (newParent === 'airborne') {
        this.childState = 'falling';
    }
}
```

#### Cause 2: Child updated independently

```typescript
// ❌ Bug
update() {
    // Child change doesn't check parent
    if (input.isPressed('jump')) {
        this.childState = 'jumping';
        // But parent might not be grounded!
    }
}

// ✅ Fixed
update() {
    if (input.isPressed('jump')) {
        // Change parent and child together
        this.parentState = 'airborne';
        this.childState = 'jumping';
    }
}
```

#### Cause 3: Parent transition doesn't cascade

```typescript
// ❌ Bug
if (this.isGrounded) {
    this.parentState = 'grounded';
    // Child state not updated!
}

// ✅ Fixed
if (this.isGrounded) {
    this.enterParentState('grounded');
}

enterParentState(state: string) {
    this.parentState = state;
    
    // Set valid child state
    if (state === 'grounded') {
        this.childState = 'idle';
    }
}
```

### ✅ Complete Solution

```typescript
type ParentState = 'grounded' | 'airborne';
type ChildState = 'idle' | 'walking' | 'running' | 'jumping' | 'falling';

class Player {
    private parentState: ParentState = 'grounded';
    private childState: ChildState = 'idle';
    
    // Valid child states for each parent
    private readonly VALID_CHILDREN: Record<ParentState, ChildState[]> = {
        grounded: ['idle', 'walking', 'running'],
        airborne: ['jumping', 'falling']
    };
    
    // Set parent state and choose valid child
    setParentState(newParent: ParentState) {
        if (newParent === this.parentState) return;
        
        this.parentState = newParent;
        
        // Choose appropriate child state
        const validChildren = this.VALID_CHILDREN[newParent];
        if (!validChildren.includes(this.childState)) {
            // Default to first valid child
            this.childState = validChildren[0];
        }
    }
    
    // Set child state with validation
    setChildState(newChild: ChildState) {
        const validChildren = this.VALID_CHILDREN[this.parentState];
        
        if (!validChildren.includes(newChild)) {
            console.warn(`Invalid child ${newChild} for parent ${this.parentState}`);
            return;
        }
        
        this.childState = newChild;
    }
    
    // Transitions
    update() {
        // Parent transitions
        if (this.isGrounded && this.parentState === 'airborne') {
            this.setParentState('grounded');
        } else if (!this.isGrounded && this.parentState === 'grounded') {
            this.setParentState('airborne');
        }
        
        // Child transitions (within parent constraints)
        if (this.parentState === 'grounded') {
            if (input.isDown('right')) {
                this.setChildState('walking');
            } else {
                this.setChildState('idle');
            }
        } else if (this.parentState === 'airborne') {
            if (this.velocityY < 0) {
                this.setChildState('jumping');
            } else {
                this.setChildState('falling');
            }
        }
    }
}
```

### 🛡️ Prevention

```typescript
// Use classes for hierarchical states
abstract class State {
    abstract update(deltaTime: number): void;
}

abstract class GroundedState extends State {
    // Only grounded states can be here
}

class IdleState extends GroundedState {
    update(dt: number) { /* idle behavior */ }
}

class WalkingState extends GroundedState {
    update(dt: number) { /* walking behavior */ }
}

abstract class AirborneState extends State {
    // Only airborne states
}

class JumpingState extends AirborneState {
    update(dt: number) { /* jumping behavior */ }
}
```

---

## Bug #8: State Callbacks Not Firing

### 🐛 Symptoms

```typescript
// onEnter/onExit never called
// Initialization code doesn't run
```

### 🔍 Diagnosis

```typescript
enterState(state: State) {
    console.log('enterState called for:', state);
    
    if (state.onEnter) {
        console.log('onEnter exists, calling...');
        state.onEnter();
    } else {
        console.log('onEnter is undefined!');
    }
}
```

### 🔧 Common Causes

#### Cause 1: Forgot to detect state change

```typescript
// ❌ Bug
update() {
    this.updateTransitions();
    // Never checks if state changed!
    this.updateBehavior();
}

// ✅ Fixed
update() {
    const oldState = this.state;
    this.updateTransitions();
    
    if (this.state !== oldState) {
        this.exitState(oldState);
        this.enterState(this.state);
    }
    
    this.updateBehavior();
}
```

#### Cause 2: this binding issue

```typescript
// ❌ Bug
const state = {
    name: 'jumping',
    onEnter: function() {
        this.velocityY = -600; // 'this' is the state object, not player!
    }
};

// ✅ Fixed (arrow function)
const state = {
    name: 'jumping',
    onEnter: () => {
        this.velocityY = -600; // 'this' is Player
    }
};

// ✅ Fixed (bind)
const state = {
    name: 'jumping',
    onEnter: function() {
        player.velocityY = -600;
    }.bind(this)
};
```

#### Cause 3: Callback not set

```typescript
// ❌ Bug
fsm.add({
    name: 'jumping',
    update: () => { /* ... */ }
    // Missing onEnter!
});

// ✅ Fixed
fsm.add({
    name: 'jumping',
    onEnter: () => {
        this.velocityY = -600;
    },
    update: () => {
        // ...
    }
});
```

### ✅ Complete Solution

```typescript
interface StateObject {
    name: string;
    onEnter?: () => void;
    onExit?: () => void;
    update: (deltaTime: number) => void;
}

class StateMachine {
    private current: StateObject | null = null;
    private states = new Map<string, StateObject>();
    
    add(state: StateObject) {
        this.states.set(state.name, state);
    }
    
    set(stateName: string) {
        const newState = this.states.get(stateName);
        if (!newState) {
            console.error(`State '${stateName}' not found`);
            return;
        }
        
        // Exit current state
        if (this.current && this.current.onExit) {
            try {
                this.current.onExit();
            } catch (error) {
                console.error('Error in onExit:', error);
            }
        }
        
        // Enter new state
        this.current = newState;
        
        if (this.current.onEnter) {
            try {
                this.current.onEnter();
            } catch (error) {
                console.error('Error in onEnter:', error);
            }
        }
    }
    
    update(deltaTime: number) {
        if (this.current) {
            this.current.update(deltaTime);
        }
    }
}

// Usage with arrow functions (preserves 'this')
class Player {
    fsm = new StateMachine();
    
    constructor() {
        this.fsm.add({
            name: 'jumping',
            onEnter: () => {
                this.velocityY = -600; // 'this' is Player
            },
            onExit: () => {
                this.hasJumped = true;
            },
            update: (dt) => {
                // ...
            }
        });
    }
}
```

### 🛡️ Prevention

```typescript
// Add logging wrapper
class StateMachine {
    set(stateName: string) {
        console.log(`[FSM] Transitioning to ${stateName}`);
        
        if (this.current?.onExit) {
            console.log(`[FSM] Calling onExit for ${this.current.name}`);
            this.current.onExit();
        }
        
        this.current = this.states.get(stateName)!;
        
        if (this.current.onEnter) {
            console.log(`[FSM] Calling onEnter for ${this.current.name}`);
            this.current.onEnter();
        }
    }
}
```

---

## Bug #9: State Serialization Fails

### 🐛 Symptoms

```typescript
// Can't save/load game state
// JSON.stringify throws error
// Loaded state doesn't work correctly
```

### 🔍 Diagnosis

```typescript
try {
    const json = JSON.stringify(player);
    console.log('Serialized:', json);
} catch (error) {
    console.error('Serialization failed:', error);
    console.log('Player object:', player);
}
```

### 🔧 Common Causes

#### Cause 1: Circular references

```typescript
// ❌ Bug
class Player {
    state = PlayerState.Idle;
    game: Game; // Circular reference!
    
    constructor(game: Game) {
        this.game = game;
        game.player = this; // Player → Game → Player
    }
}

// JSON.stringify fails!

// ✅ Fixed
class Player {
    state = PlayerState.Idle;
    // Don't store reference to game
    
    serialize() {
        return {
            state: this.state,
            x: this.x,
            y: this.y
            // Only data, no references
        };
    }
}
```

#### Cause 2: Non-serializable types

```typescript
// ❌ Bug
class Player {
    state = PlayerState.Idle;
    animation: Animation; // Can't serialize class instance
    onStateChange: () => void; // Can't serialize function
}

// ✅ Fixed
class Player {
    state = PlayerState.Idle;
    currentAnimation: string; // Serializable
    
    serialize() {
        return {
            state: PlayerState[this.state], // Enum to string
            animation: this.currentAnimation,
            // Omit functions
        };
    }
    
    deserialize(data: any) {
        this.state = PlayerState[data.state as keyof typeof PlayerState];
        this.animation.play(data.animation);
    }
}
```

#### Cause 3: Lost state machine

```typescript
// ❌ Bug
const saved = JSON.stringify(player);
const loaded = JSON.parse(saved);
// Lost all methods!
loaded.update(); // Error: not a function

// ✅ Fixed
serialize(): PlayerData {
    return {
        state: PlayerState[this.state],
        x: this.x,
        y: this.y,
        health: this.health
    };
}

static deserialize(data: PlayerData): Player {
    const player = new Player(); // Creates new instance with methods
    player.state = PlayerState[data.state as keyof typeof PlayerState];
    player.x = data.x;
    player.y = data.y;
    player.health = data.health;
    return player;
}

// Usage
const data = player.serialize();
const saved = JSON.stringify(data);
// ...
const loaded = JSON.parse(saved);
const restoredPlayer = Player.deserialize(loaded);
```

### ✅ Complete Solution

```typescript
interface PlayerData {
    state: string;
    position: {x: number, y: number};
    health: number;
    currentAnimation: string;
}

class Player {
    state = PlayerState.Idle;
    x = 0;
    y = 0;
    health = 100;
    private animation: AnimationController;
    
    serialize(): PlayerData {
        return {
            state: PlayerState[this.state], // Enum to string
            position: {x: this.x, y: this.y},
            health: this.health,
            currentAnimation: this.animation.currentName
        };
    }
    
    deserialize(data: PlayerData) {
        // Enum from string
        this.state = PlayerState[data.state as keyof typeof PlayerState];
        
        // Position
        this.x = data.position.x;
        this.y = data.position.y;
        
        // Health
        this.health = data.health;
        
        // Animation
        this.animation.play(data.currentAnimation);
    }
    
    // Convenience methods
    toJSON(): string {
        return JSON.stringify(this.serialize());
    }
    
    static fromJSON(json: string): Player {
        const data = JSON.parse(json);
        const player = new Player();
        player.deserialize(data);
        return player;
    }
}

// Usage
const saved = player.toJSON();
localStorage.setItem('player', saved);

// Later...
const json = localStorage.getItem('player')!;
const player = Player.fromJSON(json);
```

### 🛡️ Prevention

```typescript
// Use interface for serialized data
interface SerializedState {
    state: string;
    // Only primitives and plain objects
}

// Validate on deserialize
deserialize(data: any) {
    if (typeof data.state !== 'string') {
        throw new Error('Invalid state data');
    }
    
    if (!(data.state in PlayerState)) {
        throw new Error(`Unknown state: ${data.state}`);
    }
    
    this.state = PlayerState[data.state as keyof typeof PlayerState];
}
```

---

## Bug #10: Performance Issues with Many States

### 🐛 Symptoms

```typescript
// FPS drops when many entities
// Slow state transitions
// Stuttering during gameplay
```

### 🔍 Diagnosis

```typescript
// Profile state updates
const start = performance.now();
entity.updateTransitions();
const elapsed = performance.now() - start;
console.log(`Transitions took ${elapsed}ms`);

// Count state checks
let checks = 0;
updateTransitions() {
    checks++;
    // ...
}
console.log(`Transition checks: ${checks}`);
```

### 🔧 Common Causes

#### Cause 1: Expensive condition checks

```typescript
// ❌ Bug
updateTransitions() {
    // Called every frame for every entity!
    for (const enemy of game.enemies) {
        const dist = distance(this, enemy);
        if (dist < 100) { /* ... */ }
    }
}

// ✅ Fixed
updateTransitions() {
    // Use spatial partitioning
    const nearby = game.getNearbyEntities(this, 100);
    if (nearby.length > 0) { /* ... */ }
}
```

#### Cause 2: Redundant state changes

```typescript
// ❌ Bug
update() {
    if (condition) {
        this.state = PlayerState.Idle; // Sets even if already Idle
    }
}

// ✅ Fixed
setState(newState: PlayerState) {
    if (newState === this.state) return; // Early exit
    
    this.state = newState;
}
```

#### Cause 3: Heavy enter/exit logic

```typescript
// ❌ Bug
enterState(state: PlayerState) {
    // Expensive operation every state change!
    this.recalculateAllStats();
    this.reloadAllAnimations();
}

// ✅ Fixed
enterState(state: PlayerState) {
    // Only update what changed
    switch (state) {
        case PlayerState.Running:
            this.speed = this.baseSpeed * 2;
            break;
    }
}
```

### ✅ Complete Solution

```typescript
class Entity {
    state = State.Idle;
    private stateChangeCount = 0;
    
    // Cached distance calculations
    private nearbyCache: Entity[] = [];
    private cacheDirty = true;
    
    setState(newState: State) {
        // Early exit
        if (newState === this.state) return;
        
        this.exitState(this.state);
        this.state = newState;
        this.enterState(this.state);
        
        this.stateChangeCount++;
    }
    
    update(deltaTime: number) {
        // Limit transition checks
        if (this.stateChangeCount < 100) { // Safety net
            this.updateTransitions();
        }
        
        this.updateBehavior(deltaTime);
    }
    
    private updateTransitions() {
        // Use cached data
        if (this.cacheDirty) {
            this.nearbyCache = this.getNearbyEntities();
            this.cacheDirty = false;
        }
        
        // Cheap checks first
        if (this.health <= 0) {
            this.setState(State.Dead);
            return;
        }
        
        // More expensive checks
        if (this.nearbyCache.length > 0) {
            // ...
        }
    }
}

// Object pooling for state objects
class StatePool {
    private pool = new Map<string, State[]>();
    
    get(name: string): State {
        const existing = this.pool.get(name);
        if (existing && existing.length > 0) {
            return existing.pop()!;
        }
        return this.create(name);
    }
    
    release(state: State) {
        if (!this.pool.has(state.name)) {
            this.pool.set(state.name, []);
        }
        this.pool.get(state.name)!.push(state);
    }
}
```

### 🛡️ Prevention

```typescript
// Batch state updates
class Game {
    private entitiesToUpdate: Entity[] = [];
    
    update(deltaTime: number) {
        // Update in batches
        const BATCH_SIZE = 100;
        for (let i = 0; i < this.entitiesToUpdate.length; i += BATCH_SIZE) {
            const batch = this.entitiesToUpdate.slice(i, i + BATCH_SIZE);
            batch.forEach(entity => entity.update(deltaTime));
        }
    }
}

// Use dirty flags
class Entity {
    private stateDirty = false;
    
    update() {
        if (this.stateDirty) {
            this.updateTransitions();
            this.stateDirty = false;
        }
    }
    
    markDirty() {
        this.stateDirty = true;
    }
}
```

---

## Debug Checklist

### State Transitions

- [ ] updateTransitions() is called
- [ ] Using === not =
- [ ] All states have return path
- [ ] Conditions can become true
- [ ] Early returns for priority

### State Changes

- [ ] Single source of truth (enum, not booleans)
- [ ] setState() checks for no-op
- [ ] onEnter/onExit called
- [ ] Animation updated
- [ ] Timer reset

### Guards

- [ ] Guards called before transition
- [ ] Guard logic correct
- [ ] Current state checked in guard
- [ ] No circular dependencies

### Performance

- [ ] History bounded
- [ ] Expensive checks cached
- [ ] Redundant updates avoided
- [ ] Object pooling used

---

**Next:** Common questions in `j-faq.md`! 🎮